// AS 5 diagram 6 — bioinert vs bioactive, osseointegration, corrosion.
const { C, makeCanvas, title, save, panelBox, textCentered, paragraph } = require('./common.cjs');

function boneField(ctx, xFrom, xTo, yTop, yBot) {
  // scattered bone cells (osteocytes in little lacunae) in a bone-coloured field
  ctx.fillStyle = '#f5f0e8';
  ctx.fillRect(xFrom, yTop, xTo - xFrom, yBot - yTop);
  ctx.strokeStyle = '#d6c9b8';
  ctx.lineWidth = 1.5;
  for (let x = xFrom + 26; x < xTo - 20; x += 58) {
    for (let y = yTop + 30; y < yBot - 20; y += 52) {
      ctx.beginPath();
      ctx.ellipse(x + ((y / 52) % 2) * 26, y, 16, 11, 0.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x + ((y / 52) % 2) * 26, y, 3.2, 0, Math.PI * 2);
      ctx.fillStyle = '#b0987f';
      ctx.fill();
    }
  }
}

function render() {
  const W = 1500, H = 920;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Bioinert or bioactive: how the body greets an implant', 'Tolerated from a distance, or bonded cell to cell');

  const pw = 640, ph = 460, py = 150;
  const x1 = 60, x2 = 800;

  // LEFT — bioinert
  panelBox(ctx, x1, py, pw, ph, '#ffffff', C.panelBorder, 16);
  textCentered(ctx, 'Bioinert — tolerated, not bonded', x1 + pw / 2, py + 32, pw - 40, 20, '700', C.accent2);
  // implant bar
  ctx.fillStyle = '#64748b';
  ctx.fillRect(x1 + 56, py + 76, 34, 250);
  // fibrous tissue band — wavy
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(x1 + 96, py + 80);
  for (let y = py + 80; y < py + 326; y += 22) {
    ctx.quadraticCurveTo(x1 + 116, y + 11, x1 + 96, y + 22);
  }
  ctx.stroke();
  // bone
  boneField(ctx, x1 + 118, x1 + pw - 40, py + 70, py + 336);
  textCentered(ctx, 'thin fibrous capsule', x1 + 200, py + 356, 220, 15, '600', '#b45309');
  paragraph(ctx, 'Alumina and other bioinert materials never react chemically with tissue. The body quietly walls them off behind a thin fibrous layer — the implant is stable and safe, but no chemical bond forms between it and the bone.', x1 + 34, py + 388, pw - 68, 22, 15, '400', C.ink, 'left');

  // RIGHT — bioactive
  panelBox(ctx, x2, py, pw, ph, '#ffffff', C.panelBorder, 16);
  textCentered(ctx, 'Bioactive — bone bonds directly on', x2 + pw / 2, py + 32, pw - 40, 20, '700', C.ok);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(x2 + 56, py + 76, 34, 250);
  // hydroxyapatite coating
  ctx.fillStyle = '#86efac';
  ctx.fillRect(x2 + 90, py + 76, 12, 250);
  // bone, touching the coating
  boneField(ctx, x2 + 102, x2 + pw - 40, py + 70, py + 336);
  // cells growing ONTO the coating
  for (let y = py + 96; y < py + 320; y += 44) {
    ctx.beginPath();
    ctx.ellipse(x2 + 112, y, 10, 14, 0, 0, Math.PI * 2);
    ctx.strokeStyle = '#4d7c0f';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    // bond marks
    ctx.strokeStyle = '#4d7c0f';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x2 + 102, y - 4);
    ctx.lineTo(x2 + 90, y - 6);
    ctx.moveTo(x2 + 102, y + 4);
    ctx.lineTo(x2 + 90, y + 6);
    ctx.stroke();
  }
  textCentered(ctx, 'living bone grows straight onto the coating and chemically bonds', x2 + 350, py + 356, 480, 15, '600', '#4d7c0f');
  paragraph(ctx, 'Hydroxyapatite and bio-glass actively interact with living bone. Bone cells creep across the surface and form a direct chemical bond — the implant becomes anchored in the skeleton itself rather than merely sitting in it.', x2 + 34, py + 388, pw - 68, 22, 15, '400', C.ink, 'left');

  // bottom band
  panelBox(ctx, 60, 660, W - 120, 210, C.panel, C.panelBorder, 16);
  textCentered(ctx, 'Osseointegration — the direct structural and functional connection between living bone and the surface of a load-bearing implant.', W / 2, 696, W - 200, 18, '700', C.ok);
  paragraph(ctx, 'Why corrosion matters: the body is a warm, salty, oxygen-rich bath — a corrosive cocktail for metals. A corroding implant sheds toxic ions into tissue and bloodstream. Titanium survives decades inside the body because a thin natural oxide layer forms on its surface and seals the metal underneath; coating it with hydroxyapatite then gives the bone something chemically familiar to bond to.', W / 2, 742, W - 240, 24, 16, '400', C.sub, 'center');
  save('as5-osseointegration.png', canvas);
}

module.exports = { render };