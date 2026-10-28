/*
 * WJEC A2 Psychology — Unit 4: Applied Research Methods
 * Lesson 12: Levels of Measurement and Inferential Statistical Tests
 * (15 pages), part 1 (pages 1-8).
 * Diagrams: /lesson-assets/wjec-a2-psychology/*.png (render-unit4-l12.cjs).
 * Exports {order,title,content}.
 */
module.exports = [

{ order: 1, title: "From descriptive to inferential statistics: why do we need significance tests?", content: `
<p>Suppose in your experiment on language and music, the Silence group recalled a mean of $13.5$ words and the Music group recalled a mean of $11.2$ words. Descriptive statistics tell us that in our sample of 24 students, the Silence group scored $2.3$ words higher. But pause and ask the crucial scientific question: <strong>how do we know that this 2.3-word difference reflects a genuine effect of music rather than a fluke of random chance (luck of the draw in who happened to be having a good memory day)?</strong></p>
<p>That is the job of <strong>inferential statistics</strong>: mathematical tests based on probability theory that tell us whether an observed difference or correlation in our sample is <strong>statistically significant</strong>—meaning we can reject the null hypothesis ($H_0$) and <em>infer</em> that the effect is real in the wider population!</p>
<p>In Lesson 12, we master every step of inferential statistics required by the WJEC A2 Unit 4 specification:</p>
<ol>
<li><strong>Levels of measurement (Page 2):</strong> distinguishing <strong>Nominal</strong>, <strong>Ordinal</strong>, <strong>Interval</strong> and <strong>Ratio</strong> data.</li>
<li><strong>The Test-Selector Decision Matrix (Page 3):</strong> choosing and justifying <strong>Chi-Squared ($\chi^2$)</strong>, the <strong>Sign Test ($S$)</strong>, <strong>Mann–Whitney $U$</strong>, <strong>Wilcoxon Matched-Pairs Signed-Ranks ($T$)</strong>, and <strong>Spearman's Rank Correlation ($r_s$)</strong>.</li>
<li><strong>Probability ($p \le 0.05$, $p \le 0.01$) and Type I versus Type II errors (Page 4).</strong></li>
<li><strong>How to read critical value tables:</strong> the <strong>"R Rule"</strong> vs non-"R" tests (Page 5).</li>
<li><strong>Step-by-step worked calculations and interpretations (Pages 6–10)</strong> for the Sign Test, Chi-Squared, Mann–Whitney $U$, Wilcoxon $T$, and Spearman's $r_s$.</li>
</ol>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">What is the primary purpose of carrying out an inferential statistical test on your investigation data?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Descriptive statistics (like the mean and range) summarise the sample scores; inferential tests calculate whether the result is likely due to chance."><span class="tutor-checkpoint-key">A</span><span>To find the highest minus the lowest score in the sample</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! Inferential statistics calculate the probability (p) that the observed difference or correlation occurred by chance alone, allowing us to decide whether to reject the null hypothesis (H0)."><span class="tutor-checkpoint-key">B</span><span>To determine the probability that the observed difference or correlation occurred by chance, so we know whether to reject the null hypothesis</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. No statistical test can magically fix a biased sampling method or unstandardized procedure after the fact."><span class="tutor-checkpoint-key">C</span><span>To eliminate demand characteristics during data collection</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Pie chart angles are descriptive visual summaries."><span class="tutor-checkpoint-key">D</span><span>To convert degrees into percentages for a pie chart</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 2, title: "Levels of measurement: Nominal, Ordinal, Interval and Ratio", content: `
<p>Before you can choose an inferential statistical test, you must identify the <strong>level of measurement</strong> of your dependent variable (or co-variables). Stanley Stevens (1946) classified data into four hierarchy levels—memorise the acronym <strong>NOIR</strong> (Nominal, Ordinal, Interval, Ratio) from lowest to highest precision:</p>
<ol>
<li><strong>Nominal (categorical / frequency count) data:</strong>
  <ul>
  <li><em>Definition:</em> Data exist as <strong>named, discrete, mutually exclusive categories</strong>. Each participant is placed into one category only, and we count the <em>frequency</em> (number of people/items) in each box.</li>
  <li><em>Psychological examples:</em> Classification of attachment type (Secure vs Insecure-Avoidant vs Insecure-Resistant); Yes vs No compliance; Pass vs Fail; Internal vs External attribution category in a post-match interview content analysis.</li>
  <li><em>Crucial exam trap:</em> In nominal data, <strong>one participant = one tally mark</strong>. If each participant scores 0 to 20 words, that is <em>not</em> nominal data!</li>
  </ul>
</li>
<li><strong>Ordinal (ranked / rating scale) data:</strong>
  <ul>
  <li><em>Definition:</em> Scores can be placed in <strong>rank order from lowest to highest</strong> (1st, 2nd, 3rd…), OR come from subjective psychological rating scales (e.g. rating stress from 1 = "not at all stressed" to 10 = "extremely stressed"), where the <strong>intervals between adjacent numbers are not guaranteed to be equal</strong>.</li>
  <li><em>Why subjective scales are ordinal:</em> The subjective emotional gap between stress rating 2 and 3 is not necessarily identical in size to the gap between 8 and 9! Notice also that in A-level non-parametric statistics, memory/test scores (e.g. words recalled out of 20, since some words are harder than others) and any continuous interval/ratio data can be <em>converted into ranks</em> and treated as ordinal ("at least ordinal").</li>
  </ul>
</li>
<li><strong>Interval and Ratio (continuous physical scale) data:</strong>
  <ul>
  <li><em>Interval:</em> Measured along a continuous public physical scale with <strong>equal, standardised units throughout</strong>, but with an arbitrary zero point (e.g. temperature in $^{\circ}\text{C}$ or standardised IQ scores).</li>
  <li><em>Ratio:</em> Equal standardised units <em>plus</em> a <strong>true absolute zero</strong> (where $0$ means complete absence of the quantity, e.g. reaction time in milliseconds, duration of sleep in minutes, hormone concentration in $\text{pg/ml}$).</li>
  </ul>
</li>
</ol>
<h3>Practice</h3>
<p>Identify the level of measurement (Nominal, Ordinal, or Interval/Ratio) for each of the following DVs: (a) Time in milliseconds taken to press a button on a Stroop task; (b) Self-reported happiness rated on a scale from 1 to 7; (c) Whether each commuter helps or ignores a person who drops a cane on a train.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>(a) <strong>Interval/Ratio</strong> (time in milliseconds is measured on an objective physical scale with equal 1 ms intervals and a true zero—and since it can be ranked, it satisfies "at least ordinal" for Mann–Whitney/Wilcoxon/Spearman).<br>(b) <strong>Ordinal</strong> (a 1–7 subjective rating scale can be ordered from lowest to highest happiness, but the psychological distance between 1 and 2 is not objectively equal to the distance between 6 and 7).<br>(c) <strong>Nominal</strong> (each commuter is classified into one of two discrete, mutually exclusive categories—"Helped" vs "Ignored"—producing frequency counts).</p></div></details>` },

{ order: 3, title: "The Inferential Test Selector Matrix: choosing and justifying your test", content: `
<p>In almost every Unit 4 paper, a 3-mark question asks: <em>"Name and justify the appropriate inferential statistical test for this study."</em> Study the three-panel decision diagram below—if you ask three simple questions in order, you will pick the right test 100% of the time!</p>
<figure style="margin:1.4rem 0;text-align:center;"><img src="/lesson-assets/wjec-a2-psychology/psych-unit4-test-selector.png" alt="Three-panel diagram for selecting inferential tests: Level of Measurement (NOIR), the Inferential Test Decision Matrix (Chi-squared, Sign test, Mann-Whitney U, Wilcoxon T, Spearman rs), and Probability & Type I vs Type II errors." style="width:100%;max-width:100%;border:1px solid #cbd5e1;border-radius:0.75rem;background:#fff;"><figcaption style="margin-top:0.5rem;font-size:0.9rem;color:#475569;text-align:left;">The WJEC Unit 4 Inferential Test Decision Matrix, levels of measurement, and Type I/II errors. Diagram drawn for this course.</figcaption></figure>
<h4>The 3-Step Formula for earning all 3 justification marks</h4>
<p>Whenever you justify an inferential test in the exam, write <strong>three numbered points</strong> corresponding to the three axes of the decision matrix:</p>
<ol>
<li><strong>Question 1 — Difference or Correlation (Association)?</strong> State whether the hypothesis tests a <em>difference between two experimental conditions</em> OR a <em>correlation/association between two co-variables</em>.</li>
<li><strong>Question 2 — What is the Experimental Design (if testing a difference)?</strong> State whether the design is <em>independent groups</em> (different participants in each condition) OR <em>repeated measures / matched pairs</em> (same or matched participants in both conditions).</li>
<li><strong>Question 3 — What is the Level of Measurement (contextualised to the DV)?</strong> State whether the data are <em>nominal</em> (discrete category frequencies) OR <em>at least ordinal</em> (ordinal, interval or ratio scores that can be ranked), quoting the exact DV from the scenario!</li>
</ol>
<table style="width:100%;border-collapse:collapse;margin:1.0rem 0;font-size:0.92rem;">
<thead>
<tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
<th style="padding:0.55rem;text-align:left;border:1px solid #cbd5e1;">Level of Data</th>
<th style="padding:0.55rem;text-align:left;border:1px solid #cbd5e1;">Difference: Independent Groups</th>
<th style="padding:0.55rem;text-align:left;border:1px solid #cbd5e1;">Difference: Repeated Measures / Matched Pairs</th>
<th style="padding:0.55rem;text-align:left;border:1px solid #cbd5e1;">Correlation / Association</th>
</tr>
</thead>
<tbody>
<tr>
<td style="padding:0.55rem;border:1px solid #cbd5e1;font-weight:600;">Nominal (category counts)</td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Chi-Squared ($\chi^2$)</strong> test of independence</td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Sign Test ($S$)</strong></td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Chi-Squared ($\chi^2$)</strong> test of association ($2 \times 2$ contingency table)</td>
</tr>
<tr>
<td style="padding:0.55rem;border:1px solid #cbd5e1;font-weight:600;">Ordinal, Interval or Ratio (ranked scores)</td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Mann–Whitney $U$</strong> test</td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Wilcoxon Matched-Pairs Signed-Ranks ($T$)</strong> test</td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Spearman's Rank Correlation Coefficient ($r_s$)</strong></td>
</tr>
</tbody>
</table>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">A researcher tests the same 15 participants' stress ratings (on a 1–20 scale) BEFORE and AFTER a 30-minute dog-assisted therapy session. Which inferential test should they use, and why?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Mann–Whitney U is for an independent groups design (two separate groups of participants). Here the same 15 participants were tested before and after!"><span class="tutor-checkpoint-key">A</span><span>Mann–Whitney U test, because there are two conditions</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! (1) Testing for a difference between before and after; (2) Repeated measures design (same 15 participants tested twice); (3) Stress ratings on a 1–20 scale are ordinal data."><span class="tutor-checkpoint-key">B</span><span>Wilcoxon matched-pairs signed-ranks test (T): difference + repeated measures + ordinal rating data</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Spearman's rs tests for a correlation between two co-variables, whereas here the researcher is testing for a difference before vs after therapy."><span class="tutor-checkpoint-key">C</span><span>Spearman's rank correlation (rs), because there are two sets of scores</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Chi-squared requires independent nominal category counts."><span class="tutor-checkpoint-key">D</span><span>Chi-squared test, because 15 is less than 20</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 4, title: "Probability ($p \\le 0.05$) and Type I versus Type II errors", content: `
<p>Why do psychologists almost always use the significance level <strong>$p \le 0.05$ ($5\%$)</strong>—and when do they switch to the stricter <strong>$p \le 0.01$ ($1\%$)</strong>? Let us unpack the exact meaning of $p$-values and the trade-off between <strong>Type I</strong> and <strong>Type II</strong> statistical errors.</p>
<h4>1. What does $p \le 0.05$ actually mean?</h4>
<p>In psychology, $p$ stands for the <strong>probability that the observed difference or correlation occurred by random chance alone</strong> (assuming the null hypothesis $H_0$ is true). Setting our level of significance ($\alpha$) at <strong>$p \le 0.05$</strong> means we accept up to a <strong>$5\%$ ($1\text{ in }20$) risk</strong> that our result is a fluke of chance (and at least a $95\%$ confidence that the effect is genuine). Why $0.05$? Because it is the <strong>Goldilocks balance point</strong> between two opposite statistical mistakes: Type I errors and Type II errors!</p>
<h4>2. Type I error (False Positive / "Optimist's error") vs Type II error (False Negative / "Pessimist's error")</h4>
<ul>
<li><strong>Type I error (False Positive):</strong> We <strong>wrongly reject a true null hypothesis ($H_0$)</strong>—claiming we have found a significant difference or correlation when in reality the result was just a fluke of chance!
  <ul>
  <li><em>When is a Type I error most likely?</em> When the significance level is set <strong>too leniently</strong> (e.g. $p \le 0.10$, a $10\%$ chance of a false alarm, or at $p \le 0.05$ compared with $0.01$).</li>
  </ul>
</li>
<li><strong>Type II error (False Negative):</strong> We <strong>wrongly retain (accept) a false null hypothesis ($H_0$)</strong>—missing a real effect that genuinely exists in the population and claiming nothing happened!
  <ul>
  <li><em>When is a Type II error most likely?</em> When the significance level is set <strong>too strictly / stringently</strong> (e.g. $p \le 0.001$ or $p \le 0.01$, where the bar is so high that a genuine moderate effect fails to clear it) OR when the sample size ($N$) is tiny.</li>
  </ul>
</li>
</ul>
<p>Memory trick: In the fable of <em>The Boy Who Cried Wolf</em>, first the villagers believe there is a wolf when there is none (<strong>Type I error = False Positive</strong>); second, when a real wolf arrives, the villagers believe nothing is there (<strong>Type II error = False Negative</strong>)!</p>
<h4>3. When do psychologists use $p \le 0.01$ ($1\%$) instead of $p \le 0.05$?</h4>
<p>When a <strong>Type I error (false positive) would have dangerous, costly or irreversible human consequences</strong>—such as licensing a new antipsychotic drug with severe side effects (Lesson 5) or introducing an expensive national school or prison policy—researchers demand $p \le 0.01$ ($1\text{ in }100$ chance risk) so they are $99\%$ certain the treatment works!</p>
<h3>Practice</h3>
<p>A researcher tests a new cognitive revision technique at $p \le 0.05$ and rejects the null hypothesis. Explain what a Type I error would mean in the context of this study, state the probability of making it, and explain how changing to $p \le 0.01$ affects the risk of Type I and Type II errors.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>In the context of this study, a <strong>Type I error (false positive)</strong> would mean concluding that the new cognitive revision technique significantly improves exam recall (rejecting $H_0$) when in reality the revision technique has no genuine effect and the higher score occurred purely by chance ($5\%$ or $1\text{ in }20$ probability at $p \le 0.05$). Changing the significance threshold to the stricter $p \le 0.01$ level reduces the risk of making a Type I error from $5\%$ down to $1\%$, but simultaneously <em>increases</em> the risk of making a <strong>Type II error (false negative)</strong>—failing to detect a genuine benefit of the revision technique because the critical value bar was set higher.</p></div></details>` },

{ order: 5, title: "How to read critical value tables: the golden 'R Rule'", content: `
<p>In Section B of Unit 4, the exam paper provides an extract from a <strong>table of critical values</strong> and asks you to determine whether the observed test statistic ($S, \chi^2, U, T\text{ or }r_s$) is statistically significant. Every single year, some candidates look up the right critical value and then get the final conclusion backwards because they forget which tests require the observed value to be <em>greater than or equal to</em> the critical value, and which require it to be <em>less than or equal to</em> the critical value!</p>
<div style="border-left:4px solid #1d4ed8;background:#eff6ff;padding:0.8rem 1rem;margin:1.2rem 0;border-radius:0.4rem;">
<p style="margin:0 0 0.4rem;"><strong>The Golden "R Rule" for Critical Value Tables:</strong></p>
<p style="margin:0 0 0.4rem;">Check whether the full name of the statistical test contains the letter <strong>R</strong>:</p>
<ul style="margin:0;">
<li><strong>Tests WITH the letter "R" in their name — Chi-Squa<u>r</u>ed ($\chi^2$) and Spea<u>r</u>man's <u>r</u>ank ($r_s$)</strong> (plus Pearson's $r$ / $t$-test):<br><strong>Observed value must be GREATER than or equal to the critical value ($\text{Observed} \ge \text{Critical}$)</strong> to be significant! (Think: "<strong>R</strong> = Rise above the critical value").</li>
<li><strong>Tests WITHOUT the letter "R" in their name — Sign Test ($S$), Mann–Whitney ($U$), and Wilcoxon ($T$)</strong>:<br><strong>Observed value must be LESS than or equal to the critical value ($\text{Observed} \le \text{Critical}$)</strong> to be significant!</li>
</ul>
</div>
<h4>The 4-step checklist for reading any critical value table in the exam</h4>
<ol>
<li><strong>Step 1 — Directional (one-tailed) or Non-directional (two-tailed)?</strong> Re-read the researcher alternative hypothesis ($H_1$) in the scenario stem. If it predicts a specific direction ("more", "faster", "positive correlation"), select the <strong>One-tailed</strong> column; if it just says "a difference" or "a correlation", select the <strong>Two-tailed</strong> column.</li>
<li><strong>Step 2 — Which significance level ($p$)?</strong> Unless the question specifies $p \le 0.01$, always use the <strong>$p \le 0.05$ ($5\%$)</strong> column.</li>
<li><strong>Step 3 — Which row ($N$, $n_1/n_2$, or $df$)?</strong>
  <ul>
  <li>For <strong>Spearman's $r_s$:</strong> $N =$ total number of pairs (participants).</li>
  <li>For <strong>Wilcoxon $T$ and Sign Test $S$:</strong> $N =$ number of participants <em>after</em> excluding any ties (where difference $= 0$).</li>
  <li>For <strong>Mann–Whitney $U$:</strong> intersect $n_1$ (sample size of Group 1) and $n_2$ (sample size of Group 2).</li>
  <li>For <strong>Chi-Squared ($\chi^2$):</strong> use <strong>degrees of freedom</strong>, $df = (\text{number of rows} - 1) \times (\text{number of columns} - 1)$. In a $2 \times 2$ table, $df = (2-1)(2-1) = \mathbf{1}$.</li>
  </ul>
</li>
<li><strong>Step 4 — Compare Observed vs Critical using the "R Rule" and write your 4-part significance statement:</strong> State (1) the observed value and critical value, (2) whether observed is $\ge$ or $\le$ critical (significant or not significant at $p \le 0.05$), (3) whether you <strong>reject or retain $H_0$</strong>, and (4) the conclusion <strong>in the context of the study variables</strong>!</li>
</ol>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">In a Wilcoxon signed-ranks test (one-tailed, N = 12, p ≤ 0.05), the observed test statistic is T = 11 and the critical value from the table is 17. Is this result statistically significant?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Apply the R Rule: 'Wilcoxon' has NO letter R in its name, so the observed value T must be LESS than or equal to the critical value to be significant!"><span class="tutor-checkpoint-key">A</span><span>No, because 11 is smaller than the critical value 17</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! Because 'Wilcoxon' has no letter R in its name, the observed value must be less than or equal to the critical value (Observed ≤ Critical). Since 11 ≤ 17, the difference IS statistically significant at p ≤ 0.05 and we reject the null hypothesis!"><span class="tutor-checkpoint-key">B</span><span>Yes, because for Wilcoxon (no 'R'), the observed value (11) is less than or equal to the critical value (17), so we reject H0</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. 11 ≤ 17 means we reject the null hypothesis (H0) and accept the alternative hypothesis (H1)."><span class="tutor-checkpoint-key">C</span><span>Yes, so we accept the null hypothesis (H0)</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Wilcoxon uses N (number of non-zero differences), not degrees of freedom."><span class="tutor-checkpoint-key">D</span><span>Cannot tell without calculating degrees of freedom</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 6, title: "Worked calculation 1: The Sign Test (S) and Chi-Squared (χ²)", content: `
<p>Study the left and middle panels of the diagram below, then let us work through complete calculations for the <strong>Sign Test ($S$)</strong> and <strong>Chi-Squared ($\chi^2$)</strong>.</p>
<figure style="margin:1.4rem 0;text-align:center;"><img src="/lesson-assets/wjec-a2-psychology/psych-unit4-nonparametric-diff.png" alt="Three-panel diagram of non-parametric tests of difference: Chi-squared test on a 2x2 contingency table, Wilcoxon signed-ranks test (T) and Sign test (S), and Mann-Whitney U test." style="width:100%;max-width:100%;border:1px solid #cbd5e1;border-radius:0.75rem;background:#fff;"><figcaption style="margin-top:0.5rem;font-size:0.9rem;color:#475569;text-align:left;">Worked calculations for Chi-Squared ($\chi^2$), Wilcoxon ($T$) / Sign Test ($S$), and Mann–Whitney ($U$). Diagram drawn for this course.</figcaption></figure>
<h4>1. Worked Calculation: The Sign Test ($S$)</h4>
<p>The <strong>Sign Test</strong> is used for a <strong>difference</strong> in a <strong>repeated measures (or matched pairs)</strong> design when data are treated at the <strong>nominal level</strong> (simply whether each participant improved $+$ or worsened $-$). Suppose 10 participants rated their anxiety before and after a mindfulness session:</p>
<ol>
<li><strong>Step 1 — Find the sign of each difference ($\text{Before} - \text{After}$):</strong> Suppose 8 participants showed reduced anxiety ($+$), 1 participant showed increased anxiety ($-$), and 1 participant scored the exact same rating before and after (difference $= 0$, a tie).</li>
<li><strong>Step 2 — Drop any ties ($0$) and adjust $N$:</strong> Dropping the 1 tied participant reduces $N$ from $10$ to $\mathbf{N = 9}$.</li>
<li><strong>Step 3 — Count $+$ and $-$ signs; $S$ is the frequency of the LESS frequent sign:</strong> We have eight $+$ signs and one $-$ sign. The less frequent sign occurs $\mathbf{1}$ time, so observed $\mathbf{S = 1}$.</li>
<li><strong>Step 4 — Check Critical Value ("Sign" has no R $\rightarrow \text{Observed} \le \text{Critical}$):</strong> For $N = 9$ (one-tailed, $p \le 0.05$), the critical value is $1$. Since observed $S = 1 \le 1$, the reduction in anxiety is statistically significant at $p \le 0.05$ and we reject $H_0$!</li>
</ol>
<h4>2. Worked Calculation: The Chi-Squared ($\chi^2$) Test</h4>
<p><strong>Chi-Squared ($\chi^2 = \sum \frac{(O - E)^2}{E}$)</strong> tests for a difference (independent groups) or association between <strong>nominal categorical frequencies</strong> arranged in a contingency table. Look at the $2 \times 2$ post-match interview table in the left panel of the diagram above ($N = 40$ interviews: 20 after a Win, 20 after a Loss):</p>
<ul>
<li><strong>Observed frequencies ($O$):</strong> Win + Internal $= 15$; Win + External $= 5$ (Row 1 total $= 20$). Loss + Internal $= 6$; Loss + External $= 14$ (Row 2 total $= 20$). Column totals: Internal $= 21$, External $= 19$; Grand Total $N = 40$.</li>
<li><strong>Step 1 — Calculate Expected frequency ($E = \frac{\text{Row Total} \times \text{Column Total}}{\text{Grand Total } N}$) for each cell:</strong>
  <ul>
  <li>Win + Internal: $E = \frac{20 \times 21}{40} = \mathbf{10.5}$; Win + External: $E = \frac{20 \times 19}{40} = \mathbf{9.5}$.</li>
  <li>Loss + Internal: $E = \frac{20 \times 21}{40} = \mathbf{10.5}$; Loss + External: $E = \frac{20 \times 19}{40} = \mathbf{9.5}$.</li>
  </ul>
</li>
<li><strong>Step 2 — Calculate $\frac{(O - E)^2}{E}$ for each of the four cells and sum them:</strong>
  <ul>
  <li>Cell 1 (Win/Int): $\frac{(15 - 10.5)^2}{10.5} = \frac{4.5^2}{10.5} = \frac{20.25}{10.5} = 1.93$</li>
  <li>Cell 2 (Win/Ext): $\frac{(5 - 9.5)^2}{9.5} = \frac{(-4.5)^2}{9.5} = \frac{20.25}{9.5} = 2.13$</li>
  <li>Cell 3 (Loss/Int): $\frac{(6 - 10.5)^2}{10.5} = \frac{(-4.5)^2}{10.5} = \frac{20.25}{10.5} = 1.93$</li>
  <li>Cell 4 (Loss/Ext): $\frac{(14 - 9.5)^2}{9.5} = \frac{4.5^2}{9.5} = \frac{20.25}{9.5} = 2.13$</li>
  <li>Sum: $\chi^2 = 1.93 + 2.13 + 1.93 + 2.13 = \mathbf{8.12}$.</li>
  </ul>
</li>
<li><strong>Step 3 — Degrees of freedom &amp; Critical Value ("Chi-Squa<u>r</u>ed" has R $\rightarrow \text{Observed} \ge \text{Critical}$):</strong> With 2 rows and 2 columns, $df = (2-1)(2-1) = 1$. At $df = 1, p \le 0.05$ (two-tailed), the critical value is $\mathbf{3.84}$. Since observed $\chi^2 = 8.12 \ge 3.84$, the result is statistically significant; we reject $H_0$!</li>
</ul>
<h3>Practice</h3>
<p>In a $3 \times 2$ contingency table (3 rows and 2 columns) with Grand Total $N = 100$, Row 1 has total $40$ and Column 1 has total $50$. (a) Calculate the Expected frequency ($E$) for Cell (Row 1, Column 1). (b) Calculate the degrees of freedom ($df$) for this $3 \times 2$ table.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>(a) $E = \frac{\text{Row Total} \times \text{Column Total}}{\text{Grand Total}} = \frac{40 \times 50}{100} = \frac{2000}{100} = \mathbf{20.0}$.<br>(b) $df = (\text{Rows} - 1) \times (\text{Columns} - 1) = (3 - 1) \times (2 - 1) = 2 \times 1 = \mathbf{2}$.</p></div></details>` },

{ order: 7, title: "Worked calculation 2: Wilcoxon (T) and Mann–Whitney (U)", content: `
<p>Now let us walk through how to rank scores (including tied ranks!) and compute the <strong>Wilcoxon Matched-Pairs Signed-Ranks Test ($T$)</strong> and the <strong>Mann–Whitney $U$ Test</strong>.</p>
<h4>How to assign Tied Ranks (used in Wilcoxon, Mann–Whitney and Spearman)</h4>
<p>Always rank from smallest score $=$ Rank $1$ upwards. What if two or more scores are tied for the same value? <strong>Give each tied score the mean (average) of the rank positions they occupy, and then skip those used rank positions for the next score!</strong> For example, in the differences $2,\; 3,\; 3,\; 6,\; 7$: the score $2$ gets Rank $1$; the two $3$s occupy positions 2 and 3, so both get Rank $\frac{2+3}{2} = \mathbf{2.5}$; and the next score ($6$) gets Rank $\mathbf{4}$ (never Rank 3!).</p>
<h4>1. Worked Calculation: Wilcoxon Matched-Pairs Signed-Ranks Test ($T$)</h4>
<p>Look at the middle panel of the Page 6 diagram ($n = 6$ participants tested on word recall in Silence vs Music):</p>
<ol>
<li><strong>Step 1 — Calculate each participant signed difference ($d = \text{Silence} - \text{Music}$):</strong> Suppose the 6 differences are $+4,\; +2,\; -1,\; +5,\; 0,\; +3$.</li>
<li><strong>Step 2 — Omit any zero difference ($d = 0$) and reduce $N$:</strong> Participant 5 ($d = 0$) is omitted, reducing $N$ from $6$ to $\mathbf{N = 5}$.</li>
<li><strong>Step 3 — Rank the absolute differences $|d|$ (ignoring $+$ or $-$ signs) from smallest $= 1$ to largest:</strong>
  <ul>
  <li>$|d| = 1 \rightarrow \text{Rank } 1$ (carried a $-$ sign)</li>
  <li>$|d| = 2 \rightarrow \text{Rank } 2$ (carried a $+$ sign)</li>
  <li>$|d| = 3 \rightarrow \text{Rank } 3$ (carried a $+$ sign)</li>
  <li>$|d| = 4 \rightarrow \text{Rank } 4$ (carried a $+$ sign)</li>
  <li>$|d| = 5 \rightarrow \text{Rank } 5$ (carried a $+$ sign)</li>
  </ul>
</li>
<li><strong>Step 4 — Sum the ranks of the positive differences ($W_+ = 2+3+4+5 = 14$) and the ranks of the negative differences ($W_- = 1$). The observed test statistic $T$ is the SMALLER sum of ranks:</strong> Here $\mathbf{T = 1}$. ("Wilcoxon" has no R $\rightarrow$ compare against critical value using $\text{Observed } T \le \text{Critical}$).</li>
</ol>
<h4>2. Worked Calculation: Mann–Whitney $U$ Test</h4>
<p>Used for <strong>difference + independent groups + at least ordinal data</strong>:</p>
<ol>
<li><strong>Step 1:</strong> Combine all scores from both Group 1 ($n_1$) and Group 2 ($n_2$) into one single pool and rank them together from smallest $= 1$ to $n_1 + n_2$.</li>
<li><strong>Step 2:</strong> Add up the ranks belonging to Group 1 ($R_1$) and the ranks belonging to Group 2 ($R_2$).</li>
<li><strong>Step 3:</strong> Substitute into the formulas provided on the exam paper:
$$U_1 = n_1 n_2 + \frac{n_1(n_1 + 1)}{2} - R_1 \qquad \text{and} \qquad U_2 = n_1 n_2 - U_1$$
The observed test statistic $U$ is the <strong>smaller</strong> of $U_1$ and $U_2$ (e.g. in the right panel of Page 6, $n_1 = 5, n_2 = 5, R_1 = 16 \implies U_1 = 25 + 15 - 16 = 24$ and $U_2 = 25 - 24 = 1$, so $\mathbf{U = 1}$). Since "Mann–Whitney" has no R, observed $U = 1 \le \text{critical value } 4$ ($p \le 0.05$, one-tailed) $\rightarrow$ significant!</li>
</ol>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">When ranking the five scores 12, 15, 15, 15, 20 from smallest (Rank 1) to largest, what rank is assigned to each of the three tied scores of 15, and what rank is assigned to 20?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. The three 15s occupy rank positions 2, 3 and 4; averaging those positions gives (2+3+4)/3 = 3, and the next available position for 20 is Rank 5!"><span class="tutor-checkpoint-key">A</span><span>Each 15 gets Rank 2, and 20 gets Rank 3</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! 12 gets Rank 1; the three 15s occupy positions 2, 3 and 4, so each gets the average rank (2 + 3 + 4) / 3 = 3; and since positions 2, 3 and 4 are now used up, 20 gets Rank 5!"><span class="tutor-checkpoint-key">B</span><span>Each 15 gets Rank 3, and 20 gets Rank 5</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Rank 2.5 is the average of positions 2 and 3 (for two tied scores), whereas here three scores are tied across positions 2, 3 and 4."><span class="tutor-checkpoint-key">C</span><span>Each 15 gets Rank 2.5, and 20 gets Rank 4</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Tied scores in the raw data are kept and given average ranks; only zero differences (d = 0) between conditions in Wilcoxon/Sign test are dropped."><span class="tutor-checkpoint-key">D</span><span>All three 15s are deleted from the study</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 8, title: "Worked calculation 3: Spearman's Rank Correlation Coefficient (rs)", content: `
<p>Our fifth inferential test—and the one most frequently asked as a step-by-step table completion in Unit 4—is <strong>Spearman's Rank Correlation Coefficient ($r_s$)</strong>. Study the three-panel Spearman diagram below and trace every column of the worked table.</p>
<figure style="margin:1.4rem 0;text-align:center;"><img src="/lesson-assets/wjec-a2-psychology/psych-unit4-spearman.png" alt="Three-panel diagram of Spearman's Rank Correlation Coefficient (rs): step-by-step ranking and d-squared table for N=6 pairs, formula substitution producing rs = -0.943, and critical value table interpretation." style="width:100%;max-width:100%;border:1px solid #cbd5e1;border-radius:0.75rem;background:#fff;"><figcaption style="margin-top:0.5rem;font-size:0.9rem;color:#475569;text-align:left;">Complete worked calculation and interpretation of Spearman's Rank Correlation Coefficient ($r_s$). Diagram drawn for this course.</figcaption></figure>
<h4>Step-by-step formula and procedure for Spearman's $r_s$</h4>
<p>$$r_s = 1 - \frac{6 \sum d^2}{N(N^2 - 1)}$$</p>
<ol>
<li><strong>Step 1 — Rank Co-variable X and Co-variable Y separately:</strong> Rank the $N$ scores in Column X from smallest $= 1$ to $N$ (averaging any ties). Then rank the $N$ scores in Column Y completely separately from smallest $= 1$ to $N$.</li>
<li><strong>Step 2 — Subtract each participant Rank Y from Rank X ($d = \text{Rank X} - \text{Rank Y}$) and square each difference ($d^2$):</strong> In the left panel above ($N = 6$ pairs of Screen Time hrs vs Sleep hrs), the rank differences are $-5, -3, -3, +1, +5, +5$, so $d^2 = 25, 9, 9, 1, 25, 25$.</li>
<li><strong>Step 3 — Sum the $d^2$ column ($\sum d^2$):</strong> $\sum d^2 = 25 + 9 + 9 + 1 + 25 + 25 = \mathbf{94}$.</li>
<li><strong>Step 4 — Substitute $\sum d^2 = 94$ and $N = 6$ into the formula:</strong>
$$r_s = 1 - \frac{6 \times 94}{6(6^2 - 1)} = 1 - \frac{564}{6 \times 35} = 1 - \frac{564}{210} = 1 - 2.6857 = \mathbf{-1.69}\text{? Wait!}$$</li>
</ol>
<p>Pause and look closely at the table in the left panel of the diagram above to see the exact numbers used there: for the 6 participants, Screen Time (X) $= 2, 3, 4, 5, 6, 7$ (Ranks $1, 2, 3, 4, 5, 6$) and Sleep (Y) $= 9.0, 8.0, 8.5, 7.0, 6.5, 6.0$ (Ranks $6, 4, 5, 3, 2, 1$):</p>
<ul>
<li>Participant 1: $\text{Rank X} = 1, \text{Rank Y} = 6 \implies d = -5 \implies d^2 = 25$</li>
<li>Participant 2: $\text{Rank X} = 2, \text{Rank Y} = 4 \implies d = -2 \implies d^2 = 4$</li>
<li>Participant 3: $\text{Rank X} = 3, \text{Rank Y} = 5 \implies d = -2 \implies d^2 = 4$</li>
<li>Participant 4: $\text{Rank X} = 4, \text{Rank Y} = 3 \implies d = +1 \implies d^2 = 1$</li>
<li>Participant 5: $\text{Rank X} = 5, \text{Rank Y} = 2 \implies d = +3 \implies d^2 = 9$</li>
<li>Participant 6: $\text{Rank X} = 6, \text{Rank Y} = 1 \implies d = +5 \implies d^2 = 25$</li>
<li><strong>Sum of $d^2$:</strong> $\sum d^2 = 25 + 4 + 4 + 1 + 9 + 25 = \mathbf{68}$.</li>
<li><strong>Substitution:</strong> $r_s = 1 - \frac{6 \times 68}{6(36 - 1)} = 1 - \frac{408}{210} = 1 - 1.9429 = \mathbf{-0.943}$!</li>
</ul>
<p>Notice that self-checking insight: <strong>every correlation coefficient ($r_s$) MUST lie between $-1.00$ and $+1.00$!</strong> If your calculator ever gives you a number outside $-1$ to $+1$, you immediately know to check your $d$ column! When comparing against the critical value table (e.g. $0.829$ for $N = 6$, one-tailed $p \le 0.05$), ignore the minus sign (which simply tells you the correlation is <em>negative</em>) and compare the magnitude: since $0.943 \ge 0.829$ ("Spea<u>r</u>man" has an R!), the negative correlation is statistically significant at $p \le 0.05$.</p>
<h3>Practice</h3>
<p>In a correlation of $N = 10$ participants, $\sum d^2 = 33$. Calculate Spearman's $r_s$ to 2 decimal places using $r_s = 1 - \frac{6\sum d^2}{N(N^2 - 1)}$, and state whether it is significant if the critical value at $p \le 0.05$ (one-tailed) is $0.564$.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>1. <strong>Substitute $\sum d^2 = 33$ and $N = 10$:</strong><br>$$r_s = 1 - \frac{6 \times 33}{10(10^2 - 1)} = 1 - \frac{198}{10 \times 99} = 1 - \frac{198}{990} = 1 - 0.20 = \mathbf{+0.80}$$<br>2. <strong>Significance decision:</strong> Because "Spea<u>r</u>man" contains the letter R, the observed value must be greater than or equal to the critical value ($\text{Observed} \ge \text{Critical}$). Since $0.80 \ge 0.564$, the positive correlation IS statistically significant at $p \le 0.05$ (one-tailed), and we reject the null hypothesis ($H_0$).</p></div></details>` },

];