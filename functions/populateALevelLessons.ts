import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { courseId } = await req.json();

    // Comprehensive A-Level lesson structures
    const aLevelLessonStructures = {
      // FURTHER MATHEMATICS AS
      'further_mathematics_as': [
        // Unit AS 1: Pure Mathematics (20 lessons)
        { section: 'Unit AS 1: Pure Mathematics - Complex Numbers', title: 'Introduction to Complex Numbers', objectives: ['Define complex numbers in the form a + bi', 'Understand the imaginary unit i', 'Identify real and imaginary parts'], order: 1 },
        { section: 'Unit AS 1: Pure Mathematics - Complex Numbers', title: 'Operations with Complex Numbers', objectives: ['Add and subtract complex numbers', 'Multiply complex numbers', 'Understand properties of complex arithmetic'], order: 2 },
        { section: 'Unit AS 1: Pure Mathematics - Complex Numbers', title: 'Complex Conjugates and Division', objectives: ['Find complex conjugates', 'Divide complex numbers', 'Rationalize denominators'], order: 3 },
        { section: 'Unit AS 1: Pure Mathematics - Complex Numbers', title: 'Argand Diagrams', objectives: ['Represent complex numbers on Argand diagram', 'Plot complex number operations geometrically', 'Understand geometric interpretation'], order: 4 },
        { section: 'Unit AS 1: Pure Mathematics - Complex Numbers', title: 'Modulus and Argument', objectives: ['Calculate modulus of complex numbers', 'Find argument of complex numbers', 'Express in polar form'], order: 5 },
        { section: 'Unit AS 1: Pure Mathematics - Complex Numbers', title: 'Solving Equations with Complex Roots', objectives: ['Solve quadratic equations with complex roots', 'Use complex conjugate root theorem', 'Form equations from given roots'], order: 6 },
        
        { section: 'Unit AS 1: Pure Mathematics - Matrices', title: 'Introduction to Matrices', objectives: ['Define matrices and matrix notation', 'Identify order and elements of matrices', 'Understand types of matrices'], order: 7 },
        { section: 'Unit AS 1: Pure Mathematics - Matrices', title: 'Matrix Addition and Subtraction', objectives: ['Add and subtract matrices', 'Multiply matrices by scalars', 'Understand zero and identity matrices'], order: 8 },
        { section: 'Unit AS 1: Pure Mathematics - Matrices', title: 'Matrix Multiplication', objectives: ['Multiply matrices up to 3×3', 'Understand matrix multiplication rules', 'Apply non-commutative property'], order: 9 },
        { section: 'Unit AS 1: Pure Mathematics - Matrices', title: 'Determinants', objectives: ['Calculate determinants of 2×2 matrices', 'Calculate determinants of 3×3 matrices', 'Understand properties of determinants'], order: 10 },
        { section: 'Unit AS 1: Pure Mathematics - Matrices', title: 'Matrix Inverses', objectives: ['Find inverses of 2×2 matrices', 'Find inverses of 3×3 matrices', 'Understand when inverses exist'], order: 11 },
        { section: 'Unit AS 1: Pure Mathematics - Matrices', title: 'Solving Linear Equations', objectives: ['Use matrices to solve simultaneous equations', 'Apply matrix methods to 3 variables', 'Interpret solutions geometrically'], order: 12 },
        
        { section: 'Unit AS 1: Pure Mathematics - Series', title: 'Summation Notation', objectives: ['Understand sigma notation', 'Evaluate finite series', 'Manipulate summation expressions'], order: 13 },
        { section: 'Unit AS 1: Pure Mathematics - Series', title: 'Standard Series Results', objectives: ['Use formulae for sum of natural numbers', 'Apply formulae for sum of squares', 'Calculate sum of cubes'], order: 14 },
        { section: 'Unit AS 1: Pure Mathematics - Series', title: 'Method of Differences', objectives: ['Recognize series suitable for method of differences', 'Apply method of differences technique', 'Simplify telescoping series'], order: 15 },
        { section: 'Unit AS 1: Pure Mathematics - Series', title: 'Proof by Induction - Introduction', objectives: ['Understand principle of mathematical induction', 'Apply base case verification', 'State inductive hypothesis'], order: 16 },
        { section: 'Unit AS 1: Pure Mathematics - Series', title: 'Proof by Induction - Series', objectives: ['Prove series formulae by induction', 'Complete inductive step', 'Write formal proofs'], order: 17 },
        { section: 'Unit AS 1: Pure Mathematics - Series', title: 'Proof by Induction - Divisibility', objectives: ['Prove divisibility results', 'Apply induction to number theory', 'Verify divisibility claims'], order: 18 },
        
        // Unit AS 2: Applied Mathematics (15 lessons)
        { section: 'Unit AS 2: Mechanics', title: "Hooke's Law", objectives: ["Apply Hooke's Law to springs", 'Calculate elastic potential energy', 'Solve problems with multiple springs'], order: 19 },
        { section: 'Unit AS 2: Mechanics', title: 'Work and Energy', objectives: ['Calculate work done by variable forces', 'Apply work-energy principle', 'Solve energy conservation problems'], order: 20 },
        { section: 'Unit AS 2: Mechanics', title: 'Power', objectives: ['Calculate power in mechanical systems', 'Relate power to work and time', 'Apply power formulae to vehicles'], order: 21 },
        { section: 'Unit AS 2: Mechanics', title: 'Impulse and Momentum', objectives: ['Define impulse and momentum', 'Apply impulse-momentum theorem', 'Calculate impact forces'], order: 22 },
        { section: 'Unit AS 2: Mechanics', title: 'Conservation of Momentum', objectives: ['Apply conservation of linear momentum', 'Solve collision problems', 'Analyze explosions and separations'], order: 23 },
        
        { section: 'Unit AS 2: Statistics', title: 'Discrete Probability Distributions', objectives: ['Define discrete random variables', 'Calculate expectation and variance', 'Work with probability mass functions'], order: 24 },
        { section: 'Unit AS 2: Statistics', title: 'Binomial Distribution', objectives: ['Identify binomial situations', 'Calculate binomial probabilities', 'Find mean and variance'], order: 25 },
        { section: 'Unit AS 2: Statistics', title: 'Poisson Distribution', objectives: ['Understand Poisson model', 'Calculate Poisson probabilities', 'Apply to real-world scenarios'], order: 26 },
        { section: 'Unit AS 2: Statistics', title: 'Normal Distribution', objectives: ['Use standard normal distribution', 'Apply normal approximation to binomial', 'Check continuity correction'], order: 27 },
        { section: 'Unit AS 2: Statistics', title: 'Normal Approximation to Poisson', objectives: ['Apply normal approximation to Poisson', 'Determine when approximation is valid', 'Solve practical problems'], order: 28 },
        
        { section: 'Unit AS 2: Discrete Mathematics', title: 'Graph Theory Fundamentals', objectives: ['Define graphs, vertices and edges', 'Identify types of graphs', 'Determine degree sequences'], order: 29 },
        { section: 'Unit AS 2: Discrete Mathematics', title: 'Networks and Algorithms', objectives: ['Apply Dijkstra algorithm for shortest path', 'Use Floyd-Warshall algorithm', 'Solve route optimization problems'], order: 30 },
        { section: 'Unit AS 2: Discrete Mathematics', title: 'Minimum Spanning Trees', objectives: ["Apply Kruskal's algorithm", "Use Prim's algorithm", 'Find minimum connector problems'], order: 31 },
        { section: 'Unit AS 2: Discrete Mathematics', title: 'Chinese Postman Problem', objectives: ['Identify Eulerian graphs', 'Solve route inspection problems', 'Find minimum total weight'], order: 32 },
        { section: 'Unit AS 2: Discrete Mathematics', title: 'Travelling Salesman Problem', objectives: ['Apply nearest neighbour algorithm', 'Use minimum spanning tree method', 'Find upper and lower bounds'], order: 33 },
      ],
      
      // FURTHER MATHEMATICS A2
      'further_mathematics_a2': [
        // Unit A2 1: Pure Mathematics (25 lessons)
        { section: 'Unit A2 1: Calculus - Hyperbolic Functions', title: 'Introduction to Hyperbolic Functions', objectives: ['Define sinh, cosh, tanh', 'Sketch hyperbolic function graphs', 'Understand relationship to exponentials'], order: 1 },
        { section: 'Unit A2 1: Calculus - Hyperbolic Functions', title: 'Hyperbolic Identities', objectives: ['Prove and use $\\cosh^2 x - \\sinh^2 x = 1$', 'Apply other hyperbolic identities', 'Derive new identities'], order: 2 },
        { section: 'Unit A2 1: Calculus - Hyperbolic Functions', title: 'Differentiation of Hyperbolic Functions', objectives: ['Differentiate sinh x, cosh x, tanh x', 'Apply chain rule to hyperbolic functions', 'Solve related rates problems'], order: 3 },
        { section: 'Unit A2 1: Calculus - Hyperbolic Functions', title: 'Integration of Hyperbolic Functions', objectives: ['Integrate hyperbolic functions', 'Use hyperbolic substitution', 'Evaluate definite integrals'], order: 4 },
        { section: 'Unit A2 1: Calculus - Hyperbolic Functions', title: 'Inverse Hyperbolic Functions', objectives: ['Define and graph inverse hyperbolic functions', 'Express in logarithmic form', 'Differentiate and integrate'], order: 5 },
        
        { section: 'Unit A2 1: Calculus - Differential Equations', title: 'First Order Differential Equations - Separable', objectives: ['Identify separable differential equations', 'Solve by separation of variables', 'Apply initial conditions'], order: 6 },
        { section: 'Unit A2 1: Calculus - Differential Equations', title: 'First Order - Integrating Factor', objectives: ['Recognize linear first order DEs', 'Find integrating factor', 'Solve using integrating factor method'], order: 7 },
        { section: 'Unit A2 1: Calculus - Differential Equations', title: 'Second Order Homogeneous', objectives: ['Solve second order homogeneous equations', 'Find auxiliary equation', 'Apply different root cases'], order: 8 },
        { section: 'Unit A2 1: Calculus - Differential Equations', title: 'Second Order Non-Homogeneous', objectives: ['Find complementary function', 'Determine particular integral', 'Write general solution'], order: 9 },
        { section: 'Unit A2 1: Calculus - Differential Equations', title: 'Applications of Differential Equations', objectives: ['Model real-world situations', 'Solve growth and decay problems', 'Apply to mechanics and physics'], order: 10 },
        
        { section: 'Unit A2 1: Vectors', title: 'Vectors in 3D Space', objectives: ['Represent vectors in 3D', 'Calculate magnitude and direction', 'Perform vector operations'], order: 11 },
        { section: 'Unit A2 1: Vectors', title: 'Scalar and Vector Products', objectives: ['Calculate dot product', 'Find cross product', 'Apply to angle and area problems'], order: 12 },
        { section: 'Unit A2 1: Vectors', title: 'Equation of a Line', objectives: ['Write vector equation of line', 'Convert to Cartesian form', 'Find intersection of lines'], order: 13 },
        { section: 'Unit A2 1: Vectors', title: 'Equation of a Plane', objectives: ['Write vector equation of plane', 'Use Cartesian equation', 'Find angle between planes'], order: 14 },
        { section: 'Unit A2 1: Vectors', title: 'Distances in 3D', objectives: ['Find distance from point to line', 'Calculate distance from point to plane', 'Determine shortest distance between lines'], order: 15 },
        
        { section: 'Unit A2 1: Complex Numbers', title: "De Moivre's Theorem - Introduction", objectives: ["State and prove De Moivre's theorem", 'Apply to integer powers', 'Use for trigonometric identities'], order: 16 },
        { section: 'Unit A2 1: Complex Numbers', title: "De Moivre's Theorem - Applications", objectives: ['Derive multiple angle formulae', 'Express $\\cos n\\theta$ in terms of $\\cos \\theta$', 'Solve trigonometric equations'], order: 17 },
        { section: 'Unit A2 1: Complex Numbers', title: 'Roots of Complex Numbers', objectives: ['Find nth roots of complex numbers', 'Represent roots on Argand diagram', 'Solve equations using roots of unity'], order: 18 },
        { section: 'Unit A2 1: Complex Numbers', title: 'Loci in the Argand Diagram', objectives: ['Sketch loci of complex equations', 'Identify circles and lines', 'Solve geometric problems'], order: 19 },
        
        { section: 'Unit A2 1: Polar Coordinates', title: 'Polar Coordinate System', objectives: ['Convert between Cartesian and polar', 'Plot points in polar coordinates', 'Understand polar notation'], order: 20 },
        { section: 'Unit A2 1: Polar Coordinates', title: 'Polar Curves', objectives: ['Sketch standard polar curves', 'Find tangents to polar curves', 'Analyze symmetry'], order: 21 },
        { section: 'Unit A2 1: Polar Coordinates', title: 'Areas in Polar Coordinates', objectives: ['Calculate areas using polar integration', 'Find areas of sectors', 'Apply to complex shapes'], order: 22 },
        
        // Unit A2 2: Applied Mathematics (20 lessons)
        { section: 'Unit A2 2: Advanced Mechanics', title: 'Circular Motion - Horizontal', objectives: ['Apply Newton\'s laws to circular motion', 'Calculate centripetal force', 'Solve horizontal circle problems'], order: 23 },
        { section: 'Unit A2 2: Advanced Mechanics', title: 'Circular Motion - Vertical', objectives: ['Analyze motion in vertical circles', 'Find tension in strings', 'Determine minimum speeds'], order: 24 },
        { section: 'Unit A2 2: Advanced Mechanics', title: 'Conical Pendulum', objectives: ['Model conical pendulum motion', 'Calculate angle and period', 'Solve practical applications'], order: 25 },
        { section: 'Unit A2 2: Advanced Mechanics', title: 'Relative Motion', objectives: ['Understand relative velocity', 'Solve interception problems', 'Apply to real-world scenarios'], order: 26 },
        { section: 'Unit A2 2: Advanced Mechanics', title: 'Elastic Collisions', objectives: ['Apply coefficient of restitution', 'Use Newton\'s law of restitution', 'Solve impact problems'], order: 27 },
        { section: 'Unit A2 2: Advanced Mechanics', title: 'Oblique Impacts', objectives: ['Resolve velocities in collisions', 'Apply conservation laws', 'Calculate final velocities'], order: 28 },
        
        { section: 'Unit A2 2: Advanced Statistics', title: 'Continuous Probability Distributions', objectives: ['Define continuous random variables', 'Work with probability density functions', 'Calculate probabilities'], order: 29 },
        { section: 'Unit A2 2: Advanced Statistics', title: 'Uniform Distribution', objectives: ['Understand uniform distribution', 'Calculate mean and variance', 'Solve problems'], order: 30 },
        { section: 'Unit A2 2: Advanced Statistics', title: 'Exponential Distribution', objectives: ['Apply exponential distribution', 'Use in waiting time problems', 'Calculate cumulative probabilities'], order: 31 },
        { section: 'Unit A2 2: Advanced Statistics', title: 'Point Estimation', objectives: ['Find unbiased estimators', 'Calculate method of moments estimators', 'Compare estimators'], order: 32 },
        { section: 'Unit A2 2: Advanced Statistics', title: 'Interval Estimation', objectives: ['Construct confidence intervals', 'Interpret confidence levels', 'Apply to different distributions'], order: 33 },
        { section: 'Unit A2 2: Advanced Statistics', title: 'Hypothesis Testing - Introduction', objectives: ['Understand null and alternative hypotheses', 'Define significance levels', 'Interpret p-values'], order: 34 },
        { section: 'Unit A2 2: Advanced Statistics', title: 'Hypothesis Testing - Applications', objectives: ['Test population mean', 'Test population proportion', 'Make statistical decisions'], order: 35 },
        
        { section: 'Unit A2 2: Advanced Discrete', title: 'Linear Programming - Formulation', objectives: ['Formulate linear programming problems', 'Define decision variables', 'Write constraints'], order: 36 },
        { section: 'Unit A2 2: Advanced Discrete', title: 'Linear Programming - Graphical Method', objectives: ['Graph feasible regions', 'Find optimal solutions', 'Interpret results'], order: 37 },
        { section: 'Unit A2 2: Advanced Discrete', title: 'Linear Programming - Simplex Method', objectives: ['Apply simplex algorithm', 'Use tableau method', 'Solve larger problems'], order: 38 },
        { section: 'Unit A2 2: Advanced Discrete', title: 'Critical Path Analysis', objectives: ['Draw activity networks', 'Find critical path', 'Calculate float times'], order: 39 },
        { section: 'Unit A2 2: Advanced Discrete', title: 'Matchings and Allocation', objectives: ['Apply bipartite graphs', 'Use Hungarian algorithm', 'Solve assignment problems'], order: 40 },
      ],

      // Add other A-level subjects with comprehensive lesson structures
      'biology_as': generateBiologyASLessons(),
      'biology_a2': generateBiologyA2Lessons(),
      'chemistry_as': generateChemistryASLessons(),
      'chemistry_a2': generateChemistryA2Lessons(),
      'physics_as': generatePhysicsASLessons(),
      'physics_a2': generatePhysicsA2Lessons(),
      'mathematics_as': generateMathematicsASLessons(),
      'mathematics_a2': generateMathematicsA2Lessons(),
    };

    // Get course and determine structure
    const courses = await base44.asServiceRole.entities.Course.filter({ id: courseId });
    const course = courses[0];
    
    if (!course) {
      return Response.json({ error: 'Course not found' }, { status: 404 });
    }

    // Determine lesson structure key
    const category = course.category;
    const stage = course.alevel_stage;
    const structureKey = `${category}_${stage}`;

    const lessonStructure = aLevelLessonStructures[structureKey];
    
    if (!lessonStructure) {
      return Response.json({ error: `No lesson structure found for ${structureKey}` }, { status: 400 });
    }

    // Delete existing lessons
    const existingLessons = await base44.asServiceRole.entities.Lesson.filter({ course_id: courseId });
    for (const lesson of existingLessons) {
      await base44.asServiceRole.entities.Lesson.delete(lesson.id);
    }

    // Create new lessons
    const createdLessons = [];
    for (const lesson of lessonStructure) {
      const created = await base44.asServiceRole.entities.Lesson.create({
        course_id: courseId,
        title: lesson.title,
        description: lesson.objectives.join('. '),
        section: lesson.section,
        order: lesson.order,
        learning_objectives: lesson.objectives,
        content_type: 'richtext',
        slides: [],
        is_preview: lesson.order === 1,
        duration_minutes: 45,
      });
      createdLessons.push(created);
    }

    return Response.json({
      success: true,
      course: course.title,
      lessonsCreated: createdLessons.length,
      sections: [...new Set(lessonStructure.map(l => l.section))].length
    });

  } catch (error) {
    console.error('Error populating lessons:', error);
    return Response.json({ 
      error: 'Failed to populate lessons',
      details: error.message 
    }, { status: 500 });
  }
});

