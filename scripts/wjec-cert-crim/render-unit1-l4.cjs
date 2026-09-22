/*
 * WJEC Level 3 Applied Certificate in Criminology — Unit 1 Changing Awareness
 * of Crime. Lesson 4: Campaigns for change: case studies.
 * Diagrams for pages 3, 9 and 10.
 * Run: node render-unit1-l4.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, text,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 3: the anatomy of a campaign ---------- */
function anatomy() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'The anatomy of a campaign for change: six working parts');
  sub2(x, 'The skeleton shared by every campaign in this lesson, and by the one you will plan yourself');

  const cols = [60, 516, 972], PW = 416, RW1 = 132, RW2 = 490, PH = 312;
  const panels = [
    ['Trigger', BLUE, 'A specific harm becomes unbearable to specific people. The story gives the campaign its engine, and the founders\u2019 bereavement gives it a moral authority no critic can match.'],
    ['Evidence base', GREEN, 'The statistics that prove scale. Stories move the public; numbers move the reviews, pilots and committees that must grant the change.'],
    ['The aim', PURPLE, 'One clear, achievable ask, addressed to an institution that can grant it. Vague aims are where campaigns die first.'],
    ['Audience and allies', AMBER, 'Who must be moved: the public whose opinion creates pressure, the institutions that act, and the allies who carry the message into rooms the founders cannot enter.'],
    ['Methods and materials', RED, 'Petitions, marches, press partnerships, lobbying, social media. Each method reaches a different audience, so each must be chosen, not collected.'],
    ['Outcome and evaluation', DARK, 'Something verifiable happens, or fails to. Judged against the campaign\u2019s own stated aim, with outcome evidence, weighed on both sides.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = i < 3 ? RW1 : RW2;
    box(x, px, py, PW, PH);
    panelHeader(x, px + 20, py + 44, i + 1, p[0], p[1], 22);
    wrap(x, p[2], px + 26, px + PW - 26, py + 100, { size: 16, lh: 23 });
  });
  band(x, 826, 226, 'A campaign is a planned argument, carried by people',
    'The six parts work as a machine: the trigger supplies the story, the evidence supplies the proof, the aim supplies the direction, the audience supplies the pressure, the methods supply the delivery and the outcome supplies the verdict. When you evaluate any campaign, you are asking how well each part was built, and which part failed.',
    { bodyY: 54 });
  return { file: 'crim-campaign-anatomy.png' };
}

/* ---------- Page 9: three case studies side by side ---------- */
function studies() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'Three campaigns for change: trigger, aim, method, outcome');
  sub2(x, 'Snowdrop, Sarah\u2019s Law and Clare\u2019s Law compared on the shared anatomy');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 656;
  const rows = [
    ['Trigger', BLUE], ['Aim', PURPLE], ['Methods', GREEN], ['Outcome', RED],
  ];
  const data = [
    ['Snowdrop, 1996\u201397', BLUE, [
      'Dunblane, March 1996: sixteen children and their teacher killed with legally held handguns.',
      'End the private ownership of handguns in Britain.',
      'Local parents organised; a petition of over 700,000 signatures; marches; sustained press coverage; evidence to the Cullen Inquiry.',
      'The Firearms (Amendment) Acts of 1997 ended private handgun ownership, within roughly a year of the massacre.']],
    ['Sarah\u2019s Law, 2000\u201311', AMBER, [
      'Sarah Payne, aged eight, murdered in July 2000 by a man with previous convictions against children.',
      'A parent\u2019s right to know whether someone with access to their child is a convicted sex offender.',
      'Sara Payne\u2019s campaign; a national newspaper partnership under the banner For Sarah; sustained public pressure through review and pilot.',
      'Piloted in four force areas in 2008; rolled out across England and Wales by 2011 as the Child Sex Offender Disclosure Scheme.']],
    ['Clare\u2019s Law, 2009\u201314', PURPLE, [
      'Clare Wood murdered in Salford in 2009 by a former partner with a history of violence against women.',
      'Let people at risk ask the police about a partner\u2019s history of violence.',
      'Her father Michael Brown\u2019s campaign; regional then national media; police and government review leading to pilot.',
      'The Domestic Violence Disclosure Scheme, piloted in 2012, national from March 2014, with a right to ask and a right to know.']],
  ];
  data.forEach((d, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 20, PY + 44, i + 1, d[0], d[1], 21);
    let y = PY + 92;
    d[2].forEach((t, j) => {
      text(x, rows[j][0], px + PW / 2, y, { size: 15, bold: true, color: rows[j][1] });
      y = wrap(x, t, px + 26, px + PW - 26, y + 28, { size: 15, lh: 20 }) + 14;
    });
  });
  band(x, 800, 254, 'The shared pattern',
    'A named tragedy carrying moral authority, an achievable institutional ask, media amplification, then review, pilot and rollout. The asks differ in kind, one statute and two schemes, and so did the speed: the ban took a year, the schemes took a decade. The route from feeling to policy is the same, and it is the route your own campaign plan will follow.',
    { bodyY: 54 });
  return { file: 'crim-campaign-case-studies.png' };
}

