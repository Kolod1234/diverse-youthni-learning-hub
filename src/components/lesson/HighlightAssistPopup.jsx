import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Sparkles, X, StickyNote, ArrowDownWideNarrow, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import AssistantCheckQuestion from '@/components/lesson/AssistantCheckQuestion';
import MathText from '@/components/lesson/MathText';
import ExplainVisualChart from '@/components/lesson/ExplainVisualChart';

const LEVELS = [
  { label: 'Very simple English', instruction: 'Explain in extremely simple English that anyone can follow: only short everyday words, very short sentences, one idea at a time, and a comparison to normal daily life (like cooking, games, journeys or money). If you must use a harder word, immediately explain it in simple brackets. Never assume any school knowledge.' },
  { label: 'Simpler still', instruction: 'Explain as you would to a young child: tiny everyday words only, playful everyday comparisons, and no technical words at all.' },
  { label: 'Assume nothing', instruction: 'Assume the learner has no prior knowledge at all. Start from the very first idea and build up slowly, defining every single word that is not everyday English.' }
];

/**
 * Popup shown when a learner highlights lesson text. It explains the highlight
 * in extremely simple micro-steps, can simplify further on request, and adds a
 * visual: an instant chart when numbers help, or an AI-drawn diagram otherwise.
 */
export default function HighlightAssistPopup({ selection, lessonTitle, onClose, onSaveToNotes }) {
  const [level, setLevel] = useState(0);
  const [explanation, setExplanation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [image, setImage] = useState(null);
  const [imageLoading, setImageLoading] = useState(false);
  const requestRef = useRef(0);

  useEffect(() => {
    setExplanation(null);
    setImage(null);
    explain(0);
    return () => { requestRef.current += 1; };
  }, [selection.text, lessonTitle]);

  const explain = async (nextLevel) => {
    const requestId = ++requestRef.current;
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
- Explain the ENTIRE highlighted text, even if it is long — do not stop after the first sentence or idea. Use up to eight steps if the highlight needs them.
- The highlighted text may contain LaTeX maths written between single dollar signs, such as $8-(-3)$. Keep all maths in that same $...$ LaTeX form in your steps, summary and key terms. Never write maths as plain text like "x^2" or "1/2" when a proper LaTeX form exists.
- Break the explanation into short micro-steps: one single action or idea per step.
- State the reason BEFORE any algebra, calculation or technical move.
- Never chain two calculations into one step.
- Keep each step to one or two short sentences.
- Finish with a one-line plain-English summary.
- If the highlighted text contains an equation, formula, calculation or any mathematical notation, also fill in maths_breakdown:
  - equation: the main equation or formula, written in LaTeX between single dollar signs.
  - symbol_meanings: EVERY symbol or term in that equation, each with its meaning in plain everyday words. The "symbol" field is the bare LaTeX symbol with no dollar signs around it (for example "\\theta" or "v"); the "meaning" field explains it in plain words.
  - worked_steps: work the maths through in tiny steps. Each step states ONE single move in plain words first (why you do it), then shows the result in LaTeX between single dollar signs. Show EVERY intermediate line — never skip, merge or jump ahead. If the highlight only states a formula, apply it to one simple worked example using values consistent with the highlight, saying each substitution separately.
  - check_line: one plain-English sentence checking the final result makes sense (right size, right units, sensible).
  - If there is no equation or formula, leave maths_breakdown out entirely.
- Then decide whether a picture would make this much easier to understand:
  - If a graph or chart of numbers would help (for example a trend, a relationship between two things, or a comparison), set visual.kind to "graph" and provide a small chart: chart_type ("line", "bar" or "scatter"), x_label, y_label, and series with 3-6 numbered points each. Use realistic values consistent with the highlighted text.
  - Otherwise, if a labelled diagram or sketch would help the learner see what is happening (an object, a process, a structure or a cycle), set visual.kind to "diagram" and write a detailed drawing_brief describing exactly what to draw, what to label and any arrows.
  - If no picture would genuinely help, set visual.kind to "none". Do not force a picture onto a purely word-based idea.`,
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
            },
            visual: {
              type: 'object',
              properties: {
                kind: { type: 'string', enum: ['none', 'graph', 'diagram'] },
                title: { type: 'string' },
                caption: { type: 'string' },
                drawing_brief: { type: 'string' },
                chart_type: { type: 'string', enum: ['line', 'bar', 'scatter'] },
                x_label: { type: 'string' },
                y_label: { type: 'string' },
                series: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      name: { type: 'string' },
                      points: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: { x: { type: 'number' }, y: { type: 'number' } },
                          required: ['x', 'y']
                        }
                      }
                    },
                    required: ['name', 'points']
                  }
                }
              }
            },
            maths_breakdown: {
              type: 'object',
              properties: {
                equation: { type: 'string' },
                symbol_meanings: { type: 'array', items: { type: 'object', properties: { symbol: { type: 'string' }, meaning: { type: 'string' } }, required: ['symbol', 'meaning'] } },
                worked_steps: { type: 'array', items: { type: 'string' } },
                check_line: { type: 'string' }
              }
            }
          },
          required: ['steps', 'summary']
        }
      });
      if (requestId === requestRef.current) setExplanation(result);
    } catch (error) {
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

  const top = Math.min(Math.max(selection.bottom + 10, 84), window.innerHeight - 460);
  const left = Math.min(Math.max(selection.x - 195, 12), Math.max(window.innerWidth - 392, 12));

  return (
    <div
      style={{ top, left, width: 380 }}
      className="fixed z-[95] max-h-[72vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-4 text-slate-800 shadow-2xl"
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

      <MathText className="mb-3 line-clamp-4 rounded-lg bg-slate-50 p-2 text-xs italic leading-5 text-slate-600" text={`“${selection.text}”`} />

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
            {explanation.steps.map((step, index) => <li key={index}><MathText text={step} /></li>)}
          </ol>

          {explanation.maths_breakdown && (
            <div className="rounded-lg border border-sky-200 bg-sky-50 p-3">
              <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.14em] text-sky-700">The maths, bit by bit</p>
              <div className="rounded-md bg-white p-2 text-center text-base">
                <MathText text={explanation.maths_breakdown.equation} />
              </div>
              {explanation.maths_breakdown.symbol_meanings?.length > 0 && (
                <ul className="mt-2 space-y-1 text-xs leading-6 text-sky-900">
                  {explanation.maths_breakdown.symbol_meanings.map(item => (
                    <li key={item.symbol}>
                      <MathText text={`$${item.symbol}$`} /> — <MathText text={item.meaning} />
                    </li>
                  ))}
                </ul>
              )}
              {explanation.maths_breakdown.worked_steps?.length > 0 && (
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-xs leading-6 text-sky-900">
                  {explanation.maths_breakdown.worked_steps.map((step, index) => <li key={index}><MathText text={step} /></li>)}
                </ol>
              )}
              {explanation.maths_breakdown.check_line && (
                <p className="mt-2 text-xs italic text-sky-800"><MathText text={explanation.maths_breakdown.check_line} /></p>
              )}
            </div>
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
              {visual.caption && <p className="mt-1 text-[11px] leading-5 text-slate-500"><MathText text={visual.caption} /></p>}
            </div>
          )}

          <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs leading-6 text-emerald-900">
            <span className="font-semibold">In short: </span><MathText text={explanation.summary} />
          </div>
          {explanation.key_terms?.length > 0 && (
            <ul className="space-y-1 text-xs leading-6 text-slate-600">
              {explanation.key_terms.map(term => (
                <li key={term.term}><span className="font-semibold text-slate-800">{term.term}: </span><MathText text={term.meaning} /></li>
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
    </div>
  );
}