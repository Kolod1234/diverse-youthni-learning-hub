// Renders the ten custom diagrams for the LHS A2 2 "Organic Chemistry"
// chapter as 2x-scale PNGs into public/lesson-assets/lhs-a2.
const fs = require('fs');
const path = require('path');
// node-canvas 2.x can no longer compile in this sandbox (its cairo/pango
// system libraries are absent), so fall back to @napi-rs/canvas, a
// prebuilt drop-in replacement with the same createCanvas API.
let createCanvas;
try {
  ({ createCanvas } = require('canvas'));
} catch (e) {
  ({ createCanvas } = require('@napi-rs/canvas'));
}

const OUT_DIR = path.join(__dirname, '..', '..', 'public', 'lesson-assets', 'lhs-a2');
fs.mkdirSync(OUT_DIR, { recursive: true });

const SCALE = 2;
const results = [];

const C = {
  ink: '#1f2937',
  sub: '#475569',
  faint: '#94a3b8',
  grid: '#e2e8f0',
  panel: '#f8fafc',
  accent: '#4f46e5',
  accentSoft: '#eef2ff',
  accent2: '#0ea5e9',
  accent2Soft: '#e0f2fe',
  warn: '#cc2222',
  warnSoft: '#fee2e2',
  ok: '#16a34a',
  okSoft: '#dcfce7',
  bromine: '#f59e0b',
  bromineDeep: '#d97706',
  flameBlue: '#3b82f6',
  flameBlueIn: '#bfdbfe',
};

function setFont(ctx, size, weight) {
  ctx.font = (weight || '400') + ' ' + size + 'px Arial, Helvetica, sans-serif';
}

function fitFont(ctx, text, maxWidth, size, weight) {
  let s = size;
  while (s > 11) {
    setFont(ctx, s, weight);
    if (ctx.measureText(text).width <= maxWidth) break;
    s -= 1;
  }
  return s;
}

function textCentered(ctx, text, x, y, maxWidth, size, weight, color) {
  fitFont(ctx, text, maxWidth, size, weight);
  ctx.fillStyle = color || C.ink;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function textLeft(ctx, text, x, y, maxWidth, size, weight, color) {
  fitFont(ctx, text, maxWidth, size, weight);
  ctx.fillStyle = color || C.ink;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y);
}

function makeCanvas(w, h) {
  const canvas = createCanvas(w * SCALE, h * SCALE);
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, w, h);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  return { canvas, ctx };
}

function title(ctx, w, text, sub) {
  textCentered(ctx, text, w / 2, 58, w - 80, 40, '700');
  if (sub) textCentered(ctx, sub, w / 2, 98, w - 120, 22, '400', C.sub);
}

function save(name, canvas) {
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUT_DIR, name), buf);
  results.push({ name, bytes: buf.length });
}

function arrow(ctx, x1, y1, x2, y2, width, color) {
  ctx.strokeStyle = color || C.ink;
  ctx.fillStyle = color || C.ink;
  ctx.lineWidth = width || 3;
  const head = 11;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - head * Math.cos(ang) * 0.9, y2 - head * Math.sin(ang) * 0.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(ang - 0.42), y2 - head * Math.sin(ang - 0.42));
  ctx.lineTo(x2 - head * Math.cos(ang + 0.42), y2 - head * Math.sin(ang + 0.42));
  ctx.closePath();
  ctx.fill();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function dashedLine(ctx, x, y1, y2, color, width) {
  ctx.save();
  ctx.setLineDash([10, 8]);
  ctx.strokeStyle = color || C.sub;
  ctx.lineWidth = width || 2.5;
  ctx.beginPath();
  ctx.moveTo(x, y1);
  ctx.lineTo(x, y2);
  ctx.stroke();
  ctx.restore();
}

// A covalent bond drawn between two atom labels, stopping short of each.
function bond(ctx, x1, y1, x2, y2, width, color) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  const pad = 13;
  const ux = dx / len, uy = dy / len;
  ctx.lineWidth = width || 2.6;
  ctx.strokeStyle = color || C.ink;
  ctx.beginPath();
  ctx.moveTo(x1 + ux * pad, y1 + uy * pad);
  ctx.lineTo(x2 - ux * pad, y2 - uy * pad);
  ctx.stroke();
}

// An atom label in a displayed formula.
function atom(ctx, text, x, y, size, color) {
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  setFont(ctx, size || 20, '700');
  ctx.fillStyle = color || C.ink;
  ctx.fillText(text, x, y);
}

// A skeletal zigzag: carbon at every endpoint and corner.
function zig(ctx, pts, width, color) {
  ctx.lineWidth = width || 3.5;
  ctx.strokeStyle = color || C.ink;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
}

// A benzene ring drawn as a hexagon with an inner circle (schematic).
function hexRing(ctx, cx, cy, r) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const a = Math.PI / 6 + (i * Math.PI) / 3;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.lineWidth = 3.5;
  ctx.strokeStyle = C.ink;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.58, 0, Math.PI * 2);
  ctx.lineWidth = 2.5;
  ctx.stroke();
}

