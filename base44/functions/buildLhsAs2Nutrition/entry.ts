// Builds the LHS AS 2 "Nutrition and the Balanced Diet" chapter (CCEA Unit AS 2,
// spec sections on nutrition, the balanced diet, energy balance and dietary
// analysis) in both the Single Award AS and Double Award AS Life and Health
// Sciences courses. The four figures are custom diagrams rendered into
// public/lesson-assets/lhs-as2 by scripts/lhs-as2-nutrition/render-diagrams.cjs
// and are served directly from the shared lesson-assets path. The validation
// and publishing pipeline lives in base44/shared/lhsLessonBuild.ts.

import { handleLhsChapterRequest } from '../../shared/lhsLessonBuild.ts';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const FIGURES = [
  'nutrition-energy-density.png',
  'nutrition-eatwell-proportions.png',
  'nutrition-energy-balance.png',
  'nutrition-bmi-categories.png',
];

const COURSES = [
  { id: '698a3d721a8a90bcc13737e6', order: 9 }, // Single Award AS
  { id: '698a3d721a8a90bcc13737e8', order: 12 }, // Double Award AS
];

const LESSON_META = {
  title: 'Nutrition and the Balanced Diet',
  description:
    'Macronutrients, micronutrients, water and fibre; how the energy in food is measured and calculated; the Eatwell Guide, energy balance, body mass index and the interpretation of food labels. Aligned to CCEA GCE Life and Health Sciences Unit AS 2.',
  learning_objectives: [
    'Classify the nutrient groups and state the energy each macronutrient provides per gram',
    'Describe the structure, sources, digestion products and functions of carbohydrates, lipids and proteins, including essential amino acids and essential fatty acids',
    'Describe the roles and deficiency diseases of the fat-soluble and water-soluble vitamins and the key minerals, and explain why water and dietary fibre are essential',
    'Apply the Eatwell Guide and the concept of energy balance, and estimate daily energy requirements from basal metabolic rate and physical activity level',
    'Calculate the energy value of foods and meals, interpret food labels, and calculate and evaluate body mass index, recognising its limitations',
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