/*
 * Renders the three WJEC AS Sociology Lesson 13 (Media Power, Representation and Audiences) diagrams.
 * Uses the shared diagram-helpers.cjs — same visual language as the rest of the set.
 * Output: public/lesson-assets/wjec-as-sociology/. RENDER_ONLY env filter when run directly.
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, run, arrow, text, W, H: HEIGHT,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

// ---------- 1. Media power: ownership and the two readings (Lesson 13, pages 2–4) ----------
function d_mediaPower() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'Media power: the ownership chain and the two readings');
  sub2(x, 'from boardroom to audience in five links \u2014 and the pluralist/Marxist dispute over what flows down the chain');
  const bw = 1290, bh = 132;
  const L = (35 + 720) / 2;
  const chain = [
    ['1', 'CONCENTRATED OWNERSHIP', BLUE,
      'few conglomerates own the means of production: film studios, presses, platforms and broadcasters combine under holding companies (vertical integration: production + distribution + exhibition in one hand).'],
    ['2', 'EDITORIAL AND AGENDA CONTROL', PURPLE,
      'owners appoint editors and set what Bourdieu would call the field\u2019s rules: which stories exist, which voices are hired, which lines are held \u2014 influence is often exercised by what is never commissioned.'],
    ['3', 'SELECTION AND GATEKEEPING', RED,
      'news values and deadlines decide what becomes content: fewer journalists, agency copy and press releases fill the space \u2014 the gatekeeping research tradition (White\u2019s \u201cmr gates\u201d) documented the choices.'],
    ['4', 'FRAMING AND DISCOURSE', AMBER,
      'what is selected is told: headlines, images, ordering and repetition build the frame \u2014 the same event is a \u201cprotest\u201d or a \u201criot\u201d before any reader has read a word.'],
    ['5', 'THE AUDIENCE\u2019S WORLD', GREEN,
      'the frames become the materials of common sense \u2014 but audiences are the disputed link: this is where the pluralist and Marxist readings part company.'],
  ];
  chain.forEach((n, i) => {
    const by = 130 + i * (bh + 14);
    box(x, 35, by, bw, bh, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = n[2]; x.fillRect(35, by, bw, 8);
    panelHeader(x, 52, by + 52, n[0], n[1], n[2], 18);
    wrap(x, n[3], 350, 1300, by + 44, { size: 15.5, lh: 22 });
  });
  band(x, 890, 160, 'WHERE THE READINGS PART COMPANY',
    'The PLURALIST reading: the chain runs upwards \u2014 audiences get what they want, editors follow ratings and clicks, owners serve shareholders by serving readers, and the proof is variety: the market punishes bias, and anyone can publish on the open internet. ' +
    'The MARXIST reading: the chain runs downwards \u2014 concentrated ownership, shared class interests and the ideology in the timetable\u2019s big sibling produce a spectrum of opinion inside a consensus (the dominant ideology thesis); audiences are free to choose between positions the frame already sets (Curran and Seaton\u2019s organisational qualification: it is media organisations, not always owners, that hold the power). ' +
    'The examinable sentence: the dispute is not whether media are powerful but at which link the power operates \u2014 and the digital era (page 11) reopened it at the ownership link, where platforms replaced presses.',
    { size: 15, bodyY: 54 });
  return { file: 'wjec-soc-media-power.png', w: W, h: HEIGHT };
}

// ---------- 2. The semiotic ladder: denotation, connotation, myth (Lesson 13, page 5) ----------
function d_semioticLadder() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'Reading a media text: the semiotic ladder');
  sub2(x, 'one front-page photograph, three readings deep \u2014 the method the representation questions are answered with');
  // left: the example photograph panel
  box(x, 60, 130, 500, 420, { fill: '#eff6ff', stroke: '#bfdbfe', lw: 2 });
  text(x, 'THE SIGN: A FRONT-PAGE PHOTO', 310, 168, { size: 18, bold: true, color: BLUE });
  wrap(x, 'A young man in a hoodie, hood up, photographed at night, walking past a shuttered shop, blue police lights in the background. Whatever the event was, the photograph is what the reader receives.', 90, 530, 206, { size: 15.5, lh: 22 });
  wrap(x, 'The sign is the photograph (signifier) plus what the reader takes it to mean (signified). Saussure\u2019s foundational distinction: the relationship is conventional \u2014 arbitrary but learned, which is why media literacy is teachable.', 90, 530, 392, { size: 15, lh: 21 });
  // right: three rungs
  const rw = 700, rh = 118;
  const rungs = [
    ['1', 'DENOTATION', BLUE, 'what is literally there: a male figure, a garment, darkness, police lighting, a shutter \u2014 the first-order meaning any competent reader shares. Denotation is the floor: a factual description, checkable against the image.'],
    ['2', 'CONNOTATION', RED, 'what it suggests: the hoodie as menace, the hood as concealment, the night as risk \u2014 learned cultural associations attached to the denoted elements. Connotation is where ideology gets its foothold: it feels like seeing, but it is reading.'],
    ['3', 'MYTH (SECOND-ORDER SEMIOLOGY)', GREEN, 'the whole system naturalising an idea: Barthes\u2019 level at which \u201cyoung, hooded, night, police\u201d stops being about anyone and becomes evidence about a category \u2014 hooded youth AS disorder itself, timeless and natural. Myth turns history into nature.'],
  ];
  rungs.forEach((r, i) => {
    const by = 130 + i * (rh + 26);
    box(x, 620, by, rw, rh, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = r[2]; x.fillRect(620, by, rw, 8);
    panelHeader(x, 638, by + 46, r[0], r[1], r[2], 18);
    wrap(x, r[3], 800, 1300, by + 38, { size: 15, lh: 21 });
  });
  arrow(x, 310, 570, 310, 616, { color: GREY });
  band(x, 664, 200, 'THE ANALYST\u2019S JOB \u2014 AND ITS LIMITS',
    'The semiotician\u2019s move is to make the invisible rungs visible: describe the denotation, name the connotations, expose the myth \u2014 and show that a different photograph of the same event (the boy walking home in daylight, no hood) carries different connotations toward no myth at all. ' +
    'THE LIMIT (method evaluation): semiotic readings are interpretations \u2014 credibility depends on systematic sampling, explicit coding frames and evidence that real readers actually take the meanings claimed (Lesson 10\u2019s confirmability standard, and page 9\u2019s audience studies are the check). ' +
    'THE SPECIFICATION\u2019S TERM: this is how \u201cunderlying ideological meanings\u201d is examined \u2014 not by asserting bias, but by walking the ladder.',
    { size: 15, bodyY: 54 });
  return { file: 'wjec-soc-semiotic-ladder.png', w: W, h: HEIGHT };
}

// ---------- 3. Effects and audiences: five models and their claims (Lesson 13, pages 8–9) ----------
function d_effectsMap() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'From injected audiences to participatory publics: five models');
  sub2(x, 'the history of media-effects theory is the history of the audience being discovered \u2014 each model corrects its predecessor');
  const pw = 420, ph = 330;
  const cells = [
    [60, 130, '1. HYPODERMIC NEEDLE', BLUE,
      ['THE CLAIM (1920s\u201340s): messages injected into a passive audience produce direct, uniform effects.',
       'WHY IT AROSE: propaganda\u2019s apparent success and mass-society fear.',
       'ITS FALL: empirical research found audiences anything but uniform \u2014 the model is now a teaching device and a stick to beat lazy effects claims with.']],
    [514, 130, '2. CULTIVATION', RED,
      ['THE CLAIM (Gerbner): heavy television viewing cultivates a view of the world more frightening than the evidence \u2014 \u201cmean world syndrome\u201d.',
       'THE MECHANISM: not one message but the diet \u2014 total patterns over years.',
       'THE LIMIT: correlation between viewing and fear cannot exclude the third variable (already fearful people stay in and watch more).']],
    [968, 130, '3. TWO-STEP FLOW', AMBER,
      ['THE CLAIM (Katz and Lazarsfeld, 1945\u201355): media influence flows through opinion leaders \u2014 people the group trusts for a topic.',
       'THE DISCOVERY: the audience is socially organised, and the first crack in \u201cdirect effects\u201d.',
       'THE LEGACY: influencer culture is the two-step flow with analytics \u2014 the model aged better than its era.']],
    [60, 490, '4. USES AND GRATIFICATIONS', GREEN,
      ['THE CLAIM (Katz, Blumler, Gurevitch, 1974): audiences use media for their own purposes \u2014 information, identity, integration, entertainment.',
       'THE INVERSION: the question is not \u201cwhat media do to people\u201d but \u201cwhat people do with media\u201d.',
       'THE LIMIT: a list of uses is not an account of power \u2014 choosing between frames is not freedom from them.']],
    [514, 490, '5. ENCODING / DECODING', PURPLE,
      ['THE CLAIM (Hall, 1973): producers encode meaning into texts; audiences decode \u2014 dominant, negotiated, oppositional readings.',
       'THE EVIDENCE: Morley\u2019s Nationwide study \u2014 different groups decoded the same news differently by their own positions.',
       'THE LESSON: meaning is completed by the audience \u2014 but the resources to read are unequal, so the frames still lean.']],
    [968, 490, '6. PARTICIPATORY MEDIA', DARK,
      ['THE CLAIM (digital era): audiences are producers \u2014 user-generated content, comment, remix: power diffuses from institutions to users.',
       'THE EVIDENCE: the tools are real \u2014 publishing is one tap away.',
       'THE QUESTION: ownership of the platforms (page 2\u2019s chain) meets participation\u2019s claim \u2014 the debate returns at a new link.']],
  ];
  cells.forEach(([bx, by, hd, col, parts]) => {
    box(x, bx, by, pw, ph, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, pw, 8);
    text(x, hd, bx + pw / 2, by + 42, { size: 17, bold: true, color: col });
    let y = by + 74;
    parts.forEach(p => { y = wrap(x, p, bx + 22, bx + pw - 22, y, { size: 14.5, lh: 20 }) + 12; });
  });
  band(x, 864, 170, 'THE EXAMINABLE PATTERN',
    'Each model corrects its predecessor: passive injection \u2192 cultivated diets \u2192 social mediation \u2192 active uses \u2192 situated readings \u2192 participatory production \u2014 the audience keeps getting more active, and the power keeps relocating rather than disappearing. ' +
    'The strong essay\u2019s move is to place a given claim on the map: a fear-of-violence headline is a hypodermic claim; Morley\u2019s evidence refutes it from rung 5; and the platform-era question (page 12) asks whether rung 6\u2019s participation is rung 1\u2019s injection with better marketing.',
    { size: 15, bodyY: 52 });
  return { file: 'wjec-soc-effects-map.png', w: W, h: HEIGHT };
}

const renderers = [d_mediaPower, d_semioticLadder, d_effectsMap];

module.exports = { run: (only) => run(renderers, only) };

if (require.main === module) {
  let only = [];
  try { only = String(process.env.RENDER_ONLY || '').split(',').map(s => s.trim()).filter(Boolean); } catch (e) { only = []; }
  run(renderers, only).then(files => console.log(JSON.stringify({ rendered: files })));
}