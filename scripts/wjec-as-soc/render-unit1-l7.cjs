/*
 * Renders the four WJEC AS Sociology Lesson 7 (Youth Subcultures, Deviance and Theory) diagrams.
 * Style matches render-unit1-l5/l6.cjs (same helpers) so the set stays visually consistent.
 * Output: public/lesson-assets/wjec-as-sociology/.
 * Usage: exported run([file,...]) for on-demand rendering; RENDER_ONLY env when run directly.
 */
const K = require('../sas-chem/common.cjs');
const fs = require('fs');
const path = require('path');
const { text, circle, line, arrow, arrowHead, C } = K;
let __canvas = null;
function make(w, h) { const pair = K.make(w, h); __canvas = pair[0]; return pair; }

const W = 1448, H = 1086;
const DIR = path.resolve(process.cwd(), 'public/lesson-assets/wjec-as-sociology');
const BLUE = '#1d4ed8', RED = '#dc2626', AMBER = '#b45309', GREY = '#64748b',
      LIGHT = '#e2e8f0', SOFT = '#475569', GREEN = '#15803d', PURPLE = '#7c3aed',
      DARK = '#0f172a';

function box(x, tx, ty, w, h, o = {}) {
  x.fillStyle = o.fill || '#f8fafc';
  x.fillRect(tx, ty, w, h);
  x.strokeStyle = o.stroke || '#e2e8f0';
  x.lineWidth = o.lw || 2;
  x.strokeRect(tx, ty, w, h);
}
function title2(x, s) { text(x, s, W / 2, 46, { size: 32, bold: true }); }
function sub2(x, s) { text(x, s, W / 2, 88, { size: 20, color: GREY }); }
function panelHeader(x, px, py, num, name, col, nameSize) {
  circle(x, px + 52, py, 20, { fill: col || BLUE, stroke: false });
  text(x, String(num), px + 52, py + 1, { size: 22, bold: true, color: '#fff' });
  text(x, name, px + 62, py, { size: nameSize || 26, bold: true, align: 'left' });
}
// centred wrapped paragraph text inside [x0,x1]; returns next y
function wrap(x, s, x0, x1, y, o = {}) {
  const size = o.size || 21, lh = o.lh || size * 1.42;
  x.font = `${o.bold ? 'bold ' : ''}${size}px DV`;
  const maxW = x1 - x0, words = String(s).split(' ');
  let ln = '', yy = y, lines = [];
  for (const wd of words) {
    const t = ln ? ln + ' ' + wd : wd;
    if (x.measureText(t).width > maxW && ln) { lines.push(ln); ln = wd; } else ln = t;
  }
  if (ln) lines.push(ln);
  lines.forEach((L, i) => text(x, L, (x0 + x1) / 2, yy + i * lh, { size, color: o.color || SOFT, align: 'center', bold: o.bold }));
  return yy + lines.length * lh;
}

