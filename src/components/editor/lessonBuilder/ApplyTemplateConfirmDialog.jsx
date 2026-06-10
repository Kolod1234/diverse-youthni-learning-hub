import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

/**
 * ApplyTemplateConfirmDialog
 *
 * Accessible Replace / Cancel confirmation shown when a slide template is
 * applied to a slide that already has content. Empty slides bypass this
 * entirely — the parent only mounts it for non-empty slides.
 *
 * Props:
 *  - open: boolean (controlled)
 *  - templateName: string (shown in the prompt)
 *  - onConfirm: () => void (called when user clicks Replace)
 *  - onCancel: () => void (called when user clicks Cancel, Escape, or backdrop)
 */
export default function ApplyTemplateConfirmDialog({
  open,
  templateName,
  onConfirm,
  onCancel,
}) {
  const confirmBtnRef = useRef(null);

  // Focus the destructive action on open so keyboard users land on a clear
  // decision point. Escape is handled natively by the Dialog primitive via
  // onOpenChange -> onCancel.
  useEffect(() => {
    if (open) {
      // Defer one tick so the dialog content is mounted before focusing.
      const t = setTimeout(() => confirmBtnRef.current?.focus(), 0);
      return () => clearTimeout(t);
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) onCancel?.();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" aria-hidden="true" />
            Replace slide content?
          </DialogTitle>
          <DialogDescription>
            Applying{templateName ? ` "${templateName}"` : ' this template'} will
            replace the current slide's content. This affects the draft only —
            nothing is saved until you click <strong>Save Lesson</strong>.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2 sm:gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            ref={confirmBtnRef}
            type="button"
            variant="destructive"
            onClick={onConfirm}
          >
            Replace
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}