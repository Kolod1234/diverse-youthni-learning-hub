// Diagram 9 — pathology: the study of disease, its causes and its vocabulary.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, arrow, chip } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 900);
title(ctx, 1560, 'Pathology: the science of disease', 'Four words describe any disease precisely: cause, mechanism, structural change, symptoms');

// Top row: the four-term chain
const terms = [
  ['AETIOLOGY', 'the cause of the disease', C.accentSoft, '#c7d2fe', C.accent],
  ['PATHOGENESIS', 'how the cause produces the disease, step by step', C.accent2Soft, '#bae6fd', '#075985'],
  ['PATHOLOGICAL CHANGE', 'the structural change in cells and tissues', C.amberSoft, '#fde68a', '#92400e'],
  ['SYMPTOMS & SIGNS', 'what the patient feels and what the clinician observes', C.pinkSoft, '#fbcfe8', '#9d174d'],
];
terms.forEach(([h, b, fill, stroke, color], i) => {
  const x = 60 + i * (350 + 27);
  panelBox(ctx, x, 160, 350, 150, fill, stroke, 14);
  textCentered(ctx, h, x + 175, 200, 310, 20, '700', color);
  paragraph(ctx, b, x + 24, 245, 302, 26, 16.5, '400', C.ink);
  if (i < 3) arrow(ctx, x + 352, 235, x + 375, 235, 3, C.ink);
});

// Middle: example chain
panelBox(ctx, 60, 350, 1440, 130, '#ffffff', C.panelBorder, 14);
textCentered(ctx, 'Example: lung cancer in a smoker', 780, 383, 1400, 20, '700');
textCentered(ctx, 'Cause: carcinogens in tobacco smoke  \u2192  Mechanism: mutations accumulate in airway epithelium  \u2192  Change: disordered cells invade tissue  \u2192  Signs: cough, mass on imaging', 780, 425, 1400, 16.5, '600', C.sub);

// Bottom: causes of disease classification
panelBox(ctx, 60, 510, 1440, 350, C.panel, C.panelBorder, 14);
textCentered(ctx, 'Classifying the causes of disease', 780, 548, 1400, 22, '700');
const causes = [
  ['GENETIC', 'Inherited in DNA, e.g. cystic fibrosis, sickle cell disease', '#eef2ff'],
  ['INFECTIVE', 'Viruses, bacteria, fungi, parasites, e.g. influenza', '#dcfce7'],
  ['ENVIRONMENTAL', 'Toxins, radiation, diet, carcinogens, e.g. asbestos', '#e0f2fe'],
  ['DEGENERATIVE', 'Wear and ageing of tissues, e.g. osteoarthritis', '#fef3c7'],
  ['NEOPLASTIC', 'New abnormal growth, benign or malignant', '#fce7f3'],
  ['IMMUNE / METABOLIC', 'Defence turned on the body or chemistry failing, e.g. type 1 diabetes', '#fee2e2'],
];
const cw2 = 460, ch2 = 130;
causes.forEach(([h, b, fill], i) => {
  const x = 90 + (i % 3) * (cw2 + 25);
  const y = 575 + Math.floor(i / 3) * (ch2 + 22);
  panelBox(ctx, x, y, cw2, ch2, fill, '#ffffff', 12);
  textCentered(ctx, h, x + cw2 / 2, y + 34, cw2 - 40, 18, '700', C.ink);
  paragraph(ctx, b, x + 24, y + 68, cw2 - 48, 25, 15.5);
});
save('a28-pathology.png', canvas);