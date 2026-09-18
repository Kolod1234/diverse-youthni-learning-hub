// Renders the nine Single Award Science lesson 3.4 (Electricity Generation) diagrams as PNGs.
// Style matches the existing sas-physics diagrams (render-sas33-energy.cjs, sas-chem/phys1.cjs).
const K = require('./sas-chem/common.cjs');
const { make, save, text, circle, line, arrow, arrowHead, C } = K;

const AMBER = '#b45309', GREEN = '#15803d', BLUE = '#1d4ed8', RED = '#dc2626';
const DIR = '/app/public/lesson-assets/sas-physics';

function box(x, tx, ty, w, h, o = {}) {
  x.fillStyle = o.fill || '#f8fafc';
  x.fillRect(tx, ty, w, h);
  x.strokeStyle = o.stroke || '#e2e8f0';
  x.lineWidth = o.lw || 2;
  x.strokeRect(tx, ty, w, h);
}

// ---------- small icon helpers ----------
function flame(x, cx, cy, s, col = AMBER) {
  x.beginPath();
  x.moveTo(cx, cy + s);
  x.bezierCurveTo(cx - s * 1.1, cy + s * 0.25, cx - s * 0.55, cy - s * 0.45, cx, cy - s);
  x.bezierCurveTo(cx + s * 0.55, cy - s * 0.45, cx + s * 1.1, cy + s * 0.25, cx, cy + s);
  x.closePath(); x.fillStyle = col; x.fill();
}
function barMagnet(x, cx, cy) {
  x.fillStyle = RED; x.fillRect(cx - 34, cy - 13, 34, 26);
  x.fillStyle = BLUE; x.fillRect(cx, cy - 13, 34, 26);
  x.strokeStyle = C.ink; x.lineWidth = 2.5; x.strokeRect(cx - 34, cy - 13, 68, 26);
  text(x, 'N', cx - 17, cy + 1, { size: 16, bold: true, color: '#fff' });
  text(x, 'S', cx + 17, cy + 1, { size: 16, bold: true, color: '#fff' });
}
function coil(x, cx, cy, n = 6) {
  x.strokeStyle = C.ink; x.lineWidth = 3.5;
  for (let i = 0; i < n; i++) {
    x.beginPath();
    x.ellipse(cx + (i - (n - 1) / 2) * 14, cy, 8, 34, 0, 0, Math.PI * 2);
    x.stroke();
  }
}
function meter(x, cx, cy, deflect = 0) {
  circle(x, cx, cy, 34, { fill: '#fff', stroke: C.ink, lw: 3 });
  for (const t of [-0.7, -0.35, 0, 0.35, 0.7]) {
    const px = cx + 28 * Math.sin(t), py = cy - 28 * Math.cos(t);
    line(x, cx + 21 * Math.sin(t), cy - 21 * Math.cos(t), px, py, { lw: 2, color: C.grey });
  }
  const a = deflect;
  arrow(x, cx, cy, cx + 24 * Math.sin(a), cy - 24 * Math.cos(a), { lw: 3.5, len: 10, color: BLUE });
  circle(x, cx, cy, 3.5, { fill: C.ink, stroke: false });
}
function arcArrow(x, cx, cy, r, a1, a2, o = {}) {
  x.strokeStyle = o.color || C.ink; x.lineWidth = o.lw || 3.5;
  x.beginPath(); x.arc(cx, cy, r, a1, a2); x.stroke();
  const d = a2 + Math.PI / 2;
  const hx = cx + r * Math.cos(a2), hy = cy + r * Math.sin(a2);
  x.beginPath();
  x.moveTo(hx + 16 * Math.cos(d), hy + 16 * Math.sin(d));
  x.lineTo(hx - 16 * Math.cos(d) + 14 * Math.cos(d + Math.PI / 2), hy - 16 * Math.sin(d) + 14 * Math.sin(d + Math.PI / 2));
  x.lineTo(hx - 16 * Math.cos(d) - 14 * Math.cos(d - Math.PI / 2), hy - 16 * Math.sin(d) - 14 * Math.sin(d - Math.PI / 2));
  x.closePath(); x.fillStyle = o.color || C.ink; x.fill();
}
function turbine(x, cx, cy, s = 1) {
  line(x, cx, cy + 60 * s, cx - 8 * s, cy - 20 * s, { lw: 5 });
  line(x, cx, cy + 60 * s, cx + 8 * s, cy - 20 * s, { lw: 5 });
  for (let i = 0; i < 3; i++) {
    const a = i * 2 * Math.PI / 3 - Math.PI / 2;
    line(x, cx, cy - 26 * s, cx + 30 * s * Math.cos(a), cy - 26 * s + 30 * s * Math.sin(a), { lw: 5 });
  }
  circle(x, cx, cy - 26 * s, 7 * s, { fill: C.ink, stroke: false });
}
function nuclearTower(x, cx, cy) {
  x.fillStyle = '#e2e8f0'; x.strokeStyle = C.ink; x.lineWidth = 3;
  x.beginPath(); x.moveTo(cx - 28, cy + 26); x.lineTo(cx - 16, cy - 24); x.lineTo(cx + 16, cy - 24); x.lineTo(cx + 28, cy + 26); x.closePath(); x.fill(); x.stroke();
  x.strokeStyle = C.soft; x.lineWidth = 2.5;
  [cx - 8, cx + 4].forEach(sx => { x.beginPath(); x.moveTo(sx, cy - 30); x.bezierCurveTo(sx - 8, cy - 42, sx + 8, cy - 50, sx, cy - 62); x.stroke(); });
}
function coalHeap(x, cx, cy) {
  x.fillStyle = '#334155'; x.strokeStyle = C.ink; x.lineWidth = 3;
  x.beginPath(); x.moveTo(cx - 40, cy + 20); x.lineTo(cx - 18, cy - 20); x.lineTo(cx + 4, cy - 24); x.lineTo(cx + 26, cy - 12); x.lineTo(cx + 40, cy + 20); x.closePath(); x.fill(); x.stroke();
  circle(x, cx - 8, cy - 2, 5, { fill: '#64748b', stroke: false });
  circle(x, cx + 14, cy + 4, 4, { fill: '#64748b', stroke: false });
}
function kettle(x, cx, cy) {
  x.fillStyle = '#e2e8f0'; x.strokeStyle = C.ink; x.lineWidth = 3;
  x.beginPath();
  x.moveTo(cx - 30, cy + 22); x.lineTo(cx - 24, cy - 16); x.lineTo(cx + 24, cy - 16); x.lineTo(cx + 30, cy + 22);
  x.closePath(); x.fill(); x.stroke();
  x.beginPath(); x.arc(cx + 26, cy - 6, 12, Math.PI * 1.5, Math.PI * 0.5, true); x.stroke();
  line(x, cx - 30, cy + 8, cx - 42, cy + 8, { lw: 3 }); line(x, cx - 42, cy + 8, cx - 42, cy - 2, { lw: 3 });
  x.strokeStyle = C.soft; x.lineWidth = 2.5;
  [cx - 40, cx - 30].forEach(sx => { x.beginPath(); x.moveTo(sx, cy - 26); x.bezierCurveTo(sx - 6, cy - 16, sx + 6, cy - 10, sx, cy - 2); x.stroke(); });
}
function speaker(x, cx, cy) {
  x.fillStyle = C.ink;
  x.fillRect(cx - 30, cy - 11, 16, 22);
  x.beginPath(); x.moveTo(cx - 14, cy - 11); x.lineTo(cx + 4, cy - 24); x.lineTo(cx + 4, cy + 24); x.lineTo(cx - 14, cy + 11); x.closePath(); x.fill();
  x.strokeStyle = C.ink; x.lineWidth = 3;
  [16, 27].forEach(r => { x.beginPath(); x.arc(cx + 6, cy, r, -0.9, 0.9); x.stroke(); });
}
function ledLamp(x, cx, cy) {
  circle(x, cx, cy - 8, 16, { fill: '#fde68a', stroke: AMBER, lw: 3 });
  x.fillStyle = C.ink; x.fillRect(cx - 9, cy + 8, 18, 5); x.fillRect(cx - 13, cy + 13, 26, 4);
  for (const a of [-0.7, 0, 0.7]) line(x, cx + 22 * Math.cos(a), cy - 8 + 22 * Math.sin(a), cx + 30 * Math.cos(a), cy - 8 + 30 * Math.sin(a), { color: AMBER, lw: 3 });
}
function fan(x, cx, cy) {
  for (let i = 0; i < 3; i++) {
    const a = i * 2 * Math.PI / 3 - Math.PI / 2;
    x.beginPath();
    x.ellipse(cx + 17 * Math.cos(a), cy + 17 * Math.sin(a), 15, 8, a, 0, Math.PI * 2);
    x.fillStyle = '#bfdbfe'; x.fill(); x.strokeStyle = C.ink; x.lineWidth = 2.5; x.stroke();
  }
  circle(x, cx, cy, 8, { fill: C.ink, stroke: false });
  line(x, cx, cy + 8, cx, cy + 40, { lw: 4 });
  line(x, cx - 16, cy + 40, cx + 16, cy + 40, { lw: 4 });
}
function genCircle(x, cx, cy) {
  x.fillStyle = '#dbeafe'; x.strokeStyle = BLUE; x.lineWidth = 3;
  x.fillRect(cx - 56, cy - 22, 22, 44); x.strokeRect(cx - 56, cy - 22, 22, 44);
  x.fillStyle = '#fee2e2'; x.strokeStyle = RED;
  x.fillRect(cx + 34, cy - 22, 22, 44); x.strokeRect(cx + 34, cy - 22, 22, 44);
  circle(x, cx, cy, 38, { fill: '#fff', stroke: C.ink, lw: 4 });
  text(x, 'G', cx, cy + 2, { size: 28, bold: true });
  text(x, 'N', cx - 45, cy + 1, { size: 15, bold: true, color: BLUE });
  text(x, 'S', cx + 45, cy + 1, { size: 15, bold: true, color: RED });
}
function transformerSymbol(x, cx, cy) {
  circle(x, cx - 26, cy, 26, { fill: '#fff', stroke: BLUE, lw: 3.5 });
  circle(x, cx + 26, cy, 26, { fill: '#fff', stroke: BLUE, lw: 3.5 });
  line(x, cx - 6, cy - 20, cx - 6, cy + 20, { lw: 3, color: C.grey });
  line(x, cx + 6, cy - 20, cx + 6, cy + 20, { lw: 3, color: C.grey });
}
function pylon(x, cx, base, top) {
  line(x, cx - 30, base, cx - 6, top, { lw: 3.5 });
  line(x, cx + 30, base, cx + 6, top, { lw: 3.5 });
  line(x, cx - 20, base - 45, cx + 20, base - 45, { lw: 3 });
  line(x, cx - 13, base - 85, cx + 13, base - 85, { lw: 3 });
  line(x, cx - 45, base - 70, cx + 45, base - 70, { lw: 3.5 });
  line(x, cx - 9, base - 40, cx + 9, base - 40, { lw: 2.5 });
  line(x, cx - 7, base - 12, cx + 7, base - 12, { lw: 2.5 });
}
function house(x, cx) {
  x.fillStyle = '#fff'; x.strokeStyle = C.ink; x.lineWidth = 3;
  x.fillRect(cx - 30, 380, 60, 120); x.strokeRect(cx - 30, 380, 60, 120);
  x.beginPath(); x.moveTo(cx - 36, 380); x.lineTo(cx, 348); x.lineTo(cx + 36, 380); x.closePath(); x.fill(); x.stroke();
  x.fillStyle = C.ink; x.fillRect(cx - 8, 430, 16, 70);
}
function powerStation(x, bx) {
  x.fillStyle = '#e2e8f0'; x.strokeStyle = C.ink; x.lineWidth = 3;
  x.fillRect(bx, 360, 200, 140); x.strokeRect(bx, 360, 200, 140);
  x.fillStyle = '#cbd5e1'; x.fillRect(bx + 140, 300, 26, 62); x.strokeRect(bx + 140, 300, 26, 62);
  x.strokeStyle = C.soft; x.lineWidth = 2.5;
  [bx + 148, bx + 158].forEach(sx => { x.beginPath(); x.moveTo(sx, 292); x.bezierCurveTo(sx - 10, 278, sx + 10, 266, sx, 252); x.stroke(); });
  x.strokeStyle = C.ink; x.lineWidth = 2.5;
  [[40, 60], [110, 60], [40, 105], [110, 105]].forEach(([dx, dy]) => { x.strokeRect(bx + dx, 360 + dy, 30, 25); });
}

