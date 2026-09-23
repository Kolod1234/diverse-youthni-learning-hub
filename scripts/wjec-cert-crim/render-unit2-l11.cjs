/*
 *  WJEC Level 3 Applied Certificate in Criminology — Unit 2 Criminological
 *  Theories. Lesson 11: Sociological theories II: control, labelling and
 *  class power. Diagrams for pages 2, 6 and 7.
 *  Run: node render-unit2-l11.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, text,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 2: Hirschi's four bonds ---------- */
function socialBonds() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'Hirschi\u2019s social bond: why most people do not offend');
  sub2(x, 'Four bonds tie the person to conformity; weaken them and the calculus of offending changes');

  const bonds = [
    ['Attachment', BLUE, 'Care about the opinion and feelings of parents, teachers and friends. The bond that makes wrongdoing an act of betrayal: we do not hurt people whose judgement we fear losing. The strongest predictor of the four in Hirschi\u2019s own data.'],
    ['Commitment', GREEN, 'Investment built up in conventional life: education, a job, a reputation, a record. Offending now risks everything accumulated; the more there is to lose, the more the rational person holds back.'],
    ['Involvement', AMBER, 'Time and energy absorbed by legitimate activity: school, work, sport, family. Busy people simply lack the hours and occasions for offending, the most mechanical bond.'],
    ['Belief', PURPLE, 'Endorsement of the law\u2019s moral validity: the rule deserves obedience, not merely the punishment it carries. Its erosion is the willingness to offend without waiting to be caught.'],
  ];
  const xs = [60, 772], ys = [120, 470], PW = 616, PH = 320;
  bonds.forEach((b, i) => {
    const px = xs[i % 2], py = ys[Math.floor(i / 2)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 22, py + 44, i + 1, b[0], b[1], 20);
    wrap(x, b[2], px + 28, px + PW - 28, py + 96, { size: 15, lh: 21 });
  });

  band(x, 830, 230, 'The reframing that makes this a different family of theory',
    'Every theory so far asked why some people offend. Hirschi asked the inverted question, why does everyone not offend, since temptation is universal and detection is rare? The answer is that society binds its members before any temptation arrives, so offending follows not the presence of criminal motivation but the absence of the bonds that make conformity worth keeping. Crime, on this account, needs no cause to be explained; it is what happens when the restraint falls away.',
    { bodyY: 56 });
  return { file: 'crim-social-bonds.png' };
}

/* ---------- Page 6: the labelling spiral ---------- */
function labellingSpiral() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'From primary to secondary deviance: the labelling spiral');
  sub2(x, 'Lemert\u2019s stages, Becker\u2019s identity, Young\u2019s amplification, in one continuous loop');

  const steps = [
    ['Primary deviance', GREY, 'The initial act: minor, varied, unexamined. Its causes are irrelevant to the career ahead; everyone commits some, and it does not yet change how the person sees themselves.'],
    ['Societal reaction', RED, 'The response of police, courts, school, employers, family and media: surveillance, arrest, exclusion, publicity. The reaction, not the act, is what creates the career.'],
    ['The deviant label', AMBER, 'The public identity: troublemaker, thief, addict. It becomes the master status that eclipses every other identity, and the labelled person is now processed as a type.'],
    ['Secondary deviance', PURPLE, 'Behaviour organised around the label: cut off from legitimate routes, the person joins the deviant group, adopts its identity and offends more, confirming the label that caused it.'],
  ];
  const PW = 320, xs = [60, 416, 772, 1128], PY = 130, PH = 330;
  steps.forEach((s, i) => {
    const px = xs[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 18, PY + 44, i + 1, s[0], s[1], 17);
    wrap(x, s[2], px + 22, px + PW - 22, PY + 96, { size: 13.5, lh: 18.5 });
    if (i < 3) text(x, '\u2192', px + PW + 14, PY + PH / 2, { size: 30, bold: true, color: SOFT });
  });

  // amplification loop note
  const AY = 520, AH = 160;
  box(x, 60, AY, 1348 - 152, AH, { fill: '#eff6ff', stroke: '#bfdbfe' });
  text(x, 'The loop closes: deviance amplification', 724, AY + 34, { size: 18, bold: true, color: BLUE });
  wrap(x, 'Secondary deviance draws a stronger reaction, which deepens the label, which produces more secondary deviance, so each turn of the cycle manufactures the evidence that the label was deserved. Jock Young\u2019s Notting Hill marijuana study traced the loop in the field: police crackdowns on a marginal drug subculture pushed users away from conventional society and into deviant social circles, where use increased, exactly as the spiral predicts.',
    110, 1338, AY + 66, { size: 14.5, lh: 20 });

  band(x, 716, 330, 'What the spiral explains, and what it must borrow from elsewhere',
    'The spiral explains the career, how minor rule-breaking hardens into a deviant identity, and it explains the observed bias of enforcement, since the reaction is applied selectively, to the powerless and the visible. What it does not explain is the primary deviance it starts from: the first act\u2019s causes, biological, psychological or structural, remain whatever they were before the labelling began, a gap you must state openly in every evaluation of the interactionist family.',
    { bodyY: 56 });
  return { file: 'crim-labelling-spiral.png' };
}

