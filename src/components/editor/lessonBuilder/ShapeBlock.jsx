import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Droplet, Paintbrush, Ban } from 'lucide-react';

/**
 * ShapeBlock — renders an inline SVG shape with configurable fill, outline, and colors.
 * Designed for the free canvas with floating controls when focused.
 */
export default function ShapeBlock({ data, focused, onChange }) {
  const {
    shape = 'square',
    fill = '#6366f1',
    stroke = '#1e1b4b',
    strokeWidth = 2,
    noFill = false,
  } = data || {};

  const merged = { shape, fill, stroke, strokeWidth, noFill };

  const update = (patch) => {
    onChange({ ...merged, ...patch });
  };

  const wrapperRef = useRef(null);
  const [toolbarPos, setToolbarPos] = useState(null);

  // Position the floating toolbar using a portal so it escapes the FreeBlock's
  // overflow:hidden container. Tracks the wrapper's bounding rect on every
  // selection and on scroll/resize while focused.
  useEffect(() => {
    if (!focused || !wrapperRef.current) {
      setToolbarPos(null);
      return;
    }
    const update = () => {
      const r = wrapperRef.current?.getBoundingClientRect();
      if (!r) return;
      setToolbarPos({ left: r.left + r.width / 2, top: r.bottom + 8 });
    };
    update();
    window.addEventListener('scroll', update, true);
    window.addEventListener('resize', update);
    const interval = setInterval(update, 100); // catch drag/resize of the FreeBlock
    return () => {
      window.removeEventListener('scroll', update, true);
      window.removeEventListener('resize', update);
      clearInterval(interval);
    };
  }, [focused]);

  return (
    <div ref={wrapperRef} className="w-full h-full flex flex-col items-center justify-center bg-transparent relative">
      <ShapeSVG merged={merged} />

      {focused && toolbarPos && typeof document !== 'undefined' && createPortal(
        <div
          style={{
            position: 'fixed',
            left: toolbarPos.left,
            top: toolbarPos.top,
            transform: 'translateX(-50%)',
            zIndex: 9999,
          }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
        >
          <Controls merged={merged} update={update} />
        </div>,
        document.body
      )}
    </div>
  );
}

function ShapeSVG({ merged }) {
  const { shape = 'square', fill = '#6366f1', stroke = '#1e1b4b', strokeWidth = 2, noFill = false } = merged;

  // Geometry definitions for each shape type
  const SHAPES = {
    circle: '<ellipse cx="50" cy="50" rx="48" ry="48" />',
    square: '<rect x="4" y="4" width="92" height="92" />',
    rounded: '<rect x="4" y="4" width="92" height="92" rx="12" ry="12" />',
    triangle: '<polygon points="50,4 96,94 4,94" />',
    diamond: '<polygon points="50,4 96,50 50,96 4,50" />',
    pentagon: '<polygon points="50,4 96,38 78,94 22,94 4,38" />',
    hexagon: '<polygon points="25,8 75,8 96,50 75,92 25,92 4,50" />',
    octagon: '<polygon points="30,4 70,4 96,30 96,70 70,96 30,96 4,70 4,30" />',
    star: '<polygon points="50,4 61,38 96,38 68,58 79,92 50,72 21,92 32,58 4,38 39,38" />',
    heart: '<path d="M50,86 C20,68 6,52 6,34 C6,20 17,10 30,10 C39,10 47,15 50,22 C53,15 61,10 70,10 C83,10 94,20 94,34 C94,52 80,68 50,86 Z" />',
    arrowR: '<polygon points="4,38 60,38 60,20 96,50 60,80 60,62 4,62" />',
    arrowL: '<polygon points="96,38 40,38 40,20 4,50 40,80 40,62 96,62" />',
    arrowU: '<polygon points="38,96 38,40 20,40 50,4 80,40 62,40 62,96" />',
    arrowD: '<polygon points="38,4 38,60 20,60 50,96 80,60 62,60 62,4" />',
  };

  const geomHtml = SHAPES[shape] || SHAPES.square;

  // Resolve fill: if noFill is true, use 'none'; otherwise use the fill color
  const finalFill = noFill ? 'none' : fill;
  // If both are 'none', use a fallback outline
  const finalStroke = finalFill === 'none' && stroke === 'none' ? '#94a3b8' : stroke;
  const finalSW = finalFill === 'none' && stroke === 'none' ? 1 : strokeWidth;

  // Inject attributes into the geometry element
  const shapeAttrs = `fill="${finalFill}" stroke="${finalStroke}" stroke-width="${finalSW}" stroke-linejoin="round"`;
  const geomWithAttrs = geomHtml.replace('/>', ` ${shapeAttrs}/>`);

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      width="100%"
      height="100%"
      style={{ display: 'block', overflow: 'visible', pointerEvents: 'auto' }}
      dangerouslySetInnerHTML={{ __html: geomWithAttrs }}
    />
  );
}

function Controls({ merged, update }) {
  const { fill, stroke, strokeWidth, noFill } = merged;
  const sw = Number(strokeWidth) || 0;

  return (
    <div
      role="toolbar"
      aria-label="Shape format"
      className="inline-flex items-center gap-2 whitespace-nowrap bg-white rounded-lg shadow-lg border border-gray-200 px-2 py-1.5 text-xs"
    >
      {/* Fill colour */}
      <label
        className={`inline-flex items-center gap-1 text-gray-700 ${noFill ? 'opacity-40' : ''}`}
        title="Fill colour"
      >
        <Droplet className="w-3.5 h-3.5" />
        <input
          type="color"
          value={fill || '#6366f1'}
          onChange={(e) => update({ fill: e.target.value, noFill: false })}
          disabled={noFill}
          className="w-6 h-6 rounded border border-gray-200 cursor-pointer p-0"
          aria-label="Fill colour"
        />
      </label>

      {/* No fill toggle */}
      <button
        type="button"
        onClick={() => update({ noFill: !noFill })}
        className={`inline-flex items-center gap-1 px-2 py-1 rounded border ${
          noFill
            ? 'bg-amber-50 border-amber-300 text-amber-800'
            : 'border-gray-200 text-gray-600 hover:bg-gray-50'
        }`}
        aria-pressed={noFill}
        title="No fill (outline only)"
      >
        <Ban className="w-3 h-3" /> No fill
      </button>

      <span className="h-5 w-px bg-gray-200" aria-hidden="true" />

      {/* Outline colour */}
      <label className="inline-flex items-center gap-1 text-gray-700" title="Outline colour">
        <Paintbrush className="w-3.5 h-3.5" />
        <input
          type="color"
          value={stroke || '#1e1b4b'}
          onChange={(e) =>
            update({
              stroke: e.target.value,
              strokeWidth: sw === 0 ? 2 : sw,
            })
          }
          className="w-6 h-6 rounded border border-gray-200 cursor-pointer p-0"
          aria-label="Outline colour"
        />
      </label>

      {/* Outline width */}
      <label className="inline-flex items-center gap-1 text-gray-700" title="Outline width">
        <input
          type="range"
          min={0}
          max={10}
          step={0.5}
          value={sw}
          onChange={(e) => update({ strokeWidth: Number(e.target.value) })}
          className="w-20 accent-indigo-600"
          aria-label="Outline width"
        />
        <span className="w-5 text-right tabular-nums text-[11px] text-gray-500">{sw}</span>
      </label>
    </div>
  );
}