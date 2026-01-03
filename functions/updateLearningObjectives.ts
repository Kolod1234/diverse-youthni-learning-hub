import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && !user.is_tutor)) {
      return Response.json({ error: 'Unauthorized - Admin or Tutor only' }, { status: 403 });
    }

    const { lessonId } = await req.json();

    // If specific lesson ID provided, update only that lesson
    if (lessonId) {
      const lessons = await base44.asServiceRole.entities.Lesson.filter({ id: lessonId });
      const lesson = lessons[0];
      
      if (!lesson) {
        return Response.json({ error: 'Lesson not found' }, { status: 404 });
      }

      const courses = await base44.asServiceRole.entities.Course.filter({ id: lesson.course_id });
      const course = courses[0];

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a CCEA GCSE curriculum expert. Generate 3-5 specific, measurable learning objectives for this lesson.

Course: ${course?.title || 'Unknown'} (${course?.category || 'General'})
Exam Board: ${course?.exam_board || 'CCEA'}
Lesson Title: ${lesson.title}
Lesson Description: ${lesson.description || 'Not provided'}

Create learning objectives that:
1. Start with action verbs (Explain, Describe, Calculate, Analyze, Evaluate, Apply, etc.)
2. Are specific and measurable
3. Align with CCEA GCSE standards
4. Are appropriate for the subject and topic
5. Focus on skills and knowledge students will gain

Format as a JSON array of strings.`,
        response_json_schema: {
          type: 'object',
          properties: {
            learning_objectives: {
              type: 'array',
              items: { type: 'string' }
            }
          }
        }
      });

      await base44.asServiceRole.entities.Lesson.update(lesson.id, {
        learning_objectives: response.learning_objectives
      });

      return Response.json({
        success: true,
        message: 'Learning objectives updated successfully',
        objectives: response.learning_objectives
      });
    }

    // Otherwise, update all lessons
    const courses = await base44.asServiceRole.entities.Course.list('created_date', 500);
    const lessons = await base44.asServiceRole.entities.Lesson.list('created_date', 500);

    const updates = [];

    for (const course of courses) {
      if (course.is_deleted) continue;

      // Get lessons for this course
      const courseLessons = lessons.filter(l => l.course_id === course.id);

      for (const lesson of courseLessons) {
        try {
          // Generate appropriate learning objectives for each lesson
          const response = await base44.integrations.Core.InvokeLLM({
            prompt: `You are a CCEA GCSE curriculum expert. Generate 3-5 specific, measurable learning objectives for this lesson.

Course: ${course.title} (${course.category})
Exam Board: ${course.exam_board || 'CCEA'}
Lesson Title: ${lesson.title}
Lesson Description: ${lesson.description || 'Not provided'}

Create learning objectives that:
1. Start with action verbs (Explain, Describe, Calculate, Analyze, Evaluate, Apply, etc.)
2. Are specific and measurable
3. Align with CCEA GCSE standards
4. Are appropriate for the subject and topic
5. Focus on skills and knowledge students will gain

Format as a JSON array of strings.`,
            response_json_schema: {
              type: 'object',
              properties: {
                learning_objectives: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            }
          });

          // Update the lesson with new learning objectives
          await base44.asServiceRole.entities.Lesson.update(lesson.id, {
            learning_objectives: response.learning_objectives
          });

          updates.push({
            course: course.title,
            lesson: lesson.title,
            objectives: response.learning_objectives
          });

        } catch (error) {
          console.error(`Failed to update lesson ${lesson.id}:`, error);
        }
      }
    }

    return Response.json({
      success: true,
      message: `Updated learning objectives for ${updates.length} lessons`,
      updates
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});