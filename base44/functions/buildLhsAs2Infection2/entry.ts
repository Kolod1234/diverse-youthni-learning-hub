// Builds the LHS AS 2 "Infection and Immunity II: Specific Immunity,
// Vaccination and Epidemiology" chapter (CCEA Unit AS 2) in both the Single
// Award AS and Double Award AS Life and Health Sciences courses. Figures:
// five custom diagrams rendered into public/lesson-assets/lhs-as2 plus three
// OpenStax figures (CC BY-NC-SA 4.0) reused from the shared asset set. The
// validation and publishing pipeline lives in base44/shared/lhsLessonBuild.ts.

import { handleLhsChapterRequest } from '../../shared/lhsLessonBuild.ts';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const FIGURES = [
  'immunity2-antibody-anatomy.png',
  'immunity2-primary-secondary-response.png',
  'immunity2-herd-immunity.png',
  'immunity2-amr-selection.png',
  'immunity2-epidemic-curve.png',
  'openstax-21-21-antibody-structure.png',
  'openstax-21-23-b-cell-clonal-selection.png',
  'openstax-42-18-vaccine-injection.png',
];

const COURSES = [
  { id: '698a3d721a8a90bcc13737e6', order: 12 }, // Single Award AS
  { id: '698a3d721a8a90bcc13737e8', order: 15 }, // Double Award AS
];

const LESSON_META = {
  title: 'Infection and Immunity II: Specific Immunity, Vaccination and Epidemiology',
  description:
    'The specific immune response: antigens and self-recognition, B and T lymphocytes, antibody structure and the humoral response, the cell-mediated response, primary and secondary responses and memory, vaccination and herd immunity, antibiotics and antimicrobial resistance, and how epidemiology measures disease in populations. Aligned to CCEA GCE Life and Health Sciences Unit AS 2.',
  learning_objectives: [
    'Define antigen, antibody, lymphocyte and memory cell, and explain how the body distinguishes self from non-self',
    'Describe the origin, maturation and roles of B and T lymphocytes, and explain clonal selection and clonal expansion',
    'Describe the structure of an antibody and explain how its variable and constant regions give it specificity and function',
    'Compare the primary and secondary immune responses and explain the role of memory cells',
    'Explain how vaccination produces immunity, distinguish active from passive immunity, and calculate the vaccination coverage needed for herd immunity',
    'Explain how antibiotics act selectively, how resistance evolves by natural selection, and how epidemiology measures disease in populations',
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