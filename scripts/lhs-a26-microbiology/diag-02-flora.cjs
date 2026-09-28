// A2 6 Figure 2 — where microflora live, and the three relationships with the host.
const common = require('./common.cjs');
const { C, makeCanvas, title, save, textCentered, textLeft, lead, paragraph, panelBox, chip, roundRect } = common;

const { canvas, ctx } = makeCanvas(960, 620);
title(ctx, 960, 'Microorganisms and the human body', 'Non-pathogenic, commensal and pathogenic microflora');

// Left: simple human silhouette with callout sites.
const cx = 240;
// head
ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
ctx.beginPath(); ctx.arc(cx, 190, 34, 0, Math.PI * 2); ctx.stroke();
// body
roundRect(ctx, cx - 60, 230, 120, 150, 40); ctx.stroke();
// legs
ctx.beginPath(); ctx.moveTo(cx - 30, 380); ctx.lineTo(cx - 34, 470); ctx.stroke();
ctx.beginPath(); ctx.moveTo(cx + 30, 380); ctx.lineTo(cx + 34, 470); ctx.stroke();
// arms
ctx.beginPath(); ctx.moveTo(cx - 60, 250); ctx.lineTo(cx - 92, 350); ctx.stroke();
ctx.beginPath(); ctx.moveTo(cx + 60, 250); ctx.lineTo(cx + 92, 350); ctx.stroke();

const sites = [
  { label: 'Skin \u2014 Staphylococcus epidermidis', x: cx - 60, y: 300, lx: 40, ly: 300 },
  { label: 'Nose and throat \u2014 Staphylococcus aureus', x: cx + 30, y: 185, lx: 330, ly: 175 },
  { label: 'Mouth \u2014 Streptococcus species', x: cx + 18, y: 208, lx: 330, ly: 220 },
  { label: 'Gut \u2014 Escherichia coli, Lactobacillus', x: cx + 40, y: 330, lx: 330, ly: 300 },
];
sites.forEach((s) => {
  lead(ctx, s.x, s.y, s.lx === 40 ? 150 : s.lx, s.ly, C.accent2);
});
textLeft(ctx, sites[0].label, 40, 300, 140, 17, '600', C.ink);
textLeft(ctx, sites[1].label, 330, 175, 250, 18, '600', C.ink);
textLeft(ctx, sites[2].label, 330, 220, 250, 18, '600', C.ink);
textLeft(ctx, sites[3].label, 330, 300, 260, 18, '600', C.ink);

// Right: three relationship cards.
const cards = [
  { head: 'Non-pathogenic', fill: C.okSoft, stroke: '#bbf7d0', headCol: '#15803d',
    body: 'Harmless wherever found. Many carry out vital ecological jobs such as nutrient cycling and decay.' },
  { head: 'Commensal', fill: C.accent2Soft, stroke: '#bae6fd', headCol: '#0369a1',
    body: 'Lives on or in the host, gains nutrition and shelter, causes no harm \u2014 and defends it by competing with pathogens for space, nutrients and attachment sites.' },
  { head: 'Pathogenic', fill: C.warnSoft, stroke: '#fecaca', headCol: '#b91c1c',
    body: 'Causes infectious disease: damages host cells, releases toxins or triggers damaging immune responses.' },
];
cards.forEach((c, i) => {
  const x = 600, y = 130 + i * 150, w = 320, h = 130;
  panelBox(ctx, x, y, w, h, c.fill, c.stroke, 14);
  textLeft(ctx, c.head, x + 18, y + 28, w - 36, 21, '700', c.headCol);
  paragraph(ctx, c.body, x + 18, y + 56, w - 36, 22, 17, '400', C.ink);
});

// Bottom band: the competition idea.
panelBox(ctx, 60, 545, 840, 55, C.accentSoft, '#c7d2fe', 12);
textCentered(ctx, 'A fully occupied surface leaves an invader nowhere to attach and nothing to eat \u2014 commensal flora are a physical and chemical barrier to pathogens.', 480, 572, 800, 19, '600', '#3730a3');

save('a26-flora.png', canvas);
module.exports = common;