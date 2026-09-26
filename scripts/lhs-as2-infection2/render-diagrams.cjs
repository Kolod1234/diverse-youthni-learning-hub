// Renders the five custom diagrams for the LHS AS 2 "Infection and Immunity II"
// chapter into public/lesson-assets/lhs-as2/. Drawn with node-canvas at 2x.
// Curve values for the primary/secondary response graph follow standard
// textbook immunology (IgM-led primary response peaking around days 10-14;
// faster, higher IgG-led secondary response from memory cells).

const fs = require('fs');
const path = require('path');
const { createCanvas } = require('canvas');

const OUT_DIR = path.join(__dirname, '..', '..', 'public', 'lesson-assets', 'lhs-as2');
const SCALE = 2;
const FONT = "'DejaVu Sans', Arial, sans-serif";

function makeCanvas(w, h) {
  const canvas = createCanvas(w * SCALE, h * SCALE);
  const ctx = canvas.getContext('2d');
  ctx.scale(SCALE, SCALE);
  return { canvas, ctx };
}

function save(canvas, name) {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const file = path.join(OUT_DIR, name);
  fs.writeFileSync(file, canvas.toBuffer('image/png'));
  return { name, bytes: fs.statSync(file).size };
}

function setFont(ctx, size, weight) {
  ctx.font = `${weight || ''} ${size}px ${FONT}`.trim();
  ctx.textBaseline = 'alphabetic';
}

// ------------------------------------------------------------------
// Figure 1 — antibody anatomy (four chains, variable and constant regions)
// ------------------------------------------------------------------
function antibodyAnatomy() {
  const { canvas, ctx } = makeCanvas(1600, 920);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1600, 920);

  setFont(ctx, 40, 'bold');
  ctx.fillStyle = '#1f2937';
  ctx.textAlign = 'center';
  ctx.fillText('The structure of an antibody (immunoglobulin)', 800, 66);

  const cx = 620;          // centre of the molecule
  const stemTop = 470;     // where the stem meets the hinge
  const stemBottom = 800;
  const armLen = 210;      // length of each arm above the hinge
  const armAngle = 28;      // degrees each arm tilts from vertical
  const HEAVY = '#3557a7';
  const LIGHT = '#d97d3c';
  const VAR = '#c0392b';

  function roundedRect(ctx, x, y, w, h, r, fill) {
    ctx.fillStyle = fill;
    ctx.beginPath();
    const rad = Math.min(r, w / 2, h / 2);
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + w, y, x + w, y + h, rad);
    ctx.arcTo(x + w, y + h, x, y + h, rad);
    ctx.arcTo(x, y + h, x, y, rad);
    ctx.arcTo(x, y, x + w, y, rad);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.stroke();
  }

  // --- stem (two heavy chains side by side) ---
  roundedRect(ctx, cx - 40, stemTop, 30, stemBottom - stemTop, 14, HEAVY);
  roundedRect(ctx, cx + 10, stemTop, 30, stemBottom - stemTop, 14, HEAVY);

  // --- disulfide bonds in the hinge and stem ---
  ctx.strokeStyle = '#7a3c9c';
  ctx.lineWidth = 4;
  const ssJoints = [[stemTop + 40, cx - 10, cx + 10], [stemTop + 80, cx - 10, cx + 10]];
  for (const [y, xa, xb] of ssJoints) {
    ctx.beginPath();
    ctx.moveTo(xa, y);
    ctx.lineTo(xb, y + 8);
    ctx.stroke();
  }

  // --- arms: heavy chain continuation plus an outer light chain ---
  for (const side of [-1, 1]) {
    ctx.save();
    ctx.translate(cx, stemTop);
    ctx.rotate((armAngle * side) * Math.PI / 180);
    // constant part of the heavy chain in the arm
    roundedRect(ctx, -14, -armLen + 60, 28, armLen - 60, 13, HEAVY);
    // variable tip of the heavy chain
    roundedRect(ctx, -14, -armLen, 28, 62, 13, VAR);
    // light chain on the outer side
    const lx = side < 0 ? 14 : -46;
    roundedRect(ctx, lx, -armLen + 80, 32, 130, 13, LIGHT);
    // variable tip of the light chain
    roundedRect(ctx, lx, -armLen, 32, 82, 13, VAR);
    ctx.restore();
  }

  // --- antigen-binding site markers ---
  for (const side of [-1, 1]) {
    const ax = cx + Math.sin(armAngle * Math.PI / 180) * armLen * side;
    const ay = stemTop - Math.cos(armAngle * Math.PI / 180) * armLen;
    ctx.strokeStyle = '#c0392b';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ax, ay - 18, 26, 0, Math.PI * 2);
    ctx.stroke();
  }

  // --- labels with leader lines ---
  const labels = [
    { text: 'Antigen-binding site (variable region)', lx: 1080, ly: 190, tx: cx + 120, ty: 268, anchor: 'left' },
    { text: 'Variable region', lx: 1080, ly: 260, tx: cx + 160, ty: 330, anchor: 'left' },
    { text: 'Light chain (2 per antibody)', lx: 1080, ly: 380, tx: cx + 175, ty: 400, anchor: 'left' },
    { text: 'Hinge region', lx: 1080, ly: 500, tx: cx + 90, ty: 470, anchor: 'left' },
    { text: 'Disulfide bonds (S-S) hold the chains together', lx: 1080, ly: 600, tx: cx + 55, ty: 552, anchor: 'left' },
    { text: 'Constant region (Fc stem)', lx: 1080, ly: 720, tx: cx + 55, ty: 690, anchor: 'left' },
    { text: 'Heavy chain (2 per antibody)', lx: 150, ly: 500, tx: cx - 130, ty: 520, anchor: 'right' },
    { text: 'Binds receptors on phagocytes', lx: 150, ly: 740, tx: cx - 55, ty: 740, anchor: 'right' },
  ];
  setFont(ctx, 28, '');
  for (const l of labels) {
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(l.tx, l.ty);
    ctx.lineTo(l.lx + (l.anchor === 'left' ? -6 : 6), l.ly - 10);
    ctx.stroke();
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = l.anchor;
    const words = l.text.split(' ');
    if (ctx.measureText(l.text).width > 400) {
      const mid = Math.ceil(words.length / 2);
      ctx.fillText(words.slice(0, mid).join(' '), l.lx, l.ly - 44);
      ctx.fillText(words.slice(mid).join(' '), l.lx, l.ly - 10);
    } else {
      ctx.fillText(l.text, l.lx, l.ly);
    }
  }

  setFont(ctx, 26, '');
  ctx.fillStyle = '#6b7280';
  ctx.textAlign = 'center';
  ctx.fillText('Four polypeptide chains: two heavy and two light. The tips differ between antibodies - each one is shaped to fit one antigen.', 800, 880);
  return save(canvas, 'immunity2-antibody-anatomy.png');
}

