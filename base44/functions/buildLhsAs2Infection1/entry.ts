// Builds the LHS AS 2 "Infection and Immunity I: Pathogens, Transmission and
// Body Defences" chapter (CCEA Unit AS 2, infection and immunity sections) in
// both the Single Award AS and Double Award AS Life and Health Sciences
// courses. Figures: three custom diagrams rendered into
// public/lesson-assets/lhs-as2 plus two OpenStax figures (CC BY-NC-SA 4.0)
// reused from the shared OpenStax asset set. The validation and publishing
// pipeline lives in base44/shared/lhsLessonBuild.ts.

import { handleLhsChapterRequest } from '../../shared/lhsLessonBuild.ts';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const FIGURES = [
  'immunity-pathogen-classes.png',
  'immunity-transmission-routes.png',
  'immunity-defence-lines.png',
  'openstax-42-8-phagocytosis-apc.png',
  'openstax-21-12-innate-adaptive.png',
];

const COURSES = [
  { id: '698a3d721a8a90bcc13737e6', order: 11 }, // Single Award AS
  { id: '698a3d721a8a90bcc13737e8', order: 14 }, // Double Award AS
];

const LESSON_META = {
  title: 'Infection and Immunity I: Pathogens, Transmission and Body Defences',
  description:
    'Pathogens and communicable disease: the four classes of pathogen, bacterial growth, why antibiotics do not touch viruses, the chain of transmission and how to break it, and the body\u2019s non-specific defences \u2014 barriers, phagocytes, inflammation, fever and complement. Aligned to CCEA GCE Life and Health Sciences Unit AS 2.',
  learning_objectives: [
    'Define pathogen, communicable disease, infection, incubation period, reservoir, carrier and vector',
    'Compare the structure and diseases of bacteria, viruses, fungi and protoctists, and explain why antibiotics work only on bacteria',
    'Model bacterial growth by binary fission and calculate population growth from a doubling time',
    'Describe the chain of transmission and match control measures to the link each one breaks',
    'Outline the three lines of defence and explain how each barrier works',
    'Describe phagocytosis, inflammation, fever and complement, and explain how the non-specific response contains a wound infection',
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