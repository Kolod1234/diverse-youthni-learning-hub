// Diagram 1 — the enabling-technology loop and the four portfolio strands.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, arrow, chip } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 880);
title(ctx, 1560, 'Enabling technology: the monitoring loop', 'How equipment turns a body measurement into a safe clinical decision');

const steps = [
  { x: 130, label: 'PATIENT', sub: 'the body quantity to be\nmeasured — pressure, voltage,\nlight absorbance, oxygen', fill: C.pinkSoft, stroke: '#f9a8d4' },
  { x: 400, label: 'TRANSDUCER', sub: 'sensor converts the body\nquantity into an electrical\nsignal', fill: C.accentSoft, stroke: '#c7d2fe' },
  { x: 670, label: 'FILTER & DISPLAY', sub: 'noise removed, signal\nshown, alarms checked\nagainst set limits', fill: C.accent2Soft, stroke: '#bae6fd' },
  { x: 940, label: 'CLINICAL DECISION', sub: 'a professional reads the\ndata and decides what\nto do', fill: C.amberSoft, stroke: '#fde68a' },
  { x: 1210, label: 'TREATMENT', sub: 'therapy or equipment change\nacts on the patient —\nand the loop continues', fill: C.okSoft, stroke: '#bbf7d0' },
];
steps.forEach((s) => {
  panelBox(ctx, s.x - 125, 170, 250, 190, s.fill, s.stroke, 16);
  textCentered(ctx, s.label, s.x, 215, 220, 21, '700');
  paragraph(ctx, s.sub, s.x - 110, 262, 220, 24, 16, '400', C.sub, 'center');
});
arrow(ctx, 265, 265, 365, 265);
arrow(ctx, 535, 265, 635, 265);
arrow(ctx, 805, 265, 905, 265);
arrow(ctx, 1075, 265, 1175, 265);

// return arrow: treatment loops back to the patient
ctx.strokeStyle = C.faint;
ctx.lineWidth = 3;
ctx.setLineDash([12, 9]);
ctx.beginPath();
ctx.moveTo(1210, 380);
ctx.quadraticCurveTo(1210, 470, 780, 470);
ctx.quadraticCurveTo(255, 470, 255, 385);
ctx.stroke();
ctx.setLineDash([]);
ctx.fillStyle = C.faint;
ctx.beginPath();
ctx.moveTo(255, 368);
ctx.lineTo(244, 392);
ctx.lineTo(266, 392);
ctx.closePath();
ctx.fill();
textCentered(ctx, 'monitoring is continuous — the same loop repeats every few seconds, hour after hour', 780, 452, 760, 17, '400', C.sub);

// The four portfolio strands
textCentered(ctx, 'THE FOUR STRANDS OF UNIT A2 10', 780, 530, 800, 21, '700', C.accent);
const strands = [
  { n: '1', t: 'Equipment used in modern medicine', d: 'what the main diagnostic, monitoring, therapeutic and life-support devices are, and the science inside them', fill: C.pinkSoft, stroke: '#f9a8d4' },
  { n: '2', t: 'Workflow in a medical laboratory', d: 'the journey of a request and sample through reception, analysis, validation and reporting', fill: C.accentSoft, stroke: '#c7d2fe' },
  { n: '3', t: 'Medical monitoring case study', d: 'one patient, one bedside monitor: sensors, signals, alarm limits and the response they trigger', fill: C.accent2Soft, stroke: '#bae6fd' },
  { n: '4', t: 'Data collection and filtering', d: 'how real signals are sampled, how noise and artefact are removed, and how equipment is calibrated', fill: C.okSoft, stroke: '#bbf7d0' },
];
strands.forEach((s, i) => {
  const x = 130 + (i % 2) * 700;
  const y = 565 + Math.floor(i / 2) * 145;
  panelBox(ctx, x, y, 640, 125, s.fill, s.stroke, 14);
  ctx.beginPath();
  ctx.arc(x + 42, y + 38, 20, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = s.stroke;
  ctx.stroke();
  textCentered(ctx, s.n, x + 42, y + 39, 30, 19, '700', C.ink);
  textLeft(ctx, s.t, x + 78, y + 38, 540, 20, '700');
  paragraph(ctx, s.d, x + 78, y + 78, 530, 23, 16, '400', C.sub);
});

chip(ctx, 'Portfolio unit — every page ends in evidence you can file', 780, 840, 900, C.panel, C.sub, 18);
save('a210-cycle.png', canvas);