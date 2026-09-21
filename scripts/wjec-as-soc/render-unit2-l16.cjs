/*
 * Renders the three WJEC AS Sociology Lesson 16 (WJEC AS Examination Practice) diagrams.
 * Uses the shared diagram-helpers.cjs — same visual language as the rest of the set.
 * Output: public/lesson-assets/wjec-as-sociology/. RENDER_ONLY env filter when run directly.
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, run, arrow, text, W, H: HEIGHT,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

// ---------- 1. Command words decoded (Lesson 16, page 2) ----------
function d_commandWords() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'Command words decoded: what each word orders you to build');
  sub2(x, 'the examiner\u2019s verbs are the essay architecture in disguise \u2014 match the move to the command');
  const pw = 430, ph = 350;
  const cells = [
    [60, 130, 'OUTLINE / DESCRIBE', BLUE,
      ['\u2022 WHAT IT ORDERS: the knowledge layer, stated plainly \u2014 main features, steps, claims.',
       '\u2022 WHAT IT PAYS: AO1; do NOT adjudicate (unasked verdicts waste time).',
       '\u2022 THE TRAP: treating it as an essay. A describe answer with a verdict in it has done a job it was not paid for and usually underbaked both.']],
    [514, 130, 'EXPLAIN', PURPLE,
      ['\u2022 WHAT IT ORDERS: the reasoning layer \u2014 how and why, chains built (the because/so steps).',
       '\u2022 WHAT IT PAYS: AO1 + analysis; explanation is argument\u2019s analysis half without the weighing.',
       '\u2022 THE TRAP: listing causes. \u201cExplain\u201d demands the mechanism: what produces what, through what \u2014 the Lesson 15 explain-job, done at length.']],
    [968, 130, 'ASSESS / EVALUATE', RED,
      ['\u2022 WHAT IT ORDERS: the weighing layer \u2014 strengths, weaknesses, and the VERDICT clause.',
       '\u2022 WHAT IT PAYS: AO3, the band-decider; the four moves are its architecture.',
       '\u2022 THE TRAP: the see-saw. \u201cAssess\u201d answers end where the weight falls, on which evidence, with the falsifier clause \u2014 not \u201cboth have merit\u201d.']],
    [60, 510, 'DISCUSS', GREEN,
      ['\u2022 WHAT IT ORDERS: the argument made in both directions before a verdict \u2014 debate, then adjudication.',
       '\u2022 WHAT IT PAYS: AO3 through the debate\u2019s structure; treat as assess with a more dialogue-shaped build.',
       '\u2022 THE TRAP: staying in the debate. Without the adjudication, a discuss answer has held the fight and forgotten the judge.']],
    [514, 510, 'HOW FAR / TO WHAT EXTENT', AMBER,
      ['\u2022 WHAT IT ORDERS: a QUANTITATIVE adjudication \u2014 not whether but how much, and where the boundary sits.',
       '\u2022 WHAT IT PAYS: AO3 with a scope clause required: the verdict must mark the claim\u2019s territory.',
       '\u2022 THE TRAP: all-or-nothing. The strongest answers draw the line in the claim (demonstrated at the level of X, fails at Y) \u2014 the three piles, spatially.']],
    [968, 510, 'THE RULE UNDER THEM ALL', DARK,
      ['\u2022 The command word is the question\u2019s load-bearing term: misread it and no quantity of knowledge recovers the marks.',
       '\u2022 THE 30-SECOND HABIT: before planning, write the command word in the margin and name the move it orders \u2014 then build that move.',
       '\u2022 Every model in this course is labelled with its moves: match, don\u2019t guess.']],
  ];
  cells.forEach(([bx, by, hd, col, parts]) => {
    box(x, bx, by, pw, ph, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, pw, 8);
    text(x, hd, bx + pw / 2, by + 42, { size: 17, bold: true, color: col });
    let y = by + 76;
    parts.forEach(p => { y = wrap(x, p, bx + 22, bx + pw - 22, y, { size: 14.5, lh: 20 }) + 12; });
  });
  return { file: 'wjec-soc-command-words.png', w: W, h: HEIGHT };
}

// ---------- 2. The exam's economy: time and marks (Lesson 16, page 3) ----------
function d_examStrategy() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'The examination\u2019s economy: minutes as marks');
  sub2(x, 'time allocation, the plan-first discipline, and the band ladder every question is climbed on');
  // left: time economy
  box(x, 60, 130, 620, 600, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
  x.fillStyle = BLUE; x.fillRect(60, 130, 620, 8);
  text(x, 'TIME ALLOCATION', 370, 176, { size: 22, bold: true, color: BLUE });
  const rows = [
    ['THE PRINCIPLE', 'minutes per mark, minus a plan reserve: a mark is roughly a minute of writing, and the plan is not optional overhead \u2014 it is the difference between an essay and a list.'],
    ['SHORT ANSWERS', 'define precisely, give the example, move: short questions pay for exactness, not for surrounding the answer with context.'],
    ['THE 15-MARK ESSAY', 'plan 3 minutes (moves, joints, slots) \u2014 write in the remaining: outline brief, apply and evaluate as built paragraphs, adjudicate with the clause.'],
    ['THE RESERVE', 'the last five minutes are the audit (Lesson 15, page 14): circle, underline, star \u2014 the cheapest band-climb in the paper.'],
    ['THE CARDINAL SIN', 'leaving a question unfinished: an unfinished strong essay scores below a finished ordinary one, every time \u2014 the bands reward completion of the architecture over brilliance of fragments.'],
  ];
  let y = 216;
  rows.forEach(r => {
    text(x, r[0], 100, y, { size: 16, bold: true, color: GREY, align: 'left' });
    y = wrap(x, r[1], 100, 640, y + 25, { size: 15, lh: 21 }) + 16;
  });
  // right: band ladder
  box(x, 738, 130, 620, 600, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
  x.fillStyle = PURPLE; x.fillRect(738, 130, 620, 8);
  text(x, 'THE BAND LADDER', 1048, 176, { size: 22, bold: true, color: PURPLE });
  const ladder = [
    ['TOP BAND', 'the machine complete: claim, weights, steel man, surviving concession, adjudication with the falsifier clause \u2014 and aimed at the question throughout.'],
    ['UPPER BAND', 'evaluation present but incomplete: weighing without preference, or counter without concession \u2014 one missing job (Lesson 15\u2019s audit names it).'],
    ['MIDDLE BAND', 'accurate, applied, but descriptive: knowledge aimed at the question with no verdict \u2014 the list essay\u2019s best day.'],
    ['LOWER BAND', 'knowledge with faults: names without findings, definitions drifted, no tether to the question\u2019s terms.'],
    ['THE LADDER\u2019S LESSON', 'bands are missing jobs, not missing facts: each rung upward is one built job \u2014 which is why the audit climbs bands faster than extra revision.'],
  ];
  let ly = 216;
  ladder.forEach(r => {
    text(x, r[0], 778, ly, { size: 16, bold: true, color: GREY, align: 'left' });
    ly = wrap(x, r[1], 778, 1318, ly + 25, { size: 15, lh: 21 }) + 16;
  });
  band(x, 762, 170, 'THE STRATEGY IN ONE PARAGRAPH',
    'Read the whole paper first; answer your strongest question first (confidence is a resource); plan every extended answer in moves and joints before writing; write paragraphs that do their four jobs; keep the clock honest with minutes-per-mark; bank the last five minutes for the audit. ' +
    'The strategy is not exam-craft bolted on to sociology \u2014 it is Lesson 15\u2019s machine, run against a clock.',
    { size: 15.5, bodyY: 52 });
  return { file: 'wjec-soc-exam-strategy.png', w: W, h: HEIGHT };
}

// ---------- 3. The course map for revision (Lesson 16, page 14) ----------
function d_revisionMap() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'The whole course, one map: what to retrieve, and what connects');
  sub2(x, 'retrieval practice organised around the joints \u2014 because the connections are the marks');
  const pw = 428, ph1 = 424, ph2 = 452;
  const cells = [
    [60, 128, ph1, 'UNIT 1: SOCIALISATION AND CULTURE', BLUE,
      ['\u2022 Culture, socialisation, identity (Lessons 1\u20133).',
       '\u2022 Family and its patterns (Lesson 4\u20135).',
       '\u2022 Youth cultures: CCCS, bricolage, incorporation (Lesson 6).',
       '\u2022 Youth deviance: strain, subcultures, labelling, the curve\u2019s caveat, moral panics (Lesson 7).',
       '\u2022 RETRIEVE BY: the joints \u2014 the curve\u2019s dark figure, the spiral, Cohen\u2019s two appearances.']],
    [510, 128, ph1, 'UNIT 2 CORE: METHODS OF ENQUIRY', GREEN,
      ['\u2022 Planning: hypotheses, operationalisation, sampling, ethics (Lesson 8).',
       '\u2022 Quantitative: questionnaires, statistics, experiments, content analysis (Lesson 9).',
       '\u2022 Qualitative: interviews, observation, trustworthiness (Lesson 10).',
       '\u2022 Evaluation: the four validities, the three rivals, the synopsis machine (Lesson 11).',
       '\u2022 RETRIEVE BY: the checklist and the three piles \u2014 they run every item question.']],
    [960, 128, ph1, 'UNIT 2 OPTIONS', RED,
      ['\u2022 Education: theories, the gap\u2019s four facts, the labelling chain, policy (Lesson 12).',
       '\u2022 Media: the chain, the ladder, the effects map, panics, platforms (Lesson 13).',
       '\u2022 Religion: the theories, the debate\u2019s two-clause verdict, organisations, fundamentalism (Lesson 14).',
       '\u2022 RETRIEVE BY: the five sentences of each lesson\u2019s final page \u2014 they were written for this moment.']],
    [60, 572, ph2, 'THE JOINTS (RETRIEVE DAILY)', PURPLE,
      ['\u2022 Labelling: deviance, attainment, frames.',
       '\u2022 Amplification: panics, platform outrage.',
       '\u2022 The dark figure and constructed measures everywhere.',
       '\u2022 Compensation and the deprived: sects, subcultures, Pentecostalism.',
       '\u2022 Believing without belonging as identity measurement.']],
    [510, 572, ph2, 'THE SKILLS (BUILD WEEKLY)', AMBER,
      ['\u2022 The six moves, the four jobs (Lesson 15).',
       '\u2022 Name-date-finding-weight citation.',
       '\u2022 Steel-manning with the surviving concession.',
       '\u2022 The audit: circle, underline, star.',
       '\u2022 Timed plans: three lines, then the four moves.']],
    [960, 572, ph2, 'THE METHOD OF REVISION', DARK,
      ['\u2022 Space it: retrieve each lesson a day apart, then a week \u2014 cramming builds recall that lasts days.',
       '\u2022 Test, don\u2019t re-read: closed-book page summaries, then check.',
       '\u2022 Rotate: one Unit 1, one core, one option, one skills drill per cycle.',
       '\u2022 Prioritise the faulty joint: audit finds it; the joint gets the next cycle.']],
  ];
  cells.forEach(([bx, by, ph, hd, col, parts]) => {
    box(x, bx, by, pw, ph, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, pw, 8);
    text(x, hd, bx + pw / 2, by + 38, { size: 15.5, bold: true, color: col });
    let y = by + 64;
    parts.forEach(p => { y = wrap(x, p, bx + 20, bx + pw - 20, y, { size: 14, lh: 19 }) + 9; });
  });
  return { file: 'wjec-soc-revision-map.png', w: W, h: HEIGHT };
}

const renderers = [d_commandWords, d_examStrategy, d_revisionMap];

module.exports = { run: (only) => run(renderers, only) };

if (require.main === module) {
  let only = [];
  try { only = String(process.env.RENDER_ONLY || '').split(',').map(s => s.trim()).filter(Boolean); } catch (e) { only = []; }
  run(renderers, only).then(files => console.log(JSON.stringify({ rendered: files })));
}