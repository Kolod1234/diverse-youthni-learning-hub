import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    console.log('Starting CCEA Physics curriculum import...');

    // Search CCEA website for physics curriculum structure
    const curriculumResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Search the CCEA website for the complete GCSE Physics curriculum structure. Find:
1. All units/modules in the physics curriculum
2. Topics within each unit
3. Key lessons and learning content for each topic
4. Specification details and learning outcomes

Extract a comprehensive structured curriculum that includes:
- Unit titles and descriptions
- Topics within each unit
- Lesson titles and descriptions
- Learning objectives for each lesson

Organize this as a complete GCSE Physics course structure.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          course_title: { type: 'string' },
          course_description: { type: 'string' },
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
      }
    });

    console.log('Curriculum structure received:', JSON.stringify(curriculumResponse, null, 2));

    // Check if physics course already exists
    const existingCourses = await base44.asServiceRole.entities.Course.filter({ 
      category: 'physics',
      exam_board: 'CCEA'
    });

    let course;
    if (existingCourses.length > 0) {
      course = existingCourses[0];
      console.log(`Using existing course: ${course.title} (${course.id})`);
    } else {
      // Create the main physics course
      course = await base44.asServiceRole.entities.Course.create({
        title: curriculumResponse.course_title || 'CCEA GCSE Physics',
        description: curriculumResponse.course_description || 'Complete GCSE Physics curriculum aligned with CCEA specifications',
        category: 'physics',
        exam_board: 'CCEA',
        level: 'intermediate',
        instructor: 'CCEA Curriculum',
        is_featured: true,
        total_lessons: 0
      });
      console.log(`Created new course: ${course.title} (${course.id})`);
    }

    // Import all units, topics, and lessons
    let lessonOrder = 1;
    const createdLessons = [];

    for (const unit of curriculumResponse.units || []) {
      console.log(`Processing unit: ${unit.unit_title}`);
      
      for (const topic of unit.topics || []) {
        console.log(`  Processing topic: ${topic.topic_title}`);
        
        for (const lessonData of topic.lessons || []) {
          try {
            const lesson = await base44.asServiceRole.entities.Lesson.create({
              course_id: course.id,
              title: lessonData.lesson_title,
              description: lessonData.lesson_description,
              section: `${unit.unit_title} - ${topic.topic_title}`,
              learning_objectives: lessonData.learning_objectives || [],
              order: lessonOrder,
              content_type: 'richtext',
              slides: [],
              is_preview: false
            });
            
            createdLessons.push({
              unit: unit.unit_title,
              topic: topic.topic_title,
              lesson: lesson.title
            });
            
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
      message: `Successfully imported CCEA Physics curriculum`,
      course_id: course.id,
      course_title: course.title,
      total_units: curriculumResponse.units?.length || 0,
      total_lessons: createdLessons.length,
      lessons: createdLessons.slice(0, 20) // Show first 20
    });

  } catch (error) {
    console.error('Error importing CCEA Physics:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});