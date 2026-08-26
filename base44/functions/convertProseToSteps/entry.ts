import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { mathTokensKey, invokeWithRetry, mapWithLimit } from '../../shared/lessonHtml.ts';

const OL_STYLE = 'margin:12px 0 12px 22px;line-height:1.75;font-size:1.06em;color:#24343d;';
const LI_STYLE = 'margin:6px 0;';

const RULES = `You restructure CCEA AS Mathematics lesson HTML so dense explanatory prose becomes easy-to-follow steps.

CONVERT: any <p> containing multi-step reasoning, a derivation, a chain of "since/so/therefore/and combining", or 2+ sentences of sequential explanation -> an ordered list <ol style="${OL_STYLE}"> with <li style="${LI_STYLE}">one step each</li>.
Use <ul style="${OL_STYLE}"> instead when the items are parallel facts rather than sequential steps.

DO NOT TOUCH:
- [SVG_n] placeholders (keep them exactly, in the same position)
- display maths paragraphs ($$...$$)
- existing <ul>/<ol>/<table>
- short single-sentence paragraphs, and one-line Key idea / Note / Question box text
- the wording of any mathematics

ABSOLUTE RULES:
- Every LaTeX expression must appear character-for-character unchanged. Never re-typeset maths.
- Never add new mathematical claims and never delete content. You may split sentences and add minimal connective words only.
- Keep all style attributes exactly as given for reused elements.
- British English spelling.
- Return the FULL slide HTML. If a slide needs no change, return it byte-identical.`;

async function convertSlide(base44, content) {
  const svgs = [];
  const masked = content.replace(/<svg[\s\S]*?<\/svg>/g, (m) => {
    svgs.push(m);
    return `[SVG_${svgs.length - 1}]`;
  });

  let res;
  try {
    res = await invokeWithRetry(base44, `${RULES}\n\nSLIDE HTML:\n${masked}`);
  } catch (err) {
    return { content, changed: false, reason: 'llm error: ' + err.message };
  }

  let out = res && res.html ? res.html : '';
  if (!out) return { content, changed: false, reason: 'empty response' };
  if (mathTokensKey(masked) !== mathTokensKey(out)) return { content, changed: false, reason: 'maths mismatch' };

  for (let i = 0; i < svgs.length; i++) {
    if (!out.includes(`[SVG_${i}]`)) return { content, changed: false, reason: 'svg lost' };
    out = out.replace(`[SVG_${i}]`, svgs[i]);
  }
  if (/\[SVG_\d+\]/.test(out)) return { content, changed: false, reason: 'stray svg token' };

  return { content: out, changed: res.changed === true && out !== content };
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
      const results = await mapWithLimit(slides, 3, (s) => convertSlide(base44, s.content || ''));
      let converted = 0;
      const skipped = [];
      results.forEach((r, i) => {
        if (r.changed) {
          slides[i] = { ...slides[i], content: r.content };
          converted++;
        } else if (r.reason) {
          skipped.push({ slide: i + 1, reason: r.reason });
        }
      });
      if (converted > 0) {
        await base44.asServiceRole.entities.Lesson.update(lesson.id, { slides });
      }
      report.push({ order: lesson.order, title: lesson.title, converted, skipped });
    }

    return Response.json({ processed: report.length, report });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}