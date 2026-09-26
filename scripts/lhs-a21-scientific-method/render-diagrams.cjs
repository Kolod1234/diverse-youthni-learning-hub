// Renders the six custom diagrams for the LHS A2 1 "Scientific Method,
// Investigation, Analysis and Evaluation" chapter as 2x-scale PNGs into
// public/lesson-assets/lhs-a2.
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

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
  ok: '#16a34a',
  okSoft: '#dcfce7',
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

/* ---------- 1. The scientific method cycle ---------- */
function renderCycle() {
  const W = 1600, H = 980;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'The scientific method as a cycle', 'a claim becomes science only after peer review and independent replication');

  const cx = W / 2, cy = 520, rx = 470, ry = 290;
  const stages = [
    ['Observation', 'and question'],
    ['Hypothesis', 'testable explanation'],
    ['Prediction', 'expected result if true'],
    ['Fair test', 'controlled experiment'],
    ['Analyse', 'and conclude'],
    ['Peer review', 'and replication'],
  ];
  const BW = 262, BH = 104;
  const pos = stages.map((_, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / stages.length;
    return { x: cx + rx * Math.cos(a), y: cy + ry * Math.sin(a) };
  });

  // arrows between stages (trimmed at box edges)
  for (let i = 0; i < stages.length; i++) {
    const p1 = pos[i], p2 = pos[(i + 1) % stages.length];
    const dx = p2.x - p1.x, dy = p2.y - p1.y;
    const len = Math.hypot(dx, dy);
    const ux = dx / len, uy = dy / len;
    const start = { x: p1.x + ux * 150, y: p1.y + uy * 88 };
    const end = { x: p2.x - ux * 160, y: p2.y - uy * 92 };
    arrow(ctx, start.x, start.y, end.x, end.y, 3.5, C.accent2);
  }

  // stage boxes (last one highlighted)
  stages.forEach((s, i) => {
    const p = pos[i];
    roundRect(ctx, p.x - BW / 2, p.y - BH / 2, BW, BH, 16);
    ctx.fillStyle = i === 5 ? C.accentSoft : C.panel;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = i === 5 ? C.accent : '#cbd5e1';
    ctx.stroke();
    ctx.fillStyle = C.accent;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    setFont(ctx, 22, '700');
    ctx.fillStyle = C.ink;
    ctx.fillText(s[0], p.x, p.y - 16);
    setFont(ctx, 18, '400');
    ctx.fillStyle = C.sub;
    ctx.fillText(s[1], p.x, p.y + 16);
  });

  // hub
  ctx.beginPath();
  ctx.arc(cx, cy, 120, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = C.accent;
  ctx.stroke();
  textCentered(ctx, 'Tested ideas,', cx, cy - 22, 210, 24, '700', C.accent);
  textCentered(ctx, 'not facts', cx, cy + 18, 210, 24, '700', C.accent);

  // exit note from replication back to hypothesis
  textCentered(ctx, 'A conclusion that fails sends the scientist back with a modified or rejected hypothesis', W / 2, H - 46, W - 200, 20, '400', C.sub);
  save('a21-scientific-cycle.png', canvas);
}

