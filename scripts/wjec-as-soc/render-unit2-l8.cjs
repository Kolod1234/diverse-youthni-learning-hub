/*
 * Renders the three WJEC AS Sociology Lesson 8 (Planning Sociological Research) diagrams.
 * Uses the shared diagram-helpers.cjs (Lessons 8+) — same visual language as the Unit 1 set.
 * Output: public/lesson-assets/wjec-as-sociology/. RENDER_ONLY env filter when run directly.
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, run, arrow, text, W, H: HEIGHT,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

// ---------- 1. The sociological research cycle (Lesson 8, page 7) ----------
function d_researchCycle() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'The sociological research cycle');
  sub2(x, 'from a question to evidence and back again — the route every WJEC research synopsis travels');
  const bw = 580, bh = 150;
  const LX = 70, RX = 798;
  const LY = [140, 312, 484, 656];
  const nodes = [
    [LX, LY[0], 1, 'THE QUESTION', BLUE,
      'a puzzle worth studying — "why do working-class pupils, on average, leave school with less — turned into a question research can actually answer.'],
    [LX, LY[1], 2, 'THE BACKGROUND', GREEN,
      'what is already known: theory and earlier studies. The review sharpens the question, suggests what to expect, and stops you re-inventing the wheel.'],
    [LX, LY[2], 3, 'THE HYPOTHESIS', PURPLE,
      'a testable statement linking variables ("the longer a pupil is unemployed, the lower their reported life satisfaction") — or open questions for interpretivist work.'],
    [LX, LY[3], 4, 'OPERATIONALISE', AMBER,
      'concepts become indicators become measures: "class" becomes occupation; "religiosity" becomes attendance and belief. The hypothesis can now be tested.'],
    [RX, LY[3], 5, 'THE PILOT STUDY', RED,
      'draft instruments go to a few cases first: ambiguous items, timing, refusals and question order are fixed before the real fieldwork begins.'],
    [RX, LY[2], 6, 'SAMPLE AND FIELDWORK', GREEN,
      'choose the population, the sampling frame and the sample; then collect the data — under the ethics rules settled at the design stage, not afterwards.'],
    [RX, LY[1], 7, 'ANALYSIS', PURPLE,
      'quantitative data yield patterns and comparisons; qualitative data yield meanings and themes; both are read back against the hypothesis.'],
    [RX, LY[0], 8, 'FINDINGS AND REPORT', BLUE,
      'answer the question and state the limits honestly; every answer raises the next question — the loop begins again.'],
  ];
  nodes.forEach(n => {
    const [bx, by, num, hd, col, body] = n;
    box(x, bx, by, bw, bh, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, bw, 8);
    panelHeader(x, bx, by + 52, num, hd, col, 20);
    wrap(x, body, bx + 90, bx + bw - 26, by + 44, { size: 15, lh: 21 });
  });
  // loop arrows (full 5-argument form)
  arrow(x, LX + bw / 2, LY[0] + bh + 6, LX + bw / 2, LY[1] - 6, { color: GREY });
  arrow(x, LX + bw / 2, LY[1] + bh + 6, LX + bw / 2, LY[2] - 6, { color: GREY });
  arrow(x, LX + bw / 2, LY[2] + bh + 6, LX + bw / 2, LY[3] - 6, { color: GREY });
  arrow(x, LX + bw + 8, LY[3] + bh / 2, RX - 8, LY[3] + bh / 2, { color: GREY });
  arrow(x, RX + bw / 2, LY[3] - 6, RX + bw / 2, LY[2] + bh + 6, { color: GREY });
  arrow(x, RX + bw / 2, LY[2] - 6, RX + bw / 2, LY[1] + bh + 6, { color: GREY });
  arrow(x, RX + bw / 2, LY[1] - 6, RX + bw / 2, LY[0] + bh + 6, { color: GREY });
  arrow(x, RX - 8, LY[0] + bh / 2, LX + bw + 8, LY[0] + bh / 2, { color: GREY });
  band(x, 856, 180, 'ETHICS AT EVERY STAGE — NOT A HURDLE AT THE END',
    'consent and deception are settled at the design stage; harm, stress and privacy govern the fieldwork; anonymity and confidentiality govern the reporting. ' +
    'The British Sociological Association\u2019s Statement of Ethical Practice applies to all of it — a study that cannot be conducted ethically is redesigned, not excused. ' +
    'For WJEC, the cycle is also the marking order of a research synopsis: aim \u2192 method \u2192 sample \u2192 findings \u2192 conclusion \u2192 your evaluation of all four.');
  return { file: 'wjec-soc-research-cycle.png', w: W, h: HEIGHT };
}

// ---------- 2. Positivism vs interpretivism (Lesson 8, page 5) ----------
function d_perspectives() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'Two logics of enquiry: positivism and interpretivism');
  sub2(x, 'the methodological debate that decides what counts as good evidence — before any method is chosen');
  const pw = 654, ph = 720;
  const drawCol = (bx, hd, col, fill, stroke, rows) => {
    box(x, bx, 130, pw, ph, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, 130, pw, 8);
    text(x, hd, bx + pw / 2, 178, { size: 26, bold: true, color: col });
    let y = 220;
    rows.forEach(r => {
      text(x, r[0], bx + pw / 2, y, { size: 16, bold: true, color: GREY });
      y = wrap(x, r[1], bx + 26, bx + pw - 26, y + 26, { size: 16, lh: 22 }) + 26;
    });
  };
  drawCol(60, 'POSITIVISM', BLUE, '#eff6ff', '#bfdbfe', [
    ['STARTING POINT', 'society exists as an external reality of social facts (Durkheim) that shapes individuals from outside — so it can be described, measured and explained as the natural sciences explain the physical world (Comte coined "positivism" in 1838).'],
    ['METHODS PREFERRED', 'social surveys with closed questions, official statistics, experiments and quantitative content analysis — standardised instruments, large samples, replicable procedures.'],
    ['WHAT IT WANTS', 'reliability and representativeness: patterns across large numbers, comparison between groups, generalisable findings that could be repeated by another researcher.'],
    ['KEY EVIDENCE', 'Durkheim\u2019s Suicide (1897): Protestant, Catholic and unmarried populations compared across regions — a social fact (integration) measured through official records.'],
    ['MAIN LIMITATION', 'it loses meaning: a tick-box can record that a person attends church but not what attending means to them — and standardised instruments cannot follow up.'],
  ]);
  drawCol(734, 'INTERPRETIVISM', GREEN, '#f0fdf4', '#bbf7d0', [
    ['STARTING POINT', 'society is made of meanings in interaction: people act on the definitions they give their situation, so the task is to understand (Weber\u2019s Verstehen), not just to measure.'],
    ['METHODS PREFERRED', 'unstructured interviews, participant observation, personal documents and case studies — open, flexible, naturalistic instruments carried out close to the actor\u2019s world.'],
    ['WHAT IT WANTS', 'validity: an account of what the behaviour actually means to those involved, in their own categories, rather than what an outsider\u2019s schedule records.'],
    ['KEY EVIDENCE', 'Weber\u2019s account of the Protestant ethic (1905): the meaning of a worldly "calling" — not the frequency of church membership — explains the behaviour he studied.'],
    ['MAIN LIMITATION', 'small samples, researcher interpretation and an unavoidable interviewer effect make findings hard to replicate and hard to generalise beyond the cases studied.'],
  ]);
  band(x, 886, 150, 'THE DEBATE FIXES YOUR STARTING POINT — NOT YOUR WHOLE DESIGN',
    'most working sociologists mix: a survey can carry open questions, and an ethnography can count things (triangulation, Lesson 10). ' +
    'But every WJEC evaluation must say which logic a study belongs to, because that decides which criticism applies: the wrong sample size is fatal to a positivist study and routine to an interpretivist one — and the reverse is true of the meanings it misses.');
  return { file: 'wjec-soc-positivism-interpretivism.png', w: W, h: HEIGHT };
}

// ---------- 3. Choosing the method: three contexts (Lesson 8, page 6) ----------
function d_methodChoice() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'Choosing a method: the three contexts of research design');
  sub2(x, 'no method is simply "better" — the choice is argued from practical, ethical and theoretical factors together');
  // three domain panels around a central decision box
  const pw = 420, ph = 300;
  const drawPanel = (bx, by, hd, col, fill, stroke, items) => {
    box(x, bx, by, pw, ph, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, pw, 8);
    text(x, hd, bx + pw / 2, by + 44, { size: 22, bold: true, color: col });
    let y = by + 84;
    items.forEach(it => {
      y = wrap(x, it, bx + 24, bx + pw - 24, y, { size: 15.5, lh: 22 }) + 14;
    });
  };
  drawPanel(60, 130, 'PRACTICAL FACTORS', GREEN, '#f0fdf4', '#bbf7d0', [
    '\u2022 time and money: a postal questionnaire to 2,000 households costs less than a year of participant observation in one youth club.',
    '\u2022 the researcher\u2019s skills and the setting\u2019s access: headteachers open schools to surveys; gang members do not.',
    '\u2022 the subject matter: counting attendance suits schedules; understanding leaving home does not.',
  ]);
  drawPanel(964, 130, 'ETHICAL FACTORS', RED, '#fef2f2', '#fecaca', [
    '\u2022 informed consent — from pupils themselves and from parents and schools where they are under 16.',
    '\u2022 harm, stress and privacy: topics such as bereavement, offending or family conflict need protection, withdrawal rights and referral routes.',
    '\u2022 the BSA Statement: some designs (covert work, deception) are only defensible when no alternative can reach the group.',
  ]);
  drawPanel(60, 470, 'THEORETICAL FACTORS', BLUE, '#eff6ff', '#bfdbfe', [
    '\u2022 positivist aims demand reliability: standardised, replicable methods with large, representative samples.',
    '\u2022 interpretivist aims demand validity: flexible, naturalistic methods close to the actor\u2019s meanings.',
    '\u2022 the hypothesis decides the data: a causal claim needs variables you can measure; a "what does it mean?" question does not.',
  ]);
  drawPanel(964, 470, 'THE DECISION', DARK, '#f8fafc', '#cbd5e1', [
    '\u2022 the chosen method(s) — stated, not assumed.',
    '\u2022 justified by naming the factor(s) that decided it.',
    '\u2022 acknowledged with the cost: what the choice will not be able to tell you.',
    '\u2022 audited against ethics before any fieldwork begins.',
  ]);
  // arrows from the three factor panels to the decision panel
  arrow(x, 484, 280, 964, 280, { color: GREY });
  arrow(x, 484, 620, 964, 620, { color: GREY });
  arrow(x, 744, 620, 964, 560, { color: GREY });
  text(x, 'weighed together', 724, 254, { size: 15, color: GREY });
  band(x, 826, 200, 'THE THREE INTERLOCK — THE BEST ANSWERS SHOW HOW',
    'a covert observation of a gang may be the only practical access route and the only way to reach the truth of the group — and precisely the method the ethics rules restrict: the design argument must balance all three, not trade them off one at a time. ' +
    'For WJEC this diagram is a writing frame: any "how would you research\u2026?" item is answered by working practical \u2192 ethical \u2192 theoretical \u2192 decision \u2192 limitation.',
    { size: 15.5 });
  return { file: 'wjec-soc-method-choice.png', w: W, h: HEIGHT };
}

const renderers = [d_researchCycle, d_perspectives, d_methodChoice];

module.exports = { run: (only) => run(renderers, only) };

if (require.main === module) {
  let only = [];
  try { only = String(process.env.RENDER_ONLY || '').split(',').map(s => s.trim()).filter(Boolean); } catch (e) { only = []; }
  run(renderers, only).then(files => console.log(JSON.stringify({ rendered: files })));
}