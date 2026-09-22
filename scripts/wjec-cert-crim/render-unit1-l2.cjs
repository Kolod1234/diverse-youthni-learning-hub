/*
 * WJEC Level 3 Applied Certificate in Criminology — Unit 1 Changing Awareness
 * of Crime. Lesson 2: Measuring crime.
 * Diagrams for pages 8, 9 and 10.
 * Run: node render-unit1-l2.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 8: the three measurement methods ---------- */
function methods() {
  const [c, x] = make(W, 1086);
  title2(x, 'Three ways of counting crime: the state, the victim and the offender');
  sub2(x, 'Each instrument answers a different question, so each sees a different slice of the map of crime');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 660;
  const panels = [
    ['Official statistics', BLUE, 'What the state records.',
      'Every offence reported to the police and recorded under the National Crime Recording Standard is submitted to the Office for National Statistics and published each quarter.',
      'Reliable for visible crime: witnessed, discovered, reported, recorded. A long consistent series, force by force, neighbourhood by neighbourhood, with outcome data showing the state response.',
      'It cannot count crime that is never reported or never recorded, and the regulator-detected offending of companies and professionals sits outside it entirely.'],
    ['Victim surveys', GREEN, 'What people say happened to them.',
      'The Crime Survey for England and Wales interviews a large random sample of adults about their experiences over the last year, whether or not they reported them. Sensitive topics are answered privately on a laptop.',
      'The only routine instrument that sees unreported crime, which is why it finds fraud, computer misuse and domestic abuse at a scale the record never shows, and it measures fear of crime too.',
      'It cannot see homicide, crimes against businesses, victimless offences or the crimes of the powerful, and it depends on memory, honesty and a household sample.'],
    ['Self-report studies', PURPLE, 'What offenders admit, anonymously.',
      'Questionnaires, usually of young people, students or prisoners, ask respondents to list the offences they have committed, with no names attached.',
      'The only routine instrument that sees victimless and minor offending, and the gap between who actually offends and who appears in the official statistics.',
      'Admissions skew towards trivial offences, serious offenders are rarely in the samples, and bravado and denial cannot be ruled out.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 20, PY + 44, i + 1, p[0], p[1], 22);
    let y = PY + 92;
    text(x, p[2], px + PW / 2, y, { size: 17, bold: true, color: DARK });
    y = wrap(x, p[3], px + 26, px + PW - 26, y + 36, { size: 16, lh: 22 }) + 8;
    text(x, 'What it captures', px + PW / 2, y + 26, { size: 17, bold: true, color: p[1] });
    y = wrap(x, p[4], px + 26, px + PW - 26, y + 60, { size: 16, lh: 22 }) + 8;
    text(x, 'What it misses', px + PW / 2, y + 26, { size: 17, bold: true, color: RED });
    wrap(x, p[5], px + 26, px + PW - 26, y + 60, { size: 16, lh: 22, color: SOFT });
  });
  band(x, 812, 230, 'Triangulation: no single true count',
    'Use several instruments on the same question and see where they agree. Where all three point the same way, as they do for visible street crime, confidence rises. Where they diverge, the divergence is itself the finding: recorded crime rose after the mid-2010s while survey-measured crime fell, and the explanation, better recording and more willingness to report alongside falling experience, is a two-instrument story. For your campaign, name the instrument that measures your harm and justify why it is the right one for the claim you are making.',
    { bodyY: 54 });
  return { file: 'crim-measure-methods.png' };
}

/* ---------- Page 9: the funnel of visibility and the dark figure ---------- */
function funnel() {
  const [c, x] = make(W, 1086);
  title2(x, 'The dark figure: how a committed crime falls out of the record');
  sub2(x, 'Every narrowing has a cause, and every cause names a category from the map of crime');

  const CX = 760;
  const stages = [
    ['All the crime that is committed', 820, '#dbeafe', BLUE],
    ['Crime that is noticed by someone', 660, '#ede9fe', PURPLE],
    ['Crime that is reported to the police', 520, '#fef3c7', AMBER],
    ['Crime that is recorded in the statistics', 400, '#dcfce7', GREEN],
  ];
  const y0 = 150, BH = 86, GAP = 150;
  stages.forEach((s, i) => {
    const py = y0 + i * GAP;
    box(x, CX - s[1] / 2, py, s[1], BH, { fill: s[2], stroke: s[3], lw: 2 });
    wrap(x, s[0], CX - s[1] / 2 + 24, CX + s[1] / 2 - 24, py + BH / 2 - 9, { size: 17, bold: true, color: s[3] });
  });

  // Right-hand annotations: what each narrowing removes
  const RX = 1190, RW = 232;
  const notes = [
    ['Hidden by lack of awareness', 'Fraud, overcharging, mis-selling: the victim does not even know a crime has occurred, so nobody can notice it. This slice never reaches any list.', y0 + BH + 8],
    ['Hidden by fear and by consent', 'Domestic abuse, coercive control, hate crime: the victim knows but dares not speak. Victimless offending: nobody involved wants the police called at all.', y0 + BH + 8 + GAP],
    ['Recording itself', 'Counting rules, discretion and honest error. The 2014 inspectorate report found roughly one in five offences reported to the police had not been recorded.', y0 + BH + 8 + GAP * 2],
  ];
  notes.forEach((n) => {
    box(x, RX, n[2], RW, 138, { fill: '#fff', stroke: LIGHT });
    panelHeader(x, RX + 16, n[2] + 40, '-', n[0], RED, 16.5);
    wrap(x, n[1], RX + 16, RX + RW - 16, n[2] + 72, { size: 14, lh: 20 });
  });

  // Left-hand annotation: the survey torch
  box(x, 60, 388, 250, 214, { fill: '#f0fdf4', stroke: '#bbf7d0' });
  panelHeader(x, 76, 428, '-', 'The survey torch', GREEN, 17);
  wrap(x, 'The Crime Survey for England and Wales asks a large sample of people directly, so it captures offences that were noticed but never reported: the whole second narrowing, and part of the first. No instrument can reach crime that nobody noticed.',
    76, 294, 456, { size: 14, lh: 20 });

  band(x, 800, 260, 'The dark figure of crime',
    'The distance between the top of the funnel and the bottom is the dark figure: crime that is committed but never appears in the record. It cannot be counted exactly, because every instrument depends on someone noticing, reporting or admitting, and the crimes inside the dark figure are exactly those with nobody able or willing to do any of the three. The survey narrows it; nothing closes it. Every crime statistic you will ever read is therefore a floor, not a ceiling.',
    { bodyY: 54 });
  return { file: 'crim-measure-funnel.png' };
}

