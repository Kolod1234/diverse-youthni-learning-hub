/*
 * WJEC Level 3 Applied Certificate in Criminology — Unit 2 Criminological
 * Theories. Lesson 8: Psychological theories I: the inner world.
 * Diagrams for pages 2, 4 and 7.
 * Run: node render-unit2-l8.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, text,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 2: Freud's three routes ---------- */
function superego() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'The psychoanalytic model: offending as a superego that failed');
  sub2(x, 'Id, ego and superego, and the three routes through which the conscience fails');

  // top: the three structures
  const cols = [60, 516, 972], PW = 416, TY = 118, TH = 210;
  const structs = [
    ['The id', RED, 'Present from birth: raw, present-tense demand for pleasure and immediate satisfaction, no morality, no patience.'],
    ['The ego', BLUE, 'The reality-testing negotiator: works out how to satisfy the id without disaster, holding the person in the world.'],
    ['The superego', GREEN, 'The internalised voice of parents and society, formed in childhood through identification: it demands, judges and punishes with guilt.'],
  ];
  structs.forEach((s, i) => {
    const px = cols[i];
    box(x, px, TY, PW, TH);
    panelHeader(x, px + 20, TY + 42, i + 1, s[0], s[1], 20);
    wrap(x, s[2], px + 26, px + PW - 26, TY + 88, { size: 14.5, lh: 20 });
  });

  // bottom: three routes
  const RY = 360, RH = 380;
  const routes = [
    ['The weak superego', RED, 'Early relationships fail, so no strong internal voice ever forms; the id\u2019s demands meet only a feeble objection.',
      'The impulsive, unsocialised offender, untroubled by guilt.'],
    ['The deviant superego', PURPLE, 'Identification succeeds, but the internalised voice belongs to criminal parents; conscience speaks fluently and endorses offending.',
      'The criminal-household offender, loyal rather than guilty.'],
    ['The harsh superego', AMBER, 'An over-strict conscience breeds unconscious guilt; offending is committed to be caught and punished, relieving it.',
      'The guilt-driven offender, classically the compulsive shoplifter.'],
  ];
  routes.forEach((r, i) => {
    const px = cols[i];
    box(x, px, RY, PW, RH);
    panelHeader(x, px + 20, RY + 42, i + 4, r[0], r[1], 19);
    let y = wrap(x, r[2], px + 26, px + PW - 26, RY + 88, { size: 14.5, lh: 20 }) + 18;
    x.strokeStyle = LIGHT; x.lineWidth = 2;
    x.beginPath(); x.moveTo(px + 26, y); x.lineTo(px + PW - 26, y); x.stroke();
    wrap(x, r[3], px + 26, px + PW - 26, y + 24, { size: 14.5, lh: 20, color: GREY });
  });

  band(x, 768, 290, 'The mechanism in one sentence',
    'The balance of personality structures, formed in childhood, decides the conscience\u2019s control over behaviour, so offending is what a failed, deviant or over-strict superego lets happen, the person never fully choosing and never fully blamed, the purest developmental determinism in the course. The evaluation the next page performs: every route is diagnosed from the offending it explains, so the theory confirms itself whatever the offender does, unfalsifiable and therefore not a tested explanation.',
    { bodyY: 56 });
  return { file: 'crim-superego.png' };
}

