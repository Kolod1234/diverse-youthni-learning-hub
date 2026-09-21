/*
 * WJEC A2 Criminology, Lesson 6: Miscarriages of justice and the appeal
 * process. Diagrams for pages 4, 7 and 11.
 * Run: node render-unit3-l6.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 4: causes of miscarriages ---------- */
function miscarriageCauses() {
  const [c, x] = make(W, 1086);
  title2(x, 'The causes of miscarriages of justice: how failure modes stack');
  sub2(x, 'Six failure modes, each survivable alone, fatal in combination');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Mistaken identification', BLUE,
      'The honest but wrong eyewitness: a brief, stressed glimpse of a stranger, then a confident courtroom identification. Sincerity makes it worse, because juries believe honest conviction, and the witness genuinely is not lying.'],
    ['False confession', RED,
      'Suspects confess to crimes they did not commit under pressure, exhaustion or suggestion, with vulnerable adults most at risk: Stefan Kiszko confessed under interrogation to a murder he could not have committed.'],
    ['Forensic failure', AMBER,
      'Discredited techniques, contaminated samples and overstated conclusions: the forensic claims against the Birmingham Six and Judith Ward collapsed under later scrutiny, years after the verdicts built on them.'],
    ['Non-disclosure', PURPLE,
      'Material that would have helped the defence stays hidden in police or prosecution files: the withheld psychiatric and scientific material in Ward, and the suppressed evidence in the Six, insulated weak cases from challenge.'],
    ['Defence failure', GREEN,
      'Counsel who missed the point, called no witnesses or was defeated by under-resourcing: a trial defended weakly caps what any later appeal can achieve, because the appeal court sees only what the trial presented.'],
    ['Institutional pressure', DARK,
      'The stampede after public outrages: when a bombing or a murder demands a conviction, demand meets a suspect who fits, and every safeguard weakens at once: the common weather of the classic cases.'],
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
  band(x, 866, 196, 'Wrongful convictions come from stacks, not single mistakes',
    'A weak identification looks survivable; supported by a stretched forensic claim it looks stronger; reinforced by a confession under pressure it looks overwhelming; insulated by undisclosed material and delivered by an under-resourced defence, it becomes a conviction. Each layer makes the others look better than they are, which is why reviewers examine the stack as a whole, not the layers one at a time.',
    { bodyY: 60 });
  return { file: 'crim-miscarriages-causes.png' };
}

/* ---------- Page 7: the correction architecture ---------- */
function appealProcess() {
  const [c, x] = make(W, 1086);
  title2(x, 'The correction architecture: every conviction has a lawful exit');
  sub2(x, 'From any trial court, through gates and tests, to the highest court in the land');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Appeals from the magistrates', BLUE,
      'A defendant convicted by lay magistrates may appeal to the Crown Court by way of a re-hearing, where the case is heard afresh with witnesses, or to the Divisional Court of the High Court by way of case stated on a pure point of law.'],
    ['Appeals from the Crown Court', RED,
      'Convictions and sentences of the Crown Court go to the Court of Appeal, Criminal Division: the defendant appeals conviction or sentence, and the Attorney General may refer an unduly lenient sentence, so the court polices both directions.'],
    ['The fresh evidence gate', AMBER,
      'New material may be admitted if the interests of justice require, weighing availability at trial, probable effect on the verdict and credibility: DNA evidence has transformed the gate, turning some claims of innocence into proof.'],
    ['The safety test', GREEN,
      'Under section 2 of the Criminal Appeal Act 1968, as amended in 1995, the court allows an appeal against conviction if it thinks the conviction unsafe: one test that catches both factual innocence and procedural breakdown.'],
    ['The court powers', PURPLE,
      'On an allowed appeal the court can quash the conviction, substitute a verdict of a lesser offence the evidence supports, or order a retrial before a fresh jury where the interests of justice require one to be held.'],
    ['The Supreme Court', DARK,
      'Above the Court of Appeal sits the Supreme Court for cases raising a point of law of general public importance, with permission required throughout: the final interpretation of what the criminal law means for everyone.'],
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
  band(x, 866, 196, 'A system that audits itself',
    'Two or three layers of review, a safety test wide enough to catch every kind of miscarriage, a fresh evidence gate for what the trial never heard, and defined powers to remedy rather than merely comment: the architecture is the system answering its own darkest failures with machinery rather than apology. Its limits are equally real: it is slow, filtered, and only as good as the record the trial defence left behind.',
    { bodyY: 60 });
  return { file: 'crim-appeal-process.png' };
}

/* ---------- Page 11: the correction pipeline ---------- */
function correctionPipeline() {
  const [c, x] = make(W, 1086);
  title2(x, 'From doubt to freedom: the correction pipeline');
  sub2(x, 'The stages a suspected miscarriage must pass, and what each stage answers');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['The appeal in time', BLUE,
      'The ordinary route: a defendant appeals conviction or sentence within the time limit, on the trial record, arguing errors of law, misdirection, unfairness or unsafe verdicts. Most miscarriage journeys end here, one way or the other.'],
    ['The fresh evidence gate', AMBER,
      'If new material exists, the court weighs its admission: whether it was available at trial, its probable effect on the verdict, and its credibility. The gate is where most genuine innocence claims succeed or fail.'],
    ['The safety test', GREEN,
      'The Court of Appeal asks one question: is the conviction safe, on everything now known? If not, it is quashed or a lesser verdict substituted, or a retrial is ordered. If it is, the appeal fails, however sympathetic the case.'],
    ['The CCRC route', PURPLE,
      'When ordinary appeal rights are exhausted, the Criminal Cases Review Commission investigates: it gathers documents, interviews witnesses and commissions scientific re-testing, and refers cases with a real possibility of a different outcome.'],
    ['The outcomes', RED,
      'Quashing frees the prisoner outright; substitution swaps the verdict for a lesser one; retrial returns the case to a fresh jury; and in the gravest cases, the double jeopardy exception allows a new trial on new and compelling evidence.'],
    ['The aftermath', DARK,
      'Compensation under section 133 of the Criminal Justice Act 1988 demands a new fact proving innocence beyond reasonable doubt, so procedurally vindicated people often receive nothing: the pipeline ends at a doorway, not a restoration.'],
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
  band(x, 866, 196, 'Read the pipeline twice',
    'The optimistic reading: no other institution in history built this much machinery to correct itself, with multiple lawful exits and an investigator of last resort. The pessimistic reading: the pipeline starts only after the damage is done, leaks at the fresh evidence gate, and is travelled most easily by the cases with money, lawyers and publicity. Both readings are true of the same diagram.',
    { bodyY: 60 });
  return { file: 'crim-correction-pipeline.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([miscarriageCauses, appealProcess, correctionPipeline], only);
  console.log(JSON.stringify(done));
})();
module.exports = { miscarriageCauses, appealProcess, correctionPipeline };