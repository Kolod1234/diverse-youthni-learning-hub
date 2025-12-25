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
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import { Node } from '@tiptap/core';
import { Extension } from '@tiptap/core';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { base44 } from '@/api/base44Client';
import { toast } from 'sonner';
import { 
  Bold, Italic, Underline as UnderlineIcon, Strikethrough, 
  Code, Heading1, Heading2, Heading3, List, ListOrdered,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  Quote, Minus, Link as LinkIcon, Image as ImageIcon,
  Undo, Redo, Table as TableIcon, Subscript as SubIcon,
  Superscript as SuperIcon, Highlighter, Info, AlertTriangle,
  CheckCircle, CheckCircle2, Lightbulb, Square, BarChart3, HelpCircle, Zap,
  Palette, Type, Space, Clock
} from 'lucide-react';

const SYMBOLS = {
  arrows: ['→', '←', '↑', '↓', '↔', '⇒', '⇐', '⇔', '↗', '↘'],
  chemistry: ['H₂O', 'CO₂', 'O₂', 'N₂', 'CH₄', 'NH₃', 'H₂SO₄', 'NaCl', 'Ca²⁺', 'OH⁻', 'Fe³⁺', 'SO₄²⁻'],
  math: ['π', '∑', '∫', '√', '∞', '≈', '≠', '≤', '≥', '±', '×', '÷', '∂', 'Δ', 'α', 'β', 'γ', 'θ', 'λ', 'μ'],
  shapes: ['○', '●', '□', '■', '△', '▲', '◇', '◆', '☆', '★'],
  organic: ['—', '≡', '⌬', '⟲', '⟳', 'CH₃', 'CH₂', 'COOH', 'OH', 'NH₂']
};

