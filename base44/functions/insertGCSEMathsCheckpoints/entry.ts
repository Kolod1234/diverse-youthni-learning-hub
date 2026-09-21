import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { topLevelBlockRanges } from '../../shared/lessonBlocks.ts';
import {
  stripTags,
  validateCheckpoint,
  spliceCheckpoints,
  checkpointsJsonSchema,
} from '../../shared/tutorCheckpoints.ts';

// Inserts interactive tutor checkpoint dialogue boxes into lessons of the
// shared CCEA GCSE Mathematics lesson pool (the course the Foundation and
// Higher Tier courses draw their curriculum from). A checkpoint is a small
// multiple-choice question placed right after a block that finishes teaching
// a concept: the student picks an option and the widget immediately praises a
// correct choice, or names and explains the right answer for a wrong one.
// Existing teaching content, worked examples, practice questions and answers
// are never touched: the model only returns new questions, and the
// checkpoint HTML is spliced in at exact block boundaries by this function.

const POOL_COURSE_ID = '694c8bedfa4994a506ea8518';

const RULES = `You are an expert CCEA GCSE Mathematics tutor adding interactive checkpoint questions to a lesson page. The page has already been split into numbered top-level blocks of HTML.

You will see a numbered list of the blocks with a text preview of each. Return between 0 and 2 checkpoints for this page in JSON.

Each checkpoint is JSON:
{"after": <block number the checkpoint should sit directly after>, "question": "...", "options": [{"text": "...", "correct": true or false, "feedback": "..."}]}

Rules:
1. Place a checkpoint only directly AFTER a block that has just finished teaching a concept, definition, rule, notation convention or the reasoning of a worked example. Never place one before its concept has been explained, and never place one at the very end after a recap or summary block. Prefer moments where the student has just met a new term, rule, method or a completed worked example.
2. Write the question in a friendly one-to-one tutor voice, for example: "Quick check: which of these is a prime number?", "Your turn: what is the first step here?", "Which option is the correct ordering?". Never repeat the same question opener twice on the page.
3. Give exactly 4 options, exactly one correct. Distractors must be plausible and drawn from the page's own material or from common misconceptions about it, such as near-miss calculations, swapped operations or misread notation.
4. Options and questions are plain text only: no LaTeX, no dollar signs, no HTML. Write mathematics simply, for example 3/4, 0.75, 2 to the power of 5, square root of 7, 3.2 x 10 to the power of 4.
5. feedback for the correct option: begin with warm praise such as "Good!" or "Exactly right!" then explain in one or two sentences WHY it is correct, using the page's own reasoning.
6. feedback for every wrong option: begin "Not quite." then name the correct option in the feedback and explain the misconception behind the chosen option, in one or two sentences. Each wrong option needs its own specific feedback.
7. British English. No em dashes and no en dashes anywhere. No double quote characters anywhere in question, text or feedback. Question under 160 characters. Each option text under 140 characters. Each feedback under 320 characters.
8. A page that is mostly practice questions, worked answers or a recap with no new concept teaching should return 0 checkpoints.

Return ONLY JSON of the shape {"checkpoints": [...]}.`;

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const payload = await req.json().catch(() => ({}));

    let lesson;
    if (payload.lesson_id) {
      lesson = await base44.asServiceRole.entities.Lesson.get(payload.lesson_id);
    } else {
      const order = Number(payload.lesson_order);
      if (!order) return Response.json({ error: 'lesson_order (or lesson_id) is required' }, { status: 400 });
      const courseId = payload.course_id || POOL_COURSE_ID;
      const lessons = await base44.asServiceRole.entities.Lesson.filter({ course_id: courseId }, 'order', 200);
      lessons.sort((a, b) => a.order - b.order);
      lesson = lessons.find((l) => l.order === order);
    }
    if (!lesson) return Response.json({ error: 'Lesson not found', lesson_order: payload.lesson_order }, { status: 404 });
    if (!lesson.slides || !lesson.slides.length) {
      return Response.json({ error: 'Lesson has no slides', lesson_order: payload.lesson_order }, { status: 400 });
    }

    const fromPage = Math.max(1, Number(payload.from_page) || 1);
    const budgetMs = (Number(payload.time_budget_s) || 150) * 1000;
    const started = Date.now();

    const slides = lesson.slides.slice();
    const report = [];
    let page = fromPage;
    while (page <= slides.length) {
      if (Date.now() - started > budgetMs) break;
      const slide = slides[page - 1];
      const content = slide.content || '';
      if (content.includes('tutor-checkpoint')) {
        report.push({ page, inserted: 0, reason: 'already has checkpoints' });
        page++;
        continue;
      }
      const { ranges } = topLevelBlockRanges(content);
      if (!ranges.length) {
        report.push({ page, inserted: 0, reason: 'no addressable blocks' });
        page++;
        continue;
      }
      const blockList = ranges
        .map((r, i) => {
          const slice = content.slice(r.start, r.end);
          const tag = (slice.match(/^<([a-zA-Z0-9]+)/) || [])[1] || 'block';
          const classes = (slice.match(/class="([^"]*)"/) || [])[1] || '';
          const preview = stripTags(slice).slice(0, 220);
          return `BLOCK ${i + 1} (${tag}${classes ? ', classes: ' + classes : ''}): ${preview}`;
        })
        .join('\n');

      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${RULES}

Lesson: "${lesson.title}", page ${page} of ${slides.length}, page title "${slide.title}".

${blockList}`,
        response_json_schema: checkpointsJsonSchema,
      });

      const cps = res && Array.isArray(res.checkpoints) ? res.checkpoints : [];
      const valid = [];
      const seenAfter = new Set();
      for (const cp of cps.slice(0, 3)) {
        const problem = validateCheckpoint(cp, ranges.length);
        if (problem) { valid.push({ cp, problem }); continue; }
        if (seenAfter.has(cp.after)) continue;
        seenAfter.add(cp.after);
        valid.push({ cp, problem: null });
      }
      const accepted = valid.filter((v) => !v.problem).map((v) => v.cp);
      if (accepted.length) {
        slides[page - 1] = { ...slide, content: spliceCheckpoints(content, ranges, accepted) };
      }
      report.push({
        page,
        inserted: accepted.length,
        rejected: valid.filter((v) => v.problem).map((v) => v.problem),
      });
      page++;
    }

    const processed = page - fromPage;
    if (processed > 0) {
      await base44.asServiceRole.entities.Lesson.update(lesson.id, { slides });
    }
    return Response.json({
      lesson: lesson.title,
      lesson_order: lesson.order,
      pages_processed: processed,
      next_page: page <= slides.length ? page : null,
      elapsed_s: Math.round((Date.now() - started) / 1000),
      total_inserted: report.reduce((s, r) => s + (r.inserted || 0), 0),
      report,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}