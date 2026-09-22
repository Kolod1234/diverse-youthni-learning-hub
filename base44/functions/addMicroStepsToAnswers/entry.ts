import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { invokeWithRetry, mapWithLimit, lostMathTokens } from '../../shared/lessonHtml.ts';
import {
  findBoxes,
  isAnswerBox,
  hasStepList,
  replaceBoxes,
  boxText,
  type SlideBox
} from '../../shared/answerBlocks.ts';

const OL_STYLE = 'margin:12px 0 12px 22px;line-height:1.75;font-size:1.06em;color:#24343d;';
const LI_STYLE = 'margin:6px 0;';

const RULES = `You are a CCEA AS Mathematics examiner rewriting the SOLUTION box of a lesson slide so a learner who has never met the topic can follow every move. The learner must never see a result appear from nowhere.

You are given the question for context and the solution box HTML. Rewrite ONLY the solution box.

REQUIRED FORMAT
- Replace the prose/one-line working with <ol style="${OL_STYLE}"> and <li style="${LI_STYLE}">one small move per step</li>.
- Each step does exactly ONE thing: state the method or formula, substitute the numbers, simplify, rearrange, evaluate.
- Show the algebra or arithmetic inside the step, $...$ inline or $$...$$ for a key line.
- Where two equations must be compared or combined, keep them on adjacent lines so the learner can see which terms line up.
- End with the SAME final answer as the original, and where natural a short check step.
- 4 to 9 steps is typical. No commentary that carries no mathematics.

ACCURACY
- Never change the final answer, and never invent a different method or different numbers.
- If you cannot independently derive the stated answer, still expand the working that is already printed into its separate lines - keep every number exactly as given. Only set changed=false if the box contains no working and no answer to expand.
- Every LaTeX expression already present must still appear somewhere in your output.

PRESERVE
- Keep the outer <div> box wrapper, its style attribute and the uppercase label div exactly as given.
- Keep any mark-scheme line (the italic M1/A1 note) as the last element, unchanged.
- Keep [SVG_n] placeholders exactly, in the same position.
- British English spelling. Use \\times, \\div, \\left( \\right) as in the existing content.
- Return ONLY the rewritten box HTML, complete from its opening <div> to its closing </div>.`;

async function rewriteBox(base44, question: string, box: SlideBox) {
  const svgs: string[] = [];
  const masked = box.html.replace(/<svg[\s\S]*?<\/svg>/g, (m) => {
    svgs.push(m);
    return `[SVG_${svgs.length - 1}]`;
  });

  let res;
  try {
    res = await invokeWithRetry(
      base44,
      `${RULES}\n\nQUESTION (context, do not include in your output):\n${question || '(not stated on this slide)'}\n\nSOLUTION BOX HTML:\n${masked}`,
      'claude_sonnet_4_6'
    );
  } catch (err) {
    return { changed: false, reason: 'llm error: ' + err.message };
  }

  let out = (res && res.html ? res.html : '').trim();
  if (!out) return { changed: false, reason: 'empty response' };
  if (res.changed !== true) return { changed: false, reason: 'model declined' };
  if (!out.startsWith('<div') || !out.endsWith('</div>')) {
    return { changed: false, reason: 'box wrapper lost' };
  }
  if (!hasStepList(out)) return { changed: false, reason: 'no step list added' };

  const lost = lostMathTokens(masked, out);
  if (lost.length > 0) return { changed: false, reason: 'maths lost: ' + lost[0] };

  for (let i = 0; i < svgs.length; i++) {
    if (!out.includes(`[SVG_${i}]`)) return { changed: false, reason: 'svg lost' };
    out = out.replace(`[SVG_${i}]`, svgs[i]);
  }
  if (/\[SVG_\d+\]/.test(out)) return { changed: false, reason: 'stray svg token' };
  if (out.length < box.html.length) return { changed: false, reason: 'output shorter than original' };

  return { changed: true, html: out };
}

async function processSlide(base44, content: string) {
  if (!content) return { content, changed: false };

  const boxes = findBoxes(content);
  // Only answer regions that still present their working as prose or a single
  // line. A box that already carries an <ol> of steps is left alone.
  const targets = boxes.filter((b) => isAnswerBox(b) && !hasStepList(b.html) && /\$/.test(b.html));
  if (targets.length === 0) return { content, changed: false };

  const questionBoxes = boxes.filter((b) => /question|practice|exam/i.test(b.label));
  const question = questionBoxes.map(boxText).join('\n');

  const results = await mapWithLimit(targets, 2, (box) => rewriteBox(base44, question, box));

  const replacements = [];
  const reasons = [];
  results.forEach((r, i) => {
    if (r.changed) replacements.push({ box: targets[i], html: r.html });
    else if (r.reason) reasons.push(r.reason);
  });

  if (replacements.length === 0) {
    return { content, changed: false, reason: reasons[0] || 'no change' };
  }
  return { content: replaceBoxes(content, replacements), changed: true, reason: reasons[0] };
}

export default async function (req: Request): Promise<Response> {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const body = await req.json();
    const courseId = body.course_id;
    const orders = Array.isArray(body.orders) ? body.orders : [];
    if (!courseId || orders.length === 0) {
      return Response.json({ error: 'course_id and orders are required' }, { status: 400 });
    }

    const lessons = await base44.asServiceRole.entities.Lesson.filter({
      course_id: courseId,
      order: { $in: orders }
    });

    const report = [];
    for (const lesson of lessons) {
      const slides = Array.isArray(lesson.slides) ? [...lesson.slides] : [];
      const results = await mapWithLimit(slides, 3, (s) => processSlide(base44, s.content || ''));
      let updated = 0;
      const skipped = [];
      results.forEach((r, i) => {
        if (r.changed) {
          slides[i] = { ...slides[i], content: r.content };
          updated++;
        } else if (r.reason) {
          skipped.push({ slide: i + 1, reason: r.reason });
        }
      });
      if (updated > 0) {
        await base44.asServiceRole.entities.Lesson.update(lesson.id, { slides });
      }
      report.push({ order: lesson.order, title: lesson.title, updated, skipped });
    }

    return Response.json({ processed: report.length, report });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}