/*
 * Renders the six Single Award Science lesson 3.6 (Waves) diagrams as PNGs.
 * Style matches the existing sas-physics diagrams (scripts/render-sas35-heat.cjs).
 */
const K = require('./sas-chem/common.cjs');
const fs = require('fs');
const path = require('path');
const { make, save, text, circle, line, arrow, arrowHead, C } = K;

const W = 1448, H = 1086;
const DIR = path.resolve(__dirname, '../public/lesson-assets/sas-physics');
const AMBER = '#b45309', BLUE = '#1d4ed8', RED = '#dc2626', ORANGE = '#ea580c',
      GREY = '#64748b', LIGHT = '#e2e8f0', WATER = '#dbeafe', SOFT = '#475569',
      GREEN = '#15803d';

function box(x, tx, ty, w, h, o = {}) {
  x.fillStyle = o.fill || '#f8fafc';
  x.fillRect(tx, ty, w, h);
  x.strokeStyle = o.stroke || '#e2e8f0';
  x.lineWidth = o.lw || 2;
  x.strokeRect(tx, ty, w, h);
}
function title2(x, s) { text(x, s, W / 2, 46, { size: 32, bold: true }); }
function sub2(x, s, py) { text(x, s, W / 2, py || 88, { size: 20, color: GREY }); }
function panel(x, tx, ty, w, h) { box(x, tx, ty, w, h, { fill: '#f8fafc', stroke: '#e2e8f0', lw: 2 }); }
function panelHeader(x, px, pw, py, num, name) {
  circle(x, px + 52, py, 20, { fill: BLUE, stroke: false });
  text(x, String(num), px + 52, py + 1, { size: 22, bold: true, color: '#fff' });
  text(x, name, px + pw / 2 + 12, py, { size: 27, bold: true });
  line(x, px + 24, py + 32, px + pw - 24, py + 32, { color: LIGHT, lw: 2 });
}
function sine(x, x1, x2, y0, amp, cycles, o = {}) {
  x.beginPath(); x.moveTo(x1, y0);
  const n = 240;
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    x.lineTo(x1 + (x2 - x1) * t, y0 + amp * Math.sin(t * Math.PI * 2 * cycles));
  }
  x.strokeStyle = o.color || BLUE; x.lineWidth = o.lw || 5; x.stroke();
}
function wavy(x, x1, y1, x2, y2, o = {}) {
  const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy) || 1;
  const n = Math.max(6, Math.round(len / 22)), amp = o.amp || 9;
  const nx = -dy / len, ny = dx / len;
  x.beginPath(); x.moveTo(x1, y1);
  for (let i = 1; i <= n; i++) {
    const t = i / n;
    const off = Math.sin(t * Math.PI * (o.cycles || 2)) * amp;
    x.lineTo(x1 + dx * t + nx * off, y1 + dy * t + ny * off);
  }
  x.strokeStyle = o.color || RED; x.lineWidth = o.lw || 3.5;
  if (o.dash) x.setLineDash(o.dash);
  x.stroke(); x.setLineDash([]);
  if (!o.noHead) arrowHead(x, x1, y1, x2, y2, { color: o.color || RED, len: o.len || 14 });
}
function doubleArrowV(x, cx, y1, y2, o = {}) {
  arrow(x, cx, (y1 + y2) / 2, cx, y1, { color: o.color || RED, lw: o.lw || 3 });
  arrow(x, cx, (y1 + y2) / 2, cx, y2, { color: o.color || RED, lw: o.lw || 3 });
}
function doubleArrowH(x, x1, x2, cy, o = {}) {
  arrow(x, (x1 + x2) / 2, cy, x1, cy, { color: o.color || RED, lw: o.lw || 3 });
  arrow(x, (x1 + x2) / 2, cy, x2, cy, { color: o.color || RED, lw: o.lw || 3 });
}

