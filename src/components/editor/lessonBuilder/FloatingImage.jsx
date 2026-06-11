import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Move } from 'lucide-react';

// PowerPoint-style free-floating image.
// The image is absolutely positioned inside a fixed-aspect host (16:9 by
// default, matching WorkspaceStage). Position + size are stored as
// percentages of the host so the image scales correctly regardless of
// the slide preview size.
//
// Data shape (added to ImageBlock data when wrap === 'free'):
//   floatX:    number  // % from left   (0..100)
//   floatY:    number  // % from top    (0..100)
//   floatW:    number  // % of host w   (5..100)
//   floatH:    number  // % of host h   (5..100)
//
// The 8 handles + body drag use pointer events with capture so dragging
// outside the image keeps working. Shift constrains aspect ratio.

const HANDLES = [
  { id: 'nw', cursor: 'nwse-resize', x: 0,   y: 0,   tx: -50, ty: -50 },
  { id: 'n',  cursor: 'ns-resize',   x: 50,  y: 0,   tx: -50, ty: -50 },
  { id: 'ne', cursor: 'nesw-resize', x: 100, y: 0,   tx: -50, ty: -50 },
  { id: 'e',  cursor: 'ew-resize',   x: 100, y: 50,  tx: -50, ty: -50 },
  { id: 'se', cursor: 'nwse-resize', x: 100, y: 100, tx: -50, ty: -50 },
  { id: 's',  cursor: 'ns-resize',   x: 50,  y: 100, tx: -50, ty: -50 },
  { id: 'sw', cursor: 'nesw-resize', x: 0,   y: 100, tx: -50, ty: -50 },
  { id: 'w',  cursor: 'ew-resize',   x: 0,   y: 50,  tx: -50, ty: -50 },
];

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

