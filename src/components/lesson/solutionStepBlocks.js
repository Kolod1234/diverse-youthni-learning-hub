// Dedicated step-by-step display for authored mathematics solutions.
//
// Solution boxes (worked-example / answer-block / method-steps / merged-worked-part)
// store their working as inline prose paragraphs inside one coloured box. This module
// rewrites that HTML at render time into individual step blocks - a numbered
// badge and one card per step - so each move in the working is its own block.
//
// Maths lessons additionally teach some examples as prose sections introduced by a
// top-level "Example N" heading. When the heading is followed by a run of two or
// more paragraphs or lists, that run is given the same step-by-step treatment
// (opt-in via the exampleHeadings option, used for mathematics courses).
//
// Stored lesson data is never modified; anything that does not parse cleanly is
// left exactly as authored.

const BOX_CLASS_RE = /<(?:div|section)[^>]*\bclass="[^"]*\b(?:worked-example|answer-block|method-steps|merged-worked-part)\b[^"]*"[^>]*>/gi;

const TAG_RE = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;

const VOID_TAGS = new Set([
  'br', 'img', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col',
  'embed', 'source', 'track', 'wbr',
]);

// "Step 1:" / "Step 2:" / "1." style labels at the start of a paragraph.
const STEP_LABEL_RE = /^<p[^>]*>\s*<strong[^>]*>\s*(?:Step\s*)?(\d+)\s*[.):]/i;
// Legacy inline number badge (e.g. <span class="step-number">3</span>) authored
// directly into steps; the rewriter draws its own badge, so the inline one must
// be stripped to avoid doubled numbering.
const STEP_SPAN_RE = /^<p[^>]*>\s*<span[^>]*class="[^"]*\bstep-number\b[^"]*"[^>]*>\s*(\d+)\s*<\/span>/i;
const STEP_SPAN_STRIP_P_RE = /^<p([^>]*)>\s*<span[^>]*class="[^"]*\bstep-number\b[^"]*"[^>]*>\s*\d+\s*<\/span>/i;
const CHECK_LABEL_RE = /^<p[^>]*>\s*<strong[^>]*>\s*Check\b/i;
// A paragraph that holds nothing but display maths is a continuation line of
// the step above it, so it is folded into that step's block.
const MATH_ONLY_RE = /^<p[^>]*>\s*(\$\$[\s\S]+?\$\$|<math[^>]*>[\s\S]+?<\/math>)\s*<\/p>$/i;
const LABEL_STRIP_P_RE = /^<p([^>]*)>\s*<strong[^>]*>\s*(?:Step\s*)?\d+\s*[.):]\s*<\/strong>/i;
const LABEL_STRIP_LI_RE = /^\s*<strong[^>]*>\s*(?:Step\s*)?\d+\s*[.):]\s*<\/strong>/i;

// <ol start="13"> - the start value is the question number this list answers.
const OL_START_ATTR_RE = /^<ol[^>]*\bstart=["']?(\d+)/i;

// 1 -> 'a', 2 -> 'b', ... 27 -> 'aa'
function toPartLabel(n) {
  let s = '';
  while (n > 0) {
    n -= 1;
    s = String.fromCharCode(97 + (n % 26)) + s;
    n = Math.floor(n / 26);
  }
  return s;
}

function hasVisibleText(html) {
  return html.replace(/<[^>]*>/g, '').replace(/&nbsp;|\s/g, '').length > 0;
}

// Splits an <li> body into its own text plus any lists nested directly in it.
function extractNestedLists(html) {
  const lists = [];
  const ranges = [];
  TAG_RE.lastIndex = 0;
  const stack = [];
  let m;
  while ((m = TAG_RE.exec(html)) !== null) {
    const name = (m[2] || '').toLowerCase();
    if (m[1]) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i] === name) {
          stack.length = i;
          break;
        }
      }
    } else if (!m[4] && !VOID_TAGS.has(name)) {
      if (stack.length === 0 && (name === 'ol' || name === 'ul')) {
        const b = elementBounds(html, m.index);
        if (b) {
          ranges.push([b.start, b.end]);
          lists.push(html.slice(b.start, b.end));
          TAG_RE.lastIndex = b.end;
        }
      }
      stack.push(name);
    }
  }
  let own = '';
  let pos = 0;
  for (const [s, e] of ranges) {
    own += html.slice(pos, s);
    pos = e;
  }
  own += html.slice(pos);
  return { own, lists };
}

// Containers whose children are not on the slide's top level.
const CONTAINER_TAG_RE = /^(div|section|article|table|figure|blockquote|details|ul|ol)$/i;
// "Example 3:" / "Worked example 2 - ..." heading that introduces a prose example.
const EXAMPLE_HEADING_RE = /^<h[2-6][^>]*>\s*(?:<strong[^>]*>\s*)?(?:worked\s+)?example\s+\d+/i;

