import React, { useState, useRef, useEffect } from 'react';
import {
  Bold, Italic, Underline, Strikethrough, Link as LinkIcon, Link2Off,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Palette, Highlighter, Heading1, Heading2, Heading3,
  Subscript, Superscript, RemoveFormatting, ChevronDown,
  IndentIncrease, IndentDecrease, CaseUpper, CaseLower, CaseSensitive,
  Type as TypeIcon, Plus, Minus,
} from 'lucide-react';
import SymbolPalette from './SymbolPalette';
import FontFamilyPicker from './FontFamilyPicker';

// Rich inline toolbar for any text-y block. All actions go through the
// editable ref's helpers so selection is preserved (mouseDown.preventDefault
// keeps focus inside the contenteditable while the button is clicked).
//
// Persistence model:
//   - bold/italic/underline/strike/foreColor/links use execCommand
//   - sub/sup/highlight use semantic wrappers (<sub>, <sup>, <mark>) saved
//     by InlineEditable.wrapSelection / toggleWrap
//   - case commands transform the selected text in place
//   - alignment / indent / line-height set styles on the containing block
//   - clearFormatting strips inline tags including <a>, <sub>, <sup>, <mark>

const TEXT_COLORS = ['#1F2937', '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#0EA5E9', '#000000', '#FFFFFF'];
const HIGHLIGHT_COLORS = ['#FEF3C7', '#DBEAFE', '#DCFCE7', '#FCE7F3', '#FEE2E2', '#E0E7FF', 'transparent'];
// Font families are now sourced from the shared `fontFamilies` module and
// rendered by the searchable, grouped FontFamilyPicker component below.
// The local 5-item list previously declared here is intentionally removed.
const FONT_SIZES = [
  { label: '12', value: '12px' }, { label: '14', value: '14px' },
  { label: '16', value: '16px' }, { label: '18', value: '18px' },
  { label: '20', value: '20px' }, { label: '24', value: '24px' },
  { label: '28', value: '28px' }, { label: '32', value: '32px' },
  { label: '40', value: '40px' }, { label: '48', value: '48px' },
];
const LINE_HEIGHTS = [
  { label: 'Tight', value: '1.2' },
  { label: 'Normal', value: '1.6' },
  { label: 'Relaxed', value: '1.8' },
  { label: 'Loose', value: '2.2' },
];

// ── case helpers ────────────────────────────────────────────────────────────
const toTitleCase = (s) =>
  s.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());

