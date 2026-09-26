// Renders the eight custom diagrams for the LHS AS 1 "Experimental
// Techniques" chapter as 2x-scale PNGs into public/lesson-assets/lhs-as1.
const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const OUT_DIR = path.join(__dirname, '..', '..', 'public', 'lesson-assets', 'lhs-as1');
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
  accent2: '#0ea5e9',
  warn: '#cc2222',
  ok: '#16a34a',
  liquid: '#bfdbfe',
  liquidSoft: '#dbeafe',
};

function setFont(ctx, size, weight) {
  ctx.font = (weight || '400') + ' ' + size + 'px Arial, Helvetica, sans-serif';
}

// Shrink the font until the text fits the given width (guards against clipped labels).
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
  textCentered(ctx, text, w / 2, 62, w - 80, 40, '700');
  if (sub) textCentered(ctx, sub, w / 2, 104, w - 120, 22, '400', C.sub);
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
  const head = 9;
  const ang = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2 - head * Math.cos(ang) * 0.9, y2 - head * Math.sin(ang) * 0.9);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(ang - 0.45), y2 - head * Math.sin(ang - 0.45));
  ctx.lineTo(x2 - head * Math.cos(ang + 0.45), y2 - head * Math.sin(ang + 0.45));
  ctx.closePath();
  ctx.fill();
}

