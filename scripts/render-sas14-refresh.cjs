#!/usr/bin/env node
/*
 * Regenerates the two accuracy-critical diagrams for Single Award Science
 * lesson 1.4 (Co-ordination and Control) as high-resolution plotted PNGs:
 *
 *   1. Structure of the eye — horizontal cross-section, British-English role
 *      labels, parallel light rays shown refracting and focusing on the retina.
 *   2. Blood glucose control — negative-feedback loop with insulin (teal) and
 *      glucagon (coral) pathways, pancreas detection, glycogen storage/release.
 *
 * Drafts are written to public/lesson-assets/sas-biology/draft/ for visual
 * review. Only after approval are they copied over the live lesson assets
 * (sas-coord-eye-structure.png / sas-coord-blood-glucose.png).
 */
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const DRAFT_DIR = path.join(__dirname, '..', 'public', 'lesson-assets', 'sas-biology', 'draft');
fs.mkdirSync(DRAFT_DIR, { recursive: true });

const INK = '#1e293b';
const GREY = '#475569';
const LEADER = '#64748b';
const TEAL = '#0f766e';
const CORAL = '#be123c';

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
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.fillStyle = LEADER;
  ctx.beginPath();
  ctx.arc(x2, y2, 6, 0, Math.PI * 2);
  ctx.fill();
}

