import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const allCourses = await base44.asServiceRole.entities.Course.filter({
      qualification_type: 'alevel'
    });

    const results = [];
    
    for (const course of allCourses) {
      try {
        const key = `${course.category}_${course.alevel_stage}`;
        const lessons = getLessonData(key);
        
        if (!lessons || lessons.length === 0) {
          results.push({ 
            course: course.title, 
            category: course.category,
            stage: course.alevel_stage,
            status: 'no data available' 
          });
          continue;
        }

        // Delete existing lessons
        const existing = await base44.entities.Lesson.filter({ course_id: course.id });
        if (existing.length > 0) {
          await Promise.all(existing.map(l => base44.asServiceRole.entities.Lesson.delete(l.id)));
        }

        // Create lessons in batches
        const batchSize = 20;
        for (let i = 0; i < lessons.length; i += batchSize) {
          const batch = lessons.slice(i, i + batchSize);
          await base44.entities.Lesson.bulkCreate(batch.map(l => ({
            course_id: course.id,
            title: l.t,
            description: l.d,
            section: l.s,
            order: l.o,
            learning_objectives: l.obj || [],
            content_type: 'richtext',
            slides: [],
            is_preview: l.o <= 3,
            duration_minutes: 50
          })));
          await new Promise(r => setTimeout(r, 500));
        }

        await base44.asServiceRole.entities.Course.update(course.id, {
          total_lessons: lessons.length
        });

        results.push({ 
          course: course.title, 
          category: course.category,
          stage: course.alevel_stage,
          lessons: lessons.length, 
          status: 'success' 
        });
        
        await new Promise(r => setTimeout(r, 12000));

      } catch (error) {
        results.push({ 
          course: course.title, 
          category: course.category,
          status: 'error', 
          error: error.message 
        });
      }
    }

    return Response.json({ success: true, results, total_courses: allCourses.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getLessonData(key) {
  const dataMap = {
    'mathematics_as': getMathematicsAS,
    'mathematics_a2': getMathematicsA2,
    'further_mathematics_as': getFurtherMathematicsAS,
    'further_mathematics_a2': getFurtherMathematicsA2,
    'biology_as': getBiologyAS,
    'biology_a2': getBiologyA2,
    'chemistry_as': getChemistryAS,
    'chemistry_a2': getChemistryA2,
    'physics_as': getPhysicsAS,
    'physics_a2': getPhysicsA2,
    'geography_as': getGeographyAS,
    'geography_a2': getGeographyA2,
  };
  
  const fn = dataMap[key];
  return fn ? fn() : [];
}

// Copy all the lesson data functions here
// Placeholder - will be populated with actual data
function getMathematicsAS() { return []; }
function getMathematicsA2() { return []; }
function getFurtherMathematicsAS() { return []; }
function getFurtherMathematicsA2() { return []; }
function getBiologyAS() { return []; }
function getBiologyA2() { return []; }
function getChemistryAS() { return []; }
function getChemistryA2() { return []; }
function getPhysicsAS() { return []; }
function getPhysicsA2() { return []; }
function getGeographyAS() { return []; }
function getGeographyA2() { return []; }