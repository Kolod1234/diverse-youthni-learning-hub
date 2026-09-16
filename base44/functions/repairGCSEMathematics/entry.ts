import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const COURSE_TITLE = 'CCEA GCSE Mathematics';
const SPEC_URL = 'https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Mathematics%20%282017%29/GCSE%20Mathematics%20%282017%29-specification-Standard.pdf';
const UNITS = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8'];
const TOTAL_PAGES = 15;
const MIN_PAGE_WORDS = 220;
const MIN_CHAPTER_WORDS = 3300;

const PAGE_PLAN = [
  '1 Purpose of the chapter, prerequisite knowledge and every definition needed later',
  '2 Underlying principles and why the standard method works',
  '3 Core method taught in explicit micro-steps',
  '4 Representations, notation conventions and reasoning about them',
  '5 First fully worked example with every intermediate line justified',
  '6 Second and third worked examples of increasing demand',
  '7 Alternative or efficient methods and when each applies',
  '8 Conditions, special cases and exceptions',
  '9 Common misconceptions with corrected reasoning',
  '10 Real-life and cross-topic applications with a worked application',
  '11 Non-calculator and calculator technique, accuracy and checking',
  '12 Mixed examination-style practice set (questions only)',
  '13 Complete worked answers to the first half of the practice set',
  '14 Complete worked answers to the remaining practice questions',
  '15 Retrieval summary, self-check questions with answers and pathway links'
];

const SEGMENTS = [[1, 5], [6, 10], [11, 15]];

function slidesSchema(count) {
  return {
    type: 'object',
    properties: {
      description: { type: 'string' },
      learning_objectives: { type: 'array', items: { type: 'string' } },
      slides: {
        type: 'array', minItems: count, maxItems: count,
        items: {
          type: 'object',
          properties: { title: { type: 'string' }, content: { type: 'string', minLength: 1600 }, order: { type: 'number' } },
          required: ['title', 'content', 'order']
        }
      }
    },
    required: ['slides']
  };
}

function words(html) {
  return String(html || '').replace(/<[^>]*>/g, ' ').replace(/\$[^$]*\$/g, ' MATH ').trim().split(/\s+/).filter(Boolean).length;
}

function lessonWords(lesson) {
  return (lesson.slides || []).reduce((sum, slide) => sum + words(slide.content), 0);
}

function isDeficient(lesson) {
  return (lesson.slides || []).length < TOTAL_PAGES
    || lessonWords(lesson) < MIN_CHAPTER_WORDS
    || (lesson.slides || []).some(slide => words(slide.content) < MIN_PAGE_WORDS);
}

function auditLessons(lessons) {
  const unitCounts = Object.fromEntries(UNITS.map(unit => [unit, lessons.filter(lesson => (lesson.ccea_units || []).includes(unit)).length]));
  const titleCounts = lessons.reduce((counts, lesson) => ({ ...counts, [lesson.title]: (counts[lesson.title] || 0) + 1 }), {});
  return {
    total: lessons.length,
    consecutive_orders: [...lessons].sort((a, b) => a.order - b.order).every((lesson, index) => lesson.order === index + 1),
    duplicate_titles: Object.entries(titleCounts).filter(([, count]) => count > 1).map(([title]) => title),
    invalid_unit_tags: lessons.filter(lesson => (lesson.ccea_units || []).some(unit => !UNITS.includes(unit))).map(lesson => lesson.title),
    unit_counts: unitCounts,
    units_without_coverage: UNITS.filter(unit => unitCounts[unit] === 0),
    empty_lessons: lessons.filter(lesson => lessonWords(lesson) === 0).map(lesson => ({ id: lesson.id, title: lesson.title, order: lesson.order })),
    short_chapters: lessons.filter(lesson => (lesson.slides || []).length < TOTAL_PAGES).map(lesson => ({ id: lesson.id, title: lesson.title, order: lesson.order, pages: (lesson.slides || []).length })),
    deficient_lessons: lessons.filter(isDeficient).map(lesson => ({ id: lesson.id, title: lesson.title, order: lesson.order, pages: (lesson.slides || []).length, words: lessonWords(lesson) }))
  };
}

function chapterContext(lesson) {
  return `CHAPTER TITLE: ${lesson.title}
CCEA UNITS: ${(lesson.ccea_units || []).join(', ') || 'shared specification content'}
SECTION: ${lesson.section || 'CCEA GCSE Mathematics'}
CURRENT OBJECTIVES: ${(lesson.learning_objectives || []).join('; ')}`;
}

