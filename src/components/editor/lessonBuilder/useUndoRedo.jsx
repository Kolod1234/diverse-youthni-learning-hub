import { useRef, useState, useCallback, useEffect } from 'react';

// Lightweight undo/redo stack with debounced "commits".
// We commit a new history entry at most once every `commitDelay`ms while the
// user is typing, so the stack doesn't get flooded by every keystroke.
export default function useUndoRedo(initialValue, { commitDelay = 600, max = 80 } = {}) {
  const [value, setValue] = useState(initialValue);
  const past = useRef([]);
  const future = useRef([]);
  const pending = useRef(null);
  const timer = useRef(null);
  const [, force] = useState(0);

  useEffect(() => () => clearTimeout(timer.current), []);

  const flush = useCallback(() => {
    if (pending.current === null) return;
    past.current.push(pending.current);
    if (past.current.length > max) past.current.shift();
    future.current = [];
    pending.current = null;
    force(n => n + 1);
  }, [max]);

  const update = useCallback((updater, { immediate = false } = {}) => {
    setValue(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (pending.current === null) pending.current = prev;
      clearTimeout(timer.current);
      if (immediate) {
        // commit straight away
        past.current.push(pending.current);
        if (past.current.length > max) past.current.shift();
        future.current = [];
        pending.current = null;
        force(n => n + 1);
      } else {
        timer.current = setTimeout(flush, commitDelay);
      }
      return next;
    });
  }, [commitDelay, flush, max]);

  const undo = useCallback(() => {
    flush();
    if (!past.current.length) return;
    setValue(curr => {
      const prev = past.current.pop();
      future.current.push(curr);
      force(n => n + 1);
      return prev;
    });
  }, [flush]);

  const redo = useCallback(() => {
    if (!future.current.length) return;
    setValue(curr => {
      const next = future.current.pop();
      past.current.push(curr);
      force(n => n + 1);
      return next;
    });
  }, []);

  // Replace state without polluting the undo stack (e.g. external prop sync).
  const reset = useCallback((v) => {
    clearTimeout(timer.current);
    pending.current = null;
    past.current = [];
    future.current = [];
    setValue(v);
    force(n => n + 1);
  }, []);

  return {
    value, setValue: update, undo, redo, reset,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  };
}