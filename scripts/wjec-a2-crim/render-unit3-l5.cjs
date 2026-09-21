/*
 * WJEC A2 Criminology, Lesson 5: Key influences on case outcomes: media,
 * politics and the judiciary. Diagrams for pages 3, 10 and 11.
 * Run: node render-unit3-l5.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 3: media influence map ---------- */
function mediaInfluence() {
  const [c, x] = make(W, 1086);
  title2(x, 'How the media reach the courtroom: the influence map');
  sub2(x, 'Six channels from the front page into case outcomes: some by design, some to be dammed');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Selection and news values', BLUE,
      'Editors select rare, dramatic, visual and personal crime stories, so coverage bears little proportion to actual crime: the stranger danger story dwarfs the familiar harm, and the chosen crimes begin to feel like the problem of the age.'],
    ['Fear and public pressure', RED,
      'Heavy coverage of rare offences inflates the perceived risk of victimisation. Readers who feel unsafe demand action, and the demand reaches every part of the system: policing, prosecution and the climate in which sentencing is judged.'],
    ['Police and CPS priorities', AMBER,
      'Forces answer to local priorities and public fear, so heavily covered offence types attract investigation resources, and the cases charged follow the cases investigated: the media agenda quietly shapes the criminal calendar.'],
    ['Trial by media', RED,
      'Prejudicial coverage of an active case, naming the accused, detailing previous convictions or dramatising guilt, risks reaching the very citizens who must judge the facts, and the law answers it as contempt rather than as press freedom.'],
    ['The contempt dam', GREEN,
      'Once proceedings are active, the Contempt of Court Act 1981 makes prejudicial publication a strict liability contempt; reporting can be postponed and identities protected, and prejudiced convictions can be quashed on appeal.'],
    ['The press as corrector', PURPLE,
      'Investigative journalism kept the Birmingham Six and Guildford Four cases alive when the system had closed its files, and exposes hidden harms that later become crimes: the same openness that pressures the system also protects it.'],
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
  band(x, 866, 196, 'One press, two faces',
    'The channels do not split into good media and bad media: the same newspapers that sell a defendant photograph have freed the wrongly convicted. The reviewer traces each channel, names its direction and names its safeguard, and refuses the easy verdict that the influence is simply corrupting or simply healthy.',
    { bodyY: 60 });
  return { file: 'crim-media-influence.png' };
}

/* ---------- Page 10: the judge in the case ---------- */
function judiciaryInfluence() {
  const [c, x] = make(W, 1086);
  title2(x, 'The judge in the case: four channels of discretion');
  sub2(x, 'Judicial power over outcomes is wide, and it is surrounded on every side by constraint');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Rulings on evidence', BLUE,
      'The judge decides what the jury may hear: which confessions, identifications and expert opinions pass the rules of admissibility. What never reaches the jury never reaches the verdict, which makes rulings one of the quietest and strongest powers in the room.'],
    ['Directions of law', PURPLE,
      'The judge tells the jury what each element of the offence means, what the burden and standard require, and which warnings the evidence needs, for instance on accomplice testimony. Twelve minds receive the whole law through one voice.'],
    ['The summing up', AMBER,
      'The judge reviews the evidence for the jury, summarising the case on both sides. It must be fair and balanced, and a summing up that tips the scales is a classic ground of appeal against conviction.'],
    ['Sentencing discretion', RED,
      'After a guilty verdict the judge chooses the sentence within the statutory maximum and any minimum, following the guidelines and weighing aggravating and mitigating factors. The discretion is real, but boxed on every side.'],
    ['The constraint web', GREEN,
      'Appellate review polices rulings, directions and sentences from above; precedent binds the judge too; guidelines structure the sentence; Parliament sets the ceiling and sometimes the floor; and everything the judge says is public, on the record.'],
    ['Independence protections', DARK,
      'Open appointment through the Judicial Appointments Commission, security of tenure, salaries paid without a parliamentary vote and removal only by an address of both Houses: the judge can decide against the state, the press and popularity without fear.'],
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
  band(x, 866, 196, 'Wide power, heavy audit',
    'A judge holds four channels of influence over every Crown Court outcome, which is precisely why each channel is transcribed, published and appealable. The design argument is clean: discretion without audit would be dangerous, and audit without discretion would be robotic; the English judge is the compromise between the two.',
    { bodyY: 60 });
  return { file: 'crim-judiciary-influence.png' };
}

/* ---------- Page 11: the three-stream model ---------- */
function influenceModel() {
  const [c, x] = make(W, 1086);
  title2(x, 'Three streams, one case: the influence model');
  sub2(x, 'Media, politics and the judiciary converging on the decision that matters');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['The media stream', BLUE,
      'Works through weather: selection, fear, campaigns and pre-trial publicity set the climate in which cases are charged, tried and sentenced. Its improper leak is coverage that reaches jurors or converts a sentence into a political event.'],
    ['The politics stream', RED,
      'Works through the road: legislation, offence definitions, maximums and minimums, police and CPS priorities, and funding decide which cases exist and how they must end. Its leaks are panicked statutes and minimums pressed onto exceptional defendants.'],
    ['The judiciary stream', PURPLE,
      'Works through the car: precedent, rulings, directions and sentences decide the case itself. Uniquely, its influence on decisions is intended, spoken in public, on the record, and reviewed from above: discretion, but audited discretion.'],
    ['The dams', GREEN,
      'Contempt law and reporting restrictions dam the media; judicial independence, guidelines and appellate review dam politics; precedent and the transcribed record dam the judiciary. Each dam converts pressure into a legal test rather than silencing it.'],
    ['The leak points', AMBER,
      'Old prejudicial archives online, social media beyond the rules reach, panicked legislation, statutory minimums on the exceptional defendant, funding cuts that degrade the defence, and the unrecorded assumptions inside judicial readings of plausibility.'],
    ['The reviewer question', DARK,
      'For every pressure in a case pack, ask: did it shape the process or the decision? Process influence is mostly lawful and arguable; influence on decisions must travel through evidence and law, and the moment it arrives by another route, a reviewer has found something worth naming.'],
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
  band(x, 866, 196, 'No case is decided in a vacuum',
    'The media set the weather, politics build the road, the judiciary drive the car: every case in every court is pressed on by all three at once. The evaluation that earns top marks ranks the streams by the strength of their channel to the decision, names the safeguard at each leak point, and never treats influence as automatically improper.',
    { bodyY: 60 });
  return { file: 'crim-influence-model.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([mediaInfluence, judiciaryInfluence, influenceModel], only);
  console.log(JSON.stringify(done));
})();
module.exports = { mediaInfluence, judiciaryInfluence, influenceModel };