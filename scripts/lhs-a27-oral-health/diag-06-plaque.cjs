// A2 7 Figure 6 — plaque biofilm formation and the acid attack sequence.
const common = require('./common.cjs');
const { C, makeCanvas, title, save, textCentered, textLeft, paragraph, panelBox, arrow } = common;

const { canvas, ctx } = makeCanvas(980, 640);
title(ctx, 980, 'From pellicle to acid attack: how plaque causes caries', 'A four-step sequence every portfolio account of caries must reproduce in order');

const W = 980, y0 = 150, ph = 250;
const panels = [
  {
    head: '1  PELLICLE FORMS',
    body: 'Within minutes of brushing, salivary proteins coat the enamel as the acquired pellicle \u2014 the sticky landing stage every mouth has.',
    tint: C.accent2Soft, edge: C.accent2,
    draw(ctx, x, w) {
      // enamel block with thin pellicle line.
      ctx.fillStyle = '#eaf6fb'; ctx.strokeStyle = '#7db8cc'; ctx.lineWidth = 2;
      ctx.fillRect(x + 30, y0 + 130, w - 60, 60); ctx.strokeRect(x + 30, y0 + 130, w - 60, 60);
      ctx.strokeStyle = '#7c3aed'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(x + 34, y0 + 130); ctx.lineTo(x + w - 34, y0 + 130); ctx.stroke();
    },
  },
  {
    head: '2  BACTERIA ADHERE AND COLONISE',
    body: 'Streptococcus mutans sticks to the pellicle and divides. Layers of bacteria and sticky matrix build the biofilm we call dental plaque.',
    tint: '#fde68a', edge: '#b45309',
    draw(ctx, x, w) {
      ctx.fillStyle = '#eaf6fb'; ctx.strokeStyle = '#7db8cc'; ctx.lineWidth = 2;
      ctx.fillRect(x + 30, y0 + 150, w - 60, 40); ctx.strokeRect(x + 30, y0 + 150, w - 60, 40);
      ctx.fillStyle = '#b45309';
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        ctx.arc(x + 50 + i * ((w - 120) / 6), y0 + 132, 7, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.fillStyle = '#7c2d12';
      for (let i = 0; i < 6; i++) {
        ctx.beginPath();
        ctx.arc(x + 60 + i * ((w - 130) / 5), y0 + 114, 6, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  },
  {
    head: '3  SUGAR IS FERMENTED TO ACID',
    body: 'When free sugars reach the plaque, S. mutans and Lactobacillus ferment them anaerobically. The waste product is lactic acid \u2014 trapped right against the tooth.',
    tint: C.pinkSoft, edge: C.pink,
    draw(ctx, x, w) {
      ctx.fillStyle = '#eaf6fb'; ctx.strokeStyle = '#7db8cc'; ctx.lineWidth = 2;
      ctx.fillRect(x + 30, y0 + 160, w - 60, 30); ctx.strokeRect(x + 30, y0 + 160, w - 60, 30);
      ctx.fillStyle = '#be123c';
      ctx.font = '700 26px Arial';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('C\u2086H\u2081\u2082O\u2086 \u2192 2 CH\u2083CH(OH)COOH', x + w / 2, y0 + 118, w - 80);
      ctx.font = '600 15px Arial';
      ctx.fillText('glucose \u2192 lactic acid', x + w / 2, y0 + 146, w - 80);
    },
  },
  {
    head: '4  pH DROPS BELOW 5.5 \u2014 ENAMEL DISSOLVES',
    body: 'Once plaque pH crosses the critical threshold, hydroxyapatite releases Ca\u00b2\u207a and PO\u2084\u00b3\u207b faster than saliva can replace them. Subsurface mineral is lost \u2014 a white spot, then a cavity.',
    tint: C.warnSoft, edge: C.warn,
    draw(ctx, x, w) {
      ctx.fillStyle = '#eaf6fb'; ctx.strokeStyle = '#7db8cc'; ctx.lineWidth = 2;
      ctx.fillRect(x + 30, y0 + 160, w - 60, 30); ctx.strokeRect(x + 30, y0 + 160, w - 60, 30);
      // dissolving ions leaving the surface.
      ctx.font = '700 20px Arial';
      ctx.fillStyle = '#cc2222';
      ctx.textAlign = 'center';
      ctx.fillText('Ca\u00b2\u207a  PO\u2084\u00b3\u207b', x + w / 2, y0 + 120, w - 80);
      arrow(ctx, x + w / 2 - 20, y0 + 140, x + w / 2 - 30, y0 + 170, 2.5, '#cc2222');
      arrow(ctx, x + w / 2 + 20, y0 + 140, x + w / 2 + 30, y0 + 170, 2.5, '#cc2222');
      ctx.font = '700 17px Arial';
      ctx.fillStyle = '#cc2222';
      ctx.fillText('pH < 5.5', x + w / 2 - 70, y0 + 190, 90);
    },
  },
];

const pw = 228, gap = 20, startX = 26;
panels.forEach((p, i) => {
  const x = startX + i * (pw + gap);
  panelBox(ctx, x, y0, pw, ph + 70, '#ffffff', p.edge, 14);
  // Header band.
  ctx.fillStyle = p.tint;
  ctx.fillRect(x + 1, y0 + 1, pw - 2, 44);
  textLeft(ctx, p.head, x + 14, y0 + 23, pw - 28, 15, '700', p.edge);
  p.draw(ctx, x, pw);
  paragraph(ctx, p.body, x + 14, y0 + 228, pw - 28, 20, 13, '400', C.sub);
  if (i < 3) arrow(ctx, x + pw + 2, y0 + ph / 2, x + pw + gap - 2, y0 + ph / 2, 3, C.faint);
});

// Takeaway strip.
panelBox(ctx, 60, 470, 860, 66, C.warnSoft, C.warn);
textCentered(ctx, 'Misconception to kill: sugar does not corrode teeth \u2014 bacteria ferment sugar into acid, and the acid dissolves enamel below pH 5.5.', 490, 503, 830, 17, '600', '#991b1b');

// Bottom note: erosion vs caries distinction.
panelBox(ctx, 60, 550, 860, 60, '#f8fafc', C.panelBorder);
textCentered(ctx, 'Contrast \u2014 acid erosion is enamel loss from direct contact with dietary acids (fizzy drinks, citrus) with no bacteria involved.', 490, 580, 830, 16, '400', C.sub);

save('a27-plaque.png', canvas);
module.exports = common;