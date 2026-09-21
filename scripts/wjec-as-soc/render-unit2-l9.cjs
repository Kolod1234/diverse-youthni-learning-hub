/*
 * Renders the three WJEC AS Sociology Lesson 9 (Quantitative Research Methods) diagrams.
 * Uses the shared diagram-helpers.cjs — same visual language as the rest of the set.
 * Output: public/lesson-assets/wjec-as-sociology/. RENDER_ONLY env filter when run directly.
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, run, arrow, text, W, H: HEIGHT,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

// ---------- 1. Questionnaire item pitfalls (Lesson 9, page 3) ----------
function d_itemPitfalls() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'Six ways a questionnaire item goes wrong');
  sub2(x, 'each pitfall with a real bad item, the reason it fails, and the rewrite that fixes it');
  const pw = 420, ph = 310;
  const cells = [
    [60, 130, 'DOUBLE-BARRELLED', BLUE,
      ['BAD: \u201cDo you enjoy and value modern languages?\u201d',
       'WHY: two questions in one — a pupil may enjoy but not value, and one tick cannot say which.',
       'FIX: one item per variable — split it into two.']],
    [514, 130, 'LEADING', GREEN,
      ['BAD: \u201cDo you agree that homework is essential to success?\u201d',
       'WHY: \u201cagree\u201d and \u201cessential\u201d push the answer before it is given.',
       'FIX: a neutral stem — \u201cHow useful do you find homework?\u201d']],
    [968, 130, 'LOADED', RED,
      ['BAD: \u201cShould schools waste money on uniforms?\u201d',
       'WHY: \u201cwaste\u201d assumes the conclusion — the item measures the adjective, not the opinion.',
       'FIX: balanced wording — \u201cShould schools require uniform? Yes / No.\u201d']],
    [60, 460, 'VAGUE OR JARGON', PURPLE,
      ['BAD: \u201cIs your attainment satisfactory?\u201d',
       'WHY: \u201csatisfactory\u201d means a different thing to every respondent — the item measures interpretation.',
       'FIX: concrete, behavioural wording with a timeframe.']],
    [514, 460, 'SOCIAL DESIRABILITY', AMBER,
      ['BAD: \u201cHow many hours do you revise each evening?\u201d',
       'WHY: respondents report the figure that sounds best — the tick flatters rather than records.',
       'FIX: neutral framing, wide bands, and guaranteed anonymity.']],
    [968, 460, 'IMPOSSIBLE RECALL', DARK,
      ['BAD: \u201cHow many hours did you study last month?\u201d',
       'WHY: no one can retrieve a month — the number is a guess dressed up as data.',
       'FIX: a short recall window — \u201cin the last seven days\u201d.']],
  ];
  cells.forEach(([bx, by, hd, col, parts]) => {
    box(x, bx, by, pw, ph, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, pw, 8);
    text(x, hd, bx + pw / 2, by + 44, { size: 20, bold: true, color: col });
    let y = by + 84;
    parts.forEach((p, i) => {
      y = wrap(x, p, bx + 24, bx + pw - 24, y, { size: 15, lh: 21, bold: i === 0, color: i === 0 ? '#0f172a' : SOFT }) + 16;
    });
  });
  band(x, 800, 150, 'THE GOLDEN TEST',
    'show the draft item to two strangers: if two honest readers could give the same answer different meanings, rewrite it. ' +
    'This test is what the pilot study actually runs (Lesson 8, page 7) — and it is why the pilot comes before the fieldwork, not after.',
    { bodyY: 54 });
  return { file: 'wjec-soc-questionnaire-pitfalls.png', w: W, h: HEIGHT };
}

// ---------- 2. The survey pipeline (Lesson 9, page 4) ----------
function d_surveyPipeline() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'Conducting a survey: from draft items to findings');
  sub2(x, 'the six stages a questionnaire passes through — and the two places the design quietly leaks');
  const bw = 580, bh = 155;
  const LX = 70, RX = 798;
  const LY = [140, 320, 500];
  const nodes = [
    [LX, LY[0], 1, 'DESIGN THE ITEMS', BLUE,
      'closed questions, one variable per item, a funnel from easy to sensitive, consistent scales — the instrument is the study\u2019s measuring rod.'],
    [LX, LY[1], 2, 'THE PILOT', GREEN,
      'the draft goes to a few cases: wording, order, timing and refusals are fixed while it is still cheap to fix them.'],
    [LX, LY[2], 3, 'FRAME AND SAMPLE', PURPLE,
      'the roll or register gives the frame; stratified sampling draws the pupils or households in proportion.'],
    [RX, LY[0], 4, 'DISTRIBUTE', AMBER,
      'postal, online or supervised in class — each mode trades cost against response: the classroom wins the response-rate contest.'],
    [RX, LY[1], 5, 'CHASE AND REMIND', RED,
      'reminders, second copies, re-issue links — because non-response is not random: the least engaged are the least likely to reply.'],
    [RX, LY[2], 6, 'CODE AND ANALYSE', DARK,
      'answers become categories and counts; percentages are compared across groups and read back against the hypothesis.'],
  ];
  nodes.forEach(n => {
    const [bx, by, num, hd, col, body] = n;
    box(x, bx, by, bw, bh, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, bw, 8);
    panelHeader(x, bx, by + 52, num, hd, col, 20);
    wrap(x, body, bx + 90, bx + bw - 26, by + 44, { size: 15, lh: 21 });
  });
  arrow(x, LX + bw / 2, LY[0] + bh + 6, LX + bw / 2, LY[1] - 6, { color: GREY });
  arrow(x, LX + bw / 2, LY[1] + bh + 6, LX + bw / 2, LY[2] - 6, { color: GREY });
  arrow(x, LX + bw + 8, LY[2] + bh / 2, RX - 8, LY[2] + bh / 2, { color: GREY });
  arrow(x, RX + bw / 2, LY[2] - 6, RX + bw / 2, LY[1] + bh + 6, { color: GREY });
  arrow(x, RX + bw / 2, LY[1] - 6, RX + bw / 2, LY[0] + bh + 6, { color: GREY });
  arrow(x, RX - 8, LY[0] + bh / 2, LX + bw + 8, LY[0] + bh / 2, { color: GREY });
  band(x, 712, 240, 'THE TWO LEAKS THE REPORTING MUST OWN',
    'ITEM VALIDITY (stages 1\u20132): a broken item is a broken measure — the pilot is where ambiguity is caught, and what escapes the pilot measures itself, not the pupil. ' +
    'NON-RESPONSE BIAS (stages 4\u20135): a 30% postal response means 70% did not reply — and non-response is not random: the disengaged, the busy and the suspicious are missing by choice, so the sample\u2019s views drift from the population\u2019s. ' +
    'Honest studies report the response rate and discuss who is missing. A study that presents its respondents as the population has stopped sampling and started assuming.',
    { size: 15, bodyY: 50 });
  return { file: 'wjec-soc-survey-pipeline.png', w: W, h: HEIGHT };
}

// ---------- 3. The quantitative toolkit compared (Lesson 9, page 10) ----------
function d_quantToolkit() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'The quantitative toolkit: five instruments compared');
  sub2(x, 'what each is, what it yields, and where it is weak — one line to remember per panel');
  const top = [
    ['SOCIAL SURVEY / QUESTIONNAIRE', BLUE, '#eff6ff',
      'standardised closed items to a large sample — yields comparison across groups and years.',
      'STRENGTH: reliable, replicable, representative at scale. WEAKNESS: closed items measure only what the designer anticipated.'],
    ['STRUCTURED INTERVIEW', GREEN, '#f0fdf4',
      'the same schedule read aloud, answer by answer — the survey\u2019s questions with an interviewer present.',
      'STRENGTH: near-complete schedules, help with complex items. WEAKNESS: interviewer effect — presence bends answers toward respectability.'],
    ['OFFICIAL STATISTICS', AMBER, '#fffbeb',
      'the state\u2019s own records — crime, census, entries, attendance — free, vast and routinely comparable.',
      'STRENGTH: scale and trend across decades. WEAKNESS: state-constructed categories — statistics record what the state chose to count (the dark figure, Lesson 7).'],
    ['EXPERIMENTS', RED, '#fef2f2',
      'laboratory (control of variables, artificial setting), field (natural setting, weaker control), comparative method across places.',
      'STRENGTH: the only route toward causal claims (control of the IV). WEAKNESS: rare in sociology — people cannot be assigned to class or family.'],
    ['QUANTITATIVE CONTENT ANALYSIS', PURPLE, '#faf5ff',
      'media content coded into categories and counted — how many, how often, in what proportion.',
      'STRENGTH: manifest content is countable and checkable by a second coder. WEAKNESS: counts what is there, not what it means (semiotics, Lesson 10).'],
  ];
  const pw = 426, ph = 330;
  const drawPanel = (i, bx, by) => {
    const [hd, col, fill, what, verdict] = top[i];
    box(x, bx, by, pw, ph, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, pw, 8);
    text(x, hd, bx + pw / 2, by + 42, { size: 18, bold: true, color: col });
    wrap(x, what, bx + 22, bx + pw - 22, by + 74, { size: 15, lh: 21 });
    box(x, bx + 16, by + 176, pw - 32, 130, { fill, stroke: LIGHT, lw: 1.5 });
    wrap(x, verdict, bx + 28, bx + pw - 28, by + 194, { size: 14, lh: 20 });
  };
  drawPanel(0, 60, 130); drawPanel(1, 508, 130); drawPanel(2, 956, 130);
  drawPanel(3, 284, 490); drawPanel(4, 732, 490);
  band(x, 848, 160, 'ONE FAMILY, ONE TRADE',
    'all five instruments are standardised and replicable — the positivist virtues (Lesson 8, pages 4\u20135) — and all five trade meaning for measurement. ' +
    'The standard critique of any quantitative finding is therefore the same move: accept the count, then ask what the count could not see.',
    { size: 15.5 });
  return { file: 'wjec-soc-quantitative-methods.png', w: W, h: HEIGHT };
}

const renderers = [d_itemPitfalls, d_surveyPipeline, d_quantToolkit];

module.exports = { run: (only) => run(renderers, only) };

if (require.main === module) {
  let only = [];
  try { only = String(process.env.RENDER_ONLY || '').split(',').map(s => s.trim()).filter(Boolean); } catch (e) { only = []; }
  run(renderers, only).then(files => console.log(JSON.stringify({ rendered: files })));
}