/* ---------- 2. Sampling methods ---------- */
function renderSampling() {
  const W = 1600, H = 880;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Three ways to choose a sample', 'selected individuals are circled in each method');

  const panels = [
    { name: 'Random sampling', note: 'every member has an equal chance of selection', x0: 70 },
    { name: 'Systematic sampling', note: 'every 5th individual in order', x0: 590 },
    { name: 'Stratified sampling', note: 'selection proportional to each stratum', x0: 1110 },
  ];
  const COLS = 8, ROWS = 7, GAP = 42, R = 8;

  // deterministic pseudo-random selection for panel 1
  let seed = 42;
  const rand = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed / 2147483648; };
  const randomPicks = new Set();
  while (randomPicks.size < 11) randomPicks.add(Math.floor(rand() * COLS * ROWS));

  panels.forEach((p, pi) => {
    const ox = p.x0, oy = 190;
    const pw = (COLS - 1) * GAP + 40, ph = (ROWS - 1) * GAP + 40;

    // panel frame
    roundRect(ctx, ox - 20, oy - 70, pw + 40, ph + 150, 14);
    ctx.fillStyle = C.panel;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#cbd5e1';
    ctx.stroke();

    // stratified: draw the strata bands first
    if (pi === 2) {
      ctx.fillStyle = C.accent2Soft;
      ctx.fillRect(ox - 4, oy - 4, (COLS - 1) * GAP + 8, 3 * GAP + 12);
      ctx.fillStyle = C.accentSoft;
      ctx.fillRect(ox - 4, oy + 3 * GAP + 10, (COLS - 1) * GAP + 8, 3 * GAP + 12);
      textCentered(ctx, 'Stratum A: 65% of the population', ox + pw / 2, oy - 22, pw - 10, 17, '700', C.sub);
      textCentered(ctx, 'Stratum B: 35% of the population', ox + pw / 2, oy + ph + 4, pw - 10, 17, '700', C.sub);
    }

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const i = r * COLS + c;
        const x = ox + c * GAP, y = oy + r * GAP;
        let picked = false;
        if (pi === 0) picked = randomPicks.has(i);
        if (pi === 1) picked = i % 5 === 0;
        if (pi === 2) picked = (r <= 2 && i % 7 === 3) || (r >= 4 && i % 14 === 9);
        ctx.beginPath();
        ctx.arc(x, y, R, 0, Math.PI * 2);
        ctx.fillStyle = picked ? C.accent : '#cbd5e1';
        ctx.fill();
        if (picked) {
          ctx.beginPath();
          ctx.arc(x, y, R + 7, 0, Math.PI * 2);
          ctx.lineWidth = 3;
          ctx.strokeStyle = C.accent;
          ctx.stroke();
        }
      }
    }

    // panel titles (inside the frame, clear of the global subtitle)
    textCentered(ctx, p.name, ox + pw / 2, oy - 32, pw + 30, 27, '700');
    textCentered(ctx, p.note, ox + pw / 2, oy + ph + 56, pw + 40, 19, '400', C.sub);
  });

  save('a21-sampling-methods.png', canvas);
}

/* ---------- 3. Central tendency on a skewed distribution ---------- */
function renderCentralTendency() {
  const W = 1600, H = 760;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Where the averages sit on a right-skewed distribution', 'the mean is always pulled furthest towards the long tail');

  const baseY = 660, peakX = 430, peakY = 220;

  // filled skewed curve
  ctx.beginPath();
  ctx.moveTo(170, baseY);
  ctx.quadraticCurveTo(280, 250, peakX, peakY);
  ctx.quadraticCurveTo(560, 235, 760, 430);
  ctx.quadraticCurveTo(1080, 610, 1430, baseY);
  ctx.lineTo(170, baseY);
  ctx.closePath();
  ctx.fillStyle = C.accent2Soft;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = C.accent2;
  ctx.stroke();

  // baseline
  ctx.lineWidth = 3;
  ctx.strokeStyle = C.ink;
  ctx.beginPath();
  ctx.moveTo(140, baseY);
  ctx.lineTo(1470, baseY);
  ctx.stroke();

  const marks = [
    { x: peakX, label: 'Mode', sub: 'most frequent value', color: C.sub },
    { x: 560, label: 'Median', sub: 'middle value', color: C.accent },
    { x: 700, label: 'Mean', sub: 'pulled right by the tail', color: C.warn },
  ];
  marks.forEach((m) => {
    dashedLine(ctx, m.x, m.yD || 150, baseY, m.color);
    ctx.textAlign = 'center';
    setFont(ctx, 26, '700');
    ctx.fillStyle = m.color;
    ctx.fillText(m.label, m.x, 132);
    setFont(ctx, 19, '400');
    ctx.fillText(m.sub, m.x, 162);
    ctx.beginPath();
    ctx.arc(m.x, baseY, 7, 0, Math.PI * 2);
    ctx.fillStyle = m.color;
    ctx.fill();
  });

  // long tail annotation
  arrow(ctx, 1000, 420, 1280, 520, 3, C.sub);
  textCentered(ctx, 'long tail of high values', 1250, 388, 340, 21, '400', C.sub);

  textCentered(ctx, 'In a symmetric (normal) distribution all three averages coincide at the centre \u2014 it is skew that separates them', W / 2, H - 34, W - 160, 21, '400', C.sub);
  save('a21-central-tendency.png', canvas);
}

