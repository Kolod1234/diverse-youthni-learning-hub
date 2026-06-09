import React, { useEffect, useRef, useState } from 'react';
import { BLOCK_GROUPS } from './blockTypes';

// Compact "Add block" picker. Used in two places:
//  1. Inline +/slash menu between blocks (compact, keyboard nav).
//  2. Empty-state large picker (handled in VisualLessonBuilder directly).
export default function SlashMenu({ open, onClose, onPick, anchorClassName = '' }) {
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery(''); setActive(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [open]);

  if (!open) return null;

  const flat = BLOCK_GROUPS.flatMap(g => g.items.map(i => ({ ...i, group: g.label })));
  const matches = query
    ? flat.filter(i =>
        i.name.toLowerCase().includes(query.toLowerCase()) ||
        i.keywords?.some(k => k.includes(query.toLowerCase())))
    : flat;

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-xl w-72 overflow-hidden ${anchorClassName}`} role="dialog" aria-label="Add block">
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => { setQuery(e.target.value); setActive(0); }}
        onKeyDown={(e) => {
          if (e.key === 'Escape') { e.preventDefault(); onClose(); }
          else if (e.key === 'ArrowDown') { e.preventDefault(); setActive(a => Math.min(a + 1, matches.length - 1)); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(a => Math.max(a - 1, 0)); }
          else if (e.key === 'Enter' && matches[active]) { e.preventDefault(); onPick(matches[active].type); }
        }}
        placeholder="Search blocks…"
        className="w-full px-3 py-2 text-sm border-b border-gray-100 outline-none"
        aria-label="Search blocks"
      />
      <div className="max-h-72 overflow-y-auto py-1" role="listbox">
        {matches.length === 0 && (
          <div className="px-3 py-4 text-xs text-gray-500 text-center">No blocks match "{query}"</div>
        )}
        {matches.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              type="button"
              role="option"
              aria-selected={idx === active}
              onMouseEnter={() => setActive(idx)}
              onClick={() => onPick(item.type)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-left text-sm ${idx === active ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700 hover:bg-gray-50'}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 truncate">{item.name}</span>
              <span className="text-[10px] text-gray-400 uppercase tracking-wide">{item.group}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}