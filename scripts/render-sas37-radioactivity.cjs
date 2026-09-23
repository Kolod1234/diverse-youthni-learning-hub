/*
 * Renders the eight Single Award Science lesson 3.7 (Radioactivity) diagrams as PNGs.
 * Style matches the existing sas-physics diagrams (scripts/render-sas35-heat.cjs).
 */
const K = require('./sas-chem/common.cjs');
const fs = require('fs');
const path = require('path');
const { make, save, text, circle, line, arrow, arrowHead, C } = K;

const W = 1448, H = 1086;
const DIR = path.resolve(__dirname, '../public/lesson-assets/sas-physics');
const AMBER = '#b45309', BLUE = '#1d4ed8', RED = '#dc2626', ORANGE = '#ea580c',
      GREY = '#64748b', LIGHT = '#e2e8f0', SOFT = '#475569', GREEN = '#15803d';

function box(x, tx, ty, w, h, o = {}) {
  x.fillStyle = o.fill || '#f8fafc';
  x.fillRect(tx, ty, w, h);
  x.strokeStyle = o.stroke || '#e2e8f0';
  x.lineWidth = o.lw || 2;
  x.strokeRect(tx, ty, w, h);
}
function title2(x, s) { text(x, s, W / 2, 46, { size: 32, bold: true }); }
function sub2(x, s, py) { text(x, s, W / 2, py || 88, { size: 20, color: GREY }); }
function panel(x, tx, ty, w, h) { box(x, tx, ty, w, h, { fill: '#f8fafc', stroke: '#e2e8f0', lw: 2 }); }
function panelHeader(x, px, pw, py, num, name) {
  circle(x, px + 52, py, 20, { fill: BLUE, stroke: false });
  text(x, String(num), px + 52, py + 1, { size: 22, bold: true, color: '#fff' });
  text(x, name, px + pw / 2 + 12, py, { size: 27, bold: true });
  line(x, px + 24, py + 32, px + pw - 24, py + 32, { color: LIGHT, lw: 2 });
}
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
  x.strokeStyle = o.color || RED; x.lineWidth = o.lw || 3.5;
  if (o.dash) x.setLineDash(o.dash);
  x.stroke(); x.setLineDash([]);
  if (!o.noHead) arrowHead(x, x1, y1, x2, y2, { color: o.color || RED, len: o.len || 14 });
}
// cluster of protons (red) and neutrons (grey) around a centre
function nucleus(x, cx, cy, p, n, r = 13, spread = 26) {
  const total = p + n, pos = [];
  for (let i = 0; i < total; i++) {
    const a = i * 2.399963, rr = spread * Math.sqrt((i + 0.5) / total);
    pos.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a) * 0.85]);
  }
  for (let i = 0; i < p; i++) circle(x, pos[i][0], pos[i][1], r, { fill: '#fca5a5', stroke: '#b91c1c', lw: 2 });
  for (let i = p; i < total; i++) circle(x, pos[i][0], pos[i][1], r, { fill: '#e2e8f0', stroke: '#64748b', lw: 2 });
}
function pLabel(x, cx, cy) { text(x, '+', cx, cy, { size: 18, bold: true, color: '#7f1d1d' }); }
function nLabel(x, cx, cy) { text(x, '0', cx, cy, { size: 14, bold: true, color: '#334155' }); }

