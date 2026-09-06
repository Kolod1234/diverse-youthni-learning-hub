/* A2 Biology, Lesson 20 — Phytochromes and the Control of Flowering. */

function sheet(K, title) {
  const d = new K.Diagram();
  d.fitlabel(380, 425, 700, title, K.TEAL, 14.5, true);
  return d;
}

function concept(K, title, key, chain, caption, colours) {
  const d = sheet(K, title);
  d.box(50, 320, 660, 58, key, K.TEAL, 10.5);
  d.chain(chain, { y: 190, x0: 42, x1: 718, h: 82, colour: colours || [K.BLUE, K.INDIGO, K.AMBER], size: 9.5 });
  d.caption(caption, { y: 47, size: 9.5, wrap: 106 });
  return d;
}

const pages = [
  (K) => concept(K, 'Phytochromes and the Control of Flowering', 'Phytochrome interconversion lets leaves measure uninterrupted night length and control flowering in long-day and short-day plants.', ['red light raises P730', 'darkness slowly removes P730', 'dawn level records night length', 'flowering response follows'], 'The mechanism is a reversible pigment switch plus a slow dark reaction.'),
  (K) => { const d = sheet(K, 'Learning route and objectives'); d.steps(['Locate phytochrome in leaves', 'Describe P660 and P730 conversions', 'Explain critical night length', 'Predict night-break effects', 'Apply photoperiod manipulation'], { x: 56, y0: 330, w: 648, rowh: 43, gap: 9, colour: K.TEAL, size: 10.2 }); d.caption('Start with the conversion chemistry, then use it to explain flowering evidence.', { y: 37, size: 9.3 }); return d; },
  { path: 'a2-biology/a2-020-p03.png', copyFrom: 'lesson-assets/a2-biology/openstax-30-38-phytochrome.png' },
  { path: 'a2-biology/a2-020-p04.png', copyFrom: 'lesson-assets/a2-biology/openstax-30-38-phytochrome.png' },
  { path: 'a2-biology/a2-020-p05.png', copyFrom: 'lesson-assets/a2-biology/openstax-30-38-phytochrome.png' },
  (K) => concept(K, 'The critical night length', 'The critical night length is the threshold duration of darkness needed to lower P730 to the flowering-decision level.', ['sunset begins dark period', 'P730 converts slowly to P660', 'threshold is crossed or not', 'plant type responds'], 'Because conversion is slow, the amount remaining at dawn encodes night duration.'),
  (K) => concept(K, 'Short-day plants', 'A short-day plant flowers only when an uninterrupted night is long enough for P730 to be removed.', ['long night', 'P730 falls below threshold', 'inhibitory effect removed', 'flowering begins'], 'Call these long-night plants when explaining the mechanism; day length is only the inverse cue.'),
  (K) => concept(K, 'Long-day plants', 'A long-day plant flowers when the night is too short to remove P730 completely.', ['short night', 'P730 remains at dawn', 'active signal persists', 'flowering begins'], 'The same pigment change produces the opposite flowering outcome in the two plant types.'),
  (K) => { const d = sheet(K, 'The two plant types compared'); d.twocol(['LONG uninterrupted night', 'P730 removed', 'short-day plant flowers', 'long-day plant does not'], ['SHORT uninterrupted night', 'P730 remains', 'long-day plant flowers', 'short-day plant does not'], { y0: 274, rowh: 45, gap: 10, lc: K.BLUE, rc: K.TEAL, heads: ['SHORT-DAY PLANT', 'LONG-DAY PLANT'], size: 9.4 }); d.caption('Both responses depend on P730 at dawn; the interpretation of that signal differs.', { y: 39, size: 9.4 }); return d; },
  { path: 'a2-biology/a2-020-p10.png', copyFrom: 'lesson-assets/a2-biology/openstax-30-38-phytochrome.png' },
  (K) => concept(K, 'Following P730 through the seasons', 'Long summer days create P730 for longer and short nights remove less; autumn reverses both effects.', ['spring day length rises', 'P730 accumulates', 'summer dawn level high', 'autumn nights remove more'], 'Day length is predictable at a latitude, making it a reliable seasonal cue.'),
  (K) => concept(K, 'Manipulating the photoperiod commercially', 'Growers use lamps or blackout screens to change P730 at dawn and make crops flower out of season.', ['lamp extends day or breaks night', 'blackout extends darkness', 'P730 level altered', 'flowering time shifted'], 'The treatment must be explained through pigment conversion, not merely “more light” or “less light”.'),
  (K) => { const d = sheet(K, 'Worked example — predicting flowering'); d.box(46, 306, 668, 78, 'A short-day plant needs at least 12 h of uninterrupted darkness. Will it flower after 10 h light and 14 h dark?', K.BLUE, 10.7); d.steps(['Dark period = 14 h', '14 h is longer than the 12 h critical night', 'P730 has enough time to convert slowly to P660', 'P730 is removed below the threshold', 'The short-day plant flowers'], { x: 58, y0: 218, w: 644, rowh: 37, gap: 7, colour: K.TEAL, size: 9.8 }); d.caption('Answer: yes—because the uninterrupted night exceeds the critical length.', { y: 26, size: 9.2 }); return d; },
  (K) => concept(K, 'Data task — interpreting a night-break experiment', 'A red flash during a long night restores P730 and can reverse the normal short-day flowering response.', ['long night lowers P730', 'red flash converts P660 to P730', 'dark period is reset', 'flowering is prevented'], 'An immediate far-red flash reverses the red flash by converting P730 back to P660.'),
  (K) => { const d = sheet(K, 'Common mistakes and their corrections'); d.cards([['LOCATION', 'phytochrome is detected in leaves, which signal the buds'], ['DARK REACTION', 'P730 to P660 is slow in darkness'], ['SHORT-DAY', 'requires a sufficiently long uninterrupted night'], ['RED LIGHT', 'P660 absorbs red and becomes P730'], ['MOLECULE TYPE', 'phytochrome is a pigment, not a hormone']], { y0: 350, x: 44, w: 672, rowh: 48, gap: 8, colour: K.INDIGO, size: 9.2 }); d.caption('Use P660/P730 labels consistently from stimulus to flowering consequence.', { y: 27, size: 9 }); return d; },
  (K) => { const d = sheet(K, 'Worked examination question'); d.box(44, 304, 672, 80, 'Explain how phytochrome controls flowering and predict how a red night break affects a short-day plant.', K.BLUE, 10.5); d.steps(['P660 absorbs red light and rapidly becomes P730', 'P730 slowly becomes P660 in darkness', 'Long uninterrupted night removes P730', 'Removal permits short-day flowering', 'Red night break reforms P730', 'Flowering is therefore prevented'], { x: 54, y0: 216, w: 652, rowh: 35, gap: 6, colour: K.TEAL, size: 9.5 }); return d; },
  (K) => { const d = sheet(K, 'Check your understanding'); d.steps(['Where is phytochrome found?', 'Which form absorbs red light?', 'Why must dark conversion be slow?', 'What does critical night length mean?', 'What does a red night break do?', 'How can far-red reverse it?'], { x: 56, y0: 340, w: 648, rowh: 38, gap: 7, colour: K.BLUE, size: 9.8 }); d.caption('Answer every question with the pigment conversion and its consequence.', { y: 29, size: 9.2 }); return d; },
  (K) => { const d = sheet(K, 'Answers and self-correction'); d.cards([['1–2', 'in leaves; P660 absorbs red and becomes P730'], ['3–4', 'slow conversion makes a timer; the threshold night removes P730'], ['5–6', 'red reforms P730; far-red converts P730 back to P660']], { y0: 318, x: 50, w: 660, rowh: 67, gap: 13, colour: K.TEAL, size: 9.5 }); d.caption('Correct the named molecule as well as the final flowering prediction.', { y: 42, size: 9.3 }); return d; },
  { path: 'a2-biology/a2-020-p19.png', copyFrom: 'lesson-assets/a2-biology/openstax-30-38-phytochrome.png' },
  (K) => { const d = sheet(K, 'CCEA specification checkpoint'); d.steps(['phytochrome pigments occur in leaves', 'P660 and P730 are interconvertible', 'red and far-red conversions are rapid', 'dark P730 to P660 conversion is slow', 'critical night determines plant-type response', 'photoperiod can be manipulated commercially'], { x: 48, y0: 345, w: 664, rowh: 38, gap: 6, colour: K.TEAL, size: 9.4 }); d.caption('Depth target: mechanism, evidence and application through the two pigment forms.', { y: 27, size: 9.1 }); return d; },
  (K) => concept(K, 'Why this matters beyond the examination', 'A slow reversible molecular reaction acts as a seasonal clock, letting a plant use dependable night length rather than variable weather.', ['latitude fixes photoperiod pattern', 'phytochrome records darkness', 'flowering synchronises', 'pollination and seed set improve'], 'The same system can be unintentionally disturbed by night-time light pollution.'),
  (K) => { const d = sheet(K, 'Lesson recap and what comes next'); d.steps(['P660 absorbs red and becomes P730 rapidly', 'P730 absorbs far-red and becomes P660 rapidly', 'P730 also becomes P660 slowly in darkness', 'Short-day plants flower when P730 is removed', 'Long-day plants flower when P730 remains'], { x: 50, y0: 320, w: 660, rowh: 42, gap: 8, colour: K.TEAL, size: 9.7 }); d.box(50, 37, 660, 52, 'NEXT: plant growth substances coordinate growth responses through chemical signals.', K.INDIGO, 10); return d; },
];

if (pages.length !== 22) throw new Error(`Phytochrome lesson: expected 22 pages, got ${pages.length}`);
module.exports = { dir: 'a2-biology', prefix: 'a2-020-p', pages };


