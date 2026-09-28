// Diagram 7 — volumetric analysis: titration apparatus, method and arithmetic.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, lead, dashedLine } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 960);
title(ctx, 1560, 'Volumetric analysis: the titration', 'A measured volume meets a measured concentration — the unknown is calculated from the known');

// ---------- Left: apparatus ----------
panelBox(ctx, 80, 150, 520, 700, C.panel, C.panelBorder, 18);
textCentered(ctx, 'THE APPARATUS', 340, 192, 440, 24, '700', C.accent);

// Burette
ctx.fillStyle = '#eff6ff';
ctx.strokeStyle = C.sub;
ctx.lineWidth = 2.5;
ctx.fillRect(320, 230, 40, 320);
ctx.strokeRect(320, 230, 40, 320);
ctx.beginPath();
ctx.moveTo(326, 550);
ctx.lineTo(354, 550);
ctx.lineTo(348, 585);
ctx.lineTo(332, 585);
ctx.closePath();
ctx.fillStyle = '#eff6ff';
ctx.fill();
ctx.stroke();
textLeft(ctx, 'burette: the solution of KNOWN concentration', 380, 300, 200, 17, '600', C.sub);
lead(ctx, 360, 560, 380, 560);

// Conical flask
ctx.strokeStyle = C.sub;
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(322, 585);
ctx.lineTo(322, 625);
ctx.moveTo(358, 585);
ctx.lineTo(358, 625);
ctx.stroke();
ctx.beginPath();
ctx.moveTo(282, 745);
ctx.lineTo(325, 625);
ctx.lineTo(355, 625);
ctx.lineTo(398, 745);
ctx.closePath();
ctx.stroke();
ctx.fillStyle = '#fbcfe8';
ctx.beginPath();
ctx.moveTo(299, 705);
ctx.lineTo(325, 640);
ctx.lineTo(355, 640);
ctx.lineTo(381, 705);
ctx.closePath();
ctx.fill();
ctx.strokeStyle = C.sub;
ctx.stroke();
textLeft(ctx, 'conical flask: a measured 25.0 cm³ of the unknown + 2–3 drops of indicator', 250, 782, 380, 17, '600', C.sub);
textLeft(ctx, 'pink persists: end point reached', 430, 725, 130, 15, '400', C.sub);
// White tile
ctx.fillStyle = '#ffffff';
ctx.strokeStyle = C.faint;
ctx.lineWidth = 2;
ctx.fillRect(262, 755, 156, 12);
textLeft(ctx, 'white tile makes the colour change unmistakable', 250, 800, 380, 16, '400', C.sub);
textLeft(ctx, 'swirl continuously; add drop by drop near the end point', 130, 838, 420, 17, '600', C.accent);

// ---------- Middle: method ----------
panelBox(ctx, 640, 150, 420, 700, C.accentSoft, '#c7d2fe', 18);
textCentered(ctx, 'THE METHOD, IN ORDER', 850, 192, 360, 24, '700', C.accent);
let y = 240;
[
  '1  Rinse the burette with the standard solution, then fill it. Read the bottom of the meniscus at eye level and record the initial volume.',
  '2  Use a pipette (with a safety filler) to place exactly 25.0 cm³ of the unknown solution in the flask. Add 2–3 drops of indicator.',
  '3  Titrate: run the standard in while swirling. Near the end point, add drop by drop.',
  '4  The end point is the first permanent colour change. Record the final burette reading.',
  '5  Repeat until titres are concordant — agreeing within 0.10 cm³ — and average only the concordant results.',
].forEach((s) => {
  y = paragraph(ctx, s, 672, y, 360, 26, 18, '400') + 16;
});

// ---------- Right: arithmetic ----------
panelBox(ctx, 1100, 150, 380, 700, C.panel, C.panelBorder, 18);
textCentered(ctx, 'THE ARITHMETIC', 1290, 192, 320, 24, '700', C.accent);
y = 232;
y = paragraph(ctx, 'titre (cm³) = final reading − initial reading', 1128, y, 324, 26, 18, '700') + 20;
y = paragraph(ctx, 'moles n = concentration c × volume V, with V converted to dm³: cm³ ÷ 1000', 1128, y, 324, 26, 18, '700') + 26;
panelBox(ctx, 1112, 460, 356, 360, '#ffffff', C.panelBorder, 14);
textCentered(ctx, 'WORKED EXAMPLE', 1290, 490, 300, 18, '700', C.accent);
paragraph(ctx, '22.50 cm³ of 0.100 mol dm⁻³ HCl neutralises 25.0 cm³ of NaOH (1 : 1).', 1136, 528, 310, 24, 17, '600');
y = 600;
[
  'n(HCl) = 0.100 × 0.02250 = 2.25 × 10⁻³ mol',
  'n(NaOH) = 2.25 × 10⁻³ mol (1 : 1 ratio)',
  'c(NaOH) = 2.25 × 10⁻³ ÷ 0.0250',
  '        = 0.0900 mol dm⁻³',
].forEach((s) => {
  y = paragraph(ctx, s, 1136, y, 310, 25, 17, '400') + 8;
});

save('a29-titration.png', canvas);