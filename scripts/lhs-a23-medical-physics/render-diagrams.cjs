// Renders the ten custom diagrams for the LHS A2 3 "Medical Physics"
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
  panelBorder: '#cbd5e1',
  accent: '#4f46e5',
  accentSoft: '#eef2ff',
  accent2: '#0ea5e9',
  accent2Soft: '#e0f2fe',
  warn: '#cc2222',
  warnSoft: '#fee2e2',
  ok: '#16a34a',
  okSoft: '#dcfce7',
  amber: '#f59e0b',
  amberSoft: '#fef3c7',
  heart: '#dc2626',
  heartSoft: '#fee2e2',
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

function panelBox(ctx, x, y, w, h, fill, stroke, radius) {
  roundRect(ctx, x, y, w, h, radius == null ? 16 : radius);
  ctx.fillStyle = fill || C.panel;
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = stroke || C.panelBorder;
  ctx.stroke();
}

// A small coloured label pill, centred at (x, y).
function chip(ctx, text, x, y, maxWidth, fill, color, size) {
  setFont(ctx, size || 19, '600');
  const tw = Math.min(ctx.measureText(text).width, maxWidth) + 34;
  roundRect(ctx, x - tw / 2, y - 18, tw, 36, 18);
  ctx.fillStyle = fill;
  ctx.fill();
  textCentered(ctx, text, x, y, maxWidth, size || 19, '600', color || C.ink);
}

// A thin leader line from a label to a point on the diagram.
function lead(ctx, x1, y1, x2, y2, color) {
  ctx.strokeStyle = color || C.sub;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.fillStyle = color || C.sub;
  ctx.beginPath();
  ctx.arc(x2, y2, 3.5, 0, Math.PI * 2);
  ctx.fill();
}

function dashedLine(ctx, x1, y1, x2, y2, color, width) {
  ctx.save();
  ctx.setLineDash([10, 8]);
  ctx.strokeStyle = color || C.sub;
  ctx.lineWidth = width || 2.5;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

// Draw a smooth polyline through points (Catmull-Rom-ish via quadratic mids).
function smoothPath(ctx, pts) {
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i][0] + pts[i + 1][0]) / 2;
    const my = (pts[i][1] + pts[i + 1][1]) / 2;
    ctx.quadraticCurveTo(pts[i][0], pts[i][1], mx, my);
  }
  ctx.lineTo(pts[pts.length - 1][0], pts[pts.length - 1][1]);
}

// ---------------- Diagram 1: ECG trace ----------------
function drawEcg() {
  const { canvas, ctx } = makeCanvas(1600, 950);
  title(ctx, 1600, 'The electrocardiogram: one heartbeat, one trace',
    'Electrodes on the chest and limbs record the heart\u2019s electrical activity as waves of depolarisation and repolarisation');

  // ECG paper: fine grid
  const gx = 200, gy = 170, gw = 1200, gh = 520;
  panelBox(ctx, gx - 60, gy - 50, gw + 120, gh + 140, '#ffffff', C.grid, 12);
  ctx.strokeStyle = C.grid;
  ctx.lineWidth = 1;
  for (let x = gx; x <= gx + gw; x += 20) { ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, gy + gh); ctx.stroke(); }
  for (let y = gy; y <= gy + gh; y += 20) { ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx + gw, y); ctx.stroke(); }
  ctx.strokeStyle = '#fecdd3';
  ctx.lineWidth = 1.6;
  for (let x = gx; x <= gx + gw; x += 100) { ctx.beginPath(); ctx.moveTo(x, gy); ctx.lineTo(x, gy + gh); ctx.stroke(); }
  for (let y = gy; y <= gy + gh; y += 100) { ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(gx + gw, y); ctx.stroke(); }

  const baseY = gy + 260;
  // one cycle of PQRST within 200 px; repeat six cycles
  function cyclePts(x0) {
    const pts = [];
    // baseline before P
    pts.push([x0, baseY]);
    // P wave: small bump
    for (let i = 0; i <= 10; i++) {
      const t = i / 10;
      pts.push([x0 + 10 + t * 50, baseY - Math.sin(t * Math.PI) * 45]);
    }
    pts.push([x0 + 62, baseY]);
    // Q dip
    pts.push([x0 + 78, baseY + 16]);
    // R spike
    pts.push([x0 + 95, baseY - 250]);
    pts.push([x0 + 102, baseY - 235]);
    // S dip
    pts.push([x0 + 118, baseY + 45]);
    pts.push([x0 + 132, baseY]);
    // T wave: medium bump
    for (let i = 0; i <= 12; i++) {
      const t = i / 12;
      pts.push([x0 + 150 + t * 80, baseY - Math.sin(t * Math.PI) * 78]);
    }
    pts.push([x0 + 240, baseY]);
    return pts;
  }
  const all = [];
  for (let k = 0; k < 5; k++) all.push(...cyclePts(gx + 40 + k * 240));
  ctx.strokeStyle = C.heart;
  ctx.lineWidth = 4;
  ctx.lineJoin = 'round';
  smoothPath(ctx, all);
  ctx.stroke();

  // Label the second cycle's features
  const cx0 = gx + 40 + 1 * 240;
  lead(ctx, cx0 + 35, gy + 40, cx0 + 35, baseY - 50, C.sub);
  textCentered(ctx, 'P wave', cx0 + 35, gy + 24, 200, 21, '700', C.heart);
  textCentered(ctx, 'atria contract', cx0 + 35, gy + 60, 200, 18, '400', C.sub);
  lead(ctx, cx0 + 98, gy + 40, cx0 + 98, baseY - 255, C.sub);
  textCentered(ctx, 'QRS complex', cx0 + 98, gy + 24, 220, 21, '700', C.heart);
  textCentered(ctx, 'ventricles contract', cx0 + 98, gy + 60, 220, 18, '400', C.sub);
  lead(ctx, cx0 + 190, gy + 40, cx0 + 190, baseY - 82, C.sub);
  textCentered(ctx, 'T wave', cx0 + 190, gy + 24, 200, 21, '700', C.heart);
  textCentered(ctx, 'ventricles relax', cx0 + 190, gy + 60, 220, 18, '400', C.sub);

  // axes
  arrow(ctx, gx - 30, gy + gh + 20, gx + gw + 10, gy + gh + 20, 2.5, C.ink);
  textCentered(ctx, 'time  \u2014  one small square = 0.04 s, one large square = 0.2 s', gx + gw / 2, gy + gh + 62, 700, 19, '400', C.sub);
  arrow(ctx, gx - 30, gy + gh + 20, gx - 30, gy + 6, 2.5, C.ink);
  textLeft(ctx, 'voltage / mV', gx - 52, gy - 22, 200, 18, '600', C.sub);

  chip(ctx, 'Normal resting heart rate: 60\u2013100 beats per minute', 800, 856, 560, C.heartSoft, C.heart, 20);
  chip(ctx, 'Abnormal rhythms (arrhythmias), heart attacks and enlarged hearts all change the trace\u2019s shape', 800, 908, 860, C.panel, C.sub, 18);
  save('a23-ecg-trace.png', canvas);
}

