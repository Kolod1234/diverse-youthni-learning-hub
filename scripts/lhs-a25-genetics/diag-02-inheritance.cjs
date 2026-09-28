// Diagrams 3-5: meiosis; monohybrid inheritance; codominance and blood groups.
const H = require('./common.cjs');
const { C } = H;

// ---------------- Diagram 3: meiosis ----------------
function drawMeiosis() {
  const W = 1600, HH = 950;
  const { canvas, ctx } = H.makeCanvas(W, HH);
  H.title(ctx, W, 'Meiosis: one diploid cell, four genetically different gametes',
    'Two divisions halve the chromosome number and shuffle the combinations');

  // chromosome colours
  const matC = '#e03131', patC = '#3b5bdb';

  const stages = [
    { x: 110, label: 'Parent cell (2n = 46)', sub: 'each chromosome has a partner: one from the mother, one from the father' },
    { x: 470, label: 'Meiosis I begins', sub: 'homologous pairs pair up and exchange pieces: crossing over' },
    { x: 830, label: 'Meiosis I ends', sub: 'the homologous pairs separate: cells are now haploid (n)' },
    { x: 1190, label: 'Meiosis II', sub: 'chromatids separate: four gametes, each genetically different' },
  ];

  const cellY = 300, cellR = 105;
  stages.forEach((s, i) => {
    H.panelBox(ctx, s.x - 20, 190, 310, 520, '#ffffff', C.panelBorder);
    H.textCentered(ctx, s.label, s.x + 135, 220, 280, 20, '700', C.accent);
    H.textCentered(ctx, s.sub, s.x + 135, 250, 272, 16, '400', C.sub);
  });

  // helper: draw a chromosome (X-ish shape) at x, y, half-length L, color
  function chrom(x, y, L, color, crossed) {
    ctx.strokeStyle = color;
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    const spread = L * 0.55;
    ctx.beginPath();
    ctx.moveTo(x - spread, y - L);
    ctx.quadraticCurveTo(x + (crossed ? 14 : -6), y, x - spread, y + L);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x + spread, y - L);
    ctx.quadraticCurveTo(x + (crossed ? -14 : 6), y, x + spread, y + L);
    ctx.stroke();
    // centromere
    ctx.fillStyle = '#1f2937';
    ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
    ctx.lineCap = 'butt';
  }

  // Stage 1: two homologous pairs inside one cell
  ctx.fillStyle = '#f1f5f9'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
  H.roundRect(ctx, 135, 195 + 60, 210, 210, 100); ctx.fill(); ctx.stroke();
  chrom(185, 195 + 130, 38, matC, true);
  chrom(215, 195 + 130, 38, patC, true);
  chrom(275, 195 + 130, 30, matC, false);
  chrom(305, 195 + 130, 30, patC, false);
  H.textCentered(ctx, 'homologous pair 1', 135 + 30, 492, 200, 15, '600', C.sub);
  H.textCentered(ctx, 'homologous pair 2', 235 + 30, 514, 200, 15, '600', C.sub);

  // Stage 2: bivalent with chiasmata (crossing over)
  ctx.fillStyle = '#f1f5f9'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
  H.roundRect(ctx, 495, 255, 210, 210, 100); ctx.fill(); ctx.stroke();
  ctx.save();
  ctx.strokeStyle = matC; ctx.lineWidth = 9; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(575, 285); ctx.lineTo(575, 345); ctx.lineTo(610, 385); ctx.lineTo(610, 440); ctx.stroke();
  ctx.strokeStyle = patC;
  ctx.beginPath(); ctx.moveTo(625, 285); ctx.lineTo(625, 345); ctx.lineTo(590, 385); ctx.lineTo(590, 440); ctx.stroke();
  ctx.lineCap = 'butt';
  ctx.restore();
  H.lead(ctx, 700, 470, 600, 400, '#b45309');
  H.textCentered(ctx, 'chiasma: the paired chromatids swap pieces', 640, 492, 250, 15, '600', '#b45309');
  H.textCentered(ctx, 'DNA replicated first: each chromosome is now two chromatids', 635, 520, 260, 15, '600', C.sub);

  // Stage 3: two haploid cells (pairs separated)
  [['A', 525], ['B', 685]].forEach((_, k) => {
    const cx = 525 + k * 160, cy = k === 0 ? 280 : 440;
    ctx.fillStyle = '#f1f5f9'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    H.roundRect(ctx, cx - 55, cy - 55, 110, 110, 54); ctx.fill(); ctx.stroke();
    if (k === 0) { chrom(cx - 18, cy, 26, matC, false); chrom(cx + 18, cy, 24, matC, false); }
    else { chrom(cx - 18, cy, 26, patC, false); chrom(cx + 18, cy, 24, patC, false); }
  });
  H.textCentered(ctx, 'maternal set', 610, 492, 200, 15, '600', matC);
  H.textCentered(ctx, 'paternal set', 700, 514, 200, 15, '600', patC);

  // Stage 4: four gametes
  const gx = [1160, 1270, 1160, 1270], gy = [280, 280, 440, 440];
  const gc = [matC, patC, patC, matC];
  for (let k = 0; k < 4; k++) {
    ctx.fillStyle = '#f1f5f9'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
    H.roundRect(ctx, gx[k] - 50, gy[k] - 50, 100, 100, 50); ctx.fill(); ctx.stroke();
    chrom(gx[k] - 16, gy[k], 22, gc[k], false);
    chrom(gx[k] + 16, gy[k], 20, gc[k] === matC ? patC : matC, false);
  }
  H.textCentered(ctx, 'each gamete carries one chromosome of each pair: n = 23', 1300, 520, 270, 15, '600', C.sub);

  // arrows between stages
  H.arrow(ctx, 380, 355, 440, 355, 4, C.accent);
  H.arrow(ctx, 790, 355, 850, 355, 4, C.accent);
  H.arrow(ctx, 1140, 355, 1140, 355, 4, C.accent);
  ctx.fillStyle = C.accent;
  H.arrow(ctx, 1080, 340, 1130, 340, 4, C.accent);
  H.arrow(ctx, 1080, 380, 1130, 380, 4, C.accent);

  // variation chips
  H.chip(ctx, 'Crossing over swaps pieces between maternal and paternal chromatids', 330, 760, 560, '#fef3c7', '#92400e', 18);
  H.chip(ctx, 'Independent assortment: either member of each pair can end up in any gamete', 1030, 760, 600, '#e0f2fe', '#075985', 18);
  H.textCentered(ctx, 'With 23 pairs, a single person can make over 8 million genetically different gametes before crossing over is even counted, so fertilisation makes every child unique', W / 2, 830, W - 160, 17, '400', C.sub);
  H.textCentered(ctx, 'Fertilisation restores the full number: n (23) from the sperm + n (23) from the egg = 2n (46)', W / 2, 870, W - 160, 17, '600', C.ok);

  H.save('a25-meiosis.png', canvas);
}

