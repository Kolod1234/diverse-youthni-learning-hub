/*
 * WJEC A2 Criminology, Lesson 12: Imprisonment: the evidence and the crisis.
 * Diagrams for pages 4, 9 and 11.
 * Run: node render-unit4-l12.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 4: claimed and delivered ---------- */
function prisonFunctions() {
  const [c, x] = make(W, 1086);
  title2(x, 'The prison ledger: five claims, one institution');
  sub2(x, 'What prison promises, what the evidence says it delivers');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Custody: delivered', RED,
      'The base claim: hold the person securely and lawfully. Delivered when the estate works, and visibly degraded by crowding, with shared cells and compressed regimes: decent custody is the Woolf standard, and crowding sits below it.'],
    ['Retribution: delivered', AMBER,
      'The loss of liberty is the deserved suffering, calibrated by time under the guidelines. Delivered in the sentence, standardised in the experience: everyone loses the same currency of liberty whatever the nuance of their desert.'],
    ['Public protection: real but blunt', PURPLE,
      'Incapacitation is arithmetically real for the term served, then decays with the age crime curve and must be netted against the post release crimes the prison experience itself may cause.'],
    ['Rehabilitation: the gap', BLUE,
      'Promised in every mission statement: education, work, treatment. Delivered unevenly, starved by crowding and churn, so the claim survives only where the regime is resourced and the sentence long enough to use it.'],
    ['Deterrence: faint', GREEN,
      'The watching public is meant to be deterred by the prospect of prison, but the evidence is that certainty, not severity, deters: the marginal deterrent value of prison over a community sentence is small.'],
    ['The verdict', DARK,
      'Prison is reliable at what it does to people (hold, punish) and unreliable at what it does for them (change them), and that asymmetry is the core of every honest prison essay in this subject.'],
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
  band(x, 866, 196, 'Test the claims one by one',
    'The essay habit is to split prison works into its aims and comparators: custody and desert are delivered, protection is real but decaying, rehabilitation is promised but starved, and deterrence is marginal. The debate is about magnitudes, prices and alternatives, and the honest verdict always compares prison with the community sentence it displaced.',
    { bodyY: 60 });
  return { file: 'crim-prison-functions.png' };
}

/* ---------- Page 9: the evidence ledger ---------- */
function prisonEvidence() {
  const [c, x] = make(W, 1086);
  title2(x, 'Does prison work? the evidence ledger');
  sub2(x, 'The honest verdict, built claim by claim with the measurement caveats named');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['The reoffending magnitudes', RED,
      'Roughly half of adults released from prison are proven to reoffend within a year, with the short sentence churn the fastest of all: the figures are stable across years, so treat them as the essay backbone.'],
    ['The caveats before the verdict', AMBER,
      'Proven reoffending counts only what is caught; the age crime curve means some desistance would have happened anyway; and the honest comparator is not prison versus nothing but the community sentence it displaced.'],
    ['The mechanism behind the rates', BLUE,
      'Institutionalisation erodes ordinary decision making so freedom disables; prisonisation trains the wing values (never inform, status by toughness); disruption removes the bonds of work, home and family that desistance needs.'],
    ['What incapacitation still buys', PURPLE,
      'People in custody cannot commit crimes against the public for the term: the claim is real and arithmetical, which is why the evidence-based position is reservation for the serious and dangerous, not abolition.'],
    ['The Howard claim and the rebuttal', GREEN,
      'Prison works (1993) is true at incapacitation, and the rest is rhetoric: the evidence-based reply reserves custody for where its comparative advantage is real and redirects the churn to community disposals.'],
    ['The reservation verdict', DARK,
      'Prison is a reliable instrument of custody and desert, a blunt protection, a poor rehabilitation at current regimes and an expensive deterrence: use the severe tool where it is strong, and stop using it where it destroys futures.'],
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
  band(x, 866, 196, 'Compare like with like',
    'Every prison statistic carries the traps of Lesson 9: ask what is measured (proven reoffending only), over what window (one year), against which counterfactual (the community sentence displaced), and netted with which hidden costs (the post release years the institution itself caused). The verdict that survives those four questions is the only one worth writing.',
    { bodyY: 60 });
  return { file: 'crim-prison-evidence.png' };
}

/* ---------- Page 11: the population puzzle ---------- */
function prisonPopulation() {
  const [c, x] = make(W, 1086);
  title2(x, 'Who is inside: the population puzzle');
  sub2(x, 'The shape of the prison estate decides the policy question');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['The short sentence churn', RED,
      'The largest group by sentence length is under twelve months: lives disrupted, no treatment time, no supervision tail on release, and the fastest reoffending of any disposal. The estate is busiest exactly where its advantage is weakest.'],
    ['The remand population', AMBER,
      'A significant minority are held awaiting trial or sentence, some of whom will be acquitted: punishment before conviction, a due process issue in its own right, and a population the sentence never ordered.'],
    ['Life and indeterminate prisoners', BLUE,
      'Long termers whose release depends on parole assessment: the population the incapacitation claim genuinely serves, and where high reoffending after decades inside is partly the price of releasing people the system feared.'],
    ['The serious and dangerous', PURPLE,
      'The group prison exists for under the reservation argument: where custody is the only proportionate response and its comparative advantage over every alternative is real and visible.'],
    ['Women and children', GREEN,
      'Small, vulnerable populations failed by the standard design: a sentence built on the loss of an ordered life punishes chaos with more chaos, and the highest reoffending rates in the system report the result back.'],
    ['The crowding consequence', DARK,
      'When volume outruns certified capacity, shared cells, squalor and compressed regimes follow, and every claim except custody collapses: crowding is not a misfortune, it is the rehabilitation claim dying institution by institution.'],
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
  band(x, 866, 196, 'Argue from the shape, not the total',
    'Should we build more prisons, shorten sentences, or abolish short ones? Every prison policy question resolves into a question about the population shape. Candidates who argue from the composition (the churn dominates) argue from the evidence; candidates who argue from the headline total argue from a number that means nothing on its own.',
    { bodyY: 60 });
  return { file: 'crim-prison-population.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([prisonFunctions, prisonEvidence, prisonPopulation], only);
  console.log(JSON.stringify(done));
})();
module.exports = { prisonFunctions, prisonEvidence, prisonPopulation };