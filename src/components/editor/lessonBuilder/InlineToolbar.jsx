import React, { useState } from 'react';
import { Bold, Italic, Underline, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight, Palette, Type as TypeIcon } from 'lucide-react';

// Compact bubble toolbar shown above any inline-editable text block when focused.
// It delegates to document.execCommand via the editable ref's `format` helper,
// so all text blocks share one toolbar without duplicating logic.
const COLORS = ['#1F2937', '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];
const SIZES = [
  { label: 'S', value: '2' },
  { label: 'M', value: '4' },
  { label: 'L', value: '5' },
  { label: 'XL', value: '7' },
];

export default function InlineToolbar({
  editableRef,
  showAlignment = false,
  showColors = true,
  showLinks = true,
  showSizes = false,
}) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [colorOpen, setColorOpen] = useState(false);

  const fire = (cmd, arg) => editableRef.current?.format(cmd, arg);

  return (
    <div className="flex flex-wrap items-center gap-0.5 mb-1.5 bg-white border border-gray-200 rounded-md shadow-sm px-1 py-0.5" role="toolbar" aria-label="Text formatting">
      <ToolBtn label="Bold (Ctrl+B)" onClick={() => fire('bold')}><Bold className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn label="Italic (Ctrl+I)" onClick={() => fire('italic')}><Italic className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn label="Underline (Ctrl+U)" onClick={() => fire('underline')}><Underline className="w-3.5 h-3.5" /></ToolBtn>

      {showLinks && (
        <div className="relative">
          <ToolBtn label="Insert link" onClick={() => setLinkOpen(o => !o)}><LinkIcon className="w-3.5 h-3.5" /></ToolBtn>
          {linkOpen && (
            <div className="absolute top-full left-0 z-30 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2 flex gap-1">
              <input
                autoFocus
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://…"
                className="text-xs px-2 py-1 border rounded w-56"
              />
              <button
                className="text-xs px-2 py-1 bg-indigo-600 text-white rounded"
                onClick={() => {
                  if (linkUrl) fire('createLink', linkUrl);
                  setLinkUrl(''); setLinkOpen(false);
                }}
              >Add</button>
            </div>
          )}
        </div>
      )}

      {showColors && (
        <div className="relative">
          <ToolBtn label="Text colour" onClick={() => setColorOpen(o => !o)}><Palette className="w-3.5 h-3.5" /></ToolBtn>
          {colorOpen && (
            <div className="absolute top-full left-0 z-30 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-1.5 flex gap-1">
              {COLORS.map(c => (
                <button
                  key={c}
                  aria-label={`Color ${c}`}
                  className="w-5 h-5 rounded-full border border-gray-200"
                  style={{ background: c }}
                  onClick={() => { fire('foreColor', c); setColorOpen(false); }}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {showSizes && (
        <div className="flex items-center gap-0.5">
          {SIZES.map(s => (
            <ToolBtn key={s.value} label={`Size ${s.label}`} onClick={() => fire('fontSize', s.value)}>
              <span className="text-[10px] font-bold">{s.label}</span>
            </ToolBtn>
          ))}
        </div>
      )}

      {showAlignment && (
        <>
          <ToolBtn label="Align left"   onClick={() => fire('justifyLeft')}><AlignLeft className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn label="Align center" onClick={() => fire('justifyCenter')}><AlignCenter className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn label="Align right"  onClick={() => fire('justifyRight')}><AlignRight className="w-3.5 h-3.5" /></ToolBtn>
        </>
      )}
    </div>
  );
}

function ToolBtn({ children, label, onClick }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()} // keep editor focused
      onClick={onClick}
      className="h-6 min-w-[24px] px-1.5 inline-flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded"
    >
      {children}
    </button>
  );
}