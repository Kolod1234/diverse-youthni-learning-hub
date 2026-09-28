// Diagrams 5-6: the range of human hearing; refraction of light.
const H = require('./common.cjs');
const { C } = H;

// ---------------- Diagram 5: hearing range + audiogram ----------------
function drawHearingRange() {
  const W = 1600, HH = 950;
  const { canvas, ctx } = H.makeCanvas(W, HH);
  H.title(ctx, W, 'The range of human hearing \u2014 and what happens when it narrows',
    'A young healthy ear detects about 20 Hz to 20 000 Hz; an audiogram records how far a person\u2019s hearing departs from that ideal');

  // ---- Top: frequency map ----
  const mx = 130, mw = 1340, my = 170, mh = 250;
  const pos = function (f) { return mx + (Math.log10(f) - 1) / 4 * mw; };
  H.panelBox(ctx, mx - 40, my - 40, mw + 80, mh + 130, '#ffffff', C.panelBorder);
  // bands
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(pos(10), my + 40, pos(20) - pos(10), 110);
  ctx.fillStyle = C.okSoft;
  ctx.fillRect(pos(20), my + 40, pos(20000) - pos(20), 110);
  ctx.fillStyle = C.accent2Soft;
  ctx.fillRect(pos(20000), my + 40, pos(100000) - pos(20000), 110);
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2;
  ctx.strokeRect(pos(10), my + 40, pos(100000) - pos(10), 110);
  H.textCentered(ctx, 'infrasound \u2014 earthquakes, elephants', (pos(10) + pos(20)) / 2, my + 95, pos(20) - pos(10) - 10, 15, '600', C.sub);
  H.textCentered(ctx, 'young healthy human ear \u2014 about 20 Hz to 20 kHz', (pos(20) + pos(20000)) / 2, my + 95, pos(20000) - pos(20) - 40, 22, '700', '#166534');
  H.textCentered(ctx, 'ultrasound \u2014 dogs (to ~45 kHz), bats, dolphins', (pos(20000) + pos(100000)) / 2, my + 95, pos(100000) - pos(20000) - 10, 15, '600', '#0369a1');
  // ticks
  const ticks = [[10, '10 Hz'], [20, '20'], [50, '50'], [100, '100'], [500, '500'], [1000, '1 kHz'], [5000, '5'], [10000, '10 kHz'], [20000, '20'], [50000, '50'], [100000, '100 kHz']];
  for (const [f, label] of ticks) {
    const x = pos(f);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(x, my + 150); ctx.lineTo(x, my + 162); ctx.stroke();
    H.textCentered(ctx, label, x, my + 178, 90, 15, '400', C.sub);
  }
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(pos(10), my + 150); ctx.lineTo(pos(100000), my + 150); ctx.stroke();
  H.textCentered(ctx, 'frequency (logarithmic scale)', (mx + mx + mw) / 2, my + 205, 500, 17, '600', C.sub);
  // speech band highlight
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 3;
  H.bracket(ctx, pos(300), pos(3400), my + 20, 'speech: most of what we say lives between about 300 Hz and 3.4 kHz', C.accent);

  // ---- Bottom: audiogram ----
  const gx = 180, gy = 510, gw = 700, gh = 350;
  H.panelBox(ctx, gx - 50, gy - 40, gw + 250, gh + 130, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'An audiogram: hearing level against frequency', gx + gw / 2 + 60, gy - 12, gw + 100, 20, '700', C.accent);
  // axes: 0 dB at top, 90 dB at bottom
  const db2y = function (db) { return gy + db / 90 * gh; };
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(gx, gy); ctx.lineTo(gx, gy + gh); ctx.lineTo(gx + gw, gy + gh); ctx.stroke();
  for (const db of [0, 20, 40, 60, 80]) {
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(gx, db2y(db)); ctx.lineTo(gx + gw, db2y(db)); ctx.stroke();
    H.textLeft(ctx, String(db), gx - 46, db2y(db), 36, 16, '400', C.sub);
  }
  H.textLeft(ctx, 'hearing', gx - 70, gy + gh / 2 - 30, 120, 17, '700', C.ink);
  H.textLeft(ctx, 'level (dB)', gx - 70, gy + gh / 2 - 8, 120, 17, '700', C.ink);
  const freqs = [250, 500, 1000, 2000, 4000, 8000];
  const fpos = function (f) { return gx + (Math.log10(f) - Math.log10(250)) / (Math.log10(8000) - Math.log10(250)) * gw; };
  for (const f of freqs) {
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(fpos(f), gy); ctx.lineTo(fpos(f), gy + gh); ctx.stroke();
    H.textCentered(ctx, f >= 1000 ? (f / 1000) + ' kHz' : String(f), fpos(f), gy + gh + 26, 90, 15, '400', C.sub);
  }
  H.textCentered(ctx, 'frequency', gx + gw / 2, gy + gh + 56, 300, 16, '600', C.sub);
  // curves
  const plot = function (pts, color, width) {
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.beginPath();
    pts.forEach(function (p, i) {
      const x = fpos(p[0]), y = db2y(p[1]);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  };
  plot([[250, 5], [500, 0], [1000, 0], [2000, 5], [4000, 10], [8000, 15]], C.ok, 4);
  plot([[250, 5], [500, 10], [1000, 15], [2000, 35], [4000, 55], [8000, 45]], C.warn, 4);
  plot([[250, 10], [500, 15], [1000, 25], [2000, 35], [4000, 50], [8000, 65]], C.amber, 4);
  H.textLeft(ctx, 'green: normal hearing (0\u201315 dB)', gx + 30, gy + 30, 280, 16, '700', C.ok);
  H.textLeft(ctx, 'red: noise-induced loss \u2014 the 4 kHz notch', gx + 30, gy + 56, 280, 16, '700', C.warn);
  H.textLeft(ctx, 'amber: age-related loss \u2014 high frequencies fade first', gx + 30, gy + 82, 320, 16, '700', '#b45309');
  H.textCentered(ctx, 'Hearing level 0 dB is the healthy young average, not perfect silence: the further down the curve sits, the louder a sound must be before it is heard.', gx + gw / 2 + 40, gy + gh + 100, gw + 100, 17, '400', C.sub);

  // ---- Right: subjective note ----
  const nx = 1200, nw = 330;
  H.panelBox(ctx, nx, gy - 40, nw, gh + 130, C.amberSoft, '#fcd34d');
  H.textCentered(ctx, 'Hearing is subjective', nx + nw / 2, gy - 10, nw - 40, 20, '700', '#92400e');
  const note = [
    'Two sounds of equal intensity need not seem equally loud \u2014 the ear is most sensitive between about 2 and 5 kHz, and sensitivity falls away at the extremes of the range.',
    'The decibel reading is the physical, objective measurement; loudness is what the listener experiences.',
    'Two people with the same audiogram may still describe the same sound differently \u2014 which is why hearing tests use pure tones at set frequencies rather than opinions.',
  ];
  let ny = gy + 40;
  for (const t of note) {
    const words = t.split(' ');
    let line = '';
    let lineY = ny;
    H.setFont(ctx, 16, '400');
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > nw - 56) {
        H.textLeft(ctx, line, nx + 28, lineY, nw - 56, 16, '400', '#78350f');
        line = word;
        lineY += 21;
      } else line = test;
    }
    H.textLeft(ctx, line, nx + 28, lineY, nw - 56, 16, '400', '#78350f');
    ny = lineY + 46;
  }

  H.save('a24-hearing-range.png', canvas);
}

