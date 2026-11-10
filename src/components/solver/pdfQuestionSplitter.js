import { loadPdfIndex } from "@/components/solver/pdfIndex";

// Splits a text-based exam PDF into its numbered questions, straight from the paper's own text layer.
// Each question keeps its verbatim text, its marks and the page areas (with diagrams) it occupies.

const END_RE = /end of (the )?(question )?paper|end of questions/i;
const SKIP_PAGE_RE = /do not write on this page|for examiner.?s use only|^\(?blank page\)?$/i;

// The paper code printed on most pages (e.g. "12506") is page furniture, not question content.
function paperCodes(pages) {
  const counts = new Map();
  pages.forEach((p) =>
    new Set(p.items.map((i) => i.str).filter((s) => /^\d{4,6}(\/\d+)?$/.test(s))).forEach((s) => counts.set(s, (counts.get(s) || 0) + 1))
  );
  return new Set([...counts].filter(([, c]) => c >= Math.max(2, pages.length / 2)).map(([s]) => s));
}

function pageLayout(page, codes) {
  const isFooter = (i) => /turn over/i.test(i.str) || /^\*[^*\s]+\*$/.test(i.str) || codes.has(i.str);
  const content = page.items.filter((i) => !isFooter(i));
  const footerTops = page.items.filter((i) => isFooter(i) && i.y > 0.7).map((i) => i.top);
  return {
    content,
    skip: !content.length || content.some((i) => SKIP_PAGE_RE.test(i.str)),
    top: content.length ? Math.max(0.02, Math.min(...content.map((i) => i.top)) - 0.015) : 0.05,
    bottom: footerTops.length ? Math.min(...footerTops) - 0.005 : 0.95,
    left: content.length ? Math.max(0, Math.min(...content.map((i) => i.x)) - 0.03) : 0,
    right: content.length ? Math.min(1, Math.max(...content.map((i) => i.xEnd)) + 0.03) : 1,
  };
}

// Question numbers are found in order (1, 2, 3 …) in the left-hand number column.
function findQuestionStarts(layouts) {
  const starts = [];
  let expected = 1;
  let column = null;
  let end = null;
  for (let p = 0; p < layouts.length && !end; p++) {
    const items = [...layouts[p].content].sort((a, b) => a.y - b.y || a.x - b.x);
    for (const item of items) {
      if (END_RE.test(item.str)) {
        end = { page: p, top: item.top };
        break;
      }
      if (item.str !== String(expected) || item.x > 0.2) continue;
      if (column === null) {
        const hasText = items.some((o) => o !== item && Math.abs(o.y - item.y) < 0.006 && o.x > item.x && o.x - item.x < 0.12);
        if (!hasText) continue;
        column = item.x;
      } else if (Math.abs(item.x - column) > 0.04) {
        continue;
      }
      starts.push({ number: expected, page: p, top: item.top });
      expected += 1;
    }
  }
  return { starts, end };
}

function toLines(items) {
  const lines = [];
  [...items]
    .sort((a, b) => a.y - b.y || a.x - b.x)
    .forEach((item) => {
      const line = lines[lines.length - 1];
      if (line && Math.abs(item.y - line.y) < 0.006) line.items.push(item);
      else lines.push({ y: item.y, items: [item] });
    });
  return lines.map((l) => l.items.sort((a, b) => a.x - b.x).map((i) => i.str).join(" "));
}

export async function splitPdfIntoQuestions(src) {
  const { pages } = await loadPdfIndex(src);
  const codes = paperCodes(pages);
  const layouts = pages.map((p) => pageLayout(p, codes));
  const { starts, end } = findQuestionStarts(layouts);
  const lastPage = layouts.length - 1;

  return starts
    .map((start, idx) => {
      const next = starts[idx + 1] || end || { page: lastPage, top: layouts[lastPage].bottom };
      const segments = [];
      const textItems = [];
      for (let p = start.page; p <= next.page; p++) {
        const layout = layouts[p];
        if (layout.skip) continue;
        const top = p === start.page ? start.top - 0.012 : layout.top;
        const bottom = p === next.page ? Math.min(next.top - 0.008, layout.bottom) : layout.bottom;
        const inside = layout.content.filter((i) => i.top >= top - 0.002 && i.y <= bottom + 0.002);
        if (bottom - top < 0.02 || !inside.length) continue;
        textItems.push(...inside.map((i) => ({ ...i, y: i.y + p })));
        segments.push({ page: p + 1, top, bottom, left: layout.left, right: layout.right, lastY: Math.max(...inside.map((i) => i.y)) });
      }
      // Trim the empty answer space after the final line (the marks) of the question.
      const last = segments[segments.length - 1];
      if (last) last.bottom = Math.min(last.bottom, last.lastY + 0.02);

      const text = toLines(textItems).join("\n");
      const marks = [...text.matchAll(/\[(\d{1,2})\]/g)].reduce((sum, m) => sum + Number(m[1]), 0);
      return {
        number: String(start.number),
        text,
        marks: marks || null,
        page_number: segments[0]?.page || 1,
        segments: segments.map(({ page, top, bottom, left, right }) => ({ page, top, bottom, left, right })),
      };
    })
    .filter((q) => q.segments.length);
}