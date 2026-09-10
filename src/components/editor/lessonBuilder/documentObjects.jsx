// Geometry lives in ordinary HTML/CSS so the player needs no editor runtime.
export const OBJECT_SELECTOR = '[data-lesson-block="shape"], [data-lesson-object], [data-lesson-box], figure, img, svg, hr';
export const DOCUMENT_TYPES = new Set(['legacy-html','paragraph','heading-1','heading-2','heading-3','bullet-list','numbered-list','quote','callout','definition','image','shape','divider','spacer']);

export function objectFromTarget(target, editor) {
  if (!target?.closest || !editor) return null;
  if (target.closest('mjx-container,.MathJax')) return null;
  const found = target.closest(OBJECT_SELECTOR);
  if (!found || !editor.contains(found)) return null;
  const owner = found.closest('[data-lesson-block="shape"], [data-lesson-object], [data-lesson-box], figure');
  return owner && editor.contains(owner) ? owner : found;
}

export function documentRoot(editor) {
  return editor.querySelector(':scope > [data-lesson-document]') || editor;
}

export function documentObjects(editor) {
  return Array.from(new Set(Array.from(editor.querySelectorAll(OBJECT_SELECTOR)).map(node => objectFromTarget(node, editor)).filter(Boolean)));
}

export function wrapDocument(html) {
  const root = document.createElement('div');
  root.innerHTML = html;
  if (root.childNodes.length === 1 && root.firstElementChild?.hasAttribute('data-lesson-document')) return html;
  let height = 0;
  // Unwrap only our own containers when a ribbon insertion appends new content.
  Array.from(root.children).forEach(node => {
    if (!node.hasAttribute('data-lesson-document')) return;
    height = Math.max(height, parseFloat(node.style.minHeight) || 0);
    node.replaceWith(...node.childNodes);
  });
  return '<div data-lesson-document="1" style="position:relative;display:flow-root;min-height:' + height + 'px">' + root.innerHTML + '</div>';
}

export function fitDocument(editor) {
  const root = documentRoot(editor);
  let bottom = 0;
  Array.from(root.children).forEach(node => {
    if (node.style.position === 'absolute') bottom = Math.max(bottom, (parseFloat(node.style.top) || 0) + node.offsetHeight + 16);
  });
  root.style.minHeight = bottom ? bottom + 'px' : '0px';
}

export function objectMode(node) {
  if (node.style.position === 'absolute') return 'free';
  if (node.style.cssFloat === 'left') return 'left';
  if (node.style.cssFloat === 'right') return 'right';
  return 'inline';
}

export function setObjectMode(node, editor, mode) {
  const root = documentRoot(editor);
  const box = node.getBoundingClientRect();
  const host = root.getBoundingClientRect();
  const scale = host.width / (root.offsetWidth || host.width) || 1;
  const oldMode = objectMode(node);
  node.style.boxSizing = 'border-box';
  node.style.width = Math.min(100, box.width / host.width * 100) + '%';
  node.style.maxWidth = '100%';
  if (mode === 'free') {
    const x = Math.max(0, (box.left - host.left) / host.width * 100);
    const y = Math.max(0, (box.top - host.top) / scale);
    root.appendChild(node);
    Object.assign(node.style, {position:'absolute', left:x+'%', top:y+'px', cssFloat:'none', display:'block', margin:'0', zIndex:node.style.zIndex || '1'});
  } else {
    // When releasing a floating object, anchor it beside the nearest text.
    if (oldMode === 'free') {
      const candidates = Array.from(root.querySelectorAll('p,h1,h2,h3,ul,ol')).filter(p => !node.contains(p) && !p.closest('[data-lesson-box],[data-lesson-object]'));
      const anchor = candidates.sort((a,b)=>Math.abs(a.getBoundingClientRect().top-box.top)-Math.abs(b.getBoundingClientRect().top-box.top))[0];
      if (anchor) anchor.before(node);
    }
    Object.assign(node.style, {position:'relative',left:'',top:'',cssFloat:mode==='inline'?'none':mode,display:mode==='inline'?'inline-block':'block',margin:mode==='left'?'8px 20px 12px 0':mode==='right'?'8px 0 12px 20px':'8px 12px 8px 0',verticalAlign:'middle',zIndex:''});
  }
  node.setAttribute('data-lesson-object', node.getAttribute('data-lesson-object') || 'object');
  const parentWidth = node.parentElement.getBoundingClientRect().width;
  if (parentWidth) node.style.width = Math.min(100, box.width / parentWidth * 100) + '%';
  fitDocument(editor);
}
