/*
 * WJEC A2 Criminology, Lesson 8: Unit 3 controlled assessment preparation.
 * Diagrams for pages 3, 8 and 11.
 * Run: node render-unit3-l8.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 3: the assessment window plan ---------- */
function assessmentPlan() {
  const [c, x] = make(W, 1086);
  title2(x, 'The assessment window plan: every hour with a job');
  sub2(x, 'Proportions you adapt to whatever hours and tasks the live brief contains');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Read the tasks first', BLUE,
      'Minutes spent writing one line per task: its command word, its focus, its weight. The tasks are your specification for everything that follows, and their weights set the proportions of the whole window.'],
    ['Read and annotate', PURPLE,
      'Read the pack against the tasks with a purpose, annotating by gate: complete, reliable, lawful, balanced, linchpin. One word per document turns the folder into an argument map before any writing begins.'],
    ['Plan before writing', AMBER,
      'Five minutes of outline per answer: which gate, which quotations, which judgment. A plan is an answer in skeleton, and writing becomes dressing the skeleton instead of reinventing it mid paragraph.'],
    ['Write in proportion', RED,
      'Split the writing time by task weight and hold the split: when the allocated time for a task ends, the task ends. A good complete answer outranks a brilliant unfinished one, in every task, every time.'],
    ['Write the review task', GREEN,
      'The five movements: frame of criteria, findings by gate with quotation, interactions, judgment with the counter argument answered, and the recommendation where the task invites one.'],
    ['Run the final audit', DARK,
      'The last ten minutes: command words obeyed, quotations present, standards named, ranking visible, judgments delivered, recommendations tied to machinery. The cheap losses caught cheaply.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 20, py + 44, i + 1, p[0], p[1], 21);
    wrap(x, p[2], px + 26, px + PW - 26, py + 92, { size: 17, lh: 24 });
  });
  arrow(x, cols[0] + PW + 4, 285, cols[1] - 4, 285, { color: GREY, lw: 4 });
  arrow(x, cols[1] + PW + 4, 285, cols[2] - 4, 285, { color: GREY, lw: 4 });
  arrow(x, cols[2] + PW / 2, rows[0] + PH + 4, cols[0] + PW - 90, rows[1] - 6, { color: GREY, lw: 4 });
  band(x, 866, 196, 'The proportions are the lesson',
    'Whatever hours the window gives you, the shape holds: task reading first, annotated pack second, plans before paragraphs, writing split by weight, and an audit at the end. Candidates rarely lose this assessment to missing knowledge; they lose it to a structure that spent its time where its marks were not.',
    { bodyY: 60 });
  return { file: 'crim-assessment-plan.png' };
}

/* ---------- Page 8: the unit knowledge map ---------- */
function unit3Map() {
  const [c, x] = make(W, 1086);
  title2(x, 'Unit 3 in one view: six territories, one journey, one skill');
  sub2(x, 'Redraw this map from memory weekly until the assessment: the redrawing is the revision');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Investigation', BLUE,
      'Personnel from the first officer to the digital specialist; techniques from cordons to surveillance; evidence handling under chain of custody; PACE interviews with appropriate adults; material, testimonial and digital evidence, class and individual.'],
    ['Prosecution', RED,
      'The CPS, independent under the Prosecution of Offences Act 1985; the Full Code Test, evidential then public interest; cautions and community resolutions; bail under the 1976 Act; mode of trial and the plea before venue.'],
    ['Courts', AMBER,
      'The hierarchy from the magistrates court to the Supreme Court; lay benches with legal advisers, District Judges alone; the courtroom cast; the judicial ladder and the independence protections; sentencing caps and committals.'],
    ['Trial and verdict', PURPLE,
      'Pleas and preparation with special measures; the trial sequence; jury eligibility, selection and challenges; deliberation and the verdict ladder from unanimity to retrial; jury secrecy, equity and the Contempt of Court Act 1981.'],
    ['Influences', GREEN,
      'Media through agenda setting, fear and pre-trial publicity; politics through legislation, minimums and funding; the judiciary through precedent and discretion; each stream dammed by its safeguards, from contempt law to appellate review.'],
    ['Correction', DARK,
      'The safety test of the Criminal Appeal Act 1968; fresh evidence; quashing, substitution and retrial; the Criminal Cases Review Commission and its real possibility test; the double jeopardy exception; compensation and its demanding proof.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 20, py + 44, i + 1, p[0], p[1], 21);
    wrap(x, p[2], px + 26, px + PW - 26, py + 92, { size: 17, lh: 24 });
  });
  arrow(x, cols[0] + PW + 4, 285, cols[1] - 4, 285, { color: GREY, lw: 4 });
  arrow(x, cols[1] + PW + 4, 285, cols[2] - 4, 285, { color: GREY, lw: 4 });
  arrow(x, cols[2] + PW / 2, rows[0] + PH + 4, cols[0] + PW - 90, rows[1] - 6, { color: GREY, lw: 4 });
  band(x, 866, 196, 'One case runs through all six',
    'A single case journey travels the whole map, so assessment tasks can ask about any stage or any connection: how a weak investigation reached a verdict through a charging decision, how pressure met its dam, how the correction machinery receives what the four gates found. Cover the panels and redraw them; the thinnest panel you draw is your next revision hour, and the connections between panels are the difference between six lessons and one subject.',
    { bodyY: 60 });
  return { file: 'crim-unit3-map.png' };
}

