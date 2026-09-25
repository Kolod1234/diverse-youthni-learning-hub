// Renders the four custom diagrams for the LHS AS 2 "Nutrition and the
// Balanced Diet" chapter into public/lesson-assets/lhs-as2/.
// Drawn with node-canvas at 2x for crisp display. UK Eatwell Guide
// proportions follow NHS guidance; energy values are standard Atwater
// figures (carbohydrate 17, protein 17, fat 37, alcohol 29 kJ per gram).

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const OUT_DIR = path.join(__dirname, '..', '..', 'public', 'lesson-assets', 'lhs-as2');
const SCALE = 2;
const FONT = "'DejaVu Sans', Arial, sans-serif";

function makeCanvas(w, h) {
  const canvas = createCanvas(w * SCALE, h * SCALE);
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);
  return { canvas, ctx };
}

function save(canvas, name) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, name);
  fs.writeFileSync(file, canvas.toBuffer('image/png'));
  return { name, bytes: fs.statSync(file).size };
}

function setFont(ctx, size, weight) {
  ctx.font = `${weight || ''} ${size}px ${FONT}`.trim();
  ctx.textBaseline = 'alphabetic';
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// ------------------------------------------------------------------
// Figure 1 — the Eatwell Guide proportions bar with legend
// ------------------------------------------------------------------
function eatwellBar() {
  const { canvas, ctx } = makeCanvas(1600, 620);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1600, 620);

  setFont(ctx, 40, 'bold');
  ctx.fillStyle = '#1f2937';
  ctx.textAlign = 'center';
  ctx.fillText('The Eatwell Guide: how a balanced diet divides up', 800, 72);

  const x0 = 110, barW = 1380, y0 = 150, h = 130;
  const segs = [
    { pct: 40, colour: '#3f9c46', label: 'Fruit and vegetables' },
    { pct: 38, colour: '#d2a05e', label: 'Potatoes, bread, rice, pasta and other starchy carbohydrates' },
    { pct: 12, colour: '#d45d79', label: 'Beans, pulses, fish, eggs, meat and other proteins' },
    { pct: 8, colour: '#4a90d9', label: 'Milk and dairy alternatives' },
    { pct: 1, colour: '#f0b429', label: 'Oils and spreads' },
  ];
  let x = x0;
  for (const s of segs) {
    const w = (s.pct / 100) * barW;
    ctx.fillStyle = s.colour;
    ctx.fillRect(x, y0, w, h);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(x, y0, w, h);
    if (s.pct >= 8) {
      setFont(ctx, 34, 'bold');
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(s.pct + '%', x + w / 2, y0 + h / 2 + 12);
    }
    x += w;
  }

  // Legend, two columns
  const legend = [
    { colour: '#3f9c46', text: 'Fruit and vegetables — 40%' },
    { colour: '#d2a05e', text: 'Potatoes, bread, rice, pasta and other' },
    { colour: '#d45d79', text: 'Beans, pulses, fish, eggs, meat and other' },
    { colour: '#4a90d9', text: 'Milk and dairy (or alternatives) — 8%' },
    { colour: '#f0b429', text: 'Oils and spreads — about 1% (small amounts)' },
  ];
  const legend2 = [
    '',
    'starchy carbohydrates — 38%',
    'proteins — 12%',
  ];
  const colX = [320, 1120];
  let row = 0;
  for (let i = 0; i < legend.length; i++) {
    const cx = colX[i < 3 ? 0 : 1];
    const ly = 360 + (i < 3 ? row : row - 3) * 0; // computed below
    row++;
  }
  // Simpler, explicit placement
  const items = [
    { x: 320, y: 340, colour: '#3f9c46', text: 'Fruit and vegetables — 40%' },
    { x: 320, y: 390, colour: '#d2a05e', text: 'Potatoes, bread, rice, pasta and other starchy' },
    { x: 320, y: 430, colour: null, text: 'carbohydrates — 38%' },
    { x: 320, y: 480, colour: '#d45d79', text: 'Beans, pulses, fish, eggs, meat and other' },
    { x: 320, y: 520, colour: null, text: 'proteins — 12%' },
    { x: 1050, y: 340, colour: '#4a90d9', text: 'Milk and dairy (or alternatives) — 8%' },
    { x: 1050, y: 390, colour: '#f0b429', text: 'Oils and spreads — about 1%' },
  ];
  setFont(ctx, 28, '');
  ctx.textAlign = 'left';
  for (const it of items) {
    if (it.colour) {
      ctx.fillStyle = it.colour;
      ctx.fillRect(it.x - 40, it.y - 22, 28, 28);
    }
    ctx.fillStyle = '#1f2937';
    ctx.fillText(it.text, it.x, it.y);
  }
  return save(canvas, 'nutrition-eatwell-proportions.png');
}