/* ---------- Page 7: the moral panic cycle ---------- */
function moralPanic() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'Cohen\u2019s moral panic: the Mods and Rockers, 1964');
  sub2(x, 'How a minor clash on the Brighton coast became folk devils, a national panic and a deviance-amplifying spiral');

  const steps = [
    ['The minor event', GREY, 'Scattered seaside scuffles between youth groups at Whitsun 1964: disorder, but on the scale of a bad Saturday, not a national emergency.'],
    ['Media amplification', RED, 'Exaggerated, symbol-loaded coverage: headlines, symbols of menace, a narrative of two armies. Editors, Cohen argued, mediated the events into a story.'],
    ['Folk devils and panic', AMBER, 'The groups become folk devils, visible reminders of moral decline; public alarm crystallises, sensitising society to the next, smaller sign of trouble.'],
    ['Mobilisation', BLUE, 'Police operations, court dragnets, political statements: the panic is answered with force, and deviance-work becomes an institutional growth area.'],
    ['Amplified deviance', PURPLE, 'More policing finds more deviance, which is reported as confirmation of the panic, feeding the next round of the spiral. The panic creates its own evidence.'],
  ];
  const PW = 262, xs = [60, 346, 632, 918, 1204], PY = 130, PH = 360;
  steps.forEach((s, i) => {
    const px = xs[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 14, PY + 42, i + 1, s[0], s[1], 14.5);
    wrap(x, s[2], px + 18, px + PW - 18, PY + 90, { size: 13, lh: 18 });
    if (i < 4) text(x, '\u2192', px + PW + 11, PY + PH / 2, { size: 26, bold: true, color: SOFT });
  });

  band(x, 540, 300, 'The two claims to separate when you cite the study',
    'Cohen\u2019s first claim is sociological description: the media and control agencies, each for their own reasons, audiences to serve and work to justify, jointly manufactured the Mods and Rockers as a moral panic, a concept that has since been applied from mugging to video nasties. The second claim is causal: the panic amplified the very deviance it feared, sensitised youth saw the folk-devil identity as an available one, and the police dragnet guaranteed arrests that read as confirmation. The first claim is well evidenced in Cohen\u2019s content analysis; the second, that media reaction caused more deviance, is far harder to test, which is exactly the evaluation you pair with the study.',
    { bodyY: 56 });
  return { file: 'crim-moral-panic.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([socialBonds, labellingSpiral, moralPanic], only);
  console.log(JSON.stringify(done));
})();
module.exports = { socialBonds, labellingSpiral, moralPanic };