// ---------- 1. Deviance amplification spiral (Lesson 7, page 7) ----------
function d_amplificationSpiral() {
  const [c, x] = make(W, H);
  title2(x, 'The deviance amplification spiral');
  sub2(x, 'Stan Cohen, Folk Devils and Moral Panics (1972) — the spiral Wilkins (1964) modelled, demonstrated');
  const bw = 580, bh = 195;
  const LX = 70, RX = 798;
  const LY = [150, 415, 680], RY = [680, 415, 150];
  const nodes = [
    [LX, LY[0], 1, 'THE EVENT', BLUE, '#eff6ff', '#bfdbfe',
      'a minor, ambiguous bank-holiday scuffle — Clacton, Easter 1964: fewer than a hundred arrests, no serious injuries, a wrecked resort season\u2019s worth of deckchairs.'],
    [LX, LY[1], 2, 'THE INVENTORY', RED, '#fef2f2', '#fecaca',
      'symbolic, exaggerated coverage: symbols are picked, imagery condensed, resonance found — \u201cday of terror\u201d headlines; a "war between two armies" is narrated into being.'],
    [LX, LY[2], 3, 'THE FOLK DEVIL', AMBER, '#fffbeb', '#fde68a',
      'a named, visible enemy in uniform — \u201cthe mods\u201d, \u201cthe rockers\u201d: deviancy is stereotyped, and any young person in the right clothes can now be read as a threat on sight.'],
    [RX, RY[0], 4, 'SENSITISATION \u2192 MORAL PANIC', PURPLE, '#faf5ff', '#e9d5ff',
      'every scuffle is now read through the stereotype; editors and MPs demand action — concern, hostility, consensus, disproportionality, volatility (Goode and Ben-Yehuda).'],
    [RX, RY[1], 5, 'THE CONTROL CULTURE RESPONDS', GREEN, '#f0fdf4', '#bbf7d0',
      'police meet the trains at the resorts; courts pass exemplary sentences; more patrols find more to arrest — the apparatus of control arrives expecting armies.'],
    [RX, RY[2], 6, 'DEVIANCE BECOMES MORE REAL', DARK, '#f8fafc', '#cbd5e1',
      'marginal youths adopt the offered identity — notoriety is subcultural capital; police and courts produce armies\u2019 worth of arrests that \u201cprove\u201d the panic right.'],
  ];
  nodes.forEach(n => {
    const [bx, by, num, hd, col, fill, stroke, body] = n;
    box(x, bx, by, bw, bh, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, bw, 8);
    panelHeader(x, bx, by + 52, num, hd, col, 20);
    wrap(x, body, bx + 90, bx + bw - 26, by + 44, { size: 16, lh: 23 });
  });
  // loop arrows: down the left column, across the bottom, up the right column, back across the top
  arrow(x, LX + bw / 2, LY[0] + bh + 6, LX + bw / 2, LY[1] - 6, { color: GREY });
  arrow(x, LX + bw / 2, LY[1] + bh + 6, LX + bw / 2, LY[2] - 6, { color: GREY });
  arrow(x, LX + bw + 8, LY[2] + bh / 2, RX - 8, LY[2] + bh / 2, { color: GREY });
  arrow(x, RX + bw / 2, RY[0] - 6, RX + bw / 2, RY[1] + bh + 6, { color: GREY });
  arrow(x, RX + bw / 2, RY[1] - 6, RX + bw / 2, RY[2] + bh + 6, { color: GREY });
  arrow(x, RX - 8, RY[2] + bh / 2, LX + bw + 8, RY[2] + bh / 2, { color: GREY });
  wrap(x, 'the next bank holiday begins where the last one\u2019s headlines ended', LX + bw + 20, RX - 20, RY[2] + bh / 2 - 24, { size: 13, color: GREY });
  const byy = 920;
  box(x, 60, byy, W - 120, 130, { fill: '#fffbeb', stroke: '#fde68a', lw: 2 });
  text(x, 'THE MEASURED SPIRAL, 1964\u201366', W / 2, byy + 34, { size: 20, bold: true, color: AMBER });
  wrap(x, 'arrests and confrontations rose season by season as coverage and policing rose — the reaction produced more of the deviance it feared;', 110, W - 110, byy + 66, { size: 17, lh: 24 });
  wrap(x, 'the folk-devil stage is a label applied to a whole age group at once — page 9\u2019s labelling theory is this spiral\u2019s slow-motion version.', 110, W - 110, byy + 94, { size: 15, lh: 21, color: GREY });
  return { file: 'wjec-soc-amplification-spiral.png', w: W, h: H };
}