// ---------------- Diagram 6: refraction of light ----------------
function drawRefraction() {
  const W = 1600, HH = 950;
  const { canvas, ctx } = H.makeCanvas(W, HH);
  H.title(ctx, W, 'Refraction: light bends when its speed changes',
    'Entering the slower glass it bends towards the normal; leaving, it bends away \u2014 the emergent ray is parallel to the original but sideways-shifted');

  // glass block
  const bTop = 340, bBot = 720, bL = 420, bR = 1180;
  ctx.fillStyle = '#dbeafe';
  ctx.globalAlpha = 0.85;
  ctx.fillRect(bL, bTop, bR - bL, bBot - bTop);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 3.5;
  ctx.strokeRect(bL, bTop, bR - bL, bBot - bTop);
  H.textLeft(ctx, 'glass, n = 1.5', bL + 22, bTop + 30, 220, 18, '700', '#1d4ed8');
  H.textLeft(ctx, 'air, n = 1.00', bL - 60, bTop - 40, 220, 18, '700', '#0369a1');

  // entry point and rays
  const ex0 = 700, ey0 = bTop;
  const aI = 40 * Math.PI / 180, aR = 25 * Math.PI / 180;
  const inLen = 250;
  H.arrow(ctx, ex0 - Math.sin(aI) * inLen, ey0 - Math.cos(aI) * inLen, ex0, ey0, 4, C.warn);
  const tIn = (bBot - ey0) / Math.cos(aR);
  const exX = ex0 + Math.sin(aR) * tIn, exY = bBot;
  ctx.strokeStyle = C.warn;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(ex0, ey0); ctx.lineTo(exX, exY); ctx.stroke();
  H.arrow(ctx, exX, exY, exX + Math.sin(aI) * 210, exY + Math.cos(aI) * 210, 4, C.warn);
  H.textCentered(ctx, 'incident ray', ex0 - 190, ey0 - 200, 200, 17, '700', C.warn);
  H.textCentered(ctx, 'refracted ray \u2014 bent towards the normal', exX - 60, exY - 60, 300, 17, '700', C.warn);
  H.textCentered(ctx, 'emergent ray: parallel to the original, but displaced', exX + 180, exY + 180, 330, 17, '700', '#0369a1');

  // normals
  H.dashedLine(ctx, ex0, ey0 - 230, ex0, ey0 + 200, C.sub);
  H.textLeft(ctx, 'normal', ex0 - 130, ey0 - 205, 120, 15, '600', C.sub);
  H.dashedLine(ctx, exX, exY - 180, exX, exY + 150, C.sub);

  // angle arcs
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.arc(ex0, ey0, 62, Math.PI + (Math.PI / 2 - aI), Math.PI * 1.5); ctx.stroke();
  H.textCentered(ctx, 'i', ex0 - 78, ey0 - 42, 60, 19, '700', C.accent);
  ctx.beginPath(); ctx.arc(ex0, ey0, 62, Math.PI / 2 - aR, Math.PI / 2); ctx.stroke();
  H.textCentered(ctx, 'r', ex0 + 34, ey0 + 44, 60, 19, '700', C.accent);

  // info panel
  const px = 1230, pw = 330, py2 = 170, ph2 = 620;
  H.panelBox(ctx, px, py2, pw, ph2, C.panel, C.panelBorder);
  H.textCentered(ctx, 'The refraction formula', px + pw / 2, py2 + 34, pw - 40, 21, '700', C.accent);
  H.chip(ctx, 'n = sin i \u00f7 sin r', px + pw / 2, py2 + 92, pw - 100, C.accentSoft, C.accent, 22);
  H.textCentered(ctx, 'n is the refractive index \u2014 a number for how much the medium slows light', px + pw / 2, py2 + 150, pw - 50, 17, '400', C.sub);
  const rows = [
    ['n = 1.00', 'vacuum / air'],
    ['n = 1.33', 'water'],
    ['n = 1.5', 'glass'],
  ];
  let ry = py2 + 205;
  for (const [a, b] of rows) {
    H.textLeft(ctx, a, px + 40, ry, 100, 19, '700', C.ink);
    H.textLeft(ctx, b, px + 150, ry, 150, 18, '400', C.sub);
    ry += 38;
  }
  H.textCentered(ctx, 'Worked example', px + pw / 2, ry + 30, pw - 60, 19, '700', C.ink);
  const steps = [
    'A ray meets glass at i = 45\u00b0.',
    'n = sin i \u00f7 sin r rearranges to sin r = sin 45\u00b0 \u00f7 1.5.',
    'sin 45\u00b0 = 0.71, so sin r = 0.71 \u00f7 1.5 = 0.47.',
    'r = 28\u00b0 \u2014 towards the normal, as expected entering the slower medium.',
  ];
  let sy = ry + 66;
  for (const s of steps) {
    const words = s.split(' ');
    let line = '';
    H.setFont(ctx, 16, '400');
    let lineY = sy;
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > pw - 80) {
        H.textLeft(ctx, line, px + 34, lineY, pw - 80, 16, '400', C.ink);
        line = word;
        lineY += 21;
      } else line = test;
    }
    H.textLeft(ctx, line, px + 34, lineY, pw - 80, 16, '400', C.ink);
    sy = lineY + 34;
  }

  H.chip(ctx, 'White light is a mixture: each colour slows by a slightly different amount, so a prism splits white light into a spectrum \u2014 dispersion', W / 2, HH - 60, 1150, C.accent2Soft, '#0369a1');
  H.textCentered(ctx, 'Speed check: light travels 300 000 km/s in a vacuum but only about 200 000 km/s in glass \u2014 the bending is the visible record of that slowing.', W / 2, HH - 22, 1300, 17, '400', C.sub);

  H.save('a24-refraction.png', canvas);
}

module.exports = { drawHearingRange, drawRefraction };