/*
 *  WJEC Level 3 Applied Certificate in Criminology — Unit 2 Criminological
 *  Theories. Lesson 13: Policy, prevention and assessment preparation.
 *  Diagrams for pages 5, 7 and 10.
 *  Run: node render-unit2-l13.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, text,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 5: the policy map ---------- */
function policyMap() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'From cause to cure: each family\u2019s policy');
  sub2(x, 'Every intervention follows its theory\u2019s cause, and inherits its theory\u2019s cautions');

  const pol = [
    ['Biological', RED, 'Treat the condition: medication, dietary and neurological support, with consent. Screen only with demonstrated need; the individual prediction is forbidden by the distributions\u2019 overlap, and the family\u2019s history is its own caution.'],
    ['Psychological', PURPLE, 'Re-condition and re-reason: cognitive-behavioural programmes pairing offending with rehearsed consequences, moral-reasoning teaching such as Aggression Replacement Training, attachment-based family work. Evidence: tested, modestly effective.'],
    ['Consensus', BLUE, 'Widen the routes: education, training and real employment for blocked communities; alternative status systems, sport, music, enterprise, for the excluded. Humane and socially justified even where the crime effect is smaller than hoped.'],
    ['Control', GREEN, 'Strengthen the bonds before they fray: youth provision that supplies involvement, school routes that keep attachment alive, employment that gives commitment something to lose. Converges with consensus policy from the opposite direction.'],
    ['Labelling', AMBER, 'Reform the reaction: diversion before processing, cautions and restorative encounters instead of charge and record, reintegrative shaming that condemns the act while restoring the person. Warrant: formal processing predicts more reoffending.'],
    ['Conflict', DARK, 'Enforce symmetrically: the powerful\u2019s harms policed as crimes rather than regulated as incidents, corporate crime units with real budgets, so the criminal population starts to resemble the offending population.'],
  ];
  const xs = [60, 516, 972], ys = [120, 470], PW = 436, PH = 320;
  pol.forEach((p, i) => {
    const px = xs[i % 3], py = ys[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 20, py + 44, i + 1, p[0], p[1], 18);
    wrap(x, p[2], px + 26, px + PW - 26, py + 96, { size: 13.5, lh: 18.5 });
  });

  band(x, 830, 230, 'The derivation principle',
    'A theory\u2019s policy is its cause restated as a task: blocked routes imply widening, weak bonds imply strengthening, processing that harms implies diversion, asymmetric enforcement implies symmetry, treatable conditions imply treatment. Every policy inherits its theory\u2019s cautions with equal fidelity, and the next page\u2019s evidence, not the theories, decides which interventions earn their keep.',
    { bodyY: 56 });
  return { file: 'crim-policy-map.png' };
}

/* ---------- Page 7: what works ---------- */
function whatWorks() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'What works: the evidence on reducing reoffending');
  sub2(x, 'Three tiers, from interventions that harm to interventions with converging support');

  const tiers = [
    ['Reliable: converging evidence', GREEN,
      'Certainty over severity: detection matters more than harshness in deterrence research. Restorative justice: modest reoffending reductions alongside consistently high victim satisfaction. Juvenile diversion: formal processing predicts more reoffending than informal handling.'],
    ['Modest: real but bounded effects', AMBER,
      'Rehabilitation programmes: meta-analyses of juvenile treatment find average reductions in reoffending, well-run cognitive-behavioural programmes the strongest, around a quarter in the best evaluations. Effects depend on implementation quality, which is exactly what the nothing-works debate missed.'],
    ['Can harm: use with evidence', RED,
      'Programmes that frighten: reviews of Scared Straight-style projects find increased, not reduced, offending among participants. Severity alone: ever-harsher sentences show little deterrent return, and short custodial spells are associated with worse outcomes than community equivalents.'],
  ];
  const baseY = 740, lw = 560, lx = 60;
  tiers.forEach((t, i) => {
    const py = baseY - 150 - i * 190;
    const px = lx + i * 46;
    box(x, px, py, lw, 180);
    text(x, t[0], px + 20, py + 30, { size: 16, bold: true, color: t[1], align: 'left' });
    wrap(x, t[1], px + 20, px + lw - 20, py + 56, { size: 13.5, lh: 18.5 });
  });

  const RX = 700, RW = 688, RY = 150, RH = 560;
  box(x, RX, RY, RW, RH, { fill: '#fff' });
  panelHeader(x, RX + 22, RY + 42, 4, 'The nothing-works debate, resolved', BLUE, 20);
  wrap(x, 'Martinson\u2019s 1974 review of rehabilitation programmes famously concluded that few could demonstrably reduce reoffending, and the nothing-works reading swept policy for two decades, powering the deterrence turn that followed.\n\nThe resolution came with meta-analysis: when the studies are pooled rather than sampled, Martinson\u2019s successors found modest average effects, strongest for cognitive-behavioural and skills-based programmes when implementation is faithful, and Martinson himself later recanted the strong reading of his own finding.\n\nThe lesson for theory: the rehabilitation debate was never about the theories, it was about implementation, and the families whose programmes survive are the ones whose mechanisms survived testing.',
    RX + 30, RX + RW - 30, RY + 92, { size: 15, lh: 21 });

  band(x, 780, 280, 'Reading the tiers correctly',
    'No tier is a verdict on a theory family: biological caution, psychological programmes, opportunity widening, diversion and symmetry all have entries across the tiers, because what is being tested is not the family\u2019s philosophy but the delivery of its mechanism, so the examination answer ties each claim to its evidence, Scared Straight\u2019s reviews, the meta-analyses, the diversion findings, rather than to a slogan.',
    { bodyY: 56 });
  return { file: 'crim-what-works.png' };
}

