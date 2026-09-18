/*
 * Renders the nine Single Award Science lesson 3.5 (Heat Transfer) diagrams as PNGs.
 * Style matches the existing sas-physics diagrams (scripts/render-sas33-energy.cjs).
 */
const K = require('./sas-chem/common.cjs');
const fs = require('fs');
const path = require('path');
const { loadImage } = require('canvas');
const { make, save, text, circle, line, arrow, arrowHead, C } = K;

const W = 1448, H = 1086;
const DIR = path.resolve(process.cwd(), 'public/lesson-assets/sas-physics');
const AMBER = '#b45309', BLUE = '#1d4ed8', RED = '#dc2626', ORANGE = '#ea580c',
      GREY = '#64748b', LIGHT = '#e2e8f0', WATER = '#dbeafe', SOFT = '#475569';

function box(x, tx, ty, w, h, o = {}) {
  x.fillStyle = o.fill || '#f8fafc';
  x.fillRect(tx, ty, w, h);
  x.strokeStyle = o.stroke || '#e2e8f0';
  x.lineWidth = o.lw || 2;
  x.strokeRect(tx, ty, w, h);
}
function title2(x, s) { text(x, s, W / 2, 46, { size: 32, bold: true }); }
function sub2(x, s) { text(x, s, W / 2, 88, { size: 20, color: GREY }); }
function panel(x, tx, ty, w, h) { box(x, tx, ty, w, h, { fill: '#f8fafc', stroke: '#e2e8f0', lw: 2 }); }
function flame(x, cx, cy, s, col = ORANGE) {
  x.beginPath();
  x.moveTo(cx, cy + s);
  x.bezierCurveTo(cx - s * 1.1, cy + s * 0.25, cx - s * 0.55, cy - s * 0.45, cx, cy - s);
  x.bezierCurveTo(cx + s * 0.55, cy - s * 0.45, cx + s * 1.1, cy + s * 0.25, cx, cy + s);
  x.closePath(); x.fillStyle = col; x.fill();
}
function sunIcon(x, cx, cy, r, col = '#fbbf24', stroke = AMBER) {
  circle(x, cx, cy, r, { fill: col, stroke, lw: 3 });
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4;
    line(x, cx + (r + 8) * Math.cos(a), cy + (r + 8) * Math.sin(a), cx + (r + 16) * Math.cos(a), cy + (r + 16) * Math.sin(a), { color: stroke, lw: 3 });
  }
}
// Sinusoidal "wave" arrow from (x1,y1) to (x2,y2) with arrowhead at the end.
function wavy(x, x1, y1, x2, y2, o = {}) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const n = Math.max(6, Math.round(len / 22)), amp = o.amp || 9;
  const nx = -dy / len, ny = dx / len;
  x.beginPath(); x.moveTo(x1, y1);
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const off = Math.sin(t * Math.PI * (o.cycles || 2)) * amp;
    x.lineTo(x1 + dx * t + nx * off, y1 + dy * t + ny * off);
  }
  x.strokeStyle = o.color || RED; x.lineWidth = o.lw || 3.5; x.stroke();
  arrowHead(x, x1, y1, x2, y2, { color: o.color || RED, len: o.len || 14 });
}
// Elliptical arc with an arrowhead at the end angle.
function arcArrow(x, cx, cy, rx, ry, a0, a1, o = {}) {
  x.beginPath();
  x.ellipse(cx, cy, rx, ry, 0, a0, a1, !!o.ccw);
  x.strokeStyle = o.color || C.ink; x.lineWidth = o.lw || 4; x.stroke();
  const hx = cx + rx * Math.cos(a1), hy = cy + ry * Math.sin(a1);
  const tx = -ry * Math.sin(a1), ty = rx * Math.cos(a1);
  const m = Math.hypot(tx, ty) || 1, ux = tx / m, uy = ty / m, L = o.len || 16;
  x.beginPath();
  x.moveTo(hx, hy);
  x.lineTo(hx - L * (ux * 0.8 - uy * 0.6), hy - L * (uy * 0.8 + ux * 0.6));
  x.lineTo(hx - L * (ux * 0.8 + uy * 0.6), hy - L * (uy * 0.8 - ux * 0.6));
  x.closePath();
  x.fillStyle = o.color || C.ink; x.fill();
}
function panelHeader(x, px, pw, py, num, name) {
  circle(x, px + 52, py, 20, { fill: BLUE, stroke: false });
  text(x, String(num), px + 52, py + 1, { size: 22, bold: true, color: '#fff' });
  text(x, name, px + pw / 2 + 12, py, { size: 27, bold: true });
  line(x, px + 24, py + 32, px + pw - 24, py + 32, { color: LIGHT, lw: 2 });
}

