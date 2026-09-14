import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const TARGETS = {
  '6992f0b02e3ec91d98405e0e': { order: 31, title: 'Polynomial Division', focus: 'long division, synthetic division, the division identity and remainder theorem' },
  '6992f0b02e3ec91d98405e0f': { order: 32, title: 'Factor Theorem', focus: 'factor theorem, roots, complete cubic factorisation and unknown coefficients' },
  '6992f0b02e3ec91d98405e10': { order: 33, title: 'Cubic and Quartic Equations', focus: 'factorable cubics, grouping, biquadratics, multiplicity and complete root sets' },
  '6992f0b02e3ec91d98405e11': { order: 34, title: 'Partial Fractions Type 1', focus: 'proper and improper fractions with distinct linear factors' },
  '6992f0b02e3ec91d98405e12': { order: 35, title: 'Partial Fractions Type 2', focus: 'repeated linear factors and complete decomposition templates' },
  '6992f0b02e3ec91d98405e13': { order: 36, title: 'Partial Fractions Type 3', focus: 'irreducible quadratic factors and linear numerators' },
  '6992f0b02e3ec91d98405e14': { order: 37, title: 'Binomial Theorem Extended', focus: 'negative and fractional indices, validity and approximation' },
  '6992f0b02e3ec91d98405e15': { order: 38, title: 'Series Expansions', focus: 'standard series, products, truncation, order notation and approximation' },
  '6992f0b02e3ec91d98405e16': { order: 39, title: 'Inequalities Advanced', focus: 'polynomial, rational and modulus inequalities with exact endpoint logic' },
  '6992f0b02e3ec91d98405e17': { order: 40, title: 'Systems of Equations', focus: 'linear and non-linear systems, elimination, substitution and interpretation' }
};

const slidesSchema = {
  type: 'object',
  properties: {
    slides: {
      type: 'array', minItems: 15, maxItems: 15,
      items: {
        type: 'object',
        properties: { title: { type: 'string' }, content: { type: 'string' }, order: { type: 'number' } },
        required: ['title', 'content', 'order']
      }
    }
  },
  required: ['slides']
};

function promptFor(lesson, target, start, end) {
  const objectives = (lesson.learning_objectives || []).join('; ');
  const phase = start === 1 ? 'foundations, definitions, reasoning and the first worked examples' : 'advanced cases, misconceptions, two practice sets, complete worked answers and synthesis';
  return `Author pages ${start}-${end} of a 30-page textbook chapter for CCEA GCE Further Mathematics Unit AS 1. Chapter: ${target.title}. Required scope: ${target.focus}. Existing outcomes: ${objectives}. This half covers ${phase}.

Write for a first-time AS learner. Each page must contain 125-190 words of substantive teaching, excluding displayed equations. Use connected British English prose, not presentation notes. Define notation and domains before use, explain why every method works, state conditions and restrictions, and connect ideas across pages. Use only original assessment-style questions; never claim official examination provenance.

Across the complete chapter include at least five varied worked examples. Every worked example must give the complete question, justify the selected method, show every algebraic transformation as one ordered micro-step, explain the reason before the calculation, and finish with an independent substitution, expansion, recombination, sign or graphical check. Include two substantial practice sets and later full worked answers for every question and subpart. Never use “clearly”, “simply”, “similarly”, “obviously” or “after some work”.

Return clean HTML in content. Use <p> for explanation, <h2> or <h3> sparingly, <div class="key-rule"> and <div class="notation-note"> for precise rules, <div class="worked-example"> for complete example questions, <div class="answer-block"><ol><li>…</li></ol></div> for all solutions, and <div class="check-point"> for checks. Use MathJax delimiters $...$ and $$...$$, with stacked fractions written as \\frac{a}{b}. Orders must be exactly ${start} to ${end}. Do not include images; they are inserted after validation.`;
}

function textWords(html) {
  return String(html || '').replace(/<[^>]*>/g, ' ').replace(/\$[^$]*\$/g, ' MATH ').trim().split(/\s+/).filter(Boolean).length;
}