// Top-level elements of a well-formed HTML fragment. Anything that does not
// parse cleanly yields fewer children and the box is left untouched.
function splitTopLevel(html) {
  const children = [];
  const stack = [];
  let start = -1;
  let m;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(html)) !== null) {
    const name = (m[2] || '').toLowerCase();
    if (m[1]) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i] === name) {
          stack.length = i;
          break;
        }
      }
      if (stack.length === 0 && start !== -1) {
        children.push(html.slice(start, m.index + m[0].length));
        start = -1;
      }
    } else if (!m[4] && !VOID_TAGS.has(name)) {
      if (stack.length === 0 && start === -1) start = m.index;
      stack.push(name);
    }
  }
  return children;
}

// Bounds of the element starting exactly at `start`, or null when the tag does
// not open a balanced element there.
function elementBounds(html, start) {
  TAG_RE.lastIndex = start;
  const first = TAG_RE.exec(html);
  if (!first || first.index !== start) return null;
  const name = (first[2] || '').toLowerCase();
  if (first[1] || first[4] || VOID_TAGS.has(name)) return null;
  const stack = [name];
  let m;
  while ((m = TAG_RE.exec(html)) !== null) {
    const n = (m[2] || '').toLowerCase();
    if (m[1]) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i] === n) {
          stack.length = i;
          break;
        }
      }
      if (stack.length === 0) return { name, start, end: m.index + m[0].length };
    } else if (!m[4] && !VOID_TAGS.has(n)) {
      stack.push(n);
    }
  }
  return null;
}

function findSolutionBoxes(html) {
  const boxes = [];
  let m;
  BOX_CLASS_RE.lastIndex = 0;
  while ((m = BOX_CLASS_RE.exec(html)) !== null) {
    if (/\/>\s*$/.test(m[0])) continue;
    const after = m.index + m[0].length;
    const tagRe = /<(\/?)(?:div|section)\b[^>]*?(\/?)>/gi;
    tagRe.lastIndex = after;
    let depth = 1;
    let close = null;
    let t;
    while ((t = tagRe.exec(html)) !== null) {
      if (t[1]) depth -= 1;
      else if (!t[2]) depth += 1;
      if (depth === 0) {
        close = t;
        break;
      }
    }
    if (!close) continue;
    boxes.push({
      start: m.index,
      end: close.index + close[0].length,
      opener: m[0],
      closeTag: close[0],
      inner: html.slice(after, close.index),
    });
  }
  return boxes;
}

// Shared step accumulator used by both the box and heading-section paths.
function buildStepItems() {
  const api = {
    items: [],
    hasSteps: false,
    questionDone: false,
    counter: 0,
  };
  api.pushStep = (num, body, kind) => {
    api.items.push({ type: 'step', num, body, kind: kind || '' });
    api.hasSteps = true;
  };
  return api;
}

