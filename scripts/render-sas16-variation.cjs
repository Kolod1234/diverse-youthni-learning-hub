#!/usr/bin/env node
/*
 * Renders the nine diagrams for Single Award Science lesson 1.6
 * (Variation and Adaptation) as high-resolution plotted PNGs, in the same
 * design language as the sas-repro series (white background, Helvetica
 * labels, leader lines with dots, teal/coral accents, no edge clipping).
 *
 *   sas16-variation-continuous.png    - bell-shaped histogram of heights
 *   sas16-variation-discontinuous.png - separated bar chart of blood groups
 *   sas16-variation-sources.png      - genetic / both / environmental panels
 *   sas16-cactus-adaptations.png     - labelled water-saving cactus
 *   sas16-selection-cycle.png        - five-step natural selection cycle
 *   sas16-peppered-moth.png          - clean vs sooty bark comparison
 *   sas16-resistance-stages.png      - antibiotic resistance in four stages
 *   sas16-selective-breeding.png     - wild cabbage and its descendants
 *   sas16-finch-beaks.png            - five Darwin's finch beak shapes
 *
 * Drafts are written to public/lesson-assets/sas-biology/draft-sas16/ first.
 */
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'public', 'lesson-assets', 'sas-biology', 'draft-sas16');
fs.mkdirSync(OUT_DIR, { recursive: true });

const INK = '#1e293b';
const GREY = '#475569';
const LEADER = '#64748b';
const TEAL = '#0f766e';
const CORAL = '#be123c';
const BLUE = '#1d4ed8';
const AMBER = '#b45309';

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

function tagLabel(ctx, cx, y, name, role, target, maxW, fromRight) {
  const bottom = drawBlock(ctx, name, cx, y, maxW, 'bold 38px Helvetica, Arial, sans-serif', INK, 44);
  const roleBottom = drawBlock(ctx, role, cx, bottom + 52, maxW, '30px Helvetica, Arial, sans-serif', GREY, 36);
  const lx = fromRight ? cx - maxW / 2 : cx + maxW / 2;
  leader(ctx, lx, roleBottom - 18, target[0], target[1]);
}

function titleBlock(ctx, text, cx, y) {
  return drawBlock(ctx, text, cx, y, 1900, 'bold 52px Helvetica, Arial, sans-serif', INK, 62);
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

function prng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function save(canvas, file, results) {
  const bad = edgeCheck(canvas);
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUT_DIR, file), buf);
  results.push({ file, width: canvas.width, height: canvas.height, kb: Math.round(buf.length / 1024), edgeViolations: bad });
}

/* ------------------------------------------------------------------ */
/* 1. Continuous variation — bell-shaped histogram                     */