// ---------- 2. The age–crime curve (Lesson 7, page 2) ----------
function d_ageCrimeCurve() {
  const [c, x] = make(W, H);
  title2(x, 'The age–crime curve (stylised)');
  sub2(x, 'proven offending by age, England and Wales — the most replicated pattern in British criminology');
  const px0 = 150, px1 = 1320, pyTop = 190, pyBase = 880;
  // axes
  line(x, px0, pyBase, px1, pyBase, { color: '#94a3b8', width: 3 });
  line(x, px0, pyTop, px0, pyBase, { color: '#94a3b8', width: 3 });
  text(x, 'relative rate of proven offending \u2192', px0 + 14, pyTop - 18, { size: 16, bold: true, color: SOFT, align: 'left' });
  // age ticks 10..60 every 5
  const aMin = 10, aMax = 60;
  const ax = age => px0 + (age - aMin) * (px1 - px0) / (aMax - aMin);
  for (let age = aMin; age <= aMax; age += 5) {
    line(x, ax(age), pyBase, ax(age), pyBase + 8, { color: '#94a3b8', width: 2 });
    text(x, String(age), ax(age), pyBase + 30, { size: 15, color: SOFT });
  }
  text(x, 'age \u2192', (px0 + px1) / 2, pyBase + 62, { size: 17, bold: true, color: SOFT });
  // horizontal gridlines
  const vy = v => pyBase - v * (pyBase - pyTop - 20);
  [0.25, 0.5, 0.75, 1.0].forEach(v => {
    line(x, px0, vy(v), px1, vy(v), { color: '#e2e8f0', width: 1.5 });
    text(x, String(v), px0 - 30, vy(v), { size: 14, color: GREY });
  });
  // stylised curve: rate by age (rise to peak 17.5, skewed decline)
  const rate = age => {
    if (age <= 17.5) {
      const t = (age - 10) / 7.5;
      return 0.05 + 0.95 * Math.pow(t, 1.6);
    }
    const d = age - 17.5;
    return Math.max(0.06, 0.95 * Math.exp(-d / 9) + 0.05);
  };
  const pts = [];
  for (let age = aMin; age <= aMax; age += 0.5) pts.push([ax(age), vy(rate(age))]);
  // fill area under curve
  x.beginPath();
  x.moveTo(pts[0][0], pyBase);
  pts.forEach(p => x.lineTo(p[0], p[1]));
  x.lineTo(pts[pts.length - 1][0], pyBase);
  x.closePath();
  x.fillStyle = '#dbeafe';
  x.fill();
  // curve line
  x.beginPath();
  pts.forEach((p, i) => (i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])));
  x.strokeStyle = BLUE;
  x.lineWidth = 5;
  x.stroke();
  // peak marker + annotation
  const pkx = ax(17.5), pky = vy(1.0);
  circle(x, pkx, pky, 9, { fill: RED, stroke: '#fff', width: 3 });
  arrow(x, pkx + 30, pky - 90, pkx + 6, pky - 14, { color: RED });
  wrap(x, 'PEAK YEARS: MID-TO-LATE TEENS — visibility in public space, peer time, and few stakes to lose', pkx + 40, px1 - 30, pky - 122, { size: 16, bold: true, color: RED });
  // ageing out annotation
  const ax25 = ax(27), ay25 = vy(rate(27));
  arrow(x, ax25 - 20, ay25 - 70, ax25 + 4, ay25 - 12, { color: GREEN });
  wrap(x, 'AGEING OUT: work, partners, children — stakes convert most away from offending through the twenties', px0 + 60, ax25 - 30, ay25 - 104, { size: 16, bold: true, color: GREEN });
  // young men / young women note
  wrap(x, 'young men dominate the peak; recorded female offending peaks slightly earlier and at a far lower level', px0 + 60, px1 - 30, pyBase - 28, { size: 15, color: GREY });
  // bottom band
  const byy = 950;
  box(x, 60, byy, W - 120, 110, { fill: '#fffbeb', stroke: '#fde68a', lw: 2 });
  wrap(x, 'THREE FINDINGS, ONE CAUTION — the curve is the most replicated pattern in official data; self-report studies spread offending more evenly across ages and classes; and the dark figure means the curve partly measures policing as well as behaviour: proven offending bundles what the young do with what the police look for.', 100, W - 100, byy + 30, { size: 16, lh: 23 });
  return { file: 'wjec-soc-age-crime-curve.png', w: W, h: H };
}

