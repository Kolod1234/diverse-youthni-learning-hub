#!/usr/bin/env node
/*
 * Renders the nine diagrams for Single Award Science lesson 1.5
 * (Reproduction) as high-resolution plotted PNGs, in the same design
 * language as the sas-coord series (white background, Helvetica labels,
 * leader lines with dots, teal/coral accents, no edge clipping).
 *
 *   sas-repro-male-system.png      - male reproductive system, side view
 *   sas-repro-female-system.png    - female reproductive system, side view
 *   sas-repro-gametes.png          - sperm cell and egg cell, labelled
 *   sas-repro-placenta.png         - exchange at the placenta
 *   sas-repro-menstrual-graph.png  - uterus lining across a 28-day cycle
 *   sas-repro-flower-structure.png - vertical section through a flower
 *   sas-repro-pollination.png      - insect- vs wind-pollinated comparison
 *   sas-repro-pollen-tube.png      - fertilisation in a flowering plant
 *   sas-repro-seed-germination.png - bean seed structure + germination stages
 *
 * Drafts are written to public/lesson-assets/sas-biology/draft-sas15/ first.
 */
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'public', 'lesson-assets', 'sas-biology', 'draft-sas15');
fs.mkdirSync(OUT_DIR, { recursive: true });

const INK = '#1e293b';
const GREY = '#475569';
const LEADER = '#64748b';
const TEAL = '#0f766e';
const CORAL = '#be123c';

const rad = (d) => (d * Math.PI) / 180;

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function wrapText(ctx, text, maxW) {
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const w of words) {
    const t = line ? line + ' ' + w : w;
    if (ctx.measureText(t).width > maxW && line) { lines.push(line); line = w; }
    else line = t;
  }
  if (line) lines.push(line);
  return lines;
}

function drawBlock(ctx, text, cx, y, maxW, font, color, lineH) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const lines = wrapText(ctx, text, maxW);
  let yy = y;
  for (const l of lines) { ctx.fillText(l, cx, yy); yy += lineH; }
  return yy - lineH;
}

function arrow(ctx, x1, y1, x2, y2, color, width = 6, head = 20) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const ang = Math.atan2(y2 - y1, x2 - x1);
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(ang - 0.42), y2 - head * Math.sin(ang - 0.42));
  ctx.lineTo(x2 - head * Math.cos(ang + 0.42), y2 - head * Math.sin(ang + 0.42));
  ctx.closePath();
  ctx.fill();
}

function leader(ctx, x1, y1, x2, y2) {
  ctx.strokeStyle = LEADER;
  ctx.fillStyle = LEADER;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x2, y2, 6, 0, Math.PI * 2);
  ctx.fill();
}

/* Label pair: bold name + grey role, leaders to a target point. */
function tagLabel(ctx, cx, y, name, role, target, maxW, fromRight) {
  const bottom = drawBlock(ctx, name, cx, y, maxW, 'bold 38px Helvetica, Arial, sans-serif', INK, 44);
  const roleBottom = drawBlock(ctx, role, cx, bottom + 52, maxW, '30px Helvetica, Arial, sans-serif', GREY, 36);
  const lx = fromRight ? cx - maxW / 2 : cx + maxW / 2;
  leader(ctx, lx, roleBottom - 18, target[0], target[1]);
}

function edgeCheck(canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;
  const d = ctx.getImageData(0, 0, W, H).data;
  let bad = 0;
  for (let x = 0; x < W; x++) {
    for (const y of [0, 1, H - 2, H - 1]) {
      const i = (y * W + x) * 4;
      if (d[i] < 250 || d[i + 1] < 250 || d[i + 2] < 250) bad++;
    }
  }
  for (let y = 0; y < H; y++) {
    for (const x of [0, 1, W - 2, W - 1]) {
      const i = (y * W + x) * 4;
      if (d[i] < 250 || d[i + 1] < 250 || d[i + 2] < 250) bad++;
    }
  }
  return bad;
}

