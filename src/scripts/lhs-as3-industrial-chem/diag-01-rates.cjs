// AS 3 diagram 1: collision theory, and the four factors that change rate.
const H = require('./common.cjs');
const {
  C, makeCanvas, title, save, textCentered, textLeft, setFont,
  arrow, roundRect, panelBox, chip, lead, dashedLine, atom,
} = H;

// One "collision scenario" row: two atoms approaching with speed arrows, a
// starburst at the collision point, an arrow to the outcome, and explanation.
function collisionRow(ctx, y, outcome) {
  atom(ctx, 150, y, 34, '#93c5fd', 'A');
  atom(ctx, 330, y, 34, '#fca5a5', 'B');
  arrow(ctx, 90, y, 115, y, 4, C.sub);
  arrow(ctx, 390, y, 365, y, 4, C.sub);

  // collision starburst
  const cx = 240, cy = y;
  ctx.strokeStyle = outcome.reacts ? C.ok : C.warn;
  ctx.lineWidth = 3;
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI / 4) * i + 0.39;
    ctx.beginPath();
    ctx.moveTo(cx + 42 * Math.cos(a), cy + 42 * Math.sin(a));
    ctx.lineTo(cx + 58 * Math.cos(a), cy + 58 * Math.sin(a));
    ctx.stroke();
  }

  arrow(ctx, 420, y, 500, y, 4, C.ink);

  if (outcome.reacts) {
    atom(ctx, 560, y - 6, 26, '#a7f3d0', 'A');
    atom(ctx, 608, y + 12, 26, '#a7f3d0', 'B');
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(572, y - 2);
    ctx.lineTo(598, y + 8);
    ctx.stroke();
    textLeft(ctx, 'new product made', 660, y, 240, 20, '600', C.ok);
  } else {
    arrow(ctx, 580, y - 10, 540, y - 44, 4, C.warn);
    arrow(ctx, 620, y + 10, 660, y + 44, 4, C.warn);
    textLeft(ctx, 'unchanged atoms bounce apart', 560, y + 66, 300, 18, '600', C.warn);
  }

  textLeft(ctx, outcome.headline, 740, y - 24, 740, 24, '700');
  textLeft(ctx, outcome.body, 740, y + 16, 760, 20, '400', C.sub);
}

function renderCollisionTheory() {
  const w = 1600, h = 950;
  const { canvas, ctx } = makeCanvas(w, h);
  title(ctx, w, 'Collision theory: what makes a reaction happen',
    'A reaction step succeeds only when particles collide with enough energy and a workable alignment');

  panelBox(ctx, 60, 140, 1480, 560);
  textCentered(ctx, 'Three collisions, one success', 800, 178, 800, 26, '700');
  collisionRow(ctx, 260, {
    reacts: true,
    headline: 'Enough energy, correct alignment',
    body: 'The particles hit hard and head-on, with energy at or above the activation energy.',
  });
  dashedLine(ctx, 90, 350, 1510, 350, C.grid, 2);
  collisionRow(ctx, 420, {
    reacts: false,
    headline: 'Too slow',
    body: 'The collision energy is below the activation energy, so the particles simply rebound.',
  });
  dashedLine(ctx, 90, 510, 1510, 510, C.grid, 2);
  collisionRow(ctx, 590, {
    reacts: false,
    headline: 'Wrong alignment',
    body: 'Even a fast collision fails if the atoms meet in an orientation the reaction cannot use.',
  });

  // The idea in four lines
  panelBox(ctx, 60, 710, 1480, 170, C.accentSoft, '#c7d2fe');
  textLeft(ctx, 'The idea in four lines', 100, 742, 500, 22, '700');
  const lines = [
    'Particles in a liquid or gas are constantly moving and colliding.',
    'Only collisions with energy at or above the activation energy can react.',
    'The rate of reaction counts the number of successful collisions per second.',
    'Anything that makes successful collisions more frequent makes the reaction faster.',
  ];
  lines.forEach(function (l, i) {
    const y = 772 + i * 31;
    ctx.fillStyle = C.accent;
    ctx.beginPath();
    ctx.arc(110, y, 12, 0, Math.PI * 2);
    ctx.fill();
    textCentered(ctx, String(i + 1), 110, y, 20, 17, '700', '#ffffff');
    textLeft(ctx, l, 140, y, 1360, 20, '600');
  });

  chip(ctx, 'Rate = successful collisions per second, and activation energy is the minimum energy a collision needs to react',
    w / 2, 916, 1380, C.amberSoft, '#92400e', 21);
  save('as3-collision-theory.png', canvas);
}

// A container of moving particles.
function particleBox(ctx, x, y, w, h, n, seed, speedLen) {
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 10);
  ctx.stroke();
  let s = seed;
  const rand = function () { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  for (let i = 0; i < n; i++) {
    const px = x + 30 + rand() * (w - 60);
    const py = y + 30 + rand() * (h - 60);
    atom(ctx, px, py, 16, i % 2 ? '#93c5fd' : '#fca5a5');
    const a = rand() * Math.PI * 2;
    if (speedLen > 0) arrow(ctx, px + 20 * Math.cos(a), py + 20 * Math.sin(a),
      px + (20 + speedLen) * Math.cos(a), py + (20 + speedLen) * Math.sin(a), 2.5, C.sub);
  }
}

