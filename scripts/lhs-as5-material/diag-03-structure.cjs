// AS 5 diagram 3 — microscopic structure explains macroscopic behaviour.
const { C, makeCanvas, title, save, panelBox, textCentered, paragraph, arrow } = require('./common.cjs');

function drawMetallic(ctx, px, py) {
  const r = 13, sp = 48, x0 = px + 80, y0 = py + 72;
  for (let row = 0; row < 2; row++) {
    for (let i = 0; i < 8; i++) {
      ctx.beginPath();
      ctx.arc(x0 + i * sp + (row % 2) * (sp / 2), y0 + row * 66, r, 0, Math.PI * 2);
      ctx.fillStyle = '#9ca3af';
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }
  ctx.fillStyle = C.amber;
  [[26, -8], [74, 8], [130, -10], [185, 9], [240, -7], [296, 8], [350, -9]].forEach(([dx, dy]) => {
    ctx.beginPath();
    ctx.arc(x0 + dx, y0 + 33 + dy, 3.2, 0, Math.PI * 2);
    ctx.fill();
  });
  arrow(ctx, x0 + 430, y0 - 6, x0 + 470, y0 - 6, 3, C.warn);
  textCentered(ctx, 'layers slide', x0 + 400, y0 - 26, 160, 15, '600', C.warn);
}

function drawIonic(ctx, px, py) {
  const r = 12, sp = 52, x0 = px + 110, y0 = py + 62;
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 6; i++) {
      const pos = (row + i) % 2 === 0;
      ctx.beginPath();
      ctx.arc(x0 + i * sp, y0 + row * 44, r, 0, Math.PI * 2);
      ctx.fillStyle = pos ? '#60a5fa' : '#f87171';
      ctx.fill();
      ctx.strokeStyle = '#3b5b7d';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.font = '700 13px Arial, Helvetica, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(pos ? '+' : '−', x0 + i * sp, y0 + row * 44 + 1);
    }
  }
  textCentered(ctx, 'slide the layers one place and like charges face each other', x0 + 130, y0 + 152, 460, 15, '400', C.warn);
}

function drawNetwork(ctx, px, py) {
  const cx = px + 300, cy = py + 115, R = 72;
  const pts = [];
  for (let k = 0; k < 5; k++) {
    const a = -Math.PI / 2 + k * (2 * Math.PI / 5);
    pts.push([cx + R * Math.cos(a), cy + R * Math.sin(a)]);
  }
  pts.push([cx, cy]);
  ctx.strokeStyle = C.sub;
  ctx.lineWidth = 2.5;
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      if (i === 5 || j === 5) {
        ctx.beginPath();
        ctx.moveTo(pts[i][0], pts[i][1]);
        ctx.lineTo(pts[j][0], pts[j][1]);
        ctx.stroke();
      }
    }
  }
  ctx.beginPath();
  for (let k = 0; k <= 5; k++) {
    const p = pts[k % 5];
    if (k === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
  }
  ctx.stroke();
  pts.forEach(([x, y]) => {
    ctx.beginPath();
    ctx.arc(x, y, 11, 0, Math.PI * 2);
    ctx.fillStyle = C.accent2;
    ctx.fill();
    ctx.strokeStyle = '#0c4a6e';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  });
  textCentered(ctx, 'each line is a shared pair of electrons', cx, py + 205, 400, 15, '400', C.sub);
}

function drawPolymer(ctx, px, py) {
  const x0 = px + 60, x1 = px + 600;
  ctx.lineWidth = 5;
  const rows = [
    { y: py + 60, col: C.pink },
    { y: py + 105, col: '#7c3aed' },
    { y: py + 150, col: '#0d9488' },
  ];
  rows.forEach(({ y, col }, idx) => {
    ctx.strokeStyle = col;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    for (let x = x0; x < x1; x += 48) {
      ctx.quadraticCurveTo(x + 24, y + (idx % 2 === 0 ? -26 : 26), x + 48, y);
    }
    ctx.stroke();
  });
  ctx.font = '400 15px Arial, Helvetica, sans-serif';
  ctx.fillStyle = C.sub;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('one line = one enormous tangled molecule', x0 + 6, py + 190);
}

function render() {
  const W = 1500, H = 1020;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Structure explains behaviour', 'What the atoms are doing decides what the material can do');

  const pw = 690, ph = 340, gap = 40;
  const x0 = (W - (pw * 2 + gap)) / 2;
  const panels = [
    { t: 'Metallic bonding — malleable, conductive', d: drawMetallic,
      cap: 'Positive metal ions held in a sea of delocalised electrons. The ions are not bonded to any fixed partner, so the layers can slide past each other: metals are malleable and ductile. The free electrons carry current and heat.' },
    { t: 'Ionic lattice — strong but brittle', d: drawIonic,
      cap: 'A rigid lattice of alternating positive and negative ions. The electrostatic attraction is strong, but slide the layers by just one ion and like charges line up — the repulsion cracks the crystal apart. Very high melting points.' },
    { t: 'Covalent network — diamond hard', d: drawNetwork,
      cap: 'Every atom is covalently bonded to its neighbours in a rigid three-dimensional grid (diamond, silica). Enormous energy is needed to break the network: extremely hard, very high melting point, and no free charges to conduct.' },
    { t: 'Polymer chains — tangled flexibility', d: drawPolymer,
      cap: 'Enormous covalent molecules tangled like spaghetti. Flexibility comes from the tangle sliding, not from breaking bonds; warming lets the chains slide more easily — polymers melt at low temperatures and can be moulded.' },
  ];
  panels.forEach((p, i) => {
    const px = x0 + (i % 2) * (pw + gap);
    const py = 140 + Math.floor(i / 2) * (ph + 40);
    panelBox(ctx, px, py, pw, ph, '#ffffff', C.panelBorder, 16);
    textCentered(ctx, p.t, px + pw / 2, py + 32, pw - 40, 19, '700');
    p.d(ctx, px, py);
    paragraph(ctx, p.cap, px + 34, py + 268, pw - 68, 22, 15, '400', C.ink, 'left');
  });

  panelBox(ctx, 60, 880, W - 120, 100, C.panel, C.panelBorder, 16);
  textCentered(ctx, 'The golden chain of this unit', W / 2, 914, W - 200, 20, '700', C.accent);
  textCentered(ctx, 'Structure at the atomic scale → bonding and arrangement → the properties you can test at the bench → the jobs the material is given.', W / 2, 948, W - 200, 17, '400', C.sub);
  save('as5-structure.png', canvas);
}

module.exports = { render };