// Builds the LHS AS 2 "Diet, Malnutrition and Disease" chapter (CCEA Unit AS 2,
// spec sections on malnutrition, diet-related disease and special diets) in
// both the Single Award AS and Double Award AS Life and Health Sciences
// courses. The three figures are custom diagrams rendered into
// public/lesson-assets/lhs-as2 and served from the shared lesson-assets path.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const FIGURES = [
  'nutrition-malnutrition-spectrum.png',
  'nutrition-diet-disease-pathways.png',
  'nutrition-global-double-burden.png',
];

const COURSES = [
  { id: '698a3d721a8a90bcc13737e6', order: 10 }, // Single Award AS
  { id: '698a3d721a8a90bcc13737e8', order: 13 }, // Double Award AS
];

const LESSON_META = {
  title: 'Diet, Malnutrition and Disease',
  description:
    'Malnutrition in both directions: protein-energy malnutrition, obesity and its management, diet-related cardiovascular disease and type 2 diabetes, food allergy and intolerance, special and therapeutic diets, the global double burden of malnutrition, and practical diet analysis. Aligned to CCEA GCE Life and Health Sciences Unit AS 2.',
  learning_objectives: [
    'Define malnutrition and distinguish undernutrition, micronutrient malnutrition and overnutrition',
    'Explain the mechanisms, features and treatment of protein-energy malnutrition, including the albumin-osmosis pathway of oedema in kwashiorkor',
    'Describe obesity as a multi-causal disease, its health consequences and the stepped approach to its management',
    'Explain the dietary pathways linking salt, fat, fibre and energy balance to cardiovascular disease and type 2 diabetes',
    'Distinguish food allergy, food intolerance and coeliac disease, and explain the principles of therapeutic and chosen diets',
    'Analyse a diet diary against reference intakes and make justified, realistic recommendations',
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