// A2 6 Figure 6 — streak, spread and pour plating.
const common = require('./common.cjs');
const { C, makeCanvas, title, save, textCentered, paragraph, panelBox, chip, arrow, roundRect } = common;

const { canvas, ctx } = makeCanvas(980, 600);
title(ctx, 980, 'Three ways to plate a culture', 'Streak, spread and pour plating \u2014 and what each is for');

function dish(x, y, w, h, fill) {
  ctx.fillStyle = fill || '#fdfcf7';
  ctx.strokeStyle = C.sub; ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 22); ctx.fill(); ctx.stroke();
}

function panel(x, heading, body) {
  const w = 285;
  panelBox(ctx, x, 130, w, 250, C.panel, C.panelBorder, 14);
  textCentered(ctx, heading, x + w / 2, 156, w - 20, 19, '700', C.accent);
  paragraph(ctx, body, x + 16, 186, w - 32, 22, 16, '400', C.ink);
}

// Panel 1 — streak plate.
const x1 = 50;
panel(x1, 'STREAK PLATE', 'A sterilised loop picks up culture and streaks it across the agar in a series of passes. Each pass drags fewer cells than the last, so the final streaks leave single cells that grow into isolated colonies. Purpose: obtain pure cultures from a mixture.');
dish(x1 + 30, 395, 225, 90, '#fdfcf7');
ctx.strokeStyle = C.warn; ctx.lineWidth = 3;
const sx = x1 + 55;
for (let s = 0; s < 4; s++) {
  const bx = sx + s * 48;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const yy = 412 + i * 14 + (i % 2 === 0 ? 0 : 8);
    if (i === 0) ctx.moveTo(bx + 4, yy); else ctx.lineTo(bx + 40, yy + (i % 2 ? -8 : 8));
  }
  ctx.stroke();
}
ctx.fillStyle = C.warn;
for (let i = 0; i < 7; i++) { ctx.beginPath(); ctx.arc(x1 + 218, 412 + i * 10, 3.4, 0, Math.PI * 2); ctx.fill(); }
chip(ctx, 'isolated colonies', x1 + 140, 512, 170, C.okSoft, '#15803d', 14);

// Panel 2 — spread plate.
const x2 = 347;
panel(x2, 'SPREAD PLATE', 'A measured volume of diluted culture is dropped onto the agar surface and spread evenly with a sterile glass spreader. Purpose: quantifying the culture \u2014 the even spread lets every colony be counted and linked to the dilution used.');
dish(x2 + 30, 395, 225, 90, '#fdfcf7');
// lawn dots
ctx.fillStyle = C.accent2;
for (let i = 0; i < 90; i++) {
  const dxr = x2 + 45 + (i * 37) % 195;
  const dyr = 408 + (i * 53) % 64;
  ctx.beginPath(); ctx.arc(dxr, dyr, 2.2, 0, Math.PI * 2); ctx.fill();
}
// spreader
ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
ctx.beginPath(); ctx.moveTo(x2 + 245, 378); ctx.lineTo(x2 + 250, 440); ctx.stroke();
ctx.lineWidth = 5;
ctx.beginPath(); ctx.moveTo(x2 + 243, 388); ctx.lineTo(x2 + 257, 384); ctx.stroke();
chip(ctx, 'countable colonies for CFU maths', x2 + 140, 512, 200, C.accent2Soft, '#0369a1', 14);

// Panel 3 — pour plate.
const x3 = 644;
panel(x3, 'POUR PLATE', 'A measured sample is mixed into molten agar at about 45\u201350 \u00b0C, then allowed to set in the dish. Colonies grow both within the gel and on its surface. Purpose: also quantitative \u2014 and it lets oxygen-tolerant and oxygen-shy organisms grow in one plate.');
dish(x3 + 30, 395, 225, 90, '#fdfcf7');
ctx.fillStyle = C.accent2;
for (let i = 0; i < 60; i++) {
  const dxr = x3 + 45 + (i * 41) % 195;
  const dyr = 408 + (i * 31) % 64;
  ctx.beginPath(); ctx.arc(dxr, dyr, 2.6, 0, Math.PI * 2); ctx.fill();
}
// tube pouring
ctx.fillStyle = '#e0f2fe'; ctx.strokeStyle = '#0369a1'; ctx.lineWidth = 2.5;
roundRect(ctx, x3 + 250, 372, 26, 62, 8); ctx.fill(); ctx.stroke();
arrow(ctx, x3 + 263, 438, x3 + 200, 452, 3, '#0369a1');
chip(ctx, 'colonies in and on the agar', x3 + 140, 512, 200, C.accentSoft, '#4338ca', 14);

// Bottom band.
panelBox(ctx, 50, 530, 880, 50, C.accentSoft, '#c7d2fe', 12);
textCentered(ctx, 'All three are done with aseptic technique: sterile loop or spreader, Bunsen convection zone, minimal time open, taped and incubated at \u2264 25 \u00b0C.', 490, 555, 840, 18, '600', '#3730a3');

save('a26-plating.png', canvas);
module.exports = common;