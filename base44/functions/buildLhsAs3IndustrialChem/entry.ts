// Builds the LHS AS 3 "Aspects of Physical Chemistry in Industrial Processes"
// chapter (CCEA Unit AS 3) in both the Single Award AS and Double Award AS Life
// and Health Sciences courses. Figures are nine custom diagrams rendered into
// public/lesson-assets/lhs-as2 by scripts/lhs-as3-industrial-chem/render-diagrams.cjs.
// The validation and publishing pipeline lives in base44/shared/lhsLessonBuild.ts.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { handleLhsChapterRequest } from '../../shared/lhsLessonBuild.ts';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const FIGURES = [
  'as3-collision-theory.png',
  'as3-rate-factors.png',
  'as3-energy-profiles.png',
  'as3-bond-energies.png',
  'as3-rate-curves.png',
  'as3-calorimetry.png',
  'as3-equilibrium.png',
  'as3-lechatelier.png',
  'as3-haber.png',
];

const FIGURE_URLS = Object.fromEntries(
  FIGURES.map((f) => [f, '/lesson-assets/lhs-as2/' + f]),
);

const COURSES = [
  { id: '698a3d721a8a90bcc13737e6', order: 5 }, // Single Award AS
  { id: '698a3d721a8a90bcc13737e8', order: 5 }, // Double Award AS
];

const LESSON_META = {
  title: 'Aspects of Physical Chemistry in Industrial Processes',
  description:
    'The three tools a manufacturing chemist uses to control a reaction, applied to the Haber process and to the enzymes of the human body. Collision theory: successful collisions per second, activation energy, and why concentration, pressure, surface area, temperature and catalysts each raise the count. Energy changes: exothermic and endothermic reactions, the sign of the energy change, energy profiles with their activation-energy humps, average bond energies used to estimate the change, and calorimetry measuring heat with $q = mc\\Delta T$. Measuring rates: gas syringes, balances and disappearing-cross methods, rate curves and their gradients, average and instantaneous rates. Reversible reactions in closed systems reaching dynamic equilibrium, where rates are equal and concentrations constant, and Le Chatelier\u2019s principle predicting shifts in concentration, pressure and temperature while catalysts shift nothing. The Haber process as the engineer\u2019s compromise: about 450 degrees Celsius, about 200 atmospheres, an iron catalyst, condensing the ammonia and recycling the rest, with the Contact process as contrast. Enzymes as specific protein catalysts of the body, their active sites, optimum temperature and permanent denaturation. Aligned to CCEA GCE Life and Health Sciences Unit AS 3.',
  learning_objectives: [
    'Explain rates of reaction using collision theory, defining activation energy as the minimum energy a collision needs to react',
    'Predict and explain the effects of concentration, pressure, surface area, temperature and catalysts on rate, in terms of successful collisions per second',
    'Describe methods of measuring rates, interpret rate curves including initial gradient and plateau, and calculate average rates with units',
    'Distinguish exothermic from endothermic reactions by the sign of the energy change, and sketch and interpret energy profiles showing activation energy and the overall change',
    'Calculate energy changes from average bond energies, counting all bonds broken and made, and explain why the results are estimates',
    'Use q = mc times the temperature change in calorimetry calculations, convert to energy per mole, and explain why measured values fall below data-book values',
    'Explain how reversible reactions reach dynamic equilibrium in closed systems, where forward and reverse rates are equal and concentrations stay constant',
    'Apply Le Chatelier\u2019s principle to predict shifts caused by concentration, pressure and temperature changes, and state that a catalyst does not shift the position',
    'Describe the Haber process and justify its conditions and recycling as a compromise between yield, rate, cost and safety, with the Contact process as contrast',
    'Explain enzymes as specific biological catalysts, including active sites, the optimum temperature near body temperature, and permanent denaturation above it',
  ],
  content_type: 'richtext',
  section: 'CCEA Unit AS 3: Aspects of Physical Chemistry in Industrial Processes',
};

export default async function (req) {
  // The chapter sits directly after the AS 3 unit guide, at order 5. On first
  // publish, every existing lesson at order 5 or above is pushed one place
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
      order: { $gte: 5 },
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