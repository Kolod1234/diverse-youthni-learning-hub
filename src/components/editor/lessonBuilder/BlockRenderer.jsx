import React, { useRef, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import InlineEditable from './InlineEditable';
import InlineToolbar from './InlineToolbar';
import MathBlock from './MathBlock';
import ScientificEquationBlock from './ScientificEquationBlock';
import ImageBlock from './ImageBlock';
import VideoBlock from './VideoBlock';
import TableBlock from './TableBlock';
import TwoColumnsBlock from './TwoColumnsBlock';
import { BlockExpandedContext } from './BlockWrapper';
import { Upload, Image as ImageIcon } from 'lucide-react';

// Small wrapper that renders InlineToolbar only when the parent block is
// expanded. Wrapped in motion-reduce-safe transition. The toolbar itself
// preserves selection via mouseDown.preventDefault, so collapsing must be
// driven from outside the toolbar (via the block's Edit/Done button) — not
// here. Receives all InlineToolbar props through ...rest.
function GatedInlineToolbar(props) {
  const expanded = useContext(BlockExpandedContext);
  if (!expanded) return null;
  return <InlineToolbar {...props} />;
}

// Per-block UI dispatcher. Each branch is intentionally compact — no rich text
// modal, no separate "edit" screen. Tutors edit inline, exactly where it sits.
// All blocks call onChange(nextData) with the entire updated data object.

export default function BlockRenderer({ block, onChange, focused }) {
  const d = block.data || {};
  const upd = (patch) => onChange({ ...d, ...patch });

  switch (block.type) {
    case 'paragraph':         return <ParagraphBlock html={d.html} onChange={(html) => upd({ html })} focused={focused} />;
    case 'heading-1':         return <HeadingBlock level={1} text={d.text} onChange={(text) => upd({ text })} />;
    case 'heading-2':         return <HeadingBlock level={2} text={d.text} onChange={(text) => upd({ text })} />;
    case 'heading-3':         return <HeadingBlock level={3} text={d.text} onChange={(text) => upd({ text })} />;
    case 'bullet-list':       return <ListBlock ordered={false} items={d.items} onChange={(items) => upd({ items })} />;
    case 'numbered-list':     return <ListBlock ordered={true}  items={d.items} onChange={(items) => upd({ items })} />;
    case 'quote':             return <QuoteBlock html={d.html} cite={d.cite} onChange={upd} />;
    case 'callout':           return <CalloutBlock variant={d.variant} html={d.html} onChange={upd} />;
    case 'definition':        return <DefinitionBlock term={d.term} definition={d.definition} onChange={upd} />;
    case 'image':             return <ImageBlock data={d} onChange={onChange} />;
    case 'image-text':        return <ImageTextBlock data={d} onChange={upd} />;
    case 'video':             return <VideoBlock data={d} onChange={onChange} />;
    case 'file':              return <FileBlock data={d} onChange={upd} />;
    case 'table':             return <TableBlock data={d} onChange={onChange} />;
    case 'divider':           return <div className="py-2"><hr className="border-t border-gray-200" /></div>;
    case 'spacer':            return <SpacerBlock size={d.size} onChange={(size) => upd({ size })} />;
    case 'two-columns':       return (
      <TwoColumnsBlock
        data={d}
        onChange={onChange}
        renderChild={(child, childOnChange) => (
          <BlockRenderer block={child} onChange={childOnChange} />
        )}
      />
    );
    case 'code':              return <CodeBlock data={d} onChange={upd} />;
    case 'math':              return <MathBlock latex={d.latex} onChange={(latex) => upd({ latex })} />;
    case 'scientific-equation': return <ScientificEquationBlock data={d} onChange={onChange} />;
    case 'learning-objective':return <BadgeBlock label="🎯 Learning Objective" color="emerald" html={d.html} onChange={(html) => upd({ html })} />;
    case 'key-takeaway':      return <BadgeBlock label="⭐ Key Takeaway" color="amber" html={d.html} onChange={(html) => upd({ html })} />;
    case 'knowledge-check':   return <KnowledgeCheckBlock data={d} onChange={upd} />;
    case 'legacy-html':       return <LegacyHtmlBlock html={d.html} onChange={(html) => upd({ html })} />;
    default:                  return <div className="text-xs text-red-500">Unknown block type: {block.type}</div>;
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Text blocks
// ─────────────────────────────────────────────────────────────────────────────
function ParagraphBlock({ html, onChange }) {
  const ref = useRef(null);
  return (
    <div>
      <GatedInlineToolbar editableRef={ref} showHeadings />
      <InlineEditable
        ref={ref}
        value={html}
        onChange={onChange}
        placeholder="Type / for blocks, or start writing…"
        className="text-base leading-relaxed text-gray-800 py-1"
      />
    </div>
  );
}

function HeadingBlock({ level, text, onChange }) {
  const styles = {
    1: 'text-3xl font-bold text-slate-900',
    2: 'text-2xl font-bold text-slate-900',
    3: 'text-xl font-semibold text-teal-700',
  };
  return (
    <InlineEditable
      value={text}
      onChange={(html) => onChange(stripTags(html))}
      placeholder={`Heading ${level}`}
      singleLine
      className={`${styles[level]} py-1`}
    />
  );
}

function ListBlock({ ordered, items = [''], onChange }) {
  const update = (idx, value) => {
    const next = [...items]; next[idx] = value; onChange(next);
  };
  const Tag = ordered ? 'ol' : 'ul';
  return (
    <Tag className={`${ordered ? 'list-decimal' : 'list-disc'} pl-6 space-y-1 py-1`}>
      {items.map((item, idx) => (
        <li key={idx}>
          <InlineEditable
            value={item}
            onChange={(v) => update(idx, v)}
            placeholder="List item"
            singleLine
            className="text-base text-gray-800"
            ariaLabel={`List item ${idx + 1}`}
          />
        </li>
      ))}
      <li className="list-none">
        <button
          type="button"
          onClick={() => onChange([...items, ''])}
          className="text-xs text-indigo-600 hover:underline"
        >+ Add item</button>
      </li>
    </Tag>
  );
}

function QuoteBlock({ html, cite, onChange }) {
  const ref = useRef(null);
  return (
    <div className="border-l-4 border-indigo-500 bg-gray-50 rounded px-4 py-3">
      <GatedInlineToolbar editableRef={ref} />
      <InlineEditable
        ref={ref}
        value={html}
        onChange={(v) => onChange({ html: v, cite })}
        placeholder="Quote text"
        className="italic text-gray-700"
      />
      <input
        value={cite || ''}
        onChange={(e) => onChange({ html, cite: e.target.value })}
        placeholder="— Source (optional)"
        className="mt-2 w-full text-xs text-gray-500 bg-transparent outline-none border-b border-transparent focus:border-gray-300 py-0.5"
      />
    </div>
  );
}

function CalloutBlock({ variant = 'info', html, onChange }) {
  const ref = useRef(null);
  const palette = {
    info:    'bg-blue-50 border-blue-400 text-blue-900',
    warning: 'bg-amber-50 border-amber-400 text-amber-900',
    success: 'bg-emerald-50 border-emerald-400 text-emerald-900',
    danger:  'bg-red-50 border-red-400 text-red-900',
  };
  return (
    <div className={`border-l-4 rounded-r px-4 py-3 ${palette[variant] || palette.info}`}>
      <div className="flex items-center justify-between mb-1">
        <select
          value={variant}
          onChange={(e) => onChange({ variant: e.target.value, html })}
          className="text-xs bg-white border border-gray-200 rounded px-1.5 py-0.5"
          aria-label="Callout style"
        >
          <option value="info">💡 Info</option>
          <option value="warning">⚠ Warning</option>
          <option value="success">✓ Tip</option>
          <option value="danger">⚠ Important</option>
        </select>
      </div>
      <GatedInlineToolbar editableRef={ref} />
      <InlineEditable
        ref={ref}
        value={html}
        onChange={(v) => onChange({ variant, html: v })}
        placeholder="Callout text…"
        className="text-base"
      />
    </div>
  );
}

function DefinitionBlock({ term, definition, onChange }) {
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
      <p className="text-[10px] tracking-widest uppercase text-teal-600 font-bold mb-1">Definition</p>
      <InlineEditable
        value={term}
        onChange={(v) => onChange({ term: stripTags(v), definition })}
        placeholder="Term"
        singleLine
        className="text-lg font-bold text-slate-900 mb-1"
      />
      <InlineEditable
        value={definition}
        onChange={(v) => onChange({ term, definition: v })}
        placeholder="Definition…"
        className="text-base text-slate-700"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Media blocks
// ─────────────────────────────────────────────────────────────────────────────
// ImageBlock and VideoBlock are imported from their own files (see top of
// this module). They handle upload, URL, alt, caption, credit, visible
// resize handles, alignment, fit/crop, aspect lock and reset themselves.

function ImageTextBlock({ data, onChange }) {
  const ref = useRef(null);
  const textColRef = useRef(null);
  const expanded = useContext(BlockExpandedContext);
  // The text toolbar appears only when this specific text region is actively
  // being edited. We track focus on the contenteditable inside the text col so
  // the toolbar disappears as soon as focus leaves it — preventing two visible
  // toolbars when this block is adjacent to a paragraph that is also expanded
  // (in practice only one block can be expanded at a time, but this is the
  // belt-and-braces guarantee for the image-with-text case).
  const [textFocused, setTextFocused] = useState(false);

  useEffect(() => {
    const root = textColRef.current;
    if (!root) return;
    const onFocusIn = () => setTextFocused(true);
    const onFocusOut = (e) => {
      // Keep open if focus moves to the toolbar itself (popovers, buttons).
      if (root.contains(e.relatedTarget)) return;
      setTextFocused(false);
    };
    root.addEventListener('focusin', onFocusIn);
    root.addEventListener('focusout', onFocusOut);
    return () => {
      root.removeEventListener('focusin', onFocusIn);
      root.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  // When the block collapses, also drop the focused flag so re-expanding
  // starts in a clean "preview only" state.
  useEffect(() => { if (!expanded) setTextFocused(false); }, [expanded]);

  const upload = async (file) => {
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange({ ...data, url: file_url });
    } catch {
      toast.error('Failed to upload image');
    }
  };
  const ImageCol = (
    <div>
      {data.url ? (
        <img src={data.url} alt={data.alt || ''} className="w-full rounded-lg shadow-sm" />
      ) : (
        <label className="block border-2 border-dashed rounded-lg p-6 text-center text-gray-500 hover:border-indigo-400 cursor-pointer">
          <ImageIcon className="w-7 h-7 mx-auto mb-1 text-gray-400" />
          <p className="text-xs">Upload image</p>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
        </label>
      )}
      {expanded && (
        <input
          value={data.alt || ''}
          onChange={(e) => onChange({ ...data, alt: e.target.value })}
          placeholder="Alt text"
          className="mt-1 w-full text-xs border border-gray-200 rounded px-2 py-1"
        />
      )}
    </div>
  );
  const TextCol = (
    <div ref={textColRef}>
      {expanded && textFocused && <InlineToolbar editableRef={ref} />}
      <InlineEditable
        ref={ref}
        value={data.html}
        onChange={(v) => onChange({ ...data, html: v })}
        placeholder="Describe the image…"
      />
    </div>
  );
  return (
    <div>
      {expanded && (
        <div className="flex items-center gap-2 mb-2">
          <label className="text-xs text-gray-600">Image side:</label>
          <select
            value={data.side || 'left'}
            onChange={(e) => onChange({ ...data, side: e.target.value })}
            className="text-xs border border-gray-200 rounded px-1.5 py-0.5"
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {data.side === 'right' ? <>{TextCol}{ImageCol}</> : <>{ImageCol}{TextCol}</>}
      </div>
    </div>
  );
}

function FileBlock({ data, onChange }) {
  const upload = async (file) => {
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange({ ...data, url: file_url, name: data.name || file.name });
    } catch {
      toast.error('Failed to upload file');
    }
  };
  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-3 flex items-center gap-2 flex-wrap">
      <span className="text-lg">📎</span>
      <input
        value={data.name || ''}
        onChange={(e) => onChange({ ...data, name: e.target.value })}
        placeholder="File name (e.g. Worksheet.pdf)"
        className="flex-1 min-w-[180px] text-sm border border-indigo-200 rounded px-2 py-1"
      />
      <input
        value={data.url || ''}
        onChange={(e) => onChange({ ...data, url: e.target.value })}
        placeholder="File URL"
        className="flex-1 min-w-[180px] text-xs border border-indigo-200 rounded px-2 py-1"
      />
      <label className="text-xs text-indigo-700 cursor-pointer hover:underline flex items-center gap-1">
        <Upload className="w-3 h-3" /> Upload
        <input type="file" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
      </label>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Layout blocks
// ─────────────────────────────────────────────────────────────────────────────
function SpacerBlock({ size = 32, onChange }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <div className="flex-1 bg-gray-100 rounded" style={{ height: `${size}px` }} />
      <label className="text-xs text-gray-600 flex items-center gap-1">
        Size
        <input type="number" min={8} max={200} value={size} onChange={(e) => onChange(Number(e.target.value))} className="w-16 border border-gray-200 rounded px-1.5 py-0.5 text-xs" />
        px
      </label>
    </div>
  );
}

// TwoColumnsBlock has been moved to ./TwoColumnsBlock.jsx — it is now a true
// container that holds child blocks per side (see imports at the top).

// TableBlock has been moved to ./TableBlock.jsx — see imports at the top.

// ─────────────────────────────────────────────────────────────────────────────
// Advanced blocks
// ─────────────────────────────────────────────────────────────────────────────
function CodeBlock({ data, onChange }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <label className="text-xs text-gray-500">Language:</label>
        <select
          value={data.language || 'javascript'}
          onChange={(e) => onChange({ ...data, language: e.target.value })}
          className="text-xs border border-gray-200 rounded px-1.5 py-0.5"
        >
          {['javascript','typescript','python','html','css','sql','bash','json','plaintext'].map(l => <option key={l}>{l}</option>)}
        </select>
      </div>
      <textarea
        value={data.code || ''}
        onChange={(e) => onChange({ ...data, code: e.target.value })}
        placeholder="// Your code here"
        className="w-full font-mono text-sm bg-slate-900 text-slate-100 rounded p-3 outline-none min-h-[120px]"
        spellCheck={false}
      />
    </div>
  );
}

// MathBlock moved to ./MathBlock.jsx — adds editable LaTeX/plain input,
// live MathJax preview, and a symbol palette.

function BadgeBlock({ label, color, html, onChange }) {
  const ref = useRef(null);
  const palette = {
    emerald: 'bg-emerald-50 border-emerald-200 text-emerald-900',
    amber:   'bg-amber-50 border-amber-200 text-amber-900',
  };
  return (
    <div className={`border rounded-lg p-3 ${palette[color] || palette.emerald}`}>
      <p className="text-[10px] tracking-widest uppercase font-bold mb-1">{label}</p>
      <GatedInlineToolbar editableRef={ref} />
      <InlineEditable ref={ref} value={html} onChange={onChange} placeholder="Write here…" className="text-base" />
    </div>
  );
}

function KnowledgeCheckBlock({ data, onChange }) {
  return (
    <div className="bg-violet-50 border border-violet-200 rounded-lg p-3 space-y-2">
      <p className="text-[10px] tracking-widest uppercase text-violet-700 font-bold">❓ Knowledge Check</p>
      <InlineEditable
        value={data.question}
        onChange={(v) => onChange({ ...data, question: stripTags(v) })}
        placeholder="Question"
        singleLine
        className="font-semibold text-violet-900"
      />
      <InlineEditable
        value={data.hint}
        onChange={(v) => onChange({ ...data, hint: stripTags(v) })}
        placeholder="Optional hint"
        singleLine
        className="text-sm text-violet-700 italic"
      />
      <InlineEditable
        value={data.answer}
        onChange={(v) => onChange({ ...data, answer: v })}
        placeholder="Answer (revealed by the learner)"
        className="text-sm text-violet-900 bg-white rounded p-2"
      />
    </div>
  );
}

function LegacyHtmlBlock({ html, onChange }) {
  const [edit, setEdit] = React.useState(false);
  return (
    <div className="border border-amber-200 bg-amber-50/40 rounded p-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] uppercase tracking-widest text-amber-700 font-bold">⚠ Legacy HTML</span>
        <button type="button" onClick={() => setEdit(e => !e)} className="text-xs text-amber-700 hover:underline">
          {edit ? 'Preview' : 'Edit source'}
        </button>
      </div>
      {edit ? (
        <textarea
          value={html || ''}
          onChange={(e) => onChange(e.target.value)}
          className="w-full font-mono text-xs bg-white border border-amber-200 rounded p-2 outline-none min-h-[120px]"
          spellCheck={false}
        />
      ) : (
        <div className="bg-white rounded p-2" dangerouslySetInnerHTML={{ __html: html || '' }} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
function stripTags(html) {
  if (!html) return '';
  if (typeof document === 'undefined') return String(html);
  const d = document.createElement('div');
  d.innerHTML = html;
  return d.textContent || '';
}