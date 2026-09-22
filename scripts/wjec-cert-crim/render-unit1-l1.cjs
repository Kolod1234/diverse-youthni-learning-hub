/*
 * WJEC Level 3 Applied Certificate in Criminology — Unit 1 Changing Awareness
 * of Crime. Lesson 1: Crime, deviance and the map of crime.
 * Diagrams for pages 3, 11 and 12.
 * Run: node render-unit1-l1.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 3: the map of crime, eight panels ---------- */
function typeMap() {
  const [c, x] = make(W, 1086);
  title2(x, 'The map of crime: eight categories every criminologist must know');
  sub2(x, 'WJEC Unit 1, AC1.1: each category predicts whether a crime is seen, reported and recorded');

  const cols = [60, 400, 740, 1080], PW = 308, rows = [120, 520], PH = 372;
  const panels = [
    ['Visible crime', BLUE,
      'Crime that is witnessed or discovered and easily reported: burglary, vehicle crime, robbery, assault, criminal damage.',
      'It dominates police records because someone sees it, someone reports it and the police can record it.'],
    ['Hidden: no awareness', PURPLE,
      'Crimes whose victims may not even know a crime has happened: fraud, professional offending, unfair pricing.',
      'The victim discovers the harm late, or never, so no report is ever made.'],
    ['Hidden: fear', RED,
      'Crimes the victim knows about but dares not report: domestic abuse, coercive control, hate crime.',
      'Fear of retaliation, shame, dependence or distrust of the authorities keeps them off the books.'],
    ['Victimless crime', AMBER,
      'Offences where those taking part appear to consent, so nobody reports them: drug possession, some prostitution.',
      'Whether these offences are truly harmless is one of the arguments you must be able to make.'],
    ['White collar crime', GREEN,
      'Crime committed by individuals through their professional role, using position rather than force.',
      'Fraud, embezzlement, tax evasion, insider dealing. Named by Sutherland in 1939.'],
    ['Corporate crime', DARK,
      'Offences committed by organisations, or their agents, for the organisation benefit.',
      'Safety breaches, price fixing, pollution, false accounting: harm on a scale no burglar can match.'],
    ['State crime', RED,
      'Crimes committed by states or their agencies against people: torture, genocide, war crimes, political corruption.',
      'The state controls much of the machinery that defines and records crime, which is why these are hidden.'],
    ['Transnational crime', BLUE,
      'Crime that crosses borders and needs international cooperation to police.',
      'Human trafficking, drug trafficking, money laundering, cybercrime, counterfeiting, people smuggling.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 4], py = rows[Math.floor(i / 4)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 14, py + 40, i + 1, p[0], p[2], 21);
    wrap(x, p[1], px + 18, px + PW - 18, py + 84, { size: 16.5, lh: 23 });
    text(x, 'Why it is ' + (i === 0 || i === 3 ? 'seen' : 'hidden'), px + PW / 2, py + 232, { size: 16, bold: true, color: p[2] });
    wrap(x, p[3], px + 18, px + PW - 18, py + 262, { size: 16, lh: 22, color: SOFT });
  });
  band(x, 918, 150, 'Why the map matters',
    'These categories are not just labels. Each one predicts whether a crime reaches the official picture, which is why the recorded picture of crime is a picture of visible crime first. Your controlled assessment will ask you to use exactly this map: to explain what the public is aware of, and to plan a campaign that changes that awareness.',
    { bodyY: 54 });
  return { file: 'crim-types-map.png' };
}

