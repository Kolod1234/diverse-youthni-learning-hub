// Renders all LHS A2 7 "Oral Health and Dentistry" diagrams.
const common = require('./common.cjs');

require('./diag-01-mouth.cjs');
require('./diag-02-salivary-glands.cjs');
require('./diag-03-dentition.cjs');
require('./diag-04-tooth.cjs');
require('./diag-05-periodontium.cjs');
require('./diag-06-plaque.cjs');
require('./diag-07-stephan.cjs');
require('./diag-08-fluoride.cjs');
require('./diag-09-periodontal.cjs');
require('./diag-10-materials.cjs');

console.log('Rendered ' + common.results.length + ' diagrams into ' + common.OUT_DIR + ':');
common.results.forEach(r => console.log('  ' + r.name + '  (' + Math.round(r.bytes / 1024) + ' KB)'));