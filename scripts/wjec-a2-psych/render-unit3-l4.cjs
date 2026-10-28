/*
 * WJEC A2 Psychology, Lesson 4: Criminal Behaviours: Explanations and Modification.
 * Diagrams for pages 3, 6 and 9.
 * Run: node scripts/wjec-a2-psych/render-unit3-l4.cjs
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK, TEAL } = H;

/* ---------- Page 3: Biological explanations of criminal behaviour ---------- */
function bioCriminal() {
  const [c, x] = make(W, 1086);
  title2(x, 'Biological explanations of criminal behaviours');
  sub2(x, 'Inherited criminality, the role of the amygdala and the disinhibition hypothesis');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['Inherited criminality', BLUE,
      'Genetic mechanisms: twin and adoption studies plus candidate genes such as MAOA-L ("warrior gene", Brunner et al., 1993) and CDH13 (Tiihonen et al., 2015) affecting serotonin/dopamine turnover.',
      'Evidence: Christiansen (1977) found 35% MZ vs 13% DZ male concordance; Mednick et al. (1984) Danish adoption study (14,427 adoptees) found 20% conviction rate with biological criminal parents vs 13.5% control.',
      'Evaluation: Caspi et al. (2002) proved gene-environment (GxE) interaction: MAOA-L predicted antisocial behaviour only when combined with childhood maltreatment.'],
    ['Role of the amygdala', PURPLE,
      'Neural mechanism: the amygdala processes fear conditioning and empathy for others distress; prefrontal-amygdala circuitry regulates emotional impulses.',
      'Evidence: Raine et al. (1997) PET scans of 41 NGRI murderers showed reduced amygdala/prefrontal glucose metabolism; Gao et al. (2010) found poor fear conditioning at age 3 predicted crime at age 23.',
      'Evaluation: amygdala hypofunction explains fearless, callous psychopathy, but cannot explain white-collar or socially motivated offending.'],
    ['Disinhibition hypothesis', RED,
      'Mechanism: alcohol or frontal lobe dysfunction impairs the prefrontal cortex (PFC) and lowers serotonin, releasing subcortical aggressive impulses that are normally inhibited.',
      'Evidence: Graham et al. (2006) and Steele & Josephs (1990) alcohol myopia show intoxication narrows attention to immediate provocative cues while blinding the person to long-term consequences.',
      'Evaluation: explains situational violence under intoxication, though cultural expectations also shape drunken behaviour (MacAndrew & Edgerton, 1969).'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 21);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25 });
    text(x, 'Empirical evidence', px + PW / 2, y + 24, { size: 18, bold: true, color: p[1] });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 52, { size: 17, lh: 24, color: SOFT });
    text(x, 'Evaluation', px + PW / 2, y + 24, { size: 18, bold: true, color: AMBER });
    wrap(x, p[4], px + 24, px + PW - 24, y + 52, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'Why biological determinism is rejected in court',
    'While Raine (2013) argues neurocriminology identifies genuine biological risk factors, the legal system assumes free will (mens rea). Biological factors create a vulnerability (diathesis) rather than an inevitable destiny, interacting with family environment and social opportunity.',
    { bodyY: 58 });
  return { file: 'psych-criminal-biological.png' };
}

