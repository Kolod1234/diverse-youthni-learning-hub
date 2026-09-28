// AS 5 diagram 1 — the vocabulary of material properties.
const { C, makeCanvas, title, save, panelBox, textCentered, paragraph } = require('./common.cjs');

const PROPS = [
  { t: 'Strength', col: C.accent, d: 'Resists a pulling or squashing force without breaking.', e: 'A titanium stem carries body weight for decades.' },
  { t: 'Hardness', col: C.accent, d: 'Resists being scratched or dented by another surface.', e: 'Ceramic surfaces stay smooth where metal scuffs.' },
  { t: 'Toughness', col: C.accent, d: 'Absorbs knocks and impacts without cracking.', e: 'A steel hammer head shrugs off decades of blows.' },
  { t: 'Brittleness', col: C.warn, d: 'Breaks suddenly, with little or no bending first.', e: 'Glass shatters; chalk snaps on a clean face.' },
  { t: 'Elasticity', col: C.ok, d: 'Springs back to its original shape once the load is removed.', e: 'A rubber band; the walls of your arteries.' },
  { t: 'Ductility', col: C.ok, d: 'Can be stretched out into a wire without tearing.', e: 'Copper wire is drawn from thick rods.' },
  { t: 'Malleability', col: C.ok, d: 'Can be hammered or rolled into a new shape.', e: 'Aluminium is beaten into kitchen foil.' },
  { t: 'Fatigue', col: C.warn, d: 'Failure after many repeated bends, even below normal strength.', e: 'A paperclip snaps after a few bends.' },
];

function render() {
  const W = 1500, H = 900;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'What we ask of a material', 'Eight words that describe how solids behave under force');

  const cw = 336, ch = 250, gap = 24;
  const x0 = (W - (cw * 4 + gap * 3)) / 2;
  const y0 = 150, dy = 290;
  PROPS.forEach((p, i) => {
    const cx = x0 + (i % 4) * (cw + gap);
    const cy = y0 + Math.floor(i / 4) * dy;
    panelBox(ctx, cx, cy, cw, ch, '#ffffff', C.panelBorder, 14);
    textCentered(ctx, p.t, cx + cw / 2, cy + 38, cw - 40, 24, '700', p.col);
    paragraph(ctx, p.d, cx + cw / 2, cy + 88, cw - 48, 24, 17, '400', C.ink, 'center');
    textCentered(ctx, p.e, cx + cw / 2, cy + ch - 32, cw - 40, 16, '400', C.sub);
  });

  panelBox(ctx, 60, 730, W - 120, 130, C.panel, C.panelBorder, 16);
  textCentered(ctx, 'Properties are measured, not guessed', W / 2, 766, W - 200, 21, '700', C.ink);
  paragraph(
    ctx,
    'Hardness by scratch tests; strength by pulling a sample until it yields; fatigue by bending it millions of times. Learn the exact wording of each term — exam questions routinely ask you to state the difference between two similar-sounding properties.',
    W / 2, 806, W - 260, 25, 17, '400', C.sub, 'center',
  );
  save('as5-properties.png', canvas);
}

module.exports = { render };