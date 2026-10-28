/*
 * WJEC A2 Psychology, Lesson 7: Cultural Bias and Sexism in Psychological Research.
 * Diagrams for pages 3, 6 and 9.
 * Run: node scripts/wjec-a2-psych/render-unit3-l7.cjs
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK, TEAL } = H;

/* ---------- Page 3: Cultural bias concepts ---------- */
function culturalBias() {
  const [c, x] = make(W, 1086);
  title2(x, 'Controversy 1: Cultural bias in psychological research');
  sub2(x, 'Ethnocentrism, WEIRD samples, imposed etics and cross-cultural psychology');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['WEIRD & ethnocentrism', BLUE,
      'WEIRD sampling (Henrich et al., 2010): 96% of participants in top psychology journals come from Western, Educated, Industrialised, Rich, Democratic societies (68% from the USA alone).',
      'Ethnocentrism (Sumner, 1906; Berry, 1969): judging other cultures by the standards of one own culture and treating deviations as deficits.',
      'Historical damage: Yerkes (1917) US Army Alpha/Beta IQ tests used culturally biased items to rank immigrants and justify the 1924 Immigration Restriction Act (Gould, 1981).'],
    ['Emic vs imposed etic', PURPLE,
      'Etic approach: looks for universal laws across cultures; an imposed etic (Berry, 1969) occurs when a tool developed in one culture is applied unmodified to another.',
      'Case example: Ainsworth Strange Situation (1970) treated US separation protest as the universal norm, mislabelling Japanese infants (Takahashi, 1986) as insecure-resistant and German infants (Grossmann et al., 1985) as insecure-avoidant.',
      'Emic approach: studies behaviour from inside a specific cultural system using indigenous concepts.'],
    ['Difference vs bias', GREEN,
      'Cross-cultural validation: Bond & Smith (1996) meta-analysis of 133 Asch conformity studies across 17 countries showed collectivist cultures conform more (37%) than individualist cultures (25%) due to harmony values, not weakness.',
      'Diagnostic impact: Luhrmann et al. (2015) showed auditory hallucinations in Ghana and India were often playful/ancestor voices rather than violent commands seen in US patients.',
      'Resolution: indigenous psychology, culturally matched researchers and derived etics.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 21);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25 });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
    text(x, 'Key implication', px + PW / 2, y + 24, { size: 18, bold: true, color: AMBER });
    wrap(x, p[4], px + 24, px + PW - 24, y + 52, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'Alpha bias versus beta bias in cultural research',
    'Cultural alpha bias exaggerates differences between cultures (treating groups as fundamentally alien), whereas cultural beta bias minimises cultural differences by assuming Western laboratory findings apply universally to all humanity (an imposed etic).',
    { bodyY: 58 });
  return { file: 'psych-controversy-cultural-bias.png' };
}

/* ---------- Page 6: Sexism and gender bias ---------- */
function sexismBias() {
  const [c, x] = make(W, 1086);
  title2(x, 'Controversy 2: Sexism and gender bias in psychology');
  sub2(x, 'Alpha bias, beta bias, androcentrism, heterosexism and the invisibility of women');

  const cols = [60, 516, 972], PW = 416, rows = [130, 490], PH = 320;
  const panels = [
    ['1. Alpha bias (exaggeration)', 'Theories that exaggerate differences between men and women, often devaluing females: e.g. Freud (1905) psychosexual theory claiming women have weaker superegos and penis envy.', BLUE],
    ['2. Beta bias (minimisation)', 'Theories that ignore or minimise sex differences by studying only males and generalising to all: e.g. Kohlberg (1969) all-male moral reasoning sample and Cannon fight-or-flight.', PURPLE],
    ['3. Gilligan (1982) critique', 'Carol Gilligan showed Kohlberg Stage 3 (interpersonal care) vs Stage 4 (abstract rules) penalised women ethics of care by measuring it against a male ethics of justice.', GREEN],
    ['4. Invisibility of women', 'Women were historically excluded as participants (e.g. Asch, Milgram, Zimbardo) and senior authors, while female distress was medicalised (e.g. PMS or hysteria; Ussher, 2006).', AMBER],
    ['5. Heterosexism (Herek, 1990)', 'Assuming heterosexual norms as the default baseline in relationship and parenting research (Kitzinger & Coyle, 2002) and pathologising homosexuality in DSM until 1973.', RED],
    ['6. Feminist & evolutionary debate', 'Buss (1989) evolutionary mate-preference research is criticised by Eagly & Wood (1999) social role theory for naturalising historical economic inequalities between sexes.', DARK],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 16, py + 42, i + 1, p[0].replace(/^\d+\.\s*/, ''), p[2], 21);
    wrap(x, p[1], px + 24, px + PW - 24, py + 92, { size: 18, lh: 26 });
  });
  band(x, 850, 206, 'Gender difference versus gender bias',
    'Finding an empirical sex difference (such as Maccoby & Jacklin, 1974 or Hyde, 2005 gender similarities hypothesis) is not inherently sexist; bias arises when researchers interpret differences as biological inferiority, ignore social context or treat male behaviour as the universal gold standard.',
    { bodyY: 58 });
  return { file: 'psych-controversy-sexism.png' };
}