// Feed one already-sliced slide element into the accumulator.
function feedElement(api, el, tag, opts) {
  const isWorkedExample = !!(opts && opts.isWorkedExample);

  if (tag === 'p') {
    const mathM = el.match(MATH_ONLY_RE);
    if (mathM) {
      for (let i = api.items.length - 1; i >= 0; i--) {
        if (api.items[i].type === 'step') {
          api.items[i].body += mathM[1];
          return;
        }
      }
    }
    const spanM = el.match(STEP_SPAN_RE);
    if (spanM) {
      api.counter = parseInt(spanM[1], 10);
      api.pushStep(api.counter, el.replace(STEP_SPAN_STRIP_P_RE, (full, attrs) => `<p${attrs}>`));
      return;
    }
    const labelM = el.match(STEP_LABEL_RE);
    const isCheck = CHECK_LABEL_RE.test(el);
    if (isWorkedExample && !api.questionDone && !labelM && !isCheck) {
      // The first unlabelled paragraph of a worked example is the question;
      // every later paragraph is a step in the working.
      api.items.push({ type: 'question', body: el });
      api.questionDone = true;
      return;
    }
    if (labelM) {
      api.counter = parseInt(labelM[1], 10);
      api.pushStep(
        api.counter,
        el.replace(LABEL_STRIP_P_RE, (full, attrs) => `<p${attrs}>`),
        isCheck ? 'check' : ''
      );
    } else {
      api.counter += 1;
      api.pushStep(api.counter, el, isCheck ? 'check' : '');
    }
    return;
  }

  if (tag === 'ol' || tag === 'ul') {
    // A list that carries a start attribute holds the working for ONE
    // examination question (the start value is that question's number).
    // Its items become lettered parts of that question (13a, 13b, ...) so
    // learners can map every step to the question it answers. Lists without
    // a start keep the sequential 1, 2, 3 step numbering.
    const startM = tag === 'ol' ? el.match(OL_START_ATTR_RE) : null;
    const base = startM ? startM[1] : null;

    if (base) {
      // A start attribute marks the working for ONE question (the value is
      // its number): every step of its working, including moves from lists
      // nested inside items, becomes a lettered part of it (13a, 13b, ...).
      // A single-step answer shows just the question number.
      const bodies = [];
      const walkQuestion = (listEl) => {
        const listInner = listEl.slice(listEl.indexOf('>') + 1, listEl.lastIndexOf('</'));
        for (const li of splitTopLevel(listInner)) {
          if (!/^<li[\s>]/i.test(li)) continue;
          const liInner = li.slice(li.indexOf('>') + 1, li.lastIndexOf('</'));
          const { own, lists } = extractNestedLists(liInner);
          if (hasVisibleText(own)) bodies.push(own.replace(LABEL_STRIP_LI_RE, ''));
          for (const nested of lists) walkQuestion(nested);
        }
      };
      walkQuestion(el);
      bodies.forEach((body, i) => {
        const num = bodies.length === 1 ? base : `${base}${toPartLabel(i + 1)}`;
        api.pushStep(num, body);
      });
      return;
    }

    // Without a start, each item is one step (a method move, or the answer to
    // the correspondingly numbered question). Lists nested inside an item are
    // further moves of that same step, not content to merge into one block:
    // they become lettered parts of it (5a, 5b, ...) without consuming the
    // step numbering.
    const walkSteps = (listEl) => {
      const listInner = listEl.slice(listEl.indexOf('>') + 1, listEl.lastIndexOf('</'));
      for (const li of splitTopLevel(listInner)) {
        if (!/^<li[\s>]/i.test(li)) continue;
        const liInner = li.slice(li.indexOf('>') + 1, li.lastIndexOf('</'));
        const { own, lists } = extractNestedLists(liInner);
        api.counter += 1;
        const unit = api.counter;
        let sub = 0;
        const emitPart = (body) => {
          sub += 1;
          api.pushStep(`${unit}${toPartLabel(sub)}`, body);
        };
        const walkNested = (nestedEl) => {
          const nestedInner = nestedEl.slice(nestedEl.indexOf('>') + 1, nestedEl.lastIndexOf('</'));
          for (const nestedLi of splitTopLevel(nestedInner)) {
            if (!/^<li[\s>]/i.test(nestedLi)) continue;
            const nestedInnerLi = nestedLi.slice(nestedLi.indexOf('>') + 1, nestedLi.lastIndexOf('</'));
            const { own: nestedOwn, lists: nestedLists } = extractNestedLists(nestedInnerLi);
            if (hasVisibleText(nestedOwn)) emitPart(nestedOwn.replace(LABEL_STRIP_LI_RE, ''));
            for (const deeper of nestedLists) walkNested(deeper);
          }
        };
        if (hasVisibleText(own)) api.pushStep(unit, own.replace(LABEL_STRIP_LI_RE, ''));
        for (const nested of lists) walkNested(nested);
      }
    };
    walkSteps(el);
    return;
  }

  api.items.push({ type: 'raw', html: el });
}

function renderItems(items) {
  return items
    .map((item) => {
      if (item.type === 'raw') return item.html;
      if (item.type === 'question') {
        return `<div class="solution-question">${item.body}</div>`;
      }
      const kindClass = item.kind ? ` is-${item.kind}` : '';
      return (
        `<div class="solution-step${kindClass}">` +
        `<span class="solution-step-number">${item.num}</span>` +
        `<div class="solution-step-body">${item.body}</div>` +
        `</div>`
      );
    })
    .join('\n');
}

