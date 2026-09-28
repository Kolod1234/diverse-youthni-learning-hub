// Diagram 1 — cation identification: flame tests and sodium hydroxide precipitation.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, tube, setFont } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 960);
title(ctx, 1560, 'Identifying cations: flame tests and precipitation', 'Two classical routes to the metal ion in an unknown sample');

// ---------- Left panel: flame tests ----------
panelBox(ctx, 80, 150, 660, 600, C.panel, C.panelBorder, 18);
textCentered(ctx, 'FLAME TESTS', 410, 192, 600, 26, '700', C.accent);
paragraph(ctx, 'A nichrome wire, cleaned in concentrated HCl, carries a tiny sample into the hottest part of a Bunsen flame. Heat excites electrons; when they fall back they emit light of a colour characteristic of the metal ion.', 130, 232, 560, 26, 19, '400', C.sub);

function flame(x, y, outer, inner) {
  ctx.beginPath();
  ctx.moveTo(x, y + 85);
  ctx.bezierCurveTo(x - 34, y + 45, x - 22, y - 5, x - 6, y - 40);
  ctx.quadraticCurveTo(x - 2, y - 52, x, y - 68);
  ctx.quadraticCurveTo(x + 2, y - 52, x + 6, y - 40);
  ctx.bezierCurveTo(x + 22, y - 5, x + 34, y + 45, x, y + 85);
  ctx.closePath();
  ctx.fillStyle = outer;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(x, y + 52);
  ctx.bezierCurveTo(x - 15, y + 26, x - 9, y - 4, x, y - 22);
  ctx.bezierCurveTo(x + 9, y - 4, x + 15, y + 26, x, y + 52);
  ctx.closePath();
  ctx.fillStyle = inner;
  ctx.fill();
}

const flames = [
  { label: 'Lithium', colour: 'crimson', fill: '#dc2626' },
  { label: 'Sodium', colour: 'yellow', fill: '#facc15' },
  { label: 'Potassium', colour: 'lilac', fill: '#c084fc' },
  { label: 'Calcium', colour: 'orange-red', fill: '#fb923c' },
  { label: 'Copper(II)', colour: 'blue-green', fill: '#22d3ee' },
];
flames.forEach((f, i) => {
  const x = 168 + i * 122;
  flame(x, 470, f.fill, '#fef9c7');
  textCentered(ctx, f.label, x, 586, 118, 19, '700');
  textCentered(ctx, f.colour, x, 614, 118, 17, '400', C.sub);
});
paragraph(ctx, 'Contaminated wires lie: rinse and re-clean between samples. Sodium contamination masks every other colour.', 130, 660, 560, 25, 18, '400', C.sub);

// ---------- Right panel: NaOH precipitation ----------
panelBox(ctx, 780, 150, 700, 600, C.panel, C.panelBorder, 18);
textCentered(ctx, 'PRECIPITATION WITH DILUTE NaOH', 1130, 192, 640, 26, '700', C.accent);
paragraph(ctx, 'Adding dilute sodium hydroxide solution dropwise to the unknown gives insoluble metal hydroxides — each with its own colour.', 815, 232, 630, 26, 19, '400', C.sub);

const rows = [
  { ion: 'Copper(II), Cu²⁺', ppt: '#2563eb', result: 'blue precipitate of Cu(OH)₂' },
  { ion: 'Iron(II), Fe²⁺', ppt: '#4d7c0f', result: 'green precipitate of Fe(OH)₂' },
  { ion: 'Iron(III), Fe³⁺', ppt: '#92400e', result: 'red-brown precipitate of Fe(OH)₃' },
  { ion: 'Aluminium, Al³⁺', ppt: '#e2e8f0', result: 'white precipitate — dissolves in excess NaOH' },
];
rows.forEach((r, i) => {
  const y = 285 + i * 118;
  tube(ctx, 860, y, { liquid: '#eff6ff', liquidTop: 24, ppt: r.ppt });
  textLeft(ctx, r.ion, 910, y + 36, 520, 21, '700');
  textLeft(ctx, '→ ' + r.result, 910, y + 68, 520, 19, '400', C.sub);
});

// ---------- Bottom rule ----------
panelBox(ctx, 80, 790, 1400, 76, C.accentSoft, '#c7d2fe', 14);
textCentered(ctx, 'The observation is the colour; the conclusion is the ion. Doubtful colours are settled by a second confirmatory test.', 780, 828, 1340, 20, '600');

save('a29-cations.png', canvas);