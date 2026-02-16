import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { backup } = await req.json();

    if (!backup || !backup.course || !backup.lessons) {
      return Response.json({ error: 'Invalid backup data' }, { status: 400 });
    }

    const course = backup.course;
    const lessons = backup.lessons;

    // Delete current lessons
    const currentLessons = await base44.asServiceRole.entities.Lesson.filter({ 
      course_id: course.id 
    });

    for (const lesson of currentLessons) {
      await base44.asServiceRole.entities.Lesson.delete(lesson.id);
    }

    // Restore course data
    await base44.asServiceRole.entities.Course.update(course.id, {
      total_lessons: lessons.length
    });

    // Restore lessons in batches
    const batchSize = 10;
    for (let i = 0; i < lessons.length; i += batchSize) {
      const batch = lessons.slice(i, i + batchSize);
      await base44.asServiceRole.entities.Lesson.bulkCreate(batch.map(l => ({
        course_id: l.course_id,
        title: l.title,
        description: l.description,
        section: l.section,
        order: l.order,
        learning_objectives: l.learning_objectives || [],
        content_type: l.content_type || 'richtext',
        slides: l.slides || [],
        is_preview: l.is_preview || false,
        duration_minutes: l.duration_minutes || 45
      })));
      await new Promise(r => setTimeout(r, 300));
    }

    return Response.json({
      success: true,
      restored: {
        course: course.title,
        lessons: lessons.length
      },
      message: `Restored course "${course.title}" with ${lessons.length} lessons from backup at ${backup.timestamp}`
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});