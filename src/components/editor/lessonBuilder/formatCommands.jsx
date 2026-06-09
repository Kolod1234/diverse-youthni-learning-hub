// Centralised rich-text formatting commands for the Visual Lesson Builder.
//
// applyFormat(editableEl, cmd, arg) is the single entry point used by every
// inline-editable block. It supports:
//
//   Standard execCommand passthroughs (the browser handles selection):
//     bold | italic | underline | strikeThrough
//     justifyLeft | justifyCenter | justifyRight | justifyFull
//     foreColor (arg=color) | hiliteColor (arg=color) | backColor
//     createLink (arg=url) | unlink
//     removeFormat
//
//   Custom / semantic commands implemented here:
//     subscript / superscript  — wraps selection in <sub>/<sup> (semantic,
//                                round-trips through the serializer).
//     fontName     (arg=family)
//     fontSizePx   (arg='18px' …)
//     lineHeight   (arg='1.2' | '1.5' | '2')
//     letterSpacing(arg='0.05em' …)
//     case         (arg='upper'|'lower'|'title') — transforms the selected
//                                text in place; not a CSS toggle.
//     heading      (arg='h1'|'h2'|'h3'|'p')      — formatBlock wrapper
//     indent / outdent
//
// All custom commands operate on the current Selection inside the given
// editable element; they leave the selection intact afterwards so the user
// can chain formatting actions.

const EXEC_PASSTHROUGH = new Set([
  'bold', 'italic', 'underline', 'strikeThrough',
  'justifyLeft', 'justifyCenter', 'justifyRight', 'justifyFull',
  'foreColor', 'hiliteColor', 'backColor',
  'createLink', 'unlink',
  'removeFormat',
  'insertUnorderedList', 'insertOrderedList',
  'indent', 'outdent',
]);

export function applyFormat(editableEl, cmd, arg) {
  if (!editableEl) return;

  // execCommand-backed commands — let the browser handle selection.
  if (EXEC_PASSTHROUGH.has(cmd)) {
    try {
      // styleWithCSS makes foreColor/hiliteColor emit <span style="…">
      // which the sanitiser now preserves.
      document.execCommand('styleWithCSS', false, true);
      document.execCommand(cmd, false, arg);
    } catch (_) { /* ignore */ }
    return;
  }

  switch (cmd) {
    case 'subscript':
    case 'superscript':
      wrapSelection(editableEl, cmd === 'subscript' ? 'sub' : 'sup');
      return;
    case 'heading':
      // arg = 'h1' | 'h2' | 'h3' | 'p'
      try {
        document.execCommand('formatBlock', false, arg || 'p');
      } catch (_) { /* ignore */ }
      return;
    case 'fontName':
      wrapSelectionWithStyle(editableEl, { 'font-family': String(arg || '') });
      return;
    case 'fontSizePx':
      wrapSelectionWithStyle(editableEl, { 'font-size': String(arg || '') });
      return;
    case 'lineHeight':
      // line-height is a block-level concern — apply to the containing block.
      applyBlockStyle(editableEl, 'line-height', String(arg || ''));
      return;
    case 'letterSpacing':
      wrapSelectionWithStyle(editableEl, { 'letter-spacing': String(arg || '') });
      return;
    case 'textAlign':
      applyBlockStyle(editableEl, 'text-align', String(arg || ''));
      return;
    case 'case':
      transformSelectionCase(editableEl, arg);
      return;
    default:
      // Unknown command — no-op; callers should never rely on side effects.
      return;
  }
}

// ── helpers ──────────────────────────────────────────────────────────────────

function getRangeInside(editableEl) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  // Make sure the range is within our editable.
  if (!editableEl.contains(range.commonAncestorContainer)) return null;
  return range;
}

// Wrap the current selection in a semantic tag (sub / sup).
// If the selection is already entirely inside that tag, unwrap instead.
function wrapSelection(editableEl, tagName) {
  const range = getRangeInside(editableEl);
  if (!range || range.collapsed) return;

  // If the whole selection sits inside an existing <tag>, unwrap it.
  const ancestor = findAncestor(range.commonAncestorContainer, tagName, editableEl);
  if (ancestor && rangeCoversNode(range, ancestor)) {
    unwrap(ancestor);
    return;
  }

  const wrapper = document.createElement(tagName);
  try {
    wrapper.appendChild(range.extractContents());
    range.insertNode(wrapper);
    // Restore selection over the wrapped content.
    const sel = window.getSelection();
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(wrapper);
    sel.addRange(newRange);
  } catch (_) { /* ignore */ }
}

