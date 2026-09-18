// Renders the nine Single Award Science lesson 3.3 (Energy) diagrams as PNGs.
// Style matches the existing sas-physics diagrams (scripts/sas-chem/phys1.cjs).
const K = require('./sas-chem/common.cjs');
const { make, save, text, circle, line, arrow, C } = K;

const AMBER = '#b45309', GREEN = '#15803d', SKY = '#bfdbfe', BLUE = '#1d4ed8', RED = '#dc2626';
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
function battery(x, cx, cy, s = 1) {
  x.fillStyle = '#fff'; x.strokeStyle = C.ink; x.lineWidth = 3;
  x.fillRect(cx - 34 * s, cy - 14 * s, 52 * s, 28 * s); x.strokeRect(cx - 34 * s, cy - 14 * s, 52 * s, 28 * s);
  x.fillRect(cx + 18 * s, cy - 6 * s, 12 * s, 12 * s); x.strokeRect(cx + 18 * s, cy - 6 * s, 12 * s, 12 * s);
  line(x, cx - 20 * s, cy, cx - 8 * s, cy, { lw: 3 }); line(x, cx - 14 * s, cy - 6 * s, cx - 14 * s, cy + 6 * s, { lw: 3 });
  line(x, cx + 2 * s, cy - 6 * s, cx + 2 * s, cy + 6 * s, { lw: 3 });
}
function bolt(x, cx, cy) {
  x.beginPath();
  x.moveTo(cx - 4, cy - 26); x.lineTo(cx - 14, cy + 2); x.lineTo(cx - 3, cy + 2);
  x.lineTo(cx - 10, cy + 26); x.lineTo(cx + 12, cy - 4); x.lineTo(cx + 1, cy - 4); x.lineTo(cx + 9, cy - 26);
  x.closePath(); x.fillStyle = BLUE; x.fill();
}
function sun(x, cx, cy) {
  circle(x, cx, cy, 15, { fill: AMBER, stroke: AMBER, lw: 2 });
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    line(x, cx + 21 * Math.cos(a), cy + 21 * Math.sin(a), cx + 31 * Math.cos(a), cy + 31 * Math.sin(a), { color: AMBER, lw: 3 });
  }
}
function speaker(x, cx, cy) {
  x.fillStyle = C.ink;
  x.fillRect(cx - 30, cy - 11, 16, 22);
  x.beginPath(); x.moveTo(cx - 14, cy - 11); x.lineTo(cx + 4, cy - 24); x.lineTo(cx + 4, cy + 24); x.lineTo(cx - 14, cy + 11); x.closePath(); x.fill();
  x.strokeStyle = C.ink; x.lineWidth = 3;
  [16, 27].forEach(r => { x.beginPath(); x.arc(cx + 6, cy, r, -0.9, 0.9); x.stroke(); });
}
function barMagnet(x, cx, cy) {
  x.fillStyle = RED; x.fillRect(cx - 34, cy - 13, 34, 26);
  x.fillStyle = BLUE; x.fillRect(cx, cy - 13, 34, 26);
  x.strokeStyle = C.ink; x.lineWidth = 2.5; x.strokeRect(cx - 34, cy - 13, 68, 26);
  text(x, 'N', cx - 17, cy + 1, { size: 16, bold: true, color: '#fff' });
  text(x, 'S', cx + 17, cy + 1, { size: 16, bold: true, color: '#fff' });
}
function spring(x, cx, cy) {
  line(x, cx - 52, cy, cx - 40, cy, { lw: 4 });
  x.beginPath(); x.moveTo(cx - 40, cy);
  const zig = [-16, 16, -16, 16, -16, 16, -16, 16];
  zig.forEach((dy, i) => x.lineTo(cx - 30 + i * 10, cy + dy));
  x.lineTo(cx + 40, cy); x.strokeStyle = C.ink; x.lineWidth = 4; x.stroke();
  line(x, cx + 40, cy, cx + 52, cy, { lw: 4 });
}
function car(x, cx, cy, s = 1) {
  x.fillStyle = '#e2e8f0'; x.strokeStyle = C.ink; x.lineWidth = 3;
  x.fillRect(cx - 44 * s, cy - 8 * s, 84 * s, 16 * s); x.strokeRect(cx - 44 * s, cy - 8 * s, 84 * s, 16 * s);
  x.fillRect(cx - 22 * s, cy - 22 * s, 40 * s, 15 * s); x.strokeRect(cx - 22 * s, cy - 22 * s, 40 * s, 15 * s);
  circle(x, cx - 26 * s, cy + 10 * s, 8 * s, { fill: '#fff', stroke: C.ink, lw: 3 });
  circle(x, cx + 24 * s, cy + 10 * s, 8 * s, { fill: '#fff', stroke: C.ink, lw: 3 });
  arrow(x, cx + 52 * s, cy - 14 * s, cx + 74 * s, cy - 14 * s, { lw: 3, len: 10, color: C.soft });
  arrow(x, cx + 52 * s, cy - 2 * s, cx + 74 * s, cy - 2 * s, { lw: 3, len: 10, color: C.soft });
}
function gpeIcon(x, cx, cy) {
  line(x, cx - 40, cy + 14, cx + 40, cy + 14, { lw: 4 });
  x.fillStyle = '#fde68a'; x.strokeStyle = C.ink; x.lineWidth = 3;
  x.fillRect(cx - 14, cy - 24, 28, 24); x.strokeRect(cx - 14, cy - 24, 28, 24);
  line(x, cx, cy - 32, cx, cy - 40, { lw: 0 });
  line(x, cx, cy - 24, cx, cy - 44, { color: C.soft, lw: 3, dash: [5, 5] });
  arrow(x, cx + 22, cy - 2, cx + 22, cy + 10, { lw: 3, len: 10, color: C.soft });
}
function bulb(x, cx, cy) {
  circle(x, cx, cy, 18, { fill: '#fde68a', stroke: AMBER, lw: 3 });
  x.fillStyle = C.ink; x.fillRect(cx - 7, cy + 18, 14, 8);
  for (const a of [-0.8, -0.4, 0, 0.4, 0.8]) {
    line(x, cx + 24 * Math.cos(a), cy + 24 * Math.sin(a), cx + 34 * Math.cos(a), cy + 34 * Math.sin(a), { color: AMBER, lw: 3 });
  }
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
function tv(x, cx, cy) {
  x.fillStyle = '#fff'; x.strokeStyle = C.ink; x.lineWidth = 3;
  x.fillRect(cx - 34, cy - 22, 68, 42); x.strokeRect(cx - 34, cy - 22, 68, 42);
  x.fillStyle = '#dbeafe'; x.fillRect(cx - 28, cy - 16, 56, 30);
  line(x, cx - 14, cy + 20, cx - 14, cy + 32, { lw: 3 }); line(x, cx + 14, cy + 20, cx + 14, cy + 32, { lw: 3 });
  line(x, cx - 22, cy + 32, cx + 22, cy + 32, { lw: 3 });
}
function ledLamp(x, cx, cy) {
  circle(x, cx, cy - 8, 16, { fill: '#fde68a', stroke: AMBER, lw: 3 });
  x.fillStyle = C.ink; x.fillRect(cx - 9, cy + 8, 18, 5); x.fillRect(cx - 13, cy + 13, 26, 4);
  for (const a of [-0.7, 0, 0.7]) line(x, cx + 22 * Math.cos(a), cy - 8 + 22 * Math.sin(a), cx + 30 * Math.cos(a), cy - 8 + 30 * Math.sin(a), { color: AMBER, lw: 3 });
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
function solarPanel(x, cx, cy) {
  x.fillStyle = '#1e3a8a'; x.strokeStyle = C.ink; x.lineWidth = 3;
  x.beginPath(); x.moveTo(cx - 36, cy + 10); x.lineTo(cx - 24, cy - 14); x.lineTo(cx + 36, cy - 14); x.lineTo(cx + 24, cy + 10); x.closePath(); x.fill(); x.stroke();
  x.strokeStyle = '#fff'; x.lineWidth = 1.5;
  [-8, 0, 8].forEach(dy => { x.beginPath(); x.moveTo(cx - 30 + dy * 0.5, cy + dy - 2); x.lineTo(cx + 30 + dy * 0.5, cy + dy - 2); x.stroke(); });
  [-12, 0, 12].forEach(dx => { x.beginPath(); x.moveTo(cx + dx * 1.0, cy - 14); x.lineTo(cx + dx * 0.7, cy + 10); x.stroke(); });
  line(x, cx, cy + 10, cx, cy + 22, { color: C.ink, lw: 3 }); line(x, cx - 14, cy + 22, cx + 14, cy + 22, { color: C.ink, lw: 3 });
}
function dam(x, cx, cy) {
  x.fillStyle = '#94a3b8'; x.strokeStyle = C.ink; x.lineWidth = 3;
  x.beginPath(); x.moveTo(cx - 34, cy + 24); x.lineTo(cx - 10, cy - 26); x.lineTo(cx + 10, cy - 26); x.lineTo(cx + 34, cy + 24); x.closePath(); x.fill(); x.stroke();
  x.strokeStyle = BLUE; x.lineWidth = 3;
  x.beginPath(); x.moveTo(cx + 14, cy + 14);
  for (let i = 0; i <= 10; i++) x.lineTo(cx + 14 + i * 4, cy + 14 + (i % 2 ? -5 : 5));
  x.stroke();
}
function waveBob(x, cx, cy) {
  x.strokeStyle = BLUE; x.lineWidth = 3;
  x.beginPath(); x.moveTo(cx - 40, cy);
  for (let i = 0; i <= 8; i++) x.lineTo(cx - 40 + i * 10, cy + (i % 2 ? -8 : 8));
  x.stroke();
  circle(x, cx + 2, cy - 8, 10, { fill: '#fde68a', stroke: C.ink, lw: 3 });
  line(x, cx + 2, cy + 2, cx + 2, cy + 14, { color: C.ink, lw: 3 });
}
function coalHeap(x, cx, cy) {
  x.fillStyle = '#334155'; x.strokeStyle = C.ink; x.lineWidth = 3;
  x.beginPath(); x.moveTo(cx - 40, cy + 20); x.lineTo(cx - 18, cy - 20); x.lineTo(cx + 4, cy - 24); x.lineTo(cx + 26, cy - 12); x.lineTo(cx + 40, cy + 20); x.closePath(); x.fill(); x.stroke();
  circle(x, cx - 8, cy - 2, 5, { fill: '#64748b', stroke: false });
  circle(x, cx + 14, cy + 4, 4, { fill: '#64748b', stroke: false });
}
function oilBarrel(x, cx, cy) {
  x.fillStyle = '#0284c7'; x.strokeStyle = C.ink; x.lineWidth = 3;
  x.fillRect(cx - 22, cy - 26, 44, 52); x.strokeRect(cx - 22, cy - 26, 44, 52);
  x.strokeStyle = '#fff'; x.lineWidth = 2;
  [-10, 0, 10].forEach(dy => { x.beginPath(); x.ellipse(cx, cy + dy, 22, 5, 0, 0, Math.PI * 2); x.stroke(); });
}
function nuclearTower(x, cx, cy) {
  x.fillStyle = '#e2e8f0'; x.strokeStyle = C.ink; x.lineWidth = 3;
  x.beginPath(); x.moveTo(cx - 28, cy + 26); x.lineTo(cx - 16, cy - 24); x.lineTo(cx + 16, cy - 24); x.lineTo(cx + 28, cy + 26); x.closePath(); x.fill(); x.stroke();
  x.strokeStyle = C.soft; x.lineWidth = 2.5;
  [cx - 8, cx + 4].forEach(sx => { x.beginPath(); x.moveTo(sx, cy - 30); x.bezierCurveTo(sx - 8, cy - 42, sx + 8, cy - 50, sx, cy - 62); x.stroke(); });
}

// ---------- diagram renderers ----------
const renderers = {

  forms(x, c) {
    const W = 1260, H = 880;
    text(x, 'The nine forms of energy', 630, 40, { size: 30, bold: true });
    const cards = [
      ['chemical', (cx, cy) => battery(x, cx, cy), 'stored in fuels, food', 'and batteries'],
      ['heat (thermal)', (cx, cy) => flame(x, cx, cy, 24), 'the energy of hot things —', 'particles vibrate more'],
      ['electrical', (cx, cy) => bolt(x, cx, cy), 'carried by a current', 'moving through wires'],
      ['sound', (cx, cy) => speaker(x, cx, cy), 'travels outwards as', 'vibrations of a material'],
      ['light', (cx, cy) => sun(x, cx, cy), 'given out by luminous', 'objects — the Sun, lamps'],
      ['magnetic', (cx, cy) => barMagnet(x, cx, cy), 'stored in magnets', 'and electromagnets'],
      ['strain (elastic)', (cx, cy) => spring(x, cx, cy), 'stored in stretched or', 'squashed objects'],
      ['kinetic', (cx, cy) => car(x, cx, cy, 0.9), 'anything that is', 'moving has kinetic energy'],
      ['gravitational', (cx, cy) => gpeIcon(x, cx, cy), 'anything raised up', 'above the ground'],
    ];
    cards.forEach((card, i) => {
      const col = i % 3, row = (i - col) / 3;
      const tx = 30 + col * 410, ty = 90 + row * 255, cx = tx + 190, cy = ty + 64;
      box(x, tx, ty, 380, 235);
      card[1](cx, cy);
      text(x, card[0], cx, ty + 138, { size: 23, bold: true });
      text(x, card[2], cx, ty + 172, { size: 18, color: C.soft });
      text(x, card[3], cx, ty + 196, { size: 18, color: C.soft });
    });
    save(c, 'sas-phys-energy-forms.png', DIR);
  },

  chain(x, c) {
    const W = 1200, H = 660;
    text(x, 'Energy transfer in a torch', 600, 40, { size: 30, bold: true });
    const boxes = [
      [60, 110, 300, 140, (cx, cy) => battery(x, cx, cy), 'chemical energy', 'stored in the battery'],
      [440, 110, 300, 140, (cx, cy) => { x.strokeStyle = C.ink; x.lineWidth = 4; x.beginPath(); x.moveTo(cx - 34, cy); for (let i = 0; i < 6; i++) x.lineTo(cx - 24 + i * 10, cy + (i % 2 ? -12 : 12)); x.lineTo(cx + 34, cy); x.stroke(); }, 'electrical energy', 'carried by the current'],
      [860, 60, 290, 140, bulb, 'light energy', 'useful — what we want'],
      [860, 330, 290, 140, (cx, cy) => flame(x, cx, cy, 24), 'heat energy', 'wasted — spreads away'],
    ];
    boxes.forEach(([tx, ty, w, h, icon, label, cap]) => {
      box(x, tx, ty, w, h);
      icon(tx + 55, ty + 70);
      text(x, label, tx + 175, ty + 58, { size: 22, bold: true, align: 'left' });
      text(x, cap, tx + 175, ty + 92, { size: 18, color: C.soft, align: 'left' });
    });
    arrow(x, 360, 180, 440, 180, { lw: 4, len: 16 });
    line(x, 740, 180, 790, 180, { lw: 4 });
    line(x, 790, 130, 790, 400, { lw: 4 });
    arrow(x, 790, 130, 860, 130, { lw: 4, len: 16 });
    arrow(x, 790, 400, 860, 400, { lw: 4, len: 16 });
    text(x, 'The energy leaving the torch (light + heat) equals the energy that left the battery.', 600, 560, { size: 22, color: C.soft });
    text(x, 'Energy is never used up — it is only transferred from one form to another.', 600, 600, { size: 22, color: C.soft });
    save(c, 'sas-phys-energy-transfer-chain.png', DIR);
  },

  sankey(x, c) {
    const W = 1240, H = 760;
    text(x, 'A Sankey diagram: a filament lamp', 620, 40, { size: 30, bold: true });
    const X0 = 160, XS = 600, XE = 1000, YM = 400;
    const tMain = 240, tLight = 24, tHeat = 216;
    const yTop = YM - tMain / 2, ySplit = yTop + tLight;
    x.fillStyle = SKY; x.strokeStyle = BLUE; x.lineWidth = 2;
    x.fillRect(X0, yTop, XS - X0, tMain); x.strokeRect(X0, yTop, XS - X0, tMain);
    x.beginPath(); x.moveTo(XS, yTop); x.lineTo(XE, 190 - tLight / 2); x.lineTo(XE, 190 + tLight / 2); x.lineTo(XS, ySplit); x.closePath(); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(XS, ySplit); x.lineTo(XE, 620 - tHeat / 2); x.lineTo(XE, 620 + tHeat / 2); x.lineTo(XS, yTop + tMain); x.closePath(); x.fill(); x.stroke();
    text(x, 'electrical energy in:', 148, 385, { size: 22, align: 'right' });
    text(x, '100 J every second', 148, 418, { size: 22, bold: true, align: 'right' });
    text(x, 'useful light out:', 1060, 165, { size: 22, align: 'left', color: GREEN });
    text(x, '10 J', 1060, 195, { size: 22, bold: true, align: 'left', color: GREEN });
    text(x, 'wasted heat out:', 1060, 640, { size: 22, align: 'left', color: RED });
    text(x, '90 J', 1060, 670, { size: 22, bold: true, align: 'left', color: RED });
    text(x, 'The thickness of each arrow shows how much energy it carries.', 620, 715, { size: 22, color: C.soft });
    save(c, 'sas-phys-sankey-lamp.png', DIR);
  },

  kinetic(x, c) {
    const W = 1200, H = 800;
    text(x, 'Kinetic energy: the energy of movement', 600, 40, { size: 30, bold: true });
    box(x, 80, 80, 1040, 120, { fill: '#eff6ff', stroke: '#bfdbfe' });
    text(x, 'Ek = ½ × m × v²', 600, 125, { size: 44, bold: true, color: BLUE });
    text(x, 'mass m in kilograms (kg), speed v in metres per second (m/s), energy Ek in joules (J)', 600, 172, { size: 21, color: C.soft });
    box(x, 60, 250, 520, 470);
    car(x, 320, 350, 1.4);
    text(x, 'family car', 320, 425, { size: 23, bold: true });
    text(x, 'm = 1000 kg, v = 20 m/s', 320, 465, { size: 21 });
    text(x, 'Ek = ½ × 1000 × 20²', 320, 510, { size: 22 });
    text(x, '= ½ × 1000 × 400', 320, 545, { size: 22 });
    text(x, '= 200 000 J (200 kJ)', 320, 585, { size: 22, bold: true });
    text(x, 'at 40 m/s the same car stores 800 000 J —', 320, 640, { size: 19, color: C.soft });
    text(x, 'doubling the speed quadruples the energy', 320, 668, { size: 19, color: C.soft });
    box(x, 620, 250, 520, 470);
    circle(x, 842, 392, 30, { stroke: C.ink, lw: 4, fill: '#fff' });
    circle(x, 920, 392, 30, { stroke: C.ink, lw: 4, fill: '#fff' });
    line(x, 842, 392, 880, 344, { lw: 4 }); line(x, 920, 392, 880, 344, { lw: 4 });
    line(x, 880, 344, 872, 322, { lw: 4 }); line(x, 880, 344, 896, 322, { lw: 4 });
    circle(x, 884, 306, 14, { fill: '#fde68a', stroke: C.ink, lw: 3 });
    line(x, 872, 322, 884, 320, { lw: 4 }); line(x, 896, 322, 884, 320, { lw: 4 });
    arrow(x, 946, 380, 980, 380, { lw: 3, len: 10, color: C.soft });
    text(x, 'cyclist', 880, 425, { size: 23, bold: true });
    text(x, 'm = 60 kg, v = 8 m/s', 880, 465, { size: 21 });
    text(x, 'Ek = ½ × 60 × 8²', 880, 510, { size: 22 });
    text(x, '= ½ × 60 × 64', 880, 545, { size: 22 });
    text(x, '= 1920 J', 880, 585, { size: 22, bold: true });
    text(x, 'the same rider at 16 m/s would store', 880, 640, { size: 19, color: C.soft });
    text(x, '7680 J — four times as much', 880, 668, { size: 19, color: C.soft });
    save(c, 'sas-phys-kinetic-energy.png', DIR);
  },

  gpe(x, c) {
    const W = 1200, H = 760;
    text(x, 'Gravitational potential energy', 600, 40, { size: 30, bold: true });
    line(x, 100, 640, 560, 640, { lw: 5 });
    for (let gx = 110; gx < 560; gx += 40) line(x, gx, 640, gx - 14, 662, { lw: 2, color: C.light });
    x.fillStyle = '#e2e8f0'; x.strokeStyle = C.ink; x.lineWidth = 3;
    x.fillRect(190, 340, 170, 300); x.strokeRect(190, 340, 170, 300);
    x.fillStyle = '#fde68a';
    x.fillRect(250, 300, 60, 40); x.strokeRect(250, 300, 60, 40);
    text(x, 'load: 500 kg', 280, 272, { size: 22, bold: true });
    arrow(x, 140, 640, 140, 400, { lw: 3, len: 14, color: C.soft });
    arrow(x, 140, 340, 140, 400, { lw: 3, len: 14, color: C.soft });
    line(x, 140, 400, 140, 340, { lw: 3, color: C.soft });
    text(x, 'h = 12 m', 152, 470, { size: 22, bold: true, align: 'left' });
    text(x, 'ground level', 330, 685, { size: 19, color: C.soft });
    box(x, 620, 100, 520, 240, { fill: '#eff6ff', stroke: '#bfdbfe' });
    text(x, 'Ep = m × g × h', 880, 150, { size: 44, bold: true, color: BLUE });
    text(x, 'g = 10 N/kg on Earth (given in the exam)', 880, 200, { size: 21, color: C.soft });
    text(x, 'Ep = 500 × 10 × 12', 880, 250, { size: 23 });
    text(x, '= 60 000 J (60 kJ)', 880, 305, { size: 23, bold: true });
    text(x, 'Energy is stored because of the load\u2019s position above the ground.', 600, 660, { size: 22, color: C.soft });
    text(x, 'Always state the level you measure h from.', 600, 700, { size: 22, color: C.soft });
    save(c, 'sas-phys-gpe.png', DIR);
  },

  falling(x, c) {
    const W = 1200, H = 820;
    text(x, 'A falling object: Ep turns into Ek', 600, 40, { size: 30, bold: true });
    text(x, 'A 10 kg ball is dropped from 20 m (g = 10 N/kg)', 600, 82, { size: 22, color: C.soft });
    line(x, 100, 720, 520, 720, { lw: 5 });
    for (let gx = 110; gx < 520; gx += 40) line(x, gx, 720, gx - 14, 742, { lw: 2, color: C.light });
    line(x, 200, 130, 200, 700, { color: C.light, lw: 2, dash: [8, 8] });
    circle(x, 200, 140, 16, { fill: '#1d4ed8', stroke: C.ink, lw: 3 });
    circle(x, 200, 415, 16, { fill: '#1d4ed8', stroke: C.ink, lw: 3 });
    arrow(x, 200, 300, 200, 380, { lw: 4, len: 14, color: C.soft });
    circle(x, 200, 690, 16, { fill: '#dc2626', stroke: C.ink, lw: 3 });
    text(x, 'start: 20 m', 232, 140, { size: 20, align: 'left' });
    text(x, 'halfway: 10 m', 232, 415, { size: 20, align: 'left' });
    text(x, 'just before landing', 232, 690, { size: 20, align: 'left' });
    const bars = [
      [640, 'at the start', 2000, 0],
      [820, 'halfway down', 1000, 1000],
      [1000, 'just before landing', 0, 2000],
    ];
    bars.forEach(([bx, label, ep, ek]) => {
      const total = 200, w = 100, base = 620, x0 = bx - w / 2;
      if (ep > 0) { x.fillStyle = BLUE; x.fillRect(x0, base - total * ep / 2000, w, total * ep / 2000); text(x, 'Ep ' + ep + ' J', bx, base - total * ep / 2000 / 2, { size: 19, bold: true, color: '#fff' }); }
      if (ek > 0) { x.fillStyle = RED; x.fillRect(x0, base - total, w, total * ek / 2000); text(x, 'Ek ' + ek + ' J', bx, base - total - total * ek / 2000 / 2 + total * ep / 2000 + 0, { size: 19, bold: true, color: '#fff' }); }
      x.strokeStyle = C.ink; x.lineWidth = 2; x.strokeRect(x0, base - total, w, total);
      text(x, label, bx, 660, { size: 19, color: C.soft });
    });
    x.fillStyle = BLUE; x.fillRect(1040, 120, 22, 22); x.strokeRect(1040, 120, 22, 22);
    text(x, 'Ep — stored by height', 1076, 131, { size: 20, align: 'left' });
    x.fillStyle = RED; x.fillRect(1040, 158, 22, 22); x.strokeRect(1040, 158, 22, 22);
    text(x, 'Ek — stored by movement', 1076, 169, { size: 20, align: 'left' });
    text(x, 'The total stays 2000 J at every point of the fall — energy is conserved.', 600, 785, { size: 22, color: C.soft });
    save(c, 'sas-phys-falling-conversion.png', DIR);
  },

  power(x, c) {
    const W = 1200, H = 800;
    text(x, 'Power: how quickly energy is transferred', 600, 40, { size: 30, bold: true });
    box(x, 80, 80, 1040, 120, { fill: '#eff6ff', stroke: '#bfdbfe' });
    text(x, 'P = E / t', 600, 125, { size: 44, bold: true, color: BLUE });
    text(x, 'energy E in joules, time t in seconds, power P in watts (1 W = 1 J every second)', 600, 172, { size: 21, color: C.soft });
    const apps = [
      [60, (cx, cy) => kettle(x, cx, cy), 'kettle: 2200 W', '2200 J every second'],
      [440, (cx, cy) => tv(x, cx, cy), 'television: 100 W', '100 J every second'],
      [820, (cx, cy) => ledLamp(x, cx, cy), 'LED lamp: 8 W', '8 J every second'],
    ];
    apps.forEach(([tx, icon, label, cap]) => {
      box(x, tx, 250, 320, 300);
      icon(tx + 160, 360);
      text(x, label, tx + 160, 455, { size: 23, bold: true });
      text(x, cap, tx + 160, 495, { size: 19, color: C.soft });
    });
    box(x, 60, 600, 1100, 150, { fill: '#f8fafc' });
    text(x, 'A 2200 W kettle left on for 60 s transfers:', 600, 645, { size: 23 });
    text(x, 'E = P × t = 2200 × 60 = 132 000 J (132 kJ)', 600, 690, { size: 24, bold: true, color: BLUE });
    save(c, 'sas-phys-power.png', DIR);
  },

  resources(x, c) {
    const W = 1240, H = 900;
    text(x, 'Where our energy comes from', 620, 40, { size: 30, bold: true });
    box(x, 60, 90, 540, 780, { fill: '#f0fdf4', stroke: '#bbf7d0' });
    text(x, 'Renewable — will not run out', 330, 135, { size: 26, bold: true, color: GREEN });
    box(x, 640, 90, 540, 780, { fill: '#fef2f2', stroke: '#fecaca' });
    text(x, 'Non-renewable — will run out', 970, 135, { size: 26, bold: true, color: RED });
    const cells = [
      [95, 175, (cx, cy) => turbine(x, cx, cy, 1.2), 'wind', 'moving air turns', 'the blades'],
      [345, 175, solarPanel, 'solar', 'sunlight makes', 'electricity in cells'],
      [95, 480, dam, 'hydroelectric', 'falling water spins', 'the turbines'],
      [345, 480, waveBob, 'wave', 'sea movement drives', 'floating generators'],
      [675, 175, coalHeap, 'coal', 'burned in power', 'stations'],
      [925, 175, oilBarrel, 'oil', 'refined into petrol', 'and heating oil'],
      [675, 480, (cx, cy) => flame(x, cx, cy, 26, '#0284c7'), 'natural gas', 'burned in homes and', 'power stations'],
      [925, 480, nuclearTower, 'nuclear', 'uranium atoms are', 'split in reactors'],
    ];
    cells.forEach(([tx, ty, icon, name, cap1, cap2]) => {
      box(x, tx, ty, 230, 280, { fill: '#ffffff' });
      icon(tx + 115, ty + 105);
      text(x, name, tx + 115, ty + 195, { size: 22, bold: true });
      text(x, cap1, tx + 115, ty + 228, { size: 17, color: C.soft });
      text(x, cap2, tx + 115, ty + 252, { size: 17, color: C.soft });
    });
    text(x, 'Fossil fuels took millions of years to form — we are using them far faster than they can be replaced.', 620, 890, { size: 21, color: C.soft });
    save(c, 'sas-phys-energy-resources.png', DIR);
  },

  efficiency(x, c) {
    const W = 1200, H = 760;
    text(x, 'Efficiency: useful energy out of total energy in', 600, 40, { size: 30, bold: true });
    x.fillStyle = SKY; x.strokeStyle = BLUE; x.lineWidth = 2;
    x.fillRect(90, 340, 250, 80); x.strokeRect(90, 340, 250, 80);
    arrow(x, 340, 380, 410, 380, { lw: 0 });
    x.fillStyle = SKY; x.beginPath(); x.moveTo(410, 344); x.lineTo(410, 416); x.lineTo(440, 380); x.closePath(); x.fill();
    text(x, 'electrical energy in: 200 J', 215, 315, { size: 21 });
    circle(x, 520, 380, 70, { fill: '#f1f5f9', stroke: C.ink, lw: 4 });
    text(x, 'motor', 520, 381, { size: 22, bold: true });
    x.strokeStyle = '#22c55e'; x.lineWidth = 34;
    line(x, 590, 330, 760, 210);
    x.fillStyle = '#22c55e'; x.beginPath(); x.moveTo(760, 194); x.lineTo(760, 226); x.lineTo(790, 210); x.closePath(); x.fill();
    x.strokeStyle = '#ef4444'; x.lineWidth = 24;
    line(x, 590, 440, 760, 560);
    x.fillStyle = '#ef4444'; x.beginPath(); x.moveTo(760, 548); x.lineTo(760, 572); x.lineTo(786, 560); x.closePath(); x.fill();
    text(x, 'kinetic energy — useful: 120 J', 800, 210, { size: 22, align: 'left', color: GREEN });
    text(x, 'heat + sound — wasted: 80 J', 800, 560, { size: 22, align: 'left', color: RED });
    box(x, 60, 650, 1100, 90, { fill: '#eff6ff', stroke: '#bfdbfe' });
    text(x, 'efficiency = (useful energy out ÷ total energy in) × 100 % = (120 ÷ 200) × 100 % = 60 %', 610, 682, { size: 25, bold: true, color: BLUE });
    text(x, 'No device is 100 % efficient — some energy always ends up as heat.', 610, 722, { size: 20, color: C.soft });
    save(c, 'sas-phys-efficiency.png', DIR);
  },
};

// ---------- run ----------
const results = [];
const only = (process.env.RENDER_ONLY || '').split(',').map(s => s.trim()).filter(Boolean);
const keys = Object.keys(renderers);
for (const key of keys) {
  if (only.length && !only.includes(key)) continue;
  const W = { forms: [1260, 880], chain: [1200, 660], sankey: [1240, 760], kinetic: [1200, 800], gpe: [1200, 760], falling: [1200, 820], power: [1200, 800], resources: [1240, 900], efficiency: [1200, 760] }[key];
  const [c, x] = make(W[0], W[1]);
  renderers[key](x, c);
  results.push({ key, file: key + '.png', w: W[0], h: W[1] });
}
console.log(JSON.stringify(results));
globalThis.__sas33 = results;
module.exports = results;