import React, { useEffect, useMemo, useRef, useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Undo2, Redo2, Save, Eye, Plus, Check, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import BlockRenderer from './BlockRenderer';
import BlockWrapper from './BlockWrapper';
import SlashMenu from './SlashMenu';
import PreviewModal from './PreviewModal';
import { blocksToHtml, htmlToBlocks } from './htmlSerializer';
import { createBlock, BLOCK_GROUPS } from './blockTypes';
import useUndoRedo from './useUndoRedo';
import useUnsavedChangesWarning from './useUnsavedChangesWarning';
import { injectFontStylesheet } from './fontFamilies';

// VisualLessonBuilder
// ------------------------------------------------------------------------------
// Edits a single slide (title + content blocks). The parent gives us the slide
// and a setter; we keep the blocks in undo/redo'able state internally and
// always serialise back to slide.content as sanitised HTML so the existing
// LessonPlayer / presentation pages render unchanged.

const AUTOSAVE_MS = 1200;

export default function VisualLessonBuilder({
  slide, onChange, onPersist, isPersisted = false, flushRef,
  // chromeless: when true (used by the new PresentationWorkspace) the builder
  // renders ONLY the block list — no outer card wrapper, no sticky toolbar
  // row, no built-in title input. Undo/redo, save status and preview are
  // owned by the surrounding workspace chrome (ribbon + status bar).
  // Defaults to false so every legacy caller (SlideEditor canvas mode,
  // AdminCourseBuilder, etc.) renders exactly as before.
  chromeless = false,
}) {
  // Ensure Google web fonts used by the font picker are loaded into the
  // document — once per app session. Idempotent. This also covers the
  // PreviewModal (same document) and any LessonPlayer that mounts after the
  // editor in the same SPA session.
  useEffect(() => { injectFontStylesheet(); }, []);

  // Derive initial blocks from the incoming slide content exactly once.
  const initialBlocks = useMemo(() => htmlToBlocks(slide?.content || ''), [slide?.id || slide?.order]);
  const { value: blocks, setValue: setBlocks, undo, redo, reset, canUndo, canRedo } = useUndoRedo(initialBlocks);

  const [focusedId, setFocusedId] = useState(null);
  // Ephemeral accordion state: which block has its formatting / advanced
  // controls expanded. Never serialised. Only one block expanded at a time.
  const [expandedId, setExpandedId] = useState(null);
  const [slashOpen, setSlashOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  // persistedAt: only set after a *real* server save via onPersist succeeds.
  // We intentionally do NOT set this on every onChange — onChange only pushes
  // edits into the parent's form state, which is not the same as a Lesson
  // entity write. Showing "Saved" on unsaved drafts would mislead the user.
  const [persistedAt, setPersistedAt] = useState(null);
  const [saving, setSaving] = useState(false);
  const [persistError, setPersistError] = useState(null);
  const lastSerialised = useRef(slide?.content || '');
  const slideRef = useRef(slide);
  slideRef.current = slide;
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onPersistRef = useRef(onPersist);
  onPersistRef.current = onPersist;

  // Sync into builder when the parent switches to a different slide.
  useEffect(() => {
    const next = htmlToBlocks(slide?.content || '');
    reset(next);
    lastSerialised.current = slide?.content || '';
    setPersistedAt(null);
    setPersistError(null);
    setExpandedId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide?.id, slide?.order]);

  // External content refresh: when the parent replaces slide.content (e.g. a
  // template is applied from the SlideEditor), rehydrate the builder's blocks
  // *without* triggering the autosave echo loop. The guard is
  // `lastSerialised.current` — that ref always holds the HTML we last
  // produced ourselves, so any incoming content that differs from it is an
  // external mutation and we must adopt it.
  useEffect(() => {
    const incoming = slide?.content || '';
    if (incoming === lastSerialised.current) return; // our own echo — ignore
    const next = htmlToBlocks(incoming);
    reset(next);
    lastSerialised.current = incoming;
    setExpandedId(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slide?.content]);

  // Autosave: serialise blocks → HTML and push to parent on a debounce. We push
  // to the parent which writes to slide.content, keeping the existing storage
  // shape intact (LessonPlayer keeps reading slide.content as HTML).
  const isDirty = lastSerialised.current !== blocksToHtml(blocks);
  useUnsavedChangesWarning(isDirty);

  useEffect(() => {
    if (!slideRef.current) return;
    const html = blocksToHtml(blocks);
    if (html === lastSerialised.current) return;
    const t = setTimeout(() => {
      lastSerialised.current = html;
      // Push edits up into the parent's form state. This is NOT a server save
      // — it just keeps the in-memory lesson draft in sync with the blocks.
      onChangeRef.current?.({ ...slideRef.current, content: html });
    }, AUTOSAVE_MS);
    return () => clearTimeout(t);
  }, [blocks]);

  // Keyboard shortcuts: Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z, Cmd/Ctrl+S.
  useEffect(() => {
    const onKey = (e) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      if (e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); }
      else if ((e.key === 'z' && e.shiftKey) || e.key === 'y') { e.preventDefault(); redo(); }
      else if (e.key === 's') { e.preventDefault(); manualSave(); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [undo, redo, blocks]);

  // ── block mutation helpers ──────────────────────────────────────────────
  const updateBlock = (idx, patch, opts) => {
    setBlocks((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    }, opts);
  };
  const updateBlockData = (idx, data) => updateBlock(idx, { data });

  const addBlockAt = (idx, type) => {
    setBlocks((prev) => {
      const next = [...prev];
      const block = createBlock(type);
      next.splice(idx, 0, block);
      // focus the new block on next render
      setTimeout(() => setFocusedId(block.id), 0);
      return next;
    }, { immediate: true });
  };

  const duplicateBlock = (idx) => {
    setBlocks((prev) => {
      const next = [...prev];
      const clone = { ...next[idx], id: createBlock('paragraph').id, data: JSON.parse(JSON.stringify(next[idx].data || {})) };
      next.splice(idx + 1, 0, clone);
      return next;
    }, { immediate: true });
    toast.success('Block duplicated');
  };

  const deleteBlock = (idx) => {
    setBlocks((prev) => prev.filter((_, i) => i !== idx), { immediate: true });
  };

  const moveBlock = (idx, delta) => {
    setBlocks((prev) => {
      const target = idx + delta;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[idx], next[target]] = [next[target], next[idx]];
      return next;
    }, { immediate: true });
  };

  const toggleCollapse = (idx) => updateBlock(idx, { collapsed: !blocks[idx]?.collapsed }, { immediate: true });

  const onDragEnd = (result) => {
    if (!result.destination) return;
    setBlocks((prev) => {
      const next = [...prev];
      const [item] = next.splice(result.source.index, 1);
      next.splice(result.destination.index, 0, item);
      return next;
    }, { immediate: true });
  };

  // Synchronous flush: serialise the current blocks into slide.content and push
  // up to the parent IMMEDIATELY, bypassing the autosave debounce. Used by the
  // outer LessonEditor's Save Lesson button so a tutor cannot lose un-flushed
  // edits by clicking Save within the debounce window. Returns the serialised
  // HTML so the caller can also use it directly if needed.
  const flushToParent = () => {
    if (!slideRef.current) return null;
    const html = blocksToHtml(blocks);
    if (html !== lastSerialised.current) {
      lastSerialised.current = html;
      onChangeRef.current?.({ ...slideRef.current, content: html });
    }
    return html;
  };

  // Expose flush to the parent via a ref. Re-binds on every render so the
  // latest `blocks` closure is always used. Cleared on unmount.
  useEffect(() => {
    if (!flushRef) return;
    flushRef.current = flushToParent;
    return () => { if (flushRef.current === flushToParent) flushRef.current = null; };
  });

  const manualSave = async () => {
    if (!slideRef.current) return;
    const html = blocksToHtml(blocks);
    lastSerialised.current = html;
    const nextSlide = { ...slideRef.current, content: html };
    // Always push the latest blocks into the parent's draft form state.
    onChangeRef.current?.(nextSlide);

    // If the parent provided an explicit persistence callback, attempt a real
    // save. Only on a successful resolve do we claim the lesson was saved.
    if (typeof onPersistRef.current === 'function') {
      try {
        setSaving(true);
        setPersistError(null);
        await onPersistRef.current(nextSlide);
        setPersistedAt(new Date());
        toast.success('Lesson saved');
      } catch (err) {
        const msg = err?.message || 'Failed to save lesson';
        setPersistError(msg);
        toast.error(msg);
      } finally {
        setSaving(false);
      }
    } else {
      // No persistence callback wired — this is the LessonEditor draft flow.
      // The outer Save Lesson button is the source of truth for persistence;
      // here we just confirm the blocks have been applied to the draft.
      toast.success('Applied to lesson draft');
    }
  };

  // ── render ──────────────────────────────────────────────────────────────
  // Chromeless rendering branch: outer card / sticky toolbar / title input
  // are all suppressed so the builder sits cleanly INSIDE the PresentationWorkspace's
  // 16:9 slide stage. The block list still renders identically.
  return (
    <div className={chromeless ? '' : 'bg-white rounded-lg border border-gray-200'}>
      {/* Top action bar — hidden in chromeless mode (workspace ribbon
          owns Undo/Redo/Preview and the LessonEditor header owns Save). */}
      {!chromeless && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b border-gray-100 bg-gray-50/60 rounded-t-lg sticky top-0 z-10">
          <div className="flex items-center gap-1">
            <ToolbarBtn label="Undo (Ctrl+Z)" onClick={undo} disabled={!canUndo}><Undo2 className="w-4 h-4" /></ToolbarBtn>
            <ToolbarBtn label="Redo (Ctrl+Shift+Z)" onClick={redo} disabled={!canRedo}><Redo2 className="w-4 h-4" /></ToolbarBtn>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <SaveStatus
              saving={saving}
              persistedAt={persistedAt}
              dirty={isDirty}
              isPersisted={isPersisted}
              hasPersistCallback={typeof onPersist === 'function'}
              error={persistError}
            />
          </div>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setPreviewOpen(true)} className="gap-1.5">
              <Eye className="w-4 h-4" /> Preview
            </Button>
            <Button
              size="sm"
              onClick={manualSave}
              disabled={saving}
              className="gap-1.5 bg-indigo-600 hover:bg-indigo-700"
              title={typeof onPersist === 'function' ? 'Save lesson now' : 'Apply blocks to the lesson draft (use the outer Save Lesson button to persist)'}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {typeof onPersist === 'function' ? 'Save lesson' : 'Apply to lesson'}
            </Button>
          </div>
        </div>
      )}

      {/* Slide title — hidden in chromeless mode (workspace inspector owns title). */}
      {!chromeless && slide && (
        <div className="px-6 pt-4">
          <Label className="text-sm font-semibold mb-1 block">Slide title</Label>
          <Input
            value={slide.title || ''}
            onChange={(e) => onChangeRef.current?.({ ...slide, title: e.target.value })}
            placeholder="Untitled slide"
            className="text-lg font-medium"
          />
        </div>
      )}

      {/* Blocks */}
      <div className={chromeless ? 'px-2 py-2' : 'px-6 py-4'}>
        {blocks.length === 0 ? (
          <EmptyState onPick={(type) => addBlockAt(0, type)} />
        ) : (
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="builder-blocks">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2 pl-10">
                  {blocks.map((block, idx) => (
                    <Draggable key={block.id} draggableId={block.id} index={idx}>
                      {(prov, snap) => (
                        <div ref={prov.innerRef} {...prov.draggableProps}>
                          <BlockWrapper
                            index={idx}
                            block={block}
                            dragHandleProps={prov.dragHandleProps}
                            isDragging={snap.isDragging}
                            focused={focusedId === block.id}
                            onFocus={() => setFocusedId(block.id)}
                            onDuplicate={() => duplicateBlock(idx)}
                            onDelete={() => deleteBlock(idx)}
                            onMove={(delta) => moveBlock(idx, delta)}
                            onToggleCollapse={() => toggleCollapse(idx)}
                            onAddBelow={(type) => addBlockAt(idx + 1, type)}
                            expanded={expandedId === block.id}
                            onToggleExpand={() => setExpandedId((cur) => cur === block.id ? null : block.id)}
                            onRequestExpand={() => setExpandedId(block.id)}
                          >
                            <BlockRenderer
                              block={block}
                              focused={focusedId === block.id}
                              onChange={(data) => updateBlockData(idx, data)}
                            />
                          </BlockWrapper>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}

        {/* Add block at end */}
        {blocks.length > 0 && (
          <div className="pl-10 mt-3 relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSlashOpen((o) => !o)}
              className="gap-1.5 text-gray-600"
            >
              <Plus className="w-4 h-4" /> Add block
            </Button>
            {slashOpen && (
              <div className="absolute left-10 top-full mt-1 z-20">
                <SlashMenu
                  open
                  onClose={() => setSlashOpen(false)}
                  onPick={(t) => { addBlockAt(blocks.length, t); setSlashOpen(false); }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <PreviewModal open={previewOpen} onClose={() => setPreviewOpen(false)} html={blocksToHtml(blocks)} />
    </div>
  );
}

// ── auxiliary UI ──────────────────────────────────────────────────────────────
// Status semantics — never claim a server save we did not perform:
//   saving                  → "Saving…"
//   error                   → "Save failed"
//   dirty & not persisted   → "Draft changes" (never persisted yet)
//   dirty & persisted before→ "Unsaved changes"
//   clean & persistedAt     → "Saved {time}"            (real persistence happened)
//   clean & isPersisted     → "Saved"                   (parent says it's a real saved lesson)
//   otherwise               → "Not yet saved"           (brand-new draft, no edits)
function SaveStatus({ saving, persistedAt, dirty, isPersisted, hasPersistCallback, error }) {
  if (saving) {
    return <span className="inline-flex items-center gap-1.5"><Loader2 className="w-3 h-3 animate-spin" /> Saving…</span>;
  }
  if (error) {
    return <span className="inline-flex items-center gap-1.5 text-red-600" title={error}><AlertCircle className="w-3 h-3" /> Save failed</span>;
  }
  if (dirty) {
    if (isPersisted || persistedAt) return <span className="text-amber-600">Unsaved changes</span>;
    return <span className="text-amber-600">Draft changes</span>;
  }
  if (persistedAt) {
    return <span className="inline-flex items-center gap-1.5 text-emerald-600"><Check className="w-3 h-3" /> Saved {timeAgo(persistedAt)}</span>;
  }
  if (isPersisted) {
    return <span className="inline-flex items-center gap-1.5 text-emerald-600"><Check className="w-3 h-3" /> Saved</span>;
  }
  return <span className="text-gray-500">{hasPersistCallback ? 'Not yet saved' : 'Not yet saved — use Save Lesson to persist'}</span>;
}

function ToolbarBtn({ children, label, onClick, disabled }) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      onClick={onClick}
      disabled={disabled}
      className="h-8 w-8 inline-flex items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
    >
      {children}
    </button>
  );
}

function EmptyState({ onPick }) {
  return (
    <Card className="p-8 border-2 border-dashed border-gray-200 bg-gray-50/50 text-center">
      <p className="text-base font-semibold text-gray-800 mb-1">Start building this slide</p>
      <p className="text-sm text-gray-500 mb-6">Pick a block to begin. You can add, drag and reorder as much as you like.</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 max-w-3xl mx-auto">
        {BLOCK_GROUPS.flatMap(g => g.items).slice(0, 12).map(item => {
          const Icon = item.icon;
          return (
            <button
              key={item.type}
              type="button"
              onClick={() => onPick(item.type)}
              className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 text-left transition-colors"
            >
              <Icon className="w-4 h-4 text-indigo-600 shrink-0" />
              <span className="text-sm text-gray-800 truncate">{item.name}</span>
            </button>
          );
        })}
      </div>
    </Card>
  );
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 5) return 'just now';
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return date.toLocaleTimeString();
}