// ---------- diagram renderers ----------
const renderers = {

  induction(x, c) {
    text(x, 'Electromagnetic induction: moving a magnet near a coil', 620, 40, { size: 30, bold: true });
    const panels = [
      { px: 40, capA: 'magnet moving into the coil', capB: 'needle flicks to the right', deflect: 0.5, mag: -90, arr: [-40, -10] },
      { px: 450, capA: 'magnet stationary inside the coil', capB: 'no current at all', deflect: 0, mag: 55, arr: null },
      { px: 860, capA: 'magnet moving out of the coil', capB: 'needle flicks the other way', deflect: -0.5, mag: -45, arr: [-25, -100] },
    ];
    for (const p of panels) {
      const cx = p.px + 185;
      box(x, p.px, 90, 370, 560);
      const coilX = cx + 55;
      coil(x, coilX, 230);
      if (p.arr) arrow(x, cx + p.arr[0], 295, cx + p.arr[1], 295, { lw: 4, len: 14 });
      if (p.mag !== 55) barMagnet(x, cx + p.mag, 230);
      line(x, coilX - 34, 264, coilX - 40, 420, { lw: 3 });
      line(x, coilX + 34, 264, coilX + 40, 420, { lw: 3 });
      meter(x, coilX, 420, p.deflect);
      text(x, p.capA, cx, 560, { size: 19 });
      text(x, p.capB, cx, 592, { size: 19, color: C.soft });
    }
    text(x, 'A current is induced only while the magnet is moving — and a faster movement induces a bigger current.', 620, 700, { size: 21, color: C.soft });
    text(x, 'This is electromagnetic induction: the same principle that works inside every generator.', 620, 734, { size: 21, color: C.soft });
    save(c, 'sas-phys-induction.png', DIR);
  },

  acgen(x, c) {
    text(x, 'A simple a.c. generator', 620, 40, { size: 30, bold: true });
    box(x, 40, 90, 560, 600);
    text(x, 'the construction', 320, 130, { size: 22, bold: true });
    // poles
    x.fillStyle = '#dbeafe'; x.strokeStyle = C.ink; x.lineWidth = 2.5;
    x.fillRect(90, 250, 56, 150); x.strokeRect(90, 250, 56, 150);
    x.fillStyle = '#fee2e2';
    x.fillRect(500, 250, 56, 150); x.strokeRect(500, 250, 56, 150);
    text(x, 'N', 118, 325, { size: 24, bold: true, color: BLUE });
    text(x, 'S', 528, 325, { size: 24, bold: true, color: RED });
    // spinning coil
    x.save(); x.translate(323, 325); x.rotate(0.35);
    x.strokeStyle = C.ink; x.lineWidth = 4; x.strokeRect(-70, -40, 140, 80);
    x.restore();
    arcArrow(x, 323, 325, 115, -2.6, -1.6);
    text(x, 'the coil spins', 323, 175, { size: 18, color: C.soft });
    // axle, slip rings, brushes
    line(x, 398, 325, 497, 325, { lw: 5 });
    circle(x, 455, 325, 10, { fill: '#fff', stroke: C.ink, lw: 3 });
    circle(x, 480, 325, 10, { fill: '#fff', stroke: C.ink, lw: 3 });
    text(x, 'slip rings', 455, 292, { size: 17, color: C.soft });
    x.fillStyle = '#94a3b8';
    x.fillRect(448, 340, 14, 10); x.fillRect(473, 340, 14, 10);
    // wires to lamp
    line(x, 455, 350, 455, 570, { lw: 3 }); line(x, 364, 570, 455, 570, { lw: 3 });
    line(x, 480, 350, 480, 600, { lw: 3 }); line(x, 316, 600, 480, 600, { lw: 3 }); line(x, 316, 580, 316, 600, { lw: 3 });
    circle(x, 340, 570, 24, { fill: '#fff', stroke: C.ink, lw: 3.5 });
    line(x, 340 - 17, 570 - 17, 340 + 17, 570 + 17, { lw: 3 }); line(x, 340 - 17, 570 + 17, 340 + 17, 570 - 17, { lw: 3 });
    text(x, 'lamp', 340, 628, { size: 18 });
    text(x, 'Slip rings and brushes connect the spinning coil to the circuit.', 320, 660, { size: 17, color: C.soft });
    // output graph
    box(x, 640, 90, 560, 600);
    text(x, 'the output it produces', 920, 130, { size: 22, bold: true });
    line(x, 700, 160, 700, 590, { lw: 3 });
    line(x, 700, 520, 1170, 520, { lw: 3 });
    line(x, 700, 520, 1170, 520, { lw: 1.5, color: C.light, dash: [6, 6] });
    x.strokeStyle = BLUE; x.lineWidth = 4;
    x.beginPath();
    for (let t = 0; t <= 360; t += 2) {
      const px = 710 + t, py = 520 - 130 * Math.sin(t * Math.PI / 90);
      t === 0 ? x.moveTo(px, py) : x.lineTo(px, py);
    }
    x.stroke();
    text(x, 'induced voltage', 740, 180, { size: 16, color: C.soft, align: 'left' });
    text(x, 'time', 1160, 545, { size: 16, color: C.soft, align: 'right' });
    text(x, 'maximum one way', 755, 355, { size: 16, color: BLUE });
    text(x, 'maximum the other way', 845, 672, { size: 16, color: RED });
    line(x, 710, 560, 710, 575, { lw: 2.5 }); line(x, 890, 560, 890, 575, { lw: 2.5 });
    line(x, 710, 568, 890, 568, { lw: 2.5 });
    text(x, 'one complete turn of the coil', 800, 600, { size: 17, color: C.soft });
    text(x, 'As the coil turns, the induced voltage grows, falls and reverses direction — so a generator naturally produces alternating current (a.c.).', 620, 755, { size: 21, color: C.soft });
    save(c, 'sas-phys-ac-generator.png', DIR);
  },

  station(x, c) {
    text(x, 'Inside a power station', 630, 40, { size: 30, bold: true });
    const boxes = [
      { bx: 50, name: 'the fuel', icon: (cx, cy) => flame(x, cx, cy, 24), energy: 'chemical energy', n1: 'coal, oil or gas', n2: null },
      { bx: 370, name: 'the boiler', icon: (cx, cy) => flame(x, cx, cy, 24), energy: 'heat energy', n1: 'fuel is burned, boiling', n2: 'water into steam' },
      { bx: 370, name: 'the turbine', icon: (cx, cy) => turbine(x, cx, cy, 0.9), energy: 'kinetic energy', n1: 'steam blasts the blades', n2: 'and spins the shaft' },
      { bx: 1010, name: 'the generator', icon: (cx, cy) => genCircle(x, cx, cy), energy: 'electrical energy', n1: 'coils spin in a magnetic', n2: 'field — current is induced' },
    ];
    boxes[2].bx = 690;
    for (const b of boxes) {
      box(x, b.bx, 110, 260, 270);
      text(x, b.name, b.bx + 130, 140, { size: 24, bold: true });
      b.icon(b.bx + 130, 215);
      text(x, b.energy, b.bx + 130, 295, { size: 19, bold: true, color: BLUE });
      text(x, b.n1, b.bx + 130, 325, { size: 17, color: C.soft });
      if (b.n2) text(x, b.n2, b.bx + 130, 350, { size: 17, color: C.soft });
    }
    arrow(x, 312, 245, 364, 245, { lw: 4, len: 16 });
    arrow(x, 632, 245, 684, 245, { lw: 4, len: 16 });
    arrow(x, 952, 245, 1004, 245, { lw: 4, len: 16 });
    text(x, 'chemical energy → heat energy → kinetic energy → electrical energy', 630, 445, { size: 24, bold: true, color: BLUE });
    box(x, 50, 500, 1160, 170, { fill: '#f8fafc' });
    text(x, 'Every fuel-burning power station tells the same story: release heat from the fuel, boil water into high-pressure steam,', 630, 540, { size: 19 });
    text(x, 'and use the steam to spin a turbine. The turbine turns the generator, and the generator converts the spinning motion', 630, 575, { size: 19 });
    text(x, 'into electrical energy — which leaves the station for the National Grid.', 630, 610, { size: 19 });
    save(c, 'sas-phys-power-station.png', DIR);
  },

  sources(x, c) {
    text(x, 'Different heat sources — the same generating core', 630, 40, { size: 30, bold: true });
    const cards = [
      { y: 100, icon: (cx, cy) => coalHeap(x, cx, cy), name: 'coal', d: 'burned — heat released' },
      { y: 265, icon: (cx, cy) => flame(x, cx, cy, 22, '#0369a1'), name: 'natural gas', d: 'burned — heat released' },
      { y: 430, icon: (cx, cy) => nuclearTower(x, cx, cy), name: 'nuclear (uranium)', d: 'atoms split — heat released' },
      { y: 595, icon: (cx, cy) => flame(x, cx, cy, 22, GREEN), name: 'biomass (wood, crops)', d: 'burned — heat released' },
    ];
    for (const cd of cards) {
      box(x, 50, cd.y, 400, 145);
      cd.icon(115, cd.y + 72);
      text(x, cd.name, 185, cd.y + 55, { size: 22, bold: true, align: 'left' });
      text(x, cd.d, 185, cd.y + 95, { size: 17, color: C.soft, align: 'left' });
    }
    box(x, 520, 100, 720, 620);
    text(x, 'the generating core — always the same', 880, 140, { size: 23, bold: true });
    const minis = [
      { y: 185, t: 'heat from the fuel boils water into steam' },
      { y: 310, t: 'steam spins the turbine — kinetic energy' },
      { y: 435, t: 'the turbine turns the generator' },
      { y: 560, t: 'electrical energy leaves for the National Grid', col: BLUE },
    ];
    for (let i = 0; i < minis.length; i++) {
      const m = minis[i];
      box(x, 600, m.y, 560, 85, { fill: i === 3 ? '#eff6ff' : '#fff', stroke: '#cbd5e1' });
      text(x, m.t, 880, m.y + 43, { size: 20, bold: i === 3, color: m.col || C.ink });
      if (i < 3) arrow(x, 880, m.y + 87, 880, m.y + 122, { lw: 4, len: 14 });
    }
    box(x, 50, 755, 1190, 100, { fill: '#f8fafc' });
    text(x, 'Wind and hydroelectric stations skip the steam stage: the wind or the falling water turns the turbine directly.', 645, 788, { size: 19 });
    text(x, 'Solar panels make electricity directly from light, with no turbine at all.', 645, 822, { size: 19 });
    save(c, 'sas-phys-heat-sources.png', DIR);
  },

  grid(x, c) {
    text(x, 'The National Grid: the journey from power station to home', 650, 40, { size: 30, bold: true });
    line(x, 50, 500, 1250, 500, { lw: 2, color: C.light });
    powerStation(x, 60);
    line(x, 260, 430, 350, 430, { lw: 4 });
    transformerSymbol(x, 400, 430);
    line(x, 450, 430, 515, 430, { lw: 3 });
    for (let i = 0; i < 3; i++) pylon(x, 560 + i * 140, 500, 330);
    for (let i = 0; i < 2; i++) {
      const x1 = 560 + i * 140 + 45, x2 = 560 + (i + 1) * 140 - 45;
      x.strokeStyle = C.ink; x.lineWidth = 2.5;
      x.beginPath(); x.moveTo(x1, 430); x.quadraticCurveTo((x1 + x2) / 2, 452, x2, 430); x.stroke();
    }
    line(x, 885, 430, 980, 430, { lw: 3 });
    transformerSymbol(x, 1030, 430);
    line(x, 1080, 430, 1150, 430, { lw: 3 });
    house(x, 1180);
    text(x, 'power station', 160, 540, { size: 20, bold: true });
    text(x, 'about 25 000 V', 160, 572, { size: 20, bold: true, color: BLUE });
    text(x, 'step-up transformer', 400, 540, { size: 20, bold: true });
    text(x, 'voltage raised', 400, 572, { size: 19, color: BLUE });
    text(x, 'transmission lines (pylons)', 700, 540, { size: 20, bold: true });
    text(x, 'about 400 000 V — a very small current', 700, 572, { size: 19, color: BLUE });
    text(x, 'step-down transformers', 1010, 540, { size: 20, bold: true });
    text(x, 'lowered stage by stage', 1010, 572, { size: 19, color: BLUE });
    text(x, 'homes', 1180, 540, { size: 20, bold: true });
    text(x, '230 V', 1180, 572, { size: 20, bold: true, color: BLUE });
    box(x, 60, 640, 1180, 150, { fill: '#f8fafc' });
    text(x, 'Step-up transformers raise the voltage so the current in the transmission lines stays very small — and small currents', 650, 682, { size: 19 });
    text(x, 'waste far less energy heating the cables. At the far end, step-down transformers lower the voltage, stage by stage,', 650, 717, { size: 19 });
    text(x, 'to a safe 230 V for homes.', 650, 752, { size: 19 });
    save(c, 'sas-phys-national-grid.png', DIR);
  },

  transformer(x, c) {
    text(x, 'Step-up and step-down transformers', 620, 40, { size: 30, bold: true });
    function panel(bx, header, pLoops, sLoops, inLabel, outLabel, caption, up) {
      box(x, bx, 90, 560, 560);
      text(x, header, bx + 280, 130, { size: 23, bold: true });
      x.fillStyle = '#cbd5e1'; x.strokeStyle = C.grey; x.lineWidth = 2;
      x.fillRect(bx + 215, 175, 16, 270); x.strokeRect(bx + 215, 175, 16, 270);
      x.fillRect(bx + 329, 175, 16, 270); x.strokeRect(bx + 329, 175, 16, 270);
      x.strokeStyle = C.ink; x.lineWidth = 3.5;
      for (let i = 0; i < pLoops; i++) {
        const py = pLoops === 3 ? [235, 300, 365][i] : [210, 252, 294, 336, 378, 420][i];
        x.beginPath(); x.ellipse(bx + 223, py, 30, 22, 0, 0, Math.PI * 2); x.stroke();
      }
      for (let i = 0; i < sLoops; i++) {
        const sy = sLoops === 3 ? [235, 300, 365][i] : [210, 252, 294, 336, 378, 420][i];
        x.beginPath(); x.ellipse(bx + 337, sy, 30, 22, 0, 0, Math.PI * 2); x.stroke();
      }
      text(x, pLoops === 3 ? 'primary — fewer turns' : 'primary — more turns', bx + 223, 160, { size: 17, color: C.soft });
      text(x, sLoops === 3 ? 'secondary — fewer turns' : 'secondary — more turns', bx + 337, 160, { size: 17, color: C.soft });
      const pt = pLoops === 3 ? [235, 365] : [210, 420];
      const st = sLoops === 3 ? [235, 365] : [210, 420];
      line(x, bx + 193, pt[0], bx + 120, pt[0], { lw: 3 }); line(x, bx + 120, pt[0], bx + 120, 545, { lw: 3 });
      line(x, bx + 193, pt[1], bx + 98, pt[1], { lw: 3 }); line(x, bx + 98, pt[1], bx + 98, 545, { lw: 3 });
      circle(x, bx + 120, 552, 4, { fill: C.ink, stroke: false }); circle(x, bx + 98, 552, 4, { fill: C.ink, stroke: false });
      line(x, bx + 367, st[0], bx + 440, st[0], { lw: 3 }); line(x, bx + 440, st[0], bx + 440, 545, { lw: 3 });
      line(x, bx + 367, st[1], bx + 462, st[1], { lw: 3 }); line(x, bx + 462, st[1], bx + 462, 545, { lw: 3 });
      circle(x, bx + 440, 552, 4, { fill: C.ink, stroke: false }); circle(x, bx + 462, 552, 4, { fill: C.ink, stroke: false });
      text(x, inLabel, bx + 110, 595, { size: 18 });
      text(x, outLabel, bx + 452, 595, { size: 18, bold: true, color: BLUE });
      text(x, caption, bx + 280, 632, { size: 18, bold: true, color: up ? BLUE : GREEN });
    }
    panel(40, 'step-up transformer', 3, 6, 'in: 25 000 V (a.c.)', 'out: 400 000 V', 'more turns on the secondary → voltage steps UP', true);
    panel(640, 'step-down transformer', 6, 3, 'in: 11 000 V', 'out: 230 V', 'fewer turns on the secondary → voltage steps DOWN to a safe level', false);
    text(x, 'A transformer works by electromagnetic induction: the changing current in the primary coil creates a changing magnetic', 620, 720, { size: 19 });
    text(x, 'field in the core, which induces a voltage in the secondary coil. That is why transformers only work with a.c.', 620, 752, { size: 19 });
    save(c, 'sas-phys-transformer.png', DIR);
  },

  cable(x, c) {
    text(x, 'Why the Grid transmits at a very high voltage', 630, 40, { size: 30, bold: true });
    box(x, 80, 95, 1100, 70, { fill: '#eff6ff', stroke: '#bfdbfe' });
    text(x, 'power = voltage × current — for the same power, a higher voltage means a smaller current', 630, 130, { size: 20, bold: true });
    box(x, 80, 200, 1100, 220);
    text(x, 'transmitting 2 000 000 W at 25 000 V', 110, 245, { size: 21, bold: true, align: 'left' });
    text(x, 'current = 2 000 000 ÷ 25 000 = 80 A', 110, 285, { size: 19, align: 'left' });
    text(x, 'the cables carry 80 A — they get hot', 110, 320, { size: 19, align: 'left', color: RED });
    for (let i = 0; i < 3; i++) {
      x.strokeStyle = RED; x.lineWidth = 2.5;
      x.beginPath(); x.moveTo(1000 - i * 16, 250 + i * 45);
      x.bezierCurveTo(993 - i * 16, 265 + i * 45, 1007 - i * 16, 275 + i * 45, 1000 - i * 16, 290 + i * 45);
      x.stroke();
    }
    x.fillStyle = RED; x.fillRect(1050, 230, 70, 160);
    text(x, '32 000 W wasted as heat', 1070, 408, { size: 17, color: RED });
    box(x, 80, 450, 1100, 220);
    text(x, 'transmitting the same 2 000 000 W at 400 000 V', 110, 495, { size: 21, bold: true, align: 'left' });
    text(x, 'current = 2 000 000 ÷ 400 000 = 5 A', 110, 535, { size: 19, align: 'left' });
    text(x, 'the cables carry just 5 A — they stay cool', 110, 570, { size: 19, align: 'left', color: GREEN });
    x.fillStyle = RED; x.fillRect(1050, 634, 70, 6);
    text(x, '125 W — over 250× less', 1070, 655, { size: 17, color: GREEN });
    box(x, 80, 700, 1100, 100, { fill: '#f8fafc' });
    text(x, 'For the same power, a higher voltage means a smaller current — and the heat produced in a cable depends on the current,', 630, 735, { size: 19 });
    text(x, 'not the voltage. So the Grid steps the voltage up for the long journey, and down again at the end.', 630, 768, { size: 19 });
    save(c, 'sas-phys-cable-loss.png', DIR);
  },

  homes(x, c) {
    text(x, 'Electricity in the home: one supply, every form of energy', 630, 40, { size: 30, bold: true });
    const cards = [
      { bx: 50, icon: (cx, cy) => kettle(x, cx, cy), name: 'kettle', t: 'electrical → heat', n1: 'a 2.3 kW kettle boils', n2: 'water in minutes' },
      { bx: 365, icon: (cx, cy) => fan(x, cx, cy), name: 'fan', t: 'electrical → kinetic', n1: 'moving air cools', n2: 'you down' },
      { bx: 680, icon: (cx, cy) => speaker(x, cx, cy), name: 'speaker', t: 'electrical → sound', n1: 'music, voices and', n2: 'alerts' },
      { bx: 995, icon: (cx, cy) => ledLamp(x, cx, cy), name: 'lamp', t: 'electrical → light', n1: 'about 90 % of the', n2: 'energy becomes light' },
    ];
    for (const cd of cards) {
      box(x, cd.bx, 100, 280, 420);
      cd.icon(cd.bx + 140, 250);
      text(x, cd.name, cd.bx + 140, 345, { size: 24, bold: true });
      text(x, cd.t, cd.bx + 140, 385, { size: 20, bold: true, color: BLUE });
      text(x, cd.n1, cd.bx + 140, 425, { size: 17, color: C.soft });
      text(x, cd.n2, cd.bx + 140, 450, { size: 17, color: C.soft });
    }
    box(x, 50, 570, 1190, 130, { fill: '#f8fafc' });
    text(x, 'Electricity is the most useful form of energy in the home precisely because it converts so easily:', 645, 610, { size: 19 });
    text(x, 'heat in a kettle, movement in a fan, sound in a speaker, light in a lamp.', 645, 643, { size: 19 });
    text(x, 'The power station and the National Grid exist to deliver this one convertible supply to the socket.', 645, 676, { size: 19 });
    save(c, 'sas-phys-home-uses.png', DIR);
  },

  acdc(x, c) {
    text(x, 'Alternating current (a.c.) and direct current (d.c.)', 620, 40, { size: 30, bold: true });
    box(x, 40, 90, 560, 520);
    text(x, 'mains electricity — a.c.', 320, 130, { size: 23, bold: true });
    x.strokeStyle = C.grey; x.lineWidth = 2.5; x.strokeRect(110, 165, 420, 320);
    line(x, 130, 325, 500, 325, { lw: 1.5, color: C.light, dash: [6, 6] });
    x.strokeStyle = BLUE; x.lineWidth = 4;
    x.beginPath();
    for (let t = 0; t <= 360; t += 2) {
      const px = 130 + t, py = 325 - 115 * Math.sin(t * Math.PI / 76);
      t === 0 ? x.moveTo(px, py) : x.lineTo(px, py);
    }
    x.stroke();
    text(x, '230 V', 206, 190, { size: 18, bold: true, color: BLUE });
    text(x, 'the direction of the current reverses, 50 times every second (50 Hz)', 320, 525, { size: 17, color: C.soft });
    box(x, 640, 90, 560, 520);
    text(x, 'a battery — d.c.', 920, 130, { size: 23, bold: true });
    x.strokeStyle = C.grey; x.lineWidth = 2.5; x.strokeRect(710, 165, 420, 320);
    line(x, 730, 325, 1090, 325, { lw: 1.5, color: C.light, dash: [6, 6] });
    line(x, 730, 240, 1090, 240, { lw: 4, color: BLUE });
    text(x, 'a steady 1.5 V', 910, 215, { size: 18, bold: true, color: BLUE });
    text(x, 'the current always flows the same way — one direction', 920, 525, { size: 17, color: C.soft });
    box(x, 40, 650, 1160, 80, { fill: '#f8fafc' });
    text(x, 'Generators naturally produce a.c., which is why the mains supply is alternating. Cells and batteries produce d.c.', 620, 690, { size: 19 });
    save(c, 'sas-phys-ac-dc.png', DIR);
  },
};

// ---------- run ----------
const results = [];
const only = (process.env.RENDER_ONLY || '').split(',').map(s => s.trim()).filter(Boolean);
const keys = Object.keys(renderers);
const dims = {
  induction: [1240, 780], acgen: [1240, 810], station: [1260, 720], sources: [1260, 900],
  grid: [1300, 830], transformer: [1240, 820], cable: [1260, 840], homes: [1260, 760], acdc: [1240, 770],
};
for (const key of keys) {
  if (only.length && !only.includes(key)) continue;
  const [w, h] = dims[key];
  const [c, x] = make(w, h);
  renderers[key](x, c);
  results.push({ key, file: key + '.png', w, h });
}
console.log(JSON.stringify(results));
globalThis.__sas34 = results;
module.exports = results;