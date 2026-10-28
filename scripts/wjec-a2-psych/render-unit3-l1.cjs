/*
 * WJEC A2 Psychology, Lesson 1: Addictive Behaviours: Explanations and Modification.
 * Diagrams for pages 3, 6 and 9.
 * Run: node scripts/wjec-a2-psych/render-unit3-l1.cjs
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK, TEAL } = H;

/* ---------- Page 3: mesolimbic dopamine reward pathway ---------- */
function dopaminePathway() {
  const [c, x] = make(W, 1086);
  title2(x, 'The mesolimbic dopamine pathway and brain disease adaptation');
  sub2(x, 'Unit 3 Section A: how chronic substance or behavioural stimulation reshapes reward circuitry');

  const PW = 416, PH = 300, r1 = 130, r2 = 500;
  const top = [60, 516, 972], bot = [972, 516, 60];
  const steps = [
    ['1. Cue or intake', 'A psychoactive drug (such as nicotine, alcohol or heroin) or a rewarding behaviour (such as gambling) enters the system and triggers neural firing.', 'Initial trigger: natural or chemical reward signal.', BLUE],
    ['2. VTA activation', 'Neurones in the ventral tegmental area (VTA) of the midbrain fire action potentials along axons projecting to the forebrain.', 'Pathway: mesolimbic bundle from midbrain to striatum.', PURPLE],
    ['3. Nucleus accumbens', 'Dopamine floods the synaptic cleft in the nucleus accumbens, binding to D2 post-synaptic receptors and producing intense salience and euphoria.', 'Acute effect: strong positive reinforcement.', GREEN],
    ['4. Prefrontal cortex', 'Projections reach the orbitofrontal and prefrontal cortex, stamping in cue associations and weakening inhibitory impulse control.', 'Cognitive shift: heightened craving to environmental cues.', AMBER],
    ['5. Down-regulation', 'Repeated supraphysiological dopamine surges cause the brain to reduce D2 receptor density and lower baseline dopamine release (Volkow et al., 2004).', 'Neuroadaptation: tolerance and blunted everyday pleasure.', RED],
    ['6. Compulsive cycle', 'In the hypodopaminergic state, ordinary rewards feel flat; the person repeats the behaviour just to relieve dysphoria and restore baseline functioning.', 'Outcome: shift from impulsive pleasure to compulsive relief.', DARK],
  ];
  const draw = (px, py, s, i) => {
    box(x, px, py, PW, PH);
    panelHeader(x, px + 16, py + 42, i + 1, s[0].replace(/^\d+\.\s*/, ''), s[3], 22);
    let y = wrap(x, s[1], px + 24, px + PW - 24, py + 92, { size: 18, lh: 26 });
    wrap(x, s[2], px + 24, px + PW - 24, y + 22, { size: 16, lh: 22, color: s[3], bold: true });
  };
  draw(top[0], r1, steps[0], 0); draw(top[1], r1, steps[1], 1); draw(top[2], r1, steps[2], 2);
  draw(bot[0], r2, steps[3], 3); draw(bot[1], r2, steps[4], 4); draw(bot[2], r2, steps[5], 5);
  arrow(x, top[0] + PW + 4, r1 + 150, top[1] - 4, r1 + 150, { color: GREY, lw: 4 });
  arrow(x, top[1] + PW + 4, r1 + 150, top[2] - 4, r1 + 150, { color: GREY, lw: 4 });
  arrow(x, top[2] + 208, r1 + PH + 4, top[2] + 208, r2 - 4, { color: GREY, lw: 4 });
  arrow(x, bot[0] - 4, r2 + 150, bot[1] + PW + 4, r2 + 150, { color: GREY, lw: 4 });
  arrow(x, bot[1] - 4, r2 + 150, bot[2] + PW + 4, r2 + 150, { color: GREY, lw: 4 });
  band(x, 846, 210, 'Evaluation hinge: correlation, causation and the brain disease debate',
    'PET scans (Volkow et al., 2001) consistently show lower D2 receptor availability in people with substance dependence, supporting Leshner (1997) that chronic use alters brain structure. However, cross-sectional scans cannot prove whether low D2 density preceded drug use as a genetic vulnerability or resulted from it, and Heyman (2009) notes that many people recover without medical treatment.',
    { bodyY: 58 });
  return { file: 'psych-addiction-dopamine-pathway.png' };
}

