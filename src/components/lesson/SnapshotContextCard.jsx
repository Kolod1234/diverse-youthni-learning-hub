import React, { useState } from 'react';
import { Camera, ChevronDown, ChevronUp } from 'lucide-react';

/**
 * Shows the learner exactly what the Learning Assistant can currently see.
 */
export default function SnapshotContextCard({ snapshot }) {
  const [expanded, setExpanded] = useState(false);
  if (!snapshot) return null;

  return (
    <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600">
      <button
        type="button"
        onClick={() => setExpanded(value => !value)}
        className="flex w-full items-center justify-between gap-2 text-left font-semibold text-slate-700"
      >
        <span className="flex items-center gap-2">
          <Camera className="h-4 w-4 text-orange-500" />
          Assistant is reading page {snapshot.pageNumber} of {snapshot.pageCount || 1}
        </span>
        {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>

      {expanded && (
        <dl className="mt-3 space-y-1.5 leading-5">
          <div><dt className="inline font-semibold">Page: </dt><dd className="inline">{snapshot.pageTitle || 'Untitled'}</dd></div>
          <div><dt className="inline font-semibold">Lesson: </dt><dd className="inline">{snapshot.lessonTitle}</dd></div>
          <div><dt className="inline font-semibold">This session: </dt><dd className="inline">{snapshot.pagesViewedThisSession} page(s), about {snapshot.minutesInLesson} min</dd></div>
          <div><dt className="inline font-semibold">Course progress: </dt><dd className="inline">{snapshot.courseProgressPercent}%</dd></div>
          {snapshot.learnerNote && (
            <div><dt className="inline font-semibold">Your notes: </dt><dd className="inline line-clamp-2">{snapshot.learnerNote}</dd></div>
          )}
        </dl>
      )}
    </div>
  );
}