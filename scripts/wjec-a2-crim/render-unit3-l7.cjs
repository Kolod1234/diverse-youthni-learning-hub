/*
 * WJEC A2 Criminology, Lesson 7: Reviewing verdicts: the case-review skill.
 * Diagrams for pages 3, 8 and 11.
 * Run: node render-unit3-l7.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 3: the review framework ---------- */
function reviewFramework() {
  const [c, x] = make(W, 1086);
  title2(x, 'The case-review framework: four questions, one judgment');
  sub2(x, 'The permanent checklist that turns a folder of documents into a reasoned review');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Was the investigation complete?', BLUE,
      'Were all reasonable lines of enquiry pursued, including those pointing away from the suspect: elimination of others named, alternative explanations tested, or was the inquiry closed early around the first person who looked likely?'],
    ['Was the evidence reliable?', RED,
      'How much can each item really bear: identification viewing conditions, forensic handling and technique limits, witness interests, digital provenance, and whether the strong items corroborate one another or all descend from one fragile moment.'],
    ['Was everything lawful?', AMBER,
      'Were PACE and its codes obeyed in detention, interview, search and identification procedure, was disclosure performed in substance rather than form, and did every later stage keep within its legal powers?'],
    ['Was the process balanced?', GREEN,
      'Did the police and prosecution act with an open mind, did the defence receive the material and time to respond, and was the trial fought between genuinely equal sides under an impartial decision maker?'],
    ['Where the gates bite', PURPLE,
      'Completeness dominates investigation, reliability lives in the evidence, lawfulness governs procedure and disclosure, balance governs prosecution and trial; the questions travel the whole route from scene to verdict.'],
    ['The reviewer judgment', DARK,
      'A verdict built from complete, reliable, lawful and balanced work is safe; each gate the case fails is a crack the reviewer can name, quote and weigh, and the judgment grows out of what the gates found.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 20, py + 44, i + 1, p[0], p[1], 19);
    wrap(x, p[2], px + 26, px + PW - 26, py + 92, { size: 17, lh: 24 });
  });
  arrow(x, cols[0] + PW + 4, 285, cols[1] - 4, 285, { color: GREY, lw: 4 });
  arrow(x, cols[1] + PW + 4, 285, cols[2] - 4, 285, { color: GREY, lw: 4 });
  arrow(x, cols[2] + PW / 2, rows[0] + PH + 4, cols[0] + PW - 90, rows[1] - 6, { color: GREY, lw: 4 });
  band(x, 866, 196, 'Why a fixed checklist beats a blank page',
    'The four questions work because they are the same every time: whatever the pack contains, the reviewer asks what was pursued, how much the evidence can bear, whether the rules were kept and whether the fight was fair. A case can fail any one gate alone, and mislabelling the failure suggests the words are known without the concepts, so rehearse the definitions until each question carries its own paragraph automatically.',
    { bodyY: 60 });
  return { file: 'crim-review-framework.png' };
}

/* ---------- Page 8: the review method pipeline ---------- */
function reviewMethod() {
  const [c, x] = make(W, 1086);
  title2(x, 'From pack to verdict: the review method in six movements');
  sub2(x, 'How a reviewer works an information pack under assessment conditions');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Read with a purpose', BLUE,
      'Read the pack once, actively, asking the four questions from the first page rather than absorbing documents neutrally: a pack read with the gates in mind is already half-reviewed before any note is written.'],
    ['Annotate by gate', PURPLE,
      'One word per document: unreliable, breach, complete, linchpin. The annotation layer turns a folder into an argument map, and the writing later assembles the map rather than rebuilding the pack from memory.'],
    ['Interrogate the items', RED,
      'Run the standard interrogations: viewing conditions for identification, chain and technique for forensics, interests for testimony, PACE compliance for interviews, provenance for digital material.'],
    ['Test the process', AMBER,
      'Check custody records, authorisations, disclosure schedules and the trial warnings: lawfulness and balance are decided on the procedural documents, which is where the classic failures hide.'],
    ['Weigh the interactions', GREEN,
      'Ask whether the strong items corroborate one another or share one root, what would disprove the case, and where weaknesses stack: the linchpin analysis that separates top band reviews from flat ones.'],
    ['Deliver the judgment', DARK,
      'Safe, unsafe or arguable, derived visibly from the gates, with the strongest counter argument stated and answered, and a recommendation where the task invites one: the movement everything above feeds.'],
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
  band(x, 866, 196, 'The notes are the work',
    'Candidates who annotate the pack directly walk into the writing with the argument already half-built; candidates who read cleanly and start writing from memory rebuild the pack badly inside the answer. The framework scales to whatever minutes you have, because each gate can be one paragraph or one page: the structure never changes, only the depth.',
    { bodyY: 60 });
  return { file: 'crim-review-method.png' };
}

/* ---------- Page 11: the bands in practice ---------- */
function reviewBands() {
  const [c, x] = make(W, 1086);
  title2(x, 'What the bands reward: weak, competent and top-band reviews');
  sub2(x, 'The band gap is a checklist of habits, every one of them trainable');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['The weaker answer', RED,
      'Retells the pack in the order the documents came, sprinkles opinions without engines (the identification was unreliable, the police were unfair), cites no standards, ranks nothing, and ends with a hedge instead of a judgment.'],
    ['The competent answer', AMBER,
      'Applies some criteria with some evidence, half-names a standard or two, treats every observation as equal weight, and reaches a judgment that would satisfy a marker looking for safe competence, but not one looking for analysis.'],
    ['The top band answer', GREEN,
      'Frames the method, quotes the pack exactly, names the standards precisely, ranks the weaknesses so the linchpin is identified, and delivers a judgment that states and answers the best counter argument: method made visible on the page.'],
    ['The ranking habit', BLUE,
      'The top band reviewer says which weakness is the linchpin (the undisclosed memo) and which is minor (a late listing), because weighing is what the assessment means by review: a list is reading, a ranking is thinking.'],
    ['The quoting habit', PURPLE,
      'Exact details persuade where adjectives cannot: forty metres, four seconds, ten weeks, eleven to one, the nine hour delay. Quotation proves you read the pack; precision proves you understood it.'],
    ['The argued judgment', DARK,
      'Safe, unsafe or arguable, each with its discipline: safe answers name and answer the residual doubt, unsafe answers quote the gate failure the outcome depended on, arguable answers name the tipping point and argue which way they lean.'],
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
  band(x, 866, 196, 'The method is the difference',
    'No habit in the top band column requires talent: framing, quoting, naming standards, ranking and arguing are all procedures, rehearsed the way any procedure is rehearsed, by doing them on packs until they run themselves. The bands are not a mystery; they are a method, practiced twice in this lesson and ready for the assessment in the next.',
    { bodyY: 60 });
  return { file: 'crim-review-bands.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([reviewFramework, reviewMethod, reviewBands], only);
  console.log(JSON.stringify(done));
})();
module.exports = { reviewFramework, reviewMethod, reviewBands };