/* ---------- Page 11: the final audit checklist ---------- */
function taskAudit() {
  const [c, x] = make(W, 1086);
  title2(x, 'The final audit: six checks in ten minutes');
  sub2(x, 'Audit is correction, not composition: run the checks, catch the cheap losses, submit');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Command words obeyed', BLUE,
      'Every task reread once against its answer: is a description describing, an evaluation evaluating, a review reviewing? The disaster answer is the right content answering the wrong demand, and it is entirely preventable.'],
    ['Quotations present', PURPLE,
      'Every review paragraph carries at least one exact detail from the pack: the three seconds, the ten weeks, the retracted letter. Assertion without quotation is the weakest band habit, and the cheapest to fix at audit.'],
    ['Standards named', GREEN,
      'Each judgment quotes its rule: the PACE provisions, the disclosure duty, the identification warning, the safety test. They broke the rules earns nothing; the code and the section earn the band.'],
    ['Ranking visible', AMBER,
      'The linchpin weakness is named as the linchpin, and the minor items are called minor. A page of equal-weight observations is a list; ranking is what makes it a review.'],
    ['Judgment delivered', RED,
      'Each review ends: safe, unsafe or arguable, with the discipline of each (doubt answered, gate failure quoted, tipping point named), and the strongest counter argument stated and answered.'],
    ['Recommendations tied', DARK,
      'Where a task invites next steps, they use the machinery of the unit: appeal by re-hearing, case stated, the safety test, the commission, the exception. Something should be done is not a recommendation.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 20, py + 44, i + 1, p[0], p[1], 20);
    wrap(x, p[2], px + 26, px + PW - 26, py + 92, { size: 17, lh: 24 });
  });
  arrow(x, cols[0] + PW + 4, 285, cols[1] - 4, 285, { color: GREY, lw: 4 });
  arrow(x, cols[1] + PW + 4, 285, cols[2] - 4, 285, { color: GREY, lw: 4 });
  arrow(x, cols[2] + PW / 2, rows[0] + PH + 4, cols[0] + PW - 90, rows[1] - 6, { color: GREY, lw: 4 });
  band(x, 866, 196, 'The cheapest marks in the assessment',
    'The audit adds no new analysis and invents no new argument: it protects the work already written from the losses that happen in every sustained task, the missing quote, the vague standard, the trailing ending, the unanswered objection. Ten minutes, six checks, and the answer submitted is the answer you are actually capable of.',
    { bodyY: 60 });
  return { file: 'crim-task-audit.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([assessmentPlan, unit3Map, taskAudit], only);
  console.log(JSON.stringify(done));
})();
module.exports = { assessmentPlan, unit3Map, taskAudit };