// Diagram 6 — H&E staining: haematoxylin and eosin and what each colours.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, lead } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 860);
title(ctx, 1560, 'Haematoxylin and eosin: the gold-standard stain', 'Unstained tissue is almost transparent — H&E turns nuclei blue-purple and cytoplasm pink-red');

// Left panel: the two dyes
panelBox(ctx, 70, 160, 660, 330, C.heBlue, '#5b6ee1', 16);
ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(140, 235, 38, 0, Math.PI * 2); ctx.fill();
textCentered(ctx, 'H', 140, 236, 60, 26, '700', C.heBlue);
textLeft(ctx, 'HAEMATOXYLIN — a basic dye', 195, 220, 500, 21, '700', '#ffffff');
textLeft(ctx, 'Binds to acidic structures', 195, 250, 500, 17, '400', '#e0e7ff');
textLeft(ctx, 'Nuclei (rich in acidic DNA) stain blue-purple', 195, 278, 500, 17, '400', '#e0e7ff');
ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(140, 360, 38, 0, Math.PI * 2); ctx.fill();
textCentered(ctx, 'E', 140, 361, 60, 26, '700', C.warn);
textLeft(ctx, 'EOSIN — an acidic dye', 195, 345, 500, 21, '700', '#ffffff');
textLeft(ctx, 'Binds to basic structures', 195, 375, 500, 17, '400', '#fee2e2');
textLeft(ctx, 'Cytoplasm and connective tissue stain pink-red', 195, 403, 500, 17, '400', '#fee2e2');
paragraph(ctx, 'Acidic dye + basic tissue, basic dye + acidic tissue — opposite charges attract.', 100, 455, 600, 24, 17, '700', '#ffffff');

// Right panel: stained-tissue schematic
panelBox(ctx, 780, 160, 710, 330, '#ffffff', C.panelBorder, 16);
textCentered(ctx, 'A stained section as seen down the microscope', 1135, 195, 660, 20, '700');
// draw a row of "cells": pink cytoplasm blobs with purple nuclei
const cells = [
  [860, 260, 1], [950, 250, 0.9], [1040, 265, 1.1], [1130, 250, 0.95], [1220, 262, 1.05], [1310, 250, 0.9], [1400, 264, 1],
];
cells.forEach(([x, y, s]) => {
  ctx.fillStyle = '#fdeef0';
  ctx.beginPath(); ctx.ellipse(x, y + 40 * s, 42 * s, 34 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 2; ctx.strokeStyle = C.hePink; ctx.stroke();
  ctx.fillStyle = '#5b6ee1';
  ctx.beginPath(); ctx.ellipse(x, y + 38 * s, 16 * s, 12 * s, 0.2, 0, Math.PI * 2); ctx.fill();
});
lead(ctx, 850, 210, 905, 243, C.heBlue);
textLeft(ctx, 'nuclei blue-purple', 848, 205, 300, 15, '600', C.heBlue);
lead(ctx, 1330, 330, 1360, 300, C.warn);
textLeft(ctx, 'cytoplasm pink-red', 1245, 345, 300, 15, '600', C.warn);
paragraph(ctx, 'The colour contrast is what makes tissue architecture readable: cell shapes, layering and any invasion by abnormal cells all become visible.', 810, 420, 650, 26, 16.5, '400', C.sub);

// Bottom: routine and special stains
panelBox(ctx, 70, 530, 700, 280, C.panel, C.panelBorder, 14);
textCentered(ctx, 'H&E is the routine stain', 420, 568, 640, 21, '700');
let y1 = 612;
y1 = paragraph(ctx, 'It is quick, reliable and shows general anatomy, so nearly every specimen is stained with H&E first — a pathologist reads the H&E section before deciding whether anything more is needed.', 110, y1, 620, 28, 17) + 12;
paragraph(ctx, 'Counterstain logic: eosin is the counterstain that colours everything haematoxylin did not.', 110, y1, 620, 26, 16.5, '400', C.sub);

panelBox(ctx, 800, 530, 690, 280, C.amberSoft, '#fde68a', 14);
textCentered(ctx, 'Special stains answer specific questions', 1145, 568, 630, 21, '700');
let y2 = 612;
y2 = paragraph(ctx, '\u2022  Periodic acid\u2013Schiff (PAS) highlights carbohydrates and certain fungi.', 840, y2, 630, 26, 16.5) + 6;
y2 = paragraph(ctx, '\u2022  Perls\u2019 Prussian blue stains iron deposits.', 840, y2, 630, 26, 16.5) + 6;
y2 = paragraph(ctx, '\u2022  Ziehl\u2013Neelsen stains acid-fast bacteria such as TB.', 840, y2, 630, 26, 16.5) + 6;
paragraph(ctx, 'Each special stain is chosen when the H&E picture raises a question it can answer.', 840, y2, 630, 26, 16.5, '600', '#92400e');

save('a28-he-stain.png', canvas);