function flame(ctx, cx, baseY, h, w, color, inner) {
  ctx.beginPath();
  ctx.moveTo(cx, baseY);
  ctx.bezierCurveTo(cx - w, baseY - h * 0.35, cx - w * 0.7, baseY - h * 0.8, cx, baseY - h);
  ctx.bezierCurveTo(cx + w * 0.7, baseY - h * 0.8, cx + w, baseY - h * 0.35, cx, baseY);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cx, baseY);
  ctx.bezierCurveTo(cx - w * 0.5, baseY - h * 0.25, cx - w * 0.35, baseY - h * 0.5, cx, baseY - h * 0.62);
  ctx.bezierCurveTo(cx + w * 0.35, baseY - h * 0.5, cx + w * 0.5, baseY - h * 0.25, cx, baseY);
  ctx.fillStyle = inner;
  ctx.fill();
}

/* ---------- 1. Six representations of one molecule ---------- */
function renderFormulae() {
  const W = 1600, H = 1000;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'One molecule, six representations', 'butane, drawn and written every way the specification asks');

  const PW = 420, PH = 380;
  const cols = [70, 590, 1110];
  const rows = [150, 560];
  const panels = [
    ['Empirical formula', 'C2H5', 'the simplest whole-number ratio'],
    ['Molecular formula', 'C4H10', 'the actual count of every atom'],
    ['General formula', 'CnH2n+2', 'the pattern for the whole series'],
    ['Structural formula', 'CH3CH2CH2CH3', 'which atoms follow which'],
    ['Displayed formula', null, 'every atom and every bond'],
    ['Skeletal formula', null, 'carbons implied at ends and bends'],
  ];
  panels.forEach((p, i) => {
    const x0 = cols[i % 3];
    const y0 = rows[Math.floor(i / 3)];
    roundRect(ctx, x0, y0, PW, PH, 14);
    ctx.fillStyle = C.panel;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#cbd5e1';
    ctx.stroke();
    textCentered(ctx, p[0], x0 + PW / 2, y0 + 44, PW - 30, 25, '700');
    textCentered(ctx, p[2], x0 + PW / 2, y0 + 340, PW - 40, 18, '400', C.sub);
    if (p[1]) {
      textCentered(ctx, p[1], x0 + PW / 2, y0 + 195, PW - 60, 54, '700', i === 2 ? C.accent : C.ink);
    } else if (i === 4) {
      // displayed formula of butane
      const cx = x0 + PW / 2;
      const cy = y0 + 205;
      const cxs = [cx - 93, cx - 31, cx + 31, cx + 93];
      const dyUp = cy - 52, dyDn = cy + 52;
      cxs.forEach((cxx, k) => {
        atom(ctx, 'C', cxx, cy, 19);
        atom(ctx, 'H', cxx, dyUp, 18);
        atom(ctx, 'H', cxx, dyDn, 18);
        bond(ctx, cxx, cy, cxx, dyUp);
        bond(ctx, cxx, cy, cxx, dyDn);
        if (k < 3) bond(ctx, cxx, cy, cxs[k + 1], cy);
      });
      atom(ctx, 'H', cxs[0] - 62, cy, 18);
      bond(ctx, cxs[0], cy, cxs[0] - 62, cy);
      atom(ctx, 'H', cxs[3] + 62, cy, 18);
      bond(ctx, cxs[3], cy, cxs[3] + 62, cy);
    } else {
      // skeletal formula of butane
      const cx = x0 + PW / 2;
      const cy = y0 + 215;
      zig(ctx, [[cx - 90, cy + 30], [cx - 30, cy - 30], [cx + 30, cy + 30], [cx + 90, cy - 30]]);
    }
  });

  save('a22-formulae-representations.png', canvas);
}

/* ---------- 2. Functional groups table ---------- */
function renderFunctionalGroups() {
  const W = 1600, H = 1000;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'The functional groups you must recognise', 'learn the group, the suffix and one named example of each');

  const cols = [
    { x: 100, w: 320, head: 'Homologous series' },
    { x: 420, w: 370, head: 'Functional group' },
    { x: 790, w: 270, head: 'Suffix / prefix' },
    { x: 1060, w: 440, head: 'Named example' },
  ];
  const headY = 160, headH = 64, rowH = 100;
  const rows = [
    ['Alkane', 'C\u2013C single bonds only', '\u2013ane', 'ethane \u2014 CH3CH3'],
    ['Alkene', 'C=C double bond', '\u2013ene', 'propene \u2014 CH3CH=CH2'],
    ['Alcohol', '\u2013OH hydroxyl', '\u2013ol', 'propan-2-ol \u2014 CH3CH(OH)CH3'],
    ['Halogenoalkane', '\u2013Cl, \u2013Br or \u2013I', 'chloro-, bromo-, iodo-', '2-bromopropane \u2014 CH3CHBrCH3'],
    ['Aldehyde', '\u2013CHO at end of chain', '\u2013al', 'ethanal \u2014 CH3CHO'],
    ['Ketone', 'C=O inside the chain', '\u2013one', 'propanone \u2014 CH3COCH3'],
    ['Carboxylic acid', '\u2013COOH carboxyl', '\u2013oic acid', 'ethanoic acid \u2014 CH3COOH'],
  ];

  // header band
  ctx.fillStyle = C.panel;
  ctx.fillRect(100, headY, 1400, headH);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#cbd5e1';
  ctx.strokeRect(100, headY, 1400, headH);
  cols.forEach((c) => {
    textLeft(ctx, c.head, c.x + 24, headY + headH / 2, c.w - 30, 21, '700');
    ctx.beginPath();
    ctx.moveTo(c.x, headY);
    ctx.lineTo(c.x, headY + headH + rows.length * rowH);
    ctx.stroke();
  });

  rows.forEach((r, i) => {
    const y = headY + headH + i * rowH;
    if (i % 2 === 0) {
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(100, y, 1400, rowH);
    }
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(100, y);
    ctx.lineTo(1500, y);
    ctx.stroke();
    textLeft(ctx, r[0], cols[0].x + 24, y + rowH / 2, cols[0].w - 30, 24, '700', C.accent);
    textLeft(ctx, r[1], cols[1].x + 24, y + rowH / 2, cols[1].w - 30, 22, '400');
    textLeft(ctx, r[2], cols[2].x + 24, y + rowH / 2, cols[2].w - 20, 22, '400');
    textLeft(ctx, r[3], cols[3].x + 24, y + rowH / 2, cols[3].w - 30, 21, '400', C.sub);
  });

  // table outline
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.strokeRect(100, headY, 1400, headH + rows.length * rowH);

  textCentered(ctx, 'The functional group is what the molecule does; the rest of the molecule is scaffolding', W / 2, H - 44, W - 200, 20, '400', C.sub);
  save('a22-functional-groups.png', canvas);
}

