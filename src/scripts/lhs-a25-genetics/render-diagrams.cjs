// Renders the 11 LHS A2 5 "Genetics, Stem Cell Research and Cloning" diagrams
// into public/lesson-assets/lhs-a2 at 2x scale and reports output sizes.
const dna = require('./diag-01-dna.cjs');
const inh = require('./diag-02-inheritance.cjs');
const ped = require('./diag-03-pedigree.cjs');
const tools = require('./diag-04-tools.cjs');

dna.drawDnaStructure();
dna.drawProteinSynthesis();
inh.drawMeiosis();
inh.drawMonohybrid();
inh.drawBloodGroups();
ped.drawPedigree();
ped.drawKaryotype();
tools.drawPcrGel();
tools.drawScreening();
tools.drawStemCells();
tools.drawScnt();

const H = require('./common.cjs');
console.log('Rendered', H.results.length, 'diagrams:');
for (const r of H.results) {
  console.log(' ', r.name, (r.bytes / 1024).toFixed(0) + ' KB');
}