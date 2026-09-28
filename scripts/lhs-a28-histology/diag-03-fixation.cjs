// Diagram 3 — fixation: preserving tissue in a life-like state.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, setFont, arrow, lead } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 880);
title(ctx, 1560, 'Fixation: stopping the clock on decay', '10% neutral buffered formalin preserves tissue as close to living as possible');

// Centre: specimen jar
panelBox(ctx, 620, 150, 320, 330, '#ffffff', C.accent, 16);
roundJar();
function roundJar() {
  const { roundRect } = require('./common.cjs');
  roundRect(ctx, 690, 210, 180, 200, 14);
  ctx.fillStyle = '#eef2ff'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = C.accent; ctx.stroke();
  // tissue pieces
  ctx.fillStyle = '#c7d2fe';
  ctx.beginPath(); ctx.ellipse(760, 290, 34, 24, 0.4, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(800, 340, 26, 18, -0.3, 0, Math.PI * 2); ctx.fill();
}
textCentered(ctx, 'Specimen in fixative', 780, 190, 280, 20, '700', C.accent);
textCentered(ctx, '10% neutral buffered formalin', 780, 440, 300, 20, '600', C.ink);
textCentered(ctx, 'at least 10\u201320 \u00d7 the tissue volume', 780, 468, 300, 17, '400', C.sub);

// Left: what fixation prevents
panelBox(ctx, 70, 150, 480, 330, C.warnSoft, '#fecaca', 16);
textCentered(ctx, 'Without fixation', 310, 195, 420, 24, '700', C.warn);
let ly = 245;
ly = paragraph(ctx, 'AUTOLYSIS — the tissue digests itself with its own enzymes; cells lose the structure a diagnosis depends on.', 100, ly, 420, 28, 18) + 16;
ly = paragraph(ctx, 'PUTREFACTION — bacteria decay the tissue; architecture is destroyed and the sample is unusable.', 100, ly, 420, 28, 18) + 16;
paragraph(ctx, 'Result: no slide can be cut from an unpreserved specimen, and the diagnosis is lost.', 100, ly, 420, 28, 17, '700', C.ink);

// Right: what fixation achieves
panelBox(ctx, 1010, 150, 480, 330, C.okSoft, '#bbf7d0', 16);
textCentered(ctx, 'With fixation', 1250, 195, 420, 24, '700', C.ok);
let ry = 245;
ry = paragraph(ctx, 'Proteins are cross-linked and stabilised — cell and tissue architecture is preserved as in life.', 1040, ry, 420, 28, 18) + 16;
ry = paragraph(ctx, 'Enzyme activity and bacterial growth are halted, so decay cannot begin.', 1040, ry, 420, 28, 18) + 16;
ry = paragraph(ctx, 'The tissue is hardened and protected for all the processing steps that follow.', 1040, ry, 420, 28, 18) + 16;
paragraph(ctx, 'Result: a permanent, faithful record of the disease at the moment of removal.', 1040, ry, 420, 28, 17, '700', C.ink);

// Bottom: penetration note + safety
panelBox(ctx, 70, 520, 700, 300, C.panel, C.panelBorder, 16);
textCentered(ctx, 'Penetration takes time', 420, 560, 640, 22, '700');
let py = 605;
py = paragraph(ctx, 'Formalin diffuses slowly into tissue — roughly 1 mm per hour. A large specimen must be sliced so the fixative can reach the centre; a thick, uncut specimen fixes outside-in and the middle decays before it is preserved.', 100, py, 640, 28, 18) + 14;
paragraph(ctx, 'Large specimens are also inked at their margins so the pathologist can tell which surface faced which direction.', 100, py, 640, 28, 17, '400', C.sub);

panelBox(ctx, 800, 520, 690, 300, C.amberSoft, '#fde68a', 16);
textCentered(ctx, 'Safety: formalin is hazardous', 1145, 560, 630, 22, '700', C.warn);
let sy = 605;
sy = paragraph(ctx, 'Formaldehyde is a carcinogen and respiratory irritant. Under COSHH it is handled in ventilated areas or fume hoods, with PPE, spill procedures and controlled disposal.', 830, sy, 630, 28, 18) + 14;
paragraph(ctx, 'Under the Human Tissue Act 2004 the tissue itself is stored and used only with proper consent.', 830, sy, 630, 28, 18);

save('a28-fixation.png', canvas);