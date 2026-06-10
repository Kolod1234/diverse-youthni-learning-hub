import React from 'react';
import { ChevronDown, ChevronUp, FileText } from 'lucide-react';

/**
 * WorkspaceNotes
 * ---------------
 * Shallow collapsible speaker-notes strip under the canvas.
 *
 * Persistence model:
 *   • Notes are stored as `slide.notes` (string) on the existing slide
 *     object. The Lesson schema declares `slides` as a free-form array of
 *     objects with named properties for title/content/order; additional
 *     keys are stored verbatim and ignored by every existing reader
 *     (htmlSerializer, LessonPlayer, FullscreenPresenter, etc.).
 *   • No schema migration is required.
 *
 * Edit path:
 *   • Notes textarea writes via `onChange(notes)` which the parent maps
 *     onto the active slide object through its existing `updateSlide`
 *     helper — same path used by `title` and `content`.
 *
 * Collapse state is ephemeral and lives in the workspace shell, never
 * persisted.
 */
export default function WorkspaceNotes({
  open,
  onToggle,
  value,
  onChange,
  slideNumber,
}) {
  return (
    <div className="bg-white border-t border-slate-200">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls="workspace-notes-body"
        className="w-full flex items-center justify-between gap-2 px-3 py-1.5 text-left hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
      >
        <span className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700">
          <FileText className="w-3.5 h-3.5 text-slate-500" />
          Speaker notes
          {slideNumber != null && (
            <span className="text-slate-400 font-normal">· Slide {slideNumber}</span>
          )}
        </span>
        {open ? <ChevronDown className="w-3.5 h-3.5 text-slate-500" /> : <ChevronUp className="w-3.5 h-3.5 text-slate-500" />}
      </button>
      {open && (
        <div id="workspace-notes-body" className="px-3 pb-3">
          <textarea
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder="Add speaker notes for this slide — only shown to the presenter."
            className="w-full h-20 px-3 py-2 text-sm text-slate-800 border border-slate-200 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
          />
        </div>
      )}
    </div>
  );
}