// ---------- 1. Three methods overview ----------
function d_threeMethods() {
  const [c, x] = make(W, H);
  title2(x, 'Three ways heat energy can travel');
  sub2(x, 'a solid rod, a beaker of water and the empty space between us and the Sun');
  const pw = 430, gap = 34, x0 = 44, y0 = 130, ph = 880;
  [x0, x0 + pw + gap, x0 + 2 * (pw + gap)].forEach((px, i) => panel(x, px, y0, pw, ph));
  panelHeader(x, x0, pw, 180, 1, 'Conduction');
  panelHeader(x, x0 + pw + gap, pw, 180, 2, 'Convection');
  panelHeader(x, x0 + 2 * (pw + gap), pw, 180, 3, 'Radiation');

  // Conduction: heated rod
  const c1 = 259;
  flame(x, c1 - 120, 500, 26);
  box(x, c1 - 140, 530, 300, 38, { fill: LIGHT, stroke: C.ink, lw: 3 });
  for (let i = 0; i < 8; i++) {
    const px = c1 - 128 + i * 38;
    circle(x, px, 549, 12, { fill: '#94a3b8', stroke: '#475569', lw: 1.5 });
    if (i < 4) circle(x, px, 549, 20, { stroke: AMBER, lw: 2, dash: [5, 5] });
  }
  arrow(x, c1 - 140, 610, c1 + 150, 610, { lw: 4, color: BLUE });
  text(x, 'energy travels along the rod', c1, 655, { size: 19, color: SOFT });
  text(x, 'In a SOLID: strongly vibrating particles', c1, 890, { size: 19, color: SOFT });
  text(x, 'collide with their neighbours and pass', c1, 925, { size: 19, color: SOFT });
  text(x, 'the shaking along. Nothing moves place.', c1, 960, { size: 19, color: SOFT });

  // Convection: beaker
  const c2 = 723;
  box(x, c2 - 112, 330, 224, 346, { fill: WATER, stroke: false });
  x.strokeStyle = C.ink; x.lineWidth = 5;
  x.beginPath(); x.moveTo(c2 - 112, 330); x.lineTo(c2 - 112, 676); x.lineTo(c2 + 112, 676); x.lineTo(c2 + 112, 330); x.stroke();
  arrow(x, c2, 620, c2, 380, { lw: 5, color: RED });
  arrow(x, c2 - 72, 400, c2 - 72, 620, { lw: 4, color: BLUE });
  arrow(x, c2 + 72, 400, c2 + 72, 620, { lw: 4, color: BLUE });
  arrow(x, c2, 300, c2 - 60, 300, { lw: 4, color: BLUE });
  arrow(x, c2, 300, c2 + 60, 300, { lw: 4, color: BLUE });
  flame(x, c2, 730, 24);
  text(x, 'heat', c2, 785, { size: 18, color: GREY });
  text(x, 'In a LIQUID or GAS: the heated fluid', c2, 890, { size: 19, color: SOFT });
  text(x, 'expands, becomes less dense and rises;', c2, 925, { size: 19, color: SOFT });
  text(x, 'cooler fluid sinks to take its place.', c2, 960, { size: 19, color: SOFT });

  // Radiation: sun
  const c3 = 1187;
  sunIcon(x, c3, 430, 42);
  for (const a of [-Math.PI / 2, -Math.PI / 4, 0, Math.PI / 4, Math.PI / 2, Math.PI]) {
    wavy(x, c3 + 66 * Math.cos(a), 430 + 66 * Math.sin(a), c3 + 150 * Math.cos(a), 430 + 150 * Math.sin(a), { lw: 3.5 });
  }
  text(x, 'infrared waves — no particles involved', c3, 620, { size: 19, color: SOFT });
  text(x, 'Through EMPTY SPACE: infrared waves', c3, 890, { size: 19, color: SOFT });
  text(x, 'carry the energy in straight lines,', c3, 925, { size: 19, color: SOFT });
  text(x, 'even where there is no air at all.', c3, 960, { size: 19, color: SOFT });
  return [c, x];
}

