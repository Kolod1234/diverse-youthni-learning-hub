import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Monitor, Tablet, Smartphone, Presentation, X } from 'lucide-react';
import { MathJax } from 'better-react-mathjax';

// Live HTML preview at desktop / tablet / mobile / presentation widths.
// Renders into document.body via a portal so it always sits above the global
// Layout header, drawers, MUI AppBar, etc. We use an inline z-index that beats
// MUI's modal layer (1300) and the rest of the app chrome.

const DEVICES = {
  desktop:      { label: 'Desktop',      icon: Monitor,      width: 1280 },
  tablet:       { label: 'Tablet',       icon: Tablet,       width: 820 },
  mobile:       { label: 'Mobile',       icon: Smartphone,   width: 390 },
  presentation: { label: 'Presentation', icon: Presentation, width: 1600 },
};

// Single shared portal target on body.
function getPortalTarget() {
  if (typeof document === 'undefined') return null;
  let el = document.getElementById('lesson-builder-preview-root');
  if (!el) {
    el = document.createElement('div');
    el.id = 'lesson-builder-preview-root';
    document.body.appendChild(el);
  }
  return el;
}

export default function PreviewModal({ open, onClose, html }) {
  const [device, setDevice] = useState('desktop');

  // Close on Escape + lock body scroll while open. We don't unmount the
  // listener until close so the user always has a keyboard escape route.
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose?.();
      }
    };
    document.addEventListener('keydown', onKey, true);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey, true);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;
  const target = getPortalTarget();
  if (!target) return null;
  const cfg = DEVICES[device];

  // Inline z-index — Tailwind's z-50 is only 50 and loses to MUI AppBar.
  // 2_147_483_000 keeps us above MUI modals (1300/1500) and any stacking
  // contexts created by transforms in the host page.
  const OVERLAY_Z = 2147483000;

  const stop = (e) => e.stopPropagation();

  const modal = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Lesson preview"
      onMouseDown={stop}
      onClick={stop}
      onTouchStart={stop}
      style={{ position: 'fixed', inset: 0, zIndex: OVERLAY_Z }}
      className="bg-black/80 flex flex-col"
    >
      {/* Sticky toolbar — flex-wrap so all four device controls stay visible
          on narrow viewports, plus an unmistakable Close button on the right. */}
      <div
        className="sticky top-0 flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2 bg-slate-900 text-white shadow-md"
        style={{ zIndex: 1 }}
      >
        <div className="flex flex-wrap items-center gap-1 bg-slate-800 rounded-md p-1">
          {Object.entries(DEVICES).map(([k, v]) => {
            const Icon = v.icon;
            const active = device === k;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setDevice(k)}
                aria-pressed={active}
                className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                  active ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden xs:inline sm:inline">{v.label}</span>
              </button>
            );
          })}
        </div>
        <span className="text-xs text-slate-400 hidden sm:inline">{cfg.width}px</span>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close preview"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-xs font-medium"
        >
          <X className="w-4 h-4" />
          Close preview
        </button>
      </div>

      <div className="flex-1 overflow-auto bg-slate-800 p-3 sm:p-6">
        <div
          className="mx-auto bg-white rounded shadow-2xl overflow-hidden"
          // data-mobile-preview tells the serialized lesson HTML's stacking
          // rules (see htmlSerializer two-columns block) to collapse 2- and
          // 3-column layouts into a single column inside this canvas, even
          // though the real viewport is wider than 767px. Without it the
          // @media (max-width:767px) rule never fires and columns stay
          // side-by-side in the simulated mobile frame.
          data-mobile-preview={device === 'mobile' ? 'true' : undefined}
          style={{ width: '100%', maxWidth: cfg.width }}
        >
          <div className={`${device === 'presentation' ? 'p-8 sm:p-12' : 'p-4 sm:p-6'}`}>
            {/* Wrap in reader-prose so authoring preview uses the same typography
                primitives as the live CourseReaderView (editorial serif heads,
                18px body, indigo links). slide.content HTML is not modified. */}
            <MathJax dynamic>
              <div className="reader-prose" dangerouslySetInnerHTML={{ __html: html || '' }} />
            </MathJax>
          </div>
        </div>
      </div>

      {/* Scoped reader typography — mirrors CourseReaderShell so the editor
          preview is visually representative of the learner view. Inlined here
          because PreviewModal renders into a body-level portal outside the
          host page's style cascade. */}
      <style>{`
        .reader-prose { font-size: 18px; line-height: 1.75; color: #1e293b; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
        .reader-prose p { margin: 0 0 1.1em; }
        .reader-prose h1, .reader-prose h2, .reader-prose h3 {
          font-family: ui-serif, Georgia, "Times New Roman", serif;
          color: #0f172a; letter-spacing: -0.01em; line-height: 1.25;
        }
        .reader-prose h1 { font-size: 2.25rem; font-weight: 700; margin: 1.2em 0 0.5em; }
        .reader-prose h2 { font-size: 1.875rem; font-weight: 700; margin: 1.6em 0 0.6em; }
        .reader-prose h3 { font-size: 1.375rem; font-weight: 700; margin: 1.4em 0 0.5em; }
        .reader-prose ul, .reader-prose ol { padding-left: 1.4em; margin: 0 0 1.1em; }
        .reader-prose li { margin: 0.35em 0; }
        .reader-prose a { color: #4f46e5; text-decoration: underline; text-underline-offset: 3px; }
        .reader-prose img { max-width: 100%; height: auto; border-radius: 12px; }
        .reader-prose blockquote {
          margin: 1.4em 0; padding: 0.4em 1.2em;
          border-left: 4px solid #4f46e5; background: #eef2ff;
          color: #312e81; border-radius: 0 8px 8px 0;
        }
      `}</style>
    </div>
  );

  return createPortal(modal, target);
}