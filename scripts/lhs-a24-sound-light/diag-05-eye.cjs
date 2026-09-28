// Diagrams 9-10: the structure of the eye; vision defects and their correction.
const H = require('./common.cjs');
const { C } = H;

// ---------------- Diagram 9: the eye ----------------
function drawEye() {
  const W = 1600, HH = 950;
  const { canvas, ctx } = H.makeCanvas(W, HH);
  H.title(ctx, W, 'The eye: a camera that focuses itself',
    'Most of the bending is done by the cornea; the flexible lens fine-focuses the light so the image lands exactly on the retina');

  // ---- Left: the labelled eye ----
  const ecx = 620, ecy = 500, er = 255;
  // sclera
  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(ecx, ecy, er, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // cornea bulge (front, left)
  ctx.fillStyle = '#e0f2fe';
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(ecx - 195, ecy - 155);
  ctx.bezierCurveTo(ecx - 330, ecy - 60, ecx - 330, ecy + 60, ecx - 195, ecy + 155);
  ctx.stroke();
  ctx.fill();
  // iris and pupil
  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 10;
  ctx.beginPath(); ctx.moveTo(ecx - 195, ecy - 150); ctx.lineTo(ecx - 145, ecy - 55); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ecx - 195, ecy + 150); ctx.lineTo(ecx - 145, ecy + 55); ctx.stroke();
  // pupil gap (unshaded region between the two iris lines)
  // lens
  ctx.fillStyle = '#fef9c3';
  ctx.strokeStyle = '#a16207';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(ecx - 120, ecy, 26, 72, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  // suspensory ligaments + ciliary muscles
  ctx.strokeStyle = C.sub;
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(ecx - 100, ecy - 62); ctx.lineTo(ecx - 195, ecy - 168); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(ecx - 100, ecy + 62); ctx.lineTo(ecx - 195, ecy + 168); ctx.stroke();
  ctx.strokeStyle = '#b91c1c';
  ctx.lineWidth = 9;
  ctx.beginPath(); ctx.arc(ecx - 15, ecy, er - 12, -2.5, -1.9); ctx.stroke();
  ctx.beginPath(); ctx.arc(ecx - 15, ecy, er - 12, 1.9, 2.5); ctx.stroke();
  // vitreous tint
  ctx.fillStyle = '#eff6ff';
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.arc(ecx, ecy, er - 6, -1.35, 1.35);
  ctx.lineTo(ecx - 120, ecy);
  ctx.closePath();
  ctx.fill();
  ctx.globalAlpha = 1;
  // retina: inner arc at the back
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(ecx, ecy, er - 22, -0.95, 0.95);
  ctx.stroke();
  // fovea: small tick at the very back
  ctx.strokeStyle = '#7f1d1d';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(ecx + er - 22, ecy - 12);
  ctx.lineTo(ecx + er - 26, ecy + 12);
  ctx.stroke();
  // optic nerve: bundle leaving the back-bottom
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(ecx + er - 40, ecy + 95);
  ctx.bezierCurveTo(ecx + er + 60, ecy + 140, ecx + er + 130, ecy + 120, ecx + er + 190, ecy + 60);
  ctx.stroke();
  H.textLeft(ctx, 'optic nerve \u2014 carries the picture to the brain (its exit point is the blind spot)', ecx + er + 40, ecy + 185, 330, 17, '700', '#b45309');

  // light rays entering and focusing on the retina
  const retX = ecx + er - 22;
  H.arrow(ctx, ecx - 470, ecy - 120, ecx - 120, ecy - 18, 3, C.accent);
  H.arrow(ctx, ecx - 120, ecy - 18, retX, ecy, 3, C.accent);
  H.arrow(ctx, ecx - 470, ecy + 120, ecx - 120, ecy + 18, 3, C.accent);
  H.arrow(ctx, ecx - 120, ecy + 18, retX, ecy, 3, C.accent);
  H.textLeft(ctx, 'light from the scene', ecx - 470, ecy - 150, 280, 16, '600', C.accent);
  H.textCentered(ctx, 'image on the retina: real, inverted, diminished \u2014 the brain turns it the right way up', ecx, ecy + 320, 620, 18, '600', C.sub);

  // short labels with leaders
  H.textLeft(ctx, 'cornea', ecx - 350, ecy - 220, 140, 18, '700', C.ink);
  H.lead(ctx, ecx - 285, ecy - 208, ecx - 285, ecy - 90, C.sub);
  H.textLeft(ctx, 'iris', ecx - 420, ecy + 40, 120, 18, '700', C.ink);
  H.lead(ctx, ecx - 330, ecy + 40, ecx - 196, ecy - 40, C.sub);
  H.textLeft(ctx, 'pupil', ecx - 420, ecy + 90, 120, 18, '700', C.ink);
  H.lead(ctx, ecx - 330, ecy + 90, ecx - 170, ecy + 30, C.sub);
  H.textLeft(ctx, 'lens', ecx - 60, ecy - 175, 120, 18, '700', C.ink);
  H.lead(ctx, ecx - 75, ecy - 163, ecx - 120, ecy - 60, C.sub);
  H.textLeft(ctx, 'suspensory', ecx + 60, ecy - 195, 160, 18, '700', C.sub);
  H.textLeft(ctx, 'ligaments', ecx + 60, ecy - 173, 160, 18, '700', C.sub);
  H.lead(ctx, ecx + 55, ecy - 160, ecx - 70, ecy - 78, C.sub);
  H.textLeft(ctx, 'ciliary', ecx + 30, ecy + 205, 130, 18, '700', '#b91c1c');
  H.textLeft(ctx, 'muscles', ecx + 30, ecy + 227, 130, 18, '700', '#b91c1c');
  H.lead(ctx, ecx + 30, ecy + 215, ecx - 30, ecy + 225, C.sub);
  H.textLeft(ctx, 'vitreous humour', ecx + 60, ecy - 60, 220, 18, '700', C.ink);
  H.lead(ctx, ecx + 55, ecy - 52, ecx + 100, ecy - 20, C.sub);
  H.textLeft(ctx, 'retina', ecx + 230, ecy - 190, 140, 18, '700', '#dc2626');
  H.lead(ctx, ecx + 270, ecy - 180, ecx + 200, ecy - 125, C.sub);
  H.textLeft(ctx, 'fovea', ecx + 260, ecy - 240, 140, 18, '700', '#7f1d1d');
  H.lead(ctx, ecx + 300, ecy - 232, retX - 10, ecy - 16, C.sub);

  // ---- Right: legend panel ----
  const lx = 1180, lw = 380;
  H.panelBox(ctx, lx, 150, lw, 700, C.panel, C.panelBorder);
  H.textCentered(ctx, 'What each part does', lx + lw / 2, 180, lw - 40, 22, '700', C.accent);
  const legend = [
    ['Cornea', 'the clear front window; it does about two-thirds of the bending of the light'],
    ['Iris', 'a ring of muscle that opens and closes to set the size of the pupil'],
    ['Pupil', 'the gap the iris leaves \u2014 the doorway light passes through'],
    ['Lens', 'a flexible disc that fine-focuses the light onto the retina'],
    ['Ciliary muscles', 'pull to make the lens fatter for near objects, slack to flatten it for distant ones'],
    ['Suspensory ligaments', 'connect the lens to the ciliary muscles'],
    ['Vitreous humour', 'clear jelly that keeps the eyeball\u2019s shape'],
    ['Retina', 'a screen of light-sensitive cells \u2014 rods for dim light and movement, cones for detail and colour'],
    ['Fovea', 'the sharpest spot on the retina, packed with cones'],
    ['Optic nerve', 'carries the signals to the brain; where it leaves, there are no receptor cells \u2014 the blind spot'],
  ];
  let ly = 222;
  for (const [name, fn] of legend) {
    H.textLeft(ctx, name, lx + 26, ly, lw - 50, 18, '700', C.ink);
    const words = fn.split(' ');
    const lineW = lw - 52;
    let line = '';
    let lineY = ly + 22;
    H.setFont(ctx, 15, '400');
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > lineW) {
        H.textLeft(ctx, line, lx + 26, lineY, lineW, 15, '400', C.sub);
        line = word;
        lineY += 20;
      } else line = test;
    }
    H.textLeft(ctx, line, lx + 26, lineY, lineW, 15, '400', C.sub);
    ly = lineY + 36;
  }

  H.save('a24-eye-structure.png', canvas);
}