// ---------- 2. Conduction particles ----------
function d_conductionParticles() {
  const [c, x] = make(W, H);
  title2(x, 'Conduction — energy passed along by vibrating particles');
  sub2(x, 'the particles stay where they are; the shaking travels from one to the next');

  box(x, 190, 470, 1060, 190, { fill: LIGHT, stroke: C.ink, lw: 4 });
  text(x, 'a metal rod', 1130, 440, { size: 18, color: GREY });
  for (let col = 0; col < 13; col++) {
    for (const ry of [510, 565, 620]) {
      const px = 240 + col * 80;
      circle(x, px, ry, 17, { fill: '#94a3b8', stroke: '#475569', lw: 1.5 });
      if (col < 3) circle(x, px, ry, 28, { stroke: AMBER, lw: 2.5, dash: [5, 5] });
      else if (col < 5) circle(x, px, ry, 23, { stroke: AMBER, lw: 2.5, dash: [5, 5] });
      else if (col < 7) circle(x, px, ry, 19, { stroke: AMBER, lw: 2, dash: [5, 5] });
    }
  }
  flame(x, 240, 700, 28);
  text(x, 'heat', 240, 775, { size: 18, color: GREY });

  // free electrons in the left third
  const ePos = [[270, 545, 25], [350, 590, 30], [430, 530, 28], [510, 620, 26], [300, 620, 30], [390, 545, 24]];
  for (const [ex, ey, dx] of ePos) {
    circle(x, ex, ey, 6, { fill: BLUE, stroke: false });
    arrow(x, ex + 10, ey, ex + 10 + dx, ey, { lw: 2.5, color: BLUE, len: 9 });
  }
  arrow(x, 820, 742, 820, 668, { lw: 3, color: SOFT });
  text(x, 'free electrons — in metals only — rush through', 820, 762, { size: 19, color: SOFT });
  text(x, 'the lattice carrying energy with them', 820, 792, { size: 19, color: SOFT });

  text(x, 'hot end — particles vibrate strongly', 300, 300, { size: 20, color: AMBER });
  arrow(x, 300, 318, 300, 440, { lw: 3, color: SOFT });
  text(x, 'cooler end — gentler vibration', 1150, 300, { size: 20, color: GREY });
  arrow(x, 1150, 318, 1150, 440, { lw: 3, color: SOFT });
  arrow(x, 330, 415, 1120, 415, { lw: 4, color: BLUE });
  text(x, 'the ENERGY travels along — not the particles', 724, 390, { size: 19, color: BLUE });

  text(x, 'Dashed rings show how big the vibration is at each point along the rod.', 724, 900, { size: 19, color: GREY });
  return [c, x];
}

// ---------- 3. Wax-and-rod test ----------
function d_conductionExperiment() {
  const [c, x] = make(W, H);
  title2(x, 'The wax-and-rod test — ranking conductors');
  sub2(x, 'identical rods dipped in hot water: the best conductor melts its wax first');

  text(x, 'hot water bath', 230, 235, { size: 19, color: GREY });
  box(x, 120, 260, 220, 470, { fill: WATER, stroke: C.ink, lw: 4 });
  text(x, 'hot water', 230, 305, { size: 20, bold: true, color: BLUE });
  flame(x, 230, 775, 26);
  text(x, 'heat', 230, 835, { size: 18, color: GREY });

  const rods = [
    { name: 'copper', fill: '#b45309', cy: 330, res: 'pin drops 1st' },
    { name: 'aluminium', fill: '#94a3b8', cy: 450, res: 'pin drops 2nd' },
    { name: 'steel', fill: '#475569', cy: 570, res: 'pin drops 3rd' },
    { name: 'wood', fill: '#92400e', cy: 690, res: 'pin never drops' },
  ];
  for (const r of rods) {
    box(x, 180, r.cy - 13, 970, 26, { fill: r.fill, stroke: C.ink, lw: 2 });
    text(x, r.name, 385, r.cy + 1, { size: 18, bold: true, color: '#fff', align: 'left' });
    circle(x, 1178, r.cy, 20, { fill: '#fde68a', stroke: '#d97706', lw: 3 });
    line(x, 1178, r.cy + 20, 1178, r.cy + 72, { color: C.ink, lw: 3 });
    circle(x, 1178, r.cy + 78, 6, { fill: C.ink, stroke: false });
    text(x, 'wax + pin', 1178, r.cy - 32, { size: 16, color: GREY });
    text(x, r.res, 1215, r.cy + 1, { size: 18, align: 'left', color: SOFT });
  }
  text(x, 'wax melts and the pin falls — the faster the heat travels along the rod, the sooner it happens', 724, 240, { size: 18, color: GREY });

  box(x, 120, 880, 640, 130, { fill: '#eff6ff', stroke: '#bfdbfe', lw: 2 });
  text(x, 'Good conductors — heat passes quickly', 440, 925, { size: 21, bold: true, color: BLUE });
  text(x, 'metals: copper, aluminium, steel — used for pans and radiators', 440, 975, { size: 19, color: SOFT });
  box(x, 790, 880, 538, 130, { fill: '#fffbeb', stroke: '#fde68a', lw: 2 });
  text(x, 'Insulators — heat passes slowly', 1059, 925, { size: 21, bold: true, color: AMBER });
  text(x, 'wood, plastic, glass, wool, trapped air', 1059, 975, { size: 19, color: SOFT });
  return [c, x];
}

