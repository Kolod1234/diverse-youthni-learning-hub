// A2 7 Figure 4 — longitudinal section of a tooth and its tissues.
const common = require('./common.cjs');
const { C, makeCanvas, title, save, textCentered, textLeft, paragraph, panelBox, arrow, lead, dashedLine } = common;

const { canvas, ctx } = makeCanvas(980, 660);
title(ctx, 980, 'Longitudinal section of a tooth', 'Mineralised tissues protecting a living core \u2014 and why enamel can never heal itself');

const bx = 250, by = 150;

// --- Dentine silhouette (crown + two tapering roots; single-root schematic) ---
function toothPath() {
  ctx.beginPath();
  // Crown: wide rounded top.
  ctx.moveTo(bx - 110, by + 190);
  ctx.lineTo(bx - 110, by + 120);
  ctx.quadraticCurveTo(bx - 110, by + 40, bx - 50, by + 34);
  ctx.quadraticCurveTo(bx, by + 28, bx + 50, by + 34);
  ctx.quadraticCurveTo(bx + 110, by + 40, bx + 110, by + 120);
  ctx.lineTo(bx + 110, by + 190);
  // Neck narrows; root tapers to the apex.
  ctx.quadraticCurveTo(bx + 70, by + 205, bx + 55, by + 240);
  ctx.quadraticCurveTo(bx + 40, by + 330, bx + 22, by + 400);
  ctx.quadraticCurveTo(bx + 8, by + 430, bx, by + 436);
  ctx.quadraticCurveTo(bx - 8, by + 430, bx - 22, by + 400);
  ctx.quadraticCurveTo(bx - 40, by + 330, bx - 55, by + 240);
  ctx.quadraticCurveTo(bx - 70, by + 205, bx - 110, by + 190);
  ctx.closePath();
}

// Dentine fill.
toothPath();
ctx.fillStyle = '#fdf3d8';
ctx.fill();
ctx.strokeStyle = '#c9a24a';
ctx.lineWidth = 3;
ctx.stroke();

// Enamel cap: an inset arc band over the crown.
ctx.beginPath();
ctx.moveTo(bx - 92, by + 196);
ctx.lineTo(bx - 92, by + 122);
ctx.quadraticCurveTo(bx - 92, by + 54, bx - 46, by + 50);
ctx.quadraticCurveTo(bx, by + 46, bx + 46, by + 50);
ctx.quadraticCurveTo(bx + 92, by + 54, bx + 92, by + 122);
ctx.lineTo(bx + 92, by + 196);
ctx.quadraticCurveTo(bx, by + 214, bx - 92, by + 196);
ctx.closePath();
ctx.fillStyle = '#eaf6fb';
ctx.fill();
ctx.strokeStyle = '#7db8cc';
ctx.lineWidth = 2.5;
ctx.stroke();
// Enamel surface sheen lines.
ctx.strokeStyle = '#bcdcea';
ctx.lineWidth = 2;
for (let i = 0; i < 4; i++) {
  ctx.beginPath();
  ctx.moveTo(bx - 70 + i * 46, by + 70);
  ctx.quadraticCurveTo(bx - 70 + i * 46, by + 140, bx - 60 + i * 46, by + 190);
  ctx.stroke();
}

// Cementum: thin brown band on the root.
ctx.fillStyle = '#d9b98c';
ctx.strokeStyle = '#a97e45';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(bx - 55, by + 246);
ctx.quadraticCurveTo(bx - 40, by + 330, bx - 22, by + 400);
ctx.quadraticCurveTo(bx - 8, by + 432, bx, by + 438);
ctx.quadraticCurveTo(bx + 8, by + 432, bx + 22, by + 400);
ctx.quadraticCurveTo(bx + 40, by + 330, bx + 55, by + 246);
ctx.lineTo(bx + 46, by + 244);
ctx.quadraticCurveTo(bx + 32, by + 320, bx + 14, by + 392);
ctx.quadraticCurveTo(bx + 2, by + 420, bx - 4, by + 424);
ctx.quadraticCurveTo(bx - 12, by + 414, bx - 22, by + 384);
ctx.quadraticCurveTo(bx - 34, by + 310, bx - 46, by + 244);
ctx.closePath();
ctx.fill();
ctx.stroke();

// Pulp cavity: chamber + root canal.
ctx.fillStyle = '#ffe9ec';
ctx.strokeStyle = '#e08595';
ctx.lineWidth = 2.5;
ctx.beginPath();
ctx.moveTo(bx - 48, by + 200);
ctx.quadraticCurveTo(bx - 50, by + 120, bx - 20, by + 100);
ctx.quadraticCurveTo(bx, by + 92, bx + 20, by + 100);
ctx.quadraticCurveTo(bx + 50, by + 120, bx + 48, by + 200);
ctx.quadraticCurveTo(bx + 20, by + 226, bx + 12, by + 260);
ctx.lineTo(bx + 4, by + 386);
ctx.quadraticCurveTo(bx, by + 402, bx - 4, by + 386);
ctx.lineTo(bx - 12, by + 260);
ctx.quadraticCurveTo(bx - 20, by + 226, bx - 48, by + 200);
ctx.closePath();
ctx.fill();
ctx.stroke();

// Neurovascular bundle entering the apex.
ctx.strokeStyle = '#cc2222';
ctx.lineWidth = 4;
ctx.beginPath();
ctx.moveTo(bx - 2, by + 500);
ctx.quadraticCurveTo(bx - 4, by + 460, bx - 4, by + 420);
ctx.stroke();
ctx.strokeStyle = '#2563eb';
ctx.lineWidth = 4;
ctx.beginPath();
ctx.moveTo(bx + 8, by + 500);
ctx.quadraticCurveTo(bx + 6, by + 460, bx + 4, by + 420);
ctx.stroke();
textLeft(ctx, 'blood vessels', bx + 18, by + 486, 130, 15, '600', '#2563eb');
textLeft(ctx, 'nerve fibres', bx - 150, by + 486, 130, 15, '600', '#cc2222');

