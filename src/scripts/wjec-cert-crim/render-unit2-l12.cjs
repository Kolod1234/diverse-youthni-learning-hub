/*
 *  WJEC Level 3 Applied Certificate in Criminology — Unit 2 Criminological
 *  Theories. Lesson 12. Diagrams for pages 1, 5 and the fault lines (page 2-4
 *  group). Run: node render-unit2-l12.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, text,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 1: the completed family map ---------- */
function familiesMap() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'The completed theory map: four families, one question');
  sub2(x, 'Cause location, key theories, evidence standing and policy direction, family by family');

  const fams = [
    ['Biological', RED, 'Causes in the body',
      'Lombroso\u2019s atavism, Sheldon\u2019s somatotypes, heredity studies, the MAOA interaction, neurochemistry, brain evidence. Verdict: contributions to risk, never destinies; evidence correlational; eugenics the permanent warning.',
      'Policy: treat conditions, screen only with demonstrated need.'],
    ['Psychological', PURPLE, 'Causes in the developing mind',
      'Freud\u2019s superego routes, Eysenck\u2019s conditioning of conscience, the IQ pathway, Kohlberg\u2019s arrested reasoning, Bowlby\u2019s attachment. Evidence: questionnaires and studies, real but noisy.',
      'Policy: cognitive-behavioural programmes, moral reasoning work.'],
    ['Sociological: consensus', BLUE, 'Causes in blocked structures',
      'Durkheim\u2019s anomie, Merton\u2019s strain and five adaptations, Cohen\u2019s status frustration, Cloward and Ohlin\u2019s opportunity structures. Evidence: the class gradient, tested and partially supported.',
      'Policy: widen legitimate opportunity, supply alternative status.'],
    ['Control, labelling, conflict', GREEN, 'Causes in restraint, reaction and rules',
      'Hirschi\u2019s four bonds, Lemert\u2019s stages, Becker\u2019s selective labelling, Young\u2019s amplification, Cohen\u2019s panics, Chambliss\u2019s law-making. Evidence: the strongest predictive and enforcement findings in the course.',
      'Policy: bonds, diversion, restorative practice, symmetric enforcement.'],
  ];
  const xs = [60, 772], ys = [120, 470], PW = 616, PH = 320;
  fams.forEach((f, i) => {
    const px = xs[i % 2], py = ys[Math.floor(i / 2)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 22, py + 44, i + 1, f[0], f[1], 17);
    text(x, f[2], px + PW / 2, py + 84, { size: 15, bold: true, color: SOFT });
    let y = wrap(x, f[3], px + 28, px + PW - 28, py + 114, { size: 13.5, lh: 18 }) + 6;
    wrap(x, f[4], px + 28, px + PW - 28, y, { size: 13, lh: 17, color: GREY });
  });

  band(x, 830, 230, 'The principle the map teaches',
    'The families are not rivals answering the same question: they answer different questions at different levels, the body\u2019s tendencies, the mind\u2019s makeup, the structure\u2019s blockages, the bonds\u2019 restraint, the reaction\u2019s career, the rules\u2019 interests, so a complete explanation of any criminal act recruits several of them in sequence, and comparing theories means crediting each with the work it does and charging each for the work it leaves undone.',
    { bodyY: 56 });
  return { file: 'crim-families-map.png' };
}

/* ---------- Pages 2-4: the three fault lines ---------- */
function faultLines() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'The three fault lines: where every family sits');
  sub2(x, 'Free will against determinism, consensus against conflict, society against cell');

  const rows = [
    ['Free will (classical)', GREEN, 'Determinism (positivist)', RED,
      'People choose rationally, so policy makes offending\u2019s pain certain and proportionate.',
      'Behaviour is caused by factors outside choosing, so policy treats, manages, prevents.',
      'Hardest: biological (chemical, pre-birth). Softer: psychological (developmental). Softest structural: consensus (determines the pressure, leaves the response). Nearest the classical end: control and conflict, universal motivation restrained. Intermediate: labelling, the first act chosen, the career caused.'],
    ['Consensus: shared values', BLUE, 'Conflict: interests\u2019 rules', RED,
      'The law encodes values everyone holds; crime violates the common code.',
      'The powerful make the rules; crime is the harms they choose to police.',
      'Consensus theorists: Durkheim, Merton, Cohen, Cloward and Ohlin, with the shared-values assumption as their stated weakness. Conflict: the Marxist tradition entire. The hinge: labelling, values exist but application is interest-laden. Silent: the biological and psychological families, theories of the person that concede whatever the adopting state holds.'],
    ['Macro: social facts', BLUE, 'Micro: the person', PURPLE,
      'Rates, gradients and structures explain populations.',
      'Genes, brains, minds and bonds explain individuals.',
      'Macro: anomie, strain\u2019s gradient, the Marxist asymmetries. Intermediate: subcultures, intimate groups, bonds, agencies. Micro: temperament, reasoning, chemistry, attachment. The division of labour: the macro owns the pool, the intermediate the selection and transmission, the micro the makeup, and no level explains alone.'],
  ];
  const LW = 400, RX = 1008, CX = 484, CW = 500, RH = 230;
  rows.forEach((r, i) => {
    const py = 120 + i * 260;
    box(x, 60, py, LW, RH);
    panelHeader(x, 80, py + 42, i * 2 + 1, r[0], r[1], 15);
    wrap(x, r[4], 84, 436, py + 90, { size: 13, lh: 17 });
    box(x, RX, py, LW, RH);
    panelHeader(x, RX + 20, py + 42, i * 2 + 2, r[2], r[3], 15);
    wrap(x, r[5], RX + 24, RX + LW - 24, py + 90, { size: 13, lh: 17 });
    box(x, CX, py, CW, RH, { fill: '#f8fafc', stroke: '#cbd5e1' });
    wrap(x, r[6], CX + 24, CX + CW - 24, py + 26, { size: 12.5, lh: 16.5 });
  });

  band(x, 900, 160, 'Using the lines',
    'Read each line as an axis, not a debate: the reward goes to the answer that places the theories on the axis and states which stretches of the law, of behaviour and of the person each theory explains.',
    { bodyY: 52 });
  return { file: 'crim-fault-lines.png' };
}

