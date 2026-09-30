import { createClientFromRequest } from 'npm:@base44/sdk@0.8.52';
import { topLevelBlockRanges } from '../../shared/lessonBlocks.ts';
import { validateCheckpoint, spliceCheckpoints, stripTags, checkpointsJsonSchema } from '../../shared/tutorCheckpoints.ts';

// Brings a Life and Health Sciences lesson up to the standard number of tutor
// checkpoints (default 2 per page) by generating new checkpoint questions with
// the LLM and splicing them in at exact top-level block boundaries. Existing
// teaching content, images, practice questions and answers are never touched.
// The lesson is processed page by page within a time budget; the response
// reports next_page so the caller can continue where it left off. When a
// mirror_lesson_id is supplied (Single Award copy of the same chapter), the
// updated slides are copied onto it so both awards stay identical.

const RULES = `You are an expert CCEA Life and Health Sciences tutor adding interactive checkpoint questions to a lesson page. The page has already been split into numbered top-level blocks of HTML.

Return exactly the requested number of NEW checkpoints for this page in JSON.
Each checkpoint is JSON:
{"after": <block number the checkpoint should sit directly after>, "question": "...", "options": [{"text": "...", "correct": true or false, "feedback": "..."}]}

Rules:
1. Place a checkpoint only directly AFTER a block that has just finished teaching a concept, definition, structure, process, calculation or reasoning. Never place one before its concept has been explained, never directly after an existing checkpoint block, and never at the very end after a recap or summary block. Prefer moments where the student has just met a new term, structure, process or data point.
2. Write the question in a friendly one-to-one tutor voice, for example: "Quick check: which chamber pumps blood to the lungs?" or "Your turn: pick the option that best describes...". Never repeat the same question opener twice on the page, and do not repeat anything the page's existing checkpoints already ask.
3. Give exactly 4 options, exactly one correct. Distractors must be plausible and drawn from the same page's material or from common misconceptions about it.
4. Feedback for the correct option: begin with warm praise such as "Good!" or "Exactly right!" then explain in one or two sentences WHY it is correct, using the page's own reasoning.
5. Feedback for every wrong option: begin "Not quite." then name the correct option and explain why the chosen option is wrong and the correct one is right, in one or two sentences. Each wrong option needs its own specific feedback.
6. The science must be accurate and consistent with the page. Keep terminology CCEA-appropriate and use British English spellings (fibre, colour, oesophagus). Include units wherever the page uses them.
7. You may wrap short simple mathematical expressions in single dollar signs for maths rendering, for example $120/80$ mmHg. Keep any maths simple. No double quote characters anywhere in question, text or feedback. No em dashes and no en dashes anywhere. Question under 160 characters. Each option text under 140 characters. Each feedback under 320 characters.
8. A page that is mostly practice questions, answers or a diagram with no new concept teaching should return an empty checkpoints list.
9. Relevance: every question must be answerable only from what this page teaches, and must target the specific block it follows. Name that block's actual structure, process, term or data in the question or in the options. A question a student could answer correctly without reading this page, or one about a topic the page never teaches, is off topic and must not be used.
10. Difficulty: set questions at the level of the qualification. Test application, interpretation or discrimination between similar structures and processes, never simple recall of a fact the page has just stated. The correct option must not copy a phrase word for word from the page; make the student apply what they read: predict the outcome of a change, pick the statement that contradicts the teaching, choose which scenario fits the process, or link two ideas from different blocks.
11. Distractors must be genuinely tempting: near misses, common misconceptions and plausible confusions drawn from this page and this topic, including similar sounding terms and structures. Never use obviously silly options or options about unrelated topics.

Return ONLY JSON of the shape {"checkpoints": [...]}.`;

function countCheckpoints(content) {
  return (String(content).match(/class="tutor-checkpoint[" ]/g) || []).length;
}

