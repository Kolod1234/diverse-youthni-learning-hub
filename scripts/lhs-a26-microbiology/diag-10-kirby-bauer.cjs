// A2 6 Figure 10 — Kirby-Bauer disc diffusion assay and zones of inhibition.
const common = require('./common.cjs');
const { C, makeCanvas, title, save, textCentered, textLeft, paragraph, panelBox, chip, arrow, roundRect, dashedLine } = common;

const { canvas, ctx } = makeCanvas(980, 640);
title(ctx, 980, 'Testing antimicrobials: the disc diffusion assay', 'Kirby\u2013Bauer method \u2014 measuring zones of inhibition');

// Left: Petri dish, top view.
const cx = 300, cy = 350, R = 200;
ctx.beginPath(); ctx.arc(cx, cy, R + 12, 0, Math.PI * 2);
ctx.fillStyle = '#ffffff'; ctx.fill();
ctx.strokeStyle = C.sub; ctx.lineWidth = 4; ctx.stroke();
ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2);
ctx.fillStyle = '#fdfcf7'; ctx.fill();
ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.stroke();

// Bacterial lawn: fine dots everywhere except zones.
function inZone(x, y) {
  const zones = [
    { x: cx - 95, y: cy - 75, r: 62 },
    { x: cx + 80, y: cy - 85, r: 40 },
    { x: cx - 60, y: cy + 95, r: 30 },
    { x: cx + 95, y: cy + 80, r: 0 }, // D: resistant - no zone
  ];
  return zones.some((z) => z.r > 0 && Math.hypot(x - z.x, y - z.y) < z.r);
}
ctx.fillStyle = '#94a3b8';
for (let a = 0; a < 1400; a++) {
  const ang = (a * 2.399) % (Math.PI * 2);
  const rad = R * Math.sqrt(((a * 0.717) % 1000) / 1000);
  const px = cx + rad * Math.cos(ang), py = cy + rad * Math.sin(ang);
  if (!inZone(px, py)) { ctx.beginPath(); ctx.arc(px, py, 1.4, 0, Math.PI * 2); ctx.fill(); }
}

// Discs A-D with clear zones.
const discs = [
  { l: 'A', x: cx - 95, y: cy - 75, r: 62, note: 'large zone' },
  { l: 'B', x: cx + 80, y: cy - 85, r: 40, note: 'smaller zone' },
  { l: 'C', x: cx - 60, y: cy + 95, r: 30, note: 'small zone' },
  { l: 'D', x: cx + 95, y: cy + 80, r: 0, note: 'no zone \u2014 resistant' },
];
discs.forEach((d) => {
  if (d.r > 0) {
    ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff'; ctx.fill();
    ctx.strokeStyle = C.faint; ctx.lineWidth = 1.5; ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(d.x, d.y, 16, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff'; ctx.fill();
  ctx.strokeStyle = '#9333ea'; ctx.lineWidth = 2.5; ctx.stroke();
  textCentered(ctx, d.l, d.x, d.y + 1, 20, 17, '700', '#9333ea');
});
// zone edge label
dashedLine(ctx, cx - 95 - 44, cy - 75 - 44, 150, 195, C.warn, 2.5);
textLeft(ctx, 'edge of zone of inhibition', 40, 195, 160, 15, '600', C.warn);

// ruler measuring zone A diameter.
ctx.strokeStyle = C.ink; ctx.lineWidth = 2;
ctx.save();
ctx.translate(cx - 95, cy - 75);
ctx.rotate(Math.PI / 2);
for (let i = -60; i <= 60; i += 6) {
  ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, (i % 30 === 0) ? 10 : 5); ctx.stroke();
}
ctx.restore();
arrow(ctx, cx - 95, cy - 75 - 62, cx - 95, cy - 75 - 42, 2, C.ink);
arrow(ctx, cx - 95, cy - 75 + 62, cx - 95, cy - 75 + 42, 2, C.ink);
chip(ctx, 'measure the diameter, in mm', cx - 95, cy - 75 - 92, 200, '#ffffff', C.ink, 15);

// Right: method + interpretation.
const rx = 560;
panelBox(ctx, rx, 150, 380, 250, C.panel, C.panelBorder, 14);
textLeft(ctx, 'Method', rx + 18, 176, 340, 19, '700', C.accent);
paragraph(ctx, 'Flood a sterile agar plate with the bacterial culture to form an even lawn. Place paper discs, each soaked in a fixed concentration of one antimicrobial, on the surface. Incubate. The agent diffuses outward into the agar, so bacteria further from the disc meet more of the chemical than they can survive.', rx + 18, 204, 344, 22, 16, '400', C.ink);
panelBox(ctx, rx, 420, 380, 170, C.accentSoft, '#c7d2fe', 14);
textLeft(ctx, 'Reading the plate', rx + 18, 446, 340, 19, '700', '#3730a3');
paragraph(ctx, 'A larger zone of inhibition means the antimicrobial is more effective against that organism \u2014 but only if the comparison is fair. The same lawn, agar depth, incubation temperature and disc concentration must be used for every disc on the plate. If growth reaches right up to a disc, the bacterium is resistant to that agent.', rx + 18, 474, 344, 22, 16, '400', C.ink);

// Bottom band: controls.
panelBox(ctx, 60, 560, 860, 56, C.panel, C.panelBorder, 12);
textCentered(ctx, 'Control the variables: identical agar depth (diffusion distance), identical incubation, identical disc load, one lawn from one culture \u2014 then, and only then, is a bigger zone meaningful.', 490, 588, 840, 17, '600', C.sub);

save('a26-kirby-bauer.png', canvas);
module.exports = common;