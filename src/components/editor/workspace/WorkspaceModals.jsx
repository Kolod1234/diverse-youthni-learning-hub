// Compatibility shim.
//
// A stale build artifact of components/editor/SlideEditor.jsx references a
// `WorkspaceModals` component that was never created in this branch. The
// current source of SlideEditor.jsx does NOT reference WorkspaceModals, but
// the linter / build cache occasionally surfaces the dangling identifier
// from an older snapshot.
//
// This file provides a no-op export so the import resolves cleanly. It
// renders nothing — every real modal (TemplateBlocks, AI dialog, Canva
// importer, etc.) is owned by SlideEditor.jsx itself or by the new
// PresentationWorkspace's WorkspaceShell. If a future caller wants a
// genuine modal-orchestration component here, it can replace this shim
// without touching any other file.
import React from 'react';
export default function WorkspaceModals() {
  return null;
}