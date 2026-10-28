/*
 * WJEC A2 Psychology, Lesson 14: Units 3 and 4 Examination Practice with Annotated Model Answers.
 * Diagrams for pages 3, 6 and 9.
 * Run: node scripts/wjec-a2-psych/render-unit4-l14.cjs
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK, TEAL } = H;

/* ---------- Page 3: WJEC A2 Assessment Objectives & Command Words ---------- */
function examArchitecture() {
  const [c, x] = make(W, 1086);
  title2(x, 'WJEC A2 Psychology examination architecture and assessment objectives');
  sub2(x, 'How AO1, AO2 and AO3 are weighted across Unit 3 (2 hr 30 min) and Unit 4 (1 hr 30 min)');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['AO1: Knowledge & Understanding', BLUE,
      'Command words: Describe, Outline, Explain, State, Identify.',
      'What earns top band: accurate psychological terminology, precise theoretical mechanisms (e.g. mesolimbic D2 down-regulation, Frith metarepresentation), and specific empirical details (author, year, procedure, findings).',
      'Where tested: Unit 3 Section A 10-mark "Describe two explanations" questions, Unit 3 Section B (10 of 25 marks), and Unit 4 definitions.'],
    ['AO2: Application to Context', PURPLE,
      'Command words: Apply, Suggest, Design, Explain how [character/scenario]..., Justify in the context of this study.',
      'What earns top band: every paragraph explicitly quotes and explains details from the stem (e.g. naming "Gio", "Liam" or the novel research variables) rather than pasting generic notes.',
      'Where tested: Unit 3 scenario-based modification questions and almost every question in Unit 4 Sections A and B.'],
    ['AO3: Evaluation & Analysis', GREEN,
      'Command words: Evaluate, Assess, To what extent, Discuss, Examine, Compare, Criticise.',
      'What earns top band: structured PEEEL arguments (Point, Evidence, Explanation, Counter-argument/Limitation, Link to judgement) weighing methodology, alternative explanations, determinism and ethics.',
      'Where tested: Unit 3 15-mark behaviour evaluations, Unit 3 25-mark Controversy essay (15 AO3 marks), and Unit 4 methodological critiques.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 19);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25, bold: true });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
    y = wrap(x, p[4], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'Time management across the two A2 papers',
    'Unit 3 (150 minutes, 100 marks = 1.5 minutes per mark): spend ~35 minutes on each of your three chosen Section A behaviours (75 marks total) and ~40 minutes on your chosen 25-mark Section B Controversy essay. Unit 4 (90 minutes, 60 marks = 1.5 minutes per mark): spend 45 minutes on Section A and 45 minutes on Section B.',
    { bodyY: 58 });
  return { file: 'psych-exam-architecture.png' };
}

/* ---------- Page 6: PEEEL evaluation structure for Unit 3 ---------- */
function unit3Rubric() {
  const [c, x] = make(W, 1086);
  title2(x, 'Climbing the mark bands in Unit 3 Section A and Section B');
  sub2(x, 'What separates Band 1/2 basic commentary from Band 4 thorough, sustained evaluation');

  const cols = [60, 516, 972], PW = 416, rows = [130, 490], PH = 320;
  const panels = [
    ['1. 10-mark AO1 explanations', 'Requires two explanations (e.g. one biological + one social, or two biological). Balance depth equally (~5 marks each): state core assumption, trace exact causal mechanism, and cite a supporting study.', BLUE],
    ['2. 15-mark AO3 evaluation', 'Evaluate the explanations or modification methods using empirical evidence, methodological flaws (sample, validity, correlation vs causation), theoretical debates (reductionism/determinism) and practical utility.', PURPLE],
    ['3. Scenario application questions', 'When a stem describes a person (e.g. "Sian hears critical voices and lives with hostile relatives"), link every sentence of your modification advice directly to Sian specific symptoms and circumstances.', GREEN],
    ['4. Avoiding "shopping-list" AO3', 'Listing five short, unelaborated bullet points ("small sample, ethnocentric, lab task") caps you in Band 2. Develop four deep PEEEL paragraphs that explain WHY each flaw weakens the theory.', AMBER],
    ['5. Evaluative comparison', 'Earn top-band credit by pitting explanations against each other: e.g. biological dopamine accounts explain positive symptoms well, whereas Frith cognitive model explains why voices are attributed externally.', RED],
    ['6. 25-mark Controversy synthesis', 'Keep the controversy keyword in every topic sentence, span multiple approaches and historical eras, and conclude with a reasoned resolution rather than an abrupt stop.', DARK],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 16, py + 42, i + 1, p[0].replace(/^\d+\.\s*/, ''), p[2], 20);
    wrap(x, p[1], px + 24, px + PW - 24, py + 92, { size: 18, lh: 26 });
  });
  band(x, 850, 206, 'The "So what?" test for every evaluation paragraph',
    'After citing a study or methodological flaw, always add a sentence beginning "Consequently, this matters because..." to explain how the evidence strengthens, restricts or modifies the psychological explanation under review.',
    { bodyY: 58 });
  return { file: 'psych-exam-unit3-rubric.png' };
}

/* ---------- Page 9: Unit 4 Applied Research Methods checklist ---------- */
function unit4Checklist() {
  const [c, x] = make(W, 1086);
  title2(x, 'High-yield checklist for Unit 4 Applied Research Methods');
  sub2(x, 'Avoiding the most common mark-losing errors in Section A and Section B');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['Section A: Personal investigations', BLUE,
      'Know both required WJEC investigations inside out: exact hypotheses, how variables/categories were operationalised, sample size and technique, and specific controls used.',
      'Be ready to explain ONE strength and ONE weakness of your sampling method, design and ethical procedures, with a concrete modification to improve validity or reliability.',
      'Never invent fake p-values as official laws; focus on the methodological reasoning behind your actual classroom investigation.'],
    ['Section B: Calculations & tests', PURPLE,
      'Show every working step for percentages, ratios, fractions, standard form, means, medians, modes, ranges and chi-squared/rank steps.',
      'Memorise the 3-point test justification (difference/correlation + design + level of measurement) and the R-rule (R = ≥ critical; no R = ≤ critical).',
      'Always state whether the hypothesis is one-tailed or two-tailed and quote the exact N or df when reading the critical value table.'],
    ['Section B: Novel scenarios', GREEN,
      'When identifying extraneous/confounding variables, explain HOW the variable would distort the specific DV in the stem, not just name "age" or "weather".',
      'When addressing ethical issues (deception, consent, protection from harm, confidentiality), propose a practical safeguard that preserves the integrity of the study.',
      'When designing a study, include operationalised variables, design, sampling, step-by-step procedure and controls so another researcher could replicate it.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 19);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25 });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
    y = wrap(x, p[4], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'Final check before turning the exam paper in',
    'Check that every hypothesis names both variables with their exact units of measurement, every graph has a title and labelled axes starting at zero, and every significance conclusion quotes both the observed statistic and the critical value from the table.',
    { bodyY: 58 });
  return { file: 'psych-exam-unit4-checklist.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([examArchitecture, unit3Rubric, unit4Checklist], only);
  console.log(JSON.stringify(done));
})();
module.exports = { examArchitecture, unit3Rubric, unit4Checklist };