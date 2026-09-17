#!/usr/bin/env node
/*
 * Renders the nine diagrams for Single Award Science lesson 1.7
 * (Disease and Body Defences) as high-resolution plotted PNGs, in the same
 * design language as the sas16 series (white background, Helvetica labels,
 * leader lines with dots, teal/coral accents, no edge clipping).
 *
 *   sas17-pathogen-types.png    - four pathogen type panels
 *   sas17-disease-spread.png    - four transmission route panels
 *   sas17-body-barriers.png     - labelled human body, first-line defences
 *   sas17-phagocytosis.png      - four stages of phagocytosis
 *   sas17-antibodies.png        - lock-and-key + agglutination panels
 *   sas17-vaccination.png       - primary/secondary response graph
 *   sas17-antibiotics.png       - bacteria vs virus target panels
 *   sas17-aseptic-technique.png - four-step practical panels
 *   sas17-defence-layers.png    - layered defences flow diagram
 *
 * Drafts are written to public/lesson-assets/sas-biology/draft-sas17/ first.
 * Set RENDER_ONLY=a,b,c to render a subset (comma-separated keys).
 */
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'public', 'lesson-assets', 'sas-biology', 'draft-sas17');
fs.mkdirSync(OUT_DIR, { recursive: true });

const INK = '#1e293b';
const GREY = '#475569';
const LEADER = '#64748b';
const TEAL = '#0f766e';
const CORAL = '#be123c';
const BLUE = '#1d4ed8';
const AMBER = '#b45309';
const LIGHT = '#e2e8f0';

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

function drawBlockLeft(ctx, text, x, y, maxW, font, color, lineH) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  const lines = wrapText(ctx, text, maxW);
  let yy = y;
  for (const l of lines) { ctx.fillText(l, x, yy); yy += lineH; }
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

function titleBlock(ctx, text, cx, y) {
  return drawBlock(ctx, text, cx, y, 1900, 'bold 52px Helvetica, Arial, sans-serif', INK, 62);
}

function labelPair(ctx, name, role, x, y, maxW) {
  // bold name with grey description underneath, left aligned
  const nb = drawBlockLeft(ctx, name, x, y, maxW, 'bold 38px Helvetica, Arial, sans-serif', INK, 44);
  const rb = drawBlockLeft(ctx, role, x, nb + 46, maxW, '28px Helvetica, Arial, sans-serif', GREY, 34);
  return rb;
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

function save(canvas, file, results) {
  const bad = edgeCheck(canvas);
  const buf = canvas.toBuffer('image/png');
  fs.writeFileSync(path.join(OUT_DIR, file), buf);
  results.push({ file, width: canvas.width, height: canvas.height, kb: Math.round(buf.length / 1024), edgeViolations: bad });
}

function newCanvas(W, H) {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
  return { canvas, ctx };
}

function panel(ctx, x, y, w, h) {
  ctx.strokeStyle = LIGHT;
  ctx.lineWidth = 4;
  roundRect(ctx, x, y, w, h, 28);
  ctx.stroke();
}

/* ---------- shared mini-drawings ---------- */

function drawBacterium(ctx, cx, cy, w, h, scale) {
  ctx.fillStyle = '#99f6e4';
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 6;
  roundRect(ctx, cx - w / 2, cy - h / 2, w, h, h / 2);
  ctx.fill();
  ctx.stroke();
  // free DNA dots
  ctx.fillStyle = TEAL;
  for (const [dx, dy] of [[-w * 0.2, -6], [0, 6], [w * 0.2, -4]]) {
    ctx.beginPath();
    ctx.arc(cx + dx, cy + dy, 6 * (scale || 1), 0, Math.PI * 2);
    ctx.fill();
  }
  // flagellum
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 4;
  ctx.beginPath();
  const fx = cx + w / 2;
  ctx.moveTo(fx, cy);
  for (let i = 1; i <= 8; i++) {
    ctx.lineTo(fx + i * 14, cy + (i % 2 === 0 ? 0 : 16) - 8);
  }
  ctx.stroke();
}

function drawVirus(ctx, cx, cy, r, spikeColor, bodyColor) {
  const n = 12;
  ctx.strokeStyle = spikeColor || CORAL;
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const x1 = cx + Math.cos(a) * r, y1 = cy + Math.sin(a) * r;
    const x2 = cx + Math.cos(a) * (r + 26), y2 = cy + Math.sin(a) * (r + 26);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(x2, y2, 8, 0, Math.PI * 2);
    ctx.fillStyle = spikeColor || CORAL;
    ctx.fill();
  }
  ctx.fillStyle = bodyColor || '#fee2e2';
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = spikeColor || CORAL;
  ctx.lineWidth = 6;
  ctx.stroke();
  // genetic material squiggle
  ctx.strokeStyle = spikeColor || CORAL;
  ctx.lineWidth = 5;
  ctx.beginPath();
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const x = cx - r * 0.5 + t * r;
    const y = cy + Math.sin(t * Math.PI * 4) * (r * 0.22);
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
}

function drawPhagocyteBlob(ctx, cx, cy, rx, ry, color, stroke) {
  ctx.fillStyle = color || '#c7d2fe';
  ctx.strokeStyle = stroke || '#4f46e5';
  ctx.lineWidth = 7;
  ctx.beginPath();
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const wob = 1 + 0.16 * Math.sin(a * 3 + 1);
    const x = cx + Math.cos(a) * rx * wob;
    const y = cy + Math.sin(a) * ry * wob;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // nucleus
  ctx.fillStyle = stroke || '#4f46e5';
  ctx.globalAlpha = 0.25;
  ctx.beginPath();
  ctx.ellipse(cx - rx * 0.18, cy - ry * 0.15, rx * 0.35, ry * 0.28, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawYAntibody(ctx, x, y, s, color) {
  // Y-shaped antibody, stem at (x, y+s*1.5), tips at top
  ctx.strokeStyle = color || CORAL;
  ctx.fillStyle = color || CORAL;
  ctx.lineWidth = 12 * s;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y + s * 1.5);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.lineTo(x - s, y - s);
  ctx.moveTo(x, y);
  ctx.lineTo(x + s, y - s);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x - s, y - s, s * 0.42, 0, Math.PI * 2);
  ctx.arc(x + s, y - s, s * 0.42, 0, Math.PI * 2);
  ctx.fill();
}

