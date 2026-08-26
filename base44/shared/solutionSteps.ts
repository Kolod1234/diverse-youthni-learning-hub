// Deepening already-listed solution boxes into ADHD-friendly micro-steps.
//
// addMicroStepsToAnswers turns prose solutions into an <ol> of steps. This
// module handles the next pass: a box that already has a step list but where a
// single step still performs several moves at once ("packed" working), e.g.
//   $$x^2-4 = x+2 \Rightarrow x^2-x-6 = 0 \Rightarrow (x-3)(x+2) = 0$$
// Each such line must become one step per move, with the reason stated before
// the algebra.

import { mathTokens, invokeWithRetry } from './lessonHtml.ts';
import { findBoxes, isAnswerBox, hasStepList, boxText, type SlideBox } from './answerBlocks.ts';

const OL_STYLE = 'margin:12px 0 12px 22px;line-height:1.75;font-size:1.06em;color:#24343d;';
const LI_STYLE = 'margin:6px 0;';

export const DEEPEN_RULES = `You are a CCEA Mathematics examiner re-writing the SOLUTION box of a lesson slide for a learner with ADHD who has never met the topic. Nothing may appear from nowhere.

You are given the question for context and the solution box HTML. Rewrite ONLY the solution box.

REQUIRED FORMAT
- Keep an <ol style="${OL_STYLE}"> of <li style="${LI_STYLE}"> steps.
- ONE action per step. Never chain several moves on one line: a line such as $a = b \\Rightarrow c = d \\Rightarrow e = f$ must be split into one step per move.
- State the REASON before the algebra in each step, e.g. "Subtract $x$ from both sides so every term is on the left:" then the resulting line.
- Show every intermediate line. No step may skip arithmetic the learner is expected to do in their head beyond a single operation.
- Where two equations are combined, keep them on adjacent lines so matching terms line up.
- A continuation line that begins with "=" and then evaluates twice, such as $= 2\\left(\\tfrac{5}{4}+1\\right) = 2 \\times \\tfrac{9}{4} = \\tfrac{9}{2}$, is packed: give each "=" its own step, restating the left-hand side or the reason ("Add inside the bracket:", "Multiply out:") so no step starts from nowhere.
- End with the SAME final answer as the original, plus a short check step where natural.

ACCURACY
- Never change the final answer, the method or any number.
- Every LaTeX expression already present must still appear somewhere in your output (a chain may be split across consecutive steps).
- \\Rightarrow used as the topic's own logic notation (implication and converse questions) is content, not packed working: leave those statements as they are.

PRESERVE
- Keep the outer <div> box wrapper, its style attribute and the uppercase label div exactly as given.
- Keep any mark-scheme line (the italic M1/A1 note) as the last element, unchanged.
- Keep [SVG_n] placeholders exactly, in the same position.
- British English spelling. Use \\times, \\div, \\left( \\right) as in the existing content.
- Return ONLY the rewritten box HTML, complete from its opening <div> to its closing </div>.`;

// A LaTeX chunk is "packed" when one line performs several moves at once: a
// chain of implication arrows, or three or more relations strung together.
// A single implication ("$x = 5 \Rightarrow 2x = 10$", logic notation) and a
// single rewrite ("$a = b$") are legitimate and left alone.
export function isPackedMaths(latex: string): boolean {
  const arrows = (latex.match(/\\Rightarrow|\\implies|\\therefore/g) || []).length;
  if (arrows >= 2) return true;
  // \leq?/\geq? need the negative lookahead so that \left / \geometry-style
  // commands are not counted as inequality relations.
  const relations = (latex.match(/(?<!\\)=|\\leq?(?![a-zA-Z])|\\geq?(?![a-zA-Z])/g) || []).length;
  return relations >= 3;
}

export function hasPackedWorking(html: string): boolean {
  return ((html || '').match(/\$\$?[^$]+\$\$?/g) || []).some(isPackedMaths);
}

// Answer boxes that already list steps but still pack moves onto one line.
export function findPackedAnswerBoxes(content: string): SlideBox[] {
  return findBoxes(content).filter(
    (b) => isAnswerBox(b) && hasStepList(b.html) && hasPackedWorking(b.html)
  );
}

