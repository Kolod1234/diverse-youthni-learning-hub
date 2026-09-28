// AS 6 diagram 7 — pharmacokinetics: the ADME journey through a body outline.
const { C, makeCanvas, title, save, panelBox, textCentered, paragraph } = require('./common.cjs');

function render() {
  const W = 1500, H = 920;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'What the body does to the drug: ADME', 'Absorption → Distribution → Metabolism → Excretion');

  // Simple body outline (torso + head), centred between the two note columns.
  const bx = 750, by = 360;
  ctx.strokeStyle = C.faint;
  ctx.fillStyle = '#f8fafc';
  ctx.lineWidth = 3;
  // Head.
  ctx.beginPath();
  ctx.arc(bx, by - 190, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // Torso.
  roundish(ctx, bx - 110, by - 120, 220, 380, 85);
  ctx.fill();
  ctx.stroke();

  // Stomach/gut blob (site of absorption).
  ctx.fillStyle = C.accentSoft;
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(bx, by + 30, 52, 76, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Liver blob (metabolism).
  ctx.fillStyle = '#fee2e2';
  ctx.strokeStyle = C.warn;
  ctx.beginPath();
  ctx.ellipse(bx + 55, by - 45, 42, 56, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Kidney blobs (excretion).
  ctx.fillStyle = C.accent2Soft;
  ctx.strokeStyle = C.accent2;
  ctx.beginPath();
  ctx.ellipse(bx - 52, by + 155, 19, 32, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(bx + 42, by + 165, 19, 32, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Blood vessel line down the torso (distribution).
  ctx.strokeStyle = C.warn;
  ctx.setLineDash([]);
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(bx - 82, by - 110);
  ctx.lineTo(bx - 82, by + 230);
  ctx.stroke();

  // Stage labels pinned to the organs.
  ctx.font = '700 16px Arial, Helvetica, sans-serif';
  ctx.fillStyle = C.accent;
  ctx.textAlign = 'center';
  ctx.fillText('ABSORPTION', bx - 110, by + 40);
  ctx.fillStyle = C.warn;
  ctx.fillText('DISTRIBUTION', bx - 82, by + 256);
  ctx.fillText('METABOLISM', bx + 105, by - 45);
  ctx.fillStyle = C.accent2;
  ctx.fillText('EXCRETION', bx + 5, by + 230);

  // Note panels.
  const notes = [
    { x: 90, y: 170, t: '1  ABSORPTION', col: C.accent, d: 'The drug moves from its site of administration into the bloodstream — for a swallowed tablet, dissolved in the gut and absorbed through its walls into the blood.' },
    { x: 90, y: 400, t: '2  DISTRIBUTION', col: C.warn, d: 'Carried by the blood, the drug is reversibly transferred into the tissues and organs where it is needed.' },
    { x: 1070, y: 170, t: '3  METABOLISM', col: C.warn, d: 'The liver chemically alters the drug — usually into a more water-soluble form that is easier for the body to eliminate.' },
    { x: 1070, y: 400, t: '4  EXCRETION', col: C.accent2, d: 'The kidneys permanently remove the drug and its breakdown products from the blood; they leave the body in urine. Smaller amounts go via bile, breath and sweat.' },
  ];
  notes.forEach((n) => {
    panelBox(ctx, n.x, n.y, 340, 190, '#ffffff', n.col, 14);
    textCentered(ctx, n.t, n.x + 170, n.y + 36, 300, 21, '700', n.col);
    paragraph(ctx, n.d, n.x + 170, n.y + 86, 300, 24, 16, '400', C.ink, 'center');
  });

  // Bottom note.
  panelBox(ctx, 70, 640, W - 140, 220, C.panel, C.panelBorder, 16);
  textCentered(ctx, 'Pharmacokinetics = what the BODY does to the DRUG.    Pharmacodynamics = what the DRUG does to the BODY.    Watch the D!', W / 2, 678, W - 220, 19, '600', C.ink);
  paragraph(ctx, 'The four stages run in sequence for every medicine, whatever its route of administration. An intravenous injection skips absorption — the drug enters the circulation directly — but distribution, metabolism and excretion still happen in that order.', W / 2, 730, W - 300, 26, 17, '400', C.sub, 'center');
  paragraph(ctx, 'The chain also explains interactions: a drug that speeds up liver enzymes can clear a second drug from the blood faster than intended, weakening its effect.', W / 2, 796, W - 300, 26, 17, '400', C.sub, 'center');

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