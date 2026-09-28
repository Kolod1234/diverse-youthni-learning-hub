// AS 4 Brain Science — diagram 1: the structure of a motor neurone.
const { C, textCentered, textLeft, makeCanvas, title, save, arrow, roundRect, panelBox, lead, setFont } = require('./common.cjs');

function renderNeurone() {
  const W = 1500, H = 950;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, "A motor neurone: the body's electrical cable",
    'Information enters through the dendrites, travels along the axon, and leaves at the terminals');

  // ---- The neurone drawing ----
  const cy = 330;

  // Dendrites: branching lines fanning out to the left of the cell body.
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 5;
  const dendrites = [
    [-60, -110, -150, -80], [-30, -140, -80, -160], [0, -150, 10, -190],
    [-30, 140, -80, 160], [-60, 110, -150, 80],
  ];
  for (const [dx1, dy1, dx2, dy2] of dendrites) {
    const bx = 300 + dx1, by = cy + dy1;
    ctx.beginPath(); ctx.moveTo(300, cy); ctx.lineTo(bx, by); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(300 + dx2, cy + dy2); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - 25, by + (dy2 - dy1) * 0.15); ctx.stroke();
  }

  // Cell body with nucleus.
  ctx.fillStyle = C.accentSoft;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(300, cy, 78, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = C.sub; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.arc(300, cy + 6, 30, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  textCentered(ctx, 'nucleus', 300, cy + 8, 56, 15, '700', C.sub);

  // Axon: thick line from the cell body to the terminals.
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(372, cy); ctx.lineTo(1150, cy); ctx.stroke();

  // Myelin sheath: fat rounded blobs with gaps (nodes of Ranvier) between.
  const blobs = [430, 560, 690, 820, 950];
  for (const bx of blobs) {
    ctx.fillStyle = '#fdf6ec';
    ctx.strokeStyle = C.amber;
    ctx.lineWidth = 4;
    roundRect(ctx, bx, cy - 42, 96, 84, 30); ctx.fill(); ctx.stroke();
  }

  // Axon terminals: three short branches with end bulbs.
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 6;
  const ends = [[1150, cy, 1240, cy - 85], [1150, cy, 1270, cy], [1150, cy, 1240, cy + 85]];
  for (const [x1, y1, x2, y2] of ends) {
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    ctx.fillStyle = C.accent;
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(x2 + 16, y2, 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  }

  // ---- Labels with leader lines ----
  lead(ctx, 190, 250, 205, 205);
  textLeft(ctx, 'Dendrites — receive incoming signals and pass them toward the cell body', 60, 180, 320, 20, '600');

  lead(ctx, 300, 252, 300, 150);
  textLeft(ctx, 'Cell body — contains the nucleus; the metabolic control centre', 180, 132, 260, 20, '600');

  lead(ctx, 478, 288, 478, 210);
  textLeft(ctx, 'Myelin sheath — fatty insulation that lets the signal travel far faster', 420, 192, 330, 20, '600');

  lead(ctx, 690, 372, 690, 452);
  textLeft(ctx, 'Node of Ranvier — the impulse jumps node to node (saltatory conduction)', 460, 475, 400, 20, '600');

  lead(ctx, 900, 330, 990, 330);
  textLeft(ctx, 'Axon — carries the impulse away from the cell body', 1000, 330, 300, 20, '600');

  lead(ctx, 1256, 245, 1256, 160);
  textLeft(ctx, 'Axon terminals — release neurotransmitters onto the next cell', 1090, 140, 340, 20, '600');

  // Direction-of-travel chip under the drawing.
  chipRow(ctx, W);

  // ---- Bottom panel: the three kinds of neurone ----
  panelBox(ctx, 70, 660, W - 140, 220);
  textCentered(ctx, 'Three kinds of neurone — one carries it in, one connects, one carries it out', W / 2, 700, W - 200, 24, '700');
  const cols = [
    ['Sensory neurone', 'Receptor \u2192 CNS', 'Carries signals from the sense organs and skin to the central nervous system.', C.accent2Soft],
    ['Relay neurone', 'CNS \u2192 CNS', 'Connects neurones to neurones inside the brain and spinal cord; makes the decisions.', C.accentSoft],
    ['Motor neurone', 'CNS \u2192 effector', 'Carries commands from the central nervous system to muscles and glands.', C.okSoft],
  ];
  cols.forEach((col, i) => {
    const x = 110 + i * 445;
    panelBox(ctx, x, 730, 400, 130, col[3]);
    textCentered(ctx, col[0], x + 200, 762, 380, 21, '700');
    textCentered(ctx, col[1], x + 200, 790, 380, 17, '600', C.accent);
    textCentered(ctx, col[2], x + 200, 836, 360, 15, '400', C.sub);
  });

  save('as4-neurone.png', canvas);
}

function chipRow(ctx, W) {
  setFont(ctx, 20, '600');
  const txt = 'Direction of travel:  dendrites \u2192 cell body \u2192 axon \u2192 terminals    \u2022    electrical along the neurone, chemical across the synapse';
  const w = ctx.measureText(txt).width + 60;
  roundRect(ctx, W / 2 - w / 2, 590, w, 44, 22);
  ctx.fillStyle = C.accent2Soft;
  ctx.fill();
  textCentered(ctx, txt, W / 2, 612, w - 40, 19, '600');
}

module.exports = { renderNeurone };