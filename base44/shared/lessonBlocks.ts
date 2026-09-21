// Shared utilities for slicing authored lesson HTML into top-level blocks so
// that automated lesson-processing functions can inspect, rewrite or splice
// content without corrupting the surrounding markup.

export const VOID_TAGS = new Set(['img', 'br', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col', 'embed', 'source', 'track', 'wbr']);

// Scan the HTML and record the exact character ranges of every top-level
// element (paragraph, div, figure, table, heading...). Plain text before the
// first element and after the last element is reported separately.
export function topLevelBlockRanges(html) {
  const tokenRe = /<\/?[a-zA-Z][^>]*>/g;
  const ranges = [];
  let depth = 0;
  let blockStart = -1;
  let firstStart = -1;
  let lastEnd = 0;
  let m;
  while ((m = tokenRe.exec(html)) !== null) {
    const tag = m[0];
    const nameM = tag.match(/^<\s*\/?\s*([a-zA-Z0-9]+)/);
    const name = nameM ? nameM[1].toLowerCase() : '';
    const closing = /^<\s*\//.test(tag);
    if (!name || VOID_TAGS.has(name)) continue;
    if (!closing) {
      if (depth === 0) {
        blockStart = m.index;
        if (firstStart < 0) firstStart = m.index;
      }
      depth++;
    } else {
      depth--;
      if (depth === 0 && blockStart >= 0) {
        ranges.push({ start: blockStart, end: m.index + tag.length });
        blockStart = -1;
        lastEnd = m.index + tag.length;
      }
    }
  }
  return { ranges, firstStart, lastEnd };
}

// Convenience view of the same split as an ordered list of block strings,
// including any leading or trailing plain text.
export function splitTopLevelBlocks(html) {
  const { ranges, firstStart, lastEnd } = topLevelBlockRanges(html);
  const out = [];
  if (firstStart > 0) {
    const lead = html.slice(0, firstStart).trim();
    if (lead) out.push(lead);
  }
  for (const r of ranges) out.push(html.slice(r.start, r.end));
  if (ranges.length && lastEnd < html.length) {
    const trail = html.slice(lastEnd).trim();
    if (trail) out.push(trail);
  }
  if (!out.length) out.push(html.trim());
  return out;
}