/* ---------- Page 4: Eysenck's pathway ---------- */
function personality() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'Eysenck\u2019s pathway: temperament, conditioning and the criminal personality');
  sub2(x, 'From nervous-system arousal to a conscience that never fully formed');

  const xs = [60, 416, 772], PW = 320, PY = 130, PH = 420;
  const dims = [
    ['Extraversion', BLUE, 'Outgoing, sensation-seeking, socially dominant; the nervous system idles under-aroused, so excitement is hunted.'],
    ['Neuroticism', AMBER, 'Anxious, moody, emotionally unstable; whatever is learned is coloured and destabilised by anxiety.'],
    ['Psychoticism', RED, 'Cold, aggressive, impulsive, low in empathy; the antisocial option is available in the first place.'],
  ];
  dims.forEach((d, i) => {
    const px = xs[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 18, PY + 42, i + 1, d[0], d[1], 19);
    wrap(x, d[2], px + 22, px + PW - 22, PY + 92, { size: 14.5, lh: 20 });
  });

  // socialisation mechanism row
  const MY = 590, MH = 140;
  box(x, 60, MY, 1348 - 152, MH, { fill: '#eff6ff', stroke: '#bfdbfe' });
  text(x, 'The mechanism: socialisation is conditioning', 724, MY + 34, { size: 18, bold: true, color: BLUE });
  wrap(x, 'Children learn right from wrong because wrongdoing is punished and the punishment becomes associated with the act, building a conditioned conscience, discomfort at the thought of doing wrong. The under-aroused extravert conditions poorly, punishments make too little impression, so the conscience forms weakly and unreliably.',
    110, 1338, MY + 66, { size: 14.5, lh: 20 });

  band(x, 754, 304, 'The prediction and its shape',
    'Combine the dimensions and the criminal personality appears: a sensation-seeking, emotionally unstable, impulsive person whose socialisation never fully took, offending whenever the excitement outweighs the weak discomfort of guilt. Note the structural claim carefully: these are dimensions of normal variation, not a separate type of person, so the offender sits at the extreme ends of everyone\u2019s scales, the born-criminal category refuted by the theory\u2019s own architecture, and the treatment premise follows at once, a conscience built by conditioning can be re-conditioned deliberately.',
    { bodyY: 56 });
  return { file: 'crim-personality.png' };
}

/* ---------- Page 7: Kohlberg's ladder ---------- */
function moralStages() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'Kohlberg\u2019s stages of moral development and the arrest claim');
  sub2(x, 'Reasoning matures from punishment-avoidance to principle, and offending groups reason disproportionately at the earliest levels');

  const levels = [
    ['Pre-conventional', RED, 'Stage 1: right is what avoids punishment. Stage 2: right is what serves my own interest or exchange.', 'The level where offending groups concentrate: punishment-avoidance and self-interest, the reasoning of a child.'],
    ['Conventional', AMBER, 'Stage 3: right is what wins approval, the good boy or girl. Stage 4: right is what upholds law and order.', 'Most adolescents and adults; offenders\u2019 reasoning is found at the lower edge of this range as often as below it.'],
    ['Post-conventional', GREEN, 'Stage 5: right is what a social contract would endorse. Stage 6: right follows universal principles above the law.', 'Reached by a minority of adults; no criminological claim attaches to these stages.'],
  ];
  // ladder: three ascending panels
  const baseY = 700, lw = 380, lx = 60;
  levels.forEach((l, i) => {
    const py = baseY - 170 - i * 170;
    const px = lx + i * 90;
    box(x, px, py, lw, 160);
    text(x, l[0], px + lw / 2, py + 30, { size: 17.5, bold: true, color: l[1] });
    let y = wrap(x, l[1 + 1], px + 20, px + lw - 20, py + 56, { size: 13.5, lh: 18 }) + 8;
    wrap(x, l[2], px + 20, px + lw - 20, y, { size: 13, lh: 17, color: GREY });
  });

  // right panel: the arrest claim
  const RX = 700, RW = 688, RY = 150, RH = 560;
  box(x, RX, RY, RW, RH, { fill: '#fff' });
  panelHeader(x, RX + 22, RY + 42, 4, 'The criminological claim: arrest', PURPLE, 20);
  wrap(x, 'Development depends on maturation and experience, and it can arrest: some people\u2019s reasoning never leaves the childhood logic of punishment-avoidance and self-interest, whatever their age.\n\nTested with moral dilemmas, offending groups reason disproportionately at pre-conventional and early conventional levels: studies of convicted offenders, including Palmer and colleagues\u2019 work in England, found substantial proportions reasoning at juvenile stages.\n\nSo offending, on this theory, is not chosen evil but a reasoning that never developed, the person justifying the act with the self-interest of a child, and the treatment follows from the claim directly: reasoning that arrested can be restarted by teaching, the premise of moral reasoning programmes such as Aggression Replacement Training.',
    RX + 30, RX + RW - 30, RY + 92, { size: 15.5, lh: 22 });

  band(x, 880, 182, 'The limits any citation carries',
    'Reasoning measured by talking predicts behaviour only modestly, so a stage score is not a conduct forecast; the justice-centred dilemmas have been criticised as favouring particular cultures and men\u2019s reasoning, so the ladder measures a kind of maturity, not all of it.',
    { bodyY: 52 });
  return { file: 'crim-moral-stages.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([superego, personality, moralStages], only);
  console.log(JSON.stringify(done));
})();
module.exports = { superego, personality, moralStages };