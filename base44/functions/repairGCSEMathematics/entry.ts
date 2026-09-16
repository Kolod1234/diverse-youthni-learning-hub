import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const COURSE_TITLE = 'CCEA GCSE Mathematics';
const SPEC_URL = 'https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Mathematics%20%282017%29/GCSE%20Mathematics%20%282017%29-specification-Standard.pdf';
const UNITS = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8'];
const MIN_WORDS = 1500;

const lessonSchema = {
  type: 'object',
  properties: {
    lessons: {
      type: 'array', minItems: 1, maxItems: 1,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          description: { type: 'string' },
          learning_objectives: { type: 'array', items: { type: 'string' } },
          slides: {
            type: 'array', minItems: 8, maxItems: 8,
            items: {
              type: 'object',
              properties: { title: { type: 'string' }, content: { type: 'string', minLength: 1600 }, order: { type: 'number' } },
              required: ['title', 'content', 'order']
            }
          }
        },
        required: ['id', 'description', 'learning_objectives', 'slides']
      }
    }
  },
  required: ['lessons']
};

function words(html) {
  return String(html || '').replace(/<[^>]*>/g, ' ').replace(/\$[^$]*\$/g, ' MATH ').trim().split(/\s+/).filter(Boolean).length;
}

function lessonWords(lesson) {
  return (lesson.slides || []).reduce((sum, slide) => sum + words(slide.content), 0);
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
    shallow_lessons: lessons.filter(lesson => lessonWords(lesson) < MIN_WORDS).map(lesson => ({ id: lesson.id, title: lesson.title, order: lesson.order, words: lessonWords(lesson) }))
  };
}

function generationPrompt(targets) {
  return `Rebuild the requested chapters for learners aged 14–16 studying the current CCEA GCSE Mathematics (2017) specification. Official specification: ${SPEC_URL}.

Return exactly one chapter for each target, preserving its id. Its ccea_units identify the official assessment units it supports; do not add topics outside the supplied title and unit scope. Completion units are cumulative, but teach the named topic at the appropriate demand. Use British English. Never claim original questions are official examination questions.

Each chapter must have exactly 8 substantive navigation pages and at least 2,000 words in total; every page must contain at least 220 words after HTML is removed: 1 purpose, prerequisites and definitions; 2 core method with micro-steps; 3 representations and reasoning; 4 two complete worked examples; 5 applications and misconceptions; 6 mixed examination-style practice; 7 complete worked answers to every question and subpart; 8 retrieval, checks and pathway links. Define symbols and domains before use. Show substitutions, algebra, conversions, units, signs, restrictions, intermediate calculations, exact and approximate forms, and a check of every result. Explain why each method applies. Use MathJax delimiters $...$ and $$...$$ with stacked fractions. Include at least five complete worked examples overall and at least eight original practice questions with full answers.

Use clean HTML only: h2, h3, p, ul, ol, table, strong, em, details, summary, and div classes worked-example, method-steps, practice-block, key-rule, notation-note, check-point and answer-block. No markdown, SVG, images, links, scripts, placeholders, filler, or the words clearly, simply, similarly, obviously, or after some work.

Targets:\n${targets.map(target => `ID: ${target.id}\nTITLE: ${target.title}\nCCEA UNITS: ${(target.ccea_units || []).join(', ')}\nCURRENT OBJECTIVES: ${(target.learning_objectives || []).join('; ')}`).join('\n\n')}`;
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
    const requestedIds = Array.isArray(body.lesson_ids) ? body.lesson_ids.slice(0, 1) : [];
    const shallow = lessons.filter(lesson => lessonWords(lesson) < MIN_WORDS);
    const targets = requestedIds.length ? requestedIds.map(id => shallow.find(lesson => lesson.id === id)).filter(Boolean) : shallow.slice(0, 1);
    if (!targets.length) return Response.json({ repaired: 0, remaining: shallow.length, complete: shallow.length === 0 });

    const generated = await base44.asServiceRole.integrations.Core.InvokeLLM({
      model: 'gpt_5_6_luna', prompt: generationPrompt(targets), response_json_schema: lessonSchema
    });
    const drafts = generated?.lessons || [];
    if (drafts.length !== targets.length) throw new Error('Generation returned an incomplete batch');

    const updates = [];
    for (const target of targets) {
      const draft = drafts.find(item => item.id === target.id);
      if (!draft || draft.slides.length !== 8 || !draft.slides.every((slide, index) => slide.order === index + 1)) throw new Error(`Page validation failed for ${target.title}`);
      const totalWords = draft.slides.reduce((sum, slide) => sum + words(slide.content), 0);
      if (totalWords < MIN_WORDS) throw new Error(`Depth validation failed for ${target.title}: ${totalWords} words`);
      const versions = await base44.asServiceRole.entities.ContentVersion.filter({ entity_type: 'lesson', entity_id: target.id });
      await base44.asServiceRole.entities.ContentVersion.create({
        entity_type: 'lesson', entity_id: target.id, version_number: versions.reduce((max, version) => Math.max(max, version.version_number || 0), 0) + 1,
        content_snapshot: target, change_summary: 'Backup before CCEA GCSE Mathematics depth repair', changed_fields: ['slides', 'description', 'learning_objectives'],
        author_email: user.email, author_name: user.full_name || 'Administrator', is_published: false, review_status: 'draft'
      });
      updates.push({ id: target.id, description: draft.description, learning_objectives: draft.learning_objectives, slides: draft.slides, content_type: 'richtext', duration_minutes: 90 });
    }
    await base44.asServiceRole.entities.Lesson.bulkUpdate(updates);
    const refreshed = await base44.asServiceRole.entities.Lesson.filter({ course_id: course.id }, 'order', 300);
    const report = auditLessons(refreshed);
    return Response.json({ repaired: updates.length, titles: targets.map(target => target.title), remaining: report.shallow_lessons.length, complete: report.shallow_lessons.length === 0 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}