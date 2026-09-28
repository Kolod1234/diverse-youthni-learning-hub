// Builds the LHS A2 10 "Enabling Technology" chapter (CCEA Unit A2 10) in
// the Double Award A2 Life and Health Sciences course. A2 10 is an optional,
// internally assessed (portfolio) unit of the Double Award A level worth 10%,
// so the chapter is published only to the Double Award A2 course. The chapter
// follows the four specification strands of the unit — equipment used in
// modern medicine, workflow in a medical laboratory, medical monitoring case
// study, and data collection and filtering. Figures are ten custom diagrams
// rendered into public/lesson-assets/lhs-a2 by
// scripts/lhs-a210-enabling-tech/render-diagrams.cjs. The validation and
// publishing pipeline lives in base44/shared/lhsLessonBuild.ts.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { handleLhsChapterRequest } from '../../shared/lhsLessonBuild.ts';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const FIGURES = [
  'a210-cycle.png',
  'a210-equipment-families.png',
  'a210-imaging.png',
  'a210-mri.png',
  'a210-pulse-ox.png',
  'a210-ecg.png',
  'a210-dialysis.png',
  'a210-lab-workflow.png',
  'a210-monitor-case.png',
  'a210-filtering.png',
];

const FIGURE_URLS = Object.fromEntries(
  FIGURES.map((f) => [f, '/lesson-assets/lhs-a2/' + f]),
);

const COURSES = [
  { id: '698a3d721a8a90bcc13737e9', order: 17 }, // Double Award A2 only (optional unit)
];

const LESSON_META = {
  title: 'Enabling Technology',
  description:
    'How equipment turns a body measurement into a safe clinical decision \u2014 built around the four strands of CCEA Unit A2 10. Strand one, equipment used in modern medicine: the four families of devices (diagnostic, monitoring, therapeutic and replacement, life support and emergency) and the shared transducer principle; diagnostic imaging compared \u2014 ultrasound echo timing with depth = speed \u00d7 time \u00f7 2 at 1540 m/s, X-ray and CT absorption contrast with justified cumulative dose, and MRI\u2019s proton alignment, radiofrequency pulse and relaxation signal, with implant screening at the scanner door because the always-on magnetic field may forcibly move ferromagnetic metal; monitoring physics \u2014 the pulse oximeter\u2019s two-wavelength ratio calibrated to SpO\u2082 with its failure modes (nail varnish, poor perfusion, carbon monoxide\u2019s falsely high reading, movement artefact), the ECG\u2019s P\u2013QRS\u2013T cycle with heart rate = 300 \u00f7 large squares between R waves, oscillometric blood pressure and cuff-size error; therapeutic equipment \u2014 haemodialysis arranged around a semipermeable membrane, counter-current dialysate with zero urea, diffusion of waste against retention of cells and proteins, ultrafiltration of water, heparin and the protective rituals; pacemakers and infusion pumps. Strand two, workflow in a medical laboratory: the eight-step journey from request and bedside labelling through transport, accessioning, calibrated and QC-checked analysis, validation with delta checks, reporting and action; turnaround time and the rule-bound shortcut of point-of-care testing. Strand three, the medical monitoring case study: alarm limits set for the individual patient, the nurse\u2019s patient-first assessment, documentation and escalation, and the alarm-fatigue judgement. Strand four, data collection and filtering: sampling rate against the fastest real change, resolution, accuracy against precision and repeatability, two-point zero-and-span calibration; noise, artefact and baseline drift removed by moving averages, median filters and baseline correction \u2014 always recording raw data so the filtering can be checked; closing with equipment evaluation (MHRA classes, five-year ownership cost) and a complete portfolio task \u2014 aligned to CCEA GCE Life and Health Sciences Unit A2 10 as portfolio evidence.',
  learning_objectives: [
    'Explain the monitoring loop \u2014 patient, transducer, filtered signal, display and alarm, clinical decision, treatment \u2014 and locate the four strands of the unit within it',
    'Classify medical devices into the four families \u2014 diagnostic, monitoring, therapeutic and replacement, life support and emergency \u2014 and state the transducer principle common to all of them',
    'Compare ultrasound, X-ray/CT and MRI by mechanism, dose and safety, and calculate tissue depth from ultrasound echo time using depth = speed \u00d7 time \u00f7 2',
    'Explain MRI\u2019s mechanism from proton alignment through radiofrequency tipping to the relaxation signal, and apply implant screening as the control that decides who may enter the scanner',
    'Explain pulse oximetry from the two-wavelength absorbance ratio to the calibrated SpO\u2082 reading, and name its failure modes including carbon monoxide\u2019s falsely high value',
    'Label the ECG\u2019s P\u2013QRS\u2013T cycle with the physiological event each wave represents, calculate heart rate as 300 \u00f7 the number of large squares between R waves, and verify it by converting squares to seconds',
    'Describe haemodialysis as a semipermeable-membrane system \u2014 what leaves the blood by diffusion and ultrafiltration, what is retained, and why the dialysate contains no urea \u2014 and the protective rituals of heparin, asepsis and air detection',
    'Set out the eight-stage laboratory workflow from request to action, explain bedside labelling as the identity control, and define turnaround time and the rules point-of-care testing must still obey',
    'Set patient-specific alarm limits with reasoning, describe the response to an alarm as patient-first assessment followed by action and documentation, and explain alarm fatigue as the judgement that governs limit setting',
    'Choose a sampling rate from the fastest real change, distinguish resolution, accuracy, precision and repeatability, and apply two-point zero-and-span calibration to any device',
    'Distinguish noise, artefact and baseline drift in raw monitoring data and remove them with moving averages, median filters and baseline correction \u2014 recording raw data and declaring the filter used',
    'Evaluate a piece of equipment for purchase against the full checklist \u2014 accuracy, repeatability, resolution, usability, reliability, maintenance, safety features and five-year ownership cost \u2014 and assemble a complete four-strand portfolio case study with dated, checkable evidence',
  ],
  content_type: 'richtext',
  section: 'CCEA Unit A2 10: Enabling Technology \u2014 Double Award optional',
};

export default async function (req) {
  // The chapter sits directly after the A2 9 unit, at order 17. On first
  // publish, every existing lesson at order 17 or above is pushed one place
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
      order: { $gte: 17 },
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