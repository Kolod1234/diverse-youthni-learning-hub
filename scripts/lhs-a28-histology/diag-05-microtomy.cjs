// Diagram 5 — embedding, microtomy and mounting: wax block to stained slide.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, arrow, lead, chip } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 860);
title(ctx, 1560, 'Embedding and microtomy: from block to slide', 'Wax support and a precision blade turn a block into sections thin enough for light to pass through');

// Panel 1: embedding
panelBox(ctx, 70, 160, 430, 330, C.pinkSoft, '#fbcfe8', 16);
textCentered(ctx, 'EMBEDDING', 285, 200, 380, 22, '700', '#9d174d');
// mould + block
ctx.fillStyle = '#f1f5f9';
ctx.beginPath(); ctx.rect(180, 260, 210, 140); ctx.fill();
ctx.lineWidth = 2.5; ctx.strokeStyle = '#9d174d'; ctx.stroke();
ctx.fillStyle = '#fbcfe8';
ctx.beginPath(); ctx.rect(190, 270, 190, 60); ctx.fill();
ctx.strokeStyle = '#9d174d'; ctx.lineWidth = 2; ctx.stroke();
textCentered(ctx, 'tissue in fresh wax', 285, 300, 190, 14, '600', '#9d174d');
paragraph(ctx, 'The cassette is opened into a metal mould filled with fresh molten paraffin wax; as it cools and hardens it forms a solid block that grips the tissue and supports the cut.', 100, 425, 380, 26, 16.5);

// Panel 2: microtome
panelBox(ctx, 540, 160, 480, 330, C.accentSoft, '#c7d2fe', 16);
textCentered(ctx, 'MICROTOMY', 780, 200, 420, 22, '700', C.accent);
// microtome schematic
ctx.fillStyle = '#e0e7ff'; ctx.fillRect(620, 250, 120, 120);
ctx.lineWidth = 2.5; ctx.strokeStyle = C.accent; ctx.strokeRect(620, 250, 120, 120);
ctx.fillStyle = '#ffffff'; ctx.fillRect(630, 260, 100, 30); ctx.strokeStyle = C.accent; ctx.strokeRect(630, 260, 100, 30);
textCentered(ctx, 'block', 680, 275, 90, 13, '600', C.accent);
ctx.fillStyle = '#1f2937'; ctx.beginPath(); ctx.rect(790, 295, 120, 10); ctx.fill(); // blade
textCentered(ctx, 'steel blade', 850, 283, 110, 13, '600', C.sub);
// ribbon of sections
ctx.strokeStyle = '#a5b4fc'; ctx.lineWidth = 2.5;
ctx.beginPath(); ctx.moveTo(620, 340); ctx.quadraticCurveTo(700, 395, 860, 390); ctx.stroke();
textCentered(ctx, 'ribbon of sections 3\u20135 \u00b5m thick', 760, 425, 420, 15, '600', C.ink);
paragraph(ctx, 'A microtome slices the wax block into a continuous ribbon of sections a few micrometres thick — light passes through tissue this thin.', 570, 455, 420, 26, 16.5);

// Panel 3: water bath and slide
panelBox(ctx, 1060, 160, 430, 330, C.accent2Soft, '#bae6fd', 16);
textCentered(ctx, 'MOUNTING', 1275, 200, 380, 22, '700', '#075985');
// water bath
ctx.fillStyle = '#bae6fd'; ctx.fillRect(1120, 265, 200, 90);
ctx.lineWidth = 2.5; ctx.strokeStyle = '#075985'; ctx.strokeRect(1120, 265, 200, 90);
textCentered(ctx, 'warm water bath', 1220, 322, 190, 14, '600', '#075985');
// slide
ctx.fillStyle = '#ffffff'; ctx.fillRect(1355, 285, 100, 46);
ctx.strokeStyle = '#075985'; ctx.strokeRect(1355, 285, 100, 46);
ctx.fillStyle = '#bae6fd'; ctx.fillRect(1365, 295, 60, 26);
textCentered(ctx, 'glass slide', 1405, 350, 90, 13, '600', C.sub);
paragraph(ctx, 'The ribbon is floated on a warm water bath to flatten out wrinkles, picked up onto a glass slide, and dried ready for staining.', 1090, 440, 380, 26, 16.5);

arrow(ctx, 500, 325, 535, 325, 3, C.ink);
arrow(ctx, 1020, 325, 1055, 325, 3, C.ink);

// Bottom: scale comparison
panelBox(ctx, 70, 530, 1420, 270, C.panel, C.panelBorder, 14);
textCentered(ctx, 'Why 3\u20135 micrometres?', 780, 568, 1380, 22, '700');
paragraph(ctx, 'A human hair is about 70 \u00b5m across; a typical cell is 10\u201330 \u00b5m. A section must be thinner than one cell so that light passes through it and structures do not lie on top of one another in the image. Cutting wax, not the tissue itself, is what makes such sections possible: the wax holds every fragment in place while the blade passes through.', 150, 610, 1260, 29, 18);
paragraph(ctx, 'Blade sharpness and angle are critical: a dull blade tears the tissue and produces artefacts that can be mistaken for disease.', 150, 730, 1260, 26, 17, '400', C.sub);

save('a28-microtomy.png', canvas);