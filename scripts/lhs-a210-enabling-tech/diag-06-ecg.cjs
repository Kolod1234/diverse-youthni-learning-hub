// Diagram 6 — the ECG: trace, waves, and heart rate from the grid.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, chip, lead } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 920);
title(ctx, 1560, 'The electrocardiogram', 'The heart\u2019s electrical cycle, drawn as three recognisable waves');

// Trace panel
panelBox(ctx, 90, 150, 1380, 420, '#ffffff', C.panelBorder, 16);
const baseY = 480, ox = 170, xEnd = 1420;
// grid: small squares 10 px, big (5x5) 50 px — one big square = 0.2 s
ctx.strokeStyle = '#f1f5f9';
ctx.lineWidth = 1;
for (let gx = ox; gx <= xEnd; gx += 10) { ctx.beginPath(); ctx.moveTo(gx, 190); ctx.lineTo(gx, baseY); ctx.stroke(); }
for (let gy = 190; gy <= baseY; gy += 10) { ctx.beginPath(); ctx.moveTo(ox, gy); ctx.lineTo(xEnd, gy); ctx.stroke(); }
ctx.strokeStyle = '#e2e8f0';
for (let gx = ox; gx <= xEnd; gx += 50) { ctx.beginPath(); ctx.moveTo(gx, 190); ctx.lineTo(gx, baseY); ctx.stroke(); }
for (let gy = 190; gy <= baseY; gy += 50) { ctx.beginPath(); ctx.moveTo(ox, gy); ctx.lineTo(xEnd, gy); ctx.stroke(); }

// Two cycles, well separated; the first carries the annotations.
function cycle(cx) {
  const mid = baseY - 60;
  ctx.beginPath();
  ctx.moveTo(cx - 150, mid);
  ctx.lineTo(cx - 70, mid);
  ctx.quadraticCurveTo(cx - 55, mid - 42, cx - 30, mid);
  ctx.lineTo(cx - 12, mid + 8);
  ctx.lineTo(cx - 2, mid - 130);
  ctx.lineTo(cx + 10, mid + 14);
  ctx.lineTo(cx + 22, mid);
  ctx.lineTo(cx + 48, mid);
  ctx.quadraticCurveTo(cx + 70, mid - 52, cx + 100, mid);
  ctx.lineTo(cx + 150, mid);
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#16a34a';
  ctx.lineJoin = 'round';
  ctx.stroke();
}
const c1 = 520, c2 = 1060;
const mid = baseY - 60;
cycle(c1);
cycle(c2);

// Annotations for the first cycle — one label each, spread across three
// positions so nothing collides: P far left, QRS high above the R peak,
// T to the right.
// P wave
lead(ctx, c1 - 42, mid - 44, c1 - 120, 232, '#2563eb');
textCentered(ctx, 'P wave', c1 - 120, 258, 140, 20, '700', '#2563eb');
textCentered(ctx, 'atria depolarise', c1 - 120, 284, 200, 15, '400', C.sub);
// QRS complex
lead(ctx, c1 - 2, mid - 134, c1, 218, '#16a34a');
textCentered(ctx, 'QRS complex', c1, 218, 180, 20, '700', '#16a34a');
textCentered(ctx, 'ventricles depolarise', c1, 190, 220, 15, '400', C.sub);
// T wave
lead(ctx, c1 + 74, mid - 56, c1 + 160, 232, '#db2777');
textCentered(ctx, 'T wave', c1 + 160, 258, 140, 20, '700', '#db2777');
textCentered(ctx, 'ventricles repolarise', c1 + 160, 284, 220, 15, '400', C.sub);

// grid note
textLeft(ctx, 'Standard paper: 25 mm per second \u2014 one large square = 0.2 s', 120, 548, 700, 16, '600', C.sub);
textLeft(ctx, 'Amplitude: 10 mm = 1 mV \u2014 the heart\u2019s signal at the skin is only about 1 mV, so the monitor amplifies it', 820, 548, 620, 16, '600', C.sub);

// Bottom: heart-rate arithmetic
panelBox(ctx, 90, 610, 1380, 180, C.accentSoft, '#c7d2fe', 16);
textCentered(ctx, 'HEART RATE FROM THE TRACE', 780, 644, 800, 20, '700', C.accent);
textLeft(ctx, 'Rule:  rate (beats per minute) = 300 \u00f7 (number of large squares between two consecutive R waves)', 150, 686, 1250, 19, '600', C.ink);
textLeft(ctx, 'Example:  R\u2013R = 4 large squares   \u2192   rate = 300 \u00f7 4 = 75 beats per minute', 150, 722, 1250, 19, '600', C.ink);
textLeft(ctx, 'Cross-check:  4 large squares = 4 \u00d7 0.2 s = 0.8 s per beat   \u2192   60 \u00f7 0.8 = 75 bpm \u2014 two routes, same answer', 150, 758, 1250, 18, '400', C.sub);

chip(ctx, 'Electrodes on the skin pick up the signal; the monitor filters mains interference and movement artefact before displaying it', 780, 850, 1300, '#f1f5f9', C.sub, 17);

save('a210-ecg.png', canvas);