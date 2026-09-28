// Diagram 6 — HPLC schematic and the comparison of chromatographic techniques.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, arrow } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 960);
title(ctx, 1560, 'High-performance liquid chromatography', 'The same partition logic as TLC and GC — but the liquid is pushed, not waited for');

// ---------- Schematic chain ----------
panelBox(ctx, 80, 150, 1400, 290, C.panel, C.panelBorder, 18);
textCentered(ctx, 'THE INSTRUMENT', 780, 188, 600, 22, '700', C.accent);

// Solvent reservoirs
panelBox(ctx, 110, 250, 130, 130, C.accent2Soft, '#bae6fd', 14);
textCentered(ctx, 'Solvents', 175, 292, 110, 18, '700');
textCentered(ctx, 'A + B mixed', 175, 320, 110, 15, '400', C.sub);
textCentered(ctx, 'mobile phase', 175, 348, 110, 15, '400', C.sub);
arrow(ctx, 240, 315, 285, 315);

// Pump
panelBox(ctx, 285, 250, 140, 130, C.warnSoft, '#fecaca', 14);
textCentered(ctx, 'High-pressure', 355, 292, 120, 18, '700');
textCentered(ctx, 'pump', 355, 315, 120, 18, '700');
textCentered(ctx, 'forces liquid on', 355, 348, 120, 15, '400', C.sub);
arrow(ctx, 425, 315, 470, 315);

// Injector
panelBox(ctx, 470, 250, 120, 130, C.amberSoft, '#fde68a', 14);
textCentered(ctx, 'Injector', 530, 292, 100, 18, '700');
textCentered(ctx, 'sample in', 530, 320, 100, 15, '400', C.sub);
arrow(ctx, 590, 315, 635, 315);

// Column
panelBox(ctx, 635, 210, 520, 200, '#fff7ed', '#fdba74', 18);
textCentered(ctx, 'COLUMN', 895, 240, 480, 18, '700');
ctx.fillStyle = '#eef2ff';
ctx.strokeStyle = C.accent;
ctx.lineWidth = 3;
ctx.fillRect(670, 285, 450, 42);
ctx.strokeRect(670, 285, 450, 42);
ctx.fillStyle = C.accent2;
for (let i = 0; i < 22; i++) {
  ctx.beginPath();
  ctx.arc(686 + i * 19.5, 306, 5, 0, Math.PI * 2);
  ctx.fill();
}
textCentered(ctx, 'packed with tiny particles — the stationary phase', 895, 356, 480, 17, '400', C.sub);
textCentered(ctx, 'separation happens as components swap between liquid and particles', 895, 384, 480, 17, '400', C.sub);
arrow(ctx, 1155, 315, 1200, 315);

// Detector
panelBox(ctx, 1200, 250, 130, 130, C.okSoft, '#bbf7d0', 14);
textCentered(ctx, 'UV detector', 1265, 292, 110, 18, '700');
textCentered(ctx, '+ recorder', 1265, 320, 110, 15, '400', C.sub);
textCentered(ctx, 'waste collected', 1265, 348, 110, 15, '400', C.sub);
arrow(ctx, 1330, 315, 1375, 315);
panelBox(ctx, 1375, 250, 85, 130, C.pinkSoft, '#fbcfe8', 14);
textCentered(ctx, 'Trace', 1417, 300, 70, 16, '700');
textCentered(ctx, 'peaks', 1417, 325, 70, 15, '400', C.sub);

// ---------- Comparison table ----------
panelBox(ctx, 80, 470, 1400, 420, '#ffffff', C.panelBorder, 18);
textCentered(ctx, 'THE THREE TECHNIQUES AT A GLANCE', 780, 508, 800, 22, '700', C.accent);

const colX = [80, 560, 1040];
const rowY = 545;
// headers
const heads = [
  { t: 'THIN-LAYER (TLC)', f: C.accentSoft, s: '#c7d2fe' },
  { t: 'GAS (GC)', f: C.amberSoft, s: '#fde68a' },
  { t: 'HPLC', f: C.okSoft, s: '#bbf7d0' },
];
heads.forEach((h, i) => {
  panelBox(ctx, colX[i] + 10, rowY, 430, 54, h.f, h.s, 12);
  textCentered(ctx, h.t, colX[i] + 225, rowY + 27, 400, 20, '700');
});
const rowsData = [
  ['Stationary phase', 'thin layer of silica on a plate', 'liquid film coating a coiled capillary in an oven', 'tiny particles packed in a steel column'],
  ['Mobile phase', 'liquid solvent rising by capillary action', 'unreactive carrier gas (He or N₂)', 'liquid solvent forced through at high pressure'],
  ['Identification', 'Rf value vs a standard on the same plate', 'retention time', 'retention time'],
  ['Best for', 'quick, cheap, qualitative checks', 'volatile, heat-stable mixtures', 'non-volatile or heat-sensitive compounds — pharmaceuticals and biological molecules'],
];
let yy = rowY + 66;
const rowHeights = [62, 62, 44, 96];
rowsData.forEach((r, ri) => {
  textLeft(ctx, r[0], 100, yy + 8, 190, 16, '700', C.accent);
  r.slice(1).forEach((cell, i) => {
    paragraph(ctx, cell, colX[i + 1] + 30, yy + 8, 390, 24, 17, '400');
  });
  yy += rowHeights[ri];
  if (ri < rowsData.length - 1) {
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(100, yy - 4);
    ctx.lineTo(1460, yy - 4);
    ctx.stroke();
  }
});

save('a29-hplc.png', canvas);