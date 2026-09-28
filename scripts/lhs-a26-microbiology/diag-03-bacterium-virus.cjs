// A2 6 Figure 3 — labelled bacterium (prokaryote) versus virus (acellular).
const common = require('./common.cjs');
const { C, makeCanvas, title, save, textCentered, textLeft, lead, paragraph, panelBox, arrow, roundRect, dashedLine } = common;

const { canvas, ctx } = makeCanvas(980, 640);
title(ctx, 980, 'Cellular versus acellular', 'A prokaryotic bacterium compared with a virus particle');

// ---- Left: bacterium ----
const bx = 250, by = 360, rw = 300, rh = 170;
ctx.save();
ctx.translate(bx, by);
ctx.rotate(-0.05);
// capsule (outer)
ctx.beginPath(); ctx.ellipse(0, 0, rw / 2 + 14, rh / 2 + 14, 0, 0, Math.PI * 2);
ctx.fillStyle = C.accent2Soft; ctx.fill();
ctx.strokeStyle = C.accent2; ctx.lineWidth = 2.5; ctx.stroke();
// cell wall
ctx.beginPath(); ctx.ellipse(0, 0, rw / 2, rh / 2, 0, 0, Math.PI * 2);
ctx.fillStyle = '#ddd6fe'; ctx.fill();
ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 3; ctx.stroke();
// membrane
ctx.beginPath(); ctx.ellipse(0, 0, rw / 2 - 16, rh / 2 - 16, 0, 0, Math.PI * 2);
ctx.strokeStyle = '#4f46e5'; ctx.lineWidth = 2.5; ctx.stroke();
// DNA (nucleoid swirl)
ctx.strokeStyle = '#be123c'; ctx.lineWidth = 2.5;
ctx.beginPath();
ctx.ellipse(-30, -12, 46, 20, 0.4, 0, Math.PI * 2); ctx.stroke();
textLeft(ctx, 'circular DNA', -66, -34, 120, 16, '600', '#be123c');
// plasmid
ctx.beginPath(); ctx.arc(52, 18, 12, 0, Math.PI * 2); ctx.stroke();
// ribosomes
ctx.fillStyle = '#1f2937';
[[-60, 26], [-38, 40], [-10, 30], [18, 48], [40, -28], [70, -20], [-52, -38], [8, -44]].forEach(([px, py]) => {
  ctx.beginPath(); ctx.arc(px, py, 4, 0, Math.PI * 2); ctx.fill();
});
// flagellum
ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(rw / 2 + 10, 30);
ctx.bezierCurveTo(rw / 2 + 70, 60, rw / 2 + 40, 110, rw / 2 + 90, 130);
ctx.stroke();
// pili
ctx.lineWidth = 2;
[[-40, -95], [-20, -100], [10, -96]].forEach(([px, py]) => {
  ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px - 14, py - 26); ctx.stroke();
});
ctx.restore();

// Left labels with leader lines.
const bLabels = [
  ['Capsule (slime layer)', 96, 175, 140, 210],
  ['Cell wall \u2014 peptidoglycan', 60, 300, 120, 320],
  ['Cell (surface) membrane', 60, 430, 120, 410],
  ['Cytoplasm', 190, 505, 200, 460],
  ['Circular DNA (nucleoid)', 330, 300, 300, 330],
  ['Plasmid \u2014 small ring of extra DNA', 350, 250, 330, 245],
  ['70S ribosomes', 60, 250, 150, 285],
  ['Flagellum \u2014 movement', 330, 470, 410, 455],
  ['Pili \u2014 attachment', 180, 150, 210, 165],
];
bLabels.forEach(([t, x, y, lx, ly]) => {
  lead(ctx, lx, ly, x + 4, y, C.sub);
  textLeft(ctx, t, x, y + (x < 200 ? -8 : 0), 190, 17, '600', C.ink);
});
textCentered(ctx, 'BACTERIUM \u2014 a living prokaryotic cell', 250, 600, 420, 20, '700', C.ink);

// ---- Right: virus ----
const vx = 760, vy = 330;
ctx.save();
ctx.translate(vx, vy);
// capsid (hexagon-ish)
ctx.beginPath();
const r = 78;
for (let i = 0; i < 6; i++) {
  const a = Math.PI / 3 * i - Math.PI / 6;
  const px = r * Math.cos(a), py = r * Math.sin(a);
  if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
}
ctx.closePath();
ctx.fillStyle = '#fef3c7'; ctx.fill();
ctx.strokeStyle = '#b45309'; ctx.lineWidth = 3.5; ctx.stroke();
// genetic material coil inside
ctx.strokeStyle = '#be123c'; ctx.lineWidth = 2.5;
for (let i = 0; i < 4; i++) {
  ctx.beginPath();
  ctx.ellipse(0, 0, 14 + i * 11, 10 + i * 8, 0.5, 0, Math.PI * 2);
  ctx.stroke();
}
// spikes
for (let i = 0; i < 12; i++) {
  const a = Math.PI / 6 * i - Math.PI / 12;
  const x1 = (r - 4) * Math.cos(a), y1 = (r - 4) * Math.sin(a);
  const x2 = (r + 16) * Math.cos(a), y2 = (r + 16) * Math.sin(a);
  ctx.strokeStyle = '#b45309'; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath(); ctx.arc(x2, y2, 5, 0, Math.PI * 2); ctx.fill();
}
ctx.restore();

const vLabels = [
  ['Capsid \u2014 protein coat', 880, 230, 830, 250],
  ['Attachment proteins (spikes)', 900, 420, 840, 400],
  ['Genetic material \u2014 DNA or RNA', 760, 170, 740, 250],
];
vLabels.forEach(([t, x, y, lx, ly]) => {
  lead(ctx, lx, ly, x - 6, y, C.sub);
  textLeft(ctx, t, x, y, 160, 17, '600', C.ink);
});
textCentered(ctx, 'VIRUS \u2014 an acellular particle', 800, 600, 300, 20, '700', C.ink);

// Divider.
dashedLine(ctx, 500, 140, 500, 570, C.grid, 3);

// Bottom comparison band.
panelBox(ctx, 60, 610, 860, 0, '#ffffff', '#ffffff', 0); // no-op spacer
ctx.restore ? null : null;
save('a26-bacterium-virus.png', canvas);
module.exports = common;