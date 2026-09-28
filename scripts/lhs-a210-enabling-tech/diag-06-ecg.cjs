// Diagram 6 — the ECG: trace, waves, and heart rate from the grid.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, chip, lead } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 920);
title(ctx, 1560, 'The electrocardiogram', 'The heart\u2019s electrical cycle, drawn as three recognisable waves');

// Trace panel
panelBox(ctx, 90, 150, 1380, 420, '#ffffff', C.panelBorder, 16);
const baseY = 480, ox = 170, xEnd = 1420;
// grid: small squares 10 px, big (5x5) 50 px
ctx.strokeStyle = '#f1f5f9';
ctx.lineWidth = 1;
for (let gx = ox; gx <= xEnd; gx += 10) { ctx.beginPath(); ctx.moveTo(gx, 190); ctx.lineTo(gx, baseY); ctx.stroke(); }
for (let gy = 190; gy <= baseY; gy += 10) { ctx.beginPath(); ctx.moveTo(ox, gy); ctx.lineTo(xEnd, gy); ctx.stroke(); }
ctx.strokeStyle = '#e2e8f0';
for (let gx = ox; gx <= xEnd; gx += 50) { ctx.beginPath(); ctx.moveTo(gx, 190); ctx.lineTo(gx, baseY); ctx.stroke(); }
for (let gy = 190; gy <= baseY; gy += 50) { ctx.beginPath(); ctx.moveTo(ox, gy); ctx.lineTo(xEnd, gy); ctx.stroke(); }

// one cycle width 300 px = 1 s at 300 px/s? Grid: 1 big square = 0.2 s → 50 px per big square → 250 px/s.
// Draw two cycles: P (bump up 30), Q (dip 12), R (spike up 130), S (dip 18), T (bump up 40).
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
  return mid;
}
const mid = cycle(370);
cycle(890);
cycle(1330);

const labels = [
  ['P wave', cx => cx - 42, 'atria depolarise\n(the atria contract)', '#2563eb'],
  ['QRS', cx => cx + 4, 'ventricles depolarise\n(ventricles contract)', '#16a34a'],
  ['T wave', cx => cx + 74, 'ventricles repolarise\n(ventricles reset)', '#db2777'],
];
labels.forEach(([name, dx, meaning, col]) => {
  const cx = 370;
  const lx = dx(cx);
  const ly = name === 'P wave' ? mid - 52 : name === 'QRS' ? mid - 140 : mid - 62;
  lead(ctx, lx, ly, lx, mid - 175, C.sub);
  textCentered(ctx, name, lx, mid - 200, 120, 19, '700', col);
  textCentered(ctx, meaning.split('\n')[0], lx, mid - 224, 200, 13, '400', C.sub);
  textCentered(ctx, meaning.split('\n')[1], lx, mid - 243, 200, 13, '400', C.sub);
});

// grid note
textLeft(ctx, 'Standard paper: 25 mm per second \u2014 one large square = 0.2 s', 120, 548, 700, 16, '600', C.sub);
textLeft(ctx, 'Amplitude: 10 mm = 1 mV \u2014 the hearts signal at the skin is only about 1 mV, so the monitor amplifies it', 820, 548, 620, 16, '600', C.sub);

// Bottom: heart-rate arithmetic
panelBox(ctx, 90, 610, 1380, 180, C.accentSoft, '#c7d2fe', 16);
textCentered(ctx, 'HEART RATE FROM THE TRACE', 780, 644, 800, 20, '700', C.accent);
textLeft(ctx, 'Rule:  rate (beats per minute) = 300 \u00f7 (number of large squares between two consecutive R waves)', 150, 686, 1250, 19, '600', C.ink);
textLeft(ctx, 'Example:  R\u2013R = 4 large squares   \u2192   rate = 300 \u00f7 4 = 75 beats per minute', 150, 722, 1250, 19, '600', C.ink);
textLeft(ctx, 'Cross-check:  4 large squares = 4 \u00d7 0.2 s = 0.8 s per beat   \u2192   60 \u00f7 0.8 = 75 bpm \u2014 two routes, same answer', 150, 758, 1250, 18, '400', C.sub);

chip(ctx, 'Electrodes on the skin pick up the signal; the monitor filters mains interference and movement artefact before displaying it', 780, 850, 1300, '#f1f5f9', C.sub, 17);

save('a210-ecg.png', canvas);