function miniProfile(ctx, x, y, w, h, withCatalyst) {
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x + w, y + h);
  ctx.stroke();
  const base = y + h - 14;
  const peak = y + 18;
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x + 8, base);
  ctx.bezierCurveTo(x + w * 0.28, base, x + w * 0.32, peak, x + w * 0.46, peak);
  ctx.bezierCurveTo(x + w * 0.6, peak, x + w * 0.6, base + 34, x + w - 8, base + 34);
  ctx.stroke();
  if (withCatalyst) {
    ctx.strokeStyle = C.ok;
    ctx.lineWidth = 4;
    ctx.setLineDash([12, 8]);
    ctx.beginPath();
    ctx.moveTo(x + 8, base);
    ctx.bezierCurveTo(x + w * 0.24, base, x + w * 0.32, peak + 52, x + w * 0.46, peak + 52);
    ctx.bezierCurveTo(x + w * 0.6, peak + 52, x + w * 0.6, base + 34, x + w - 8, base + 34);
    ctx.stroke();
    ctx.setLineDash([]);
    textCentered(ctx, 'catalyst: lower hump, same start and finish', x + w / 2, y - 14, w, 19, '600', C.ok);
  }
}

function renderRateFactors() {
  const w = 1600, h = 950;
  const { canvas, ctx } = makeCanvas(w, h);
  title(ctx, w, 'Four levers that change the rate of reaction',
    'Each one works by making successful collisions more frequent — or easier to succeed');

  // Panel 1: concentration / pressure
  panelBox(ctx, 60, 140, 730, 360);
  textCentered(ctx, '1. Concentration (or gas pressure)', 425, 178, 680, 26, '700');
  particleBox(ctx, 100, 200, 280, 220, 4, 77, 10);
  particleBox(ctx, 470, 200, 280, 220, 11, 31, 10);
  textCentered(ctx, 'fewer particles', 240, 444, 260, 20, '600', C.sub);
  textCentered(ctx, 'more particles, same space', 610, 444, 280, 20, '600', C.sub);
  chip(ctx, 'more frequent collisions', 425, 472, 620, C.accent2Soft, C.ink, 20);

  // Panel 2: temperature
  panelBox(ctx, 810, 140, 730, 360);
  textCentered(ctx, '2. Temperature', 1175, 178, 680, 26, '700');
  particleBox(ctx, 850, 200, 280, 220, 8, 55, 8);
  particleBox(ctx, 1220, 200, 280, 220, 8, 91, 26);
  textCentered(ctx, 'cool: short speed arrows', 990, 444, 270, 20, '600', C.sub);
  textCentered(ctx, 'hot: long speed arrows', 1360, 444, 260, 20, '600', C.sub);
  chip(ctx, 'faster particles: more frequent collisions, and far more of them clear the activation energy', 1175, 472, 660, C.warnSoft, '#991b1b', 19);

  // Panel 3: surface area
  panelBox(ctx, 60, 530, 730, 360);
  textCentered(ctx, '3. Surface area of a solid', 425, 568, 680, 26, '700');
  ctx.fillStyle = '#cbd5e1';
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.fillRect(120, 610, 180, 160);
  ctx.strokeRect(120, 610, 180, 160);
  textCentered(ctx, 'one lump', 210, 790, 200, 20, '600', C.sub);
  for (let i = 0; i < 2; i++) {
    for (let j = 0; j < 2; j++) {
      ctx.fillStyle = '#bfdbfe';
      ctx.strokeStyle = C.ink;
      ctx.fillRect(420 + i * 100, 610 + j * 80, 90, 70);
      ctx.strokeRect(420 + i * 100, 610 + j * 80, 90, 70);
    }
  }
  textCentered(ctx, 'same solid, four pieces', 515, 790, 240, 20, '600', C.sub);
  arrow(ctx, 310, 690, 410, 690, 4, C.sub);
  chip(ctx, 'more exposed surface for collisions to reach', 425, 852, 640, C.okSoft, '#166534', 20);

  // Panel 4: catalyst
  panelBox(ctx, 810, 530, 730, 360);
  textCentered(ctx, '4. Catalyst', 1175, 568, 680, 26, '700');
  miniProfile(ctx, 880, 640, 500, 180, true);
  textLeft(ctx, 'A catalyst offers the particles a different route with a lower activation energy.', 870, 830, 620, 21, '600', C.sub);
  chip(ctx, 'the catalyst is not used up', 1175, 864, 500, C.accentSoft, C.accent, 20);

  save('as3-rate-factors.png', canvas);
}

module.exports = { renderCollisionTheory, renderRateFactors };