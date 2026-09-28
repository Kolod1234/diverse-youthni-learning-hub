// Diagram 10 — mass spectrometry: instrument stages and a worked spectrum.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, arrow, lead } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 960);
title(ctx, 1560, 'Mass spectrometry', 'Weigh the whole molecule — then read the pieces it breaks into');

// ---------- Top left: instrument stages ----------
panelBox(ctx, 80, 150, 900, 330, C.panel, C.panelBorder, 18);
textCentered(ctx, 'INSIDE THE MASS SPECTROMETER', 530, 188, 800, 22, '700', C.accent);
const stages = [
  { t: 'Vaporise', b: 'sample becomes gas' },
  { t: 'Ionise', b: 'electron knocked off → M⁺' },
  { t: 'Accelerate', b: 'electric field gives speed' },
  { t: 'Separate', b: 'drift: light ions arrive first' },
  { t: 'Detect', b: 'signal vs m/z → spectrum' },
];
stages.forEach((s, i) => {
  const x = 110 + i * 168;
  panelBox(ctx, x, 240, 140, 130, C.accentSoft, '#c7d2fe', 12);
  textCentered(ctx, s.t, x + 70, 278, 120, 18, '700');
  paragraph(ctx, s.b, x + 14, 310, 112, 22, 14, '400', C.sub);
  if (i < stages.length - 1) arrow(ctx, x + 142, 305, x + 164, 305);
});
textCentered(ctx, 'The instrument never "sees" atoms directly: it sorts positively charged ions by mass-to-charge ratio (m/z).', 530, 425, 840, 18, '400', C.sub);

// ---------- Top right: what the spectrum gives ----------
panelBox(ctx, 1020, 150, 460, 330, C.okSoft, '#bbf7d0', 18);
textCentered(ctx, 'WHAT THE SPECTRUM GIVES', 1250, 190, 400, 21, '700', C.ok);
let yy = 232;
[
  'M⁺ = the molecular ion: its m/z equals the relative molecular mass, Mr.',
  'Fragments show how the molecule breaks — the pattern is a structural fingerprint.',
  'The base peak (tallest) is set to 100% relative abundance; others are scaled to it.',
  'Isotope peaks: M+1 (¹³C) and M+2 (³⁷Cl or ⁸¹Br — a 3 : 1 or 1 : 1 doublet reveals chlorine or bromine).',
].forEach((s) => {
  yy = paragraph(ctx, '•  ' + s, 1050, yy, 400, 25, 17, '400') + 12;
});

// ---------- Bottom left: spectrum of propanone ----------
panelBox(ctx, 80, 510, 900, 400, '#ffffff', C.panelBorder, 18);
textCentered(ctx, 'SPECTRUM: PROPANONE, CH₃COCH₃', 530, 548, 600, 20, '700', C.accent);
const ox = 190, oy = 830, xEnd = 900;
ctx.strokeStyle = C.ink;
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(ox, 570); ctx.lineTo(ox, oy); ctx.lineTo(xEnd, oy);
ctx.stroke();
textCentered(ctx, 'm/z', (ox + xEnd) / 2 + 60, 862, 200, 17, '600');
ctx.save();
ctx.translate(140, 700);
ctx.rotate(-Math.PI / 2);
textCentered(ctx, 'relative abundance / %', 0, 0, 300, 16, '600');
ctx.restore();
const mx = (m) => ox + (m / 75) * (xEnd - ox);
const bars = [
  { m: 15, ab: 38, label: '15' },
  { m: 43, ab: 100, label: '43' },
  { m: 58, ab: 25, label: '58' },
];
bars.forEach((b) => {
  const h = b.ab * 2.4;
  ctx.fillStyle = C.accent;
  ctx.fillRect(mx(b.m) - 8, oy - h, 16, h);
  ctx.strokeStyle = '#3730a3';
  ctx.lineWidth = 2;
  ctx.strokeRect(mx(b.m) - 8, oy - h, 16, h);
  textCentered(ctx, b.label, mx(b.m), oy + 22, 60, 15, '400', C.sub);
});
ctx.save();
ctx.translate(140, 830);
ctx.rotate(-Math.PI / 2);
ctx.restore();
// annotations
lead(ctx, mx(15) + 8, oy - 38 * 2.4, mx(15) + 90, 700);
textLeft(ctx, 'CH₃⁺ fragment', mx(15) + 96, 700, 140, 16, '600', C.sub);
lead(ctx, mx(43) + 8, oy - 240, mx(43) - 40, 620);
textLeft(ctx, 'base peak: CH₃CO⁺', mx(43) - 150, 610, 240, 16, '700', C.sub);
lead(ctx, mx(58) + 8, oy - 25 * 2.4, mx(58) + 40, 780);
textLeft(ctx, 'M⁺ — Mr = 58', mx(58) + 46, 786, 150, 16, '700', C.accent);

// ---------- Bottom right: reading it ----------
panelBox(ctx, 1020, 510, 460, 400, C.accentSoft, '#c7d2fe', 18);
textCentered(ctx, 'READING THIS SPECTRUM', 1250, 548, 400, 20, '700', C.accent);
yy = 590;
[
  '1  M⁺ at 58 → the relative molecular mass is 58. Propanone, C₃H₆O, fits: 36 + 6 + 16.',
  '2  Base peak at 43 is the fragment CH₃CO⁺ — the molecule breaks beside the C=O.',
  '3  Peak at 15 is CH₃⁺ — the leftover methyl piece.',
  '4  Mr + fragment pattern together give the identity. Neither alone is enough: C₄H₁₀ also has Mr 58, but it cannot form a 43 carbonyl fragment.',
].forEach((s) => {
  yy = paragraph(ctx, s, 1050, yy, 400, 25, 17, '400') + 12;
});

save('a29-ms.png', canvas);