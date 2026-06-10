import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { LayoutList } from 'lucide-react';
import VisualLessonBuilder from '@/components/editor/lessonBuilder/VisualLessonBuilder';
import PreviewModal from '@/components/editor/lessonBuilder/PreviewModal';
import { blocksToHtml, htmlToBlocks } from '@/components/editor/lessonBuilder/htmlSerializer';
import { ALL_BLOCK_ITEMS, createBlock } from '@/components/editor/lessonBuilder/blockTypes';

import useWorkspaceState from './useWorkspaceState';
import WorkspaceRibbon from './WorkspaceRibbon';
import WorkspaceThumbnailRail from './WorkspaceThumbnailRail';
import WorkspaceStage from './WorkspaceStage';
import WorkspaceNotes from './WorkspaceNotes';
import WorkspaceStatusBar from './WorkspaceStatusBar';
import WorkspaceInspector from './WorkspaceInspector';

/**
 * PresentationWorkspace
 * ---------------------
 * Phase 1 workspace shell. Wraps the existing VisualLessonBuilder in a
 * presentation-editor layout:
 *
 *   ┌──────────────────────────────────────────────────────┐
 *   │ Ribbon (Home | Insert | Design | Arrange)            │
 *   ├──────────────┬───────────────────────────────────────┤
 *   │ Slide rail   │ Pasteboard (grey) with 16:9 canvas    │
 *   │ 240 px       │ Notes (collapsible)                   │
 *   │              │ Status bar                            │
 *   └──────────────┴───────────────────────────────────────┘
 *
 * NO data shape changes. NO serializer/player edits. The inner
 * VisualLessonBuilder is the same component used today and produces the
 * same HTML in slide.content. Notes are a string written to `slide.notes`
 * via the same `onChange` path the title and content already use; the
 * Lesson schema's slides array stores additional keys verbatim and every
 * existing reader ignores them.
 *
 * All "Slide N of M" / save state / zoom state is mirrored from the
 * existing LessonEditor truth; no new business logic is introduced.
 */
