// AS 4 Brain Science — diagrams 3 and 4: the synapse and the reflex arc.
const { C, textCentered, textLeft, makeCanvas, title, save, arrow, roundRect, panelBox, chip, lead, setFont, dashedLine } = require('./common.cjs');

function renderSynapse() {
  const W = 1500, H = 980;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Crossing the gap: the synapse',
    'Electrical along the neurone \u2014 chemical across the gap');

  // Presynaptic terminal (left).
  ctx.fillStyle = C.accentSoft;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  roundRect(ctx, 120, 210, 430, 300, 90); ctx.fill(); ctx.stroke();
  textLeft(ctx, 'Axon terminal of the sending neurone', 150, 240, 380, 19, '700');

  // Vesicles inside the terminal.
  const vY = 370;
  [[200, -30], [310, 10], [420, -30]].forEach(([vx, dy]) => {
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(vx, vY + dy, 30, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = C.accent;
    for (let k = 0; k < 5; k++) {
      const a = k * 1.257;
      ctx.beginPath(); ctx.arc(vx + 11 * Math.cos(a), vY + dy + 11 * Math.sin(a), 4, 0, Math.PI * 2); ctx.fill();
    }
  });
  lead(ctx, 420, vY + 60, 480, 520);
  textLeft(ctx, 'Vesicles \u2014 tiny sacs packed with neurotransmitter molecules', 320, 545, 420, 18, '600', C.sub);

  // Synaptic cleft (middle, tinted).
  ctx.fillStyle = '#f1f5f9';
  ctx.fillRect(550, 190, 250, 340);
  textCentered(ctx, 'Synaptic cleft', 675, 225, 230, 19, '700');
  textCentered(ctx, 'a fluid-filled gap about', 675, 252, 230, 15, '400', C.sub);
  textCentered(ctx, '20 nanometres wide', 675, 272, 230, 15, '400', C.sub);
  // Neurotransmitter dots crossing the cleft.
  ctx.fillStyle = C.accent;
  for (let i = 0; i < 7; i++) {
    const y = 310 + i * 30;
    ctx.beginPath(); ctx.arc(570 + (i % 3) * 40 + 25, y, 6, 0, Math.PI * 2); ctx.fill();
  }
  arrow(ctx, 575, 470, 775, 470, 3, C.accent);
  textCentered(ctx, 'diffusion', 675, 500, 200, 15, '600', C.accent);

  // Postsynaptic membrane (right).
  ctx.fillStyle = C.okSoft;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  roundRect(ctx, 800, 210, 580, 300, 60); ctx.fill(); ctx.stroke();
  textLeft(ctx, 'Membrane of the receiving cell (postsynaptic)', 850, 240, 500, 19, '700');
  // Receptor notches on the left edge.
  for (let i = 0; i < 6; i++) {
    const y = 320 + i * 30;
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = C.ok;
    ctx.lineWidth = 3;
    roundRect(ctx, 800 - 14, y - 12, 34, 24, 8); ctx.fill(); ctx.stroke();
  }
  lead(ctx, 830, 330, 900, 520);
  textLeft(ctx, 'Receptors \u2014 each type binds one type of neurotransmitter, like a lock and key', 760, 545, 660, 18, '600', C.sub);

  // Four numbered steps.
  const steps = [
    'The impulse arrives at the axon terminal.',
    'Vesicles move to the membrane and release neurotransmitter.',
    'Molecules diffuse across and bind to receptors.',
    'A new impulse is triggered in the next cell \u2014 or a muscle contracts.',
  ];
  steps.forEach((s, i) => {
    const x = 90 + i * 345;
    panelBox(ctx, x, 590, 310, 150);
    setFont(ctx, 24, '700');
    ctx.fillStyle = C.accent;
    ctx.beginPath(); ctx.arc(x + 38, 628, 20, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffffff';
    textCentered(ctx, String(i + 1), x + 38, 629, 30, 20, '700', '#ffffff');
    textCentered(ctx, s, x + 155, 690, 270, 17, '600');
  });

  // One-way-traffic note.
  panelBox(ctx, 90, 770, W - 180, 160, C.amberSoft);
  textCentered(ctx, 'One-way traffic: vesicles sit only on the sending side, receptors only on the receiving side \u2014 so the signal can never travel backwards.', W / 2, 815, W - 260, 21, '700');
  textCentered(ctx, 'The neurotransmitter is then broken down and taken back up, so each arriving impulse sends one clean message rather than a continuous shout.', W / 2, 865, W - 300, 19, '400', C.sub);

  save('as4-synapse.png', canvas);
}

function renderReflexArc() {
  const W = 1500, H = 980;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'The reflex arc: decide now, tell the brain later',
    'A withdrawal reflex \u2014 how your hand leaves a hot surface before you feel it');

  const rowY = 360, boxH = 170;

  // Stimulus chip above the receptor box.
  chip(ctx, 'Stimulus: your hand touches a hot pan', 205, 300, 360, C.warnSoft);

  // CNS tinted panel behind the relay neurone box.
  panelBox(ctx, 655, 330, 300, 250, C.accentSoft, C.accent, 24);
  textCentered(ctx, 'SPINAL CORD', 805, 362, 280, 20, '700', C.accent);
  textCentered(ctx, 'the decision is made here', 805, 388, 280, 15, '400', C.sub);

  // Row of five boxes.
  const boxes = [
    { x: 80, w: 250, title: 'Receptor', fill: '#ffffff', l1: 'pain-sensitive endings', l2: 'in the skin detect the heat' },
    { x: 370, w: 220, title: 'Sensory neurone', fill: C.accent2Soft, l1: 'carries the signal', l2: 'to the spinal cord' },
    { x: 690, w: 230, title: 'Relay neurone', fill: '#ffffff', l1: 'links sensory to motor', l2: 'inside the cord' },
    { x: 990, w: 220, title: 'Motor neurone', fill: C.accent2Soft, l1: 'carries the command', l2: 'back out to the muscle' },
    { x: 1280, w: 200, title: 'Effector', fill: '#ffffff', l1: 'the arm muscle', l2: 'contracts' },
  ];
  boxes.forEach((b, i) => {
    panelBox(ctx, b.x, rowY, b.w, boxH, b.fill);
    textCentered(ctx, b.title, b.x + b.w / 2, rowY + 38, b.w - 24, 20, '700');
    textCentered(ctx, b.l1, b.x + b.w / 2, rowY + 78, b.w - 24, 15, '400', C.sub);
    textCentered(ctx, b.l2, b.x + b.w / 2, rowY + 101, b.w - 24, 15, '400', C.sub);
  });
  // Relay box gets an extra hint line.
  textCentered(ctx, '(no brain involved)', 805, rowY + 132, 220, 14, '600', C.accent);

  // Arrows between the boxes.
  arrow(ctx, 335, rowY + 85, 365, rowY + 85, 4);
  arrow(ctx, 595, rowY + 85, 685, rowY + 85, 4);
  arrow(ctx, 925, rowY + 85, 985, rowY + 85, 4);
  arrow(ctx, 1215, rowY + 85, 1275, rowY + 85, 4);

  // Response chip below the effector.
  chip(ctx, 'Response: the hand pulls away', 1380, rowY + 215, 260, C.okSoft);

  // Detour note: the brain is informed afterwards.
  dashedLine(ctx, 805, 580, 805, 640, C.warn, 3);
  textCentered(ctx, 'A pain signal still races up to the brain \u2014 which is why you feel the burn a moment later, after the hand has already moved', 750, 665, 900, 19, '600', C.warn);

  // Bottom notes.
  panelBox(ctx, 90, 710, W - 180, 105, C.okSoft);
  textCentered(ctx, 'Why it is fast: the impulse never climbs to the brain before the muscle moves \u2014 the spinal cord both receives and decides.', W / 2, 748, W - 260, 21, '700');
  textCentered(ctx, 'Reflexes are automatic, built-in and identical every time: you cannot stop your knee jerking, and you do not have to think to flinch.', W / 2, 788, W - 300, 19, '400', C.sub);

  panelBox(ctx, 90, 835, W - 180, 95);
  textCentered(ctx, 'Three kinds of neurone in one circuit: sensory (receptor \u2192 CNS), relay (inside the CNS), motor (CNS \u2192 muscle).', W / 2, 885, W - 260, 20, '700', C.ink);

  save('as4-reflex-arc.png', canvas);
}

module.exports = { renderSynapse, renderReflexArc };