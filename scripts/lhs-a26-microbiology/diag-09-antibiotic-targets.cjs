// A2 6 Figure 9 — antibiotic targets inside or on a bacterial cell, and selective toxicity.
const common = require('./common.cjs');
const { C, makeCanvas, title, save, textCentered, textLeft, paragraph, panelBox, chip, arrow, lead, roundRect } = common;

const { canvas, ctx } = makeCanvas(980, 660);
title(ctx, 980, 'How antibiotics attack bacteria', 'Four classic targets \u2014 and why human cells survive');

// Big bacterial cell in centre.
const bx = 480, by = 400, rw = 360, rh = 200;
ctx.beginPath(); ctx.ellipse(bx, by, rw / 2 + 12, rh / 2 + 12, 0, 0, Math.PI * 2);
ctx.fillStyle = C.accent2Soft; ctx.fill();
ctx.strokeStyle = C.accent2; ctx.lineWidth = 2.5; ctx.stroke();
ctx.beginPath(); ctx.ellipse(bx, by, rw / 2, rh / 2, 0, 0, Math.PI * 2);
ctx.fillStyle = '#ddd6fe'; ctx.fill();
ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 3; ctx.stroke();
ctx.beginPath(); ctx.ellipse(bx, by, rw / 2 - 16, rh / 2 - 16, 0, 0, Math.PI * 2);
ctx.strokeStyle = '#4f46e5'; ctx.lineWidth = 2.5; ctx.stroke();
ctx.fillStyle = '#1f2937';
[[-80, 20], [-40, -20], [0, 40], [50, -50], [90, 10], [-100, -40], [20, -10], [120, 50], [-60, 60]].forEach(([px, py]) => {
  ctx.beginPath(); ctx.arc(bx + px, by + py, 5, 0, Math.PI * 2); ctx.fill();
});
textCentered(ctx, 'bacterial cell', bx, by + 118, 200, 18, '600', C.sub);

// Four target cards with arrows.
const cards = [
  { t: 'Cell wall synthesis', ex: 'penicillins and cephalosporins block peptidoglycan links \u2192 wall weakens \u2192 cell bursts', x: 60, y: 150 },
  { t: 'Protein synthesis \u2014 70S ribosomes', ex: 'tetracyclines and aminoglycosides stall the bacterial ribosome; human 80S ribosomes are untouched', x: 620, y: 150 },
  { t: 'DNA replication', ex: 'quinolones inhibit the enzymes that unwind bacterial DNA, so the genome cannot be copied', x: 60, y: 500 },
  { t: 'Folate (vitamin B9) synthesis', ex: 'sulfonamides block the pathway bacteria use to make folate \u2014 humans take folate ready-made in food', x: 620, y: 500 },
];
const anchors = [[300, 320], [660, 320], [300, 470], [660, 470]];
cards.forEach((c, i) => {
  panelBox(ctx, c.x, c.y, 300, 120, C.panel, C.panelBorder, 12);
  textLeft(ctx, c.t, c.x + 14, c.y + 24, 272, 17, '700', C.accent);
  paragraph(ctx, c.ex, c.x + 14, c.y + 50, 272, 20, 15, '400', C.ink);
  arrow(ctx, c.x + (i % 2 === 0 ? 300 : 0), c.y + (i < 2 ? 110 : 10), anchors[i][0], anchors[i][1], 3, '#4f46e5');
});

// Bottom band: selective toxicity.
panelBox(ctx, 60, 540 + 40, 860, 64, C.accentSoft, '#c7d2fe', 12);
textCentered(ctx, 'SELECTIVE TOXICITY: every target is either unique to bacteria (peptidoglycan, 70S ribosomes, bacterial folate pathway) or differs enough from the human version that the drug can spare our cells \u2014 which is also exactly why antibiotics cannot harm viruses: a virus has none of these structures.', 490, 592, 830, 18, '600', '#3730a3');

save('a26-antibiotic-targets.png', canvas);
module.exports = common;