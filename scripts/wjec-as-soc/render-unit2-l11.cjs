/*
 * Renders the three WJEC AS Sociology Lesson 11 (Evaluating Evidence and Research Synopses) diagrams.
 * Uses the shared diagram-helpers.cjs — same visual language as the rest of the set.
 * Output: public/lesson-assets/wjec-as-sociology/. RENDER_ONLY env filter when run directly.
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, run, arrow, text, W, H: HEIGHT,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

// ---------- 1. Correlation, causation and spuriousness (Lesson 11, page 3) ----------
function d_correlationCausation() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'Correlation is not causation: the three rival explanations');
  sub2(x, 'what an observed association can mean besides \u201cX causes Y\u201d \u2014 the checklist every findings-section claim must survive');
  // top: the observed correlation
  box(x, 334, 130, 780, 150, { fill: '#eff6ff', stroke: '#bfdbfe', lw: 2 });
  text(x, 'THE OBSERVED CORRELATION', 724, 166, { size: 20, bold: true, color: BLUE });
  wrap(x, 'X varies with Y \u2014 in areas of high unemployment, recorded youth crime is higher; in months of high ice-cream sales, drownings rise. The numbers move together: that is all the data say.', 364, 1084, 196, { size: 15.5, lh: 22 });
  // three rival panels
  const pw = 426, ph = 300;
  const cells = [
    [60, 330, 'REVERSE CAUSATION', BLUE,
      'maybe Y causes X, not X causes Y. Do unemployed areas produce offending \u2014 or does a record of offending (and the school exclusion behind it) destroy employability? ' +
      'The arrow\u2019s direction is an assumption the data cannot settle; only a design that measures X before Y can.'],
    [511, 330, 'A THIRD VARIABLE (SPURIOUS)', RED,
      'maybe Z causes both. Summer heat drives ice-cream sales and swimming \u2014 the cream never touched the water. Poverty may drive both unemployment and recorded crime (policing included). ' +
      'Spurious correlations are the study\u2019s silent passenger: match on a variable you never measured and the pattern follows.'],
    [962, 330, 'CHANCE', GREEN,
      'maybe nothing drives anything: small samples produce coincidences, and 5% of significance tests pass by luck, every time. ' +
      'A single association in one school\u2019s data is a coincidence until it repeats in the next school\u2019s: replication, not cleverness, is the cure.'],
  ];
  cells.forEach(([bx, by, hd, col, body]) => {
    box(x, bx, by, pw, ph, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, pw, 8);
    text(x, hd, bx + pw / 2, by + 42, { size: 19, bold: true, color: col });
    wrap(x, body, bx + 22, bx + pw - 22, by + 76, { size: 15, lh: 21 });
  });
  arrow(x, 500, 284, 273, 322, { color: GREY });
  arrow(x, 724, 284, 724, 322, { color: GREY });
  arrow(x, 948, 284, 1175, 322, { color: GREY });
  // experiment panel
  box(x, 60, 680, 1328, 140, { fill: '#f0fdf4', stroke: '#bbf7d0', lw: 2 });
  text(x, 'WHAT WOULD SETTLE IT: THE EXPERIMENT\u2019S LOGIC', 724, 712, { size: 18, bold: true, color: GREEN });
  wrap(x, 'assign cases randomly to levels of X, hold everything else constant, and measure Y \u2014 then a difference in Y really is X\u2019s work. Where society cannot be assigned (to unemployment, to class, to a religion), sociology falls back on stratifying on the measured rivals and saying, honestly, \u201cvaries with\u201d (Lesson 8, page 2; Lesson 9, page 6).', 100, 1348, 744, { size: 15.5, lh: 22 });
  band(x, 852, 150, 'THE MARK-SCHEME SENTENCE',
    'every claim in a findings section is one of three things: demonstrated (the design supports it), defensible (stated as association with rivals named), or overreach (a causal sentence on correlational data). ' +
    'The evaluation\u2019s job is to sort a study\u2019s claims into these three piles \u2014 and the third pile is where the marks are.',
    { size: 15.5, bodyY: 52 });
  return { file: 'wjec-soc-correlation-causation.png', w: W, h: HEIGHT };
}

// ---------- 2. Anatomy of a research synopsis (Lesson 11, page 5) ----------
function d_synopsisAnatomy() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'Anatomy of a research synopsis \u2014 and the question each part answers');
  sub2(x, 'the WJEC synopsis format: six components, and the evaluation question that examiners attach to each');
  const rows = [
    ['1', 'THE AIM', BLUE, 'What was the study trying to find out?',
      'Is the aim a researchable question, and is its population stated? \u201cInvestigating young people and religion\u201d is a topic, not an aim.'],
    ['2', 'THE HYPOTHESIS OR QUESTIONS', PURPLE, 'What exactly was expected or asked?',
      'Are variables identified and operationalised (Lesson 8, page 3), and is the claim causal where only correlation is earned?'],
    ['3', 'THE METHOD', GREEN, 'How were the data collected?',
      'Does the instrument fit the question \u2014 pattern or meaning (Lesson 8, pages 4\u20135)? What does the chosen technique cost (Lessons 9\u201310)?'],
    ['4', 'THE SAMPLE', AMBER, 'Who was studied, and how were they chosen?',
      'Frame, technique, size, response rate (Lesson 8, pages 8\u201310): can the sample carry the population the conclusion claims?'],
    ['5', 'THE FINDINGS', RED, 'What did the study actually find?',
      'Are the findings stated at the level the data support \u2014 described, not over-read (correlation, significance, sample-sized)?'],
    ['6', 'THE CONCLUSION', DARK, 'What does the study claim it showed?',
      'Does the conclusion match the findings, or does it upgrade \u2014 sample to population, association to cause, these cases to \u201cyoung people\u201d?'],
  ];
  const bh = 106;
  rows.forEach((r, i) => {
    const by = 130 + i * (bh + 10);
    box(x, 60, by, 1328, bh, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    panelHeader(x, 76, by + 34, r[0], r[1], r[2], 18);
    text(x, r[3], 520, by + 34, { size: 15.5, bold: true, color: '#0f172a', align: 'left' });
    wrap(x, r[4], 560, 1370, by + 62, { size: 14.5, lh: 20 });
  });
  band(x, 830, 170, 'THE EXAMINATION\u2019S TWO MOVES',
    'first, READ the synopsis for its six parts \u2014 examiners report that candidates evaluate \u201cthe study\u201d in general instead of the six components in front of them; second, EVALUATE each part with the ' +
    'unit\u2019s vocabulary: frame bias, non-response, interviewer effect, operationalisation, correlation, triangulation. Component by component is the marking route \u2014 and Lesson 9\u2019s page 12 and Lesson 10\u2019s page 13 are the worked examples.',
    { size: 15, bodyY: 52 });
  return { file: 'wjec-soc-synopsis-anatomy.png', w: W, h: HEIGHT };
}

// ---------- 3. Where evidence comes from: quality, funding and values (Lesson 11, page 9) ----------
function d_evidenceQuality() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'Where evidence comes from: the study behind the finding');
  sub2(x, 'before evaluating a study\u2019s design, ask what produced it, who reviewed it, and who paid \u2014 the sociology of sociology');
  const pw = 420, ph = 310;
  const cells = [
    [60, 130, 'PEER REVIEW', BLUE,
      ['WHAT IT IS: submitted work read and challenged by other researchers before publication.',
       'WHAT IT CATCHES: weak designs, overread findings, missing evidence trails \u2014 before print.',
       'WHAT IT CANNOT: replication is review after the fact; most findings are reviewed but never re-run.']],
    [514, 130, 'FUNDING AND SPONSORSHIP', RED,
      ['WHO PAYS: government departments, research councils, charities, companies, campaigns \u2014 all have interests.',
       'WHAT IT SHAPES: the questions asked (which studies never get funded?) and sometimes the framing of results.',
       'THE QUESTION TO ASK: does the sponsor\u2019s interest predict the finding\u2019s usefulness to that sponsor?']],
    [968, 130, 'VALUES AND REFLEXIVITY', GREEN,
      ['THE OLD IDEAL: Weber\u2019s value-free inquiry \u2014 values choose the topic, not the verdict.',
       'THE REALITY: topic choice, definitions and categories all carry the researcher\u2019s standpoint.',
       'THE MODERN ANSWER: not neutrality but declared position \u2014 reflexivity (Lesson 10, page 11) lets the reader weigh the conditions.']],
    [60, 470, 'PUBLICATION AND VISIBILITY', PURPLE,
      ['WHAT GETS PRINTED: positive, striking findings; null results sit in drawers.',
       'THE FILE-DRAWER EFFECT: \u201cno difference\u201d studies rarely publish \u2014 so the literature over-represents effects.',
       'THE HEADLINE GAP: a finding\u2019s public life (a press release) is not its scientific life (the paper\u2019s limits).']],
    [514, 470, 'REPLICATION', AMBER,
      ['THE GOLD STANDARD: another team, same question, new data \u2014 does the finding recur?',
       'WHAT IT SETTLES: chance and single-team bias \u2014 the two rivals no design alone can exclude.',
       'WHAT SOCIOLOGY OWES: where findings never re-run (one-off case studies), their claims must stay case-sized.']],
    [968, 470, 'TRIANGULATION', DARK,
      ['THE FAST SUBSTITUTE: multiple methods on one question (Lesson 10, page 10) approximate replication\u2019s discipline.',
       'WHAT IT BUYS: a finding supported at several angles is harder to dismiss on one instrument\u2019s weakness.',
       'WHAT IT IS NOT: a vote \u2014 disagreement between methods is data about how accounts are produced.']],
  ];
  cells.forEach(([bx, by, hd, col, parts]) => {
    box(x, bx, by, pw, ph, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, pw, 8);
    text(x, hd, bx + pw / 2, by + 40, { size: 18, bold: true, color: col });
    let y = by + 74;
    parts.forEach(p => { y = wrap(x, p, bx + 22, bx + pw - 22, y, { size: 14.5, lh: 20 }) + 12; });
  });
  band(x, 810, 160, 'THE HONEST EVALUATION\u2019S OPENING QUESTION',
    'not \u201cis this finding true?\u201d but \u201cwhat kind of claim is it, produced under what conditions, checkable by whom?\u201d \u2014 a peer-reviewed, replicated, triangulated finding funded by no interested party earns its claims; ' +
    'a press release does not, whatever its sample size. Sociology of knowledge applied to sociology itself is the unit\u2019s final method.',
    { size: 15.5, bodyY: 52 });
  return { file: 'wjec-soc-evidence-quality.png', w: W, h: HEIGHT };
}

const renderers = [d_correlationCausation, d_synopsisAnatomy, d_evidenceQuality];

module.exports = { run: (only) => run(renderers, only) };

if (require.main === module) {
  let only = [];
  try { only = String(process.env.RENDER_ONLY || '').split(',').map(s => s.trim()).filter(Boolean); } catch (e) { only = []; }
  run(renderers, only).then(files => console.log(JSON.stringify({ rendered: files })));
}