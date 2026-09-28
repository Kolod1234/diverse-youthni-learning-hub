// Diagram 4 — tissue processing: dehydration, clearing, infiltration.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, arrow, chip } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 820);
title(ctx, 1560, 'Tissue processing: making tissue wax-compatible', 'Water and wax do not mix — the tissue must be taken step by step from water to wax');

const steps = [
  { heading: 'START', body: 'Fixed tissue is mostly water; molten paraffin wax cannot mix with water', fill: C.panel, stroke: C.panelBorder, color: C.ink },
  { heading: '1  DEHYDRATION', body: 'Water is removed by soaking through increasing concentrations of ethanol, ending in absolute alcohol', fill: C.accent2Soft, stroke: '#bae6fd', color: '#075985' },
  { heading: '2  CLEARING', body: 'Alcohol and wax still do not mix — xylene replaces the alcohol and is miscible with both', fill: C.amberSoft, stroke: '#fde68a', color: '#92400e' },
  { heading: '3  INFILTRATION', body: 'Molten paraffin wax replaces the xylene and fills every microscopic space in the tissue', fill: C.pinkSoft, stroke: '#fbcfe8', color: '#9d174d' },
  { heading: 'READY', body: 'The tissue is now fully wax-compatible and can be embedded in a solid block', fill: C.okSoft, stroke: '#bbf7d0', color: '#166534' },
];

const bw = 250, bh = 380, y = 180;
steps.forEach((s, i) => {
  const x = 60 + i * (bw + 55);
  panelBox(ctx, x, y, bw, bh, s.fill, s.stroke, 16);
  textCentered(ctx, s.heading, x + bw / 2, y + 44, bw - 30, 20, '700', s.color);
  // icon
  const cx = x + bw / 2, cy = y + 120;
  if (i === 0 || i === 4) {
    ctx.beginPath(); ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = s.stroke; ctx.stroke();
    ctx.fillStyle = s.color; ctx.font = '600 22px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(i === 0 ? 'H\u2082O' : 'WAX', cx, cy + 1);
  } else {
    for (let k = 0; k < 3; k++) {
      const bx = cx - 52 + k * 36;
      roundRectSmall(bx, cy - 26, 26, 52);
      ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = s.stroke; ctx.stroke();
      ctx.fillStyle = s.color; ctx.font = '700 16px Arial'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(['\u2022', '\u2022', '\u2022'][k], bx + 13, cy);
    }
    ctx.fillStyle = s.color; ctx.font = '600 13px Arial';
    ctx.fillText(i === 1 ? 'ethanol' : i === 2 ? 'xylene' : 'wax', cx, cy + 44);
  }
  paragraph(ctx, s.body, x + 22, y + 210, bw - 44, 26, 16.5);
  if (i < 4) arrow(ctx, x + bw + 8, y + bh / 2, x + bw + 47, y + bh / 2, 3, C.ink);
});
function roundRectSmall(x, y, w, h) {
  ctx.beginPath(); ctx.moveTo(x + 6, y);
  ctx.arcTo(x + w, y, x + w, y + h, 6); ctx.arcTo(x + w, y + h, x, y + h, 6);
  ctx.arcTo(x, y + h, x, y, 6); ctx.arcTo(x, y, x + w, y, 6); ctx.closePath();
}

panelBox(ctx, 60, 610, 1440, 150, C.panel, C.panelBorder, 14);
textCentered(ctx, 'Why the order cannot be changed', 780, 645, 1380, 21, '700');
paragraph(ctx, 'Each reagent must be miscible with the one before it: ethanol mixes with water, xylene mixes with ethanol, and wax mixes with xylene. Skip a step and the reagents separate into layers inside the tissue, leaving it soft and uncuttable. Processing is run on automated machines overnight, timing each bath precisely.', 150, 682, 1260, 28, 17.5, '400', C.sub);

save('a28-processing.png', canvas);