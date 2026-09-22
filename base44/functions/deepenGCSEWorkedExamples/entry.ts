// Rewrites GCSE Mathematics worked-example blocks (the shared CCEA pool) so
// every example is broken down into fully explained micro-steps: one move per
// step, the method stated before it is used, and the reasoning in plain
// language. Deepened blocks are stamped with data-microsteps="1" so reruns
// skip them.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { invokeTextWithRetry, mapWithLimit, canonicaliseMathSpans, lostMathTokens } from '../../shared/lessonHtml.ts';

const OL_STYLE = 'margin:12px 0 12px 22px;line-height:1.75;font-size:1.06em;color:#24343d;';
const LI_STYLE = 'margin:6px 0;';

const RULES = `You are a CCEA GCSE Mathematics tutor rewriting a WORKED EXAMPLE so a learner meeting the topic for the very first time can follow every single move. Nothing may appear from nowhere, and no step may combine two operations.

You are given one worked-example block of lesson HTML. Rewrite ONLY this block.

REQUIRED FORMAT
- Keep the opening <div class="worked-example"> wrapper, the example heading if there is one, and the question <p> EXACTLY as given.
- Replace the working with <ol style="${OL_STYLE}"> and <li style="${LI_STYLE}"> steps.
- Each step does exactly ONE thing. Where it applies, follow this order: state the method or formula in words first, then substitute the numbers into it, then carry out one line of arithmetic, then interpret what the result means.
- Never combine substitution and evaluation in the same step. Split any step that chains several operations (for example $F-A=42-48=-6$) into its separate moves on separate steps.
- Around the maths, write the reasoning in short, plain, everyday British English: say WHY the method applies, not just WHAT to compute. Use words a beginner understands (for example "the size of the number", not "the magnitude"; "the bottom number", not "the denominator", unless the term has just been defined on this slide).
- End with the SAME final answer as the original, then add a short check step where natural.
- 5 to 12 steps is typical. No commentary that carries no mathematics.

ACCURACY
- Never change the final answer, the method or the numbers.
- If you cannot derive the answer independently, still expand the working that is already printed into its separate steps - keep every number exactly as given.
- Every maths expression from the original, or the separate parts it legitimately splits into, must appear somewhere in your output.

PRESERVE
- Keep [SVG_n] placeholders exactly, in the same position.
- Keep any italic mark-scheme note (M1/A1) as the last element, unchanged.
- British English spelling. Use \\times, \\div, \\frac, \\left( \\right) as in the existing content.
- Return ONLY the rewritten block HTML, from <div class="worked-example"> to its closing </div>. No commentary and no markdown code fences.`;

interface WorkedBlock {
  start: number;
  end: number;
  html: string;
}

// Locates each balanced <div class="worked-example..."> block: the opener is
// matched with a small regex, then div depth is walked to its closing tag.
function findWorkedBlocks(html: string): WorkedBlock[] {
  const blocks: WorkedBlock[] = [];
  if (!html) return blocks;
  const opener = /<div class="worked-example[^"]*">/g;
  let m: RegExpExecArray | null;
  while ((m = opener.exec(html)) !== null) {
    const tagRe = /<div\b|<\/div\s*>/gi;
    tagRe.lastIndex = m.index + m[0].length;
    let depth = 1;
    let end = -1;
    let t: RegExpExecArray | null;
    while ((t = tagRe.exec(html)) !== null) {
      depth += t[0].startsWith('</') ? -1 : 1;
      if (depth === 0) {
        end = t.index + t[0].length;
        break;
      }
    }
    if (end === -1) continue; // unbalanced markup - leave untouched
    blocks.push({ start: m.index, end, html: html.slice(m.index, end) });
    opener.lastIndex = end;
  }
  return blocks;
}

