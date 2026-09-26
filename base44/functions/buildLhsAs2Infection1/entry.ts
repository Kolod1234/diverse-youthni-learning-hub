// Builds the LHS AS 2 "Infection and Immunity I: Pathogens, Transmission and
// Body Defences" chapter (CCEA Unit AS 2, infection and immunity sections) in
// both the Single Award AS and Double Award AS Life and Health Sciences
// courses. Figures: three custom diagrams rendered into
// public/lesson-assets/lhs-as2 plus two OpenStax figures (CC BY-NC-SA 4.0)
// reused from the shared OpenStax asset set.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const FIGURES = [
  'immunity-pathogen-classes.png',
  'immunity-transmission-routes.png',
  'immunity-defence-lines.png',
  'openstax-42-8-phagocytosis-apc.png',
  'openstax-21-12-innate-adaptive.png',
];

const COURSES = [
  { id: '698a3d721a8a90bcc13737e6', order: 11 }, // Single Award AS
  { id: '698a3d721a8a90bcc13737e8', order: 14 }, // Double Award AS
];

const LESSON_META = {
  title: 'Infection and Immunity I: Pathogens, Transmission and Body Defences',
  description:
    'Pathogens and communicable disease: the four classes of pathogen, bacterial growth, why antibiotics do not touch viruses, the chain of transmission and how to break it, and the body\u2019s non-specific defences \u2014 barriers, phagocytes, inflammation, fever and complement. Aligned to CCEA GCE Life and Health Sciences Unit AS 2.',
  learning_objectives: [
    'Define pathogen, communicable disease, infection, incubation period, reservoir, carrier and vector',
    'Compare the structure and diseases of bacteria, viruses, fungi and protoctists, and explain why antibiotics work only on bacteria',
    'Model bacterial growth by binary fission and calculate population growth from a doubling time',
    'Describe the chain of transmission and match control measures to the link each one breaks',
    'Outline the three lines of defence and explain how each barrier works',
    'Describe phagocytosis, inflammation, fever and complement, and explain how the non-specific response contains a wound infection',
  ],
  content_type: 'richtext',
  section: 'CCEA Unit AS 2: Human Body Systems \u2014 Compulsory',
};

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const pages = [...PAGES_1, ...PAGES_2, ...PAGES_3, ...PAGES_4];
    if (pages.length !== 13) {
      return Response.json({ error: 'Expected 13 authored pages, got ' + pages.length }, { status: 500 });
    }

    const urls = {};
    for (const f of FIGURES) urls[f] = '/lesson-assets/lhs-as2/' + f;

    const slides = pages.map(function (p) {
      const content = p.content
        .replace(CONTROL_CHARS, '')
        .replace(/LESSON_ASSET:([a-z0-9.-]+\.png)/g, function (m, file) {
          return urls[file] || m;
        });
      return { title: p.title, order: p.order, content: content };
    });

    const problems = [];
    slides.forEach(function (s) {
      if (/LESSON_ASSET:/.test(s.content)) problems.push('page ' + s.order + ': unresolved figure token');
      const opens = (s.content.match(/<div class="tutor-checkpoint">/g) || []).length;
      const bubbles = (s.content.match(/class="tutor-checkpoint-bubble"/g) || []).length;
      const feedbacks = (s.content.match(/class="tutor-checkpoint-feedback"/g) || []).length;
      if (opens !== feedbacks || opens !== bubbles) problems.push('page ' + s.order + ': checkpoint markup mismatch (' + opens + '/' + bubbles + '/' + feedbacks + ')');
      if ((s.content.match(/\$/g) || []).length % 2 !== 0) problems.push('page ' + s.order + ': unbalanced $ math delimiters');
      const innerQuotes = s.content.match(/data-feedback="[^">]*"[^">]*"/g) || [];
      if (innerQuotes.length > 0) problems.push('page ' + s.order + ': raw double quote inside a feedback attribute');
    });
    if (problems.length > 0) {
      return Response.json({ error: 'Validation failed', problems: problems }, { status: 500 });
    }

    const results = [];
    for (const c of COURSES) {
      const existing = await base44.entities.Lesson.filter({ course_id: c.id, title: LESSON_META.title });
      const record = Object.assign({ course_id: c.id, order: c.order }, LESSON_META, { slides: slides });
      let lesson;
      if (existing.length > 0) {
        lesson = await base44.entities.Lesson.update(existing[0].id, record);
      } else {
        lesson = await base44.entities.Lesson.create(record);
        const course = await base44.entities.Course.get(c.id);
        await base44.entities.Course.update(c.id, {
          total_lessons: (course.total_lessons || 0) + 1,
        });
      }
      results.push({
        course_id: c.id,
        lesson_id: lesson.id,
        order: c.order,
        pages: slides.length,
        checkpoints: (JSON.stringify(slides).match(/tutor-checkpoint-label/g) || []).length,
      });
    }

    return Response.json({
      ok: true,
      assetMode: 'lesson-assets',
      results: results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}