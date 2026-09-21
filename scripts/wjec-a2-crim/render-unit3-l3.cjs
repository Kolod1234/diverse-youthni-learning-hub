/*
 * WJEC A2 Criminology, Lesson 3: The criminal courts of England and Wales:
 * structure and personnel. Diagrams for pages 3, 8 and 11.
 * Run: node render-unit3-l3.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 3: the court hierarchy ---------- */
function courtHierarchy() {
  const [c, x] = make(W, 1086);
  title2(x, 'The criminal courts of England and Wales: how a case travels');
  sub2(x, 'Unit 3 Learning Outcome 3: two courts decide cases, two courts review them');

  const cols = [140, 748], PW = 560, rows = [130, 520], PH = 330;
  const panels = [
    ['The magistrates court', BLUE,
      'Where every criminal case begins: all summary only offences, most either way offences, and the first hearing of every case whatever its category. Decided by a bench of three lay magistrates or a District Judge, with custody capped at six months for a single offence and an unlimited fine.',
      'Nearly all cases finish here; contested and heavier cases travel upward.'],
    ['The Crown Court', RED,
      'Trials on indictment before a judge and jury: every indictable only offence, plus either way cases committed or elected, and cases sent up for sentence when magistrates powers are not enough. Also hears appeals from the magistrates court by way of a re-hearing.',
      'Appeals against conviction and sentence rise to the Court of Appeal.'],
    ['The Court of Appeal, Criminal Division', AMBER,
      'The appellate court for Crown Court cases. It does not re-try cases with juries: it examines the record and asks whether a conviction is unsafe or a sentence wrong in principle, and it can quash a conviction, order a retrial or change a sentence.',
      'Its decisions can climb one final step on points of law.'],
    ['The Supreme Court', PURPLE,
      'The final court of the United Kingdom, open since 2009. It hears only cases raising a point of law of general public importance, and only with permission. Its rulings bind every court below it and settle what the criminal law means for everyone.',
      'The last word on the meaning of the law, not on the safety of verdicts.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 2], py = rows[Math.floor(i / 2)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 20, py + 44, i + 1, p[0], p[1], 22);
    const y = wrap(x, p[2], px + 26, px + PW - 26, py + 92, { size: 18, lh: 26 });
    wrap(x, p[3], px + 26, px + PW - 26, y + 40, { size: 17, lh: 24, color: GREEN });
  });
  arrow(x, cols[0] + PW + 4, 295, cols[1] - 4, 295, { color: GREY, lw: 4 });
  arrow(x, cols[1] + 40, rows[0] + PH + 4, cols[0] + PW - 60, rows[1] - 6, { color: GREY, lw: 4 });
  arrow(x, cols[0] + PW + 4, 685, cols[1] - 4, 685, { color: GREY, lw: 4 });
  band(x, 880, 186, 'Why the structure matters',
    'Two working courts decide cases; two appeal courts correct them. The design separates judging from reviewing, and routes each case to the level of seriousness and complexity it deserves. Reviewers use the structure to ask two questions: did this case sit in the right court with the right personnel and powers, and if the verdict was wrong, was the appeal route genuinely open to the defendant?',
    { bodyY: 60 });
  return { file: 'crim-courts-hierarchy.png' };
}

