import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    const { examBoard, subject, courseLevel, courseType } = await req.json();

    if (!examBoard || !subject) {
      return Response.json({ error: 'Exam board and subject are required' }, { status: 400 });
    }

    console.log(`Importing curriculum: ${examBoard} ${subject} ${courseLevel || ''}`);

    // Search for official curriculum structure
    const curriculumResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Search official curriculum websites and educational resources to find the complete course structure for:

Exam Board/Organization: ${examBoard}
Subject: ${subject}
Level: ${courseLevel || 'GCSE'}
Course Type: ${courseType || 'Academic'}

Search for:
1. Official curriculum specifications from ${examBoard} website
2. All units/modules in the curriculum
3. Topics within each unit
4. Detailed lessons with learning content
5. Learning objectives/outcomes for each lesson

Extract a comprehensive structured curriculum including:
- Course title and description
- Units with titles and descriptions
- Topics within each unit
- Lessons with titles, descriptions, and learning objectives
- Ensure learning objectives are specific, measurable, and aligned with ${examBoard} standards

Return as structured JSON.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          course_title: { type: 'string' },
          course_description: { type: 'string' },
          exam_board: { type: 'string' },
          level: { type: 'string' },
          duration_hours: { type: 'number' },
          units: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                unit_title: { type: 'string' },
                unit_description: { type: 'string' },
                topics: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      topic_title: { type: 'string' },
                      topic_description: { type: 'string' },
                      lessons: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            lesson_title: { type: 'string' },
                            lesson_description: { type: 'string' },
                            learning_objectives: {
                              type: 'array',
                              items: { type: 'string' }
                            },
                            duration_minutes: { type: 'number' }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    console.log('Curriculum structure received');

    // Map subject to category
    const categoryMap = {
      'mathematics': 'mathematics',
      'maths': 'mathematics',
      'english': 'english',
      'biology': 'biology',
      'chemistry': 'chemistry',
      'physics': 'physics',
      'history': 'history',
      'geography': 'geography'
    };
    
    const category = categoryMap[subject.toLowerCase()] || 'mathematics';

    // Check if course already exists
    const existingCourses = await base44.asServiceRole.entities.Course.filter({ 
      title: curriculumResponse.course_title
    });

    let course;
    if (existingCourses.length > 0) {
      course = existingCourses[0];
      console.log(`Using existing course: ${course.title} (${course.id})`);
    } else {
      // Create the course
      course = await base44.asServiceRole.entities.Course.create({
        title: curriculumResponse.course_title,
        description: curriculumResponse.course_description,
        category: category,
        exam_board: curriculumResponse.exam_board || examBoard,
        level: curriculumResponse.level?.toLowerCase() || courseLevel?.toLowerCase() || 'intermediate',
        instructor: `${examBoard} Curriculum`,
        duration_hours: curriculumResponse.duration_hours || 100,
        is_featured: true,
        total_lessons: 0,
        thumbnail: `https://source.unsplash.com/800x600/?${subject},education`
      });
      console.log(`Created course: ${course.title} (${course.id})`);
    }

    // Import all units, topics, and lessons
    let lessonOrder = 1;
    const createdLessons = [];
    const importStats = {
      units: 0,
      topics: 0,
      lessons: 0
    };

    for (const unit of curriculumResponse.units || []) {
      console.log(`Processing unit: ${unit.unit_title}`);
      importStats.units++;
      
      for (const topic of unit.topics || []) {
        console.log(`  Processing topic: ${topic.topic_title}`);
        importStats.topics++;
        
        for (const lessonData of topic.lessons || []) {
          try {
            const lesson = await base44.asServiceRole.entities.Lesson.create({
              course_id: course.id,
              title: lessonData.lesson_title,
              description: lessonData.lesson_description || `Learn about ${lessonData.lesson_title}`,
              section: `${unit.unit_title} → ${topic.topic_title}`,
              learning_objectives: lessonData.learning_objectives || [],
              order: lessonOrder,
              content_type: 'richtext',
              slides: [],
              is_preview: false,
              duration_minutes: lessonData.duration_minutes || 45
            });
            
            createdLessons.push({
              unit: unit.unit_title,
              topic: topic.topic_title,
              lesson: lesson.title,
              objectives_count: lessonData.learning_objectives?.length || 0
            });
            
            importStats.lessons++;
            lessonOrder++;
            console.log(`    Created lesson ${lessonOrder - 1}: ${lesson.title}`);
          } catch (error) {
            console.error(`    Failed to create lesson: ${lessonData.lesson_title}`, error.message);
          }
        }
      }
    }

    // Update course with total lessons
    await base44.asServiceRole.entities.Course.update(course.id, {
      total_lessons: createdLessons.length
    });

    return Response.json({
      success: true,
      message: `Successfully imported ${examBoard} ${subject} curriculum`,
      course_id: course.id,
      course_title: course.title,
      stats: importStats,
      sample_lessons: createdLessons.slice(0, 15)
    });

  } catch (error) {
    console.error('Error importing curriculum:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});