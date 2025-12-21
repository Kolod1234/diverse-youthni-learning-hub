import React, { useRef, useMemo, useEffect } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';

const SYMBOLS = {
  arrows: ['→', '←', '↑', '↓', '↔', '⇒', '⇐', '⇔', '↗', '↘'],
  chemistry: ['H₂O', 'CO₂', 'O₂', 'N₂', 'CH₄', 'NH₃', 'H₂SO₄', 'NaCl', 'Ca²⁺', 'OH⁻', 'Fe³⁺', 'SO₄²⁻'],
  math: ['π', '∑', '∫', '√', '∞', '≈', '≠', '≤', '≥', '±', '×', '÷', '∂', 'Δ', 'α', 'β', 'γ', 'θ', 'λ', 'μ'],
  shapes: ['○', '●', '□', '■', '△', '▲', '◇', '◆', '☆', '★'],
  organic: ['—', '≡', '⌬', '⟲', '⟳', 'CH₃', 'CH₂', 'COOH', 'OH', 'NH₂']
};

export default function RichTextEditor({ value = '', onChange, placeholder, label }) {
  const quillRef = useRef(null);

  const modules = useMemo(() => ({
    toolbar: [
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
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  }), []);

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image', 'video'
  ];

  const handleChange = (content, delta, source, editor) => {
    onChange(content);
  };

  const handleSymbolClick = (symbol) => {
    const quill = quillRef.current?.getEditor();
    if (quill) {
      const range = quill.getSelection(true);
      const position = range ? range.index : 0;
      quill.insertText(position, symbol, 'user');
      quill.setSelection(position + symbol.length);
    }
  };

  // Add click handler for images to allow replacement
  useEffect(() => {
    const quill = quillRef.current?.getEditor();
    if (!quill) return;

    const editorElement = quill.root;
    
    const handleImageClick = async (e) => {
      if (e.target.tagName === 'IMG') {
        e.preventDefault();
        e.stopPropagation();
        
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = async (event) => {
          const file = event.target.files?.[0];
          if (!file) return;
          
          if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
          }
          
          toast.loading('Uploading image...');
          
          try {
            const { file_url } = await base44.integrations.Core.UploadFile({ file });
            e.target.src = file_url;
            toast.dismiss();
            toast.success('Image updated!');
          } catch (error) {
            toast.dismiss();
            toast.error('Failed to upload image');
          }
        };
        
        input.click();
      }
    };
    
    editorElement.addEventListener('click', handleImageClick);
    
    return () => {
      editorElement.removeEventListener('click', handleImageClick);
    };
  }, []);

  return (
    <div className="rich-text-editor-wrapper">
      {label && <Label className="mb-2 block">{label}</Label>}
      
      <style>
        {`
          .rich-text-editor-wrapper .quill {
            background: white;
            border-radius: 0.5rem;
            border: 1px solid #e5e7eb;
          }
          
          .rich-text-editor-wrapper .ql-toolbar.ql-snow {
            border: none;
            border-bottom: 1px solid #e5e7eb;
            background: #f9fafb;
            border-radius: 0.5rem 0.5rem 0 0;
            padding: 12px;
          }
          
          .rich-text-editor-wrapper .ql-container.ql-snow {
            border: none;
            border-radius: 0 0 0.5rem 0.5rem;
          }
          
          .rich-text-editor-wrapper .ql-editor {
            min-height: 250px;
            max-height: 600px;
            overflow-y: auto;
            font-size: 15px;
            line-height: 1.6;
            padding: 16px;
          }
          
          .rich-text-editor-wrapper .ql-editor.ql-blank::before {
            font-style: normal;
            color: #9ca3af;
            left: 16px;
          }
          
          .rich-text-editor-wrapper .ql-editor p {
            margin-bottom: 0.5em;
          }
          
          .rich-text-editor-wrapper .ql-editor img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin: 8px 0;
          }
          
          .rich-text-editor-wrapper .ql-editor h1,
          .rich-text-editor-wrapper .ql-editor h2,
          .rich-text-editor-wrapper .ql-editor h3 {
            margin-top: 1em;
            margin-bottom: 0.5em;
            font-weight: 600;
          }
          
          .rich-text-editor-wrapper .ql-editor ul,
          .rich-text-editor-wrapper .ql-editor ol {
            padding-left: 1.5em;
            margin: 0.5em 0;
          }
          
          .rich-text-editor-wrapper .ql-editor blockquote {
            border-left: 4px solid #4f46e5;
            padding-left: 16px;
            margin: 1em 0;
            color: #4b5563;
          }
          
          .rich-text-editor-wrapper .ql-toolbar button {
            width: 28px !important;
            height: 28px !important;
          }
          
          .rich-text-editor-wrapper .ql-toolbar button:hover {
            color: #4f46e5 !important;
          }
          
          .rich-text-editor-wrapper .ql-toolbar .ql-stroke {
            stroke: #374151 !important;
          }
          
          .rich-text-editor-wrapper .ql-toolbar .ql-fill {
            fill: #374151 !important;
          }
          
          .rich-text-editor-wrapper .ql-toolbar button:hover .ql-stroke {
            stroke: #4f46e5 !important;
          }
          
          .rich-text-editor-wrapper .ql-toolbar button:hover .ql-fill {
            fill: #4f46e5 !important;
          }
          
          .rich-text-editor-wrapper .ql-toolbar button.ql-active {
            color: #4f46e5 !important;
          }
          
          .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-stroke {
            stroke: #4f46e5 !important;
          }
          
          .rich-text-editor-wrapper .ql-toolbar button.ql-active .ql-fill {
            fill: #4f46e5 !important;
          }
          
          .symbol-picker {
            margin-top: 12px;
            padding: 12px;
            background: #f9fafb;
            border-radius: 0.5rem;
            border: 1px solid #e5e7eb;
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
            margin-bottom: 8px;
            letter-spacing: 0.5px;
          }
          
          .symbol-grid {
            display: flex;
            flex-wrap: wrap;
            gap: 4px;
          }
          
          .symbol-btn {
            padding: 8px 10px;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            font-size: 16px;
            transition: all 0.15s;
            min-width: 38px;
            text-align: center;
          }
          
          .symbol-btn:hover {
            background: #eef2ff;
            border-color: #4f46e5;
            transform: scale(1.05);
          }
        `}
      </style>
      
      <ReactQuill 
        ref={quillRef}
        theme="snow"
        value={value || ''}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder || "Start writing..."}
        preserveWhitespace
      />
      
      <div className="symbol-picker">
        <div className="symbol-section">
          <div className="symbol-section-title">Quick Insert Symbols</div>
          <div className="symbol-grid">
            {SYMBOLS.arrows.map((symbol, i) => (
              <button
                key={`arrow-${i}`}
                className="symbol-btn"
                onClick={() => handleSymbolClick(symbol)}
                type="button"
                title={symbol}
              >
                {symbol}
              </button>
            ))}
            {SYMBOLS.chemistry.slice(0, 8).map((symbol, i) => (
              <button
                key={`chem-${i}`}
                className="symbol-btn"
                onClick={() => handleSymbolClick(symbol)}
                type="button"
                style={{ fontSize: '13px' }}
                title={symbol}
              >
                {symbol}
              </button>
            ))}
            {SYMBOLS.math.slice(0, 10).map((symbol, i) => (
              <button
                key={`math-${i}`}
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
        
        <details className="mt-3">
          <summary className="cursor-pointer text-xs font-medium text-gray-600 hover:text-indigo-600 transition-colors">
            Show All Symbols
          </summary>
          <div className="mt-3 space-y-3">
            <div className="symbol-section">
              <div className="symbol-section-title">All Chemistry</div>
              <div className="symbol-grid">
                {SYMBOLS.chemistry.map((symbol, i) => (
                  <button
                    key={`all-chem-${i}`}
                    className="symbol-btn"
                    onClick={() => handleSymbolClick(symbol)}
                    type="button"
                    style={{ fontSize: '13px' }}
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
                    key={`organic-${i}`}
                    className="symbol-btn"
                    onClick={() => handleSymbolClick(symbol)}
                    type="button"
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="symbol-section">
              <div className="symbol-section-title">All Math</div>
              <div className="symbol-grid">
                {SYMBOLS.math.map((symbol, i) => (
                  <button
                    key={`all-math-${i}`}
                    className="symbol-btn"
                    onClick={() => handleSymbolClick(symbol)}
                    type="button"
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="symbol-section">
              <div className="symbol-section-title">Shapes</div>
              <div className="symbol-grid">
                {SYMBOLS.shapes.map((symbol, i) => (
                  <button
                    key={`shape-${i}`}
                    className="symbol-btn"
                    onClick={() => handleSymbolClick(symbol)}
                    type="button"
                  >
                    {symbol}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </details>
      </div>
    </div>
  );
}