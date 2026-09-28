// Diagram 10 — data collection and filtering: raw vs filtered signal.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, chip, lead } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 980);
title(ctx, 1560, 'Data collection and filtering', 'The same heart-rate trace before and after filtering \u2014 what noise is, and how honest analysis removes it');

// deterministic pseudo-random
let seed = 42;
function rnd() { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; }

function trace(y0, h, withNoise, withDrift) {
  ctx.beginPath();
  for (let i = 0; i <= 120; i++) {
    const x = 170 + i * 10.4;
    let v = 78 + 6 * Math.sin(i / 14); // slow physiological wander
    if (withDrift) v += i * 0.12; // baseline drift
    if (withNoise) v += (rnd() - 0.5) * 7; // high-frequency noise
    let spike = 0;
    if (withNoise) {
      if (i === 38) spike = 45; // movement artefact spike
      if (i === 76) spike = -35; // probe-off drop
    }
    const y = y0 + h - ((v - 70 + 0) / 40) * h - spike * (h / 40);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.lineWidth = 3;
  ctx.strokeStyle = withNoise ? '#f97316' : '#16a34a';
  ctx.stroke();
}

// Top: raw
panelBox(ctx, 90, 150, 1380, 300, '#ffffff', '#fed7aa', 14);
textLeft(ctx, 'RAW SIGNAL — as the sensor recorded it', 130, 184, 900, 19, '700', '#ea580c');
// axes
ctx.strokeStyle = C.sub; ctx.lineWidth = 2.5;
ctx.beginPath(); ctx.moveTo(170, 210); ctx.lineTo(170, 410); ctx.lineTo(1420, 410); ctx.stroke();
trace(210, 200, true, true);
const ann = [
  ['movement artefact \u2014 the spike is the patient, not the heart', 170 + 38 * 10.4, 214, '#ea580c'],
  ['probe disturbed \u2014 a drop to a false value', 170 + 76 * 10.4, 236, '#ea580c'],
  ['high-frequency noise \u2014 sensor and mains interference', 900, 250, '#ea580c'],
  ['baseline drift \u2014 slow change of zero point over time', 1140, 300, '#ea580c'],
];
ann.forEach(([t, x, y, col]) => textCentered(ctx, t, x, y, 320, 14, '600', col));
textCentered(ctx, 'heart rate / bpm        time \u2192 (one sample every 10 s)', 800, 432, 900, 15, '600', C.sub);

// Bottom: filtered
panelBox(ctx, 90, 470, 1380, 300, '#ffffff', '#bbf7d0', 14);
textLeft(ctx, 'FILTERED SIGNAL — after the analysis a professional would apply', 130, 504, 1100, 19, '700', '#16a34a');
ctx.strokeStyle = C.sub; ctx.lineWidth = 2.5;
ctx.beginPath(); ctx.moveTo(170, 530); ctx.lineTo(170, 730); ctx.lineTo(1420, 730); ctx.stroke();
// smoothed: 3-point moving average, spikes removed
const raw = [];
seed = 7;
for (let i = 0; i <= 120; i++) {
  let v = 78 + 6 * Math.sin(i / 14) + (rnd() - 0.5) * 7;
  if (i === 38) v += 45;
  if (i === 76) v -= 35;
  raw.push(v);
}
ctx.beginPath();
for (let i = 0; i <= 120; i++) {
  let v = (raw[i - 1] === undefined ? raw[i] : raw[i - 1], 0);
  const a = raw[i - 1] === undefined ? raw[i] : raw[i - 1];
  const b = raw[i];
  const c = raw[i + 1] === undefined ? raw[i] : raw[i + 1];
  let m = (a + b + c) / 3;
  m -= i * 0.12; // remove drift
  const x = 170 + i * 10.4;
  const y = 530 + 200 - ((m - 70) / 40) * 200;
  if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
}
ctx.lineWidth = 3;
ctx.strokeStyle = '#16a34a';
ctx.stroke();
const ann2 = [
  ['spike replaced by neighbours (median/mean filter)', 170 + 38 * 10.4, 560, '#16a34a'],
  ['noise smoothed by a 3-point moving average', 700, 580, '#16a34a'],
  ['drift corrected \u2014 zero point restored', 1210, 560, '#16a34a'],
];
ann2.forEach(([t, x, y, col]) => textCentered(ctx, t, x, y, 320, 14, '600', col));
textCentered(ctx, 'the underlying physiological story \u2014 a steady rate of about 78 bpm \u2014 is now visible and trustworthy', 800, 752, 1100, 15, '600', C.sub);

// side rules
panelBox(ctx, 90, 790, 1380, 160, '#f1f5f9', '#cbd5e1', 14);
const rules = [
  ['Sampling rate', 'samples must be taken often enough to catch the fastest real change \u2014 a heartbeat needs more than one reading a minute'],
  ['Resolution', 'the smallest change the device can distinguish \u2014 a monitor reading to whole bpm cannot report a 0.5 bpm improvement'],
  ['Calibration', 'before use: check the zero (no signal) and the span (a known standard) \u2014 the same two-point logic as the colorimeter'],
  ['Filter honestly', 'record the raw data, state the filter used, and never smooth away a genuine change \u2014 the filter serves the truth, not the graph'],
];
rules.forEach(([h, d], i) => {
  const x = 130 + (i % 2) * 690;
  const y = 828 + Math.floor(i / 2) * 60;
  textLeft(ctx, h + ' \u2014', x, y, 640, 17, '700', C.accent);
  textLeft(ctx, d, x + 150, y, 490, 14, '400', C.sub);
});

save('a210-filtering.png', canvas);