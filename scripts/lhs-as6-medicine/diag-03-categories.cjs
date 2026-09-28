// AS 6 diagram 3 — therapeutic purpose categories and medicine sources.
const { C, makeCanvas, title, save, panelBox, textCentered, paragraph } = require('./common.cjs');

const CARDS = [
  { t: 'Prophylactic', tag: 'PREVENT', col: C.accent2, d: 'Given to stop a disease or condition developing before it starts.', e: 'Vaccines; antimalarial tablets' },
  { t: 'Curative', tag: 'CURE THE CAUSE', col: C.ok, d: 'Attacks and eliminates the root cause of the illness, restoring health.', e: 'Antibiotics, antifungals, antivirals' },
  { t: 'Symptomatic', tag: 'EASE SYMPTOMS', col: C.amber, d: 'Relieves uncomfortable symptoms without curing the underlying disease.', e: 'Analgesics; antipyretics; NSAIDs' },
  { t: 'Substitution', tag: 'REPLACE', col: C.accent, d: 'Replaces a natural substance the body cannot make in sufficient quantity.', e: 'Insulin; thyroxine; clotting factors' },
  { t: 'Diagnostic', tag: 'DETECT', col: C.pink, d: 'Administered to reveal or image a structure or condition inside the body.', e: 'Barium meal; contrast media; radiotracers' },
];

const SOURCES = [
  { t: 'Natural', d: 'Extracted from living organisms or minerals — penicillin from mould; digoxin from foxglove.' },
  { t: 'Semi-synthetic', d: 'A natural molecule chemically modified in the laboratory to improve effect, stability or side effects.' },
  { t: 'Synthetic', d: 'Designed and built entirely from chemical starting materials in the laboratory.' },
];

function render() {
  const W = 1500, H = 900;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'What is this medicine for?', 'Therapeutic purpose and the source of the active ingredient');

  const cw = 268, ch = 330, gap = 22;
  const x0 = (W - (cw * 5 + gap * 4)) / 2;
  const y0 = 150;
  CARDS.forEach((p, i) => {
    const cx = x0 + i * (cw + gap);
    panelBox(ctx, cx, y0, cw, ch, '#ffffff', p.col, 14);
    textCentered(ctx, p.t, cx + cw / 2, y0 + 42, cw - 30, 23, '700', p.col);
    textCentered(ctx, p.tag, cx + cw / 2, y0 + 74, cw - 30, 15, '700', p.col);
    paragraph(ctx, p.d, cx + cw / 2, y0 + 122, cw - 42, 24, 17, '400', C.ink, 'center');
    textCentered(ctx, p.e, cx + cw / 2, y0 + ch - 34, cw - 30, 15, '400', C.sub);
  });

  // Sources band.
  panelBox(ctx, 70, 560, W - 140, 300, C.panel, C.panelBorder, 16);
  textCentered(ctx, 'Where the active ingredient comes from', W / 2, 602, 700, 24, '700', C.ink);
  const sw = (W - 140 - 60 - 40) / 3;
  SOURCES.forEach((s, i) => {
    const sx = 100 + i * (sw + 20);
    panelBox(ctx, sx, 640, sw, 170, '#ffffff', C.panelBorder, 12);
    textCentered(ctx, s.t, sx + sw / 2, 678, sw - 30, 21, '700', C.accent);
    paragraph(ctx, s.d, sx + sw / 2, 730, sw - 44, 25, 17, '400', C.ink, 'center');
  });

  save('as6-categories.png', canvas);
}

module.exports = { render };