/* ---------- 3. Isomerism map ---------- */
function renderIsomerism() {
  const W = 1600, H = 1180;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Isomerism: same formula, different shape', 'the two families and a named example of each');

  // top box
  roundRect(ctx, 490, 128, 620, 96, 16);
  ctx.fillStyle = C.panel;
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();
  textCentered(ctx, 'Isomerism', 800, 158, 560, 27, '700', C.accent);
  textCentered(ctx, 'same molecular formula, different arrangement of atoms', 800, 196, 560, 19, '400', C.sub);
  arrow(ctx, 700, 232, 550, 268, 3, C.faint);
  arrow(ctx, 900, 232, 1050, 268, 3, C.faint);

  // branch headers
  roundRect(ctx, 280, 274, 480, 64, 14);
  ctx.fillStyle = C.accentSoft;
  ctx.fill();
  ctx.strokeStyle = C.accent;
  ctx.stroke();
  textCentered(ctx, 'Structural isomerism', 520, 306, 440, 25, '700', C.accent);
  roundRect(ctx, 1050, 274, 500, 64, 14);
  ctx.fillStyle = C.accent2Soft;
  ctx.fill();
  ctx.strokeStyle = C.accent2;
  ctx.stroke();
  textCentered(ctx, 'Stereoisomerism (E/Z)', 1300, 306, 460, 25, '700', C.accent2);

  /* left card: three structural types */
  roundRect(ctx, 90, 372, 920, 740, 16);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.stroke();

  // chain isomerism
  roundRect(ctx, 110, 392, 880, 220, 12);
  ctx.fillStyle = C.panel;
  ctx.fill();
  ctx.strokeStyle = C.grid;
  ctx.stroke();
  textLeft(ctx, 'Chain isomerism \u2014 different skeleton, same formula (C4H10)', 134, 424, 840, 22, '700');
  zig(ctx, [[240, 560], [295, 515], [350, 560], [405, 515]]);
  textCentered(ctx, 'butane', 322, 586, 200, 20, '700');
  zig(ctx, [[660, 530], [610, 495], [660, 530], [710, 495], [660, 530], [660, 600]]);
  textCentered(ctx, '2-methylpropane', 660, 586, 240, 20, '700');

  // position isomerism
  roundRect(ctx, 110, 632, 880, 220, 12);
  ctx.fillStyle = C.panel;
  ctx.fill();
  ctx.strokeStyle = C.grid;
  ctx.stroke();
  textLeft(ctx, 'Position isomerism \u2014 same group, different place (C3H8O)', 134, 664, 840, 22, '700');
  zig(ctx, [[250, 760], [300, 715], [350, 760]]);
  atom(ctx, 'OH', 395, 760, 19, C.accent);
  bond(ctx, 350, 760, 395, 760);
  textCentered(ctx, 'propan-1-ol', 320, 810, 220, 20, '700');
  zig(ctx, [[640, 760], [690, 715], [740, 760], [790, 715]]);
  atom(ctx, 'OH', 690, 655, 19, C.accent);
  bond(ctx, 690, 715, 690, 655);
  textCentered(ctx, 'propan-2-ol', 715, 810, 220, 20, '700');

  // functional group isomerism
  roundRect(ctx, 110, 872, 880, 220, 12);
  ctx.fillStyle = C.panel;
  ctx.fill();
  ctx.strokeStyle = C.grid;
  ctx.stroke();
  textLeft(ctx, 'Functional group isomerism \u2014 same atoms, different group (C2H6O)', 134, 904, 860, 22, '700');
  textCentered(ctx, 'ethanol', 330, 970, 240, 22, '700');
  textCentered(ctx, 'CH3CH2OH \u2014 an alcohol', 330, 1006, 300, 20, '400', C.sub);
  textCentered(ctx, 'methoxymethane', 700, 970, 260, 22, '700');
  textCentered(ctx, 'CH3OCH3 \u2014 an ether', 700, 1006, 300, 20, '400', C.sub);
  textCentered(ctx, 'a different functional group means different chemistry', 530, 1058, 780, 19, '400', C.sub);

  /* right card: E/Z stereoisomerism */
  roundRect(ctx, 1060, 372, 450, 740, 16);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.stroke();

  const drawEZ = (yBase, name, note, zIsomer) => {
    roundRect(ctx, 1080, yBase, 410, 300, 12);
    ctx.fillStyle = C.panel;
    ctx.fill();
    ctx.strokeStyle = C.grid;
    ctx.stroke();
    textCentered(ctx, name, 1285, yBase + 34, 380, 22, '700');
    const cy = yBase + 140;
    const cLx = 1225, cRx = 1345;
    // C=C double bond
    atom(ctx, 'C', cLx, cy, 20);
    atom(ctx, 'C', cRx, cy, 20);
    bond(ctx, cLx, cy - 5, cRx, cy - 5);
    bond(ctx, cLx, cy + 5, cRx, cy + 5);
    // substituents
    const up = [[cLx - 60, cy - 55], [cRx + 60, cy - 55]];
    const dn = [[cLx - 60, cy + 55], [cRx + 60, cy + 55]];
    const methylSide = zIsomer ? [up, up] : [up, dn];
    methylSide.forEach((side, i) => {
      const cx = i === 0 ? cLx : cRx;
      const [px, py] = side[i];
      atom(ctx, 'CH3', px, py, 17, C.accent);
      bond(ctx, cx, cy, px, py);
    });
    const hydSide = zIsomer ? [dn, dn] : [dn, up];
    hydSide.forEach((side, i) => {
      const cx = i === 0 ? cLx : cRx;
      const [px, py] = side[i];
      atom(ctx, 'H', px, py, 16);
      bond(ctx, cx, cy, px, py);
    });
    textCentered(ctx, note, 1285, yBase + 250, 380, 19, '400', C.sub);
  };
  drawEZ(392, 'E-but-2-ene', 'CH3 groups on opposite sides', false);
  drawEZ(712, 'Z-but-2-ene', 'CH3 groups on the same side (zusammen)', true);
  textCentered(ctx, 'rotation about C=C is locked \u2014 both arrangements exist', 1285, 1058, 420, 18, '400', C.sub);

  save('a22-isomerism-map.png', canvas);
}