/* ---------- Page 5: the evidence ladder ---------- */
function evidenceLadder() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'The evidence ladder: testability across the families');
  sub2(x, 'Five rungs, from claims that cannot fail to claims that have been tested and earned support');

  const rungs = [
    ['Best-evidenced', GREEN,
      'The social bonds (self-report and cohort data, attachment strongest), selective enforcement (stop-and-search and charging patterns), diversion effects (formal processing predicting more reoffending).'],
    ['Tested, partially supported', BLUE,
      'Merton\u2019s strain (class gradient and utilitarian profile, weakened by the self-report test), subcultural typologies (testable against offending geography), the IQ pathway (checked, bounded by overlap).'],
    ['Correlational, instrument problems', AMBER,
      'Eysenck\u2019s dimensions (questionnaires on convicted samples, direction unsettled), heredity and MAOA (small high-risk samples, gene plus environment), Kohlberg\u2019s stage gaps (reasoning-behaviour modest).'],
    ['Circular: diagnosed from the outcome', PURPLE,
      'Lombroso\u2019s atavism and Sheldon\u2019s somatotypes, types read off the offending they explained, on pre-selected samples, the same structure in a different coat.'],
    ['Unfalsifiable', RED,
      'Psychoanalysis, whose three superego routes absorb every possible offender, and the Marxist total claim, whose counter-cases can be redescribed as legitimating show: they explain everything after the fact and predict nothing before it.'],
  ];
  const baseY = 760, lw = 560, lx = 60;
  rungs.forEach((r, i) => {
    const py = baseY - 120 - i * 120;
    const px = lx + i * 40;
    box(x, px, py, lw, 110);
    text(x, r[0], px + 20, py + 28, { size: 16, bold: true, color: r[1], align: 'left' });
    wrap(x, r[2], px + 20, px + lw - 20, py + 48, { size: 12.5, lh: 16 });
  });

  // right panel: how to use it
  const RX = 700, RW = 688, RY = 150, RH = 560;
  box(x, RX, RY, RW, RH, { fill: '#fff' });
  panelHeader(x, RX + 22, RY + 42, 6, 'How to use the ladder', BLUE, 20);
  wrap(x, 'Attach rungs to claims, not families: psychoanalysis sits at the bottom of a family whose Bowlby and Kohlberg claims climb to the correlational rung, and Marxism\u2019s total claim resists falsification while its enforcement findings reach the top.\n\nCredit influence and evidence separately: the untestable theories shaped the discipline more than half the tested ones, Freud\u2019s developmental premise feeding the therapies that outlived it, so the ladder measures scientific standing, not historical importance.\n\nPair every rung with its instrument: each claim\u2019s position follows from how it was measured, questionnaires, samples, official statistics, cohort designs, which is why the self-report test of Lesson 2 moves claims between rungs rather than merely checking them.',
    RX + 30, RX + RW - 30, RY + 92, { size: 15, lh: 22 });

  band(x, 780, 280, 'The sentence the ladder earns',
    'A comparison of evidence quality is a comparison of instruments: to say one theory is better evidenced than another is to say what each was measured with, on whom, and what designs could have overturned it, which is why the strongest answers name the instrument before they state the verdict.',
    { bodyY: 56 });
  return { file: 'crim-evidence-ladder.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([familiesMap, faultLines, evidenceLadder], only);
  console.log(JSON.stringify(done));
})();
module.exports = { familiesMap, faultLines, evidenceLadder };