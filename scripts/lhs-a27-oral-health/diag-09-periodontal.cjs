// A2 7 Figure 9 — periodontal disease progression: healthy, gingivitis,
// periodontitis.
const common = require('./common.cjs');
const { C, makeCanvas, title, save, textCentered, textLeft, paragraph, panelBox, lead } = common;

const { canvas, ctx } = makeCanvas(980, 660);
title(ctx, 980, 'Periodontal disease: two stages, one direction', 'Gingivitis is reversible \u2014 once periodontitis destroys attachment, the damage is permanent');

const y0 = 150, ph = 340;
const pw = 292, gap = 26, startX = 26;

function drawStage(x, opts) {
  panelBox(ctx, x, y0, pw, ph + 110, '#ffffff', opts.edge, 14);
  ctx.fillStyle = opts.tint;
  ctx.fillRect(x + 1, y0 + 1, pw - 2, 42);
  textLeft(ctx, opts.head, x + 14, y0 + 22, pw - 28, 16, '700', opts.edge);

  const cx = x + pw / 2;
  const ty = y0 + 60; // top of drawing

  // Tooth (crown + root) centred.
  ctx.fillStyle = '#eaf6fb';
  ctx.strokeStyle = '#7db8cc';
  ctx.lineWidth = 2;
  ctx.fillRect(cx - 22, ty, 44, 46);
  ctx.strokeRect(cx - 22, ty, 44, 46);
  ctx.fillStyle = '#fdf3d8';
  ctx.strokeStyle = '#c9a24a';
  ctx.beginPath();
  ctx.moveTo(cx - 20, ty + 46);
  ctx.quadraticCurveTo(cx - 14, ty + 150, cx - 8, ty + 200);
  ctx.lineTo(cx + 8, ty + 200);
  ctx.quadraticCurveTo(cx + 14, ty + 150, cx + 20, ty + 46);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Gum shape: healthy = snug collar; diseased = swollen / receding with pocket.
  ctx.fillStyle = opts.gumCol;
  ctx.strokeStyle = '#d4707f';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - 90, ty + 64);
  ctx.quadraticCurveTo(cx - 46, ty + opts.gumCrest, cx - 24, ty + opts.gumCrest + 8);
  if (opts.pocket) {
    // pocket dips down alongside the root.
    ctx.lineTo(cx - 24, ty + opts.pocketDepth);
    ctx.lineTo(cx - 16, ty + opts.pocketDepth);
    ctx.lineTo(cx - 14, ty + opts.gumCrest + 20);
  }
  ctx.lineTo(cx - 12, ty + opts.gumCrest + (opts.pocket ? 10 : 6));
  ctx.lineTo(cx - 10, ty + 90);
  ctx.lineTo(cx - 90, ty + 96);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  // right side gum (simple mirrored, no pocket drawn).
  ctx.beginPath();
  ctx.moveTo(cx + 90, ty + 64);
  ctx.quadraticCurveTo(cx + 46, ty + opts.gumCrest, cx + 24, ty + opts.gumCrest + 8);
  ctx.lineTo(cx + 10, ty + 90);
  ctx.lineTo(cx + 90, ty + 96);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Plaque band.
  ctx.fillStyle = '#fde68a';
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 1.5;
  if (opts.plaque === 'margin') {
    ctx.fillRect(cx - 22, ty + 42, 44, 10);
    ctx.strokeRect(cx - 22, ty + 42, 44, 10);
  } else if (opts.plaque === 'sub') {
    ctx.fillRect(cx - 26, ty + opts.pocketDepth - 12, 52, 12);
    ctx.strokeRect(cx - 26, ty + opts.pocketDepth - 12, 52, 12);
  }

  // Bone level.
  ctx.strokeStyle = '#7c6236';
  ctx.lineWidth = 10;
  const boneY = ty + opts.bone;
  ctx.beginPath();
  ctx.moveTo(cx - 90, boneY);
  ctx.lineTo(cx - 30, boneY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx + 30, boneY);
  ctx.lineTo(cx + 90, boneY);
  ctx.stroke();

  // PDL fibres (if intact).
  if (opts.pdl) {
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 2;
    for (let i = 0; i < 4; i++) {
      const yy = boneY - 12 - i * 22;
      ctx.beginPath();
      ctx.moveTo(cx - 12, yy);
      ctx.lineTo(cx - 26, yy - 10);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 12, yy);
      ctx.lineTo(cx + 26, yy - 10);
      ctx.stroke();
    }
  }

  // Bone-loss marker.
  if (!opts.pdl) {
    dashedLocal(ctx, cx - 90, ty + 96, cx - 90, ty + opts.baselineBone);
    textLeft(ctx, 'bone lost', cx - 100, ty + (opts.baselineBone + 96) / 2 + 26, 90, 13, '700', C.warn);
  }

  // Feature chips + verdict.
  textCentered(ctx, opts.features, cx, y0 + ph + 6, pw - 30, 14, '600', C.sub);
  const vy = y0 + ph + 44;
  panelBox(ctx, x + 16, vy, pw - 32, 44, opts.verdictTint, opts.verdictEdge, 10);
  textCentered(ctx, opts.verdict, cx, vy + 22, pw - 50, 15, '700', opts.verdictEdge);
}

function dashedLocal(ctx, x1, y1, x2, y2) {
  ctx.save();
  ctx.setLineDash([6, 6]);
  ctx.strokeStyle = C.warn;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  ctx.restore();
}

drawStage(startX, {
  head: 'HEALTHY',
  edge: C.ok, tint: C.okSoft,
  gumCol: '#f6b8c0', gumCrest: 48, plaque: null, pocket: false,
  bone: 150, pdl: true, baselineBone: 150,
  features: 'Pink, firm gingiva; shallow sulcus (\u22642\u20133 mm); bone at full height; fibres intact.',
  verdict: 'REVERSIBLE \u2014 maintain hygiene', verdictTint: '#dcfce7', verdictEdge: '#166534',
});

drawStage(startX + pw + gap, {
  head: 'GINGIVITIS',
  edge: C.amber, tint: C.amberSoft,
  gumCol: '#ef8a95', gumCrest: 36, plaque: 'margin', pocket: false,
  bone: 150, pdl: true, baselineBone: 150,
  features: 'Plaque at the gum margin; red, swollen gums that bleed on brushing. No attachment or bone loss yet.',
  verdict: 'REVERSIBLE \u2014 remove plaque, inflammation resolves', verdictTint: '#fef3c7', verdictEdge: '#92400e',
});

drawStage(startX + 2 * (pw + gap), {
  head: 'PERIODONTITIS',
  edge: C.warn, tint: C.warnSoft,
  gumCol: '#e0677a', gumCrest: 56, plaque: 'sub', pocket: true, pocketDepth: 130,
  bone: 200, pdl: false, baselineBone: 150,
  features: 'Deep periodontal pocket harbours plaque; periodontal ligament fibres break; alveolar bone resorbs; the tooth loosens.',
  verdict: 'IRREVERSIBLE \u2014 attachment never regrows', verdictTint: '#fee2e2', verdictEdge: '#991b1b',
});

// Takeaway strip.
panelBox(ctx, 60, 596, 860, 50, '#f8fafc', C.panelBorder);
textCentered(ctx, 'The exam-critical distinction: gingivitis = soft tissue only, reversible \u2014 periodontitis = loss of ligament and bone, permanent.', 490, 621, 840, 16, '600', C.ink);

save('a27-periodontal.png', canvas);
module.exports = common;