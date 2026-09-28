// Diagram 8 — magnification, image size and actual size: the calculation triangle.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, arrow, lead, dashedLine } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 860);
title(ctx, 1560, 'Working with magnification', 'Image size = actual size \u00d7 magnification — one relationship, three rearrangements');

// Triangle (left)
panelBox(ctx, 70, 160, 560, 400, C.accentSoft, '#c7d2fe', 16);
const tx = 350, ty = 490;
ctx.fillStyle = '#ffffff';
ctx.beginPath(); ctx.moveTo(tx, ty - 200); ctx.lineTo(tx - 200, ty); ctx.lineTo(tx + 200, ty); ctx.closePath(); ctx.fill();
ctx.lineWidth = 3; ctx.strokeStyle = C.accent; ctx.stroke();
// dividers
ctx.beginPath(); ctx.moveTo(tx - 78, ty - 52); ctx.lineTo(tx + 78, ty - 52); ctx.stroke();
ctx.beginPath(); ctx.moveTo(tx, ty - 52); ctx.lineTo(tx, ty); ctx.stroke();
textCentered(ctx, 'IMAGE SIZE', tx, ty - 90, 200, 20, '700', C.accent);
textCentered(ctx, 'ACTUAL', tx - 100, ty - 26, 150, 18, '700', C.ink);
textCentered(ctx, 'MAGNIFICATION', tx + 100, ty - 26, 150, 18, '700', C.ink);
textCentered(ctx, 'I = A \u00d7 M', 350, 620, 560, 22, '700', C.ink);
textCentered(ctx, 'A = I \u00f7 M        M = I \u00f7 A', 350, 660, 560, 20, '600', C.sub);

// Right: worked example panel
panelBox(ctx, 680, 160, 810, 400, '#ffffff', C.panelBorder, 16);
textCentered(ctx, 'Worked example, illustrated', 1085, 200, 760, 22, '700');
// drawing of a measured cell image
const ix = 780, iy = 260;
ctx.fillStyle = C.hePink;
ctx.beginPath(); ctx.ellipse(ix + 130, iy + 60, 150, 52, 0, 0, Math.PI * 2); ctx.fill();
ctx.lineWidth = 2; ctx.strokeStyle = '#9d174d'; ctx.stroke();
ctx.fillStyle = C.heBlue;
ctx.beginPath(); ctx.ellipse(ix + 110, iy + 55, 52, 24, 0.2, 0, Math.PI * 2); ctx.fill();
// measurement rule across the cell
arrow(ctx, ix - 30, iy + 140, ix + 290, iy + 140, 2.5, C.ink);
ctx.lineWidth = 2; ctx.strokeStyle = C.ink;
ctx.beginPath(); ctx.moveTo(ix - 30, iy + 130); ctx.lineTo(ix - 30, iy + 150); ctx.stroke();
ctx.beginPath(); ctx.moveTo(ix + 290, iy + 130); ctx.lineTo(ix + 290, iy + 150); ctx.stroke();
textCentered(ctx, 'image of the cell measured 24 mm across', ix + 130, iy + 165, 400, 17, '600', C.ink);
// steps
let sy = iy + 210;
sy = paragraph(ctx, 'A cell photographed down a \u00d7400 microscope measures 24 mm on the print.', 720, sy - 20, 730, 27, 17) + 10;
sy = paragraph(ctx, 'Actual size = image size \u00f7 magnification = 24 mm \u00f7 400 = 0.06 mm.', 720, sy, 730, 27, 17) + 8;
sy = paragraph(ctx, 'Convert to micrometres: 0.06 mm \u00d7 1000 = 60 \u00b5m — a typical human cell.', 720, sy, 730, 27, 17) + 8;
paragraph(ctx, 'Always give the size in \u00b5m or mm with the unit stated, and check the answer is plausible: cells are tens of \u00b5m, never centimetres.', 720, sy, 730, 27, 16.5, '400', C.sub);

// Bottom: unit conversion strip + scale bar
panelBox(ctx, 70, 600, 700, 200, C.panel, C.panelBorder, 14);
textCentered(ctx, 'Unit ladder (know both directions)', 420, 638, 640, 21, '700');
textCentered(ctx, '1 mm = 1000 \u00b5m          1 \u00b5m = 0.001 mm          1 mm = 10\u207b\u00b3 m', 420, 685, 640, 20, '600', C.ink);
paragraph(ctx, 'Converting a magnified measurement down to real size almost always ends in \u00b5m \u2014 the working unit of histology.', 120, 725, 600, 26, 16.5, '400', C.sub);

panelBox(ctx, 800, 600, 690, 200, C.accent2Soft, '#bae6fd', 14);
textCentered(ctx, 'Scale bars', 1145, 638, 630, 21, '700', '#075985');
arrow(ctx, 900, 680, 1150, 680, 3, '#075985');
textCentered(ctx, '50 \u00b5m', 1025, 705, 200, 17, '700', '#075985');
paragraph(ctx, 'A scale bar drawn on a micrograph states the real length it represents, so the image can be read at any print size without any calculation.', 840, 735, 610, 26, 16.5);

save('a28-magnification.png', canvas);