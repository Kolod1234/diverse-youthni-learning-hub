/*
 * WJEC A2 Criminology, Lesson 11: Aims of punishment: retribution, deterrence
 * and beyond. Diagrams for pages 4, 9 and 11.
 * Run: node render-unit4-l11.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 4: the six aims ---------- */
function punishmentAims() {
  const [c, x] = make(W, 1086);
  title2(x, 'The six aims of punishment: justification, mechanism, evidence');
  sub2(x, 'Every aim is a whole theory: what it permits, how it works, and the question that tests it');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Retribution', RED,
      'The offence deserves proportionate suffering: punishment justified by the deed itself, backward looking, respecting the offender as a responsible moral agent and capping the state at the deserved. The question: who owns the arithmetic of how much is enough?'],
    ['Deterrence', AMBER,
      'Punishment prevents crime by calculation: the punished learn (individual) and the watching public learns (general). The question: does the evidence show severity deterring anyone the certainty of capture does not already deter?'],
    ['Rehabilitation', BLUE,
      'Punishment changes the person: treatment and training address the causes of offending and the offender desists. The question: is the programme targeted, skilled and sustained, or generic, box-tick and episodic?'],
    ['Incapacitation', PURPLE,
      'Confinement prevents the crimes the offender would have committed on the street during the term. The question: how much prevention is left once the age crime curve, replacement and prison harms are netted off?'],
    ['Denunciation', GREEN,
      'The sentence is a public statement of condemnation that reaffirms the broken norm and binds society. The question: does expressive competition inflate sentences without end, yesterday denunciation becoming today leniency?'],
    ['Reparation', DARK,
      'Punishment answers the harm: compensation, restored property and unpaid work repair the victim and the community, the only aim centred on the harmed. The question: can irreparable harms be priced, and who agreed the price?'],
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
  band(x, 866, 196, 'One sentence, six claims',
    'Retribution alone looks backwards at the offence; the other five look forwards at future goods, which means they live or die by their evidence while retribution lives or dies by its philosophy. The Criminal Justice Act 2003 lists the purposes of sentencing as a bundle, so a real sentence makes all six claims at once, and the essay tests which claims it actually delivers.',
    { bodyY: 60 });
  return { file: 'crim-punishment-aims.png' };
}

/* ---------- Page 9: decoding a sentence ---------- */
function sentenceDecode() {
  const [c, x] = make(W, 1086);
  title2(x, 'Decoding a sentence: the Ely eight years, aim by aim');
  sub2(x, 'One sentence makes six claims; the reviewer and the essayist test each one');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Retribution: served', RED,
      'The claim: eight years is proportionate to a knife robbery under the guidelines, within the category range for high culpability and serious harm. The assessment: the strongest claim, because the desert arithmetic is visible on the record and appealable in both directions.'],
    ['Deterrence: weak', AMBER,
      'The claim: the watching young men of Ely calculate that robbery does not pay. The assessment: the weakest claim, because severity is the wrong lever, certainty is what deters, and the audience for street robbery barely calculates consequences at all.'],
    ['Rehabilitation: conditional', BLUE,
      'The claim: a young offender institution will train and educate so the man who emerges at thirty two is different. The assessment: entirely dependent on delivery; a resourced regime with real education can serve the aim, and warehousing cannot.'],
    ['Incapacitation: decaying', PURPLE,
      'The claim: the robberies he cannot commit until release are prevented. The assessment: arithmetically real, but each year past his late twenties buys less, as the age crime curve flattens, and the prison experience itself must be netted against it.'],
    ['Denunciation: delivered', GREEN,
      'The claim: the public statement that knife robbery is condemned by everyone. The assessment: delivered at the moment of sentencing and costlessly, though the expressive ratchet shadows every escalation of the tariff.'],
    ['Reparation: forgotten', DARK,
      'The claim: the shopkeeper harm is answered. The assessment: the custodial sentence repairs nothing unless the court attaches a compensation order, which is why the victim centred aim is the one most easily lost in a prison led system.'],
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
  band(x, 866, 196, 'The essay is the test of the bundle',
    'A sentence that must serve six masters can serve none well: desert wants the term to track the offence, treatment wants it to track need, confinement wants it to track danger, and the judge must deliver all of them in one figure. The guideline architecture makes desert the frame and the rest adjustments, and every aims question in the examination asks whether the adjustments hold or quietly become the frame.',
    { bodyY: 60 });
  return { file: 'crim-sentence-decode.png' };
}

/* ---------- Page 11: the conflict map ---------- */
function aimsConflicts() {
  const [c, x] = make(W, 1086);
  title2(x, 'The conflict map: six aims, one sentence');
  sub2(x, 'Allies, enemies and the moving battlefield where the conflicts are decided');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Retribution as the frame', RED,
      'The guidelines make desert the structure: seriousness, category ranges, starting points, aggravating and mitigating factors. The other aims operate as adjustments within it, which is the system answer to the bundling problem.'],
    ['The forward looking allies', GREEN,
      'Deterrence, rehabilitation, incapacitation, denunciation and reparation all look to future goods, and can serve together in one sentence: treatment inside a desert term, protection through confinement, repair through attached orders.'],
    ['Rehabilitation against desert', BLUE,
      'The term treatment needs is not the term the offence deserves: the addict who could change in six months may deserve two years, and history warns that letting need set terms produced indeterminate arbitrary detention.'],
    ['Incapacitation against desert', PURPLE,
      'Danger predicts; deeds deserve: selective incapacitation sentences the forecast, not the offence, and its false positives are people held beyond their desert for crimes they would never have committed.'],
    ['Deterrence against rehabilitation', AMBER,
      'The deterrent sentence must be harsh to send the message, and the harsh sentence damages exactly the circumstances (bonds, housing, work) that treatment needs; a sentence cannot be toughened into reform.'],
    ['Reparation against desert', DARK,
      'The repair the victim wants can be far smaller than the suffering the desert demands, and the sentence that satisfies the victim may under-punish in the public eye, or punish past what the harm could price.'],
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
  band(x, 866, 196, 'The conflicts move into the adjustments',
    'Desert first, the others as adjustments, does not dissolve the conflicts: it relocates them into the pre-sentence report, the sentencing remarks and the appeal review, where judges reconcile them case by case. That is why lawful sentences on identical facts differ, and why the system reviews its own reconciliations from above.',
    { bodyY: 60 });
  return { file: 'crim-aims-conflicts.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([punishmentAims, sentenceDecode, aimsConflicts], only);
  console.log(JSON.stringify(done));
})();
module.exports = { punishmentAims, sentenceDecode, aimsConflicts };