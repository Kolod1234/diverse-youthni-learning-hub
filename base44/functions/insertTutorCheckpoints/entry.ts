import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { topLevelBlockRanges } from '../../shared/lessonBlocks.ts';

// Inserts interactive tutor checkpoint dialogue boxes into WJEC AS Sociology
// lessons. A checkpoint is a small multiple-choice question placed right after
// a block that finishes teaching a concept: the student picks an option and the
// widget immediately praises a correct choice, or names and explains the right
// answer for a wrong one. Existing teaching content, images, practice questions
// and answers are never touched: the model only returns new questions, and the
// checkpoint HTML is spliced in at exact block boundaries by this function.

const RULES = `You are an expert WJEC AS Sociology tutor adding interactive checkpoint questions to a lesson page. The page has already been split into numbered top-level blocks of HTML.

You will see a numbered list of the blocks with a text preview of each. Return between 0 and 2 checkpoints for this page in JSON.

Each checkpoint is JSON:
{"after": <block number the checkpoint should sit directly after>, "question": "...", "options": [{"text": "...", "correct": true or false, "feedback": "..."}]}

Rules:
1. Place a checkpoint only directly AFTER a block that has just finished teaching a concept, definition, study, piece of data or reasoning. Never place one before its concept has been explained, and never place one at the very end after a recap or summary block. Prefer moments where the student has just met a new term, distinction, researcher or finding.
2. Write the question in a friendly one-to-one tutor voice, for example: "Which of these do you think is not material culture?", "Quick check: which researcher said this?", "Your turn: pick the option that best describes...". Never repeat the same question opener twice on the page.
3. Give exactly 4 options, exactly one correct. Distractors must be plausible and drawn from the same page's material or from common misconceptions about it.
4. feedback for the correct option: begin with warm praise such as "Good!" or "Exactly right!" then explain in one or two sentences WHY it is correct, using the page's own reasoning.
5. feedback for every wrong option: begin "Not quite." then name the correct option in the feedback and explain why the chosen option is wrong and the correct one is right, in one or two sentences. Each wrong option needs its own specific feedback.
6. British English. No em dashes and no en dashes anywhere. No double quote characters anywhere in question, text or feedback. Question under 160 characters. Each option text under 140 characters. Each feedback under 320 characters.
7. A page that is mostly practice questions, answers or a diagram with no new concept teaching should return 0 checkpoints.

Return ONLY JSON of the shape {"checkpoints": [...]}.`;

function stripTags(html) {
  return String(html)
    .replace(/<img[^>]*>/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// The lesson players decode entities in some paths, so the checkpoint markup
// must avoid quote and ampersand characters entirely instead of entity-encoding them.
function escText(s) {
  return String(s)
    .replace(/[\u2014\u2013]/g, ' to ')
    .replace(/"/g, "'")
    .replace(/&(?!\w+;)/g, 'and')
    .replace(/</g, '(')
    .replace(/>/g, ')')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildCheckpointHTML(cp) {
  const keys = ['A', 'B', 'C', 'D', 'E'];
  const options = cp.options
    .map(
      (o, i) =>
        `<button type="button" class="tutor-checkpoint-option" data-correct="${o.correct ? 1 : 0}" data-feedback="${escText(o.feedback)}"><span class="tutor-checkpoint-key">${keys[i] || String(i + 1)}</span><span>${escText(o.text)}</span></button>`
    )
    .join('');
  return (
    '<div class="tutor-checkpoint">' +
    '<div class="tutor-checkpoint-label">Tutor check-in</div>' +
    '<div class="tutor-checkpoint-bubble">' +
    `<p class="tutor-checkpoint-question">${escText(cp.question)}</p>` +
    `<div class="tutor-checkpoint-options">${options}</div>` +
    '</div>' +
    '<div class="tutor-checkpoint-feedback" hidden></div>' +
    '</div>'
  );
}

function validateCheckpoint(cp, blockCount) {
  if (!cp || typeof cp.after !== 'number' || !Number.isInteger(cp.after) || cp.after < 1 || cp.after > blockCount) {
    return 'the after block number must be between 1 and ' + blockCount;
  }
  if (typeof cp.question !== 'string' || !cp.question.includes('?') || cp.question.length > 180) {
    return 'the question must contain a question mark and stay under 180 characters';
  }
  const opts = Array.isArray(cp.options) ? cp.options : [];
  if (opts.length < 3 || opts.length > 5) return 'there must be between 3 and 5 options';
  if (opts.filter((o) => o && o.correct === true).length !== 1) return 'exactly one option must be correct';
  for (const o of opts) {
    if (typeof o.text !== 'string' || !o.text.trim() || o.text.length > 160) return 'every option needs text under 160 characters';
    if (typeof o.feedback !== 'string' || o.feedback.trim().length < 20 || o.feedback.length > 360) return 'every option needs feedback between 20 and 360 characters';
    if (/[\u2014\u2013"]/.test(o.text) || /[\u2014\u2013"]/.test(o.feedback) || /[\u2014\u2013"]/.test(cp.question)) return 'no dashes or double quotes are allowed';
  }
  return null;
}

export default async function (req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }
    const payload = await req.json().catch(() => ({}));
    const order = Number(payload.order);
    if (!order) return Response.json({ error: 'order (lesson order) is required' }, { status: 400 });
    const fromPage = Math.max(1, Number(payload.from_page) || 1);
    const budgetMs = (Number(payload.time_budget_s) || 150) * 1000;
    const started = Date.now();

    const courses = await base44.asServiceRole.entities.Course.filter({ title: 'WJEC AS Sociology' });
    if (!courses.length) return Response.json({ error: 'Course not found' }, { status: 404 });
    const lessons = await base44.asServiceRole.entities.Lesson.filter({ course_id: courses[0].id });
    lessons.sort((a, b) => a.order - b.order);
    const lesson = lessons.find((l) => l.order === order);
    if (!lesson) return Response.json({ error: 'Lesson not found', order }, { status: 404 });
    if (!lesson.slides || !lesson.slides.length) {
      return Response.json({ error: 'Lesson has no slides', order }, { status: 400 });
    }

    const slides = lesson.slides.slice();
    const schema = {
      type: 'object',
      properties: {
        checkpoints: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              after: { type: 'integer' },
              question: { type: 'string' },
              options: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    text: { type: 'string' },
                    correct: { type: 'boolean' },
                    feedback: { type: 'string' },
                  },
                  required: ['text', 'correct', 'feedback'],
                },
              },
            },
            required: ['after', 'question', 'options'],
          },
        },
      },
      required: ['checkpoints'],
    };

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
        response_json_schema: schema,
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
      let next = content;
      // splice from the end backwards so earlier offsets stay valid
      const sorted = accepted.slice().sort((a, b) => b.after - a.after);
      for (const cp of sorted) {
        const pos = ranges[cp.after - 1].end;
        const html = buildCheckpointHTML(cp);
        next = next.slice(0, pos) + '\n' + html + '\n' + next.slice(pos);
      }
      if (accepted.length) {
        slides[page - 1] = { ...slide, content: next };
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
      order,
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