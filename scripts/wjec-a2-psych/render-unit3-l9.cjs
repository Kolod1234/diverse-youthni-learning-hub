/*
 * WJEC A2 Psychology, Lesson 9: The Scientific Status of Psychology and Synoptic Essays.
 * Diagrams for pages 3, 6 and 9.
 * Run: node scripts/wjec-a2-psych/render-unit3-l9.cjs
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK, TEAL } = H;

/* ---------- Page 3: Hallmarks of science & changing philosophy of science ---------- */
function scientificStatus() {
  const [c, x] = make(W, 1086);
  title2(x, 'Controversy 5: The scientific status of psychology');
  sub2(x, 'Empiricism, Popper falsifiability, Kuhn paradigms and the changing nature of science');

  const cols = [60, 516, 972], PW = 416, rows = [130, 490], PH = 320;
  const panels = [
    ['1. Classical empiricism', 'Wundt (1879) Leipzig lab and Watson (1913) behaviourism defined science through objective observation, operationalised variables, laboratory control, replication and predictability.', BLUE],
    ['2. Popper (1934) falsifiability', 'Karl Popper argued genuine science proceeds by deduction and refutation, not verification. A theory is scientific only if a conceivable observation could prove it false.', PURPLE],
    ['3. Kuhn (1962) paradigms', 'Thomas Kuhn argued mature sciences share a single paradigm until anomalies trigger a paradigm shift. Psychology may be pre-science or multi-paradigmatic (competing approaches).', GREEN],
    ['4. Changing nature of science', 'Modern science includes quantum indeterminacy, chaos theory, neuroimaging, open-science preregistration (Open Science Collaboration, 2015) and qualitative triangulation.', AMBER],
    ['5. Benefits of being a science', 'Secures NHS/MRC research funding, protects the public from pseudoscience, and yields evidence-based treatments (such as NICE-approved CBT and pharmacology).', RED],
    ['6. Costs of being a science', 'Laing (1960) and humanistic psychologists warn that mechanistic reductionism, determinism and artificial lab tasks strip away subjective meaning, agency and ecological validity.', DARK],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 16, py + 42, i + 1, p[0].replace(/^\d+\.\s*/, ''), p[2], 20);
    wrap(x, p[1], px + 24, px + PW - 24, py + 92, { size: 18, lh: 26 });
  });
  band(x, 850, 206, 'Why the replication crisis reshaped psychological science',
    'When the Open Science Collaboration (2015) replicated 100 psychological studies, only 36% produced statistically significant results compared to 97% originally. This prompted registered reports, larger sample sizes and open data, strengthening psychology scientific rigour.',
    { bodyY: 58 });
  return { file: 'psych-controversy-science-status.png' };
}

/* ---------- Page 6: Methodologies across the five approaches ---------- */
function approachesScience() {
  const [c, x] = make(W, 1086);
  title2(x, 'Methodologies of the five WJEC psychological approaches');
  sub2(x, 'Placing Biological, Behaviourist, Cognitive, Positive and Psychodynamic approaches on the scientific spectrum');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['Biological & Behaviourist', BLUE,
      'Biological: PET/fMRI scans (Raine et al., 1997), twin registries (Gottesman, 1991) and double-blind RCTs. High objectivity, replicability and Popperian falsifiability.',
      'Behaviourist: controlled lab conditioning (Watson & Rayner, 1920; Skinner, 1938) measuring observable stimulus-response links.',
      'Cost: mechanistic reductionism treats humans as biochemical machines or passive responders, ignoring conscious experience.'],
    ['Cognitive & Positive', PURPLE,
      'Cognitive: lab experiments (Loftus & Palmer, 1974; Baron-Cohen et al., 1985) using objective reaction times and error rates to make inferences about unobservable mental processes.',
      'Positive: psychometric questionnaires (Myers & Diener, 1995; Seligman, 2002) and mindfulness neuroscience (Davidson et al., 2003).',
      'Cost: cognitive inference cannot be observed directly, and positive self-report scales risk social desirability bias.'],
    ['Psychodynamic approach', RED,
      'Methodology: clinical case studies, dream analysis, free association and projective tests (Freud, 1909 Little Hans; Bowlby, 1944).',
      'Popper (1959) critique: unfalsifiable circularity—if a client accepts an interpretation it confirms repression; if they deny it, it confirms resistance.',
      'Benefit: rich idiographic insight into unconscious conflict and childhood experience that sterile laboratory tasks miss (Grunbaum, 1984; Solms, 2015 neuropsychoanalysis).'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 21);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25 });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
    text(x, 'Scientific verdict', px + PW / 2, y + 24, { size: 18, bold: true, color: AMBER });
    wrap(x, p[4], px + 24, px + PW - 24, y + 52, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'Why methodological pluralism is psychology strength',
    'Rather than forcing all human experience into one narrow positivist mould, psychology benefits from methodological pluralism: biological and cognitive lab experiments establish nomothetic causal mechanisms, while idiographic case studies and interviews preserve subjective human meaning.',
    { bodyY: 58 });
  return { file: 'psych-controversy-approaches-science.png' };
}

