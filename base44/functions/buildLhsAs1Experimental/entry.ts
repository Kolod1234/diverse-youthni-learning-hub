// Builds the LHS AS 1 "Experimental Techniques" chapter (CCEA Unit AS 1) in
// both the Single Award AS and Double Award AS Life and Health Sciences
// courses. Figures are eight custom diagrams rendered into
// public/lesson-assets/lhs-as1 by scripts/lhs-as1-experimental/render-diagrams.cjs.
// The validation and publishing pipeline lives in base44/shared/lhsLessonBuild.ts.

import { handleLhsChapterRequest } from '../../shared/lhsLessonBuild.ts';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const FIGURES = [
  'as1-accuracy-precision.png',
  'as1-microscopy-magnification.png',
  'as1-aseptic-streak.png',
  'as1-standard-solution.png',
  'as1-titration-apparatus.png',
  'as1-calorimetry.png',
  'as1-chromatography.png',
  'as1-calibration-curve.png',
];

// The shared asset helper maps to /lesson-assets/lhs-as2, so this chapter
// supplies its own URL map for the AS 1 asset folder.
const FIGURE_URLS = Object.fromEntries(
  FIGURES.map((f) => [f, '/lesson-assets/lhs-as1/' + f]),
);

const COURSES = [
  { id: '698a3d721a8a90bcc13737e6', order: 2 }, // Single Award AS
  { id: '698a3d721a8a90bcc13737e8', order: 2 }, // Double Award AS
];

const LESSON_META = {
  title: 'Experimental Techniques',
  description:
    'The practical core of the qualification: planning safe and valid investigations with correct risk assessments, measuring and recording to instrument resolution, and the named techniques of the unit \u2014 light microscopy with magnification calculations, aseptic technique and culturing microorganisms, making standard solutions, titration method and calculations, calorimetry, and chromatography with colorimetry \u2014 plus the data-handling and evaluation standards the AS 1 portfolio demands. Aligned to CCEA GCE Life and Health Sciences Unit AS 1.',
  learning_objectives: [
    'Write a risk assessment using the hazard, risk and control measure structure, and identify hazards, risks and suitable controls for any practical activity',
    'Distinguish independent, dependent and control variables, and explain how control variables, repeats, accuracy and precision determine the validity and reliability of an investigation',
    'Record readings to the resolution of the instrument, use correct SI units and significant figures, and process data into proper tables, honest means and correctly constructed graphs',
    'Prepare slides, use a light microscope correctly, and calculate magnification and real specimen size including unit conversions to micrometres',
    'Use aseptic technique to streak-plate and incubate cultures safely, explaining how each practice protects both the culture and the worker',
    'Prepare standard solutions, carry out acid-base titrations to concordant titres, calculate unknown concentrations from balanced equations, and determine energy changes by calorimetry, Rf values by chromatography and concentrations by colorimeter calibration curves',
  ],
  content_type: 'richtext',
  section: 'CCEA Unit AS 1: Experimental Techniques \u2014 Compulsory',
};

export default async function(req) {
  return handleLhsChapterRequest(req, {
    figureUrls: FIGURE_URLS,
    courses: COURSES,
    meta: LESSON_META,
    pages: [...PAGES_1, ...PAGES_2, ...PAGES_3, ...PAGES_4],
  });
}