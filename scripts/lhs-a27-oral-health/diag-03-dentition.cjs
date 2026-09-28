// A2 7 Figure 3 — the permanent dentition: tooth types, positions and the
// dental formula.
const common = require('./common.cjs');
const { C, makeCanvas, title, save, textCentered, textLeft, panelBox, chip } = common;

const { canvas, ctx } = makeCanvas(980, 640);
title(ctx, 980, 'The permanent dentition: 32 teeth in four quadrants', 'Heterodont dentition \u2014 each tooth type is shaped for a specific mechanical job');

// ---- Upper dental arch drawn as a downward U ----
const cx = 270, cy = 200;
const types = [
  { k: 'I', n: 2, col: C.accent2Soft, edge: C.accent2, label: 'INCISOR' },
  { k: 'C', n: 1, col: '#fde68a', edge: '#b45309', label: 'CANINE' },
  { k: 'PM', n: 2, col: C.accentSoft, edge: C.accent, label: 'PREMOLAR' },
  { k: 'M', n: 3, col: C.okSoft, edge: C.ok, label: 'MOLAR' },
];

// Build one half-arch (right side of the mouth, from midline back): 2 I, 1 C, 2 PM, 3 M.
const halfTeeth = [];
types.forEach(t => { for (let i = 0; i < t.n; i++) halfTeeth.push(t); });

function drawArch(cx, cy, flipY) {
  // Teeth laid along a semicircle of radius 150, midline at angle 0 (front).
  const R = 155;
  let a = -Math.PI / 2.35; // start at the back tooth on one side
  const n = halfTeeth.length; // 8
  const step = (Math.PI / 2.35) / (n - 0.2) * -1; // move toward the front
  halfTeeth.forEach((t, i) => {
    const ang = a + step * i;
    const x = cx + R * Math.cos(ang + Math.PI / 2) * 1.12;
    const y = cy + R * Math.sin(ang + Math.PI / 2) * (flipY ? 1 : 1) * 0.78;
    const w = 34, h = 30;
    ctx.fillStyle = t.col;
    ctx.strokeStyle = t.edge;
    ctx.lineWidth = 2.5;
    roundRectLocal(ctx, x - w / 2, y - h / 2, w, h, 7);
    ctx.fill();
    ctx.stroke();
    textCentered(ctx, t.k, x, y, 40, 15, '700', t.edge);
  });
}

function roundRectLocal(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Mirror image: draw second half-arch by mirroring x around cx.
const ctxDraw = ctx;
const origRound = roundRectLocal;
function mirrored() {
  // save transform: scale(-1,1) around cx
  ctx.save();
  ctx.translate(cx * 2, 0);
  ctx.scale(-1, 1);
  ctx.translate(-cx * 2, 0);
}
// Right half-arch.
drawArch(cx, cy, false);
// Left half-arch (mirror).
mirrored();
ctx.translate(0, 0);
drawArchMirrored(cx, cy);
ctx.restore();

function drawArchMirrored(cx, cy) {
  // Redraw with mirrored positions by reflecting the angle.
  const R = 155;
  let a = -Math.PI / 2.35;
  const n = halfTeeth.length;
  const step = (Math.PI / 2.35) / (n - 0.2) * -1;
  halfTeeth.forEach((t, i) => {
    const ang = a + step * i;
    const x0 = cx + R * Math.cos(ang + Math.PI / 2) * 1.12;
    const x = 2 * cx - x0;
    const y = cy + R * Math.sin(ang + Math.PI / 2) * 0.78;
    const w = 34, h = 30;
    ctx.fillStyle = t.col;
    ctx.strokeStyle = t.edge;
    ctx.lineWidth = 2.5;
    origRound(ctx, x - w / 2, y - h / 2, w, h, 7);
    ctx.fill();
    ctx.stroke();
    textCentered(ctx, t.k, x, y, 40, 15, '700', t.edge);
  });
}

textCentered(ctx, 'UPPER ARCH (maxillary) \u2014 16 teeth', cx, cy - 96, 300, 17, '700', C.sub);
textCentered(ctx, 'midline', cx, cy + 152, 120, 14, '600', C.faint);

// Midline marker.
ctx.strokeStyle = C.faint;
ctx.setLineDash([8, 7]);
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(cx - 2, cy - 30);
ctx.lineTo(cx - 2, cy + 26);
ctx.stroke();
ctx.setLineDash([]);

// ---- Right: type roles and the dental formula ----
const rx = 560, rw = 360;
const roles = [
  ['INCISORS \u2014 8', 'chisel-shaped; cut and shear food at the front', C.accent2Soft, C.accent2],
  ['CANINES \u2014 4', 'pointed; grip and tear tough food', '#fde68a', '#b45309'],
  ['PREMOLARS \u2014 8', 'two cusps; crush and grind', C.accentSoft, C.accent],
  ['MOLARS \u2014 12', 'broad multi-cusped surfaces; heavy crushing and fine grinding', C.okSoft, C.ok],
];
roles.forEach((r, i) => {
  const y = 140 + i * 78;
  panelBox(ctx, rx, y, rw, 66, r[2], r[3]);
  textLeft(ctx, r[0], rx + 18, y + 20, 320, 17, '700', r[3]);
  textLeft(ctx, r[1], rx + 18, y + 45, 330, 15, '400', C.sub);
});

// Dental formula box.
panelBox(ctx, rx, 460, rw, 130, '#fff7ed', C.amber);
textCentered(ctx, 'THE DENTAL FORMULA (per quadrant)', rx + rw / 2, 488, 340, 17, '700', '#b45309');
textCentered(ctx, 'I 2/2   C 1/1   PM 2/2   M 3/3', rx + rw / 2, 524, 340, 26, '700', C.ink);
textCentered(ctx, '8 teeth per quadrant \u00d7 4 quadrants = 32 permanent teeth', rx + rw / 2, 564, 340, 15, '400', C.sub);

save('a27-dentition.png', canvas);
module.exports = common;