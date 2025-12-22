import React, { useCallback, useEffect } from 'react';
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
import { Node } from '@tiptap/core';
import { Label } from '@/components/ui/label';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  Code, Heading1, Heading2, Heading3, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Quote, Minus, Link as LinkIcon, Image as ImageIcon,
  Undo, Redo, Table as TableIcon, Subscript as SubIcon,
  Superscript as SuperIcon, Highlighter, Info, AlertTriangle,
  CheckCircle, Lightbulb, Square, BarChart3, HelpCircle, Zap
} from 'lucide-react';

const SYMBOLS = {
  arrows: ['→', '←', '↑', '↓', '↔', '⇒', '⇐', '⇔', '↗', '↘'],
  chemistry: ['H₂O', 'CO₂', 'O₂', 'N₂', 'CH₄', 'NH₃', 'H₂SO₄', 'NaCl', 'Ca²⁺', 'OH⁻', 'Fe³⁺', 'SO₄²⁻'],
  math: ['π', '∑', '∫', '√', '∞', '≈', '≠', '≤', '≥', '±', '×', '÷', '∂', 'Δ', 'α', 'β', 'γ', 'θ', 'λ', 'μ'],
  shapes: ['○', '●', '□', '■', '△', '▲', '◇', '◆', '☆', '★'],
  organic: ['—', '≡', '⌬', '⟲', '⟳', 'CH₃', 'CH₂', 'COOH', 'OH', 'NH₂']
};

// Custom Card Extension
const Card = Node.create({
  name: 'card',
  group: 'block',
  content: 'block+',
  
  addAttributes() {
    return {
      type: {
        default: 'definition',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-card]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const type = node.attrs.type;
    const styles = {
      definition: 'background: linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%); border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); color: #0C4A6E; border: 1px solid #7DD3FC;',
      concept: 'background: linear-gradient(135deg, #DCFCE7 0%, #BBF7D0 100%); border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); color: #14532D; border: 1px solid #86EFAC;',
      diagram: 'background: white; border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); color: #1F2937; border: 2px solid #E5E7EB;',
      key: 'background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); color: #78350F; border: 1px solid #FCD34D;',
      note: 'background: linear-gradient(135deg, #F3E8FF 0%, #E9D5FF 100%); border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); color: #581C87; border: 1px solid #D8B4FE;',
      warning: 'background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%); border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); color: #7F1D1D; border: 1px solid #FCA5A5;',
      example: 'background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%); border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); color: #064E3B; border: 1px solid #6EE7B7;',
      important: 'background: linear-gradient(135deg, #FED7AA 0%, #FDBA74 100%); border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); color: #7C2D12; border: 1px solid #FB923C;',
      tip: 'background: linear-gradient(135deg, #CFFAFE 0%, #A5F3FC 100%); border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); color: #164E63; border: 1px solid #67E8F9;',
      summary: 'background: linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%); border-radius: 16px; padding: 24px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); color: #4C1D95; border: 1px solid #A78BFA;',
    };

    return [
      'div',
      {
        'data-card': type,
        style: `${styles[type] || styles.definition} margin: 16px 0;`,
      },
      0,
    ];
  },

  addCommands() {
    return {
      setCard: (attributes) => ({ commands }) => {
        return commands.wrapIn(this.name, attributes);
      },
    };
  },
});

// Poll Extension
const Poll = Node.create({
  name: 'poll',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      question: {
        default: 'What do you think?',
      },
      options: {
        default: ['Option 1', 'Option 2', 'Option 3'],
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-poll]' }];
  },

  renderHTML({ node }) {
    const { question, options } = node.attrs;
    const optionsHtml = options.map((opt, i) => 
      `<div style="padding: 12px 16px; margin: 8px 0; background: white; border: 2px solid #E5E7EB; border-radius: 8px; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.borderColor='#6366F1'; this.style.background='#EEF2FF'" onmouseout="this.style.borderColor='#E5E7EB'; this.style.background='white'">
        <input type="radio" name="poll-${Date.now()}" id="opt-${i}" style="margin-right: 8px;">
        <label for="opt-${i}" style="cursor: pointer; font-size: 15px;">${opt}</label>
      </div>`
    ).join('');

    return [
      'div',
      {
        'data-poll': '',
        style: 'background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); padding: 24px; border-radius: 16px; margin: 16px 0; border: 2px solid #C7D2FE;',
      },
      [
        'div',
        { style: 'margin-bottom: 16px;' },
        [
          'h4',
          { style: 'font-size: 18px; font-weight: 600; color: #312E81; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;' },
          ['span', { innerHTML: '📊' }],
          ['span', {}, question]
        ],
        ['p', { style: 'font-size: 13px; color: #6366F1;' }, 'Interactive Poll - Click to vote'],
      ],
      ['div', { innerHTML: optionsHtml }],
    ];
  },

  addCommands() {
    return {
      insertPoll: (attrs) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs,
        });
      },
    };
  },
});

