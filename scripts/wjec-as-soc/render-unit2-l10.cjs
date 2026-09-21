/*
 * Renders the three WJEC AS Sociology Lesson 10 (Qualitative Research Methods) diagrams.
 * Uses the shared diagram-helpers.cjs — same visual language as the rest of the set.
 * Output: public/lesson-assets/wjec-as-sociology/. RENDER_ONLY env filter when run directly.
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, run, arrow, text, W, H: HEIGHT,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

// ---------- 1. The interview continuum (Lesson 10, page 2) ----------
function d_interviewContinuum() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'The interview continuum: from schedule to conversation');
  sub2(x, 'every interview sits somewhere between a questionnaire read aloud and an open conversation — and the position is a design choice');
  const pw = 420, ph = 380;
  const cells = [
    [60, 160, 'STRUCTURED', BLUE,
      ['DEFINITION: every question, option and order fixed in advance \u2014 the survey\u2019s schedule read aloud, answer by answer.',
       'SAMPLE ITEM: \u201cHow many hours did you work for an employer last week?\u201d',
       'FOR: counting and comparison across many respondents \u2014 the quantitative phase\u2019s instrument.']],
    [514, 160, 'SEMI-STRUCTURED', PURPLE,
      ['DEFINITION: a topic guide, not a script \u2014 the order flexes, and every answer can be followed up with \u201csay more about that\u201d.',
       'SAMPLE MOVE: \u201cTell me how the job affects your evenings \u2014 what happened on Tuesday, for instance?\u201d',
       'FOR: exploring defined topics in depth while keeping some comparability between respondents.']],
    [968, 160, 'UNSTRUCTURED', GREEN,
      ['DEFINITION: one opening question or just a conversation \u2014 the respondent\u2019s own categories set the route, not the researcher\u2019s.',
       'SAMPLE OPENING: \u201cTell me about school \u2014 start wherever you like.\u201d',
       'FOR: discovering meanings the researcher did not anticipate \u2014 Verstehen in person.']],
  ];
  cells.forEach(([bx, by, hd, col, parts]) => {
    box(x, bx, by, pw, ph, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, pw, 8);
    text(x, hd, bx + pw / 2, by + 44, { size: 21, bold: true, color: col });
    let y = by + 84;
    parts.forEach((p, i) => {
      y = wrap(x, p, bx + 22, bx + pw - 22, y, { size: 15, lh: 21 }) + 16;
    });
  });
  // continuum arrows
  arrow(x, 60, 590, 1388, 590, { color: GREY });
  text(x, 'reliability and comparability increase \u2192', 380, 622, { size: 16, color: GREY });
  text(x, '\u2192 validity, flexibility and meaning increase', 1070, 622, { size: 16, color: GREY });
  wrap(x, 'the semi-structured interview is the default recommendation in most design answers: a topic guide keeps the study comparable, while the freedom to probe gives it depth \u2014 the position that best survives the synopsis\u2019s evaluation questions.', 200, W - 200, 680, { size: 16, lh: 23 });
  band(x, 790, 170, 'THE INTERVIEW IS ITSELF A SOCIAL SITUATION',
    'whatever its position on the continuum, an interview is two people performing for each other: the respondent builds answers for an audience of one, and the researcher\u2019s age, gender, accent and clipboard all enter the data. ' +
    'The design response is craft \u2014 rapport, neutral probes, matching interviewers to respondents \u2014 and honesty: the report must treat the interview as an interaction it studied, not a window it looked through.',
    { size: 15, bodyY: 52 });
  return { file: 'wjec-soc-interview-continuum.png', w: W, h: HEIGHT };
}

// ---------- 2. The observation grid (Lesson 10, page 5) ----------
function d_observationGrid() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'Observation: the four positions of the field researcher');
  sub2(x, 'participation and disclosure are two separate decisions \u2014 the grid\u2019s diagonals are where the ethics and the evidence are made');
  const cw = 590, ch = 330;
  const cells = [
    [140, 150, 'OVERT PARTICIPANT', GREEN,
      ['joins the group, identity known, consent given.',
       'WHY: natural behaviour with the group\u2019s trust; the researcher can ask about what happens as it happens.',
       'EXAMPLE: Whyte\u2019s Street Corner Society (1937\u201343) \u2014 three years in Boston\u2019s Cornerville, introduced by \u201cDoc\u201d, notebook in the open.']],
    [734, 150, 'COVERT PARTICIPANT', RED,
      ['joins the group, identity hidden.',
       'WHY: removes the researcher effect entirely \u2014 the group cannot perform for a sociologist it cannot see.',
       'EXAMPLES: James Patrick\u2019s A Glasgow Gang Observed (1973); Humphreys\u2019 Tearoom Trade (1970) \u2014 no consent, no withdrawal, hard cases (Lesson 8, page 12).']],
    [140, 506, 'OVERT NON-PARTICIPANT', BLUE,
      ['watches without joining, presence known.',
       'WHY: distance keeps analysis clean; schedules and categories can be applied systematically.',
       'EXAMPLE: classroom observation with the class\u2019s knowledge \u2014 the education context\u2019s standard instrument, and the weakest for meaning.']],
    [734, 506, 'COVERT NON-PARTICIPANT', AMBER,
      ['watches without joining, presence not known.',
       'WHY: public behaviour needs no consent to be seen \u2014 queues, crowds, street interaction are already public.',
       'EXAMPLE: observing public-space behaviour unannounced \u2014 the least intrusive position, and the least able to reach meaning.']],
  ];
  cells.forEach(([bx, by, hd, col, parts]) => {
    box(x, bx, by, cw, ch, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, cw, 8);
    text(x, hd, bx + cw / 2, by + 40, { size: 20, bold: true, color: col });
    let y = by + 78;
    parts.forEach(p => {
      y = wrap(x, p, bx + 24, bx + cw - 24, y, { size: 15, lh: 21 }) + 12;
    });
  });
  // axis labels
  text(x, 'PARTICIPANT', 60, 320, { size: 17, bold: true, color: GREY });
  text(x, 'NON-PARTICIPANT', 46, 676, { size: 17, bold: true, color: GREY });
  text(x, 'OVERT', 435, 128, { size: 17, bold: true, color: GREY });
  text(x, 'COVERT', 1029, 128, { size: 17, bold: true, color: GREY });
  band(x, 866, 160, 'THE DIAGONAL RULE',
    'as participation deepens, the researcher effect falls and the access rises \u2014 while consent becomes harder to obtain. The grid\u2019s two decisions therefore trade each other: ' +
    'covert participant observation is the most valid position on the page and the least ethical; overt non-participation is the most ethical and the thinnest. Every observation study\u2019s justification is an answer to this diagonal.',
    { size: 15.5 });
  return { file: 'wjec-soc-observation-grid.png', w: W, h: HEIGHT };
}

// ---------- 3. Triangulation (Lesson 10, page 10) ----------
function d_triangulation() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'Triangulation: converging evidence and productive disagreement');
  sub2(x, 'why mixed-method studies are stronger than any single instrument — and what to do when the methods disagree');
  // three source panels around a central claim
  const pw = 400, ph = 240;
  const srcs = [
    [60, 150, 'THE SURVEY', BLUE, 'the PATTERN: how many, how often, for whom — breadth across the population, tested for reliability and representativeness.'],
    [520, 150, 'THE INTERVIEW', GREEN, 'the MEANING: what the behaviour is for those inside it — depth and Verstehen, at the price of scale.'],
    [980, 150, 'THE OBSERVATION', AMBER, 'the CONTEXT: what people actually do, where they do it — behaviour in its setting, beyond both reports and words.'],
  ];
  srcs.forEach(([bx, by, hd, col, body]) => {
    box(x, bx, by, pw, ph, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, pw, 8);
    text(x, hd, bx + pw / 2, by + 44, { size: 21, bold: true, color: col });
    wrap(x, body, bx + 24, bx + pw - 24, by + 84, { size: 15.5, lh: 22 });
  });
  // centre claim box
  const cx = 524, cy = 560;
  box(x, cx, cy, 400, 130, { fill: '#fffbeb', stroke: '#fde68a', lw: 2.5 });
  text(x, 'THE CLAIM', cx + 200, cy + 36, { size: 20, bold: true, color: '#b45309' });
  wrap(x, 'a finding supported at three angles survives criticism from any one of them', cx + 20, cx + 380, cy + 74, { size: 15.5, lh: 21 });
  // arrows from sources down to the claim
  arrow(x, 260, 396, cx + 60, cy - 8, { color: GREY });
  arrow(x, 720, 396, cx + 200, cy - 8, { color: GREY });
  arrow(x, 1180, 396, cx + 340, cy - 8, { color: GREY });
  // four types panel
  box(x, 60, 740, 1336, 130, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
  text(x, 'FOUR KINDS OF TRIANGULATION (Denzin)', 728, 770, { size: 18, bold: true, color: '#0f172a' });
  wrap(x, 'DATA: several sources (survey, register, interviews). INVESTIGATOR: more than one researcher, checked against each other. METHODOLOGICAL: quantitative and qualitative methods on the same question. THEORETICAL: more than one perspective reading the same evidence.', 100, 1360, 800, { size: 15.5, lh: 22 });
  band(x, 890, 150, 'WHEN THE ANGLES DISAGREE, THE DISAGREEMENT IS THE FINDING',
    'triangulation is not three votes for the truth: methods disagree for reasons, and the reasons are sociological. Pupils who tick \u201cfine\u201d on a survey and describe misery in interview are not contradicting themselves \u2014 ' +
    'the survey\u2019s anonymity and the interview\u2019s audience produce different performances, and the study that explains which settings produce which accounts has found something no single method could see.',
    { size: 15.5, bodyY: 52 });
  return { file: 'wjec-soc-triangulation.png', w: W, h: HEIGHT };
}

const renderers = [d_interviewContinuum, d_observationGrid, d_triangulation];

module.exports = { run: (only) => run(renderers, only) };

if (require.main === module) {
  let only = [];
  try { only = String(process.env.RENDER_ONLY || '').split(',').map(s => s.trim()).filter(Boolean); } catch (e) { only = []; }
  run(renderers, only).then(files => console.log(JSON.stringify({ rendered: files })));
}