/*
 * WJEC A2 Psychology — Unit 4: Applied Research Methods
 * Lesson 11: Descriptive Statistics, Distributions and Graphical Representation
 * (15 pages), part 1 (pages 1-8).
 * Diagrams: /lesson-assets/wjec-a2-psychology/*.png (render-unit4-l11.cjs).
 * Exports {order,title,content}.
 */
module.exports = [

{ order: 1, title: "Why Unit 4 rewards confident mathematical and graphical skills", content: `
<p>At least 10 percent of the marks across your A-level Psychology qualification assess mathematical skills at GCSE Higher Tier standard—and the vast majority of those marks sit right here in <strong>Unit 4: Applied Research Methods</strong>. The good news is that every single mathematical calculation on the WJEC Unit 4 specification follows a predictable, step-by-step recipe that you can master 100 percent before walking into the exam hall.</p>
<p>Pause and check what Lesson 11 covers across the official WJEC Unit 4 mathematical skills list:</p>
<ol>
<li><strong>Core arithmetic and numerical presentation (Pages 2–3):</strong> decimal places, significant figures, fractions, percentages, ratios, probability, standard form ($a \times 10^n$), estimation, and translating between algebraic symbols and numbers.</li>
<li><strong>Measures of central tendency (Pages 4–5):</strong> step-by-step worked calculations and evaluations of the <strong>Mean ($\bar{x}$)</strong>, <strong>Median</strong>, and <strong>Mode</strong>.</li>
<li><strong>Measures of dispersion (Pages 6–7):</strong> step-by-step worked calculations and evaluations of the <strong>Range</strong>, <strong>Interquartile Range (IQR)</strong>, <strong>Variance ($s^2$)</strong>, and <strong>Standard Deviation ($s$)</strong>.</li>
<li><strong>Distributions and Graphical representation (Pages 8–12):</strong> normal, positively skewed and negatively skewed distributions, plus constructing and interpreting frequency tables, bar charts, histograms, line graphs, pie charts and scattergrams.</li>
</ol>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">Why should you always write down every intermediate step of your calculation in a Unit 4 exam question rather than writing only the final number from your calculator?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Calculators are permitted and recommended in Unit 4!"><span class="tutor-checkpoint-key">A</span><span>Because calculators are banned in the Unit 4 exam</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! Multi-mark calculation questions award method marks for correct substitution and intermediate steps; showing every step secures method marks even if a minor rounding slip occurs at the end."><span class="tutor-checkpoint-key">B</span><span>Because WJEC mark schemes award method marks for correct intermediate steps, protecting you against minor arithmetic slips</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Showing your working never loses marks; it gains method marks."><span class="tutor-checkpoint-key">C</span><span>Because writing only the final answer automatically gets zero marks</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Unit 4 includes both calculation questions and extended evaluation questions."><span class="tutor-checkpoint-key">D</span><span>Because there are no words on the Unit 4 paper</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 2, title: "Core numerical skills 1: decimals, significant figures, fractions, percentages and ratios", content: `
<p>Before we calculate means or standard deviations, let us make sure you never lose a mark to a rounding error, a percentage change or a ratio simplification. Walk through each worked example below carefully.</p>
<h4>1. Rounding to decimal places (d.p.) versus significant figures (s.f.)</h4>
<ul>
<li><strong>Decimal places (d.p.):</strong> Count digits strictly to the <em>right of the decimal point</em>. Look at the next digit: if it is $5$ or more, round the final digit up by $1$; if it is $0\text{ to }4$, leave the final digit unchanged.<br>
<em>Worked example:</em> Round $14.3862$ to 2 decimal places.<br>
Step 1: The second digit after the decimal point is $8$ (in $14.38$).<br>
Step 2: The third digit is $6$ (which is $\ge 5$), so round $8$ up to $9 \rightarrow \mathbf{14.39}$.</li>
<li><strong>Significant figures (s.f.):</strong> Start counting from the <em>first non-zero digit</em> reading from left to right.<br>
<em>Worked example A:</em> Round $0.04872$ to 2 significant figures.<br>
Step 1: Leading zeros ($0.0$) are placeholders, not significant. The first significant digit is $4$ and the second is $8$.<br>
Step 2: The next digit is $7$ ($\ge 5$), so $8$ rounds up to $9 \rightarrow \mathbf{0.049}$ (2 s.f.).<br>
<em>Worked example B:</em> Round $36,989$ (Ripke et al. GWAS sample size) to 2 significant figures $\rightarrow$ first two digits are $3$ and $6$; next digit is $9$ ($\ge 5$), so $36$ rounds up to $37$ and remaining places fill with zeros $\rightarrow \mathbf{37,000}$ (2 s.f.).</li>
</ul>
<h4>2. Fractions, percentages, percentage change and ratios</h4>
<ul>
<li><strong>Fraction to percentage:</strong> Divide the numerator by the denominator and multiply by $100$.<br>
<em>Worked example:</em> In Vaughn and Leff (1976), $18$ out of $35$ schizophrenia patients in High-EE households relapsed. What percentage is this to 1 d.p.?<br>
$$\text{Percentage} = \frac{18}{35} \times 100 = 0.51428\dots \times 100 = \mathbf{51.4\%}$$</li>
<li><strong>Percentage change (increase or decrease):</strong><br>
$$\text{Percentage change} = \frac{\text{New value} - \text{Original value}}{\text{Original value}} \times 100$$
<em>Worked example:</em> A student stress-cortisol level dropped from $480\text{ nmol/L}$ before Stress Inoculation Training to $312\text{ nmol/L}$ after training. Calculate the percentage decrease.<br>
$$\text{Change} = \frac{312 - 480}{480} \times 100 = \frac{-168}{480} \times 100 = -0.35 \times 100 = \mathbf{-35\%}\text{ (a 35\% decrease)}$$</li>
<li><strong>Simplifying ratios:</strong> Divide both sides of the ratio by their <em>highest common factor (HCF)</em> until both numbers are whole integers with no common factor greater than $1$.<br>
<em>Worked example:</em> In a clinic, $36$ males and $9$ females are diagnosed with ASD. Express the male-to-female ratio in its simplest form $\rightarrow 36 : 9$. Divide both sides by $9 \rightarrow \mathbf{4 : 1}$.</li>
</ul>
<h3>Practice</h3>
<p>(a) In an obedience replication, $28$ out of $40$ participants obeyed to 150V. Express this as a simplified fraction, a simplified ratio of obedient to defiant participants, and a percentage. (b) Round $0.007461$ to 2 significant figures and to 3 decimal places.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>(a) Fraction: $\frac{28}{40} = \frac{7}{10}$ (dividing top and bottom by 4). Number of defiant participants $= 40 - 28 = 12$, so ratio of obedient to defiant $= 28 : 12 = \mathbf{7 : 3}$ (dividing both sides by 4). Percentage: $\frac{28}{40} \times 100 = \mathbf{70\%}$.<br>(b) To 2 significant figures: start at first non-zero digit ($7$), second digit is $4$, next digit is $6$ ($\ge 5$) $\rightarrow \mathbf{0.0075}$ (2 s.f.). To 3 decimal places: the third digit after the decimal point is $7$, next digit is $4$ ($< 5$) $\rightarrow \mathbf{0.007}$ (3 d.p.).</p></div></details>` },

{ order: 3, title: "Core numerical skills 2: standard form, probability, estimation and mathematical symbols", content: `
<p>The WJEC Unit 4 specification also tests <strong>standard form</strong>, <strong>probability</strong>, <strong>order-of-magnitude estimation</strong> and <strong>mathematical inequality symbols</strong>. Let us make sure every one of these is crystal clear.</p>
<h4>1. Standard form ($a \times 10^n$)</h4>
<p>A number in <strong>standard form</strong> is written as $a \times 10^n$, where $1 \le a \lt 10$ and $n$ is a positive or negative integer indicating how many places the decimal point has moved:</p>
<ul>
<li><strong>Large numbers ($n$ is positive):</strong> Ripke et al. (2014) tested $150,000$ participants in total. Move the decimal point $5$ places left so the front number sits between $1$ and $10$: $150,000 = \mathbf{1.5 \times 10^5}$.</li>
<li><strong>Small numbers ($n$ is negative):</strong> A highly significant GWAS $p$-value of $p = 0.00042$ has the decimal point moved $4$ places right to reach $4.2$: $0.00042 = \mathbf{4.2 \times 10^{-4}}$.</li>
</ul>
<h4>2. Probability ($p$) and statistical significance</h4>
<p>Probability is expressed on a scale from $0$ (impossible) to $1$ (certain), or as a percentage from $0\%$ to $100\%$. In psychology, our standard significance threshold (alpha level) is:</p>
$$\alpha = 0.05 = \frac{5}{100} = \frac{1}{20} = 5\%$$
<p>When we write $p \le 0.05$, it means the probability that our observed result occurred by random chance alone (if the null hypothesis were true) is <strong>less than or equal to 5 percent (1 in 20)</strong>.</p>
<h4>3. Mathematical symbols used in Unit 4</h4>
<table style="width:100%;border-collapse:collapse;margin:1rem 0;font-size:0.95rem;">
<thead>
<tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
<th style="padding:0.55rem;text-align:left;border:1px solid #cbd5e1;">Symbol</th>
<th style="padding:0.55rem;text-align:left;border:1px solid #cbd5e1;">Exact Meaning</th>
<th style="padding:0.55rem;text-align:left;border:1px solid #cbd5e1;">Psychological Example</th>
</tr>
</thead>
<tbody>
<tr><td style="padding:0.55rem;border:1px solid #cbd5e1;font-weight:700;">$=$ and $\approx$</td><td style="padding:0.55rem;border:1px solid #cbd5e1;">Equal to; approximately equal to</td><td style="padding:0.55rem;border:1px solid #cbd5e1;">$\bar{x} = \frac{85}{12} \approx 7.08\text{ words}$</td></tr>
<tr><td style="padding:0.55rem;border:1px solid #cbd5e1;font-weight:700;">$\lt$ and $\le$</td><td style="padding:0.55rem;border:1px solid #cbd5e1;">Strictly less than; less than or equal to</td><td style="padding:0.55rem;border:1px solid #cbd5e1;">$p \le 0.05$; observed $U \le \text{critical } U$</td></tr>
<tr><td style="padding:0.55rem;border:1px solid #cbd5e1;font-weight:700;">$\gt$ and $\ge$</td><td style="padding:0.55rem;border:1px solid #cbd5e1;">Strictly greater than; greater than or equal to</td><td style="padding:0.55rem;border:1px solid #cbd5e1;">Observed $\chi^2 \ge \text{critical }\chi^2$; $r_s \ge 0.380$</td></tr>
<tr><td style="padding:0.55rem;border:1px solid #cbd5e1;font-weight:700;">$\propto$ and $\sum$</td><td style="padding:0.55rem;border:1px solid #cbd5e1;">Proportional to; sum of all values</td><td style="padding:0.55rem;border:1px solid #cbd5e1;">$\bar{x} = \frac{\sum x}{n}$ (sum of all scores $x$ divided by $n$)</td></tr>
<tr><td style="padding:0.55rem;border:1px solid #cbd5e1;font-weight:700;">$\bar{x}$ and $\sqrt{\phantom{x}}$</td><td style="padding:0.55rem;border:1px solid #cbd5e1;">Sample mean; positive square root</td><td style="padding:0.55rem;border:1px solid #cbd5e1;">Standard deviation $s = \sqrt{\text{variance}}$</td></tr>
</tbody>
</table>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">How is a probability of $p = 0.0025$ written in standard form, and is this result statistically significant at the $p \le 0.05$ level?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. A positive power of 10 ($10^3$) equals $2,500$, whereas $0.0025$ moves the decimal 3 places to the right ($10^{-3}$)."><span class="tutor-checkpoint-key">A</span><span>$2.5 \times 10^3$; not significant because $0.0025$ is greater than $0.05$</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! Moving the decimal point 3 places right gives $2.5 \times 10^{-3}$, and because $0.0025$ (0.25%) is much smaller than $0.05$ (5%), the result is highly statistically significant!"><span class="tutor-checkpoint-key">B</span><span>$2.5 \times 10^{-3}$; statistically significant because $0.0025 \le 0.05$</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. In standard form, the front number $a$ must satisfy $1 \le a \lt 10$, so it must be $2.5$, not $25$."><span class="tutor-checkpoint-key">C</span><span>$25 \times 10^{-4}$; not significant</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. $0.0025$ is much smaller than $0.05$, so we reject the null hypothesis."><span class="tutor-checkpoint-key">D</span><span>$2.5 \times 10^{-2}$; not significant</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 4, title: "Measures of central tendency: Mean, Median and Mode", content: `
<p>A <strong>measure of central tendency</strong> summarises an entire dataset with a single typical ("average") value. Study the upper half of the descriptive statistics diagram below, then follow the worked calculations for all three measures.</p>
<figure style="margin:1.4rem 0;text-align:center;"><img src="/lesson-assets/wjec-a2-psychology/psych-unit4-descriptive-stats.png" alt="Six-panel diagram of Unit 4 Descriptive Statistics: Mean, Median, Mode, Range & Interquartile Range, Variance & Standard Deviation, and Core Mathematical Skills." style="width:100%;max-width:100%;border:1px solid #cbd5e1;border-radius:0.75rem;background:#fff;"><figcaption style="margin-top:0.5rem;font-size:0.9rem;color:#475569;text-align:left;">Measures of central tendency, measures of dispersion and core mathematical formulas for Unit 4. Diagram drawn for this course.</figcaption></figure>
<h4>Worked example dataset: word recall scores in background music ($n = 8$ participants)</h4>
<p>Suppose $8$ participants in the vocal-music condition of your experiment recalled the following numbers of words (out of 20): $\{8, 11, 7, 8, 12, 9, 10, 31\}$—notice that Participant 8 accidentally saw the sheet twice and scored an extreme outlier ($31$ is impossible out of 20, or let us say on a 40-word extended test they scored $31$ while everyone else scored $7\text{ to }12$!).</p>
<ol>
<li><strong>The Mean ($\bar{x}$):</strong> Add all scores together ($\sum x$) and divide by the number of scores ($n$):
$$\bar{x} = \frac{\sum x}{n} = \frac{8 + 11 + 7 + 8 + 12 + 9 + 10 + 31}{8} = \frac{96}{8} = \mathbf{12.0\text{ words}}$$
  <ul>
  <li><em>Strength:</em> Most sensitive measure because it includes the exact mathematical value of every score in the dataset.</li>
  <li><em>Weakness:</em> Severely distorted by <strong>extreme outliers / skewed data</strong>! Notice here that $7$ of the $8$ participants scored between $7$ and $12$, yet the single outlier of $31$ dragged the mean up to $12.0$ (equal to the second-highest person in the group!). Requires interval/ratio data.</li>
  </ul>
</li>
<li><strong>The Median:</strong> Place all scores in <strong>ascending rank order from lowest to highest</strong> and find the middle value (at position $\frac{n + 1}{2}$). If $n$ is odd, it is the single middle score; if $n$ is even, it is the midpoint (mean) of the two central scores.<br>
Step 1 (Order our 8 scores): $7,\; 8,\; 8,\; \mathbf{9,\; 10},\; 11,\; 12,\; 31$.<br>
Step 2 (Find the midpoint of the 4th and 5th scores, $9$ and $10$):
$$\text{Median} = \frac{9 + 10}{2} = \mathbf{9.5\text{ words}}$$
  <ul>
  <li><em>Strength:</em> Completely <strong>unaffected by extreme outliers or skewed distributions</strong> ($9.5$ represents the typical participant far more accurately than the mean of $12.0$!), and can be used with ordinal data.</li>
  <li><em>Weakness:</em> Less sensitive than the mean because the exact magnitudes of extreme scores are ignored once ordered.</li>
  </ul>
</li>
<li><strong>The Mode:</strong> The score or category that occurs <strong>most frequently</strong>. In our ordered list ($7, \mathbf{8, 8}, 9, 10, 11, 12, 31$), the score $8$ appears twice while all others appear once, so $\text{Mode} = \mathbf{8\text{ words}}$. (If two values tie for highest frequency, the data are <em>bimodal</em>; if every value appears once, there is no mode.)
  <ul>
  <li><em>Strength &amp; weakness:</em> The <strong>only</strong> measure of central tendency that can be used with nominal categorical data (e.g. most frequent attribution category in post-match interviews), but crude and unstable in small continuous datasets.</li>
  </ul>
</li>
</ol>
<h3>Practice</h3>
<p>Calculate the mean, median and mode for the following $7$ reaction-time scores (in milliseconds): $\{340, 310, 350, 310, 330, 360, 820\}$, and state with justification which measure best represents this dataset.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p><strong>Step 1 (Mean):</strong> $\sum x = 340 + 310 + 350 + 310 + 330 + 360 + 820 = 2,820\text{ ms}$. Divide by $n = 7$: $\bar{x} = \frac{2820}{7} = \mathbf{402.86\text{ ms}}$ (2 d.p.).<br><strong>Step 2 (Median):</strong> Put the $7$ scores in ascending order: $310,\; 310,\; 330,\; \mathbf{340},\; 350,\; 360,\; 820$. Since $n = 7$ is odd, the middle score is at position $\frac{7 + 1}{2} = 4\text{th score} \rightarrow \text{Median} = \mathbf{340\text{ ms}}$.<br><strong>Step 3 (Mode):</strong> The value $310\text{ ms}$ appears twice $\rightarrow \text{Mode} = \mathbf{310\text{ ms}}$.<br><strong>Best measure:</strong> The <strong>median ($340\text{ ms}$)</strong> is the most representative measure of central tendency here because six of the seven participants reacted between $310\text{ ms}$ and $360\text{ ms}$, whereas the single extreme outlier of $820\text{ ms}$ (a momentary lapse of attention) severely distorts the mean upward to $402.86\text{ ms}$, and the mode ($310\text{ ms}$) sits right at the fastest extreme of the group.</p></div></details>` },

{ order: 5, title: "Measures of dispersion 1: Range and Interquartile Range (IQR)", content: `
<p>Why is a measure of central tendency never enough on its own in a Results section? Imagine two classes both have a mean exam score of $50\%$: in Class A everyone scored between $48\%$ and $52\%$, whereas in Class B half the class scored $95\%$ and half scored $5\%$! To describe how spread out or consistent a dataset is, we must pair central tendency with a <strong>measure of dispersion</strong>.</p>
<h4>1. The Range</h4>
<p>The <strong>Range</strong> is the difference between the highest score ($x_{\max}$) and the lowest score ($x_{\min}$) in the dataset:</p>
$$\text{Range} = x_{\max} - x_{\min}$$
<p><em>(Note: some psychology textbooks add $+1$ when whole-number scores represent rounded continuous intervals; in WJEC Unit 4, always show $x_{\max} - x_{\min}$ clearly, as the mark scheme credits the direct difference.)</em></p>
<ul>
<li><em>Worked example:</em> For our 7 reaction-time scores $\{310, 310, 330, 340, 350, 360, 820\}$, $\text{Range} = 820 - 310 = \mathbf{510\text{ ms}}$.</li>
<li><em>Strength &amp; weakness:</em> Quick and easy to calculate, but because it relies entirely on the two most extreme scores, a <strong>single outlier</strong> inflates the range massively (without the $820\text{ ms}$ outlier, the range of the other six participants was only $360 - 310 = 50\text{ ms}$!).</li>
</ul>
<h4>2. The Interquartile Range (IQR) — companion to the Median</h4>
<p>When data are ordinal or skewed by outliers, we pair the <strong>Median</strong> with the <strong>Interquartile Range (IQR)</strong>, which measures the spread of the <strong>middle 50 percent of scores</strong> by subtracting the lower quartile ($Q_1$, the 25th percentile) from the upper quartile ($Q_3$, the 75th percentile):</p>
$$\text{IQR} = Q_3 - Q_1$$
<p><em>Worked example ($n = 11$ sleep-duration scores in minutes, ordered from lowest to highest):</em></p>
$$360,\; 380,\; \mathbf{390},\; 400,\; 410,\; \underline{420},\; 430,\; 440,\; \mathbf{450},\; 470,\; 590$$
<ol>
<li><strong>Step 1 (Find the Median, $Q_2$):</strong> At position $\frac{11 + 1}{2} = 6\text{th score} \rightarrow Q_2 = 420\text{ min}$.</li>
<li><strong>Step 2 (Find the Lower Quartile, $Q_1$):</strong> The median of the lower half (the 5 scores below $420$: $360, 380, \mathbf{390}, 400, 410$) is the 3rd score $\rightarrow Q_1 = 390\text{ min}$ (also given by position $\frac{n + 1}{4} = \frac{12}{4} = 3\text{rd score}$).</li>
<li><strong>Step 3 (Find the Upper Quartile, $Q_3$):</strong> The median of the upper half (the 5 scores above $420$: $430, 440, \mathbf{450}, 470, 590$) is the 9th score $\rightarrow Q_3 = 450\text{ min}$ (position $\frac{3(n + 1)}{4} = 9\text{th score}$).</li>
<li><strong>Step 4 (Subtract $Q_3 - Q_1$):</strong> $\text{IQR} = 450 - 390 = \mathbf{60\text{ minutes}}$. Notice how the outlier of $590\text{ min}$ made the full Range $= 590 - 360 = 230\text{ min}$, whereas the IQR ($60\text{ min}$) stayed completely unaffected!</li>
</ol>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">Why is the Interquartile Range (IQR) preferred over the Range when a dataset contains an extreme outlier?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. The Range uses only the highest and lowest scores; the Standard Deviation uses every score."><span class="tutor-checkpoint-key">A</span><span>Because the IQR multiplies every score by 100</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! By trimming off the bottom 25% and top 25% of ordered scores and measuring only $Q_3 - Q_1$ (the middle 50%), the IQR is completely unaffected by extreme outliers at either end."><span class="tutor-checkpoint-key">B</span><span>Because the IQR measures the spread of the middle 50% of ordered scores ($Q_3 - Q_1$), excluding extreme outliers in the top and bottom quarters</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Nominal data have no numerical order, so neither Range nor IQR can be calculated on nominal categories."><span class="tutor-checkpoint-key">C</span><span>Because the IQR can be calculated on nominal categories like eye colour</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. The IQR is always smaller than or equal to the full Range."><span class="tutor-checkpoint-key">D</span><span>Because the IQR is always larger than the full Range</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 6, title: "Measures of dispersion 2: Variance and Standard Deviation step by step", content: `
<p>The most precise and sensitive measure of dispersion in psychology—paired with the <strong>Mean ($\bar{x}$)</strong> for interval/ratio data—is the <strong>Standard Deviation ($s$ or $\text{SD}$)</strong>, which measures the average distance by which every score in a dataset deviates from the group mean, alongside its squared partner, the <strong>Variance ($s^2$)</strong>.</p>
<h4>1. The formulas for Variance ($s^2$) and Standard Deviation ($s$)</h4>
<p>In WJEC examinations, you may see the sample formula written with $n - 1$ (Bessel correction for an unbiased sample estimate) or $n$ (population/descriptive form)—the exam paper always supplies the formula if you are asked to calculate it from scratch, and both are simple when broken into four table columns:</p>
$$\text{Variance } (s^2) = \frac{\sum (x - \bar{x})^2}{n - 1} \quad\text{and}\quad \text{Standard Deviation } (s) = \sqrt{\frac{\sum (x - \bar{x})^2}{n - 1}}$$
<p><em>(Wait: why do we square each deviation $(x - \bar{x})$ before adding them up? Because scores below the mean have negative deviations and scores above the mean have positive deviations that would cancel out to zero if we added them without squaring!)</em></p>
<h4>2. Complete step-by-step worked example ($n = 5$ anagram scores)</h4>
<p>Five participants solved the following numbers of anagrams in two minutes: $\{6, 8, 10, 12, 14\}$. Calculate the mean, variance and standard deviation.</p>
<ol>
<li><strong>Step 1 — Calculate the mean ($\bar{x}$):</strong>
$$\bar{x} = \frac{6 + 8 + 10 + 12 + 14}{5} = \frac{50}{5} = \mathbf{10}$$</li>
<li><strong>Step 2 — Subtract the mean from each score ($x - \bar{x}$) and square each result $(x - \bar{x})^2$:</strong>
  <ul>
  <li>Score $6$: $6 - 10 = -4 \rightarrow (-4)^2 = \mathbf{16}$</li>
  <li>Score $8$: $8 - 10 = -2 \rightarrow (-2)^2 = \mathbf{4}$</li>
  <li>Score $10$: $10 - 10 = 0 \rightarrow (0)^2 = \mathbf{0}$</li>
  <li>Score $12$: $12 - 10 = +2 \rightarrow (+2)^2 = \mathbf{4}$</li>
  <li>Score $14$: $14 - 10 = +4 \rightarrow (+4)^2 = \mathbf{16}$</li>
  </ul>
</li>
<li><strong>Step 3 — Sum the squared deviations $\sum (x - \bar{x})^2$:</strong>
$$\sum (x - \bar{x})^2 = 16 + 4 + 0 + 4 + 16 = \mathbf{40}$$</li>
<li><strong>Step 4 — Divide by $n - 1$ to get Variance ($s^2$), then take the square root to get Standard Deviation ($s$):</strong>
$$\text{Variance } (s^2) = \frac{40}{5 - 1} = \frac{40}{4} = \mathbf{10.0}$$
$$\text{Standard Deviation } (s) = \sqrt{10.0} = \mathbf{3.16}\text{ (to 2 d.p.)}$$
<em>(Note: if a question specifies dividing by $n = 5$ instead of $n - 1$, then $s^2 = \frac{40}{5} = 8.0$ and $s = \sqrt{8.0} = 2.83$.)</em></li>
</ol>
<h4>3. How to interpret Standard Deviation in an exam question</h4>
<p>This is a classic 2-mark Unit 4 question! Suppose Silence has $\text{Mean} = 14.2, \text{SD} = 1.4$ and Vocal Music has $\text{Mean} = 9.8, \text{SD} = 4.5$:</p>
<ul>
<li>A <strong>small SD ($1.4$)</strong> means participants scores were <strong>tightly clustered</strong> around the mean—almost everyone in the Silence condition performed consistently close to $14.2$ words.</li>
<li>A <strong>large SD ($4.5$)</strong> means participants scores were <strong>widely spread out (dispersed)</strong> around the mean—some participants in the Music condition were heavily distracted while others were unaffected (individual differences or an outlier).</li>
</ul>
<h3>Practice</h3>
<p>Calculate the mean, variance ($s^2$, dividing by $n - 1$) and standard deviation ($s$, to 2 d.p.) for the following $5$ sleep scores (in hours): $\{5, 6, 7, 8, 9\}$.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p><strong>Step 1 (Mean):</strong> $\bar{x} = \frac{5 + 6 + 7 + 8 + 9}{5} = \frac{35}{5} = \mathbf{7\text{ hours}}$.<br><strong>Step 2 (Deviations and squared deviations):</strong> $(5-7)^2 = (-2)^2 = 4$; $(6-7)^2 = (-1)^2 = 1$; $(7-7)^2 = 0^2 = 0$; $(8-7)^2 = (+1)^2 = 1$; $(9-7)^2 = (+2)^2 = 4$.<br><strong>Step 3 (Sum of squares):</strong> $\sum (x - \bar{x})^2 = 4 + 1 + 0 + 1 + 4 = \mathbf{10}$.<br><strong>Step 4 (Variance and SD):</strong> $\text{Variance } s^2 = \frac{10}{5 - 1} = \frac{10}{4} = \mathbf{2.5\text{ hours}^2}$. $\text{Standard Deviation } s = \sqrt{2.5} = \mathbf{1.58\text{ hours}}$ (to 2 d.p.).</p></div></details>` },

{ order: 7, title: "Normal and skewed distributions: how Mean, Median and Mode line up", content: `
<p>When we plot the frequency of continuous scores across a large population, the shape of the curve tells us immediately whether the data are <strong>normally distributed</strong> or <strong>skewed</strong>. Study the top panel of the distributions and graphs diagram below.</p>
<figure style="margin:1.4rem 0;text-align:center;"><img src="/lesson-assets/wjec-a2-psychology/psych-unit4-distributions-graphs.png" alt="Six-panel diagram of Unit 4 Distributions and Graphs: Normal vs Skewed Distributions (positive and negative skew), Bar Chart, Histogram, Line Graph / Frequency Polygon, Scattergram, and Pie Chart & Frequency Table." style="width:100%;max-width:100%;border:1px solid #cbd5e1;border-radius:0.75rem;background:#fff;"><figcaption style="margin-top:0.5rem;font-size:0.9rem;color:#475569;text-align:left;">Normal and skewed distributions alongside the five graph types tested in Unit 4. Diagram drawn for this course.</figcaption></figure>
<h4>1. The Normal Distribution (Gaussian bell curve)</h4>
<p>Many biological and psychological traits in large populations—such as height, Wechsler IQ scores ($\text{Mean} = 100, \text{SD} = 15$) and baseline reaction time—follow a <strong>normal distribution</strong>:</p>
<ul>
<li>The curve is <strong>symmetrical and bell-shaped</strong> around the centre.</li>
<li>The <strong>Mean, Median and Mode are identical</strong> and sit at the exact central peak ($\text{Mean} = \text{Median} = \text{Mode}$).</li>
<li><strong>The 68–95–99.7% empirical rule:</strong> Approximately <strong>68.26%</strong> of all scores fall within $\pm 1\text{ SD}$ of the mean (e.g. IQ $85\text{ to }115$); approximately <strong>95.44%</strong> fall within $\pm 2\text{ SDs}$ (IQ $70\text{ to }130$); and <strong>99.73%</strong> fall within $\pm 3\text{ SDs}$. The tails approach the horizontal axis asymptotically without ever touching zero.</li>
</ul>
<h4>2. Positively skewed versus Negatively skewed distributions</h4>
<p>Memory trick: <strong>the name of the skew always follows the direction of the long tail</strong> (not the high hump!), and the <strong>Mean is always pulled furthest into the tail</strong> by the extreme scores, while the Mode stays at the highest peak and the Median sits in the middle between them!</p>
<ol>
<li><strong>Positively skewed distribution (long tail points to the right / high positive numbers):</strong>
  <ul>
  <li><em>When it happens:</em> Most participants get low scores and only a few get very high scores—for example, when an exam test is <strong>too hard (a floor effect)</strong>, or when measuring reaction times or income.</li>
  <li><em>Order of averages from left to right:</em> $\mathbf{\text{Mode} \lt \text{Median} \lt \text{Mean}}$ (the high outliers in the right tail pull the Mean up above the Median).</li>
  </ul>
</li>
<li><strong>Negatively skewed distribution (long tail points to the left / low numbers):</strong>
  <ul>
  <li><em>When it happens:</em> Most participants get very high scores and only a few get very low scores—for example, when an exam test is <strong>too easy (a ceiling effect)</strong> and almost everyone scores $18\text{ to }20$ out of $20$.</li>
  <li><em>Order of averages from left to right:</em> $\mathbf{\text{Mean} \lt \text{Median} \lt \text{Mode}}$ (the few low outliers in the left tail pull the Mean down below the Median).</li>
  </ul>
</li>
</ol>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">In a memory experiment out of 20 words, a researcher calculates $\text{Mean} = 13.2$, $\text{Median} = 16.0$, and $\text{Mode} = 18.0$. What type of distribution is this, and what caused it?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. In a normal distribution, the Mean, Median and Mode are all equal ($16, 16, 16$)."><span class="tutor-checkpoint-key">A</span><span>A perfectly symmetrical normal distribution</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! Because $\text{Mean} (13.2) \lt \text{Median} (16.0) \lt \text{Mode} (18.0)$, most participants scored near the top (18/20—a ceiling effect because the test was too easy) while a few low scores pulled the Mean down into the left tail (a negative skew)."><span class="tutor-checkpoint-key">B</span><span>A negatively skewed distribution caused by an easy task (ceiling effect) where a few low scores pulled the mean down</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. In a positive skew, $\text{Mode} \lt \text{Median} \lt \text{Mean}$ (the mean is the highest value, not the lowest)."><span class="tutor-checkpoint-key">C</span><span>A positively skewed distribution caused by a task that was too hard (floor effect)</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. A bimodal distribution has two modes, whereas here we are comparing the order of Mean, Median and Mode."><span class="tutor-checkpoint-key">D</span><span>A uniform flat line with zero dispersion</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 8, title: "Graphical representation 1: Frequency tables, Bar charts and Histograms", content: `
<p>In Unit 4 Section B, you can be asked to construct a graph from a table, spot errors in a poorly drawn graph, or explain which graph is appropriate for a dataset. Let us master <strong>frequency tables</strong>, <strong>bar charts</strong> and <strong>histograms</strong> first.</p>
<h4>1. Frequency tables (tallying and grouping data)</h4>
<p>A <strong>frequency table</strong> organises raw data by listing each category or class interval in the first column, a tally in the second column, and the frequency count ($f$) in the third column. When grouping continuous scores into class intervals (e.g. reaction times in ms), intervals must be <strong>equal in width and mutually exclusive with zero overlap</strong>: write $100\text{–}149,\; 150\text{–}199,\; 200\text{–}249$ (never write $100\text{–}150,\; 150\text{–}200$, because where would a score of $150$ go?).</p>
<h4>2. Bar charts versus Histograms (never confuse these two!)</h4>
<table style="width:100%;border-collapse:collapse;margin:1rem 0;font-size:0.95rem;">
<thead>
<tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
<th style="padding:0.6rem;text-align:left;border:1px solid #cbd5e1;">Feature</th>
<th style="padding:0.6rem;text-align:left;border:1px solid #cbd5e1;">Bar Chart</th>
<th style="padding:0.6rem;text-align:left;border:1px solid #cbd5e1;">Histogram</th>
</tr>
</thead>
<tbody>
<tr>
<td style="padding:0.6rem;border:1px solid #cbd5e1;font-weight:600;">Type of data on x-axis</td>
<td style="padding:0.6rem;border:1px solid #cbd5e1;"><strong>Discrete / categorical (nominal or ordinal) conditions</strong> (e.g. "Silence" vs "Vocal Music", or "Winning" vs "Losing" managers).</td>
<td style="padding:0.6rem;border:1px solid #cbd5e1;"><strong>Continuous interval/ratio data grouped into class intervals</strong> along a continuous number scale (e.g. sleep duration $300\text{–}359,\; 360\text{–}419,\; 420\text{–}479\text{ min}$).</td>
</tr>
<tr>
<td style="padding:0.6rem;border:1px solid #cbd5e1;font-weight:600;">Spacing between bars</td>
<td style="padding:0.6rem;border:1px solid #cbd5e1;"><strong>Spaces (gaps) between bars</strong> to show the categories are separate and discontinuous.</td>
<td style="padding:0.6rem;border:1px solid #cbd5e1;"><strong>Bars touch with zero gaps</strong> because the horizontal scale is continuous (where one interval ends, the next immediately begins).</td>
</tr>
<tr>
<td style="padding:0.6rem;border:1px solid #cbd5e1;font-weight:600;">What the y-axis shows</td>
<td style="padding:0.6rem;border:1px solid #cbd5e1;">Category frequency, percentage, or group summary statistic (e.g. Mean words recalled out of 20).</td>
<td style="padding:0.6rem;border:1px solid #cbd5e1;">Frequency (or frequency density when class intervals differ in width; area of bar represents frequency).</td>
</tr>
</tbody>
</table>
<h4>Checklist for full marks when drawing any graph in Unit 4</h4>
<ol>
<li>Write a <strong>fully operationalised title</strong> at the top naming the graph type and both variables (e.g. <em>"A bar chart showing the mean number of two-syllable nouns recalled (out of 20) in silence versus vocal pop music at 60 dB"</em>).</li>
<li><strong>Label both axes clearly with units</strong> (e.g. x-axis: <em>"Background acoustic condition"</em>; y-axis: <em>"Mean number of words recalled (out of 20)"</em>).</li>
<li>Use a <strong>linear, evenly spaced scale</strong> starting at $0$ on the y-axis, and plot bar heights accurately to the nearest half grid-square using a sharp pencil and ruler.</li>
</ol>
<h3>Practice</h3>
<p>A student draws a graph with touching bars (no gaps) to show the mean anxiety score of patients in three separate therapies: CBT, Drug therapy, and Family therapy. Identify the error and explain why it is wrong.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>The student has drawn touching bars as if the graph were a histogram, when it should be a <strong>bar chart with distinct gaps between the bars</strong>. The three therapy conditions on the x-axis (CBT, Drug therapy, Family therapy) are discrete, separate nominal categories rather than a continuous numerical scale of class intervals; leaving spaces between the bars visually represents that the categories are discontinuous.</p></div></details>` },

];