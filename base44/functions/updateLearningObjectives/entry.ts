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

      const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `You are a CCEA GCSE curriculum expert. Search the CCEA website and official curriculum documents to generate 3-5 specific, measurable learning objectives for this lesson.

Course: ${course?.title || 'Unknown'} (${course?.category || 'General'})
Exam Board: ${course?.exam_board || 'CCEA'}
Lesson Title: ${lesson.title}
Lesson Description: ${lesson.description || 'Not provided'}

Search for official CCEA curriculum standards for this subject and create learning objectives that:
1. Start with action verbs (Explain, Describe, Calculate, Analyze, Evaluate, Apply, etc.)
2. Are specific and measurable
3. Align with official CCEA GCSE standards and specifications
4. Are appropriate for the subject and topic
5. Focus on skills and knowledge students will gain
6. Reference the official curriculum where possible

Format as a JSON array of strings.`,
        add_context_from_internet: true,
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
    let processed = 0;
    let failed = 0;

    // Filter lessons that need objectives (empty or missing)
    const lessonsNeedingObjectives = lessons.filter(l => 
      !l.is_deleted && 
      (!l.learning_objectives || l.learning_objectives.length === 0)
    );

    console.log(`Found ${lessonsNeedingObjectives.length} lessons needing objectives`);

    for (const lesson of lessonsNeedingObjectives) {
      try {
        const course = courses.find(c => c.id === lesson.course_id);
        if (!course) {
          console.log(`Skipping lesson ${lesson.id} - course not found`);
          continue;
        }

        console.log(`Processing lesson: ${lesson.title} (${lesson.id})`);

        // Generate appropriate learning objectives for each lesson with web search
        const response = await base44.asServiceRole.integrations.Core.InvokeLLM({
          prompt: `You are a CCEA GCSE curriculum expert. Search the CCEA website and official curriculum documents to generate 3-5 specific, measurable learning objectives for this lesson.

Course: ${course.title} (${course.category || 'General'})
Exam Board: ${course.exam_board || 'CCEA'}
Lesson Title: ${lesson.title}
Lesson Description: ${lesson.description || 'Not provided'}

Search for official CCEA curriculum standards for this subject and create learning objectives that:
1. Start with action verbs (Explain, Describe, Calculate, Analyze, Evaluate, Apply, etc.)
2. Are specific and measurable
3. Align with official CCEA GCSE standards and specifications
4. Are appropriate for the subject and topic
5. Focus on skills and knowledge students will gain
6. Reference the official curriculum where possible

Format as a JSON array of strings.`,
          add_context_from_internet: true,
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

        console.log(`Generated objectives for ${lesson.title}:`, response.learning_objectives);

        // Update the lesson with new learning objectives
        await base44.asServiceRole.entities.Lesson.update(lesson.id, {
          learning_objectives: response.learning_objectives
        });

        updates.push({
          course: course.title,
          lesson: lesson.title,
          objectives: response.learning_objectives
        });
        
        processed++;
        console.log(`Successfully updated lesson ${lesson.id} (${processed}/${lessonsNeedingObjectives.length})`);

      } catch (error) {
        console.error(`Failed to update lesson ${lesson.id}:`, error.message || error);
        failed++;
      }
    }

    return Response.json({
      success: true,
      message: `Updated ${processed} lessons successfully, ${failed} failed`,
      total_lessons: lessonsNeedingObjectives.length,
      processed,
      failed,
      updates: updates.slice(0, 10) // Only return first 10 for brevity
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});