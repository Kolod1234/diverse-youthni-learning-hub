// AS 6 diagram 6 — trial design: randomisation, placebo and the double-blind.
const { C, makeCanvas, title, save, panelBox, textCentered, paragraph, arrow, chip } = require('./common.cjs');

function render() {
  const W = 1500, H = 960;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Designing a trial that cannot fool itself', 'Randomisation, placebo and the double-blind — each removes one source of bias');

  // Volunteer pool.
  panelBox(ctx, 60, 160, 300, 220, C.accentSoft, C.accent, 14);
  textCentered(ctx, 'Volunteers', 210, 210, 240, 24, '700', C.ink);
  paragraph(ctx, 'A mixed group — different ages, sexes and health backgrounds.', 210, 260, 240, 24, 16, '400', C.sub, 'center');
  // Randomisation.
  arrow(ctx, 370, 270, 470, 270, 4, C.sub);
  chip(ctx, 'RANDOMISATION — assignment by chance', 620, 270, 280, C.sub, '#ffffff', 16);
  textCentered(ctx, 'balances the two groups so they are genuinely comparable', 620, 306, 280, 14, '400', C.sub);

  // Two arms.
  const armY = 340;
  panelBox(ctx, 350, armY, 300, 170, C.okSoft, C.ok, 14);
  textCentered(ctx, 'Treatment group', 500, armY + 38, 260, 21, '700', C.ok);
  paragraph(ctx, 'Receives the new medicine — identical-looking tablets, same packaging, same schedule.', 500, armY + 88, 250, 24, 16, '400', C.ink, 'center');

  panelBox(ctx, 700, armY, 300, 170, C.panel, C.panelBorder, 14);
  textCentered(ctx, 'Control group', 850, armY + 38, 260, 21, '700', C.ink);
  paragraph(ctx, 'Receives a placebo — an inert substance (e.g. sugar pill or saline) indistinguishable from the real medicine, or the current standard treatment.', 850, armY + 88, 250, 24, 16, '400', C.ink, 'center');

  arrow(ctx, 500, armY - 40, 500, armY - 8, 3, C.sub);
  arrow(ctx, 850, armY - 40, 850, armY - 8, 3, C.sub);

  // Double-blind band.
  panelBox(ctx, 1060, armY - 20, 380, 300, C.amberSoft, C.amber, 14);
  textCentered(ctx, 'DOUBLE-BLIND', 1250, armY + 20, 320, 24, '700', C.amber);
  paragraph(ctx, 'Neither the participant nor the researcher assessing them knows who holds the active medicine and who holds the placebo.', 1250, armY + 72, 330, 25, 16, '400', C.ink, 'center');
  paragraph(ctx, 'Removes the patient&rsquo;s expectation bias AND the observer&rsquo;s recording bias. A third party holds the code until the trial ends.', 1250, armY + 150, 330, 25, 16, '400', C.sub, 'center');

  // Outcomes.
  arrow(ctx, 500, armY + 180, 500, armY + 230, 3, C.sub);
  arrow(ctx, 850, armY + 180, 850, armY + 230, 3, C.sub);
  panelBox(ctx, 350, armY + 240, 650, 90, C.panel, C.panelBorder, 14);
  textCentered(ctx, 'Compare outcomes between the groups', 675, armY + 272, 600, 20, '700', C.ink);
  textCentered(ctx, 'Any real difference must come from the medicine — everything else was matched.', 675, armY + 305, 600, 15, '400', C.sub);

  // Ethics band.
  panelBox(ctx, 60, 700, W - 120, 210, C.panel, C.panelBorder, 16);
  textCentered(ctx, 'The ethical frame around every trial', W / 2, 738, 700, 22, '700', C.ink);
  const items = [
    ['Informed consent', 'Voluntary, written, fully briefed on risks — and the right to withdraw at any time.'],
    ['Good Clinical Practice', 'The international standard for designing, conducting, recording and reporting trials.'],
    ['Ethics committee approval', 'Every trial plan is scrutinised and approved before recruitment begins.'],
    ['No placebo when treatment exists', 'If an effective therapy exists, the new drug is compared against the standard of care instead.'],
  ];
  const iw = (W - 160 - 60) / 4;
  items.forEach(([t, d], i) => {
    const ix = 80 + i * (iw + 20);
    textCentered(ctx, t, ix + iw / 2, 786, iw - 24, 17, '700', C.accent);
    paragraph(ctx, d, ix + iw / 2, 826, iw - 30, 22, 15, '400', C.sub, 'center');
  });

  save('as6-trial-design.png', canvas);
}

module.exports = { render };