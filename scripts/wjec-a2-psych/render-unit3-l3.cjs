/*
 * WJEC A2 Psychology, Lesson 3: Bullying Behaviours: Explanations and Modification.
 * Diagrams for pages 3, 6 and 9.
 * Run: node scripts/wjec-a2-psych/render-unit3-l3.cjs
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK, TEAL } = H;

/* ---------- Page 3: Olweus definition & biological explanations ---------- */
function bioBullying() {
  const [c, x] = make(W, 1086);
  title2(x, 'Defining bullying and its biological explanations');
  sub2(x, 'Olweus (1993) three criteria alongside evolutionary, hormonal and genetic factors');

  const cols = [60, 516, 972], PW = 416, rows = [130, 490], PH = 320;
  const panels = [
    ['1. Olweus (1993) criteria', 'Bullying is aggressive behaviour that is (a) intentional harm-doing, (b) repeated over time, and (c) characterised by an interpersonal imbalance of power (physical, social or digital).', BLUE],
    ['2. Evolved male dominance', 'Evolutionary psychologists (Volk et al., 2012) argue direct physical bullying in males evolved to establish dominance hierarchies and secure status and resources.', PURPLE],
    ['3. Evolved female competition', 'Indirect relational bullying (social exclusion, rumour spreading; Björkqvist et al., 1992) damages rivals reputation while avoiding physical injury risks to maternal survival.', GREEN],
    ['4. Hormones: testosterone', 'Elevated testosterone combined with low cortisol (Dabbs et al., 1991; Popma et al., 2007) reduces fear of punishment and increases status-seeking reactive aggression.', AMBER],
    ['5. Genetic predisposition', 'Ball et al. (2008) studied 1,116 twin pairs (E-Risk study) and found 73% of variance in victimisation and 61% in bullying behaviour was attributable to genetic factors.', RED],
    ['6. Critical evaluation', 'Evolutionary accounts are post-hoc and hard to falsify; hormones fluctuate in response to social victory or defeat (Mazur & Booth, 1998), making causation bidirectional.', DARK],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 16, py + 42, i + 1, p[0].replace(/^\d+\.\s*/, ''), p[2], 21);
    wrap(x, p[1], px + 24, px + PW - 24, py + 92, { size: 18, lh: 26 });
  });
  band(x, 850, 206, 'Adaptive strategy versus maladaptive pathology',
    'While traditional developmental models view bullying purely as a social deficit, evolutionary theory (Volk et al., 2012) frames goal-directed bullying as an adaptive strategy for dominance, status and resources unless school environments alter the cost-benefit ratio.',
    { bodyY: 58 });
  return { file: 'psych-bullying-biological.png' };
}

