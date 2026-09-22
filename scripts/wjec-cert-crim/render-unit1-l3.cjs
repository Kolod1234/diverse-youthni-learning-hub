/*
 * WJEC Level 3 Applied Certificate in Criminology — Unit 1 Changing Awareness
 * of Crime. Lesson 3: The media and crime.
 * Diagrams for pages 3, 8 and 11.
 * Run: node render-unit1-l3.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, text, circle, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 3: news values applied to crime ---------- */
function newsValues() {
  const [c, x] = make(W, 1086);
  title2(x, 'What makes a crime newsworthy?');
  sub2(x, 'News values select for properties of a story, never for the amount of harm');

  const cols = [60, 400, 740, 1080], PW = 308, rows = [120, 520], PH = 372;
  const panels = [
    ['Rarity and drama', RED,
      'The unusual, the violent and the shocking. Homicide is newsworthy because it is rare; the rarest crime becomes the most visible.',
      'Common harms never look like events, so they never look like news.'],
    ['Identifiable victim', BLUE,
      'A named, sympathetic victim the audience can picture: a child, a pensioner, an ordinary person attacked without cause.',
      'Victims who are complicated, unsympathetic or invisible, such as most fraud and abuse victims, go uncovered.'],
    ['Visual evidence', PURPLE,
      'CCTV of a robbery, footage from a scene, a photograph. If it can be shown, it can be sold as a story.',
      'Harms that live in spreadsheets and contracts, like mis-selling and price fixing, are unfilmable and unreported.'],
    ['Elite persons', GREEN,
      'The famous, the powerful and the official. Offences involving celebrities, politicians or institutions headline immediately.',
      'The identical offences of ordinary people stay local and brief, or unreported altogether.'],
    ['Proximity', AMBER,
      'Events close to home or culturally familiar feel relevant, so local versions of national stories run big.',
      'Foreign victims and unfamiliar harms feel distant, so global patterns, like trafficking, stay abstract.'],
    ['Simple moral narrative', DARK,
      'A clear villain, a clear victim and a clear lesson. Stories that can be told in one line lead bulletins.',
      'Structural harms with no single villain, such as corporate negligence, cannot be told in one line, so they are not told.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 4], py = rows[Math.floor(i / 4)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 14, py + 40, i + 1, p[0], p[1], 20.5);
    wrap(x, p[2], px + 18, px + PW - 18, py + 78, { size: 15.5, lh: 21.5 });
    text(x, 'What it leaves out', px + PW / 2, py + 238, { size: 15.5, bold: true, color: RED });
    wrap(x, p[3], px + 18, px + PW - 18, py + 262, { size: 15, lh: 20.5, color: SOFT });
  });
  band(x, 918, 150, 'Selective reporting',
    'No editor needs to intend a distortion for the distortion to happen: a system that selects stories by drama will systematically over-report the rare and filmable, and pass over the common, quiet and structural. That is selective reporting, and it is the mechanism behind the stereotype of crime the public carries.',
    { bodyY: 54 });
  return { file: 'crim-media-newsvalues.png' };
}

