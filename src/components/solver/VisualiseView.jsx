import React, { useState, useEffect, useRef } from 'react';
import { Loader2, Eye, RefreshCw, Image as ImageIcon, X } from 'lucide-react';
import MathText from '@/components/lesson/MathText';
import ExplainVisualChart from '@/components/lesson/ExplainVisualChart';
import { requestVisualisation, requestVisualDiagram } from '@/components/solver/visualiseContent';

/**
 * Interactive "Visualise this" view for a highlighted step or full past-paper
 * solution: combines a stage-by-stage visual flow, an interactive chart when
 * quantitative values apply, and a clean labelled textbook diagram.
 */
export default function VisualiseView({
  text,
  question = '',
  subject = '',
  qualification = '',
  imageUrl = '',
  compact = false,
  onClose,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [diagramUrl, setDiagramUrl] = useState('');
  const [drawing, setDrawing] = useState(false);
  const [diagramError, setDiagramError] = useState('');
  const reqRef = useRef(0);

  const drawDiagram = async (brief, requestId) => {
    if (!brief) return;
    setDrawing(true);
    setDiagramError('');
    try {
      const url = await requestVisualDiagram({ brief, text, question, subject, qualification, imageUrl });
      if (requestId === reqRef.current) setDiagramUrl(url);
    } catch {
      if (requestId === reqRef.current) setDiagramError('The diagram could not be drawn right now. Try Regenerate.');
    } finally {
      if (requestId === reqRef.current) setDrawing(false);
    }
  };

  const load = async () => {
    const requestId = ++reqRef.current;
    setLoading(true);
    setError('');
    setData(null);
    setDiagramUrl('');
    setDiagramError('');
    try {
      const res = await requestVisualisation({ text, question, subject, qualification });
      if (requestId !== reqRef.current) return;
      setData(res);
      setLoading(false);
      if (res?.diagram_brief) drawDiagram(res.diagram_brief, requestId);
    } catch {
      if (requestId === reqRef.current) {
        setError('Could not build the visual breakdown. Please try again.');
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    if (text) load();
    return () => { reqRef.current += 1; };
  }, [text, question, subject, qualification]);

  const hasChart = data?.chart?.kind === 'graph' && data?.chart?.series?.length > 0;

  return (
    <div data-no-explain className={compact ? 'space-y-3' : 'rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 space-y-4'}>
      {!compact && (
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-2 text-sm font-bold text-indigo-950">
            <Eye className="h-4 w-4 text-indigo-600" />
            Visualise this{data?.title ? ` — ${data.title}` : ''}
          </p>
          {onClose && (
            <button type="button" onClick={onClose} className="rounded-md p-1 text-slate-500 hover:bg-white" aria-label="Close visual">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}

      {loading && (
        <p className="flex items-center gap-2 py-4 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
          Building visual breakdown…
        </p>
      )}

      {error && !loading && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800 flex items-center justify-between gap-2">
          <span>{error}</span>
          <button type="button" onClick={load} className="rounded-md bg-rose-700 px-2.5 py-1 font-semibold text-white">Retry</button>
        </div>
      )}

      {data && !loading && (
        <>
          {compact && data.title && <p className="text-xs font-bold text-indigo-950">{data.title}</p>}

          <div className="rounded-lg border border-indigo-200 bg-white p-3 text-xs leading-6 text-slate-700">
            <span className="font-semibold text-indigo-900">Key visual idea: </span>
            <MathText inline text={data.summary} />
          </div>

          {hasChart && (
            <div className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="mb-1.5 text-xs font-bold text-slate-800">{data.chart.title || 'Interactive graph'}</p>
              <ExplainVisualChart chart={data.chart} />
              <p className="mt-1 text-[11px] text-slate-500">
                {data.chart.x_label && <span>Across (x): {data.chart.x_label} · </span>}
                {data.chart.y_label && <span>Up (y): {data.chart.y_label}</span>}
              </p>
              {data.chart.caption && <div className="mt-1 text-[11px] text-slate-600"><MathText text={data.chart.caption} /></div>}
            </div>
          )}

          {data.visual_steps?.length > 0 && (
            <div className="space-y-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Step-by-step visual flow</p>
              <div className={`grid gap-2 ${!compact && data.visual_steps.length >= 3 ? 'sm:grid-cols-2' : ''}`}>
                {data.visual_steps.map((step, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-bold text-white">
                        {idx + 1}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{step.stage_label}</span>
                    </div>
                    <div className="text-xs leading-5 text-slate-700"><MathText text={step.detail} /></div>
                    {step.key_expression && (
                      <div className="mt-2 rounded-md border border-indigo-100 bg-indigo-50/70 px-2.5 py-1.5 text-xs font-medium text-indigo-950">
                        <MathText text={step.key_expression} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-lg border border-slate-200 bg-white p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <ImageIcon className="h-3.5 w-3.5 text-indigo-600" />
                Labelled textbook diagram
              </span>
              {data.diagram_brief && (
                <button
                  type="button"
                  onClick={() => drawDiagram(data.diagram_brief, reqRef.current)}
                  disabled={drawing}
                  className="inline-flex items-center gap-1 rounded-md border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 disabled:opacity-50"
                >
                  <RefreshCw className={`h-3 w-3 ${drawing ? 'animate-spin' : ''}`} />
                  {diagramUrl ? 'Regenerate' : 'Draw diagram'}
                </button>
              )}
            </div>
            {drawing && !diagramUrl ? (
              <p className="flex items-center gap-2 py-6 justify-center text-xs text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin text-indigo-600" />
                Drawing labelled diagram…
              </p>
            ) : diagramUrl ? (
              <img src={diagramUrl} alt={data.title || 'Labelled explanatory diagram'} className="mx-auto max-h-80 w-full rounded-lg object-contain" />
            ) : diagramError ? (
              <p className="text-xs text-amber-700">{diagramError}</p>
            ) : null}

            {data.what_to_notice?.length > 0 && (
              <div className="mt-2.5 border-t border-slate-100 pt-2">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">What to look for</p>
                <ul className="list-disc space-y-1 pl-4 text-xs leading-5 text-slate-700">
                  {data.what_to_notice.map((point, idx) => (
                    <li key={idx}><MathText inline text={point} /></li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}