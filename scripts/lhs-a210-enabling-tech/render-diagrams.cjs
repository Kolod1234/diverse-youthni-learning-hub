// Entry point: renders all ten A2 10 Enabling Technology diagrams.
const { OUT_DIR, results } = require('./common.cjs');
require('./diag-01-cycle.cjs');
require('./diag-02-equipment.cjs');
require('./diag-03-imaging.cjs');
require('./diag-04-mri.cjs');
require('./diag-05-pulse-ox.cjs');
require('./diag-06-ecg.cjs');
require('./diag-07-dialysis.cjs');
require('./diag-08-lab-workflow.cjs');
require('./diag-09-monitor-case.cjs');
require('./diag-10-filtering.cjs');

console.log('Rendered ' + results.length + ' diagrams to ' + OUT_DIR);
results.forEach((r) => console.log(' - ' + r.name + ' (' + Math.round(r.bytes / 1024) + ' KB)'));