/* ---------- Page 10: coverage matrix ---------- */
function matrix() {
  const [c, x] = make(W, 1086);
  title2(x, 'Which instrument sees which crime?');
  sub2(x, 'The eight categories of the crime map against the three measurement instruments');

  const LX = 60, LW = 280, mcols = [360, 716, 1072], CW = 340, CH = 70;
  const status = {
    seen:   { fill: '#dcfce7', stroke: '#86efac', word: 'Seen well',          col: '#166534' },
    part:   { fill: '#fef3c7', stroke: '#fde68a', word: 'Partly seen',        col: '#92400e' },
    poor:   { fill: '#fee2e2', stroke: '#fecaca', word: 'Almost invisible',   col: '#991b1b' },
  };

  // header
  const heads = ['Police recorded', 'Victim survey (CSEW)', 'Self-report studies'];
  box(x, LX, 150, LW, 56, { fill: '#f8fafc' });
  text(x, 'Category of crime', LX + LW / 2, 180, { size: 17, bold: true });
  heads.forEach((h, i) => {
    box(x, mcols[i], 150, CW, 56, { fill: '#f8fafc' });
    text(x, h, mcols[i] + CW / 2, 180, { size: 17, bold: true });
  });

  const rows = [
    ['Visible crime',            ['seen', 'witnessed and reported'],  ['seen', 'reported and unreported'],  ['part', 'admitted, mostly minor']],
    ['Hidden: no awareness',     ['poor', 'rarely reaches the record'], ['part', 'once victims realise'],  ['poor', 'offenders rarely sampled']],
    ['Hidden: fear',             ['poor', 'the victim dares not report'], ['part', 'private module helps'], ['part', 'still understated']],
    ['Victimless crime',         ['part', 'only where actively policed'], ['poor', 'no victim to ask'],      ['seen', 'the classic finding']],
    ['White collar crime',       ['poor', 'handled by regulators'],   ['poor', 'harm is diffuse'],        ['poor', 'rarely admitted']],
    ['Corporate crime',          ['poor', 'regulator territory'],     ['poor', 'victims scattered'],      ['poor', 'not in the samples']],
    ['State crime',              ['poor', 'the state defines'],       ['poor', 'no questions asked'],      ['poor', 'not in the samples']],
    ['Transnational crime',      ['part', 'fragments only'],          ['poor', 'outside the sample'],     ['poor', 'not in the samples']],
  ];
  rows.forEach((r, i) => {
    const ry = 216 + i * 84;
    box(x, LX, ry, LW, CH, { fill: '#f8fafc' });
    text(x, r[0], LX + LW / 2, ry + CH / 2, { size: 16.5, bold: true, color: DARK });
    r.slice(1).forEach((cellData, j) => {
      const st = status[cellData[0]];
      const cx = mcols[j];
      box(x, cx, ry, CW, CH, { fill: st.fill, stroke: st.stroke });
      text(x, st.word, cx + CW / 2, ry + 27, { size: 15.5, bold: true, color: st.col });
      text(x, cellData[1], cx + CW / 2, ry + 50, { size: 13.5, color: SOFT });
    });
  });

  // legend
  const ly = 216 + 8 * 84 + 14;
  const items = [['seen', 'Seen well'], ['part', 'Partly seen'], ['poor', 'Almost invisible']];
  let lx = LX + 120;
  items.forEach((it) => {
    const st = status[it[0]];
    box(x, lx, ly, 20, 20, { fill: st.fill, stroke: st.stroke });
    text(x, it[1], lx + 34, ly + 10, { size: 15, color: SOFT, align: 'left' });
    lx += 250;
  });

  band(x, ly + 40, 1086 - (ly + 40) - 30, 'The measurement hierarchy',
    'Read the bottom four rows together: for white collar, corporate, state and transnational crime, every column is red. The routine instruments barely see the crimes of the powerful at all; they are measured, if at all, by regulators, inquiries, investigative journalism and NGOs. So the harms that touch the most lives are the least visible to the statistics the public consults, and a campaign on a hidden harm must build its own evidence base because the standard thermometers cannot serve it.',
    { bodyY: 54 });
  return { file: 'crim-measure-matrix.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([methods, funnel, matrix], only);
  console.log(JSON.stringify(done));
})();
module.exports = { methods, funnel, matrix };