// ---------- 4. Convection current ----------
function d_convectionCurrent() {
  const [c, x] = make(W, H);
  title2(x, 'A convection current made visible');
  sub2(x, 'a purple crystal shows the heated water rising, cooling and sinking');

  box(x, 528, 280, 404, 592, { fill: WATER, stroke: false });
  x.strokeStyle = C.ink; x.lineWidth = 6;
  x.beginPath(); x.moveTo(520, 240); x.lineTo(520, 880); x.lineTo(940, 880); x.lineTo(940, 240); x.stroke();

  x.globalAlpha = 0.55;
  x.strokeStyle = '#8b5cf6'; x.lineWidth = 16;
  x.beginPath(); x.moveTo(730, 840);
  for (let i = 1; i <= 24; i++) {
    const t = i / 24;
    x.lineTo(730 + Math.sin(t * Math.PI * 3) * 12, 840 - t * 455);
  }
  x.stroke();
  x.globalAlpha = 1;
  x.fillStyle = '#6b21a8';
  x.beginPath(); x.ellipse(730, 846, 26, 14, 0, 0, Math.PI * 2); x.fill();

  arrow(x, 730, 800, 730, 420, { lw: 5, color: RED });
  arrow(x, 595, 460, 595, 810, { lw: 4, color: BLUE });
  arrow(x, 865, 460, 865, 810, { lw: 4, color: BLUE });
  arrow(x, 730, 305, 625, 305, { lw: 4, color: BLUE });
  arrow(x, 730, 305, 835, 305, { lw: 4, color: BLUE });

  flame(x, 730, 935, 26);
  text(x, 'heat', 730, 1000, { size: 18, color: GREY });

  text(x, 'hot water expands —', 420, 430, { size: 20, color: RED, align: 'right' });
  text(x, 'less dense — RISES', 420, 462, { size: 20, color: RED, align: 'right' });
  arrow(x, 430, 475, 690, 500, { lw: 3, color: RED });
  text(x, 'cooler water —', 1050, 430, { size: 20, color: BLUE, align: 'left' });
  text(x, 'denser — SINKS', 1050, 462, { size: 20, color: BLUE, align: 'left' });
  arrow(x, 1040, 475, 890, 500, { lw: 3, color: BLUE });
  text(x, 'a potassium permanganate crystal colours the rising stream', 724, 1050, { size: 18, color: GREY });
  return [c, x];
}

