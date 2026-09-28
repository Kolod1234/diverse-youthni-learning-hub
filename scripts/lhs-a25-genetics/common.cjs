// Shared canvas helpers for the LHS A2 5 "Genetics, Stem Cell Research and
// Cloning" diagrams. Same design language as the A2 3 / A2 4 chapters.
const fs = require('fs');
const path = require('path');
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

function chip(ctx, text, x, y, maxWidth, fill, color, size) {
  setFont(ctx, size || 19, '600');
  const tw = Math.min(ctx.measureText(text).width, maxWidth) + 34;
  roundRect(ctx, x - tw / 2, y - 18, tw, 36, 18);
  ctx.fillStyle = fill;
  ctx.fill();
  textCentered(ctx, text, x, y, maxWidth, size || 19, '600', color || C.ink);
}

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

function bracket(ctx, x1, x2, y, label, color) {
  ctx.strokeStyle = color || C.sub;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y - 8); ctx.lineTo(x1, y + 8);
  ctx.moveTo(x2, y - 8); ctx.lineTo(x2, y + 8);
  ctx.moveTo(x1, y); ctx.lineTo(x2, y);
  ctx.stroke();
  setFont(ctx, 19, '600');
  const w = ctx.measureText(label).width + 24;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect((x1 + x2) / 2 - w / 2, y - 15, w, 30);
  textCentered(ctx, label, (x1 + x2) / 2, y, 600, 19, '600', color || C.sub);
}

// A small cell symbol: rounded rect with a nucleus circle inside.
function cellSymbol(ctx, cx, cy, w, h, nucleusColor, label, labelColor) {
  ctx.fillStyle = '#f1f5f9';
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  roundRect(ctx, cx - w / 2, cy - h / 2, w, h, Math.min(w, h) / 2.4);
  ctx.fill();
  ctx.stroke();
  if (nucleusColor) {
    ctx.fillStyle = nucleusColor;
    ctx.beginPath();
    ctx.arc(cx, cy, Math.min(w, h) * 0.22, 0, Math.PI * 2);
    ctx.fill();
  }
  if (label) {
    textCentered(ctx, label, cx, cy + h / 2 + 24, 240, 19, '600', labelColor || C.sub);
  }
  return { x: cx, y: cy, w, h };
}

module.exports = {
  C, SCALE, results, OUT_DIR,
  setFont, fitFont, textCentered, textLeft, makeCanvas, title, save,
  arrow, roundRect, panelBox, chip, lead, dashedLine, bracket, cellSymbol,
};