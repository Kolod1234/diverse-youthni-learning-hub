// Renders all nine LHS AS 4 "Brain Science" diagrams and reports their sizes.
const { results } = require('./common.cjs');
const { renderNeurone } = require('./diag-01-neurone.cjs');
const { renderActionPotential } = require('./diag-02-impulse.cjs');
const { renderSynapse, renderReflexArc } = require('./diag-03-synapse.cjs');
const { renderBrainLobes, renderStressResponse } = require('./diag-04-brain.cjs');
const { renderMemoryModel } = require('./diag-05-memory.cjs');
const { renderImaging, renderDisorders } = require('./diag-06-imaging.cjs');

renderNeurone();
renderActionPotential();
renderSynapse();
renderReflexArc();
renderBrainLobes();
renderStressResponse();
renderMemoryModel();
renderImaging();
renderDisorders();

results.forEach((r) => console.log(r.name + ': ' + Math.round(r.bytes / 1024) + ' KB'));
module.exports = { results };