// Helper functions for other subjects
function generateBiologyASLessons() {
  return [
    // AS1: Molecules (12 lessons)
    { section: 'AS1: Molecules', title: 'Water as a Biological Molecule', objectives: ['Demonstrate importance of water as solvent', 'Explain hydrogen bonding in water', 'Relate water properties to biological roles'], order: 1 },
    { section: 'AS1: Molecules', title: 'Inorganic Ions in Biology', objectives: ['Outline role of K⁺, Ca²⁺, Mg²⁺, Fe²⁺ ions', 'Explain role of HCO₃⁻, NO₃⁻, PO₄³⁻', 'Understand ions in compounds and buffering'], order: 2 },
    { section: 'AS1: Molecules', title: 'Carbohydrates - Monosaccharides and Disaccharides', objectives: ['Describe α-glucose, β-glucose, fructose structure', 'Explain condensation and hydrolysis reactions', 'Understand glycosidic bonds in maltose and sucrose'], order: 3 },
    { section: 'AS1: Molecules', title: 'Carbohydrates - Polysaccharides', objectives: ['Describe starch and glycogen as storage polymers', 'Explain cellulose as structural polymer of β-glucose', 'Understand pentoses in nucleic acids (ribose, deoxyribose)'], order: 4 },
    { section: 'AS1: Molecules', title: 'Lipids - Structure and Function', objectives: ['Describe triglyceride structure as glycerol + fatty acids', 'Compare saturated and unsaturated fatty acids', 'Explain phospholipid structure and membrane role'], order: 5 },
    { section: 'AS1: Molecules', title: 'Proteins - Amino Acids and Structure', objectives: ['Describe general amino acid structure', 'Explain primary, secondary, tertiary, quaternary structure', 'Understand peptide bonds and H-bonds'], order: 6 },
    { section: 'AS1: Molecules', title: 'Proteins - Fibrous and Globular', objectives: ['Compare collagen (fibrous) and enzymes (globular)', 'Explain conjugated proteins (glycoprotein, haemoglobin)', 'Understand prions as disease-causing proteins'], order: 7 },
    { section: 'AS1: Molecules', title: 'Nucleic Acids - DNA and RNA', objectives: ['Describe nucleotide structure (pentose, base, phosphate)', 'Explain DNA helical structure with base pairing', 'Compare DNA and RNA structure'], order: 8 },
    { section: 'AS1: Molecules', title: 'DNA Replication', objectives: ['Explain semi-conservative replication', 'Understand role of DNA helicase and DNA polymerase', 'Describe Meselson-Stahl experiment'], order: 9 },
    { section: 'AS1: Molecules', title: 'Biochemical Tests', objectives: ['Carry out iodine test for starch', 'Use Benedict's test for reducing sugars', 'Apply Biuret test for proteins'], order: 10 },
    { section: 'AS1: Molecules', title: 'Chromatography of Amino Acids', objectives: ['Prepare and run paper chromatogram', 'Develop chromatogram correctly', 'Calculate Rf values for amino acids'], order: 11 },
    
    // AS1: Enzymes (6 lessons)
    { section: 'AS1: Enzymes', title: 'Enzyme Structure and Active Site', objectives: ['Describe enzymes as globular proteins', 'Explain active site specificity', 'Understand role of cofactors and coenzymes'], order: 12 },
    { section: 'AS1: Enzymes', title: 'Enzyme Action - Lock and Key vs Induced Fit', objectives: ['Explain lock and key hypothesis', 'Understand induced-fit hypothesis', 'Describe enzyme-substrate complex formation'], order: 13 },
    { section: 'AS1: Enzymes', title: 'Factors Affecting Enzyme Activity', objectives: ['Investigate effect of temperature on enzymes', 'Analyze pH effects on enzyme activity', 'Understand substrate and enzyme concentration effects'], order: 14 },
    { section: 'AS1: Enzymes', title: 'Enzyme Inhibition', objectives: ['Explain competitive inhibition', 'Describe non-competitive inhibition', 'Apply inhibitors as therapeutic drugs'], order: 15 },
    { section: 'AS1: Enzymes', title: 'Enzymes as Biomarkers', objectives: ['Understand enzymes in disease processes', 'Explain elastase in respiratory infections', 'Apply enzyme detection in diagnosis'], order: 16 },
    { section: 'AS1: Enzymes', title: 'Immobilised Enzymes', objectives: ['Describe methods of enzyme immobilisation', 'Explain benefits in biotechnology', 'Use biosensors (glucose strips, pregnancy tests)'], order: 17 },
    
    // AS1: Viruses (2 lessons)
    { section: 'AS1: Viruses', title: 'Virus Structure - Bacteriophages and HIV', objectives: ['Describe bacteriophage structure (DNA + protein coat)', 'Explain HIV structure (RNA, protein, lipid bilayer, glycoprotein)', 'Understand HIV as retrovirus with reverse transcriptase'], order: 18 },
    { section: 'AS1: Viruses', title: 'Viral Replication', objectives: ['Understand phages invade and destroy bacteria', 'Explain HIV invasion of helper T-cells', 'Describe viral replication in host cells'], order: 19 },
    
    // AS1: Cells (12 lessons)
    { section: 'AS1: Cells', title: 'Prokaryotic vs Eukaryotic Cells', objectives: ['Compare prokaryotic cell structure (bacteria)', 'Describe eukaryotic cell features', 'Identify naked circular DNA vs chromosomes'], order: 20 },
    { section: 'AS1: Cells', title: 'Membrane Structure - Fluid Mosaic Model', objectives: ['Describe phospholipid bilayer', 'Explain intrinsic and extrinsic proteins', 'Understand glycocalyx, glycoproteins, glycolipids'], order: 21 },
    { section: 'AS1: Cells', title: 'Membrane Function', objectives: ['Explain proteins as carriers and channels', 'Understand recognition features', 'Describe cholesterol role in membrane stability'], order: 22 },
    { section: 'AS1: Cells', title: 'Cell Organelles - Mitochondria and Chloroplasts', objectives: ['Describe mitochondria (envelope, cristae, matrix)', 'Explain chloroplast structure (grana, stroma, thylakoids)', 'Understand double membrane organelles'], order: 23 },
    { section: 'AS1: Cells', title: 'Cell Organelles - ER, Ribosomes, Golgi', objectives: ['Describe rough ER with ribosomes', 'Explain smooth ER and Golgi apparatus', 'Understand ribosome role in protein synthesis'], order: 24 },
    { section: 'AS1: Cells', title: 'Cell Organelles - Lysosomes and Cytoskeleton', objectives: ['Explain lysosome function', 'Describe microtubules, centrioles, spindle', 'Understand plasmodesmata in plant cells'], order: 25 },
    { section: 'AS1: Cells', title: 'Nuclear Structure', objectives: ['Describe chromosomes (DNA + histones)', 'Explain nucleolus and rRNA coding', 'Understand nuclear envelope with pores'], order: 26 },
    { section: 'AS1: Cells', title: 'Plant, Fungal and Animal Cells', objectives: ['Compare plant cells (cell wall, chloroplasts, vacuole)', 'Describe fungal cells (chitin wall, multinucleate)', 'Identify animal cell features (centrioles, no wall)'], order: 27 },
    { section: 'AS1: Cells', title: 'Microscopy Techniques', objectives: ['Use light microscope effectively', 'Understand TEM vs SEM', 'Explain magnification vs resolution'], order: 28 },
    { section: 'AS1: Cells', title: 'Cell Fractionation', objectives: ['Demonstrate homogenisation technique', 'Use centrifugation to separate organelles', 'Understand differential centrifugation'], order: 29 },
    { section: 'AS1: Cells', title: 'Microscopy Practical Skills', objectives: ['Examine photomicrographs and electron micrographs', 'Draw cells and calculate magnification', 'Use graticule and stage micrometer'], order: 30 },
    { section: 'AS1: Cells', title: 'Staining and Measurement', objectives: ['Stain tissues (iodine, methylene blue)', 'Calculate true size in μm', 'Measure cell length accurately'], order: 31 },
    
    // AS1: Cell Physiology (4 lessons)
    { section: 'AS1: Cell Physiology', title: 'Diffusion and Osmosis', objectives: ['Explain diffusion across membranes', 'Understand osmosis and water potential (ψ)', 'Calculate ψ_cell = ψ_s + ψ_p'], order: 32 },
    { section: 'AS1: Cell Physiology', title: 'Water Relations in Cells', objectives: ['Describe lysis and crenation in animal cells', 'Explain turgor, plasmolysis in plant cells', 'Understand incipient plasmolysis'], order: 33 },
    { section: 'AS1: Cell Physiology', title: 'Facilitated Diffusion and Active Transport', objectives: ['Explain facilitated diffusion via proteins', 'Describe active transport using carriers and ATP', 'Understand endocytosis and exocytosis'], order: 34 },
    { section: 'AS1: Cell Physiology', title: 'Membrane Permeability', objectives: ['Explain fat-soluble substance movement', 'Describe water movement through bilayer', 'Understand hydrophilic channels for polar molecules'], order: 35 },
    
    // AS1: Practical - Water Potential (2 lessons)
    { section: 'AS1: Practical', title: 'Measuring Water Potential - Weighing Method', objectives: ['Use potato tissue in different solutions', 'Calculate percentage change in mass', 'Determine average water potential from graph'], order: 36 },
    { section: 'AS1: Practical', title: 'Measuring Solute Potential - Plasmolysis', objectives: ['Use onion epidermis in solutions', 'Calculate percentage plasmolysis', 'Determine average solute potential at 50% plasmolysis'], order: 37 },
    
    // AS1: Continuity of Cells (6 lessons)
    { section: 'AS1: Continuity of Cells', title: 'The Cell Cycle - Interphase', objectives: ['Describe G₁, S, G₂ phases', 'Explain DNA replication in S phase', 'Understand G₀ resting state'], order: 38 },
    { section: 'AS1: Continuity of Cells', title: 'Mitosis - Nuclear Division', objectives: ['Describe prophase, metaphase, anaphase, telophase', 'Explain chromosome behavior during mitosis', 'Understand significance in genetic constancy'], order: 39 },
    { section: 'AS1: Continuity of Cells', title: 'Cytokinesis and Cancer', objectives: ['Compare cytokinesis in animal vs plant cells', 'Explain cell cycle checkpoints', 'Understand cancer and loss of control'], order: 40 },
    { section: 'AS1: Continuity of Cells', title: 'Anticancer Drugs', objectives: ['Describe vincristine (microtubule inhibitor)', 'Explain 5-Fluorouracil (S-phase inhibitor)', 'Understand drug action on cell cycle'], order: 41 },
    { section: 'AS1: Continuity of Cells', title: 'Chromosome Number - Haploidy and Diploidy', objectives: ['Define haploid (n) and diploid (2n)', 'Identify chromosomes in photomicrographs', 'Analyze human karyotype'], order: 42 },
    { section: 'AS1: Continuity of Cells', title: 'Meiosis and Genetic Variation', objectives: ['Describe meiosis I and meiosis II stages', 'Explain crossing-over and chiasma formation', 'Understand independent assortment'], order: 43 },
    
    // AS1: Practical - Mitosis (1 lesson)
    { section: 'AS1: Practical', title: 'Root Tip Squash and Mitosis Observation', objectives: ['Prepare and stain root tip squashes', 'Recognize chromosomes at different stages', 'Identify mitosis stages in slides'], order: 44 },
    
    // AS1: Tissues and Organs (6 lessons)
    { section: 'AS1: Tissues and Organs', title: 'Tissues and Organs Defined', objectives: ['Define tissue as cells with same function', 'Explain organ as grouped tissues', 'Understand specialisation of cells'], order: 45 },
    { section: 'AS1: Tissues and Organs', title: 'Ileum Structure - Tissue Layers', objectives: ['Identify mucosa, submucosa, muscularis', 'Describe serosa protective layer', 'Understand tissue organization'], order: 46 },
    { section: 'AS1: Tissues and Organs', title: 'Ileum - Absorption Adaptations', objectives: ['Describe villi and microvilli', 'Explain crypts of Lieberkühn and Paneth cells', 'Understand blood capillaries and lacteals'], order: 47 },
    { section: 'AS1: Tissues and Organs', title: 'Ileum - Absorption Mechanisms', objectives: ['Explain diffusion, active transport, pinocytosis', 'Describe amino acid and monosaccharide absorption', 'Understand fat absorption into lacteals'], order: 48 },
    { section: 'AS1: Tissues and Organs', title: 'Leaf Structure - Mesophytic Leaf', objectives: ['Identify upper/lower epidermis, palisade, spongy mesophyll', 'Describe xylem and phloem in veins', 'Explain stomata and guard cells'], order: 49 },
    { section: 'AS1: Tissues and Organs', title: 'Leaf Adaptations', objectives: ['Explain waxy cuticle for water conservation', 'Understand palisade arrangement for photosynthesis', 'Describe gas exchange via stomata'], order: 50 },
    
    // AS1: Practical - Tissues (1 lesson)
    { section: 'AS1: Practical', title: 'Examining Ileum and Leaf Sections', objectives: ['Identify ileum structures under microscope', 'Recognize leaf tissues in sections', 'Draw accurate block diagrams'], order: 51 },
    
    // AS2: Transport - Principles (5 lessons)
    { section: 'AS2: Transport Principles', title: 'Surface Area to Volume Ratio', objectives: ['Explain SA:V relationship with organism size', 'Understand metabolic demand vs supply', 'Compare small vs large organisms'], order: 52 },
    { section: 'AS2: Transport Principles', title: 'Features of Exchange Surfaces', objectives: ['Describe methods to increase surface area', 'Explain thin separating surfaces', 'Understand concentration gradients'], order: 53 },
    { section: 'AS2: Transport Principles', title: 'Mass Transport Systems', objectives: ['Explain need for mass transport', 'Describe xylem water transport', 'Understand phloem translocation'], order: 54 },
    { section: 'AS2: Transport Principles', title: 'Gas Exchange - Fick's Law', objectives: ['Apply Fick's law to gas exchange', 'Understand factors affecting diffusion rate', 'Calculate diffusion rates'], order: 55 },
    { section: 'AS2: Transport Principles', title: 'Gas Exchange in Plants', objectives: ['Explain O₂ and CO₂ exchange', 'Understand compensation point', 'Describe mesophyll as exchange surface'], order: 56 },
    
    // AS2: Gas Exchange Mammals (3 lessons)
    { section: 'AS2: Gas Exchange Mammals', title: 'Mammalian Gas Exchange Surface', objectives: ['Describe alveoli structure', 'Explain thin respiratory surface', 'Understand surfactant role'], order: 57 },
    { section: 'AS2: Gas Exchange Mammals', title: 'Breathing System Structure', objectives: ['Identify trachea, bronchi, bronchioles, alveoli', 'Describe intercostal muscles and diaphragm', 'Understand breathing mechanism'], order: 58 },
    { section: 'AS2: Gas Exchange Mammals', title: 'Effects of Smoking', objectives: ['Explain cilia damage from smoking', 'Describe bronchitis and emphysema', 'Understand lung cancer risk'], order: 59 },
    
    // AS2: Practical - Respirometer (1 lesson)
    { section: 'AS2: Practical', title: 'Using a Respirometer', objectives: ['Measure O₂ consumption with KOH', 'Calculate CO₂ production without KOH', 'Determine net gas exchange'], order: 60 },
    
    // AS2: Transport in Plants (8 lessons)
    { section: 'AS2: Plant Transport', title: 'Plant Tissues - Xylem and Phloem', objectives: ['Describe xylem vessel structure', 'Explain phloem sieve tubes and companion cells', 'Identify protoxylem and metaxylem'], order: 61 },
    { section: 'AS2: Plant Transport', title: 'Root Hair Uptake', objectives: ['Explain water uptake via osmosis', 'Describe ion uptake via active transport', 'Understand root hair adaptations'], order: 62 },
    { section: 'AS2: Plant Transport', title: 'Apoplast and Symplast Pathways', objectives: ['Describe apoplast pathway (cell walls)', 'Explain symplast pathway (plasmodesmata)', 'Understand endodermis forcing symplast route'], order: 63 },
    { section: 'AS2: Plant Transport', title: 'Transpiration and Factors', objectives: ['Explain stomata as main transpiration route', 'Describe internal factors (surface area, density, cuticle)', 'Understand external factors (light, wind, temperature)'], order: 64 },
    { section: 'AS2: Plant Transport', title: 'Water Movement in Xylem', objectives: ['Explain cohesion-tension theory', 'Describe transpiration stream', 'Understand root pressure hypothesis'], order: 65 },
    { section: 'AS2: Plant Transport', title: 'Translocation in Phloem', objectives: ['Understand two-way flow in phloem', 'Explain energy requirement', 'Provide evidence for translocation'], order: 66 },
    { section: 'AS2: Plant Transport', title: 'Xerophytes - Adaptations', objectives: ['Describe leaf curvature and reduced area', 'Explain sunken stomata and hairs', 'Understand succulent tissue and spines'], order: 67 },
    { section: 'AS2: Plant Transport', title: 'Hydrophytes - Adaptations', objectives: ['Explain stomata on upper surface', 'Describe aerenchyma tissue', 'Understand adaptations for aquatic life'], order: 68 },
    
    // AS2: Circulatory System (10 lessons)
    { section: 'AS2: Circulation', title: 'Layout of Cardiovascular System', objectives: ['Describe double circulation', 'Identify major thoracic and abdominal vessels', 'Understand pulmonary and systemic circuits'], order: 69 },
    { section: 'AS2: Circulation', title: 'Blood Vessels - Arteries and Veins', objectives: ['Compare artery and vein structure', 'Explain elastic fibres in arteries', 'Understand valves and large lumen in veins'], order: 70 },
    { section: 'AS2: Circulation', title: 'Capillaries and Atherosclerosis', objectives: ['Describe capillary squamous endothelium', 'Explain atherosclerosis development', 'Understand atheroma formation'], order: 71 },
    { section: 'AS2: Circulation', title: 'Heart Structure', objectives: ['Identify atria, ventricles, septa', 'Describe AV valves (tricuspid, bicuspid)', 'Explain chordae tendinae and papillary muscles'], order: 72 },
    { section: 'AS2: Circulation', title: 'Cardiac Cycle', objectives: ['Describe diastole, atrial systole, ventricular systole', 'Explain blood flow along pressure gradients', 'Understand valve operation'], order: 73 },
    { section: 'AS2: Circulation', title: 'Cardiac Control', objectives: ['Explain myogenic stimulation', 'Describe SA node, AV node, Bundle of His', 'Understand Purkinje fibres'], order: 74 },
    { section: 'AS2: Circulation', title: 'Heart Sounds and ECG', objectives: ['Understand heart sounds', 'Interpret ECG traces', 'Explain angiography for diagnosis'], order: 75 },
    { section: 'AS2: Practical', title: 'Heart Dissection', objectives: ['Dissect mammalian heart', 'Identify chambers and valves', 'Recognize major blood vessels'], order: 76 },
    { section: 'AS2: Circulation', title: 'Blood Composition', objectives: ['Describe red blood cell adaptations', 'Identify polymorphs, monocytes, lymphocytes', 'Explain plasma components'], order: 77 },
    { section: 'AS2: Circulation', title: 'Blood Clotting', objectives: ['Describe platelet role', 'Explain prothrombin to thrombin conversion', 'Understand fibrinogen to fibrin formation'], order: 78 },
    
    // AS2: Haemoglobin (5 lessons)
    { section: 'AS2: Haemoglobin', title: 'Haemoglobin Structure', objectives: ['Describe conjugated protein structure', 'Explain haem groups with Fe²⁺', 'Understand four O₂ binding sites'], order: 79 },
    { section: 'AS2: Haemoglobin', title: 'Oxygen Dissociation Curve', objectives: ['Explain loading at high pO₂', 'Describe unloading at low pO₂', 'Understand cooperative binding'], order: 80 },
    { section: 'AS2: Haemoglobin', title: 'Bohr Effect', objectives: ['Explain right shift with increased CO₂/temperature', 'Understand increased O₂ release to tissues', 'Describe physiological advantage'], order: 81 },
    { section: 'AS2: Haemoglobin', title: 'Myoglobin', objectives: ['Compare myoglobin and haemoglobin affinity', 'Explain left-shifted dissociation curve', 'Understand aerobic respiration in muscle'], order: 82 },
    { section: 'AS2: Haemoglobin', title: 'Altitude Effects', objectives: ['Explain lower pO₂ at altitude', 'Describe haemoglobin adaptation', 'Understand increased RBC production'], order: 83 },
    
    // AS2: Adaptation (2 lessons)
    { section: 'AS2: Adaptation', title: 'Organism Adaptations', objectives: ['Define behavioural, physiological, morphological adaptations', 'Study organisms in habitat', 'Apply xerophytic and hydrophytic examples'], order: 84 },
    { section: 'AS2: Adaptation', title: 'Ecological Factors', objectives: ['Explain climatic factors (temperature, water, light)', 'Describe edaphic factors (pH, nutrients, aeration)', 'Understand biotic factors and ecological niche'], order: 85 },
    
    // AS2: Practical - Field Work (1 lesson)
    { section: 'AS2: Practical', title: 'Sampling Techniques', objectives: ['Use quadrats, pin frames, pitfall traps', 'Estimate abundance, density, frequency', 'Measure abiotic and biotic factors'], order: 86 },
    
    // AS2: Biodiversity (8 lessons)
    { section: 'AS2: Biodiversity', title: 'Biochemical Basis of Life', objectives: ['Understand all organisms contain same biochemicals', 'Identify carbohydrates, lipids, nucleic acids, proteins', 'Explain universal biochemistry'], order: 87 },
    { section: 'AS2: Biodiversity', title: 'Levels of Biodiversity', objectives: ['Define genetic diversity', 'Explain species diversity', 'Understand ecosystem diversity'], order: 88 },
    { section: 'AS2: Biodiversity', title: 'Measuring Biodiversity - Simpson's Index', objectives: ['Calculate Simpson's index D', 'Use formula D = (N(N-1))/(Σn(n-1))', 'Apply to percentage cover or count data'], order: 89 },
    { section: 'AS2: Biodiversity', title: 'Taxonomy Principles', objectives: ['Apply binomial nomenclature', 'Understand systematics', 'Classify organisms by similarities'], order: 90 },
    { section: 'AS2: Biodiversity', title: 'Species and Taxa', objectives: ['Define species concept', 'List taxa: genus, family, order, class, phylum, kingdom', 'Understand taxonomic hierarchy'], order: 91 },
    { section: 'AS2: Biodiversity', title: 'Phylogenetic Taxonomy', objectives: ['Explain phylogenetic relationships', 'Use morphology, cell structure, biochemistry', 'Compare DNA, RNA, protein sequences'], order: 92 },
    { section: 'AS2: Biodiversity', title: 'Five Kingdom System', objectives: ['Identify Prokaryotae, Protoctista, Fungi, Plantae, Animalia', 'Describe key features of each kingdom', 'Understand archaea as separate domain'], order: 93 },
    { section: 'AS2: Biodiversity', title: 'Kingdom Features', objectives: ['Describe prokaryote and protoctist features', 'Explain fungi as lysotrophs with chitin walls', 'Understand plant and animal characteristics'], order: 94 },
    
    // AS2: Human Impact (4 lessons)
    { section: 'AS2: Human Impact', title: 'Agricultural Practices and Biodiversity', objectives: ['Compare polyculture vs monoculture', 'Explain hedgerow conservation', 'Understand integrated pest management'], order: 95 },
    { section: 'AS2: Human Impact', title: 'Pollution of Waterways', objectives: ['Describe organic pollution (slurry, silage)', 'Explain eutrophication from fertiliser run-off', 'Understand mineral enrichment'], order: 96 },
    { section: 'AS2: Human Impact', title: 'BOD and Aquatic Ecosystems', objectives: ['Explain biological oxygen demand (BOD)', 'Describe effects on flora and fauna', 'Understand pollution reduction strategies'], order: 97 },
    { section: 'AS2: Human Impact', title: 'Conservation Initiatives', objectives: ['Describe ASSI and Special Areas of Conservation', 'Explain Biodiversity Action Plans', 'Understand global warming effects on biodiversity'], order: 98 },
  ];
}