/* ---------- 4. Normal distribution with SD regions ---------- */
function renderNormal() {
  const W = 1600, H = 840;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'The normal distribution', 'the standard deviation is the yardstick of the bell curve');

  const baseY = 680, peakY = 190;
  const x0 = 250, x1 = 1350, sdPx = (x1 - x0) / 6; // -3..+3 SD
  const f = (t) => Math.exp(-t * t / 2);
  const yOf = (t) => baseY - (baseY - peakY) * f(t);
  const xOf = (t) => (x0 + x1) / 2 + t * sdPx;

  // shaded +/-1 SD region
  ctx.beginPath();
  ctx.moveTo(xOf(-1), baseY);
  for (let t = -1; t <= 1.0001; t += 0.02) ctx.lineTo(xOf(t), yOf(t));
  ctx.lineTo(xOf(1), baseY);
  ctx.closePath();
  ctx.fillStyle = C.accent2Soft;
  ctx.fill();

  // curve outline to +/-3
  ctx.beginPath();
  ctx.moveTo(xOf(-3), baseY);
  for (let t = -3; t <= 3.0001; t += 0.02) ctx.lineTo(xOf(t), yOf(t));
  ctx.lineTo(xOf(3), baseY);
  ctx.lineWidth = 4;
  ctx.strokeStyle = C.accent2;
  ctx.stroke();

  // axes
  ctx.lineWidth = 3;
  ctx.strokeStyle = C.ink;
  ctx.beginPath();
  ctx.moveTo(160, baseY);
  ctx.lineTo(1440, baseY);
  ctx.stroke();

  // brackets and labels
  const bracket = (xa, xb, y, color, main) => {
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(xa, y);
    ctx.lineTo(xa, y + 12);
    ctx.lineTo(xb, y + 12);
    ctx.lineTo(xb, y);
    ctx.stroke();
    textCentered(ctx, main, (xa + xb) / 2, y + 40, 600, 24, '700', color);
  };
  bracket(xOf(-2), xOf(2), 240, C.sub, 'about 95% of values lie within 2 SD of the mean');
  bracket(xOf(-1), xOf(1), 330, C.accent, 'about 68% of values lie within 1 SD');

  // mean line and SD ticks
  dashedLine(ctx, xOf(0), 150, baseY, C.ink);
  textCentered(ctx, 'mean = median = mode', xOf(0), 128, 420, 24, '700', C.ink);

  const ticks = ['-3 SD', '-2 SD', '-1 SD', 'mean', '+1 SD', '+2 SD', '+3 SD'];
  ticks.forEach((t, i) => {
    const x = xOf(-3 + i);
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x, baseY + 10);
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = C.ink;
    ctx.stroke();
    textCentered(ctx, t, x, baseY + 36, 140, 20, '400', C.sub);
  });

  // example annotation
  const exY = 520;
  roundRect(ctx, 1060, exY, 420, 96, 12);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();
  textLeft(ctx, 'Mean 122 mmHg, SD 10:', 1084, exY + 28, 380, 21, '700', C.ink);
  textLeft(ctx, '95% of patients lie between', 1084, exY + 56, 380, 20, '400', C.sub);
  textLeft(ctx, '102 and 142 mmHg', 1084, exY + 80, 380, 20, '400', C.sub);

  save('a21-normal-distribution.png', canvas);
}

