// Bidirectional serializer between Visual Lesson Builder blocks
// and the sanitized HTML that gets stored in slide.content.
//
// Goals:
//   1. blocksToHtml(blocks)  — output HTML that the existing LessonPlayer
//      and presentation pages render unchanged.
//   2. htmlToBlocks(html)    — parse legacy slide HTML into typed blocks
//      where structure is unambiguous; fall back to a single `legacy-html`
//      block for anything we don't recognise so NOTHING is ever lost.
//
// We deliberately keep this conservative: when in doubt, preserve the
// original HTML in a `legacy-html` block. Tutors can keep editing legacy
// slides without losing custom styling, gradients, tables, etc.

import { createBlock } from './blockTypes';

const escapeHtml = (s = '') =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
           .replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ── inline-editable HTML sanitiser ─────────────────────────────────────────
// Strips dangerous nodes/attrs from contenteditable output before saving.
// We keep enough semantic tags + safe inline `style` properties for the rich
// text controls (font family/size, colours, alignment, spacing, sub/sup,
// underline/strike, case transforms applied at the text level, etc.) to
// round-trip through save/reload without loss.
const ALLOWED_TAGS = new Set([
  'b','strong','i','em','u','a','span','br','sub','sup','code',
  'mark','small','s','strike','font','p','div'
]);
const ALLOWED_ATTRS = {
  a:    ['href','target','rel','style'],
  span: ['style'],
  mark: ['style'],
  font: ['color','face','size'],
  p:    ['style'],
  div:  ['style'],
  b: ['style'], strong: ['style'], i: ['style'], em: ['style'],
  u: ['style'], s: ['style'], strike: ['style'], small: ['style'],
  code: ['style'], sub: ['style'], sup: ['style'],
};
// Inline CSS properties we are willing to preserve. Anything else is dropped.
const ALLOWED_CSS = new Set([
  'color','background-color','font-family','font-size','font-weight',
  'font-style','text-decoration','text-decoration-line','text-align',
  'line-height','letter-spacing','vertical-align','padding-left',
  'margin-left','text-transform',
]);
function sanitiseStyle(style) {
  if (!style) return '';
  return String(style)
    .split(';')
    .map(decl => decl.trim())
    .filter(Boolean)
    .map(decl => {
      const i = decl.indexOf(':');
      if (i === -1) return null;
      const prop = decl.slice(0, i).trim().toLowerCase();
      const val  = decl.slice(i + 1).trim();
      if (!ALLOWED_CSS.has(prop)) return null;
      // Block url()/expression()/javascript: in values.
      if (/url\s*\(|expression\s*\(|javascript:/i.test(val)) return null;
      return `${prop}: ${val}`;
    })
    .filter(Boolean)
    .join('; ');
}
function sanitiseInline(html) {
  if (typeof document === 'undefined') return String(html || '');
  const wrap = document.createElement('div');
  wrap.innerHTML = String(html || '');
  const walk = (node) => {
    Array.from(node.childNodes).forEach(child => {
      if (child.nodeType === 1) {
        const tag = child.tagName.toLowerCase();
        if (!ALLOWED_TAGS.has(tag)) {
          // unwrap unknown element, keep text children
          while (child.firstChild) node.insertBefore(child.firstChild, child);
          node.removeChild(child);
          return;
        }
        const allowed = ALLOWED_ATTRS[tag] || [];
        Array.from(child.attributes).forEach(a => {
          const name = a.name.toLowerCase();
          if (!allowed.includes(name)) { child.removeAttribute(a.name); return; }
          if (name === 'style') {
            const clean = sanitiseStyle(a.value);
            if (clean) child.setAttribute('style', clean);
            else child.removeAttribute('style');
          }
        });
        if (tag === 'a') {
          const href = child.getAttribute('href') || '';
          if (/^\s*javascript:/i.test(href)) child.setAttribute('href', '#');
          child.setAttribute('target', '_blank');
          child.setAttribute('rel', 'noopener noreferrer');
        }
        walk(child);
      } else if (child.nodeType === 8) {
        node.removeChild(child); // comments
      }
    });
  };
  walk(wrap);
  return wrap.innerHTML;
}

// ── blocksToHtml ───────────────────────────────────────────────────────────
export function blocksToHtml(blocks = []) {
  return blocks.map(blockToHtml).filter(Boolean).join('\n');
}

function blockToHtml(b) {
  const d = b.data || {};
  switch (b.type) {
    case 'paragraph':
      return `<p style="line-height:1.7; font-size:16px; color:#1F2937; margin:0 0 12px;">${sanitiseInline(d.html || '')}</p>`;
    case 'heading-1':
      return `<h1 style="font-size:36px; font-weight:700; color:#1A3C5A; margin:0 0 16px; line-height:1.2;">${escapeHtml(d.text || '')}</h1>`;
    case 'heading-2':
      return `<h2 style="font-size:28px; font-weight:700; color:#1A3C5A; margin:24px 0 12px; line-height:1.25;">${escapeHtml(d.text || '')}</h2>`;
    case 'heading-3':
      return `<h3 style="font-size:22px; font-weight:600; color:#38B2AC; margin:20px 0 10px; line-height:1.3;">${escapeHtml(d.text || '')}</h3>`;
    case 'bullet-list': {
      const items = (d.items || []).filter(i => i && i.trim()).map(i =>
        `<li style="margin-bottom:8px; font-size:16px; color:#1F2937;">${sanitiseInline(i)}</li>`).join('');
      return `<ul style="margin:0 0 16px; padding-left:24px; line-height:1.7;">${items}</ul>`;
    }
    case 'numbered-list': {
      const items = (d.items || []).filter(i => i && i.trim()).map(i =>
        `<li style="margin-bottom:8px; font-size:16px; color:#1F2937;">${sanitiseInline(i)}</li>`).join('');
      return `<ol style="margin:0 0 16px; padding-left:24px; line-height:1.7;">${items}</ol>`;
    }
    case 'quote':
      return `<blockquote style="border-left:4px solid #4F46E5; padding:12px 20px; margin:16px 0; background:#F3F4F6; border-radius:4px; color:#4B5563; font-style:italic;">${sanitiseInline(d.html || '')}${d.cite ? `<footer style="margin-top:8px; font-size:14px; color:#6B7280; font-style:normal;">— ${escapeHtml(d.cite)}</footer>` : ''}</blockquote>`;
    case 'callout': {
      const styles = {
        info:    { bg:'#EFF6FF', border:'#3B82F6', label:'💡 Note',    color:'#1E3A8A' },
        warning: { bg:'#FFFBEB', border:'#F59E0B', label:'⚠ Warning', color:'#92400E' },
        success: { bg:'#F0FDF4', border:'#10B981', label:'✓ Tip',     color:'#065F46' },
        danger:  { bg:'#FEF2F2', border:'#EF4444', label:'⚠ Important',color:'#991B1B' },
      };
      const s = styles[d.variant] || styles.info;
      return `<div style="background:${s.bg}; border-left:4px solid ${s.border}; padding:16px 20px; border-radius:8px; margin:16px 0;"><p style="margin:0 0 6px; font-weight:600; color:${s.color}; font-size:14px;">${s.label}</p><div style="color:#1F2937; font-size:16px; line-height:1.6;">${sanitiseInline(d.html || '')}</div></div>`;
    }
    case 'definition':
      return `<div style="background:#F0F4F8; border-radius:12px; padding:20px; margin:16px 0;"><p style="margin:0 0 8px; font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#38B2AC; font-weight:700;">Definition</p><p style="margin:0 0 8px; font-size:20px; font-weight:700; color:#1A3C5A;">${escapeHtml(d.term || '')}</p><p style="margin:0; font-size:16px; line-height:1.6; color:#334E68;">${sanitiseInline(d.definition || '')}</p></div>`;
    case 'image': {
      if (!d.url) return '';
      const alignMap = { left:'flex-start', center:'center', right:'flex-end', full:'stretch' };
      const align = d.align || 'center';
      const unit = d.widthUnit === 'px' ? 'px' : 'percent';
      const widthRaw = Number(d.width) || (unit === 'px' ? 800 : 100);
      const widthVal = unit === 'percent'
        ? Math.max(20, Math.min(100, widthRaw))
        : Math.max(80, Math.min(2000, widthRaw));
      const figureWidth = align === 'full'
        ? '100%'
        : (unit === 'percent' ? `${widthVal}%` : `${widthVal}px`);
      const fit = d.fit === 'cover' ? 'cover' : 'contain';
      const captionLine = (d.caption || d.credit)
        ? `<figcaption style="margin-top:8px; text-align:center; font-size:13px; color:#6B7280; font-style:italic;">${escapeHtml(d.caption || '')}${d.credit ? ` <span style="font-style:normal; color:#9CA3AF;">— ${escapeHtml(d.credit)}</span>` : ''}</figcaption>`
        : '';
      return `<div style="display:flex; justify-content:${alignMap[align] || 'center'}; margin:16px 0;"><figure style="margin:0; width:${figureWidth}; max-width:100%;"><img src="${escapeHtml(d.url)}" alt="${escapeHtml(d.alt || '')}" style="width:100%; height:auto; object-fit:${fit}; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.08); display:block;" />${captionLine}</figure></div>`;
    }
    case 'image-text': {
      const imgCol = d.url
        ? `<img src="${escapeHtml(d.url)}" alt="${escapeHtml(d.alt || '')}" style="width:100%; height:auto; border-radius:8px; display:block;" />`
        : '<div style="background:#F3F4F6; border-radius:8px; aspect-ratio:4/3;"></div>';
      const textCol = `<div style="font-size:16px; line-height:1.7; color:#1F2937;">${sanitiseInline(d.html || '')}</div>`;
      const [a, b] = d.side === 'right' ? [textCol, imgCol] : [imgCol, textCol];
      return `<div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; align-items:center; margin:16px 0;"><div>${a}</div><div>${b}</div></div>`;
    }
    case 'video': {
      const url = d.url || '';
      if (!url) return '';
      // Whitelist providers for embed — anything else falls back to a native
      // <video> tag (which only plays direct media files) so a malicious URL
      // can never get its own iframe in the saved slide HTML.
      const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([\w-]{6,})/);
      const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
      const isDirect = /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url) || /\/storage\//i.test(url);
      const ratios = { '16:9': 16/9, '4:3': 4/3, '1:1': 1, '9:16': 9/16 };
      const ratioV = ratios[d.ratio] || ratios['16:9'];
      const paddingBottom = `${(1 / ratioV) * 100}%`;
      // Width / alignment mirror image semantics.
      const alignMap = { left:'flex-start', center:'center', right:'flex-end', full:'stretch' };
      const align = d.align || 'center';
      const unit = d.widthUnit === 'px' ? 'px' : 'percent';
      const widthRaw = Number(d.width) || (unit === 'px' ? 800 : 100);
      const widthVal = unit === 'percent'
        ? Math.max(20, Math.min(100, widthRaw))
        : Math.max(200, Math.min(1920, widthRaw));
      const figureWidth = align === 'full'
        ? '100%'
        : (unit === 'percent' ? `${widthVal}%` : `${widthVal}px`);
      let inner;
      if (yt) {
        inner = `<iframe src="https://www.youtube-nocookie.com/embed/${escapeHtml(yt[1])}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`;
      } else if (vimeo) {
        inner = `<iframe src="https://player.vimeo.com/video/${escapeHtml(vimeo[1])}" style="position:absolute; top:0; left:0; width:100%; height:100%; border:0;" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"></iframe>`;
      } else if (isDirect) {
        inner = `<video src="${escapeHtml(url)}"${d.poster ? ` poster="${escapeHtml(d.poster)}"` : ''} controls preload="metadata" style="position:absolute; top:0; left:0; width:100%; height:100%; background:#000;"></video>`;
      } else {
        // Unsupported provider — render a safe link rather than embed.
        return `<p style="margin:16px 0;"><a href="${escapeHtml(url)}" target="_blank" rel="noopener noreferrer" style="color:#4F46E5; text-decoration:underline;">▶ Watch video</a></p>`;
      }
      const captionLine = d.caption
        ? `<figcaption style="margin-top:8px; text-align:center; font-size:13px; color:#6B7280; font-style:italic;">${escapeHtml(d.caption)}</figcaption>`
        : '';
      return `<div style="display:flex; justify-content:${alignMap[align] || 'center'}; margin:16px 0;"><figure style="margin:0; width:${figureWidth}; max-width:100%;"><div style="position:relative; padding-bottom:${paddingBottom}; height:0; border-radius:8px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.1); background:#000;">${inner}</div>${captionLine}</figure></div>`;
    }
    case 'file':
      if (!d.url) return '';
      return `<a href="${escapeHtml(d.url)}" target="_blank" rel="noopener noreferrer" style="display:inline-flex; align-items:center; gap:10px; padding:12px 20px; background:#EEF2FF; color:#4338CA; border-radius:8px; text-decoration:none; font-weight:600; margin:12px 0; border:1px solid #C7D2FE;">📎 ${escapeHtml(d.name || 'Download file')}</a>`;
    case 'table': {
      const rows = d.rows || [];
      if (!rows.length) return '';
      const hasHeader = d.header !== false;
      const striped   = !!d.striped;
      const bordered  = d.bordered !== false;
      const compact   = !!d.compact;
      const padCss    = compact ? '6px 10px' : '10px 14px';
      const borderCss = bordered ? '1px solid #E5E7EB' : '1px solid transparent';

      // Each entry may be a string (legacy) or a cell object {html, align, bg,
      // border, bold, rowspan, colspan, hidden}. We collapse both to a common
      // shape for rendering.
      const norm = (cell) => {
        if (cell && typeof cell === 'object') return cell;
        return { html: cell == null ? '' : String(cell) };
      };

      const renderCell = (cell, opts) => {
        const c = norm(cell);
        if (c.hidden) return '';
        const tag = opts.isHeader ? 'th' : 'td';
        const scope = opts.isHeader ? ' scope="col"' : '';
        const bg = c.bg ? `background:${escapeHtml(c.bg)};` : (opts.isHeader ? 'background:#F3F4F6;' : '');
        const align = `text-align:${c.align === 'center' ? 'center' : c.align === 'right' ? 'right' : 'left'};`;
        const weight = c.bold || opts.isHeader ? 'font-weight:600;' : '';
        const cellBorder = (bordered || c.border) ? `border:${borderCss};` : 'border:1px solid transparent;';
        const rowspan = c.rowspan > 1 ? ` rowspan="${c.rowspan}"` : '';
        const colspan = c.colspan > 1 ? ` colspan="${c.colspan}"` : '';
        return `<${tag}${scope}${rowspan}${colspan} style="padding:${padCss}; ${cellBorder} ${align} ${bg} ${weight} color:#1F2937; vertical-align:top;">${sanitiseInline(c.html || '')}</${tag}>`;
      };

      const headHtml = hasHeader && rows[0]
        ? `<thead><tr>${rows[0].map(c => renderCell(c, { isHeader: true })).join('')}</tr></thead>`
        : '';
      const body = (hasHeader ? rows.slice(1) : rows).map((r, i) => {
        const stripeBg = striped && (i % 2 === 1) ? ' style="background:#F9FAFB;"' : '';
        return `<tr${stripeBg}>${r.map(c => renderCell(c, { isHeader: false })).join('')}</tr>`;
      }).join('');
      const captionHtml = d.caption
        ? `<caption style="caption-side:top; text-align:left; font-size:13px; color:#6B7280; padding:4px 2px 8px; font-style:italic;">${escapeHtml(d.caption)}</caption>`
        : '';

      // Outer wrapper enables horizontal scrolling on small screens so wide
      // tables don't break the layout on mobile.
      return `<div style="overflow-x:auto; margin:16px 0; -webkit-overflow-scrolling:touch;"><table style="width:100%; border-collapse:collapse; font-size:15px; min-width:480px;">${captionHtml}${headHtml}<tbody>${body}</tbody></table></div>`;
    }
    case 'divider':
      return `<hr style="border:0; border-top:1px solid #E5E7EB; margin:24px 0;" />`;
    case 'spacer':
      return `<div style="height:${Math.max(8, Math.min(200, Number(d.size) || 32))}px;"></div>`;
    case 'two-columns':
      return `<div style="display:grid; grid-template-columns:1fr 1fr; gap:24px; margin:16px 0;"><div style="font-size:16px; line-height:1.7; color:#1F2937;">${sanitiseInline(d.left || '')}</div><div style="font-size:16px; line-height:1.7; color:#1F2937;">${sanitiseInline(d.right || '')}</div></div>`;
    case 'code':
      return `<pre style="background:#1E1E1E; color:#D4D4D4; padding:20px; border-radius:8px; overflow-x:auto; margin:16px 0; font-family:Menlo,Monaco,Consolas,monospace; font-size:14px; line-height:1.6;"><code class="language-${escapeHtml(d.language || 'plaintext')}">${escapeHtml(d.code || '')}</code></pre>`;
    case 'math':
      // Stored as MathJax-friendly delimiters; MathJaxContext is already present in Layout.
      return `<div style="text-align:center; margin:16px 0; font-size:18px;">$$${escapeHtml(d.latex || '')}$$</div>`;
    case 'scientific-equation': {
      // Plain Unicode equation (chem reactions, units, states). Rendered
      // verbatim so subscripts/superscripts/state symbols/arrows that the
      // tutor typed are preserved exactly in the player and presentation.
      if (!d.equation) return '';
      const captionHtml = d.caption
        ? `<p style="margin:6px 0 0; text-align:center; font-size:13px; color:#6B7280; font-style:italic;">${escapeHtml(d.caption)}</p>`
        : '';
      return `<div style="background:#F0FDF4; border:1px solid #A7F3D0; border-left:4px solid #10B981; border-radius:8px; padding:14px 18px; margin:16px 0;"><p style="margin:0; text-align:center; font-family:Menlo,Monaco,Consolas,monospace; font-size:18px; color:#064E3B; line-height:1.6;">${escapeHtml(d.equation)}</p>${captionHtml}</div>`;
    }
    case 'learning-objective':
      return `<div style="background:#ECFDF5; border:1px solid #A7F3D0; border-radius:12px; padding:16px 20px; margin:16px 0;"><p style="margin:0 0 6px; font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#047857; font-weight:700;">🎯 Learning Objective</p><div style="font-size:16px; color:#064E3B; line-height:1.6;">${sanitiseInline(d.html || '')}</div></div>`;
    case 'key-takeaway':
      return `<div style="background:#FFFBEB; border:1px solid #FDE68A; border-radius:12px; padding:16px 20px; margin:16px 0;"><p style="margin:0 0 6px; font-size:13px; text-transform:uppercase; letter-spacing:1px; color:#B45309; font-weight:700;">⭐ Key Takeaway</p><div style="font-size:16px; color:#78350F; line-height:1.6;">${sanitiseInline(d.html || '')}</div></div>`;
    case 'knowledge-check':
      return `<details style="background:#F5F3FF; border:1px solid #DDD6FE; border-radius:12px; padding:16px 20px; margin:16px 0;"><summary style="cursor:pointer; font-weight:600; color:#5B21B6; font-size:16px;">❓ ${escapeHtml(d.question || 'Knowledge check')}</summary>${d.hint ? `<p style="margin:10px 0 0; font-size:14px; color:#6D28D9;"><em>Hint:</em> ${escapeHtml(d.hint)}</p>` : ''}<div style="margin-top:10px; padding-top:10px; border-top:1px solid #DDD6FE; color:#1F2937; font-size:15px; line-height:1.6;">${sanitiseInline(d.answer || '')}</div></details>`;
    case 'legacy-html':
      // Render unchanged — this is the "anything we couldn't parse" escape hatch.
      return String(d.html || '');
    default:
      return '';
  }
}

