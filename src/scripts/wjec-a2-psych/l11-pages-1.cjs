/*
 * WJEC A2 Psychology — Unit 4: Applied Research Methods
 * Lesson 11: Descriptive Statistics, Distributions and Graphical Representation
 * (15 pages), part 1 (pages 1-8).
 * Diagrams: /lesson-assets/wjec-a2-psychology/*.png (render-unit4-l11.cjs).
 * Exports {order,title,content}.
 */
module.exports = [

{ order: 1, title: "Why psychologists use descriptive statistics and quantitative skills", content: `
<p>Imagine you have just finished running your Unit 4 experiment on language and music with 24 participants, and you are staring at a clipboard covered in 24 individual recall scores. Can you see at a glance whether the silence group outperformed the music group, or whether one distracted student dragged the whole group score down? Raw data tables are too noisy for the human eye to interpret directly. <strong>Descriptive statistics</strong> summarise a raw dataset using two complementary numbers—a <strong>measure of central tendency</strong> (the typical middle value) and a <strong>measure of dispersion</strong> (how spread out the scores are around that middle)—supported by visual graphs and distribution curves.</p>
<p>At least <strong>10 percent of the marks across A-level Psychology</strong> assess mathematical and quantitative skills (brought together in Unit 4). Look at the complete quantitative toolkit we will master step by step in Lesson 11:</p>
<ol>
<li><strong>Core numerical skills (Page 2):</strong> ratios, fractions, percentages, percentage change, arithmetic means, standard form, decimal places and significant figures.</li>
<li><strong>Measures of central tendency (Pages 3–4):</strong> calculating, choosing and evaluating the <strong>Mean ($\bar{x}$)</strong>, <strong>Median</strong> and <strong>Mode</strong>.</li>
<li><strong>Measures of dispersion (Pages 5–6):</strong> calculating, choosing and evaluating the <strong>Range</strong>, <strong>Interquartile Range (IQR)</strong>, <strong>Semi-Interquartile Range (SIQR)</strong> and <strong>Standard Deviation ($s$ / $\sigma$)</strong>.</li>
<li><strong>Distributions (Pages 7–8):</strong> <strong>Normal (Gaussian) bell curves</strong> versus <strong>positively skewed</strong> and <strong>negatively skewed</strong> distributions.</li>
<li><strong>Graphical representation (Pages 9–11):</strong> frequency tables, <strong>bar charts</strong>, <strong>histograms</strong>, <strong>line graphs (frequency polygons)</strong>, <strong>pie charts (360° angles)</strong> and <strong>scattergrams</strong>.</li>
</ol>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">Why should a psychologist always report a measure of dispersion (such as the standard deviation) alongside a measure of central tendency (such as the mean)?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. The mean and standard deviation are descriptive statistics; p-values come from inferential statistical tests."><span class="tutor-checkpoint-key">A</span><span>Because the mean alone tells you the p-value of the study</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! Two conditions can have the exact same mean (e.g. 12.0 words), yet one group may be tightly clustered around 12 (low SD, consistent effect) while the other ranges wildly from 1 to 20 (high SD, inconsistent scores or outliers)."><span class="tutor-checkpoint-key">B</span><span>Because the mean shows the typical average score, while dispersion reveals whether scores are tightly clustered (consistent) or widely spread out around that average</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Reporting both is standard scientific practice in every quantitative study."><span class="tutor-checkpoint-key">C</span><span>Because the mean is only used for nominal category data</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Standard deviation measures the spread of scores, not the number of participants."><span class="tutor-checkpoint-key">D</span><span>Because the standard deviation is always equal to the sample size N</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 2, title: "Core mathematical skills: ratios, percentages, rounding and significant figures", content: `
<p>In Section B of Unit 4, the first 2 to 4 marks on a data question often ask you to calculate a <strong>percentage</strong>, a <strong>percentage decrease/increase</strong>, a <strong>ratio in its simplest form</strong>, or to round a result to <strong>2 decimal places (2 d.p.)</strong> or <strong>2 significant figures (2 s.f.)</strong>. Let us work through each calculation with zero steps skipped.</p>
<h4>Worked Example 1: Ratios, fractions and percentages</h4>
<p>In a content analysis of 45 post-match interviews after a defeat, 30 managers blamed external factors (the referee or pitch) and 15 managers blamed internal tactical errors.</p>
<ul>
<li><strong>Ratio of external to internal attributions in simplest form:</strong> Write $30 : 15$. Divide both sides by their highest common factor ($15$): $\frac{30}{15} : \frac{15}{15} = \mathbf{2 : 1}$.</li>
<li><strong>Fraction and percentage making external attributions:</strong> As a fraction, $\frac{30}{45} = \frac{2}{3}$. As a percentage: $\frac{30}{45} \times 100 = 66.666\dots\% = \mathbf{66.67\%\text{ (to 2 d.p.)}}$ or $\mathbf{67\%\text{ (to 2 s.f.)}}$.</li>
</ul>
<h4>Worked Example 2: Percentage change (increase or decrease)</h4>
<p>In a Stress Inoculation Training study, a participant mean state-anxiety score fell from $48.0$ before therapy to $31.2$ after therapy. Calculate the <strong>percentage decrease</strong> in anxiety:</p>
<p>$$\text{Percentage change} = \frac{\text{Change}}{\text{Original value}} \times 100 = \frac{48.0 - 31.2}{48.0} \times 100 = \frac{16.8}{48.0} \times 100 = 0.35 \times 100 = \mathbf{35\%\text{ decrease}}$$</p>
<h4>Worked Example 3: Decimal places (d.p.), significant figures (s.f.) and standard form</h4>
<ul>
<li><strong>Rounding to 2 decimal places (2 d.p.):</strong> Look at the <em>third</em> digit after the decimal point. If it is $5$ or more, round the second decimal digit up by $1$. Thus $14.3862 \rightarrow \mathbf{14.39}$ (2 d.p.); $0.0481 \rightarrow \mathbf{0.05}$ (2 d.p.).</li>
<li><strong>Rounding to 2 significant figures (2 s.f.):</strong> Start counting from the <em>first non-zero digit</em> on the left! In $0.0481$, the leading zeros are placeholders; the first significant digit is $4$ and the second is $8$ (followed by $1$, which is less than $5$), giving $\mathbf{0.048}$ (2 s.f.). In $14,620$, the first two significant digits are $1$ and $4$ (followed by $6 \ge 5$), giving $\mathbf{15,000}$ (2 s.f.).</li>
<li><strong>Standard form ($a \times 10^n$ where $1 \le a \lt 10$):</strong> A GWAS $p$-value of $0.000042 = \mathbf{4.2 \times 10^{-5}}$; a sample of $36,900 = \mathbf{3.69 \times 10^4}$.</li>
</ul>
<h3>Practice</h3>
<p>In a language-and-music experiment, the mean recall score was $15.0$ words in Silence and $11.4$ words in Vocal Music. (a) Express the ratio of Silence mean to Vocal Music mean in its simplest whole-number form. (b) Calculate the percentage decrease in mean recall from Silence to Vocal Music, giving your answer to 1 decimal place.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>(a) Multiply both sides of $15.0 : 11.4$ by $10$ to clear the decimal: $150 : 114$. Divide both numbers by their highest common factor ($6$): $\frac{150}{6} = 25$ and $\frac{114}{6} = 19$, giving the simplest whole-number ratio $\mathbf{25 : 19}$.<br>(b) $\text{Decrease} = 15.0 - 11.4 = 3.6\text{ words}$. Divide by the original Silence value ($15.0$) and multiply by $100$: $\frac{3.6}{15.0} \times 100 = 0.24 \times 100 = \mathbf{24.0\%}$ decrease.</p></div></details>` },

{ order: 3, title: "Measures of central tendency: calculating Mean, Median and Mode", content: `
<p>Study the left panel of the diagram below, then let us work through the exact step-by-step calculation of all three measures of central tendency on a realistic psychological dataset.</p>
<figure style="margin:1.4rem 0;text-align:center;"><img src="/lesson-assets/wjec-a2-psychology/psych-unit4-descriptive-stats.png" alt="Three-panel diagram of descriptive statistics: measures of central tendency (Mean, Median, Mode with formulas), measures of dispersion (Range, IQR, Standard Deviation with formulas), and worked calculation table on n=6 reaction-time scores." style="width:100%;max-width:100%;border:1px solid #cbd5e1;border-radius:0.75rem;background:#fff;"><figcaption style="margin-top:0.5rem;font-size:0.9rem;color:#475569;text-align:left;">Unit 4 Descriptive Statistics: Central tendency, dispersion and worked variance/SD table. Diagram drawn for this course.</figcaption></figure>
<h4>Step-by-step worked example: odd vs even sample sizes</h4>
<p>Suppose Group A ($n = 7$ participants) recalled the following number of words out of 20 in the vocal music condition:</p>
<p style="text-align:center;font-weight:600;">Raw scores: $11,\; 8,\; 14,\; 8,\; 10,\; 12,\; 7$</p>
<ol>
<li><strong>Calculating the Mean ($\bar{x} = \frac{\sum x}{n}$):</strong>
  <ul>
  <li>Step 1 (Sum all scores, $\sum x$): $11 + 8 + 14 + 8 + 10 + 12 + 7 = 70$.</li>
  <li>Step 2 (Divide by the number of scores, $n = 7$): $\bar{x} = \frac{70}{7} = \mathbf{10.0\text{ words}}$.</li>
  </ul>
</li>
<li><strong>Calculating the Median (middle value when ranked in ascending order):</strong>
  <ul>
  <li>Step 1 (Always rank the scores from smallest to largest first—forgetting to rank is the #1 exam mistake!): $7,\; 8,\; 8,\; \mathbf{10},\; 11,\; 12,\; 14$.</li>
  <li>Step 2 (Find the middle position, $\frac{n+1}{2}$): With $n = 7$ (odd), position $\frac{7+1}{2} = 4\text{th score}$, which is $\mathbf{10}$.</li>
  <li><em>What if $n$ is even?</em> Suppose an 8th participant scored $20$, giving ranked scores: $7,\; 8,\; 8,\; \mathbf{10,\; 11},\; 12,\; 14,\; 20$. With $n = 8$, the middle lies halfway between the 4th score ($10$) and the 5th score ($11$): $\text{Median} = \frac{10 + 11}{2} = \mathbf{10.5\text{ words}}$.</li>
  </ul>
</li>
<li><strong>Finding the Mode (most frequent score):</strong>
  <ul>
  <li>In our ranked dataset ($7, 8, 8, 10, 11, 12, 14$), the score $8$ appears twice while every other number appears once, so $\text{Mode} = \mathbf{8\text{ words}}$ (unimodal). If two scores tie for highest frequency, the dataset is <em>bimodal</em>; if every score appears once, there is no mode.</li>
  </ul>
</li>
</ol>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">Calculate the median of the following six reaction-time scores (in milliseconds): $310,\; 240,\; 290,\; 250,\; 480,\; 270$.</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Did you forget to put the scores into ascending order first? Ranking them gives: 240, 250, 270, 290, 310, 480."><span class="tutor-checkpoint-key">A</span><span>270 ms</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! Ranked in ascending order: 240, 250, 270, 290, 310, 480. With n = 6 (even), the median is the mean of the 3rd (270) and 4th (290) scores: (270 + 290) / 2 = 280 ms."><span class="tutor-checkpoint-key">B</span><span>280 ms</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. 306.7 ms is the arithmetic mean (1840 / 6), which is pulled upward by the extreme outlier 480 ms!"><span class="tutor-checkpoint-key">C</span><span>306.7 ms</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Remember to rank the six scores first before finding the average of the two middle values."><span class="tutor-checkpoint-key">D</span><span>385 ms</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 4, title: "Evaluating and choosing between Mean, Median and Mode", content: `
<p>In Unit 4, you are frequently asked: <em>"Explain why the median would be a more appropriate measure of central tendency than the mean for this dataset."</em> Let us compare the three measures across level of measurement, sensitivity and resistance to outliers.</p>
<table style="width:100%;border-collapse:collapse;margin:1.2rem 0;font-size:0.95rem;">
<thead>
<tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
<th style="padding:0.65rem;text-align:left;border:1px solid #cbd5e1;">Measure</th>
<th style="padding:0.65rem;text-align:left;border:1px solid #cbd5e1;">Required Level of Data</th>
<th style="padding:0.65rem;text-align:left;border:1px solid #cbd5e1;">Strengths</th>
<th style="padding:0.65rem;text-align:left;border:1px solid #cbd5e1;">Weaknesses</th>
</tr>
</thead>
<tbody>
<tr>
<td style="padding:0.65rem;border:1px solid #cbd5e1;font-weight:600;">Mean ($\bar{x}$)</td>
<td style="padding:0.65rem;border:1px solid #cbd5e1;"><strong>Interval / Ratio</strong> (continuous numerical scales with equal intervals).</td>
<td style="padding:0.65rem;border:1px solid #cbd5e1;">Most sensitive and representative measure because its calculation includes the exact numerical value of <strong>every single score</strong> in the dataset; links directly to standard deviation.</td>
<td style="padding:0.65rem;border:1px solid #cbd5e1;">Easily <strong>distorted (skewed) by extreme outliers</strong> (anomalous scores), producing an unrepresentative average; cannot be used with nominal categories or open-ended intervals.</td>
</tr>
<tr>
<td style="padding:0.65rem;border:1px solid #cbd5e1;font-weight:600;">Median</td>
<td style="padding:0.65rem;border:1px solid #cbd5e1;"><strong>Ordinal</strong> (or skewed Interval / Ratio data).</td>
<td style="padding:0.65rem;border:1px solid #cbd5e1;"><strong>Completely unaffected by extreme outliers</strong> or skewed tails because it depends only on the middle rank position; easier to compute on small ranked sets.</td>
<td style="padding:0.65rem;border:1px solid #cbd5e1;">Less sensitive than the mean because the exact magnitudes of all scores above and below the middle rank are ignored.</td>
</tr>
<tr>
<td style="padding:0.65rem;border:1px solid #cbd5e1;font-weight:600;">Mode</td>
<td style="padding:0.65rem;border:1px solid #cbd5e1;"><strong>Nominal</strong> (discrete categories, or any level).</td>
<td style="padding:0.65rem;border:1px solid #cbd5e1;">The <strong>only</strong> measure of central tendency that can be used with nominal categorical data (e.g. most frequent attribution category); always equals a real whole score in the dataset.</td>
<td style="padding:0.65rem;border:1px solid #cbd5e1;">Crude and unreliable in small continuous samples (may have no mode or multiple modes; shifting a single score can change the mode dramatically).</td>
</tr>
</tbody>
</table>
<h4>How to spot an outlier in a Unit 4 exam table</h4>
<p>Whenever a Unit 4 question shows you a table of raw scores for two conditions and asks you to evaluate the use of the mean, <strong>scan every row of the table immediately for an anomalous extreme score (outlier)</strong>! For example, if Condition B has five participants who took $24, 25, 27, 28, 26$ seconds to thread beads and one participant (Participant 6) who dropped the string and took $110$ seconds, the mean is dragged up to $40.0$ seconds—higher than 5 out of the 6 people in the group! Quoting Participant 6 exact score ($110\text{ s}$) and contrasting the distorted mean ($40.0\text{ s}$) with the representative median ($26.5\text{ s}$) guarantees full marks.</p>
<h3>Practice</h3>
<p>In a study of daily smartphone screen time (in minutes), six participants recorded: $120,\; 130,\; 125,\; 135,\; 140,\; 610$. Calculate both the mean and the median, and explain which measure you would report.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p><strong>Mean:</strong> $\frac{120 + 130 + 125 + 135 + 140 + 610}{6} = \frac{1260}{6} = \mathbf{210.0\text{ minutes}}$.<br><strong>Median:</strong> Ranked scores: $120,\; 125,\; \mathbf{130,\; 135},\; 140,\; 610$. Average of 3rd and 4th scores: $\frac{130 + 135}{2} = \mathbf{132.5\text{ minutes}}$.<br><strong>Decision:</strong> You should report the <strong>median ($132.5\text{ minutes}$)</strong> because Participant 6 score of $610\text{ minutes}$ is an extreme positive outlier that pulls the mean up to $210.0\text{ minutes}$—a value higher than 5 of the 6 participants in the sample!</p></div></details>` },

{ order: 5, title: "Measures of dispersion: Range, Interquartile Range and Standard Deviation", content: `
<p>Central tendency tells us where the centre of the data sits; <strong>measures of dispersion</strong> tell us how widely scattered or tightly clustered the individual scores are around that centre. Let us master all four dispersion measures on the WJEC specification.</p>
<h4>1. The Range</h4>
<p>The <strong>Range</strong> is the difference between the highest score ($x_{\max}$) and the lowest score ($x_{\min}$) in the dataset (sometimes with $+1$ added for discrete whole-number scales, though $x_{\max} - x_{\min}$ is standard):</p>
<p>$$\text{Range} = x_{\max} - x_{\min}$$</p>
<ul>
<li><em>Strength:</em> Instant and easy to calculate.</li>
<li><em>Weakness:</em> Uses only the two most extreme scores in the entire dataset! A single anomalous outlier (like $610$ minutes in our screen-time example above, giving $\text{Range} = 610 - 120 = 490\text{ minutes}$ when the other five scores span only $20\text{ minutes}$) completely distorts the range.</li>
</ul>
<h4>2. The Interquartile Range (IQR) and Semi-Interquartile Range (SIQR)</h4>
<p>When data are ordinal or skewed by outliers (where you chose the <strong>Median</strong> for central tendency), pair it with the <strong>Interquartile Range (IQR)</strong> or <strong>Semi-Interquartile Range (SIQR)</strong>:</p>
<ol>
<li>Rank the dataset in ascending order and divide it into four equal quarters separated by three quartiles: the <strong>Lower Quartile ($Q_1$, 25th percentile)</strong>, the <strong>Median ($Q_2$, 50th percentile)</strong>, and the <strong>Upper Quartile ($Q_3$, 75th percentile)</strong>.</li>
<li>Calculate the spread of the <strong>middle 50 percent of scores</strong>:
$$\text{IQR} = Q_3 - Q_1 \qquad \text{and} \qquad \text{SIQR} = \frac{Q_3 - Q_1}{2}$$</li>
</ol>
<p><em>Example ($n = 8$ ranked scores):</em> $10,\; \mathbf{12,\; 14},\; 15 \;\big|\; 16,\; \mathbf{18,\; 20},\; 48$. Here $Q_1 = \frac{12+14}{2} = 13$ (median of lower half), $Q_3 = \frac{18+20}{2} = 19$ (median of upper half). Thus $\text{IQR} = 19 - 13 = \mathbf{6}$, and $\text{SIQR} = \frac{6}{2} = \mathbf{3}$—completely unaffected by the outlier $48$!</p>
<h4>3. The Standard Deviation ($s$ or $\sigma$)</h4>
<p>When data are interval/ratio and unskewed (where you chose the <strong>Mean</strong>), pair it with the <strong>Standard Deviation (SD)</strong>—the average distance by which every score in the dataset deviates from the group mean:</p>
<p>$$s = \sqrt{\frac{\sum (x - \bar{x})^2}{n - 1}} \qquad \left(\text{or population form } \sigma = \sqrt{\frac{\sum (x - \bar{x})^2}{n}}\right)$$</p>
<p>Why is SD the gold-standard measure of dispersion? Because like the mean, it uses <strong>every single score in the dataset</strong>! However, for the exact same reason, it is also distorted by extreme outliers.</p>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">Why do we square each deviation $(x - \bar{x})^2$ when calculating the variance and standard deviation before taking the square root at the end?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Squaring makes numbers larger before the final square root returns the value to the original measurement units."><span class="tutor-checkpoint-key">A</span><span>To make the standard deviation equal to zero</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! Because the mean sits at the balance point of the data, positive deviations above the mean and negative deviations below the mean always add up to exactly zero: ∑(x - x̄) = 0. Squaring makes every deviation positive!"><span class="tutor-checkpoint-key">B</span><span>Because negative deviations below the mean and positive deviations above the mean would otherwise cancel out and sum to zero</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Outliers actually have an even bigger impact when squared."><span class="tutor-checkpoint-key">C</span><span>Because squaring removes extreme outliers from the dataset</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Standard deviation is used for interval/ratio data, not nominal categories."><span class="tutor-checkpoint-key">D</span><span>To convert interval data into nominal categories</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 6, title: "Step-by-step worked calculation of Standard Deviation and interpreting SD", content: `
<p>Let us walk through a complete, step-by-step calculation of the <strong>Standard Deviation</strong> on $n = 6$ scores (matching the worked table in the right panel of our Page 3 diagram) so you can complete any missing cells in a Unit 4 exam table with 100% accuracy.</p>
<h4>Worked Example: Calculating Standard Deviation step by step</h4>
<p>Six participants completed a simple reaction-time task (measured in tens of milliseconds): $12,\; 15,\; 14,\; 18,\; 16,\; 15$.</p>
<ol>
<li><strong>Step 1 — Calculate the Mean ($\bar{x}$):</strong>
$$\sum x = 12 + 15 + 14 + 18 + 16 + 15 = 90 \implies \bar{x} = \frac{90}{6} = \mathbf{15.0}$$</li>
<li><strong>Step 2 — Subtract the mean from each score ($d = x - \bar{x}$) and square each deviation ($d^2 = (x - \bar{x})^2$):</strong></li>
</ol>
<table style="width:100%;border-collapse:collapse;margin:0.8rem 0;font-size:0.95rem;">
<thead>
<tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
<th style="padding:0.5rem;border:1px solid #cbd5e1;">Participant</th>
<th style="padding:0.5rem;border:1px solid #cbd5e1;">Score ($x$)</th>
<th style="padding:0.5rem;border:1px solid #cbd5e1;">Deviation ($x - \bar{x}$)</th>
<th style="padding:0.5rem;border:1px solid #cbd5e1;">Squared Deviation $(x - \bar{x})^2$</th>
</tr>
</thead>
<tbody>
<tr><td style="padding:0.5rem;border:1px solid #cbd5e1;">1</td><td style="padding:0.5rem;border:1px solid #cbd5e1;">$12$</td><td style="padding:0.5rem;border:1px solid #cbd5e1;">$12 - 15 = -3$</td><td style="padding:0.5rem;border:1px solid #cbd5e1;">$(-3)^2 = 9$</td></tr>
<tr><td style="padding:0.5rem;border:1px solid #cbd5e1;">2</td><td style="padding:0.5rem;border:1px solid #cbd5e1;">$15$</td><td style="padding:0.5rem;border:1px solid #cbd5e1;">$15 - 15 = 0$</td><td style="padding:0.5rem;border:1px solid #cbd5e1;">$0^2 = 0$</td></tr>
<tr><td style="padding:0.5rem;border:1px solid #cbd5e1;">3</td><td style="padding:0.5rem;border:1px solid #cbd5e1;">$14$</td><td style="padding:0.5rem;border:1px solid #cbd5e1;">$14 - 15 = -1$</td><td style="padding:0.5rem;border:1px solid #cbd5e1;">$(-1)^2 = 1$</td></tr>
<tr><td style="padding:0.5rem;border:1px solid #cbd5e1;">4</td><td style="padding:0.5rem;border:1px solid #cbd5e1;">$18$</td><td style="padding:0.5rem;border:1px solid #cbd5e1;">$18 - 15 = +3$</td><td style="padding:0.5rem;border:1px solid #cbd5e1;">$(+3)^2 = 9$</td></tr>
<tr><td style="padding:0.5rem;border:1px solid #cbd5e1;">5</td><td style="padding:0.5rem;border:1px solid #cbd5e1;">$16$</td><td style="padding:0.5rem;border:1px solid #cbd5e1;">$16 - 15 = +1$</td><td style="padding:0.5rem;border:1px solid #cbd5e1;">$(+1)^2 = 1$</td></tr>
<tr><td style="padding:0.5rem;border:1px solid #cbd5e1;">6</td><td style="padding:0.5rem;border:1px solid #cbd5e1;">$15$</td><td style="padding:0.5rem;border:1px solid #cbd5e1;">$15 - 15 = 0$</td><td style="padding:0.5rem;border:1px solid #cbd5e1;">$0^2 = 0$</td></tr>
<tr style="background:#f8fafc;font-weight:600;"><td style="padding:0.5rem;border:1px solid #cbd5e1;">Totals</td><td style="padding:0.5rem;border:1px solid #cbd5e1;">$\sum x = 90$</td><td style="padding:0.5rem;border:1px solid #cbd5e1;">$\sum(x - \bar{x}) = 0$</td><td style="padding:0.5rem;border:1px solid #cbd5e1;">$\sum(x - \bar{x})^2 = 20$</td></tr>
</tbody>
</table>
<ol start="3">
<li><strong>Step 3 — Divide by $n - 1$ (or $n$ if the formula sheet specifies $n$) and take the square root:</strong>
  <ul>
  <li>Using sample denominator $n - 1 = 5$: $\text{Variance } s^2 = \frac{20}{5} = 4.00 \implies s = \sqrt{4.00} = \mathbf{2.00}$.</li>
  <li>(Using population denominator $n = 6$: $\sigma^2 = \frac{20}{6} = 3.333 \implies \sigma = \sqrt{3.333} = \mathbf{1.83}$ to 2 d.p.)</li>
  </ul>
</li>
</ol>
<h4>How to interpret two Standard Deviations in a Unit 4 exam question</h4>
<p>Suppose in your Language and Music experiment, <strong>Condition A (Silence)</strong> has $\text{Mean} = 14.2, \text{SD} = 1.4$, and <strong>Condition B (Vocal Music)</strong> has $\text{Mean} = 9.8, \text{SD} = 4.1$. When asked <em>"What do the mean and standard deviation tell us about participant performance in the two conditions?"</em> (4 marks):</p>
<ul>
<li><strong>2 marks for interpreting the Means in context:</strong> On average, participants recalled 4.4 more words out of 20 in Silence ($14.2$) than when listening to Vocal Music ($9.8$), suggesting vocal music impairs verbal working memory recall.</li>
<li><strong>2 marks for interpreting the Standard Deviations in context:</strong> The much smaller standard deviation in Silence ($\text{SD} = 1.4$) shows participants recall scores were tightly clustered and consistent around the group mean, whereas the much larger standard deviation in Vocal Music ($\text{SD} = 4.1$) shows scores were widely spread out—indicating that vocal music affected individuals very inconsistently (some were heavily distracted while others tuned the music out).</li>
</ul>
<h3>Practice</h3>
<p>Calculate the mean and sample standard deviation ($s = \sqrt{\frac{\sum(x-\bar{x})^2}{n-1}}$) for these five scores: $4,\; 6,\; 8,\; 10,\; 12$.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>1. <strong>Mean ($\bar{x}$):</strong> $\frac{4 + 6 + 8 + 10 + 12}{5} = \frac{40}{5} = \mathbf{8.0}$.<br>2. <strong>Squared deviations $\sum(x - \bar{x})^2$:</strong> $(4-8)^2 + (6-8)^2 + (8-8)^2 + (10-8)^2 + (12-8)^2 = (-4)^2 + (-2)^2 + 0^2 + 2^2 + 4^2 = 16 + 4 + 0 + 4 + 16 = \mathbf{40}$.<br>3. <strong>Sample SD ($s$):</strong> Divide by $n - 1 = 4$: $\frac{40}{4} = 10$. Take the square root: $s = \sqrt{10} = \mathbf{3.16}$ (to 2 d.p.). (If dividing by $n = 5$, $\sigma = \sqrt{\frac{40}{5}} = \sqrt{8} = \mathbf{2.83}$.)</p></div></details>` },

{ order: 7, title: "Normal versus skewed distributions: visualising the curves", content: `
<p>When we plot the frequency of scores across a large population on a continuous scale, what shape does the curve make? Study the three distribution curves in the diagram below—<strong>Normal (Gaussian)</strong>, <strong>Positively Skewed</strong> and <strong>Negatively Skewed</strong>—and notice the exact order of the Mode, Median and Mean in each curve!</p>
<figure style="margin:1.4rem 0;text-align:center;"><img src="/lesson-assets/wjec-a2-psychology/psych-unit4-distributions.png" alt="Three-panel diagram of distributions: Normal (Gaussian) bell curve with 68-95-99.7% empirical rule and Mean=Median=Mode, Positive Skew (long tail to the right, Mode < Median < Mean), and Negative Skew (long tail to the left, Mean < Median < Mode)." style="width:100%;max-width:100%;border:1px solid #cbd5e1;border-radius:0.75rem;background:#fff;"><figcaption style="margin-top:0.5rem;font-size:0.9rem;color:#475569;text-align:left;">Normal, Positively Skewed and Negatively Skewed distributions. Memorise how the extreme tail pulls the Mean toward itself! Diagram drawn for this course.</figcaption></figure>
<h4>1. The Normal (Gaussian) Distribution</h4>
<p>Many naturally occurring biological and psychological variables—such as adult height, IQ scores (mean $= 100$, $\text{SD} = 15$), and baseline reaction times in large samples—form a symmetrical, bell-shaped <strong>normal distribution</strong>:</p>
<ul>
<li><strong>Perfect symmetry at the peak:</strong> The <strong>Mean, Median and Mode are all identical</strong> and sit right at the central peak of the curve.</li>
<li><strong>The 68–95–99.7% Empirical Rule:</strong> Exactly <strong>$68.26\%$</strong> (approx. $68\%$) of all scores fall within $\pm 1\text{ SD}$ of the mean (e.g. IQ $85\text{ to }115$); <strong>$95.44\%$</strong> (approx. $95\%$) fall within $\pm 2\text{ SD}$ of the mean (e.g. IQ $70\text{ to }130$); and <strong>$99.73\%$</strong> fall within $\pm 3\text{ SD}$ of the mean. Notice that $95\%$ within $\pm 2\text{ SD}$ leaves $5\%$ ($p = 0.05$) in the two extreme tails—the exact basis of our $p \le 0.05$ significance threshold!</li>
<li><strong>Asymptotic tails:</strong> The two tails approach the horizontal x-axis infinitely closely without ever quite touching zero, because an even more extreme score is always theoretically possible.</li>
</ul>
<h4>2. Positively Skewed versus Negatively Skewed Distributions</h4>
<p>Memory trick: <strong>a skewed distribution is always named after the direction of its long, stretched-out TAIL (not its hump), and the Mean is always pulled furthest into the tail by the extreme outliers!</strong></p>
<ol>
<li><strong>Positive skew (long tail points to the right / high positive scores):</strong> Occurs when a task is <em>very hard</em> (a floor effect, where most people score low between $2\text{ and }6$ out of $20$, and only one or two geniuses score $19\text{ or }20$), or in reaction-time / income data where most responses are fast ($250\text{ ms}$) and a few distracted trials take $1200\text{ ms}$. Because the high outliers pull the mean upward, the order from left to right is:
$$\mathbf{\text{Mode} \lt \text{Median} \lt \text{Mean}}$$</li>
<li><strong>Negative skew (long tail points to the left / low scores):</strong> Occurs when a test is <em>very easy</em> (a ceiling effect, where almost everyone scores $18\text{ to }20$ out of $20$, and only one or two students who missed the topic score $2\text{ or }3$). Because those few low outliers pull the mean downward, the order from left to right is:
$$\mathbf{\text{Mean} \lt \text{Median} \lt \text{Mode}}$$</li>
</ol>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">In a memory test out of 30, a class has a Mode of 27, a Median of 24, and a Mean of 19.5. What type of distribution is this, and why?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. In a normal distribution, the Mean, Median and Mode are equal (e.g. all 24)."><span class="tutor-checkpoint-key">A</span><span>A normal distribution, because all three averages are between 19 and 27</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. In a positive skew, the mean is higher than the median and mode (Mode < Median < Mean). Here the mean (19.5) is the lowest of the three!"><span class="tutor-checkpoint-key">B</span><span>A positively skewed distribution, because the modal score is high</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! Because Mean (19.5) < Median (24) < Mode (27), most students scored very high (around 27/30, an easy test) while a few abnormally low scores in the left-hand tail pulled the mean down—a classic negative skew."><span class="tutor-checkpoint-key">C</span><span>A negatively skewed distribution, because most scores are high (Mode = 27) and a few low outliers in the left tail pull the Mean (19.5) below the Median (24)</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Bimodal means having two modes, whereas here a single mode (27), median (24) and mean (19.5) are given."><span class="tutor-checkpoint-key">D</span><span>A bimodal uniform distribution</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 8, title: "Applying the 68-95-99.7% normal distribution rule to exam problems", content: `
<p>In Unit 4 Section B, examiners love testing whether you can use the <strong>Normal Distribution percentages ($68\%, 95\%, 99.7\%$)</strong> and symmetry to calculate how many participants fall above or below a specific score. Let us work through two examples step by step.</p>
<h4>Worked Example 1: Two-sided and one-tailed percentages on a normal curve</h4>
<p>A standardised resilience scale is normally distributed in the population with a <strong>Mean ($\mu$) of $50$</strong> and a <strong>Standard Deviation ($\sigma$) of $10$</strong> in a sample of $N = 400$ adults.</p>
<ol>
<li><strong>How many adults score between $40$ and $60$?</strong>
  <ul>
  <li>Step 1: Notice that $40 = 50 - 10$ ($\text{Mean} - 1\text{ SD}$) and $60 = 50 + 10$ ($\text{Mean} + 1\text{ SD}$).</li>
  <li>Step 2: In a normal distribution, $68\%$ of scores lie within $\pm 1\text{ SD}$ of the mean.</li>
  <li>Step 3: $68\%\text{ of }400 = 0.68 \times 400 = \mathbf{272\text{ adults}}$.</li>
  </ul>
</li>
<li><strong>What percentage of adults score <em>above</em> $70$?</strong>
  <ul>
  <li>Step 1: Notice that $70 = 50 + 2(10)$ ($\text{Mean} + 2\text{ SD}$).</li>
  <li>Step 2: $95\%$ of all scores lie between $-2\text{ SD}$ ($30$) and $+2\text{ SD}$ ($70$). That leaves $100\% - 95\% = 5\%$ outside $\pm 2\text{ SD}$, split equally between the two symmetrical tails!</li>
  <li>Step 3: Divide $5\%$ by $2$ to get the upper tail alone: $\frac{5\%}{2} = \mathbf{2.5\%}$ of adults score above $70$ (which is $0.025 \times 400 = \mathbf{10\text{ adults}}$).</li>
  </ul>
</li>
</ol>
<h4>Worked Example 2: Spotting skewness from a Mean and SD</h4>
<p>Suppose a student measures reaction time errors (where the minimum possible score is $0$ errors) and reports: $\text{Mean} = 3.0\text{ errors}, \text{SD} = 4.0\text{ errors}$. How do you know immediately that this distribution <em>cannot</em> be normally distributed? Because in a normal distribution, $\text{Mean} - 2\text{ SD}$ covers $95\%$ of scores, which here would be $3.0 - 2(4.0) = -5.0\text{ errors}$—and it is impossible to make $-5$ errors! Therefore, the data must be bunched near zero with a long positive tail of high error scores (a <strong>positively skewed distribution</strong>).</p>
<h3>Practice</h3>
<p>Scores on a standardised test of Empathising (EQ) are normally distributed with a mean of $44$ and a standard deviation of $8$ in a sample of $600$ participants. (a) Between what two EQ scores do the middle $95\%$ of participants fall? (b) How many participants out of $600$ score <em>below</em> $36$?</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>(a) In a normal distribution, the middle $95\%$ of scores fall within $\pm 2\text{ SD}$ of the mean. Since $\text{Mean} = 44$ and $2 \times \text{SD} = 2 \times 8 = 16$, the lower bound is $44 - 16 = \mathbf{28}$ and the upper bound is $44 + 16 = \mathbf{60}$ (scores between $\mathbf{28\text{ and }60}$).<br>(b) A score of $36$ is exactly $1\text{ SD}$ below the mean ($44 - 8 = 36$). Since $68\%$ of scores lie within $\pm 1\text{ SD}$ (between $36$ and $52$), $100\% - 68\% = 32\%$ lie outside $\pm 1\text{ SD}$. By symmetry, half of that $32\%$ lies in the lower tail below $36$: $\frac{32\%}{2} = 16\%$. Finally, $16\%\text{ of }600 = 0.16 \times 600 = \mathbf{96\text{ participants}}$.</p></div></details>` },

];