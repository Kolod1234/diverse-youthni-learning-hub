import React, { useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Label } from '@/components/ui/label';

// Custom insert buttons
const insertSymbol = (quill, symbol) => {
  const cursorPosition = quill.getSelection()?.index || 0;
  quill.insertText(cursorPosition, symbol);
  quill.setSelection(cursorPosition + symbol.length);
};

const SYMBOLS = {
  arrows: ['→', '←', '↑', '↓', '↔', '⇒', '⇐', '⇔', '↗', '↘'],
  chemistry: ['H₂O', 'CO₂', 'O₂', 'N₂', 'CH₄', 'NH₃', 'H₂SO₄', 'NaCl', 'Ca²⁺', 'OH⁻', 'Fe³⁺', 'SO₄²⁻'],
  math: ['π', '∑', '∫', '√', '∞', '≈', '≠', '≤', '≥', '±', '×', '÷', '∂', 'Δ', 'α', 'β', 'γ', 'θ', 'λ', 'μ'],
  shapes: ['○', '●', '□', '■', '△', '▲', '◇', '◆', '☆', '★', '→', '⟶', '⇢', '⟹'],
  organic: ['—', '≡', '⌬', '⟲', '⟳', 'CH₃', 'CH₂', 'COOH', 'OH', 'NH₂']
};

export default function RichTextEditor({ value, onChange, placeholder, label }) {
  const quillRef = useRef(null);

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
        [{ 'font': [] }],
        [{ 'size': ['small', false, 'large', 'huge'] }],
        ['bold', 'italic', 'underline', 'strike'],
        [{ 'color': [] }, { 'background': [] }],
        [{ 'script': 'sub'}, { 'script': 'super' }],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'indent': '-1'}, { 'indent': '+1' }],
        [{ 'align': [] }],
        ['blockquote', 'code-block'],
        ['link', 'image', 'video'],
        ['clean'],
        ['symbol-menu']
      ],
      handlers: {
        'symbol-menu': function() {
          const menu = document.getElementById('symbol-menu');
          if (menu) {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
          }
        }
      }
    },
    clipboard: {
      matchVisual: false
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video', 'width', 'height', 'style'
  ];

  const handleSymbolClick = (symbol) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      insertSymbol(quill, symbol);
    }
    const menu = document.getElementById('symbol-menu');
    if (menu) menu.style.display = 'none';
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      <style>
        {`
          .ql-container {
            font-size: 15px;
            border-bottom-left-radius: 0.5rem;
            border-bottom-right-radius: 0.5rem;
          }
          .ql-toolbar {
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
            background: #f9fafb;
          }
          .ql-editor {
            min-height: 200px;
          }
          .ql-editor.ql-blank::before {
            font-style: normal;
            color: #9ca3af;
          }
          .ql-editor img {
            max-width: 100%;
            height: auto;
            cursor: move;
            resize: both;
            overflow: auto;
            display: inline-block;
          }
          .ql-editor img:hover {
            outline: 2px solid #4f46e5;
          }
          .ql-snow button.ql-symbol-menu {
            width: auto !important;
          }
          .ql-snow button.ql-symbol-menu::before {
            content: '⚛️';
            font-size: 18px;
          }
          #symbol-menu {
            display: none;
            position: absolute;
            z-index: 1000;
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 0.5rem;
            padding: 12px;
            box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
            max-width: 500px;
            margin-top: 4px;
            max-height: 400px;
            overflow-y: auto;
          }
          .symbol-section {
            margin-bottom: 12px;
          }
          .symbol-section:last-child {
            margin-bottom: 0;
          }
          .symbol-section-title {
            font-size: 11px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            margin-bottom: 6px;
            letter-spacing: 0.5px;
          }
          .symbol-grid {
            display: grid;
            grid-template-columns: repeat(10, 1fr);
            gap: 4px;
          }
          .symbol-btn {
            padding: 8px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            font-size: 16px;
            text-align: center;
            transition: all 0.15s;
          }
          .symbol-btn:hover {
            background: #eef2ff;
            border-color: #4f46e5;
            transform: scale(1.15);
          }
        `}
      </style>
      <div style={{ position: 'relative' }}>
        <ReactQuill 
          ref={quillRef}
          theme="snow" 
          value={value} 
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
        />
        <div id="symbol-menu">
          <div className="symbol-section">
            <div className="symbol-section-title">Arrows</div>
            <div className="symbol-grid">
              {SYMBOLS.arrows.map((symbol, i) => (
                <button
                  key={i}
                  className="symbol-btn"
                  onClick={() => handleSymbolClick(symbol)}
                  type="button"
                  title={symbol}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
          <div className="symbol-section">
            <div className="symbol-section-title">Chemistry Formulas</div>
            <div className="symbol-grid">
              {SYMBOLS.chemistry.map((symbol, i) => (
                <button
                  key={i}
                  className="symbol-btn"
                  onClick={() => handleSymbolClick(symbol)}
                  type="button"
                  style={{ fontSize: '13px' }}
                  title={symbol}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
          <div className="symbol-section">
            <div className="symbol-section-title">Organic Chemistry</div>
            <div className="symbol-grid">
              {SYMBOLS.organic.map((symbol, i) => (
                <button
                  key={i}
                  className="symbol-btn"
                  onClick={() => handleSymbolClick(symbol)}
                  type="button"
                  title={symbol}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
          <div className="symbol-section">
            <div className="symbol-section-title">Math Symbols</div>
            <div className="symbol-grid">
              {SYMBOLS.math.map((symbol, i) => (
                <button
                  key={i}
                  className="symbol-btn"
                  onClick={() => handleSymbolClick(symbol)}
                  type="button"
                  title={symbol}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
          <div className="symbol-section">
            <div className="symbol-section-title">Shapes & Markers</div>
            <div className="symbol-grid">
              {SYMBOLS.shapes.map((symbol, i) => (
                <button
                  key={i}
                  className="symbol-btn"
                  onClick={() => handleSymbolClick(symbol)}
                  type="button"
                  title={symbol}
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}