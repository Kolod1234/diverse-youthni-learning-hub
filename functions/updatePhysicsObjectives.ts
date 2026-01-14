import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    console.log('Fetching CCEA Physics learning objectives...');

    // Get all physics courses
    const physicsCourses = await base44.asServiceRole.entities.Course.filter({ 
      category: 'physics'
    });

    if (physicsCourses.length === 0) {
      return Response.json({ 
        error: 'No physics courses found'
      }, { status: 404 });
    }

    // Get all lessons for physics courses
    const allLessons = [];
    for (const course of physicsCourses) {
      const lessons = await base44.asServiceRole.entities.Lesson.filter({ 
        course_id: course.id 
      });
      allLessons.push(...lessons.map(l => ({ ...l, course_title: course.title })));
    }

    console.log(`Found ${allLessons.length} physics lessons`);

    // Fetch CCEA objectives for all topics
    const cceavResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Search the official CCEA (Council for the Curriculum, Examinations & Assessment) website for the GCSE Physics specification document.

Extract the complete learning objectives and outcomes for these physics topics:
${allLessons.map(l => `- ${l.title}`).join('\n')}

For EACH topic, provide:
1. Specific CCEA learning objectives (what students should learn)
2. Learning outcomes (what students should be able to do)
3. Key concepts and skills

Return structured data with objectives for each lesson title.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          lessons: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                lesson_title: { type: 'string' },
                learning_objectives: {
                  type: 'array',
                  items: { type: 'string' }
                },
                learning_outcomes: {
                  type: 'array',
                  items: { type: 'string' }
                }
              }
            }
          }
        }
      }
    });

    console.log('Received CCEA objectives, updating lessons...');

    // Update lessons with objectives
    let updatedCount = 0;
    const updates = [];

    for (const lesson of allLessons) {
      // Find matching objectives from CCEA data
      const ccealLesson = cceavResponse.lessons?.find(cl => 
        cl.lesson_title?.toLowerCase().includes(lesson.title.toLowerCase()) ||
        lesson.title.toLowerCase().includes(cl.lesson_title?.toLowerCase())
      );

      if (ccealLesson && ccealLesson.learning_objectives?.length > 0) {
        try {
          // Combine objectives and outcomes
          const allObjectives = [
            ...(ccealLesson.learning_objectives || []),
            ...(ccealLesson.learning_outcomes || []).map(o => `Outcome: ${o}`)
          ];

          await base44.asServiceRole.entities.Lesson.update(lesson.id, {
            learning_objectives: allObjectives
          });

          updatedCount++;
          updates.push({
            lesson: lesson.title,
            course: lesson.course_title,
            objectives_count: allObjectives.length
          });

          console.log(`✓ Updated: ${lesson.title} (${allObjectives.length} objectives)`);
        } catch (error) {
          console.error(`✗ Failed to update ${lesson.title}:`, error.message);
        }
      } else {
        console.log(`⚠ No CCEA match found for: ${lesson.title}`);
      }
    }

    return Response.json({
      success: true,
      message: `Updated ${updatedCount} of ${allLessons.length} physics lessons with CCEA objectives`,
      total_lessons: allLessons.length,
      updated_count: updatedCount,
      updates: updates
    });

  } catch (error) {
    console.error('Error updating physics objectives:', error);
    return Response.json({ 
      error: error.message,
      stack: error.stack 
    }, { status: 500 });
  }
});