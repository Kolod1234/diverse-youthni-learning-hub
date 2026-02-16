import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Check if courses exist, create if not
    let courses = await base44.asServiceRole.entities.Course.filter({
      qualification_type: 'alevel',
      category: 'further_mathematics'
    });

    if (courses.length === 0) {
      // Create the courses
      const asData = {
        title: 'A-Level Further Mathematics AS',
        description: 'CCEA A-Level Further Mathematics AS - Complex numbers matrices proof advanced algebra',
        instructor: 'DYNI Academic Team',
        instructor_avatar: 'https://ui-avatars.com/api/?name=DYNI&background=2563eb&color=fff',
        thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
        qualification_type: 'alevel',
        alevel_stage: 'as',
        category: 'further_mathematics',
        level: 'advanced',
        duration_hours: 120,
        price: 0,
        is_featured: true,
        exam_board: 'CCEA'
      };

      const a2Data = {
        title: 'A-Level Further Mathematics A2',
        description: 'CCEA A-Level Further Mathematics A2 - Differential equations numerical methods advanced mechanics',
        instructor: 'DYNI Academic Team',
        instructor_avatar: 'https://ui-avatars.com/api/?name=DYNI&background=2563eb&color=fff',
        thumbnail: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
        qualification_type: 'alevel',
        alevel_stage: 'a2',
        category: 'further_mathematics',
        level: 'advanced',
        duration_hours: 180,
        price: 0,
        is_featured: true,
        exam_board: 'CCEA'
      };

      await base44.asServiceRole.entities.Course.bulkCreate([asData, a2Data]);
      
      courses = await base44.asServiceRole.entities.Course.filter({
        qualification_type: 'alevel',
        category: 'further_mathematics'
      });
    }

    const results = [];
    
    for (const course of courses) {
      try {
        const lessons = course.alevel_stage === 'as' ? getFurtherMathematicsAS() : getFurtherMathematicsA2();
        
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
          duration_minutes: 50
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

function getFurtherMathematicsAS() {
  let o = 1;
  const lessons = [];
  
  // AS1: Further Pure Mathematics
  
  // 1.1 Complex Numbers (10 lessons)
  lessons.push(
    { s: 'AS1: Complex Numbers', o: o++, t: 'Introduction to Complex Numbers', d: 'Imaginary unit and complex form', obj: ['Define imaginary unit i', 'Express complex numbers a+bi form', 'Understand real and imaginary parts'] },
    { s: 'AS1: Complex Numbers', o: o++, t: 'Complex Arithmetic', d: 'Operations with complex numbers', obj: ['Add subtract complex numbers', 'Multiply complex numbers', 'Understand FOIL method for complex multiplication'] },
    { s: 'AS1: Complex Numbers', o: o++, t: 'Complex Conjugates', d: 'Conjugate pairs and properties', obj: ['Find complex conjugate', 'Multiply by conjugate', 'Understand conjugate properties'] },
    { s: 'AS1: Complex Numbers', o: o++, t: 'Division of Complex Numbers', d: 'Rationalizing denominators', obj: ['Divide complex numbers', 'Rationalize complex denominators', 'Express in standard form'] },
    { s: 'AS1: Complex Numbers', o: o++, t: 'Modulus and Argument', d: 'Polar representation', obj: ['Calculate modulus |z|', 'Find argument arg(z)', 'Convert Cartesian to polar'] },
    { s: 'AS1: Complex Numbers', o: o++, t: 'Argand Diagrams', d: 'Geometric representation', obj: ['Plot complex numbers on Argand diagram', 'Understand geometric operations', 'Interpret loci in complex plane'] },
    { s: 'AS1: Complex Numbers', o: o++, t: 'Polar Form', d: 'r(cos θ + i sin θ) notation', obj: ['Express in polar form', 'Convert between forms', 'Understand modulus-argument form'] },
    { s: 'AS1: Complex Numbers', o: o++, t: 'De Moivre\'s Theorem', d: 'Powers of complex numbers', obj: ['Apply De Moivre\'s theorem', 'Calculate powers of complex numbers', 'Solve equations using theorem'] },
    { s: 'AS1: Complex Numbers', o: o++, t: 'Complex Roots', d: 'nth roots of complex numbers', obj: ['Find nth roots', 'Represent roots on Argand diagram', 'Understand roots of unity'] },
    { s: 'AS1: Complex Numbers', o: o++, t: 'Loci in Complex Plane', d: 'Geometric regions', obj: ['Interpret |z-a| = r', 'Sketch loci |z-a| = |z-b|', 'Understand arg(z-a) conditions'] }
  );
  
  // 1.2 Matrices (12 lessons)
  lessons.push(
    { s: 'AS1: Matrices', o: o++, t: 'Matrix Notation', d: 'Introduction to matrices', obj: ['Define matrix terminology', 'Identify order of matrices', 'Understand element notation aij'] },
    { s: 'AS1: Matrices', o: o++, t: 'Matrix Addition and Subtraction', d: 'Combining matrices', obj: ['Add matrices', 'Subtract matrices', 'Understand order requirements'] },
    { s: 'AS1: Matrices', o: o++, t: 'Scalar Multiplication', d: 'Multiplying by scalars', obj: ['Multiply matrix by scalar', 'Apply distributive property', 'Understand scalar multiplication properties'] },
    { s: 'AS1: Matrices', o: o++, t: 'Matrix Multiplication', d: 'Product of matrices', obj: ['Multiply compatible matrices', 'Understand row-column method', 'Check order compatibility'] },
    { s: 'AS1: Matrices', o: o++, t: 'Identity and Zero Matrices', d: 'Special matrices', obj: ['Define identity matrix I', 'Understand zero matrix', 'Apply identity property AI = IA = A'] },
    { s: 'AS1: Matrices', o: o++, t: 'Matrix Algebra Properties', d: 'Laws of matrix operations', obj: ['Understand associative law', 'Apply distributive law', 'Recognize non-commutative multiplication'] },
    { s: 'AS1: Matrices', o: o++, t: 'Determinants 2×2', d: 'Calculating determinants', obj: ['Calculate 2×2 determinant', 'Understand ad-bc formula', 'Interpret determinant meaning'] },
    { s: 'AS1: Matrices', o: o++, t: 'Determinants 3×3', d: 'Larger determinants', obj: ['Calculate 3×3 determinant', 'Use cofactor expansion', 'Apply rule of Sarrus'] },
    { s: 'AS1: Matrices', o: o++, t: 'Matrix Inverses', d: 'Finding inverse matrices', obj: ['Calculate 2×2 inverse', 'Use adjugate method', 'Check AA⁻¹ = I'] },
    { s: 'AS1: Matrices', o: o++, t: 'Solving Matrix Equations', d: 'AX = B systems', obj: ['Solve matrix equations', 'Use inverse matrices', 'Apply to linear systems'] },
    { s: 'AS1: Matrices', o: o++, t: 'Transformations', d: 'Geometric transformations', obj: ['Represent transformations as matrices', 'Combine transformations', 'Understand rotation reflection matrices'] },
    { s: 'AS1: Matrices', o: o++, t: 'Applications of Matrices', d: 'Real-world problems', obj: ['Model situations with matrices', 'Solve applied problems', 'Interpret matrix solutions'] }
  );
  
  // 1.3 Proof (8 lessons)
  lessons.push(
    { s: 'AS1: Proof', o: o++, t: 'Direct Proof', d: 'Proving statements directly', obj: ['Construct direct proofs', 'Use logical steps', 'Prove algebraic results'] },
    { s: 'AS1: Proof', o: o++, t: 'Proof by Contradiction', d: 'Reductio ad absurdum', obj: ['Assume negation', 'Derive contradiction', 'Conclude original statement true'] },
    { s: 'AS1: Proof', o: o++, t: 'Proof by Counterexample', d: 'Disproving statements', obj: ['Find counterexamples', 'Disprove universal statements', 'Understand sufficiency of one example'] },
    { s: 'AS1: Proof', o: o++, t: 'Mathematical Induction', d: 'Proving for all n', obj: ['Prove base case', 'Assume for n=k', 'Prove for n=k+1'] },
    { s: 'AS1: Proof', o: o++, t: 'Induction Summation', d: 'Sum formulas by induction', obj: ['Prove summation formulas', 'Apply induction technique', 'Verify series results'] },
    { s: 'AS1: Proof', o: o++, t: 'Induction Divisibility', d: 'Proving divisibility', obj: ['Prove divisibility statements', 'Use induction for integers', 'Apply modular arithmetic'] },
    { s: 'AS1: Proof', o: o++, t: 'Proof by Exhaustion', d: 'Checking all cases', obj: ['Identify finite cases', 'Verify each case', 'Conclude general result'] },
    { s: 'AS1: Proof', o: o++, t: 'Algebraic Proof', d: 'Proving identities', obj: ['Prove algebraic identities', 'Manipulate expressions', 'Apply algebraic techniques'] }
  );
  
  // 1.4 Advanced Algebra (10 lessons)
  lessons.push(
    { s: 'AS1: Advanced Algebra', o: o++, t: 'Polynomial Division', d: 'Long division and synthetic', obj: ['Perform polynomial long division', 'Use synthetic division', 'Apply remainder theorem'] },
    { s: 'AS1: Advanced Algebra', o: o++, t: 'Factor Theorem', d: 'Finding factors', obj: ['Apply factor theorem', 'Find polynomial factors', 'Use f(a)=0 condition'] },
    { s: 'AS1: Advanced Algebra', o: o++, t: 'Cubic and Quartic Equations', d: 'Higher degree equations', obj: ['Solve cubic equations', 'Factor quartic expressions', 'Apply techniques to higher degree'] },
    { s: 'AS1: Advanced Algebra', o: o++, t: 'Partial Fractions Type 1', d: 'Distinct linear factors', obj: ['Decompose into partial fractions', 'Find constants A B C', 'Apply to distinct denominators'] },
    { s: 'AS1: Advanced Algebra', o: o++, t: 'Partial Fractions Type 2', d: 'Repeated linear factors', obj: ['Handle repeated factors', 'Use A/(x-a) + B/(x-a)²', 'Solve for constants'] },
    { s: 'AS1: Advanced Algebra', o: o++, t: 'Partial Fractions Type 3', d: 'Quadratic factors', obj: ['Decompose with quadratic denominators', 'Use Ax+B over quadratic', 'Apply to irreducible quadratics'] },
    { s: 'AS1: Advanced Algebra', o: o++, t: 'Binomial Theorem Extended', d: 'Negative and fractional indices', obj: ['Expand (1+x)ⁿ for rational n', 'Apply to negative powers', 'Find valid range'] },
    { s: 'AS1: Advanced Algebra', o: o++, t: 'Series Expansions', d: 'Using binomial expansion', obj: ['Expand rational functions', 'Find series approximations', 'Apply to algebraic fractions'] },
    { s: 'AS1: Advanced Algebra', o: o++, t: 'Inequalities Advanced', d: 'Rational and modulus inequalities', obj: ['Solve rational inequalities', 'Handle modulus inequalities', 'Use critical point method'] },
    { s: 'AS1: Advanced Algebra', o: o++, t: 'Systems of Equations', d: 'Solving multiple equations', obj: ['Solve non-linear systems', 'Use substitution and elimination', 'Apply to simultaneous equations'] }
  );
  
  return lessons;
}

function getFurtherMathematicsA2() {
  let o = 1;
  const lessons = [];
  
  // A2-1: Further Pure Mathematics
  
  // 2.1 Differential Equations (12 lessons)
  lessons.push(
    { s: 'A2-1: Differential Equations', o: o++, t: 'Introduction to DEs', d: 'Order and degree', obj: ['Classify differential equations', 'Identify order and degree', 'Understand solution types'] },
    { s: 'A2-1: Differential Equations', o: o++, t: 'Separable Variables', d: 'dy/dx = f(x)g(y)', obj: ['Separate variables', 'Integrate both sides', 'Find general solution'] },
    { s: 'A2-1: Differential Equations', o: o++, t: 'Initial Value Problems', d: 'Finding particular solutions', obj: ['Apply initial conditions', 'Find particular solution', 'Solve boundary value problems'] },
    { s: 'A2-1: Differential Equations', o: o++, t: 'First Order Linear', d: 'dy/dx + Py = Q', obj: ['Identify linear form', 'Use integrating factor', 'Solve linear DEs'] },
    { s: 'A2-1: Differential Equations', o: o++, t: 'Integrating Factor Method', d: 'μ(x) = e∫P dx', obj: ['Calculate integrating factor', 'Multiply through equation', 'Integrate to solve'] },
    { s: 'A2-1: Differential Equations', o: o++, t: 'Second Order Homogeneous', d: 'ay\'\' + by\' + cy = 0', obj: ['Find auxiliary equation', 'Solve for roots', 'Write general solution'] },
    { s: 'A2-1: Differential Equations', o: o++, t: 'Distinct Real Roots', d: 'Two different roots', obj: ['Apply m₁ ≠ m₂ case', 'Write y = Ae^(m₁x) + Be^(m₂x)', 'Find constants from conditions'] },
    { s: 'A2-1: Differential Equations', o: o++, t: 'Repeated Roots', d: 'Equal auxiliary roots', obj: ['Apply m₁ = m₂ case', 'Write y = (A + Bx)e^(mx)', 'Understand repeated root form'] },
    { s: 'A2-1: Differential Equations', o: o++, t: 'Complex Roots', d: 'α ± βi roots', obj: ['Apply complex root case', 'Write y = e^(αx)(A cos βx + B sin βx)', 'Understand oscillatory solutions'] },
    { s: 'A2-1: Differential Equations', o: o++, t: 'Non-Homogeneous DEs', d: 'ay\'\' + by\' + cy = f(x)', obj: ['Find complementary function', 'Find particular integral', 'Combine CF + PI'] },
    { s: 'A2-1: Differential Equations', o: o++, t: 'Particular Integrals', d: 'Trial solutions', obj: ['Choose trial function', 'Substitute and solve', 'Handle different f(x) types'] },
    { s: 'A2-1: Differential Equations', o: o++, t: 'Applications of DEs', d: 'Modeling real situations', obj: ['Model with differential equations', 'Solve applied problems', 'Interpret solutions'] }
  );
  
  // 2.2 Numerical Methods (10 lessons)
  lessons.push(
    { s: 'A2-1: Numerical Methods', o: o++, t: 'Iteration Methods', d: 'Fixed point iteration', obj: ['Rearrange to x = g(x) form', 'Apply iteration formula', 'Check convergence'] },
    { s: 'A2-1: Numerical Methods', o: o++, t: 'Newton-Raphson Method', d: 'Fast root finding', obj: ['Apply x_{n+1} = x_n - f(x_n)/f\'(x_n)', 'Iterate to convergence', 'Understand failure cases'] },
    { s: 'A2-1: Numerical Methods', o: o++, t: 'Bisection Method', d: 'Interval halving', obj: ['Check sign change', 'Bisect interval', 'Continue to required accuracy'] },
    { s: 'A2-1: Numerical Methods', o: o++, t: 'Numerical Integration', d: 'Approximating integrals', obj: ['Apply trapezium rule', 'Use Simpson\'s rule', 'Estimate errors'] },
    { s: 'A2-1: Numerical Methods', o: o++, t: 'Trapezium Rule', d: 'Linear approximation', obj: ['Apply trapezium formula', 'Calculate with multiple strips', 'Improve accuracy'] },
    { s: 'A2-1: Numerical Methods', o: o++, t: 'Simpson\'s Rule', d: 'Quadratic approximation', obj: ['Apply Simpson\'s formula', 'Use even number of strips', 'Compare to trapezium'] },
    { s: 'A2-1: Numerical Methods', o: o++, t: 'Euler\'s Method', d: 'Solving DEs numerically', obj: ['Apply Euler formula', 'Step through iterations', 'Understand accumulation of error'] },
    { s: 'A2-1: Numerical Methods', o: o++, t: 'Improved Euler', d: 'Better DE approximation', obj: ['Apply predictor-corrector', 'Compare to basic Euler', 'Reduce error'] },
    { s: 'A2-1: Numerical Methods', o: o++, t: 'Error Analysis', d: 'Understanding accuracy', obj: ['Calculate truncation error', 'Understand rounding error', 'Improve precision'] },
    { s: 'A2-1: Numerical Methods', o: o++, t: 'Numerical Applications', d: 'Solving complex problems', obj: ['Apply multiple methods', 'Choose appropriate technique', 'Verify solutions'] }
  );
  
  // 2.3 Advanced Mechanics (12 lessons)
  lessons.push(
    { s: 'A2-1: Advanced Mechanics', o: o++, t: 'Variable Acceleration', d: 'a as function of v or x', obj: ['Use a = dv/dt = v dv/dx', 'Integrate variable acceleration', 'Solve motion problems'] },
    { s: 'A2-1: Advanced Mechanics', o: o++, t: 'Simple Harmonic Motion', d: 'a = -ω²x', obj: ['Define SHM conditions', 'Apply a = -ω²x', 'Understand period and amplitude'] },
    { s: 'A2-1: Advanced Mechanics', o: o++, t: 'SHM Solutions', d: 'x = A sin(ωt + φ)', obj: ['Write general solution', 'Find constants from conditions', 'Calculate period T = 2π/ω'] },
    { s: 'A2-1: Advanced Mechanics', o: o++, t: 'SHM Velocity and Energy', d: 'v and energy in SHM', obj: ['Find v = ω√(A² - x²)', 'Calculate kinetic potential energy', 'Apply energy conservation'] },
    { s: 'A2-1: Advanced Mechanics', o: o++, t: 'Moments and Couples', d: 'Turning effects', obj: ['Calculate moment = Fd', 'Define couple', 'Apply principle of moments'] },
    { s: 'A2-1: Advanced Mechanics', o: o++, t: 'Equilibrium of Rigid Bodies', d: 'Static equilibrium', obj: ['Apply ΣF = 0 and Στ = 0', 'Solve equilibrium problems', 'Find reaction forces'] },
    { s: 'A2-1: Advanced Mechanics', o: o++, t: 'Centre of Mass', d: 'Finding COM', obj: ['Calculate COM of systems', 'Use symmetry', 'Apply to composite bodies'] },
    { s: 'A2-1: Advanced Mechanics', o: o++, t: 'Toppling and Sliding', d: 'Stability conditions', obj: ['Analyze toppling conditions', 'Compare friction and toppling', 'Determine stability'] },
    { s: 'A2-1: Advanced Mechanics', o: o++, t: 'Circular Motion Dynamics', d: 'Forces in circular motion', obj: ['Apply F = mv²/r', 'Analyze vertical circles', 'Understand tension and normal force'] },
    { s: 'A2-1: Advanced Mechanics', o: o++, t: 'Conical Pendulum', d: 'Motion in horizontal circle', obj: ['Resolve forces in conical pendulum', 'Find period and tension', 'Apply circular motion principles'] },
    { s: 'A2-1: Advanced Mechanics', o: o++, t: 'Banked Tracks', d: 'Tilted circular motion', obj: ['Analyze forces on banked curves', 'Calculate optimum angle', 'Apply to road/track problems'] },
    { s: 'A2-1: Advanced Mechanics', o: o++, t: 'Work Energy Power', d: 'Advanced energy concepts', obj: ['Calculate work in variable force', 'Apply work-energy theorem', 'Solve power problems'] }
  );
  
  // 2.4 Hyperbolic Functions (8 lessons)
  lessons.push(
    { s: 'A2-1: Hyperbolic Functions', o: o++, t: 'Definitions of sinh cosh tanh', d: 'Exponential definitions', obj: ['Define sinh x = (eˣ - e⁻ˣ)/2', 'Define cosh x = (eˣ + e⁻ˣ)/2', 'Define tanh x = sinh x / cosh x'] },
    { s: 'A2-1: Hyperbolic Functions', o: o++, t: 'Hyperbolic Identities', d: 'Key relationships', obj: ['Prove cosh²x - sinh²x = 1', 'Derive other identities', 'Apply Osborn\'s rule'] },
    { s: 'A2-1: Hyperbolic Functions', o: o++, t: 'Graphs of Hyperbolic Functions', d: 'Sketching curves', obj: ['Sketch y = sinh x', 'Sketch y = cosh x', 'Understand catenary shape'] },
    { s: 'A2-1: Hyperbolic Functions', o: o++, t: 'Inverse Hyperbolic Functions', d: 'arsinh arcosh artanh', obj: ['Define inverse functions', 'Express as logarithms', 'Find domains and ranges'] },
    { s: 'A2-1: Hyperbolic Functions', o: o++, t: 'Differentiating Hyperbolic', d: 'Derivatives of sinh cosh tanh', obj: ['Find d/dx(sinh x) = cosh x', 'Find d/dx(cosh x) = sinh x', 'Differentiate compositions'] },
    { s: 'A2-1: Hyperbolic Functions', o: o++, t: 'Integrating Hyperbolic', d: 'Antiderivatives', obj: ['Integrate sinh cosh functions', 'Apply substitutions', 'Solve hyperbolic integrals'] },
    { s: 'A2-1: Hyperbolic Functions', o: o++, t: 'Solving Hyperbolic Equations', d: 'Algebraic solutions', obj: ['Solve equations with hyperbolic functions', 'Use identities', 'Convert to exponential form'] },
    { s: 'A2-1: Hyperbolic Functions', o: o++, t: 'Applications', d: 'Real-world uses', obj: ['Model catenary cables', 'Apply to engineering problems', 'Understand physical significance'] }
  );
  
  return lessons;
}