// ---------- 1. Waves transfer energy, not matter ----------
function d_transfer() {
  const [c, x] = make(W, H);
  title2(x, 'A wave carries energy \u2014 not matter');
  sub2(x, 'the rope never travels to the tin can: only the energy in the wave does');

  // Left panel: rope flick
  panel(x, 44, 130, 680, 880);
  panelHeader(x, 44, 680, 180, 1, 'A flicked rope');
  box(x, 84, 420, 28, 200, { fill: LIGHT, stroke: C.ink, lw: 3 });
  sine(x, 116, 580, 520, 72, 4, { color: BLUE, lw: 5 });
  arrow(x, 150, 300, 520, 300, { color: RED, lw: 4 });
  text(x, 'the wave travels along the rope', 350, 265, { size: 20, color: SOFT });
  doubleArrowV(x, 340, 425, 615, { color: GREEN });
  text(x, 'each bit of the rope only moves', 340, 660, { size: 19, color: SOFT });
  text(x, 'up and down \u2014 it never travels along', 340, 692, { size: 19, color: SOFT });
  // tin can at the far end
  x.save(); x.translate(624, 560); x.rotate(-0.55);
  x.fillStyle = LIGHT; x.fillRect(-24, -32, 48, 64);
  x.strokeStyle = C.ink; x.lineWidth = 3.5; x.strokeRect(-24, -32, 48, 64);
  x.restore();
  text(x, 'the can is knocked over:', 384, 800, { size: 19, color: SOFT });
  text(x, 'energy has arrived, even though', 384, 832, { size: 19, color: SOFT });
  text(x, 'no rope ever reached it', 384, 864, { size: 19, color: SOFT });

  // Right panel: stadium wave
  panel(x, 772, 130, 632, 880);
  panelHeader(x, 772, 632, 180, 2, 'A stadium wave');
  for (let i = 0; i < 8; i++) {
    const px = 812 + i * 74;
    if (i === 4) {
      line(x, px, 530, px, 660, { color: C.ink, lw: 6 });
      circle(x, px, 505, 17, { fill: '#fde68a', stroke: C.ink, lw: 3 });
      line(x, px, 560, px - 34, 522, { color: C.ink, lw: 5 });
      line(x, px, 560, px + 34, 522, { color: C.ink, lw: 5 });
    } else {
      box(x, px - 27, 634, 54, 26, { fill: LIGHT, stroke: C.ink, lw: 2 });
      circle(x, px, 612, 16, { fill: '#fde68a', stroke: C.ink, lw: 3 });
      line(x, px, 628, px, 656, { color: C.ink, lw: 5 });
    }
  }
  wavy(x, 830, 400, 1250, 400, { color: RED, lw: 4, amp: 12, cycles: 1.5 });
  text(x, 'the wave sweeps round the ground', 1050, 345, { size: 20, color: SOFT });
  text(x, 'each fan stays in their own seat \u2014 they only', 1050, 760, { size: 19, color: SOFT });
  text(x, 'stand up and sit down as the wave passes', 1050, 792, { size: 19, color: SOFT });
  text(x, 'Energy travelled round the stadium.', 1050, 856, { size: 20, color: C.ink, bold: true });
  text(x, 'Not one person did.', 1050, 890, { size: 20, color: C.ink, bold: true });
  save(c, 'sas-phys-wave-transfer.png', DIR);
}

