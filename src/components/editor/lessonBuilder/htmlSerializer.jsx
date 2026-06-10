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

// Safe media URL sanitiser. Allows https:, http:, data:image/* (for tiny
// inline previews), uploaded /storage/ paths, and protocol-relative // URLs.
// Rejects javascript:, vbscript:, data:text/html, file:, etc. Returns the
// trimmed URL on success, or empty string if the URL is unsafe / malformed.
function sanitiseMediaUrl(url) {
  if (!url) return '';
  const trimmed = String(url).trim();
  if (!trimmed) return '';
  // Block dangerous schemes regardless of casing / whitespace.
  if (/^\s*(javascript|vbscript|file|about|chrome|data:text\/html):/i.test(trimmed)) return '';
  // Allow http(s), protocol-relative, data:image/*, and same-origin absolute paths.
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  if (/^\/\//.test(trimmed)) return trimmed;
  if (/^data:image\//i.test(trimmed)) return trimmed;
  if (/^\/[^/]/.test(trimmed)) return trimmed; // absolute same-origin path
  // Bare upload paths (rare) — accept storage-style URIs the platform emits.
  if (/^\/storage\//i.test(trimmed)) return trimmed;
  return '';
}

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
    case 'paragraph': {
      // execCommand("justifyCenter"/"justifyLeft"/...) emits a wrapper
      // <p>/<div> with `text-align:…` inside our html. After our sanitiser
      // runs we end up with a block-level child carrying the alignment but
      // its parent <p> wrapper still defaults to left, so the alignment
      // doesn't reach the surrounding box (and looks wrong when the parent
      // is centered/right while children only fill their own width). Lift
      // any root-level text-align onto the outer <p> wrapper so the visual
      // alignment matches what the toolbar applied.
      const inner = sanitiseInline(d.html || '');
      let extraStyle = '';
      try {
        if (typeof document !== 'undefined' && inner) {
          const tmp = document.createElement('div');
          tmp.innerHTML = inner;
          // Walk top-level block-ish children, take the first non-empty
          // text-align we see — that matches what an editor user would
          // have selected for the paragraph as a whole.
          for (const node of Array.from(tmp.children)) {
            const ta = node.style?.textAlign;
            if (ta && ['left','center','right','justify'].includes(ta)) {
              extraStyle = ` text-align:${ta};`;
              break;
            }
          }
        }
      } catch { /* fall through with no extra style */ }
      // Text-wrap defenses: identical to the editor's InlineEditable so
      // long tokens (URLs, code, "AUTOBIOGRAPHY…") wrap inside the
      // preview instead of forcing horizontal overflow.
      return `<p style="line-height:1.7; font-size:16px; color:#1F2937; margin:0 0 12px; min-width:0; max-width:100%; white-space:normal; overflow-wrap:anywhere; word-break:break-word;${extraStyle}">${inner}</p>`;
    }
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
      // Accept the current ImageBlock keys (url/align/widthUnit/width/fit/...)
      // AND legacy keys from older blocks or imported HTML
      // (src / imageUrl / image_url / file_url / width_unit). The editor is
      // the source of truth, but we adapt so nothing previously authored is
      // dropped on re-serialisation.
      const rawUrl = d.url || d.src || d.imageUrl || d.image_url || d.file_url || '';
      const safeUrl = sanitiseMediaUrl(rawUrl);
      if (!safeUrl) return '';
      const alignMap = { left:'flex-start', center:'center', right:'flex-end', full:'stretch' };
      const align = ['left','center','right','full'].includes(d.align) ? d.align : 'center';
      const unit = (d.widthUnit || d.width_unit) === 'px' ? 'px' : 'percent';
      const widthRaw = Number(d.width) || (unit === 'px' ? 800 : 100);
      const widthVal = unit === 'percent'
        ? Math.max(20, Math.min(100, widthRaw))
        : Math.max(80, Math.min(2000, widthRaw));
      const figureWidth = align === 'full'
        ? '100%'
        : (unit === 'percent' ? `${widthVal}%` : `${widthVal}px`);
      const fit = d.fit === 'cover' ? 'cover' : 'contain';
      // Preserve aspect when set + px unit + locked (used by editor for height).
      const aspect = Number(d.aspect) || null;
      const heightAttr = aspect && unit === 'px' && d.lockAspect !== false
        ? ` height="${Math.round(widthVal / aspect)}"`
        : '';
      const captionLine = (d.caption || d.credit)
        ? `<figcaption style="margin-top:8px; text-align:center; font-size:13px; color:#6B7280; font-style:italic;">${escapeHtml(d.caption || '')}${d.credit ? ` <span style="font-style:normal; color:#9CA3AF;">— ${escapeHtml(d.credit)}</span>` : ''}</figcaption>`
        : '';
      return `<div style="display:flex; justify-content:${alignMap[align] || 'center'}; margin:16px 0;"><figure style="margin:0; width:${figureWidth}; max-width:100%;"><img src="${escapeHtml(safeUrl)}" alt="${escapeHtml(d.alt || '')}"${heightAttr} loading="lazy" decoding="async" style="width:100%; height:auto; object-fit:${fit}; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.08); display:block;" />${captionLine}</figure></div>`;
    }
    case 'image-text': {
      // Image+text layout MUST mirror the editor's two-column grid:
      // - desktop: image and text side-by-side, image first when side=left
      //   (or omitted) and text-first when side=right
      // - mobile: stack vertically with the SAME visual order
      // - the image keeps its full fidelity: url, alt, caption, credit,
      //   width / widthUnit / fit / lockAspect / aspect — same shape as the
      //   standalone image block (which the editor's ImageTextBlock now
      //   shares via its inner image data — but legacy authored data may
      //   only have url/alt/html/side, so all extras are optional).
      //
      // The previous serializer used `display:grid; grid-template-columns:1fr 1fr`
      // with NO responsive stack and NO min-width:0 on cells. On mobile
      // viewports the image column shrank to whatever %fluid width was
      // available minus text overflow, which visually "dropped" the image
      // because <img style="width:100%"> in a column with intrinsic-min-
      // content overflow collapsed to a few pixels. We switch to the same
      // flexbox + @media + [data-mobile-preview] rules that two-columns
      // uses so the editor preview and live render agree.
      const rawUrl = d.url || d.src || d.imageUrl || d.image_url || d.file_url || '';
      const safeUrl = sanitiseMediaUrl(rawUrl);

      // Optional image fidelity fields (mirrors standalone image block).
      const unit = (d.widthUnit || d.width_unit) === 'px' ? 'px' : 'percent';
      const widthRaw = Number(d.width) || (unit === 'px' ? 600 : 100);
      const widthVal = unit === 'percent'
        ? Math.max(20, Math.min(100, widthRaw))
        : Math.max(80, Math.min(2000, widthRaw));
      // The image fills its column by default — only honour a width override
      // when the author explicitly set one (i.e. d.width is a real number).
      const explicitWidth = Number.isFinite(Number(d.width));
      const imgInlineWidth = explicitWidth
        ? (unit === 'percent' ? `${widthVal}%` : `${widthVal}px`)
        : '100%';
      const fit = d.fit === 'cover' ? 'cover' : 'contain';
      const aspect = Number(d.aspect) || null;
      const heightAttr = aspect && unit === 'px' && d.lockAspect !== false && explicitWidth
        ? ` height="${Math.round(widthVal / aspect)}"`
        : '';

      const captionLine = (d.caption || d.credit)
        ? `<figcaption style="margin-top:8px; text-align:center; font-size:13px; color:#6B7280; font-style:italic;">${escapeHtml(d.caption || '')}${d.credit ? ` <span style="font-style:normal; color:#9CA3AF;">— ${escapeHtml(d.credit)}</span>` : ''}</figcaption>`
        : '';

      const imgCol = safeUrl
        ? `<figure style="margin:0; max-width:100%;"><img src="${escapeHtml(safeUrl)}" alt="${escapeHtml(d.alt || '')}"${heightAttr} loading="lazy" decoding="async" style="width:${imgInlineWidth}; max-width:100%; height:auto; object-fit:${fit}; border-radius:8px; box-shadow:0 4px 12px rgba(0,0,0,0.08); display:block;" />${captionLine}</figure>`
        : '<div style="background:#F3F4F6; border-radius:8px; aspect-ratio:4/3; width:100%;"></div>';

      const textCol = `<div style="font-size:16px; line-height:1.7; color:#1F2937; min-width:0; max-width:100%; overflow-wrap:anywhere; word-break:break-word;">${sanitiseInline(d.html || '')}</div>`;

      const [first, second] = d.side === 'right' ? [textCol, imgCol] : [imgCol, textCol];

      // Shared responsive rules. Same class as two-columns so multiple
      // image-text blocks reuse the same stylesheet rule.
      const gap = 24;
      const stackCss = `<style>
        .lb-imgtext{display:flex;flex-direction:row;flex-wrap:nowrap;gap:${gap}px;margin:16px 0;align-items:center;}
        .lb-imgtext > .lb-imgtext-col{flex:1 1 0;min-width:0;max-width:100%;}
        .lb-imgtext, .lb-imgtext *{overflow-wrap:anywhere;word-break:break-word;}
        .lb-imgtext img, .lb-imgtext video, .lb-imgtext iframe, .lb-imgtext table, .lb-imgtext pre{max-width:100%;}
        @media (max-width: 767px){
          .lb-imgtext{flex-direction:column;flex-wrap:nowrap;align-items:stretch;}
          .lb-imgtext > .lb-imgtext-col{flex:0 0 100%;width:100%;max-width:100%;}
        }
        [data-mobile-preview="true"] .lb-imgtext{flex-direction:column;flex-wrap:nowrap;align-items:stretch;}
        [data-mobile-preview="true"] .lb-imgtext > .lb-imgtext-col{flex:0 0 100%;width:100%;max-width:100%;}
      </style>`;

      return `${stackCss}<div class="lb-imgtext"><div class="lb-imgtext-col">${first}</div><div class="lb-imgtext-col">${second}</div></div>`;
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
      // Accept BOTH the editor's current root keys (header / stripe) AND the
      // historic shape (hasHeader / striped / bordered / compact). The editor
      // is the source of truth — the serializer adapts.
      const hasHeader = d.header !== false && d.hasHeader !== false;
      const striped   = !!(d.stripe ?? d.striped);
      const bordered  = d.bordered !== false; // default on
      const compact   = !!d.compact;
      const padCss    = compact ? '6px 10px' : '10px 14px';
      const borderCss = bordered ? '1px solid #E5E7EB' : '1px solid transparent';

      // Each entry may be a string (very old legacy) or a cell object. The
      // editor writes {content, align, color, bg, border, rowSpan, colSpan,
      // hidden}; we also accept the historic {html, bold, rowspan, colspan}
      // form so nothing previously authored is lost.
      const normCell = (cell) => {
        if (cell == null) return { content: '' };
        if (typeof cell !== 'object') return { content: String(cell) };
        return {
          content: cell.content != null ? cell.content : (cell.html != null ? cell.html : ''),
          align:   cell.align,
          color:   cell.color,
          bg:      cell.bg,
          border:  cell.border,
          bold:    !!cell.bold,
          rowSpan: Number(cell.rowSpan ?? cell.rowspan ?? 1) || 1,
          colSpan: Number(cell.colSpan ?? cell.colspan ?? 1) || 1,
          hidden:  !!cell.hidden,
        };
      };

      const renderCell = (cell, opts) => {
        const c = normCell(cell);
        if (c.hidden) return '';
        const tag = opts.isHeader ? 'th' : 'td';
        const scope = opts.isHeader ? ' scope="col"' : '';
        const bg = c.bg ? `background:${escapeHtml(c.bg)};` : (opts.isHeader ? 'background:#F3F4F6;' : '');
        const colour = c.color ? `color:${escapeHtml(c.color)};` : 'color:#1F2937;';
        const align = `text-align:${c.align === 'center' ? 'center' : c.align === 'right' ? 'right' : 'left'};`;
        const weight = c.bold || opts.isHeader ? 'font-weight:600;' : '';
        const cellBorder = c.border === 'none'
          ? 'border:1px solid transparent;'
          : c.border === 'thick'
            ? 'border:2px solid #9CA3AF;'
            : `border:${borderCss};`;
        const rowspan = c.rowSpan > 1 ? ` rowspan="${c.rowSpan}"` : '';
        const colspan = c.colSpan > 1 ? ` colspan="${c.colSpan}"` : '';
        return `<${tag}${scope}${rowspan}${colspan} style="padding:${padCss}; ${cellBorder} ${align} ${bg} ${weight} ${colour} vertical-align:top;">${sanitiseInline(c.content || '')}</${tag}>`;
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
    case 'two-columns': {
      // Block name is historical — this block now supports 1, 2 or 3
      // columns selected by `columnCount`. Legacy data (no columnCount)
      // defaults to 2 columns; legacy `{ left, right }` HTML strings are
      // still accepted so previously authored slides round-trip unchanged.
      const leftSide   = Array.isArray(d.leftBlocks)   ? d.leftBlocks
                        : Array.isArray(d.left)        ? d.left
                        : (typeof d.left === 'string'  ? d.left  : []);
      const middleSide = Array.isArray(d.middleBlocks) ? d.middleBlocks : [];
      const rightSide  = Array.isArray(d.rightBlocks)  ? d.rightBlocks
                        : Array.isArray(d.right)       ? d.right
                        : (typeof d.right === 'string' ? d.right : []);

      const columnCount = [1, 2, 3].includes(d.columnCount) ? d.columnCount : 2;

      const renderSide = (side) => {
        if (Array.isArray(side)) return blocksToHtml(side);
        if (typeof side === 'string' && side.trim())
          return `<div style="font-size:16px; line-height:1.7; color:#1F2937;">${sanitiseInline(side)}</div>`;
        return '';
      };

      // Ratio (2-col only): accept number (0..1), number (0..100) or "50:50".
      const parseRatio = () => {
        const r = d.ratio;
        if (typeof r === 'number' && Number.isFinite(r)) {
          const pct = r <= 1 ? r * 100 : r;
          const a = Math.max(10, Math.min(90, Math.round(pct)));
          return [a, 100 - a];
        }
        const m = String(r || '50:50').match(/^(\d{1,3}):(\d{1,3})$/);
        if (!m) return [50, 50];
        const a = Math.max(10, Math.min(90, Number(m[1])));
        return [a, 100 - a];
      };

      const gap = Math.max(0, Math.min(96, Number(d.gap) || 24));

      // Vertical align: editor uses verticalAlign (top|center|bottom); legacy
      // serialiser used align (start|center|end).
      const va = d.verticalAlign || d.align;
      const align = va === 'center' || va === 'middle' ? 'center'
                  : va === 'bottom' || va === 'end'    ? 'flex-end'
                                                       : 'flex-start';

      const stack = d.stackOnMobile !== false && d.stack !== false;

      // Map vertical-align to a flex `justify-content` value (axis is the
      // column's main axis when flex-direction is column).
      const justify = va === 'center' || va === 'middle' ? 'center'
                    : va === 'bottom' || va === 'end'    ? 'flex-end'
                                                         : 'flex-start';
      // Apply a consistent minimum height ONLY when alignment isn't "top"
      // — otherwise centred / bottom-aligned content has nothing to push
      // off and the rule visually no-ops, which is exactly the bug the
      // user measured. Top alignment doesn't need a min-height (content
      // already sits at the natural top of the row).
      const minH = (va === 'top' || !va) ? '' : 'min-height:240px;';

      // ── 1 column ─────────────────────────────────────────────────────
      if (columnCount === 1) {
        // The toolbar's `gap` value is the only spacing control a 1-col
        // block has — so it MUST apply as the vertical gap between nested
        // blocks (otherwise it's a no-op, which the user explicitly
        // flagged). Use flex-direction:column + row-gap to space children.
        return `<div style="display:flex; flex-direction:column; row-gap:${gap}px; justify-content:${justify}; ${minH} margin:16px 0; font-size:16px; line-height:1.7; color:#1F2937; overflow-wrap:anywhere; word-break:break-word; max-width:100%;">${renderSide(leftSide)}</div>`;
      }

      // ── 2 or 3 columns: shared responsive flexbox with @media stack ──
      // Classes are stable + shared so multiple instances reuse one rule.
      // Below 768px each column becomes a full-width row when stack is on.
      // Text-overflow rules (overflow-wrap / word-break / max-width:100%) on
      // every descendant prevent long unbroken strings (URLs, code, words
      // without spaces) from forcing a column wider than its flex track and
      // breaking the responsive stack.
      const overflowRules = `
        .lb-twocol, .lb-twocol *, .lb-twocol-nostack, .lb-twocol-nostack *{
          overflow-wrap:anywhere; word-break:break-word;
        }
        .lb-twocol img, .lb-twocol video, .lb-twocol iframe, .lb-twocol table, .lb-twocol pre,
        .lb-twocol-nostack img, .lb-twocol-nostack video, .lb-twocol-nostack iframe,
        .lb-twocol-nostack table, .lb-twocol-nostack pre{
          max-width:100%;
        }`;
      // Stacking rules need to fire in TWO situations:
      //   1) Live learner view — the real viewport is ≤767px.
      //   2) Editor "Mobile" preview — the viewport is desktop-width but the
      //      preview canvas is constrained to 390px. PreviewModal marks the
      //      canvas with [data-mobile-preview="true"], so we also stack when
      //      any ancestor carries that attribute.
      // We can't use container queries here because the serialized HTML is
      // injected into arbitrary host containers and we can't guarantee a
      // `container-type` ancestor. The attribute-driven rule is reliable.
      // `min-height` on the flex row gives `align-items: center/flex-end`
      // something to push off. Without it the row shrinks to the tallest
      // column's content and the alignment visually no-ops. Top alignment
      // doesn't need it (content already starts at the top edge).
      const minHCss = minH; // already computed above for the 1-col branch
      const stackCss = stack
        ? `<style>
            .lb-twocol{display:flex;flex-direction:row;flex-wrap:nowrap;gap:${gap}px;margin:16px 0;align-items:${align};${minHCss}}
            .lb-twocol > .lb-twocol-col{flex:1 1 0;min-width:0;max-width:100%;}
            ${overflowRules}
            @media (max-width: 767px){
              .lb-twocol{flex-direction:column;flex-wrap:nowrap;}
              .lb-twocol > .lb-twocol-col{flex:0 0 100%;width:100%;max-width:100%;}
            }
            [data-mobile-preview="true"] .lb-twocol{flex-direction:column;flex-wrap:nowrap;}
            [data-mobile-preview="true"] .lb-twocol > .lb-twocol-col{flex:0 0 100%;width:100%;max-width:100%;}
          </style>`
        : `<style>
            .lb-twocol-nostack{display:flex;flex-direction:row;flex-wrap:nowrap;gap:${gap}px;margin:16px 0;align-items:${align};${minHCss}}
            .lb-twocol-nostack > .lb-twocol-col{flex:1 1 0;min-width:0;max-width:100%;}
            ${overflowRules}
          </style>`;
      const rootClass = stack ? 'lb-twocol' : 'lb-twocol-nostack';

      if (columnCount === 3) {
        // Equal thirds.
        return `${stackCss}<div class="${rootClass}"><div class="lb-twocol-col" style="flex-basis:33.3333%;">${renderSide(leftSide)}</div><div class="lb-twocol-col" style="flex-basis:33.3333%;">${renderSide(middleSide)}</div><div class="lb-twocol-col" style="flex-basis:33.3333%;">${renderSide(rightSide)}</div></div>`;
      }

      // 2-column (default) — ratio-controlled basis.
      const [lPct, rPct] = parseRatio();
      return `${stackCss}<div class="${rootClass}"><div class="lb-twocol-col" style="flex-basis:${lPct}%;">${renderSide(leftSide)}</div><div class="lb-twocol-col" style="flex-basis:${rPct}%;">${renderSide(rightSide)}</div></div>`;
    }
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

// ── Dev-only round-trip assertion ──────────────────────────────────────────
// Catches regressions where the editor's data shape (TableBlock /
// TwoColumnsBlock) and the serializer drift apart. We don't throw — we log
// once at module load in non-production environments so issues surface in
// the dev console without breaking the editor.
(function devRoundTripCheck() {
  try {
    if (typeof window === 'undefined') return;
    // Only run in dev. Vite exposes import.meta.env.DEV; guard so production
    // bundles strip this entire IIFE.
    // eslint-disable-next-line no-undef
    const isDev = !!(import.meta && import.meta.env && import.meta.env.DEV);
    if (!isDev) return;

    const tableBlock = {
      type: 'table',
      data: {
        header: true, stripe: false, caption: 'Test',
        rows: [
          [{ content: 'H1' }, { content: 'H2' }],
          [{ content: 'Cell' }, { content: 'Body' }],
        ],
      },
    };
    const tableHtml = blockToHtml(tableBlock);
    if (!tableHtml.includes('Cell')) {
      // eslint-disable-next-line no-console
      console.warn('[lessonBuilder] table serializer dropped cell content. Shape mismatch?');
    }

    const twoColBlock = {
      type: 'two-columns',
      data: {
        leftBlocks:  [{ type: 'paragraph', data: { html: 'Left' } }],
        rightBlocks: [{ type: 'paragraph', data: { html: 'Right' } }],
        ratio: 0.5, gap: 24, verticalAlign: 'top', stackOnMobile: true,
      },
    };
    const twoColHtml = blockToHtml(twoColBlock);
    if (!twoColHtml.includes('Left') || !twoColHtml.includes('Right')) {
      // eslint-disable-next-line no-console
      console.warn('[lessonBuilder] two-columns serializer dropped child content. Shape mismatch?');
    }

    // Image round-trip — the exact failing case the user reported.
    const imageBlock = {
      type: 'image',
      data: {
        url: 'https://placehold.co/600x400/png',
        alt: 'Placeholder',
        align: 'center',
        widthUnit: 'percent',
        width: 70,
        fit: 'contain',
        lockAspect: true,
      },
    };
    const imgHtml = blockToHtml(imageBlock);
    if (!imgHtml.includes('<img') || !imgHtml.includes('placehold.co')) {
      // eslint-disable-next-line no-console
      console.warn('[lessonBuilder] image serializer dropped <img> tag or URL. Shape mismatch?');
    }
    if (!imgHtml.includes('70%')) {
      // eslint-disable-next-line no-console
      console.warn('[lessonBuilder] image serializer ignored width 70%. Key mismatch?');
    }

    // Image-with-text round-trip.
    const imageTextBlock = {
      type: 'image-text',
      data: { url: 'https://placehold.co/300x200/png', alt: 'a', html: 'hello', side: 'left' },
    };
    const itHtml = blockToHtml(imageTextBlock);
    if (!itHtml.includes('<img') || !itHtml.includes('placehold.co') || !itHtml.includes('hello')) {
      // eslint-disable-next-line no-console
      console.warn('[lessonBuilder] image-text serializer dropped <img> or text. Shape mismatch?');
    }
  } catch {
    /* never block module load */
  }
})();