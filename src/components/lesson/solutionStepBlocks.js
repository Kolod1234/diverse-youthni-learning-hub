// Dedicated step-by-step display for authored mathematics solutions.
//
// Solution boxes (worked-example / answer-block / method-steps) store their
// working as inline prose paragraphs inside one coloured box. This module
// rewrites that HTML at render time into individual step blocks - a numbered
// badge and one card per step - so each move in the working is its own block.
// Stored lesson data is never modified; a box that does not parse cleanly is
// left exactly as authored.

const BOX_CLASS_RE = /<div[^>]*\bclass="[^"]*\b(?:worked-example|answer-block|method-steps)\b[^"]*"[^>]*>/gi;

const TAG_RE = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)((?:"[^"]*"|'[^']*'|[^>"'])*?)(\/?)>/g;

const VOID_TAGS = new Set([
  'br', 'img', 'hr', 'input', 'meta', 'link', 'area', 'base', 'col',
  'embed', 'source', 'track', 'wbr',
]);

// "Step 1:" / "Step 2:" / "1." style labels at the start of a paragraph.
const STEP_LABEL_RE = /^<p[^>]*>\s*<strong[^>]*>\s*(?:Step\s*)?(\d+)\s*[.):]/i;
const CHECK_LABEL_RE = /^<p[^>]*>\s*<strong[^>]*>\s*Check\b/i;
// A paragraph that holds nothing but display maths is a continuation line of
// the step above it, so it is folded into that step's block.
const MATH_ONLY_RE = /^<p[^>]*>\s*(\$\$[\s\S]+?\$\$|<math[^>]*>[\s\S]+?<\/math>)\s*<\/p>$/i;
const LABEL_STRIP_P_RE = /^<p([^>]*)>\s*<strong[^>]*>\s*(?:Step\s*)?\d+\s*[.):]\s*<\/strong>/i;
const LABEL_STRIP_LI_RE = /^\s*<strong[^>]*>\s*(?:Step\s*)?\d+\s*[.):]\s*<\/strong>/i;

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

function findSolutionBoxes(html) {
  const boxes = [];
  let m;
  BOX_CLASS_RE.lastIndex = 0;
  while ((m = BOX_CLASS_RE.exec(html)) !== null) {
    const after = m.index + m[0].length;
    const tagRe = /<div\b|<\/div\s*>/gi;
    tagRe.lastIndex = after;
    let depth = 1;
    let close = null;
    let t;
    while ((t = tagRe.exec(html)) !== null) {
      depth += t[0].startsWith('</') ? -1 : 1;
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
      inner: html.slice(after, close.index),
    });
  }
  return boxes;
}

function rebuildBox(box) {
  const isWorkedExample = /worked-example/.test(box.opener);
  const children = splitTopLevel(box.inner);
  if (children.length < 2) return null;

  const items = [];
  let counter = 0;
  let hasSteps = false;
  let questionDone = false;

  const pushStep = (num, body, kind) => {
    items.push({ type: 'step', num, body, kind: kind || '' });
    hasSteps = true;
  };

  for (const child of children) {
    const tag = ((child.match(/^<([a-zA-Z][a-zA-Z0-9]*)/) || [])[1] || '').toLowerCase();

    if (/^h[1-6]$/.test(tag)) {
      items.push({ type: 'raw', html: child });
      continue;
    }

    if (tag === 'p') {
      const mathM = child.match(MATH_ONLY_RE);
      if (mathM) {
        let merged = false;
        for (let i = items.length - 1; i >= 0; i--) {
          if (items[i].type === 'step') {
            items[i].body += mathM[1];
            merged = true;
            break;
          }
        }
        if (merged) continue;
      }
      const labelM = child.match(STEP_LABEL_RE);
      const isCheck = CHECK_LABEL_RE.test(child);
      if (isWorkedExample && !questionDone && !labelM && !isCheck) {
        // The first unlabelled paragraph of a worked example is the question;
        // every later paragraph is a step in the working.
        items.push({ type: 'question', body: child });
        questionDone = true;
        continue;
      }
      if (labelM) {
        counter = parseInt(labelM[1], 10);
        const body = child.replace(LABEL_STRIP_P_RE, (full, attrs) => `<p${attrs}>`);
        pushStep(counter, body, isCheck ? 'check' : '');
      } else {
        pushStep(++counter, child, isCheck ? 'check' : '');
      }
      continue;
    }

    if (tag === 'ol' || tag === 'ul') {
      const listInner = child.slice(child.indexOf('>') + 1, child.lastIndexOf('</'));
      for (const li of splitTopLevel(listInner)) {
        if (!/^<li[\s>]/i.test(li)) continue;
        const liInner = li.slice(li.indexOf('>') + 1, li.lastIndexOf('</'));
        pushStep(++counter, liInner.replace(LABEL_STRIP_LI_RE, ''));
      }
      continue;
    }

    items.push({ type: 'raw', html: child });
  }

  if (!hasSteps) return null;

  const rendered = items
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

  return box.opener + '<div class="solution-steps">' + rendered + '</div></div>';
}

// Rewrites every solution box in a slide's HTML into the step-by-step display.
export function expandSolutionSteps(html) {
  if (typeof html !== 'string' || html.indexOf('class="') === -1) return html;
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