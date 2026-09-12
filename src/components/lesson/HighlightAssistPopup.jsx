import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Sparkles, X, StickyNote, ArrowDownWideNarrow } from 'lucide-react';
import { toast } from 'sonner';
import AssistantCheckQuestion from '@/components/lesson/AssistantCheckQuestion';

const LEVELS = [
  { label: 'Plain English', instruction: 'Explain at the level of a capable GCSE/A-Level student, keeping correct terminology but defining it.' },
  { label: 'Simpler', instruction: 'Explain as you would to a bright 10-year-old, using everyday comparisons instead of technical words.' },
  { label: 'Assume nothing', instruction: 'Assume the learner has no prior knowledge at all. Start from the very first idea and build up slowly, defining every single word that is not everyday English.' }
];

/**
 * Popup shown when a learner highlights lesson text. It explains the highlight
 * as ADHD-friendly micro-steps and can simplify further on request.
 */
export default function HighlightAssistPopup({ selection, lessonTitle, onClose, onSaveToNotes }) {
  const [level, setLevel] = useState(0);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLevel(0);
    setExplanation(null);
  }, [selection?.text]);

  const explain = async (nextLevel) => {
    setLoading(true);
    setLevel(nextLevel);
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a patient tutor helping a learner with the lesson "${lessonTitle}".

They highlighted this text and want it explained:
"""${selection.text}"""

${LEVELS[nextLevel].instruction}

Rules:
- British English spelling throughout.
- Break the explanation into short micro-steps: one single action or idea per step.
- State the reason BEFORE any algebra, calculation or technical move.
- Never chain two calculations into one step.
- Keep each step to one or two short sentences.
- Finish with a one-line plain-English summary.`,
        response_json_schema: {
          type: 'object',
          properties: {
            steps: { type: 'array', items: { type: 'string' } },
            summary: { type: 'string' },
            key_terms: {
              type: 'array',
              items: {
                type: 'object',
                properties: { term: { type: 'string' }, meaning: { type: 'string' } },
                required: ['term', 'meaning']
              }
            }
          },
          required: ['steps', 'summary']
        }
      });
      setExplanation(result);
    } catch (error) {
      toast.error('The explanation could not be created. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveToNotes = () => {
    if (!explanation) return;
    const lines = [
      `Highlighted: "${selection.text}"`,
      ...explanation.steps.map((step, index) => `${index + 1}. ${step}`),
      `In short: ${explanation.summary}`
    ].join('\n');
    onSaveToNotes(lines);
    toast.success('Saved to your page notes');
  };

  const top = Math.min(Math.max(selection.bottom + 10, 84), window.innerHeight - 340);
  const left = Math.min(Math.max(selection.x - 170, 12), Math.max(window.innerWidth - 352, 12));

  return (
    <div
      style={{ top, left, width: 340 }}
      className="fixed z-[95] max-h-[62vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 text-slate-800 shadow-2xl"
      data-no-swipe
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="flex items-center gap-2 text-sm font-bold text-[#0b1b32]">
          <Sparkles className="h-4 w-4 text-orange-500" /> Explain this
        </p>
        <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close explanation">
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mb-3 line-clamp-3 rounded-lg bg-slate-50 p-2 text-xs italic leading-5 text-slate-600">“{selection.text}”</p>

      {!explanation && !loading && (
        <button
          type="button"
          onClick={() => explain(0)}
          className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 text-sm font-bold text-[#071326] hover:bg-orange-400"
        >
          <Sparkles className="h-4 w-4" /> Break it into steps
        </button>
      )}

      {loading && (
        <p className="flex items-center gap-2 py-4 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Working through it step by step…
        </p>
      )}

      {explanation && !loading && (
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">{LEVELS[level].label}</p>
          <ol className="list-decimal space-y-2 pl-5 text-sm leading-6">
            {explanation.steps.map((step, index) => <li key={index}>{step}</li>)}
          </ol>
          <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-6 text-emerald-900">
            <span className="font-semibold">In short:</span> {explanation.summary}
          </p>
          {explanation.key_terms?.length > 0 && (
            <ul className="space-y-1 text-xs leading-6 text-slate-600">
              {explanation.key_terms.map(term => (
                <li key={term.term}><span className="font-semibold text-slate-800">{term.term}:</span> {term.meaning}</li>
              ))}
            </ul>
          )}

          <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-3">
            {level < LEVELS.length - 1 && (
              <button
                type="button"
                onClick={() => explain(level + 1)}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-orange-300 bg-orange-50 px-3 text-xs font-semibold text-orange-800 hover:bg-orange-100"
              >
                <ArrowDownWideNarrow className="h-4 w-4" /> Still confused — simplify
              </button>
            )}
            <AssistantCheckQuestion selectedText={selection.text} lessonTitle={lessonTitle} />
            {onSaveToNotes && (
              <button
                type="button"
                onClick={saveToNotes}
                className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                <StickyNote className="h-4 w-4" /> Save to notes
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}