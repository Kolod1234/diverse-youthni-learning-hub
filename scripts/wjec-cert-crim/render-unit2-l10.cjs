/*
 *  WJEC Level 3 Applied Certificate in Criminology — Unit 2 Criminological
 *  Theories. Lesson 10: Sociological theories I: consensus, strain and
 *  subcultures. Diagrams for pages 3, 4 and 7.
 *  Run: node render-unit2-l10.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, text, line,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 3: anomie to strain ---------- */
function anomieStrain() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'From anomie to strain: the two founding claims');
  sub2(x, 'Durkheim\u2019s normlessness in times of rapid change, and Merton\u2019s disjunction between goals and means');

  const cols = [60, 772], PW = 616, TY = 120, TH = 330;
  const panels = [
    ['Durkheim: anomie', BLUE,
      'Crime is normal: every known society has it. Punishment is a collective ritual that reaffirms the shared values the offender broke, so crime performs boundary maintenance.\n\nAnomie names the state when society changes faster than its norms, boom or collapse, the old rules lose their grip before new ones form. Deregulation, not poverty itself, raises deviance: rates rise in sudden prosperity and sudden ruin alike, so the disruption is the operative cause, and the claim is testable against crime surges in periods of upheaval.'],
    ['Merton: strain', RED,
      'The culture prescribes success goals to everyone; the structure supplies the legitimate means unequally. American society taught the dream to all and rationed the ladders.\n\nThe disjunction between goals and means is strain, and it falls hardest where the means are weakest, among the poor. The theory predicts a class gradient in utilitarian offending, acquisitive crime as the unauthorised pursuit of the authorised dream, and the prediction is checkable, which is why Merton survives as a tested theory rather than an interpretation.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, TY, PW, TH);
    panelHeader(x, px + 22, TY + 44, i + 1, p[0], p[1], 20);
    wrap(x, p[2], px + 28, px + PW - 28, TY + 96, { size: 14.5, lh: 20 });
  });

  // shared consensus assumption panel
  const CY = 500, CH = 210;
  box(x, 60, CY, 1348 - 152, CH, { fill: '#eff6ff', stroke: '#bfdbfe' });
  text(x, 'What both share: the consensus assumption', 724, CY + 34, { size: 18, bold: true, color: BLUE });
  wrap(x, 'Every consensus theory assumes that the members of society broadly hold the same values: that the goals the culture advertises are genuinely wanted by the people the structure blocks. Order is the normal state, and crime is explained as a structural failure, a blockage in the pathways to goals everyone shares. Mark that assumption wherever you find it: it is the family\u2019s foundation and, its critics say, its weakness, since the sharing of goals is asserted rather than demonstrated, and the whole mechanism idles if the poor never wanted the dream at all.',
    110, 1338, CY + 66, { size: 14.5, lh: 20 });

  band(x, 740, 300, 'The mechanism in one sentence',
    'Society presses the same goals on everyone and supplies the means to reach them unevenly, so those at the bottom of the means distribution live in the widest gap between what they are taught to want and what they are permitted to reach, and offending, for a minority of them, becomes the substitute pathway: crime here is not the rejection of the culture\u2019s values but their over-pursuit by other means. The evaluation the next pages perform: the strain explains the class gradient and the utilitarian profile of blocked-opportunity offending, but predicts far more innovation than exists, says nothing about the gender gap, and cannot touch the non-utilitarian offending that Cohen\u2019s subcultures, page 6, were built to explain.',
    { bodyY: 56 });
  return { file: 'crim-anomie-strain.png' };
}

