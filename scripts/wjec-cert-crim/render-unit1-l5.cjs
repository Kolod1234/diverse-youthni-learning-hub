/*
 * WJEC Level 3 Applied Certificate in Criminology — Unit 1 Changing Awareness
 * of Crime. Lesson 5: Planning your campaign for change.
 * Diagrams for pages 5, 7 and 10.
 * Run: node render-unit1-l5.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, text,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 5: the audience map ---------- */
function audiences() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'Mapping the audiences of a campaign for change');
  sub2(x, 'One audience, one message, one channel: the planning rule that keeps a campaign from becoming noise');

  // central campaign node
  x.fillStyle = '#0f172a';
  x.beginPath(); x.arc(724, 246, 86, 0, Math.PI * 2); x.fill();
  x.strokeStyle = '#f97316'; x.lineWidth = 4;
  x.beginPath(); x.arc(724, 246, 92, 0, Math.PI * 2); x.stroke();
  text(x, 'YOUR', 724, 236, { size: 20, bold: true, color: '#fff' });
  text(x, 'CAMPAIGN', 724, 262, { size: 20, bold: true, color: '#f97316' });

  const cols = [60, 516, 972], PW = 416, PY = 400, PH = 390;
  const panels = [
    ['Primary audience', GREEN, 'Who they are',
      'The group your aim names: the students at risk, the potential victims, the bystanders who watch without naming what they see.',
      'The message',
      'The teaching: what the harm is, its warning signs, and what to do. In their language, on their platforms, with their examples.',
      'Example channels',
      'Assembly with tutor follow-up; poster series in corridors and common areas; peer-led sessions.'],
    ['Secondary audiences', AMBER, 'Who they are',
      'Parents, form tutors, staff and peers: the people who repeat, legitimise and reinforce the message at home and in class.',
      'The message',
      'The briefing: what to say, where to signpost, and how to respond if someone discloses.',
      'Example channels',
      'Tutor briefing pack; parent newsletter item; a staff slide for briefings.'],
    ['Institutional targets', PURPLE, 'Who they are',
      'Head teachers and school leadership, the police safer-schools officer, councils and charities: whoever can make a permanent change.',
      'The message',
      'The proposal: the evidence base, the specific ask, the cost, and what it achieves for the institution.',
      'Example channels',
      'A one-page proposal with evidence attached; a partnership with the local police or a charity.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 20, PY + 42, i + 1, p[0], p[1], 20);
    let y = PY + 84;
    for (let k = 2; k <= 6; k += 2) {
      text(x, p[k], px + PW / 2, y, { size: 14.5, bold: true, color: p[1] });
      y = wrap(x, p[k + 1], px + 26, px + PW - 26, y + 26, { size: 14.5, lh: 19 }) + 10;
    }
  });

  band(x, 820, 232, 'The rule that makes the map work',
    'The primary audience receives the teaching; the secondary audiences repeat it; the institutional targets make it permanent. A campaign that sends the same message to all three, through the same channel, reaches none of them properly, so the plan assigns each match in writing, with its reason.',
    { bodyY: 54 });
  return { file: 'crim-campaign-audiences.png' };
}

