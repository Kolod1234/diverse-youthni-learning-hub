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
export default function WorkspaceStatusBar({
  // New (preferred) prop names — used by PresentationWorkspace.
  slideIndex = 0,
  slideTotal,
  slideCount, // legacy alias
  zoomId,
  onZoomChange,   // (id) => void  — receives preset ID ('fit','50','75','100')
  onZoomStep,    // (dir) => void
  // Save state (PresentationWorkspace shape)
  saving = false,
  saveError = null,
  dirty = false,
  isPersisted = false,
}) {
  const totalCount = slideTotal != null ? slideTotal : (slideCount || 0);
  const activePresetId = zoomId || 'fit';
  const onPreset = (id) => onZoomChange?.(id);
  const onStep = (dir) => onZoomStep?.(dir);
  // Translate the PresentationWorkspace save shape into the StatusBar's
  // internal flags so the existing render branches keep working.
  const isPending = !!saving;
  const hasError = !!saveError;
  const isDirty = !!dirty;

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

  // Preset IDs (string) used everywhere now — matches useWorkspaceState.
  const PRESET_IDS = [
    { id: 'fit', label: 'Fit' },
    { id: '50', label: '50%' },
    { id: '75', label: '75%' },
    { id: '100', label: '100%' },
  ];
  const activeLabel = PRESET_IDS.find((p) => p.id === activePresetId)?.label || 'Fit';

  return (
    <div className="flex items-center justify-between gap-3 px-3 bg-white border-t border-slate-200 text-[11px] text-slate-600 shrink-0" style={{ height: 30 }}>
      <div className="flex items-center gap-3 min-w-0">
        <span className="font-medium text-slate-700 tabular-nums">
          {totalCount > 0
            ? `Slide ${Math.min(slideIndex + 1, totalCount)} of ${totalCount}`
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
          {PRESET_IDS.map((p) => {
            const active = p.id === activePresetId;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onPreset(p.id)}
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

        <span className="hidden md:inline text-slate-400 ml-1 tabular-nums">{activeLabel}</span>

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