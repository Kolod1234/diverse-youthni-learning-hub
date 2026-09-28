// A2 7 Figure 8 — fluoride chemistry: hydroxyapatite becomes fluorapatite.
const common = require('./common.cjs');
const { C, makeCanvas, title, save, textCentered, textLeft, paragraph, panelBox, arrow, dashedLine } = common;

const { canvas, ctx } = makeCanvas(980, 660);
title(ctx, 980, 'Fluoride: changing enamel\u2019s chemistry, not just coating it', 'Why the same mouth acid no longer dissolves a fluoridated tooth');

// ---- Top: the substitution reaction ----
panelBox(ctx, 60, 140, 860, 170, '#ffffff', C.panelBorder);
textCentered(ctx, 'THE REACTION ON THE ENAMEL SURFACE', 490, 168, 700, 18, '700', C.sub);

// Hydroxyapatite crystal (left).
panelBox(ctx, 100, 196, 300, 92, '#eaf6fb', '#7db8cc', 12);
textCentered(ctx, 'Ca\u2081\u2080(PO\u2084)\u2086(OH)\u2082', 250, 228, 280, 26, '700', '#1d6f8f');
textCentered(ctx, 'hydroxyapatite \u2014 natural enamel mineral', 250, 264, 280, 15, '400', C.sub);

// Plus 2F-.
textCentered(ctx, '+  2 F\u207b', 430, 228, 90, 24, '700', '#b45309');

// Arrow.
arrow(ctx, 470, 240, 530, 240, 4, C.ink);
textCentered(ctx, 'F\u207b swaps in for OH\u207b', 500, 214, 140, 13, '600', C.sub);

// Fluorapatite crystal (right).
panelBox(ctx, 560, 196, 320, 92, '#fff7ed', C.amber, 12);
textCentered(ctx, 'Ca\u2081\u2080(PO\u2084)\u2086F\u2082   +  2 OH\u207b', 720, 228, 300, 26, '700', '#92400e');
textCentered(ctx, 'fluorapatite \u2014 the acid-resistant mineral', 720, 264, 300, 15, '400', C.sub);

// ---- Middle: the solubility comparison via critical pH scales ----
function pHScale(x, y, w, label, crit, critColor, tint) {
  panelBox(ctx, x, y, w, 150, '#ffffff', C.panelBorder, 12);
  textCentered(ctx, label, x + w / 2, y + 24, w - 40, 18, '700', C.ink);
  // pH bar 4 .. 7 mapped left->right.
  ctx.fillStyle = '#e2e8f0';
  roundBar(ctx, x + 30, y + 46, w - 60, 26);
  // demineralisation zone left of critical.
  const cxPos = x + 30 + ((crit - 4) / 3) * (w - 60);
  ctx.fillStyle = tint;
  roundBarFill(ctx, x + 30, y + 46, cxPos - (x + 30), 26);
  ctx.strokeStyle = critColor;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cxPos, y + 40);
  ctx.lineTo(cxPos, y + 78);
  ctx.stroke();
  textCentered(ctx, 'critical pH ' + crit, cxPos, y + 96, 150, 16, '700', critColor);
  textLeft(ctx, 'dissolves', x + 34, y + 62, 90, 14, '700', '#991b1b');
  textLeft(ctx, 'safe', x + w - 70, y + 62, 70, 14, '700', '#166534');
}
function roundBar(ctx, x, y, w, h) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arcTo(x + w, y, x + w, y + h, 13);
  ctx.arcTo(x + w, y + h, x, y + h, 13);
  ctx.arcTo(x, y + h, x, y, 13);
  ctx.arcTo(x, y, x + w, y, 13);
  ctx.closePath();
  ctx.fill();
}
function roundBarFill(ctx, x, y, w, h) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arcTo(x + w, y, x + w, y + h, 13);
  ctx.arcTo(x + w, y + h, x, y + h, 13);
  ctx.arcTo(x, y + h, x, y, 13);
  ctx.arcTo(x, y, x + w, y, 13);
  ctx.closePath();
  ctx.fill();
}

pHScale(60, 330, 420, 'PLAIN HYDROXYAPATITE', '5.5', C.warn, 'rgba(204,34,34,0.25)');
pHScale(500, 330, 420, 'FLUORAPATITE (fluoridated enamel)', '4.5', C.ok, 'rgba(22,163,74,0.25)');

paragraph(ctx, 'The mouth must get a whole pH unit more acidic before a fluoridated surface starts to dissolve \u2014 most plaque acid attacks now end before enamel is harmed, and fluoride also catalyses Ca\u00b2\u207a / PO\u2084\u00b3\u207b redeposition (remineralisation) once pH recovers.', 60, 502, 860, 22, 16, '400', C.sub);

// ---- Bottom: delivery routes ----
const routes = [
  ['TOPICAL (surface)', 'fluoride toothpaste twice daily; mouth rinses; high-fluoride varnish applied by a dentist', C.accentSoft, C.accent],
  ['SYSTEMIC (ingested)', 'community water fluoridation \u2014 protects developing and erupted teeth across whole populations', C.accent2Soft, C.accent2],
];
routes.forEach((r, i) => {
  const x = 60 + i * 450;
  panelBox(ctx, x, 560, 420, 84, r[2], r[3], 12);
  textLeft(ctx, r[0], x + 18, 580, 380, 16, '700', r[3]);
  textLeft(ctx, r[1], x + 18, 612, 390, 14, '400', C.sub);
});

save('a27-fluoride.png', canvas);
module.exports = common;