// ------------------------------------------------------------------
// Figure 2 — energy balance shown as three balance scales
// ------------------------------------------------------------------
function energyBalance() {
  const { canvas, ctx } = makeCanvas(1600, 640);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1600, 640);

  const panels = [
    { cx: 270, tilt: 0, title: 'Stable body mass', lines: ['Energy in = energy out', 'Body mass stays the same'] },
    { cx: 800, tilt: 9, title: 'Body mass gain', lines: ['Energy in > energy out', 'The surplus is stored, mainly as fat'] },
    { cx: 1330, tilt: -9, title: 'Body mass loss', lines: ['Energy in < energy out', 'The deficit is drawn from body stores'] },
  ];

  ctx.lineWidth = 5;
  for (const p of panels) {
    const pivotY = 250;
    // stand and base
    ctx.strokeStyle = '#455a64';
    ctx.beginPath();
    ctx.moveTo(p.cx, pivotY);
    ctx.lineTo(p.cx, 470);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(p.cx, 474, 70, 14, 0, 0, Math.PI * 2);
    ctx.stroke();
    // beam
    const rad = (p.tilt * Math.PI) / 180;
    const half = 185;
    const lx = p.cx - Math.cos(rad) * half;
    const ly = pivotY + Math.sin(rad) * half;
    const rx = p.cx + Math.cos(rad) * half;
    const ry = pivotY - Math.sin(rad) * half;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(rx, ry);
    ctx.stroke();
    // pivot bolt
    ctx.fillStyle = '#455a64';
    ctx.beginPath();
    ctx.arc(p.cx, pivotY, 10, 0, Math.PI * 2);
    ctx.fill();
    // pans
    const pans = [
      { bx: lx, by: ly, fill: '#fb8c00', label: 'Energy in', labelY: ly + 108 },
      { bx: rx, by: ry, fill: '#0288d1', label: 'Energy out', labelY: ry + 108 },
    ];
    for (const pan of pans) {
      const panY = pan.by + 62;
      ctx.strokeStyle = '#90a4ae';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pan.bx - 52, pan.by);
      ctx.lineTo(pan.bx - 52, panY);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(pan.bx + 52, pan.by);
      ctx.lineTo(pan.bx + 52, panY);
      ctx.stroke();
      ctx.fillStyle = pan.fill;
      ctx.beginPath();
      ctx.ellipse(pan.bx, panY + 8, 68, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#37474f';
      ctx.lineWidth = 4;
      ctx.stroke();
      setFont(ctx, 27, 'bold');
      ctx.fillStyle = '#1f2937';
      ctx.textAlign = 'center';
      ctx.fillText(pan.label, pan.bx, pan.labelY);
    }
    // title and caption
    setFont(ctx, 30, 'bold');
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'center';
    ctx.fillText(p.title, p.cx, 110);
    setFont(ctx, 26, '');
    ctx.fillStyle = '#37474f';
    ctx.fillText(p.lines[0], p.cx, 570);
    ctx.fillText(p.lines[1], p.cx, 608);
  }
  return save(canvas, 'nutrition-energy-balance.png');
}