/* ---------- Page 10: why campaigns succeed, and how success is measured ---------- */
function success() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'Why campaigns succeed \u2014 and how success is honestly measured');
  sub2(x, 'Six factors separate the campaigns that move institutions from the ones that fade');

  const LX = 60, LW = 660, RX = 760, RW = 628, PY = 122, PH = 640;
  box(x, LX, PY, LW, PH);
  panelHeader(x, LX + 20, PY + 44, 1, 'Why campaigns succeed', GREEN, 22);
  const factors = [
    ['A single, achievable ask', 'One grantable sentence, addressed to an institution that can grant it outright.'],
    ['Moral authority', 'Bereaved families and survivors give the demand an authenticity critics cannot attack.'],
    ['An evidence base', 'Statistics move the institutions that stories alone cannot budge.'],
    ['Media amplification', 'News values turn a cause into salience that keeps political windows open.'],
    ['A political window', 'Institutions act when salience is high and actors compete to respond: anniversaries, inquiries, elections.'],
    ['Organisation and persistence', 'Petitions gathered, evidence submitted, pilots monitored: change takes a decade, not a fortnight.'],
  ];
  let fy = PY + 100;
  factors.forEach((f, i) => {
    text(x, String(i + 1), LX + 48, fy + 4, { size: 18, bold: true, color: '#fff', align: 'left' });
    x.fillStyle = GREEN;
    x.beginPath(); x.arc(LX + 48, fy + 3, 17, 0, Math.PI * 2); x.fill();
    x.fillStyle = '#fff';
    x.font = 'bold 18px DV'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(String(i + 1), LX + 48, fy + 3);
    x.textAlign = 'left'; x.textBaseline = 'alphabetic';
    text(x, f[0], LX + 84, fy, { size: 17, bold: true, align: 'left', color: DARK });
    const ny = wrap(x, f[1], LX + 84, LX + LW - 30, fy + 28, { size: 15, lh: 20 });
    fy = ny + 20;
  });

  box(x, RX, PY, RW, PH);
  panelHeader(x, RX + 20, PY + 44, 2, 'Measuring success', BLUE, 22);
  const meas = [
    ['Outputs prove effort', BLUE, 'Signatures, leaflets, mentions, attendance: what the campaign produced. Never let them stand in for outcomes.'],
    ['Outcomes prove change', GREEN, 'A statute passed, a scheme launched, awareness measured, reporting moved, behaviour altered: what changed in the world.'],
    ['Quantitative indicators', PURPLE, 'Before-and-after quizzes and surveys; recorded and surveyed series; casualty statistics, judged against the aim\u2019s target.'],
    ['Qualitative evidence', AMBER, 'Feedback, interviews, pilot reactions: explaining the numbers, never replacing them.'],
    ['The attribution trap', RED, 'Name the competing causes before claiming the credit: triangulate the evidence, then argue the most defensible judgement.'],
  ];
  let my = PY + 104;
  meas.forEach((m) => {
    text(x, m[0], RX + RW / 2, my, { size: 17, bold: true, color: m[1] });
    my = wrap(x, m[2], RX + 26, RX + RW - 26, my + 28, { size: 15, lh: 20 }) + 16;
  });

  band(x, 786, 268, 'The diagnostic',
    'Run the six factors over any campaign, a case study\u2019s or your own: the campaign that failed usually failed on one of the six, and naming which one is the evaluation. Judge by outcomes against the campaign\u2019s own stated aim, weighed on both sides, and where several causes plausibly produced the outcome, say so: honest attribution is evaluation, not weakness.',
    { bodyY: 54 });
  return { file: 'crim-campaign-success.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([anatomy, studies, success], only);
  console.log(JSON.stringify(done));
})();
module.exports = { anatomy, studies, success };