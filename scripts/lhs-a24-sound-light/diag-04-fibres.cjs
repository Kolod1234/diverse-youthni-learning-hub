// Diagrams 7-8: total internal reflection and the optical fibre; the endoscope.
const H = require('./common.cjs');
const { C } = H;

// ---------------- Diagram 7: total internal reflection ----------------
function drawTIR() {
  const W = 1600, HH = 950;
  const { canvas, ctx } = H.makeCanvas(W, HH);
  H.title(ctx, W, 'Total internal reflection: trapping light inside glass',
    'Beyond the critical angle no light escapes at all \u2014 the principle of the optical fibre');

  // ---- Left panel: the three cases ----
  const px = 70, pw = 700, py = 150, ph = 640;
  H.panelBox(ctx, px, py, pw, ph, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'Light travelling inside glass hits a glass\u2013air boundary', px + pw / 2, py + 28, pw - 40, 20, '700', C.accent);
  const bnd = py + 300;
  ctx.fillStyle = '#dbeafe';
  ctx.fillRect(px + 10, bnd, pw - 20, py + ph - bnd - 10);
  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(px + 10, bnd); ctx.lineTo(px + pw - 10, bnd); ctx.stroke();
  H.textLeft(ctx, 'air', px + 24, bnd - 24, 80, 17, '700', '#0369a1');
  H.textLeft(ctx, 'glass', px + 24, bnd + 28, 100, 17, '700', '#1d4ed8');

  const srcX = px + 110, srcY = py + ph - 60;
  // case rays: 30 deg, critical 42 deg, 55 deg
  const cases = [
    { a: 30 * Math.PI / 180, col: C.ok, out: true },
    { a: 42 * Math.PI / 180, col: C.amber, skim: true },
    { a: 55 * Math.PI / 180, col: C.warn, refl: true },
  ];
  for (const c of cases) {
    const t = (srcY - bnd) / Math.cos(c.a);
    const hitX = srcX + Math.sin(c.a) * t;
    H.arrow(ctx, srcX, srcY, hitX, bnd, 3.5, c.col);
    if (c.out) {
      const airA = 48.6 * Math.PI / 180;
      H.arrow(ctx, hitX, bnd, hitX + Math.sin(airA) * 150, bnd - Math.cos(airA) * 150, 3.5, c.col);
      ctx.globalAlpha = 0.25;
      H.arrow(ctx, hitX, bnd, hitX - Math.sin(c.a) * 130, bnd + Math.cos(c.a) * 130, 3, c.col);
      ctx.globalAlpha = 1;
      H.textLeft(ctx, '30\u00b0: most of the light refracts out', hitX - 200, bnd - 120, 320, 16, '600', C.ok);
    } else if (c.skim) {
      H.arrow(ctx, hitX, bnd, hitX + 260, bnd, 3.5, c.col);
      ctx.globalAlpha = 0.25;
      H.arrow(ctx, hitX, bnd, hitX - Math.sin(c.a) * 130, bnd + Math.cos(c.a) * 130, 3, c.col);
      ctx.globalAlpha = 1;
      H.textCentered(ctx, 'C \u2248 42\u00b0: the critical angle \u2014 the refracted ray skims along the boundary (90\u00b0 to the normal)', px + pw / 2 + 40, bnd - 40, pw - 120, 16, '600', '#b45309');
    } else {
      H.arrow(ctx, hitX, bnd, hitX - Math.sin(c.a) * 190, bnd + Math.cos(c.a) * 190, 4, c.col);
      H.textLeft(ctx, 'beyond C: total internal reflection \u2014 all the light bounces back into the glass', hitX - 320, bnd + 150, 420, 16, '600', C.warn);
    }
  }
  // normal at the critical ray
  H.dashedLine(ctx, cases[1] ? srcX + Math.sin(42 * Math.PI / 180) * ((srcY - bnd) / Math.cos(42 * Math.PI / 180)) : 0, py + 40, cases[1] ? srcX + Math.sin(42 * Math.PI / 180) * ((srcY - bnd) / Math.cos(42 * Math.PI / 180)) : 0, bnd + 260, C.sub);
  H.chip(ctx, 'sin C = 1 \u00f7 n   \u2192   glass: sin C = 1 \u00f7 1.5   \u2192   C \u2248 42\u00b0', px + pw / 2, py + ph - 40, pw - 80, C.accentSoft, C.accent, 20);

  // ---- Right panel: the optical fibre ----
  const fx = 830, fw = 700, fy = 150, fh = 640;
  H.panelBox(ctx, fx, fy, fw, fh, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'The optical fibre', fx + fw / 2, fy + 28, fw - 40, 20, '700', C.accent);
  const fibreY = fy + 260, fibreH = 130, fibreX = fx + 70, fibreW = fw - 140;
  ctx.fillStyle = '#dbeafe';
  H.roundRect(ctx, fibreX, fibreY, fibreW, fibreH, 18);
  ctx.fill();
  ctx.strokeStyle = '#1d4ed8';
  ctx.lineWidth = 3.5;
  ctx.stroke();
  // zigzag ray
  const zig = [];
  let zx = fibreX + 10, zy = fibreY + 15;
  const dxStep = 190, dyStep = fibreH - 30;
  zig.push([zx, zy]);
  let down = true;
  while (zx < fibreX + fibreW - 60) {
    zx += dxStep;
    zy = down ? fibreY + fibreH - 15 : fibreY + 15;
    down = !down;
    zig.push([zx, zy]);
  }
  ctx.strokeStyle = C.warn;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  zig.forEach(function (p, i) { if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]); });
  ctx.stroke();
  H.arrow(ctx, fibreX - 60, fibreY + 15, fibreX + 10, fibreY + 15, 3.5, C.warn);
  const lastP = zig[zig.length - 1];
  H.arrow(ctx, lastP[0], lastP[1], fibreX + fibreW + 50, lastP[1], 3.5, C.warn);
  H.textLeft(ctx, 'light enters one end', fx + 60, fibreY - 18, 260, 17, '600', C.warn);
  H.textCentered(ctx, 'each bounce is total internal reflection \u2014 nothing leaks through the walls', fx + fw / 2, fibreY + fibreH + 30, fw - 80, 17, '600', C.sub);
  H.textLeft(ctx, 'emerges at the far end almost unweakened', fx + fw - 320, fibreY + fibreH + 62, 320, 17, '600', C.warn);
  const notes = [
    'A fibre is a thin strand of glass, thinner than a hair; thousands travel together inside one cable.',
    'The light stays trapped because it strikes the walls at angles beyond the critical angle.',
    'Signals travel for kilometres with very little loss \u2014 and no electrical interference can touch them.',
    'Bundles of fibres, flexible enough to bend round corners, carry light in and pictures out: the endoscope.',
  ];
  let ny = fibreY + fibreH + 120;
  for (const n of notes) {
    const words = n.split(' ');
    let line = '';
    let lineY = ny;
    H.setFont(ctx, 16, '400');
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > fw - 90) {
        H.textLeft(ctx, line, fx + 50, lineY, fw - 90, 16, '400', C.sub);
        line = word;
        lineY += 21;
      } else line = test;
    }
    H.textLeft(ctx, line, fx + 50, lineY, fw - 90, 16, '400', C.sub);
    ny = lineY + 32;
  }

  H.save('a24-total-internal-reflection.png', canvas);
}