/* ---------- Page 6: comparing the three explanation families ---------- */
function explanationsGrid() {
  const [c, x] = make(W, 1086);
  title2(x, 'Three explanatory families for addictive behaviours');
  sub2(x, 'WJEC Unit 3 requires at least two biological, two individual-differences and two social explanations');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['Biological explanations', BLUE,
      '1. Dopamine & brain disease: mesolimbic VTA-to-nucleus accumbens pathway; D2 receptor down-regulation (Volkow et al., 2004; Leshner, 1997).',
      '2. Genetics & evolved adaptation: twin concordance (Kendler et al., 2003) and ancestral attraction to neurotoxins/ripe fruit (Dudley, 2000; Sullivan & Hagen, 2002).',
      'Strength: objective neuroimaging and twin data; explains physical tolerance and withdrawal.',
      'Limitation: biologically reductionist and deterministic; ignores social triggers of relapse.'],
    ['Individual differences', PURPLE,
      '1. Cognitive biases & field dependence: attentional and illusory control biases (Griffiths, 1994); Witkin (1962) field-dependent style relying on external cues.',
      '2. Co-morbidity & personality: self-medication for depression or anxiety (Khantzian, 1997); Eysenck high N and P scores despite Lang (1983) finding no single addictive type.',
      'Strength: explains why only some exposed individuals develop dependence; informs CBT.',
      'Limitation: retrospective bias; unclear if cognitive distortions cause or follow addiction.'],
    ['Social psychological', GREEN,
      '1. Peer pressure & social learning: Bandura (1977) vicarious reinforcement and modelling; Ennett & Bauman (1994) Show that peer selection and influence both operate.',
      '2. Role of the media: positive portrayal in films, music and sponsorship normalises use and lowers perceived risk (Sargent et al., 2005; Gunther et al., 2006).',
      'Strength: accounts for initiation in adolescence and cultural shifts in consumption.',
      'Limitation: struggles to explain why one peer becomes dependent while friends stop.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 22);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 90, { size: 17, lh: 25 });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 18, { size: 17, lh: 25 });
    text(x, 'Key strength', px + PW / 2, y + 26, { size: 18, bold: true, color: GREEN });
    y = wrap(x, p[4], px + 24, px + PW - 24, y + 54, { size: 17, lh: 24, color: SOFT });
    text(x, 'Key limitation', px + PW / 2, y + 26, { size: 18, bold: true, color: RED });
    wrap(x, p[5], px + 24, px + PW - 24, y + 54, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'How to combine the three families in a 15-mark WJEC evaluation',
    'Strong essays avoid treating these families as mutually exclusive. Use a biopsychosocial diathesis-stress model: social factors (peer modelling and media) best explain initiation, individual differences (cognitive biases and co-morbid distress) explain vulnerability during regular use, and biological neuroadaptation (D2 down-regulation) explains maintenance and craving.',
    { bodyY: 58 });
  return { file: 'psych-addiction-explanations-grid.png' };
}

/* ---------- Page 9: methods of modifying addictive behaviours ---------- */
function modificationComparison() {
  const [c, x] = make(W, 1086);
  title2(x, 'Methods of modifying addictive behaviours');
  sub2(x, 'Comparing pharmacological substitution, behavioural conditioning and cognitive restructuring');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['Agonist & antagonist substitution', BLUE,
      'Mechanism: agonists (methadone, nicotine patches) bind to receptors to mimic the drug safely and prevent withdrawal; antagonists (naltrexone) block receptors to eliminate euphoria.',
      'Evidence: Marsch (1998) and Connock et al. (2007) show methadone reduces heroin use and crime; Pettinati et al. (2006) support naltrexone in alcohol dependence.',
      'Evaluation: quick, objective relief of physical withdrawal, but swaps one chemical dependence for another and requires strict compliance.'],
    ['Aversion therapy', RED,
      'Mechanism: classical conditioning pairs the addictive stimulus (alcohol or smoking) with an unconditioned aversive stimulus (emetic drug disulfiram/Antabuse or rapid smoking nausea).',
      'Evidence: Krampe et al. (2006) found supervised disulfiram achieved over 50% long-term abstinence; Hajek & Stead (2001) found modest short-term effects for rapid smoking.',
      'Evaluation: high drop-out and relapse once pairing stops; serious ethical concerns regarding discomfort and non-adherence without supervision.'],
    ['Cognitive behavioural Interventions', TEAL,
      'Mechanism: identifies and challenges cognitive biases (such as gambler fallacy and attentional bias) while training coping skills for high-risk relapse triggers.',
      'Evidence: Sylvain et al. (1997) showed significant reductions in pathological gambling maintained at 12 months; Carroll et al. (1994) demonstrated durable gains.',
      'Evaluation: empowers long-term self-regulation without side effects, but requires high motivation, insight and weeks of therapist time.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 19);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25 });
    text(x, 'Empirical support', px + PW / 2, y + 24, { size: 18, bold: true, color: p[1] });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 52, { size: 17, lh: 24, color: SOFT });
    text(x, 'Clinical evaluation', px + PW / 2, y + 24, { size: 18, bold: true, color: AMBER });
    wrap(x, p[4], px + 24, px + PW - 24, y + 52, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'Matching treatment to the stage of recovery',
    'Clinical guidelines (NICE) frequently combine methods rather than relying on one alone. Agonist substitution stabilises acute physical withdrawal first, antagonist therapy or supervised disulfiram guards against impulsive slips, and CBT addresses the underlying cognitive biases and social triggers to sustain long-term abstinence.',
    { bodyY: 58 });
  return { file: 'psych-addiction-modification.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([dopaminePathway, explanationsGrid, modificationComparison], only);
  console.log(JSON.stringify(done));
})();
module.exports = { dopaminePathway, explanationsGrid, modificationComparison };