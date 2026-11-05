/*
 * Shared canvas helpers + render runner for WJEC A2 Psychology diagrams.
 * Uses @napi-rs/canvas directly so it works reliably in the sandbox.
 * Output dir: public/lesson-assets/wjec-a2-psychology/.
 * Usage: const H = require('./diagram-helpers.cjs'); async run(renderers, only?).
 */
const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
const fs = require('fs');
const path = require('path');

try {
  GlobalFonts.registerFromPath('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 'DV');
  GlobalFonts.registerFromPath('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 'DV');
} catch (_) {}

const W = 1448, H = 1086;
const DIR = path.resolve(process.cwd(), 'public/lesson-assets/wjec-a2-psychology');
const BLUE = '#1d4ed8', RED = '#dc2626', AMBER = '#b45309', GREY = '#64748b',
      LIGHT = '#e2e8f0', SOFT = '#475569', GREEN = '#15803d', PURPLE = '#7c3aed', DARK = '#0f172a', TEAL = '#0f766e';

let _canvas = null;
function make(w, h) {
  const c = createCanvas(w, h);
  const x = c.getContext('2d');
  x.fillStyle = '#ffffff';
  x.fillRect(0, 0, w, h);
  x.lineCap = 'round';
  x.lineJoin = 'round';
  _canvas = c;
  return [c, x];
}

function text(x, s, px, py, o = {}) {
  x.save();
  x.font = `${o.bold ? 'bold ' : ''}${o.size || 26}px DV, DejaVu Sans, Arial, sans-serif`;
  x.fillStyle = o.color || DARK;
  x.textAlign = o.align || 'center';
  x.textBaseline = o.base || 'middle';
  x.fillText(String(s), px, py);
  x.restore();
}

function circle(x, cx, cy, r, o = {}) {
  x.beginPath();
  x.arc(cx, cy, r, 0, Math.PI * 2);
  if (o.fill) { x.fillStyle = o.fill; x.fill(); }
  if (o.stroke !== false) {
    x.strokeStyle = o.stroke || GREY;
    x.lineWidth = o.lw || 3;
    if (o.dash) x.setLineDash(o.dash);
    x.stroke();
    x.setLineDash([]);
  }
}

function line(x, x1, y1, x2, y2, o = {}) {
  x.beginPath();
  x.moveTo(x1, y1);
  x.lineTo(x2, y2);
  x.strokeStyle = o.color || DARK;
  x.lineWidth = o.lw || 3;
  if (o.dash) x.setLineDash(o.dash);
  x.stroke();
  x.setLineDash([]);
}

function arrowHead(x, x1, y1, x2, y2, o = {}) {
  const a = Math.atan2(y2 - y1, x2 - x1), L = o.len || 18;
  x.beginPath();
  x.moveTo(x2, y2);
  x.lineTo(x2 - L * Math.cos(a - 0.4), y2 - L * Math.sin(a - 0.4));
  x.lineTo(x2 - L * Math.cos(a + 0.4), y2 - L * Math.sin(a + 0.4));
  x.closePath();
  x.fillStyle = o.color || DARK;
  x.fill();
}

function arrow(x, x1, y1, x2, y2, o = {}) {
  line(x, x1, y1, x2, y2, o);
  arrowHead(x, x1, y1, x2, y2, o);
}

function box(x, tx, ty, w, h, o = {}) {
  x.fillStyle = o.fill || '#f8fafc';
  x.fillRect(tx, ty, w, h);
  x.strokeStyle = o.stroke || LIGHT;
  x.lineWidth = o.lw || 2;
  x.strokeRect(tx, ty, w, h);
}

function title2(x, s) { text(x, s, W / 2, 46, { size: 32, bold: true }); }
function sub2(x, s) { text(x, s, W / 2, 88, { size: 20, color: GREY }); }

function panelHeader(x, px, py, num, name, col, nameSize) {
  circle(x, px + 32, py, 20, { fill: col || BLUE, stroke: false });
  text(x, String(num), px + 32, py + 1, { size: 21, bold: true, color: '#fff' });
  text(x, name, px + 64, py, { size: nameSize || 22, bold: true, align: 'left' });
}

function wrap(x, s, x0, x1, y, o = {}) {
  const size = o.size || 20, lh = o.lh || size * 1.42;
  x.font = `${o.bold ? 'bold ' : ''}${size}px DV, DejaVu Sans, Arial, sans-serif`;
  const maxW = x1 - x0, words = String(s).split(' ');
  let ln = '', yy = y, lines = [];
  for (const wd of words) {
    const t = ln ? ln + ' ' + wd : wd;
    if (x.measureText(t).width > maxW && ln) { lines.push(ln); ln = wd; } else ln = t;
  }
  if (ln) lines.push(ln);
  lines.forEach((L, i) => text(x, L, o.align === 'left' ? x0 : (x0 + x1) / 2, yy + i * lh, { size, color: o.color || SOFT, align: o.align || 'center', bold: o.bold }));
  return yy + lines.length * lh;
}

function band(x, y0, h, head, body, o = {}) {
  box(x, 60, y0, W - 120, h, { fill: o.fill || '#fffbeb', stroke: o.stroke || '#fde68a', lw: 2 });
  text(x, head, W / 2, y0 + 28, { size: o.headSize || 20, bold: true, color: o.headColor || AMBER });
  wrap(x, body, 110, W - 110, y0 + (o.bodyY || 58), { size: o.size || 16, lh: o.lh || 22 });
}

async function run(renderers, only) {
  fs.mkdirSync(DIR, { recursive: true });
  const results = [];
  for (const r of renderers) {
    _canvas = null;
    const meta = r();
    if (only && only.length && !only.includes(meta.file)) continue;
    if (!_canvas) throw new Error('renderer produced no canvas: ' + meta.file);
    fs.writeFileSync(path.join(DIR, meta.file), _canvas.toBuffer('image/png'));
    results.push(meta.file);
  }
  return results;
}

module.exports = { make, box, title2, sub2, panelHeader, wrap, band, run,
  arrow, line, circle, text, W, H, DIR,
  BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK, TEAL };