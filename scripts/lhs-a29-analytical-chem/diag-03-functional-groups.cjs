// Diagram 3 — organic functional-group tests: alkene, alcohol, carboxylic acid.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, tube } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 960);
title(ctx, 1560, 'Organic functional-group tests', 'A colour change or a fizz names the reactive part of an organic unknown');

const cards = [
  {
    x: 80, name: 'ALKENE (C=C)', fill: C.accentSoft, stroke: '#c7d2fe',
    tubeOpts: { liquid: '#fdba74', liquidTop: 20 },
    head: 'Add bromine water and shake.',
    obs: 'Orange-brown → colourless.',
    why: 'Bromine adds across the double bond — decolourisation proves unsaturation.',
  },
  {
    x: 560, name: 'PRIMARY / SECONDARY ALCOHOL', fill: C.amberSoft, stroke: '#fde68a',
    tubeOpts: { liquid: '#15803d', liquidTop: 24 },
    head: 'Warm with acidified potassium dichromate(VI).',
    obs: 'Orange → green.',
    why: 'The alcohol is oxidised while Cr⁶⁺ (orange) is reduced to Cr³⁺ (green). A tertiary alcohol stays orange — it resists oxidation.',
  },
  {
    x: 1040, name: 'CARBOXYLIC ACID (–COOH)', fill: C.okSoft, stroke: '#bbf7d0',
    tubeOpts: { liquid: '#ecfdf5', bubbles: true },
    head: 'Add sodium carbonate, Na₂CO₃.',
    obs: 'Brisk effervescence — CO₂ turns limewater milky.',
    why: 'Like any acid, a carboxylic acid reacts with a carbonate to give a salt, water and carbon dioxide.',
  },
];

cards.forEach((c) => {
  panelBox(ctx, c.x, 150, 440, 570, c.fill, c.stroke, 18);
  textCentered(ctx, c.name, c.x + 220, 194, 400, 23, '700');
  tube(ctx, c.x + 220, 235, c.tubeOpts);
  let y = 385;
  y = paragraph(ctx, c.head, c.x + 28, y, 384, 27, 19, '700') + 16;
  y = paragraph(ctx, 'Observation: ' + c.obs, c.x + 28, y, 384, 27, 19, '400', C.accent) + 16;
  paragraph(ctx, c.why, c.x + 28, y, 384, 27, 19, '400', C.sub);
});

panelBox(ctx, 80, 760, 1400, 96, C.panel, C.panelBorder, 14);
textCentered(ctx, 'Wet tests point; instruments confirm. IR spectroscopy and mass spectrometry give the definitive fingerprint,', 780, 792, 1340, 20, '600');
textCentered(ctx, 'and chromatography checks whether the sample is one substance or several.', 780, 824, 1340, 20, '600');

save('a29-functional-groups.png', canvas);