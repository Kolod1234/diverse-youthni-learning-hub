// Shared canvas helpers for the LHS A2 9 "Analytical Chemistry Techniques" diagrams.
// Same design language as the AS 2-6 / A2 1-8 chapters.
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
  pink: '#db2777',
  pinkSoft: '#fce7f3',
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

function wrapText(ctx, text, maxWidth) {
  const words = String(text).split(' ');
  const lines = [];
  let line = '';
  for (const wd of words) {
    const test = line ? line + ' ' + wd : wd;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = wd;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function paragraph(ctx, text, x, y, maxWidth, lineHeight, size, weight, color, align) {
  setFont(ctx, size, weight || '400');
  ctx.fillStyle = color || C.ink;
  ctx.textAlign = align || 'left';
  ctx.textBaseline = 'middle';
  const lines = wrapText(ctx, text, maxWidth);
  lines.forEach((ln, i) => ctx.fillText(ln, x, y + i * lineHeight));
  return y + lines.length * lineHeight;
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

// A test tube used across the qualitative-test diagrams.
function tube(ctx, x, y, opts) {
  // x = centre, y = top of tube; tube is 34 wide, 110 tall.
  const w = 34, h = 110;
  roundRect(ctx, x - w / 2, y, w, h, 15);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = C.sub;
  ctx.stroke();
  if (opts.liquid) {
    roundRect(ctx, x - w / 2 + 2, y + (opts.liquidTop || 30), w - 4, h - (opts.liquidTop || 30) - 2, 13);
    ctx.fillStyle = opts.liquid;
    ctx.fill();
  }
  if (opts.ppt) {
    roundRect(ctx, x - w / 2 + 2, y + h - 34, w - 4, 32, 13);
    ctx.fillStyle = opts.ppt;
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(31,41,55,0.35)';
    ctx.stroke();
  }
  if (opts.bubbles) {
    ctx.fillStyle = 'rgba(255,255,255,0.95)';
    ctx.strokeStyle = 'rgba(31,41,55,0.4)';
    ctx.lineWidth = 1.5;
    [[ -6, 22, 5], [5, 40, 7], [-3, 62, 6], [7, 80, 4], [-8, 90, 3.5]].forEach(([dx, dy, r]) => {
      ctx.beginPath();
      ctx.arc(x + dx, y + dy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });
  }
}

// A smooth chromatogram/spectrum peak drawn as a filled shape on a baseline.
function peak(ctx, cx, baseY, height, width, fill, stroke) {
  ctx.beginPath();
  ctx.moveTo(cx - width, baseY);
  ctx.quadraticCurveTo(cx - width * 0.35, baseY, cx - width * 0.25, baseY - height);
  ctx.quadraticCurveTo(cx, baseY - height * 1.6, cx + width * 0.25, baseY - height);
  ctx.quadraticCurveTo(cx + width * 0.35, baseY, cx + width, baseY);
  ctx.closePath();
  ctx.fillStyle = fill || C.accentSoft;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = stroke || C.accent;
  ctx.stroke();
}

module.exports = {
  C, SCALE, results, OUT_DIR,
  setFont, fitFont, textCentered, textLeft, wrapText, paragraph,
  makeCanvas, title, save,
  arrow, roundRect, panelBox, chip, lead, dashedLine, tube, peak,
};