/* ---------- 4. Complete vs incomplete combustion ---------- */
function renderCombustion() {
  const W = 1600, H = 940;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Complete and incomplete combustion', 'the same fuel, two very different outcomes');

  // left panel
  roundRect(ctx, 80, 150, 640, 430, 14);
  ctx.fillStyle = C.panel;
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.stroke();
  textCentered(ctx, 'Complete combustion \u2014 plenty of oxygen', 400, 194, 600, 25, '700');
  flame(ctx, 400, 540, 210, 62, C.flameBlue, C.flameBlueIn);
  textCentered(ctx, 'CH4 + 2O2 \u2192 CO2 + 2H2O', 400, 248, 600, 26, '700');
  textCentered(ctx, 'hot, clean blue flame', 400, 286, 600, 20, '400', C.sub);
  textCentered(ctx, 'products: carbon dioxide and water only', 400, 330, 600, 21, '700', C.ok);

  // right panel
  roundRect(ctx, 880, 150, 640, 430, 14);
  ctx.fillStyle = C.panel;
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();
  textCentered(ctx, 'Incomplete combustion \u2014 limited oxygen', 1200, 194, 600, 25, '700');
  flame(ctx, 1200, 540, 210, 62, C.bromine, '#fde68a');
  textCentered(ctx, '2CH4 + 3O2 \u2192 2CO + 4H2O', 1200, 240, 600, 25, '700');
  textCentered(ctx, 'CH4 + O2 \u2192 C + 2H2O  (soot)', 1200, 284, 600, 25, '700');
  textCentered(ctx, 'cooler, yellow, smoky flame', 1200, 322, 600, 20, '400', C.sub);
  textCentered(ctx, 'products: carbon monoxide and/or soot', 1200, 366, 600, 21, '700', C.warn);

  // pollutant chips
  const chips = [
    { x: 80, w: 470, name: 'CO \u2014 carbon monoxide', lines: [
      'colourless and odourless \u2014 you cannot tell it is there',
      'binds haemoglobin far more strongly than oxygen does',
      'forms carboxyhaemoglobin: the blood carries less oxygen',
      'headaches and dizziness first; unconsciousness and death next' ] },
    { x: 570, w: 470, name: 'C \u2014 soot and particulates', lines: [
      'fine carbon particles from flame fuels',
      'irritate the airways and worsen asthma',
      'dirty the visible world: blackened buildings, smog' ] },
    { x: 1060, w: 460, name: 'SO2 \u2014 sulfur dioxide', lines: [
      'from sulfur impurities in fossil fuels',
      'dissolves in moist air \u2192 acid rain',
      'harms lakes, forests and buildings; triggers asthma attacks' ] },
  ];
  chips.forEach((chip) => {
    roundRect(ctx, chip.x, 620, chip.w, 250, 12);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();
    textLeft(ctx, chip.name, chip.x + 24, 656, chip.w - 40, 22, '700', C.warn);
    chip.lines.forEach((ln, i) => {
      textLeft(ctx, ln, chip.x + 24, 700 + i * 40, chip.w - 48, 18, '400', C.sub);
    });
  });

  textCentered(ctx, 'Prevention is ventilation: enough oxygen makes combustion complete \u2014 and a CO alarm warns when it was not', W / 2, H - 40, W - 160, 20, '400', C.sub);
  save('a22-combustion-pollutants.png', canvas);
}

