import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    // CCEA English Language Learning Objectives organized by unit
    const englishObjectives = {
      unit1_writing: [
        "Write accurately and effectively",
        "Use an appropriate writing form",
        "Express ideas and/or information precisely and accurately",
        "Select vocabulary to persuade and/or inform the reader",
        "Use accurate grammar, spelling and punctuation"
      ],
      unit1_reading: [
        "Read and understand texts",
        "Recognise the effects of language choices",
        "Develop interpretations of writers' ideas",
        "Explain and evaluate how writers use linguistic, grammatical and structural features to influence the reader"
      ],
      unit2_speaking: [
        "Communicate clearly and effectively",
        "Present information and ideas",
        "Use standard English as appropriate",
        "Structure and sustain talk",
        "Choose and adapt language appropriate to an audience",
        "Respond appropriately to questions and views of others",
        "Interact with others",
        "Make a range of effective contributions",
        "Express ideas clearly, accurately and appropriately",
        "Listen and respond to others' ideas and perspectives",
        "Challenge what they hear where appropriate and shape meaning through asking questions",
        "Use a variety of techniques as appropriate",
        "Create and sustain different roles from a range of real-life contexts",
        "Experiment with language to engage the audience"
      ],
      unit3_spoken: [
        "Understand the characteristics of spoken language",
        "Understand influences on spoken language choices",
        "Explore the impact of spoken language choices",
        "Understand how language varies in different contexts"
      ],
      unit3_written: [
        "Read and understand texts",
        "Understand how meaning is constructed",
        "Recognise the effect of language choices and patterns",
        "Select material appropriate to purpose",
        "Evaluate how texts may be interpreted differently depending on the reader's perspective",
        "Explain and evaluate how writers use linguistic and presentational features to sustain the reader's interest",
        "Collate from different sources and make appropriate comparisons and cross-references"
      ],
      unit4_writing: [
        "Write clearly and fluently (as well as imaginatively, if appropriate)",
        "Organise ideas to support coherence",
        "Use an appropriate writing form",
        "Select vocabulary appropriate to the task to engage the reader",
        "Use a range of sentence structures for effect",
        "Use accurate grammar, spelling and punctuation"
      ],
      unit4_reading: [
        "Read and understand texts",
        "Understand how meaning is constructed",
        "Recognise the effect of language choices and patterns",
        "Select material appropriate to purpose",
        "Evaluate how texts may be interpreted differently depending on the reader's perspective",
        "Explain and evaluate how writers use linguistic and presentational features to sustain the reader's interest"
      ]
    };

    // Get all English courses
    const englishCourses = await base44.asServiceRole.entities.Course.filter({ 
      category: 'english' 
    });

    if (englishCourses.length === 0) {
      return Response.json({ 
        message: 'No English courses found',
        coursesUpdated: 0 
      });
    }

    let lessonsUpdated = 0;
    let coursesProcessed = 0;

    // Update each English course's lessons
    for (const course of englishCourses) {
      const lessons = await base44.asServiceRole.entities.Lesson.filter({ 
        course_id: course.id 
      });

      for (const lesson of lessons) {
        // Combine all relevant objectives for general lessons
        const combinedObjectives = [
          ...englishObjectives.unit1_writing,
          ...englishObjectives.unit1_reading,
          ...englishObjectives.unit4_writing,
          ...englishObjectives.unit4_reading
        ];

        await base44.asServiceRole.entities.Lesson.update(lesson.id, {
          learning_objectives: combinedObjectives
        });

        lessonsUpdated++;
      }

      coursesProcessed++;
    }

    return Response.json({ 
      message: 'English Language objectives updated successfully',
      coursesProcessed,
      lessonsUpdated,
      objectives: englishObjectives
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});