import React, { useEffect, useRef, useState } from 'react';
import MathJaxContent from '@/components/lesson/MathJaxContent';
import BlockRenderer from './BlockRenderer';
import { BlockExpandedContext } from './BlockWrapper';
import { blocksToHtml } from './htmlSerializer';

// Document lessons use their natural height and original HTML. The rendered
// MathJax preview is separate from the editable DOM so generated math markup
// can never be written back into the lesson source.
export default function FlowCanvas({ blocks, onChangeBlocks }) {
  const [editingId, setEditingId] = useState(null);
  const activeEditorRef = useRef(null);
  useEffect(() => {
    if (!editingId) return;
    activeEditorRef.current?.querySelector('[contenteditable="true"], textarea, input')
      ?.focus({ preventScroll: true });
  }, [editingId]);
  const update = (idx, data) => onChangeBlocks(prev =>
    prev.map((block, i) => i === idx ? { ...block, data } : block)
  );
  const move = (idx, direction) => onChangeBlocks(prev => {
    const target = idx + direction;
    if (target < 0 || target >= prev.length) return prev;
    const next = [...prev];
    [next[idx], next[target]] = [next[target], next[idx]];
    return next;
  }, { immediate: true });

  return (
    <div className="lesson-flow-canvas w-full min-w-0" data-lesson-layout="flow">
      {blocks.map((block, idx) => {
        const editing = editingId === block.id;
        return (
          <section key={block.id} className="w-full min-w-0 mb-4">
            <div className="flex flex-wrap items-center justify-end gap-2 py-2 text-xs text-slate-600">
              {blocks.length > 1 && <>
                <button type="button" disabled={idx === 0} onClick={() => move(idx, -1)} className="disabled:opacity-40">Move up</button>
                <button type="button" disabled={idx === blocks.length - 1} onClick={() => move(idx, 1)} className="disabled:opacity-40">Move down</button>
              </>}
              <button type="button" aria-expanded={editing}
                onClick={() => setEditingId(editing ? null : block.id)}
                className="rounded border border-slate-300 bg-white px-3 py-1.5 hover:bg-slate-50">
                {editing ? 'Done editing' : 'Edit content'}
              </button>
            </div>
            {editing && (
              <p className="mb-2 text-sm text-indigo-700" role="status">
                Click the text to edit. Use Save Lesson to keep your changes.
              </p>
            )}
            <div ref={editing ? activeEditorRef : null} className="lesson-flow-prose">
              {editing ? (
                <BlockExpandedContext.Provider value={true}>
                  <BlockRenderer block={block} focused onChange={data => update(idx, data)} />
                </BlockExpandedContext.Provider>
              ) : (
                <MathJaxContent html={blocksToHtml([block])} />
              )}
            </div>
          </section>
        );
      })}
      <style>{`
        .lesson-flow-prose { font-size:18px; line-height:1.75; color:#1e293b; font-family:ui-sans-serif,system-ui,-apple-system,"Segoe UI",Roboto,sans-serif; }
        .lesson-flow-prose p { margin:0 0 1.1em; }
        .lesson-flow-prose h1,.lesson-flow-prose h2,.lesson-flow-prose h3 { font-family:ui-serif,Georgia,"Times New Roman",serif; color:#0f172a; letter-spacing:-.01em; line-height:1.25; }
        .lesson-flow-prose h1 { font-size:2.25rem; font-weight:700; margin:1.2em 0 .5em; }
        .lesson-flow-prose h2 { font-size:1.875rem; font-weight:700; margin:1.6em 0 .6em; }
        .lesson-flow-prose h3 { font-size:1.375rem; font-weight:700; margin:1.4em 0 .5em; }
        .lesson-flow-prose ul,.lesson-flow-prose ol { padding-left:1.4em; margin:0 0 1.1em; }
        .lesson-flow-prose ul { list-style-type:disc; }
        .lesson-flow-prose ol { list-style-type:decimal; }
        .lesson-flow-prose li { margin:.35em 0; }
        .lesson-flow-prose a { color:#4f46e5; text-decoration:underline; text-underline-offset:3px; }
        .lesson-flow-prose img { max-width:100%; height:auto; border-radius:12px; }
        .lesson-flow-prose blockquote { margin:1.4em 0; padding:.4em 1.2em; border-left:4px solid #4f46e5; background:#eef2ff; color:#312e81; border-radius:0 8px 8px 0; }
      `}</style>
    </div>
  );
}
