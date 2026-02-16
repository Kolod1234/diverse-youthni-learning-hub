import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const courses = await base44.asServiceRole.entities.Course.filter({
      qualification_type: 'alevel',
      category: { $in: ['english_language', 'english_literature'] }
    });

    const results = [];
    
    for (const course of courses) {
      try {
        const lessons = course.category === 'english_language'
          ? (course.alevel_stage === 'as' ? getEnglishLanguageAS() : getEnglishLanguageA2())
          : (course.alevel_stage === 'as' ? getEnglishLiteratureAS() : getEnglishLiteratureA2());

        if (!lessons.length) {
          results.push({ course: course.title, status: 'no data' });
          continue;
        }

        const existing = await base44.entities.Lesson.filter({ course_id: course.id });
        if (existing.length > 0) {
          await Promise.all(existing.map(l => base44.asServiceRole.entities.Lesson.delete(l.id)));
        }

        const batchSize = 10;
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
          await new Promise(r => setTimeout(r, 200));
        }

        await base44.asServiceRole.entities.Course.update(course.id, { total_lessons: lessons.length });
        results.push({ course: course.title, lessons: lessons.length, status: 'success' });
        await new Promise(r => setTimeout(r, 3000));

      } catch (error) {
        results.push({ course: course.title, status: 'error', error: error.message });
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getEnglishLiteratureAS() {
  let o = 1;
  return [
    { section: 'Unit 1: Poetry', order: o++, title: 'Introduction to Poetry Analysis', description: 'Understanding poetic devices and techniques', learning_objectives: ['Identify poetic devices', 'Analyze meter and rhyme', 'Interpret themes'] },
    { section: 'Unit 1: Poetry', order: o++, title: 'Metaphor and Symbolism', description: 'Extended metaphors and symbolic meaning', learning_objectives: ['Recognize metaphors', 'Analyze symbolism', 'Connect symbols to themes'] },
    { section: 'Unit 1: Poetry', order: o++, title: 'Imagery and Tone', description: 'Sensory language and poetic voice', learning_objectives: ['Identify imagery', 'Analyze tone', 'Evaluate effect'] },
    { section: 'Unit 1: Poetry', order: o++, title: 'Poetic Form and Structure', description: 'Sonnets, ballads, free verse', learning_objectives: ['Compare forms', 'Analyze structure', 'Understand purpose'] },
    { section: 'Unit 1: Poetry', order: o++, title: 'Romantic Poetry', description: 'Key romantic poets and themes', learning_objectives: ['Identify romantic features', 'Analyze emotion', 'Evaluate style'] },
    { section: 'Unit 1: Poetry', order: o++, title: 'Modern Poetry', description: 'Contemporary poetic movements', learning_objectives: ['Recognize modern techniques', 'Analyze innovation', 'Interpret meaning'] },
    { section: 'Unit 2: Prose', order: o++, title: 'Novel Analysis Techniques', description: 'Character, plot, setting', learning_objectives: ['Analyze characters', 'Trace plot development', 'Evaluate setting'] },
    { section: 'Unit 2: Prose', order: o++, title: 'Narrative Perspective', description: 'First, second, third person narration', learning_objectives: ['Identify perspective', 'Analyze reliability', 'Evaluate effect'] },
    { section: 'Unit 2: Prose', order: o++, title: 'Literary Devices in Prose', description: 'Foreshadowing, irony, symbolism', learning_objectives: ['Recognize devices', 'Analyze purpose', 'Evaluate impact'] },
    { section: 'Unit 2: Prose', order: o++, title: 'Dialogue and Characterization', description: 'Speech patterns and character development', learning_objectives: ['Analyze dialogue', 'Understand characterization', 'Evaluate techniques'] },
    { section: 'Unit 2: Prose', order: o++, title: 'Historical Fiction', description: 'Setting in historical context', learning_objectives: ['Identify historical elements', 'Analyze context', 'Evaluate authenticity'] },
    { section: 'Unit 2: Prose', order: o++, title: 'Themes and Motifs', description: 'Recurring ideas and patterns', learning_objectives: ['Identify themes', 'Trace motifs', 'Evaluate significance'] },
  ];
}

function getEnglishLiteratureA2() {
  let o = 1;
  return [
    { section: 'Unit 3: Shakespeare', order: o++, title: 'Shakespeare and Early Modern Drama', description: 'Context and theatrical conventions', learning_objectives: ['Understand Elizabethan theatre', 'Analyze conventions', 'Evaluate context'] },
    { section: 'Unit 3: Shakespeare', order: o++, title: 'Tragedy Analysis', description: 'Tragic heroes and dramatic structure', learning_objectives: ['Analyze tragic structure', 'Evaluate heroism', 'Understand catharsis'] },
    { section: 'Unit 3: Shakespeare', order: o++, title: 'Comedy and Romance', description: 'Comic devices and romantic elements', learning_objectives: ['Identify comic devices', 'Analyze romance', 'Evaluate resolution'] },
    { section: 'Unit 3: Shakespeare', order: o++, title: 'Language and Imagery in Shakespeare', description: 'Metaphor and figurative language', learning_objectives: ['Analyze imagery', 'Understand metaphors', 'Evaluate style'] },
    { section: 'Unit 4: Comparative Study', order: o++, title: 'Comparing Literary Texts', description: 'Thematic and stylistic comparison', learning_objectives: ['Identify similarities', 'Analyze differences', 'Make evaluations'] },
    { section: 'Unit 4: Comparative Study', order: o++, title: 'Literary Movements and Periods', description: 'Romanticism, Realism, Modernism', learning_objectives: ['Understand movements', 'Identify features', 'Evaluate influence'] },
    { section: 'Unit 4: Comparative Study', order: o++, title: 'Critical Perspectives', description: 'Feminist, Marxist, psychoanalytic criticism', learning_objectives: ['Understand perspectives', 'Apply criticism', 'Evaluate interpretations'] },
    { section: 'Unit 4: Comparative Study', order: o++, title: 'Independent Literary Research', description: 'Self-directed study and analysis', learning_objectives: ['Conduct research', 'Develop arguments', 'Support with evidence'] },
  ];
}

function getEnglishLanguageAS() {
  let o = 1;
  return [
    { section: 'Unit 1: Language Study', order: o++, title: 'Introduction to Linguistics', description: 'Language systems and features', learning_objectives: ['Understand language structure', 'Identify phonemes', 'Analyze morphemes'] },
    { section: 'Unit 1: Language Study', order: o++, title: 'Phonology and Phonetics', description: 'Sound systems and pronunciation', learning_objectives: ['Identify sounds', 'Understand stress', 'Analyze intonation'] },
    { section: 'Unit 1: Language Study', order: o++, title: 'Grammar and Syntax', description: 'Sentence structure and word classes', learning_objectives: ['Identify word classes', 'Analyze phrases', 'Understand clauses'] },
    { section: 'Unit 1: Language Study', order: o++, title: 'Semantics and Pragmatics', description: 'Meaning and language use', learning_objectives: ['Understand meaning', 'Analyze context', 'Evaluate implication'] },
    { section: 'Unit 2: Language Variation', order: o++, title: 'Spoken vs Written English', description: 'Differences and features', learning_objectives: ['Compare forms', 'Analyze features', 'Understand conventions'] },
    { section: 'Unit 2: Language Variation', order: o++, title: 'Regional and Social Variation', description: 'Dialects and sociolects', learning_objectives: ['Identify variation', 'Understand factors', 'Evaluate attitudes'] },
    { section: 'Unit 2: Language Variation', order: o++, title: 'Discourse Analysis', description: 'Conversation and text analysis', learning_objectives: ['Analyze conversation', 'Understand turn-taking', 'Evaluate strategies'] },
    { section: 'Unit 2: Language Variation', order: o++, title: 'Language and Gender', description: 'Gendered language patterns', learning_objectives: ['Identify patterns', 'Understand differences', 'Evaluate research'] },
  ];
}

function getEnglishLanguageA2() {
  let o = 1;
  return [
    { section: 'Unit 3: Language Investigation', order: o++, title: 'Research Methodology', description: 'Designing language investigations', learning_objectives: ['Design studies', 'Collect data', 'Analyze results'] },
    { section: 'Unit 3: Language Investigation', order: o++, title: 'Language Change Over Time', description: 'Historical linguistics and evolution', learning_objectives: ['Trace changes', 'Understand causes', 'Evaluate evidence'] },
    { section: 'Unit 3: Language Investigation', order: o++, title: 'Language Attitudes and Beliefs', description: 'Perceptions and social factors', learning_objectives: ['Understand attitudes', 'Analyze biases', 'Evaluate perspectives'] },
    { section: 'Unit 4: Language Diversity', order: o++, title: 'Multilingualism and Code-Switching', description: 'Bilingual communication patterns', learning_objectives: ['Understand code-switching', 'Analyze examples', 'Evaluate functions'] },
    { section: 'Unit 4: Language Diversity', order: o++, title: 'Language and Identity', description: 'Language as social marker', learning_objectives: ['Analyze identity', 'Understand markers', 'Evaluate impact'] },
    { section: 'Unit 4: Language Diversity', order: o++, title: 'Global Englishes', description: 'English as international language', learning_objectives: ['Understand varieties', 'Analyze features', 'Evaluate implications'] },
    { section: 'Unit 4: Language Diversity', order: o++, title: 'Language Standardization', description: 'Prescriptive vs descriptive approaches', learning_objectives: ['Compare approaches', 'Analyze standards', 'Evaluate debates'] },
  ];
}