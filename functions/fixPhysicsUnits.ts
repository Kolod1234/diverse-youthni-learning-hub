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

    // CCEA Physics has 2 main units:
    // Unit 1: Motion, Force, Density and Kinetic Theory, Energy, and Atomic and Nuclear Physics
    // Unit 2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics

    const lessonSections = {
      // Unit 1 lessons
      'Motion and Force': 'Unit 1: Motion, Force, Density and Kinetic Theory, Energy, and Atomic and Nuclear Physics',
      'Scalars and Vectors': 'Unit 1: Motion, Force, Density and Kinetic Theory, Energy, and Atomic and Nuclear Physics',
      'Kinematics': 'Unit 1: Motion, Force, Density and Kinetic Theory, Energy, and Atomic and Nuclear Physics',
      'Momentum and Collisions': 'Unit 1: Motion, Force, Density and Kinetic Theory, Energy, and Atomic and Nuclear Physics',
      "Newton's Laws of Motion": 'Unit 1: Motion, Force, Density and Kinetic Theory, Energy, and Atomic and Nuclear Physics',
      'Moments and Equilibrium': 'Unit 1: Motion, Force, Density and Kinetic Theory, Energy, and Atomic and Nuclear Physics',
      'Kinetic Theory and Density': 'Unit 1: Motion, Force, Density and Kinetic Theory, Energy, and Atomic and Nuclear Physics',
      'Density and Pressure': 'Unit 1: Motion, Force, Density and Kinetic Theory, Energy, and Atomic and Nuclear Physics',
      'Energy Transfer': 'Unit 1: Motion, Force, Density and Kinetic Theory, Energy, and Atomic and Nuclear Physics',
      'Work, Energy and Power': 'Unit 1: Motion, Force, Density and Kinetic Theory, Energy, and Atomic and Nuclear Physics',
      'Atomic Structure': 'Unit 1: Motion, Force, Density and Kinetic Theory, Energy, and Atomic and Nuclear Physics',
      'Radioactivity': 'Unit 1: Motion, Force, Density and Kinetic Theory, Energy, and Atomic and Nuclear Physics',
      'Nuclear Fission and Fusion': 'Unit 1: Motion, Force, Density and Kinetic Theory, Energy, and Atomic and Nuclear Physics',
      
      // Unit 2 lessons
      'Wave Properties': 'Unit 2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics',
      'Light and Reflection': 'Unit 2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics',
      'Refraction': 'Unit 2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics',
      'Lenses and the Eye': 'Unit 2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics',
      'Electromagnetic Spectrum': 'Unit 2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics',
      'Electric Circuits': 'Unit 2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics',
      'Current and Voltage': 'Unit 2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics',
      'Resistance and Ohm\'s Law': 'Unit 2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics',
      'Series and Parallel Circuits': 'Unit 2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics',
      'Electrical Power': 'Unit 2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics',
      'Magnetism': 'Unit 2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics',
      'Electromagnetism': 'Unit 2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics',
      'Electromagnetic Induction': 'Unit 2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics',
      'Transformers': 'Unit 2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics',
      'Space Physics': 'Unit 2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics',
      'The Solar System': 'Unit 2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics',
      'Stars and Galaxies': 'Unit 2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics',
      'The Universe': 'Unit 2: Waves, Light, Electricity, Magnetism, Electromagnetism and Space Physics',
    };

    let updateCount = 0;

    for (const lesson of lessons) {
      const correctSection = lessonSections[lesson.title];
      
      if (correctSection && lesson.section !== correctSection) {
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