function doubleArrow(ctx, x, y1, y2, width, color) {
  const a = Math.min(y1, y2);
  const b = Math.max(y1, y2);
  ctx.strokeStyle = color || C.ink;
  ctx.lineWidth = width || 3;
  ctx.beginPath();
  ctx.moveTo(x, a + 9);
  ctx.lineTo(x, b - 9);
  ctx.stroke();
  arrow(ctx, x, a + 9, x, a, width, color);
  arrow(ctx, x, b - 9, x, b, width, color);
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

/* ---------- 1. Accuracy and precision (four dartboards) ---------- */
function renderAccuracyPrecision() {
  const W = 1600;
  const H = 1000;
  const { canvas, ctx } = makeCanvas(W, H);
  title(
    ctx,
    W,
    'Accuracy and precision are not the same thing',
    'Precision = repeat readings close together.  Accuracy = close to the true value.',
  );

  const targets = [
    { cx: 280, dots: [[-9, 11], [10, -7], [1, -3]], l1: 'Accurate and precise', l2: 'tight cluster on the bullseye' },
    { cx: 680, dots: [[-78, -82], [-60, -88], [-72, -62]], l1: 'Precise, not accurate', l2: 'systematic error: tight cluster, wrong place' },
    { cx: 1080, dots: [[70, 52], [-82, 32], [-18, -92]], l1: 'Accurate on average, not precise', l2: 'random error: scatter around the bullseye' },
    { cx: 1480, dots: [[110, 62], [82, -102], [152, -42]], l2: 'scatter away from the bullseye', l1: 'Neither' },
  ];
  const cy = 420;
  const r = 150;

  for (const t of targets) {
    // dartboard rings
    const rings = [1, 0.72, 0.44, 0.18];
    for (let i = 0; i < rings.length; i++) {
      ctx.beginPath();
      ctx.arc(t.cx, cy, r * rings[i], 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? '#ffffff' : '#e8b4b4';
      if (i === rings.length - 1) ctx.fillStyle = C.warn;
      ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
    // darts
    for (const [dx, dy] of t.dots) {
      ctx.beginPath();
      ctx.arc(t.cx + dx, cy + dy, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    textCentered(ctx, t.l1, t.cx, cy + r + 54, 360, 27, '700');
    textCentered(ctx, t.l2, t.cx, cy + r + 92, 360, 21, '400', C.sub);
  }

  textCentered(
    ctx,
    'Repeats reduce scatter (random error). Only calibration or a change of method removes a constant shift (systematic error).',
    W / 2,
    H - 60,
    W - 160,
    23,
    '600',
    C.sub,
  );
  save('as1-accuracy-precision.png', canvas);
}

/* ---------- 2. Magnification triangle ---------- */
function renderMagnification() {
  const W = 1600;
  const H = 950;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'The magnification triangle:  I = A \u00d7 M', 'Cover the quantity you want; the other two show how to calculate it.');

  // triangle
  const apex = [430, 260];
  const bl = [180, 640];
  const br = [680, 640];
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 7;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(apex[0], apex[1]);
  ctx.lineTo(br[0], br[1]);
  ctx.lineTo(bl[0], bl[1]);
  ctx.closePath();
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(268, 470);
  ctx.lineTo(592, 470);
  ctx.stroke();

  textCentered(ctx, 'I', 430, 385, 200, 60, '800', C.accent);
  textCentered(ctx, 'Image size', 430, 452, 240, 20, '600', C.sub);
  textCentered(ctx, 'A', 300, 570, 100, 52, '800', C.accent);
  textCentered(ctx, 'Actual size', 300, 632, 240, 20, '600', C.sub);
  textCentered(ctx, 'M', 560, 570, 100, 52, '800', C.accent);
  textCentered(ctx, 'Magnification', 560, 632, 260, 20, '600', C.sub);

  // worked example card
  roundRect(ctx, 830, 220, 730, 480, 24);
  ctx.fillStyle = C.panel;
  ctx.fill();
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 3;
  ctx.stroke();
  textCentered(ctx, 'Worked example', 1195, 275, 640, 30, '700');
  const lines = [
    ['Image size', '12 mm'],
    ['Magnification', '\u00d7 400'],
    ['Actual size = I \u00f7 M', '12 \u00f7 400 = 0.03 mm'],
    ['Convert to micrometres', '0.03 mm \u00d7 1000 = 30 \u03bcm'],
  ];
  let y = 340;
  for (let i = 0; i < lines.length; i++) {
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 2;
    if (i > 0) {
      ctx.beginPath();
      ctx.moveTo(880, y - 27);
      ctx.lineTo(1510, y - 27);
      ctx.stroke();
    }
    ctx.textAlign = 'left';
    ctx.fillStyle = C.ink;
    setFont(ctx, 25, i > 1 ? '700' : '400');
    ctx.fillText(lines[i][0], 900, y);
    ctx.textAlign = 'right';
    setFont(ctx, 25, '700');
    ctx.fillStyle = C.accent;
    ctx.fillText(lines[i][1], 1490, y);
    y += 84;
  }
  textCentered(ctx, 'Convert image size and actual size into the same units before dividing.', 1195, 745, 660, 22, '400', C.sub);

  textCentered(
    ctx,
    'I = A \u00d7 M     rearranges to     A = I \u00f7 M     and     M = I \u00f7 A',
    W / 2,
    850,
    W - 200,
    30,
    '700',
    C.sub,
  );
  save('as1-microscopy-magnification.png', canvas);
}

/* ---------- 3. Streak plate and cone of heat ---------- */
function renderAseptic() {
  const W = 1600;
  const H = 1000;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Streak plating and the cone of heat', 'Two habits that keep a culture pure and a worker safe.');

  // ---- left: petri dish ----
  const cx = 390;
  const cy = 470;
  const r = 200;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#faf6ec';
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  ctx.stroke();
  // faint quadrant cross
  ctx.strokeStyle = C.grid;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - r + 14, cy);
  ctx.lineTo(cx + r - 14, cy);
  ctx.moveTo(cx, cy - r + 14);
  ctx.lineTo(cx, cy + r - 14);
  ctx.stroke();

  // zigzag streaks per quadrant
  ctx.strokeStyle = '#7c3aed';
  ctx.lineWidth = 4;
  const quads = [
    [[-1, -1], 0],
    [[1, -1], 1],
    [[1, 1], 2],
    [[-1, 1], 3],
  ];
  for (const [[sx, sy]] of quads) {
    ctx.beginPath();
    const qx = cx + sx * 95;
    const qy = cy + sy * 95;
    ctx.moveTo(qx - sx * 60, qy - sy * 60);
    for (let i = 0; i < 4; i++) {
      ctx.lineTo(qx - sx * (60 - i * 40), qy + sy * (i % 2 === 0 ? 58 : 20));
      ctx.lineTo(qx - sx * (60 - i * 40 - 20), qy + sy * (i % 2 === 0 ? 20 : 58));
    }
    ctx.stroke();
  }
  // isolated colonies in the last quadrant
  ctx.fillStyle = '#7c3aed';
  for (const [px, py] of [[-60, 40], [-30, 80], [-90, 90], [-45, 55]]) {
    ctx.beginPath();
    ctx.arc(cx + px, cy + py, 8, 0, Math.PI * 2);
    ctx.fill();
  }
  textCentered(ctx, 'fourth quadrant:', cx - 100, cy + 135, 200, 19, '700', '#7c3aed');
  textCentered(ctx, 'isolated colonies', cx - 100, cy + 158, 200, 19, '700', '#7c3aed');

  // step badges around the dish
  const badges = [
    [cx, cy - r - 36, '1  streak'],
    [cx + r + 55, cy - 60, '2  re-sterilise'],
    [cx, cy + r + 36, '3  rotate 90\u00b0'],
    [cx - r - 55, cy - 60, '4  repeat'],
  ];
  for (const [bx, by, label] of badges) {
    const w = Math.max(110, ctx.measureText(label).width + 60);
    roundRect(ctx, bx - w / 2, by - 22, w, 44, 22);
    ctx.fillStyle = C.accent;
    ctx.fill();
    textCentered(ctx, label, bx, by, w - 24, 19, '700', '#ffffff');
  }
  textCentered(ctx, 'Each quadrant dilutes the sample further, until single cells grow into separate colonies.', 390, 780, 560, 21, '400', C.sub);

  // ---- right: Bunsen cone of heat ----
  const bx = 1210;
  const by = 660;
  // updraft arrows
  arrow(ctx, bx - 110, by - 60, bx - 190, 300, 5, C.accent2);
  arrow(ctx, bx + 110, by - 60, bx + 190, 300, 5, C.accent2);
  arrow(ctx, bx, by - 220, bx, 250, 5, C.accent2);
  // base
  roundRect(ctx, bx - 90, by, 180, 26, 8);
  ctx.fillStyle = '#334155';
  ctx.fill();
  // stem
  roundRect(ctx, bx - 16, by - 90, 32, 90, 6);
  ctx.fillStyle = '#64748b';
  ctx.fill();
  // outer flame
  ctx.beginPath();
  ctx.moveTo(bx - 44, by - 92);
  ctx.bezierCurveTo(bx - 50, by - 190, bx - 16, by - 250, bx, by - 330);
  ctx.bezierCurveTo(bx + 16, by - 250, bx + 50, by - 190, bx + 44, by - 92);
  ctx.closePath();
  ctx.fillStyle = '#f59e0b';
  ctx.fill();
  // inner blue cone
  ctx.beginPath();
  ctx.moveTo(bx - 24, by - 92);
  ctx.lineTo(bx, by - 232);
  ctx.lineTo(bx + 24, by - 92);
  ctx.closePath();
  ctx.fillStyle = '#93c5fd';
  ctx.fill();

  textCentered(ctx, 'rising warm air carries', bx - 150, 280, 300, 21, '700', C.accent2);
  textCentered(ctx, 'airborne microbes away', bx - 150, 306, 300, 21, '700', C.accent2);
  textCentered(ctx, 'cone of heat', bx, 700 + 60, 300, 22, '700', C.sub);
  textCentered(ctx, 'Work with open plates close to the roaring blue flame.', bx, 800, 480, 21, '400', C.sub);

  textCentered(
    ctx,
    'Both directions of protection: contamination stays out of the culture, and the culture stays contained.',
    W / 2,
    H - 60,
    W - 200,
    23,
    '600',
    C.sub,
  );
  save('as1-aseptic-streak.png', canvas);
}

/* ---------- 4. Standard solution, five steps ---------- */
function drawFlask(ctx, cx, top, opts) {
  const o = opts || {};
  const neckW = 34;
  const neckH = 78;
  const bulbR = 64;
  const bulbCy = top + neckH + bulbR - 10;
  // liquid
  if (o.liquid) {
    ctx.save();
    ctx.beginPath();
    ctx.rect(cx - bulbR, bulbCy - 24, bulbR * 2, bulbR + 24);
    ctx.clip();
    ctx.beginPath();
    ctx.arc(cx, bulbCy, bulbR, 0, Math.PI * 2);
    ctx.fillStyle = C.liquidSoft;
    ctx.fill();
    ctx.restore();
  }
  // neck
  ctx.beginPath();
  ctx.rect(cx - neckW / 2, top, neckW, neckH);
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.stroke();
  // bulb
  ctx.beginPath();
  ctx.arc(cx, bulbCy, bulbR, 0, Math.PI * 2);
  ctx.stroke();
  // graduation mark
  if (o.mark) {
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx - neckW / 2 - 8, top + 26);
    ctx.lineTo(cx + neckW / 2 + 8, top + 26);
    ctx.stroke();
  }
  if (o.stopper) {
    roundRect(ctx, cx - 14, top - 24, 28, 24, 6);
    ctx.fillStyle = '#a855f7';
    ctx.fill();
  }
}

function renderStandardSolution() {
  const W = 1700;
  const H = 1000;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Preparing a standard solution', 'Five steps \u2014 each one exists to keep the concentration exactly as calculated.');

  const steps = [
    ['1. Weigh by difference', 'record to 0.01 g'],
    ['2. Dissolve fully', 'in deionised water'],
    ['3. Transfer and rinse', 'not one crystal lost'],
    ['4. Make up to the mark', 'meniscus at eye level'],
    ['5. Stopper and invert', 'at least ten times'],
  ];
  const pw = 310;
  const gap = 25;
  const x0 = 40;
  const py = 180;
  const ph = 560;

  for (let i = 0; i < steps.length; i++) {
    const px = x0 + i * (pw + gap);
    roundRect(ctx, px, py, pw, ph, 18);
    ctx.fillStyle = C.panel;
    ctx.fill();
    ctx.strokeStyle = C.faint;
    ctx.lineWidth = 2;
    ctx.stroke();
    const midX = px + pw / 2;

    ctx.save();
    if (i === 0) {
      // balance with weighing boat
      roundRect(ctx, midX - 80, py + 190, 160, 22, 6);
      ctx.fillStyle = '#64748b';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(midX - 60, py + 190);
      ctx.lineTo(midX - 46, py + 150);
      ctx.lineTo(midX + 46, py + 150);
      ctx.lineTo(midX + 60, py + 190);
      ctx.closePath();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(midX - 46, py + 150);
      ctx.lineTo(midX + 46, py + 150);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(midX, py + 140, 42, 14, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#cbd5e1';
      ctx.fill();
      ctx.strokeStyle = C.ink;
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(midX, py + 137, 30, 9, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      textCentered(ctx, '\u00b1 0.01 g', midX, py + 265, 200, 22, '700', C.sub);
    } else if (i === 1) {
      // beaker with rod
      ctx.beginPath();
      ctx.moveTo(midX - 60, py + 130);
      ctx.lineTo(midX - 50, py + 250);
      ctx.lineTo(midX + 50, py + 250);
      ctx.lineTo(midX + 60, py + 130);
      ctx.closePath();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(midX - 55, py + 190);
      ctx.lineTo(midX + 55, py + 190);
      ctx.lineTo(midX + 50, py + 250);
      ctx.lineTo(midX - 50, py + 250);
      ctx.closePath();
      ctx.fillStyle = C.liquidSoft;
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(midX - 55, py + 60);
      ctx.lineTo(midX + 40, py + 205);
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 6;
      ctx.stroke();
    } else if (i === 2) {
      // funnel above flask
      drawFlask(ctx, midX, py + 150, { liquid: true });
      ctx.beginPath();
      ctx.moveTo(midX - 70, py + 60);
      ctx.lineTo(midX + 70, py + 60);
      ctx.lineTo(midX + 17, py + 122);
      ctx.lineTo(midX + 17, py + 150);
      ctx.moveTo(midX - 17, py + 122);
      ctx.lineTo(midX - 17, py + 150);
      ctx.closePath();
      ctx.strokeStyle = C.ink;
      ctx.lineWidth = 3;
      ctx.stroke();
      textCentered(ctx, 'rinse beaker, rod', midX, py + 330, 260, 18, '600', C.sub);
      textCentered(ctx, 'and funnel into flask', midX, py + 352, 260, 18, '600', C.sub);
    } else if (i === 3) {
      drawFlask(ctx, midX, py + 110, { liquid: true, mark: true });
      arrow(ctx, midX + 120, py + 136, midX + 26, py + 136, 3, C.accent);
      textCentered(ctx, 'eye level', midX + 120, py + 110, 160, 20, '700', C.accent);
    } else {
      ctx.save();
      ctx.translate(midX, py + 190);
      ctx.rotate(-0.5);
      drawFlask(ctx, 0, -50, { liquid: true, stopper: true });
      ctx.restore();
      ctx.beginPath();
      ctx.arc(midX, py + 190, 105, -0.6, 3.6);
      ctx.strokeStyle = C.accent2;
      ctx.lineWidth = 5;
      ctx.stroke();
      const ax = midX + 105 * Math.cos(3.6);
      const ay = py + 190 + 105 * Math.sin(3.6);
      arrow(ctx, ax - 14 * Math.cos(3.6), ay - 14 * Math.sin(3.6), ax + 2, ay + 4, 5, C.accent2);
      textCentered(ctx, '\u00d7 10', midX, py + 340, 160, 24, '700', C.accent2);
    }
    ctx.restore();
    textCentered(ctx, steps[i][0], midX, py + ph - 74, pw - 30, 23, '700');
    textCentered(ctx, steps[i][1], midX, py + ph - 44, pw - 30, 20, '400', C.sub);
  }

  textCentered(ctx, 'Calculate first:  n = c \u00d7 V,  then  m = n \u00d7 Mr', W / 2, H - 60, W - 300, 26, '700', C.sub);
  save('as1-standard-solution.png', canvas);
}

/* ---------- 5. Titration apparatus ---------- */
function renderTitration() {
  const W = 1500;
  const H = 1280;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Titration apparatus', 'Burette rinsed with the titrant \u2014 pipette rinsed with the analyte \u2014 conical flask rinsed with deionised water only.');

  // stand
  roundRect(ctx, 390, 1180, 320, 26, 8);
  ctx.fillStyle = '#334155';
  ctx.fill();
  ctx.fillRect(690, 320, 14, 886);
  ctx.fillStyle = '#64748b';
  ctx.fill();

  // clamp arm
  ctx.fillRect(600, 350, 92, 14);
  ctx.fillStyle = '#64748b';
  ctx.fill();

  // burette
  ctx.beginPath();
  ctx.rect(560, 280, 44, 700);
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.stroke();
  // liquid
  ctx.fillStyle = C.liquid;
  ctx.fillRect(561, 690, 42, 289);
  // meniscus
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(561, 700);
  ctx.quadraticCurveTo(582, 688, 603, 700);
  ctx.stroke();
  // graduations
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2;
  ctx.textAlign = 'left';
  ctx.fillStyle = C.ink;
  for (let v = 0; v <= 50; v += 1) {
    const y = 290 + v * 13.8;
    if (y > 975) break;
    const major = v % 5 === 0;
    ctx.beginPath();
    ctx.moveTo(560, y);
    ctx.lineTo(560 + (major ? 14 : 8), y);
    ctx.stroke();
    if (v % 10 === 0) {
      setFont(ctx, 17, '600');
      ctx.fillText(String(v), 528, y + 6);
    }
  }
  // tip
  ctx.beginPath();
  ctx.moveTo(568, 980);
  ctx.lineTo(582, 1010);
  ctx.lineTo(596, 980);
  ctx.closePath();
  ctx.fillStyle = C.liquid;
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.stroke();

  // conical flask
  ctx.beginPath();
  ctx.moveTo(522, 1012);
  ctx.lineTo(522, 1040);
  ctx.lineTo(480, 1150);
  ctx.lineTo(684, 1150);
  ctx.lineTo(642, 1040);
  ctx.lineTo(642, 1012);
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(488, 1105);
  ctx.lineTo(676, 1105);
  ctx.lineTo(684, 1150);
  ctx.lineTo(480, 1150);
  ctx.closePath();
  ctx.fillStyle = '#fce7f3';
  ctx.fill();

  // white tile
  roundRect(ctx, 430, 1150, 300, 22, 6);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // pipette with filler on the right
  ctx.beginPath();
  ctx.rect(1150, 620, 26, 380);
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(1163, 585, 30, 46, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#fbbf24';
  ctx.fill();
  ctx.stroke();

  // meniscus inset
  const ix = 880;
  const iy = 560;
  const ir = 150;
  ctx.save();
  ctx.beginPath();
  ctx.arc(ix, iy, ir, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.clip();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(ix - 90, iy - 110);
  ctx.lineTo(ix - 90, iy + 110);
  ctx.moveTo(ix + 90, iy - 110);
  ctx.lineTo(ix + 90, iy + 110);
  ctx.stroke();
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(ix - 90, iy - 30);
  ctx.quadraticCurveTo(ix, iy - 50, ix + 90, iy - 30);
  ctx.stroke();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 7]);
  ctx.beginPath();
  ctx.moveTo(ix - 90, iy - 40);
  ctx.lineTo(ix + 90, iy - 40);
  ctx.stroke();
  ctx.setLineDash([]);
  arrow(ctx, ix + 40, iy + 60, ix + 6, iy - 34, 3, C.warn);
  ctx.restore();
  ctx.beginPath();
  ctx.arc(ix, iy, ir, 0, Math.PI * 2);
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 4;
  ctx.stroke();
  textCentered(ctx, 'read the bottom of the meniscus', ix, iy + ir + 42, 340, 20, '700', C.sub);
  textCentered(ctx, 'at eye level, to 2 decimal places', ix, iy + ir + 68, 340, 20, '400', C.sub);
  textCentered(ctx, '24.35 cm\u00b3', ix - 45, iy + 110, 200, 24, '700', C.warn);
  // connector to inset
  ctx.strokeStyle = C.faint;
  ctx.lineWidth = 2.5;
  ctx.setLineDash([8, 6]);
  ctx.beginPath();
  ctx.moveTo(604, 700);
  ctx.lineTo(ix - ir, iy + 40);
  ctx.stroke();
  ctx.setLineDash([]);

  // labels with leader lines
  function label(text, lx, ly, tx, ty) {
    ctx.strokeStyle = C.faint;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    arrow(ctx, lx - (lx - tx) * 0.04, ly - (ly - ty) * 0.04, tx, ty, 2.5, C.faint);
    textCentered(ctx, text, lx, ly - 16, 420, 21, '700', C.ink);
  }
  label('burette \u2014 rinse with the titrant', 250, 340, 558, 400);
  label('pipette + filler \u2014 rinse with the analyte', 1250, 560, 1176, 640);
  label('conical flask \u2014 deionised water only', 200, 1215, 500, 1120);
  label('white tile \u2014 shows the endpoint colour', 1050, 1240, 700, 1165);

  save('as1-titration-apparatus.png', canvas);
}

/* ---------- 6. Calorimetry ---------- */
function renderCalorimetry() {
  const W = 1500;
  const H = 1000;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'A simple calorimeter', 'Every feature exists to keep the heat where the measurement needs it.');

  // support beaker (dashed outline)
  ctx.setLineDash([12, 9]);
  ctx.strokeStyle = C.faint;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(480, 350);
  ctx.lineTo(500, 820);
  ctx.lineTo(820, 820);
  ctx.lineTo(840, 350);
  ctx.stroke();
  ctx.setLineDash([]);
  textCentered(ctx, 'beaker for support', 660, 860, 300, 20, '400', C.sub);

  // polystyrene cup (double wall)
  ctx.beginPath();
  ctx.moveTo(560, 380);
  ctx.lineTo(580, 790);
  ctx.lineTo(740, 790);
  ctx.lineTo(760, 380);
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  ctx.stroke();
  // liquid
  ctx.beginPath();
  ctx.moveTo(572, 520);
  ctx.lineTo(585, 788);
  ctx.lineTo(735, 788);
  ctx.lineTo(748, 520);
  ctx.closePath();
  ctx.fillStyle = C.liquidSoft;
  ctx.fill();
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.stroke();

  // lid
  roundRect(ctx, 540, 356, 240, 20, 8);
  ctx.fillStyle = '#e2e8f0';
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.stroke();

  // thermometer
  ctx.fillRect(640, 140, 16, 500);
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.strokeRect(640, 140, 16, 500);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(643, 320, 10, 318);
  ctx.beginPath();
  ctx.arc(648, 652, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444';
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(640, 180 + i * 46);
    ctx.lineTo(632, 180 + i * 46);
    ctx.stroke();
  }

  // stirrer
  ctx.beginPath();
  ctx.moveTo(790, 300);
  ctx.lineTo(730, 660);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 6;
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(726, 672, 12, 0, Math.PI * 2);
  ctx.stroke();

  // labels
  function calLabel(text, lx, ly, tx, ty, color) {
    ctx.strokeStyle = C.faint;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(lx, ly);
    ctx.lineTo(tx, ty);
    ctx.stroke();
    textCentered(ctx, text, lx, ly - 18, 430, 21, '700', color || C.ink);
  }
  calLabel('lid \u2014 cuts evaporation', 300, 300, 540, 366);
  calLabel('polystyrene cup \u2014 insulating, low heat capacity', 240, 620, 572, 660);
  calLabel('thermometer reads to 0.1 \u00b0C', 660, 120, 648, 160, C.warn);
  calLabel('stirrer \u2014 keeps temperature uniform', 1000, 420, 795, 330);

  // formula card
  roundRect(ctx, 1020, 560, 440, 300, 20);
  ctx.fillStyle = C.panel;
  ctx.fill();
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 3;
  ctx.stroke();
  textCentered(ctx, 'q = m \u00d7 c \u00d7 \u0394T', 1240, 640, 400, 38, '800', C.accent);
  textCentered(ctx, '\u0394H = \u2212q \u00f7 (n \u00d7 1000)', 1240, 710, 400, 30, '700', C.accent);
  textCentered(ctx, 'm in grams,  c = 4.18 J g\u207b\u00b9 \u00b0C\u207b\u00b9', 1240, 790, 400, 21, '400', C.sub);
  textCentered(ctx, 'exothermic: temperature rises, \u0394H negative', 1240, 825, 400, 21, '400', C.sub);

  save('as1-calorimetry.png', canvas);
}

/* ---------- 7. Chromatography ---------- */
function renderChromatography() {
  const W = 1500;
  const H = 1060;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Paper chromatography', 'Origin in pencil \u2014 solvent level below the origin \u2014 lid on \u2014 mark the front immediately.');

  // beaker
  roundRect(ctx, 290, 260, 500, 700, 18);
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  ctx.stroke();
  // solvent
  ctx.fillStyle = '#dbeafe';
  ctx.fillRect(294, 810, 492, 146);
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(294, 810);
  ctx.lineTo(786, 810);
  ctx.stroke();
  textCentered(ctx, 'solvent', 400, 940, 160, 21, '700', '#2563eb');

  // lid
  ctx.beginPath();
  ctx.ellipse(540, 260, 250, 38, 0, Math.PI, Math.PI * 2);
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  ctx.stroke();

  // paper
  ctx.fillStyle = '#fffdf5';
  ctx.fillRect(500, 232, 80, 676);
  ctx.strokeStyle = C.faint;
  ctx.lineWidth = 2;
  ctx.strokeRect(500, 232, 80, 676);

  const originY = 700;
  // origin line (pencil)
  ctx.strokeStyle = '#6b7280';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(500, originY);
  ctx.lineTo(580, originY);
  ctx.stroke();
  // solvent front
  ctx.strokeStyle = '#2563eb';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(500, 420);
  ctx.lineTo(580, 420);
  ctx.stroke();

  // spots
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(525, originY - 4, 11, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#14b8a6';
  ctx.beginPath();
  ctx.arc(555, originY - 4, 11, 0, Math.PI * 2);
  ctx.fill();
  // developed spots
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath();
  ctx.arc(525, 560, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#14b8a6';
  ctx.beginPath();
  ctx.arc(555, 470, 13, 0, Math.PI * 2);
  ctx.fill();

  // labels inside
  textCentered(ctx, 'solvent front', 640, 420, 150, 18, '700', '#2563eb');
  textCentered(ctx, 'pencil origin', 410, 730, 160, 18, '700', '#6b7280');

  // guide lines out to the right + measurement arrows
  ctx.strokeStyle = C.faint;
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  for (const yy of [420, 560, 700]) {
    ctx.beginPath();
    ctx.moveTo(580, yy);
    ctx.lineTo(860, yy);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  doubleArrow(ctx, 890, 560, 700, 3, C.accent);
  doubleArrow(ctx, 950, 420, 700, 3, C.accent);
  ctx.textAlign = 'left';
  ctx.fillStyle = C.accent;
  setFont(ctx, 22, '700');
  ctx.fillText('solute: 36 mm', 975, 636);
  ctx.fillText('front: 60 mm', 1010, 556);

  // Rf card
  roundRect(ctx, 1060, 660, 380, 170, 18);
  ctx.fillStyle = C.panel;
  ctx.fill();
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 3;
  ctx.stroke();
  textCentered(ctx, 'Rf = solute \u00f7 front', 1250, 712, 340, 26, '700');
  textCentered(ctx, '= 36 \u00f7 60 = 0.60', 1250, 765, 340, 28, '800', C.accent);
  textCentered(ctx, 'always between 0 and 1', 1250, 808, 340, 19, '400', C.sub);

  save('as1-chromatography.png', canvas);
}

/* ---------- 8. Calibration curve ---------- */
function renderCalibrationCurve() {
  const W = 1600;
  const H = 1000;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'A colorimeter calibration curve', 'Standards of known concentration build the line; the unknown is read from it.');

  const ox = 350;
  const oy = 800;
  const xMax = 1400;
  const yTop = 200;
  const concMax = 10;
  const absMax = 0.8;

  // grid
  ctx.strokeStyle = C.grid;
  ctx.lineWidth = 1.5;
  for (let c = 1; c <= 10; c++) {
    const x = ox + (c / concMax) * (xMax - ox);
    ctx.beginPath();
    ctx.moveTo(x, oy);
    ctx.lineTo(x, yTop - 30);
    ctx.stroke();
  }
  for (let a = 0.1; a <= absMax; a += 0.1) {
    const y = oy - (a / absMax) * (oy - yTop);
    ctx.beginPath();
    ctx.moveTo(ox, y);
    ctx.lineTo(xMax, y);
    ctx.stroke();
  }

  // axes
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  arrow(ctx, ox, oy, xMax + 30, oy, 4, C.ink);
  arrow(ctx, ox, oy, ox, yTop - 60, 4, C.ink);

  // tick labels
  ctx.textAlign = 'center';
  ctx.fillStyle = C.ink;
  setFont(ctx, 19, '400');
  for (let c = 0; c <= concMax; c += 1) {
    const x = ox + (c / concMax) * (xMax - ox);
    ctx.fillText(String(c), x, oy + 34);
  }
  ctx.textAlign = 'right';
  for (let a = 0; a <= absMax + 0.0001; a += 0.2) {
    const y = oy - (a / absMax) * (oy - yTop);
    ctx.fillText(a.toFixed(1), ox - 14, y + 7);
  }
  textCentered(ctx, 'Concentration / g dm\u207b\u00b3', (ox + xMax) / 2 + 60, oy + 80, 500, 24, '700');
  textCentered(ctx, 'Absorbance', ox - 20, yTop - 60, 300, 24, '700');
  textCentered(ctx, '0', ox - 30, oy + 34, 60, 19, '400');

  // best-fit line through origin (A = 0.1 c) extended to c = 8.2
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 4;
  const xFor = (c) => ox + (c / concMax) * (xMax - ox);
  const yFor = (a) => oy - (a / absMax) * (oy - yTop);
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(xFor(8.2), yFor(0.82));
  ctx.stroke();

  // standards
  const standards = [
    [1, 0.10], [2, 0.19], [3, 0.30], [4, 0.42], [5, 0.51], [6, 0.60], [7, 0.70], [8, 0.79],
  ];
  for (const [c, a] of standards) {
    ctx.beginPath();
    ctx.arc(xFor(c), yFor(a), 9, 0, Math.PI * 2);
    ctx.fillStyle = C.accent;
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.stroke();
  }

  // unknown read-off: A = 0.52 -> c = 6.5
  ctx.strokeStyle = '#cc2222';
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 9]);
  ctx.beginPath();
  ctx.moveTo(ox, yFor(0.52));
  ctx.lineTo(xFor(6.5), yFor(0.52));
  ctx.lineTo(xFor(6.5), oy);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(xFor(6.5), yFor(0.52), 10, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.strokeStyle = '#cc2222';
  ctx.lineWidth = 4;
  ctx.stroke();
  arrow(ctx, xFor(6.5), oy - 4, xFor(6.5), oy + 40, 3, '#cc2222');
  ctx.textAlign = 'center';
  ctx.fillStyle = '#cc2222';
  setFont(ctx, 23, '700');
  ctx.fillText('unknown: 6.5 g dm\u207b\u00b3', xFor(6.5) - 10, oy + 72);
  textCentered(ctx, 'unknown absorbance = 0.52', ox + 230, yFor(0.52) - 24, 440, 21, '700', '#cc2222');

  // legend (empty lower-right region)
  const lx = 1090;
  const ly = 560;
  ctx.beginPath();
  ctx.arc(lx, ly, 9, 0, Math.PI * 2);
  ctx.fillStyle = C.accent;
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.textAlign = 'left';
  ctx.fillStyle = C.ink;
  setFont(ctx, 21, '600');
  ctx.fillText('standards of known concentration', lx + 22, ly + 7);
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(lx - 8, ly + 44);
  ctx.lineTo(lx + 16, ly + 44);
  ctx.stroke();
  ctx.fillText('best-fit line through the origin', lx + 22, ly + 51);
  ctx.strokeStyle = '#cc2222';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 8]);
  ctx.beginPath();
  ctx.moveTo(lx - 8, ly + 88);
  ctx.lineTo(lx + 16, ly + 88);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.fillText('unknown: read across, then down', lx + 22, ly + 95);

  save('as1-calibration-curve.png', canvas);
}

/* ---------- render all ---------- */
renderAccuracyPrecision();
renderMagnification();
renderAseptic();
renderStandardSolution();
renderTitration();
renderCalorimetry();
renderChromatography();
renderCalibrationCurve();

module.exports = { results };