// ---------- 1. Structure of the atom ----------
function d_atom() {
  const [c, x] = make(W, H);
  title2(x, 'Inside the atom');
  sub2(x, 'the nucleus holds the protons and neutrons; the electrons orbit in shells around it');
  // left: the atom
  panel(x, 44, 130, 680, 880);
  const cx = 384, cy = 560;
  circle(x, cx, cy, 250, { stroke: GREY, lw: 3 });
  circle(x, cx, cy, 170, { stroke: GREY, lw: 3 });
  nucleus(x, cx, cy, 6, 6, 17, 34);
  const e1 = [[cx - 170, cy], [cx + 170, cy]];
  e1.forEach(p => { circle(x, p[0], p[1], 13, { fill: '#bfdbfe', stroke: BLUE, lw: 2.5 }); text(x, '\u2212', p[0], p[1] + 1, { size: 17, bold: true, color: '#1e3a8a' }); });
  const e2 = [[cx, cy - 250], [cx, cy + 250], [cx - 250 * Math.cos(0.7), cy - 250 * Math.sin(0.7)], [cx + 250 * Math.cos(0.7), cy + 250 * Math.sin(0.7)]];
  e2.slice(0, 4).forEach(p => { circle(x, p[0], p[1], 13, { fill: '#bfdbfe', stroke: BLUE, lw: 2.5 }); text(x, '\u2212', p[0], p[1] + 1, { size: 17, bold: true, color: '#1e3a8a' }); });
  text(x, 'nucleus: protons + neutrons', 384, 700, { size: 20, color: SOFT });
  text(x, 'electrons in shells', 384, 250, { size: 20, color: SOFT });
  text(x, '(a scale drawing would make the nucleus', 384, 840, { size: 18, color: GREY });
  text(x, 'far too small to see \u2014 atoms are mostly empty space)', 384, 870, { size: 18, color: GREY });
  // right: particles table + notation
  panel(x, 772, 130, 632, 470);
  text(x, 'The three particles', 1088, 180, { size: 26, bold: true });
  const rows = [
    ['proton', '+1 charge, heavy', 'in the nucleus'],
    ['neutron', 'no charge, heavy', 'in the nucleus'],
    ['electron', '\u22121 charge, tiny', 'in the shells'],
  ];
  rows.forEach((r, i) => {
    const py = 250 + i * 110;
    box(x, 800, py, 576, 92, { fill: '#ffffff', stroke: LIGHT, lw: 2 });
    text(x, r[0], 880, py + 46, { size: 23, bold: true });
    text(x, r[1], 1090, py + 34, { size: 20, color: SOFT });
    text(x, r[2], 1090, py + 64, { size: 20, color: SOFT });
    const icon = { proton: ['#fca5a5', '#b91c1c', '+'], neutron: ['#e2e8f0', '#64748b', '0'], electron: ['#bfdbfe', '#1d4ed8', '\u2212'] }[r[0]];
    circle(x, 830, py + 46, 15, { fill: icon[0], stroke: icon[1], lw: 2.5 });
    text(x, icon[2], 830, py + 47, { size: 18, bold: true, color: icon[1] === '#b91c1c' ? '#7f1d1d' : (icon[1] === '#1d4ed8' ? '#1e3a8a' : '#334155') });
  });
  // notation card
  panel(x, 772, 640, 632, 370);
  text(x, 'Reading a nuclear symbol', 1088, 690, { size: 26, bold: true });
  text(x, '12', 880, 760, { size: 44, bold: true, color: AMBER });
  text(x, '6', 880, 830, { size: 44, bold: true, color: BLUE });
  text(x, 'C', 950, 795, { size: 54, bold: true });
  text(x, 'mass number = protons + neutrons', 1110, 760, { size: 20, color: AMBER, align: 'left' });
  text(x, 'atomic number = number of protons', 1110, 830, { size: 20, color: BLUE, align: 'left' });
  text(x, 'number of neutrons = mass number \u2212 atomic number', 1110, 900, { size: 20, color: SOFT, align: 'left' });
  text(x, '(in this example: 12 \u2212 6 = 6 neutrons)', 1110, 935, { size: 19, color: GREY, align: 'left' });
  save(c, 'sas-phys-atom-structure.png', DIR);
}