export default function InlineToolbar({
  editableRef,
  // Backwards-compatible flags (kept so existing block call sites don't break).
  showAlignment = true,
  showColors = true,
  showLinks = true,
  showSizes = true,
  showHeadings = true,
  showCase = true,
  showSub = true,
  showLineHeight = true,
  showIndent = true,
  showFontFamily = true,
  showClear = true,
  showSymbols = true,
  compact = false,
}) {
  // Every command first asks the editor to restore the user's saved
  // selection. This survives the picker open/close cycle even when the
  // browser briefly moves focus into the popover panel.
  const restore = () => editableRef.current?.restoreSelection?.();
  const fire = (cmd, arg) => { restore(); editableRef.current?.format(cmd, arg); };
  const style = (prop, value) => { restore(); editableRef.current?.styleBlock?.(prop, value); };
  const toggle = (tag) => { restore(); editableRef.current?.toggleWrap?.(tag); };
  const wrap = (tag, attrs) => { restore(); editableRef.current?.wrapSelection?.(tag, attrs); };
  const transform = (fn) => { restore(); editableRef.current?.transformSelection?.(fn); };
  const unwrap = (tags) => { restore(); editableRef.current?.unwrapAncestor?.(tags); };

  // Step the selected text through FONT_SIZES (Increase / Decrease font).
  const stepFontSize = (delta) => {
    restore();
    // Try to read the computed size at the start of the selection so we
    // know where to step from. Falls back to the middle entry.
    let current = null;
    try {
      const el = editableRef.current?.el?.();
      const sel = window.getSelection?.();
      if (el && sel && sel.rangeCount > 0) {
        const r = sel.getRangeAt(0);
        let node = r.startContainer;
        if (node && node.nodeType === 3) node = node.parentNode;
        if (node && el.contains(node)) {
          const cs = window.getComputedStyle(node);
          const px = parseFloat(cs.fontSize);
          if (Number.isFinite(px)) current = `${Math.round(px)}px`;
        }
      }
    } catch { /* ignore */ }
    const idx = FONT_SIZES.findIndex(s => s.value === current);
    const startIdx = idx >= 0 ? idx : FONT_SIZES.findIndex(s => s.value === '16px');
    const next = Math.max(0, Math.min(FONT_SIZES.length - 1, startIdx + delta));
    wrap('span', { style: `font-size:${FONT_SIZES[next].value}` });
  };

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 mb-1.5 bg-white border border-gray-200 rounded-md shadow-sm px-1 py-1"
      role="toolbar"
      aria-label="Text formatting"
      onMouseDown={(e) => {
        // Click-on-padding must not steal focus from the editor.
        if (e.target === e.currentTarget) e.preventDefault();
      }}
    >
      {/* Headings */}
      {showHeadings && (
        <>
          <ToolBtn label="Paragraph" onClick={() => fire('formatBlock', 'p')}>
            <span className="text-[10px] font-semibold">P</span>
          </ToolBtn>
          <ToolBtn label="Heading 1" onClick={() => fire('formatBlock', 'h1')}><Heading1 className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn label="Heading 2" onClick={() => fire('formatBlock', 'h2')}><Heading2 className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn label="Heading 3" onClick={() => fire('formatBlock', 'h3')}><Heading3 className="w-3.5 h-3.5" /></ToolBtn>
          <Divider />
        </>
      )}

      {/* Font family — searchable, grouped, scrollable picker (46 fonts).
          Preserves selection (mouseDown.preventDefault inside) and writes the
          chosen CSS stack via execCommand('fontName') so it round-trips
          through sanitiseInline (font-family is in ALLOWED_CSS) and reloads
          via htmlToBlocks unchanged. */}
      {showFontFamily && (
        <FontFamilyPicker onPick={(v) => fire('fontName', v || 'inherit')} />
      )}
      {showSizes && (
        <>
          <Picker
            label="Font size"
            icon={<span className="text-[10px] font-semibold">Aa</span>}
            ariaLabel="Font size"
            items={FONT_SIZES}
            onPick={(v) => {
              // execCommand fontSize only accepts 1-7. Use a span style instead.
              wrap('span', { style: `font-size:${v}` });
            }}
            renderItem={(it) => <span className="text-sm">{it.label}px</span>}
            width="w-28"
          />
          <ToolBtn label="Increase font size" onClick={() => stepFontSize(+1)}>
            <span className="inline-flex items-center text-[11px] font-semibold leading-none">A<Plus className="w-2.5 h-2.5 -mt-1" /></span>
          </ToolBtn>
          <ToolBtn label="Decrease font size" onClick={() => stepFontSize(-1)}>
            <span className="inline-flex items-center text-[11px] font-semibold leading-none">A<Minus className="w-2.5 h-2.5 -mt-1" /></span>
          </ToolBtn>
        </>
      )}
      {(showFontFamily || showSizes) && <Divider />}

      {/* B / I / U / S */}
      <ToolBtn label="Bold (Ctrl+B)"      onClick={() => fire('bold')}><Bold className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn label="Italic (Ctrl+I)"    onClick={() => fire('italic')}><Italic className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn label="Underline (Ctrl+U)" onClick={() => fire('underline')}><Underline className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn label="Strikethrough"      onClick={() => fire('strikeThrough')}><Strikethrough className="w-3.5 h-3.5" /></ToolBtn>

      {/* Sub / Sup */}
      {showSub && (
        <>
          <ToolBtn label="Subscript"   onClick={() => toggle('sub')}><Subscript className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn label="Superscript" onClick={() => toggle('sup')}><Superscript className="w-3.5 h-3.5" /></ToolBtn>
        </>
      )}

      {/* Symbol palette — inserts a Unicode glyph at the caret */}
      {showSymbols && (
        <SymbolPalette onInsert={(ch) => fire('insertText', ch)} />
      )}
      <Divider />

      {/* Colours */}
      {showColors && (
        <>
          <ColorPicker
            label="Text colour"
            icon={<Palette className="w-3.5 h-3.5" />}
            colors={TEXT_COLORS}
            onPick={(c) => fire('foreColor', c)}
          />
          <ColorPicker
            label="Highlight colour"
            icon={<Highlighter className="w-3.5 h-3.5" />}
            colors={HIGHLIGHT_COLORS}
            includeNone
            onPick={(c) => {
              // "No colour" → remove an existing <mark> wrapping the selection,
              // leaving all other inline formatting intact. Other colours →
              // wrap in a sanitiser-safe <mark> with a background-color style.
              if (!c || c === 'transparent') {
                unwrap('mark');
                return;
              }
              wrap('mark', { style: `background-color:${c}; padding:0 2px; border-radius:2px;` });
            }}
          />
        </>
      )}

      {/* Links */}
      {showLinks && (
        <LinkControl
          onAdd={(url) => fire('createLink', url)}
          onRemove={() => fire('unlink')}
        />
      )}
      <Divider />

      {/* Case */}
      {showCase && (
        <>
          <ToolBtn label="UPPERCASE"  onClick={() => transform((t) => t.toUpperCase())}><CaseUpper className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn label="lowercase"  onClick={() => transform((t) => t.toLowerCase())}><CaseLower className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn label="Title Case" onClick={() => transform(toTitleCase)}><CaseSensitive className="w-3.5 h-3.5" /></ToolBtn>
          <Divider />
        </>
      )}

      {/* Alignment */}
      {showAlignment && (
        <>
          <ToolBtn label="Align left"    onClick={() => style('text-align', 'left')}><AlignLeft className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn label="Align center"  onClick={() => style('text-align', 'center')}><AlignCenter className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn label="Align right"   onClick={() => style('text-align', 'right')}><AlignRight className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn label="Justify"       onClick={() => style('text-align', 'justify')}><AlignJustify className="w-3.5 h-3.5" /></ToolBtn>
        </>
      )}

      {/* Indent */}
      {showIndent && (
        <>
          <ToolBtn label="Decrease indent" onClick={() => fire('outdent')}><IndentDecrease className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn label="Increase indent" onClick={() => fire('indent')}><IndentIncrease className="w-3.5 h-3.5" /></ToolBtn>
        </>
      )}

      {/* Line height */}
      {showLineHeight && (
        <Picker
          label="Line spacing"
          icon={<span className="text-[10px] font-semibold">↕</span>}
          ariaLabel="Line spacing"
          items={LINE_HEIGHTS}
          onPick={(v) => style('line-height', v)}
          renderItem={(it) => <span className="text-sm">{it.label} ({it.value})</span>}
          width="w-40"
        />
      )}

      {/* Clear */}
      {showClear && (
        <>
          <Divider />
          <ToolBtn
            label="Clear formatting"
            onClick={() => editableRef.current?.clearFormatting?.()}
          >
            <RemoveFormatting className="w-3.5 h-3.5" />
          </ToolBtn>
        </>
      )}
    </div>
  );
}

