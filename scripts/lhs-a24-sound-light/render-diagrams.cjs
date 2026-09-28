// Runner: renders all ten LHS A2 4 "Sound and Light" diagrams.
const d1 = require('./diag-01-waves.cjs');
const d2 = require('./diag-02-ear.cjs');
const d3 = require('./diag-03-refraction.cjs');
const d4 = require('./diag-04-fibres.cjs');
const d5 = require('./diag-05-eye.cjs');

d1.drawSoundWave();
d1.drawWaveBehaviour();
d2.drawDecibelScale();
d2.drawEar();
d3.drawHearingRange();
d3.drawRefraction();
d4.drawTIR();
d4.drawEndoscope();
d5.drawEye();
d5.drawVisionCorrection();

for (const r of H.results) {
  console.log(r.name + '  ' + (r.bytes / 1024).toFixed(1) + ' KB');
}