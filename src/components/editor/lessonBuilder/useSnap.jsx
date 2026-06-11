// useSnap
// ---------------------------------------------------------------
// Pure helpers that compute snap targets and the snapped position
// for a block being dragged on the FreeCanvas. Designed to be
// dependency-free so it can be unit-tested and reused by both
// single-block drag (FreeBlock) and group drag (GroupSelectionOverlay)
// in the future.
//
// Units: everything is in PERCENT of the canvas (0..100), matching
// how block frames are stored. The threshold is supplied in pixels
// by the caller (it knows the host rect) and converted at call time.
//
// Snap targets considered for a moving block:
//   • Canvas edges:    x = 0, x = 100, y = 0, y = 100
//   • Canvas centre:   x = 50, y = 50
//   • For every OTHER block on the slide:
//       - left, horizontal centre, right
//       - top,  vertical centre,   bottom
//
// For each axis we compare three reference lines on the moving block
// (start / centre / end) against every target line, and pick the
// closest pair within the threshold. The matching pair drives a
// guide line that the canvas draws while the drag is active.

const REF_KEYS = ['start', 'center', 'end'];

function buildTargets(otherFrames, gridStepPct) {
  // Returns { x: [{value, source}], y: [...] }
  const x = [
    { value: 0,   source: 'canvas-left'   },
    { value: 50,  source: 'canvas-center' },
    { value: 100, source: 'canvas-right'  },
  ];
  const y = [
    { value: 0,   source: 'canvas-top'    },
    { value: 50,  source: 'canvas-center' },
    { value: 100, source: 'canvas-bottom' },
  ];
  otherFrames.forEach((f) => {
    x.push({ value: f.x,             source: 'block-left'   });
    x.push({ value: f.x + f.w / 2,   source: 'block-center' });
    x.push({ value: f.x + f.w,       source: 'block-right'  });
    y.push({ value: f.y,             source: 'block-top'    });
    y.push({ value: f.y + f.h / 2,   source: 'block-center' });
    y.push({ value: f.y + f.h,       source: 'block-bottom' });
  });
  // Grid lines — added when snap-to-grid is enabled. We add every grid
  // intersection from 0..100 so the closest one is picked alongside
  // block/canvas targets. Grid snaps do NOT draw an alignment guide
  // (the grid itself is already a visible reference).
  if (gridStepPct && gridStepPct > 0) {
    for (let v = 0; v <= 100 + 0.001; v += gridStepPct) {
      x.push({ value: Math.min(100, v), source: 'grid' });
      y.push({ value: Math.min(100, v), source: 'grid' });
    }
  }
  return { x, y };
}

// Refs the moving frame contributes to the comparison on each axis.
function movingRefs(frame) {
  return {
    x: {
      start:  frame.x,
      center: frame.x + frame.w / 2,
      end:    frame.x + frame.w,
    },
    y: {
      start:  frame.y,
      center: frame.y + frame.h / 2,
      end:    frame.y + frame.h,
    },
  };
}

// Picks the best snap on one axis. Returns { delta, guide } or null.
//   delta  = how much to shift the moving frame on this axis (in %)
//   guide  = the line to draw, expressed as the target value + which
//            ref matched (so the canvas can draw the right segment).
function bestSnap(refs, targets, thresholdPct) {
  let best = null;
  REF_KEYS.forEach((key) => {
    const refVal = refs[key];
    targets.forEach((t) => {
      const d = t.value - refVal;
      const ad = Math.abs(d);
      if (ad <= thresholdPct && (!best || ad < best.absDelta)) {
        best = { delta: d, absDelta: ad, target: t.value, ref: key, source: t.source };
      }
    });
  });
  return best;
}

// Public: snap a proposed { x, y } for a frame against the other
// frames on the canvas. Returns { x, y, guides } where guides is
// an array of { axis, value, span } describing the alignment lines
// to draw while this drag is active.
//
//   axis  = 'x' | 'y'  (vertical or horizontal guide)
//   value = position on the canvas (0..100, on the perpendicular axis)
//   span  = [from, to] in % on the parallel axis — covers the union
//           of the moving frame and the source block so the guide
//           reaches both, exactly like PowerPoint/Figma.
export function computeSnap({
  frame,            // proposed frame { x, y, w, h }
  otherFrames,      // [{ x, y, w, h }]  — all other blocks on the slide
  hostWidthPx,      // canvas width in px (for px → % threshold conversion)
  hostHeightPx,
  thresholdPx = 6,  // snap radius in px
  gridStepPct = 0,  // > 0 enables snap-to-grid at this spacing (in %)
}) {
  if (!hostWidthPx || !hostHeightPx) {
    return { x: frame.x, y: frame.y, guides: [] };
  }

  const thxPct = (thresholdPx / hostWidthPx)  * 100;
  const thyPct = (thresholdPx / hostHeightPx) * 100;

  const refs = movingRefs(frame);
  const { x: xTargets, y: yTargets } = buildTargets(otherFrames, gridStepPct);

  const xSnap = bestSnap(refs.x, xTargets, thxPct);
  const ySnap = bestSnap(refs.y, yTargets, thyPct);

  const nx = xSnap ? frame.x + xSnap.delta : frame.x;
  const ny = ySnap ? frame.y + ySnap.delta : frame.y;

  // Build guide segments: a vertical guide for an x-axis snap, a
  // horizontal guide for a y-axis snap. The span covers from the
  // top/leftmost edge of the moving (post-snap) frame and the
  // closest contributing source so the line reaches both.
  const guides = [];
  // Grid snaps don't produce alignment guides — the grid lines themselves
  // are the visible reference and adding pink rules on top is noisy.
  if (xSnap && xSnap.source !== 'grid') {
    // For a vertical guide we need a y-span covering the moving frame
    // and any block whose edge equals the snapped x value.
    let top = ny;
    let bot = ny + frame.h;
    otherFrames.forEach((f) => {
      const edges = [f.x, f.x + f.w / 2, f.x + f.w];
      if (edges.some((e) => Math.abs(e - xSnap.target) < 0.01)) {
        top = Math.min(top, f.y);
        bot = Math.max(bot, f.y + f.h);
      }
    });
    guides.push({ axis: 'x', value: xSnap.target, span: [top, bot] });
  }
  if (ySnap && ySnap.source !== 'grid') {
    let left = nx;
    let right = nx + frame.w;
    otherFrames.forEach((f) => {
      const edges = [f.y, f.y + f.h / 2, f.y + f.h];
      if (edges.some((e) => Math.abs(e - ySnap.target) < 0.01)) {
        left = Math.min(left, f.x);
        right = Math.max(right, f.x + f.w);
      }
    });
    guides.push({ axis: 'y', value: ySnap.target, span: [left, right] });
  }

  return { x: nx, y: ny, guides };
}