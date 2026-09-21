/*
 * WJEC A2 Criminology, Lesson 10: Models of justice: crime control and due
 * process. Diagrams for pages 4, 9 and 11.
 * Run: node render-unit4-l10.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 4: the two models compared ---------- */
function justiceModels() {
  const [c, x] = make(W, 1086);
  title2(x, 'Packer two models: the values in tension');
  sub2(x, 'Two rival statements of what the criminal process is for, from Herbert Packer, 1964');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['The crime control model', RED,
      'The system exists to repress crime effectively: Packer image is the assembly line, cases moving fast along screening decisions, with police and prosecutors trusted as reliably accurate and the courts confirming. Speed and finality are virtues, because delay denies justice to victims.'],
    ['The due process model', BLUE,
      'The system exists to do justice to individuals facing the state: the obstacle course, barriers of rights standing between accusation and punishment, each cleared lawfully before liberty can be taken. The presumption of innocence and proof beyond reasonable doubt are the core.'],
    ['Factual versus legal guilt', PURPLE,
      'The due process distinction at the heart of the argument: courts decide legal guilt, whether the state can prove the offence lawfully, not factual guilt, whether the person did it. A code-breached confession can free the factually guilty, and the model calls that working.'],
    ['What each model fears', GREEN,
      'Crime control fears crime without repression: victims at the mercy of offenders, norms unenforced, order dissolving. Due process fears the state without limits: police who may do anything to anyone labelled guilty. Both fears are rational, and both have proof texts in history.'],
    ['Institutions are decisions', AMBER,
      'England and Wales runs one system holding both: PACE, juries and the CPS evidential test are due process written into the machine; summary speed, plea discounts, cautions and majority verdicts are crime control engineering inside fair limits.'],
    ['The negotiated settlement', DARK,
      'Neither model can hold the field alone: pure crime control produced the miscarriage era, and pure due process would price out justice for most victims. The system is the permanent negotiation, and every reform moves the balance.'],
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
  band(x, 866, 196, 'Models are values, not buildings',
    'The two models are not separate systems but rival value sets inside one process, and every institution you can name is a settled point on the line between them. The examination asks you to place institutions on this line, evidence the direction of recent movement with named reforms, and defend a judgment about where the balance should sit.',
    { bodyY: 60 });
  return { file: 'crim-justice-models.png' };
}

/* ---------- Page 9: the institutional balance map ---------- */
function modelBalance() {
  const [c, x] = make(W, 1086);
  title2(x, 'The institutional balance map: one system, two poles');
  sub2(x, 'Every institution is a settlement between the models: place it, and justify the placement');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['The assembly line end', RED,
      'The magistrates court clears nineteen cases in twenty at speed; cautions and out of court disposals end cases without trials; both are crime control engineering, gated by due process conditions: admissions must be voluntary, and defendants must consent.'],
    ['Efficiency inside limits', AMBER,
      'The early guilty plea discount buys finality and spares witnesses; majority verdicts after two hours ten minutes prevent hung courts. Each is the crime control value operating within due process rails that keep the process lawful.'],
    ['Due process in the machine', BLUE,
      'The PACE codes constrain detention, search and interview; the CPS evidential stage filters weak cases before charge; disclosure duties put the defence on equal information. The obstacle course begins at the police station door.'],
    ['The obstacle course core', PURPLE,
      'The presumption of innocence, the burden and standard of proof, and trial by jury: citizens judging citizens, with the state made to prove its case lawfully to twelve people it does not employ.'],
    ['Due process above the trial', GREEN,
      'The appeal courts and the safety test review verdicts from above; the CCRC reopens exhausted cases to hunt for error. The newest institutions of the system sit on this side, built after the failures of the other.'],
    ['The historical pattern', DARK,
      'Read the map in time: every due process institution was built after a crime control failure, from PACE after the confession scandals to the CCRC after the Birmingham Six. The settlement moves, and the movement is the essay.'],
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
  band(x, 866, 196, 'Placement is analysis',
    'When a question names an institution, your first move is placement: which pole does it lean towards, and what does its existence say about how the argument was settled? A caution is speed and finality with a voluntariness gate; the CCRC is finality unpicked in the service of truth. Naming the lean and the gate is a mark, every time.',
    { bodyY: 60 });
  return { file: 'crim-model-balance.png' };
}

/* ---------- Page 11: the applied method ---------- */
function modelApplication() {
  const [c, x] = make(W, 1086);
  title2(x, 'One scenario, both models, one judgment');
  sub2(x, 'The applied method behind the highest marked Unit 4 answers');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Read the facts once', BLUE,
      'Read the scenario as the reviewer read the case pack: with the questions already in mind, annotating what the scenario gives each model to work with: the outcome measures, the procedural facts, the human costs.'],
    ['Run the crime control reading', RED,
      'What would a believer praise here, and what would the model demand next? Speed, output, finality, screening efficiency: state what the scenario delivers on each measure, and where the model own logic says the back end is failing.'],
    ['Run the due process reading', GREEN,
      'What would a believer warn about here: thresholds under strain, screening error rates, legitimacy costs, discretion removed, citizens adjusting their lives around police attention? State what the scenario shows on each warning.'],
    ['Name the institutions', PURPLE,
      'The scenario is not an abstraction: name the safeguards in play (PACE stop powers and their suspicion threshold, charging discretion, listing times, the courts) and say which model each serves in this context.'],
    ['Weigh the two fears', AMBER,
      'Adjudication turns on which fear is more live in this scenario: crime without repression, or the state without limits. The scenario always contains evidence about which danger is closer, and the strongest answers find it.'],
    ['Deliver the judgment', DARK,
      'Land the verdict with its reason visible, the strongest counter argument stated and answered, and the conditions under which you would change your mind: that last clause is what distinguishes evaluation from assertion.'],
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
  band(x, 866, 196, 'Never say the scenario is simply good or bad',
    'The model answer says what each reading sees, what each would demand, what would satisfy each, and then lands a judgment with the reason visible. Opinion is a verdict without a method; evaluation is the same verdict with the method shown on the page, and the method is the marks.',
    { bodyY: 60 });
  return { file: 'crim-model-application.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([justiceModels, modelBalance, modelApplication], only);
  console.log(JSON.stringify(done));
})();
module.exports = { justiceModels, modelBalance, modelApplication };