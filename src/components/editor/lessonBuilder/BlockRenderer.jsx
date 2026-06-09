import React, { useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import InlineEditable from './InlineEditable';
import InlineToolbar from './InlineToolbar';
import MathBlock from './MathBlock';
import ScientificEquationBlock from './ScientificEquationBlock';
import { Upload, AlignLeft, AlignCenter, AlignRight, Image as ImageIcon, X } from 'lucide-react';

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
    case 'image':             return <ImageBlock data={d} onChange={upd} />;
    case 'image-text':        return <ImageTextBlock data={d} onChange={upd} />;
    case 'video':             return <VideoBlock url={d.url} onChange={(url) => upd({ url })} />;
    case 'file':              return <FileBlock data={d} onChange={upd} />;
    case 'table':             return <TableBlock data={d} onChange={upd} />;
    case 'divider':           return <div className="py-2"><hr className="border-t border-gray-200" /></div>;
    case 'spacer':            return <SpacerBlock size={d.size} onChange={(size) => upd({ size })} />;
    case 'two-columns':       return <TwoColumnsBlock data={d} onChange={upd} />;
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
      <InlineToolbar editableRef={ref} showHeadings />
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
      <InlineToolbar editableRef={ref} />
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
      <InlineToolbar editableRef={ref} />
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
function ImageBlock({ data, onChange }) {
  const upload = async (file) => {
    if (!file) return;
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      onChange({ ...data, url: file_url });
    } catch {
      toast.error('Failed to upload image');
    }
  };
  return (
    <div>
      {data.url ? (
        <div style={{ display: 'flex', justifyContent: data.align === 'left' ? 'flex-start' : data.align === 'right' ? 'flex-end' : 'center' }}>
          <figure style={{ width: `${data.width || 100}%`, maxWidth: '100%', margin: 0 }}>
            <img src={data.url} alt={data.alt || ''} className="w-full rounded-lg shadow-sm" />
            <input
              value={data.caption || ''}
              onChange={(e) => onChange({ ...data, caption: e.target.value })}
              placeholder="Caption (optional)"
              className="mt-1 w-full text-center text-xs text-gray-500 italic bg-transparent outline-none border-b border-transparent focus:border-gray-200"
            />
          </figure>
        </div>
      ) : (
        <label className="block border-2 border-dashed border-gray-300 rounded-lg p-8 text-center text-gray-500 hover:border-indigo-400 hover:bg-indigo-50 cursor-pointer transition-colors">
          <ImageIcon className="w-8 h-8 mx-auto mb-2 text-gray-400" />
          <p className="text-sm font-medium">Click to upload an image</p>
          <p className="text-xs mt-1">Or paste a URL below</p>
          <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
        </label>
      )}
      <div className="flex flex-wrap items-center gap-2 mt-2">
        <input
          value={data.url || ''}
          onChange={(e) => onChange({ ...data, url: e.target.value })}
          placeholder="Image URL"
          className="flex-1 min-w-[160px] text-xs border border-gray-200 rounded px-2 py-1"
        />
        <input
          value={data.alt || ''}
          onChange={(e) => onChange({ ...data, alt: e.target.value })}
          placeholder="Alt text (accessibility)"
          className="flex-1 min-w-[160px] text-xs border border-gray-200 rounded px-2 py-1"
        />
        <div className="flex border border-gray-200 rounded">
          <AlignBtn active={data.align === 'left'}   onClick={() => onChange({ ...data, align: 'left' })}><AlignLeft className="w-3.5 h-3.5" /></AlignBtn>
          <AlignBtn active={data.align !== 'left' && data.align !== 'right'} onClick={() => onChange({ ...data, align: 'center' })}><AlignCenter className="w-3.5 h-3.5" /></AlignBtn>
          <AlignBtn active={data.align === 'right'}  onClick={() => onChange({ ...data, align: 'right' })}><AlignRight className="w-3.5 h-3.5" /></AlignBtn>
        </div>
        <label className="text-xs text-gray-600 flex items-center gap-1">
          Width
          <input
            type="range" min={20} max={100} step={5}
            value={data.width ?? 100}
            onChange={(e) => onChange({ ...data, width: Number(e.target.value) })}
          />
          <span className="w-8 text-right">{data.width ?? 100}%</span>
        </label>
        {data.url && (
          <label className="text-xs text-indigo-600 cursor-pointer hover:underline flex items-center gap-1">
            <Upload className="w-3 h-3" /> Replace
            <input type="file" accept="image/*" className="hidden" onChange={(e) => upload(e.target.files?.[0])} />
          </label>
        )}
      </div>
    </div>
  );
}

