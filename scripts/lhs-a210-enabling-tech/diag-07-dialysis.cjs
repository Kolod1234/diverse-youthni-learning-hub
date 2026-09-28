// Diagram 7 — haemodialysis: the circuit and the membrane logic.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, arrow, chip, lead } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 940);
title(ctx, 1560, 'Kidney dialysis: technology that replaces a failing organ', 'Blood meets dialysate across a semipermeable membrane — the waste leaves, the blood stays blood');

// Left: circuit
textCentered(ctx, 'THE EXTRACORPOREAL CIRCUIT', 420, 148, 600, 21, '700', C.accent);
panelBox(ctx, 90, 175, 660, 560, '#ffffff', C.panelBorder, 16);
// patient box
panelBox(ctx, 130, 230, 130, 70, C.pinkSoft, '#f9a8d4', 12);
textCentered(ctx, 'PATIENT', 195, 265, 120, 17, '700');
// artery line
arrow(ctx, 260, 265, 330, 265, 4, '#dc2626');
textCentered(ctx, 'artery \u2192', 295, 240, 120, 15, '600', C.warn);
// pump
ctx.beginPath();
ctx.arc(360, 265, 28, 0, Math.PI * 2);
ctx.fillStyle = C.amberSoft;
ctx.fill();
ctx.lineWidth = 3;
ctx.strokeStyle = '#fdba74';
ctx.stroke();
textCentered(ctx, 'pump', 360, 265, 90, 15, '700');
textCentered(ctx, 'blood is drawn out at a controlled flow rate \u2014 the circuit is outside the body', 420, 315, 600, 15, '400', C.sub);
// heparin note
chip(ctx, 'heparin added — stops clotting in the tubing', 360, 360, 600, '#fff7ed', C.sub, 15);
arrow(ctx, 388, 265, 460, 265, 4, '#dc2626');
// dialyser
panelBox(ctx, 460, 190, 180, 220, '#eff6ff', '#bfdbfe', 14);
textCentered(ctx, 'DIALYSER', 550, 218, 160, 18, '700');
for (let i = 0; i < 6; i++) {
  ctx.beginPath();
  ctx.moveTo(485, 240 + i * 26);
  ctx.bezierCurveTo(515, 244 + i * 26, 585, 236 + i * 26, 615, 240 + i * 26);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#dc2626';
  ctx.stroke();
}
textCentered(ctx, 'thousands of fine hollow fibres:', 550, 320, 170, 13, '400', C.sub);
textCentered(ctx, 'semipermeable membrane', 550, 338, 170, 13, '600', C.sub);
textCentered(ctx, 'blood inside, dialysate outside', 550, 356, 170, 13, '400', C.sub);
// dialysate in/out (counter-current)
arrow(ctx, 640, 390, 470, 400, 4, '#0ea5e9');
textCentered(ctx, 'dialysate in \u2190', 555, 424, 200, 15, '600', '#0369a1');
arrow(ctx, 470, 430, 640, 420, 4, '#7dd3fc');
textCentered(ctx, 'dialysate out (with waste) \u2192', 555, 448, 240, 15, '600', '#0369a1');
textCentered(ctx, 'counter-current flow keeps the concentration difference high along the whole dialyser', 420, 478, 630, 15, '400', C.sub);
// return line
arrow(ctx, 550, 190, 550, 160, 3, '#dc2626');
ctx.beginPath();
ctx.moveTo(550, 160);
ctx.lineTo(195, 160);
ctx.lineTo(195, 226);
ctx.lineWidth = 4;
ctx.strokeStyle = '#dc2626';
ctx.stroke();
ctx.fillStyle = '#dc2626';
ctx.beginPath();
ctx.moveTo(195, 226);
ctx.lineTo(185, 205);
ctx.lineTo(205, 205);
ctx.closePath();
ctx.fill();
textCentered(ctx, 'cleaned blood returns to the vein', 380, 148, 320, 15, '600', C.warn);
// session note
textCentered(ctx, 'Typical session: 3\u20135 hours, several times a week \u2014 the machine, the nurse and the patient work together', 420, 700, 620, 16, '600', C.sub);
chip(ctx, 'Portfolio link: this is \u201cequipment in modern medicine\u201d in its purest form \u2014 a machine performing a physiological job', 420, 742, 640, '#f1f5f9', C.sub, 15);

// Right: the membrane ledger
panelBox(ctx, 800, 175, 670, 560, C.panel, C.panelBorder, 16);
textCentered(ctx, 'THE MEMBRANE LEDGER', 1135, 213, 600, 21, '700', C.accent);
textLeft(ctx, 'LEAVES THE BLOOD (small, soluble waste)', 830, 256, 610, 17, '700', C.warn);
const leaves = ['urea and creatinine \u2014 nitrogen waste from protein metabolism', 'excess potassium and phosphate ions', 'excess water \u2014 removed by a pressure difference (ultrafiltration)'];
leaves.forEach((t, i) => textLeft(ctx, '\u2022  ' + t, 845, 292 + i * 34, 590, 16, '400', C.sub));
textLeft(ctx, 'RETAINED (too large for the membrane pores)', 830, 412, 610, 17, '700', C.ok);
const stays = ['red and white blood cells \u2014 returned intact', 'plasma proteins such as albumin', 'formed elements and cells of the immune defence'];
stays.forEach((t, i) => textLeft(ctx, '\u2022  ' + t, 845, 448 + i * 34, 590, 16, '400', C.sub));
textLeft(ctx, 'THE DIALYSATE IS THE SECRET', 830, 566, 610, 17, '700', C.accent);
paragraph(ctx, 'It contains the correct concentrations of glucose, salts and buffers \u2014 but zero urea and creatinine. Because it holds no waste, a steep concentration difference drives waste out of the blood by simple diffusion \u2014 and the useful solutes, already balanced on both sides, stay put.', 845, 600, 590, 26, 16, '400', C.sub);
chip(ctx, 'Diffusion does the work \u2014 the equipment arranges the conditions', 1135, 715, 600, C.okSoft, C.ink, 16);

save('a210-dialysis.png', canvas);