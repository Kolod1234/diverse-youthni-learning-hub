// Shared pipeline for authoring and publishing an LHS AS 2 lesson chapter
// (13 authored pages with tutor checkpoints and /lesson-assets figures) to
// both the Single Award and Double Award AS Life and Health Sciences courses.
// Chapter builders import this module so validation and publishing stay
// identical across chapters.

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.49';

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g;

// Build the /lesson-assets URL map for figures served from the app's public
// folder (the established pattern for LHS chapters).
export function assetUrlsFromLocalFigures(figures) {
  const urls = {};
  for (const f of figures) urls[f] = '/lesson-assets/lhs-as2/' + f;
  return urls;
}

// Resolve LESSON_ASSET:<file.png> tokens to real URLs and strip invisible
// control characters that would crash the MathJax-based reader.
export function resolveSlides(pages, urls) {
  return pages.map(function (p) {
    const content = p.content
      .replace(CONTROL_CHARS, '')
      .replace(/LESSON_ASSET:([a-z0-9.-]+\.png)/g, function (m, file) {
        return urls[file] || m;
      });
    return { title: p.title, order: p.order, content: content };
  });
}

// Validate every slide: all figure tokens resolved, checkpoint markup balanced,
// math delimiters in pairs, no bare double quotes left inside feedback
// attributes (those break HTML parsing of the data-feedback attribute).
// opts.checkBubbles === false and opts.checkRawQuotes === false relax the two
// strictest checks for legacy chapters authored before them.
export function validateSlides(slides, opts) {
  const o = opts || {};
  const problems = [];
  slides.forEach(function (s) {
    if (/LESSON_ASSET:/.test(s.content)) problems.push('page ' + s.order + ': unresolved figure token');
    const opens = (s.content.match(/<div class="tutor-checkpoint">/g) || []).length;
    const feedbacks = (s.content.match(/class="tutor-checkpoint-feedback"/g) || []).length;
    if (o.checkBubbles !== false) {
      const bubbles = (s.content.match(/class="tutor-checkpoint-bubble"/g) || []).length;
      if (opens !== feedbacks || opens !== bubbles) {
        problems.push('page ' + s.order + ': checkpoint markup mismatch (' + opens + '/' + bubbles + '/' + feedbacks + ')');
      }
    } else if (opens !== feedbacks) {
      problems.push('page ' + s.order + ': checkpoint markup mismatch (' + opens + ' vs ' + feedbacks + ')');
    }
    if ((s.content.match(/\$/g) || []).length % 2 !== 0) problems.push('page ' + s.order + ': unbalanced $ math delimiters');
    if (o.checkRawQuotes !== false) {
      const innerQuotes = s.content.match(/data-feedback="[^">]*"[^">]*"/g) || [];
      if (innerQuotes.length > 0) problems.push('page ' + s.order + ': raw double quote inside a feedback attribute');
    }
  });
  return problems;
}

// Create-or-update the lesson in each course (keyed by course_id + title) and
// keep the course lesson totals in sync for newly created records.
export async function publishLessonToCourses(base44, courses, meta, slides) {
  const results = [];
  for (const c of courses) {
    const existing = await base44.entities.Lesson.filter({ course_id: c.id, title: meta.title });
    const record = Object.assign({ course_id: c.id, order: c.order }, meta, { slides: slides });
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
  return results;
}

// Standard HTTP handler for a chapter builder: admin gate, page count check,
// asset resolution, validation, publishing. config expects:
//   figures: string[] | pages: slide objects | courses | meta
//   expectedPages (default 13) | validation (opts for validateSlides)
export async function handleLhsChapterRequest(req, config) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const expected = config.expectedPages || 13;
    if (config.pages.length !== expected) {
      return Response.json({ error: 'Expected ' + expected + ' authored pages, got ' + config.pages.length }, { status: 500 });
    }

    const urls = config.figureUrls || assetUrlsFromLocalFigures(config.figures || []);
    const slides = resolveSlides(config.pages, urls);

    const problems = validateSlides(slides, config.validation);
    if (problems.length > 0) {
      return Response.json({ error: 'Validation failed', problems: problems }, { status: 500 });
    }

    const results = await publishLessonToCourses(base44, config.courses, config.meta, slides);

    return Response.json({
      ok: true,
      assetMode: 'lesson-assets',
      results: results,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}