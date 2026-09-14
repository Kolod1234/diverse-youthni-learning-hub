import { useState, useEffect, useCallback } from 'react';

/**
 * Watches for a learner highlighting text inside `containerRef` and reports the
 * selected string with the on-screen position of the highlight, so a helper
 * popup can be anchored to it.
 */
export default function useTextSelection(containerRef, { minLength = 3 } = {}) {
  const [selection, setSelection] = useState(null);

  const clearSelection = useCallback(() => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  useEffect(() => {
    let timer;
    let dragging = false;
    const handleSelection = () => {
      if (dragging) return;
      const active = window.getSelection();
      if (!active || active.isCollapsed || active.rangeCount === 0) return;

      const text = active.toString().replace(/\s+/g, ' ').trim();
      const container = containerRef.current;
      if (!container || text.length < minLength) return;
      if (!container.contains(active.anchorNode) || !container.contains(active.focusNode)) return;

      const rect = active.getRangeAt(0).getBoundingClientRect();
      setSelection(previous => previous?.text === text ? previous : {
        text,
        x: rect.left + rect.width / 2,
        y: rect.top,
        bottom: rect.bottom
      });
    };

    const schedule = () => { clearTimeout(timer); timer = setTimeout(handleSelection, 250); };
    const start = () => { dragging = true; clearTimeout(timer); };
    const end = () => { dragging = false; schedule(); };
    document.addEventListener('pointerdown', start);
    document.addEventListener('pointerup', end);
    document.addEventListener('pointercancel', end);
    document.addEventListener('selectionchange', schedule);
    document.addEventListener('keyup', schedule);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('pointerdown', start);
      document.removeEventListener('pointerup', end);
      document.removeEventListener('pointercancel', end);
      document.removeEventListener('selectionchange', schedule);
      document.removeEventListener('keyup', schedule);
    };
  }, [containerRef, minLength]);

  return { selection, clearSelection };
}