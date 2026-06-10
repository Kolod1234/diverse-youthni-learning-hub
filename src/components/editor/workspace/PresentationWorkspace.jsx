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
 * Phase-1 REPAIR build. The previous build used `fixed inset-0` which
 * stole the LessonEditor's own sticky header height, dropped the
 * status bar slot, and routed mismatched prop names into the ribbon
 * (causing every tab to render empty). This version:
 *
 *  • Lives INSIDE the LessonEditor's `<div className="w-full">` and
 *    bounds its own height to the remaining viewport via
 *    `calc(100vh - var(--lesson-header-h, 56px))`.
 *  • Uses a strict grid: [ribbon] / [rail | stage] with the stage
 *    column itself containing the pasteboard + status bar.
 *  • Passes the status bar through WorkspaceStage's `statusBarSlot`.
 *  • Passes ribbon handlers as flat named props (matches the new
 *    ribbon prop API).
 *  • `min-w-0` on the stage column kills the horizontal page scroll.
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
}) {
  const ws = useWorkspaceState();

  const currentSlideData = slides[currentSlide] || null;
  const slideTotal = slides.length;

  const [previewOpen, setPreviewOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [undoState, setUndoState] = useState({ canUndo: false, canRedo: false });
  const [undoHandlers, setUndoHandlers] = useState({ undo: null, redo: null });

  // ---------------------------------------------------------------
  // Slide CRUD
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
  // Block-insertion ribbon commands — round-trip via serialiser.
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
    setDirty(true);
    const label = ALL_BLOCK_ITEMS.find((b) => b.type === type)?.name || 'Block';
    toast.success(`${label} added`);
  }, [currentSlideData, slides, currentSlide, onSlidesChange]);

  const handleSlideUpdate = useCallback((updatedSlide) => {
    const newSlides = [...slides];
    newSlides[currentSlide] = updatedSlide;
    onSlidesChange(newSlides);
    setDirty(true);
  }, [slides, currentSlide, onSlidesChange]);

  const handleNotesChange = useCallback((notes) => {
    if (!currentSlideData) return;
    handleSlideUpdate({ ...currentSlideData, notes });
  }, [currentSlideData, handleSlideUpdate]);

  const handleAddImage = useCallback(() => {
    if (onAddImage) return onAddImage();
    insertBlockType('image');
  }, [onAddImage, insertBlockType]);

  // ---------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------
  //
  // Height: the workspace must consume the remaining viewport below
  // the LessonEditor's own sticky header. We set a CSS custom
  // property fallback so this works even if the header height
  // changes in future.
  return (
    <div
      className="flex flex-col bg-white h-full w-full"
      style={{
        // Belt and braces against any rogue child trying to widen
        // the page beyond the viewport.
        maxWidth: '100vw',
        overflow: 'hidden',
      }}
    >
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

      {/* Main row: rail | stage */}
      <div className="flex flex-1 min-h-0 min-w-0">
        {/* Desktop rail — fixed 240 px. Visible from md (≥768) so the
            240 px isn't lost at 820 px. Below md, the drawer takes
            over. */}
        <div className="hidden md:flex w-[240px] shrink-0 min-h-0 border-r border-slate-200 bg-white">
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

        {/* Stage column — min-w-0 is essential to allow it to shrink
            below the intrinsic content width and prevent horizontal
            page scroll. */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          {/* Below-md: in-flow "Slides (N)" bar */}
          <div className="md:hidden flex items-center gap-2 px-3 py-1.5 border-b border-slate-200 bg-white shrink-0">
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
              Slide {Math.min(currentSlide + 1, slideTotal)} of {slideTotal}
            </span>
          </div>

          {/* WorkspaceStage owns pasteboard + status bar slot.
              Notes are shown above the status bar via the slot. */}
          <WorkspaceStage
            zoom={ws.zoom}
            statusBarSlot={
              <>
                {ws.notesOpen && (
                  <WorkspaceNotes
                    open
                    onToggle={() => ws.setNotesOpen(false)}
                    value={currentSlideData?.notes}
                    onChange={handleNotesChange}
                    slideNumber={currentSlide + 1}
                  />
                )}
                <WorkspaceStatusBar
                  isPending={saving}
                  hasError={!!saveError}
                  isDirty={dirty}
                  isPersisted={isPersisted}
                  slideIndex={currentSlide}
                  slideCount={slideTotal}
                  zoom={ws.zoom?.value ?? 'fit'}
                  onZoomChange={(v) => {
                    if (v === 'fit') return ws.setZoomId('fit');
                    if (v === 0.5)  return ws.setZoomId('50');
                    if (v === 0.75) return ws.setZoomId('75');
                    if (v === 1)    return ws.setZoomId('100');
                  }}
                />
              </>
            }
          >
            {currentSlideData && (
              <BuilderHost
                slide={currentSlideData}
                onChange={handleSlideUpdate}
                builderFlushRef={builderFlushRef}
                isPersisted={isPersisted}
                onUndoStateChange={setUndoState}
                onUndoHandlersChange={setUndoHandlers}
              />
            )}
          </WorkspaceStage>
        </div>
      </div>

      {/* Mobile slide drawer — same rail component, no duplicated state. */}
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

      {/* Slide inspector — collapsible. */}
      <WorkspaceInspector
        open={ws.inspectorOpen}
        onOpenChange={ws.setInspectorOpen}
        slide={currentSlideData}
        slideIndex={currentSlide}
        slideTotal={slideTotal}
        onSlideChange={handleSlideUpdate}
      />

      {/* Preview */}
      <PreviewModal
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        html={currentSlideData?.content || ''}
      />
    </div>
  );
}

/**
 * BuilderHost — wires the existing VisualLessonBuilder into the stage.
 * The builder owns its own keyboard undo/redo. Ribbon Undo/Redo
 * dispatch synthetic key events so we don't fork the builder's
 * internal stack.
 */
function BuilderHost({
  slide, onChange, builderFlushRef, isPersisted,
  onUndoStateChange, onUndoHandlersChange,
}) {
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
    onUndoStateChange({ canUndo: true, canRedo: true });
  }, [onUndoHandlersChange, onUndoStateChange]);

  return (
    <div className="w-full min-h-full p-4">
      <VisualLessonBuilder
        slide={slide}
        onChange={onChange}
        flushRef={builderFlushRef}
        isPersisted={isPersisted}
      />
    </div>
  );
}