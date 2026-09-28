// Diagrams 8-11: PCR and gel electrophoresis; genetic screening pathway;
// stem cell potency; somatic cell nuclear transfer (cloning).
const H = require('./common.cjs');
const { C } = H;

// ---------------- Diagram 8: PCR and gel electrophoresis ----------------
function drawPcrGel() {
  const W = 1600, HH = 950;
  const { canvas, ctx } = H.makeCanvas(W, HH);
  H.title(ctx, W, 'Analysing DNA: PCR and gel electrophoresis',
    'PCR copies a chosen DNA segment millions of times; the gel sorts the pieces by size');

  // ---- Panel 1: PCR cycle ----
  const p1x = 70, p1y = 150, p1w = 720, p1h = 640;
  H.panelBox(ctx, p1x, p1y, p1w, p1h, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'The polymerase chain reaction: three steps, repeated', p1x + p1w / 2, p1y + 26, p1w - 30, 20, '700', C.accent);

  const steps = [
    { t: '1. Denaturation  \u2248 95 \u00b0C', d: 'the double helix is heated until the hydrogen bonds break and the two strands separate', col: '#cc2222', soft: '#fee2e2' },
    { t: '2. Annealing  \u2248 50\u201360 \u00b0C', d: 'short primers bind to each strand, marking where copying must start', col: '#f59e0b', soft: '#fef3c7' },
    { t: '3. Extension  \u2248 72 \u00b0C', d: 'a heat-stable polymerase (Taq) builds new strands by adding nucleotides along the template', col: '#16a34a', soft: '#dcfce7' },
  ];
  steps.forEach((s, i) => {
    const y = p1y + 105 + i * 118;
    ctx.fillStyle = s.soft;
    ctx.strokeStyle = s.col; ctx.lineWidth = 2;
    H.roundRect(ctx, p1x + 40, y - 44, p1w - 80, 104, 14); ctx.fill(); ctx.stroke();
    H.textLeft(ctx, s.t, p1x + 70, y - 14, 420, 20, '700', s.col);
    H.textLeft(ctx, s.d, p1x + 70, y + 20, p1w - 160, 17, '400', C.ink);
  });
  // doubling note
  H.arrow(ctx, p1x + p1w / 2, p1y + p1h - 250, p1x + p1w / 2, p1y + p1h - 210, 4, C.accent);
  ctx.beginPath();
  ctx.strokeStyle = C.accent; ctx.lineWidth = 3;
  ctx.arc(p1x + p1w / 2, p1y + p1h - 185, 28, Math.PI * 0.2, Math.PI * 1.1);
  ctx.stroke();
  H.textCentered(ctx, 'each cycle doubles the number of copies: 30 cycles give over a billion copies of the target segment', p1x + p1w / 2, p1y + p1h - 110, p1w - 80, 18, '700', C.ink);
  H.chip(ctx, 'PCR works on vanishingly small samples: one hair root or a trace at a crime scene is enough', p1x + p1w / 2, p1y + p1h - 44, p1w - 90, '#eef2ff', '#3730a3', 16);

  // ---- Panel 2: gel electrophoresis ----
  const p2x = 860, p2y = 150, p2w = 670, p2h = 640;
  H.panelBox(ctx, p2x, p2y, p2w, p2h, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'Gel electrophoresis: sorting DNA fragments by size', p2x + p2w / 2, p2y + 26, p2w - 30, 20, '700', C.accent);
  // gel box
  const gx = p2x + 170, gy = p2y + 80, gw = 330, gh = 380;
  ctx.fillStyle = '#eff6ff';
  ctx.strokeStyle = C.panelBorder; ctx.lineWidth = 2.5;
  H.roundRect(ctx, gx, gy, gw, gh, 12); ctx.fill(); ctx.stroke();
  H.textCentered(ctx, 'agarose gel', gx + gw / 2, gy - 12, 200, 16, '600', C.sub);
  // negative electrode top, positive bottom
  ctx.fillStyle = '#334155';
  ctx.fillRect(gx - 26, gy - 6, gw + 52, 8);
  ctx.fillRect(gx - 26, gy + gh - 2, gw + 52, 8);
  H.textLeft(ctx, '\u2212 cathode: DNA is negatively charged', p2x + 20, gy + 2, 150, 14, '700', C.sub);
  H.textLeft(ctx, '+ anode', p2x + 20, gy + gh - 4, 150, 14, '700', C.sub);
  // lanes with bands
  const laneXs = [gx + 55, gx + 145, gx + 235, gx + 300];
  const bands = [
    [[30, 120, 210, 300]],                       // ladder
    [[36, 96, 236]],                             // suspect A
    [[36, 96, 236]],                             // suspect B
    [[52, 168, 258]],                            // suspect C
  ];
  laneXs.forEach((lx, li) => {
    ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(lx, gy + 10); ctx.lineTo(lx, gy + gh - 10); ctx.stroke();
    bands[li].flat().forEach((by) => {
      ctx.fillStyle = li === 0 ? '#0ea5e9' : (li === 3 ? '#cc2222' : '#16a34a');
      H.roundRect(ctx, lx - 22, gy + by, 44, 9, 4); ctx.fill();
    });
  });
  // labels
  const labels = ['size ladder', 'suspect A', 'suspect B', 'suspect C'];
  laneXs.forEach((lx, li) => {
    H.textCentered(ctx, labels[li], lx, gy + gh + 28, 130, 14, '600', C.sub);
  });
  H.textLeft(ctx, 'short fragments travel further towards the positive electrode; long ones lag behind', gx + 60, gy + gh + 66, 400, 16, '600', C.ink);
  H.lead(ctx, gx + 330, gy + 120, gx + gw - 8, gy + 40, '#075985');
  H.textLeft(ctx, 'small fragments, farthest', gx + 350, gy + 34, 200, 14, '600', '#075985');
  H.lead(ctx, gx + 330, gy + 300, gx + gw - 8, gy + 320, '#075985');
  H.textLeft(ctx, 'large fragments, slowest', gx + 350, gy + 336, 200, 14, '600', '#075985');
  // verdict chips
  H.chip(ctx, 'The scene sample matches suspects A and B: same band pattern, same DNA', p2x + p2w / 2, p2y + p2h - 96, p2w - 90, '#dcfce7', '#14532d', 17);
  H.textCentered(ctx, 'This pattern matching is the basis of DNA profiling in medicine, forensics and identifying remains', p2x + p2w / 2, p2y + p2h - 36, p2w - 60, 16, '400', C.sub);

  H.chip(ctx, 'PCR makes the copies; the gel measures them. Together they turn an invisible sample into a readable pattern', W / 2, HH - 24, 1080, C.accentSoft, '#3730a3');
  H.save('a25-pcr-gel.png', canvas);
}