// ---------- 2. Transverse vs longitudinal ----------
function d_types() {
  const [c, x] = make(W, H);
  title2(x, 'Two kinds of wave');
  sub2(x, 'the difference is the direction the particles vibrate compared with the direction the wave travels');

  // Transverse panel
  panel(x, 44, 130, 680, 880);
  panelHeader(x, 44, 680, 180, 1, 'Transverse waves');
  sine(x, 104, 664, 470, 105, 3.5, { color: BLUE, lw: 5 });
  line(x, 104, 470, 664, 470, { color: GREY, lw: 2, dash: [10, 8] });
  arrow(x, 150, 640, 600, 640, { color: RED, lw: 4 });
  text(x, 'the wave (energy) travels this way', 380, 680, { size: 19, color: SOFT });
  doubleArrowV(x, 200, 340, 600, { color: GREEN });
  text(x, 'particles vibrate at 90\u00b0', 200, 725, { size: 19, color: SOFT });
  text(x, 'to the travel direction', 200, 757, { size: 19, color: SOFT });
  text(x, 'peak', 240, 330, { size: 19, bold: true, color: GREEN });
  text(x, 'trough', 400, 625, { size: 19, bold: true, color: GREEN });
  text(x, 'Examples: light and all electromagnetic', 384, 830, { size: 19, color: SOFT });
  text(x, 'waves, water ripples, waves on a rope,', 384, 862, { size: 19, color: SOFT });
  text(x, 'S-waves in earthquakes', 384, 894, { size: 19, color: SOFT });

  // Longitudinal panel
  panel(x, 772, 130, 632, 880);
  panelHeader(x, 772, 632, 180, 2, 'Longitudinal waves');
  for (let i = 0; i < 52; i++) {
    const base = 812 + i * 14;
    const px = base + 15 * Math.sin(i * 0.32);
    line(x, px, 380, px, 560, { color: BLUE, lw: 3.5 });
  }
  text(x, 'compression', 880, 600, { size: 19, bold: true, color: GREEN });
  text(x, '(particles squashed together)', 880, 632, { size: 17, color: SOFT });
  text(x, 'rarefaction', 1120, 600, { size: 19, bold: true, color: ORANGE });
  text(x, '(particles spread apart)', 1120, 632, { size: 17, color: SOFT });
  arrow(x, 800, 660, 1330, 660, { color: RED, lw: 4 });
  text(x, 'the wave (energy) travels this way', 1065, 700, { size: 19, color: SOFT });
  doubleArrowH(x, 900, 1180, 340, { color: GREEN });
  text(x, 'particles vibrate backwards and', 1040, 290, { size: 19, color: SOFT });
  text(x, 'forwards, along the travel direction', 1040, 258, { size: 19, color: SOFT });
  text(x, 'Examples: sound and ultrasound,', 1050, 830, { size: 19, color: SOFT });
  text(x, 'P-waves in earthquakes', 1050, 862, { size: 19, color: SOFT });
  save(c, 'sas-phys-transverse-longitudinal.png', DIR);
}

// ---------- 3. Labelling a wave ----------
function d_labelled() {
  const [c, x] = make(1448, 940);
  title2(x, 'Labelling a wave');
  sub2(x, 'wavelength, amplitude and frequency \u2014 the three labels examiners always ask for', 88);
  const y0 = 490, amp = 150, lam = 320, x0 = 140;
  line(x, x0 - 20, y0, 1340, y0, { color: GREY, lw: 2.5, dash: [12, 9] });
  text(x, 'rest (undisturbed) position', 1340, y0 + 40, { size: 18, color: GREY, align: 'right' });
  sine(x, x0, 1400, y0, amp, (1400 - x0) / lam, { color: BLUE, lw: 6 });
  // peak / trough labels
  text(x, 'peak', x0 + 80, y0 - amp - 42, { size: 21, bold: true, color: GREEN });
  text(x, 'trough', x0 + 240, y0 + amp + 48, { size: 21, bold: true, color: GREEN });
  // amplitude arrow
  line(x, x0 + 480, y0, x0 + 480, y0 - amp, { color: RED, lw: 3, dash: [6, 6] });
  arrow(x, 660, y0, 660, y0 - amp, { color: RED, lw: 4 });
  text(x, 'amplitude \u2014 always measured from the rest', 880, y0 - amp - 25, { size: 20, color: RED, align: 'left' });
  text(x, 'position to a peak (never peak to trough!)', 880, y0 - amp + 7, { size: 20, color: RED, align: 'left' });
  // wavelength double arrow between two peaks
  line(x, x0 + 80, y0 - amp - 90, x0 + 80, y0 - amp - 4, { color: AMBER, lw: 2.5 });
  line(x, x0 + 400, y0 - amp - 90, x0 + 400, y0 - amp - 4, { color: AMBER, lw: 2.5 });
  doubleArrowH(x, x0 + 80, x0 + 400, y0 - amp - 118, { color: AMBER, lw: 4 });
  text(x, 'wavelength \u03bb \u2014 one complete wave, e.g. peak to peak', (x0 + 240), y0 - amp - 165, { size: 20, color: AMBER });
  // bottom notes
  box(x, 120, 720, 1210, 150, { fill: '#f8fafc', stroke: LIGHT, lw: 2 });
  text(x, 'amplitude  \u2192  the loudness of a sound, or the intensity of a light wave', 725, 765, { size: 20, color: C.ink, align: 'left' });
  text(x, 'frequency  \u2192  the pitch of a sound \u2014 the number of complete waves passing a', 725, 800, { size: 20, color: C.ink, align: 'left' });
  text(x, 'point each second, measured in hertz (Hz)', 155, 835, { size: 20, color: C.ink, align: 'left' });
  save(c, 'sas-phys-wave-labelled.png', DIR);
}

