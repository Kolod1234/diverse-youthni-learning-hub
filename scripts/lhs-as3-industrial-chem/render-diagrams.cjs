// Renders all AS 3 diagrams into public/lesson-assets/lhs-as2 and prints sizes.
const H = require('./common.cjs');
const D1 = require('./diag-01-rates.cjs');
const D2 = require('./diag-02-energy.cjs');
const D3 = require('./diag-03-measurement.cjs');
const D4 = require('./diag-04-equilibrium.cjs');
const D5 = require('./diag-05-haber.cjs');

[
  D1.renderCollisionTheory,
  D1.renderRateFactors,
  D2.renderEnergyProfiles,
  D2.renderBondEnergies,
  D3.renderRateCurves,
  D3.renderCalorimetry,
  D4.renderEquilibrium,
  D4.renderLeChatelier,
  D5.renderHaber,
].forEach((fn) => fn());

console.log(H.results.map((r) => r.name + ': ' + Math.round(r.bytes / 1024) + ' KB').join('\n'));