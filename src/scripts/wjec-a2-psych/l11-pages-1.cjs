/*
 * WJEC A2 Psychology — Unit 4: Applied Research Methods
 * Lesson 11: Descriptive Statistics, Distributions and Graphical Representation
 * (15 pages), part 1 (pages 1-8).
 * Diagrams: /lesson-assets/wjec-a2-psychology/*.png (render-unit4-l11.cjs).
 * Exports {order,title,content}.
 */
module.exports = [

{ order: 1, title: "Why mathematical and descriptive skills matter in Unit 4", content: `
<p>At least <strong>10 percent of the total marks across your A-level Psychology qualification</strong> assess mathematical and statistical skills—and the majority of those marks sit directly in <strong>Unit 4</strong>! In Section B (and Section A), you can be asked to calculate a mean, median, mode, range, interquartile range, standard deviation, percentage, ratio, fraction or standard-form number, round to significant figures or decimal places, interpret normal and skewed distributions, or plot and critique a graph.</p>
<p>Pause and reassure yourself before we begin: every single mathematical calculation in A2 Psychology follows a clear, repeatable step-by-step recipe, and you are allowed to bring a scientific calculator into the Unit 4 examination room! In Lesson 11 we will walk through every descriptive statistic, distribution and graph type with complete intermediate working so that quantitative questions become guaranteed full-mark bankers on your exam paper.</p>
<h4>What descriptive statistics do</h4>
<p>When a psychologist finishes collecting raw data from 20 or 50 participants, a raw table of numbers is impossible to take in at a glance. <strong>Descriptive statistics</strong> summarise raw quantitative data into two complementary numbers:</p>
<ol>
<li><strong>Measures of central tendency (averages):</strong> A single typical value representing the middle or centre of the dataset—the <strong>Mean ($\bar{x}$)</strong>, the <strong>Median</strong>, and the <strong>Mode</strong>.</li>
<li><strong>Measures of dispersion (spread):</strong> A measure of how tightly clustered or widely spread out the scores are around that central average—the <strong>Range</strong>, the <strong>Interquartile Range (IQR) / Semi-Interquartile Range (SIQR)</strong>, and the <strong>Standard Deviation ($s$ or $\sigma$)</strong>.</li>
</ol>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">Why must a psychologist always report a measure of dispersion (such as the standard deviation or range) alongside a measure of central tendency (such as the mean)?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. The mean and standard deviation measure different things: the mean measures the central average, whereas standard deviation measures the spread of scores around that mean."><span class="tutor-checkpoint-key">A</span><span>Because the mean and standard deviation are always the exact same number</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! Two conditions can have the exact same mean (e.g. 12.0 words), yet one group might all score between 11 and 13 (consistent) while the other ranges from 2 to 20 (highly variable); dispersion reveals whether the mean is genuinely representative of individual scores."><span class="tutor-checkpoint-key">B</span><span>Because two groups can share the same mean while having vastly different spread/consistency around that mean</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Reporting descriptive statistics does not replace inferential significance testing."><span class="tutor-checkpoint-key">C</span><span>Because dispersion automatically proves the null hypothesis is false</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Nominal data use the mode and percentages, not the mean or standard deviation."><span class="tutor-checkpoint-key">D</span><span>Because standard deviation is the only statistic allowed for nominal data</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 2, title: "Measures of central tendency: Mean, Median and Mode with worked steps", content: `
<p>Let us master the calculation, level-of-measurement rules, strengths and weaknesses of all three measures of central tendency using a concrete cognitive psychology dataset.</p>
<div style="border-left:4px solid #1d4ed8;background:#eff6ff;padding:0.8rem 1rem;margin:1.2rem 0;border-radius:0.4rem;">
<p style="margin:0;"><strong>Worked dataset (Silence condition word recall out of 20, $n = 9$ participants):</strong><br>Raw scores: $12, 15, 11, 12, 14, 13, 12, 16, 20$.</p>
</div>
<h4>1. The Mean ($\bar{x}$) — for interval / ratio data</h4>
<ul>
<li><strong>Formula and step-by-step calculation:</strong> Add all the scores together ($\sum x$) and divide by the number of scores ($n$):
$$\bar{x} = \frac{\sum x}{n} = \frac{12 + 15 + 11 + 12 + 14 + 13 + 12 + 16 + 20}{9} = \frac{125}{9} = 13.888... = 13.89\text{ words (to 2 d.p.)}$$</li>
<li><strong>Strength:</strong> The most sensitive measure of central tendency because it includes the exact mathematical value of every single score in the dataset.</li>
<li><strong>Weakness:</strong> Severely distorted by <strong>extreme outliers (anomalous scores)</strong> or skewed distributions! Notice what happens if the 9th participant had scored $2$ instead of $20$: $\sum x$ drops to $107$, pulling the mean down to $11.89$ even though eight of the nine participants scored $11$ to $16$!</li>
</ul>
<h4>2. The Median — for ordinal, interval or ratio data (especially when skewed)</h4>
<ul>
<li><strong>Step-by-step calculation:</strong>
  <ol>
  <li>First, <strong>place all scores in ascending rank order</strong> from smallest to largest (forgetting to order the numbers first is the #1 exam slip!):
  $$11,\; 12,\; 12,\; 12,\; \mathbf{13},\; 14,\; 15,\; 16,\; 20$$</li>
  <li>Locate the middle position using $\frac{n + 1}{2} = \frac{9 + 1}{2} = 5\text{th score}$. Here, the 5th score is <strong>$13\text{ words}$</strong>.</li>
  <li><em>What if $n$ is even?</em> Suppose a 10th participant scored $18$, giving $11, 12, 12, 12, \mathbf{13}, \mathbf{14}, 15, 16, 18, 20$. The middle position is $\frac{10 + 1}{2} = 5.5\text{th}$, so we take the midpoint (mean) of the 5th and 6th ordered scores: $\frac{13 + 14}{2} = \mathbf{13.5\text{ words}}$.</li>
  </ol>
</li>
<li><strong>Strength &amp; Weakness:</strong> Completely unaffected by extreme outliers (whether the highest score is $20$ or $200$, the median stays $13$!). However, it is less sensitive than the mean because it ignores the exact numerical magnitudes of all scores above and below the middle.</li>
</ul>
<h4>3. The Mode — for nominal (categorical) data (and discrete frequencies)</h4>
<ul>
<li><strong>Calculation:</strong> Identify the most frequently occurring value. In our dataset, $12$ appears three times while every other score appears once, so <strong>$\text{Mode} = 12\text{ words}$</strong>. (A dataset with two modes is <em>bimodal</em>; if every score appears once, there is no mode.)</li>
<li><strong>Strength &amp; Weakness:</strong> The <em>only</em> measure of central tendency that can be used with <strong>nominal categorical data</strong> (e.g. the most common attachment type in Ainsworth Strange Situation is Type B Secure), and unaffected by outliers, but crude and uninformative in small continuous datasets.</li>
</ul>
<h3>Practice</h3>
<p>Eight participants completed a bead-threading task in front of an audience. Their times in seconds were: $42, 38, 45, 38, 40, 44, 39, 90$. Calculate (a) the Mean, (b) the Median, and (c) the Mode, and state which average best represents this group and why.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>(a) <strong>Mean:</strong> $\bar{x} = \frac{42 + 38 + 45 + 38 + 40 + 44 + 39 + 90}{8} = \frac{376}{8} = \mathbf{47.0\text{ seconds}}$.<br>(b) <strong>Median:</strong> Order the 8 scores from lowest to highest: $38, 38, 39, \mathbf{40}, \mathbf{42}, 44, 45, 90$. Since $n = 8$ (even), take the midpoint of the 4th ($40$) and 5th ($42$) scores: $\frac{40 + 42}{2} = \mathbf{41.0\text{ seconds}}$.<br>(c) <strong>Mode:</strong> $38\text{ seconds}$ (appears twice).<br><strong>Best measure:</strong> The <strong>Median ($41.0\text{ s}$)</strong> is the most representative measure of central tendency here because participant 8 ($90\text{ s}$) is an extreme outlier that pulls the mean ($47.0\text{ s}$) above seven of the eight participants actual times!</p></div></details>` },

{ order: 3, title: "Measures of dispersion: Range, Interquartile Range and Standard Deviation", content: `
<p>Study the three-panel descriptive statistics diagram below, then let us walk through the step-by-step calculation of the Range, Interquartile Range (IQR) and Standard Deviation ($s$).</p>
<figure style="margin:1.4rem 0;text-align:center;"><img src="/lesson-assets/wjec-a2-psychology/psych-unit4-central-dispersion.png" alt="Three-panel diagram of descriptive statistics: measures of central tendency (Mean, Median, Mode), measures of dispersion (Range, Interquartile Range, Standard Deviation), and auxiliary maths skills (percentages, ratios, rounding, significant figures)." style="width:100%;max-width:100%;border:1px solid #cbd5e1;border-radius:0.75rem;background:#fff;"><figcaption style="margin-top:0.5rem;font-size:0.9rem;color:#475569;text-align:left;">Summary of descriptive statistics and mathematical skills for WJEC Unit 4. Diagram drawn for this course.</figcaption></figure>
<h4>1. The Range</h4>
<ul>
<li><strong>Formula:</strong> $\text{Range} = \text{Highest score} - \text{Lowest score}$ (note: some psychology textbooks add $+1$ when scores are whole integers to cover the upper and lower real limits; in an exam, always write out $\text{Highest} - \text{Lowest}$ clearly so your method is transparent). For our 9 silence recall scores ($11, 12, 12, 12, 13, 14, 15, 16, 20$), $\text{Range} = 20 - 11 = \mathbf{9\text{ words}}$.</li>
<li><strong>Strength &amp; Weakness:</strong> Very fast to calculate, but depends entirely on the two most extreme scores—a single outlier (like $90\text{ s}$ on Page 2) inflates the range dramatically.</li>
</ul>
<h4>2. The Interquartile Range (IQR) and Semi-Interquartile Range (SIQR)</h4>
<ul>
<li><strong>What it measures:</strong> The spread of the <strong>middle 50 percent</strong> of ordered scores ($Q_3 - Q_1$), paired with the <strong>Median ($Q_2$)</strong> for ordinal or skewed data.</li>
<li><strong>Step-by-step calculation on our 9 ordered scores ($11, 12, 12, 12, \mathbf{13}, 14, 15, 16, 20$):</strong>
  <ol>
  <li>The Median ($Q_2$) is the 5th score $= 13$.</li>
  <li>The <strong>Lower Quartile ($Q_1$)</strong> is the median of the lower half of scores below $Q_2$ ($11, 12, 12, 12$): midpoint of 2nd and 3rd scores $= \frac{12 + 12}{2} = \mathbf{12}$.</li>
  <li>The <strong>Upper Quartile ($Q_3$)</strong> is the median of the upper half of scores above $Q_2$ ($14, 15, 16, 20$): midpoint of 7th and 8th scores $= \frac{15 + 16}{2} = \mathbf{15.5}$.</li>
  <li>$\text{IQR} = Q_3 - Q_1 = 15.5 - 12 = \mathbf{3.5\text{ words}}$ (and $\text{SIQR} = \frac{Q_3 - Q_1}{2} = 1.75\text{ words}$).</li>
  </ol>
</li>
<li><strong>Strength:</strong> Completely unaffected by extreme outliers in the top 25% or bottom 25% of scores!</li>
</ul>
<h4>3. The Standard Deviation ($s$) — paired with the Mean for interval/ratio data</h4>
<ul>
<li><strong>What it measures:</strong> The average distance by which every individual score ($x$) deviates from the sample mean ($\bar{x}$):
$$s = \sqrt{\frac{\sum (x - \bar{x})^2}{n - 1}} \quad \left(\text{or population form } \sigma = \sqrt{\frac{\sum (x - \bar{x})^2}{n}}\right)$$</li>
<li><strong>Complete step-by-step worked example ($n = 5$ stress cortisol scores: $4, 6, 8, 10, 12\text{ nmol/L}$):</strong>
  <ol>
  <li><strong>Step 1 — Calculate the mean ($\bar{x}$):</strong> $\bar{x} = \frac{4 + 6 + 8 + 10 + 12}{5} = \frac{40}{5} = \mathbf{8.0}$.</li>
  <li><strong>Step 2 — Subtract the mean from each score ($x - \bar{x}$):</strong>
  $$4 - 8 = -4,\quad 6 - 8 = -2,\quad 8 - 8 = 0,\quad 10 - 8 = +2,\quad 12 - 8 = +4$$</li>
  <li><strong>Step 3 — Square each deviation $(x - \bar{x})^2$ (so negative signs become positive) and sum them:</strong>
  $$(-4)^2 + (-2)^2 + 0^2 + (+2)^2 + (+4)^2 = 16 + 4 + 0 + 4 + 16 = \mathbf{40}$$</li>
  <li><strong>Step 4 — Divide by $n - 1$ (variance) and take the square root:</strong>
  $$s = \sqrt{\frac{40}{5 - 1}} = \sqrt{\frac{40}{4}} = \sqrt{10} = \mathbf{3.16\text{ nmol/L (to 2 d.p.)}}$$
  <em>(Note: if using $\div n$, $\sigma = \sqrt{\frac{40}{5}} = \sqrt{8} = 2.83$.)</em></li>
  </ol>
</li>
<li><strong>Strength &amp; Weakness:</strong> The most precise measure of dispersion because it includes every single score deviation from the mean, but like the mean it is distorted by extreme outliers.</li>
</ul>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">In an experiment comparing word recall (out of 20), Condition A (Silence) has Mean = 14.5, SD = 1.2, while Condition B (Vocal Music) has Mean = 10.2, SD = 4.8. What do these two Standard Deviations tell us?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. A smaller SD (1.2) means scores were tightly clustered around the mean, whereas a larger SD (4.8) means scores were widely spread out."><span class="tutor-checkpoint-key">A</span><span>Scores in Silence were widely spread out, while everyone in Vocal Music got the exact same score</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! The low SD in Silence (1.2) shows participants performed consistently close to the mean of 14.5, whereas the high SD in Vocal Music (4.8) shows individual scores varied widely around 10.2 (some were heavily distracted by the music while others were less affected)."><span class="tutor-checkpoint-key">B</span><span>Scores in Silence were tightly clustered around 14.5 (consistent), whereas scores in Vocal Music varied widely around 10.2</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Standard deviation measures the spread of scores around the mean, not the number of participants in the sample."><span class="tutor-checkpoint-key">C</span><span>There were 1.2 participants in Silence and 4.8 participants in Vocal Music</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Condition A had the higher mean (14.5 vs 10.2)."><span class="tutor-checkpoint-key">D</span><span>Participants recalled more words on average in the Vocal Music condition</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 4, title: "Core mathematical skills: percentages, ratios, fractions, rounding and standard form", content: `
<p>Alongside averages and spread, Unit 4 tests six core arithmetic skills that frequently appear as 1- to 3-mark calculations on Section B stimulus tables. Let us work through an explicit example of each.</p>
<h4>1. Percentages and percentage change</h4>
<ul>
<li><strong>Percentage of a total:</strong> In a content analysis of 40 post-match interviews, 26 managers made an internal attribution. What percentage is this?
$$\text{Percentage} = \frac{\text{Part}}{\text{Total}} \times 100 = \frac{26}{40} \times 100 = 0.65 \times 100 = \mathbf{65\%}$$</li>
<li><strong>Percentage change (increase or decrease):</strong> A patient anxiety score drops from $32$ before Stress Inoculation Training to $20$ after training. Calculate the percentage decrease:
$$\text{Percentage change} = \frac{\text{New} - \text{Original}}{\text{Original}} \times 100 = \frac{20 - 32}{32} \times 100 = \frac{-12}{32} \times 100 = \mathbf{-37.5\%}\text{ (a }37.5\%\text{ decrease)}$$</li>
</ul>
<h4>2. Converting between fractions, decimals and ratios</h4>
<ul>
<li><strong>Simplifying a ratio:</strong> In a school bullying survey of 120 pupils, 90 pupils reported being bystanders and 30 reported being victims. Write the ratio of bystanders to victims in its simplest form:
$$\text{Ratio} = 90 : 30 \xrightarrow{\div 30} \mathbf{3 : 1}$$
(Notice that a $3:1$ ratio means there are $3 + 1 = 4$ parts in total, so bystanders make up $\frac{3}{4} = 0.75 = 75\%$ of the sample, and victims make up $\frac{1}{4} = 0.25 = 25\%$.)</li>
</ul>
<h4>3. Rounding to Decimal Places (d.p.) versus Significant Figures (s.f.)</h4>
<p>Students frequently confuse decimal places with significant figures under exam pressure—check the difference carefully:</p>
<ul>
<li><strong>Decimal places (d.p.):</strong> Count digits <em>after the decimal point</em>. Look at the next digit: if it is $5$ or more, round up; if $4$ or less, leave unchanged.
  <ul>
  <li>Round $14.3762$ to <strong>2 decimal places (2 d.p.)</strong>: the 2nd decimal digit is $7$, and the next digit is $6$ ($\ge 5$), so it rounds up to <strong>$14.38$</strong>.</li>
  <li>Round $0.0486$ to <strong>2 decimal places (2 d.p.)</strong>: the 2nd decimal digit is $4$, and the next digit is $8$ ($\ge 5$), so it rounds to <strong>$0.05$</strong>.</li>
  </ul>
</li>
<li><strong>Significant figures (s.f.):</strong> Start counting from the <strong>first non-zero digit</strong> on the left!
  <ul>
  <li>Round $14.3762$ to <strong>2 significant figures (2 s.f.)</strong>: the first two non-zero digits are $1$ and $4$; the next digit is $3$ ($\lt 5$), so it rounds to <strong>$14$</strong>.</li>
  <li>Round $0.0486$ to <strong>2 significant figures (2 s.f.)</strong>: ignore the leading zeros! The first two non-zero digits are $4$ and $8$; the next digit is $6$ ($\ge 5$), so it rounds to <strong>$0.049$</strong>.</li>
  <li>Round $36,989$ (Ripke et al. GWAS sample) to <strong>2 significant figures (2 s.f.)</strong>: the first two digits are $3$ and $6$, followed by $9$ ($\ge 5$), so keep the place-value zeros: <strong>$37,000$</strong>.</li>
  </ul>
</li>
</ul>
<h4>4. Standard form ($A \times 10^n$, where $1 \le A \lt 10$)</h4>
<ul>
<li>Large numbers: $37,000 = \mathbf{3.7 \times 10^4}$ (decimal point moves 4 places left).</li>
<li>Small $p$-values: $p = 0.0005 = \mathbf{5.0 \times 10^{-4}}$ (decimal point moves 4 places right).</li>
</ul>
<h3>Practice</h3>
<p>(a) In a trial of 80 offenders receiving Anger Management, 52 did not reoffend and 28 reoffended. Calculate the percentage who did not reoffend and simplify the ratio of non-reoffenders to reoffenders. (b) Round $0.03684$ to (i) 2 decimal places and (ii) 2 significant figures, and write it in standard form to 2 s.f.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>(a) <strong>Percentage:</strong> $\frac{52}{80} \times 100 = \mathbf{65\%}$. <strong>Ratio:</strong> $52 : 28 \xrightarrow{\div 4} \mathbf{13 : 7}$.<br>(b) (i) To <strong>2 d.p.</strong>: the second digit after the decimal point is $3$, followed by $6$ ($\ge 5$), giving <strong>$0.04$</strong>. (ii) To <strong>2 s.f.</strong>: start at the first non-zero digit ($3$); the second significant digit is $6$, followed by $8$ ($\ge 5$), giving <strong>$0.037$</strong>. In <strong>standard form</strong>: $\mathbf{3.7 \times 10^{-2}}$.</p></div></details>` },

{ order: 5, title: "Normal, positively skewed and negatively skewed distributions", content: `
<p>When we plot the frequency of scores across a large sample, the shape of the frequency curve tells us immediately whether our dataset is symmetrical or skewed—and therefore whether we should report the Mean or the Median! Study the three distribution curves in the diagram below.</p>
<figure style="margin:1.4rem 0;text-align:center;"><img src="/lesson-assets/wjec-a2-psychology/psych-unit4-distributions.png" alt="Three-panel diagram comparing a normal distribution (bell curve with Mean = Median = Mode and 68-95-99.7% rule), a positive skew (long right tail with Mode < Median < Mean), and a negative skew (long left tail with Mean < Median < Mode)." style="width:100%;max-width:100%;border:1px solid #cbd5e1;border-radius:0.75rem;background:#fff;"><figcaption style="margin-top:0.5rem;font-size:0.9rem;color:#475569;text-align:left;">Normal, positively skewed and negatively skewed frequency distributions. Notice how the long tail always pulls the Mean toward it. Diagram drawn for this course.</figcaption></figure>
<h4>1. The Normal Distribution (Gaussian bell curve)</h4>
<p>Many naturally occurring psychological and biological variables—such as IQ scores ($\text{Mean} = 100, \text{SD} = 15$), height, and reaction times in large populations—form a symmetrical, bell-shaped <strong>normal distribution</strong>:</p>
<ul>
<li><strong>Symmetry of averages:</strong> The <strong>Mean, Median and Mode are identical</strong> and sit at the exact central peak of the curve.</li>
<li><strong>The $68\text{–}95\text{–}99.7\%$ Standard Deviation rule:</strong> Exactly <strong>$68.26\%$</strong> of scores fall within $\pm 1\text{ SD}$ of the mean (e.g. IQ $85\text{ to }115$); <strong>$95.44\%$</strong> fall within $\pm 2\text{ SD}$ (IQ $70\text{ to }130$); and <strong>$99.73\%$</strong> fall within $\pm 3\text{ SD}$ (IQ $55\text{ to }145$). The tails approach the horizontal axis asymptotically without ever touching zero.</li>
</ul>
<h4>2. Positively Skewed Distribution (long tail points to the right / positive numbers)</h4>
<ul>
<li><strong>How it happens:</strong> Most participants cluster at the <em>lower</em> end of the scale, with a few extreme high scores stretching the tail out to the right (for example, reaction times in milliseconds where most people respond in $250\text{–}350\text{ ms}$ but a few distracted participants take $1,200\text{ ms}$, or number of criminal convictions in the general population).</li>
<li><strong>Order of averages:</strong> The extreme high scores in the right-hand tail pull the Mean upward, while the Mode stays at the left-hand peak and the Median sits in between:
$$\mathbf{\text{Mode} \lt \text{Median} \lt \text{Mean}}$$</li>
</ul>
<h4>3. Negatively Skewed Distribution (long tail points to the left / low numbers)</h4>
<ul>
<li><strong>How it happens:</strong> Most participants cluster at the <em>higher</em> end of the scale (a ceiling effect, such as an easy 20-mark test where most students score $18\text{ or }19$ out of $20$, but two students who missed the topic score $3\text{ and }5$).</li>
<li><strong>Order of averages:</strong> The extreme low scores in the left-hand tail pull the Mean downward below the Median and Mode:
$$\mathbf{\text{Mean} \lt \text{Median} \lt \text{Mode}}$$</li>
</ul>
<p><strong>Memory rule for the exam:</strong> The direction of the skew is always named after the direction of the <strong>long tail</strong> (not the high peak!), and the <strong>Mean is always pulled furthest into the tail</strong> because it includes every extreme outlier. Whenever a distribution is positively or negatively skewed, you should use the <strong>Median and Interquartile Range</strong> (and a non-parametric inferential test) rather than the Mean and SD!</p>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">In a memory experiment out of 30 words, a psychologist finds that the Mode = 26, the Median = 23, and the Mean = 18.4. What type of distribution is this, and why?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. In a normal distribution, the Mean, Median and Mode are all equal."><span class="tutor-checkpoint-key">A</span><span>A normal distribution, because all three averages are between 18 and 26</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. In a positive skew, the Mean is higher than the Median and Mode (Mode < Median < Mean). Here the Mean (18.4) is the lowest of the three!"><span class="tutor-checkpoint-key">B</span><span>A positively skewed distribution, because the Mode is 26</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! Because Mean (18.4) < Median (23) < Mode (26), most participants scored high near 26 while a few very low outlier scores pulled the Mean down into the left-hand tail—a negative skew."><span class="tutor-checkpoint-key">C</span><span>A negatively skewed distribution, because Mean (18.4) &lt; Median (23) &lt; Mode (26), showing a few low scores pulled the mean down into the left tail</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. A bimodal distribution has two modes, whereas here we have Mean < Median < Mode."><span class="tutor-checkpoint-key">D</span><span>A bimodal distribution with zero dispersion</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 6, title: "Graphical representation: Bar charts, Histograms, Line graphs, Scattergrams, Boxplots and Pie charts", content: `
<p>In Unit 4 Section B (and Section A), you can be asked to identify which graph is appropriate for a dataset, interpret patterns shown on a graph, or spot errors in how a researcher has drawn a graph. Study the six-panel graphical representation diagram below.</p>
<figure style="margin:1.4rem 0;text-align:center;"><img src="/lesson-assets/wjec-a2-psychology/psych-unit4-graphs.png" alt="Six-panel diagram of psychological graphs: Bar chart (discrete categories with gaps), Histogram (continuous class intervals with touching bars), Frequency polygon / line graph, Scattergram (correlation of two continuous co-variables), Box-and-whisker plot (median, quartiles, range), and Pie chart." style="width:100%;max-width:100%;border:1px solid #cbd5e1;border-radius:0.75rem;background:#fff;"><figcaption style="margin-top:0.5rem;font-size:0.9rem;color:#475569;text-align:left;">The six graphical representations required for WJEC A2 Unit 4. Diagram drawn for this course.</figcaption></figure>
<h4>Choosing and auditing each graph type</h4>
<ol>
<li><strong>Bar chart:</strong> Used when the independent variable on the horizontal x-axis consists of <strong>discrete, non-continuous categories</strong> (e.g. Silence vs Vocal Music; Winning vs Losing managers), and the vertical y-axis shows the summary DV (mean score or category frequency). <em>Crucial drawing rule:</em> Leave <strong>gaps between the bars</strong> to show the categories are discrete!</li>
<li><strong>Histogram:</strong> Used to display the frequency distribution of a <strong>single continuous variable</strong> (interval/ratio data grouped into equal class intervals on the x-axis, such as reaction times $200\text{–}299\text{ ms}, 300\text{–}399\text{ ms}$, with frequency on the y-axis). <em>Crucial drawing rule:</em> The bars <strong>touch each other with zero gaps</strong> because the horizontal scale is continuous!</li>
<li><strong>Frequency polygon (Line graph):</strong> Plots the midpoint of each continuous class interval with a dot and joins the dots with straight lines. Particularly useful when comparing <strong>two continuous frequency distributions on the same axes</strong> (e.g. comparing the distribution of sleep hours for male vs female students without overlapping bars obscuring each other).</li>
<li><strong>Scattergram (Scatterplot):</strong> Used exclusively for <strong>correlations</strong>! Co-variable 1 goes on the x-axis and Co-variable 2 goes on the y-axis; each dot represents one participant paired score $(x_i, y_i)$. An upward-sloping cloud of points indicates a <em>positive correlation</em>; a downward-sloping cloud indicates a <em>negative correlation</em>; a random shotgun scatter indicates <em>zero correlation</em>.</li>
<li><strong>Box-and-whisker plot (Boxplot):</strong> Displays five ordinal/skewed summary numbers along a scale: the <strong>Lowest score</strong> (left whisker end), <strong>Lower Quartile ($Q_1$)</strong> (left edge of the box), <strong>Median ($Q_2$)</strong> (vertical line inside the box), <strong>Upper Quartile ($Q_3$)</strong> (right edge of the box), and <strong>Highest score</strong> (right whisker end). If the median line sits near the left of the box with a long right whisker, the data are positively skewed!</li>
<li><strong>Pie chart:</strong> Displays <strong>nominal categorical proportions</strong> as sectors of a $360^\circ$ circle. To calculate the angle for a category: $\text{Angle} = \frac{\text{Category frequency}}{\text{Total } N} \times 360^\circ$ (e.g. 15 out of 60 participants $= \frac{15}{60} \times 360^\circ = 90^\circ$).</li>
</ol>
<h3>Practice</h3>
<p>(a) State two visual differences between a bar chart and a histogram and when each should be used. (b) In a survey of $N = 80$ students, 20 students preferred visual revision notes. Calculate the exact sector angle in degrees for this category on a pie chart.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>(a) First, in a <strong>bar chart</strong> the bars have spaces/gaps between them because the x-axis represents discrete, separate categories (nominal/categorical IV, e.g. Music vs Silence), whereas in a <strong>histogram</strong> the bars touch with no gaps because the x-axis represents continuous numerical class intervals (e.g. age or time in seconds). Second, a bar chart usually plots the mean DV or category tally on the y-axis across separate conditions, whereas a histogram plots the frequency density/count of scores across intervals of a single continuous distribution. (b) $\text{Sector angle} = \frac{20}{80} \times 360^\circ = 0.25 \times 360^\circ = \mathbf{90^\circ}$.</p></div></details>` },

{ order: 7, title: "Spotting misleading graphs and table-reading errors in Section B", content: `
<p>A favourite Unit 4 Section B question shows you a graph or summary table drawn by a fictional psychology student and asks: <em>"Identify three errors or misleading features in how the student has presented their data."</em> Let us build a six-point checklist so you can spot every graphical flaw in seconds.</p>
<h4>The 6-point Graph Audit Checklist</h4>
<ol>
<li><strong>Check the y-axis origin (truncated axis trick):</strong> Does the vertical y-axis start at <strong>zero ($0$)</strong>? If a bar chart comparing Mean word recall in Silence ($14.2$) vs Music ($13.6$) starts the y-axis at $13.0$ instead of $0$, the Silence bar looks three times as tall as the Music bar—visually exaggerating a tiny $0.6$-word difference!</li>
<li><strong>Check whether the graph type matches the research design and level of measurement:</strong> Did the student draw a bar chart for a correlation (should be a scattergram!), or draw a histogram with touching bars for discrete nominal categories (should be a bar chart with gaps!)?</li>
<li><strong>Check the axis labels and units:</strong> Are both the x-axis and y-axis clearly labelled with the <strong>operationalised variable and exact units</strong> in brackets (e.g. <em>"Mean task completion time (seconds)"</em> rather than just <em>"Score"</em>)?</li>
<li><strong>Check the title:</strong> Does the graph have a clear, informative title stating both variables (e.g. <em>"Figure 1: Bar chart showing mean number of words recalled out of 20 in Silence and Vocal Music conditions"</em>)?</li>
<li><strong>Check for raw data vs summary data confusion:</strong> Did the student plot 24 separate bars for all 24 individual participants instead of plotting just 2 summary bars showing the condition means?</li>
<li><strong>Check whether dispersion is omitted:</strong> Does a bar chart of means omit standard deviation error bars or an accompanying dispersion table, hiding whether the two distributions overlap heavily?</li>
</ol>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">A student investigates the correlation between daily caffeine intake (mg) and nightly sleep duration (minutes) in 20 participants, and presents the results as a bar chart with 20 bars (one for each participant). What is wrong with this graph?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. A pie chart is for nominal categorical proportions, not two continuous co-variables."><span class="tutor-checkpoint-key">A</span><span>They should have drawn a 20-slice pie chart instead</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! Because the study is a correlation between two continuous co-variables (caffeine in mg and sleep in minutes), the student should have plotted a scattergram with caffeine on the x-axis, sleep on the y-axis, and one plotted point per participant pair."><span class="tutor-checkpoint-key">B</span><span>A correlation between two continuous co-variables must be plotted as a scattergram (one dot per participant pair), not a bar chart</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Leaving out half the participants would falsify the data."><span class="tutor-checkpoint-key">C</span><span>They should only have plotted 3 participants</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. A bar chart of individual participants cannot show the bivariate relationship between two continuous co-variables cleanly."><span class="tutor-checkpoint-key">D</span><span>Nothing is wrong; a 20-bar chart is the standard graph for correlations</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 8, title: "Interpreting summary tables: combining central tendency and dispersion", content: `
<p>In Section B, you will frequently be given a summary table showing the Mean (or Median) and Standard Deviation (or Range) for two experimental conditions and asked: <em>"What two conclusions can the psychologist draw from the descriptive statistics in Table 1?"</em> (4 marks). Let us learn the exact two-part formula that guarantees 4 out of 4 marks.</p>
<div style="border-left:4px solid #1d4ed8;background:#eff6ff;padding:0.8rem 1rem;margin:1.2rem 0;border-radius:0.4rem;">
<p style="margin:0 0 0.5rem;"><strong>Example stimulus table:</strong> A psychologist tested the effect of a therapy dog (Animal-Assisted Therapy) vs a quiet waiting room on pre-exam anxiety scores (out of 50, where higher = more anxious) in two independent groups of sixth-formers ($n_1 = 15, n_2 = 15$).</p>
<table style="width:100%;border-collapse:collapse;background:#fff;font-size:0.92rem;">
<thead>
<tr style="background:#dbeafe;"><th style="padding:0.45rem;border:1px solid #93c5fd;text-align:left;">Statistic</th><th style="padding:0.45rem;border:1px solid #93c5fd;text-align:left;">Condition 1: Therapy Dog present</th><th style="padding:0.45rem;border:1px solid #93c5fd;text-align:left;">Condition 2: Quiet Waiting Room</th></tr>
</thead>
<tbody>
<tr><td style="padding:0.45rem;border:1px solid #93c5fd;font-weight:600;">Mean anxiety score (out of 50)</td><td style="padding:0.45rem;border:1px solid #93c5fd;">18.4</td><td style="padding:0.45rem;border:1px solid #93c5fd;">31.2</td></tr>
<tr><td style="padding:0.45rem;border:1px solid #93c5fd;font-weight:600;">Standard Deviation (SD)</td><td style="padding:0.45rem;border:1px solid #93c5fd;">2.9</td><td style="padding:0.45rem;border:1px solid #93c5fd;">7.8</td></tr>
</tbody>
</table>
</div>
<h4>How to write a 4-mark conclusion from a descriptive table</h4>
<ol>
<li><strong>Paragraph 1 — Interpret the Measure of Central Tendency in context (2 marks):</strong> State which condition had the higher/lower Mean, quote the exact numbers from the table ($18.4$ vs $31.2$), and translate what that means in terms of the operationalised DV: <em>"The mean pre-exam anxiety score was substantially lower in the Therapy Dog condition ($18.4$ out of $50$) than in the Quiet Waiting Room condition ($31.2$ out of $50$), suggesting that interacting with a therapy dog reduces average pre-exam anxiety compared with waiting quietly."</em></li>
<li><strong>Paragraph 2 — Interpret the Measure of Dispersion in context (2 marks):</strong> State which condition had the lower/higher Standard Deviation, quote the exact numbers ($2.9$ vs $7.8$), and explain what that means for consistency/individual variation: <em>"The standard deviation was much smaller in the Therapy Dog condition ($2.9$) than in the Quiet Waiting Room condition ($7.8$), indicating that participants anxiety scores were tightly clustered and consistently low when the therapy dog was present, whereas participants in the waiting room showed wide individual variation in how anxious they felt."</em></li>
</ol>
<h3>Practice</h3>
<p>In a social facilitation experiment measuring time in seconds to complete a complex maze puzzle, Group A (Alone) had $\text{Median} = 54\text{ s}, \text{IQR} = 8\text{ s}$, while Group B (Audience of 6 peers) had $\text{Median} = 79\text{ s}, \text{IQR} = 26\text{ s}$. Write two conclusions (4 marks) from these statistics.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>1. <strong>Conclusion from the Median (2 marks):</strong> The median maze completion time was much faster when participants worked Alone ($54\text{ seconds}$) than when watched by an Audience of six peers ($79\text{ seconds}$), indicating that the presence of an audience impaired performance (social inhibition) on this complex task.<br>2. <strong>Conclusion from the Interquartile Range (2 marks):</strong> The interquartile range of the middle 50% of completion times was much smaller in the Alone condition ($8\text{ seconds}$) than in the Audience condition ($26\text{ seconds}$), showing that participants performed with consistent speed when alone whereas the audience caused wide individual variation in completion times (some participants were severely slowed by evaluation apprehension while others were less affected).</p></div></details>` },

];