// ---------- 4. Sound and hearing range ----------
function d_sound() {
  const [c, x] = make(W, H);
  title2(x, 'Sound is a longitudinal wave \u2014 and our ears have limits');
  // top panel: loudspeaker and air
  panel(x, 44, 130, 1360, 430);
  x.fillStyle = LIGHT; x.strokeStyle = C.ink; x.lineWidth = 4;
  x.beginPath(); x.moveTo(130, 300); x.lineTo(190, 230); x.lineTo(190, 480); x.lineTo(130, 410); x.closePath(); x.fill(); x.stroke();
  x.beginPath(); x.moveTo(190, 230); x.lineTo(250, 250); x.lineTo(250, 460); x.lineTo(190, 480); x.closePath(); x.fill(); x.stroke();
  circle(x, 250, 355, 12, { fill: C.ink, stroke: false });
  text(x, 'loudspeaker cone vibrates', 190, 540, { size: 19, color: SOFT });
  for (let row = 0; row < 6; row++) {
    const py = 270 + row * 34;
    for (let i = 0; i < 76; i++) {
      const px = 330 + i * 13.5 + 17 * Math.sin(i * 0.34 + row * 0.9);
      circle(x, px, py + 4 * Math.sin(row * 2.1), 5, { fill: '#94a3b8', stroke: false });
    }
  }
  arrow(x, 340, 470, 1330, 470, { color: RED, lw: 4 });
  text(x, 'sound travels through the air', 840, 510, { size: 19, color: SOFT });
  doubleArrowH(x, 420, 640, 200, { color: GREEN });
  text(x, 'each air particle only vibrates', 530, 165, { size: 18, color: SOFT });
  text(x, 'forwards and backwards', 530, 195, { size: 18, color: SOFT });
  // bottom panel: hearing scale
  panel(x, 44, 600, 1360, 400);
  const y1 = 940;
  box(x, 100, 850, 220, 70, { fill: '#f1f5f9', stroke: GREY, lw: 2 });
  text(x, 'too low to hear', 210, 885, { size: 18, color: SOFT });
  text(x, '(below 20 Hz)', 210, 910, { size: 17, color: SOFT });
  box(x, 320, 850, 700, 70, { fill: '#dcfce7', stroke: GREEN, lw: 3 });
  text(x, 'human hearing: 20 Hz to 20 000 Hz', 670, 885, { size: 21, bold: true, color: GREEN });
  box(x, 1020, 850, 300, 70, { fill: WATER, stroke: BLUE, lw: 3 });
  text(x, 'ultrasound (above 20 000 Hz)', 1170, 885, { size: 18, bold: true, color: BLUE });
  arrow(x, 100, y1, 1330, y1, { color: C.ink, lw: 4 });
  text(x, '1 Hz', 100, y1 + 40, { size: 18, color: SOFT });
  text(x, '20 Hz', 320, y1 + 40, { size: 18, color: SOFT });
  text(x, '20 000 Hz', 1020, y1 + 40, { size: 18, color: SOFT });
  text(x, 'higher and higher frequency \u2192', 700, 990, { size: 19, color: SOFT });
  text(x, 'frequency axis not to scale', 1330, 640, { size: 16, color: GREY, align: 'right' });
  save(c, 'sas-phys-sound-hearing.png', DIR);
}