/* ------------------------------------------------------------------ */
/* 1. Male reproductive system                                         */
/* ------------------------------------------------------------------ */
function renderMale() {
  const W = 2400, H = 1700;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Urethra (through the penis to the prostate)
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(300, 830); ctx.lineTo(1150, 830); ctx.stroke();

  // Penis
  roundRect(ctx, 250, 740, 530, 180, 90);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#475569';
  ctx.stroke();

  // Sperm duct from the testis towards the prostate
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(1870, 980);
  ctx.bezierCurveTo(1780, 800, 1600, 730, 1350, 780);
  ctx.bezierCurveTo(1270, 800, 1200, 810, 1160, 830);
  ctx.stroke();

  // Bladder
  ctx.beginPath();
  ctx.ellipse(1150, 470, 170, 140, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#e0f2fe';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#0284c7';
  ctx.stroke();

  // Seminal vesicle
  ctx.beginPath();
  ctx.ellipse(1310, 690, 75, 52, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#fef3c7';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#b45309';
  ctx.stroke();

  // Prostate gland
  ctx.beginPath();
  ctx.arc(1150, 830, 95, 0, Math.PI * 2);
  ctx.fillStyle = '#fee2e2';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#dc2626';
  ctx.stroke();

  // Scrotum and testis
  ctx.beginPath();
  ctx.ellipse(1900, 1180, 210, 270, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#475569';
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(1875, 1160, 110, 150, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#fce7f3';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#db2777';
  ctx.stroke();

  // Top labels
  tagLabel(ctx, 800, 150, 'Bladder', 'stores urine before it leaves the body', [1120, 540], 420);
  tagLabel(ctx, 1450, 150, 'Seminal vesicle', 'adds nourishing fluid to the sperm', [1330, 650], 420);
  tagLabel(ctx, 2000, 150, 'Sperm duct', 'carries sperm from a testis to the urethra', [1560, 760], 420);

  // Bottom labels
  tagLabel(ctx, 320, 1460, 'Penis', 'delivers semen into the vagina during intercourse', [620, 920], 320);
  tagLabel(ctx, 800, 1460, 'Urethra', 'carries semen (or urine) out of the body', [980, 845], 320);
  tagLabel(ctx, 1200, 1460, 'Prostate gland', 'adds fluid; sperm plus fluids make semen', [1150, 905], 320);
  tagLabel(ctx, 1650, 1460, 'Scrotum', 'holds the testes outside the body, keeping them cooler', [1930, 940], 320);
  tagLabel(ctx, 2080, 1460, 'Testis', 'makes sperm and the hormone testosterone', [1875, 1030], 320);

  return { canvas: c, file: 'sas-repro-male-system.png' };
}

/* ------------------------------------------------------------------ */
/* 2. Female reproductive system                                       */
/* ------------------------------------------------------------------ */
function renderFemale() {
  const W = 2400, H = 1700;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Vagina
  roundRect(ctx, 430, 950, 640, 120, 60);
  ctx.fillStyle = '#f1f5f9';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#475569';
  ctx.stroke();

  // Oviduct with fimbriae
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(1470, 540);
  ctx.bezierCurveTo(1650, 560, 1800, 540, 1900, 470);
  ctx.stroke();
  ctx.lineWidth = 8;
  for (const [x, y] of [[1955, 435], [1975, 468], [1950, 500]]) {
    ctx.beginPath(); ctx.moveTo(1900, 470); ctx.lineTo(x, y); ctx.stroke();
  }

  // Uterus (pear shape above the cervix)
  ctx.beginPath();
  ctx.moveTo(1135, 1000);
  ctx.bezierCurveTo(1040, 840, 1040, 520, 1300, 450);
  ctx.bezierCurveTo(1560, 520, 1560, 840, 1465, 1000);
  ctx.bezierCurveTo(1400, 1030, 1200, 1030, 1135, 1000);
  ctx.closePath();
  ctx.fillStyle = '#fdf2f8';
  ctx.fill();
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#db2777';
  ctx.stroke();

  // Uterus cavity
  ctx.beginPath();
  ctx.ellipse(1300, 700, 150, 230, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#ffffff';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#f9a8d4';
  ctx.stroke();

  // Cervix
  ctx.beginPath();
  ctx.arc(1075, 1010, 75, 0, Math.PI * 2);
  ctx.fillStyle = '#e2e8f0';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#475569';
  ctx.stroke();

  // Ovary + ripening egg
  ctx.beginPath();
  ctx.ellipse(2000, 450, 120, 85, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#fde68a';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#b45309';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(2010, 450, 16, 0, Math.PI * 2);
  ctx.fillStyle = '#ea580c';
  ctx.fill();

  // Top labels
  tagLabel(ctx, 2000, 150, 'Ovary', 'stores egg cells and releases one each month', [2000, 370], 380);
  tagLabel(ctx, 1450, 150, 'Oviduct (Fallopian tube)', 'carries the egg towards the uterus; fertilisation happens here', [1700, 525], 460);
  tagLabel(ctx, 700, 150, 'Uterus', 'muscular organ where a baby develops; its lining thickens every month', [1240, 640], 460);

  // Bottom labels
  tagLabel(ctx, 500, 1460, 'Cervix', 'ring of muscle at the entrance to the uterus', [1075, 1085], 420);
  tagLabel(ctx, 1150, 1460, 'Vagina', 'receives the penis during intercourse; the baby is born through it', [750, 1085], 420);

  return { canvas: c, file: 'sas-repro-female-system.png' };
}

/* ------------------------------------------------------------------ */
/* 3. Gametes: sperm and egg                                           */
/* ------------------------------------------------------------------ */
function renderGametes() {
  const W = 2400, H = 1700;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // divider
  ctx.strokeStyle = '#e2e8f0';
  ctx.lineWidth = 4;
  ctx.setLineDash([24, 18]);
  ctx.beginPath(); ctx.moveTo(200, 880); ctx.lineTo(2200, 880); ctx.stroke();
  ctx.setLineDash([]);

  // ---- top half: sperm ----
  ctx.textAlign = 'center';
  ctx.fillStyle = INK;
  ctx.font = 'bold 44px Helvetica, Arial, sans-serif';
  ctx.fillText('The sperm cell — the male gamete', 700, 150);

  // head
  ctx.beginPath();
  ctx.ellipse(500, 430, 90, 62, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#e0f2fe';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#0369a1';
  ctx.stroke();
  ctx.beginPath();
  ctx.ellipse(500, 445, 50, 30, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#cbd5e1';
  ctx.fill();

  // midpiece
  roundRect(ctx, 475, 490, 50, 100, 20);
  ctx.fillStyle = '#d9f99d';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#4d7c0f';
  ctx.stroke();

  // tail
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(500, 592);
  ctx.bezierCurveTo(440, 680, 560, 740, 500, 810);
  ctx.stroke();

  // sperm labels
  tagLabel(ctx, 1250, 290, 'Head', 'contains the nucleus with the 23 chromosomes', [560, 415], 620, true);
  tagLabel(ctx, 1250, 470, 'Front of the head', 'carries enzymes that digest through the egg cell\u2019s membranes', [505, 398], 620, true);
  tagLabel(ctx, 1250, 650, 'Middle section', 'packed with mitochondria — the energy supply for swimming', [510, 545], 620, true);
  tagLabel(ctx, 1250, 800, 'Tail', 'whips from side to side to drive the sperm forwards', [505, 740], 620, true);

  // ---- bottom half: egg ----
  ctx.fillStyle = INK;
  ctx.font = 'bold 44px Helvetica, Arial, sans-serif';
  ctx.fillText('The egg cell — the female gamete', 1850, 960);

  // jelly coat
  ctx.beginPath();
  ctx.arc(1850, 1320, 300, 0, Math.PI * 2);
  ctx.fillStyle = '#f1f5f9';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#cbd5e1';
  ctx.stroke();
  // cytoplasm + membrane
  ctx.beginPath();
  ctx.arc(1850, 1320, 250, 0, Math.PI * 2);
  ctx.fillStyle = '#fef9c3';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#ca8a04';
  ctx.stroke();
  // nucleus
  ctx.beginPath();
  ctx.arc(1850, 1300, 85, 0, Math.PI * 2);
  ctx.fillStyle = '#fed7aa';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#ea580c';
  ctx.stroke();

  // egg labels (to the left of the egg)
  tagLabel(ctx, 1000, 1020, 'Jelly coat', 'after fertilisation it changes to block other sperm', [1560, 1255], 560);
  tagLabel(ctx, 1000, 1200, 'Cell membrane', 'surrounds the egg cell', [1605, 1310], 560);
  tagLabel(ctx, 1000, 1350, 'Cytoplasm', 'a large food store for the first days of growth', [1700, 1430], 560);
  tagLabel(ctx, 1000, 1520, 'Nucleus', 'carries the 23 chromosomes', [1785, 1315], 560);

  drawBlock(ctx, 'Both cells are drawn far larger than life. A real egg cell is about 20 times wider than a sperm\u2019s head — yet is still only just big enough to see with the unaided eye.', 1200, 1600, 1500, 'italic 28px Helvetica, Arial, sans-serif', GREY, 34);

  return { canvas: c, file: 'sas-repro-gametes.png' };
}

/* ------------------------------------------------------------------ */
/* 4. Placenta exchange                                                */
/* ------------------------------------------------------------------ */
function renderPlacenta() {
  const W = 2400, H = 1700;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // Mother's blood vessels
  for (const y of [700, 850, 1000]) {
    roundRect(ctx, 250, y - 28, 520, 56, 28);
    ctx.fillStyle = '#fee2e2';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#dc2626';
    ctx.stroke();
  }
  drawBlock(ctx, 'Mother\u2019s blood, flowing through vessels in the wall of the uterus', 450, 430, 400, 'bold 34px Helvetica, Arial, sans-serif', INK, 40);
  leader(ctx, 450, 600, 450, 660);

  // Placenta disc
  ctx.beginPath();
  ctx.ellipse(1350, 850, 380, 320, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#fecdd3';
  ctx.fill();
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#b91c1c';
  ctx.stroke();

  // branching vessels inside the placenta
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  for (const [ex, ey] of [[1250, 690], [1180, 850], [1250, 1010]]) {
    ctx.beginPath(); ctx.moveTo(1560, 850); ctx.bezierCurveTo(1450, (850 + ey) / 2, ex + 90, (ey + ey) / 2 + 60, ex, ey); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(ex, ey); ctx.lineTo(ex - 70, ey + (ey < 850 ? -40 : 40)); ctx.stroke();
  }

  // Exchange arrows: in (teal), out (coral)
  arrow(ctx, 790, 620, 985, 620, TEAL, 8, 24);
  drawBlock(ctx, 'oxygen', 880, 545, 240, 'bold 30px Helvetica, Arial, sans-serif', TEAL, 34);
  arrow(ctx, 790, 700, 985, 700, TEAL, 8, 24);
  drawBlock(ctx, 'glucose and other nutrients', 880, 745, 240, '28px Helvetica, Arial, sans-serif', TEAL, 32);
  arrow(ctx, 985, 950, 790, 950, CORAL, 8, 24);
  drawBlock(ctx, 'carbon dioxide', 880, 1000, 240, 'bold 30px Helvetica, Arial, sans-serif', CORAL, 34);
  arrow(ctx, 985, 1030, 790, 1030, CORAL, 8, 24);
  drawBlock(ctx, 'urea and other waste', 880, 1080, 240, '28px Helvetica, Arial, sans-serif', CORAL, 32);

  // Umbilical cord
  ctx.strokeStyle = '#f87171';
  ctx.lineWidth = 80;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(1730, 850); ctx.lineTo(2250, 850); ctx.stroke();
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 16;
  ctx.beginPath(); ctx.moveTo(1730, 825); ctx.lineTo(2250, 825); ctx.stroke();
  ctx.strokeStyle = '#60a5fa';
  ctx.beginPath(); ctx.moveTo(1730, 880); ctx.lineTo(2250, 880); ctx.stroke();

  drawBlock(ctx, 'Umbilical cord — two arteries carry the baby\u2019s blood to the placenta; one vein returns it', 1990, 620, 720, '30px Helvetica, Arial, sans-serif', INK, 36);
  arrow(ctx, 1990, 760, 1990, 800, '#64748b', 6, 18);
  drawBlock(ctx, 'to and from the baby', 2160, 1000, 380, 'italic 30px Helvetica, Arial, sans-serif', GREY, 36);

  // Bottom note pill
  roundRect(ctx, 350, 1420, 1700, 150, 75);
  ctx.fillStyle = '#eff6ff';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#1d4ed8';
  ctx.stroke();
  drawBlock(ctx, 'The mother\u2019s blood and the baby\u2019s blood never mix.', 1200, 1462, 1500, 'bold 36px Helvetica, Arial, sans-serif', INK, 42);
  drawBlock(ctx, 'Oxygen, dissolved food and waste pass across the barrier by diffusion.', 1200, 1512, 1500, '30px Helvetica, Arial, sans-serif', GREY, 38);

  return { canvas: c, file: 'sas-repro-placenta.png' };
}

/* ------------------------------------------------------------------ */
/* 5. Menstrual cycle graph                                            */
/* ------------------------------------------------------------------ */
function renderMenstrualGraph() {
  const W = 2400, H = 1500;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  const X0 = 380, X1 = 2160, Y0 = 1120, YT = 260;
  const xd = (d) => X0 + (d / 28) * (X1 - X0);
  const yh = (h) => Y0 - h * (Y0 - YT);

  ctx.font = 'bold 44px Helvetica, Arial, sans-serif';
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.fillText('Thickness of the uterus lining during one 28-day menstrual cycle', 1200, 55);

  // menstruation shading (days 0-5)
  ctx.fillStyle = 'rgba(254, 202, 202, 0.55)';
  ctx.fillRect(X0, YT, xd(5) - X0, Y0 - YT);
  ctx.save();
  ctx.translate(520, 720);
  ctx.rotate(-Math.PI / 2);
  ctx.font = 'bold 30px Helvetica, Arial, sans-serif';
  ctx.fillStyle = '#be123c';
  ctx.fillText('menstruation', 0, 0);
  ctx.restore();

  // axes
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(X0, YT); ctx.lineTo(X0, Y0); ctx.lineTo(X1, Y0); ctx.stroke();
  ctx.lineWidth = 3;
  for (const d of [0, 7, 14, 21, 28]) {
    ctx.beginPath(); ctx.moveTo(xd(d), Y0); ctx.lineTo(xd(d), Y0 + 26); ctx.stroke();
    ctx.font = '30px Helvetica, Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.textAlign = 'center';
    ctx.fillText(String(d), xd(d), Y0 + 40);
  }
  ctx.font = '32px Helvetica, Arial, sans-serif';
  ctx.fillStyle = INK;
  ctx.fillText('Day of the cycle', 1200, 1290);
  ctx.save();
  ctx.translate(130, 690);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('Thickness of the uterus lining', 0, 0);
  ctx.restore();

  // ovulation marker
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 5;
  ctx.setLineDash([18, 14]);
  ctx.beginPath(); ctx.moveTo(xd(14), YT); ctx.lineTo(xd(14), Y0); ctx.stroke();
  ctx.setLineDash([]);
  drawBlock(ctx, 'Ovulation — an egg is released from the ovary (about day 14)', xd(14), 130, 700, 'bold 30px Helvetica, Arial, sans-serif', TEAL, 36);

  // the lining curve (Catmull-Rom smoothed)
  const pts = [
    [0, 0.50], [2, 0.42], [5, 0.02], [7, 0.18], [10, 0.52],
    [14, 1.00], [18, 1.00], [22, 0.98], [25, 0.80], [28, 0.50],
  ].map(([d, h]) => [xd(d), yh(h)]);

  ctx.strokeStyle = CORAL;
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    ctx.bezierCurveTo(
      p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6,
      p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6,
      p2[0], p2[1]
    );
  }
  ctx.stroke();

  // annotation on the thick phase
  drawBlock(ctx, 'lining thick, soft and richly supplied with blood — ready to receive an embryo', 1670, 330, 800, 'italic 28px Helvetica, Arial, sans-serif', GREY, 34);
  arrow(ctx, 1670, 420, 1500, 480, GREY, 5, 16);

  drawBlock(ctx, 'If the egg is not fertilised, the lining breaks down and the cycle repeats. If fertilisation happens, the lining stays in place and menstruation does not occur.', 1200, 1390, 1800, 'italic 28px Helvetica, Arial, sans-serif', GREY, 36);

  return { canvas: c, file: 'sas-repro-menstrual-graph.png' };
}

/* ------------------------------------------------------------------ */
/* 6. Flower structure                                                */
/* ------------------------------------------------------------------ */
function renderFlower() {
  const W = 2400, H = 1700;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  ctx.font = 'bold 44px Helvetica, Arial, sans-serif';
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.fillText('Vertical section through a typical insect-pollinated flower', 1200, 60);

  // stem
  ctx.fillStyle = '#15803d';
  ctx.fillRect(1180, 1450, 40, 180);

  // sepals
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(1200 + dir * 110, 1420);
    ctx.bezierCurveTo(1200 + dir * 250, 1470, 1200 + dir * 330, 1520, 1200 + dir * 400, 1500);
    ctx.bezierCurveTo(1200 + dir * 320, 1440, 1200 + dir * 210, 1400, 1200 + dir * 110, 1420);
    ctx.closePath();
    ctx.fillStyle = '#86efac';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#16a34a';
    ctx.stroke();
  }

  // petals
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(1200 + dir * 110, 1370);
    ctx.bezierCurveTo(1200 + dir * 520, 1280, 1200 + dir * 680, 940, 1200 + dir * 440, 700);
    ctx.bezierCurveTo(1200 + dir * 220, 830, 1200 + dir * 110, 1120, 1200 + dir * 70, 1330);
    ctx.closePath();
    ctx.fillStyle = '#fbcfe8';
    ctx.fill();
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#db2777';
    ctx.stroke();
  }

  // style (drawn before ovary so the ovary sits over it)
  ctx.strokeStyle = '#166534';
  ctx.lineWidth = 16;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(1200, 1330); ctx.lineTo(1200, 760); ctx.stroke();

  // stamens
  for (const dir of [-1, 1]) {
    ctx.strokeStyle = '#15803d';
    ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(1200 + dir * 150, 1350); ctx.lineTo(1200 + dir * 250, 880); ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(1200 + dir * 250, 860, 45, 68, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fde047';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ca8a04';
    ctx.stroke();
  }

  // ovary + ovules
  ctx.beginPath();
  ctx.ellipse(1200, 1250, 115, 95, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#bbf7d0';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#16a34a';
  ctx.stroke();
  for (const [ox, oy] of [[1170, 1260], [1230, 1260], [1200, 1300]]) {
    ctx.beginPath();
    ctx.arc(ox, oy, 28, 0, Math.PI * 2);
    ctx.fillStyle = '#fef9c3';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#ca8a04';
    ctx.stroke();
  }

  // stigma
  ctx.beginPath();
  ctx.ellipse(1200, 720, 60, 40, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#fca5a5';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#e11d48';
  ctx.stroke();

  // receptacle
  ctx.beginPath();
  ctx.ellipse(1200, 1400, 150, 70, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#bbf7d0';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#16a34a';
  ctx.stroke();

  // left labels
  tagLabel(ctx, 300, 300, 'Petal', 'often large and brightly coloured, to attract insects', [790, 1060], 420);
  tagLabel(ctx, 300, 530, 'Anther', 'makes the pollen grains', [955, 810], 420);
  tagLabel(ctx, 300, 760, 'Filament', 'holds the anther in place', [1015, 1115], 420);
  tagLabel(ctx, 300, 990, 'Sepal', 'protected the flower when it was a bud', [940, 1470], 420);
  tagLabel(ctx, 300, 1220, 'Receptacle', 'the swollen base of the flower', [1105, 1420], 420);

  // right labels
  tagLabel(ctx, 2090, 300, 'Stigma', 'sticky tip that catches pollen', [1245, 730], 420, true);
  tagLabel(ctx, 2090, 530, 'Style', 'the pollen tube grows down through this stalk', [1212, 950], 420, true);
  tagLabel(ctx, 2090, 760, 'Ovary', 'contains the ovules; grows into the fruit', [1295, 1200], 420, true);
  tagLabel(ctx, 2090, 990, 'Ovule', 'contains the egg cell; becomes a seed after fertilisation', [1240, 1270], 420, true);

  return { canvas: c, file: 'sas-repro-flower-structure.png' };
}

/* ------------------------------------------------------------------ */
/* 7. Pollination: insect vs wind                                     */
/* ------------------------------------------------------------------ */
function renderPollination() {
  const W = 2400, H = 1700;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // panels
  for (const x of [80, 1240]) {
    roundRect(ctx, x, 120, 1080, 1480, 28);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#cbd5e1';
    ctx.stroke();
  }

  // ---- left: insect-pollinated ----
  ctx.textAlign = 'center';
  ctx.fillStyle = INK;
  ctx.font = 'bold 42px Helvetica, Arial, sans-serif';
  ctx.fillText('Insect-pollinated (e.g. buttercup)', 620, 200);
  ctx.font = '28px Helvetica, Arial, sans-serif';
  ctx.fillStyle = GREY;
  ctx.fillText('insects carry pollen between flowers', 620, 260);

  // petals
  for (let i = 0; i < 6; i++) {
    ctx.save();
    ctx.translate(620, 900);
    ctx.rotate((i * Math.PI) / 3);
    ctx.beginPath();
    ctx.ellipse(0, -200, 62, 135, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fbcfe8';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#db2777';
    ctx.stroke();
    ctx.restore();
  }
  // centre disc
  ctx.beginPath();
  ctx.arc(620, 900, 95, 0, Math.PI * 2);
  ctx.fillStyle = '#fde047';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#ca8a04';
  ctx.stroke();

  // a visiting insect
  ctx.save();
  ctx.translate(930, 660);
  ctx.rotate(rad(-18));
  ctx.beginPath(); ctx.ellipse(-45, -32, 42, 16, rad(-28), 0, Math.PI * 2); ctx.fillStyle = '#bae6fd'; ctx.fill(); ctx.lineWidth = 3; ctx.strokeStyle = '#0284c7'; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(45, -32, 42, 16, rad(28), 0, Math.PI * 2); ctx.fillStyle = '#bae6fd'; ctx.fill(); ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, 0, 58, 32, 0, 0, Math.PI * 2); ctx.fillStyle = '#78350f'; ctx.fill();
  ctx.strokeStyle = '#fef3c7';
  ctx.lineWidth = 7;
  ctx.beginPath(); ctx.moveTo(-12, -30); ctx.lineTo(-12, 30); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(14, -28); ctx.lineTo(14, 28); ctx.stroke();
  ctx.restore();
  drawBlock(ctx, 'pollen sticking to the insect\u2019s body', 1080, 800, 300, 'italic 26px Helvetica, Arial, sans-serif', GREY, 32);

  const leftFacts = [
    ['Large, bright, scented petals', 'advertise the flower to insect visitors'],
    ['Nectar', 'a sugary reward that keeps insects returning'],
    ['Modest amounts of sticky, spiky pollen', 'clings to insect bodies and rubs off on the next flower'],
  ];
  leftFacts.forEach(([h, t], i) => {
    const y = 1220 + i * 150;
    drawBlock(ctx, h, 620, y, 620, 'bold 30px Helvetica, Arial, sans-serif', INK, 36);
    drawBlock(ctx, t, 620, y + 44, 620, '28px Helvetica, Arial, sans-serif', GREY, 34);
  });

  // ---- right: wind-pollinated ----
  ctx.fillStyle = INK;
  ctx.font = 'bold 42px Helvetica, Arial, sans-serif';
  ctx.fillText('Wind-pollinated (e.g. grass)', 1780, 200);
  ctx.font = '28px Helvetica, Arial, sans-serif';
  ctx.fillStyle = GREY;
  ctx.fillText('the wind carries pollen between flowers', 1780, 260);

  // stem
  ctx.strokeStyle = '#65a30d';
  ctx.lineWidth = 14;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(1780, 1120); ctx.lineTo(1780, 700); ctx.stroke();

  // feathery stigmas
  ctx.strokeStyle = '#a8a29e';
  ctx.lineWidth = 5;
  for (const [tx, ty] of [[1640, 520], [1715, 480], [1795, 470], [1875, 485], [1930, 530]]) {
    ctx.beginPath(); ctx.moveTo(1780, 720); ctx.lineTo(tx, ty); ctx.stroke();
    ctx.beginPath(); ctx.moveTo((1780 + tx) / 2, (720 + ty) / 2); ctx.lineTo((1780 + tx) / 2 + 30, (720 + ty) / 2 - 25); ctx.stroke();
    ctx.beginPath(); ctx.moveTo((1780 + tx) / 2, (720 + ty) / 2); ctx.lineTo((1780 + tx) / 2 - 32, (720 + ty) / 2 - 20); ctx.stroke();
  }
  drawBlock(ctx, 'long, feathery stigma', 1450, 560, 340, 'italic 26px Helvetica, Arial, sans-serif', GREY, 32);

  // small dull floret + dangling anthers
  ctx.beginPath();
  ctx.ellipse(1780, 960, 40, 70, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#d6d3d1';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#78716c';
  ctx.stroke();
  ctx.strokeStyle = '#65a30d';
  ctx.lineWidth = 8;
  for (const dir of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(1780, 960);
    ctx.quadraticCurveTo(1780 + dir * 110, 1000, 1780 + dir * 120, 1105);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(1780 + dir * 122, 1140, 26, 46, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fde047';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ca8a04';
    ctx.stroke();
  }

  // drifting pollen grains
  ctx.fillStyle = '#ca8a04';
  for (const [px, py] of [[1500, 780], [1560, 700], [2050, 720], [2110, 820], [1470, 950]]) {
    ctx.beginPath(); ctx.arc(px, py, 9, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = '#ca8a04';
  ctx.lineWidth = 3;
  ctx.setLineDash([10, 12]);
  ctx.beginPath(); ctx.moveTo(1620, 640); ctx.quadraticCurveTo(1900, 560, 2160, 660); ctx.stroke();
  ctx.setLineDash([]);

  const rightFacts = [
    ['Small, dull, unscented petals with no nectar', 'nothing to attract insects — no reward is offered'],
    ['Anthers dangle out on long filaments', 'shake light, smooth pollen into the moving air'],
    ['Huge amounts of light, dry pollen', 'almost all of it lands uselessly, so much more is made'],
  ];
  rightFacts.forEach(([h, t], i) => {
    const y = 1220 + i * 150;
    drawBlock(ctx, h, 1780, y, 620, 'bold 30px Helvetica, Arial, sans-serif', INK, 36);
    drawBlock(ctx, t, 1780, y + 44, 620, '28px Helvetica, Arial, sans-serif', GREY, 34);
  });

  return { canvas: c, file: 'sas-repro-pollination.png' };
}

/* ------------------------------------------------------------------ */
/* 8. Pollen tube and fertilisation in plants                          */
/* ------------------------------------------------------------------ */
function renderPollenTube() {
  const W = 2400, H = 1700;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  // stigma
  ctx.beginPath();
  ctx.ellipse(600, 300, 110, 70, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#fca5a5';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#e11d48';
  ctx.stroke();

  // style
  roundRect(ctx, 560, 360, 80, 900, 12);
  ctx.fillStyle = '#dcfce7';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#166534';
  ctx.stroke();

  // ovary
  ctx.beginPath();
  ctx.ellipse(600, 1350, 190, 160, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#bbf7d0';
  ctx.fill();
  ctx.lineWidth = 6;
  ctx.strokeStyle = '#16a34a';
  ctx.stroke();

  // ovules
  for (const ox of [540, 680]) {
    ctx.beginPath();
    ctx.arc(ox, 1360, 50, 0, Math.PI * 2);
    ctx.fillStyle = '#fef9c3';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#ca8a04';
    ctx.stroke();
  }
  // egg nucleus inside the first ovule
  ctx.beginPath();
  ctx.arc(540, 1355, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#be123c';
  ctx.fill();

  // pollen grain
  ctx.beginPath();
  ctx.arc(600, 205, 42, 0, Math.PI * 2);
  ctx.fillStyle = '#fde047';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#ca8a04';
  ctx.stroke();

  // pollen tube down the style into the ovary
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(600, 250);
  ctx.bezierCurveTo(575, 600, 545, 1000, 540, 1330);
  ctx.stroke();

  // male nuclei travelling down the tube
  ctx.fillStyle = '#b45309';
  for (const [nx, ny] of [[592, 560], [582, 900], [560, 1220]]) {
    ctx.beginPath(); ctx.arc(nx, ny, 11, 0, Math.PI * 2); ctx.fill();
  }

  // right column: numbered stages
  function stageRow(y, n, text) {
    ctx.beginPath();
    ctx.arc(1000, y + 46, 48, 0, Math.PI * 2);
    ctx.fillStyle = '#e0f2fe';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#0369a1';
    ctx.stroke();
    ctx.font = 'bold 44px Helvetica, Arial, sans-serif';
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(n), 1000, y + 48);
    ctx.textBaseline = 'top';

    ctx.font = '32px Helvetica, Arial, sans-serif';
    ctx.fillStyle = INK;
    ctx.textAlign = 'left';
    const lines = wrapText(ctx, text, 1150);
    let yy = y + 8;
    for (const l of lines) { ctx.fillText(l, 1090, yy); yy += 44; }
  }

  const rows = [
    [320, 1, 'Pollen from another flower of the same species lands on the sticky stigma and sticks to it.'],
    [700, 2, 'The pollen grain grows a tube down through the style towards the ovary.'],
    [1080, 3, 'The male nucleus travels down the tube, enters an ovule, and fuses with the egg cell — fertilisation.'],
    [1460, 4, 'The fertilised ovule becomes a seed; the ovary swells around the seeds and becomes the fruit.'],
  ];
  for (const [y, n, t] of rows) stageRow(y, n, t);
  for (let i = 0; i < 3; i++) {
    arrow(ctx, 1000, rows[i][0] + 110, 1000, rows[i + 1][0] - 20, '#64748b', 6, 18);
  }

  return { canvas: c, file: 'sas-repro-pollen-tube.png' };
}

/* ------------------------------------------------------------------ */
/* 9. Seed structure and germination                                  */
/* ------------------------------------------------------------------ */
function renderSeed() {
  const W = 2400, H = 1700;
  const c = createCanvas(W, H);
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);

  ctx.font = 'bold 42px Helvetica, Arial, sans-serif';
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.fillText('A bean seed, cut open', 700, 120);

  // cotyledon (food store)
  ctx.beginPath();
  ctx.ellipse(700, 870, 245, 350, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#fde68a';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#d97706';
  ctx.stroke();

  // testa (outer coat)
  ctx.beginPath();
  ctx.ellipse(700, 850, 330, 430, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(254, 243, 199, 0)';
  ctx.fill();
  ctx.lineWidth = 9;
  ctx.strokeStyle = '#b45309';
  ctx.stroke();

  // embryo axis
  ctx.strokeStyle = '#166534';
  ctx.lineWidth = 9;
  ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(700, 540); ctx.lineTo(700, 1180); ctx.stroke();

  // plumule (embryonic shoot)
  for (const dir of [-1, 1]) {
    ctx.save();
    ctx.translate(700, 520);
    ctx.rotate(dir * rad(22));
    ctx.beginPath();
    ctx.ellipse(0, -40, 26, 52, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#86efac';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#16a34a';
    ctx.stroke();
    ctx.restore();
  }

  // radicle (embryonic root)
  ctx.beginPath();
  ctx.moveTo(700, 1120);
  ctx.quadraticCurveTo(635, 1210, 700, 1300);
  ctx.quadraticCurveTo(765, 1210, 700, 1120);
  ctx.closePath();
  ctx.fillStyle = '#bbf7d0';
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#16a34a';
  ctx.stroke();

  // left labels
  tagLabel(ctx, 240, 300, 'Plumule', 'grows into the shoot', [688, 505], 380);
  tagLabel(ctx, 240, 560, 'Testa', 'tough coat protecting the seed', [405, 830], 380);
  tagLabel(ctx, 240, 850, 'Cotyledon', 'food store for the growing seedling', [485, 900], 380);
  tagLabel(ctx, 240, 1150, 'Radicle', 'grows into the first root', [690, 1230], 380);

  // ---- right: germination sequence ----
  ctx.font = 'bold 42px Helvetica, Arial, sans-serif';
  ctx.fillStyle = INK;
  ctx.fillText('Germination: from seed to seedling', 1730, 120);

  const stages = [1140, 1500, 1860, 2220];
  const captions = [
    'dry seed takes\nin water',
    'the radicle breaks\nthrough the testa',
    'the plumule curves\nup through the soil',
    'first leaves open;\nthe food store is used up',
  ];

  stages.forEach((cx, i) => {
    // stage circle
    ctx.beginPath();
    ctx.arc(cx, 620, 140, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#cbd5e1';
    ctx.stroke();
    ctx.save();
    ctx.translate(cx, 620);

    if (i === 0) {
      ctx.beginPath(); ctx.ellipse(0, 0, 58, 78, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fde68a'; ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = '#b45309'; ctx.stroke();
    } else if (i === 1) {
      ctx.beginPath(); ctx.ellipse(0, -32, 52, 66, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#fde68a'; ctx.fill();
      ctx.lineWidth = 5; ctx.strokeStyle = '#b45309'; ctx.stroke();
      ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 9; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, 38); ctx.lineTo(0, 105); ctx.stroke();
    } else if (i === 2) {
      ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, 25); ctx.lineTo(0, 110); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.quadraticCurveTo(-45, -40, -55, -85); ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 0, 26, 0, Math.PI * 2);
      ctx.fillStyle = '#fde68a'; ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = '#b45309'; ctx.stroke();
    } else {
      ctx.strokeStyle = '#16a34a'; ctx.lineWidth = 8; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(0, 65); ctx.lineTo(0, 120); ctx.stroke();
      ctx.lineWidth = 5;
      for (const dx of [-14, 14]) {
        ctx.beginPath(); ctx.moveTo(0, 100); ctx.lineTo(dx, 120); ctx.stroke();
      }
      ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(0, 65); ctx.lineTo(0, -45); ctx.stroke();
      for (const dir of [-1, 1]) {
        ctx.save();
        ctx.translate(0, -55);
        ctx.rotate(dir * rad(38));
        ctx.beginPath(); ctx.ellipse(0, -26, 20, 34, 0, 0, Math.PI * 2);
        ctx.fillStyle = '#86efac'; ctx.fill();
        ctx.lineWidth = 4; ctx.strokeStyle = '#16a34a'; ctx.stroke();
        ctx.restore();
      }
    }
    ctx.restore();

    // number badge
    ctx.beginPath();
    ctx.arc(cx - 108, 512, 34, 0, Math.PI * 2);
    ctx.fillStyle = '#e0f2fe'; ctx.fill();
    ctx.lineWidth = 4; ctx.strokeStyle = '#0369a1'; ctx.stroke();
    ctx.font = 'bold 34px Helvetica, Arial, sans-serif';
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(String(i + 1), cx - 108, 514);
    ctx.textBaseline = 'top';

    // caption
    const lines = captions[i].split('\n');
    ctx.font = '27px Helvetica, Arial, sans-serif';
    ctx.fillStyle = GREY;
    ctx.textAlign = 'center';
    lines.forEach((l, j) => ctx.fillText(l, cx, 800 + j * 36));
  });

  // arrows between stages
  for (let i = 0; i < 3; i++) {
    arrow(ctx, stages[i] + 150, 620, stages[i + 1] - 150, 620, '#64748b', 6, 18);
  }

  // conditions pills
  const conds = ['Water', 'Oxygen', 'Warmth'];
  const condX = [1300, 1730, 2160];
  conds.forEach((t, i) => {
    roundRect(ctx, condX[i] - 170, 1000, 340, 90, 45);
    ctx.fillStyle = '#eff6ff';
    ctx.fill();
    ctx.lineWidth = 5;
    ctx.strokeStyle = '#1d4ed8';
    ctx.stroke();
    ctx.font = 'bold 36px Helvetica, Arial, sans-serif';
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(t, condX[i], 1045);
    ctx.textBaseline = 'top';
  });

  drawBlock(ctx, 'Germination needs water to soften the seed and activate its enzymes, oxygen for respiration to release energy, and warmth so the enzymes work. Light is not needed until the first leaves appear.', 1730, 1180, 1300, 'italic 28px Helvetica, Arial, sans-serif', GREY, 36);

  return { canvas: c, file: 'sas-repro-seed-germination.png' };
}

/* ------------------------------------------------------------------ */
const RENDERERS = { male: renderMale, female: renderFemale, gametes: renderGametes, placenta: renderPlacenta, menstrual: renderMenstrualGraph, flower: renderFlower, pollination: renderPollination, pollentube: renderPollenTube, seed: renderSeed };
const only = (process.env.RENDER_ONLY || '').split(',').filter(Boolean);
const names = only.length ? only : Object.keys(RENDERERS);
const results = [];
for (const name of names) {
  const render = RENDERERS[name];
  console.error('rendering ' + name);
  const t0 = Date.now();
  const { canvas, file } = render();
  console.error(name + ' drawn in ' + (Date.now() - t0) + 'ms');
  const bad = edgeCheck(canvas);
  const out = path.join(OUT_DIR, file);
  fs.writeFileSync(out, canvas.toBuffer('image/png'));
  results.push({ file, width: canvas.width, height: canvas.height, kb: Math.round(fs.statSync(out).size / 1024), edgeViolations: bad });
}
console.log(JSON.stringify(results, null, 2));
module.exports = { results };