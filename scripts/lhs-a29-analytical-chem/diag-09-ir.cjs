// Diagram 9 — infrared spectroscopy: spectrum shape and the key absorptions.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, chip, lead, dashedLine } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 960);
title(ctx, 1560, 'Infrared spectroscopy', 'Bonds vibrate, and each vibration absorbs a characteristic wavenumber');

// ---------- Spectrum ----------
panelBox(ctx, 80, 150, 1400, 450, '#ffffff', C.panelBorder, 18);
const X = (w) => 180 + ((4000 - w) / 3500) * 1200; // 4000 → x=180, 500 → x=1380
const ox = 180, oy = 560;
ctx.strokeStyle = C.ink;
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(ox, 210);
ctx.lineTo(ox, oy);
ctx.lineTo(1380, oy);
ctx.stroke();
textCentered(ctx, 'wavenumber / cm⁻¹', 780, 588, 300, 17, '600');
ctx.save();
ctx.translate(130, 400);
ctx.rotate(-Math.PI / 2);
textCentered(ctx, '% transmittance', 0, 0, 260, 17, '600');
ctx.restore();
[4000, 3000, 2000, 1000, 500].forEach((w) => {
  ctx.beginPath();
  ctx.moveTo(X(w), oy); ctx.lineTo(X(w), oy + 8);
  ctx.lineWidth = 2; ctx.stroke();
  textCentered(ctx, String(w), X(w), oy + 26, 80, 15, '400', C.sub);
});
textCentered(ctx, '100', 148, 220, 50, 14, '400', C.sub);

// the trace: baseline near top, troughs downward
ctx.strokeStyle = C.accent;
ctx.lineWidth = 3.5;
ctx.beginPath();
ctx.moveTo(X(4000), 235);
// broad O-H basin 3600-3000, deepest at 3300
ctx.bezierCurveTo(X(3600), 245, X(3450), 470, X(3300), 480);
ctx.bezierCurveTo(X(3150), 490, X(3050), 400, X(3000), 330);
// C-H dips just below 3000
ctx.bezierCurveTo(X(2960), 315, X(2940), 330, X(2920), 322);
ctx.bezierCurveTo(X(2870), 310, X(2840), 340, X(2800), 325);
// flat region
ctx.lineTo(X(2100), 318);
// sharp C=O at 1700
ctx.bezierCurveTo(X(1850), 318, X(1780), 500, X(1700), 510);
ctx.bezierCurveTo(X(1620), 498, X(1600), 330, X(1500), 326);
// fingerprint wiggles
for (let w = 1500; w > 520; w -= 60) {
  const depth = (Math.sin(w / 37) + 1) * 18;
  ctx.quadraticCurveTo(X(w + 30), 326 - depth - 25, X(w), 328);
}
ctx.lineTo(X(500), 326);
ctx.stroke();

// trough chips + leads
chip(ctx, 'O–H', X(3330), 590, 120, C.accentSoft, C.accent);
lead(ctx, X(3330), 572, X(3300), 480);
chip(ctx, 'C–H', X(2890), 435, 120, C.accentSoft, C.accent);
lead(ctx, X(2890), 417, X(2880), 340);
chip(ctx, 'C=O', X(1700), 590, 120, C.warnSoft, C.warn);
lead(ctx, X(1700), 572, X(1700), 512);
chip(ctx, 'fingerprint region', X(1000), 590, 260, '#f1f5f9', C.sub);
lead(ctx, X(1000), 572, X(1050), 350);

// ---------- Key absorption cards ----------
const cards = [
  {
    t: 'O–H (ALCOHOL)  3200–3600 cm⁻¹', f: C.accentSoft, s: '#c7d2fe',
    b: 'Broad, rounded trough. Hydrogen bonding between molecules smears the absorption across a wide band — the shape alone hints "alcohol".',
  },
  {
    t: 'C=O (CARBONYL)  1650–1750 cm⁻¹', f: C.warnSoft, '#fecaca',
    b: 'Sharp, strong and narrow — the single most reliable peak in organic IR. Present in aldehydes, ketones, carboxylic acids and esters.',
  },
  {
    t: 'C–H  2850–3000 cm⁻¹', f: C.amberSoft, '#fde68a',
    b: 'Modest dips just below 3000. Nearly every organic compound shows them — useful as a landmark, useless for identification alone.',
  },
];
cards.forEach((c, i) => {
  const x = 80 + i * 480;
  panelBox(ctx, x, 630, 440, 230, c.f, c.s, 16);
  textCentered(ctx, c.t, x + 220, 664, 400, 20, '700');
  paragraph(ctx, c.b, x + 28, 700, 384, 26, 18, '400');
});

panelBox(ctx, 80, 880, 1400, 56, C.panel, C.panelBorder, 12);
textCentered(ctx, 'Convention: the x-axis runs backwards — 4000 cm⁻¹ on the left, 500 on the right. A spectrum is a set of bond fingerprints, not a molecule picture.', 780, 908, 1340, 18, '600');

save('a29-ir.png', canvas);