// ── htmlToBlocks ───────────────────────────────────────────────────────────
// Conservative: only recognises clean top-level elements. Anything else
// (nested grids, table-based layouts, mixed inline styles…) is preserved as
// a single legacy-html block so existing slides keep rendering unchanged.
export function htmlToBlocks(html) {
  if (typeof document === 'undefined') {
    return html ? [createBlock('legacy-html', { html })] : [];
  }
  const trimmed = String(html || '').trim();
  if (!trimmed) return [];

  const wrap = document.createElement('div');
  wrap.innerHTML = trimmed;
  const children = Array.from(wrap.children);

  // No real top-level structure → wrap raw text as a paragraph.
  if (!children.length) {
    return [createBlock('paragraph', { html: trimmed })];
  }

  const blocks = [];
  let unparsedRunStart = -1;

  const flushUnparsedRun = (endExclusive) => {
    if (unparsedRunStart === -1) return;
    const slice = children.slice(unparsedRunStart, endExclusive)
      .map(n => n.outerHTML).join('');
    blocks.push(createBlock('legacy-html', { html: slice }));
    unparsedRunStart = -1;
  };

  children.forEach((el, idx) => {
    const tag = el.tagName.toLowerCase();
    const parsed = parseSimpleElement(el, tag);
    if (parsed) {
      flushUnparsedRun(idx);
      blocks.push(parsed);
    } else {
      if (unparsedRunStart === -1) unparsedRunStart = idx;
    }
  });
  flushUnparsedRun(children.length);

  return blocks;
}

