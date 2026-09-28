// Diagrams 1-2: DNA structure; protein synthesis (transcription + translation).
const H = require('./common.cjs');
const { C } = H;

// ---------------- Diagram 1: DNA structure ----------------
function drawDnaStructure() {
  const W = 1600, HH = 950;
  const { canvas, ctx } = H.makeCanvas(W, HH);
  H.title(ctx, W, 'DNA: the double helix and the nucleotide',
    'A gene is a length of DNA; its base sequence carries the instructions for one polypeptide');

  // ---- Panel A: the double helix drawn as a flat ladder schematic ----
  const ax = 70, ay = 150, aw = 1460, ah = 480;
  H.panelBox(ctx, ax, ay, aw, ah, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'The two strands wind round each other and pair up base to base', ax + aw / 2, ay + 26, aw - 40, 21, '700', C.accent);

  const cy = ay + 250, amp = 105, x0 = ax + 80, x1 = ax + aw - 80, lam = 420;
  // two sinusoidal backbones
  const strandY = (x, phase) => cy + amp * Math.sin(2 * Math.PI * (x - x0) / lam + phase);
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#3b5bdb';
  ctx.beginPath();
  for (let x = x0; x <= x1; x += 3) { const y = strandY(x, 0); if (x === x0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
  ctx.stroke();
  ctx.strokeStyle = '#e03131';
  ctx.beginPath();
  for (let x = x0; x <= x1; x += 3) { const y = strandY(x, Math.PI); if (x === x0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
  ctx.stroke();

  // base pair rungs every 42 px, colours by pair type
  const rungColors = { AT: ['#4f46e5', '#f59e0b'], GC: ['#16a34a', '#0ea5e9'] };
  let pairFlip = 0;
  for (let x = x0 + 21; x <= x1 - 21; x += 42) {
    const yA = strandY(x, 0), yB = strandY(x, Math.PI);
    const pair = pairFlip % 2 === 0 ? rungColors.AT : rungColors.GC;
    ctx.strokeStyle = '#c7ccd8';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x, yA); ctx.lineTo(x, yB); ctx.stroke();
    ctx.fillStyle = pair[0];
    ctx.beginPath(); ctx.arc(x, yA, 9, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = pair[1];
    ctx.beginPath(); ctx.arc(x, yB, 9, 0, Math.PI * 2); ctx.fill();
    pairFlip++;
  }
  H.lead(ctx, ax + 120, ay + 70, x0 + 40, strandY(x0 + 40, 0) - 12, '#3b5bdb');
  H.textLeft(ctx, 'sugar-phosphate backbone (one per strand)', ax + 130, ay + 62, 460, 19, '600', '#3b5bdb');
  H.lead(ctx, ax + 620, ay + 62, x0 + 336, cy - 8, C.sub);
  H.textLeft(ctx, 'complementary base pairs held together by hydrogen bonds', ax + 630, ay + 56, 520, 19, '600', C.sub);
  // legend chips for the two pairings
  H.chip(ctx, 'A pairs only with T  (2 hydrogen bonds)', ax + 300, ay + ah - 56, 420, '#eef2ff', '#3730a3', 19);
  H.chip(ctx, 'G pairs only with C  (3 hydrogen bonds)', ax + 830, ay + ah - 56, 420, '#dcfce7', '#14532d', 19);
  H.textCentered(ctx, 'The base sequence of one strand determines the other exactly: each is a template for copying and repairing the other', ax + aw / 2, ay + ah - 16, aw - 60, 17, '400', C.sub);

  // ---- Panel B: one nucleotide in detail ----
  const by = 680;
  H.panelBox(ctx, ax, by, aw, 230, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'Zooming in: each strand is a chain of nucleotides', ax + aw / 2, by + 26, aw - 40, 21, '700', C.accent);

  const nbx = ax + 240, nby = by + 125;
  // phosphate
  ctx.fillStyle = '#f59e0b';
  ctx.beginPath(); ctx.arc(nbx, nby, 34, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#92400e'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.fillStyle = '#ffffff'; H.textCentered(ctx, 'P', nbx, nby, 40, 22, '700', '#ffffff');
  H.lead(ctx, nbx - 60, nby - 90, nbx, nby - 30, C.sub);
  H.textLeft(ctx, 'phosphate group', nbx - 200, nby - 96, 300, 19, '600', C.sub);
  // bond to sugar
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(nbx + 34, nby); ctx.lineTo(nbx + 100, nby); ctx.stroke();
  // deoxyribose pentagon
  const sx = nbx + 150, sy = nby, sr = 46;
  ctx.fillStyle = '#eef2ff'; ctx.strokeStyle = '#3730a3'; ctx.lineWidth = 2.5;
  ctx.beginPath();
  for (let i = 0; i < 5; i++) {
    const a = -Math.PI / 2 + i * 2 * Math.PI / 5;
    const px = sx + sr * Math.cos(a), py = sy + sr * Math.sin(a);
    if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fill(); ctx.stroke();
  H.lead(ctx, sx + 40, sy - 40, sx + 70, sy - 80, C.sub);
  H.textLeft(ctx, 'deoxyribose sugar', sx - 40, sy - 96, 300, 19, '600', C.sub);
  // base
  ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(sx + sr, sy); ctx.lineTo(sx + 110, sy); ctx.stroke();
  ctx.fillStyle = '#dcfce7'; ctx.strokeStyle = '#14532d';
  roundRectH(ctx, sx + 120, sy - 32, 120, 64, 12); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#14532d'; H.textCentered(ctx, 'base', sx + 180, sy, 90, 21, '700', '#14532d');
  H.lead(ctx, sx + 180, sy + 40, sx + 180, sy + 68, C.sub);
  H.textCentered(ctx, 'A, T, G or C  (deoxyribose has no oxygen on its sugar, hence deoxy)', sx + 240, sy + 80, 560, 18, '600', C.sub);
  // chain repeat arrow
  H.dashedLine(ctx, nbx - 34, nby + 70, nbx - 140, nby + 70, C.faint);
  H.arrow(ctx, nbx - 140, nby + 70, nbx - 190, nby + 70, 3, C.faint);
  H.arrow(ctx, sx + 250, sy, sx + 330, sy, 3, C.faint);
  H.textLeft(ctx, 'nucleotides link into a long chain by strong sugar-phosphate bonds', nbx + 420, nby + 40, 560, 19, '600', C.sub);

  H.chip(ctx, 'A human cell holds about 2 metres of DNA in 46 pieces: the chromosomes', W / 2, HH - 24, 900, C.amberSoft, '#92400e');
  H.save('a25-dna-structure.png', canvas);

  function roundRectH(c2, x, y, w, h, r) {
    c2.beginPath();
    c2.moveTo(x + r, y);
    c2.arcTo(x + w, y, x + w, y + h, r);
    c2.arcTo(x + w, y + h, x, y + h, r);
    c2.arcTo(x, y + h, x, y, r);
    c2.arcTo(x, y, x + w, y, r);
    c2.closePath();
  }
}

// ---------------- Diagram 2: protein synthesis ----------------
function drawProteinSynthesis() {
  const W = 1600, HH = 950;
  const { canvas, ctx } = H.makeCanvas(W, HH);
  H.title(ctx, W, 'From gene to protein: transcription and translation',
    'The base sequence of DNA becomes the amino acid sequence of a polypeptide');

  // ---- Panel 1: transcription in the nucleus ----
  const p1x = 70, p1y = 150, pw = 700, ph = 500;
  H.panelBox(ctx, p1x, p1y, pw, ph, '#f0f9ff', '#bae6fd');
  H.textCentered(ctx, '1. Transcription: in the nucleus', p1x + pw / 2, p1y + 28, pw - 30, 21, '700', '#0369a1');
  // nucleus = whole panel
  ctx.strokeStyle = '#0284c7'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(p1x + 130, p1y + 90, 46, 0, Math.PI * 2); ctx.stroke();
  H.textLeft(ctx, 'nucleus', p1x + 60, p1y + 90, 120, 16, '600', '#0369a1');

  // DNA segment (double line with rungs) partially unzipped
  const dx0 = p1x + 70, dx1 = p1x + 380, dy = p1y + 200;
  ctx.strokeStyle = '#3b5bdb'; ctx.lineWidth = 6;
  ctx.beginPath(); ctx.moveTo(dx0, dy - 26); ctx.lineTo(dx1 - 130, dy - 26); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(dx0, dy + 26); ctx.lineTo(dx1, dy + 26); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(dx1 - 130, dy - 26); ctx.quadraticCurveTo(dx1 + 30, dy - 46, dx1 + 90, dy - 60); ctx.stroke();
  for (let x = dx0 + 25; x < dx1 - 130; x += 34) {
    ctx.strokeStyle = '#c7ccd8'; ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x, dy - 24); ctx.lineTo(x, dy + 24); ctx.stroke();
  }
  H.textLeft(ctx, 'DNA gene: both strands unwind here', dx0, dy + 60, 340, 17, '600', C.sub);

  // mRNA being built along the template strand
  ctx.strokeStyle = '#e03131'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(dx1 - 120, dy + 26); ctx.quadraticCurveTo(dx1 + 60, dy + 60, dx1 + 200, dy + 30); ctx.stroke();
  ctx.fillStyle = '#e03131';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath(); ctx.arc(dx1 - 60 + i * 60, dy + 42 + (i % 2) * 8, 6, 0, Math.PI * 2); ctx.fill();
  }
  H.textLeft(ctx, 'RNA polymerase reads the template', dx0 + 330, dy - 60, 330, 17, '700', '#e03131');
  H.textLeft(ctx, 'strand and builds a messenger RNA copy', dx0 + 330, dy - 38, 330, 17, '400', C.sub);

  // mRNA exits through nuclear pore
  H.arrow(ctx, p1x + 470, p1y + 220, p1x + 640, p1y + 300, 4, '#e03131');
  ctx.fillStyle = '#e03131';
  roundRectSmall(ctx, p1x + 600, p1y + 300, 70, 22, 11); ctx.fill();
  H.textLeft(ctx, 'mRNA leaves the nucleus through a pore', p1x + 300, p1y + 330, 380, 17, '600', C.sub);
  H.chip(ctx, 'mRNA uses U (uracil) where DNA uses T (thymine)', p1x + pw / 2, p1y + ph - 52, pw - 80, '#fee2e2', '#991b1b', 18);
  H.textCentered(ctx, 'Thymine is replaced by uracil, and the sugar is ribose: this is RNA, a working copy that can travel', p1x + pw / 2, p1y + ph - 16, pw - 40, 16, '400', C.sub);

  // ---- Panel 2: translation at the ribosome ----
  const p2x = 70 + pw + 45, p2y = 150, pw2 = 680, ph2 = 500;
  H.panelBox(ctx, p2x, p2y, pw2, ph2, '#f0fdf4', '#bbf7d0');
  H.textCentered(ctx, '2. Translation: at a ribosome in the cytoplasm', p2x + pw2 / 2, p2y + 28, pw2 - 30, 21, '700', '#15803d');

  // ribosome blob over mRNA line
  const rx = p2x + 90, rmY = p2y + 210;
  ctx.strokeStyle = '#e03131'; ctx.lineWidth = 5;
  ctx.beginPath(); ctx.moveTo(rx, rmY); ctx.lineTo(p2x + pw2 - 60, rmY); ctx.stroke();
  ctx.fillStyle = '#e03131';
  for (let i = 0; i < 9; i++) {
    ctx.beginPath(); ctx.arc(rx + 30 + i * 62, rmY, 6, 0, Math.PI * 2); ctx.fill();
  }
  // ribosome
  ctx.fillStyle = '#a78bfa';
  ctx.beginPath(); ctx.ellipse(rx + 250, rmY - 34, 76, 46, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(rx + 250, rmY + 30, 58, 32, 0, 0, Math.PI * 2); ctx.fill();
  H.textCentered(ctx, 'ribosome', rx + 250, rmY - 30, 130, 18, '700', '#ffffff');
  // codon bracket on mRNA
  H.bracket(ctx, rx + 186, rx + 250, rmY + 26, 'one codon', C.sub);

  // tRNA arriving with amino acid
  const tX = rx + 218, tY = rmY - 120;
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.moveTo(tX, tY + 70);
  ctx.lineTo(tX - 26, tY + 14);
  ctx.lineTo(tX - 9, tY + 6);
  ctx.lineTo(tX - 9, tY - 14);
  ctx.lineTo(tX + 9, tY - 14);
  ctx.lineTo(tX + 9, tY + 6);
  ctx.lineTo(tX + 26, tY + 14);
  ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#166534';
  H.textCentered(ctx, 'tRNA', tX, tY + 18, 80, 17, '700', '#166534');
  H.textCentered(ctx, 'anticodon', tX, tY + 44, 140, 15, '600', '#166534');
  ctx.fillStyle = '#f59e0b';
  roundRectSmall(ctx, tX - 16, tY - 52, 34, 30, 8); ctx.fill();
  ctx.fillStyle = '#92400e';
  H.textCentered(ctx, 'aa', tX, tY - 37, 40, 16, '700', '#92400e');
  H.lead(ctx, tX + 30, tY - 37, rx + 205, rmY - 70, '#92400e');
  H.textLeft(ctx, 'each tRNA carries one amino acid', tX + 60, tY - 80, 280, 17, '600', '#92400e');

  // growing polypeptide chain
  ctx.strokeStyle = '#0f766e'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(rx + 330, rmY - 46); ctx.quadraticCurveTo(rx + 420, rmY - 120, rx + 520, rmY - 96); ctx.stroke();
  ctx.fillStyle = '#0f766e';
  roundRectSmall(ctx, rx + 300, rmY - 40, 26, 24, 6); ctx.fill();
  ctx.beginPath(); ctx.arc(rx + 336, rmY - 66, 12, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(rx + 366, rmY - 92, 12, 0, Math.PI * 2); ctx.fill();
  H.textLeft(ctx, 'growing polypeptide: amino acids joined by peptide bonds', rx + 400, rmY - 140, 320, 17, '600', '#0f766e');

  // codon table chip
  H.chip(ctx, 'Each codon of 3 bases = one amino acid. 64 codons: the code is nearly universal', p2x + pw2 / 2, p2y + ph2 - 52, pw2 - 70, '#dcfce7', '#14532d', 18);
  H.textCentered(ctx, 'Start codon AUG begins every gene; three stop codons end it. The code is degenerate: several codons can name the same amino acid', p2x + pw2 / 2, p2y + ph2 - 16, pw2 - 40, 16, '400', C.sub);

  H.chip(ctx, 'One gene, one polypeptide: the base sequence spells the order of amino acids', W / 2, HH - 24, 980, C.accentSoft, '#3730a3');
  H.save('a25-protein-synthesis.png', canvas);

  function roundRectSmall(c2, x, y, w, h, r) {
    c2.beginPath();
    c2.moveTo(x + r, y);
    c2.arcTo(x + w, y, x + w, y + h, r);
    c2.arcTo(x + w, y + h, x, y + h, r);
    c2.arcTo(x, y + h, x, y, r);
    c2.arcTo(x, y, x + w, y, r);
    c2.closePath();
  }
}

module.exports = { drawDnaStructure, drawProteinSynthesis };