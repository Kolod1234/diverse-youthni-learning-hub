import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Crop, Maximize2, Loader2, FileText } from "lucide-react";
import { renderQuestionView } from "@/components/solver/pdfQuestionLocator";

export default function QuestionSourceImage({
  file,
  pageNumber = 1,
  cropBox = null,
  caption = "",
  questionText = "",
  stemText = "",
  nextQuestionText = "",
}) {
  const src = file?.preview || file?.url;
  const isPdf = file?.type === "pdf";
  const [view, setView] = useState({ page: null, numPages: null, fullUrl: "", cropUrl: "" });
  const [requestedPage, setRequestedPage] = useState(null);
  const [showCropped, setShowCropped] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPdf || !src) return;
    let cancelled = false;
    setLoading(true);
    setError("");
    renderQuestionView({ src, requestedPage, questionText, stemText, nextQuestionText, hintPage: pageNumber, cropBox })
      .then((result) => !cancelled && setView(result))
      .catch((err) => !cancelled && setError(err?.message || "Could not display this page of the paper."))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [isPdf, src, requestedPage, questionText, stemText, nextQuestionText, pageNumber, JSON.stringify(cropBox)]);

  if (!file || !src) return null;

  if (file.type !== "image" && !isPdf) {
    return (
      <div className="mb-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
        <FileText className="h-4 w-4 text-indigo-600" />
        <span>Source document: {file.name}. Upload the paper as a PDF or photo to see its diagrams here.</span>
      </div>
    );
  }

  const goToPage = (page) => {
    setShowCropped(false);
    setRequestedPage(page);
  };
  const displayedUrl = isPdf ? (showCropped && view.cropUrl ? view.cropUrl : view.fullUrl) : src;

  return (
    <figure className="my-3 rounded-xl border border-slate-200 bg-white p-3 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2 flex-wrap border-b border-slate-100 pb-2">
        <span className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          <span className="inline-block h-2 w-2 rounded-full bg-indigo-600" />
          {isPdf ? `Original question from the paper (page ${view.page || "…"}${view.numPages ? ` of ${view.numPages}` : ""})` : "Original question image"}
        </span>
        {isPdf && (
          <div className="flex items-center gap-1.5">
            {view.cropUrl && (
              <button
                type="button"
                onClick={() => setShowCropped((prev) => !prev)}
                className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 hover:bg-indigo-100"
              >
                {showCropped ? <><Maximize2 className="h-3.5 w-3.5" />Show full page</> : <><Crop className="h-3.5 w-3.5" />Focus on question</>}
              </button>
            )}
            {view.numPages > 1 && (
              <div className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-1.5 py-0.5">
                <button type="button" onClick={() => goToPage(view.page - 1)} disabled={view.page <= 1 || loading} className="p-0.5 text-slate-600 disabled:opacity-40" title="Previous page">
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                <span className="px-1 text-[11px] font-medium text-slate-600">{view.page}/{view.numPages}</span>
                <button type="button" onClick={() => goToPage(view.page + 1)} disabled={view.page >= view.numPages || loading} className="p-0.5 text-slate-600 disabled:opacity-40" title="Next page">
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center gap-2 py-10 text-xs text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin text-indigo-600" />
          Finding the question and diagram in the paper…
        </div>
      ) : error ? (
        <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">{error}</div>
      ) : displayedUrl ? (
        <div className="overflow-hidden rounded-lg bg-slate-50 p-2">
          <img src={displayedUrl} alt={caption || "Question and diagram from the exam paper"} className="mx-auto max-h-[640px] w-full rounded object-contain" />
        </div>
      ) : null}

      {caption && <figcaption className="mt-2 text-xs text-slate-500">Diagram details: {caption}</figcaption>}
    </figure>
  );
}