// ── tiny UI primitives ────────────────────────────────────────────────────────
function ToolBtn({ children, label, onClick, disabled }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      disabled={disabled}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="h-7 min-w-[28px] px-1.5 inline-flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded disabled:opacity-40 focus:outline-none focus:ring-2 focus:ring-indigo-300"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="inline-block w-px h-5 bg-gray-200 mx-0.5" />;
}

// Generic dropdown picker. Closes on outside click + Escape, keyboard accessible.
function Picker({ label, icon, ariaLabel, items, onPick, renderItem, width = 'w-40' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClose(ref, () => setOpen(false));
  useEscapeClose(open, () => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <ToolBtn label={label} onClick={() => setOpen((o) => !o)}>
        <span className="flex items-center gap-0.5">{icon}<ChevronDown className="w-2.5 h-2.5" /></span>
      </ToolBtn>
      {open && (
        <div
          role="listbox"
          aria-label={ariaLabel}
          className={`absolute top-full left-0 z-30 mt-1 bg-white border border-gray-200 rounded-md shadow-lg py-1 ${width} max-h-64 overflow-auto`}
          onMouseDown={(e) => e.preventDefault()}
        >
          {items.map((it) => (
            <button
              key={it.value || it.label}
              type="button"
              role="option"
              // preventDefault on mousedown keeps the editor's selection
              // alive across the click — without this some browsers
              // collapse the range before onClick fires and font-size /
              // highlight commands silently no-op.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onPick(it.value); setOpen(false); }}
              className="block w-full text-left px-3 py-1.5 text-sm hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none"
            >
              {renderItem ? renderItem(it) : it.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ColorPicker({ label, icon, colors, onPick, includeNone = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClose(ref, () => setOpen(false));
  useEscapeClose(open, () => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <ToolBtn label={label} onClick={() => setOpen((o) => !o)}>{icon}</ToolBtn>
      {open && (
        <div
          className="absolute top-full left-0 z-30 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2 flex flex-wrap gap-1 w-44"
          onMouseDown={(e) => e.preventDefault()}
        >
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={c === 'transparent' ? 'No colour' : `Colour ${c}`}
              className="w-6 h-6 rounded-full border border-gray-300 hover:scale-110 transition-transform"
              style={{ background: c === 'transparent' ? 'repeating-linear-gradient(45deg,#fff,#fff 3px,#ddd 3px,#ddd 6px)' : c }}
              // Preserve selection across the click — see Picker note.
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => { onPick(c); setOpen(false); }}
            />
          ))}
          {includeNone && null /* "transparent" already included above */}
        </div>
      )}
    </div>
  );
}

function LinkControl({ onAdd, onRemove }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState('');
  const ref = useRef(null);
  useOutsideClose(ref, () => setOpen(false));
  useEscapeClose(open, () => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <ToolBtn label="Insert link" onClick={() => setOpen((o) => !o)}><LinkIcon className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn label="Remove link" onClick={onRemove}><Link2Off className="w-3.5 h-3.5" /></ToolBtn>
      {open && (
        <div
          className="absolute top-full left-0 z-30 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-2 flex gap-1"
          onMouseDown={(e) => e.preventDefault()}
        >
          <input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); if (url) onAdd(url); setUrl(''); setOpen(false); }
            }}
            placeholder="https://…"
            className="text-xs px-2 py-1 border rounded w-56 focus:outline-none focus:ring-2 focus:ring-indigo-300"
          />
          <button
            type="button"
            className="text-xs px-2 py-1 bg-indigo-600 text-white rounded"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => { if (url) onAdd(url); setUrl(''); setOpen(false); }}
          >Add</button>
        </div>
      )}
    </div>
  );
}

// ── hooks ────────────────────────────────────────────────────────────────────
function useOutsideClose(ref, onClose) {
  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [ref, onClose]);
}

function useEscapeClose(open, onClose) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
}