// ---------- 2. Isotopes ----------
function d_isotopes() {
  const [c, x] = make(1448, 900);
  title2(x, 'Isotopes: same element, different neutrons');
  sub2(x, 'the proton number decides the element \u2014 change the neutrons and you change the isotope');
  // carbon-12
  panel(x, 44, 130, 660, 660);
  const c1 = 300, cy = 440;
  circle(x, c1, cy, 190, { stroke: GREY, lw: 3 });
  nucleus(x, c1, cy, 6, 6, 14, 26);
  const e1 = [[c1 - 190, cy], [c1 + 190, cy]];
  e1.forEach(p => { circle(x, p[0], p[1], 11, { fill: '#bfdbfe', stroke: BLUE, lw: 2 }); });
  text(x, 'carbon-12', c1, 700, { size: 28, bold: true });
  text(x, '6 protons, 6 neutrons, 6 electrons', c1, 740, { size: 20, color: SOFT });
  text(x, 'stable \u2014 the nucleus keeps itself together', c1, 775, { size: 19, color: GREEN, bold: true });
  // carbon-14
  const c2 = 1030;
  panel(x, 744, 130, 660, 660);
  circle(x, c2, cy, 190, { stroke: GREY, lw: 3 });
  nucleus(x, c2, cy, 6, 8, 14, 28);
  const e2 = [[c2 - 190, cy], [c2 + 190, cy]];
  e2.forEach(p => { circle(x, p[0], p[1], 11, { fill: '#bfdbfe', stroke: BLUE, lw: 2 }); });
  text(x, 'carbon-14', c2, 700, { size: 28, bold: true });
  text(x, '6 protons, 8 neutrons, 6 electrons', c2, 740, { size: 20, color: SOFT });
  text(x, 'unstable \u2014 it is radioactive and decays', c2, 775, { size: 19, color: RED, bold: true });
  text(x, 'Same element: both atoms have exactly 6 protons \u2014 but carbon-14 carries two extra neutrons, unbalancing the nucleus.', 724, 850, { size: 21, color: C.ink });
  save(c, 'sas-phys-isotopes.png', DIR);
}

// ---------- 3. The three radiations ----------
function d_types() {
  const [c, x] = make(W, H);
  title2(x, 'Alpha, beta and gamma');
  sub2(x, 'an unstable nucleus can throw out three very different things on its way to becoming stable');
  const pw = 430, gap = 34, x0 = 44, y0 = 130, ph = 880;
  [x0, x0 + pw + gap, x0 + 2 * (pw + gap)].forEach((px, i) => panel(x, px, y0, pw, ph));
  panelHeader(x, x0, pw, 180, 1, 'Alpha (\u03b1)');
  panelHeader(x, x0 + pw + gap, pw, 180, 2, 'Beta (\u03b2)');
  panelHeader(x, x0 + 2 * (pw + gap), pw, 180, 3, 'Gamma (\u03b3)');
  // alpha
  const c1 = 259;
  circle(x, c1 - 30, 380, 26, { fill: '#fca5a5', stroke: '#b91c1c', lw: 3 });
  circle(x, c1 + 30, 380, 26, { fill: '#fca5a5', stroke: '#b91c1c', lw: 3 });
  circle(x, c1, 428, 26, { fill: '#e2e8f0', stroke: '#64748b', lw: 3 });
  circle(x, c1, 332, 26, { fill: '#e2e8f0', stroke: '#64748b', lw: 3 });
  text(x, '+', c1 - 30, 381, { size: 26, bold: true, color: '#7f1d1d' });
  text(x, '+', c1 + 30, 381, { size: 26, bold: true, color: '#7f1d1d' });
  const aTxt = [
    'a helium nucleus:', '2 protons + 2 neutrons',
    'charge: +2', 'heavy and slow',
    'the most ionising', 'of the three',
  ];
  aTxt.forEach((s, i) => text(x, s, c1, 520 + i * 40, { size: 20, color: i > 3 ? C.ink : SOFT, bold: i > 3 }));
  text(x, 'given out by the largest,', c1, 810, { size: 19, color: GREY });
  text(x, 'heaviest unstable nuclei', c1, 842, { size: 19, color: GREY });
  // beta
  const c2 = 723;
  circle(x, c2, 380, 22, { fill: '#bfdbfe', stroke: BLUE, lw: 3 });
  text(x, '\u2212', c2, 382, { size: 26, bold: true, color: '#1e3a8a' });
  arrow(x, c2 - 60, 460, c2 + 90, 340, { color: BLUE, lw: 4 });
  const bTxt = [
    'a fast electron thrown', 'out of the nucleus',
    'charge: \u22121', 'almost no mass',
    'medium ionising power', 'travels a metre or so in air',
  ];
  bTxt.forEach((s, i) => text(x, s, c2, 520 + i * 40, { size: 20, color: i > 3 ? C.ink : SOFT, bold: i === 4 }));
  text(x, 'made when a neutron', c2, 810, { size: 19, color: GREY });
  text(x, 'suddenly turns into a proton', c2, 842, { size: 19, color: GREY });
  // gamma
  const c3 = 1187;
  wavy(x, c3 - 110, 420, c3 + 110, 340, { color: RED, lw: 5, amp: 16, cycles: 3 });
  const gTxt = [
    'not a particle at all \u2014', 'an electromagnetic wave',
    'no charge and no mass', 'the highest frequency',
    'the least ionising', 'but by far the most penetrating',
  ];
  gTxt.forEach((s, i) => text(x, s, c3, 520 + i * 40, { size: 20, color: i > 3 ? C.ink : SOFT, bold: i === 5 }));
  text(x, 'just surplus energy leaving', c3, 810, { size: 19, color: GREY });
  text(x, 'an excited nucleus', c3, 842, { size: 19, color: GREY });
  save(c, 'sas-phys-radiation-types.png', DIR);
}

