/*
 * WJEC Level 3 Applied Certificate in Criminology — Unit 2 Criminological
 * Theories. Lesson 7: Biological theories of criminality.
 * Diagrams for pages 1, 5 and 7.
 * Run: node render-unit2-l7.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, text,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 1: the biological timeline ---------- */
function timeline() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'Biological criminology: from the born criminal to the laboratory');
  sub2(x, 'The family never died; it modernised. Each stage\u2019s claims were tested, the failures abandoned, the survivors refined');

  const xs = [40, 312, 584, 856, 1128], PW = 288, PY = 180, PH = 560;
  const stages = [
    ['1859\u20131876', BLUE, 'The founding',
      'Darwin\u2019s evolution makes humans organisms of nature; Lombroso\u2019s Criminal Man (1876) claims born criminals are evolutionary throwbacks, marked by stigmata.',
      'Tested by Goring (1913): no criminal type found.'],
    ['1940s', GREEN, 'The physique',
      'Sheldon\u2019s somatotypes classify bodies as endomorph, mesomorph, ectomorph, and find delinquents disproportionately mesomorphic.',
      'Correlation without mechanism: class, visibility and lifestyle confound it.'],
    ['1970s\u201380s', PURPLE, 'The natural experiments',
      'Twin studies (Lange 1929, Christiansen 1977) and adoption studies (Mednick et al. 1984) separate heredity from upbringing: a convicted biological parent raises adoptee risk.',
      'Concordance never near 100%: contribution, not destiny.'],
    ['1993\u20132002', AMBER, 'Genes meet environments',
      'Brunner (1993): the MAOA mutation and aggression. Caspi et al. (2002): the low-activity MAOA variant raises antisocial risk only when childhood maltreatment triggers it.',
      'Vulnerability switched by environment: nature needs nurture.'],
    ['Today', RED, 'The laboratory',
      'Neurochemistry (serotonin, dopamine, testosterone, cortisol) and brain imaging: Raine et al. (1997) find prefrontal and amygdala differences in insanity-pleading murderers.',
      'Group differences in filtered samples: risk, never diagnosis.'],
  ];
  stages.forEach((s, i) => {
    const px = xs[i];
    box(x, px, PY, PW, PH);
    text(x, s[0], px + PW / 2, PY + 34, { size: 17, bold: true, color: s[1] });
    text(x, s[2], px + PW / 2, PY + 62, { size: 15, bold: true, color: DARK });
    const ny = wrap(x, s[3], px + 20, px + PW - 20, PY + 96, { size: 13.5, lh: 18 });
    x.strokeStyle = LIGHT; x.lineWidth = 2;
    x.beginPath(); x.moveTo(px + 20, ny + 10); x.lineTo(px + PW - 20, ny + 10); x.stroke();
    wrap(x, s[4], px + 20, px + PW - 20, ny + 34, { size: 13, lh: 17, color: GREY });
  });

  band(x, 774, 278, 'The arc in one sentence',
    'The family\u2019s crude nineteenth-century claims were refuted and abandoned, atavism by Goring, somatotypes by confounding, while its modern descendants, heredity as a contributing factor, MAOA vulnerabilities switched by maltreatment, measurable brain differences in specific populations, are active research today; the story is not a dead theory but a research programme learning humility: from the born criminal to the switched vulnerability, from destiny to risk, from classification to treatment.',
    { bodyY: 56 });
  return { file: 'crim-biological-timeline.png' };
}

