import React, { useRef, useEffect } from 'react';

// Tiny contenteditable wrapper used by every text-y block.
// - keeps an uncontrolled DOM but syncs to value on external changes
// - emits onChange(innerHTML) on input
// - supports document.execCommand-based inline formatting through `format()`
// - exposes selection-preserving helpers used by the rich toolbar:
//     transformSelection(fn) → case commands
//     wrapSelection(tag, style?) → semantic wrappers (sub, sup, mark, span)
//     clearFormatting() → strip inline tags from selection
// - swallows Enter when `singleLine` is true so heading blocks behave nicely

const InlineEditable = React.forwardRef(function InlineEditable({
  value = '',
  onChange,
  placeholder = '',
  singleLine = false,
  multiline = true,
  className = '',
  style,
  ariaLabel,
}, ref) {
  const innerRef = useRef(null);
  const lastValue = useRef(value);

  useEffect(() => {
    if (!innerRef.current) return;
    if (innerRef.current.innerHTML !== value && document.activeElement !== innerRef.current) {
      innerRef.current.innerHTML = value || '';
      lastValue.current = value || '';
    }
  }, [value]);

  // --- Selection helpers ------------------------------------------------
  // All helpers refocus the editor first; mouseDown on toolbar buttons
  // already preventDefault() so the selection survives the click.
  const getRange = () => {
    const sel = window.getSelection?.();
    if (!sel || sel.rangeCount === 0) return null;
    const range = sel.getRangeAt(0);
    if (!innerRef.current?.contains(range.commonAncestorContainer)) return null;
    return range;
  };

  const emitChange = () => onChange?.(innerRef.current?.innerHTML || '');

  const focusEditor = () => innerRef.current?.focus();

  // Replace selected text with the result of fn(selectedText). Keeps the
  // selection on the replacement so subsequent commands still apply.
  const transformSelection = (fn) => {
    focusEditor();
    const range = getRange();
    if (!range || range.collapsed) return;
    const text = range.toString();
    const replacement = fn(text);
    if (replacement === text) return;
    range.deleteContents();
    const node = document.createTextNode(replacement);
    range.insertNode(node);
    // re-select the inserted text
    const sel = window.getSelection();
    sel.removeAllRanges();
    const r = document.createRange();
    r.selectNodeContents(node);
    sel.addRange(r);
    emitChange();
  };

  // Wrap selection in an element. Useful for sub/sup/mark which we want
  // saved as real tags rather than execCommand's <span style="…">.
  const wrapSelection = (tagName, attrs = {}) => {
    focusEditor();
    const range = getRange();
    if (!range || range.collapsed) return;
    const wrapper = document.createElement(tagName);
    Object.entries(attrs).forEach(([k, v]) => wrapper.setAttribute(k, v));
    try {
      // If selection spans multiple nodes, surroundContents throws.
      // Fall back to extract → append → insert.
      range.surroundContents(wrapper);
    } catch {
      const frag = range.extractContents();
      wrapper.appendChild(frag);
      range.insertNode(wrapper);
    }
    const sel = window.getSelection();
    sel.removeAllRanges();
    const r = document.createRange();
    r.selectNodeContents(wrapper);
    sel.addRange(r);
    emitChange();
  };

  // Toggle wrap: if the selection is entirely inside <tagName>, unwrap it;
  // otherwise wrap. Used for sub / sup so the buttons act as toggles.
  const toggleWrap = (tagName) => {
    focusEditor();
    const range = getRange();
    if (!range) return;
    let node = range.commonAncestorContainer;
    if (node.nodeType === 3) node = node.parentNode;
    const existing = node?.closest?.(tagName);
    if (existing && innerRef.current.contains(existing)) {
      // unwrap
      const parent = existing.parentNode;
      while (existing.firstChild) parent.insertBefore(existing.firstChild, existing);
      parent.removeChild(existing);
      emitChange();
      return;
    }
    if (range.collapsed) return;
    wrapSelection(tagName);
  };

  // Strip inline formatting tags from the selection.
  const clearFormatting = () => {
    focusEditor();
    try {
      document.execCommand('removeFormat');
      // removeFormat doesn't strip <a>, <sub>, <sup>, <mark>; do it manually.
      const range = getRange();
      if (range) {
        const frag = range.cloneContents();
        const tmp = document.createElement('div');
        tmp.appendChild(frag);
        tmp.querySelectorAll('a, sub, sup, mark, code, small').forEach(el => {
          const parent = el.parentNode;
          while (el.firstChild) parent.insertBefore(el.firstChild, el);
          parent.removeChild(el);
        });
        range.deleteContents();
        const newFrag = document.createDocumentFragment();
        while (tmp.firstChild) newFrag.appendChild(tmp.firstChild);
        range.insertNode(newFrag);
      }
    } catch (_) {}
    emitChange();
  };

  // Apply a style to the containing block element (the nearest paragraph /
  // heading / list item / the editor root). Used for text-align,
  // text-indent, line-height — i.e. anything block-level.
  const styleBlock = (prop, value) => {
    focusEditor();
    const range = getRange();
    const start = range ? (range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer) : innerRef.current;
    const blockSelector = 'p,h1,h2,h3,h4,h5,h6,li,blockquote,div';
    let block = start?.closest?.(blockSelector);
    if (!block || !innerRef.current.contains(block)) block = innerRef.current;
    if (value === null || value === undefined || value === '') {
      block.style.removeProperty(prop);
    } else {
      block.style.setProperty(prop, value);
    }
    emitChange();
  };

  // Expose the node + helpers to the parent via ref.
  React.useImperativeHandle(ref, () => ({
    el: () => innerRef.current,
    focus: () => innerRef.current?.focus(),
    format: (cmd, arg) => {
      focusEditor();
      try { document.execCommand(cmd, false, arg); } catch (_) {}
      emitChange();
    },
    transformSelection,
    wrapSelection,
    toggleWrap,
    clearFormatting,
    styleBlock,
  }), [onChange]);

  return (
    <div
      ref={innerRef}
      contentEditable
      role="textbox"
      aria-label={ariaLabel || placeholder}
      aria-multiline={multiline}
      suppressContentEditableWarning
      data-placeholder={placeholder}
      className={`outline-none focus:ring-2 focus:ring-indigo-200 rounded transition ${className}`}
      style={{ minHeight: singleLine ? undefined : '1.5em', ...style }}
      onInput={(e) => {
        const html = e.currentTarget.innerHTML;
        lastValue.current = html;
        onChange?.(html);
      }}
      onKeyDown={(e) => {
        if (singleLine && e.key === 'Enter' && !e.shiftKey) e.preventDefault();
      }}
      onPaste={(e) => {
        // Always paste as plain text to keep the document clean.
        e.preventDefault();
        const text = (e.clipboardData || window.clipboardData).getData('text/plain');
        document.execCommand('insertText', false, text);
      }}
    />
  );
});

export default InlineEditable;