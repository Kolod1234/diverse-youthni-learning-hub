import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const courseId = '694c8bedfa4994a506ea8516'; // CCEA GCSE Physics
    const pdfUrl = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/40990d00b_GCSEPhysics2017-specification-Standard1.pdf';

    // Get all physics lessons
    const lessons = await base44.asServiceRole.entities.Lesson.filter({ course_id: courseId }, 'order', 100);

    const objectivesMap = {
      'Motion': [
        'Investigate and use quantitative relationships between speed, distance and time',
        'Calculate average speed from distance-time graphs',
        'Use equations for motion including average speed and rate of change of speed',
        'Understand vectors and scalars (displacement, velocity, acceleration)',
        'Interpret motion using graphical methods'
      ],
      'Force': [
        'Understand that forces arise between objects and exist as pairs',
        'Calculate resultant forces and apply Newton\'s laws of motion',
        'Investigate Newton\'s first and second laws experimentally',
        'Distinguish between mass and weight using W = mg',
        'Apply Hooke\'s law and understand spring constant',
        'Calculate pressure and understand its applications',
        'Define and calculate moments of forces',
        'Apply the Principle of Moments to balanced systems',
        'Understand centre of gravity and stability'
      ],
      'Density': [
        'Investigate experimentally the relationship between mass and volume',
        'Calculate density using density = mass/volume',
        'Measure density of regular and irregular solids',
        'Use kinetic theory to explain properties of solids, liquids and gases',
        'Explain density differences between states of matter'
      ],
      'Energy': [
        'Recall different forms of energy (chemical, heat, electrical, kinetic, etc.)',
        'Apply the Principle of Conservation of Energy',
        'Distinguish between renewable and non-renewable energy resources',
        'Calculate efficiency of energy transfers',
        'Understand and calculate work done using work = force × distance',
        'Calculate power using power = energy/time and power = work/time',
        'Calculate kinetic energy using Ek = ½mv²',
        'Calculate gravitational potential energy using Ep = mgh',
        'Explain heat transfer by conduction, convection and radiation'
      ],
      'Atomic': [
        'Research historical development of atomic models',
        'Describe the Rutherford alpha-particle scattering experiment',
        'Describe atomic structure in terms of protons, neutrons and electrons',
        'Explain radioactive decay and types of radiation (alpha, beta, gamma)',
        'Complete nuclear decay equations',
        'Understand background radiation and safety precautions',
        'Explain half-life and perform related calculations',
        'Describe uses of radioactivity in medicine, industry and agriculture',
        'Explain nuclear fission and its use in power generation',
        'Describe nuclear fusion and its potential as an energy source'
      ],
      'Nuclear': [
        'Understand nuclear fission as an energy source for electricity',
        'Explain the fission chain reaction process',
        'Discuss political, social and environmental issues of nuclear power',
        'Describe nuclear fusion and its role in stars',
        'Appreciate fusion research at ITER project',
        'Compare energy output of fusion vs fission vs chemical reactions'
      ],
      'Waves': [
        'Understand that waves transfer energy through vibrations',
        'Distinguish between transverse and longitudinal waves',
        'Explain frequency, wavelength and amplitude',
        'Use v = fλ to calculate wave velocity',
        'Describe reflection and refraction of waves',
        'Understand echoes, sonar and radar applications',
        'Identify regions of electromagnetic spectrum',
        'Understand health hazards of electromagnetic radiation'
      ],
      'Light': [
        'Investigate reflection of light using plane mirrors',
        'Apply law of reflection (angle of incidence = angle of reflection)',
        'Investigate refraction of light through glass blocks',
        'Relate refraction to change in speed of light',
        'Explain dispersion of white light by prisms',
        'Investigate critical angle and total internal reflection',
        'Explain how optical fibres work',
        'Understand converging and diverging lenses',
        'Draw ray diagrams for lenses and explain eye defects'
      ],
      'Electricity': [
        'Understand conductors and insulators in terms of free electrons',
        'Draw circuit diagrams using standard symbols',
        'Calculate charge using Q = It',
        'Investigate Ohm\'s law experimentally',
        'Use V = IR to solve circuit problems',
        'Understand series and parallel circuits',
        'Calculate combined resistance of resistors',
        'Investigate factors affecting resistance',
        'Calculate electrical energy and power',
        'Understand electricity in the home including wiring and safety'
      ],
      'Magnetism': [
        'Investigate and describe magnetic fields around bar magnets',
        'Investigate magnetic field of current-carrying coils',
        'Understand factors affecting strength of electromagnets',
        'Apply Fleming\'s Left Hand Rule',
        'Distinguish between a.c. and d.c. current',
        'Understand electromagnetic induction',
        'Explain operation of transformers',
        'Use transformer equation NS/NP = VS/VP',
        'Explain electricity generation and transmission'
      ],
      'Electromagnetism': [
        'Investigate electromagnetic induction experimentally',
        'Understand the generator effect',
        'Explain the motor effect and Fleming\'s Left Hand Rule',
        'Describe transformer construction and operation',
        'Calculate voltage and current in transformers'
      ],
      'Space': [
        'Describe features of the Solar System',
        'Recall order of planets from the Sun',
        'Understand orbital motion and role of gravity',
        'Explain uses of artificial satellites',
        'Understand star formation and life cycles',
        'Describe supernova and black hole formation',
        'Explain the Big Bang theory and supporting evidence',
        'Understand red shift and cosmic microwave background radiation',
        'Calculate distances using light years'
      ],
      'Practical': [
        'Plan investigations identifying variables',
        'Carry out risk assessments',
        'Select appropriate equipment for accurate results',
        'Record data in appropriate tables',
        'Plot graphs with correct axes and scales',
        'Analyze and interpret experimental data',
        'Identify and treat anomalous results',
        'Draw evidence-based conclusions'
      ]
    };

    let updateCount = 0;

    for (const lesson of lessons) {
      const title = lesson.title.toLowerCase();
      let objectives = [];

      // Match lesson to appropriate objectives with comprehensive keyword matching
      if (title.includes('motion') || title.includes('speed') || title.includes('velocity') || title.includes('scalar') || title.includes('vector') || title.includes('kinematic') || title.includes('displacement') || title.includes('acceleration')) {
        objectives = objectivesMap['Motion'];
      } else if (title.includes('collision') || title.includes('momentum') || title.includes('equilibrium')) {
        objectives = objectivesMap['Force'];
      } else if (title.includes('force') || title.includes('newton') || title.includes('moment') || title.includes('pressure') || title.includes('hooke') || title.includes('gravity') || title.includes('centre of')) {
        objectives = objectivesMap['Force'];
      } else if (title.includes('density') || title.includes('kinetic theory') || title.includes('matter') || title.includes('particle')) {
        objectives = objectivesMap['Density'];
      } else if (title.includes('energy') || title.includes('power') || title.includes('work') || title.includes('efficiency') || title.includes('renewable') || title.includes('heat') || title.includes('transfer')) {
        objectives = objectivesMap['Energy'];
      } else if (title.includes('atomic') || title.includes('radioactiv') || title.includes('radiation') || title.includes('isotope') || title.includes('half-life')) {
        objectives = objectivesMap['Atomic'];
      } else if (title.includes('nuclear') || title.includes('fission') || title.includes('fusion')) {
        objectives = objectivesMap['Nuclear'];
      } else if (title.includes('wave') || title.includes('frequency') || title.includes('echo') || title.includes('electromagnetic spectrum') || title.includes('ultrasound') || title.includes('sonar')) {
        objectives = objectivesMap['Waves'];
      } else if (title.includes('light') || title.includes('refraction') || title.includes('reflection') || title.includes('lens') || title.includes('prism') || title.includes('dispersion') || title.includes('optical')) {
        objectives = objectivesMap['Light'];
      } else if (title.includes('electric') || title.includes('circuit') || title.includes('ohm') || title.includes('resistance') || title.includes('current') || title.includes('voltage') || title.includes('conductor') || title.includes('insulator')) {
        objectives = objectivesMap['Electricity'];
      } else if (title.includes('magnet') && !title.includes('electro')) {
        objectives = objectivesMap['Magnetism'];
      } else if (title.includes('electromagnetism') || title.includes('electromagnetic induction') || title.includes('induction') || title.includes('transformer') || title.includes('generator') || title.includes('motor effect')) {
        objectives = objectivesMap['Electromagnetism'];
      } else if (title.includes('space') || title.includes('solar') || title.includes('planet') || title.includes('star') || title.includes('universe') || title.includes('big bang') || title.includes('cosmic') || title.includes('galaxy')) {
        objectives = objectivesMap['Space'];
      } else if (title.includes('practical') || title.includes('experiment') || title.includes('data') || title.includes('investigation')) {
        objectives = objectivesMap['Practical'];
      }

      // Add PDF resource to all lessons
      const existingResources = lesson.resources || [];
      const hasResource = existingResources.some(r => r.name === 'GCSE CCEA Physics Curriculum');
      
      if (!hasResource) {
        existingResources.push({
          name: 'GCSE CCEA Physics Curriculum',
          url: pdfUrl,
          type: 'PDF Specification'
        });
      }

      if (objectives.length > 0 || !hasResource) {
        await base44.asServiceRole.entities.Lesson.update(lesson.id, {
          learning_objectives: objectives.length > 0 ? objectives : lesson.learning_objectives,
          resources: existingResources
        });
        updateCount++;
      }
    }

    return Response.json({ 
      success: true, 
      message: `Updated ${updateCount} lessons with CCEA objectives and curriculum PDF`,
      total_lessons: lessons.length
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});