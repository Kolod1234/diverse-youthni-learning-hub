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
      urls_fixed: 0,
      enrollments_cleaned: 0,
      references_fixed: 0,
      errors: []
    };

    // Process each course with issues
    for (const courseIssue of issues_found) {
      const courseId = courseIssue.course_id;
      
      try {
        // Fetch course and lessons
        const course = await base44.asServiceRole.entities.Course.get(courseId);
        const lessons = await base44.asServiceRole.entities.Lesson.filter({ course_id: courseId }, 'order', 1000);

        let courseUpdateData = {};

        // Fix course-level issues
        if (!course.description || course.description.trim() === '') {
          courseUpdateData.description = `A comprehensive ${course.category || 'course'} course designed to help students excel in their studies.`;
        } else if (course.description.length < 20) {
          courseUpdateData.description = course.description + ' This course provides detailed instruction and practice materials.';
        }

        if (!course.thumbnail) {
          courseUpdateData.thumbnail = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&q=80';
        }

        if (!course.qualification_type) {
          courseUpdateData.qualification_type = 'gcse';
        }

        if (course.price === undefined || course.price === null) {
          courseUpdateData.price = 0;
        }

        if (!course.level) {
          courseUpdateData.level = 'intermediate';
        }

        if (!course.duration_hours || course.duration_hours <= 0) {
          const estimatedHours = lessons.length > 0 
            ? Math.ceil(lessons.reduce((sum, l) => sum + (l.duration_minutes || 30), 0) / 60)
            : 10;
          courseUpdateData.duration_hours = estimatedHours;
        }

        if (!course.instructor || course.instructor.trim() === '') {
          courseUpdateData.instructor = 'Course Instructor';
        }

        // Fix lesson ordering issues
        const sortedLessons = [...lessons].sort((a, b) => a.order - b.order);
        let orderNeedsUpdate = false;
        
        sortedLessons.forEach((lesson, idx) => {
          const expectedOrder = idx + 1;
          if (lesson.order !== expectedOrder) {
            orderNeedsUpdate = true;
          }
        });

        if (orderNeedsUpdate) {
          for (let i = 0; i < sortedLessons.length; i++) {
            const lesson = sortedLessons[i];
            await base44.asServiceRole.entities.Lesson.update(lesson.id, { order: i + 1 });
          }
          fixes.lessons_fixed += sortedLessons.length;
        }

        // Fix individual lesson issues
        for (const lesson of lessons) {
          let updateData = {};
          
          if (!lesson.title || lesson.title.trim() === '') {
            updateData.title = `Lesson ${lesson.order || 1}`;
            fixes.lessons_fixed++;
          }

          if (!lesson.description || lesson.description.trim() === '' || lesson.description === '<p><br></p>') {
            updateData.description = `This lesson covers important concepts in ${course.category || 'this subject'}.`;
            fixes.lessons_fixed++;
          }
          
          if (!lesson.learning_objectives || lesson.learning_objectives.length === 0) {
            updateData.learning_objectives = [
              `Understand the key concepts of ${lesson.title || 'this lesson'}`,
              `Apply knowledge of ${lesson.title || 'this lesson'} to practical scenarios`,
              `Analyze and evaluate ${lesson.title || 'this lesson'} in different contexts`
            ];
            fixes.objectives_added++;
          } else if (lesson.learning_objectives.length < 3) {
            const existing = lesson.learning_objectives;
            updateData.learning_objectives = [
              ...existing,
              `Apply concepts from ${lesson.title || 'this lesson'}`,
              `Evaluate understanding through practice`
            ].slice(0, 4);
            fixes.objectives_added++;
          }

          if (!lesson.content_type) {
            // Infer content type from available fields
            if (lesson.google_slides_url) {
              updateData.content_type = 'googleslides';
            } else if (lesson.file_url) {
              updateData.content_type = 'document';
            } else {
              updateData.content_type = 'richtext';
            }
            fixes.lessons_fixed++;
          }

          if (!lesson.section || lesson.section.trim() === '') {
            updateData.section = 'Main Content';
            fixes.lessons_fixed++;
          }

          if (!lesson.duration_minutes || lesson.duration_minutes <= 0) {
            updateData.duration_minutes = 30;
            fixes.lessons_fixed++;
          }

          // Ensure content exists based on content_type
          if (lesson.content_type === 'richtext' && (!lesson.slides || lesson.slides.length === 0)) {
            updateData.slides = [{
              title: lesson.title || 'Introduction',
              content: lesson.description || '<p>Lesson content goes here.</p>',
              order: 1
            }];
            fixes.lessons_fixed++;
          }

          // Fix broken URLs
          const urlFields = ['video_url', 'file_url', 'google_slides_url', 'h5p_content_url'];
          for (const field of urlFields) {
            if (lesson[field]) {
              const url = lesson[field];
              if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('undefined') || url.includes('null')) {
                updateData[field] = null;
                fixes.urls_fixed++;
              }
            }
          }

          // Fix invalid player references
          if (lesson.default_player && !['LessonPlayerClassic', 'LessonPlayerPowerPoint'].includes(lesson.default_player)) {
            updateData.default_player = 'LessonPlayerClassic';
            fixes.references_fixed++;
          }

          // Clean orphaned resources
          if (lesson.resources && Array.isArray(lesson.resources)) {
            const cleanedResources = lesson.resources.filter(resource => {
              if (!resource.url) return true;
              if (resource.url.includes('localhost') || resource.url.includes('undefined')) {
                fixes.urls_fixed++;
                return false;
              }
              return true;
            });
            if (cleanedResources.length !== lesson.resources.length) {
              updateData.resources = cleanedResources;
            }
          }

          if (Object.keys(updateData).length > 0) {
            await base44.asServiceRole.entities.Lesson.update(lesson.id, updateData);
          }
        }

        // Fix course-level URLs
        if (course.syllabus_url && (course.syllabus_url.includes('localhost') || course.syllabus_url.includes('undefined'))) {
          courseUpdateData.syllabus_url = null;
          fixes.urls_fixed++;
        }

        // Fix enrollments with invalid references
        try {
          const enrollments = await base44.asServiceRole.entities.Enrollment.filter({ course_id: courseId }, '', 1000);
          const validLessonIds = lessons.map(l => l.id);
          
          for (const enrollment of enrollments) {
            let enrollmentUpdate = {};
            
            // Clean completed_lessons
            if (enrollment.completed_lessons && Array.isArray(enrollment.completed_lessons)) {
              const cleanedIds = enrollment.completed_lessons.filter(id => validLessonIds.includes(id));
              if (cleanedIds.length !== enrollment.completed_lessons.length) {
                enrollmentUpdate.completed_lessons = cleanedIds;
                fixes.references_fixed++;
              }
            }

            // Fix current_lesson_id
            if (enrollment.current_lesson_id && !validLessonIds.includes(enrollment.current_lesson_id)) {
              enrollmentUpdate.current_lesson_id = validLessonIds.length > 0 ? validLessonIds[0] : null;
              fixes.references_fixed++;
            }

            if (Object.keys(enrollmentUpdate).length > 0) {
              await base44.asServiceRole.entities.Enrollment.update(enrollment.id, enrollmentUpdate);
              fixes.enrollments_cleaned++;
            }
          }
        } catch (e) {
          // Non-critical error, continue
        }

        // Fix course metadata
        const actualLessonCount = lessons.length;
        courseUpdateData.total_lessons = actualLessonCount;

        // Add basic lesson if course has none
        if (lessons.length === 0) {
          await base44.asServiceRole.entities.Lesson.create({
            course_id: courseId,
            title: 'Introduction to ' + (course.title || 'Course'),
            description: `Welcome to ${course.title || 'this course'}. This lesson introduces the key concepts and learning objectives.`,
            learning_objectives: [
              'Understand the course overview and structure',
              'Identify key learning goals and outcomes',
              'Prepare for upcoming lessons and assessments'
            ],
            content_type: 'richtext',
            order: 1,
            section: 'Introduction',
            duration_minutes: 30,
            slides: [{
              title: 'Welcome',
              content: `<h2>Welcome to ${course.title || 'this course'}</h2><p>Get ready to learn!</p>`,
              order: 1
            }]
          });
          courseUpdateData.total_lessons = 1;
          fixes.lessons_fixed++;
        }

        if (Object.keys(courseUpdateData).length > 0) {
          await base44.asServiceRole.entities.Course.update(courseId, courseUpdateData);
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