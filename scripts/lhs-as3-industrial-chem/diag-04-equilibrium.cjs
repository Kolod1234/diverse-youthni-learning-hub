// AS 3 diagram 4: dynamic equilibrium (rate curves), and Le Chatelier's principle.
const H = require('./common.cjs');
const {
  C, makeCanvas, title, save, textCentered, textLeft, setFont,
  arrow, roundRect, panelBox, chip, lead, dashedLine, bracket, atom,
} = H;

function renderEquilibrium() {
  const w = 1600, h = 950;
  const { canvas, ctx } = makeCanvas(w, h);
  title(ctx, w, 'Dynamic equilibrium: the point where the two rates meet',
    'In a closed system a reversible reaction runs both ways at once; equilibrium is when the two speeds become equal');

  // graph panel
  panelBox(ctx, 60, 150, 900, 660);
  const gx = 160, gy = 220, gw = 760, gh = 470;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  arrow(ctx, gx, gy + gh, gx, gy - 10, 3, C.ink);
  arrow(ctx, gx, gy + gh, gx + gw + 20, gy + gh, 3, C.ink);
  textCentered(ctx, 'rate of reaction', gx + 130, gy - 24, 260, 20, '600', C.ink);
  textCentered(ctx, 'time', gx + gw + 10, gy + gh + 36, 120, 20, '600', C.sub);

  const eqY = gy + 170;   // equal-rate level
  const eqX = gx + 300;   // where curves meet

  // forward: starts high, falls to eqY
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(gx, gy + 40);
  ctx.bezierCurveTo(gx + 120, gy + 100, gx + 180, eqY, eqX, eqY);
  ctx.lineTo(gx + gw, eqY);
  ctx.stroke();

  // reverse: starts at zero, rises to eqY
  ctx.strokeStyle = '#cc2222';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(gx, gy + gh);
  ctx.bezierCurveTo(gx + 140, gy + gh, gx + 200, eqY, eqX, eqY);
  ctx.lineTo(gx + gw, eqY);
  ctx.stroke();

  dashedLine(ctx, eqX, eqY, eqX, gy + gh, C.sub, 2.5);
  textCentered(ctx, 'equilibrium reached', eqX + 100, gy + gh - 18, 220, 20, '700', C.sub);
  textCentered(ctx, 'forward rate', gx + 70, gy + 16, 220, 20, '700', C.accent);
  textCentered(ctx, 'reverse rate', gx + 96, gy + gh - 18, 220, 20, '700', '#cc2222');

  // annotation chips on the graph
  chip(ctx, 'forward reaction slows: reactants are being used up', gx + 300, gy + 90, 440, C.accentSoft, C.accent, 19);
  chip(ctx, 'reverse reaction speeds up: products are building up', gx + 330, gy + 300, 460, C.warnSoft, '#991b1b', 19);
  chip(ctx, 'rates are EQUAL — but concentrations are constant, not equal', eqX + 210, eqY + 60, 520, C.okSoft, '#166534', 19);

  // right column: three takeaway boxes
  const notes = [
    ['Closed system', 'Nothing escapes: gases stay in the sealed vessel, so the reverse reaction has material to work with.'],
    ['Dynamic, not dead', 'Both reactions continue at equal speed. Molecules are still reacting — there is just no net change.'],
    ['Constant, not equal', 'Reactant and product concentrations hold steady, but they do not have to be 50 : 50.'],
  ];
  notes.forEach(function (n, i) {
    const y = 170 + i * 180;
    panelBox(ctx, 1000, y, 540, 150, C.panel);
    textLeft(ctx, n[0], 1024, y + 40, 500, 23, '700');
    textLeft(ctx, n[1], 1024, y + 86, 500, 20, '400', C.sub);
  });
  save('as3-equilibrium.png', canvas);
}

function renderLeChatelier() {
  const w = 1600, h = 950;
  const { canvas, ctx } = makeCanvas(w, h);
  title(ctx, w, "Le Chatelier's principle: equilibrium answers back",
    'Change the conditions and the equilibrium shifts to oppose the change — then settles at a new balance');

  // reaction banner
  panelBox(ctx, 260, 150, 1080, 120, C.accentSoft, '#c7d2fe');
  textCentered(ctx, 'N2(g) + 3H2(g)  ⇌  2NH3(g)      forward reaction is exothermic', 800, 196, 1000, 28, '700', C.accent);
  textCentered(ctx, '4 molecules of gas on the left, only 2 on the right', 800, 240, 800, 20, '600', C.sub);

  // four change rows
  const rows = [
    ['Pressure increased', 'right', 'shifts RIGHT — towards the side with fewer gas molecules (2 instead of 4)', C.ok],
    ['Temperature increased', 'left', 'shifts LEFT — into the endothermic direction, which absorbs the added heat', '#0284c7'],
    ['Ammonia removed', 'right', 'shifts RIGHT — makes more ammonia to replace what was taken', C.ok],
    ['Catalyst added', 'none', 'NO shift — equilibrium is reached sooner, but the position is unchanged', C.amber],
  ];
  rows.forEach(function (r, i) {
    const y = 330 + i * 118;
    panelBox(ctx, 120, y, 1360, 96);
    textCentered(ctx, r[0], 300, y + 48, 300, 24, '700', C.ink);
    // direction arrow
    if (r[1] === 'right') {
      arrow(ctx, 530, y + 48, 660, y + 48, 6, C.ok);
      textCentered(ctx, 'shifts right', 595, y + 16, 200, 19, '700', C.ok);
    } else if (r[1] === 'left') {
      arrow(ctx, 660, y + 48, 530, y + 48, 6, '#0284c7');
      textCentered(ctx, 'shifts left', 595, y + 16, 200, 19, '700', '#0284c7');
    } else {
      textCentered(ctx, 'no shift', 595, y + 48, 200, 22, '700', C.amber);
    }
    textLeft(ctx, r[2], 700, y + 48, 740, 21, '600', r[3]);
  });

  chip(ctx, 'The equilibrium always moves to cancel out the change you made — as far as it can',
    w / 2, 850, 1200, C.amberSoft, '#92400e', 22);
  save('as3-lechatelier.png', canvas);
}

module.exports = { renderEquilibrium, renderLeChatelier };