// Wrap the selection in a <span style="…"> with the given CSS properties.
// If selection is collapsed, no-op (matches browser execCommand semantics).
function wrapSelectionWithStyle(editableEl, styleObj) {
  const range = getRangeInside(editableEl);
  if (!range || range.collapsed) return;

  const span = document.createElement('span');
  span.setAttribute(
    'style',
    Object.entries(styleObj)
      .filter(([, v]) => v !== '' && v != null)
      .map(([k, v]) => `${k}: ${v}`)
      .join('; ')
  );
  try {
    span.appendChild(range.extractContents());
    range.insertNode(span);
    // Restore selection over the wrapped content.
    const sel = window.getSelection();
    sel.removeAllRanges();
    const newRange = document.createRange();
    newRange.selectNodeContents(span);
    sel.addRange(newRange);
  } catch (_) { /* ignore */ }
}

// Apply a CSS property to the *block* element containing the current selection
// (used for text-align, line-height — properties that don't make sense on an
// inline span around just the selection).
function applyBlockStyle(editableEl, prop, value) {
  const range = getRangeInside(editableEl);
  if (!range) return;
  let node = range.commonAncestorContainer;
  if (node.nodeType === 3) node = node.parentNode;
  // Walk up to a block-ish element inside the editable. If we hit the
  // editable itself, apply the style there.
  const BLOCKISH = new Set(['P','DIV','H1','H2','H3','H4','H5','H6','LI','BLOCKQUOTE']);
  let target = node;
  while (target && target !== editableEl && !BLOCKISH.has(target.tagName)) {
    target = target.parentNode;
  }
  if (!target) target = editableEl;
  target.style.setProperty(prop, value);
}

// Transform the selected text's case. We replace the selected nodes' text in
// place to preserve inline structure (bold, links, etc.) wherever possible.
function transformSelectionCase(editableEl, mode) {
  const range = getRangeInside(editableEl);
  if (!range || range.collapsed) return;

  const transform = (s) => {
    if (mode === 'upper') return s.toUpperCase();
    if (mode === 'lower') return s.toLowerCase();
    if (mode === 'title') return toTitleCase(s);
    return s;
  };

  // Walk every text node touched by the range; modify only the slice that
  // intersects the selection so partial selections work.
  const walker = document.createTreeWalker(
    range.commonAncestorContainer.nodeType === 1
      ? range.commonAncestorContainer
      : range.commonAncestorContainer.parentNode,
    NodeFilter.SHOW_TEXT,
    null
  );
  const nodes = [];
  let n;
  while ((n = walker.nextNode())) {
    if (range.intersectsNode(n)) nodes.push(n);
  }

  nodes.forEach((textNode) => {
    const fullText = textNode.nodeValue || '';
    const startOffset = textNode === range.startContainer ? range.startOffset : 0;
    const endOffset   = textNode === range.endContainer   ? range.endOffset   : fullText.length;
    if (startOffset >= endOffset) return;
    const before = fullText.slice(0, startOffset);
    const middle = transform(fullText.slice(startOffset, endOffset));
    const after  = fullText.slice(endOffset);
    textNode.nodeValue = before + middle + after;
  });

  // Re-select the (possibly resized) range. For simplicity we collapse to end.
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

function toTitleCase(s) {
  // Title-case each whitespace-separated word; small words still capitalised
  // because educational copy generally wants Title Case throughout.
  return s.replace(/\S+/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
}

function findAncestor(node, tagName, stopAt) {
  let cur = node;
  if (cur && cur.nodeType === 3) cur = cur.parentNode;
  while (cur && cur !== stopAt) {
    if (cur.nodeType === 1 && cur.tagName.toLowerCase() === tagName) return cur;
    cur = cur.parentNode;
  }
  return null;
}

function rangeCoversNode(range, node) {
  const nodeRange = document.createRange();
  nodeRange.selectNodeContents(node);
  return (
    range.compareBoundaryPoints(Range.START_TO_START, nodeRange) <= 0 &&
    range.compareBoundaryPoints(Range.END_TO_END, nodeRange) >= 0
  );
}

function unwrap(el) {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  parent.removeChild(el);
}