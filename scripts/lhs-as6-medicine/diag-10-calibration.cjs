// AS 6 diagram 10 — Beer–Lambert law and the calibration curve.
const { C, makeCanvas, title, save, panelBox, textCentered, paragraph, dashedLine } = require('./common.cjs');

function render() {
  const W = 1500, H = 900;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Finding an unknown concentration', 'Calibration curve and the Beer–Lambert law');

  // Graph panel (left).
  const gx = 90, gy = 150, gw = 800, gh = 620;
  panelBox(ctx, gx, gy, gw, gh, '#ffffff', C.panelBorder, 14);
  const ox = gx + 100, oy = gy + gh - 90;
  const pw = gw - 170, ph = gh - 150;
  const X = (c) => ox + (c / 50) * pw; // concentration 0–50 µg/cm3
  const Y = (a) => oy - (a / 1.0) * ph; // absorbance 0–1.0

  // Gridlines.
  for (let a = 0; a <= 1.0; a += 0.2) {
    dashedLine(ctx, ox, Y(a), ox + pw, Y(a), C.grid, 1.5);
    ctx.fillStyle = C.sub;
    ctx.font = '400 15px Arial, Helvetica, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(a.toFixed(1), ox - 12, Y(a) + 5);
  }
  for (let c = 0; c <= 50; c += 10) {
    ctx.fillStyle = C.sub;
    ctx.font = '400 15px Arial, Helvetica, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(c), X(c), oy + 26);
  }

  // Axes.
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(ox + pw, oy);
  ctx.moveTo(ox, oy);
  ctx.lineTo(ox, oy - ph);
  ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.font = '600 17px Arial, Helvetica, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Concentration of standard (µg/cm³)', ox + pw / 2, oy + 56);
  ctx.save();
  ctx.translate(gx + 34, oy - ph / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Absorbance', 0, 0);
  ctx.restore();

  // Straight line through origin (A = 0.016 c).
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(X(0), Y(0));
  ctx.lineTo(X(50), Y(0.8));
  ctx.stroke();

  // Standard points.
  [[10, 0.16], [20, 0.32], [30, 0.48], [40, 0.64], [50, 0.8]].forEach(([c, a]) => {
    ctx.fillStyle = C.accent;
    ctx.beginPath();
    ctx.arc(X(c), Y(a), 6, 0, Math.PI * 2);
    ctx.fill();
  });

  // Unknown sample at A = 0.40 → c = 25.
  dashedLine(ctx, ox, Y(0.4), X(25), Y(0.4), C.warn, 2.5);
  dashedLine(ctx, X(25), Y(0.4), X(25), oy, C.warn, 2.5);
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = C.warn;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(X(25), Y(0.4), 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = C.warn;
  ctx.font = '700 17px Arial, Helvetica, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('unknown sample: A = 0.40', X(25) + 16, Y(0.4) - 12);
  ctx.fillText('→ read down: 25 µg/cm³', ox + pw - 150, oy - 20);

  // Warning chip.
  panelBox(ctx, ox + 30, oy - ph + 24, 330, 66, C.warnSoft, C.warn, 12);
  textCentered(ctx, 'INTERPOLATE within the standards —', ox + 195, oy - ph + 46, 300, 16, '700', C.warn);
  textCentered(ctx, 'never extrapolate beyond them: the line stops being straight', ox + 195, oy - ph + 72, 300, 14, '400', C.warn);

  // Right panels.
  const px = 940, pw2 = 480;
  panelBox(ctx, px, 150, pw2, 240, C.accentSoft, C.accent, 14);
  textCentered(ctx, 'The Beer–Lambert law', px + pw2 / 2, 190, pw2 - 60, 22, '700', C.accent);
  textCentered(ctx, 'A = ε × c × l', px + pw2 / 2, 240, pw2 - 60, 30, '700', C.ink);
  const defs = [
    'A — absorbance (unitless measure of light absorbed)',
    'ε — molar absorptivity: a constant for the substance and wavelength',
    'c — concentration of the absorbing substance',
    'l — path length of light through the cuvette (usually 1 cm)',
  ];
  defs.forEach((d, i) => {
    paragraph(ctx, d, px + 40, 282 + i * 26, pw2 - 80, 22, 15, '400', C.ink);
  });

  panelBox(ctx, px, 420, pw2, 350, C.panel, C.panelBorder, 14);
  textCentered(ctx, 'Building the curve, step by step', px + pw2 / 2, 458, pw2 - 60, 21, '700', C.ink);
  const steps = [
    '1. Prepare serial dilutions — standards of known, accurate concentration.',
    '2. Measure the absorbance of each standard at the chosen wavelength.',
    '3. Plot absorbance against concentration — a straight line through the origin.',
    '4. Measure the unknown sample&rsquo;s absorbance under identical conditions.',
    '5. Read across to the line and down — the unknown concentration.',
    '6. Mind the dilution factor: if 25 cm³ of 250 cm³ was analysed, multiply by 10.',
  ];
  steps.forEach((s, i) => {
    paragraph(ctx, s, px + 40, 500 + i * 44, pw2 - 80, 26, 16, '400', C.sub);
  });

  save('as6-calibration.png', canvas);
}

module.exports = { render };