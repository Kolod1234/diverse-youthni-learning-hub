#!/usr/bin/env node
/*
 * Renders the nine diagrams for Single Award Science lesson 1.8
 * (Ecological Relationships) as high-resolution plotted PNGs, in the same
 * design language as the sas16/sas17 series (white background, Helvetica
 * labels, leader lines with dots, teal/coral accents, no edge clipping).
 *
 *   sas18-photosynthesis.png     - inputs/outputs around a plant + equation
 *   sas18-limiting-factors.png   - three rate-limiting-factor graphs
 *   sas18-food-chain.png         - oak food chain with trophic levels
 *   sas18-food-web.png           - woodland food web
 *   sas18-pyramids.png           - pyramid of numbers vs biomass
 *   sas18-energy-loss.png        - energy transfer with ~10% efficiency
 *   sas18-predator-prey.png      - predator-prey population cycle graph
 *   sas18-quadrat-sampling.png   - quadrat + transect method panels
 *   sas18-indicators.png         - air (lichen) and water (invertebrate) indicators
 *
 * Drafts are written to public/lesson-assets/sas-biology/draft-sas18/ first.
 * Set RENDER_ONLY=a,b,c to render a subset (comma-separated keys).
 */
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'public', 'lesson-assets', 'sas-biology', 'draft-sas18');
fs.mkdirSync(OUT_DIR, { recursive: true });

const INK = '#1e293b';
const GREY = '#475569';
const LEADER = '#64748b';
const TEAL = '#0f766e';
const CORAL = '#be123c';
const BLUE = '#1d4ed8';
const AMBER = '#b45309';
const LIGHT = '#e2e8f0';
const GRASS = '#4d7c0f';
const GRASS_LIGHT = '#a3c64d';

const rad = (d) => (d * Math.PI) / 180;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; }
    else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

function drawBlock(ctx, text, cx, y, maxW, font, color, lineH) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const lines = wrapText(ctx, text, maxW);
  let yy = y;
  for (const l of lines) { ctx.fillText(l, cx, yy); yy += lineH; }
  return yy - lineH;
}

function drawBlockLeft(ctx, text, x, y, maxW, font, color, lineH) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const lines = wrapText(ctx, text, maxW);
  let yy = y;
  for (const l of lines) { ctx.fillText(l, x, yy); yy += lineH; }
  return yy - lineH;
}

function arrow(ctx, x1, y1, x2, y2, color, width = 6, head = 20) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const ang = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(ang - 0.42), y2 - head * Math.sin(ang - 0.42));
  ctx.lineTo(x2 - head * Math.cos(ang + 0.42), y2 - head * Math.sin(ang + 0.42));
  ctx.closePath();
  ctx.fill();
}

function curveArrow(ctx, pts, color, width = 6, head = 20) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
  ctx.stroke();
  const [x1, y1] = pts[pts.length - 2];
  const [x2, y2] = pts[pts.length - 1];
  const ang = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(ang - 0.42), y2 - head * Math.sin(ang - 0.42));
  ctx.lineTo(x2 - head * Math.cos(ang + 0.42), y2 - head * Math.sin(ang + 0.42));
  ctx.closePath();
  ctx.fill();
}

function leader(ctx, x1, y1, x2, y2) {
  ctx.strokeStyle = LEADER;
  ctx.fillStyle = LEADER;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x2, y2, 6, 0, Math.PI * 2);
  ctx.fill();
}

function titleBlock(ctx, text, cx, y) {
  return drawBlock(ctx, text, cx, y, 1900, 'bold 52px Helvetica, Arial, sans-serif', INK, 62);
}

function labelPair(ctx, name, role, x, y, maxW) {
  const nb = drawBlockLeft(ctx, name, x, y, maxW, 'bold 38px Helvetica, Arial, sans-serif', INK, 44);
  const rb = drawBlockLeft(ctx, role, x, nb + 46, maxW, '28px Helvetica, Arial, sans-serif', GREY, 34);
  return rb;
}

function edgeCheck(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const d = ctx.getImageData(0, 0, W, H).data;
  let bad = 0;
  for (let x = 0; x < W; x++) {
    for (const y of [0, 1, H - 2, H - 1]) {
      const i = (y * W + x) * 4;
      if (d[i] < 250 || d[i + 1] < 250 || d[i + 2] < 250) bad++;
    }
  }
  for (let y = 0; y < H; y++) {
    for (const x of [0, 1, W - 2, W - 1]) {
      const i = (y * W + x) * 4;
      if (d[i] < 250 || d[i + 1] < 250 || d[i + 2] < 250) bad++;
    }
  }
  return bad;
}

function save(canvas, file, results) {
  const bad = edgeCheck(canvas);
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUT_DIR, file), buf);
  results.push({ file, width: canvas.width, height: canvas.height, kb: Math.round(buf.length / 1024), edgeViolations: bad });
}

function newCanvas(W, H) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  return { canvas, ctx };
}

function panel(ctx, x, y, w, h) {
  ctx.strokeStyle = LIGHT;
  ctx.lineWidth = 4;
  roundRect(ctx, x, y, w, h, 28);
  ctx.stroke();
}

/* ---------- shared mini-drawings ---------- */

