/*
 * WJEC A2 Psychology — Unit 4: Applied Research Methods
 * Lesson 11: Descriptive Statistics, Distributions and Graphical Representation
 * (15 pages), part 2 (pages 9-15).
 * Exports {order,title,content}.
 */
module.exports = [

{ order: 9, title: "Graphical representation 2: Line graphs, Pie charts and Scattergrams", content: `
<p>Let us complete our mastery of the WJEC graphical specification by examining <strong>line graphs (frequency polygons)</strong>, <strong>pie charts</strong> and <strong>scattergrams</strong>—including the exact angle and gradient calculations that examiners love to set.</p>
<h4>1. Line graphs and Frequency polygons</h4>
<ul>
<li><strong>When to use:</strong> When the variable on the x-axis is <strong>continuous</strong> (such as time in weeks across a 12-week CBTp trial, age in years, or the midpoints of continuous class intervals in a frequency polygon). Plotting a line graph allows you to compare two or more groups across the same continuous x-axis on a single chart (e.g. a solid line for the CBTp group and a dashed line for the befriending control group across Weeks 0, 4, 8 and 12).</li>
<li><strong>Rule:</strong> Never join discrete nominal categories (like "Football", "Rugby", "Tennis") with a continuous line!</li>
</ul>
<h4>2. Pie charts (calculating sector angles in degrees)</h4>
<ul>
<li><strong>When to use:</strong> To display how a total nominal sample is divided into proportional categories (parts of a whole $100\%$).</li>
<li><strong>How to calculate the angle of each slice (out of $360^\circ$ in a full circle):</strong>
$$\text{Sector angle} = \frac{\text{Category frequency}}{\text{Total sample size } N} \times 360^\circ$$
<em>Worked example:</em> In Takahashi (1986) Strange Situation study of $N = 60$ Japanese infants, $41$ were classified as Secure (Type B) and $19$ as Insecure-Resistant (Type C). Calculate the pie-chart angle for each category:<br>
Type B angle $= \frac{41}{60} \times 360^\circ = 41 \times 6^\circ = \mathbf{246^\circ}$.<br>
Type C angle $= \frac{19}{60} \times 360^\circ = 19 \times 6^\circ = \mathbf{114^\circ}$.<br>
<em>Check:</em> $246^\circ + 114^\circ = 360^\circ$!</li>
</ul>
<h4>3. Scattergrams (for correlational data) and line of best fit</h4>
<ul>
<li><strong>When to use:</strong> Exclusively for <strong>correlational studies</strong> measuring two continuous co-variables (e.g. Co-variable 1: Daily screen time in hours on the x-axis; Co-variable 2: Nightly sleep duration in hours on the y-axis).</li>
<li><strong>How to plot and read:</strong> Each participant is represented by <strong>one single plotted point (cross $\times$)</strong> at the intersection of their two co-variable scores. (So if $N = 20$ participants, there are exactly $20$ crosses on the scattergram, unless two participants had identical paired scores.)
  <ul>
  <li>If the cloud of points slopes <strong>upwards from bottom-left to top-right</strong> (positive gradient), it shows a <strong>positive correlation</strong> (as $X$ increases, $Y$ increases).</li>
  <li>If the cloud of points slopes <strong>downwards from top-left to bottom-right</strong> (negative gradient), it shows a <strong>negative correlation</strong> (as $X$ increases, $Y$ decreases).</li>
  <li>If the points form a random circular shotgun cloud with no slope, there is <strong>zero correlation</strong> ($r \approx 0$). The tighter the points cluster along a straight <strong>line of best fit</strong>, the stronger the correlation (closer to $+1.0$ or $-1.0$).</li>
  </ul>
</li>
</ul>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">In a content analysis of $N = 80$ post-match statements, $50$ statements were internal attributions, $20$ were external attributions, and $10$ were neutral. What is the pie-chart sector angle for the "external attributions" slice?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. $20\%$ would be $20$ out of $100$; here $20$ out of $80$ is one-quarter ($25\%$) of $360^\circ$."><span class="tutor-checkpoint-key">A</span><span>$20^\circ$</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! $\frac{20}{80} \times 360^\circ = \frac{1}{4} \times 360^\circ = 90^\circ$ (a right angle representing 25% of the circle)."><span class="tutor-checkpoint-key">B</span><span>$90^\circ$</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. $\frac{50}{80} \times 360^\circ = 225^\circ$, which is the angle for the 50 internal attributions."><span class="tutor-checkpoint-key">C</span><span>$225^\circ$</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. $\frac{10}{80} \times 360^\circ = 45^\circ$, which is the angle for the 10 neutral statements."><span class="tutor-checkpoint-key">D</span><span>$45^\circ$</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 10, title: "How to choose and justify descriptive statistics in Novel Scenarios", content: `
<p>In Unit 4 Section B, you will often be given a raw data table from an unseen study and asked: <em>"Identify which measure of central tendency and which measure of dispersion should be used to summarise these data. Justify your choices." [4 marks]</em></p>
<h4>Your 3-step decision rule for looking at any raw data table</h4>
<ol>
<li><strong>Step 1 — Check the level of measurement:</strong>
  <ul>
  <li>Are the data <strong>nominal categories</strong> (e.g. frequencies of "Pass" vs "Fail" or "Type A" vs "Type B")? $\rightarrow$ You must choose the <strong>Mode</strong> (no dispersion measure applies to nominal categories, only category percentages).</li>
  <li>Are the data <strong>ordinal ranks</strong> or <strong>interval/ratio numbers</strong>? $\rightarrow$ Move to Step 2!</li>
  </ul>
</li>
<li><strong>Step 2 — Scan the raw numbers in each column for an extreme outlier (skew):</strong>
  <ul>
  <li>Look carefully down the columns of the table! Examiners <em>love</em> hiding one massive or tiny anomalous score inside one condition (for example, nine participants score between $11$ and $16$, and Participant 10 scores $48$).</li>
  <li><strong>If there IS an extreme outlier (or the data are strictly ordinal ranks):</strong> Choose the <strong>Median</strong> and the <strong>Interquartile Range (IQR)</strong>! <em>Justification:</em> Quote the exact anomalous score from the table (e.g. "Participant 10 in Condition B scored 48 compared with 11–16 for the rest of the group") and explain that the median and IQR are unaffected by extreme outliers, whereas the mean and range/SD would be severely distorted upward.</li>
  <li><strong>If there are NO outliers and the data are interval/ratio:</strong> Choose the <strong>Mean</strong> and the <strong>Standard Deviation (SD)</strong>! <em>Justification:</em> The data are measured on an equal-interval scale with no extreme anomalous scores (quote the narrow range of scores in the table), and the mean and standard deviation are the most sensitive and precise measures because they include the exact mathematical value of every score in the dataset.</li>
  </ul>
</li>
</ol>
<h3>Practice</h3>
<p>Look at the two conditions from a social facilitation bead-threading experiment (time in seconds):<br>
<strong>Condition A (Audience present):</strong> $42, 45, 44, 41, 46, 43, 45, 42$.<br>
<strong>Condition B (Alone):</strong> $51, 54, 49, 52, 55, 50, 53, 138$.<br>
State and justify which measure of central tendency and which measure of dispersion the researcher should use to compare Condition A and Condition B. [4]</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p><strong>Central tendency:</strong> The researcher should use the <strong>Median</strong> (1 mark). <em>Justification:</em> Although time in seconds is ratio data, Condition B contains a severe extreme outlier of $138\text{ seconds}$ (where the other seven participants took $49\text{ to }55\text{ seconds}$), perhaps because the participant dropped the string; the mean of Condition B would be falsely inflated to $62.75\text{ s}$, whereas the median ($52.5\text{ s}$) is unaffected by outliers (1 mark).<br><strong>Dispersion:</strong> The researcher should use the <strong>Interquartile Range (IQR)</strong> (1 mark). <em>Justification:</em> The full Range of Condition B ($138 - 49 = 89\text{ s}$) and the Standard Deviation would be heavily distorted by the single anomalous score of $138\text{ s}$, whereas the IQR measures the spread of the middle 50% of scores ($Q_3 - Q_1$) and excludes extreme outliers (1 mark).</p></div></details>` },

{ order: 11, title: "Interpreting summary tables: what Means and SDs tell us together", content: `
<p>Another guaranteed Unit 4 Section B question gives you a small summary table showing the <strong>Mean</strong> and <strong>Standard Deviation</strong> for two conditions and asks: <em>"What do the mean and standard deviation values in Table 1 tell you about the performance of participants in this study?" [4 marks]</em></p>
<div style="border-left:4px solid #1d4ed8;background:#eff6ff;padding:0.8rem 1rem;margin:1.2rem 0;border-radius:0.4rem;">
<p style="margin:0 0 0.5rem;"><strong>Example stimulus table:</strong> A psychologist tested the number of driving-simulator hazard errors made by $20$ participants who slept for 8 hours (Control group) versus $20$ participants who slept for 4 hours (Sleep-deprived group).</p>
<table style="width:100%;border-collapse:collapse;background:#fff;font-size:0.9rem;">
<thead><tr style="background:#dbeafe;"><th style="padding:0.45rem;border:1px solid #93c5fd;">Statistic</th><th style="padding:0.45rem;border:1px solid #93c5fd;">Condition 1: 8 hours sleep</th><th style="padding:0.45rem;border:1px solid #93c5fd;">Condition 2: 4 hours sleep</th></tr></thead>
<tbody>
<tr><td style="padding:0.45rem;border:1px solid #93c5fd;font-weight:600;">Mean hazard errors</td><td style="padding:0.45rem;border:1px solid #93c5fd;">$3.2$</td><td style="padding:0.45rem;border:1px solid #93c5fd;">$9.6$</td></tr>
<tr><td style="padding:0.45rem;border:1px solid #93c5fd;font-weight:600;">Standard Deviation (SD)</td><td style="padding:0.45rem;border:1px solid #93c5fd;">$0.8$</td><td style="padding:0.45rem;border:1px solid #93c5fd;">$4.1$</td></tr>
</tbody>
</table>
</div>
<h4>How to write a 4-out-of-4 answer every time</h4>
<ol>
<li><strong>Paragraph 1 — Interpret the Means in context (2 marks):</strong> State which condition had the higher/lower mean, <em>quote both numbers</em>, and translate what that means for the operationalised DV! <br>
<em>Model wording:</em> "The mean number of driving-simulator hazard errors was three times higher in the 4-hour sleep-deprived condition ($\text{Mean} = 9.6\text{ errors}$) than in the 8-hour control condition ($\text{Mean} = 3.2\text{ errors}$), indicating that on average sleep deprivation substantially impaired driving hazard detection."</li>
<li><strong>Paragraph 2 — Interpret the Standard Deviations in context (2 marks):</strong> State which condition had the smaller/larger SD, <em>quote both numbers</em>, and explain what that shows about consistency vs spread around the mean!<br>
<em>Model wording:</em> "The standard deviation was much smaller in the 8-hour sleep condition ($\text{SD} = 0.8$) than in the 4-hour sleep-deprived condition ($\text{SD} = 4.1$). This shows that well-rested participants performed very consistently with error scores tightly clustered around their mean of $3.2$, whereas sleep-deprived participants showed wide dispersion and individual variation around their mean of $9.6$—some coped relatively well with 4 hours sleep while others made very high numbers of driving errors."</li>
</ol>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">When interpreting a table of Means and Standard Deviations in Unit 4, what must you always include alongside the psychological explanation to earn full marks?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Simply copying the numbers without explaining what they mean for average performance and spread/consistency only scores 1 mark."><span class="tutor-checkpoint-key">A</span><span>Only the numbers copied out with no explanation</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! You must quote the exact numerical figures from both conditions AND translate what the Means show about average DV performance and what the SDs show about consistency/spread around the mean in context."><span class="tutor-checkpoint-key">B</span><span>Both the quoted numerical values for each condition and a contextualised explanation of average performance (Means) and consistency/spread around the mean (SDs)</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. You cannot tell if a difference is statistically significant at $p \le 0.05$ from descriptive statistics alone without running an inferential test."><span class="tutor-checkpoint-key">C</span><span>A claim that the descriptive statistics prove $p \le 0.01$ without an inferential test</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. A larger SD means wider spread (less consistency), not tighter clustering."><span class="tutor-checkpoint-key">D</span><span>A statement that a larger SD means scores are more tightly clustered</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 12, title: "Spotting and correcting errors in student graphs and tables", content: `
<p>Examiners frequently print a flawed table or graph drawn by a fictional student and ask you to identify <strong>three or four errors or omissions</strong>. Let us run a diagnostic audit on the most common tricks examiners hide in stimulus figures:</p>
<h4>1. Five classic errors to look for in a stimulus Table</h4>
<ol>
<li><strong>Missing or vague title:</strong> Title just says "Table 1: Results" instead of naming both operationalised variables.</li>
<li><strong>Missing units in column headers:</strong> Column says "Time" or "Screen time" without specifying "(seconds)" or "(minutes per day)".</li>
<li><strong>Overlapping class intervals:</strong> e.g. $0\text{–}10,\; 10\text{–}20,\; 20\text{–}30$ instead of $0\text{–}9,\; 10\text{–}19,\; 20\text{–}29$.</li>
<li><strong>Inconsistent decimal places in summary statistics:</strong> Writing Mean of Group A as $12$ and Mean of Group B as $9.428571$ instead of rounding both consistently to 1 or 2 d.p.</li>
<li><strong>Raw scores mixed into a Results summary table:</strong> Printing 20 individual participant rows without calculating the group Mean/Median and SD/Range.</li>
</ol>
<h4>2. Five classic errors to look for in a stimulus Graph</h4>
<ol>
<li><strong>Wrong graph type for the data:</strong> Drawing touching histogram bars for discrete categories (or gaps between bars on a histogram; or a bar chart instead of a scattergram for a correlation).</li>
<li><strong>Unlabelled axes or missing units:</strong> Forgetting to label the y-axis with the DV and its units, or the x-axis with the IV conditions.</li>
<li><strong>Non-linear (uneven) scale on an axis:</strong> Jumping $0, 5, 10, 12, 13, 25$ on equal grid squares, or starting the y-axis of a bar chart at $50$ without a scale break to exaggerate a tiny difference between $52$ and $54$!</li>
<li><strong>Plotting individual participant bars instead of condition means:</strong> Drawing 24 separate bars for 24 participants in an experiment instead of 2 bars showing the Mean of Condition A and the Mean of Condition B.</li>
<li><strong>Swapped axes on a bar chart:</strong> Putting the dependent variable on the x-axis and the independent variable conditions on the y-axis.</li>
</ol>
<h3>Practice</h3>
<p>In a correlation of daily coffee cups ($X$) and anxiety score ($Y$) across $15$ participants, a student draws a bar chart with $15$ pairs of bars (one pair for each participant). State two reasons why this graph is inappropriate and state what graph should have been drawn instead.</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answer</summary><div style="margin-top:0.6rem;"><p>1. <strong>Wrong graph type for correlational data:</strong> A bar chart compares discrete categories or group means, whereas a correlational study investigates the direction and strength of a continuous relationship between two co-variables across the sample.<br>2. <strong>Cluttered individual bars obscure the relationship:</strong> Plotting 30 separate bars for 15 individual participants makes it impossible to see visually whether higher coffee consumption is associated with higher anxiety or to draw a line of best fit.<br><strong>Correct graph:</strong> The student should plot a <strong>scattergram</strong> with daily coffee consumption (cups per day) on the x-axis, anxiety score on the y-axis, and 15 plotted crosses (one per participant) around a line of best fit.</p></div></details>` },

{ order: 13, title: "Comprehensive worked calculation drill: from raw table to full summary", content: `
<p>Let us put all your Lesson 11 calculation skills together in one realistic, end-to-end Unit 4 data workout.</p>
<div style="border-left:4px solid #1d4ed8;background:#eff6ff;padding:0.8rem 1rem;margin:1.2rem 0;border-radius:0.4rem;">
<p style="margin:0;"><strong>Workout scenario:</strong> A psychologist investigated whether a 10-minute mindfulness breathing exercise before a driving test reduced somatic stress heart rate (measured in beats per minute, bpm) compared with sitting quietly for 10 minutes. Six learner drivers were randomly allocated to each condition:<br>
<strong>Condition 1 (Mindfulness breathing, bpm):</strong> $72, 68, 75, 70, 68, 73$.<br>
<strong>Condition 2 (Sitting quietly, bpm):</strong> $84, 90, 82, 88, 86, 114$.</p>
</div>
<h4>Step-by-step worked solutions</h4>
<ol>
<li><strong>Mean ($\bar{x}$) of each condition (to 1 d.p.):</strong>
  <ul>
  <li>Condition 1: $\sum x_1 = 72 + 68 + 75 + 70 + 68 + 73 = 426\text{ bpm}$. $\bar{x}_1 = \frac{426}{6} = \mathbf{71.0\text{ bpm}}$.</li>
  <li>Condition 2: $\sum x_2 = 84 + 90 + 82 + 88 + 86 + 114 = 544\text{ bpm}$. $\bar{x}_2 = \frac{544}{6} = \mathbf{90.7\text{ bpm}}$.</li>
  </ul>
</li>
<li><strong>Median of each condition:</strong>
  <ul>
  <li>Condition 1 ordered: $68,\; 68,\; \mathbf{70,\; 72},\; 73,\; 75 \rightarrow \text{Median}_1 = \frac{70 + 72}{2} = \mathbf{71.0\text{ bpm}}$.</li>
  <li>Condition 2 ordered: $82,\; 84,\; \mathbf{86,\; 88},\; 90,\; 114 \rightarrow \text{Median}_2 = \frac{86 + 88}{2} = \mathbf{87.0\text{ bpm}}$.</li>
  </ul>
</li>
<li><strong>Mode of Condition 1:</strong> $68\text{ bpm}$ appears twice $\rightarrow \mathbf{68\text{ bpm}}$ (Condition 2 has no mode).</li>
<li><strong>Range of each condition:</strong>
  <ul>
  <li>Condition 1: $75 - 68 = \mathbf{7\text{ bpm}}$.</li>
  <li>Condition 2: $114 - 82 = \mathbf{32\text{ bpm}}$ (inflated by the $114\text{ bpm}$ outlier!).</li>
  </ul>
</li>
<li><strong>Percentage decrease in Median heart rate from Sitting Quietly ($87.0$) to Mindfulness ($71.0$):</strong>
$$\frac{71.0 - 87.0}{87.0} \times 100 = \frac{-16.0}{87.0} \times 100 = \mathbf{-18.4\%}\text{ (an 18.4\% reduction to 1 d.p.)}$$</li>
</ol>
<div class="tutor-checkpoint"><div class="tutor-checkpoint-label">Tutor check-in</div><div class="tutor-checkpoint-bubble"><p class="tutor-checkpoint-question">Look at Condition 1 ($\text{Mean} = 71.0, \text{Median} = 71.0$) and Condition 2 ($\text{Mean} = 90.7, \text{Median} = 87.0$) in the workout above. Why are the Mean and Median identical in Condition 1 but $3.7\text{ bpm}$ apart in Condition 2?</p><div class="tutor-checkpoint-options"><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. The arithmetic for both conditions is completely accurate ($544 / 6 = 90.67$)."><span class="tutor-checkpoint-key">A</span><span>Because the calculator made an error in Condition 2</span></button><button type="button" class="tutor-checkpoint-option" data-correct="1" data-feedback="Exactly right! Condition 1 is symmetrically distributed between 68 and 75 bpm ($\text{Mean} = \text{Median} = 71.0$), whereas Condition 2 is positively skewed by the single extreme outlier of 114 bpm, which pulls the Mean (90.7) above the Median (87.0)."><span class="tutor-checkpoint-key">B</span><span>Because Condition 1 is symmetrical around 71 bpm, whereas Condition 2 is positively skewed by the 114 bpm outlier pulling the Mean above the Median</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. In a negative skew, the Mean is lower than the Median; here $90.7 \gt 87.0$, so it is a positive skew."><span class="tutor-checkpoint-key">C</span><span>Because Condition 2 is negatively skewed</span></button><button type="button" class="tutor-checkpoint-option" data-correct="0" data-feedback="Not quite. Heart rate in beats per minute is continuous ratio data in both conditions."><span class="tutor-checkpoint-key">D</span><span>Because heart rate is nominal data</span></button></div></div><div class="tutor-checkpoint-feedback" hidden></div></div>` },

{ order: 14, title: "Practice questions with complete worked answers and criteria", content: `
<p>Attempt all three multi-part Unit 4 calculation and interpretation questions below before checking the step-by-step worked answers.</p>
<h4>Question 1 (6 marks AO2)</h4>
<p>Eight office workers recorded the number of Daily Hassles they experienced on Monday: $\{12, 15, 9, 12, 14, 11, 13, 26\}$.<br>
(a) Calculate the mean, median, mode and range of these data. Show all your working and give your answers to 2 decimal places where appropriate. [4]<br>
(b) State and justify which measure of central tendency best represents these data. [2]</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the worked answer and criteria</summary><div style="margin-top:0.6rem;"><p>(a) <strong>Mean:</strong> $\sum x = 12 + 15 + 9 + 12 + 14 + 11 + 13 + 26 = 112$. Divide by $n = 8$: $\bar{x} = \frac{112}{8} = \mathbf{14.00\text{ hassles}}$ (1 mark).<br>
<strong>Median:</strong> Order the 8 scores from lowest to highest: $9,\; 11,\; 12,\; \mathbf{12,\; 13},\; 14,\; 15,\; 26$. Midpoint of 4th and 5th scores $= \frac{12 + 13}{2} = \mathbf{12.50\text{ hassles}}$ (1 mark).<br>
<strong>Mode:</strong> Most frequent score $= \mathbf{12\text{ hassles}}$ (appears twice) (1 mark).<br>
<strong>Range:</strong> Highest minus lowest $= 26 - 9 = \mathbf{17\text{ hassles}}$ (1 mark).<br>
(b) The <strong>Median ($12.50$)</strong> is the best measure of central tendency (1 mark) because seven of the eight office workers experienced between $9$ and $15$ hassles, whereas one worker experienced an extreme outlier of $26$ hassles, which positively skews and inflates the mean to $14.00$ (higher than six of the eight workers!) while leaving the median unaffected (1 mark).</p></div></details>

<h4>Question 2 (6 marks AO2)</h4>
<p>Six patients completed a 20-point anxiety scale after four weeks of CBT: $\{8, 10, 11, 13, 14, 16\}$.<br>
(a) Calculate the mean ($\bar{x}$) of the scores. [1]<br>
(b) Using the formula $s = \sqrt{\frac{\sum (x - \bar{x})^2}{n - 1}}$, calculate the variance ($s^2$) and standard deviation ($s$) of these scores to 2 decimal places. Show every step of your working. [5]</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the worked answer and criteria</summary><div style="margin-top:0.6rem;"><p>(a) <strong>Mean ($\bar{x}$):</strong> $\frac{8 + 10 + 11 + 13 + 14 + 16}{6} = \frac{72}{6} = \mathbf{12.00}$ (1 mark).<br>
(b) <strong>Step 1 — Deviations $(x - \bar{x})$ from $12$:</strong><br>
$8 - 12 = -4;\quad 10 - 12 = -2;\quad 11 - 12 = -1;\quad 13 - 12 = +1;\quad 14 - 12 = +2;\quad 16 - 12 = +4$ (1 mark).<br>
<strong>Step 2 — Squared deviations $(x - \bar{x})^2$:</strong><br>
$(-4)^2 = 16;\quad (-2)^2 = 4;\quad (-1)^2 = 1;\quad (+1)^2 = 1;\quad (+2)^2 = 4;\quad (+4)^2 = 16$ (1 mark).<br>
<strong>Step 3 — Sum of squared deviations $\sum (x - \bar{x})^2$:</strong><br>
$16 + 4 + 1 + 1 + 4 + 16 = \mathbf{42}$ (1 mark).<br>
<strong>Step 4 — Variance ($s^2$):</strong> Divide by $n - 1 = 6 - 1 = 5$: $s^2 = \frac{42}{5} = \mathbf{8.40}$ (1 mark).<br>
<strong>Step 5 — Standard Deviation ($s$):</strong> $s = \sqrt{8.40} = \mathbf{2.90}$ (to 2 d.p., since $2.8982\dots$ rounds to $2.90$) (1 mark).</p></div></details>

<h4>Question 3 (4 marks AO2 + AO3)</h4>
<p>In a study of $N = 120$ secondary school pupils, $78$ reported experiencing verbal bullying, $30$ reported cyberbullying, and $12$ reported physical bullying.<br>
(a) Calculate the ratio of verbal : cyber : physical bullying in its simplest whole-number form. [2]<br>
(b) Calculate the sector angle (in degrees) for each of the three categories if the researcher displays these data in a pie chart. [2]</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the worked answer and criteria</summary><div style="margin-top:0.6rem;"><p>(a) Raw ratio $= 78 : 30 : 12$. The highest common factor of $78, 30$ and $12$ is $6$. Divide all three numbers by $6$: $\frac{78}{6} : \frac{30}{6} : \frac{12}{6} = \mathbf{13 : 5 : 2}$ (2 marks).<br>
(b) Since $N = 120$, each pupil represents $\frac{360^\circ}{120} = 3^\circ$:<br>
• Verbal bullying angle $= \frac{78}{120} \times 360^\circ = 78 \times 3^\circ = \mathbf{234^\circ}$.<br>
• Cyberbullying angle $= \frac{30}{120} \times 360^\circ = 30 \times 3^\circ = \mathbf{90^\circ}$.<br>
• Physical bullying angle $= \frac{12}{120} \times 360^\circ = 12 \times 3^\circ = \mathbf{36^\circ}$.<br>
<em>Check:</em> $234^\circ + 90^\circ + 36^\circ = 360^\circ$ (2 marks).</p></div></details>` },

{ order: 15, title: "Retrieval recap and bridge to Lesson 12 (Inferential Statistical Tests)", content: `
<p>You have completed Lesson 11 on Descriptive Statistics, Distributions and Graphs. Test your recall on the ten retrieval prompts below before moving to Lesson 12.</p>
<h4>Retrieval set</h4>
<p>(a) State the formula for percentage change. (b) Write $0.00063$ and $240,000$ in standard form. (c) State the formula for the sample Mean ($\bar{x}$) and Standard Deviation ($s$). (d) Which measure of central tendency and which measure of dispersion should be chosen when interval data contain an extreme outlier? (e) In a positively skewed distribution, put the Mean, Median and Mode in order from lowest to highest. (f) What causes a negatively skewed distribution on a test (what effect)? (g) What percentage of scores in a normal distribution fall within $\pm 1\text{ SD}$ and $\pm 2\text{ SDs}$ of the mean? (h) State two structural differences between a bar chart and a histogram. (i) How do you calculate the angle of a sector in a pie chart? (j) Which graph is used to display correlational data, and how many points are plotted for $N = 25$ participants?</p>
<details style="margin:0.6rem 0 1.1rem;border:1px solid #cbd5e1;border-radius:0.5rem;padding:0.6rem 0.9rem;background:#f8fafc;"><summary style="cursor:pointer;font-weight:600;color:#1d4ed8;">Show the answers</summary><div style="margin-top:0.6rem;"><p>(a) $\frac{\text{New value} - \text{Original value}}{\text{Original value}} \times 100$. (b) $6.3 \times 10^{-4}$ and $2.4 \times 10^5$. (c) $\bar{x} = \frac{\sum x}{n}$ and $s = \sqrt{\frac{\sum (x - \bar{x})^2}{n - 1}}$. (d) The Median and the Interquartile Range (IQR, $Q_3 - Q_1$). (e) $\text{Mode} \lt \text{Median} \lt \text{Mean}$ (the right-hand tail pulls the Mean up). (f) A ceiling effect (the test was too easy, so most participants scored near the maximum while a few low outliers pulled the Mean down: $\text{Mean} \lt \text{Median} \lt \text{Mode}$). (g) Approximately $68\%$ within $\pm 1\text{ SD}$ and $95\%$ within $\pm 2\text{ SDs}$. (h) A bar chart has discrete categories on the x-axis and gaps between bars; a histogram has continuous class intervals on the x-axis and touching bars with zero gaps. (i) $\frac{\text{Category frequency}}{\text{Total } N} \times 360^\circ$. (j) A scattergram, with $25$ plotted points (one paired coordinate cross per participant).</p></div></details>
<p>In Lesson 12 we master the heart of Unit 4 statistics: <strong>Levels of Measurement, Inferential Statistical Tests (Chi-squared, Sign test, Mann–Whitney U, Wilcoxon $T$, Spearman $r_s$), Critical Value Tables, and Type I / Type II Errors</strong>.</p>` },

];