// Diagram 8 — colorimetry: instrument schematic, calibration curve, Beer–Lambert.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, arrow, dashedLine, setFont } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 960);
title(ctx, 1560, 'Colorimetry and the calibration curve', 'How much of a coloured substance is present — measured, not guessed');

// ---------- Left: schematic ----------
panelBox(ctx, 80, 150, 700, 560, C.panel, C.panelBorder, 18);
textCentered(ctx, 'THE INSTRUMENT', 430, 190, 600, 22, '700', C.accent);

// lamp
ctx.beginPath();
ctx.arc(150, 300, 30, 0, Math.PI * 2);
ctx.fillStyle = C.amber;
ctx.fill();
ctx.strokeStyle = C.sub;
ctx.lineWidth = 2.5;
ctx.stroke();
textCentered(ctx, 'lamp', 150, 300, 100, 16, '700', '#7c2d12');
textCentered(ctx, 'light source', 150, 360, 130, 16, '400', C.sub);
arrow(ctx, 182, 300, 218, 300);

// filter
ctx.fillStyle = '#fb923c';
ctx.strokeStyle = C.sub;
ctx.lineWidth = 2.5;
ctx.fillRect(218, 272, 40, 56);
ctx.strokeRect(218, 272, 40, 56);
textCentered(ctx, 'filter', 238, 360, 150, 16, '400', C.sub);
textCentered(ctx, 'complementary colour', 238, 384, 160, 15, '400', C.faint);
arrow(ctx, 260, 300, 296, 300);

// cuvette
ctx.fillStyle = '#dbeafe';
ctx.fillRect(296, 252, 90, 96);
ctx.strokeStyle = C.sub;
ctx.strokeRect(296, 252, 90, 96);
textCentered(ctx, 'cuvette', 341, 360, 130, 16, '400', C.sub);
textCentered(ctx, 'the coloured solution', 341, 384, 170, 15, '400', C.faint);
arrow(ctx, 388, 300, 424, 300);

// detector
panelBox(ctx, 424, 268, 110, 64, C.okSoft, '#bbf7d0', 10);
textCentered(ctx, 'detector', 479, 300, 90, 17, '700');
textCentered(ctx, 'measures the light that gets through', 479, 360, 170, 16, '400', C.sub);
arrow(ctx, 536, 300, 572, 300);

// readout
panelBox(ctx, 572, 268, 160, 64, '#ffffff', C.sub, 10);
textCentered(ctx, 'A = 0.42', 652, 300, 140, 24, '700', C.accent);
textCentered(ctx, 'absorbance readout', 652, 360, 170, 16, '400', C.sub);

paragraph(ctx, 'A blue solution absorbs orange light, so an orange filter is chosen: the filter passes the colour the solution absorbs most strongly. The more concentrated the solution, the less light reaches the detector, and the higher the absorbance reading.', 110, 440, 640, 27, 19, '400', C.sub);

// ---------- Right: calibration curve ----------
panelBox(ctx, 820, 150, 660, 560, '#ffffff', C.panelBorder, 18);
textCentered(ctx, 'CALIBRATION CURVE', 1150, 190, 600, 22, '700', C.accent);

const ox = 900, oy = 640, xEnd = 1400, yTop = 240;
ctx.strokeStyle = C.ink;
ctx.lineWidth = 3;
ctx.beginPath(); ctx.moveTo(ox, yTop); ctx.lineTo(ox, oy); ctx.lineTo(xEnd, oy); ctx.stroke();
textCentered(ctx, 'concentration / mg dm⁻³', (ox + xEnd) / 2, 686, 300, 17, '600');
ctx.save();
ctx.translate(852, 440);
ctx.rotate(-Math.PI / 2);
textCentered(ctx, 'absorbance', 0, 0, 200, 17, '600');
ctx.restore();
for (let c = 0; c <= 50; c += 10) {
  ctx.beginPath();
  ctx.moveTo(ox + c * 10, oy); ctx.lineTo(ox + c * 10, oy + 8);
  ctx.lineWidth = 2; ctx.stroke();
  textCentered(ctx, String(c), ox + c * 10, oy + 22, 40, 14, '400', C.sub);
}
for (let a = 0; a <= 1.0; a += 0.25) {
  const ay = oy - a * 420;
  dashedLine(ctx, ox, ay, xEnd, ay, C.grid, 1.5);
  textLeft(ctx, a.toFixed(2), 856, ay, 40, 14, '400', C.sub);
}
// best-fit line: A = 0.018c → at c=50, A=0.90 → y = 640-378 = 262
ctx.strokeStyle = C.accent;
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(ox, oy);
ctx.lineTo(xEnd, 262);
ctx.stroke();
// standard points
[[10, 0.18], [20, 0.36], [30, 0.54], [40, 0.72], [50, 0.90]].forEach(([c, a]) => {
  ctx.beginPath();
  ctx.arc(ox + c * 10, oy - a * 420, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 2.5;
  ctx.stroke();
});
// unknown read-off: A = 0.62 → c = 34.4
const uy = oy - 0.62 * 420;
dashedLine(ctx, ox, uy, ox + 344, uy, C.warn, 2.5);
dashedLine(ctx, ox + 344, uy, ox + 344, oy, C.warn, 2.5);
ctx.beginPath();
ctx.arc(ox + 344, uy, 6, 0, Math.PI * 2);
ctx.fillStyle = C.warn;
ctx.fill();
textLeft(ctx, 'unknown: A = 0.62', 1050, uy - 16, 200, 16, '600', C.warn);
textLeft(ctx, 'c ≈ 34 mg dm⁻³', ox + 344 + 12, oy - 60, 160, 16, '600', C.warn);

// ---------- Bottom ----------
panelBox(ctx, 80, 740, 1400, 120, C.accentSoft, '#c7d2fe', 14);
textCentered(ctx, 'Beer–Lambert: absorbance rises in direct proportion to concentration — but only within the linear range.', 780, 770, 1340, 19, '600');
textCentered(ctx, 'Beyond the line, dilute the sample and re-measure. Turbidity uses the same instrument: growing microbes scatter light, so a rising absorbance tracks the growth of a culture without opening or destroying it.', 780, 806, 1340, 18, '400', C.sub);

save('a29-colorimetry.png', canvas);