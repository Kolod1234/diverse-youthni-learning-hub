/*
 * WJEC A2 Criminology, Lesson 15: Agencies of social control and evaluating
 * policy. Diagrams for pages 5, 7 and 11.
 * Run: node render-unit4-l15.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 5: the agencies map ---------- */
function agenciesMap() {
  const [c, x] = make(W, 1086);
  title2(x, 'The machinery of social control');
  sub2(x, 'Functions, checks, and the informal layer that does most of the work');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['The police: consent', RED,
      'The front line on the Peelian model: citizens in uniform, power on continuing consent, success measured by the absence of crime. Gatekeeper at the system door (discretion, cautions, community resolutions) and holder of the certainty lever the deterrence evidence names.'],
    ['CPS and courts', BLUE,
      'The CPS filters by the Full Code Test, checking the police with its independence. The courts adjudicate (legal guilt, the due process core) and sentence (the aims made operational), checked in turn by the appeal structure.'],
    ['Probation and prisons', PURPLE,
      'Probation assesses, supervises, rehabilitates and enforces: the Lesson 13 backbone, its history tracking the fortunes of the rehabilitative ideal. Prisons deliver custody and desert for the serious and dangerous, under inspection and the ombudsman.'],
    ['The informal layer', GREEN,
      'Family socialises and supervises, school attaches or excludes, peers teach definitions both ways, community enforces answerability, media names the deviant, and the conscience carries the rule inside the person: most control, invisible, daily.'],
    ['The dependencies', AMBER,
      'Formal control works through informal or not at all: police need information, courts need obedience, probation needs families, and the formal system is scaled to the residue the informal layer does not catch. Policies that damage the informal layer increase the formal workload.'],
    ['The accountability machinery', DARK,
      'Commissioners, inspection forces, the complaints office and the courts audit the agencies: the due process rail applied to the org chart, the who guards the guards answer institutionalised, and the confidence findings are its standing report.'],
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
  band(x, 866, 196, 'A process and a division of checks',
    'The agencies form one process (investigate, prosecute, adjudicate, sentence, deliver) in which each holds a stage and checks the others: the CPS checks the police, the courts check the CPS, the appeal courts check the courts, inspection checks the prisons. The joins between agencies are where cases fall, and the informal layer, which every agency depends on, has no commissioner, no inspection and no budget line.',
    { bodyY: 60 });
  return { file: 'crim-agencies-map.png' };
}

/* ---------- Page 7: the evaluation framework ---------- */
function policyEvaluation() {
  const [c, x] = make(W, 1086);
  title2(x, 'The four questions for any policy');
  sub2(x, 'The evaluation framework: the examination technique of the whole unit');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Question one: does it work', RED,
      'Demand the measure (what counts as success), the comparator (against what: the honest alternative), and the period (over what window), with the Lesson 9 caveats named: no raw numbers, selection effects flagged, the counterfactual stated on the page.'],
    ['Question two: unintended', AMBER,
      'Check the known families systematically: displacement, net-widening, exclusion, iatrogenic effects, legitimacy erosion, informal-layer damage. The costs nobody ordered are found by asking for them, never volunteered by the policy document.'],
    ['Question three: the cost', BLUE,
      'Price the policy against the alternative uses of the same money: a prison place against a year of youth provision, a camera scheme against staffing. Cost is a comparison, not a number, and the alternatives are part of the answer.'],
    ['Question four: is it just', GREEN,
      'The due process rail: fair, proportionate, lawful, non-discriminatory. A policy can work, cost little and still be indefensible, and this question is where that verdict lives: it stands alone and it is never skipped.'],
    ['The joins and dependencies', PURPLE,
      'Can the agencies actually deliver it: the partnership machinery, the handovers, the funding assumption. An evaluation that assumes the paper agency is evaluating a fiction, and the joins audit is part of the effectiveness audit.'],
    ['The verdict discipline', DARK,
      'Refuse the single judgement: audit all four questions, unbundle the campaign into its parts (each element may deserve a different verdict), and land the conclusion with the conditions of success and failure stated on the page.'],
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
  band(x, 866, 196, 'Aims first, then the four questions',
    'Pin the claimed aims before auditing anything: campaigns bundle aims the way sentences do, and every measure is contestable until the claims are stated. Then run the four questions in order, and remember the fourth stands alone: effectiveness, economy and even popularity do not purchase fairness, and the justice question is the one the examination never lets you skip.',
    { bodyY: 60 });
  return { file: 'crim-policy-evaluation.png' };
}

/* ---------- Page 11: the campaign audit ---------- */
function campaignAudit() {
  const [c, x] = make(W, 1086);
  title2(x, 'The campaign audit: four questions at scale');
  sub2(x, 'The method for evaluating a whole policy programme, start to finish');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Pin the aims', RED,
      'State what the campaign claims to achieve (deterrence, removal, education, reassurance) before auditing anything: a campaign is a bundle of aims, and each element must be judged against its own claim, not the headline.'],
    ['Map agencies and joins', BLUE,
      'Name who delivers each element and where the handovers are: the partnership machinery is the delivery system, and the joins (records, handovers, assumptions) are where programmes fail, exactly as the safeguarding inquiries found.'],
    ['Audit effectiveness', GREEN,
      'For each element: the measure, the comparator, the period. The search element against its own evidence base, the education element on its long horizon, the removal element on what removal does and does not touch.'],
    ['Audit consequences', AMBER,
      'The families again, at programme scale: displacement across zones and hours, legitimacy erosion from the coercive elements, labelling from the publicity elements, and the informal-layer damage that increases future formal workload.'],
    ['Audit cost and justice', PURPLE,
      'Price the whole against its own internal alternatives (the same officer hours in different elements), and run the justice rail over every element separately: the coercive parts carry the rail, and no campaign element is exempt.'],
    ['Deliver the verdict', DARK,
      'Unbundle: keep the mechanism-sound elements, convert the weak ones, cancel the unjust ones, and state the conditions under which the campaign would succeed or fail, with the funding assumption on the page.'],
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
  band(x, 866, 196, 'The examination is one technique at increasing scale',
    'The sentence audit of Lesson 11, the disposal audit of Lesson 13 and this campaign audit are the same four questions applied at growing scale, and the examiner sets campaigns precisely because they are bundles. Unbundle into elements, audit each, and deliver the differentiated verdict: the technique transfers to every policy question in the paper.',
    { bodyY: 60 });
  return { file: 'crim-campaign-audit.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([agenciesMap, policyEvaluation, campaignAudit], only);
  console.log(JSON.stringify(done));
})();
module.exports = { agenciesMap, policyEvaluation, campaignAudit };