/* ------------------------------------------------------------------ */
/* 1. Structure of the eye                                            */
/* ------------------------------------------------------------------ */
function renderEye() {
  const W = 2400, H = 1700;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  const CX = 1450, CY = 880, RX = 760, RY = 520;

  // Sclera (eyeball outer coat)
  ctx.beginPath();
  ctx.ellipse(CX, CY, RX, RY, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#475569';
  ctx.stroke();

  // Retina (light-sensitive layer along the back)
  ctx.beginPath();
  ctx.ellipse(CX, CY, RX - 55, RY - 55, 0, -1.15, 1.15);
  ctx.lineWidth = 34;
  ctx.strokeStyle = '#f59e0b';
  ctx.stroke();

  // Cornea (front bulge)
  ctx.beginPath();
  ctx.moveTo(CX - RX + 40, CY - 330);
  ctx.bezierCurveTo(CX - RX - 130, CY, CX - RX - 130, CY, CX - RX + 40, CY + 330);
  ctx.bezierCurveTo(CX - RX - 10, CY + 150, CX - RX - 10, CY - 150, CX - RX + 40, CY - 330);
  ctx.closePath();
  ctx.fillStyle = 'rgba(186, 230, 253, 0.55)';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#475569';
  ctx.stroke();

  // Pupil (central gap)
  ctx.beginPath();
  ctx.arc(890, 880, 80, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();

  // Iris (two muscular segments either side of the pupil)
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#155e75';
  ctx.lineWidth = 85;
  ctx.beginPath();
  ctx.arc(890, 880, 150, rad(188), rad(232));
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(890, 880, 150, rad(128), rad(172));
  ctx.stroke();

  // Suspensory ligaments (lens to ciliary body)
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 4;
  for (const [x1, y1, x2, y2] of [
    [1150, 760, 1174, 652],
    [1150, 1000, 1174, 1108],
  ]) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Ciliary muscle (top and bottom)
  for (const y of [610, 1150]) {
    ctx.beginPath();
    ctx.ellipse(1180, y, 58, 42, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fb7185';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#e11d48';
    ctx.stroke();
  }

  // Lens
  ctx.beginPath();
  ctx.ellipse(1100, 880, 105, 190, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(191, 219, 254, 0.85)';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#3b82f6';
  ctx.stroke();

  // Optic nerve
  roundRect(ctx, 2085, 985, 260, 115, 20);
  ctx.fillStyle = '#f1f5f9';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#475569';
  ctx.stroke();

  // Light rays from a distant object, refracted at the lens, focused on the retina
  const RAY = '#ea580c';
  ctx.strokeStyle = RAY;
  ctx.lineWidth = 4;
  ctx.setLineDash([]);
  for (const [sy, ey] of [[700, 830], [880, 880], [1060, 930]]) {
    ctx.beginPath();
    ctx.moveTo(250, sy);
    ctx.lineTo(1040, ey);
    ctx.stroke();
  }
  arrow(ctx, 1040, 830, 2100, 878, RAY, 4, 16);
  arrow(ctx, 1040, 880, 2100, 880, RAY, 4, 16);
  arrow(ctx, 1040, 930, 2100, 882, RAY, 4, 16);
  ctx.fillStyle = RAY;
  ctx.beginPath();
  ctx.arc(2155, 880, 8, 0, Math.PI * 2);
  ctx.fill();

  // Small note by the incoming rays
  ctx.font = 'italic 26px Helvetica, Arial, sans-serif';
  ctx.fillStyle = GREY;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Light from an object', 280, 612);

  // Top labels
  const topLabels = [
    { cx: 320, name: 'Cornea', role: 'refracts (bends) light entering the eye', target: [690, 590] },
    { cx: 810, name: 'Iris', role: 'muscles change the size of the pupil', target: [768, 790] },
    { cx: 1210, name: 'Ciliary muscle', role: 'changes the shape of the lens', target: [1185, 585] },
    { cx: 1620, name: 'Sclera', role: 'tough outer coat protects the eye', target: [1538, 362] },
    { cx: 2110, name: 'Optic nerve', role: 'carries impulses to the brain', target: [2240, 1000] },
  ];
  for (const L of topLabels) {
    const bottom = drawBlock(ctx, L.name, L.cx, 150, 320, 'bold 38px Helvetica, Arial, sans-serif', INK, 44);
    const roleBottom = drawBlock(ctx, L.role, L.cx, bottom + 52, 320, '30px Helvetica, Arial, sans-serif', GREY, 36);
    leader(ctx, L.cx, roleBottom + 14, L.target[0], L.target[1]);
  }

  // Bottom labels
  const bottomLabels = [
    { cx: 300, name: 'Pupil', role: 'the gap that lets light into the eye', target: [835, 938] },
    { cx: 900, name: 'Lens', role: 'focuses light onto the retina', target: [1140, 1045] },
    { cx: 1330, name: 'Suspensory ligament', role: 'holds the lens in place', target: [1190, 1160] },
    { cx: 1760, name: 'Retina', role: 'light-sensitive cells detect the image', target: [1930, 1235] },
  ];
  for (const L of bottomLabels) {
    const bottom = drawBlock(ctx, L.name, L.cx, 1460, 320, 'bold 38px Helvetica, Arial, sans-serif', INK, 44);
    drawBlock(ctx, L.role, L.cx, bottom + 52, 320, '30px Helvetica, Arial, sans-serif', GREY, 36);
    leader(ctx, L.cx, 1448, L.target[0], L.target[1]);
  }

  return { canvas: c, file: 'sas-coord-eye-structure-v2.png' };
}

/* ------------------------------------------------------------------ */
/* 2. Blood glucose control by negative feedback                       */
/* ------------------------------------------------------------------ */
function drawPancreasIcon(ctx, cx, cy, color) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(0.62, 0.62);
  ctx.beginPath();
  ctx.moveTo(-46, -20);
  ctx.bezierCurveTo(-30, -34, 6, -34, 26, -18);
  ctx.bezierCurveTo(44, -4, 44, 22, 24, 30);
  ctx.bezierCurveTo(2, 38, -28, 30, -42, 12);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.restore();
}

function flowBox(ctx, cx, cy, w, h, text, fill, stroke, withPancreas, pancreasColor) {
  roundRect(ctx, cx - w / 2, cy - h / 2, w, h, 24);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = stroke;
  ctx.stroke();
  ctx.font = '32px Helvetica, Arial, sans-serif';
  const lines = wrapText(ctx, text, w - 70);
  const lineH = 42;
  const total = lines.length * lineH;
  const iconH = withPancreas ? 66 : 0;
  const startY = cy - (total + iconH) / 2 + (withPancreas ? iconH : 0);
  if (withPancreas) drawPancreasIcon(ctx, cx, cy - (total + iconH) / 2 + 28, pancreasColor);
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  let y = startY;
  for (const l of lines) { ctx.fillText(l, cx, y); y += lineH; }
}

function renderGlucose() {
  const W = 2400, H = 1500;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Title
  ctx.font = 'bold 46px Helvetica, Arial, sans-serif';
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Blood glucose is controlled by negative feedback', 1200, 64);

  const BW = 560, BH = 200;
  const topY = 315, botY = 1245;
  const xs = [480, 1200, 1920];

  // Boxes — insulin (rise) loop
  flowBox(ctx, xs[0], topY, BW, BH, 'Blood glucose rises after a meal', '#ffffff', '#94a3b8');
  flowBox(ctx, xs[1], topY, BW, BH, 'Pancreas releases the hormone insulin', '#f0fdfa', TEAL, true, TEAL);
  flowBox(ctx, xs[2], topY, BW, BH, 'Liver and muscles store excess glucose as glycogen', '#f0fdfa', TEAL);

  // Boxes — glucagon (fall) loop
  flowBox(ctx, xs[0], botY, BW, BH, 'Blood glucose falls between meals or during exercise', '#ffffff', '#94a3b8');
  flowBox(ctx, xs[1], botY, BW, BH, 'Pancreas releases the hormone glucagon', '#fef2f2', CORAL, true, CORAL);
  flowBox(ctx, xs[2], botY, BW, BH, 'Liver converts glycogen back into glucose and releases it into the blood', '#fef2f2', CORAL);

  // Central set-point pill
  roundRect(ctx, 980, 685, 440, 140, 70);
  ctx.fillStyle = '#fefce8';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#ca8a04';
  ctx.stroke();
  ctx.font = 'bold 34px Helvetica, Arial, sans-serif';
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('NORMAL BLOOD', 1200, 718);
  ctx.fillText('GLUCOSE LEVEL', 1200, 762);

  const FLOW = '#475569';
  // Insulin loop (clockwise)
  arrow(ctx, 985, 715, 640, 428, FLOW);   // normal level -> rise box
  arrow(ctx, 760, topY, 920, topY, FLOW);
  arrow(ctx, 1480, topY, 1640, topY, FLOW);
  arrow(ctx, 1700, 420, 1430, 672, FLOW);  // storage -> normal level
  // Glucagon loop (anticlockwise mirror)
  arrow(ctx, 985, 795, 640, 1128, FLOW);  // normal level -> fall box
  arrow(ctx, 760, botY, 920, botY, FLOW);
  arrow(ctx, 1480, botY, 1640, botY, FLOW);
  arrow(ctx, 1700, 1140, 1430, 838, FLOW); // release -> normal level

  // Return annotations
  ctx.font = 'italic 26px Helvetica, Arial, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = TEAL;
  ctx.fillText('glucose level falls back to normal', 1560, 528);
  ctx.fillStyle = CORAL;
  ctx.fillText('glucose level rises back to normal', 1560, 985);

  return { canvas: c, file: 'sas-coord-blood-glucose-v2.png' };
}

/* ------------------------------------------------------------------ */
function checkEdges(canvas) {
  // Confirms nothing is painted on the outer 2px frame (no clipped content).
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

const results = [];
for (const render of [renderEye, renderGlucose]) {
  const { canvas, file } = render();
  const bad = checkEdges(canvas);
  const out = path.join(DRAFT_DIR, file);
  fs.writeFileSync(out, canvas.toBuffer('image/png'));
  results.push({
    file,
    width: canvas.width,
    height: canvas.height,
    kb: Math.round(fs.statSync(out).size / 1024),
    edgeViolations: bad,
  });
}
console.log(JSON.stringify(results, null, 2));
module.exports = { results };