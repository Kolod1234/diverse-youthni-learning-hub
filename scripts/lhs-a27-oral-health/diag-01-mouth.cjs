// A2 7 Figure 1 — the oral cavity in cross-section: vestibule, oral cavity
// proper, palate, tongue and the boundary formed by the teeth.
const common = require('./common.cjs');
const { C, makeCanvas, title, save, textCentered, textLeft, paragraph, panelBox, arrow, lead, dashedLine, roundRect } = common;

const { canvas, ctx } = makeCanvas(980, 660);
title(ctx, 980, 'The oral cavity in cross-section', 'The teeth divide the mouth into an outer vestibule and an inner oral cavity proper');

// ---- Left: schematic sagittal section ----
const bx = 60, by = 140, bw = 470, bh = 470;
panelBox(ctx, bx, by, bw, bh, '#ffffff', C.panelBorder);

// Face profile boundary (schematic: forehead - nose - lips - chin).
ctx.strokeStyle = C.ink;
ctx.lineWidth = 3.5;
ctx.beginPath();
ctx.moveTo(bx + 120, by + 30);           // forehead
ctx.quadraticCurveTo(bx + 70, by + 90, bx + 90, by + 150);   // nose bridge
ctx.lineTo(bx + 58, by + 172);          // nose tip
ctx.quadraticCurveTo(bx + 92, by + 196, bx + 84, by + 212);  // under nose
ctx.quadraticCurveTo(bx + 40, by + 226, bx + 44, by + 258);  // upper lip
ctx.lineTo(bx + 58, by + 272);           // mouth line
ctx.lineTo(bx + 44, by + 292);          // lower lip
ctx.quadraticCurveTo(bx + 34, by + 348, bx + 78, by + 388);  // chin
ctx.quadraticCurveTo(bx + 150, by + 442, bx + 300, by + 448);// jaw / neck underside
ctx.stroke();

// Hard palate: thick bony shelf from the back of the upper lip root.
ctx.strokeStyle = '#94a3b8';
ctx.lineWidth = 14;
ctx.beginPath();
ctx.moveTo(bx + 120, by + 226);
ctx.lineTo(bx + 320, by + 226);
ctx.stroke();
textCentered(ctx, 'hard palate (bone)', bx + 220, by + 202, 180, 17, '600', C.sub);

// Soft palate sloping down from the hard palate, uvula hanging at its end.
ctx.strokeStyle = '#f1b8c4';
ctx.lineWidth = 13;
ctx.beginPath();
ctx.moveTo(bx + 320, by + 226);
ctx.quadraticCurveTo(bx + 380, by + 238, bx + 402, by + 274);
ctx.stroke();
ctx.strokeStyle = '#e78fa3';
ctx.lineWidth = 8;
ctx.beginPath();
ctx.moveTo(bx + 402, by + 274);
ctx.lineTo(bx + 402, by + 318);
ctx.stroke();
textCentered(ctx, 'soft palate + uvula', bx + 402, by + 342, 150, 16, '600', C.sub);

// Upper teeth row hanging from the palate line, lower teeth rising from the
// mandible; together they form the dividing wall between the two spaces.
ctx.fillStyle = '#fefefe';
ctx.strokeStyle = C.ink;
ctx.lineWidth = 2.5;
for (let i = 0; i < 5; i++) {
  roundRect(ctx, bx + 116 + i * 34, by + 232, 26, 26, 5); ctx.fill(); ctx.stroke();
  roundRect(ctx, bx + 116 + i * 34, by + 296, 26, 26, 5); ctx.fill(); ctx.stroke();
}
// Mandible ridge below the lower teeth.
ctx.strokeStyle = '#c8a27a';
ctx.lineWidth = 10;
ctx.beginPath();
ctx.moveTo(bx + 100, by + 322);
ctx.lineTo(bx + 286, by + 322);
ctx.stroke();
textCentered(ctx, 'teeth (dental arches)', bx + 220, by + 262, 180, 16, '600', C.ink);

