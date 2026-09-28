// Diagrams 6-7: sex linkage pedigree; karyotype and non-disjunction.
const H = require('./common.cjs');
const { C } = H;

// ---------------- Diagram 6: pedigree chart, sex-linked inheritance ----------------
function drawPedigree() {
  const W = 1600, HH = 950;
  const { canvas, ctx } = H.makeCanvas(W, HH);
  H.title(ctx, W, 'Pedigree analysis: haemophilia in a family tree',
    'Tracking a recessive allele carried on the X chromosome');

  // ---- Panel 1: the pedigree ----
  const p1x = 70, p1y = 150, p1w = 940, p1h = 620;
  H.panelBox(ctx, p1x, p1y, p1w, p1h, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'A three-generation family: the question is who carries the allele', p1x + p1w / 2, p1y + 26, p1w - 30, 20, '700', C.accent);

  const maleFill = (state) => {
    if (state === 'affected') return '#cc2222';
    if (state === 'carrier') return '#ffffff';
    return '#ffffff';
  };
  function person(x, y, sex, state) {
    ctx.lineWidth = 3.5;
    if (sex === 'M') {
      ctx.fillStyle = state === 'affected' ? '#cc2222' : '#ffffff';
      ctx.strokeStyle = '#1f2937';
      H.roundRect(ctx, x - 34, y - 34, 68, 68, 10); ctx.fill(); ctx.stroke();
      if (state === 'carrier') { // half fill: dot in centre
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath(); ctx.arc(x, y, 13, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      ctx.fillStyle = state === 'affected' ? '#cc2222' : '#ffffff';
      ctx.strokeStyle = '#1f2937';
      ctx.beginPath(); ctx.arc(x, y, 36, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      if (state === 'carrier') { // left half filled
        ctx.save();
        ctx.beginPath(); ctx.arc(x, y, 33, Math.PI / 2, Math.PI * 1.5); ctx.closePath();
        ctx.fillStyle = '#f59e0b'; ctx.fill();
        ctx.restore();
      }
    }
  }
  function marriageLine(x1, y1, x2, y2) {
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(x1, y1 + 40); ctx.lineTo(x1, y1 + 62);
    ctx.lineTo(x2, y2 + 62); ctx.lineTo(x2, y2 + 40);
    ctx.stroke();
  }
  function childrenLine(parentX, yBar, kidsXs, kidY) {
    const midY = yBar + 26;
    ctx.strokeStyle = '#64748b'; ctx.lineWidth = 2.5;
    ctx.beginPath();
    const last = kidsXs[kidsXs.length - 1];
    ctx.moveTo(kidsXs[0], midY); ctx.lineTo(last, midY);
    ctx.stroke();
    kidsXs.forEach((kx) => {
      ctx.beginPath(); ctx.moveTo(kx, midY); ctx.lineTo(kx, kidY - 42); ctx.stroke();
    });
  }

  // Generation I: affected great-grandfather + carrier? Use classic haemophilia pedigree:
  // I-1 female carrier (X^H X^h) x I-2 male unaffected (X^H Y)
  person(p1x + 240, p1y + 150, 'F', 'carrier');
  person(p1x + 480, p1y + 150, 'M', 'clear');
  marriageLine(p1x + 240, p1y + 150, p1x + 480, p1y + 150);
  // Generation II
  const g2y = p1y + 330;
  childrenLine(p1x + 360, p1y + 150 + 62, [p1x + 160, p1x + 320, p1x + 480, p1x + 640], g2y);
  person(p1x + 160, g2y, 'F', 'clear');
  person(p1x + 320, g2y, 'M', 'affected');
  person(p1x + 480, g2y, 'F', 'carrier');
  person(p1x + 640, g2y, 'M', 'clear');
  // II-3 carrier marries II-4 clear male
  person(p1x + 800, g2y, 'M', 'clear');
  marriageLine(p1x + 480, g2y, p1x + 800, g2y);
  // Generation III: children of II-3 x II-4
  const g3y = p1y + 510;
  childrenLine(p1x + 640, g2y + 62, [p1x + 560, p1x + 720], g3y);
  person(p1x + 560, g3y, 'F', 'carrier');
  person(p1x + 720, g3y, 'M', 'affected');

  // generation labels
  ctx.fillStyle = C.accent;
  ['I', 'II', 'III'].forEach((g, i) => {
    H.textCentered(ctx, g, p1x + 52, p1y + 150 + i * 180, 60, 20, '700', C.accent);
  });
  // labels for individuals
  H.textLeft(ctx, 'carrier mother', p1x + 120, p1y + 105, 200, 15, '600', '#b45309');
  H.textLeft(ctx, 'unaffected father', p1x + 400, p1y + 105, 220, 15, '600', C.sub);
  H.textLeft(ctx, 'affected son: Xh Y', p1x + 240, g2y + 80, 200, 15, '700', '#b91c1c');
  H.textLeft(ctx, 'carrier daughter', p1x + 400, g2y + 80, 200, 15, '600', '#b45309');
  H.textLeft(ctx, 'each son has a 50 % chance of being affected', p1x + 520, g3y + 80, 380, 15, '600', C.sub);

  // legend
  const lx = p1x + 40, ly = p1y + p1h - 55;
  person(lx, ly, 'M', 'clear');
  H.textLeft(ctx, 'unaffected male', lx + 48, ly, 150, 15, '600', C.sub);
  person(lx + 200, ly, 'F', 'clear');
  H.textLeft(ctx, 'unaffected female', lx + 248, ly, 160, 15, '600', C.sub);
  person(lx + 410, ly, 'F', 'carrier');
  H.textLeft(ctx, 'carrier female (half filled)', lx + 458, ly, 220, 15, '600', '#b45309');
  person(lx + 700, ly, 'M', 'affected');
  H.textLeft(ctx, 'affected male (filled)', lx + 748, ly, 190, 15, '600', '#b91c1c');

  // ---- Panel 2: the genetics behind the tree ----
  const p2x = 1085, p2y = 150, p2w = 445, p2h = 620;
  H.panelBox(ctx, p2x, p2y, p2w, p2h, '#f8fafc', C.panelBorder);
  H.textCentered(ctx, 'Why the pattern looks like this', p2x + p2w / 2, p2y + 26, p2w - 30, 20, '700', C.accent);
  H.textCentered(ctx, 'The gene sits on the X chromosome. Females have two copies (XX); males have only one X.', p2x + p2w / 2, p2y + 72, p2w - 50, 17, '600', C.ink);
  H.textCentered(ctx, 'A male with one copy of the recessive allele is affected, because his Y chromosome carries no second allele to mask it.', p2x + p2w / 2, p2y + 120, p2w - 50, 17, '400', C.sub);
  // Punnett: carrier mother XH Xh x affected father Xh Y
  const sqx = p2x + 130, sqy = p2y + 200, cell = 84;
  ['XH', 'Xh'].forEach((g, j) => H.chip(ctx, g, sqx + cell / 2 + j * cell, sqy - 16, 70, '#f59e0b', '#92400e', 17));
  ['Xh', 'Y'].forEach((g, i) => H.chip(ctx, sqx - 26, sqy + cell / 2 + i * cell, 70, '#e0e7ff', '#3730a3', 17));
  const combos = [
    ['XH Xh', '#fef3c7', 'carrier daughter'],
    ['XH Y', '#dcfce7', 'unaffected son'],
    ['Xh Xh', '#fee2e2', 'affected daughter'],
    ['Xh Y', '#fee2e2', 'affected son'],
  ];
  combos.forEach((cm, k) => {
    const i = Math.floor(k / 2), j = k % 2;
    const x = sqx + j * cell, y = sqy + i * cell;
    ctx.fillStyle = cm[1];
    ctx.strokeStyle = C.panelBorder; ctx.lineWidth = 2;
    H.roundRect(ctx, x, y, cell, cell, 8); ctx.fill(); ctx.stroke();
    H.textCentered(ctx, cm[0], x + cell / 2, y + cell / 2 - 12, 80, 16, '700', C.ink);
    H.textCentered(ctx, cm[2].split(' ')[1] || cm[2], x + cell / 2, y + cell / 2 + 14, 80, 13, '400', C.sub);
  });
  H.textCentered(ctx, 'Half of all children are affected in this cross, and the famous pattern of the family tree follows: affected fathers pass the allele to ALL of their daughters and NONE of their sons, because a son gets his X from his mother.', p2x + p2w / 2, p2y + p2h - 80, p2w - 50, 16, '600', C.sub);
  H.chip(ctx, 'Colour blindness follows exactly the same rules', p2x + p2w / 2, p2y + p2h - 32, p2w - 80, '#e0f2fe', '#075985', 17);

  H.chip(ctx, 'A pedigree is evidence: you deduce genotypes from the pattern of who is affected, generation by generation', W / 2, HH - 24, 1000, C.accentSoft, '#3730a3');
  H.save('a25-pedigree.png', canvas);
}

// ---------------- Diagram 7: karyotype and non-disjunction ----------------
function drawKaryotype() {
  const W = 1600, HH = 950;
  const { canvas, ctx } = H.makeCanvas(W, HH);
  H.title(ctx, W, 'Karyotypes and chromosome disorders: the case of Down syndrome',
    'A karyotype displays the 46 chromosomes by size, pair by pair');

  // ---- Panel 1: karyotype grid ----
  const p1x = 70, p1y = 150, p1w = 1460, p1h = 430;
  H.panelBox(ctx, p1x, p1y, p1w, p1h, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'A karyotype: 22 matched pairs plus the sex chromosomes', p1x + p1w / 2, p1y + 26, p1w - 40, 20, '700', C.accent);

  function chromPair(x, y, L, wdt, color, extra) {
    // draw a pair (or trio) of simple chromosomes with centromere
    const n = extra ? 3 : 2;
    for (let k = 0; k < n; k++) {
      const cx = x + k * (wdt + 8) - (n - 1) * (wdt + 8) / 2;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(cx - wdt / 2, y);
      ctx.lineTo(cx + wdt / 2, y);
      ctx.lineTo(cx + wdt / 2, y + L * 0.35);
      ctx.quadraticCurveTo(cx, y + L * 0.45, cx + wdt / 2, y + L * 0.55);
      ctx.lineTo(cx + wdt / 2, y + L);
      ctx.lineTo(cx - wdt / 2, y + L);
      ctx.lineTo(cx - wdt / 2, y + L * 0.55);
      ctx.quadraticCurveTo(cx, y + L * 0.45, cx - wdt / 2, y + L * 0.35);
      ctx.closePath();
      ctx.fill();
    }
  }

  const rows = 4, cols = 6;
  const cellW = 224, cellH = 82;
  const gridX = p1x + 70, gridY = p1y + 70;
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      const num = i * cols + j + 1;
      if (num > 22) break;
      const x = gridX + j * cellW + cellW / 2;
      const y = gridY + i * cellH + 14;
      const L = 44 - Math.floor((num - 1) / 6) * 7;
      chromPair(x, y, Math.max(L, 20), 15, '#94a3b8', false);
      H.textCentered(ctx, String(num), x, gridY + i * cellH + cellH - 12, 60, 16, '700', C.sub);
    }
  }
  // pair 21 highlighted with three chromosomes (trisomy)
  const gx21 = gridX + (18 % 6) * cellW + cellW / 2;
  const gy21 = gridY + Math.floor(18 / 6) * cellH + 14;
  chromPair(gx21, gy21, 40, 15, '#cc2222', true);
  H.textCentered(ctx, '21', gx21, gy21 + cellH - 26, 60, 16, '700', '#b91c1c');
  H.lead(ctx, gx21 + 90, gy21 + 20, gx21 + 170, gy21 + 4, '#b91c1c');
  H.textLeft(ctx, 'THREE copies of chromosome 21', gx21 + 178, gy21 + 2, 320, 18, '700', '#b91c1c');
  H.textLeft(ctx, 'trisomy 21 causes Down syndrome', gx21 + 178, gy21 + 26, 320, 16, '600', C.sub);

  // sex chromosomes at right of last row
  const sx = gridX + 4 * cellW + cellW / 2, sy = gridY + 3 * cellH + 14;
  ctx.fillStyle = '#0ea5e9';
  // X (larger) and Y (smaller)
  const drawOne = (cx, cy, L, wdt) => {
    ctx.beginPath();
    ctx.moveTo(cx - wdt / 2, cy);
    ctx.lineTo(cx + wdt / 2, cy);
    ctx.lineTo(cx + wdt / 2, cy + L * 0.35);
    ctx.quadraticCurveTo(cx, cy + L * 0.45, cx + wdt / 2, cy + L * 0.55);
    ctx.lineTo(cx + wdt / 2, cy + L);
    ctx.lineTo(cx - wdt / 2, cy + L);
    ctx.lineTo(cx - wdt / 2, cy + L * 0.55);
    ctx.quadraticCurveTo(cx, cy + L * 0.45, cx - wdt / 2, cy + L * 0.35);
    ctx.closePath();
    ctx.fill();
  };
  drawOne(sx - 14, sy, 40, 16);
  drawOne(sx + 22, sy, 26, 13);
  H.textCentered(ctx, 'X   Y', sx + 4, sy + cellH - 12, 90, 16, '700', '#0369a1');

  H.chip(ctx, 'To prepare a karyotype, cells are grown, stopped at metaphase, stained and photographed; the chromosomes are then cut out and arranged by size', p1x + p1w / 2, p1y + p1h - 26, p1w - 160, '#eef2ff', '#3730a3', 16);

  // ---- Panel 2: non-disjunction ----
  const p2y = 620;
  H.panelBox(ctx, 70, p2y, 700, 270, '#fef2f2', '#fecaca');
  H.textCentered(ctx, 'How trisomy happens: non-disjunction in meiosis', 420, p2y + 26, 650, 20, '700', '#991b1b');
  // normal separation vs non-disjunction
  ctx.fillStyle = '#ffffff'; ctx.strokeStyle = '#991b1b'; ctx.lineWidth = 2;
  H.roundRect(ctx, 110, p2y + 60, 270, 180, 14); ctx.fill(); ctx.stroke();
  H.textCentered(ctx, 'Normal meiosis', 245, p2y + 84, 220, 17, '700', '#14532d');
  ctx.fillStyle = '#94a3b8';
  for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.arc(175 + k * 26, p2y + 130, 10, 0, Math.PI * 2); ctx.fill(); }
  for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.arc(255 + k * 26, p2y + 130, 10, 0, Math.PI * 2); ctx.fill(); }
  H.textCentered(ctx, 'each gamete gets one chromosome', 245, p2y + 190, 240, 15, '600', C.sub);
  H.roundRect(ctx, 460, p2y + 60, 280, 180, 14); ctx.fill(); ctx.stroke();
  H.textCentered(ctx, 'Non-disjunction', 600, p2y + 84, 240, 17, '700', '#b91c1c');
  ctx.fillStyle = '#94a3b8';
  for (let k = 0; k < 2; k++) { ctx.beginPath(); ctx.arc(505 + k * 24, p2y + 130, 10, 0, Math.PI * 2); ctx.fill(); }
  ctx.beginPath(); ctx.arc(690, p2y + 130, 10, 0, Math.PI * 2); ctx.fillStyle = '#94a3b8'; ctx.fill();
  H.textCentered(ctx, 'a pair fails to separate: one gamete gets BOTH, the other gets none', 600, p2y + 190, 250, 15, '600', C.sub);
  H.chip(ctx, 'Fertilised by a normal gamete \u2192 2n + 1: trisomy. Risk rises with the mother\u2019s age.', 420, p2y + 245, 620, '#fee2e2', '#991b1b', 16);

  // ---- Panel 3: reading a karyotype ----
  H.panelBox(ctx, 815, p2y, 715, 270, '#f8fafc', C.panelBorder);
  H.textCentered(ctx, 'What a karyotype can and cannot show', 1172, p2y + 26, 660, 20, '700', C.accent);
  H.textLeft(ctx, 'It CAN show: the number of chromosomes, the sex chromosomes (XX or XY), large structural changes, and missing or extra chromosomes such as trisomy 21.', 850, p2y + 80, 650, 17, '600', C.ink);
  H.textLeft(ctx, 'It CANNOT show: single-gene disorders such as cystic fibrosis, small mutations within one gene, or the dominance of an allele: that needs DNA analysis instead.', 850, p2y + 145, 650, 17, '600', C.ink);
  H.textLeft(ctx, 'Chorionic villus sampling or amniocentesis supply fetal cells during pregnancy; either can be karyotyped for prenatal diagnosis.', 850, p2y + 210, 650, 17, '400', C.sub);

  H.save('a25-karyotype.png', canvas);
}

module.exports = { drawPedigree, drawKaryotype };