// A2 7 Figure 2 — the three pairs of major salivary glands and the roles of
// saliva in oral health.
const common = require('./common.cjs');
const { C, makeCanvas, title, save, textCentered, textLeft, paragraph, panelBox, arrow, lead } = common;

const { canvas, ctx } = makeCanvas(980, 640);
title(ctx, 980, 'Salivary glands and the work saliva does', 'Three bilateral pairs of exocrine glands empty their secretions into the mouth through ducts');

// ---- Left: head in profile with the three gland pairs ----
const bx = 60, by = 150, bw = 460, bh = 450;
panelBox(ctx, bx, by, bw, bh, '#ffffff', C.panelBorder);

// Head outline (schematic profile, facing left).
ctx.strokeStyle = C.ink;
ctx.lineWidth = 3.5;
ctx.beginPath();
ctx.moveTo(bx + 200, by + 34);
ctx.quadraticCurveTo(bx + 80, by + 60, bx + 64, by + 170);   // forehead to eye area
ctx.quadraticCurveTo(bx + 56, by + 240, bx + 96, by + 280);  // nose bridge
ctx.lineTo(bx + 64, by + 296);                               // nose tip
ctx.quadraticCurveTo(bx + 104, by + 318, bx + 96, by + 336);  // under nose
ctx.quadraticCurveTo(bx + 48, by + 356, bx + 58, by + 392);   // lips
ctx.lineTo(bx + 76, by + 404);
ctx.lineTo(bx + 60, by + 420);
ctx.quadraticCurveTo(bx + 48, by + 476, bx + 108, by + 508);  // chin
ctx.quadraticCurveTo(bx + 260, by + 560, bx + 420, by + 500); // jaw angle to neck
ctx.quadraticCurveTo(bx + 480, by + 380, bx + 430, by + 240);
ctx.quadraticCurveTo(bx + 400, by + 80, bx + 200, by + 34);
ctx.stroke();

// Ear marker.
ctx.strokeStyle = C.sub;
ctx.lineWidth = 3;
ctx.beginPath();
ctx.ellipse(bx + 320, by + 200, 16, 28, 0, 0, Math.PI * 2);
ctx.stroke();
textCentered(ctx, 'ear', bx + 320, by + 246, 60, 14, '600', C.sub);

// Parotid gland: in front of / below the ear.
ctx.fillStyle = '#fbbf6e';
ctx.strokeStyle = '#c98a2a';
ctx.lineWidth = 2.5;
ctx.beginPath();
ctx.ellipse(bx + 282, by + 262, 34, 46, -0.3, 0, Math.PI * 2);
ctx.fill();
ctx.stroke();
// Parotid (Stensen) duct running forward to the vestibule near the upper molars.
ctx.strokeStyle = '#c98a2a';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(bx + 252, by + 282);
ctx.quadraticCurveTo(bx + 160, by + 312, bx + 104, by + 330);
ctx.stroke();
textCentered(ctx, 'duct opens opposite upper molars', bx + 250, by + 330, 200, 13, '600', '#96690f');

// Submandibular gland: under the jaw angle.
ctx.fillStyle = '#7cc7f5';
ctx.strokeStyle = '#2a7fb8';
ctx.beginPath();
ctx.ellipse(bx + 250, by + 452, 40, 27, 0.3, 0, Math.PI * 2);
ctx.fill();
ctx.stroke();
// Submandibular duct running forward under the tongue.
ctx.strokeStyle = '#2a7fb8';
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(bx + 214, by + 444);
ctx.quadraticCurveTo(bx + 150, by + 428, bx + 108, by + 408);
ctx.stroke();

// Sublingual gland: under the front of the tongue.
ctx.fillStyle = '#b7f0c4';
ctx.strokeStyle = '#2f9a55';
ctx.beginPath();
ctx.ellipse(bx + 122, by + 388, 30, 17, 0, 0, Math.PI * 2);
ctx.fill();
ctx.stroke();

// Mouth line / tongue hint.
ctx.strokeStyle = C.sub;
ctx.lineWidth = 2;
ctx.beginPath();
ctx.moveTo(bx + 70, by + 388);
ctx.quadraticCurveTo(bx + 150, by + 402, bx + 210, by + 388);
ctx.stroke();

// Labels.
lead(ctx, bx + 310, by + 250, bx + 336, by + 210);
textLeft(ctx, 'PAROTID', bx + 340, by + 198, 120, 16, '700', '#96690f');
textLeft(ctx, 'largest; watery serous saliva', bx + 340, by + 220, 150, 13, '400', C.sub);

lead(ctx, bx + 290, by + 458, bx + 340, by + 470);
textLeft(ctx, 'SUBMANDIBULAR', bx + 346, by + 470, 150, 16, '700', '#2a7fb8');
textLeft(ctx, 'below the floor of the mouth', bx + 346, by + 492, 150, 13, '400', C.sub);

lead(ctx, bx + 118, by + 372, bx + 96, by + 340);
textLeft(ctx, 'SUBLINGUAL \u2014 smallest pair, under the tongue', bx + 40, by + 320, 180, 13, '700', '#2f9a55');

// ---- Right: roles of saliva ----
const rx = 560, rw = 360;
const roles = [
  ['Salivary amylase', 'begins the chemical digestion of starch into maltose', C.accentSoft, C.accent],
  ['Mucus', 'moistens food and binds it into a slippery bolus for safe swallowing', C.pinkSoft, C.pink],
  ['Bicarbonate buffer', 'neutralises plaque acids and holds oral pH above the danger zone', C.accent2Soft, C.accent2],
  ['Lysozyme and IgA', 'antimicrobial agents that limit bacterial colonisation', C.okSoft, C.ok],
  ['Washing flow', 'the constant flush clears food debris from tooth surfaces', C.amberSoft, '#b45309'],
];
roles.forEach((r, i) => {
  const y = 140 + i * 94;
  panelBox(ctx, rx, y, rw, 82, r[2], r[3]);
  textLeft(ctx, r[0], rx + 20, y + 26, 320, 18, '700', r[3]);
  textLeft(ctx, r[1], rx + 20, y + 54, 330, 15, '400', C.sub);
});

save('a27-salivary-glands.png', canvas);
module.exports = common;