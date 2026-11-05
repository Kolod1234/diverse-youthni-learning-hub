/*
 * WJEC A2 Psychology, Lesson 13: Reliability, Validity, Sampling and Ethics in Novel Research Scenarios.
 * Diagrams for pages 3, 6 and 9.
 * Run: node scripts/wjec-a2-psych/render-unit4-l13.cjs
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK, TEAL } = H;

/* ---------- Page 3: Reliability & Validity types ---------- */
function reliabilityValidity() {
  const [c, x] = make(W, 1086);
  title2(x, 'Reliability and validity in novel research scenarios');
  sub2(x, 'Assessing and improving consistency (reliability) and truth/accuracy (validity)');

  const cols = [60, 516, 972], PW = 416, rows = [130, 490], PH = 320;
  const panels = [
    ['1. Internal & external reliability', 'Internal reliability: consistency across items within a test (assessed via split-half method). External reliability: consistency across occasions (test-retest) or observers (inter-rater reliability ≥ +0.80).', BLUE],
    ['2. Improving reliability', 'Rewrite ambiguous questionnaire items, operationalise behavioural categories precisely, train observers together on pilot footage, and standardise environmental conditions.', PURPLE],
    ['3. Internal validity', 'Whether changes in the DV were genuinely caused by the IV rather than confounding variables, demand characteristics or investigator effects.', GREEN],
    ['4. Construct & concurrent validity', 'Construct validity: whether an operationalised tool measures the full theoretical construct. Concurrent validity: whether a new test correlates (+0.80) with an established gold-standard measure.', AMBER],
    ['5. Ecological & temporal validity', 'Ecological validity (mundane realism): whether findings generalise to real-world settings outside the lab. Population validity: generalising across groups. Temporal validity: across historical eras.', RED],
    ['6. Reliability-validity trade-off', 'Tightening laboratory control boosts internal reliability and internal validity, but often makes the task artificial, lowering ecological validity and mundane realism.', DARK],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 16, py + 42, i + 1, p[0].replace(/^\d+\.\s*/, ''), p[2], 20);
    wrap(x, p[1], px + 24, px + PW - 24, py + 92, { size: 18, lh: 26 });
  });
  band(x, 850, 206, 'Distinguishing assessment from improvement in Unit 4 Section B',
    'Examiners warn that candidates frequently muddle "How would you assess reliability?" with "How would you improve reliability?". You assess reliability using test-retest, split-half or inter-rater correlations; you improve reliability by standardising procedures, refining coding categories or removing ambiguous items.',
    { bodyY: 58 });
  return { file: 'psych-unit4-reliability-validity.png' };
}

/* ---------- Page 6: Sampling methods comparison ---------- */
function samplingMethods() {
  const [c, x] = make(W, 1086);
  title2(x, 'Five sampling techniques: mechanics, strengths and biases');
  sub2(x, 'Selecting participants from a target population in Unit 4 novel scenarios');

  const cols = [60, 516, 972], PW = 416, rows = [130, 490], PH = 320;
  const panels = [
    ['1. Random sampling', 'Every member of the target population has an equal chance of selection (e.g. complete sampling frame + random number generator). Unbiased, but requires a full list and refusals reintroduce bias.', BLUE],
    ['2. Systematic sampling', 'Every nth person is chosen from an ordered list (interval k = N / n). Simple and objective, but risks periodic bias if the list has a hidden pattern and still needs a full frame.', PURPLE],
    ['3. Stratified sampling', 'Identify sub-groups (strata, e.g. age or gender) in the population and randomly sample from each in exact proportion. Most representative method, though time-consuming.', GREEN],
    ['4. Opportunity sampling', 'Recruiting whoever is available and willing at the time (e.g. sixth-form students in the canteen). Fast and cheap, but unrepresentative and prone to researcher selection bias.', AMBER],
    ['5. Volunteer / self-selected', 'Participants respond to an advert or online post. Easy access to specific populations, but suffers from volunteer bias (Rosenthal & Rosnow, 1975: more cooperative, inquisitive participants).', RED],
    ['6. Snowball & quota variants', 'Snowball sampling (participants recruit peers) is vital for hidden populations such as illicit drug users or offenders, though sample diversity is limited to one social network.', DARK],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 16, py + 42, i + 1, p[0].replace(/^\d+\.\s*/, ''), p[2], 21);
    wrap(x, p[1], px + 24, px + PW - 24, py + 92, { size: 18, lh: 26 });
  });
  band(x, 850, 206, 'Why random sampling is not the same as random allocation',
    'Random sampling selects who participates in the study from the target population (boosting population validity). Random allocation assigns already-recruited participants to Condition A or Condition B in an independent groups design (controlling participant variables to boost internal validity).',
    { bodyY: 58 });
  return { file: 'psych-unit4-sampling-methods.png' };
}

/* ---------- Page 9: Non-experimental methods in novel scenarios ---------- */
function novelMethodsGrid() {
  const [c, x] = make(W, 1086);
  title2(x, 'Applying research methodologies to novel scenarios');
  sub2(x, 'Experiments, observations, self-reports, case studies and content analysis');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['Experiments (Lab, Field, Natural)', BLUE,
      'Lab: full IV manipulation and control of extraneous variables -> high internal validity and replicability, lower ecological validity.',
      'Field: IV manipulated in a natural setting -> higher mundane realism, harder to control extraneous variables or obtain prior informed consent.',
      'Natural / Quasi: IV varies naturally (e.g. gender, institutionalisation) -> enables study of variables unethical/impossible to manipulate, but no random allocation to conditions.'],
    ['Observations (Event vs Time)', PURPLE,
      'Naturalistic vs controlled; overt vs covert (covert reduces reactivity/Hawthorne effect but raises privacy ethics); participant vs non-participant.',
      'Structured sampling: Event sampling counts every occurrence of specified behavioural categories; Time sampling records behaviour at fixed intervals (e.g. every 30 seconds).',
      'Key requirement: categories must be operationalised, mutually exclusive and exhaustive so two observers achieve inter-rater reliability.'],
    ['Interviews & Questionnaires', GREEN,
      'Structured interview / closed questionnaire: fixed questions and preset options -> easy to quantify and reliable across interviewers, but restricts depth.',
      'Semi-structured / unstructured interview: follow-up probes uncover rich qualitative reasons and unexpected insights, but risks interviewer bias and social desirability.',
      'Questionnaire design: avoid leading questions, double-barrelled items, jargon and prestige bias; include filler items and balanced Likert scales.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 19);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25 });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
    y = wrap(x, p[4], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'How to tackle "Design a follow-up study" questions in Unit 4',
    'When asked to design a study in Section B, systematically state: (1) Method & design, (2) Operationalised IV/DV or co-variables/coding categories, (3) Target population & sampling method, (4) Standardised procedure & controls, and (5) Ethical issues and how you would deal with them in that specific context.',
    { bodyY: 58 });
  return { file: 'psych-unit4-novel-methods.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([reliabilityValidity, samplingMethods, novelMethodsGrid], only);
  console.log(JSON.stringify(done));
})();
module.exports = { reliabilityValidity, samplingMethods, novelMethodsGrid };