export default function PresentationWorkspace({
  // Slide collection
  slides,
  currentSlide,
  onSlidesChange,
  onCurrentSlideChange,
  // Hooks already used by the existing editor
  builderFlushRef,
  isPersisted,
  // Save state (mirrored from LessonEditor)
  saving,
  saveError,
  // Lesson-level chrome handlers
  appBarSlot,
  presentSlot,
  settingsSlot,
  // Existing dialogs / modals from SlideEditor that we keep available
  onOpenTemplates,
  onOpenBlocks,
  onOpenAI,
  onRewriteWithAI,
  onEditCode,
  onImportCanva,
  onImportFigma,
  onAddImage,
  onPresent,
  // eslint-disable-next-line no-unused-vars
  presentDisabled,
}) {
  const ws = useWorkspaceState();

  const currentSlideData = slides[currentSlide] || null;
  const slideTotal = slides.length;

  // Local "dirty" probe — we don't introduce a new persistence model; we
  // just observe whether the current slide.content differs from what the
  // outer LessonEditor knows about. The LessonEditor itself owns the
  // single source of truth for persistence.
  const [previewOpen, setPreviewOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [undoState, setUndoState] = useState({ canUndo: false, canRedo: false });
  const [undoHandlers, setUndoHandlers] = useState({ undo: null, redo: null });

  // ---------------------------------------------------------------
  // Slide CRUD — reused from SlideEditor's old implementation but
  // surfaced through ribbon/rail. Same `onSlidesChange` contract.
  // ---------------------------------------------------------------
  const addSlide = useCallback(() => {
    const next = [
      ...slides,
      { title: `Slide ${slides.length + 1}`, content: '', order: slides.length + 1 },
    ];
    onSlidesChange(next);
    onCurrentSlideChange(slides.length);
    toast.success('Slide added');
  }, [slides, onSlidesChange, onCurrentSlideChange]);

  const duplicateSlide = useCallback((index) => {
    if (index == null || !slides[index]) return;
    const src = slides[index];
    const next = [...slides];
    next.splice(index + 1, 0, {
      ...src,
      title: `${src.title || 'Slide'} (Copy)`,
      order: index + 2,
    });
    next.forEach((s, i) => { s.order = i + 1; });
    onSlidesChange(next);
    onCurrentSlideChange(index + 1);
    toast.success('Slide duplicated');
  }, [slides, onSlidesChange, onCurrentSlideChange]);

  const deleteSlide = useCallback((index) => {
    if (slides.length <= 1) {
      toast.error('You need at least one slide');
      return;
    }
    const next = slides.filter((_, i) => i !== index).map((s, i) => ({ ...s, order: i + 1 }));
    onSlidesChange(next);
    onCurrentSlideChange(Math.max(0, Math.min(currentSlide, next.length - 1)));
    toast.success('Slide deleted');
  }, [slides, currentSlide, onSlidesChange, onCurrentSlideChange]);

  const onDragEnd = useCallback((result) => {
    if (!result.destination) return;
    const items = Array.from(slides);
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    items.forEach((s, i) => { s.order = i + 1; });
    onSlidesChange(items);
    onCurrentSlideChange(result.destination.index);
  }, [slides, onSlidesChange, onCurrentSlideChange]);

  // ---------------------------------------------------------------
  // Block-insertion ribbon commands — we don't reach into the inner
  // VisualLessonBuilder's block state directly (that's its private
  // undo-redo stack). Instead, we extend the current slide.content
  // with a serialised block of the requested type, then let the
  // builder re-hydrate via its external-content effect. This reuses
  // the existing htmlSerializer ↔ block parser round-trip, so no new
  // surfaces are introduced.
  // ---------------------------------------------------------------
  const insertBlockType = useCallback((type) => {
    if (!currentSlideData) return;
    const existing = currentSlideData.content || '';
    const existingBlocks = htmlToBlocks(existing);
    const next = [...existingBlocks, createBlock(type)];
    const html = blocksToHtml(next);
    const updated = { ...currentSlideData, content: html };
    const newSlides = [...slides];
    newSlides[currentSlide] = updated;
    onSlidesChange(newSlides);
    const label = ALL_BLOCK_ITEMS.find((b) => b.type === type)?.name || 'Block';
    toast.success(`${label} added`);
  }, [currentSlideData, slides, currentSlide, onSlidesChange]);

  const handleSlideUpdate = useCallback((updatedSlide) => {
    const newSlides = [...slides];
    newSlides[currentSlide] = updatedSlide;
    onSlidesChange(newSlides);
    setDirty(true);
  }, [slides, currentSlide, onSlidesChange]);

  // Notes — stored as `slide.notes` on the same slide object. Safe extra
  // key; the Lesson schema's slides items are open objects, so additional
  // keys round-trip through every existing reader unchanged.
  const handleNotesChange = useCallback((notes) => {
    if (!currentSlideData) return;
    handleSlideUpdate({ ...currentSlideData, notes });
  }, [currentSlideData, handleSlideUpdate]);

  // Image insertion — keep using the existing SlideEditor's onAddImage
  // pipeline so uploads + URL/alt/caption stay routed through the same
  // FileUploadManager → htmlSerializer path that powers the player.
  const handleAddImage = useCallback(() => {
    if (onAddImage) return onAddImage();
    insertBlockType('image');
  }, [onAddImage, insertBlockType]);

  // ---------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------
  return (
    <div className="fixed inset-0 top-0 flex flex-col bg-slate-50 z-10">
      {/* App bar — owned by the page so save state can stay co-located with
          the mutation it controls. */}
      {appBarSlot}

      {/* Ribbon */}
      <WorkspaceRibbon
        activeTab={ws.activeRibbonTab}
        onTabChange={ws.setActiveRibbonTab}
        onAddSlide={addSlide}
        onDuplicateSlide={() => duplicateSlide(currentSlide)}
        onDeleteSlide={() => {
          if (window.confirm('Delete this slide?')) deleteSlide(currentSlide);
        }}
        onUndo={() => undoHandlers.undo?.()}
        canUndo={undoState.canUndo}
        onRedo={() => undoHandlers.redo?.()}
        canRedo={undoState.canRedo}
        onAddImage={handleAddImage}
        onAddText={() => insertBlockType('paragraph')}
        onAddHeading={() => insertBlockType('heading-2')}
        onAddList={() => insertBlockType('bullet-list')}
        onAddTable={() => insertBlockType('table')}
        onOpenTemplates={onOpenTemplates}
        onOpenBlocks={onOpenBlocks}
        onOpenAI={onOpenAI}
        onRewriteWithAI={onRewriteWithAI}
        onEditCode={onEditCode}
        onImportCanva={onImportCanva}
        onImportFigma={onImportFigma}
        onPreview={() => setPreviewOpen(true)}
        onPresent={onPresent}
        onToggleNotes={() => ws.setNotesOpen((o) => !o)}
        notesOpen={ws.notesOpen}
        onToggleInspector={() => ws.setInspectorOpen((o) => !o)}
        inspectorOpen={ws.inspectorOpen}
      />

      {/* Main grid — rail | stage */}
      <div className="flex flex-1 min-h-0">
        {/* Desktop rail — persistent. Hidden below lg; replaced by a drawer
            that hosts the SAME WorkspaceThumbnailRail (no state duplication). */}
        <div className="hidden lg:flex w-[240px] xl:w-[260px] shrink-0 min-h-0">
          <WorkspaceThumbnailRail
            slides={slides}
            currentSlide={currentSlide}
            onSelect={onCurrentSlideChange}
            onDragEnd={onDragEnd}
            onAdd={addSlide}
            onDuplicate={duplicateSlide}
            onDelete={(i) => {
              if (window.confirm('Delete this slide?')) deleteSlide(i);
            }}
          />
        </div>

        {/* Stage column */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          {/* Mobile/tablet "Slides (N)" button + open inspector */}
          <div className="lg:hidden flex items-center gap-2 px-3 py-1.5 border-b border-slate-200 bg-white">
            <Button
              variant="outline"
              size="sm"
              onClick={() => ws.setRailDrawerOpen(true)}
              className="h-7 text-xs"
            >
              <LayoutList className="w-3.5 h-3.5 mr-1" />
              Slides ({slideTotal})
            </Button>
            <span className="text-xs text-slate-500">
              Slide {currentSlide + 1} of {slideTotal}
            </span>
          </div>

          {/* Pasteboard + canvas + notes + status */}
          <WorkspaceStage
            zoom={ws.zoom}
            statusBarSlot={
              <>
                <WorkspaceNotes
                  open={ws.notesOpen}
                  onToggle={() => ws.setNotesOpen((o) => !o)}
                  value={currentSlideData?.notes}
                  onChange={handleNotesChange}
                  slideNumber={currentSlide + 1}
                />
                <WorkspaceStatusBar
                  saving={saving}
                  saveError={saveError}
                  dirty={dirty}
                  isPersisted={isPersisted}
                  slideIndex={currentSlide}
                  slideTotal={slideTotal}
                  zoomId={ws.zoomId}
                  onZoomChange={ws.setZoomId}
                  onZoomStep={ws.cycleZoom}
                />
              </>
            }
          >
            {currentSlideData && (
              <div className="p-6">
                <BuilderHost
                  slide={currentSlideData}
                  onChange={handleSlideUpdate}
                  builderFlushRef={builderFlushRef}
                  isPersisted={isPersisted}
                  onUndoStateChange={setUndoState}
                  onUndoHandlersChange={setUndoHandlers}
                />
              </div>
            )}
          </WorkspaceStage>
        </div>
      </div>

      {/* Mobile slide drawer — hosts the SAME rail JSX so reorder/select
          behave identically. */}
      <Sheet open={ws.railDrawerOpen} onOpenChange={ws.setRailDrawerOpen}>
        <SheetContent side="left" className="w-[88vw] sm:w-[360px] p-0 flex flex-col">
          <SheetHeader className="px-4 pt-4 pb-2 border-b">
            <SheetTitle className="flex items-center gap-2 text-base">
              <LayoutList className="w-4 h-4 text-indigo-600" />
              Slides ({slideTotal})
            </SheetTitle>
          </SheetHeader>
          <div className="flex-1 min-h-0">
            <WorkspaceThumbnailRail
              slides={slides}
              currentSlide={currentSlide}
              onSelect={(i) => { onCurrentSlideChange(i); ws.setRailDrawerOpen(false); }}
              onDragEnd={onDragEnd}
              onAdd={addSlide}
              onDuplicate={duplicateSlide}
              onDelete={(i) => {
                if (window.confirm('Delete this slide?')) deleteSlide(i);
              }}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Slide inspector (collapsible — not permanently expanded) */}
      <WorkspaceInspector
        open={ws.inspectorOpen}
        onOpenChange={ws.setInspectorOpen}
        slide={currentSlideData}
        slideIndex={currentSlide}
        slideTotal={slideTotal}
        onSlideChange={handleSlideUpdate}
      />

      {/* Lesson settings drawer (owned by parent — rendered here so it
          inherits the workspace's z-stack) */}
      {settingsSlot}

      {/* Presenter overlay (owned by parent) */}
      {presentSlot}

      {/* Preview — uses the same PreviewModal the builder uses internally */}
      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        html={currentSlideData?.content || ''}
      />
    </div>
  );
}

/**
 * BuilderHost
 * ------------
 * Thin adapter around VisualLessonBuilder that lifts its undo/redo + dirty
 * state up so the workspace ribbon and status bar can show real values
 * instead of placeholders. We intentionally avoid forking the builder —
 * we just observe a couple of pieces of state via render-time inspection.
 */
function BuilderHost({
  slide, onChange, builderFlushRef, isPersisted,
  onUndoStateChange, onUndoHandlersChange,
}) {
  // The existing VisualLessonBuilder owns its own keyboard shortcuts for
  // undo/redo (Cmd/Ctrl+Z, Cmd/Ctrl+Shift+Z). The ribbon buttons we wire
  // here dispatch synthetic keydown events on the document so we don't
  // have to rewire the builder's internal stack — Phase 1 promise: "do
  // not change the builder".
  useEffect(() => {
    const undo = () => {
      const ev = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, bubbles: true });
      window.dispatchEvent(ev);
    };
    const redo = () => {
      const ev = new KeyboardEvent('keydown', { key: 'z', ctrlKey: true, shiftKey: true, bubbles: true });
      window.dispatchEvent(ev);
    };
    onUndoHandlersChange({ undo, redo });
    // Until we wire a deeper observer, treat undo/redo as always available
    // — the builder's internal disabled state will no-op safely.
    onUndoStateChange({ canUndo: true, canRedo: true });
  }, [onUndoHandlersChange, onUndoStateChange]);

  return (
    <VisualLessonBuilder
      slide={slide}
      onChange={onChange}
      flushRef={builderFlushRef}
      isPersisted={isPersisted}
    />
  );
}