const HOUSE_STYLE = `Write for learners aged 14–16 studying the current CCEA GCSE Mathematics (2017) specification. Official specification: ${SPEC_URL}. Use British English.

Write complete textbook teaching in connected explanatory prose, not presentation notes. Define every symbol and its domain before use. Show substitutions, algebra, conversions, units, signs, restrictions, every intermediate calculation, exact and approximate forms, and a check of every result. Explain why each method applies. Use MathJax delimiters $...$ and $$...$$ with \\frac stacked fractions.

Use clean HTML only: h2, h3, p, ul, ol, table, strong, em, details, summary, and div classes worked-example, method-steps, practice-block, key-rule, notation-note, check-point and answer-block. No markdown, SVG, images, links, scripts, placeholders or filler. Never use the words clearly, simply, similarly, obviously, or after some work. Never claim original questions are official examination questions.

Every page must contain at least 450 words of prose so that at least ${MIN_PAGE_WORDS} words remain once HTML and mathematics are stripped.`;

function segmentPrompt(lesson, from, to) {
  const pages = PAGE_PLAN.slice(from - 1, to);
  return `${HOUSE_STYLE}

This chapter has exactly ${TOTAL_PAGES} navigation pages. Write ONLY pages ${from} to ${to} now, in order, using order values ${from} to ${to}. Do not repeat teaching from other pages and do not renumber.

${chapterContext(lesson)}

FULL CHAPTER PAGE PLAN (for continuity only):
${PAGE_PLAN.join('\n')}

PAGES TO WRITE NOW:
${pages.join('\n')}${from === 1 ? '\n\nAlso return a two-sentence chapter description and five specification-aligned learning objectives.' : ''}`;
}

