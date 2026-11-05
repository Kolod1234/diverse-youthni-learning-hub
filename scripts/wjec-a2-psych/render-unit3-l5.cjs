/*
 * WJEC A2 Psychology, Lesson 5: Schizophrenia: Explanations and Modification.
 * Diagrams for pages 3, 6 and 9.
 * Run: node scripts/wjec-a2-psych/render-unit3-l5.cjs
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK, TEAL } = H;

/* ---------- Page 3: Biological explanations of schizophrenia ---------- */
function bioSchizophrenia() {
  const [c, x] = make(W, 1086);
  title2(x, 'Biological explanations of schizophrenia');
  sub2(x, 'Revised dopamine hypothesis, enlarged ventricles, genetics and cannabis-induced neurochemistry');

  const cols = [60, 516, 972], PW = 416, rows = [130, 490], PH = 320;
  const panels = [
    ['1. Positive vs negative symptoms', 'Positive symptoms add to normal experience: hallucinations and delusions. Negative symptoms remove normal functions: avolition, alogia and affective flattening (ICD-11 / DSM-5).', BLUE],
    ['2. Mesolimbic hyperdopaminergia', 'Original hypothesis (Randrup & Munkvad, 1966; Seeman, 1987): excessive subcortical D2 receptor activity in the mesolimbic pathway produces positive symptoms such as hallucinations.', PURPLE],
    ['3. Mesocortical hypodopaminergia', 'Revised hypothesis (Davis et al., 1991; Howes & Kapur, 2009): reduced D1 dopamine activity in the prefrontal cortex causes negative and cognitive symptoms.', GREEN],
    ['4. Enlarged ventricles', 'Johnstone et al. (1976) CT scans and Torrey (2002) twin MRI studies show lateral ventricles ~15-20% larger, linked to grey matter loss in temporal and frontal lobes.', AMBER],
    ['5. Genetics & Gottesman (1991)', '48% MZ concordance vs 17% DZ and 1% general population; Ripke et al. (2014) GWAS identified 108 polygenic loci (including dopamine and immune genes).', RED],
    ['6. Cannabis & brain chemistry', 'Andréasson et al. (1987) 15-year study of 45,570 Swedish conscripts found heavy cannabis use raised risk 6x; Caspi et al. (2005) linked adolescent risk to the COMT Val/Val gene.', DARK],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 16, py + 42, i + 1, p[0].replace(/^\d+\.\s*/, ''), p[2], 20);
    wrap(x, p[1], px + 24, px + PW - 24, py + 92, { size: 18, lh: 26 });
  });
  band(x, 850, 206, 'Why 48% MZ concordance proves both nature and nurture',
    'If schizophrenia were 100% genetic, identical twins sharing 100% of their DNA would show 100% concordance. Gottesman (1991) figure of 48% demonstrates a strong biological diathesis that still requires environmental stressors (such as cannabis use or high expressed emotion) to trigger onset.',
    { bodyY: 58 });
  return { file: 'psych-schiz-biological.png' };
}