function ImageTextBlock({ data, onChange }) {
  const ref = useRef(null);
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
      <input
        value={data.alt || ''}
        onChange={(e) => onChange({ ...data, alt: e.target.value })}
        placeholder="Alt text"
        className="mt-1 w-full text-xs border border-gray-200 rounded px-2 py-1"
      />
    </div>
  );
  const TextCol = (
    <div>
      <InlineToolbar editableRef={ref} />
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
        {data.side === 'right' ? <>{TextCol}{ImageCol}</> : <>{ImageCol}{TextCol}</>}
      </div>
    </div>
  );
}

function VideoBlock({ url, onChange }) {
  const yt = url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/);
  const vimeo = url?.match(/vimeo\.com\/(\d+)/);
  const embed = yt ? `https://www.youtube.com/embed/${yt[1]}` : vimeo ? `https://player.vimeo.com/video/${vimeo[1]}` : url;
  return (
    <div>
      <input
        value={url || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Paste a YouTube, Vimeo, or embed URL"
        className="w-full text-sm border border-gray-200 rounded px-3 py-2 mb-2"
      />
      {url && (
        <div className="relative pb-[56.25%] bg-black rounded-lg overflow-hidden">
          <iframe src={embed} className="absolute inset-0 w-full h-full" allowFullScreen title="Video preview" />
        </div>
      )}
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

function TwoColumnsBlock({ data, onChange }) {
  const leftRef = useRef(null);
  const rightRef = useRef(null);
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="border border-dashed border-gray-200 rounded p-2">
        <InlineToolbar editableRef={leftRef} />
        <InlineEditable
          ref={leftRef}
          value={data.left}
          onChange={(v) => onChange({ ...data, left: v })}
          placeholder="Left column"
        />
      </div>
      <div className="border border-dashed border-gray-200 rounded p-2">
        <InlineToolbar editableRef={rightRef} />
        <InlineEditable
          ref={rightRef}
          value={data.right}
          onChange={(v) => onChange({ ...data, right: v })}
          placeholder="Right column"
        />
      </div>
    </div>
  );
}

function TableBlock({ data, onChange }) {
  const rows = data.rows || [];
  const update = (r, c, v) => {
    const next = rows.map(row => [...row]);
    next[r][c] = v;
    onChange({ ...data, rows: next });
  };
  const addRow = () => onChange({ ...data, rows: [...rows, Array(rows[0]?.length || 2).fill('')] });
  const addCol = () => onChange({ ...data, rows: rows.map(r => [...r, '']) });
  const removeRow = (idx) => onChange({ ...data, rows: rows.filter((_, i) => i !== idx) });
  const removeCol = (idx) => onChange({ ...data, rows: rows.map(r => r.filter((_, i) => i !== idx)) });
  return (
    <div>
      <div className="flex gap-2 mb-2">
        <button type="button" onClick={addRow} className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">+ Row</button>
        <button type="button" onClick={addCol} className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded">+ Column</button>
        <label className="text-xs flex items-center gap-1">
          <input type="checkbox" checked={!!data.header} onChange={(e) => onChange({ ...data, header: e.target.checked })} />
          Header row
        </label>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border border-gray-200">
          <tbody>
            {rows.map((row, r) => (
              <tr key={r} className={data.header && r === 0 ? 'bg-gray-50 font-semibold' : ''}>
                {row.map((cell, c) => (
                  <td key={c} className="border border-gray-200 p-1">
                    <InlineEditable value={cell} onChange={(v) => update(r, c, v)} placeholder="…" singleLine className="text-sm" />
                  </td>
                ))}
                <td className="w-6 text-center">
                  <button type="button" onClick={() => removeRow(r)} className="text-gray-400 hover:text-red-500" aria-label={`Remove row ${r + 1}`}><X className="w-3 h-3" /></button>
                </td>
              </tr>
            ))}
            <tr>
              {(rows[0] || []).map((_, c) => (
                <td key={c} className="text-center">
                  <button type="button" onClick={() => removeCol(c)} className="text-gray-400 hover:text-red-500 text-xs" aria-label={`Remove column ${c + 1}`}>×</button>
                </td>
              ))}
              <td />
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

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
      <InlineToolbar editableRef={ref} />
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
function AlignBtn({ children, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-1.5 py-1 ${active ? 'bg-indigo-100 text-indigo-700' : 'text-gray-500 hover:bg-gray-100'}`}
    >{children}</button>
  );
}

function stripTags(html) {
  if (!html) return '';
  if (typeof document === 'undefined') return String(html);
  const d = document.createElement('div');
  d.innerHTML = html;
  return d.textContent || '';
}