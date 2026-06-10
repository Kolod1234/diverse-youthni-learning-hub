import React from 'react';
import { ZoomIn, ZoomOut, Maximize, Check, Loader2, AlertCircle } from 'lucide-react';

/**
 * WorkspaceStatusBar
 * ------------------
 * Bottom status strip with:
 *  - slide N of M
 *  - zoom controls: Fit / 50% / 75% / 100% / +/-
 *  - honest save status: Draft · Saving · Saved · Save failed
 *
 * The "honest" save status mirrors the parent's existing semantics — it does
 * NOT invent a persistence event. Statuses provided are the same the editor
 * already exposes:
 *   - isPersisted     true after a real Lesson entity write
 *   - isPending       true while the save mutation is in-flight
 *   - hasError        true after a failed save mutation
 *   - isDirty         true when there are local draft edits not yet sent
 */
const ZOOM_PRESETS = [
  { value: 'fit', label: 'Fit' },
  { value: 0.5,   label: '50%' },
  { value: 0.75,  label: '75%' },
  { value: 1,     label: '100%' },
];

export default function WorkspaceStatusBar({
  slideIndex = 0,
  slideCount = 0,
  zoom = 'fit',
  onZoomChange,
  isPersisted = false,
  isPending = false,
  hasError = false,
  isDirty = false,
}) {
  const onPreset = (v) => onZoomChange?.(v);
  const onStep = (dir) => {
    if (zoom === 'fit') return onZoomChange?.(dir > 0 ? 0.75 : 0.5);
    const next = Math.min(2, Math.max(0.25, +(zoom + dir * 0.1).toFixed(2)));
    onZoomChange?.(next);
  };

  let status;
  if (isPending) {
    status = (
      <span className="inline-flex items-center gap-1.5 text-slate-600">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        Saving…
      </span>
    );
  } else if (hasError) {
    status = (
      <span className="inline-flex items-center gap-1.5 text-red-600">
        <AlertCircle className="w-3.5 h-3.5" />
        Save failed
      </span>
    );
  } else if (isDirty) {
    status = (
      <span className="inline-flex items-center gap-1.5 text-amber-700">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        {isPersisted ? 'Unsaved changes' : 'Draft — not yet saved'}
      </span>
    );
  } else if (isPersisted) {
    status = (
      <span className="inline-flex items-center gap-1.5 text-emerald-700">
        <Check className="w-3.5 h-3.5" />
        Saved
      </span>
    );
  } else {
    status = <span className="text-slate-500">Draft — not yet saved</span>;
  }

  const zoomLabel = zoom === 'fit' ? 'Fit' : `${Math.round(zoom * 100)}%`;

  return (
    <div className="flex items-center justify-between gap-3 px-3 h-8 bg-white border-t border-slate-200 text-[11px] text-slate-600">
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-medium text-slate-700">
          {slideCount > 0
            ? `Slide ${Math.min(slideIndex + 1, slideCount)} of ${slideCount}`
            : 'No slides'}
        </span>
        <span className="hidden sm:inline text-slate-300">·</span>
        <span className="hidden sm:inline">{status}</span>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          type="button"
          onClick={() => onStep(-1)}
          title="Zoom out"
          aria-label="Zoom out"
          className="w-6 h-6 inline-flex items-center justify-center rounded hover:bg-slate-100 text-slate-600"
        >
          <ZoomOut className="w-3.5 h-3.5" />
        </button>

        <div className="flex items-center gap-0.5 px-1">
          {ZOOM_PRESETS.map((p) => {
            const active = p.value === zoom;
            return (
              <button
                key={String(p.value)}
                type="button"
                onClick={() => onPreset(p.value)}
                aria-pressed={active}
                title={`Zoom: ${p.label}`}
                className={[
                  'px-1.5 h-6 rounded text-[11px] font-medium',
                  active ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100',
                ].join(' ')}
              >
                {p.label}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => onStep(1)}
          title="Zoom in"
          aria-label="Zoom in"
          className="w-6 h-6 inline-flex items-center justify-center rounded hover:bg-slate-100 text-slate-600"
        >
          <ZoomIn className="w-3.5 h-3.5" />
        </button>

        <span className="hidden md:inline text-slate-400 ml-1 tabular-nums">{zoomLabel}</span>

        <button
          type="button"
          onClick={() => onPreset('fit')}
          title="Fit slide to screen"
          aria-label="Fit slide to screen"
          className="w-6 h-6 inline-flex items-center justify-center rounded hover:bg-slate-100 text-slate-600 ml-1"
        >
          <Maximize className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}