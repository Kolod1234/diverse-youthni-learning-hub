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
      category: 'chemistry'
    });

    const results = [];
    
    for (const course of courses) {
      try {
        const lessons = course.alevel_stage === 'as' ? getChemistryAS() : getChemistryA2();
        
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
          duration_minutes: 45
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

function getChemistryAS() {
  let o = 1;
  const lessons = [];
  
  // AS1: Basic Concepts in Physical and Inorganic Chemistry
  
  // 1.1 Atomic Structure (8 lessons)
  lessons.push(
    { s: 'AS1: Atomic Structure', o: o++, t: 'Atoms and Isotopes', d: 'Fundamental particles and isotopes', obj: ['Define protons neutrons electrons', 'Explain isotopes and relative atomic mass', 'Calculate relative atomic mass'] },
    { s: 'AS1: Atomic Structure', o: o++, t: 'Mass Spectrometry', d: 'Mass spectrometer principles', obj: ['Describe mass spectrometer operation', 'Interpret mass spectra', 'Calculate isotopic abundances'] },
    { s: 'AS1: Atomic Structure', o: o++, t: 'Electronic Structure', d: 'Electron configuration', obj: ['Describe atomic orbitals s p d', 'Write electron configurations', 'Explain ionization energy patterns'] },
    { s: 'AS1: Atomic Structure', o: o++, t: 'Ionisation Energy', d: 'Successive ionisation energies', obj: ['Define ionization energy', 'Explain trends across periods', 'Predict electron configurations from IE data'] },
    { s: 'AS1: Atomic Structure', o: o++, t: 'Emission Spectra', d: 'Atomic spectra and energy levels', obj: ['Explain line emission spectra', 'Relate spectra to electron transitions', 'Understand quantum energy levels'] },
    { s: 'AS1: Atomic Structure', o: o++, t: 'Quantum Numbers', d: 'Describing electron states', obj: ['Define quantum numbers n l m s', 'Apply Pauli exclusion principle', 'Understand orbital shapes'] },
    { s: 'AS1: Atomic Structure', o: o++, t: 'Periodic Trends', d: 'Patterns in periodic table', obj: ['Explain atomic radius trends', 'Describe electronegativity patterns', 'Understand ionization energy trends'] },
    { s: 'AS1: Atomic Structure', o: o++, t: 'Chemical Periodicity', d: 'Group and period trends', obj: ['Compare group properties', 'Analyze period trends', 'Predict element properties'] }
  );
  
  // 1.2 Bonding (10 lessons)
  lessons.push(
    { s: 'AS1: Bonding', o: o++, t: 'Ionic Bonding', d: 'Formation and properties of ionic compounds', obj: ['Explain ionic bond formation', 'Describe lattice structure', 'Relate structure to properties'] },
    { s: 'AS1: Bonding', o: o++, t: 'Covalent Bonding', d: 'Electron pair sharing', obj: ['Explain covalent bond formation', 'Draw Lewis structures', 'Understand multiple bonds'] },
    { s: 'AS1: Bonding', o: o++, t: 'Metallic Bonding', d: 'Electron sea model', obj: ['Describe metallic bonding', 'Explain metallic properties', 'Understand conductivity'] },
    { s: 'AS1: Bonding', o: o++, t: 'Shapes of Molecules', d: 'VSEPR theory', obj: ['Apply VSEPR theory', 'Predict molecular shapes', 'Explain bond angles'] },
    { s: 'AS1: Bonding', o: o++, t: 'Polarity and Intermolecular Forces', d: 'Dipoles and forces between molecules', obj: ['Explain electronegativity and polarity', 'Describe van der Waals forces', 'Understand hydrogen bonding'] },
    { s: 'AS1: Bonding', o: o++, t: 'Properties of Materials', d: 'Structure and properties relationship', obj: ['Relate bonding to melting points', 'Explain solubility patterns', 'Understand conductivity'] },
    { s: 'AS1: Bonding', o: o++, t: 'Giant Structures', d: 'Covalent network solids', obj: ['Describe diamond graphite structure', 'Explain silicon dioxide structure', 'Relate structure to properties'] },
    { s: 'AS1: Bonding', o: o++, t: 'Molecular Structures', d: 'Simple molecular substances', obj: ['Describe molecular solids', 'Explain volatility patterns', 'Understand intermolecular forces effects'] },
    { s: 'AS1: Bonding', o: o++, t: 'Dative Covalent Bonding', d: 'Coordinate bonds', obj: ['Explain dative bonding', 'Identify coordinate bonds', 'Apply to complex ions'] },
    { s: 'AS1: Bonding', o: o++, t: 'Bonding Summary', d: 'Comparing bond types', obj: ['Compare ionic covalent metallic', 'Predict properties from bonding', 'Apply bonding concepts'] }
  );
  
  // 1.3 Periodicity (6 lessons)
  lessons.push(
    { s: 'AS1: Periodicity', o: o++, t: 'Periodic Table Structure', d: 'Organization of elements', obj: ['Explain period group structure', 'Identify s p d blocks', 'Understand periodic law'] },
    { s: 'AS1: Periodicity', o: o++, t: 'Period 3 Elements', d: 'Properties across period 3', obj: ['Describe Na to Ar trends', 'Explain property variations', 'Understand metallic to non-metallic'] },
    { s: 'AS1: Periodicity', o: o++, t: 'Period 3 Oxides', d: 'Oxide properties and reactions', obj: ['Describe oxide structures', 'Explain acid-base character', 'Understand oxide reactions'] },
    { s: 'AS1: Periodicity', o: o++, t: 'Period 3 Chlorides', d: 'Chloride properties', obj: ['Describe chloride bonding', 'Explain hydrolysis reactions', 'Understand pH of solutions'] },
    { s: 'AS1: Periodicity', o: o++, t: 'Group 2 Elements', d: 'Alkaline earth metals', obj: ['Describe Group 2 trends', 'Explain reactivity patterns', 'Understand compound properties'] },
    { s: 'AS1: Periodicity', o: o++, t: 'Group 7 Elements', d: 'Halogens', obj: ['Describe halogen trends', 'Explain reactivity patterns', 'Understand displacement reactions'] }
  );
  
  // 1.4 Energetics (7 lessons)
  lessons.push(
    { s: 'AS1: Energetics', o: o++, t: 'Enthalpy Changes', d: 'Heat energy in reactions', obj: ['Define enthalpy change', 'Distinguish exothermic endothermic', 'Understand standard conditions'] },
    { s: 'AS1: Energetics', o: o++, t: 'Calorimetry', d: 'Measuring enthalpy changes', obj: ['Perform calorimetry experiments', 'Calculate enthalpy changes', 'Evaluate experimental accuracy'] },
    { s: 'AS1: Energetics', o: o++, t: 'Hess\'s Law', d: 'Indirect enthalpy determination', obj: ['State Hess Law', 'Construct energy cycles', 'Calculate enthalpy changes'] },
    { s: 'AS1: Energetics', o: o++, t: 'Bond Enthalpies', d: 'Bond breaking and making', obj: ['Define bond enthalpy', 'Calculate reaction enthalpies', 'Understand mean bond enthalpies'] },
    { s: 'AS1: Energetics', o: o++, t: 'Born-Haber Cycles', d: 'Ionic compound formation', obj: ['Construct Born-Haber cycles', 'Calculate lattice enthalpies', 'Understand enthalpy terms'] },
    { s: 'AS1: Energetics', o: o++, t: 'Enthalpy of Solution', d: 'Dissolving processes', obj: ['Explain enthalpy of solution', 'Understand hydration enthalpy', 'Construct solution cycles'] },
    { s: 'AS1: Energetics', o: o++, t: 'Entropy and Free Energy', d: 'Spontaneity of reactions', obj: ['Define entropy', 'Explain Gibbs free energy', 'Predict reaction spontaneity'] }
  );
  
  // 1.5 Kinetics (5 lessons)
  lessons.push(
    { s: 'AS1: Kinetics', o: o++, t: 'Reaction Rates', d: 'Measuring rate of reaction', obj: ['Define rate of reaction', 'Measure rates experimentally', 'Plot rate graphs'] },
    { s: 'AS1: Kinetics', o: o++, t: 'Collision Theory', d: 'Explaining reaction rates', obj: ['Explain collision theory', 'Understand activation energy', 'Apply Maxwell-Boltzmann distribution'] },
    { s: 'AS1: Kinetics', o: o++, t: 'Factors Affecting Rate', d: 'Concentration temperature surface area', obj: ['Explain concentration effect', 'Describe temperature effect', 'Understand surface area effect'] },
    { s: 'AS1: Kinetics', o: o++, t: 'Catalysts', d: 'Speeding up reactions', obj: ['Define catalyst', 'Explain catalytic action', 'Understand heterogeneous and homogeneous'] },
    { s: 'AS1: Kinetics', o: o++, t: 'Rate Equations', d: 'Mathematical rate expressions', obj: ['Write rate equations', 'Determine rate constant', 'Understand reaction order'] }
  );
  
  // 1.6 Equilibrium (6 lessons)
  lessons.push(
    { s: 'AS1: Equilibrium', o: o++, t: 'Dynamic Equilibrium', d: 'Reversible reactions', obj: ['Define dynamic equilibrium', 'Explain equilibrium conditions', 'Understand closed systems'] },
    { s: 'AS1: Equilibrium', o: o++, t: 'Le Chatelier\'s Principle', d: 'Predicting equilibrium shifts', obj: ['State Le Chatelier principle', 'Predict position shifts', 'Apply to industrial processes'] },
    { s: 'AS1: Equilibrium', o: o++, t: 'Equilibrium Constant Kc', d: 'Quantifying equilibrium', obj: ['Define equilibrium constant', 'Calculate Kc values', 'Interpret Kc magnitude'] },
    { s: 'AS1: Equilibrium', o: o++, t: 'Equilibrium Calculations', d: 'Solving equilibrium problems', obj: ['Calculate equilibrium concentrations', 'Use ICE tables', 'Solve Kc problems'] },
    { s: 'AS1: Equilibrium', o: o++, t: 'Kp and Gas Equilibria', d: 'Equilibria involving gases', obj: ['Define Kp', 'Calculate partial pressures', 'Apply to gaseous equilibria'] },
    { s: 'AS1: Equilibrium', o: o++, t: 'Industrial Applications', d: 'Haber Contact processes', obj: ['Explain Haber process conditions', 'Describe Contact process', 'Understand economic considerations'] }
  );
  
  // 1.7 Acids and Bases (8 lessons)
  lessons.push(
    { s: 'AS1: Acids Bases', o: o++, t: 'Acids and Bases Definitions', d: 'Bronsted-Lowry theory', obj: ['Define acids and bases', 'Explain conjugate pairs', 'Identify proton transfer'] },
    { s: 'AS1: Acids Bases', o: o++, t: 'pH Scale', d: 'Measuring acidity', obj: ['Define pH', 'Calculate pH from H+ concentration', 'Use logarithms in pH'] },
    { s: 'AS1: Acids Bases', o: o++, t: 'Strong and Weak Acids', d: 'Degree of dissociation', obj: ['Compare strong weak acids', 'Calculate Ka values', 'Understand acid strength'] },
    { s: 'AS1: Acids Bases', o: o++, t: 'Acid-Base Titrations', d: 'Neutralization reactions', obj: ['Perform titration calculations', 'Use titration curves', 'Select indicators'] },
    { s: 'AS1: Acids Bases', o: o++, t: 'Buffer Solutions', d: 'Resisting pH change', obj: ['Explain buffer action', 'Calculate buffer pH', 'Prepare buffer solutions'] },
    { s: 'AS1: Acids Bases', o: o++, t: 'pH Curves', d: 'Titration curve analysis', obj: ['Sketch pH curves', 'Identify equivalence points', 'Explain curve shapes'] },
    { s: 'AS1: Acids Bases', o: o++, t: 'Indicators', d: 'Detecting end points', obj: ['Explain indicator theory', 'Select appropriate indicators', 'Understand pKa and colour change'] },
    { s: 'AS1: Acids Bases', o: o++, t: 'Acid-Base Equilibria', d: 'Weak acid equilibria', obj: ['Apply Ka expressions', 'Calculate pH of weak acids', 'Understand degree of dissociation'] }
  );
  
  // 1.8 Redox (5 lessons)
  lessons.push(
    { s: 'AS1: Redox', o: o++, t: 'Oxidation Numbers', d: 'Assigning oxidation states', obj: ['Define oxidation number', 'Assign oxidation states', 'Apply rules systematically'] },
    { s: 'AS1: Redox', o: o++, t: 'Redox Reactions', d: 'Electron transfer', obj: ['Define oxidation and reduction', 'Identify redox reactions', 'Write half-equations'] },
    { s: 'AS1: Redox', o: o++, t: 'Redox Equations', d: 'Balancing complex equations', obj: ['Balance redox equations', 'Combine half-equations', 'Use oxidation numbers'] },
    { s: 'AS1: Redox', o: o++, t: 'Electrochemical Cells', d: 'Galvanic cells', obj: ['Describe cell construction', 'Explain electrode processes', 'Understand salt bridges'] },
    { s: 'AS1: Redox', o: o++, t: 'Electrode Potentials', d: 'Standard electrode potentials', obj: ['Define standard electrode potential', 'Calculate cell EMF', 'Predict reaction feasibility'] }
  );
  
  return lessons;
}

function getChemistryA2() {
  let o = 1;
  const lessons = [];
  
  // A2-1: Further Physical and Inorganic Chemistry
  
  // 2.1 Thermodynamics (8 lessons)
  lessons.push(
    { s: 'A2-1: Thermodynamics', o: o++, t: 'Lattice Enthalpy Advanced', d: 'Born-Haber cycles detailed', obj: ['Calculate complex lattice enthalpies', 'Understand ionic compound stability', 'Compare theoretical experimental values'] },
    { s: 'A2-1: Thermodynamics', o: o++, t: 'Enthalpy of Hydration', d: 'Ion hydration energies', obj: ['Define hydration enthalpy', 'Explain ion-dipole interactions', 'Relate to ionic radius and charge'] },
    { s: 'A2-1: Thermodynamics', o: o++, t: 'Enthalpy of Solution Advanced', d: 'Solubility predictions', obj: ['Construct solution cycles', 'Predict solubility trends', 'Understand entropy contributions'] },
    { s: 'A2-1: Thermodynamics', o: o++, t: 'Entropy Changes', d: 'Disorder and spontaneity', obj: ['Calculate entropy changes', 'Predict entropy signs', 'Understand molecular disorder'] },
    { s: 'A2-1: Thermodynamics', o: o++, t: 'Gibbs Free Energy', d: 'Thermodynamic feasibility', obj: ['Calculate Gibbs free energy', 'Predict reaction spontaneity', 'Understand temperature effects'] },
    { s: 'A2-1: Thermodynamics', o: o++, t: 'Equilibrium and Thermodynamics', d: 'Relating K and G', obj: ['Link equilibrium constant to free energy', 'Calculate K from thermodynamic data', 'Understand temperature dependence'] },
    { s: 'A2-1: Thermodynamics', o: o++, t: 'Phase Diagrams', d: 'States of matter', obj: ['Interpret phase diagrams', 'Understand triple points', 'Explain critical points'] },
    { s: 'A2-1: Thermodynamics', o: o++, t: 'Thermodynamic Applications', d: 'Industrial processes', obj: ['Apply thermodynamics to industry', 'Optimize reaction conditions', 'Understand energy efficiency'] }
  );
  
  // 2.2 Rate Equations (7 lessons)
  lessons.push(
    { s: 'A2-1: Rate Equations', o: o++, t: 'Orders of Reaction', d: 'Zero first second order', obj: ['Define reaction order', 'Determine orders experimentally', 'Write rate equations'] },
    { s: 'A2-1: Rate Equations', o: o++, t: 'Rate-Determining Step', d: 'Reaction mechanisms', obj: ['Explain rate-determining step', 'Propose reaction mechanisms', 'Relate mechanism to rate equation'] },
    { s: 'A2-1: Rate Equations', o: o++, t: 'Arrhenius Equation', d: 'Temperature and rate constant', obj: ['Apply Arrhenius equation', 'Calculate activation energy', 'Plot Arrhenius graphs'] },
    { s: 'A2-1: Rate Equations', o: o++, t: 'Reaction Mechanisms', d: 'Multi-step reactions', obj: ['Propose mechanisms', 'Identify intermediates', 'Understand elementary steps'] },
    { s: 'A2-1: Rate Equations', o: o++, t: 'Half-Life', d: 'First order kinetics', obj: ['Define half-life', 'Calculate half-life for first order', 'Apply to radioactive decay'] },
    { s: 'A2-1: Rate Equations', o: o++, t: 'Catalysis Advanced', d: 'Homogeneous and heterogeneous', obj: ['Explain heterogeneous catalysis', 'Describe homogeneous catalysis', 'Understand autocatalysis'] },
    { s: 'A2-1: Rate Equations', o: o++, t: 'Kinetics Experiments', d: 'Practical rate determination', obj: ['Design rate experiments', 'Process kinetic data', 'Evaluate experimental methods'] }
  );
  
  // 2.3 Equilibrium Kp (5 lessons)
  lessons.push(
    { s: 'A2-1: Equilibrium', o: o++, t: 'Partial Pressures', d: 'Gas mixtures', obj: ['Calculate partial pressures', 'Use mole fractions', 'Apply Dalton law'] },
    { s: 'A2-1: Equilibrium', o: o++, t: 'Kp Calculations', d: 'Equilibrium constant for gases', obj: ['Calculate Kp from partial pressures', 'Relate Kp to Kc', 'Understand units of Kp'] },
    { s: 'A2-1: Equilibrium', o: o++, t: 'Heterogeneous Equilibria', d: 'Solid-gas equilibria', obj: ['Write Kp for heterogeneous systems', 'Exclude solid and liquid terms', 'Calculate equilibrium pressures'] },
    { s: 'A2-1: Equilibrium', o: o++, t: 'Effect of Pressure on Kp', d: 'Le Chatelier with gases', obj: ['Predict pressure effects', 'Explain mole changes', 'Apply to industrial processes'] },
    { s: 'A2-1: Equilibrium', o: o++, t: 'Effect of Temperature on K', d: 'Van\'t Hoff equation', obj: ['Explain temperature effect on K', 'Apply van\'t Hoff equation', 'Relate to enthalpy change'] }
  );
  
  // 2.4 Acids and Bases Advanced (10 lessons)
  lessons.push(
    { s: 'A2-1: Acids Bases', o: o++, t: 'Weak Acid Equilibria', d: 'Ka calculations', obj: ['Calculate Ka from pH', 'Find pH of weak acids', 'Understand approximations'] },
    { s: 'A2-1: Acids Bases', o: o++, t: 'Weak Base Equilibria', d: 'Kb calculations', obj: ['Define Kb', 'Calculate pH of weak bases', 'Relate Ka and Kb'] },
    { s: 'A2-1: Acids Bases', o: o++, t: 'Salt Hydrolysis', d: 'pH of salt solutions', obj: ['Predict salt solution pH', 'Explain hydrolysis reactions', 'Calculate pH of salt solutions'] },
    { s: 'A2-1: Acids Bases', o: o++, t: 'Buffer Solutions Advanced', d: 'Henderson-Hasselbalch equation', obj: ['Apply Henderson-Hasselbalch', 'Design buffer solutions', 'Calculate buffer capacity'] },
    { s: 'A2-1: Acids Bases', o: o++, t: 'Strong Acid-Strong Base Titrations', d: 'pH curve analysis', obj: ['Sketch strong-strong curves', 'Calculate pH at stages', 'Identify equivalence point'] },
    { s: 'A2-1: Acids Bases', o: o++, t: 'Weak Acid-Strong Base Titrations', d: 'pH curves with buffers', obj: ['Sketch weak-strong curves', 'Explain buffer region', 'Calculate pH at half-equivalence'] },
    { s: 'A2-1: Acids Bases', o: o++, t: 'Polyprotic Acids', d: 'Multiple dissociation constants', obj: ['Define Ka1 Ka2', 'Calculate pH of polyprotic acids', 'Understand successive dissociations'] },
    { s: 'A2-1: Acids Bases', o: o++, t: 'Indicator Theory', d: 'pKa and colour change range', obj: ['Calculate indicator pKa', 'Explain colour change pH range', 'Select indicators for titrations'] },
    { s: 'A2-1: Acids Bases', o: o++, t: 'Solubility Product', d: 'Ksp and precipitation', obj: ['Define Ksp', 'Calculate solubility from Ksp', 'Predict precipitation'] },
    { s: 'A2-1: Acids Bases', o: o++, t: 'Common Ion Effect', d: 'Effect on solubility and equilibrium', obj: ['Explain common ion effect', 'Calculate solubility with common ion', 'Apply to buffer systems'] }
  );
  
  // 2.5 Transition Metals (8 lessons)
  lessons.push(
    { s: 'A2-1: Transition Metals', o: o++, t: 'Transition Metal Properties', d: 'General characteristics', obj: ['Define transition metal', 'Explain variable oxidation states', 'Understand complex formation'] },
    { s: 'A2-1: Transition Metals', o: o++, t: 'Complex Ions', d: 'Ligands and coordination', obj: ['Define ligands and coordination number', 'Draw complex ion structures', 'Understand dative bonding'] },
    { s: 'A2-1: Transition Metals', o: o++, t: 'Shapes of Complexes', d: 'Octahedral tetrahedral square planar', obj: ['Predict complex shapes', 'Explain coordination geometry', 'Understand stereoisomerism'] },
    { s: 'A2-1: Transition Metals', o: o++, t: 'Ligand Exchange', d: 'Substitution reactions', obj: ['Explain ligand substitution', 'Predict colour changes', 'Understand stability constants'] },
    { s: 'A2-1: Transition Metals', o: o++, t: 'Coloured Ions', d: 'd-d transitions', obj: ['Explain colour in transition metals', 'Understand d-orbital splitting', 'Relate colour to complex structure'] },
    { s: 'A2-1: Transition Metals', o: o++, t: 'Catalysis by Transition Metals', d: 'Industrial catalysts', obj: ['Explain transition metal catalysis', 'Describe heterogeneous catalysts', 'Understand homogeneous catalysts'] },
    { s: 'A2-1: Transition Metals', o: o++, t: 'Redox Reactions of Transition Metals', d: 'Variable oxidation states', obj: ['Write transition metal redox equations', 'Explain colour changes in redox', 'Calculate EMF for reactions'] },
    { s: 'A2-1: Transition Metals', o: o++, t: 'Transition Metals in Biology', d: 'Haemoglobin and enzymes', obj: ['Explain biological role of Fe', 'Understand oxygen transport', 'Describe enzyme active sites'] }
  );
  
  // A2-2: Organic and Analytical Chemistry
  
  // 2.6 Organic Chemistry Introduction (6 lessons)
  lessons.push(
    { s: 'A2-2: Organic Intro', o: o++, t: 'Organic Nomenclature', d: 'IUPAC naming', obj: ['Apply IUPAC rules', 'Name complex molecules', 'Understand priority rules'] },
    { s: 'A2-2: Organic Intro', o: o++, t: 'Isomerism', d: 'Structural and stereoisomerism', obj: ['Identify structural isomers', 'Explain geometric isomerism', 'Understand optical isomerism'] },
    { s: 'A2-2: Organic Intro', o: o++, t: 'Reaction Mechanisms', d: 'Curly arrows and intermediates', obj: ['Use curly arrow notation', 'Identify intermediates', 'Classify mechanism types'] },
    { s: 'A2-2: Organic Intro', o: o++, t: 'Nucleophilic Substitution', d: 'SN1 and SN2 mechanisms', obj: ['Explain SN1 mechanism', 'Describe SN2 mechanism', 'Compare SN1 and SN2'] },
    { s: 'A2-2: Organic Intro', o: o++, t: 'Elimination Reactions', d: 'E1 and E2 mechanisms', obj: ['Explain E1 mechanism', 'Describe E2 mechanism', 'Predict substitution vs elimination'] },
    { s: 'A2-2: Organic Intro', o: o++, t: 'Electrophilic Addition', d: 'Addition to alkenes', obj: ['Explain electrophilic addition', 'Understand Markovnikov rule', 'Predict addition products'] }
  );
  
  // 2.7 Organic Chemistry Functional Groups (12 lessons)
  lessons.push(
    { s: 'A2-2: Functional Groups', o: o++, t: 'Alcohols', d: 'Properties and reactions', obj: ['Classify alcohols', 'Describe alcohol reactions', 'Explain oxidation patterns'] },
    { s: 'A2-2: Functional Groups', o: o++, t: 'Aldehydes and Ketones', d: 'Carbonyl compounds', obj: ['Compare aldehydes and ketones', 'Explain nucleophilic addition', 'Describe oxidation and reduction'] },
    { s: 'A2-2: Functional Groups', o: o++, t: 'Carboxylic Acids', d: 'Acid properties and derivatives', obj: ['Explain acidity of carboxylic acids', 'Describe esterification', 'Understand acid strength'] },
    { s: 'A2-2: Functional Groups', o: o++, t: 'Esters', d: 'Formation and hydrolysis', obj: ['Explain ester formation', 'Describe hydrolysis mechanisms', 'Understand ester uses'] },
    { s: 'A2-2: Functional Groups', o: o++, t: 'Acyl Chlorides', d: 'Reactive acid derivatives', obj: ['Explain acyl chloride reactivity', 'Describe reactions with nucleophiles', 'Understand preparation'] },
    { s: 'A2-2: Functional Groups', o: o++, t: 'Amines', d: 'Organic bases', obj: ['Classify amines', 'Explain basic character', 'Describe amine preparation'] },
    { s: 'A2-2: Functional Groups', o: o++, t: 'Amides', d: 'Peptide links', obj: ['Explain amide formation', 'Describe hydrolysis', 'Understand biological importance'] },
    { s: 'A2-2: Functional Groups', o: o++, t: 'Amino Acids', d: 'Building blocks of proteins', obj: ['Describe amino acid structure', 'Explain zwitterion formation', 'Understand isoelectric point'] },
    { s: 'A2-2: Functional Groups', o: o++, t: 'Peptides and Proteins', d: 'Polypeptide formation', obj: ['Explain peptide bond formation', 'Describe protein structure levels', 'Understand protein hydrolysis'] },
    { s: 'A2-2: Functional Groups', o: o++, t: 'Aromatic Chemistry', d: 'Benzene and substitution', obj: ['Explain benzene stability', 'Describe electrophilic substitution', 'Understand directing effects'] },
    { s: 'A2-2: Functional Groups', o: o++, t: 'Phenols', d: 'Aromatic alcohols', obj: ['Compare phenol and alcohol acidity', 'Explain phenol reactions', 'Understand resonance stabilization'] },
    { s: 'A2-2: Functional Groups', o: o++, t: 'Polymers', d: 'Addition and condensation polymers', obj: ['Distinguish polymer types', 'Explain polymerization mechanisms', 'Understand polymer properties'] }
  );
  
  // 2.8 Organic Synthesis (6 lessons)
  lessons.push(
    { s: 'A2-2: Organic Synthesis', o: o++, t: 'Synthetic Routes', d: 'Multi-step synthesis planning', obj: ['Plan synthetic routes', 'Select appropriate reagents', 'Understand reaction sequences'] },
    { s: 'A2-2: Organic Synthesis', o: o++, t: 'Functional Group Interconversions', d: 'Converting functional groups', obj: ['Identify key conversions', 'Select reagents and conditions', 'Predict products'] },
    { s: 'A2-2: Organic Synthesis', o: o++, t: 'Protecting Groups', d: 'Selective reaction strategies', obj: ['Explain need for protection', 'Use protecting groups', 'Understand deprotection'] },
    { s: 'A2-2: Organic Synthesis', o: o++, t: 'Retrosynthetic Analysis', d: 'Working backwards from target', obj: ['Apply retrosynthetic thinking', 'Identify disconnections', 'Plan efficient syntheses'] },
    { s: 'A2-2: Organic Synthesis', o: o++, t: 'Green Chemistry', d: 'Sustainable synthesis', obj: ['Apply green chemistry principles', 'Assess atom economy', 'Understand sustainability'] },
    { s: 'A2-2: Organic Synthesis', o: o++, t: 'Industrial Organic Processes', d: 'Large-scale synthesis', obj: ['Describe industrial processes', 'Understand economic factors', 'Compare laboratory and industrial methods'] }
  );
  
  // 2.9 Analytical Techniques (10 lessons)
  lessons.push(
    { s: 'A2-2: Analytical', o: o++, t: 'Mass Spectrometry Organic', d: 'Molecular ion and fragmentation', obj: ['Interpret mass spectra', 'Identify molecular ions', 'Understand fragmentation patterns'] },
    { s: 'A2-2: Analytical', o: o++, t: 'Infrared Spectroscopy', d: 'Functional group identification', obj: ['Interpret IR spectra', 'Identify functional groups', 'Understand absorption frequencies'] },
    { s: 'A2-2: Analytical', o: o++, t: 'NMR Spectroscopy Basics', d: 'Nuclear magnetic resonance', obj: ['Explain NMR principles', 'Understand chemical shift', 'Interpret simple spectra'] },
    { s: 'A2-2: Analytical', o: o++, t: 'Proton NMR', d: 'H-NMR spectroscopy', obj: ['Interpret H-NMR spectra', 'Count hydrogen environments', 'Understand splitting patterns'] },
    { s: 'A2-2: Analytical', o: o++, t: 'Carbon-13 NMR', d: 'C-NMR spectroscopy', obj: ['Interpret C-NMR spectra', 'Count carbon environments', 'Understand DEPT spectra'] },
    { s: 'A2-2: Analytical', o: o++, t: 'Combined Spectroscopy', d: 'Structure elucidation', obj: ['Combine spectroscopic data', 'Deduce molecular structures', 'Confirm structures'] },
    { s: 'A2-2: Analytical', o: o++, t: 'Chromatography', d: 'Separation techniques', obj: ['Explain chromatography principles', 'Compare TLC GC HPLC', 'Calculate Rf values'] },
    { s: 'A2-2: Analytical', o: o++, t: 'UV-Visible Spectroscopy', d: 'Electronic transitions', obj: ['Interpret UV-Vis spectra', 'Understand Beer-Lambert law', 'Apply to quantitative analysis'] },
    { s: 'A2-2: Analytical', o: o++, t: 'Qualitative Analysis', d: 'Chemical tests for ions', obj: ['Perform qualitative tests', 'Identify cations and anions', 'Interpret test results'] },
    { s: 'A2-2: Analytical', o: o++, t: 'Quantitative Analysis', d: 'Titrations and calculations', obj: ['Perform accurate titrations', 'Calculate concentrations', 'Evaluate uncertainties'] }
  );
  
  return lessons;
}