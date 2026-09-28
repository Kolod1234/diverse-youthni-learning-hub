// Diagram 4 — MRI: mechanism chain and implant safety.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, arrow, chip } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 930);
title(ctx, 1560, 'Magnetic resonance imaging', 'How a strong magnet and a radio pulse build a picture — and why metal decides who can enter');

// Left: mechanism chain
textCentered(ctx, 'THE MECHANISM', 420, 150, 500, 21, '700', C.accent);
const stages = [
  { t: 'ALIGN', d: 'Inside the scanner\u2019s strong magnetic field, hydrogen protons in the body\u2019s water line up like compass needles', fill: C.accent2Soft, stroke: '#bae6fd' },
  { t: 'TIP', d: 'A burst of radio waves knocks the aligned protons out of line with the field', fill: C.accentSoft, stroke: '#c7d2fe' },
  { t: 'RELAX & SIGNAL', d: 'As the protons spring back, they emit a faint radio signal — the strength and timing depend on the tissue', fill: C.pinkSoft, stroke: '#f9a8d4' },
  { t: 'IMAGE', d: 'Coils and a computer read the signals position by position and assemble the detailed image', fill: C.okSoft, stroke: '#bbf7d0' },
];
stages.forEach((s, i) => {
  const y = 185 + i * 168;
  panelBox(ctx, 90, y, 660, 130, s.fill, s.stroke, 14);
  textLeft(ctx, (i + 1) + '. ' + s.t, 116, y + 34, 600, 20, '700');
  paragraph(ctx, s.d, 116, y + 72, 610, 25, 17, '400', C.sub);
  if (i < 3) arrow(ctx, 420, y + 132, 420, y + 160, 3, C.faint);
});

// Right: safety panel
panelBox(ctx, 800, 150, 670, 740, '#fff7f7', '#fecaca', 18);
textCentered(ctx, 'SAFETY: THE MAGNET DECIDES', 1135, 192, 600, 22, '700', C.warn);
const safety = [
  ['No ionising radiation', 'Unlike X-rays and CT, MRI uses no ionising radiation — the risk here is not dose.', C.ok, '#ffffff'],
  ['Projectile effect', 'The magnet is always on. Ferromagnetic implants (some aneurysm clips, metal fragments, some older prostheses) can be forcibly moved by the strong magnetic field — with catastrophic results.', C.warn, C.warnSoft],
  ['Implanted electronic devices', 'Pacemakers and cochlear implants may be reset, inhibited or damaged by the field and the radio pulses.', C.warn, C.warnSoft],
  ['Screening is the control', 'Every patient completes a metal-implant and device checklist before entering the scanner room — the risk assessment happens at the door, not inside.', C.accent, '#ffffff'],
];
let sy = 240;
safety.forEach(([h, d, col, bg]) => {
  panelBox(ctx, 830, sy, 610, 148, bg, '#fecaca', 12);
  textLeft(ctx, h, 856, sy + 32, 560, 19, '700', col === C.ok ? C.ok : col === C.accent ? C.accent : C.warn);
  paragraph(ctx, d, 856, sy + 74, 560, 25, 16, '400', C.sub);
  sy += 162;
});

chip(ctx, 'Portfolio example: a patient with a metal implant \u2014 MRI is unsuitable because the implant may be forcibly moved by the strong magnetic field', 1135, 878, 620, '#fff7f7', C.sub, 16);

save('a210-mri.png', canvas);