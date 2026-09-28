// AS 5 diagram 9 — semiconductors: silicon, doping, devices.
const { C, makeCanvas, title, save, panelBox, textCentered, paragraph, chip, lead, arrow } = require('./common.cjs');

function siliconLattice(ctx, x0, y0, cols, rows) {
  const sp = 64;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * sp, y = y0 + r * sp;
      ctx.strokeStyle = C.faint;
      ctx.lineWidth = 2;
      if (c < cols - 1) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + sp, y); ctx.stroke(); }
      if (r < rows - 1) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x, y + sp); ctx.stroke(); }
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = x0 + c * sp, y = y0 + r * sp;
      ctx.beginPath();
      ctx.arc(x, y, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#94a3b8';
      ctx.fill();
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      textCentered(ctx, 'Si', x, y + 1, 30, 10, '700', '#ffffff');
    }
  }
}

function render() {
  const W = 1500, H = 1000;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Semiconductors: conductivity to order', 'Neither a good conductor nor an insulator — engineerable');

  // conductivity spectrum bar
  const bx = 180, bw = 1140, by = 150, bh = 44;
  ctx.fillStyle = '#b45309';
  ctx.fillRect(bx, by, bw / 3, bh);
  ctx.fillStyle = '#64748b';
  ctx.fillRect(bx + bw / 3, by, bw / 3, bh);
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(bx + 2 * (bw / 3), by, bw / 3, bh);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.strokeRect(bx, by, bw, bh);
  textCentered(ctx, 'conductors (copper)', bx + bw / 6, by + bh / 2 + 1, bw / 3 - 30, 17, '700', '#ffffff');
  textCentered(ctx, 'semiconductors (silicon)', bx + bw / 2, by + bh / 2 + 1, bw / 3 - 30, 17, '700', '#ffffff');
  textCentered(ctx, 'insulators (rubber, glass)', bx + 5 * bw / 6, by + bh / 2 + 1, bw / 3 - 30, 17, '700', '#ffffff');

  // two panels
  const pw = 640, ph = 470, py = 240;
  const x1 = 60, x2 = 800;

  // LEFT — pure silicon
  panelBox(ctx, x1, py, pw, ph, '#ffffff', C.panelBorder, 16);
  textCentered(ctx, 'Pure silicon: almost nothing moves', x1 + pw / 2, py + 30, pw - 40, 20, '700', C.accent2);
  siliconLattice(ctx, x1 + 110, py + 70, 7, 3);
  paragraph(ctx, 'Every silicon atom shares an electron pair with each of four neighbours, so almost all electrons are locked in bonds. A few are shaken loose by heat, but nowhere near enough for good conduction — pure silicon is a feeble conductor.', x1 + 34, py + 330, pw - 68, 24, 16, '400', C.ink, 'left');
  chip(ctx, 'conductivity: very low', x1 + pw / 2, py + 428, pw - 120, C.accent2Soft, C.accent2, 16);

  // RIGHT — doped silicon
  panelBox(ctx, x2, py, pw, ph, '#ffffff', C.panelBorder, 16);
  textCentered(ctx, 'Doped silicon: carriers delivered', x2 + pw / 2, py + 30, pw - 40, 20, '700', C.pink);
  siliconLattice(ctx, x2 + 110, py + 70, 7, 3);
  // phosphorus donor with free electron
  const px1 = x2 + 110 + 2 * 64, py1 = py + 70 + 1 * 64;
  ctx.beginPath();
  ctx.arc(px1, py1, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#f97316';
  ctx.fill();
  textCentered(ctx, 'P', px1, py1 + 1, 30, 11, '700', '#ffffff');
  arrow(ctx, px1 + 10, py1 - 14, px1 + 58, py1 - 40, 2, C.warn);
  ctx.beginPath();
  ctx.arc(px1 + 64, py1 - 44, 5, 0, Math.PI * 2);
  ctx.fillStyle = C.warn;
  ctx.fill();
  textCentered(ctx, 'spare electron set free (n-type)', px1 + 4, py1 - 68, 260, 14, '600', C.warn);
  // boron acceptor with hole
  const px2 = x2 + 110 + 5 * 64, py2 = py + 70 + 2 * 64;
  ctx.beginPath();
  ctx.arc(px2, py2, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#a855f7';
  ctx.fill();
  textCentered(ctx, 'B', px2, py2 + 1, 30, 11, '700', '#ffffff');
  ctx.beginPath();
  ctx.arc(px2 + 46, py2 - 18, 6, 0, Math.PI * 2);
  ctx.strokeStyle = '#a855f7';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  textCentered(ctx, 'missing electron = mobile hole (p-type)', px2 - 10, py2 - 44, 280, 14, '600', '#7e22ce');
  paragraph(ctx, 'Add one foreign atom in about a million and everything changes. Phosphorus brings a fifth electron that is free to roam (n-type); boron brings only three, leaving a hole that behaves like a positive carrier (p-type). Doping sets the conductivity to order.', x2 + 34, py + 330, pw - 68, 24, 16, '400', C.ink, 'left');
  chip(ctx, 'conductivity: engineered', x2 + pw / 2, py + 428, pw - 120, C.pinkSoft, C.pink, 16);

  // bottom band — devices
  panelBox(ctx, 60, 750, W - 120, 190, C.panel, C.panelBorder, 16);
  textCentered(ctx, 'The devices doped silicon becomes', W / 2, 786, W - 200, 20, '700', C.accent);
  const devs = [
    ['Diode', 'Current passes one way and is blocked the other — the electronic one-way valve.'],
    ['LED', 'A junction that emits light as carriers cross — the emitters inside pulse oximeters.'],
    ['Thermistor', 'Resistance changes smoothly with temperature — the sensor in incubators and patient monitors.'],
    ['Solar cell', 'Light knocks carriers loose and drives a current — turning radiation into electricity.'],
  ];
  const dw = 330, dx0 = (W - (dw * 4 + 20 * 3)) / 2;
  devs.forEach(([t, d], i) => {
    const dx = dx0 + i * (dw + 20);
    panelBox(ctx, dx, 812, dw, 100, '#ffffff', C.panelBorder, 12);
    textCentered(ctx, t, dx + dw / 2, 838, dw - 20, 17, '700', C.ink);
    paragraph(ctx, d, dx + dw / 2, 872, dw - 28, 19, 14, '400', C.sub, 'center');
  });
  save('as5-semiconductors.png', canvas);
}

module.exports = { render };