// Gingiva (gum) hugging the neck.
ctx.fillStyle = '#f6b8c0';
ctx.strokeStyle = '#d4707f';
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(bx - 130, by + 208);
ctx.quadraticCurveTo(bx - 96, by + 226, bx - 60, by + 222);
ctx.lineTo(bx - 58, by + 244);
ctx.quadraticCurveTo(bx - 100, by + 252, bx - 130, by + 240);
ctx.closePath();
ctx.fill();
ctx.stroke();
ctx.beginPath();
ctx.moveTo(bx + 130, by + 208);
ctx.quadraticCurveTo(bx + 96, by + 226, bx + 60, by + 222);
ctx.lineTo(bx + 58, by + 244);
ctx.quadraticCurveTo(bx + 100, by + 252, bx + 130, by + 240);
ctx.closePath();
ctx.fill();
ctx.stroke();

// Alveolar bone: sockets shown as hatched blocks either side of the root.
function boneBlock(x, w) {
  ctx.fillStyle = '#e8dcc8';
  ctx.strokeStyle = '#a68a5b';
  ctx.lineWidth = 2.5;
  roundRectBone(ctx, x, by + 244, w, 200, 10);
  ctx.fill();
  ctx.stroke();
  // Hatching.
  ctx.strokeStyle = '#cdbb96';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 8; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 10 + i * (w / 9), by + 254);
    ctx.lineTo(x + 10 + i * (w / 9) + 14, by + 434);
    ctx.stroke();
  }
}
function roundRectBone(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
boneBlock(bx - 210, 130);
boneBlock(bx + 80, 130);

// Periodontal ligament fibres: short slanted lines between cementum and bone.
ctx.strokeStyle = '#8b5cf6';
ctx.lineWidth = 2;
for (let i = 0; i < 7; i++) {
  const yy = by + 268 + i * 22;
  ctx.beginPath();
  ctx.moveTo(bx - 56 - (yy - by - 268) * 0.06, yy);
  ctx.lineTo(bx - 80 - (yy - by - 268) * 0.06, yy + 10);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bx + 56 + (yy - by - 268) * 0.06, yy);
  ctx.lineTo(bx + 80 + (yy - by - 268) * 0.06, yy + 10);
  ctx.stroke();
}

// Labels (left column).
const L = [
  ['ENAMEL', 'acellular; ~96% mineral; the hardest tissue in the body \u2014 cannot regenerate once lost', bx - 70, by + 60, bx - 150, 120],
  ['DENTINE', 'bone-like; forms the bulk; tubules run to the pulp; made by odontoblasts', bx - 60, by + 160, bx - 150, 260],
  ['PULP', 'living core: blood vessels, lymphatics and sensory nerves', bx + 6, by + 300, bx + 150, 300],
  ['GINGIVA (gum)', 'mucosal seal around the neck of the tooth', bx - 110, by + 228, bx - 150, 400],
  ['PERIODONTAL LIGAMENT', 'collagen fibres: the tooth\u2019s shock absorber', bx - 70, by + 330, bx - 150, 480],
  ['ALVEOLAR BONE', 'the socket that anchors the root', bx - 150, by + 380, bx - 150, 560],
];
L.forEach(item => {
  lead(ctx, item[4], item[5], item[2], item[3]);
});
textLeft(ctx, 'ENAMEL', 40, 176, 140, 16, '700', '#2a7fb8');
textLeft(ctx, 'acellular; ~96% mineral \u2014 the hardest tissue in the body, and it cannot regenerate once lost', 40, 210, 150, 13, '400', C.sub);
textLeft(ctx, 'DENTINE', 40, 300, 140, 16, '700', '#a97e1e');
textLeft(ctx, 'bone-like bulk of the tooth; tubules run inward; maintained by odontoblasts', 40, 334, 150, 13, '400', C.sub);
textLeft(ctx, 'GINGIVA (gum)', 40, 408, 150, 16, '700', '#c2435a');
textLeft(ctx, 'mucosal seal around the neck of the tooth', 40, 442, 150, 13, '400', C.sub);
textLeft(ctx, 'PERIODONTAL LIGAMENT', 40, 486, 160, 16, '700', '#6d28d9');
textLeft(ctx, 'collagen fibres \u2014 the tooth\u2019s shock absorber', 40, 520, 150, 13, '400', C.sub);

textLeft(ctx, 'PULP', 700, 430, 140, 16, '700', '#c2435a');
textLeft(ctx, 'living core: vessels and nerves enter through the root apex', 700, 464, 190, 13, '400', C.sub);
textLeft(ctx, 'CEMENTUM', 700, 300, 140, 16, '700', '#8a5a20');
textLeft(ctx, 'calcified root covering; anchors the ligament fibres', 700, 334, 190, 13, '400', C.sub);
textLeft(ctx, 'ALVEOLAR BONE', 700, 178, 140, 16, '700', '#7c6236');
textLeft(ctx, 'the socket that anchors the root', 700, 212, 190, 13, '400', C.sub);
textCentered(ctx, 'CROWN above the gum \u2014 NECK at the gum line \u2014 ROOT in the socket', 490, 626, 620, 17, '700', C.ink);

save('a27-tooth-section.png', canvas);
module.exports = common;