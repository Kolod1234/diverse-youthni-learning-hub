// A2 7 Figure 7 — the Stephan curve: plaque pH over time after a sugar intake.
const common = require('./common.cjs');
const { C, makeCanvas, title, save, textCentered, textLeft, paragraph, panelBox, arrow, dashedLine } = common;

const { canvas, ctx } = makeCanvas(980, 640);
title(ctx, 980, 'The Stephan curve', 'Plaque pH after a sugary drink \u2014 the shape that explains why frequency of sugar matters more than amount');

// Plot area.
const px0 = 130, py0 = 160, pw = 740, ph = 320;
const px1 = px0 + pw, py1 = py0 + ph;

// y-axis maps pH 7.6 (top) .. 4.2 (bottom).
function yFor(pH) { return py1 - ((pH - 4.2) / (7.6 - 4.2)) * ph; }
// x-axis maps 0..70 minutes.
function xFor(min) { return px0 + (min / 70) * pw; }

// Axes.
ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
arrow(ctx, px0, py1, px1 + 20, py1, 3, C.ink);
arrow(ctx, px0, py1, px0, py0 - 20, 3, C.ink);
textCentered(ctx, 'Time after sugar intake (minutes) \u2192', (px0 + px1) / 2, py1 + 52, 400, 18, '600', C.ink);
textLeft(ctx, 'plaque pH', px0 - 104, py0 - 36, 120, 18, '600', C.ink);

// pH gridlines and labels.
[7, 6, 5, 4.5, 4].forEach(v => {
  const y = yFor(v);
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(px0, y);
  ctx.lineTo(px1, y);
  ctx.stroke();
  textCentered(ctx, String(v), px0 - 30, y, 60, 15, '600', C.sub);
});

// Shade the demineralisation zone (below critical pH 5.5).
ctx.fillStyle = 'rgba(204,34,34,0.07)';
ctx.fillRect(px0, yFor(5.5), pw, py1 - yFor(5.5));

// Critical pH line at 5.5.
dashedLine(ctx, px0, yFor(5.5), px1, yFor(5.5), C.warn, 3);
textLeft(ctx, 'critical pH 5.5 \u2014 below this, enamel dissolves', px0 + 10, yFor(5.5) - 16, 400, 16, '700', C.warn);

// Resting pH marker at 6.8.
dashedLine(ctx, px0, yFor(6.8), xFor(0), yFor(6.8), '#94a3b8', 2);
textCentered(ctx, 'resting pH ~6.8', px0 - 55 + 0, yFor(6.8), 110, 14, '600', C.sub);

// Stephan curve: sharp drop to pH ~4.6 by 5-10 min, slow recovery to ~6.5-7 by 40-60 min.
const pts = [];
function f(t) {
  // piecewise smooth shape: exponential-ish drop then logistic recovery.
  const drop = 4.6 + (6.8 - 4.6) * Math.exp(-t / 3.2);
  const recovery = 6.8 - (6.8 - 4.6) * Math.exp(-t / 16);
  return Math.min(drop, recovery);
}
ctx.strokeStyle = '#4f46e5';
ctx.lineWidth = 5;
ctx.beginPath();
for (let t = 0; t <= 70; t += 0.5) {
  const x = xFor(t), y = yFor(f(t));
  if (t === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
}
ctx.stroke();

// Sugar intake arrow at t=0.
arrow(ctx, px0 + 120, py0 - 40, px0 + 6, yFor(6.8) - 24, 3, '#b45309');
textCentered(ctx, 'sugary drink taken', px0 + 150, py0 - 46, 180, 16, '700', '#b45309');

// Demineralisation bracket: time below 5.5 (~0-25 min).
const tCrossDown = 3, tCrossUp = 23.5;
ctx.lineWidth = 4;
ctx.strokeStyle = C.warn;
ctx.beginPath();
ctx.moveTo(xFor(tCrossDown), py1 - 8);
ctx.lineTo(xFor(tCrossUp), py1 - 8);
ctx.stroke();
textCentered(ctx, 'demineralisation window (~20\u201330 min)', (xFor(tCrossDown) + xFor(tCrossUp)) / 2, py1 - 32, 260, 15, '700', C.warn);

// Annotations on recovery.
textLeft(ctx, 'saliva buffers the acid back up:', xFor(26), yFor(5.6) - 26, 300, 15, '600', C.accent2);
textLeft(ctx, 'bicarbonate + washing flow return pH above 5.5, and', xFor(26), yFor(5.6) + 2, 320, 14, '400', C.sub);
textLeft(ctx, 'remineralisation can begin (Ca\u00b2\u207a and PO\u2084\u00b3\u207b redeposit)', xFor(26), yFor(5.6) + 26, 330, 14, '400', C.sub);

// Takeaway strip.
panelBox(ctx, 60, 560, 860, 60, C.amberSoft, C.amber);
textCentered(ctx, 'Every sugary episode buys one acid attack. Five snacks a day = five Stephan cycles \u2014 enamel never gets time to remineralise.', 490, 590, 840, 17, '600', '#92400e');

save('a27-stephan-curve.png', canvas);
module.exports = common;