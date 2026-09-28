// Diagram 5 — gas chromatography: instrument schematic and chromatogram.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, arrow, peak, setFont, lead } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 960);
title(ctx, 1560, 'Gas chromatography', 'A carrier gas sweeps a volatile mixture through a hot column — each component exits at its own time');

// ---------- Schematic chain ----------
panelBox(ctx, 80, 150, 1400, 280, C.panel, C.panelBorder, 18);
textCentered(ctx, 'THE INSTRUMENT', 780, 188, 600, 22, '700', C.accent);

// Carrier gas cylinder
panelBox(ctx, 120, 240, 170, 120, C.accent2Soft, '#bae6fd', 14);
textCentered(ctx, 'Carrier gas', 205, 286, 150, 19, '700');
textCentered(ctx, 'He or N₂ — unreactive', 205, 316, 150, 16, '400', C.sub);
arrow(ctx, 290, 300, 340, 300);

// Injector
panelBox(ctx, 340, 240, 130, 120, C.amberSoft, '#fde68a', 14);
textCentered(ctx, 'Injector', 405, 286, 110, 19, '700');
textCentered(ctx, 'sample in', 405, 316, 110, 16, '400', C.sub);
arrow(ctx, 470, 300, 520, 300);

// Oven with coiled column
panelBox(ctx, 520, 210, 560, 200, '#fff7ed', '#fdba74', 18);
textCentered(ctx, 'OVEN — temperature-controlled', 800, 238, 520, 18, '700');
for (let i = 0; i < 9; i++) {
  ctx.beginPath();
  ctx.arc(575 + i * 52, 305, 26, 0, Math.PI * 2);
  ctx.lineWidth = 4;
  ctx.strokeStyle = C.accent;
  ctx.stroke();
}
textCentered(ctx, 'coiled capillary column: a thin liquid film (stationary phase) coats the inside of the tubing', 800, 380, 540, 17, '400', C.sub);
arrow(ctx, 1080, 300, 1130, 300);

// Detector
panelBox(ctx, 1130, 240, 150, 120, C.okSoft, '#bbf7d0', 14);
textCentered(ctx, 'Detector', 1205, 286, 130, 19, '700');
textCentered(ctx, 'signal to recorder', 1205, 316, 130, 16, '400', C.sub);
arrow(ctx, 1280, 300, 1330, 300);
panelBox(ctx, 1330, 240, 130, 120, C.pinkSoft, '#fbcfe8', 14);
textCentered(ctx, 'Chromatogram', 1395, 286, 110, 17, '700');
textCentered(ctx, 'peaks vs time', 1395, 316, 110, 16, '400', C.sub);

// ---------- Chromatogram ----------
panelBox(ctx, 80, 460, 1400, 420, '#ffffff', C.panelBorder, 18);
textCentered(ctx, 'THE CHROMATOGRAM: RETENTION TIME = IDENTITY, PEAK AREA = AMOUNT', 780, 496, 1300, 20, '700', C.accent);

const ox = 180, oy = 820, xAxisEnd = 1420, yAxisTop = 545;
ctx.strokeStyle = C.ink;
ctx.lineWidth = 3;
ctx.beginPath(); ctx.moveTo(ox, yAxisTop); ctx.lineTo(ox, oy); ctx.lineTo(xAxisEnd, oy); ctx.stroke();
// y-axis label
ctx.save();
ctx.translate(120, 680);
ctx.rotate(-Math.PI / 2);
textCentered(ctx, 'detector response', 0, 0, 300, 18, '600');
ctx.restore();
textCentered(ctx, 'retention time / min', (ox + xAxisEnd) / 2, 856, 300, 18, '600');
// x ticks: 0 - 6.5 min across 1240 px
const tmax = 6.5;
const tx = (t) => ox + (t / tmax) * (xAxisEnd - ox);
for (let t = 0; t <= 6; t++) {
  ctx.beginPath();
  ctx.moveTo(tx(t), oy); ctx.lineTo(tx(t), oy + 8);
  ctx.lineWidth = 2; ctx.strokeStyle = C.ink; ctx.stroke();
  textCentered(ctx, String(t), tx(t), oy + 24, 40, 15, '400', C.sub);
}

// Peaks
const peaks = [
  { t: 1.4, h: 175, w: 42, name: 'A', fill: C.accentSoft, stroke: '#c7d2fe' },
  { t: 2.6, h: 250, w: 46, name: 'B', fill: '#ddd6fe', stroke: '#a78bfa' },
  { t: 4.8, h: 140, w: 48, name: 'C', fill: C.accent2Soft, stroke: '#7dd3fc' },
];
peaks.forEach((p) => {
  peak(ctx, tx(p.t), oy, p.h, p.w, p.fill, p.stroke);
  textCentered(ctx, p.name, tx(p.t), oy - p.h - 46, 60, 20, '700', C.ink);
  textCentered(ctx, p.t.toFixed(1) + ' min', tx(p.t), oy - p.h - 22, 90, 16, '600', C.sub);
});

textLeft(ctx, 'Each component reaches the detector at a characteristic retention time — like an Rf value,', 560, 600, 500, 18, '400', C.sub);
textLeft(ctx, 'but measured in time. Peak B is the largest: most of the mixture is component B.', 560, 630, 500, 18, '400', C.sub);
textLeft(ctx, 'Only components that are volatile and heat-stable survive the oven.', 560, 660, 500, 18, '400', C.sub);

save('a29-gc.png', canvas);