// ---------- 3. The deviance ladder (Lesson 7, page 3) ----------
function d_devianceLadder() {
  const [c, x] = make(W, H);
  title2(x, 'The deviance ladder: from style to crime');
  sub2(x, 'the deviance inside youth subcultures, as a sequence of escalating responses');
  const bw = 640, bh = 205;
  const steps = [
    [60, 700, 1, 'INFORMAL DEVIANCE — STYLE AND RITUAL', BLUE, '#eff6ff', '#bfdbfe',
      'dress, slang, music, territory-as-display: the ted\u2019s drape, the punk\u2019s safety pin, the goth\u2019s black. Breaks norms, not law. Policed by disapproval, exclusions, being moved on.'],
    [252, 520, 2, 'PUBLIC-ORDER OFFENDING', GREEN, '#f0fdf4', '#bbf7d0',
      'petty vandalism, graffiti, fighting, underage drinking. Criminal but minor — and heavily policed precisely because the young are visible in public space.'],
    [444, 340, 3, 'SUBCULTURAL CRIME', AMBER, '#fffbeb', '#fde68a',
      'offending organised by the group\u2019s own identity: football casuals\u2019 matchday confrontations; rave\u2019s unauthorised parties and drug markets. The law now names the subculture — CJA 1994, s.63: \u201crepetitive beats\u201d.'],
    [636, 160, 4, 'CAREERS OF DEVIANCE (A MINORITY)', RED, '#fef2f2', '#fecaca',
      'exclusion from school, work and lawful leisure closes legitimate options; offending organises around a deviant identity (secondary deviance), and the record follows the person.'],
  ];
  steps.forEach(s => {
    const [bx, by, num, hd, col, fill, stroke, body] = s;
    box(x, bx, by, bw, bh, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, bw, 8);
    panelHeader(x, bx, by + 50, num, hd, col, 19);
    wrap(x, body, bx + 88, bx + bw - 24, by + 44, { size: 15.5, lh: 22 });
  });
  // ascending arrows between steps
  for (let i = 0; i < 3; i++) {
    const [bx, by] = [steps[i][0], steps[i][1]];
    const [nx, ny] = [steps[i + 1][0], steps[i + 1][1]];
    arrow(x, bx + bw - 16, by + 16, nx + 40, ny + bh - 12, { color: GREY });
  }
  const byy = 930;
  box(x, 60, byy, W - 120, 120, { fill: '#fffbeb', stroke: '#fde68a', lw: 2 });
  text(x, 'THE LADDER IS NOT A TRACK', W / 2, byy + 32, { size: 20, bold: true, color: AMBER });
  wrap(x, 'most young people stop at step 1 — even in the peak years of the age–crime curve, most teenagers commit no recordable offence. What changes most between the rungs is who is responding: parents, then police, then courts, then the record. The sociological question is why a few climb — every perspective in this chapter is a rival answer.', 110, W - 110, byy + 62, { size: 16, lh: 22 });
  return { file: 'wjec-soc-deviance-ladder.png', w: W, h: H };
}

