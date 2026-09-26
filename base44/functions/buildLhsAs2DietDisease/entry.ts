// Builds the LHS AS 2 "Diet, Malnutrition and Disease" chapter (CCEA Unit AS 2,
// spec sections on malnutrition, diet-related disease and special diets) in
// both the Single Award AS and Double Award AS Life and Health Sciences
// courses. The three figures are custom diagrams rendered into
// public/lesson-assets/lhs-as2 and served from the shared lesson-assets path.
// The validation and publishing pipeline lives in base44/shared/lhsLessonBuild.ts.

import { handleLhsChapterRequest } from '../../shared/lhsLessonBuild.ts';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const FIGURES = [
  'nutrition-malnutrition-spectrum.png',
  'nutrition-diet-disease-pathways.png',
  'nutrition-global-double-burden.png',
];

const COURSES = [
  { id: '698a3d721a8a90bcc13737e6', order: 10 }, // Single Award AS
  { id: '698a3d721a8a90bcc13737e8', order: 13 }, // Double Award AS
];

const LESSON_META = {
  title: 'Diet, Malnutrition and Disease',
  description:
    'Malnutrition in both directions: protein-energy malnutrition, obesity and its management, diet-related cardiovascular disease and type 2 diabetes, food allergy and intolerance, special and therapeutic diets, the global double burden of malnutrition, and practical diet analysis. Aligned to CCEA GCE Life and Health Sciences Unit AS 2.',
  learning_objectives: [
    'Define malnutrition and distinguish undernutrition, micronutrient malnutrition and overnutrition',
    'Explain the mechanisms, features and treatment of protein-energy malnutrition, including the albumin-osmosis pathway of oedema in kwashiorkor',
    'Describe obesity as a multi-causal disease, its health consequences and the stepped approach to its management',
    'Explain the dietary pathways linking salt, fat, fibre and energy balance to cardiovascular disease and type 2 diabetes',
    'Distinguish food allergy, food intolerance and coeliac disease, and explain the principles of therapeutic and chosen diets',
    'Analyse a diet diary against reference intakes and make justified, realistic recommendations',
  ],
  content_type: 'richtext',
  section: 'CCEA Unit AS 2: Human Body Systems \u2014 Compulsory',
};

export default async function(req) {
  return handleLhsChapterRequest(req, {
    figures: FIGURES,
    courses: COURSES,
    meta: LESSON_META,
    pages: [...PAGES_1, ...PAGES_2, ...PAGES_3, ...PAGES_4],
  });
}