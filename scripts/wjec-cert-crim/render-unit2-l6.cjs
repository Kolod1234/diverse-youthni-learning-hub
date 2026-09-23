/*
 * WJEC Level 3 Applied Certificate in Criminology — Unit 2 Criminological
 * Theories. Lesson 6: The theories toolkit.
 * Diagrams for pages 3, 5 and 7.
 * Run: node render-unit2-l6.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, text,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 3: free will against determinism ---------- */
function faultLine() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'The fault line: free will against determinism');
  sub2(x, 'The two schools that founded criminology, and the opposite justices each implies');

  // timeline across the top
  const ty = 148, tx0 = 120, tx1 = 1328;
  x.strokeStyle = GREY; x.lineWidth = 3;
  x.beginPath(); x.moveTo(tx0, ty); x.lineTo(tx1, ty); x.stroke();
  const nodes = [
    [220, '1764', 'Beccaria, On Crimes', 'and Punishments'],
    [560, '1789', 'Bentham, utility', 'and the calculus'],
    [920, '1850s', 'Comte, positivism:', 'study society scientifically'],
    [1268, '1876', 'Lombroso, the first', 'positivist criminology'],
  ];
  nodes.forEach(n => {
    x.fillStyle = BLUE;
    x.beginPath(); x.arc(n[0], ty, 10, 0, Math.PI * 2); x.fill();
    text(x, n[1], n[0], ty - 34, { size: 19, bold: true, color: BLUE });
    text(x, n[2], n[0], ty + 36, { size: 14.5, color: SOFT });
    text(x, n[3], n[0], ty + 56, { size: 14.5, color: SOFT });
  });

  // two schools
  const LX = 80, LW = 600, RX = 768, RW = 600, PY = 240, PH = 560;
  box(x, LX, PY, LW, PH);
  panelHeader(x, LX + 24, PY + 44, 1, 'Free will: the classical school', BLUE, 22);
  const leftRows = [
    ['The offender chooses', 'A rational actor weighing pleasure against pain; crime is one option in the calculation.'],
    ['What justice should do', 'Rig the calculation: punishment made certain, swift and proportionate, so lawfulness wins.'],
    ['The policy that follows', 'Deterrence. Offenders are responsible, so punishment as desert is just.'],
  ];
  let ly = PY + 104;
  leftRows.forEach(r => {
    text(x, r[0], LX + LW / 2, ly, { size: 17.5, bold: true, color: BLUE });
    ly = wrap(x, r[1], LX + 30, LX + LW - 30, ly + 28, { size: 15.5, lh: 21 }) + 16;
  });
  box(x, RX, PY, RW, PH);
  panelHeader(x, RX + 24, PY + 44, 2, 'Determinism: the positivist school', PURPLE, 22);
  const rightRows = [
    ['The offender is caused', 'Heredity, body, mind or society produce the behaviour; the criminal differs, not just decides.'],
    ['What science should do', 'Measure the differences, just as medicine measures disease, and identify the causes.'],
    ['The policy that follows', 'Treatment, rehabilitation and prevention. Punishing the caused is punishing a symptom.'],
  ];
  let ry = PY + 104;
  rightRows.forEach(r => {
    text(x, r[0], RX + RW / 2, ry, { size: 17.5, bold: true, color: PURPLE });
    ry = wrap(x, r[1], RX + 30, RX + RW - 30, ry + 28, { size: 15.5, lh: 21 }) + 16;
  });

  band(x, 834, 218, 'Why the line runs under every theory',
    'Every theory you will meet sits somewhere on this line: the biological and psychological families sit towards the caused end, the classical legacy towards the chosen end, and modern multi-factor explanations deliberately occupy the middle, causes shaping the choices a person makes within circumstances they did not choose. Placing a theory, and stating what the placement costs it, is the sharpest evaluation the assessment rewards.',
    { bodyY: 54 });
  return { file: 'crim-freewill-determinism.png' };
}

