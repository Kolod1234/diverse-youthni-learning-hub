// AS 6 diagram 11 — bioassays: dose–response curves and zones of inhibition.
const { C, makeCanvas, title, save, panelBox, textCentered, paragraph, dashedLine } = require('./common.cjs');

function render() {
  const W = 1500, H = 920;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Bioassays: measuring a drug with a living system', 'Graded responses, sigmoid dose–response curves and the agar diffusion assay');

  // Left: sigmoid dose-response.
  panelBox(ctx, 70, 150, 660, 420, '#ffffff', C.panelBorder, 14);
  textCentered(ctx, 'Log dose–response curve', 400, 186, 560, 21, '700', C.ink);
  const ox = 150, oy = 530, pw = 480, ph = 280;
  // Axes.
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(ox, oy);
  ctx.lineTo(ox + pw, oy);
  ctx.moveTo(ox, oy);
  ctx.lineTo(ox, oy - ph);
  ctx.stroke();
  ctx.fillStyle = C.ink;
  ctx.font = '600 15px Arial, Helvetica, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('log(dose)', ox + pw / 2, oy + 30);
  ctx.save();
  ctx.translate(ox - 40, oy - ph / 2);
  ctx.rotate(-Math.PI / 2);
  ctx.fillText('% of maximum response', 0, 0);
  ctx.restore();

  // Sigmoid curve.
  ctx.strokeStyle = C.accent;
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let i = 0; i <= 100; i++) {
    const x = ox + (i / 100) * pw;
    const yv = oy - ph * (1 / (1 + Math.exp(-(i - 50) / 12)));
    if (i === 0) ctx.moveTo(x, yv);
    else ctx.lineTo(x, yv);
  }
  ctx.stroke();

  // Emax plateau.
  dashedLine(ctx, ox + pw * 0.5, oy - ph, ox + pw, oy - ph, C.ok, 2.5);
  ctx.fillStyle = C.ok;
  ctx.font = '700 16px Arial, Helvetica, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('Emax — maximum effect', ox + pw * 0.42, oy - ph - 14);

  // EC50 marker at 50%.
  dashedLine(ctx, ox + pw / 2, oy, ox + pw / 2, oy - ph / 2, C.warn, 2.5);
  dashedLine(ctx, ox, oy - ph / 2, ox + pw / 2, oy - ph / 2, C.warn, 2.5);
  ctx.fillStyle = C.warn;
  ctx.beginPath();
  ctx.arc(ox + pw / 2, oy - ph / 2, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillText('EC50 — dose giving 50% of Emax', ox + pw / 2 + 12, oy - ph / 2 + 24);

  paragraph(ctx, 'Potency: a drug that reaches its half-maximal effect at a LOWER dose (smaller EC50) is the more potent one.', 400, 590, 600, 25, 16, '400', C.sub, 'center');

  // Right: agar plate.
  panelBox(ctx, 770, 150, 660, 420, '#ffffff', C.panelBorder, 14);
  textCentered(ctx, 'Agar diffusion assay — antibiotic potency', 1100, 186, 600, 21, '700', C.ink);
  const pcx = 1100, pcy = 370, pr = 128;
  ctx.fillStyle = C.okSoft;
  ctx.strokeStyle = C.panelBorder;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(pcx, pcy, pr, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // bacterial lawn dots.
  ctx.fillStyle = '#86efac';
  for (let i = 0; i < 260; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * pr;
    ctx.beginPath();
    ctx.arc(pcx + r * Math.cos(a), pcy + r * Math.sin(a), 2.2, 0, Math.PI * 2);
    ctx.fill();
  }
  // discs with clear zones.
  const discs = [[-45, -35, 34, 'STD'], [50, -30, 26, 'low'], [0, 60, 44, 'high']];
  discs.forEach(([dx, dy, zr, lab]) => {
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(pcx + dx, pcy + dy, zr, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#334155';
    ctx.font = '600 14px Arial, Helvetica, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(lab, pcx + dx, pcy + dy);
    ctx.textBaseline = 'alphabetic';
  });
  paragraph(ctx, 'Bacterial lawn grows everywhere except around each disc, where diffusing antibiotic stops it — the clear zone of inhibition.', 1100, 520, 600, 24, 16, '400', C.sub, 'center');
  textCentered(ctx, 'Zone diameter is proportional to the log of antibiotic concentration.', 1100, 548, 560, 16, '600', C.ink);

  // Bottom: quantal vs graded.
  panelBox(ctx, 70, 610, W - 140, 270, C.panel, C.panelBorder, 16);
  textCentered(ctx, 'Two kinds of bioassay', W / 2, 648, 600, 23, '700', C.ink);
  const kinds = [
    ['QUANTAL — all or nothing', 'Does a defined response happen, yes or no, across a population? The ED50 is the dose that works in 50% of subjects; the LD50 is the dose that kills 50%. The margin between them is the safety window.', C.accent],
    ['GRADED — measured response', 'The size of the response grows with dose: contraction of isolated smooth muscle, or the diameter of a zone of inhibition. Compare unknown against standards run side by side.', C.accent2],
  ];
  const kw = (W - 260) / 2;
  kinds.forEach(([t, d], i) => {
    const kx = 110 + i * (kw + 40);
    panelBox(ctx, kx, 680, kw, 170, '#ffffff', kinds[i][2], 12);
    textCentered(ctx, t, kx + kw / 2, 716, kw - 40, 19, '700', kinds[i][2]);
    paragraph(ctx, d, kx + kw / 2, 768, kw - 70, 24, 15, '400', C.ink, 'center');
  });

  save('as6-doseresponse.png', canvas);
}

module.exports = { render };