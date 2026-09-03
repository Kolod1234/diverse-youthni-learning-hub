/* Temporary visual probe: renders three representative layouts so the
   house style can be eyeballed before the full lesson sets are ported. */
const fs = require('fs');
const path = require('path');
const K = require('./diagkit.js');
const { newSheet, TEAL, BLUE, INDIGO, AMBER, RED, SLATE, GREY } = K;

const OUT = process.argv[2] || '/tmp/probe';
fs.mkdirSync(OUT, { recursive: true });

// ---- 1. the negative-feedback loop (boxes + arrows + dashed return path)
{
  const d = newSheet('Negative feedback holds a controlled factor in its set range');
  const P = [[37,330],[286,330],[535,330],[535,186],[286,186],[37,186]];
  const T = ['Controlled factor RISES above the set range',
             'SENSOR detects the change and its direction',
             'CO-ORDINATOR compares it with the set range',
             'EFFECTOR is switched on',
             'RESPONSE lowers the factor back down',
             'Deviation SHRINKS, so correction is switched down'];
  const C = [RED, BLUE, INDIGO, AMBER, TEAL, TEAL];
  P.forEach((p,i)=> d.box(p[0],p[1],188,62,T[i],C[i],10.5));
  d.arrow([225,361],[286,361]); d.arrow([474,361],[535,361]);
  d.arrow([629,330],[629,248]); d.arrow([535,217],[474,217]); d.arrow([286,217],[225,217]);
  d.arrow([131,186],[131,142]);
  d.plot([[131,128],[629,128]], { colour: TEAL, lw: 1.6, dashed: true });
  d.plot([[131,142],[131,128]], { colour: SLATE, lw: 1.8 });
  d.arrow([629,128],[629,186], TEAL, 2.0, { dashed: true });
  d.fitlabel(380,100,700,'NEGATIVE FEEDBACK - the returning factor reduces the sensor signal, so correction is turned down', TEAL, 10.5, true);
  d.caption('The response always acts AGAINST the original change, and is switched down as the factor returns. That is what prevents over-correction.', { y:56, size:10 });
  fs.writeFileSync(path.join(OUT,'probe-01.png'), d.buffer());
}

// ---- 2. definition cards (tests the two-column fit inside one row)
{
  const d = newSheet('The nine terms this lesson depends on');
  d.cards([
    ['Homeostasis','maintenance of a constant internal state within tolerable limits'],
    ['Controlled factor','the internal variable being regulated'],
    ['Sensor','receptor that monitors the controlled factor'],
    ['Corrective mechanism','the response that regulates the factor'],
    ['Effector','cell, tissue or organ that carries out the correction'],
    ['Negative feedback','reduces the deviation and stops correction as the factor is restored'],
    ['Set range','an acceptable interval, not one fixed number']
  ], { y0:336, x:32, w:696, rowh:42, gap:7, colour:INDIGO, size:10 });
  d.caption('Over-correction = a response continuing beyond the regulated state.   Dynamic equilibrium = continual small adjustments around a stable condition.', { y:34, size:9.5 });
  fs.writeFileSync(path.join(OUT,'probe-02.png'), d.buffer());
}

// ---- 3. numbered steps + chain + axes (tests every remaining helper)
{
  const d = newSheet('What you must be able to do by the end of this lesson');
  d.steps(['Define homeostasis as maintenance of a constant state',
           'Identify the sensor and the corrective mechanism',
           'Explain negative feedback',
           'Apply feedback reasoning to an unfamiliar variable'],
          { x:40, y0:336, w:680, rowh:40, gap:10, colour:TEAL, size:11 });
  d.label(380,160,'You should already know', SLATE, 11.5, { bold:true });
  d.chain(['Cells work only within limited conditions','Receptors detect stimuli','Effectors produce responses'],
          { y:88, x0:40, x1:720, h:56, colour:GREY, size:9.5 });
  fs.writeFileSync(path.join(OUT,'probe-03.png'), d.buffer());
}

// ---- 4. a plotted curve against axes
{
  const d = newSheet('The factor oscillates in a narrow band around the set point');
  d.axesbox(90, 90, 600, 250, { xlabel:'time', ylabel:'controlled factor' });
  d.plot([[90,300],[690,300]], { colour: GREY, lw:1.4, dashed:true });
  d.plot([[90,215],[690,215]], { colour: GREY, lw:1.4, dashed:true });
  const pts=[]; for(let i=0;i<=120;i++){ const x=90+i*5;
    pts.push([x, 258 + 30*Math.sin(i/6) + 8*Math.sin(i/2.1)]); }
  d.plot(pts, { colour: TEAL, lw: 2.0 });
  d.label(700,300,'upper limit', SLATE, 9.5, { ha:'right' });
  d.label(700,215,'lower limit', SLATE, 9.5, { ha:'right' });
  d.caption('Homeostasis is a dynamic equilibrium: the value never stops moving, but it stays inside the set range.', { y:40, size:10 });
  fs.writeFileSync(path.join(OUT,'probe-04.png'), d.buffer());
}

const files = fs.readdirSync(OUT).filter(f=>f.endsWith('.png'));
for (const f of files) console.log(f, fs.statSync(path.join(OUT,f)).size, 'bytes');