// ------------------------------------------------------------------
// Figure 2 — primary versus secondary antibody response
// ------------------------------------------------------------------
function primarySecondaryResponse() {
  const { canvas, ctx } = makeCanvas(1600, 860);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1600, 860);

  setFont(ctx, 40, 'bold');
  ctx.fillStyle = '#1f2937';
  ctx.textAlign = 'center';
  ctx.fillText('Antibody concentration after first and second exposure', 800, 66);

  const x0 = 150, x1 = 1500, y0 = 700, yTop = 120, dayMax = 44, concMax = 100;
  const xFor = (d) => x0 + (d / dayMax) * (x1 - x0);
  const yFor = (c) => y0 - (c / concMax) * (y0 - yTop);

  // gridlines
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 2;
  setFont(ctx, 26, '');
  for (let c = 0; c <= 100; c += 25) {
    const y = yFor(c);
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'right';
    ctx.fillText(String(c), x0 - 14, y + 9);
  }
  for (let d = 0; d <= 40; d += 5) {
    const x = xFor(d);
    ctx.beginPath();
    ctx.moveTo(x, y0);
    ctx.lineTo(x, y0 + 14);
    ctx.stroke();
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'center';
    ctx.fillText(String(d), x, y0 + 48);
  }

  // axis titles
  setFont(ctx, 30, 'bold');
  ctx.save();
  ctx.translate(52, (yTop + y0) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#37474f';
  ctx.fillText('Antibody concentration (arbitrary units)', 0, 0);
  ctx.restore();
  ctx.fillStyle = '#37474f';
  ctx.fillText('Days after first exposure', (x0 + x1) / 2, y0 + 92);

  // axes
  ctx.strokeStyle = '#37474f';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x0, yTop - 8);
  ctx.lineTo(x0, y0);
  ctx.lineTo(x1, y0);
  ctx.stroke();

  // second-exposure marker
  ctx.strokeStyle = '#9ca3af';
  ctx.setLineDash([10, 8]);
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(xFor(28), y0);
  ctx.lineTo(xFor(28), yTop + 20);
  ctx.stroke();
  ctx.setLineDash([]);

  const primary = [
    [0, 0], [3, 0], [5, 1], [7, 4], [9, 9], [11, 15], [13, 21], [15, 25],
    [17, 23], [19, 20], [21, 16], [23, 12], [25, 9], [27, 7], [28, 5],
  ];
  const secondary = [
    [28, 5], [29, 10], [30, 22], [31, 38], [32, 55], [33, 70], [34, 81],
    [35, 88], [36, 90], [38, 88], [40, 85], [42, 82], [44, 79],
  ];

  function drawCurve(points, colour, width) {
    ctx.strokeStyle = colour;
    ctx.lineWidth = width;
    ctx.beginPath();
    points.forEach(([d, c], i) => {
      const x = xFor(d), y = yFor(c);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }
  drawCurve(primary, '#3557a7', 6);
  drawCurve(secondary, '#c0392b', 6);

  // annotations
  setFont(ctx, 28, 'bold');
  ctx.fillStyle = '#3557a7';
  ctx.textAlign = 'left';
  ctx.fillText('Primary response', xFor(16) + 18, yFor(30) - 8);
  setFont(ctx, 26, '');
  ctx.fillText('slow start (IgM first), moderate', xFor(16) + 18, yFor(30) + 24);
  ctx.fillText('peak, short-lived', xFor(16) + 18, yFor(30) + 54);

  ctx.fillStyle = '#c0392b';
  ctx.textAlign = 'right';
  setFont(ctx, 28, 'bold');
  ctx.fillText('Secondary response', xFor(33) - 20, yFor(88) - 18);
  setFont(ctx, 26, '');
  ctx.fillText('memory cells respond within hours (IgG),', xFor(33) - 20, yFor(88) + 14);
  ctx.fillText('peak is higher and antibody persists', xFor(33) - 20, yFor(88) + 44);

  ctx.fillStyle = '#37474f';
  ctx.textAlign = 'center';
  setFont(ctx, 26, '');
  ctx.fillText('second exposure', xFor(28), yTop + 2 + 42);
  ctx.fillText('to the same antigen', xFor(28), yTop + 44 + 68);

  setFont(ctx, 26, '');
  ctx.fillStyle = '#6b7280';
  ctx.fillText('The lag phase of the primary response is when symptoms of the disease are felt - the defences are being built, not yet working at full strength.', 800, 830);
  return save(canvas, 'immunity2-primary-secondary-response.png');
}

// ------------------------------------------------------------------
// Figure 3 — herd immunity: two population grids
// ------------------------------------------------------------------
function herdImmunity() {
  const { canvas, ctx } = makeCanvas(1600, 880);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1600, 880);

  setFont(ctx, 40, 'bold');
  ctx.fillStyle = '#1f2937';
  ctx.textAlign = 'center';
  ctx.fillText('Herd immunity: how the vaccinated protect the unvaccinated', 800, 66);

  const VACC = '#43a047';
  const SUSC = '#9e9e9e';
  const INF = '#c62828';
  const r = 17, gap = 54;

  function drawGrid(ox, oy, infectedSet, vaccinatedSet, title, subtitle) {
    setFont(ctx, 30, 'bold');
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'center';
    ctx.fillText(title, ox + 4.5 * gap, oy - 46);
    setFont(ctx, 26, '');
    ctx.fillStyle = '#37474f';
    ctx.fillText(subtitle, ox + 4.5 * gap, oy - 14);
    for (let i = 0; i < 10; i++) {
      for (let j = 0; j < 10; j++) {
        const key = i + ',' + j;
        let fill = SUSC, ring = null;
        if (vaccinatedSet.has(key)) fill = VACC;
        if (infectedSet.has(key)) { fill = INF; ring = '#7f1d1d'; }
        const x = ox + j * gap, y = oy + i * gap;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = fill;
        ctx.fill();
        if (ring) {
          ctx.strokeStyle = ring;
          ctx.lineWidth = 4;
          ctx.stroke();
        }
      }
    }
  }

  // Panel A: no vaccination, cluster of infections spreading
  const aInfected = new Set(['4,4', '4,5', '5,4', '5,5', '3,5', '5,3', '4,6', '6,5', '3,4']);
  const aVacc = new Set();
  drawGrid(140, 140, aInfected, aVacc, 'No vaccination', 'infection spreads through the population');
  ctx.fillStyle = '#37474f';
  setFont(ctx, 26, '');
  ctx.textAlign = 'center';
  ctx.fillText('Almost everyone is susceptible, so each case', 140 + 4.5 * gap, 140 + 10 * gap + 44);
  ctx.fillText('passes the infection to several others', 140 + 4.5 * gap, 140 + 10 * gap + 74);

  // Panel B: 95% vaccinated, scattered susceptibles protected
  const bSusceptible = ['2,3', '8,1', '4,8', '9,5', '0,9'];
  const bVacc = new Set();
  for (let i = 0; i < 10; i++) for (let j = 0; j < 10; j++) {
    if (!bSusceptible.includes(i + ',' + j)) bVacc.add(i + ',' + j);
  }
  bVacc.delete('5,5'); // one unvaccinated case
  const bInfected = new Set(['5,5']);
  drawGrid(880, 140, bInfected, bVacc, '95% vaccinated', 'transmission chains are broken');
  ctx.fillStyle = '#37474f';
  setFont(ctx, 26, '');
  ctx.textAlign = 'center';
  ctx.fillText('Almost everyone the case meets is immune,', 880 + 4.5 * gap, 140 + 10 * gap + 44);
  ctx.fillText('so the infection cannot reach the few left', 880 + 4.5 * gap, 140 + 10 * gap + 74);

  // legend
  const legend = [
    { colour: VACC, text: 'Vaccinated (immune)' },
    { colour: SUSC, text: 'Susceptible (not immune)' },
    { colour: INF, text: 'Infected' },
  ];
  let lx = 420;
  for (const it of legend) {
    ctx.beginPath();
    ctx.arc(lx, 826, 14, 0, Math.PI * 2);
    ctx.fillStyle = it.colour;
    ctx.fill();
    setFont(ctx, 26, '');
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'left';
    ctx.fillText(it.text, lx + 24, 834);
    lx += ctx.measureText(it.text).width + 130;
  }
  return save(canvas, 'immunity2-herd-immunity.png');
}

