// Diagrams 1-2: sound as a longitudinal wave; reflection, refraction, diffraction.
const H = require('./common.cjs');
const { C } = H;

// ---------------- Diagram 1: sound as a longitudinal wave ----------------
function drawSoundWave() {
  const W = 1600, HH = 950;
  const { canvas, ctx } = H.makeCanvas(W, HH);
  H.title(ctx, W, 'Sound: a longitudinal wave',
    'A vibrating source makes air particles oscillate back and forth \u2014 energy travels along, the air itself does not');

  // ---- Panel A: the particle picture (longitudinal) ----
  const ax = 90, ay = 150, aw = 1420, ah = 470;
  H.panelBox(ctx, ax, ay, aw, ah, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'Longitudinal wave: particles oscillate parallel to the direction of travel', ax + aw / 2, ay + 26, aw - 40, 21, '700', C.accent);

  // speaker
  ctx.fillStyle = C.accent;
  H.roundRect(ctx, 128, 330, 60, 90, 10); ctx.fill();
  ctx.beginPath();
  ctx.moveTo(188, 342); ctx.lineTo(188, 408); ctx.lineTo(252, 452); ctx.lineTo(252, 298); ctx.closePath();
  ctx.fill();
  H.textCentered(ctx, 'vibrating', 158, 442, 120, 17, '600', C.accent);
  H.textCentered(ctx, 'speaker cone', 158, 462, 130, 17, '600', C.accent);

  // dot field: longitudinal displacement of columns
  const x0 = 300, x1 = 1370, y0 = 220, y1 = 570;
  const rows = 14, lam = 160, amp = 20;
  ctx.fillStyle = '#334155';
  for (let bx = x0; bx <= x1; bx += 25) {
    const dx = amp * Math.sin(2 * Math.PI * (bx - x0) / lam);
    for (let r = 0; r < rows; r++) {
      const py = y0 + (y1 - y0) * r / (rows - 1);
      ctx.beginPath();
      ctx.arc(bx + dx, py, 5, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  // compressions at x = 540 and 700 (u = 240, 400); rarefaction midway at 620
  H.bracket(ctx, 540, 700, 600, 'one wavelength \u03BB', C.sub);
  H.lead(ctx, 460, 690, 540, 500, C.warn);
  H.textCentered(ctx, 'compression', 460, 716, 220, 20, '700', C.warn);
  H.textCentered(ctx, 'particles crowded, pressure high', 460, 741, 230, 16, '400', C.sub);
  H.lead(ctx, 900, 690, 660, 500, C.accent2);
  H.textCentered(ctx, 'rarefaction', 900, 716, 220, 20, '700', C.accent2);
  H.textCentered(ctx, 'particles spread out, pressure low', 900, 741, 230, 16, '400', C.sub);

  // direction of travel
  H.dashedLine(ctx, 620, 190, 1000, 190, C.accent, 3);
  H.arrow(ctx, 1000, 190, 1060, 190, 3, C.accent);
  H.textLeft(ctx, 'the wave (energy) travels this way', 640, 168, 440, 18, '600', C.accent);

  // oscillation marker
  H.arrow(ctx, 1150, 380, 1205, 380, 3, C.ok);
  H.arrow(ctx, 1235, 380, 1180, 380, 3, C.ok);
  H.textLeft(ctx, 'each particle just oscillates to and fro about a fixed point', 1100, 345, 330, 17, '600', C.ok);

  // ---- Panel B: transverse comparison ----
  const by = 660;
  H.panelBox(ctx, ax, by, aw, 240, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'For comparison: a transverse wave (light, water ripples)', ax + aw / 2, by + 26, aw - 40, 21, '700', C.ok);
  const base = by + 135, amp2 = 70, lam2 = 300, sx = 150, ex = 1450;
  ctx.strokeStyle = C.faint;
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(sx, base); ctx.lineTo(ex, base); ctx.stroke();
  ctx.strokeStyle = C.ok;
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let x = sx; x <= ex; x += 4) {
    const y = base - amp2 * Math.sin(2 * Math.PI * (x - sx) / lam2);
    if (x === sx) ctx.moveTo(x, y); else ctx.lineTo(x, y);
  }
  ctx.stroke();
  const crest = sx + lam2 / 4;
  H.arrow(ctx, crest + 110, base, crest + 110, base - amp2, 2.5, C.sub);
  H.arrow(ctx, crest + 110, base - amp2, crest + 110, base, 2.5, C.sub);
  H.textLeft(ctx, 'amplitude', crest + 125, base - 35, 160, 18, '600', C.sub);
  H.bracket(ctx, crest, crest + lam2, base - amp2 - 26, 'one wavelength \u03BB', C.sub);
  H.dashedLine(ctx, 1230, by + 200, 1380, by + 200, C.ok, 3);
  H.arrow(ctx, 1380, by + 200, 1430, by + 200, 3, C.ok);
  H.textLeft(ctx, 'wave travels', 1220, by + 177, 200, 17, '600', C.ok);

  H.chip(ctx, 'Sound needs a medium \u2014 with no particles to squeeze and stretch, a vacuum is silent', W / 2, HH - 22, 940, C.amberSoft, '#92400e');
  H.save('a24-sound-wave.png', canvas);
}

// ---------------- Diagram 2: reflection, refraction, diffraction ----------------
function drawWaveBehaviour() {
  const W = 1600, HH = 950;
  const { canvas, ctx } = H.makeCanvas(W, HH);
  H.title(ctx, W, 'What sound waves do at obstacles and boundaries',
    'Three behaviours the examination keeps returning to: reflection, refraction and diffraction');

  const pw = 460, ph = 620, py = 150, gap = 45;
  const pxs = [70, 70 + pw + gap, 70 + 2 * (pw + gap)];

  // ---- Panel 1: reflection ----
  H.panelBox(ctx, pxs[0], py, pw, ph, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'Reflection \u2014 the echo', pxs[0] + pw / 2, py + 30, pw - 30, 21, '700', C.accent);
  const wx = pxs[0] + pw - 78;
  ctx.fillStyle = C.sub;
  H.roundRect(ctx, wx, py + 70, 40, 350, 6); ctx.fill();
  H.textCentered(ctx, 'large flat wall', wx + 20, py + 445, 200, 17, '600', C.sub);
  // person
  const ppx = pxs[0] + 120, ppy = py + 390;
  ctx.fillStyle = C.ink;
  ctx.beginPath(); ctx.arc(ppx, ppy - 62, 15, 0, Math.PI * 2); ctx.fill();
  H.roundRect(ctx, ppx - 22, ppy - 42, 44, 80, 12); ctx.fill();
  // sound out and back
  H.arrow(ctx, ppx + 14, ppy - 58, wx + 10, py + 165, 3.5, C.accent);
  H.arrow(ctx, wx + 10, py + 200, ppx + 24, ppy - 32, 3.5, C.warn);
  H.textLeft(ctx, 'sound out', pxs[0] + 175, py + 165, 140, 17, '700', C.accent);
  H.textLeft(ctx, 'echo back', pxs[0] + 175, py + 210, 140, 17, '700', C.warn);
  H.textCentered(ctx, 'Angle of incidence = angle of reflection', pxs[0] + pw / 2, py + 495, pw - 30, 18, '600', C.sub);
  H.textCentered(ctx, 'Sonar and echo-sounding measure the time a reflected', pxs[0] + pw / 2, py + 535, pw - 30, 16, '400', C.sub);
  H.textCentered(ctx, 'pulse takes to come back \u2014 half the time there, half back', pxs[0] + pw / 2, py + 558, pw - 30, 16, '400', C.sub);

  // ---- Panel 2: refraction ----
  H.panelBox(ctx, pxs[1], py, pw, ph, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'Refraction \u2014 bending at a boundary', pxs[1] + pw / 2, py + 30, pw - 30, 21, '700', C.accent);
  const bnd = py + 310;
  ctx.fillStyle = '#e0f2fe';
  ctx.fillRect(pxs[1] + 8, py + 58, pw - 16, bnd - py - 58);
  ctx.fillStyle = '#0b6ea9';
  ctx.fillRect(pxs[1] + 8, bnd, pw - 16, ph - 200);
  H.textLeft(ctx, 'air \u2014 sound 340 m/s', pxs[1] + 20, py + 84, 240, 17, '700', '#0369a1');
  H.textLeft(ctx, 'water \u2014 sound about 1500 m/s', pxs[1] + 20, bnd + 28, 300, 17, '700', '#ffffff');
  ctx.strokeStyle = C.ink; ctx.lineWidth = 2.5;
  ctx.beginPath(); ctx.moveTo(pxs[1] + 8, bnd); ctx.lineTo(pxs[1] + pw - 8, bnd); ctx.stroke();
  const nxs = pxs[1] + pw / 2;
  H.dashedLine(ctx, nxs, py + 66, nxs, py + ph - 70, C.sub);
  H.textLeft(ctx, 'normal', nxs + 8, py + 78, 110, 15, '600', C.sub);
  H.arrow(ctx, nxs - 150, py + 70, nxs, bnd, 3.5, C.warn);
  H.arrow(ctx, nxs, bnd, nxs + 170, bnd + 78, 3.5, C.warn);
  H.chip(ctx, 'bends AWAY from the normal', pxs[1] + pw / 2, bnd + 130, pw - 60, C.amberSoft, '#92400e', 17);
  H.textCentered(ctx, 'Entering the faster medium the wavefronts stretch and the ray bends away from the normal; entering a slower medium it bends towards it.', pxs[1] + pw / 2, py + ph - 42, pw - 40, 16, '400', C.sub);

  // ---- Panel 3: diffraction ----
  H.panelBox(ctx, pxs[2], py, pw, ph, '#ffffff', C.panelBorder);
  H.textCentered(ctx, 'Diffraction \u2014 spreading through gaps', pxs[2] + pw / 2, py + 30, pw - 30, 21, '700', C.accent);
  const gyc = py + 300, gx = pxs[2] + pw / 2;
  // wall with a gap in the middle
  ctx.fillStyle = C.sub;
  ctx.fillRect(pxs[2] + 40, gyc - 130, gx - 90 - (pxs[2] + 40), 22);
  ctx.fillRect(gx + 90, gyc - 130, pw - 190, 22);
  // plane wavefronts arriving from the left
  ctx.strokeStyle = C.accent2;
  ctx.lineWidth = 3;
  for (let i = 0; i < 3; i++) {
    const lx = pxs[2] + 60 + i * 45;
    ctx.beginPath();
    ctx.moveTo(lx, gyc - 115);
    ctx.lineTo(lx, gyc - 25);
    ctx.stroke();
  }
  H.arrow(ctx, pxs[2] + 70, gyc - 170, pxs[2] + 160, gyc - 170, 3, C.accent2);
  H.textLeft(ctx, 'sound arrives', pxs[2] + 45, gyc - 195, 200, 16, '600', C.accent2);
  // diffracted wavefronts beyond the gap
  ctx.strokeStyle = C.warn;
  ctx.lineWidth = 3;
  for (let r = 40; r <= 150; r += 36) {
    ctx.beginPath();
    ctx.arc(gx, gyc + 5, r, -Math.PI * 0.42, Math.PI * 0.42);
    ctx.stroke();
  }
  H.arrow(ctx, gx, gyc + 170, gx, gyc + 235, 3, C.warn);
  H.textCentered(ctx, 'the wave spreads into the shadow of the wall \u2014 which is why you can hear someone through an open door even when you cannot see them', pxs[2] + pw / 2, py + ph - 45, pw - 40, 16, '400', C.sub);

  H.save('a24-wave-behaviour.png', canvas);
}

module.exports = { drawSoundWave, drawWaveBehaviour };