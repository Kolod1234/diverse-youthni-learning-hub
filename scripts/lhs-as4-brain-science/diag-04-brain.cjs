// AS 4 Brain Science — diagrams 5 and 6: the brain's lobes and the stress response.
const { C, textLeft, textCentered, makeCanvas, title, save, arrow, roundRect, panelBox, lead, setFont } = require('./common.cjs');

function renderBrainLobes() {
  const W = 1500, H = 1000;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'The brain from the side: localisation of function',
    'Specific regions do specific jobs \u2014 remember the lobes as F-POT');

  // ---- Cerebrum (side view, front of the brain on the left) ----
  // Region fills first, outline on top, dashed dividers over the fills.
  roundRect(ctx, 265, 175, 355, 350, 120); ctx.fillStyle = C.accentSoft; ctx.fill();   // frontal
  roundRect(ctx, 620, 175, 300, 215, 16); ctx.fillStyle = C.accent2Soft; ctx.fill();    // parietal
  roundRect(ctx, 920, 175, 185, 350, 90); ctx.fillStyle = C.okSoft; ctx.fill();        // occipital
  roundRect(ctx, 620, 390, 300, 135, 16); ctx.fillStyle = C.amberSoft; ctx.fill();     // temporal

  // Dividers.
  ctx.save();
  ctx.setLineDash([12, 9]);
  ctx.strokeStyle = C.sub;
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(620, 178); ctx.lineTo(620, 522); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(920, 178); ctx.lineTo(920, 522); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(620, 390); ctx.lineTo(920, 390); ctx.stroke();
  ctx.restore();

  // Cerebrum outline.
  roundRect(ctx, 260, 170, 850, 390, 150);
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 6;
  ctx.stroke();

  // Cerebellum.
  ctx.fillStyle = C.pinkSoft;
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 5;
  ctx.beginPath(); ctx.arc(1000, 625, 82, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  ctx.strokeStyle = C.sub;
  ctx.lineWidth = 2.5;
  for (const dy of [-28, 0, 28]) {
    ctx.beginPath(); ctx.moveTo(935, 625 + dy - 14);
    ctx.quadraticCurveTo(1000, 625 + dy + 14, 1065, 625 + dy - 14);
    ctx.stroke();
  }

  // Brainstem.
  roundRect(ctx, 815, 552, 84, 200, 26);
  ctx.fillStyle = '#fde8e8';
  ctx.fill();
  ctx.strokeStyle = C.ink;
  ctx.lineWidth = 5;
  ctx.stroke();

  // ---- Labels with leader lines ----
  lead(ctx, 275, 340, 235, 340);
  textLeft(ctx, 'FRONTAL LOBE', 40, 300, 190, 20, '700', C.accent);
  textLeft(ctx, 'planning, decision-making,', 40, 330, 190, 15, '400', C.sub);
  textLeft(ctx, 'personality, initiating', 40, 352, 190, 15, '400', C.sub);
  textLeft(ctx, 'voluntary movement', 40, 374, 190, 15, '400', C.sub);

  lead(ctx, 770, 250, 830, 145);
  textLeft(ctx, 'PARIETAL LOBE', 840, 118, 190, 20, '700', C.accent2);
  textLeft(ctx, 'touch, temperature, pain,', 840, 145, 200, 15, '400', C.sub);
  textLeft(ctx, 'spatial awareness', 840, 167, 200, 15, '400', C.sub);

  lead(ctx, 1010, 340, 1065, 300);
  textLeft(ctx, 'OCCIPITAL LOBE', 1080, 285, 190, 20, '700', C.ok);
  textLeft(ctx, 'vision \u2014 the signals from', 1080, 312, 210, 15, '400', C.sub);
  textLeft(ctx, 'your eyes end up here', 1080, 334, 210, 15, '400', C.sub);

  lead(ctx, 700, 460, 600, 640);
  textLeft(ctx, 'TEMPORAL LOBE', 380, 610, 200, 20, '700', C.amber);
  textLeft(ctx, 'hearing, language, memory \u2014', 340, 637, 250, 15, '400', C.sub);
  textLeft(ctx, 'houses the hippocampus', 340, 659, 250, 15, '400', C.sub);

  lead(ctx, 1070, 660, 1120, 700);
  textLeft(ctx, 'CEREBELLUM', 1130, 682, 180, 20, '700', C.pink);
  textLeft(ctx, 'balance, posture,', 1130, 709, 180, 15, '400', C.sub);
  textLeft(ctx, 'fine coordination', 1130, 731, 180, 15, '400', C.sub);

  lead(ctx, 857, 700, 800, 790);
  textLeft(ctx, 'BRAINSTEM', 620, 770, 160, 20, '700', C.warn);
  textLeft(ctx, 'breathing, heart rate, blood pressure \u2014', 400, 797, 420, 15, '400', C.sub);
  textLeft(ctx, 'automatic, and it keeps you alive', 400, 819, 420, 15, '400', C.sub);

  // Bottom band: localisation principle + memory aid.
  panelBox(ctx, 90, 855, W - 180, 105, C.accentSoft);
  textCentered(ctx, 'Localisation of function: particular jobs live in particular places \u2014 damage to one region produces a predictable pattern of symptoms.', W / 2, 892, W - 260, 20, '700');
  textCentered(ctx, 'Memory aid \u2014 F-POT: Frontal (Thinking, Movement) \u00b7 Parietal (Sensory) \u00b7 Occipital (Vision) \u00b7 Temporal (Hearing, Memory)', W / 2, 928, W - 260, 18, '400', C.sub);

  save('as4-brain-lobes.png', canvas);
}

