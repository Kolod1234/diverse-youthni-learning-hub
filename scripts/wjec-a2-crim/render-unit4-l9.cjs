/*
 * WJEC A2 Criminology, Lesson 9: Crime control: informal and formal methods.
 * Diagrams for pages 3, 8 and 11.
 * Run: node render-unit4-l9.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 3: the control map ---------- */
function controlForms() {
  const [c, x] = make(W, 1086);
  title2(x, 'The control map: agents of informal and formal social control');
  sub2(x, 'Two systems: one invisible, constant and free, one visible, legal and last');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['The family', BLUE,
      'The first agency of control: attachment to people who would be hurt by wrongdoing, supervision that limits opportunity, and example that defines normal. The deepest control happens here, before the law is ever known, and it is entirely unelected.'],
    ['Education and peers', GREEN,
      'Schools extend control beyond the home through belonging, praise and supervision; peer groups control through approval, which is the point: the mechanism works whichever direction the group travels, towards conformity or towards offending.'],
    ['Community and faith', AMBER,
      'Reputation and belonging: where people are known, being known as a thief is costly. This control thins with anonymity and transience, which is why fragmented, transient places host the weakest informal control.'],
    ['Media and culture', PURPLE,
      'The Lesson 5 stream as a control agent: defining what gets condemned defines the norm, modelling behaviour, celebrating order and shaming offenders. Two faced, as ever: it can panic as easily as it polices.'],
    ['The police', RED,
      'The formal system begins: detection, deterrence by presence, and the bounded discretion that decides which norms are enforced where. The visible half of control, arriving only after the invisible half has failed.'],
    ['Courts and the penal system', DARK,
      'Courts apply law credibly and consistently; sentences signal; prisons incapacitate; probation supervises. Sanctions are public and proportionate by design, which is what makes formal control legitimate enough to command obedience.'],
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
  band(x, 866, 196, 'The backstop and the everyday line',
    'Informal control holds the everyday line: it is constant, free and psychologically deep, acting before the act through internalisation and belonging. Formal control catches what gets through: reactive, expensive, rights-bound, arriving only at the residue. The systems are one design, and the ratio of recorded crime to convictions is the statistical proof of how much order rests on the invisible half.',
    { bodyY: 60 });
  return { file: 'crim-control-forms.png' };
}

/* ---------- Page 8: three theories of control ---------- */
function controlTheories() {
  const [c, x] = make(W, 1086);
  title2(x, 'Three lenses on control: functionalism, Marxism and labelling');
  sub2(x, 'Use them as lenses, not banners: each explains a different control fact');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['The functionalist lens', BLUE,
      'Durkheim: society controls through shared norms, the collective conscience, and socialisation into them; crime is normal in every society, and public punishment reaffirms the values by condemning the offender. Control is the condition of trust, not the enemy of freedom.'],
    ['The Marxist lens', RED,
      'Formal control maintains an unequal order: the harms of the poor are criminalised while the harms of the powerful go under-policed, and agencies enforce the behaviour of those with most reason to resent the order. Right about enforcement patterns; too total about law itself.'],
    ['The labelling lens', PURPLE,
      'Control reactions produce deviant identities: being caught, named and processed can convert a one-time deviant into an outsider, and the deviant career begins. Formal intervention can manufacture the criminality it claims to respond to.'],
    ['What each explains best', GREEN,
      'Functionalist: the consensus that condemns robbery and the binding ritual of the public sentence. Marxist: what gets policed and what never does. Labelling: the persistent offender created by exclusion, stigma and rejection from lawful society.'],
    ['What each struggles with', AMBER,
      'Functionalist: deep disagreement about what is wrong. Marxist: the real due process protections conceded to defendants, which a pure class weapon would never concede. Labelling: the primary reality of harm, the burgled house that no label theory should diminish.'],
    ['The applied questions', DARK,
      'Functionalist asks what values a sentence reaffirms. Marxist asks whose harms reach a court at all. Labelling asks what identity the intervention is about to hand a person. One event, three questions: that is theoretical maturity.'],
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
  band(x, 866, 196, 'Lenses, not banners',
    'None of the three lenses is simply wrong: they answer different questions about the same events. The top band in Unit 4 essays applies each lens to the fact it explains best, states honestly where it struggles, and never mounts one theory as a flag while ignoring the facts that embarrass it.',
    { bodyY: 60 });
  return { file: 'crim-control-theories.png' };
}

/* ---------- Page 11: the control pipeline ---------- */
function controlPipeline() {
  const [c, x] = make(W, 1086);
  title2(x, 'The control pipeline: from street to sentence and back');
  sub2(x, 'The system holds only when its outputs rebuild the bonds its inputs lost');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Bonds hold the line', BLUE,
      'Attachment, commitment, involvement and belief: the informal apparatus of family, school, peers, work and community produces the obedience of the majority, constantly, invisibly and for free, long before any law is needed.'],
    ['The failure point', AMBER,
      'Weak bonds, fractured families, exclusions, anonymous streets and vanished work let behaviour through: informal control fails where it is thinnest, in the deprived and transient places, and the residue flows onward.'],
    ['The formal system catches', RED,
      'Police detect, the CPS charges, courts convict and sentence, prisons incapacitate and probation supervises: the rights-bound backstop handling the detected fraction of what the informal world did not hold.'],
    ['The intended outcomes', GREEN,
      'Deterrence for those watching, incapacitation while the term runs, rehabilitation where the system works, and the reaffirmation of norms that Durkheim identified: four aims the punishment lessons will unpack fully.'],
    ['Reintegration', PURPLE,
      'The success exit: a bonded person returns, skilled, employed, attached, and desistence follows, because work and love do what sentences alone never can. The cycle closes, and the informal world absorbs the return.'],
    ['The double failure', DARK,
      'The failure exit: exclusion, stigma and rejection strip the bonds that remained, and the criminal community absorbs the person, controlling them fiercely towards its own norms. The next cycle begins.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 20, py + 44, i + 1, p[0], p[1], 21);
    wrap(x, p[2], px + 26, px + PW - 26, py + 92, { size: 17, lh: 24 });
  });
  arrow(x, cols[0] + PW + 4, 285, cols[1] - 4, 285, { color: GREY, lw: 4 });
  arrow(x, cols[1] + PW + 4, 285, cols[2] - 4, 285, { color: GREY, lw: 4 });
  arrow(x, cols[2] + PW / 2, rows[0] + PH + 4, cols[0] + PW - 90, rows[1] - 6, { color: GREY, lw: 4 });
  band(x, 866, 196, 'Does this policy build bonds or spend them?',
    'The pipeline judges the formal system by what it returns: a sentence that gives back a bonded person converts failure into informal control, and one that returns a person with fewer bonds manufactures the next cycle. Ask of every curfew, prison, community order and restorative conference the same single question: does it build bonds or spend them?',
    { bodyY: 60 });
  return { file: 'crim-control-pipeline.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([controlForms, controlTheories, controlPipeline], only);
  console.log(JSON.stringify(done));
})();
module.exports = { controlForms, controlTheories, controlPipeline };