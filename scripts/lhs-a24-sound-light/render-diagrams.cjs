// Renders the ten custom diagrams for the LHS A2 4 "Sound and Light"
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

// A horizontal dimension bracket with a centred label.
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

// Draw a small eye symbol used by several diagrams: a circle eyeball with
// lens at the front and the retina at the back. Returns the retina x.
function eyeSymbol(ctx, cx, cy, r, lensX, retinaColor) {
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // vitreous tint
  ctx.fillStyle = '#eff6ff';
  ctx.beginPath();
  ctx.arc(cx, cy, r - 4, 0, Math.PI * 2);
  ctx.fill();
  // retina: inner arc on the right
  ctx.strokeStyle = retinaColor || '#dc2626';
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.arc(cx, cy, r - 14, -0.9, 0.9);
  ctx.stroke();
  // lens
  ctx.fillStyle = '#fef9c3';
  ctx.strokeStyle = '#a16207';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.ellipse(lensX, cy, 16, 52, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  return cx + r;
}

// ---------------- Diagram 1: sound as a longitudinal wave ----------------
function drawSoundWave() {
  const W = 1600, H = 950;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Sound: a longitudinal wave',
    'A vibrating source makes air particles oscillate back and forth \u2014 energy travels along, the air itself does not');

  // ---- Panel A: the particle picture (longitudinal) ----
  const ax = 90, ay = 150, aw = 1420, ah = 470;
  panelBox(ctx, ax, ay, aw, ah, '#ffffff', C.panelBorder);
  textCentered(ctx, 'Longitudinal wave: particles oscillate parallel to the direction of travel', ax + aw / 2, ay + 26, aw - 40, 21, '700', C.accent);

  // speaker
  ctx.fillStyle = C.accent;
  roundRect(ctx, 128, 330, 60, 90, 10); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(188, 342); ctx.lineTo(188, 408); ctx.lineTo(252, 452); ctx.lineTo(252, 298); ctx.closePath();
  ctx.fill();
  setFont(ctx, 17, '600');
  ctx.fillStyle = C.accent;
  ctx.textAlign = 'center';
  ctx.fillText('vibrating', 158, 442);
  ctx.fillText('speaker cone', 158, 462);

  // dot field: longitudinal displacement of columns
  const x0 = 300, x1 = 1370, y0 = 220, y1 = 570;
  const rows = 14, lam = 160, amp = 20;
  ctx.fillStyle = '#334155';
  for (let bx = x0; bx <= x1; bx += 25) {
    const dx = amp * Math.sin(2 * Math.PI * (bx - x0) / lam);
    for (let r = 0; r < rows; r++) {
      const py = y0 + (y1 - y0) * r / (rows - 1);
      ctx.beginPath();
      ctx.arc(bx + dx, py, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // compressions at u = 240, 400 (x = 540, 700); rarefaction midway at 620
  bracket(ctx, 540, 700, 600, 'one wavelength \u03BB', C.sub);
  lead(ctx, 460, 690, 540, 500, C.warn);
  textCentered(ctx, 'compression', 460, 716, 220, 20, '700', C.warn);
  textCentered(ctx, 'particles crowded, pressure high', 460, 741, 230, 16, '400', C.sub);
  lead(ctx, 900, 690, 660, 500, C.accent2);
  textCentered(ctx, 'rarefaction', 900, 716, 220, 20, '700', C.accent2);
  textCentered(ctx, 'particles spread out, pressure low', 900, 741, 230, 16, '400', C.sub);

  // direction of travel
  dashedLine(ctx, 620, 190, 1000, 190, C.accent, 3);
  arrow(ctx, 1000, 190, 1060, 190, 3, C.accent);
  textLeft(ctx, 'the wave (energy) travels this way', 640, 168, 440, 18, '600', C.accent);

  // oscillation marker
  arrow(ctx, 1150, 380, 1205, 380, 3, C.ok);
  arrow(ctx, 1235, 380, 1180, 380, 3, C.ok);
  textLeft(ctx, 'each particle just oscillates to and fro about a fixed point', 1100, 345, 330, 17, '600', C.ok);

  // ---- Panel B: transverse comparison ----
  const by = 660;
  panelBox(ctx, ax, by, aw, 240, '#ffffff', C.panelBorder);
  textCentered(ctx, 'For comparison: a transverse wave (light, water ripples)', ax + aw / 2, by + 26, aw - 40, 21, '700', C.ok);
  const base = by + 135, amp2 = 70, lam2 = 300, sx = 150, ex = 1450;
  ctx.strokeStyle = C.faint;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(sx, base); ctx.lineTo(ex, base); ctx.stroke();
  ctx.strokeStyle = C.ok;
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let x = sx; x <= ex; x += 4) {
    const y = base - amp2 * Math.sin(2 * Math.PI * (x - sx) / lam2);
    if (x === sx) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  // amplitude bracket
  const crest = sx + lam2 / 4;
  arrow(ctx, crest + 110, base, crest + 110, base - amp2, 2.5, C.sub);
  arrow(ctx, crest + 110, base - amp2, crest + 110, base, 2.5, C.sub);
  textLeft(ctx, 'amplitude', crest + 125, base - 35, 160, 18, '600', C.sub);
  // wavelength bracket between successive crests
  bracket(ctx, crest, crest + lam2, base - amp2 - 26, 'one wavelength \u03BB', C.sub);
  // direction of travel
  dashedLine(ctx, 1230, by + 200, 1380, by + 200, C.ok, 3);
  arrow(ctx, 1380, by + 200, 1430, by + 200, 3, C.ok);
  textLeft(ctx, 'wave travels', 1220, by + 177, 200, 17, '600', C.ok);

  chip(ctx, 'Sound needs a medium \u2014 with no particles to squeeze and stretch, a vacuum is silent', W / 2, H - 22, 940, C.amberSoft, '#92400e');
  save('a24-sound-wave.png', canvas);
}

// ---------------- Diagram 2: reflection, refraction, diffraction ----------------
function drawWaveBehaviour() {
  const W = 1600, H = 950;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'What sound waves do at obstacles and boundaries',
    'Three behaviours the examination keeps returning to: reflection, refraction and diffraction');

  const pw = 460, ph = 620, py = 150, gap = 45;
  const pxs = [70, 70 + pw + gap, 70 + 2 * (pw + gap)];

  // ---- Panel 1: reflection ----
  panelBox(ctx, pxs[0], py, pw, ph, '#ffffff', C.panelBorder);
  textCentered(ctx, 'Reflection \u2014 the echo', pxs[0] + pw / 2, py + 30, pw - 30, 21, '700', C.accent);
  const wx = pxs[0] + pw - 78;
  ctx.fillStyle = C.sub;
  roundRect(ctx, wx, py + 70, 40, 350, 6); ctx.fill();
  ctx.save();
  ctx.translate(wx + 68, py + 245);
  ctx.rotate(-Math.PI / 2);
  setFont(ctx, 17, '600');
  ctx.fillStyle = C.sub;
  ctx.textAlign = 'center';
  ctx.fillText('large flat wall', 0, 0);
  ctx.restore();
  // person
  const ppx = pxs[0] + 120, ppy = py + 400;
  ctx.fillStyle = C.ink;
  ctx.beginPath(); ctx.arc(ppx, ppy - 60, 15, 0, Math.PI * 2); ctx.fill();
  roundRect(ctx, ppx - 22, ppy - 40, 44, 80, 12); ctx.fill();
  // sound out and back
  arrow(ctx, ppx + 14, ppy - 55, wx + 10, py + 160, 3.5, C.accent);
  arrow(ctx, wx + 10, py + 195, ppx + 24, ppy - 30, 3.5, C.warn);
  textLeft(ctx, 'sound out', pxs[0] + 170, py + 160, 140, 17, '700', C.accent);
  textLeft(ctx, 'echo back', pxs[0] + 170, py + 205, 140, 17, '700', C.warn);
  textCentered(ctx, 'Angle of incidence = angle of reflection', pxs[0] + pw / 2, py + 505, pw - 30, 18, '600', C.sub);
  textCentered(ctx, 'Sonar and echo-sounding measure the time a', pxs[0] + pw / 2, py + 545, pw - 30, 16, '400', C.sub);
  textCentered(ctx, 'reflected pulse takes to come back', pxs[0] + pw / 2, py + 568, pw - 30, 16, '400', C.sub);

  // ---- Panel 2: refraction ----
  panelBox(ctx, pxs[1], py, pw, ph, '#ffffff', C.panelBorder);
  textCentered(ctx, 'Refraction \u2014 bending at a boundary', pxs[1] + pw / 2, py + 30, pw - 30, 21, '700', C.accent);
  const bnd = py + 310;
  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(pxs[1] + 8, py + 58, pw - 16, bnd - py - 58);
  ctx.fillStyle = '#0b6ea9';
  ctx.fillRect(pxs[1] + 8, bnd, pw - 16, ph - 200);
  textLeft(ctx, 'air \u2014 sound 340 m/s', pxs[1] + 20, py + 84, 240, 17, '700', '#0369a1');
  textLeft(ctx, 'water \u2014 sound about 1500 m/s', pxs[1] + 20, bnd + 28, 300, 17, '700', '#ffffff');
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(pxs[1] + 8, bnd); ctx.lineTo(pxs[1] + pw - 8, bnd); ctx.stroke();
  dashedLine(ctx, pxs[1] + pw / 2, py + 66, pxs[1] + pw / 2, py + ph - 70, C.sub);
  textLeft(ctx, 'normal', pxs[1] + pw / 2 + 8, py + 78, 110, 15, '600', C.sub);
  const nxs = pxs[1] + pw / 2;
  arrow(ctx, nxs - 150, py + 70, nxs, bnd, 3.5, C.warn);
  arrow(ctx, nxs, bnd, nxs + 170, bnd + 78, 3.5, C.warn);
  chip(ctx, 'bends AWAY from the normal', pxs[1] + pw / 2, bnd + 130, pw - 60, C.amberSoft, '#92400e', 17);
  textCentered(ctx, 'Entering the faster medium the wavefronts stretch and the ray bends away from the normal; entering a slower medium it bends towards it.', pxs[1] + pw / 2, py + ph - 48, pw - 40, 16, '400', C.sub);

  // ---- Panel 3: diffraction ----
  panelBox(ctx, pxs[2], py, pw, ph, '#ffffff', C.panelBorder);
  textCentered(ctx, 'Diffraction \u2014 spreading through gaps', pxs[2] + pw / 2, py + 30, pw - 30, 21, '700', C.accent);
  const gyc = py + 250, gx = pxs[2] + pw / 2;
  // wall with a gap
  ctx.fillStyle = C.sub;
  ctx.fillRect(px s ? 0 : 0, 0, 0, 0);
  save('a24-wave-behaviour.png', canvas);
}