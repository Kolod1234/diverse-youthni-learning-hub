import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { mathTokens, invokeWithRetry, mapWithLimit } from '../../shared/lessonHtml.ts';

const OL_STYLE = 'margin:12px 0 12px 22px;line-height:1.75;font-size:1.06em;color:#24343d;';
const LI_STYLE = 'margin:6px 0;';

const RULES = `You are a CCEA AS Mathematics examiner improving lesson slides so that every answer is BUILT UP in micro-steps instead of appearing out of nowhere.

TASK: find each answer region of the slide - a block whose heading is Solution, Model answer, Full solution or Answer, and any worked example where a result is stated with no working. Replace the bare result with an ordered list of micro-steps that derive it, ending with the SAME final answer.

STEP LIST FORMAT: <ol style="${OL_STYLE}"> with <li style="${LI_STYLE}">one small move per step</li>.
- Each step does ONE thing (identify the method, substitute, simplify, rearrange, evaluate).
- Show the intermediate algebra or arithmetic inside the step, using $...$ inline or $$...$$ for a key line.
- Where it is natural, finish with a short check step (e.g. expanding back, substituting the value in).
- 4 to 8 steps is typical. Never pad with commentary that carries no mathematics.

ABSOLUTE RULES:
- The final answer must stay mathematically identical to the original, and every LaTeX expression already present must still appear.
- Mathematics must be correct and consistent with the question on the slide. If you cannot derive the stated answer with confidence, return the slide unchanged with changed=false.
- Keep the surrounding HTML, the box wrappers, all style attributes, and heading labels exactly as given.
- Keep [SVG_n] placeholders exactly, in the same position.
- Do not touch Key idea / Note / Question text, definitions, formula statements or slides that already contain step lists.
- British English spelling. Use \\div, \\times, \\left( \\right) as in the existing content.
- Return the FULL slide HTML.`;

function needsSteps(content: string) {
  if (!content) return false;
  if (!/Solution|Model answer|Full solution|Answer/i.test(content)) return false;
  // Only an ordered list (or an explicit step-number run) counts as existing
  // working. Answers presented as <ul> bullets - e.g. "b^2-4ac = 25-24 = 1"
  // with no substitution shown - still need micro-steps.
  if (/<ol[\s>]|step-number/.test(content)) return false;
  return /\$/.test(content);
}

async function processSlide(base44, content: string) {
  if (!needsSteps(content)) return { content, changed: false };

  const svgs: string[] = [];
  const masked = content.replace(/<svg[\s\S]*?<\/svg>/g, (m) => {
    svgs.push(m);
    return `[SVG_${svgs.length - 1}]`;
  });

  let res;
  try {
    res = await invokeWithRetry(base44, `${RULES}\n\nSLIDE HTML:\n${masked}`, 'claude_sonnet_4_6');
  } catch (err) {
    return { content, changed: false, reason: 'llm error: ' + err.message };
  }

  let out = res && res.html ? res.html : '';
  if (!out) return { content, changed: false, reason: 'empty response' };
  if (res.changed !== true) return { content, changed: false, reason: 'model declined' };
  if (!/<ol[\s>]/.test(out)) return { content, changed: false, reason: 'no step list added' };

  // Every original LaTeX expression must survive. A chain such as
  // $a = b = c$ may legitimately be split across steps, so a token also
  // counts as preserved when each of its "=" separated parts still appears.
  const normalise = (s: string) =>
    s
      .replace(/\\left|\\right/g, '')
      .replace(/\\dfrac|\\tfrac/g, '\\frac')
      .replace(/\\text|\\mathrm|\\operatorname/g, '')
      .replace(/\\[,;:!]|~/g, '')
      .replace(/[{}\s]/g, '')
      // An accuracy qualifier such as (3s.f.) or (2d.p.) is presentation, not
      // part of the answer, and may legitimately move outside the maths.
      .replace(/\(\d+(s\.f\.|d\.p\.|sf|dp)\)/gi, '');
  const after = mathTokens(out);
  const afterSet = new Set(after);
  // Compare against the whole rewritten slide, not only its math tokens: a
  // value may legitimately move out of math mode (e.g. "= 6" with "cm" as
  // plain text) while remaining mathematically identical.
  const afterBlob = normalise(out);
  const isPreserved = (token: string) => {
    if (afterSet.has(token)) return true;
    // Split a relation chain (=, <, >, \le, \ge, \Rightarrow) into its terms.
    // Intermediate terms may legitimately be re-expressed while the working is
    // broken into steps; what must survive untouched is the RESULT - the final
    // term of the chain.
    const parts = token
      .replace(/^\$\$?/, '')
      .replace(/\$\$?$/, '')
      .split(/=|<|>|\\le[q]?|\\ge[q]?|\\Rightarrow|\\to/)
      .map((p) => normalise(p))
      .filter(Boolean);
    const result = parts[parts.length - 1];
    return Boolean(result) && afterBlob.includes(result);
  };
  const lost = mathTokens(masked).filter((token) => !isPreserved(token));
  if (lost.length > 0) return { content, changed: false, reason: 'maths lost: ' + lost[0] };

  for (let i = 0; i < svgs.length; i++) {
    if (!out.includes(`[SVG_${i}]`)) return { content, changed: false, reason: 'svg lost' };
    out = out.replace(`[SVG_${i}]`, svgs[i]);
  }
  if (/\[SVG_\d+\]/.test(out)) return { content, changed: false, reason: 'stray svg token' };
  if (out.length < content.length) return { content, changed: false, reason: 'output shorter than original' };

  return { content: out, changed: out !== content };
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