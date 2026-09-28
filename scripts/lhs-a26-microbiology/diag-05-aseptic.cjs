// A2 6 Figure 5 — aseptic technique and Petri dish safety rules.
const common = require('./common.cjs');
const { C, makeCanvas, title, save, textCentered, textLeft, paragraph, panelBox, chip, arrow, roundRect } = common;

const { canvas, ctx } = makeCanvas(980, 620);
title(ctx, 980, 'Aseptic technique, step by step', 'Protecting the culture, the worker and everyone else');

function panel(x, w, heading, body) {
  panelBox(ctx, x, 130, w, 240, C.panel, C.panelBorder, 14);
  textCentered(ctx, heading, x + w / 2, 158, w - 24, 19, '700', C.accent);
  return paragraph(ctx, body, x + 16, 190, w - 32, 22, 16, '400', C.ink);
}

// Panel 1: sterilise the loop.
const p1x = 50, p1w = 265;
panel(p1x, p1w, '1. Sterilise the inoculating loop', 'Pass the wire loop slowly through the hottest part of a Bunsen flame until it glows red-hot, then let it cool without touching anything. Red-hot kills every cell and spore on the wire.');
// little loop+wire drawing
ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
ctx.beginPath(); ctx.moveTo(p1x + 40, 340); ctx.lineTo(p1x + 150, 340); ctx.stroke();
ctx.lineWidth = 3;
ctx.beginPath(); ctx.arc(p1x + 165, 340, 14, 0, Math.PI * 2); ctx.stroke();
// flame
ctx.fillStyle = '#fdba74'; ctx.strokeStyle = '#ea580c'; ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(p1x + 90, 335);
ctx.bezierCurveTo(p1x + 70, 300, p1x + 100, 285, p1x + 92, 265);
ctx.bezierCurveTo(p1x + 108, 285, p1x + 116, 305, p1x + 100, 335);
ctx.closePath(); ctx.fill(); ctx.stroke();
chip(ctx, 'red hot', p1x + 130, 260, 120, C.warnSoft, '#b91c1c', 16);

// Panel 2: Bunsen convection zone.
const p2x = 335, p2w = 265;
panel(p2x, p2w, '2. Work beside a blue Bunsen flame', 'The hot flame sets up an upward convection current that carries airborne spores and dust away, creating a sterile working zone roughly 15\u201320 cm across. Keep bottles and plates open only inside it.');
// flame + arrows up
ctx.fillStyle = '#60a5fa';
ctx.beginPath();
ctx.moveTo(p2x + 130, 345);
ctx.bezierCurveTo(p2x + 105, 310, p2x + 130, 295, p2x + 125, 270);
ctx.bezierCurveTo(p2x + 140, 295, p2x + 150, 315, p2x + 133, 345);
ctx.closePath(); ctx.fill();
arrow(ctx, p2x + 70, 340, p2x + 70, 265, 3, C.accent2);
arrow(ctx, p2x + 195, 340, p2x + 195, 265, 3, C.accent2);
textCentered(ctx, 'spores carried up and away', p2x + 132, 252, 240, 15, '400', C.accent2);

// Panel 3: flame the bottle neck.
const p3x = 620, p3w = 265;
panel(p3x, p3w, '3. Flame the neck of every bottle', 'Briefly pass the neck of the culture bottle or medium tube through the flame just after opening and again before replacing the lid. The hot, moving air stops spores drifting in and drives contaminants outward.');
// bottle drawing
ctx.fillStyle = '#e0f2fe'; ctx.strokeStyle = '#0369a1'; ctx.lineWidth = 3;
roundRect(ctx, p3x + 95, 290, 46, 70, 8); ctx.fill(); ctx.stroke();
ctx.fillStyle = '#bae6fd';
roundRect(ctx, p3x + 90, 275, 56, 18, 6); ctx.fill(); ctx.stroke();
arrow(ctx, p3x + 62, 282, p3x + 118, 284, 3, C.warn);

// Panel 4 (right of 3, below) is folded into bottom band.
const p4x = 665;
panelBox(ctx, 50, 400, 435, 200, C.amberSoft, '#fde68a', 14);
textCentered(ctx, 'Petri dish safety rules', 267, 428, 400, 20, '700', '#b45309');
paragraph(ctx, 'Tape the dish with two strips across the diameter \u2014 never seal the whole rim. A fully sealed dish becomes anoxic, selectively favouring dangerous anaerobes such as Clostridium.', 70, 458, 400, 23, 17, '400', C.ink);
paragraph(ctx, 'Incubate school cultures at 25 \u00b0C or below. Human pathogens multiply fastest at body temperature (37 \u00b0C), so cooler incubation keeps any accidental contaminant slow and safe.', 70, 536, 400, 23, 17, '400', C.ink);
// correct vs incorrect taping: two dish ellipses
ctx.strokeStyle = C.ok; ctx.lineWidth = 4;
ctx.beginPath(); ctx.ellipse(160, 505, 62, 20, 0, 0, Math.PI * 2); ctx.stroke();
ctx.strokeStyle = C.warn;
ctx.beginPath(); ctx.moveTo(98, 505); ctx.lineTo(222, 505); ctx.stroke();
ctx.strokeStyle = C.warn;
ctx.beginPath(); ctx.arc(160, 505, 62, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
textCentered(ctx, 'two strips \u2014 safe', 160, 545, 130, 15, '600', C.ok);
ctx.strokeStyle = C.warn; ctx.lineWidth = 3.5;
ctx.beginPath(); ctx.ellipse(300, 570, 60, 19, 0, 0, Math.PI * 2); ctx.stroke();
ctx.setLineDash([4, 4]);
ctx.beginPath(); ctx.ellipse(300, 570, 66, 25, 0, 0, Math.PI * 2); ctx.stroke();
ctx.setLineDash([]);
textCentered(ctx, 'fully sealed \u2014 never', 300, 545, 140, 15, '600', C.warn);

// Right bottom: incubation thermometer.
panelBox(ctx, 505, 400, 425, 200, C.accent2Soft, '#bae6fd', 14);
textCentered(ctx, 'Why 25 \u00b0C, not 37 \u00b0C?', 717, 428, 380, 20, '700', '#0369a1');
paragraph(ctx, 'Body temperature is exactly where human pathogens grow fastest. Incubating below 25 \u00b0C keeps intended cultures thriving while an accidental pathogen stays slow \u2014 an engineered safety margin, not a growth preference.', 525, 458, 385, 23, 17, '400', C.ink);
ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#0369a1'; ctx.lineWidth = 3;
roundRect(ctx, 640, 505, 22, 70, 10); ctx.fill(); ctx.stroke();
ctx.fillStyle = C.warn;
roundRect(ctx, 646, 525, 10, 42, 5); ctx.fill();
ctx.strokeStyle = C.faint; ctx.lineWidth = 2;
for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.moveTo(662, 515 + i * 12); ctx.lineTo(674, 515 + i * 12); ctx.stroke(); }
chip(ctx, '\u2264 25 \u00b0C', 730, 545, 120, '#ffffff', '#0369a1', 17);
chip(ctx, '37 \u00b0C = body = risk', 730, 583, 150, C.warnSoft, '#b91c1c', 15);

save('a26-aseptic.png', canvas);
module.exports = common;