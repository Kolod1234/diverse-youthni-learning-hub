// A2 6 Figure 7 — serial dilution, plate counts and the CFU calculation.
const common = require('./common.cjs');
const { C, makeCanvas, title, save, textCentered, textLeft, paragraph, panelBox, chip, arrow, roundRect } = common;

const { canvas, ctx } = makeCanvas(980, 640);
title(ctx, 980, 'Serial dilution and viable counts', 'Turning an uncountable culture into numbers a scientist can use');

// Top: dilution row of five tubes.
const tubeW = 54, tubeH = 92, gap = 60, startY = 150;
const labels = ['stock', '10\u207b\u00b9', '10\u207b\u00b2', '10\u207b\u00b3', '10\u207b\u2074', '10\u207b\u2075'];
const startX = 90;
labels.forEach((lb, i) => {
  const x = startX + i * (tubeW + gap);
  // tube
  ctx.fillStyle = i === 0 ? '#bfdbfe' : '#eff6ff';
  ctx.strokeStyle = '#2563eb'; ctx.lineWidth = 2.5;
  roundRect(ctx, x, startY, tubeW, tubeH, 10); ctx.fill(); ctx.stroke();
  // liquid
  ctx.fillStyle = i === 0 ? '#60a5fa' : '#dbeafe';
  roundRect(ctx, x + 3, startY + 30, tubeW - 6, tubeH - 34, 8); ctx.fill();
  // cap
  ctx.fillStyle = '#2563eb';
  roundRect(ctx, x + 6, startY - 12, tubeW - 12, 12, 4); ctx.fill();
  textCentered(ctx, lb, x + tubeW / 2, startY + tubeH + 24, 70, 18, '600', C.ink);
  if (i > 0) {
    // transfer arrow + label
    arrow(ctx, x - gap + tubeW + 6, startY + 44, x - 6, startY + 44, 3, C.accent);
  }
});
// annotation of "1 cm3 into 9 cm3"
textLeft(ctx, 'each step: transfer 1 cm\u00b3 into 9 cm\u00b3 of sterile diluent \u2192 a ten-fold dilution', startX + 10, startY - 30, 620, 17, '400', C.sub);
textLeft(ctx, '10\u207b\u2075 means a dilution factor of 100 000 \u2014 or 0.00001 of the original', startX + 10, startY + 152, 620, 17, '400', C.faint);

// Middle: plate with countable colonies.
const plateX = 90, plateY = 330;
ctx.fillStyle = '#fdfcf7'; ctx.strokeStyle = C.sub; ctx.lineWidth = 3;
roundRect(ctx, plateX, plateY, 240, 110, 20); ctx.fill(); ctx.stroke();
textLeft(ctx, 'plate 0.1 cm\u00b3 of the 10\u207b\u2074 dilution', plateX + 24, plateY - 16, 230, 16, '600', C.sub);
// colonies: dots
const colPos = [];
const pts = [[30,26],[58,20],[86,32],[112,18],[140,30],[172,24],[42,54],[70,62],[98,50],[126,64],[154,52],[182,62],[36,84],[64,78],[92,88],[120,80],[148,86],[176,78],[200,44],[206,72]];
pts.forEach(([dxr, dyr]) => {
  ctx.fillStyle = C.accent;
  ctx.beginPath(); ctx.arc(plateX + 14 + dxr, plateY + 12 + dyr, 4.5, 0, Math.PI * 2); ctx.fill();
});
chip(ctx, '145 colonies \u2014 inside the 30\u2013300 counting range', plateX + 120, plateY + 134, 330, C.okSoft, '#15803d', 15);

// Right: formula and calculation.
const fx = 400, fy = 300;
panelBox(ctx, fx, fy, 530, 170, C.panel, C.panelBorder, 14);
textLeft(ctx, 'The viable count equation', fx + 20, fy + 28, 480, 19, '700', C.accent);
textCentered(ctx, 'CFU/cm\u00b3  =  colonies counted  \u00f7  (volume plated \u00d7 dilution factor)', fx + 265, fy + 64, 490, 20, '600', C.ink);
paragraph(ctx, 'Substituting: 145 \u00f7 (0.1 \u00d7 10\u207b\u2074) = 145 \u00f7 0.00001 = 1.45 \u00d7 10\u2077 CFU/cm\u00b3 in the original culture. Each colony is assumed to descend from one viable cell \u2014 a colony-forming unit.', fx + 20, fy + 96, 490, 24, 17, '400', C.ink);

// Bottom: 30-300 rule.
panelBox(ctx, 90, 490, 800, 96, C.amberSoft, '#fde68a', 14);
textLeft(ctx, 'Why 30\u2013300 colonies?', 110, 516, 700, 18, '700', '#b45309');
paragraph(ctx, 'Below 30 the count is statistically unreliable \u2014 one or two stray cells distort the answer badly. Above 300 colonies merge and overlap, so counting becomes guesswork. Always choose the dilution whose plate lands inside this window.', 110, 540, 760, 22, 16, '400', C.ink);

save('a26-serial-dilution.png', canvas);
module.exports = common;