/*
 * WJEC A2 Psychology, Lesson 10: Personal Investigations: Planning, Conducting and Reporting.
 * Diagrams for pages 3, 6 and 9.
 * Run: node scripts/wjec-a2-psych/render-unit4-l10.cjs
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK, TEAL } = H;

/* ---------- Page 3: Operationalising hypotheses & variables ---------- */
function hypothesesDesign() {
  const [c, x] = make(W, 1086);
  title2(x, 'Planning a personal investigation: hypotheses, variables and design');
  sub2(x, 'Unit 4 Section A: turning a WJEC investigation title into a testable, controlled procedure');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['Operationalised hypotheses', BLUE,
      'Null hypothesis (H0): states there will be no significant difference or correlation between the operationalised variables (any observed pattern is due to chance).',
      'Directional (one-tailed) vs non-directional (two-tailed): use directional when robust prior theory/studies point one way; always state the exact measurement scale (e.g. score out of 20 words recalled, hours of screen time per day).',
      'Exam trap: writing "memory" or "sleep" without the unit of measurement caps marks at the bottom band.'],
    ['Experimental designs', PURPLE,
      'Independent groups: different participants in each IV condition. Avoids order effects and demand characteristics, but vulnerable to participant variables (solve via random allocation).',
      'Repeated measures: same participants complete both conditions. Controls individual differences and needs half the sample, but creates practice/fatigue effects (solve via ABBA counterbalancing).',
      'Matched pairs: pairs matched on a key pre-test variable; combines control with zero order effects, though matching is time-consuming.'],
    ['Correlations & content analysis', GREEN,
      'Correlation: measures the strength and direction of association between two continuous co-variables without manipulating an IV. Cannot establish cause and effect due to intervening third variables.',
      'Content analysis: quantifies qualitative media, interview or text sources using an explicit coding frame of behavioural categories, tallied and checked for inter-rater reliability.',
      'Questionnaires: combine closed Likert/rating scales (quantitative) with open questions (qualitative insight).'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 20);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25 });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
    text(x, 'Design rule', px + PW / 2, y + 24, { size: 18, bold: true, color: AMBER });
    wrap(x, p[4], px + 24, px + PW - 24, y + 52, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'Current WJEC Unit 4 Personal Investigation cycles',
    'Each cohort conducts two investigations set by WJEC (e.g. Summer 2026: A correlation of screen time and sleep + An experiment on language and music; Summer 2027: A content analysis of post-match interviews + An experiment on social facilitation). Section A tests your own methodology, decisions and reflections.',
    { bodyY: 58 });
  return { file: 'psych-unit4-hypotheses-design.png' };
}

/* ---------- Page 6: Standardisation, confounding variables & ethics ---------- */
function controlsEthics() {
  const [c, x] = make(W, 1086);
  title2(x, 'Controlling extraneous variables and upholding BPS ethics');
  sub2(x, 'Standardised procedures, counterbalancing and practical safeguards in student research');

  const cols = [60, 516, 972], PW = 416, rows = [130, 490], PH = 320;
  const panels = [
    ['1. Situational variables', 'Noise, lighting, time of day and room temperature can become confounding variables if they vary systematically between conditions. Control via a standardised script and identical room.', BLUE],
    ['2. Participant variables', 'Age, prior musical training, reading fluency or baseline fatigue can distort independent groups. Control via random allocation, matched pairs or repeated measures.', PURPLE],
    ['3. Demand characteristics', 'Participants guessing the aim (Orne, 1962) and acting to please ("good-subject effect") or sabotage ("screw-you effect"). Control via single-blind design and distractor items.', GREEN],
    ['4. Investigator effects', 'Rosenthal (1966) unconscious experimenter smiling, tone of voice or lenient scoring. Control via written instructions, automated timers and double-blind coding.', AMBER],
    ['5. Informed consent & withdrawal', 'Participants sign a brief explaining task requirements and their unconditional right to withdraw data (using an anonymised participant code) without penalty.', RED],
    ['6. Confidentiality & debrief', 'No names stored on raw data sheets; full post-study debrief explains the true aim, restores participants to their baseline state and provides support contacts.', DARK],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 16, py + 42, i + 1, p[0].replace(/^\d+\.\s*/, ''), p[2], 21);
    wrap(x, p[1], px + 24, px + PW - 24, py + 92, { size: 18, lh: 26 });
  });
  band(x, 850, 206, 'Contextualising answers in Unit 4 Section A',
    'WJEC mark schemes deduct marks for generic textbook answers that ignore your named investigation. Always name the exact confounding variable in your study (e.g. caffeine consumption before the sleep questionnaire or song familiarity in the music experiment) and how you controlled it.',
    { bodyY: 58 });
  return { file: 'psych-unit4-controls-ethics.png' };
}

/* ---------- Page 9: Scientific reporting & APA/Harvard conventions ---------- */
function reportingStructure() {
  const [c, x] = make(W, 1086);
  title2(x, 'Structure of a scientific psychological report');
  sub2(x, 'From Abstract to References: what belongs in each section and why peer review matters');

  const PW = 416, PH = 300, r1 = 130, r2 = 500;
  const top = [60, 516, 972], bot = [972, 516, 60];
  const steps = [
    ['1. Abstract', 'A concise 150-to-200-word summary written last but placed first: states the aim, design/sample, key descriptive and inferential findings, and main conclusion.', 'Purpose: lets readers judge relevance rapidly.', BLUE],
    ['2. Introduction', 'Reviews relevant background theories and prior empirical studies (funnel structure from broad to specific), leading logically to the study aim and operationalised hypotheses.', 'Purpose: justifies why the study was conducted.', PURPLE],
    ['3. Method', 'Four replicable sub-sections: Design (IV/DV, design, controls, ethics), Participants (sample size, sampling technique, demographics), Apparatus/Materials, and step-by-step Procedure.', 'Purpose: enables exact replication by another researcher.', GREEN],
    ['4. Results', 'Summary tables and labelled graphs of descriptive statistics (central tendency and dispersion) followed by the inferential test statement (test statistic, N/df, p-value and significance).', 'Purpose: objective presentation before interpretation.', AMBER],
    ['5. Discussion', 'Interprets results in plain English, links back to background research in the Introduction, evaluates methodological limitations/modifications, and states real-world implications.', 'Purpose: critical reflection and theoretical synthesis.', RED],
    ['6. References & Appendices', 'Alphabetical Harvard/APA reference list (Author, Year, Title, Journal, Volume, Pages) plus raw data tables, consent forms, standardised scripts and calculations in Appendices.', 'Purpose: academic integrity and audit trail.', DARK],
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
  band(x, 846, 210, 'How to write a Harvard reference accurately in the exam',
    'Journal article: Surname, Initial(s). (Year) Title of article. Title of Journal, Volume(Issue), page range. Book: Surname, Initial(s). (Year) Title of Book. Place of publication: Publisher. Never put raw participant scores in the main Results section; keep raw data in the Appendix.',
    { bodyY: 58 });
  return { file: 'psych-unit4-reporting-structure.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([hypothesesDesign, controlsEthics, reportingStructure], only);
  console.log(JSON.stringify(done));
})();
module.exports = { hypothesesDesign, controlsEthics, reportingStructure };