export default function FloatingImage({
  url, alt, fit,
  x, y, w, h, aspect,
  onChange,
}) {
  const hostRef = useRef(null);
  const [selected, setSelected] = useState(false);
  const stateRef = useRef({ x, y, w, h });
  stateRef.current = { x, y, w, h };

  const dragRef = useRef(null); // { mode, handle, startCx, startCy, hostRect, start }

  const begin = useCallback((e, mode, handle = null) => {
    if (!hostRef.current) return;
    e.preventDefault();
    e.stopPropagation();
    const host = hostRef.current.getBoundingClientRect();
    dragRef.current = {
      mode, handle,
      startCx: e.clientX,
      startCy: e.clientY,
      host,
      start: { ...stateRef.current },
      shift: e.shiftKey,
    };
    e.currentTarget.setPointerCapture?.(e.pointerId);
    setSelected(true);
  }, []);

  const move = useCallback((e) => {
    const d = dragRef.current;
    if (!d) return;
    const dxPct = ((e.clientX - d.startCx) / d.host.width) * 100;
    const dyPct = ((e.clientY - d.startCy) / d.host.height) * 100;
    const s = d.start;

    if (d.mode === 'move') {
      onChange({
        floatX: clamp(s.x + dxPct, 0, 100 - s.w),
        floatY: clamp(s.y + dyPct, 0, 100 - s.h),
      });
      return;
    }

    // Resize. Compute new bounds based on handle.
    let nx = s.x, ny = s.y, nw = s.w, nh = s.h;
    const h = d.handle;
    if (h.includes('e')) nw = clamp(s.w + dxPct, 5, 100 - s.x);
    if (h.includes('s')) nh = clamp(s.h + dyPct, 5, 100 - s.y);
    if (h.includes('w')) {
      const newW = clamp(s.w - dxPct, 5, s.x + s.w);
      nx = s.x + (s.w - newW);
      nw = newW;
    }
    if (h.includes('n')) {
      const newH = clamp(s.h - dyPct, 5, s.y + s.h);
      ny = s.y + (s.h - newH);
      nh = newH;
    }

    // Hold shift to preserve aspect ratio (or always for corners with aspect).
    const isCorner = h.length === 2;
    if ((e.shiftKey || (isCorner && aspect)) && aspect) {
      // Convert percentages to pixel-equivalent ratios using the host's
      // own w/h so the lock matches the visible image.
      const hostAR = d.host.width / d.host.height;
      // image aspect in % space = aspect (px ratio) / hostAR
      const imgARpct = aspect / hostAR;
      // Decide which axis drives the resize:
      if (h === 'e' || h === 'w') {
        nh = clamp(nw / imgARpct, 5, 100);
      } else if (h === 'n' || h === 's') {
        nw = clamp(nh * imgARpct, 5, 100);
      } else {
        // corner — pick the larger delta direction
        const driveByW = Math.abs(nw - s.w) >= Math.abs(nh - s.h);
        if (driveByW) nh = clamp(nw / imgARpct, 5, 100);
        else nw = clamp(nh * imgARpct, 5, 100);
        // Re-anchor for west/north corners
        if (h.includes('w')) nx = s.x + s.w - nw;
        if (h.includes('n')) ny = s.y + s.h - nh;
      }
    }

    onChange({ floatX: nx, floatY: ny, floatW: nw, floatH: nh });
  }, [onChange, aspect]);

  const end = useCallback(() => { dragRef.current = null; }, []);

  // Deselect when clicking outside.
  useEffect(() => {
    if (!selected) return;
    const onDocDown = (e) => {
      if (!hostRef.current?.contains(e.target)) setSelected(false);
    };
    document.addEventListener('pointerdown', onDocDown);
    return () => document.removeEventListener('pointerdown', onDocDown);
  }, [selected]);

  // Arrow key nudge while selected (1%, shift = 5%).
  useEffect(() => {
    if (!selected) return;
    const onKey = (e) => {
      const step = e.shiftKey ? 5 : 1;
      const s = stateRef.current;
      if (e.key === 'ArrowLeft')  { e.preventDefault(); onChange({ floatX: clamp(s.x - step, 0, 100 - s.w) }); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); onChange({ floatX: clamp(s.x + step, 0, 100 - s.w) }); }
      else if (e.key === 'ArrowUp')    { e.preventDefault(); onChange({ floatY: clamp(s.y - step, 0, 100 - s.h) }); }
      else if (e.key === 'ArrowDown')  { e.preventDefault(); onChange({ floatY: clamp(s.y + step, 0, 100 - s.h) }); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selected, onChange]);

  return (
    // Host fixes a 16:9 frame so the image has a stable coordinate system
    // even when other blocks above change height. Pointer events on the
    // empty host let the user click outside the image to deselect.
    <div
      ref={hostRef}
      className="relative w-full"
      style={{ aspectRatio: '16 / 9' }}
      onPointerMove={move}
      onPointerUp={end}
      onPointerCancel={end}
    >
      <div
        role="button"
        tabIndex={0}
        onPointerDown={(e) => begin(e, 'move')}
        onFocus={() => setSelected(true)}
        style={{
          position: 'absolute',
          left:   `${x}%`,
          top:    `${y}%`,
          width:  `${w}%`,
          height: `${h}%`,
          cursor: 'move',
          outline: selected ? '2px solid #6366f1' : '2px dashed transparent',
          outlineOffset: 2,
          background: '#f3f4f6',
          borderRadius: 6,
          overflow: 'hidden',
          touchAction: 'none',
        }}
        onMouseEnter={(e) => { if (!selected) e.currentTarget.style.outline = '2px dashed #c7d2fe'; }}
        onMouseLeave={(e) => { if (!selected) e.currentTarget.style.outline = '2px dashed transparent'; }}
      >
        <img
          src={url}
          alt={alt || ''}
          draggable={false}
          style={{ width: '100%', height: '100%', objectFit: fit || 'contain', display: 'block', pointerEvents: 'none' }}
        />

        {selected && (
          <div className="absolute -top-7 left-0 inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-600 text-white text-[10px] font-medium shadow">
            <Move className="w-3 h-3" />
            Drag to move · corners to resize · Shift = keep ratio
          </div>
        )}
      </div>

      {selected && HANDLES.map((hd) => (
        <button
          key={hd.id}
          type="button"
          aria-label={`Resize ${hd.id}`}
          onPointerDown={(e) => begin(e, 'resize', hd.id)}
          style={{
            position: 'absolute',
            left: `calc(${x + (w * hd.x) / 100}% )`,
            top:  `calc(${y + (h * hd.y) / 100}% )`,
            transform: `translate(${hd.tx}%, ${hd.ty}%)`,
            width: 12, height: 12,
            background: '#fff',
            border: '2px solid #6366f1',
            borderRadius: 3,
            cursor: hd.cursor,
            padding: 0,
            touchAction: 'none',
            zIndex: 2,
          }}
        />
      ))}
    </div>
  );
}