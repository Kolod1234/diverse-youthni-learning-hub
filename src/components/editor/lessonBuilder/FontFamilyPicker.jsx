import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Type as TypeIcon, ChevronDown, Search, Check } from 'lucide-react';
import { groupedFontFamilies, injectFontStylesheet } from './fontFamilies';

// Searchable, grouped, scrollable font family picker.
//
// Drop-in replacement for the previous <Picker> usage in InlineToolbar.
// - Each option renders in its own font (so authors see what they'll get).
// - Category headers (Sans / Serif / Display / Handwriting / Monospace).
// - Live filter input — searches by label.
// - Cap menu height (max-h-80) with internal scroll.
// - Selection preserved: mouseDown on every interactive element calls
//   preventDefault so the contenteditable keeps focus + selection.
// - Keyboard: Arrow up/down to move, Enter to apply, Escape to close.
// - Touch-friendly tap targets (py-2 = 32px+ row).
//
// Loads the Google Fonts stylesheet once on mount (idempotent) so previewed
// rows display the actual font face. The same call site is also invoked
// from PreviewModal / LessonPlayer so the live render matches.

export default function FontFamilyPicker({ value, onPick }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Inject web-font @import once. Cheap, idempotent.
  useEffect(() => { injectFontStylesheet(); }, []);

  // Outside click + escape to close.
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // Focus the search box when opening.
  useEffect(() => {
    if (open) {
      // Defer focus to next frame so the popover is mounted.
      requestAnimationFrame(() => inputRef.current?.focus());
      setActiveIdx(0);
    } else {
      setQuery('');
    }
  }, [open]);

  // Filter + flatten for keyboard navigation. We keep the grouped structure
  // for rendering, but maintain a flat ordered list of selectable items
  // (skipping group headers) for index-based highlight + Enter.
  const { groups, flatItems } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const grouped = groupedFontFamilies();
    const filteredGroups = [];
    const flat = [];
    for (const g of grouped) {
      const items = g.fonts.filter(f => !q || f.label.toLowerCase().includes(q));
      if (items.length) {
        filteredGroups.push({ category: g.category, fonts: items });
        items.forEach(f => flat.push(f));
      }
    }
    return { groups: filteredGroups, flatItems: flat };
  }, [query]);

  // Clamp active index when filter shrinks the list.
  useEffect(() => {
    if (activeIdx >= flatItems.length) setActiveIdx(Math.max(0, flatItems.length - 1));
  }, [flatItems.length, activeIdx]);

  const selectedValue = (value || '').trim();

  const apply = (font) => {
    onPick?.(font.value);
    setOpen(false);
  };

  const onKeyNav = (e) => {
    if (!flatItems.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => Math.min(flatItems.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => Math.max(0, i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      apply(flatItems[activeIdx]);
    }
  };

  // Track which index each rendered item maps to so the active row gets the
  // visual highlight and can scroll into view.
  let runningIdx = -1;

  // Scroll the active row into view when it changes.
  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector(`[data-flat-idx="${activeIdx}"]`);
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [activeIdx, open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        title="Font family"
        aria-label="Font family"
        aria-haspopup="listbox"
        aria-expanded={open}
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen(o => !o)}
        className="h-7 min-w-[28px] px-1.5 inline-flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded focus:outline-none focus:ring-2 focus:ring-indigo-300"
      >
        <span className="flex items-center gap-0.5">
          <TypeIcon className="w-3.5 h-3.5" />
          <ChevronDown className="w-2.5 h-2.5" />
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Font family"
          className="absolute top-full left-0 z-30 mt-1 bg-white border border-gray-200 rounded-md shadow-lg w-64 flex flex-col"
          onMouseDown={(e) => e.preventDefault()}
        >
          {/* Search */}
          <div className="flex items-center gap-1 px-2 py-1.5 border-b border-gray-100">
            <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyNav}
              placeholder="Search fonts…"
              aria-label="Search fonts"
              className="flex-1 min-w-0 text-xs px-1 py-0.5 outline-none bg-transparent"
            />
          </div>

          {/* Scrollable list */}
          <div
            ref={listRef}
            className="max-h-80 overflow-auto py-1"
            onKeyDown={onKeyNav}
          >
            {groups.length === 0 && (
              <div className="px-3 py-4 text-center text-xs text-gray-500">No fonts found</div>
            )}
            {groups.map((g) => (
              <div key={g.category}>
                <div className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-widest text-gray-400 font-semibold">
                  {g.category}
                </div>
                {g.fonts.map((font) => {
                  runningIdx += 1;
                  const idx = runningIdx;
                  const isActive = idx === activeIdx;
                  const isSelected = (font.value || '').trim() === selectedValue;
                  return (
                    <button
                      key={font.label}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      data-flat-idx={idx}
                      onMouseEnter={() => setActiveIdx(idx)}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => apply(font)}
                      className={`w-full flex items-center justify-between gap-2 text-left px-3 py-2 text-sm transition-colors ${
                        isActive ? 'bg-indigo-50' : 'hover:bg-gray-50'
                      } ${isSelected ? 'text-indigo-700' : 'text-gray-800'}`}
                    >
                      <span
                        className="truncate"
                        style={{ fontFamily: font.value || 'inherit' }}
                      >
                        {font.label}
                      </span>
                      {isSelected && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}