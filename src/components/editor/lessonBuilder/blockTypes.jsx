// Block type registry for the Visual Lesson Builder.
// Each block has a stable `type` + reasonable default `data`.
// Builder state lives in memory as { id, type, data, collapsed }[]
// and is serialized to sanitized HTML before being saved to slide.content
// so that the existing LessonPlayer / presentation pages keep working
// with NO data migration required.

import {
  Type, Heading1, Heading2, Heading3, List, ListOrdered, Quote,
  AlertCircle, BookOpen, Image as ImageIcon, FileText, Video,
  Download, Table as TableIcon, Minus, MoveVertical, Columns2,
  Code, Sigma, Target, Star, HelpCircle, FileCode, FlaskConical,
  Shapes,
} from 'lucide-react';

let _id = 0;
export const nextBlockId = () => `b_${Date.now().toString(36)}_${(_id++).toString(36)}`;

// Default cell shape for the table block. Kept here so the registry and the
// component agree on the structure (TableBlock writes `content` + camelCase
// span keys; the serializer reads both shapes defensively).
const emptyCell = () => ({
  content: '', align: 'left', bg: null, color: null, border: 'default',
  rowSpan: 1, colSpan: 1, hidden: false,
});

export const BLOCK_GROUPS = [
  {
    label: 'Text',
    items: [
      { type: 'paragraph',         name: 'Paragraph',        icon: Type,        keywords: ['text','p'] },
      { type: 'heading-1',         name: 'Heading 1',        icon: Heading1,    keywords: ['h1','title'] },
      { type: 'heading-2',         name: 'Heading 2',        icon: Heading2,    keywords: ['h2','subtitle'] },
      { type: 'heading-3',         name: 'Heading 3',        icon: Heading3,    keywords: ['h3'] },
      { type: 'bullet-list',       name: 'Bullet List',      icon: List,        keywords: ['ul','bullets'] },
      { type: 'numbered-list',     name: 'Numbered List',    icon: ListOrdered, keywords: ['ol','steps'] },
      { type: 'quote',             name: 'Quote',            icon: Quote,       keywords: ['blockquote'] },
      { type: 'callout',           name: 'Callout',          icon: AlertCircle, keywords: ['info','tip','note'] },
      { type: 'definition',        name: 'Definition',       icon: BookOpen,    keywords: ['term','meaning'] },
    ],
  },
  {
    label: 'Media',
    items: [
      { type: 'image',             name: 'Image',            icon: ImageIcon,   keywords: ['picture'] },
      { type: 'image-text',        name: 'Image with Text',  icon: ImageIcon,   keywords: ['caption'] },
      { type: 'video',             name: 'Video Embed',      icon: Video,       keywords: ['youtube','vimeo'] },
      { type: 'file',              name: 'File Download',    icon: Download,    keywords: ['attachment','pdf'] },
      { type: 'shape',             name: 'Shape',            icon: Shapes,      keywords: ['shape','circle','square','triangle','arrow','star'] },
    ],
  },
  {
    label: 'Layout',
    items: [
      { type: 'table',             name: 'Table',            icon: TableIcon,   keywords: ['grid'] },
      { type: 'divider',           name: 'Divider',          icon: Minus,       keywords: ['hr','line'] },
      { type: 'spacer',            name: 'Spacer',           icon: MoveVertical,keywords: ['gap','space'] },
      { type: 'two-columns',       name: 'Two Columns',      icon: Columns2,    keywords: ['grid','split'] },
    ],
  },
  {
    label: 'Advanced',
    items: [
      { type: 'code',              name: 'Code Block',       icon: Code,        keywords: ['program'] },
      { type: 'math',              name: 'Maths Formula',    icon: Sigma,       keywords: ['latex','equation','formula','algebra'] },
      { type: 'scientific-equation', name: 'Scientific Equation', icon: FlaskConical, keywords: ['chemistry','reaction','units','physics','balanced'] },
      { type: 'learning-objective',name: 'Learning Objective',icon: Target,     keywords: ['goal','outcome'] },
      { type: 'key-takeaway',      name: 'Key Takeaway',     icon: Star,        keywords: ['summary'] },
      { type: 'knowledge-check',   name: 'Knowledge Check',  icon: HelpCircle,  keywords: ['quiz','question'] },
    ],
  },
];

export const ALL_BLOCK_ITEMS = BLOCK_GROUPS.flatMap(g => g.items);

export function blockTypeLabel(type) {
  return ALL_BLOCK_ITEMS.find(b => b.type === type)?.name
    || (type === 'legacy-html' ? 'Legacy HTML' : type);
}

export function defaultBlockData(type) {
  switch (type) {
    case 'paragraph':         return { html: '' };
    case 'heading-1':
    case 'heading-2':
    case 'heading-3':         return { text: '' };
    case 'bullet-list':
    case 'numbered-list':     return { items: [''] };
    case 'quote':             return { html: '', cite: '' };
    case 'callout':           return { variant: 'info', html: '' };
    case 'definition':        return { term: '', definition: '' };
    case 'image':             return {
      url: '', alt: '', caption: '', credit: '',
      align: 'center', widthUnit: 'percent', width: 100,
      aspect: null, lockAspect: true, fit: 'contain',
    };
    case 'image-text':        return { url: '', alt: '', html: '', side: 'left' };
    case 'video':             return {
      url: '', caption: '', poster: '',
      ratio: '16:9', align: 'center', widthUnit: 'percent', width: 100,
    };
    case 'file':              return { url: '', name: '' };
    case 'table':             return {
      // Root keys match what TableBlock writes (`header`, `stripe`, `caption`).
      // `bordered` and `compact` remain optional rendering hints picked up by
      // the serializer.
      header: true, stripe: false, caption: '',
      bordered: true, compact: false,
      rows: [
        [emptyCell(), emptyCell()],
        [emptyCell(), emptyCell()],
      ],
    };
    case 'divider':           return {};
    case 'spacer':            return { size: 32 };
    case 'two-columns':       return {
      // Match TwoColumnsBlock's normalised shape.
      leftBlocks: [], rightBlocks: [],
      ratio: 0.5, gap: 24, verticalAlign: 'top', stackOnMobile: true,
    };
    case 'code':              return { code: '', language: 'javascript' };
    case 'math':              return { latex: '' };
    case 'scientific-equation': return { equation: '', caption: '', arrow: 'forward' };
    case 'learning-objective':return { html: '' };
    case 'key-takeaway':      return { html: '' };
    case 'knowledge-check':   return { question: '', answer: '', hint: '' };
    case 'shape':             return {
      // Vector shape with PowerPoint-style fill / outline controls.
      // `shape` is the geometry key understood by ShapeBlock.SHAPE_DEFS.
      // `fill` accepts a CSS color or the literal 'none' for outline-only shapes.
      // `stroke` likewise — pass 'none' to remove the border.
      shape: 'rounded', fill: '#6366f1', stroke: 'none', strokeWidth: 2,
    };
    case 'legacy-html':       return { html: '' };
    default:                  return {};
  }
}

export function createBlock(type, data) {
  return {
    id: nextBlockId(),
    type,
    data: { ...defaultBlockData(type), ...(data || {}) },
    collapsed: false,
  };
}