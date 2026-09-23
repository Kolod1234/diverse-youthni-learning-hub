/*
 *  WJEC Level 3 Applied Certificate in Criminology — Unit 3 Crime Scene to
 *  Courtroom. Lesson 14: the personnel of criminal justice and the shape of
 *  a case. Diagrams for pages 2, 10 and 11.
 *  Run: node render-unit3-l14.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, text,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK,
        arrow, line } = H;

/* ---------- Page 2: the eight-stage case pathway ---------- */
function casePathway() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'The eight stages of a criminal case');
  sub2(x, 'From report to file closure, the route every case walks; stages 5 and 6 are skipped by a guilty plea');

  const stages = [
    ['1 Report and arrest', BLUE, 'The offence is reported or discovered; police investigate and arrest on reasonable grounds.'],
    ['2 Investigation and charge', BLUE, 'Evidence gathered under PACE; interview with safeguards; the CPS applies the Code test and charges.'],
    ['3 First appearance', AMBER, 'Almost every case begins in the magistrates\u2019 court; bail or remand is decided here.'],
    ['4 Mode and plea', AMBER, 'The court settles where the case is tried; the defendant pleads guilty or not guilty.'],
    ['5 Trial', GREEN, 'Not guilty: the fact-finders hear the case, lay bench in summary matters, jury of twelve in the Crown Court.'],
    ['6 Verdict', GREEN, 'Guilt must be proved so the fact-finder is sure, beyond reasonable doubt; acquittal ends the case.'],
    ['7 Sentence', RED, 'Guidelines, reports and the aims of sentencing fix custody, community order or fine.'],
    ['8 Appeal and closure', RED, 'Convicted and acquitted sides hold appeal routes; the record closes.'],
  ];
  const PW = 436, PH = 300, xs = [60, 516, 972], ys = [120, 470];
  stages.forEach((s, i) => {
    const px = xs[i % 3], py = ys[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 20, py + 44, i + 1, s[0], s[1], 17);
    wrap(x, s[2], px + 26, px + PW - 26, py + 96, { size: 14, lh: 19.5 });
  });

  // arrows: 1->2, 2->3 (row 1); 3->4 (wrap); 4->5, 5->6 (row 2)
  const rowY = [270, 620];
  for (let i = 0; i < 2; i++) {
    arrow(x, xs[i] + PW, rowY[0], xs[i + 1], rowY[0], { width: 4, color: GREY });
    arrow(x, xs[i] + PW, rowY[1], xs[i + 1], rowY[1], { width: 4, color: GREY });
  }
  // wrap arrow from box 3 down to box 4
  arrow(x, xs[2] + PW / 2, ys[0] + PH, xs[2] + PW / 2, ys[1], { width: 4, color: GREY });

  band(x, 810, 240, 'What the pathway teaches',
    'Filtering is constant: not every reported offence is recorded, not every recorded crime is charged, not every charge survives trial, so the dark figure\u2019s funnel has a legal continuation, the justice funnel, and the evaluation questions ask what is lost at each narrowing. Every case begins in the magistrates\u2019 court whatever its final destination, and the burden never shifts: at every stage the prosecution must prove, and the defendant is convicted only when the fact-finder is sure.',
    { bodyY: 56 });
  return { file: 'crim-case-pathway.png' };
}

/* ---------- Page 10: the personnel map ---------- */
function personnelMap() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'The personnel of criminal justice');
  sub2(x, 'Every role pairs a power with a discipline, and every question sits on the certainty ladder');

  const roles = [
    ['Police', BLUE, 'Investigate and hold the coercive powers: stop and search, arrest, detention, interview. Disciplined by PACE 1984 and its codes: reasonable grounds, custody clock, recorded interviews, the appropriate adult for the young. Question: is there a suspect with reasonable grounds to arrest?'],
    ['CPS prosecutors', AMBER, 'Created 1985 to separate investigation from prosecution. Apply the Code for Crown Prosecutors in order: the evidential test, a realistic prospect of conviction, then the public interest test. Review, disclose, discontinue and present cases. Question: should this case be charged at all?'],
    ['Forensic scientists', PURPLE, 'Recover and analyse the physical evidence, guarding the chain of custody; in court they serve as expert witnesses whose first duty is to the court, not the instructing side, staying within the discipline\u2019s limits and disclosing what undermines their own conclusions.'],
    ['Defence lawyers', GREEN, 'Solicitors advise from the station onward; barristers advocate in the higher courts; legal aid means-tests the funding. Owe the client confidentiality and loyalty within the law, and the court honesty. Question: can the state prove this case lawfully to the criminal standard?'],
    ['The judiciary', DARK, 'District judges, recorders and circuit judges rule on law and admissibility, direct the jury on the burden of proof, and sentence under the Sentencing Council\u2019s guidelines. Independent by appointment and tenure; never decide the facts in a jury trial.'],
    ['Magistrates and jurors', RED, 'Lay justice: the bench, three trained volunteers advised by a clerk, tries most cases with capped sentences and guards the gateway; the jury, twelve summoned citizens, holds the gravest trials\u2019 one question. Question: am I sure?'],
  ];
  const xs2 = [60, 516, 972], ys2 = [120, 470], PW = 436, PH = 320;
  roles.forEach((p, i) => {
    const px = xs2[i % 3], py = ys2[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 20, py + 44, i + 1, p[0], p[1], 17);
    wrap(x, p[2], px + 26, px + PW - 26, py + 96, { size: 13.5, lh: 18.5 });
  });

  band(x, 830, 230, 'The certainty ladder and the division of labour',
    'Reasonable grounds to arrest, realistic prospect to charge, sure to convict: the standard rises with the stakes, the presumption of innocence made procedural. Every role below the verdict is trained, every verdict-giver is a volunteer or a random citizen, the legitimacy trade running through the whole machine: professionals prepare, lay people decide.',
    { bodyY: 56 });
  return { file: 'crim-personnel-map.png' };
}

