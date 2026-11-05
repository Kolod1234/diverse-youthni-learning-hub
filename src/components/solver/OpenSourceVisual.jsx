import { useState } from "react";
import { base44 } from "@/api/base44Client";

export default function OpenSourceVisual({ solution }) {
  const [images, setImages] = useState([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const search = async () => {
    setLoading(true); setError(""); setImages([]); setIndex(0);
    const response = await base44.functions.invoke("findEducationalVisual", {
      question: solution.question || solution.text,
      answer: solution.answer,
      subject: solution.subject,
      qualification: solution.qualification,
    });
    const found = response.data?.images || [];
    if (!found.length) setError("No verified open educational image was found for this question.");
    setImages(found); setLoading(false);
  };

  const current = images[index];
  if (current) return <figure className="rounded-xl border border-emerald-200 bg-card p-3"><img src={current.image_url} onError={() => index + 1 < images.length ? setIndex(index + 1) : setError("The source image is temporarily unavailable.")} alt={current.alt_text} className="w-full rounded-lg object-contain" /><figcaption className="mt-2 space-y-1 text-xs text-muted-foreground"><p>{current.description}</p><p><a href={current.source_page_url} target="_blank" rel="noreferrer" className="font-semibold text-emerald-700 underline">{current.source}</a> · {current.licence}</p><p>{current.attribution}</p></figcaption></figure>;
  return <div><button onClick={search} disabled={loading} className="w-full rounded-lg border border-emerald-600 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 disabled:opacity-50">{loading ? "Searching trusted sources…" : "Find open-source visual"}</button>{error && <p className="mt-2 text-xs text-amber-700">{error}</p>}</div>;
}