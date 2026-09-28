// Builds the LHS A2 8 "Histology and Pathology" chapter (CCEA Unit A2 8) in
// the Double Award A2 Life and Health Sciences course. A2 8 is an optional,
// internally assessed (portfolio) unit of the Double Award A level worth 10%,
// so the chapter is published only to the Double Award A2 course. Figures are
// ten custom diagrams rendered into public/lesson-assets/lhs-a2 by
// scripts/lhs-a28-histology/render-diagrams.cjs. The validation and
// publishing pipeline lives in base44/shared/lhsLessonBuild.ts.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { handleLhsChapterRequest } from '../../shared/lhsLessonBuild.ts';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const FIGURES = [
  'a28-lab-departments.png',
  'a28-accessioning.png',
  'a28-fixation.png',
  'a28-processing.png',
  'a28-microtomy.png',
  'a28-he-stain.png',
  'a28-light-microscope.png',
  'a28-magnification.png',
  'a28-pathology.png',
  'a28-tumours.png',
];

const FIGURE_URLS = Object.fromEntries(
  FIGURES.map((f) => [f, '/lesson-assets/lhs-a2/' + f]),
);

const COURSES = [
  { id: '698a3d721a8a90bcc13737e9', order: 15 }, // Double Award A2 only (optional unit)
];

const LESSON_META = {
  title: 'Histology and Pathology',
  description:
    'The science of preparing tissue and reading disease. The four clinical laboratory departments \u2014 histopathology, biochemistry, haematology and microbiology \u2014 and the roles of biomedical scientists and pathologists. Specimen reception: accessioning with unique laboratory numbers, mandatory request-form data and rejection criteria. The complete histological journey: fixation in 10% neutral buffered formalin against autolysis and putrefaction, grossing and block selection, tissue processing through dehydration (graded ethanol), clearing (xylene) and infiltration (paraffin wax), embedding, microtomy at 3\u20135 micrometres, and H&E staining with its charge logic \u2014 haematoxylin colouring acidic nuclei blue-purple and eosin colouring basic cytoplasm pink-red \u2014 plus special stains and preparation artefacts. The compound light microscope, magnification as eyepiece \u00d7 objective, the I = A \u00d7 M triangle with unit conversion and plausibility checks, and the 0.2 micrometre resolution limit. Legislation: the Human Tissue Act 2004 and the HTA, the Health and Safety at Work etc. Act 1974, and COSHH control of formalin and xylene. Pathology: aetiology, pathogenesis, pathological change and symptoms; classification of causes; benign versus malignant neoplasms, invasion, metastasis and margin reporting; and cytology\u2019s screening role alongside histology\u2019s diagnostic standard \u2014 aligned to CCEA GCE Life and Health Sciences Unit A2 8 as portfolio evidence.',
  learning_objectives: [
    'Distinguish the four clinical laboratory departments \u2014 histopathology, biochemistry, haematology and microbiology \u2014 by specimen type and question answered, and describe the complementary roles of biomedical scientists and pathologists',
    'Describe specimen reception and accessioning: unique laboratory numbers, mandatory request-form data, and the rejection criteria that protect patients from switched samples',
    'Explain fixation with 10% neutral buffered formalin \u2014 how it halts autolysis and putrefaction, why at least 10\u201320 times the tissue volume is used, and why large specimens must be sliced for penetration',
    'Describe grossing and tissue processing in the correct order \u2014 dehydration through graded ethanol, clearing with xylene, infiltration with molten paraffin \u2014 justifying each reagent by its miscibility with the last',
    'Explain embedding, microtomy at 3\u20135 micrometres, flotation and slide mounting, and distinguish preparation artefacts from true pathological change',
    'Explain H&E staining by charge logic \u2014 basic haematoxylin on acidic nuclei (blue-purple), acidic eosin on basic cytoplasm (pink-red) \u2014 and name the special stains PAS, Perls\u2019 Prussian blue and Ziehl\u2013Neelsen with their uses',
    'Label the compound light microscope, calculate total magnification as eyepiece \u00d7 objective, and explain why resolution (about 0.2 micrometres) caps useful magnification',
    'Apply the magnification relationship I = A \u00d7 M and its rearrangements with correct unit conversion between millimetres and micrometres, plausibility-checking every answer',
    'State the duties of the Human Tissue Act 2004 and the HTA (consent and licensing), the Health and Safety at Work etc. Act 1974 (general welfare) and COSHH (hazardous chemicals such as formalin and xylene)',
    'Describe any disease using the four-line pathological vocabulary \u2014 aetiology, pathogenesis, pathological change, symptoms and signs \u2014 and classify causes as genetic, infective, environmental, degenerative, neoplastic or immune/metabolic',
    'Distinguish benign from malignant tumours by behaviour \u2014 capsule and containment versus invasion and metastasis \u2014 and explain the pathology report\u2019s diagnosis, grade, margins and treatment implications',
    'Compare cytology with histology \u2014 the speed and minimal invasiveness of cell smears against the preserved architecture of sections \u2014 and describe the screening-to-diagnosis pathway between them',
  ],
  content_type: 'richtext',
  section: 'CCEA Unit A2 8: Histology and Pathology \u2014 Double Award optional',
};

export default async function (req) {
  // The chapter sits directly after the A2 7 unit guide, at order 15. On
  // first publish, every existing lesson at order 15 or above is pushed one
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
      order: { $gte: 15 },
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