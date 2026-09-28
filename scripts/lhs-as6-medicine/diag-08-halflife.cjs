// AS 6 diagram 8 — bioavailability and the drug half-life decay curve.
const { C, makeCanvas, title, save, panelBox, textCentered, paragraph, dashedLine, textLeft } = require('./common.cjs');

function render() {
  const W = 1500, H = 900;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Half-life: the clock behind every dosage instruction', 'Plasma concentration halves every half-life — no matter how much remains');

  // Graph panel (left).
  const gx = 90, gy = 150, gw = 820, gh = 560;
  panelBox(ctx, gx, gy, gw, gh, '#ffffff', C.panelBorder, 14);
  const ox = gx + 90, oy = gy + gh - 80; // origin
  const pw = gw - 150, ph = gh - 140;
  const maxT = 13, maxC = 100;
  const X = (t) => ox + (t / maxT) * pw;
  const Y = (c) => oy - (c / maxC) * ph;

  // Axes.
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(ox + pw, oy);
  ctx.moveTo(ox, oy);
  ctx.lineTo(ox, oy - ph);
  ctx.stroke();
  ctx.font = '600 17px Arial, Helvetica, sans-serif';
  ctx.fillStyle = C.ink;
  ctx.textAlign = 'center';
  ctx.fillText('Time after dose (hours)', ox + pw / 2, oy + 44);
  ctx.save();
  ctx.translate(gx + 30, oy - ph / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Plasma concentration (mg/L)', 0, 0);
  ctx.restore();

  // Gridlines + halving annotations.
  [100, 75, 50, 25, 12.5].forEach((c) => {
    dashedLine(ctx, ox, Y(c), ox + pw, Y(c), C.grid, 1.5);
    ctx.textAlign = 'right';
    ctx.font = '400 15px Arial, Helvetica, sans-serif';
    ctx.fillStyle = C.sub;
    ctx.fillText(String(c), ox - 12, Y(c) + 5);
  });
  [0, 4, 8, 12].forEach((t) => {
    ctx.textAlign = 'center';
    ctx.font = '400 15px Arial, Helvetica, sans-serif';
    ctx.fillStyle = C.sub;
    ctx.fillText(String(t), X(t), oy + 26);
  });

  // Exponential decay curve through (0,100),(4,50),(8,25),(12,12.5).
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(X(0), Y(100));
  for (let t = 0; t <= 13; t += 0.25) {
    const c = 100 * Math.pow(0.5, t / 4);
    ctx.lineTo(X(t), Y(c));
  }
  ctx.stroke();

  // Points + labels.
  [[0, 100], [4, 50], [8, 25], [12, 12.5]].forEach(([t, c]) => {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(X(t), Y(c), 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });
  ctx.font = '700 16px Arial, Helvetica, sans-serif';
  ctx.fillStyle = C.accent;
  ctx.textAlign = 'left';
  ctx.fillText('100 mg/L', X(0) + 14, Y(100) + 4);
  ctx.fillText('50 mg/L', X(4) + 14, Y(50) - 10);
  ctx.fillText('25 mg/L', X(8) + 14, Y(25) - 10);
  ctx.fillText('12.5 mg/L', X(12) - 40, Y(12.5) - 14);
  // Half-life arrows between points.
  ctx.strokeStyle = C.warn;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([]);
  [[0, 4], [4, 8], [8, 12]].forEach(([a, b]) => {
    ctx.beginPath();
    ctx.moveTo(X(a) + 6, Y(100 * Math.pow(0.5, a / 4)) - 16);
    ctx.lineTo(X(b) - 6, Y(100 * Math.pow(0.5, a / 4)) - 16);
    ctx.stroke();
  });
  ctx.fillStyle = C.warn;
  ctx.font = '600 15px Arial, Helvetica, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('t½ = 4 h', (X(0) + X(4)) / 2, Y(100) - 46);
  ctx.fillText('t½', (X(4) + X(8)) / 2, Y(50) - 46);
  ctx.fillText('t½', (X(8) + X(12)) / 2, Y(25) - 42);

  // Side panel (right).
  const px = 960, pw2 = 460;
  panelBox(ctx, px, 150, pw2, 260, C.accentSoft, C.accent, 14);
  textCentered(ctx, 'Why half-life sets the dose interval', px + pw2 / 2, 190, pw2 - 60, 21, '700', C.accent);
  paragraph(ctx, 'A drug with a 4-hour half-life must be taken roughly every few hours to stay in its working range. Too close together and the level climbs toward toxicity; too far apart and it falls below the effective dose.', px + pw2 / 2, 240, pw2 - 80, 25, 16, '400', C.ink, 'center');

  panelBox(ctx, px, 440, pw2, 270, C.panel, C.panelBorder, 14);
  textCentered(ctx, 'Two traps worth marks', px + pw2 / 2, 478, pw2 - 60, 21, '700', C.ink);
  paragraph(ctx, '1. Decay is EXPONENTIAL: after 8 hours, HALF the drug remains (25 mg/L) — not zero.', px + 40, 522, pw2 - 80, 24, 16, '400', C.ink);
  paragraph(ctx, '2. Each half-life halves whatever REMAINS at that moment — you never halve the original dose again.', px + 40, 580, pw2 - 80, 24, 16, '400', C.ink);
  paragraph(ctx, 'IV injection delivers the whole dose into the circulation — bioavailability 100%. Swallowed tablets lose some on the way: less than 100%.', px + 40, 638, pw2 - 80, 24, 16, '400', C.sub);

  // Bottom note.
  panelBox(ctx, 90, 740, 1330, 110, C.panel, C.panelBorder, 14);
  textCentered(ctx, 'Bioavailability = the fraction of an administered dose that reaches the systemic circulation unchanged.  Bioequivalence = a generic releasing its active ingredient into the blood at the same rate and to the same extent as the original brand.', W / 2, 778, 1240, 17, '600', C.ink);
  textCentered(ctx, 'Half-life (t½) = the time taken for the plasma concentration to fall by half — the number that turns a drug&rsquo;s chemistry into a dosage instruction.', W / 2, 818, 1240, 17, '400', C.sub);

  save('as6-halflife.png', canvas);
}

module.exports = { render };