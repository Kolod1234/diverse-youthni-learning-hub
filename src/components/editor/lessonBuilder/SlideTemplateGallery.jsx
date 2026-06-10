import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { X, Search, LayoutTemplate } from 'lucide-react';
import { NATIVE_TEMPLATES, TEMPLATE_CATEGORIES } from './nativeTemplates';
import { blocksToHtml } from './htmlSerializer';

/**
 * SlideTemplateGallery
 * --------------------
 * Full-slide template picker for the WorkspaceShell "Templates" ribbon command.
 *
 * Distinct from `TemplateBlocks` (which inserts small block snippets into the
 * current slide). This dialog lets the tutor REPLACE the current slide with a
 * full native-block template (Blog article, Three-column editorial, etc.). The
 * template body is rendered through `blocksToHtml` so the resulting HTML
 * carries canonical `data-lesson-block` markers — `htmlToBlocks` then rebuilds
 * the same native blocks on reload, keeping every field individually editable.
 *
 * Renders into a body-level portal so it sits above the workspace ribbon and
 * Lesson Settings sheet without z-index conflicts.
 */

// Single shared portal target on body — re-used between modal openings.
function getPortalTarget() {
  if (typeof document === 'undefined') return null;
  let el = document.getElementById('slide-template-gallery-root');
  if (!el) {
    el = document.createElement('div');
    el.id = 'slide-template-gallery-root';
    document.body.appendChild(el);
  }
  return el;
}

export default function SlideTemplateGallery({ open, onClose, onApply }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');

  // Lock body scroll while open + close on Escape. Cleaned up on close.
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
      }
    };
    document.addEventListener('keydown', onKey, true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const categories = useMemo(() => ['All', ...TEMPLATE_CATEGORIES], []);

  // Filter by category + search. Search matches both name and category.
  const visibleTemplates = useMemo(() => {
    const entries = Object.entries(NATIVE_TEMPLATES);
    const lowerSearch = searchTerm.trim().toLowerCase();
    return entries.filter(([_, t]) => {
      const matchesCategory = activeCategory === 'All' || t.category === activeCategory;
      const matchesSearch = !lowerSearch
        || t.name.toLowerCase().includes(lowerSearch)
        || (t.category || '').toLowerCase().includes(lowerSearch);
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchTerm]);

  if (!open) return null;
  const target = getPortalTarget();
  if (!target) return null;

  // Pick a template → serialise its native block tree to canonical HTML and
  // hand back to the parent. Parent decides whether to confirm-replace or
  // apply directly.
  const handlePick = (key) => {
    const tpl = NATIVE_TEMPLATES[key];
    if (!tpl) return;
    const html = blocksToHtml(tpl.buildBlocks());
    onApply?.(html, tpl.name);
    onClose?.();
  };

  // Inline z-index above MUI modals (1300) and any transform stacking ctx.
  const OVERLAY_Z = 2147483000;

  const stop = (e) => e.stopPropagation();

  const dialog = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Slide template gallery"
      onMouseDown={stop}
      onClick={stop}
      onTouchStart={stop}
      style={{ position: 'fixed', inset: 0, zIndex: OVERLAY_Z }}
      className="bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[88vh] flex flex-col overflow-hidden"
        onClick={stop}
      >
        {/* Header */}
        <div className="border-b border-slate-200 p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                <LayoutTemplate className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Slide templates</h2>
                <p className="text-sm text-slate-500">
                  Pick a layout to replace the current slide. Every field stays editable.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close slide template gallery"
              className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-900 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search + category chips */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="search"
                placeholder="Search templates…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1 sm:m-0 sm:p-0">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs font-medium whitespace-nowrap px-3 py-1.5 rounded-full border transition-colors ${
                    activeCategory === cat
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Grid of templates */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-50">
          {visibleTemplates.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Search className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="text-sm">No templates match your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {visibleTemplates.map(([key, t]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handlePick(key)}
                  title={`Apply ${t.name}`}
                  className="group h-32 bg-white border-2 border-slate-200 rounded-xl hover:border-indigo-400 hover:shadow-md flex flex-col items-center justify-center gap-2 p-3 text-center transition-all focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <span className="text-3xl leading-none group-hover:scale-110 transition-transform">
                    {t.icon || '📄'}
                  </span>
                  <span className="text-xs font-semibold text-slate-700 leading-tight">
                    {t.name}
                  </span>
                  {t.category && (
                    <span className="text-[10px] uppercase tracking-wide text-slate-400">
                      {t.category}
                    </span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-slate-200 px-5 py-3 bg-white">
          <p className="text-xs text-slate-500">
            {visibleTemplates.length} template{visibleTemplates.length !== 1 ? 's' : ''} ·
            {' '}Replacing a non-empty slide will ask for confirmation first.
          </p>
        </div>
      </div>
    </div>
  );

  return createPortal(dialog, target);
}