/* ---------- Page 5: the three theory families ---------- */
function families() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'The three families of criminological theory');
  sub2(x, 'Where each family looks for causes decides its evidence, its strengths and its policy');

  const cols = [60, 516, 972], PW = 416, PY = 118, PH = 640;
  const panels = [
    ['Biological theories', GREEN, 'Cause in the body',
      'Heredity, brain structure, neurochemistry, physique. Offending as a characteristic of organisms.',
      'Level of explanation',
      'The individual organism, inside the person where choice cannot reach.',
      'Key theories',
      'Lombroso\u2019s atavism; Sheldon\u2019s somatotypes; modern genetics, neurochemistry and brain imaging.',
      'Policy implication',
      'Medical: identify, treat, manage the cause, never punish the symptom alone.'],
    ['Psychological theories', BLUE, 'Cause in the person\u2019s development',
      'Personality, moral reasoning, intelligence, learned behaviour acquired through interaction.',
      'Level of explanation',
      'The developing individual and their relationships, the mind rather than the body or the structure.',
      'Key theories',
      'Personality (Eysenck), moral development (Kohlberg), social learning (Bandura, Akers), differential association (Sutherland).',
      'Policy implication',
      'Behavioural: cognitive skills, mentoring, programmes that change learning and reasoning.'],
    ['Sociological theories', PURPLE, 'Cause in society',
      'Blocked opportunity, subcultures, weakened bonds, labelling, class power in the law itself.',
      'Level of explanation',
      'Social structures and processes, outside the individual, in the world the offender did not choose.',
      'Key theories',
      'Strain (Merton), subcultures (Cohen), control (Hirschi), labelling (Becker), conflict and Marxist theories.',
      'Policy implication',
      'Social: opportunity provision, community, reform of how the system itself responds.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 20, PY + 42, i + 1, p[0], p[1], 19);
    let y = PY + 86;
    for (let k = 2; k <= 8; k += 2) {
      text(x, p[k], px + PW / 2, y, { size: 13.5, bold: true, color: p[1] });
      y = wrap(x, p[k + 1], px + 24, px + PW - 24, y + 24, { size: 13.5, lh: 18 }) + 8;
    }
  });

  band(x, 792, 260, 'Rivals, and also partners',
    'The families are rivals, a scenario\u2019s facts will usually fit more than one, and the top-band answer chooses the best-fitting lenses rather than reciting the library. But the families are also partners at different levels: the Cambridge Study of Delinquent Development found adult offending best predicted by individual impulsivity, family criminality and poverty together, risk factors from every family at once, and the modern biological findings, switched vulnerabilities rather than destinies, point the same way: causes stack, and so do explanations.',
    { bodyY: 56 });
  return { file: 'crim-theory-families.png' };
}

/* ---------- Page 7: the four-step scenario method ---------- */
function scenarioMethod() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'The scenario method: four steps from case to verdict');
  sub2(x, 'The method used throughout Unit 2; each step uses the one before it');

  const xs = [60, 416, 772, 1128], PW = 320, PY = 130, PH = 620;
  const steps = [
    ['Interrogate the scenario', BLUE, 'List and classify every fact: individual facts, age, temperament, injuries, schooling; social facts, family, peers, neighbourhood; event facts, what was done, with whom, for what gain.'],
    ['Shortlist the theories', GREEN, 'Ask each theory\u2019s mechanism one question: does anything in this scenario give it work to do? Keep two to four lenses that fit distinct facts, from more than one family.'],
    ['Explain through the mechanism', AMBER, 'Write each theory\u2019s causal chain in its own terms, from cause to mechanism to this scenario\u2019s offending, naming the theorist and using the facts as the links.'],
    ['Evaluate and recommend', PURPLE, 'Ask what each theory explains well, what it misses, and which explanation survives best; then recommend the responses that follow from the verdict, naming which theory each descends from.'],
  ];
  steps.forEach((s, i) => {
    const px = xs[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 18, PY + 42, i + 1, s[0], s[1], 16);
    wrap(x, s[2], px + 22, px + PW - 22, PY + 92, { size: 15, lh: 21 });
  });
  x.strokeStyle = GREY; x.fillStyle = GREY; x.lineWidth = 3;
  for (let j = 0; j < 3; j++) {
    const x1 = xs[j] + PW, x2 = xs[j + 1], y = PY + PH / 2;
    x.beginPath(); x.moveTo(x1 + 5, y); x.lineTo(x2 - 9, y); x.stroke();
    x.beginPath(); x.moveTo(x2 - 3, y); x.lineTo(x2 - 13, y - 7); x.lineTo(x2 - 13, y + 7); x.closePath(); x.fill();
  }

  band(x, 786, 266, 'The shape of a top-band answer',
    'A theory-driven analysis, not a talent: step one feeds the shortlist, the shortlist bounds the explanations, and the evaluation is decided against the scenario\u2019s own facts rather than general opinions. Ranking a family low, when its lenses fit weakly, is the method working, and the final recommendation must descend from the theory that won the evaluation, a punish-response after a caused-verdict is a script arguing with itself.',
    { bodyY: 56 });
  return { file: 'crim-scenario-method.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([faultLine, families, scenarioMethod], only);
  console.log(JSON.stringify(done));
})();
module.exports = { faultLine, families, scenarioMethod };