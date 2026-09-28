// Builds the LHS AS 6 "Medicine, Drugs and Clinical Trials" chapter (CCEA
// Unit AS 6) in the Double Award AS Life and Health Sciences course. AS 6 is
// a Double Award unit assessed by internally assessed portfolio, so the
// chapter is not published to the Single Award AS course. Figures are eleven
// custom diagrams rendered into public/lesson-assets/lhs-as2 by
// scripts/lhs-as6-medicine/render-diagrams.cjs. The validation and publishing
// pipeline lives in base44/shared/lhsLessonBuild.ts.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { handleLhsChapterRequest } from '../../shared/lhsLessonBuild.ts';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const FIGURES = [
  'as6-medicine-structure.png',
  'as6-legal.png',
  'as6-categories.png',
  'as6-preclinical.png',
  'as6-phases.png',
  'as6-trial-design.png',
  'as6-adme.png',
  'as6-halflife.png',
  'as6-receptors.png',
  'as6-calibration.png',
  'as6-doseresponse.png',
];

const FIGURE_URLS = Object.fromEntries(
  FIGURES.map((f) => [f, '/lesson-assets/lhs-as2/' + f]),
);

const COURSES = [
  { id: '698a3d721a8a90bcc13737e8', order: 11 }, // Double Award AS only
];

const LESSON_META = {
  title: 'Medicine, Drugs and Clinical Trials',
  description:
    'How a promising molecule becomes a licensed medicine, and how scientists measure what medicines contain and do. Drugs versus medicines and the active pharmaceutical ingredient with its excipients; legal supply categories GSL, P, POM and controlled drugs; therapeutic purposes \u2014 prophylactic, curative, symptomatic, substitution and diagnostic \u2014 and natural, semi-synthetic and synthetic drug sources. Drug development from target identification and lead screening through in vitro and in vivo pre-clinical testing to the four clinical phases and post-marketing surveillance; trial design with randomisation, placebo controls, the double-blind and the ethics of informed consent and Good Clinical Practice. Pharmacokinetics \u2014 absorption, distribution, metabolism and excretion \u2014 with bioavailability, the first-pass effect, bioequivalence and exponential half-life decay; pharmacodynamics \u2014 receptors, agonists and antagonists, affinity versus efficacy, enzyme inhibitors and ion-channel blockers. Quantitative analysis through direct and back titration, dilution factors, the Beer\u2013Lambert law and calibration curves; bioassays quantal and graded, ED50 and LD50, agar diffusion zones of inhibition, sigmoid dose\u2013response curves, Emax, EC50 and potency. MHRA licensing, the Yellow Card Scheme and structured portfolio evidence aligned to CCEA GCE Life and Health Sciences Unit AS 6.',
  learning_objectives: [
    'Distinguish a drug from a medicine, define the active pharmaceutical ingredient and explain the functional roles of excipients in dosage forms',
    'Classify medicines into the legal supply categories GSL, P, POM and controlled drugs, and justify each classification from the harm unsupervised supply could allow',
    'Classify medicines by therapeutic purpose \u2014 prophylactic, curative, symptomatic, substitution and diagnostic \u2014 and by source as natural, semi-synthetic or synthetic',
    'Describe drug development from target identification and lead screening through in vitro and in vivo pre-clinical testing, and explain why pre-clinical evidence must precede human trials',
    'Describe the four clinical phases, their participants and their questions \u2014 safety, efficacy, comparison and post-marketing surveillance \u2014 and why each phase gates the next',
    'Explain how randomisation, placebo controls and the double-blind remove specific sources of bias, and the ethical frame of informed consent, ethics approval, GCP and the placebo limit',
    'Describe pharmacokinetics through the ADME chain, matching organs to stages and predicting how interactions and organ disease rescale a dose\u2019s effect',
    'Define bioavailability and the first-pass effect, explain why intravenous bioavailability is 100%, and calculate concentrations across multiple half-lives using exponential decay',
    'Define receptors, agonists and antagonists through the lock-and-key model, and distinguish affinity from efficacy, applying it to enzyme inhibitors, ion-channel blockers and antimicrobials',
    'Perform quantitative analysis: direct and back titration with full mole calculations, dilution factors, the Beer\u2013Lambert law, calibration curves and the rule of interpolation over extrapolation',
    'Explain why bioassays measure biological potency where chemical assays cannot, distinguish quantal and graded designs, and interpret ED50, LD50, Emax, EC50 and zones of inhibition',
    'Describe the MHRA marketing authorisation and Yellow Card pharmacovigilance, and structure portfolio evidence through planning, recording, analysis and honest evaluation matched to command words',
  ],
  content_type: 'richtext',
  section: 'CCEA Unit AS 6: Medicine, Drugs and Clinical Trials \u2014 Double Award compulsory',
};

export default async function (req) {
  // The chapter sits directly after the AS 6 unit guide, at order 11. On first
  // publish, every existing lesson at order 11 or above is pushed one place
  // later. This is idempotent: once the chapter exists the shift is skipped,
  // so re-running the builder only updates content.
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
      order: { $gte: 11 },
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