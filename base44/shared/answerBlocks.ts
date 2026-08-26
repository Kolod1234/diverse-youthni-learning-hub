// Locating the coloured "box" regions inside authored lesson slide HTML.
//
// Every lesson box is emitted as
//   <div style="margin:16px 0;padding:14px 18px;border-left:5px solid #xxxxxx;...">
//     <div style="...">LABEL</div>  ...content...
//   </div>
// so a box cannot be matched with a flat regex: its own label (and any nested
// markup) is a <div> too. We therefore locate each opener and walk forward,
// counting div depth, to find the matching close tag.

const BOX_OPENER = '<div style="margin:16px 0;padding:14px 18px;border-left:5px solid';

export interface SlideBox {
  start: number;
  end: number; // exclusive
  html: string;
  label: string;
}

export function findBoxes(html: string): SlideBox[] {
  const boxes: SlideBox[] = [];
  if (!html) return boxes;

  let from = 0;
  while (true) {
    const start = html.indexOf(BOX_OPENER, from);
    if (start === -1) break;

    const tag = /<div\b|<\/div\s*>/gi;
    tag.lastIndex = start;
    let depth = 0;
    let end = -1;
    let match: RegExpExecArray | null;
    while ((match = tag.exec(html)) !== null) {
      depth += match[0].startsWith('</') ? -1 : 1;
      if (depth === 0) {
        end = match.index + match[0].length;
        break;
      }
    }
    if (end === -1) break; // unbalanced markup - leave the rest untouched

    const boxHtml = html.slice(start, end);
    const labelMatch = boxHtml.match(/text-transform:uppercase;[^"]*">([^<]*)</i);
    boxes.push({ start, end, html: boxHtml, label: (labelMatch ? labelMatch[1] : '').trim() });
    from = end;
  }
  return boxes;
}

export function isAnswerBox(box: SlideBox): boolean {
  return /solution|answer/i.test(box.label);
}

export function hasStepList(html: string): boolean {
  return /<ol[\s>]/i.test(html);
}

// Replace boxes by index, working from the end so earlier offsets stay valid.
export function replaceBoxes(
  html: string,
  replacements: { box: SlideBox; html: string }[]
): string {
  let out = html;
  [...replacements]
    .sort((a, b) => b.box.start - a.box.start)
    .forEach(({ box, html: next }) => {
      out = out.slice(0, box.start) + next + out.slice(box.end);
    });
  return out;
}

// Plain-text version of a box, for giving the model the question as context.
export function boxText(box: SlideBox): string {
  return box.html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}