function renderContinuous(results) {
  const W = 2400, H = 1500;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  titleBlock(ctx, 'Height in a sample of adults — a continuous variable', 1200, 110);

  const baseY = 1180, x0 = 420, x1 = 2200, plotW = x1 - x0;
  const bins = 10, binW = plotW / bins;
  const sigma = 330, peak = 560, mid = x0 + plotW / 2;
  const f = (x) => peak * Math.exp(-((x - mid) ** 2) / (2 * sigma * sigma));
  const counts = [];
  for (let i = 0; i < bins; i++) counts.push(Math.max(14, Math.round(f(x0 + binW * (i + 0.5)))));

  // gridlines every 150 px = 150 people
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  for (let v = 150; v <= 600; v += 150) {
    const y = baseY - v;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
    ctx.font = '28px Helvetica, Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(v), x0 - 18, y);
  }

  // histogram bars (touching)
  for (let i = 0; i < bins; i++) {
    const bx = x0 + i * binW;
    const bh = counts[i];
    ctx.fillStyle = 'rgba(15,118,110,0.16)';
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 3;
    roundRect(ctx, bx, baseY - bh, binW, bh, 0);
    ctx.fill();
    ctx.stroke();
  }

  // smooth curve through the same distribution
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  for (let x = x0; x <= x1; x += 10) {
    const y = baseY - f(x);
    if (x === x0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // axes
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x0, baseY);
  ctx.lineTo(x1, baseY);
  ctx.moveTo(x0, baseY);
  ctx.lineTo(x0, baseY - 660);
  ctx.stroke();

  // x tick labels every 10 cm (two bins)
  ctx.font = '30px Helvetica, Arial, sans-serif';
  ctx.fillStyle = GREY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const cm = ['150', '160', '170', '180', '190', '200'];
  for (let k = 0; k <= 5; k++) {
    const x = x0 + (plotW / 5) * k;
    ctx.fillText(cm[k], x, baseY + 18);
    ctx.strokeStyle = INK;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x, baseY + 12);
    ctx.stroke();
  }
  ctx.font = 'bold 32px Helvetica, Arial, sans-serif';
  ctx.fillStyle = INK;
  ctx.fillText('Height (cm)', (x0 + x1) / 2, baseY + 76);

  // y-axis label
  ctx.save();
  ctx.translate(300, baseY - 330);
  ctx.rotate(-Math.PI / 2);
  ctx.textBaseline = 'middle';
  ctx.fillText('Number of people in each interval', 0, 0);
  ctx.restore();

  // annotations
  drawBlock(ctx, 'Most measurements cluster near the middle of the range', 760, 300, 620, 'bold 34px Helvetica, Arial, sans-serif', INK, 40);
  drawBlock(ctx, 'there are no sharp groups — the bars merge', 760, 385, 620, '30px Helvetica, Arial, sans-serif', GREY, 36);
  leader(ctx, 980, 470, mid - 60, baseY - peak + 30);

  drawBlock(ctx, 'Numbers fall away gradually at each extreme', 1950, 330, 520, 'bold 34px Helvetica, Arial, sans-serif', INK, 40);
  leader(ctx, 1830, 400, 1933, baseY - 94 - 14);

  drawBlock(ctx, 'Any height within the range is possible, so the bars touch and their tops trace a smooth, bell-shaped curve.', 1200, 1330, 1800, 'bold 32px Helvetica, Arial, sans-serif', TEAL, 40);

  save(canvas, 'sas16-variation-continuous.png', results);
}

/* ------------------------------------------------------------------ */
/* 2. Discontinuous variation — blood groups                           */

function renderDiscontinuous(results) {
  const W = 2400, H = 1500;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  titleBlock(ctx, 'Blood group in a UK sample — a discontinuous variable', 1200, 110);

  const baseY = 1150, x0 = 500, x1 = 2100;
  const scale = 15; // px per %
  const groups = [
    { label: 'Group O', pct: 44 },
    { label: 'Group A', pct: 42 },
    { label: 'Group B', pct: 10 },
    { label: 'Group AB', pct: 4 },
  ];
  const barW = 240, gap = 140;
  const firstCx = 700;

  // gridlines every 10%
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 2;
  for (let v = 10; v <= 40; v += 10) {
    const y = baseY - v * scale;
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
    ctx.font = '28px Helvetica, Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(v), x0 - 18, y);
  }

  groups.forEach((g, i) => {
    const cx = firstCx + i * (barW + gap);
    const bh = g.pct * scale;
    ctx.fillStyle = '#14b8a6';
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 4;
    roundRect(ctx, cx - barW / 2, baseY - bh, barW, bh, 10);
    ctx.fill();
    ctx.stroke();
    ctx.font = 'bold 40px Helvetica, Arial, sans-serif';
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(g.pct + '%', cx, baseY - bh - 22);
    ctx.font = '32px Helvetica, Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.textBaseline = 'top';
    ctx.fillText(g.label, cx, baseY + 20);
  });

  // axes
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x0, baseY);
  ctx.lineTo(x1, baseY);
  ctx.moveTo(x0, baseY);
  ctx.lineTo(x0, baseY - 46 * scale - 40);
  ctx.stroke();

  ctx.save();
  ctx.translate(370, baseY - 300);
  ctx.rotate(-Math.PI / 2);
  ctx.font = 'bold 32px Helvetica, Arial, sans-serif';
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Percentage of the sample (%)', 0, 0);
  ctx.restore();

  drawBlock(ctx, 'Each person belongs to exactly one of the four groups. There is no value “between”, so the bars are drawn separated.', 1200, 1290, 1800, 'bold 32px Helvetica, Arial, sans-serif', TEAL, 40);
  drawBlock(ctx, 'A rare category (Group AB) is still a distinct category — rarity does not blur the boundaries.', 1930, 420, 480, '30px Helvetica, Arial, sans-serif', GREY, 36);
  leader(ctx, 1930, 540, firstCx + 3 * (barW + gap), baseY - 40);

  save(canvas, 'sas16-variation-discontinuous.png', results);
}

