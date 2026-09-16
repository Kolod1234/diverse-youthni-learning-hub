import { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function GeneratedDiagram({ solution }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true); setError(""); setUrl("");
    try {
      const imageReferences = solution.uploadedFile?.type === "image" && solution.uploadedFile?.url ? [solution.uploadedFile.url] : undefined;
      const brief = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a precise visual brief for a 2D ${solution.qualification} ${solution.subject} teaching diagram. List only necessary objects, exact labels, arrows and relationships. Do not invent facts or values. Question: ${solution.question || solution.text || "See attached question"}. Solution: ${solution.answer}`,
        file_urls: imageReferences,
        model: "automatic",
      });
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `Professional flat textbook diagram on white. Crisp dark lines, accessible blue accents, ample spacing, correctly spelled concise labels, precise leader-line endpoints and no decoration. Copy values and scientific symbols exactly; invent nothing. Question: ${solution.question || solution.text || "See source question"}. Brief: ${typeof brief === "string" ? brief : brief?.text || "Explain the solution visually."}`,
        existing_image_urls: imageReferences,
      });
      if (!result?.url) throw new Error("No diagram was returned.");
      setUrl(result.url);
    } catch (err) { setError(err?.message || "The diagram could not be created."); }
    finally { setLoading(false); }
  };

  if (url) return <figure className="rounded-xl border border-sky-200 bg-white p-3"><img src={url} onError={() => { setUrl(""); setError("The generated image could not be loaded."); }} alt={`AI-generated ${solution.subject} explanatory diagram`} className="w-full rounded-lg object-contain" /><figcaption className="mt-2 text-xs text-gray-600">AI-generated schematic. Check labels and stated values against the worked answer.</figcaption></figure>;
  return <div><button onClick={generate} disabled={loading} className="w-full rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Drawing diagram…" : "Generate labelled diagram"}</button>{error && <p className="mt-2 text-xs text-red-600">{error}</p>}</div>;
}