// Diagram 7 — the compound light microscope, labelled.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, lead, textLeft } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 940);
title(ctx, 1560, 'The compound light microscope', 'Light passes through the stained section; two lenses in series produce the magnified image');

// Draw microscope schematic (left, large)
const cx = 400;
// eyepiece
ctx.fillStyle = '#e0e7ff'; ctx.fillRect(cx - 30, 170, 60, 90);
ctx.lineWidth = 3; ctx.strokeStyle = C.accent; ctx.strokeRect(cx - 30, 170, 60, 90);
// body tube
ctx.fillStyle = '#eef2ff'; ctx.fillRect(cx - 20, 260, 40, 200);
ctx.strokeStyle = C.accent; ctx.strokeRect(cx - 20, 260, 40, 200);
// objective turret
ctx.fillStyle = '#c7d2fe'; ctx.fillRect(cx - 55, 460, 110, 34); ctx.strokeRect(cx - 55, 460, 110, 34);
ctx.fillStyle = '#4f46e5';
ctx.fillRect(cx - 45, 494, 18, 40); ctx.fillRect(cx - 9, 494, 18, 40); ctx.fillRect(cx + 27, 494, 18, 40);
// stage
ctx.fillStyle = '#94a3b8'; ctx.fillRect(cx - 130, 540, 260, 22); ctx.strokeRect(cx - 130, 540, 260, 22);
// slide on stage
ctx.fillStyle = '#ffffff'; ctx.fillRect(cx - 70, 532, 140, 8); ctx.strokeStyle = '#075985'; ctx.strokeRect(cx - 70, 532, 140, 8);
// condenser
ctx.fillStyle = '#bae6fd'; ctx.fillRect(cx - 40, 566, 80, 26); ctx.strokeStyle = '#075985'; ctx.strokeRect(cx - 40, 566, 80, 26);
// illuminator
ctx.fillStyle = '#fde68a'; ctx.fillRect(cx - 50, 620, 100, 40); ctx.strokeStyle = '#d97706'; ctx.strokeRect(cx - 50, 620, 100, 40);
textCentered(ctx, 'light', cx, 640, 90, 15, '700', '#92400e');
// focus knobs + arm + base
ctx.fillStyle = '#cbd5e1'; ctx.fillRect(cx + 30, 300, 50, 44); ctx.strokeRect(cx + 30, 300, 50, 44);
ctx.fillStyle = '#cbd5e1'; ctx.fillRect(cx + 22, 380, 66, 34); ctx.strokeRect(cx + 22, 380, 66, 34);
ctx.fillStyle = '#94a3b8'; ctx.fillRect(cx - 170, 690, 340, 30); ctx.strokeRect(cx - 170, 690, 340, 30);
// light path arrow
ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 3; ctx.setLineDash([9, 7]);
ctx.beginPath(); ctx.moveTo(cx, 612); ctx.lineTo(cx, 300); ctx.stroke(); ctx.setLineDash([]);

// Labels with leader lines
const labels = [
  ['Eyepiece (ocular) lens \u2014 \u00d710 typical', cx + 30, 200, cx + 100, 200],
  ['Body tube', cx + 20, 300, cx + 120, 300],
  ['Coarse focus knob', cx + 80, 322, cx + 150, 322],
  ['Fine focus knob', cx + 88, 397, cx + 150, 397],
  ['Objective lenses (\u00d74, \u00d710, \u00d740, \u00d7100)', cx - 55, 510, cx - 120, 510],
  ['Stage \u2014 holds the slide', cx - 130, 548, cx - 200, 548],
  ['Condenser \u2014 focuses light onto the section', cx + 40, 578, cx + 140, 578],
  ['Illuminator (light source)', cx + 50, 640, cx + 140, 640],
];
labels.forEach(([text, lx, ly, tx, ty]) => {
  lead(ctx, tx, ty, lx + (tx > lx ? -6 : 6), ly, C.sub);
  textLeft(ctx, text, lx + (tx > lx ? -6 : 6) + (tx > lx ? -8 : 8), ly, 260, 15, '600', C.ink);
});

// Right panels: how it works + magnification
panelBox(ctx, 880, 170, 610, 250, C.accentSoft, '#c7d2fe', 16);
textCentered(ctx, 'Two lenses in series', 1185, 210, 560, 22, '700', C.accent);
let y = 255;
y = paragraph(ctx, 'The objective lens forms a magnified real image of the section; the eyepiece lens magnifies that image again. Because two stages of magnification compound, total magnification is their product:', 910, y, 550, 28, 17.5) + 12;
paragraph(ctx, 'total magnification = eyepiece \u00d7 objective', 910, y + 14, 550, 22, '700', C.ink);
textCentered(ctx, 'e.g. \u00d710 eyepiece \u00d7 \u00d740 objective = \u00d7400', 1185, y + 60, 560, 19, '600', C.sub);

panelBox(ctx, 880, 450, 610, 250, C.panel, C.panelBorder, 16);
textCentered(ctx, 'Resolution limits what magnification can show', 1185, 490, 560, 21, '700');
let y2 = 535;
y2 = paragraph(ctx, 'Resolution is the smallest distance at which two points can still be seen as separate. Light itself limits a light microscope to about 0.2 \u00b5m.', 910, y2, 550, 28, 17) + 12;
y2 = paragraph(ctx, 'Beyond about \u00d71500, more magnification makes the image bigger but no clearer \u2014 it is empty magnification.', 910, y2, 550, 28, 17);
paragraph(ctx, 'For finer detail than light allows, electron microscopes are needed.', 910, y2 + 14, 550, 24, 16, '400', C.sub);

save('a28-light-microscope.png', canvas);