/* ---------- Page 8: courtroom personnel ---------- */
function courtPersonnel() {
  const [c, x] = make(W, 1086);
  title2(x, 'The courtroom: who does what');
  sub2(x, 'Every role below is a safeguard on the others, and a fair trial needs every one of them performed');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['The judge or bench', BLUE,
      'In the Crown Court a single professional judge controls the trial: rules on the law and admissibility, directs the jury and passes sentence. In the magistrates court a bench of three lay magistrates does the same job, advised on the law by the legal adviser.'],
    ['The legal adviser', RED,
      'A qualified lawyer beside the lay bench. Advises the magistrates on law, procedure and the sentencing powers available, and keeps the hearing lawful without deciding it: the adviser knows the law, the bench owns the decision.'],
    ['The usher', AMBER,
      'Runs the room around the decision makers: calls parties and witnesses into court, administers oaths, looks after exhibits, and keeps the public and press in order, so the hearing moves in sequence and on the record.'],
    ['The prosecution advocate', GREEN,
      'Presents the case for the state: a CPS lawyer in the magistrates court, or a barrister or Higher Court Advocate in the Crown Court. Opens the case, leads witnesses through evidence, and must act fairly, not merely to convict.'],
    ['The defence advocate', PURPLE,
      'Represents the defendant: challenges prosecution evidence, cross examines witnesses, advises on plea and puts the defence case. An officer of the court whose duty to justice overrides any instruction that would mislead it.'],
    ['The witness', DARK,
      'Supplies the testimony most trials turn on, on oath or affirmation, from the witness box: examined, cross examined and re-examined. The quality of that testimony links straight back to the evidence handling of Lesson 1.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 20, py + 44, i + 1, p[0], p[1], 21);
    wrap(x, p[2], px + 26, px + PW - 26, py + 92, { size: 18, lh: 26 });
  });
  band(x, 866, 196, 'A fair trial is a system, not a person',
    'Each role checks the others: the judge controls the advocates, the advocates test the witnesses, the legal adviser keeps the bench lawful, and the jury or bench decides only on what survives that testing. A review should ask whether every role was actually performed, because a trial where one role failed, for instance a defence that never challenged key evidence, may not produce a safe verdict.',
    { bodyY: 60 });
  return { file: 'crim-courts-personnel.png' };
}

/* ---------- Page 11: the judicial ladder ---------- */
function judiciaryLadder() {
  const [c, x] = make(W, 1086);
  title2(x, 'Who sits in judgment: from the lay bench to the Court of Appeal');
  sub2(x, 'The ladder of judges in the criminal courts, and the protections that keep every rung independent');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Lay magistrates', BLUE,
      'Volunteers from the local community, not lawyers, sitting in benches of three in the magistrates court. Appointed locally on merit after interview, trained by the Judicial College, and advised on the law by a qualified legal adviser.'],
    ['District Judge', AMBER,
      'A solicitor or barrister of at least five years standing, appointed through open competition, who sits alone in the magistrates court, usually in the busier courts and on longer, procedural or complex cases such as extradition.'],
    ['Recorder', PURPLE,
      'A part-time Crown Court judge, usually a practising barrister or solicitor of at least ten years standing. Tries either way cases and less serious indictable cases, sitting a set number of days a year while continuing in practice.'],
    ['Circuit Judge', RED,
      'A full-time Crown Court judge who tries the heavier indictable cases, such as robbery and serious drugs cases, hears appeals from the magistrates court, and presides over the daily lists of every Crown Court centre.'],
    ['High Court Judge', GREEN,
      'A justice of the High Court, the senior judiciary, who presides over the gravest trials including murder, and also sits in the Divisional Court and the Court of Appeal.'],
    ['Lord or Lady Justice of Appeal', DARK,
      'The judges of the Court of Appeal, Criminal Division, led by the Lord Chief Justice, who review convictions and sentences from the Crown Court. Above them sit the Justices of the Supreme Court, the final court for points of law.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 20, py + 44, i + 1, p[0], p[1], p[3] || (p[0].length > 24 ? 18 : 21));
    wrap(x, p[2], px + 26, px + PW - 26, py + 92, { size: 18, lh: 26 });
  });
  band(x, 866, 196, 'Independence, not just hierarchy',
    'Every level is protected the same way: appointment through open competition on merit, salaries paid without a parliamentary vote, and removal only by an address of both Houses of Parliament. That protection exists so that no judge, from a lay magistrate to a Lord Justice, needs to fear the state, the press or popularity when deciding a case.',
    { bodyY: 60 });
  return { file: 'crim-courts-judiciary.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([courtHierarchy, courtPersonnel, judiciaryLadder], only);
  console.log(JSON.stringify(done));
})();
module.exports = { courtHierarchy, courtPersonnel, judiciaryLadder };