function rebuildBox(box) {
  const isMergedPart = /merged-worked-part/.test(box.opener);
  const isWorkedExample = isMergedPart || /worked-example/.test(box.opener);
  let children = splitTopLevel(box.inner);
  if (children.length < 2) return null;

  // Merged sections keep their working inside classless styled sub-divs
  // (Question / Solution boxes); flatten one level so that working becomes
  // steps. Divs that carry a class (interactive widgets, nested boxes) stay
  // whole, as do all children of the other box styles.
  if (isMergedPart) {
    children = children.flatMap((child) => {
      if (!/^<div[\s>]/i.test(child) || /\bclass="/i.test(child)) return [child];
      const inner = child.slice(child.indexOf('>') + 1, child.lastIndexOf('</'));
      const innerChildren = splitTopLevel(inner);
      return innerChildren.length > 1 ? innerChildren : [child];
    });
    if (children.length < 2) return null;
  }

  const api = buildStepItems();
  for (const child of children) {
    const tag = ((child.match(/^<([a-zA-Z][a-zA-Z0-9]*)/) || [])[1] || '').toLowerCase();
    feedElement(api, child, tag, { isWorkedExample });
  }
  if (!api.hasSteps) return null;

  return box.opener + '<div class="solution-steps">' + renderItems(api.items) + '</div>' + box.closeTag;
}

// Rewrites every solution box in the HTML into the step-by-step display.
function expandBoxes(html) {
  const boxes = findSolutionBoxes(html);
  if (!boxes.length) return html;

  let out = '';
  let pos = 0;
  for (const box of boxes) {
    const rebuilt = rebuildBox(box);
    if (!rebuilt) continue;
    out += html.slice(pos, box.start) + rebuilt;
    pos = box.end;
  }
  if (pos === 0) return html;
  return out + html.slice(pos);
}

// Top-level "Example N" / "Worked example N" headings, i.e. those not nested
// inside any box or other container.
function findExampleHeadings(html) {
  const headings = [];
  const stack = [];
  TAG_RE.lastIndex = 0;
  let m;
  while ((m = TAG_RE.exec(html)) !== null) {
    const name = (m[2] || '').toLowerCase();
    if (m[1]) {
      for (let i = stack.length - 1; i >= 0; i--) {
        if (stack[i] === name) {
          stack.length = i;
          break;
        }
      }
    } else if (!m[4] && !VOID_TAGS.has(name)) {
      if (CONTAINER_TAG_RE.test(name)) {
        stack.push(name);
        continue;
      }
      if (/^h[2-6]$/.test(name)) {
        const b = elementBounds(html, m.index);
        if (b && stack.length === 0 && EXAMPLE_HEADING_RE.test(html.slice(b.start, b.end))) {
          headings.push(b);
          TAG_RE.lastIndex = b.end;
        }
      }
    }
  }
  return headings;
}

// Consecutive run of <p>/<ol>/<ul> elements directly after `from`, stopping at
// any other element, heading or non-whitespace text.
function collectRun(html, from) {
  const items = [];
  let pos = from;
  while (pos < html.length) {
    const ws = /^\s+/.exec(html.slice(pos));
    if (ws) pos += ws[0].length;
    if (pos >= html.length || html[pos] !== '<') break;
    const b = elementBounds(html, pos);
    if (!b || (b.name !== 'p' && b.name !== 'ol' && b.name !== 'ul')) break;
    items.push(b);
    pos = b.end;
  }
  return items;
}

function listItemCount(html, b) {
  const el = html.slice(b.start, b.end);
  const listInner = el.slice(el.indexOf('>') + 1, el.lastIndexOf('</'));
  return splitTopLevel(listInner).filter((li) => /^<li[\s>]/i.test(li)).length;
}

// Gives prose example sections (an "Example N" heading followed by two or more
// paragraphs/lists) the same numbered step display as solution boxes.
function wrapExampleSections(html) {
  const headings = findExampleHeadings(html);
  if (!headings.length) return html;

  let out = '';
  let pos = 0;
  for (const h of headings) {
    if (h.start < pos) continue;
    const run = collectRun(html, h.end);
    if (!run.length) continue;

    const totalSteps = run.reduce((s, b) => s + (b.name === 'p' ? 1 : listItemCount(html, b)), 0);
    if (totalSteps < 2) continue;

    // A leading paragraph followed by more working reads as the question.
    const question = run[0].name === 'p' && run.length >= 2 ? run[0] : null;

    const api = buildStepItems();
    for (const b of run) {
      if (b === question) continue;
      feedElement(api, html.slice(b.start, b.end), b.name, {});
    }
    if (!api.hasSteps) continue;

    const headingHtml = html.slice(h.start, h.end);
    const questionHtml = question
      ? `<div class="solution-question">${html.slice(question.start, question.end)}</div>\n`
      : '';
    out += html.slice(pos, h.start) +
      `<div class="solution-steps">${headingHtml}\n${questionHtml}${renderItems(api.items)}</div>`;
    pos = run[run.length - 1].end;
  }
  if (pos === 0) return html;
  return out + html.slice(pos);
}

// Rewrites solution boxes (always) and prose example sections (maths lessons)
// into the step-by-step display.
export function expandSolutionSteps(html, opts) {
  if (typeof html !== 'string') return html;
  let out = html;
  if (out.indexOf('class="') !== -1) {
    out = expandBoxes(out);
  }
  if (opts && opts.exampleHeadings && /<h[2-6]/i.test(out)) {
    out = wrapExampleSections(out);
  }
  return out;
}