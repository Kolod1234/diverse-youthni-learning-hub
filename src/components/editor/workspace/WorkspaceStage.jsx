import React from 'react';

/**
 * WorkspaceStage
 * --------------
 * Renders a neutral grey pasteboard with a centred white 16:9 stage that
 * the editor content scales into.
 *
 * Phase 1 design notes:
 *  - The stage has a logical 1280x720 internal coordinate space so the
 *    builder's text always renders at a known size at 100% zoom, and
 *    Fit/50/75/100 changes the on-screen scale uniformly.
 *  - We CSS-transform the stage, but the user can still toggle `naturalEdit`
 *    on per-stage children to disable the transform for editing modes that
 *    rely on form controls reading at the user's actual zoom level (the
 *    legacy VisualLessonBuilder controls live in the right inspector / a
 *    drawer above the stage so they are never scaled down).
 *  - The stage uses CSS `aspect-ratio` so a learner's viewport will scale it
 *    faithfully when this same shell is reused for preview/presentation.
 *
 * Props:
 *  - zoom: 'fit' | 0.5 | 0.75 | 1
 *  - children: the slide editor content (VisualLessonBuilder)
 *  - title: optional small title shown above the stage (slide N · viewport)
 */
const STAGE_W = 1280;
const STAGE_H = 720;

export default function WorkspaceStage({
  zoom = 'fit',
  children,
  title,
  pasteboardClassName = '',
}) {
  const containerRef = React.useRef(null);
  const [fitScale, setFitScale] = React.useState(1);

  // Compute Fit scale on resize. The transform-origin is top-center, so we
  // reserve enough height for the scaled stage and let the pasteboard scroll
  // vertically if the user's viewport is shorter than the scaled stage.
  React.useEffect(() => {
    if (zoom !== 'fit') return;
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const cw = el.clientWidth - 64; // padding
      const ch = el.clientHeight - 64;
      if (cw <= 0 || ch <= 0) return;
      const s = Math.min(cw / STAGE_W, ch / STAGE_H, 1);
      setFitScale(Math.max(0.25, s));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [zoom]);

  const scale = zoom === 'fit' ? fitScale : zoom;
  const scaledW = STAGE_W * scale;
  const scaledH = STAGE_H * scale;

  return (
    <div
      ref={containerRef}
      className={[
        'relative flex-1 min-h-0 overflow-auto',
        // Neutral grey pasteboard (slate-100 / slate-200) — matches references.
        'bg-slate-100',
        pasteboardClassName,
      ].join(' ')}
    >
      {/* Optional centre-top title */}
      {title && (
        <div className="sticky top-0 z-[1] flex justify-center pt-2 pb-1 pointer-events-none">
          <div className="text-[11px] text-slate-500 bg-white/80 backdrop-blur px-2 py-0.5 rounded-full border border-slate-200 pointer-events-auto">
            {title}
          </div>
        </div>
      )}

      {/* Stage wrapper — exact scaled dimensions so the pasteboard sizes
          itself correctly and centres the stage horizontally. */}
      <div
        className="mx-auto my-6"
        style={{ width: scaledW, height: scaledH }}
      >
        <div
          className="bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-slate-200 rounded-md overflow-hidden"
          style={{
            width: STAGE_W,
            height: STAGE_H,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
          }}
        >
          {/* Logical 1280x720 coordinate space. Children should fill this
              area; overflow is hidden so a slide cannot leak outside the
              16:9 frame. */}
          <div className="w-full h-full overflow-auto">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

WorkspaceStage.STAGE_W = STAGE_W;
WorkspaceStage.STAGE_H = STAGE_H;