/* ---------- Page 10: the prevention tiers ---------- */
function preventionTiers() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'Prevention\u2019s three tiers, social and situational');
  sub2(x, 'Who the intervention reaches, and whether it changes conditions or people');

  const cols = [
    ['Primary: everyone, before the harm', BLUE,
      'Reached before any offending exists. Social: opportunity widening, stable employment routes, community norms. Situational: designing out crime, target-hardening, lighting, access control. The consensus family\u2019s natural ground.'],
    ['Secondary: the at-risk, before the first offence', AMBER,
      'Reached on risk indicators: excluded pupils, estate youth, families flagged by services. Social: mentoring, youth provision, family support, the bond-strengthening of the control family. The ethical caution: identification can become the labelling it prevents.'],
    ['Tertiary: the convicted, after the offence', GREEN,
      'Reached after the system\u2019s processing: rehabilitation programmes, restorative encounters, resettlement into work and housing. The psychological and labelling families\u2019 ground, and where the nothing-works debate and its resolution were fought.'],
  ];
  const xs = [60, 516, 972], PY = 130, PW = 436, PH = 380;
  cols.forEach((p, i) => {
    const px = xs[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 20, PY + 44, i + 1, p[0], p[1], 16);
    wrap(x, p[2], px + 26, px + PW - 26, PY + 100, { size: 14, lh: 20 });
  });

  // social vs situational distinction
  const DY = 560, DH = 180;
  box(x, 60, DY, 1348 - 152, DH, { fill: '#eff6ff', stroke: '#bfdbfe' });
  text(x, 'Social against situational: the split within every tier', 724, DY + 34, { size: 18, bold: true, color: BLUE });
  wrap(x, 'Social prevention changes people and conditions: opportunity, bonds, programmes, the criminology of the families. Situational prevention changes settings: Clarke\u2019s designing-out tradition, making the act harder, riskier to attempt or less rewarding at the moment of choice, the classical school\u2019s rational chooser rebuilt in architecture. Every tier draws on both, and the map\u2019s teaching is that the two halves answer the free will fault line\u2019s two ends, causes against choices.',
    110, 1338, DY + 66, { size: 14.5, lh: 20 });

  band(x, 770, 290, 'Matching the tiers to the brief',
    'A scenario recommendation names its tier and its half: Danny\u2019s estate needs primary social prevention, opportunity and norms for those not yet in trouble; Danny himself sits at the secondary tier, mentoring and provision before the first conviction, and the moment of the brief is the decision between the secondary tier\u2019s support and the tertiary tier\u2019s processing, which is the labelling lens\u2019s policy point made concrete.',
    { bodyY: 56 });
  return { file: 'crim-prevention-tiers.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([policyMap, whatWorks, preventionTiers], only);
  console.log(JSON.stringify(done));
})();
module.exports = { policyMap, whatWorks, preventionTiers };