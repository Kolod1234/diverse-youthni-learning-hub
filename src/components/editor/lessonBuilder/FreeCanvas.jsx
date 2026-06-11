import React, { useCallback, useEffect, useRef, useState } from 'react';
import FreeBlock from './FreeBlock';
import BlockRenderer from './BlockRenderer';
import { getFrame, clampFrame } from './freeFrame';

// FreeCanvas
// ---------------------------------------------------------------
// Renders all blocks of a slide as absolutely-positioned FreeBlocks
// on a 16:9 stage. Handles selection, drag, resize, rotate, z-order
// changes, delete/duplicate, and keyboard nudging.

export default function FreeCanvas({
  blocks,
  onChangeBlocks,   // (nextBlocks, { immediate })  — pushes to undo/redo
  onSelectId,
  selectedId,
  onAddBlockHere,   // (xPct, yPct) → triggered on double-click on empty canvas
}) {
  const hostRef = useRef(null);
  const getHostRect = useCallback(() => hostRef.current?.getBoundingClientRect(), []);
  const hostRectRef = useRef(getHostRect);
  hostRectRef.current = getHostRect;

  const [draggingId, setDraggingId] = useState(null);

  // Deselect when clicking blank canvas.
  const onBackgroundDown = (e) => {
    if (e.target === hostRef.current) onSelectId?.(null);
  };

  const updateFrame = useCallback((idx, patch) => {
    onChangeBlocks((prev) => {
      const next = [...prev];
      const cur = getFrame(next[idx]);
      const nf  = clampFrame({ ...cur, ...patch });
      next[idx] = { ...next[idx], frame: nf };
      return next;
    });
  }, [onChangeBlocks]);

  const updateData = useCallback((idx, data) => {
    onChangeBlocks((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], data };
      return next;
    });
  }, [onChangeBlocks]);

  const deleteAt = useCallback((idx) => {
    onChangeBlocks((prev) => prev.filter((_, i) => i !== idx), { immediate: true });
    onSelectId?.(null);
  }, [onChangeBlocks, onSelectId]);

  const duplicateAt = useCallback((idx) => {
    onChangeBlocks((prev) => {
      const next = [...prev];
      const src = next[idx];
      const f = getFrame(src);
      const clone = {
        ...src,
        id: `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
        data: JSON.parse(JSON.stringify(src.data || {})),
        frame: clampFrame({ ...f, x: f.x + 3, y: f.y + 3, z: (f.z || 1) + 1 }),
      };
      next.splice(idx + 1, 0, clone);
      return next;
    }, { immediate: true });
  }, [onChangeBlocks]);

  // Move the selected block one layer up (above the next-highest z).
  const bringForward = useCallback((idx) => {
    onChangeBlocks((prev) => {
      const next = [...prev];
      const f = getFrame(next[idx]);
      const above = prev
        .map((b, i) => ({ z: getFrame(b).z || 1, i }))
        .filter(({ z, i }) => i !== idx && z > (f.z || 1))
        .sort((a, b) => a.z - b.z)[0];
      const newZ = above ? above.z + 1 : (f.z || 1);
      next[idx] = { ...next[idx], frame: { ...f, z: newZ } };
      return next;
    }, { immediate: true });
  }, [onChangeBlocks]);

  // Move the selected block one layer down (below the next-lowest z).
  const sendBackward = useCallback((idx) => {
    onChangeBlocks((prev) => {
      const next = [...prev];
      const f = getFrame(next[idx]);
      const below = prev
        .map((b, i) => ({ z: getFrame(b).z || 1, i }))
        .filter(({ z, i }) => i !== idx && z < (f.z || 1))
        .sort((a, b) => b.z - a.z)[0];
      const newZ = below ? Math.max(0, below.z - 1) : (f.z || 1);
      next[idx] = { ...next[idx], frame: { ...f, z: newZ } };
      return next;
    }, { immediate: true });
  }, [onChangeBlocks]);

  // Jump the selected block to the very top of the stacking order.
  const bringToFront = useCallback((idx) => {
    onChangeBlocks((prev) => {
      const maxZ = prev.reduce((m, b) => Math.max(m, getFrame(b).z || 1), 0);
      const next = [...prev];
      const f = getFrame(next[idx]);
      next[idx] = { ...next[idx], frame: { ...f, z: maxZ + 1 } };
      return next;
    }, { immediate: true });
  }, [onChangeBlocks]);

  // Jump the selected block to the very bottom of the stacking order.
  const sendToBack = useCallback((idx) => {
    onChangeBlocks((prev) => {
      const minZ = prev.reduce((m, b) => Math.min(m, getFrame(b).z || 1), Infinity);
      const next = [...prev];
      const f = getFrame(next[idx]);
      next[idx] = { ...next[idx], frame: { ...f, z: Math.max(0, (Number.isFinite(minZ) ? minZ : 1) - 1) } };
      return next;
    }, { immediate: true });
  }, [onChangeBlocks]);

  // Keyboard: arrow-nudge selected (1%, shift = 5%); Delete to remove.
  useEffect(() => {
    if (!selectedId) return;
    const onKey = (e) => {
      const idx = blocks.findIndex((b) => b.id === selectedId);
      if (idx < 0) return;
      // Don't hijack arrows when the user is typing inside the block content.
      const t = e.target;
      const tag = (t?.tagName || '').toLowerCase();
      const editable = t?.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select';
      if (editable && !['Delete', 'Backspace'].includes(e.key)) return;
      const step = e.shiftKey ? 5 : 1;
      const f = getFrame(blocks[idx]);
      if (e.key === 'ArrowLeft')  { e.preventDefault(); updateFrame(idx, { x: Math.max(0, f.x - step) }); }
      else if (e.key === 'ArrowRight'){ e.preventDefault(); updateFrame(idx, { x: Math.min(100 - f.w, f.x + step) }); }
      else if (e.key === 'ArrowUp')   { e.preventDefault(); updateFrame(idx, { y: Math.max(0, f.y - step) }); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); updateFrame(idx, { y: Math.min(100 - f.h, f.y + step) }); }
      else if (e.key === 'Delete' && !editable) { e.preventDefault(); deleteAt(idx); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedId, blocks, updateFrame, deleteAt]);

  // Double-click empty canvas → optionally let parent insert a block here.
  const onDoubleClickBg = (e) => {
    if (e.target !== hostRef.current || !onAddBlockHere) return;
    const rect = getHostRect();
    if (!rect) return;
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    onAddBlockHere(xPct, yPct);
  };

  return (
    <div
      ref={hostRef}
      onPointerDown={onBackgroundDown}
      onDoubleClick={onDoubleClickBg}
      style={{
        position: 'relative',
        width: '100%',
        aspectRatio: '16 / 9',
        background:
          'repeating-linear-gradient(0deg, transparent 0 39px, rgba(99,102,241,0.05) 39px 40px),' +
          'repeating-linear-gradient(90deg, transparent 0 39px, rgba(99,102,241,0.05) 39px 40px)',
        overflow: 'hidden',
        touchAction: 'none',
      }}
    >
      {blocks.map((b, idx) => {
        const frame = getFrame(b);
        const isSelected = selectedId === b.id;
        return (
          <FreeBlock
            key={b.id}
            frame={frame}
            selected={isSelected}
            onSelect={() => onSelectId?.(b.id)}
            onChange={(patch) => updateFrame(idx, patch)}
            onDuplicate={() => duplicateAt(idx)}
            onDelete={() => deleteAt(idx)}
            onBringForward={() => bringForward(idx)}
            onSendBackward={() => sendBackward(idx)}
            onBringToFront={() => bringToFront(idx)}
            onSendToBack={() => sendToBack(idx)}
            hostRectRef={hostRectRef}
          >
            <BlockRenderer
              block={b}
              focused={isSelected}
              onChange={(data) => updateData(idx, data)}
            />
          </FreeBlock>
        );
      })}
    </div>
  );
}