// AS 5 diagram 8 — nanomaterials: small size, huge surface.
const { C, makeCanvas, title, save, panelBox, textCentered, paragraph, arrow } = require('./common.cjs');

function cube(ctx, x, y, s, fill, stroke) {
  const d = s * 0.38;
  // front face
  ctx.beginPath();
  ctx.rect(x, y, s, s);
  ctx.fillStyle = fill;
  ctx.fill();
  // top face
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x + d, y - d);
  ctx.lineTo(x + s + d, y - d);
  ctx.lineTo(x + s, y);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  // right face
  ctx.beginPath();
  ctx.moveTo(x + s, y);
  ctx.lineTo(x + s + d, y - d);
  ctx.lineTo(x + s + d, y + s - d);
  ctx.lineTo(x + s, y + s);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.rect(x, y, s, s);
  ctx.moveTo(x, y); ctx.lineTo(x + d, y - d); ctx.lineTo(x + s + d, y - d); ctx.lineTo(x + s, y);
  ctx.moveTo(x + s + d, y - d); ctx.lineTo(x + s + d, y + s - d); ctx.lineTo(x + s, y + s);
  ctx.stroke();
}

function render() {
  const W = 1500, H = 920;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Nanomaterials: small size, enormous surface', 'Shrinking the pieces multiplies the surface the world can touch');

  const pw = 640, ph = 470, py = 150;
  const x1 = 60, x2 = 800;

  // LEFT — the surface-area argument
  panelBox(ctx, x1, py, pw, ph, '#ffffff', C.panelBorder, 16);
  textCentered(ctx, 'Cut it up and the surface doubles', x1 + pw / 2, py + 32, pw - 40, 20, '700', C.accent);
  cube(ctx, x1 + 120, py + 110, 130, '#c7d2fe', '#4f46e5');
  textCentered(ctx, 'one cube: 6 faces', x1 + 185, py + 280, 220, 15, '400', C.sub);
  const s2 = 65;
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 2; c++) {
      cube(ctx, x1 + 330 + c * (s2 + 14), py + 150 + r * (s2 + 14) - 20, s2, '#a5b4fc', '#4338ca');
    }
  }
  textCentered(ctx, 'eight cubes: 48 faces', x1 + 455, py + 280, 220, 15, '400', C.sub);
  arrow(ctx, x1 + 272, py + 170, x1 + 312, py + 170, 3, C.sub);
  paragraph(ctx, 'The same amount of material, twice the surface. Slice it again and again and the exposed surface explodes: at the nanoscale a large fraction of every atom sits on the outside. Chemistry happens at surfaces, so nanomaterials react far more readily than the same substance in bulk.', x1 + 34, py + 318, pw - 68, 24, 16, '400', C.ink, 'left');
  textCentered(ctx, 'A nanometre is one billionth of a metre; nanoparticles measure 1-100 nm across.', x1 + pw / 2, py + 430, pw - 60, 15, '600', C.accent);

  // RIGHT — uses
  panelBox(ctx, x2, py, pw, ph, '#ffffff', C.panelBorder, 16);
  textCentered(ctx, 'What the extra surface buys', x2 + pw / 2, py + 32, pw - 40, 20, '700', C.ok);
  const uses = [
    ['Drug delivery', 'Nanoparticles are small enough to travel where bulk powder cannot, carrying medicine to target tissues and releasing it where it is needed.'],
    ['Antibacterial silver', 'Nano-silver coatings release ions that stop bacteria settling on wound dressings and hospital instruments.'],
    ['Sunscreens', 'Nanoparticles of zinc oxide and titanium dioxide scatter ultraviolet light while rubbing on clear, with no white film.'],
    ['Better catalysts', 'Industrial chemistry runs on surface area: nano-scale catalysts speed up reactions with far less material.'],
  ];
  let uy = py + 78;
  uses.forEach(([t, d]) => {
    textCentered(ctx, t, x2 + 110, uy, 180, 17, '700', C.ok);
    paragraph(ctx, d, x2 + 210, uy, pw - 240, 22, 15, '400', C.ink, 'left');
    uy += 86;
  });

  // bottom band
  panelBox(ctx, 60, 670, W - 120, 200, C.warnSoft, '#fecaca', 16);
  textCentered(ctx, 'The same property cuts both ways', W / 2, 706, W - 200, 20, '700', C.warn);
  paragraph(ctx, 'High surface area raises the benefits and the possible risks together. Nanoparticles can enter cells and cross barriers that bulk material cannot — useful for delivering a drug, but reason for care with anything else. Toxicity testing, safe-handling rules and long-term research continue; the honest exam answer states both the promise and the caution.', W / 2, 748, W - 240, 26, 16, '400', C.ink, 'center');
  save('as5-nano.png', canvas);
}

module.exports = { render };