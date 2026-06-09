import React, { useEffect, useRef, useState } from 'react';
import {
  Bold, Italic, Underline, Strikethrough,
  Link as LinkIcon, Link2Off,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Subscript, Superscript,
  Type, Palette, Highlighter,
  IndentIncrease, IndentDecrease,
  CaseUpper, CaseLower, CaseSensitive,
  Eraser, ChevronDown,
} from 'lucide-react';

// Rich-text formatting bubble shown above any inline-editable text block.
// All buttons delegate to editableRef.current.format(cmd, arg) — implemented
// in InlineEditable via formatCommands.applyFormat — so behaviour is
// consistent everywhere this toolbar is rendered.
//
// Selection preservation: every interactive element uses onMouseDown.preventDefault
// so the contenteditable never loses focus or its current selection when the
// tutor clicks a control or opens a popover.

const TEXT_COLORS = ['#111827', '#374151', '#4F46E5', '#2563EB', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#7C3AED'];
const HIGHLIGHT_COLORS = ['#FEF08A', '#BBF7D0', '#BFDBFE', '#FBCFE8', '#FED7AA', '#E9D5FF', 'transparent'];
const FONT_FAMILIES = [
  { label: 'Default', value: '' },
  { label: 'Sans', value: 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' },
  { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Mono', value: 'Menlo, Monaco, Consolas, monospace' },
  { label: 'Rounded', value: '"Nunito", system-ui, sans-serif' },
];
const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '40px', '48px'];
const LINE_HEIGHTS = [
  { label: 'Tight', value: '1.2' },
  { label: 'Normal', value: '1.5' },
  { label: 'Relaxed', value: '1.75' },
  { label: 'Loose', value: '2' },
];
const HEADING_LEVELS = [
  { label: 'Paragraph', value: 'p' },
  { label: 'Heading 1', value: 'h1' },
  { label: 'Heading 2', value: 'h2' },
  { label: 'Heading 3', value: 'h3' },
];

export default function InlineToolbar({
  editableRef,
  showAlignment = true,
  showColors = true,
  showLinks = true,
  showSizes = true,
  showHeadings = false,
  // Back-compat with old `showSizes`: when false we still show core controls.
}) {
  const [openMenu, setOpenMenu] = useState(null); // 'link'|'color'|'highlight'|'font'|'size'|'heading'|'spacing'|'case'
  const [linkUrl, setLinkUrl] = useState('');
  const rootRef = useRef(null);

  // Close any open popover when clicking outside the toolbar.
  useEffect(() => {
    if (!openMenu) return;
    const onDown = (e) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target)) setOpenMenu(null);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [openMenu]);

  const fire = (cmd, arg) => editableRef.current?.format(cmd, arg);
  const toggleMenu = (key) => setOpenMenu((cur) => (cur === key ? null : key));

  return (
    <div
      ref={rootRef}
      role="toolbar"
      aria-label="Text formatting"
      // Keep clicks on the toolbar from stealing selection from the editor.
      onMouseDown={(e) => e.preventDefault()}
      className="flex flex-wrap items-center gap-0.5 mb-1.5 bg-white border border-gray-200 rounded-md shadow-sm px-1 py-1"
    >
      {/* Heading / paragraph */}
      {showHeadings && (
        <Menu
          open={openMenu === 'heading'}
          onOpen={() => toggleMenu('heading')}
          label="Paragraph style"
          trigger={<span className="text-xs font-medium px-1">Style</span>}
        >
          <div className="flex flex-col py-1 min-w-[140px]">
            {HEADING_LEVELS.map(h => (
              <PopBtn key={h.value} onClick={() => { fire('heading', h.value); setOpenMenu(null); }}>
                {h.label}
              </PopBtn>
            ))}
          </div>
        </Menu>
      )}

      {/* Font family */}
      <Menu
        open={openMenu === 'font'}
        onOpen={() => toggleMenu('font')}
        label="Font family"
        trigger={<span className="text-xs px-1 inline-flex items-center gap-1"><Type className="w-3.5 h-3.5" /> Font <ChevronDown className="w-3 h-3 opacity-60" /></span>}
      >
        <div className="flex flex-col py-1 min-w-[160px]">
          {FONT_FAMILIES.map(f => (
            <PopBtn
              key={f.label}
              onClick={() => { fire('fontName', f.value); setOpenMenu(null); }}
              style={{ fontFamily: f.value || undefined }}
            >
              {f.label}
            </PopBtn>
          ))}
        </div>
      </Menu>

      {/* Font size */}
      {showSizes && (
        <Menu
          open={openMenu === 'size'}
          onOpen={() => toggleMenu('size')}
          label="Font size"
          trigger={<span className="text-xs px-1 inline-flex items-center gap-1">Size <ChevronDown className="w-3 h-3 opacity-60" /></span>}
        >
          <div className="grid grid-cols-2 gap-0.5 py-1 min-w-[140px]">
            {FONT_SIZES.map(s => (
              <PopBtn key={s} onClick={() => { fire('fontSizePx', s); setOpenMenu(null); }}>
                <span style={{ fontSize: s }}>{s}</span>
              </PopBtn>
            ))}
          </div>
        </Menu>
      )}

      <Divider />

      <ToolBtn label="Bold (Ctrl+B)" onClick={() => fire('bold')}><Bold className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn label="Italic (Ctrl+I)" onClick={() => fire('italic')}><Italic className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn label="Underline (Ctrl+U)" onClick={() => fire('underline')}><Underline className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn label="Strikethrough" onClick={() => fire('strikeThrough')}><Strikethrough className="w-3.5 h-3.5" /></ToolBtn>

      <ToolBtn label="Subscript" onClick={() => fire('subscript')}><Subscript className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn label="Superscript" onClick={() => fire('superscript')}><Superscript className="w-3.5 h-3.5" /></ToolBtn>

      {showColors && (
        <>
          <Menu
            open={openMenu === 'color'}
            onOpen={() => toggleMenu('color')}
            label="Text colour"
            trigger={<Palette className="w-3.5 h-3.5" />}
          >
            <SwatchGrid
              colors={TEXT_COLORS}
              onPick={(c) => { fire('foreColor', c); setOpenMenu(null); }}
            />
          </Menu>
          <Menu
            open={openMenu === 'highlight'}
            onOpen={() => toggleMenu('highlight')}
            label="Highlight"
            trigger={<Highlighter className="w-3.5 h-3.5" />}
          >
            <SwatchGrid
              colors={HIGHLIGHT_COLORS}
              onPick={(c) => { fire('hiliteColor', c); setOpenMenu(null); }}
            />
          </Menu>
        </>
      )}

      <Divider />

      {/* Case transforms — operate on the selected text */}
      <Menu
        open={openMenu === 'case'}
        onOpen={() => toggleMenu('case')}
        label="Letter case"
        trigger={<CaseSensitive className="w-3.5 h-3.5" />}
      >
        <div className="flex flex-col py-1 min-w-[160px]">
          <PopBtn onClick={() => { fire('case', 'upper'); setOpenMenu(null); }}>
            <CaseUpper className="w-3.5 h-3.5 mr-2" /> UPPERCASE
          </PopBtn>
          <PopBtn onClick={() => { fire('case', 'lower'); setOpenMenu(null); }}>
            <CaseLower className="w-3.5 h-3.5 mr-2" /> lowercase
          </PopBtn>
          <PopBtn onClick={() => { fire('case', 'title'); setOpenMenu(null); }}>
            <CaseSensitive className="w-3.5 h-3.5 mr-2" /> Title Case
          </PopBtn>
        </div>
      </Menu>

      {showAlignment && (
        <>
          <Divider />
          <ToolBtn label="Align left"    onClick={() => fire('justifyLeft')}><AlignLeft className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn label="Align center"  onClick={() => fire('justifyCenter')}><AlignCenter className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn label="Align right"   onClick={() => fire('justifyRight')}><AlignRight className="w-3.5 h-3.5" /></ToolBtn>
          <ToolBtn label="Justify"       onClick={() => fire('justifyFull')}><AlignJustify className="w-3.5 h-3.5" /></ToolBtn>
        </>
      )}

      <Divider />

      <ToolBtn label="Decrease indent" onClick={() => fire('outdent')}><IndentDecrease className="w-3.5 h-3.5" /></ToolBtn>
      <ToolBtn label="Increase indent" onClick={() => fire('indent')}><IndentIncrease className="w-3.5 h-3.5" /></ToolBtn>

      {/* Line spacing */}
      <Menu
        open={openMenu === 'spacing'}
        onOpen={() => toggleMenu('spacing')}
        label="Line spacing"
        trigger={<span className="text-xs px-1 inline-flex items-center gap-1">Spacing <ChevronDown className="w-3 h-3 opacity-60" /></span>}
      >
        <div className="flex flex-col py-1 min-w-[140px]">
          {LINE_HEIGHTS.map(lh => (
            <PopBtn key={lh.value} onClick={() => { fire('lineHeight', lh.value); setOpenMenu(null); }}>
              {lh.label} <span className="ml-2 text-xs text-gray-500">{lh.value}</span>
            </PopBtn>
          ))}
        </div>
      </Menu>

      {showLinks && (
        <>
          <Divider />
          <Menu
            open={openMenu === 'link'}
            onOpen={() => toggleMenu('link')}
            label="Insert link"
            trigger={<LinkIcon className="w-3.5 h-3.5" />}
          >
            <div className="p-2 flex flex-col gap-1.5 min-w-[260px]">
              <label className="text-[11px] font-medium text-gray-600">Link URL</label>
              <div className="flex gap-1">
                <input
                  autoFocus
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://…"
                  className="text-xs px-2 py-1 border rounded flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      if (linkUrl) fire('createLink', linkUrl);
                      setLinkUrl(''); setOpenMenu(null);
                    } else if (e.key === 'Escape') {
                      setOpenMenu(null);
                    }
                  }}
                />
                <button
                  type="button"
                  className="text-xs px-2 py-1 bg-indigo-600 text-white rounded"
                  onClick={() => {
                    if (linkUrl) fire('createLink', linkUrl);
                    setLinkUrl(''); setOpenMenu(null);
                  }}
                >Add</button>
              </div>
            </div>
          </Menu>
          <ToolBtn label="Remove link" onClick={() => fire('unlink')}><Link2Off className="w-3.5 h-3.5" /></ToolBtn>
        </>
      )}

      <Divider />
      <ToolBtn label="Clear formatting" onClick={() => fire('removeFormat')}><Eraser className="w-3.5 h-3.5" /></ToolBtn>
    </div>
  );
}

