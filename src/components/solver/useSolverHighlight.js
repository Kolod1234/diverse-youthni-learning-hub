import { useState, useEffect, useCallback } from 'react';

function extractSelectionWithMath(range) {
  const root = range.commonAncestorContainer;

  if (root.nodeType === Node.ELEMENT_NODE) {
    const owner = root.dataset?.assistantMath ? root : root.closest('[data-assistant-math]');
    if (owner) return owner.dataset.assistantMath || '';
  }

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
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ALL);
  let node = walker.nextNode();
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.dataset?.assistantMath && range.intersectsNode(node) && !seenMath.has(node)) {
        seenMath.add(node);
        parts.push(node.dataset.assistantMath);
      }
    } else if (node.nodeType === Node.TEXT_NODE) {
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

const asElement = (node) => (node?.nodeType === Node.ELEMENT_NODE ? node : node?.parentElement);

/**
 * Watches for text or equation highlights inside Past Paper Solver solutions
 * (`[data-explainable-solution]`), ignoring inputs, buttons and controls.
 */
export default function useSolverHighlight(containerRef, { minLength = 3 } = {}) {
  const [selection, setSelection] = useState(null);

  const clearSelection = useCallback(() => {
    setSelection(null);
    window.getSelection()?.removeAllRanges();
  }, []);

  const openManualSelection = useCallback((text, anchorEvent, solutionKey = 'single', mode = 'explain') => {
    const cleaned = String(text || '').trim();
    if (!cleaned) return;
    const rect = anchorEvent?.currentTarget?.getBoundingClientRect?.();
    setSelection({
      text: cleaned,
      x: rect ? rect.left + rect.width / 2 : window.innerWidth / 2,
      y: rect ? rect.top : 140,
      bottom: rect ? rect.bottom : 160,
      solutionKey,
      initialMode: mode,
    });
  }, []);

  useEffect(() => {
    const handleSelection = () => {
      const active = window.getSelection();
      if (!active || active.isCollapsed || active.rangeCount === 0) return;

      const container = containerRef.current;
      if (!container) return;
      if (!container.contains(active.anchorNode) || !container.contains(active.focusNode)) return;

      const startEl = asElement(active.anchorNode);
      const endEl = asElement(active.focusNode);
      if (!startEl || !endEl) return;
      if (startEl.closest('input, textarea, select, button, [data-no-explain]')) return;
      const explainable = startEl.closest('[data-explainable-solution]') || endEl.closest('[data-explainable-solution]');
      if (!explainable) return;

      const range = active.getRangeAt(0);
      let text;
      try {
        text = extractSelectionWithMath(range);
      } catch {
        text = active.toString().replace(/\s+/g, ' ').trim();
      }
      if (!text || text.length < minLength) return;

      const card = explainable.closest('[data-solution-key]');
      const rect = range.getBoundingClientRect();
      setSelection({
        text,
        x: rect.left + rect.width / 2,
        y: rect.top,
        bottom: rect.bottom,
        solutionKey: card?.dataset?.solutionKey || 'single',
        initialMode: 'explain',
      });
    };

    const handleMathClick = (event) => {
      const container = containerRef.current;
      if (!container || !container.contains(event.target)) return;
      const active = window.getSelection();
      if (active && !active.isCollapsed) return;

      const mathEl = event.target.closest?.('[data-assistant-math]');
      if (!mathEl || mathEl.closest('button, a, [role="button"], [data-no-explain]')) return;
      if (!mathEl.closest('[data-explainable-solution]')) return;
      if (event.type === 'click' && mathEl.getAttribute('display') !== 'true') return;

      const notation = mathEl.dataset.assistantMath;
      if (!notation) return;
      const card = mathEl.closest('[data-solution-key]');
      const rect = mathEl.getBoundingClientRect();
      setSelection({
        text: notation,
        x: rect.left + rect.width / 2,
        y: rect.top,
        bottom: rect.bottom,
        solutionKey: card?.dataset?.solutionKey || 'single',
        initialMode: 'explain',
      });
    };

    document.addEventListener('mouseup', handleSelection);
    document.addEventListener('touchend', handleSelection);
    document.addEventListener('click', handleMathClick);
    document.addEventListener('dblclick', handleMathClick);
    return () => {
      document.removeEventListener('mouseup', handleSelection);
      document.removeEventListener('touchend', handleSelection);
      document.removeEventListener('click', handleMathClick);
      document.removeEventListener('dblclick', handleMathClick);
    };
  }, [containerRef, minLength]);

  return { selection, openManualSelection, clearSelection };
}