function renderStressResponse() {
  const W = 1500, H = 1000;
  const { canvas, ctx } = makeCanvas(W, H);
  title(ctx, W, 'Fight or flight: the body\u2019s stress response',
    'A fast lane (adrenaline, seconds) and a slower lane (cortisol, minutes) prepare the body to act');

  // Stimulus + hypothalamus.
  panelBox(ctx, 70, 400, 250, 160, C.warnSoft);
  textCentered(ctx, 'STRESSOR', 195, 435, 220, 21, '700', C.warn);
  textCentered(ctx, 'you glimpse a large,', 195, 475, 220, 15, '400', C.sub);
  textCentered(ctx, 'unfamiliar dog on', 195, 497, 220, 15, '400', C.sub);
  textCentered(ctx, 'your running route', 195, 519, 220, 15, '400', C.sub);

  arrow(ctx, 325, 480, 375, 480, 4);

  panelBox(ctx, 380, 430, 220, 100);
  textCentered(ctx, 'Hypothalamus', 490, 460, 200, 20, '700');
  textCentered(ctx, 'the brain\u2019s alarm button', 490, 490, 200, 15, '400', C.sub);

  // Fast lane (upper).
  arrow(ctx, 490, 425, 530, 330, 4, C.accent2);
  panelBox(ctx, 535, 250, 260, 110, C.accent2Soft);
  textCentered(ctx, 'Sympathetic nervous system', 665, 285, 230, 18, '700');
  textCentered(ctx, 'nerve signals flash out \u2014 within seconds', 665, 315, 230, 15, '400', C.sub);
  arrow(ctx, 800, 305, 955, 305, 4, C.accent2);
  panelBox(ctx, 960, 250, 270, 110, C.accent2Soft);
  textCentered(ctx, 'Adrenal medulla', 1095, 285, 240, 18, '700');
  textCentered(ctx, 'releases ADRENALINE into the blood', 1095, 315, 240, 15, '400', C.sub);

  // Slow lane (lower).
  arrow(ctx, 490, 535, 530, 610, 4, C.amber);
  panelBox(ctx, 535, 570, 260, 110, C.amberSoft);
  textCentered(ctx, 'Pituitary gland', 665, 605, 230, 18, '700');
  textCentered(ctx, 'sends a hormonal signal \u2014 minutes', 665, 635, 230, 15, '400', C.sub);
  arrow(ctx, 800, 625, 955, 625, 4, C.amber);
  panelBox(ctx, 960, 570, 270, 110, C.amberSoft);
  textCentered(ctx, 'Adrenal cortex', 1095, 605, 240, 18, '700');
  textCentered(ctx, 'releases CORTISOL for the longer haul', 1095, 635, 240, 15, '400', C.sub);

  // Arrows into the effects panel.
  arrow(ctx, 1240, 360, 1300, 700, 4, C.accent2);
  arrow(ctx, 1240, 640, 1305, 700, 4, C.amber);

  // Effects panel (bottom right).
  panelBox(ctx, 760, 700, 660, 230);
  setFont(ctx, 21, '700');
  textCentered(ctx, 'The body changes \u2014 ready to fight or run', 1090, 732, 600, 21, '700');
  const effects = [
    'Heart beats faster \u2014 blood is diverted to the muscles',
    'Breathing quickens and airways widen \u2014 more oxygen in',
    'Pupils dilate \u2014 take in more light and movement',
    'Liver releases glucose \u2014 fuel on immediate standby',
    'Digestion slows \u2014 blood is needed elsewhere',
  ];
  effects.forEach((e, i) => textLeft(ctx, '\u2022  ' + e, 800, 772 + i * 30, 600, 16, '600'));

  // Recovery note (bottom left).
  panelBox(ctx, 70, 700, 640, 230, C.okSoft);
  textCentered(ctx, 'When the threat passes', 390, 735, 600, 21, '700', C.ok);
  textLeft(ctx, 'The parasympathetic nervous system reverses the changes: heart rate', 100, 775, 590, 16, '400', C.sub);
  textLeft(ctx, 'settles, breathing slows, digestion returns \u2014 the body calms down.', 100, 800, 590, 16, '400', C.sub);
  textLeft(ctx, 'But long-lasting stress keeps cortisol high, which can harm sleep,', 100, 845, 590, 16, '400', C.sub);
  textLeft(ctx, 'immunity and even memory \u2014 managing stress is a health issue, not a luxury.', 100, 870, 590, 16, '400', C.sub);

  save('as4-stress-response.png', canvas);
}

module.exports = { renderBrainLobes, renderStressResponse };