// ---------------- Diagram 8: the endoscope ----------------
function drawEndoscope() {
  const W = 1600, HH = 950;
  const { canvas, ctx } = H.makeCanvas(W, HH);
  H.title(ctx, W, 'The endoscope: light in, picture out',
    'Two bundles of optical fibres work in opposite directions \u2014 one carries light to the organ, the other carries the image back to the eye');

  // ---- Main panel: the instrument ----
  const mx = 70, mw = 1000, my = 150, mh = 560;
  H.panelBox(ctx, mx, my, mw, mh, '#ffffff', C.panelBorder);
  const cy = my + mh / 2 + 30;

  // organ (right)
  const ox = mx + mw - 160, oy = cy;
  ctx.fillStyle = '#fbcfe8';
  ctx.strokeStyle = '#be185d';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.ellipse(ox, oy, 105, 80, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  H.textCentered(ctx, 'the organ', ox, oy - 130, 200, 18, '700', '#be185d');
  H.textCentered(ctx, 'inside the patient', ox, oy - 106, 200, 16, '400', C.sub);

  // main tube
  const tubeY = cy - 55, tubeH = 110, tubeX = mx + 330, tubeW = ox - 70 - tubeX;
  ctx.fillStyle = '#e2e8f0';
  H.roundRect(ctx, tubeX, tubeY, tubeW, tubeH, 22);
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.stroke();
  // the two bundles inside the tube
  ctx.fillStyle = '#fde68a';
  H.roundRect(ctx, tubeX + 14, tubeY + 14, tubeW - 28, 34, 14); ctx.fill();
  ctx.fillStyle = '#c7d2fe';
  H.roundRect(ctx, tubeX + 14, tubeY + 62, tubeW - 28, 34, 14); ctx.fill();
  H.textLeft(ctx, 'non-coherent bundle (carries light in)', tubeX + 30, tubeY + 31, 420, 15, '600', '#92400e');
  H.textLeft(ctx, 'coherent bundle (carries the image back)', tubeX + 30, tubeY + 79, 440, 15, '600', '#4338ca');

  // light travelling right along the yellow bundle
  H.arrow(ctx, tubeX + 30, tubeY + 8, tubeX + tubeW - 90, tubeY + 8, 3, '#f59e0b');
  // light illuminating the organ
  H.arrow(ctx, ox - 60, cy - 30, ox + 10, cy - 20, 3, '#f59e0b');
  // reflected image travelling back left along the violet bundle
  H.arrow(ctx, tubeX + tubeW - 60, tubeY + 100, tubeX + 40, tubeY + 100, 3, '#4f46e5');
  H.arrow(ctx, ox - 20, cy + 30, ox - 80, cy + 30, 3, '#4f46e5');

  // Y junction at the left of the tube: light arm down to source, image arm up to eyepiece
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(tubeX, tubeY + 31);
  ctx.bezierCurveTo(mx + 250, tubeY + 31, mx + 230, my + mh - 90, mx + 170, my + mh - 90);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(tubeX, tubeY + 79);
  ctx.bezierCurveTo(mx + 250, tubeY + 79, mx + 230, my + 110, mx + 170, my + 110);
  ctx.stroke();
  // light source box
  ctx.fillStyle = '#fef3c7';
  ctx.strokeStyle = '#b45309';
  H.roundRect(ctx, mx + 40, my + mh - 130, 200, 80, 12);
  ctx.fill();
  ctx.stroke();
  H.textCentered(ctx, 'bright cold light source', mx + 140, my + mh - 90, 190, 17, '700', '#92400e');
  H.textCentered(ctx, '(bright but no heat \u2014 safe for tissue)', mx + 140, my + mh - 66, 200, 14, '400', C.sub);
  // eyepiece box
  ctx.fillStyle = C.accentSoft;
  ctx.strokeStyle = C.accent;
  H.roundRect(ctx, mx + 40, my + 70, 200, 80, 12);
  ctx.fill();
  ctx.stroke();
  H.textCentered(ctx, 'eyepiece / camera', mx + 140, my + 110, 190, 17, '700', C.accent);
  H.textCentered(ctx, 'the surgeon watches the image here', mx + 140, my + 134, 200, 14, '400', C.sub);

  // numbered step chips
  H.chip(ctx, '1. Light travels down the non-coherent bundle and floods the organ with light', tubeX + tubeW / 2, tubeY - 45, 700, '#fef3c7', '#92400e', 18);
  H.chip(ctx, '2. Light reflects off the organ and enters the coherent bundle at the far end', tubeX + tubeW / 2, tubeY + tubeH + 32, 700, '#e0f2fe', '#0369a1', 18);
  H.textCentered(ctx, '3. Each fibre in the coherent bundle keeps its exact place in the pattern \u2014 whatever shape of light enters one end is rebuilt, point by point, at the other', mx + mw / 2, my + mh - 28, mw - 60, 17, '400', C.sub);

  // ---- Right panel: keyhole surgery ----
  const rx = 1120, rw = 440, ry = 150, rh = 560;
  H.panelBox(ctx, rx, ry, rw, rh, C.okSoft, '#86efac');
  H.textCentered(ctx, 'Why it matters: keyhole surgery', rx + rw / 2, ry + 34, rw - 40, 21, '700', '#166534');
  // patient outline with small cuts
  const tcx = rx + rw / 2, tcy = ry + 210;
  ctx.strokeStyle = '#166534';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.ellipse(tcx, tcy, 120, 150, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = C.warn;
  ctx.lineWidth = 5;
  for (const dx of [-40, 0, 40]) {
    ctx.beginPath();
    ctx.moveTo(tcx + dx, tcy - 40);
    ctx.lineTo(tcx + dx + 8, tcy - 10);
    ctx.stroke();
  }
  H.textCentered(ctx, 'a few small cuts instead of one large incision', tcx, tcy + 185, rw - 80, 17, '600', '#166534');
  const benefits = [
    'The surgeon watches the endoscope picture on a monitor while working with instruments through the other cuts.',
    'Smaller wounds mean less pain, less scarring, lower risk of infection and a much faster recovery.',
    'The same idea inspects the lungs, stomach and joints without any cut at all \u2014 the instrument follows natural passages.',
  ];
  let by2 = tcy + 235;
  for (const b of benefits) {
    const words = b.split(' ');
    let line = '';
    let lineY = by2;
    H.setFont(ctx, 16, '400');
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > rw - 60) {
        H.textLeft(ctx, line, rx + 30, lineY, rw - 60, 16, '400', '#14532d');
        line = word;
        lineY += 21;
      } else line = test;
    }
    H.textLeft(ctx, line, rx + 30, lineY, rw - 60, 16, '400', '#14532d');
    by2 = lineY + 30;
  }

  H.chip(ctx, 'A coherent bundle is one where every fibre keeps its position from end to end \u2014 that ordering is what makes a picture rather than a blur', W / 2, HH - 40, 1200, C.accentSoft, C.accent, 18);

  H.save('a24-endoscope.png', canvas);
}

module.exports = { drawTIR, drawEndoscope };