// ---------------- Diagram 10: vision defects and correction ----------------
function drawVisionCorrection() {
  const W = 1600, HH = 950;
  const { canvas, ctx } = H.makeCanvas(W, HH);
  H.title(ctx, W, 'Vision defects and their correction',
    'Both defects are a mismatch between the eyeball and the lens \u2014 the correcting lens moves the focus back onto the retina');

  const pw = 720, ph = 360, gx = 80, gy = 150, gapX = 800 - pw / 2 - 80 + pw; // computed below
  const pxs = [80, 860];
  const pys = [150, 570];

  function miniEye(cx, cy, r, lensX, rays) {
    H.eyeSymbol(ctx, cx, cy, r, lensX);
    for (const ray of rays) {
      ctx.strokeStyle = ray.color;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ray.path.forEach(function (p, i) { if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
      ctx.stroke();
      if (ray.arrowEnd) {
        const a = ray.path[ray.path.length - 1];
        const b = ray.path[ray.path.length - 2];
        const ang = Math.atan2(a[1] - b[1], a[0] - b[0]);
        ctx.fillStyle = ray.color;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(a[0] - 11 * Math.cos(ang - 0.42), a[1] - 11 * Math.sin(ang - 0.42));
        ctx.lineTo(a[0] - 11 * Math.cos(ang + 0.42), a[1] - 11 * Math.sin(ang + 0.42));
        ctx.closePath();
        ctx.fill();
      }
    }
  }

  // ---- Panel 1: normal eye ----
  H.panelBox(ctx, pxs[0], pys[0], pw, ph, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'Normal eye', pxs[0] + pw / 2, pys[0] + 28, pw - 30, 21, '700', C.ok);
  {
    const cx = pxs[0] + 470, cy = pys[0] + ph / 2 + 20, r = 115, lensX = cx - 175;
    miniEye(cx, cy, r, lensX, [
      { color: C.ok, path: [[pxs[0] + 60, cy - 28], [lensX, cy - 12], [cx + r - 20, cy]], arrowEnd: true },
      { color: C.ok, path: [[pxs[0] + 60, cy + 28], [lensX, cy + 12], [cx + r - 20, cy]], arrowEnd: true },
    ]);
    H.textLeft(ctx, 'rays from a distant object arrive parallel', pxs[0] + 30, pys[0] + ph - 30, 360, 16, '400', C.sub);
    H.textCentered(ctx, 'focus lands exactly on the retina \u2014 a sharp image', cx - 20, cy + r + 40, 430, 17, '700', C.ok);
  }

  // ---- Panel 2: short sight, uncorrected ----
  H.panelBox(ctx, pxs[1], pys[0], pw, ph, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'Short sight (myopia) \u2014 uncorrected', pxs[1] + pw / 2, pys[0] + 28, pw - 30, 21, '700', C.warn);
  {
    const cx = pxs[1] + 470, cy = pys[0] + ph / 2 + 20, r = 115, lensX = cx - 175;
    miniEye(cx, cy, r, lensX, [
      { color: C.warn, path: [[pxs[1] + 60, cy - 28], [lensX, cy - 12], [cx - 20, cy]], arrowEnd: true },
      { color: C.warn, path: [[pxs[1] + 60, cy + 28], [lensX, cy + 12], [cx - 20, cy]], arrowEnd: true },
    ]);
    // rays crossing too early then spreading onto the retina
    ctx.strokeStyle = C.warn;
    ctx.lineWidth = 3;
    ctx.setLineDash([9, 7]);
    ctx.beginPath(); ctx.moveTo(cx - 20, cy); ctx.lineTo(cx + r - 20, cy - 26); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx - 20, cy); ctx.lineTo(cx + r - 20, cy + 26); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath(); ctx.arc(cx - 20, cy, 6, 0, Math.PI * 2); ctx.fill();
    H.textLeft(ctx, 'focus forms here \u2014 in front of the retina', cx - 150, cy - 90, 330, 16, '700', '#7f1d1d');
    H.textLeft(ctx, 'eyeball too long (or cornea too strong)', pxs[1] + 30, pys[0] + ph - 30, 380, 16, '400', C.sub);
    H.textCentered(ctx, 'distant objects blur; near objects still focus, which is why the short-sighted read happily', cx - 20, cy + r + 40, 450, 17, '700', C.warn);
  }

  // ---- Panel 3: short sight corrected ----
  H.panelBox(ctx, pxs[0], pys[1], pw, ph, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'Short sight \u2014 corrected by a diverging lens', pxs[0] + pw / 2, pys[1] + 28, pw - 30, 21, '700', C.accent);
  {
    const cx = pxs[0] + 470, cy = pys[1] + ph / 2 + 20, r = 115, lensX = cx - 175;
    // correcting concave lens at the left edge
    const clx = pxs[0] + 70;
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(clx, cy - 55);
    ctx.quadraticCurveTo(clx + 26, cy, clx, cy + 55);
    ctx.stroke();
    // rays diverge after the correcting lens, then the eye focuses them onto the retina
    miniEye(cx, cy, r, lensX, [
      { color: C.accent, path: [[clx + 6, cy - 34], [lensX, cy - 18], [cx + r - 20, cy]], arrowEnd: true },
      { color: C.accent, path: [[clx + 6, cy + 34], [lensX, cy + 18], [cx + r - 20, cy]], arrowEnd: true },
    ]);
    H.textLeft(ctx, 'diverging (concave) lens spreads the parallel rays before the eye brings them to a focus \u2014 and the focus now lands on the retina', pxs[0] + 30, pys[1] + ph - 32, 640, 16, '400', C.sub);
    H.textLeft(ctx, 'correcting lens', clx - 40, cy - 80, 220, 16, '700', C.accent);
  }

  // ---- Panel 4: long sight corrected ----
  H.panelBox(ctx, pxs[1], pys[1], pw, ph, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'Long sight (hypermetropia) \u2014 corrected by a converging lens', pxs[1] + pw / 2, pys[1] + 28, pw - 30, 21, '700', C.accent);
  {
    const cx = pxs[1] + 470, cy = pys[1] + ph / 2 + 20, r = 115, lensX = cx - 175;
    const clx = pxs[1] + 70;
    ctx.strokeStyle = C.accent;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(clx, cy - 55);
    ctx.quadraticCurveTo(clx - 30, cy, clx, cy + 55);
    ctx.stroke();
    // rays from a NEAR object (spreading out) gathered by the convex lens
    miniEye(cx, cy, r, lensX, [
      { color: C.accent, path: [[pxs[1] + 30, cy - 46], [clx + 4, cy - 26], [lensX, cy - 16], [cx + r - 20, cy]], arrowEnd: true },
      { color: C.accent, path: [[pxs[1] + 30, cy + 46], [clx + 4, cy + 26], [lensX, cy + 16], [cx + r - 20, cy]], arrowEnd: true },
    ]);
    H.textLeft(ctx, 'converging (convex) lens adds bending power, bringing the focus of near objects forward onto the retina', pxs[1] + 30, pys[1] + ph - 32, 640, 16, '400', C.sub);
    H.textLeft(ctx, 'near object', pxs[1] + 24, cy + 70, 160, 16, '600', C.sub);
    H.textLeft(ctx, 'correcting lens', clx - 40, cy - 80, 220, 16, '700', C.accent);
  }

  H.textCentered(ctx, 'Accommodation is the eye\u2019s own fine focus: ciliary muscles pull in for near objects (lens fatter) and slack for distant ones (lens flatter). Near point about 25 cm; far point infinity. The defects above are when even full accommodation cannot land the focus on the retina.', W / 2, HH - 30, 1480, 17, '400', C.sub);

  H.save('a24-vision-correction.png', canvas);
}

module.exports = { drawEye, drawVisionCorrection };