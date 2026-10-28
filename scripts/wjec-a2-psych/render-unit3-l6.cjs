/*
 * WJEC A2 Psychology, Lesson 6: Stress: Explanations and Modification.
 * Diagrams for pages 3, 6 and 9.
 * Run: node scripts/wjec-a2-psych/render-unit3-l6.cjs
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK, TEAL } = H;

/* ---------- Page 3: Dual stress pathways (SAM and HPA) ---------- */
function stressPathways() {
  const [c, x] = make(W, 1086);
  title2(x, 'Biological stress pathways: SAM, HPA and stress genes');
  sub2(x, 'Acute fight-or-flight activation, chronic cortisol release and genetic reactivity');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['Acute SAM pathway', BLUE,
      'Trigger: hypothalamus detects an immediate threat and activates the sympathetic branch of the autonomic nervous system (ANS).',
      'Hormones: adrenal medulla secretes adrenaline and noradrenaline into the bloodstream, raising heart rate, blood pressure, bronchodilation and blood glucose for fight or flight (Cannon, 1932).',
      'Evolutionary value & cost: adaptive for short physical emergencies, but Taylor et al. (2000) note females may show "tend and befriend" via oxytocin.'],
    ['Chronic HPA axis', PURPLE,
      'Pathway: hypothalamus releases CRH -> anterior pituitary releases ACTH -> adrenal cortex secretes corticosteroids (cortisol) to maintain steady energy supplies.',
      'General Adaptation Syndrome (Selye, 1936): Alarm reaction -> Resistance stage -> Exhaustion stage when resources are depleted.',
      'Immunosuppression: Kiecolt-Glaser et al. (1984, 1995) showed medical students under exam stress had lower natural killer (NK) cell activity and slower wound healing.'],
    ['Stress genes (5-HTTLPR)', RED,
      'Genetic mechanism: variation in the serotonin transporter gene (SLC6A4 / 5-HTTLPR) alters amygdala reactivity and hypothalamic-pituitary stress regulation.',
      'Evidence: Caspi et al. (2003) longitudinal study of 847 New Zealanders found individuals with two short (s/s) alleles developed severe stress/depression after multiple life events.',
      'Evaluation: Feder et al. (2009) confirm heritability of HPA reactivity (~40-50%), proving gene-environment interaction rather than pure genetic fate.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 21);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25 });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
    text(x, 'Evaluation', px + PW / 2, y + 24, { size: 18, bold: true, color: AMBER });
    wrap(x, p[4], px + 24, px + PW - 24, y + 52, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'Why evolutionary fight-or-flight harms modern health',
    'Ancestral stressors were brief physical threats (predators) where adrenaline and cortisol were burned off in action. Modern psychological stressors (mortgages, exams, workplace deadlines) trigger the same SAM and HPA cascades day after day, causing hypertension, endothelial damage and immune suppression.',
    { bodyY: 58 });
  return { file: 'psych-stress-pathways.png' };
}

/* ---------- Page 6: Individual differences & social explanations ---------- */
function psychSocialStress() {
  const [c, x] = make(W, 1086);
  title2(x, 'Individual differences and social explanations of stress');
  sub2(x, 'Type A/B personality, Hardiness, Self-Efficacy, Life Events, Daily Hassles and Locus of Control');

  const cols = [60, 516, 972], PW = 416, rows = [130, 490], PH = 320;
  const panels = [
    ['1. Type A vs Type B', 'Friedman & Rosenman (1974) 8.5-year study of 3,154 men: Type A (time-urgent, competitive, hostile) had 2x the coronary heart disease (70% of CHD deaths) compared to relaxed Type B.', BLUE],
    ['2. Hardiness (Kobasa, 1979)', 'Three C buffer: Commitment (involvement), Control (belief in influence) and Challenge (viewing change as growth). High-stress executives with high hardiness stayed healthy.', PURPLE],
    ['3. Self-efficacy (Bandura)', 'Belief in one capability to execute actions required to manage demands (Bandura, 1997). High self-efficacy promotes challenge appraisal rather than threat appraisal (Lazarus & Folkman, 1984).', GREEN],
    ['4. Life events (SRRS)', 'Holmes & Rahe (1967) Social Readjustment Rating Scale: 43 life changes Requiring readjustment (LCUs); scores over 300 correlated (+0.118, Rahe et al., 1970) with illness.', AMBER],
    ['5. Daily hassles (Kanner)', 'Kanner et al. (1981) Hassles and Uplifts Scale (117 items): minor everyday irritations (traffic, lost keys) predicted psychological distress better than major life events.', RED],
    ['6. Locus of control (Rotter)', 'Rotter (1966): internals believe outcomes depend on own effort (active problem-focused coping); externals attribute outcomes to luck or fate, experiencing higher helplessness.', DARK],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 16, py + 42, i + 1, p[0].replace(/^\d+\.\s*/, ''), p[2], 21);
    wrap(x, p[1], px + 24, px + PW - 24, py + 92, { size: 18, lh: 26 });
  });
  band(x, 850, 206, 'Refining Friedman & Rosenman: hostility and Type D',
    'Later re-analyses (Dembroski et al., 1989; Myrtek, 2001) revealed that cynical hostility is the toxic component of Type A behaviour rather than work speed alone, while Denollet (2005) added Type D (distressed: negative affectivity and social inhibition) as a major cardiac risk factor.',
    { bodyY: 58 });
  return { file: 'psych-stress-psych-social.png' };
}