/* ---------- Page 9: Structuring a 25-mark Section B Controversy essay ---------- */
function synopticEssayBlueprint() {
  const [c, x] = make(W, 1086);
  title2(x, 'Blueprint for a 25-mark WJEC Unit 3 Section B Controversy essay');
  sub2(x, '10 marks AO1 (knowledge & understanding) + 15 marks AO3 (critical evaluation & synoptic synthesis)');

  const PW = 416, PH = 300, r1 = 130, r2 = 500;
  const top = [60, 516, 972], bot = [972, 516, 60];
  const steps = [
    ['1. Unpack the stem', 'Identify the exact controversy, any specific angle in the prompt (e.g. historical context, benefits vs costs), and define key technical terms in your opening paragraph.', 'Target: precise framing without generic throat-clearing.', BLUE],
    ['2. Historical & social roots', 'Anchor the controversy in how psychology developed over time (e.g. Wundt/Popper for science, Yerkes/Burt for ethics & culture, Freud/Gilligan for sexism).', 'Target: satisfy the specification historical context requirement.', PURPLE],
    ['3. Deploy AS Unit 1 & 2 evidence', 'Bring in classic studies and approaches from Year 1 (Milgram, Zimbardo, Bowlby, Ainsworth, Loftus, Raine, Watson) as concrete proof rather than descriptive summaries.', 'Target: genuine synoptic breadth across the qualification.', GREEN],
    ['4. Deploy A2 Unit 3 evidence', 'Connect the controversy to A2 behaviours and treatments (schizophrenia diagnosis across cultures, autism EMB gender ratios, Lovaas EIBI ethics, drug vs CBT trials).', 'Target: show real-world clinical and societal implications.', AMBER],
    ['5. Weigh competing arguments', 'Build a two-sided debate in every paragraph (e.g. scientific credibility vs reductionist loss of meaning; ethical protection vs ecological validity; difference vs bias).', 'Target: sustained AO3 critical judgement (15 marks).', RED],
    ['6. Nuanced conclusion', 'Reach an explicit, reasoned verdict that resolves the tension (e.g. Bateson cube, reflexivity, derived etics or methodological pluralism) rather than sitting on the fence.', 'Target: top-band evaluative synthesis.', DARK],
  ];
  const draw = (px, py, s, i) => {
    box(x, px, py, PW, PH);
    panelHeader(x, px + 16, py + 42, i + 1, s[0].replace(/^\d+\.\s*/, ''), s[3], 21);
    let y = wrap(x, s[1], px + 24, px + PW - 24, py + 92, { size: 17, lh: 25 });
    wrap(x, s[2], px + 24, px + PW - 24, y + 22, { size: 16, lh: 22, color: s[3], bold: true });
  };
  draw(top[0], r1, steps[0], 0); draw(top[1], r1, steps[1], 1); draw(top[2], r1, steps[2], 2);
  draw(bot[0], r2, steps[3], 3); draw(bot[1], r2, steps[4], 4); draw(bot[2], r2, steps[5], 5);
  arrow(x, top[0] + PW + 4, r1 + 150, top[1] - 4, r1 + 150, { color: GREY, lw: 4 });
  arrow(x, top[1] + PW + 4, r1 + 150, top[2] - 4, r1 + 150, { color: GREY, lw: 4 });
  arrow(x, top[2] + 208, r1 + PH + 4, top[2] + 208, r2 - 4, { color: GREY, lw: 4 });
  arrow(x, bot[0] - 4, r2 + 150, bot[1] + PW + 4, r2 + 150, { color: GREY, lw: 4 });
  arrow(x, bot[1] - 4, r2 + 150, bot[2] + PW + 4, r2 + 150, { color: GREY, lw: 4 });
  band(x, 846, 210, 'Common examiner warning on Unit 3 Section B',
    'WJEC examiners repeatedly note that candidates lose marks when they write pre-rehearsed descriptions of Milgram or Bowlby without tying every sentence back to the specific controversy word in the question. Use studies as evidence for an argument, never as standalone stories.',
    { bodyY: 58 });
  return { file: 'psych-controversy-essay-blueprint.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([scientificStatus, approachesScience, synopticEssayBlueprint], only);
  console.log(JSON.stringify(done));
})();
module.exports = { scientificStatus, approachesScience, synopticEssayBlueprint };