/*
 * WJEC A2 Psychology — Unit 4: Applied Research Methods
 * Lesson 12: Levels of Measurement, Inferential Tests and Critical Values
 * (15 pages), part 1 (pages 1-8).
 * Diagrams: /lesson-assets/wjec-a2-psychology/*.png (render-unit4-l12.cjs).
 * Exports {order,title,content}.
 */
module.exports = [

{ order: 1, title: "Why descriptive statistics are not enough: the role of inferential tests", content: `
<p>Suppose you run your experiment on language and music with $24$ participants: the Silence group recalls a mean of $14.2$ words and the Music group recalls a mean of $9.8$ words. Can you immediately declare that background music impairs memory? Not yet! What if that $4.4$-word gap happened by pure luck of the draw (random sampling variation) when you pulled names out of a hat?</p>
<p>To find out whether an observed difference or correlation is genuine or merely a fluke of chance, we use <strong>inferential statistical tests</strong>. An inferential test calculates a test statistic from your sample data and compares it against a <strong>critical value table</strong> to determine the probability ($p$) that your results would occur if the <strong>null hypothesis ($H_0$)</strong> were true.</p>
<p>In WJEC A2 Unit 4, you must master four interconnected skills across Lesson 12:</p>
<ol>
<li><strong>Levels of measurement (Page 2):</strong> distinguishing <em>Nominal</em>, <em>Ordinal</em>, <em>Interval</em> and <em>Ratio</em> data.</li>
<li><strong>TheInferential Test Decision Matrix (Page 3):</strong> choosing and justifying the exact right test from the five non-parametric tests on the WJEC specification—<strong>Chi-squared ($\chi^2$)</strong>, <strong>Sign test ($S$)</strong>, <strong>Mann–Whitney $U$</strong>, <strong>Wilcoxon matched-pairs signed-ranks ($T$)</strong>, and <strong>Spearman's rank correlation coefficient ($r_s$)</strong>.</li>
<li><strong>Step-by-step worked calculations (Pages 4–8):</strong> calculating and checking every test on the specification.</li>
<li><strong>Critical values, $p$-levels and Type I / Type II errors (Pages 9–12):</strong> reading critical value tables without ever confusing the "$\le$" tests ($U, T, S$) with the "$\ge$" tests ($\chi^2, r_s$) and explaining false positives vs false negatives.</li>
</ol>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">What is the primary purpose of carrying out an inferential statistical test in psychology?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Summarising sample averages and spread is the job of descriptive statistics (Mean, Median, SD, Range)."><span class="tutor-checkpoint-key">A</span><span>To calculate the average score of a single group</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! Inferential tests determine whether an observed difference or correlation in sample data is statistically significant (allowing us to reject the null hypothesis $H_0$ at $p \le 0.05$) or likely due to chance."><span class="tutor-checkpoint-key">B</span><span>To determine the probability that an observed difference or correlation occurred by chance, deciding whether to reject the null hypothesis ($H_0$)</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Even a statistically significant correlation cannot prove causation if no IV was manipulated."><span class="tutor-checkpoint-key">C</span><span>To turn a correlational study into a laboratory experiment</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Ethics committees review participant welfare, not inferential test statistics."><span class="tutor-checkpoint-key">D</span><span>To replace the need for informed consent</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 2, title: "Levels of measurement: Nominal, Ordinal, Interval and Ratio", content: `
<p>Every inferential test choice in Unit 4 starts with identifying the <strong>level of measurement</strong> of your dependent variable (or co-variables). Stanley Stevens (1946) classified data into four hierarchical levels, which WJEC groups into three working tiers (Nominal, Ordinal, and Interval/Ratio):</p>
<h4>1. Nominal data (categorical frequency counts)</h4>
<ul>
<li><strong>Definition:</strong> Data exist as <strong>named, discrete, mutually exclusive categories</strong>. Each participant or item falls into ONE category only, and we count the <em>frequency</em> (how many participants fall into each box). Categories have no numerical value or rank order.</li>
<li><strong>Psychological examples:</strong> Attachment type (Secure Type B vs Insecure-Avoidant Type A vs Insecure-Resistant Type C); smoking status (Smoker vs Non-smoker); attribution type in post-match interviews (Internal vs External); Pass vs Fail on the Sally–Anne test.</li>
</ul>
<h4>2. Ordinal data (ranked scores or subjective rating scales)</h4>
<ul>
<li><strong>Definition:</strong> Data can be placed in <strong>rank order from lowest to highest</strong> ($1\text{st}, 2\text{nd}, 3\text{rd}\dots$), but the <em>intervals between adjacent points on the scale are not necessarily equal or objective</em>, and there is no true physical unit.</li>
<li><strong>Psychological examples:</strong> Subjective Likert or rating scales (e.g. rating stage-fright anxiety from $1 = \text{not anxious}$ to $10 = \text{extremely anxious}$: we know a rating of $8$ is more anxious than $6$, but we cannot claim the psychological gap between $8$ and $6$ is identical to the gap between $4$ and $2$!); class rank positions; or any composite psychological questionnaire score (e.g. Beck Depression Inventory score, Holmes and Rahe LCU score, or words recalled out of 20 when treated conservatively in non-parametric tests).</li>
</ul>
<h4>3. Interval and Ratio data (continuous objective physical scales)</h4>
<ul>
<li><strong>Interval data:</strong> Measured along a continuous scale with <strong>equal, standardised physical units</strong> between every point, but with an <em>arbitrary zero point</em> (e.g. temperature in degrees Celsius $^{\circ}\text{C}$ or Fahrenheit, calendar year, or standardised IQ scores).</li>
<li><strong>Ratio data:</strong> Equal, standardised physical units <em>plus</em> a <strong>true, absolute zero</strong> (where $0$ means complete absence of the quantity, so $20\text{ seconds}$ is literally twice as long as $10\text{ seconds}$)—for example, reaction time in milliseconds, sleep duration in minutes, heart rate in bpm, or hormone concentration in $\text{nmol/L}$.</li>
<li><strong>Crucial WJEC rule:</strong> Any data measured at the <strong>Interval or Ratio</strong> level can automatically be ranked and analysed using <strong>Ordinal</strong> non-parametric tests (Mann–Whitney $U$, Wilcoxon $T$, Spearman $r_s$)!</li>
</ul>
<h3>Practice</h3>
<p>Identify the level of measurement (Nominal, Ordinal, or Interval/Ratio) for each of the following variables and justify your answer:<br>
(a) Whether commuters stopped to help a collapsed pedestrian (Helped vs Did Not Help).<br>
(b) Participants self-rated happiness on a scale from $1$ (very unhappy) to $7$ (very happy).<br>
(c) Time taken in seconds to thread 25 beads onto a string.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>(a) <strong>Nominal:</strong> "Helped" and "Did Not Help" are discrete, mutually exclusive named categories where each commuter is counted once as a frequency tally with no numerical scale.<br>(b) <strong>Ordinal:</strong> A 1-to-7 self-report happiness rating scale puts participants in rank order from least happy to happiest, but the subjective psychological distance between a rating of $2$ and $3$ is not objectively equal to the distance between $6$ and $7$.<br>(c) <strong>Interval/Ratio (specifically Ratio, which is at least Ordinal for non-parametric testing):</strong> Time in seconds is measured in objective, equal physical units with a true absolute zero ($0\text{ seconds}$), and can be ranked for Mann–Whitney $U$, Wilcoxon $T$ or Spearman $r_s$.</p></div></details>` },

{ order: 3, title: "The Inferential Test Decision Matrix: choosing and justifying your test", content: `
<p>In almost every Unit 4 paper, a 3-mark question asks: <em>"Name and justify the inferential statistical test that should be used to analyse these data." [3]</em> Study the complete decision matrix diagram below—memorising this $3 \times 2$ grid guarantees you 3 out of 3 marks every time.</p>
<figure style="margin:1.4rem 0;text-align:center;"><img src="/lesson-assets/wjec-a2-psychology/psych-unit4-test-selection.png" alt="Diagram of the WJEC Unit 4 Inferential Test Decision Matrix across Nominal and Ordinal/Interval/Ratio levels of measurement for Independent Groups, Repeated Measures/Matched Pairs, and Correlations, plus the 3-step justification rule." style="width:100%;max-width:100%;border:1px solid #cbd5e1;border-radius:0.75rem;background:#fff;"><figcaption style="margin-top:0.5rem;font-size:0.9rem;color:#475569;text-align:left;">The WJEC Unit 4 Inferential Test Decision Matrix. Notice the three justification criteria required for full marks. Diagram drawn for this course.</figcaption></figure>
<h4>The WJEC Non-Parametric Inferential Test Grid</h4>
<table style="width:100%;border-collapse:collapse;margin:1rem 0;font-size:0.95rem;">
<thead>
<tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
<th style="padding:0.6rem;text-align:left;border:1px solid #cbd5e1;">Research Design / Aim</th>
<th style="padding:0.6rem;text-align:left;border:1px solid #cbd5e1;">Nominal Data (Category frequencies)</th>
<th style="padding:0.6rem;text-align:left;border:1px solid #cbd5e1;">Ordinal, Interval or Ratio Data (Scores / Ranks)</th>
</tr>
</thead>
<tbody>
<tr>
<td style="padding:0.6rem;border:1px solid #cbd5e1;font-weight:600;">Test of Difference:<br>Independent Groups Design</td>
<td style="padding:0.6rem;border:1px solid #cbd5e1;"><strong>Chi-squared ($\chi^2$) test</strong><br><em>(Note: $\chi^2$ also tests association between two nominal variables in a contingency table!)</em></td>
<td style="padding:0.6rem;border:1px solid #cbd5e1;"><strong>Mann–Whitney $U$ test</strong></td>
</tr>
<tr>
<td style="padding:0.6rem;border:1px solid #cbd5e1;font-weight:600;">Test of Difference:<br>Repeated Measures or Matched Pairs</td>
<td style="padding:0.6rem;border:1px solid #cbd5e1;"><strong>Sign test ($S$)</strong><br><em>(Direction of change $+$ or $-$ for each pair)</em></td>
<td style="padding:0.6rem;border:1px solid #cbd5e1;"><strong>Wilcoxon matched-pairs signed-ranks test ($T$)</strong></td>
</tr>
<tr>
<td style="padding:0.6rem;border:1px solid #cbd5e1;font-weight:600;">Test of Correlation / Association:<br>Two continuous co-variables</td>
<td style="padding:0.6rem;border:1px solid #cbd5e1;"><em>(Use $\chi^2$ test of association if both variables are discrete nominal categories)</em></td>
<td style="padding:0.6rem;border:1px solid #cbd5e1;"><strong>Spearman's rank correlation coefficient ($r_s$)</strong></td>
</tr>
</tbody>
</table>
<h4>How to earn all 3 marks when justifying your chosen test</h4>
<p>Never just name the test! Always write three numbered sentences:</p>
<ol>
<li><strong>Criterion 1 (Difference vs Correlation/Association):</strong> State whether the study is testing for a <em>difference</em> between two conditions or a <em>correlation/association</em> between two co-variables.</li>
<li><strong>Criterion 2 (Experimental Design):</strong> If testing a difference, state whether the design is <em>independent groups</em> or <em>repeated measures / matched pairs</em> (in context).</li>
<li><strong>Criterion 3 (Level of Measurement in context):</strong> State whether the data are <em>nominal</em> or <em>at least ordinal (ordinal/interval/ratio)</em> and explain why by naming the actual DV from the scenario!</li>
</ol>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">A researcher tests 15 patients before and after a course of CBTp using a 1-to-50 delusion-distress rating scale. Which inferential test should be used, and why?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Mann-Whitney U is for an independent groups design (two separate groups of patients); here the same 15 patients are tested before and after CBTp (repeated measures)."><span class="tutor-checkpoint-key">A</span><span>Mann–Whitney U test, because there are two conditions</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! It is a test of difference (before vs after CBTp), using a repeated measures design (the same 15 patients tested twice), with ordinal rating-scale data (1-50 delusion distress scores)—which selects the Wilcoxon matched-pairs signed-ranks test (T)."><span class="tutor-checkpoint-key">B</span><span>Wilcoxon matched-pairs signed-ranks test (T), because it tests a difference in a repeated measures design with ordinal rating-scale data</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Spearman rank tests for a correlation between two co-variables, whereas this experiment tests for a difference before and after therapy."><span class="tutor-checkpoint-key">C</span><span>Spearman's rank correlation coefficient (rs), because 15 is a small sample</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Chi-squared requires independent groups and nominal frequency counts, not repeated measures rating scores."><span class="tutor-checkpoint-key">D</span><span>Chi-squared test, because CBTp is a categorical therapy</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 4, title: "Worked inferential test 1: the Sign test (S)", content: `
<p>Let us start our worked inferential calculations with the quickest test on the specification: the <strong>Sign test ($S$)</strong>. The Sign test is used for a <strong>repeated measures or matched pairs design</strong> when data are <strong>nominal</strong> (or when ordinal/interval paired scores are simplified into the direction of change: improved $+$ vs worsened $-$).</p>
<h4>Step-by-step recipe for calculating the Sign test ($S$)</h4>
<div style="border-left:4px solid #1d4ed8;background:#eff6ff;padding:0.8rem 1rem;margin:1.2rem 0;border-radius:0.4rem;">
<p style="margin:0;"><strong>Worked scenario ($N = 10$ arachnophobia patients):</strong> Ten spider-phobic patients rated their fear (out of 20) before and after a single session of virtual-reality exposure. Calculate the Sign test statistic $S$ and determine whether the reduction in fear is significant at $p \le 0.05$ (one-tailed).</p>
</div>
<table style="width:100%;border-collapse:collapse;margin:0.8rem 0;font-size:0.9rem;">
<thead><tr style="background:#f1f5f9;"><th style="padding:0.45rem;border:1px solid #cbd5e1;">Patient</th><th style="padding:0.45rem;border:1px solid #cbd5e1;">Fear Before</th><th style="padding:0.45rem;border:1px solid #cbd5e1;">Fear After</th><th style="padding:0.45rem;border:1px solid #cbd5e1;">Difference ($\text{Before} - \text{After}$)</th><th style="padding:0.45rem;border:1px solid #cbd5e1;">Sign ($+$ or $-$)</th></tr></thead>
<tbody>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">1</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">18</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">11</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+7$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;font-weight:700;color:#15803d;">$+$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">2</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">15</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">9</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+6$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;font-weight:700;color:#15803d;">$+$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">3</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">14</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">14</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$0$ (tie)</td><td style="padding:0.4rem;border:1px solid #cbd5e1;color:#64748b;">Omit ($0$)</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">4</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">19</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">12</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+7$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;font-weight:700;color:#15803d;">$+$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">5</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">12</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">14</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$-2$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;font-weight:700;color:#dc2626;">$-$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">6</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">17</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">8</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+9$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;font-weight:700;color:#15803d;">$+$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">7</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">16</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">10</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+6$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;font-weight:700;color:#15803d;">$+$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">8</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">20</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">13</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+7$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;font-weight:700;color:#15803d;">$+$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">9</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">13</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">7</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+6$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;font-weight:700;color:#15803d;">$+$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">10</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">15</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">6</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+9$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;font-weight:700;color:#15803d;">$+$</td></tr>
</tbody>
</table>
<ol>
<li><strong>Step 1 — Record the sign ($+$ or $-$) of each participant difference ($\text{Before} - \text{After}$):</strong> If a participant score did not change (a difference of $0$, like Patient 3), <strong>omit that participant</strong> and reduce $N$ by $1$! So here, effective $N = 10 - 1 = \mathbf{9}$.</li>
<li><strong>Step 2 — Count how many $+$ signs and how many $-$ signs:</strong><br>
Number of $+$ signs $= 8$. Number of $-$ signs $= 1$.</li>
<li><strong>Step 3 — Identify $S$ (the frequency of the LESS frequent sign):</strong><br>
$$\text{Observed } S = \min(8, 1) = \mathbf{1}$$</li>
<li><strong>Step 4 — Compare observed $S$ against the critical value of $S$:</strong> For $N = 9$ at $p \le 0.05$ (one-tailed), the critical value of $S$ from the table is $\mathbf{1}$. For the Sign test, observed $S$ must be <strong>less than or equal to ($\le$)</strong> the critical value to be significant. Since observed $S = 1 \le \text{critical value } 1$, the reduction in spider fear is <strong>statistically significant at $p \le 0.05$</strong>, so we reject $H_0$!</li>
</ol>
<h3>Practice</h3>
<p>In a matched-pairs study of $14$ pairs of twins, $10$ pairs scored higher in Condition A ($+$), $2$ pairs scored higher in Condition B ($-$), and $2$ pairs had identical scores ($0$). State the effective $N$ and the observed value of $S$.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>Omit the $2$ tied pairs with a difference of $0$, reducing $N$ from $14$ to effective $\mathbf{N = 12}$. Count the remaining signs: $10$ pluses ($+$) and $2$ minuses ($-$). The Sign test statistic $S$ is the count of the less frequent sign $\rightarrow \mathbf{S = 2}$.</p></div></details>` },

{ order: 5, title: "Worked inferential test 2: the Chi-squared (χ²) test step by step", content: `
<p>The <strong>Chi-squared ($\chi^2$) test</strong> is used when data are <strong>nominal category frequencies</strong> and the design is <strong>independent</strong> (each participant is counted in one cell only of a contingency table). Study the left panel of the calculations diagram below, then follow our complete step-by-step worked example.</p>
<figure style="margin:1.4rem 0;text-align:center;"><img src="/lesson-assets/wjec-a2-psychology/psych-unit4-inferential-calcs.png" alt="Three-panel worked calculation diagram for Chi-squared test, Wilcoxon matched-pairs signed-ranks test (T), and Spearman's rank correlation coefficient (rs) / Mann-Whitney U." style="width:100%;max-width:100%;border:1px solid #cbd5e1;border-radius:0.75rem;background:#fff;"><figcaption style="margin-top:0.5rem;font-size:0.9rem;color:#475569;text-align:left;">Step-by-step worked formulas for Chi-squared ($\chi^2$), Wilcoxon ($T$), Spearman ($r_s$) and Mann–Whitney ($U$). Diagram drawn for this course.</figcaption></figure>
<h4>The Chi-squared ($\chi^2$) formula and expected frequencies ($E$)</h4>
$$\chi^2 = \sum \frac{(O - E)^2}{E} \quad\text{where}\quad E = \frac{\text{Row Total} \times \text{Column Total}}{\text{Grand Total } (N)}$$
<p>And degrees of freedom are given by $df = (\text{number of rows} - 1) \times (\text{number of columns} - 1)$. For any $2 \times 2$ contingency table, $df = (2 - 1)(2 - 1) = \mathbf{1}$.</p>
<h4>Complete worked example ($N = 100$ post-match manager interviews)</h4>
<p>In a content analysis of $100$ post-match interviews ($50$ after a Win, $50$ after a Loss), researchers tallied whether each manager primary explanation was an <em>Internal attribution</em> or an <em>External attribution</em>:</p>
<table style="width:100%;border-collapse:collapse;margin:0.8rem 0;font-size:0.9rem;">
<thead><tr style="background:#f1f5f9;"><th style="padding:0.45rem;border:1px solid #cbd5e1;">Match Result</th><th style="padding:0.45rem;border:1px solid #cbd5e1;">Internal Attribution ($O$)</th><th style="padding:0.45rem;border:1px solid #cbd5e1;">External Attribution ($O$)</th><th style="padding:0.45rem;border:1px solid #cbd5e1;">Row Total</th></tr></thead>
<tbody>
<tr><td style="padding:0.45rem;border:1px solid #cbd5e1;font-weight:600;">Won Match</td><td style="padding:0.45rem;border:1px solid #cbd5e1;">Cell A: $O = 38$</td><td style="padding:0.45rem;border:1px solid #cbd5e1;">Cell B: $O = 12$</td><td style="padding:0.45rem;border:1px solid #cbd5e1;font-weight:600;">$50$</td></tr>
<tr><td style="padding:0.45rem;border:1px solid #cbd5e1;font-weight:600;">Lost Match</td><td style="padding:0.45rem;border:1px solid #cbd5e1;">Cell C: $O = 22$</td><td style="padding:0.45rem;border:1px solid #cbd5e1;">Cell D: $O = 28$</td><td style="padding:0.45rem;border:1px solid #cbd5e1;font-weight:600;">$50$</td></tr>
<tr style="background:#f8fafc;"><td style="padding:0.45rem;border:1px solid #cbd5e1;font-weight:600;">Column Total</td><td style="padding:0.45rem;border:1px solid #cbd5e1;font-weight:600;">$60$</td><td style="padding:0.45rem;border:1px solid #cbd5e1;font-weight:600;">$40$</td><td style="padding:0.45rem;border:1px solid #cbd5e1;font-weight:700;">Grand Total $N = 100$</td></tr>
</tbody>
</table>
<ol>
<li><strong>Step 1 — Calculate Expected frequency ($E = \frac{\text{Row Total} \times \text{Col Total}}{N}$) for each of the 4 cells:</strong>
  <ul>
  <li>Cell A (Won, Internal): $E_A = \frac{50 \times 60}{100} = \mathbf{30}$</li>
  <li>Cell B (Won, External): $E_B = \frac{50 \times 40}{100} = \mathbf{20}$</li>
  <li>Cell C (Lost, Internal): $E_C = \frac{50 \times 60}{100} = \mathbf{30}$</li>
  <li>Cell D (Lost, External): $E_D = \frac{50 \times 40}{100} = \mathbf{20}$</li>
  </ul>
</li>
<li><strong>Step 2 — For each cell, calculate $\frac{(O - E)^2}{E}$:</strong>
  <ul>
  <li>Cell A: $O - E = 38 - 30 = +8 \rightarrow (+8)^2 = 64 \rightarrow \frac{64}{30} = \mathbf{2.133}$</li>
  <li>Cell B: $O - E = 12 - 20 = -8 \rightarrow (-8)^2 = 64 \rightarrow \frac{64}{20} = \mathbf{3.200}$</li>
  <li>Cell C: $O - E = 22 - 30 = -8 \rightarrow (-8)^2 = 64 \rightarrow \frac{64}{30} = \mathbf{2.133}$</li>
  <li>Cell D: $O - E = 28 - 20 = +8 \rightarrow (+8)^2 = 64 \rightarrow \frac{64}{20} = \mathbf{3.200}$</li>
  </ul>
</li>
<li><strong>Step 3 — Sum all four cells to get $\chi^2$:</strong>
$$\chi^2 = 2.133 + 3.200 + 2.133 + 3.200 = \mathbf{10.67}\text{ (to 2 d.p.)}$$</li>
<li><strong>Step 4 — Compare against critical value:</strong> At $df = 1, p \le 0.05$ (two-tailed), critical $\chi^2 = 3.84$. For $\chi^2$, observed value must be <strong>greater than or equal to ($\ge$)</strong> the critical value. Since $10.67 \ge 3.84$, the result is <strong>statistically significant</strong>!</li>
</ol>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">In a $2 \times 2$ Chi-squared contingency table with Grand Total $N = 80$, Row 1 has a Row Total of $40$ and Column 1 has a Column Total of $24$. What is the Expected frequency ($E$) for the cell in Row 1, Column 1?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Remember the formula: $E = (\text{Row Total} \times \text{Column Total}) / \text{Grand Total} = (40 \times 24) / 80$."><span class="tutor-checkpoint-key">A</span><span>$64$</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! $E = \frac{40 \times 24}{80} = \frac{960}{80} = 12$."><span class="tutor-checkpoint-key">B</span><span>$12$</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. $40 - 24 = 16$, which subtracts the totals instead of multiplying and dividing by $N$."><span class="tutor-checkpoint-key">C</span><span>$16$</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. $960$ is $40 \times 24$ before dividing by the Grand Total of $80$."><span class="tutor-checkpoint-key">D</span><span>$960$</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 6, title: "Worked inferential test 3: Wilcoxon matched-pairs signed-ranks test (T)", content: `
<p>When a study tests a <strong>difference</strong> in a <strong>repeated measures or matched pairs design</strong> and the data are <strong>at least ordinal</strong>, we use the <strong>Wilcoxon matched-pairs signed-ranks test ($T$)</strong>. Why is Wilcoxon much more powerful than the Sign test? Because the Sign test throws away the <em>size</em> of each participant change (treating a $+1$ improvement and a $+19$ improvement as identical), whereas Wilcoxon ranks the <strong>magnitude of the differences</strong>!</p>
<h4>Step-by-step worked example ($N = 6$ participants recalling words in Silence vs Music)</h4>
<table style="width:100%;border-collapse:collapse;margin:0.8rem 0;font-size:0.9rem;">
<thead><tr style="background:#f1f5f9;"><th style="padding:0.45rem;border:1px solid #cbd5e1;">Participant</th><th style="padding:0.45rem;border:1px solid #cbd5e1;">Silence Score</th><th style="padding:0.45rem;border:1px solid #cbd5e1;">Music Score</th><th style="padding:0.45rem;border:1px solid #cbd5e1;">Difference $d$</th><th style="padding:0.45rem;border:1px solid #cbd5e1;">Rank of $|d|$ (ignore sign)</th><th style="padding:0.45rem;border:1px solid #cbd5e1;">Signed Rank</th></tr></thead>
<tbody>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">P1</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">15</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">10</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+5$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$3.5$ (tied with P5)</td><td style="padding:0.4rem;border:1px solid #cbd5e1;color:#15803d;font-weight:700;">$+3.5$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">P2</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">12</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">12</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$0$ (omit!)</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">Omitted ($N$ drops to $5$)</td><td style="padding:0.4rem;border:1px solid #cbd5e1;color:#64748b;">—</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">P3</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">11</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">13</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$-2$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$1$ (smallest $|d|=2$)</td><td style="padding:0.4rem;border:1px solid #cbd5e1;color:#dc2626;font-weight:700;">$-1$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">P4</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">16</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">13</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+3$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$2$ (second smallest $|d|=3$)</td><td style="padding:0.4rem;border:1px solid #cbd5e1;color:#15803d;font-weight:700;">$+2$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">P5</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">14</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">9</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+5$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$3.5$ (tied positions 3 &amp; 4)</td><td style="padding:0.4rem;border:1px solid #cbd5e1;color:#15803d;font-weight:700;">$+3.5$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">P6</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">18</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">10</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$+8$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$5$ (largest $|d|=8$)</td><td style="padding:0.4rem;border:1px solid #cbd5e1;color:#15803d;font-weight:700;">$+5$</td></tr>
</tbody>
</table>
<ol>
<li><strong>Step 1 — Calculate each difference $d = \text{Condition A} - \text{Condition B}$, keeping the $+$ or $-$ sign:</strong> Omit any pair where $d = 0$ (P2 has $12 - 12 = 0$, so effective $N = 6 - 1 = \mathbf{5}$).</li>
<li><strong>Step 2 — Rank the absolute differences $|d|$ from smallest ($1$) to largest ($N$), ignoring $+$ or $-$ signs:</strong><br>
Our 5 non-zero absolute differences in order are: $2,\; 3,\; 5,\; 5,\; 8$.
  <ul>
  <li>$|d| = 2$ (P3) gets Rank $\mathbf{1}$.</li>
  <li>$|d| = 3$ (P4) gets Rank $\mathbf{2}$.</li>
  <li>Two participants (P1 and P5) tie with $|d| = 5$ across rank positions $3$ and $4$, so both receive the mean rank $\frac{3 + 4}{2} = \mathbf{3.5}$.</li>
  <li>$|d| = 8$ (P6) gets Rank $\mathbf{5}$.</li>
  </ul>
</li>
<li><strong>Step 3 — Re-attach the $+$ or $-$ signs and sum the positive ranks ($W_+$) and negative ranks ($W_-$) separately:</strong><br>
Sum of positive ranks $W_+ = 3.5 + 2 + 3.5 + 5 = \mathbf{14.0}$.<br>
Sum of negative ranks $W_- = \mathbf{1.0}$ (from P3).<br>
<em>Quick self-check:</em> $W_+ + W_- = 14 + 1 = 15$, which equals $\frac{N(N+1)}{2} = \frac{5 \times 6}{2} = 15$!</li>
<li><strong>Step 4 — Observed $T$ is ALWAYS the SMALLER of the two rank sums:</strong>
$$\text{Observed } T = \min(W_+, W_-) = \min(14.0, 1.0) = \mathbf{1.0}$$
(Just like the Sign test and Mann–Whitney $U$, observed $T$ must be $\le$ the critical value to be significant!)</li>
</ol>
<h3>Practice</h3>
<p>Explain how tied scores are ranked in non-parametric tests (Wilcoxon, Mann–Whitney and Spearman), giving a numerical example.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>When two or more scores are tied for the same value, they are assigned the <strong>mean (average) of the rank positions they would have occupied</strong>, and the next score receives the next available rank position. For example, if two scores tie for the 4th and 5th positions, both receive rank $\frac{4 + 5}{2} = 4.5$, and the next score receives rank $6$ (not $5$). If three scores tie across positions $2, 3$ and $4$, all three receive rank $\frac{2 + 3 + 4}{3} = 3$, and the next score receives rank $5$.</p></div></details>` },

{ order: 7, title: "Worked inferential test 4: Mann–Whitney U test step by step", content: `
<p>When an experiment uses an <strong>independent groups design</strong> and the dependent variable is measured at least at the <strong>ordinal level</strong>, we use the <strong>Mann–Whitney $U$ test</strong>.</p>
<h4>Step-by-step recipe for Mann–Whitney $U$ ($n_1 = 4$ in Group A, $n_2 = 4$ in Group B)</h4>
<p>Suppose $4$ participants in Group A (Audience present) completed a task in $\{12, 15, 14, 18\}\text{ seconds}$, and $4$ participants in Group B (Alone) completed the task in $\{20, 16, 22, 25\}\text{ seconds}$.</p>
<ol>
<li><strong>Step 1 — Combine all $N = n_1 + n_2 = 8$ scores into one single list and rank them from lowest ($1$) to highest ($8$):</strong>
  <ul>
  <li>$12\text{ s}$ (Group A) $\rightarrow$ Rank $\mathbf{1}$</li>
  <li>$14\text{ s}$ (Group A) $\rightarrow$ Rank $\mathbf{2}$</li>
  <li>$15\text{ s}$ (Group A) $\rightarrow$ Rank $\mathbf{3}$</li>
  <li>$16\text{ s}$ (Group B) $\rightarrow$ Rank $\mathbf{4}$</li>
  <li>$18\text{ s}$ (Group A) $\rightarrow$ Rank $\mathbf{5}$</li>
  <li>$20\text{ s}$ (Group B) $\rightarrow$ Rank $\mathbf{6}$</li>
  <li>$22\text{ s}$ (Group B) $\rightarrow$ Rank $\mathbf{7}$</li>
  <li>$25\text{ s}$ (Group B) $\rightarrow$ Rank $\mathbf{8}$</li>
  </ul>
</li>
<li><strong>Step 2 — Sum the ranks for Group A ($R_1$) and for Group B ($R_2$) separately:</strong>
  <ul>
  <li>Group A ranks: $R_1 = 1 + 2 + 3 + 5 = \mathbf{11}$.</li>
  <li>Group B ranks: $R_2 = 4 + 6 + 7 + 8 = \mathbf{25}$.</li>
  </ul>
</li>
<li><strong>Step 3 — Substitute into the Mann–Whitney formulas for $U_1$ and $U_2$:</strong>
$$U_1 = n_1 n_2 + \frac{n_1(n_1 + 1)}{2} - R_1 = (4 \times 4) + \frac{4(5)}{2} - 11 = 16 + 10 - 11 = \mathbf{15}$$
$$U_2 = n_1 n_2 + \frac{n_2(n_2 + 1)}{2} - R_2 = (4 \times 4) + \frac{4(5)}{2} - 25 = 16 + 10 - 25 = \mathbf{1}$$
<em>(Quick self-check: $U_1 + U_2$ must always equal $n_1 \times n_2$! Here $15 + 1 = 16 = 4 \times 4$.)</em></li>
<li><strong>Step 4 — Observed $U$ is ALWAYS the SMALLER of $U_1$ and $U_2$:</strong>
$$\text{Observed } U = \min(U_1, U_2) = \min(15, 1) = \mathbf{1}$$
Compare observed $U$ against the critical value at $n_1 = 4, n_2 = 4$: observed $U$ must be <strong>less than or equal to ($\le$)</strong> the critical value to be significant!</li>
</ol>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">In a Mann–Whitney U test with $n_1 = 6$ participants in Group 1 and $n_2 = 6$ participants in Group 2, you calculate $U_1 = 31$ and $U_2 = 5$. What is the observed value of $U$, and how does $U_1 + U_2$ check your arithmetic?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. The observed Mann-Whitney statistic $U$ is always the smaller of $U_1$ and $U_2$, which is $5$, not $31$."><span class="tutor-checkpoint-key">A</span><span>Observed $U = 31$, because we always pick the larger value</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! Observed $U$ is always the smaller value ($\min(31, 5) = 5$), and $U_1 + U_2 = 31 + 5 = 36$, which equals $n_1 \times n_2 = 6 \times 6 = 36$."><span class="tutor-checkpoint-key">B</span><span>Observed $U = 5$ (the smaller of $U_1$ and $U_2$), and $31 + 5 = 36 = n_1 \times n_2$ ($6 \times 6$)</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. We do not subtract $U_2$ from $U_1$; we take the smaller of the two values."><span class="tutor-checkpoint-key">C</span><span>Observed $U = 26$ ($31 - 5$)</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. $36$ is the product $n_1 \times n_2$, whereas observed $U = 5$."><span class="tutor-checkpoint-key">D</span><span>Observed $U = 36$</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 8, title: "Worked inferential test 5: Spearman's rank correlation coefficient (rs)", content: `
<p>When a study tests for a <strong>correlation (relationship)</strong> between two continuous <strong>co-variables</strong> measured at least at the <strong>ordinal level</strong>, we use <strong>Spearman's rank correlation coefficient ($r_s$)</strong>:</p>
$$r_s = 1 - \frac{6 \sum d^2}{N(N^2 - 1)}$$
<p> Remember: $r_s$ always lies between <strong>$-1.00$</strong> (perfect negative correlation) and <strong>$+1.00$</strong> (perfect positive correlation), with $0$ indicating no correlation. If your calculation ever gives a number greater than $+1$ or less than $-1$, stop and check your arithmetic!</p>
<h4>Step-by-step worked example ($N = 5$ students: Daily Screen Time vs Nightly Sleep)</h4>
<table style="width:100%;border-collapse:collapse;margin:0.8rem 0;font-size:0.9rem;">
<thead><tr style="background:#f1f5f9;"><th style="padding:0.4rem;border:1px solid #cbd5e1;">Student</th><th style="padding:0.4rem;border:1px solid #cbd5e1;">Screen Time (hrs) $X$</th><th style="padding:0.4rem;border:1px solid #cbd5e1;">Rank $X$</th><th style="padding:0.4rem;border:1px solid #cbd5e1;">Sleep (hrs) $Y$</th><th style="padding:0.4rem;border:1px solid #cbd5e1;">Rank $Y$</th><th style="padding:0.4rem;border:1px solid #cbd5e1;">Rank diff $d = \text{Rank }X - \text{Rank }Y$</th><th style="padding:0.4rem;border:1px solid #cbd5e1;">$d^2$</th></tr></thead>
<tbody>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">S1</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">2.0</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">1</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">8.5</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">5</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$1 - 5 = -4$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;font-weight:700;">$16$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">S2</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">3.5</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">2</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">8.0</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">4</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$2 - 4 = -2$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;font-weight:700;">$4$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">S3</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">5.0</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">3</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">7.0</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">3</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$3 - 3 = 0$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;font-weight:700;">$0$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">S4</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">6.5</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">4</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">5.5</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">1</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$4 - 1 = +3$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;font-weight:700;">$9$</td></tr>
<tr><td style="padding:0.4rem;border:1px solid #cbd5e1;">S5</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">8.0</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">5</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">6.0</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">2</td><td style="padding:0.4rem;border:1px solid #cbd5e1;">$5 - 2 = +3$</td><td style="padding:0.4rem;border:1px solid #cbd5e1;font-weight:700;">$9$</td></tr>
</tbody>
</table>
<ol>
<li><strong>Step 1 — Rank Co-variable $X$ from lowest ($1$) to highest ($N = 5$), and rank Co-variable $Y$ from lowest ($1$) to highest ($N = 5$) separately:</strong> Never combine the two columns when ranking Spearman!</li>
<li><strong>Step 2 — Subtract $\text{Rank } X - \text{Rank } Y = d$ for each participant, square each difference ($d^2$), and sum the column ($\sum d^2$):</strong>
$$\sum d^2 = 16 + 4 + 0 + 9 + 9 = \mathbf{38}$$</li>
<li><strong>Step 3 — Substitute $\sum d^2 = 38$ and $N = 5$ into Spearman's formula:</strong>
$$r_s = 1 - \frac{6 \times 38}{5(5^2 - 1)} = 1 - \frac{228}{5(24)} = 1 - \frac{228}{120} = 1 - 1.90 = \mathbf{-0.90}$$</li>
<li><strong>Step 4 — Interpret:</strong> $r_s = -0.90$ indicates a <strong>strong negative correlation</strong>—as daily smartphone screen time increases, nightly sleep duration decreases. To test significance, compare the absolute value $|r_s| = 0.90$ against the critical value (observed $|r_s|$ must be $\ge$ critical value).</li>
</ol>
<h3>Practice</h3>
<p>In a correlation of $N = 10$ participants, a researcher calculates $\sum d^2 = 33$. Calculate Spearman $r_s$ to 2 decimal places using $r_s = 1 - \frac{6 \sum d^2}{N(N^2 - 1)}$.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p><strong>Step 1 (Numerator $6 \sum d^2$):</strong> $6 \times 33 = 198$.<br><strong>Step 2 (Denominator $N(N^2 - 1)$):</strong> For $N = 10$, $10 \times (10^2 - 1) = 10 \times (100 - 1) = 10 \times 99 = 990$.<br><strong>Step 3 (Divide and subtract from 1):</strong> $r_s = 1 - \frac{198}{990} = 1 - 0.20 = \mathbf{+0.80}$ (a strong positive correlation).</p></div></details>` },

];