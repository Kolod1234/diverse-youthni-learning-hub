// Diagram 2 — specimen reception: accessioning, request form, rejection criteria.
const { C, makeCanvas, title, save, panelBox, arrow, paragraph, textCentered, textLeft, setFont, roundRect } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 900);
title(ctx, 1560, 'Specimen reception and accessioning', 'Every sample is registered, numbered and matched to its paperwork before any science begins');

// Left: the arriving specimen
panelBox(ctx, 70, 160, 420, 300, C.accentSoft, '#c7d2fe', 16);
textCentered(ctx, 'Specimen arrives', 280, 200, 360, 24, '700');
paragraph(ctx, 'Container of tissue + request form from the clinician or surgeon.', 100, 240, 360, 26, 18);
roundRect(ctx, 150, 330, 260, 60, 10); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.panelBorder; ctx.stroke();
textCentered(ctx, 'Label: name, DOB, ID number', 280, 360, 240, 16, '600', C.sub);
paragraph(ctx, 'Date, time and anatomical source recorded', 100, 415, 360, 24, 17, '400', C.sub);

arrow(ctx, 500, 310, 590, 310, 3, C.ink);

// Middle: accessioning
panelBox(ctx, 600, 160, 430, 300, '#ffffff', C.accent, 16);
textCentered(ctx, 'Accessioning', 815, 200, 380, 24, '700', C.accent);
paragraph(ctx, 'The sample is registered in the laboratory information system and given a unique laboratory number that follows the specimen and its paperwork through every stage.', 630, 245, 370, 27, 18);
paragraph(ctx, 'Result: complete traceability from patient to slide to report.', 630, 385, 370, 26, 18, '700', C.ink);

arrow(ctx, 1040, 310, 1130, 310, 3, C.ink);

// Right: accept or reject
panelBox(ctx, 1140, 160, 350, 300, C.okSoft, '#bbf7d0', 16);
textCentered(ctx, 'Accepted', 1315, 200, 300, 22, '700', C.ok);
paragraph(ctx, 'Details on form match the container label exactly — processing begins.', 1170, 245, 300, 26, 17);

panelBox(ctx, 1140, 480, 350, 260, C.warnSoft, '#fecaca', 16);
textCentered(ctx, 'Rejected — patient safety first', 1315, 520, 310, 22, '700', C.warn);
let y = 565;
[
  'Unlabelled or mislabelled container',
  'Leaking container — sample damaged, staff at risk',
  'No request form, or form and label disagree',
].forEach(t => { y = paragraph(ctx, '\u2022  ' + t, 1170, y, 300, 26, 17) + 8; });

// Bottom: mandatory request-form fields
panelBox(ctx, 70, 500, 420, 300, C.panel, C.panelBorder, 16);
textCentered(ctx, 'Request form must state', 280, 540, 380, 22, '700');
let fy = 585;
[
  'Patient identity (name, DOB, H&SC number)',
  'Requesting clinician and surgeon',
  'Date and time of collection',
  'Specimen type and anatomical site',
  'Relevant clinical history',
].forEach(t => { fy = paragraph(ctx, '\u2022  ' + t, 100, fy, 370, 27, 17) + 4; });

panelBox(ctx, 500, 500, 530, 300, C.panel, C.panelBorder, 16);
textCentered(ctx, 'Why the paperwork is part of the science', 765, 540, 490, 22, '700');
paragraph(ctx, 'A diagnosis attached to the wrong patient is not a weak result — it is a dangerous one. Traceability guarantees that the pathologist\u2019s report describes this patient\u2019s tissue, and no other.', 530, 590, 470, 28, 18);

panelBox(ctx, 600, 790, 890, 70, C.amberSoft, '#fde68a', 14);
textCentered(ctx, 'Golden rule: if in doubt, the sample is not processed until identity is certain.', 1045, 825, 850, 19, '600');

save('a28-accessioning.png', canvas);