function generateBiologyA2Lessons() {
  return [
    // A2 1: Homeostasis - Principles (2 lessons)
    { section: 'A2 1: Homeostasis Principles', title: 'Concept of Homeostasis', objectives: ['Define homeostasis as constant state maintenance', 'Identify sensor (receptor) and corrective mechanism', 'Explain negative feedback system'], order: 1 },
    { section: 'A2 1: Homeostasis Principles', title: 'The Kidney and Excretion', objectives: ['Understand removal of urea and creatine', 'Explain osmoregulation role', 'Describe gross kidney structure'], order: 2 },
    
    // A2 1: Kidney Structure and Function (8 lessons)
    { section: 'A2 1: The Kidney', title: 'Nephron Structure', objectives: ['Describe Bowman's capsule with podocytes', 'Identify proximal convoluted tubule features', 'Explain loop of Henle structure'], order: 3 },
    { section: 'A2 1: The Kidney', title: 'The Filter - Ultrafiltration', objectives: ['Describe squamous endothelium and basement membrane', 'Explain podocyte structure', 'Understand glomerular filtration'], order: 4 },
    { section: 'A2 1: The Kidney', title: 'Mechanism of Ultrafiltration', objectives: ['Explain afferent vs efferent arteriole diameter', 'Describe high blood pressure driving filtration', 'Understand osmotic and back pressure'], order: 5 },
    { section: 'A2 1: The Kidney', title: 'Selective Reabsorption - PCT', objectives: ['Explain active transport in proximal tubule', 'Describe glucose and amino acid reabsorption', 'Understand osmotic water recovery'], order: 6 },
    { section: 'A2 1: The Kidney', title: 'Selective Reabsorption - DCT', objectives: ['Explain facultative water reabsorption', 'Understand ADH-dependent permeability', 'Describe distal tubule and collecting duct'], order: 7 },
    { section: 'A2 1: The Kidney', title: 'Loop of Henle Function', objectives: ['Explain water loss from descending limb', 'Describe Na⁺ and Cl⁻ exit from ascending limb', 'Understand salt gradient in medulla'], order: 8 },
    { section: 'A2 1: The Kidney', title: 'Osmoregulation Mechanism', objectives: ['Describe hypothalamus osmoreceptors', 'Explain ADH synthesis and release', 'Understand ADH effect on permeability'], order: 9 },
    { section: 'A2 1: The Kidney', title: 'Negative Feedback - ADH', objectives: ['Explain decreased water potential triggers', 'Describe ADH corrective mechanism', 'Understand negative feedback loop'], order: 10 },
    
    // A2 1: Immunity (12 lessons)
    { section: 'A2 1: Immunity', title: 'Natural Barriers to Infection', objectives: ['Describe skin, acid, tears (lysozyme)', 'Explain mucus and blood clotting barriers', 'Understand first line of defence'], order: 11 },
    { section: 'A2 1: Immunity', title: 'Antigens and Antibodies', objectives: ['Define antigen as stimulating antibody production', 'Describe antibodies as specific globular proteins', 'Understand antigen-antibody complementarity'], order: 12 },
    { section: 'A2 1: Immunity', title: 'Antibody-Mediated Immunity', objectives: ['Explain B-lymphocyte division', 'Describe plasma cells secreting antibodies', 'Understand memory cells providing long-term immunity'], order: 13 },
    { section: 'A2 1: Immunity', title: 'Cell-Mediated Immunity', objectives: ['Explain T-lymphocyte sensitisation', 'Describe killer T-cells, helper T-cells', 'Understand memory T-cells and suppressor T-cells'], order: 14 },
    { section: 'A2 1: Immunity', title: 'Antigen-Antibody Reaction', objectives: ['Explain agglutination and complex formation', 'Describe phagocytosis by polymorphs', 'Understand lysosomal enzyme destruction'], order: 15 },
    { section: 'A2 1: Immunity', title: 'Active and Passive Immunity', objectives: ['Compare active vs passive immunity', 'Describe natural (placental, colostral) transfer', 'Explain artificial immunity and monoclonal antibodies'], order: 16 },
    { section: 'A2 1: Immunity', title: 'Vaccination', objectives: ['Understand importance of vaccination', 'Explain long-term vs short-term immunity', 'Describe societal and economic benefits'], order: 17 },
    { section: 'A2 1: Immunity', title: 'Transplant Rejection', objectives: ['Explain foreign antigen exposure', 'Describe T-cell and B-cell attack', 'Understand tissue rejection'], order: 18 },
    { section: 'A2 1: Immunity', title: 'Immunosuppression', objectives: ['Explain X-ray or drug-induced immunosuppression', 'Describe inhibition of DNA replication', 'Understand increased infection susceptibility'], order: 19 },
    { section: 'A2 1: Immunity', title: 'Blood Groups - ABO System', objectives: ['Explain ABO antigens on RBC surface', 'Understand antibody-antigen compatibility', 'Describe four blood groups'], order: 20 },
    { section: 'A2 1: Immunity', title: 'Rhesus Factor', objectives: ['Describe rhesus antigen (antigen D)', 'Explain anti-D antibody production', 'Understand rhesus negative mother risks'], order: 21 },
    { section: 'A2 1: Immunity', title: 'Blood Transfusion and Antibiotic Resistance', objectives: ['Apply transfusion compatibility principles', 'Explain agglutination consequences', 'Understand antibiotic resistance and ELISA'], order: 22 },
    
    // A2 1: Co-ordination - Plants (2 lessons)
    { section: 'A2 1: Plant Control', title: 'Phytochromes and Flowering', objectives: ['Describe P₆₆₀ and P₇₃₀ interconversion', 'Explain critical night length', 'Understand long-day and short-day plants'], order: 23 },
    { section: 'A2 1: Plant Control', title: 'Plant Growth Substances', objectives: ['Explain auxins promote cell elongation', 'Describe cytokinins promote division', 'Understand gibberellins and internode elongation'], order: 24 },
    
    // A2 1: Co-ordination - Nervous System (8 lessons)
    { section: 'A2 1: Nervous System', title: 'Neurone Structure', objectives: ['Identify dendrons, dendrites, cell body', 'Describe axon, Schwann cell, myelin sheath', 'Understand nodes of Ranvier'], order: 25 },
    { section: 'A2 1: Nervous System', title: 'Resting and Action Potential', objectives: ['Explain resting potential (polarisation)', 'Understand threshold stimulus', 'Describe all-or-nothing law'], order: 26 },
    { section: 'A2 1: Nervous System', title: 'Propagation of Action Potentials', objectives: ['Explain depolarisation and action potential', 'Describe propagation via local circuits', 'Understand refractory period'], order: 27 },
    { section: 'A2 1: Nervous System', title: 'Speed of Conduction', objectives: ['Explain axon diameter effect', 'Describe myelination benefit', 'Understand saltatory conduction'], order: 28 },
    { section: 'A2 1: Nervous System', title: 'Synapse Structure', objectives: ['Identify synaptic bulb and vesicles', 'Describe pre-synaptic and post-synaptic membranes', 'Understand synaptic cleft'], order: 29 },
    { section: 'A2 1: Nervous System', title: 'Synaptic Transmission', objectives: ['Explain neurotransmitter exocytosis', 'Describe acetylcholine, noradrenaline, GABA', 'Understand receptor binding'], order: 30 },
    { section: 'A2 1: Nervous System', title: 'Excitatory and Inhibitory Synapses', objectives: ['Explain EPSP and action potential generation', 'Describe role of acetylcholinesterase', 'Understand IPSP and hyperpolarisation'], order: 31 },
    { section: 'A2 1: Nervous System', title: 'The Mammalian Eye', objectives: ['Identify eye structures (cornea, iris, lens, retina)', 'Explain accommodation mechanism', 'Understand rods vs cones distribution'], order: 32 },
    
    // A2 1: Vision (3 lessons)
    { section: 'A2 1: Vision', title: 'Pupil Control and Visual Acuity', objectives: ['Explain iris muscle control of pupil', 'Describe rod convergence and sensitivity', 'Understand cone visual acuity and colour'], order: 33 },
    { section: 'A2 1: Vision', title: 'Dark Adaptation', objectives: ['Explain rhodopsin breakdown and re-synthesis', 'Understand adaptation to low light', 'Describe rod function in darkness'], order: 34 },
    { section: 'A2 1: Vision', title: 'Binocular Vision', objectives: ['Explain distance and depth perception', 'Understand wide visual fields', 'Describe stereoscopic vision'], order: 35 },
    
    // A2 1: Muscle (2 lessons)
    { section: 'A2 1: Effectors', title: 'Skeletal Muscle Structure', objectives: ['Distinguish muscle, fibres, myofibrils', 'Identify sarcomere bands (A, I, H, Z, M)', 'Recognize changes during contraction'], order: 36 },
    { section: 'A2 1: Effectors', title: 'Sliding Filament Theory', objectives: ['Explain myosin head attachment to actin', 'Describe Ca²⁺ role in contraction', 'Understand ATP requirement for movement'], order: 37 },
    
    // A2 1: Ecosystems (12 lessons)
    { section: 'A2 1: Ecosystems', title: 'Population Growth Curves', objectives: ['Describe exponential (log) and stationary phases', 'Explain competition and resource availability', 'Define carrying capacity and environmental resistance'], order: 38 },
    { section: 'A2 1: Ecosystems', title: 'r-Selected and K-Selected Species', objectives: ['Describe features of r-selected species', 'Explain K-selected species characteristics', 'Compare population growth curves'], order: 39 },
    { section: 'A2 1: Ecosystems', title: 'Population Interactions', objectives: ['Explain competition (-/-)', 'Describe mutualism (+/+)', 'Understand predation and parasitism (+/-)'], order: 40 },
    { section: 'A2 1: Ecosystems', title: 'Biological Control', objectives: ['Define pest species', 'Explain use of predators/competitors', 'Compare biological vs chemical control'], order: 41 },
    { section: 'A2 1: Ecosystems', title: 'Community Development', objectives: ['Describe pioneer species and colonisation', 'Explain succession to climax community', 'Understand primary vs secondary succession'], order: 42 },
    { section: 'A2 1: Ecosystems', title: 'Food Chains and Webs', objectives: ['Identify producers and consumers', 'Explain grazing and detritus food chains', 'Understand role of decomposers'], order: 43 },
    { section: 'A2 1: Ecosystems', title: 'Trophic Levels', objectives: ['Define primary producers (1st trophic level)', 'Calculate net primary production (NPP = GPP - respiration)', 'Identify consumer trophic levels'], order: 44 },
    { section: 'A2 1: Ecosystems', title: 'Ecological Pyramids', objectives: ['Construct pyramids of numbers, biomass, energy', 'Calculate energy transfer efficiency', 'Understand pyramid usefulness'], order: 45 },
    { section: 'A2 1: Ecosystems', title: 'Energy Losses in Ecosystems', objectives: ['Explain low solar radiation absorption', 'Describe losses via egestion, excretion, respiration', 'Understand endotherm vs ectotherm losses'], order: 46 },
    { section: 'A2 1: Ecosystems', title: 'Agriculture and Energy', objectives: ['Explain extra energy cost of animal products', 'Describe intensive farming (confinement, high energy foods)', 'Understand fertiliser use'], order: 47 },
    { section: 'A2 1: Ecosystems', title: 'Carbon Cycle', objectives: ['Describe respiration, combustion, decomposition adding CO₂', 'Explain photosynthesis removing CO₂', 'Understand carbon cycling'], order: 48 },
    { section: 'A2 1: Ecosystems', title: 'Nitrogen Cycle', objectives: ['Explain decomposer role releasing NH₄⁺', 'Describe nitrifying bacteria producing NO₃⁻', 'Understand N₂-fixing bacteria and denitrification'], order: 49 },
    
    // A2 1: Practical (2 lessons)
    { section: 'A2 1: Practical', title: 'Yeast Population Growth', objectives: ['Use haemocytometer to count cells', 'Calculate cell density', 'Understand culture medium components'], order: 50 },
    { section: 'A2 1: Practical', title: 'Capture-Mark-Recapture', objectives: ['Apply marking techniques', 'Understand assumptions in method', 'Estimate animal population size'], order: 51 },
    
    // A2 2: Respiration (9 lessons)
    { section: 'A2 2: Respiration', title: 'ATP - Nature and Function', objectives: ['Describe ATP structure (adenine, ribose, phosphate)', 'Explain ATP/ADP cycle', 'Understand uses in synthesis, transport, mechanical work'], order: 52 },
    { section: 'A2 2: Respiration', title: 'Glycolysis', objectives: ['Explain glucose phosphorylation to fructose bisphosphate', 'Describe formation of 2 triose phosphates', 'Calculate net yield of 2 ATP and NADH'], order: 53 },
    { section: 'A2 2: Respiration', title: 'Aerobic Respiration Overview', objectives: ['Explain glycolysis followed by Krebs cycle', 'Describe electron transport at cristae', 'Understand complete glucose oxidation'], order: 54 },
    { section: 'A2 2: Respiration', title: 'Anaerobic Respiration', objectives: ['Explain NAD regeneration without ATP yield', 'Compare ethanol production (plants/fungi) vs lactate (animals)', 'Understand oxygen-independent pathways'], order: 55 },
    { section: 'A2 2: Respiration', title: 'Link Reaction and Krebs Cycle', objectives: ['Describe pyruvate oxidative decarboxylation', 'Explain acetyl CoA entering Krebs cycle', 'Calculate NADH, FADH₂, ATP yields'], order: 56 },
    { section: 'A2 2: Respiration', title: 'Electron Transport Chain', objectives: ['Identify NAD, flavoprotein, CoQ, cytochromes', 'Explain oxygen as final H acceptor', 'Calculate ATP synthesis points'], order: 57 },
    { section: 'A2 2: Respiration', title: 'Aerobic vs Anaerobic Comparison', objectives: ['Compare ATP yields', 'Explain oxygen debt concept', 'Understand survival strategies'], order: 58 },
    { section: 'A2 2: Respiration', title: 'Respiratory Quotient (RQ)', objectives: ['Calculate RQ = CO₂/O₂ ratio', 'Use RQ to identify respiratory substrates', 'Detect anaerobic respiration'], order: 59 },
    { section: 'A2 2: Practical', title: 'Respirometer and Redox Indicators', objectives: ['Calculate O₂ uptake and CO₂ production', 'Determine RQ values', 'Use methylene blue as hydrogen acceptor'], order: 60 },
    
    // A2 2: Photosynthesis (6 lessons)
    { section: 'A2 2: Photosynthesis', title: 'Chloroplast Sites of Reactions', objectives: ['Identify light-dependent stage on thylakoids', 'Explain light-independent stage in stroma', 'Understand spatial organization'], order: 61 },
    { section: 'A2 2: Photosynthesis', title: 'Light-Dependent Stage - Z Scheme', objectives: ['Explain photoactivation of PSI and PSII', 'Describe electron flow producing ATP', 'Understand NADP reduction to NADPH'], order: 62 },
    { section: 'A2 2: Photosynthesis', title: 'Photolysis of Water', objectives: ['Explain water dissociation (OH⁻ + H⁺)', 'Describe electron replacement in PSII', 'Understand oxygen release'], order: 63 },
    { section: 'A2 2: Photosynthesis', title: 'Light-Independent Stage - Calvin Cycle', objectives: ['Explain CO₂ fixation by rubisco', 'Describe GP (C₃) reduction to triose phosphate', 'Understand RuBP regeneration (5/6) and glucose synthesis (1/6)'], order: 64 },
    { section: 'A2 2: Photosynthesis', title: 'Chlorophyll and Light Absorption', objectives: ['Describe absorption spectra of pigments', 'Explain action spectrum', 'Understand optimal wavelengths'], order: 65 },
    { section: 'A2 2: Photosynthesis', title: 'Limiting Factors', objectives: ['Measure as CO₂ uptake or O₂ production', 'Explain gross vs net photosynthesis', 'Understand light, CO₂, temperature as limiting factors'], order: 66 },
    
    // A2 2: Practical Photosynthesis (1 lesson)
    { section: 'A2 2: Practical', title: 'Chromatography and DCPIP', objectives: ['Separate plant pigments by chromatography', 'Calculate Rf values', 'Use DCPIP as hydrogen acceptor indicator'], order: 67 },
    
    // A2 2: DNA as Genetic Code (4 lessons)
    { section: 'A2 2: Genetic Code', title: 'Nature of Genetic Code', objectives: ['Define gene as DNA base sequence', 'Explain non-overlapping, degenerate triplet code', 'Understand exons and introns'], order: 68 },
    { section: 'A2 2: Genetic Code', title: 'Transcription', objectives: ['Describe mRNA synthesis from DNA template', 'Explain RNA polymerase role', 'Understand complementary base pairing'], order: 69 },
    { section: 'A2 2: Genetic Code', title: 'Translation', objectives: ['Explain tRNA anticodon-codon pairing', 'Describe ribosome peptidyl and aminoacyl sites', 'Understand polypeptide formation'], order: 70 },
    { section: 'A2 2: Genetic Code', title: 'One Gene/One Polypeptide and Epigenetics', objectives: ['Apply one gene codes for one polypeptide', 'Explain enzyme control of phenotype', 'Understand epigenetic methylation and histone modification'], order: 71 },
    
    // A2 2: Gene Technology (10 lessons)
    { section: 'A2 2: Gene Technology', title: 'Polymerase Chain Reaction (PCR)', objectives: ['Explain PCR amplification technique', 'Describe heating, annealing primers, extension cycle', 'Understand PCR applications'], order: 72 },
    { section: 'A2 2: Gene Technology', title: 'DNA Probes', objectives: ['Define DNA probe as known sequence', 'Explain fluorescent markers', 'Understand complementary base pairing'], order: 73 },
    { section: 'A2 2: Gene Technology', title: 'Genetic Variation - Markers', objectives: ['Use microsatellite repeat sequences (MRSs)', 'Apply single nucleotide polymorphisms (SNPs)', 'Assess nucleotide sequence differences'], order: 74 },
    { section: 'A2 2: Gene Technology', title: 'Microarray Technology', objectives: ['Explain gene expression profiling', 'Describe DNA hybridisation to chip', 'Analyze fluorescent/chemiluminescent signals'], order: 75 },
    { section: 'A2 2: Gene Technology', title: 'Genetic Fingerprinting', objectives: ['Use restriction endonucleases', 'Apply gel electrophoresis separation', 'Understand forensic and paternity applications'], order: 76 },
    { section: 'A2 2: Gene Technology', title: 'Gene Transfer Stages', objectives: ['Obtain donor DNA (restriction enzymes, reverse transcriptase)', 'Use vectors (phages, plasmids)', 'Transform E. coli or yeast'], order: 77 },
    { section: 'A2 2: Gene Technology', title: 'Marker Genes', objectives: ['Use antibiotic resistance markers', 'Apply fluorescent markers', 'Identify transformed cells'], order: 78 },
    { section: 'A2 2: Gene Technology', title: 'GM Microorganisms and Transgenic Organisms', objectives: ['Explain GM bacteria producing substances', 'Describe transgenic animals and plants', 'Understand improved traits and applications'], order: 79 },
    { section: 'A2 2: Gene Technology', title: 'Gene Therapy', objectives: ['Explain somatic-cell gene therapy', 'Describe vectors for gene transfer', 'Understand germ-line therapy ethics'], order: 80 },
    { section: 'A2 2: Gene Technology', title: 'Gene Sequencing and Pharmacogenetics', objectives: ['Explain genome sequencing', 'Describe Human Genome Project', 'Understand personalised medicine and designer drugs'], order: 81 },
    
    // A2 2: Genetics and Inheritance (8 lessons)
    { section: 'A2 2: Inheritance', title: 'Genotype and Phenotype', objectives: ['Define genotype and phenotype', 'Explain environmental influence', 'Understand homozygosity and heterozygosity'], order: 82 },
    { section: 'A2 2: Inheritance', title: 'Chromosomes, Genes and Alleles', objectives: ['Define genes on chromosomes', 'Explain alleles at same locus', 'Understand homologous chromosomes'], order: 83 },
    { section: 'A2 2: Inheritance', title: 'Monohybrid Inheritance', objectives: ['Apply Mendel's law of segregation', 'Explain dominance and recessiveness', 'Understand codominance and lethal alleles'], order: 84 },
    { section: 'A2 2: Inheritance', title: 'Dihybrid Inheritance', objectives: ['Apply Mendel's law of independent assortment', 'Use Punnett squares', 'Solve genetic diagram problems'], order: 85 },
    { section: 'A2 2: Inheritance', title: 'Test Crosses and Multiple Alleles', objectives: ['Use test crosses to determine genotype', 'Explain multiple allele inheritance', 'Apply to blood groups'], order: 86 },
    { section: 'A2 2: Inheritance', title: 'Sex Determination and Sex Linkage', objectives: ['Explain XX/XY sex chromosomes', 'Describe sex-linked inheritance', 'Solve sex-linked genetic problems'], order: 87 },
    { section: 'A2 2: Inheritance', title: 'Gene Interaction and Epistasis', objectives: ['Explain gene interaction', 'Describe epistasis', 'Solve epistatic inheritance patterns'], order: 88 },
    { section: 'A2 2: Inheritance', title: 'Polygenic Inheritance', objectives: ['Explain continuous variation', 'Describe additive effects of polygenes', 'Understand environmental contribution'], order: 89 },
    
    // A2 2: Population Genetics (6 lessons)
    { section: 'A2 2: Population Genetics', title: 'Gene Pool Concept', objectives: ['Define gene pool as sum of alleles', 'Understand allele frequencies', 'Explain population genetics'], order: 90 },
    { section: 'A2 2: Population Genetics', title: 'Hardy-Weinberg Equation', objectives: ['Apply p² + 2pq + q² = 1', 'Calculate allele frequencies (p + q = 1)', 'Determine genotype frequencies'], order: 91 },
    { section: 'A2 2: Population Genetics', title: 'Hardy-Weinberg Equilibrium', objectives: ['Understand equilibrium conditions', 'Explain random fertilisation', 'Describe effects of mutation, migration, selection'], order: 92 },
    { section: 'A2 2: Population Genetics', title: 'Sources of Genetic Variation', objectives: ['Explain heterozygotes as variation reservoirs', 'Describe mutation (base deletions/substitutions)', 'Understand chromosome mutation'], order: 93 },
    { section: 'A2 2: Population Genetics', title: 'Natural Selection', objectives: ['Define fitness and adaptation', 'Explain differential allele perpetuation', 'Describe stabilising vs directional selection'], order: 94 },
    { section: 'A2 2: Population Genetics', title: 'Speciation', objectives: ['Define species as interbreeding group', 'Explain allopatric speciation', 'Understand reproductive isolating mechanisms'], order: 95 },
    
    // A2 2: Kingdom Plantae (3 lessons)
    { section: 'A2 2: Kingdom Plantae', title: 'Mosses - Features and Restrictions', objectives: ['Describe multicellular undifferentiated structure', 'Explain rhizoids and lack of vascular tissue', 'Understand restriction to moist habitats'], order: 96 },
    { section: 'A2 2: Kingdom Plantae', title: 'Ferns - Adaptations', objectives: ['Describe differentiation (roots, stems, leaves)', 'Explain vascular system presence', 'Understand cuticle and stomatal control'], order: 97 },
    { section: 'A2 2: Kingdom Plantae', title: 'Angiosperms - Advanced Adaptations', objectives: ['Explain seed dispersal advantage', 'Describe xylem forming wood', 'Understand desiccation-resistant seeds'], order: 98 },
    
    // A2 2: Kingdom Animalia (5 lessons)
    { section: 'A2 2: Kingdom Animalia', title: 'Phylum Cnidaria', objectives: ['Describe radial symmetry', 'Explain hydrostatic skeleton', 'Identify features in hydra and jellyfish'], order: 99 },
    { section: 'A2 2: Kingdom Animalia', title: 'Phylum Platyhelminthes', objectives: ['Describe bilateral symmetry and flattened body', 'Explain single gut opening', 'Identify features in planarian and liver fluke'], order: 100 },
    { section: 'A2 2: Kingdom Animalia', title: 'Phylum Annelida', objectives: ['Describe metameric segmentation', 'Explain gut with mouth and anus', 'Understand hydrostatic skeleton in earthworm'], order: 101 },
    { section: 'A2 2: Kingdom Animalia', title: 'Phylum Arthropoda', objectives: ['Describe jointed limbs and fixed segments', 'Explain regional specialisation (head, thorax, abdomen)', 'Understand success of insects'], order: 102 },
    { section: 'A2 2: Kingdom Animalia', title: 'Phylum Chordata', objectives: ['Describe bilateral symmetry and segmentation', 'Explain spinal column and jointed skeleton', 'Identify features in mammals and birds'], order: 103 },
  ];
}

function generateChemistryASLessons() {
  return [
    { section: 'AS1: Atomic Structure and Bonding', title: 'Atomic Structure', objectives: ['Describe atomic structure', 'Understand isotopes', 'Calculate relative atomic mass'], order: 1 },
    // Add 25+ more AS lessons...
  ];
}

function generateChemistryA2Lessons() {
  return [
    { section: 'A21: Organic Chemistry', title: 'Nomenclature and Isomerism', objectives: ['Apply IUPAC naming', 'Identify structural isomers', 'Understand stereoisomerism'], order: 1 },
    // Add 25+ more A2 lessons...
  ];
}

function generatePhysicsASLessons() {
  return [
    { section: 'AS1: Mechanics', title: 'Kinematics - Motion Graphs', objectives: ['Interpret displacement-time graphs', 'Analyze velocity-time graphs', 'Calculate from gradients'], order: 1 },
    // Add 25+ more AS lessons...
  ];
}

function generatePhysicsA2Lessons() {
  return [
    { section: 'A21: Fields', title: 'Gravitational Fields', objectives: ['Define gravitational field strength', 'Apply $g = \\frac{F}{m}$', 'Understand field lines'], order: 1 },
    // Add 25+ more A2 lessons...
  ];
}

function generateMathematicsASLessons() {
  return [
    { section: 'AS Pure Mathematics', title: 'Algebra - Indices', objectives: ['Apply laws of indices', 'Simplify expressions', 'Solve index equations'], order: 1 },
    // Add 25+ more AS lessons...
  ];
}

function generateMathematicsA2Lessons() {
  return [
    { section: 'A2 Pure Mathematics', title: 'Calculus - Integration by Parts', objectives: ['Apply integration by parts formula', 'Choose u and dv correctly', 'Solve definite integrals'], order: 1 },
    // Add 25+ more A2 lessons...
  ];
}