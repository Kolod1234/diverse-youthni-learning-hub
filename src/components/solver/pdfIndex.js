import { pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

// Words for matching question text against the text layer of the PDF.
// LaTeX and Markdown are stripped so AI-formatted question text still lines up with the paper.
export function tokenize(text) {
  return String(text || "")
    .replace(/\$\$?[^$]*\$\$?/g, " ")
    .replace(/\\[a-z]+/gi, " ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean);
}

const indexCache = new Map();

// Loads the PDF once per source and records every text item's position as fractions (0–1) of the page.
// items: { str, x, xEnd, y (baseline), top } — words: { w, top } for text matching.
export function loadPdfIndex(src) {
  if (!indexCache.has(src)) {
    const promise = (async () => {
      const pdf = await pdfjs.getDocument(src).promise;
      const pages = [];
      for (let n = 1; n <= pdf.numPages; n++) {
        const page = await pdf.getPage(n);
        const viewport = page.getViewport({ scale: 1 });
        const content = await page.getTextContent();
        const items = [];
        const words = [];
        content.items.forEach((item) => {
          const str = (item.str || "").trim();
          if (!str) return;
          const [x, y] = viewport.convertToViewportPoint(item.transform[4], item.transform[5]);
          const height = Math.hypot(item.transform[2], item.transform[3]) / viewport.height;
          const left = x / viewport.width;
          const entry = {
            str,
            x: left,
            xEnd: left + (item.width || 0) / viewport.width,
            y: y / viewport.height,
            top: y / viewport.height - height,
          };
          items.push(entry);
          tokenize(str).forEach((w) => words.push({ w, top: entry.top }));
        });
        pages.push({ items, words });
      }
      return { pdf, pages };
    })().catch((err) => {
      indexCache.delete(src);
      throw err;
    });
    indexCache.set(src, promise);
  }
  return indexCache.get(src);
}