import { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function DiagramGenerator({ solution }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const generate = async () => {
    setLoading(true); setError("");
    try {
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `Create a precise, clean, two-dimensional educational textbook diagram for this ${solution.qualification} ${solution.subject} problem and its solution. Show only structures, quantities and relationships needed to understand the reasoning. Use a white background, dark crisp lines, accessible colour accents, correctly spelled concise labels, clear arrowheads and generous spacing. No decoration, people, logos or exam-board branding. Treat it as a schematic illustration, not authentic source evidence.\n\nQuestion: ${solution.question || "Image-based question attached"}\n\nSolved reasoning: ${solution.answer}`,
        existing_image_urls: solution.uploadedFile?.url ? [solution.uploadedFile.url] : undefined,
      });
      setUrl(result.url);
    } catch { setError("The explanatory diagram could not be created. Please try again."); }
    finally { setLoading(false); }
  };
  if (url) return <figure className="rounded-xl border border-sky-200 bg-white p-3"><img src={url} alt={`Explanatory ${solution.subject} diagram for the solved question`} className="w-full rounded-lg object-contain" /><figcaption className="mt-2 text-xs text-gray-600">AI-created schematic to support the worked explanation; use the question’s stated values as authoritative.</figcaption></figure>;
  return <div className="rounded-xl border border-sky-200 bg-sky-50 p-4"><h3 className="font-semibold text-sky-900">Need a visual explanation?</h3><p className="mt-1 text-xs text-sky-700">Create a clean schematic based on the question and worked answer.</p><button onClick={generate} disabled={loading} className="mt-3 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Drawing diagram…" : "Draw explanatory diagram"}</button>{error && <p className="mt-2 text-xs text-red-600">{error}</p>}</div>;
}