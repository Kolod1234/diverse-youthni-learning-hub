// Builds the LHS A2 2 "Organic Chemistry" chapter (CCEA Unit A2 2) in both
// the Single Award A2 and Double Award A2 Life and Health Sciences courses.
// Figures are ten custom diagrams rendered into public/lesson-assets/lhs-a2
// by scripts/lhs-a22-organic/render-diagrams.cjs. The validation and
// publishing pipeline lives in base44/shared/lhsLessonBuild.ts.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { handleLhsChapterRequest } from '../../shared/lhsLessonBuild.ts';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const FIGURES = [
  'a22-formulae-representations.png',
  'a22-functional-groups.png',
  'a22-isomerism-map.png',
  'a22-combustion-pollutants.png',
  'a22-alkene-addition.png',
  'a22-polymerisation.png',
  'a22-alcohol-oxidation.png',
  'a22-esterification.png',
  'a22-ir-spectrum.png',
  'a22-aspirin-synthesis.png',
];

const FIGURE_URLS = Object.fromEntries(
  FIGURES.map((f) => [f, '/lesson-assets/lhs-a2/' + f]),
);

const COURSES = [
  { id: '698a3d721a8a90bcc13737e7', order: 4 }, // Single Award A2
  { id: '698a3d721a8a90bcc13737e9', order: 4 }, // Double Award A2
];

const LESSON_META = {
  title: 'Organic Chemistry',
  description:
    'The chemistry of carbon, from formulae to medicines. The four ways of representing organic molecules and the homologous series that organise them; functional groups, systematic naming and the three kinds of structural isomerism; alkanes as fuels and the very different products of complete and incomplete combustion, with the pollutants of each and their consequences for health and air quality; addition across the alkene double bond, addition polymerisation from poly(ethene) to PVC and PTFE, the class-dependent oxidation of alcohols and reversible esterification; and the professional end of the subject \u2014 infrared spectroscopy used to identify bonds, and the synthesis, purification and analysis of aspirin. Aligned to CCEA GCE Life and Health Sciences Unit A2 2.',
  learning_objectives: [
    'Draw and interpret molecular, structural, displayed and skeletal formulae, recognise homologous series by their general formulae, and explain trends in physical properties down a series',
    'Identify the functional groups of alkanes, alkenes, alcohols, carboxylic acids and esters, name compounds systematically with correct position numbers, and classify pairs of molecules as chain, position or functional group isomers',
    'Write balanced equations for the complete and incomplete combustion of fuels and explain the formation, sources and effects of carbon monoxide, particulates, nitrogen oxides and sulfur dioxide, together with the measures that control them',
    'Explain addition reactions of alkenes with hydrogen, halogens, hydrogen halides and steam, including the bromine water test for unsaturation, and describe addition polymerisation, the repeat-unit notation and the properties and uses of poly(ethene), PVC and PTFE',
    'Distinguish primary, secondary and tertiary alcohols and predict and explain their oxidation products with acidified dichromate(VI), choosing distillation or reflux to stop at the aldehyde or proceed to the carboxylic acid, and describe esterification as a reversible reaction catalysed by concentrated sulfuric acid',
    'Interpret infrared spectra using characteristic absorptions of O-H, C-H, C=O and C-O bonds and the fingerprint region, and describe the synthesis of aspirin from salicylic acid and ethanoic anhydride, its purification by recrystallisation and its confirmation by melting point and infrared spectroscopy',
  ],
  content_type: 'richtext',
  section: 'CCEA Unit A2 2: Organic Chemistry',
};

export default async function (req) {
  // The chapter sits directly after the A2 2 unit guide, at order 4. On first
  // publish, every existing lesson at order 4 or above is pushed one place
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
      order: { $gte: 4 },
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