// Tongue: muscular blob on the floor of the mouth.
ctx.fillStyle = '#f3a8b4';
ctx.strokeStyle = '#d4707f';
ctx.lineWidth = 2.5;
ctx.beginPath();
ctx.ellipse(bx + 215, by + 366, 130, 42, -0.12, 0, Math.PI * 2);
ctx.fill();
ctx.stroke();
textCentered(ctx, 'tongue', bx + 215, by + 366, 120, 17, '700', '#8c2f3d');

// Floor of the mouth line.
ctx.strokeStyle = C.sub;
ctx.lineWidth = 3;
ctx.beginPath();
ctx.moveTo(bx + 92, by + 404);
ctx.quadraticCurveTo(bx + 190, by + 422, bx + 300, by + 414);
ctx.stroke();

// Region annotations with leader lines.
lead(ctx, bx + 62, by + 244, bx + 104, by + 258); // to vestibule gap
textCentered(ctx, 'VESTIBULE', bx + 58, by + 468, 150, 16, '700', C.accent2);
textCentered(ctx, 'slit between lips/cheeks and teeth', bx + 150, by + 488, 230, 14, '400', C.sub);
lead(ctx, bx + 196, by + 300, bx + 196, by + 312);
textCentered(ctx, 'ORAL CAVITY PROPER', bx + 300, by + 462, 220, 16, '700', C.accent);
textCentered(ctx, 'chamber behind the dental arches', bx + 300, by + 482, 250, 14, '400', C.sub);

// Oropharynx opening at the back.
arrow(ctx, bx + 402, by + 356, bx + 402, by + 412, 3, C.sub);
textCentered(ctx, 'to oropharynx\n(swallowing)', bx + 402, by + 434, 130, 14, '600', C.sub);

// Lips label.
lead(ctx, bx + 52, by + 232, bx + 66, by + 262);
textLeft(ctx, 'lips (orbicularis oris)', bx + 74, by + 180, 150, 15, '600', C.sub);

// ---- Right: divisions and functions panels ----
const rx = 560, rw = 360;
panelBox(ctx, rx, 140, rw, 150, C.accent2Soft, C.accent2);
textCentered(ctx, 'TWO DIVISIONS', rx + rw / 2, 168, 300, 19, '700', C.accent2);
textLeft(ctx, '1  Vestibule \u2014 outer slit: lips and cheeks in front, teeth and gums behind.', rx + 20, 205, 330, 16, '600');
textLeft(ctx, '2  Oral cavity proper \u2014 inner chamber: bounded by the teeth, the hard and soft palates, the tongue and its muscular floor.', rx + 20, 248, 330, 15, '400', C.sub);

panelBox(ctx, rx, 306, rw, 150, C.accentSoft, C.accent);
textCentered(ctx, 'WHAT THE MOUTH DOES', rx + rw / 2, 334, 300, 19, '700', C.accent);
const roles = [
  'Mastication \u2014 mechanical breakdown of food',
  'Chemical digestion \u2014 salivary amylase on starch',
  'Bolus formation and swallowing (deglutition)',
  'Speech articulation and facial expression',
];
roles.forEach((r, i) => textLeft(ctx, '\u2022 ' + r, rx + 20, 368 + i * 30, 340, 15, '400'));

panelBox(ctx, rx, 472, rw, 138, C.okSoft, C.ok);
textCentered(ctx, 'WHY THE DIVISION MATTERS', rx + rw / 2, 500, 300, 19, '700', '#0f7a35');
paragraph(ctx, 'Food pushed by the cheeks and tongue stays between the tooth rows for chewing; the vestibule stays clear. In disease terms, plaque collects where tooth meets gum in both spaces \u2014 the sites your portfolio investigations target.', rx + 20, 536, 330, 24, 15, '400');

save('a27-mouth.png', canvas);
module.exports = common;