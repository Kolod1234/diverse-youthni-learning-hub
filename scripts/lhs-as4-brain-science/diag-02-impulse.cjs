// AS 4 Brain Science — diagram 2: resting potential and the action potential.
const { C, textLeft, textCentered, makeCanvas, title, save, dashedLine, panelBox, lead, setFont, roundRect } = require('./common.cjs');

// Map millivolts to canvas y.
function yOf(mV, top, bottom) {
  const min = -90, max = 60;
  return bottom - ((mV - min) / (max - min)) * (bottom - top);
}

function renderActionPotential() {
  const W = 1500, H = 980;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'The action potential: all or nothing',
    'How the voltage across the neurone membrane changes as an impulse passes');

  const L = 170, R = 1420, T = 170, B = 780;

  // Grid + axes.
  ctx.strokeStyle = C.grid;
  ctx.lineWidth = 1;
  for (let mV = -90; mV <= 60; mV += 30) {
    const y = yOf(mV, T, B);
    ctx.beginPath(); ctx.moveTo(L, y); ctx.lineTo(R, y); ctx.stroke();
    textLeft(ctx, mV + ' mV', 100, y, 60, 17, '600', C.sub);
  }

  // Reference dashed lines.
  dashedLine(ctx, L, yOf(-70, T, B), R, yOf(-70, T, B), C.accent2, 3);
  dashedLine(ctx, L, yOf(-55, T, B), R, yOf(-55, T, B), C.warn, 3);
  dashedLine(ctx, L, yOf(0, T, B), R, yOf(0, T, B), C.faint, 2);

  ctx.lineWidth = 3;
  ctx.strokeStyle = C.ink;
  ctx.beginPath(); ctx.moveTo(L, B); ctx.lineTo(L, T - 20); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(L, B); ctx.lineTo(R + 10, B); ctx.stroke();
  textLeft(ctx, 'time \u2192', R - 80, B + 32, 120, 18, '600', C.sub);
  textLeft(ctx, 'membrane voltage (inside relative to outside)', L - 70, T - 40, 420, 18, '600', C.sub);

  // Reference labels.
  textLeft(ctx, 'resting potential  \u2212 70 mV  (the sodium\u2013potassium pump holds it here)', L + 20, yOf(-70, T, B) - 18, 560, 19, '700', C.accent2);
  textLeft(ctx, 'threshold  \u2212 55 mV', R - 300, yOf(-55, T, B) - 20, 280, 19, '700', C.warn);

  // The trace: small sub-threshold wobble, then the full spike.
  const t2x = (t) => L + (t / 8) * (R - L);
  const pts = [
    [0, -70], [0.5, -70], [0.8, -64], [1.1, -70], [1.5, -70], [1.8, -66], [2.1, -70],
    [2.4, -70], [2.5, -55], [2.7, 40], [2.9, 40], [3.2, -10], [3.5, -60],
    [3.8, -76], [4.2, -74], [4.6, -70], [5.5, -70], [8, -70],
  ];
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 5;
  ctx.beginPath();
  pts.forEach(([t, mV], i) => {
    const x = t2x(t), y = yOf(mV, T, B);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  });
  ctx.stroke();

  // Annotations.
  lead(ctx, t2x(1.4), yOf(-66, T, B) - 4, t2x(1.4) + 10, 250);
  textLeft(ctx, 'weak stimulus \u2014 the wobble never reaches threshold, so nothing happens', t2x(1.4) + 25, 235, 380, 18, '600', C.sub);

  lead(ctx, t2x(2.6), yOf(20, T, B), t2x(2.6) + 40, 220);
  textLeft(ctx, 'depolarisation: sodium ion channels open \u2014 the inside turns positive', t2x(2.6) + 55, 205, 420, 18, '600', C.accent);

  lead(ctx, t2x(3.2), yOf(-10, T, B), t2x(3.2) + 70, 420);
  textLeft(ctx, 'repolarisation: potassium ion channels open \u2014 the inside turns negative again', t2x(3.2) + 85, 405, 430, 18, '600', C.accent2);

  lead(ctx, t2x(3.9), yOf(-75, T, B), t2x(3.9) + 20, 700);
  textLeft(ctx, 'refractory period: each patch must reset before firing again \u2014 impulses travel one way only', t2x(3.9) + 35, 715, 560, 18, '600', C.sub);

  // Bottom key panel.
  panelBox(ctx, 90, 830, W - 180, 110, C.amberSoft);
  textCentered(ctx, 'All or nothing: at or above the threshold the neurone fires a full-size impulse; below it, nothing at all.', W / 2, 868, W - 260, 21, '700');
  textCentered(ctx, 'A stronger stimulus does not make bigger impulses \u2014 the brain reads strength as how often the neurones fire.', W / 2, 905, W - 260, 19, '400', C.sub);

  save('as4-action-potential.png', canvas);
}

module.exports = { renderActionPotential };