/* ---------- Page 9: Beta blockers and Stress Inoculation Training ---------- */
function modificationStress() {
  const [c, x] = make(W, 1086);
  title2(x, 'Methods of modifying stress');
  sub2(x, 'Sympathetic beta-adrenergic blockers versus Meichenbaum (1985) Stress Inoculation Training');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['Beta blockers (e.g. propranolol)', BLUE,
      'Mechanism: peripheral beta-adrenergic antagonists bind to beta-1 and beta-2 receptors on the heart and blood vessels without crossing the blood-brain barrier, blocking adrenaline and noradrenaline.',
      'Evidence: Lockwood (1989) surveyed 2,122 orchestral musicians and found 27% used beta blockers, with 96% reporting reduced stage-fright tremor and tachycardia.',
      'Evaluation: rapid, effortless physiological relief and no sedation, but ignores psychological causes and carries side effects (bradycardia, cold extremities, asthma risk).'],
    ['Stress Inoculation Training (SIT)', PURPLE,
      'Meichenbaum (1985) three phases: (1) Conceptualisation (educating client on transactional stress and identifying triggers), (2) Skills acquisition and rehearsal (relaxation + positive coping self-statements), (3) Application and follow-through (graduated exposure via role-play and real stressors).',
      'Evidence: Saunders et al. (1996) meta-analysis of 37 studies (1,837 participants) confirmed SIT significantly reduced performance anxiety and enhanced coping.',
      'Evaluation: builds lifelong cognitive resilience across future stressors, though time-intensive and demanding high client commitment.'],
    ['Hardiness & biofeedback', GREEN,
      'Hardiness training (Maddi et al., 1998): teaches focusing, reconstructing stressful situations and self-improvement to build Commitment, Control and Challenge.',
      'Biofeedback (Budzynski et al., 1973): real-time EMG/heart-rate monitoring trains operant voluntary activation of the parasympathetic nervous system.',
      'Evaluation: combines well with SIT to address both cognitive appraisal and physiological arousal without lifelong drug dependence.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 20);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25 });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 16, { size: 17, lh: 24, color: SOFT });
    text(x, 'Evaluation', px + PW / 2, y + 24, { size: 18, bold: true, color: AMBER });
    wrap(x, p[4], px + 24, px + PW - 24, y + 52, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'Acute performance stress versus chronic life stress',
    'Beta blockers are ideal for acute, predictable somatic anxiety (such as a concert performance or surgery) where trembling is the main problem, whereas Meichenbaum Stress Inoculation Training is far superior for chronic occupational or academic stress because it changes cognitive appraisal.',
    { bodyY: 58 });
  return { file: 'psych-stress-modification.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([stressPathways, psychSocialStress, modificationStress], only);
  console.log(JSON.stringify(done));
})();
module.exports = { stressPathways, psychSocialStress, modificationStress };