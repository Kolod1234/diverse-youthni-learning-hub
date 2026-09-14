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
    const handleSelection = () => {
      const active = window.getSelection();
      if (!active || active.isCollapsed || active.rangeCount === 0) return;

      const container = containerRef.current;
      if (!container) return;
      if (!container.contains(active.anchorNode) || !container.contains(active.focusNode)) return;

      const range = active.getRangeAt(0);
      const selectedMath = Array.from(container.querySelectorAll('[data-assistant-math]'))
        .filter(mathNode => {
          try {
            return range.intersectsNode(mathNode);
          } catch {
            return false;
          }
        })
        .map(mathNode => mathNode.dataset.assistantMath)
        .filter(Boolean);
      const selectedWords = active.toString().replace(/\s+/g, ' ').trim();
      const text = [selectedWords, ...selectedMath.filter(notation => !selectedWords.includes(notation))]
        .filter(Boolean)
        .join(' ')
        .trim();
      if (!selectedMath.length && text.length < minLength) return;
      if (!text) return;

      const rect = range.getBoundingClientRect();
      setSelection({
        text,
        x: rect.left + rect.width / 2,
        y: rect.top,
        bottom: rect.bottom
      });
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);
    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('touchend', handleSelection);
    };
  }, [containerRef, minLength]);

  return { selection, clearSelection };
}