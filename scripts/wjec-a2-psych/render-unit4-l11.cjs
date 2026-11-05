/*
 * WJEC A2 Psychology, Lesson 11: Descriptive Statistics, Distributions and Graphical Representation.
 * Diagrams for pages 3, 6 and 9.
 * Run: node scripts/wjec-a2-psych/render-unit4-l11.cjs
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, line, circle, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK, TEAL } = H;

/* ---------- Page 3: Levels of measurement & descriptive statistics ---------- */
function levelsAndDescriptives() {
  const [c, x] = make(W, 1086);
  title2(x, 'Levels of measurement, central tendency and dispersion');
  sub2(x, 'Matching Nominal, Ordinal, Interval and Ratio data to the right summary statistics');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['Levels of measurement', BLUE,
      'Nominal: discrete categories with frequency counts (e.g. pass/fail, preferred music genre). Weakest level; supports the Mode.',
      'Ordinal: data that can be ranked in order, or subjective rating scales where intervals may not be equal (e.g. stress rating 1-10, class rank). Supports Median and Range/IQR.',
      'Interval / Ratio: equal objective units throughout (Interval has arbitrary zero like Celsius; Ratio has true zero like reaction time in ms or words recalled). Supports Mean and SD.'],
    ['Central tendency', PURPLE,
      'Mean: sum of all scores divided by N. Uses every value in the dataset, making it the most sensitive measure, but easily distorted by extreme outliers or skewed distributions.',
      'Median: middle value when scores are ranked in order. Unaffected by extreme outliers, making it ideal for ordinal data or skewed distributions.',
      'Mode: most frequently occurring value or category. Only measure usable with nominal categorical data, though unhelpful when data are multimodal.'],
    ['Measures of dispersion', GREEN,
      'Range: highest score minus lowest score (plus 1 when whole numbers represent continuous intervals). Quick to calculate, but depends entirely on the two most extreme values.',
      'Semi-interquartile range / IQR: spread of the middle 50% of ranked scores (Q3 - Q1), ignoring extreme tails.',
      'Standard deviation (SD): average distance of every score from the mean. Small SD = tightly clustered consistent scores; large SD = wide individual variation or outliers.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 21);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25 });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
    y = wrap(x, p[4], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'How to interpret Mean and Standard Deviation together in Unit 4',
    'Never state the mean alone when a table gives both Mean and SD. First compare the means to state the direction of the effect, then compare the standard deviations to comment on consistency and spread across participants in each condition.',
    { bodyY: 58 });
  return { file: 'psych-unit4-levels-descriptives.png' };
}

/* ---------- Page 6: Normal vs skewed distributions (plotted curves) ---------- */
function distributionsPlot() {
  const [c, x] = make(W, 1086);
  title2(x, 'Normal, positively skewed and negatively skewed distributions');
  sub2(x, 'How outliers pull the mean away from the mode and median');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const titles = [
    ['Negative skew (left tail)', RED],
    ['Normal distribution (bell curve)', BLUE],
    ['Positive skew (right tail)', PURPLE],
  ];

  cols.forEach((px, idx) => {
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, idx + 1, titles[idx][0], titles[idx][1], 20);
    // Draw axes inside panel
    const ax0 = px + 40, ax1 = px + PW - 36, ay1 = PY + 340, ay0 = PY + 115;
    line(x, ax0, ay1, ax1, ay1, { color: DARK, lw: 2 });
    line(x, ax0, ay0, ax0, ay1, { color: DARK, lw: 2 });

    // Plot curve
    x.save();
    x.beginPath();
    const steps = 80;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const xx = ax0 + t * (ax1 - ax0);
      let yNorm = 0;
      if (idx === 0) {
        // Negative skew: peak on right (t ~ 0.72), long left tail
        const u = 1 - t;
        yNorm = Math.pow(u / 0.28, 1.8) * Math.exp(1.8 * (1 - u / 0.28));
      } else if (idx === 1) {
        // Symmetric Gaussian peak at t = 0.5
        yNorm = Math.exp(-Math.pow((t - 0.5) / 0.22, 2));
      } else {
        // Positive skew: peak on left (t ~ 0.28), long right tail
        yNorm = Math.pow(t / 0.28, 1.8) * Math.exp(1.8 * (1 - t / 0.28));
      }
      const yy = ay1 - yNorm * 195;
      if (i === 0) x.moveTo(xx, yy); else x.lineTo(xx, yy);
    }
    x.strokeStyle = titles[idx][1];
    x.lineWidth = 4;
    x.stroke();
    x.restore();

    // Vertical markers for Mean, Median, Mode
    const marks = idx === 0
      ? [{ t: 0.42, lbl: 'Mean', col: RED }, { t: 0.58, lbl: 'Median', col: AMBER }, { t: 0.72, lbl: 'Mode', col: GREEN }]
      : idx === 1
      ? [{ t: 0.50, lbl: 'Mean = Median = Mode', col: BLUE }]
      : [{ t: 0.28, lbl: 'Mode', col: GREEN }, { t: 0.42, lbl: 'Median', col: AMBER }, { t: 0.58, lbl: 'Mean', col: RED }];

    marks.forEach((m, mi) => {
      const mx = ax0 + m.t * (ax1 - ax0);
      line(x, mx, ay0 + 25, mx, ay1, { color: m.col, lw: 2, dash: [6, 4] });
      text(x, m.lbl, mx, ay1 + 22 + (marks.length > 1 ? (mi % 2) * 18 : 0), { size: 14, bold: true, color: m.col });
    });
  });

  const bodies = [
    ['Cause: a very easy test (ceiling effect) where most participants score high and a few low outliers pull the tail to the left.',
     'Order from left to right: Mean < Median < Mode. Use the Median and IQR rather than the distorted Mean.'],
    ['Characteristics: symmetrical bell-shaped curve where 68.26% of scores fall within 1 SD of the mean and 95.44% within 2 SDs.',
     'Order: Mean = Median = Mode at the exact centre. Supports parametric analysis and standard deviation.'],
    ['Cause: a very hard test (floor effect) or reaction-time task where most scores are low and a few high outliers pull the tail to the right.',
     'Order from left to right: Mode < Median < Mean. The Mean is overestimated by the high tail.'],
  ];
  cols.forEach((px, idx) => {
    let y = wrap(x, bodies[idx][0], px + 24, px + PW - 24, PY + 410, { size: 17, lh: 25 });
    wrap(x, bodies[idx][1], px + 24, px + PW - 24, y + 20, { size: 17, lh: 25, color: DARK, bold: true });
  });

  band(x, 804, 250, 'Memory rule: the tail always pulls the Mean',
    'In any skewed distribution, the Mode sits at the highest peak, the Mean is dragged furthest toward the long tail by extreme outliers, and the Median always sits in the middle between the Mode and the Mean. That is why the Median is preferred whenever data are skewed.',
    { bodyY: 58 });
  return { file: 'psych-unit4-distributions-plot.png' };
}

