// Builds the LHS AS 4 "Brain Science" chapter (CCEA Unit AS 4) in the Double
// Award AS Life and Health Sciences course. AS 4 is a Double Award compulsory
// unit, so unlike the AS 1-3 chapters it is not published to the Single Award
// AS course. Figures are nine custom diagrams rendered into
// public/lesson-assets/lhs-as2 by scripts/lhs-as4-brain-science/render-diagrams.cjs.
// The validation and publishing pipeline lives in base44/shared/lhsLessonBuild.ts.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { handleLhsChapterRequest } from '../../shared/lhsLessonBuild.ts';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const FIGURES = [
  'as4-neurone.png',
  'as4-action-potential.png',
  'as4-synapse.png',
  'as4-reflex-arc.png',
  'as4-brain-lobes.png',
  'as4-stress-response.png',
  'as4-memory-model.png',
  'as4-imaging.png',
  'as4-disorders.png',
];

const FIGURE_URLS = Object.fromEntries(
  FIGURES.map((f) => [f, '/lesson-assets/lhs-as2/' + f]),
);

const COURSES = [
  { id: '698a3d721a8a90bcc13737e8', order: 7 }, // Double Award AS only
];

const LESSON_META = {
  title: 'Brain Science',
  description:
    'How the nervous system carries information, how the brain organises its jobs, and how to investigate it. The nervous system: central and peripheral divisions and the two-way traffic between them. Neurones: dendrites, cell body, axon, myelin sheath and nodes of Ranvier, with sensory, relay and motor neurones carrying signals in, across and out. Nerve impulses: the resting potential of about minus 70 millivolts held by the sodium-potassium pump, the threshold of about minus 55 millivolts, depolarisation and repolarisation, and the all-or-nothing rule with strength coded as firing frequency. Synapses: vesicles, neurotransmitter, diffusion across the 20-nanometre cleft, receptors, one-way transmission. The reflex arc as a fast spinal circuit that decides before informing the brain. The brain: the four lobes of the cerebrum with localisation of function, the cerebellum, the brainstem, and the hypothalamus launching the fight-or-flight response through adrenaline and cortisol. Memory: the multi-store model with attention, rehearsal, encoding and retrieval, hippocampus consolidation, and long-term potentiation as the physical trace of learning. Imaging: MRI for structure, fMRI for activity, EEG for millisecond timing. Disorders: Alzheimer\u2019s, Parkinson\u2019s and depression as brain disorders with biological signatures and treatments. Research methods: designing, carrying out and reporting the internally assessed portfolio investigation. Aligned to CCEA GCE Life and Health Sciences Unit AS 4.',
  learning_objectives: [
    'Distinguish the central nervous system (brain and spinal cord) from the peripheral nervous system, and trace the inward and outward journeys signals take between them',
    'Describe the structure of a neurone — dendrites, cell body, axon, myelin sheath, nodes of Ranvier and terminals — and the routes of sensory, relay and motor neurones',
    'Explain the resting potential, threshold and all-or-nothing action potential, including depolarisation, repolarisation and the refractory period',
    'Describe synaptic transmission in the correct order — impulse arrival, vesicle release, diffusion and receptor binding — and explain why transmission is one-way',
    'Describe the reflex arc as receptor, sensory neurone, relay neurone in the spinal cord, motor neurone and effector, and explain why reflexes are fast and automatic',
    'Identify the four lobes of the cerebrum with their functions, plus the cerebellum, brainstem and hypothalamus, and apply the principle of localisation of function',
    'Describe the fight-or-flight response: the hypothalamus, the fast sympathetic route releasing adrenaline, the slower pituitary route releasing cortisol, and parasympathetic recovery',
    'Apply the multi-store model of memory — sensory register, short-term and long-term stores, attention, rehearsal, encoding and retrieval — and explain hippocampus consolidation',
    'Explain synaptic plasticity and long-term potentiation as the physical basis of learning, and justify spaced, retrieving, meaningful study habits',
    'Compare MRI, fMRI and EEG in terms of what each measures, spatial and temporal resolution, and the clinical questions each answers',
    'Describe the biological basis, symptoms and treatments of Alzheimer\u2019s disease, Parkinson\u2019s disease and depression',
    'Design, carry out and report a brain-science investigation: aim, hypothesis, variables, repeatable method, honest results with means, conclusion and an evaluation naming limitations and improvements',
  ],
  content_type: 'richtext',
  section: 'CCEA Unit AS 4: Brain Science \u2014 Double Award compulsory',
};

export default async function (req) {
  // The chapter sits directly after the AS 4 unit guide, at order 7. On first
  // publish, every existing lesson at order 7 or above is pushed one place
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
      order: { $gte: 7 },
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