/* ---------- 5. Error bars ---------- */
function renderErrorBars() {
  const W = 1600, H = 800;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'What error bars let you judge', 'each bar is the mean; the line is one standard deviation either side');

  const panels = [
    { x0: 150, name: 'Heavy overlap', verdict: 'difference small against the scatter', verdictColor: C.warn,
      data: [{ label: 'Treatment A', mean: 10, sd: 3.0 }, { label: 'Treatment B', mean: 12.2, sd: 3.0 }] },
    { x0: 900, name: 'No overlap', verdict: 'a real difference is likely (confirm with a test)', verdictColor: C.ok,
      data: [{ label: 'Treatment A', mean: 10, sd: 2.0 }, { label: 'Treatment B', mean: 20, sd: 2.0 }] },
  ];
  const pw = 500, baseY = 610, topY = 170, yMax = 25;

  panels.forEach((p) => {
    const yOf = (v) => baseY - (v / yMax) * (baseY - topY);

    // frame
    roundRect(ctx, p.x0 - 40, 130, pw + 120, 560, 14);
    ctx.fillStyle = C.panel;
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#cbd5e1';
    ctx.stroke();

    // y axis
    ctx.lineWidth = 3;
    ctx.strokeStyle = C.ink;
    ctx.beginPath();
    ctx.moveTo(p.x0 - 10, topY - 20);
    ctx.lineTo(p.x0 - 10, baseY);
    ctx.lineTo(p.x0 + pw, baseY);
    ctx.stroke();
    for (let v = 0; v <= yMax; v += 5) {
      setFont(ctx, 17, '400');
      ctx.fillStyle = C.sub;
      ctx.textAlign = 'left';
      ctx.fillText(String(v), p.x0 - 60, yOf(v) + 6);
      ctx.beginPath();
      ctx.moveTo(p.x0 - 16, yOf(v));
      ctx.lineTo(p.x0 - 10, yOf(v));
      ctx.lineWidth = 2;
      ctx.strokeStyle = C.sub;
      ctx.stroke();
    }
    ctx.save();
    ctx.translate(p.x0 - 78, (topY + baseY) / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    setFont(ctx, 18, '700');
    ctx.fillStyle = C.ink;
    ctx.fillText('Mean recovery time (days)', 0, 0);
    ctx.restore();

    // bars
    const bw = 96;
    p.data.forEach((d, i) => {
      const cx = p.x0 + 150 + i * 240;
      ctx.fillStyle = i === 0 ? C.accent2Soft : C.accentSoft;
      ctx.fillRect(cx - bw / 2, yOf(d.mean), bw, baseY - yOf(d.mean));
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = i === 0 ? C.accent2 : C.accent;
      ctx.strokeRect(cx - bw / 2, yOf(d.mean), bw, baseY - yOf(d.mean));
      // error bar
      const yTop = yOf(d.mean + d.sd), yBot = yOf(d.mean - d.sd);
      ctx.lineWidth = 4;
      ctx.strokeStyle = C.ink;
      ctx.beginPath();
      ctx.moveTo(cx, yTop);
      ctx.lineTo(cx, yBot);
      ctx.stroke();
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx - 14, yTop);
      ctx.lineTo(cx + 14, yTop);
      ctx.moveTo(cx - 14, yBot);
      ctx.lineTo(cx + 14, yBot);
      ctx.stroke();
      textCentered(ctx, d.label, cx, baseY + 34, 220, 20, '700', C.ink);
    });

    // verdict
    textCentered(ctx, p.name, p.x0 + pw / 2 + 30, 158, pw, 26, '700');
    textCentered(ctx, p.verdict, p.x0 + pw / 2 + 30, 656, pw + 80, 21, '700', p.verdictColor);
  });

  save('a21-error-bars.png', canvas);
}