// ---------------- Diagram 9: genetic screening pathway ----------------
function drawScreening() {
  const W = 1600, HH = 950;
  const { canvas, ctx } = H.makeCanvas(W, HH);
  H.title(ctx, W, 'Genetic screening and genetic counselling',
    'Testing tells people what their genes hold; counselling helps them decide what to do with the knowledge');

  const boxes = [
    { x: 70, t: 'Family history', d: 'Who has the condition? Counsellors draw a pedigree and work out the chance that a person carries the allele' },
    { x: 445, t: 'Genetic test', d: 'A blood or saliva sample: PCR and DNA analysis reveal whether the allele or mutation is present' },
    { x: 820, t: 'Results and risk', d: 'Carrier? Affected? At risk later in life? The result is explained clearly and in confidence' },
    { x: 1195, t: 'Informed choices', d: 'With a counsellor\u2019s support: monitoring, early treatment, preparing for care, or family planning decisions' },
  ];
  const by = 170, bh = 300, bw = 335;
  boxes.forEach((b, i) => {
    H.panelBox(ctx, b.x, by, bw, bh, i === 1 ? '#eef2ff' : '#ffffff', i === 1 ? '#a5b4fc' : C.panelBorder);
    ctx.fillStyle = C.accent;
    ctx.beginPath(); ctx.arc(b.x + 42, by + 42, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    H.textCentered(ctx, String(i + 1), b.x + 42, by + 42, 30, 17, '700', '#ffffff');
    H.textCentered(ctx, b.t, b.x + bw / 2 + 14, by + 46, bw - 80, 20, '700', C.ink);
    H.textLeft(ctx, b.d, b.x + 26, by + 96, bw - 52, 16, '400', C.sub);
    if (i < 3) H.arrow(ctx, b.x + bw + 6, by + bh / 2, b.x + bw + 34, by + bh / 2, 4, C.accent);
  });

  // screening contexts chips
  H.textCentered(ctx, 'Screening programmes test people who do not yet feel ill', W / 2, 530, W - 200, 19, '700', C.ink);
  const chips = [
    'Newborn: a heel-prick blood test within days of birth',
    'Carrier: couples planning a family, before pregnancy',
    'Prenatal: chorionic villus sampling or amniocentesis',
    'Predictive: adult-onset conditions such as Huntington\u2019s or breast-cancer risk genes',
  ];
  chips.forEach((c, i) => {
    const x = 200 + (i % 2) * 720, y = 590 + Math.floor(i / 2) * 70;
    H.chip(ctx, c, x, y, 640, '#f0fdf4', '#14532d', 17);
  });

  H.panelBox(ctx, 70, 750, 1460, 150, '#fef3c7', '#f59e0b');
  H.textCentered(ctx, 'What counselling adds that a result alone cannot', 800, 780, 800, 20, '700', '#92400e');
  H.textCentered(ctx, 'A result changes a life. The counsellor explains what the result does and does not mean, the real risks, the options open to the family, and the limits of what medicine can do. All of it is confidential, non-directive and given at the person\u2019s own pace, because the decisions belong to the family, not to the doctor.', 800, 850, 1380, 17, '600', C.ink);

  H.chip(ctx, 'Testing can be refused: the right NOT to know is part of informed consent', W / 2, HH - 24, 860, '#fee2e2', '#991b1b');
  H.save('a25-screening.png', canvas);
}

// ---------------- Diagram 10: stem cell potency ----------------
function drawStemCells() {
  const W = 1600, HH = 950;
  const { canvas, ctx } = H.makeCanvas(W, HH);
  H.title(ctx, W, 'Stem cells: potency, sources and why medicine wants them',
    'An unspecialised cell that can both divide indefinitely and turn into specialised cell types');

  // ---- Panel 1: potency funnel ----
  const p1x = 70, p1y = 150, p1w = 800, p1h = 500;
  H.panelBox(ctx, p1x, p1y, p1w, p1h, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'Potency: what a stem cell can become', p1x + p1w / 2, p1y + 26, p1w - 30, 20, '700', C.accent);
  const tiers = [
    { t: 'Totipotent', d: 'the fertilised egg and its first few divisions: can form a whole organism AND the placenta', w: 640, col: '#cc2222', soft: '#fee2e2' },
    { t: 'Pluripotent', d: 'cells of the early blastocyst: can form ANY cell type of the body, but not the placenta', w: 520, col: '#f59e0b', soft: '#fef3c7' },
    { t: 'Multipotent', d: 'adult stem cells such as bone marrow: can form several related types, mainly blood cells', w: 400, col: '#16a34a', soft: '#dcfce7' },
    { t: 'Differentiated', d: 'the mature cells of the body: red cells, muscle, nerve: no further choices', w: 280, col: '#64748b', soft: '#f1f5f9' },
  ];
  tiers.forEach((t, i) => {
    const y = p1y + 80 + i * 105;
    ctx.fillStyle = t.soft;
    ctx.strokeStyle = t.col; ctx.lineWidth = 2;
    const x = p1x + (p1w - t.w) / 2;
    H.roundRect(ctx, x, y, t.w, 82, 12); ctx.fill(); ctx.stroke();
    H.textCentered(ctx, t.t, x + t.w / 2, y + 24, t.w - 30, 20, '700', t.col);
    H.textCentered(ctx, t.d, x + t.w / 2, y + 52, t.w - 26, 15, '400', C.ink);
    if (i < 3) H.arrow(ctx, p1x + p1w / 2, y + 84, p1x + p1w / 2, y + 104, 3, C.sub);
  });

  // ---- Panel 2: sources ----
  const p2x = 950, p2y = 150, p2w = 580, p2h = 500;
  H.panelBox(ctx, p2x, p2y, p2w, p2h, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'Where stem cells come from', p2x + p2w / 2, p2y + 26, p2w - 30, 20, '700', C.accent);
  const srcs = [
    { t: 'Embryonic stem cells', d: 'taken from a 4\u20135 day blastocyst: pluripotent, the most versatile source', tag: 'most versatile, raises the deepest ethical questions' },
    { t: 'Adult stem cells', d: 'bone marrow, skin, gut lining: multipotent, and the basis of today\u2019s bone-marrow transplants', tag: 'already saving lives every day' },
    { t: 'Induced pluripotent (iPS) cells', d: 'adult cells reprogrammed in the lab back to pluripotency by switching on four key genes', tag: 'the ethical compromise: no embryo used' },
    { t: 'Umbilical cord blood', d: 'collected harmlessly at birth and stored; a source of blood-forming stem cells', tag: 'collected after birth, no embryo involved' },
  ];
  srcs.forEach((s, i) => {
    const y = p2y + 78 + i * 105;
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = C.panelBorder; ctx.lineWidth = 2;
    H.roundRect(ctx, p2x + 26, y - 36, p2w - 52, 92, 12); ctx.fill(); ctx.stroke();
    H.textLeft(ctx, s.t, p2x + 48, y - 12, 400, 18, '700', C.accent);
    H.textLeft(ctx, s.d, p2x + 48, y + 14, p2w - 110, 15, '400', C.ink);
    H.textLeft(ctx, s.tag, p2x + 48, y + 38, p2w - 110, 14, '600', '#0f766e');
  });

  // ---- Panel 3: why medicine wants them ----
  H.panelBox(ctx, 70, 690, 1460, 190, '#f0fdf4', '#bbf7d0');
  H.textCentered(ctx, 'Why medicine wants stem cells: repair by replacement', 800, 718, 900, 20, '700', '#15803d');
  H.textCentered(ctx, 'Many diseases are diseases of cells that the body cannot replace: heart muscle after a heart attack, dopamine-making neurons in Parkinson\u2019s disease, the insulin-making cells of type 1 diabetes, damaged spinal cord, the bone marrow destroyed by chemotherapy. Stem cells promise a repair kit: tissue grown from a patient\u2019s own cells could replace what the body cannot regrow, without the rejection that comes with another person\u2019s tissue. Some of this is already reality (bone marrow and cord blood transplants restore blood formation); the rest is the subject of intense, carefully regulated research.', 800, 795, 1380, 17, '600', C.ink);
  H.save('a25-stem-cells.png', canvas);
}

// ---------------- Diagram 11: somatic cell nuclear transfer ----------------
function drawScnt() {
  const W = 1600, HH = 950;
  const { canvas, ctx } = H.makeCanvas(W, HH);
  H.title(ctx, W, 'Cloning by somatic cell nuclear transfer (SCNT)',
    'How Dolly the sheep was made in 1996, and the two very different routes a clone can take');

  // Step panels across the top
  const steps = [
    { t: '1. Take a body cell', d: 'a somatic cell, for example a skin cell, from the animal to be copied. Its nucleus holds the full 2n set of genes.', icon: 'somatic' },
    { t: '2. Take an egg cell', d: 'an unfertilised egg from a female of the same species. Its own nucleus is removed and discarded.', icon: 'egg' },
    { t: '3. Fuse and activate', d: 'the somatic nucleus is placed into the egg and an electric pulse fuses them and triggers division, as if the egg had been fertilised.', icon: 'fusion' },
    { t: '4. An embryo grows', d: 'the egg divides and develops into an early embryo carrying exactly the same genes as the donor animal.', icon: 'embryo' },
  ];
  const sy = 150, sh = 300, sw = 350, gap = 23;
  steps.forEach((s, i) => {
    const x = 70 + i * (sw + gap);
    H.panelBox(ctx, x, sy, sw, sh, '#ffffff', C.panelBorder);
    H.textCentered(ctx, s.t, x + sw / 2, sy + 28, sw - 20, 19, '700', C.accent);
    // icon drawings
    const cx = x + sw / 2, cy = sy + 105;
    if (s.icon === 'somatic' || s.icon === 'egg') {
      ctx.fillStyle = s.icon === 'somatic' ? '#eef2ff' : '#fce7f3';
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx, cy, 52, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#4f46e5';
      ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      H.textCentered(ctx, '2n', cx, cy, 40, 16, '700', '#ffffff');
      if (s.icon === 'egg') {
        ctx.strokeStyle = '#b91c1c'; ctx.lineWidth = 2.5;
        ctx.setLineDash([7, 5]);
        ctx.beginPath(); ctx.arc(cx, cy, 20, 0, Math.PI * 2); ctx.stroke();
        ctx.setLineDash([]);
        H.textCentered(ctx, 'nucleus removed', cx, cy + 82, 200, 15, '600', '#b91c1c');
      } else {
        H.textCentered(ctx, 'nucleus kept: full set of genes', cx, cy + 82, 240, 15, '600', '#3730a3');
      }
    } else if (s.icon === 'fusion') {
      ctx.fillStyle = '#fce7f3';
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(cx - 30, cy, 52, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#4f46e5';
      ctx.beginPath(); ctx.arc(cx - 30, cy, 20, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      H.textCentered(ctx, '2n', cx - 30, cy, 40, 15, '700', '#ffffff');
      // electric pulse
      ctx.strokeStyle = '#f59e0b'; ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(cx + 20, cy - 34); ctx.lineTo(cx + 4, cy - 14); ctx.lineTo(cx + 26, cy - 8); ctx.lineTo(cx + 8, cy + 22);
      ctx.stroke();
      H.textCentered(ctx, 'electric pulse', cx + 30, cy + 82, 180, 15, '600', '#b45309');
    } else {
      // embryo: cluster of cells
      ctx.fillStyle = '#e0f2fe'; ctx.strokeStyle = '#0369a1'; ctx.lineWidth = 2.5;
      const cells = [[0, 0, 24], [ -32, -20, 20], [32, -20, 20], [-30, 22, 20], [30, 22, 20]];
      cells.forEach((c) => {
        ctx.beginPath(); ctx.arc(cx + c[0], cy + c[1], c[2], 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      });
      H.textCentered(ctx, 'dividing, all cells identical', cx, cy + 82, 240, 15, '600', '#0369a1');
    }
    H.textCentered(ctx, s.d, x + sw / 2, sy + 240, sw - 40, 15, '400', C.ink);
    if (i < 3) H.arrow(ctx, x + sw + 4, sy + sh / 2, x + sw + gap - 4, sy + sh / 2, 3, C.accent);
  });

  // two routes
  const ry = 500;
  H.panelBox(ctx, 70, ry, 700, 330, '#eef2ff', '#a5b4fc');
  H.textCentered(ctx, 'Route A: reproductive cloning', 420, ry + 32, 640, 21, '700', '#3730a3');
  H.arrow(ctx, 420, ry + 56, 420, ry + 96, 4, '#3730a3');
  H.chip(ctx, 'the embryo is implanted into a surrogate mother', 420, ry + 130, 620, '#ffffff', '#3730a3', 17);
  H.chip(ctx, 'it develops into an animal genetically identical to the donor', 420, ry + 180, 620, '#ffffff', '#3730a3', 17);
  H.textCentered(ctx, 'Dolly the sheep, 1996: the first mammal cloned this way from an adult cell. Farm animals have since been cloned for elite breeding stock, but the practice raises serious welfare questions, and the success rate of the technique remains low.', 420, ry + 260, 640, 16, '600', C.ink);

  H.panelBox(ctx, 830, ry, 700, 330, '#f0fdf4', '#bbf7d0');
  H.textCentered(ctx, 'Route B: therapeutic cloning', 1180, ry + 32, 640, 21, '700', '#15803d');
  H.arrow(ctx, 1180, ry + 56, 1180, ry + 96, 4, '#15803d');
  H.chip(ctx, 'the embryo is NEVER implanted: instead stem cells are taken from it', 1180, ry + 130, 620, '#ffffff', '#15803d', 17);
  H.chip(ctx, 'those cells can become any tissue, genetically matched to the patient', 1180, ry + 180, 620, '#ffffff', '#15803d', 17);
  H.textCentered(ctx, 'The goal is repair without rejection: a patient\u2019s own DNA driving new tissue. The ethical question is different from route A, because a potential life is created and destroyed for research or treatment, which is why the law tightly restricts both routes in the UK.', 1180, ry + 260, 640, 16, '600', C.ink);
  // branch arrows from step 4
  H.arrow(ctx, 1000, 470, 420, ry + 20, 4, '#3730a3');
  H.arrow(ctx, 1080, 470, 1180, ry + 20, 4, '#15803d');

  H.chip(ctx, 'A clone shares genes, not identity: the environment acts on the copy too, as the many attempts before Dolly show', W / 2, HH - 24, 1000, C.amberSoft, '#92400e');
  H.save('a25-scnt.png', canvas);
}

module.exports = { drawPcrGel, drawScreening, drawStemCells, drawScnt };