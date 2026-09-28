// Builds the LHS A2 6 "Microbiology" chapter (CCEA Unit A2 6) in the Double
// Award A2 Life and Health Sciences course. A2 6 is an optional, internally
// assessed (portfolio) unit of the Double Award A level worth 10%, so the
// chapter is published only to the Double Award A2 course. Figures are ten
// custom diagrams rendered into public/lesson-assets/lhs-a2 by
// scripts/lhs-a26-microbiology/render-diagrams.cjs. The validation and
// publishing pipeline lives in base44/shared/lhsLessonBuild.ts.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { handleLhsChapterRequest } from '../../shared/lhsLessonBuild.ts';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const FIGURES = [
  'a26-scale.png',
  'a26-flora.png',
  'a26-bacterium-virus.png',
  'a26-growth-curve.png',
  'a26-aseptic.png',
  'a26-plating.png',
  'a26-serial-dilution.png',
  'a26-control.png',
  'a26-antibiotic-targets.png',
  'a26-kirby-bauer.png',
];

const FIGURE_URLS = Object.fromEntries(
  FIGURES.map((f) => [f, '/lesson-assets/lhs-a2/' + f]),
);

const COURSES = [
  { id: '698a3d721a8a90bcc13737e9', order: 12 }, // Double Award A2 only (optional unit)
];

const LESSON_META = {
  title: 'Microbiology',
  description:
    'The practical science of microorganisms and human health. Non-pathogenic, commensal and pathogenic microflora and the competitive barrier the normal flora provides; the prokaryotic bacterial cell \u2014 peptidoglycan wall, 70S ribosomes, circular DNA and plasmids \u2014 contrasted with the acellular virus and the structural reasons antibiotics cannot touch viruses. Microbial growth requirements and the four-phase batch growth curve; culture media and aseptic technique with the Bunsen convection zone, two-strip taping and incubation at or below 25 \u00b0C; streak, spread and pour plating; serial dilution, the 30\u2013300 counting rule and CFU per cm\u00b3 calculations distinguishing total from viable counts. Controlling microorganisms outside the body \u2014 sterilisation, disinfection and antisepsis with -cidal and -static vocabulary \u2014 and antibiotics inside it: four classic targets, selective toxicity, spectrum and stewardship. Disc diffusion (Kirby\u2013Bauer) testing of antimicrobials with fair-test controls; the origin and spread of antimicrobial resistance by selection on random variation; and investigation skills \u2014 variables, risk assessment, reliability and honest evaluation \u2014 structured as portfolio evidence aligned to CCEA GCE Life and Health Sciences Unit A2 6.',
  learning_objectives: [
    'Classify microorganisms as non-pathogenic, commensal or pathogenic, and explain how the commensal microflora defends the body by competing for attachment sites and nutrients',
    'Describe the structure of the prokaryotic bacterial cell \u2014 peptidoglycan wall, membrane, cytoplasm, 70S ribosomes, circular DNA, plasmids, capsule, pili and flagellum \u2014 and contrast it with the acellular virus',
    'Explain, structurally, why antibiotics attack bacteria but cannot affect viruses, and why a virus is an obligate intracellular parasite',
    'State the five conditions microbial growth requires and interpret the lag, log, stationary and death phases of the batch growth curve, including exponential doubling calculations',
    'Describe culture media and the purposes of selective and differential media, and carry out and justify each step of aseptic technique',
    'Apply the Petri dish safety rules with reasons: two-strip taping to avoid anoxic selection for anaerobes, and incubation at or below 25 \u00b0C to avoid enriching human pathogens',
    'Distinguish streak, spread and pour plating by purpose \u2014 isolation versus quantification \u2014 and read colony morphology for evidence of purity or contamination',
    'Distinguish total and viable counts, perform serial dilutions, apply the 30\u2013300 rule and calculate CFU per cm\u00b3 from plated volumes and dilution factors',
    'Distinguish sterilisation, disinfection and antisepsis with examples of each, and use -cidal and -static terminology correctly',
    'Explain antibiotic action through four classic targets and the principle of selective toxicity, and distinguish broad- and narrow-spectrum drugs with the stewardship implications of each',
    'Carry out and interpret a disc diffusion (Kirby\u2013Bauer) assay, identify the fair-test conditions a valid comparison requires, and read resistant results correctly',
    'Explain antimicrobial resistance as selection on pre-existing variation spread by plasmids, and describe the stewardship habits that slow it',
    'Plan and report a microbiology investigation as portfolio evidence: aims, hypotheses, variables, risk assessments, reliable measurement and honest evaluation linked to improvements',
  ],
  content_type: 'richtext',
  section: 'CCEA Unit A2 6: Microbiology \u2014 Double Award optional',
};

export default async function (req) {
  // The chapter sits directly after the A2 6 unit guide, at order 12. On
  // first publish, every existing lesson at order 12 or above is pushed one
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
      order: { $gte: 12 },
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