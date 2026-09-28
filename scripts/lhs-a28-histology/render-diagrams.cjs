// Renders all LHS A2 8 "Histology and Pathology" diagrams.
const common = require('./common.cjs');

require('./diag-01-departments.cjs');
require('./diag-02-accessioning.cjs');
require('./diag-03-fixation.cjs');
require('./diag-04-processing.cjs');
require('./diag-05-microtomy.cjs');
require('./diag-06-he-stain.cjs');
require('./diag-07-light-microscope.cjs');
require('./diag-08-magnification.cjs');
require('./diag-09-pathology.cjs');
require('./diag-10-tumours.cjs');

console.log('Rendered ' + common.results.length + ' diagrams into ' + common.OUT_DIR + ':');
common.results.forEach(r => console.log('  ' + r.name + '  (' + Math.round(r.bytes / 1024) + ' KB)'));