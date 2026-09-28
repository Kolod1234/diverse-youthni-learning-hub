// AS 6 diagram 9 — pharmacodynamics: agonists and antagonists at receptors.
const { C, makeCanvas, title, save, panelBox, textCentered, paragraph, arrow, chip } = require('./common.cjs');

function drawMembrane(ctx, x, y, w) {
  ctx.strokeStyle = C.sub;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + w, y);
  ctx.stroke();
  // phospholipid tails
  ctx.lineWidth = 2;
  ctx.strokeStyle = C.faint;
  for (let i = 10; i < w; i += 26) {
    ctx.beginPath();
    ctx.moveTo(x + i, y + 3);
    ctx.lineTo(x + i - 6, y + 22);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + i, y + 3);
    ctx.lineTo(x + i + 6, y + 22);
    ctx.stroke();
  }
}

function drawReceptor(ctx, x, y) {
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x - 26, y);
  ctx.lineTo(x - 26, y + 34);
  ctx.quadraticCurveTo(x, y + 66, x + 26, y + 34);
  ctx.lineTo(x + 26, y);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

function drawMolecule(ctx, x, y, color, label) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#ffffff';
  ctx.font = '700 15px Arial, Helvetica, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y + 1);
}

function render() {
  const W = 1500, H = 940;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'What the drug does to the body', 'Receptors, agonists and antagonists — the lock-and-key of pharmacodynamics');

  // AGONIST panel.
  panelBox(ctx, 70, 150, 660, 330, '#ffffff', C.ok, 14);
  textCentered(ctx, 'AGONIST — binds AND activates', 400, 186, 600, 23, '700', C.ok);
  drawMembrane(ctx, 110, 300, 480);
  drawReceptor(ctx, 400, 262);
  drawMolecule(ctx, 400, 240, C.ok, 'A');
  arrow(ctx, 400, 350, 400, 400, 4, C.ok);
  chip(ctx, 'RESPONSE TRIGGERED', 400, 430, 300, C.ok, '#ffffff', 16);
  paragraph(ctx, 'Mimics the body&rsquo;s natural signal molecule: it fits the receptor like the correct key, turns it, and produces the physiological response.', 400, 470, 600, 24, 16, '400', C.sub, 'center');

  // ANTAGONIST panel.
  panelBox(ctx, 770, 150, 660, 330, '#ffffff', C.warn, 14);
  textCentered(ctx, 'ANTAGONIST — binds and BLOCKS', 1100, 186, 600, 23, '700', C.warn);
  drawMembrane(ctx, 810, 300, 480);
  drawReceptor(ctx, 1100, 262);
  drawMolecule(ctx, 1100, 240, C.warn, 'X');
  drawMolecule(ctx, 1160, 205, C.faint, 'S');
  ctx.strokeStyle = C.warn;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(1145, 218);
  ctx.lineTo(1112, 234);
  ctx.stroke();
  chip(ctx, 'NO RESPONSE — the natural signal cannot bind', 1100, 430, 470, C.warnSoft, C.warn, 15);
  paragraph(ctx, 'Fits the lock but does not turn it: it occupies the binding site, so the natural signal molecule is physically excluded — the response is prevented.', 1100, 470, 600, 24, 16, '400', C.sub, 'center');

  // Affinity vs efficacy band.
  panelBox(ctx, 70, 520, W - 140, 200, C.panel, C.panelBorder, 16);
  textCentered(ctx, 'Affinity and efficacy — the two scores every drug earns', W / 2, 558, 800, 23, '700', C.ink);
  const defs = [
    ['AFFINITY', 'How strongly the drug binds to its receptor.', C.accent],
    ['EFFICACY', 'Once bound, how well it activates the receptor and produces a response.', C.accent2],
  ];
  const dw = (W - 260) / 2;
  defs.forEach(([t, d], i) => {
    const dx = 110 + i * (dw + 40);
    panelBox(ctx, dx, 590, dw, 110, '#ffffff', C.panelBorder, 12);
    textCentered(ctx, t, dx + dw / 2, 622, dw - 40, 19, '700', defs[i][2]);
    paragraph(ctx, d, dx + dw / 2, 660, dw - 60, 22, 16, '400', C.ink, 'center');
  });
  textCentered(ctx, 'Both agonists and antagonists need AFFINITY — only an agonist has EFFICACY.', W / 2, 735, 1000, 18, '600', C.ink);

  // Other targets band.
  panelBox(ctx, 70, 740, W - 140, 160, C.accentSoft, C.accent, 14);
  textCentered(ctx, 'Receptors are not the only target', W / 2, 776, 600, 20, '700', C.accent);
  const targets = [
    ['Enzyme inhibitors', 'Bind an enzyme and slow or stop its catalytic activity.'],
    ['Ion-channel blockers', 'Plug ion channels so specific ions cannot cross the membrane.'],
    ['Antimicrobial agents', 'Kill bacteria or stop their growth — the target is the microorganism.'],
  ];
  const tw = (W - 220) / 3;
  targets.forEach(([t, d], i) => {
    const tx = 110 + i * tw;
    textCentered(ctx, t, tx + tw / 2, 822, tw - 40, 18, '700', C.ink);
    paragraph(ctx, d, tx + tw / 2, 858, tw - 70, 22, 15, '400', C.sub, 'center');
  });

  save('as6-receptors.png', canvas);
}

module.exports = { render };