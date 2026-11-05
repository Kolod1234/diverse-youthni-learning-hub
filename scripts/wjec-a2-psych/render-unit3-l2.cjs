/*
 * WJEC A2 Psychology, Lesson 2: Autistic Spectrum Behaviours: Explanations and Modification.
 * Diagrams for pages 3, 6 and 9.
 * Run: node scripts/wjec-a2-psych/render-unit3-l2.cjs
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK, TEAL } = H;

/* ---------- Page 3: Empathising-Systemising & Extreme Male Brain ---------- */
function embModel() {
  const [c, x] = make(W, 1086);
  title2(x, 'Baron-Cohen Extreme Male Brain and E-S Profile');
  sub2(x, 'Biological and hormonal accounts of sex differences in autistic spectrum behaviours');

  const cols = [60, 516, 972], PW = 416, rows = [130, 490], PH = 320;
  const panels = [
    ['1. Empathising (E)', 'The drive to identify another person mental states and respond with an appropriate emotion. Baron-Cohen (2002) argues females on average score higher on E measures.', BLUE],
    ['2. Systemising (S)', 'The drive to analyse and construct rule-based systems (input-operation-output) to predict how things work. Males on average score higher on S measures.', PURPLE],
    ['3. Brain types', 'Type E (E > S, more common in females), Type B (E = S, balanced), Type S (S > E, more common in males), and Extreme Type S (S >> E, autistic profile).', GREEN],
    ['4. Foetal testosterone', 'Auyeung et al. (2009) measured amniotic fluid testosterone and found higher prenatal levels correlated positively with later autistic traits on the CAST and AQ.', AMBER],
    ['5. Genetic heritability', 'Twin studies (Bailey et al., 1995: 60% MZ vs 0% DZ concordance; Tick et al., 2016 meta-analysis) show strong polygenic heritability and neural connectivity differences.', RED],
    ['6. Critical evaluation', 'Greenberg et al. (2018) supported E-S shifts in 670,000 adults, but Ridout et al. and Fine (2010) warn of diagnostic bias under-identifying camouflaging females.', DARK],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 16, py + 42, i + 1, p[0].replace(/^\d+\.\s*/, ''), p[2], 22);
    wrap(x, p[1], px + 24, px + PW - 24, py + 92, { size: 18, lh: 26 });
  });
  band(x, 850, 206, 'Why the gender ratio in diagnosis is debated',
    'Historically, four males were diagnosed for every one female (Wing, 1981). While the Extreme Male Brain theory attributes this to prenatal androgen exposure, social and diagnostic critiques (Gould & Ashton-Smith, 2011) show that assessment tools were normed on male samples and many autistic girls mask social difficulties.',
    { bodyY: 58 });
  return { file: 'psych-autism-emb-model.png' };
}

/* ---------- Page 6: Cognitive / individual differences explanations ---------- */
function cognitiveModels() {
  const [c, x] = make(W, 1086);
  title2(x, 'Cognitive and social explanations of autistic spectrum behaviours');
  sub2(x, 'Comparing Theory of Mind, Weak Central Coherence and the discredited psychogenic account');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['Theory of Mind (ToM)', BLUE,
      'Core claim: Baron-Cohen, Leslie & Frith (1985) proposed that autistic individuals experience mindblindness, a difficulty attributing independent beliefs and desires to others.',
      'Key evidence: Sally-Anne false-belief test (80% of neurotypical and 86% of Down syndrome children passed, vs 20% of autistic children) and the Eyes Task (Baron-Cohen et al., 1997).',
      'Evaluation: explains social communication challenges, but 20% passed Sally-Anne and it cannot explain repetitive behaviours or savant skills.'],
    ['Weak Central Coherence', PURPLE,
      'Core claim: Frith (1989) and Happé & Frith (2006) argue that autistic perception favours local detail-focused processing over global context integration.',
      'Key evidence: Shah & Frith (1983, 1993) showed superior autistic performance on the Children Embedded Figures Test and Block Design tasks.',
      'Evaluation: frames autism as a cognitive style with genuine strengths rather than a pure deficit, though Mottron et al. (2006) prefer Enhanced Perceptual Functioning.'],
    ['Social & historical accounts', RED,
      'Core claim: Kanner (1943) noted cold parental traits and Bettelheim (1967) popularised the refrigerator mother hypothesis blaming maternal emotional distance; later replaced by socialisation/cultural norm perspectives.',
      'Key evidence: Folstein & Rutter (1977) twin studies and Rimland (1964) refuted parental causation completely, showing neurodevelopmental origins.',
      'Evaluation: a vital warning on socially sensitive research; Bettelheim caused severe parental guilt based on unscientific clinical speculation.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 21);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25 });
    text(x, 'Empirical evidence', px + PW / 2, y + 24, { size: 18, bold: true, color: p[1] });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 52, { size: 17, lh: 24, color: SOFT });
    text(x, 'Evaluation', px + PW / 2, y + 24, { size: 18, bold: true, color: AMBER });
    wrap(x, p[4], px + 24, px + PW - 24, y + 52, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'Why a multi-domain account is needed',
    'No single cognitive theory explains the full diagnostic triad/dyad of autism. Happé, Ronald & Plomin (2006) argue for fractionable traits: Theory of Mind accounts for social interaction differences, while Weak Central Coherence and executive functioning better account for detail focus and preference for sameness.',
    { bodyY: 58 });
  return { file: 'psych-autism-cognitive-models.png' };
}

