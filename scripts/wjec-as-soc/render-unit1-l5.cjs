/*
 * Renders the three WJEC AS Sociology Lesson 5 (Relationships and Theories of Families) diagrams.
 * Style matches render-unit1.cjs (same helpers) so the set stays visually consistent.
 * Output: public/lesson-assets/wjec-as-sociology/. Supports RENDER_ONLY=[file1,file2].
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
      LIGHT = '#e2e8f0', SOFT = '#475569', GREEN = '#15803d', PURPLE = '#7c3aed';

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

// ---------- 1. Segregated and joint conjugal roles (Lesson 5, page 2) ----------
function d_conjugalRoles() {
  const [c, x] = make(W, H);
  title2(x, 'Segregated and joint conjugal roles');
  sub2(x, "who does what inside the couple — Bott's classic contrast and the symmetry debate");
  // two comparison panels
  const py = 130, ph = 400, pw = 660;
  // left: segregated
  box(x, 60, py, pw, ph, { fill: '#f8fafc', stroke: LIGHT });
  x.fillStyle = RED; x.fillRect(60, py, pw, 8);
  panelHeader(x, 60, py + 52, 1, 'SEGREGATED ROLES', RED);
  wrap(x, "a clear division — his sphere and hers (Bott, 1957: dense kin networks, working-class couples)", 100, 700, py + 108, { size: 20, color: GREY });
  const seg = [
    ['breadwinner and homemaker', 'paid work is his; housework, childcare and kin-keeping are hers'],
    ['separate leisure', 'nights out and friendships run separately — his pub, her relatives'],
    ['domestic isolation', 'the full-time housewife alone at home — the theme Friedan named "the problem that has no name"'],
  ];
  seg.forEach((e, i) => {
    const by = py + 160 + i * 78;
    box(x, 100, by, pw - 80, 66, { fill: '#fef2f2', stroke: '#fecaca', lw: 1.5 });
    text(x, e[0], 120, by + 22, { size: 20, bold: true, align: 'left', color: RED });
    text(x, e[1], 120, by + 47, { size: 17, align: 'left', color: SOFT });
  });
  // right: joint
  const px2 = 728;
  box(x, px2, py, pw, ph, { fill: '#f8fafc', stroke: LIGHT });
  x.fillStyle = GREEN; x.fillRect(px2, py, pw, 8);
  panelHeader(x, px2, py + 52, 2, 'JOINT ROLES', GREEN);
  wrap(x, 'shared tasks, decisions and leisure (Bott, 1957: dispersed, chosen networks)', px2 + 40, px2 + pw - 40, py + 108, { size: 20, color: GREY });
  const jnt = [
    ['both in paid work', 'the dual-earner couple is now the majority pattern among couples'],
    ['tasks shared or swapped', 'housework and childcare divided by time and preference, not by sex'],
    ['companionship', 'couples socialise together — Bott\u2019s classic marker of jointness'],
  ];
  jnt.forEach((e, i) => {
    const by = py + 160 + i * 78;
    box(x, px2 + 40, by, pw - 80, 66, { fill: '#f0fdf4', stroke: '#bbf7d0', lw: 1.5 });
    text(x, e[0], px2 + 60, by + 22, { size: 20, bold: true, align: 'left', color: GREEN });
    text(x, e[1], px2 + 60, by + 47, { size: 17, align: 'left', color: SOFT });
  });
  // bottom band: symmetry debate
  const by2 = 570, bh = 460;
  box(x, 60, by2, W - 120, bh, { fill: '#fff', stroke: LIGHT, lw: 2 });
  x.fillStyle = PURPLE; x.fillRect(60, by2, W - 120, 8);
  text(x, 'THE SYMMETRY DEBATE — the claim and the rebuttal', 60 + (W - 120) / 2, by2 + 50, { size: 25, bold: true, color: PURPLE });
  // left half of band: Y&W claim
  const blw = (W - 120 - 60) / 2;
  box(x, 100, by2 + 86, blw, 200, { fill: '#eff6ff', stroke: '#bfdbfe', lw: 1.5 });
  text(x, 'THE CLAIM — Young and Willmott (1973)', 100 + blw / 2, by2 + 126, { size: 21, bold: true, color: BLUE });
  wrap(x, 'the "symmetrical family": a march of progress has made roles alike — home-centred, shared leisure, both partners earning, and husbands doing domestic tasks too', 124, 100 + blw - 24, by2 + 162, { size: 19 });
  // right half: Oakley rebuttal
  const brx = 100 + blw + 60;
  box(x, brx, by2 + 86, blw, 200, { fill: '#fef2f2', stroke: '#fecaca', lw: 1.5 });
  text(x, 'THE REBUTTAL — Oakley (1974)', brx + blw / 2, by2 + 126, { size: 21, bold: true, color: RED });
  wrap(x, 'only a small minority of husbands took a genuine share of housework, and mostly the non-routine tasks: helping is not sharing, and the responsibility remained the wife\u2019s', brx + 24, brx + blw - 24, by2 + 162, { size: 19 });
  // arrow between claim and verdict
  arrow(x, 100 + blw / 2, by2 + 296, 100 + blw / 2, by2 + 322, { color: GREY, lw: 3 });
  arrow(x, brx + blw / 2, by2 + 296, brx + blw / 2, by2 + 322, { color: GREY, lw: 3 });
  // verdict strip
  box(x, 100, by2 + 330, W - 240, 106, { fill: '#fffbeb', stroke: '#fde68a', lw: 2 });
  text(x, 'THE EVIDENCE TODAY', 100 + (W - 240) / 2, by2 + 368, { size: 20, bold: true, color: AMBER });
  wrap(x, 'ONS time-use: women\u2019s unpaid household work runs at about 26 hours a week against about 16 for men — about 60 per cent more, narrowing by cohort. Direction real; destination contested — that pair is the assessment answer.', 130, W - 130, by2 + 398, { size: 18 });
  return { file: 'wjec-soc-conjugal-roles.png', w: W, h: H };
}

// ---------- 2. Household power: decisions and money (Lesson 5, page 4) ----------
function d_householdPower() {
  const [c, x] = make(W, H);
  title2(x, 'Power inside the household');
  sub2(x, "who decides — and who controls the money: Edgell's tiers and Pahl's systems");
  // left panel: Edgell
  const py = 130, ph = 430, pw = 660;
  box(x, 60, py, pw, ph, { fill: '#f8fafc', stroke: LIGHT });
  x.fillStyle = BLUE; x.fillRect(60, py, pw, 8);
  panelHeader(x, 60, py + 52, 1, 'WHO DECIDES', BLUE);
  wrap(x, 'Edgell (1980): the hierarchy of household decisions', 100, 700, py + 104, { size: 20, color: GREY });
  const tiers = [
    ['VERY IMPORTANT — husband alone', 'his job, a house move, major finance: taken without discussion', RED, '#fef2f2', '#fecaca'],
    ['IMPORTANT — joint', 'children\u2019s schooling, holidays, large purchases: discussed and agreed', BLUE, '#eff6ff', '#bfdbfe'],
    ['LESS IMPORTANT — wife alone', 'food, children\u2019s clothes, home decoration: delegated to her', GREEN, '#f0fdf4', '#bbf7d0'],
  ];
  tiers.forEach((t, i) => {
    const by = py + 146 + i * 88;
    box(x, 100, by, pw - 80, 74, { fill: t[3], stroke: t[4], lw: 1.5 });
    text(x, t[0], 120, by + 25, { size: 20, bold: true, align: 'left', color: t[2] });
    text(x, t[1], 120, by + 52, { size: 17, align: 'left', color: SOFT });
  });
  // right panel: Pahl
  const px2 = 728;
  box(x, px2, py, pw, ph, { fill: '#f8fafc', stroke: LIGHT });
  x.fillStyle = PURPLE; x.fillRect(px2, py, pw, 8);
  panelHeader(x, px2, py + 52, 2, 'WHO CONTROLS THE MONEY', PURPLE);
  wrap(x, 'Pahl (1989): four money-management systems', px2 + 40, px2 + pw - 40, py + 104, { size: 20, color: GREY });
  const sys = [
    ['WHOLE WAGE', 'all income managed by one partner — historically often the wife'],
    ['HOUSEKEEPING ALLOWANCE', 'a fixed sum for the home; the other partner keeps the rest'],
    ['POOLING', 'a joint pot, the most common — but a joint account is not a shared say'],
    ['INDEPENDENT MANAGEMENT', 'each keeps their own income and contributes by arrangement'],
  ];
  sys.forEach((s, i) => {
    const by = py + 146 + i * 68;
    box(x, px2 + 40, by, pw - 80, 56, { fill: '#faf5ff', stroke: '#e9d5ff', lw: 1.5 });
    text(x, s[0], px2 + 60, by + 20, { size: 18, bold: true, align: 'left', color: PURPLE });
    text(x, s[1], px2 + 60, by + 42, { size: 15.5, align: 'left', color: SOFT });
  });
  // bottom band: two explanations
  const by2 = 600, bh = 430;
  box(x, 60, by2, W - 120, bh, { fill: '#fff', stroke: LIGHT, lw: 2 });
  x.fillStyle = AMBER; x.fillRect(60, by2, W - 120, 8);
  text(x, 'TWO EXPLANATIONS OF HOUSEHOLD POWER', 60 + (W - 120) / 2, by2 + 48, { size: 24, bold: true, color: AMBER });
  const blw = (W - 120 - 60) / 2;
  box(x, 100, by2 + 84, blw, 210, { fill: '#eff6ff', stroke: '#bfdbfe', lw: 1.5 });
  text(x, 'RESOURCES', 100 + blw / 2, by2 + 122, { size: 21, bold: true, color: BLUE });
  wrap(x, 'Blood and Wolfe (1960): power follows what each partner brings in — the bigger earner wields the bigger say. Male advantage is then an effect of economic advantage, and should shrink as wives\u2019 earnings rise.', 124, 100 + blw - 24, by2 + 158, { size: 19 });
  const brx = 100 + blw + 60;
  box(x, brx, by2 + 84, blw, 210, { fill: '#f0fdf4', stroke: '#bbf7d0', lw: 1.5 });
  text(x, 'GENDER NORMS', brx + blw / 2, by2 + 122, { size: 21, bold: true, color: GREEN });
  wrap(x, 'The male-breadwinner idea legitimates male authority even where wives earn similarly. If norms are decisive, power persists until ideology changes — which is what dual-earner gaps suggest.', brx + 24, brx + blw - 24, by2 + 158, { size: 19 });
  box(x, 100, by2 + 322, W - 240, 78, { fill: '#fffbeb', stroke: '#fde68a', lw: 2 });
  text(x, 'A WARNING FOR METHOD', 100 + (W - 240) / 2, by2 + 352, { size: 18, bold: true, color: AMBER });
  wrap(x, 'household statistics treat the household as one unit — intra-household inequality is invisible unless the research asks inside it, which is what Edgell\u2019s and Pahl\u2019s studies do.', 130, W - 130, by2 + 374, { size: 17 });
  return { file: 'wjec-soc-household-power.png', w: W, h: H };
}

// ---------- 3. Theories of the family map (Lesson 5, page 11) ----------
function d_theoriesFamily() {
  const [c, x] = make(W, H);
  title2(x, 'The family through four pairs of glasses');
  sub2(x, 'four theoretical traditions — claim, researcher, critic');
  const panels = [
    [60, 130, 'FUNCTIONALISM', BLUE, '#eff6ff', '#bfdbfe',
      'the family works for everyone — a functional unit maintaining society',
      'Murdock: four universal functions (sexual, reproductive, economic, educational). Parsons: instrumental and expressive roles fit a working man and a home-based woman.',
      'Critique: assumes consensus — and what it calls complementary roles are unequal roles (Oakley).'],
    [728, 130, 'MARXISM', RED, '#fef2f2', '#fecaca',
      'the family reproduces capitalism — and masks the fact',
      'Zaretsky: the family is a "haven" absorbing workers\u2019 frustrations. Delphy and Leonard: unpaid domestic labour is familiar exploitation; the family is a unit of consumption.',
      'Critique: the class lens misses gender and race — and family life serves its members too.'],
    [60, 560, 'FEMINISM', PURPLE, '#faf5ff', '#e9d5ff',
      'family relationships reproduce patriarchy — men\u2019s power over women',
      'Oakley on housework, Pahl on money, Millett on male dominance; difference feminists (Mirza): for some, family is a refuge from racism, not a prison.',
      'Critique: overgeneralises — experiences vary by class and ethnicity (intersectionality).'],
    [728, 560, 'PERSONAL LIFE & POSTMODERN', GREEN, '#f0fdf4', '#bbf7d0',
      'families are chosen, negotiated and revisable — made, not given',
      'Smart: relationships, memories and meaning beyond the household. Giddens: the pure relationship lasts only while it satisfies both. Beck-Gernsheim: the normal chaos of love.',
      'Critique: "choice" is constrained by money, gender and coercion — equality of choice is unequal.'],
  ];
  const pw = 660, ph = 410;
  panels.forEach(p => {
    const [bx, by, hd, col, fill, stroke, claim, names, crit] = p;
    box(x, bx, by, pw, ph, { fill: '#f8fafc', stroke: LIGHT });
    x.fillStyle = col; x.fillRect(bx, by, pw, 8);
    text(x, hd, bx + pw / 2, by + 52, { size: 25, bold: true, color: col });
    wrap(x, claim, bx + 30, bx + pw - 30, by + 92, { size: 21, bold: true });
    box(x, bx + 30, by + 150, pw - 60, 168, { fill, stroke, lw: 1.5 });
    wrap(x, names, bx + 52, bx + pw - 52, by + 176, { size: 18, lh: 26 });
    box(x, bx + 30, by + 334, pw - 60, 56, { fill: '#fffbeb', stroke: '#fde68a', lw: 1.5 });
    wrap(x, crit, bx + 52, bx + pw - 52, by + 350, { size: 17, lh: 23 });
  });
  // bottom strip
  const by3 = 1000;
  box(x, 60, by3, W - 120, 56, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
  wrap(x, 'Use the map like this: name the claim, name a researcher, then weigh the critic line — that chain is an evaluation paragraph.', 90, W - 90, by3 + 22, { size: 18, color: GREY });
  return { file: 'wjec-soc-theories-family.png', w: W, h: H };
}

(async () => {
  fs.mkdirSync(DIR, { recursive: true });
  const renderers = [d_conjugalRoles, d_householdPower, d_theoriesFamily];
  const only = (process.env.RENDER_ONLY || '').split(',').map(s => s.trim()).filter(Boolean);
  const results = [];
  for (const r of renderers) {
    __canvas = null;
    const meta = r();
    if (only.length && !only.includes(meta.file)) continue;
    if (!__canvas) throw new Error('renderer produced no canvas: ' + meta.file);
    K.save(__canvas, meta.file, DIR);
    results.push(meta);
  }
  console.log(JSON.stringify({ rendered: results.map(m => m.file) }));
})();