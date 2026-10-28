/*
 * WJEC A2 Psychology — Unit 4: Applied Research Methods
 * Lesson 12: Levels of Measurement and Inferential Statistical Tests
 * (15 pages), part 1 (pages 1-8).
 * Diagrams: /lesson-assets/wjec-a2-psychology/*.png (render-unit4-l12.cjs).
 * Exports {order,title,content}.
 */
module.exports = [

{ order: 1, title: "Why descriptive statistics are not enough: the role of inferential tests", content: `
<p>Suppose you run your experiment on language and music with 20 sixth-formers ($n_1 = 10$ in Silence, $n_2 = 10$ in Vocal Music) and find that the Silence group recalls a mean of $13.4\text{ words}$ while the Vocal Music group recalls a mean of $10.8\text{ words}$. You have a descriptive difference of $2.6\text{ words}$! Can you immediately celebrate and declare that your alternative hypothesis is supported?</p>
<p>Pause and think before reading on. What if those ten students randomly picked for the Silence group just happened by fluke of luck to have slightly better memories that morning?</p>
<p>That is why descriptive statistics alone can never reject a null hypothesis! To decide whether an observed difference or correlation in our sample reflects a genuine effect in the wider population—or merely random <strong>chance</strong>—psychologists use <strong>inferential statistical tests</strong>. In WJEC A2 Unit 4, you must master:</p>
<ol>
<li><strong>The four levels of measurement</strong> (Nominal, Ordinal, Interval and Ratio).</li>
<li><strong>Probability ($p \le 0.05$, $p \le 0.01$), critical value tables, and Type I versus Type II errors.</strong></li>
<li><strong>Choosing, justifying, calculating and interpreting the four WJEC non-parametric inferential tests:</strong>
  <ul>
  <li><strong>Chi-squared ($\chi^2$)</strong> (test of difference/association for nominal frequency counts in independent groups).</li>
  <li><strong>Sign test ($S$)</strong> (test of difference for nominal/categorical direction of change in repeated measures).</li>
  <li><strong>Mann–Whitney U test</strong> (test of difference for ordinal/interval data in independent groups).</li>
  <li><strong>Wilcoxon matched-pairs signed-ranks test ($T$)</strong> (test of difference for ordinal/interval data in repeated measures / matched pairs).</li>
  <li><strong>Spearman's rank correlation coefficient ($r_s$)</strong> (test of correlation for two ordinal/interval co-variables).</li>
  </ul>
</li>
</ol>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">What is the primary purpose of conducting an inferential statistical test in psychology?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. The mean and standard deviation are descriptive statistics calculated before running the inferential test."><span class="tutor-checkpoint-key">A</span><span>To find the middle score of a single group</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! An inferential test calculates the probability (p) that the observed difference or correlation occurred by chance alone, allowing us to decide whether to reject the null hypothesis and infer a genuine effect in the target population."><span class="tutor-checkpoint-key">B</span><span>To determine the probability that an observed difference or correlation occurred by chance, so we can decide whether to reject the null hypothesis</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Even a significant inferential test cannot fix a biased sampling method or unstandardized procedure."><span class="tutor-checkpoint-key">C</span><span>To eliminate all confounding variables from a poorly designed study</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Qualitative thematic analysis does not use inferential tests."><span class="tutor-checkpoint-key">D</span><span>To convert quantitative numbers into qualitative interview quotes</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 2, title: "The four levels of measurement: Nominal, Ordinal, Interval and Ratio", content: `
<p>Before you can choose an inferential test, you must identify the <strong>level of measurement</strong> of your dependent variable (or co-variables). Psychologist Stanley Smith Stevens (1946) classified data into four hierarchical levels, from simplest (Nominal) to most mathematically precise (Ratio).</p>
<h4>1. Nominal data (categorical frequency counts)</h4>
<ul>
<li><strong>What it is:</strong> Data consist of discrete, named <strong>categories</strong> (from the Latin <em>nomen</em> = name). Each participant falls into one mutually exclusive category, and we simply count how many participants (the <strong>frequency</strong>) fall into each box!</li>
<li><strong>Examples:</strong> Pass vs Fail on the Sally–Anne test; Secure (Type B) vs Avoidant (Type A) vs Resistant (Type C) attachment; Internal vs External attribution in post-match interviews; Yes vs No smoking abstinence.</li>
<li><strong>Mathematical rule:</strong> Categories have no intrinsic numerical order—you cannot calculate a mean of "Yes" and "No"! Only the <strong>Mode</strong>, percentages, and <strong>Chi-squared ($\chi^2$) / Sign test</strong> apply.</li>
</ul>
<h4>2. Ordinal data (ranked order or subjective rating scales, unequal intervals)</h4>
<ul>
<li><strong>What it is:</strong> Data that can be placed in <strong>rank order</strong> from lowest to highest (1st, 2nd, 3rd...) OR scores from subjective psychological rating scales/checklists (e.g. rating stress from 1 to 10, or scoring $0\text{–}40$ on an anger questionnaire).</li>
<li><strong>Why psychological rating scales are Ordinal (not Interval):</strong> The distance between a subjective stress rating of $2$ and $3$ is <em>not</em> guaranteed to be the exact same psychological gap as the distance between $8$ and $9$! Because the intervals between scale points are unequal or subjective, non-parametric tests (<strong>Mann–Whitney U, Wilcoxon $T$, Spearman $r_s$</strong>) convert scores into ranks ($1, 2, 3...$).</li>
</ul>
<h4>3. Interval data (equal calibrated physical units, arbitrary zero)</h4>
<ul>
<li><strong>What it is:</strong> Continuous numerical measurements along a scale with <strong>equal, objective physical units</strong> between every point, but where zero ($0$) is arbitrary rather than a total absence of the quantity (e.g. temperature in degrees Celsius $^{\circ}\text{C}$, where the gap between $10^{\circ}\text{C}$ and $20^{\circ}\text{C}$ equals the gap between $20^{\circ}\text{C}$ and $30^{\circ}\text{C}$, or standardized IQ scores).</li>
</ul>
<h4>4. Ratio data (equal calibrated physical units + true absolute zero)</h4>
<ul>
<li><strong>What it is:</strong> The highest level of measurement—equal physical units <em>plus</em> a <strong>true absolute zero ($0$)</strong> meaning zero quantity exists, so a score of $20$ is literally twice as much as $10$!</li>
<li><strong>Examples:</strong> Reaction time in milliseconds, task completion time in seconds, nightly sleep duration in minutes, cortisol concentration in nmol/L, or number of words recalled out of 20 ($0\text{ words} =$ zero recall). <em>Note for WJEC exams:</em> Both Interval and Ratio data can be converted into ranks and analysed using WJEC non-parametric tests (Mann–Whitney, Wilcoxon, Spearman)!</li>
</ul>
<h3>Practice</h3>
<p>Identify the level of measurement (Nominal, Ordinal, Interval or Ratio) for each of the following variables and briefly justify your answer: (a) Time in seconds taken to thread 25 beads; (b) Self-rated fear of spiders on a 1–7 Likert scale; (c) Whether a commuter helps or ignores a collapsed passenger in a subway carriage.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>(a) <strong>Ratio</strong> (or Interval/Ratio): seconds are continuous, objectively calibrated equal time units with a true absolute zero ($0\text{ s}$).<br>(b) <strong>Ordinal</strong>: a 1–7 subjective fear rating scale can be ordered from least fearful ($1$) to most fearful ($7$), but the subjective psychological interval between $1$ and $2$ is not necessarily equal to the interval between $6$ and $7$.<br>(c) <strong>Nominal</strong>: participants are classified into two discrete, mutually exclusive categories ("Helped" vs "Ignored") and tallied as frequencies.</p></div></details>` },

{ order: 3, title: "How to choose and justify the correct inferential test in 3 marks", content: `
<p>In almost every Unit 4 paper, a 3-mark question asks: <em>"Name and justify the most appropriate inferential statistical test for the data in this study."</em> Study the decision matrix on the left of the diagram below—it gives you all 3 marks every single time!</p>
<figure style="margin:1.4rem 0;text-align:center;"><img src="/lesson-assets/wjec-a2-psychology/psych-unit4-inferential-matrix.png" alt="Three-panel diagram of inferential test selection and probability: 3-criterion test decision matrix (Nominal/Ordinal × Independent/Repeated/Correlation), probability levels (p <= 0.05, 0.01) and Type I vs Type II errors, and the critical value direction rule ('R' rule)." style="width:100%;max-width:100%;border:1px solid #cbd5e1;border-radius:0.75rem;background:#fff;"><figcaption style="margin-top:0.5rem;font-size:0.9rem;color:#475569;text-align:left;">Inferential test decision table, probability &amp; Type I/II errors, and the critical-value direction rule. Diagram drawn for this course.</figcaption></figure>
<h4>The 3-Point Justification Recipe (1 mark per criterion = 3 marks)</h4>
<p>Whenever you justify an inferential test in Unit 4, state these <strong>three facts in context</strong>:</p>
<ol>
<li><strong>Criterion 1 — Test of Difference versus Test of Correlation (Association):</strong> Are we testing for a <em>difference</em> between experimental conditions or a <em>correlation/relationship</em> between two co-variables?</li>
<li><strong>Criterion 2 — Research Design (for tests of difference):</strong> Is it an <em>independent groups</em> design (separate participants in each condition) or a <em>repeated measures / matched pairs</em> design (related data from the same or matched participants)?</li>
<li><strong>Criterion 3 — Level of Measurement:</strong> Are the data <em>nominal</em> (categorical frequency counts) or at least <em>ordinal</em> (ranked/rating scales or continuous interval/ratio scores that can be ranked)?</li>
</ol>
<table style="width:100%;border-collapse:collapse;margin:1.1rem 0;font-size:0.92rem;">
<thead>
<tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
<th style="padding:0.55rem;text-align:left;border:1px solid #cbd5e1;">Level of Measurement</th>
<th style="padding:0.55rem;text-align:left;border:1px solid #cbd5e1;">Difference: Independent Groups</th>
<th style="padding:0.55rem;text-align:left;border:1px solid #cbd5e1;">Difference: Repeated Measures / Matched Pairs</th>
<th style="padding:0.55rem;text-align:left;border:1px solid #cbd5e1;">Correlation / Association</th>
</tr>
</thead>
<tbody>
<tr>
<td style="padding:0.55rem;border:1px solid #cbd5e1;font-weight:600;">Nominal (categorical frequencies)</td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Chi-squared ($\chi^2$) test</strong></td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Sign test ($S$)</strong></td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Chi-squared ($\chi^2$) test of association</strong></td>
</tr>
<tr>
<td style="padding:0.55rem;border:1px solid #cbd5e1;font-weight:600;">Ordinal (or Interval/Ratio converted to ranks)</td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Mann–Whitney U test</strong></td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Wilcoxon matched-pairs signed-ranks test ($T$)</strong></td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Spearman's rank correlation coefficient ($r_s$)</strong></td>
</tr>
<tr>
<td style="padding:0.55rem;border:1px solid #cbd5e1;font-weight:600;"><em>(Parametric Interval/Ratio equivalents for recognition)</em></td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><em>Unrelated (independent) $t$-test</em></td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><em>Related (paired) $t$-test</em></td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><em>Pearson's $r$</em></td>
</tr>
</tbody>
</table>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">A researcher tests 15 arachnophobic patients before and after a VR exposure therapy session, asking each patient to rate their fear of a live spider on a 1–20 scale at both times. Which inferential test should be used and why?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Mann-Whitney U is for an independent groups design (two separate groups of people); here the same 15 patients are tested before and after (repeated measures)."><span class="tutor-checkpoint-key">A</span><span>Mann–Whitney U test, because there are two conditions</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! (1) It tests for a difference between before and after therapy; (2) it uses a repeated measures design (the same 15 patients tested twice); and (3) the 1–20 fear ratings are ordinal data."><span class="tutor-checkpoint-key">B</span><span>Wilcoxon matched-pairs signed-ranks test (T), because it tests a difference in a repeated measures design with ordinal rating-scale data</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Spearman rs tests for a correlation between two co-variables, whereas this study tests for a difference before vs after therapy."><span class="tutor-checkpoint-key">C</span><span>Spearman's rank correlation coefficient (rs), because 1–20 is ordinal</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Chi-squared is for nominal categorical frequencies in independent groups."><span class="tutor-checkpoint-key">D</span><span>Chi-squared test, because there are 15 patients</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 4, title: "Probability (p-values), significance levels and Type I versus Type II errors", content: `
<p>What does a psychologist actually mean when they write <strong>"$p \le 0.05$, the result is statistically significant"</strong>? Let us unpack probability levels and the two statistical errors ($I$ and $II$) so you can explain them with pinpoint accuracy.</p>
<h4>1. Understanding $p \le 0.05$ (5%), $p \le 0.01$ (1%) and $p \le 0.001$ (0.1%)</h4>
<ul>
<li><strong>What $p$ stands for:</strong> $p$ is the <strong>probability that the observed difference or correlation occurred by random chance alone</strong> (if the null hypothesis $H_0$ were true).</li>
<li><strong>Why psychology sets the standard significance level ($\alpha$) at $p \le 0.05$ ($5\%$):</strong> Setting $p \le 0.05$ means there is a <strong>$5\%$ (or $1\text{ in }20$) or smaller probability</strong> that our results were a fluke of chance—in other words, we are at least $95\%$ confident the effect is real! Whenever $p \le 0.05$, we <strong>reject the null hypothesis ($H_0$)</strong> and accept the alternative hypothesis ($H_1$).</li>
<li><strong>When $p \gt 0.05$ (e.g. $p = 0.10$):</strong> The probability of chance is greater than $5\%$, so the result is <em>not statistically significant</em>; we must <strong>retain (accept) the null hypothesis ($H_0$)</strong>.</li>
<li><strong>When do psychologists use a stricter level like $p \le 0.01$ ($1\%$) or $p \le 0.001$ ($0.1\%$)?</strong> In medical drug trials (e.g. testing clozapine or beta blockers) where falsely claiming a dangerous drug works could harm patients, or when replicating a controversial finding!</li>
</ul>
<h4>2. Type I error (False Positive) versus Type II error (False Negative)</h4>
<p>Because $p \le 0.05$ still leaves a $1\text{ in }20$ ($5\%$) risk of a fluke, and $p \le 0.01$ is very strict to pass, two opposite statistical errors exist like a see-saw:</p>
<ol>
<li><strong>Type I error (False Positive / "Optimistic error"):</strong> We <strong>wrongly reject a true null hypothesis ($H_0$)</strong>—claiming we found a significant difference or correlation when in reality the result was just a random $1\text{-in-}20$ chance fluke!
  <ul>
  <li><em>When is a Type I error most likely?</em> When the significance level is set too <strong>leniently</strong> (e.g. $p \le 0.10$, a $10\%$ chance risk, or even at $p \le 0.05$ where there is a $5\%$ risk).</li>
  </ul>
</li>
<li><strong>Type II error (False Negative / "Pessimistic error"):</strong> We <strong>wrongly retain (accept) a false null hypothesis ($H_0$)</strong>—missing a genuine real-world effect and claiming "no significant difference" because our test was too strict or our sample was too small!
  <ul>
  <li><em>When is a Type II error most likely?</em> When the significance level is set too <strong>stringently</strong> (e.g. $p \le 0.01$ or $p \le 0.001$, where an observed statistic that easily beat the $0.05$ critical value fails to reach the harsh $0.01$ critical value!).</li>
  </ul>
</li>
</ol>
<p><strong>Why $p \le 0.05$ is the Goldilocks compromise:</strong> Psychologists choose $p \le 0.05$ because it strikes the optimal balance between the risk of a <strong>Type I error</strong> (if $p$ is too lenient like $0.10$) and the risk of a <strong>Type II error</strong> (if $p$ is too strict like $0.01$)!</p>
<h3>Practice</h3>
<p>A psychologist tests a directional hypothesis at $p \le 0.01$ (critical value $= 2.33$). Their observed statistic is significant at $p \le 0.05$ (critical value $= 1.64$), but fails to reach the $p \le 0.01$ threshold, so they retain the null hypothesis. Which statistical error might they have made, and why?</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>They risk making a <strong>Type II error (a false negative)</strong>—wrongly retaining a false null hypothesis ($H_0$) and missing a genuine effect that was significant at the standard $p \le 0.05$ level—because they set their significance threshold at the overly stringent $p \le 0.01$ ($1\%$) level.</p></div></details>` },

{ order: 5, title: "How to read critical value tables: the 'R' Rule", content: `
<p>In the Unit 4 exam, you are always given an extract from the statistical <strong>critical value table</strong>, and you have to compare your <strong>observed (calculated) value</strong> against the <strong>critical value</strong> in the table to decide whether your result is significant. Students often panic: <em>"Wait—for this test, does my observed value need to be GREATER than the critical value or LESS than the critical value?!"</em></p>
<h4>The Golden "R" Rule for Critical Value Tables</h4>
<p>Memorise this single rule and you will never get a critical-value comparison wrong again:</p>
<div style="border-left:4px solid #15803d;background:#f0fdf4;padding:0.8rem 1rem;margin:1.2rem 0;border-radius:0.4rem;">
<p style="margin:0 0 0.4rem;"><strong>1. Tests with the letter 'R' in their name — Spea<u>r</u>man's $r_s$ and Chi-squa<u>r</u>ed ($\chi^2$) (plus Parametric $t$-tests):</strong><br>
To be significant, your <strong>$\text{Observed value} \ge \text{Critical value}$</strong> (Observed must be <strong>GREATER than or equal to</strong> the critical value! For Spearman $r_s$, ignore any minus sign and compare the absolute value $|r_s|$).</p>
<p style="margin:0;"><strong>2. Non-parametric tests WITHOUT the letter 'R' in their name — Mann–Whitney $U$, Wilcoxon $T$, and Sign test $S$:</strong><br>
To be significant, your <strong>$\text{Observed value} \le \text{Critical value}$</strong> (Observed must be <strong>LESS than or equal to</strong> the critical value!).</p>
</div>
<h4>Three steps to find the right cell in any Critical Value Table</h4>
<ol>
<li><strong>Check whether the hypothesis is Directional (One-tailed) or Non-directional (Two-tailed):</strong> Pick the matching column header ($p \le 0.05$ one-tailed vs $p \le 0.05$ two-tailed).</li>
<li><strong>Find the correct row ($N$, $n_1/n_2$, or Degrees of Freedom $df$):</strong>
  <ul>
  <li>For <strong>Spearman $r_s$</strong>: use $N =$ total number of participant pairs.</li>
  <li>For <strong>Wilcoxon $T$ / Sign test $S$</strong>: use $N =$ number of participants after excluding any tied pairs ($d = 0$).</li>
  <li>For <strong>Mann–Whitney $U$</strong>: intersect column $n_1$ (sample size of Group 1) with row $n_2$ (sample size of Group 2).</li>
  <li>For <strong>Chi-squared ($\chi^2$)</strong>: calculate <strong>Degrees of Freedom</strong> $df = (\text{Number of rows} - 1) \times (\text{Number of columns} - 1)$. In a $2 \times 2$ table, $df = (2 - 1) \times (2 - 1) = \mathbf{1}$.</li>
  </ul>
</li>
<li><strong>Write your 4-mark significance statement using all four ingredients:</strong> (1) Compare Observed vs Critical value ($\ge$ or $\le$), (2) State whether the result is statistically significant at $p \le 0.05$ (one/two-tailed, quoting $N$ or $df$), (3) Explicitly state whether you <strong>reject or retain the null hypothesis ($H_0$)</strong>, and (4) State the conclusion in the context of the study variables!</li>
</ol>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">A psychologist conducts a Wilcoxon signed-ranks test (T) on 12 participants with a directional hypothesis at p <= 0.05. The observed value is T = 11, and the critical value from the table (one-tailed, N = 12, p <= 0.05) is 17. Is the result significant, and why?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Wilcoxon has no 'R' in its name, so the observed value T must be LESS than or equal to the critical value to be significant!"><span class="tutor-checkpoint-key">A</span><span>No, because the observed T (11) is smaller than the critical value (17)</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! For Wilcoxon T (no 'R' in its name), a result is significant when the observed T is LESS than or equal to the critical value. Since 11 <= 17, the difference is statistically significant at p <= 0.05 (one-tailed) and we reject the null hypothesis!"><span class="tutor-checkpoint-key">B</span><span>Yes, because for Wilcoxon T the observed value (11) is less than or equal to the critical value (17), so we reject the null hypothesis</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Even when significant, we reject the null hypothesis rather than retaining it."><span class="tutor-checkpoint-key">C</span><span>Yes, so we retain the null hypothesis</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. For Wilcoxon, smaller T values indicate a stronger consistent difference between conditions."><span class="tutor-checkpoint-key">D</span><span>It is impossible to tell without knowing the mean</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 6, title: "Worked calculation 1: Chi-squared (χ²) test of difference/association", content: `
<p>In Unit 4, you can be asked to complete a <strong>Chi-squared ($\chi^2$)</strong> calculation table from nominal frequency counts (such as our 2027 Content Analysis of post-match interviews!). Study the left panel of the diagram below, then follow every step of the worked calculation.</p>
<figure style="margin:1.4rem 0;text-align:center;"><img src="/lesson-assets/wjec-a2-psychology/psych-unit4-probability-errors.png" alt="Two-panel worked calculation diagram for Chi-squared test (contingency table, expected frequencies, sum of (O-E)^2/E = 5.00 vs critical value 3.84) and Mann-Whitney U test (ranking combined groups, R1, R2, U1, U2)." style="width:100%;max-width:100%;border:1px solid #cbd5e1;border-radius:0.75rem;background:#fff;"><figcaption style="margin-top:0.5rem;font-size:0.9rem;color:#475569;text-align:left;">Worked step-by-step calculations for the Chi-squared ($\chi^2$) test and the Mann–Whitney U test. Diagram drawn for this course.</figcaption></figure>
<h4>Step-by-step worked example of Chi-squared ($\chi^2$)</h4>
<p><strong>Scenario:</strong> A psychologist conducted a content analysis of $N = 40$ post-match football interviews ($20$ after a Win, $20$ after a Loss) and classified each manager main attribution as either <em>Internal</em> (own skill/effort) or <em>External</em> (referee/luck). Directional hypothesis ($H_1$) tested at $p \le 0.05$ (one-tailed).</p>
<ul>
<li><strong>Observed frequencies ($O$):</strong>
  <ul>
  <li>Cell A (Win + Internal): $O_A = 15$ &nbsp;|&nbsp; Cell B (Win + External): $O_B = 5$ &nbsp;($\text{Row 1 Total} = 20$)</li>
  <li>Cell C (Loss + Internal): $O_C = 7$ &nbsp;|&nbsp; Cell D (Loss + External): $O_D = 13$ &nbsp;($\text{Row 2 Total} = 20$)</li>
  <li>$\text{Col 1 Total (Internal)} = 15 + 7 = 22$ &nbsp;|&nbsp; $\text{Col 2 Total (External)} = 5 + 13 = 18$ &nbsp;|&nbsp; $\text{Grand Total } N = 40$.</li>
  </ul>
</li>
<li><strong>Step 1 — Calculate Expected Frequencies ($E = \frac{\text{Row Total} \times \text{Column Total}}{\text{Grand Total}}$):</strong>
  <ul>
  <li>$E_A (\text{Win, Internal}) = \frac{20 \times 22}{40} = \frac{440}{40} = \mathbf{11.0}$</li>
  <li>$E_B (\text{Win, External}) = \frac{20 \times 18}{40} = \frac{360}{40} = \mathbf{9.0}$</li>
  <li>$E_C (\text{Loss, Internal}) = \frac{20 \times 22}{40} = \mathbf{11.0}$</li>
  <li>$E_D (\text{Loss, External}) = \frac{20 \times 18}{40} = \mathbf{9.0}$ &nbsp;<em>(Check: $\sum E = 11 + 9 + 11 + 9 = 40 = \sum O$!)</em></li>
  </ul>
</li>
<li><strong>Step 2 — Calculate $\frac{(O - E)^2}{E}$ for each of the four cells and sum them ($\chi^2 = \sum \frac{(O - E)^2}{E}$):</strong>
  <ul>
  <li>Cell A: $O - E = 15 - 11 = +4 \implies (O - E)^2 = 16 \implies \frac{16}{11} = \mathbf{1.455}$</li>
  <li>Cell B: $O - E = 5 - 9 = -4 \implies (O - E)^2 = 16 \implies \frac{16}{9} = \mathbf{1.778}$</li>
  <li>Cell C: $O - E = 7 - 11 = -4 \implies (O - E)^2 = 16 \implies \frac{16}{11} = \mathbf{1.455}$</li>
  <li>Cell D: $O - E = 13 - 9 = +4 \implies (O - E)^2 = 16 \implies \frac{16}{9} = \mathbf{1.778}$</li>
  <li><strong>Observed $\chi^2$:</strong> $1.455 + 1.778 + 1.455 + 1.778 = \mathbf{6.47\text{ (to 2 d.p.)}}$.</li>
  </ul>
</li>
<li><strong>Step 3 — Compare with the Critical Value ($df = (2-1)(2-1) = 1$):</strong>
  For $df = 1$ at $p \le 0.05$ (one-tailed), the critical value is $2.71$ (and for two-tailed $p \le 0.05$ it is $3.84$). Because Chi-squa<u>r</u>ed has an 'R' in its name, we need $\text{Observed } \chi^2 \ge \text{Critical value}$. Since $6.47 \ge 2.71$, the result is <strong>statistically significant at $p \le 0.05$</strong>; we <strong>reject $H_0$</strong> and conclude that winning managers make significantly more internal attributions than losing managers!</li>
</ul>
<h3>Practice</h3>
<p>In a $2 \times 3$ contingency table (2 rows by 3 columns) with a Grand Total of $N = 60$, Row 1 has total $= 30$ and Column 2 has total $= 18$. Calculate (a) the Expected frequency ($E$) for the cell in Row 1, Column 2, and (b) the Degrees of Freedom ($df$) for the table.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>(a) $E = \frac{\text{Row Total} \times \text{Column Total}}{\text{Grand Total}} = \frac{30 \times 18}{60} = \frac{540}{60} = \mathbf{9.0}$.<br>(b) $df = (\text{Rows} - 1) \times (\text{Columns} - 1) = (2 - 1) \times (3 - 1) = 1 \times 2 = \mathbf{2}$.</p></div></details>` },

{ order: 7, title: "Worked calculation 2: Mann–Whitney U test (independent groups, ordinal data)", content: `
<p>Now let us walk through the step-by-step calculation of the <strong>Mann–Whitney U test</strong> (shown in the right-hand panel of the diagram on Page 6), used when testing a difference between two <strong>independent groups</strong> with <strong>ordinal (or interval/ratio) data</strong>.</p>
<h4>Step-by-step worked example of Mann–Whitney $U$</h4>
<p><strong>Scenario:</strong> In a mini-pilot of the <em>language and music</em> experiment ($n_1 = 5$ in Vocal Music, $n_2 = 5$ in Silence), the number of words recalled out of 20 were:<br>
• <strong>Group 1 (Vocal Music, $n_1 = 5$):</strong> $6, 8, 9, 11, 12$<br>
• <strong>Group 2 (Silence, $n_2 = 5$):</strong> $10, 13, 15, 16, 18$</p>
<ol>
<li><strong>Step 1 — Rank all $N = n_1 + n_2 = 10$ scores together as ONE combined group</strong> from lowest ($6 = \text{Rank } 1$) to highest ($18 = \text{Rank } 10$):
  <ul>
  <li>Scores in ascending order: $6\text{ (M)}, 8\text{ (M)}, 9\text{ (M)}, 10\text{ (S)}, 11\text{ (M)}, 12\text{ (M)}, 13\text{ (S)}, 15\text{ (S)}, 16\text{ (S)}, 18\text{ (S)}$</li>
  <li>Assigned ranks ($1\text{ to }10$):
    <ul>
    <li><strong>Group 1 (Vocal Music) ranks:</strong> $6 \rightarrow \text{Rank } 1;\; 8 \rightarrow \text{Rank } 2;\; 9 \rightarrow \text{Rank } 3;\; 11 \rightarrow \text{Rank } 5;\; 12 \rightarrow \text{Rank } 6$.<br>
    Sum of ranks for Group 1: $R_1 = 1 + 2 + 3 + 5 + 6 = \mathbf{17}$.</li>
    <li><strong>Group 2 (Silence) ranks:</strong> $10 \rightarrow \text{Rank } 4;\; 13 \rightarrow \text{Rank } 7;\; 15 \rightarrow \text{Rank } 8;\; 16 \rightarrow \text{Rank } 9;\; 18 \rightarrow \text{Rank } 10$.<br>
    Sum of ranks for Group 2: $R_2 = 4 + 7 + 8 + 9 + 10 = \mathbf{38}$.</li>
    </ul>
  </li>
  <li><em>How to handle tied scores:</em> If two scores are tied for 3rd and 4th place, give both the average rank $\frac{3 + 4}{2} = 3.5$, and the next score gets Rank $5$!</li>
  </ul>
</li>
<li><strong>Step 2 — Substitute into the Mann–Whitney formulas for $U_1$ and $U_2$:</strong>
$$U_1 = n_1 n_2 + \frac{n_1(n_1 + 1)}{2} - R_1 = (5 \times 5) + \frac{5(6)}{2} - 17 = 25 + 15 - 17 = \mathbf{23}$$
$$U_2 = n_1 n_2 + \frac{n_2(n_2 + 1)}{2} - R_2 = (5 \times 5) + \frac{5(6)}{2} - 38 = 25 + 15 - 38 = \mathbf{2}$$
<em>(Quick check: $U_1 + U_2$ must always equal $n_1 \times n_2 = 25$. Here $23 + 2 = 25$!)</em></li>
<li><strong>Step 3 — Select the SMALLER value as the observed $U$ and compare with the Critical Value:</strong>
  The observed test statistic is $U = \min(U_1, U_2) = \mathbf{2}$. For $n_1 = 5, n_2 = 5$ at $p \le 0.05$ (one-tailed), the critical value is $\mathbf{4}$. Because Mann–Whitney has no 'R' in its name, we need $\text{Observed } U \le \text{Critical value}$. Since $2 \le 4$, the difference is <strong>statistically significant at $p \le 0.05$ (one-tailed)</strong>, so we <strong>reject $H_0$</strong>!</li>
</ol>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">When ranking scores in a Mann–Whitney U test, suppose the four lowest scores across both groups are 10, 12, 12, 15. What ranks should be assigned to these four scores?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Tied scores must always receive the exact same average rank so neither group is biased."><span class="tutor-checkpoint-key">A</span><span>1, 2, 3, 4</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! 10 is 1st (Rank 1). The two 12s share positions 2 and 3, so both receive the mean rank (2 + 3)/2 = 2.5. Position 4 is then given to 15 (Rank 4)."><span class="tutor-checkpoint-key">B</span><span>1, 2.5, 2.5, 4</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Because two scores occupied positions 2 and 3, the next score (15) is in 4th position (Rank 4), not Rank 3!"><span class="tutor-checkpoint-key">C</span><span>1, 2, 2, 3</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. We never discard raw scores in Mann-Whitney; tied scores are given the mean of the rank positions they share."><span class="tutor-checkpoint-key">D</span><span>Discard both 12s from the study</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 8, title: "Worked calculation 3: Wilcoxon matched-pairs signed-ranks test (T) and Sign test (S)", content: `
<p>What if your experiment used a <strong>repeated measures</strong> or <strong>matched pairs</strong> design with ordinal/interval data? Then you use the <strong>Wilcoxon matched-pairs signed-ranks test ($T$)</strong> (or, for nominal direction of change only, the <strong>Sign test $S$</strong>). Study the left panel of the diagram below and follow the worked steps.</p>
<figure style="margin:1.4rem 0;text-align:center;"><img src="/lesson-assets/wjec-a2-psychology/psych-unit4-critical-values.png" alt="Two-panel worked calculation diagram for Wilcoxon matched-pairs signed-ranks test T (differences d, ranking |d| ignoring zero differences, summing less frequent sign T = 1.5) and Spearman's rank correlation coefficient rs (ranking X and Y, d^2, formula rs = +0.89)." style="width:100%;max-width:100%;border:1px solid #cbd5e1;border-radius:0.75rem;background:#fff;"><figcaption style="margin-top:0.5rem;font-size:0.9rem;color:#475569;text-align:left;">Worked step-by-step calculations for the Wilcoxon signed-ranks test ($T$) and Spearman's rank correlation coefficient ($r_s$). Diagram drawn for this course.</figcaption></figure>
<h4>Step-by-step worked example of Wilcoxon Signed-Ranks ($T$)</h4>
<p><strong>Scenario:</strong> Eight participants completed a bead-threading task Alone vs in front of an Audience (repeated measures, counterbalanced). Their completion times (seconds) were:</p>
<table style="width:100%;border-collapse:collapse;margin:0.8rem 0;font-size:0.9rem;">
<thead>
<tr style="background:#f1f5f9;"><th style="padding:0.4rem;border:1px solid #cbd5e1;">Participant</th><th style="padding:0.4rem;border:1px solid #cbd5e1;">Alone (s)</th><th style="padding:0.4rem;border:1px solid #cbd5e1;">Audience (s)</th><th style="padding:0.4rem;border:1px solid #cbd5e1;">Difference $d$</th><th style="padding:0.4rem;border:1px solid #cbd5e1;">Rank of $|d|$</th><th style="padding:0.4rem;border:1px solid #cbd5e1;">Signed Rank</th></tr>
</thead>
<tbody>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">P1</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">48</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">40</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+8$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$5$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+5$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">P2</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">42</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">44</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$-2$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$1.5$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$-1.5$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">P3</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">50</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">38</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+12$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$7$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+7$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">P4</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">45</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">45</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$0\text{ (omit!)}$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">—</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">—</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">P5</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">46</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">44</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+2$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$1.5$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+1.5$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">P6</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">52</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">42</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+10$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$6$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+6$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">P7</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">44</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">39</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+5$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$3$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+3$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">P8</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">47</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">40</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+7$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$4$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+4$</td></tr>
</tbody>
</table>
<ol>
<li><strong>Step 1 — Calculate each pair difference ($d = \text{Alone} - \text{Audience}$), keeping the $+$ or $-$ sign.</strong></li>
<li><strong>Step 2 — Omit any zero differences ($d = 0$) and reduce $N$ accordingly!</strong> Here P4 had $d = 0$, so P4 is excluded and our effective sample size drops from $8$ to $\mathbf{N = 7}$.</li>
<li><strong>Step 3 — Rank the absolute differences $|d|$ from smallest ($1$) to largest ($7$) ignoring the $+$ or $-$ sign:</strong> The two differences of $|-2|$ and $|+2|$ share positions 1 and 2 (each gets Rank $1.5$), $|+5| \rightarrow 3$, $|+7| \rightarrow 4$, $|+8| \rightarrow 5$, $|+10| \rightarrow 6$, $|+12| \rightarrow 7$.</li>
<li><strong>Step 4 — Re-attach the $+$ and $-$ signs to the ranks, sum the positive ranks ($\sum R_+ = 5 + 7 + 1.5 + 6 + 3 + 4 = 26.5$) and negative ranks ($\sum R_- = 1.5$), and pick the SMALLER sum as $T$:</strong>
$$\text{Observed } T = \mathbf{1.5}$$
For $N = 7$ at $p \le 0.05$ (one-tailed), the critical value is $\mathbf{3}$. Since $1.5 \le 3$, the result is <strong>statistically significant</strong>! <em>(Note: for the Sign test $S$, you simply count how many $+$ signs vs $-$ signs occurred—here $6$ pluses and $1$ minus, so $S = \mathbf{1}$.)</em></li>
</ol>
<h3>Practice</h3>
<p>In a Wilcoxon test on 10 participants, two participants have a difference score of $d = 0$. The remaining 8 participants have positive rank sum $\sum R_+ = 31$ and negative rank sum $\sum R_- = 5$. State (a) the value of $N$ you must look up in the critical value table, and (b) the observed value of $T$.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>(a) Because the two participants with $d = 0$ (zero difference) must be excluded before ranking, you look up $\mathbf{N = 10 - 2 = 8}$ in the critical value table.<br>(b) The observed statistic $T$ is always the smaller of the two rank sums ($\sum R_+$ vs $\sum R_-$), so $\mathbf{T = 5}$.</p></div></details>` },

];