/* ---------- Page 6: Individual differences & social explanations ---------- */
function psychSocialSchiz() {
  const [c, x] = make(W, 1086);
  title2(x, 'Individual differences and social explanations of schizophrenia');
  sub2(x, 'Frith (1992) cognitive deficits, dysfunctional families, Expressed Emotion and cultural norms');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['Cognitive & psychodynamic', BLUE,
      'Frith (1992) cognitive model: breakdown in metarepresentation (inability to recognise inner speech as self-generated -> auditory hallucinations) and central control (inability to suppress automatic thoughts -> disorganised speech).',
      'Psychodynamic (Fromm-Reichmann, 1948): ego regression triggered by cold, controlling "schizophrenogenic mother".',
      'Evaluation: Stirling et al. (2006) Stroop study supports central control deficits; psychodynamic view lacks empirical validity and blames parents.'],
    ['Double bind & Expressed Emotion', PURPLE,
      'Double bind (Bateson et al., 1956): child receives contradictory verbal and non-verbal messages ("Come hug me" with stiffening body) and cannot comment on the contradiction.',
      'Expressed Emotion (EE; Brown et al., 1972; Vaughn & Leff, 1976): high family hostility, criticism and emotional over-involvement triggered 51% relapse in 9 months vs 13% in low-EE homes.',
      'Evaluation: EE strongly predicts relapse and guides family therapy, whereas double bind rests on retrospective case notes (Berger, 1965).'],
    ['Cultural norms & diagnosis', GREEN,
      'Cultural differences: Cochrane (1977) and Harrison et al. (1988) reported African-Caribbean individuals in the UK were 7x more likely to be diagnosed with schizophrenia than in the Caribbean.',
      'Explanations: clinician ethnocentric bias misinterpreting culturally normal spiritual expressions as hallucinations (Luhrmann et al., 2015) plus urban migration stress (Cantor-Graae & Selten, 2005).',
      'Evaluation: demonstrates how social stressors and diagnostic norms interact with symptom expression.'],
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
  band(x, 804, 250, 'Distinguishing onset from relapse in exam answers',
    'Examiners reward precision: family Expressed Emotion (Vaughn & Leff, 1976) is primarily an explanation of relapse in already diagnosed patients rather than the original cause of onset, making it an ideal partner to biological vulnerability in a diathesis-stress model (Tienari et al., 2004).',
    { bodyY: 58 });
  return { file: 'psych-schiz-psych-social.png' };
}

/* ---------- Page 9: Antipsychotics, CBTp and Family Intervention ---------- */
function modificationSchiz() {
  const [c, x] = make(W, 1086);
  title2(x, 'Methods of modifying schizophrenia');
  sub2(x, 'Typical and atypical antipsychotic chemotherapy, CBTp and family therapy');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['Antipsychotic drugs', BLUE,
      'Typical (first-generation, e.g. chlorpromazine): D2 antagonists blocking dopamine receptors in the mesolimbic pathway to reduce positive symptoms.',
      'Atypical (second-generation, e.g. clozapine, risperidone): transiently block D2 and also target serotonin (5-HT2A), treating both positive and negative symptoms with fewer motor side effects.',
      'Evidence & limits: Thornley et al. (2003) and Meltzer (2012) confirm efficacy over placebo, but tardive dyskinesia (typical) and agranulocytosis/weight gain (atypical) reduce compliance (Lieberman et al., 2005).'],
    ['CBT for psychosis (CBTp)', PURPLE,
      'Mechanism: collaborative therapy (Chadwick et al., 1996; Kingdon & Turkington, 2005) helping patientsreality-test delusions, reappraise the omnipotence of voices and develop coping strategies.',
      'Evidence: Sensky et al. (2000) found CBTp produced continuing symptom improvements at 9-month follow-up compared to befriending; Jauhar et al. (2014) found small-to-moderate effects.',
      'Evaluation: empowers patients without metabolic side effects, but requires engagement and does not cure underlying neurochemical imbalances.'],
    ['Family therapy (Pharoah)', GREEN,
      'Mechanism: psychoeducation, communication training and problem-solving with relatives to lower Expressed Emotion (criticism, hostility and over-involvement).',
      'Evidence: Pharoah et al. (2010) Cochrane review of 53 RCTs showed family intervention reduced relapse significantly and improved medication adherence.',
      'Evaluation: highly cost-effective for NICE care pathways because preventing hospital readmission benefits both the patient and the wider NHS.'],
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
  band(x, 804, 250, 'Interactionist treatment: Guo et al. (2010)',
    'Guo et al. (2010) demonstrated that early-stage schizophrenia patients receiving antipsychotic medication combined with psychosocial therapy had half the relapse rate of those on medication alone. Medication stabilises acute psychosis so the patient can engage productively in CBTp and family therapy.',
    { bodyY: 58 });
  return { file: 'psych-schiz-modification.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([bioSchizophrenia, psychSocialSchiz, modificationSchiz], only);
  console.log(JSON.stringify(done));
})();
module.exports = { bioSchizophrenia, psychSocialSchiz, modificationSchiz };