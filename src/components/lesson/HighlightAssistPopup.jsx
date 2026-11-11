import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Sparkles, X, StickyNote, ArrowDownWideNarrow, Image as ImageIcon, Maximize2, Minimize2 } from 'lucide-react';
import { toast } from 'sonner';
import AssistantCheckQuestion from '@/components/lesson/AssistantCheckQuestion';
import MathText from '@/components/lesson/MathText';
import ExplainVisualChart from '@/components/lesson/ExplainVisualChart';
import ExplainMathsBreakdown from '@/components/lesson/ExplainMathsBreakdown';
import ExplainFollowUpChat from '@/components/lesson/ExplainFollowUpChat';
import ExplainAskButton from '@/components/lesson/ExplainAskButton';
import { LEVELS, requestExplanation } from '@/components/lesson/explainHighlight';

/**
 * Popup shown when a learner highlights lesson text. It explains the highlight
 * in extremely simple micro-steps, can simplify further on request, adds a
 * visual (an instant chart when numbers help, or an AI-drawn diagram), can be
 * expanded to a larger reading view, and lets the learner discuss any part
 * of the highlight with the tutor.
 */
export default function HighlightAssistPopup({ selection, lessonTitle, onClose, onSaveToNotes }) {
  const [level, setLevel] = useState(0);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [focus, setFocus] = useState(null);
  const requestRef = useRef(0);

  useEffect(() => {
    setExplanation(null);
    setImage(null);
    setFocus(null);
    explain(0);
    return () => { requestRef.current += 1; };
  }, [selection.text, lessonTitle]);

  const explain = async (nextLevel) => {
    const requestId = ++requestRef.current;
    setLoading(true);
    setLevel(nextLevel);
    try {
      const result = await requestExplanation({ text: selection.text, lessonTitle, level: nextLevel });
      if (requestId === requestRef.current) setExplanation(result);
    } catch {
      if (requestId === requestRef.current) toast.error('The explanation could not be created. Please try again.');
    } finally {
      if (requestId === requestRef.current) setLoading(false);
    }
  };

  const generateDiagram = async () => {
    setImageLoading(true);
    try {
      const visual = explanation?.visual || {};
      const result = await base44.integrations.Core.GenerateImage({
        prompt: `Clean, simple educational textbook diagram for a school lesson. Flat vector illustration style, plain white background, crisp lines, clear readable English labels with neat leader lines, muted professional colours, no watermark, no clutter, no photorealism. It should show: ${visual.drawing_brief || visual.title || selection.text.slice(0, 300)}. The lesson topic is: ${selection.text.slice(0, 300)}.`
      });
      setImage(result.url);
    } catch {
      toast.error('The picture could not be drawn. Please try again.');
    } finally {
      setImageLoading(false);
    }
  };

  const saveToNotes = () => {
    if (!explanation) return;
    const visual = explanation.visual;
    const lines = [
      `Highlighted: "${selection.text}"`,
      ...explanation.steps.map((step, index) => `${index + 1}. ${step}`),
      `In short: ${explanation.summary}`,
      ...(visual?.caption ? [`Picture idea: ${visual.caption}`] : [])
    ].join('\n');
    onSaveToNotes(lines);
    toast.success('Saved to your page notes');
  };

  const visual = explanation?.visual;
  const hasChart = visual?.kind === 'graph' && visual?.series?.length > 0;
  const wantsDiagram = visual?.kind === 'diagram';

  const width = Math.min(380, window.innerWidth - 24);
  const top = Math.min(Math.max(selection.bottom + 10, 84), window.innerHeight - 460);
  const left = Math.min(Math.max(selection.x - width / 2, 12), Math.max(window.innerWidth - width - 12, 12));
  const position = expanded
    ? { top: '5vh', left: '50%', transform: 'translateX(-50%)', width: 'min(880px, 94vw)' }
    : { top, left, width };

  return (
    <>
      {expanded && (
        <div className="fixed inset-0 z-[94] bg-slate-900/40" onClick={() => setExpanded(false)} aria-hidden="true" />
      )}
      <div
        style={position}
        className={`fixed z-[95] overflow-y-auto rounded-xl border border-slate-200 bg-white text-slate-800 shadow-2xl ${expanded ? 'max-h-[90vh] p-6' : 'max-h-[72vh] p-4'}`}
        data-no-swipe
        role="dialog"
        aria-label="Explain this"
      >
        <div className="mb-3 flex items-start justify-between gap-2">
          <p className={`flex items-center gap-2 font-bold text-[#0b1b32] ${expanded ? 'text-base' : 'text-sm'}`}>
            <Sparkles className="h-4 w-4 text-orange-500" /> Explain this
          </p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setExpanded(value => !value)}
              className="rounded-md p-1 text-slate-500 hover:bg-slate-100"
              aria-label={expanded ? 'Shrink explanation' : 'Expand explanation'}
              title={expanded ? 'Shrink' : 'Expand'}
            >
              {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>
            <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-slate-100" aria-label="Close explanation">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <MathText
          className={`mb-3 rounded-lg bg-slate-50 p-2 italic text-slate-600 ${expanded ? 'text-sm leading-6' : 'line-clamp-4 text-xs leading-5'}`}
          text={`“${selection.text}”`}
        />

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
            <ol className={`list-decimal space-y-2 pl-5 ${expanded ? 'text-base leading-7' : 'text-sm leading-6'}`}>
              {explanation.steps.map((step, index) => (
                <li key={index}>
                  <MathText inline text={step} />
                  <ExplainAskButton label={`step ${index + 1}`} onClick={() => setFocus({ label: `step ${index + 1}`, text: step })} />
                </li>
              ))}
            </ol>

            {explanation.maths_breakdown && (
              <ExplainMathsBreakdown breakdown={explanation.maths_breakdown} onAsk={setFocus} />
            )}

            {(hasChart || wantsDiagram) && (
              <div className="rounded-lg border border-slate-200 bg-white p-2">
                <p className="mb-1 text-xs font-bold text-slate-700">{visual.title || 'Picture to help you see it'}</p>
                {hasChart ? (
                  <>
                    <ExplainVisualChart chart={visual} />
                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      {visual.x_label && <span>Across (x): {visual.x_label} · </span>}
                      {visual.y_label && <span>Up (y): {visual.y_label}</span>}
                    </p>
                  </>
                ) : image ? (
                  <img src={image} alt={visual.title || 'Diagram explaining the highlighted text'} className="w-full rounded-md" />
                ) : (
                  <button
                    type="button"
                    onClick={generateDiagram}
                    disabled={imageLoading}
                    className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-indigo-300 bg-indigo-50 px-3 text-xs font-semibold text-indigo-800 hover:bg-indigo-100 disabled:opacity-60"
                  >
                    {imageLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
                    {imageLoading ? 'Drawing the picture…' : 'Show me a picture'}
                  </button>
                )}
                {visual.caption && <div className="mt-1 text-[11px] leading-5 text-slate-500"><MathText text={visual.caption} /></div>}
              </div>
            )}

            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-6 text-emerald-900">
              <span className="font-semibold">In short: </span><MathText inline text={explanation.summary} />
            </div>
            {explanation.key_terms?.length > 0 && (
              <ul className="space-y-1 text-xs leading-6 text-slate-600">
                {explanation.key_terms.map(term => (
                  <li key={term.term}><span className="font-semibold text-slate-800">{term.term}: </span><MathText inline text={term.meaning} /></li>
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
              <AssistantCheckQuestion
                selectedText={selection.text}
                lessonTitle={lessonTitle}
                taughtExplanation={explanation ? [explanation.summary, ...explanation.steps].join(' ') : null}
              />
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

        {/* Kept outside the loading state so the conversation survives "simplify". */}
        {explanation && (
          <div className="mt-3">
            <ExplainFollowUpChat
              key={selection.text}
              selectionText={selection.text}
              lessonTitle={lessonTitle}
              explanation={explanation}
              level={level}
              focus={focus}
              onFocusChange={setFocus}
            />
          </div>
        )}
      </div>
    </>
  );
}