// A2 6 Figure 8 — sterilisation, disinfection and antisepsis.
const common = require('./common.cjs');
const { C, makeCanvas, title, save, textCentered, textLeft, paragraph, panelBox, roundRect } = common;

const { canvas, ctx } = makeCanvas(980, 620);
title(ctx, 980, 'Controlling microorganisms outside the body', 'Three levels of chemical and physical control, from harshest to gentlest');

const cols = [
  {
    head: 'STERILISATION', fill: '#eef2ff', stroke: '#c7d2fe', headCol: '#4338ca',
    target: 'Kills or removes ALL microbial life, including spores and viruses.',
    where: 'Surgical instruments, culture media, dressings \u2014 anything that must be truly microbe-free.',
    ex: 'Autoclaving: steam at 121 \u00b0C, 15 minutes above atmospheric pressure. Also irradiation, filtration.',
  },
  {
    head: 'DISINFECTION', fill: C.warnSoft, stroke: '#fecaca', headCol: '#b91c1c',
    target: 'Destroys most pathogens on non-living surfaces and objects \u2014 not necessarily spores.',
    where: 'Workbenches, floors, sinks, equipment, door handles.',
    ex: 'Bleach (sodium hypochlorite), 70% alcohol sprays, boiling water.',
  },
  {
    head: 'ANTISEPSIS', fill: C.okSoft, stroke: '#bbf7d0', headCol: '#15803d',
    target: 'Chemicals mild enough for living tissue that still reduce microbial numbers.',
    where: 'Skin before an injection or operation, wounds, surgeons\u2019 hands.',
    ex: 'Iodine solution, chlorhexidine handwash, alcohol hand rub.',
  },
];

cols.forEach((c, i) => {
  const x = 60 + i * 295, w = 275, y = 130, h = 330;
  panelBox(ctx, x, y, w, h, c.fill, c.stroke, 14);
  textCentered(ctx, c.head, x + w / 2, y + 30, w - 20, 21, '700', c.headCol);
  textCentered(ctx, c.target, x + w / 2, y + 62, w - 30, 16, '700', C.ink);
  paragraph(ctx, 'WHERE', x + 18, y + 104, w - 36, 20, 15, '700', c.headCol);
  paragraph(ctx, c.where, x + 18, y + 128, w - 36, 21, 16, '400', C.ink);
  paragraph(ctx, 'EXAMPLES', x + 18, y + 200, w - 36, 20, 15, '700', c.headCol);
  paragraph(ctx, c.ex, x + 18, y + 224, w - 36, 21, 16, '400', C.ink);
});

// Gradient arrow: increasing harshness -> decreasing tissue safety.
const gy = 480;
ctx.strokeStyle = C.sub; ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(80, gy + 26); ctx.lineTo(900, gy + 26); ctx.stroke();
ctx.fillStyle = C.sub;
ctx.beginPath();
ctx.moveTo(914, gy + 26); ctx.lineTo(898, gy + 19); ctx.lineTo(898, gy + 33);
ctx.closePath(); ctx.fill();
textLeft(ctx, 'kills more kinds of life \u2014 but safe on fewer and fewer surfaces', 120, gy + 52, 700, 17, '600', C.sub);

// Bottom: -cidal vs -static vocabulary.
panelBox(ctx, 60, 540, 860, 62, C.panel, C.panelBorder, 12);
textCentered(ctx, 'Suffix vocabulary:  -cidal means it KILLS (bactericidal, virucidal, sporicidal)  \u2014  -static means it merely STOPS growth while the agent is present (bacteriostatic), so numbers recover when it is removed.', 490, 571, 830, 17, '600', C.sub);

save('a26-control.png', canvas);
module.exports = common;