// ------------------------------------------------------------------
// Figure 4 — how antibiotic resistance is selected, four stages
// ------------------------------------------------------------------
function amrSelection() {
  const { canvas, ctx } = makeCanvas(1600, 820);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1600, 820);

  setFont(ctx, 40, 'bold');
  ctx.fillStyle = '#1f2937';
  ctx.textAlign = 'center';
  ctx.fillText('Natural selection produces antibiotic resistance', 800, 66);

  const SUSC = '#78909c';
  const RES = '#c62828';
  const r = 24;

  function panel(ox, title, cells) {
    // cells: array of {x, y, state: 's'|'r'|'dead', label?}
    for (const c of cells) {
      const x = ox + c.x, y = c.y;
      if (c.state === 'dead') {
        ctx.strokeStyle = '#c8cdd3';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x - 10, y - 10); ctx.lineTo(x + 10, y + 10);
        ctx.moveTo(x + 10, y - 10); ctx.lineTo(x - 10, y + 10);
        ctx.stroke();
      } else {
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = c.state === 'r' ? RES : SUSC;
        ctx.fill();
      }
    }
    setFont(ctx, 28, 'bold');
    ctx.fillStyle = '#1f2937';
    ctx.textAlign = 'center';
    const titleLines = title.split('\n');
    titleLines.forEach((line, idx) => ctx.fillText(line, ox + 170, 640 + idx * 34));
  }

  function grid(colours) {
    const cells = [];
    let k = 0;
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 4; j++) {
        cells.push({ x: 40 + j * 90, y: 140 + i * 110, state: colours[k] });
        k++;
      }
    }
    return cells;
  }

  panel(70, '1. Variation: a rare\nrandom mutation', grid(['s', 's', 's', 's', 's', 's', 's', 's', 's', 's', 'r', 's']));
  ctx.font = '';
  panel(475, '2. Antibiotic applied', (function () {
    const cells = grid(['dead', 'dead', 'dead', 'dead', 'dead', 'dead', 'dead', 'dead', 'dead', 'dead', 'r', 'dead']);
    return cells;
  })());
  panel(880, '3. Susceptible cells die', grid(['dead', 'dead', 'dead', 'dead', 'dead', 'dead', 'dead', 'dead', 'dead', 'r', 'dead', 'dead']));
  panel(1285, '4. Resistant cells\nmultiply', (function () {
    const cells = [];
    let k = 0;
    const states = ['r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r', 'r'];
    for (let i = 0; i < 3; i++) for (let j = 0; j < 4; j++) {
      cells.push({ x: 40 + j * 90, y: 140 + i * 110, state: states[k] });
      k++;
    }
    return cells;
  })());

  // stage captions
  const captions = [
    { x: 240, lines: ['Most bacteria are susceptible (grey);', 'one carries a resistance mutation (red).'] },
    { x: 645, lines: ['The antibiotic kills susceptible cells', 'and spares the resistant one.'] },
    { x: 1050, lines: ['Only the resistant bacterium survives', 'the selection pressure.'] },
    { x: 1455, lines: ['It divides repeatedly by binary fission -', 'the population is now resistant.'] },
  ];
  setFont(ctx, 24, '');
  ctx.fillStyle = '#37474f';
  ctx.textAlign = 'center';
  for (const c of captions) {
    ctx.fillText(c.lines[0], c.x, 700);
    ctx.fillText(c.lines[1], c.x, 728);
  }

  setFont(ctx, 26, '');
  ctx.fillStyle = '#6b7280';
  ctx.fillText('Resistance genes also spread between bacteria on plasmids passed through pili - so one resistant cell can share its protection with others.', 800, 790);
  return save(canvas, 'immunity2-amr-selection.png');
}

