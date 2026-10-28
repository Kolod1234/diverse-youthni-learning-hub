/*
 * WJEC A2 Psychology — Unit 4: Applied Research Methods
 * Lesson 12: Levels of Measurement, Inferential Tests and Critical Values
 * (15 pages), part 2 (pages 9-15).
 * Exports {order,title,content}.
 */
module.exports = [

{ order: 9, title: "Reading critical value tables without ever getting confused", content: `
<p>Once you have calculated (or been given) an observed test statistic in Unit 4, the next question always prints a <strong>critical value table</strong> and asks: <em>"State whether the result is statistically significant at the $p \le 0.05$ level. Explain your answer with reference to the critical value table." [3–4 marks]</em></p>
<p>Study the left and centre panels of the critical values and errors diagram below before learning the famous <strong>"R Rule"</strong> that makes critical value comparisons foolproof.</p>
<figure style="margin:1.4rem 0;text-align:center;"><img src="/lesson-assets/wjec-a2-psychology/psych-unit4-critical-errors.png" alt="Three-panel diagram of Unit 4 Critical Values and Errors: Reading Critical Value Tables (the R Rule for >= vs <= tests), Type I Error (False Positive), and Type II Error (False Negative)." style="width:100%;max-width:100%;border:1px solid #cbd5e1;border-radius:0.75rem;background:#fff;"><figcaption style="margin-top:0.5rem;font-size:0.9rem;color:#475569;text-align:left;">Reading critical value tables (the "R Rule") and distinguishing Type I and Type II errors. Diagram drawn for this course.</figcaption></figure>
<h4>1. The Three Look-Up Coordinates for any Critical Value Table</h4>
<p>Before you read a number out of a critical value table, check three things in the scenario:</p>
<ol>
<li><strong>One-tailed (directional $H_1$) versus Two-tailed (non-directional $H_1$) header:</strong> Check the hypothesis written in the scenario! If the hypothesis predicted a specific direction (e.g. "Silence will recall <em>more</em> words than Music"), read the <strong>one-tailed</strong> column; if it merely predicted "a difference" or "a correlation", read the <strong>two-tailed</strong> column.</li>
<li><strong>Significance level ($p$-value column):</strong> Unless the question explicitly specifies $p \le 0.01$, always use the standard psychological level of <strong>$p \le 0.05$</strong>.</li>
<li><strong>Row index ($N$, $n_1/n_2$, or $df$):</strong>
  <ul>
  <li>For <strong>Spearman $r_s$, Wilcoxon $T$ and Sign test $S$</strong>: look down the left-hand column for <strong>$N$</strong> (number of participants/pairs, minus any $0$-difference ties in Wilcoxon/Sign!).</li>
  <li>For <strong>Mann–Whitney $U$</strong>: intersect column <strong>$n_1$</strong> (size of Group 1) with row <strong>$n_2$</strong> (size of Group 2).</li>
  <li>For <strong>Chi-squared ($\chi^2$)</strong>: never use $N$! Always calculate <strong>degrees of freedom $df = (\text{rows} - 1) \times (\text{columns} - 1)$</strong> and read row $df$.</li>
  </ul>
</li>
</ol>
<h4>2. The Foolproof "R Rule": does Observed have to be $\ge$ or $\le$ the Critical Value?</h4>
<ul>
<li>If the full name of the test contains the letter <strong>"R"</strong> — <strong>Spea<u>r</u>man's <u>r</u>ank ($r_s$)</strong> or <strong>Chi-squa<u>r</u>ed ($\chi^2$)</strong> — then the <strong>observed value must be GREATER than or equal to ($\ge$) the critical value</strong> to be statistically significant! (Note: for negative Spearman correlations like $r_s = -0.62$, ignore the minus sign and compare the magnitude $0.62 \ge \text{critical value}$.)</li>
<li>If the name of the test has <strong>NO letter "R"</strong> — <strong>Mann–Whitney ($U$)</strong>, <strong>Wilcoxon ($T$)</strong>, or <strong>Sign test ($S$)</strong> — then the <strong>observed value must be LESS than or equal to ($\le$) the critical value</strong> to be statistically significant!</li>
</ul>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">A researcher runs a Wilcoxon signed-ranks test ($N = 12$, directional hypothesis) and obtains an observed value of $T = 19$. At $p \le 0.05$ (one-tailed) for $N = 12$, the critical value of $T$ is $17$. Is the result statistically significant?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Remember the 'R Rule': Wilcoxon has no 'R' in its name, so observed $T$ must be LESS than or equal to ($\le$) the critical value to be significant!"><span class="tutor-checkpoint-key">A</span><span>Yes, because observed $T = 19$ is greater than the critical value of $17$</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! For Wilcoxon $T$, the observed value must be less than or equal to ($\le$) the critical value. Because $19 \gt 17$, the result is NOT statistically significant at $p \le 0.05$, so we retain the null hypothesis ($H_0$)."><span class="tutor-checkpoint-key">B</span><span>No, because for Wilcoxon $T$ the observed value must be less than or equal to the critical value, and $19 \gt 17$, so we retain $H_0$</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. $19$ is greater than $17$, so it fails to reach significance."><span class="tutor-checkpoint-key">C</span><span>Yes, because $19$ is an odd number</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Wilcoxon uses sample size $N$, not degrees of freedom $(\text{rows}-1)(\text{cols}-1)$."><span class="tutor-checkpoint-key">D</span><span>We cannot tell without knowing how many rows were in the contingency table</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 10, title: "Writing a full-mark inferential significance statement", content: `
<p>When a Unit 4 question asks you to interpret an inferential test result against a critical value table (usually worth 3 or 4 marks), use this exact <strong>four-part template</strong> so you never drop a single mark:</p>
<div style="border-left:4px solid #15803d;background:#f0fdf4;padding:0.8rem 1rem;margin:1.2rem 0;border-radius:0.4rem;">
<p style="margin:0;"><strong>The 4-Part WJEC Significance Statement Template:</strong><br>
1. <strong>Quote the look-up parameters and critical value:</strong> "For a [one-tailed / two-tailed] test at $p \le 0.05$ with [$N = \dots$ / $n_1 = \dots, n_2 = \dots$ / $df = \dots$], the critical value is [quote number]." (1 mark)<br>
2. <strong>Compare observed vs critical using $\ge$ or $\le$:</strong> "Because the observed value of [$U / T / S / \chi^2 / r_s = \dots$] is [less than or equal to / greater than or equal to / not less than / not greater than] the critical value of [$\dots$], the result is [statistically significant / not statistically significant] at $p \le 0.05$." (1 mark)<br>
3. <strong>State the decision on $H_0$ and $H_1$:</strong> "Therefore, we [reject the null hypothesis ($H_0$) and accept the alternative hypothesis ($H_1$) / retain the null hypothesis ($H_0$) and reject the alternative hypothesis ($H_1$)]." (1 mark)<br>
4. <strong>Contextualise in terms of the study variables:</strong> "This means there [is / is not] a significant [difference in (DV) between (Condition A) and (Condition B) / correlation between (Co-variable 1) and (Co-variable 2)]." (1 mark)</p>
</div>
<h4>Worked example of a 4-mark answer (Mann–Whitney U)</h4>
<p><em>Scenario:</em> A researcher used a directional hypothesis to test whether an audience ($n_1 = 10$) improved bead-threading speed compared with working alone ($n_2 = 10$). She calculated an observed $U = 21$.<br>
<em>Critical value table extract for Mann–Whitney U at $p \le 0.05$:</em> For $n_1 = 10, n_2 = 10$: one-tailed critical value $= 27$; two-tailed critical value $= 23$.</p>
<p><strong>Model 4-mark answer:</strong> "Because the researcher used a directional hypothesis, we use a one-tailed test; for $n_1 = 10$ and $n_2 = 10$ at $p \le 0.05$ (one-tailed), the critical value of $U$ is $27$. For Mann–Whitney $U$, the observed value must be less than or equal to the critical value to be significant; since the observed $U = 21$ is less than the critical value of $27$ ($21 \le 27$), the result is statistically significant at $p \le 0.05$. Therefore, we reject the null hypothesis ($H_0$) and accept the alternative hypothesis ($H_1$): participants threaded the 25 beads in significantly fewer seconds in the presence of an audience than when alone."</p>
<h3>Practice</h3>
<p>In a correlation of daily screen time and sleep duration ($N = 18$, non-directional hypothesis), a student calculates $r_s = -0.41$. The critical value of $r_s$ for $N = 18$ at $p \le 0.05$ is $0.400$ (one-tailed) and $0.472$ (two-tailed). Write a complete 4-mark significance statement.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>Because the student used a non-directional hypothesis, we read the two-tailed column; for $N = 18$ at $p \le 0.05$ (two-tailed), the critical value of $r_s$ is $0.472$ (1 mark). For Spearman $r_s$, the absolute magnitude of the observed value must be greater than or equal to the critical value to be significant; since the observed magnitude $|r_s| = 0.41$ is less than the critical value of $0.472$ ($0.41 \lt 0.472$), the correlation is <strong>not statistically significant</strong> at $p \le 0.05$ (1 mark). Therefore, we retain the null hypothesis ($H_0$) and reject the alternative hypothesis ($H_1$) (1 mark): there is no statistically significant relationship between participants mean daily smartphone screen time and their mean nightly sleep duration in this sample (1 mark).</p></div></details>` },

{ order: 11, title: "Type I and Type II errors: false positives, false negatives and alpha levels", content: `
<p>Why do psychologists usually set the significance threshold at $p \le 0.05$ (5%) rather than $p \le 0.50$ (50%) or $p \le 0.0001$ (0.01%)? Because every statistical decision balances two opposite risks of error: a <strong>Type I error</strong> and a <strong>Type II error</strong>.</p>
<h4>1. Type I error (False Positive / Optimistic error)</h4>
<ul>
<li><strong>Definition:</strong> A <strong>Type I error</strong> occurs when the researcher <strong>wrongly rejects a true null hypothesis ($H_0$)</strong> and accepts the alternative hypothesis ($H_1$) when in reality there is no genuine effect and the result occurred by chance alone (a <em>false positive</em>).</li>
<li><strong>When is a Type I error most likely?</strong> When the researcher sets a <strong>too-lenient significance level</strong>, such as $p \le 0.10$ (10%, a 1 in 10 risk of a fluke) or $p \le 0.05$ when testing life-or-death medical claims. At $p = 0.05$, there is a $5\%$ ($1\text{ in }20$) probability of making a Type I error.</li>
<li><strong>How to reduce the risk of a Type I error:</strong> Use a stricter significance level such as $p \le 0.01$ (1%).</li>
</ul>
<h4>2. Type II error (False Negative / Pessimistic error)</h4>
<ul>
<li><strong>Definition:</strong> A <strong>Type II error</strong> occurs when the researcher <strong>wrongly retains a false null hypothesis ($H_0$)</strong> and rejects the alternative hypothesis ($H_1$) when a genuine difference or correlation really does exist in the population (a <em>false negative</em>—missing a real effect).</li>
<li><strong>When is a Type II error most likely?</strong>
  <ol>
  <li>When the researcher sets a <strong>too-stringent significance level</strong>, such as $p \le 0.001$ or $p \le 0.01$, so a genuine moderate effect (e.g. significant at $p = 0.03$) gets thrown away!</li>
  <li>When the <strong>sample size ($N$) is too small</strong> (low statistical power) or when a less sensitive test (like the Sign test instead of Wilcoxon) is used.</li>
  </ol>
</li>
<li><strong>Why $p \le 0.05$ is the goldilocks compromise:</strong> Psychologists use $p \le 0.05$ because it strikes the optimal balance—keeping the risk of a Type I false positive reasonably low (5%) without making the bar so high that small-sample studies constantly suffer Type II false negatives! (Exception: when testing a new antipsychotic drug with severe side effects, researchers tighten the threshold to $p \le 0.01$ to avoid prescribing an ineffective drug via a Type I error.)</li>
</ul>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">A researcher tests a new revision technique on $N = 10$ students and finds that the observed Wilcoxon $T$ is significant at $p \le 0.05$, but NOT significant when she checks the $p \le 0.01$ column. If she decides to use the $p \le 0.01$ threshold and retains $H_0$, which error is she at increased risk of making?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. A Type I error can only happen when you REJECT $H_0$ (a false positive). Because she retained $H_0$ at $p \le 0.01$, she cannot have made a Type I error!"><span class="tutor-checkpoint-key">A</span><span>A Type I error (false positive), because she retained the null hypothesis</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! Whenever a researcher retains the null hypothesis ($H_0$)—especially because of a strict $p \le 0.01$ threshold and a small sample of $N = 10$—the only possible statistical error is a Type II error (false negative: missing a genuine effect that really existed at $p \le 0.05$)."><span class="tutor-checkpoint-key">B</span><span>A Type II error (false negative), because retaining $H_0$ under a strict $p \le 0.01$ threshold risks missing a genuine effect</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Sampling error refers to unrepresentative participant selection, not the alpha significance cutoff."><span class="tutor-checkpoint-key">C</span><span>Both a Type I and a Type II error simultaneously</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Retaining $H_0$ when an effect is present is the definition of a Type II error."><span class="tutor-checkpoint-key">D</span><span>An imposed etic error</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 12, title: "Parametric versus non-parametric tests and statistical power", content: `
<p>All five inferential tests in the WJEC core matrix (Chi-squared, Sign test, Mann–Whitney $U$, Wilcoxon $T$, Spearman $r_s$) are <strong>non-parametric tests</strong>: they work on nominal category counts or ordinal ranks without assuming that the underlying population follows a normal bell curve. However, in research reports and high-tariff evaluation questions, you may also encounter their <strong>parametric equivalents</strong> (such as the independent $t$-test, related $t$-test and Pearson $r$). Let us see how they compare.</p>
<h4>When can parametric tests be used, and why are non-parametric tests preferred in Unit 4?</h4>
<p>To use a parametric test (like Student $t$-test or Pearson $r$), three strict assumptions must be met:</p>
<ol>
<li><strong>Interval or Ratio level of measurement</strong> (true equal numerical units, not ordinal rating scales).</li>
<li><strong>Normal distribution</strong> of scores in the underlying population (no severe positive or negative skew).</li>
<li><strong>Homogeneity of variance</strong> (the standard deviations/variances of the two groups must be roughly equal).</li>
</ol>
<p>In sixth-form and clinical psychological studies with small samples ($N = 10\text{ to }30$) or Likert rating scales (1–10 anxiety ratings), those three assumptions are rarely met—which is why WJEC Unit 4 focuses on <strong>non-parametric rank/category tests</strong>! Even within our non-parametric toolkit, notice the hierarchy of <strong>statistical power</strong> (sensitivity to avoid a Type II error):</p>
<ul>
<li>In a repeated measures study with ordinal/interval scores, <strong>Wilcoxon ($T$) is more powerful than the Sign test ($S$)</strong> because Wilcoxon preserves the ranked <em>size</em> of each participant difference, whereas the Sign test collapses all differences into crude $+$ or $-$ signs.</li>
</ul>
<h3>Practice</h3>
<p>Explain why a psychologist who measured participants reaction times (in milliseconds) in a repeated measures experiment should choose the Wilcoxon signed-ranks test ($T$) rather than the Sign test ($S$).</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>Reaction time in milliseconds is ratio-level data (which can be ranked as ordinal data). Although both the Sign test and Wilcoxon apply to a repeated measures test of difference, the Sign test reduces the data to nominal categories ($+$ vs $-$), throwing away the magnitude of how many milliseconds faster or slower each participant was. The Wilcoxon signed-ranks test ($T$) ranks the actual size of each participant difference, giving it greater statistical power and reducing the risk of a Type II error (false negative).</p></div></details>` },

{ order: 13, title: "Diagnostic exam clinic: spotting why candidates lose marks on inferential questions", content: `
<p>Let us inspect three real-world student answers to Unit 4 inferential statistics questions and see how small precision upgrades turn a 1/3 answer into a 3/3 answer.</p>
<h4>Case 1: Justifying the choice of test (3 marks)</h4>
<ul>
<li><strong>Weak student answer (1/3 marks):</strong> "Use the Mann–Whitney U test because it is an independent groups design and the data are ordinal." <em>(Why did this drop 2 marks? Because it forgot to state that the study is testing a <strong>difference</strong> rather than a correlation, and it failed to <strong>contextualise</strong> the design and ordinal data to the scenario!)</em></li>
<li><strong>Full-mark answer (3/3 marks):</strong> "The researcher should use the <strong>Mann–Whitney U test</strong> because: (1) the study is testing for a <strong>difference</strong> in driving hazard errors between two conditions rather than a correlation; (2) it uses an <strong>independent groups design</strong> where separate participants slept for either 8 hours or 4 hours; and (3) the dependent variable (number of driving errors made on the simulator) is measured at least at the <strong>ordinal level</strong> (ratio score data that can be ranked)."</li>
</ul>
<h4>Case 2: Reading the wrong row in a Chi-squared critical value table</h4>
<ul>
<li><strong>The trap:</strong> A $2 \times 2$ Chi-squared question states that $N = 60$ football fans were observed. The critical value table prints rows labelled $1, 2, 3, 4, 5\dots 60$. A careless student looks up Row $60$!</li>
<li><strong>The fix:</strong> Remember that Chi-squared critical value tables are indexed by <strong>degrees of freedom $df = (\text{rows} - 1) \times (\text{columns} - 1)$</strong>, NEVER by sample size $N$! For a $2 \times 2$ table, $df = (2 - 1)(2 - 1) = \mathbf{1}$ (critical value $= 3.84$ at $p \le 0.05$ two-tailed).</li>
</ul>
<h4>Case 3: Forgetting to omit $0$-difference ties in Wilcoxon and the Sign test</h4>
<ul>
<li><strong>The trap:</strong> In a repeated measures study of $12$ participants, two participants got the exact same score in Condition A and Condition B ($d = 0$). The student looks up $N = 12$ in the Wilcoxon critical value table.</li>
<li><strong>The fix:</strong> Always omit participants with $d = 0$ and reduce $N$ accordingly! Two ties of $0$ reduce $N$ from $12$ to $\mathbf{N = 10}$.</li>
</ul>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">A researcher conducts a Chi-squared test on a contingency table with $3$ rows (Under 20, Aged 20–40, Over 40) and $2$ columns (Smoker vs Non-smoker) across $N = 150$ participants. Which row of the Chi-squared critical value table must she read?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Chi-squared tables are indexed by degrees of freedom $df = (\text{rows} - 1)(\text{columns} - 1)$, never by sample size $N = 150$."><span class="tutor-checkpoint-key">A</span><span>Row $150$ (the total sample size $N$)</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! $df = (\text{number of rows} - 1) \times (\text{number of columns} - 1) = (3 - 1) \times (2 - 1) = 2 \times 1 = 2$."><span class="tutor-checkpoint-key">B</span><span>Row $df = 2$, because $df = (3 - 1) \times (2 - 1) = 2$</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. $df = 1$ only applies to a $2 \times 2$ table; here there are $3$ rows and $2$ columns."><span class="tutor-checkpoint-key">C</span><span>Row $df = 1$</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. $3 \times 2 = 6$ is the number of cells before subtracting $1$ from the rows and columns."><span class="tutor-checkpoint-key">D</span><span>Row $df = 6$ ($3 \times 2$)</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 14, title: "Practice questions with complete worked answers and criteria", content: `
<p>Attempt all three exam-style Unit 4 inferential statistics questions below in full before checking the model answers and marking criteria.</p>
<h4>Question 1 (7 marks AO2 + AO3)</h4>
<p>A psychologist investigated whether listening to white noise improved concentration in children with ADHD. Eight children completed a 30-item spot-the-difference puzzle in a quiet room and, on the following day (with counterbalancing and a matched puzzle), completed the puzzle while listening to gentle white noise. Their scores (out of 30) are shown below:<br>
Child 1: Quiet $= 14$, White noise $= 19$<br>
Child 2: Quiet $= 18$, White noise $= 18$<br>
Child 3: Quiet $= 12$, White noise $= 20$<br>
Child 4: Quiet $= 16$, White noise $= 15$<br>
Child 5: Quiet $= 11$, White noise $= 17$<br>
Child 6: Quiet $= 15$, White noise $= 22$<br>
Child 7: Quiet $= 19$, White noise $= 23$<br>
Child 8: Quiet $= 13$, White noise $= 16$<br>
(a) Name and justify the most appropriate inferential statistical test to analyse these data. [3]<br>
(b) Calculate the observed value of the test statistic $T$, showing all your working. [4]</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the worked answer and criteria</summary><div style="margin-top:0.6rem;"><p>(a) <strong>Test name &amp; justification (3 marks):</strong> The researcher should use the <strong>Wilcoxon matched-pairs signed-ranks test ($T$)</strong> because: (1) the study is testing for a <strong>difference</strong> in puzzle scores between quiet and white-noise conditions (1 mark); (2) it uses a <strong>repeated measures design</strong> where the same 8 children complete both conditions (1 mark); and (3) the dependent variable (number of puzzle items solved out of 30) is measured at least at the <strong>ordinal level</strong> so differences can be ranked by magnitude (1 mark).<br>
(b) <strong>Step-by-step Wilcoxon $T$ calculation (4 marks):</strong><br>
• <em>Step 1 (Differences $d = \text{White noise} - \text{Quiet}$):</em><br>
C1: $19 - 14 = +5$; C2: $18 - 18 = 0$ (omit! effective $N = 7$); C3: $20 - 12 = +8$; C4: $15 - 16 = -1$; C5: $17 - 11 = +6$; C6: $22 - 15 = +7$; C7: $23 - 19 = +4$; C8: $16 - 13 = +3$ (1 mark).<br>
• <em>Step 2 (Rank the 7 non-zero absolute differences $|d| = 1, 3, 4, 5, 6, 7, 8$ from smallest $1$ to largest $7$):</em><br>
$|d|=1$ (C4) $\rightarrow \text{Rank } 1$ ($-1$)<br>
$|d|=3$ (C8) $\rightarrow \text{Rank } 2$ ($+2$)<br>
$|d|=4$ (C7) $\rightarrow \text{Rank } 3$ ($+3$)<br>
$|d|=5$ (C1) $\rightarrow \text{Rank } 4$ ($+4$)<br>
$|d|=6$ (C5) $\rightarrow \text{Rank } 5$ ($+5$)<br>
$|d|=7$ (C6) $\rightarrow \text{Rank } 6$ ($+6$)<br>
$|d|=8$ (C3) $\rightarrow \text{Rank } 7$ ($+7$) (1 mark).<br>
• <em>Step 3 (Sum positive and negative ranks):</em><br>
$W_+ = 2 + 3 + 4 + 5 + 6 + 7 = 27$. $W_- = 1$ (from C4) (1 mark).<br>
• <em>Step 4 (Identify $T$ as the smaller rank sum):</em> $\text{Observed } T = \min(27, 1) = \mathbf{1}$ (1 mark).</p></div></details>

<h4>Question 2 (4 marks AO2 + AO3)</h4>
<p>For the ADHD white-noise study in Question 1, the critical value of Wilcoxon $T$ for $N = 7$ at $p \le 0.05$ (one-tailed) is $3$, and at $p \le 0.01$ (one-tailed) is $0$.<br>
(a) State with full justification whether the observed result ($T = 1$) is statistically significant at the $p \le 0.05$ level. [3]<br>
(b) Explain why the researcher might have made a Type I error at $p \le 0.05$. [1]</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the worked answer and criteria</summary><div style="margin-top:0.6rem;"><p>(a) Because the hypothesis predicted white noise would <em>improve</em> concentration (directional) and one tied pair was omitted leaving effective $N = 7$, the critical value of $T$ at $p \le 0.05$ (one-tailed) is $3$ (1 mark). For Wilcoxon $T$, the observed value must be less than or equal to ($\le$) the critical value; since observed $T = 1 \le 3$, the result is <strong>statistically significant at $p \le 0.05$</strong> (1 mark). Therefore, we reject the null hypothesis ($H_0$) and conclude that children with ADHD solved significantly more spot-the-difference items while listening to white noise than in silence (1 mark).<br>
(b) At $p \le 0.05$ there is still a $5\%$ ($1\text{ in }20$) probability that the result occurred by chance (and notice that at the stricter $p \le 0.01$ level where critical $T = 0$, our observed $T = 1$ is <em>not</em> significant), meaning rejecting $H_0$ at $p \le 0.05$ carries a risk of a <strong>Type I error (false positive)</strong> (1 mark).</p></div></details>

<h4>Question 3 (6 marks AO2)</h4>
<p>A health psychologist investigated whether patients who attended a Family Intervention programme ($n = 30$) vs patients on standard care ($n = 30$) relapsed within 12 months:<br>
• Family Intervention: Relapsed $= 6$, Did Not Relapse $= 24$ (Row Total $= 30$)<br>
• Standard Care: Relapsed $= 18$, Did Not Relapse $= 12$ (Row Total $= 30$)<br>
• Column Totals: Relapsed $= 24$, Did Not Relapse $= 36$, Grand Total $N = 60$.<br>
Using the formula $\chi^2 = \sum \frac{(O - E)^2}{E}$ where $E = \frac{\text{Row Total} \times \text{Column Total}}{N}$, calculate $\chi^2$ to 2 decimal places and determine whether it is significant at $p \le 0.05$ (two-tailed, critical value at $df = 1$ is $3.84$). [6]</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the worked answer and criteria</summary><div style="margin-top:0.6rem;"><p><strong>Step 1 (Expected frequencies $E$ for all 4 cells):</strong><br>
• Family Intervention &amp; Relapsed: $E_A = \frac{30 \times 24}{60} = \mathbf{12}$<br>
• Family Intervention &amp; Did Not Relapse: $E_B = \frac{30 \times 36}{60} = \mathbf{18}$<br>
• Standard Care &amp; Relapsed: $E_C = \frac{30 \times 24}{60} = \mathbf{12}$<br>
• Standard Care &amp; Did Not Relapse: $E_D = \frac{30 \times 36}{60} = \mathbf{18}$ (2 marks).<br>
<strong>Step 2 (Calculate $\frac{(O - E)^2}{E}$ for each cell):</strong><br>
• Cell A: $\frac{(6 - 12)^2}{12} = \frac{(-6)^2}{12} = \frac{36}{12} = \mathbf{3.00}$<br>
• Cell B: $\frac{(24 - 18)^2}{18} = \frac{(+6)^2}{18} = \frac{36}{18} = \mathbf{2.00}$<br>
• Cell C: $\frac{(18 - 12)^2}{12} = \frac{(+6)^2}{12} = \frac{36}{12} = \mathbf{3.00}$<br>
• Cell D: $\frac{(12 - 18)^2}{18} = \frac{(-6)^2}{18} = \frac{36}{18} = \mathbf{2.00}$ (2 marks).<br>
<strong>Step 3 (Sum to find $\chi^2$ and compare with critical value):</strong><br>
$\chi^2 = 3.00 + 2.00 + 3.00 + 2.00 = \mathbf{10.00}$ (1 mark). Since $df = (2-1)(2-1) = 1$ and observed $\chi^2 = 10.00$ is greater than or equal to the critical value of $3.84$ ($10.00 \ge 3.84$), the result is <strong>statistically significant at $p \le 0.05$</strong>, so we reject $H_0$ (1 mark).</p></div></details>` },

{ order: 15, title: "Retrieval recap and bridge to Lesson 13 (Novel Scenarios)", content: `
<p>You have completed Lesson 12 on Levels of Measurement, Inferential Tests and Critical Values. Test your recall on the ten retrieval prompts below before moving to Lesson 13.</p>
<h4>Retrieval set</h4>
<p>(a) Distinguish Nominal, Ordinal and Interval/Ratio levels of measurement. (b) State the three criteria you must include to earn all 3 marks when justifying an inferential test. (c) Which inferential test is used for an independent groups design with nominal category counts? (d) Which inferential test is used for a repeated measures design with ordinal scores? (e) Which inferential test is used for an independent groups design with ordinal/interval scores? (f) State the formula for Expected frequency ($E$) and degrees of freedom ($df$) in a Chi-squared test. (g) How do you handle a participant pair whose difference is $0$ in a Wilcoxon or Sign test? (h) State the "R Rule" for deciding whether an observed test statistic must be $\ge$ or $\le$ the critical value. (i) Define a Type I error and a Type II error. (j) How does changing the significance level from $p \le 0.05$ to $p \le 0.01$ affect the risk of Type I and Type II errors?</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answers</summary><div style="margin-top:0.6rem;"><p>(a) Nominal: discrete named categories (frequency counts); Ordinal: ranked scores or subjective ratings without equal intervals; Interval/Ratio: objective continuous numerical scales with equal units (and a true zero for ratio). (b) (1) Whether testing a difference or a correlation/association; (2) experimental design (independent groups vs repeated measures/matched pairs); and (3) level of measurement in context. (c) Chi-squared ($\chi^2$) test. (d) Wilcoxon matched-pairs signed-ranks test ($T$). (e) Mann–Whitney $U$ test. (f) $E = \frac{\text{Row Total} \times \text{Column Total}}{\text{Grand Total } N}$ and $df = (\text{rows} - 1) \times (\text{columns} - 1)$. (g) Omit the tied pair from the analysis and reduce $N$ by $1$ for each omitted tie. (h) Tests with the letter "R" in their full name (Spea<u>r</u>man's <u>r</u>ank $r_s$, Chi-squa<u>r</u>ed $\chi^2$) require observed $\ge$ critical value; tests without "R" (Mann–Whitney $U$, Wilcoxon $T$, Sign test $S$) require observed $\le$ critical value. (i) Type I error (false positive): wrongly rejecting a true $H_0$; Type II error (false negative): wrongly retaining a false $H_0$. (j) Making the threshold stricter ($p \le 0.01$) reduces the risk of a Type I error (to 1%) but increases the risk of a Type II error.</p></div></details>
<p>In Lesson 13 we bring our entire research methods toolkit to bear on <strong>Unit 4 Section B: Applying Research Methods to Novel Scenarios</strong> (evaluating methodologies, sampling, reliability, validity and ethics in unseen stimulus studies).</p>` },

];