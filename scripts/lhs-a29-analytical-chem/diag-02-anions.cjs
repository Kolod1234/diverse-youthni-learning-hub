// Diagram 2 — anion identification: carbonate, halide and sulfate tests.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, tube } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 960);
title(ctx, 1560, 'Identifying anions: three standard tests', 'Each test is a short sequence — reagent first, observation second, confirmation third');

const cards = [
  {
    x: 80, name: 'CARBONATE, CO₃²⁻', fill: C.accent2Soft, stroke: '#bae6fd',
    tubeOpts: { liquid: '#dbeafe', bubbles: true },
    steps: [
      '1  Add dilute acid (HCl or HNO₃).',
      '2  Immediate effervescence — CO₂ gas is released.',
      '3  Bubble the gas through limewater: it turns cloudy-milky.',
    ],
  },
  {
    x: 560, name: 'HALIDES, Cl⁻ / Br⁻ / I⁻', fill: C.amberSoft, stroke: '#fde68a',
    tubeOpts: { liquid: '#fef2f2', ppt: '#f3f4f6' },
    steps: [
      '1  Acidify with dilute nitric acid HNO₃ — never HCl, which adds chloride.',
      '2  Add silver nitrate, AgNO₃.',
      '3  White AgCl (chloride), cream AgBr (bromide), yellow AgI (iodide).',
    ],
  },
  {
    x: 1040, name: 'SULFATE, SO₄²⁻', fill: C.okSoft, stroke: '#bbf7d0',
    tubeOpts: { liquid: '#ecfdf5', ppt: '#f8fafc' },
    steps: [
      '1  Acidify with dilute hydrochloric acid.',
      '2  Add barium chloride, BaCl₂.',
      '3  A dense white precipitate of BaSO₄ confirms sulfate.',
    ],
  },
];

cards.forEach((c) => {
  panelBox(ctx, c.x, 150, 440, 570, c.fill, c.stroke, 18);
  textCentered(ctx, c.name, c.x + 220, 194, 400, 24, '700');
  tube(ctx, c.x + 220, 235, c.tubeOpts);
  let y = 380;
  c.steps.forEach((s) => {
    y = paragraph(ctx, s, c.x + 28, y, 384, 27, 19, '400') + 18;
  });
});

panelBox(ctx, 80, 760, 1400, 96, C.warnSoft, '#fecaca', 14);
textCentered(ctx, 'Acid first, always: carbonate ions also give white precipitates with silver and barium ions —', 780, 792, 1340, 20, '600');
textCentered(ctx, 'acid destroys carbonate before it can produce a false positive.', 780, 824, 1340, 20, '600');

save('a29-anions.png', canvas);