/* ---------- Page 9: Choosing and drawing graphs ---------- */
function graphicalRepresentations() {
  const [c, x] = make(W, 1086);
  title2(x, 'Graphical representations in psychological research');
  sub2(x, 'Choosing and constructing bar charts, histograms, line graphs and scattergrams');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['Bar chart vs histogram', BLUE,
      'Bar chart: displays discrete categories on the x-axis (e.g. experimental conditions or nominal groups) and summary values (mean or frequency) on the y-axis. Bars are separated by gaps.',
      'Histogram: displays continuous interval/ratio intervals on the x-axis (e.g. score bands 0-9, 10-19) and frequency density on the y-axis. Bars touch with zero gaps to show continuity.',
      'Frequency polygon (line graph): joins midpoints of continuous intervals, useful for comparing two distributions on the same axes.'],
    ['Scattergram (correlations)', PURPLE,
      'Structure: plots two continuous co-variables (one on the x-axis, one on the y-axis) where each dot represents one participant pair of scores (x, y).',
      'Patterns: upward slope = positive correlation (as x rises, y rises); downward slope = negative correlation (as x rises, y falls); random cloud = zero correlation.',
      'Line of best fit: indicates strength by how tightly points cluster around the slope, and reveals non-linear (curvilinear) relationships like the Yerkes-Dodson law.'],
    ['Exam graph-drawing checklist', GREEN,
      '1. Informative title: state both variables/conditions and the summary measure (e.g. "Figure 1: Mean words recalled in silence vs music conditions").',
      '2. Labelled axes with units: put the IV or categories on the horizontal x-axis and the DV / frequency on the vertical y-axis, starting the y-axis at zero.',
      '3. Accurate plotting & linear scale: choose sensible equal grid steps so the plotted data fill at least half the grid without awkward fractions.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 21);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25 });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
    y = wrap(x, p[4], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'Why a scattergram cannot alone prove significance',
    'A scattergram gives an immediate visual impression of direction, strength and outliers, but visual inspection cannot tell whether a correlation in a small sample arose by chance. You must pair the scattergram with Spearman rho and compare the observed r_s against the critical value table.',
    { bodyY: 58 });
  return { file: 'psych-unit4-graphs-guide.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([levelsAndDescriptives, distributionsPlot, graphicalRepresentations], only);
  console.log(JSON.stringify(done));
})();
module.exports = { levelsAndDescriptives, distributionsPlot, graphicalRepresentations };