import React, { useState, useRef, useEffect, useId } from 'react';
import { GripVertical, Copy, Trash2, ChevronUp, ChevronDown, Plus, Pencil, Check } from 'lucide-react';
import SlashMenu from './SlashMenu';
import { blockTypeLabel } from './blockTypes';

// Per-block chrome: drag handle, duplicate/delete/legacy-collapse, "+ add below"
// menu, plus an accordion-style Edit/Done toggle. The Edit/Done state is
// EPHEMERAL UI state owned by VisualLessonBuilder — it is never written into
// block.collapsed or slide.content, so blocksToHtml/htmlToBlocks output is
// completely unaffected. Only one block may be "expanded" at a time; expanding
// another block collapses this one (handled by the parent).
//
// Children are always rendered so the lesson canvas keeps showing the actual
// content / media preview. The `expanded` prop is passed down via React context
// so each block-type renderer can gate its InlineToolbar and advanced controls.
export const BlockExpandedContext = React.createContext(false);

export default function BlockWrapper({
  index, block, dragHandleProps, isDragging,
  focused, onFocus,
  onDuplicate, onDelete, onMove, onToggleCollapse, onAddBelow,
  expanded = false, onToggleExpand, onRequestExpand,
  children,
}) {
  const [addOpen, setAddOpen] = useState(false);
  const containerRef = useRef(null);
  const panelId = useId();
  const toggleId = useId();

  useEffect(() => {
    if (!addOpen) return;
    const onDown = (e) => { if (!containerRef.current?.contains(e.target)) setAddOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [addOpen]);

  // Escape collapses the expanded block — but only if no toolbar popover (font /
  // size / colour / link / symbols) inside this block is open, so the popover
  // can close itself first. Popovers render with role="listbox" or role="dialog"
  // (SymbolPalette + Picker / ColorPicker / LinkControl). We probe for any of
  // these inside our subtree before collapsing.
  useEffect(() => {
    if (!expanded) return;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      const root = containerRef.current;
      if (!root) return;
      const popoverOpen = !!root.querySelector('[role="listbox"], [role="dialog"]');
      if (popoverOpen) return; // let the popover handle its own Escape
      // Only react when focus is actually somewhere inside this block.
      if (!root.contains(document.activeElement)) return;
      e.preventDefault();
      onToggleExpand?.();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [expanded, onToggleExpand]);

  // Click anywhere on the content area (not on the chrome rails / toggle)
  // requests expansion. We use mousedown so it fires before focus shifts.
  const handleContentMouseDown = (e) => {
    onFocus?.();
    if (!expanded) onRequestExpand?.();
  };

  return (
    <div
      ref={containerRef}
      className={`group relative rounded-lg transition-shadow motion-reduce:transition-none ${focused || expanded ? 'ring-2 ring-indigo-200' : 'ring-1 ring-transparent hover:ring-gray-200'} ${isDragging ? 'shadow-xl bg-white' : ''}`}
    >
      {/* Left rail: drag, add */}
      <div className="absolute -left-9 top-1 hidden group-hover:flex md:flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity motion-reduce:transition-none">
        <button
          type="button"
          onClick={() => setAddOpen(o => !o)}
          aria-label="Add block below"
          title="Add block below"
          className="w-6 h-6 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-indigo-300"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
        <div
          {...dragHandleProps}
          className="w-6 h-6 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
          title="Drag to reorder"
          role="button"
          tabIndex={0}
        >
          <GripVertical className="w-3.5 h-3.5" />
        </div>
      </div>

      {/* Header row — always visible. Carries the block label, Edit/Done
          accordion toggle, and the existing move/duplicate/delete actions. */}
      <div className="flex items-center gap-1 px-3 pt-2">
        <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold mr-auto select-none">
          {block.type === 'legacy-html' ? '' : blockTypeLabel(block.type)}
        </span>

        <button
          id={toggleId}
          type="button"
          onClick={onToggleExpand}
          aria-expanded={expanded}
          aria-controls={panelId}
          aria-label={expanded ? `Done editing ${blockTypeLabel(block.type)} block` : `Edit ${blockTypeLabel(block.type)} block`}
          className={`inline-flex items-center gap-1 h-7 px-2 rounded text-xs font-medium border transition-colors motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
            expanded
              ? 'bg-indigo-600 border-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
          }`}
        >
          {expanded ? (<><Check className="w-3 h-3" /> Done</>) : (<><Pencil className="w-3 h-3" /> Edit</>)}
          {expanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
        </button>

        <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
          <BlockBtn label="Move up"    onClick={() => onMove(-1)}><ChevronUp className="w-3.5 h-3.5" /></BlockBtn>
          <BlockBtn label="Move down"  onClick={() => onMove(1)}><ChevronDown className="w-3.5 h-3.5" /></BlockBtn>
          <BlockBtn label="Duplicate"  onClick={onDuplicate}><Copy className="w-3.5 h-3.5" /></BlockBtn>
          <BlockBtn label="Delete"     onClick={onDelete} danger><Trash2 className="w-3.5 h-3.5" /></BlockBtn>
        </div>
      </div>

      {/* Body — content/media preview always visible. We provide the expanded
          flag via context so leaf renderers (paragraph, image-text, table…)
          can decide whether to show their formatting toolbar / advanced
          controls. The legacy block.collapsed flag still hides everything if
          the user used the old +/– chrome. */}
      <div
        id={panelId}
        role="region"
        aria-labelledby={toggleId}
        className="px-3 pb-2 pt-1"
        onMouseDownCapture={handleContentMouseDown}
      >
        {block.collapsed ? (
          <div className="text-xs text-gray-500 italic">
            {blockTypeLabel(block.type)} <span className="text-gray-400">(collapsed)</span>
            <button
              type="button"
              onClick={onToggleCollapse}
              className="ml-2 text-indigo-600 hover:underline"
            >Show</button>
          </div>
        ) : (
          <BlockExpandedContext.Provider value={expanded}>
            {children}
          </BlockExpandedContext.Provider>
        )}
      </div>

      {addOpen && (
        <div className="absolute left-0 top-full z-20 mt-1">
          <SlashMenu
            open
            onClose={() => setAddOpen(false)}
            onPick={(t) => { onAddBelow(t); setAddOpen(false); }}
          />
        </div>
      )}
    </div>
  );
}

function BlockBtn({ children, label, onClick, danger }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      className={`w-6 h-6 rounded bg-white/90 border border-gray-200 backdrop-blur-sm flex items-center justify-center transition-colors motion-reduce:transition-none focus:outline-none focus:ring-2 focus:ring-indigo-300 ${
        danger ? 'text-red-500 hover:bg-red-50 hover:border-red-200' : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}