// Quiz Extension
const Quiz = Node.create({
  name: 'quiz',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      question: {
        default: 'What is the correct answer?',
      },
      options: {
        default: ['Answer A', 'Answer B', 'Answer C', 'Answer D'],
      },
      correct: {
        default: 0,
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-quiz]' }];
  },

  renderHTML({ node }) {
    const { question, options, correct } = node.attrs;
    const optionsHtml = options.map((opt, i) => 
      `<div style="padding: 12px 16px; margin: 8px 0; background: white; border: 2px solid #E5E7EB; border-radius: 8px; cursor: pointer; transition: all 0.2s;" onclick="
        if(${i} === ${correct}) {
          this.style.borderColor='#10B981'; 
          this.style.background='#D1FAE5';
          this.innerHTML='✅ ' + this.textContent;
        } else {
          this.style.borderColor='#EF4444'; 
          this.style.background='#FEE2E2';
          this.innerHTML='❌ ' + this.textContent;
        }
      ">${opt}</div>`
    ).join('');

    return [
      'div',
      {
        'data-quiz': '',
        style: 'background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); padding: 24px; border-radius: 16px; margin: 16px 0; border: 2px solid #FCD34D;',
      },
      [
        'div',
        { style: 'margin-bottom: 16px;' },
        [
          'h4',
          { style: 'font-size: 18px; font-weight: 600; color: #78350F; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;' },
          ['span', { innerHTML: '🎯' }],
          ['span', {}, question]
        ],
        ['p', { style: 'font-size: 13px; color: #D97706;' }, 'Click an option to check your answer'],
      ],
      ['div', { innerHTML: optionsHtml }],
    ];
  },

  addCommands() {
    return {
      insertQuiz: (attrs) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs,
        });
      },
    };
  },
});

// Interactive Image with Hotspots
const InteractiveImage = Node.create({
  name: 'interactiveImage',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      src: {
        default: 'https://via.placeholder.com/800x500/4F46E5/FFFFFF?text=Add+Your+Image',
      },
      hotspots: {
        default: [
          { x: 25, y: 25, label: 'Point 1', info: 'Click to learn more' },
          { x: 75, y: 75, label: 'Point 2', info: 'Additional information' },
        ],
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-interactive-image]' }];
  },

  renderHTML({ node }) {
    const { src, hotspots } = node.attrs;
    const hotspotsHtml = hotspots.map((spot, i) => 
      `<div style="position: absolute; left: ${spot.x}%; top: ${spot.y}%; transform: translate(-50%, -50%);">
        <div style="width: 24px; height: 24px; background: #EF4444; border: 3px solid white; border-radius: 50%; cursor: pointer; box-shadow: 0 2px 8px rgba(0,0,0,0.3); animation: pulse 2s infinite;" 
             onclick="alert('${spot.label}: ${spot.info}')"></div>
        <div style="position: absolute; top: -35px; left: 50%; transform: translateX(-50%); background: #1F2937; color: white; padding: 4px 8px; border-radius: 6px; font-size: 11px; white-space: nowrap; opacity: 0; transition: opacity 0.2s;" 
             onmouseenter="this.style.opacity='1'" onmouseleave="this.style.opacity='0'">${spot.label}</div>
      </div>`
    ).join('');

    return [
      'div',
      {
        'data-interactive-image': '',
        style: 'position: relative; margin: 16px 0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);',
      },
      ['img', { src, style: 'width: 100%; display: block;' }],
      ['div', { innerHTML: hotspotsHtml, style: 'position: absolute; inset: 0;' }],
      [
        'style',
        {},
        '@keyframes pulse { 0%, 100% { transform: translate(-50%, -50%) scale(1); } 50% { transform: translate(-50%, -50%) scale(1.2); } }'
      ],
    ];
  },

  addCommands() {
    return {
      insertInteractiveImage: (attrs) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs,
        });
      },
    };
  },
});

