import React from 'react';
import { MessageCircle } from 'lucide-react';

// Small "Ask" pill placed after a step so the learner can discuss that exact part.
export default function ExplainAskButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={`Ask a question about ${label}`}
      aria-label={`Ask a question about ${label}`}
      className="ml-1 inline-flex items-center gap-1 rounded-full border border-indigo-200 bg-white px-1.5 py-0.5 align-middle text-[10px] font-semibold text-indigo-700 hover:bg-indigo-50"
    >
      <MessageCircle className="h-3 w-3" /> Ask
    </button>
  );
}