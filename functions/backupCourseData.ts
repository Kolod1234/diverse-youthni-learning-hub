import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { course_id } = await req.json();

    if (!course_id) {
      return Response.json({ error: 'course_id required' }, { status: 400 });
    }

    // Backup course
    const course = await base44.asServiceRole.entities.Course.get(course_id);
    
    // Backup all lessons for this course
    const lessons = await base44.asServiceRole.entities.Lesson.filter({ course_id });

    const backup = {
      timestamp: new Date().toISOString(),
      course: course,
      lessons: lessons,
      lesson_count: lessons.length
    };

    return Response.json({
      success: true,
      backup,
      message: `Backed up course "${course.title}" with ${lessons.length} lessons`
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});