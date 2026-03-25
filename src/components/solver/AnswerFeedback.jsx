import { useState } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle2 } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AnswerFeedback({ solutionMeta }) {
  const [rating, setRating] = useState(null); // 'thumbs_up' | 'thumbs_down'
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showComment, setShowComment] = useState(false);

  const handleRate = (r) => {
    if (submitted) return;
    setRating(r);
    setShowComment(true);
  };

  const handleSubmit = async () => {
    if (!rating || saving) return;
    setSaving(true);
    try {
      await base44.entities.AIAnswerFeedback.create({
        question: solutionMeta.question?.slice(0, 500) || "",
        answer_snippet: solutionMeta.answer?.slice(0, 500) || "",
        subject: solutionMeta.subject,
        qualification: solutionMeta.qualification,
        mode: solutionMeta.mode,
        confidence_score: solutionMeta.confidenceScore ?? null,
        rating,
        comment: comment.trim() || null,
      });
      setSubmitted(true);
    } catch {
      // silently fail — feedback is non-critical
      setSubmitted(true);
    } finally {
      setSaving(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex items-center gap-2 text-green-600 text-sm py-1">
        <CheckCircle2 className="w-4 h-4" />
        <span>Thanks for your feedback!</span>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500 font-medium">Was this helpful?</span>
        <button
          onClick={() => handleRate("thumbs_up")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
            rating === "thumbs_up"
              ? "bg-green-50 border-green-400 text-green-700"
              : "border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600"
          }`}
        >
          <ThumbsUp className="w-3.5 h-3.5" />
          Yes
        </button>
        <button
          onClick={() => handleRate("thumbs_down")}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-sm font-medium transition-all ${
            rating === "thumbs_down"
              ? "bg-red-50 border-red-400 text-red-700"
              : "border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600"
          }`}
        >
          <ThumbsDown className="w-3.5 h-3.5" />
          No
        </button>
      </div>

      {showComment && (
        <div className="flex gap-2">
          <input
            type="text"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder={rating === "thumbs_down" ? "What was wrong? (optional)" : "Any other thoughts? (optional)"}
            className="flex-1 border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-all"
          >
            {saving ? "Saving…" : "Submit"}
          </button>
        </div>
      )}
    </div>
  );
}