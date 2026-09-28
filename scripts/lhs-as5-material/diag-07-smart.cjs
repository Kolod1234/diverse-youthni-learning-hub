// AS 5 diagram 7 — smart materials: nitinol, hydrogels, colour changers.
const { C, makeCanvas, title, save, panelBox, textCentered, paragraph, arrow, chip } = require('./common.cjs');

function stentZigzag(ctx, x, y, w, amp, colour) {
  ctx.strokeStyle = colour;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(x, y);
  const n = 8;
  for (let i = 0; i < n; i++) {
    const dx = (w / n) * (i + 0.5);
    ctx.lineTo(x + dx, y + (i % 2 === 0 ? -amp : amp));
  }
  ctx.lineTo(x + w, y);
  ctx.stroke();
}

function render() {
  const W = 1500, H = 1000;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Smart materials react to their world', 'A property that changes with a stimulus — and changes back when it is removed');

  const pw = 440, ph = 500, py = 150;
  const x0 = 50, gap = 40;

  // Panel 1 — shape memory alloy
  const x1 = x0;
  panelBox(ctx, x1, py, pw, ph, '#ffffff', C.panelBorder, 16);
  textCentered(ctx, 'Shape memory alloy — nitinol', x1 + pw / 2, py + 30, pw - 30, 18, '700', C.accent);
  // artery
  ctx.strokeStyle = C.warn;
  ctx.lineWidth = 3;
  ctx.strokeRect(x1 + 70, py + 70, pw - 140, 96);
  textCentered(ctx, 'narrowed artery', x1 + pw / 2, py + 118, pw - 140, 14, '400', C.warn);
  stentZigzag(ctx, x1 + 120, py + 118, 200, 9, '#94a3b8');
  chip(ctx, 'crimped stent, cold and small', x1 + pw / 2, py + 196, pw - 60, C.accentSoft, C.accent, 14);
  arrow(ctx, x1 + pw / 2, py + 216, x1 + pw / 2, py + 258, 3, C.sub);
  textCentered(ctx, 'body warmth reaches the trigger temperature', x1 + pw / 2, py + 236, pw - 50, 14, '600', C.sub);
  ctx.strokeStyle = C.ok;
  ctx.lineWidth = 3;
  ctx.strokeRect(x1 + 46, py + 268, pw - 92, 106);
  textCentered(ctx, 'artery held open', x1 + pw / 2, py + 356, pw - 92, 14, '400', C.ok);
  stentZigzag(ctx, x1 + 84, py + 322, pw - 168, 22, '#475569');
  chip(ctx, 'the alloy remembers its preset shape', x1 + pw / 2, py + 406, pw - 50, C.okSoft, C.ok, 14);
  paragraph(ctx, 'Bend nitinol when it is cool and it stays bent. Warm it to its trigger temperature and it snaps back to a shape it was trained to remember — a stent springs open inside the artery at body temperature. Cool it again and it can be re-bent: the change is reversible.', x1 + 26, py + 434, pw - 52, 20, 13.5, '400', C.ink, 'left');

  // Panel 2 — hydrogel
  const x2 = x0 + pw + gap;
  panelBox(ctx, x2, py, pw, ph, '#ffffff', C.panelBorder, 16);
  textCentered(ctx, 'Hydrogel — the water-drinking polymer', x2 + pw / 2, py + 30, pw - 30, 18, '700', C.accent2);
  // crosslinked network
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2;
  const nx = x2 + 90, ny = py + 90, sp = 62;
  const nodes = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) nodes.push([nx + c * sp, ny + r * sp]);
  nodes.forEach(([a, b], i) => {
    if (i % 4 !== 3) {
      ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(a + sp, b); ctx.stroke();
    }
    if (i < 8) {
      ctx.beginPath(); ctx.moveTo(a, b); ctx.lineTo(a, b + sp); ctx.stroke();
    }
    ctx.beginPath(); ctx.arc(a, b, 6.5, 0, Math.PI * 2); ctx.fillStyle = '#0ea5e9'; ctx.fill();
  });
  // water molecules entering
  ctx.fillStyle = '#93c5fd';
  [[40, 40], [70, 12], [230, 30], [255, 55], [205, 12]].forEach(([dx, dy]) => {
    ctx.beginPath(); ctx.arc(nx + dx + 130, ny + dy, 5, 0, Math.PI * 2); ctx.fill();
  });
  arrow(ctx, x2 + 66, ny - 22, x2 + 118, ny - 6, 2.5, '#38bdf8');
  textCentered(ctx, 'water molecules swelling the network', x2 + pw / 2, ny + 208, pw - 50, 14, '600', '#0369a1');
  paragraph(ctx, 'A hydrogel is a loose polymer network that drinks water and swells, staying soft and squishy — kind to living tissue. Contact lenses sit comfortably on the eye all day; drug-loaded hydrogel patches release their medicine slowly as water soaks through. Squeeze the water out and the gel shrinks: reversible again.', x2 + 26, py + 434, pw - 52, 20, 13.5, '400', C.ink, 'left');

  // Panel 3 — colour changers + piezo
  const x3 = x0 + (pw + gap) * 2;
  panelBox(ctx, x3, py, pw, ph, '#ffffff', C.panelBorder, 16);
  textCentered(ctx, 'Colour changers and pressure sensors', x3 + pw / 2, py + 30, pw - 30, 18, '700', C.pink);
  // thermochromic strip
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.arc(x3 + 96 + i * 52, py + 104, 22, 0, Math.PI * 2);
    ctx.stroke();
  }
  ['#e2e8f0', '#a5b4fc', '#818cf8', '#6366f1', '#4f46e5', '#4338ca'].forEach((col, i) => {
    ctx.beginPath();
    ctx.arc(x3 + 96 + i * 52, py + 104, 15, 0, Math.PI * 2);
    ctx.fillStyle = col;
    ctx.fill();
  });
  textCentered(ctx, 'thermochromic forehead thermometer', x3 + pw / 2, py + 150, pw - 40, 13.5, '400', C.sub);
  // photochromic glasses
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(x3 + 150, py + 236, 42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x3 + 262, py + 236, 42, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x3 + 190, py + 226);
  ctx.lineTo(x3 + 222, py + 226);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x3 + 150, py + 236, 28, 0, Math.PI * 2);
  ctx.arc(x3 + 262, py + 236, 28, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(67,56,202,0.55)';
  ctx.fill();
  textCentered(ctx, 'photochromic lenses darken in sunlight and clear indoors', x3 + pw / 2, py + 306, pw - 40, 13.5, '400', C.sub);
  // piezo
  ctx.fillStyle = '#a78bfa';
  ctx.fillRect(x3 + 120, py + 336, 172, 34);
  arrow(ctx, x3 + 130, py + 326, x3 + 130, py + 352, 2.5, C.sub);
  arrow(ctx, x3 + 150, py + 352, x3 + 150, py + 326, 2.5, C.sub);
  textCentered(ctx, 'squeeze → tiny voltage', x3 + pw / 2, py + 394, pw - 40, 13.5, '600', '#5b21b6');
  paragraph(ctx, 'Piezoelectric crystals push out a flicker of voltage when squeezed — and vibrate when a voltage is applied. That one property, both ways, is the transducer at the heart of every ultrasound scanner.', x3 + 26, py + 434, pw - 52, 20, 13.5, '400', C.ink, 'left');

  // bottom band
  panelBox(ctx, 60, 730, W - 120, 130, C.panel, C.panelBorder, 16);
  textCentered(ctx, 'The definition to quote in the exam', W / 2, 766, W - 200, 20, '700', C.accent);
  textCentered(ctx, 'A smart material changes one of its properties in response to a stimulus — temperature, light, pressure, moisture or an electric field — and the change reverses when the stimulus is removed.', W / 2, 806, W - 240, 17, '400', C.sub);
  save('as5-smart.png', canvas);
}

module.exports = { render };