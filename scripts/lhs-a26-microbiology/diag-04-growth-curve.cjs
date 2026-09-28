// A2 6 Figure 4 — the four phases of the bacterial growth curve.
const common = require('./common.cjs');
const { C, makeCanvas, title, save, textCentered, textLeft, paragraph, panelBox, arrow, dashedLine } = common;

const { canvas, ctx } = makeCanvas(980, 620);
title(ctx, 980, 'The bacterial growth curve', 'Viable cell numbers against time in a closed (batch) culture');

// Plot area.
const px0 = 120, py0 = 150, pw = 760, ph = 330;
const px1 = px0 + pw, py1 = py0 + ph;

// Axes.
ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
arrow(ctx, px0, py1, px1 + 20, py1, 3, C.ink);
arrow(ctx, px0, py1, px0, py0 - 20, 3, C.ink);
textCentered(ctx, 'Time \u2192', px1 - 30, py1 + 40, 120, 20, '600', C.ink);
textLeft(ctx, 'log\u2081\u2080 (number of viable cells)', px0 - 100, py0 - 44, 240, 19, '600', C.ink);

// Phase boundaries (x positions along the curve region px0..px1).
const xs = [px0, px0 + 120, px0 + 340, px0 + 560, px0 + 700];
const bandX = [xs[0], xs[1], xs[2], xs[3], xs[4]];
const cols = ['#e2e8f0', C.accent2Soft, C.accentSoft, C.warnSoft, '#ffffff'];
for (let i = 0; i < 4; i++) {
  ctx.fillStyle = cols[i];
  ctx.fillRect(bandX[i], py0 - 12, bandX[i + 1] - bandX[i], ph + 12);
}

// Curve: lag (flat), log (straight rise), stationary (flat), death (decline).
ctx.strokeStyle = '#4f46e5'; ctx.lineWidth = 5;
ctx.beginPath();
ctx.moveTo(xs[0], py1 - 40);
ctx.lineTo(xs[1], py1 - 48);            // lag
ctx.lineTo(xs[2], py0 + 60);           // log
ctx.bezierCurveTo(xs[2] + 60, py0 + 34, xs[2] + 90, py0 + 34, xs[3], py0 + 34); // stationary
ctx.lineTo(xs[4], py1 - 70);           // death
ctx.stroke();

// Phase labels + annotations.
const phases = [
  ['1  LAG', 'cells adapt: switch on enzymes, synthesise the machinery they need, numbers barely change', bandX[0] + 10, '#64748b'],
  ['2  LOG (exponential)', 'ideal conditions: division at maximum rate \u2014 a straight line on this logarithmic axis', bandX[1] + 10, '#0369a1'],
  ['3  STATIONARY', 'division rate = death rate: nutrients running out, waste accumulating, total number plateaus', bandX[2] + 8, '#4338ca'],
  ['4  DEATH', 'numbers fall: toxins and starvation kill cells faster than new ones appear', bandX[3] + 6, '#b91c1c'],
];
phases.forEach((p, i) => {
  const x = p[2];
  chipLabel(p[0], x, py0 - 46, (bandX[i + 1] - x) - 8);
  paragraph(ctx, p[1], x + 4, py1 + 26, Math.min(bandX[i + 1] - x - 10, 230), 22, 16, '400', C.sub);
});
function chipLabel(t, x, y, w) {
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = C.panelBorder; ctx.lineWidth = 1.5;
  common.roundRect(ctx, x, y - 16, Math.min(w, 230), 32, 16); ctx.fill(); ctx.stroke();
  textLeft(ctx, t, x + 12, y, 220, 18, '700', C.ink);
}

// Note box.
panelBox(ctx, 130, py0 + 60, 300, 96, '#ffffff', '#c7d2fe', 12);
paragraph(ctx, 'Exponential doubling: 1 \u2192 2 \u2192 4 \u2192 8 \u2192 16 \u2026 In the log phase the population doubles every generation time \u2014 E. coli can do this in as little as 20 minutes.', 146, py0 + 82, 268, 22, 16, '400', C.ink);

save('a26-growth-curve.png', canvas);
module.exports = common;