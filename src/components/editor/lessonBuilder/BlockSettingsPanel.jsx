import React from 'react';
import { Settings2 } from 'lucide-react';
import { BlockExpandedContext } from './BlockWrapper';

// Lightweight "Block settings" container. Renders its children only when the
// owning BlockWrapper is in the expanded state. This is the single place
// where image/video/table/two-column advanced controls live, so the lesson
// preview above (the actual image, video, table, columns) is never hidden
// and there is never more than one large toolbar visible at a time.
//
// Reduced-motion users get an instant show/hide because the wrapper relies
// on conditional mounting rather than a height transition.
export default function BlockSettingsPanel({ label = 'Block settings', children, className = '' }) {
  const expanded = React.useContext(BlockExpandedContext);
  if (!expanded) return null;
  return (
    <div
      className={`mt-2 rounded-md border border-indigo-100 bg-indigo-50/40 px-2 py-2 ${className}`}
      role="group"
      aria-label={label}
    >
      <div className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-indigo-700 font-semibold mb-1.5">
        <Settings2 className="w-3 h-3" /> {label}
      </div>
      {children}
    </div>
  );
}

// Convenience hook for blocks that only need the boolean.
export function useBlockExpanded() {
  return React.useContext(BlockExpandedContext);
}