/* ---------- 5. Alkene addition reactions ---------- */
function renderAlkeneAddition() {
  const W = 1600, H = 940;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Addition across the double bond', 'the orange of bromine water vanishes when a C=C is present');

  // main scheme
  textCentered(ctx, 'CH2=CH2', 250, 295, 260, 30, '700');
  textCentered(ctx, 'ethene', 250, 340, 260, 19, '400', C.sub);
  textCentered(ctx, '+', 420, 295, 60, 30, '700');
  textCentered(ctx, 'Br2', 540, 295, 140, 30, '700', C.bromineDeep);
  textCentered(ctx, '(orange bromine water)', 540, 340, 280, 18, '400', C.bromineDeep);
  arrow(ctx, 640, 295, 920, 295, 4, C.ink);
  textCentered(ctx, 'addition', 780, 265, 220, 18, '400', C.sub);
  textCentered(ctx, 'CH2Br\u2013CH2Br', 1110, 295, 300, 30, '700');
  textCentered(ctx, '1,2-dibromoethane \u2014 the tube is now colourless', 1110, 340, 420, 19, '400', C.sub);
  textCentered(ctx, 'one bromine to each carbon: the double bond opens to receive them', 800, 385, 900, 20, '400', C.sub);

  // three addition panels
  const panels = [
    { x: 80, name: 'Hydrogenation', reactant: 'CH2=CH2  +  H2', cond: 'Ni catalyst', product: 'CH3CH3 \u2014 ethane', note: 'liquid oils become spreadable fats' },
    { x: 570, name: 'With hydrogen bromide', reactant: 'CH2=CH2  +  HBr', cond: 'room temperature', product: 'CH3CH2Br \u2014 bromoethane', note: 'Br to one carbon, H to the other' },
    { x: 1060, name: 'Hydration \u2014 industrial ethanol', reactant: 'CH2=CH2  +  H2O', cond: 'H3PO4, 300 \u00B0C, 60 atm', product: 'CH3CH2OH \u2014 ethanol', note: 'pure, continuous \u2014 fermentation\u2019s rival' },
  ];
  panels.forEach((p) => {
    roundRect(ctx, p.x, 470, 460, 330, 12);
    ctx.fillStyle = C.panel;
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();
    textCentered(ctx, p.name, p.x + 230, 508, 420, 23, '700', C.accent);
    textCentered(ctx, p.reactant, p.x + 230, 560, 420, 24, '400');
    arrow(ctx, p.x + 230, 585, p.x + 230, 650, 3, C.ink);
    textCentered(ctx, p.cond, p.x + 230, 618, 420, 18, '400', C.sub);
    textCentered(ctx, p.product, p.x + 230, 692, 420, 24, '700');
    textCentered(ctx, p.note, p.x + 230, 740, 420, 18, '400', C.sub);
  });

  textCentered(ctx, 'Alkanes cannot do any of this \u2014 no double bond, nothing for the reagent to open', W / 2, H - 42, W - 200, 20, '400', C.sub);
  save('a22-alkene-addition.png', canvas);
}