/* ---------- Page 9: PECS and EIBI modification methods ---------- */
function modificationAutism() {
  const [c, x] = make(W, 1086);
  title2(x, 'Modifying and supporting autistic spectrum behaviours');
  sub2(x, 'Picture Exchange Communication System (PECS) and Early Intensive Behavioural Intervention (EIBI)');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['PECS (Bondy & Frost, 1994)', BLUE,
      'Six structured phases: (1) physical exchange of picture card for item, (2) expanding spontaneity and distance, (3) picture discrimination, (4) sentence strip ("I want..."), (5) answering "What do you want?", (6) commenting.',
      'Evidence: Charlop-Christy et al. (2002) and Howlin et al. (2007) RCT showed increased functional communication and reduced frustration, though spoken language gains varied.',
      'Strength: child-initiated, low-cost, immediately usable by non-speaking learners in school and home.'],
    ['EIBI / Lovaas (1987) ABA', PURPLE,
      'Mechanism: operant conditioning using Discrete Trial Training (DTT). Desired social and language behaviours are shaped via positive reinforcement; 40 hours per week for 2+ years.',
      'Evidence: Lovaas (1987) reported 47% of the intensive group achieved mainstream placement vs 2% of controls; Reichow (2012) meta-analysis found moderate IQ and adaptive gains.',
      'Limitation: Lovaas (1987) lacked random allocation and used aversive punishment originally; 40 hours/week is exhausting and expensive.'],
    ['Neurodiversity & ethics', GREEN,
      'Focus of modification: modern ethical practice distinguishes supporting functional communication (PECS) from forcing neurotypical compliance or suppressing harmless stimming.',
      'Social validity: Kirkham (2017) and autistic self-advocates highlight that conditioning children to mask natural behaviours can increase anxiety and lower wellbeing.',
      'Best practice: person-centred adjustments, sensory-friendly environments and functional communication rather than normalisation.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 20);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25 });
    text(x, 'Research findings', px + PW / 2, y + 24, { size: 18, bold: true, color: p[1] });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 52, { size: 17, lh: 24, color: SOFT });
    text(x, 'Critical judgement', px + PW / 2, y + 24, { size: 18, bold: true, color: AMBER });
    wrap(x, p[4], px + 24, px + PW - 24, y + 52, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'Comparing PECS and EIBI in exam questions',
    'Both PECS and EIBI draw on behaviourist operant principles (positive reinforcement), but PECS targets functional communication in six manageable stages whereas EIBI attempts global behavioural reshaping across 40 hours a week. Examiners credit answers that weigh practical feasibility, methodological flaws in Lovaas (1987) and ethical debates.',
    { bodyY: 58 });
  return { file: 'psych-autism-modification.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([embModel, cognitiveModels, modificationAutism], only);
  console.log(JSON.stringify(done));
})();
module.exports = { embModel, cognitiveModels, modificationAutism };