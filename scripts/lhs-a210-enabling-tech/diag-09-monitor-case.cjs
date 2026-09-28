// Diagram 9 — medical monitoring case study: the bedside monitor.
const { C, makeCanvas, title, save, panelBox, paragraph, textCentered, textLeft, arrow, chip, lead } = require('./common.cjs');

const { canvas, ctx } = makeCanvas(1560, 950);
title(ctx, 1560, 'Case study: the bedside monitor', 'One patient, three sensors, one decision loop \u2014 monitoring as it happens on a real ward');

// scenario band
panelBox(ctx, 90, 150, 1380, 60, C.pinkSoft, '#f9a8d4', 12);
textCentered(ctx, 'Scenario: a patient, four hours after surgery, is monitored continuously for heart rate, oxygen saturation and blood pressure', 780, 180, 1340, 18, '600', C.ink);

// three sensors
const sensors = [
  { x: 250, name: 'ECG ELECTRODES', d: 'skin electrodes pick up the heart\u2019s millivolt signal \u2192 heart rate and rhythm', fill: C.accentSoft, stroke: '#c7d2fe' },
  { x: 640, name: 'SpO\u2082 FINGER PROBE', d: 'two light wavelengths through the fingertip \u2192 percentage oxygen saturation', fill: C.accent2Soft, stroke: '#bae6fd' },
  { x: 1030, name: 'NIBP CUFF', d: 'cuff inflates on a timer, senses oscillations \u2192 systolic and diastolic pressure every 15 min', fill: C.okSoft, stroke: '#bbf7d0' },
];
sensors.forEach((s) => {
  panelBox(ctx, s.x - 175, 240, 350, 140, s.fill, s.stroke, 14);
  textCentered(ctx, s.name, s.x, 276, 320, 19, '700');
  paragraph(ctx, s.d, s.x - 150, 316, 300, 23, 15, '400', C.sub, 'center');
  arrow(ctx, s.x, 384, s.x, 440, 3, C.faint);
});

// monitor box
panelBox(ctx, 480, 440, 600, 150, '#0f172a', '#0f172a', 16);
textCentered(ctx, 'BEDSIDE MONITOR', 780, 474, 500, 18, '700', '#94a3b8');
textCentered(ctx, 'signal \u2192 filter \u2192 display + alarms', 780, 500, 500, 15, '400', '#cbd5e1');
textCentered(ctx, 'HR 102 bpm     SpO\u2082 95%     BP 118/72', 780, 546, 560, 21, '700', '#4ade80');
arrow(ctx, 1080, 515, 1180, 515, 3, C.faint);
textCentered(ctx, 'alarm limits set for this patient:', 1300, 486, 300, 16, '600', C.sub);
textCentered(ctx, 'HR 50\u2013120, SpO\u2082 not below 92%', 1300, 512, 300, 16, '600', C.sub);
textCentered(ctx, 'outside a limit \u2192 audible alarm', 1300, 538, 300, 16, '400', C.sub);

// response loop
arrow(ctx, 780, 594, 780, 650, 3, C.faint);
panelBox(ctx, 480, 652, 600, 110, C.amberSoft, '#fde68a', 14);
textCentered(ctx, 'NURSE ASSESSES THE PATIENT \u2014 NOT JUST THE NUMBER', 780, 686, 560, 17, '700');
paragraph(ctx, 'Is the probe attached? Is the patient moving? Are the limits right for this patient? Only then: adjust oxygen, give fluids, call for help \u2014 and document what was seen and done.', 780, 716, 560, 24, 15, '400', C.sub, 'center');
arrow(ctx, 1180, 707, 1310, 707, 3, C.faint);
textCentered(ctx, 'obs chart + escalation:\nthe record becomes\nevidence', 1360, 707, 240, 15, '600', C.sub);

// alarm fatigue strip
panelBox(ctx, 90, 790, 1380, 80, '#fff7ed', '#fdba74', 14);
textCentered(ctx, 'ALARM FATIGUE \u2014 THE CASE STUDY\u2019S KEY JUDGEMENT', 780, 818, 1200, 17, '700', C.amber);
textCentered(ctx, 'Too many false alarms train staff to ignore them, so limits must be set for the individual patient \u2014 sensitive enough to catch deterioration, quiet enough to be believed', 780, 848, 1330, 16, '400', C.sub);

save('a210-monitor-case.png', canvas);