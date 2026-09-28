// AS 4 Brain Science — diagrams 8 and 9: brain imaging and neurological/mental-health disorders.
const { C, textCentered, textLeft, makeCanvas, title, save, arrow, roundRect, panelBox, chip, lead, setFont, dashedLine } = require('./common.cjs');

function panelHeader(ctx, x, w, name, tagline) {
  panelBox(ctx, x, 150, w, 560);
  textCentered(ctx, name, x + w / 2, 192, w - 40, 26, '700', C.accent);
  textCentered(ctx, tagline, x + w / 2, 224, w - 50, 16, '400', C.sub);
}

function renderImaging() {
  const W = 1500, H = 1000;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Three ways to watch the living brain',
    'Structure, activity or timing \u2014 each technique answers a different question');

  const panels = [
    { x: 80, w: 420, name: 'MRI', tag: 'magnetic resonance imaging' },
    { x: 540, w: 420, name: 'fMRI', tag: 'functional MRI' },
    { x: 1000, w: 420, name: 'EEG', tag: 'electroencephalogram' },
  ];
  panels.forEach((p) => panelHeader(ctx, p.x, p.w, p.name, p.tag));

  // --- MRI icon: scanner ring with a head inside ---
  ctx.strokeStyle = C.accent2;
  ctx.lineWidth = 26;
  ctx.beginPath(); ctx.arc(290, 360, 80, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.beginPath(); ctx.arc(290, 360, 34, 0, Math.PI * 2); ctx.fill();

  // --- fMRI icon: brain blob with active regions ---
  roundRect(ctx, 690, 310, 220, 130, 60);
  ctx.fillStyle = C.accentSoft;
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  ctx.stroke();
  for (const [cx, cy, r, col] of [[745, 355, 20, C.warn], [800, 395, 16, C.warn], [855, 345, 13, C.amber]]) {
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
  }

  // --- EEG icon: head with electrodes and a wave trace ---
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  ctx.beginPath(); ctx.arc(1210, 360, 55, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = C.accent2;
  for (const a of [-1.9, -1.1, -0.4, 0.4, 1.2]) {
    ctx.beginPath(); ctx.arc(1210 + 58 * Math.cos(a), 360 + 58 * Math.sin(a), 7, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = C.accent2;
  ctx.lineWidth = 3;
  ctx.beginPath();
  for (let i = 0; i <= 40; i++) {
    const x = 1130 + i * 4;
    const y = 445 - Math.sin(i * 0.7) * (8 + 6 * Math.sin(i * 0.23));
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();

  // Panel details.
  const rows = [
    {
      x: 80,
      lines: [
        ['What it measures', 'strong magnetic fields and radio waves'],
        ['Shows', 'structure \u2014 sharp, detailed anatomy'],
        ['Used for', 'tumours, bleeding, shrinkage, structural damage'],
      ],
      chip: 'spatial detail: excellent \u00b7 timing: none',
    },
    {
      x: 540,
      lines: [
        ['What it measures', 'blood flow to active regions \u2014 active areas use more oxygen'],
        ['Shows', 'function \u2014 which areas are working'],
        ['Used for', 'mapping tasks like speaking, moving, deciding'],
      ],
      chip: 'spatial detail: good \u00b7 timing: a few seconds behind',
    },
    {
      x: 1000,
      lines: [
        ['What it measures', 'electrical brain waves from electrodes on the scalp'],
        ['Shows', 'activity over time \u2014 the rhythm of the brain'],
        ['Used for', 'epilepsy, sleep stages, monitoring anaesthesia'],
      ],
      chip: 'timing: millisecond precision \u00b7 spatial detail: coarse',
    },
  ];
  rows.forEach((r) => {
    let y = 500;
    r.lines.forEach(([label, text]) => {
      textLeft(ctx, label, r.x + 34, y, r.x + 352, 15, '700', C.accent);
      const words = text.split(' ');
      let line = '', ly = y + 24;
      setFont(ctx, 16, '400');
      for (const wd of words) {
        const test = line ? line + ' ' + wd : wd;
        if (ctx.measureText(test).width > 340 && line) {
          textLeft(ctx, line, r.x + 34, ly, r.x + 352, 16, '400', C.sub);
          line = wd; ly += 24;
        } else line = test;
      }
      if (line) textLeft(ctx, line, r.x + 34, ly, r.x + 352, 16, '400', C.sub);
      y = ly + 42;
    });
    chip(ctx, r.chip, r.x + r.w / 2, 680, r.w - 60, C.amberSoft, C.sub, 14);
  });

  // Bottom band.
  panelBox(ctx, 90, 750, W - 180, 170, C.accentSoft);
  textCentered(ctx, 'MRI answers what the brain looks like. fMRI answers what is working. EEG answers exactly when it fires.', W / 2, 795, W - 260, 21, '700');
  textCentered(ctx, 'Choose the technique to match the question: a surgeon removing a tumour needs MRI; a researcher finding where speech lives uses fMRI;', W / 2, 838, W - 300, 18, '400', C.sub);
  textCentered(ctx, 'a clinician timing an epileptic seizure uses EEG. Temporal resolution means how finely a technique can separate moments in time.', W / 2, 868, W - 300, 18, '400', C.sub);

  save('as4-imaging.png', canvas);
}

function renderDisorders() {
  const W = 1500, H = 1000;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'When the brain fails: three disorders, three signatures',
    'Each has a measurable biological basis \u2014 and treatments that help');

  const cols = [
    {
      x: 80, name: 'ALZHEIMER\u2019S DISEASE', fill: C.accentSoft,
      rows: [
        ['What happens', 'Neurones degenerate and die, starting around the hippocampus and temporal lobe; the brain shrinks.'],
        ['Symptoms', 'Progressive memory loss, confusion, difficulty with language and familiar tasks, personality change.'],
        ['Scans show', 'An MRI reveals a shrinking cortex and enlarged, fluid-filled ventricles.'],
        ['Treatment', 'No cure yet \u2014 drugs and structured support slow the impact on daily life.'],
      ],
    },
    {
      x: 540, name: 'PARKINSON\u2019S DISEASE', fill: C.accent2Soft,
      rows: [
        ['What happens', 'Dopamine-producing neurones die in the brain\u2019s movement control pathways.'],
        ['Symptoms', 'Tremor, muscle stiffness and rigidity, slowed movement, poor balance.'],
        ['Scans show', 'Reduced activity in the movement circuits \u2014 dopamine signalling is the key marker.'],
        ['Treatment', 'Drugs that boost or replace dopamine; physiotherapy supports movement.'],
      ],
    },
    {
      x: 1000, name: 'DEPRESSION', fill: C.amberSoft,
      rows: [
        ['What happens', 'Disrupted regulation of neurotransmitters (including serotonin) and changes in mood circuits.'],
        ['Symptoms', 'Persistent low mood, loss of interest and pleasure, changes in sleep and appetite.'],
        ['Scans show', 'Altered activity in the frontal lobe and limbic mood circuits \u2014 depression is not \u201cjust attitude\u201d.'],
        ['Treatment', 'Medication and talking therapies such as CBT \u2014 usually combined, always monitored.'],
      ],
    },
  ];

  cols.forEach((col) => {
    panelBox(ctx, col.x, 150, 420, 660);
    chip(ctx, col.name, col.x + 210, 200, 380, col.fill, C.ink, 20);
    let y = 255;
    col.rows.forEach(([label, text]) => {
      textLeft(ctx, label, col.x + 30, y, col.x + 360, 15, '700', C.accent);
      const words = text.split(' ');
      let line = '', ly = y + 24;
      setFont(ctx, 16, '400');
      for (const wd of words) {
        const test = line ? line + ' ' + wd : wd;
        if (ctx.measureText(test).width > 350 && line) {
          textLeft(ctx, line, col.x + 30, ly, col.x + 360, 16, '400', C.sub);
          line = wd; ly += 23;
        } else line = test;
      }
      if (line) textLeft(ctx, line, col.x + 30, ly, col.x + 360, 16, '400', C.sub);
      y = ly + 42;
    });
  });

  // Bottom band.
  panelBox(ctx, 90, 840, W - 180, 110, C.okSoft);
  textCentered(ctx, 'None of these is a character flaw: all three are disorders with measurable biological changes.', W / 2, 878, W - 260, 21, '700');
  textCentered(ctx, 'All respond better to treatment started early \u2014 which is why brain science belongs in health care, not just in textbooks.', W / 2, 918, W - 300, 18, '400', C.sub);

  save('as4-disorders.png', canvas);
}

module.exports = { renderImaging, renderDisorders };