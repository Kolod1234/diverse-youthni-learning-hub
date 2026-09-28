// Builds the LHS A2 4 "Sound and Light" chapter (CCEA Unit A2 4) in both
// the Single Award A2 and Double Award A2 Life and Health Sciences courses.
// Figures are ten custom diagrams rendered into public/lesson-assets/lhs-a2
// by scripts/lhs-a24-sound-light/render-diagrams.cjs. The validation and
// publishing pipeline lives in base44/shared/lhsLessonBuild.ts.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { handleLhsChapterRequest } from '../../shared/lhsLessonBuild.ts';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const FIGURES = [
  'a24-sound-wave.png',
  'a24-wave-behaviour.png',
  'a24-decibel-scale.png',
  'a24-ear-structure.png',
  'a24-hearing-range.png',
  'a24-refraction.png',
  'a24-total-internal-reflection.png',
  'a24-endoscope.png',
  'a24-eye-structure.png',
  'a24-vision-correction.png',
];

const FIGURE_URLS = Object.fromEntries(
  FIGURES.map((f) => [f, '/lesson-assets/lhs-a2/' + f]),
);

const COURSES = [
  { id: '698a3d721a8a90bcc13737e7', order: 8 }, // Single Award A2
  { id: '698a3d721a8a90bcc13737e9', order: 8 }, // Double Award A2
];

const LESSON_META = {
  title: 'Sound and Light',
  description:
    'The physics of the two waves we sense most directly. Sound as a longitudinal travelling pattern of pressure, described by wavelength, frequency and amplitude through v = f\u03BB, and what waves do at boundaries \u2014 echoes, refraction and the diffraction that lets sound round corners. Loudness on the logarithmic decibel scale, the arithmetic of safe noise exposure, and the permanent damage noise does to the ear\u2019s hair cells. The ear as a signal chain \u2014 pinna, eardrum, ossicles amplifying about twentyfold, cochlea transducing vibration into nerve impulses \u2014 and human hearing, its 20 Hz to 20 kHz range, presbycusis, noise notches and audiograms. Light refracted at every change of speed, n = sin i / sin r, dispersion of white light, total internal reflection beyond the critical angle where sin C = 1/n, optical fibres and the coherent and non-coherent bundles of the endoscope; and the eye itself \u2014 cornea and lens focusing a real, inverted image on the retina, accommodation, and the concave and convex lenses that correct short and long sight. Aligned to CCEA GCE Life and Health Sciences Unit A2 4.',
  learning_objectives: [
    'Describe sound as a longitudinal wave of compressions and rarefactions, use frequency, wavelength and amplitude to characterise it, and apply v = f\u03BB to calculations',
    'Explain reflection, refraction and diffraction of sound at boundaries and use echo timing, including the round-trip distance, to find speeds and distances',
    'Use the decibel scale, level in dB = 10 log\u2081\u2080(I/I\u2080) against the 10\u207b\u00b9\u00b2 W m\u207b\u00b2 threshold of hearing, and explain how intensity, exposure time and hearing protection govern noise risk',
    'Describe the structure of the ear and explain how each part contributes to collecting, amplifying and transducing sound into nerve impulses',
    'State the range of human hearing, explain presbycusis and noise-induced hearing loss, distinguish conductive from sensorineural loss and read an audiogram for their signatures',
    'Explain refraction using the refractive index n = sin i / sin r = c/v, including dispersion of white light, and calculate angles of refraction',
    'Derive and use sin C = 1/n for the critical angle, explain the conditions for total internal reflection, and describe how optical fibres guide light',
    'Describe the endoscope, distinguishing the coherent image bundle from the non-coherent light bundle, and explain the benefits of keyhole surgery over open surgery',
    'Describe the structure and function of the eye, explain that the cornea performs most of the focusing and that the retinal image is real, inverted and diminished',
    'Explain accommodation by the ciliary muscles and lens, and explain short sight and long sight with their concave and convex correcting lenses',
  ],
  content_type: 'richtext',
  section: 'CCEA Unit A2 4: Sound and Light',
};

export default async function (req) {
  // The chapter sits directly after the A2 4 unit guide, at order 8. On first
  // publish, every existing lesson at order 8 or above is pushed one place
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
      order: { $gte: 8 },
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