// Diagram 10 — benign versus malignant tumours.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, arrow, lead, dashedLine } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 900);
title(ctx, 1560, 'Benign versus malignant tumours', 'Both are new growths of cells; only the malignant ones invade and spread');

// Left: benign
panelBox(ctx, 70, 160, 660, 380, C.okSoft, '#bbf7d0', 16);
textCentered(ctx, 'BENIGN', 400, 200, 600, 26, '700', C.ok);
// tissue block with a smooth encapsulated lump
ctx.fillStyle = '#fee2e2'; roundTissue(120, 240, 560, 260, '#fca5a5');
(function drawBenign() {
  ctx.fillStyle = '#fbcfe8';
  ctx.beginPath(); ctx.ellipse(400, 370, 110, 78, 0, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = '#be185d'; ctx.stroke();
  ctx.setLineDash([8, 6]); ctx.strokeStyle = '#9d174d';
  ctx.beginPath(); ctx.ellipse(400, 370, 126, 92, 0, 0, Math.PI * 2); ctx.stroke(); ctx.setLineDash([]);
})();
lead(ctx, 470, 300, 540, 265, '#be185d');
textCentered(ctx, 'capsule', 555, 255, 120, 15, '600', '#9d174d');
paragraph(ctx, 'Grows slowly, stays in one place, and is surrounded by a capsule of connective tissue. Cells resemble their tissue of origin. It presses on nearby structures but does not invade them \u2014 and almost never spreads. Usually curable by surgical removal alone.', 110, 515 - 30 + 6, 600, 27, 17);

// Right: malignant
panelBox(ctx, 830, 160, 660, 380, C.warnSoft, '#fecaca', 16);
textCentered(ctx, 'MALIGNANT (CANCER)', 1160, 200, 600, 26, '700', C.warn);
(function drawMalignant() {
  ctx.fillStyle = '#fee2e2'; roundTissue(880, 240, 560, 260, '#fca5a5');
  ctx.fillStyle = '#ef4444';
  ctx.beginPath(); ctx.ellipse(1160, 370, 96, 70, 0, 0, Math.PI * 2); ctx.fill();
  // invasive fingers
  for (let k = 0; k < 7; k++) {
    const ang = -0.9 + k * 0.45;
    ctx.beginPath();
    ctx.moveTo(1160 + 70 * Math.cos(ang), 370 + 52 * Math.sin(ang));
    ctx.quadraticCurveTo(1160 + 130 * Math.cos(ang), 370 + 95 * Math.sin(ang), 1160 + 168 * Math.cos(ang), 370 + 122 * Math.sin(ang));
    ctx.lineWidth = 10; ctx.strokeStyle = '#ef4444'; ctx.lineCap = 'round'; ctx.stroke();
  }
  // metastasis
  ctx.beginPath(); ctx.ellipse(1290, 300, 22, 16, 0, 0, Math.PI * 2); ctx.fillStyle = '#ef4444'; ctx.fill();
  dashedLine(ctx, 1230, 348, 1273, 308, '#991b1b', 2.5);
})();
lead(ctx, 1240, 296, 1300, 265, '#991b1b');
textCentered(ctx, 'metastasis \u2014 cells break away and seed elsewhere', 1210, 250, 360, 14.5, '600', '#991b1b');
paragraph(ctx, 'Grows quickly and invades through the tissue capsule into surrounding structures; cells differ from their tissue of origin and divide uncontrollably. Fragments enter blood or lymph vessels and form secondary tumours (metastases) elsewhere. Requires surgery plus radiotherapy or chemotherapy, and can recur after treatment.', 870, 515 - 30 + 6, 600, 27, 17);

function roundTissue(x, y, w, h, stroke) {
  roundTissueRect(x, y, w, h, 20);
  ctx.lineWidth = 3; ctx.strokeStyle = stroke; ctx.stroke();
}
function roundTissueRect(x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

// Bottom: the two routes of spread
panelBox(ctx, 70, 580, 700, 260, C.panel, C.panelBorder, 14);
textCentered(ctx, 'How malignancy spreads', 420, 618, 640, 21, '700');
let y = 660;
y = paragraph(ctx, '\u2022  DIRECT SPREAD \u2014 the tumour grows outward into neighbouring organs and tissues.', 110, y, 640, 27, 16.5) + 8;
y = paragraph(ctx, '\u2022  METASTASIS \u2014 cells break away, travel in blood or lymph, and seed secondary tumours in distant sites such as liver, lung, bone or brain.', 110, y, 640, 27, 16.5) + 8;
paragraph(ctx, 'Metastasis is what makes malignancy dangerous: a tumour that has spread can no longer be cured by surgery alone.', 110, y, 640, 26, 16, '600', C.ink);

panelBox(ctx, 800, 580, 690, 260, C.accentSoft, '#c7d2fe', 14);
textCentered(ctx, 'Why histopathology decides it', 1145, 618, 630, 21, '700', C.accent);
let y2 = 660;
y2 = paragraph(ctx, 'A pathologist reading the H&E section sees the tumour\u2019s cells, its edge, and whether the margin of excision is clear of malignant cells.', 840, y2, 630, 27, 16.5) + 10;
y2 = paragraph(ctx, 'That single report answers: is it benign or malignant, what type is it, and has all of it been removed?', 840, y2, 630, 27, 16.5) + 10;
paragraph(ctx, 'Diagnosis \u2192 staging \u2192 treatment choice: the histology slide is the evidence the whole decision rests on.', 840, y2, 630, 26, 16, '700', C.ink);

save('a28-tumours.png', canvas);