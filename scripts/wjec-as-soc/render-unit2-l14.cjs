/*
 * Renders the three WJEC AS Sociology Lesson 14 (Religion, Participation, Organisations and Theory) diagrams.
 * Uses the shared diagram-helpers.cjs — same visual language as the rest of the set.
 * Output: public/lesson-assets/wjec-as-sociology/. RENDER_ONLY env filter when run directly.
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, run, arrow, text, W, H: HEIGHT,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK } = H;

// ---------- 1. Three theories of religion (Lesson 14, pages 2–5) ----------
function d_religionTheories() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'What does religion do? Three classical answers');
  sub2(x, 'solidarity, consolation or change \u2014 and what each account predicts the record should show');
  const pw = 428, ph = 610;
  const cells = [
    [60, 130, 'FUNCTIONALISM: SOLIDARITY', BLUE,
      ['DURKHEIM: the sacred and the profane \u2014 religions classify; totems stand for the group itself, so worship is society celebrating itself: the collective conscience renewed.',
       'MALINOWSKI: religion consoles where life is uncertain \u2014 death and disaster rituals manage the anxiety no practical action can (the \u201clisty\u201d functions of shared ceremonies).',
       'PARSONS: religion carries the values society cannot justify from within \u2014 meaning for what happens to us that no institution can guarantee.',
       'PREDICTS: shared belief wherever society holds; its test is whether modern societies still share (page 7\u2019s record).']],
    [510, 130, 'MARXISM: CONSOLATION AS CONTROL', RED,
      ['MARX: \u201cthe sigh of the oppressed creature\u2026 It is the opium of the people\u201d \u2014 the FULL quote: religion expresses real suffering AND protests against it, before drugging the protest into patience.',
       'ALTHUSSER: the church is the first ideological state apparatus (Lesson 12, page 4) \u2014 ruling-class heaven purchased with a patient earth.',
       'PREDICTS: religion fades with class consciousness; where it persists among the poor, comfort reading.',
       'ITS TEST: the world\u2019s poor are the world\u2019s religious (page 8) \u2014 the prediction runs backwards, which Marxists must explain.']],
    [960, 130, 'WEBER: CHANGE', GREEN,
      ['THE PROTESTANT ETHIC (1905): Calvinist predestination anxiety produced this-worldly proof-seeking \u2014 disciplined work, delayed consumption, reinvestment: the SPIRIT of capitalism\u2019s personality, before its machinery.',
       'STATUS HONOUR AND SALVATION PATHS (post-reformation): the deprived may compensate (theodicy of the poor) or overturn (prophetic movements).',
       'PREDICTS: religion can drive history, not only mirror it; ideas with interests behind them make epochs.',
       'ITS TEST: does the causation survive? The audit asks whether capitalism needed the ethic, or the ethic is what early capitalism looked like from inside.']],
  ];
  cells.forEach(([bx, by, hd, col, parts]) => {
    box(x, bx, by, pw, ph, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, pw, 8);
    text(x, hd, bx + pw / 2, by + 42, { size: 17, bold: true, color: col });
    let y = by + 74;
    parts.forEach(p => { y = wrap(x, p, bx + 22, bx + pw - 22, y, { size: 14.5, lh: 20 }) + 13; });
  });
  band(x, 778, 160, 'THE PREDICTIONS TABLE \u2014 WHERE THE ESSAY DECIDES',
    'Each theory is scored against the same record (pages 6\u20138): functionalism predicted shared belief where society holds \u2014 the record shows fragmented believing; Marxism predicted religion fading with oppression \u2014 the record shows the poorest societies the most religious; Weber predicted ideas driving history \u2014 the record keeps confirming it somewhere. ' +
    'The examinable move is to state each theory\u2019s prediction BEFORE presenting the evidence, so the evidence has something to adjudicate.',
    { size: 15.5, bodyY: 52 });
  return { file: 'wjec-soc-religion-theories.png', w: W, h: HEIGHT };
}

// ---------- 2. The secularisation debate (Lesson 14, pages 6–8) ----------
function d_secularisationDebate() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'The secularisation debate: thesis, antithesis and the measurement war');
  sub2(x, 'the same statistics, read as decline or as transformation \u2014 the AS examination\u2019s great adjudication');
  const pw = 654, ph = 520;
  const drawCol = (bx, hd, col, rows) => {
    box(x, bx, 130, pw, ph, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, 130, pw, 8);
    text(x, hd, bx + pw / 2, 176, { size: 24, bold: true, color: col });
    let y = 214;
    rows.forEach(r => {
      text(x, r[0], bx + pw / 2, y, { size: 15.5, bold: true, color: GREY });
      y = wrap(x, r[1], bx + 26, bx + pw - 26, y + 25, { size: 15, lh: 21 }) + 18;
    });
  };
  drawCol(60, 'THE THESIS: SECULARISATION', RED, [
    ['WILSON (1966): RELIGION IS LOSING SOCIAL SIGNIFICANCE', 'not that belief dies but that religion withdraws from public life: institutions \u2014 law, politics, work, welfare \u2014 once church-shaped now run without it.'],
    ['BRUCE: THE EVIDENCE AND THE ENGINE', 'church adherence\u2019s long decline; religious authority\u2019s retreat from the public square; the engine is modernity itself \u2014 rationalisation, diversity and individualism corrode taken-for-granted belief into optional preference.'],
    ['THE METHODS FLOOR', 'attendance and membership series are solid trend data \u2014 but they measure INSTITUTIONS, and the thesis must show what falls with the institutions.'],
  ]);
  drawCol(734, 'THE COUNTER-CASE: TRANSFORMATION', BLUE, [
    ['DAVIE: BELIEVING WITHOUT BELONGING (1994)', 'British patterns: institutional participation falls while belief persists (a God, \u201csomething\u201d, ethics) \u2014 religion relocations rather than vanishes.'],
    ['DAVIE: VICARIOUS RELIGION', 'a majority happy for a minority to believe, worship and keep the buildings on their behalf \u2014 Nordic Europe\u2019s established churches kept \u201cjust in case\u201d: the pattern of a population outsourcing its religion.'],
    ['BERGER\u2019S REVERSAL; THE GLOBAL RECORD', 'the former secularisation theorist recanted (1999): the world is \u201cfuriously religious\u201d; Pentecostal growth, Islamic vitality and US exceptionalism mean secular Europe is the CASE, not the rule.'],
  ]);
  band(x, 686, 180, 'THE ADJUDICATION THE STRONGEST ESSAYS WRITE',
    'The measurement war decides the debate\u2019s form: the thesis is best evidenced for institutional religion in Europe (attendance, authority, establishment\u2019s retreat \u2014 the Wilson\u2013Bruce record stands), and weakest as a claim about BELIEF (the believing\u2013belonging gap, private practices, global vitality). ' +
    'So the top-band verdict is two-clause: institutional secularisation in Britain is demonstrated; secularisation AS A THEORY OF RELIGION\u2019S FUTURE is not \u2014 the honest sentence is that Britain\u2019s religious institutions have contracted while its religiosity has transformed, and neither pole of the debate predicted the shape of the transformation.',
    { size: 15.5, bodyY: 54 });
  return { file: 'wjec-soc-secularisation-debate.png', w: W, h: HEIGHT };
}

// ---------- 3. Religious organisations: the typology (Lesson 14, page 10) ----------
function d_religiousTypology() {
  const [c, x] = make(W, HEIGHT);
  title2(x, 'Church, denomination, sect and cult: the organisations map');
  sub2(x, 'Troeltsch\u2019s classic grid, its modern extensions, and the paths between them');
  const pw = 430, ph = 340;
  const cells = [
    [60, 130, 'CHURCH', BLUE,
      ['\u2022 large, universal membership by birth or nation \u2014 society\u2019s religion itself.',
       '\u2022 professional clergy, bureaucratic, close to the state (establishment: the Church of England\u2019s law-making lords).',
       '\u2022 compromise with the world: accommodation is its structure (Troeltsch: the church accepts the world to save it).']],
    [514, 130, 'DENOMINATION', PURPLE,
      ['\u2022 mid-way: separate from the state, tolerant of others, membership partly voluntary.',
       '\u2022 the church pattern in a plural market \u2014 Methodists, Baptists, the settled nonconformist bodies.',
       '\u2022 Niebuhr\u2019s cycle: sects that survive their founding generation\u2019s fire settle into denominations \u2014 the second generation wants respectability.']],
    [968, 130, 'SECT', RED,
      ['\u2022 small, exclusive, voluntary \u2014 protest organisations against the world or a lax church.',
       '\u2022 charismatic leader, high commitment, tension with surrounding society.',
       '\u2022 membership drawn (Niebuhr, Weber\u2019s deprived) from the marginal \u2014 the compensation reading; the sect holds the God who is THEIRS against the world\u2019s.']],
    [60, 504, 'CULT', AMBER,
      ['\u2022 loose, individualistic, client-based \u2014 a service on offer, not a demanding community.',
       '\u2022 no exclusive membership: participants shop, combine, leave.',
       '\u2022 Barker\u2019s moonies research and Wallis\u2019s world-affirming type: some cults are businesses of transcendence \u2014 techniques for sale.']],
    [514, 504, 'WALLIS\u2019S REPAIR (1984)', GREEN,
      ['\u2022 Troeltsch\u2019s grid missed the new era\u2019s movements, so Wallis re-cut by RELATION TO THE WORLD: world-rejecting (the sect\u2019s logic), world-affirming (technique and success: Scientology, the human potential market), world-accommodating (renewal within existing faiths).',
       '\u2022 the repair keeps the typology usable for NRMs instead of archiving it.']],
    [968, 504, 'NEW AGE AND BEYOND', DARK,
      ['\u2022 Heelas: the New Age \u2014 self-spirituality, experience over institution, bricolage of practices (tarot, mindfulness, crystals) with the self as the sacred object.',
       '\u2022 the cultural fit: exactly what a pick-and-choose consumer religiosity predicts (page 8\u2019s transformation record) \u2014 the typology\u2019s newest cell is the secularisation debate\u2019s own evidence.']],
  ];
  cells.forEach(([bx, by, hd, col, parts]) => {
    box(x, bx, by, pw, ph, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, pw, 8);
    text(x, hd, bx + pw / 2, by + 42, { size: 18, bold: true, color: col });
    let y = by + 76;
    parts.forEach(p => { y = wrap(x, p, bx + 22, bx + pw - 22, y, { size: 14.5, lh: 20 }) + 13; });
  });
  band(x, 878, 140, 'THE EXAMINABLE PATH',
    'Niebuhr\u2019s sect-to-denomination cycle (sect \u2192 respectability \u2192 denomination \u2192 new sect of protest) is the map\u2019s dynamics; the evaluation asks whether today\u2019s religious market still runs the cycle \u2014 or whether the pick-and-choose era (cults and New Age) has replaced organisation-building with organisation-shopping.',
    { size: 15.5, bodyY: 52 });
  return { file: 'wjec-soc-religious-organisations.png', w: W, h: HEIGHT };
}

const renderers = [d_religionTheories, d_secularisationDebate, d_religiousTypology];

module.exports = { run: (only) => run(renderers, only) };

if (require.main === module) {
  let only = [];
  try { only = String(process.env.RENDER_ONLY || '').split(',').map(s => s.trim()).filter(Boolean); } catch (e) { only = []; }
  run(renderers, only).then(files => console.log(JSON.stringify({ rendered: files })));
}