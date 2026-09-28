// Diagram 5 — pulse oximetry: the probe, the physics, the reading.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, arrow, chip, lead, roundRect } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 950);
title(ctx, 1560, 'The pulse oximeter', 'Two wavelengths of light through a fingertip become a single number: SpO\u2082');

// Left: the finger probe (cross-section)
textCentered(ctx, 'THE FINGER PROBE', 400, 150, 500, 21, '700', C.accent);
panelBox(ctx, 90, 180, 620, 380, '#ffffff', C.panelBorder, 16);
// finger
roundRect(ctx, 170, 250, 360, 180, 60);
ctx.fillStyle = '#fde8d7';
ctx.fill();
ctx.lineWidth = 3;
ctx.strokeStyle = '#f5c9a4';
ctx.stroke();
textCentered(ctx, 'fingertip', 350, 300, 200, 17, '600', C.sub);
// pulsing arterial blood
roundRect(ctx, 260, 320, 180, 70, 30);
ctx.fillStyle = '#ef4444';
ctx.fill();
textCentered(ctx, 'pulsing arterial blood', 350, 355, 220, 15, '600', '#ffffff');
// LEDs above
[660, 940].forEach((wl, i) => {
  panelBox(ctx, 240 + i * 90, 200, 80, 44, i === 0 ? '#fee2e2' : '#dbeafe', '#fca5a5', 10);
  textCentered(ctx, wl + ' nm', 280 + i * 90, 222, 80, 15, '700');
});
textCentered(ctx, 'red LED', 280, 190, 150, 15, '600', C.sub);
textCentered(ctx, 'infrared LED', 370, 190, 150, 15, '600', C.sub);
arrow(ctx, 280, 246, 300, 268, 2.5, '#dc2626');
arrow(ctx, 370, 246, 350, 268, 2.5, '#2563eb');
// detector below
panelBox(ctx, 300, 460, 110, 44, C.okSoft, '#bbf7d0', 10);
textCentered(ctx, 'photodetector', 355, 482, 120, 15, '700');
arrow(ctx, 350, 404, 350, 456, 2.5, C.sub);
lead(ctx, 355, 482, 480, 508, C.sub);
textLeft(ctx, 'measures how much light of each wavelength arrives', 490, 508, 240, 15, '400', C.sub);

// Right: the physics
textCentered(ctx, 'WHY TWO WAVELENGTHS?', 1150, 150, 500, 21, '700', C.accent);
panelBox(ctx, 800, 180, 660, 250, C.accentSoft, '#c7d2fe', 14);
textLeft(ctx, 'Oxygenated haemoglobin (HbO\u2082)', 830, 220, 600, 18, '700', '#dc2626');
paragraph(ctx, 'absorbs less red light and more infrared — which is why oxygen-rich blood looks bright red', 830, 252, 600, 24, 16, '400', C.sub);
textLeft(ctx, 'Deoxygenated haemoglobin (Hb)', 830, 306, 600, 18, '700', '#7f1d1d');
paragraph(ctx, 'absorbs more red light and less infrared — venous blood looks darker', 830, 338, 600, 24, 16, '400', C.sub);
textLeft(ctx, 'The RATIO of absorbances at the two wavelengths is converted to SpO\u2082 by calibration against known samples — the same Beer\u2013Lambert logic as the colorimeter in Unit A2 9.', 830, 388, 610, 24, 16, '600', C.ink);

// display
panelBox(ctx, 800, 460, 300, 150, '#0f172a', '#0f172a', 16);
textCentered(ctx, 'SpO\u2082', 900, 495, 120, 17, '700', '#94a3b8');
textCentered(ctx, '98%', 900, 550, 240, 46, '700', '#4ade80');
panelBox(ctx, 1130, 460, 330, 150, C.panel, C.panelBorder, 14);
textLeft(ctx, 'SaO\u2082 95\u2013100% \u2192 healthy', 1155, 495, 290, 16, '600', C.ok);
textLeft(ctx, 'Below 92% \u2192 hypoxaemia:', 1155, 527, 290, 16, '600', C.warn);
textLeft(ctx, 'check the patient, give oxygen,', 1155, 555, 290, 16, '400', C.sub);
textLeft(ctx, 'raise the alarm limits review', 1155, 580, 290, 16, '400', C.sub);

// limitations strip
panelBox(ctx, 90, 600, 1370, 120, '#fff7ed', '#fdba74', 14);
textCentered(ctx, 'WHEN THE READING LIES \u2014 LIMITATIONS A PORTFOLIO SHOULD NAME', 775, 632, 1200, 18, '700', C.amber);
const lims = [
  'Nail varnish or dirt absorbs light \u2014 false low',
  'Poor circulation \u2014 weak pulse, unreliable signal',
  'Carbon monoxide poisoning \u2014 falsely high (HbCO also looks red)',
  'Movement artefact \u2014 monitor may lock onto shivering, not pulse',
];
lims.forEach((t, i) => {
  const x = 130 + (i % 2) * 690;
  const y = 672 + Math.floor(i / 2) * 34;
  textLeft(ctx, '\u2022  ' + t, x, y, 640, 16, '400', C.sub);
});

chip(ctx, 'A monitoring device is only as good as its calibration and its user\u2019s knowledge of the failure modes', 775, 790, 1200, '#f1f5f9', C.sub, 18);
chip(ctx, 'The probe never measures oxygen directly \u2014 it measures light, and calibration turns light into a saturation estimate', 775, 850, 1300, C.pinkSoft, C.ink, 17);

save('a210-pulse-ox.png', canvas);