function ToolBtn({ children, label, onClick }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onMouseDown={(e) => e.preventDefault()} // keep editor focused / selection alive
      onClick={onClick}
      className="h-7 min-w-[28px] px-1.5 inline-flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded"
    >
      {children}
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="w-px h-5 bg-gray-200 mx-0.5" />;
}

function Menu({ open, onOpen, label, trigger, children }) {
  return (
    <div className="relative">
      <button
        type="button"
        title={label}
        aria-label={label}
        aria-haspopup="true"
        aria-expanded={open}
        onMouseDown={(e) => e.preventDefault()}
        onClick={onOpen}
        className={`h-7 px-1.5 inline-flex items-center justify-center text-gray-700 hover:bg-gray-100 rounded ${open ? 'bg-gray-100' : ''}`}
      >
        {trigger}
      </button>
      {open && (
        <div
          className="absolute top-full left-0 z-40 mt-1 bg-white border border-gray-200 rounded-md shadow-lg"
          onMouseDown={(e) => e.preventDefault()}
        >
          {children}
        </div>
      )}
    </div>
  );
}

function PopBtn({ children, onClick, style }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      style={style}
      className="text-left text-sm px-3 py-1.5 hover:bg-indigo-50 inline-flex items-center w-full"
    >
      {children}
    </button>
  );
}

function SwatchGrid({ colors, onPick }) {
  return (
    <div className="grid grid-cols-5 gap-1 p-1.5">
      {colors.map(c => (
        <button
          key={c}
          type="button"
          aria-label={`Colour ${c}`}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => onPick(c)}
          className="w-6 h-6 rounded border border-gray-200 hover:scale-110 transition-transform"
          style={{
            background: c === 'transparent' ? 'repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 0 0/8px 8px' : c,
          }}
        />
      ))}
    </div>
  );
}