/* ---------- Page 9: Synoptic links across AS and A2 ---------- */
function biasSynoptic() {
  const [c, x] = make(W, 1086);
  title2(x, 'Synoptic evidence map: cultural bias and sexism across the course');
  sub2(x, 'How to weave AS Unit 1/2 studies and A2 Unit 3 behaviours into Section B essays');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['AS Unit 1 & 2 classic studies', BLUE,
      'Freud (1909) Little Hans: Viennese bourgeois cultural context and alpha-biased Oedipal theory.',
      'Bowlby (1951) & Ainsworth (1970): maternal deprivation used politically to discourage post-war female employment; Strange Situation as imposed etic.',
      'Milgram (1963) & Zimbardo (1973): all-male American samples initially generalised as universal human obedience and tyranny (beta bias).'],
    ['A2 Unit 3 behaviours', PURPLE,
      'Autism: Baron-Cohen Extreme Male Brain and male-normed diagnostic criteria leaving camouflaging girls undiagnosed (Gould & Ashton-Smith, 2011).',
      'Schizophrenia: 7x higher UK diagnosis rate in African-Caribbean patients (Harrison et al., 1988) and historical mother-blaming (Fromm-Reichmann, 1948).',
      'Stress & Crime: Taylor et al. (2000) tend-and-befriend vs male fight-or-flight; Pollak (1950) chivalry thesis and gender socialisation in offending.'],
    ['Constructive solutions', GREEN,
      'Reflexivity (Wilkinson, 1988): researchers explicitly acknowledging and controlling how their own gender and cultural background shape hypotheses and interpretation.',
      'Derived etics (Berry, 1969): building cross-cultural tools collaboratively using local researchers (e.g. Bond & Smith, 1996; Buss, 1989 37-culture study).',
      'Gender Similarities Hypothesis (Hyde, 2005): meta-analysis of 46 meta-analyses showing 78% of psychological gender differences are near zero or small.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 21);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25 });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
    y = wrap(x, p[4], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'Exam technique: the 25-mark Controversy essay',
    'Unit 3 Section B awards 25 marks (10 AO1, 15 AO3) for one synoptic essay chosen from two options. Top-band answers define the controversy precisely, trace historical and social context, deploy at least four varied psychological examples across AS and A2, and reach a balanced conclusion.',
    { bodyY: 58 });
  return { file: 'psych-controversy-bias-synoptic.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([culturalBias, sexismBias, biasSynoptic], only);
  console.log(JSON.stringify(done));
})();
module.exports = { culturalBias, sexismBias, biasSynoptic };