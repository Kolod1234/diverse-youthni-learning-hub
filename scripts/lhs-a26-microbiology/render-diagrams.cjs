// Renders the ten LHS A2 6 "Microbiology" diagrams and reports output sizes.
require('./diag-01-scale.cjs');
require('./diag-02-flora.cjs');
require('./diag-03-bacterium-virus.cjs');
require('./diag-04-growth-curve.cjs');
require('./diag-05-aseptic.cjs');
require('./diag-06-plating.cjs');
require('./diag-07-serial-dilution.cjs');
require('./diag-08-control.cjs');
require('./diag-09-antibiotic-targets.cjs');
require('./diag-10-kirby-bauer.cjs');

const { results } = require('./common.cjs');
results.forEach((r) => console.log(r.name, Math.round(r.bytes / 1024) + ' KB'));
console.log(results.length + ' diagrams rendered');
module.exports = results;