/* ------------------------------------------------------------------ */
/* 1. Pathogen types — four panels                                     */

function renderPathogenTypes(results) {
  const W = 2400, H = 1620;
  const { canvas, ctx } = newCanvas(W, H);
  titleBlock(ctx, 'The four types of pathogen', W / 2, 70);
  const pw = 1060, ph = 620, px = [110, 1230], py = [250, 940];
  const panels = [
    {
      name: 'Bacteria', draw: (cx, cy) => drawBacterium(ctx, cx, cy, 300, 130, 1),
      desc: 'Single-celled organisms with a cell wall and cell membrane but no nucleus. Some cause disease; many are harmless or useful.',
      ex: 'Cholera · tuberculosis · Salmonella food poisoning',
    },
    {
      name: 'Viruses', draw: (cx, cy) => drawVirus(ctx, cx, cy, 105),
      desc: 'Not cells: a strand of genetic material in a protein coat, about 100\u00d7 smaller than bacteria. They reproduce only inside living cells.',
      ex: 'Influenza · chickenpox · HIV/AIDS · colds',
    },
    {
      name: 'Fungi', draw: (cx, cy) => {
        ctx.strokeStyle = '#4d7c0f';
        ctx.lineWidth = 9;
        ctx.lineCap = 'round';
        // branching hyphae
        for (const [x1, y1, x2, y2] of [
          [cx - 150, cy + 90, cx + 150, cy - 40],
          [cx - 60, cy + 40, cx - 20, cy - 100],
          [cx - 60, cy + 40, cx + 40, cy + 110],
          [cx + 60, cy + 10, cx + 130, cy + 100],
        ]) {
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
        // spores at tips
        ctx.fillStyle = '#84cc16';
        for (const [sx, sy] of [[cx - 20, cy - 100], [cx + 150, cy - 40], [cx + 40, cy + 110], [cx + 130, cy + 100], [cx - 150, cy + 90]]) {
          ctx.beginPath();
          ctx.arc(sx, sy, 16, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#4d7c0f';
          ctx.lineWidth = 5;
          ctx.stroke();
        }
      },
      desc: 'Organisms that grow threads into (or across) living material and digest it. They thrive in warm, moist places.',
      ex: 'Athlete\u2019s foot · thrush · potato blight (plants)',
    },
    {
      name: 'Protists', draw: (cx, cy) => {
        ctx.fillStyle = '#dbeafe';
        ctx.strokeStyle = BLUE;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 160, 105, -0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // nucleus
        ctx.fillStyle = BLUE;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(cx - 20, cy - 10, 34, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        // flagellum
        ctx.strokeStyle = BLUE;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.moveTo(cx + 150, cy - 38);
        for (let i = 1; i <= 7; i++) ctx.lineTo(cx + 150 + i * 13, cy - 38 + (i % 2 === 0 ? 0 : 18) - 9);
        ctx.stroke();
      },
      desc: 'Single-celled organisms with a nucleus \u2014 more organised than bacteria. Disease-causing protists are parasites.',
      ex: 'Malaria (Plasmodium parasite, carried by mosquitoes)',
    },
  ];
  panels.forEach((p, i) => {
    const x = px[i % 2], y = py[Math.floor(i / 2)];
    panel(ctx, x, y, pw, ph);
    drawBlockLeft(ctx, p.name, x + 56, y + 44, pw - 112, 'bold 46px Helvetica, Arial, sans-serif', INK, 52);
    p.draw(x + pw / 2, y + 250);
    drawBlockLeft(ctx, p.desc, x + 56, y + 390, pw - 112, '29px Helvetica, Arial, sans-serif', GREY, 37);
    drawBlockLeft(ctx, p.ex, x + 56, y + 500, pw - 112, 'bold 29px Helvetica, Arial, sans-serif', TEAL, 37);
  });
  save(canvas, 'sas17-pathogen-types.png', results);
}

/* ------------------------------------------------------------------ */
/* 2. Disease spread — four route panels                               */

function renderDiseaseSpread(results) {
  const W = 2400, H = 1740;
  const { canvas, ctx } = newCanvas(W, H);
  titleBlock(ctx, 'How communicable diseases spread \u2014 four routes', W / 2, 70);
  const pw = 1060, ph = 660, px = [110, 1230], py = [250, 980];
  const panels = [
    {
      name: '1 \u00b7 Droplet infection',
      draw: (cx, cy) => {
        // head profile facing right
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(cx - 60, cy, 85, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // spray of droplets
        ctx.fillStyle = CORAL;
        for (let i = 0; i < 22; i++) {
          const a = -0.5 + (i % 5) * 0.24;
          const dist = 110 + (i % 4) * 45;
          ctx.beginPath();
          ctx.arc(cx - 60 + Math.cos(a) * dist, cy - 20 + Math.sin(a) * dist, 8 + (i % 3) * 4, 0, Math.PI * 2);
          ctx.fill();
        }
        arrow(ctx, cx - 60 + 100, cy - 20, cx - 60 + 230, cy - 20, LEADER, 5, 16);
      },
      ex: 'e.g. influenza, tuberculosis, COVID-19',
      ctrl: 'Catch coughs in a tissue \u00b7 bin it \u00b7 wash hands',
    },
    {
      name: '2 \u00b7 Direct contact',
      draw: (cx, cy) => {
        // two simplified hands meeting
        ctx.strokeStyle = '#94a3b8';
        ctx.fillStyle = '#e2e8f0';
        ctx.lineWidth = 6;
        for (const s of [-1, 1]) {
          roundRect(ctx, cx + s * 30 - (s < 0 ? 180 : 0) - (s > 0 ? 0 : 0), cy - 40, 180, 120, 40);
          ctx.fill();
          ctx.stroke();
          for (let f = 0; f < 3; f++) {
            ctx.beginPath();
            ctx.moveTo(cx + s * 30 - (s < 0 ? 0 : 0) - (s < 0 ? 0 : 0), cy - 10 + f * 36);
            ctx.lineTo(cx + s * 30 + (s < 0 ? -40 : 40) * 0, cy - 10 + f * 36);
            ctx.stroke();
          }
        }
        // fingers meeting point
        ctx.fillStyle = CORAL;
        ctx.beginPath();
        ctx.arc(cx, cy + 20, 14, 0, Math.PI * 2);
        ctx.fill();
      },
      ex: 'e.g. athlete\u2019s foot, chlamydia and other STIs',
      ctrl: 'Wash hands \u00b7 don\u2019t share towels \u00b7 barrier protection',
    },
    {
      name: '3 \u00b7 Contaminated food and water',
      draw: (cx, cy) => {
        // glass of water
        ctx.fillStyle = '#a5f3fc';
        ctx.strokeStyle = '#0e7490';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(cx - 70, cy - 90);
        ctx.lineTo(cx + 70, cy - 90);
        ctx.lineTo(cx + 52, cy + 100);
        ctx.lineTo(cx - 52, cy + 100);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        // pathogens inside
        ctx.fillStyle = CORAL;
        for (const [dx, dy] of [[-25, 10], [5, -25], [20, 45], [-10, 60]]) {
          ctx.beginPath();
          ctx.arc(cx + dx, cy + dy, 11, 0, Math.PI * 2);
          ctx.fill();
        }
      },
      ex: 'e.g. Salmonella food poisoning, cholera',
      ctrl: 'Cook food thoroughly \u00b7 wash fresh produce \u00b7 clean water',
    },
    {
      name: '4 \u00b7 Vectors',
      draw: (cx, cy) => {
        // mosquito
        ctx.fillStyle = GREY;
        ctx.strokeStyle = GREY;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 95, 40, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(cx - 120, cy - 6, 26, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath(); // proboscis
        ctx.moveTo(cx - 145, cy - 6);
        ctx.lineTo(cx - 200, cy - 6);
        ctx.stroke();
        ctx.globalAlpha = 0.45;
        ctx.fillStyle = '#94a3b8';
        for (const s of [-1, 1]) {
          ctx.beginPath();
          ctx.ellipse(cx + 10, cy - 40, 85, 22, s * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1;
        // legs
        ctx.strokeStyle = GREY;
        ctx.beginPath();
        for (let i = 0; i < 3; i++) {
          ctx.moveTo(cx - 20 + i * 30, cy + 30);
          ctx.lineTo(cx - 50 + i * 45, cy + 95);
        }
        ctx.stroke();
        // malaria protist carried
        ctx.fillStyle = BLUE;
        ctx.beginPath();
        ctx.arc(cx + 40, cy - 2, 9, 0, Math.PI * 2);
        ctx.fill();
      },
      ex: 'e.g. malaria (mosquito carries the Plasmodium protist)',
      ctrl: 'Drain standing water \u00b7 sleep under nets \u00b7 repellents',
    },
  ];
  panels.forEach((p, i) => {
    const x = px[i % 2], y = py[Math.floor(i / 2)];
    panel(ctx, x, y, pw, ph);
    drawBlockLeft(ctx, p.name, x + 56, y + 44, pw - 112, 'bold 42px Helvetica, Arial, sans-serif', INK, 48);
    p.draw(x + pw / 2, y + 280);
    const eb = drawBlockLeft(ctx, p.ex, x + 56, y + 470, pw - 112, 'bold 30px Helvetica, Arial, sans-serif', TEAL, 36);
    drawBlockLeft(ctx, 'Break the chain: ' + p.ctrl, x + 56, eb + 46, pw - 112, '29px Helvetica, Arial, sans-serif', BLUE, 36);
  });
  save(canvas, 'sas17-disease-spread.png', results);
}

/* ------------------------------------------------------------------ */
/* 3. Body barriers — labelled human figure                             */

function renderBodyBarriers(results) {
  const W = 2400, H = 1820;
  const { canvas, ctx } = newCanvas(W, H);
  titleBlock(ctx, 'The first line of defence \u2014 the body\u2019s barriers', W / 2, 70);
  const bodyCx = 1200, skin = '#dbeafe', outline = '#64748b';
  ctx.fillStyle = skin;
  ctx.strokeStyle = outline;
  ctx.lineWidth = 7;
  // head
  ctx.beginPath();
  ctx.arc(bodyCx, 400, 120, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // eyes
  ctx.fillStyle = INK;
  ctx.beginPath();
  ctx.arc(bodyCx - 45, 380, 9, 0, Math.PI * 2);
  ctx.arc(bodyCx + 45, 380, 9, 0, Math.PI * 2);
  ctx.fill();
  // nose
  ctx.strokeStyle = outline;
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(bodyCx, 390);
  ctx.lineTo(bodyCx, 430);
  ctx.stroke();
  // mouth
  ctx.beginPath();
  ctx.moveTo(bodyCx - 28, 465);
  ctx.lineTo(bodyCx + 28, 465);
  ctx.stroke();
  // torso
  roundRect(ctx, bodyCx - 250, 540, 500, 600, 90);
  ctx.fillStyle = skin;
  ctx.fill();
  ctx.stroke();
  // arms
  ctx.lineCap = 'round';
  ctx.lineWidth = 64;
  ctx.strokeStyle = skin;
  ctx.beginPath();
  ctx.moveTo(bodyCx - 240, 590);
  ctx.lineTo(bodyCx - 340, 900);
  ctx.moveTo(bodyCx + 240, 590);
  ctx.lineTo(bodyCx + 340, 900);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.strokeStyle = outline;
  ctx.beginPath();
  ctx.moveTo(bodyCx - 240, 590);
  ctx.lineTo(bodyCx - 340, 900);
  ctx.moveTo(bodyCx + 240, 590);
  ctx.lineTo(bodyCx + 340, 900);
  ctx.stroke();
  // legs
  ctx.lineWidth = 74;
  ctx.strokeStyle = skin;
  ctx.beginPath();
  ctx.moveTo(bodyCx - 110, 1120);
  ctx.lineTo(bodyCx - 150, 1560);
  ctx.moveTo(bodyCx + 110, 1120);
  ctx.lineTo(bodyCx + 150, 1560);
  ctx.stroke();
  ctx.lineWidth = 5;
  ctx.strokeStyle = outline;
  ctx.beginPath();
  ctx.moveTo(bodyCx - 110, 1120);
  ctx.lineTo(bodyCx - 150, 1560);
  ctx.moveTo(bodyCx + 110, 1120);
  ctx.lineTo(bodyCx + 150, 1560);
  ctx.stroke();
  // trachea (airway) from mouth down into torso
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(bodyCx, 470);
  ctx.lineTo(bodyCx, 700);
  ctx.stroke();
  // stomach bean
  ctx.fillStyle = '#fde68a';
  ctx.strokeStyle = AMBER;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.ellipse(bodyCx - 20, 890, 85, 115, 0.35, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = AMBER;
  drawBlock(ctx, 'HCl', bodyCx - 20, 875, 100, 'bold 30px Helvetica, Arial, sans-serif', AMBER, 34);
  // cut + scab on left arm
  ctx.strokeStyle = CORAL;
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.moveTo(bodyCx - 320, 770);
  ctx.lineTo(bodyCx - 285, 795);
  ctx.stroke();
  ctx.fillStyle = '#92400e';
  roundRect(ctx, bodyCx - 330, 775, 70, 26, 13);
  ctx.fill();
  // magnifier circle for cilia, right side
  const mgx = 1800, mgy = 760, mgr = 200;
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(bodyCx + 20, 640);
  ctx.lineTo(mgx - mgr, mgy - 40);
  ctx.moveTo(bodyCx + 20, 690);
  ctx.lineTo(mgx - mgr, mgy + 60);
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(mgx, mgy, mgr, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 9;
  ctx.stroke();
  // inside: mucus layer + cilia
  ctx.strokeStyle = '#a5b4fc';
  ctx.lineWidth = 18;
  ctx.beginPath();
  for (let i = 0; i <= 20; i++) {
    const x = mgx - mgr + 40 + i * 16;
    const y = mgy - 20 + Math.sin(i * 1.1) * 16;
    if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.strokeStyle = '#4f46e5';
  ctx.lineWidth = 7;
  for (let i = 0; i < 20; i++) {
    const x = mgx - mgr + 46 + i * 16;
    ctx.beginPath();
    ctx.moveTo(x, mgy + 4);
    ctx.lineTo(x - 10, mgy + 52);
    ctx.stroke();
  }
  drawBlock(ctx, 'mucus traps pathogens;', mgx, mgy + 90, mgr * 1.8, '25px Helvetica, Arial, sans-serif', GREY, 30);
  drawBlock(ctx, 'cilia sweep it upward', mgx, mgy + 122, mgr * 1.8, '25px Helvetica, Arial, sans-serif', GREY, 30);
  // labels, left column
  labelPair(ctx, 'Skin', 'tough, waterproof, complete \u2014 pathogens cannot cross unbroken skin', 120, 480, 380);
  leader(ctx, 500, 545, bodyCx - 250, 650);
  labelPair(ctx, 'Blood clot \u2192 scab', 'platelets trigger fibrin that seals cuts in minutes', 120, 740, 380);
  leader(ctx, 500, 805, bodyCx - 330, 790);
  labelPair(ctx, 'Hairs and mucus in the nose', 'filter and trap pathogens from inhaled air', 120, 1010, 380);
  leader(ctx, 500, 1075, bodyCx - 105, 405);
  // labels, right column
  labelPair(ctx, 'Tears', 'wash pathogens and dust off the eye with every blink', 1900, 380, 380);
  leader(ctx, 1900, 445, bodyCx + 55, 380);
  labelPair(ctx, 'Cilia line the airways', 'microscopic hairs beat in waves, sweeping trapped mucus to the throat', 1900, 1180, 380);
  leader(ctx, 1900, 1245, mgx + mgr, mgy + 40);
  labelPair(ctx, 'Stomach acid (about pH 2)', 'hydrochloric acid kills bacteria in anything swallowed', 1900, 1420, 380);
  leader(ctx, 1900, 1485, bodyCx + 65, 890);
  drawBlock(ctx, 'All of these barriers are non-specific: they block every pathogen equally, before any infection begins.', W / 2, 1680, 2000, 'bold 30px Helvetica, Arial, sans-serif', GREY, 38);
  save(canvas, 'sas17-body-barriers.png', results);
}

/* ------------------------------------------------------------------ */
/* 4. Phagocytosis — four stages                                       */

function renderPhagocytosis(results) {
  const W = 2400, H = 1480;
  const { canvas, ctx } = newCanvas(W, H);
  titleBlock(ctx, 'Phagocytosis \u2014 a phagocyte engulfs and digests a pathogen', W / 2, 70);
  const pw = 530, ph = 1060, gap = 60;
  const stages = [
    {
      n: '1', t: 'Detects the pathogen',
      d: 'The phagocyte (a white blood cell) moves towards the pathogen, attracted by chemicals it releases.',
      draw: (cx, cy) => {
        drawPhagocyteBlob(ctx, cx - 60, cy, 150, 120);
        drawVirus(ctx, cx + 140, cy, 55);
        arrow(ctx, cx + 60, cy + 6, cx + 20, cy + 6, LEADER, 5, 16);
      },
    },
    {
      n: '2', t: 'Engulfs it',
      d: 'The phagocyte changes shape and flows around the pathogen, wrapping it in its own cell membrane.',
      draw: (cx, cy) => {
        drawPhagocyteBlob(ctx, cx, cy, 150, 120);
        // pseudopodia arms
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 22;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.arc(cx, cy, 120, -0.7, 0.7);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx, cy, 120, Math.PI - 0.7, Math.PI + 0.7);
        ctx.stroke();
        drawVirus(ctx, cx + 95, cy, 42);
      },
    },
    {
      n: '3', t: 'Digests it',
      d: 'The pathogen is sealed inside a vacuole. Enzymes pour in and digest it completely.',
      draw: (cx, cy) => {
        drawPhagocyteBlob(ctx, cx, cy, 150, 120);
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(cx + 25, cy + 10, 55, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        drawVirus(ctx, cx + 25, cy + 10, 28);
        ctx.fillStyle = AMBER;
        for (const [dx, dy] of [[-70, -60], [70, -70], [-85, 55]]) {
          ctx.beginPath();
          ctx.arc(cx + dx, cy + dy, 9, 0, Math.PI * 2);
          ctx.fill();
        }
      },
    },
    {
      n: '4', t: 'Releases the debris',
      d: 'Harmless breakdown products are released or absorbed. The phagocyte survives and moves on to the next pathogen.',
      draw: (cx, cy) => {
        drawPhagocyteBlob(ctx, cx, cy, 150, 120);
        ctx.fillStyle = GREY;
        for (const [dx, dy] of [[170, -40], [185, 30], [200, -5], [160, 70]]) {
          ctx.beginPath();
          ctx.arc(cx + dx, cy + dy, 11, 0, Math.PI * 2);
          ctx.fill();
        }
        arrow(ctx, cx + 60, cy, cx + 140, cy - 20, LEADER, 5, 16);
      },
    },
  ];
  stages.forEach((s, i) => {
    const x = 90 + i * (pw + gap);
    panel(ctx, x, 240, pw, ph);
    ctx.fillStyle = TEAL;
    ctx.beginPath();
    ctx.arc(x + 66, 306, 34, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    drawBlock(ctx, s.n, x + 66, 292, 60, 'bold 36px Helvetica, Arial, sans-serif', '#ffffff', 40);
    s.draw(x + pw / 2, 520);
    const tb = drawBlock(ctx, s.t, x + pw / 2, 790, pw - 90, 'bold 34px Helvetica, Arial, sans-serif', INK, 40);
    drawBlock(ctx, s.d, x + pw / 2, tb + 60, pw - 90, '27px Helvetica, Arial, sans-serif', GREY, 34);
  });
  drawBlock(ctx, 'Phagocytes are non-specific: they engulf any pathogen they meet \u2014 bacterium, virus or fungus \u2014 without needing to identify it first.', W / 2, 1370, 2000, 'bold 30px Helvetica, Arial, sans-serif', GREY, 38);
  save(canvas, 'sas17-phagocytosis.png', results);
}

/* ------------------------------------------------------------------ */
/* 5. Antibodies — lock and key + agglutination                         */

function renderAntibodies(results) {
  const W = 2400, H = 1650;
  const { canvas, ctx } = newCanvas(W, H);
  titleBlock(ctx, 'Antibodies \u2014 the specific response of lymphocytes', W / 2, 70);
  // Panel A: lock and key
  panel(ctx, 110, 240, 1060, 1030);
  drawBlock(ctx, 'One antibody fits one antigen \u2014 lock and key', 640, 300, 960, 'bold 38px Helvetica, Arial, sans-serif', INK, 44);
  // pathogen blob with antigens
  const px0 = 470, py0 = 760;
  ctx.fillStyle = '#99f6e4';
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.ellipse(px0, py0, 210, 150, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = TEAL;
  const antigens = [[-150, -60, -0.6], [-160, 70, 0.4], [40, -130, -0.2], [30, 120, 0.3], [-70, 125, 0.5]];
  for (const [dx, dy, rot] of antigens) {
    ctx.save();
    ctx.translate(px0 + dx, py0 + dy);
    ctx.rotate(rot);
    roundRect(ctx, -14, -16, 42, 32, 8);
    ctx.fill();
    ctx.restore();
  }
  drawVirus(ctx, px0 - 20, py0 - 10, 34, TEAL, '#ccfbf1');
  // antibody bound to one antigen (right side)
  drawYAntibody(ctx, 830, 700, 95, CORAL);
  ctx.save();
  ctx.translate(px0 + 40, py0 - 130);
  ctx.rotate(-0.2);
  ctx.fillStyle = CORAL;
  roundRect(ctx, -26, -12, 60, 26, 9);
  ctx.fill();
  ctx.restore();
  drawBlock(ctx, 'antigen \u2014 a protein tag on the pathogen\u2019s surface', 640, 1030, 960, '27px Helvetica, Arial, sans-serif', GREY, 33);
  leader(ctx, 540, 1010, px0 + 42, py0 - 122);
  drawBlock(ctx, 'antibody \u2014 made by a lymphocyte; its binding sites fit one antigen exactly', 640, 1130, 960, '27px Helvetica, Arial, sans-serif', GREY, 33);
  leader(ctx, 640, 1112, 830, 636);
  // Panel B: agglutination
  panel(ctx, 1230, 240, 1060, 1030);
  drawBlock(ctx, 'Clumping (agglutination) \u2014 flagged for phagocytes', 1760, 300, 960, 'bold 38px Helvetica, Arial, sans-serif', INK, 44);
  const blobs = [[1520, 540], [1760, 470], [1980, 560], [1600, 760], [1860, 780], [2010, 700]];
  ctx.fillStyle = '#99f6e4';
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 6;
  for (const [bx, by] of blobs) {
    ctx.beginPath();
    ctx.ellipse(bx, by, 62, 48, Math.atan2(by - 610, bx - 1760), 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
  // Y antibodies linking blobs
  for (const [x1, y1, x2, y2] of [[1520, 540, 1760, 470], [1760, 470, 1980, 560], [1520, 540, 1600, 760], [1600, 760, 1860, 780], [1980, 560, 2010, 700], [1860, 780, 2010, 700]]) {
    const mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
    const ang = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2;
    const bx = mx + Math.cos(ang) * 46, by = my + Math.sin(ang) * 46;
    drawYAntibody(ctx, bx, by, 46, CORAL);
  }
  drawPhagocyteBlob(ctx, 2680 - 500, 1020, 120, 90);
  arrow(ctx, 2260, 1000, 2100, 960, LEADER, 6, 18);
  drawBlock(ctx, 'Each antibody has two binding sites, so pathogens are stuck together in clumps \u2014 far easier for a phagocyte to engulf.', 1760, 1130, 960, '27px Helvetica, Arial, sans-serif', GREY, 33);
  // bottom strip
  ctx.fillStyle = '#eff6ff';
  roundRect(ctx, 110, 1330, 2180, 130, 20);
  ctx.fill();
  drawBlock(ctx, 'Antitoxins: a second kind of antibody, which binds to and neutralises the toxins bacteria release, making the poison harmless.', 1200, 1362, 2000, 'bold 30px Helvetica, Arial, sans-serif', BLUE, 38);
  save(canvas, 'sas17-antibodies.png', results);
}

/* ------------------------------------------------------------------ */
/* 6. Vaccination — primary/secondary response graph                   */

function renderVaccination(results) {
  const W = 2400, H = 1580;
  const { canvas, ctx } = newCanvas(W, H);
  titleBlock(ctx, 'Memory makes the second response faster \u2014 the basis of vaccination', W / 2, 70);
  const ox = 340, oy = 1300;
  // axes
  ctx.strokeStyle = INK;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(ox, 220);
  ctx.lineTo(ox, oy);
  ctx.lineTo(2200, oy);
  ctx.stroke();
  // arrowheads
  arrow(ctx, ox, 260, ox, 215, INK, 8, 22);
  arrow(ctx, 2160, oy, 2205, oy, INK, 8, 22);
  // y label (rotated)
  ctx.save();
  ctx.translate(190, 760);
  ctx.rotate(-Math.PI / 2);
  ctx.font = 'bold 32px Helvetica, Arial, sans-serif';
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.fillText('Antibody level in the blood', 0, 0);
  ctx.restore();
  ctx.font = 'bold 32px Helvetica, Arial, sans-serif';
  ctx.fillStyle = INK;
  ctx.textAlign = 'right';
  ctx.fillText('Time \u2192', 2190, 1360);
  // exposure markers
  const ex1 = 700, ex2 = 1450;
  for (const ex of [ex1, ex2]) {
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.moveTo(ex, oy);
    ctx.lineTo(ex - 14, oy + 26);
    ctx.lineTo(ex + 14, oy + 26);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    ctx.setLineDash([12, 12]);
    ctx.beginPath();
    ctx.moveTo(ex, oy);
    ctx.lineTo(ex, oy - 1000);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  drawBlock(ctx, 'first exposure', ex1, oy + 46, 400, '28px Helvetica, Arial, sans-serif', GREY, 34);
  drawBlock(ctx, 'second exposure \u2014 same antigen', ex2, oy + 46, 480, '28px Helvetica, Arial, sans-serif', GREY, 34);
  // primary response curve
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 9;
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(ox + 20, oy - 12);
  ctx.lineTo(ex1 + 60, oy - 12);
  ctx.bezierCurveTo(ex1 + 220, oy - 12, ex1 + 200, oy - 250, ex1 + 340, oy - 280);
  ctx.bezierCurveTo(ex1 + 520, oy - 310, ex1 + 560, oy - 120, ex2 - 100, oy - 55);
  ctx.bezierCurveTo(ex2 - 20, oy - 40, ex2 - 60, oy - 30, ex2, oy - 28);
  ctx.stroke();
  // secondary response curve
  ctx.strokeStyle = CORAL;
  ctx.beginPath();
  ctx.moveTo(ex2, oy - 28);
  ctx.bezierCurveTo(ex2 + 90, oy - 26, ex2 + 110, oy - 300, ex2 + 220, oy - 430);
  ctx.bezierCurveTo(ex2 + 330, oy - 540, ex2 + 380, oy - 560, ex2 + 460, oy - 545);
  ctx.bezierCurveTo(ex2 + 560, oy - 520, ex2 + 640, oy - 420, 2160, oy - 350);
  ctx.stroke();
  // annotations
  drawBlock(ctx, 'Primary response: the antigen is new. Lymphocytes must build the right antibody \u2014 this takes days, so the person feels ill.', 830, 420, 560, 'bold 29px Helvetica, Arial, sans-serif', TEAL, 36);
  leader(ctx, 830, 560, ex1 + 320, oy - 270);
  drawBlock(ctx, 'Secondary response: memory lymphocytes recognise the antigen instantly \u2014 antibodies flood out within hours, at far higher levels. The pathogen is destroyed before symptoms begin.', 1980, 620, 420, 'bold 29px Helvetica, Arial, sans-serif', CORAL, 36);
  leader(ctx, 1900, 780, ex2 + 190, oy - 400);
  // legend
  ctx.font = 'bold 30px Helvetica, Arial, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillStyle = TEAL;
  ctx.fillText('\u2014  primary response', 500, 1480);
  ctx.fillStyle = CORAL;
  ctx.fillText('\u2014  secondary response (memory)', 900, 1480);
  save(canvas, 'sas17-vaccination.png', results);
}

/* ------------------------------------------------------------------ */
/* 7. Antibiotics — bacteria vs virus panels                           */

function renderAntibiotics(results) {
  const W = 2400, H = 1780;
  const { canvas, ctx } = newCanvas(W, H);
  titleBlock(ctx, 'Why antibiotics kill bacteria \u2014 but cannot touch viruses', W / 2, 70);
  // Panel A
  panel(ctx, 110, 240, 1060, 1150);
  drawBlock(ctx, 'A bacterium has a cell wall \u2014 a target', 640, 300, 960, 'bold 38px Helvetica, Arial, sans-serif', INK, 44);
  const bx = 560, by = 620;
  // cell wall (outer layer)
  ctx.strokeStyle = '#0f766e';
  ctx.lineWidth = 18;
  roundRect(ctx, bx - 240, by - 100, 480, 200, 100);
  ctx.stroke();
  // membrane + cytoplasm
  ctx.fillStyle = '#99f6e4';
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 6;
  roundRect(ctx, bx - 220, by - 80, 440, 160, 80);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = TEAL;
  for (const [dx, dy] of [[-90, -10], [-30, 12], [30, -14], [90, 8]]) {
    ctx.beginPath();
    ctx.arc(bx + dx, by + dy, 7, 0, Math.PI * 2);
    ctx.fill();
  }
  drawBlock(ctx, 'cell wall', bx, by + 130, 300, '27px Helvetica, Arial, sans-serif', GREY, 33);
  leader(ctx, bx + 100, by + 118, bx + 200, by - 95);
  // antibiotic molecules striking the wall
  ctx.fillStyle = BLUE;
  for (const [dx, dy] of [[-170, -190], [-40, -210], [90, -195]]) {
    ctx.beginPath();
    ctx.arc(bx + dx, by + dy, 22, 0, Math.PI * 2);
    ctx.fill();
    arrow(ctx, bx + dx, by + dy - 45, bx + dx, by + dy - 32, BLUE, 5, 14);
  }
  ctx.strokeStyle = CORAL;
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(bx - 195, by - 140);
  ctx.lineTo(bx - 145, by - 90);
  ctx.moveTo(bx - 145, by - 140);
  ctx.lineTo(bx - 195, by - 90);
  ctx.stroke();
  drawBlock(ctx, 'penicillin blocks the wall being built \u2014 dividing bacteria burst open', 640, 900, 960, '27px Helvetica, Arial, sans-serif', GREY, 33);
  drawBlock(ctx, 'Your own cells have no cell wall, so they are untouched.', 640, 1010, 960, 'bold 29px Helvetica, Arial, sans-serif', TEAL, 35);
  drawBlock(ctx, 'Antibiotic kills the bacteria \u2192 the cause of the disease is removed', 640, 1150, 960, 'bold 30px Helvetica, Arial, sans-serif', INK, 37);
  // Panel B
  panel(ctx, 1230, 240, 1060, 1150);
  drawBlock(ctx, 'A virus hides inside your cells', 1760, 300, 960, 'bold 38px Helvetica, Arial, sans-serif', INK, 44);
  const cx2 = 1760, cy2 = 660;
  ctx.fillStyle = '#f1f5f9';
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 8;
  roundRect(ctx, cx2 - 330, cy2 - 160, 660, 320, 60);
  ctx.fill();
  ctx.stroke();
  drawBlock(ctx, 'one of your body cells', cx2, cy2 - 145, 500, 'bold 29px Helvetica, Arial, sans-serif', GREY, 35);
  // nucleus
  ctx.fillStyle = '#c7d2fe';
  ctx.beginPath();
  ctx.arc(cx2 + 240, cy2 - 60, 45, 0, Math.PI * 2);
  ctx.fill();
  // viruses inside
  drawVirus(ctx, cx2 - 160, cy2 + 20, 42);
  drawVirus(ctx, cx2 - 20, cy2 + 60, 34);
  drawVirus(ctx, cx2 + 90, cy2 - 10, 30);
  // antibiotic bouncing off
  ctx.fillStyle = BLUE;
  ctx.beginPath();
  ctx.arc(cx2 - 430, cy2 + 40, 24, 0, Math.PI * 2);
  ctx.fill();
  arrow(ctx, cx2 - 400, cy2 + 40, cx2 - 345, cy2 + 40, BLUE, 5, 14);
  ctx.strokeStyle = CORAL;
  ctx.lineWidth = 9;
  ctx.beginPath();
  ctx.moveTo(cx2 - 420, cy2 - 10);
  ctx.lineTo(cx2 - 370, cy2 + 90);
  ctx.moveTo(cx2 - 370, cy2 - 10);
  ctx.lineTo(cx2 - 420, cy2 + 90);
  ctx.stroke();
  drawBlock(ctx, 'A virus has no wall, no cytoplasm, no metabolism of its own \u2014 nothing for the antibiotic to attack.', 1760, 920, 960, '27px Helvetica, Arial, sans-serif', GREY, 33);
  drawBlock(ctx, 'Worse: it reproduces inside your cells. A drug strong enough to destroy the virus there destroys your cell with it.', 1760, 1030, 960, '27px Helvetica, Arial, sans-serif', GREY, 33);
  drawBlock(ctx, 'Antibiotic has no effect on viral disease \u2014 flu, colds, chickenpox', 1760, 1170, 960, 'bold 30px Helvetica, Arial, sans-serif', INK, 37);
  // history strip
  ctx.fillStyle = '#fffbeb';
  roundRect(ctx, 110, 1450, 2180, 190, 24);
  ctx.fill();
  drawBlock(ctx, '1928 \u00b7 Alexander Fleming notices a Penicillium mould killing the bacteria on a forgotten dish.', 1200, 1490, 1980, '29px Helvetica, Arial, sans-serif', INK, 37);
  drawBlock(ctx, '1940s \u00b7 Howard Florey and Ernst Chain develop penicillin into the first modern antibiotic medicine.', 1200, 1545, 1980, '29px Helvetica, Arial, sans-serif', INK, 37);
  save(canvas, 'sas17-antibiotics.png', results);
}

/* ------------------------------------------------------------------ */
/* 8. Aseptic technique — four practical panels                        */

function renderAseptic(results) {
  const W = 2400, H = 1780;
  const { canvas, ctx } = newCanvas(W, H);
  titleBlock(ctx, 'Growing microorganisms safely \u2014 aseptic technique', W / 2, 70);
  const pw = 1060, ph = 680, px = [110, 1230], py = [250, 1000];
  const panels = [
    {
      n: '1', t: 'Sterilise the loop',
      d: 'Hold the inoculating loop in a Bunsen flame until it glows red. This kills every microorganism already on the wire.',
      draw: (cx, cy) => {
        // bunsen body
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 6;
        roundRect(ctx, cx - 50, cy - 10, 100, 190, 18);
        ctx.fill();
        ctx.stroke();
        // flame (blue)
        ctx.fillStyle = '#60a5fa';
        ctx.beginPath();
        ctx.moveTo(cx - 34, cy - 10);
        ctx.quadraticCurveTo(cx - 20, cy - 110, cx, cy - 150);
        ctx.quadraticCurveTo(cx + 20, cy - 110, cx + 34, cy - 10);
        ctx.closePath();
        ctx.fill();
        // wire loop
        ctx.strokeStyle = INK;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(cx + 90, cy - 190);
        ctx.lineTo(cx + 30, cy - 120);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(cx + 20, cy - 108, 18, 0, Math.PI * 2);
        ctx.stroke();
      },
    },
    {
      n: '2', t: 'Streak the agar',
      d: 'Open the Petri dish for as short a time as possible (work near the flame) and streak the loop gently across the agar.',
      draw: (cx, cy) => {
        ctx.fillStyle = '#f1f5f9';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(cx, cy, 175, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.strokeStyle = TEAL;
        ctx.lineWidth = 8;
        ctx.beginPath();
        ctx.moveTo(cx - 130, cy - 90);
        ctx.lineTo(cx + 120, cy - 40);
        ctx.lineTo(cx - 100, cy + 20);
        ctx.lineTo(cx + 130, cy + 80);
        ctx.stroke();
      },
    },
    {
      n: '3', t: 'Seal and label',
      d: 'Close the lid and seal it to the base with tape. Label the base \u2014 not the lid \u2014 with your name, the date and the organism.',
      draw: (cx, cy) => {
        ctx.fillStyle = '#f1f5f9';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 240, 62, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(cx, cy + 44, 220, 48, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        // tape
        ctx.fillStyle = '#fde047';
        roundRect(ctx, cx - 240, cy - 10, 480, 30, 8);
        ctx.fill();
        ctx.strokeStyle = '#a16207';
        ctx.lineWidth = 3;
        roundRect(ctx, cx - 240, cy - 10, 480, 30, 8);
        ctx.stroke();
        drawBlock(ctx, 'name \u00b7 date \u00b7 organism', cx, cy + 110, 400, '26px Helvetica, Arial, sans-serif', GREY, 32);
      },
    },
    {
      n: '4', t: 'Incubate upside down, 25 \u00b0C',
      d: 'Incubate upside down (condensation stays on the lid, not on the colonies) at 25 \u00b0C \u2014 the school maximum \u2014 for about 48 hours.',
      draw: (cx, cy) => {
        ctx.fillStyle = '#eff6ff';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 7;
        roundRect(ctx, cx - 230, cy - 150, 460, 300, 26);
        ctx.fill();
        ctx.stroke();
        // inverted dish: agar on top, lid below
        ctx.fillStyle = '#ccfbf1';
        ctx.strokeStyle = TEAL;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.ellipse(cx, cy - 40, 130, 30, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = TEAL;
        for (const [dx, dy] of [[-60, -50], [0, -32], [55, -52], [25, -12]]) {
          ctx.beginPath();
          ctx.arc(cx + dx, cy + dy, 9, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.fillStyle = '#e2e8f0';
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.ellipse(cx, cy + 10, 130, 26, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        drawBlock(ctx, '25 \u00b0C max', cx, cy + 100, 300, 'bold 32px Helvetica, Arial, sans-serif', AMBER, 38);
      },
    },
  ];
  panels.forEach((p, i) => {
    const x = px[i % 2], y = py[Math.floor(i / 2)];
    panel(ctx, x, y, pw, ph);
    ctx.fillStyle = TEAL;
    ctx.beginPath();
    ctx.arc(x + 66, y + 68, 34, 0, Math.PI * 2);
    ctx.fill();
    drawBlock(ctx, p.n, x + 66, y + 54, 60, 'bold 36px Helvetica, Arial, sans-serif', '#ffffff', 40);
    drawBlockLeft(ctx, p.t, x + 120, y + 48, pw - 200, 'bold 38px Helvetica, Arial, sans-serif', INK, 44);
    p.draw(x + pw / 2, y + 320);
    drawBlock(ctx, p.d, x + pw / 2, y + 500, pw - 110, '27px Helvetica, Arial, sans-serif', GREY, 34);
  });
  drawBlock(ctx, 'Every step either sterilises equipment or stops microorganisms entering or leaving the plate \u2014 that is what \u201c aseptic\u201d means.', W / 2, 1720, 2000, 'bold 30px Helvetica, Arial, sans-serif', GREY, 38);
  save(canvas, 'sas17-aseptic-technique.png', results);
}

/* ------------------------------------------------------------------ */
/* 9. Defence layers — flow diagram                                    */

function renderDefenceLayers(results) {
  const W = 2400, H = 1860;
  const { canvas, ctx } = newCanvas(W, H);
  titleBlock(ctx, 'The body\u2019s layered defences \u2014 from barrier to immunity', W / 2, 70);
  const cx = W / 2, bw = 1700;
  function band(y, h, headColor, head, lines) {
    roundRect(ctx, cx - bw / 2, y, bw, h, 26);
    ctx.strokeStyle = LIGHT;
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.fillStyle = headColor;
    roundRect(ctx, cx - bw / 2, y, bw, 96, 26);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 38px Helvetica, Arial, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(head, cx, y + 48);
    let yy = y + 140;
    for (const l of lines) {
      yy = drawBlock(ctx, l, cx, yy, bw - 160, '29px Helvetica, Arial, sans-serif', GREY, 38) + 38;
    }
  }
  function flow(y1, y2, label) {
    arrow(ctx, cx, y1, cx, y2, '#64748b', 8, 26);
    if (label) drawBlock(ctx, label, cx, (y1 + y2) / 2 - 18, 700, 'bold 28px Helvetica, Arial, sans-serif', LEADER, 34);
  }
  // top box
  roundRect(ctx, cx - 700, 210, 1400, 130, 26);
  ctx.strokeStyle = CORAL;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = '#fff1f2';
  ctx.fill();
  drawBlock(ctx, 'Pathogens arrive \u2014 in air, food, water or by contact', cx, 240, 1300, 'bold 34px Helvetica, Arial, sans-serif', CORAL, 40);
  flow(340, 400, 'the barriers try to stop them entering\u2026');
  band(400, 330, '#0f766e', 'FIRST LINE \u00b7 barriers (non-specific)', [
    'Skin \u00b7 blood clotting (scab) \u00b7 nose hairs \u00b7 mucus \u00b7 cilia \u00b7 stomach acid \u00b7 tears',
    'They block every pathogen equally and instantly \u2014 no infection begins if they hold.',
  ]);
  flow(730, 790, 'if any get through\u2026');
  band(790, 400, '#1d4ed8', 'SECOND LINE \u00b7 white blood cells', [
    'Phagocytes: engulf any pathogen they meet (phagocytosis) \u2014 non-specific.',
    'Lymphocytes: specific \u2014 antibodies bind the pathogen\u2019s antigens, clump them together',
    'and mark them for phagocytes; antitoxins neutralise bacterial toxins.',
  ]);
  flow(1190, 1250, 'after the battle is won\u2026');
  band(1250, 330, '#b45309', 'MEMORY & MEDICINE \u00b7 the third layer', [
    'Memory lymphocytes survive for years \u2192 active immunity (vaccination trains the system safely).',
    'Antibiotics kill bacteria the immune system is losing against; painkillers relieve symptoms only.',
  ]);
  flow(1580, 1640, '');
  roundRect(ctx, cx - 700, 1640, 1400, 130, 26);
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.fillStyle = '#f0fdfa';
  ctx.fill();
  drawBlock(ctx, 'Recovery \u2014 and the next encounter is met faster and harder', cx, 1670, 1300, 'bold 34px Helvetica, Arial, sans-serif', TEAL, 40);
  save(canvas, 'sas17-defence-layers.png', results);
}

/* ------------------------------------------------------------------ */

const RENDERERS = {
  'pathogen-types': renderPathogenTypes,
  'disease-spread': renderDiseaseSpread,
  'body-barriers': renderBodyBarriers,
  'phagocytosis': renderPhagocytosis,
  'antibodies': renderAntibodies,
  'vaccination': renderVaccination,
  'antibiotics': renderAntibiotics,
  'aseptic-technique': renderAseptic,
  'defence-layers': renderDefenceLayers,
};

const results = [];
const only = (process.env.RENDER_ONLY || '').split(',').map((s) => s.trim()).filter(Boolean);
const run = only.length ? only : Object.keys(RENDERERS);
let bad = 0;
for (const key of run) {
  if (!RENDERERS[key]) {
    console.error('Unknown renderer key: ' + key);
    bad = 1;
    continue;
  }
  RENDERERS[key](results);
}
console.log(JSON.stringify(results));
module.exports = results;