/* ---------- 6. Addition polymerisation ---------- */
function renderPolymerisation() {
  const W = 1600, H = 920;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Addition polymerisation', 'the double bond opens and thousands of monomers join hands');

  // main scheme
  textCentered(ctx, 'n CH2=CH2', 240, 300, 260, 27, '700');
  textCentered(ctx, 'ethene monomers', 240, 345, 260, 19, '400', C.sub);
  arrow(ctx, 390, 300, 620, 300, 4, C.ink);
  textCentered(ctx, 'pressure, catalyst', 505, 268, 220, 18, '400', C.sub);

  // bracketed repeat unit
  ctx.lineWidth = 5;
  ctx.strokeStyle = C.ink;
  ctx.beginPath(); ctx.moveTo(672, 240); ctx.lineTo(672, 360); ctx.moveTo(672, 240); ctx.lineTo(696, 240); ctx.moveTo(672, 360); ctx.lineTo(696, 360); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(918, 240); ctx.lineTo(918, 360); ctx.moveTo(918, 240); ctx.lineTo(894, 240); ctx.moveTo(918, 360); ctx.lineTo(894, 360); ctx.stroke();
  textCentered(ctx, '\u2013CH2\u2013CH2\u2013', 795, 300, 200, 26, '700');
  textCentered(ctx, 'the repeat unit', 795, 345, 200, 18, '400', C.sub);
  textCentered(ctx, 'n', 950, 350, 60, 30, '700', C.accent);
  textCentered(ctx, '= poly(ethene)', 1120, 300, 260, 27, '700', C.accent);

  // named polymer panels
  const panels = [
    { x: 80, name: 'poly(propene)', from: 'from propene, CH3CH=CH2', uses: ['tough and light \u2014 syringes,', 'medical crates, hernia mesh'] },
    { x: 570, name: 'PVC \u2014 poly(chloroethene)', from: 'from chloroethene, CH2=CHCl', uses: ['flexible and clear \u2014 blood bags,', 'drip lines, oxygen masks'] },
    { x: 1060, name: 'PTFE \u2014 poly(tetrafluoroethene)', from: 'from tetrafluoroethene, CF2=CF2', uses: ['slippery and inert \u2014 catheter', 'coatings and graft liners'] },
  ];
  panels.forEach((p) => {
    roundRect(ctx, p.x, 440, 460, 340, 12);
    ctx.fillStyle = C.panel;
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();
    textCentered(ctx, p.name, p.x + 230, 482, 420, 22, '700', C.accent);
    textCentered(ctx, p.from, p.x + 230, 530, 420, 20, '400', C.sub);
    p.uses.forEach((u, i) => {
      textCentered(ctx, u, p.x + 230, 610 + i * 40, 420, 20, '400');
    });
  });

  textCentered(ctx, 'A strong C\u2013C backbone cannot be digested or rotted \u2014 addition polymers are non-biodegradable: recycle or incinerate with care', W / 2, H - 44, W - 160, 20, '400', C.sub);
  save('a22-polymerisation.png', canvas);
}

/* ---------- 7. Oxidation of the three alcohol classes ---------- */
function renderAlcoholOxidation() {
  const W = 1600, H = 960;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Oxidation of the three classes of alcohol', 'acidified dichromate(VI): orange before, green after \u2014 if it reacts');

  const frame = (x) => {
    roundRect(ctx, x, 160, 470, 560, 14);
    ctx.fillStyle = C.panel;
    ctx.fill();
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 2;
    ctx.stroke();
  };

  // primary
  frame(80);
  textCentered(ctx, 'Primary (1\u00B0)', 315, 200, 430, 26, '700', C.accent);
  textCentered(ctx, 'CH3CH2OH', 315, 245, 430, 25, '700');
  textCentered(ctx, 'ethanol', 315, 282, 430, 19, '400', C.sub);
  arrow(ctx, 315, 305, 315, 365, 3, C.ink);
  textLeft(ctx, '[O], warm, distil', 345, 335, 200, 18, '400', C.sub);
  textCentered(ctx, 'CH3CHO', 315, 405, 430, 25, '700');
  textCentered(ctx, 'ethanal \u2014 an aldehyde', 315, 442, 430, 19, '400', C.sub);
  arrow(ctx, 315, 468, 315, 528, 3, C.ink);
  textLeft(ctx, '[O], reflux', 345, 498, 200, 18, '400', C.sub);
  textCentered(ctx, 'CH3COOH', 315, 570, 430, 25, '700');
  textCentered(ctx, 'ethanoic acid \u2014 a carboxylic acid', 315, 608, 430, 19, '400', C.sub);

  // secondary
  frame(590);
  textCentered(ctx, 'Secondary (2\u00B0)', 825, 200, 430, 26, '700', C.accent);
  textCentered(ctx, 'CH3CH(OH)CH3', 825, 245, 430, 25, '700');
  textCentered(ctx, 'propan-2-ol', 825, 282, 430, 19, '400', C.sub);
  arrow(ctx, 825, 305, 825, 365, 3, C.ink);
  textLeft(ctx, '[O], reflux', 855, 335, 200, 18, '400', C.sub);
  textCentered(ctx, 'CH3COCH3', 825, 405, 430, 25, '700');
  textCentered(ctx, 'propanone \u2014 a ketone', 825, 442, 430, 19, '400', C.sub);
  textCentered(ctx, 'a ketone resists further oxidation', 825, 520, 430, 20, '400', C.sub);
  textCentered(ctx, 'under these conditions', 825, 552, 430, 20, '400', C.sub);

  // tertiary
  frame(1100);
  textCentered(ctx, 'Tertiary (3\u00B0)', 1335, 200, 430, 26, '700', C.accent);
  textCentered(ctx, '(CH3)3COH', 1335, 245, 430, 25, '700');
  textCentered(ctx, '2-methylpropan-2-ol', 1335, 282, 430, 19, '400', C.sub);
  arrow(ctx, 1335, 305, 1335, 365, 3, C.faint);
  ctx.strokeStyle = C.warn;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(1318, 318); ctx.lineTo(1352, 352);
  ctx.moveTo(1352, 318); ctx.lineTo(1318, 352);
  ctx.stroke();
  textCentered(ctx, 'no reaction', 1335, 405, 430, 25, '700', C.warn);
  textCentered(ctx, 'oxidation would have to break a C\u2013C bond;', 1335, 448, 430, 19, '400', C.sub);
  textCentered(ctx, 'the dichromate stays orange \u2014 the negative test', 1335, 480, 430, 19, '400', C.sub);

  // colour change chip
  roundRect(ctx, 80, 770, 1440, 110, 12);
  ctx.fillStyle = C.okSoft;
  ctx.fill();
  ctx.strokeStyle = C.ok;
  ctx.lineWidth = 2;
  ctx.stroke();
  textCentered(ctx, 'The tell-tale colour change', 800, 802, 1400, 22, '700', C.ok);
  textCentered(ctx, 'acidified dichromate(VI) is orange and turns green only where oxidation happens \u2014 the tube itself reports the result', 800, 842, 1400, 21, '400', C.sub);
  save('a22-alcohol-oxidation.png', canvas);
}

