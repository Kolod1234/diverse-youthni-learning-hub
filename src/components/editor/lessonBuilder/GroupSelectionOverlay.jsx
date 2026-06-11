import React, { useEffect, useRef } from 'react';
import { Copy, Trash2 } from 'lucide-react';

// GroupSelectionOverlay
// ---------------------------------------------------------------
// When 2+ blocks are multi-selected on the FreeCanvas, this overlay
// renders a single bounding box around all of them with one set of
// move/resize handles. Dragging or resizing the box proportionally
// transforms every member block, so a group of items can be moved
// and scaled as one unit (the user's "group" interaction model).
//
// Coordinates are percentages of the canvas (same as FreeBlock).
// All math is done at pointer-move time against the original
// per-block frames captured on pointer-down, to avoid drift.

const HANDLES = [
  { id: 'nw', cursor: 'nwse-resize', x: 0,   y: 0   },
  { id: 'n',  cursor: 'ns-resize',   x: 50,  y: 0   },
  { id: 'ne', cursor: 'nesw-resize', x: 100, y: 0   },
  { id: 'e',  cursor: 'ew-resize',   x: 100, y: 50  },
  { id: 'se', cursor: 'nwse-resize', x: 100, y: 100 },
  { id: 's',  cursor: 'ns-resize',   x: 50,  y: 100 },
  { id: 'sw', cursor: 'nesw-resize', x: 0,   y: 100 },
  { id: 'w',  cursor: 'ew-resize',   x: 0,   y: 50  },
];

const MIN_GROUP_SIZE = 5; // percent

function computeBounds(frames) {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const f of frames) {
    if (f.x < minX) minX = f.x;
    if (f.y < minY) minY = f.y;
    if (f.x + f.w > maxX) maxX = f.x + f.w;
    if (f.y + f.h > maxY) maxY = f.y + f.h;
  }
  return { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
}

export default function GroupSelectionOverlay({
  members,           // [{ id, frame }]
  hostRectRef,
  onGroupTransform,  // (newFramesById) => void
  onDuplicate,
  onDelete,
}) {
  const dragRef = useRef(null);
  const onTransformRef = useRef(onGroupTransform);
  onTransformRef.current = onGroupTransform;

  const bounds = computeBounds(members.map(m => m.frame));

  useEffect(() => {
    const onMove = (e) => {
      const d = dragRef.current;
      if (!d) return;
      e.preventDefault();
      const dxPct = ((e.clientX - d.sx) / d.host.width) * 100;
      const dyPct = ((e.clientY - d.sy) / d.host.height) * 100;
      const b = d.bounds;

      let nx = b.x, ny = b.y, nw = b.w, nh = b.h;

      if (d.mode === 'move') {
        nx = Math.max(0, Math.min(100 - b.w, b.x + dxPct));
        ny = Math.max(0, Math.min(100 - b.h, b.y + dyPct));
      } else {
        // Resize — adjust the group's bounding box, then apply the same
        // scale/translation to every member proportionally.
        const h = d.handle;
        if (h.includes('e')) nw = Math.max(MIN_GROUP_SIZE, Math.min(100 - b.x, b.w + dxPct));
        if (h.includes('s')) nh = Math.max(MIN_GROUP_SIZE, Math.min(100 - b.y, b.h + dyPct));
        if (h.includes('w')) {
          const newW = Math.max(MIN_GROUP_SIZE, Math.min(b.x + b.w, b.w - dxPct));
          nx = b.x + (b.w - newW);
          nw = newW;
        }
        if (h.includes('n')) {
          const newH = Math.max(MIN_GROUP_SIZE, Math.min(b.y + b.h, b.h - dyPct));
          ny = b.y + (b.h - newH);
          nh = newH;
        }
      }

      const sx = nw / b.w;
      const sy = nh / b.h;
      const patch = {};
      for (const m of d.members) {
        const f = m.frame;
        const relX = (f.x - b.x) / b.w; // 0..1 within bounds
        const relY = (f.y - b.y) / b.h;
        patch[m.id] = {
          x: nx + relX * nw,
          y: ny + relY * nh,
          w: f.w * sx,
          h: f.h * sy,
        };
      }
      onTransformRef.current?.(patch);
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, []);

  const begin = (e, mode, handle = null) => {
    e.preventDefault();
    e.stopPropagation();
    const host = hostRectRef.current?.();
    if (!host) return;
    dragRef.current = {
      mode, handle,
      sx: e.clientX, sy: e.clientY,
      host,
      bounds: { ...bounds },
      members: members.map(m => ({ id: m.id, frame: { ...m.frame } })),
    };
  };

  return (
    <div
      style={{
        position: 'absolute',
        left:   `${bounds.x}%`,
        top:    `${bounds.y}%`,
        width:  `${bounds.w}%`,
        height: `${bounds.h}%`,
        outline: '2px dashed #6366f1',
        outlineOffset: 0,
        background: 'rgba(99,102,241,0.04)',
        cursor: 'move',
        zIndex: 9998,
        touchAction: 'none',
      }}
      onPointerDown={(e) => begin(e, 'move')}
    >
      {/* Group toolbar */}
      <div
        style={{
          position: 'absolute',
          top: -34, left: 0,
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 8px',
          background: '#4f46e5', color: '#fff',
          borderRadius: 6, fontSize: 11, fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
        }}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <span>Group · {members.length} items</span>
        <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.3)' }} />
        <GroupBtn title="Duplicate group" onClick={onDuplicate}><Copy className="w-3 h-3" /></GroupBtn>
        <GroupBtn title="Delete group" onClick={onDelete}><Trash2 className="w-3 h-3" /></GroupBtn>
      </div>

      {/* Resize handles around the group bounds */}
      {HANDLES.map((hd) => (
        <span
          key={hd.id}
          role="button"
          aria-label={`Resize group ${hd.id}`}
          onPointerDown={(e) => begin(e, 'resize', hd.id)}
          style={{
            position: 'absolute',
            left: `${hd.x}%`, top: `${hd.y}%`,
            transform: 'translate(-50%, -50%)',
            width: 22, height: 22,
            display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
            background: 'transparent',
            cursor: hd.cursor,
            touchAction: 'none',
            zIndex: 4,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              width: 10, height: 10,
              background: '#fff',
              border: '2px solid #4f46e5',
              borderRadius: 2,
              boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
              pointerEvents: 'none',
            }}
          />
        </span>
      ))}
    </div>
  );
}

function GroupBtn({ children, title, onClick }) {
  return (
    <button
      type="button"
      title={title}
      onClick={(e) => { e.stopPropagation(); onClick?.(); }}
      style={{
        width: 22, height: 22,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        background: 'transparent', color: '#fff',
        border: 'none', borderRadius: 4, cursor: 'pointer', padding: 0,
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      {children}
    </button>
  );
}