function drawTree(ctx, cx, cy, s) {
  // trunk
  ctx.fillStyle = '#92400e';
  ctx.fillRect(cx - 10 * s, cy, 20 * s, 70 * s);
  // canopy: three overlapping circles
  ctx.fillStyle = GRASS_LIGHT;
  ctx.strokeStyle = GRASS;
  ctx.lineWidth = 4;
  for (const [dx, dy, r] of [[-45, 40, 42], [45, 40, 42], [0, 10, 55]]) {
    ctx.beginPath();
    ctx.arc(cx + dx * s, cy - dy * s, r * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  ctx.fillStyle = '#78350f';
  ctx.fillRect(cx - 14 * s, cy + 68 * s, 28 * s, 14 * s); // ground
}

function drawCaterpillar(ctx, cx, cy, s) {
  ctx.strokeStyle = '#15803d';
  ctx.fillStyle = '#bbf7d0';
  ctx.lineWidth = 4;
  const segs = [[-60, 0, 26], [-20, -8, 30], [20, -8, 30], [60, 0, 26]];
  for (const [dx, dy, r] of segs) {
    ctx.beginPath();
    ctx.arc(cx + dx * s, cy + dy * s, r * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // head
  ctx.fillStyle = '#86efac';
  ctx.beginPath();
  ctx.arc(cx + 100 * s, cy - 4 * s, 20 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // eyes
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(cx + 106 * s, cy - 10 * s, 4 * s, 0, Math.PI * 2);
  ctx.fill();
  // legs
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 4;
  for (const dx of [-50, -10, 30, 70]) {
    ctx.beginPath();
    ctx.moveTo(cx + dx * s, cy + 22 * s);
    ctx.lineTo(cx + dx * s, cy + 38 * s);
    ctx.stroke();
  }
}

function drawBird(ctx, cx, cy, s, bodyColor, isHawk) {
  // body ellipse
  ctx.fillStyle = bodyColor;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.ellipse(cx, cy, 60 * s, 38 * s, -0.15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // head
  ctx.beginPath();
  ctx.arc(cx + 58 * s, cy - 26 * s, 22 * s, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // beak
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.moveTo(cx + 76 * s, cy - 30 * s);
  ctx.lineTo(cx + (isHawk ? 112 : 98) * s, cy - 24 * s);
  ctx.lineTo(cx + 76 * s, cy - 18 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // eye
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(cx + 64 * s, cy - 30 * s, 4 * s, 0, Math.PI * 2);
  ctx.fill();
  // wing
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.ellipse(cx - 8 * s, cy - 6 * s, 30 * s, 16 * s, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // tail
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.moveTo(cx - 56 * s, cy - 12 * s);
  ctx.lineTo(cx - 96 * s, cy - 26 * s);
  ctx.lineTo(cx - 96 * s, cy + 6 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // legs
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 5;
  for (const dx of [-14, 14]) {
    ctx.beginPath();
    ctx.moveTo(cx + dx * s, cy + 36 * s);
    ctx.lineTo(cx + dx * s, cy + 58 * s);
    ctx.stroke();
  }
}

function drawSun(ctx, cx, cy, r) {
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (r + 12), cy + Math.sin(a) * (r + 12));
    ctx.lineTo(cx + Math.cos(a) * (r + 42), cy + Math.sin(a) * (r + 42));
    ctx.stroke();
  }
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 5;
  ctx.stroke();
}

function drawDaisy(ctx, cx, cy, s) {
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    ctx.beginPath();
    ctx.ellipse(cx + Math.cos(a) * 9 * s, cy + Math.sin(a) * 9 * s, 8 * s, 4 * s, a, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(cx, cy, 5 * s, 0, Math.PI * 2);
  ctx.fill();
}

function drawAxes(ctx, ox, oy, w, h, xLabel, yLabel) {
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(ox + w, oy);
  ctx.moveTo(ox, oy);
  ctx.lineTo(ox, oy - h);
  ctx.stroke();
  // arrowheads
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.moveTo(ox + w + 16, oy);
  ctx.lineTo(ox + w - 8, oy - 10);
  ctx.lineTo(ox + w - 8, oy + 10);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(ox, oy - h - 16);
  ctx.lineTo(ox - 10, oy - h + 8);
  ctx.lineTo(ox + 10, oy - h + 8);
  ctx.closePath();
  ctx.fill();
  ctx.font = '28px Helvetica, Arial, sans-serif';
  ctx.fillStyle = GREY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(xLabel, ox + w / 2, oy + 26);
  ctx.save();
  ctx.translate(ox - 30, oy - h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText(yLabel, 0, 0);
  ctx.restore();
}

/* ---------- renderers ---------- */

const results = [];

function renderPhotosynthesis() {
  const { canvas, ctx } = newCanvas(2400, 1560);
  titleBlock(ctx, 'Photosynthesis — what goes in, and what comes out', 1200, 80);

  // ground line
  ctx.strokeStyle = '#a16207';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(300, 1120);
  ctx.lineTo(1300, 1120);
  ctx.stroke();
  // soil hatch
  ctx.strokeStyle = '#d6b98c';
  ctx.lineWidth = 4;
  for (let x = 320; x < 1290; x += 60) {
    ctx.beginPath();
    ctx.moveTo(x, 1140);
    ctx.lineTo(x + 30, 1170);
    ctx.stroke();
  }

  // plant: stem + two leaves + roots
  ctx.strokeStyle = GRASS;
  ctx.lineWidth = 12;
  ctx.beginPath();
  ctx.moveTo(800, 1120);
  ctx.lineTo(800, 620);
  ctx.stroke();
  ctx.lineWidth = 8;
  for (const dx of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(800, 1090);
    ctx.quadraticCurveTo(800 + dx * 90, 1180, 800 + dx * 160, 1150);
    ctx.stroke();
  }
  // leaves
  ctx.fillStyle = GRASS_LIGHT;
  ctx.strokeStyle = GRASS;
  ctx.lineWidth = 6;
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(800 + dir * 130, 730, 120, 55, dir * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }

  // sun (top-left)
  drawSun(ctx, 400, 320, 80);
  arrow(ctx, 520, 400, 680, 600, AMBER, 8, 24);
  drawBlock(ctx, 'light energy', 330, 470, 240, 'bold 34px Helvetica, Arial, sans-serif', AMBER, 40);

  // CO2 in from air (top-right, clear of the equation panel)
  drawBlock(ctx, 'carbon dioxide', 1450, 240, 380, 'bold 34px Helvetica, Arial, sans-serif', CORAL, 40);
  drawBlock(ctx, '(from the air)', 1450, 284, 380, '28px Helvetica, Arial, sans-serif', CORAL, 34);
  arrow(ctx, 1300, 340, 1000, 640, CORAL, 8, 24);

  // water up from roots (bottom-left)
  arrow(ctx, 600, 1240, 770, 1040, BLUE, 8, 24);
  drawBlock(ctx, 'water', 380, 1270, 300, 'bold 34px Helvetica, Arial, sans-serif', BLUE, 40);
  drawBlock(ctx, '(from the soil, up the roots)', 380, 1318, 460, '28px Helvetica, Arial, sans-serif', BLUE, 34);

  // O2 out (mid-right, below the chlorophyll note)
  arrow(ctx, 1000, 760, 1450, 800, TEAL, 8, 24);
  drawBlock(ctx, 'oxygen (given out)', 1750, 770, 340, 'bold 34px Helvetica, Arial, sans-serif', TEAL, 40);

  // glucose down the plant
  arrow(ctx, 800, 820, 800, 990, GRASS, 8, 24);
  drawBlockLeft(ctx, 'glucose — food made, energy stored', 860, 860, 460, 'bold 32px Helvetica, Arial, sans-serif', GRASS, 38);

  // chloroplast note
  leader(ctx, 940, 710, 1030, 710);
  drawBlock(ctx, 'chlorophyll in the leaf absorbs the light energy', 1360, 692, 640, '28px Helvetica, Arial, sans-serif', GREY, 34);

  // equation band
  panel(ctx, 1700, 120, 600, 520);
  drawBlock(ctx, 'The word equation', 2000, 180, 500, 'bold 36px Helvetica, Arial, sans-serif', INK, 42);
  drawBlock(ctx, 'carbon dioxide + water', 2000, 300, 500, 'bold 34px Helvetica, Arial, sans-serif', INK, 42);
  drawBlock(ctx, 'light energy\nchlorophyll', 2000, 380, 500, '30px Helvetica, Arial, sans-serif', AMBER, 36);
  drawBlock(ctx, 'glucose + oxygen', 2000, 500, 500, 'bold 34px Helvetica, Arial, sans-serif', INK, 42);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(1830, 445);
  ctx.lineTo(2160, 445);
  ctx.stroke();
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.moveTo(2180, 445);
  ctx.lineTo(2150, 433);
  ctx.lineTo(2150, 457);
  ctx.closePath();
  ctx.fill();
  drawBlock(ctx, 'The reaction is endothermic —\nit takes in light energy', 2000, 580, 520, '28px Helvetica, Arial, sans-serif', GREY, 34);

  // endothermic strip
  drawBlock(ctx, 'Photosynthesis happens inside chloroplasts in the leaf cells (page 3). The glucose it makes is the food of almost every ecosystem on Earth.', 1200, 1420, 2000, '30px Helvetica, Arial, sans-serif', GREY, 38);

  save(canvas, 'sas18-photosynthesis.png', results);
}

function renderLimitingFactors() {
  const { canvas, ctx } = newCanvas(2400, 1400);
  titleBlock(ctx, 'Limiting factors — what sets the speed of photosynthesis', 1200, 80);

  const panels = [
    { x: 100, title: '1 · Light intensity', xlab: 'light intensity', pts: [[0, 0], [80, 130], [160, 215], [260, 270], [360, 285], [460, 288]], steep: 'light is the limiting factor', flat: 'another factor (carbon dioxide) is now limiting' },
    { x: 850, title: '2 · Carbon dioxide concentration', xlab: 'CO\u2082 concentration', pts: [[0, 0], [80, 110], [160, 190], [260, 255], [360, 292], [460, 296]], steep: 'CO\u2082 is the limiting factor', flat: 'light or temperature is now limiting' },
    { x: 1600, title: '3 · Temperature', xlab: 'temperature (\u00b0C)', pts: [[0, 10], [70, 100], [140, 210], [210, 290], [265, 310], [320, 240], [380, 120], [440, 40]], steep: 'warmer = faster, up to the optimum', flat: 'enzymes denature — the rate collapses to zero' },
  ];
  for (const p of panels) {
    panel(ctx, p.x, 200, 700, 1080);
    drawBlock(ctx, p.title, p.x + 350, 250, 620, 'bold 38px Helvetica, Arial, sans-serif', INK, 46);
    const ox = p.x + 130, oy = 880, w = 460, h = 420;
    drawAxes(ctx, ox, oy, w, h, p.xlab, 'rate of photosynthesis');
    // curve
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(ox + p.pts[0][0], oy - p.pts[0][1]);
    for (let i = 1; i < p.pts.length; i++) ctx.lineTo(ox + p.pts[i][0], oy - p.pts[i][1]);
    ctx.stroke();
    // annotations
    leader(ctx, ox + 120, oy - 160, ox + 30, oy - 330);
    drawBlockLeft(ctx, p.steep, p.x + 60, oy - 420, 330, '26px Helvetica, Arial, sans-serif', GREY, 32);
    const last = p.pts[p.pts.length - 1];
    // dashed guide from the far end of the curve down to the caption below the axis
    ctx.strokeStyle = LEADER;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(ox + last[0] * 0.6, oy - last[1]);
    ctx.lineTo(ox + last[0] * 0.6, oy + 70);
    ctx.stroke();
    ctx.setLineDash([]);
    drawBlock(ctx, p.flat, p.x + 350, oy + 120, 620, '26px Helvetica, Arial, sans-serif', GREY, 32);
    if (p.title.startsWith('3')) {
      // optimum marker
      ctx.strokeStyle = CORAL;
      ctx.lineWidth = 4;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.moveTo(ox + 265, oy);
      ctx.lineTo(ox + 265, oy - 315);
      ctx.stroke();
      ctx.setLineDash([]);
      drawBlockLeft(ctx, 'optimum', ox + 285, oy - 260, 200, 'bold 28px Helvetica, Arial, sans-serif', CORAL, 34);
    }
  }
  drawBlock(ctx, 'Raising the limiting factor raises the rate — until a different factor runs short. Only temperature damages the machinery: past the optimum the rate falls to zero.', 1200, 1310, 2100, '30px Helvetica, Arial, sans-serif', GREY, 38);

  save(canvas, 'sas18-limiting-factors.png', results);
}

function renderFoodChain() {
  const { canvas, ctx } = newCanvas(2400, 1380);
  titleBlock(ctx, 'A woodland food chain — energy passes along the arrows', 1200, 80);
  drawBlock(ctx, 'Every arrow points from the organism being eaten to the eater, because the arrows show the direction energy travels.', 1200, 190, 2000, '30px Helvetica, Arial, sans-serif', GREY, 38);

  const items = [
    { cx: 340, glyph: () => drawTree(ctx, 340, 560, 1.6), name: 'Oak tree', role: 'Producer — makes food by photosynthesis' },
    { cx: 900, glyph: () => drawCaterpillar(ctx, 880, 600, 1.4), name: 'Caterpillar', role: 'Primary consumer (herbivore) — eats the producer' },
    { cx: 1470, glyph: () => drawBird(ctx, 1470, 560, 1.1, '#60a5fa', false), name: 'Blue tit', role: 'Secondary consumer — eats the caterpillar' },
    { cx: 2050, glyph: () => drawBird(ctx, 2010, 520, 1.5, '#78716c', true), name: 'Sparrowhawk', role: 'Tertiary consumer — top predator' },
  ];
  for (const it of items) {
    it.glyph();
    labelPair(ctx, it.name, it.role, it.cx - 260, 800, 520);
  }
  // energy arrows between stages
  arrow(ctx, 560, 600, 700, 600, TEAL, 10, 30);
  arrow(ctx, 1080, 600, 1290, 600, TEAL, 10, 30);
  arrow(ctx, 1650, 600, 1850, 600, TEAL, 10, 30);
  drawBlock(ctx, 'energy', 630, 500, 200, 'bold 30px Helvetica, Arial, sans-serif', TEAL, 36);
  drawBlock(ctx, 'energy', 1180, 500, 200, 'bold 30px Helvetica, Arial, sans-serif', TEAL, 36);
  drawBlock(ctx, 'energy', 1750, 500, 200, 'bold 30px Helvetica, Arial, sans-serif', TEAL, 36);

  // decomposer loop
  panel(ctx, 300, 1060, 1800, 200);
  drawBlock(ctx, 'Dead leaves, bodies and droppings', 620, 1120, 440, '28px Helvetica, Arial, sans-serif', GREY, 34);
  curveArrow(ctx, [[860, 1160], [1020, 1160], [1020, 1200], [980, 1240], [920, 1240]], CORAL, 6, 18);
  drawBlock(ctx, 'Decomposers (bacteria and fungi) break them down', 1360, 1140, 520, '28px Helvetica, Arial, sans-serif', INK, 34);
  arrow(ctx, 1640, 1250, 380, 1250, GRASS, 6, 18);
  drawBlock(ctx, 'mineral ions recycled back to the soil for the plants', 1010, 1262, 560, '26px Helvetica, Arial, sans-serif', GRASS, 30);

  save(canvas, 'sas18-food-chain.png', results);
}

function renderFoodWeb() {
  const { canvas, ctx } = newCanvas(2400, 1700);
  titleBlock(ctx, 'A woodland food web — who eats whom', 1200, 70);
  drawBlock(ctx, 'Each arrow runs from the organism being eaten to the eater. Remove one species and every other link feels it.', 1200, 180, 1900, '30px Helvetica, Arial, sans-serif', GREY, 38);

  const nodes = {
    oak: { x: 240, y: 520, label: 'Oak tree', type: 'producer' },
    grass: { x: 240, y: 1240, label: 'Grass', type: 'producer' },
    aphid: { x: 700, y: 320, label: 'Aphids' },
    caterpillar: { x: 700, y: 780, label: 'Caterpillars' },
    rabbit: { x: 700, y: 1400, label: 'Rabbits' },
    mouse: { x: 700, y: 1060, label: 'Field mice' },
    blueTit: { x: 1280, y: 480, label: 'Blue tits' },
    frog: { x: 1280, y: 940, label: 'Frogs' },
    fox: { x: 1800, y: 1160, label: 'Foxes' },
    sparrowhawk: { x: 1800, y: 480, label: 'Sparrowhawks' },
  };
  const NW = 260, NH = 110;
  const nodeBox = (n) => ({ x: n.x - NW / 2, y: n.y - NH / 2, w: NW, h: NH });

  const links = [
    ['oak', 'aphid'], ['oak', 'caterpillar'], ['grass', 'rabbit'], ['grass', 'mouse'],
    ['aphid', 'blueTit'], ['caterpillar', 'blueTit'], ['caterpillar', 'frog'],
    ['rabbit', 'fox'], ['mouse', 'fox'], ['frog', 'fox'], ['blueTit', 'sparrowhawk'],
  ];
  for (const [from, to] of links) {
    const a = nodes[from], b = nodes[to];
    const ba = nodeBox(a), bb = nodeBox(b);
    let x1 = ba.x + ba.w / 2, y1 = a.y, x2 = bb.x - bb.w / 2 - 10, y2 = b.y;
    if (Math.abs(a.y - b.y) > 300) { x1 = a.x + (b.x > a.x ? ba.w / 2 : -ba.w / 2); }
    if (x1 < bb.x - bb.w / 2 && x1 > ba.x + ba.w / 2 && Math.abs(a.y - b.y) < 200) {
      // same row - leave from top
      y1 = ba.y - 6; x2 = b.x; y2 = bb.y - 6;
    }
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.quadraticCurveTo((x1 + x2) / 2 + (a.y > b.y ? 30 : -30), (y1 + y2) / 2, x2, y2);
    ctx.stroke();
    const ang = Math.atan2(y2 - (y1 + y2) / 2, x2 - (x1 + x2) / 2);
    ctx.fillStyle = '#94a3b8';
    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(x2 - 22 * Math.cos(ang - 0.42), y2 - 22 * Math.sin(ang - 0.42));
    ctx.lineTo(x2 - 22 * Math.cos(ang + 0.42), y2 - 22 * Math.sin(ang + 0.42));
    ctx.closePath();
    ctx.fill();
  }

  ctx.font = 'bold 34px Helvetica, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (const key of Object.keys(nodes)) {
    const n = nodes[key];
    const b = nodeBox(n);
    ctx.fillStyle = n.type === 'producer' ? '#ecfccb' : '#f1f5f9';
    ctx.strokeStyle = n.type === 'producer' ? GRASS : '#94a3b8';
    ctx.lineWidth = 5;
    roundRect(ctx, b.x, b.y, b.w, b.h, 24);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = INK;
    ctx.fillText(n.label, n.x, n.y);
  }
  drawBlock(ctx, 'Producers (yellow boxes) make food by photosynthesis — the rest of the web lives on what they catch, eat or find.', 1200, 1560, 1900, '30px Helvetica, Arial, sans-serif', GREY, 38);

  save(canvas, 'sas18-food-web.png', results);
}

function renderPyramids() {
  const { canvas, ctx } = newCanvas(2400, 1500);
  titleBlock(ctx, 'Pyramids of numbers and of biomass — the same wood, measured two ways', 1200, 80);

  // Left: pyramid of numbers
  panel(ctx, 120, 220, 1020, 1120);
  drawBlock(ctx, 'Pyramid of numbers', 630, 270, 900, 'bold 40px Helvetica, Arial, sans-serif', INK, 48);
  // bars are drawn bottom-up, so the producer sits at the bottom of the stack
  const barsNum = [
    { w: 110, label: '1 oak tree', side: true },
    { w: 780, label: '5,000 caterpillars', side: false },
    { w: 160, label: '50 blue tits', side: true },
    { w: 120, label: '2 sparrowhawks', side: true },
  ];
  let yNum = 1120;
  for (const b of barsNum) {
    const x = 630 - b.w / 2;
    ctx.fillStyle = TEAL;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    roundRect(ctx, x, yNum - 110, b.w, 110, 14);
    ctx.fill();
    ctx.stroke();
    ctx.font = 'bold 30px Helvetica, Arial, sans-serif';
    ctx.textBaseline = 'middle';
    if (b.side) {
      // narrow bar: label sits beside it in ink, not inside in white
      ctx.fillStyle = INK;
      ctx.textAlign = 'left';
      ctx.fillText(b.label, 630 + b.w / 2 + 24, yNum - 55);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(b.label, 630, yNum - 55);
    }
    yNum -= 130;
  }
  drawBlock(ctx, 'Counting individuals, the producer bar is tiny —\none tree feeds thousands of caterpillars', 630, 370, 900, '28px Helvetica, Arial, sans-serif', GREY, 34);

  // Right: pyramid of biomass
  panel(ctx, 1260, 220, 1020, 1120);
  drawBlock(ctx, 'Pyramid of biomass', 1770, 270, 900, 'bold 40px Helvetica, Arial, sans-serif', INK, 48);
  const barsBio = [
    { w: 830, label: '500 kg oak tree', side: false },
    { w: 480, label: '50 kg caterpillars', side: false },
    { w: 250, label: '5 kg blue tits', side: true },
    { w: 150, label: '0.5 kg sparrowhawks', side: true },
  ];
  let yBio = 1120;
  for (const b of barsBio) {
    const x = 1770 - b.w / 2;
    ctx.fillStyle = AMBER;
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    roundRect(ctx, x, yBio - 110, b.w, 110, 14);
    ctx.fill();
    ctx.stroke();
    ctx.font = 'bold 30px Helvetica, Arial, sans-serif';
    ctx.textBaseline = 'middle';
    if (b.side) {
      ctx.fillStyle = INK;
      ctx.textAlign = 'left';
      ctx.fillText(b.label, 1770 + b.w / 2 + 24, yBio - 55);
    } else {
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.fillText(b.label, 1770, yBio - 55);
    }
    yBio -= 130;
  }
  drawBlock(ctx, 'Measured by living mass (biomass = dry mass of living material), every level is about one tenth of the one below it', 1770, 370, 940, '28px Helvetica, Arial, sans-serif', GREY, 34);

  drawBlock(ctx, 'Biomass pyramids tell the true story of an ecosystem: the producer level is always the largest, because every level above it keeps only about 10% of what it eats.', 1200, 1390, 2100, '30px Helvetica, Arial, sans-serif', GREY, 38);

  save(canvas, 'sas18-pyramids.png', results);
}

function renderEnergyLoss() {
  const { canvas, ctx } = newCanvas(2400, 1560);
  titleBlock(ctx, 'Energy transfer — about 10% passes to the next level', 1200, 80);

  drawSun(ctx, 260, 420, 70);
  arrow(ctx, 380, 480, 620, 620, AMBER, 8, 24);
  drawBlock(ctx, 'sunlight energy', 250, 640, 340, 'bold 30px Helvetica, Arial, sans-serif', AMBER, 36);
  drawBlock(ctx, 'entering the food chain', 250, 682, 340, '28px Helvetica, Arial, sans-serif', AMBER, 34);

  const levels = [
    { y: 620, label: 'Producer — oak leaves', biomass: '1,000 kJ available' },
    { y: 900, label: 'Primary consumer — caterpillar', biomass: 'about 100 kJ available' },
    { y: 1180, label: 'Secondary consumer — blue tit', biomass: 'about 10 kJ available' },
  ];
  for (let i = 0; i < levels.length; i++) {
    const lv = levels[i];
    const w = 900 - i * 220;
    const x = 620, h = 140;
    ctx.fillStyle = i === 0 ? '#ecfccb' : i === 1 ? '#dcfce7' : '#e0f2fe';
    ctx.strokeStyle = i === 0 ? GRASS : '#0e7490';
    ctx.lineWidth = 5;
    roundRect(ctx, x, lv.y - h / 2, w, h, 20);
    ctx.fill();
    ctx.stroke();
    ctx.font = 'bold 34px Helvetica, Arial, sans-serif';
    ctx.fillStyle = INK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(lv.label, x + 30, lv.y - 20);
    ctx.font = '28px Helvetica, Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.fillText(lv.biomass, x + 30, lv.y + 28);

    if (i < levels.length - 1) {
      // transfer arrow (thinner each level)
      arrow(ctx, x + 180, lv.y + h / 2, x + 180, levels[i + 1].y - h / 2, TEAL, 14 - i * 4, 26);
      drawBlock(ctx, '\u2248 10% transferred', x + 420, lv.y + h / 2 + 30, 320, 'bold 30px Helvetica, Arial, sans-serif', TEAL, 36);
      // loss arrows to the right
      arrow(ctx, x + w, lv.y, x + w + 260, lv.y - 60, CORAL, 7, 20);
      arrow(ctx, x + w, lv.y, x + w + 260, lv.y + 60, CORAL, 7, 20);
    }
  }

  // losses list on the right
  panel(ctx, 1830, 700, 470, 620);
  drawBlock(ctx, 'Where the other 90% goes', 2065, 740, 420, 'bold 34px Helvetica, Arial, sans-serif', INK, 42);
  drawBlockLeft(ctx, 'respiration — energy released as heat', 1870, 830, 400, '28px Helvetica, Arial, sans-serif', GREY, 34);
  drawBlockLeft(ctx, 'movement — fuelled by respiration', 1870, 900, 400, '28px Helvetica, Arial, sans-serif', GREY, 34);
  drawBlockLeft(ctx, 'droppings and urine — undigested and excreted material', 1870, 970, 400, '28px Helvetica, Arial, sans-serif', GREY, 34);
  drawBlockLeft(ctx, 'uneaten parts — bones, fur, fallen leaves', 1870, 1080, 400, '28px Helvetica, Arial, sans-serif', GREY, 34);
  drawBlockLeft(ctx, 'death — energy passes to the decomposers, which release it as heat', 1870, 1150, 400, '28px Helvetica, Arial, sans-serif', GREY, 34);

  drawBlock(ctx, 'Energy flows in one direction — sun, producer, consumer, decomposer — and leaves the chain as heat. Materials, by contrast, are recycled.', 1200, 1420, 2100, '30px Helvetica, Arial, sans-serif', GREY, 38);

  save(canvas, 'sas18-energy-loss.png', results);
}

function renderPredatorPrey() {
  const { canvas, ctx } = newCanvas(2400, 1500);
  titleBlock(ctx, 'The predator\u2013prey cycle — populations that chase each other', 1200, 80);

  const ox = 420, oy = 1150, w = 1700, h = 780;
  drawAxes(ctx, ox, oy, w, h, 'time \u2192', 'population size');

  // prey curve (teal) and predator curve (coral, delayed)
  const preyPts = [], predPts = [];
  for (let t = 0; t <= 1.001; t += 0.02) {
    const yPrey = 340 + 300 * Math.sin(t * Math.PI * 2 - Math.PI / 2) - 60 * Math.sin(t * Math.PI * 4);
    const yPred = 340 + 210 * Math.sin(t * Math.PI * 2 - Math.PI / 2 - 1.1) - 30 * Math.sin(t * Math.PI * 4);
    preyPts.push([ox + t * w, oy - 120 - yPrey]);
    predPts.push([ox + t * w, oy - 120 - yPred]);
  }
  ctx.lineWidth = 8;
  ctx.strokeStyle = TEAL;
  ctx.beginPath();
  ctx.moveTo(preyPts[0][0], preyPts[0][1]);
  for (const p of preyPts) ctx.lineTo(p[0], p[1]);
  ctx.stroke();
  ctx.strokeStyle = CORAL;
  ctx.setLineDash([18, 12]);
  ctx.beginPath();
  ctx.moveTo(predPts[0][0], predPts[0][1]);
  for (const p of predPts) ctx.lineTo(p[0], p[1]);
  ctx.stroke();
  ctx.setLineDash([]);

  // legend
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(500, 300);
  ctx.lineTo(580, 300);
  ctx.stroke();
  drawBlockLeft(ctx, 'prey (rabbits)', 600, 282, 400, 'bold 32px Helvetica, Arial, sans-serif', INK, 38);
  ctx.strokeStyle = CORAL;
  ctx.lineWidth = 8;
  ctx.setLineDash([14, 10]);
  ctx.beginPath();
  ctx.moveTo(1050, 300);
  ctx.lineTo(1130, 300);
  ctx.stroke();
  ctx.setLineDash([]);
  drawBlockLeft(ctx, 'predator (foxes)', 1150, 282, 420, 'bold 32px Helvetica, Arial, sans-serif', INK, 38);

  // phase annotations
  const ann = [
    { t: 0.13, text: '1 · prey plentiful —\npredators breed successfully', color: TEAL },
    { t: 0.38, text: '2 · predator numbers rise\n(with a delay) — more prey eaten', color: CORAL },
    { t: 0.63, text: '3 · prey fall —\npredators go hungry', color: TEAL },
    { t: 0.88, text: '4 · predators fall —\nprey recover, and the cycle repeats', color: CORAL },
  ];
  for (const a of ann) {
    const x = ox + a.t * w;
    ctx.strokeStyle = LEADER;
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 8]);
    ctx.beginPath();
    ctx.moveTo(x, oy);
    ctx.lineTo(x, 400);
    ctx.stroke();
    ctx.setLineDash([]);
    drawBlock(ctx, a.text, x, 340, 380, '26px Helvetica, Arial, sans-serif', a.color, 32);
  }

  drawBlock(ctx, 'Each peak follows the other with a delay: the predator peak always comes after the prey peak. Competition, disease and food supply set the limits of both curves.', 1200, 1400, 2100, '30px Helvetica, Arial, sans-serif', GREY, 38);

  save(canvas, 'sas18-predator-prey.png', results);
}

function renderQuadrat() {
  const { canvas, ctx } = newCanvas(2400, 1500);
  titleBlock(ctx, 'Sampling a habitat — the quadrat and the transect', 1200, 80);

  // Left panel: quadrat
  panel(ctx, 120, 200, 1030, 1120);
  drawBlock(ctx, '1 · A quadrat counts what is there', 635, 250, 960, 'bold 38px Helvetica, Arial, sans-serif', INK, 46);
  // grass background
  ctx.fillStyle = '#eef7df';
  roundRect(ctx, 320, 340, 630, 630, 20);
  ctx.fill();
  // scattered grass tufts
  ctx.strokeStyle = GRASS_LIGHT;
  ctx.lineWidth = 3;
  for (let i = 0; i < 90; i++) {
    const gx = 340 + ((i * 61 + 13) % 590);
    const gy = 360 + ((i * 97 + 29) % 590);
    ctx.beginPath();
    ctx.moveTo(gx, gy);
    ctx.lineTo(gx + 6, gy - 12);
    ctx.moveTo(gx + 4, gy);
    ctx.lineTo(gx + 10, gy - 9);
    ctx.stroke();
  }
  // daisies
  const daisies = [[420, 430], [520, 390], [610, 470], [700, 400], [470, 560], [600, 590], [730, 530], [400, 680], [540, 720], [660, 680], [760, 640], [460, 800], [610, 830], [700, 770]];
  for (const [dx, dy] of daisies) drawDaisy(ctx, dx, dy, 1.3);
  // quadrat frame
  ctx.strokeStyle = INK;
  ctx.lineWidth = 8;
  ctx.strokeRect(360, 360, 550, 550);
  // corner ticks
  ctx.strokeStyle = GREY;
  ctx.lineWidth = 4;
  for (let i = 1; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(360 + i * 110, 360);
    ctx.lineTo(360 + i * 110, 375);
    ctx.moveTo(360 + i * 110, 910);
    ctx.lineTo(360 + i * 110, 895);
    ctx.stroke();
  }
  drawBlock(ctx, '1 m \u00d7 1 m frame — count the daisies inside', 635, 990, 900, '28px Helvetica, Arial, sans-serif', INK, 34);
  drawBlock(ctx, 'Place the quadrat at random (use random numbers) — never choose a spot because it looks typical. More quadrats give a more reliable average.', 635, 1060, 950, '28px Helvetica, Arial, sans-serif', GREY, 34);

  // Right panel: transect
  panel(ctx, 1250, 200, 1030, 1120);
  drawBlock(ctx, '2 · A transect shows where things live', 1765, 250, 960, 'bold 38px Helvetica, Arial, sans-serif', INK, 46);
  // gradient strip: hedge -> open field
  ctx.fillStyle = '#365314';
  roundRect(ctx, 1330, 400, 120, 560, 16);
  ctx.fill();
  drawBlock(ctx, 'hedge (shade, moist soil)', 1450, 330, 300, '26px Helvetica, Arial, sans-serif', INK, 32);
  ctx.fillStyle = '#eef7df';
  ctx.fillRect(1450, 400, 560, 560);
  ctx.fillStyle = '#d6d3d1';
  ctx.fillRect(2010, 400, 110, 560);
  drawBlock(ctx, 'path\n(dry, worn)', 2065, 380, 170, '26px Helvetica, Arial, sans-serif', INK, 32);
  // tape line
  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(1330, 680);
  ctx.lineTo(2120, 680);
  ctx.stroke();
  // quadrats along the line
  const quads = [{ qx: 1470, d: '0 m' }, { qx: 1660, d: '5 m' }, { qx: 1850, d: '10 m' }];
  for (const q of quads) {
    ctx.strokeStyle = INK;
    ctx.lineWidth = 6;
    ctx.strokeRect(q.qx, 560, 130, 240);
    ctx.font = 'bold 26px Helvetica, Arial, sans-serif';
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(q.d, q.qx + 65, 815);
  }
  drawBlock(ctx, 'record what you find at regular intervals along the line', 1765, 980, 950, '28px Helvetica, Arial, sans-serif', INK, 34);
  drawBlock(ctx, 'The species change along the transect: shade-lovers near the hedge, then grasses, then daisy rosettes on the worn centre — the living community tracks the conditions.', 1765, 1040, 950, '28px Helvetica, Arial, sans-serif', GREY, 34);

  save(canvas, 'sas18-quadrat-sampling.png', results);
}

function renderIndicators() {
  const { canvas, ctx } = newCanvas(2400, 1700);
  titleBlock(ctx, 'Indicator species — life that grades the environment', 1200, 70);

  /* Air: lichens */
  panel(ctx, 120, 200, 2160, 640);
  drawBlock(ctx, 'Air quality — lichens on stone and bark', 1200, 240, 2000, 'bold 40px Helvetica, Arial, sans-serif', INK, 48);
  const tiles = [
    { x: 300, label: 'Heavily polluted air', note: 'no lichens survive —\nsulphur dioxide is too high', draw: null },
    { x: 860, label: 'Moderately clean air', note: 'leafy lichens only', draw: 'leafy' },
    { x: 1420, label: 'Clean air', note: 'bushy, beard-like lichens thrive', draw: 'bushy' },
  ];
  for (const t of tiles) {
    // stone tile
    ctx.fillStyle = '#94a3b8';
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 5;
    roundRect(ctx, t.x, 330, 360, 330, 24);
    ctx.fill();
    ctx.stroke();
    if (t.draw === 'leafy') {
      for (const [dx, dy, c] of [[-70, -50, '#78716c'], [-20, -70, '#8a817c'], [40, -40, '#78716c'], [75, 30, '#8a817c'], [10, 60, '#6b7280'], [-55, 45, '#8a817c']]) {
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.ellipse(t.x + 180 + dx, t.y + 495 + dy, 46, 26, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (t.draw === 'bushy') {
      ctx.strokeStyle = '#65a30d';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      for (let i = 0; i < 7; i++) {
        const bx = t.x + 90 + i * 30;
        ctx.beginPath();
        ctx.moveTo(bx, 380);
        ctx.quadraticCurveTo(bx + 10, 480, bx - 6, 590);
        ctx.stroke();
      }
    } else {
      ctx.fillStyle = '#7c7268';
      ctx.beginPath();
      ctx.ellipse(t.x + 180, 495, 90, 34, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    drawBlock(ctx, t.label, t.x + 180, 690, 380, 'bold 30px Helvetica, Arial, sans-serif', INK, 36);
    drawBlock(ctx, t.note, t.x + 180, 740, 380, '26px Helvetica, Arial, sans-serif', GREY, 32);
  }
  arrow(ctx, 675, 495, 845, 495, TEAL, 8, 24);
  arrow(ctx, 1235, 495, 1405, 495, TEAL, 8, 24);
  drawBlock(ctx, 'cleaner air \u2192', 400, 290, 240, 'bold 30px Helvetica, Arial, sans-serif', TEAL, 36);

  /* Water: invertebrates */
  panel(ctx, 120, 940, 2160, 640);
  drawBlock(ctx, 'Water quality — animals in the river bed', 1200, 980, 2000, 'bold 40px Helvetica, Arial, sans-serif', INK, 48);
  const water = [
    { x: 300, label: 'Clean water', animal: 'Mayfly nymph', note: 'high dissolved oxygen —\nonly clean, well-oxygenated rivers', draw: 'nymph' },
    { x: 860, label: 'Slightly polluted', animal: 'Freshwater shrimp', note: 'tolerates moderate pollution', draw: 'shrimp' },
    { x: 1420, label: 'Polluted water', animal: 'Sludge and bloodworms', note: 'survive very low oxygen — dominate in rivers below sewage or slurry', draw: 'worm' },
  ];
  for (const t of water) {
    // water band
    ctx.fillStyle = t.draw === 'nymph' ? '#a5f3fc' : t.draw === 'shrimp' ? '#bae6fd' : '#a8a29e';
    roundRect(ctx, t.x, 1070, 360, 300, 24);
    ctx.fill();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    ctx.stroke();
    if (t.draw === 'nymph') {
      // nymph: body + three tails + gill tufts
      ctx.fillStyle = '#a16207';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.ellipse(t.x + 180, 1215, 56, 26, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 5;
      ctx.lineCap = 'round';
      for (const dy of [-14, 0, 14]) {
        ctx.beginPath();
        ctx.moveTo(t.x + 234, 1215 + dy / 2);
        ctx.lineTo(t.x + 320, 1215 + dy);
        ctx.stroke();
      }
      for (const dx of [-20, 0, 20]) {
        ctx.beginPath();
        ctx.moveTo(t.x + 180 + dx, 1195);
        ctx.lineTo(t.x + 180 + dx, 1155);
        ctx.stroke();
      }
    } else if (t.draw === 'shrimp') {
      ctx.strokeStyle = '#9f1239';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(t.x + 90, 1300);
      ctx.quadraticCurveTo(t.x + 130, 1130, t.x + 290, 1160);
      ctx.stroke();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 4;
      for (let i = 1; i <= 6; i++) {
        const tt = i / 7;
        const px = t.x + 90 + 200 * tt;
        const py = 1300 - 170 * Math.sin(tt * Math.PI * 0.85);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px + 14, py - 26);
        ctx.stroke();
      }
    } else {
      ctx.strokeStyle = '#b91c1c';
      ctx.lineWidth = 9;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(t.x + 90, 1250);
      ctx.quadraticCurveTo(t.x + 160, 1200, t.x + 230, 1240);
      ctx.quadraticCurveTo(t.x + 300, 1275, t.x + 330, 1220);
      ctx.stroke();
      ctx.strokeStyle = '#7f1d1d';
      ctx.beginPath();
      ctx.moveTo(t.x + 110, 1300);
      ctx.quadraticCurveTo(t.x + 180, 1350, t.x + 260, 1300);
      ctx.stroke();
    }
    // dynamic spacing: each block starts below wherever the previous one actually ended
    const lEnd = drawBlock(ctx, t.label, t.x + 180, 1385, 440, 'bold 30px Helvetica, Arial, sans-serif', INK, 34);
    const aEnd = drawBlock(ctx, t.animal, t.x + 180, lEnd + 8, 440, 'bold 28px Helvetica, Arial, sans-serif', TEAL, 34);
    drawBlock(ctx, t.note, t.x + 180, aEnd + 10, 400, '26px Helvetica, Arial, sans-serif', GREY, 32);
  }
  arrow(ctx, 675, 1210, 845, 1210, TEAL, 8, 24);
  arrow(ctx, 1235, 1210, 1405, 1210, TEAL, 8, 24);
  drawBlock(ctx, 'more pollution \u2192', 250, 1010, 300, 'bold 30px Helvetica, Arial, sans-serif', TEAL, 36);

  drawBlock(ctx, 'Lichens absorb gases straight through their surface, so they cannot filter out air pollution. Mayfly nymphs need oxygen-rich water; bloodworms do not. What lives there tells you what it is like there.', 1200, 1600, 2100, '30px Helvetica, Arial, sans-serif', GREY, 38);

  save(canvas, 'sas18-indicators.png', results);
}

/* ---------- selection and execution ---------- */

const RENDERERS = {
  photosynthesis: renderPhotosynthesis,
  'limiting-factors': renderLimitingFactors,
  'food-chain': renderFoodChain,
  'food-web': renderFoodWeb,
  pyramids: renderPyramids,
  'energy-loss': renderEnergyLoss,
  'predator-prey': renderPredatorPrey,
  'quadrat-sampling': renderQuadrat,
  indicators: renderIndicators,
};

const only = (process.env.RENDER_ONLY || '').split(',').map((s) => s.trim()).filter(Boolean);
const keys = only.length ? only : Object.keys(RENDERERS);
for (const k of keys) {
  if (!RENDERERS[k]) {
    console.error('Unknown renderer: ' + k);
    process.exitCode = 1;
    continue;
  }
  RENDERERS[k]();
}
console.log(JSON.stringify(results, null, 2));
module.exports = results;