function existingQuestions(content) {
  const matches = String(content).match(/<p class="tutor-checkpoint-question">[\s\S]*?<\/p>/g) || [];
  return matches.map(stripTags);
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const payload = await req.json().catch(() => ({}));
    const lessonId = String(payload.lesson_id || '');
    if (!lessonId) return Response.json({ error: 'lesson_id is required' }, { status: 400 });
    const mirrorId = payload.mirror_lesson_id ? String(payload.mirror_lesson_id) : null;
    const fromPage = Math.max(1, Number(payload.from_page) || 1);
    const targetPerPage = Number.isFinite(Number(payload.target_per_page))
      ? Math.max(0, Number(payload.target_per_page))
      : 2;
    const budgetMs = (Number(payload.time_budget_s) || 100) * 1000;
    const started = Date.now();

    const lesson = await base44.asServiceRole.entities.Lesson.get(lessonId);
    if (!lesson) return Response.json({ error: 'Lesson not found', lesson_id: lessonId }, { status: 404 });
    if (!lesson.slides || !lesson.slides.length) {
      return Response.json({ error: 'Lesson has no slides', lesson_id: lessonId }, { status: 400 });
    }

    const slides = lesson.slides.slice();
    const report = [];
    let page = fromPage;
    let totalInserted = 0;

    while (page <= slides.length) {
      if (Date.now() - started > budgetMs) break;
      const slide = slides[page - 1];
      const content = slide.content || '';
      const existing = countCheckpoints(content);
      const needed = targetPerPage - existing;
      if (needed <= 0) {
        report.push({ page, inserted: 0, reason: 'already at target' });
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
          const isCheckpoint = slice.includes('tutor-checkpoint');
          const preview = stripTags(slice).slice(0, 900);
          return `BLOCK ${i + 1} (${tag}${classes ? ', classes: ' + classes : ''}${
            isCheckpoint ? ', EXISTING CHECKPOINT: do not place after this block' : ''
          }): ${preview}`;
        })
        .join('\n');

      const alreadyAsked = existingQuestions(content);
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `${RULES}

Lesson: "${lesson.title}", page ${page} of ${slides.length}, page title "${slide.title}".

This page already has ${existing} checkpoint(s). Return exactly ${needed} NEW checkpoint(s).
${
  alreadyAsked.length
    ? 'Existing checkpoint questions on this page (do not repeat their content):\n- ' + alreadyAsked.join('\n- ') + '\n'
    : ''
}
${blockList}`,
        response_json_schema: checkpointsJsonSchema,
      });

      const cps = res && Array.isArray(res.checkpoints) ? res.checkpoints : [];
      const accepted = [];
      const seenAfter = new Set();
      const problems = [];
      for (const cp of cps) {
        const problem = validateCheckpoint(cp, ranges.length);
        if (problem) {
          problems.push(problem);
          continue;
        }
        const anchor = content.slice(ranges[cp.after - 1].start, ranges[cp.after - 1].end);
        if (anchor.includes('tutor-checkpoint')) {
          problems.push('cannot place directly after an existing checkpoint block');
          continue;
        }
        if (seenAfter.has(cp.after)) {
          problems.push('duplicate after block number');
          continue;
        }
        seenAfter.add(cp.after);
        accepted.push(cp);
      }
      const use = accepted.slice(0, needed);
      if (use.length) {
        slides[page - 1] = { ...slide, content: spliceCheckpoints(content, ranges, use) };
      }
      totalInserted += use.length;
      report.push({ page, inserted: use.length, rejected: problems });
      page++;
    }

    const processed = page - fromPage;
    const checkpointsTotal = slides.reduce((sum, sl) => sum + countCheckpoints(sl.content || ''), 0);
    if (processed > 0) {
      await base44.asServiceRole.entities.Lesson.update(lesson.id, { slides });
      if (mirrorId) {
        const mirror = await base44.asServiceRole.entities.Lesson.get(mirrorId);
        if (mirror) {
          await base44.asServiceRole.entities.Lesson.update(mirror.id, { slides });
        }
      }
    }
    return Response.json({
      lesson: lesson.title,
      lesson_id: lesson.id,
      mirror_id: mirrorId,
      pages_processed: processed,
      next_page: page <= slides.length ? page : null,
      inserted: totalInserted,
      checkpoints_total: checkpointsTotal,
      elapsed_s: Math.round((Date.now() - started) / 1000),
      report,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}