export function slideQuestion(content: string): string {
  return findBoxes(content)
    .filter((b) => /question|practice|exam/i.test(b.label))
    .map(boxText)
    .join('\n');
}

const normalise = (s: string) =>
  s
    .replace(/\\left|\\right/g, '')
    .replace(/\\dfrac|\\tfrac/g, '\\frac')
    .replace(/\\text|\\mathrm|\\operatorname/g, '')
    .replace(/\\[,;:!]|~/g, '')
    .replace(/[{}\s]/g, '')
    .replace(/\(\d+(s\.f\.|d\.p\.|sf|dp)\)/gi, '');

const plainBlob = (html: string) => normalise(html.replace(/<[^>]+>/g, ' '));
const looseBlob = (blob: string) => blob.replace(/\\[a-zA-Z]+/g, '').replace(/[()[\]$,]/g, '');

// A token survives verbatim, or - because a chain is deliberately split across
// steps - if both its first and last terms still appear in the rewritten box.
function preservedIn(blob: string, tokenSet: Set<string>, token: string): boolean {
  if (tokenSet.has(token)) return true;
  const parts = token
    .replace(/^\$\$?/, '')
    .replace(/\$\$?$/, '')
    .split(/=|<|>|\\leq?(?![a-zA-Z])|\\geq?(?![a-zA-Z])|\\Rightarrow|\\implies|\\therefore|\\to(?![a-zA-Z])/)
    .map(normalise)
    .filter(Boolean);
  if (parts.length === 0) return false;
  // A split step may also simplify one side (e.g. "$2+3 = 6x-2x$" becomes
  // "$5 = 4x$"), so it is enough that one end of the chain still appears.
  const ends = [parts[0], parts[parts.length - 1]];
  const loose = looseBlob(blob);
  return ends.some((p) => blob.includes(p) || loose.includes(looseBlob(p)));
}

export async function deepenBox(
  base44,
  question: string,
  box: SlideBox,
  model = 'claude_sonnet_4_6'
) {
  const svgs: string[] = [];
  const masked = box.html.replace(/<svg[\s\S]*?<\/svg>/g, (m) => {
    svgs.push(m);
    return `[SVG_${svgs.length - 1}]`;
  });

  const basePrompt = `${DEEPEN_RULES}\n\nQUESTION (context, do not include in your output):\n${question || '(not stated on this slide)'}\n\nSOLUTION BOX HTML:\n${masked}`;

  let out = '';
  let reason: string | null = null;
  // One retry, telling the model exactly which rule its first attempt broke.
  for (let attempt = 0; attempt < 2; attempt++) {
    let res;
    try {
      res = await invokeWithRetry(
        base44,
        attempt === 0
          ? basePrompt
          : `${basePrompt}\n\nYOUR PREVIOUS ATTEMPT WAS REJECTED: ${reason}. Fix exactly that and return the box again.`,
        model
      );
    } catch (err) {
      return { changed: false, reason: 'llm error: ' + err.message };
    }

    out = (res && res.html ? res.html : '').trim();
    if (!out) return { changed: false, reason: 'empty response' };
    if (res.changed !== true) return { changed: false, reason: 'model declined' };
    if (!out.startsWith('<div') || !out.endsWith('</div>')) {
      return { changed: false, reason: 'box wrapper lost' };
    }

    reason = null;
    if (!hasStepList(out)) reason = 'step list lost';
    else if (hasPackedWorking(out)) reason = 'still packed';
    else {
      const afterSet = new Set(mathTokens(out));
      const afterBlob = plainBlob(out);
      const lost = mathTokens(masked).filter((t) => !preservedIn(afterBlob, afterSet, t));
      if (lost.length > 0) reason = 'maths lost: ' + lost[0];
    }
    if (!reason) break;
  }
  if (reason) return { changed: false, reason };

  for (let i = 0; i < svgs.length; i++) {
    if (!out.includes(`[SVG_${i}]`)) return { changed: false, reason: 'svg lost' };
    out = out.replace(`[SVG_${i}]`, svgs[i]);
  }
  if (/\[SVG_\d+\]/.test(out)) return { changed: false, reason: 'stray svg token' };

  return { changed: true, html: out };
}