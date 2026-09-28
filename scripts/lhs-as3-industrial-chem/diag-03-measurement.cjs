// AS 3 diagram 3: reading rate curves, and calorimetry apparatus with q = m c ΔT.
const H = require('./common.cjs');
const {
  C, makeCanvas, title, save, textCentered, textLeft, setFont,
  arrow, roundRect, panelBox, chip, lead, dashedLine, bracket, atom,
} = H;

function renderRateCurves() {
  const w = 1600, h = 950;
  const { canvas, ctx } = makeCanvas(w, h);
  title(ctx, w, 'Reading a rate curve: volume of gas against time',
    'The gradient of the curve is the rate — steeper means faster, and the flat top means the reaction is over');

  // graph panel
  panelBox(ctx, 60, 150, 900, 660);
  const gx = 150, gy = 210, gw = 760, gh = 480;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  arrow(ctx, gx, gy + gh, gx, gy - 10, 3, C.ink);
  arrow(ctx, gx, gy + gh, gx + gw + 20, gy + gh, 3, C.ink);
  textCentered(ctx, 'volume of gas collected (cm³)', gx + 160, gy - 26, 320, 20, '600', C.ink);
  textCentered(ctx, 'time (s)', gx + gw + 20, gy + gh + 36, 160, 20, '600', C.sub);

  // gridline ticks on y axis
  const yTop = gy + 40;    // 120 cm3
  const yBottom = gy + gh - 10;
  [0, 30, 60, 90, 120].forEach(function (v) {
    const yy = yBottom - (v / 120) * (yBottom - yTop);
    dashedLine(ctx, gx, yy, gx + gw, yy, C.grid, 1.5);
    textLeft(ctx, String(v), gx - 44, yy, 40, 18, '400', C.sub);
  });

  // final volume line
  dashedLine(ctx, gx, yTop, gx + gw, yTop, C.sub, 2);
  textLeft(ctx, 'reaction complete: all the limiting reactant is used up', gx + 20, yTop - 14, 520, 19, '600', C.sub);

  // steep curve (concentrated acid): reaches 120 by ~t=200
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(gx, yBottom);
  ctx.bezierCurveTo(gx + 60, yTop + 30, gx + 140, yTop, gx + 240, yTop);
  ctx.lineTo(gx + gw, yTop);
  ctx.stroke();

  // shallow curve (dilute acid): reaches 120 by ~t=600
  ctx.strokeStyle = C.accent2;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(gx, yBottom);
  ctx.bezierCurveTo(gx + 200, yTop + 140, gx + 420, yTop + 20, gx + 560, yTop);
  ctx.lineTo(gx + gw, yTop);
  ctx.stroke();

  // gradient triangle on the steep curve near the start
  const tx = gx + 26, ty = yBottom - 8;
  dashedLine(ctx, tx, ty, tx + 90, ty, C.warn, 2.5);
  dashedLine(ctx, tx + 90, ty, tx + 90, ty - 148, C.warn, 2.5);
  chip(ctx, 'initial gradient = rate at the start', tx + 200, ty - 120, 380, C.warnSoft, '#991b1b', 20);

  // legend
  setFont(ctx, 21, '700');
  ctx.fillStyle = C.accent;
  ctx.fillRect(gx + 40, gy + 60, 40, 8);
  textLeft(ctx, 'more concentrated acid: steeper start, same final volume', gx + 90, gy + 64, 640, 20, '600');
  ctx.fillStyle = C.accent2;
  ctx.fillRect(gx + 40, gy + 100, 40, 8);
  textLeft(ctx, 'dilute acid: shallower start — slower, but the same finish', gx + 90, gy + 104, 640, 20, '600');

  // right column: three takeaway boxes
  const notes = [
    ['Steeper curve = faster reaction', 'The particles are colliding successfully more often per second.'],
    ['The curve always flattens', 'Reactants are used up, successful collisions become rarer, so the rate falls towards zero.'],
    ['Same plateau = same amount made', 'Concentration changes the speed, not the final amount, when the limiting reactant is unchanged.'],
  ];
  notes.forEach(function (n, i) {
    const y = 170 + i * 180;
    panelBox(ctx, 1000, y, 540, 150, C.panel);
    textLeft(ctx, n[0], 1024, y + 40, 500, 23, '700');
    textLeft(ctx, n[1], 1024, y + 86, 500, 20, '400', C.sub);
  });
  save('as3-rate-curves.png', canvas);
}