function parseSimpleElement(el, tag) {
  // We only convert "pure" elements with no descendant tables/grids/divs that
  // would lose styling if reserialised. Anything fancy goes to legacy-html.
  const hasComplexChildren = el.querySelector('table, img, iframe, div, section, article');

  if (tag === 'h1' && !hasComplexChildren) return createBlock('heading-1', { text: el.textContent.trim() });
  if (tag === 'h2' && !hasComplexChildren) return createBlock('heading-2', { text: el.textContent.trim() });
  if (tag === 'h3' && !hasComplexChildren) return createBlock('heading-3', { text: el.textContent.trim() });

  if (tag === 'p' && !el.querySelector('img, iframe, table')) {
    return createBlock('paragraph', { html: el.innerHTML });
  }

  if (tag === 'ul' && !hasComplexChildren) {
    const items = Array.from(el.children)
      .filter(li => li.tagName.toLowerCase() === 'li')
      .map(li => li.innerHTML);
    return createBlock('bullet-list', { items: items.length ? items : [''] });
  }
  if (tag === 'ol' && !hasComplexChildren) {
    const items = Array.from(el.children)
      .filter(li => li.tagName.toLowerCase() === 'li')
      .map(li => li.innerHTML);
    return createBlock('numbered-list', { items: items.length ? items : [''] });
  }

  if (tag === 'blockquote' && !hasComplexChildren) {
    return createBlock('quote', { html: el.innerHTML });
  }

  if (tag === 'hr') return createBlock('divider');

  // Single image wrapped in nothing complex.
  if (tag === 'img') {
    return createBlock('image', {
      url: el.getAttribute('src') || '',
      alt: el.getAttribute('alt') || '',
    });
  }

  return null; // → legacy-html
}