// Q&A Section
const QASection = Node.create({
  name: 'qaSection',
  group: 'block',
  content: 'block+',

  parseHTML() {
    return [{ tag: 'div[data-qa-section]' }];
  },

  renderHTML() {
    return [
      'div',
      {
        'data-qa-section': '',
        style: 'background: linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%); padding: 24px; border-radius: 16px; margin: 16px 0; border-left: 6px solid #14B8A6;',
      },
      [
        'div',
        { style: 'display: flex; align-items: center; gap: 10px; margin-bottom: 16px;' },
        ['span', { style: 'font-size: 24px;' }, '💬'],
        ['h4', { style: 'font-size: 18px; font-weight: 600; color: #134E4A; margin: 0;' }, 'Question & Answer'],
      ],
      ['div', { style: 'background: white; padding: 16px; border-radius: 8px; margin-bottom: 12px;' }, 0],
    ];
  },

  addCommands() {
    return {
      insertQASection: () => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '❓ Question: Type your question here' }],
            },
            {
              type: 'paragraph',
              content: [{ type: 'text', text: '✅ Answer: Type the answer here' }],
            },
          ],
        });
      },
    };
  },
});

// Card Grid Extension
const CardGrid = Node.create({
  name: 'cardGrid',
  group: 'block',
  content: 'card+',
  
  addAttributes() {
    return {
      columns: {
        default: 2,
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-card-grid]',
      },
    ];
  },

  renderHTML({ node }) {
    const cols = node.attrs.columns;
    return [
      'div',
      {
        'data-card-grid': cols,
        style: `display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 20px; margin: 24px 0;`,
      },
      0,
    ];
  },

  addCommands() {
    return {
      insertCardGrid: (attributes) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs: attributes,
          content: [
            {
              type: 'card',
              attrs: { type: 'definition' },
              content: [{ type: 'paragraph' }],
            },
            {
              type: 'card',
              attrs: { type: 'definition' },
              content: [{ type: 'paragraph' }],
            },
          ],
        });
      },
    };
  },
});

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
      Card,
      CardGrid,
      Poll,
      Quiz,
      InteractiveImage,
      QASection,
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

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

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

          .rich-text-editor-wrapper .ProseMirror div[data-card] {
            margin: 16px 0;
            padding: 24px;
            border-radius: 16px;
          }

          .rich-text-editor-wrapper .ProseMirror div[data-card] p:first-child {
            margin-top: 0;
          }

          .rich-text-editor-wrapper .ProseMirror div[data-card] p:last-child {
            margin-bottom: 0;
          }

          .rich-text-editor-wrapper .ProseMirror div[data-card-grid] {
            margin: 24px 0;
            display: grid;
            gap: 20px;
          }

          .rich-text-editor-wrapper .ProseMirror div[data-card-grid] > div[data-card] {
            margin: 0;
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

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <div className="relative group">
          <MenuButton
            onClick={() => {}}
            title="Interactive Elements"
          >
            <Zap className="w-4 h-4" />
          </MenuButton>
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-3 hidden group-hover:block z-50 min-w-[240px]">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Interactive Elements</p>
            <button
              onClick={() => editor.chain().focus().insertPoll({ 
                question: 'What do you think?',
                options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree']
              }).run()}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-50 transition-colors text-left mb-1"
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Poll</span>
            </button>
            <button
              onClick={() => editor.chain().focus().insertQuiz({ 
                question: 'Test your knowledge:',
                options: ['Option A', 'Option B', 'Option C', 'Option D'],
                correct: 0
              }).run()}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-yellow-50 transition-colors text-left mb-1"
            >
              <HelpCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">Quiz Question</span>
            </button>
            <button
              onClick={() => editor.chain().focus().insertInteractiveImage({ 
                src: 'https://via.placeholder.com/800x500/6366F1/FFFFFF?text=Click+Image+to+Upload',
                hotspots: [
                  { x: 30, y: 30, label: 'Point 1', info: 'First key area' },
                  { x: 70, y: 70, label: 'Point 2', info: 'Second key area' }
                ]
              }).run()}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-red-50 transition-colors text-left mb-1"
            >
              <ImageIcon className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-gray-700">Interactive Image</span>
            </button>
            <button
              onClick={() => editor.chain().focus().insertQASection().run()}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-teal-50 transition-colors text-left"
            >
              <HelpCircle className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">Q&A Section</span>
            </button>
          </div>
        </div>

        <div className="relative group">
          <MenuButton
            onClick={() => {}}
            title="Insert Cards"
          >
            <Square className="w-4 h-4" />
          </MenuButton>
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-3 hidden group-hover:block z-50 min-w-[280px] max-h-[500px] overflow-y-auto">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Card Types</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => editor.chain().focus().setCard({ type: 'definition' }).run()}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-left"
              >
                <Info className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-medium text-blue-900">Definition</span>
              </button>
              <button
                onClick={() => editor.chain().focus().setCard({ type: 'concept' }).run()}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors text-left"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-xs font-medium text-green-900">Concept</span>
              </button>
              <button
                onClick={() => editor.chain().focus().setCard({ type: 'key' }).run()}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors text-left"
              >
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span className="text-xs font-medium text-yellow-900">Key Point</span>
              </button>
              <button
                onClick={() => editor.chain().focus().setCard({ type: 'note' }).run()}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors text-left"
              >
                <Info className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-medium text-purple-900">Note</span>
              </button>
              <button
                onClick={() => editor.chain().focus().setCard({ type: 'warning' }).run()}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors text-left"
              >
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-xs font-medium text-red-900">Warning</span>
              </button>
              <button
                onClick={() => editor.chain().focus().setCard({ type: 'diagram' }).run()}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <Square className="w-5 h-5 text-gray-600" />
                <span className="text-xs font-medium text-gray-900">Diagram</span>
              </button>
              <button
                onClick={() => editor.chain().focus().setCard({ type: 'example' }).run()}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-teal-50 hover:bg-teal-100 transition-colors text-left"
              >
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                <span className="text-xs font-medium text-teal-900">Example</span>
              </button>
              <button
                onClick={() => editor.chain().focus().setCard({ type: 'important' }).run()}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors text-left"
              >
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="text-xs font-medium text-orange-900">Important</span>
              </button>
              <button
                onClick={() => editor.chain().focus().setCard({ type: 'tip' }).run()}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-cyan-50 hover:bg-cyan-100 transition-colors text-left"
              >
                <Lightbulb className="w-5 h-5 text-cyan-600" />
                <span className="text-xs font-medium text-cyan-900">Tip</span>
              </button>
              <button
                onClick={() => editor.chain().focus().setCard({ type: 'summary' }).run()}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-violet-50 hover:bg-violet-100 transition-colors text-left"
              >
                <Info className="w-5 h-5 text-violet-600" />
                <span className="text-xs font-medium text-violet-900">Summary</span>
              </button>
              </div>
            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Card Layouts</p>
              <button
                onClick={() => editor.chain().focus().insertCardGrid({ columns: 2 }).run()}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-blue-200 rounded"></div>
                  <div className="w-3 h-3 bg-blue-200 rounded"></div>
                </div>
                <span className="text-xs font-medium text-gray-700">2 Column Grid</span>
              </button>
              <button
                onClick={() => editor.chain().focus().insertCardGrid({ columns: 3 }).run()}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex gap-1">
                  <div className="w-2 h-3 bg-green-200 rounded"></div>
                  <div className="w-2 h-3 bg-green-200 rounded"></div>
                  <div className="w-2 h-3 bg-green-200 rounded"></div>
                </div>
                <span className="text-xs font-medium text-gray-700">3 Column Grid</span>
              </button>
              <button
                onClick={() => editor.chain().focus().insertCardGrid({ columns: 4 }).run()}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex gap-1">
                  <div className="w-2 h-3 bg-purple-200 rounded"></div>
                  <div className="w-2 h-3 bg-purple-200 rounded"></div>
                  <div className="w-2 h-3 bg-purple-200 rounded"></div>
                  <div className="w-2 h-3 bg-purple-200 rounded"></div>
                </div>
                <span className="text-xs font-medium text-gray-700">4 Column Grid</span>
              </button>
            </div>
          </div>
        </div>
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