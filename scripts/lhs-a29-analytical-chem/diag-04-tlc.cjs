// Diagram 4 — thin-layer chromatography: the plate in the beaker, and the Rf calculation.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, setFont, lead, dashedLine } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 960);
title(ctx, 1560, 'Thin-layer chromatography and Rf values', 'A race between the solvent and each dissolved component');

// ---------- Left panel: the plate in the beaker ----------
panelBox(ctx, 80, 150, 640, 700, C.panel, C.panelBorder, 18);
textCentered(ctx, 'THE PLATE IN THE BEAKER', 400, 192, 560, 24, '700', C.accent);

// Beaker
ctx.lineWidth = 3;
ctx.strokeStyle = C.sub;
ctx.beginPath();
ctx.moveTo(150, 230);
ctx.lineTo(150, 700);
ctx.arcTo(150, 740, 190, 740, 40);
ctx.lineTo(570, 740);
ctx.arcTo(610, 740, 610, 700, 40);
ctx.lineTo(610, 230);
ctx.stroke();
// Solvent
ctx.fillStyle = '#dbeafe';
ctx.fillRect(152, 640, 456, 98);
textLeft(ctx, 'solvent (mobile phase)', 165, 700, 260, 17, '600', '#2563eb');
textLeft(ctx, 'lid slows evaporation', 380, 260, 210, 16, '400', C.faint);
dashedLine(ctx, 160, 250, 600, 250, C.faint, 2);

// TLC plate
ctx.fillStyle = '#fefce8';
ctx.strokeStyle = C.sub;
ctx.lineWidth = 2.5;
ctx.fillRect(330, 290, 84, 390);
ctx.strokeRect(330, 290, 84, 390);

// Baseline, solvent front, spots
dashedLine(ctx, 330, 600, 414, 600, C.ink, 2.5);
dashedLine(ctx, 330, 350, 414, 350, C.warn, 2.5);
ctx.fillStyle = C.accent;
ctx.beginPath(); ctx.ellipse(352, 596, 13, 7, 0, 0, Math.PI * 2); ctx.fill();
ctx.fillStyle = C.accent2;
ctx.beginPath(); ctx.ellipse(392, 596, 13, 7, 0, 0, Math.PI * 2); ctx.fill();
ctx.fillStyle = C.accent;
ctx.beginPath(); ctx.ellipse(352, 446, 15, 8, 0, 0, Math.PI * 2); ctx.fill();
ctx.fillStyle = C.accent2;
ctx.beginPath(); ctx.ellipse(392, 512, 14, 8, 0, 0, Math.PI * 2); ctx.fill();

// Leads and labels
lead(ctx, 414, 350, 470, 350);
textLeft(ctx, 'solvent front — 60 mm above baseline', 478, 350, 240, 17, '600', C.warn);
lead(ctx, 414, 600, 470, 600);
textLeft(ctx, 'baseline — drawn in pencil, never ink (ink dissolves into the solvent)', 478, 596, 240, 16, '400', C.ink);
lead(ctx, 367, 446, 180, 446);
textLeft(ctx, 'spot A rises 36 mm', 120, 424, 230, 17, '600', C.accent);
lead(ctx, 406, 512, 250, 512);
textLeft(ctx, 'spot B rises 21 mm', 160, 530, 220, 17, '600', C.accent2);
textLeft(ctx, 'spots are visible under UV or developed with a stain', 120, 810, 560, 17, '400', C.sub);

// ---------- Right top panel: Rf ----------
panelBox(ctx, 760, 150, 720, 360, C.accentSoft, '#c7d2fe', 18);
textCentered(ctx, 'Rf — THE RETARDATION FACTOR', 1120, 192, 640, 24, '700', C.accent);
textCentered(ctx, 'Rf = distance moved by the substance ÷ distance moved by the solvent front', 1120, 246, 660, 24, '600');
textCentered(ctx, 'Spot A:  Rf = 36 ÷ 60 = 0.60', 1120, 330, 640, 26, '700', C.accent);
textCentered(ctx, 'Spot B:  Rf = 21 ÷ 60 = 0.35', 1120, 384, 640, 26, '700', C.accent2);
textCentered(ctx, 'Compare each Rf with a reference standard run on the same plate.', 1120, 462, 640, 19, '400', C.sub);

// ---------- Right bottom panel: rules ----------
panelBox(ctx, 760, 540, 720, 310, C.panel, C.panelBorder, 18);
textCentered(ctx, 'RULES OF Rf', 1120, 580, 640, 22, '700', C.accent);
let y = 622;
[
  'No units — it is a ratio of two distances measured on the same plate.',
  'Always between 0 and 1: a spot can never overtake the solvent front.',
  'Rf changes with the solvent and the temperature, so comparisons are only valid on one plate.',
  'A single spot does not prove purity by itself — the solvent must be one that separates the likely components.',
].forEach((s) => {
  y = paragraph(ctx, '•  ' + s, 800, y, 640, 26, 18, '400') + 12;
});

save('a29-tlc.png', canvas);