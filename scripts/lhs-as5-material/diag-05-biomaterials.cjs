// AS 5 diagram 5 — one hip replacement, four materials.
const { C, makeCanvas, title, save, panelBox, textCentered, textLeft, paragraph, lead } = require('./common.cjs');

function render() {
  const W = 1500, H = 950;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'One hip, four materials', 'Each part of the implant is chosen for the exact job it does');

  const cx = 480;

  // Pelvis (bone) — blob top
  ctx.beginPath();
  ctx.ellipse(cx, 218, 200, 96, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#eceae7';
  ctx.fill();
  ctx.strokeStyle = '#a8a29e';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  textCentered(ctx, 'pelvis (hip bone)', cx, 218, 200, 16, '600', '#78716c');

  // Acetabular cup — thick arc shell embedded in pelvis
  ctx.beginPath();
  ctx.arc(cx, 300, 92, Math.PI * 0.15, Math.PI * 0.85);
  ctx.strokeStyle = '#64748b';
  ctx.lineWidth = 22;
  ctx.stroke();

  // UHMWPE liner — lighter arc inside the cup
  ctx.beginPath();
  ctx.arc(cx, 296, 70, Math.PI * 0.12, Math.PI * 0.88);
  ctx.strokeStyle = '#7dd3fc';
  ctx.lineWidth = 16;
  ctx.stroke();

  // Ceramic head — ball
  ctx.beginPath();
  ctx.arc(cx, 340, 44, 0, Math.PI * 2);
  ctx.fillStyle = '#f8fafc';
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 3;
  ctx.stroke();
  // glint
  ctx.beginPath();
  ctx.arc(cx - 14, 326, 8, 0, Math.PI * 2);
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Titanium stem — tapered wedge from head into femur
  ctx.beginPath();
  ctx.moveTo(cx - 14, 384);
  ctx.lineTo(cx + 14, 384);
  ctx.lineTo(cx + 26, 640);
  ctx.lineTo(cx - 26, 640);
  ctx.closePath();
  ctx.fillStyle = '#94a3b8';
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Femur (thigh bone) — outline around stem with marrow cavity
  ctx.beginPath();
  ctx.moveTo(cx - 92, 420);
  ctx.quadraticCurveTo(cx - 128, 520, cx - 96, 690);
  ctx.quadraticCurveTo(cx - 80, 748, cx - 40, 760);
  ctx.lineTo(cx + 40, 760);
  ctx.quadraticCurveTo(cx + 84, 748, cx + 98, 690);
  ctx.quadraticCurveTo(cx + 128, 520, cx + 92, 420);
  ctx.quadraticCurveTo(cx, 392, cx - 92, 420);
  ctx.closePath();
  ctx.fillStyle = '#faf9f7';
  ctx.fill();
  ctx.strokeStyle = '#a8a29e';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  // marrow cavity line (dashed hint of interior)
  ctx.save();
  ctx.setLineDash([8, 7]);
  ctx.strokeStyle = '#d6d3d1';
  ctx.beginPath();
  ctx.moveTo(cx - 52, 470);
  ctx.quadraticCurveTo(cx - 30, 560, cx - 38, 700);
  ctx.moveTo(cx + 52, 470);
  ctx.quadraticCurveTo(cx + 30, 560, cx + 38, 700);
  ctx.stroke();
  ctx.restore();
  textCentered(ctx, 'femur (thigh bone)', cx + 2, 736, 200, 16, '600', '#78716c');

  // Re-draw stem over femur (it sits inside)
  ctx.beginPath();
  ctx.moveTo(cx - 14, 384);
  ctx.lineTo(cx + 14, 384);
  ctx.lineTo(cx + 26, 640);
  ctx.lineTo(cx - 26, 640);
  ctx.closePath();
  ctx.fillStyle = '#94a3b8';
  ctx.fill();
  ctx.strokeStyle = '#475569';
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Labels — right column with leader lines
  const lx = 940, lw = 500;
  const labels = [
    ['Acetabular cup — titanium alloy', 'Anchors the implant in the pelvis; strong enough to hold everything and corrosion-proof in salty body fluids.', 200, (cx + 74, 264)],
    ['Liner — UHMWPE polymer', 'The slippery bearing the head glides inside: low friction, high impact resistance, almost no wear debris.', 318, (cx + 52, 300)],
    ['Head — alumina or zirconia ceramic', 'Extremely hard and perfectly smooth, so it keeps its shape and finish against the liner for decades.', 436, (cx + 42, 344)],
    ['Stem — titanium alloy', 'Carries the whole body weight, every step. A natural oxide layer on its surface resists attack by blood and tissue fluid.', 554, (cx + 18, 520)],
    ['Bone grows onto the surface', 'Coatings such as hydroxyapatite invite living bone to bond directly to the implant — explained on the next diagram.', 672, (cx - 34, 700)],
  ];
  labels.forEach(([t, d, y, anchor]) => {
    textLeft(ctx, t, lx, y - 22, lw, 18, '700');
    paragraph(ctx, d, lx, y + 4, lw, 21, 15, '400', C.sub, 'left');
    lead(ctx, lx - 12, y - 6, anchor[0], anchor[1]);
  });

  // Bottom band — definitions
  panelBox(ctx, 60, 790, W - 120, 120, C.panel, C.panelBorder, 16);
  textCentered(ctx, 'Biomaterial: a substance engineered into a form that directs a therapeutic or diagnostic procedure by controlling its interactions with living systems.', W / 2, 826, W - 200, 17, '600', C.ink);
  textCentered(ctx, 'Biocompatibility: the ability of a material to perform with an appropriate host response in a specific application — it is always application-specific.', W / 2, 866, W - 200, 17, '400', C.sub);
  save('as5-biomaterials.png', canvas);
}