import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { issues_found } = await req.json();
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
        // Fetch course and lessons
        const course = await base44.asServiceRole.entities.Course.filter({ id: courseId });
        if (course.length === 0) continue;

        const currentCourse = course[0];
        const lessons = await base44.asServiceRole.entities.Lesson.filter({ course_id: courseId });

        // Fix 1: Add missing learning objectives to lessons
        for (const lesson of lessons) {
          if (!lesson.learning_objectives || lesson.learning_objectives.length === 0) {
            const defaultObjectives = [
              `Understand the key concepts of ${lesson.title}`,
              `Apply knowledge of ${lesson.title} to practical scenarios`,
              `Evaluate and analyze ${lesson.title} in different contexts`
            ];
            
            await base44.asServiceRole.entities.Lesson.update(lesson.id, {
              learning_objectives: defaultObjectives
            });
            fixes.objectives_added++;
          }

          // Fix 2: Add missing content_type
          if (!lesson.content_type) {
            await base44.asServiceRole.entities.Lesson.update(lesson.id, {
              content_type: 'richtext'
            });
            fixes.lessons_fixed++;
          }

          // Fix 3: Add title if missing
          if (!lesson.title || lesson.title.trim() === '') {
            await base44.asServiceRole.entities.Lesson.update(lesson.id, {
              title: `Lesson ${lesson.order || 1}`
            });
            fixes.lessons_fixed++;
          }
        }

        // Fix 4: Update course lesson count
        const actualLessonCount = lessons.length;
        if (currentCourse.total_lessons !== actualLessonCount) {
          await base44.asServiceRole.entities.Course.update(courseId, {
            total_lessons: actualLessonCount
          });
        }

        // Fix 5: Add basic lesson if course has none
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
        fixes.errors.push({ course_id: courseId, error: error.message });
      }
    }

    return Response.json({
      success: true,
      fixes
    });
  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});