// ---------- 5. Uses of ultrasound ----------
function d_ultrasound() {
  const [c, x] = make(W, H);
  title2(x, 'Ultrasound at work');
  sub2(x, 'sound above 20 000 Hz, beyond human hearing \u2014 timed echoes tell us a distance');
  const pw = 430, gap = 34, x0 = 44, y0 = 130, ph = 880;
  [x0, x0 + pw + gap, x0 + 2 * (pw + gap)].forEach((px, i) => panel(x, px, y0, pw, ph));
  panelHeader(x, x0, pw, 180, 1, 'Sonar depth sounding');
  panelHeader(x, x0 + pw + gap, pw, 180, 2, 'Prenatal scanning');
  panelHeader(x, x0 + 2 * (pw + gap), pw, 180, 3, 'Flaw detection');

  // Panel 1: sonar
  const c1 = 259;
  wavy(x, c1, 350, c1, 200, { color: WATER, lw: 3, noHead: true, amp: 14, cycles: 8 });
  line(x, c1 - 140, 350, c1 + 140, 350, { color: BLUE, lw: 4 });
  x.fillStyle = C.ink;
  x.beginPath(); x.moveTo(c1 - 70, 350); x.lineTo(c1 + 70, 350); x.lineTo(c1 + 40, 400); x.lineTo(c1 - 40, 400); x.closePath(); x.fill();
  x.strokeStyle = C.ink; x.lineWidth = 3.5;
  x.beginPath(); x.moveTo(c1 - 40, 400); x.lineTo(c1 - 22, 402); x.lineTo(c1 - 30, 372); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(c1 + 40, 400); x.lineTo(c1 + 22, 402); x.lineTo(c1 + 30, 372); x.closePath(); x.fill();
  text(x, 'ship', c1, 428, { size: 18, color: GREY });
  wavy(x, c1, 430, c1, 830, { color: RED, lw: 3, amp: 9, cycles: 6 });
  wavy(x, c1 + 30, 840, c1 + 30, 450, { color: BLUE, lw: 3, amp: 9, cycles: 6, dash: [8, 6] });
  line(x, c1 - 110, 840, c1 + 90, 840, { color: SOFT, lw: 4 });
  x.beginPath(); x.moveTo(c1 - 110, 840); x.lineTo(c1 - 100, 828); x.lineTo(c1 - 120, 828); x.closePath(); x.fill();
  text(x, 'seabed', c1 + 55, 878, { size: 18, color: GREY });
  text(x, 'pulse down, echo back \u2014', c1, 620, { size: 19, color: SOFT });
  text(x, 'the echo time gives the depth:', c1, 652, { size: 19, color: SOFT });
  text(x, 'depth = (speed \u00d7 time) \u00f7 2', c1, 684, { size: 20, bold: true, color: C.ink });

  // Panel 2: prenatal scan
  const c2 = 723;
  box(x, c2 - 46, 300, 92, 34, { fill: LIGHT, stroke: C.ink, lw: 3 });
  text(x, 'transducer', c2, 317, { size: 16, color: C.ink });
  x.beginPath(); x.ellipse(c2, 560, 150, 170, 0, 0, Math.PI * 2);
  x.fillStyle = '#fdeef0'; x.fill(); x.strokeStyle = C.ink; x.lineWidth = 3.5; x.stroke();
  x.beginPath(); x.ellipse(c2, 570, 80, 80, 0, 0, Math.PI * 2);
  x.fillStyle = '#fecdd3'; x.fill(); x.setLineDash([9, 7]); x.strokeStyle = RED; x.lineWidth = 3; x.stroke(); x.setLineDash([]);
  wavy(x, c2, 334, c2, 420, { color: RED, lw: 3, amp: 7, cycles: 4 });
  wavy(x, c2, 470, c2, 640, { color: RED, lw: 3, amp: 7, cycles: 7 });
  wavy(x, c2 + 26, 500, c2 + 26, 360, { color: BLUE, lw: 3, amp: 7, cycles: 5, dash: [8, 6] });
  text(x, 'waves partly reflect at each', c2, 830, { size: 19, color: SOFT });
  text(x, 'boundary; a computer times the', c2, 862, { size: 19, color: SOFT });
  text(x, 'echoes and builds the image', c2, 894, { size: 19, color: SOFT });
  text(x, 'ultrasound is non-ionising:', c2, 660, { size: 19, bold: true, color: GREEN });

  // Panel 3: flaw detection
  const c3 = 1187;
  box(x, c3 - 190, 470, 330, 90, { fill: LIGHT, stroke: C.ink, lw: 4 });
  line(x, c3 + 10, 480, c3 + 10, 550, { color: RED, lw: 4, dash: [3, 5] });
  text(x, 'crack', c3 + 42, 515, { size: 18, bold: true, color: RED, align: 'left' });
  box(x, c3 - 190, 430, 92, 40, { fill: C.ink, stroke: false });
  text(x, 'probe', c3 - 144, 450, { size: 16, color: '#fff' });
  wavy(x, c3 - 96, 500, c3 - 30, 500, { color: RED, lw: 3, amp: 8, cycles: 3 });
  wavy(x, c3 - 20, 500, c3 - 80, 440, { color: BLUE, lw: 3, amp: 8, cycles: 3, dash: [8, 6] });
  text(x, 'metal beam', c3 - 25, 596, { size: 18, color: GREY });
  text(x, 'the wave meets the crack and', c3, 680, { size: 19, color: SOFT });
  text(x, 'reflects early \u2014 the hidden fault', c3, 712, { size: 19, color: SOFT });
  text(x, 'is found without any damage', c3, 744, { size: 19, color: SOFT });
  text(x, 'also used: ultrasonic cleaning of', c3, 850, { size: 18, color: SOFT });
  text(x, 'delicate jewellery and instruments', c3, 882, { size: 18, color: SOFT });
  save(c, 'sas-phys-ultrasound-uses.png', DIR);
}

