import React, { useState, useRef, useEffect } from 'react';
import { GripVertical, Copy, Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import SlashMenu from './SlashMenu';
import { blockTypeLabel } from './blockTypes';

// Per-block chrome: drag handle, duplicate/delete/collapse, "+ add below" menu.
// The grip is also the drag handle exposed by @hello-pangea/dnd.
export default function BlockWrapper({
  index, block, dragHandleProps, isDragging,
  focused, onFocus,
  onDuplicate, onDelete, onMove, onToggleCollapse, onAddBelow,
  children,
}) {
  const [addOpen, setAddOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!addOpen) return;
    const onDown = (e) => { if (!containerRef.current?.contains(e.target)) setAddOpen(false); };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [addOpen]);

  return (
    <div
      ref={containerRef}
      className={`group relative rounded-lg transition-shadow ${focused ? 'ring-2 ring-indigo-200' : 'ring-1 ring-transparent hover:ring-gray-200'} ${isDragging ? 'shadow-xl bg-white' : ''}`}
      onMouseDown={onFocus}
    >
      {/* Left rail: drag, add */}
      <div className="absolute -left-9 top-1 hidden group-hover:flex md:flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => setAddOpen(o => !o)}
          aria-label="Add block below"
          title="Add block below"
          className="w-6 h-6 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700 flex items-center justify-center"
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

      {/* Right rail: actions */}
      <div className="absolute right-1 top-1 hidden group-hover:flex opacity-0 group-hover:opacity-100 transition-opacity gap-0.5 z-10">
        <BlockBtn label="Move up"    onClick={() => onMove(-1)}><ChevronUp className="w-3.5 h-3.5" /></BlockBtn>
        <BlockBtn label="Move down"  onClick={() => onMove(1)}><ChevronDown className="w-3.5 h-3.5" /></BlockBtn>
        <BlockBtn label={block.collapsed ? 'Expand' : 'Collapse'} onClick={onToggleCollapse}>
          <span className="text-[10px] font-bold">{block.collapsed ? '+' : '–'}</span>
        </BlockBtn>
        <BlockBtn label="Duplicate"  onClick={onDuplicate}><Copy className="w-3.5 h-3.5" /></BlockBtn>
        <BlockBtn label="Delete"     onClick={onDelete} danger><Trash2 className="w-3.5 h-3.5" /></BlockBtn>
      </div>

      <div className="px-3 py-2">
        {block.collapsed ? (
          <div className="text-xs text-gray-500 italic">
            {blockTypeLabel(block.type)} <span className="text-gray-400">(collapsed)</span>
          </div>
        ) : children}
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
      className={`w-6 h-6 rounded bg-white/90 border border-gray-200 backdrop-blur-sm flex items-center justify-center transition-colors ${
        danger ? 'text-red-500 hover:bg-red-50 hover:border-red-200' : 'text-gray-500 hover:bg-gray-100'
      }`}
    >
      {children}
    </button>
  );
}