function singlePagePrompt(lesson, pageNumber) {
  return `${HOUSE_STYLE}

Rewrite ONLY page ${pageNumber} of this ${TOTAL_PAGES}-page chapter, with order ${pageNumber}. The previous attempt was too short: this page must be substantially longer and fully taught.

${chapterContext(lesson)}

PAGE TO WRITE: ${PAGE_PLAN[pageNumber - 1]}`;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const body = await req.json();
    const action = body.action || 'audit';
    const courses = await base44.asServiceRole.entities.Course.filter({ title: COURSE_TITLE });
    const course = courses[0];
    if (!course) return Response.json({ error: 'CCEA GCSE Mathematics course not found' }, { status: 404 });
    const lessons = await base44.asServiceRole.entities.Lesson.filter({ course_id: course.id }, 'order', 300);

    if (action === 'audit') return Response.json({ course_id: course.id, declared_total: course.total_lessons, ...auditLessons(lessons) });

    if (action === 'normalise') {
      const sorted = [...lessons].sort((a, b) => a.order - b.order || new Date(a.created_date) - new Date(b.created_date));
      const titleSeen = {};
      const updates = sorted.map((lesson, index) => {
        titleSeen[lesson.title] = (titleSeen[lesson.title] || 0) + 1;
        let title = lesson.title;
        if (titleSeen[lesson.title] > 1) {
          const unitLabel = (lesson.ccea_units || []).length === 1 ? lesson.ccea_units[0] : 'Core';
          title = `${lesson.title} — ${unitLabel} Extension`;
        }
        const section = lesson.order <= 32 && /^Unit \d+:/.test(lesson.section || '')
          ? `Shared CCEA Specification Content · ${(lesson.section || '').replace(/^Unit \d+:\s*/, '')}`
          : lesson.section;
        return { id: lesson.id, order: index + 1, title, section };
      }).filter((update, index) => update.order !== sorted[index].order || update.title !== sorted[index].title || update.section !== sorted[index].section);

      if (updates.length) await base44.asServiceRole.entities.Lesson.bulkUpdate(updates);
      await base44.asServiceRole.entities.ContentVersion.create({
        entity_type: 'course', entity_id: course.id,
        version_number: Date.now(), content_snapshot: { course, lesson_index: sorted.map(lesson => ({ id: lesson.id, order: lesson.order, title: lesson.title, section: lesson.section })) },
        change_summary: 'Backup before CCEA GCSE Mathematics mapping normalisation', changed_fields: ['total_lessons', 'lesson order', 'lesson titles', 'lesson sections'],
        author_email: user.email, author_name: user.full_name || 'Administrator', is_published: false, review_status: 'draft'
      });
      await base44.asServiceRole.entities.Course.update(course.id, { total_lessons: lessons.length, syllabus_url: SPEC_URL, requires_math_pathway: true });
      const refreshed = await base44.asServiceRole.entities.Lesson.filter({ course_id: course.id }, 'order', 300);
      return Response.json({ updated: updates.length, declared_total: refreshed.length, ...auditLessons(refreshed) });
    }

    if (action !== 'repair_batch') return Response.json({ error: 'action must be audit, normalise or repair_batch' }, { status: 400 });

    const deficient = lessons.filter(isDeficient);
    const requestedId = Array.isArray(body.lesson_ids) ? body.lesson_ids[0] : body.lesson_id;
    const target = requestedId ? lessons.find(lesson => lesson.id === requestedId) : deficient[0];
    if (!target) return Response.json({ repaired: 0, remaining: deficient.length, complete: deficient.length === 0 });

    // Generate the chapter in three five-page segments to stay inside the execution window.
    let description = target.description;
    let objectives = target.learning_objectives || [];
    const slides = [];
    for (const [from, to] of SEGMENTS) {
      const segment = await base44.asServiceRole.integrations.Core.InvokeLLM({
        model: 'gpt_5_6_luna', prompt: segmentPrompt(target, from, to), response_json_schema: slidesSchema(to - from + 1)
      });
      const pages = segment?.slides || [];
      if (pages.length !== to - from + 1) throw new Error(`Segment ${from}-${to} returned ${pages.length} pages for ${target.title}`);
      if (from === 1) {
        description = segment.description || description;
        objectives = (segment.learning_objectives || []).length ? segment.learning_objectives : objectives;
      }
      pages.sort((a, b) => a.order - b.order).forEach((page, index) => slides.push({ ...page, order: from + index }));
    }

    // Page-level retries so one thin page does not force a whole-chapter regeneration.
    for (let index = 0; index < slides.length; index += 1) {
      let attempts = 0;
      while (words(slides[index].content) < MIN_PAGE_WORDS && attempts < 2) {
        attempts += 1;
        const retry = await base44.asServiceRole.integrations.Core.InvokeLLM({
          model: 'gpt_5_6_luna', prompt: singlePagePrompt(target, index + 1), response_json_schema: slidesSchema(1)
        });
        const page = (retry?.slides || [])[0];
        if (page && words(page.content) > words(slides[index].content)) slides[index] = { ...page, order: index + 1 };
      }
    }

    const thinPages = slides.filter(slide => words(slide.content) < MIN_PAGE_WORDS).map(slide => slide.order);
    if (slides.length !== TOTAL_PAGES) throw new Error(`Page validation failed for ${target.title}: ${slides.length} pages`);
    if (thinPages.length) throw new Error(`Depth validation failed for ${target.title}: pages ${thinPages.join(', ')} too short`);
    const totalWords = slides.reduce((sum, slide) => sum + words(slide.content), 0);
    if (totalWords < MIN_CHAPTER_WORDS) throw new Error(`Depth validation failed for ${target.title}: ${totalWords} words`);

    const versions = await base44.asServiceRole.entities.ContentVersion.filter({ entity_type: 'lesson', entity_id: target.id });
    await base44.asServiceRole.entities.ContentVersion.create({
      entity_type: 'lesson', entity_id: target.id, version_number: versions.reduce((max, version) => Math.max(max, version.version_number || 0), 0) + 1,
      content_snapshot: target, change_summary: 'Backup before CCEA GCSE Mathematics 15-page depth repair', changed_fields: ['slides', 'description', 'learning_objectives'],
      author_email: user.email, author_name: user.full_name || 'Administrator', is_published: false, review_status: 'draft'
    });
    await base44.asServiceRole.entities.Lesson.update(target.id, {
      description, learning_objectives: objectives, slides, content_type: 'richtext', duration_minutes: 90
    });

    const refreshed = await base44.asServiceRole.entities.Lesson.filter({ course_id: course.id }, 'order', 300);
    const report = auditLessons(refreshed);
    return Response.json({
      repaired: 1, title: target.title, order: target.order, pages: slides.length, words: totalWords,
      remaining: report.deficient_lessons.length, complete: report.deficient_lessons.length === 0
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}