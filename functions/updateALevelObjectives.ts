import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized - Admin only' }, { status: 403 });
    }

    // A-Level curriculum mapping based on CCEA specification
    const aLevelObjectives = {
      biology: {
        as_units: {
          'AS 1: Molecules and Cells': [
            'Demonstrate knowledge and understanding of the importance of water as a solvent',
            'Outline the role of inorganic ions in biological systems',
            'Demonstrate knowledge of carbohydrates: monosaccharides, disaccharides, polysaccharides',
            'Demonstrate knowledge of lipids: triglycerides, saturated and unsaturated fatty acids, phospholipids',
            'Demonstrate knowledge of proteins: amino acid structure, primary, secondary, tertiary and quaternary structure',
            'Demonstrate knowledge of nucleic acids: DNA and RNA structure, replication',
            'Carry out biochemical tests for carbohydrates and proteins',
            'Identify amino acids using paper chromatography',
            'Demonstrate knowledge of enzyme structure and function',
            'Understand enzyme inhibitors and factors affecting enzyme activity',
            'Demonstrate knowledge of virus structure: bacteriophages and HIV',
            'Understand prokaryotic and eukaryotic cell structure',
            'Demonstrate knowledge of membrane structure (fluid mosaic model)',
            'Understand mechanisms of transport across membranes',
            'Demonstrate knowledge of the cell cycle and mitosis',
            'Understand meiosis and its significance in genetic variation',
            'Demonstrate knowledge of tissue and organ structure (ileum and leaf)'
          ],
          'AS 2: Organisms and Biodiversity': [
            'Understand surface area to volume ratio and its biological significance',
            'Demonstrate knowledge of gas exchange in plants and mammals',
            'Understand breathing system structure and function',
            'Demonstrate knowledge of plant transport systems',
            'Understand transpiration and factors affecting its rate',
            'Demonstrate knowledge of mammalian circulatory system',
            'Understand heart structure and cardiac cycle',
            'Demonstrate knowledge of blood composition and functions',
            'Understand haemoglobin and oxygen transport',
            'Demonstrate knowledge of organism adaptations',
            'Understand ecological factors and biodiversity',
            'Use Simpson\'s index to measure species diversity',
            'Demonstrate knowledge of taxonomy and classification',
            'Understand the five kingdom system',
            'Demonstrate knowledge of human impact on biodiversity'
          ]
        },
        a2_units: {
          'A2 1: Physiology, Co-ordination and Control, and Ecosystems': [
            'Demonstrate knowledge of homeostasis principles',
            'Understand kidney structure and function in excretion and osmoregulation',
            'Demonstrate knowledge of ultrafiltration and selective reabsorption',
            'Understand the role of ADH in osmoregulation',
            'Demonstrate knowledge of natural barriers to infection',
            'Understand antibody-mediated and cell-mediated immunity',
            'Demonstrate knowledge of phytochromes and plant growth substances',
            'Understand neurone structure and nerve impulse transmission',
            'Demonstrate knowledge of synaptic transmission',
            'Understand eye structure and function in vision',
            'Demonstrate knowledge of muscle structure and contraction',
            'Understand population growth and interactions',
            'Demonstrate knowledge of ecological succession',
            'Understand food chains, food webs and energy transfer'
          ],
          'A2 2: Biochemistry, Genetics and Evolutionary Trends': [
            'Demonstrate knowledge of ATP and its role in energy transfer',
            'Understand glycolysis and aerobic respiration',
            'Demonstrate knowledge of Krebs cycle and electron transport chain',
            'Understand anaerobic respiration and respiratory quotient',
            'Demonstrate knowledge of light-dependent and light-independent stages of photosynthesis',
            'Understand factors limiting rate of photosynthesis',
            'Demonstrate knowledge of DNA as genetic code: transcription and translation',
            'Understand gene technology: PCR, DNA probes, genetic fingerprinting',
            'Demonstrate knowledge of gene transfer and GM organisms',
            'Understand patterns of inheritance: monohybrid and dihybrid crosses',
            'Demonstrate knowledge of population genetics and Hardy-Weinberg equation',
            'Understand selection and evolutionary change',
            'Demonstrate knowledge of Kingdom Plantae: mosses, ferns, flowering plants',
            'Understand Kingdom Animalia: characteristics of major phyla'
          ]
        }
      },
      chemistry: {
        as_units: {
          'AS 1: Basic Concepts in Physical and Inorganic Chemistry': [
            'Write formulae and balanced equations for reactions',
            'Use the mole concept in calculations',
            'Demonstrate knowledge of atomic structure and electronic configuration',
            'Understand ionisation energies and periodic trends',
            'Demonstrate knowledge of chemical bonding: ionic, covalent, metallic',
            'Understand intermolecular forces and their effects',
            'Demonstrate knowledge of structure types and properties',
            'Use VSEPR theory to predict molecular shapes',
            'Calculate oxidation states and balance redox equations',
            'Demonstrate knowledge of Group VII elements and their reactions',
            'Carry out acid-base titrations'
          ],
          'AS 2: Further Physical and Inorganic Chemistry': [
            'Calculate empirical and molecular formulae',
            'Calculate percentage yield and atom economy',
            'Demonstrate knowledge of organic nomenclature and isomerism',
            'Understand alkane reactions and mechanisms',
            'Demonstrate knowledge of alkene reactions',
            'Understand halogenoalkane reactions and mechanisms',
            'Demonstrate knowledge of alcohol reactions',
            'Use infrared spectroscopy to identify functional groups',
            'Calculate enthalpy changes using Hess\'s Law',
            'Understand factors affecting rate of reaction',
            'Demonstrate knowledge of equilibrium and equilibrium constant',
            'Understand Group II elements and their compounds'
          ]
        },
        a2_units: {
          'A2 1: Further Physical and Organic Chemistry': [
            'Calculate lattice enthalpy using Born-Haber cycles',
            'Understand entropy and free energy changes',
            'Deduce rate equations from experimental data',
            'Calculate equilibrium concentrations and Kc values',
            'Use Brønsted-Lowry theory and calculate pH',
            'Understand buffer solutions',
            'Demonstrate knowledge of optical isomerism',
            'Understand carbonyl compound reactions',
            'Demonstrate knowledge of carboxylic acids and derivatives',
            'Understand aromatic chemistry: benzene structure and reactions'
          ],
          'A2 2: Analytical, Transition Metals, Electrochemistry': [
            'Interpret mass spectra and NMR spectra',
            'Carry out redox titrations',
            'Use chromatography techniques',
            'Demonstrate knowledge of transition metal complexes',
            'Understand ligand replacement reactions',
            'Calculate standard electrode potentials',
            'Demonstrate knowledge of fuel cells',
            'Understand amine reactions and basicity',
            'Demonstrate knowledge of amino acids and proteins',
            'Understand condensation polymers'
          ]
        }
      },
      physics: {
        as_units: {
          'AS 1: Forces, Energy and Electricity': [
            'Distinguish between scalar and vector quantities',
            'Resolve vectors and calculate resultants',
            'Apply principle of moments',
            'Use equations of motion for uniform acceleration',
            'Understand projectile motion',
            'Apply Newton\'s laws of motion',
            'Understand momentum and impulse',
            'Calculate work done, potential energy and kinetic energy',
            'Apply principle of conservation of energy',
            'Understand current, charge, potential difference and EMF',
            'Calculate resistance in series and parallel circuits',
            'Understand resistivity and Ohm\'s law',
            'Demonstrate knowledge of internal resistance',
            'Understand potential divider circuits'
          ],
          'AS 2: Waves, Photons and Astronomy': [
            'Distinguish between transverse and longitudinal waves',
            'Understand polarisation of waves',
            'Apply Snell\'s law and understand total internal reflection',
            'Use lens equation for converging and diverging lenses',
            'Understand superposition and interference',
            'Demonstrate knowledge of diffraction',
            'Use photon energy equation',
            'Understand photoelectric effect',
            'Apply de Broglie equation',
            'Understand Doppler shift and Hubble\'s Law'
          ]
        },
        a2_units: {
          'A2 1: Deformation, Thermal Physics, Circular Motion, Oscillations': [
            'Apply Hooke\'s law and calculate Young modulus',
            'Use ideal gas equation',
            'Understand kinetic theory of gases',
            'Apply equations for uniform circular motion',
            'Understand simple harmonic motion',
            'Demonstrate knowledge of radioactive decay',
            'Calculate half-life and decay constant',
            'Understand nuclear fission and fusion',
            'Apply E = mc²'
          ],
          'A2 2: Fields, Capacitors and Particle Physics': [
            'Calculate gravitational field strength',
            'Apply Newton\'s law of universal gravitation',
            'Calculate electric field strength',
            'Apply Coulomb\'s law',
            'Understand capacitance and energy stored',
            'Demonstrate knowledge of capacitor discharge',
            'Understand magnetic flux and electromagnetic induction',
            'Apply Faraday\'s and Lenz\'s laws',
            'Understand transformer operation',
            'Demonstrate knowledge of fundamental particles and forces'
          ]
        }
      },
      mathematics: {
        as_units: {
          'AS 1: Pure Mathematics': [
            'Use laws of indices and manipulate surds',
            'Solve quadratic equations and use discriminant',
            'Solve simultaneous equations',
            'Solve linear and quadratic inequalities',
            'Work with polynomials and use remainder/factor theorems',
            'Understand transformations of graphs',
            'Use equation of straight line',
            'Work with circle equations',
            'Use binomial expansion for positive integer n',
            'Apply trigonometric identities and solve equations',
            'Use exponential and logarithmic functions',
            'Differentiate and find gradients, maxima and minima',
            'Integrate to find areas',
            'Work with vectors in 2D'
          ],
          'AS 2: Applied Mathematics': [
            'Understand kinematics and use equations of motion',
            'Apply Newton\'s laws to solve problems',
            'Understand friction and equilibrium',
            'Use statistical sampling techniques',
            'Present and interpret statistical data',
            'Calculate correlation coefficient',
            'Understand binomial distribution'
          ]
        },
        a2_units: {
          'A2 1: Pure Mathematics': [
            'Work with rational expressions and partial fractions',
            'Understand composite and inverse functions',
            'Work with modulus function',
            'Use parametric equations',
            'Work with sequences and series',
            'Use binomial expansion for rational n',
            'Work with trigonometric functions and identities',
            'Differentiate exponential, logarithmic and trigonometric functions',
            'Use quotient and product rules',
            'Differentiate implicitly and parametrically',
            'Integrate using substitution and by parts',
            'Solve first order differential equations',
            'Use numerical methods to solve equations'
          ],
          'A2 2: Applied Mathematics': [
            'Use calculus in kinematics',
            'Solve projectile motion problems',
            'Use moments in static contexts',
            'Apply impulse and momentum principles',
            'Understand conditional probability',
            'Work with normal distribution',
            'Conduct statistical hypothesis testing'
          ]
        }
      }
    };

    const results = {
      updated: 0,
      errors: []
    };

    // Get all A-level courses
    const courses = await base44.asServiceRole.entities.Course.filter({
      qualification_type: 'alevel'
    }, '-created_date', 1000);

    for (const course of courses) {
      try {
        const category = course.category;
        const stage = course.alevel_stage; // 'as', 'a2', or 'full'
        
        let objectives = [];
        
        // Map course categories to specification subjects
        const subjectMap = {
          'biology': 'biology',
          'chemistry': 'chemistry',
          'physics': 'physics',
          'mathematics': 'mathematics',
          'further_mathematics': 'mathematics' // Use same objectives
        };
        
        const specSubject = subjectMap[category];
        
        if (specSubject && aLevelObjectives[specSubject]) {
          const subjectData = aLevelObjectives[specSubject];
          
          if (stage === 'as') {
            // Get all AS unit objectives
            objectives = Object.values(subjectData.as_units || {}).flat();
          } else if (stage === 'a2') {
            // Get all A2 unit objectives
            objectives = Object.values(subjectData.a2_units || {}).flat();
          } else if (stage === 'full') {
            // Get both AS and A2 objectives
            objectives = [
              ...Object.values(subjectData.as_units || {}).flat(),
              ...Object.values(subjectData.a2_units || {}).flat()
            ];
          }
        }

        if (objectives.length > 0) {
          // Get all lessons for this course
          const lessons = await base44.asServiceRole.entities.Lesson.filter({
            course_id: course.id
          }, 'order', 1000);

          // Distribute objectives across lessons
          const objectivesPerLesson = Math.ceil(objectives.length / (lessons.length || 1));
          
          for (let i = 0; i < lessons.length; i++) {
            const lesson = lessons[i];
            const startIdx = i * objectivesPerLesson;
            const lessonObjectives = objectives.slice(startIdx, startIdx + objectivesPerLesson);
            
            if (lessonObjectives.length > 0) {
              await base44.asServiceRole.entities.Lesson.update(lesson.id, {
                learning_objectives: lessonObjectives
              });
              results.updated++;
            }
          }
        }
      } catch (error) {
        results.errors.push({
          course_id: course.id,
          title: course.title,
          error: error.message
        });
      }
    }

    return Response.json({
      success: true,
      message: `Updated ${results.updated} A-level lessons with CCEA learning objectives`,
      results
    });

  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});