// ---------- 5. Convection examples ----------
function d_convectionExamples() {
  const [c, x] = make(W, H);
  title2(x, 'Convection currents all around us');
  sub2(x, 'the same loop — rise, spread, cool, sink — at the seaside and in your living room');
  panel(x, 44, 130, 670, 880);
  panel(x, 734, 130, 670, 880);
  text(x, 'A sea breeze on a warm day', 379, 180, { size: 24, bold: true });
  line(x, 74, 210, 684, 210, { color: LIGHT, lw: 2 });
  text(x, 'A radiator warms the whole room', 1069, 180, { size: 24, bold: true });
  line(x, 764, 210, 1374, 210, { color: LIGHT, lw: 2 });

  // sea breeze
  box(x, 64, 700, 200, 290, { fill: '#93c5fd', stroke: C.ink, lw: 3 });
  box(x, 264, 680, 430, 310, { fill: '#d6a96a', stroke: C.ink, lw: 3 });
  text(x, 'sea', 164, 940, { size: 20, bold: true, color: BLUE });
  text(x, 'land', 479, 940, { size: 20, bold: true, color: SOFT });
  sunIcon(x, 600, 320, 26);
  arrow(x, 450, 660, 450, 450, { lw: 4, color: RED });
  arrow(x, 540, 660, 540, 450, { lw: 4, color: RED });
  arrow(x, 130, 658, 420, 658, { lw: 4, color: BLUE });
  text(x, 'the land warms faster than the sea', 380, 250, { size: 19, color: SOFT });
  text(x, 'cool sea air flows inland', 240, 615, { size: 19, color: BLUE });
  text(x, 'warm air rises', 495, 395, { size: 19, color: RED });
  text(x, 'over the land', 495, 422, { size: 19, color: RED });

  // room with radiator
  line(x, 774, 260, 1354, 260, { color: C.ink, lw: 4 });
  line(x, 774, 940, 1354, 940, { color: C.ink, lw: 4 });
  line(x, 774, 260, 774, 940, { color: C.ink, lw: 4 });
  line(x, 1354, 260, 1354, 940, { color: C.ink, lw: 4 });
  box(x, 1250, 320, 80, 120, { fill: '#bfdbfe', stroke: C.ink, lw: 3 });
  line(x, 1290, 320, 1290, 440, { color: C.ink, lw: 2 });
  line(x, 1250, 380, 1330, 380, { color: C.ink, lw: 2 });
  box(x, 830, 800, 150, 120, { fill: '#fecaca', stroke: C.ink, lw: 3 });
  for (let fx = 846; fx <= 964; fx += 13) line(x, fx, 806, fx, 914, { color: '#ef4444', lw: 2 });
  arrow(x, 905, 770, 905, 470, { lw: 4, color: RED });
  arrow(x, 950, 300, 1320, 300, { lw: 4, color: RED });
  arrow(x, 1330, 330, 1330, 880, { lw: 4, color: RED });
  arrow(x, 1300, 900, 960, 900, { lw: 4, color: BLUE });
  text(x, 'spreads across the ceiling, cools and sinks', 1064, 232, { size: 18, color: SOFT });
  text(x, 'warm air rises', 950, 430, { size: 19, color: RED, align: 'left' });
  text(x, 'above the radiator', 950, 458, { size: 19, color: RED, align: 'left' });
  text(x, 'cool air returns along the floor', 1064, 975, { size: 19, color: BLUE });
  return [c, x];
}

