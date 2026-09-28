// A2 7 Figure 10 — restoration materials and prosthetic replacement options.
const common = require('./common.cjs');
const { C, makeCanvas, title, save, textCentered, textLeft, paragraph, panelBox, arrow } = common;

const { canvas, ctx } = makeCanvas(980, 660);
title(ctx, 980, 'Restoring and replacing: materials and prosthetics', 'When prevention fails \u2014 what dentistry rebuilds with, and how each option is retained');

// ---- Left: direct restoration materials ----
panelBox(ctx, 40, 140, 440, 480, '#ffffff', C.panelBorder);
textCentered(ctx, 'FILLING (DIRECT RESTORATION) MATERIALS', 260, 168, 400, 17, '700', C.sub);

// Tooth cross-section with a filled cavity.
const tx = 150, ty = 210;
ctx.fillStyle = '#fdf3d8';
ctx.strokeStyle = '#c9a24a';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(tx - 60, ty + 40);
ctx.quadraticCurveTo(tx - 64, ty - 10, tx, ty - 14);
ctx.quadraticCurveTo(tx + 64, ty - 10, tx + 60, ty + 40);
ctx.lineTo(tx + 34, ty + 66);
ctx.quadraticCurveTo(tx + 20, ty + 130, tx + 10, ty + 170);
ctx.lineTo(tx - 10, ty + 170);
ctx.quadraticCurveTo(tx - 20, ty + 130, tx - 34, ty + 66);
ctx.closePath();
ctx.fill();
ctx.stroke();
// Cavity prep (dark) with filling (light).
ctx.fillStyle = '#3f3f46';
ctx.beginPath();
ctx.moveTo(tx - 46, ty + 6);
ctx.quadraticCurveTo(tx - 20, ty - 2, tx - 4, ty + 4);
ctx.quadraticCurveTo(tx + 8, ty + 20, tx + 2, ty + 44);
ctx.quadraticCurveTo(tx - 20, ty + 52, tx - 40, ty + 42);
ctx.closePath();
ctx.fill();
ctx.fillStyle = '#9fd8f0';
ctx.strokeStyle = '#2a7fb8';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(tx - 42, ty + 8);
ctx.quadraticCurveTo(tx - 20, ty + 2, tx - 6, ty + 8);
ctx.quadraticCurveTo(tx + 4, ty + 22, tx, ty + 42);
ctx.quadraticCurveTo(tx - 20, ty + 48, tx - 36, ty + 38);
ctx.closePath();
ctx.fill();
ctx.stroke();
textCentered(ctx, 'decayed tissue removed, then rebuilt', tx + 30, ty + 220, 300, 14, '600', C.sub);

const mats = [
  ['COMPOSITE RESIN', 'tooth-coloured; bonded adhesively to enamel and dentine \u2014 aesthetic front-facing choice', C.accent2Soft, C.accent2],
  ['GLASS IONOMER CEMENT', 'bonds chemically to tooth and slowly releases fluoride \u2014 protective, including near the gum line', C.okSoft, C.ok],
  ['DENTAL AMALGAM', 'durable silver alloy; mechanically retained; used where load-bearing strength dominates appearance', '#e2e8f0', '#475569'],
];
mats.forEach((m, i) => {
  const y = 470 + i * 56;
  panelBox(ctx, 60, y, 400, 46, m[2], m[3], 10);
  textLeft(ctx, m[0], 74, y + 15, 180, 14, '700', m[3]);
  textLeft(ctx, m[1].split(';')[0], 74, y + 34, 380, 12, '400', C.sub);
});

// ---- Right: prosthetic replacement options ----
panelBox(ctx, 510, 140, 430, 480, '#ffffff', C.panelBorder);
textCentered(ctx, 'REPLACING LOST TEETH', 725, 168, 400, 17, '700', C.sub);

