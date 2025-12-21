import React, { useCallback } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';
import Underline from '@tiptap/extension-underline';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  Code, Heading1, Heading2, Heading3, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Quote, Minus, Link as LinkIcon, Image as ImageIcon,
  Undo, Redo, Table as TableIcon, Subscript as SubIcon,
  Superscript as SuperIcon, Highlighter
} from 'lucide-react';

const SYMBOLS = {
  arrows: ['→', '←', '↑', '↓', '↔', '⇒', '⇐', '⇔', '↗', '↘'],
  chemistry: ['H₂O', 'CO₂', 'O₂', 'N₂', 'CH₄', 'NH₃', 'H₂SO₄', 'NaCl', 'Ca²⁺', 'OH⁻', 'Fe³⁺', 'SO₄²⁻'],
  math: ['π', '∑', '∫', '√', '∞', '≈', '≠', '≤', '≥', '±', '×', '÷', '∂', 'Δ', 'α', 'β', 'γ', 'θ', 'λ', 'μ'],
  shapes: ['○', '●', '□', '■', '△', '▲', '◇', '◆', '☆', '★'],
  organic: ['—', '≡', '⌬', '⟲', '⟳', 'CH₃', 'CH₂', 'COOH', 'OH', 'NH₂']
};

const MenuButton = ({ onClick, isActive, children, title }) => (
  <button
    onClick={onClick}
    type="button"
    title={title}
    className={`p-2 rounded hover:bg-indigo-100 transition-colors ${
      isActive ? 'bg-indigo-100 text-indigo-600' : 'text-gray-700'
    }`}
  >
    {children}
  </button>
);

