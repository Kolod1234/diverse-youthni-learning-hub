import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  const validationResults = {
    timestamp: new Date().toISOString(),
    courses_checked: 0,
    issues_found: [],
    courses_status: [],
    summary: {
      total_courses: 0,
      courses_with_issues: 0,
      missing_lessons: 0,
      missing_objectives: 0,
      missing_content: 0,
      empty_courses: 0
    }
  };

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Fetch all courses
    const allCourses = await base44.asServiceRole.entities.Course.list('-created_date', 1000);
    validationResults.summary.total_courses = allCourses.length;
    validationResults.courses_checked = allCourses.length;

    // Validate each course
    for (const course of allCourses) {
      const courseIssues = [];
      const courseStatus = {
        course_id: course.id,
        course_title: course.title,
        category: course.category,
        qualification: course.qualification_type,
        alevel_stage: course.alevel_stage,
        status: 'OK',
        issues: []
      };

      // Check basic course properties
      if (!course.title || course.title.trim() === '') {
        courseIssues.push('Missing course title');
      }
      if (!course.description || course.description.trim() === '') {
        courseIssues.push('Missing course description');
      }
      if (!course.category) {
        courseIssues.push('Missing course category');
      }
      if (!course.instructor) {
        courseIssues.push('Missing instructor name');
      }

      // Fetch lessons for this course (limit to 1000, should be more than enough per course)
            const lessons = await base44.asServiceRole.entities.Lesson.filter({ 
              course_id: course.id 
            }, '', 1000);

      if (lessons.length === 0) {
        courseIssues.push(`No lessons found (expected at least 1)`);
        validationResults.summary.missing_lessons++;
        validationResults.summary.empty_courses++;
      } else {
        // Check each lesson
        for (const lesson of lessons) {
          if (!lesson.title || lesson.title.trim() === '') {
            courseIssues.push(`Lesson ${lesson.id}: Missing title`);
            validationResults.summary.missing_content++;
          }
          if (!lesson.learning_objectives || lesson.learning_objectives.length === 0) {
            courseIssues.push(`Lesson "${lesson.title}": Missing learning objectives`);
            validationResults.summary.missing_objectives++;
          }
          if (!lesson.content_type) {
            courseIssues.push(`Lesson "${lesson.title}": Missing content_type`);
            validationResults.summary.missing_content++;
          }
        }
      }

      // Verify lesson count matches database
      const totalLessons = course.total_lessons || 0;
      if (totalLessons !== lessons.length) {
        courseIssues.push(`Lesson count mismatch: stored=${totalLessons}, actual=${lessons.length}`);
      }

      if (courseIssues.length > 0) {
        courseStatus.status = 'ISSUES';
        courseStatus.issues = courseIssues;
        validationResults.summary.courses_with_issues++;
        validationResults.issues_found.push({
          course_id: course.id,
          course_title: course.title,
          lesson_count: lessons.length,
          issues: courseIssues
        });
      }

      validationResults.courses_status.push(courseStatus);
    }

    return Response.json({
      success: true,
      validation: validationResults
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});