function miniTooth(x, y, w, h, col, edge) {
  ctx.fillStyle = col;
  ctx.strokeStyle = edge;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - w / 2, y);
  ctx.lineTo(x - w / 2, y + h * 0.55);
  ctx.quadraticCurveTo(x - w / 2.5, y + h, x, y + h);
  ctx.quadraticCurveTo(x + w / 2.5, y + h, x + w / 2, y + h * 0.55);
  ctx.lineTo(x + w / 2, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

// Crown on prepared stub.
panelBox(ctx, 530, 196, 190, 150, '#f8fafc', C.panelBorder, 10);
textCentered(ctx, 'CROWN', 625, 216, 160, 15, '700', C.ink);
ctx.fillStyle = '#e2e8f0';
ctx.strokeStyle = '#475569';
miniTooth(625, 240, 26, 40, '#cbd5e1', '#475569'); // prepared stub
ctx.fillStyle = '#fde68a';
ctx.strokeStyle = '#b45309';
roundRectC(ctx, 606, 224, 38, 44, 6);
ctx.fill(); ctx.stroke(); // crown cap over the stub
paragraph(ctx, 'full-cover cap cemented over a damaged but salvageable tooth', 544, 286, 165, 17, 12, '400', C.sub);

// Bridge: pontic between two abutments.
panelBox(ctx, 744, 196, 180, 150, '#f8fafc', C.panelBorder, 10);
textCentered(ctx, 'BRIDGE', 834, 216, 150, 15, '700', C.ink);
miniTooth(788, 246, 22, 36, '#cbd5e1', '#475569');
miniTooth(834, 246, 22, 34, '#fde68a', '#b45309'); // pontic
miniTooth(878, 246, 22, 36, '#cbd5e1', '#475569');
ctx.strokeStyle = '#b45309';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(788, 244);
ctx.lineTo(878, 244);
ctx.stroke();
paragraph(ctx, 'pontic anchored to crowns on the neighbouring abutment teeth', 756, 300, 165, 17, 12, '400', C.sub);

// Implant: screw + abutment + crown.
panelBox(ctx, 530, 360, 190, 160, '#f8fafc', C.panelBorder, 10);
textCentered(ctx, 'IMPLANT', 625, 380, 160, 15, '700', C.ink);
ctx.fillStyle = '#cbd5e1';
ctx.strokeStyle = '#475569';
miniTooth(625, 396, 22, 30, '#cbd5e1', '#475569'); // crown part
// abutment.
ctx.fillStyle = '#94a3b8';
ctx.fillRect(620, 426, 10, 14);
// screw into bone.
ctx.fillStyle = '#64748b';
ctx.strokeStyle = '#334155';
ctx.lineWidth = 1.5;
ctx.beginPath();
ctx.moveTo(616, 440);
ctx.lineTo(634, 440);
ctx.lineTo(630, 494);
ctx.lineTo(620, 494);
ctx.closePath();
ctx.fill();
ctx.stroke();
for (let i = 0; i < 3; i++) {
  ctx.beginPath();
  ctx.moveTo(618 + i * 4, 452 + i * 12);
  ctx.lineTo(632 - i * 4, 458 + i * 12);
  ctx.stroke();
}
paragraph(ctx, 'titanium screw fixed in alveolar bone \u2014 osseointegration, like the material-science examples', 544, 472, 170, 16, 12, '400', C.sub);

// Denture.
panelBox(ctx, 744, 360, 180, 160, '#f8fafc', C.panelBorder, 10);
textCentered(ctx, 'DENTURE', 834, 380, 150, 15, '700', C.ink);
// Gum plate with teeth.
ctx.fillStyle = '#f6b8c0';
ctx.strokeStyle = '#d4707f';
roundRectC(ctx, 774, 430, 120, 26, 10);
ctx.fill(); ctx.stroke();
for (let i = 0; i < 4; i++) miniTooth(792 + i * 28, 404, 18, 26, '#fde68a', '#b45309');
paragraph(ctx, 'removable acrylic plate; retained by suction and clasps', 756, 486, 165, 16, 12, '400', C.sub);

function roundRectC(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Takeaway.
panelBox(ctx, 40, 636, 900, 0, '#fff', '#fff', 0); // no-op keep spacing
panelBox(ctx, 60, 626, 860, 0, '#fff', '#fff', 0);

// Material choice takeaway (replace empty boxes above).
textCentered(ctx, 'Choice of material trades aesthetics, adhesion, durability and fluoride release \u2014 the properties your portfolio can test.', 490, 642, 860, 15, '600', C.sub);

save('a27-dental-materials.png', canvas);
module.exports = common;