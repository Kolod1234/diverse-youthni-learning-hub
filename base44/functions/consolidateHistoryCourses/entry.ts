import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get all existing history courses
    const allHistoryCourses = await base44.entities.Course.filter({ category: 'history' });
    
    // Separate AS and A2 courses
    const asCourses = allHistoryCourses.filter(c => c.alevel_stage === 'as');
    const a2Courses = allHistoryCourses.filter(c => c.alevel_stage === 'a2');

    // Create consolidated courses
    const asCourseName = 'A-Level History AS (CCEA)';
    const a2CourseName = 'A-Level History A2 (CCEA)';

    // Check if consolidated courses already exist
    let asCourse = allHistoryCourses.find(c => c.title === asCourseName);
    let a2Course = allHistoryCourses.find(c => c.title === a2CourseName);

    // Create AS course if it doesn't exist
    if (!asCourse) {
      asCourse = await base44.entities.Course.create({
        title: asCourseName,
        description: 'CCEA A-Level History AS - All AS 1 and AS 2 options covering England, Ireland, Europe, Germany, Russia and more.',
        instructor: 'DYNI History Team',
        instructor_avatar: 'https://ui-avatars.com/api/?name=DYNI%20History&background=dc2626&color=fff',
        thumbnail: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800',
        qualification_type: 'alevel',
        alevel_stage: 'as',
        category: 'history',
        level: 'advanced',
        duration_hours: 180,
        total_lessons: 0,
        price: 0,
        is_featured: true,
        exam_board: 'CCEA'
      });
    }

    // Create A2 course if it doesn't exist
    if (!a2Course) {
      a2Course = await base44.entities.Course.create({
        title: a2CourseName,
        description: 'CCEA A-Level History A2 - All A2 1 and A2 2 options covering Crown and Parliament, Ireland, Great Powers, American Presidency and more.',
        instructor: 'DYNI History Team',
        instructor_avatar: 'https://ui-avatars.com/api/?name=DYNI%20History&background=dc2626&color=fff',
        thumbnail: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=800',
        qualification_type: 'alevel',
        alevel_stage: 'a2',
        category: 'history',
        level: 'advanced',
        duration_hours: 240,
        total_lessons: 0,
        price: 0,
        is_featured: true,
        exam_board: 'CCEA'
      });
    }

    let asLessonCount = 0;
    let a2LessonCount = 0;

    // Move lessons from AS courses
    for (const course of asCourses) {
      if (course.id === asCourse.id) continue; // Skip the consolidated course itself
      
      const lessons = await base44.entities.Lesson.filter({ course_id: course.id });
      
      for (const lesson of lessons) {
        await base44.asServiceRole.entities.Lesson.update(lesson.id, {
          course_id: asCourse.id,
          title: `${course.title.split(':')[0].trim()}: ${lesson.title}`,
          order: asLessonCount + 1
        });
        asLessonCount++;
      }
    }

    // Move lessons from A2 courses
    for (const course of a2Courses) {
      if (course.id === a2Course.id) continue; // Skip the consolidated course itself
      
      const lessons = await base44.entities.Lesson.filter({ course_id: course.id });
      
      for (const lesson of lessons) {
        await base44.asServiceRole.entities.Lesson.update(lesson.id, {
          course_id: a2Course.id,
          title: `${course.title.split(':')[0].trim()}: ${lesson.title}`,
          order: a2LessonCount + 1
        });
        a2LessonCount++;
      }
    }

    // Update lesson counts
    await base44.asServiceRole.entities.Course.update(asCourse.id, { total_lessons: asLessonCount });
    await base44.asServiceRole.entities.Course.update(a2Course.id, { total_lessons: a2LessonCount });

    // Delete old courses
    const coursesToDelete = [...asCourses, ...a2Courses].filter(c => 
      c.id !== asCourse.id && c.id !== a2Course.id
    );

    for (const course of coursesToDelete) {
      await base44.asServiceRole.entities.Course.delete(course.id);
    }

    return Response.json({
      success: true,
      message: `Consolidated ${coursesToDelete.length} courses into 2 main courses`,
      asCourse: { id: asCourse.id, lessons: asLessonCount },
      a2Course: { id: a2Course.id, lessons: a2LessonCount },
      deletedCourses: coursesToDelete.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});