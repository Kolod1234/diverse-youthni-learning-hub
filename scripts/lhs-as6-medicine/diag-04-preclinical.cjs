// AS 6 diagram 4 — drug discovery and pre-clinical testing pipeline.
const { C, makeCanvas, title, save, panelBox, textCentered, paragraph, arrow, chip } = require('./common.cjs');

const STAGES = [
  {
    t: 'Target identification', col: C.accent,
    d: 'Pinpoint the biological target involved in the disease — a specific protein, enzyme or cell receptor that plays a key role in causing or progressing the illness.',
    foot: 'What exactly should the medicine act on?',
  },
  {
    t: 'Lead identification', col: C.accent2,
    d: 'Screen thousands of chemical compounds to find a lead compound — a molecule that interacts with the target to produce the desired medical effect.',
    foot: 'Which molecule shows promise?',
  },
  {
    t: 'In vitro testing', col: C.ok,
    d: 'Laboratory testing outside a living organism — in test tubes, culture dishes and cell cultures. Establishes biological activity and begins to reveal the mechanism.',
    foot: 'Does it act on cells as hoped?',
  },
  {
    t: 'In vivo testing', col: C.amber,
    d: 'Testing on living animals to observe how a whole body absorbs, distributes and excretes the compound and to detect serious toxic effects on organs.',
    foot: 'Is it tolerable in a whole organism?',
  },
];

function render() {
  const W = 1500, H = 900;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Before any human takes it', 'Drug discovery and pre-clinical testing');

  const bw = 320, bh = 380;
  const gap = (W - 100 - bw * 4) / 3;
  const y0 = 150;
  STAGES.forEach((s, i) => {
    const x = 50 + i * (bw + gap);
    panelBox(ctx, x, y0, bw, bh, '#ffffff', s.col, 14);
    chip(ctx, String(i + 1), x + 46, y0 + 42, 40, s.col, '#ffffff', 19);
    textCentered(ctx, s.t, x + bw / 2, y0 + 92, bw - 40, 22, '700', s.col);
    paragraph(ctx, s.d, x + bw / 2, y0 + 170, bw - 48, 25, 17, '400', C.ink, 'center');
    textCentered(ctx, s.foot, x + bw / 2, y0 + bh - 36, bw - 40, 16, '600', C.sub);
    if (i < 3) arrow(ctx, x + bw + 10, y0 + bh / 2, x + bw + gap - 10, y0 + bh / 2, 4, C.sub);
  });

  panelBox(ctx, 70, 580, W - 140, 280, C.panel, C.panelBorder, 16);
  textCentered(ctx, 'The three goals of pre-clinical testing', W / 2, 624, 700, 23, '700', C.ink);
  const goals = [
    { t: 'Safety', d: 'Determine non-lethal dosage ranges so the first human dose is chosen rationally.' },
    { t: 'Biological activity', d: 'Confirm the compound actually does what it was designed to do.' },
    { t: 'Toxicity', d: 'Detect damage to cells, tissues and vital organs before humans are exposed.' },
  ];
  const gw = (W - 200 - 40) / 3;
  goals.forEach((g, i) => {
    const gx = 100 + i * (gw + 20);
    panelBox(ctx, gx, 660, gw, 160, '#ffffff', C.panelBorder, 12);
    textCentered(ctx, g.t, gx + gw / 2, 700, gw - 30, 20, '700', C.accent);
    paragraph(ctx, g.d, gx + gw / 2, 750, gw - 44, 24, 16, '400', C.ink, 'center');
  });

  save('as6-preclinical.png', canvas);
}

module.exports = { render };