// Diagram 1 — the four clinical laboratory departments and what each analyses.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, setFont } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 960);
title(ctx, 1560, 'The four clinical laboratory departments', 'Which department a specimen goes to depends on what question is being asked');

const cards = [
  {
    name: 'HISTOPATHOLOGY', sub: '(Cellular Pathology)', fill: C.accentSoft, stroke: '#c7d2fe',
    samples: 'Solid tissue (biopsies), cell smears (cytology)',
    tests: 'Tissue architecture, H&E sections, tumour diagnosis and staging',
    focus: 'Structure of tissues and cells',
  },
  {
    name: 'BIOCHEMISTRY', sub: '(Clinical Chemistry)', fill: C.amberSoft, stroke: '#fde68a',
    samples: 'Blood plasma/serum, urine, CSF',
    tests: 'Glucose, electrolytes, enzymes, hormones, lipids',
    focus: 'Chemicals and molecules in body fluids',
  },
  {
    name: 'HAEMATOLOGY', sub: '(Blood Sciences)', fill: C.warnSoft, stroke: '#fecaca',
    samples: 'Whole blood, bone marrow',
    tests: 'Full blood count, clotting, red/white cells, platelets',
    focus: 'Blood cells and clotting mechanisms',
  },
  {
    name: 'MICROBIOLOGY', sub: '(Infection Sciences)', fill: C.okSoft, stroke: '#bbf7d0',
    samples: 'Swabs, urine, sputum, blood cultures',
    tests: 'Culture, staining, identification, antibiotic sensitivity',
    focus: 'Infectious microorganisms',
  },
];

const x0 = 80, cw = 680, ch = 330, gap = 40;
cards.forEach((c, i) => {
  const x = x0 + (i % 2) * (cw + gap);
  const y = 150 + Math.floor(i / 2) * (ch + 36);
  panelBox(ctx, x, y, cw, ch, c.fill, c.stroke, 18);
  textCentered(ctx, c.name, x + cw / 2, y + 46, cw - 60, 30, '700');
  textCentered(ctx, c.sub, x + cw / 2, y + 78, cw - 60, 19, '400', C.sub);
  let yy = y + 120;
  yy = paragraph(ctx, 'Specimens: ' + c.samples, x + 28, yy, cw - 56, 27, 19, '400') + 14;
  yy = paragraph(ctx, 'Typical work: ' + c.tests, x + 28, yy, cw - 56, 27, 19, '400') + 14;
  paragraph(ctx, 'Focus: ' + c.focus, x + 28, yy, cw - 56, 27, 19, '700', C.accent);
});

panelBox(ctx, 80, 850, 1400, 76, C.panel, C.panelBorder, 14);
textCentered(ctx, 'The rule: if the investigation looks directly at tissue or cell structure, it is Histopathology — every other specimen type has its own department.', 780, 888, 1340, 20, '600', C.ink);

save('a28-lab-departments.png', canvas);