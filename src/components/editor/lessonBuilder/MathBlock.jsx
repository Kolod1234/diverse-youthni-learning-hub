import React, { useState, useRef } from 'react';
import { MathJax } from 'better-react-mathjax';
import { Sigma, Eye, Code2 } from 'lucide-react';
import SymbolPalette from './SymbolPalette';

// Maths Formula block.
// - Tutors type LaTeX (or plain maths with symbols inserted from the palette).
// - A live MathJax preview renders below the input so they see the result
//   instantly without leaving the editor.
// - The block stores { latex } and is serialised to $$…$$ on save — the
//   existing LessonPlayer already wraps slide HTML in MathJaxContext so it
//   keeps rendering with no migration.
//
// Insertion: the symbol palette writes at the caret of the textarea so
// chosen symbols land exactly where the tutor is typing.

export default function MathBlock({ latex = '', onChange }) {
  const [showPreview, setShowPreview] = useState(true);
  const taRef = useRef(null);

  // Insert text at the caret of the textarea, preserving selection state.
  const insertAtCaret = (text) => {
    const ta = taRef.current;
    if (!ta) { onChange((latex || '') + text); return; }
    const start = ta.selectionStart ?? latex.length;
    const end   = ta.selectionEnd   ?? latex.length;
    const next  = (latex || '').slice(0, start) + text + (latex || '').slice(end);
    onChange(next);
    // Restore caret after React re-renders the textarea.
    requestAnimationFrame(() => {
      const pos = start + text.length;
      ta.focus();
      ta.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-gray-700">
          <Sigma className="w-4 h-4 text-indigo-600" />
          <span className="text-[10px] tracking-widest uppercase font-bold">Maths Formula</span>
        </div>
        <div className="flex items-center gap-1">
          <SymbolPalette onInsert={insertAtCaret} />
          <button
            type="button"
            onClick={() => setShowPreview(p => !p)}
            className="text-xs px-2 py-1 rounded hover:bg-gray-200 inline-flex items-center gap-1 text-gray-700"
            title={showPreview ? 'Hide preview' : 'Show preview'}
          >
            {showPreview ? <Code2 className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {showPreview ? 'Source only' : 'Preview'}
          </button>
        </div>
      </div>

      <textarea
        ref={taRef}
        value={latex}
        onChange={(e) => onChange(e.target.value)}
        placeholder={'e.g. E = mc^2,  \\frac{a}{b},  \\int_0^1 x^2 \\, dx'}
        className="w-full font-mono text-sm bg-white border border-gray-200 rounded p-2 outline-none min-h-[70px] focus:ring-2 focus:ring-indigo-200"
        spellCheck={false}
        aria-label="LaTeX / plain maths source"
      />

      {showPreview && (
        <div className="mt-2 bg-white border border-gray-100 rounded p-3 text-center">
          {latex ? (
            <MathJax dynamic>{`$$${latex}$$`}</MathJax>
          ) : (
            <p className="text-xs text-gray-400">Preview will appear here…</p>
          )}
        </div>
      )}

      <p className="mt-1.5 text-[10px] text-gray-500">
        Supports LaTeX (\frac, \sqrt, \int, \sum, ^, _, \alpha, …). Use the Σ button to insert symbols.
      </p>
    </div>
  );
}