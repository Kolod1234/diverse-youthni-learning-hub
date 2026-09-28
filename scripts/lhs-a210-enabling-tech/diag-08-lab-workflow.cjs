// Diagram 8 — workflow in a medical laboratory.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, arrow, chip, dashedLine } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 900);
title(ctx, 1560, 'Workflow in a medical laboratory', 'The journey of a request — from the clinician\u2019s question to the reported answer');

const steps = [
  { n: 1, t: 'REQUEST', d: 'A clinician asks a specific question and completes a request form: patient details, tests, clinical notes', fill: C.pinkSoft, stroke: '#f9a8d4' },
  { n: 2, t: 'COLLECTION', d: 'Sample taken into the right tube, labelled at the bedside \u2014 label and form must match before it leaves the patient', fill: C.amberSoft, stroke: '#fde68a' },
  { n: 3, t: 'TRANSPORT', d: 'Sample moved promptly, at the right temperature; delays degrade the analyte and falsify results', fill: C.accentSoft, stroke: '#c7d2fe' },
  { n: 4, t: 'RECEPTION', d: 'Accessioned with a unique laboratory number; integrity, labelling and form checked before acceptance', fill: C.accent2Soft, stroke: '#bae6fd' },
  { n: 5, t: 'ANALYSIS', d: 'Run on analysers calibrated with known standards and checked with quality-control material before patient samples', fill: C.okSoft, stroke: '#bbf7d0' },
  { n: 6, t: 'VALIDATION', d: 'Results checked against QC ranges and previous values for the patient (delta check) \u2014 implausible results re-run', fill: '#fef9c3', stroke: '#fde047' },
  { n: 7, t: 'REPORT', d: 'Result reported to the clinician, with reference ranges and where appropriate a comment; turnaround time recorded', fill: '#e0e7ff', stroke: '#a5b4fc' },
  { n: 8, t: 'ACTION', d: 'The clinician acts on the answer \u2014 treatment, monitoring or a further request: the loop that began at step 1', fill: C.pinkSoft, stroke: '#f9a8d4' },
];
steps.forEach((s, i) => {
  const x = 90 + (i % 4) * 370;
  const y = 150 + Math.floor(i / 4) * 300;
  panelBox(ctx, x, y, 330, 230, s.fill, s.stroke, 14);
  ctx.beginPath();
  ctx.arc(x + 40, y + 40, 22, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = s.stroke;
  ctx.stroke();
  textCentered(ctx, String(s.n), x + 40, y + 41, 30, 19, '700');
  textLeft(ctx, s.t, x + 76, y + 40, 240, 19, '700');
  paragraph(ctx, s.d, x + 30, y + 96, 270, 25, 16, '400', C.sub);
  if (i % 4 !== 3) arrow(ctx, x + 334, y + 115, x + 364, y + 115, 3, C.faint);
});
// row link arrow (4 → 5)
arrow(ctx, 1420, 368, 1420, 398, 3, C.faint);
ctx.beginPath();
ctx.moveTo(1420, 398);
ctx.lineTo(255, 398);
ctx.lineWidth = 3;
ctx.strokeStyle = C.faint;
ctx.stroke();
arrow(ctx, 255, 398, 255, 442, 3, C.faint);

// POCT + TAT strip
panelBox(ctx, 90, 760, 1380, 110, '#f1f5f9', '#cbd5e1', 14);
textLeft(ctx, 'Turnaround time (TAT) = request \u2192 report.', 130, 795, 640, 18, '700', C.accent);
textLeft(ctx, 'Point-of-care testing (POCT) \u2014 glucose meters, blood-gas analysers at the bedside \u2014 shortens TAT but still demands calibration, QC and training.', 130, 830, 1330, 17, '400', C.sub);

save('a210-lab-workflow.png', canvas);