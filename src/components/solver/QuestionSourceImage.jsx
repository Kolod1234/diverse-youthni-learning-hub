import { useEffect, useState } from "react";
import { pdfjs } from "react-pdf";
import { ChevronLeft, ChevronRight, Crop, Maximize2, Loader2, FileText } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

function normalizeCropBox(cropBox) {
  if (!Array.isArray(cropBox) || cropBox.length !== 4) return null;
  const nums = cropBox.map((n) => Number(n));
  if (nums.some((n) => !Number.isFinite(n))) return null;
  let [ymin, xmin, ymax, xmax] = nums;
  // Support 0..1 or 0..1000 scales
  const maxVal = Math.max(ymin, xmin, ymax, xmax);
  if (maxVal <= 1.05) {
    ymin *= 1000;
    xmin *= 1000;
    ymax *= 1000;
    xmax *= 1000;
  }
  ymin = Math.max(0, Math.min(1000, ymin));
  xmin = Math.max(0, Math.min(1000, xmin));
  ymax = Math.max(0, Math.min(1000, ymax));
  xmax = Math.max(0, Math.min(1000, xmax));
  if (ymax - ymin < 30 || xmax - xmin < 30) return null;
  return [ymin, xmin, ymax, xmax];
}

function cropCanvasRegion(sourceCanvas, validCrop) {
  const [ymin, xmin, ymax, xmax] = validCrop;
  const padY = 25; // 2.5% padding
  const padX = 25;
  const top = Math.max(0, (ymin - padY) / 1000) * sourceCanvas.height;
  const left = Math.max(0, (xmin - padX) / 1000) * sourceCanvas.width;
  const bottom = Math.min(1, (ymax + padY) / 1000) * sourceCanvas.height;
  const right = Math.min(1, (xmax + padX) / 1000) * sourceCanvas.width;
  const width = Math.max(1, Math.round(right - left));
  const height = Math.max(1, Math.round(bottom - top));

  const cropped = document.createElement("canvas");
  cropped.width = width;
  cropped.height = height;
  const ctx = cropped.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(sourceCanvas, Math.round(left), Math.round(top), width, height, 0, 0, width, height);
  return cropped.toDataURL("image/png");
}