// ---------- 4. The five-perspective comparison map (Lesson 7, page 13) ----------
function d_devianceTheories() {
  const [c, x] = make(W, H);
  title2(x, 'Youth subcultures and deviance: the five perspectives compared');
  sub2(x, 'why does youthful deviance exist? why is it over-policed? what should change? — the same three questions of each theory');
  const top = [
    ['FUNCTIONALIST', BLUE, '#eff6ff', '#bfdbfe',
      'deviance is strain between goals and means; delinquent subcultures solve status frustration; and deviance performs functions — boundary maintenance, adaptation.',
      'Merton 1938 · A. Cohen 1955 · Cloward & Ohlin 1960 · Durkheim 1895 · Erikson 1966',
      'assumes value consensus — whose boundaries? One tool cannot cover behaviour and reaction.'],
    ['MARXIST', RED, '#fef2f2', '#fecaca',
      'rules are written by the dominant class; subcultures are symbolic working-class resistance, re-taken by incorporation; panics displace structural crisis onto folk devils.',
      'CCCS 1975 · Hebdige 1979 · Hall et al. 1978 · CJA 1994',
      'deterministic; not every panic is a class panic; neglects gender.'],
    ['INTERACTIONIST', GREEN, '#f0fdf4', '#bbf7d0',
      'deviance is a label applied by audiences with power; primary becomes secondary deviance; the reaction — not the behaviour — is the decisive variable, and it amplifies.',
      'Becker 1963 · Lemert 1951 · S. Cohen 1972 · Wilkins 1964',
      'cannot explain the origins of primary deviance; under-theorises power.'],
  ];
  const bottom = [
    ['FEMINIST', PURPLE, '#faf5ff', '#e9d5ff',
      'deviance is gendered: girls are controlled into invisibility (bedroom culture) while boys\u2019 offending accomplishes masculinity; girls\u2019 deviance is sexualised and hidden.',
      'McRobbie & Garber 1976 · Heidensohn 1985 · Messerschmidt 1993 · Chesney-Lind',
      'control explains only part of the gender gap; needs intersection with race and class.'],
    ['POSTMODERNIST', AMBER, '#fffbeb', '#fde68a',
      'subcultures were always partly media constructs; styles are now fluid, elective neo-tribes; deviance circulates as mediated display — the video and the panic are one circuit.',
      'Hebdige 1979 · Redhead 1995 · Maffesoli 1996 · Bennett 1999',
      'the realist reply: policing still sorts by class and race — drill\u2019s treatment fell on Black working-class youth.'],
  ];
  const pw = 426, ph = 400;
  const drawPanel = (p, bx, by) => {
    const [hd, col, fill, stroke, claim, studies, limit] = p;
    box(x, bx, by, pw, ph, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, pw, 8);
    text(x, hd, bx + pw / 2, by + 48, { size: 23, bold: true, color: col });
    text(x, 'CLAIM', bx + pw / 2, by + 84, { size: 15, bold: true, color: GREY });
    wrap(x, claim, bx + 22, bx + pw - 22, by + 108, { size: 15, lh: 21 });
    box(x, bx + 18, by + 218, pw - 36, 52, { fill, stroke, lw: 1.5 });
    wrap(x, studies, bx + 30, bx + pw - 30, by + 232, { size: 13.5, lh: 19, bold: true, color: col });
    text(x, 'MAIN LIMITATION', bx + pw / 2, by + 294, { size: 15, bold: true, color: GREY });
    wrap(x, limit, bx + 22, bx + pw - 22, by + 318, { size: 14, lh: 20 });
  };
  top.forEach((p, i) => drawPanel(p, [60, 508, 956][i], 130));
  bottom.forEach((p, i) => drawPanel(p, [284, 732][i], 560));
  const byy = 990;
  box(x, 60, byy, W - 120, 76, { fill: '#fffbeb', stroke: '#fde68a', lw: 2 });
  text(x, 'ASSESSMENT RULE', W / 2, byy + 26, { size: 18, bold: true, color: AMBER });
  wrap(x, 'outline (claim + named study) \u2192 apply (one dated youth case) \u2192 evaluate (the limitation + which theory does this job better).', 110, W - 110, byy + 52, { size: 15.5, lh: 20 });
  return { file: 'wjec-soc-deviance-theories.png', w: W, h: H };
}

const renderers = [d_amplificationSpiral, d_ageCrimeCurve, d_devianceLadder, d_devianceTheories];

async function run(only) {
  fs.mkdirSync(DIR, { recursive: true });
  const results = [];
  for (const r of renderers) {
    __canvas = null;
    const meta = r();
    if (only && only.length && !only.includes(meta.file)) continue;
    if (!__canvas) throw new Error('renderer produced no canvas: ' + meta.file);
    await K.save(__canvas, meta.file, DIR);
    results.push(meta.file);
  }
  return results;
}

module.exports = { run };

if (require.main === module) {
  let only = [];
  try { only = String(process.env.RENDER_ONLY || '').split(',').map(s => s.trim()).filter(Boolean); } catch (e) { only = []; }
  run(only).then(files => console.log(JSON.stringify({ rendered: files })));
}