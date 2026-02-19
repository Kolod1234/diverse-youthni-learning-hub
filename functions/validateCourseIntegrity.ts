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
      } else if (course.description.length < 20) {
        courseIssues.push('Course description too short (minimum 20 characters)');
      }
      if (!course.category) {
        courseIssues.push('Missing course category');
      }
      if (!course.instructor) {
        courseIssues.push('Missing instructor name');
      }
      if (!course.thumbnail) {
        courseIssues.push('Missing course thumbnail image');
      }
      if (!course.qualification_type) {
        courseIssues.push('Missing qualification type (gcse/alevel)');
      }
      if (course.price === undefined || course.price === null) {
        courseIssues.push('Missing price field');
      }
      if (!course.level || !['beginner', 'intermediate', 'advanced'].includes(course.level)) {
        courseIssues.push('Invalid or missing level');
      }
      if (!course.duration_hours || course.duration_hours <= 0) {
        courseIssues.push('Missing or invalid duration_hours');
      }

      // Fetch lessons for this course
      const lessons = await base44.asServiceRole.entities.Lesson.filter({ 
        course_id: course.id 
      }, 'order', 1000);

      if (lessons.length === 0) {
        courseIssues.push(`No lessons found (expected at least 1)`);
        validationResults.summary.missing_lessons++;
        validationResults.summary.empty_courses++;
      } else {
        // Check for duplicate lesson orders
        const orderMap = {};
        for (const lesson of lessons) {
          if (orderMap[lesson.order]) {
            courseIssues.push(`Duplicate lesson order ${lesson.order}: "${orderMap[lesson.order]}" and "${lesson.title}"`);
          }
          orderMap[lesson.order] = lesson.title;
        }

        // Check for gaps in lesson ordering
        const sortedOrders = lessons.map(l => l.order).sort((a, b) => a - b);
        for (let i = 0; i < sortedOrders.length - 1; i++) {
          if (sortedOrders[i + 1] - sortedOrders[i] > 1) {
            courseIssues.push(`Gap in lesson ordering: jumps from ${sortedOrders[i]} to ${sortedOrders[i + 1]}`);
          }
        }

        // Check each lesson in detail
        for (const lesson of lessons) {
          const lessonPrefix = `Lesson "${lesson.title || 'Untitled'}" (order ${lesson.order})`;
          
          if (!lesson.title || lesson.title.trim() === '') {
            courseIssues.push(`${lessonPrefix}: Missing title`);
            validationResults.summary.missing_content++;
          }
          
          if (!lesson.description || lesson.description.trim() === '' || lesson.description === '<p><br></p>') {
            courseIssues.push(`${lessonPrefix}: Missing or empty description`);
            validationResults.summary.missing_content++;
          }
          
          if (!lesson.learning_objectives || lesson.learning_objectives.length === 0) {
            courseIssues.push(`${lessonPrefix}: Missing learning objectives`);
            validationResults.summary.missing_objectives++;
          } else if (lesson.learning_objectives.length < 3) {
            courseIssues.push(`${lessonPrefix}: Only ${lesson.learning_objectives.length} learning objectives (recommended: 3-5)`);
          }
          
          if (!lesson.content_type) {
            courseIssues.push(`${lessonPrefix}: Missing content_type`);
            validationResults.summary.missing_content++;
          }
          
          if (!lesson.section || lesson.section.trim() === '') {
            courseIssues.push(`${lessonPrefix}: Missing section/module`);
          }
          
          if (!lesson.duration_minutes || lesson.duration_minutes <= 0) {
            courseIssues.push(`${lessonPrefix}: Missing or invalid duration`);
          }

          // Check content availability based on content_type
          if (lesson.content_type === 'googleslides' && !lesson.google_slides_url) {
            courseIssues.push(`${lessonPrefix}: content_type is googleslides but no google_slides_url`);
            validationResults.summary.missing_content++;
          }
          if (lesson.content_type === 'document' && !lesson.file_url) {
            courseIssues.push(`${lessonPrefix}: content_type is document but no file_url`);
            validationResults.summary.missing_content++;
          }
          if (lesson.content_type === 'richtext' && (!lesson.slides || lesson.slides.length === 0)) {
            courseIssues.push(`${lessonPrefix}: content_type is richtext but no slides content`);
            validationResults.summary.missing_content++;
          }

          // Check for orphaned content fields
          if (lesson.video_url && !lesson.video_url.startsWith('http')) {
            courseIssues.push(`${lessonPrefix}: Invalid video_url format`);
          }
          if (lesson.file_url && !lesson.file_url.startsWith('http')) {
            courseIssues.push(`${lessonPrefix}: Invalid file_url format`);
          }
          if (lesson.google_slides_url && !lesson.google_slides_url.includes('google.com')) {
            courseIssues.push(`${lessonPrefix}: Invalid google_slides_url format`);
          }
        }
      }

      // Verify lesson count matches database
      const totalLessons = course.total_lessons || 0;
      if (totalLessons !== lessons.length) {
        courseIssues.push(`Lesson count mismatch: stored=${totalLessons}, actual=${lessons.length}`);
      }

      // Verify course has unique lessons (no duplicates)
      const lessonTitles = lessons.map(l => l.title?.toLowerCase()).filter(Boolean);
      const duplicateTitles = lessonTitles.filter((title, idx) => lessonTitles.indexOf(title) !== idx);
      if (duplicateTitles.length > 0) {
        courseIssues.push(`Duplicate lesson titles found: ${[...new Set(duplicateTitles)].join(', ')}`);
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