// ------------------------------------------------------------------
// Figure 3 — energy density of the macronutrients (kJ per gram)
// ------------------------------------------------------------------
function energyDensity() {
  const { canvas, ctx } = makeCanvas(1600, 840);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1600, 840);

  setFont(ctx, 40, 'bold');
  ctx.fillStyle = '#1f2937';
  ctx.textAlign = 'center';
  ctx.fillText('How much energy each nutrient provides', 800, 72);

  const x0 = 150, x1 = 1500, yTop = 130, y0 = 700, vmax = 40;
  const yFor = (v) => y0 - (v / vmax) * (y0 - yTop);

  // gridlines + y-axis labels
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 2;
  setFont(ctx, 26, '');
  for (let v = 0; v <= vmax; v += 10) {
    const y = yFor(v);
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'right';
    ctx.fillText(String(v), x0 - 14, y + 9);
  }
  setFont(ctx, 28, 'bold');
  ctx.save();
  ctx.translate(56, (yTop + y0) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#37474f';
  ctx.fillText('Energy (kJ per gram)', 0, 0);
  ctx.restore();

  // axes
  ctx.strokeStyle = '#37474f';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x0, yTop - 8);
  ctx.lineTo(x0, y0);
  ctx.lineTo(x1, y0);
  ctx.stroke();

  const bars = [
    { label: 'Carbohydrate', value: 17, colour: '#3f9c46' },
    { label: 'Protein', value: 17, colour: '#d45d79' },
    { label: 'Fat', value: 37, colour: '#ef6c00' },
    { label: 'Alcohol (not a nutrient)', value: 29, colour: '#8d8d8d' },
  ];
  const slot = (x1 - x0) / bars.length;
  bars.forEach((b, i) => {
    const bx = x0 + slot * i + slot / 2;
    const bw = 170;
    const y = yFor(b.value);
    ctx.fillStyle = b.colour;
    ctx.fillRect(bx - bw / 2, y, bw, y0 - y);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(bx - bw / 2, y, bw, y0 - y);
    setFont(ctx, 34, 'bold');
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'center';
    ctx.fillText(String(b.value), bx, y - 16);
    setFont(ctx, 27, '');
    ctx.fillStyle = '#37474f';
    ctx.fillText(b.label, bx, y0 + 46);
  });
  return save(canvas, 'nutrition-energy-density.png');
}

// ------------------------------------------------------------------
// Figure 4 — BMI category bands for adults
// ------------------------------------------------------------------
function bmiBands() {
  const { canvas, ctx } = makeCanvas(1600, 420);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1600, 420);

  setFont(ctx, 40, 'bold');
  ctx.fillStyle = '#1f2937';
  ctx.textAlign = 'center';
  ctx.fillText('Body mass index (BMI) categories for adults', 800, 72);

  const xFor = (v) => 130 + (v - 15) * ((1470 - 130) / 25);
  const y0 = 140, h = 110;
  const bands = [
    { from: 15, to: 18.5, colour: '#5aa7d6', label: 'Underweight' },
    { from: 18.5, to: 25, colour: '#58b368', label: 'Healthy weight' },
    { from: 25, to: 30, colour: '#eab04c', label: 'Overweight' },
    { from: 30, to: 40, colour: '#e05a5a', label: 'Obese' },
  ];
  for (const b of bands) {
    const xa = xFor(b.from), xb = xFor(b.to);
    ctx.fillStyle = b.colour;
    ctx.fillRect(xa, y0, xb - xa, h);
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.strokeRect(xa, y0, xb - xa, h);
    setFont(ctx, 30, 'bold');
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.fillText(b.label, (xa + xb) / 2, y0 + h / 2 + 11);
  }
  // range text under each band
  const ranges = ['below 18.5', '18.5 – 24.9', '25 – 29.9', '30 and above'];
  setFont(ctx, 26, '');
  ctx.fillStyle = '#37474f';
  bands.forEach((b, i) => {
    const xa = xFor(b.from), xb = xFor(b.to);
    ctx.fillText(ranges[i], (xa + xb) / 2, y0 + h + 40);
  });
  // axis
  ctx.strokeStyle = '#37474f';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(130, y0 + h + 4);
  ctx.lineTo(1470, y0 + h + 4);
  ctx.stroke();
  const ticks = [15, 18.5, 25, 30, 40];
  setFont(ctx, 26, '');
  ctx.fillStyle = '#37474f';
  for (const t of ticks) {
    const tx = xFor(t);
    ctx.beginPath();
    ctx.moveTo(tx, y0 + h + 4);
    ctx.lineTo(tx, y0 + h + 16);
    ctx.stroke();
    ctx.textAlign = t === 15 ? 'left' : t === 40 ? 'right' : 'center';
    ctx.fillText(String(t), tx, y0 + h + 48);
  }
  setFont(ctx, 26, '');
  ctx.textAlign = 'center';
  ctx.fillStyle = '#6b7280';
  ctx.fillText('BMI is calculated as mass (kg) divided by height squared (m\u00b2)', 800, 388);
  return save(canvas, 'nutrition-bmi-categories.png');
}

const results = [
  eatwellBar(),
  energyBalance(),
  energyDensity(),
  bmiBands(),
];
module.exports = { results };