// ---------- 4. Penetrating power ----------
function d_penetration() {
  const [c, x] = make(W, H);
  title2(x, 'How far can each radiation get?');
  sub2(x, 'the absorber that stops the beam identifies the radiation \u2014 this is how we tell them apart');
  const lanes = [
    ['Alpha (\u03b1)', 'stopped by a single sheet of paper \u2014 or a few centimetres of air', 'paper'],
    ['Beta (\u03b2)', 'passes paper easily, stopped by a few millimetres of aluminium', 'aluminium'],
    ['Gamma (\u03b3)', 'only thick lead or concrete absorbs most of it \u2014 some always gets through', 'lead'],
  ];
  lanes.forEach((ln, i) => {
    const ly = 190 + i * 240;
    text(x, ln[0], 120, ly + 10, { size: 25, bold: true, align: 'left' });
    // source
    box(x, 210, ly - 26, 90, 52, { fill: AMBER, stroke: '#78350f', lw: 3 });
    text(x, 'source', 255, ly, { size: 17, color: '#fff' });
    // absorber
    const ax = 900, aw = i === 0 ? 14 : i === 1 ? 34 : 90;
    const afill = i === 0 ? '#f5f0e6' : i === 1 ? '#d1d5db' : '#475569';
    box(x, ax, ly - 90, aw, 180, { fill: afill, stroke: C.ink, lw: 3 });
    text(x, ln[2], ax + aw / 2, ly + 125, { size: 18, bold: true, color: SOFT });
    // beam
    if (i === 0) {
      for (let k = 0; k < 6; k++) circle(x, 330 + k * 95, ly, 6, { fill: RED, stroke: false });
      text(x, 'stopped here \u2717', 820, ly, { size: 19, bold: true, color: RED });
    } else if (i === 1) {
      for (let k = 0; k < 5; k++) circle(x, 330 + k * 95, ly, 6, { fill: RED, stroke: false });
      text(x, 'passes the paper \u2713', 700, ly - 34, { size: 18, color: GREEN });
      text(x, 'stopped here \u2717', 1000, ly + 34, { size: 19, bold: true, color: RED });
    } else {
      for (let k = 0; k < 8; k++) circle(x, 330 + k * 95, ly, 6, { fill: RED, stroke: false });
      text(x, 'passes paper and aluminium \u2713', 700, ly - 34, { size: 18, color: GREEN });
      for (let k = 0; k < 2; k++) circle(x, 1050 + k * 95, ly, 6, { fill: RED, stroke: false });
      text(x, 'mostly absorbed \u2014 a little still passes', 1120, ly + 34, { size: 18, color: SOFT });
    }
    // paper at 900 lane 1 is the absorber; lanes 2-3 need a paper sheet too
    if (i > 0) {
      box(x, 640, ly - 70, 12, 140, { fill: '#f5f0e6', stroke: C.ink, lw: 2.5 });
      text(x, 'paper', 646, ly + 100, { size: 16, color: SOFT });
    }
    if (i === 2) {
      box(x, 780, ly - 70, 26, 140, { fill: '#d1d5db', stroke: C.ink, lw: 2.5 });
      text(x, 'aluminium', 793, ly + 100, { size: 16, color: SOFT });
    }
    text(x, ln[1], 724, ly + 170, { size: 19, color: SOFT });
  });
  box(x, 120, 930, 1220, 110, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
  text(x, 'Remember the alphabetical rule: Alpha is stopped by Paper, Beta by Aluminium, and Gamma only by Lead.', 730, 970, { size: 21, bold: true, color: C.ink });
  text(x, 'All three are detected with a Geiger\u2013M\u00fcller tube, which clicks each time radiation ionises the gas inside it.', 730, 1010, { size: 20, color: SOFT });
  save(c, 'sas-phys-penetration.png', DIR);
}

// ---------- 5. What decay does to the nucleus ----------
function d_decay() {
  const [c, x] = make(W, H);
  title2(x, 'What decay does to the nucleus');
  sub2(x, 'alpha and beta decay change the element itself \u2014 gamma emission changes nothing but the energy');
  const pw = 430, gap = 34, x0 = 44, y0 = 130, ph = 880;
  [x0, x0 + pw + gap, x0 + 2 * (pw + gap)].forEach((px, i) => panel(x, px, y0, pw, ph));
  panelHeader(x, x0, pw, 180, 1, 'Alpha decay');
  panelHeader(x, x0 + pw + gap, pw, 180, 2, 'Beta decay');
  panelHeader(x, x0 + 2 * (pw + gap), pw, 180, 3, 'Gamma emission');
  // alpha panel
  const c1 = 259;
  text(x, 'parent nucleus', c1 - 80, 360, { size: 18, color: GREY });
  nucleus(x, c1 - 80, 430, 10, 12, 13, 26);
  arrow(x, c1 + 30, 430, c1 + 90, 430, { color: C.ink, lw: 4 });
  nucleus(x, c1 + 130, 430, 8, 10, 11, 20);
  circle(x, c1 + 210, 430, 26, { fill: '#fecaca', stroke: RED, lw: 3 });
  text(x, '\u03b1', c1 + 210, 432, { size: 26, bold: true, color: RED });
  text(x, 'daughter nucleus + an alpha particle', c1, 520, { size: 19, color: SOFT });
  text(x, 'the alpha particle is 2 p + 2 n,', c1, 570, { size: 20, color: C.ink });
  text(x, 'so the nucleus loses:', c1, 600, { size: 20, color: C.ink });
  text(x, 'mass number: \u2212 4', c1, 655, { size: 21, bold: true, color: AMBER });
  text(x, 'atomic number: \u2212 2', c1, 690, { size: 21, bold: true, color: BLUE });
  text(x, 'a new element is formed \u2014 the', c1, 750, { size: 19, color: SOFT });
  text(x, 'atom has changed into another one', c1, 782, { size: 19, color: SOFT });
  // beta panel
  const c2 = 723;
  text(x, 'before', c2 - 70, 360, { size: 18, color: GREY });
  nucleus(x, c2 - 70, 430, 9, 10, 12, 22);
  arrow(x, c2 + 20, 430, c2 + 80, 430, { color: C.ink, lw: 4 });
  text(x, 'after', c2 + 130, 360, { size: 18, color: GREY });
  nucleus(x, c2 + 130, 430, 10, 9, 12, 22);
  arrow(x, c2 + 210, 430, c2 + 260, 430, { color: BLUE, lw: 4 });
  circle(x, c2 + 285, 430, 15, { fill: '#bfdbfe', stroke: BLUE, lw: 3 });
  text(x, '\u03b2', c2 + 285, 432, { size: 22, bold: true, color: '#1e3a8a' });
  text(x, 'inside the nucleus a neutron turns', c2, 520, { size: 19, color: SOFT });
  text(x, 'into a proton, and the electron is', c2, 550, { size: 19, color: SOFT });
  text(x, 'flung out at high speed:', c2, 580, { size: 19, color: SOFT });
  text(x, 'mass number: unchanged', c2, 655, { size: 21, bold: true, color: AMBER });
  text(x, 'atomic number: + 1', c2, 690, { size: 21, bold: true, color: BLUE });
  text(x, 'again a different element is', c2, 750, { size: 19, color: SOFT });
  text(x, 'left behind after the decay', c2, 782, { size: 19, color: SOFT });
  // gamma panel
  const c3 = 1187;
  nucleus(x, c3, 430, 10, 10, 13, 24);
  wavy(x, c3 + 40, 400, c3 + 160, 330, { color: RED, lw: 5, amp: 14, cycles: 2.5 });
  text(x, 'surplus energy only \u2014', c3, 520, { size: 20, color: C.ink });
  text(x, 'nothing is thrown out of the nucleus', c3, 550, { size: 20, color: C.ink });
  text(x, 'mass number: unchanged', c3, 655, { size: 21, bold: true, color: AMBER });
  text(x, 'atomic number: unchanged', c3, 690, { size: 21, bold: true, color: BLUE });
  text(x, 'the element stays the same \u2014', c3, 750, { size: 19, color: SOFT });
  text(x, 'gamma usually follows an alpha', c3, 782, { size: 19, color: SOFT });
  text(x, 'or beta decay, clearing the', c3, 814, { size: 19, color: SOFT });
  text(x, 'leftover energy', c3, 846, { size: 19, color: SOFT });
  save(c, 'sas-phys-decay-changes.png', DIR);
}

// ---------- 6. Half-life graph ----------
function d_halfLife() {
  const [c, x] = make(1448, 900);
  title2(x, 'Every half-life halves what is left');
  sub2(x, 'the count rate never reaches zero \u2014 it just keeps halving');
  const x0 = 160, y0 = 760, w = 1150, h = 560;
  // axes
  arrow(x, x0, y0, x0, y0 - h, { color: C.ink, lw: 4 });
  arrow(x, x0, y0, x0 + w, y0, { color: C.ink, lw: 4 });
  text(x, 'count rate / activity (Bq)', x0 - 40, y0 - h + 10, { size: 20, color: SOFT, align: 'left' });
  text(x, 'time (number of half-lives)', x0 + w - 60, y0 + 50, { size: 20, color: SOFT });
  const A = 600, half = 300, half2 = 150;
  [[A, '100'], [half, '50'], [half2, '25']].forEach(([v, s]) => {
    const py = y0 - v * 0.85;
    line(x, x0, py, x0 + w, py, { color: GREY, lw: 1.5, dash: [8, 7] });
    text(x, s, x0 - 40, py, { size: 20, color: SOFT, align: 'right' });
  });
  // curve
  x.beginPath(); x.moveTo(x0, y0 - A * 0.85);
  for (let i = 1; i <= 200; i++) {
    const t = i / 200;
    x.lineTo(x0 + w * t, y0 - A * Math.pow(0.5, t * 4) * 0.85);
  }
  x.strokeStyle = BLUE; x.lineWidth = 6; x.stroke();
  // half-life markers at t = 1, 2, 3 (w/4 each)
  [1, 2, 3].forEach(n => {
    const px = x0 + (w / 4) * n, py = y0 - A * Math.pow(0.5, n) * 0.85;
    line(x, px, py, px, y0, { color: AMBER, lw: 2.5, dash: [6, 6] });
    text(x, String(n), px, y0 + 36, { size: 22, bold: true, color: AMBER });
  });
  text(x, 'each step is one half-life', x0 + w / 2, y0 + 80, { size: 22, bold: true, color: AMBER });
  // halving arrows
  arrow(x, x0 + 60, y0 - A * 0.85 - 40, x0 + 60, y0 - half * 0.85 - 40, { color: GREEN, lw: 4 });
  text(x, 'halved', x0 + 110, y0 - (A + half) / 2 * 0.85 - 40, { size: 20, bold: true, color: GREEN, align: 'left' });
  text(x, 'after 1 half-life: 50 Bq', x0 + w / 4 + 20, y0 - half * 0.85 + 42, { size: 20, color: SOFT, align: 'left' });
  text(x, 'after 2: 25 Bq', x0 + w / 2 + 20, y0 - half2 * 0.85 + 42, { size: 20, color: SOFT, align: 'left' });
  text(x, 'after 3: 12.5 Bq', x0 + 3 * w / 4 + 20, y0 - half2 * 0.6, { size: 20, color: SOFT, align: 'left' });
  save(c, 'sas-phys-half-life-graph.png', DIR);
}

// ---------- 7. Background radiation sources ----------
function d_background() {
  const [c, x] = make(1448, 760);
  title2(x, 'Where background radiation comes from');
  sub2(x, 'we can never escape radiation \u2014 it has been part of life on Earth since the beginning');
  const bx = 90, bw = 1268, by = 250, bh = 150;
  const segs = [
    ['radon gas from rocks beneath our homes', '~50%', '#bfdbfe', 0.50],
    ['rocks, soil and building materials', '~14%', '#a7f3d0', 0.14],
    ['food and drink (e.g. potassium-40)', '~11%', '#fde68a', 0.11],
    ['cosmic rays from space', '~10%', '#fca5a5', 0.10],
    ['medical (X-rays and scans)', '~14%', '#c4b5fd', 0.14],
    ['other (fallout, industry)', '~1%', '#e2e8f0', 0.01],
  ];
  let acc = 0;
  segs.forEach(s => {
    const sx = bx + bw * acc, sw = bw * s[3];
    x.fillStyle = s[2]; x.fillRect(sx, by, sw, bh);
    x.strokeStyle = '#fff'; x.lineWidth = 4; x.strokeRect(sx, by, sw, bh);
    if (sw > 90) text(x, s[1], sx + sw / 2, by + bh / 2, { size: 24, bold: true, color: '#0f172a' });
    acc += s[3];
  });
  // legend below, two columns
  segs.forEach((s, i) => {
    const col = i % 2, row = Math.floor(i / 2);
    const lx = 140 + col * 600, ly = 480 + row * 62;
    box(x, lx, ly, 30, 30, { fill: s[2], stroke: C.ink, lw: 1.5 });
    text(x, s[0] + '  (' + s[1] + ')', lx + 45, ly + 16, { size: 20, color: SOFT, align: 'left' });
  });
  text(x, 'Approximate average proportions for someone living in the UK \u2014 exact shares vary from place to place.', 724, 680, { size: 19, color: GREY });
  save(c, 'sas-phys-background-sources.png', DIR);
}

// ---------- 8. Uses of radiation ----------
function d_uses() {
  const [c, x] = make(W, H);
  title2(x, 'Putting radiation to work');
  sub2(x, 'each job needs a radiation chosen for exactly the penetrating power it has');
  const pw = 430, gap = 34, x0 = 44, y0 = 130, ph = 880;
  [x0, x0 + pw + gap, x0 + 2 * (pw + gap)].forEach((px, i) => panel(x, px, y0, pw, ph));
  panelHeader(x, x0, pw, 180, 1, 'Smoke alarms (alpha)');
  panelHeader(x, x0 + pw + gap, pw, 180, 2, 'Thickness gauges (beta)');
  panelHeader(x, x0 + 2 * (pw + gap), pw, 180, 3, 'Medicine (gamma)');
  // panel 1
  const c1 = 259;
  box(x, c1 - 120, 300, 240, 250, { fill: '#ffffff', stroke: C.ink, lw: 4 });
  text(x, 'alarm chamber', c1, 580, { size: 18, color: GREY });
  box(x, c1 - 105, 330, 60, 50, { fill: AMBER, stroke: false });
  text(x, '\u03b1 source', c1 - 75, 470, { size: 17, color: SOFT });
  line(x, c1 - 20, 355, c1 + 80, 355, { color: RED, lw: 3 });
  text(x, 'ionised air lets a', c1 + 10, 330, { size: 17, color: SOFT });
  text(x, 'tiny current flow', c1 + 10, 310, { size: 17, color: SOFT });
  x.fillStyle = '#cbd5e1';
  for (let i = 0; i < 5; i++) circle(x, c1 + 40 + i * 18, 420 + (i % 2) * 14, 9, { fill: '#cbd5e1', stroke: GREY, lw: 2 });
  text(x, 'smoke absorbs the alpha', c1, 650, { size: 19, color: C.ink });
  text(x, 'particles, the current', c1, 682, { size: 19, color: C.ink });
  text(x, 'drops \u2014 and the alarm rings', c1, 714, { size: 19, color: C.ink });
  text(x, 'alpha is chosen because it', c1, 800, { size: 19, color: SOFT });
  text(x, 'cannot even escape the alarm,', c1, 832, { size: 19, color: SOFT });
  text(x, 'so it is safe in your home', c1, 864, { size: 19, color: SOFT });
  // panel 2
  const c2 = 723;
  box(x, c2 - 180, 380, 360, 26, { fill: '#fde68a', stroke: AMBER, lw: 2 });
  text(x, 'sheet of paper or foil', c2, 440, { size: 18, color: SOFT });
  box(x, c2 - 90, 290, 180, 46, { fill: '#94a3b8', stroke: C.ink, lw: 3 });
  text(x, 'rollers', c2, 313, { size: 17, color: '#fff' });
  box(x, c2 - 40, 200, 80, 36, { fill: AMBER, stroke: false });
  text(x, '\u03b2 source', c2, 260, { size: 17, color: SOFT });
  arrow(x, c2, 240, c2, 370, { color: RED, lw: 3 });
  arrow(x, c2, 410, c2, 540, { color: RED, lw: 3 });
  box(x, c2 - 90, 545, 180, 46, { fill: '#ffffff', stroke: C.ink, lw: 3 });
  text(x, 'detector', c2, 568, { size: 17, color: C.ink });
  text(x, 'too little counted = sheet too thick,', c2, 680, { size: 19, color: C.ink });
  text(x, 'too much counted = too thin \u2014', c2, 712, { size: 19, color: C.ink });
  text(x, 'the rollers adjust automatically', c2, 744, { size: 19, color: C.ink });
  text(x, 'beta is just penetrating enough to', c2, 830, { size: 19, color: SOFT });
  text(x, 'pass through paper but not much more', c2, 862, { size: 19, color: SOFT });
  // panel 3
  const c3 = 1187;
  box(x, c3 - 170, 330, 340, 200, { fill: '#ffffff', stroke: C.ink, lw: 4 });
  text(x, 'sealed medical instruments', c3, 570, { size: 18, color: GREY });
  for (let i = 0; i < 3; i++) {
    box(x, c3 - 130 + i * 100, 390, 60, 100, { fill: '#e2e8f0', stroke: GREY, lw: 2.5 });
    line(x, c3 - 130 + i * 100 + 8, 400, c3 - 130 + i * 100 + 52, 400, { color: RED, lw: 2 });
    line(x, c3 - 130 + i * 100 + 30, 470, c3 - 130 + i * 100 + 30, 486, { color: RED, lw: 2 });
  }
  wavy(x, c3 - 170, 300, c3 + 170, 300, { color: RED, lw: 4, amp: 12, cycles: 8, noHead: true });
  text(x, 'gamma rays from a source pass right', c3, 660, { size: 19, color: C.ink });
  text(x, 'through the sealed packet and kill', c3, 692, { size: 19, color: C.ink });
  text(x, 'every bacterium on the instruments', c3, 724, { size: 19, color: C.ink });
  text(x, 'gamma is used because nothing blocks', c3, 810, { size: 19, color: SOFT });
  text(x, 'it and it sterilises thoroughly; in', c3, 842, { size: 19, color: SOFT });
  text(x, 'hospitals it also targets cancer cells', c3, 874, { size: 19, color: SOFT });
  save(c, 'sas-phys-radiation-uses.png', DIR);
}

const all = { d_atom, d_isotopes, d_types, d_penetration, d_decay, d_halfLife, d_background, d_uses };
const only = process.argv[2];
fs.mkdirSync(DIR, { recursive: true });
Object.entries(all).forEach(([name, fn]) => {
  if (!only || name === only) { fn(); console.log('rendered', name); }
});
console.log('done sas 3.7 radioactivity diagrams');
module.exports = all;