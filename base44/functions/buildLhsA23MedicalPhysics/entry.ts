// Builds the LHS A2 3 "Medical Physics" chapter (CCEA Unit A2 3) in both
// the Single Award A2 and Double Award A2 Life and Health Sciences courses.
// Figures are ten custom diagrams rendered into public/lesson-assets/lhs-a2
// by scripts/lhs-a23-medical-physics/render-diagrams.cjs. The validation and
// publishing pipeline lives in base44/shared/lhsLessonBuild.ts.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { handleLhsChapterRequest } from '../../shared/lhsLessonBuild.ts';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const FIGURES = [
  'a23-ecg-trace.png',
  'a23-blood-pressure.png',
  'a23-vitals-monitoring.png',
  'a23-eeg-waves.png',
  'a23-xray-tube.png',
  'a23-imaging-comparison.png',
  'a23-ultrasound-scan.png',
  'a23-radiation-penetration.png',
  'a23-medical-tracer.png',
  'a23-radiotherapy.png',
];

const FIGURE_URLS = Object.fromEntries(
  FIGURES.map((f) => [f, '/lesson-assets/lhs-a2/' + f]),
);

const COURSES = [
  { id: '698a3d721a8a90bcc13737e7', order: 6 }, // Single Award A2
  { id: '698a3d721a8a90bcc13737e9', order: 6 }, // Double Award A2
];

const LESSON_META = {
  title: 'Medical Physics',
  description:
    'The physics of monitoring, imaging and treating the human body. The electrical language of the heart and brain read through the ECG and EEG; blood pressure, respiratory rate, temperature and oxygen saturation as the body\u2019s vital signs; how X-rays are made and why bone casts a shadow; how contrast media and the CT scanner turn absorption into three-dimensional diagnosis; ultrasound built from piezoelectric pulses and echoes, and Doppler flow measured from the shift in their pitch; and ionising radiation harnessed deliberately \u2014 technetium-99m tracing where the body works, iodine-131 targeting the thyroid from within, radiotherapy crossing many weak beams at one strong point, and the time, distance, shielding and ALARA rules that keep every dose justified. Aligned to CCEA GCE Life and Health Sciences Unit A2 3.',
  learning_objectives: [
    'Explain how electrodes on the skin detect the summed electrical activity of the heart and brain, interpret the P wave, QRS complex and T wave of an ECG, and read the trace for rhythm and rate',
    'Describe how blood pressure is measured with a sphygmomanometer, explain the physical meaning of the systolic and diastolic readings and their normal and abnormal ranges',
    'Explain how respiratory rate, body temperature and pulse oximetry readings are taken and what each vital sign indicates about a patient\u2019s state',
    'Explain how an X-ray tube produces X-rays by thermionic emission and sudden deceleration in a tungsten target, and how differential absorption produces the shadow image',
    'Compare plain X-ray, CT and ultrasound imaging, including contrast media, fluoroscopy and the doses and risks of each, and justify the choice of technique for a given clinical question',
    'Explain the piezoelectric pulse\u2013echo principle of ultrasound scanning and calculate tissue depths from echo times, and describe how the Doppler shift measures blood flow',
    'Describe the properties of alpha, beta and gamma radiation, use half-life to reason about the activity of a sample, and explain how isotope properties are matched to diagnosis and therapy',
    'Explain how radioactive tracers such as technetium-99m and iodine-131 are chosen and used, and describe radiotherapy and the time, distance, shielding and monitoring rules that keep occupational and patient doses as low as reasonably achievable',
  ],
  content_type: 'richtext',
  section: 'CCEA Unit A2 3: Medical Physics',
};

export default async function (req) {
  // The chapter sits directly after the A2 3 unit guide, at order 6. On first
  // publish, every existing lesson at order 6 or above is pushed one place
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
      order: { $gte: 6 },
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