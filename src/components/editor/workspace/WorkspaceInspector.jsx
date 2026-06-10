import React from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Wrench, Info } from 'lucide-react';

/**
 * WorkspaceInspector
 * -------------------
 * Contextual right inspector — opens ONLY when invoked from the ribbon or
 * status row, and collapses cleanly. Per the brief, controls do not live
 * permanently expanded above or below the canvas; they live here.
 *
 * Phase 1 surface (intentionally minimal, since the freeform layer model
 * is out of scope):
 *   • Slide title (already supported in the slides JSON)
 *   • Slide section / module (already supported on Lesson, not slide;
 *     surfaced here for context — read-only display of lesson section)
 *   • Slide order (read-only display; reorder is via the rail)
 *
 * No new persisted fields are introduced beyond what the existing
 * VisualLessonBuilder already writes through `onChange`. This is the
 * "safe Phase 1" inspector — wiring without scope creep.
 */
export default function WorkspaceInspector({
  open,
  onOpenChange,
  slide,
  slideIndex,
  slideTotal,
  onSlideChange,
}) {
  const updateField = (field, value) => {
    if (!slide) return;
    onSlideChange?.({ ...slide, [field]: value });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-sm overflow-y-auto bg-white p-0"
      >
        <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-5 py-4">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2 text-sm">
              <Wrench className="w-4 h-4 text-indigo-600" />
              Slide inspector
            </SheetTitle>
            <p className="text-[11px] text-slate-500">
              Slide-level settings. Block-specific controls stay on each
              block in the canvas.
            </p>
          </SheetHeader>
        </div>

        <div className="px-5 py-4 space-y-4">
          <div>
            <Label className="text-xs">Slide title</Label>
            <Input
              value={slide?.title || ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder={`Slide ${(slideIndex ?? 0) + 1}`}
              className="mt-1"
            />
          </div>

          <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-600 flex items-start gap-2">
            <Info className="w-3.5 h-3.5 mt-0.5 text-slate-400 shrink-0" />
            <p>
              Position {slideIndex != null ? slideIndex + 1 : '?'} of {slideTotal ?? '?'}.
              Drag thumbnails in the left rail to reorder.
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}