// Diagrams 3-4: the decibel scale; the structure of the ear.
const H = require('./common.cjs');
const { C } = H;

// ---------------- Diagram 3: the decibel scale ----------------
function drawDecibelScale() {
  const W = 1600, HH = 950;
  const { canvas, ctx } = H.makeCanvas(W, HH);
  H.title(ctx, W, 'The decibel scale: measuring sound intensity',
    'Objective, physical and logarithmic \u2014 every 10 dB is a tenfold change in the raw intensity of the wave');

  // ---- Left: the ladder ----
  const bx = 150, bw = 130, top = 180, bot = 850;
  const dB2y = function (db) { return bot - (bot - top) * db / 130; };
  // coloured bands
  const bands = [
    [0, 60, '#22c55e'],
    [60, 85, '#f59e0b'],
    [85, 100, '#f97316'],
    [100, 120, '#dc2626'],
    [120, 130, '#7f1d1d'],
  ];
  for (const [a, b, col] of bands) {
    ctx.fillStyle = col;
    ctx.fillRect(bx, dB2y(b), bw, dB2y(a) - dB2y(b));
  }
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2.5;
  ctx.strokeRect(bx, top, bw, bot - top);
  // ticks every 10 dB
  for (let db = 0; db <= 130; db += 10) {
    const y = dB2y(db);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = db % 20 === 0 ? 2.5 : 1.5;
    ctx.beginPath();
    ctx.moveTo(bx, y); ctx.lineTo(bx - (db % 20 === 0 ? 16 : 10), y);
    ctx.stroke();
    if (db % 20 === 0) H.textLeft(ctx, String(db), bx - 66, y, 44, 20, '700', C.sub);
  }
  H.textLeft(ctx, 'intensity', bx - 8, top - 42, 200, 22, '700', C.ink);
  H.textLeft(ctx, 'level (dB)', bx - 8, top - 18, 200, 22, '700', C.ink);

  // example markers
  const marks = [
    [0, '0 dB \u2014 threshold of hearing'],
    [20, '20 dB \u2014 rustling leaves, whisper'],
    [30, '30 dB \u2014 quiet room at night'],
    [60, '60 dB \u2014 normal conversation'],
    [70, '70 dB \u2014 busy city traffic'],
    [85, '85 dB \u2014 safe limit: 8 hours a day'],
    [100, '100 dB \u2014 motorbike passing, nightclub'],
    [110, '110 dB \u2014 chainsaw, loud gig'],
    [120, '120 dB \u2014 jet at take-off distance'],
    [130, '130 dB \u2014 threshold of pain'],
  ];
  for (const [db, label] of marks) {
    const y = dB2y(db);
    ctx.strokeStyle = C.sub;
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(bx + bw, y); ctx.lineTo(bx + bw + 18, y); ctx.stroke();
    H.textLeft(ctx, label, bx + bw + 30, y, 380, 18, '600', db >= 85 ? C.warn : C.ink);
  }

  // ---- Right: why the scale is logarithmic ----
  const rx = 700, rw = 830;
  H.panelBox(ctx, rx, 150, rw, 560, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'Why the scale is logarithmic', rx + rw / 2, 185, rw - 60, 24, '700', C.accent);
  const rows = [
    ['0 dB', '1 \u00d7 threshold intensity (I\u2080 = 10\u207b\u00b9\u00b2 W m\u207b\u00b2)'],
    ['10 dB', '10 \u00d7 threshold'],
    ['20 dB', '100 \u00d7 threshold'],
    ['40 dB', '10 000 \u00d7 threshold'],
    ['70 dB', '10 000 000 \u00d7 threshold'],
    ['100 dB', '10 000 000 000 \u00d7 threshold'],
  ];
  let ry = 240;
  for (const [left, right] of rows) {
    H.textLeft(ctx, left, rx + 50, ry, 140, 20, '700', C.accent);
    H.textLeft(ctx, right, rx + 200, ry, 580, 19, '400', C.sub);
    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(rx + 40, ry + 24); ctx.lineTo(rx + rw - 40, ry + 24); ctx.stroke();
    ry += 46;
  }
  H.chip(ctx, 'intensity level (dB) = 10 \u00d7 log\u2081\u2080 ( I \u00f7 I\u2080 )', rx + rw / 2, ry + 8, rw - 120, C.accentSoft, C.accent, 21);
  H.textCentered(ctx, 'Worked: a sound of intensity 10\u207b\u2075 W m\u207b\u00b2 gives 10 \u00d7 log\u2081\u2080 (10\u207b\u2075 \u00f7 10\u207b\u00b9\u00b2) = 10 \u00d7 7 = 70 dB', rx + rw / 2, ry + 58, rw - 80, 19, '400', C.ink);

  H.chip(ctx, 'Every extra 3 dB halves the safe exposure time \u2014 85 dB for 8 hours, 88 dB for 4 hours, 91 dB for 2 hours', W / 2, HH - 80, 1000, C.warnSoft, C.warn);
  H.textCentered(ctx, 'Prolonged exposure above about 85 dB permanently damages the hair cells of the cochlea \u2014 the damage is cumulative and cannot be undone.', W / 2, HH - 30, 1300, 18, '400', C.sub);

  H.save('a24-decibel-scale.png', canvas);
}

