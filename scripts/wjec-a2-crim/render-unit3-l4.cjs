/*
 * WJEC A2 Criminology, Lesson 4: Trial procedure: lay magistrates, juries and
 * verdicts. Diagrams for pages 3, 6 and 11.
 * Run: node render-unit3-l4.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 3: the trial journey ---------- */
function trialJourney() {
  const [c, x] = make(W, 1086);
  title2(x, 'The trial journey: one plea, two roads, one verdict');
  sub2(x, 'Unit 3: how a contested case travels from first hearing to outcome');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['The first hearing', BLUE,
      'Every criminal case starts in the magistrates court whatever its category. The charge is read, the defendant is asked to plead, and the case is sent to the right road: summary cases stay, either way cases are allocated, indictable only cases are sent to the Crown Court.'],
    ['The guilty plea', GREEN,
      'A guilty plea admits the offence, so there is no trial: the court moves directly to sentencing, and an early plea earns credit because it saves court time, spares witnesses and shows acceptance of responsibility.'],
    ['The not guilty plea', PURPLE,
      'A not guilty plea puts the prosecution to its burden: it must prove every element of the offence beyond reasonable doubt, the golden thread from Woolmington v DPP. The case now travels to whichever court will try it.'],
    ['The summary trial', AMBER,
      'In the magistrates court a bench of three lay magistrates, advised on the law by the legal adviser, hears the evidence, decides credibility and returns the verdict: fast, local and cheap, with no jury involved.'],
    ['The jury trial', RED,
      'In the Crown Court a judge controls the law while a jury of twelve decides guilt. The prosecution opens and calls witnesses, the defence tests and answers, the judge sums up, and the jury retires to deliberate in private.'],
    ['Verdict and sentence', DARK,
      'Not guilty ends the case for good: no retrial for the same offence. Guilty moves the case to sentence, guided by the guidelines, with the appeal routes of the hierarchy standing open above the trial court.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 20, py + 44, i + 1, p[0], p[1], 21);
    wrap(x, p[2], px + 26, px + PW - 26, py + 92, { size: 18, lh: 26 });
  });
  arrow(x, cols[0] + PW + 4, 285, cols[1] - 4, 285, { color: GREY, lw: 4 });
  arrow(x, cols[1] + PW + 4, 285, cols[2] - 4, 285, { color: GREY, lw: 4 });
  arrow(x, cols[2] + PW / 2, rows[0] + PH + 4, cols[0] + PW - 90, rows[1] - 6, { color: GREY, lw: 4 });
  arrow(x, cols[0] + PW / 2, rows[1] + PH + 4, cols[2] + PW / 2, rows[1] + PH + 4, { color: GREY, lw: 0 });
  band(x, 866, 196, 'One standard of proof on both roads',
    'Whichever court tries the case, the prosecution must make the decision makers sure of guilt; the defendant never has to prove innocence. A reviewer maps any case onto this diagram in two sentences, then asks the only question that matters: did the road that was chosen deliver a fair hearing and a safe verdict?',
    { bodyY: 60 });
  return { file: 'crim-trial-journey.png' };
}