/* ---------- 8. Esterification ---------- */
function renderEsterification() {
  const W = 1600, H = 830;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Esterification: joining an acid to an alcohol', 'the ester link made in a test tube is the same one aspirin carries');

  // main scheme
  textCentered(ctx, 'CH3COOH', 250, 300, 240, 24, '700');
  textCentered(ctx, 'ethanoic acid', 250, 344, 240, 19, '400', C.sub);
  textCentered(ctx, '+', 400, 300, 60, 26, '700');
  textCentered(ctx, 'C2H5OH', 530, 300, 220, 24, '700');
  textCentered(ctx, 'ethanol', 530, 344, 220, 19, '400', C.sub);

  // reversible double arrow
  ctx.strokeStyle = C.ink;
  ctx.fillStyle = C.ink;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(680, 288); ctx.lineTo(940, 288); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(940, 288); ctx.lineTo(925, 280); ctx.lineTo(925, 296); ctx.closePath(); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(940, 316); ctx.lineTo(680, 316); ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(680, 316); ctx.lineTo(695, 308); ctx.lineTo(695, 324); ctx.closePath(); ctx.fill();
  textCentered(ctx, 'conc. H2SO4, warm', 810, 258, 240, 18, '400', C.sub);
  textCentered(ctx, 'the reaction is reversible', 810, 348, 240, 18, '400', C.sub);

  textCentered(ctx, 'CH3COOC2H5', 1100, 300, 280, 24, '700', C.accent);
  textCentered(ctx, 'ethyl ethanoate \u2014 an ester', 1100, 344, 280, 19, '400', C.sub);
  textCentered(ctx, '+', 1280, 300, 60, 26, '700');
  textCentered(ctx, 'H2O', 1370, 300, 140, 24, '700');

  textCentered(ctx, 'the water is built from the acid\u2019s \u2013OH and the alcohol\u2019s \u2013H; what is left joins into the ester link \u2013COO\u2013', 800, 430, 1200, 21, '400', C.sub);

  // info chips
  roundRect(ctx, 80, 490, 700, 250, 12);
  ctx.fillStyle = C.panel;
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.stroke();
  textLeft(ctx, 'Where you meet esters', 110, 528, 640, 23, '700', C.accent);
  [
    'sweet, fruity smells \u2014 pear drops is ethyl ethanoate',
    'flavourings and perfumes; solvents that carry medicines',
    'aspirin is an ester; body fats are esters of glycerol',
  ].forEach((ln, i) => textLeft(ctx, ln, 110, 572 + i * 42, 640, 19, '400', C.sub));

  roundRect(ctx, 820, 490, 700, 250, 12);
  ctx.fillStyle = C.panel;
  ctx.fill();
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();
  textLeft(ctx, 'Hydrolysis \u2014 the reverse reaction', 850, 528, 640, 23, '700', C.accent2);
  [
    'warm the ester with water and an acid or alkali catalyst',
    'the ester link splits back into the acid and the alcohol',
    'digesting a fat is hydrolysis doing exactly this',
  ].forEach((ln, i) => textLeft(ctx, ln, 850, 572 + i * 42, 640, 19, '400', C.sub));

  save('a22-esterification.png', canvas);
}