/* ------------------------------------------------------------------ */
/* 3. Sources of variation — three panels                              */

function renderSources(results) {
  const W = 2400, H = 1700;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  titleBlock(ctx, 'Where does a difference come from?', 1200, 100);

  const panels = [
    {
      cx: 480, head: 'Mainly genetic', color: TEAL,
      items: ['Eye colour', 'Blood group (A, B, AB or O)', 'Whether you can roll your tongue', 'Natural hair colour'],
      note: 'Fixed at fertilisation — conditions later in life cannot change them.',
    },
    {
      cx: 1200, head: 'Genes and environment', color: BLUE,
      items: ['Height — genes set the potential range; childhood diet and health fix the position within it', 'Skin colour — genes set the base colour; sunlight darkens it further', 'Body mass'],
      note: 'The genes decide the limits; the conditions decide the result.',
    },
    {
      cx: 1920, head: 'Mainly environmental', color: AMBER,
      items: ['A scar or a tattoo', 'Accent and language', 'Muscles built up by training', 'A broken bone that has healed'],
      note: 'Nothing to do with the genes inherited — they appear during life.',
    },
  ];

  const pw = 620, py = 300, ph = 1060;
  for (const p of panels) {
    const px = p.cx - pw / 2;
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    roundRect(ctx, px, py, pw, ph, 24);
    ctx.fill();
    ctx.stroke();

    // header band
    ctx.fillStyle = p.color;
    roundRect(ctx, px, py, pw, 110, 24);
    ctx.fill();
    ctx.fillRect(px, py + 60, pw, 50);
    ctx.font = 'bold 40px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(p.head, p.cx, py + 34);

    let iy = py + 170;
    for (const item of p.items) {
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(px + 56, iy + 16, 10, 0, Math.PI * 2);
      ctx.fill();
      const b = drawBlockLeft(ctx, item, px + 92, iy, pw - 140, 'bold 30px Helvetica, Arial, sans-serif', INK, 38);
      iy = b + 52;
    }
    drawBlockLeft(ctx, p.note, px + 56, py + ph - 150, pw - 112, 'italic 28px Helvetica, Arial, sans-serif', GREY, 34);
  }

  drawBlock(ctx, 'A quick test: if the feature could never change after birth, it is genetic. If conditions or choices can change it, the environment is involved.', 1200, 1470, 2000, 'bold 34px Helvetica, Arial, sans-serif', INK, 42);

  save(canvas, 'sas16-variation-sources.png', results);
}

/* ------------------------------------------------------------------ */
/* 4. Cactus adaptations                                               */

function renderCactus(results) {
  const W = 2400, H = 1700;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  titleBlock(ctx, 'A desert cactus — a body built to save water', 1200, 100);

  // soil band
  const groundY = 1150;
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(240, groundY, 1920, 330);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(240, groundY);
  ctx.lineTo(2160, groundY);
  ctx.stroke();

  // cactus body
  const bx = 970, bw = 460, byTop = 480, byBot = groundY;
  ctx.fillStyle = '#4ade80';
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 6;
  roundRect(ctx, bx, byTop, bw, byBot - byTop, 220);
  ctx.fill();
  ctx.stroke();
  // ridges
  ctx.strokeStyle = 'rgba(21,128,61,0.35)';
  ctx.lineWidth = 5;
  for (const rx of [1090, 1200, 1310]) {
    ctx.beginPath();
    ctx.moveTo(rx, byTop + 90);
    ctx.lineTo(rx, byBot - 30);
    ctx.stroke();
  }
  // spines
  ctx.strokeStyle = '#166534';
  ctx.lineWidth = 3;
  for (let yy = byTop + 130; yy <= byBot - 60; yy += 64) {
    for (let xx = bx + 50; xx <= bx + bw - 50; xx += 72) {
      ctx.beginPath();
      ctx.moveTo(xx - 11, yy);
      ctx.lineTo(xx, yy - 24);
      ctx.lineTo(xx + 11, yy);
      ctx.stroke();
    }
  }

  // shallow wide-spreading roots
  ctx.strokeStyle = '#a16207';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  const roots = [
    [520, 1285], [700, 1245], [860, 1205], [1540, 1205], [1700, 1245], [1880, 1285],
  ];
  for (const [ex, ey] of roots) {
    ctx.beginPath();
    ctx.moveTo(1200, groundY);
    ctx.quadraticCurveTo((1200 + ex) / 2, groundY + 20, ex, ey);
    ctx.stroke();
  }

  // labels
  tagLabel(ctx, 480, 560, 'Spines', 'leaves reduced to needles — far less surface area, so far less water is lost by evaporation; they also put off grazing animals', [995, 640], 560, true);
  tagLabel(ctx, 480, 960, 'Thick, swollen stem', 'stores water from rare rainfall; being green, it also carries out photosynthesis in place of the missing leaves', [990, 900], 560, true);
  tagLabel(ctx, 1920, 560, 'Thick waxy cuticle', 'a waterproof coating over the stem that slows evaporation through the surface', [1408, 640], 560, false);
  tagLabel(ctx, 1920, 960, 'Shallow, wide-spreading roots', 'absorb rain water quickly from the surface layers, before it drains away or evaporates', [1710, 1230], 560, false);

  // bottom note panel
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 4;
  roundRect(ctx, 300, 1430, 1800, 150, 20);
  ctx.fill();
  ctx.stroke();
  drawBlock(ctx, 'Every labelled feature either prevents water loss or captures water quickly — each is a structural adaptation shaped by natural selection over thousands of generations.', 1200, 1458, 1720, 'bold 32px Helvetica, Arial, sans-serif', INK, 42);

  save(canvas, 'sas16-cactus-adaptations.png', results);
}