/* ---------- Page 6: jury selection pipeline ---------- */
function juryPipeline() {
  const [c, x] = make(W, 1086);
  title2(x, 'Choosing twelve strangers: the jury selection pipeline');
  sub2(x, 'From an entry on the electoral register to a sworn juror with a duty to try the case fairly');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Eligibility', BLUE,
      'Aged between eighteen and seventy five, registered to vote at an address, and resident in the United Kingdom for at least five years since the age of thirteen. Since the Criminal Justice Act 2003, jury service is the ordinary civic duty of ordinary people rather than the preserve of a narrow band.'],
    ['Disqualification', RED,
      'Disqualified are people on bail, anyone sentenced to life imprisonment, and anyone sentenced to five or more years custody: all disqualified for life. A custodial sentence of under five years disqualifies for ten years. Certain mental disorders bring excusal or deferral.'],
    ['Deferral and excusal', AMBER,
      'Service can be deferred to a later date for good reason such as exams or booked care, and excused outright only where deferral cannot solve the problem. Most occupations lost their automatic privilege: excusal is now the exception, granted case by case.'],
    ['The random summons', PURPLE,
      'Names are drawn at random from the electoral register and summonses sent. For each trial, names are drawn again at random from the pool in the jury waiting room, and twelve jurors are sworn, with reserves available in long trials so illness does not stop the case.'],
    ['Checks and vetting', GREEN,
      'In certain long or sensitive trials, including terrorism and organised crime cases, the court may order background checks before selection, to guard against a corrupted or unsafe juror: a real risk traded against letting the state screen those who judge the state.'],
    ['Challenges at trial', DARK,
      'Either side may challenge a juror for cause, proving bias or disqualification, and the prosecution alone may stand a juror by without giving any reason at all, returning them to the pool: a one sided power reformers have long questioned.'],
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
  band(x, 866, 196, 'Randomness with controls',
    'Each stage trades a little randomness for a little control: eligibility narrows who can serve, disqualification removes the unsafe, deferral respects real lives, and vetting and challenges guard impartiality in court. The promise the pipeline exists to keep is simple: twelve citizens nobody chose, nobody packed, and nobody can pressure, standing between the accused and the state.',
    { bodyY: 60 });
  return { file: 'crim-jury-system.png' };
}

/* ---------- Page 11: the verdict ladder ---------- */
function verdictLadder() {
  const [c, x] = make(W, 1086);
  title2(x, 'The verdict ladder: from unanimity to retrial');
  sub2(x, 'Criminal Justice Act 1967, section 17: the rules every case reviewer must know exactly');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Retire to deliberate', BLUE,
      'Twelve jurors retire to the private room with the exhibits. The judge directs them to try to reach a unanimous verdict, warns them not to surrender an honest view merely to reach agreement, and sends them out. Nothing may enter the room, and nothing that is said there may leave it.'],
    ['Unanimity first', PURPLE,
      'The first demand is agreement from all twelve, and a unanimous verdict carries a weight no majority can match. The judge may send the jury back to try again, and there is no upper limit on how long deliberation may continue in a complex case.'],
    ['Majority allowed', GREEN,
      'After the jury has deliberated for at least two hours and ten minutes, or as long as the court thinks reasonable, the judge may accept a majority: at least eleven to one or ten to two with twelve jurors, and it must exclude any possibility of a nine to three split.'],
    ['A shrinking jury', AMBER,
      'If illness or discharge reduces the jury, the floors rise with the stakes: with eleven jurors the minimum is ten to one, with ten it is nine to one, and with nine only a unanimous verdict will do. Below nine, the jury must be discharged altogether.'],
    ['The hung jury', RED,
      'If no lawful verdict comes after further directions urging honest but open minded discussion, the jury is discharged. The prosecution then chooses: retry the case before a fresh jury, or abandon it. An acquittal, majority or not, is final and cannot be retried.'],
    ['The outcome', DARK,
      'Not guilty: the defendant leaves free and cannot be tried again for the same offence. Guilty: the judge sentences under the guidelines, and the appeal routes of the hierarchy stand open above the trial, testing the verdict for safety.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 20, py + 44, i + 1, p[0], p[1], 21);
    wrap(x, p[2], px + 26, px + PW - 26, py + 92, { size: 18, lh: 26 });
  });
  arrow(x, cols[0] + PW + 4, 285, cols[1] - 4, 285, { color: GREY, lw: 4 });
  arrow(x, cols[1] + PW + 4, 285, cols[2] - 4, 285, { color: GREY, lw: 4 });
  arrow(x, cols[2] + PW / 2, rows[0] + PH + 4, cols[0] + PW - 90, rows[1] - 6, { color: GREY, lw: 4 });
  band(x, 866, 196, 'Why the rules exist',
    'The ladder balances two fears: courts that hang forever because unanimity is impossible, and defendants convicted on narrow, pressured votes that no one honestly holds. The time minimum, the rising floors as the jury shrinks, and the warning against surrendering honest views are all the same principle in different clothes: certainty matters, but not at the price of a verdict the jurors do not truly believe.',
    { bodyY: 60 });
  return { file: 'crim-verdicts.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([trialJourney, juryPipeline, verdictLadder], only);
  console.log(JSON.stringify(done));
})();
module.exports = { trialJourney, juryPipeline, verdictLadder };