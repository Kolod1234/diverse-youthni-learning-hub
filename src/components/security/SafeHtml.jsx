// NEW component: SafeHtml
// Use instead of `dangerouslySetInnerHTML={{ __html: something }}` wherever the HTML comes from
// the database, a lesson, a template, an import (PowerPoint, Rise, Canva) or an AI generator.
// It removes scripts, event handlers (onerror=, onclick=...), javascript: links and iframes from
// unknown sites, while keeping normal lesson formatting, images, tables, maths (MathML/SVG) and
// embeds from the video/slide sites listed below.
//
// Uses isomorphic-dompurify, which is already a dependency of the app.
import React from 'react';
import DOMPurify from 'isomorphic-dompurify';

// Sites allowed inside <iframe> in lesson content. Add a host here only if lessons need it.
const ALLOWED_IFRAME_HOSTS = new Set([
  'www.youtube-nocookie.com',
  'player.vimeo.com',
  'docs.google.com',
  'drive.google.com',
  'www.canva.com',
  'h5p.org',
]);

let hooksAdded = false;
function addHooks() {
  if (hooksAdded) return;
  hooksAdded = true;

  DOMPurify.addHook('uponSanitizeElement', (node, data) => {
    if (data.tagName !== 'iframe') return;
    try {
      const src = new URL(node.getAttribute('src') || '', window.location.href);
      // Rewrite ordinary YouTube embeds to the privacy-enhanced host (no tracking cookies).
      if (src.hostname === 'www.youtube.com' || src.hostname === 'youtube.com') {
        src.hostname = 'www.youtube-nocookie.com';
        node.setAttribute('src', src.toString());
      }
      if (src.protocol !== 'https:' || !ALLOWED_IFRAME_HOSTS.has(src.hostname)) node.remove();
    } catch {
      node.remove();
    }
  });

  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

export function sanitizeHtml(html) {
  addHooks();
  return DOMPurify.sanitize(String(html ?? ''), {
    USE_PROFILES: { html: true, svg: true, svgFilters: true, mathMl: true },
    ADD_TAGS: ['iframe'],
    ADD_ATTR: ['allow', 'allowfullscreen', 'frameborder', 'target', 'loading'],
  });
}

export default function SafeHtml({ html, as: Tag = 'div', ...rest }) {
  return <Tag {...rest} dangerouslySetInnerHTML={{ __html: sanitizeHtml(html) }} />;
}