function figureHtml(visual) {
  if (!visual?.url) return '';
  const alt = String(visual.alt || 'Educational diagram supporting this algebra chapter').replace(/"/g, '&quot;');
  const caption = String(visual.caption || 'Use the diagram to connect the algebraic structure with its visual interpretation.');
  return `<figure class="page-visual"><img src="${visual.url}" alt="${alt}" loading="lazy" style="width:100%;height:auto;display:block;border-radius:14px"/><figcaption>${caption}</figcaption></figure>`;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const { lesson_id, visual, audit_only = false } = await req.json();
    const target = TARGETS[lesson_id];
    if (!target) return Response.json({ error: 'lesson_id must identify AS1 lesson 31-40' }, { status: 400 });

    const lesson = await base44.asServiceRole.entities.Lesson.get(lesson_id);
    const currentSlides = lesson.slides || [];
    if (audit_only) {
      return Response.json({ lesson_id, title: lesson.title, pages: currentSlides.length, words: currentSlides.reduce((n, s) => n + textWords(s.content), 0), images: currentSlides.reduce((n, s) => n + ((String(s.content || '').match(/<img\b/gi) || []).length), 0), answer_pages: currentSlides.filter(s => String(s.content || '').includes('answer-block')).length });
    }

    const previous = await base44.asServiceRole.entities.ContentVersion.filter({ entity_type: 'lesson', entity_id: lesson_id });
    const versionNumber = previous.reduce((n, v) => Math.max(n, v.version_number || 0), 0) + 1;
    await base44.asServiceRole.entities.ContentVersion.create({
      entity_type: 'lesson', entity_id: lesson_id, version_number: versionNumber,
      content_snapshot: lesson,
      change_summary: 'Backup before AS1 Advanced Algebra master-standard rebuild',
      changed_fields: ['slides', 'resources', 'description', 'learning_objectives'],
      author_email: user.email, author_name: user.full_name || 'Administrator',
      is_published: false, review_status: 'draft'
    });

    const [first, second] = await Promise.all([
      base44.asServiceRole.integrations.Core.InvokeLLM({ model: 'claude-sonnet-5', prompt: promptFor(lesson, target, 1, 15), response_json_schema: slidesSchema }),
      base44.asServiceRole.integrations.Core.InvokeLLM({ model: 'claude-sonnet-5', prompt: promptFor(lesson, target, 16, 30), response_json_schema: slidesSchema })
    ]);

    const slides = [...(first.slides || []), ...(second.slides || [])].map((slide, index) => ({ ...slide, order: index + 1, background: '#fffdf9' }));
    const visualMarkup = figureHtml(visual);
    if (visualMarkup) {
      const visualIndex = Math.max(3, Math.min(12, Number(visual.page || 6) - 1));
      slides[visualIndex].content = visualMarkup + slides[visualIndex].content;
    }

    const totalWords = slides.reduce((n, s) => n + textWords(s.content), 0);
    const sparsePages = slides.filter(s => textWords(s.content) < 105).map(s => s.order);
    const answerPages = slides.filter(s => String(s.content || '').includes('answer-block')).length;
    const workedExamples = slides.filter(s => String(s.content || '').includes('worked-example')).length;
    const banned = slides.filter(s => /\b(clearly|simply|similarly|obviously|after some work)\b/i.test(String(s.content || ''))).map(s => s.order);
    const valid = slides.length === 30 && slides.every((s, i) => s.order === i + 1) && totalWords >= 3400 && sparsePages.length <= 3 && answerPages >= 8 && workedExamples >= 5 && banned.length === 0;
    if (!valid) return Response.json({ updated: false, lesson_id, pages: slides.length, total_words: totalWords, sparse_pages: sparsePages, answer_pages: answerPages, worked_examples: workedExamples, banned_pages: banned }, { status: 422 });

    const resources = [...(lesson.resources || [])];
    if (visual?.url && !resources.some(r => r.url === visual.url)) resources.push({ name: visual.name || `${target.title} educational diagram`, url: visual.url, type: 'educational_diagram' });
    await base44.asServiceRole.entities.Lesson.update(lesson_id, {
      slides, resources, section: 'AS1: Advanced Algebra', content_type: 'richtext', duration_minutes: 110,
      description: `Complete CCEA AS 1 textbook chapter on ${target.focus}, with micro-step worked solutions and verified practice.`
    });

    const saved = await base44.asServiceRole.entities.Lesson.get(lesson_id);
    return Response.json({ updated: true, lesson_id, title: saved.title, order: saved.order, pages: saved.slides?.length || 0, total_words: totalWords, sparse_pages: sparsePages, answer_pages: answerPages, worked_examples: workedExamples, images: saved.slides?.reduce((n, s) => n + ((String(s.content || '').match(/<img\b/gi) || []).length), 0) || 0, backup_version: versionNumber });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}