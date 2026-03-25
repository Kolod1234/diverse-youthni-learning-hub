export default function ConfidenceBadge({ score }) {
  if (score == null) return null;

  const pct = Math.round(score);

  let colorClass, label, bg;
  if (pct >= 85) {
    colorClass = "text-green-700";
    bg = "bg-green-50 border-green-200";
    label = "High confidence";
  } else if (pct >= 60) {
    colorClass = "text-amber-700";
    bg = "bg-amber-50 border-amber-200";
    label = "Moderate confidence";
  } else {
    colorClass = "text-red-700";
    bg = "bg-red-50 border-red-200";
    label = "Low confidence — double-check this answer";
  }

  // Arc / progress bar width
  const barWidth = `${pct}%`;

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium ${bg} ${colorClass}`}>
      {/* Mini progress bar */}
      <div className="w-16 h-1.5 bg-white rounded-full overflow-hidden border border-current/20">
        <div
          className={`h-full rounded-full transition-all ${pct >= 85 ? "bg-green-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500"}`}
          style={{ width: barWidth }}
        />
      </div>
      <span>{pct}% — {label}</span>
    </div>
  );
}