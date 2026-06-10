// Phase 1 workspace shell — lives ONLY in the editor chrome.
// No serialiser, no player, no entity changes. Pure UI state.
//
// Concerns owned here:
//   • zoom    (fit | 0.5 | 0.75 | 1)
//   • ribbon  (active tab + scroll state)
//   • drawers (inspector, notes, rail-on-mobile)
//   • notes   (collapse only — value lives on slide.notes which is a plain
//              extra key on the slide object, persisted by the parent's
//              existing onChange path)
//
// This hook deliberately has NO side effects. State is in-memory only and
// resets on a fresh editor session — exactly the "Phase 1, no behaviour
// drift" contract.

import { useState, useCallback, useMemo } from 'react';

export const ZOOM_PRESETS = [
  { id: 'fit', label: 'Fit', value: null },
  { id: '50', label: '50%', value: 0.5 },
  { id: '75', label: '75%', value: 0.75 },
  { id: '100', label: '100%', value: 1 },
];

export default function useWorkspaceState() {
  const [activeRibbonTab, setActiveRibbonTab] = useState('home');
  const [zoomId, setZoomId] = useState('fit');
  const [inspectorOpen, setInspectorOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [railDrawerOpen, setRailDrawerOpen] = useState(false);

  const zoom = useMemo(
    () => ZOOM_PRESETS.find((z) => z.id === zoomId) || ZOOM_PRESETS[0],
    [zoomId]
  );

  const cycleZoom = useCallback((dir = +1) => {
    setZoomId((cur) => {
      const i = ZOOM_PRESETS.findIndex((z) => z.id === cur);
      const next = Math.max(0, Math.min(ZOOM_PRESETS.length - 1, i + dir));
      return ZOOM_PRESETS[next].id;
    });
  }, []);

  return {
    activeRibbonTab,
    setActiveRibbonTab,
    zoom,
    zoomId,
    setZoomId,
    cycleZoom,
    inspectorOpen,
    setInspectorOpen,
    notesOpen,
    setNotesOpen,
    railDrawerOpen,
    setRailDrawerOpen,
  };
}