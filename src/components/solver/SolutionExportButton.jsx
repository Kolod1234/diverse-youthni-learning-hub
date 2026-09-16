import { useState } from "react";
import { Download } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function SolutionExportButton({ solutions, subject, qualification }) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState("");

  const download = async () => {
    setExporting(true); setError("");
    try {
      const response = await base44.functions.invoke("exportPastPaperSolution", {
        subject, qualification,
        solutions: solutions.map((item) => ({
          number: item.number, question: item.question || item.text,
          marks: item.marks, answer: item.answer,
        })),
      });
      const binary = atob(response.data.base64);
      const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
      const url = URL.createObjectURL(new Blob([bytes], { type: "application/pdf" }));
      const link = document.createElement("a");
      link.href = url; link.download = response.data.filename; link.click();
      URL.revokeObjectURL(url);
    } catch { setError("PDF export failed. Please try again."); }
    finally { setExporting(false); }
  };

  return <div className="flex flex-col items-end gap-1">
    <button onClick={download} disabled={exporting} className="flex items-center gap-1.5 rounded-lg border border-white/40 bg-white/15 px-3 py-1.5 text-xs font-semibold text-white hover:bg-white/25 disabled:opacity-60">
      <Download className="h-4 w-4" />{exporting ? "Creating PDF…" : "Export PDF"}
    </button>
    {error && <span className="text-xs text-red-100">{error}</span>}
  </div>;
}