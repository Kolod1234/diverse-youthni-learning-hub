/*
 * WJEC A2 Criminology, Lesson 13: Alternatives to imprisonment: community
 * penalties and restorative justice. Diagrams for pages 4, 9 and 11.
 * Run: node render-unit4-l13.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 4: the alternatives toolkit ---------- */
function communityToolkit() {
  const [c, x] = make(W, 1086);
  title2(x, 'The alternatives toolkit: punishing without walls');
  sub2(x, 'Every instrument tested on its aims, its evidence and its enforcement');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['The fine: the volume workhorse', AMBER,
      'The most used sentence in the system: means adjusted money punishment, proportionate without institutional damage. The risk: weak enforcement turns it into a price, denouncing nothing, deterring only the poor, with default imprisonment punishing poverty.'],
    ['The community order: the menu', BLUE,
      'One sentence, composed from requirements: unpaid work, curfew and tagging, exclusion, programmes, drug and alcohol treatment, supervision. Punishment, rehabilitation and reparation served in a single instrument, with bonds intact.'],
    ['The suspended sentence', PURPLE,
      'Custody imposed but suspended on conditions: the sword of Damocles sentence, community in operation, custodial in threat. The instrument that lets the court calibrate just below the custody threshold, if breach reliably activates.'],
    ['The discharge: the nominal sentence', GREEN,
      'Absolute and conditional discharges: conviction recorded, sentence nominal, the conditional variety with resentencing for further offending. The boundary between sentence and no sentence, for cases where punishment is already delivered.'],
    ['Restorative justice: the process', RED,
      'The facilitated conference where the offender faces the victim and repair is agreed: the only disposal centred on the harmed person, on two load-bearing conditions (victim consent, offender admission) that no policy can remove.'],
    ['Probation: the delivery backbone', DARK,
      'Every requirement and every conference depends on the assessment, supervision and enforcement capacity of the probation service, and the toolkit advantages are conditional on its delivery: under-resourcing is the standing critique.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 20, py + 44, i + 1, p[0], p[1], 19);
    wrap(x, p[2], px + 26, px + PW - 26, py + 92, { size: 17, lh: 24 });
  });
  arrow(x, cols[0] + PW + 4, 285, cols[1] - 4, 285, { color: GREY, lw: 4 });
  arrow(x, cols[1] + PW + 4, 285, cols[2] - 4, 285, { color: GREY, lw: 4 });
  arrow(x, cols[2] + PW / 2, rows[0] + PH + 4, cols[0] + PW - 90, rows[1] - 6, { color: GREY, lw: 4 });
  band(x, 866, 196, 'The honest comparison decides everything',
    'No alternative is judged in the abstract: the question is whether it beats the short custodial sentence it displaces, on reoffending, cost and disruption. The community sentence matches or beats short custody at a fraction of the cost, the fine runs the volume end if enforced, and the whole toolkit stands or falls on delivery, breach and displacement.',
    { bodyY: 60 });
  return { file: 'crim-community-toolkit.png' };
}

/* ---------- Page 9: the restorative process ---------- */
function restorativeProcess() {
  const [c, x] = make(W, 1086);
  title2(x, 'The restorative process: from referral to repair');
  sub2(x, 'Consent, preparation, conference, agreement: the stages and their safeguards');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Referral and screening', BLUE,
      'The case enters at one of three doors (pre-charge community resolution, youth referral panels, post-sentence conferencing) and is screened for suitability: denial, intimidation risk and power imbalances are filtered out here, the domestic abuse caution lives here.'],
    ['Preparation of the parties', GREEN,
      'The facilitator meets each party separately: expectations set, fear reduced, the offender rehearsed in facing the harm. The invisible stage where most of the process quality is made or lost.'],
    ['The conference', RED,
      'Victim and offender meet, facilitated: the victim explains the impact in their own words, the offender responds as a person, not a defendant. The mechanism the evidence base is built on: human confrontation converting abstraction into relationship.'],
    ['The agreement of repair', AMBER,
      'The parties agree the repair: apology, compensation, work, contact terms. The restorative promise becomes enforceable here, or becomes theatre: an unmonitored contract teaches that repair is performance.'],
    ['The safeguards', PURPLE,
      'Voluntariness for both parties, trained facilitation, safety screening and the freedom to withdraw: the conditions without which the process is a counterfeit of itself, which no expansion of the brand can repair.'],
    ['The failure points', DARK,
      'Pressure disguised as consent, token agreements to earn the discount, unmonitored contracts, and net-widening at the youth end: the process map names each so the evaluation can police it stage by stage.'],
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
  band(x, 866, 196, 'The evidence rests on fidelity',
    'The pooled findings (modest reoffending reductions, strong victim satisfaction and wellbeing gains, cost effectiveness) come from processes run properly: screened, prepared, facilitated and monitored. The reform agenda is fidelity to the process, not expansion of the brand, and every applied question is answered by naming the stage, the safeguard and the failure.',
    { bodyY: 60 });
  return { file: 'crim-restorative-process.png' };
}

/* ---------- Page 11: the disposal map ---------- */
function disposalsCompared() {
  const [c, x] = make(W, 1086);
  title2(x, 'The disposal map: every instrument, its win condition');
  sub2(x, 'There is no best disposal, only the best disposal for the case at hand');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Custody', RED,
      'Wins the serious and dangerous case: desert plus real incapacitation, the one aim it owns outright. Failure: criminogenic at the churn end, highest cost, crowding degrading every other claim.'],
    ['The community order', BLUE,
      'Wins the churn: matches or beats short custody on reoffending at a fraction of the cost, with bonds, work and family intact. Failure: under-delivery and slow breach turn the sentence nominal.'],
    ['The fine', AMBER,
      'Wins the volume end of minor offending: proportionate, cheap, no institutional damage. Failure: the price effect on the poor and the enforcement tail of default imprisonment.'],
    ['The suspended sentence', PURPLE,
      'Wins the threshold case: calibration under custodial threat, community in operation. Failure: activation, because a threat that never bites is a bluff, and the boundary instrument collapses.'],
    ['Restorative justice', GREEN,
      'Wins the consenting, admitting case with a willing victim: the best evidence base in the toolkit, satisfaction and desistance together. Failure: losing the two conditions, which turns process into performance.'],
    ['The professional answer', DARK,
      'The disposal map read properly refuses the single verdict and demands the case: match the instrument to the offence, the offender and the victim, and the examination question answers itself.'],
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
  band(x, 866, 196, 'Match the disposal to the case',
    'Custody for the serious and dangerous, the community order for the churn, the fine for enforced volume, the suspended sentence for the threshold, RJ for the consenting and admitting case with a willing victim. The map is the whole skill, and every which punishment works question is this map plus the Lesson 12 ledger.',
    { bodyY: 60 });
  return { file: 'crim-disposals-compared.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([communityToolkit, restorativeProcess, disposalsCompared], only);
  console.log(JSON.stringify(done));
})();
module.exports = { communityToolkit, restorativeProcess, disposalsCompared };