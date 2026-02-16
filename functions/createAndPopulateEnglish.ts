import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const englishCourses = [
      { title: 'A-Level English Language AS', category: 'english_language', stage: 'as' },
      { title: 'A-Level English Language A2', category: 'english_language', stage: 'a2' },
      { title: 'A-Level English Literature AS', category: 'english_literature', stage: 'as' },
      { title: 'A-Level English Literature A2', category: 'english_literature', stage: 'a2' },
    ];

    const results = [];

    for (const courseInfo of englishCourses) {
      try {
        // Check if course exists
        let course = await base44.asServiceRole.entities.Course.filter({
          title: courseInfo.title,
          qualification_type: 'alevel'
        }).then(courses => courses[0]);

        // Create course if it doesn't exist
        if (!course) {
          course = await base44.entities.Course.create({
            title: courseInfo.title,
            description: `CCEA A-Level ${courseInfo.stage === 'as' ? 'AS' : 'A2'} ${courseInfo.category.replace('_', ' ')}`,
            category: courseInfo.category,
            qualification_type: 'alevel',
            alevel_stage: courseInfo.stage,
            exam_board: 'CCEA',
            level: courseInfo.stage === 'as' ? 'intermediate' : 'advanced',
            total_lessons: 0
          });
        }

        // Get lesson data based on category and stage
        const lessons = getLessonData(courseInfo.category, courseInfo.stage);
        
        if (!lessons.length) {
          results.push({ course: courseInfo.title, status: 'no lesson data' });
          continue;
        }

        // Delete existing lessons
        const existing = await base44.entities.Lesson.filter({ course_id: course.id });
        if (existing.length > 0) {
          for (const lesson of existing) {
            await base44.asServiceRole.entities.Lesson.delete(lesson.id);
          }
        }

        // Create lessons in batches
        const batchSize = 8;
        for (let i = 0; i < lessons.length; i += batchSize) {
          const batch = lessons.slice(i, i + batchSize);
          await base44.entities.Lesson.bulkCreate(batch.map(l => ({
            course_id: course.id,
            title: l.title,
            description: l.description,
            section: l.section,
            order: l.order,
            learning_objectives: l.learning_objectives || [],
            content_type: 'richtext',
            slides: [],
            is_preview: l.order <= 3,
            duration_minutes: 50
          })));
          await new Promise(r => setTimeout(r, 150));
        }

        // Update course with lesson count
        await base44.asServiceRole.entities.Course.update(course.id, {
          total_lessons: lessons.length
        });

        results.push({
          course: courseInfo.title,
          lessons: lessons.length,
          status: 'success'
        });

        await new Promise(r => setTimeout(r, 2000));

      } catch (error) {
        results.push({
          course: courseInfo.title,
          status: 'error',
          error: error.message
        });
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getLessonData(category, stage) {
  if (category === 'english_literature') {
    return stage === 'as' ? getEnglishLiteratureAS() : getEnglishLiteratureA2();
  } else if (category === 'english_language') {
    return stage === 'as' ? getEnglishLanguageAS() : getEnglishLanguageA2();
  }
  return [];
}

function getEnglishLiteratureAS() {
  let o = 1;
  return [
    { section: 'Poetry', order: o++, title: 'Introduction to Poetry Analysis', description: 'Poetic devices and techniques', learning_objectives: ['Identify devices', 'Analyze rhythm', 'Interpret meaning'] },
    { section: 'Poetry', order: o++, title: 'Metaphor and Symbolism', description: 'Extended images and meaning', learning_objectives: ['Recognize metaphors', 'Analyze symbols', 'Connect to themes'] },
    { section: 'Poetry', order: o++, title: 'Imagery and Tone', description: 'Sensory language and voice', learning_objectives: ['Identify imagery', 'Analyze tone', 'Evaluate effect'] },
    { section: 'Poetry', order: o++, title: 'Poetic Form and Structure', description: 'Sonnets, ballads, free verse', learning_objectives: ['Compare forms', 'Analyze structure', 'Understand purpose'] },
    { section: 'Prose', order: o++, title: 'Novel Analysis', description: 'Character, plot, setting', learning_objectives: ['Analyze characters', 'Trace plot', 'Evaluate setting'] },
    { section: 'Prose', order: o++, title: 'Narrative Perspective', description: 'Point of view and narration', learning_objectives: ['Identify perspective', 'Analyze reliability', 'Understand effect'] },
    { section: 'Prose', order: o++, title: 'Literary Devices', description: 'Foreshadowing, irony, symbolism', learning_objectives: ['Recognize devices', 'Analyze purpose', 'Evaluate impact'] },
    { section: 'Prose', order: o++, title: 'Themes and Motifs', description: 'Recurring ideas and patterns', learning_objectives: ['Identify themes', 'Trace motifs', 'Evaluate significance'] },
  ];
}

function getEnglishLiteratureA2() {
  let o = 1;
  return [
    { section: 'Shakespeare', order: o++, title: 'Early Modern Drama', description: 'Context and conventions', learning_objectives: ['Understand context', 'Analyze conventions', 'Evaluate theatricality'] },
    { section: 'Shakespeare', order: o++, title: 'Tragedy', description: 'Tragic structure and heroes', learning_objectives: ['Analyze structure', 'Evaluate heroism', 'Understand catharsis'] },
    { section: 'Shakespeare', order: o++, title: 'Comedy and Romance', description: 'Comic devices and resolution', learning_objectives: ['Identify devices', 'Analyze romance', 'Evaluate resolution'] },
    { section: 'Shakespeare', order: o++, title: 'Language in Shakespeare', description: 'Imagery and figurative language', learning_objectives: ['Analyze imagery', 'Understand metaphors', 'Evaluate style'] },
    { section: 'Comparative Study', order: o++, title: 'Comparing Texts', description: 'Thematic and stylistic comparison', learning_objectives: ['Identify similarities', 'Analyze differences', 'Make judgments'] },
    { section: 'Comparative Study', order: o++, title: 'Literary Movements', description: 'Romanticism, Realism, Modernism', learning_objectives: ['Understand movements', 'Identify features', 'Evaluate influence'] },
    { section: 'Comparative Study', order: o++, title: 'Critical Perspectives', description: 'Feminist, Marxist, psychoanalytic', learning_objectives: ['Understand perspectives', 'Apply criticism', 'Evaluate interpretations'] },
    { section: 'Comparative Study', order: o++, title: 'Independent Research', description: 'Self-directed study', learning_objectives: ['Conduct research', 'Develop arguments', 'Support evidence'] },
  ];
}

function getEnglishLanguageAS() {
  let o = 1;
  return [
    { section: 'Language Study', order: o++, title: 'Introduction to Linguistics', description: 'Language systems', learning_objectives: ['Understand structure', 'Identify phonemes', 'Analyze morphemes'] },
    { section: 'Language Study', order: o++, title: 'Phonology and Phonetics', description: 'Sound systems', learning_objectives: ['Identify sounds', 'Understand stress', 'Analyze intonation'] },
    { section: 'Language Study', order: o++, title: 'Grammar and Syntax', description: 'Sentence structure', learning_objectives: ['Identify word classes', 'Analyze phrases', 'Understand clauses'] },
    { section: 'Language Study', order: o++, title: 'Semantics and Pragmatics', description: 'Meaning and usage', learning_objectives: ['Understand meaning', 'Analyze context', 'Evaluate implication'] },
    { section: 'Language Variation', order: o++, title: 'Spoken vs Written', description: 'Form differences', learning_objectives: ['Compare forms', 'Analyze features', 'Understand conventions'] },
    { section: 'Language Variation', order: o++, title: 'Regional Variation', description: 'Dialects and sociolects', learning_objectives: ['Identify variation', 'Understand factors', 'Evaluate attitudes'] },
    { section: 'Language Variation', order: o++, title: 'Discourse Analysis', description: 'Conversation and text', learning_objectives: ['Analyze conversation', 'Understand turn-taking', 'Evaluate strategies'] },
    { section: 'Language Variation', order: o++, title: 'Language and Gender', description: 'Gendered patterns', learning_objectives: ['Identify patterns', 'Understand differences', 'Evaluate research'] },
  ];
}

function getEnglishLanguageA2() {
  let o = 1;
  return [
    { section: 'Investigation', order: o++, title: 'Research Methodology', description: 'Designing investigations', learning_objectives: ['Design studies', 'Collect data', 'Analyze results'] },
    { section: 'Investigation', order: o++, title: 'Language Change', description: 'Historical linguistics', learning_objectives: ['Trace changes', 'Understand causes', 'Evaluate evidence'] },
    { section: 'Investigation', order: o++, title: 'Language Attitudes', description: 'Perceptions and factors', learning_objectives: ['Understand attitudes', 'Analyze biases', 'Evaluate perspectives'] },
    { section: 'Diversity', order: o++, title: 'Multilingualism', description: 'Code-switching patterns', learning_objectives: ['Understand code-switching', 'Analyze examples', 'Evaluate functions'] },
    { section: 'Diversity', order: o++, title: 'Language and Identity', description: 'Social markers', learning_objectives: ['Analyze identity', 'Understand markers', 'Evaluate impact'] },
    { section: 'Diversity', order: o++, title: 'Global Englishes', description: 'International varieties', learning_objectives: ['Understand varieties', 'Analyze features', 'Evaluate implications'] },
    { section: 'Diversity', order: o++, title: 'Standardization', description: 'Prescriptive vs descriptive', learning_objectives: ['Compare approaches', 'Analyze standards', 'Evaluate debates'] },
  ];
}