/* ------------------------------------------------------------------ */
/* 5. Natural selection cycle                                         */

function renderCycle(results) {
  const W = 2400, H = 1600;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  titleBlock(ctx, 'Natural selection — the cycle that drives evolution', 1200, 90);

  const cx = 1200, cy = 940, rx = 760, ry = 430;
  const angles = [-90, -18, 54, 126, 198].map(rad);
  const steps = [
    { n: '1', h: 'Variation', b: 'Individuals in the population differ — some differences give an advantage.' },
    { n: '2', h: 'Competition', b: 'More offspring are produced than can survive. They compete for food, water, space and mates.' },
    { n: '3', h: 'Survival', b: 'The individuals best suited to the conditions survive the struggle; the rest die or fail to breed.' },
    { n: '4', h: 'Reproduction', b: 'The survivors breed and pass on the features that helped them — with their genes.' },
    { n: '5', h: 'Gradual change', b: 'Over many generations the useful features become more and more common.' },
  ];
  const bw = 500, bh = 300;
  const centres = angles.map((a) => [cx + rx * Math.cos(a), cy + ry * Math.sin(a)]);

  // arrows between consecutive boxes (drawn first, under the boxes)
  for (let i = 0; i < 5; i++) {
    const [x1, y1] = centres[i];
    const [x2, y2] = centres[(i + 1) % 5];
    const ux = (x2 - x1), uy = (y2 - y1);
    const len = Math.hypot(ux, uy);
    const nx = ux / len, ny = uy / len;
    const t = 300;
    arrow(ctx, x1 + nx * t, y1 + ny * t, x2 - nx * t, y2 - ny * t, TEAL, 7, 24);
  }

  // boxes
  steps.forEach((s, i) => {
    const [bx, by] = centres[i];
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = TEAL;
    ctx.lineWidth = 5;
    roundRect(ctx, bx - bw / 2, by - bh / 2, bw, bh, 22);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = TEAL;
    ctx.beginPath();
    ctx.arc(bx - bw / 2 + 52, by - bh / 2 + 52, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 38px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.n, bx - bw / 2 + 52, by - bh / 2 + 54);
    ctx.font = 'bold 38px Helvetica, Arial, sans-serif';
    ctx.fillStyle = INK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(s.h, bx - bw / 2 + 104, by - bh / 2 + 34);
    drawBlockLeft(ctx, s.b, bx - bw / 2 + 52, by - bh / 2 + 104, bw - 104, '29px Helvetica, Arial, sans-serif', GREY, 36);
  });

  // centre note
  drawBlock(ctx, 'The environment is the selecting agent — it “chooses” which variations survive long enough to breed. Each lap of the cycle is one generation.', cx, cy - 70, 620, 'bold 32px Helvetica, Arial, sans-serif', INK, 40);
  drawBlock(ctx, '“Survival of the fittest” means best fitted to the conditions — not strongest.', cx, cy + 90, 620, '30px Helvetica, Arial, sans-serif', TEAL, 38);

  save(canvas, 'sas16-selection-cycle.png', results);
}