/* ---------- Page 11: court structure ---------- */
function courtStructure() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'Three offence categories, two trial courts');
  sub2(x, 'The classification decides the route, and the either-way band asks the court and the defendant in turn');

  const cats = [
    ['Summary: magistrates only', BLUE,
      'The least serious matters: common assault, most driving offences, low-value theft and criminal damage. Tried in the magistrates\u2019 court by the lay bench or a district judge. No jury, no election: speed and cost are the design\u2019s point.'],
    ['Either-way: the shared band', AMBER,
      'Theft, burglary of non-domestic buildings, assault occasioning actual bodily harm, possession with intent. First the magistrates decide whether their sentencing powers suffice; if they accept the case, the defendant may still elect a Crown Court jury trial.'],
    ['Indictable-only: Crown Court', RED,
      'Murder, manslaughter, rape, robbery, the gravest dwelling burglaries. Must be tried in the Crown Court before a judge and jury; the magistrates\u2019 court is only the first stop for charge, bail and transfer.'],
  ];
  const xs3 = [60, 516, 972], PY = 130, PW = 436, PH = 330;
  cats.forEach((p, i) => {
    const px = xs3[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 20, PY + 44, i + 1, p[0], p[1], 16);
    wrap(x, p[2], px + 26, px + PW - 26, PY + 100, { size: 14, lh: 19.5 });
  });

  // arrows down to the two courts row
  arrow(x, xs3[0] + PW / 2, PY + PH, 278, 620, { width: 4, color: GREY });
  arrow(x, xs3[2] + PW / 2, PY + PH, 1170, 620, { width: 4, color: GREY });
  arrow(x, xs3[1] + PW / 2 - 60, PY + PH, 340, 620, { width: 4, color: GREY });
  arrow(x, xs3[1] + PW / 2 + 60, PY + PH, 1110, 620, { width: 4, color: GREY });

  // the two courts
  box(x, 60, 620, 436, 200, { fill: '#eff6ff', stroke: '#bfdbfe' });
  text(x, 'Magistrates\u2019 Court', 278, 652, { size: 20, bold: true, color: BLUE });
  wrap(x, 'Over nine in ten criminal cases. Lay bench of three or a district judge, clerk advising, no jury. Capped sentences: six months per offence, twelve total, unlimited fines and community orders.', 84, 472, 682, { size: 14, lh: 20 });
  box(x, 972, 620, 436, 200, { fill: '#fef2f2', stroke: '#fecaca' });
  text(x, 'Crown Court', 1190, 652, { size: 20, bold: true, color: RED });
  wrap(x, 'The grave ceremony: judge on law, jury of twelve on fact. Indictable-only and elected either-way trials, and appeals from the magistrates\u2019 court. Sentences unlimited within guidelines.', 996, 1384, 682, { size: 14, lh: 20 });

  band(x, 860, 200, 'The youth court',
    'Defendants aged ten to seventeen are dealt with by specially trained youth magistrates in a less formal, closed court: reporting restrictions protect identity, parents are expected to attend, and the youth sentence palette, referral orders, youth rehabilitation orders, detention only for gravity, follows. The gravest offences go to the Crown Court whatever the age.',
    { bodyY: 56 });
  return { file: 'crim-court-structure.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([casePathway, personnelMap, courtStructure], only);
  console.log(JSON.stringify(done));
})();
module.exports = { casePathway, personnelMap, courtStructure };