async function rewriteBlock(base44, block: WorkedBlock) {
  if (block.html.includes('data-microsteps')) return { changed: false, silent: true };
  if (/tutor-checkpoint|practice-block/.test(block.html)) {
    return { changed: false, reason: 'contains protected interactive content' };
  }

  const media: string[] = [];
  const masked = block.html
    .replace(/<svg[\s\S]*?<\/svg>/g, (m) => {
      media.push(m);
      return `[SVG_${media.length - 1}]`;
    })
    .replace(/<img[^>]*>/gi, (m) => {
      media.push(m);
      return `[SVG_${media.length - 1}]`;
    });

  let out = '';
  let lastReject = 'no valid response';
  for (let attempt = 0; attempt < 2; attempt++) {
    const reminder = attempt === 0
      ? ''
      : `\n\nREMINDER: your previous attempt was rejected (${lastReject}). Keep every number and LaTeX command exactly as given, including $ signs and backslash commands such as \\frac and \\times. You may split a chain of working across steps, but no value may change. Start your output with <div class="worked-example and end it with </div>. Return the block again.`;
    let res;
    try {
      res = await invokeTextWithRetry(base44, `${RULES}${reminder}\n\nWORKED EXAMPLE HTML:\n${masked}`, 'claude_sonnet_4_6');
    } catch (err) {
      return { changed: false, reason: 'llm error: ' + err.message };
    }
    let candidate = (res || '').trim();
    const fence = candidate.match(/^```[a-zA-Z]*\s*\n([\s\S]*?)\n?```$/);
    if (fence) candidate = fence[1].trim();
    if (!candidate.startsWith('<div class="worked-example')) { lastReject = 'output not a worked-example block'; continue; }
    if (!candidate.endsWith('</div>')) { lastReject = 'output truncated'; continue; }
    if (/<h3[\s>]/i.test(masked) && !/<h3[\s>]/i.test(candidate)) { lastReject = 'heading missing'; continue; }
    if (!/<ol[\s>]/i.test(candidate)) { lastReject = 'step list missing'; continue; }
    const lost = lostMathTokens(masked, candidate);
    if (lost.length > 0) { lastReject = 'maths lost: ' + lost[0]; continue; }
    out = candidate;
    break;
  }
  if (!out) return { changed: false, reason: 'rewrite rejected - ' + lastReject };

  out = canonicaliseMathSpans(out);

  for (let i = 0; i < media.length; i++) {
    if (!out.includes(`[SVG_${i}]`)) return { changed: false, reason: 'media lost' };
    out = out.replace(`[SVG_${i}]`, () => media[i]);
  }
  if (/\[SVG_\d+\]/.test(out)) return { changed: false, reason: 'stray media token' };

  if (out.length < block.html.length) return { changed: false, reason: 'output shorter than original (' + out.length + ' < ' + block.html.length + ')' };

  // Stamp the block so future sweeps leave it alone.
  out = out.replace(/^(<div class="worked-example[^"]*")/, '$1 data-microsteps="1"');
  return { changed: true, html: out };
}

async function processSlide(base44, content: string) {
  const blocks = findWorkedBlocks(content || '');
  if (blocks.length === 0) return { content, changed: false };
  // Only blocks that still need deepening count as work; already-stamped
  // blocks are silent skips, so clean slides cost nothing on a rerun.
  const pending = blocks.filter((b) => !b.html.includes('data-microsteps'));
  if (pending.length === 0) return { content, changed: false };

  const results = await mapWithLimit(blocks, 2, (b) => rewriteBlock(base44, b));

  let out = content;
  const skipped = [];
  const done = [];
  results.forEach((r, i) => {
    if (r.changed) done.push({ block: blocks[i], html: r.html });
    else if (r.reason) skipped.push(r.reason);
  });
  if (done.length === 0) return { content, changed: false, reason: skipped[0] || 'no change' };

  [...done]
    .sort((a, b) => b.block.start - a.block.start)
    .forEach(({ block, html }) => {
      out = out.slice(0, block.start) + html + out.slice(block.end);
    });
  return { content: out, changed: true, deepened: done.length, skipped };
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
    lessons.sort((a, b) => (a.order || 0) - (b.order || 0));

    // Dry run: report how many worked examples still need deepening.
    if (body.scan_only) {
      let pending = 0;
      const scan = [];
      for (const lesson of lessons) {
        const count = (lesson.slides || []).reduce(
          (sum, s) => sum + findWorkedBlocks(s.content || '').filter((b) => !b.html.includes('data-microsteps')).length,
          0
        );
        pending += count;
        if (count > 0) scan.push({ order: lesson.order, title: lesson.title, pending: count });
      }
      return Response.json({ lessons: lessons.length, pending, scan });
    }

    const report = [];
    for (const lesson of lessons) {
      const slides = Array.isArray(lesson.slides) ? [...lesson.slides] : [];
      const results = await mapWithLimit(slides, 3, (s) => processSlide(base44, (s && s.content) || ''));
      let deepened = 0;
      let updated = 0;
      const skipped = [];
      results.forEach((r, i) => {
        if (r.changed) {
          slides[i] = { ...slides[i], content: r.content };
          updated++;
          deepened += r.deepened || 0;
        } else if (r.reason) {
          skipped.push({ slide: i + 1, reason: r.reason });
        }
      });
      if (updated > 0) {
        await base44.asServiceRole.entities.Lesson.update(lesson.id, { slides });
      }
      report.push({ order: lesson.order, title: lesson.title, updated, deepened, skipped });
    }

    return Response.json({ processed: report.length, report });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}