export default function RichTextEditor({ value = '', onChange, placeholder, label }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      Image.configure({
        inline: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded cursor-pointer',
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse table-auto w-full',
        },
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 p-2',
        },
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-gray-300 p-2 bg-gray-100 font-bold',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      TextStyle,
      Color,
      Highlight.configure({
        multicolor: true
      }),
      Subscript,
      Superscript,
      Underline,
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[250px] max-h-[600px] overflow-y-auto p-4',
        placeholder: placeholder || 'Start writing...',
      },
      handleClickOn: (view, pos, node, nodePos, event) => {
        if (node.type.name === 'image') {
          event.preventDefault();
          handleImageReplace(node, nodePos);
        }
      },
    },
  }, []);

  const handleImageUpload = useCallback(async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      const loadingToast = toast.loading('Uploading image...');
      
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        editor?.chain().focus().setImage({ src: file_url }).run();
        toast.dismiss(loadingToast);
        toast.success('Image inserted!');
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error('Failed to upload image');
      }
    };
    
    input.click();
  }, [editor]);

  const handleImageReplace = useCallback(async (node, pos) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      const loadingToast = toast.loading('Uploading image...');
      
      try {
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        editor?.chain().focus().setNodeSelection(pos).setImage({ src: file_url }).run();
        toast.dismiss(loadingToast);
        toast.success('Image updated!');
      } catch (error) {
        toast.dismiss(loadingToast);
        toast.error('Failed to upload image');
      }
    };
    
    input.click();
  }, [editor]);

  const addLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor?.chain().focus().setLink({ href: url }).run();
    }
  }, [editor]);

  const insertSymbol = useCallback((symbol) => {
    editor?.chain().focus().insertContent(symbol).run();
  }, [editor]);

  if (!editor) {
    return null;
  }

  return (
    <div className="rich-text-editor-wrapper">
      {label && <Label className="mb-2 block">{label}</Label>}
      
      <style>
        {`
          .rich-text-editor-wrapper .ProseMirror {
            background: white;
            border: 1px solid #e5e7eb;
            border-top: none;
            border-radius: 0 0 0.5rem 0.5rem;
            font-size: 15px;
            line-height: 1.6;
          }
          
          .rich-text-editor-wrapper .ProseMirror:focus {
            outline: none;
          }
          
          .rich-text-editor-wrapper .ProseMirror p.is-editor-empty:first-child::before {
            content: attr(placeholder);
            color: #9ca3af;
            pointer-events: none;
            float: left;
            height: 0;
          }
          
          .rich-text-editor-wrapper .ProseMirror img {
            max-width: 100%;
            height: auto;
            border-radius: 4px;
            margin: 8px 0;
          }
          
          .rich-text-editor-wrapper .ProseMirror h1,
          .rich-text-editor-wrapper .ProseMirror h2,
          .rich-text-editor-wrapper .ProseMirror h3 {
            margin-top: 1em;
            margin-bottom: 0.5em;
            font-weight: 600;
          }
          
          .rich-text-editor-wrapper .ProseMirror ul,
          .rich-text-editor-wrapper .ProseMirror ol {
            padding-left: 1.5em;
            margin: 0.5em 0;
          }
          
          .rich-text-editor-wrapper .ProseMirror blockquote {
            border-left: 4px solid #4f46e5;
            padding-left: 16px;
            margin: 1em 0;
            color: #4b5563;
          }
          
          .rich-text-editor-wrapper .ProseMirror table {
            border-collapse: collapse;
            margin: 1em 0;
            width: 100%;
          }
          
          .rich-text-editor-wrapper .ProseMirror table td,
          .rich-text-editor-wrapper .ProseMirror table th {
            border: 1px solid #e5e7eb;
            padding: 8px 12px;
            min-width: 50px;
          }
          
          .rich-text-editor-wrapper .ProseMirror table th {
            background-color: #f9fafb;
            font-weight: 600;
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
      
      {/* Toolbar */}
      <div className="bg-gray-50 border border-gray-200 rounded-t-lg p-2 flex flex-wrap gap-1">
        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          title="Undo"
        >
          <Undo className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          title="Redo"
        >
          <Redo className="w-4 h-4" />
        </MenuButton>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="w-4 h-4" />
        </MenuButton>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          title="Underline"
        >
          <UnderlineIcon className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough className="w-4 h-4" />
        </MenuButton>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <MenuButton
          onClick={() => editor.chain().focus().toggleSubscript().run()}
          isActive={editor.isActive('subscript')}
          title="Subscript"
        >
          <SubIcon className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleSuperscript().run()}
          isActive={editor.isActive('superscript')}
          title="Superscript"
        >
          <SuperIcon className="w-4 h-4" />
        </MenuButton>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </MenuButton>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          title="Align Left"
        >
          <AlignLeft className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          title="Align Center"
        >
          <AlignCenter className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
          title="Align Right"
        >
          <AlignRight className="w-4 h-4" />
        </MenuButton>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          isActive={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus className="w-4 h-4" />
        </MenuButton>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <MenuButton
          onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3 }).run()}
          title="Insert Table"
        >
          <TableIcon className="w-4 h-4" />
        </MenuButton>
        
        <div className="w-px h-6 bg-gray-300 mx-1" />
        
        <MenuButton
          onClick={addLink}
          isActive={editor.isActive('link')}
          title="Add Link"
        >
          <LinkIcon className="w-4 h-4" />
        </MenuButton>
        <MenuButton
          onClick={handleImageUpload}
          title="Insert Image"
        >
          <ImageIcon className="w-4 h-4" />
        </MenuButton>
      </div>
      
      {/* Editor */}
      <EditorContent editor={editor} />
      
      {/* Symbol Picker */}
      <div className="symbol-picker">
        <div className="symbol-section">
          <div className="symbol-section-title">Quick Insert Symbols</div>
          <div className="symbol-grid">
            {SYMBOLS.arrows.map((symbol, i) => (
              <button
                key={`arrow-${i}`}
                className="symbol-btn"
                onClick={() => insertSymbol(symbol)}
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
                onClick={() => insertSymbol(symbol)}
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
                onClick={() => insertSymbol(symbol)}
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
                    onClick={() => insertSymbol(symbol)}
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
                    onClick={() => insertSymbol(symbol)}
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
                    onClick={() => insertSymbol(symbol)}
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
                    onClick={() => insertSymbol(symbol)}
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