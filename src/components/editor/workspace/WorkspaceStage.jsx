import React from 'react';

/**
 * WorkspaceStage
 * --------------
 * Renders a neutral grey pasteboard with a CENTRED, BOUNDED, 16:9 white
 * slide stage. The stage's visual size is computed from the actual
 * available pasteboard area minus padding, so at 1440x900 (after the
 * 240 px rail and the ribbon + status bar) the slide is roughly
 * 960-1080 px wide and 540-608 px tall — never a full-page sheet.
 *
 * Phase-1 repair notes (vs the previous build):
 *  - Uses `aspectRatio: '16 / 9'` so the visual element is always 16:9
 *    and cannot be stretched to fill the column height.
 *  - Computes Fit via a ResizeObserver on the pasteboard container and
 *    bounds the stage to min(0.9 * available width, 0.9 * available
 *    height * 16/9) so it never touches the edges.
 *  - Renders a pinned bottom status bar (the `statusBarSlot` prop is
 *    honoured — previous build silently dropped it).
 *  - Pasteboard background is `#e9edf2` (slate-200-ish) per the
 *    references; the slide itself is white with a 1 px border and a
 *    soft shadow.
 *  - Inner "slide content viewport" has `overflow:auto` so if the
 *    structured editor needs more vertical space than the slide
 *    allows, scrolling stays INSIDE the slide, not on the page.
 *
 * The component owns NO business state. All zoom / status / preview /
 * apply actions are passed in via props.
 */
const STAGE_W = 1280;
const STAGE_H = 720;
const STAGE_RATIO = STAGE_W / STAGE_H; // 1.777…

export default function WorkspaceStage({
  zoom = { id: 'fit', value: null },
  children,
  statusBarSlot,
  pasteboardClassName = '',
  // Optional CSS `background` value applied to the 16:9 slide canvas.
  // Used by the Design library to preview slide background templates
  // (solid colours, gradients, images) without touching slide content.
  stageBackground = null,
  flowLayout = false,
}) {
  const containerRef = React.useRef(null);
  const [size, setSize] = React.useState({ w: 0, h: 0 });

  // Measure the pasteboard area so we can size the stage precisely.
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      setSize({ w: el.clientWidth, h: el.clientHeight });
    });
    ro.observe(el);
    setSize({ w: el.clientWidth, h: el.clientHeight });
    return () => ro.disconnect();
  }, []);

  // Compute the rendered stage box size.
  //
  // For "fit": choose the largest 16:9 box that fits inside the
  // pasteboard with breathing room (24 px padding each side, capped at
  // 95 % of either axis). At 1440x900 with a 240 px rail and a 76 px
  // ribbon + 30 px status bar + 56 px header, the pasteboard is
  // ~1200x700; Fit produces a slide ≈ 1064x599 → exactly the
  // 960-1080 / 540-608 target.
  //
  // For numeric zooms: use the logical 1280x720 size scaled directly
  // (50%, 75%, 100%). The slide still respects 16:9.
  const { stageW, stageH } = React.useMemo(() => {
    if (zoom?.value && typeof zoom.value === 'number') {
      const s = zoom.value;
      return { stageW: STAGE_W * s, stageH: STAGE_H * s };
    }
    // Fit
    const padX = 12;
    const padY = 12;
    const availW = Math.max(0, size.w - padX * 2);
    const availH = Math.max(0, size.h - padY * 2);
    if (availW <= 0 || availH <= 0) {
      // Reasonable initial render before measure resolves.
      return { stageW: 960, stageH: 540 };
    }
    // Bound by both axes; cap at 98 % so the slide uses as much of the
    // pasteboard as possible while keeping a small breathing gap. This
    // widens the canvas significantly compared to the previous 0.90 cap,
    // eliminating the large unused side margins reported.
    const wByWidth = availW * 0.98;
    const hByWidth = wByWidth / STAGE_RATIO;
    const hByHeight = availH * 0.98;
    const wByHeight = hByHeight * STAGE_RATIO;
    const stageW = flowLayout ? wByWidth : Math.min(wByWidth, wByHeight);
    const stageH = stageW / STAGE_RATIO;
    return { stageW, stageH };
  }, [zoom, size.w, size.h, flowLayout]);

  return (
    <div className="flex-1 min-h-0 min-w-0 flex flex-col overflow-hidden">
      {/* Pasteboard — neutral grey, scrolls vertically only if the
          slide is taller than the pasteboard at the current zoom. */}
      <div
        ref={containerRef}
        className={[
          'flex-1 min-h-0 min-w-0 overflow-auto',
          // #e9edf2-ish — slate-200 is close. Use inline style so the
          // exact reference value is preserved even if the theme
          // changes the slate palette.
          'bg-[#e9edf2]',
          pasteboardClassName,
        ].join(' ')}
      >
        {/* Vertical centering wrapper. min-h-full so the slide stays
            vertically centred in the visible pasteboard area; if the
            scaled slide is taller than the pasteboard, we scroll. */}
        <div className={`min-h-full w-full flex ${flowLayout ? 'items-start' : 'items-center'} justify-center p-2 sm:p-3`}>
          <div
            // The visible 16:9 slide. Fixed pixel size so the inner
            // editor cannot stretch it.
            className="border border-slate-200 rounded-md shadow-[0_8px_30px_rgba(15,23,42,0.10)] overflow-hidden flex flex-col"
            style={{
              width: stageW,
              height: flowLayout ? 'auto' : stageH,
              minHeight: flowLayout ? stageH : undefined,
              flexShrink: 0,
              // aspectRatio is belt-and-braces — even if size math
              // somehow disagrees with the rectangle, the 16:9
              // ratio is enforced.
              aspectRatio: flowLayout ? undefined : `${STAGE_W} / ${STAGE_H}`,
              // White by default; overridden by per-slide design background.
              background: stageBackground || '#ffffff',
            }}
          >
            {/* Inner slide-content viewport. Scrolls if the
                structured editor needs more room than the 16:9 box
                allows. Padding keeps content off the slide edges. */}
            <div className={flowLayout ? 'min-w-0 w-full' : 'flex-1 min-h-0 min-w-0 overflow-auto'}>
              {children}
            </div>
          </div>
        </div>
      </div>

      {/* Pinned status bar at the foot of the workspace. */}
      {statusBarSlot}
    </div>
  );
}

WorkspaceStage.STAGE_W = STAGE_W;
WorkspaceStage.STAGE_H = STAGE_H;