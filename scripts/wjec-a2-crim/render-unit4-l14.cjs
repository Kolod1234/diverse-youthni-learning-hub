/*
 * WJEC A2 Criminology, Lesson 14: Crime prevention: situational and social
 * approaches. Diagrams for pages 3, 9 and 11.
 * Run: node render-unit4-l14.cjs  (RENDER_ONLY=name.png to render one)
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

/* ---------- Page 3: the situational toolbox ---------- */
function preventionTechniques() {
  const [c, x] = make(W, 1086);
  title2(x, 'The situational toolbox: techniques by mechanism');
  sub2(x, 'Read the crime, find its opportunity structure, break the element');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Increase the effort', RED,
      'Target hardening (locks, screens, immobilisers), access control (gates, entry systems), deflecting offenders (streets routed away from trouble). Attacks the suitable target and the route: the crime becomes too much work for the reward.'],
    ['Increase the risk', BLUE,
      'CCTV with a real watcher, lighting, formal guardianship (staffed schemes, concierges), natural surveillance (windows and design that put eyes on the street). Works only where the guardian is real and the response fast.'],
    ['Reduce the rewards', AMBER,
      'Property marking and tracking, removing inducements (no visible valuables, no cash tills open), denying the benefit (fuel cut-offs, phone locking). The offence succeeds and gains nothing, so the calculus collapses.'],
    ['Reduce provocations', GREEN,
      'Queue and crowd management, de-escalating design (seating, staffing, temperature), controlling tools (toughened glass, plastic vessels). Aimed at the situational sparks of expressive crime and disorder.'],
    ['Remove the excuses', PURPLE,
      'Clear rules and signage, prompt reminders, access to lawful routes (ticket machines that work). Closes the I did not know and everyone does it doors, sharpening the perceived rule before the breach.'],
    ['The flagship evidence', DARK,
      'Electronic immobilisers drove the great vehicle theft fall of the 1990s and 2000s: opportunity changed, the motivated population barely did, and a national crime rate moved with the locks, the tradition central demonstration.'],
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
  band(x, 866, 196, 'Choose by crime type',
    'The techniques are matched to the offence: acquisitive planned crime answers to effort, risk and reward; expressive and impulsive crime answers to provocations and excuses; and the measurement always watches the surrounding ring for displacement while counting the diffusion the scheme never promised.',
    { bodyY: 60 });
  return { file: 'crim-prevention-techniques.png' };
}

/* ---------- Page 9: the prevention landscape ---------- */
function preventionMap() {
  const [c, x] = make(W, 1086);
  title2(x, 'The prevention landscape: traditions and horizons');
  sub2(x, 'Events versus actors, months versus decades, and the funding politics between');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Situational: events', RED,
      'Theory: routine activity and rational choice. Lever: the opportunity structure. Horizon: weeks to months. Strength: fast, cheap, well-evidenced. Limit: prevents the act, not the actor, and excludes where space is public.'],
    ['Developmental: actors', BLUE,
      'Theory: risk and protective factors. Lever: childhood and family circumstances, schooling, peers. Horizon: decades. Strength: best value per pound on any ledger. Limit: slow, contested attribution, prediction ethics.'],
    ['Community: cohesion', GREEN,
      'Theory: collective efficacy and bonds. Lever: neighbourhood organisation, partnerships, provision. Horizon: years. Strength: rebuilds the informal control no agency can hire. Limit: fails as consultation theatre, needs real power.'],
    ['The displacement caveat', AMBER,
      'Prevented crime is partly real and partly relocated: five displacement types (spatial, temporal, tactical, target, functional), offset by diffusion of benefits beyond the measure. The honest measure is the net balance, ring by ring.'],
    ['The politics of horizons', PURPLE,
      'Situational relief lands inside election cycles, social prevention lands after them, so the long-term programmes are cut first in every austerity round: crime policy records the previous decade fears, not the evidence.'],
    ['The professional mix', DARK,
      'Read the crime (whose opportunities, whose people, whose cohesion), layer the levers (situational now, community across years, developmental across decades), and state the horizon of each: the unstated horizon is how policy is blamed for the wrong failure.'],
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
  band(x, 866, 196, 'The traditions are complements',
    'The situational tradition prevents events, the social tradition prevents actors, and real crime problems are made of both: the estate needs locks and lighting this year, cohesion across the years, and the children across the decades. The strongest policy funds both halves and states what lands when.',
    { bodyY: 60 });
  return { file: 'crim-prevention-map.png' };
}

/* ---------- Page 11: prevention applied ---------- */
function preventionApplied() {
  const [c, x] = make(W, 1086);
  title2(x, 'Prevention in action: one estate, three levers');
  sub2(x, 'The applied method: read the crime, layer the levers, state the horizons');

  const cols = [60, 516, 972], PW = 416, rows = [120, 490], PH = 330;
  const panels = [
    ['Read the opportunity', BLUE,
      'The estate suffers burglary of homes and sheds, car crime in dark corners, and a known local group. Whose opportunities (dark routes, unhardened doors), whose people (the bored group), whose cohesion (residents who know the names but not each other).'],
    ['The situational lever', RED,
      'Lighting on the dark routes, target hardening of just-victimised homes (the repeat insight), natural surveillance in design, securing the cars. Delivers in weeks to months; expect some spatial and target displacement, softened by diffusion.'],
    ['The community lever', GREEN,
      'A residents partnership with real power (not consultation theatre), youth provision co-designed with the young people, the community knowledge of the group made an asset. Delivers across years, as cohesion and collective efficacy build.'],
    ['The developmental lever', BLUE,
      'Family support and school engagement for the known group, mentoring and a purpose route (skills, work, sport), restorative repair of the damage done. Delivers across decades, and guards against the iatrogenic risk by framing support as opportunity, not surveillance.'],
    ['The displacement audit', AMBER,
      'Watch the ring around the estate for the crime that moves (spatial, temporal, tactical), count the falls beyond the treated streets (diffusion), and judge the plan on the net area effect rather than the treated address alone.'],
    ['The horizon summary', DARK,
      'Weeks: lighting and hardening bite. Months: the situational margin matures, displacement settles. Years: cohesion compounds. Decades: the children of the estate become adults the system never meets. State all four or be blamed for the wrong failure.'],
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
  band(x, 866, 196, 'The weak answer pulls one lever',
    'A lighting scheme alone is a situational answer to a layered problem: it buys months and leaves the causes untouched. The method the examination rewards layers the levers, audits the displacement and states the horizon of each, because an unstated horizon is how prevention gets blamed for the failure it never promised to fix.',
    { bodyY: 60 });
  return { file: 'crim-prevention-applied.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([preventionTechniques, preventionMap, preventionApplied], only);
  console.log(JSON.stringify(done));
})();
module.exports = { preventionTechniques, preventionMap, preventionApplied };