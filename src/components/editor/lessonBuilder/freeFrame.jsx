// freeFrame
// ---------------------------------------------------------------
// Helpers for the PowerPoint-style free canvas. Every block on a
// slide owns an optional `frame` object describing where it sits on
// a logical 16:9 stage:
//
//   frame: {
//     x: number,        // % from left   (0..100)
//     y: number,        // % from top    (0..100)
//     w: number,        // % of stage W  (5..100)
//     h: number,        // % of stage H  (5..100)
//     r: number,        // rotation degrees
//     z: number,        // z-index (paint order; higher = on top)
//   }
//
// Percentages let the canvas scale with the editor / player viewport
// while keeping each block in the same visual position.

export const STAGE_RATIO = 16 / 9;

export const DEFAULT_FRAME = { x: 8, y: 8, w: 50, h: 20, r: 0, z: 1 };

// Per-type sensible default size for newly created blocks. Bigger
// boxes for media, smaller for text — the user can resize anyway.
const TYPE_SIZE = {
  'heading-1':            { w: 60, h: 14 },
  'heading-2':            { w: 55, h: 12 },
  'heading-3':            { w: 50, h: 11 },
  'paragraph':            { w: 55, h: 18 },
  'bullet-list':          { w: 50, h: 25 },
  'numbered-list':        { w: 50, h: 25 },
  'quote':                { w: 55, h: 18 },
  'callout':              { w: 55, h: 18 },
  'definition':           { w: 50, h: 20 },
  'image':                { w: 45, h: 45 },
  'image-text':           { w: 70, h: 45 },
  'video':                { w: 55, h: 45 },
  'file':                 { w: 35, h: 10 },
  'table':                { w: 70, h: 35 },
  'divider':              { w: 60, h: 4  },
  'spacer':               { w: 30, h: 6  },
  'two-columns':          { w: 80, h: 50 },
  'code':                 { w: 60, h: 30 },
  'math':                 { w: 50, h: 18 },
  'scientific-equation':  { w: 50, h: 14 },
  'learning-objective':   { w: 55, h: 18 },
  'key-takeaway':         { w: 55, h: 18 },
  'knowledge-check':      { w: 55, h: 22 },
  'legacy-html':          { w: 70, h: 35 },
};

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

export function clampFrame(frame) {
  const w = clamp(Number(frame?.w) || DEFAULT_FRAME.w, 5, 100);
  const h = clamp(Number(frame?.h) || DEFAULT_FRAME.h, 5, 100);
  const x = clamp(Number(frame?.x) || 0, 0, 100 - w);
  const y = clamp(Number(frame?.y) || 0, 0, 100 - h);
  const r = Number.isFinite(Number(frame?.r)) ? Number(frame.r) : 0;
  const z = Number.isFinite(Number(frame?.z)) ? Number(frame.z) : 1;
  return { x, y, w, h, r, z };
}

export function getFrame(block) {
  return clampFrame(block?.frame || DEFAULT_FRAME);
}

// Pick a sensible starting position for a newly added block, cascading
// it down-and-right from the last placed block so it doesn't sit on
// top of existing content.
export function nextCascadePosition(blocks, type) {
  const base = TYPE_SIZE[type] || { w: 50, h: 20 };
  const last = blocks[blocks.length - 1];
  if (!last || !last.frame) {
    return clampFrame({ x: 8, y: 8, w: base.w, h: base.h, r: 0, z: blocks.length + 1 });
  }
  const lf = clampFrame(last.frame);
  return clampFrame({
    x: lf.x + 4,
    y: lf.y + 4,
    w: base.w,
    h: base.h,
    r: 0,
    z: blocks.length + 1,
  });
}

// Stack legacy blocks (no frame) vertically inside the stage on first
// open, so an existing flow-based slide doesn't appear blank in free
// mode. Heights are estimated from the block type; we cap each block
// so even very long flows still fit (with overflow:auto inside).
export function migrateFlowToFrames(blocks) {
  let y = 4;
  const out = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.frame) { out.push(b); continue; }
    const size = TYPE_SIZE[b.type] || { w: 60, h: 18 };
    // Use the type's natural width so blocks have horizontal room to be
    // dragged sideways. Don't stretch to 88% — that pins blocks to the
    // left edge with virtually no horizontal travel.
    const frame = clampFrame({ x: 6, y, w: size.w, h: size.h, r: 0, z: i + 1 });
    out.push({ ...b, frame });
    y = Math.min(94, y + frame.h + 2);
  }
  return out;
}