// ---------------- Diagram 2: blood pressure ----------------
function drawBloodPressure() {
  const { canvas, ctx } = makeCanvas(1600, 1000);
  title(ctx, 1600, 'Blood pressure: the two numbers of one heartbeat',
    'Pressure in the arteries when the heart contracts (systolic) and relaxes (diastolic)');

  // Left panel: artery in two states
  panelBox(ctx, 60, 150, 700, 640, C.panel, C.panelBorder);
  textCentered(ctx, 'The same artery at two moments', 410, 190, 620, 24, '700');

  // Systole: wide artery
  const sy = 280;
  textCentered(ctx, 'SYSTOLE \u2014 heart contracted', 200, sy + 22, 260, 19, '700', C.heart);
  roundRect(ctx, 100, sy + 60, 200, 90, 45);
  ctx.fillStyle = C.heartSoft; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = C.heart; ctx.stroke();
  ctx.fillStyle = '#b91c1c';
  roundRect(ctx, 108, sy + 68, 184, 74, 37); ctx.fill();
  // pulsing arrows out
  arrow(ctx, 320, sy + 105, 390, sy + 105, 3, C.heart);
  textLeft(ctx, 'blood forced out \u2014 peak pressure', 400, sy + 70, 280, 18, '600', C.sub);
  textLeft(ctx, '120 mmHg', 400, sy + 108, 280, 22, '700', C.heart);

  // Diastole: narrower artery
  const dy = sy + 220;
  textCentered(ctx, 'DIASTOLE \u2014 heart relaxed', 200, dy + 22, 260, 19, '700', C.accent2);
  roundRect(ctx, 115, dy + 60, 170, 55, 27);
  ctx.fillStyle = C.accent2Soft; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = C.accent2; ctx.stroke();
  ctx.fillStyle = '#0369a1';
  roundRect(ctx, 122, dy + 67, 156, 41, 20); ctx.fill();
  textLeft(ctx, 'arteries recoil \u2014 lowest pressure', 320, dy + 78, 300, 18, '600', C.sub);
  textLeft(ctx, '80 mmHg', 320, dy + 112, 280, 22, '700', C.accent2);

  chip(ctx, 'Written 120/80 mmHg \u2014 \u201c120 over 80\u201d', 410, 740, 420, C.accentSoft, C.accent, 20);

  // Right panel: measuring it
  panelBox(ctx, 820, 150, 720, 640, C.panel, C.panelBorder);
  textCentered(ctx, 'Measuring with a sphygmomanometer', 1180, 190, 640, 24, '700');

  // arm
  roundRect(ctx, 890, 260, 380, 110, 40);
  ctx.fillStyle = '#fde68a'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = '#d97706'; ctx.stroke();
  // cuff
  roundRect(ctx, 960, 245, 150, 140, 14);
  ctx.fillStyle = C.accentSoft; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = C.accent; ctx.stroke();
  textCentered(ctx, 'inflatable cuff', 1035, 315, 130, 17, '700', C.accent);
  // bulb
  ctx.beginPath(); ctx.arc(1330, 345, 24, 0, Math.PI * 2);
  ctx.fillStyle = C.faint; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.sub; ctx.stroke();
  lead(ctx, 1330, 300, 1115, 290, C.sub);
  textLeft(ctx, 'squeeze bulb to inflate,\nthen release slowly', 1210, 250, 240, 16, '600', C.sub);
  // gauge
  ctx.beginPath(); ctx.arc(1470, 430, 60, Math.PI * 0.75, Math.PI * 2.25);
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(1470, 430); ctx.lineTo(1435, 400);
  ctx.strokeStyle = C.warn; ctx.lineWidth = 3.5; ctx.stroke();
  textCentered(ctx, 'mmHg', 1470, 520, 100, 16, '600', C.sub);
  lead(ctx, 1400, 390, 1115, 345, C.sub);
  textCentered(ctx, 'pressure gauge', 1310, 380, 180, 17, '600', C.sub);
  // stethoscope: listening below cuff
  ctx.beginPath(); ctx.arc(1120, 420, 14, 0, Math.PI * 2);
  ctx.fillStyle = C.ok; ctx.fill();
  ctx.strokeStyle = C.ok; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(1120, 434); ctx.quadraticCurveTo(1120, 500, 1190, 505); ctx.stroke();
  textLeft(ctx, 'listen with a stethoscope: the first thump is systolic, silence marks diastolic', 880, 560, 420, 18, '600', C.sub);
  chip(ctx, 'High (hypertension): persistently \u2265 140/90 mmHg \u2014 risk factor for stroke and heart disease', 1180, 660, 640, C.warnSoft, C.warn, 18);
  chip(ctx, 'Low (hypotension): dizziness and fainting as the brain is under-supplied', 1180, 716, 640, C.accent2Soft, '#0369a1', 18);
  chip(ctx, 'Normal adult: about 120/80 mmHg', 1180, 770, 480, C.okSoft, '#166534', 19);
  save('a23-blood-pressure.png', canvas);
}

