/*
 * Renders the three WJEC AS Sociology Lesson 15 (Building Sociological Arguments) diagrams.
 * Uses the shared diagram-helpers.cjs — same visual language as the rest of the set.
 * Output: public/lesson-assets/wjec-as-sociology/. RENDER_ONLY env filter when run directly.
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, run, arrow, text, W, H: HEIGHT,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

// ---------- 1. Anatomy of a sociological argument (Lesson 15, pages 1–2) ----------
function d_argumentAnatomy() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'The anatomy of a sociological argument');
  sub2(x, 'six moves, in order \u2014 the machine inside every paragraph, model answer and essay you will write');
  const bw = 1330, bh = 138;
  const nodes = [
    ['1', 'THE CLAIM', BLUE,
      'a sentence that could be disagreed with: "Comprehensivisation reduced inequality between schools but moved selection inside them." Not a fact, not a topic \u2014 an assertion the answer exists to support.'],
    ['2', 'THE DEFINITION', PURPLE,
      'the terms the claim rides on, defined before use: selection, comprehensivisation, inequality. An argument built on undefined terms collapses at the first examiner question \u2014 definitions are load-bearing.'],
    ['3', 'THE EVIDENCE', GREEN,
      'named, dated, finding-stated: "Lacey (1970) found pupils polarised around the school\u2019s ranking into pro- and anti-school worlds." A study cited without its finding is decoration; a finding cited without its study is hearsay.'],
    ['4', 'THE REASONING', AMBER,
      'the "why does this support the claim" step: the chain from evidence to claim made explicit \u2014 "so the school\u2019s own sorting produced the identities, meaning selection survived its formal abolition." Skipped reasoning is the most common lost mark in the subject.'],
    ['5', 'THE COUNTER-MOVE', RED,
      'the strongest opposing case, stated fairly before being answered: "The objection says the sets merely measured prior ability \u2014 but the borderline case (page 9) shows identical pupils diverging by placement, which measurement alone cannot produce."'],
    ['6', 'THE VERDICT', DARK,
      'the adjudication: where the weight falls and why \u2014 "so the counter-case survives in principle but fails on the evidence; the claim stands with its scope stated." A verdict is a judgement with reasons, not a summary.'],
  ];
  nodes.forEach((n, i) => {
    const by = 130 + i * (bh + 12);
    box(x, 35, by, bw, bh, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = n[2]; x.fillRect(35, by, bw, 8);
    panelHeader(x, 52, by + 58, n[0], n[1], n[2], 18);
    wrap(x, n[3], 360, 1350, by + 46, { size: 15.5, lh: 22 });
  });
  band(x, 902, 130, 'THE TWO SENTENCES TO REMEMBER',
    'Description reports what is there ("Becker found teachers classify pupils"); argument claims and supports ("Becker\u2019s finding means the gap is partly produced in classrooms, which the sifting theory cannot survive"). ' +
    'Every mark above AO1 is paid for the second kind of sentence \u2014 and the six moves are simply how the second kind gets built, every time, in any topic.',
    { size: 15.5, bodyY: 50 });
  return { file: 'wjec-soc-argument-anatomy.png', w: W, h: HEIGHT };
}

// ---------- 2. Evidence weights: what makes a study stronger (Lesson 15, page 4) ----------
function d_evidenceWeights() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'Weighing evidence: what makes one study stronger than another');
  sub2(x, 'the five weighing questions \u2014 the AS skill of preferring evidence rather than merely citing it');
  const pw = 430, ph = 350;
  const cells = [
    [60, 130, '1. DESIGN STRENGTH', BLUE,
      ['\u2022 what rivals did the design exclude? (Lesson 11\u2019s three: reverse, spurious, chance)',
       '\u2022 an experiment excludes all three; a cross-sectional survey excludes none.',
       '\u2022 THE WEIGHTING: a finding from a design that could have produced it anyway (a correlation explained by a third variable) is weak evidence, whatever its sample size.']],
    [514, 130, '2. MEASUREMENT FIT', RED,
      ['\u2022 does the measure capture the concept, or an adjacent one?',
       '\u2022 attendance is not religion; self-report is not behaviour.',
       '\u2022 THE WEIGHTING: a perfectly-sampled study of the wrong measure weighs less than a rougher study of the right one \u2014 measure first (Lesson 11\u2019s cascade).']],
    [968, 130, '3. REPLICATION', GREEN,
      ['\u2022 has anyone found it again?',
       '\u2022 the age\u2013crime curve is replicated across decades \u2014 a pattern; a single surprising finding is a lead.',
       '\u2022 THE WEIGHTING: one study is a data point; two independent teams agreeing is evidence; a finding nobody could re-find is the file drawer\u2019s neighbour.']],
    [60, 510, '4. SAMPLE AND FRAME', AMBER,
      ['\u2022 who is the evidence about? Frame, technique, response.',
       '\u2022 a finding on 24% of a postal sample carries a self-selected population only.',
       '\u2022 THE WEIGHTING: state what the sample CAN carry (Lesson 8\u2019s question), and never let a conclusion out-run it \u2014 scope is part of the evidence\u2019s weight.']],
    [514, 510, '5. TRIANGULATION', PURPLE,
      ['\u2022 what else points the same way?',
       '\u2022 Morley\u2019s decodings, content-analytic counts and platform data agreeing is harder to dismiss than any one.',
       '\u2022 THE WEIGHTING: convergent evidence from different instruments beats stronger-looking evidence from one instrument \u2014 disagreement between methods is also data.']],
    [968, 510, 'USING THE WEIGHTS IN AN ESSAY', DARK,
      ['\u2022 cite with the weight attached: "a field experiment (design strong) on volunteers (frame limited)".',
       '\u2022 then PREFER: "this weighs more than the survey evidence because\u2026"',
       '\u2022 the phrase "this evidence is stronger because" is worth more marks than five extra citations \u2014 preferring is evaluation; listing is recall.']],
  ];
  cells.forEach(([bx, by, hd, col, parts]) => {
    box(x, bx, by, pw, ph, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, pw, 8);
    text(x, hd, bx + pw / 2, by + 42, { size: 17, bold: true, color: col });
    let y = by + 76;
    parts.forEach(p => { y = wrap(x, p, bx + 22, bx + pw - 22, y, { size: 14.5, lh: 20 }) + 12; });
  });
  return { file: 'wjec-soc-evidence-weights.png', w: W, h: HEIGHT };
}

// ---------- 3. The essay's architecture (Lesson 15, pages 7, 10) ----------
function d_essayArchitecture() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'The assessment essay\u2019s architecture');
  sub2(x, 'four moves over three paragraphs-with-jobs \u2014 the structure that survives any sociology question');
  // left: the four moves column
  box(x, 60, 130, 620, 640, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
  x.fillStyle = BLUE; x.fillRect(60, 130, 620, 8);
  text(x, 'THE FOUR MOVES (WHOLE ESSAY)', 370, 176, { size: 22, bold: true, color: BLUE });
  const moves = [
    ['1. OUTLINE', 'what the claim means, what it turns on, and how the answer will decide it \u2014 the loaded word identified and defined before any evidence appears.'],
    ['2. APPLY', 'the strongest case FOR the claim, at full strength: theory plus evidence, cited with weights \u2014 the version its defender would sign.'],
    ['3. EVALUATE', 'the strongest case AGAINST, plus the evidence-weighing: where the designs are weakest, which findings replicate, whose sample carries what.'],
    ['4. ADJUDICATE', 'the verdict: where the weight falls, on what evidence, and \u2014 the mark-bearing clause \u2014 what the answer would take to change its mind.'],
  ];
  let my = 216;
  moves.forEach(m => {
    text(x, m[0], 100, my, { size: 16, bold: true, color: GREY, align: 'left' });
    my = wrap(x, m[1], 100, 640, my + 24, { size: 15, lh: 21 }) + 18;
  });
  // right: paragraph jobs
  box(x, 738, 130, 620, 640, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
  x.fillStyle = PURPLE; x.fillRect(738, 130, 620, 8);
  text(x, 'THE PARAGRAPH\u2019S FOUR JOBS (EVERY ONE)', 1048, 176, { size: 22, bold: true, color: PURPLE });
  const jobs = [
    ['POINT', 'the paragraph\u2019s claim, stated first \u2014 a topic sentence that could be disagreed with.'],
    ['EVIDENCE', 'the named, dated, weighted study or pattern that bears on the point.'],
    ['EXPLAIN', 'the reasoning that connects them \u2014 why this evidence supports this point, which is where analysis marks live.'],
    ['LINK', 'the sentence back to the question\u2019s claim \u2014 the paragraph\u2019s verdict-in-miniature, and the bridge to the next point.'],
  ];
  let jy = 216;
  jobs.forEach(j => {
    text(x, j[0], 778, jy, { size: 16, bold: true, color: GREY, align: 'left' });
    jy = wrap(x, j[1], 778, 1318, jy + 24, { size: 15, lh: 21 }) + 18;
  });
  band(x, 800, 180, 'THE DIAGNOSIS OF THE THREE COMMON FAULTS',
    'THE LIST ESSAY ("functionalism says\u2026 Marxism says\u2026 interactionism says\u2026") has moves but no paragraph jobs: it never reasons from evidence to point, so it describes. ' +
    'THE SEE-SAW ("on the one hand\u2026 on the other\u2026 in conclusion, both matter") has moves but no weights: nothing is preferred, so no evaluation happens. ' +
    'THE QUOTE-DROP ("Becker 1971 said teachers label pupils") has evidence but no name-and-finding discipline: the study appears, the finding never does, so nothing can be weighed. ' +
    'Each fault is one column left un-built \u2014 and the architecture shows which.',
    { size: 15.5, bodyY: 54 });
  return { file: 'wjec-soc-essay-architecture.png', w: W, h: HEIGHT };
}

const renderers = [d_argumentAnatomy, d_evidenceWeights, d_essayArchitecture];

module.exports = { run: (only) => run(renderers, only) };

if (require.main === module) {
  let only = [];
  try { only = String(process.env.RENDER_ONLY || '').split(',').map(s => s.trim()).filter(Boolean); } catch (e) { only = []; }
  run(renderers, only).then(files => console.log(JSON.stringify({ rendered: files })));
}