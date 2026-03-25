import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const courseDefinitions = [
      { category: 'mathematics', title: 'A-Level Mathematics', stages: ['as', 'a2'] },
      { category: 'further_mathematics', title: 'A-Level Further Mathematics', stages: ['as', 'a2'] },
      { category: 'english_language', title: 'A-Level English Language', stages: ['as', 'a2'] },
      { category: 'life_health_sciences', title: 'A-Level Life and Health Sciences', stages: ['as', 'a2'] },
      { category: 'environmental_technology', title: 'A-Level Environmental Technology', stages: ['as', 'a2'] }
    ];

    const results = [];

    for (const def of courseDefinitions) {
      for (const stage of def.stages) {
        try {
          // Check if course exists
          let courses = await base44.asServiceRole.entities.Course.filter({
            category: def.category,
            qualification_type: 'alevel',
            alevel_stage: stage
          });

          let course;
          if (courses.length === 0) {
            // Create the course
            course = await base44.asServiceRole.entities.Course.create({
              title: `${def.title} ${stage.toUpperCase()}`,
              description: `CCEA ${def.title} ${stage.toUpperCase()} - Complete curriculum from CCEA specification`,
              category: def.category,
              qualification_type: 'alevel',
              alevel_stage: stage,
              instructor: 'DYNI Academic Team',
              instructor_avatar: 'https://ui-avatars.com/api/?name=DYNI&background=2563eb&color=fff',
              thumbnail: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800',
              level: 'advanced',
              price: 0,
              is_featured: true,
              exam_board: 'CCEA',
              duration_hours: stage === 'as' ? 120 : 180
            });
          } else {
            course = courses[0];
          }

          // Get lesson data
          const lessons = getLessonData(def.category, stage);
          
          if (!lessons || lessons.length === 0) {
            results.push({ course: course.title, status: 'no lesson data' });
            continue;
          }

          // Delete existing lessons
          const existing = await base44.entities.Lesson.filter({ course_id: course.id });
          if (existing.length > 0) {
            await Promise.all(existing.map(l => base44.asServiceRole.entities.Lesson.delete(l.id)));
          }

          // Create lessons
          await base44.entities.Lesson.bulkCreate(lessons.map(l => ({
            course_id: course.id,
            title: l.t,
            description: l.d,
            section: l.s,
            order: l.o,
            learning_objectives: l.obj || [],
            content_type: 'richtext',
            slides: [],
            is_preview: l.o <= 3,
            duration_minutes: 45
          })));

          // Update course
          await base44.asServiceRole.entities.Course.update(course.id, {
            total_lessons: lessons.length
          });

          results.push({ course: course.title, lessons: lessons.length, status: 'success' });
          
          await new Promise(r => setTimeout(r, 3000));

        } catch (error) {
          results.push({ course: `${def.title} ${stage}`, status: 'error', error: error.message });
        }
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getLessonData(category, stage) {
  const key = `${category}_${stage}`;
  
  const lessonMap = {
    mathematics_as: getMathematicsAS(),
    mathematics_a2: getMathematicsA2(),
    further_mathematics_as: getFurtherMathematicsAS(),
    further_mathematics_a2: getFurtherMathematicsA2(),
    english_language_as: getEnglishLanguageAS(),
    english_language_a2: getEnglishLanguageA2(),
    life_health_sciences_as: getLifeHealthSciencesAS(),
    life_health_sciences_a2: getLifeHealthSciencesA2(),
    environmental_technology_as: getEnvironmentalTechnologyAS(),
    environmental_technology_a2: getEnvironmentalTechnologyA2()
  };
  
  return lessonMap[key] || [];
}

function getMathematicsAS() {
  let o = 1;
  return [
    { s: 'AS1: Pure Maths', o: o++, t: 'Algebra Fundamentals', d: 'Algebraic manipulation and simplification', obj: ['Expand and factorize expressions', 'Solve linear and simultaneous equations', 'Manipulate algebraic fractions'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Quadratic Equations', d: 'Solving and graphing quadratics', obj: ['Solve quadratic equations by factorization', 'Complete the square', 'Use quadratic formula and discriminant'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Inequalities', d: 'Linear and quadratic inequalities', obj: ['Solve linear inequalities', 'Solve quadratic inequalities', 'Represent solutions on number line'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Indices and Surds', d: 'Laws of indices and surd manipulation', obj: ['Apply laws of indices', 'Rationalize denominators', 'Simplify surd expressions'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Coordinate Geometry Lines', d: 'Straight line equations', obj: ['Find equation of straight line', 'Calculate distance between points', 'Find midpoint and gradients'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Coordinate Geometry Circles', d: 'Circle equations', obj: ['Find equation of circle', 'Identify center and radius', 'Solve circle problems'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Functions', d: 'Function notation and operations', obj: ['Use function notation', 'Find domain and range', 'Compose and invert functions'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Transformations of Functions', d: 'Graph transformations', obj: ['Apply translations', 'Apply stretches and reflections', 'Combine transformations'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Differentiation Introduction', d: 'Basic calculus concepts', obj: ['Differentiate polynomials', 'Find gradients of curves', 'Find equations of tangents and normals'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Applications of Differentiation', d: 'Stationary points and optimization', obj: ['Find stationary points', 'Classify maximum and minimum', 'Solve optimization problems'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Integration Introduction', d: 'Basic integration', obj: ['Integrate polynomials', 'Understand integration as reverse differentiation', 'Find constant of integration'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Definite Integration', d: 'Areas under curves', obj: ['Evaluate definite integrals', 'Find areas under curves', 'Find areas between curves'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Trigonometry Basics', d: 'Trigonometric ratios and identities', obj: ['Use sine cosine tangent', 'Apply Pythagorean identity', 'Solve right-angled triangles'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Trigonometric Functions', d: 'Graphs and equations', obj: ['Sketch trigonometric graphs', 'Solve trigonometric equations', 'Apply sine and cosine rules'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Sequences', d: 'Arithmetic and geometric sequences', obj: ['Find nth term of sequences', 'Identify arithmetic and geometric progressions', 'Use recurrence relations'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Series', d: 'Arithmetic and geometric series', obj: ['Sum arithmetic series', 'Sum geometric series', 'Apply series formulae'] },
    
    { s: 'AS2: Statistics', o: o++, t: 'Data Representation', d: 'Statistical diagrams', obj: ['Draw histograms and cumulative frequency', 'Interpret box plots', 'Create scatter diagrams'] },
    { s: 'AS2: Statistics', o: o++, t: 'Measures of Location', d: 'Mean median mode', obj: ['Calculate mean median mode', 'Compare measures of location', 'Interpret data sets'] },
    { s: 'AS2: Statistics', o: o++, t: 'Measures of Spread', d: 'Range and standard deviation', obj: ['Calculate range and interquartile range', 'Find variance and standard deviation', 'Interpret spread measures'] },
    { s: 'AS2: Statistics', o: o++, t: 'Probability Basics', d: 'Probability theory', obj: ['Calculate probabilities', 'Use probability laws', 'Apply conditional probability'] },
    { s: 'AS2: Statistics', o: o++, t: 'Probability Tree Diagrams', d: 'Complex probability problems', obj: ['Draw tree diagrams', 'Calculate combined probabilities', 'Solve multi-stage problems'] },
    { s: 'AS2: Statistics', o: o++, t: 'Binomial Distribution', d: 'Discrete probability distribution', obj: ['Identify binomial situations', 'Calculate binomial probabilities', 'Find mean and variance'] },
    { s: 'AS2: Statistics', o: o++, t: 'Normal Distribution', d: 'Continuous probability distribution', obj: ['Use normal distribution tables', 'Standardize normal variables', 'Solve normal distribution problems'] },
    
    { s: 'AS2: Mechanics', o: o++, t: 'Kinematics Equations', d: 'Motion in straight line', obj: ['Use suvat equations', 'Solve constant acceleration problems', 'Interpret motion graphs'] },
    { s: 'AS2: Mechanics', o: o++, t: 'Velocity-Time Graphs', d: 'Graphical representation of motion', obj: ['Draw velocity-time graphs', 'Find displacement from graphs', 'Calculate acceleration'] },
    { s: 'AS2: Mechanics', o: o++, t: 'Forces and Newton Laws', d: 'Force and motion', obj: ['Apply Newton first second third laws', 'Calculate resultant forces', 'Solve force problems'] },
    { s: 'AS2: Mechanics', o: o++, t: 'Resolving Forces', d: 'Force components', obj: ['Resolve forces into components', 'Find resultant force', 'Apply equilibrium conditions'] },
    { s: 'AS2: Mechanics', o: o++, t: 'Friction', d: 'Frictional forces', obj: ['Calculate friction force', 'Apply coefficient of friction', 'Solve friction problems'] }
  ];
}

function getMathematicsA2() {
  let o = 1;
  return [
    { s: 'A2-1: Pure Maths', o: o++, t: 'Algebraic Division', d: 'Polynomial division', obj: ['Divide polynomials', 'Use factor theorem', 'Apply remainder theorem'] },
    { s: 'A2-1: Pure Maths', o: o++, t: 'Partial Fractions', d: 'Decomposing algebraic fractions', obj: ['Split proper fractions', 'Split improper fractions', 'Apply partial fractions to integration'] },
    { s: 'A2-1: Pure Maths', o: o++, t: 'Exponential Functions', d: 'Exponential growth and decay', obj: ['Sketch exponential graphs', 'Solve exponential equations', 'Model with exponentials'] },
    { s: 'A2-1: Pure Maths', o: o++, t: 'Logarithms', d: 'Logarithmic functions', obj: ['Apply logarithm laws', 'Solve logarithmic equations', 'Convert between exponential and log form'] },
    { s: 'A2-1: Pure Maths', o: o++, t: 'Trigonometric Identities', d: 'Advanced trigonometry', obj: ['Prove trigonometric identities', 'Apply compound angle formulae', 'Use double angle formulae'] },
    { s: 'A2-1: Pure Maths', o: o++, t: 'Product Rule', d: 'Differentiation of products', obj: ['Apply product rule', 'Differentiate products of functions', 'Solve product rule problems'] },
    { s: 'A2-1: Pure Maths', o: o++, t: 'Quotient Rule', d: 'Differentiation of quotients', obj: ['Apply quotient rule', 'Differentiate quotients of functions', 'Solve quotient rule problems'] },
    { s: 'A2-1: Pure Maths', o: o++, t: 'Chain Rule', d: 'Differentiation of composite functions', obj: ['Apply chain rule', 'Differentiate composite functions', 'Combine differentiation rules'] },
    { s: 'A2-1: Pure Maths', o: o++, t: 'Integration by Substitution', d: 'Advanced integration technique', obj: ['Apply substitution method', 'Choose appropriate substitution', 'Evaluate integrals'] },
    { s: 'A2-1: Pure Maths', o: o++, t: 'Integration by Parts', d: 'Integration technique for products', obj: ['Apply integration by parts', 'Choose u and dv correctly', 'Solve integration problems'] },
    { s: 'A2-1: Pure Maths', o: o++, t: 'Differential Equations', d: 'First order differential equations', obj: ['Solve separable differential equations', 'Find particular solutions', 'Model with differential equations'] },
    { s: 'A2-1: Pure Maths', o: o++, t: 'Parametric Equations', d: 'Curves in parametric form', obj: ['Convert between parametric and Cartesian', 'Differentiate parametric equations', 'Find areas of parametric curves'] },
    { s: 'A2-1: Pure Maths', o: o++, t: 'Vectors 2D', d: 'Two-dimensional vectors', obj: ['Add and subtract vectors', 'Calculate magnitude and direction', 'Find scalar product'] },
    { s: 'A2-1: Pure Maths', o: o++, t: 'Vectors 3D', d: 'Three-dimensional vectors', obj: ['Work with 3D vectors', 'Find vector equations of lines', 'Calculate angles between vectors'] },
    
    { s: 'A2-2: Statistics', o: o++, t: 'Hypothesis Testing Introduction', d: 'Statistical testing concepts', obj: ['Understand null and alternative hypotheses', 'Define significance levels', 'Interpret p-values'] },
    { s: 'A2-2: Statistics', o: o++, t: 'Hypothesis Tests for Mean', d: 'Testing population means', obj: ['Conduct one-tailed tests', 'Conduct two-tailed tests', 'Make conclusions'] },
    { s: 'A2-2: Statistics', o: o++, t: 'Correlation', d: 'Measuring linear association', obj: ['Calculate correlation coefficient', 'Test for correlation', 'Interpret correlation strength'] },
    { s: 'A2-2: Statistics', o: o++, t: 'Regression', d: 'Linear regression analysis', obj: ['Find regression line equation', 'Make predictions', 'Assess regression accuracy'] },
    
    { s: 'A2-2: Mechanics', o: o++, t: 'Projectiles', d: 'Projectile motion', obj: ['Model projectile motion', 'Find range time of flight maximum height', 'Solve projectile problems'] },
    { s: 'A2-2: Mechanics', o: o++, t: 'Circular Motion', d: 'Motion in circles', obj: ['Apply circular motion formulae', 'Calculate angular velocity', 'Solve circular motion problems'] },
    { s: 'A2-2: Mechanics', o: o++, t: 'Work Energy Power', d: 'Energy and work concepts', obj: ['Calculate work done', 'Apply conservation of energy', 'Calculate power'] }
  ];
}

function getFurtherMathematicsAS() {
  let o = 1;
  return [
    { s: 'AS1: Core Pure', o: o++, t: 'Complex Numbers Introduction', d: 'Imaginary and complex numbers', obj: ['Define complex numbers', 'Perform complex arithmetic', 'Represent complex numbers'] },
    { s: 'AS1: Core Pure', o: o++, t: 'Argand Diagrams', d: 'Graphical representation', obj: ['Plot complex numbers on Argand diagrams', 'Find modulus and argument', 'Represent complex operations geometrically'] },
    { s: 'AS1: Core Pure', o: o++, t: 'Matrix Operations', d: 'Matrix arithmetic', obj: ['Add and subtract matrices', 'Multiply matrices', 'Find matrix inverses'] },
    { s: 'AS1: Core Pure', o: o++, t: 'Determinants', d: 'Matrix determinants', obj: ['Calculate 2x2 and 3x3 determinants', 'Understand singular matrices', 'Apply determinants to solve equations'] },
    { s: 'AS1: Core Pure', o: o++, t: 'Proof by Induction', d: 'Mathematical proof technique', obj: ['Understand induction process', 'Prove series formulae', 'Prove divisibility statements'] },
    { s: 'AS1: Core Pure', o: o++, t: 'Series', d: 'Method of differences', obj: ['Apply method of differences', 'Sum series', 'Simplify series expressions'] },
    
    { s: 'AS2: Further Pure', o: o++, t: 'Roots of Polynomials', d: 'Polynomial theory', obj: ['Apply relationships between roots and coefficients', 'Form equations from roots', 'Solve polynomial problems'] },
    { s: 'AS2: Further Pure', o: o++, t: 'Polar Coordinates Introduction', d: 'Polar coordinate system', obj: ['Convert between Cartesian and polar', 'Plot points in polar form', 'Sketch polar curves'] },
    { s: 'AS2: Further Pure', o: o++, t: 'Hyperbolic Functions', d: 'Sinh cosh tanh', obj: ['Define hyperbolic functions', 'Apply hyperbolic identities', 'Differentiate hyperbolic functions'] }
  ];
}

function getFurtherMathematicsA2() {
  let o = 1;
  return [
    { s: 'A2-1: Core Pure', o: o++, t: 'Complex Loci', d: 'Regions in Argand plane', obj: ['Sketch complex loci', 'Identify regions', 'Solve loci problems'] },
    { s: 'A2-1: Core Pure', o: o++, t: 'De Moivre Theorem', d: 'Complex number powers', obj: ['Apply De Moivre theorem', 'Find complex roots', 'Solve complex equations'] },
    { s: 'A2-1: Core Pure', o: o++, t: 'First Order Differential Equations', d: 'Solving DEs', obj: ['Solve first order linear DEs', 'Solve separable DEs', 'Apply integrating factors'] },
    { s: 'A2-1: Core Pure', o: o++, t: 'Second Order Differential Equations', d: 'Homogeneous DEs', obj: ['Solve second order homogeneous DEs', 'Find auxiliary equations', 'Apply boundary conditions'] },
    { s: 'A2-1: Core Pure', o: o++, t: 'Maclaurin Series', d: 'Series expansions', obj: ['Find Maclaurin series', 'Apply standard expansions', 'Combine series'] }
  ];
}

function getEnglishLanguageAS() {
  let o = 1;
  return [
    { s: 'AS1: Language Study', o: o++, t: 'Language Frameworks', d: 'Analyzing language structure', obj: ['Apply lexical analysis', 'Examine grammatical patterns', 'Analyze phonological features'] },
    { s: 'AS1: Language Study', o: o++, t: 'Language Variation Regional', d: 'Regional dialects and accents', obj: ['Identify regional dialect features', 'Analyze accent variation', 'Understand geographical influences'] },
    { s: 'AS1: Language Study', o: o++, t: 'Language Variation Social', d: 'Social factors in language', obj: ['Analyze sociolect features', 'Examine class-based variation', 'Understand social influences'] },
    { s: 'AS1: Language Study', o: o++, t: 'Spoken Language Features', d: 'Characteristics of speech', obj: ['Identify spoken language features', 'Analyze conversation structure', 'Understand pragmatics'] },
    
    { s: 'AS2: Language Issues', o: o++, t: 'Language Change Historical', d: 'Evolution of English', obj: ['Trace English language development', 'Analyze Old Middle Modern English', 'Understand semantic change processes'] },
    { s: 'AS2: Language Issues', o: o++, t: 'Language Change Contemporary', d: 'Modern language changes', obj: ['Identify current language changes', 'Analyze technology influence', 'Examine neologism formation'] },
    { s: 'AS2: Language Issues', o: o++, t: 'Language and Gender', d: 'Gender in language use', obj: ['Analyze gender differences in language', 'Examine deficit dominance difference models', 'Understand gender representation'] },
    { s: 'AS2: Language Issues', o: o++, t: 'Language and Power', d: 'Power in discourse', obj: ['Analyze power relations in language', 'Examine political and media discourse', 'Understand persuasion techniques'] }
  ];
}

function getEnglishLanguageA2() {
  let o = 1;
  return [
    { s: 'A2-1: Investigation', o: o++, t: 'Designing Language Research', d: 'Research methodology', obj: ['Formulate research questions', 'Design data collection', 'Plan analysis approach'] },
    { s: 'A2-1: Investigation', o: o++, t: 'Analyzing Language Data', d: 'Data analysis techniques', obj: ['Apply linguistic frameworks', 'Analyze qualitative data', 'Present findings effectively'] },
    
    { s: 'A2-2: Production', o: o++, t: 'Original Writing', d: 'Creative language production', obj: ['Produce original texts', 'Apply stylistic techniques', 'Demonstrate language awareness'] },
    { s: 'A2-2: Production', o: o++, t: 'Language Commentary', d: 'Reflective analysis', obj: ['Write analytical commentary', 'Reflect on linguistic choices', 'Justify creative decisions'] }
  ];
}

function getLifeHealthSciencesAS() {
  let o = 1;
  return [
    { s: 'AS1: Human Biology', o: o++, t: 'Cell Biology', d: 'Cell structure and function', obj: ['Describe cell organelles', 'Explain cell processes', 'Understand tissue types'] },
    { s: 'AS1: Human Biology', o: o++, t: 'Cardiovascular System', d: 'Heart and circulation', obj: ['Describe heart structure function', 'Explain blood circulation pathway', 'Understand cardiovascular diseases'] },
    { s: 'AS1: Human Biology', o: o++, t: 'Respiratory System', d: 'Breathing and gas exchange', obj: ['Describe respiratory structures', 'Explain ventilation mechanism', 'Understand gas exchange process'] },
    { s: 'AS1: Human Biology', o: o++, t: 'Digestive System', d: 'Nutrition and digestion', obj: ['Describe digestive organs', 'Explain enzyme action', 'Understand nutrient absorption'] },
    
    { s: 'AS2: Health', o: o++, t: 'Diet and Nutrition', d: 'Nutritional requirements', obj: ['Explain balanced diet components', 'Assess nutritional needs', 'Understand dietary disorders'] },
    { s: 'AS2: Health', o: o++, t: 'Disease and Immunity', d: 'Infectious diseases', obj: ['Identify pathogens', 'Explain immune response', 'Understand vaccination'] },
    { s: 'AS2: Health', o: o++, t: 'Lifestyle and Health', d: 'Health risk factors', obj: ['Assess lifestyle impacts', 'Understand disease prevention', 'Evaluate health interventions'] }
  ];
}

function getLifeHealthSciencesA2() {
  let o = 1;
  return [
    { s: 'A2-1: Body Systems', o: o++, t: 'Nervous System', d: 'Neural control', obj: ['Describe nervous system organization', 'Explain nerve impulse transmission', 'Understand reflex actions'] },
    { s: 'A2-1: Body Systems', o: o++, t: 'Endocrine System', d: 'Hormonal control', obj: ['Describe endocrine glands', 'Explain hormone action', 'Understand feedback mechanisms'] },
    { s: 'A2-1: Body Systems', o: o++, t: 'Renal System', d: 'Kidney function', obj: ['Describe kidney structure', 'Explain urine formation', 'Understand osmoregulation'] },
    
    { s: 'A2-2: Contemporary Health', o: o++, t: 'Genetic Disease', d: 'Inherited disorders', obj: ['Explain genetic inheritance', 'Describe genetic disorders', 'Assess genetic screening'] },
    { s: 'A2-2: Contemporary Health', o: o++, t: 'Cancer', d: 'Cancer biology', obj: ['Explain tumor development', 'Identify risk factors', 'Assess treatment options'] },
    { s: 'A2-2: Contemporary Health', o: o++, t: 'Mental Health', d: 'Psychological wellbeing', obj: ['Understand mental health conditions', 'Identify causes', 'Assess support strategies'] }
  ];
}

function getEnvironmentalTechnologyAS() {
  let o = 1;
  return [
    { s: 'AS1: Environmental Science', o: o++, t: 'Ecosystems and Energy Flow', d: 'Ecosystem dynamics', obj: ['Describe ecosystem structure', 'Explain energy transfer through trophic levels', 'Understand nutrient cycling'] },
    { s: 'AS1: Environmental Science', o: o++, t: 'Biodiversity', d: 'Species diversity and importance', obj: ['Measure biodiversity', 'Assess conservation value', 'Understand threats to biodiversity'] },
    { s: 'AS1: Environmental Science', o: o++, t: 'Pollution Types', d: 'Environmental pollutants', obj: ['Identify air water soil pollution', 'Assess pollution sources', 'Understand pollution impacts'] },
    { s: 'AS1: Environmental Science', o: o++, t: 'Climate Change', d: 'Global warming and impacts', obj: ['Explain greenhouse effect enhanced', 'Assess climate change evidence', 'Understand mitigation adaptation'] },
    
    { s: 'AS2: Environmental Management', o: o++, t: 'Waste Management', d: 'Waste reduction recycling disposal', obj: ['Classify waste types', 'Assess disposal methods landfill incineration', 'Evaluate recycling effectiveness'] },
    { s: 'AS2: Environmental Management', o: o++, t: 'Energy Resources', d: 'Renewable and non-renewable energy', obj: ['Compare fossil fuels renewables nuclear', 'Assess sustainability of energy sources', 'Understand energy efficiency measures'] },
    { s: 'AS2: Environmental Management', o: o++, t: 'Water Management', d: 'Water supply treatment conservation', obj: ['Explain water cycle and supply', 'Describe water treatment processes', 'Assess water conservation strategies'] }
  ];
}

function getEnvironmentalTechnologyA2() {
  let o = 1;
  return [
    { s: 'A2-1: Environmental Issues', o: o++, t: 'Deforestation', d: 'Forest loss and impacts', obj: ['Identify causes of deforestation', 'Assess environmental biodiversity impacts', 'Evaluate sustainable forestry practices'] },
    { s: 'A2-1: Environmental Issues', o: o++, t: 'Agriculture and Environment', d: 'Agricultural impacts', obj: ['Assess intensive farming impacts', 'Explain agricultural pollution', 'Understand organic sustainable farming'] },
    { s: 'A2-1: Environmental Issues', o: o++, t: 'Urban Sustainability', d: 'Sustainable cities', obj: ['Identify urban environmental challenges', 'Assess green infrastructure', 'Understand sustainable urban planning'] },
    
    { s: 'A2-2: Environmental Technology', o: o++, t: 'Environmental Monitoring', d: 'Measurement and assessment', obj: ['Use environmental monitoring equipment', 'Collect and analyze environmental data', 'Interpret data trends and patterns'] },
    { s: 'A2-2: Environmental Technology', o: o++, t: 'Environmental Impact Assessment', d: 'Project impact evaluation', obj: ['Conduct environmental surveys', 'Assess development project impacts', 'Recommend mitigation measures'] }
  ];
}