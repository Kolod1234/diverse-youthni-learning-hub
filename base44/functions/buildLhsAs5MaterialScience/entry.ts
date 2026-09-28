// Builds the LHS AS 5 "Material Science" chapter (CCEA Unit AS 5) in the
// Double Award AS Life and Health Sciences course. AS 5 is a Double Award
// unit, so the chapter is not published to the Single Award AS course.
// Figures are nine custom diagrams rendered into public/lesson-assets/lhs-as2
// by scripts/lhs-as5-material/render-diagrams.cjs. The validation and
// publishing pipeline lives in base44/shared/lhsLessonBuild.ts.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { handleLhsChapterRequest } from '../../shared/lhsLessonBuild.ts';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const FIGURES = [
  'as5-properties.png',
  'as5-classes.png',
  'as5-structure.png',
  'as5-alloys.png',
  'as5-biomaterials.png',
  'as5-osseointegration.png',
  'as5-smart.png',
  'as5-nano.png',
  'as5-semiconductors.png',
];

const FIGURE_URLS = Object.fromEntries(
  FIGURES.map((f) => [f, '/lesson-assets/lhs-as2/' + f]),
);

const COURSES = [
  { id: '698a3d721a8a90bcc13737e8', order: 9 }, // Double Award AS only
];

const LESSON_META = {
  title: 'Material Science',
  description:
    'Why materials behave as they do, how engineers choose them, and how modern medicine depends on both. Material properties: strength, hardness, toughness, brittleness, elasticity, ductility, malleability and fatigue, each defined precisely and distinguished from its near-neighbours. The four families of materials \u2014 metals, ceramics, polymers and composites \u2014 with the metallic, ionic, covalent-network and polymer-chain bonding that explains each family\u2019s behaviour. Alloys: how wrong-sized foreign atoms pin the sliding layers to make metals harder, the named alloys steel, stainless steel, brass and nitinol, and metal working by casting, forging, rolling and drawing, with work hardening and annealing. Biomaterials and biocompatibility as an application-specific property, corrosion and titanium\u2019s protective oxide layer, bioinert versus bioactive surfaces, and osseointegration. Smart materials including the nitinol shape-memory stent, hydrogels, thermochromic and photochromic materials and the piezoelectric effect. Nanomaterials and the surface-area explosion at the nanoscale, with benefits and risks weighed honestly. Semiconductors from pure silicon\u2019s locked bonds to n-type and p-type doping, and the diode, LED, thermistor and solar cell. Industrial considerations \u2014 cost, supply, processing, safety, sustainability \u2014 and full justified-choice reasoning chains for real devices. Aligned to CCEA GCE Life and Health Sciences Unit AS 5.',
  learning_objectives: [
    'Define and distinguish the material properties strength, hardness, toughness, brittleness, elasticity, ductility, malleability and fatigue, and choose the correct term for a given situation',
    'Classify materials into the four families \u2014 metals, ceramics, polymers and composites \u2014 and match each family\u2019s characteristic properties to the jobs it is given',
    'Explain how metallic, ionic, covalent-network and polymer-chain bonding produce malleability, conductivity, brittleness, hardness and flexibility at the atomic scale',
    'Explain why alloys are harder and stronger than pure metals, name steel, stainless steel, brass and nitinol with their constituents, and describe casting, forging, rolling, drawing, work hardening and annealing',
    'Define biomaterial and biocompatibility, and explain why biocompatibility is always application-specific',
    'Explain why corrosion resistance is essential for implants, how titanium\u2019s natural oxide layer protects it, and the difference between bioinert and bioactive materials',
    'Define osseointegration and explain how hydroxyapatite coatings invite bone to bond directly to a load-bearing implant',
    'Define smart materials through reversible stimulus-driven property change, and describe the nitinol stent, hydrogels, thermochromic and photochromic materials and the piezoelectric effect',
    'Define nanomaterials, calculate how surface area grows as material is divided, and evaluate their medical benefits alongside their risks',
    'Describe the conductivity spectrum, how n-type and p-type doping deliver charge carriers to silicon, and the diode, LED, thermistor and solar cell built from doped junctions',
    'Apply industrial considerations \u2014 cost, availability, processing, energy, safety, environment, recycling and lifetime \u2014 to justify material choices with named trade-offs',
    'Answer examination questions with precise definitions, mechanism-first explanations and justified judgements, matching command words to the answer they reward',
  ],
  content_type: 'richtext',
  section: 'CCEA Unit AS 5: Material Science \u2014 Double Award compulsory',
};

export default async function (req) {
  // The chapter sits directly after the AS 5 unit guide, at order 9. On first
  // publish, every existing lesson at order 9 or above is pushed one place
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
      order: { $gte: 9 },
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