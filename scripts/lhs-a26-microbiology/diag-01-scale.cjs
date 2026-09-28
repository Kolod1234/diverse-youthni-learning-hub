// A2 6 Figure 1 — logarithmic size comparison of microorganisms.
const common = require('./common.cjs');
const { C, makeCanvas, title, save, textLeft, textCentered, lead, dashedLine, paragraph, panelBox } = common;

const { canvas, ctx } = makeCanvas(960, 600);
title(ctx, 960, 'How small is small?', 'Comparing the sizes of microorganisms on a logarithmic scale');

// Log axis: 1 nm to 1 mm (6 decades), drawn at y=470 from x=250 to x=890.
const axisX0 = 250, axisX1 = 890, axisY = 470;
const decades = ['1 nm', '10 nm', '100 nm', '1 \u00b5m', '10 \u00b5m', '100 \u00b5m', '1 mm'];
const dx = (axisX1 - axisX0) / (decades.length - 1);
function sizeToX(sizeNm) {
  // size in nm; log10 mapping from 1 nm to 1e6 nm
  const t = Math.log10(Math.max(sizeNm, 1)) / 6;
  return axisX0 + t * (axisX1 - axisX0);
}

ctx.strokeStyle = C.ink;
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(axisX0 - 30, axisY);
ctx.lineTo(axisX1 + 20, axisY);
ctx.stroke();
decades.forEach((label, i) => {
  const x = axisX0 + i * dx;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x, axisY - 7);
  ctx.lineTo(x, axisY + 7);
  ctx.stroke();
  textCentered(ctx, label, x, axisY + 30, 90, 20, '600', C.sub);
});
textCentered(ctx, 'each step to the right is ten times bigger', (axisX0 + axisX1) / 2, axisY + 60, 600, 19, '400', C.faint);

// Items: [name, typical size in nm, colour, caption]
const items = [
  ['Protein molecule', 5, C.sub, 'e.g. haemoglobin'],
  ['Virus', 100, C.accent2, '20\u2013300 nm \u2014 e.g. influenza'],
  ['Bacterium', 2000, C.accent, '1\u20135 \u00b5m \u2014 e.g. E. coli'],
  ['Red blood cell', 7000, C.warn, 'about 7 \u00b5m across'],
  ['Fungal (yeast) cell', 8000, C.amber, '5\u201310 \u00b5m'],
  ['Human cheek cell', 30000, C.ok, '30\u201350 \u00b5m'],
  ['Limit of the naked eye', 100000, C.pink, 'about 0.1 mm'],
];

const rowH = 46;
items.forEach((it, i) => {
  const y = 150 + i * rowH;
  const xEnd = sizeToX(it[1]);
  ctx.fillStyle = it[2];
  ctx.beginPath();
  ctx.arc(xEnd, y, 7, 0, Math.PI * 2);
  ctx.fill();
  dashedLine(ctx, xEnd, y + 9, xEnd, axisY - 8, it[2], 2);
  textLeft(ctx, it[0], 60, y - 8, 180, 21, '600', C.ink);
  textLeft(ctx, it[3], 60, y + 13, 180, 17, '400', C.faint);
});

// Right-hand note panel.
panelBox(ctx, 620, 130, 320, 120, C.accentSoft, '#c7d2fe', 14);
paragraph(ctx, 'A bacterium is roughly 10\u201350 times wider than a virus, and around a thousand bacteria could line up across a single millimetre. Both sit far below what the eye can see \u2014 which is why we grow them on agar instead of watching them directly.', 640, 160, 280, 24, 18, '400', C.ink);

// Bottom takeaway band.
panelBox(ctx, 60, 545, 840, 40, C.panel, C.panelBorder, 12);
textCentered(ctx, 'Teaching point: culturing on agar turns numbers too small to see into colonies big enough to count.', 480, 565, 800, 19, '600', C.sub);

save('a26-scale.png', canvas);
module.exports = common;