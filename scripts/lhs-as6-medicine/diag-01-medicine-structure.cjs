// AS 6 diagram 1 — drug vs medicine, and the parts of a formulated medicine.
const { C, makeCanvas, title, save, panelBox, textCentered, paragraph, lead, textLeft } = require('./common.cjs');

function render() {
  const W = 1500, H = 900;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Drug or medicine?', 'One is a single substance; the other is a formulated product built around it');

  // Two definition panels.
  panelBox(ctx, 70, 140, 640, 190, C.accentSoft, C.accent, 16);
  textCentered(ctx, 'DRUG', 390, 190, 200, 28, '700', C.accent);
  paragraph(ctx, 'A single chemical substance that, when introduced into the body, alters physiological or biochemical processes.', 390, 250, 560, 26, 19, '400', C.ink, 'center');
  textCentered(ctx, 'Example: paracetamol — one pure molecule with one identity', 390, 308, 560, 17, '400', C.sub);

  panelBox(ctx, 790, 140, 640, 190, C.okSoft, C.ok, 16);
  textCentered(ctx, 'MEDICINE', 1110, 190, 240, 28, '700', C.ok);
  paragraph(ctx, 'A finished, formulated product containing one or more drugs plus excipients, administered to prevent, diagnose or treat disease.', 1110, 250, 560, 26, 19, '400', C.ink, 'center');
  textCentered(ctx, 'Example: a paracetamol tablet — drug + everything built around it', 1110, 308, 560, 17, '400', C.sub);

  // The tablet anatomy.
  textCentered(ctx, 'Anatomy of a tablet', W / 2, 400, 600, 24, '700', C.ink);
  const cx = W / 2, cy = 590, rx = 150, ry = 78;
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

  const items = [
    { label: 'Active pharmaceutical ingredient (API)', desc: 'The drug itself — the part that produces the therapeutic effect.', x: 210, side: 'left' },
    { label: 'Excipients', desc: 'Binder — holds the tablet together; filler — gives bulk; coating — protects and masks taste; flavouring and preservatives.', x: 210, side: 'right' },
  ];
  items.forEach((it) => {
    const px = it.side === 'left' ? cx - rx - 30 : cx + rx + 30;
    lead(ctx, px, cy + (it.side === 'left' ? -20 : 20), it.side === 'left' ? 470 : 1030, cy - 40, C.sub);
    ctx.textAlign = it.side === 'left' ? 'right' : 'left';
  });
  // API annotation (left).
  textLeft(ctx, '', 0, 0, 10, 16);
  ctx.textAlign = 'right';
  textRight(ctx, 'API — the drug itself', 480, cy - 60, C.accent);
  textRight(ctx, 'produces the therapeutic effect', 480, cy - 32, C.sub);
  // Excipient annotation (right).
  textLeft(ctx, 'Excipients — inactive but essential', 1020, cy - 60, C.ink);
  textLeft(ctx, 'bind, bulk, coat, flavour, preserve, deliver', 1020, cy - 32, C.sub);

  // Bottom takeaway.
  panelBox(ctx, 70, 760, W - 140, 100, C.panel, C.panelBorder, 16);
  textCentered(ctx, 'Medicine = API + excipients', W / 2, 795, W - 200, 22, '700', C.ink);
  paragraph(ctx, 'All the active ingredients in medicines are drugs — but a medicine is the complete formulated product, engineered so the right dose of the drug reaches the right place.', W / 2, 830, W - 300, 24, 17, '400', C.sub, 'center');

  save('as6-medicine-structure.png', canvas);
}

function textRight(ctx, text, x, y, color) {
  ctx.fillStyle = color || C.ink;
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.font = '700 20px Arial, Helvetica, sans-serif';
  ctx.fillText(text, x, y);
}

module.exports = { render };