/* ---------- 6. Chi-squared observed vs expected ---------- */
function renderChiSquared() {
  const W = 1600, H = 820;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Observed counts against the expected 3 : 1 ratio', 'the worked example of 320 seedlings, page 11');

  const baseY = 640, topY = 190;
  const groups = [
    { label: 'Tall', obs: 246, exp: 240 },
    { label: 'Dwarf', obs: 74, exp: 80 },
  ];
  const yMax = 280;
  const yOf = (v) => baseY - (v / yMax) * (baseY - topY);
  const x0 = 360, groupGap = 380;
  const bw = 110, innerGap = 26;

  // axes
  ctx.lineWidth = 3;
  ctx.strokeStyle = C.ink;
  ctx.beginPath();
  ctx.moveTo(x0 - 60, topY - 30);
  ctx.lineTo(x0 - 60, baseY);
  ctx.lineTo(1420, baseY);
  ctx.stroke();
  for (let v = 0; v <= yMax; v += 70) {
    setFont(ctx, 18, '400');
    ctx.fillStyle = C.sub;
    ctx.textAlign = 'left';
    ctx.fillText(String(v), x0 - 116, yOf(v) + 6);
    ctx.beginPath();
    ctx.moveTo(x0 - 68, yOf(v));
    ctx.lineTo(x0 - 60, yOf(v));
    ctx.lineWidth = 2;
    ctx.strokeStyle = C.sub;
    ctx.stroke();
  }
  ctx.save();
  ctx.translate(x0 - 150, (topY + baseY) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  setFont(ctx, 19, '700');
  ctx.fillStyle = C.ink;
  ctx.fillText('Number of seedlings', 0, 0);
  ctx.restore();

  groups.forEach((g, gi) => {
    const gx = x0 + 120 + gi * groupGap;
    // observed bar
    ctx.fillStyle = C.accent;
    ctx.fillRect(gx - bw - innerGap / 2, yOf(g.obs), bw, baseY - yOf(g.obs));
    // expected bar (outlined)
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(gx + innerGap / 2, yOf(g.exp), bw, baseY - yOf(g.exp));
    ctx.lineWidth = 3;
    ctx.setLineDash([9, 6]);
    ctx.strokeStyle = C.sub;
    ctx.strokeRect(gx + innerGap / 2, yOf(g.exp), bw, baseY - yOf(g.exp));
    ctx.setLineDash([]);

    // value labels
    textCentered(ctx, String(g.obs), gx - bw / 2 - innerGap / 2, yOf(g.obs) - 26, 140, 22, '700', C.accent);
    textCentered(ctx, String(g.exp) + ' (E)', gx + bw / 2 + innerGap / 2, yOf(g.exp) - 26, 150, 22, '700', C.sub);

    // gap annotation
    const gap = g.obs - g.exp;
    const sign = gap >= 0 ? '+' : '\u2212';
    dashedLine(ctx, gx - bw - innerGap / 2 + 20, yOf(Math.max(g.obs, g.exp)), gx + bw + innerGap / 2 - 20, yOf(Math.max(g.obs, g.exp)), C.warn, 2);
    textCentered(ctx, 'O \u2212 E = ' + sign + Math.abs(gap), gx, yOf(Math.max(g.obs, g.exp)) + 34, 300, 20, '700', C.warn);

    textCentered(ctx, g.label, gx, baseY + 38, 160, 24, '700', C.ink);
  });

  // legend
  const lx = 1130, ly = 246;
  ctx.fillStyle = C.accent;
  ctx.fillRect(lx, ly, 34, 24);
  textLeft(ctx, 'Observed (O)', lx + 46, ly + 12, 220, 20, '700');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(lx, ly + 44, 34, 24);
  ctx.lineWidth = 3;
  ctx.setLineDash([8, 5]);
  ctx.strokeStyle = C.sub;
  ctx.strokeRect(lx, ly + 44, 34, 24);
  ctx.setLineDash([]);
  textLeft(ctx, 'Expected (E)', lx + 46, ly + 56, 220, 20, '700');

  textCentered(ctx, 'Each gap is tiny beside the expected count it is measured against \u2014 which is why \u03c7\u00b2 comes out at only 0.60', W / 2, H - 40, W - 200, 21, '400', C.sub);
  save('a21-chi-squared.png', canvas);
}

renderCycle();
renderSampling();
renderCentralTendency();
renderNormal();
renderErrorBars();
renderChiSquared();

module.exports = { files: results };