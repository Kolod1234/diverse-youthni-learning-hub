/*
 * Renders the three WJEC AS Sociology Lesson 12 (Education, Inequality, Policy and Theory) diagrams.
 * Uses the shared diagram-helpers.cjs — same visual language as the rest of the set.
 * Output: public/lesson-assets/wjec-as-sociology/. RENDER_ONLY env filter when run directly.
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, run, arrow, text, W, H: HEIGHT,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

// ---------- 1. Two theories of schooling (Lesson 12, pages 2–5) ----------
function d_schoolTheories() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'What is school for? Functionalism and Marxism compared');
  sub2(x, 'the same institution, read two ways \u2014 the debate that structures every education question WJEC asks');
  const pw = 654, ph = 700;
  const drawCol = (bx, hd, col, rows) => {
    box(x, bx, 130, pw, ph, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, 130, pw, 8);
    text(x, hd, bx + pw / 2, 178, { size: 26, bold: true, color: col });
    let y = 216;
    rows.forEach(r => {
      text(x, r[0], bx + pw / 2, y, { size: 16, bold: true, color: GREY });
      y = wrap(x, r[1], bx + 26, bx + pw - 26, y + 26, { size: 16, lh: 22 }) + 20;
    });
  };
  drawCol(60, 'FUNCTIONALISM', BLUE, [
    ['DURKHEIM: SOLIDARITY', 'school transmits the shared norms that hold a complex society together and teaches the specialist skills the division of labour needs \u2014 education is society\u2019s second socialiser (family is first).'],
    ['PARSONS: THE BRIDGE', 'school is the bridge between family particularism (a child is loved whatever) and society\u2019s universalism (achievement judged by shared standards) \u2014 it teaches the rules of the wider world.'],
    ['DAVIS AND MOORE: ROLE ALLOCATION', 'schools sift and sort by ability, so the most able fill the most important jobs \u2014 unequal rewards follow unequal contributions, and meritocracy is the mechanism that justifies the inequality.'],
    ['LIMITATION', 'whose merit? The gap between class attainment measured at entry and at exit (page 6) says the sifting is not measuring ability alone \u2014 the assumption of a value consensus is the theory\u2019s weak wall.'],
  ]);
  drawCol(734, 'MARXISM', RED, [
    ['ALTHUSSER: THE IDEOLOGICAL STATE APPARATUS', 'education reproduces ruling-class ideas (obedience, hierarchy, \u201cyour place\u201d) while pretending to transmit neutral knowledge \u2014 school legitimate what capitalism needs.'],
    ['BOWLES AND GINTIS: THE CORRESPONDENCE PRINCIPLE', 'school mirrors the workplace: hierarchy, external rewards, fragmentation of learning as of tasks \u2014 the hidden curriculum produces the worker capitalism requires, while the myth of meritocracy blames those it fails.'],
    ['WILLIS: RESISTANCE (A QUALIFICATION)', 'Learning to Labour (1977): the working-class \u201clads\u201d saw through the meritocratic myth \u2014 and their counter-school culture (misrecognising manual work as freedom) delivered them into exactly the jobs the system had waiting.'],
    ['LIMITATION', 'determinism \u2014 if school simply reproduces capitalism, no reform, no teaching and no individual escape could happen; Willis\u2019 own lads show pupils reading the school against it, which reproduction theory cannot quite contain.'],
  ]);
  band(x, 866, 150, 'THE DEBATE IN ONE SENTENCE',
    'functionalism explains what school does for society; Marxism explains what society does through school \u2014 and every later question (the gap, labelling, policy) is a test of which account the evidence fits better. ' +
    'Note the examinable asymmetry: functionalism\u2019s test is the honest sifting of merit (page 6\u2019s gap fails it); Marxism\u2019s test is reproduction (Willis\u2019 resistance complicates it).',
    { size: 15.5, bodyY: 52 });
  return { file: 'wjec-soc-school-theories.png', w: W, h: HEIGHT };
}

// ---------- 2. From label to subculture: the interactionist chain (Lesson 12, page 8) ----------
function d_labellingChain() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'From teacher label to pupil subculture');
  sub2(x, 'the interactionist chain the specification expects in full: five named links, one classic study each');
  const bw = 580, bh = 175;
  const LX = 70, RX = 798;
  const LY = [140, 345, 550];
  const nodes = [
    [LX, LY[0], 1, 'THE LABEL', BLUE,
      'teachers classify pupils from the evidence they meet first \u2014 Becker (1971): the \u201cideal pupil\u201d is a middle-class construct, and dress, speech and manner all enter the classification.'],
    [LX, LY[1], 2, 'THE EXPECTATION', PURPLE,
      'the label becomes a settled expectation of ability and behaviour \u2014 streaming and setting turn it into structure (which class, which table, which tier of entry).'],
    [LX, LY[2], 3, 'THE SELF-FULFILLING PROPHECY', GREEN,
      'Rosenthal and Jacobson (1968): pupils live up to (or down to) what is expected \u2014 the randomly-labelled \u201cbloomers\u201d bloomed, because expectation changed how they were taught and how they saw themselves.'],
    [RX, LY[0], 4, 'DIFFERENTIATION AND POLARISATION', RED,
      'Lacey (1970): the school differentiates (ranks by achievement) and pupils polarise around the ranking \u2014 pro-school and anti-school identities are its two stable responses.'],
    [RX, LY[1], 5, 'PUPIL SUBCULTURES', AMBER,
      'Hargreaves (1967) and Abraham (1989): the sets of values and behaviours a group shares \u2014 \u201cpro-school\u201d conforming, \u201canti-school\u201d inverting (dossing, messing, having a laff); Willis\u2019 lads are its classic case.'],
    [RX, LY[2], 6, 'BACK TO THE LABEL', DARK,
      'the subculture\u2019s behaviour confirms the teacher\u2019s original classification \u2014 the circle closes, and the interaction, not the original ability, has produced the outcome.'],
  ];
  nodes.forEach(n => {
    const [bx, by, num, hd, col, body] = n;
    box(x, bx, by, bw, bh, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, bw, 8);
    panelHeader(x, bx, by + 52, num, hd, col, 18);
    wrap(x, body, bx + 90, bx + bw - 26, by + 44, { size: 15, lh: 21 });
  });
  arrow(x, LX + bw / 2, LY[0] + bh + 6, LX + bw / 2, LY[1] - 6, { color: GREY });
  arrow(x, LX + bw / 2, LY[1] + bh + 6, LX + bw / 2, LY[2] - 6, { color: GREY });
  arrow(x, LX + bw + 8, LY[2] + bh / 2, RX - 8, LY[2] + bh / 2, { color: GREY });
  arrow(x, RX + bw / 2, LY[2] - 6, RX + bw / 2, LY[1] + bh + 6, { color: GREY });
  arrow(x, RX + bw / 2, LY[1] - 6, RX + bw / 2, LY[0] + bh + 6, { color: GREY });
  arrow(x, RX - 8, LY[0] + bh / 2, LX + bw + 8, LY[0] + bh / 2, { color: GREY });
  band(x, 770, 180, 'THE INTERACTIONIST\u2019S TWO LIMITS \u2014 AND THE STRUCTURALIST\u2019S BRIDGE',
    'interactionism explains how a label becomes an outcome but not where the labels come from \u2014 Becker\u2019s \u201cideal pupil\u201d being middle-class is a class structure operating through a teacher\u2019s head. ' +
    'The complete account is two-storey: the structural theories (pages 2\u20135) explain the conditions, the interactionist chain explains the mechanism \u2014 and the strongest essays run both: class supplies the labels, the classroom turns them into attainment.',
    { size: 15.5, bodyY: 52 });
  return { file: 'wjec-soc-labelling-chain.png', w: W, h: HEIGHT };
}

// ---------- 3. The attainment gap: home, school and policy (Lesson 12, page 7) ----------
function d_attainmentGap() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'Explaining the class attainment gap: home, school and policy');
  sub2(x, 'the pattern is established; the argument is between the panels \u2014 and the argument is examinable');
  const pw = 420, ph = 360;
  const cells = [
    [60, 130, 'HOME: MATERIAL AND CULTURAL', BLUE,
      ['\u2022 material deprivation: income, housing, space, diet, transport, resources \u2014 poverty costs attainment directly (Douglas: the post-war era\u2019s founding study of the long tail of disadvantage).',
       '\u2022 cultural capital: Bourdieu \u2014 the educated home transmits the language, tastes and confidence school rewards, so school\u2019s \u201cmeritocratic\u201d yardstick already measures home advantage.',
       '\u2022 language codes: Bernstein \u2014 the restricted and elaborated codes of class speech: the school\u2019s code is the middle-class one, and its tests are code tests.']],
    [514, 130, 'SCHOOL: PROCESSES AND PRACTICE', RED,
      ['\u2022 labelling and expectations: Becker\u2019s ideal pupil, Rosenthal and Jacobson\u2019s bloomers \u2014 the school does not just measure gaps, it widens them (page 8\u2019s chain).',
       '\u2022 setting and tiering: the gap is structured into groups, tiers of entry and option blocks \u2014 placements follow behaviour and background as much as attainment.',
       '\u2022 curriculum and assessment: whose knowledge is examined, and how \u2014 a contest hidden inside the yardstick itself.']],
    [968, 130, 'POLICY: STRUCTURE AND CHOICE', GREEN,
      ['\u2022 selection and marketisation: quasi-markets, league tables and parental \u201cchoice\u201d (Ball) sort pupils and schools \u2014 the \u201cparentocracy\u201d (Brown) lets middle-class advantage operate as choice (Gewirtz\u2019s choosers).',
       '\u2022 resourcing and area effects: funding formulas, catchments and house prices \u2014 the purchase of a school place through the property market.',
       '\u2022 compensatory policy: its assumption (home is the problem) is itself the argument: do the panels above fail the school, or does the school fail the pupil?']],
  ];
  cells.forEach(([bx, by, hd, col, parts]) => {
    box(x, bx, by, pw, ph, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, pw, 8);
    text(x, hd, bx + pw / 2, by + 42, { size: 18, bold: true, color: col });
    let y = by + 76;
    parts.forEach(p => { y = wrap(x, p, bx + 22, bx + pw - 22, y, { size: 14.5, lh: 20 }) + 14; });
  });
  band(x, 530, 250, 'HOW THE ESSAY DECIDES \u2014 THE THREE-STEP MOVE',
    'STEP 1: the pattern is real and enormous \u2014 FSM and non-FSM attainment differ from the first years of schooling (the descriptive layer, which no panel contests). ' +
    'STEP 2: the panels are not rivals but levels \u2014 home advantage is real, and school converts it into attainment through labels, placements and yardsticks; policy decides both (what counts as choice, funding and selection). ' +
    'STEP 3: the verdict is evidence-weighed, not balanced \u2014 compensatory policies that assume home alone leave the school\u2019s own widening untouched, and the interactionist evidence (page 8) is the empirical reason home-only accounts fail. ' +
    'This is the AS examination\u2019s most repeatable essay shape: pattern \u2192 levels \u2192 verdict.',
    { size: 15.5, bodyY: 54 });
  return { file: 'wjec-soc-attainment-gap.png', w: W, h: HEIGHT };
}

const renderers = [d_schoolTheories, d_labellingChain, d_attainmentGap];

module.exports = { run: (only) => run(renderers, only) };

if (require.main === module) {
  let only = [];
  try { only = String(process.env.RENDER_ONLY || '').split(',').map(s => s.trim()).filter(Boolean); } catch (e) { only = []; }
  run(renderers, only).then(files => console.log(JSON.stringify({ rendered: files })));
}