function renderCalorimetry() {
  const w = 1600, h = 950;
  const { canvas, ctx } = makeCanvas(w, h);
  title(ctx, w, 'Calorimetry: measuring an energy change directly',
    'Burn a fuel (or run a reaction) beneath a known mass of water and read the temperature rise');

  // left: apparatus
  panelBox(ctx, 60, 150, 700, 660);
  textCentered(ctx, 'A simple calorimeter', 410, 190, 640, 27, '700');

  // draught shield
  ctx.strokeStyle = C.sub;
  ctx.lineWidth = 3;
  ctx.setLineDash([12, 9]);
  roundRect(ctx, 150, 560, 320, 220, 12);
  ctx.stroke();
  ctx.setLineDash([]);

  // spirit burner
  ctx.fillStyle = '#e2e8f0';
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  roundRect(ctx, 220, 660, 100, 90, 10);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(270, 660);
  ctx.lineTo(270, 630);
  ctx.stroke();
  // flame
  ctx.fillStyle = '#fdba74';
  ctx.beginPath();
  ctx.moveTo(258, 612);
  ctx.quadraticCurveTo(270, 570, 282, 612);
  ctx.quadraticCurveTo(270, 600, 258, 612);
  ctx.fill();
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 2;
  ctx.stroke();
  textLeft(ctx, 'spirit burner holding the fuel', 90, 730, 300, 19, '600', C.sub);

  // copper can with water
  ctx.fillStyle = '#bfdbfe';
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(180, 330);
  ctx.lineTo(200, 560);
  ctx.lineTo(340, 560);
  ctx.lineTo(360, 330);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  dashedLine(ctx, 185, 380, 355, 380, C.sub, 2);
  textCentered(ctx, 'water (known mass m)', 270, 470, 200, 20, '700', '#1e3a8a');

  // lid
  ctx.fillStyle = '#94a3b8';
  ctx.fillRect(170, 316, 200, 16);
  textLeft(ctx, 'lid with a hole for the thermometer', 420, 322, 280, 19, '600', C.sub);

  // thermometer
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(270, 318);
  ctx.lineTo(270, 180);
  ctx.stroke();
  ctx.fillStyle = '#cc2222';
  ctx.beginPath();
  ctx.arc(270, 392, 10, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(270, 392, 10, 0, Math.PI * 2);
  ctx.stroke();
  textLeft(ctx, 'thermometer: read ΔT', 300, 200, 260, 19, '600', C.sub);
  lead(ctx, 298, 196, 262, 300, C.sub);

  // stirrer
  ctx.strokeStyle = '#7c3aed';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(320, 560);
  ctx.lineTo(320, 590);
  ctx.moveTo(305, 590);
  ctx.lineTo(335, 590);
  ctx.stroke();
  textLeft(ctx, 'stirrer spreads the heat evenly', 400, 590, 300, 19, '600', '#7c3aed');

  textLeft(ctx, 'Draught shield: blocks stray air currents so the flame heats the can, not the room.', 110, 800, 620, 19, '600', C.sub);

  // right: the formula and a worked calculation
  panelBox(ctx, 800, 150, 740, 660, C.accentSoft, '#c7d2fe');
  textCentered(ctx, 'The calculation', 1170, 196, 680, 27, '700');
  chip(ctx, 'q = m × c × ΔT', 1170, 268, 400, '#ffffff', C.accent, 32);
  const defs = [
    ['q', 'heat energy transferred, in joules (J)'],
    ['m', 'mass of the water, in grams (g)'],
    ['c', 'specific heat capacity of water: 4.2 J per g per °C'],
    ['ΔT', 'temperature change, in °C (final − initial)'],
  ];
  defs.forEach(function (d, i) {
    const y = 340 + i * 52;
    textCentered(ctx, d[0], 860, y, 60, 24, '700', C.accent);
    textLeft(ctx, d[1], 900, y, 600, 21, '600', C.ink);
  });

  panelBox(ctx, 840, 570, 660, 210, '#ffffff', C.accent);
  textLeft(ctx, 'Worked example', 864, 600, 400, 23, '700');
  textLeft(ctx, 'Burning a sample of fuel raises 100 g of water from 21.6 °C to 30.0 °C.', 864, 636, 620, 20, '600', C.sub);
  textLeft(ctx, 'q = 100 × 4.2 × 8.4 = 3528 J ≈ 3.5 kJ', 864, 674, 620, 24, '700');
  textLeft(ctx, 'Divide by the moles of fuel burned and you have the energy per mole — the value tables record.', 864, 712, 620, 19, '600', C.sub);

  chip(ctx, 'Insulate, shield and stir: every escaped joule is heat that never reaches the thermometer',
    w / 2, 880, 1300, C.amberSoft, '#92400e', 21);
  save('as3-calorimetry.png', canvas);
}

module.exports = { renderRateCurves, renderCalorimetry };