// ---------------- Diagram 4: the ear ----------------
function drawEar() {
  const W = 1600, HH = 950;
  const { canvas, ctx } = H.makeCanvas(W, HH);
  H.title(ctx, W, 'The ear: turning a vibrating wave into an electrical signal',
    'Outer ear collects \u2192 eardrum vibrates \u2192 middle ear amplifies \u2192 cochlea converts \u2192 nerve reports to the brain');

  // ---- Left: the labelled cross-section ----
  const earX = 70, earY = 150, earW = 1030, earH = 760;
  H.panelBox(ctx, earX, earY, earW, earH, '#ffffff', C.panelBorder);
  const cy = 500;

  // pinna: large curved shape
  ctx.strokeStyle = C.ink;
  ctx.fillStyle = '#f1f5f9';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(150, cy - 180);
  ctx.bezierCurveTo(90, cy - 140, 80, cy - 40, 150, cy + 10);
  ctx.bezierCurveTo(120, cy + 60, 150, cy + 120, 215, cy + 150);
  ctx.lineTo(240, cy - 150);
  ctx.bezierCurveTo(210, cy - 180, 180, cy - 190, 150, cy - 180);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = C.faint;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(170, cy - 130);
  ctx.bezierCurveTo(140, cy - 90, 150, cy - 40, 195, cy + 20);
  ctx.stroke();
  H.textCentered(ctx, 'pinna', 165, cy + 200, 140, 19, '700', C.ink);

  // ear canal: two horizontal lines
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(245, cy - 55); ctx.lineTo(560, cy - 55); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(245, cy + 55); ctx.lineTo(560, cy + 55); ctx.stroke();
  H.textCentered(ctx, 'ear canal', 400, cy - 95, 200, 19, '700', C.ink);

  // eardrum: tilted membrane at the end of the canal
  ctx.strokeStyle = C.warn;
  ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(565, cy - 62); ctx.lineTo(585, cy + 62); ctx.stroke();
  H.textCentered(ctx, 'eardrum', 545, cy + 105, 200, 19, '700', C.warn);

  // middle ear cavity
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(575, cy - 62);
  ctx.lineTo(575, cy + 62);
  ctx.lineTo(700, cy + 110);
  ctx.lineTo(950, cy + 110);
  ctx.lineTo(950, cy - 110);
  ctx.lineTo(700, cy - 110);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // ossicles: malleus, incus, stapes
  ctx.fillStyle = C.sub;
  H.roundRect(ctx, 600, cy - 22, 42, 44, 10); ctx.fill(); // malleus
  H.roundRect(ctx, 690, cy - 20, 44, 40, 10); ctx.fill(); // incus
  ctx.save();
  ctx.translate(800, cy);
  ctx.rotate(-0.35);
  H.roundRect(ctx, 0, -14, 52, 28, 8); ctx.fill();
  ctx.restore();
  ctx.strokeStyle = C.sub;
  ctx.lineWidth = 8;
  ctx.beginPath(); ctx.moveTo(642, cy); ctx.lineTo(690, cy); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(734, cy); ctx.lineTo(800, cy - 8); ctx.stroke();
  H.textCentered(ctx, 'ossicles: hammer \u2022 anvil \u2022 stirrup', 745, cy + 150, 400, 18, '700', C.sub);

  // oval window: small oval at cavity's right edge
  ctx.fillStyle = C.warn;
  ctx.strokeStyle = '#991b1b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.ellipse(952, cy - 40, 9, 26, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // cochlea: spiral to the right of the cavity
  const spx = 1130, spy = cy;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  let first = true;
  for (let t = 0; t <= 2.55 * Math.PI; t += 0.08) {
    const r = 145 - (t / (2.55 * Math.PI)) * 118;
    const x = spx + r * Math.cos(t);
    const y = spy + r * Math.sin(t) * 0.85;
    if (first) { ctx.moveTo(x, y); first = false; } else ctx.lineTo(x, y);
  }
  ctx.stroke();
  H.textCentered(ctx, 'cochlea (uncoiled here it is a fluid-filled tube about 3.5 cm long)', spx, spy + 185, 420, 18, '700', C.ink);
  // connection: stirrup to oval window to cochlea
  ctx.strokeStyle = C.sub;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(852, cy - 12); ctx.lineTo(943, cy - 40); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(960, cy - 40); ctx.lineTo(spx - 130, spy - 30); ctx.stroke();

  // auditory nerve
  ctx.strokeStyle = C.ok;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(spx + 55, spy + 20);
  ctx.bezierCurveTo(1210, spy + 60, 1240, spy - 90, 1050, cy + 260);
  ctx.bezierCurveTo(1200, cy + 320, 1300, cy + 300, 1040, earY + earH - 60);
  ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.beginPath(); ctx.arc(1040, earY + earH - 60, 6, 0, Math.PI * 2); ctx.fill();
  H.textLeft(ctx, 'auditory nerve \u2014 carries the electrical signals to the brain, which hears them as sound', 1060, earY + earH - 42, 500, 17, '700', C.ok);

  // Eustachian tube
  ctx.strokeStyle = C.sub;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(700, cy + 110);
  ctx.bezierCurveTo(640, cy + 220, 600, cy + 250, 540, cy + 280);
  ctx.stroke();
  H.textCentered(ctx, 'Eustachian tube \u2014 lets air in and out of the middle ear so pressure stays equal on both sides of the eardrum', 470, cy + 330, 430, 17, '600', C.sub);

  // region brackets along the top
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(150, earY + 50); ctx.lineTo(585, earY + 50); ctx.stroke();
  H.textCentered(ctx, 'OUTER EAR', 360, earY + 74, 300, 17, '700', C.accent);
  ctx.strokeStyle = C.warn;
  ctx.beginPath(); ctx.moveTo(590, earY + 50); ctx.lineTo(950, earY + 50); ctx.stroke();
  H.textCentered(ctx, 'MIDDLE EAR (air)', 770, earY + 74, 300, 17, '700', C.warn);
  ctx.strokeStyle = C.ok;
  ctx.beginPath(); ctx.moveTo(955, earY + 50); ctx.lineTo(1290, earY + 50); ctx.stroke();
  H.textCentered(ctx, 'INNER EAR (fluid)', 1120, earY + 74, 300, 17, '700', C.ok);

  // ---- Right: legend panel ----
  const lx = 1130, lw = 440;
  H.panelBox(ctx, lx, 150, lw, 700, C.panel, C.panelBorder);
  H.textCentered(ctx, 'What each part does', lx + lw / 2, 182, lw - 40, 22, '700', C.accent);
  const legend = [
    ['Pinna', 'collects sound and funnels it into the ear canal'],
    ['Ear canal', 'a short air-filled tube carrying the wave to the eardrum'],
    ['Eardrum', 'a taut membrane that vibrates in step with the arriving wave'],
    ['Ossicles', 'three tiny bones \u2014 they act as levers and concentrate the force onto the much smaller oval window, boosting the pressure about twentyfold'],
    ['Oval window', 'hands the vibration on to the fluid of the inner ear'],
    ['Cochlea', 'a coiled, fluid-filled tube lined with hair cells; they shake with the fluid and convert vibration into electrical signals \u2014 high frequencies near the base, low frequencies near the apex'],
    ['Auditory nerve', 'carries those signals to the brain'],
    ['Eustachian tube', 'ventilates the middle ear and equalises pressure (the pop when you swallow on a plane)'],
  ];
  let ly = 225;
  for (const [name, fn] of legend) {
    H.textLeft(ctx, name, lx + 28, ly, lw - 60, 19, '700', C.ink);
    // wrap the function text over up to 3 lines
    const words = fn.split(' ');
    const lineW = lw - 56;
    let line = '';
    let lineY = ly + 24;
    H.setFont(ctx, 16, '400');
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > lineW) {
        H.textLeft(ctx, line, lx + 28, lineY, lineW, 16, '400', C.sub);
        line = word;
        lineY += 21;
      } else {
        line = test;
      }
    }
    H.textLeft(ctx, line, lx + 28, lineY, lineW, 16, '400', C.sub);
    ly = lineY + 40;
  }

  H.save('a24-ear-structure.png', canvas);
}

module.exports = { drawDecibelScale, drawEar };