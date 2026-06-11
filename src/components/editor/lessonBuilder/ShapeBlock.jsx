import React, { useContext } from 'react';
import { Paintbrush, Droplet, Ban } from 'lucide-react';
import { BlockExpandedContext } from './BlockWrapper';

// ShapeBlock
// ---------------------------------------------------------------
// A self-contained vector shape (circle, square, triangle, etc.)
// that fills its block frame. Inserts cleanly into a slide with
// NO surrounding card/background — just the shape itself. The
// FreeBlock resize handles already scale the SVG naturally.
//
// Editable properties:
//   • Fill colour
//   • No-fill (outline only)
//   • Outline colour
//   • Outline width
//
// Data shape: { kind, fill, stroke, strokeWidth, noFill }

const DEFAULTS = {
  kind: 'rect',
  fill: '#6366f1',
  stroke: '#1e1b4b',
  strokeWidth: 0,
  noFill: false,
};

// preserveAspectRatio: arrows + lines stretch with the frame, geometric
// shapes keep their proportion to avoid distorted circles/triangles.
const KEEP_ASPECT = new Set([
  'circle','triangle','star','pentagon','hexagon','octagon','diamond','heart','cloud','bolt',
]);

// Returns { viewBox, element } for each shape kind. The element is a
// React node so React owns the DOM rather than parsing HTML strings.
function getShapeElement(kind) {
  switch (kind) {
    case 'circle':
      return { vb: '0 0 100 100', el: <circle cx="50" cy="50" r="48" /> };
    case 'triangle':
      return { vb: '0 0 100 100', el: <polygon points="50,4 96,94 4,94" /> };
    case 'diamond':
      return { vb: '0 0 100 100', el: <polygon points="50,4 96,50 50,96 4,50" /> };
    case 'pentagon':
      return { vb: '0 0 100 100', el: <polygon points="50,4 96,38 79,94 21,94 4,38" /> };
    case 'hexagon':
      return { vb: '0 0 100 100', el: <polygon points="25,6 75,6 96,50 75,94 25,94 4,50" /> };
    case 'octagon':
      return { vb: '0 0 100 100', el: <polygon points="32,4 68,4 96,32 96,68 68,96 32,96 4,68 4,32" /> };
    case 'star':
      return { vb: '0 0 100 100', el: <polygon points="50,4 61,38 96,38 68,60 79,94 50,72 21,94 32,60 4,38 39,38" /> };
    case 'heart':
      return { vb: '0 0 100 100', el: <path d="M50 88 L12 50 a18 18 0 1 1 38 -10 a18 18 0 1 1 38 10 Z" /> };
    case 'cloud':
      return { vb: '0 0 100 100', el: <path d="M25 70 a18 18 0 0 1 4 -36 a22 22 0 0 1 42 -2 a16 16 0 0 1 4 38 Z" /> };
    case 'bolt':
      return { vb: '0 0 100 100', el: <polygon points="58,4 22,56 46,56 34,96 78,40 54,40" /> };
    case 'arrow-right':
      return { vb: '0 0 100 60', el: <polygon points="0,22 60,22 60,8 100,30 60,52 60,38 0,38" /> };
    case 'arrow-left':
      return { vb: '0 0 100 60', el: <polygon points="100,22 40,22 40,8 0,30 40,52 40,38 100,38" /> };
    case 'arrow-up':
      return { vb: '0 0 60 100', el: <polygon points="22,100 22,40 8,40 30,0 52,40 38,40 38,100" /> };
    case 'arrow-down':
      return { vb: '0 0 60 100', el: <polygon points="22,0 22,60 8,60 30,100 52,60 38,60 38,0" /> };
    case 'line':
      return { vb: '0 0 100 10', el: <line x1="2" y1="5" x2="98" y2="5" /> };
    case 'rect':
    default:
      return { vb: '0 0 100 100', el: <rect x="2" y="2" width="96" height="96" rx="6" /> };
  }
}

export default function ShapeBlock({ data, onChange, focused }) {
  const merged = { ...DEFAULTS, ...(data || {}) };
  const { kind, fill, stroke, strokeWidth, noFill } = merged;

  // Show controls when EITHER:
  //   • this block is the selected one on the free canvas (focused=true), or
  //   • the surrounding BlockWrapper is expanded (flow-mode editor).
  // This way the same component works in both layouts.
  const expanded = useContext(BlockExpandedContext);
  const showControls = focused || expanded;

  const update = (patch) => onChange({ ...merged, ...patch });

  const { vb, el } = getShapeElement(kind);
  const fillAttr = noFill ? 'none' : (fill || '#6366f1');
  const sw = Number(strokeWidth) || 0;
  const strokeAttr = sw > 0 ? (stroke || '#1e1b4b') : 'none';
  const preserve = KEEP_ASPECT.has(kind) ? 'xMidYMid meet' : 'none';

  return (
    <div
      style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent',
      }}
    >
      <svg
        viewBox={vb}
        preserveAspectRatio={preserve}
        width="100%"
        height="100%"
        style={{ display: 'block', overflow: 'visible' }}
      >
        <g
          fill={fillAttr}
          stroke={strokeAttr}
          strokeWidth={sw}
          strokeLinejoin="round"
          strokeLinecap="round"
        >
          {el}
        </g>
      </svg>

      {/* Floating shape toolbar — PowerPoint-style. Sits ABOVE the shape so
          it never obscures the artwork. Only visible while the shape is
          selected / the block is expanded. Stops propagation so clicks
          inside the controls don't deselect the shape. */}
      {showControls && (
        <div
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            left: '50%',
            top: -10,
            transform: 'translate(-50%, -100%)',
            zIndex: 5,
            pointerEvents: 'auto',
          }}
        >
          <Controls merged={merged} update={update} />
        </div>
      )}
    </div>
  );
}

