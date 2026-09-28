// Builds the LHS A2 9 "Analytical Chemistry Techniques" chapter (CCEA Unit A2 9)
// in the Double Award A2 Life and Health Sciences course. A2 9 is an optional,
// internally assessed (portfolio) unit of the Double Award A level worth 10%,
// so the chapter is published only to the Double Award A2 course. Figures are
// ten custom diagrams rendered into public/lesson-assets/lhs-a2 by
// scripts/lhs-a29-analytical-chem/render-diagrams.cjs. The validation and
// publishing pipeline lives in base44/shared/lhsLessonBuild.ts.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { handleLhsChapterRequest } from '../../shared/lhsLessonBuild.ts';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const FIGURES = [
  'a29-cations.png',
  'a29-anions.png',
  'a29-functional-groups.png',
  'a29-tlc.png',
  'a29-gc.png',
  'a29-hplc.png',
  'a29-titration.png',
  'a29-colorimetry.png',
  'a29-ir.png',
  'a29-ms.png',
];

const FIGURE_URLS = Object.fromEntries(
  FIGURES.map((f) => [f, '/lesson-assets/lhs-a2/' + f]),
);

const COURSES = [
  { id: '698a3d721a8a90bcc13737e9', order: 16 }, // Double Award A2 only (optional unit)
];

const LESSON_META = {
  title: 'Analytical Chemistry Techniques',
  description:
    'What is present, and how much. The analytical laboratory\u2019s working frame \u2014 standard operating procedures, COSHH assessments and calibration against known standards \u2014 and the two branches of analysis, qualitative and quantitative. Qualitative technique: cation identification by flame test and sodium hydroxide precipitation (copper blue, iron(II) green, iron(III) red-brown, aluminium white), the acid-first anion sequences for carbonate (limewater), halides (silver nitrate after nitric acid) and sulfate (barium chloride), and the organic functional-group tests \u2014 bromine water for alkenes, acidified dichromate for oxidisable alcohols, carbonate for carboxylic acids. Chromatography as one partition principle with three instruments: TLC and Rf values, gas chromatography with retention times and peak areas, and HPLC for non-volatile heat-sensitive compounds. Quantitative technique: the titration \u2014 burette method, meniscus reading, concordant titres, and the n = c \u00d7 V calculation carried across the equation \u2014 and colorimetry with complementary filters, calibration curves, the Beer\u2013Lambert proportionality and dilution handling beyond the linear range. Spectroscopy: infrared bond fingerprints (broad O\u2013H 3200\u20133600, sharp C=O 1650\u20131750, C\u2013H below 3000, the fingerprint region) and mass spectrometry (M\u207a and relative molecular mass, fragment patterns, base peak, isotope doublets) \u2014 closing with a complete multi-technique identification and portfolio-style practice, aligned to CCEA GCE Life and Health Sciences Unit A2 9 as portfolio evidence.',
  learning_objectives: [
    'Distinguish qualitative analysis (what is present) from quantitative analysis (how much), and describe the working frame of SOPs, COSHH risk assessment and calibration that makes any result defensible',
    'Identify cations by flame test and confirm by precipitation with dilute sodium hydroxide, giving the diagnostic colours for copper(II), iron(II), iron(III) and aluminium ions',
    'Carry out the three acid-first anion tests \u2014 carbonate with dilute acid and limewater, halides with silver nitrate after nitric acid, sulfate with barium chloride after hydrochloric acid \u2014 explaining why acid is added first',
    'Apply the organic functional-group tests \u2014 bromine water for alkenes, acidified potassium dichromate(VI) for primary and secondary alcohols, sodium carbonate for carboxylic acids \u2014 and eliminate candidates systematically',
    'Explain chromatography as partition between a stationary and a mobile phase, run a TLC plate, and calculate Rf values correctly with their validity limits',
    'Describe gas chromatography and high-performance liquid chromatography, read retention times and peak areas from a chromatogram, and choose between TLC, GC and HPLC based on volatility and heat stability',
    'Perform a titration to concordant titres and calculate an unknown concentration using n = c \u00d7 V with correct unit conversion between cubic centimetres and cubic decimetres',
    'Use a colorimeter with the complementary filter, construct and read a calibration curve within its linear range, and relate the straight line to the Beer\u2013Lambert proportionality \u2014 including the turbidity application for microbial growth',
    'Interpret infrared spectra using the key absorptions \u2014 broad O\u2013H 3200\u20133600 cm\u207b\u00b9, C=O 1650\u20131750 cm\u207b\u00b9, C\u2013H below 3000 cm\u207b\u00b9 \u2014 and use the absence of peaks as evidence',
    'Interpret mass spectra: the molecular ion and relative molecular mass, fragment and base peaks as structural fingerprints, and isotope doublets for chlorine and bromine',
    'Combine chromatography, wet tests, IR and MS into a complete, justified identification, stating what each technique contributes to the case',
    'Plan and document a portfolio-standard analysis \u2014 recording observations, safety controls, calibration status and reasoning so the work is auditable and repeatable',
  ],
  content_type: 'richtext',
  section: 'CCEA Unit A2 9: Analytical Chemistry Techniques \u2014 Double Award optional',
};

export default async function (req) {
  // The chapter sits directly after the A2 8 unit, at order 16. On first
  // publish, every existing lesson at order 16 or above is pushed one place
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
      order: { $gte: 16 },
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