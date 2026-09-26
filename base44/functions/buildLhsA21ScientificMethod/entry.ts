// Builds the LHS A2 1 "Scientific Method, Investigation, Analysis and
// Evaluation" chapter (CCEA Unit A2 1) in both the Single Award A2 and Double
// Award A2 Life and Health Sciences courses. Figures are six custom diagrams
// rendered into public/lesson-assets/lhs-a2 by
// scripts/lhs-a21-scientific-method/render-diagrams.cjs. The validation and
// publishing pipeline lives in base44/shared/lhsLessonBuild.ts.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { handleLhsChapterRequest } from '../../shared/lhsLessonBuild.ts';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const FIGURES = [
  'a21-scientific-cycle.png',
  'a21-sampling-methods.png',
  'a21-central-tendency.png',
  'a21-normal-distribution.png',
  'a21-error-bars.png',
  'a21-chi-squared.png',
];

const FIGURE_URLS = Object.fromEntries(
  FIGURES.map((f) => [f, '/lesson-assets/lhs-a2/' + f]),
);

const COURSES = [
  { id: '698a3d721a8a90bcc13737e7', order: 2 }, // Single Award A2
  { id: '698a3d721a8a90bcc13737e9', order: 2 }, // Double Award A2
];

const LESSON_META = {
  title: 'Scientific Method, Investigation, Analysis and Evaluation',
  description:
    'The compulsory thinking unit of A2: how science actually works and how it is judged. The scientific method and the language of hypotheses, theories and laws; the quality of evidence, from peer review and replication to bias, sampling and ethics; the design of valid investigations with pilot studies, control groups and blind procedures; the statistical toolkit of the unit \u2014 measures of central tendency and dispersion, the normal distribution, graphs with error bars, significance testing, the t-test, the chi-squared test and Spearman\u2019s rank correlation \u2014 and the evaluation and reporting standards the internally assessed coursework demands. Aligned to CCEA GCE Life and Health Sciences Unit A2 1.',
  learning_objectives: [
    'Describe the cycle of the scientific method, distinguish observation, hypothesis, prediction, theory and law, and explain what makes a hypothesis testable and falsifiable',
    'Evaluate the quality of scientific evidence using peer review, replication, sample size and sources of bias, and apply the ethical principles of informed consent, confidentiality and risk versus benefit to scientific investigations',
    'Design valid investigations with clearly identified variables, appropriate control groups, blind and double-blind procedures, pilot studies and written protocols that others can replicate',
    'Select and justify sampling methods \u2014 random, systematic and stratified \u2014 and explain how sample size and sampling bias affect the reliability of conclusions',
    'Calculate and interpret measures of central tendency and dispersion, use the normal distribution, construct appropriate graphs with error bars, and judge what overlapping or separated error bars do and do not show',
    'Carry out and interpret the t-test, the chi-squared test and Spearman\u2019s rank correlation using null hypotheses, degrees of freedom, critical values and probability levels, and evaluate and report investigations in the structure the unit coursework expects',
  ],
  content_type: 'richtext',
  section: 'CCEA Unit A2 1: Scientific Method, Investigation, Analysis and Evaluation \u2014 Compulsory',
};

export default async function (req) {
  // The chapter sits directly after the A2 1 unit guide, at order 2. On first
  // publish, every existing lesson at order 2 or below-shift is pushed one
  // place later. This is idempotent: once the chapter exists the shift is
  // skipped, so re-running the builder only updates content.
  const base44 = createClientFromRequest(req);
  const user = await base44.auth.me();
  if (!user || user.role !== 'admin') {
    return Response.json({ error: 'Admin access required' }, { status: 403 });
  }
  for (const c of COURSES) {
    const existing = await base44.entities.Lesson.filter({
      course_id: c.id,
      title: LESSON_META.title,
    });
    if (existing.length > 0) continue;
    const later = await base44.entities.Lesson.filter({
      course_id: c.id,
      order: { $gte: 2 },
    });
    if (later.length > 0) {
      await base44.entities.Lesson.bulkUpdate(
        later.map((l) => ({ id: l.id, order: l.order + 1 })),
      );
    }
  }
  return handleLhsChapterRequest(req, {
    figureUrls: FIGURE_URLS,
    courses: COURSES,
    meta: LESSON_META,
    pages: [...PAGES_1, ...PAGES_2, ...PAGES_3, ...PAGES_4],
  });
}