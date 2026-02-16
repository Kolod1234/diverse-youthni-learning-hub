import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    let requestBody;
    try {
      requestBody = await req.json();
    } catch (parseError) {
      return Response.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { issues_found } = requestBody;
    
    if (!issues_found || !Array.isArray(issues_found)) {
      return Response.json({ error: 'issues_found must be an array' }, { status: 400 });
    }

    const fixes = {
      courses_fixed: 0,
      lessons_fixed: 0,
      objectives_added: 0,
      errors: []
    };

    // Process each course with issues
    for (const courseIssue of issues_found) {
      const courseId = courseIssue.course_id;
      
      try {
        // Fetch lessons for this course
        const lessons = await base44.asServiceRole.entities.Lesson.filter({ course_id: courseId });

        // Fix 1: Add missing learning objectives to lessons
        for (const lesson of lessons) {
          let updateData = {};
          
          if (!lesson.learning_objectives || lesson.learning_objectives.length === 0) {
            updateData.learning_objectives = [
              `Understand the key concepts of ${lesson.title || 'this lesson'}`,
              `Apply knowledge of ${lesson.title || 'this lesson'} to practical scenarios`,
              `Evaluate and analyze ${lesson.title || 'this lesson'} in different contexts`
            ];
            fixes.objectives_added++;
          }

          if (!lesson.content_type) {
            updateData.content_type = 'richtext';
            fixes.lessons_fixed++;
          }

          if (!lesson.title || lesson.title.trim() === '') {
            updateData.title = `Lesson ${lesson.order || 1}`;
            fixes.lessons_fixed++;
          }

          if (Object.keys(updateData).length > 0) {
            await base44.asServiceRole.entities.Lesson.update(lesson.id, updateData);
          }
        }

        // Fix 2: Update course lesson count
        const actualLessonCount = lessons.length;
        await base44.asServiceRole.entities.Course.update(courseId, {
          total_lessons: actualLessonCount
        });

        // Fix 3: Add basic lesson if course has none
        if (lessons.length === 0) {
          await base44.asServiceRole.entities.Lesson.create({
            course_id: courseId,
            title: 'Introduction',
            description: 'Welcome to this course',
            learning_objectives: [
              'Understand the course overview',
              'Set learning goals',
              'Get familiar with the course structure'
            ],
            content_type: 'richtext',
            order: 1,
            section: 'Introduction'
          });
          
          await base44.asServiceRole.entities.Course.update(courseId, {
            total_lessons: 1
          });
          fixes.lessons_fixed++;
        }

        fixes.courses_fixed++;
      } catch (error) {
        fixes.errors.push({ 
          course_id: courseId, 
          error: error.message || String(error)
        });
      }
    }

    return Response.json({
      success: true,
      fixes
    });
  } catch (error) {
    return Response.json({ 
      error: error.message || 'Unknown error',
      type: error.constructor.name
    }, { status: 500 });
  }
});