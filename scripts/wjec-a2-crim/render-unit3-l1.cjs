/*
 * WJEC A2 Criminology, Lesson 1: The criminal investigation: personnel,
 * techniques and evidence. Diagrams for pages 3, 9 and 10.
 * Run: node render-unit3-l1.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 3: who investigates a crime ---------- */
function personnel() {
  const [c, x] = make(W, 1086);
  title2(x, 'Who investigates a crime: the personnel and their roles');
  sub2(x, 'Unit 3 Learning Outcome 1: every verdict depends on what this team does first');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['First officer attending', 'Assesses risk to life and gives first aid, then protects the scene: sets a cordon, starts the scene log and controls everyone who enters. Their first decisions shape the whole case, because evidence lost in the first hour cannot be recovered later.', BLUE],
    ['Scene of crime officer', 'Records the scene with photographs and sketches, then recovers material evidence: fingerprints, DNA, fibres, marks. Works in protective clothing to avoid contaminating what they touch, and packages each item for the laboratory.', RED],
    ['Detective (CID)', 'Runs the person side of the enquiry: takes accounts, identifies suspects, plans interviews and lines of enquiry, and builds the case file that a prosecution can be built on.', AMBER],
    ['Senior investigating officer', 'Leads major investigations such as murder or kidnap. Sets the strategy, directs specialists and teams, and owns the big decisions that courts will later test against the evidence actually gathered.', GREEN],
    ['Forensic scientist', 'Analyses recovered items in the laboratory: DNA profiles, fibres, marks and ballistics. Interprets what results mean and reports findings in a form the court can test.', PURPLE],
    ['Pathologist and specialists', 'A Home Office registered forensic pathologist examines the body in suspicious deaths to establish cause and time of death. Digital specialists recover and examine data from phones, computers and networks.', DARK],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 20, py + 44, i + 1, p[0], p[2], 22);
    wrap(x, p[1], px + 26, px + PW - 26, py + 92, { size: 18, lh: 26 });
  });
  band(x, 866, 196, 'Why the chain of people matters',
    'A verdict is only as safe as the weakest link in this chain. Contamination by the first officer, mishandling by the scene of crime officer, a missed line of enquiry by the detective or an overstated result in the laboratory can each undo an otherwise strong case. When you review a criminal case in this unit, you are really testing what each of these roles contributed and where the chain could have broken.',
    { bodyY: 60 });
  return { file: 'crim-invest-personnel.png' };
}

