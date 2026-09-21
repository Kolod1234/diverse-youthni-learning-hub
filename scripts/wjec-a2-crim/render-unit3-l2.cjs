/*
 * WJEC A2 Criminology, Lesson 2: The prosecution process: CPS, charging and
 * pre-trial decisions. Diagrams for pages 3, 9 and 10.
 * Run: node render-unit3-l2.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 3: CPS structure and personnel ---------- */
function cpsStructure() {
  const [c, x] = make(W, 1086);
  title2(x, 'The Crown Prosecution Service: who does what');
  sub2(x, 'Unit 3 Learning Outcome 2: the prosecution belongs to an independent public prosecutor');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['The Attorney General', 'The chief legal adviser to the government, with overall superintendence of the CPS. Does not direct individual charging decisions, but answers for the prosecution system and issues guidance such as the disclosure guidelines.', BLUE],
    ['Director of Public Prosecutions', 'Head of the CPS. Sets national policy and standards, handles the most sensitive decisions personally, and may take over private prosecutions to continue or stop them.', RED],
    ['Chief Crown Prosecutor', 'Leads one of the regional CPS Areas. Owns every prosecution decision taken in that Area and manages the prosecutors and caseworkers who make them.', AMBER],
    ['Crown Prosecutor', 'A CPS lawyer who reviews the police file against the Full Code Test, makes charging decisions, prepares cases and prosecutes in the magistrates court.', GREEN],
    ['CPS Direct', 'Duty prosecutors available around the clock. Advise police in custody suites by phone or video and take urgent charging decisions before a full file exists.', PURPLE],
    ['Advocates and caseworkers', 'Higher Court Advocates and self employed barristers present cases in the Crown Court; caseworkers prepare files, manage hearings and keep victims and witnesses informed.', DARK],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 20, py + 44, i + 1, p[0], p[2], 21);
    wrap(x, p[1], px + 26, px + PW - 26, py + 92, { size: 18, lh: 26 });
  });
  band(x, 866, 196, 'Why independence matters',
    'The CPS is not the police legal department. Its duty is to review the police case with fresh, professional eyes and to prosecute fairly rather than to win at any cost, dropping cases that fail the Code. That independence is the whole point of the 1985 reform: the decision to charge belongs to a public prosecutor applying the Full Code Test, not to the investigators who gathered the evidence.',
    { bodyY: 60 });
  return { file: 'crim-pros-cps-structure.png' };
}

/* ---------- Page 9: charge to trial venue ---------- */
function modeOfTrial() {
  const [c, x] = make(W, 1086);
  title2(x, 'From charge to courtroom: the three routes');
  sub2(x, 'How the offence category decides where a case may be tried');

  box(x, 494, 120, 460, 104);
  text(x, 'A charge has been authorised', W / 2, 162, { size: 24, bold: true });
  wrap(x, 'the category of the offence decides where the case can be tried', 514, 934, 196, { size: 17, color: GREY });

  const cols = [60, 516, 972], PW = 416, PY = 330, PH = 500;
  const panels = [
    ['Summary only', BLUE,
      'The least serious category. The magistrates court is the only venue, whatever anyone would prefer.',
      'The magistrates court, before lay magistrates or a District Judge, with limited sentencing powers.',
      'Most driving offences, minor criminal damage, low value shoplifting.'],
    ['Either way', AMBER,
      'Middle seriousness. These offences can lawfully be tried in either court, so a genuine decision is needed.',
      'Plea before venue: on a not guilty plea the magistrates allocate the case, but the defendant may elect a Crown Court jury trial.',
      'Theft, burglary, assault occasioning actual bodily harm, most drugs offences.'],
    ['Indictable only', RED,
      'The most serious category. There is no choice of court and no allocation stage.',
      'Sent directly to the Crown Court at the first hearing, to be tried before a judge and jury.',
      'Murder, manslaughter, robbery, rape.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 20, PY + 44, i + 1, p[0], p[1], 23);
    let y = wrap(x, p[2], px + 26, px + PW - 26, PY + 92, { size: 18, lh: 26 });
    text(x, 'Where it is tried', (px + PW) / 2, y + 28, { size: 18, bold: true, color: GREEN });
    y = wrap(x, p[3], px + 26, px + PW - 26, y + 64, { size: 16, lh: 22 });
    text(x, 'Typical examples', (px + PW) / 2, y + 28, { size: 18, bold: true, color: GREEN });
    wrap(x, p[4], px + 26, px + PW - 26, y + 64, { size: 16, lh: 22 });
  });
  arrow(x, 620, 226, 268, PY - 6, { color: GREY, lw: 4 });
  arrow(x, W / 2, 226, W / 2, PY - 6, { color: GREY, lw: 4 });
  arrow(x, 828, 226, 1180, PY - 6, { color: GREY, lw: 4 });
  band(x, 860, 196, 'Why the venue matters',
    'The route decides who judges the defendant, three lay magistrates or a jury of twelve, what sentencing powers are available, and how quickly justice arrives. Reviewers should ask whether the charge fitted the facts, because an overcharged or undercharged case distorts the venue, the sentence available and every decision that follows.',
    { bodyY: 60 });
  return { file: 'crim-pros-mode-trial.png' };
}

