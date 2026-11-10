import { loadPdfIndex, tokenize } from "@/components/solver/pdfIndex";

// Index of the first place where three consecutive question words appear on the page.
function findSequence(words, qWords) {
  const maxOffset = Math.min(8, qWords.length - 3);
  for (let s = 0; s <= maxOffset; s++) {
    const seq = qWords.slice(s, s + 3);
    for (let i = 0; i + 2 < words.length; i++) {
      if (words[i].w === seq[0] && words[i + 1].w === seq[1] && words[i + 2].w === seq[2]) return i;
    }
  }
  return -1;
}

function scorePage(words, qWords) {
  const distinctive = [...new Set(qWords.filter((w) => w.length >= 4))].slice(0, 30);
  if (!distinctive.length) return 0;
  const pageSet = new Set(words.map((x) => x.w));
  return distinctive.filter((w) => pageSet.has(w)).length / distinctive.length;
}

// Sub-parts such as "2b" or "11(c)(i)" usually rely on a diagram printed above them with the parent question.
const isSubPart = (label) => /^\s*\d+\s*\(?[a-z]/i.test(String(label || ""));

// Finds the page and vertical band holding the question (from its stem to the next question).
function locateQuestion(pages, { questionText, stemText, nextQuestionText, questionLabel }) {
  const qWords = tokenize(questionText);
  if (qWords.length < 3) return null;
  let best = null;
  pages.forEach((p, idx) => {
    const score = scorePage(p.words, qWords);
    if (!best || score > best.score) best = { idx, score };
  });
  if (!best || best.score < 0.5) return null;

  const words = pages[best.idx].words;
  const qPos = findSequence(words, qWords);
  if (qPos < 0) return null;
  let top = words[qPos].top;

  const stemWords = tokenize(stemText);
  if (stemWords.length >= 3) {
    const sPos = findSequence(words, stemWords);
    if (sPos >= 0 && words[sPos].top < top) top = words[sPos].top;
  }
  top = isSubPart(questionLabel) ? 0.04 : Math.max(0, top - 0.025);

  let bottom = 0.96;
  const nextWords = tokenize(nextQuestionText);
  if (nextWords.length >= 3) {
    const nPos = findSequence(words, nextWords);
    if (nPos >= 0 && words[nPos].top > top + 0.06) bottom = words[nPos].top - 0.01;
  }
  return { page: best.idx + 1, top, bottom, left: 0, right: 1 };
}

// Fallback: the AI-estimated box ([ymin, xmin, ymax, xmax] on 0–1000 or 0–1).
function regionFromCropBox(cropBox, page) {
  if (!Array.isArray(cropBox) || cropBox.length !== 4) return null;
  let [ymin, xmin, ymax, xmax] = cropBox.map(Number);
  if ([ymin, xmin, ymax, xmax].some((n) => !Number.isFinite(n))) return null;
  const scale = Math.max(ymin, xmin, ymax, xmax) <= 1.05 ? 1 : 1000;
  const clamp = (n) => Math.max(0, Math.min(1, n / scale));
  const region = { page, top: clamp(ymin), left: clamp(xmin), bottom: clamp(ymax), right: clamp(xmax) };
  if (region.bottom - region.top < 0.03 || region.right - region.left < 0.03) return null;
  return region;
}

function cropCanvas(canvas, { top, bottom, left, right }) {
  const y0 = Math.max(0, top - 0.015) * canvas.height;
  const y1 = Math.min(1, bottom + 0.015) * canvas.height;
  const x0 = Math.max(0, left - 0.01) * canvas.width;
  const x1 = Math.min(1, right + 0.01) * canvas.width;
  const width = Math.max(1, Math.round(x1 - x0));
  const height = Math.max(1, Math.round(y1 - y0));
  const out = document.createElement("canvas");
  out.width = width;
  out.height = height;
  const ctx = out.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(canvas, Math.round(x0), Math.round(y0), width, height, 0, 0, width, height);
  return out.toDataURL("image/png");
}

async function renderPage(pdf, pageNumber) {
  const page = await pdf.getPage(pageNumber);
  const viewport = page.getViewport({ scale: 2 });
  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas;
}

// Renders the page containing the question and a crop focused on the question and its diagram.
// `region` (from the question splitter) is used as-is; otherwise the question is located by its wording.
export async function renderQuestionView({ src, requestedPage, region: fixedRegion, questionText, stemText, nextQuestionText, questionLabel, hintPage, cropBox }) {
  const { pdf, pages } = await loadPdfIndex(src);
  const numPages = pdf.numPages;
  const fallbackPage = Math.min(Math.max(1, Number(hintPage) || 1), numPages);
  const region =
    fixedRegion ||
    locateQuestion(pages, { questionText, stemText, nextQuestionText, questionLabel }) ||
    regionFromCropBox(cropBox, fallbackPage);
  const page = requestedPage || region?.page || fallbackPage;
  const canvas = await renderPage(pdf, page);
  return {
    page,
    numPages,
    fullUrl: canvas.toDataURL("image/png"),
    cropUrl: region && region.page === page ? cropCanvas(canvas, region) : "",
  };
}