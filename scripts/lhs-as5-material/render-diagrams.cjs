// Renders all nine LHS AS 5 "Material Science" diagrams.
const { results } = require('./common.cjs');
const d01 = require('./diag-01-properties.cjs');
const d02 = require('./diag-02-classes.cjs');
const d03 = require('./diag-03-structure.cjs');
const d04 = require('./diag-04-alloys.cjs');
const d05 = require('./diag-05-biomaterials.cjs');
const d06 = require('./diag-06-osseointegration.cjs');
const d07 = require('./diag-07-smart.cjs');
const d08 = require('./diag-08-nano.cjs');
const d09 = require('./diag-09-semiconductors.cjs');

[d01, d02, d03, d04, d05, d06, d07, d08, d09].forEach((m) => m.render());

results.forEach((r) => {
  console.log(r.name + ' — ' + Math.round(r.bytes / 1024) + ' KB');
});
console.log('Rendered ' + results.length + ' AS 5 diagrams.');
module.exports = results;