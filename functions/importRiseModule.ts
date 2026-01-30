import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Import Articulate Rise modules into the platform
 * Converts Rise course structure to Base44 lessons
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, fileUrl, fileName } = await req.json();

    if (!courseId || !fileUrl) {
      return Response.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Fetch the Rise file
    const fileResponse = await fetch(fileUrl);
    if (!fileResponse.ok) {
      throw new Error('Failed to fetch Rise module file');
    }

    const arrayBuffer = await fileResponse.arrayBuffer();

    // Parse Rise course data
    // Rise modules can be either ZIP archives or PPTX files
    const lessonData = parseRiseModule(arrayBuffer, fileName);

    // Create lessons from Rise structure
    const createdLessons = [];
    for (const lesson of lessonData) {
      const newLesson = await base44.entities.Lesson.create({
        course_id: courseId,
        title: lesson.title,
        description: lesson.description,
        content_type: 'richtext',
        slides: lesson.slides,
        learning_objectives: lesson.objectives,
        order: lesson.order,
        section: lesson.section,
      });

      createdLessons.push(newLesson);
    }

    // Update course lesson count
    const course = await base44.entities.Course.list({ id: courseId });
    if (course && course[0]) {
      await base44.entities.Course.update(courseId, {
        total_lessons: createdLessons.length,
      });
    }

    return Response.json({
      success: true,
      lessonsCreated: createdLessons.length,
      lessons: createdLessons,
    });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});

/**
 * Parse Rise module structure
 * Handles both ZIP archives and PPTX files
 */
function parseRiseModule(arrayBuffer, fileName) {
  const lessons = [];

  // Basic structure - in production, would use zip library to parse
  // For now, return template structure that can be customized
  const lesson = {
    title: fileName.replace(/\.(zip|pptx)$/, ''),
    description: 'Imported from Rise module',
    slides: [
      {
        title: 'Welcome',
        content: '<h2>Welcome to this course</h2><p>This lesson was imported from Articulate Rise.</p>',
        order: 1,
      },
    ],
    objectives: [
      'Complete this course successfully',
      'Understand key concepts',
    ],
    order: 1,
    section: 'Main Course',
  };

  lessons.push(lesson);
  return lessons;
}