// AS 3 diagram 2: energy profiles (exothermic vs endothermic), and bond-energy bookkeeping.
const H = require('./common.cjs');
const {
  C, makeCanvas, title, save, textCentered, textLeft, setFont,
  arrow, roundRect, panelBox, chip, lead, dashedLine, bracket, atom,
} = H;

// One full energy-profile graph.
function profileGraph(ctx, x, y, w, h, kind) {
  const exo = kind === 'exo';
  const reactY = y + h - 90;          // reactants level
  const prodY = exo ? reactY + 90 : reactY - 110; // products level
  const peakY = y + 70;

  // axes
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  arrow(ctx, x, y + h, x, y + 14, 3, C.ink);
  arrow(ctx, x, y + h, x + w, y + h, 3, C.ink);
  textCentered(ctx, 'energy', x - 8, y + 30, 90, 20, '600', C.ink);
  ctx.save();
  ctx.translate(x - 44, y + h / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.restore();
  textCentered(ctx, 'progress of reaction', x + w / 2, y + h + 34, 400, 20, '600', C.sub);

  // level lines
  dashedLine(ctx, x + 30, reactY, x + w - 20, reactY, C.sub, 2);
  dashedLine(ctx, x + w * 0.5, prodY, x + w - 20, prodY, C.sub, 2);
  textLeft(ctx, 'reactants', x + 34, reactY - 16, 200, 20, '600', C.ink);
  textLeft(ctx, 'products', x + w - 130, prodY - 16, 120, 20, '600', C.ink);

  // the curve over the hump
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(x + 30, reactY);
  ctx.bezierCurveTo(x + w * 0.3, reactY, x + w * 0.34, peakY, x + w * 0.5, peakY);
  ctx.bezierCurveTo(x + w * 0.66, peakY, x + w * 0.68, prodY, x + w - 20, prodY);
  ctx.stroke();

  // activation energy (from reactants level up to the peak)
  dashedLine(ctx, x + w * 0.5, peakY, x + w * 0.5, reactY, C.warn, 2);
  arrow(ctx, x + w * 0.34, reactY - 6, x + w * 0.34, peakY + 6, 3, C.warn);
  arrow(ctx, x + w * 0.34, peakY + 6, x + w * 0.34, reactY - 6, 3, C.warn);
  textCentered(ctx, 'activation energy', x + w * 0.34 + 92, (peakY + reactY) / 2, 200, 20, '600', C.warn);

  // ΔH bracket between reactant and product levels
  const bx = x + w - 130;
  bracket(ctx, bx - 6, bx + 6, (reactY + prodY) / 2, '', C.ink);
  arrow(ctx, bx + 40, reactY, bx + 40, prodY, 3, exo ? C.ok : '#0284c7');
  textCentered(ctx, exo ? 'energy released' : 'energy taken in', bx + 40, (reactY + prodY) / 2 + (exo ? -26 : 26), 220, 20, '700', exo ? C.ok : '#0284c7');

  chip(ctx, exo ? 'ΔH is negative: products hold less energy than reactants' : 'ΔH is positive: products hold more energy than reactants',
    x + w / 2, y + h - 24, w - 60, exo ? C.okSoft : C.accent2Soft, exo ? '#166534' : '#075985', 20);
}

function renderEnergyProfiles() {
  const w = 1600, h = 950;
  const { canvas, ctx } = makeCanvas(w, h);
  title(ctx, w, 'Energy profiles: exothermic and endothermic reactions',
    'Every reaction must first climb the activation-energy hump; what happens afterwards sets the sign of ΔH');

  panelBox(ctx, 60, 150, 720, 560);
  textCentered(ctx, 'Exothermic reaction', 420, 190, 660, 28, '700');
  profileGraph(ctx, 140, 220, 560, 380, 'exo');
  textLeft(ctx, 'The chemicals lose energy; the surroundings gain it. The mixture warms up.', 100, 660, 660, 21, '600', C.sub);

  panelBox(ctx, 820, 150, 720, 560);
  textCentered(ctx, 'Endothermic reaction', 1180, 190, 660, 28, '700');
  profileGraph(ctx, 900, 220, 560, 380, 'endo');
  textLeft(ctx, 'The chemicals gain energy; the surroundings lose it. The mixture cools down.', 860, 660, 660, 21, '600', C.sub);

  chip(ctx, 'A catalyst lowers the activation-energy hump but never changes ΔH, the reactants or the products',
    w / 2, 880, 1300, C.amberSoft, '#92400e', 22);
  save('as3-energy-profiles.png', canvas);
}

// A diatomic molecule with its bond drawn and labelled.
function molecule(ctx, x, y, sym, r, color) {
  atom(ctx, x - r - 14, y, r, color, sym);
  atom(ctx, x + r + 14, y, r, color, sym);
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(x - 8, y);
  ctx.lineTo(x + 8, y);
  ctx.stroke();
}

function renderBondEnergies() {
  const w = 1600, h = 950;
  const { canvas, ctx } = makeCanvas(w, h);
  title(ctx, w, 'Bond energies: where the energy change comes from',
    'Breaking bonds always takes in energy; making bonds always releases it — ΔH is the difference');

  // left panel: the reaction H2 + Cl2 -> 2HCl
  panelBox(ctx, 60, 150, 760, 600);
  textCentered(ctx, 'Hydrogen + chlorine → hydrogen chloride', 440, 190, 700, 26, '700');
  textCentered(ctx, 'H2(g) + Cl2(g) → 2HCl(g)', 440, 236, 500, 26, '700', C.accent);

  molecule(ctx, 180, 380, 'H', 30, '#fca5a5');
  textCentered(ctx, 'H–H', 180, 450, 120, 20, '600', C.sub);
  molecule(ctx, 330, 380, 'Cl', 30, '#86efac');
  textCentered(ctx, 'Cl–Cl', 330, 450, 120, 20, '600', C.sub);
  arrow(ctx, 420, 380, 500, 380, 5, C.ink);

  molecule(ctx, 620, 380, 'H', 26, '#fca5a5');
  textCentered(ctx, 'H–Cl', 620, 450, 120, 20, '600', C.sub);

  chip(ctx, 'bonds broken: energy taken IN', 255, 530, 400, C.warnSoft, '#991b1b', 21);
  chip(ctx, 'bonds made: energy given OUT', 620, 530, 440, C.okSoft, '#166534', 21);
  textLeft(ctx, 'One H–H bond and one Cl–Cl bond are broken; two H–Cl bonds are made.', 110, 610, 660, 21, '600', C.sub);

  // right panel: the accounting
  panelBox(ctx, 860, 150, 680, 600, C.accentSoft, '#c7d2fe');
  textCentered(ctx, 'The bookkeeping', 1200, 192, 600, 28, '700');
  textCentered(ctx, 'ΔH = energy put in to break bonds − energy released making bonds', 1200, 244, 600, 23, '700', C.accent);

  const rows = [
    ['Bonds broken', 'H–H 436 kJ per mole + Cl–Cl 243 kJ per mole', '= 679 kJ per mole taken in', C.warn],
    ['Bonds made', '2 × H–Cl = 2 × 431 kJ per mole', '= 862 kJ per mole released', C.ok],
  ];
  rows.forEach(function (r, i) {
    const y = 320 + i * 130;
    panelBox(ctx, 900, y - 46, 600, 108, '#ffffff', r[3]);
    textLeft(ctx, r[0], 920, y - 24, 200, 22, '700', r[3]);
    textLeft(ctx, r[1], 920, y + 2, 540, 20, '600', C.ink);
    textLeft(ctx, r[2], 920, y + 28, 540, 20, '700', r[3]);
  });

  panelBox(ctx, 900, 560, 600, 130, '#ffffff', C.accent);
  textLeft(ctx, 'ΔH = 679 − 862 = −183 kJ per mole', 920, 600, 560, 26, '700');
  textLeft(ctx, 'Negative ΔH: more energy is released making the new bonds than was used breaking the old ones — exothermic.', 920, 644, 560, 20, '600', C.sub);

  chip(ctx, 'Bond-energy calculations are averages, so answers are estimates — but the sign of ΔH is reliable',
    w / 2, 880, 1300, C.amberSoft, '#92400e', 21);
  save('as3-bond-energies.png', canvas);
}

module.exports = { renderEnergyProfiles, renderBondEnergies };