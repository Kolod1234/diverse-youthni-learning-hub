// AS 5 diagram 4 — why alloys beat pure metals.
const { C, makeCanvas, title, save, panelBox, textCentered, paragraph, arrow } = require('./common.cjs');

function drawLattice(ctx, x0, y0, foreign) {
  const r = 15, sp = 62;
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 7; i++) {
      const cx = x0 + i * sp + (row % 2) * (sp / 2);
      const cy = y0 + row * 58;
      const f = foreign.find(([rr, ii]) => rr === row && ii === i);
      ctx.beginPath();
      ctx.arc(cx, cy, f ? (f[2] === 'big' ? 19 : 10) : r, 0, Math.PI * 2);
      if (f) {
        ctx.fillStyle = f[2] === 'big' ? C.warn : C.accent2;
        ctx.fill();
        ctx.strokeStyle = f[2] === 'big' ? '#7f1d1d' : '#075985';
      } else {
        ctx.fillStyle = '#9ca3af';
        ctx.fill();
        ctx.strokeStyle = '#64748b';
      }
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
}

function render() {
  const W = 1500, H = 960;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Why alloys beat pure metals', 'The same metal, deliberately contaminated — and far stronger');

  const pw = 640, ph = 480, py = 150;
  const x1 = 60, x2 = 800;

  // LEFT — pure metal
  panelBox(ctx, x1, py, pw, ph, '#ffffff', C.panelBorder, 16);
  textCentered(ctx, 'Pure metal: neat layers, free to slide', x1 + pw / 2, py + 34, pw - 40, 20, '700');
  drawLattice(ctx, x1 + 90, py + 92, []);
  arrow(ctx, x1 + 110, py + 66, x1 + 250, py + 66, 3, C.warn);
  textCentered(ctx, 'a pushing force slides the rows of identical atoms over one another — the metal bends', x1 + pw / 2, py + 310, pw - 60, 16, '400', C.warn);
  paragraph(ctx, 'In a pure metal every atom is the same size, so the rows lie perfectly and slide easily at the slightest push: pure gold is so soft that a wedding ring bends in daily wear.', x1 + 40, py + 360, pw - 80, 24, 16, '400', C.ink, 'left');

  // RIGHT — alloy
  panelBox(ctx, x2, py, pw, ph, '#ffffff', C.panelBorder, 16);
  textCentered(ctx, 'Alloy: strangers pinned into the rows', x2 + pw / 2, py + 34, pw - 40, 20, '700');
  drawLattice(ctx, x2 + 90, py + 92, [[0, 2, 'big'], [1, 5, 'small'], [2, 1, 'big'], [1, 2, 'small'], [0, 5, 'small'], [2, 4, 'big']]);
  // blocked-slip cross marks
  ctx.strokeStyle = C.warn;
  ctx.lineWidth = 4;
  [[x2 + 330, py + 150], [x2 + 455, py + 208]].forEach(([mx, my]) => {
    ctx.beginPath();
    ctx.moveTo(mx - 10, my - 10);
    ctx.lineTo(mx + 10, my + 10);
    ctx.moveTo(mx + 10, my - 10);
    ctx.lineTo(mx - 10, my + 10);
    ctx.stroke();
  });
  textCentered(ctx, 'the odd-sized atoms jam the rows — sliding needs far more force', x2 + pw / 2, py + 310, pw - 60, 16, '400', C.warn);
  paragraph(ctx, 'An alloy is a metal deliberately mixed with other elements. The wrong-sized atoms sit inside the rows and pin the layers in place: harder, stronger — but less malleable than the pure metal.', x2 + 40, py + 360, pw - 80, 24, 16, '400', C.ink, 'left');

  // bottom band
  panelBox(ctx, 60, 690, W - 120, 210, C.panel, C.panelBorder, 16);
  textCentered(ctx, 'Alloys you are expected to name', W / 2, 726, W - 200, 20, '700', C.accent);
  const exs = [
    ['steel', 'iron + carbon — hard, strong, cheap'],
    ['stainless steel', 'steel + chromium + nickel — the chromium oxide layer blocks rust'],
    ['brass', 'copper + zinc — easily worked, resists corrosion'],
    ['nitinol', 'nickel + titanium — the shape memory alloy (page 8)'],
  ];
  const bw = 330, bx0 = (W - (bw * 4 + 20 * 3)) / 2;
  exs.forEach(([n, d], i) => {
    const bx = bx0 + i * (bw + 20);
    panelBox(ctx, bx, 752, bw, 84, '#ffffff', C.panelBorder, 12);
    textCentered(ctx, n, bx + bw / 2, 778, bw - 20, 17, '700', C.ink);
    paragraph(ctx, d, bx + bw / 2, 810, bw - 24, 20, 14, '400', C.sub, 'center');
  });
  textCentered(ctx, 'Metal working: cast into shape (molten metal poured into a mould), forged (hammered or pressed while hot), or rolled and drawn. Cold working hardens the metal further; annealing — gentle reheating — lets the crystals regrow and softens it back.', W / 2, 868, W - 160, 22, 15, '400', C.sub);
  save('as5-alloys.png', canvas);
}

module.exports = { render };