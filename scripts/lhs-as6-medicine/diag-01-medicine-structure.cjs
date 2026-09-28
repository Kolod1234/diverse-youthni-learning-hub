// AS 6 diagram 1 — drug vs medicine, and the parts of a formulated medicine.
const { C, makeCanvas, title, save, panelBox, textCentered, paragraph } = require('./common.cjs');

function render() {
  const W = 1500, H = 900;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Drug or medicine?', 'One is a single substance; the other is a formulated product built around it');

  // Two definition panels.
  panelBox(ctx, 70, 140, 640, 200, C.accentSoft, C.accent, 16);
  textCentered(ctx, 'DRUG', 390, 190, 200, 28, '700', C.accent);
  paragraph(ctx, 'A single chemical substance that, when introduced into the body, alters physiological or biochemical processes.', 390, 252, 560, 26, 19, '400', C.ink, 'center');
  textCentered(ctx, 'Example: paracetamol — one pure molecule with one identity', 390, 314, 560, 17, '400', C.sub);

  panelBox(ctx, 790, 140, 640, 200, C.okSoft, C.ok, 16);
  textCentered(ctx, 'MEDICINE', 1110, 190, 240, 28, '700', C.ok);
  paragraph(ctx, 'A finished, formulated product containing one or more drugs plus excipients, administered to prevent, diagnose or treat disease.', 1110, 252, 560, 26, 19, '400', C.ink, 'center');
  textCentered(ctx, 'Example: a paracetamol tablet — drug plus everything built around it', 1110, 314, 560, 17, '400', C.sub);

  // The tablet anatomy.
  textCentered(ctx, 'Anatomy of a tablet', W / 2, 410, 600, 24, '700', C.ink);
  const cx = W / 2, cy = 600, rx = 150, ry = 76;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.05);
  ctx.beginPath();
  ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#eef2ff';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = C.accent;
  ctx.stroke();
  // API dots inside the tablet.
  ctx.fillStyle = C.accent;
  [[-90, -28], [-30, 16], [20, -34], [80, 22], [95, -20], [-75, 30], [35, 40], [-20, -12]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(dx, dy, 9, 0, Math.PI * 2);
    ctx.fill();
  });
  // Excipient filler dots.
  ctx.fillStyle = C.faint;
  [[-115, 8], [60, 48], [-45, 52], [110, 6], [0, 58], [-130, -40], [55, -52], [130, 40]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(dx, dy, 6.5, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // API annotation (left).
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.font = '700 20px Arial, Helvetica, sans-serif';
  ctx.fillStyle = C.accent;
  ctx.fillText('API — the drug itself', cx - rx - 30, cy - 60);
  ctx.font = '400 17px Arial, Helvetica, sans-serif';
  ctx.fillStyle = C.sub;
  ctx.fillText('the part that produces the therapeutic effect', cx - rx - 30, cy - 28);
  ctx.fillText('each dark particle is one dose of the active ingredient', cx - rx - 30, cy - 4);

  // Excipient annotation (right).
  ctx.textAlign = 'left';
  ctx.font = '700 20px Arial, Helvetica, sans-serif';
  ctx.fillStyle = C.ink;
  ctx.fillText('Excipients — inactive but essential', cx + rx + 30, cy - 60);
  ctx.font = '400 17px Arial, Helvetica, sans-serif';
  ctx.fillStyle = C.sub;
  ctx.fillText('binders hold the tablet together; fillers give it bulk;', cx + rx + 30, cy - 28);
  ctx.fillText('coatings protect and mask taste; flavours and preservatives finish it', cx + rx + 30, cy - 4);

  // Bottom takeaway.
  panelBox(ctx, 70, 780, W - 140, 90, C.panel, C.panelBorder, 16);
  textCentered(ctx, 'Medicine = API + excipients', W / 2, 812, W - 200, 22, '700', C.ink);
  paragraph(ctx, 'All the active ingredients in medicines are drugs — but a medicine is the complete formulated product, engineered so the right dose of the drug reaches the right place, reliably.', W / 2, 848, W - 300, 24, 16, '400', C.sub, 'center');

  save('as6-medicine-structure.png', canvas);
}

module.exports = { render };