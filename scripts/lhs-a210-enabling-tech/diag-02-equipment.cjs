// Diagram 2 — the four families of equipment used in modern medicine.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, arrow, chip } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 940);
title(ctx, 1560, 'Equipment in modern medicine — four families', 'What each family does, and the examples this unit follows in depth');

const families = [
  {
    x: 90, y: 150, fill: C.pinkSoft, stroke: '#f9a8d4', name: 'DIAGNOSTIC',
    role: 'Look inside the body without surgery',
    items: ['Ultrasound scanner — echoes of high-frequency sound', 'X-ray and CT — absorption of ionising radiation', 'MRI — radio signal from protons in a strong magnet'],
    science: 'Energy is sent in; the way tissue changes it becomes the picture',
  },
  {
    x: 800, y: 150, fill: C.accentSoft, stroke: '#c7d2fe', name: 'MONITORING',
    role: 'Watch a body variable continuously',
    items: ['Pulse oximeter — light absorbance of blood, two wavelengths', 'ECG — the heart\u2019s own tiny voltages through skin electrodes', 'Blood-pressure monitor — oscillations in a cuff'],
    science: 'A sensor tracks one variable and raises an alarm outside safe limits',
  },
  {
    x: 90, y: 540, fill: C.accent2Soft, stroke: '#bae6fd', name: 'THERAPEUTIC & REPLACEMENT',
    role: 'Support or replace a failing function',
    items: ['Kidney dialysis — diffusion across a semipermeable membrane', 'Cardiac pacemaker — timed electrical pulses to the heart', 'Infusion pump — controlled delivery of a drug at a set rate'],
    science: 'The device performs, or takes over, a physiological job',
  },
  {
    x: 800, y: 540, fill: C.amberSoft, stroke: '#fde68a', name: 'LIFE SUPPORT & EMERGENCY',
    role: 'Take over a vital process when it stops',
    items: ['Ventilator — moves air into the lungs at set rate and volume', 'Defibrillator — a large shock to reset a disorganised rhythm'],
    science: 'Failure is immediate, so alarms, back-ups and training are critical',
  },
];
families.forEach((f) => {
  panelBox(ctx, f.x, f.y, 670, 350, f.fill, f.stroke, 18);
  textCentered(ctx, f.name, f.x + 335, f.y + 46, 620, 23, '700');
  textCentered(ctx, f.role, f.x + 335, f.y + 84, 620, 19, '600', C.sub);
  f.items.forEach((it, i) => {
    ctx.beginPath();
    ctx.arc(f.x + 62, f.y + 140 + i * 58, 5, 0, Math.PI * 2);
    ctx.fillStyle = C.ink;
    ctx.fill();
    textLeft(ctx, it, f.x + 82, f.y + 140 + i * 58, 560, 17, '400', C.ink);
  });
  paragraph(ctx, f.science, f.x + 42, f.y + 316, 590, 24, 16, '600', C.sub);
});

// Shared principle strip
panelBox(ctx, 90, 915, 1380, 0 + 0, '#ffffff', '#ffffff', 1); // no-op keeps layout parity
const stripY = 905;
panelBox(ctx, 90, stripY - 78, 1380, 96, '#f1f5f9', '#cbd5e1', 16);
textCentered(ctx, 'THE SHARED PRINCIPLE', 200, stripY - 50, 300, 18, '700', C.accent);
textLeft(ctx, 'Every family rests on a transducer: a device that converts a body quantity — pressure, a millivolt voltage,', 340, stripY - 50, 1100, 18, '600', C.ink);
textLeft(ctx, 'absorbed light, a sound echo — into an electrical signal that can be amplified, filtered, displayed and acted on.', 340, stripY - 22, 1100, 18, '400', C.sub);

save('a210-equipment-families.png', canvas);