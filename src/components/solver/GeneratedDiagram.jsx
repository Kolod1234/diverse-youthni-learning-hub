import { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { Loader2, Sparkles, RefreshCw } from "lucide-react";

export default function GeneratedDiagram({ solution, autoGenerate = false }) {
  const [url, setUrl] = useState(solution?.generatedDiagramUrl || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const autoTriggeredRef = useRef(false);

  const generate = async () => {
    setLoading(true);
    setError("");
    setUrl("");
    try {
      const imageReferences =
        solution?.uploadedFile?.type === "image" && solution?.uploadedFile?.url
          ? [solution.uploadedFile.url]
          : undefined;
      const questionContext = [
        solution?.stem ? `Parent context: ${solution.stem}` : "",
        `Question: ${solution?.question || solution?.text || "See attached question"}`,
        solution?.diagram_summary ? `Original diagram details: ${solution.diagram_summary}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      const brief = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a precise visual brief for a 2D ${solution?.qualification || "GCSE"} ${solution?.subject || "Mathematics"} teaching diagram that illustrates the question and worked solution clearly. List only necessary objects, exact labels, values, key symbols, arrows and relationships. Do not invent facts or values.\n\n${questionContext}\n\nSolution:\n${solution?.answer || ""}`,
        file_urls: imageReferences,
        model: "automatic",
      });
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `Professional flat textbook diagram on a clean white background. Crisp dark lines, accessible blue and indigo accents, ample spacing, correctly spelled concise labels, precise leader-line endpoints and no decorative clutter. Copy values, keys, tables, and scientific/mathematical symbols exactly; invent nothing. ${questionContext}. Brief: ${typeof brief === "string" ? brief : brief?.text || "Explain the question and solution visually."}`,
        existing_image_urls: imageReferences,
      });
      if (!result?.url) throw new Error("No diagram was returned.");
      setUrl(result.url);
    } catch (err) {
      setError(err?.message || "The diagram could not be created.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoGenerate && !url && !loading && !autoTriggeredRef.current) {
      autoTriggeredRef.current = true;
      generate();
    }
  }, [autoGenerate]);

  if (url) {
    return (
      <figure className="rounded-xl border border-sky-200 bg-white p-3 shadow-sm">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold text-sky-900 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-sky-600" />
            AI Explanatory Diagram
          </span>
          <button
            type="button"
            onClick={generate}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-md border border-sky-200 bg-sky-50 px-2 py-0.5 text-[11px] font-medium text-sky-700 hover:bg-sky-100 disabled:opacity-50"
          >
            <RefreshCw className="h-3 w-3" />
            Regenerate
          </button>
        </div>
        <img
          src={url}
          onError={() => {
            setUrl("");
            setError("The generated image could not be loaded.");
          }}
          alt={`AI-generated ${solution?.subject || ""} explanatory diagram`}
          className="mx-auto max-h-96 w-full rounded-lg object-contain"
        />
        <figcaption className="mt-2 text-xs text-gray-600">
          AI-generated schematic illustrating the question and step-by-step working.
        </figcaption>
      </figure>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={generate}
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-sky-700 hover:bg-sky-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Drawing labelled diagram…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate labelled diagram
          </>
        )}
      </button>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}