// ---------------- Diagram 3: vitals monitoring ----------------
function drawVitals() {
  const { canvas, ctx } = makeCanvas(1600, 1000);
  title(ctx, 1600, 'Three everyday vital signs on a monitor chart',
    'Respiratory rate, body temperature and oxygen saturation \u2014 quick, painless, and diagnostic');

  // Panel 1: respiratory rate
  panelBox(ctx, 60, 150, 460, 640, C.panel, C.panelBorder);
  textCentered(ctx, 'Respiratory rate', 290, 190, 400, 24, '700');
  // lungs schematic
  ctx.fillStyle = C.heartSoft; ctx.strokeStyle = C.heart; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.ellipse(250, 320, 55, 75, 0.25, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(345, 320, 55, 75, -0.25, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = C.sub; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(297, 265); ctx.lineTo(297, 340); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(297, 265); ctx.quadraticCurveTo(250, 240, 230, 250); ctx.stroke();
  arrow(ctx, 290, 400, 290, 470, 3, C.accent2);
  arrow(ctx, 310, 470, 310, 400, 3, C.accent2);
  textCentered(ctx, 'one breath in and out = 1', 295, 500, 300, 17, '600', C.sub);
  chip(ctx, 'Adult normal: 12\u201320 breaths per minute', 290, 580, 380, C.accent2Soft, '#0369a1', 18);
  chip(ctx, 'Fast rate signals infection, pain or breathing difficulty', 290, 640, 400, C.warnSoft, C.warn, 17);

  // Panel 2: body temperature
  panelBox(ctx, 570, 150, 460, 640, C.panel, C.panelBorder);
  textCentered(ctx, 'Body temperature', 800, 190, 400, 24, '700');
  // thermometer
  roundRect(ctx, 775, 270, 44, 260, 22);
  ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
  ctx.fillStyle = C.warn;
  roundRect(ctx, 786, 330, 22, 190, 11); ctx.fill();
  ctx.beginPath(); ctx.arc(797, 545, 26, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.stroke();
  // scale ticks
  for (let i = 0; i < 5; i++) {
    const y = 300 + i * 50;
    ctx.beginPath(); ctx.moveTo(825, y); ctx.lineTo(840, y); ctx.stroke();
  }
  textLeft(ctx, '37\u00b0C', 848, 330, 100, 19, '700', C.warn);
  textLeft(ctx, '36\u00b0C', 848, 480, 100, 17, '600', C.sub);
  chip(ctx, 'Normal: 36.5\u201337.5\u00b0C', 800, 580, 380, C.okSoft, '#166534', 18);
  chip(ctx, 'Fever (above normal) signals infection; hypothermia (below 35\u00b0C) is a medical emergency', 800, 640, 420, C.warnSoft, C.warn, 17);

  // Panel 3: pulse oximetry
  panelBox(ctx, 1080, 150, 460, 640, C.panel, C.panelBorder);
  textCentered(ctx, 'Pulse oximetry', 1310, 190, 400, 24, '700');
  // finger clip
  ctx.fillStyle = '#fde68a'; ctx.strokeStyle = '#d97706'; ctx.lineWidth = 3;
  roundRect(ctx, 1160, 270, 150, 220, 60); ctx.fill(); ctx.stroke();
  roundRect(ctx, 1230, 255, 150, 250, 60);
  ctx.fillStyle = '#fbbf24'; ctx.fill();
  ctx.beginPath(); ctx.arc(1240, 300, 8, 0, Math.PI * 2); ctx.fillStyle = C.warn; ctx.fill();
  ctx.beginPath(); ctx.arc(1240, 430, 8, 0, Math.PI * 2); ctx.fillStyle = C.accent2; ctx.fill();
  lead(ctx, 1240, 300, 1400, 270, C.warn);
  textLeft(ctx, 'red light source', 1330, 250, 180, 16, '600', C.warn);
  lead(ctx, 1240, 430, 1400, 460, C.accent2);
  textLeft(ctx, 'infrared light source', 1320, 480, 190, 16, '600', '#0369a1');
  // display
  roundRect(ctx, 1160, 520, 300, 90, 14);
  ctx.fillStyle = '#0f172a'; ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.stroke();
  setFont(ctx, 42, '700');
  ctx.fillStyle = '#22d3ee';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.fillText('SpO\u2082  98%', 1310, 565);
  chip(ctx, 'Oxygen-saturated haemoglobin absorbs the two lights differently', 1310, 650, 420, C.accent2Soft, '#0369a1', 17);
  chip(ctx, 'Normal: 95\u2013100%; below 90% is hypoxia \u2014 urgent review', 1310, 706, 420, C.warnSoft, C.warn, 17);

  chip(ctx, 'Nurses chart all vital signs together \u2014 one reading out of range narrows the diagnosis; several together paint the whole picture', 800, 860, 1100, C.accentSoft, C.accent, 19);
  save('a23-vitals-monitoring.png', canvas);
}

// ---------------- Diagram 4: EEG ----------------
function drawEeg() {
  const { canvas, ctx } = makeCanvas(1600, 1000);
  title(ctx, 1600, 'The electroencephalogram: recording the brain\u2019s electrical rhythms',
    'Scalp electrodes pick up the summed electrical activity of millions of neurons');

  // Left: head with electrodes
  panelBox(ctx, 70, 150, 620, 620, C.panel, C.panelBorder);
  textCentered(ctx, 'Electrodes on the scalp', 380, 190, 540, 24, '700');
  ctx.beginPath();
  ctx.ellipse(340, 430, 130, 160, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#fde68a'; ctx.fill();
  ctx.lineWidth = 4; ctx.strokeStyle = '#d97706'; ctx.stroke();
  // simple face
  ctx.beginPath(); ctx.arc(300, 400, 6, 0, Math.PI * 2); ctx.fillStyle = C.ink; ctx.fill();
  ctx.beginPath(); ctx.arc(380, 400, 6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(340, 490, 40, 0.2, Math.PI - 0.2); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
  // electrodes
  const el = [[280, 290], [400, 290], [240, 420], [440, 420], [310, 560], [380, 560]];
  for (const [ex, ey] of el) {
    ctx.beginPath(); ctx.arc(ex, ey, 9, 0, Math.PI * 2);
    ctx.fillStyle = C.accent; ctx.fill();
    ctx.strokeStyle = C.accent; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(ex, ey);
    ctx.quadraticCurveTo(ex + 60, ey - 90, 560, 240);
    ctx.stroke();
  }
  lead(ctx, 560, 240, 560, 240, C.accent);
  // amplifier + recorder
  roundRect(ctx, 520, 260, 140, 60, 10);
  ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.ink; ctx.stroke();
  textCentered(ctx, 'amplifier', 590, 290, 120, 16, '700', C.sub);
  arrow(ctx, 590, 320, 590, 380, 3, C.sub);
  roundRect(ctx, 520, 380, 140, 60, 10);
  ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.stroke();
  textCentered(ctx, 'recorder', 590, 410, 120, 16, '700', C.sub);

  // Right: three traces
  panelBox(ctx, 750, 150, 790, 620, '#ffffff', C.panelBorder);
  textCentered(ctx, 'Wave patterns by brain state', 1145, 190, 700, 24, '700');
  const tx = 800, tw = 680;
  function wave(y0, amp, freq, color, label, sublabel) {
    ctx.strokeStyle = color; ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x <= tw; x += 2) {
      const yy = y0 - Math.sin((x / tw) * Math.PI * 2 * freq) * amp;
      if (x === 0) ctx.moveTo(tx + x, yy); else ctx.lineTo(tx + x, yy);
    }
    ctx.stroke();
    textLeft(ctx, label, tx, y0 + amp + 34, 300, 20, '700', color);
    textLeft(ctx, sublabel, tx + 170, y0 + amp + 34, 480, 17, '400', C.sub);
  }
  wave(280, 18, 26, C.accent2, 'Beta \u2014 awake, alert', 'busy, low-amplitude waves (13\u201330 Hz)');
  wave(430, 30, 12, C.accent, 'Alpha \u2014 relaxed, eyes closed', 'regular rhythm (8\u201312 Hz)');
  wave(590, 46, 5, C.heart, 'Delta \u2014 deep sleep', 'slow, large-amplitude waves (< 4 Hz)');

  chip(ctx, 'Diagnoses epilepsy, monitors anaesthesia depth and confirms brain activity in intensive care', 800, 860, 1000, C.accentSoft, C.accent, 19);
  save('a23-eeg-waves.png', canvas);
}

// ---------------- Diagram 5: X-ray tube ----------------
function drawXrayTube() {
  const { canvas, ctx } = makeCanvas(1600, 1000);
  title(ctx, 1600, 'Making X-rays: electrons stopped dead in a metal target',
    'A vacuum tube accelerates electrons across a very high voltage; almost all their energy becomes heat, a little becomes X-rays');

  // tube envelope
  panelBox(ctx, 140, 170, 1180, 560, '#ffffff', C.ink, 40);
  ctx.fillStyle = C.panel;
  roundRect(ctx, 180, 210, 1100, 460, 30); ctx.fill();
  ctx.strokeStyle = C.faint; ctx.lineWidth = 2; ctx.stroke();

  // cathode
  roundRect(ctx, 240, 380, 90, 160, 10);
  ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = C.ink; ctx.stroke();
  ctx.strokeStyle = C.warn; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(250, 430); ctx.quadraticCurveTo(280, 400, 310, 430); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(250, 470); ctx.quadraticCurveTo(280, 440, 310, 470); ctx.stroke();
  lead(ctx, 215, 330, 285, 400, C.sub);
  textCentered(ctx, 'cathode: heated filament releases electrons', 250, 310, 340, 18, '600', C.sub);

  // electron beam
  arrow(ctx, 340, 460, 1020, 460, 5, C.warn);
  textCentered(ctx, 'electrons accelerated by a potential difference of about 100 kV', 680, 405, 640, 19, '700', '#b45309');

  // anode target
  ctx.save();
  ctx.translate(1080, 460);
  ctx.rotate(-0.5);
  roundRect(ctx, -18, -110, 36, 220, 8);
  ctx.fillStyle = C.sub; ctx.fill();
  ctx.restore();
  lead(ctx, 1160, 330, 1095, 405, C.sub);
  textCentered(ctx, 'rotating tungsten target (anode)', 1190, 310, 300, 18, '600', C.sub);

  // X-ray beam from focal spot down through window
  ctx.strokeStyle = C.accent2; ctx.lineWidth = 3;
  for (let i = -2; i <= 2; i++) {
    arrow(ctx, 1090, 480, 1090 + i * 30, 700, 2.5, C.accent2);
  }
  lead(ctx, 1090, 730, 1090, 700, '#0369a1');
  textCentered(ctx, 'X-rays leave through a thin window in the lead-lined housing', 900, 745, 560, 18, '600', '#0369a1');

  // heat note
  chip(ctx, '99% of the electrons\u2019 energy becomes heat \u2014 the target must rotate and be cooled', 560, 560, 540, C.warnSoft, '#92400e', 18);

  // right panel: what the image shows
  panelBox(ctx, 1360, 170, 190, 560, C.panel, C.panelBorder);
  textCentered(ctx, 'At the patient', 1455, 200, 160, 20, '700');
  roundRect(ctx, 1400, 240, 110, 60, 10);
  ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(1415, 265, 80, 26);
  textCentered(ctx, 'detector', 1455, 320, 160, 16, '600', C.sub);
  chip(ctx, 'bone absorbs X-rays \u2014 white', 1455, 400, 160, C.panel, C.sub, 16);
  chip(ctx, 'soft tissue transmits \u2014 dark', 1455, 465, 160, C.panel, C.sub, 16);
  chip(ctx, 'fractures show as dark cracks in white bone', 1455, 540, 160, C.accent2Soft, '#0369a1', 15);

  chip(ctx, 'X-rays are ionising radiation \u2014 every exposure is justified against its diagnostic benefit', 800, 880, 900, C.warnSoft, C.warn, 19);
  save('a23-xray-tube.png', canvas);
}

// ---------------- Diagram 6: imaging comparison ----------------
function drawImagingComparison() {
  const { canvas, ctx } = makeCanvas(1600, 1000);
  title(ctx, 1600, 'Choosing an imaging technique: dose against detail',
    'Every technique trades radiation exposure against the detail and function it reveals');

  const cols = [
    { name: 'Plain X-ray', tint: C.accent2Soft, ink: '#0369a1',
      rows: ['Ionising radiation \u2014 small dose', 'A single flat shadow image', 'Best for fractures and chest checks', 'Quick, cheap, widely available'] },
    { name: 'CT scan', tint: C.warnSoft, ink: '#92400e',
      rows: ['Ionising radiation \u2014 a much larger dose', 'A rotating X-ray source builds many slices, assembled by computer into 3-D', 'Tumours, bleeding, organ detail', 'Dose justified only when detail is needed'] },
    { name: 'Ultrasound', tint: C.okSoft, ink: '#166534',
      rows: ['Sound waves \u2014 no ionising radiation', 'Echoes from tissue boundaries build a live image', 'Foetal scans, heart valves, blood flow (Doppler)', 'Safe enough to use repeatedly \u2014 but blurred by bone and gas'] },
  ];
  const cw = 420, gap = 40, x0 = (1600 - 3 * cw - 2 * gap) / 2, y0 = 170, ch = 620;
  cols.forEach((c, i) => {
    const x = x0 + i * (cw + gap);
    panelBox(ctx, x, y0, cw, ch, C.panel, C.panelBorder);
    roundRect(ctx, x + cw / 2 - 150, y0 + 30, 300, 50, 25);
    ctx.fillStyle = c.tint; ctx.fill();
    textCentered(ctx, c.name, x + cw / 2, y0 + 55, 260, 23, '700', c.ink);
    let yy = y0 + 130;
    for (const r of c.rows) {
      setFont(ctx, 18, '400');
      // wrap text
      const words = r.split(' ');
      let line = '', lines = [];
      for (const wd of words) {
        if (ctx.measureText(line + wd + ' ').width > cw - 90) { lines.push(line); line = wd + ' '; }
        else line += wd + ' ';
      }
      lines.push(line);
      const lh = 26;
      ctx.fillStyle = c.tint;
      roundRect(ctx, x + 28, yy - 6, 8, lines.length * lh + 10, 4); ctx.fill();
      lines.forEach((ln, k) => textLeft(ctx, ln.trim(), x + 52, yy + k * lh + 6, cw - 90, 18, k === 0 ? '600' : '400', k === 0 ? c.ink : C.sub));
      yy += lines.length * lh + 30;
    }
  });

  chip(ctx, 'Rule of thumb: no ionising dose where ultrasound answers the question; the smallest dose that does when X-rays are needed', 800, 870, 1000, C.accentSoft, C.accent, 19);
  save('a23-imaging-comparison.png', canvas);
}

// ---------------- Diagram 7: ultrasound scan ----------------
function drawUltrasound() {
  const { canvas, ctx } = makeCanvas(1600, 1000);
  title(ctx, 1600, 'Ultrasound scanning: echoes that map the body\u2019s depths',
    'A piezoelectric crystal both sends a pulse of high-frequency sound and listens for its echo');

  // skin and tissue layers
  const sy = 330;
  ctx.fillStyle = '#fde68a';
  ctx.fillRect(240, sy, 1120, 40);
  ctx.strokeStyle = '#d97706'; ctx.lineWidth = 3;
  ctx.strokeRect(240, sy, 1120, 40);
  textLeft(ctx, 'skin', 1160, sy + 20, 120, 18, '700', '#92400e');

  ctx.fillStyle = C.accent2Soft;
  ctx.fillRect(240, sy + 40, 1120, 180);
  textLeft(ctx, 'tissue A \u2014 e.g. muscle', 1130, sy + 60, 260, 18, '600', '#0369a1');
  ctx.fillStyle = '#bae6fd';
  ctx.fillRect(240, sy + 220, 1120, 200);
  textLeft(ctx, 'tissue B \u2014 e.g. fluid or organ', 1120, sy + 245, 320, 18, '600', '#0369a1');

  // boundary line
  dashedLine(ctx, 240, sy + 220, 1360, sy + 220, C.ink, 3);

  // transducer
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.moveTo(560, sy - 120); ctx.lineTo(880, sy - 120); ctx.lineTo(800, sy - 8); ctx.lineTo(640, sy - 8);
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.stroke();
  textCentered(ctx, 'piezoelectric transducer', 720, sy - 145, 300, 20, '700', C.ink);

  // pulse down
  arrow(ctx, 700, sy + 20, 700, sy + 212, 3.5, C.warn);
  textLeft(ctx, 'sent pulse', 715, sy + 100, 140, 18, '700', '#b45309');
  // echo up
  arrow(ctx, 745, sy + 214, 745, sy + 26, 3.5, C.ok);
  textLeft(ctx, 'reflected echo', 760, sy + 130, 200, 18, '700', '#166534');

  chip(ctx, 'Depth of the boundary = (speed of sound in tissue \u00d7 echo time) \u00f7 2', 720, sy + 300, 560, C.accentSoft, C.accent, 20);

  // side note panel: fraction reflected
  panelBox(ctx, 240, sy + 360, 560, 130, C.panel, C.panelBorder);
  textCentered(ctx, 'Each boundary returns part of the pulse', 520, sy + 405, 500, 19, '700');
  textCentered(ctx, 'A bigger difference between the two tissues\u2019 acoustic properties returns a stronger echo \u2014 that is why the boundary shows as a bright line', 520, sy + 450, 500, 17, '400', C.sub);
  panelBox(ctx, 840, sy + 360, 520, 130, C.panel, C.panelBorder);
  textCentered(ctx, 'Frequency above 20 000 Hz', 1100, sy + 400, 460, 19, '700');
  textCentered(ctx, 'Medical scans use 1\u201315 MHz: higher frequency gives finer detail but reaches less depth', 1100, sy + 448, 460, 17, '400', C.sub);

  chip(ctx, 'No ionising radiation \u2014 the safest imaging for a developing foetus', 800, 900, 800, C.okSoft, '#166534', 19);
  save('a23-ultrasound-scan.png', canvas);
}

// ---------------- Diagram 8: radiation penetration ----------------
function drawRadiationPenetration() {
  const { canvas, ctx } = makeCanvas(1600, 950);
  title(ctx, 1600, 'Three radiations, three penetrations',
    'Alpha, beta and gamma radiation ionise matter differently and are stopped by different barriers');

  // source
  ctx.beginPath(); ctx.arc(180, 430, 45, 0, Math.PI * 2);
  ctx.fillStyle = C.warnSoft; ctx.fill(); ctx.lineWidth = 3.5; ctx.strokeStyle = C.warn; ctx.stroke();
  textCentered(ctx, 'source', 180, 430, 120, 19, '700', '#92400e');

  // barriers
  // paper (x=560)
  roundRect(ctx, 545, 260, 14, 340, 3);
  ctx.fillStyle = '#fef3c7'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.amber; ctx.stroke();
  textCentered(ctx, 'paper', 552, 235, 160, 19, '700', '#92400e');
  // aluminium (x=960)
  roundRect(ctx, 945, 260, 26, 340, 3);
  ctx.fillStyle = '#e2e8f0'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = C.sub; ctx.stroke();
  textCentered(ctx, 'aluminium, a few mm', 958, 235, 220, 19, '700', C.sub);
  // lead (x=1360)
  roundRect(ctx, 1345, 220, 40, 420, 3);
  ctx.fillStyle = '#64748b'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#334155'; ctx.stroke();
  textCentered(ctx, 'thick lead', 1365, 195, 200, 19, '700', '#334155');

  // alpha: stopped by paper
  arrow(ctx, 240, 330, 528, 330, 5, C.warn);
  lead(ctx, 528, 330, 560, 330, C.warn);
  ctx.save(); ctx.setLineDash([4, 6]);
  arrow(ctx, 562, 330, 590, 330, 2.5, C.faint);
  ctx.restore();
  textCentered(ctx, 'alpha \u2014 strongly ionising, stopped by paper or a few cm of air', 400, 270, 460, 18, '600', '#92400e');

  // beta: stopped by aluminium
  arrow(ctx, 240, 430, 928, 430, 5, C.accent2);
  lead(ctx, 928, 430, 946, 430, C.accent2);
  textCentered(ctx, 'beta \u2014 moderately ionising, stopped by a few mm of aluminium', 590, 370, 640, 18, '600', '#0369a1');

  // gamma: attenuated by lead
  arrow(ctx, 240, 530, 1328, 530, 5, C.accent);
  lead(ctx, 1328, 530, 1346, 530, C.accent);
  ctx.save(); ctx.setLineDash([4, 6]);
  arrow(ctx, 1390, 530, 1480, 530, 2.5, C.faint);
  ctx.restore();
  textCentered(ctx, 'gamma \u2014 weakly ionising but very penetrating; only reduced (never fully stopped) by thick lead', 800, 590, 900, 18, '600', C.accent);

  // ionising power chips
  chip(ctx, 'More ionising = more cell damage = less penetrating', 480, 700, 620, C.panel, C.sub, 19);
  chip(ctx, 'Ionisation strips electrons from atoms, damaging DNA and cells', 480, 756, 620, C.warnSoft, C.warn, 18);
  chip(ctx, 'Half-life: the time for half the unstable nuclei in a sample to decay', 1040, 700, 620, C.accentSoft, C.accent, 18);
  save('a23-radiation-penetration.png', canvas);
}

// ---------------- Diagram 9: medical tracer ----------------
function drawMedicalTracer() {
  const { canvas, ctx } = makeCanvas(1600, 1000);
  title(ctx, 1600, 'A radioactive tracer: technetium-99m in diagnosis',
    'A gamma-emitting isotope is injected, concentrates in the target organ, and a gamma camera images where it goes');

  // left panel: isotope properties
  panelBox(ctx, 70, 160, 480, 610, C.panel, C.panelBorder);
  textCentered(ctx, 'Technetium-99m', 310, 200, 400, 24, '700');
  const rows = [
    'Emits gamma radiation only \u2014 it passes out of the body to the camera',
    'Half-life of about 6 hours \u2014 active for the scan, gone within days',
    'Chemically attached to a carrier that concentrates it in the organ being studied',
    'Used for bone scans, kidney function and blood-flow studies',
  ];
  let yy = 260;
  for (const r of rows) {
    setFont(ctx, 18, '400');
    const words = r.split(' ');
    let line = '', lines = [];
    for (const wd of words) {
      if (ctx.measureText(line + wd + ' ').width > 400) { lines.push(line); line = wd + ' '; }
      else line += wd + ' ';
    }
    lines.push(line);
    ctx.fillStyle = C.accent;
    roundRect(ctx, 100, yy - 6, 8, lines.length * 25 + 8, 4); ctx.fill();
    lines.forEach((ln, k) => textLeft(ctx, ln.trim(), 122, yy + k * 25, 400, 18, '400', C.sub));
    yy += lines.length * 25 + 22;
  }
  chip(ctx, 'Iodine-131 treats overactive thyroids \u2014 beta radiation kills the overactive cells', 310, 660, 420, C.warnSoft, C.warn, 17);

  // right: body + gamma camera
  panelBox(ctx, 600, 160, 930, 610, '#ffffff', C.panelBorder);
  // camera head
  roundRect(ctx, 850, 210, 340, 80, 12);
  ctx.fillStyle = '#334155'; ctx.fill();
  textCentered(ctx, 'gamma camera head', 1020, 250, 300, 19, '700', '#ffffff');
  // body outline
  ctx.strokeStyle = C.sub; ctx.lineWidth = 4; ctx.fillStyle = '#fef9c3';
  ctx.beginPath();
  ctx.ellipse(1020, 500, 120, 190, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // organ concentration (bone scan: knee/joint spots)
  ctx.fillStyle = C.heart;
  ctx.beginPath(); ctx.arc(980, 560, 16, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(1060, 560, 16, 0, Math.PI * 2); ctx.fill();
  lead(ctx, 940, 620, 980, 568, C.heart);
  textLeft(ctx, 'tracer concentrates in the target organ', 700, 640, 340, 17, '600', C.heart);
  // gamma rays out
  for (let i = -2; i <= 2; i++) {
    arrow(ctx, 1020 + i * 38, 480, 1020 + i * 60, 300, 2.5, C.accent);
  }
  textLeft(ctx, 'gamma rays escape the body', 1180, 400, 260, 18, '600', C.accent);
  chip(ctx, 'A computer builds the image from where the gamma rays arrive \u2014 showing function, not just structure', 1065, 730, 520, C.accent2Soft, '#0369a1', 17);

  chip(ctx, 'Short half-life + gamma-only emission = a dose small enough to justify for diagnosis', 800, 880, 940, C.accentSoft, C.accent, 19);
  save('a23-medical-tracer.png', canvas);
}

// ---------------- Diagram 10: radiotherapy ----------------
function drawRadiotherapy() {
  const { canvas, ctx } = makeCanvas(1600, 1000);
  title(ctx, 1600, 'Radiotherapy: many weak paths, one strong point',
    'A rotating gamma beam enters the body from many directions, so every beam adds its dose only at the tumour');

  panelBox(ctx, 90, 150, 1050, 600, '#ffffff', C.panelBorder);
  // body
  ctx.strokeStyle = C.sub; ctx.lineWidth = 4; ctx.fillStyle = '#fef9c3';
  ctx.beginPath(); ctx.ellipse(560, 450, 190, 230, 0, 0, Math.PI * 2);
  ctx.fill(); ctx.stroke();
  // tumour
  ctx.beginPath(); ctx.arc(560, 460, 34, 0, Math.PI * 2);
  ctx.fillStyle = C.heart; ctx.fill();
  textCentered(ctx, 'tumour', 560, 460, 140, 17, '700', '#ffffff');

  // beams from around (rotating source positions)
  const angles = [-0.9, -0.45, 0, 0.45, 0.9, 2.2, 2.65, 3.1, 3.55, 4.0];
  for (const a of angles) {
    const sx = 560 + Math.cos(a) * 420;
    const syy = 450 + Math.sin(a) * 330;
    const tx = 560 + Math.cos(a + Math.PI) * 40;
    const tyy = 450 + Math.sin(a + Math.PI) * 40;
    arrow(ctx, sx, syy, tx, tyy, 3, C.accent2);
    ctx.fillStyle = '#334155';
    ctx.beginPath(); ctx.arc(sx, syy, 15, 0, Math.PI * 2); ctx.fill();
  }
  textCentered(ctx, 'the source rotates around the patient \u2014 each position aims at the same point', 560, 690, 700, 18, '600', C.sub);
  chip(ctx, 'Healthy tissue on any one path receives only a fraction of the tumour\u2019s total dose', 560, 640, 700, C.accent2Soft, '#0369a1', 18);

  // right panel: safety
  panelBox(ctx, 1190, 150, 350, 600, C.panel, C.panelBorder);
  textCentered(ctx, 'Working safely with radiation', 1365, 190, 300, 21, '700');
  const rules = [
    ['Time', 'spend as little time as possible near the source'],
    ['Distance', 'dose falls sharply with distance from the source'],
    ['Shielding', 'lead screens and lead-lined clothing absorb stray radiation'],
    ['Monitoring', 'film badges and dosimeters record every worker\u2019s accumulated dose'],
  ];
  let yy = 250;
  for (const [h, s] of rules) {
    roundRect(ctx, 1215, yy, 300, 108, 12);
    ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = C.panelBorder; ctx.stroke();
    textLeft(ctx, h, 1235, yy + 26, 260, 19, '700', C.accent);
    setFont(ctx, 16, '400');
    const words = s.split(' ');
    let line = '', lines = [];
    for (const wd of words) {
      if (ctx.measureText(line + wd + ' ').width > 260) { lines.push(line); line = wd + ' '; }
      else line += wd + ' ';
    }
    lines.push(line);
    lines.forEach((ln, k) => textLeft(ctx, ln.trim(), 1235, yy + 52 + k * 20, 260, 16, '400', C.sub));
    yy += 128;
  }

  chip(ctx, 'Every exposure is justified: the clinical benefit must outweigh the radiation risk \u2014 and doses are kept As Low As Reasonably Achievable', 800, 880, 1050, C.warnSoft, C.warn, 18);
  save('a23-radiotherapy.png', canvas);
}

drawEcg();
drawBloodPressure();
drawVitals();
drawEeg();
drawXrayTube();
drawImagingComparison();
drawUltrasound();
drawRadiationPenetration();
drawMedicalTracer();
drawRadiotherapy();

console.log(JSON.stringify(results, null, 2));
module.exports = { results };