// Font Size Extension
const FontSize = Extension.create({
  name: 'fontSize',
  
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: element => element.style.fontSize.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontSize) {
                return {};
              }
              return {
                style: `font-size: ${attributes.fontSize}`,
              };
            },
          },
        },
      },
    ];
  },
  
  addCommands() {
    return {
      setFontSize: fontSize => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

// Font Family Extension
const FontFamily = Extension.create({
  name: 'fontFamily',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontFamily: {
            default: null,
            parseHTML: element => element.style.fontFamily?.replace(/['"]+/g, ''),
            renderHTML: attributes => {
              if (!attributes.fontFamily) {
                return {};
              }
              return {
                style: `font-family: ${attributes.fontFamily}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setFontFamily: fontFamily => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontFamily })
          .run();
      },
      unsetFontFamily: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { fontFamily: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

// Background Color Extension
const BackgroundColor = Extension.create({
  name: 'backgroundColor',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          backgroundColor: {
            default: null,
            parseHTML: element => element.style.backgroundColor,
            renderHTML: attributes => {
              if (!attributes.backgroundColor) {
                return {};
              }
              return {
                style: `background-color: ${attributes.backgroundColor}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setBackgroundColor: backgroundColor => ({ chain }) => {
        return chain()
          .setMark('textStyle', { backgroundColor })
          .run();
      },
      unsetBackgroundColor: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { backgroundColor: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

// Line Height Extension
const LineHeight = Extension.create({
  name: 'lineHeight',

  addOptions() {
    return {
      types: ['paragraph', 'heading'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: element => element.style.lineHeight,
            renderHTML: attributes => {
              if (!attributes.lineHeight) {
                return {};
              }
              return {
                style: `line-height: ${attributes.lineHeight}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setLineHeight: lineHeight => ({ commands }) => {
        return this.options.types.every(type => commands.updateAttributes(type, { lineHeight }));
      },
      unsetLineHeight: () => ({ commands }) => {
        return this.options.types.every(type => commands.resetAttributes(type, 'lineHeight'));
      },
    };
  },
});

// Paragraph Spacing Extension
const ParagraphSpacing = Extension.create({
  name: 'paragraphSpacing',

  addOptions() {
    return {
      types: ['paragraph'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          marginTop: {
            default: null,
            parseHTML: element => element.style.marginTop,
            renderHTML: attributes => {
              if (!attributes.marginTop) {
                return {};
              }
              return {
                style: `margin-top: ${attributes.marginTop}`,
              };
            },
          },
          marginBottom: {
            default: null,
            parseHTML: element => element.style.marginBottom,
            renderHTML: attributes => {
              if (!attributes.marginBottom) {
                return {};
              }
              return {
                style: `margin-bottom: ${attributes.marginBottom}`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setParagraphSpacing: (spacing) => ({ commands }) => {
        return commands.updateAttributes('paragraph', { 
          marginTop: spacing.top,
          marginBottom: spacing.bottom 
        });
      },
    };
  },
});

// Border Extension
const BorderStyle = Extension.create({
  name: 'borderStyle',

  addOptions() {
    return {
      types: ['textStyle'],
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          border: {
            default: null,
            parseHTML: element => element.style.border,
            renderHTML: attributes => {
              if (!attributes.border) {
                return {};
              }
              return {
                style: `border: ${attributes.border}; padding: 2px 4px; border-radius: 3px;`,
              };
            },
          },
        },
      },
    ];
  },

  addCommands() {
    return {
      setBorder: border => ({ chain }) => {
        return chain()
          .setMark('textStyle', { border })
          .run();
      },
      unsetBorder: () => ({ chain }) => {
        return chain()
          .setMark('textStyle', { border: null })
          .removeEmptyTextStyle()
          .run();
      },
    };
  },
});

// Custom Card Extension
const Card = Node.create({
  name: 'card',
  group: 'block',
  content: 'block+',
  draggable: true,
  
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
        'data-drag-handle': '',
        style: `${styles[type] || styles.definition} margin: 16px 0; cursor: move; position: relative;`,
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
  selectable: true,
  draggable: true,

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
        style: 'position: relative; background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); padding: 24px; border-radius: 16px; margin: 16px 0; border: 2px solid #C7D2FE;',
      },
      [
        'button',
        {
          onclick: 'this.parentElement.remove()',
          style: 'position: absolute; top: 8px; right: 8px; background: #EF4444; color: white; border: none; border-radius: 6px; padding: 4px 8px; font-size: 11px; cursor: pointer; font-weight: 600;',
        },
        '✕ Delete'
      ],
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
  selectable: true,
  draggable: true,

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
        style: 'position: relative; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); padding: 24px; border-radius: 16px; margin: 16px 0; border: 2px solid #FCD34D;',
      },
      [
        'button',
        {
          onclick: 'this.parentElement.remove()',
          style: 'position: absolute; top: 8px; right: 8px; background: #EF4444; color: white; border: none; border-radius: 6px; padding: 4px 8px; font-size: 11px; cursor: pointer; font-weight: 600;',
        },
        '✕ Delete'
      ],
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
  selectable: true,
  draggable: true,

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
      [
        'button',
        {
          onclick: 'this.parentElement.remove()',
          style: 'position: absolute; top: 8px; right: 8px; background: #EF4444; color: white; border: none; border-radius: 6px; padding: 4px 8px; font-size: 11px; cursor: pointer; font-weight: 600; z-index: 20;',
        },
        '✕ Delete'
      ],
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
  selectable: true,
  draggable: true,

  parseHTML() {
    return [{ tag: 'div[data-qa-section]' }];
  },

  renderHTML() {
    return [
      'div',
      {
        'data-qa-section': '',
        style: 'position: relative; background: linear-gradient(135deg, #F0FDFA 0%, #CCFBF1 100%); padding: 24px; border-radius: 16px; margin: 16px 0; border-left: 6px solid #14B8A6;',
      },
      [
        'button',
        {
          onclick: 'this.parentElement.remove()',
          style: 'position: absolute; top: 8px; right: 8px; background: #EF4444; color: white; border: none; border-radius: 6px; padding: 4px 8px; font-size: 11px; cursor: pointer; font-weight: 600;',
        },
        '✕ Delete'
      ],
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

// Drag and Drop Exercise
const DragDropExercise = Node.create({
  name: 'dragDropExercise',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      question: {
        default: 'Match the items:',
      },
      items: {
        default: ['Item 1', 'Item 2', 'Item 3'],
      },
      targets: {
        default: ['Target A', 'Target B', 'Target C'],
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-drag-drop]' }];
  },

  renderHTML({ node }) {
    const { question, items, targets } = node.attrs;
    const itemsHtml = items.map((item, i) => 
      `<div draggable="true" style="padding: 12px 16px; margin: 4px; background: linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%); color: white; border-radius: 8px; cursor: move; font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" ondragstart="event.dataTransfer.setData('text', '${i}')">${item}</div>`
    ).join('');

    const targetsHtml = targets.map((target, i) => 
      `<div ondrop="event.preventDefault(); this.style.background='#D1FAE5'; this.style.borderColor='#10B981'; this.innerHTML='✓ ' + this.getAttribute('data-target');" ondragover="event.preventDefault(); this.style.borderColor='#6366F1';" ondragleave="this.style.borderColor='#E5E7EB';" data-target="${target}" style="padding: 16px; margin: 8px 0; background: white; border: 2px dashed #E5E7EB; border-radius: 8px; min-height: 60px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; font-weight: 500; color: #6B7280;">${target}</div>`
    ).join('');

    return [
      'div',
      {
        'data-drag-drop': '',
        style: 'position: relative; background: linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%); padding: 24px; border-radius: 16px; margin: 16px 0; border: 2px solid #C7D2FE;',
      },
      [
        'button',
        {
          onclick: 'this.parentElement.remove()',
          style: 'position: absolute; top: 8px; right: 8px; background: #EF4444; color: white; border: none; border-radius: 6px; padding: 4px 8px; font-size: 11px; cursor: pointer; font-weight: 600; z-index: 10;',
        },
        '✕ Delete'
      ],
      [
        'div',
        { style: 'margin-bottom: 16px;' },
        [
          'h4',
          { style: 'font-size: 18px; font-weight: 600; color: #312E81; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;' },
          ['span', { innerHTML: '🎯' }],
          ['span', {}, question]
        ],
        ['p', { style: 'font-size: 13px; color: #6366F1;' }, 'Drag items to match them with targets'],
      ],
      ['div', { style: 'display: grid; grid-template-columns: 1fr 1fr; gap: 24px;' }, 
        ['div', { innerHTML: `<div style="font-weight: 600; margin-bottom: 12px; color: #4338CA;">Items:</div>${itemsHtml}` }],
        ['div', { innerHTML: `<div style="font-weight: 600; margin-bottom: 12px; color: #4338CA;">Targets:</div>${targetsHtml}` }]
      ],
    ];
  },

  addCommands() {
    return {
      insertDragDropExercise: (attrs) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs,
        });
      },
    };
  },
});

// Fill in the Blanks
const FillInBlanks = Node.create({
  name: 'fillInBlanks',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      text: {
        default: 'The capital of France is [Paris] and the Eiffel Tower is [324] meters tall.',
      },
      instruction: {
        default: 'Fill in the blanks:',
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-fill-blanks]' }];
  },

  renderHTML({ node }) {
    const { text, instruction } = node.attrs;
    const parts = text.split(/\[([^\]]+)\]/g);
    let htmlContent = '';

    parts.forEach((part, i) => {
      if (i % 2 === 0) {
        htmlContent += part;
      } else {
        htmlContent += `<input type="text" data-answer="${part}" style="padding: 8px 12px; margin: 0 4px; border: 2px solid #E5E7EB; border-radius: 6px; min-width: 120px; font-size: 15px;" oninput="if(this.value.toLowerCase().trim() === this.getAttribute('data-answer').toLowerCase()) { this.style.borderColor='#10B981'; this.style.background='#D1FAE5'; } else { this.style.borderColor='#E5E7EB'; this.style.background='white'; }" />`;
      }
    });

    return [
      'div',
      {
        'data-fill-blanks': '',
        style: 'position: relative; background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%); padding: 24px; border-radius: 16px; margin: 16px 0; border: 2px solid #FCD34D;',
      },
      [
        'button',
        {
          onclick: 'this.parentElement.remove()',
          style: 'position: absolute; top: 8px; right: 8px; background: #EF4444; color: white; border: none; border-radius: 6px; padding: 4px 8px; font-size: 11px; cursor: pointer; font-weight: 600;',
        },
        '✕ Delete'
      ],
      [
        'div',
        { style: 'margin-bottom: 16px;' },
        [
          'h4',
          { style: 'font-size: 18px; font-weight: 600; color: #78350F; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;' },
          ['span', { innerHTML: '✍️' }],
          ['span', {}, instruction]
        ],
        ['p', { style: 'font-size: 13px; color: #D97706;' }, 'Type your answers in the boxes - they turn green when correct!'],
      ],
      ['div', { innerHTML: htmlContent, style: 'font-size: 16px; line-height: 2; color: #1F2937;' }],
    ];
  },

  addCommands() {
    return {
      insertFillInBlanks: (attrs) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs,
        });
      },
    };
  },
});

// Timed Question Extension
const TimedQuestion = Node.create({
  name: 'timedQuestion',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      question: {
        default: 'Solve this problem:',
      },
      options: {
        default: ['Option A', 'Option B', 'Option C', 'Option D'],
      },
      correct: {
        default: 0,
      },
      timeLimit: {
        default: 60,
      },
      marks: {
        default: 10,
      },
      difficulty: {
        default: 'medium',
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-timed-question]' }];
  },

  renderHTML({ node }) {
    const { question, options, correct, timeLimit, marks, difficulty } = node.attrs;
    const difficultyColors = {
      easy: '#10B981',
      medium: '#F59E0B',
      hard: '#EF4444'
    };

    const optionsHtml = options.map((opt, i) => 
      `<button data-option="${i}" style="display: block; width: 100%; padding: 14px 18px; margin: 8px 0; background: white; border: 2px solid #E5E7EB; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-size: 15px; text-align: left; font-weight: 500;" onmouseover="this.style.borderColor='#6366F1'; this.style.background='#EEF2FF';" onmouseout="if(!this.disabled) { this.style.borderColor='#E5E7EB'; this.style.background='white'; }">${opt}</button>`
    ).join('');

    return [
      'div',
      {
        'data-timed-question': '',
        'data-correct': correct,
        'data-marks': marks,
        'data-time-limit': timeLimit,
        style: 'position: relative; background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%); padding: 28px; border-radius: 16px; margin: 16px 0; border: 3px solid #3B82F6;',
      },
      [
        'button',
        {
          onclick: 'this.parentElement.remove()',
          style: 'position: absolute; top: 8px; right: 8px; background: #EF4444; color: white; border: none; border-radius: 6px; padding: 4px 8px; font-size: 11px; cursor: pointer; font-weight: 600; z-index: 10;',
        },
        '✕ Delete'
      ],
      [
        'div',
        { style: 'display: flex; justify-content: space-between; align-items: start; margin-bottom: 16px;' },
        [
          'div',
          {},
          [
            'h4',
            { style: 'font-size: 18px; font-weight: 700; color: #1E40AF; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;' },
            ['span', { innerHTML: '⏱️' }],
            ['span', {}, question]
          ],
          [
            'div',
            { style: 'display: flex; gap: 8px; flex-wrap: wrap;' },
            [
              'span',
              { style: `background: ${difficultyColors[difficulty]}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;` },
              difficulty.toUpperCase()
            ],
            [
              'span',
              { style: 'background: #10B981; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;' },
              `${marks} marks`
            ],
            [
              'span',
              { style: 'background: #6366F1; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;' },
              `${timeLimit}s`
            ]
          ]
        ],
        [
          'div',
          { 
            class: 'timer-display',
            style: 'font-size: 32px; font-weight: 700; color: #1E40AF; min-width: 80px; text-align: center;'
          },
          `${timeLimit}s`
        ]
      ],
      [
        'div',
        { class: 'question-content' },
        [
          'button',
          {
            onclick: `
              const container = this.closest('[data-timed-question]');
              const timerDisplay = container.querySelector('.timer-display');
              const resultArea = container.querySelector('.result-area');
              const options = container.querySelectorAll('[data-option]');
              const timeLimit = parseInt(container.dataset.timeLimit);
              const correct = parseInt(container.dataset.correct);
              const marks = parseInt(container.dataset.marks);
              let timeLeft = timeLimit;
              this.disabled = true;
              this.style.opacity = '0.5';

              const timer = setInterval(() => {
                timeLeft--;
                timerDisplay.textContent = timeLeft + 's';
                if (timeLeft <= 10) timerDisplay.style.color = '#EF4444';

                if (timeLeft <= 0) {
                  clearInterval(timer);
                  options.forEach(opt => opt.disabled = true);
                  resultArea.innerHTML = '<div style="background: #FEE2E2; border: 2px solid #EF4444; padding: 16px; border-radius: 8px; margin-top: 16px;"><strong style="color: #991B1B;">⏰ Time Up!</strong><p style="color: #7F1D1D; margin-top: 4px;">Score: 0/${marks}</p></div>';
                  return;
                }
              }, 1000);

              options.forEach(opt => {
                opt.onclick = function() {
                  clearInterval(timer);
                  const selected = parseInt(this.dataset.option);
                  const isCorrect = selected === correct;
                  const score = isCorrect ? marks : 0;
                  const grade = isCorrect ? 'A+' : 'F';

                  options.forEach(o => {
                    o.disabled = true;
                    if(parseInt(o.dataset.option) === correct) {
                      o.style.borderColor = '#10B981';
                      o.style.background = '#D1FAE5';
                      o.innerHTML = '✅ ' + o.textContent;
                    } else if(parseInt(o.dataset.option) === selected && !isCorrect) {
                      o.style.borderColor = '#EF4444';
                      o.style.background = '#FEE2E2';
                      o.innerHTML = '❌ ' + o.textContent;
                    }
                  });

                  const bgColor = isCorrect ? '#D1FAE5' : '#FEE2E2';
                  const borderColor = isCorrect ? '#10B981' : '#EF4444';
                  const textColor = isCorrect ? '#14532D' : '#991B1B';

                  resultArea.innerHTML = '<div style="background: ' + bgColor + '; border: 2px solid ' + borderColor + '; padding: 16px; border-radius: 8px; margin-top: 16px;"><div style="display: flex; justify-content: space-between; align-items: center;"><div><strong style="color: ' + textColor + '; font-size: 18px;">' + (isCorrect ? '✅ Correct!' : '❌ Incorrect') + '</strong><p style="color: ' + textColor + '; margin-top: 4px;">Time taken: ' + (timeLimit - timeLeft) + 's</p></div><div style="text-align: right;"><div style="font-size: 28px; font-weight: 700; color: ' + textColor + ';">' + grade + '</div><div style="font-size: 14px; color: ' + textColor + ';">Score: ' + score + '/' + marks + '</div></div></div></div>';
                };
              });
            `,
            style: 'background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%); color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 16px; font-weight: 600; cursor: pointer; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);',
          },
          '▶️ Start Timer & Answer'
        ],
        ['div', { innerHTML: optionsHtml }],
        ['div', { class: 'result-area' }]
      ]
    ];
  },

  addCommands() {
    return {
      insertTimedQuestion: (attrs) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs,
        });
      },
    };
  },
});

// Branching Scenario
const BranchingScenario = Node.create({
  name: 'branchingScenario',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      scenario: {
        default: 'You encounter a problem in your project. What do you do?',
      },
      choices: {
        default: [
          { text: 'Research online', outcome: 'Good! You found helpful resources.' },
          { text: 'Ask for help', outcome: 'Great! Collaboration leads to better solutions.' },
          { text: 'Give up', outcome: 'Not ideal. Persistence is key to learning!' },
        ],
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-branching]' }];
  },

  renderHTML({ node }) {
    const { scenario, choices } = node.attrs;
    const choicesHtml = choices.map((choice, i) => 
      `<button onclick="
        this.parentElement.querySelectorAll('button').forEach(b => b.disabled = true);
        this.style.background = 'linear-gradient(135deg, #10B981 0%, #059669 100%)';
        this.style.color = 'white';
        const outcome = document.createElement('div');
        outcome.style.cssText = 'margin-top: 16px; padding: 16px; background: white; border-radius: 8px; border-left: 4px solid #10B981; animation: slideIn 0.3s;';
        outcome.innerHTML = '<strong>Outcome:</strong> ${choice.outcome.replace(/'/g, "\\'")}';
        this.parentElement.appendChild(outcome);
      " style="display: block; width: 100%; padding: 14px 18px; margin: 8px 0; background: white; border: 2px solid #E5E7EB; border-radius: 8px; cursor: pointer; transition: all 0.2s; font-size: 15px; text-align: left; font-weight: 500;" onmouseover="this.style.borderColor='#6366F1'; this.style.background='#EEF2FF';" onmouseout="if(!this.disabled) { this.style.borderColor='#E5E7EB'; this.style.background='white'; }">${choice.text}</button>`
    ).join('');

    return [
      'div',
      {
        'data-branching': '',
        style: 'position: relative; background: linear-gradient(135deg, #FCE7F3 0%, #FBCFE8 100%); padding: 24px; border-radius: 16px; margin: 16px 0; border: 2px solid #F9A8D4;',
      },
      [
        'button',
        {
          onclick: 'this.parentElement.remove()',
          style: 'position: absolute; top: 8px; right: 8px; background: #EF4444; color: white; border: none; border-radius: 6px; padding: 4px 8px; font-size: 11px; cursor: pointer; font-weight: 600; z-index: 10;',
        },
        '✕ Delete'
      ],
      [
        'div',
        { style: 'margin-bottom: 16px;' },
        [
          'h4',
          { style: 'font-size: 18px; font-weight: 600; color: #831843; margin-bottom: 4px; display: flex; align-items: center; gap: 8px;' },
          ['span', { innerHTML: '🌳' }],
          ['span', {}, 'Decision Point']
        ],
        ['p', { style: 'font-size: 15px; color: #1F2937; line-height: 1.6; margin-top: 12px;' }, scenario],
      ],
      ['div', { innerHTML: choicesHtml }],
      ['style', {}, '@keyframes slideIn { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }'],
    ];
  },

  addCommands() {
    return {
      insertBranchingScenario: (attrs) => ({ commands }) => {
        return commands.insertContent({
          type: this.name,
          attrs,
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
  selectable: true,
  draggable: true,

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
        style: `position: relative; display: grid; grid-template-columns: repeat(${cols}, 1fr); gap: 20px; margin: 24px 0; padding: 20px; border: 2px dashed #E5E7EB; border-radius: 12px;`,
      },
      [
        'button',
        {
          onclick: 'this.parentElement.remove()',
          style: 'position: absolute; top: 4px; right: 4px; background: #EF4444; color: white; border: none; border-radius: 6px; padding: 4px 8px; font-size: 11px; cursor: pointer; font-weight: 600; z-index: 10;',
        },
        '✕ Delete Grid'
      ],
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
  const [showInteractive, setShowInteractive] = React.useState(false);
  const [showCards, setShowCards] = React.useState(false);
  const [showFontColor, setShowFontColor] = React.useState(false);
  const [showBgColor, setShowBgColor] = React.useState(false);
  const [showHighlightColor, setShowHighlightColor] = React.useState(false);
  const [showBorder, setShowBorder] = React.useState(false);
  const [showSpacing, setShowSpacing] = React.useState(false);
  
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      Dropcursor.configure({
        color: '#6366F1',
        width: 4,
        class: 'drop-cursor',
      }),
      Gapcursor,
      Image.configure({
        inline: false,
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full h-auto rounded cursor-pointer',
          style: 'display: block; margin: 8px 0;',
        },
      }).extend({
        addAttributes() {
          return {
            ...this.parent?.(),
            width: {
              default: null,
              parseHTML: element => element.getAttribute('width'),
              renderHTML: attributes => {
                if (!attributes.width) return {};
                return { width: attributes.width };
              },
            },
            height: {
              default: null,
              parseHTML: element => element.getAttribute('height'),
              renderHTML: attributes => {
                if (!attributes.height) return {};
                return { height: attributes.height };
              },
            },
          };
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
      FontFamily,
      FontSize,
      BackgroundColor,
      LineHeight,
      ParagraphSpacing,
      BorderStyle,
      Card,
      CardGrid,
      Poll,
      Quiz,
      TimedQuestion,
      InteractiveImage,
      QASection,
      DragDropExercise,
      FillInBlanks,
      BranchingScenario,
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
      handlePaste: (view, event, slice) => {
        const items = Array.from(event.clipboardData?.items || []);
        const imageItem = items.find(item => item.type.indexOf('image') === 0);

        if (imageItem) {
          event.preventDefault();
          const file = imageItem.getAsFile();
          if (file) {
            handleImagePaste(file);
          }
          return true;
        }
        return false;
      },
      handleDrop: (view, event, slice, moved) => {
        if (!moved && event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0]) {
          const file = event.dataTransfer.files[0];
          if (file.type.indexOf('image') === 0) {
            event.preventDefault();
            handleImagePaste(file);
            return true;
          }
        }
        return false;
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

  const handleImagePaste = useCallback(async (file) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please paste an image file');
      return;
    }
    
    const loadingToast = toast.loading('Uploading pasted image...');
    
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      editor?.chain().focus().setImage({ src: file_url }).run();
      toast.dismiss(loadingToast);
      toast.success('Image pasted!');
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error('Failed to upload image');
    }
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

  const changeCase = useCallback((caseType) => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to, '');
    
    let newText = text;
    switch (caseType) {
      case 'uppercase':
        newText = text.toUpperCase();
        break;
      case 'lowercase':
        newText = text.toLowerCase();
        break;
      case 'capitalize':
        newText = text.replace(/\b\w/g, l => l.toUpperCase());
        break;
    }
    
    editor.chain().focus().deleteRange({ from, to }).insertContent(newText).run();
  }, [editor]);

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value);
    }
  }, [value, editor]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (e) => {
      // Ctrl/Cmd + Z for undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        editor.chain().focus().undo().run();
      }
      // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y for redo
      if (((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'z') || 
          ((e.ctrlKey || e.metaKey) && e.key === 'y')) {
        e.preventDefault();
        editor.chain().focus().redo().run();
      }
      // Delete or Backspace on selected nodes
      if ((e.key === 'Delete' || e.key === 'Backspace') && editor.state.selection.node) {
        e.preventDefault();
        editor.chain().focus().deleteSelection().run();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.relative')) {
        setShowInteractive(false);
        setShowCards(false);
        setShowFontColor(false);
        setShowBgColor(false);
        setShowHighlightColor(false);
        setShowBorder(false);
        setShowSpacing(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

          .rich-text-editor-wrapper .ProseMirror {
            caret-color: #4F46E5;
          }

          .rich-text-editor-wrapper .ProseMirror::selection {
            background-color: #C7D2FE;
          }

          .rich-text-editor-wrapper .ProseMirror::-moz-selection {
            background-color: #C7D2FE;
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
            border-radius: 12px;
            margin: 8px 0;
            display: block !important;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .rich-text-editor-wrapper .ProseMirror img:not([width]):not([height]):not([style*="width"]):not([style*="height"]) {
            width: 100%;
            height: auto;
            min-height: 300px;
            object-fit: cover;
          }
          
          .rich-text-editor-wrapper .ProseMirror table img {
            width: 100% !important;
            height: auto !important;
            max-width: none !important;
            min-height: 0 !important;
            object-fit: contain !important;
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

          /* Drag and Drop Styles */
          .rich-text-editor-wrapper .ProseMirror .ProseMirror-gapcursor {
            pointer-events: none;
            position: relative;
          }

          .rich-text-editor-wrapper .ProseMirror .ProseMirror-gapcursor:after {
            content: "";
            display: block;
            position: absolute;
            top: -2px;
            width: 20px;
            border-top: 2px solid #6366F1;
            animation: ProseMirror-cursor-blink 1.1s steps(2, start) infinite;
          }

          @keyframes ProseMirror-cursor-blink {
            to { visibility: hidden; }
          }

          .rich-text-editor-wrapper .ProseMirror-dropcursor {
            position: absolute;
            pointer-events: none;
            border-left: 4px solid #6366F1;
            margin-left: -2px;
            height: 1.2em;
            animation: dropcursor-blink 0.8s ease-in-out infinite;
          }

          @keyframes dropcursor-blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }

          .rich-text-editor-wrapper .ProseMirror [draggable="true"] {
            cursor: move;
          }

          .rich-text-editor-wrapper .ProseMirror [draggable="true"]:hover {
            outline: 2px solid #6366F1;
            outline-offset: 2px;
            border-radius: 8px;
          }

          .rich-text-editor-wrapper .ProseMirror [data-drag-handle]:before {
            content: "⋮⋮";
            position: absolute;
            left: -20px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 18px;
            color: #9CA3AF;
            opacity: 0;
            transition: opacity 0.2s;
            cursor: move;
            line-height: 1;
            letter-spacing: -2px;
          }

          .rich-text-editor-wrapper .ProseMirror [data-drag-handle]:hover:before {
            opacity: 1;
          }

          .rich-text-editor-wrapper .ProseMirror .dragging {
            opacity: 0.5;
          }

          .rich-text-editor-wrapper .ProseMirror p {
            position: relative;
          }

          .rich-text-editor-wrapper .ProseMirror p:hover {
            background: rgba(99, 102, 241, 0.03);
            border-radius: 4px;
          }

          /* Selection and deletion styles */
          .rich-text-editor-wrapper .ProseMirror .ProseMirror-selectednode {
            outline: 3px solid #6366F1;
            outline-offset: 2px;
            border-radius: 8px;
          }

          .rich-text-editor-wrapper .ProseMirror img.ProseMirror-selectednode {
            box-shadow: 0 0 0 3px #6366F1;
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

        {/* Font Family */}
        <select
          onChange={(e) => {
            if (e.target.value === 'default') {
              editor.chain().focus().unsetFontFamily().run();
            } else {
              editor.chain().focus().setFontFamily(e.target.value).run();
            }
          }}
          className="h-8 px-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
          value={editor.getAttributes('textStyle').fontFamily || 'default'}
        >
          <option value="default">Default</option>
          <option value="Arial, sans-serif">Arial</option>
          <option value="'Times New Roman', serif">Times New Roman</option>
          <option value="'Courier New', monospace">Courier New</option>
          <option value="Georgia, serif">Georgia</option>
          <option value="Verdana, sans-serif">Verdana</option>
          <option value="'Comic Sans MS', cursive">Comic Sans</option>
          <option value="Impact, sans-serif">Impact</option>
          <option value="'Trebuchet MS', sans-serif">Trebuchet</option>
        </select>

        {/* Font Size */}
        <select
          onChange={(e) => {
            if (e.target.value === 'default') {
              editor.chain().focus().unsetFontSize().run();
            } else {
              editor.chain().focus().setFontSize(e.target.value).run();
            }
          }}
          className="h-8 px-2 text-sm border border-gray-300 rounded hover:bg-gray-50"
          value={editor.getAttributes('textStyle').fontSize || 'default'}
        >
          <option value="default">Size</option>
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
          <option value="28px">28px</option>
          <option value="32px">32px</option>
          <option value="36px">36px</option>
          <option value="48px">48px</option>
          <option value="64px">64px</option>
          <option value="72px">72px</option>
        </select>

        <div className="w-px h-6 bg-gray-300 mx-1" />

        {/* Font Color */}
        <div className="relative">
          <MenuButton
            onClick={() => {
              setShowFontColor(!showFontColor);
              setShowBgColor(false);
              setShowHighlightColor(false);
              setShowBorder(false);
              setShowSpacing(false);
            }}
            isActive={showFontColor}
            title="Font Color"
          >
            <Palette className="w-4 h-4" />
          </MenuButton>
          {showFontColor && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border p-3 z-50 min-w-[200px]">
              <p className="text-xs font-semibold mb-2">Font Color</p>
              <div className="grid grid-cols-5 gap-1">
                {['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#FFC0CB'].map(color => (
                  <button
                    key={color}
                    onClick={() => {
                      editor.chain().focus().setColor(color).run();
                      setShowFontColor(false);
                    }}
                    className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Background Color (Shading) */}
        <div className="relative">
          <MenuButton
            onClick={() => {
              setShowBgColor(!showBgColor);
              setShowFontColor(false);
              setShowHighlightColor(false);
              setShowBorder(false);
              setShowSpacing(false);
            }}
            isActive={showBgColor}
            title="Background Color (Shading)"
          >
            <Highlighter className="w-4 h-4" />
          </MenuButton>
          {showBgColor && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border p-3 z-50 min-w-[200px]">
              <p className="text-xs font-semibold mb-2">Background Color</p>
              <div className="grid grid-cols-5 gap-1">
                {['#FFFF00', '#00FF00', '#00FFFF', '#FF00FF', '#FFA500', '#FFE4B5', '#E6E6FA', '#FFB6C1', '#ADD8E6', '#90EE90'].map(color => (
                  <button
                    key={color}
                    onClick={() => {
                      editor.chain().focus().setBackgroundColor(color).run();
                      setShowBgColor(false);
                    }}
                    className="w-8 h-8 rounded border-2 border-gray-200 hover:border-gray-400"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <button
                onClick={() => {
                  editor.chain().focus().unsetBackgroundColor().run();
                  setShowBgColor(false);
                }}
                className="text-xs text-red-600 mt-2 hover:underline"
              >
                Remove Background
              </button>
            </div>
          )}
        </div>

        {/* Border */}
        <div className="relative">
          <MenuButton
            onClick={() => {
              setShowBorder(!showBorder);
              setShowFontColor(false);
              setShowBgColor(false);
              setShowHighlightColor(false);
              setShowSpacing(false);
            }}
            isActive={showBorder}
            title="Border"
          >
            <Square className="w-4 h-4" />
          </MenuButton>
          {showBorder && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border p-3 z-50 min-w-[180px]">
              <p className="text-xs font-semibold mb-2">Border Style</p>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    editor.chain().focus().setBorder('1px solid #000').run();
                    setShowBorder(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Solid Border
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().setBorder('2px solid #000').run();
                    setShowBorder(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Thick Border
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().setBorder('1px dashed #000').run();
                    setShowBorder(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Dashed Border
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().setBorder('2px solid #4F46E5').run();
                    setShowBorder(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Colored Border
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().unsetBorder().run();
                    setShowBorder(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded text-red-600"
                >
                  Remove Border
                </button>
              </div>
            </div>
          )}
        </div>

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

        {/* Line & Paragraph Spacing */}
        <div className="relative">
          <MenuButton
            onClick={() => {
              setShowSpacing(!showSpacing);
              setShowFontColor(false);
              setShowBgColor(false);
              setShowHighlightColor(false);
              setShowBorder(false);
            }}
            isActive={showSpacing}
            title="Line & Paragraph Spacing"
          >
            <Space className="w-4 h-4" />
          </MenuButton>
          {showSpacing && (
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border p-3 z-50 min-w-[180px]">
              <p className="text-xs font-semibold mb-2">Line Height</p>
              <div className="space-y-1 mb-3">
                {['1.0', '1.5', '2.0', '2.5'].map(height => (
                  <button
                    key={height}
                    onClick={() => {
                      editor.chain().focus().setLineHeight(height).run();
                      setShowSpacing(false);
                    }}
                    className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                  >
                    {height}
                  </button>
                ))}
              </div>
              <p className="text-xs font-semibold mb-2">Paragraph Spacing</p>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    editor.chain().focus().setParagraphSpacing({ top: '0px', bottom: '0px' }).run();
                    setShowSpacing(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  No spacing
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().setParagraphSpacing({ top: '8px', bottom: '8px' }).run();
                    setShowSpacing(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Small (8px)
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().setParagraphSpacing({ top: '16px', bottom: '16px' }).run();
                    setShowSpacing(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Medium (16px)
                </button>
                <button
                  onClick={() => {
                    editor.chain().focus().setParagraphSpacing({ top: '24px', bottom: '24px' }).run();
                    setShowSpacing(false);
                  }}
                  className="w-full text-left px-2 py-1 text-xs hover:bg-gray-100 rounded"
                >
                  Large (24px)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Change Case */}
        <div className="relative">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 rounded hover:bg-indigo-100 transition-colors text-gray-700" title="Change Case">
                <Type className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => changeCase('uppercase')}>
                UPPERCASE
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeCase('lowercase')}>
                lowercase
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => changeCase('capitalize')}>
                Capitalize Each Word
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
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

        {editor.isActive('image') && (
          <>
            <input
              type="number"
              placeholder="Width"
              className="h-8 w-20 px-2 text-sm border border-gray-300 rounded"
              value={editor.getAttributes('image').width || ''}
              onChange={(e) => {
                const width = e.target.value;
                if (width) {
                  editor.chain().focus().updateAttributes('image', { width: width + 'px' }).run();
                } else {
                  editor.chain().focus().updateAttributes('image', { width: null }).run();
                }
              }}
            />
            <input
              type="number"
              placeholder="Height"
              className="h-8 w-20 px-2 text-sm border border-gray-300 rounded"
              value={editor.getAttributes('image').height || ''}
              onChange={(e) => {
                const height = e.target.value;
                if (height) {
                  editor.chain().focus().updateAttributes('image', { height: height + 'px' }).run();
                } else {
                  editor.chain().focus().updateAttributes('image', { height: null }).run();
                }
              }}
            />
            <button
              onClick={() => editor.chain().focus().updateAttributes('image', { width: null, height: null }).run()}
              className="h-8 px-2 text-xs border border-gray-300 rounded hover:bg-gray-100"
              title="Reset size"
            >
              Reset
            </button>
            <div className="w-px h-6 bg-gray-300 mx-1" />
          </>
        )}

        <div className="w-px h-6 bg-gray-300 mx-1" />

        <div className="relative">
          <MenuButton
            onClick={() => setShowInteractive(!showInteractive)}
            isActive={showInteractive}
            title="Interactive Elements"
          >
            <Zap className="w-4 h-4" />
          </MenuButton>
          {showInteractive && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 min-w-[240px]">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Interactive Elements</p>
            <button
              onClick={() => {
                editor.chain().focus().insertPoll({ 
                  question: 'What do you think?',
                  options: ['Strongly Agree', 'Agree', 'Neutral', 'Disagree']
                }).run();
                setShowInteractive(false);
              }}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-50 transition-colors text-left mb-1"
            >
              <BarChart3 className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Poll</span>
            </button>
            <button
              onClick={() => {
                editor.chain().focus().insertQuiz({ 
                  question: 'Test your knowledge:',
                  options: ['Option A', 'Option B', 'Option C', 'Option D'],
                  correct: 0
                }).run();
                setShowInteractive(false);
              }}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-yellow-50 transition-colors text-left mb-1"
            >
              <HelpCircle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">Quiz Question</span>
            </button>
            <button
              onClick={() => {
                editor.chain().focus().insertTimedQuestion({ 
                  question: 'Solve within the time limit:',
                  options: ['Option A', 'Option B', 'Option C', 'Option D'],
                  correct: 0,
                  timeLimit: 60,
                  marks: 10,
                  difficulty: 'medium'
                }).run();
                setShowInteractive(false);
              }}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-blue-50 transition-colors text-left mb-1"
            >
              <Clock className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-700">Timed Assessment</span>
            </button>
            <button
              onClick={() => {
                editor.chain().focus().insertInteractiveImage({ 
                  src: 'https://via.placeholder.com/800x500/6366F1/FFFFFF?text=Click+Image+to+Upload',
                  hotspots: [
                    { x: 30, y: 30, label: 'Point 1', info: 'First key area' },
                    { x: 70, y: 70, label: 'Point 2', info: 'Second key area' }
                  ]
                }).run();
                setShowInteractive(false);
              }}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-red-50 transition-colors text-left mb-1"
            >
              <ImageIcon className="w-4 h-4 text-red-600" />
              <span className="text-sm font-medium text-gray-700">Interactive Image</span>
            </button>
            <button
              onClick={() => {
                editor.chain().focus().insertQASection().run();
                setShowInteractive(false);
              }}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-teal-50 transition-colors text-left mb-1"
            >
              <HelpCircle className="w-4 h-4 text-teal-600" />
              <span className="text-sm font-medium text-gray-700">Q&A Section</span>
            </button>
            <button
              onClick={() => {
                editor.chain().focus().insertDragDropExercise({ 
                  question: 'Match the items to their correct targets:',
                  items: ['Item 1', 'Item 2', 'Item 3'],
                  targets: ['Target A', 'Target B', 'Target C']
                }).run();
                setShowInteractive(false);
              }}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-indigo-50 transition-colors text-left mb-1"
            >
              <Square className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-medium text-gray-700">Drag & Drop</span>
            </button>
            <button
              onClick={() => {
                editor.chain().focus().insertFillInBlanks({ 
                  instruction: 'Fill in the blanks:',
                  text: 'Water freezes at [0] degrees Celsius and boils at [100] degrees.'
                }).run();
                setShowInteractive(false);
              }}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-yellow-50 transition-colors text-left mb-1"
            >
              <Code className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-gray-700">Fill in Blanks</span>
            </button>
            <button
              onClick={() => {
                editor.chain().focus().insertBranchingScenario({ 
                  scenario: 'You face a challenge. What do you do?',
                  choices: [
                    { text: 'Option A: Research', outcome: 'Good choice! You found helpful information.' },
                    { text: 'Option B: Ask for help', outcome: 'Excellent! Collaboration is powerful.' },
                    { text: 'Option C: Try differently', outcome: 'Creative thinking leads to innovation!' }
                  ]
                }).run();
                setShowInteractive(false);
              }}
              className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-pink-50 transition-colors text-left"
            >
              <Zap className="w-4 h-4 text-pink-600" />
              <span className="text-sm font-medium text-gray-700">Branching Scenario</span>
            </button>
          </div>
          )}
        </div>

        <div className="relative">
          <MenuButton
            onClick={() => setShowCards(!showCards)}
            isActive={showCards}
            title="Insert Cards"
          >
            <Square className="w-4 h-4" />
          </MenuButton>
          {showCards && (
          <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-xl border border-gray-200 p-3 z-50 min-w-[280px] max-h-[500px] overflow-y-auto">
            <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Card Types</p>
            <div className="grid grid-cols-2 gap-2 mb-3">
              <button
                onClick={() => {
                  editor.chain().focus().setCard({ type: 'definition' }).run();
                  setShowCards(false);
                }}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-left"
              >
                <Info className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-medium text-blue-900">Definition</span>
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().setCard({ type: 'concept' }).run();
                  setShowCards(false);
                }}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors text-left"
              >
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-xs font-medium text-green-900">Concept</span>
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().setCard({ type: 'key' }).run();
                  setShowCards(false);
                }}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-yellow-50 hover:bg-yellow-100 transition-colors text-left"
              >
                <Lightbulb className="w-5 h-5 text-yellow-600" />
                <span className="text-xs font-medium text-yellow-900">Key Point</span>
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().setCard({ type: 'note' }).run();
                  setShowCards(false);
                }}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors text-left"
              >
                <Info className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-medium text-purple-900">Note</span>
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().setCard({ type: 'warning' }).run();
                  setShowCards(false);
                }}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors text-left"
              >
                <AlertTriangle className="w-5 h-5 text-red-600" />
                <span className="text-xs font-medium text-red-900">Warning</span>
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().setCard({ type: 'diagram' }).run();
                  setShowCards(false);
                }}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors text-left"
              >
                <Square className="w-5 h-5 text-gray-600" />
                <span className="text-xs font-medium text-gray-900">Diagram</span>
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().setCard({ type: 'example' }).run();
                  setShowCards(false);
                }}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-teal-50 hover:bg-teal-100 transition-colors text-left"
              >
                <CheckCircle2 className="w-5 h-5 text-teal-600" />
                <span className="text-xs font-medium text-teal-900">Example</span>
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().setCard({ type: 'important' }).run();
                  setShowCards(false);
                }}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-orange-50 hover:bg-orange-100 transition-colors text-left"
              >
                <AlertTriangle className="w-5 h-5 text-orange-600" />
                <span className="text-xs font-medium text-orange-900">Important</span>
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().setCard({ type: 'tip' }).run();
                  setShowCards(false);
                }}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-cyan-50 hover:bg-cyan-100 transition-colors text-left"
              >
                <Lightbulb className="w-5 h-5 text-cyan-600" />
                <span className="text-xs font-medium text-cyan-900">Tip</span>
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().setCard({ type: 'summary' }).run();
                  setShowCards(false);
                }}
                className="flex flex-col items-center gap-1 p-3 rounded-lg bg-violet-50 hover:bg-violet-100 transition-colors text-left"
              >
                <Info className="w-5 h-5 text-violet-600" />
                <span className="text-xs font-medium text-violet-900">Summary</span>
              </button>
              </div>
            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-gray-600 uppercase mb-2">Card Layouts</p>
              <button
                onClick={() => {
                  editor.chain().focus().insertCardGrid({ columns: 2 }).run();
                  setShowCards(false);
                }}
                className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-blue-200 rounded"></div>
                  <div className="w-3 h-3 bg-blue-200 rounded"></div>
                </div>
                <span className="text-xs font-medium text-gray-700">2 Column Grid</span>
              </button>
              <button
                onClick={() => {
                  editor.chain().focus().insertCardGrid({ columns: 3 }).run();
                  setShowCards(false);
                }}
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
                onClick={() => {
                  editor.chain().focus().insertCardGrid({ columns: 4 }).run();
                  setShowCards(false);
                }}
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
            )}
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