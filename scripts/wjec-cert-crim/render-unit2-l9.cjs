/*
 * WJEC Level 3 Applied Certificate in Criminology — Unit 2 Criminological
 * Theories. Lesson 9: Psychological theories II: learning to offend.
 * Diagrams for pages 2, 4 and 7.
 * Run: node render-unit2-l9.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, text,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 2: the balance of definitions ---------- */
function definitions() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'Differential association: the balance of definitions');
  sub2(x, 'Sutherland\u2019s engine: delinquency begins when the favourable voices exceed the unfavourable');

  // fulcrum balance
  const cx = 724, baseY = 560, armY = 400;
  x.fillStyle = '#94a3b8';
  x.beginPath(); x.moveTo(cx - 22, baseY); x.lineTo(cx + 22, baseY); x.lineTo(cx, baseY - 120); x.closePath(); x.fill();
  x.strokeStyle = GREY; x.lineWidth = 6;
  x.beginPath(); x.moveTo(240, armY); x.lineTo(1208, armY); x.stroke();

  // left pan (unfavourable, lighter)
  const lx = 400, rx = 1048;
  x.strokeStyle = GREY; x.lineWidth = 3;
  [[lx, 0], [rx, 1]].forEach(([px, side]) => {
    x.beginPath(); x.moveTo(px, armY + (side ? 14 : 14)); x.stroke();
    x.beginPath(); x.moveTo(cx, armY); x.lineTo(px, armY + (side ? 60 : 60)); x.stroke();
    const col = side ? '#fee2e2' : '#dcfce7';
    x.fillStyle = col;
    x.strokeStyle = side ? '#dc2626' : '#15803d';
    x.lineWidth = 3;
    x.beginPath(); x.arc(px, armY + 60, 64, 0, Math.PI); x.closePath(); x.fill(); x.stroke();
  });
  text(x, 'Definitions favourable to violating law', rx, armY + 190, { size: 17, bold: true, color: RED });
  wrap(x, 'Techniques, motives and rationalisations: everyone does it, they are insured, you just get by. Supplied earliest and most intensely by intimate groups, family, friends.',
    830, 1270, armY + 220, { size: 14, lh: 19, color: SOFT });
  text(x, 'Definitions unfavourable', lx, armY + 190, { size: 17, bold: true, color: GREEN });
  wrap(x, 'The voices that object: parents, teachers, school itself, law-abiding friends. Removed when exclusion ends them.',
    180, 620, armY + 220, { size: 14, lh: 19, color: SOFT });

  // four weights of association
  const WY = 118, cols4 = [60, 416, 772, 1128], PW4 = 320, WH = 150;
  const weights = [
    ['Frequency', BLUE, 'How often the associations occur: nightly beats monthly.'],
    ['Duration', GREEN, 'How long they last: years of contact outweigh a chance meeting.'],
    ['Priority', PURPLE, 'How early they begin: childhood\u2019s criminal household is the heaviest teacher.'],
    ['Intensity', RED, 'How emotionally close and important they are: the admired weigh most.'],
  ];
  weights.forEach((w, i) => {
    const px = cols4[i];
    box(x, px, WY, PW4, WH);
    panelHeader(x, px + 18, WY + 36, i + 1, w[0], w[1], 16);
    wrap(x, w[2], px + 22, px + PW4 - 22, WY + 80, { size: 13.5, lh: 19 });
  });

  band(x, 790, 268, 'The tipping point, read on any life',
    'A person becomes delinquent when the favourable definitions exceed the unfavourable, so the criminologist\u2019s job on any scenario is to count the voices and weigh them by frequency, duration, priority and intensity: Danny\u2019s father is the earliest and most intense, the garage group the most frequent, and the exclusion removed the unfavourable voice of school, so the balance not only tipped, the tipping was institutionally assisted.',
    { bodyY: 56 });
  return { file: 'crim-differential-association.png' };
}

