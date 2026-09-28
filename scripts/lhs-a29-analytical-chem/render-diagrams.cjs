// Renders all LHS A2 9 "Analytical Chemistry Techniques" diagrams.
require('./diag-01-cations.cjs');
require('./diag-02-anions.cjs');
require('./diag-03-functional-groups.cjs');
require('./diag-04-tlc.cjs');
require('./diag-05-gc.cjs');
require('./diag-06-hplc.cjs');
require('./diag-07-titration.cjs');
require('./diag-08-colorimetry.cjs');
require('./diag-09-ir.cjs');
require('./diag-10-ms.cjs');

const { results, OUT_DIR } = require('./common.cjs');
console.log('Rendered ' + results.length + ' diagrams to ' + OUT_DIR);
results.forEach((r) => console.log('  ' + r.name + '  (' + Math.round(r.bytes / 1024) + ' KB)'));