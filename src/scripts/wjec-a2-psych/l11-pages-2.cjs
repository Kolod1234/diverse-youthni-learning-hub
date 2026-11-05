/*
 * WJEC A2 Psychology — Unit 4: Applied Research Methods
 * Lesson 11: Descriptive Statistics, Distributions and Graphical Representation
 * (15 pages), part 2 (pages 9-15).
 * Exports {order,title,content}.
 */
module.exports = [

{ order: 9, title: "Qualitative data versus Quantitative data: strengths, weaknesses and conversion", content: `
<p>Not all psychological data begin as numbers! In Unit 4, you must be able to compare <strong>quantitative data</strong> (numerical scores, reaction times, frequency counts) with <strong>qualitative data</strong> (non-numerical rich written or spoken text from unstructured interviews, diaries, open-ended questionnaire items or clinical case notes) and explain how qualitative data can be converted into quantitative data.</p>
<h4>1. Comparing Quantitative and Qualitative Data</h4>
<table style="width:100%;border-collapse:collapse;margin:1.1rem 0;font-size:0.93rem;">
<thead>
<tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
<th style="padding:0.55rem;text-align:left;border:1px solid #cbd5e1;">Dimension</th>
<th style="padding:0.55rem;text-align:left;border:1px solid #cbd5e1;">Quantitative Data (Numbers)</th>
<th style="padding:0.55rem;text-align:left;border:1px solid #cbd5e1;">Qualitative Data (Words / Meanings)</th>
</tr>
</thead>
<tbody>
<tr>
<td style="padding:0.55rem;border:1px solid #cbd5e1;font-weight:600;">Strengths</td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Objective, replicable and statistically testable:</strong> Can be summarised with means/SDs and tested with inferential tests (Mann–Whitney, Spearman, $\chi^2$) across large nomothetic samples with minimal researcher interpretation bias.</td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Rich, holistic idiographic depth and high validity:</strong> Captures the participant lived subjective feelings, reasons and context in their own words (e.g. Luhrmann et al., 2015 voice-hearing interviews) without forcing them into preset tick-boxes.</td>
</tr>
<tr>
<td style="padding:0.55rem;border:1px solid #cbd5e1;font-weight:600;">Weaknesses</td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Reductionist and narrow:</strong> Forcing complex emotions (like bereavement or psychosis) into a 1–10 numerical rating scale strips away personal meaning and context (low internal/ecological validity).</td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Subjective, time-consuming and hard to generalise:</strong> Vulnerable to researcher interpretation bias during coding, cannot be analysed directly with inferential statistics, and usually restricted to small samples.</td>
</tr>
</tbody>
</table>
<h4>2. Converting Qualitative Data into Quantitative Data: Content Analysis vs Thematic Analysis</h4>
<ul>
<li><strong>Content analysis (Quantitative conversion):</strong> As we saw in Lesson 10, the researcher creates a structured coding frame of operationalised behavioural/verbal categories and tallies how many times each category appears in the transcript or video—converting qualitative words into <strong>nominal frequency counts</strong> that can be graphed on a bar chart and tested with Chi-squared ($\chi^2$)!</li>
<li><strong>Thematic analysis (Braun and Clarke, 2006 — Qualitative synthesis):</strong> Rather than counting frequencies, the researcher reads the transcripts repeatedly, highlights recurring phrases (initial codes), and groups them inductively into overarching qualitative <strong>themes</strong> illustrated by direct participant quotations, preserving idiographic richness.</li>
</ul>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">How does Content Analysis differ from Thematic Analysis when a psychologist analyses interview transcripts?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Both methods analyse qualitative text/media, but Content Analysis converts the text into numerical frequency counts whereas Thematic Analysis keeps the output as qualitative themes and quotes."><span class="tutor-checkpoint-key">A</span><span>Content Analysis only studies blood samples, whereas Thematic Analysis studies interviews</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! Content Analysis tallies how often operationalised coding categories occur to produce quantitative frequency data, whereas Thematic Analysis identifies overarching qualitative themes supported by verbatim quotes without reducing them to numbers."><span class="tutor-checkpoint-key">B</span><span>Content Analysis converts qualitative text into quantitative frequency tallies of coding categories, whereas Thematic Analysis organises text into qualitative themes and verbatim quotes</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Thematic Analysis does not calculate a standard deviation."><span class="tutor-checkpoint-key">C</span><span>Thematic Analysis calculates the standard deviation of every word</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Both methods require careful checking of inter-rater/researcher consistency."><span class="tutor-checkpoint-key">D</span><span>Content Analysis never uses operationalised categories</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 10, title: "Primary versus Secondary data and Meta-analysis", content: `
<p>Another classic Unit 4 distinction is between <strong>primary data</strong> and <strong>secondary data</strong> (including <strong>meta-analysis</strong>). Let us make sure you can define, exemplify and evaluate both.</p>
<h4>1. Primary Data</h4>
<ul>
<li><strong>Definition:</strong> Original data collected <em>first-hand</em> by the researcher specifically to test the aim and hypothesis of their own investigation (for example, your two Unit 4 Personal Investigations, Milgram 40 obedience participants, or Raine et al., 1997 PET scans of 41 murderers).</li>
<li><strong>Strengths:</strong> The researcher has <strong>total control over operationalisation, experimental design and data quality</strong>: you design the exact word list, calibrate the 60 dB headphones yourself, and know that standardised instructions were followed honestly.</li>
<li><strong>Weaknesses:</strong> Expensive, labour-intensive and time-consuming to recruit, test and score participants—which often restricts student and single-lab primary studies to small, unrepresentative opportunity samples.</li>
</ul>
<h4>2. Secondary Data and Meta-Analysis</h4>
<ul>
<li><strong>Definition:</strong> Pre-existing data that were originally collected by someone else for another purpose (such as government crime statistics from the Office for National Statistics, hospital admission records, football post-match broadcast archives, or previously published journal articles).</li>
<li><strong>Meta-analysis ("a study of studies"):</strong> A quantitative secondary research method in which a psychologist systematically pools the results of dozens of independent primary studies on the same topic to calculate an overall <strong>combined effect size</strong> across thousands of participants! Think of the famous meta-analyses we have used across Unit 3: Gottesman (1991) pooling 40 schizophrenia twin/family studies; Bond and Smith (1996) pooling 133 Asch conformity studies; Pharoah et al. (2010) pooling 53 family-therapy RCTs ($N = 4,708$); Saunders et al. (1996) pooling 37 Stress Inoculation Training studies; and Hyde (2005) pooling 46 gender meta-analyses!</li>
<li><strong>Strengths &amp; Weaknesses of Secondary Data / Meta-Analysis:</strong>
  <ul>
  <li><em>Strength:</em> Enormous combined sample size ($N$ in the thousands) and cross-cultural/multi-centre breadth give much higher <strong>population validity and statistical power</strong> at a fraction of the time and ethical cost of new primary testing.</li>
  <li><em>Weakness:</em> Vulnerable to <strong>publication bias ("the file-drawer problem")</strong>—if journals only published positive studies and hid null studies in file drawers, the meta-analysis will overestimate the true effect! Moreover, primary studies included in a meta-analysis often used different operationalisations, designs and quality standards ("comparing apples and oranges"), and official government statistics (e.g. police recorded crime) suffer from unrecorded "dark figure" gaps.</li>
  </ul>
</li>
</ul>
<h3>Practice</h3>
<p>Explain one strength and one weakness of using a meta-analysis (such as Pharoah et al., 2010 review of 53 family therapy studies for schizophrenia) compared with conducting a single primary experiment.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p><strong>Strength:</strong> By pooling secondary data from 53 separate randomised controlled trials ($N = 4,708$ patients across multiple countries and hospitals), Pharoah et al. (2010) achieved vastly greater statistical power and external population validity than any single small-sample primary study could achieve, allowing clinicians to estimate the true 40–50% relapse reduction reliably. <strong>Weakness:</strong> A meta-analysis has no direct control over the methodological quality of the original primary studies and is vulnerable to both "apples-and-oranges" heterogeneity (different studies defined family therapy and relapse differently, and some lacked assessor blinding) and the <em>file-drawer publication bias</em> (studies finding zero benefit of family therapy were less likely to be published and included).</p></div></details>` },

{ order: 11, title: "Multi-step worked workshop: full descriptive analysis of an unseen dataset", content: `
<p>Let us put every calculation skill from Lesson 11 together on a single unseen Section B experimental dataset and work through the exact steps you would write on your exam paper.</p>
<div style="border-left:4px solid #1d4ed8;background:#eff6ff;padding:0.8rem 1rem;margin:1.2rem 0;border-radius:0.4rem;">
<p style="margin:0;"><strong>Unseen Section B scenario:</strong> A forensic psychologist investigated whether Restorative Justice conferencing reduced anger ratings (measured on a 0–40 Novacco Anger Scale, where higher = angrier) compared with standard prison probation. Six young offenders in each group completed the anger scale after 3 months:<br>
<strong>Group A (Restorative Justice, $n_1 = 6$):</strong> $14, 18, 12, 14, 16, 22$<br>
<strong>Group B (Standard Probation, $n_2 = 6$):</strong> $24, 28, 22, 30, 26, 50$</p>
</div>
<h4>Step-by-step worked calculations</h4>
<ol>
<li><strong>Calculate the Mean ($\bar{x}$), Median, Mode and Range for Group A (Restorative Justice):</strong>
  <ul>
  <li><em>Order the 6 scores first:</em> $12, 14, 14, 16, 18, 22$.</li>
  <li><strong>Mean ($\bar{x}_A$):</strong> $\frac{12 + 14 + 14 + 16 + 18 + 22}{6} = \frac{96}{6} = \mathbf{16.0}$.</li>
  <li><strong>Median:</strong> Midpoint of 3rd ($14$) and 4th ($16$) ordered scores $= \frac{14 + 16}{2} = \mathbf{15.0}$.</li>
  <li><strong>Mode:</strong> $\mathbf{14}$ (appears twice).</li>
  <li><strong>Range:</strong> $22 - 12 = \mathbf{10}$.</li>
  </ul>
</li>
<li><strong>Calculate the Standard Deviation ($s$) for Group A ($\bar{x}_A = 16.0, n = 6$):</strong>
  <ul>
  <li>Deviations $(x - 16)$: $12-16 = -4$; $14-16 = -2$; $14-16 = -2$; $16-16 = 0$; $18-16 = +2$; $22-16 = +6$.</li>
  <li>Squared deviations $(x - 16)^2$: $(-4)^2 + (-2)^2 + (-2)^2 + 0^2 + (+2)^2 + (+6)^2 = 16 + 4 + 4 + 0 + 4 + 36 = \mathbf{64}$.</li>
  <li>Sample Standard Deviation: $s_A = \sqrt{\frac{64}{6 - 1}} = \sqrt{\frac{64}{5}} = \sqrt{12.8} = \mathbf{3.58\text{ (to 2 d.p.)}}$.</li>
  </ul>
</li>
<li><strong>Calculate the Mean, Median and Range for Group B (Standard Probation: $22, 24, 26, 28, 30, 50$):</strong>
  <ul>
  <li><strong>Mean ($\bar{x}_B$):</strong> $\frac{22 + 24 + 26 + 28 + 30 + 50}{6} = \frac{180}{6} = \mathbf{30.0}$.</li>
  <li><strong>Median:</strong> Midpoint of 3rd ($26$) and 4th ($28$) ordered scores $= \frac{26 + 28}{2} = \mathbf{27.0}$.</li>
  <li><strong>Range:</strong> $50 - 22 = \mathbf{28}$. (Notice that offender #6 with a score of $50$ is an outlier creating a positive skew in Group B where $\text{Median } 27.0 \lt \text{Mean } 30.0$, so the Median and IQR are more representative for Group B than the Mean and Range!)</li>
  </ul>
</li>
</ol>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">In the worked workshop above, what is the percentage decrease from the Group B Mean anger score (30.0) to the Group A Mean anger score (16.0), rounded to 3 significant figures?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. 30 - 16 = 14 is the raw difference in points, not the percentage decrease out of 30."><span class="tutor-checkpoint-key">A</span><span>14.0%</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! Percentage decrease = ((30 - 16) / 30) × 100 = (14 / 30) × 100 = 46.666...% = 46.7% to 3 significant figures."><span class="tutor-checkpoint-key">B</span><span>46.7%</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Dividing by 16 instead of the baseline 30 gives 87.5%; percentage decrease from Group B to Group A divides the change (14) by Group B (30)."><span class="tutor-checkpoint-key">C</span><span>87.5%</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Check (14 / 30) × 100 = 46.7%."><span class="tutor-checkpoint-key">D</span><span>53.3%</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 12, title: "Interpreting correlation scattergrams and correlation coefficients", content: `
<p>Before we learn how to calculate Spearman $r_s$ in Lesson 12, let us master how to read a <strong>correlation coefficient ($r$ or $r_s$)</strong> and match it to a scattergram in Unit 4.</p>
<h4>1. The scale of a correlation coefficient: from $-1.00$ to $+1.00$</h4>
<p>Every correlation coefficient always lies between <strong>$-1.00$ and $+1.00$</strong> (if you ever calculate $r_s = 1.45$ or $-2.10$ in an exam, stop immediately—you have made an arithmetic slip!):</p>
<ul>
<li><strong>The sign ($+$ or $-$) tells you the DIRECTION of the relationship:</strong>
  <ul>
  <li>A <strong>positive correlation ($+$)</strong> means that as Co-variable X increases, Co-variable Y <em>also increases</em> (e.g. $r = +0.72$ between revision hours and exam score). On a scattergram, the points slope <strong>upward from bottom-left to top-right</strong>.</li>
  <li>A <strong>negative correlation ($-$)</strong> means that as Co-variable X increases, Co-variable Y <em>decreases</em> (e.g. $r_s = -0.65$ between daily smartphone screen time and nightly sleep duration). On a scattergram, the points slope <strong>downward from top-left to bottom-right</strong>.</li>
  </ul>
</li>
<li><strong>The numerical magnitude ($0.00$ to $1.00$) tells you the STRENGTH of the relationship:</strong>
  <ul>
  <li>$\pm 1.00 =$ <strong>perfect</strong> correlation (every dot lies on a single straight/monotonic line).</li>
  <li>$\pm 0.70\text{ to }\pm 0.99 =$ <strong>strong</strong> correlation (dots cluster tightly around the line of best fit).</li>
  <li>$\pm 0.30\text{ to }\pm 0.69 =$ <strong>moderate</strong> correlation.</li>
  <li>$\pm 0.01\text{ to }\pm 0.29 =$ <strong>weak</strong> correlation (e.g. Rahe et al., 1970 $r = +0.118$ between LCUs and illness).</li>
  <li>$0.00 =$ <strong>zero</strong> correlation (no linear relationship at all).</li>
  </ul>
</li>
</ul>
<div style="border-left:4px solid #b45309;background:#fffbeb;padding:0.8rem 1rem;margin:1.2rem 0;border-radius:0.4rem;">
<p style="margin:0;"><strong>Classic exam trap:</strong> Which is a <em>stronger</em> correlation: $r_s = -0.82$ or $r_s = +0.55$? Answer: <strong>$-0.82$ is much stronger than $+0.55$!</strong> The minus sign only tells you the line slopes downward; the strength is given by how close the absolute number ($0.82$ vs $0.55$) is to $1.00$!</p>
</div>
<h3>Practice</h3>
<p>Put the following four correlation coefficients in order from <strong>weakest to strongest</strong> relationship, and state the direction of the strongest one: $r_s = +0.41,\; r_s = -0.89,\; r_s = -0.12,\; r_s = +0.76$.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>To order by strength, ignore the $+$ or $-$ sign and order by absolute magnitude from closest to $0.00$ to closest to $1.00$:<br><strong>Weakest to strongest:</strong> $-0.12$ (very weak negative) $\rightarrow +0.41$ (moderate positive) $\rightarrow +0.76$ (strong positive) $\rightarrow \mathbf{-0.89}$ (very strong negative). The strongest relationship is $r_s = -0.89$, which is a <strong>negative (inverse) correlation</strong> where one co-variable decreases as the other increases.</p></div></details>` },

{ order: 13, title: "Choosing the right descriptive package for any Section B scenario", content: `
<p>When a Section B question asks you to <em>"Name and justify an appropriate measure of central tendency, measure of dispersion and graph for the data in this study"</em> (6 marks), use the decision table below to match all three choices cleanly to the level of measurement and distribution shape.</p>
<table style="width:100%;border-collapse:collapse;margin:1.2rem 0;font-size:0.92rem;">
<thead>
<tr style="background:#f1f5f9;border-bottom:2px solid #cbd5e1;">
<th style="padding:0.55rem;text-align:left;border:1px solid #cbd5e1;">Data Type &amp; Shape</th>
<th style="padding:0.55rem;text-align:left;border:1px solid #cbd5e1;">Central Tendency</th>
<th style="padding:0.55rem;text-align:left;border:1px solid #cbd5e1;">Dispersion</th>
<th style="padding:0.55rem;text-align:left;border:1px solid #cbd5e1;">Graph Choice</th>
</tr>
</thead>
<tbody>
<tr>
<td style="padding:0.55rem;border:1px solid #cbd5e1;font-weight:600;">Interval / Ratio data, symmetrical (no extreme outliers)</td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Mean ($\bar{x}$):</strong> most sensitive, uses exact value of every score.</td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Standard Deviation ($s$):</strong> most precise spread, uses every score deviation from the mean.</td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Bar chart</strong> of condition means (for experimental IV) or <strong>Histogram / Frequency polygon</strong> (for continuous distribution) or <strong>Scattergram</strong> (for correlation).</td>
</tr>
<tr>
<td style="padding:0.55rem;border:1px solid #cbd5e1;font-weight:600;">Ordinal data (ranks/ratings) OR Skewed Interval data with outliers</td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Median ($Q_2$):</strong> middle ranked score, unaffected by extreme outliers or skew.</td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Interquartile Range (IQR)</strong> (or Range): measures middle 50% of scores without outlier distortion.</td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Bar chart</strong> of condition medians, or <strong>Box-and-whisker plot</strong> showing median, quartiles and whiskers.</td>
</tr>
<tr>
<td style="padding:0.55rem;border:1px solid #cbd5e1;font-weight:600;">Nominal (categorical frequency counts)</td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Mode:</strong> most frequent category (only average valid for nominal data).</td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><em>Category percentages</em> (dispersion formulas do not apply to unordered nominal categories).</td>
<td style="padding:0.55rem;border:1px solid #cbd5e1;"><strong>Bar chart</strong> of category frequencies (with gaps between bars) or <strong>Pie chart</strong> of proportions.</td>
</tr>
</tbody>
</table>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">A researcher measures reaction time (in milliseconds) across 12 participants, but one participant sneezes during the trial and records 4,800 ms while the other 11 participants all score between 310 ms and 390 ms. Which central tendency and dispersion pair should the researcher report?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Although reaction time in ms is ratio/interval data, the huge outlier (4,800 ms) will severely distort both the Mean and the Standard Deviation/Range!"><span class="tutor-checkpoint-key">A</span><span>Mean and Range, because reaction time is measured in milliseconds</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! Because the 4,800 ms score is an extreme positive outlier that heavily skews the dataset, reporting the Median and Interquartile Range avoids distortion and accurately represents the typical participant performance."><span class="tutor-checkpoint-key">B</span><span>Median and Interquartile Range, because they are unaffected by the extreme 4,800 ms outlier</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Continuous millisecond reaction times are unlikely to have a meaningful mode, and the Range (4,800 - 310 = 4,490 ms) is completely distorted by the outlier."><span class="tutor-checkpoint-key">C</span><span>Mode and Range</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Standard deviation is also inflated by squaring the huge deviation (4,800 - mean)^2."><span class="tutor-checkpoint-key">D</span><span>Mode and Standard Deviation</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 14, title: "Practice questions with complete worked answers and criteria", content: `
<p>Attempt all three Unit 4 descriptive-statistics and graphical practice questions below (using a calculator where appropriate) before checking the worked solutions.</p>
<h4>Question 1 (6 marks AO2)</h4>
<p>A psychologist measured the number of aggressive behaviours observed in a playground over 30 minutes in seven children before and after a whole-school anti-bullying intervention:<br>
<strong>Before intervention:</strong> $5, 8, 4, 5, 7, 6, 14$<br>
(a) Calculate the <strong>Mean</strong>, <strong>Median</strong>, <strong>Mode</strong> and <strong>Range</strong> for the "Before intervention" scores, showing all working and rounding to 1 decimal place where appropriate. [4]<br>
(b) Explain which measure of central tendency is most appropriate to represent the "Before intervention" scores. [2]</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the worked answer and criteria</summary><div style="margin-top:0.6rem;"><p>(a) First place the $n = 7$ scores in ascending rank order: $4, 5, 5, \mathbf{6}, 7, 8, 14$.<br>• <strong>Mean:</strong> $\bar{x} = \frac{4 + 5 + 5 + 6 + 7 + 8 + 14}{7} = \frac{49}{7} = \mathbf{7.0}$ [1 mark]<br>• <strong>Median:</strong> Middle ($\frac{7+1}{2} = 4\text{th}$) ordered score $= \mathbf{6}$ [1 mark]<br>• <strong>Mode:</strong> Most frequent score $= \mathbf{5}$ (appears twice) [1 mark]<br>• <strong>Range:</strong> $\text{Highest} - \text{Lowest} = 14 - 4 = \mathbf{10}$ [1 mark]<br>(b) The <strong>Median ($6$)</strong> is the most appropriate measure of central tendency [1 mark] because child #7 ($14$ aggressive behaviours) is an extreme positive outlier that skews the distribution and pulls the Mean ($7.0$) higher than five of the seven children actual scores, whereas the Median is unaffected by extreme scores [1 mark].</p></div></details>

<h4>Question 2 (4 marks AO2)</h4>
<p>Calculate the sample <strong>Standard Deviation ($s = \sqrt{\frac{\sum(x - \bar{x})^2}{n - 1}}$)</strong> for the following five sleep duration scores (in hours): $5, 6, 7, 8, 9$. Show every step of your working and give your answer to 2 decimal places. [4]</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the worked answer and criteria</summary><div style="margin-top:0.6rem;"><p>• <strong>Step 1 (Mean):</strong> $\bar{x} = \frac{5 + 6 + 7 + 8 + 9}{5} = \frac{35}{5} = \mathbf{7.0\text{ hours}}$ [1 mark]<br>• <strong>Step 2 (Deviations $x - \bar{x}$):</strong> $5 - 7 = -2;\; 6 - 7 = -1;\; 7 - 7 = 0;\; 8 - 7 = +1;\; 9 - 7 = +2$ [1 mark]<br>• <strong>Step 3 (Sum of squared deviations $\sum(x - \bar{x})^2$):</strong> $(-2)^2 + (-1)^2 + 0^2 + (+1)^2 + (+2)^2 = 4 + 1 + 0 + 1 + 4 = \mathbf{10}$ [1 mark]<br>• <strong>Step 4 (Divide by $n - 1$ and square root):</strong> $s = \sqrt{\frac{10}{5 - 1}} = \sqrt{\frac{10}{4}} = \sqrt{2.5} = \mathbf{1.58\text{ hours (to 2 d.p.)}}$ <em>(or $\sigma = \sqrt{\frac{10}{5}} = \sqrt{2} = 1.41\text{ hours}$)</em> [1 mark].</p></div></details>

<h4>Question 3 (6 marks AO2 + AO3)</h4>
<p>In a study of Stress Inoculation Training (SIT) vs a Waiting-List Control group, a psychologist measured salivary cortisol (nmol/L) after a public-speaking test:<br>
• <strong>SIT group ($n = 20$):</strong> $\text{Mean} = 11.2\text{ nmol/L},\; \text{SD} = 1.8\text{ nmol/L}$<br>
• <strong>Control group ($n = 20$):</strong> $\text{Mean} = 19.6\text{ nmol/L},\; \text{SD} = 6.4\text{ nmol/L}$<br>
(a) What two conclusions can the psychologist draw from these descriptive statistics? [4]<br>
(b) Name and justify the most appropriate graph to display the mean cortisol scores of the two groups. [2]</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the worked answer and criteria</summary><div style="margin-top:0.6rem;"><p>(a) <strong>Conclusion 1 (Mean):</strong> The mean salivary cortisol level after public speaking was substantially lower in the Stress Inoculation Training group ($11.2\text{ nmol/L}$) than in the Waiting-List Control group ($19.6\text{ nmol/L}$), indicating that SIT was effective in reducing average physiological HPA stress reactivity [2 marks].<br><strong>Conclusion 2 (SD):</strong> The standard deviation was much smaller in the SIT group ($1.8\text{ nmol/L}$) than in the Control group ($6.4\text{ nmol/L}$), showing that participants who received SIT had consistently low cortisol responses clustered tightly around the mean, whereas untreated control participants varied widely in their physiological stress response [2 marks].<br>(b) A <strong>bar chart</strong> (with gaps between the two bars) [1 mark] because the independent variable on the x-axis consists of two discrete, separate categories (SIT group vs Waiting-List Control group) while the y-axis displays the continuous mean salivary cortisol level in nmol/L starting from zero [1 mark].</p></div></details>` },

{ order: 15, title: "Retrieval recap and bridge to Lesson 12 (Inferential Statistical Tests)", content: `
<p>You have completed Lesson 11 on Descriptive Statistics, Distributions and Graphical Representation. Test your recall on the ten retrieval prompts below before moving to Lesson 12.</p>
<h4>Retrieval set</h4>
<p>(a) State the formula for the Mean and explain its main strength and weakness. (b) How do you calculate the Median when $n$ is an even number? (c) Which measure of central tendency is the only one suitable for nominal categorical data? (d) Contrast the Range, Interquartile Range (IQR) and Standard Deviation ($s$). (e) Round $0.00746$ to (i) 3 decimal places, (ii) 2 significant figures, and write it in standard form. (f) State the order of Mean, Median and Mode in a positively skewed distribution versus a negatively skewed distribution. (g) What percentages of scores fall within $\pm 1\text{ SD}$, $\pm 2\text{ SD}$ and $\pm 3\text{ SD}$ of the mean in a normal distribution? (h) Distinguish when to use a bar chart, a histogram and a scattergram. (i) Contrast Content Analysis with Thematic Analysis when analysing qualitative interview transcripts. (j) State one strength and one weakness of Meta-Analysis.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answers</summary><div style="margin-top:0.6rem;"><p>(a) $\bar{x} = \frac{\sum x}{n}$; strength: most sensitive as it includes every score exact value; weakness: easily distorted by extreme outliers/skew. (b) Order all scores from lowest to highest and take the midpoint (mean) of the two middle scores at positions $\frac{n}{2}$ and $\frac{n}{2} + 1$. (c) The Mode. (d) Range ($\text{Highest} - \text{Lowest}$) uses only the two extremes; IQR ($Q_3 - Q_1$) measures the middle 50% of ordered scores and ignores outliers; Standard Deviation ($s = \sqrt{\frac{\sum(x-\bar{x})^2}{n-1}}$) measures average deviation of every score from the mean. (e) (i) $0.007$; (ii) $0.0075$; standard form: $7.5 \times 10^{-3}$. (f) Positive skew: $\text{Mode} \lt \text{Median} \lt \text{Mean}$ (long tail to the right); Negative skew: $\text{Mean} \lt \text{Median} \lt \text{Mode}$ (long tail to the left). (g) $68.26\%$, $95.44\%$, and $99.73\%$. (h) Bar chart (gaps between bars): discrete categorical IV on x-axis; Histogram (touching bars): continuous numerical class intervals on x-axis; Scattergram: two continuous co-variables in a correlation. (i) Content analysis tallies operationalised categories into quantitative frequency counts; thematic analysis identifies qualitative themes and quotes while keeping data qualitative. (j) Strength: large pooled sample size increases population validity and statistical power; weakness: vulnerable to the file-drawer publication bias and heterogeneity between primary studies.</p></div></details>
<p>In Lesson 12 we master <strong>Levels of Measurement, Probability, Type I/II Errors, and the Four Non-Parametric Inferential Statistical Tests</strong> (Chi-squared, Mann–Whitney U, Wilcoxon $T$, and Spearman $r_s$).</p>` },

];