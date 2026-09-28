// AS 6 diagram 7 — pharmacokinetics: the ADME journey through a body outline.
const { C, makeCanvas, title, save, panelBox, textCentered, paragraph, arrow, chip } = require('./common.cjs');

function render() {
  const W = 1500, H = 920;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'What the body does to the drug: ADME', 'Absorption → Distribution → Metabolism → Excretion');

  // Simple body outline (torso + head), centred.
  const bx = 560, by = 300;
  ctx.strokeStyle = C.faint;
  ctx.fillStyle = '#f8fafc';
  ctx.lineWidth = 3;
  // Head.
  ctx.beginPath();
  ctx.arc(bx, by - 150, 55, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Torso.
  roundish(ctx, bx - 120, by - 70, 240, 400, 90);
  ctx.fill();
  ctx.stroke();

  // Stomach/gut blob (site of absorption).
  ctx.fillStyle = C.accentSoft;
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(bx, by + 40, 55, 80, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Liver blob (metabolism).
  ctx.fillStyle = '#fee2e2';
  ctx.strokeStyle = C.warn;
  ctx.beginPath();
  ctx.ellipse(bx + 60, by - 40, 45, 60, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Kidney blobs (excretion).
  ctx.fillStyle = C.accent2Soft;
  ctx.strokeStyle = C.accent2;
  ctx.beginPath();
  ctx.ellipse(bx - 55, by + 165, 20, 34, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(bx + 45, by + 175, 20, 34, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Blood vessel line down the torso.
  ctx.strokeStyle = C.warn;
  ctx.setLineDash([]);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(bx - 90, by - 60);
  ctx.lineTo(bx - 90, by + 260);
  ctx.stroke();

  // Callout labels.
  const notes = [
    { x: 250, y: 250, t: '1  ABSORPTION', col: C.accent, d: 'The drug moves from its site of administration into the bloodstream — e.g. dissolved in the gut and absorbed through its walls.' },
    { x: 250, y: 450, t: '2  DISTRIBUTION', col: C.warn, d: 'Carried by the blood, the drug is reversibly transferred into the tissues and organs where it is needed.' },
    { x: 1130, y: 250, t: '3  METABOLISM', col: C.warn, d: 'The liver chemically alters the drug — usually into a more water-soluble form that is easier to eliminate.' },
    { x: 1130, y: 450, t: '4  EXCRETION', col: C.accent2, d: 'The kidneys permanently remove the drug and its breakdown products from the blood, leaving in urine.' },
  ];
  notes.forEach((n) => {
    panelBox(ctx, n.x, n.y, 340, 190, '#ffffff', n.col, 14);
    textCentered(ctx, n.t, n.x + 170, n.y + 36, 300, 21, '700', n.col);
    paragraph(ctx, n.d, n.x + 170, n.y + 90, 300, 25, 16, '400', C.ink, 'center');
  });
  arrow(ctx, 595, 340, 590 - 20, 340 - 60, 3, C.faint);

  // Bottom note.
  panelBox(ctx, 70, 810, W - 140, 80, C.panel, C.panelBorder, 14);
  textCentered(ctx, 'Pharmacokinetics = what the BODY does to the DRUG.   Pharmacodynamics = what the DRUG does to the BODY.   Watch the D!', W / 2, 850, W - 220, 19, '600', C.ink);

  save('as6-adme.png', canvas);
}

function roundish(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

module.exports = { render };