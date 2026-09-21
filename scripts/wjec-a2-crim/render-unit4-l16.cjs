/*
 * WJEC A2 Criminology, Lesson 16: Unit 4 examination practice with model
 * answers. Diagrams for pages 3, 6 and 12.
 * Run: node render-unit4-l16.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 3: the unit map ---------- */
function unit4Map() {
  const [c, x] = make(W, 1086);
  title2(x, 'Unit 4 on one page: the knowledge map');
  sub2(x, 'Four regions, every core tool named: the revision image for the final fortnight');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Crime control', RED,
      'Informal (family, school, community, conscience) and formal (police, CPS, courts, probation, prisons) control, the consent arithmetic, and the models of justice: the assembly line against the obstacle course, every institution a settlement on the line between them.'],
    ['Punishment', AMBER,
      'The six aims with their verdicts (desert delivered, certainty deters, rehabilitation conditional, protection decaying, denunciation cheap, reparation fragile), their conflicts (term deserved against term needed, forecast against deed), and the guideline architecture that reconciles them case by case.'],
    ['Imprisonment and alternatives', BLUE,
      'The prison ledger (custody and desert delivered, the churn criminogenic), the reoffending magnitudes with their caveats, the reservation argument, the disposal map (custody, community order, fine, suspended sentence, restorative justice), and the RJ evidence on its two conditions.'],
    ['Prevention', GREEN,
      'The situational tradition (opportunity theory, the technique families, hot spots and repeat victims, partial displacement plus diffusion, months horizon) and the social tradition (risk and protective factors, early intervention economics, decades horizon), layered in one plan.'],
    ['Agencies and evaluation', PURPLE,
      'The two-layer machine and its dependencies, the consent model and the Peelian inversion, the join failures of partnership, the delivery gap, and the four questions: does it work, unintended consequences, cost, justice, with the aims pinned first.'],
    ['The one argument', DARK,
      'The regions are one argument: the state controls crime formally and informally, within models of justice, through institutions that punish with named aims, evaluated by evidence, preventable on two horizons, delivered by agencies that must be audited. Cross-region synthesis is the top band.'],
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
  band(x, 866, 196, 'Reconstruct before you revise',
    'Cover the panels and rebuild each region from memory: the reconstruction test finds the thin regions that targeted revision fixes, and the retrieval itself is the revision (testing beats re-reading). Then move across regions deliberately in practice answers, because the strongest examination essays cite the reservation argument in a punishment essay and the consent model in an agency essay.',
    { bodyY: 60 });
  return { file: 'crim-unit4-map.png' };
}

/* ---------- Page 6: the essay anatomy ---------- */
function essayAnatomy() {
  const [c, x] = make(W, 1086);
  title2(x, 'The anatomy of a full-mark essay');
  sub2(x, 'Five parts, one assembly, every essay in the paper');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Define early', RED,
      'The opening move: the concept stated precisely in the first lines, with its image or distinction (the assembly line, legal versus factual guilt, the day fine). The examiner knows at once this is a trained answer, and the definition is the frame the evidence hangs on.'],
    ['Price the evidence', AMBER,
      'Every finding arrives with its comparator and its caveat: certainty over severity, the reoffending magnitudes with the selection caveat, the RJ findings with their consenting-participant base. The credibility mark is earned by claiming slightly less than the finding supports.'],
    ['Name the mechanism', BLUE,
      'Rates need their why: institutionalisation and prisonisation behind the reoffending figures, the consent arithmetic behind the legitimacy findings, the age curve behind the protection decay. A mechanism turns statistics into an argument.'],
    ['Apply for real', GREEN,
      'The named case, institution, policy or scenario: the Ely sentence, the guidelines, the section 60 power, the campaign bundle. Application shows the examiner the knowledge is a tool, not a recital, and every theory paragraph earns more with its worked example attached.'],
    ['Concede and land', PURPLE,
      'The rival at full strength, then the split verdict (the measures separated, one side taken, reasons visible) and the counter answered in the last paragraph. A claim that concedes nothing wins nothing: the examiner reads an undefended assertion, not a judgment.'],
    ['The paragraph rule', DARK,
      'Each paragraph stands alone: definition, priced evidence, a landing sentence, because examiners read in bursts and reward paragraphs that survive being read alone. The land paragraph is protected by the budget, never sacrificed to the clock.'],
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
  band(x, 866, 196, 'The same engine at every scale',
    'The sentence audit, the disposal audit and the campaign audit are the same technique at growing scale: define, evidence with caveats, apply, weigh both sides at full strength, land the split verdict with the counter answered. Train the engine on anything (a policy, a proverb, a campaign) and it runs on everything the paper contains.',
    { bodyY: 60 });
  return { file: 'crim-essay-anatomy.png' };
}

/* ---------- Page 12: the final fortnight and exam-day timing ---------- */
function examTiming() {
  const [c, x] = make(W, 1086);
  title2(x, 'The final fortnight and exam-day timing');
  sub2(x, 'Spacing and testing beat re-reading, and the land paragraph is protected');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Days one and two: diagnose', RED,
      'Reconstruct the unit map from memory and mark the thin regions; read the four-mock habit log and confirm the two recurring habits. The diagnostic aims the fortnight: thin regions get retrieval rebuilds, confirmed habits get targeted drills, and everything else gets spacing.'],
    ['Days three to ten: drill', AMBER,
      'The targeted drills: five corrected-form sentences per habit, daily; the retrieval rebuild of the thin regions (lesson recap questions answered before unfolding); the spaced return of all four regions on alternating days, never massed in one sitting.'],
    ['Alternate days: time it', BLUE,
      'One timed question per practice day: three minutes planning (five lines: definitions, evidence, application, both sides, verdict), the paragraph budget (six minutes a paragraph), and the land protected: the last paragraph is the one the clock steals first, and the budget exists to stop it.'],
    ['Exam day: the sequence', GREEN,
      'Read the whole paper first, choose your strongest territory where choice exists, plan before writing, watch the minutes per mark, keep every paragraph standalone, and never leave a question unattempted: a planned skeleton beats an abandoned page, every time and by a margin.'],
    ['The pre-paper checklist', PURPLE,
      'The portable last look: the eight items (definition, priced evidence, mechanism, application, rival at strength, split verdict, answered counter, synthesis), the two habits named, and the timing rules rehearsed. Nothing new is learned in the final days: consolidation only.'],
    ['The last two days: consolidate', DARK,
      'Light retrieval and the checklist only: no new material, no mocks, sleep protected. The final days exist to consolidate confidence, not to discover gaps, and the candidate who walks in rested with drilled habits outperforms the one who revised through the night.'],
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
  band(x, 866, 196, 'Test yourself, space the returns',
    'Two findings carry the fortnight: testing beats re-reading (every recap question answered before unfolding is worth three passive readings), and spacing beats massing (four regions across alternating days consolidate; one long session does not). Add the drills against your confirmed habits, protect the land paragraph, and the training does the rest.',
    { bodyY: 60 });
  return { file: 'crim-exam-timing.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([unit4Map, essayAnatomy, examTiming], only);
  console.log(JSON.stringify(done));
})();
module.exports = { unit4Map, essayAnatomy, examTiming };