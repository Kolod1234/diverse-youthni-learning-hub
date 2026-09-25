// Builds the LHS AS 2 "Respiration" chapter (CCEA Unit AS 2, spec section on
// respiration) in both the Single Award AS and Double Award AS Life and
// Health Sciences courses. Figures are downloaded from OpenStax (CC
// BY-NC-SA 4.0) and uploaded to permanent public storage; the mitochondrion
// diagram reuses the existing Biology 2e asset in /lesson-assets.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';
import { PAGES_1 } from './pages1.ts';
import { PAGES_2 } from './pages2.ts';
import { PAGES_3 } from './pages3.ts';
import { PAGES_4 } from './pages4.ts';

const ARCHIVE = 'https://openstax.org/apps/archive/20260604.144757/resources/';

const FIGURES = [
  { hash: '47fb0cb7c154559dfc16c7ba4769704866b2164d', file: 'openstax-ap2-metab-respiration-overview.png' },
  { hash: '2a6147c3e109ac8295926abf3a16e3cf3b985148', file: 'openstax-ap2-metab-atp-structure.png' },
  { hash: '364357dcdfb48592130ea9a86bdaadd12da46480', file: 'openstax-ap2-metab-glycolysis.png' },
  { hash: '96895777af67e3af93416163e0c9b1447b5cd126', file: 'openstax-ap2-metab-link-krebs.png' },
  { hash: '3589e07e861aa242cdd9739089cfca02ffea566d', file: 'openstax-ap2-metab-oxidative-phosphorylation.png' },
  { hash: 'd7f00156507ca8b5489a817cc67c1bdf7abb875b', file: 'openstax-ap2-metab-aerobic-vs-fermentation.png' },
];

const COURSES = [
  { id: '698a3d721a8a90bcc13737e8', order: 11 }, // Double Award AS
  { id: '698a3d721a8a90bcc13737e6', order: 8 }, // Single Award AS
];

const LESSON_META = {
  title: 'Respiration',
  description:
    'Cellular respiration: ATP as the energy currency, the structure of the mitochondrion and the four stages of aerobic respiration, anaerobic respiration and oxygen debt, and the interpretation of respiration data. Aligned to CCEA GCE Life and Health Sciences Unit AS 2.',
  learning_objectives: [
    'Explain why cells require a constant supply of ATP and describe the structure of ATP and its interconversion with ADP',
    'Describe the structure of the mitochondrion and relate the outer membrane, cristae, matrix and intermembrane space to the stages of aerobic respiration',
    'Outline glycolysis, the link reaction, the Krebs cycle and oxidative phosphorylation, giving the main inputs and outputs of each stage',
    'Compare aerobic and anaerobic respiration in terms of ATP yield, the fate of pyruvate and the repayment of oxygen debt',
    'Interpret respiration data, including respiratory quotient values, oxygen uptake during recovery and the effects of exercise, and evaluate investigations into respiration',
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

    // Resolve each LESSON_ASSET token to a public figure URL: upload the
    // OpenStax figure to permanent storage, falling back to the shared
    // lesson-assets path if uploading is unavailable.
    const urls = {};
    for (const f of FIGURES) urls[f.file] = '/lesson-assets/lhs-as2/' + f.file;
    let assetMode = 'lesson-assets';
    let uploadError = null;
    try {
      const uploaded = {};
      for (const f of FIGURES) {
        const r = await fetch(ARCHIVE + f.hash, { headers: { 'user-agent': 'Mozilla/5.0' } });
        if (!r.ok) throw new Error(f.file + ': OpenStax HTTP ' + r.status);
        const bytes = await r.arrayBuffer();
        const up = await base44.asServiceRole.integrations.Core.UploadPublicFile({
          file: new Blob([bytes], { type: 'image/png' }),
        });
        if (!up || !up.file_url) throw new Error(f.file + ': no file_url returned');
        uploaded[f.file] = up.file_url;
      }
      for (const f of FIGURES) urls[f.file] = uploaded[f.file];
      assetMode = 'uploaded';
    } catch (err) {
      // Fall back to the plugin-fetched local assets for every figure.
      uploadError = err && err.message ? err.message : String(err);
    }

    const slides = pages.map(function (p) {
      const content = p.content
        .replace(CONTROL_CHARS, '')
        .replace(/LESSON_ASSET:([a-z0-9.-]+\.png)/g, function (m, file) {
          return urls[file] || m;
        });
      return { title: p.title, order: p.order, content: content };
    });

    // Validate: every asset token resolved, checkpoint markup balanced.
    const problems = [];
    slides.forEach(function (s) {
      if (/LESSON_ASSET:/.test(s.content)) problems.push('page ' + s.order + ': unresolved figure token');
      const opens = (s.content.match(/<div class="tutor-checkpoint">/g) || []).length;
      const feedbacks = (s.content.match(/class="tutor-checkpoint-feedback"/g) || []).length;
      if (opens !== feedbacks) problems.push('page ' + s.order + ': checkpoint markup mismatch');
      if ((s.content.match(/\$/g) || []).length % 2 !== 0) problems.push('page ' + s.order + ': unbalanced $ math delimiters');
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
      assetMode: assetMode,
      uploadError: uploadError,
      figureUrls: urls,
      results: results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}