/* ---------- Page 4: the four stages of observational learning ---------- */
function observational() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'Observational learning: the four stages between watching and doing');
  sub2(x, 'Bandura\u2019s mechanism, demonstrated in the Bobo doll studies; all four stages must operate');

  const xs = [60, 416, 772, 1128], PW = 320, PY = 130, PH = 520;
  const steps = [
    ['Attention', BLUE, 'The model must be noticed. Models who are similar, admired or powerful attract it: older brothers, fathers, gang elders teach more than strangers.'],
    ['Retention', GREEN, 'The observed behaviour is stored and remembered, available for later use without the model present.'],
    ['Reproduction', AMBER, 'The observer must be able to perform it and have the situation that allows it: ability plus opportunity.'],
    ['Motivation', RED, 'The behaviour must be expected to be worth doing: reinforcement direct or vicarious, watched rewards doing the teaching.'],
  ];
  steps.forEach((s, i) => {
    const px = xs[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 18, PY + 42, i + 1, s[0], s[1], 19);
    wrap(x, s[2], px + 22, px + PW - 22, PY + 92, { size: 14.5, lh: 20 });
  });
  x.strokeStyle = GREY; x.fillStyle = GREY; x.lineWidth = 3;
  for (let j = 0; j < 3; j++) {
    const x1 = xs[j] + PW, x2 = xs[j + 1], y = PY + PH / 2;
    x.beginPath(); x.moveTo(x1 + 5, y); x.lineTo(x2 - 9, y); x.stroke();
    x.beginPath(); x.moveTo(x2 - 3, y); x.lineTo(x2 - 13, y - 7); x.lineTo(x2 - 13, y + 7); x.closePath(); x.fill();
  }

  // evidence strip
  const EY = 690, EH = 108;
  box(x, 60, EY, 1348 - 120, EH, { fill: '#eff6ff', stroke: '#bfdbfe' });
  text(x, 'The evidence and its limit: children imitated an adult\u2019s aggression towards an inflatable doll (Bandura, Ross and Ross, 1961), imitating more when the model was rewarded and less when punished (1963)', 724, EY + 36, { size: 16, bold: true, color: BLUE });
  wrap(x, 'Short-term imitation, in a laboratory, with dolls: the mechanism is demonstrated, the leap to criminal behaviour is extrapolation the studies do not license.',
    200, 1248, EY + 68, { size: 14.5, lh: 19, color: SOFT });

  band(x, 826, 232, 'Why watching never guarantees doing',
    'Most witnessed behaviour is never reproduced, because the stages filter: attention may fail, retention fade, reproduction lack ability or opportunity, motivation lack reinforcement. This built-in conditionality is the theory\u2019s honesty, the evaluator\u2019s handle, and the reason the media question on page 6 has a conditional answer, media teach, environments decide whether the lesson is worth performing.',
    { bodyY: 54 });
  return { file: 'crim-observational-learning.png' };
}

/* ---------- Page 7: selection versus socialisation ---------- */
function selection() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'The peer question: selection or socialisation?');
  sub2(x, 'The same delinquent-friendship correlation fits two opposite causal stories');

  const LY = 150, LH = 470;
  // left: socialisation
  box(x, 60, LY, 640, LH);
  panelHeader(x, 84, LY + 44, 1, 'Socialisation: the group teaches', GREEN, 20);
  wrap(x, 'The learning theories\u2019 story. The delinquent group supplies its members with definitions favourable to offending, models to imitate and reinforcement for offending, so the friendship causes the delinquency.\n\nThe member learns: the group\u2019s voices tip the balance, its models supply the techniques, its rewards pay for the behaviour.\n\nSignature evidence: initiation is a group event, an adolescent\u2019s first burglary is nearly always social, and offending becomes more solitary only later in a career, which is what teaching predicts, the learner needs the teachers present to begin.',
    100, 660, LY + 96, { size: 15, lh: 22 });

  // right: selection
  box(x, 748, LY, 640, LH);
  panelHeader(x, 772, LY + 44, 2, 'Selection: the person chooses', PURPLE, 20);
  wrap(x, 'The rival story, associated with Hirschi. Already-delinquent adolescents gravitate to delinquent friends, because those are the company that accepts them, shares their excluded schedules and enjoys what they enjoy, so the delinquency causes the friendship.\n\nThe group consolidates: like finds like, and the already-made delinquent finds the group that suits him.\n\nSignature evidence: adolescents\u2019 prior behaviour predicts their later friends, and much offending continues solo, with the peer correlation strongest where troubled young people cluster by circumstance.',
    788, 1348, LY + 96, { size: 15, lh: 22 });

  band(x, 650, 412, 'The research verdict: both operate, in different phases',
    'Longitudinal studies, following adolescents as friendships and behaviour change, find socialisation effects, adolescents joining groups and offending more afterwards, and selection effects, already-delinquent adolescents gravitating to delinquent friends, with the balance favouring a mix. The phases separate the processes: socialisation dominates initiation, first offences committed with the teachers, selection dominates consolidation, the entrenched offender finding or forming the company that suits him. For any scenario, the discipline is the same: write both stories against the peer facts and adjudicate on the timeline, Danny\u2019s group-initiated, co-offended first burglary favouring socialisation, his pre-garage fighting leaving selection its part.',
    { bodyY: 56 });
  return { file: 'crim-selection-socialisation.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([definitions, observational, selection], only);
  console.log(JSON.stringify(done));
})();
module.exports = { definitions, observational, selection };