// ------------------------------------------------------------------
// Figure 5 — epidemic curve
// ------------------------------------------------------------------
function epidemicCurve() {
  const { canvas, ctx } = makeCanvas(1600, 840);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 1600, 840);

  setFont(ctx, 40, 'bold');
  ctx.fillStyle = '#1f2937';
  ctx.textAlign = 'center';
  ctx.fillText('An epidemic curve: new cases each day during an outbreak', 800, 66);

  const cases = [1, 1, 2, 3, 5, 8, 12, 17, 22, 25, 21, 16, 12, 8, 6, 4, 3, 2, 2, 1, 1];
  const days = cases.length;
  const x0 = 150, x1 = 1480, y0 = 690, yTop = 130;
  const vmax = 30;
  const slot = (x1 - x0) / days;
  const yFor = (v) => y0 - (v / vmax) * (y0 - yTop);

  // gridlines + y labels
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth = 2;
  setFont(ctx, 26, '');
  for (let v = 0; v <= 30; v += 10) {
    const y = yFor(v);
    ctx.beginPath();
    ctx.moveTo(x0, y);
    ctx.lineTo(x1, y);
    ctx.stroke();
    ctx.fillStyle = '#6b7280';
    ctx.textAlign = 'right';
    ctx.fillText(String(v), x0 - 14, y + 9);
  }
  setFont(ctx, 30, 'bold');
  ctx.save();
  ctx.translate(54, (yTop + y0) / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#37474f';
  ctx.fillText('New cases per day', 0, 0);
  ctx.restore();

  // axes
  ctx.strokeStyle = '#37474f';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(x0, yTop - 8);
  ctx.lineTo(x0, y0);
  ctx.lineTo(x1, y0);
  ctx.stroke();

  // bars
  cases.forEach((v, i) => {
    const bx = x0 + slot * i + 4;
    const bw = slot - 8;
    const y = yFor(v);
    ctx.fillStyle = '#3557a7';
    ctx.fillRect(bx, y, bw, y0 - y);
  });

  // x labels
  setFont(ctx, 26, '');
  ctx.fillStyle = '#6b7280';
  ctx.textAlign = 'center';
  for (let d = 0; d <= days; d += 5) {
    const x = x0 + slot * d;
    ctx.fillText(String(d), Math.min(x, x1 - 8), y0 + 46);
  }
  ctx.fillStyle = '#37474f';
  ctx.fillText('Days since the first case', (x0 + x1) / 2, y0 + 92);

  // annotations
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2.5;
  const peakX = x0 + slot * 9.5;
  const peakY = yFor(25);
  ctx.beginPath();
  ctx.moveTo(peakX, peakY - 60);
  ctx.lineTo(peakX, peakY - 14);
  ctx.stroke();
  setFont(ctx, 28, 'bold');
  ctx.fillStyle = '#c0392b';
  ctx.textAlign = 'center';
  ctx.fillText('peak of the outbreak', peakX, peakY - 78);

  ctx.fillStyle = '#37474f';
  ctx.textAlign = 'left';
  setFont(ctx, 26, '');
  ctx.fillText('steep rise: each case is passing', x0 + 20, 210);
  ctx.fillText('the infection to more than one person', x0 + 20, 240);
  ctx.fillText('long tail: occasional cases,', x0 + 780, 560);
  ctx.fillText('no longer a spreading chain', x0 + 780, 590);

  setFont(ctx, 26, '');
  ctx.fillStyle = '#6b7280';
  ctx.textAlign = 'center';
  ctx.fillText('Plotting cases against time shows how fast an outbreak is growing, when it peaks, and whether control measures are working.', 800, 800);
  return save(canvas, 'immunity2-epidemic-curve.png');
}

const results = [
  antibodyAnatomy(),
  primarySecondaryResponse(),
  herdImmunity(),
  amrSelection(),
  epidemicCurve(),
];
module.exports = { results };