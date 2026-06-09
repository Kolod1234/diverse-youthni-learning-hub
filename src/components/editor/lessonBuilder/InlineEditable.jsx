import React, { useRef, useEffect } from 'react';

// Tiny contenteditable wrapper used by every text-y block.
// - keeps an uncontrolled DOM but syncs to value on external changes
// - emits onChange(innerHTML) on input
// - supports document.execCommand-based inline formatting through `format()`
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

  // Expose the node + a format() helper to the parent via ref.
  React.useImperativeHandle(ref, () => ({
    el: () => innerRef.current,
    focus: () => innerRef.current?.focus(),
    format: (cmd, arg) => {
      innerRef.current?.focus();
      try { document.execCommand(cmd, false, arg); } catch (_) {}
      onChange?.(innerRef.current?.innerHTML || '');
    },
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