/* ---------- Page 4: the five adaptations ---------- */
function adaptations() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'Merton\u2019s five adaptations to structural strain');
  sub2(x, 'Defined by accepting or rejecting the cultural goals and the institutional means');

  const adapt = [
    ['Conformity', GREEN, 'Goals accepted', 'Means accepted',
      'Most people, even most of the strained, keep playing by the rules. Conformity is the modal response any strain theory must acknowledge, and its prevalence is the over-prediction problem in one word.',
      'The estate resident who never offends'],
    ['Innovation', RED, 'Goals accepted', 'Means rejected',
      'The prescribed success is pursued by routes the law forbids. The classic adaptation of the poor under pressure: theft, fraud and dealing as the unauthorised pursuit of the authorised dream. Explains utilitarian crime.',
      'Selling stolen goods for the life wages cannot fund'],
    ['Ritualism', GREY, 'Goals downgraded', 'Means accepted',
      'Ambition is abandoned but the rules are kept: the cautious person takes refuge in doing the job correctly, expecting no rise. Law-abiding resignation rather than pursuit.',
      'The clerk who no longer expects promotion'],
    ['Retreatism', AMBER, 'Goals rejected', 'Means rejected',
      'The competition is abandoned altogether, on both sides of the law: private escape through addiction, vagrancy and drunkenness rather than pursuit of any goal, legitimate or not.',
      'The long-term addict living outside both markets'],
    ['Rebellion', PURPLE, 'Goals replaced', 'Means replaced',
      'Both the goals and the means are substituted with new ones: political or religious movements that seek a different social order rather than success within this one.',
      'The militant campaigning to abolish the order itself'],
  ];
  const PW = 262, GAP = 24, X0 = 60, PY = 130, PH = 560;
  adapt.forEach((a, i) => {
    const px = X0 + i * (PW + GAP);
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 14, PY + 42, i + 1, a[0], a[1], 16);
    text(x, a[2], px + PW / 2, PY + 88, { size: 13.5, bold: true, color: a[1] });
    text(x, a[3], px + PW / 2, PY + 112, { size: 13.5, bold: true, color: SOFT });
    x.strokeStyle = LIGHT; x.lineWidth = 2;
    x.beginPath(); x.moveTo(px + 18, PY + 132); x.lineTo(px + PW - 18, PY + 132); x.stroke();
    wrap(x, a[4], px + 18, px + PW - 18, PY + 156, { size: 13, lh: 18 });
    wrap(x, 'Example: ' + a[5], px + 18, px + PW - 18, PY + PH - 96, { size: 12.5, lh: 17, color: GREY });
  });

  band(x, 730, 310, 'Read the grid as a falsifiable prediction',
    'Only two of the five pathways involve offending, and both keep the culture\u2019s goals firmly in view: innovation chases the dream by forbidden means, rebellion replaces the dream entirely. So the theory predicts that blocked-means groups will show elevated utilitarian offending specifically, acquisitive crime rather than crime at random, and that prediction can be checked against the class profile of property crime. The grid\u2019s ideal types are analytic categories, not clinical diagnoses; real people drift and mix, and the theory\u2019s thin machinery cannot say who chooses which column, the gap Cloward and Ohlin\u2019s opportunity structures and Cohen\u2019s subcultures were built to close.',
    { bodyY: 56 });
  return { file: 'crim-strain-adaptations.png' };
}

/* ---------- Page 7: subcultural pathways ---------- */
function subculturePathways() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'The consensus chain: status frustration and the three subcultures');
  sub2(x, 'Cohen\u2019s pathway from school failure to the delinquent subculture, and Cloward and Ohlin\u2019s three neighbourhood routes');

  // top: Cohen chain, 4 boxes
  const chain = [
    ['Working-class boys', BLUE, 'Judged in school by middle-class measuring sticks: language, manners, delayed gratification, ambition.'],
    ['Status frustration', AMBER, 'The double failure: denied the success status they are taught to want, by the institution that measures them.'],
    ['Reaction formation', RED, 'The group resolves the blockage by inverting the system\u2019s values: what the school condemns becomes the currency of respect.'],
    ['Delinquent subculture', PURPLE, 'An alternative status ladder: malicious, negativistic, non-utilitarian delinquency as the way to be somebody.'],
  ];
  const CW = 320, CX = [60, 416, 772, 1128], CY = 120, CHH = 210;
  chain.forEach((s, i) => {
    const px = CX[i];
    box(x, px, CY, CW, CHH);
    panelHeader(x, px + 18, CY + 42, i + 1, s[0], s[1], 17);
    wrap(x, s[2], px + 22, px + CW - 22, CY + 92, { size: 13.5, lh: 18 });
    if (i < 3) text(x, '\u2192', px + CW + 14, CY + CHH / 2, { size: 30, bold: true, color: SOFT });
  });

  // bottom: Cloward & Ohlin three subcultures
  text(x, 'Cloward and Ohlin: the illegitimate opportunity structure is also unequal', 724, 390, { size: 20, bold: true });
  const sub = [
    ['Criminal subculture', GREEN, 'Where organised adult crime is established, the neighbourhood supplies apprenticeships, role models and career ladders. Delinquency is skilful, acquisitive and organised, recruitment upward into professional theft.'],
    ['Conflict subculture', RED, 'Where both structures have failed, no legitimate careers and no organised criminal economy, loose adolescent groups have only violence left: turf, reputation and fighting as the sole currency.'],
    ['Retreatist subculture', AMBER, 'For the double failures, blocked in the legitimate and the criminal structures alike: the drug subculture as a third society where failure at both ladders still buys a place.'],
  ];
  const SY = 430, SH = 330, SW = 436, SX = [60, 516, 972];
  sub.forEach((s, i) => {
    const px = SX[i];
    box(x, px, SY, SW, SH);
    panelHeader(x, px + 20, SY + 44, i + 5, s[0], s[1], 19);
    wrap(x, s[2], px + 26, px + SW - 26, SY + 96, { size: 14, lh: 19.5 });
  });

  band(x, 800, 250, 'The chain\u2019s shared engine, and its shared weakness',
    'Cohen relocated Merton\u2019s strain from the labour market to the school, explaining non-utilitarian group delinquency as an alternative status system; Cloward and Ohlin then sorted the delinquent paths by the neighbourhood\u2019s illegitimate infrastructure, predicting the type of offending from the community\u2019s supply. Both inherit the consensus assumption: each story needs the blocked boys to have first wanted the system\u2019s rewards, an acceptance that is asserted rather than demonstrated, and each leaves the conforming majority unexplained.',
    { bodyY: 56 });
  return { file: 'crim-subculture-pathways.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([anomieStrain, adaptations, subculturePathways], only);
  console.log(JSON.stringify(done));
})();
module.exports = { anomieStrain, adaptations, subculturePathways };