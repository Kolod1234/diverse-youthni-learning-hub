/*
 * Shared canvas helpers + render runner for WJEC AS Sociology diagrams (Lessons 8+).
 * Visually consistent with render-unit1-l5/l6/l7.cjs (same fonts, palette, layout language).
 * Output dir: public/lesson-assets/wjec-as-sociology/.
 * Usage: const H = require('./diagram-helpers.cjs'); async run(renderers, only?).
 */
const K = require('../sas-chem/common.cjs');
const fs = require('fs');
const path = require('path');
const { text, circle, line, arrow } = K;

const W = 1448, H = 1086;
const DIR = path.resolve(process.cwd(), 'public/lesson-assets/wjec-as-sociology');
const BLUE = '#1d4ed8', RED = '#dc2626', AMBER = '#b45309', GREY = '#64748b',
      LIGHT = '#e2e8f0', SOFT = '#475569', GREEN = '#15803d', PURPLE = '#7c3aed', DARK = '#0f172a';

let _canvas = null;
function make(w, h) { const pair = K.make(w, h); _canvas = pair[0]; return pair; }

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
  circle(x, px + 52, py, 20, { fill: col || BLUE, stroke: false });
  text(x, String(num), px + 52, py + 1, { size: 22, bold: true, color: '#fff' });
  text(x, name, px + 62, py, { size: nameSize || 26, bold: true, align: 'left' });
}
// centred wrapped paragraph text inside [x0,x1]; returns next y
function wrap(x, s, x0, x1, y, o = {}) {
  const size = o.size || 21, lh = o.lh || size * 1.42;
  x.font = `${o.bold ? 'bold ' : ''}${size}px DV`;
  const maxW = x1 - x0, words = String(s).split(' ');
  let ln = '', yy = y, lines = [];
  for (const wd of words) {
    const t = ln ? ln + ' ' + wd : wd;
    if (x.measureText(t).width > maxW && ln) { lines.push(ln); ln = wd; } else ln = t;
  }
  if (ln) lines.push(ln);
  lines.forEach((L, i) => text(x, L, (x0 + x1) / 2, yy + i * lh, { size, color: o.color || SOFT, align: 'center', bold: o.bold }));
  return yy + lines.length * lh;
}
// amber callout band across the bottom of a diagram
function band(x, y0, h, head, body, o = {}) {
  box(x, 60, y0, W - 120, h, { fill: o.fill || '#fffbeb', stroke: o.stroke || '#fde68a', lw: 2 });
  text(x, head, W / 2, y0 + 28, { size: o.headSize || 20, bold: true, color: o.headColor || AMBER });
  wrap(x, body, 110, W - 110, y0 + (o.bodyY || 56), { size: o.size || 16, lh: o.lh || 22 });
}

async function run(renderers, only) {
  fs.mkdirSync(DIR, { recursive: true });
  const results = [];
  for (const r of renderers) {
    _canvas = null;
    const meta = r();
    if (only && only.length && !only.includes(meta.file)) continue;
    if (!_canvas) throw new Error('renderer produced no canvas: ' + meta.file);
    await K.save(_canvas, meta.file, DIR);
    results.push(meta.file);
  }
  return results;
}

module.exports = { make, box, title2, sub2, panelHeader, wrap, band, run,
  arrow, line, circle, text, W, H, DIR,
  BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK };