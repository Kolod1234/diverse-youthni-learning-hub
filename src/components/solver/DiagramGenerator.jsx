import { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function DiagramGenerator({ solution }) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    setLoading(true); setError(""); setUrl("");
    try {
      const fileUrls = solution.uploadedFile?.url ? [solution.uploadedFile.url] : undefined;
      const brief = await base44.integrations.Core.InvokeLLM({
        prompt: `Write a concise visual brief for a precise 2D educational diagram that explains this ${solution.qualification} ${solution.subject} solution. Identify the required objects, exact labels, arrows, relationships and the single teaching point. Do not add facts or values absent from the question.\nQuestion: ${solution.question || solution.text || "See attached question"}\nSolution: ${solution.answer}`,
        file_urls: fileUrls,
        model: "automatic",
      });
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `Create a crisp, professional two-dimensional textbook schematic on a white background. Use dark clean lines, accessible blue accents, generous spacing, concise correctly spelled labels and accurate arrow endpoints. Copy every number, operator and scientific symbol exactly from the supplied question and solution. Never use a dollar sign or currency notation for mathematics; for example, write "subtract 7" and "divide by 5". No decoration, people, logos, exam-board branding, photorealism or invented values. Question: ${solution.question || solution.text || "See attached question"}. Visual brief: ${typeof brief === "string" ? brief : brief?.text || "Explain the solution visually."}`,
        existing_image_urls: fileUrls,
      });
      if (!result?.url) throw new Error("No diagram returned");
      setUrl(result.url);
    } catch (err) {
      setError(err?.message || "The explanatory diagram could not be created. Please try again.");
    } finally { setLoading(false); }
  };

  if (url) return <figure className="rounded-xl border border-sky-200 bg-white p-3"><img src={url} onError={() => { setUrl(""); setError("The diagram image could not be loaded. Please try again."); }} alt={`Explanatory ${solution.subject} diagram for the solved question`} className="w-full rounded-lg object-contain" /><figcaption className="mt-2 text-xs text-gray-600">AI-created schematic supporting the worked explanation; the question’s stated values remain authoritative.</figcaption></figure>;
  return <div className="rounded-xl border border-sky-200 bg-sky-50 p-4"><h3 className="font-semibold text-sky-900">Need a visual explanation?</h3><p className="mt-1 text-xs text-sky-700">Create a clean schematic based on the question and worked answer.</p><button onClick={generate} disabled={loading} className="mt-3 rounded-lg bg-sky-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{loading ? "Drawing diagram…" : "Draw explanatory diagram"}</button>{error && <p className="mt-2 text-xs text-red-600">{error}</p>}</div>;
}