// ---------- 6. The EM spectrum ----------
function d_em() {
  const [c, x] = make(1448, 860);
  title2(x, 'The electromagnetic spectrum');
  sub2(x, 'one family of transverse waves \u2014 all travel at the same enormous speed through a vacuum');
  const bx = 60, bw = 1328, by = 250, bh = 110;
  const segs = [
    ['Radio waves', '#bfdbfe', 'television and radio', 'broadcasting'],
    ['Microwaves', '#a7f3d0', 'satellite TV, mobile', 'phones, cooking'],
    ['Infrared', '#fde68a', 'remote controls,', 'thermal imaging'],
    ['Visible light', '#fca5a5', 'seeing, photography,', 'fibre-optic cables'],
    ['Ultraviolet', '#c4b5fd', 'security markers on', 'banknotes, sunbeds'],
    ['X-rays', '#f9a8d4', 'medical images', 'of bones and teeth'],
    ['Gamma rays', '#fda4af', 'sterilising medical', 'kit, cancer treatment'],
  ];
  segs.forEach((s, i) => {
    const sx = bx + (bw / 7) * i;
    x.fillStyle = s[1]; x.fillRect(sx, by, bw / 7, bh);
    x.strokeStyle = '#ffffff'; x.lineWidth = 4; x.strokeRect(sx, by, bw / 7, bh);
    text(x, s[0], sx + bw / 14, by + bh / 2, { size: 20, bold: true, color: '#0f172a' });
    text(x, s[2], sx + bw / 14, by + bh + 46, { size: 17, color: SOFT });
    text(x, s[3], sx + bw / 14, by + bh + 74, { size: 17, color: SOFT });
  });
  arrow(x, 400, 190, 100, 190, { color: BLUE, lw: 4 });
  text(x, 'wavelength gets longer', 250, 160, { size: 19, color: BLUE });
  arrow(x, 1048, 190, 1348, 190, { color: RED, lw: 4 });
  text(x, 'frequency gets higher', 1198, 160, { size: 19, color: RED });
  box(x, 60, 470, 1328, 120, { fill: '#fffbeb', stroke: '#fcd34d', lw: 2 });
  text(x, 'All seven are transverse waves and all travel at 3 \u00d7 10\u2078 m/s through a vacuum \u2014 nothing travels faster.', 724, 510, { size: 20, color: C.ink });
  text(x, 'Ultraviolet, X-rays and gamma rays are ionising: they can damage the DNA inside living cells.', 724, 548, { size: 20, bold: true, color: AMBER });
  text(x, 'Visible light is the only part of the spectrum our eyes can detect.', 724, 620, { size: 20, color: SOFT });
  save(c, 'sas-phys-em-spectrum.png', DIR);
}

const all = { d_transfer, d_types, d_labelled, d_sound, d_ultrasound, d_em };
const only = process.argv[2];
fs.mkdirSync(DIR, { recursive: true });
Object.entries(all).forEach(([name, fn]) => {
  if (!only || name === only) { fn(); console.log('rendered', name); }
});
console.log('done sas 3.6 waves diagrams');
module.exports = all;