/* ---------- Page 11: incidence and the dark figure ---------- */
function incidence() {
  const [c, x] = make(W, 1086);
  title2(x, 'Where the crimes actually are: three pictures of the same country');
  sub2(x, 'The recorded picture, the surveyed picture and the picture that stays hidden');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 620;
  const panels = [
    ['What the police record', BLUE,
      'Recorded crime is dominated by visible offences: theft, criminal damage, violence, vehicle offences, burglary.',
      'Why: a crime reaches the record only if someone notices it, someone reports it and the police record it. Every step is easiest for visible crime.',
      'So the official picture naturally over-represents street crime, because that is what the process of recording is built to catch.'],
    ['What surveys reveal', GREEN,
      'The Crime Survey for England and Wales asks people directly about their experiences, whether or not they reported them.',
      'It finds millions of offences a year beyond the police record, with fraud and computer misuse now among the largest categories, and domestic abuse far more common than the recorded figures suggest.',
      'Surveys are the criminologist tool for seeing the gap between experience and reporting.'],
    ['What stays hidden', RED,
      'White collar, corporate, state and transnational crime barely appear in either source.',
      'Why: the victim may not know, the harm may be spread across thousands of people, the offender may control the evidence, or the crime may need international cooperation even to define.',
      'The largest harms can be the least visible: a single safety fraud can cost more than a year of burglaries.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 20, PY + 44, i + 1, p[0], p[1], 22);
    let y = wrap(x, p[2], px + 26, px + PW - 26, PY + 92, { size: 17, lh: 24 });
    text(x, 'What it shows', px + PW / 2, y + 26, { size: 17, bold: true, color: p[1] });
    y = wrap(x, p[3], px + 26, px + PW - 26, y + 62, { size: 17, lh: 24, color: SOFT });
    text(x, 'The takeaway', px + PW / 2, y + 26, { size: 17, bold: true, color: DARK });
    wrap(x, p[4], px + 26, px + PW - 26, y + 62, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 786, 270, 'The dark figure of crime',
    'The gap between the crime that is committed and the crime that is recorded is called the dark figure of crime. It is dark for a reason: nobody can count what nobody reports. Unit 1 asks you to do two things with this idea. First, explain why the dark figure exists, category by category: crimes hidden by lack of awareness, by fear, by consent and by power. Second, use campaigns for change to shrink it, because a public that understands where harm actually lies is a public that reports fraud, takes domestic abuse seriously and questions what organisations do in its name. Notice that the three pictures never match, and that explaining the mismatch is the whole skill.',
    { bodyY: 54 });
  return { file: 'crim-types-incidence.png' };
}

/* ---------- Page 12: stereotyping versus the wider map ---------- */
function stereotype() {
  const [c, x] = make(W, 1086);
  title2(x, 'The picture in the head against the wider map of crime');
  sub2(x, 'How stereotyping and selective reporting distort what the public believes');

  const PW = 648, PY = 120, PH = 560;
  box(x, 60, PY, PW, PH);
  panelHeader(x, 80, PY + 44, 1, 'The picture in the head', RED, 25);
  let y1 = wrap(x, 'Ask people to imagine a crime and most describe the same scene: a violent stranger, a young man, a dark street, a dramatic victim.', 86, 60 + PW - 26, PY + 92, { size: 18, lh: 26 });
  y1 = wrap(x, 'News and drama lead with exactly this image, because rare, alarming events make stories. Murders, stranger attacks and shocking court cases are over-represented in the media in proportion to how often they happen.', 86, 60 + PW - 26, y1 + 34, { size: 18, lh: 26, color: SOFT });
  wrap(x, 'The result: a picture of crime in the public mind that is vivid, memorable and wrong in its proportions.', 86, 60 + PW - 26, y1 + 34, { size: 18, lh: 26, color: RED, bold: true });

  const px2 = 740;
  box(x, px2, PY, PW, PH);
  panelHeader(x, px2 + 20, PY + 44, 2, 'The wider map', GREEN, 25);
  let y2 = wrap(x, 'The evidence shows a different country: most recorded crime is property crime, not violence, and serious violence is a minority of offences.', px2 + 26, px2 + PW - 26, PY + 92, { size: 18, lh: 26 });
  y2 = wrap(x, 'Beyond the record sit the hidden categories: fraud that never reaches the police, domestic abuse behind front doors, workplace deaths from safety breaches, trafficking across borders and corporate harm spread across thousands of small victims.', px2 + 26, px2 + PW - 26, y2 + 34, { size: 18, lh: 26, color: SOFT });
  wrap(x, 'The result: the harms that touch the most lives are often the ones the public least associates with the word crime.', px2 + 26, px2 + PW - 26, y2 + 34, { size: 18, lh: 26, color: GREEN, bold: true });

  band(x, 726, 330, 'Stereotyping and selective reporting',
    'Treating the memorable as the typical is stereotyping. When media outlets emphasise some crimes and pass over others, reporting is selective. Neither requires a conspiracy: dramatic stories simply travel further than quiet harm. But the consequences matter. Fear of crime rises even when crime falls. Policies chase the stereotype while the larger harms go unpoliced. And whole categories of victim, from defrauded pensioners to abused partners, are left waiting for the awareness that never comes. This is exactly the gap a campaign for change can address, and it is why WJEC places stereotyping at the heart of Unit 1: your first analytical move in the controlled assessment is to show that public awareness of crime is shaped, not simply given.',
    { bodyY: 54 });
  return { file: 'crim-types-stereotype.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([typeMap, incidence, stereotype], only);
  console.log(JSON.stringify(done));
})();
module.exports = { typeMap, incidence, stereotype };