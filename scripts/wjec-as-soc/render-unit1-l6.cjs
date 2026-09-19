/*
 * Renders the four WJEC AS Sociology Lesson 6 (Formation and Change of Youth Cultures) diagrams.
 * Style matches render-unit1-l5.cjs (same helpers) so the set stays visually consistent.
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

// ---------- 1. Youth culture, subculture, counterculture (Lesson 6, page 2) ----------
function d_youthDistinctions() {
  const [c, x] = make(W, H);
  title2(x, 'Youth culture, subculture and counterculture');
  sub2(x, 'three ways of relating to the dominant culture (Clarke et al., Birmingham Centre, 1975)');
  const pw = 426, ph = 700, py = 130, xs = [60, 508, 956];
  const panels = [
    ['YOUTH CULTURE', BLUE, '#eff6ff', '#bfdbfe',
      'the shared age-based culture of the young as a whole — a culture of transition',
      [['a culture of transition', 'carries the young from family to adult society (Eisenstadt, 1956; Parsons, 1942)'],
       ['expressed in mass markets', 'records, clothes, coffee bars, apps — pitched at "the young" as a stage, not a class'],
       ['class-crossing by design', 'the teenage consumer bloc Abrams measured in 1959 crossed every class line']]],
    ['SUBCULTURE', RED, '#fef2f2', '#fecaca',
      'a distinctive culture within youth culture — class answers in style (CCCS, 1975)',
      [['a solution to class position', 'a "magical" symbolic answer to the squeeze between parent and dominant cultures (P. Cohen, 1972)'],
       ['style as meaning', 'bricolage and homology — the safety pin, the parka, the scooter (Hebdige, 1979)'],
       ['usually a moral panic', 'named and vilified by the press: teds, mods, skins, punks (Cohen, 1972)']]],
    ['COUNTERCULTURE', GREEN, '#f0fdf4', '#bbf7d0',
      'an oppositional culture — rejects the dominant culture outright',
      [['middle-class student base', 'the hippies: opting out of career and consumption from a position of security'],
       ['values inverted, not decorated', 'work ethic, career, monogamy rejected as such (Roszak, 1969)'],
       ['programmatic, not symbolic', 'proposed an alternative society — communes, alternative economics, Woodstock 1969']]],
  ];
  panels.forEach((p, i) => {
    const [hd, col, fill, stroke, claim, items] = p;
    const bx = xs[i];
    box(x, bx, py, pw, ph, { fill: '#f8fafc', stroke: LIGHT });
    x.fillStyle = col; x.fillRect(bx, py, pw, 8);
    text(x, hd, bx + pw / 2, py + 56, { size: 25, bold: true, color: col });
    wrap(x, claim, bx + 24, bx + pw - 24, py + 96, { size: 19, bold: true });
    let iy = py + 190;
    items.forEach(it => {
      box(x, bx + 22, iy, pw - 44, 140, { fill, stroke, lw: 1.5 });
      text(x, it[0], bx + pw / 2, iy + 32, { size: 18, bold: true, color: col });
      wrap(x, it[1], bx + 40, bx + pw - 40, iy + 62, { size: 15, lh: 21 });
      iy += 160;
    });
  });
  const by = 880;
  box(x, 60, by, W - 120, 150, { fill: '#fffbeb', stroke: '#fde68a', lw: 2 });
  text(x, 'KEY DISTINCTION', W / 2, by + 40, { size: 22, bold: true, color: AMBER });
  wrap(x, 'subcultures work within the dominant culture — winning space in it, in style; countercultures work against it — proposing an alternative to its values.', 110, W - 110, by + 74, { size: 19, lh: 27 });
  wrap(x, 'Both are youth-cultural formations; neither is "mere fashion" or "mere crime" — and youth culture in the broad sense contains both without reducing to either.', 110, W - 110, by + 116, { size: 17, lh: 23, color: GREY });
  return { file: 'wjec-soc-youth-distinctions.png', w: W, h: H };
}

// ---------- 2. The formation engine (Lesson 6, page 3) ----------
function d_formationFactors() {
  const [c, x] = make(W, H);
  title2(x, 'How youth cultures became possible: the formation engine');
  sub2(x, 'four structural changes made the young a distinct group — four lenses shaped what formed');
  const bw = 320, bh = 250, ty = 130, xs = [60, 396, 732, 1068];
  const tops = [
    ['EDUCATION', BLUE, '#eff6ff',
      'The 1944 Butler Act: leaving age to 15 (from 1947), then 16 in 1972 — for the first time most young people spent the week together, apart from adults, and left school into wage-earning adolescence.'],
    ['AFFLUENCE', GREEN, '#f0fdf4',
      'Full employment and rising wages: teenagers earning and — crucially — spending. Abrams, The Teenage Consumer (1959), measured them as a distinct spending bloc: clothes, records, coffee bars.'],
    ['LEISURE', AMBER, '#fffbeb',
      'Time and space apart from work and family — coffee bars, youth clubs, dance halls, record shops: places that belonged to the young, where a shared age culture could be lived.'],
    ['MEDIA', RED, '#fef2f2',
      'Records, radio, cinema and TV carried American youth styles to Britain almost instantly — Haley 1955, Elvis 1956 — distributing style nationwide the moment it formed.'],
  ];
  tops.forEach((t, i) => {
    const [hd, col, fill, body] = t;
    const bx = xs[i];
    box(x, bx, ty, bw, bh, { fill: '#f8fafc', stroke: LIGHT });
    x.fillStyle = col; x.fillRect(bx, ty, bw, 8);
    panelHeader(x, bx, ty + 52, i + 1, hd, col, 22);
    wrap(x, body, bx + 18, bx + bw - 18, ty + 92, { size: 16, lh: 23 });
  });
  // arrows down to outcome band
  xs.forEach(bx => arrow(x, bx + bw / 2, ty + bh + 12, ty + bh + 52, { color: GREY }));
  const oy = ty + bh + 64; // 444
  box(x, 60, oy, W - 120, 86, { fill: '#eff6ff', stroke: '#bfdbfe', lw: 2 });
  text(x, 'THE OUTCOME', W / 2, oy + 34, { size: 21, bold: true, color: BLUE });
  wrap(x, 'from the mid-1950s, youth as a distinct group — its own money, places, music and media: a culture pitched at a life-stage, not a class or a family.', 110, W - 110, oy + 64, { size: 18, lh: 24 });
  // shaping lenses
  const ly = 590, lh2 = 230;
  text(x, 'SHAPED THROUGH FOUR LENSES — what each society actually forms', W / 2, ly - 16, { size: 21, bold: true, color: PURPLE });
  const lenses = [
    ['CLASS', BLUE, 'teds, skins and punks were working-class; hippies were middle-class students — class decides what a wave expresses and in what register.'],
    ['GENDER', RED, 'street subcultures were male-coded; girls\u2019 cultures were relocated to the bedroom (McRobbie and Garber, 1976) and policed by the double standard.'],
    ['ETHNICITY', GREEN, 'Rastafari answered racial exclusion as a resistance identity; bhangra and grime made British-Asian and Black British youth cultures the dominant model missed.'],
    ['NATIONALITY', PURPLE, 'the Urdd built a Welsh-language youth culture from 1922; Cool Cymru made young Welshness a pop identity around devolution (1999).'],
  ];
  lenses.forEach((l, i) => {
    const [hd, col, body] = l;
    const bx = xs[i];
    box(x, bx, ly, bw, lh2, { fill: '#f8fafc', stroke: LIGHT });
    x.fillStyle = col; x.fillRect(bx, ly, bw, 8);
    text(x, hd, bx + bw / 2, ly + 46, { size: 21, bold: true, color: col });
    wrap(x, body, bx + 18, bx + bw - 18, ly + 82, { size: 15.5, lh: 22 });
  });
  const byy = 860;
  box(x, 60, byy, W - 120, 150, { fill: '#fffbeb', stroke: '#fde68a', lw: 2 });
  text(x, 'THE FORMATION PRINCIPLE', W / 2, byy + 40, { size: 21, bold: true, color: AMBER });
  wrap(x, 'the four structural changes are jointly sufficient and individually insufficient — a group schooled together without money, or with money but no age-segregated spaces, forms no youth culture.', 110, W - 110, byy + 74, { size: 18, lh: 26 });
  wrap(x, 'And every youth culture forms through the lenses below them — which is why formation is a sociological question, not a fashion question.', 110, W - 110, byy + 116, { size: 17, lh: 23, color: GREY });
  return { file: 'wjec-soc-formation-factors.png', w: W, h: H };
}

// ---------- 3. Timeline of British youth culture (Lesson 6, page 5) ----------
function d_youthTimeline() {
  const [c, x] = make(W, H);
  title2(x, 'Seven decades of youth culture in Britain');
  sub2(x, 'each wave = a class generation + a style + a media story');
  const axisY = 560;
  line(x, 70, axisY, W - 70, axisY, { color: '#94a3b8', width: 4 });
  const stops = [
    ['1950s', 'TEDDY BOYS', BLUE, 'Edwardian-revival drape coats; working-class wages; the first "folk devils" — a Savile Row style worn as defiance.'],
    ['1960s', 'MODS & ROCKERS + HIPPIES', RED, 'Clacton and Brighton, 1964: Cohen\u2019s media-created armies. By decade\u2019s end the middle-class hippie counterculture (Woodstock, 1969).'],
    ['1970s', 'SKINHEADS, THEN PUNK', GREEN, 'Hard mods ritualising the parent working class; then 1976\u201377 — recession, dole queues, "no future", semiotic warfare (Hebdige).'],
    ['1980s', 'CASUALS & GOTHS', PURPLE, 'Sportswear around football, style as territory; goth as a lasting taste-tribe — both media moralised.'],
    ['late 1980s\u201390s', 'RAVE / ACID HOUSE', AMBER, 'Second Summer of Love, 1988: warehouses, Ecstasy, the Criminal Justice Act 1994 — moral panic and commercialisation in one.'],
    ['2000s', 'GRIME & EMO', BLUE, 'Pirate radio and estate MC culture (Dizzee, Mercury Prize 2003); MySpace and YouTube diffuse styles digitally.'],
    ['2010s\u201320s', 'TIKTOK MICRO-STYLES', RED, 'Cottagecore, Y2K revival: global, seasonal, thin commitment — the "neo-tribe" condition at speed.'],
  ];
  const n = stops.length;
  const x0 = 130, step = (W - 260) / (n - 1);
  stops.forEach((s, i) => {
    const [decade, name, col, body] = s;
    const nx = x0 + i * step;
    circle(x, nx, axisY, 12, { fill: col, stroke: '#ffffff', width: 3 });
    const above = i % 2 === 0;
    const bw = 200;
    const top = above ? axisY - 60 : axisY + 90;
    // decade + name + wrapped body; blocks stacked away from the axis
    const yBase = above ? axisY - 92 : axisY + 122;
    line(x, nx, axisY + (above ? -14 : 14), nx, above ? yBase + 8 : yBase - 44, { color: '#cbd5e1', width: 2 });
    text(x, decade, nx, yBase - 16, { size: 20, bold: true, color: col });
    wrap(x, name, nx - bw / 2, nx + bw / 2, yBase + 8, { size: 15.5, bold: true, color: col, lh: 21 });
    wrap(x, body, nx - bw / 2, nx + bw / 2, yBase + 36, { size: 13.5, lh: 19 });
  });
  const by = 880;
  box(x, 60, by, W - 120, 150, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
  text(x, 'READING THE PATTERN', W / 2, by + 38, { size: 21, bold: true, color: BLUE });
  wrap(x, 'each wave is distinct enough to date, yet none lasts — style is renewable because each cohort meets a different economy;', 110, W - 110, by + 72, { size: 18, lh: 26 });
  wrap(x, 'the media role deepens decade by decade — from carrying style (1950s) to creating groups (1964) to being the scene itself (2020s); and class, gender and ethnicity set what each wave says.', 110, W - 110, by + 112, { size: 17, lh: 23, color: GREY });
  return { file: 'wjec-soc-youth-timeline.png', w: W, h: H };
}

// ---------- 4. The CCCS class model (Lesson 6, page 8) ----------
function d_classStyle() {
  const [c, x] = make(W, H);
  title2(x, 'The CCCS class model: from parent culture to subcultural style');
  sub2(x, 'Resistance through Rituals (Hall and Jefferson, 1975) and Hebdige (1979) — how class becomes style, and what happens to it');
  const steps = [
    ['PARENT CULTURE', BLUE, '#eff6ff', '#bfdbfe',
      'traditional working-class community — tight kinship, manual work, local loyalty, respectability: the world the parents know and promise.'],
    ['THE SQUEEZE', RED, '#fef2f2', '#fecaca',
      'redevelopment, deindustrialisation, rising aspirations: the world the parents promised no longer matches what the dominant culture offers (P. Cohen, 1972: East London mods).'],
    ['THE SUBCULTURE: A "MAGICAL SOLUTION"', GREEN, '#f0fdf4', '#bbf7d0',
      'the contradiction is resolved at the level of style — symbolic space is won back, territory defended, the conflict ritualised. Real in meaning; powerless in material life.'],
    ['STYLE AS MEANING', PURPLE, '#faf5ff', '#e9d5ff',
      'bricolage: ordinary objects recombined into charged meanings (safety pin, parka, scooter). Homology: the parts fit the values (Hebdige, 1979).'],
    ['INCORPORATION', AMBER, '#fffbeb', '#fde68a',
      'the dominant culture re-takes the style — commercially: fashion sells the safety pin; ideologically: the media relabel the group deviance or a fad. Then decline, and the next wave.'],
  ];
  const bw2 = 1000, bx = (W - bw2) / 2;
  let sy = 130;
  steps.forEach((s, i) => {
    const [hd, col, fill, stroke, body] = s;
    box(x, bx, sy, bw2, 118, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, sy, bw2, 8);
    panelHeader(x, bx, sy + 46, i + 1, hd, col, 21);
    wrap(x, body, bx + 90, bx + bw2 - 30, sy + 40, { size: 16.5, lh: 23 });
    if (i < steps.length - 1) arrow(x, W / 2, sy + 122, sy + 146, { color: GREY });
    sy += 148;
  });
  const by = sy + 8;
  box(x, 60, by, W - 120, 116, { fill: '#fffbeb', stroke: '#fde68a', lw: 2 });
  text(x, 'THE CRITIC BAND', W / 2, by + 36, { size: 20, bold: true, color: AMBER });
  wrap(x, 'the model tells one class story: girls were missing (McRobbie and Garber, 1976 — bedroom culture), ethnicity was marginal (Rastafari, bhangra, grime), and by the 1990s many scenes were not "about" class at all (Bennett, 1999).', 110, W - 110, by + 68, { size: 16.5, lh: 23 });
  return { file: 'wjec-soc-class-style.png', w: W, h: H };
}

(async () => {
  fs.mkdirSync(DIR, { recursive: true });
  const renderers = [d_youthDistinctions, d_formationFactors, d_youthTimeline, d_classStyle];
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