/* ------------------------------------------------------------------ */
/* 6. Peppered moth                                                    */

function restingMoth(ctx, x, y, s, fill) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - s * 0.72, y + s * 1.9);
  ctx.lineTo(x + s * 0.72, y + s * 1.9);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = 'rgba(30,41,59,0.55)';
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.stroke();
}

function renderMoth(results) {
  const W = 2400, H = 1700;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  titleBlock(ctx, 'The peppered moth: birds eat the moth they can see', 1200, 90);

  const rnd = prng(42);
  const panels = [
    { cx: 640, head: 'Before 1850 — clean, lichen-covered bark', bark: '#d4c8a4', streak: '#b9ac86', lichen: true,
      hidden: 'light form — camouflaged', eaten: 'dark form — spotted and eaten' },
    { cx: 1760, head: 'By 1900 — soot-blackened bark', bark: '#3f3f46', streak: '#27272a', lichen: false,
      hidden: 'dark form — camouflaged', eaten: 'light form — spotted and eaten' },
  ];

  for (const p of panels) {
    drawBlock(ctx, p.head, p.cx, 220, 980, 'bold 38px Helvetica, Arial, sans-serif', INK, 46);

    // trunk
    const tx = p.cx - 220, tw = 440, ty = 320, th = 660;
    ctx.fillStyle = p.bark;
    roundRect(ctx, tx, ty, tw, th, 26);
    ctx.fill();
    ctx.save();
    roundRect(ctx, tx, ty, tw, th, 26);
    ctx.clip();
    // bark streaks
    ctx.strokeStyle = p.streak;
    ctx.lineWidth = 8;
    for (let i = 0; i < 7; i++) {
      const sx = tx + 40 + i * 56;
      ctx.beginPath();
      ctx.moveTo(sx, ty - 10);
      ctx.quadraticCurveTo(sx + 22, ty + th / 2, sx - 8, ty + th + 10);
      ctx.stroke();
    }
    if (p.lichen) {
      for (let i = 0; i < 55; i++) {
        const lx = tx + 24 + rnd() * (tw - 48);
        const ly = ty + 24 + rnd() * (th - 48);
        ctx.fillStyle = rnd() > 0.5 ? '#a3e635' : '#84cc16';
        ctx.beginPath();
        ctx.arc(lx, ly, 7 + rnd() * 9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
    ctx.strokeStyle = INK;
    ctx.lineWidth = 4;
    roundRect(ctx, tx, ty, tw, th, 26);
    ctx.stroke();

    // moths: hidden (matched) and eaten (mismatched, marked with arrow)
    const matchedFill = p.lichen ? '#e7e5e4' : '#31302e';
    const mismatchFill = p.lichen ? '#31302e' : '#e7e5e4';
    restingMoth(ctx, p.cx - 100, 420, 62, matchedFill);
    restingMoth(ctx, p.cx + 100, 700, 62, mismatchFill);
    // eaten arrow to the mismatched moth
    const ex = p.cx + 100, ey = 760;
    arrow(ctx, p.cx + 300, ey + 150, ex + 90, ey + 40, CORAL, 6, 20);

    // labels under trunk
    drawBlock(ctx, p.hidden, p.cx - 240, 1010, 400, 'bold 30px Helvetica, Arial, sans-serif', TEAL, 36);
    drawBlock(ctx, p.eaten, p.cx + 240, 1010, 400, 'bold 30px Helvetica, Arial, sans-serif', CORAL, 36);
    leader(ctx, p.cx - 240, 995, p.cx - 100, 420 + 120);
    leader(ctx, p.cx + 240, 995, ex + 40, ey + 60);
  }

  // timeline band
  const events = [
    ['1848', 'The first dark peppered moth is recorded near Manchester.'],
    ['Late 1800s', 'Soot kills the lichens and blackens the bark; in industrial areas almost all moths are now dark.'],
    ['After 1956', 'The Clean Air Act clears the smoke; lichen returns, bark lightens, and the light form recovers.'],
  ];
  events.forEach(([year, text], i) => {
    const cx = 480 + i * 720;
    ctx.fillStyle = TEAL;
    ctx.beginPath();
    ctx.arc(cx, 1290, 14, 0, Math.PI * 2);
    ctx.fill();
    const yb = drawBlock(ctx, year, cx, 1330, 620, 'bold 36px Helvetica, Arial, sans-serif', INK, 42);
    drawBlock(ctx, text, cx, yb + 50, 620, '30px Helvetica, Arial, sans-serif', GREY, 36);
  });

  save(canvas, 'sas16-peppered-moth.png', results);
}

/* ------------------------------------------------------------------ */
/* 7. Antibiotic resistance stages                                     */

function renderResistance(results) {
  const W = 2400, H = 1500;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  titleBlock(ctx, 'How an antibiotic-resistant infection develops', 1200, 90);

  // legend
  ctx.fillStyle = TEAL;
  ctx.beginPath();
  ctx.arc(1730, 200, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.font = '28px Helvetica, Arial, sans-serif';
  ctx.fillStyle = GREY;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('susceptible bacterium', 1755, 200);
  ctx.fillStyle = CORAL;
  ctx.beginPath();
  ctx.arc(2020, 200, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = GREY;
  ctx.fillText('resistant bacterium', 2045, 200);

  const stages = [
    { n: '1', h: 'Harmless population', b: 'Most bacteria are susceptible. A random mutation has made one or two resistant — it happens whether or not an antibiotic is used.', sus: 60, res: 2 },
    { n: '2', h: 'Antibiotic taken', b: 'The antibiotic kills the susceptible bacteria in their billions — but it cannot touch the resistant ones.', sus: 7, res: 12 },
    { n: '3', h: 'Resistant survivors multiply', b: 'With no competition left, the resistant bacteria divide rapidly, generation after generation.', sus: 0, res: 62 },
    { n: '4', h: 'A resistant infection', b: 'The population is now mainly resistant: the same antibiotic no longer works against it.', sus: 2, res: 70 },
  ];

  const pw = 500, ph = 560, py = 330;
  const gap = 50;
  const startX = (W - (4 * pw + 3 * gap)) / 2;

  stages.forEach((s, i) => {
    const px = startX + i * (pw + gap);
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    roundRect(ctx, px, py, pw, ph, 22);
    ctx.fill();
    ctx.stroke();

    // dot field
    const fx = px + 45, fy = py + 60, fw = pw - 90, fh = ph - 150;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 3;
    roundRect(ctx, fx, fy, fw, fh, 16);
    ctx.fill();
    ctx.stroke();
    const rnd = prng(100 + i * 17);
    for (let k = 0; k < s.sus; k++) {
      const dx = fx + 20 + rnd() * (fw - 40);
      const dy = fy + 20 + rnd() * (fh - 40);
      ctx.fillStyle = i === 1 ? 'rgba(13,148,136,0.5)' : '#14b8a6';
      ctx.beginPath();
      ctx.arc(dx, dy, 9, 0, Math.PI * 2);
      ctx.fill();
    }
    for (let k = 0; k < s.res; k++) {
      const dx = fx + 20 + rnd() * (fw - 40);
      const dy = fy + 20 + rnd() * (fh - 40);
      ctx.fillStyle = CORAL;
      ctx.beginPath();
      ctx.arc(dx, dy, 9, 0, Math.PI * 2);
      ctx.fill();
    }

    // stage number + heading inside panel bottom
    ctx.fillStyle = TEAL;
    ctx.beginPath();
    ctx.arc(px + 52, py + ph - 56, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = 'bold 30px Helvetica, Arial, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(s.n, px + 52, py + ph - 55);
    ctx.font = 'bold 30px Helvetica, Arial, sans-serif';
    ctx.fillStyle = INK;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(s.h, px + 96, py + ph - 76);
  });

  // arrows between stages
  for (let i = 0; i < 3; i++) {
    const x1 = startX + i * (pw + gap) + pw;
    const x2 = startX + (i + 1) * (pw + gap);
    arrow(ctx, x1 + 6, py + ph / 2, x2 - 8, py + ph / 2, INK, 6, 20);
  }

  // body text under each panel
  stages.forEach((s, i) => {
    const cx = startX + i * (pw + gap) + pw / 2;
    drawBlock(ctx, s.b, cx, py + ph + 60, pw - 30, '29px Helvetica, Arial, sans-serif', GREY, 36);
  });

  drawBlock(ctx, 'Resistant strains such as MRSA spread in hospitals, where antibiotics are used most. Doctors now prescribe antibiotics only when needed, and patients must take them exactly as prescribed.', 1200, 1290, 2000, 'bold 32px Helvetica, Arial, sans-serif', INK, 42);

  save(canvas, 'sas16-resistance-stages.png', results);
}

/* ------------------------------------------------------------------ */
/* 8. Selective breeding — wild cabbage                                */

function leaf(ctx, x, y, len, w, rot, fill) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.bezierCurveTo(w, -len * 0.3, w * 0.4, -len * 0.85, 0, -len);
  ctx.bezierCurveTo(-w * 0.4, -len * 0.85, -w, -len * 0.3, 0, 0);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.restore();
}

function renderBreeding(results) {
  const W = 2400, H = 1600;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  titleBlock(ctx, 'One wild plant, many vegetables — selective breeding', 1200, 90);

  const groundY = 1150;
  ctx.strokeStyle = INK;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(160, groundY);
  ctx.lineTo(2240, groundY);
  ctx.stroke();

  // wild cabbage (left)
  const wx = 400;
  ctx.strokeStyle = '#166534';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(wx, groundY);
  ctx.lineTo(wx, groundY - 340);
  ctx.stroke();
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(wx, groundY - 200);
  ctx.lineTo(wx - 110, groundY - 260);
  ctx.moveTo(wx, groundY - 260);
  ctx.lineTo(wx + 120, groundY - 330);
  ctx.stroke();
  leaf(ctx, wx - 110, groundY - 262, 150, 55, -0.6, '#86efac');
  leaf(ctx, wx + 120, groundY - 332, 160, 60, 0.7, '#86efac');
  leaf(ctx, wx, groundY - 345, 190, 66, -0.15, '#86efac');
  leaf(ctx, wx - 60, groundY - 150, 140, 50, -1.0, '#a7f3d0');
  leaf(ctx, wx + 66, groundY - 160, 150, 52, 1.0, '#a7f3d0');
  drawBlock(ctx, 'Wild cabbage (Brassica oleracea) — the common ancestor', wx, groundY + 40, 460, 'bold 30px Helvetica, Arial, sans-serif', INK, 38);

  // big arrow
  arrow(ctx, wx + 300, groundY - 260, 740, groundY - 260, TEAL, 12, 34);
  drawBlock(ctx, 'farmers kept seed only from the plants with the feature they wanted — for hundreds of years', 700, groundY - 430, 380, 'italic 28px Helvetica, Arial, sans-serif', GREY, 34);

  // three descendants
  const cols = [
    { cx: 1080, name: 'Cabbage', role: 'bred for a swollen head of leaves' },
    { cx: 1560, name: 'Broccoli', role: 'bred for clusters of unopened flower buds' },
    { cx: 2040, name: 'Kale', role: 'bred for loose, curly leaves' },
  ];

  // cabbage: nested head of leaves
  {
    const cx = 1080, cy = groundY - 190;
    ctx.fillStyle = '#a7f3d0';
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 6;
    for (const r of [180, 140, 100, 60]) {
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 180);
    ctx.lineTo(cx, groundY);
    ctx.stroke();
  }
  // broccoli: stalk with clustered buds
  {
    const cx = 1560, cy = groundY - 200;
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.moveTo(cx, groundY);
    ctx.lineTo(cx, cy + 90);
    ctx.moveTo(cx - 40, cy + 130);
    ctx.lineTo(cx - 90, cy + 40);
    ctx.moveTo(cx + 40, cy + 130);
    ctx.lineTo(cx + 90, cy + 40);
    ctx.stroke();
    const rnd = prng(7);
    for (let i = 0; i < 26; i++) {
      const a = rnd() * Math.PI * 2;
      const rr = rnd() * 110;
      ctx.fillStyle = '#65a30d';
      ctx.strokeStyle = '#3f6212';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx + rr * Math.cos(a), cy - 30 + rr * Math.sin(a) * 0.7, 22 + rnd() * 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }
  }
  // kale: curly leaves
  {
    const cx = 2040;
    ctx.strokeStyle = '#166534';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(cx, groundY);
    ctx.lineTo(cx, groundY - 240);
    ctx.stroke();
    leaf(ctx, cx, groundY - 235, 200, 80, -0.5, '#bbf7d0');
    leaf(ctx, cx, groundY - 245, 210, 84, 0.5, '#bbf7d0');
    leaf(ctx, cx, groundY - 260, 190, 76, -0.05, '#bbf7d0');
  }

  for (const c of cols) {
    const yb = drawBlock(ctx, c.name, c.cx, groundY + 40, 400, 'bold 34px Helvetica, Arial, sans-serif', INK, 42);
    drawBlock(ctx, c.role, c.cx, yb + 50, 400, '30px Helvetica, Arial, sans-serif', GREY, 36);
  }

  drawBlock(ctx, 'The human eye does the selecting that the environment does in natural selection — repeated over many generations, the chosen feature becomes exaggerated.', 1200, 1400, 2000, 'bold 32px Helvetica, Arial, sans-serif', INK, 42);

  save(canvas, 'sas16-selective-breeding.png', results);
}

/* ------------------------------------------------------------------ */
/* 9. Finch beaks                                                      */

function finchHead(ctx, cx, cy, beak) {
  // head
  ctx.fillStyle = '#a8a29e';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, 110, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // eye
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(cx + 26, cy - 30, 11, 0, Math.PI * 2);
  ctx.fill();
  // beak
  ctx.fillStyle = '#ca8a04';
  ctx.strokeStyle = '#854d0e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx + 92, cy - 30);
  ctx.lineTo(beak.tipX, cy + beak.tipY);
  ctx.lineTo(cx + 92, cy + beak.baseY);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  if (beak.hook) {
    ctx.beginPath();
    ctx.moveTo(beak.tipX, cy + beak.tipY);
    ctx.lineTo(beak.tipX + 8, cy + beak.tipY + 34);
    ctx.lineTo(beak.tipX - 22, cy + beak.tipY + 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
}

function renderFinches(results) {
  const W = 2400, H = 1500;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  titleBlock(ctx, "Darwin's finches: beaks shaped by the food each species eats", 1200, 90);

  const birds = [
    { cx: 320, tipX: 470, tipY: -8, baseY: -20, name: 'Small ground finch', role: 'small, soft seeds and insects' },
    { cx: 760, tipX: 980, tipY: 8, baseY: -14, name: 'Medium ground finch', role: 'medium seeds' },
    { cx: 1200, tipX: 1450, tipY: 18, baseY: -6, name: 'Large ground finch', role: 'large, hard seeds — cracked by its heavy beak' },
    { cx: 1640, tipX: 1800, tipY: -2, baseY: -26, name: 'Vegetarian finch', role: 'buds, leaves and fruit', hook: true },
    { cx: 2080, tipX: 2330, tipY: -4, baseY: -12, name: 'Warbler finch', role: 'insects, probed from bark crevices' },
  ];

  birds.forEach((b, i) => {
    const cy = 420;
    finchHead(ctx, b.cx, cy, b);
    const yb = drawBlock(ctx, b.name, b.cx, cy + 170, 400, 'bold 32px Helvetica, Arial, sans-serif', INK, 40);
    drawBlock(ctx, b.role, b.cx, yb + 46, 400, '29px Helvetica, Arial, sans-serif', GREY, 36);
  });

  drawBlock(ctx, 'In the drought year 1977 on the Galápagos island of Daphne Major, only large, hard seeds were left.', 1200, 800, 2000, 'bold 34px Helvetica, Arial, sans-serif', INK, 42);
  drawBlock(ctx, 'Medium ground finches with deeper, stronger beaks survived while others starved — and the next generation inherited measurably deeper beaks.', 1200, 870, 2000, '34px Helvetica, Arial, sans-serif', GREY, 44);
  drawBlock(ctx, 'Natural selection, measured in real time.', 1200, 990, 2000, 'bold 34px Helvetica, Arial, sans-serif', TEAL, 42);

  save(canvas, 'sas16-finch-beaks.png', results);
}

/* ------------------------------------------------------------------ */

const RENDERERS = {
  'continuous': renderContinuous,
  'discontinuous': renderDiscontinuous,
  'sources': renderSources,
  'cactus': renderCactus,
  'cycle': renderCycle,
  'moth': renderMoth,
  'resistance': renderResistance,
  'breeding': renderBreeding,
  'finches': renderFinches,
};

const only = process.env.RENDER_ONLY ? process.env.RENDER_ONLY.split(',').map((s) => s.trim()) : Object.keys(RENDERERS);
const results = [];
for (const key of only) {
  if (!RENDERERS[key]) throw new Error('Unknown renderer: ' + key);
  RENDERERS[key](results);
}
console.log(JSON.stringify(results, null, 1));
module.exports = { results };