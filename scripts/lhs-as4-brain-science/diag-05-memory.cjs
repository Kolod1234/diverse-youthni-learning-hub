// AS 4 Brain Science — diagram 7: the multi-store model of memory.
const { C, textCentered, textLeft, makeCanvas, title, save, arrow, roundRect, panelBox, chip, dashedLine, setFont } = require('./common.cjs');

function renderMemoryModel() {
  const W = 1500, H = 950;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'The multi-store model of memory',
    'Information must be attended to, rehearsed and encoded to survive the journey');

  const boxY = 200, boxH = 200;

  // Three stores.
  const stores = [
    { x: 100, w: 340, title: 'SENSORY REGISTER', fill: C.accent2Soft, sub: 'everything your senses pick up', chipA: 'capacity: vast', chipB: 'duration: a fraction of a second' },
    { x: 560, w: 340, title: 'SHORT-TERM MEMORY', fill: C.accentSoft, sub: '(working memory) \u2014 what you are thinking about now', chipA: 'capacity: around 7 items', chipB: 'duration: seconds' },
    { x: 1020, w: 340, title: 'LONG-TERM MEMORY', fill: C.okSoft, sub: 'your store of knowledge and experience', chipA: 'capacity: effectively unlimited', chipB: 'duration: a lifetime' },
  ];
  stores.forEach((s) => {
    panelBox(ctx, s.x, boxY, s.w, boxH, s.fill);
    textCentered(ctx, s.title, s.x + s.w / 2, boxY + 45, s.w - 30, 21, '700');
    textCentered(ctx, s.sub, s.x + s.w / 2, boxY + 80, s.w - 40, 15, '400', C.sub);
    textCentered(ctx, s.chipA, s.x + s.w / 2, boxY + 130, s.w - 40, 16, '600');
    textCentered(ctx, s.chipB, s.x + s.w / 2, boxY + 160, s.w - 40, 16, '600');
  });

  // Environment chip above the sensory register.
  chip(ctx, 'the environment \u2014 sights, sounds, smells', 270, 160, 320, '#ffffff');

  // Attention arrow: sensory -> STM.
  arrow(ctx, 450, boxY + 100, 550, boxY + 100, 5);
  textCentered(ctx, 'ATTENTION', 500, boxY + 70, 100, 17, '700', C.accent);
  textCentered(ctx, 'notice it or lose it', 500, boxY + 132, 100, 13, '400', C.sub);

  // Encoding arrow: STM -> LTM.
  arrow(ctx, 910, boxY + 100, 1010, boxY + 100, 5);
  textCentered(ctx, 'ENCODING', 960, boxY + 70, 100, 17, '700', C.ok);
  textCentered(ctx, 'organise, connect,', 960, boxY + 126, 100, 13, '400', C.sub);
  textCentered(ctx, 'give it meaning', 960, boxY + 144, 100, 13, '400', C.sub);

  // Rehearsal loop above STM.
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(730, boxY + 60, 120, Math.PI, Math.PI * 2);
  ctx.stroke();
  arrow(ctx, 615, boxY + 60, 610, boxY + 62, 4, C.accent);
  textCentered(ctx, 'MAINTENANCE REHEARSAL \u2014 repeating keeps it alive', 730, boxY - 55, 480, 16, '700', C.accent);

  // Retrieval arrow below (LTM -> STM).
  dashedLine(ctx, 1190, boxY + 210, 730, boxY + 210, C.ok, 4);
  arrow(ctx, 735, boxY + 210, 728, boxY + 210, 4, C.ok);
  textCentered(ctx, 'RETRIEVAL \u2014 bring it back when needed', 960, boxY + 238, 400, 16, '700', C.ok);

  // Forgetting notes.
  textLeft(ctx, 'ignored \u2192 gone within a fraction of a second', 105, 445, 330, 15, '600', C.warn);
  textLeft(ctx, 'unrehearsed \u2192 displaced or fades within seconds', 565, 445, 330, 15, '600', C.warn);

  // Bottom panel.
  panelBox(ctx, 90, 500, W - 180, 380);
  textCentered(ctx, 'The hippocampus consolidates \u2014 it is the librarian, not the whole library', W / 2, 545, W - 260, 23, '700');
  textLeft(ctx, 'Short-term traces are converted into stable long-term memories by the hippocampus, deep in the temporal lobe.', 150, 590, 1240, 17, '400', C.sub);
  textLeft(ctx, 'The finished memories are stored as networks spread across the cerebrum \u2014 which is why damage to one spot rarely erases a whole lifetime.', 150, 618, 1240, 17, '400', C.sub);

  textCentered(ctx, 'Three kinds of long-term store', W / 2, 680, W - 300, 19, '700');
  const ltm = [
    ['Episodic', 'events you have lived through \u2014 your last birthday, yesterday\u2019s run', C.accent2Soft],
    ['Semantic', 'facts and meanings \u2014 Paris is the capital of France, water boils at 100 \u00b0C', C.accentSoft],
    ['Procedural', 'skills \u2014 riding a bike, touch-typing: things you do rather than describe', C.okSoft],
  ];
  ltm.forEach((col, i) => {
    const x = 140 + i * 440;
    panelBox(ctx, x, 710, 400, 130, col[2]);
    textCentered(ctx, col[0], x + 200, 742, 370, 20, '700');
    textCentered(ctx, col[1], x + 200, 790, 370, 15, '400', C.sub);
  });

  save('as4-memory-model.png', canvas);
}

module.exports = { renderMemoryModel };