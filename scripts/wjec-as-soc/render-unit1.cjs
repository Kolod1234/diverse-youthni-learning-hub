/*
 * Renders the nine WJEC AS Sociology Unit 1 diagrams as PNGs.
 * Style matches the existing app diagrams (scripts/render-sas35-heat.cjs, canvas helpers
 * from scripts/sas-chem/common.cjs). Output: public/lesson-assets/wjec-as-sociology/.
 * Supports RENDER_ONLY=[file1,file2] to render a subset.
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
function panelHeader(x, px, py, num, name, col) {
  circle(x, px + 52, py, 20, { fill: col || BLUE, stroke: false });
  text(x, String(num), px + 52, py + 1, { size: 22, bold: true, color: '#fff' });
  text(x, name, px + 62, py, { size: 26, bold: true, align: 'left' });
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

// ---------- 1. Components of culture (Lesson 1, page 2) ----------
function d_cultureComponents() {
  const [c, x] = make(W, H);
  title2(x, 'What culture is made of');
  sub2(x, 'every part of it is learned, shared and passed on');
  const cx = W / 2, cy = 590, r = 118;
  // satellites: [bx, by, bw, bh, header, body, colour]
  const sat = [
    [60, 150, 400, 190, 'VALUES', 'the shared goals a society judges important — fairness, achievement, community, equality for all', BLUE],
    [988, 150, 400, 190, 'NORMS', 'the expected ways of behaving in particular situations — queueing, dress codes, table manners', BLUE],
    [40, 470, 380, 240, 'BELIEFS', 'the ideas a group accepts as true, religious or secular — an afterlife; hard work earns success', GREEN],
    [1028, 470, 380, 240, 'ROLES and STATUS', 'the positions people occupy — pupil, parent, nurse — and the expectations attached to them', PURPLE],
    [520, 880, 408, 170, 'LANGUAGE and MATERIAL OBJECTS', 'speech, writing and the things a society makes — the carriers that store and pass on all the rest', AMBER],
  ];
  sat.forEach(s => {
    const [bx, by, bw, bh, hd, bd, col] = s;
    box(x, bx, by, bw, bh, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    x.fillStyle = col; x.fillRect(bx, by, bw, 8);
    text(x, hd, bx + bw / 2, by + 46, { size: 24, bold: true });
    wrap(x, bd, bx + 24, bx + bw - 24, by + 88, { size: 20 });
    // arrow from satellite edge toward centre circle
    const sx = Math.max(bx, Math.min(bx + bw, cx)), sy = Math.max(by, Math.min(by + bh, cy));
    arrow(x, sx, sy, cx + (sx - cx) * 0.36, cy + (sy - cy) * 0.36, { color: GREY, lw: 3 });
  });
  circle(x, cx, cy, r, { fill: '#eff6ff', stroke: BLUE, lw: 4 });
  text(x, 'CULTURE', cx, cy - 26, { size: 34, bold: true, color: BLUE });
  wrap(x, 'the whole way of life of a society', cx - 96, cx + 96, cy + 14, { size: 19 });
  text(x, 'shared — learned — passed on', cx, cy + 74, { size: 17, color: GREY });
  return { file: 'wjec-soc-culture-components.png', w: W, h: H };
}

// ---------- 2. Ascribed and achieved status (Lesson 1, page 5) ----------
function d_statusRoles() {
  const [c, x] = make(W, H);
  title2(x, 'Status and role: the positions culture gives us');
  sub2(x, 'a status is a position — a role is the script of expectations attached to it');
  const px = 60, pw = 640, py = 130, ph = 460;
  box(x, px, py, pw, ph, { fill: '#f8fafc', stroke: LIGHT });
  panelHeader(x, px, py + 50, 1, 'ASCRIBED STATUS', BLUE);
  wrap(x, 'given at birth or by later impersonal decision — neither earned nor resignable', px + 40, px + pw - 40, py + 108, { size: 21, color: GREY });
  const ex1 = [
    ['son or daughter', 'assigned into a family at birth'],
    ['Welsh citizen', 'follows from where and to whom you are born'],
    ['teenager / elder', 'fixed by age, not by effort'],
  ];
  ex1.forEach((e, i) => {
    const by = py + 180 + i * 88;
    box(x, px + 40, by, pw - 80, 74, { fill: '#eff6ff', stroke: '#bfdbfe', lw: 1.5 });
    text(x, e[0], px + 60, by + 24, { size: 21, bold: true, align: 'left', color: BLUE });
    text(x, e[1], px + 60, by + 51, { size: 18, align: 'left', color: SOFT });
  });
  const px2 = 748;
  box(x, px2, py, pw, ph, { fill: '#f8fafc', stroke: LIGHT });
  panelHeader(x, px2, py + 50, 2, 'ACHIEVED STATUS', GREEN);
  wrap(x, 'earned through effort, choice or qualification — open in principle to anyone', px2 + 40, px2 + pw - 40, py + 108, { size: 21, color: GREY });
  const ex2 = [
    ['school captain', 'won by application and election'],
    ['registered nurse', 'earned through study, exams and registration'],
    ['fluent Welsh speaker', 'acquired by learning and practice'],
  ];
  ex2.forEach((e, i) => {
    const by = py + 180 + i * 88;
    box(x, px2 + 40, by, pw - 80, 74, { fill: '#f0fdf4', stroke: '#bbf7d0', lw: 1.5 });
    text(x, e[0], px2 + 60, by + 24, { size: 21, bold: true, align: 'left', color: GREEN });
    text(x, e[1], px2 + 60, by + 51, { size: 18, align: 'left', color: SOFT });
  });
  // bottom band: roles
  const by2 = 640;
  box(x, 60, by2, W - 120, 190, { fill: '#fff', stroke: LIGHT });
  x.fillStyle = PURPLE; x.fillRect(60, by2, W - 120, 8);
  text(x, 'ROLE — the expectations attached to a status', 60 + (W - 120) / 2, by2 + 48, { size: 26, bold: true, color: PURPLE });
  wrap(x, 'status: pupil → role: attend, submit work on time, accept staff authority, wear the uniform', 100, 700, by2 + 96, { size: 20 });
  wrap(x, 'one person holds a status SET — and when two roles make incompatible demands, that is ROLE CONFLICT (a Year 12 student with a weekend job)', 740, W - 40, by2 + 96, { size: 20 });
  line(x, 720, by2 + 72, 720, by2 + 180, { color: LIGHT, lw: 2 });
  return { file: 'wjec-soc-status-roles.png', w: W, h: H };
}

// ---------- 3. Nature vs nurture (Lesson 1, page 7) ----------
function d_natureNurture() {
  const [c, x] = make(W, H);
  title2(x, 'Nature or nurture? The evidence in outline');
  sub2(x, 'biology supplies the capacities — socialisation supplies the content');
  const py = 130, ph = 560;
  box(x, 60, py, 640, ph, { fill: '#f8fafc', stroke: LIGHT });
  panelHeader(x, 60, py + 50, 1, 'THE NATURE CLAIM: behaviour is inborn', RED);
  const n1 = [
    'humans are animals: we must eat, sleep, mature and die',
    'the capacity for speech rests on an evolved larynx and brain',
    'newborns arrive with reflexes and a need for attachment',
    'so biology sets real limits on what any culture can build',
  ];
  let yy = py + 120;
  n1.forEach(t => { circle(x, 110, yy - 7, 6, { fill: RED, stroke: false }); yy = wrap(x, t, 140, 670, yy, { size: 21 }) + 16; });
  box(x, 748, py, 640, ph, { fill: '#f8fafc', stroke: LIGHT });
  panelHeader(x, 748, py + 50, 2, 'THE NURTURE EVIDENCE: behaviour is learned', BLUE);
  const n2 = [
    'isolated children: denied socialisation, almost no culture develops — Genie (reported 1970), the Czech twins (Koluchová), Harlow\u2019s monkeys',
    'cross-cultural variation: diets, greetings, family forms and manners differ sharply between societies — instincts do not',
    'change within a lifetime: norms about marriage, smoking and gender have been transformed in decades — instincts never are',
  ];
  yy = py + 120;
  n2.forEach(t => { circle(x, 798, yy - 7, 6, { fill: BLUE, stroke: false }); yy = wrap(x, t, 828, 1360, yy, { size: 21 }) + 16; });
  // verdict band
  const vy = 730;
  box(x, 60, vy, W - 120, 200, { fill: '#fffbeb', stroke: '#fde68a', lw: 2 });
  x.fillStyle = AMBER; x.fillRect(60, vy, 8, 200);
  text(x, 'THE VERDICT', 60 + 32, vy + 44, { size: 22, bold: true, align: 'left', color: AMBER });
  wrap(x, 'biology makes culture POSSIBLE; only socialisation makes it ACTUAL — a baby raised in Japan learns Japanese culture, not Welsh culture, because culture comes from the people around us, not from our genes', 140, W - 100, vy + 96, { size: 22 });
  return { file: 'wjec-soc-nature-nurture.png', w: W, h: H };
}

// ---------- 4. Agencies of socialisation timeline (Lesson 2, page 3) ----------
function d_socialisationAgencies() {
  const [c, x] = make(W, H);
  title2(x, 'Agencies of socialisation: who teaches us what, and when');
  sub2(x, 'primary socialisation first, secondary socialisation for the rest of life');
  // primary band
  const py1 = 140;
  box(x, 60, py1, W - 120, 250, { fill: '#eff6ff', stroke: '#bfdbfe', lw: 2 });
  x.fillStyle = BLUE; x.fillRect(60, py1, W - 120, 8);
  text(x, 'PRIMARY SOCIALISATION — the family, from birth to about age 5', 60 + (W - 120) / 2, py1 + 50, { size: 25, bold: true, color: BLUE });
  const fam = [
    'language — the first and deepest gift',
    'basic norms: right and wrong, sharing, politeness',
    'values and identity: gender, class, belonging',
    'emotional attachment — the base for all later learning',
  ];
  let yy = py1 + 100;
  fam.forEach(t => { circle(x, 300, yy - 7, 6, { fill: BLUE, stroke: false }); yy = wrap(x, t, 330, 820, yy, { size: 21 }) + 12; });
  text(x, 'lifelong effects: children deprived of primary socialisation rarely recover fully — it is the foundation', 300, py1 + 218, { size: 19, color: GREY, align: 'left' });
  // arrow down
  arrow(x, W / 2, py1 + 250, W / 2, py1 + 290, { color: GREY, lw: 4, len: 16 });
  text(x, 'from about age 5, the agencies multiply', W / 2, py1 + 272, { size: 18, color: GREY });
  // secondary band
  const py2 = 450;
  box(x, 60, py2, W - 120, 560, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
  x.fillStyle = GREEN; x.fillRect(60, py2, W - 120, 8);
  text(x, 'SECONDARY SOCIALISATION — learning the wider society beyond the home', 60 + (W - 120) / 2, py2 + 50, { size: 25, bold: true, color: GREEN });
  const cols = [
    ['SCHOOL', 'punctuality, obedience to authority, the hidden curriculum; meritocracy practised daily', BLUE, 'wears uniform'],
    ['PEER GROUP', 'youth norms, identity, belonging — rewards what friends value, not what adults value', PURPLE, 'chooses friends\u2019 slang'],
    ['MEDIA', 'models of behaviour, values and success; now constant, personalised and in every pocket', RED, 'streams role models'],
    ['RELIGION and WORK', 'moral codes, rituals, community; then workplace discipline, time-keeping and hierarchy', AMBER, 'clocks in'],
  ];
  const cw = 310, gap = (W - 120 - 4 * cw) / 3;
  cols.forEach((cl, i) => {
    const bx = 60 + i * (cw + gap), by = py2 + 96;
    box(x, bx, by, cw, 400, { fill: '#fff', stroke: LIGHT, lw: 1.5 });
    x.fillStyle = cl[2]; x.fillRect(bx, by, cw, 8);
    circle(x, bx + cw / 2, by + 60, 34, { fill: cl[2], stroke: false });
    text(x, String(i + 1), bx + cw / 2, by + 61, { size: 26, bold: true, color: '#fff' });
    text(x, cl[0], bx + cw / 2, by + 118, { size: 22, bold: true });
    wrap(x, cl[1], bx + 18, bx + cw - 18, by + 152, { size: 19 });
    wrap(x, 'e.g. ' + cl[3], bx + 18, bx + cw - 18, by + 330, { size: 18, color: GREY });
  });
  return { file: 'wjec-soc-socialisation-agencies.png', w: W, h: H };
}

// ---------- 5. Sanctions 2x2 grid (Lesson 2, page 7) ----------
function d_sanctionsGrid() {
  const [c, x] = make(W, H);
  title2(x, 'Sanctions: the two-by-two grid to memorise');
  sub2(x, 'approval and disapproval, informal and formal — four families of consequence');
  const gx = 150, gy = 170, gw = 560, gh = 360, gap = 30;
  const cells = [
    ['INFORMAL POSITIVE', 'everyday approval', 'a friend\u2019s praise \u00b7 a smile \u00b7 a like \u00b7 a round of applause', '#f0fdf4', GREEN],
    ['FORMAL POSITIVE', 'official reward', 'a school prize \u00b7 a wage bonus \u00b7 a certificate \u00b7 an honour', '#f0fdf4', GREEN],
    ['INFORMAL NEGATIVE', 'everyday disapproval', 'a frown \u00b7 gossip \u00b7 being ignored \u00b7 exclusion from the group', '#fef2f2', RED],
    ['FORMAL NEGATIVE', 'official punishment', 'detention \u00b7 a fine \u00b7 community service \u00b7 a prison sentence', '#fef2f2', RED],
  ];
  const pos = [[gx, gy], [gx + gw + gap, gy], [gx, gy + gh + gap], [gx + gw + gap, gy + gh + gap]];
  cells.forEach((cel, i) => {
    const [bx, by] = pos[i];
    box(x, bx, by, gw, gh, { fill: cel[3], stroke: LIGHT, lw: 2 });
    x.fillStyle = cel[4]; x.fillRect(bx, by, gw, 8);
    text(x, cel[0], bx + gw / 2, by + 56, { size: 27, bold: true, color: cel[4] });
    text(x, cel[1], bx + gw / 2, by + 96, { size: 20, color: GREY });
    wrap(x, cel[2], bx + 30, bx + gw - 30, by + 170, { size: 22 });
  });
  // axis labels
  text(x, 'INFORMAL — unofficial, applied by people around us', gx + gw / 2, gy - 42, { size: 21, bold: true, color: SOFT });
  text(x, 'FORMAL — official, applied by organisations and the state', gx + gw * 1.5 + gap + gap / 2, gy - 42, { size: 21, bold: true, color: SOFT });
  const vy = gy + 2 * gh + gap + 70;
  box(x, 150, vy, W - 300, 150, { fill: '#fffbeb', stroke: '#fde68a', lw: 2 });
  x.fillStyle = AMBER; x.fillRect(150, vy, 8, 150);
  wrap(x, 'Most social control is done by the INFORMAL sanctions — constant, subtle, and costing nothing to administer. Formal sanctions exist for the residue that informal disapproval never reached.', 200, W - 170, vy + 56, { size: 22 });
  return { file: 'wjec-soc-sanctions-grid.png', w: W, h: H };
}

// ---------- 6. Social control cycle (Lesson 2, page 8) ----------
function d_socialControlCycle() {
  const [c, x] = make(W, H);
  title2(x, 'How norms become order: the social control cycle');
  sub2(x, 'why most conformity needs no policeman');
  const cx = W / 2, cy = 570, R = 300;
  const nodes = [
    ['SHARED NORMS', 'the group agrees how to behave here', BLUE],
    ['INTERNALISED', 'we absorb the norm — it becomes conscience', PURPLE],
    ['SELF-CONTROL', 'most conformity is self-policed: we follow norms unnoticed', GREEN],
    ['SANCTIONS', 'the residue is handled: informal first, then formal', RED],
  ];
  const ang = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];
  nodes.forEach((n, i) => {
    const a = ang[i], nx = cx + R * Math.cos(a), ny = cy + R * Math.sin(a);
    circle(x, nx, ny, 118, { fill: '#f8fafc', stroke: n[2], lw: 4 });
    text(x, n[0], nx, ny - 22, { size: 22, bold: true, color: n[2] });
    wrap(x, n[1], nx - 100, nx + 100, ny + 20, { size: 18 });
    // arc arrows between nodes
    const a2 = ang[(i + 1) % 4];
    const mx1 = cx + R * Math.cos(a + 0.28), my1 = cy + R * Math.sin(a + 0.28);
    const mx2 = cx + R * Math.cos(a2 - 0.28), my2 = cy + R * Math.sin(a2 - 0.28);
    // draw chord arrows between node edges
    arrow(x, mx1, my1, mx2, my2, { color: GREY, lw: 3.5, len: 16 });
  });
  circle(x, cx, cy, 150, { fill: '#eff6ff', stroke: BLUE, lw: 4 });
  text(x, 'SOCIAL ORDER', cx, cy - 30, { size: 28, bold: true, color: BLUE });
  wrap(x, 'millions of people cooperating without constant policing', cx - 128, cx + 128, cy + 24, { size: 19 });
  text(x, 'break the cycle — no norms learned — and order collapses (see the isolated-children cases)', cx, H - 70, { size: 20, color: GREY });
  return { file: 'wjec-soc-social-control-cycle.png', w: W, h: H };
}

// ---------- 7. Identity wheel (Lesson 3, page 1) ----------
function d_identityWheel() {
  const [c, x] = make(W, H);
  title2(x, 'The dimensions of a social identity');
  sub2(x, 'each dimension is learned from the people around us — and we hold all of them at once');
  const cx = W / 2, cy = 590, r = 150;
  const dims = [
    ['SOCIAL CLASS', 'working-class Valleys town \u00b7 middle-class suburb', BLUE, -Math.PI / 2],
    ['GENDER', 'how society treats you as a boy, girl or other', PURPLE, -Math.PI / 2 + Math.PI / 3],
    ['ETHNICITY', 'British-Welsh \u00b7 Somali-Welsh \u00b7 British-Asian heritage', AMBER, -Math.PI / 2 + 2 * Math.PI / 3],
    ['NATIONALITY', 'Welsh? British? Both — and in what setting?', GREEN, -Math.PI / 2 + 3 * Math.PI / 3],
    ['AGE', 'childhood, youth, working age, elderhood', RED, -Math.PI / 2 + 4 * Math.PI / 3],
    ['DISABILITY', 'social model: society disables, bodies differ', GREY, -Math.PI / 2 + 5 * Math.PI / 3],
  ];
  dims.forEach(d => {
    const a = d[3], dx = cx + 430 * Math.cos(a), dy = cy + 320 * Math.sin(a);
    const bw = 320, bh = 120, bx = dx - bw / 2, by = dy - bh / 2;
    box(x, bx, by, bw, bh, { fill: '#f8fafc', stroke: LIGHT, lw: 1.5 });
    x.fillStyle = d[2]; x.fillRect(bx, by, bw, 7);
    text(x, d[0], bx + bw / 2, by + 38, { size: 22, bold: true, color: d[2] });
    wrap(x, d[1], bx + 16, bx + bw - 16, by + 74, { size: 18 });
    const sx = Math.max(bx, Math.min(bx + bw, cx)), sy = Math.max(by, Math.min(by + bh, cy));
    arrow(x, sx, sy, cx + (sx - cx) * 0.3, cy + (sy - cy) * 0.3, { color: GREY, lw: 3 });
  });
  circle(x, cx, cy, r, { fill: '#eff6ff', stroke: BLUE, lw: 4 });
  text(x, 'IDENTITY', cx, cy - 36, { size: 32, bold: true, color: BLUE });
  wrap(x, 'who I believe I am — and who others take me to be', cx - 128, cx + 128, cy + 6, { size: 19 });
  text(x, 'built in interaction, from page 2', cx, cy + 76, { size: 16, color: GREY });
  return { file: 'wjec-soc-identity-wheel.png', w: W, h: H };
}

// ---------- 8. Intersectionality (Lesson 3, page 8) ----------
function d_intersectionality() {
  const [c, x] = make(W, H);
  title2(x, 'Intersectionality: identities combine, they do not add');
  sub2(x, 'the term was coined by the legal scholar Kimberlé Crenshaw in 1989');
  const cx = 520, cy = 560, rr = 220;
  const rings = [
    ['GENDER', cx - 150, cy - 95, '#dbeafe', BLUE],
    ['ETHNICITY', cx + 150, cy - 95, '#fef3c7', AMBER],
    ['SOCIAL CLASS', cx, cy + 130, '#ede9fe', PURPLE],
  ];
  rings.forEach(rg => { circle(x, rg[1], rg[2], rr, { fill: rg[3], stroke: rg[4], lw: 4 }); });
  rings.forEach(rg => {
    const ly = rg[2] - rr - 40;
    text(x, rg[0], rg[1], ly < 150 ? rg[2] + rr + 44 : ly, { size: 24, bold: true, color: rg[4] });
  });
  circle(x, cx, cy, 84, { fill: '#0f172a', stroke: '#0f172a', lw: 3 });
  text(x, 'one combined,', cx, cy - 16, { size: 19, bold: true, color: '#fff' });
  text(x, 'lived experience', cx, cy + 16, { size: 19, bold: true, color: '#fff' });
  // right panel
  const px = 880;
  box(x, px, 190, 510, 700, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
  text(x, 'WHY NOT ADD?', px + 255, 240, { size: 26, bold: true, color: PURPLE });
  let yy = 300;
  const pts = [
    'a young working-class Black woman\u2019s experience is not "class + ethnicity + gender" stacked separately',
    'each dimension shapes HOW the others are lived — class affects which femininity is expected of you; ethnicity affects how your class is read',
    'so the centre of the diagram is a single experience with its own character, not three experiences side by side',
    'adding treats people as averages; intersecting treats them as one whole position in society',
  ];
  pts.forEach(t => { circle(x, px + 40, yy - 7, 6, { fill: PURPLE, stroke: false }); yy = wrap(x, t, px + 70, px + 470, yy, { size: 20 }) + 14; });
  return { file: 'wjec-soc-intersectionality.png', w: W, h: H };
}

// ---------- 9. The looking-glass self (Lesson 3, page 2) ----------
function d_lookingGlass() {
  const [c, x] = make(W, H);
  title2(x, 'The looking-glass self: identity built from others\u2019 imagined judgement');
  sub2(x, 'Charles Cooley, 1902 — the self is a social product, formed in three moves');
  const steps = [
    ['1', 'We imagine how we APPEAR to others', 'walking into the room, we picture the impression we make'],
    ['2', 'We imagine their JUDGEMENT of that appearance', 'do they think we are confident? awkward? clever? out of place?'],
    ['3', 'We FEEL and act according to that imagined judgement', 'pride, shame, confidence — and behaviour adjusted to match'],
  ];
  const bw = 400, gap = 40, py = 150;
  steps.forEach((s, i) => {
    const bx = 60 + i * (bw + gap + 30);
    box(x, bx, py, bw, 300, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
    circle(x, bx + 52, py + 56, 26, { fill: BLUE, stroke: false });
    text(x, s[0], bx + 52, py + 57, { size: 26, bold: true, color: '#fff' });
    wrap(x, s[1], bx + 24, bx + bw - 24, py + 120, { size: 22, bold: true });
    wrap(x, s[2], bx + 24, bx + bw - 24, py + 190, { size: 19, color: SOFT });
    if (i < 2) arrow(x, bx + bw + 5, py + 150, bx + bw + gap + 25, py + 150, { color: GREY, lw: 4, len: 18 });
  });
  // example strip
  const ey = 520;
  box(x, 60, ey, W - 120, 380, { fill: '#fff', stroke: LIGHT, lw: 2 });
  x.fillStyle = GREEN; x.fillRect(60, ey, W - 120, 8);
  text(x, 'EXAMPLE: Seren in the classroom', 60 + (W - 120) / 2, ey + 50, { size: 24, bold: true, color: GREEN });
  const flow = [
    ['Seren answers a question in class', BLUE],
    ['the teacher smiles; classmates turn to listen', BLUE],
    ['she imagines: "they think I am good at this"', GREEN],
    ['she feels confident — and answers again', GREEN],
  ];
  const fw = 300, fgap = (W - 120 - 4 * fw) / 3;
  flow.forEach((f, i) => {
    const bx = 90 + i * (fw + fgap), by = ey + 100;
    box(x, bx, by, fw, 200, { fill: '#f8fafc', stroke: LIGHT, lw: 1.5 });
    x.fillStyle = f[1]; x.fillRect(bx, by, fw, 7);
    wrap(x, f[0], bx + 18, bx + fw - 18, by + 100, { size: 21 });
    if (i < 3) arrow(x, bx + fw + 3, by + 100, bx + fw + fgap - 3, by + 100, { color: GREY, lw: 3.5, len: 14 });
  });
  text(x, 'the same three steps with a frown instead of a smile build a very different self — which is why the self is social, not simply inner', 60 + (W - 120) / 2, ey + 340, { size: 19, color: GREY });
  return { file: 'wjec-soc-looking-glass-self.png', w: W, h: H };
}

(async () => {
  fs.mkdirSync(DIR, { recursive: true });
  const renderers = [d_cultureComponents, d_statusRoles, d_natureNurture, d_socialisationAgencies,
    d_sanctionsGrid, d_socialControlCycle, d_identityWheel, d_intersectionality, d_lookingGlass];
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