function Controls({ merged, update }) {
  const { fill, stroke, strokeWidth, noFill } = merged;
  const sw = Number(strokeWidth) || 0;

  return (
    <div className="mt-2 space-y-2 bg-white/95 backdrop-blur rounded-md p-2 shadow-sm border border-gray-200">
      {/* Fill */}
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-xs text-gray-600 inline-flex items-center gap-1">
          <Droplet className="w-3 h-3" /> Fill
        </label>
        <input
          type="color"
          value={fill || '#6366f1'}
          onChange={(e) => update({ fill: e.target.value, noFill: false })}
          disabled={noFill}
          className="w-7 h-7 rounded border border-gray-200 cursor-pointer disabled:opacity-40"
          title="Fill colour"
          aria-label="Fill colour"
        />
        <button
          type="button"
          onClick={() => update({ noFill: !noFill })}
          className={`text-xs inline-flex items-center gap-1 px-2 py-1 rounded border ${
            noFill ? 'bg-amber-50 border-amber-300 text-amber-800' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
          aria-pressed={noFill}
          title="Toggle no-fill (outline only)"
        >
          <Ban className="w-3 h-3" /> No fill
        </button>
      </div>

      {/* Stroke / outline */}
      <div className="flex items-center gap-2 flex-wrap">
        <label className="text-xs text-gray-600 inline-flex items-center gap-1">
          <Paintbrush className="w-3 h-3" /> Outline
        </label>
        <input
          type="color"
          value={stroke || '#1e1b4b'}
          onChange={(e) => update({
            stroke: e.target.value,
            // If the user picks an outline colour while the outline is invisible,
            // bump width to a sensible default so the colour is immediately visible.
            strokeWidth: sw === 0 ? 2 : sw,
          })}
          className="w-7 h-7 rounded border border-gray-200 cursor-pointer"
          title="Outline colour"
          aria-label="Outline colour"
        />
        <label className="text-xs text-gray-600 flex items-center gap-1">
          Width
          <input
            type="range"
            min={0}
            max={10}
            step={0.5}
            value={sw}
            onChange={(e) => update({ strokeWidth: Number(e.target.value) })}
            className="w-24"
            aria-label="Outline width"
          />
          <span className="w-8 text-right tabular-nums">{sw}</span>
        </label>
      </div>
    </div>
  );
}

// Quick-pick palette of shape kinds — used by the design library so the
// "Shapes" tab inserts a native shape block instead of an image asset.
export const SHAPE_KINDS = [
  { kind: 'rect',         name: 'Square',       defaultFill: '#0ea5e9' },
  { kind: 'circle',       name: 'Circle',       defaultFill: '#6366f1' },
  { kind: 'triangle',     name: 'Triangle',     defaultFill: '#10b981' },
  { kind: 'diamond',      name: 'Diamond',      defaultFill: '#ec4899' },
  { kind: 'pentagon',     name: 'Pentagon',     defaultFill: '#f59e0b' },
  { kind: 'hexagon',      name: 'Hexagon',      defaultFill: '#8b5cf6' },
  { kind: 'octagon',      name: 'Octagon',      defaultFill: '#0d9488' },
  { kind: 'star',         name: 'Star',         defaultFill: '#ef4444' },
  { kind: 'heart',        name: 'Heart',        defaultFill: '#e11d48' },
  { kind: 'cloud',        name: 'Cloud',        defaultFill: '#64748b' },
  { kind: 'bolt',         name: 'Bolt',         defaultFill: '#eab308' },
  { kind: 'arrow-right',  name: 'Arrow right',  defaultFill: '#0f172a' },
  { kind: 'arrow-left',   name: 'Arrow left',   defaultFill: '#0f172a' },
  { kind: 'arrow-up',     name: 'Arrow up',     defaultFill: '#10b981' },
  { kind: 'arrow-down',   name: 'Arrow down',   defaultFill: '#f59e0b' },
  { kind: 'line',         name: 'Line',         defaultFill: '#0f172a' },
];