/* ---------- Page 5: the MAOA gene-environment interaction ---------- */
function geneEnvironment() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'The MAOA interaction: a vulnerability the environment switches');
  sub2(x, 'After Caspi et al. (2002), Dunedin cohort: the gene\u2019s effect depends on childhood maltreatment');

  // bar chart panel
  const PX = 200, PY = 140, PW = 1048, PH = 560;
  box(x, PX, PY, PW, PH, { fill: '#fff' });
  const base = PY + PH - 70, maxH = 380;
  const bars = [
    ['High-activity MAOA\nno maltreatment', 0.34, GREEN, 'Low'],
    ['High-activity MAOA\nmaltreated', 0.55, AMBER, 'Moderate'],
    ['Low-activity MAOA\nno maltreatment', 0.45, BLUE, 'Low'],
    ['Low-activity MAOA\nmaltreated', 1.0, RED, 'Highest'],
  ];
  const bw = 150, gap = (PW - 120 - 4 * bw) / 3;
  bars.forEach((b, i) => {
    const bx = PX + 60 + i * (bw + gap);
    const bh = b[1] * maxH;
    x.fillStyle = b[2];
    x.fillRect(bx, base - bh, bw, bh);
    x.strokeStyle = b[2]; x.lineWidth = 3;
    x.strokeRect(bx, base - bh, bw, bh);
    const label = b[0].split('\n');
    text(x, label[0], bx + bw / 2, base + 30, { size: 14.5, bold: true, color: DARK });
    text(x, label[1], bx + bw / 2, base + 52, { size: 14.5, color: SOFT });
    text(x, b[3], bx + bw / 2, base - bh - 18, { size: 17, bold: true, color: b[2] });
  });
  x.strokeStyle = GREY; x.lineWidth = 3;
  x.beginPath(); x.moveTo(PX + 50, base); x.lineTo(PX + PW - 30, base); x.stroke();
  text(x, 'Relative antisocial risk in the cohort', PX + PW / 2, PY + 40, { size: 16, bold: true, color: SOFT });

  band(x, 736, 316, 'Why this is the family\u2019s central result',
    'Among boys never maltreated, the two gene groups barely differ: the variant alone predicts almost nothing. Only where severe childhood maltreatment occurs does the low-activity variant mark out elevated antisocial risk, roughly double that of maltreated boys with the high-activity gene. The finding is longitudinal, cohort-based and repeated elsewhere, and it converts the born-criminal logic into conditional risk: heredity supplies a vulnerability, and the environment decides whether it is realised, which makes the biological and social families partners rather than rivals, and child protection the policy the finding itself demands.',
    { bodyY: 56 });
  return { file: 'crim-gene-environment.png' };
}

/* ---------- Page 7: the brain on crime ---------- */
function brainCrime() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'The brain on crime: the two regions carrying the evidence');
  sub2(x, 'Mechanism, landmark study, and the limits any citation must carry');

  const LX = 60, LW = 660, PY = 130, PH = 400;
  box(x, LX, PY, LW, PH);
  panelHeader(x, LX + 22, PY + 42, 1, 'The prefrontal cortex: the executive', BLUE, 20);
  wrap(x, 'Behind the forehead: planning, weighing consequences, inhibiting impulses, the adult brake on raw urges. Phineas Gage (1848) survived an iron rod through the region and became disinhibited, impulsive and unrecognisable in character, the founding case for what frontal damage does. Modern prisons hold high rates of unrecognised head injury, and frontal injury is associated with exactly the poor impulse control and shortsighted decisions that offending requires.',
    LX + 28, LX + LW - 28, PY + 92, { size: 15.5, lh: 22, align: 'left' });

  const RX = 760, RW = 628;
  box(x, RX, PY, RW, PH);
  panelHeader(x, RX + 22, PY + 42, 2, 'The amygdala: the fear learner', PURPLE, 20);
  wrap(x, 'Deep in the temporal lobe: processing fear and emotional learning, the structure through which a child learns that harm is to be feared. An under-reactive amygdala means weak fear conditioning, the child who never learned to flinch, and amygdala abnormality appears repeatedly in studies of violent groups, including Raine\u2019s insanity-pleading murderers.',
    RX + 28, RX + RW - 28, PY + 92, { size: 15.5, lh: 22 });

  // Raine study panel
  const RY = 560, RH = 200;
  box(x, LX, RY, LW + 72, RH, { fill: '#eff6ff', stroke: '#bfdbfe' });
  text(x, 'The landmark study: Raine, Buchsbaum and LaCasse (1997)', LX + 36, RY + 34, { size: 17.5, bold: true, color: BLUE });
  wrap(x, 'Positron emission tomography compared forty-one murderers pleading not guilty by reason of insanity with matched controls: reduced prefrontal activity and amygdala abnormalities in the murderers\u2019 group.',
    LX + 36, LX + LW + 8, RY + 66, { size: 15, lh: 21 });

  const CY = 560;
  box(x, 828, CY, 560, RH, { fill: '#fef2f2', stroke: '#fecaca' });
  text(x, 'The limits any citation must carry', 1108, CY + 34, { size: 17.5, bold: true, color: RED });
  wrap(x, 'A legally filtered sample, the insanity plea, mental illness, substance histories; a group difference, not individual diagnosis; damage measured after the lives that may have caused it. Associated with, never caused.',
    852, 1364, CY + 66, { size: 15, lh: 21 });

  band(x, 792, 262, 'Describing a brain is not describing a destiny',
    'The brain evidence earns its place as a contributing factor, the level of explanation beneath the social one, and its clearest yield is humane: screening for and treating head injury and neurodisability in a justice system that holds them in large numbers. The interpretive leap from structure to responsibility is philosophy, not science: a brain that supports poor impulse control describes a difficult life, never a destiny.',
    { bodyY: 56 });
  return { file: 'crim-brain-crime.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([timeline, geneEnvironment, brainCrime], only);
  console.log(JSON.stringify(done));
})();
module.exports = { timeline, geneEnvironment, brainCrime };