import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const courseId = '694c8bedfa4994a506ea8516'; // CCEA GCSE Physics

    // Get all physics lessons
    const lessons = await base44.asServiceRole.entities.Lesson.filter({ course_id: courseId }, 'order', 100);

    // CCEA Physics has ONLY 2 main units - no subsections
    const unit1 = 'Unit 1: Motion, Force, Density and Kinetic Theory, Energy, and Atomic and Nuclear Physics';
    const unit2 = 'Unit 2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics';

    // Unit 1 keywords
    const unit1Keywords = [
      'motion', 'force', 'scalar', 'vector', 'kinematics', 'momentum', 'collision',
      'newton', 'moment', 'equilibrium', 'density', 'kinetic theory', 'pressure',
      'energy', 'power', 'work', 'efficiency', 'transfer', 'renewable',
      'atomic', 'nuclear', 'radioactiv', 'radiation', 'fission', 'fusion', 'isotope'
    ];

    // Unit 2 keywords
    const unit2Keywords = [
      'wave', 'light', 'reflection', 'refraction', 'lens', 'prism', 'dispersion',
      'optical', 'electromagnetic spectrum', 'electric', 'circuit', 'ohm', 'resistance',
      'current', 'voltage', 'conductor', 'series', 'parallel', 'magnet', 'induction',
      'transformer', 'generator', 'space', 'solar', 'planet', 'star', 'universe',
      'galaxy', 'cosmic'
    ];

    let updateCount = 0;

    for (const lesson of lessons) {
      // Determine correct unit based on title
      const title = lesson.title.toLowerCase();
      let correctSection = null;

      // Check Unit 2 keywords first (more specific)
      if (unit2Keywords.some(keyword => title.includes(keyword))) {
        correctSection = unit2;
      } 
      // Then check Unit 1 keywords
      else if (unit1Keywords.some(keyword => title.includes(keyword))) {
        correctSection = unit1;
      }

      // Update if section is different OR if it contains subsections (has " - " in it)
      if (correctSection && (lesson.section !== correctSection || lesson.section.includes(' - '))) {
        await base44.asServiceRole.entities.Lesson.update(lesson.id, {
          section: correctSection
        });
        updateCount++;
        console.log(`Updated: ${lesson.title} -> ${correctSection}`);
      }
    }

    return Response.json({ 
      success: true, 
      message: `Fixed ${updateCount} physics lessons to match CCEA specification units`,
      total_lessons: lessons.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});