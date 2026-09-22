import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { mathTokensKey, invokeWithRetry, mapWithLimit, decodeEntities } from '../../shared/lessonHtml.ts';

const OL_STYLE = 'margin:12px 0 12px 22px;line-height:1.75;font-size:1.06em;color:#24343d;';
const LI_STYLE = 'margin:6px 0;';

const RULES = `You restructure CCEA mathematics lesson HTML so dense explanatory prose becomes easy-to-follow steps.

CONVERT: any <p> containing multi-step reasoning, a derivation, a chain of "since/so/therefore/and combining", or 2+ sentences of sequential explanation -> an ordered list <ol style="${OL_STYLE}"> with <li style="${LI_STYLE}">one step each</li>.
Use <ul style="${OL_STYLE}"> instead when the items are parallel facts rather than sequential steps.

DO NOT TOUCH:
- [SVG_n] and [MEDIA_n] placeholders (keep them exactly, in the same position)
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

// Extracts every balanced <div class="..."> block matched by `re` into
// `store` as [MEDIA_n] tokens, so the model cannot reword its contents.
function extractClassDivs(src: string, re: RegExp, store: string[]): string {
  let out = '';
  let pos = 0;
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src)) !== null) {
    const after = m.index + m[0].length;
    const tagRe = /<(\/?)div\b[^>]*?(\/?)>/gi;
    tagRe.lastIndex = after;
    let depth = 1;
    let endIdx = -1;
    let t: RegExpExecArray | null;
    while ((t = tagRe.exec(src)) !== null) {
      if (t[1]) depth -= 1;
      else if (!t[2]) depth += 1;
      if (depth === 0) { endIdx = t.index + t[0].length; break; }
    }
    if (endIdx === -1) continue;
    store.push(src.slice(m.index, endIdx));
    out += src.slice(pos, m.index) + `[MEDIA_${store.length - 1}]`;
    pos = endIdx;
    re.lastIndex = endIdx;
  }
  return out + src.slice(pos);
}

// Rewrites each maths span into the stored canonical form: decode HTML
// entities, then re-escape raw < and > so the browser never parses them as
// markup at render time (matches the escapeMathOperators convention).
// Spans that contain HTML tags are skipped: they are not real maths (an
// unpaired currency "$" pairing across markup) and escaping their tags
// would corrupt the HTML.
function canonicaliseMathSpans(html: string): string {
  return html.replace(/\$\$?[^$]+\$\$?/g, (span) => {
    const decoded = decodeEntities(span);
    if (/<\/?[a-zA-Z!]/.test(decoded)) return span;
    return decoded.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  });
}

// Detects slides that still contain dense explanatory prose worth
// restructuring, so retry sweeps skip slides already converted into step
// lists (cheap filter, no LLM call).
function looksDense(content: string): boolean {
  const store: string[] = [];
  let prose = (content || '').replace(/<svg[\s\S]*?<\/svg>/g, '');
  prose = extractClassDivs(prose, /<div[^>]*\bclass="[^"]*\btutor-checkpoint\b[^"]*"[^>]*>/gi, store);
  prose = extractClassDivs(prose, /<div[^>]*\bclass="[^"]*\bpractice-block\b[^"]*"[^>]*>/gi, store);
  prose = prose
    .replace(/<details[\s\S]*?<\/details>/gi, '')
    .replace(/<figure[\s\S]*?<\/figure>/gi, '')
    .replace(/<img[^>]*>/gi, '');
  const paras = prose.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi) || [];
  return paras.some((p) => {
    const text = p.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const sentences = (text.match(/[.!?](?:\s|$)/g) || []).length;
    return text.length >= 240 || sentences >= 3;
  });
}

async function convertSlide(base44, content) {
  const svgs = [];
  const media = [];
  // Images, interactive checkpoints, practice questions and hidden answers are
  // masked so the model cannot reword or drop them; each token is restored
  // byte-for-byte and its presence is validated afterwards.
  let masked = content.replace(/<svg[\s\S]*?<\/svg>/g, (m) => {
    svgs.push(m);
    return `[SVG_${svgs.length - 1}]`;
  });
  masked = extractClassDivs(masked, /<div[^>]*\bclass="[^"]*\btutor-checkpoint\b[^"]*"[^>]*>/gi, media);
  masked = extractClassDivs(masked, /<div[^>]*\bclass="[^"]*\bpractice-block\b[^"]*"[^>]*>/gi, media);
  masked = masked
    .replace(/<details[\s\S]*?<\/details>/gi, (m) => {
      media.push(m);
      return `[MEDIA_${media.length - 1}]`;
    })
    .replace(/<figure[\s\S]*?<\/figure>/gi, (m) => {
      media.push(m);
      return `[MEDIA_${media.length - 1}]`;
    })
    .replace(/<img[^>]*>/gi, (m) => {
      media.push(m);
      return `[MEDIA_${media.length - 1}]`;
    });

  let out = '';
  let changedFlag = false;
  for (let attempt = 0; attempt < 2; attempt++) {
    let res;
    const reminder = attempt === 0
      ? ''
      : '\n\nREMINDER: your previous attempt altered the mathematics. Every LaTeX expression must be copied character-for-character, including $ signs. Convert only the prose structure and return the slide again.';
    try {
      res = await invokeWithRetry(base44, `${RULES}${reminder}\n\nSLIDE HTML:\n${masked}`);
    } catch (err) {
      return { content, changed: false, reason: 'llm error: ' + err.message };
    }
    const candidate = res && res.html ? res.html : '';
    if (!candidate) return { content, changed: false, reason: 'empty response' };
    if (mathTokensKey(masked) !== mathTokensKey(candidate)) continue;
    out = candidate;
    changedFlag = res.changed === true && candidate !== content;
    break;
  }
  if (!out) return { content, changed: false, reason: 'maths mismatch' };
  out = canonicaliseMathSpans(out);

  for (let i = 0; i < svgs.length; i++) {
    if (!out.includes(`[SVG_${i}]`)) return { content, changed: false, reason: 'svg lost' };
    out = out.replace(`[SVG_${i}]`, () => svgs[i]);
  }
  if (/\[SVG_\d+\]/.test(out)) return { content, changed: false, reason: 'stray svg token' };

  for (let i = 0; i < media.length; i++) {
    if (!out.includes(`[MEDIA_${i}]`)) return { content, changed: false, reason: 'media lost' };
    out = out.replace(`[MEDIA_${i}]`, () => media[i]);
  }
  if (/\[MEDIA_\d+\]/.test(out)) return { content, changed: false, reason: 'stray media token' };

  return { content: out, changed: changedFlag };
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
    // Optional 1-based slide numbers: retry only those slides.
    const slideNums = Array.isArray(body.slides)
      ? body.slides.map(Number).filter((n) => Number.isInteger(n) && n > 0)
      : null;
    // Retry-sweep mode: only attempt slides that still contain dense prose.
    const onlyDense = body.only_dense === true;
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
      let targets = slides.map((s, i) => ({ slide: s, index: i }));
      if (slideNums) targets = targets.filter((t) => slideNums.includes(t.index + 1));
      let denseFiltered = 0;
      if (onlyDense) {
        const before = targets.length;
        targets = targets.filter((t) => looksDense((t.slide && t.slide.content) || ''));
        denseFiltered = before - targets.length;
      }
      const results = await mapWithLimit(targets, 3, (t) => convertSlide(base44, (t.slide && t.slide.content) || ''));
      let converted = 0;
      const skipped = [];
      results.forEach((r, k) => {
        const i = targets[k].index;
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
      report.push({ order: lesson.order, title: lesson.title, converted, skipped, ...(onlyDense ? { dense_filtered: denseFiltered } : {}) });
    }

    return Response.json({ processed: report.length, report });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}