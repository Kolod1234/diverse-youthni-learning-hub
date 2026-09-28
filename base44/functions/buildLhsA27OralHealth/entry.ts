// Builds the LHS A2 7 "Oral Health and Dentistry" chapter (CCEA Unit A2 7) in
// the Double Award A2 Life and Health Sciences course. A2 7 is an optional,
// internally assessed (portfolio) unit of the Double Award A level worth 10%,
// so the chapter is published only to the Double Award A2 course. Figures are
// ten custom diagrams rendered into public/lesson-assets/lhs-a2 by
// scripts/lhs-a27-oral-health/render-diagrams.cjs. The validation and
// publishing pipeline lives in base44/shared/lhsLessonBuild.ts.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { handleLhsChapterRequest } from '../../shared/lhsLessonBuild.ts';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const FIGURES = [
  'a27-mouth.png',
  'a27-salivary-glands.png',
  'a27-dentition.png',
  'a27-tooth-section.png',
  'a27-periodontium.png',
  'a27-plaque.png',
  'a27-stephan-curve.png',
  'a27-fluoride.png',
  'a27-periodontal.png',
  'a27-dental-materials.png',
];

const FIGURE_URLS = Object.fromEntries(
  FIGURES.map((f) => [f, '/lesson-assets/lhs-a2/' + f]),
);

const COURSES = [
  { id: '698a3d721a8a90bcc13737e9', order: 14 }, // Double Award A2 only (optional unit)
];

const LESSON_META = {
  title: 'Oral Health and Dentistry',
  description:
    'The science of the mouth in health and disease. The oral cavity\u2019s two divisions \u2014 vestibule and oral cavity proper \u2014 and the structure and function of lips, cheeks, hard and soft palates and the tongue; the three major pairs of salivary glands and saliva\u2019s five roles in digestion, lubrication, buffering, antimicrobial defence and cleansing. Ingestion, mastication and surface-area calculations; the permanent heterodont dentition, the four tooth types and the dental formula; tooth structure from acellular hydroxyapatite enamel through odontoblast-maintained dentine to the living pulp, cementum and the periodontium\u2019s shock-absorbing ligament. Oral disease: the four-step plaque biofilm and caries process, lactic acid and the critical pH of 5.5, the Stephan curve\u2019s demineralisation and remineralisation windows, caries versus acid erosion, and the reversible gingivitis to irreversible periodontitis progression with its systemic links to diabetes and cardiovascular disease. Prevention: mechanical plaque control, fluoride chemistry converting hydroxyapatite to less-soluble fluorapatite (critical pH about 4.5), fissure sealants, dietary frequency and water fluoridation. Treatment: composite, glass ionomer and amalgam restorations, endodontics, and prosthetic replacement with crowns, bridges, osseointegrated implants and dentures \u2014 aligned to CCEA GCE Life and Health Sciences Unit A2 7 as portfolio evidence.',
  learning_objectives: [
    'Describe the two divisions of the oral cavity \u2014 the vestibule and the oral cavity proper \u2014 and the boundaries, muscles and functions of the lips, cheeks, hard and soft palates, uvula and tongue',
    'Locate the parotid, submandibular and sublingual salivary glands and explain the five roles of saliva: starch digestion by amylase, lubrication and bolus formation, bicarbonate buffering, antimicrobial defence and cleansing flow',
    'Explain ingestion and mastication, including the surface-area advantage that mechanical breakdown gives to enzyme action throughout the gut',
    'Identify the four tooth types with their shapes and functions, apply the dental formula I 2/2, C 1/1, PM 2/2, M 3/3, and calculate tooth totals across quadrants',
    'Describe the internal structure of a tooth \u2014 acellular enamel of hydroxyapatite, dentine with odontoblasts and tubules, the neurovascular pulp, cementum \u2014 and explain why enamel cannot regenerate once lost',
    'Name the components of the periodontium \u2014 gingiva, periodontal ligament, cementum and alveolar bone \u2014 and explain how each contributes to retaining and protecting the tooth',
    'Describe the four-step formation of dental plaque as a biofilm, from acquired pellicle through colonisation by S. mutans to acid production and demineralisation',
    'Explain the critical pH of 5.5, interpret the Stephan curve\u2019s demineralisation and remineralisation windows, and distinguish bacterial caries from direct acid erosion',
    'Evaluate prevention strategies: mechanical plaque control, interdental cleaning, dietary frequency, fissure sealants and the public-health evidence for water fluoridation',
    'Write the fluoride substitution reaction converting hydroxyapatite to fluorapatite, and explain the lowered critical pH and enhanced remineralisation it produces',
    'Distinguish reversible gingivitis from irreversible periodontitis by their signs and destroyed tissues, and describe the systemic links with type 2 diabetes and cardiovascular disease',
    'Compare restoration materials \u2014 composite resin, glass ionomer cement and amalgam \u2014 and explain endodontic treatment and prosthetic replacement with crowns, bridges, osseointegrated implants and dentures',
  ],
  content_type: 'richtext',
  section: 'CCEA Unit A2 7: Oral Health and Dentistry \u2014 Double Award optional',
};

export default async function (req) {
  // The chapter sits directly after the A2 7 unit guide, at order 14. On
  // first publish, every existing lesson at order 14 or above is pushed one
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
      order: { $gte: 14 },
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