import React, { useCallback, useEffect, useRef, useState } from 'react';
import FreeBlock from './FreeBlock';
import BlockRenderer from './BlockRenderer';
import GroupSelectionOverlay from './GroupSelectionOverlay';
import { getFrame, clampFrame } from './freeFrame';

// FreeCanvas
// ---------------------------------------------------------------
// Renders all blocks of a slide as absolutely-positioned FreeBlocks
// on a 16:9 stage. Handles selection (single + multi via Shift-click
// and marquee drag), drag, resize, rotate, z-order changes,
// delete/duplicate, group transform, and keyboard nudging.
//
// `selectedId` is kept as a single-string prop for backwards
// compatibility with non-canvas callers. Internally we manage a
// Set of selected ids so the canvas can support group operations.

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

  // Multi-select set. Stays in sync with the parent's single-id prop:
  // whenever the parent updates `selectedId` from elsewhere, we reset
  // the set to just that id.
  const [selectedIds, setSelectedIds] = useState(() => new Set(selectedId ? [selectedId] : []));
  useEffect(() => {
    setSelectedIds((cur) => {
      const next = new Set(selectedId ? [selectedId] : []);
      // Avoid clobbering an active multi-selection when the parent
      // re-fires the same primary id we already have in the set.
      if (selectedId && cur.has(selectedId) && cur.size > 1) return cur;
      return next;
    });
  }, [selectedId]);

  // Helper: change selection and inform the parent of the "primary" id
  // (last one selected — gives single-select consumers something to bind to).
  const setSelection = useCallback((ids, primary = null) => {
    const next = new Set(ids);
    setSelectedIds(next);
    const lead = primary && next.has(primary)
      ? primary
      : (next.size ? Array.from(next).slice(-1)[0] : null);
    onSelectId?.(lead);
  }, [onSelectId]);

  // Marquee selection state (drag-rectangle on empty canvas).
  const [marquee, setMarquee] = useState(null); // { x0,y0,x1,y1 } in % of host

  // Deselect when clicking blank canvas (no drag yet).
  const onBackgroundDown = (e) => {
    if (e.target !== hostRef.current) return;
    const rect = getHostRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    // Start a marquee. We do NOT clear selection immediately — that happens
    // in pointerup if the marquee covered nothing AND was a click-not-drag.
    setMarquee({ x0: x, y0: y, x1: x, y1: y, additive: e.shiftKey || e.metaKey || e.ctrlKey });
  };

  // Drive marquee with window-level events so it survives the cursor
  // leaving the canvas mid-drag.
  useEffect(() => {
    if (!marquee) return;
    const rect = getHostRect();
    if (!rect) return;
    const onMove = (e) => {
      const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
      const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
      setMarquee((m) => m ? { ...m, x1: x, y1: y } : null);
    };
    const onUp = () => {
      setMarquee((m) => {
        if (!m) return null;
        const left = Math.min(m.x0, m.x1);
        const top = Math.min(m.y0, m.y1);
        const right = Math.max(m.x0, m.x1);
        const bottom = Math.max(m.y0, m.y1);
        const isClick = (right - left) < 0.5 && (bottom - top) < 0.5;
        if (isClick) {
          // Bare click on empty space — clear selection unless additive.
          if (!m.additive) setSelection([]);
        } else {
          // Marquee — pick everything whose bounds intersect the rectangle.
          const hit = blocks
            .filter((b) => {
              const f = getFrame(b);
              return !(f.x + f.w < left || f.x > right || f.y + f.h < top || f.y > bottom);
            })
            .map((b) => b.id);
          if (m.additive) {
            const next = new Set(selectedIds);
            hit.forEach((id) => next.add(id));
            setSelection(next, hit[hit.length - 1]);
          } else {
            setSelection(hit, hit[hit.length - 1]);
          }
        }
        return null;
      });
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [marquee?.x0, marquee?.y0, blocks]);

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
    setSelection([]);
  }, [onChangeBlocks, setSelection]);

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

  // ── z-order helpers ────────────────────────────────────────────
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

  const bringToFront = useCallback((idx) => {
    onChangeBlocks((prev) => {
      const maxZ = prev.reduce((m, b) => Math.max(m, getFrame(b).z || 1), 0);
      const next = [...prev];
      const f = getFrame(next[idx]);
      next[idx] = { ...next[idx], frame: { ...f, z: maxZ + 1 } };
      return next;
    }, { immediate: true });
  }, [onChangeBlocks]);

  const sendToBack = useCallback((idx) => {
    onChangeBlocks((prev) => {
      const minZ = prev.reduce((m, b) => Math.min(m, getFrame(b).z || 1), Infinity);
      const next = [...prev];
      const f = getFrame(next[idx]);
      next[idx] = { ...next[idx], frame: { ...f, z: Math.max(0, (Number.isFinite(minZ) ? minZ : 1) - 1) } };
      return next;
    }, { immediate: true });
  }, [onChangeBlocks]);

  // ── group operations ───────────────────────────────────────────
  // Apply a frame patch keyed by block id (used by GroupSelectionOverlay
  // while dragging/resizing the group bounds).
  const applyGroupPatch = useCallback((patchById) => {
    onChangeBlocks((prev) => prev.map((b) => {
      const p = patchById[b.id];
      if (!p) return b;
      return { ...b, frame: clampFrame({ ...getFrame(b), ...p }) };
    }));
  }, [onChangeBlocks]);

  const deleteSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    const idsToDelete = selectedIds;
    onChangeBlocks((prev) => prev.filter((b) => !idsToDelete.has(b.id)), { immediate: true });
    setSelection([]);
  }, [onChangeBlocks, selectedIds, setSelection]);

  const duplicateSelected = useCallback(() => {
    if (selectedIds.size === 0) return;
    const idsToDup = selectedIds;
    const newIds = [];
    onChangeBlocks((prev) => {
      const next = [...prev];
      prev.forEach((b) => {
        if (!idsToDup.has(b.id)) return;
        const f = getFrame(b);
        const clone = {
          ...b,
          id: `b_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`,
          data: JSON.parse(JSON.stringify(b.data || {})),
          frame: clampFrame({ ...f, x: f.x + 3, y: f.y + 3, z: (f.z || 1) + 1 }),
        };
        next.push(clone);
        newIds.push(clone.id);
      });
      return next;
    }, { immediate: true });
    setTimeout(() => setSelection(newIds, newIds[newIds.length - 1]), 0);
  }, [onChangeBlocks, selectedIds, setSelection]);

  // ── keyboard ───────────────────────────────────────────────────
  useEffect(() => {
    if (selectedIds.size === 0) return;
    const onKey = (e) => {
      // Don't hijack arrows when the user is typing inside the block content.
      const t = e.target;
      const tag = (t?.tagName || '').toLowerCase();
      const editable = t?.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select';
      if (editable && !['Delete', 'Backspace'].includes(e.key)) return;

      if (e.key === 'Delete' && !editable) {
        e.preventDefault();
        deleteSelected();
        return;
      }

      const step = e.shiftKey ? 5 : 1;
      const arrows = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] };
      const delta = arrows[e.key];
      if (!delta) return;
      e.preventDefault();
      // Nudge every selected block in unison, clamped per-block.
      onChangeBlocks((prev) => prev.map((b) => {
        if (!selectedIds.has(b.id)) return b;
        const f = getFrame(b);
        return { ...b, frame: clampFrame({
          ...f,
          x: Math.max(0, Math.min(100 - f.w, f.x + delta[0])),
          y: Math.max(0, Math.min(100 - f.h, f.y + delta[1])),
        })};
      }));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedIds, onChangeBlocks, deleteSelected]);

  // ── double-click empty canvas → insert a block ─────────────────
  const onDoubleClickBg = (e) => {
    if (e.target !== hostRef.current || !onAddBlockHere) return;
    const rect = getHostRect();
    if (!rect) return;
    const xPct = ((e.clientX - rect.left) / rect.width) * 100;
    const yPct = ((e.clientY - rect.top) / rect.height) * 100;
    onAddBlockHere(xPct, yPct);
  };

  // Members of the current group (>= 2 selected).
  const groupMembers = selectedIds.size >= 2
    ? blocks.filter((b) => selectedIds.has(b.id)).map((b) => ({ id: b.id, frame: getFrame(b) }))
    : null;

  // Marquee rectangle in screen-relative %s.
  const marqueeRect = marquee && (() => {
    const left = Math.min(marquee.x0, marquee.x1);
    const top = Math.min(marquee.y0, marquee.y1);
    const w = Math.abs(marquee.x1 - marquee.x0);
    const h = Math.abs(marquee.y1 - marquee.y0);
    if (w < 0.5 && h < 0.5) return null;
    return { left, top, w, h };
  })();

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
        const isSelected = selectedIds.has(b.id);
        const isGroupMember = groupMembers && isSelected;
        return (
          <FreeBlock
            key={b.id}
            frame={frame}
            selected={isSelected}
            // Suppress the per-block selection chrome (handles, toolbar)
            // while a group is active — the group overlay owns those.
            suppressChrome={isGroupMember}
            onSelect={(e) => {
              // Shift/Cmd/Ctrl-click → toggle membership in the selection.
              const additive = e?.shiftKey || e?.metaKey || e?.ctrlKey;
              if (additive) {
                const next = new Set(selectedIds);
                if (next.has(b.id)) next.delete(b.id);
                else next.add(b.id);
                setSelection(next, b.id);
              } else {
                setSelection([b.id], b.id);
              }
            }}
            onChange={(patch) => {
              // While the block is part of a group selection, translate
              // single-block moves into a group translate so the user can
              // drag any group member to move the whole group.
              if (isGroupMember && (patch.x !== undefined || patch.y !== undefined)) {
                const cur = getFrame(b);
                const dx = patch.x !== undefined ? patch.x - cur.x : 0;
                const dy = patch.y !== undefined ? patch.y - cur.y : 0;
                if (dx === 0 && dy === 0) return;
                const patchById = {};
                blocks.forEach((bb) => {
                  if (!selectedIds.has(bb.id)) return;
                  const f = getFrame(bb);
                  patchById[bb.id] = {
                    x: Math.max(0, Math.min(100 - f.w, f.x + dx)),
                    y: Math.max(0, Math.min(100 - f.h, f.y + dy)),
                  };
                });
                applyGroupPatch(patchById);
                return;
              }
              updateFrame(idx, patch);
            }}
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
              focused={isSelected && !isGroupMember}
              onChange={(data) => updateData(idx, data)}
            />
          </FreeBlock>
        );
      })}

      {/* Group overlay — single set of handles for the whole selection */}
      {groupMembers && (
        <GroupSelectionOverlay
          members={groupMembers}
          hostRectRef={hostRectRef}
          onGroupTransform={applyGroupPatch}
          onDuplicate={duplicateSelected}
          onDelete={deleteSelected}
        />
      )}

      {/* Marquee rectangle while drag-selecting */}
      {marqueeRect && (
        <div
          style={{
            position: 'absolute',
            left: `${marqueeRect.left}%`,
            top: `${marqueeRect.top}%`,
            width: `${marqueeRect.w}%`,
            height: `${marqueeRect.h}%`,
            background: 'rgba(99,102,241,0.08)',
            border: '1px dashed #6366f1',
            pointerEvents: 'none',
            zIndex: 9997,
          }}
        />
      )}
    </div>
  );
}