// ---------- 6. Radiation emission ----------
function d_radiationEmission() {
  const [c, x] = make(W, H);
  title2(x, 'Radiation — heat that needs no particles');
  sub2(x, 'every object gives out infrared waves — the hotter it is, the more it gives out');
  panel(x, 44, 130, 670, 700);
  panel(x, 734, 130, 670, 700);
  text(x, 'A hot object radiates in all directions', 379, 180, { size: 23, bold: true });
  line(x, 74, 210, 684, 210, { color: LIGHT, lw: 2 });
  text(x, 'Across the vacuum of space', 1069, 180, { size: 23, bold: true });
  line(x, 764, 210, 1374, 210, { color: LIGHT, lw: 2 });

  circle(x, 379, 470, 70, { fill: '#ea580c', stroke: '#9a3412', lw: 4 });
  text(x, 'HOT', 379, 471, { size: 22, bold: true, color: '#fff' });
  for (let i = 0; i < 8; i++) {
    const a = i * Math.PI / 4 + Math.PI / 8;
    wavy(x, 379 + 86 * Math.cos(a), 470 + 86 * Math.sin(a), 379 + 160 * Math.cos(a), 470 + 160 * Math.sin(a), { lw: 3.5, amp: 7 });
  }
  text(x, 'infrared radiation', 379, 700, { size: 20, bold: true, color: SOFT });
  text(x, 'the hotter the object, the more it emits', 379, 740, { size: 19, color: GREY });

  box(x, 764, 230, 610, 450, { fill: '#0f172a', stroke: C.ink, lw: 3 });
  text(x, 'empty space — no air at all', 1069, 265, { size: 18, color: '#e2e8f0' });
  sunIcon(x, 880, 455, 52);
  circle(x, 1280, 455, 34, { fill: '#3b82f6', stroke: '#1e40af', lw: 3 });
  x.fillStyle = '#4ade80';
  x.beginPath(); x.ellipse(1270, 445, 14, 9, 0.5, 0, Math.PI * 2); x.fill();
  x.beginPath(); x.ellipse(1292, 468, 10, 7, -0.4, 0, Math.PI * 2); x.fill();
  wavy(x, 948, 425, 1235, 425, { lw: 3.5, color: '#f87171', amp: 8 });
  wavy(x, 948, 455, 1235, 455, { lw: 3.5, color: '#f87171', amp: 8 });
  wavy(x, 948, 485, 1235, 485, { lw: 3.5, color: '#f87171', amp: 8 });
  text(x, 'the Sun\u2019s heat crosses empty space at the speed of light', 1069, 760, { size: 19, color: SOFT });
  text(x, '\u2014 300 000 km every second', 1069, 795, { size: 19, color: SOFT });

  const facts = [
    ['No medium needed', 'it even crosses a vacuum'],
    ['Travels in straight lines', 'it can be reflected like light'],
    ['Emitted by every object', 'hotter objects emit more — always'],
  ];
  facts.forEach(([h, s], i) => {
    const fx = 64 + i * 450;
    box(x, fx, 880, 420, 130, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    text(x, h, fx + 210, 925, { size: 21, bold: true, color: BLUE });
    text(x, s, fx + 210, 975, { size: 18, color: SOFT });
  });
  return [c, x];
}

// ---------- 7. Surfaces: dull black vs shiny silver ----------
function d_radiationSurfaces() {
  const [c, x] = make(W, H);
  title2(x, 'Dull black beats shiny silver');
  sub2(x, 'dark, matt surfaces absorb and give out radiation best; shiny ones reflect it');

  function can(cx, fill, stroke, shiny) {
    x.fillStyle = fill; x.strokeStyle = stroke; x.lineWidth = 3;
    x.beginPath(); x.ellipse(cx, 680, 110, 28, 0, 0, Math.PI * 2); x.fill(); x.stroke();
    x.fillRect(cx - 110, 380, 220, 300); x.strokeRect(cx - 110, 380, 220, 300);
    x.beginPath(); x.ellipse(cx, 380, 110, 28, 0, 0, Math.PI * 2);
    x.fillStyle = '#fff'; x.fill(); x.stroke();
    if (shiny) {
      x.strokeStyle = '#fff'; x.lineWidth = 4;
      x.beginPath(); x.moveTo(cx - 70, 620); x.lineTo(cx - 20, 450); x.stroke();
      x.beginPath(); x.moveTo(cx - 45, 625); x.lineTo(cx - 10, 500); x.stroke();
    }
    // thermometer
    box(x, cx - 9, 300, 18, 88, { fill: '#fff', stroke: C.ink, lw: 2 });
    box(x, cx - 4, 348, 8, 34, { fill: '#dc2626', stroke: false });
    text(x, 'hot water inside', cx, 430, { size: 17, color: shiny ? SOFT : '#e2e8f0' });
  }
  can(420, '#1f2937', C.ink, false);
  can(1030, LIGHT, '#94a3b8', true);

  for (const off of [-26, 0, 26]) {
    wavy(x, 420 - 160 + off, 285, 420 - 50, 350, { lw: 3, amp: 6 });
  }
  for (const off of [-26, 0, 26]) {
    wavy(x, 1030 - 160 + off, 285, 1030 - 50, 350, { lw: 3, amp: 6 });
    wavy(x, 1030 - 40, 352, 1030 + 55, 268, { lw: 3, amp: 6, color: AMBER });
  }
  text(x, 'absorbed — the can warms quickly', 420, 240, { size: 19, color: SOFT });
  text(x, 'reflected — the can stays cooler', 1030, 240, { size: 19, color: SOFT });

  text(x, 'DULL BLACK', 420, 745, { size: 22, bold: true });
  text(x, 'best absorber \u2014 and the best emitter', 420, 787, { size: 19, color: SOFT });
  text(x, 'SHINY SILVER', 1030, 745, { size: 22, bold: true });
  text(x, 'poor absorber (reflects) \u2014 poor emitter', 1030, 787, { size: 19, color: SOFT });

  box(x, 44, 830, 1360, 190, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
  text(x, 'Two experiments, one pattern', 724, 870, { size: 22, bold: true, color: BLUE });
  text(x, 'Hot water in both cans: the black can cools FASTER \u2014 it emits radiation better.', 724, 925, { size: 20, color: SOFT });
  text(x, 'Both cans left in sunshine: the black can warms FASTER \u2014 it absorbs radiation better.', 724, 970, { size: 20, color: SOFT });
  return [c, x];
}

// ---------- 8. Home insulation ----------
function d_homeInsulation() {
  const [c, x] = make(W, H);
  title2(x, 'Keeping the heat inside a house');
  sub2(x, 'every route that heat could take has a matching way to slow it down');

  // roof
  x.fillStyle = '#e7e5e4'; x.strokeStyle = C.ink; x.lineWidth = 5;
  x.beginPath(); x.moveTo(444, 480); x.lineTo(724, 300); x.lineTo(1004, 480); x.closePath(); x.fill(); x.stroke();
  // loft insulation band
  box(x, 504, 468, 440, 36, { fill: '#fbbf24', stroke: '#d97706', lw: 2 });
  x.strokeStyle = '#d97706'; x.lineWidth = 2;
  for (let i = 0; i < 11; i++) {
    x.beginPath(); x.arc(530 + i * 40, 504, 11, Math.PI, 0); x.stroke();
  }
  // walls (cavity strips with beads)
  for (const wx of [474, 948]) {
    box(x, wx, 480, 26, 420, { fill: '#d6d3d1', stroke: C.ink, lw: 3 });
    x.fillStyle = '#a8a29e';
    [[8, 60], [16, 130], [6, 200], [18, 270], [10, 340], [14, 400]].forEach(([dx, dy]) => {
      x.beginPath(); x.arc(wx + dx, 500 + dy, 3, 0, Math.PI * 2); x.fill();
    });
  }
  // floor and carpet
  line(x, 474, 900, 974, 900, { color: C.ink, lw: 5 });
  box(x, 500, 888, 420, 14, { fill: '#b45309', stroke: false });
  // double glazing on the left wall
  box(x, 478, 560, 9, 90, { fill: '#bfdbfe', stroke: BLUE, lw: 1.5 });
  box(x, 491, 560, 9, 90, { fill: '#bfdbfe', stroke: BLUE, lw: 1.5 });
  // curtain on the right wall
  box(x, 952, 540, 20, 160, { fill: '#93c5fd', stroke: '#3b82f6', lw: 2 });
  // radiator + foil panel
  box(x, 548, 770, 8, 130, { fill: '#cbd5e1', stroke: '#94a3b8', lw: 2 });
  box(x, 560, 790, 80, 100, { fill: '#fecaca', stroke: C.ink, lw: 3 });
  for (let fx = 570; fx <= 634; fx += 11) line(x, fx, 796, fx, 884, { color: '#ef4444', lw: 2 });
  // draught excluder under the door
  box(x, 946, 894, 28, 8, { fill: '#475569', stroke: false });

  const lab = (lx, ly, s, tx2, ty2, align) => {
    text(x, s, lx, ly, { size: 19, align: align || 'left', color: SOFT });
    arrow(x, align === 'right' ? lx + 8 : lx - 8, ly + 6, tx2, ty2, { lw: 2.5, color: GREY, len: 10 });
  };
  lab(400, 360, 'loft insulation \u2014 traps air in wool', 530, 462, 'right');
  lab(400, 585, 'double glazing \u2014 sealed air gap', 484, 600, 'right');
  lab(400, 700, 'foil panel reflects radiation', 552, 725, 'right');
  lab(400, 850, 'carpet on the floor', 570, 888, 'right');
  lab(1050, 585, 'cavity wall insulation \u2014 foam or beads', 976, 600);
  lab(1050, 700, 'thick curtains trap a layer of air', 958, 655);
  lab(1050, 850, 'draught excluder strip under the door', 960, 896);

  box(x, 44, 930, 1360, 120, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
  text(x, 'Where the heat goes from an uninsulated house:', 724, 968, { size: 20, bold: true, color: BLUE });
  text(x, 'walls about 35% \u00b7 roof about 25% \u00b7 draughts about 15% \u00b7 windows about 10% \u00b7 floors about 10% (illustrative figures)', 724, 1012, { size: 19, color: SOFT });
  return [c, x];
}

// ---------- 9. Vacuum flask ----------
function d_vacuumFlask() {
  const [c, x] = make(W, H);
  title2(x, 'The vacuum flask \u2014 all three methods, defeated');
  sub2(x, 'every feature exists to slow one particular route of heat transfer');

  // case
  box(x, 460, 300, 200, 560, { fill: '#f1f5f9', stroke: C.ink, lw: 5 });
  // silvered inner vessel
  box(x, 498, 338, 124, 486, { fill: '#fff', stroke: '#cbd5e1', lw: 8 });
  box(x, 502, 342, 116, 478, { fill: '#fff', stroke: '#94a3b8', lw: 3 });
  // drink
  box(x, 512, 520, 96, 292, { fill: '#93c5fd', stroke: false });
  text(x, 'drink', 560, 668, { size: 18, color: '#1d4ed8' });
  // vacuum label letters down the left gap
  'VACUUM'.split('').forEach((ch, i) => {
    text(x, ch, 479, 430 + i * 34, { size: 16, color: '#64748b' });
  });
  text(x, 'VACUUM', 641, 560, { size: 14, color: '#64748b' });
  // stopper
  box(x, 532, 258, 56, 54, { fill: '#d97706', stroke: '#92400e', lw: 3 });
  circle(x, 560, 248, 14, { fill: '#d97706', stroke: '#92400e', lw: 3 });

  const note = (y, l1, l2, tx2, ty2) => {
    text(x, l1, 760, y, { size: 20, align: 'left', color: SOFT });
    text(x, l2, 760, y + 30, { size: 20, align: 'left', color: SOFT });
    arrow(x, 745, y + 4, tx2, ty2, { lw: 2.5, color: GREY, len: 10 });
  };
  note(310, 'stopper \u2014 a poor conductor, and it blocks', 'convection and evaporation from the top', 588, 285);
  note(440, 'silvered surfaces \u2014 reflect infrared,', 'so almost no radiation crosses the gap', 626, 445);
  note(610, 'vacuum between the walls \u2014 no particles', 'means no conduction and no convection', 664, 615);
  note(790, 'insulating case and plastic stand \u2014', 'almost no conduction down to the table', 614, 830);

  box(x, 100, 920, 1248, 120, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
  text(x, 'Slowing heat transfer works BOTH ways', 724, 958, { size: 21, bold: true, color: BLUE });
  text(x, 'a flask keeps hot drinks hot and cold drinks cold \u2014 it simply slows energy moving either way', 724, 1005, { size: 19, color: SOFT });
  return [c, x];
}

const DIAGRAMS = [
  { name: 'sas-phys-heat-three-methods.png', render: d_threeMethods },
  { name: 'sas-phys-conduction-particles.png', render: d_conductionParticles },
  { name: 'sas-phys-conduction-experiment.png', render: d_conductionExperiment },
  { name: 'sas-phys-convection-current.png', render: d_convectionCurrent },
  { name: 'sas-phys-convection-examples.png', render: d_convectionExamples },
  { name: 'sas-phys-radiation-emission.png', render: d_radiationEmission },
  { name: 'sas-phys-radiation-surfaces.png', render: d_radiationSurfaces },
  { name: 'sas-phys-home-insulation.png', render: d_homeInsulation },
  { name: 'sas-phys-vacuum-flask.png', render: d_vacuumFlask },
];

async function audit(name) {
  const img = await loadImage(path.join(DIR, name));
  const [c, x] = make(img.width, img.height);
  x.drawImage(img, 0, 0);
  const bad = [];
  const check = (px, py) => {
    const d = x.getImageData(px, py, 1, 1).data;
    if (d[0] < 248 || d[1] < 248 || d[2] < 248) bad.push([px, py]);
  };
  for (let i = 0; i < img.width; i += 3) { check(i, 0); check(i, img.height - 1); }
  for (let j = 0; j < img.height; j += 3) { check(0, j); check(img.width - 1, j); }
  return { name, w: img.width, h: img.height, edgeViolations: bad.length, sample: bad.slice(0, 5) };
}

async function run() {
  fs.mkdirSync(DIR, { recursive: true });
  const saved = [];
  for (const d of DIAGRAMS) {
    const [c] = d.render();
    save(c, d.name, DIR);
    saved.push(d.name);
  }
  const audits = [];
  for (const n of saved) audits.push(await audit(n));
  return { saved, audits };
}

module.exports = { run };