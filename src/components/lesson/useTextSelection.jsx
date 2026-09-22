import { useState, useEffect, useCallback } from 'react';

/**
 * Builds the highlighted text with typeset maths inline: plain text nodes are
 * copied, and each rendered maths container the selection touches (marked with
 * data-assistant-math by MathJaxContent) is replaced by its LaTeX notation in
 * document order, so the snippet reads as a natural sentence.
 */
function extractSelectionWithMath(range) {
  const root = range.commonAncestorContainer;

  // Selection entirely inside one rendered maths element.
  if (root.nodeType === Node.ELEMENT_NODE) {
    const owner = root.dataset?.assistantMath ? root : root.closest('[data-assistant-math]');
    if (owner) return owner.dataset.assistantMath || '';
  }

  // Selection entirely inside one text node.
  if (root.nodeType === Node.TEXT_NODE) {
    const owner = root.parentElement?.closest('[data-assistant-math]');
    if (owner) return owner.dataset.assistantMath || '';
    let fragment = root.nodeValue;
    if (root === range.startContainer && root === range.endContainer) {
      fragment = fragment.slice(range.startOffset, range.endOffset);
    } else if (root === range.startContainer) {
      fragment = fragment.slice(range.startOffset);
    } else if (root === range.endContainer) {
      fragment = fragment.slice(0, range.endOffset);
    }
    return fragment.replace(/\s+/g, ' ').trim();
  }

  const parts = [];
  const seenMath = new Set();
  const pushMath = (element) => {
    const owner = element.closest('[data-assistant-math]');
    if (owner && !seenMath.has(owner)) {
      seenMath.add(owner);
      parts.push(owner.dataset.assistantMath);
    }
  };

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL);
  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.dataset?.assistantMath && range.intersectsNode(node)) pushMath(node);
    } else if (node.nodeType === Node.TEXT_NODE) {
      // Skip the internal glyphs of typeset maths; the notation is pushed by
      // its container element instead.
      if (!node.parentElement?.closest('[data-assistant-math]') && range.intersectsNode(node)) {
        let fragment = node.nodeValue;
        if (node === range.startContainer && node === range.endContainer) {
          fragment = fragment.slice(range.startOffset, range.endOffset);
        } else if (node === range.startContainer) {
          fragment = fragment.slice(range.startOffset);
        } else if (node === range.endContainer) {
          fragment = fragment.slice(0, range.endOffset);
        }
        if (fragment) parts.push(fragment);
      }
    }
    node = walker.nextNode();
  }
  return parts.join('').replace(/\s+/g, ' ').trim();
}

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
      let text;
      try {
        text = extractSelectionWithMath(range);
      } catch {
        text = active.toString().replace(/\s+/g, ' ').trim();
      }
      if (!text || text.length < minLength) return;

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