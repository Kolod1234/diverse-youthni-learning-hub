// Renders all eleven LHS AS 6 "Medicine, Drugs and Clinical Trials" diagrams.
const { results } = require('./common.cjs');
const d01 = require('./diag-01-medicine-structure.cjs');
const d02 = require('./diag-02-legal.cjs');
const d03 = require('./diag-03-categories.cjs');
const d04 = require('./diag-04-preclinical.cjs');
const d05 = require('./diag-05-phases.cjs');
const d06 = require('./diag-06-trial-design.cjs');
const d07 = require('./diag-07-adme.cjs');
const d08 = require('./diag-08-halflife.cjs');
const d09 = require('./diag-09-receptors.cjs');
const d10 = require('./diag-10-calibration.cjs');
const d11 = require('./diag-11-doseresponse.cjs');

[d01, d02, d03, d04, d05, d06, d07, d08, d09, d10, d11].forEach((m) => m.render());

results.forEach((r) => {
  console.log(r.name + ' — ' + Math.round(r.bytes / 1024) + ' KB');
});
console.log('Rendered ' + results.length + ' AS 6 diagrams.');
module.exports = results;