// ---------------- Diagram 4: monohybrid inheritance ----------------
function drawMonohybrid() {
  const W = 1600, HH = 950;
  const { canvas, ctx } = H.makeCanvas(W, HH);
  H.title(ctx, W, 'Monohybrid inheritance: one gene, two alleles, Punnett squares',
    'Mendel\u2019s cross of tall and short pea plants, and the ratios the examination asks you to predict');

  // ---- Panel 1: P and F1 ----
  const p1x = 70, p1y = 150, p1w = 700, p1h = 430;
  H.panelBox(ctx, p1x, p1y, p1w, p1h, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'Parent generation: pure-breeding tall \u00d7 pure-breeding short', p1x + p1w / 2, p1y + 28, p1w - 30, 20, '700', C.accent);
  // parent symbols
  H.chip(ctx, 'TT  (tall)', p1x + 160, p1y + 120, 180, '#eef2ff', '#3730a3', 20);
  H.chip(ctx, 'tt  (short)', p1x + p1w - 160, p1y + 120, 190, '#fee2e2', '#991b1b', 20);
  H.textCentered(ctx, 'homozygous dominant', p1x + 160, p1y + 160, 220, 15, '600', C.sub);
  H.textCentered(ctx, 'homozygous recessive', p1x + p1w - 160, p1y + 160, 230, 15, '600', C.sub);
  // gametes
  H.chip(ctx, 'gametes:  T only', p1x + 160, p1y + 230, 200, '#f8fafc', C.ink, 18);
  H.chip(ctx, 'gametes:  t only', p1x + p1w - 160, p1y + 230, 200, '#f8fafc', C.ink, 18);
  H.arrow(ctx, p1x + 230, p1y + 245, p1x + p1w - 240, p1y + 245, 3, C.accent);
  H.textCentered(ctx, 'every F1 offspring:  Tt  \u2014 all tall, because T dominates t', p1x + p1w / 2, p1y + 300, p1w - 60, 20, '700', C.ok);
  H.textCentered(ctx, 'The F1 plants are heterozygous: two different alleles, one visible in appearance', p1x + p1w / 2, p1y + 335, p1w - 60, 16, '400', C.sub);
  H.chip(ctx, 'F1 offspring:  Tt \u00d7 Tt  (let them self-pollinate)', p1x + p1w / 2, p1y + 385, p1w - 140, '#dcfce7', '#14532d', 19);

  // ---- Panel 2: F2 Punnett square ----
  const p2x = 70, p2y = 610, p2w = 700, p2h = 300;
  H.panelBox(ctx, p2x, p2y, p2w, p2h, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'The F2 Punnett square: 3 tall to 1 short', p2x + p2w / 2, p2y + 26, p2w - 30, 20, '700', C.accent);
  const sqx = p2x + 120, sqy = p2y + 60, cell = 92;
  // gamete labels
  ctx.fillStyle = '#94a3b8';
  H.textCentered(ctx, 'eggs \u2192', sqx - 55, sqy + cell / 2 + 42, 90, 16, '600', C.sub);
  ['T', 't'].forEach((g, j) => H.chip(ctx, g, sqx + cell / 2 + j * cell, sqy - 22, 60, '#eef2ff', '#3730a3', 20));
  ['T', 't'].forEach((g, i) => H.chip(ctx, g, sqx - 26, sqy + cell / 2 + i * cell, 60, '#fee2e2', '#991b1b', 20));
  const combos = [
    ['TT', '#eef2ff'], ['Tt', '#f8fafc'],
    ['Tt', '#f8fafc'], ['tt', '#fee2e2'],
  ];
  combos.forEach((cm, k) => {
    const i = Math.floor(k / 2), j = k % 2;
    const x = sqx + j * cell, y = sqy + i * cell;
    ctx.fillStyle = cm[1];
    ctx.strokeStyle = C.panelBorder; ctx.lineWidth = 2;
    H.roundRect(ctx, x, y, cell, cell, 10); ctx.fill(); ctx.stroke();
    H.textCentered(ctx, cm[0], x + cell / 2, y + cell / 2, 60, 24, '700', C.ink);
  });
  // ratio labels
  H.bracket(ctx, sqx, sqx + cell * 2, sqy + cell * 2 + 22, '3 tall : 1 short', C.ok);
  H.textLeft(ctx, 'TT and Tt look identical: the allele that is expressed is the dominant one. Only tt, with two copies of the recessive allele, is short.', sqx + 230, sqy + 40, 380, 17, '600', C.sub);
  H.textLeft(ctx, 'Phenotype ratio 3 : 1. Genotype ratio 1 TT : 2 Tt : 1 tt.', sqx + 230, sqy + 130, 380, 18, '700', C.ok);

  // ---- Panel 3: how to read any genetics question ----
  const p3x = 815, p3y = 150, p3w = 715, p3h = 760;
  H.panelBox(ctx, p3x, p3y, p3w, p3h, '#f8fafc', C.panelBorder);
  H.textCentered(ctx, 'The method that solves every inheritance question', p3x + p3w / 2, p3y + 28, p3w - 30, 20, '700', C.accent);
  const steps = [
    'Write the alleles with letters: a capital for dominance, the same letter lower case for the recessive allele',
    'Translate the words into genotypes: \u201cpure-breeding\u201d means homozygous (both alleles the same)',
    'Work out each parent\u2019s gametes: meiosis separates the pair, so each gamete carries one allele',
    'Draw the Punnett square: every combination of one egg and one sperm is an equally likely fertilisation',
    'Count the genotypes, then convert to phenotypes: ask which alleles are expressed in each combination',
    'State both ratios, and always give the phenotype ratio in the order the question asks for',
  ];
  steps.forEach((s, i) => {
    const y = p3y + 90 + i * 105;
    ctx.fillStyle = C.accent;
    ctx.beginPath(); ctx.arc(p3x + 60, y, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    H.textCentered(ctx, String(i + 1), p3x + 60, y, 30, 19, '700', '#ffffff');
    H.textLeft(ctx, s, p3x + 105, y, p3w - 150, 18, '600', C.ink);
    if (i < steps.length - 1) H.dashedLine(ctx, p3x + 60, y + 26, p3x + 60, y + 80, C.faint);
  });
  H.chip(ctx, 'Each square in the Punnett grid is one equally likely outcome, so ratios are counts of squares', p3x + p3w / 2, p3y + p3h - 40, p3w - 90, '#fef3c7', '#92400e', 17);

  H.save('a25-mendel-monohybrid.png', canvas);
}

// ---------------- Diagram 5: codominance, multiple alleles, blood groups ----------------
function drawBloodGroups() {
  const W = 1600, HH = 950;
  const { canvas, ctx } = H.makeCanvas(W, HH);
  H.title(ctx, W, 'Codominance and multiple alleles: the ABO blood groups',
    'One gene, three alleles, and a case where neither allele hides the other');

  // ---- Panel 1: the three alleles ----
  const p1x = 70, p1y = 150, p1w = 620, p1h = 480;
  H.panelBox(ctx, p1x, p1y, p1w, p1h, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'Three alleles, four blood groups', p1x + p1w / 2, p1y + 28, p1w - 30, 20, '700', C.accent);
  const rows = [
    ['IA', 'writes A antigen on red cells', 'IA is dominant over i'],
    ['IB', 'writes B antigen on red cells', 'IB is dominant over i'],
    ['i', 'writes no antigen at all', 'recessive to both IA and IB'],
  ];
  rows.forEach((r, i) => {
    const y = p1y + 95 + i * 105;
    ctx.fillStyle = ['#eef2ff', '#e0f2fe', '#f8fafc'][i];
    ctx.strokeStyle = C.panelBorder; ctx.lineWidth = 2;
    H.roundRect(ctx, p1x + 30, y - 38, p1w - 60, 88, 14); ctx.fill(); ctx.stroke();
    H.textCentered(ctx, r[0], p1x + 100, y + 4, 110, 30, '700', C.ink);
    H.textLeft(ctx, r[1], p1x + 180, y - 8, 400, 18, '600', C.ink);
    H.textLeft(ctx, r[2], p1x + 180, y + 22, 400, 16, '400', C.sub);
  });
  H.chip(ctx, 'IA and IB are codominant with each other: together they write BOTH antigens \u2192 group AB', p1x + p1w / 2, p1y + p1h - 40, p1w - 70, '#fef3c7', '#92400e', 17);
  H.textCentered(ctx, 'A person carries at most two of the three alleles: one inherited from each parent', p1x + p1w / 2, p1y + p1h - 8, p1w - 40, 16, '400', C.sub);

  // ---- Panel 2: genotype to phenotype table ----
  const p2x = 760, p2y = 150, p2w = 770, p2h = 480;
  H.panelBox(ctx, p2x, p2y, p2w, p2h, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'Every genotype and the blood group it produces', p2x + p2w / 2, p2y + 28, p2w - 30, 20, '700', C.accent);
  const tx = p2x + 60, ty = p2y + 70, cw = 210, rh = 74;
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(tx, ty, cw * 3, rh);
  ['Genotype', 'Antigens made', 'Blood group'].forEach((hd, j) => {
    H.textCentered(ctx, hd, tx + j * cw + cw / 2, ty + rh / 2, cw - 20, 19, '700', C.ink);
  });
  const data = [
    ['IA IA  or  IA i', 'A only', 'Group A'],
    ['IB IB  or  IB i', 'B only', 'Group B'],
    ['IA IB', 'A and B: codominance', 'Group AB'],
    ['i i', 'none', 'Group O'],
  ];
  data.forEach((r, i) => {
    const y = ty + rh * (i + 1);
    if (i % 2 === 1) { ctx.fillStyle = '#f8fafc'; ctx.fillRect(tx, y, cw * 3, rh); }
    ctx.strokeStyle = C.panelBorder; ctx.lineWidth = 1.5;
    ctx.strokeRect(tx, y, cw * 3, rh);
    r.forEach((cell, j) => {
      const color = j === 2 ? ['#dcfce7', '#e0f2fe', '#fef3c7', '#fee2e2'][i] : C.ink;
      if (j === 2) {
        ctx.fillStyle = color;
        ctx.fillRect(tx + j * cw + 4, y + 4, cw - 8, rh - 8);
      }
      H.textCentered(ctx, cell, tx + j * cw + cw / 2, y + rh / 2, cw - 20, j === 0 ? 20 : 18, '600', color === C.ink ? C.ink : '#1f2937');
    });
  });
  H.textCentered(ctx, 'Group O is the universal donor in this system because its cells carry no antigen to react with the recipient\u2019s antibodies', p2x + p2w / 2, p2y + p2h - 30, p2w - 60, 16, '400', C.sub);

  // ---- Panel 3: codominance Punnett square ----
  const p3x = 70, p3y = 680, p3w = 620, p3h = 230;
  H.panelBox(ctx, p3x, p3y, p3w, p3h, '#f0fdf4', '#bbf7d0');
  H.textCentered(ctx, 'Cross: group A (IA i) \u00d7 group B (IB i)', p3x + p3w / 2, p3y + 24, p3w - 30, 19, '700', '#15803d');
  const sqx = p3x + 90, sqy = p3y + 44, cell = 66;
  ['IA', 'i'].forEach((g, j) => H.chip(ctx, g, sqx + cell / 2 + j * cell, sqy - 14, 70, '#eef2ff', '#3730a3', 17));
  ['IB', 'i'].forEach((g, i) => H.chip(ctx, g, sqx - 24, sqy + cell / 2 + i * cell, 70, '#e0f2fe', '#075985', 17));
  const combos = [
    ['IA IB', '#fef3c7'], ['IA i', '#dcfce7'],
    ['IB i', '#e0f2fe'], ['i i', '#fee2e2'],
  ];
  combos.forEach((cm, k) => {
    const i = Math.floor(k / 2), j = k % 2;
    const x = sqx + j * cell, y = sqy + i * cell;
    ctx.fillStyle = cm[1];
    ctx.strokeStyle = C.panelBorder; ctx.lineWidth = 2;
    H.roundRect(ctx, x, y, cell, cell, 8); ctx.fill(); ctx.stroke();
    H.textCentered(ctx, cm[0], x + cell / 2, y + cell / 2, 90, 16, '700', C.ink);
  });
  H.textLeft(ctx, 'Four groups in one family: AB, A, B and O, all equally likely. A Punnett square can only predict these odds, not the children themselves.', sqx + 170, sqy + 40, 320, 16, '600', C.sub);

  // ---- Panel 4: sex determination ----
  const p4x = 760, p4y = 680, p4w = 770, p3h2 = 230;
  H.panelBox(ctx, p4x, p4y, p4w, p3h2, '#eef2ff', '#c7d2fe');
  H.textCentered(ctx, 'Sex determination: the father decides the sex of the child', p4x + p4w / 2, p4y + 24, p4w - 30, 19, '700', '#3730a3');
  H.chip(ctx, 'eggs: all carry  X', p4x + 170, p4y + 90, 220, '#fce7f3', '#9d174d', 18);
  H.chip(ctx, 'sperm:  X  or  Y', p4x + p4w - 200, p4y + 90, 240, '#e0e7ff', '#3730a3', 18);
  H.textCentered(ctx, 'XX \u2192 female    XY \u2192 male, each fertilisation 50 : 50', p4x + p4w / 2, p4y + 150, p4w - 60, 19, '700', C.ink);
  H.textCentered(ctx, 'The X and Y chromosomes also carry genes, which is what makes some conditions sex-linked', p4x + p4w / 2, p4y + 190, p4w - 60, 16, '400', C.sub);

  H.save('a25-blood-groups.png', canvas);
}

module.exports = { drawMeiosis, drawMonohybrid, drawBloodGroups };