export default function QuestionSourceImage({
  file,
  pageNumber = 1,
  cropBox = null,
  caption = "",
}) {
  const [fullDataUrl, setFullDataUrl] = useState("");
  const [croppedDataUrl, setCroppedDataUrl] = useState("");
  const [numPages, setNumPages] = useState(null);
  const [activePage, setActivePage] = useState(Math.max(1, Number(pageNumber) || 1));
  const [showCropped, setShowCropped] = useState(true);
  const [loading, setLoading] = useState(false);
  const [renderError, setRenderError] = useState("");

  const validCrop = normalizeCropBox(cropBox);
  const src = file?.preview || file?.url;

  useEffect(() => {
    setActivePage(Math.max(1, Number(pageNumber) || 1));
  }, [pageNumber]);

  useEffect(() => {
    if (!file || !src) return;
    let cancelled = false;

    async function renderImageSource() {
      setLoading(true);
      setRenderError("");
      try {
        if (!validCrop) {
          if (!cancelled) {
            setFullDataUrl(src);
            setCroppedDataUrl("");
          }
          return;
        }
        const img = new Image();
        img.crossOrigin = "anonymous";
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
          img.src = src;
        });
        if (cancelled) return;
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth || img.width;
        canvas.height = img.naturalHeight || img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const cropped = cropCanvasRegion(canvas, validCrop);
        if (!cancelled) {
          setFullDataUrl(src);
          setCroppedDataUrl(cropped);
        }
      } catch {
        // Fallback to raw image URL if canvas tainting occurs
        if (!cancelled) {
          setFullDataUrl(src);
          setCroppedDataUrl("");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    async function renderPdfSource() {
      setLoading(true);
      setRenderError("");
      try {
        const loadingTask = pdfjs.getDocument(src);
        const pdf = await loadingTask.promise;
        if (cancelled) return;
        setNumPages(pdf.numPages);
        const targetPage = Math.min(Math.max(1, activePage), pdf.numPages);
        const page = await pdf.getPage(targetPage);
        if (cancelled) return;

        const viewport = page.getViewport({ scale: 2.0 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: ctx, viewport }).promise;
        if (cancelled) return;

        const fullUrl = canvas.toDataURL("image/png");
        let cropUrl = "";
        const isInitialQuestionPage = targetPage === Math.min(Math.max(1, Number(pageNumber) || 1), pdf.numPages);
        if (validCrop && isInitialQuestionPage) {
          cropUrl = cropCanvasRegion(canvas, validCrop);
        }

        if (!cancelled) {
          setFullDataUrl(fullUrl);
          setCroppedDataUrl(cropUrl);
        }
      } catch (err) {
        if (!cancelled) {
          setRenderError(err?.message || "Could not render PDF page preview.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (file.type === "image") {
      renderImageSource();
    } else if (file.type === "pdf") {
      renderPdfSource();
    } else {
      setFullDataUrl("");
      setCroppedDataUrl("");
    }

    return () => {
      cancelled = true;
    };
  }, [file, src, activePage, pageNumber, JSON.stringify(validCrop)]);

  if (!file || !src) return null;

  if (file.type !== "image" && file.type !== "pdf") {
    return (
      <div className="mb-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
        <FileText className="h-4 w-4 text-indigo-600" />
        <span>Source document: {file.name}</span>
      </div>
    );
  }

  const displayedUrl = showCropped && croppedDataUrl ? croppedDataUrl : fullDataUrl;

  return (
    <figure className="my-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span className="inline-block h-2 w-2 rounded-full bg-indigo-600" />
          <span>
            {file.type === "pdf"
              ? `Exam Paper Visual (Page ${activePage}${numPages ? ` of ${numPages}` : ""})`
              : "Original Question Image / Diagram"}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {croppedDataUrl && (
            <button
              type="button"
              onClick={() => setShowCropped((prev) => !prev)}
              className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100 transition-colors"
            >
              {showCropped ? (
                <>
                  <Maximize2 className="h-3.5 w-3.5" />
                  Show full page
                </>
              ) : (
                <>
                  <Crop className="h-3.5 w-3.5" />
                  Focus on question & diagram
                </>
              )}
            </button>
          )}

          {file.type === "pdf" && numPages && numPages > 1 && (
            <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-1.5 py-0.5">
              <button
                type="button"
                onClick={() => {
                  setShowCropped(false);
                  setActivePage((p) => Math.max(1, p - 1));
                }}
                disabled={activePage <= 1 || loading}
                className="p-0.5 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                title="Previous page"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              <span className="px-1 text-[11px] font-medium text-slate-600">
                {activePage}/{numPages}
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowCropped(false);
                  setActivePage((p) => Math.min(numPages, p + 1));
                }}
                disabled={activePage >= numPages || loading}
                className="p-0.5 text-slate-600 hover:text-slate-900 disabled:opacity-40"
                title="Next page"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          <span>Extracting question & diagram from paper…</span>
        </div>
      ) : renderError ? (
        <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
          {renderError}
        </div>
      ) : displayedUrl ? (
        <div className="overflow-hidden rounded-lg bg-slate-50 p-2">
          <img
            src={displayedUrl}
            alt={caption || "Question and diagram from the exam paper"}
            className="mx-auto max-h-[460px] w-full rounded object-contain"
          />
        </div>
      ) : null}

      <figcaption className="mt-2 text-xs text-slate-500">
        {caption
          ? `Paper diagram details: ${caption}`
          : showCropped && croppedDataUrl
          ? "Cropped directly from the uploaded past paper. Click 'Show full page' to view the entire sheet."
          : "Source visual from the uploaded past paper."}
      </figcaption>
    </figure>
  );
}