/* ---------- Page 6: Individual differences & social explanations ---------- */
function psychSocialCriminal() {
  const [c, x] = make(W, 1086);
  title2(x, 'Individual differences and social explanations of crime');
  sub2(x, 'Eysenck criminal personality, Kohlberg moral stages, Differential Association and Gender Socialisation');

  const cols = [60, 516, 972], PW = 416, rows = [130, 490], PH = 320;
  const panels = [
    ['1. Eysenck (1964) PEN model', 'High Extraversion (chronically under-aroused ARAS seeking stimulation), high Neuroticism (reactive autonomic system) and high Psychoticism (cold, aggressive) impede conscience conditioning.', BLUE],
    ['2. Cognitive & Kohlberg', 'Palmer & Hollin (1998) found offenders reason at Kohlberg pre-conventional level (Stage 1 punishment avoidance, Stage 2 self-interest), reinforced by minimalisation and hostile attribution bias.', PURPLE],
    ['3. Psychodynamic (Bowlby)', 'Bowlby (1944) 44 juvenile thieves study linked prolonged early maternal deprivation to affectionless psychopathy; Blackburn (1993) notes weak superego development.', RED],
    ['4. Differential Association', 'Sutherland (1939): crime is learned in intimate groups when definitions favourable to law-breaking outweigh unfavourable ones, alongside specific techniques.', GREEN],
    ['5. Gender socialisation', 'Boys are socialised toward risk, toughness and autonomy, whereas girls experience closer parental supervision (Heidensohn, 1985) and chivalry/patriarchal control.', AMBER],
    ['6. Critical evaluation', 'Farrington et al. (1982) found prisoners scored high on P and N but not consistently on E; Sutherland explains family crime transmission well but cannot measure exact definition ratios.', DARK],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 16, py + 42, i + 1, p[0].replace(/^\d+\.\s*/, ''), p[2], 21);
    wrap(x, p[1], px + 24, px + PW - 24, py + 92, { size: 18, lh: 26 });
  });
  band(x, 850, 206, 'Connecting Eysenck and Sutherland',
    'Eysenck (1964) bridges biology and conditioning by arguing that extraverts condition poorly to social rules, but Sutherland (1939) points out that an individual with intact conditioning will still offend if raised in a subculture that actively rewards crime.',
    { bodyY: 58 });
  return { file: 'psych-criminal-psych-social.png' };
}

/* ---------- Page 9: Anger management and Restorative Justice ---------- */
function modificationCriminal() {
  const [c, x] = make(W, 1086);
  title2(x, 'Methods of modifying criminal behaviours');
  sub2(x, 'Novaco (1975) CBT Anger Management and Braithwaite (2004) Restorative Justice');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['Anger Management (Novaco)', BLUE,
      'Three CBT stages: (1) Cognitive preparation (identifying anger triggers and hostile appraisals), (2) Skill acquisition (self-talk, breathing and relaxation), (3) Application practice (role-play with therapist provocation).',
      'Evidence: Keen et al. (2000) found young offenders reported increased awareness and self-control; Dowden & Andrews (2000) meta-analysis showed CBT programmes reduced recidivism significantly.',
      'Evaluation: tackles cognitive causes rather than just symptoms, but Blackburn (1993) notes role-play lacks real-world adrenaline and is unsuitable for instrumental offences like fraud.'],
    ['Restorative Justice (RJ)', GREEN,
      'Mechanism: supervised conference between offender and victim (Braithwaite, 1989 reintegrative shaming). Offender hears emotional harm caused, apologises and agrees active reparation.',
      'Evidence: Shapland et al. (2008) 7-year UK Ministry of Justice evaluation found 85% victim satisfaction and a 14% reduction in reoffending frequency (saving £8 per £1 spent).',
      'Evaluation: empowers victims and fosters genuine empathy, but requires genuine offender remorse and is inappropriate for domestic abuse or unrepentant psychopaths.'],
    ['Behaviourist token economies', PURPLE,
      'Mechanism: operant conditioning inside custodial institutions (Hobbs & Holt, 1976). Prosocial behaviours earn secondary reinforcers (tokens) exchangeable for privileges.',
      'Evidence: Hobbs & Holt (1976) increased cooperative behaviour from 66% to 92% across 125 delinquent boys; Field et al. (2004) improved youth custody compliance.',
      'Evaluation: improves institutional order quickly, but gains vanish after release once external reinforcement stops, unlike CBT or RJ.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 20);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25 });
    text(x, 'Empirical evidence', px + PW / 2, y + 24, { size: 18, bold: true, color: p[1] });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 52, { size: 17, lh: 24, color: SOFT });
    text(x, 'Evaluation', px + PW / 2, y + 24, { size: 18, bold: true, color: AMBER });
    wrap(x, p[4], px + 24, px + PW - 24, y + 52, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'Selecting the right modification for the offence',
    'Anger management is tailored to reactive violent offenders whose crimes stem from hostile attribution bias and poor impulse regulation, whereas Restorative Justice works best when a victim-offender dialogue can awaken moral responsibility and repair community bonds.',
    { bodyY: 58 });
  return { file: 'psych-criminal-modification.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([bioCriminal, psychSocialCriminal, modificationCriminal], only);
  console.log(JSON.stringify(done));
})();
module.exports = { bioCriminal, psychSocialCriminal, modificationCriminal };