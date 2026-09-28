// Diagram 3 — diagnostic imaging compared: ultrasound, X-ray/CT, MRI.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, chip } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 950);
title(ctx, 1560, 'Diagnostic imaging: three windows into the body', 'Ultrasound, X-ray/CT and MRI — mechanism, dose and safety at a glance');

const cols = [
  {
    x: 90, fill: C.okSoft, stroke: '#bbf7d0', name: 'ULTRASOUND',
    mech: 'A piezoelectric crystal sends a pulse of high-frequency sound (> 20 kHz, typically several MHz) into the tissue and records the echoes. Depth of each reflecting boundary = (speed \u00d7 echo time) \u00f7 2, with sound travelling about 1540 m/s in tissue.',
    dose: 'No ionising radiation — safe for repeated use and for the fetus',
    best: 'Moving structures: heart valves, fetal scan; quick, bedside, real-time',
    limit: 'Air and bone block the sound; image quality depends on the operator',
    formula: 'depth = (1540 m/s \u00d7 echo time) \u00f7 2',
  },
  {
    x: 590, fill: C.amberSoft, stroke: '#fde68a', name: 'X-RAY AND CT',
    mech: 'X-rays pass through the body; denser tissue (bone, contrast media) absorbs more, so less reaches the detector — the shadow pattern is the image. A CT scanner rotates an X-ray tube around the patient and a computer builds a cross-sectional slice.',
    dose: 'Ionising radiation — every scan adds dose, so use is justified and limited',
    best: 'Bone, chest, and fast full-body imaging in emergencies',
    limit: 'Radiation dose accumulates; soft-tissue contrast is weaker than MRI',
    formula: 'absorption contrast \u2192 shadow image',
  },
  {
    x: 1090, fill: C.accent2Soft, stroke: '#bae6fd', name: 'MRI',
    mech: 'A powerful magnetic field aligns hydrogen protons in the body\u2019s water; a radiofrequency pulse tips them out of line; as they relax they emit a faint radio signal whose timing and strength the computer turns into a detailed image.',
    dose: 'No ionising radiation — but a very strong magnetic field',
    best: 'Soft tissue in fine detail: brain, joints, spine, organs',
    limit: 'Ferromagnetic implants can be forcibly moved; pacemakers may fail; slow, loud, claustrophobic',
    formula: 'magnet + radio pulse \u2192 proton signal \u2192 image',
  },
];
cols.forEach((c) => {
  panelBox(ctx, c.x, 150, 380, 640, c.fill, c.stroke, 18);
  textCentered(ctx, c.name, c.x + 190, 190, 340, 23, '700');
  let y = 226;
  const label = (txt, yy) => textLeft(ctx, txt, c.x + 26, yy, 330, 15, '700', C.accent);
  label('MECHANISM', y); y = paragraph(ctx, c.mech, c.x + 26, y + 26, 330, 24, 16, '400', C.ink) + 12;
  label('DOSE', y); y = paragraph(ctx, c.dose, c.x + 26, y + 24, 330, 24, 16, '400', C.ink) + 12;
  label('BEST FOR', y); y = paragraph(ctx, c.best, c.x + 26, y + 24, 330, 24, 16, '400', C.ink) + 12;
  label('LIMITATIONS', y); y = paragraph(ctx, c.limit, c.x + 26, y + 24, 330, 24, 16, '400', C.ink) + 8;
  panelBox(ctx, c.x + 22, y + 6, 336, 44, '#ffffff', c.stroke, 10);
  textCentered(ctx, c.formula, c.x + 190, y + 29, 320, 16, '600', C.sub);
});

chip(ctx, 'Choosing an imaging method = the question asked + the tissue involved + the risk the patient can accept', 780, 850, 1300, '#f1f5f9', C.sub, 19);

// Portfolio prompt strip
panelBox(ctx, 90, 880, 1380, 44, C.panel, C.panelBorder, 12);
textCentered(ctx, 'Portfolio link: justify a choice of imaging for a named patient \u2014 including one patient with a metal implant, where MRI\u2019s magnetic field is the deciding factor', 780, 902, 1300, 17, '600', C.sub);

save('a210-imaging.png', canvas);