/*
 * WJEC A2 Psychology, Lesson 12: Inferential Statistics: Choosing, Applying and Interpreting Non-Parametric Tests.
 * Diagrams for pages 3, 6 and 9.
 * Run: node scripts/wjec-a2-psych/render-unit4-l12.cjs
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK, TEAL } = H;

/* ---------- Page 3: Decision tree for the four WJEC inferential tests ---------- */
function inferentialDecisionMatrix() {
  const [c, x] = make(W, 1086);
  title2(x, 'Choosing the right inferential test on WJEC Unit 4');
  sub2(x, 'Three questions decide every test: difference vs correlation, experimental design, and level of measurement');

  const cols = [60, 516, 972], PW = 416, rows = [130, 490], PH = 320;
  const panels = [
    ['1. Chi-squared (χ²)', 'Use when: testing a test of difference or association across independent categories (independent groups) and the data are NOMINAL frequency counts in a contingency table.', BLUE],
    ['2. Mann-Whitney U', 'Use when: testing a difference between two conditions using an INDEPENDENT GROUPS design and the data are at least ORDINAL (or interval/ratio scores converted to ranks).', PURPLE],
    ['3. Wilcoxon (T)', 'Use when: testing a difference between two conditions using a REPEATED MEASURES or MATCHED PAIRS design and the data are at least ORDINAL (differences are ranked).', GREEN],
    ['4. Spearman rank (rs)', 'Use when: testing a CORRELATION (relationship/association) between two continuous co-variables where data are at least ORDINAL (both variables are ranked).', AMBER],
    ['5. Critical value direction rule', 'Tests WITHOUT an "R" in their name (Mann-Whitney U, Wilcoxon T): observed value must be LESS THAN OR EQUAL TO (≤) the critical value to be significant.', RED],
    ['6. Critical value "R" rule', 'Tests WITH an "R" in their name (Chi-squared, Spearman rank): observed value must be GREATER THAN OR EQUAL TO (≥) the critical value to be significant.', DARK],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 16, py + 42, i + 1, p[0].replace(/^\d+\.\s*/, ''), p[2], 21);
    wrap(x, p[1], px + 24, px + PW - 24, py + 92, { size: 18, lh: 26 });
  });
  band(x, 850, 206, 'How to earn all 3 marks on a "Justify the choice of statistical test" question',
    'State three explicit points contextualised to the scenario: (1) whether the study tests a difference or a correlation, (2) the experimental design (independent groups vs repeated measures/matched pairs, if a difference), and (3) the level of measurement of the data (nominal vs ordinal/interval/ratio).',
    { bodyY: 58 });
  return { file: 'psych-unit4-inferential-matrix.png' };
}

/* ---------- Page 6: Probability, p-values and Type I / Type II errors ---------- */
function probabilityAndErrors() {
  const [c, x] = make(W, 1086);
  title2(x, 'Probability, significance levels and Type I vs Type II errors');
  sub2(x, 'Why psychology sets the conventional alpha threshold at p ≤ 0.05 (5%)');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['The p ≤ 0.05 convention', BLUE,
      'Meaning of p ≤ 0.05: there is a 5% (1 in 20) or smaller probability that the observed difference or correlation occurred by chance alone if the null hypothesis were true.',
      'Decision: when p ≤ 0.05, psychologists reject the null hypothesis (H0) and accept the alternative hypothesis (H1).',
      'Stricter p ≤ 0.01 (1%): used in medical drug trials or irreversible interventions where a false positive could harm patients.'],
    ['Type I error (false positive)', RED,
      'Definition: rejecting the null hypothesis (claiming a significant effect) when the null hypothesis is actually true and the result was a fluke of chance.',
      'When risk is highest: when the significance level is set too leniently (e.g. p ≤ 0.10, a 10% risk) or when many tests are run without correction.',
      'Mnemonic: Type I = Optimistic error (seeing an effect that is not really there).'],
    ['Type II error (false negative)', PURPLE,
      'Definition: retaining the null hypothesis (claiming no significant effect) when the alternative hypothesis is actually true and a real effect was missed.',
      'When risk is highest: when the significance level is set too stringently (e.g. p ≤ 0.001) or when the sample size (N) is very small.',
      'Mnemonic: Type II = Pessimistic error (missing a real effect because the bar was set too high).'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 21);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25 });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
    y = wrap(x, p[4], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'Why p = 0.05 is the Goldilocks compromise',
    'Lowering p from 0.05 to 0.01 reduces the risk of a Type I error (from 5% to 1%), but simultaneously increases the risk of a Type II error (missing a genuine psychological effect). Setting p ≤ 0.05 balances both risks for standard behavioural research.',
    { bodyY: 58 });
  return { file: 'psych-unit4-probability-errors.png' };
}

/* ---------- Page 9: Reading critical value tables & writing the statement ---------- */
function criticalValueGuide() {
  const [c, x] = make(W, 1086);
  title2(x, 'Reading critical value tables and writing the significance statement');
  sub2(x, 'Degrees of freedom, N values, tailedness and the four-part exam conclusion');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['Finding N or df in the table', BLUE,
      'Chi-squared: uses degrees of freedom df = (rows - 1) × (columns - 1). For a 2×2 contingency table, df = (2-1)×(2-1) = 1.',
      'Mann-Whitney U: uses N1 (sample size in condition A) and N2 (sample size in condition B) along the top and side margins.',
      'Wilcoxon T: uses N = number of non-zero difference pairs (omit any participant whose two scores were tied with a difference of 0). Spearman rs: uses N = number of participant pairs.'],
    ['Comparing observed vs critical', PURPLE,
      'Step 1: select the correct column for One-tailed (directional hypothesis) or Two-tailed (non-directional hypothesis) at p = 0.05.',
      'Step 2: locate the critical value at the intersection with N or df.',
      'Step 3: apply the R-rule—for Chi-squared and Spearman (contain "R"), observed ≥ critical is significant; for Mann-Whitney and Wilcoxon (no "R"), observed ≤ critical is significant.'],
    ['4-part exam statement', GREEN,
      '1. State whether the result is significant or not significant at p ≤ 0.05 for a one-tailed/two-tailed test.',
      '2. Quote the exact numbers: "because the observed value of [X] is greater/less than the critical value of [Y] at N/df = [Z]".',
      '3. State the hypothesis decision: "Therefore we reject (or retain) the null hypothesis and accept (or reject) the alternative hypothesis that [restate operationalised variables]".'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 20);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25 });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
    y = wrap(x, p[4], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'Watch out for tied ranks and zero differences',
    'When ranking scores for Spearman, Mann-Whitney or Wilcoxon, tied scores receive the mean of the ranks they would have occupied (e.g. two scores tied for ranks 3 and 4 both get rank 3.5, and the next score gets rank 5). In Wilcoxon, pairs with zero difference are dropped before looking up N.',
    { bodyY: 58 });
  return { file: 'psych-unit4-critical-values.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([inferentialDecisionMatrix, probabilityAndErrors, criticalValueGuide], only);
  console.log(JSON.stringify(done));
})();
module.exports = { inferentialDecisionMatrix, probabilityAndErrors, criticalValueGuide };