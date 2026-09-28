// A2 7 Figure 5 — the periodontium: the supporting apparatus in health.
const common = require('./common.cjs');
const { C, makeCanvas, title, save, textCentered, textLeft, panelBox, lead } = common;

const { canvas, ctx } = makeCanvas(980, 620);
title(ctx, 980, 'The periodontium: the tooth\u2019s supporting apparatus', 'Gingiva, periodontal ligament, cementum and alveolar bone \u2014 each with a role an examiner can ask about');

// ---- Central zoomed cross-section (tooth neck and root in its socket) ----
const bx = 320, by = 170;

// Enamel stub (crown, cut away at the top of the drawing).
ctx.fillStyle = '#eaf6fb';
ctx.strokeStyle = '#7db8cc';
ctx.lineWidth = 2.5;
ctx.beginPath();
ctx.moveTo(bx - 60, by - 20);
ctx.lineTo(bx - 60, by + 40);
ctx.lineTo(bx + 60, by + 40);
ctx.lineTo(bx + 60, by - 20);
ctx.closePath();
ctx.fill();
ctx.stroke();

// Dentine root.
ctx.fillStyle = '#fdf3d8';
ctx.strokeStyle = '#c9a24a';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(bx - 62, by + 40);
ctx.quadraticCurveTo(bx - 40, by + 180, bx - 14, by + 320);
ctx.quadraticCurveTo(bx, by + 344, bx + 14, by + 320);
ctx.quadraticCurveTo(bx + 40, by + 180, bx + 62, by + 40);
ctx.closePath();
ctx.fill();
ctx.stroke();

// Cementum: outline band on the root.
ctx.strokeStyle = '#a97e45';
ctx.lineWidth = 6;
ctx.beginPath();
ctx.moveTo(bx - 60, by + 52);
ctx.quadraticCurveTo(bx - 38, by + 186, bx - 13, by + 318);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(bx + 60, by + 52);
ctx.quadraticCurveTo(bx + 38, by + 186, bx + 13, by + 318);
ctx.stroke();

// Gingiva: snug collar with a shallow sulcus.
ctx.fillStyle = '#f6b8c0';
ctx.strokeStyle = '#d4707f';
ctx.lineWidth = 2.5;
ctx.beginPath();
ctx.moveTo(bx - 160, by + 120);
ctx.quadraticCurveTo(bx - 120, by + 60, bx - 66, by + 54);
// sulcus: dip down between gum crest and enamel
ctx.lineTo(bx - 62, by + 78);
ctx.lineTo(bx - 52, by + 60);
ctx.lineTo(bx - 44, by + 96);
ctx.lineTo(bx - 40, by + 150);
ctx.quadraticCurveTo(bx - 90, by + 190, bx - 160, by + 196);
ctx.closePath();
ctx.fill();
ctx.stroke();
// Right side gum (simpler).
ctx.beginPath();
ctx.moveTo(bx + 160, by + 120);
ctx.quadraticCurveTo(bx + 120, by + 60, bx + 66, by + 54);
ctx.lineTo(bx + 62, by + 78);
ctx.lineTo(bx + 52, by + 60);
ctx.lineTo(bx + 44, by + 96);
ctx.lineTo(bx + 40, by + 150);
ctx.quadraticCurveTo(bx + 90, by + 190, bx + 160, by + 196);
ctx.closePath();
ctx.fill();
ctx.stroke();

// Alveolar bone: two blocks with crest level at the gum line.
ctx.fillStyle = '#e8dcc8';
ctx.strokeStyle = '#a68a5b';
ctx.lineWidth = 2.5;
function bone(x, w) {
  ctx.beginPath();
  ctx.moveTo(x, by + 196);
  ctx.lineTo(x + w, by + 196);
  ctx.lineTo(x + w, by + 420);
  ctx.lineTo(x, by + 420);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = '#cdbb96';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(x + 14 + i * (w / 7), by + 208);
    ctx.lineTo(x + 14 + i * (w / 7) + 16, by + 408);
    ctx.stroke();
  }
  ctx.strokeStyle = '#a68a5b';
  ctx.lineWidth = 2.5;
}
bone(bx - 250, 110);
bone(bx + 140, 110);

// Periodontal ligament: fibre bundles between cementum and bone.
ctx.strokeStyle = '#8b5cf6';
ctx.lineWidth = 2.5;
for (let i = 0; i < 9; i++) {
  const t = i / 8;
  const yy = by + 90 + t * 250;
  const inset = 14 + t * 36;
  ctx.beginPath();
  ctx.moveTo(bx - 8 - inset * 0.3, yy);
  ctx.lineTo(bx - 14 - inset, yy + 16);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bx + 8 + inset * 0.3, yy);
  ctx.lineTo(bx + 14 + inset, yy + 16);
  ctx.stroke();
}

// Labels with leader lines (left + right of the drawing).
lead(ctx, bx - 60, by + 20, bx - 120, by + 6);
textLeft(ctx, 'ENAMEL', 60, 108, 140, 15, '700', '#2a7fb8');

lead(ctx, bx - 58, by + 150, bx - 130, by + 150);
textLeft(ctx, 'GINGIVAL SULCUS', 40, 150, 170, 15, '700', '#c2435a');
textLeft(ctx, 'the shallow cuff between gum and tooth \u2014 the site plaque colonises first', 40, 182, 200, 13, '400', C.sub);

lead(ctx, bx - 30, by + 200, bx - 150, by + 240);
textLeft(ctx, 'PERIODONTAL LIGAMENT', 30, 244, 210, 15, '700', '#6d28d9');
textLeft(ctx, 'collagen fibres from cementum to bone \u2014 suspends and cushions the tooth like a hammock', 30, 276, 200, 13, '400', C.sub);

lead(ctx, bx - 18, by + 300, bx - 160, by + 360);
textLeft(ctx, 'CEMENTUM', 40, 366, 140, 15, '700', '#8a5a20');
textLeft(ctx, 'calcified root coating the fibres anchor into', 40, 398, 180, 13, '400', C.sub);

lead(ctx, bx - 130, by + 300, bx - 190, by + 430);
textLeft(ctx, 'ALVEOLAR BONE', 40, 442, 150, 15, '700', '#7c6236');
textLeft(ctx, 'the socket wall holding the root', 40, 474, 180, 13, '400', C.sub);

textLeft(ctx, 'GINGIVA', 720, 160, 140, 15, '700', '#c2435a');
textLeft(ctx, 'seals the neck; its collagen fibre attachment is the barrier bacteria must defeat', 720, 192, 210, 13, '400', C.sub);
textLeft(ctx, 'BONE CREST', 720, 288, 140, 15, '700', '#7c6236');
textLeft(ctx, 'level of the socket rim \u2014 periodontitis lowers it permanently', 720, 320, 210, 13, '400', C.sub);
textLeft(ctx, 'FIBRE BUNDLES', 720, 404, 160, 15, '700', '#6d28d9');
textLeft(ctx, 'absorb the shock of chewing \u2014 a working tooth moves slightly in its socket', 720, 436, 210, 13, '400', C.sub);

// Takeaway strip.
panelBox(ctx, 60, 520, 860, 66, C.accentSoft, C.accent);
textCentered(ctx, 'Four components, one job: hold the tooth steady under load \u2014 and in disease, each is lost in a fixed order (gum \u2192 ligament \u2192 bone).', 490, 553, 820, 17, '600', C.ink);

save('a27-periodontium.png', canvas);
module.exports = common;