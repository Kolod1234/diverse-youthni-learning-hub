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
  // SELECTION SAVE-AND-RESTORE
  // --------------------------
  // The toolbar buttons / pickers / colour palettes can lose the editor's
  // Range/Selection on click (focus shift to the popover element, the dropdown
  // open click consuming the selection, etc.). We snapshot the last Range that
  // was inside this editor on every selectionchange / mouseup / keyup / blur
  // and restore it BEFORE every formatting command. This is the canonical fix
  // for execCommand / Range-based editors and is required by the InlineToolbar
  // commands (font size, highlight, sub/sup, links, case transforms, etc.).
  const savedRangeRef = useRef(null);

  useEffect(() => {
    if (!innerRef.current) return;
    if (innerRef.current.innerHTML !== value && document.activeElement !== innerRef.current) {
      innerRef.current.innerHTML = value || '';
      lastValue.current = value || '';
    }
  }, [value]);

  // --- Selection helpers ------------------------------------------------
  // We snapshot the live selection whenever it changes while the editor is
  // focused, then restore the snapshot before each command so toolbar /
  // dropdown clicks that briefly move focus (or that the browser processes
  // before our preventDefault) do not lose the user's selected text.
  const captureSelection = () => {
    const sel = window.getSelection?.();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    if (!innerRef.current?.contains(range.commonAncestorContainer)) return;
    // Store a CLONE — the live Range mutates as the DOM changes.
    savedRangeRef.current = range.cloneRange();
  };

  useEffect(() => {
    const onSelChange = () => {
      // Only capture when this editor currently owns focus, otherwise we'd
      // overwrite our saved range with selections in OTHER inputs.
      if (document.activeElement === innerRef.current) captureSelection();
    };
    document.addEventListener('selectionchange', onSelChange);
    return () => document.removeEventListener('selectionchange', onSelChange);
  }, []);

  // Restore the saved range into the DOM selection. Returns the restored
  // Range (or null if nothing to restore / the saved range is no longer
  // attached to the editor).
  const restoreSelection = () => {
    const r = savedRangeRef.current;
    if (!r) return null;
    if (!innerRef.current?.contains(r.commonAncestorContainer)) return null;
    const sel = window.getSelection();
    if (!sel) return null;
    sel.removeAllRanges();
    sel.addRange(r);
    return r;
  };

  const getRange = () => {
    // Always try the live selection first; if it's outside the editor or
    // missing (toolbar click moved focus away), fall back to the snapshot.
    const sel = window.getSelection?.();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      if (innerRef.current?.contains(range.commonAncestorContainer)) return range;
    }
    return restoreSelection();
  };

  // Move any text-align / line-height set on the host editor div itself
  // INTO a wrapping <div> that lives inside innerHTML. Why:
  //  - execCommand("justifyCenter") and our earlier styleBlock() applied
  //    these styles to the contenteditable host's style attribute. The host's
  //    style attribute is NOT included in innerHTML, so the alignment
  //    silently vanished on serialization (the "autobiography stays
  //    left-aligned in preview" bug).
  //  - We migrate eagerly: on every emit AND on blur. If a wrapper already
  //    exists (single direct DIV child), reuse it instead of nesting.
  //  - We only migrate the block-level CSS props the toolbar actually sets
  //    on the host (text-align, line-height, text-indent). Inline-text
  //    props (color, font-size, etc.) never end up on the host so we don't
  //    touch them.
  const HOST_MIGRATE_PROPS = ['text-align', 'line-height', 'text-indent'];
  const normaliseHostStyleIntoInner = () => {
    const root = innerRef.current;
    if (!root) return false;
    let migrated = false;
    const styleObj = root.style;
    if (!styleObj || styleObj.length === 0) return false;
    // Snapshot props that are actually set on the host.
    const toMigrate = HOST_MIGRATE_PROPS
      .map(p => [p, styleObj.getPropertyValue(p)])
      .filter(([, v]) => v && v.trim());
    if (!toMigrate.length) return false;
    // Find or create the wrapping <div>.
    let wrapper = null;
    if (root.children.length === 1
        && root.firstElementChild.tagName === 'DIV'
        && root.firstElementChild.childNodes.length === root.childNodes.length) {
      wrapper = root.firstElementChild;
    } else {
      wrapper = document.createElement('div');
      while (root.firstChild) wrapper.appendChild(root.firstChild);
      root.appendChild(wrapper);
    }
    // Apply migrated props onto the wrapper (don't clobber existing values
    // unless the host explicitly overrides them — host wins because it's
    // the most recent user action).
    toMigrate.forEach(([prop, val]) => {
      wrapper.style.setProperty(prop, val);
      styleObj.removeProperty(prop);
    });
    migrated = true;
    return migrated;
  };

  const emitChange = () => {
    normaliseHostStyleIntoInner();
    onChange?.(innerRef.current?.innerHTML || '');
  };

  // Focus the editor, then restore the most-recent saved Range. Toolbar
  // commands MUST call this first so execCommand / Range ops act on the
  // user's intended selection rather than on a collapsed caret left by
  // the popover click.
  const focusEditor = () => {
    innerRef.current?.focus();
    restoreSelection();
  };

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
    captureSelection();
    emitChange();
  };

  // Wrap selection in an element. Useful for sub/sup/mark which we want
  // saved as real tags rather than execCommand's <span style="…">.
  //
  // COLLAPSED-CARET BEHAVIOUR (Word / Google Docs parity):
  // If the caret is collapsed (no text selected), insert an empty wrapper
  // at the caret and place the caret INSIDE it. Subsequently-typed text
  // will be authored inside that wrapper and inherit its style — exactly
  // what users expect when they pick "24px" or a highlight colour and
  // then start typing. Previously we silently returned, which is the
  // "Increase font does nothing" complaint.
  const wrapSelection = (tagName, attrs = {}) => {
    focusEditor();
    const range = getRange();
    if (!range) return;

    const wrapper = document.createElement(tagName);
    Object.entries(attrs).forEach(([k, v]) => wrapper.setAttribute(k, v));

    if (range.collapsed) {
      // Insert an empty wrapper with a zero-width space inside so the
      // caret has a text node to live in. The ZWSP is invisible and the
      // sanitiser keeps it (it's part of the text content, not markup).
      // Browsers replace the ZWSP with the user's next keystroke, so
      // the final HTML reads naturally.
      const zwsp = document.createTextNode('\u200B');
      wrapper.appendChild(zwsp);
      range.insertNode(wrapper);
      // Place caret immediately AFTER the ZWSP, inside the wrapper, so
      // typed input goes into wrapper, inheriting its style.
      const sel = window.getSelection();
      sel.removeAllRanges();
      const r = document.createRange();
      r.setStart(zwsp, 1);
      r.setEnd(zwsp, 1);
      sel.addRange(r);
      captureSelection();
      emitChange();
      return;
    }

    // NON-COLLAPSED WRAP — preserve existing inline ancestors.
    //
    // Previously this branch called `range.surroundContents(wrapper)` and
    // fell back to `extractContents` + `appendChild`. Both strategies
    // collapse the original inline parents (e.g. <mark>, <a>, <sub>) into
    // a single new wrapper — so after applying a font size to text that
    // was already highlighted, the <mark> ancestor was destroyed and the
    // highlight disappeared.
    //
    // New strategy: walk every text node inside the range and wrap EACH
    // one in its own copy of the requested tag. The original ancestor
    // chain (mark, a, sub, sup, etc.) stays intact for every text node,
    // so font family / size / colour / bold / italic can coexist with
    // any pre-existing highlight without silent no-op.
    const root = innerRef.current;
    const wrapTextNodesInRange = () => {
      // Collect every text node that intersects the range, in document order.
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode(node) {
          if (!node.nodeValue || node.nodeValue.length === 0) return NodeFilter.FILTER_REJECT;
          return range.intersectsNode(node) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
      });
      const textNodes = [];
      let n;
      while ((n = walker.nextNode())) textNodes.push(n);
      if (!textNodes.length) return [];

      const startNode = range.startContainer;
      const endNode = range.endContainer;
      const startOffset = range.startOffset;
      const endOffset = range.endOffset;

      const wrappers = [];
      textNodes.forEach((tn) => {
        // Trim each text node to the part that's inside the range.
        let s = 0, e = tn.nodeValue.length;
        if (tn === startNode) s = startOffset;
        if (tn === endNode) e = endOffset;
        if (s >= e) return;
        // Split off the leading/trailing pieces so the wrapper covers
        // EXACTLY the selected portion — no styling leakage.
        let target = tn;
        if (e < tn.nodeValue.length) target.splitText(e);
        if (s > 0) target = target.splitText(s);
        const w = wrapper.cloneNode(false); // new element with same tag + attrs
        target.parentNode.insertBefore(w, target);
        w.appendChild(target);
        wrappers.push(w);
      });
      return wrappers;
    };

    let wrappers = [];
    try {
      wrappers = wrapTextNodesInRange();
    } catch {
      // Last-resort: if the tree walker / split strategy throws (e.g. the
      // range straddles a non-text boundary in a way we can't handle), use
      // the historic extract/insert path so the user still gets the style
      // applied — accepting the same flatten-ancestor side-effect that
      // existed before. This is rare in normal authoring flows.
      try { range.surroundContents(wrapper); wrappers = [wrapper]; }
      catch {
        const frag = range.extractContents();
        wrapper.appendChild(frag);
        range.insertNode(wrapper);
        wrappers = [wrapper];
      }
    }

    // Re-select the wrapped text so consecutive toolbar actions still act
    // on the same range (font size → text colour → bold etc.).
    const sel = window.getSelection();
    sel.removeAllRanges();
    if (wrappers.length > 0) {
      const r = document.createRange();
      r.setStartBefore(wrappers[0]);
      r.setEndAfter(wrappers[wrappers.length - 1]);
      sel.addRange(r);
    }
    captureSelection();
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
  //
  // CRITICAL FIX (autobiography text-align:center regression):
  // A fresh paragraph block typically contains a bare text node — no
  // <p>/<h*>/<div> child inside the contenteditable. Previously we fell
  // back to styling `innerRef.current` itself (the host editor div), which
  // visually centred the text inside the editor but did NOT survive
  // serialisation: `innerHTML` only emits the host's children, not its own
  // style attribute. The serialiser then saw no aligned child and produced
  // a default-aligned <p>, so the preview computed `text-align: start`.
  //
  // Fix: when there is no real block child to target, wrap the editor's
  // current contents in a single <div> (preserving any selection range)
  // and style THAT wrapper. That moves the style INSIDE innerHTML, so it
  // serialises and round-trips correctly.
  const styleBlock = (prop, value) => {
    focusEditor();
    const root = innerRef.current;
    if (!root) return;
    const range = getRange();
    const start = range ? (range.startContainer.nodeType === 3 ? range.startContainer.parentNode : range.startContainer) : root;
    const blockSelector = 'p,h1,h2,h3,h4,h5,h6,li,blockquote,div';
    let block = start?.closest?.(blockSelector);
    // Only accept the match if it's a real DESCENDANT of the editor (closest()
    // climbs through ancestors too, which would include the editor root and
    // any wrapping section — both useless for serialisation).
    if (!block || block === root || !root.contains(block) || block.parentNode !== root && !root.contains(block.parentNode)) {
      // Fall through to wrap logic below.
      block = null;
    }
    if (!block) {
      // No block child to target. Wrap the editor's children in a <div>
      // so the style attribute lands inside innerHTML.
      // Re-use an existing single-wrapper if we already created one to
      // avoid stacking <div><div>… on repeated clicks.
      const onlyChild = root.children.length === 1 ? root.firstElementChild : null;
      if (onlyChild && onlyChild.tagName === 'DIV' && onlyChild.childNodes.length === root.childNodes.length) {
        block = onlyChild;
      } else {
        const wrapper = document.createElement('div');
        // Move every existing child (text + element nodes) into the wrapper.
        while (root.firstChild) wrapper.appendChild(root.firstChild);
        root.appendChild(wrapper);
        block = wrapper;
      }
    }
    if (value === null || value === undefined || value === '') {
      block.style.removeProperty(prop);
      // If the wrapper is now style-less and was created by us (the
      // "single direct DIV child" pattern), leave it — it's harmless and
      // preserves selection. The serialiser handles bare <div>s fine.
    } else {
      block.style.setProperty(prop, value);
    }
    emitChange();
  };

  // Unwrap any element of the given tag(s) that fully contains the current
  // selection — used by the "no highlight" branch to remove an existing
  // <mark> without touching the rest of the inline formatting.
  const unwrapAncestor = (tagNames) => {
    focusEditor();
    const range = getRange();
    if (!range) return false;
    const tags = Array.isArray(tagNames) ? tagNames : [tagNames];
    let node = range.commonAncestorContainer;
    if (node && node.nodeType === 3) node = node.parentNode;
    let target = null;
    while (node && innerRef.current?.contains(node)) {
      if (node.nodeType === 1 && tags.includes(node.tagName.toLowerCase())) {
        target = node; break;
      }
      node = node.parentNode;
    }
    if (!target) return false;
    const parent = target.parentNode;
    while (target.firstChild) parent.insertBefore(target.firstChild, target);
    parent.removeChild(target);
    emitChange();
    return true;
  };

  // Expose the node + helpers to the parent via ref.
  React.useImperativeHandle(ref, () => ({
    el: () => innerRef.current,
    focus: () => innerRef.current?.focus(),
    // Save the current selection so a subsequent toolbar interaction (which
    // may move focus into a popover) can still restore the user's range.
    captureSelection,
    // Restore the saved selection — used by the toolbar before opening a
    // popover or executing a command.
    restoreSelection,
    format: (cmd, arg) => {
      focusEditor();              // ALSO restores the saved selection
      try {
        // styleWithCSS makes foreColor / hiliteColor emit <span style="…">
        // which our sanitiser preserves, instead of legacy <font color>.
        document.execCommand('styleWithCSS', false, true);
        document.execCommand(cmd, false, arg);
      } catch (_) {}
      // Snapshot the new selection so a chained command still finds it.
      captureSelection();
      emitChange();
    },
    transformSelection,
    wrapSelection,
    toggleWrap,
    clearFormatting,
    styleBlock,
    unwrapAncestor,
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
      // Text-wrap defenses: prevent a single long token (URL, code,
      // unspaced word like "AUTOBIOGRAPHY...") from pushing the editor
      // wider than its container and causing horizontal overflow.
      // - min-width:0 lets flex/grid parents actually shrink this child
      // - max-width:100% caps it to its track
      // - white-space:normal undoes any inherited `nowrap`
      // - overflow-wrap:anywhere + word-break:break-word break long tokens
      // Caller `style` still wins for anything it explicitly sets.
      style={{
        minHeight: singleLine ? undefined : '1.5em',
        minWidth: 0,
        maxWidth: '100%',
        whiteSpace: 'normal',
        overflowWrap: 'anywhere',
        wordBreak: 'break-word',
        ...style,
      }}
      onInput={(e) => {
        // Normalise any host-level text-align/line-height (set by
        // execCommand or a stale styleBlock call before this fix) INTO the
        // serialised innerHTML before notifying the parent. Without this,
        // a learner who typed "AUTOBIOGRAPHY", clicked Align Center, then
        // typed more would emit innerHTML missing the alignment — the
        // preview would compute text-align:start.
        normaliseHostStyleIntoInner();
        const html = e.currentTarget.innerHTML;
        lastValue.current = html;
        onChange?.(html);
      }}
      onBlur={() => {
        // Snapshot the live selection one last time so the next toolbar
        // click still finds the range the user had when they left the
        // editor (e.g. clicked a dropdown that opened a popover and
        // briefly stole focus).
        captureSelection();
        // Catch the case where a user clicked Align Center as their last
        // action (no further input event) and then blurred to switch slides
        // or close edit mode. We re-emit so the wrapper-style migration
        // is persisted to the block's data before the next serialization.
        if (normaliseHostStyleIntoInner()) {
          onChange?.(innerRef.current?.innerHTML || '');
        }
      }}
      onMouseUp={captureSelection}
      onKeyUp={captureSelection}
      onTouchEnd={captureSelection}
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