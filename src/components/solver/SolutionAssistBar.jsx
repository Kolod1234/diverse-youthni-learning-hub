import React from 'react';
import { Sparkles, Eye } from 'lucide-react';

/**
 * Action bar placed above each provided past-paper solution. Reminds learners
 * they can highlight any sentence, step or equation to trigger "Explain this",
 * and provides direct "Explain this" and "Visualise this" controls.
 */
export default function SolutionAssistBar({ onExplain, onVisualise, visualiseOpen = false }) {
  return (
    <div
      data-no-explain
      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3.5 py-2"
    >
      <p className="text-xs text-slate-600">
        <span className="font-semibold text-indigo-900">Tip:</span> Highlight any step, sentence or equation below for{' '}
        <span className="font-semibold text-orange-700">Explain this</span> or{' '}
        <span className="font-semibold text-indigo-700">Visualise this</span>.
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onExplain}
          className="inline-flex items-center gap-1.5 rounded-lg border border-orange-300 bg-white px-2.5 py-1.5 text-xs font-semibold text-orange-800 shadow-sm transition hover:bg-orange-50"
        >
          <Sparkles className="h-3.5 w-3.5 text-orange-500" />
          Explain this
        </button>
        <button
          type="button"
          onClick={onVisualise}
          aria-pressed={visualiseOpen}
          className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold shadow-sm transition ${
            visualiseOpen
              ? 'border-indigo-600 bg-indigo-600 text-white'
              : 'border-indigo-300 bg-white text-indigo-800 hover:bg-indigo-50'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          {visualiseOpen ? 'Hide visual' : 'Visualise this'}
        </button>
      </div>
    </div>
  );
}