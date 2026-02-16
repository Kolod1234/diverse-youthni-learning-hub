import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const courses = await base44.asServiceRole.entities.Course.filter({
      qualification_type: 'alevel',
      category: 'mathematics'
    });

    const results = [];
    
    for (const course of courses) {
      try {
        const lessons = course.alevel_stage === 'as' ? getMathematicsAS() : getMathematicsA2();
        
        if (!lessons || lessons.length === 0) {
          results.push({ course: course.title, status: 'no data' });
          continue;
        }

        const existing = await base44.entities.Lesson.filter({ course_id: course.id });
        if (existing.length > 0) {
          await Promise.all(existing.map(l => base44.asServiceRole.entities.Lesson.delete(l.id)));
        }

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
          duration_minutes: 60
        })));

        await base44.asServiceRole.entities.Course.update(course.id, {
          total_lessons: lessons.length
        });

        results.push({ course: course.title, lessons: lessons.length, status: 'success' });
        await new Promise(r => setTimeout(r, 6000));

      } catch (error) {
        results.push({ course: course.title, status: 'error', error: error.message });
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getMathematicsAS() {
  let o = 1;
  const lessons = [];
  
  // AS1: Pure Mathematics
  
  // 1.1 Algebra and Functions (12 lessons)
  lessons.push(
    { s: 'AS1: Algebra', o: o++, t: 'Index Laws', d: 'Laws of indices and surds', obj: ['Apply index laws to algebraic expressions', 'Simplify expressions with fractional and negative indices', 'Rationalize surds'] },
    { s: 'AS1: Algebra', o: o++, t: 'Expanding Brackets', d: 'Binomial expansion basics', obj: ['Expand single and double brackets', 'Expand products of algebraic expressions', 'Simplify algebraic expressions'] },
    { s: 'AS1: Algebra', o: o++, t: 'Factorising', d: 'Factorisation techniques', obj: ['Factorise quadratic expressions', 'Factorise using common factors', 'Factorise by grouping'] },
    { s: 'AS1: Algebra', o: o++, t: 'Quadratic Equations', d: 'Solving quadratic equations', obj: ['Solve by factorisation', 'Complete the square', 'Apply quadratic formula'] },
    { s: 'AS1: Algebra', o: o++, t: 'Discriminant', d: 'Nature of roots', obj: ['Calculate discriminant b²-4ac', 'Determine nature of roots', 'Apply to problems'] },
    { s: 'AS1: Algebra', o: o++, t: 'Simultaneous Equations', d: 'Linear and quadratic pairs', obj: ['Solve linear simultaneous equations', 'Solve one linear one quadratic', 'Apply elimination and substitution'] },
    { s: 'AS1: Algebra', o: o++, t: 'Inequalities', d: 'Linear and quadratic inequalities', obj: ['Solve linear inequalities', 'Solve quadratic inequalities', 'Represent solutions on number line'] },
    { s: 'AS1: Algebra', o: o++, t: 'Algebraic Fractions', d: 'Simplifying and operations', obj: ['Simplify algebraic fractions', 'Add subtract multiply divide fractions', 'Solve equations with fractions'] },
    { s: 'AS1: Algebra', o: o++, t: 'Functions Notation', d: 'Function concepts and notation', obj: ['Understand function notation f(x)', 'Find function values', 'Determine domain and range'] },
    { s: 'AS1: Algebra', o: o++, t: 'Composite Functions', d: 'Function composition', obj: ['Find composite functions fg(x)', 'Simplify composite functions', 'Solve composite function equations'] },
    { s: 'AS1: Algebra', o: o++, t: 'Inverse Functions', d: 'Finding inverse functions', obj: ['Find inverse function f⁻¹(x)', 'Verify inverse by composition', 'Understand domain restrictions'] },
    { s: 'AS1: Algebra', o: o++, t: 'Modulus Function', d: 'Absolute value', obj: ['Understand modulus |x|', 'Sketch modulus graphs', 'Solve modulus equations and inequalities'] }
  );
  
  // 1.2 Coordinate Geometry (8 lessons)
  lessons.push(
    { s: 'AS1: Coordinate Geometry', o: o++, t: 'Straight Line Equations', d: 'Finding equations of lines', obj: ['Find equation from gradient and point', 'Use y-y₁=m(x-x₁)', 'Convert to y=mx+c form'] },
    { s: 'AS1: Coordinate Geometry', o: o++, t: 'Parallel and Perpendicular Lines', d: 'Relationship between gradients', obj: ['Identify parallel lines m₁=m₂', 'Identify perpendicular lines m₁m₂=-1', 'Find equations of perpendicular lines'] },
    { s: 'AS1: Coordinate Geometry', o: o++, t: 'Midpoint and Distance', d: 'Length and midpoint formulas', obj: ['Calculate midpoint of line segment', 'Find distance between two points', 'Apply to geometric problems'] },
    { s: 'AS1: Coordinate Geometry', o: o++, t: 'Circle Equations', d: 'Standard form of circle', obj: ['Write circle equation (x-a)²+(y-b)²=r²', 'Find centre and radius', 'Expand circle equations'] },
    { s: 'AS1: Coordinate Geometry', o: o++, t: 'Circle Properties', d: 'Completing square for circles', obj: ['Complete square to find centre', 'Determine if equation represents circle', 'Find equation from given information'] },
    { s: 'AS1: Coordinate Geometry', o: o++, t: 'Lines and Circles', d: 'Intersection problems', obj: ['Find intersection points algebraically', 'Determine number of intersection points', 'Find tangent equations'] },
    { s: 'AS1: Coordinate Geometry', o: o++, t: 'Tangents to Circles', d: 'Perpendicular radius property', obj: ['Use radius perpendicular to tangent', 'Find tangent equations at given point', 'Find tangent from external point'] },
    { s: 'AS1: Coordinate Geometry', o: o++, t: 'Curve Sketching', d: 'Sketching coordinate graphs', obj: ['Sketch straight lines', 'Sketch circles', 'Identify key features'] }
  );
  
  // 1.3 Sequences and Series (6 lessons)
  lessons.push(
    { s: 'AS1: Sequences Series', o: o++, t: 'Sequences', d: 'Arithmetic and geometric sequences', obj: ['Define arithmetic sequence', 'Find nth term of AP', 'Define geometric sequence and find nth term'] },
    { s: 'AS1: Sequences Series', o: o++, t: 'Arithmetic Series', d: 'Sum of arithmetic series', obj: ['Derive sum formula Sn=n/2(2a+(n-1)d)', 'Apply sum formula', 'Solve problems involving arithmetic series'] },
    { s: 'AS1: Sequences Series', o: o++, t: 'Geometric Series', d: 'Sum of geometric series', obj: ['Derive sum formula Sn=a(1-rⁿ)/(1-r)', 'Apply geometric series formula', 'Find sum to n terms'] },
    { s: 'AS1: Sequences Series', o: o++, t: 'Infinite Geometric Series', d: 'Sum to infinity', obj: ['Understand convergence condition |r|<1', 'Calculate sum to infinity S∞=a/(1-r)', 'Apply to recurring decimals'] },
    { s: 'AS1: Sequences Series', o: o++, t: 'Sigma Notation', d: 'Summation notation', obj: ['Understand sigma notation Σ', 'Evaluate sums using sigma', 'Write series in sigma notation'] },
    { s: 'AS1: Sequences Series', o: o++, t: 'Binomial Expansion', d: 'Pascal\'s triangle and binomial theorem', obj: ['Use Pascal triangle', 'Apply binomial theorem (a+b)ⁿ', 'Find specific terms in expansion'] }
  );
  
  // 1.4 Trigonometry (10 lessons)
  lessons.push(
    { s: 'AS1: Trigonometry', o: o++, t: 'Radians', d: 'Radian measure of angles', obj: ['Convert degrees to radians', 'Convert radians to degrees', 'Understand π radians = 180°'] },
    { s: 'AS1: Trigonometry', o: o++, t: 'Arc Length and Sector Area', d: 'Applications of radians', obj: ['Calculate arc length s=rθ', 'Calculate sector area A=½r²θ', 'Solve circle sector problems'] },
    { s: 'AS1: Trigonometry', o: o++, t: 'Sine Rule', d: 'Solving non-right triangles', obj: ['Apply sine rule a/sinA = b/sinB', 'Use sine rule for sides', 'Use sine rule for angles'] },
    { s: 'AS1: Trigonometry', o: o++, t: 'Cosine Rule', d: 'Finding sides and angles', obj: ['Apply cosine rule a²=b²+c²-2bc cosA', 'Find sides using cosine rule', 'Find angles using cosine rule'] },
    { s: 'AS1: Trigonometry', o: o++, t: 'Triangle Area Formula', d: 'Area using sine', obj: ['Apply area formula A=½ab sinC', 'Calculate triangle areas', 'Solve area problems'] },
    { s: 'AS1: Trigonometry', o: o++, t: 'Trigonometric Graphs', d: 'Sine cosine tangent graphs', obj: ['Sketch y=sin x, y=cos x, y=tan x', 'Understand periodic nature', 'Identify key features'] },
    { s: 'AS1: Trigonometry', o: o++, t: 'Transformations of Trig Graphs', d: 'Amplitude phase period', obj: ['Sketch y=a sin(bx+c)', 'Identify amplitude a', 'Identify period 2π/b and phase shift'] },
    { s: 'AS1: Trigonometry', o: o++, t: 'Trigonometric Identities', d: 'Fundamental identities', obj: ['Apply sin²θ + cos²θ = 1', 'Use tanθ = sinθ/cosθ', 'Simplify using identities'] },
    { s: 'AS1: Trigonometry', o: o++, t: 'Solving Trigonometric Equations', d: 'Finding angles', obj: ['Solve equations in given range', 'Use CAST diagram', 'Find all solutions'] },
    { s: 'AS1: Trigonometry', o: o++, t: 'Reciprocal Trig Functions', d: 'Cosec sec cot', obj: ['Define cosec = 1/sin', 'Define sec = 1/cos and cot = 1/tan', 'Sketch reciprocal function graphs'] }
  );
  
  // 1.5 Calculus (14 lessons)
  lessons.push(
    { s: 'AS1: Calculus', o: o++, t: 'Introduction to Differentiation', d: 'Rate of change and gradient', obj: ['Understand derivative as gradient', 'Use limit definition', 'Interpret dy/dx'] },
    { s: 'AS1: Calculus', o: o++, t: 'Differentiating Polynomials', d: 'Power rule', obj: ['Apply d/dx(xⁿ) = nxⁿ⁻¹', 'Differentiate polynomial functions', 'Differentiate constant terms'] },
    { s: 'AS1: Calculus', o: o++, t: 'Tangents and Normals', d: 'Equations of tangent and normal', obj: ['Find tangent equation at point', 'Find normal equation', 'Apply perpendicular gradient property'] },
    { s: 'AS1: Calculus', o: o++, t: 'Second Derivatives', d: 'Rate of change of gradient', obj: ['Find second derivative d²y/dx²', 'Interpret physical meaning', 'Apply to acceleration'] },
    { s: 'AS1: Calculus', o: o++, t: 'Stationary Points', d: 'Maximum minimum turning points', obj: ['Find stationary points dy/dx=0', 'Classify using second derivative', 'Sketch curves showing turning points'] },
    { s: 'AS1: Calculus', o: o++, t: 'Increasing and Decreasing Functions', d: 'Using first derivative', obj: ['Determine where function increases', 'Determine where function decreases', 'Apply dy/dx > 0 for increasing'] },
    { s: 'AS1: Calculus', o: o++, t: 'Curve Sketching with Calculus', d: 'Using derivatives to sketch', obj: ['Find intercepts', 'Find stationary points', 'Sketch complete curve'] },
    { s: 'AS1: Calculus', o: o++, t: 'Optimisation Problems', d: 'Maximum and minimum applications', obj: ['Set up optimisation problems', 'Form function to optimise', 'Find maximum or minimum value'] },
    { s: 'AS1: Calculus', o: o++, t: 'Introduction to Integration', d: 'Antiderivative and area', obj: ['Understand integration as reverse of differentiation', 'Find indefinite integrals', 'Include constant of integration'] },
    { s: 'AS1: Calculus', o: o++, t: 'Integrating Polynomials', d: 'Power rule for integration', obj: ['Apply ∫xⁿ dx = xⁿ⁺¹/(n+1) + c', 'Integrate polynomial functions', 'Find integration constant from conditions'] },
    { s: 'AS1: Calculus', o: o++, t: 'Definite Integration', d: 'Integration with limits', obj: ['Evaluate definite integrals', 'Apply fundamental theorem', 'Calculate [F(x)]ᵇₐ = F(b) - F(a)'] },
    { s: 'AS1: Calculus', o: o++, t: 'Area Under Curves', d: 'Using definite integration', obj: ['Calculate area under curve', 'Understand area as ∫f(x)dx', 'Handle areas below x-axis'] },
    { s: 'AS1: Calculus', o: o++, t: 'Area Between Curves', d: 'Integration for enclosed regions', obj: ['Find area between two curves', 'Calculate ∫[f(x)-g(x)]dx', 'Determine limits of integration'] },
    { s: 'AS1: Calculus', o: o++, t: 'Differential Equations', d: 'Solving dy/dx = f(x)', obj: ['Solve simple differential equations', 'Integrate to find general solution', 'Apply initial conditions'] }
  );
  
  // AS2: Applied Mathematics
  
  // 2.1 Mechanics - Kinematics (8 lessons)
  lessons.push(
    { s: 'AS2: Kinematics', o: o++, t: 'Displacement Velocity Acceleration', d: 'Definitions of motion quantities', obj: ['Define displacement as vector', 'Define velocity and speed', 'Define acceleration'] },
    { s: 'AS2: Kinematics', o: o++, t: 'Constant Acceleration Equations', d: 'SUVAT equations', obj: ['Apply v = u + at', 'Apply s = ut + ½at²', 'Apply v² = u² + 2as'] },
    { s: 'AS2: Kinematics', o: o++, t: 'Vertical Motion Under Gravity', d: 'Acceleration due to gravity', obj: ['Apply a = -g = -9.8 ms⁻²', 'Solve vertical motion problems', 'Find maximum height and time'] },
    { s: 'AS2: Kinematics', o: o++, t: 'Velocity-Time Graphs', d: 'Interpreting motion graphs', obj: ['Sketch velocity-time graphs', 'Find displacement as area under graph', 'Find acceleration as gradient'] },
    { s: 'AS2: Kinematics', o: o++, t: 'Displacement-Time Graphs', d: 'Position-time relationships', obj: ['Sketch displacement-time graphs', 'Find velocity as gradient', 'Interpret graph features'] },
    { s: 'AS2: Kinematics', o: o++, t: 'Variable Acceleration', d: 'Using calculus for motion', obj: ['Differentiate s to find v', 'Differentiate v to find a', 'Integrate a to find v'] },
    { s: 'AS2: Kinematics', o: o++, t: 'Projectile Motion Introduction', d: 'Two-dimensional motion', obj: ['Resolve into horizontal and vertical', 'Apply independence of motion', 'Use parametric equations'] },
    { s: 'AS2: Kinematics', o: o++, t: 'Vector Kinematics', d: 'Velocity and displacement vectors', obj: ['Express velocity as vector', 'Add velocity vectors', 'Find resultant velocity'] }
  );
  
  // 2.2 Mechanics - Forces and Newton\'s Laws (7 lessons)
  lessons.push(
    { s: 'AS2: Forces', o: o++, t: 'Forces as Vectors', d: 'Force representation', obj: ['Represent forces as vectors', 'Resolve forces into components', 'Calculate resultant force'] },
    { s: 'AS2: Forces', o: o++, t: 'Newton\'s First Law', d: 'Equilibrium and inertia', obj: ['State Newton First Law', 'Apply to equilibrium situations', 'Understand balanced forces'] },
    { s: 'AS2: Forces', o: o++, t: 'Newton\'s Second Law', d: 'F = ma', obj: ['State Newton Second Law F=ma', 'Calculate acceleration from force', 'Solve F=ma problems'] },
    { s: 'AS2: Forces', o: o++, t: 'Weight and Normal Reaction', d: 'Forces on surfaces', obj: ['Calculate weight W=mg', 'Identify normal reaction force', 'Apply to horizontal and inclined planes'] },
    { s: 'AS2: Forces', o: o++, t: 'Friction', d: 'Limiting friction', obj: ['Understand friction force', 'Apply F ≤ μR', 'Solve problems with friction'] },
    { s: 'AS2: Forces', o: o++, t: 'Connected Particles', d: 'Systems of particles', obj: ['Analyze connected particles', 'Find tension in strings', 'Solve pulley problems'] },
    { s: 'AS2: Forces', o: o++, t: 'Inclined Planes', d: 'Motion on slopes', obj: ['Resolve forces parallel and perpendicular', 'Calculate acceleration on slope', 'Apply F=ma on inclines'] }
  );
  
  // 2.3 Statistics (10 lessons)
  lessons.push(
    { s: 'AS2: Statistics', o: o++, t: 'Data Representation', d: 'Histograms stem-and-leaf', obj: ['Draw frequency histograms', 'Create stem-and-leaf diagrams', 'Construct cumulative frequency curves'] },
    { s: 'AS2: Statistics', o: o++, t: 'Measures of Location', d: 'Mean median mode', obj: ['Calculate mean from data', 'Find median and quartiles', 'Identify mode'] },
    { s: 'AS2: Statistics', o: o++, t: 'Measures of Spread', d: 'Range variance standard deviation', obj: ['Calculate range', 'Calculate variance and standard deviation', 'Interpret spread measures'] },
    { s: 'AS2: Statistics', o: o++, t: 'Box Plots', d: 'Five-number summary', obj: ['Construct box plots', 'Identify outliers', 'Compare distributions'] },
    { s: 'AS2: Statistics', o: o++, t: 'Probability Basics', d: 'Sample space and events', obj: ['Define probability P(A)', 'Use sample space diagrams', 'Calculate probabilities'] },
    { s: 'AS2: Statistics', o: o++, t: 'Probability Rules', d: 'Addition and multiplication', obj: ['Apply addition rule P(A∪B)', 'Apply multiplication rule P(A∩B)', 'Use for mutually exclusive and independent'] },
    { s: 'AS2: Statistics', o: o++, t: 'Conditional Probability', d: 'P(A|B)', obj: ['Define P(A|B) = P(A∩B)/P(B)', 'Use tree diagrams', 'Solve conditional probability problems'] },
    { s: 'AS2: Statistics', o: o++, t: 'Discrete Random Variables', d: 'Probability distributions', obj: ['Define discrete random variable', 'Find probability distribution', 'Calculate E(X) and Var(X)'] },
    { s: 'AS2: Statistics', o: o++, t: 'Binomial Distribution', d: 'B(n,p)', obj: ['Identify binomial situations', 'Use B(n,p) distribution', 'Calculate binomial probabilities'] },
    { s: 'AS2: Statistics', o: o++, t: 'Normal Distribution', d: 'N(μ,σ²)', obj: ['Understand normal distribution', 'Use standard normal tables', 'Standardize using Z=(X-μ)/σ'] }
  );
  
  return lessons;
}

function getMathematicsA2() {
  let o = 1;
  const lessons = [];
  
  // A2-1: Further Pure Mathematics
  
  // 3.1 Algebra (8 lessons)
  lessons.push(
    { s: 'A2-1: Algebra', o: o++, t: 'Proof by Induction', d: 'Mathematical induction', obj: ['Understand induction principle', 'Prove summation formulas', 'Prove divisibility statements'] },
    { s: 'A2-1: Algebra', o: o++, t: 'Partial Fractions', d: 'Decomposition of fractions', obj: ['Express as partial fractions', 'Handle linear factors', 'Handle repeated factors'] },
    { s: 'A2-1: Algebra', o: o++, t: 'Binomial Series', d: 'Expansion for any index', obj: ['Expand (1+x)ⁿ for any n', 'Find general term', 'Determine validity range'] },
    { s: 'A2-1: Algebra', o: o++, t: 'Polynomial Division', d: 'Dividing polynomials', obj: ['Divide polynomials', 'Apply factor theorem', 'Use remainder theorem'] },
    { s: 'A2-1: Algebra', o: o++, t: 'Factor and Remainder Theorem', d: 'Factorizing polynomials', obj: ['Apply factor theorem', 'Find roots of polynomials', 'Factorize completely'] },
    { s: 'A2-1: Algebra', o: o++, t: 'Exponential Functions', d: 'eˣ and properties', obj: ['Understand exponential function eˣ', 'Sketch exponential graphs', 'Solve exponential equations'] },
    { s: 'A2-1: Algebra', o: o++, t: 'Logarithms', d: 'Laws of logarithms', obj: ['Apply logarithm laws', 'Change base of logarithms', 'Solve logarithmic equations'] },
    { s: 'A2-1: Algebra', o: o++, t: 'Exponential and Log Graphs', d: 'Transformations and applications', obj: ['Sketch y=eˣ and y=ln x', 'Apply transformations', 'Model exponential growth/decay'] }
  );
  
  // 3.2 Trigonometry (7 lessons)
  lessons.push(
    { s: 'A2-1: Trigonometry', o: o++, t: 'Compound Angle Formulae', d: 'Addition formulae', obj: ['Apply sin(A±B) = sinA cosB ± cosA sinB', 'Apply cos(A±B) = cosA cosB ∓ sinA sinB', 'Use tan(A±B) formula'] },
    { s: 'A2-1: Trigonometry', o: o++, t: 'Double Angle Formulae', d: 'sin2A cos2A tan2A', obj: ['Apply sin2A = 2sinA cosA', 'Apply cos2A = cos²A - sin²A', 'Use multiple forms of cos2A'] },
    { s: 'A2-1: Trigonometry', o: o++, t: 'R-Formula', d: 'a cosθ + b sinθ = R cos(θ-α)', obj: ['Express in form R cos(θ-α)', 'Find R and α', 'Solve equations using R-formula'] },
    { s: 'A2-1: Trigonometry', o: o++, t: 'Trigonometric Equations Advanced', d: 'Solving with identities', obj: ['Use compound angle formulae', 'Apply double angle formulae', 'Solve complex trig equations'] },
    { s: 'A2-1: Trigonometry', o: o++, t: 'Trigonometric Identities Advanced', d: 'Proving identities', obj: ['Prove trigonometric identities', 'Use compound and double angle formulae', 'Simplify complex expressions'] },
    { s: 'A2-1: Trigonometry', o: o++, t: 'Inverse Trigonometric Functions', d: 'arcsin arccos arctan', obj: ['Define inverse trig functions', 'Evaluate inverse trig values', 'Understand restricted domains'] },
    { s: 'A2-1: Trigonometry', o: o++, t: 'Small Angle Approximations', d: 'Approximations for small θ', obj: ['Apply sinθ ≈ θ for small θ', 'Apply cosθ ≈ 1 - θ²/2', 'Use in problem solving'] }
  );
  
  // 3.3 Advanced Calculus (15 lessons)
  lessons.push(
    { s: 'A2-1: Calculus', o: o++, t: 'Chain Rule', d: 'Differentiating composite functions', obj: ['Apply chain rule dy/dx = dy/du × du/dx', 'Differentiate composite functions', 'Recognize function composition'] },
    { s: 'A2-1: Calculus', o: o++, t: 'Product Rule', d: 'Differentiating products', obj: ['Apply product rule d/dx(uv) = u dv/dx + v du/dx', 'Differentiate products', 'Simplify derivatives'] },
    { s: 'A2-1: Calculus', o: o++, t: 'Quotient Rule', d: 'Differentiating quotients', obj: ['Apply quotient rule d/dx(u/v)', 'Differentiate quotients', 'Simplify results'] },
    { s: 'A2-1: Calculus', o: o++, t: 'Exponential and Log Differentiation', d: 'Differentiating eˣ and ln x', obj: ['Apply d/dx(eˣ) = eˣ', 'Apply d/dx(ln x) = 1/x', 'Use chain rule with exponentials'] },
    { s: 'A2-1: Calculus', o: o++, t: 'Trigonometric Differentiation', d: 'Derivatives of sin cos tan', obj: ['Apply d/dx(sin x) = cos x', 'Apply d/dx(cos x) = -sin x', 'Apply d/dx(tan x) = sec²x'] },
    { s: 'A2-1: Calculus', o: o++, t: 'Implicit Differentiation', d: 'Differentiating implicit equations', obj: ['Differentiate implicitly', 'Find dy/dx from implicit equations', 'Apply to circles and curves'] },
    { s: 'A2-1: Calculus', o: o++, t: 'Parametric Differentiation', d: 'Curves defined parametrically', obj: ['Find dy/dx = (dy/dt)/(dx/dt)', 'Differentiate parametric equations', 'Find second derivatives'] },
    { s: 'A2-1: Calculus', o: o++, t: 'Second Derivatives Advanced', d: 'Concavity and inflection', obj: ['Find points of inflection', 'Determine concavity', 'Apply d²y/dx² = 0'] },
    { s: 'A2-1: Calculus', o: o++, t: 'Integration by Substitution', d: 'Change of variable', obj: ['Choose appropriate substitution', 'Apply substitution method', 'Change limits for definite integrals'] },
    { s: 'A2-1: Calculus', o: o++, t: 'Integration by Parts', d: '∫u dv/dx dx = uv - ∫v du/dx dx', obj: ['Apply integration by parts formula', 'Choose u and dv appropriately', 'Integrate products'] },
    { s: 'A2-1: Calculus', o: o++, t: 'Integrating Trigonometric Functions', d: 'Standard trig integrals', obj: ['Integrate sin x cos x tan x', 'Use trig identities', 'Apply double angle formulae'] },
    { s: 'A2-1: Calculus', o: o++, t: 'Integrating Exponential Functions', d: 'eˣ and 1/x', obj: ['Integrate eˣ', 'Integrate 1/x to get ln|x|', 'Apply chain rule in reverse'] },
    { s: 'A2-1: Calculus', o: o++, t: 'Volumes of Revolution', d: 'Rotating regions about axes', obj: ['Calculate volume π∫y² dx', 'Rotate about x-axis', 'Apply to curves'] },
    { s: 'A2-1: Calculus', o: o++, t: 'Differential Equations Advanced', d: 'Separable variables', obj: ['Solve by separating variables', 'Find general and particular solutions', 'Model with differential equations'] },
    { s: 'A2-1: Calculus', o: o++, t: 'Numerical Methods', d: 'Iterative and approximation methods', obj: ['Apply Newton-Raphson method', 'Use trapezium rule for integration', 'Estimate errors'] }
  );
  
  // 3.4 Vectors (7 lessons)
  lessons.push(
    { s: 'A2-1: Vectors', o: o++, t: 'Vector Notation', d: '2D and 3D vectors', obj: ['Represent vectors in component form', 'Use i j k notation', 'Calculate magnitude |r|'] },
    { s: 'A2-1: Vectors', o: o++, t: 'Vector Operations', d: 'Addition and scalar multiplication', obj: ['Add and subtract vectors', 'Multiply by scalars', 'Find unit vectors'] },
    { s: 'A2-1: Vectors', o: o++, t: 'Position Vectors', d: 'Points and displacements', obj: ['Use position vectors', 'Find displacement vectors', 'Apply to geometry problems'] },
    { s: 'A2-1: Vectors', o: o++, t: 'Scalar Product', d: 'Dot product a·b', obj: ['Calculate scalar product a·b', 'Use a·b = |a||b|cosθ', 'Find angle between vectors'] },
    { s: 'A2-1: Vectors', o: o++, t: 'Vector Equation of Line', d: 'r = a + λb', obj: ['Write vector line equation', 'Find vector equation from points', 'Determine if point on line'] },
    { s: 'A2-1: Vectors', o: o++, t: 'Intersection of Lines', d: 'Finding where lines meet', obj: ['Find intersection point', 'Determine if lines intersect', 'Find distance between parallel lines'] },
    { s: 'A2-1: Vectors', o: o++, t: 'Vector Applications', d: 'Geometry with vectors', obj: ['Prove geometric results', 'Find perpendicular vectors', 'Apply to 3D geometry'] }
  );
  
  // A2-2: Further Applied Mathematics
  
  // 4.1 Advanced Mechanics (8 lessons)
  lessons.push(
    { s: 'A2-2: Mechanics', o: o++, t: 'Projectile Motion', d: 'Parabolic trajectories', obj: ['Resolve motion horizontally and vertically', 'Find range time of flight max height', 'Derive trajectory equation'] },
    { s: 'A2-2: Mechanics', o: o++, t: 'Work Energy Power', d: 'Energy conservation', obj: ['Calculate work done W=Fs cosθ', 'Apply kinetic energy KE=½mv²', 'Use work-energy principle'] },
    { s: 'A2-2: Mechanics', o: o++, t: 'Power', d: 'Rate of doing work', obj: ['Calculate power P=Fv', 'Apply P=W/t', 'Solve power problems'] },
    { s: 'A2-2: Mechanics', o: o++, t: 'Momentum', d: 'Linear momentum', obj: ['Calculate momentum p=mv', 'Apply conservation of momentum', 'Solve collision problems'] },
    { s: 'A2-2: Mechanics', o: o++, t: 'Impulse', d: 'Change in momentum', obj: ['Calculate impulse I=Δ(mv)', 'Apply impulse-momentum theorem', 'Use I=Ft'] },
    { s: 'A2-2: Mechanics', o: o++, t: 'Elastic Collisions', d: 'Newton\'s law of restitution', obj: ['Apply coefficient of restitution e', 'Use e = speed of separation / speed of approach', 'Solve elastic collision problems'] },
    { s: 'A2-2: Mechanics', o: o++, t: 'Moments', d: 'Turning effects of forces', obj: ['Calculate moment = force × perpendicular distance', 'Apply principle of moments', 'Solve equilibrium problems'] },
    { s: 'A2-2: Mechanics', o: o++, t: 'Centre of Mass', d: 'Balance point', obj: ['Find centre of mass of system', 'Apply to composite shapes', 'Use symmetry'] }
  );
  
  // 4.2 Advanced Statistics (10 lessons)
  lessons.push(
    { s: 'A2-2: Statistics', o: o++, t: 'Sampling Methods', d: 'Simple random systematic stratified', obj: ['Understand different sampling methods', 'Apply stratified sampling', 'Evaluate sampling techniques'] },
    { s: 'A2-2: Statistics', o: o++, t: 'Hypothesis Testing', d: 'Testing claims about populations', obj: ['Formulate null and alternative hypotheses', 'Understand significance level', 'Conduct hypothesis tests'] },
    { s: 'A2-2: Statistics', o: o++, t: 'One-tail and Two-tail Tests', d: 'Direction of hypothesis', obj: ['Distinguish one-tail and two-tail tests', 'Choose appropriate test', 'Interpret results'] },
    { s: 'A2-2: Statistics', o: o++, t: 'Binomial Hypothesis Test', d: 'Testing binomial parameter', obj: ['Test hypothesis about binomial p', 'Calculate p-value', 'Make statistical conclusion'] },
    { s: 'A2-2: Statistics', o: o++, t: 'Normal Approximation to Binomial', d: 'Using normal for large n', obj: ['Apply continuity correction', 'Approximate B(n,p) by N(np, np(1-p))', 'Solve problems using approximation'] },
    { s: 'A2-2: Statistics', o: o++, t: 'Correlation', d: 'Measuring linear association', obj: ['Calculate product moment correlation coefficient', 'Interpret correlation values', 'Understand correlation vs causation'] },
    { s: 'A2-2: Statistics', o: o++, t: 'Linear Regression', d: 'Least squares line', obj: ['Find regression line y on x', 'Use y = a + bx', 'Make predictions'] },
    { s: 'A2-2: Statistics', o: o++, t: 'Poisson Distribution', d: 'Rare events model', obj: ['Identify Poisson situations', 'Use Po(λ) distribution', 'Calculate Poisson probabilities'] },
    { s: 'A2-2: Statistics', o: o++, t: 'Continuous Random Variables', d: 'Probability density functions', obj: ['Understand probability density function', 'Calculate probabilities using integration', 'Find E(X) and Var(X)'] },
    { s: 'A2-2: Statistics', o: o++, t: 'Statistical Distributions Summary', d: 'Choosing appropriate distribution', obj: ['Identify situation types', 'Select appropriate distribution', 'Apply to real-world problems'] }
  );
  
  return lessons;
}