import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const courses = [
      {
        title: 'A-Level English Language AS',
        category: 'english_language',
        alevel_stage: 'as',
        description: 'CCEA A-Level English Language AS - Language study variation spoken and written discourse',
        lessons: 25
      },
      {
        title: 'A-Level English Language A2',
        category: 'english_language',
        alevel_stage: 'a2',
        description: 'CCEA A-Level English Language A2 - Language investigation change and diversity',
        lessons: 18
      },
      {
        title: 'A-Level English Literature AS',
        category: 'english_literature',
        alevel_stage: 'as',
        description: 'CCEA A-Level English Literature AS - Poetry prose drama Shakespeare literary analysis',
        lessons: 30
      },
      {
        title: 'A-Level English Literature A2',
        category: 'english_literature',
        alevel_stage: 'a2',
        description: 'CCEA A-Level English Literature A2 - Critical theory comparative study independent research',
        lessons: 25
      }
    ];

    const results = [];
    
    for (const def of courses) {
      const existing = await base44.asServiceRole.entities.Course.filter({
        category: def.category,
        qualification_type: 'alevel',
        alevel_stage: def.alevel_stage
      });

      let course;
      if (existing.length === 0) {
        course = await base44.asServiceRole.entities.Course.create({
          title: def.title,
          description: def.description,
          category: def.category,
          qualification_type: 'alevel',
          alevel_stage: def.alevel_stage,
          instructor: 'DYNI Academic Team',
          instructor_avatar: 'https://ui-avatars.com/api/?name=DYNI&background=2563eb&color=fff',
          thumbnail: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800',
          level: 'advanced',
          price: 0,
          is_featured: true,
          exam_board: 'CCEA',
          duration_hours: def.alevel_stage === 'as' ? 120 : 180,
          total_lessons: 0
        });
      } else {
        course = existing[0];
      }

      // Create lessons
      const lessons = [];
      for (let o = 1; o <= def.lessons; o++) {
        lessons.push({
          course_id: course.id,
          title: `${def.category === 'english_language' ? 'Language' : 'Literature'} Study ${o}`,
          description: `CCEA ${def.alevel_stage.toUpperCase()} curriculum content`,
          section: `${def.alevel_stage.toUpperCase()} ${def.category === 'english_language' ? 'Language' : 'Literature'}`,
          order: o,
          learning_objectives: ['Analyze texts', 'Apply concepts', 'Evaluate evidence'],
          content_type: 'richtext',
          slides: [],
          is_preview: o <= 3,
          duration_minutes: 45
        });
      }

      // Delete existing lessons
      const existingLessons = await base44.entities.Lesson.filter({ course_id: course.id });
      if (existingLessons.length > 0) {
        await Promise.all(existingLessons.map(l => base44.asServiceRole.entities.Lesson.delete(l.id)));
      }

      await base44.entities.Lesson.bulkCreate(lessons);

      await base44.asServiceRole.entities.Course.update(course.id, {
        total_lessons: def.lessons
      });

      results.push({ course: def.title, lessons: def.lessons, status: 'success' });
      await new Promise(r => setTimeout(r, 3000));
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});