/* ---------- 9. IR spectrum of propan-1-ol ---------- */
function renderIRSpectrum() {
  const W = 1600, H = 900;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Infrared spectrum of propan-1-ol', 'each dip is a bond vibrating at its own frequency');

  const pxL = 220, pxR = 1440;
  const wOf = (w) => pxL + ((4000 - w) / 3500) * (pxR - pxL);
  const tOf = (t) => 700 - t * 5; // transmission 0..100

  // gridlines
  for (let t = 0; t <= 100; t += 25) {
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(pxL, tOf(t));
    ctx.lineTo(pxR, tOf(t));
    ctx.stroke();
    ctx.fillStyle = C.sub;
    setFont(ctx, 17, '400');
    ctx.textAlign = 'right';
    ctx.fillText(String(t), pxL - 12, tOf(t) + 6);
  }
  // x ticks
  for (let w = 4000; w >= 500; w -= 500) {
    ctx.fillStyle = C.sub;
    setFont(ctx, 17, '400');
    ctx.textAlign = 'center';
    ctx.fillText(String(w), wOf(w), 726);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(wOf(w), 700);
    ctx.lineTo(wOf(w), 710);
    ctx.stroke();
  }

  // spectrum curve
  const T = (w) => {
    const dip = (c, sig, d) => d * Math.exp(-((w - c) * (w - c)) / (2 * sig * sig));
    return 88 - dip(3350, 130, 55) - dip(2950, 45, 38) - dip(1050, 40, 45);
  };
  ctx.strokeStyle = C.accent2;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  let first = true;
  for (let w = 4000; w >= 500; w -= 4) {
    const x = wOf(w), y = tOf(T(w));
    if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // axes
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(pxL, 200);
  ctx.lineTo(pxL, 700);
  ctx.lineTo(pxR, 700);
  ctx.stroke();

  // annotations
  const ann = [
    { label: 'broad O\u2013H dip: 3200\u20133600 \u2014 the alcohol fingerprint', lx: 600, ly: 300, ax: wOf(3350), ay: tOf(33) },
    { label: 'C\u2013H stretch near 2900', lx: 900, ly: 240, ax: wOf(2950), ay: tOf(50) },
    { label: 'C\u2013O: 1000\u20131300', lx: 1230, ly: 560, ax: wOf(1050), ay: tOf(43) },
  ];
  ann.forEach((a) => {
    textCentered(ctx, a.label, a.lx, a.ly, 480, 20, '700', C.accent);
    ctx.save();
    ctx.setLineDash([8, 6]);
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(a.lx, a.ly + 16);
    ctx.lineTo(a.ax, a.ay - 14);
    ctx.stroke();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(a.ax, a.ay, 7, 0, Math.PI * 2);
    ctx.fillStyle = C.accent;
    ctx.fill();
  });

  // no C=O marker
  ctx.save();
  ctx.setLineDash([10, 7]);
  ctx.strokeStyle = C.faint;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(wOf(1720), 200);
  ctx.lineTo(wOf(1720), 700);
  ctx.stroke();
  ctx.restore();
  textCentered(ctx, 'no dip near 1720 \u2014 a C=O would show here', wOf(1720) + 40, 220, 400, 18, '400', C.faint);

  // axis labels
  ctx.save();
  ctx.translate(150, 450);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  setFont(ctx, 19, '700');
  ctx.fillStyle = C.ink;
  ctx.fillText('Transmission (%)', 0, 0);
  ctx.restore();
  textCentered(ctx, 'Wavenumber / cm\u207B\u00B9', (pxL + pxR) / 2, 768, 400, 19, '700');

  textCentered(ctx, 'IR identifies the functional groups; a mass spectrum adds the Mr \u2014 together they pin a molecule down', W / 2, H - 42, W - 200, 20, '400', C.sub);
  save('a22-ir-spectrum.png', canvas);
}

/* ---------- 10. Aspirin synthesis ---------- */
function renderAspirin() {
  const W = 1600, H = 820;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'The aspirin synthesis', 'salicylic acid + ethanoic anhydride \u2192 aspirin + ethanoic acid');

  // salicylic acid ring
  hexRing(ctx, 330, 430, 100);
  // COOH at top-left vertex (210 degrees)
  bond(ctx, 244, 380, 170, 330);
  atom(ctx, 'COOH', 135, 310, 21, C.accent);
  // OH at top-right vertex (330 degrees)
  bond(ctx, 416, 380, 480, 330);
  atom(ctx, 'OH', 505, 310, 21, C.accent);
  textCentered(ctx, 'salicylic acid', 330, 610, 300, 26, '700');
  textCentered(ctx, '(2-hydroxybenzoic acid)', 330, 650, 320, 19, '400', C.sub);

  textCentered(ctx, '+', 640, 430, 60, 40, '700');
  textCentered(ctx, '(CH3CO)2O', 810, 412, 280, 26, '700');
  textCentered(ctx, 'ethanoic anhydride', 810, 455, 280, 19, '400', C.sub);

  arrow(ctx, 960, 430, 1190, 430, 4, C.ink);
  textCentered(ctx, 'warm, about 80 \u00B0C', 1075, 388, 220, 18, '400', C.sub);
  textCentered(ctx, 'a few drops of H2SO4', 1075, 472, 240, 18, '400', C.sub);

  // aspirin ring
  hexRing(ctx, 1360, 430, 100);
  bond(ctx, 1274, 380, 1200, 330);
  atom(ctx, 'COOH', 1165, 310, 21, C.accent);
  bond(ctx, 1446, 380, 1510, 330);
  atom(ctx, 'O\u2013COCH3', 1470, 306, 21, C.accent);
  textCentered(ctx, 'the ester bond \u2014', 1470, 342, 230, 17, '700', C.warn);
  textCentered(ctx, 'aspirin is born here', 1470, 362, 230, 17, '700', C.warn);
  textCentered(ctx, 'aspirin', 1360, 610, 300, 26, '700');
  textCentered(ctx, '(acetylsalicylic acid)', 1360, 650, 320, 19, '400', C.sub);

  textCentered(ctx, 'The anhydride, not the acid, is used because it drives the reaction one way; ethanoic acid is the other product', W / 2, H - 42, W - 200, 20, '400', C.sub);
  save('a22-aspirin-synthesis.png', canvas);
}

renderFormulae();
renderFunctionalGroups();
renderIsomerism();
renderCombustion();
renderAlkeneAddition();
renderPolymerisation();
renderAlcoholOxidation();
renderEsterification();
renderIRSpectrum();
renderAspirin();

module.exports = { files: results };