/* ---------- Page 9: three types of evidence ---------- */
function evidenceTypes() {
  const [c, x] = make(W, 1086);
  title2(x, 'The three types of evidence in a criminal investigation');
  sub2(x, 'What each type can establish, and the limitation that always travels with it');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 640;
  const panels = [
    ['Material evidence', BLUE,
      'Physical objects and traces connected to the offence: the body itself, weapons, fingerprints, DNA, fibres, glass, footmarks, documents and marks.',
      'Strength: it is silent but stubborn. Objects do not change their story under pressure, and a good match can tie a person, a place and a moment together.',
      'Limitation: it cannot speak for itself. It needs expert interpretation, and it can be transferred innocently, planted or contaminated by poor handling.'],
    ['Testimonial evidence', RED,
      'What people tell investigators: victim and witness statements, and interviews with suspects, given in accordance with the law on questioning.',
      'Strength: only people can supply motive, context and identification. A witness can explain the sequence of events in a way no object can.',
      'Limitation: memory is selective and reconstruction can be shaped by questioning, stress or later information. Sincere witnesses can be sincerely wrong.'],
    ['Digital evidence', PURPLE,
      'Data recovered from devices and networks: call records, messages, photos, CCTV, computer files, location data and transaction trails.',
      'Strength: modern life is recorded, so digital traces can place people at times and places with a precision older evidence cannot reach.',
      'Limitation: it can be deleted, altered, encrypted or misread, and it only proves integrity if it was captured with a documented chain of custody.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 20, PY + 44, i + 1, p[0], p[1], 23);
    let y = wrap(x, p[2], px + 26, px + PW - 26, PY + 92, { size: 18, lh: 26 });
    text(x, 'Examples', px + PW / 2, y + 24, { size: 18, bold: true, color: p[1] });
    y = wrap(x, p[3], px + 26, px + PW - 26, y + 62, { size: 17, lh: 24, color: SOFT });
    text(x, 'What it does best', px + PW / 2, y + 24, { size: 17, bold: true, color: GREEN });
    y = wrap(x, p[4], px + 26, px + PW - 26, y + 58, { size: 17, lh: 24, color: SOFT });
    text(x, 'Limitation', px + PW / 2, y + 24, { size: 17, bold: true, color: RED });
    wrap(x, p[5], px + 26, px + PW - 26, y + 58, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 806, 250, 'Class characteristics or individual characteristics: how strong is the match?',
    'A class characteristic narrows the field: a right footmark of a common trainer size tells you the wearer is one of many thousands. An individual characteristic points to one likely source: a full DNA profile, a fingerprint with enough detail, or a tool mark shaped by accidental damage. When you assess evidence in a case review, ask which kind of characteristic each item carries, because the answer decides how much weight the evidence can safely bear.',
    { bodyY: 60 });
  return { file: 'crim-invest-evidence-types-v2.png' };
}

/* ---------- Page 10: evidence journey ---------- */
function evidenceFlow() {
  const [c, x] = make(W, 1086);
  title2(x, 'From scene to court: how evidence travels safely');
  sub2(x, 'Six stages, each with a risk that can weaken a case');

  const PW = 416, PH = 300, r1 = 130, r2 = 500;
  const top = [60, 516, 972], bot = [972, 516, 60];
  const steps = [
    ['Protect the scene', 'Cordon, scene log, protective clothing, controlled access. Nothing is touched before it is recorded.', 'Risk: contamination and lost traces in the first hour.'],
    ['Recover the items', 'Photographs and sketches first, then careful recovery, each item sealed in tamper evident packaging.', 'Risk: mixing or badly labelling items.'],
    ['Record and store', 'Every exhibit gets a unique reference recording who handled it, when and why, at every stage.', 'Risk: a gap in the log becomes a question at trial.'],
    ['Analyse in the lab', 'Accredited scientists apply validated methods, quality controls and peer checking to each exhibit.', 'Risk: unvalidated methods or overstated findings.'],
    ['Report and disclose', 'Findings are written up for court, and relevant material is disclosed so both sides can test it.', 'Risk: non disclosure can end a prosecution.'],
    ['Test in court', 'Experts give evidence and are cross examined on methods, handling and conclusions.', 'Risk: weak handling becomes grounds for an unsafe verdict.'],
  ];
  const draw = (px, py, s, i) => {
    box(x, px, py, PW, PH);
    panelHeader(x, px + 20, py + 44, i + 1, s[0], [BLUE, RED, AMBER, GREEN, PURPLE, DARK][i], 22);
    let y = wrap(x, s[1], px + 26, px + PW - 26, py + 90, { size: 18, lh: 26 });
    wrap(x, s[2], px + 26, px + PW - 26, y + 30, { size: 17, lh: 24, color: RED });
  };
  draw(top[0], r1, steps[0], 0); draw(top[1], r1, steps[1], 1); draw(top[2], r1, steps[2], 2);
  draw(bot[0], r2, steps[3], 3); draw(bot[1], r2, steps[4], 4); draw(bot[2], r2, steps[5], 5);
  arrow(x, top[0] + PW + 4, r1 + 150, top[1] - 4, r1 + 150, { color: GREY, lw: 4 });
  arrow(x, top[1] + PW + 4, r1 + 150, top[2] - 4, r1 + 150, { color: GREY, lw: 4 });
  arrow(x, top[2] + 120, r1 + PH + 4, top[2] + 120, r2 - 4, { color: GREY, lw: 4 });
  arrow(x, bot[0] - 4, r2 + 150, bot[1] + PW + 4, r2 + 150, { color: GREY, lw: 4 });
  arrow(x, bot[1] - 4, r2 + 150, bot[2] + PW + 4, r2 + 150, { color: GREY, lw: 4 });
  band(x, 846, 216, 'The chain of custody',
    'Everyone who touches an exhibit is accountable for it, from the officer who bags it to the expert who testifies. The record of that journey is the exhibit log. Break the chain, or leave it undocumented, and even strong looking science can become inadmissible or doubted by a jury, which is exactly what a defence advocate will invite the court to do.',
    { bodyY: 60 });
  return { file: 'crim-invest-evidence-flow.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([personnel, evidenceTypes, evidenceFlow], only);
  console.log(JSON.stringify(done));
})();
module.exports = { personnel, evidenceTypes, evidenceFlow };