/* ---------- Page 10: the disclosure sequence ---------- */
function disclosureFlow() {
  const [c, x] = make(W, 1086);
  title2(x, 'Disclosure: the duty that keeps prosecution fair');
  sub2(x, 'The Criminal Procedure and Investigations Act 1996 sequence, with its real failure points');

  const cols = [60, 398, 736, 1074], PW = 314, PY = 140, PH = 560;
  const steps = [
    ['Gather and retain', BLUE,
      'During the investigation the police gather far more material than they use. Everything must be recorded and retained, because the duty covers unused material as much as the case evidence.',
      'Poor police marking can hide key items.'],
    ['Schedule the material', AMBER,
      'Unused material is listed on disclosure schedules, with officers marking items that might undermine the prosecution case or assist the defence, for the prosecutor to review.',
      'Sloppy scheduling hides what the defence should see.'],
    ['Primary disclosure', GREEN,
      'The prosecution must reveal to the defence any material that might reasonably be expected to undermine its case or assist the accused, including material the police have marked.',
      'Cherry picking leaves the defence blind.'],
    ['Response and ongoing duty', PURPLE,
      'The defence sets out its case in a defence statement. The prosecution must then disclose anything that could undermine or assist in light of it, and the duty continues to the end of the trial.',
      'The duty is continuous; late reveals derail trials.'],
  ];
  steps.forEach((s, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 44, i + 1, s[0], s[1], 20);
    const y = wrap(x, s[2], px + 22, px + PW - 22, PY + 90, { size: 17, lh: 24 });
    text(x, 'The risk', (px + PW) / 2, y + 30, { size: 17, bold: true, color: RED });
    wrap(x, s[3], px + 22, px + PW - 22, y + 64, { size: 16, lh: 22, color: RED });
  });
  arrow(x, cols[0] + PW + 4, 260, cols[1] - 4, 260, { color: GREY, lw: 4 });
  arrow(x, cols[1] + PW + 4, 260, cols[2] - 4, 260, { color: GREY, lw: 4 });
  arrow(x, cols[2] + PW + 4, 260, cols[3] - 4, 260, { color: GREY, lw: 4 });
  band(x, 730, 230, 'Why disclosure failures are fatal',
    'A trial cannot be fair if one side holds material the other never sees. In 2017 the prosecution of Liam Allan collapsed after material held by the police, including evidence that undermined the case, was not revealed to the defence. A disclosure failure can end even a strong prosecution, and testing whether the pack shows full, timely disclosure is one of the first jobs of a case review.',
    { bodyY: 60 });
  return { file: 'crim-pros-disclosure.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([cpsStructure, modeOfTrial, disclosureFlow], only);
  console.log(JSON.stringify(done));
})();
module.exports = { cpsStructure, modeOfTrial, disclosureFlow };