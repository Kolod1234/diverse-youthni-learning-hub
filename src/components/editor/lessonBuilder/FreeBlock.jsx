import React, { useRef, useCallback, useEffect } from 'react';
import { RotateCw, Copy, Trash2, ChevronUp, ChevronDown, BringToFront, SendToBack } from 'lucide-react';

// FreeBlock
// ---------------------------------------------------------------
// Absolutely-positioned, rotatable, resizable wrapper for any block
// content. Tracks selection through the parent (`selected` prop) so
// only one set of handles is visible at a time. All position/size
// values are percentages of the parent canvas — host math is done
// at pointermove time.

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

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

export default function FreeBlock({
  frame, selected, onSelect, onChange,
  onDuplicate, onDelete,
  onBringForward, onSendBackward,
  onBringToFront, onSendToBack,
  // When true, the per-block toolbar / rotate / resize handles are hidden.
  // Used while a group selection overlay owns the transforms instead.
  suppressChrome = false,
  hostRectRef,    // ref to the canvas DOMRect getter
  children,
}) {
  const dragRef = useRef(null);
  // Keep onChange in a ref so the window-level move handler always
  // reads the latest closure without having to re-bind listeners.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  // Window-level pointer handlers — reliable across rerenders and
  // when the cursor leaves the block element while dragging.
  useEffect(() => {
    const onMove = (e) => {
      const d = dragRef.current;
      if (!d) return;
      e.preventDefault();
      const dxPct = ((e.clientX - d.sx) / d.host.width) * 100;
      const dyPct = ((e.clientY - d.sy) / d.host.height) * 100;
      const s = d.start;

      if (d.mode === 'move') {
        onChangeRef.current({
          x: clamp(s.x + dxPct, 0, 100 - s.w),
          y: clamp(s.y + dyPct, 0, 100 - s.h),
        });
        return;
      }

      if (d.mode === 'rotate') {
        const cx = d.host.left + ((s.x + s.w / 2) / 100) * d.host.width;
        const cy = d.host.top  + ((s.y + s.h / 2) / 100) * d.host.height;
        const ang = Math.atan2(e.clientY - cy, e.clientX - cx) * 180 / Math.PI + 90;
        const r = e.shiftKey ? Math.round(ang / 15) * 15 : Math.round(ang);
        onChangeRef.current({ r });
        return;
      }

      // Resize
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
      onChangeRef.current({ x: nx, y: ny, w: nw, h: nh });
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

  const begin = useCallback((e, mode, handle = null) => {
    // Don't start a drag from a contenteditable / form element so the
    // user can still type / click inside the block content.
    const t = e.target;
    const tag = (t?.tagName || '').toLowerCase();
    const editable = t?.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select' || tag === 'button';
    if (mode === 'move' && editable && selected) return;

    e.preventDefault();
    e.stopPropagation();
    // Pass the original event so the canvas can honour Shift/Cmd/Ctrl
    // for additive multi-selection.
    onSelect?.(e);
    const host = hostRectRef.current?.();
    if (!host) return;
    dragRef.current = {
      mode, handle,
      sx: e.clientX, sy: e.clientY,
      host,
      start: { ...frame },
    };
  }, [frame, hostRectRef, onSelect, selected]);

  return (
    <div
      style={{
        position: 'absolute',
        left:   `${frame.x}%`,
        top:    `${frame.y}%`,
        width:  `${frame.w}%`,
        height: `${frame.h}%`,
        transform: `rotate(${frame.r || 0}deg)`,
        transformOrigin: 'center center',
        zIndex: frame.z || 1,
        cursor: 'move',
        outline: selected ? '2px solid #6366f1' : '1px dashed transparent',
        outlineOffset: 2,
        borderRadius: 4,
        boxSizing: 'border-box',
        touchAction: 'none',
      }}
      onPointerDown={(e) => begin(e, 'move')}
      onMouseEnter={(e) => { if (!selected) e.currentTarget.style.outline = '1px dashed #c7d2fe'; }}
      onMouseLeave={(e) => { if (!selected) e.currentTarget.style.outline = '1px dashed transparent'; }}
    >
      {/* Inner content — pointer events disabled while not selected so a
          click selects the frame; once selected, pointer events return
          so the user can edit text, click image controls, etc.
          We deliberately DO NOT stop propagation here — the outer wrapper
          needs to receive pointerdown so dragging keeps working after the
          block is selected. The `begin` handler itself opts out of drag
          when the pointer originates inside an editable element. */}
      <div
        style={{
          position: 'absolute', inset: 0,
          overflow: 'hidden',
          pointerEvents: selected ? 'auto' : 'none',
          userSelect: selected ? 'auto' : 'none',
        }}
      >
        {children}
      </div>

      {/* Selection chrome — hidden when a group overlay owns the transforms */}
      {selected && !suppressChrome && (
        <>
          {/* Toolbar above */}
          <div
            style={{
              position: 'absolute',
              top: -34, left: 0,
              transform: `rotate(${-(frame.r || 0)}deg)`,
              transformOrigin: 'top left',
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '4px 6px',
              background: '#1f2937', color: '#fff',
              borderRadius: 6, fontSize: 11,
              boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <ToolBtn title="Bring to front" onClick={onBringToFront}><BringToFront className="w-3 h-3" /></ToolBtn>
            <ToolBtn title="Bring forward" onClick={onBringForward}><ChevronUp className="w-3 h-3" /></ToolBtn>
            <ToolBtn title="Send backward" onClick={onSendBackward}><ChevronDown className="w-3 h-3" /></ToolBtn>
            <ToolBtn title="Send to back" onClick={onSendToBack}><SendToBack className="w-3 h-3" /></ToolBtn>
            <span style={{ width: 1, height: 14, background: 'rgba(255,255,255,0.2)', margin: '0 2px' }} />
            <ToolBtn title="Duplicate" onClick={onDuplicate}><Copy className="w-3 h-3" /></ToolBtn>
            <ToolBtn title="Delete" onClick={onDelete}><Trash2 className="w-3 h-3" /></ToolBtn>
          </div>

          {/* Rotate handle */}
          <button
            type="button"
            aria-label="Rotate"
            onPointerDown={(e) => begin(e, 'rotate')}
            style={{
              position: 'absolute',
              left: '50%', top: -28,
              transform: 'translate(-50%, 0)',
              width: 18, height: 18, padding: 0,
              borderRadius: '50%',
              background: '#fff', border: '2px solid #6366f1',
              cursor: 'grab', zIndex: 3,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <RotateCw style={{ width: 10, height: 10, color: '#4f46e5' }} />
          </button>

          {/* 8 resize handles — PowerPoint-style.
              Each handle is a 22×22 px transparent hit-zone (easy to grab,
              even on edges/corners) with a small 10×10 visible dot inside.
              zIndex 4 keeps them above the inner content so they're always
              reachable, even when the block contains scrollable text. */}
          {HANDLES.map((hd) => (
            <span
              key={hd.id}
              role="button"
              aria-label={`Resize ${hd.id}`}
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
                  border: '2px solid #6366f1',
                  borderRadius: 2,
                  boxShadow: '0 1px 3px rgba(0,0,0,0.25)',
                  pointerEvents: 'none',
                }}
              />
            </span>
          ))}
        </>
      )}
    </div>
  );
}

function ToolBtn({ children, title, onClick }) {
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
      onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
    >
      {children}
    </button>
  );
}