/* ---------- Page 6: Individual differences & social explanations ---------- */
function psychSocialBullying() {
  const [c, x] = make(W, 1086);
  title2(x, 'Individual differences and social explanations of bullying');
  sub2(x, 'Cognitive biases, moral disengagement, narcissistic ego threat and cultural norms');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['Cognitive biases & empathy', BLUE,
      'Hostile attribution bias (Dodge, 1980; Crick & Dodge, 1994): interpreting ambiguous peer actions as deliberate provocation.',
      'Skilled manipulator counter-argument: Sutton, Smith & Swettenham (1999) found ringleader bullies often score high on Theory of Mind, using cold cognition to manipulate peers.',
      'Evaluation: distinguishes reactive bully-victims (who misread cues) from proactive ringleaders (who calculate social rewards).'],
    ['Narcissism & moral disengagement', PURPLE,
      'Narcissism: Baumeister, Smart & Boden (1996) showed violence stems from threatened egotism (inflated, fragile self-esteem) rather than low self-esteem.',
      'Moral disengagement (Bandura, 1999; Gini, 2006): bullies deactivate self-censure via euphemistic labelling ("just banter"), diffusion of responsibility and blaming the victim.',
      'Evaluation: explains how otherwise conventional pupils bully without experiencing guilt or remorse.'],
    ['Social & cultural factors', GREEN,
      'Moral atmosphere & peer roles: Salmivalli et al. (1996) identified assistants, reinforcers, outsiders and defenders; peer onlookers reinforce bullying in 85% of episodes (Pepler & Craig, 1995).',
      'Cultural differences: collectivist cultures (e.g. Japan ijime; Koo et al., 2008) show higher whole-group social exclusion, whereas individualist cultures show more dyadic physical/verbal aggression.',
      'Evaluation: highlights that bullying is a group process sustained by bystander norms, not merely an individual trait.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 20);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25 });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 18, { size: 17, lh: 25, color: SOFT });
    text(x, 'Key takeaway', px + PW / 2, y + 24, { size: 18, bold: true, color: AMBER });
    wrap(x, p[4], px + 24, px + PW - 24, y + 52, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'Why the "incompetent oaf" stereotype fails',
    'Sutton et al. (1999) challenged Crick & Dodge (1994) by demonstrating that ringleader bullies possess superior social cognition. Effective anti-bullying interventions must therefore change the peer group reward structure rather than simply teaching social skills to bullies.',
    { bodyY: 58 });
  return { file: 'psych-bullying-psych-social.png' };
}

/* ---------- Page 9: OBPP, CAPSLE and KiVa modification ---------- */
function modificationBullying() {
  const [c, x] = make(W, 1086);
  title2(x, 'Whole-school methods of modifying bullying behaviours');
  sub2(x, 'Olweus Bullying Prevention Programme (OBPP), CAPSLE and KiVa');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['Olweus Programme (OBPP)', BLUE,
      'Four-level systemic intervention: (1) school-wide rules and survey, (2) classroom rules and discussions, (3) individual talks with bullies, victims and parents, (4) community partnership.',
      'Evidence: Olweus (1993) Bergen study of 2,500 pupils reported ~50% reduction in bullying; Ttofi & Farrington (2011) meta-analysis confirmed 20-23% average reductions.',
      'Evaluation: strong replication in Norway, but weaker outcomes in heterogeneous US/UK secondary schools (Bauer et al., 2007).'],
    ['CAPSLE (Fonagy et al., 2009)', PURPLE,
      'Creating A Peaceful School Learning Environment: psychodynamic mentalisation programme addressing the power triangle of bully, victim and bystander.',
      'Components: positive school climate, classroom management, peer/adult mentorship, and "Gentle Warrior" physical education teaching defensive self-control.',
      'Evaluation: Fonagy et al. (2009) RCT of 1,345 children showed reduced aggression and increased empathy compared to treatment-as-usual.'],
    ['KiVa (Salmivalli et al., 2011)', GREEN,
      'Bystander-focused programme: targets peer reinforcers and outsiders through role-play, computer games and visibility vests so bullies lose social status rewards.',
      'Evidence: Kärnä et al. (2011) RCT across 78 Finnish schools (8,237 pupils) and Clarkson et al. (2022) Wales/UK trials showed significant reductions in victimisation.',
      'Evaluation: directly neutralises the social status motive of ringleader bullies at relatively low ongoing cost.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 20);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25 });
    text(x, 'Empirical evidence', px + PW / 2, y + 24, { size: 18, bold: true, color: p[1] });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 52, { size: 17, lh: 24, color: SOFT });
    text(x, 'Evaluation', px + PW / 2, y + 24, { size: 18, bold: true, color: AMBER });
    wrap(x, p[4], px + 24, px + PW - 24, y + 52, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'Why whole-school approaches outperform individual punishment',
    'Zero-tolerance exclusion rarely modifies bullying because the peer hierarchy quickly refills the role. OBPP, CAPSLE and KiVa restructure the social ecology of the school so that bystanders stop rewarding aggression and adults maintain consistent, authoritative boundaries.',
    { bodyY: 58 });
  return { file: 'psych-bullying-modification.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([bioBullying, psychSocialBullying, modificationBullying], only);
  console.log(JSON.stringify(done));
})();
module.exports = { bioBullying, psychSocialBullying, modificationBullying };