/* ---------- Page 8: the deviancy amplification spiral ---------- */
function panic() {
  const [c, x] = make(W, 1086);
  title2(x, 'The deviancy amplification spiral (Cohen, 1972)');
  sub2(x, 'How an ordinary incident is manufactured into a moral panic');

  // centre label
  circle(x, W / 2, 545, 160, { fill: '#fef2f2', stroke: '#fecaca' });
  text(x, 'The spiral', W / 2, 520, { size: 26, bold: true, color: RED });
  wrap(x, 'Each stage manufactures the evidence for the next, and the output returns to the start, stronger.', W / 2 - 230, W / 2 + 230, 550, { size: 16, lh: 22, color: SOFT });

  const stages = [
    ['1. Incident occurs', 'A modest, real event: Clacton 1964, minor seafront scuffles and vandalism.', 260, 120, BLUE],
    ['2. Media dramatise', 'Coverage selects by news values: exaggeration, symbolisation, prediction of worse to come.', 1188, 120, PURPLE],
    ['3. Public alarm', 'The audience takes the image as information; concern, hostility and consensus grow.', 1278, 470, RED],
    ['4. Authorities respond', 'Police and politicians, under public pressure, denounce and act against the branded group.', 1188, 820, AMBER],
    ['5. Further incidents', 'The response breeds resentment and copycats, creating new, visible events.', 260, 820, DARK],
    ['6. Coverage as confirmation', 'The new incidents are reported as proof of the original threat. The spiral returns to stage 1, stronger.', 170, 470, GREEN],
  ];
  stages.forEach((s) => {
    box(x, s[2] - 150, s[3], 300, 130, { fill: '#f8fafc', stroke: s[4] });
    text(x, s[0], s[2], s[3] + 26, { size: 17, bold: true, color: s[4] });
    wrap(x, s[1], s[2] - 130, s[2] + 130, s[3] + 44, { size: 14, lh: 19 });
  });

  band(x, 970, 106, 'The five criteria of a moral panic',
    'Concern, hostility, consensus, disproportionality and volatility. Disproportionality is the decisive test: a reaction wildly exceeding the measured harm marks a panic, while a reaction matching the evidence is a proportionate response, however loud.',
    { bodyY: 50, size: 15.5, lh: 21 });
  return { file: 'crim-media-panic.png' };
}

/* ---------- Page 11: the representation loop ---------- */
function loop() {
  const [c, x] = make(W, 1086);
  title2(x, 'The representation loop: why public awareness is shaped, not given');
  sub2(x, 'Four ordinary processes that together manufacture a stable, false picture of crime');

  const stages = [
    ['1. Recorded statistics', 'The chain of visibility filters crime, so the official record over-represents visible street crime and under-represents hidden harm.', 96, 210, BLUE],
    ['2. Media selection', 'Working by news values, the media over-report the same dramatic minority and pass over the quiet majority, agreeing with the record and diverging from the evidence.', 1052, 210, PURPLE],
    ['3. The public stereotype', 'Taught by repetition, the audience forms the stereotype and the fear: violence typical, strangers dangerous, fraud rare.', 1052, 770, RED],
    ['4. Attention returns', 'Fear drives reporting, policing and politics: more visible crime is recorded, attention flows away from unknown harms, and stage 1 rebuilds.', 96, 770, GREEN],
  ];
  stages.forEach((s) => {
    const bw = 300, bh = 210;
    box(x, s[2] - 40, s[3], bw, bh, { fill: '#f8fafc', stroke: s[4], lw: 2 });
    panelHeader(x, s[2] - 24, s[3] + 40, s[0].split('.')[0], s[0].split('. ')[1], s[4], 18);
    wrap(x, s[1], s[2] - 24, s[2] - 40 + bw - 20, s[3] + 78, { size: 14.5, lh: 20 });
  });

  // centre label
  circle(x, W / 2, 595, 148, { fill: '#fffbeb', stroke: '#fde68a' });
  text(x, 'The loop', W / 2, 572, { size: 25, bold: true, color: AMBER });
  wrap(x, 'No stage intends the outcome. Each acts rationally on the stage before, and the distorted picture rebuilds itself.', W / 2 - 210, W / 2 + 210, 600, { size: 15.5, lh: 21, color: SOFT });

  band(x, 990, 90, 'Where a campaign breaks the loop',
    'A campaign is a chosen break point: changing what the public knows (stage 3), changing what media cover (stage 2), making reporting safer (stage 1) or changing what authorities attend to (stage 4). Naming the break point is the structure of a top-band campaign justification.',
    { bodyY: 46, size: 15.5, lh: 20.5 });
  return { file: 'crim-media-loop.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([newsValues, panic, loop], only);
  console.log(JSON.stringify(done));
})();
module.exports = { newsValues, panic, loop };