/* ---------- Page 7: the eight-step planning cycle ---------- */
function cycle() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'The campaign planning cycle: eight steps, one page, any campaign');
  sub2(x, 'Each step inherits the one before it, and the pilot loops back before launch');

  const xs = [40, 402, 764, 1126], BW = 316, RW1 = 132, RW2 = 468, BH = 264;
  const steps = [
    ['Choose the harm', 'Five tests: hidden or misunderstood, evidenced, reachable, achievable, measurable.'],
    ['Gather the evidence', 'Two or three statistics from the correct instrument, with source, series and year noted.'],
    ['Set the aim', 'The four-part pattern: what change, in whom, from what to what, measured how.'],
    ['Map the audiences', 'Primary, secondary and institutional, each with one matched message and channel.'],
    ['Choose the methods', 'A short menu with justifications: assembly, posters, tutor pack, proposal, partnership.'],
    ['Set timeline and resources', 'Five weeks: baseline, design, pilot and permissions, launch, evaluate. People, materials, sign-offs.'],
    ['Define success criteria', 'Indicators, baseline and follow-up, the target, and honest limits, decided before anything is made.'],
    ['Pilot and refine', 'Test the materials on a small group; improve them from what the test reveals; then launch.'],
  ];
  steps.forEach((s, i) => {
    const px = xs[i % 4], py = i < 4 ? RW1 : RW2;
    box(x, px, py, BW, BH);
    panelHeader(x, px + 16, py + 40, i + 1, s[0], i < 4 ? BLUE : PURPLE, 17);
    wrap(x, s[1], px + 20, px + BW - 20, py + 82, { size: 14.5, lh: 20 });
  });

  // arrows between columns within each row
  x.strokeStyle = GREY; x.fillStyle = GREY; x.lineWidth = 3;
  for (const row of [[RW1, 0], [RW2, 4]]) {
    for (let j = 0; j < 3; j++) {
      const x1 = xs[j] + BW, x2 = xs[j + 1], y = row[0] + BH / 2;
      x.beginPath(); x.moveTo(x1 + 4, y); x.lineTo(x2 - 8, y); x.stroke();
      x.beginPath(); x.moveTo(x2 - 2, y); x.lineTo(x2 - 12, y - 7); x.lineTo(x2 - 12, y + 7); x.closePath(); x.fill();
    }
  }
  // loop arrow: step 8 back up to step 5 (visual cue), plus label
  text(x, 'The pilot loops back: refine before launch, do not launch to find out', 724, 1020, { size: 17, bold: true, color: AMBER });

  band(x, 768, 210, 'Each step inherits the one before it',
    'A topic with no evidence corrupts the aim; an unassessable aim corrupts the audience, the methods and the evaluation built on top of it. The cycle runs downhill from careful early choices, and the pilot at step eight sends the campaign back to improve the materials before they fail in public, not forward to fail.',
    { bodyY: 52 });
  return { file: 'crim-campaign-planning-cycle.png' };
}

/* ---------- Page 10: the evaluation design pattern ---------- */
function evaluation() {
  const [c, x] = make(H.W, 1086);
  title2(x, 'Designing the evaluation: from aim to evidence');
  sub2(x, 'Every aim type has an indicator and a data source, chosen before launch, measured at baseline and follow-up');

  const LX = 60, LW = 330, mcols = [410, 760, 1110], CW = 330, CH = 118;
  const heads = ['Aim, in the four-part pattern', 'Indicator: what is measured', 'Data source and target'];
  box(x, LX, 150, LW, 56, { fill: '#f8fafc' });
  text(x, 'Aim type', LX + LW / 2, 180, { size: 17, bold: true });
  heads.forEach((h, i) => {
    box(x, mcols[i], 150, CW, 56, { fill: '#f8fafc' });
    text(x, h, mcols[i] + CW / 2, 180, { size: 16.5, bold: true });
  });

  const rows = [
    ['Awareness', GREEN, 'Sixth-formers identify three warning signs of coercive control',
      'Knowledge: the before-and-after quiz score', 'An identical anonymous quiz on the same audience; target 40% rising to 80%'],
    ['Reporting', BLUE, 'Students know where to report a hate incident and say they would use it',
      'Stated intention, plus usage of the named channel', 'Anonymous survey questions; the school\u2019s own count of reports to that route'],
    ['Behaviour', PURPLE, 'Students check sender addresses before clicking links in messages',
      'Self-reported conduct in the defined audience', 'A repeated anonymous survey with behaviour questions; a named percentage target'],
    ['Institutional', AMBER, 'The school displays permanent signposting and briefs staff to receive disclosures',
      'The institution acts: yes or no', 'Written confirmation, the displayed materials, and the staff briefing itself'],
  ];
  rows.forEach((r, i) => {
    const ry = 216 + i * (CH + 14);
    box(x, LX, ry, LW, CH, { fill: '#f8fafc' });
    text(x, r[0], LX + LW / 2, ry + CH / 2, { size: 17, bold: true, color: r[1] });
    r.slice(2).forEach((cell, j) => {
      const cx = mcols[j];
      box(x, cx, ry, CW, CH, { fill: '#fff', stroke: LIGHT });
      wrap(x, cell, cx + 18, cx + CW - 18, ry + CH / 2 - 26, { size: 14.5, lh: 20 });
    });
  });

  band(x, 800, 252, 'Baseline, intervention, follow-up',
    'Take the baseline before anything reaches the audience, run the campaign, then measure the same instrument on the same audience again. Mix the numbers with qualitative feedback that explains them, name the limits honestly, a two-week gap measures recall, not retention, and decide in advance what a missed target will mean. That is evaluation designed, not improvised.',
    { bodyY: 54 });
  return { file: 'crim-campaign-evaluation.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([audiences, cycle, evaluation], only);
  console.log(JSON.stringify(done));
})();
module.exports = { audiences, cycle, evaluation };