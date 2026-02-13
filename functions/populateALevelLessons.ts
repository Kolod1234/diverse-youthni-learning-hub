import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { courseId } = await req.json();

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

    let lessonStructure = [];

    if (structureKey === 'biology_as') {
      lessonStructure = getBiologyASLessons();
    } else if (structureKey === 'biology_a2') {
      lessonStructure = getBiologyA2Lessons();
    } else if (structureKey === 'chemistry_as') {
      lessonStructure = getChemistryASLessons();
    } else if (structureKey === 'chemistry_a2') {
      lessonStructure = getChemistryA2Lessons();
    } else if (structureKey === 'physics_as') {
      lessonStructure = getPhysicsASLessons();
    } else if (structureKey === 'physics_a2') {
      lessonStructure = getPhysicsA2Lessons();
    } else if (structureKey === 'further_mathematics_as') {
      lessonStructure = getFurtherMathematicsASLessons();
    } else if (structureKey === 'further_mathematics_a2') {
      lessonStructure = getFurtherMathematicsA2Lessons();
    } else if (structureKey === 'mathematics_as') {
      lessonStructure = getMathematicsASLessons();
    } else if (structureKey === 'mathematics_a2') {
      lessonStructure = getMathematicsA2Lessons();
    } else {
      return Response.json({ error: `No lesson structure found for ${structureKey}` }, { status: 400 });
    }

    // Delete existing lessons using bulkDelete for efficiency
    const existingLessons = await base44.asServiceRole.entities.Lesson.filter({ course_id: courseId });
    
    if (existingLessons.length > 0) {
      // Delete in smaller batches to avoid rate limits
      const batchSize = 10;
      for (let i = 0; i < existingLessons.length; i += batchSize) {
        const batch = existingLessons.slice(i, i + batchSize);
        await Promise.all(batch.map(lesson => 
          base44.asServiceRole.entities.Lesson.delete(lesson.id)
        ));
        // Small delay between batches to avoid rate limits
        if (i + batchSize < existingLessons.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
    }

    // Create new lessons in batches to avoid rate limits
    const createdLessons = [];
    const batchSize = 10;
    
    for (let i = 0; i < lessonStructure.length; i += batchSize) {
      const batch = lessonStructure.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(lesson =>
        base44.asServiceRole.entities.Lesson.create({
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
        })
      ));
      createdLessons.push(...batchResults);
      
      // Small delay between batches to avoid rate limits
      if (i + batchSize < lessonStructure.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
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

function getBiologyASLessons() {
  return [
    // AS1: Molecules (11 lessons)
    { section: 'AS1: Molecules', title: 'Water as a Biological Molecule', objectives: ['Demonstrate importance of water as solvent', 'Explain hydrogen bonding in water', 'Relate water properties to biological roles'], order: 1 },
    { section: 'AS1: Molecules', title: 'Inorganic Ions in Biology', objectives: ['Outline role of potassium calcium magnesium and iron ions', 'Explain role of hydrogencarbonate nitrate and phosphate', 'Understand ions in compounds and buffering'], order: 2 },
    { section: 'AS1: Molecules', title: 'Carbohydrates - Monosaccharides and Disaccharides', objectives: ['Describe alpha-glucose beta-glucose fructose structure', 'Explain condensation and hydrolysis reactions', 'Understand glycosidic bonds in maltose and sucrose'], order: 3 },
    { section: 'AS1: Molecules', title: 'Carbohydrates - Polysaccharides', objectives: ['Describe starch and glycogen as storage polymers', 'Explain cellulose as structural polymer of beta-glucose', 'Understand pentoses in nucleic acids ribose and deoxyribose'], order: 4 },
    { section: 'AS1: Molecules', title: 'Lipids - Structure and Function', objectives: ['Describe triglyceride structure as glycerol plus fatty acids', 'Compare saturated and unsaturated fatty acids', 'Explain phospholipid structure and membrane role'], order: 5 },
    { section: 'AS1: Molecules', title: 'Proteins - Amino Acids and Structure', objectives: ['Describe general amino acid structure', 'Explain primary secondary tertiary quaternary structure', 'Understand peptide bonds and hydrogen bonds'], order: 6 },
    { section: 'AS1: Molecules', title: 'Proteins - Fibrous and Globular', objectives: ['Compare collagen as fibrous and enzymes as globular', 'Explain conjugated proteins glycoprotein and haemoglobin', 'Understand prions as disease-causing proteins'], order: 7 },
    { section: 'AS1: Molecules', title: 'Nucleic Acids - DNA and RNA', objectives: ['Describe nucleotide structure pentose base phosphate', 'Explain DNA helical structure with base pairing', 'Compare DNA and RNA structure'], order: 8 },
    { section: 'AS1: Molecules', title: 'DNA Replication', objectives: ['Explain semi-conservative replication', 'Understand role of DNA helicase and DNA polymerase', 'Describe Meselson-Stahl experiment'], order: 9 },
    { section: 'AS1: Molecules', title: 'Biochemical Tests', objectives: ['Carry out iodine test for starch', 'Use Benedict test for reducing sugars', 'Apply Biuret test for proteins'], order: 10 },
    { section: 'AS1: Molecules', title: 'Chromatography of Amino Acids', objectives: ['Prepare and run paper chromatogram', 'Develop chromatogram correctly', 'Calculate Rf values for amino acids'], order: 11 },
    
    // AS1: Enzymes (6 lessons)
    { section: 'AS1: Enzymes', title: 'Enzyme Structure and Active Site', objectives: ['Describe enzymes as globular proteins', 'Explain active site specificity', 'Understand role of cofactors and coenzymes'], order: 12 },
    { section: 'AS1: Enzymes', title: 'Enzyme Action - Lock and Key vs Induced Fit', objectives: ['Explain lock and key hypothesis', 'Understand induced-fit hypothesis', 'Describe enzyme-substrate complex formation'], order: 13 },
    { section: 'AS1: Enzymes', title: 'Factors Affecting Enzyme Activity', objectives: ['Investigate effect of temperature on enzymes', 'Analyze pH effects on enzyme activity', 'Understand substrate and enzyme concentration effects'], order: 14 },
    { section: 'AS1: Enzymes', title: 'Enzyme Inhibition', objectives: ['Explain competitive inhibition', 'Describe non-competitive inhibition', 'Apply inhibitors as therapeutic drugs'], order: 15 },
    { section: 'AS1: Enzymes', title: 'Enzymes as Biomarkers', objectives: ['Understand enzymes in disease processes', 'Explain elastase in respiratory infections', 'Apply enzyme detection in diagnosis'], order: 16 },
    { section: 'AS1: Enzymes', title: 'Immobilised Enzymes', objectives: ['Describe methods of enzyme immobilisation', 'Explain benefits in biotechnology', 'Use biosensors glucose strips and pregnancy tests'], order: 17 },
    
    // AS1: Viruses (2 lessons)
    { section: 'AS1: Viruses', title: 'Virus Structure - Bacteriophages and HIV', objectives: ['Describe bacteriophage structure DNA plus protein coat', 'Explain HIV structure RNA protein lipid bilayer glycoprotein', 'Understand HIV as retrovirus with reverse transcriptase'], order: 18 },
    { section: 'AS1: Viruses', title: 'Viral Replication', objectives: ['Understand phages invade and destroy bacteria', 'Explain HIV invasion of helper T-cells', 'Describe viral replication in host cells'], order: 19 },
    
    // AS1: Cells (12 lessons)
    { section: 'AS1: Cells', title: 'Prokaryotic vs Eukaryotic Cells', objectives: ['Compare prokaryotic cell structure bacteria', 'Describe eukaryotic cell features', 'Identify naked circular DNA vs chromosomes'], order: 20 },
    { section: 'AS1: Cells', title: 'Membrane Structure - Fluid Mosaic Model', objectives: ['Describe phospholipid bilayer', 'Explain intrinsic and extrinsic proteins', 'Understand glycocalyx glycoproteins glycolipids'], order: 21 },
    { section: 'AS1: Cells', title: 'Membrane Function', objectives: ['Explain proteins as carriers and channels', 'Understand recognition features', 'Describe cholesterol role in membrane stability'], order: 22 },
    { section: 'AS1: Cells', title: 'Cell Organelles - Mitochondria and Chloroplasts', objectives: ['Describe mitochondria envelope cristae matrix', 'Explain chloroplast structure grana stroma thylakoids', 'Understand double membrane organelles'], order: 23 },
    { section: 'AS1: Cells', title: 'Cell Organelles - ER Ribosomes Golgi', objectives: ['Describe rough ER with ribosomes', 'Explain smooth ER and Golgi apparatus', 'Understand ribosome role in protein synthesis'], order: 24 },
    { section: 'AS1: Cells', title: 'Cell Organelles - Lysosomes and Cytoskeleton', objectives: ['Explain lysosome function', 'Describe microtubules centrioles spindle', 'Understand plasmodesmata in plant cells'], order: 25 },
    { section: 'AS1: Cells', title: 'Nuclear Structure', objectives: ['Describe chromosomes DNA plus histones', 'Explain nucleolus and rRNA coding', 'Understand nuclear envelope with pores'], order: 26 },
    { section: 'AS1: Cells', title: 'Plant Fungal and Animal Cells', objectives: ['Compare plant cells with cell wall chloroplasts vacuole', 'Describe fungal cells chitin wall multinucleate', 'Identify animal cell features centrioles no wall'], order: 27 },
    { section: 'AS1: Cells', title: 'Microscopy Techniques', objectives: ['Use light microscope effectively', 'Understand TEM vs SEM', 'Explain magnification vs resolution'], order: 28 },
    { section: 'AS1: Cells', title: 'Cell Fractionation', objectives: ['Demonstrate homogenisation technique', 'Use centrifugation to separate organelles', 'Understand differential centrifugation'], order: 29 },
    { section: 'AS1: Cells', title: 'Microscopy Practical Skills', objectives: ['Examine photomicrographs and electron micrographs', 'Draw cells and calculate magnification', 'Use graticule and stage micrometer'], order: 30 },
    { section: 'AS1: Cells', title: 'Staining and Measurement', objectives: ['Stain tissues iodine and methylene blue', 'Calculate true size in micrometres', 'Measure cell length accurately'], order: 31 },
    
    // AS1: Cell Physiology (4 lessons)
    { section: 'AS1: Cell Physiology', title: 'Diffusion and Osmosis', objectives: ['Explain diffusion across membranes', 'Understand osmosis and water potential', 'Calculate water potential as sum of solute and pressure potentials'], order: 32 },
    { section: 'AS1: Cell Physiology', title: 'Water Relations in Cells', objectives: ['Describe lysis and crenation in animal cells', 'Explain turgor plasmolysis in plant cells', 'Understand incipient plasmolysis'], order: 33 },
    { section: 'AS1: Cell Physiology', title: 'Facilitated Diffusion and Active Transport', objectives: ['Explain facilitated diffusion via proteins', 'Describe active transport using carriers and ATP', 'Understand endocytosis and exocytosis'], order: 34 },
    { section: 'AS1: Cell Physiology', title: 'Membrane Permeability', objectives: ['Explain fat-soluble substance movement', 'Describe water movement through bilayer', 'Understand hydrophilic channels for polar molecules'], order: 35 },
    
    // AS1: Practical - Water Potential (2 lessons)
    { section: 'AS1: Practical', title: 'Measuring Water Potential - Weighing Method', objectives: ['Use potato tissue in different solutions', 'Calculate percentage change in mass', 'Determine average water potential from graph'], order: 36 },
    { section: 'AS1: Practical', title: 'Measuring Solute Potential - Plasmolysis', objectives: ['Use onion epidermis in solutions', 'Calculate percentage plasmolysis', 'Determine average solute potential at 50 percent plasmolysis'], order: 37 },
    
    // AS1: Continuity of Cells (6 lessons)
    { section: 'AS1: Continuity of Cells', title: 'The Cell Cycle - Interphase', objectives: ['Describe G1 S G2 phases', 'Explain DNA replication in S phase', 'Understand G0 resting state'], order: 38 },
    { section: 'AS1: Continuity of Cells', title: 'Mitosis - Nuclear Division', objectives: ['Describe prophase metaphase anaphase telophase', 'Explain chromosome behavior during mitosis', 'Understand significance in genetic constancy'], order: 39 },
    { section: 'AS1: Continuity of Cells', title: 'Cytokinesis and Cancer', objectives: ['Compare cytokinesis in animal vs plant cells', 'Explain cell cycle checkpoints', 'Understand cancer and loss of control'], order: 40 },
    { section: 'AS1: Continuity of Cells', title: 'Anticancer Drugs', objectives: ['Describe vincristine as microtubule inhibitor', 'Explain 5-Fluorouracil as S-phase inhibitor', 'Understand drug action on cell cycle'], order: 41 },
    { section: 'AS1: Continuity of Cells', title: 'Chromosome Number - Haploidy and Diploidy', objectives: ['Define haploid and diploid', 'Identify chromosomes in photomicrographs', 'Analyze human karyotype'], order: 42 },
    { section: 'AS1: Continuity of Cells', title: 'Meiosis and Genetic Variation', objectives: ['Describe meiosis I and meiosis II stages', 'Explain crossing-over and chiasma formation', 'Understand independent assortment'], order: 43 },
    
    // AS1: Practical - Mitosis (1 lesson)
    { section: 'AS1: Practical', title: 'Root Tip Squash and Mitosis Observation', objectives: ['Prepare and stain root tip squashes', 'Recognize chromosomes at different stages', 'Identify mitosis stages in slides'], order: 44 },
    
    // AS1: Tissues and Organs (6 lessons)
    { section: 'AS1: Tissues and Organs', title: 'Tissues and Organs Defined', objectives: ['Define tissue as cells with same function', 'Explain organ as grouped tissues', 'Understand specialisation of cells'], order: 45 },
    { section: 'AS1: Tissues and Organs', title: 'Ileum Structure - Tissue Layers', objectives: ['Identify mucosa submucosa muscularis', 'Describe serosa protective layer', 'Understand tissue organization'], order: 46 },
    { section: 'AS1: Tissues and Organs', title: 'Ileum - Absorption Adaptations', objectives: ['Describe villi and microvilli', 'Explain crypts of Lieberkuhn and Paneth cells', 'Understand blood capillaries and lacteals'], order: 47 },
    { section: 'AS1: Tissues and Organs', title: 'Ileum - Absorption Mechanisms', objectives: ['Explain diffusion active transport pinocytosis', 'Describe amino acid and monosaccharide absorption', 'Understand fat absorption into lacteals'], order: 48 },
    { section: 'AS1: Tissues and Organs', title: 'Leaf Structure - Mesophytic Leaf', objectives: ['Identify upper and lower epidermis palisade spongy mesophyll', 'Describe xylem and phloem in veins', 'Explain stomata and guard cells'], order: 49 },
    { section: 'AS1: Tissues and Organs', title: 'Leaf Adaptations', objectives: ['Explain waxy cuticle for water conservation', 'Understand palisade arrangement for photosynthesis', 'Describe gas exchange via stomata'], order: 50 },
    
    // AS1: Practical - Tissues (1 lesson)
    { section: 'AS1: Practical', title: 'Examining Ileum and Leaf Sections', objectives: ['Identify ileum structures under microscope', 'Recognize leaf tissues in sections', 'Draw accurate block diagrams'], order: 51 },
    
    // AS2: Transport - Principles (5 lessons)
    { section: 'AS2: Transport Principles', title: 'Surface Area to Volume Ratio', objectives: ['Explain surface area to volume relationship with organism size', 'Understand metabolic demand vs supply', 'Compare small vs large organisms'], order: 52 },
    { section: 'AS2: Transport Principles', title: 'Features of Exchange Surfaces', objectives: ['Describe methods to increase surface area', 'Explain thin separating surfaces', 'Understand concentration gradients'], order: 53 },
    { section: 'AS2: Transport Principles', title: 'Mass Transport Systems', objectives: ['Explain need for mass transport', 'Describe xylem water transport', 'Understand phloem translocation'], order: 54 },
    { section: 'AS2: Transport Principles', title: 'Gas Exchange - Ficks Law', objectives: ['Apply Ficks law to gas exchange', 'Understand factors affecting diffusion rate', 'Calculate diffusion rates'], order: 55 },
    { section: 'AS2: Transport Principles', title: 'Gas Exchange in Plants', objectives: ['Explain oxygen and carbon dioxide exchange', 'Understand compensation point', 'Describe mesophyll as exchange surface'], order: 56 },
    
    // AS2: Gas Exchange Mammals (3 lessons)
    { section: 'AS2: Gas Exchange Mammals', title: 'Mammalian Gas Exchange Surface', objectives: ['Describe alveoli structure', 'Explain thin respiratory surface', 'Understand surfactant role'], order: 57 },
    { section: 'AS2: Gas Exchange Mammals', title: 'Breathing System Structure', objectives: ['Identify trachea bronchi bronchioles alveoli', 'Describe intercostal muscles and diaphragm', 'Understand breathing mechanism'], order: 58 },
    { section: 'AS2: Gas Exchange Mammals', title: 'Effects of Smoking', objectives: ['Explain cilia damage from smoking', 'Describe bronchitis and emphysema', 'Understand lung cancer risk'], order: 59 },
    
    // AS2: Practical - Respirometer (1 lesson)
    { section: 'AS2: Practical', title: 'Using a Respirometer', objectives: ['Measure oxygen consumption with KOH', 'Calculate carbon dioxide production without KOH', 'Determine net gas exchange'], order: 60 },
    
    // AS2: Transport in Plants (8 lessons)
    { section: 'AS2: Plant Transport', title: 'Plant Tissues - Xylem and Phloem', objectives: ['Describe xylem vessel structure', 'Explain phloem sieve tubes and companion cells', 'Identify protoxylem and metaxylem'], order: 61 },
    { section: 'AS2: Plant Transport', title: 'Root Hair Uptake', objectives: ['Explain water uptake via osmosis', 'Describe ion uptake via active transport', 'Understand root hair adaptations'], order: 62 },
    { section: 'AS2: Plant Transport', title: 'Apoplast and Symplast Pathways', objectives: ['Describe apoplast pathway cell walls', 'Explain symplast pathway plasmodesmata', 'Understand endodermis forcing symplast route'], order: 63 },
    { section: 'AS2: Plant Transport', title: 'Transpiration and Factors', objectives: ['Explain stomata as main transpiration route', 'Describe internal factors surface area density cuticle', 'Understand external factors light wind temperature'], order: 64 },
    { section: 'AS2: Plant Transport', title: 'Water Movement in Xylem', objectives: ['Explain cohesion-tension theory', 'Describe transpiration stream', 'Understand root pressure hypothesis'], order: 65 },
    { section: 'AS2: Plant Transport', title: 'Translocation in Phloem', objectives: ['Understand two-way flow in phloem', 'Explain energy requirement', 'Provide evidence for translocation'], order: 66 },
    { section: 'AS2: Plant Transport', title: 'Xerophytes - Adaptations', objectives: ['Describe leaf curvature and reduced area', 'Explain sunken stomata and hairs', 'Understand succulent tissue and spines'], order: 67 },
    { section: 'AS2: Plant Transport', title: 'Hydrophytes - Adaptations', objectives: ['Explain stomata on upper surface', 'Describe aerenchyma tissue', 'Understand adaptations for aquatic life'], order: 68 },
    
    // AS2: Circulatory System (10 lessons)
    { section: 'AS2: Circulation', title: 'Layout of Cardiovascular System', objectives: ['Describe double circulation', 'Identify major thoracic and abdominal vessels', 'Understand pulmonary and systemic circuits'], order: 69 },
    { section: 'AS2: Circulation', title: 'Blood Vessels - Arteries and Veins', objectives: ['Compare artery and vein structure', 'Explain elastic fibres in arteries', 'Understand valves and large lumen in veins'], order: 70 },
    { section: 'AS2: Circulation', title: 'Capillaries and Atherosclerosis', objectives: ['Describe capillary squamous endothelium', 'Explain atherosclerosis development', 'Understand atheroma formation'], order: 71 },
    { section: 'AS2: Circulation', title: 'Heart Structure', objectives: ['Identify atria ventricles septa', 'Describe AV valves tricuspid bicuspid', 'Explain chordae tendinae and papillary muscles'], order: 72 },
    { section: 'AS2: Circulation', title: 'Cardiac Cycle', objectives: ['Describe diastole atrial systole ventricular systole', 'Explain blood flow along pressure gradients', 'Understand valve operation'], order: 73 },
    { section: 'AS2: Circulation', title: 'Cardiac Control', objectives: ['Explain myogenic stimulation', 'Describe SA node AV node Bundle of His', 'Understand Purkinje fibres'], order: 74 },
    { section: 'AS2: Circulation', title: 'Heart Sounds and ECG', objectives: ['Understand heart sounds', 'Interpret ECG traces', 'Explain angiography for diagnosis'], order: 75 },
    { section: 'AS2: Practical', title: 'Heart Dissection', objectives: ['Dissect mammalian heart', 'Identify chambers and valves', 'Recognize major blood vessels'], order: 76 },
    { section: 'AS2: Circulation', title: 'Blood Composition', objectives: ['Describe red blood cell adaptations', 'Identify polymorphs monocytes lymphocytes', 'Explain plasma components'], order: 77 },
    { section: 'AS2: Circulation', title: 'Blood Clotting', objectives: ['Describe platelet role', 'Explain prothrombin to thrombin conversion', 'Understand fibrinogen to fibrin formation'], order: 78 },
    
    // AS2: Haemoglobin (5 lessons)
    { section: 'AS2: Haemoglobin', title: 'Haemoglobin Structure', objectives: ['Describe conjugated protein structure', 'Explain haem groups with ferrous iron', 'Understand four oxygen binding sites'], order: 79 },
    { section: 'AS2: Haemoglobin', title: 'Oxygen Dissociation Curve', objectives: ['Explain loading at high partial pressure oxygen', 'Describe unloading at low partial pressure oxygen', 'Understand cooperative binding'], order: 80 },
    { section: 'AS2: Haemoglobin', title: 'Bohr Effect', objectives: ['Explain right shift with increased carbon dioxide and temperature', 'Understand increased oxygen release to tissues', 'Describe physiological advantage'], order: 81 },
    { section: 'AS2: Haemoglobin', title: 'Myoglobin', objectives: ['Compare myoglobin and haemoglobin affinity', 'Explain left-shifted dissociation curve', 'Understand aerobic respiration in muscle'], order: 82 },
    { section: 'AS2: Haemoglobin', title: 'Altitude Effects', objectives: ['Explain lower partial pressure oxygen at altitude', 'Describe haemoglobin adaptation', 'Understand increased RBC production'], order: 83 },
    
    // AS2: Adaptation (2 lessons)
    { section: 'AS2: Adaptation', title: 'Organism Adaptations', objectives: ['Define behavioural physiological morphological adaptations', 'Study organisms in habitat', 'Apply xerophytic and hydrophytic examples'], order: 84 },
    { section: 'AS2: Adaptation', title: 'Ecological Factors', objectives: ['Explain climatic factors temperature water light', 'Describe edaphic factors pH nutrients aeration', 'Understand biotic factors and ecological niche'], order: 85 },
    
    // AS2: Practical - Field Work (1 lesson)
    { section: 'AS2: Practical', title: 'Sampling Techniques', objectives: ['Use quadrats pin frames pitfall traps', 'Estimate abundance density frequency', 'Measure abiotic and biotic factors'], order: 86 },
    
    // AS2: Biodiversity (8 lessons)
    { section: 'AS2: Biodiversity', title: 'Biochemical Basis of Life', objectives: ['Understand all organisms contain same biochemicals', 'Identify carbohydrates lipids nucleic acids proteins', 'Explain universal biochemistry'], order: 87 },
    { section: 'AS2: Biodiversity', title: 'Levels of Biodiversity', objectives: ['Define genetic diversity', 'Explain species diversity', 'Understand ecosystem diversity'], order: 88 },
    { section: 'AS2: Biodiversity', title: 'Measuring Biodiversity - Simpsons Index', objectives: ['Calculate Simpsons index D', 'Use formula for diversity', 'Apply to percentage cover or count data'], order: 89 },
    { section: 'AS2: Biodiversity', title: 'Taxonomy Principles', objectives: ['Apply binomial nomenclature', 'Understand systematics', 'Classify organisms by similarities'], order: 90 },
    { section: 'AS2: Biodiversity', title: 'Species and Taxa', objectives: ['Define species concept', 'List taxa genus family order class phylum kingdom', 'Understand taxonomic hierarchy'], order: 91 },
    { section: 'AS2: Biodiversity', title: 'Phylogenetic Taxonomy', objectives: ['Explain phylogenetic relationships', 'Use morphology cell structure biochemistry', 'Compare DNA RNA protein sequences'], order: 92 },
    { section: 'AS2: Biodiversity', title: 'Five Kingdom System', objectives: ['Identify Prokaryotae Protoctista Fungi Plantae Animalia', 'Describe key features of each kingdom', 'Understand archaea as separate domain'], order: 93 },
    { section: 'AS2: Biodiversity', title: 'Kingdom Features', objectives: ['Describe prokaryote and protoctist features', 'Explain fungi as lysotrophs with chitin walls', 'Understand plant and animal characteristics'], order: 94 },
    
    // AS2: Human Impact (4 lessons)
    { section: 'AS2: Human Impact', title: 'Agricultural Practices and Biodiversity', objectives: ['Compare polyculture vs monoculture', 'Explain hedgerow conservation', 'Understand integrated pest management'], order: 95 },
    { section: 'AS2: Human Impact', title: 'Pollution of Waterways', objectives: ['Describe organic pollution slurry and silage', 'Explain eutrophication from fertiliser run-off', 'Understand mineral enrichment'], order: 96 },
    { section: 'AS2: Human Impact', title: 'BOD and Aquatic Ecosystems', objectives: ['Explain biological oxygen demand', 'Describe effects on flora and fauna', 'Understand pollution reduction strategies'], order: 97 },
    { section: 'AS2: Human Impact', title: 'Conservation Initiatives', objectives: ['Describe ASSI and Special Areas of Conservation', 'Explain Biodiversity Action Plans', 'Understand global warming effects on biodiversity'], order: 98 },
  ];
}

function getBiologyA2Lessons() {
  return [
    // A2 1: Homeostasis - Principles (2 lessons)
    { section: 'A2 1: Homeostasis Principles', title: 'Concept of Homeostasis', objectives: ['Define homeostasis as constant state maintenance', 'Identify sensor receptor and corrective mechanism', 'Explain negative feedback system'], order: 1 },
    { section: 'A2 1: Homeostasis Principles', title: 'The Kidney and Excretion', objectives: ['Understand removal of urea and creatine', 'Explain osmoregulation role', 'Describe gross kidney structure'], order: 2 },
    
    // A2 1: Kidney Structure and Function (8 lessons)
    { section: 'A2 1: The Kidney', title: 'Nephron Structure', objectives: ['Describe Bowman capsule with podocytes', 'Identify proximal convoluted tubule features', 'Explain loop of Henle structure'], order: 3 },
    { section: 'A2 1: The Kidney', title: 'The Filter - Ultrafiltration', objectives: ['Describe squamous endothelium and basement membrane', 'Explain podocyte structure', 'Understand glomerular filtration'], order: 4 },
    { section: 'A2 1: The Kidney', title: 'Mechanism of Ultrafiltration', objectives: ['Explain afferent vs efferent arteriole diameter', 'Describe high blood pressure driving filtration', 'Understand osmotic and back pressure'], order: 5 },
    { section: 'A2 1: The Kidney', title: 'Selective Reabsorption - PCT', objectives: ['Explain active transport in proximal tubule', 'Describe glucose and amino acid reabsorption', 'Understand osmotic water recovery'], order: 6 },
    { section: 'A2 1: The Kidney', title: 'Selective Reabsorption - DCT', objectives: ['Explain facultative water reabsorption', 'Understand ADH-dependent permeability', 'Describe distal tubule and collecting duct'], order: 7 },
    { section: 'A2 1: The Kidney', title: 'Loop of Henle Function', objectives: ['Explain water loss from descending limb', 'Describe sodium and chloride exit from ascending limb', 'Understand salt gradient in medulla'], order: 8 },
    { section: 'A2 1: The Kidney', title: 'Osmoregulation Mechanism', objectives: ['Describe hypothalamus osmoreceptors', 'Explain ADH synthesis and release', 'Understand ADH effect on permeability'], order: 9 },
    { section: 'A2 1: The Kidney', title: 'Negative Feedback - ADH', objectives: ['Explain decreased water potential triggers', 'Describe ADH corrective mechanism', 'Understand negative feedback loop'], order: 10 },
    
    // A2 1: Immunity (12 lessons)
    { section: 'A2 1: Immunity', title: 'Natural Barriers to Infection', objectives: ['Describe skin acid tears lysozyme', 'Explain mucus and blood clotting barriers', 'Understand first line of defence'], order: 11 },
    { section: 'A2 1: Immunity', title: 'Antigens and Antibodies', objectives: ['Define antigen as stimulating antibody production', 'Describe antibodies as specific globular proteins', 'Understand antigen-antibody complementarity'], order: 12 },
    { section: 'A2 1: Immunity', title: 'Antibody-Mediated Immunity', objectives: ['Explain B-lymphocyte division', 'Describe plasma cells secreting antibodies', 'Understand memory cells providing long-term immunity'], order: 13 },
    { section: 'A2 1: Immunity', title: 'Cell-Mediated Immunity', objectives: ['Explain T-lymphocyte sensitisation', 'Describe killer T-cells and helper T-cells', 'Understand memory T-cells and suppressor T-cells'], order: 14 },
    { section: 'A2 1: Immunity', title: 'Antigen-Antibody Reaction', objectives: ['Explain agglutination and complex formation', 'Describe phagocytosis by polymorphs', 'Understand lysosomal enzyme destruction'], order: 15 },
    { section: 'A2 1: Immunity', title: 'Active and Passive Immunity', objectives: ['Compare active vs passive immunity', 'Describe natural placental and colostral transfer', 'Explain artificial immunity and monoclonal antibodies'], order: 16 },
    { section: 'A2 1: Immunity', title: 'Vaccination', objectives: ['Understand importance of vaccination', 'Explain long-term vs short-term immunity', 'Describe societal and economic benefits'], order: 17 },
    { section: 'A2 1: Immunity', title: 'Transplant Rejection', objectives: ['Explain foreign antigen exposure', 'Describe T-cell and B-cell attack', 'Understand tissue rejection'], order: 18 },
    { section: 'A2 1: Immunity', title: 'Immunosuppression', objectives: ['Explain X-ray or drug-induced immunosuppression', 'Describe inhibition of DNA replication', 'Understand increased infection susceptibility'], order: 19 },
    { section: 'A2 1: Immunity', title: 'Blood Groups - ABO System', objectives: ['Explain ABO antigens on RBC surface', 'Understand antibody-antigen compatibility', 'Describe four blood groups'], order: 20 },
    { section: 'A2 1: Immunity', title: 'Rhesus Factor', objectives: ['Describe rhesus antigen D', 'Explain anti-D antibody production', 'Understand rhesus negative mother risks'], order: 21 },
    { section: 'A2 1: Immunity', title: 'Blood Transfusion and Antibiotic Resistance', objectives: ['Apply transfusion compatibility principles', 'Explain agglutination consequences', 'Understand antibiotic resistance and ELISA'], order: 22 },
    
    // A2 1: Practical - Immunity (1 lesson)
    { section: 'A2 1: Practical', title: 'Microbiology and Antimicrobial Properties', objectives: ['Use aseptic techniques with microorganisms', 'Test antibiotic effects on bacteria', 'Investigate antimicrobial properties of plants'], order: 23 },
    
    // A2 1: Co-ordination - Plants (2 lessons)
    { section: 'A2 1: Plant Control', title: 'Phytochromes and Flowering', objectives: ['Describe P660 and P730 interconversion', 'Explain critical night length', 'Understand long-day and short-day plants'], order: 24 },
    { section: 'A2 1: Plant Control', title: 'Plant Growth Substances', objectives: ['Explain auxins promote cell elongation', 'Describe cytokinins promote division', 'Understand gibberellins and internode elongation'], order: 25 },
    
    // A2 1: Co-ordination - Nervous System (8 lessons)
    { section: 'A2 1: Nervous System', title: 'Neurone Structure', objectives: ['Identify dendrons dendrites cell body', 'Describe axon Schwann cell myelin sheath', 'Understand nodes of Ranvier'], order: 26 },
    { section: 'A2 1: Nervous System', title: 'Resting and Action Potential', objectives: ['Explain resting potential polarisation', 'Understand threshold stimulus', 'Describe all-or-nothing law'], order: 27 },
    { section: 'A2 1: Nervous System', title: 'Propagation of Action Potentials', objectives: ['Explain depolarisation and action potential', 'Describe propagation via local circuits', 'Understand refractory period'], order: 28 },
    { section: 'A2 1: Nervous System', title: 'Speed of Conduction', objectives: ['Explain axon diameter effect', 'Describe myelination benefit', 'Understand saltatory conduction'], order: 29 },
    { section: 'A2 1: Nervous System', title: 'Synapse Structure', objectives: ['Identify synaptic bulb and vesicles', 'Describe pre-synaptic and post-synaptic membranes', 'Understand synaptic cleft'], order: 30 },
    { section: 'A2 1: Nervous System', title: 'Synaptic Transmission', objectives: ['Explain neurotransmitter exocytosis', 'Describe acetylcholine noradrenaline GABA', 'Understand receptor binding'], order: 31 },
    { section: 'A2 1: Nervous System', title: 'Excitatory and Inhibitory Synapses', objectives: ['Explain EPSP and action potential generation', 'Describe role of acetylcholinesterase', 'Understand IPSP and hyperpolarisation'], order: 32 },
    { section: 'A2 1: Nervous System', title: 'The Mammalian Eye', objectives: ['Identify eye structures cornea iris lens retina', 'Explain accommodation mechanism', 'Understand rods vs cones distribution'], order: 33 },
    
    // A2 1: Vision (3 lessons)
    { section: 'A2 1: Vision', title: 'Pupil Control and Visual Acuity', objectives: ['Explain iris muscle control of pupil', 'Describe rod convergence and sensitivity', 'Understand cone visual acuity and colour'], order: 34 },
    { section: 'A2 1: Vision', title: 'Dark Adaptation', objectives: ['Explain rhodopsin breakdown and re-synthesis', 'Understand adaptation to low light', 'Describe rod function in darkness'], order: 35 },
    { section: 'A2 1: Vision', title: 'Binocular Vision', objectives: ['Explain distance and depth perception', 'Understand wide visual fields', 'Describe stereoscopic vision'], order: 36 },
    
    // A2 1: Practical - Vision (1 lesson)
    { section: 'A2 1: Practical', title: 'Examining Eye and Muscle Slides', objectives: ['Examine mammalian eye slides', 'Identify eye structures', 'Compare skeletal cardiac smooth muscle'], order: 37 },
    
    // A2 1: Muscle (2 lessons)
    { section: 'A2 1: Effectors', title: 'Skeletal Muscle Structure', objectives: ['Distinguish muscle fibres myofibrils', 'Identify sarcomere bands A I H Z M', 'Recognize changes during contraction'], order: 38 },
    { section: 'A2 1: Effectors', title: 'Sliding Filament Theory', objectives: ['Explain myosin head attachment to actin', 'Describe calcium role in contraction', 'Understand ATP requirement for movement'], order: 39 },
    
    // A2 1: Ecosystems (12 lessons)
    { section: 'A2 1: Ecosystems', title: 'Population Growth Curves', objectives: ['Describe exponential log and stationary phases', 'Explain competition and resource availability', 'Define carrying capacity and environmental resistance'], order: 40 },
    { section: 'A2 1: Ecosystems', title: 'r-Selected and K-Selected Species', objectives: ['Describe features of r-selected species', 'Explain K-selected species characteristics', 'Compare population growth curves'], order: 41 },
    { section: 'A2 1: Ecosystems', title: 'Population Interactions', objectives: ['Explain competition as negative interaction', 'Describe mutualism as positive interaction', 'Understand predation and parasitism'], order: 42 },
    { section: 'A2 1: Ecosystems', title: 'Biological Control', objectives: ['Define pest species', 'Explain use of predators and competitors', 'Compare biological vs chemical control'], order: 43 },
    { section: 'A2 1: Ecosystems', title: 'Population Dynamics', objectives: ['Understand factors influencing population size', 'Apply to seasonal and yearly changes', 'Calculate population changes'], order: 44 },
    { section: 'A2 1: Ecosystems', title: 'Community Development', objectives: ['Describe pioneer species and colonisation', 'Explain succession to climax community', 'Understand primary vs secondary succession'], order: 45 },
    { section: 'A2 1: Ecosystems', title: 'Food Chains and Webs', objectives: ['Identify producers and consumers', 'Explain grazing and detritus food chains', 'Understand role of decomposers'], order: 46 },
    { section: 'A2 1: Ecosystems', title: 'Trophic Levels', objectives: ['Define primary producers as first trophic level', 'Calculate net primary production NPP equals GPP minus respiration', 'Identify consumer trophic levels'], order: 47 },
    { section: 'A2 1: Ecosystems', title: 'Ecological Pyramids', objectives: ['Construct pyramids of numbers biomass energy', 'Calculate energy transfer efficiency', 'Understand pyramid usefulness'], order: 48 },
    { section: 'A2 1: Ecosystems', title: 'Energy Losses in Ecosystems', objectives: ['Explain low solar radiation absorption', 'Describe losses via egestion excretion respiration', 'Understand endotherm vs ectotherm losses'], order: 49 },
    { section: 'A2 1: Ecosystems', title: 'Agriculture and Energy', objectives: ['Explain extra energy cost of animal products', 'Describe intensive farming confinement high energy foods', 'Understand fertiliser use'], order: 50 },
    { section: 'A2 1: Ecosystems', title: 'Carbon and Nitrogen Cycles', objectives: ['Describe carbon cycle respiration photosynthesis', 'Explain nitrogen cycle decomposers nitrifying bacteria', 'Understand denitrification'], order: 51 },
    
    // A2 1: Practical (2 lessons)
    { section: 'A2 1: Practical', title: 'Yeast Population Growth', objectives: ['Use haemocytometer to count cells', 'Calculate cell density', 'Understand culture medium components'], order: 52 },
    { section: 'A2 1: Practical', title: 'Capture-Mark-Recapture', objectives: ['Apply marking techniques', 'Understand assumptions in method', 'Estimate animal population size'], order: 53 },
    
    // A2 2: Respiration (9 lessons)
    { section: 'A2 2: Respiration', title: 'ATP - Nature and Function', objectives: ['Describe ATP structure adenine ribose phosphate', 'Explain ATP ADP cycle', 'Understand uses in synthesis transport mechanical work'], order: 54 },
    { section: 'A2 2: Respiration', title: 'Glycolysis', objectives: ['Explain glucose phosphorylation to fructose bisphosphate', 'Describe formation of 2 triose phosphates', 'Calculate net yield of 2 ATP and NADH'], order: 55 },
    { section: 'A2 2: Respiration', title: 'Aerobic Respiration Overview', objectives: ['Explain glycolysis followed by Krebs cycle', 'Describe electron transport at cristae', 'Understand complete glucose oxidation'], order: 56 },
    { section: 'A2 2: Respiration', title: 'Anaerobic Respiration', objectives: ['Explain NAD regeneration without ATP yield', 'Compare ethanol production in plants fungi vs lactate in animals', 'Understand oxygen-independent pathways'], order: 57 },
    { section: 'A2 2: Respiration', title: 'Link Reaction and Krebs Cycle', objectives: ['Describe pyruvate oxidative decarboxylation', 'Explain acetyl CoA entering Krebs cycle', 'Calculate NADH FADH2 ATP yields'], order: 58 },
    { section: 'A2 2: Respiration', title: 'Electron Transport Chain', objectives: ['Identify NAD flavoprotein CoQ cytochromes', 'Explain oxygen as final hydrogen acceptor', 'Calculate ATP synthesis points'], order: 59 },
    { section: 'A2 2: Respiration', title: 'Aerobic vs Anaerobic Comparison', objectives: ['Compare ATP yields', 'Explain oxygen debt concept', 'Understand survival strategies'], order: 60 },
    { section: 'A2 2: Respiration', title: 'Respiratory Quotient RQ', objectives: ['Calculate RQ as carbon dioxide to oxygen ratio', 'Use RQ to identify respiratory substrates', 'Detect anaerobic respiration'], order: 61 },
    { section: 'A2 2: Practical', title: 'Respirometer and Redox Indicators', objectives: ['Calculate oxygen uptake and carbon dioxide production', 'Determine RQ values', 'Use methylene blue as hydrogen acceptor'], order: 62 },
    
    // A2 2: Photosynthesis (6 lessons)
    { section: 'A2 2: Photosynthesis', title: 'Chloroplast Sites of Reactions', objectives: ['Identify light-dependent stage on thylakoids', 'Explain light-independent stage in stroma', 'Understand spatial organization'], order: 63 },
    { section: 'A2 2: Photosynthesis', title: 'Light-Dependent Stage - Z Scheme', objectives: ['Explain photoactivation of PSI and PSII', 'Describe electron flow producing ATP', 'Understand NADP reduction to NADPH'], order: 64 },
    { section: 'A2 2: Photosynthesis', title: 'Photolysis of Water', objectives: ['Explain water dissociation hydroxide and hydrogen ions', 'Describe electron replacement in PSII', 'Understand oxygen release'], order: 65 },
    { section: 'A2 2: Photosynthesis', title: 'Light-Independent Stage - Calvin Cycle', objectives: ['Explain carbon dioxide fixation by rubisco', 'Describe GP reduction to triose phosphate', 'Understand RuBP regeneration and glucose synthesis'], order: 66 },
    { section: 'A2 2: Photosynthesis', title: 'Chlorophyll and Light Absorption', objectives: ['Describe absorption spectra of pigments', 'Explain action spectrum', 'Understand optimal wavelengths'], order: 67 },
    { section: 'A2 2: Photosynthesis', title: 'Limiting Factors', objectives: ['Measure as carbon dioxide uptake or oxygen production', 'Explain gross vs net photosynthesis', 'Understand light carbon dioxide temperature as limiting factors'], order: 68 },
    
    // A2 2: Practical Photosynthesis (1 lesson)
    { section: 'A2 2: Practical', title: 'Chromatography and DCPIP', objectives: ['Separate plant pigments by chromatography', 'Calculate Rf values', 'Use DCPIP as hydrogen acceptor indicator'], order: 69 },
    
    // A2 2: DNA as Genetic Code (4 lessons)
    { section: 'A2 2: Genetic Code', title: 'Nature of Genetic Code', objectives: ['Define gene as DNA base sequence', 'Explain non-overlapping degenerate triplet code', 'Understand exons and introns'], order: 70 },
    { section: 'A2 2: Genetic Code', title: 'Transcription', objectives: ['Describe mRNA synthesis from DNA template', 'Explain RNA polymerase role', 'Understand complementary base pairing'], order: 71 },
    { section: 'A2 2: Genetic Code', title: 'Translation', objectives: ['Explain tRNA anticodon-codon pairing', 'Describe ribosome peptidyl and aminoacyl sites', 'Understand polypeptide formation'], order: 72 },
    { section: 'A2 2: Genetic Code', title: 'One Gene One Polypeptide and Epigenetics', objectives: ['Apply one gene codes for one polypeptide', 'Explain enzyme control of phenotype', 'Understand epigenetic methylation and histone modification'], order: 73 },
    
    // A2 2: Gene Technology (11 lessons)
    { section: 'A2 2: Gene Technology', title: 'Polymerase Chain Reaction PCR', objectives: ['Explain PCR amplification technique', 'Describe heating annealing primers extension cycle', 'Understand PCR applications'], order: 74 },
    { section: 'A2 2: Gene Technology', title: 'DNA Probes', objectives: ['Define DNA probe as known sequence', 'Explain fluorescent markers', 'Understand complementary base pairing'], order: 75 },
    { section: 'A2 2: Gene Technology', title: 'Genetic Variation - Markers', objectives: ['Use microsatellite repeat sequences', 'Apply single nucleotide polymorphisms SNPs', 'Assess nucleotide sequence differences'], order: 76 },
    { section: 'A2 2: Gene Technology', title: 'Microarray Technology', objectives: ['Explain gene expression profiling', 'Describe DNA hybridisation to chip', 'Analyze fluorescent chemiluminescent signals'], order: 77 },
    { section: 'A2 2: Gene Technology', title: 'Genetic Fingerprinting', objectives: ['Use restriction endonucleases', 'Apply gel electrophoresis separation', 'Understand forensic and paternity applications'], order: 78 },
    { section: 'A2 2: Gene Technology', title: 'Gene Transfer Stages', objectives: ['Obtain donor DNA restriction enzymes reverse transcriptase', 'Use vectors phages plasmids', 'Transform E coli or yeast'], order: 79 },
    { section: 'A2 2: Gene Technology', title: 'Marker Genes', objectives: ['Use antibiotic resistance markers', 'Apply fluorescent markers', 'Identify transformed cells'], order: 80 },
    { section: 'A2 2: Gene Technology', title: 'GM Microorganisms and Transgenic Organisms', objectives: ['Explain GM bacteria producing substances', 'Describe transgenic animals and plants', 'Understand improved traits and applications'], order: 81 },
    { section: 'A2 2: Gene Technology', title: 'Gene Therapy', objectives: ['Explain somatic-cell gene therapy', 'Describe vectors for gene transfer', 'Understand germ-line therapy ethics'], order: 82 },
    { section: 'A2 2: Gene Technology', title: 'Gene Sequencing and Human Genome', objectives: ['Explain genome sequencing', 'Describe Human Genome Project', 'Understand 21000 genes sequenced'], order: 83 },
    { section: 'A2 2: Gene Technology', title: 'Pharmacogenetics and Gene Inactivation', objectives: ['Explain personalised medicine designer drugs', 'Describe knockout and knockin mouse', 'Understand gene function research'], order: 84 },
    
    // A2 2: Practical - Gene Technology (1 lesson)
    { section: 'A2 2: Practical', title: 'Gel Electrophoresis and DNA Extraction', objectives: ['Carry out gel electrophoresis of DNA', 'Extract DNA from cells', 'Understand gene technology techniques'], order: 85 },
    
    // A2 2: Genetics and Inheritance (8 lessons)
    { section: 'A2 2: Inheritance', title: 'Genotype and Phenotype', objectives: ['Define genotype and phenotype', 'Explain environmental influence', 'Understand homozygosity and heterozygosity'], order: 86 },
    { section: 'A2 2: Inheritance', title: 'Chromosomes Genes and Alleles', objectives: ['Define genes on chromosomes', 'Explain alleles at same locus', 'Understand homologous chromosomes'], order: 87 },
    { section: 'A2 2: Inheritance', title: 'Monohybrid Inheritance', objectives: ['Apply Mendels law of segregation', 'Explain dominance and recessiveness', 'Understand codominance and lethal alleles'], order: 88 },
    { section: 'A2 2: Inheritance', title: 'Dihybrid Inheritance', objectives: ['Apply Mendels law of independent assortment', 'Use Punnett squares', 'Solve genetic diagram problems'], order: 89 },
    { section: 'A2 2: Inheritance', title: 'Test Crosses and Multiple Alleles', objectives: ['Use test crosses to determine genotype', 'Explain multiple allele inheritance', 'Apply to blood groups'], order: 90 },
    { section: 'A2 2: Inheritance', title: 'Sex Determination and Sex Linkage', objectives: ['Explain XX XY sex chromosomes', 'Describe sex-linked inheritance', 'Solve sex-linked genetic problems'], order: 91 },
    { section: 'A2 2: Inheritance', title: 'Gene Interaction and Epistasis', objectives: ['Explain gene interaction', 'Describe epistasis', 'Solve epistatic inheritance patterns'], order: 92 },
    { section: 'A2 2: Inheritance', title: 'Polygenic Inheritance', objectives: ['Explain continuous variation', 'Describe additive effects of polygenes', 'Understand environmental contribution'], order: 93 },
    
    // A2 2: Population Genetics (6 lessons)
    { section: 'A2 2: Population Genetics', title: 'Gene Pool Concept', objectives: ['Define gene pool as sum of alleles', 'Understand allele frequencies', 'Explain population genetics'], order: 94 },
    { section: 'A2 2: Population Genetics', title: 'Hardy-Weinberg Equation', objectives: ['Apply p squared plus 2pq plus q squared equals 1', 'Calculate allele frequencies p plus q equals 1', 'Determine genotype frequencies'], order: 95 },
    { section: 'A2 2: Population Genetics', title: 'Hardy-Weinberg Equilibrium', objectives: ['Understand equilibrium conditions', 'Explain random fertilisation', 'Describe effects of mutation migration selection'], order: 96 },
    { section: 'A2 2: Population Genetics', title: 'Sources of Genetic Variation', objectives: ['Explain heterozygotes as variation reservoirs', 'Describe mutation base deletions and substitutions', 'Understand chromosome mutation'], order: 97 },
    { section: 'A2 2: Population Genetics', title: 'Natural Selection', objectives: ['Define fitness and adaptation', 'Explain differential allele perpetuation', 'Describe stabilising vs directional selection'], order: 98 },
    { section: 'A2 2: Population Genetics', title: 'Speciation', objectives: ['Define species as interbreeding group', 'Explain allopatric speciation', 'Understand reproductive isolating mechanisms'], order: 99 },
    
    // A2 2: Kingdom Plantae (3 lessons)
    { section: 'A2 2: Kingdom Plantae', title: 'Mosses - Features and Restrictions', objectives: ['Describe multicellular undifferentiated structure', 'Explain rhizoids and lack of vascular tissue', 'Understand restriction to moist habitats'], order: 100 },
    { section: 'A2 2: Kingdom Plantae', title: 'Ferns - Adaptations', objectives: ['Describe differentiation roots stems leaves', 'Explain vascular system presence', 'Understand cuticle and stomatal control'], order: 101 },
    { section: 'A2 2: Kingdom Plantae', title: 'Angiosperms - Advanced Adaptations', objectives: ['Explain seed dispersal advantage', 'Describe xylem forming wood', 'Understand desiccation-resistant seeds'], order: 102 },
    
    // A2 2: Kingdom Animalia (5 lessons)
    { section: 'A2 2: Kingdom Animalia', title: 'Phylum Cnidaria', objectives: ['Describe radial symmetry', 'Explain hydrostatic skeleton', 'Identify features in hydra and jellyfish'], order: 103 },
    { section: 'A2 2: Kingdom Animalia', title: 'Phylum Platyhelminthes', objectives: ['Describe bilateral symmetry and flattened body', 'Explain single gut opening', 'Identify features in planarian and liver fluke'], order: 104 },
    { section: 'A2 2: Kingdom Animalia', title: 'Phylum Annelida', objectives: ['Describe metameric segmentation', 'Explain gut with mouth and anus', 'Understand hydrostatic skeleton in earthworm'], order: 105 },
    { section: 'A2 2: Kingdom Animalia', title: 'Phylum Arthropoda', objectives: ['Describe jointed limbs and fixed segments', 'Explain regional specialisation head thorax abdomen', 'Understand success of insects'], order: 106 },
    { section: 'A2 2: Kingdom Animalia', title: 'Phylum Chordata', objectives: ['Describe bilateral symmetry and segmentation', 'Explain spinal column and jointed skeleton', 'Identify features in mammals and birds'], order: 107 },
    
    // A2 2: Practical - Kingdom Study (1 lesson)
    { section: 'A2 2: Practical', title: 'Study of Kingdom Specimens', objectives: ['Examine plant specimens moss fern angiosperm', 'Study animal phyla specimens and slides', 'Identify key features and structures'], order: 108 },
  ];
}

function getChemistryASLessons() {
  return [
    // AS1 Unit 1: Basic Concepts in Physical and Inorganic Chemistry
    { section: 'AS1: Formulae and Equations', title: 'Ionic Compound Formulae', objectives: ['Write formulae of ionic compounds using Periodic Table', 'Recall molecular ions sulfate carbonate nitrate phosphate', 'Apply ionic charge predictions'], order: 1 },
    { section: 'AS1: Formulae and Equations', title: 'Balancing Chemical Equations', objectives: ['Write balanced equations with state symbols', 'Balance unfamiliar reactions given information', 'Write full and ionic equations'], order: 2 },
    { section: 'AS1: Formulae and Equations', title: 'The Mole and Avogadro Constant', objectives: ['Define Avogadro constant mole and molar mass', 'Use Avogadro constant in calculations', 'Calculate reacting masses with excess reactants'], order: 3 },
    { section: 'AS1: Formulae and Equations', title: 'Water of Crystallisation', objectives: ['Define anhydrous hydrated and water of crystallisation', 'Calculate moles of water from composition data', 'Determine formula of hydrated compound'], order: 4 },
    { section: 'AS1: Atomic Structure', title: 'Subatomic Particles', objectives: ['Describe properties of electrons protons neutrons', 'Explain atomic and mass numbers', 'Deduce protons neutrons electrons in atoms and ions'], order: 5 },
    { section: 'AS1: Atomic Structure', title: 'Isotopes and Relative Masses', objectives: ['Define relative atomic mass and isotopic mass', 'Define and understand isotopes', 'Calculate relative molecular and formula mass'], order: 6 },
    { section: 'AS1: Atomic Structure', title: 'Mass Spectrometry', objectives: ['Interpret mass spectra of elements', 'Calculate relative atomic mass from isotopic abundances', 'Predict mass spectra of diatomic elements'], order: 7 },
    { section: 'AS1: Atomic Structure', title: 'Electronic Configuration', objectives: ['Deduce electronic configuration using s p d notation', 'Use electrons in boxes notation', 'Apply building up principle to atoms and ions'], order: 8 },
    { section: 'AS1: Atomic Structure', title: 'Orbitals and Orbital Shapes', objectives: ['Define orbital as region holding two electrons', 'Describe shape of s-orbitals and p-orbitals', 'Understand electron spin pairing'], order: 9 },
    { section: 'AS1: Atomic Structure', title: 'Periodic Table Blocks', objectives: ['Classify elements as s-block p-block d-block f-block', 'Relate position to electronic configuration', 'Identify block from Periodic Table'], order: 10 },
    { section: 'AS1: Atomic Structure', title: 'Ionisation Energy', objectives: ['Define first and successive ionisation energies', 'Write equations for one mole of gaseous atoms', 'Understand factors affecting ionisation energy'], order: 11 },
    { section: 'AS1: Atomic Structure', title: 'Ionisation Energy Trends', objectives: ['Use successive ionisation energies to predict group', 'Understand graphs provide evidence for shells', 'Explain logarithmic comparison'], order: 12 },
    { section: 'AS1: Atomic Structure', title: 'First Ionisation Energy Trends', objectives: ['Explain trend down Groups and across Periods', 'Understand nuclear charge distance shielding', 'Relate stability of filled and half-filled subshells'], order: 13 },
    { section: 'AS1: Atomic Structure', title: 'Evidence for Shells and Subshells', objectives: ['Interpret graphs of first ionisation energies', 'Identify evidence for shells', 'Understand evidence for subshells'], order: 14 },
    { section: 'AS1: Bonding', title: 'Ionic Bonding', objectives: ['Define ionic bonding as electrostatic attraction', 'Understand electron transfer', 'Construct dot and cross diagrams'], order: 15 },
    { section: 'AS1: Bonding', title: 'Covalent Bonding', objectives: ['Define covalent bond', 'Understand shared pair of electrons', 'Define lone pair'], order: 16 },
    { section: 'AS1: Bonding', title: 'Co-ordinate Bonds', objectives: ['Describe co-ordinate bond formation', 'Understand both electrons from one atom', 'Draw ammonium ion structure'], order: 17 },
    { section: 'AS1: Bonding', title: 'Dot and Cross Diagrams', objectives: ['Construct diagrams for molecules and ions', 'Show co-ordinate single double triple bonds', 'Apply to various compounds'], order: 18 },
    { section: 'AS1: Bonding', title: 'The Octet Rule', objectives: ['Define octet rule', 'State limitations BeCl2 and BF3', 'Understand exceptions'], order: 19 },
    { section: 'AS1: Bonding', title: 'Electronegativity', objectives: ['Define electronegativity', 'Explain trend down Groups and across Periods', 'Understand Pauling scale'], order: 20 },
    { section: 'AS1: Bonding', title: 'Bond Polarity', objectives: ['Explain bond polarity from electronegativity differences', 'Use partial charges delta plus delta minus', 'Identify polar bonds'], order: 21 },
    { section: 'AS1: Bonding', title: 'Metallic Bonding', objectives: ['Define metallic bonding', 'Understand delocalised electrons', 'Explain lattice of positive ions'], order: 22 },
    { section: 'AS1: Intermolecular Forces', title: 'Types of Intermolecular Forces', objectives: ['Describe van der Waals forces', 'Explain permanent dipole-dipole attractions', 'Understand hydrogen bonding conditions'], order: 23 },
    { section: 'AS1: Intermolecular Forces', title: 'Forces and Physical Properties', objectives: ['Relate forces to melting and boiling points', 'Understand solubility effects', 'Apply to covalent molecular substances'], order: 24 },
    { section: 'AS1: Structure', title: 'Giant Ionic and Metallic Lattices', objectives: ['Describe sodium chloride giant ionic lattice', 'Explain metallic lattice structure', 'Understand properties from structure'], order: 25 },
    { section: 'AS1: Structure', title: 'Giant Covalent Structures', objectives: ['Describe graphite and diamond structures', 'Explain hardness differences', 'Understand electrical conductivity in graphite'], order: 26 },
    { section: 'AS1: Structure', title: 'Melting Point Trends Period 3', objectives: ['Explain trend from sodium to argon', 'Relate to structure and bonding', 'Understand molecular covalent iodine'], order: 27 },
    { section: 'AS1: Molecular Shapes', title: 'VSEPR Theory Basics', objectives: ['Understand electron pair repulsion determines shape', 'Apply VSEPR to predict shapes', 'Identify linear bent trigonal planar'], order: 28 },
    { section: 'AS1: Molecular Shapes', title: 'Complex Molecular Shapes', objectives: ['Predict tetrahedral pyramidal octahedral shapes', 'Understand square planar trigonal bipyramidal T-shaped', 'Draw 3D representations'], order: 29 },
    { section: 'AS1: Molecular Shapes', title: 'Bond Angle Variations', objectives: ['Explain NH3 107 degrees and H2O 104.5 degrees', 'Understand lone pair repulsion effects', 'Compare to tetrahedral 109.5 degrees'], order: 30 },
    { section: 'AS1: Molecular Shapes', title: 'Polar Molecules', objectives: ['Distinguish polar bonds from polar molecules', 'Use shape and dipoles to predict polarity', 'Understand molecular symmetry effects'], order: 31 },
    { section: 'AS1: Redox', title: 'Oxidation States', objectives: ['Calculate oxidation state in compounds and ions', 'Understand peroxides and metal hydrides', 'Apply rules systematically'], order: 32 },
    { section: 'AS1: Redox', title: 'Redox Definitions', objectives: ['Define redox oxidation and reduction', 'Explain electron transfer', 'Understand oxidation state changes'], order: 33 },
    { section: 'AS1: Redox', title: 'Oxidising and Reducing Agents', objectives: ['Understand oxidising agents gain electrons', 'Explain reducing agents lose electrons', 'Identify agents in reactions'], order: 34 },
    { section: 'AS1: Redox', title: 'Disproportionation', objectives: ['Define disproportionation', 'Use oxidation numbers to classify', 'Apply to chlorine reactions'], order: 35 },
    { section: 'AS1: Redox', title: 'Half-Equations', objectives: ['Write half-equations for redox reactions', 'Combine half-equations', 'Balance redox equations'], order: 36 },
    { section: 'AS1: Redox', title: 'Roman Numerals in Naming', objectives: ['Use Roman numerals for oxidation numbers', 'Distinguish chlorate I and chlorate V', 'Apply systematic nomenclature'], order: 37 },
    { section: 'AS1: Halogens', title: 'Halogen Physical Properties', objectives: ['Recall colours of halogens', 'Explain trends in physical state', 'Understand melting and boiling point trends'], order: 38 },
    { section: 'AS1: Halogens', title: 'Halogen Solubility', objectives: ['Compare solubility in water and hexane', 'Describe colours in different solvents', 'Understand non-polar solvent preference'], order: 39 },
    { section: 'AS1: Halogens', title: 'Halogens with Alkali', objectives: ['Describe reaction with cold dilute NaOH', 'Explain reaction with hot concentrated NaOH', 'Understand disproportionation'], order: 40 },
    { section: 'AS1: Halogens', title: 'Chlorine with Water', objectives: ['Recall chlorine plus water reaction', 'Understand chloride and chlorate I formation', 'Apply to water treatment'], order: 41 },
    { section: 'AS1: Halogens', title: 'Halogen Displacement Reactions', objectives: ['Describe trend in oxidising ability', 'Apply to displacement with halide ions', 'Understand reactivity trend down Group'], order: 42 },
    { section: 'AS1: Halogens', title: 'Halides with Acids', objectives: ['Describe solid halides with concentrated sulfuric acid', 'Compare with phosphoric acid', 'Relate to reducing ability of halides'], order: 43 },
    { section: 'AS1: Halogens', title: 'Water Treatment', objectives: ['Compare advantages of chlorine in drinking water', 'Describe ozone alternative', 'Understand disadvantages'], order: 44 },
    { section: 'AS1: Acid-Base Titrations', title: 'Strong and Weak Acids and Bases', objectives: ['Define weak and strong acids', 'Explain dissociation of hydrogen ions', 'Understand hydroxide ion dissociation'], order: 45 },
    { section: 'AS1: Acid-Base Titrations', title: 'Titration Techniques', objectives: ['Describe acid-base titration techniques', 'Apply to strong acid strong base', 'Understand weak acid strong base'], order: 46 },
    { section: 'AS1: Acid-Base Titrations', title: 'Titration Applications', objectives: ['Determine degree of hydration in sodium carbonate', 'Analyze vinegar for ethanoic acid', 'Apply strong acid weak base titrations'], order: 47 },
    { section: 'AS1: Acid-Base Titrations', title: 'Indicators', objectives: ['Select correct indicator for titration type', 'Recall phenolphthalein colour changes', 'Understand methyl orange at end point'], order: 48 },
    { section: 'AS1: Acid-Base Titrations', title: 'Uncertainties and Calculations', objectives: ['Identify uncertainties in measurements', 'Calculate uncertainty from two burette readings', 'Understand titre value precision'], order: 49 },
    { section: 'AS1: Acid-Base Titrations', title: 'Titration Data Analysis', objectives: ['Select appropriate titration data', 'Ignore outliers', 'Calculate mean titres'], order: 50 },
    { section: 'AS1: Acid-Base Titrations', title: 'Concentration Calculations', objectives: ['Calculate concentrations for titrations', 'Determine volumes', 'Apply to various titration types'], order: 51 },
    { section: 'AS1: Acid-Base Titrations', title: 'Molarity and Standard Solutions', objectives: ['Define molarity and concentration units', 'Use mol dm-3 and g dm-3', 'Prepare standard solutions'], order: 52 },
    { section: 'AS1: Qualitative Tests', title: 'Gas Tests', objectives: ['Test for H2 O2 Cl2 CO2 HCl NH3', 'Use chemical tests for identification', 'Apply systematic testing'], order: 53 },
    { section: 'AS1: Qualitative Tests', title: 'Flame Tests', objectives: ['Carry out flame tests using nichrome wire', 'Identify Li Na K Ca Ba Cu ions', 'Understand colour observations'], order: 54 },
    { section: 'AS1: Qualitative Tests', title: 'Cation Tests', objectives: ['Use sodium hydroxide for ammonium ion', 'Warm to detect NH4 plus', 'Apply flame test identification'], order: 55 },
    { section: 'AS1: Qualitative Tests', title: 'Anion Tests', objectives: ['Use barium chloride for sulfate', 'Apply acidified silver nitrate for halides', 'Test for carbonate with dilute acid'], order: 56 },

    // AS2 Unit 2
    { section: 'AS2: Formulae and Amounts', title: 'Empirical and Molecular Formulae', objectives: ['Define empirical and molecular formulae', 'Explain relationship between them', 'Distinguish formula types'], order: 57 },
    { section: 'AS2: Formulae and Amounts', title: 'Calculating Formulae from Data', objectives: ['Calculate empirical formulae from composition', 'Determine molecular formulae', 'Use percentage composition data'], order: 58 },
    { section: 'AS2: Formulae and Amounts', title: 'Molar Gas Volume', objectives: ['Define molar gas volume', 'Calculate reacting gas volumes', 'Apply to chemical equations'], order: 59 },
    { section: 'AS2: Formulae and Amounts', title: 'Percentage Yield', objectives: ['Define percentage yield', 'Calculate yields from equations and data', 'Use yield to determine reagent amounts'], order: 60 },
    { section: 'AS2: Formulae and Amounts', title: 'Atom Economy', objectives: ['Define atom economy', 'Calculate from chemical equations', 'Compare efficiency of reactions'], order: 61 },
    { section: 'AS2: Nomenclature', title: 'Organic Chemistry Definitions', objectives: ['Define structural and geometric isomerism', 'Understand homologous series', 'Define functional group'], order: 62 },
    { section: 'AS2: Nomenclature', title: 'IUPAC Naming Rules', objectives: ['Apply IUPAC rules to name organic compounds', 'Name compounds with up to six carbons', 'Handle multiple functional groups'], order: 63 },
    { section: 'AS2: Nomenclature', title: 'Structural Isomers', objectives: ['Draw structural isomers up to six carbons', 'Name isomers systematically', 'Exclude cyclic structures'], order: 64 },
    { section: 'AS2: Nomenclature', title: 'Structural and Skeletal Formulae', objectives: ['Draw structural formulae', 'Use skeletal formulae notation', 'Convert between formula types'], order: 65 },
    { section: 'AS2: Nomenclature', title: 'Geometric Isomerism', objectives: ['Understand restricted rotation about C=C', 'Explain energy barrier', 'Identify geometric isomers'], order: 66 },
    { section: 'AS2: Nomenclature', title: 'E-Z Isomers', objectives: ['Draw E and Z isomers', 'Identify from structural formulae', 'Apply Cahn-Ingold-Prelog priority rules'], order: 67 },
    { section: 'AS2: Alkanes', title: 'Alkanes as Saturated Hydrocarbons', objectives: ['Define saturated hydrocarbons', 'Understand single C-C bonds', 'Recall general formula'], order: 68 },
    { section: 'AS2: Alkanes', title: 'Alkane Boiling Points', objectives: ['Explain boiling point variation with carbon number', 'Understand van der Waals forces', 'Relate chain length to forces'], order: 69 },
    { section: 'AS2: Alkanes', title: 'Structural Isomer Boiling Points', objectives: ['Explain boiling point differences in isomers', 'Understand branching effects', 'Apply van der Waals forces'], order: 70 },
    { section: 'AS2: Alkanes', title: 'Combustion of Alkanes', objectives: ['Describe complete and incomplete combustion', 'Link flame appearance to carbon content', 'Write combustion equations'], order: 71 },
    { section: 'AS2: Alkanes', title: 'Pollution from Alkanes', objectives: ['Recall pollutants CO carbon NOx SOx', 'Understand unburned hydrocarbons', 'Explain environmental impact'], order: 72 },
    { section: 'AS2: Alkanes', title: 'Global Warming', objectives: ['Recall CO2 increase from 0.03 to 0.04 percent', 'Understand combustion contribution', 'Explain global warming link'], order: 73 },
    { section: 'AS2: Alkanes', title: 'Catalytic Converters', objectives: ['Explain how catalytic converters work', 'Describe reduction of environmental impact', 'Understand pollutant conversion'], order: 74 },
    { section: 'AS2: Alkanes', title: 'Halogenation of Alkanes', objectives: ['Describe substitution with chlorine and bromine', 'Understand photochemical reaction', 'Write halogenation equations'], order: 75 },
    { section: 'AS2: Alkanes', title: 'Radical Mechanism Definitions', objectives: ['Define radical homolytic and heterolytic fission', 'Understand free radical formation', 'Distinguish fission types'], order: 76 },
    { section: 'AS2: Alkanes', title: 'Radical Substitution Mechanism', objectives: ['Outline initiation propagation termination', 'Explain photochemical halogenation', 'Write mechanism steps'], order: 77 },
    { section: 'AS2: Alkenes', title: 'Unsaturated Hydrocarbons', objectives: ['Define unsaturated hydrocarbon', 'Explain C=C double bond', 'Recall general formula'], order: 78 },
    { section: 'AS2: Alkenes', title: 'Test for Alkenes', objectives: ['Use bromine water qualitative test', 'Observe decolourisation', 'Distinguish from alkanes'], order: 79 },
    { section: 'AS2: Alkenes', title: 'Sigma and Pi Bonds', objectives: ['Explain sigma and pi bonding', 'Understand relative bond strength', 'Compare bond lengths'], order: 80 },
    { section: 'AS2: Alkenes', title: 'Reactivity of Alkenes', objectives: ['Recall C=C as high electron density', 'Explain reactivity difference from alkanes', 'Understand electrophilic attack'], order: 81 },
    { section: 'AS2: Alkenes', title: 'Catalytic Hydrogenation', objectives: ['Describe hydrogenation using nickel', 'Understand formation of alkanes', 'Apply to vegetable oil hardening'], order: 82 },
    { section: 'AS2: Alkenes', title: 'Addition Reactions', objectives: ['Describe reaction with Cl2 Br2 HCl HBr', 'Write addition equations', 'Understand products'], order: 83 },
    { section: 'AS2: Alkenes', title: 'Electrophilic Addition Mechanism', objectives: ['Define electrophile and heterolytic fission', 'Use curly arrows in mechanism', 'Show carbocation intermediate'], order: 84 },
    { section: 'AS2: Alkenes', title: 'Major and Minor Products', objectives: ['Explain carbocation stability', 'Predict major product with unsymmetrical alkenes', 'Apply Markovnikov rule'], order: 85 },
    { section: 'AS2: Alkenes', title: 'Addition Polymerisation', objectives: ['Describe polymerisation of ethene and propene', 'Draw polymer structures', 'Understand monomer to polymer'], order: 86 },
    { section: 'AS2: Halogenoalkanes', title: 'Halogenoalkane Boiling Points', objectives: ['Explain variation with halogen atom', 'Understand van der Waals forces', 'Compare different halogens'], order: 87 },
    { section: 'AS2: Halogenoalkanes', title: 'Isomer Boiling Points', objectives: ['Explain variation in structural isomers', 'Understand branching effects', 'Apply to same molecular formula'], order: 88 },
    { section: 'AS2: Halogenoalkanes', title: 'Classification', objectives: ['Classify as primary secondary tertiary', 'Identify carbon bonding', 'Apply to various structures'], order: 89 },
    { section: 'AS2: Halogenoalkanes', title: 'Preparation from Alcohols', objectives: ['Describe laboratory preparation', 'Use appropriate reagents', 'Understand conversion method'], order: 90 },
    { section: 'AS2: Halogenoalkanes', title: 'Nucleophilic Substitution Reactions', objectives: ['Describe reaction with aqueous alkali', 'Explain reaction with ammonia', 'Understand potassium cyanide reaction'], order: 91 },
    { section: 'AS2: Halogenoalkanes', title: 'Nucleophilic Substitution Mechanism', objectives: ['Define nucleophile', 'Outline mechanism for primary', 'Compare tertiary halogenoalkanes'], order: 92 },
    { section: 'AS2: Halogenoalkanes', title: 'Rates of Hydrolysis', objectives: ['Describe relative hydrolysis rates', 'Explain bond enthalpy effects', 'Compare C-F C-Cl C-Br C-I'], order: 93 },
    { section: 'AS2: Halogenoalkanes', title: 'Elimination Reactions', objectives: ['Describe elimination of hydrogen halides', 'Use ethanolic potassium hydroxide', 'Apply to symmetrical and unsymmetrical'], order: 94 },
    { section: 'AS2: Halogenoalkanes', title: 'CFCs and Ozone', objectives: ['Recall CFCs reduce ozone layer', 'Understand harmful UV radiation', 'Explain environmental impact'], order: 95 },
    { section: 'AS2: Alcohols', title: 'Alcohol Physical Properties', objectives: ['Explain hydrogen bonding effects', 'Understand boiling point trends', 'Describe solubility in water'], order: 96 },
    { section: 'AS2: Alcohols', title: 'Alcohol Classification', objectives: ['Classify as primary secondary tertiary', 'Identify OH position', 'Apply to various structures'], order: 97 },
    { section: 'AS2: Alcohols', title: 'Preparation from Halogenoalkanes', objectives: ['Recall nucleophilic substitution method', 'Use aqueous alkali', 'Understand conversion'], order: 98 },
    { section: 'AS2: Alcohols', title: 'Combustion of Alcohols', objectives: ['Describe complete and incomplete combustion', 'Understand use as alternative fuel', 'Write combustion equations'], order: 99 },
    { section: 'AS2: Alcohols', title: 'Alcohol Reactions', objectives: ['Describe reaction with sodium', 'Explain reaction with hydrogen bromide', 'Understand phosphorus pentachloride reaction'], order: 100 },
    { section: 'AS2: Alcohols', title: 'Oxidation of Alcohols', objectives: ['Use acidified potassium dichromate VI', 'Form aldehydes and carboxylic acids from primary', 'Form ketones from secondary'], order: 101 },
    { section: 'AS2: IR Spectroscopy', title: 'IR Absorption Principles', objectives: ['Explain absorption from molecular vibrations', 'Understand characteristic frequencies', 'Relate to functional groups'], order: 102 },
    { section: 'AS2: IR Spectroscopy', title: 'Functional Group Identification', objectives: ['Use IR spectra to deduce groups', 'Apply wavenumber data', 'Identify O-H C=O C-H peaks'], order: 103 },
    { section: 'AS2: Energetics', title: 'Exothermic and Endothermic', objectives: ['Define exothermic and endothermic', 'Understand heat changes in reactions', 'Identify reaction types'], order: 104 },
    { section: 'AS2: Energetics', title: 'Standard Conditions', objectives: ['Recall standard conditions 100 kPa 298 K', 'Understand importance of standard states', 'Apply to measurements'], order: 105 },
    { section: 'AS2: Energetics', title: 'Standard Enthalpy Change', objectives: ['Define standard enthalpy change', 'Use delta H symbol', 'Understand standard state reference'], order: 106 },
    { section: 'AS2: Energetics', title: 'Enthalpy Level Diagrams', objectives: ['Construct simple level diagrams', 'Show reactants and products', 'Indicate exothermic and endothermic'], order: 107 },
    { section: 'AS2: Energetics', title: 'Standard Enthalpy Definitions', objectives: ['Define combustion formation neutralisation', 'Use delta c H delta f H delta n H', 'Apply standard state conditions'], order: 108 },
    { section: 'AS2: Energetics', title: 'Experimental Methods', objectives: ['Recall methods to determine enthalpy changes', 'Use calorimetry techniques', 'Measure temperature changes'], order: 109 },
    { section: 'AS2: Energetics', title: 'Calculating Enthalpy Changes', objectives: ['Use q equals mc delta T', 'Calculate from experimental data', 'Convert J to kJ mol-1'], order: 110 },
    { section: 'AS2: Energetics', title: 'Conservation of Energy', objectives: ['Understand conservation principle', 'Define Hess Law', 'Apply to indirect calculations'], order: 111 },
    { section: 'AS2: Energetics', title: 'Enthalpy Cycles', objectives: ['Construct enthalpy cycles', 'Use Hess Law', 'Apply alternative routes'], order: 112 },
    { section: 'AS2: Energetics', title: 'Hess Law Calculations', objectives: ['Calculate enthalpy changes indirectly', 'Use formation and combustion data', 'Apply algebraic methods'], order: 113 },
    { section: 'AS2: Energetics', title: 'Bond Enthalpies', objectives: ['Define average bond enthalpy', 'Calculate enthalpy change from bond enthalpies', 'Understand energy to break and make bonds'], order: 114 },
    { section: 'AS2: Energetics', title: 'Calculating Bond Enthalpies', objectives: ['Determine average bond enthalpies', 'Use enthalpy changes of reaction', 'Apply to unknown bonds'], order: 115 },
    { section: 'AS2: Energetics', title: 'Differences in Methods', objectives: ['Explain why bond enthalpy calculations differ', 'Compare with Hess Law results', 'Understand average versus specific'], order: 116 },
    { section: 'AS2: Kinetics', title: 'Factors Affecting Rate', objectives: ['Recall concentration pressure temperature catalyst', 'Understand effect on reaction rate', 'Apply qualitatively'], order: 117 },
    { section: 'AS2: Kinetics', title: 'Collision Theory', objectives: ['Use collision theory to explain rate', 'Understand activation energy concept', 'Relate to factors affecting rate'], order: 118 },
    { section: 'AS2: Kinetics', title: 'Maxwell-Boltzmann Distribution', objectives: ['Understand energy distribution in gases', 'Interpret curves for different temperatures', 'Compare catalysed and uncatalysed'], order: 119 },
    { section: 'AS2: Kinetics', title: 'Activation Energy', objectives: ['Relate activation energy to distribution', 'Understand minimum energy requirement', 'Explain effect of temperature and catalysts'], order: 120 },
    { section: 'AS2: Equilibrium', title: 'Reversible Reactions', objectives: ['Understand many reactions are reversible', 'Define dynamic equilibrium', 'Distinguish homogeneous and heterogeneous'], order: 121 },
    { section: 'AS2: Equilibrium', title: 'Le Chatelier Principle', objectives: ['Deduce effects of temperature changes', 'Understand pressure and concentration effects', 'Apply to closed systems'], order: 122 },
    { section: 'AS2: Equilibrium', title: 'Equilibrium Constant Kc', objectives: ['Deduce expression for Kc', 'Determine units', 'Apply to homogeneous systems'], order: 123 },
    { section: 'AS2: Equilibrium', title: 'Magnitude of Kc', objectives: ['Relate Kc to position of equilibrium', 'Understand extent of reaction', 'Interpret large and small Kc values'], order: 124 },
    { section: 'AS2: Equilibrium', title: 'Industrial Processes', objectives: ['Describe Haber process conditions', 'Explain Contact process for sulfuric acid', 'Understand compromise conditions'], order: 125 },
    { section: 'AS2: Equilibrium', title: 'Equilibrium and Rate Compromise', objectives: ['Understand balance in chemical industry', 'Explain yield versus rate', 'Apply economic considerations'], order: 126 },
    { section: 'AS2: Group II', title: 'Group II as s-Block', objectives: ['Explain classification as s-block', 'Understand electronic configuration', 'Identify outer s electrons'], order: 127 },
    { section: 'AS2: Group II', title: 'Group II Trends', objectives: ['Recall electronic configuration trend', 'Explain atomic radius increase', 'Understand first ionisation energy decrease'], order: 128 },
    { section: 'AS2: Group II', title: 'Reactions with Oxygen Water Acids', objectives: ['Investigate reaction with oxygen', 'Describe reaction with water', 'Explain reaction with dilute acids'], order: 129 },
    { section: 'AS2: Group II', title: 'Oxide Properties', objectives: ['Describe basic nature of oxides', 'Explain reaction with water', 'Understand reaction with acids'], order: 130 },
    { section: 'AS2: Group II', title: 'Uses of Compounds', objectives: ['Recall magnesium oxide in indigestion remedies', 'Understand calcium carbonate in toothpaste', 'Apply to everyday products'], order: 131 },
    { section: 'AS2: Group II', title: 'Thermal Stability', objectives: ['State trends in carbonate stability', 'Explain hydroxide thermal stability', 'Relate to cation charge and size'], order: 132 },
    { section: 'AS2: Group II', title: 'Calcium Compounds', objectives: ['Recall calcium carbonate to calcium oxide', 'Describe calcium hydroxide formation', 'Understand use in cement and concrete'], order: 133 },
    { section: 'AS2: Group II', title: 'Solubility Trends', objectives: ['Recall sulfate solubility trend', 'Understand hydroxide solubility trend', 'Apply to qualitative tests'], order: 134 },
    { section: 'AS2: Group II', title: 'Solubility Curves', objectives: ['Draw solubility curves from data', 'Interpret experimental results', 'Understand graphical representation'], order: 135 },
  ];
}

function getChemistryA2Lessons() {
  return [
    // A2 1: Further Physical and Organic Chemistry
    { section: 'A2 1: Lattice Enthalpy', title: 'Lattice Enthalpy Definition', objectives: ['Define lattice enthalpy', 'Understand enthalpy of formation of ionic solid', 'Apply to Group I and II halides'], order: 1 },
    { section: 'A2 1: Lattice Enthalpy', title: 'Born-Haber Cycles', objectives: ['Construct Born-Haber cycles', 'Carry out associated calculations', 'Apply to halides and oxides'], order: 2 },
    { section: 'A2 1: Lattice Enthalpy', title: 'Dissolving Ionic Compounds', objectives: ['Define enthalpy changes in dissolving', 'Understand lattice and hydration enthalpies', 'Carry out calculations'], order: 3 },
    { section: 'A2 1: Thermodynamics', title: 'Feasible Change Limitations', objectives: ['Recall enthalpy alone insufficient', 'Explain endothermic feasible reactions', 'Use ammonium carbonate example'], order: 4 },
    { section: 'A2 1: Thermodynamics', title: 'Entropy and Enthalpy Balance', objectives: ['Understand balance determines feasibility', 'Relate entropy to disorder', 'Define entropy change'], order: 5 },
    { section: 'A2 1: Thermodynamics', title: 'Entropy as Disorder', objectives: ['Recall entropy measures disorder', 'Understand entropy increase', 'Apply to phase changes'], order: 6 },
    { section: 'A2 1: Thermodynamics', title: 'Standard Entropy Change', objectives: ['Calculate delta S from data', 'Use standard entropy values', 'Apply to chemical reactions'], order: 7 },
    { section: 'A2 1: Thermodynamics', title: 'Free Energy Equation', objectives: ['Use delta G equals delta H minus T delta S', 'Calculate standard free energy changes', 'Understand temperature dependence'], order: 8 },
    { section: 'A2 1: Thermodynamics', title: 'Feasibility Conditions', objectives: ['Recall processes feasible when delta G negative', 'Understand spontaneity', 'Apply to reactions'], order: 9 },
    { section: 'A2 1: Thermodynamics', title: 'Temperature Dependent Feasibility', objectives: ['Calculate temperature for feasibility change', 'Understand same sign delta H and delta S', 'Determine start or cease temperatures'], order: 10 },
    { section: 'A2 1: Reaction Rates', title: 'Rate Equations', objectives: ['Use rate equals k[A]^x[B]^y', 'Understand x and y as 0 1 or 2', 'Apply to simple systems'], order: 11 },
    { section: 'A2 1: Reaction Rates', title: 'Rate Equation Terms', objectives: ['Define rate of reaction', 'Understand order', 'Define rate constant'], order: 12 },
    { section: 'A2 1: Reaction Rates', title: 'Deducing Rate Equations', objectives: ['Deduce rate equations from data', 'Use experimental results', 'Determine orders'], order: 13 },
    { section: 'A2 1: Reaction Rates', title: 'Concentration-Time Graphs', objectives: ['Deduce rate from graphs', 'Determine order from concentration-time', 'Use rate-concentration graphs'], order: 14 },
    { section: 'A2 1: Reaction Rates', title: 'Mechanism and Rate Equation', objectives: ['Relate rate equation to mechanism', 'Explain SN1 and SN2 mechanisms', 'Apply to halogenoalkane hydrolysis'], order: 15 },
    { section: 'A2 1: Reaction Rates', title: 'Rate Determining Step', objectives: ['Define rate determining step', 'Understand slowest step controls rate', 'Deduce from rate equation'], order: 16 },
    { section: 'A2 1: Reaction Rates', title: 'Experimental Methods', objectives: ['Suggest methods to study rate', 'Use iodine titrations', 'Apply colorimetry'], order: 17 },
    { section: 'A2 1: Advanced Equilibrium', title: 'Equilibrium Calculations', objectives: ['Calculate equilibrium concentrations', 'Use given data', 'Apply to homogeneous systems'], order: 18 },
    { section: 'A2 1: Advanced Equilibrium', title: 'Calculating Kc Values', objectives: ['Calculate numerical Kc with units', 'Use equilibrium data', 'Determine appropriate units'], order: 19 },
    { section: 'A2 1: Acid-Base Equilibria', title: 'Bronsted-Lowry Theory', objectives: ['Use proton transfer concept', 'Describe acid-base equilibria', 'Identify conjugate acid-base pairs'], order: 20 },
    { section: 'A2 1: Acid-Base Equilibria', title: 'Equilibrium Constants', objectives: ['Define Kw Ka pH pKw pKa', 'Recall associated units', 'Apply to calculations'], order: 21 },
    { section: 'A2 1: Acid-Base Equilibria', title: 'pH Calculations', objectives: ['Calculate pH for strong acids', 'Determine pH for strong bases', 'Apply to weak acids'], order: 22 },
    { section: 'A2 1: Acid-Base Equilibria', title: 'Buffer Solutions', objectives: ['Define buffer solution', 'Explain qualitatively how buffers work', 'Understand resistance to pH change'], order: 23 },
    { section: 'A2 1: Acid-Base Equilibria', title: 'Buffer pH Calculations', objectives: ['Calculate pH of buffer solution', 'Use weak acid and sodium hydroxide', 'Apply Henderson-Hasselbalch'], order: 24 },
    { section: 'A2 1: Acid-Base Equilibria', title: 'Titration Curves', objectives: ['Recall experimental determination', 'Plot pH versus volume', 'Interpret curve shapes'], order: 25 },
    { section: 'A2 1: Acid-Base Equilibria', title: 'Indicator Selection', objectives: ['Use titration curves for indicator choice', 'Understand end point range', 'Apply to different titration types'], order: 26 },
    { section: 'A2 1: Acid-Base Equilibria', title: 'Salt Solution pH', objectives: ['Predict if salt solution acidic alkaline neutral', 'Base on parent acid and base strengths', 'Apply hydrolysis concepts'], order: 27 },
    { section: 'A2 1: Isomerism', title: 'Structural Isomerism Types', objectives: ['Understand structural isomers in different families', 'Distinguish chain positional functional', 'Apply to compounds'], order: 28 },
    { section: 'A2 1: Isomerism', title: 'Optical Isomerism', objectives: ['Recall asymmetric chiral centres', 'Understand non-superimposable mirror images', 'Identify chiral molecules'], order: 29 },
    { section: 'A2 1: Isomerism', title: '3D Representations', objectives: ['Draw 3D optical isomers', 'Use wedge and dash notation', 'Show tetrahedral arrangement'], order: 30 },
    { section: 'A2 1: Isomerism', title: 'Plane Polarised Light', objectives: ['Recall rotation of plane polarised light', 'Understand opposite directions', 'Define dextrorotatory and laevorotatory'], order: 31 },
    { section: 'A2 1: Isomerism', title: 'Optical Activity', objectives: ['Define optically active', 'Explain racemic mixtures', 'Understand optical inactivity'], order: 32 },
    { section: 'A2 1: Isomerism', title: 'Drug Stereochemistry', objectives: ['Understand drug action and stereochemistry', 'Explain receptor site stereospecificity', 'Apply to pharmaceuticals'], order: 33 },
    { section: 'A2 1: Carbonyl Compounds', title: 'Aldehyde and Ketone Formulae', objectives: ['Recall molecular and structural formulae', 'Include branched structures up to six carbons', 'Distinguish aldehyde from ketone'], order: 34 },
    { section: 'A2 1: Carbonyl Compounds', title: 'Physical Properties', objectives: ['Explain boiling points', 'Describe solubility', 'Reference intermolecular forces'], order: 35 },
    { section: 'A2 1: Carbonyl Compounds', title: 'Preparation by Oxidation', objectives: ['Recall preparation from alcohols', 'Use suitable oxidising agents', 'Distinguish primary and secondary'], order: 36 },
    { section: 'A2 1: Carbonyl Compounds', title: 'Reaction with Hydrogen Cyanide', objectives: ['Recall HCN addition', 'Understand nucleophilic attack', 'Form hydroxynitriles'], order: 37 },
    { section: 'A2 1: Carbonyl Compounds', title: 'Nucleophilic Addition Mechanism', objectives: ['Describe mechanism with HCN and propanone', 'Use curly arrows', 'Show intermediate'], order: 38 },
    { section: 'A2 1: Carbonyl Compounds', title: 'Racemic Mixtures', objectives: ['Explain formation of racemic mixtures', 'Understand planar carbonyl group', 'Apply to HCN reactions'], order: 39 },
    { section: 'A2 1: Carbonyl Compounds', title: 'Reaction with 2,4-DNP', objectives: ['Recall reaction with 2,4-dinitrophenylhydrazine', 'Form orange precipitate', 'Use for identification'], order: 40 },
    { section: 'A2 1: Carbonyl Compounds', title: 'Derivative Preparation', objectives: ['Prepare 2,4-dinitrophenylhydrazones', 'Recrystallise product', 'Determine melting point'], order: 41 },
    { section: 'A2 1: Carbonyl Compounds', title: 'Distinguishing Aldehydes and Ketones', objectives: ['Use acidified potassium dichromate VI', 'Apply Fehling solution', 'Use Tollens reagent'], order: 42 },
    { section: 'A2 1: Carbonyl Compounds', title: 'Reduction with Lithal', objectives: ['Reduce using lithium tetrahydridoaluminate III', 'Form primary alcohols from aldehydes', 'Form secondary alcohols from ketones'], order: 43 },
    { section: 'A2 1: Carboxylic Acids', title: 'Carboxylic Acid Formulae', objectives: ['Recall molecular and structural formulae', 'Include branched structures up to six carbons', 'Identify carboxyl group'], order: 44 },
    { section: 'A2 1: Carboxylic Acids', title: 'Physical Properties', objectives: ['Explain boiling points', 'Describe solubility', 'Reference hydrogen bonding'], order: 45 },
    { section: 'A2 1: Carboxylic Acids', title: 'Preparation Methods', objectives: ['Prepare from primary alcohols', 'Oxidise aldehydes', 'Use appropriate oxidising agents'], order: 46 },
    { section: 'A2 1: Carboxylic Acids', title: 'Hydrolysis Routes', objectives: ['Form from ester hydrolysis', 'Prepare from nitrile hydrolysis', 'Use acid or base catalysis'], order: 47 },
    { section: 'A2 1: Carboxylic Acids', title: 'Salt Formation', objectives: ['Form salts with sodium carbonate', 'React with sodium hydroxide', 'Use ammonia'], order: 48 },
    { section: 'A2 1: Carboxylic Acids', title: 'Carboxylic Acid Reactions', objectives: ['React with alcohols', 'Use phosphorus pentachloride', 'Reduce with lithal'], order: 49 },
    { section: 'A2 1: Carboxylic Derivatives', title: 'Esters and Acyl Chlorides', objectives: ['Recall esters and acyl chlorides as derivatives', 'Understand functional groups', 'Distinguish structures'], order: 50 },
    { section: 'A2 1: Carboxylic Derivatives', title: 'Ester and Acyl Chloride Formulae', objectives: ['Recall molecular and structural formulae', 'Identify monoesters', 'Recognize acyl chloride group'], order: 51 },
    { section: 'A2 1: Carboxylic Derivatives', title: 'Ester Physical Properties', objectives: ['Explain boiling points', 'Describe solubility', 'Reference intermolecular forces'], order: 52 },
    { section: 'A2 1: Carboxylic Derivatives', title: 'Ester Formation', objectives: ['Form from carboxylic acids and alcohols', 'Use acyl chlorides', 'Understand esterification'], order: 53 },
    { section: 'A2 1: Carboxylic Derivatives', title: 'Laboratory Ester Preparation', objectives: ['Prepare liquid ester', 'Use carboxylic acid and alcohol', 'Apply heating and acid catalyst'], order: 54 },
    { section: 'A2 1: Carboxylic Derivatives', title: 'Fats and Oils', objectives: ['Understand structure as esters of glycerol', 'Identify fatty acids', 'Distinguish saturated and unsaturated'], order: 55 },
    { section: 'A2 1: Carboxylic Derivatives', title: 'Transesterification', objectives: ['Recall reactions with alcohols and acids', 'Produce biodiesel', 'Form margarines'], order: 56 },
    { section: 'A2 1: Carboxylic Derivatives', title: 'Acyl Chloride Reactions', objectives: ['React with water', 'React with alcohols', 'Understand vigorous nature'], order: 57 },
    { section: 'A2 1: Aromatic Chemistry', title: 'Benzene Structure', objectives: ['Explain delocalised pi electrons', 'Understand resonance stability', 'Describe hexagonal structure'], order: 58 },
    { section: 'A2 1: Aromatic Chemistry', title: 'Benzene Reactivity', objectives: ['Explain resistance to addition', 'Compare with alkene reactivity', 'Relate to pi electron stability'], order: 59 },
    { section: 'A2 1: Aromatic Chemistry', title: 'Electrophilic Substitution Mechanisms', objectives: ['Explain monobromination mechanism', 'Describe mononitration', 'Understand monoalkylation and monoacylation'], order: 60 },
    { section: 'A2 1: Aromatic Chemistry', title: 'Electrophile Formation', objectives: ['Write equations for electrophile generation', 'Recall Br+ and NO2+ as electrophiles', 'Understand catalyst role'], order: 61 },
    { section: 'A2 1: Aromatic Chemistry', title: 'Nitration Practical', objectives: ['Prepare methyl-3-nitrobenzoate', 'Start from methyl benzoate', 'Illustrate nitration'], order: 62 },

    // A2 2: Analytical, Transition Metals, Electrochemistry and Organic Nitrogen
    { section: 'A2 2: Mass Spectrometry', title: 'Mass Spectrum Features', objectives: ['Identify base peak molecular ion M+1', 'Recognize fragmentation ions', 'Interpret peak heights'], order: 63 },
    { section: 'A2 2: Mass Spectrometry', title: 'Fragmentation Patterns', objectives: ['Suggest formulae for fragment ions', 'Analyze fragmentation', 'Apply to structure determination'], order: 64 },
    { section: 'A2 2: Mass Spectrometry', title: 'High Resolution MS', objectives: ['Distinguish molecules of same RMM', 'Use accurate mass', 'Apply to molecular formula'], order: 65 },
    { section: 'A2 2: NMR Spectroscopy', title: 'Low vs High Resolution NMR', objectives: ['Understand difference in resolution', 'Explain information from each', 'Apply to structure determination'], order: 66 },
    { section: 'A2 2: NMR Spectroscopy', title: 'TMS as Standard', objectives: ['Understand reasons for using TMS', 'Define chemical shift scale', 'Explain zero reference'], order: 67 },
    { section: 'A2 2: NMR Spectroscopy', title: 'Chemical Equivalence', objectives: ['Recognize chemically equivalent hydrogens', 'Understand symmetry', 'Identify unique environments'], order: 68 },
    { section: 'A2 2: NMR Spectroscopy', title: 'Chemical Shifts', objectives: ['Understand shifts depend on environment', 'Use chemical shift tables', 'Identify functional groups'], order: 69 },
    { section: 'A2 2: NMR Spectroscopy', title: 'Integration Curves', objectives: ['Use integration to determine relative numbers', 'Understand peak area', 'Apply to hydrogen count'], order: 70 },
    { section: 'A2 2: NMR Spectroscopy', title: 'Spin-Spin Splitting', objectives: ['Apply n+1 rule', 'Analyze doublets triplets quartets', 'Understand adjacent hydrogen effect'], order: 71 },
    { section: 'A2 2: NMR Spectroscopy', title: 'Structure Deduction', objectives: ['Deduce molecular structure from NMR', 'Combine splitting and shifts', 'Apply to simple patterns'], order: 72 },
    { section: 'A2 2: Volumetric Analysis', title: 'Iodine Thiosulfate Titrations', objectives: ['Titrate iodine with sodium thiosulfate', 'Use starch indicator', 'Estimate oxidising agents'], order: 73 },
    { section: 'A2 2: Volumetric Analysis', title: 'Manganate VII Titrations', objectives: ['Titrate acidified potassium manganate VII', 'Use with iron II and reducing agents', 'Self-indicating'], order: 74 },
    { section: 'A2 2: Volumetric Analysis', title: 'Redox Titration Equations', objectives: ['Deduce titration equations', 'Use half-equations', 'Combine oxidant and reductant'], order: 75 },
    { section: 'A2 2: Volumetric Analysis', title: 'Back Titration', objectives: ['Understand back titration method', 'Determine purity of Group II compounds', 'Apply to metal oxides and carbonates'], order: 76 },
    { section: 'A2 2: Chromatography', title: 'Paper and TLC', objectives: ['Describe one-way and two-way paper', 'Explain thin-layer chromatography', 'Carry out qualitatively and quantitatively'], order: 77 },
    { section: 'A2 2: Chromatography', title: 'Gas-Liquid Chromatography', objectives: ['Describe GLC technique', 'Interpret percentage composition', 'Understand retention time'], order: 78 },
    { section: 'A2 2: Chromatography', title: 'Rf Values', objectives: ['Interpret chromatograms', 'Calculate Rf values', 'Apply to one-way and two-way'], order: 79 },
    { section: 'A2 2: Transition Metals', title: 'Transition Metal Properties', objectives: ['Recall incomplete d-shell', 'Understand variable oxidation states', 'Identify catalytic activity and coloured complexes'], order: 80 },
    { section: 'A2 2: Transition Metals', title: 'Electronic Configuration', objectives: ['Deduce configuration of metals and ions', 'Explain stability from subshell filling', 'Apply to scandium to zinc'], order: 81 },
    { section: 'A2 2: Transition Metals', title: 'Complex Formation', objectives: ['Understand complexes with central metal', 'Define ligands as lone pair donors', 'Identify coordination'], order: 82 },
    { section: 'A2 2: Transition Metals', title: 'Ligands', objectives: ['Explain ligands contain lone pairs', 'Understand donation to metal', 'Distinguish anions and molecules'], order: 83 },
    { section: 'A2 2: Transition Metals', title: 'Coordination Numbers', objectives: ['Define coordination number', 'Deduce from complex structure', 'Apply to various complexes'], order: 84 },
    { section: 'A2 2: Transition Metals', title: 'Oxidation Numbers in Complexes', objectives: ['Deduce oxidation number', 'Explain redox and disproportionation', 'Apply to complex ions'], order: 85 },
    { section: 'A2 2: Transition Metals', title: 'Ligand Types', objectives: ['Distinguish monodentate Cl H2O NH3', 'Understand bidentate en', 'Explain polydentate edta'], order: 86 },
    { section: 'A2 2: Transition Metals', title: 'Ligand Strength', objectives: ['Explain relative strengths', 'Understand lone pair availability', 'Apply to displacement'], order: 87 },
    { section: 'A2 2: Transition Metals', title: 'Ligand Replacement', objectives: ['Understand hexaaquacopper II reactions', 'Use concentrated HCl and ammonia', 'Observe colours and shapes'], order: 88 },
    { section: 'A2 2: Transition Metals', title: 'Entropy and Ligand Exchange', objectives: ['Explain positive entropy changes', 'Understand bidentate displacing monodentate', 'Apply thermodynamics'], order: 89 },
    { section: 'A2 2: Transition Metals', title: 'Complex Colours', objectives: ['Recall colours of aqueous complexes', 'Identify Cr3+ Mn2+ Fe2+ Fe3+ Co2+ Ni2+ Cu2+', 'Include vanadium oxidation states'], order: 90 },
    { section: 'A2 2: Transition Metals', title: 'Hydroxide Precipitation', objectives: ['Use NaOH and NH3 for detection', 'Form precipitates of hydroxides', 'Observe subsequent dissolution'], order: 91 },
    { section: 'A2 2: Transition Metals', title: 'Vanadium Reduction', objectives: ['Reduce VO2+ with zinc', 'Form VO2+ V3+ V2+', 'Observe colour sequence'], order: 92 },
    { section: 'A2 2: Transition Metals', title: 'Vanadium Interconversion', objectives: ['Deduce reagents from emf values', 'Combine half-cells', 'Write overall equations'], order: 93 },
    { section: 'A2 2: Electrochemistry', title: 'Standard Electrode Potential', objectives: ['Define standard electrode potential', 'Explain hydrogen electrode construction', 'Understand importance of conditions'], order: 94 },
    { section: 'A2 2: Electrochemistry', title: 'Predicting Reactions', objectives: ['Use electrode potentials for feasibility', 'Predict direction of reactions', 'Calculate emf'], order: 95 },
    { section: 'A2 2: Electrochemistry', title: 'Limitations of Predictions', objectives: ['Understand concentration effects', 'Explain kinetic limitations', 'Apply to real systems'], order: 96 },
    { section: 'A2 2: Electrochemistry', title: 'Cell Representations', objectives: ['Use conventional cell notation', 'Understand double line for salt bridge', 'Write half-cells correctly'], order: 97 },
    { section: 'A2 2: Electrochemistry', title: 'Cell Types', objectives: ['Classify non-rechargeable cells', 'Identify rechargeable cells', 'Understand fuel cells'], order: 98 },
    { section: 'A2 2: Electrochemistry', title: 'Lithium Cells', objectives: ['Understand electrode reactions', 'Explain lithium oxidation', 'Describe cathode reduction'], order: 99 },
    { section: 'A2 2: Electrochemistry', title: 'Fuel Cells', objectives: ['Understand fuel plus oxygen generates voltage', 'Explain energy from reaction', 'Apply to hydrogen-oxygen'], order: 100 },
    { section: 'A2 2: Electrochemistry', title: 'Environmental Issues', objectives: ['Recall electrode reactions in alkaline fuel cell', 'Understand disposal problems', 'Explain environmental concerns'], order: 101 },
    { section: 'A2 2: Amines', title: 'Amine Formulae and Classification', objectives: ['Recall formulae up to six carbons', 'Distinguish primary secondary tertiary', 'Understand amine structures'], order: 102 },
    { section: 'A2 2: Amines', title: 'Amine Physical Properties', objectives: ['Explain hydrogen bonding effect', 'Describe boiling points', 'Understand solubility in water'], order: 103 },
    { section: 'A2 2: Amines', title: 'Preparation from Nitriles', objectives: ['Reduce nitriles with lithal', 'Form primary aliphatic amines', 'Understand mechanism'], order: 104 },
    { section: 'A2 2: Amines', title: 'Preparation from Halides', objectives: ['React ammonia with alkyl halides', 'Form primary amines', 'Understand excess ammonia need'], order: 105 },
    { section: 'A2 2: Amines', title: 'Phenylamine Preparation', objectives: ['Reduce nitrobenzene with tin and HCl', 'Form phenylammonium salt', 'Liberate amine with alkali'], order: 106 },
    { section: 'A2 2: Amines', title: 'Amine Salts', objectives: ['Form salts with mineral acids', 'Liberate amines using alkali', 'Understand protonation'], order: 107 },
    { section: 'A2 2: Amines', title: 'Relative Basicity', objectives: ['Explain basic strengths', 'Compare ammonia and aliphatic amines', 'Understand phenylamine weakness'], order: 108 },
    { section: 'A2 2: Amines', title: 'Amine Reactions', objectives: ['React with ethanoyl chloride', 'Use to identify amines', 'Form amides'], order: 109 },
    { section: 'A2 2: Diazo Compounds', title: 'Diazonium Salt Formation', objectives: ['Form benzenediazonium chloride', 'Use phenylamine', 'Understand coupling reactions'], order: 110 },
    { section: 'A2 2: Diazo Compounds', title: 'Azo Dye Formation', objectives: ['Couple diazonium ions with phenol', 'React with phenylamine', 'Understand delocalisation and colour'], order: 111 },
    { section: 'A2 2: Amides', title: 'Amide Preparation', objectives: ['Form from carboxylic acids and ammonia', 'React amines with acyl chlorides', 'Understand condensation'], order: 112 },
    { section: 'A2 2: Amides', title: 'Amide Hydrolysis', objectives: ['Hydrolyse with acids', 'Use alkalis', 'Form carboxylic acids'], order: 113 },
    { section: 'A2 2: Amides', title: 'Amide Dehydration and Basicity', objectives: ['Dehydrate with phosphorus pentoxide', 'Form nitriles', 'Explain weak basicity'], order: 114 },
    { section: 'A2 2: Amino Acids', title: 'Glycine and Alanine', objectives: ['Recall formulae of glycine and alanine', 'Identify amino and carboxyl groups', 'Understand structure'], order: 115 },
    { section: 'A2 2: Amino Acids', title: 'Optical Activity', objectives: ['Explain optical activity', 'Identify chiral centres', 'Understand enantiomers'], order: 116 },
    { section: 'A2 2: Amino Acids', title: 'Zwitterions', objectives: ['Explain dipolar ion formation', 'Understand internal proton transfer', 'Define zwitterion'], order: 117 },
    { section: 'A2 2: Amino Acids', title: 'Solubility and Melting Point', objectives: ['Explain solubility in water', 'Understand high melting points', 'Relate to ionic nature'], order: 118 },
    { section: 'A2 2: Amino Acids', title: 'Amino Acid Reactions', objectives: ['React with sodium carbonate', 'Use copper II sulfate', 'Apply nitrous acid test'], order: 119 },
    { section: 'A2 2: Amino Acids', title: 'Protein Structure', objectives: ['Recall primary secondary tertiary', 'Understand peptide link formation', 'Explain folding'], order: 120 },
    { section: 'A2 2: Amino Acids', title: 'Enzymes as Catalysts', objectives: ['Define enzymes as biological catalysts', 'Use induced fit concept', 'Explain enzyme action'], order: 121 },
    { section: 'A2 2: Amino Acids', title: 'Enzyme Applications', objectives: ['Recall use in washing powders', 'Understand economic advantage', 'Explain lower temperature operation'], order: 122 },
    { section: 'A2 2: Amino Acids', title: 'Enzyme Mechanism', objectives: ['Explain enzyme as protein', 'Provide lower activation energy path', 'Understand catalysis'], order: 123 },
    { section: 'A2 2: Amino Acids', title: 'Factors Affecting Enzymes', objectives: ['Explain pH effect', 'Understand temperature effect', 'Relate to denaturation'], order: 124 },
    { section: 'A2 2: Polymers', title: 'Condensation Polymers', objectives: ['Understand formation from COOH OH NH2', 'Draw polymer structures from monomers', 'Deduce monomers from polymers'], order: 125 },
    { section: 'A2 2: Polymers', title: 'Polyester PET', objectives: ['Understand formation of polyethylene terephthalate', 'Describe structure', 'Recall uses'], order: 126 },
    { section: 'A2 2: Polymers', title: 'Polyamide Nylon', objectives: ['Understand nylon formation', 'Describe structure', 'Recall uses'], order: 127 },
    { section: 'A2 2: Polymers', title: 'Polymer Biodegradability', objectives: ['Recall polyesters and polyamides can hydrolyse', 'Understand biodegradability', 'Compare with addition polymers'], order: 128 },
    { section: 'A2 2: Chemistry in Medicine', title: 'Indigestion Remedies', objectives: ['Recall use of hydroxides and carbonates', 'Cure excess stomach acid', 'Link to acid-base'], order: 129 },
    { section: 'A2 2: Chemistry in Medicine', title: 'Back Titration Analysis', objectives: ['Determine percentage active ingredient', 'Use back titration', 'Apply to indigestion remedies'], order: 130 },
    { section: 'A2 2: Chemistry in Medicine', title: 'Skin pH', objectives: ['Recall methods for excessive pH', 'Explain corrosive chemicals for warts', 'Link to acid-base'], order: 131 },
    { section: 'A2 2: Chemistry in Medicine', title: 'Silver Nitrate Uses', objectives: ['Recall use in eye disease treatment', 'Explain antimicrobial properties', 'Understand applications'], order: 132 },
    { section: 'A2 2: Chemistry in Medicine', title: 'Anticancer Drugs', objectives: ['Explain cisplatin action', 'Prevent DNA replication', 'Understand structure variation effects'], order: 133 },
    { section: 'A2 2: Chemistry in Medicine', title: 'Aspirin Analysis', objectives: ['Use volumetric analysis', 'Determine aspirin concentration', 'Link to volumetric analysis'], order: 134 },
    { section: 'A2 2: Chemistry in Medicine', title: 'Aspirin Synthesis', objectives: ['Synthesise from salicylic acid', 'Use ethanoic anhydride', 'Understand sodium salt use'], order: 135 },
    { section: 'A2 2: Chemistry in Medicine', title: 'Drug Purity Analysis', objectives: ['Use TLC and GLC MS', 'Identify drugs and purity', 'Link to chromatography'], order: 136 },
    { section: 'A2 2: Chemistry in Medicine', title: 'Haemoglobin and Oxygen', objectives: ['Explain iron II role', 'Understand oxygen transportation', 'Describe carbon monoxide poisoning'], order: 137 },
    { section: 'A2 2: Chemistry in Medicine', title: 'EDTA as Sequestering Agent', objectives: ['Explain sequestering calcium ions', 'Prevent blood clotting', 'Link to transition metals'], order: 138 },
  ];
}

function getPhysicsASLessons() {
  return [
    // AS1: Physical Quantities and Scalars/Vectors (5 lessons)
    { section: 'AS1: Physical Quantities', title: 'Physical Quantities and Units', objectives: ['Describe physical quantities as magnitude and unit', 'State base units mass length time current temperature amount', 'Use prefixes T G M k c m µ n p f and standard form'], order: 1 },
    { section: 'AS1: Scalars and Vectors', title: 'Scalars and Vectors', objectives: ['Distinguish between scalar and vector quantities', 'Give examples of each type', 'Understand vector direction importance'], order: 2 },
    { section: 'AS1: Scalars and Vectors', title: 'Vector Resolution', objectives: ['Resolve vector into perpendicular components', 'Calculate resultant of coplanar vectors', 'Use scale drawing or calculation'], order: 3 },
    { section: 'AS1: Scalars and Vectors', title: 'Forces in Equilibrium', objectives: ['Solve problems with coplanar forces at point', 'Apply equilibrium conditions', 'Use two or three forces'], order: 4 },
    { section: 'AS1: Moments', title: 'Principle of Moments', objectives: ['Define moment of force about point', 'Use concept of centre of gravity', 'Apply principle of moments'], order: 5 },

    // AS1: Linear Motion (4 lessons)
    { section: 'AS1: Linear Motion', title: 'Displacement Velocity and Acceleration', objectives: ['Define displacement velocity average velocity', 'Define acceleration', 'Distinguish from distance and speed'], order: 6 },
    { section: 'AS1: Linear Motion', title: 'Equations of Motion', objectives: ['Recall and use equations for uniform acceleration', 'Apply to vertical and horizontal motion', 'Solve kinematics problems'], order: 7 },
    { section: 'AS1: Linear Motion', title: 'Measuring Acceleration of Free Fall', objectives: ['Describe experiment with light gates', 'Use computer software for data collection', 'Determine g experimentally'], order: 8 },
    { section: 'AS1: Linear Motion', title: 'Motion Graphs', objectives: ['Interpret velocity-time graphs qualitatively', 'Interpret displacement-time graphs quantitatively', 'Analyze uniform and non-uniform acceleration'], order: 9 },

    // AS1: Dynamics (3 lessons)
    { section: 'AS1: Dynamics', title: 'Projectile Motion', objectives: ['Describe projectile motion', 'Explain uniform velocity in one direction', 'Understand uniform acceleration perpendicular'], order: 10 },
    { section: 'AS1: Dynamics', title: 'Projectile Equations', objectives: ['Apply equations of motion to projectiles', 'Exclude air resistance', 'Solve trajectory problems'], order: 11 },
    { section: 'AS1: Dynamics', title: 'Newton Laws of Motion', objectives: ['State Newton three laws of motion', 'Apply laws to simple situations', 'Use F equals ma with constant mass'], order: 12 },

    // AS1: Dynamics and Friction (2 lessons)
    { section: 'AS1: Dynamics', title: 'Friction Forces', objectives: ['Understand friction opposes motion', 'Apply to real-world scenarios', 'Calculate with friction present'], order: 13 },
    { section: 'AS1: Momentum', title: 'Linear Momentum', objectives: ['Define momentum', 'Calculate momentum', 'Apply conservation of linear momentum'], order: 14 },

    // AS1: Momentum and Impulse (6 lessons)
    { section: 'AS1: Momentum', title: 'Collisions in One Dimension', objectives: ['Perform calculations for one-dimensional collisions', 'Apply momentum conservation', 'Solve collision problems'], order: 15 },
    { section: 'AS1: Momentum', title: 'Elastic and Inelastic Collisions', objectives: ['Describe and confirm elastic collisions', 'Identify inelastic collisions by calculation', 'Understand kinetic energy changes'], order: 16 },
    { section: 'AS1: Momentum', title: 'Impulse', objectives: ['Define impulse as F times t', 'Recall and use Ft equals mv minus mu', 'Apply impulse-momentum relationship'], order: 17 },
    { section: 'AS1: Momentum', title: 'Impact Situations', objectives: ['Apply impulse to impact scenarios', 'Calculate forces in collisions', 'Understand safety applications'], order: 18 },
    { section: 'AS1: Momentum', title: 'Newton Second Law and Momentum', objectives: ['Define Newton second law in terms of momentum', 'Relate force to rate of change of momentum', 'Apply to variable mass systems'], order: 19 },

    // AS1: Work Energy and Power (8 lessons)
    { section: 'AS1: Work and Energy', title: 'Work Done and Energy Transfer', objectives: ['Define work done potential energy kinetic energy', 'Show work transfers energy between forms', 'Calculate work for constant forces'], order: 20 },
    { section: 'AS1: Work and Energy', title: 'Work at Angles', objectives: ['Calculate work for forces not along line of motion', 'Use component of force', 'Apply to inclined planes'], order: 21 },
    { section: 'AS1: Work and Energy', title: 'Potential and Kinetic Energy', objectives: ['Recall and use delta PE equals mg delta h', 'Use KE equals half mv squared', 'Convert between energy forms'], order: 22 },
    { section: 'AS1: Work and Energy', title: 'Conservation of Energy', objectives: ['State principle of conservation of energy', 'Calculate exchanges between gravitational PE and KE', 'Apply to pendulums and falling objects'], order: 23 },
    { section: 'AS1: Work and Energy', title: 'Work-Energy Equation', objectives: ['Use half mv squared minus half mu squared equals Fs', 'Apply for constant force', 'Solve energy problems'], order: 24 },
    { section: 'AS1: Work and Energy', title: 'Power Definitions', objectives: ['Recall P equals work done over time', 'Use P equals Fv', 'Calculate power in various situations'], order: 25 },
    { section: 'AS1: Work and Energy', title: 'Efficiency', objectives: ['Define efficiency as useful energy output over input', 'Calculate power efficiency', 'Understand energy conservation importance'], order: 26 },
    { section: 'AS1: Work and Energy', title: 'Energy Conservation in Society', objectives: ['Demonstrate understanding of energy conservation importance', 'Explain energy efficiency benefits', 'Apply to societal contexts'], order: 27 },

    // AS1: Electricity - Current and Voltage (5 lessons)
    { section: 'AS1: Electric Current', title: 'Current and Charge', objectives: ['Recall and use I equals Q over t', 'Define electric current', 'Calculate charge flow'], order: 28 },
    { section: 'AS1: Electric Current', title: 'Potential Difference and EMF', objectives: ['Recall and use V equals W over q', 'Use V equals P over I', 'Define the volt'], order: 29 },
    { section: 'AS1: Electric Current', title: 'Electromotive Force', objectives: ['Define electromotive force E', 'Distinguish between EMF and potential difference', 'Understand energy per unit charge'], order: 30 },

    // AS1: Resistance (11 lessons)
    { section: 'AS1: Resistance', title: 'Series and Parallel Circuits', objectives: ['Perform experiments on current voltage resistance', 'Confirm relationships in series and parallel', 'Use equations for resistors'], order: 31 },
    { section: 'AS1: Resistance', title: 'Ohm Law', objectives: ['State Ohm law', 'Recall and use R equals V over I', 'Apply to circuit calculations'], order: 32 },
    { section: 'AS1: Resistance', title: 'Resistivity', objectives: ['Define resistivity', 'Recall and use R equals rho l over A', 'Perform experiment to measure resistivity'], order: 33 },
    { section: 'AS1: Resistance', title: 'Superconductivity', objectives: ['Demonstrate knowledge of superconductivity', 'Understand zero resistance below critical temperature', 'Apply to modern technologies'], order: 34 },
    { section: 'AS1: Resistance', title: 'Ohmic and Non-Ohmic Behaviour', objectives: ['Distinguish ohmic from non-ohmic conductors', 'Identify linear and non-linear IV characteristics', 'Understand Ohm law limitations'], order: 35 },
    { section: 'AS1: Resistance', title: 'Current-Voltage Characteristics', objectives: ['Perform experiments for IV characteristics', 'Test metallic conductors and filament bulbs', 'Plot and interpret graphs'], order: 36 },
    { section: 'AS1: Resistance', title: 'Diodes and Thermistors', objectives: ['Sketch IV for metallic conductor diode NTC thermistor', 'Describe current-voltage behaviour', 'Explain semiconductor properties'], order: 37 },
    { section: 'AS1: Resistance', title: 'Temperature and Resistance', objectives: ['Sketch resistance variation with temperature', 'Compare metallic conductor and NTC thermistor', 'Explain atomic vibrations and charge carriers'], order: 38 },
    { section: 'AS1: Resistance', title: 'NTC Thermistor Experiment', objectives: ['Perform experiment on thermistor resistance', 'Show variation with temperature', 'Plot and analyze results'], order: 39 },
    { section: 'AS1: Resistance', title: 'Internal Resistance', objectives: ['Understand consequences of internal resistance', 'Use V equals E minus Ir', 'Apply to real power sources'], order: 40 },
    { section: 'AS1: Resistance', title: 'Measuring Internal Resistance', objectives: ['Perform experiment to measure internal resistance', 'Determine EMF experimentally', 'Plot terminal PD versus current'], order: 41 },

    // AS1: Potential Divider (2 lessons)
    { section: 'AS1: Potential Divider', title: 'Potential Divider Circuits', objectives: ['Understand use of potential divider', 'Supply variable PD from fixed supply', 'Calculate output voltages'], order: 42 },
    { section: 'AS1: Potential Divider', title: 'Control Circuits', objectives: ['Demonstrate use in lighting and heating control', 'Calculate output in loaded circuits', 'Apply to sensor circuits'], order: 43 },

    // AS2: Waves (8 lessons)
    { section: 'AS2: Waves', title: 'Transverse and Longitudinal Waves', objectives: ['Demonstrate knowledge of transverse and longitudinal waves', 'Categorise waves by type', 'Give examples of each'], order: 44 },
    { section: 'AS2: Waves', title: 'Wave Properties from Graphs', objectives: ['Analyze graphs for amplitude period frequency', 'Obtain wavelength and phase data', 'Interpret wave representations'], order: 45 },
    { section: 'AS2: Waves', title: 'Polarisation', objectives: ['Understand polarisation in transverse waves', 'Demonstrate polarisation phenomenon', 'Apply to light and radio waves'], order: 46 },
    { section: 'AS2: Waves', title: 'Wave Equations', objectives: ['Recall and use f equals one over T', 'Use v equals f lambda', 'Solve wave speed problems'], order: 47 },
    { section: 'AS2: Waves', title: 'Electromagnetic Spectrum', objectives: ['Recall regions radio micro infrared visible UV X-ray gamma', 'State typical wavelengths for each region', 'Recall violet 400 nm red 700 nm'], order: 48 },

    // AS2: Refraction (5 lessons)
    { section: 'AS2: Refraction', title: 'Snell Law and Refractive Index', objectives: ['Perform experiment to verify Snell law', 'Measure refractive index', 'Recall and use n equals c over v and sin i over sin r'], order: 49 },
    { section: 'AS2: Refraction', title: 'Total Internal Reflection', objectives: ['Demonstrate knowledge of total internal reflection', 'Understand critical angle', 'Apply to optical fibres'], order: 50 },
    { section: 'AS2: Refraction', title: 'Critical Angle', objectives: ['Recall and use sin c equals one over n', 'Calculate critical angles', 'Apply to different media'], order: 51 },
    { section: 'AS2: Refraction', title: 'Optical Fibres', objectives: ['Understand step index optical fibre principle', 'Explain total internal reflection at core-cladding boundary', 'Describe speed in core'], order: 52 },
    { section: 'AS2: Refraction', title: 'Flexible Endoscope', objectives: ['Describe structure of flexible endoscope', 'Discuss medical applications', 'Understand industrial uses'], order: 53 },

    // AS2: Lenses (6 lessons)
    { section: 'AS2: Lenses', title: 'Ray Diagrams for Lenses', objectives: ['Draw ray diagrams for converging lenses', 'Draw diagrams for diverging lenses', 'Locate images'], order: 54 },
    { section: 'AS2: Lenses', title: 'Lens Equation', objectives: ['Use lens equation one over f equals one over u plus one over v', 'Apply to converging and diverging lenses', 'Calculate image positions'], order: 55 },
    { section: 'AS2: Lenses', title: 'Experimental Verification', objectives: ['Verify lens equation experimentally', 'Evaluate focal length f', 'Work with real images only'], order: 56 },
    { section: 'AS2: Lenses', title: 'Magnification', objectives: ['Define m as image height over object height', 'Recall and use m equals v over u', 'Calculate magnifications'], order: 57 },
    { section: 'AS2: Lenses', title: 'Vision Correction', objectives: ['Describe lenses to correct myopia', 'Explain correction of hypermetropia', 'Understand near and far sight'], order: 58 },
    { section: 'AS2: Lenses', title: 'Vision Calculations', objectives: ['Perform calculations on vision correction', 'Calculate new range of vision', 'Determine lens power'], order: 59 },

    // AS2: Superposition and Interference (11 lessons)
    { section: 'AS2: Superposition', title: 'Superposition Principle', objectives: ['Illustrate superposition by graphical addition', 'Add two sinusoidal waves', 'Understand resultant wave'], order: 60 },
    { section: 'AS2: Superposition', title: 'Standing Waves', objectives: ['Understand conditions for standing waves', 'Explain node and antinode formation', 'Distinguish from progressive waves'], order: 61 },
    { section: 'AS2: Superposition', title: 'Standing Waves in Strings and Pipes', objectives: ['Demonstrate knowledge of standing waves in strings', 'Understand air in pipes closed at one end', 'Use graphical representations'], order: 62 },
    { section: 'AS2: Superposition', title: 'Modes of Vibration', objectives: ['Identify modes in stretched strings', 'Identify modes in air columns', 'Recognize fundamental and higher modes'], order: 63 },
    { section: 'AS2: Superposition', title: 'Nodes and Antinodes', objectives: ['Identify node positions', 'Identify antinode positions', 'Relate to wavelength'], order: 64 },
    { section: 'AS2: Superposition', title: 'Speed of Sound Experiment', objectives: ['Perform experiment with resonance tube', 'Measure speed of sound in air', 'Apply standing wave principles'], order: 65 },
    { section: 'AS2: Interference', title: 'Conditions for Interference', objectives: ['Understand conditions for observable interference', 'Explain coherent sources requirement', 'Apply to wave phenomena'], order: 66 },
    { section: 'AS2: Interference', title: 'Path and Phase Difference', objectives: ['Understand significance of path difference', 'Explain phase difference in interference', 'Relate constructive and destructive interference'], order: 67 },
    { section: 'AS2: Interference', title: 'Young Slits Experiment', objectives: ['Describe Young slits interference', 'Measure wavelength of monochromatic light', 'Use lambda equals ay over d'], order: 68 },
    { section: 'AS2: Diffraction', title: 'Single Slit Diffraction', objectives: ['Describe and explain diffraction at single slit', 'State effect of aperture size qualitatively', 'Draw diffraction patterns'], order: 69 },
    { section: 'AS2: Diffraction', title: 'Diffraction Grating', objectives: ['Use d sin theta equals n lambda for grating', 'Describe use with laser to measure wavelength', 'Calculate grating spacings'], order: 70 },

    // AS2: Quantum Physics (7 lessons)
    { section: 'AS2: Quantum Physics', title: 'Photon Energy', objectives: ['Recall and use E photon equals hf', 'Calculate photon energies', 'Apply Planck constant'], order: 71 },
    { section: 'AS2: Quantum Physics', title: 'Photoelectric Effect', objectives: ['Use photon model to explain photoelectric effect', 'Understand photon energy and work function', 'Explain threshold frequency'], order: 72 },
    { section: 'AS2: Quantum Physics', title: 'Photoelectric Equation', objectives: ['Use half m v max squared equals hf minus phi', 'Calculate maximum kinetic energy', 'Determine work function'], order: 73 },
    { section: 'AS2: Quantum Physics', title: 'Energy Levels in Atoms', objectives: ['Understand electrons exist in energy levels', 'Explain discrete energy states', 'Relate to atomic spectra'], order: 74 },
    { section: 'AS2: Quantum Physics', title: 'Photon Emission and Absorption', objectives: ['Recall and use hf equals delta E', 'Calculate energy transitions', 'Explain line spectra'], order: 75 },
    { section: 'AS2: Quantum Physics', title: 'Laser Action', objectives: ['Provide explanation of laser action', 'Use terms population inversion stimulated emission', 'Understand metastable state'], order: 76 },
    { section: 'AS2: Quantum Physics', title: 'X-Ray Production', objectives: ['Understand X-ray production by electron transitions', 'Describe physical principles of CT scanning', 'Compare with conventional X-rays'], order: 77 },

    // AS2: Wave-Particle Duality (3 lessons)
    { section: 'AS2: Wave-Particle Duality', title: 'Wave and Photon Models', objectives: ['Categorise EM phenomena by wave or photon model', 'Understand dual nature of light', 'Apply appropriate model'], order: 78 },
    { section: 'AS2: Wave-Particle Duality', title: 'Electron Diffraction', objectives: ['Describe electron diffraction', 'Understand wave nature of particles', 'Explain diffraction patterns'], order: 79 },
    { section: 'AS2: Wave-Particle Duality', title: 'de Broglie Equation', objectives: ['Use de Broglie equation lambda equals h over p', 'Calculate wavelengths of particles', 'Apply to electrons and matter waves'], order: 80 },

    // AS2: Astronomy (4 lessons)
    { section: 'AS2: Astronomy', title: 'Doppler Shift', objectives: ['Recall classical Doppler shift equations', 'Find wavelength from moving source to stationary observer', 'Apply to sound and light'], order: 81 },
    { section: 'AS2: Astronomy', title: 'Cosmological Red Shift', objectives: ['Understand difference between cosmological and Doppler red shift', 'Relate to expanding universe', 'Explain wavelength stretching'], order: 82 },
    { section: 'AS2: Astronomy', title: 'Red Shift Parameter', objectives: ['Calculate red shift parameter z equals delta lambda over lambda', 'Use z equals v over c for recession speed', 'Apply where v much less than c'], order: 83 },
    { section: 'AS2: Astronomy', title: 'Hubble Law and Age of Universe', objectives: ['Use Hubble Law v equals H0 d to estimate distance', 'Use Hubble constant H0 approximately 2.4 times 10 to minus 18 s-1', 'Recall age equals one over H0 to estimate universe age'], order: 84 },
  ];
}

function getPhysicsA2Lessons() {
  return [
    // A2 1: Deformation of Solids (6 lessons)
    { section: 'A2 1: Deformation of Solids', title: 'Hooke Law', objectives: ['State Hooke law', 'Use F equals kx to solve problems', 'Understand spring constant'], order: 1 },
    { section: 'A2 1: Deformation of Solids', title: 'Elastic and Plastic Deformation', objectives: ['Understand elastic and plastic deformation', 'Define elastic limit', 'Distinguish limit of proportionality from elastic limit'], order: 2 },
    { section: 'A2 1: Deformation of Solids', title: 'Stress Strain and Young Modulus', objectives: ['Define stress strain and Young modulus', 'Perform experiment to determine Young modulus', 'Calculate material properties'], order: 3 },
    { section: 'A2 1: Deformation of Solids', title: 'Strain Energy', objectives: ['Use equation E equals half Fx equals half kx squared', 'Calculate elastic potential energy', 'Apply to springs and materials'], order: 4 },
    { section: 'A2 1: Deformation of Solids', title: 'Material Selection', objectives: ['Understand importance of stress strain Young modulus', 'Make design decisions about materials', 'Apply economic considerations'], order: 5 },

    // A2 1: Thermal Physics (9 lessons)
    { section: 'A2 1: Thermal Physics', title: 'Gas Behaviour Experiments', objectives: ['Describe experiments on gas behaviour', 'Show pV constant at fixed temperature', 'Show p over T constant and V over T constant'], order: 6 },
    { section: 'A2 1: Thermal Physics', title: 'Ideal Gas Equation', objectives: ['Recall and use pV over T equals constant', 'Use ideal gas equation pV equals nRT', 'Apply to gas calculations'], order: 7 },
    { section: 'A2 1: Thermal Physics', title: 'Alternative Gas Equation', objectives: ['Recall and use pV equals NkT', 'Understand Boltzmann constant', 'Compare with pV equals nRT'], order: 8 },
    { section: 'A2 1: Thermal Physics', title: 'Internal Energy', objectives: ['Understand concept of internal energy', 'Explain random distribution of PE and KE', 'Relate to molecular motion'], order: 9 },
    { section: 'A2 1: Thermal Physics', title: 'Kinetic Theory Equation', objectives: ['Use pV equals one third Nm c squared', 'Derive from kinetic theory', 'Relate pressure to molecular motion'], order: 10 },
    { section: 'A2 1: Thermal Physics', title: 'Average Molecular Kinetic Energy', objectives: ['Use equation for average KE', 'Relate to temperature', 'Apply to gas molecules'], order: 11 },
    { section: 'A2 1: Thermal Physics', title: 'Absolute Zero', objectives: ['Understand concept of absolute zero', 'Explain zero Kelvin', 'Relate to kinetic energy'], order: 12 },
    { section: 'A2 1: Thermal Physics', title: 'Specific Heat Capacity', objectives: ['Perform electrical method to determine SHC', 'Use Q equals mc delta theta', 'Calculate heat capacity'], order: 13 },

    // A2 1: Circular Motion (3 lessons)
    { section: 'A2 1: Circular Motion', title: 'Angular Velocity', objectives: ['Understand concept of angular velocity', 'Recall and use v equals r omega', 'Relate linear and angular motion'], order: 14 },
    { section: 'A2 1: Circular Motion', title: 'Centripetal Force', objectives: ['Apply F equals ma equals mv squared over r', 'Understand motion in circle at constant speed', 'Calculate centripetal forces'], order: 15 },

    // A2 1: Simple Harmonic Motion (7 lessons)
    { section: 'A2 1: SHM', title: 'Defining Simple Harmonic Motion', objectives: ['Define SHM as a equals minus omega squared x', 'Recall omega equals 2 pi f', 'Understand restoring force'], order: 16 },
    { section: 'A2 1: SHM', title: 'SHM Displacement Equation', objectives: ['Perform calculations with x equals A cos omega t', 'Understand amplitude and angular frequency', 'Apply to oscillators'], order: 17 },
    { section: 'A2 1: SHM', title: 'Pendulum and Spring Experiments', objectives: ['Investigate simple pendulum experimentally', 'Investigate loaded spiral spring', 'Plot and analyze graphs'], order: 18 },
    { section: 'A2 1: SHM', title: 'SHM Period Equations', objectives: ['Use T equals 2 pi sqrt l over g for pendulum', 'Use T equals 2 pi sqrt m over k for spring', 'Calculate periods'], order: 19 },
    { section: 'A2 1: SHM', title: 'SHM Graphs', objectives: ['Understand SHM displacement velocity acceleration graphs', 'Measure velocity from gradient', 'Interpret oscillation patterns'], order: 20 },
    { section: 'A2 1: SHM', title: 'Vibrations and Resonance', objectives: ['Use terms free vibrations forced vibrations', 'Understand resonance and damping', 'Apply to oscillating systems'], order: 21 },
    { section: 'A2 1: SHM', title: 'Damping Types', objectives: ['Understand light damping over-damping critical damping', 'Describe mechanical examples of resonance', 'Apply damping concepts'], order: 22 },

    // A2 1: Nuclear Physics (12 lessons)
    { section: 'A2 1: The Nucleus', title: 'Alpha Scattering Evidence', objectives: ['Describe alpha-particle scattering', 'Understand evidence for atomic nuclei', 'Explain Rutherford experiment'], order: 23 },
    { section: 'A2 1: The Nucleus', title: 'Nuclear Radius', objectives: ['Interpret variation of nuclear radius with nucleon number', 'Use R equals r0 A to one third', 'Estimate nuclear density'], order: 24 },
    { section: 'A2 1: Nuclear Decay', title: 'Radiation Properties', objectives: ['Understand nature of alpha beta gamma radiation', 'Explain penetration and range differences', 'Apply to shielding'], order: 25 },
    { section: 'A2 1: Nuclear Decay', title: 'Nucleon and Proton Number Changes', objectives: ['Calculate changes from alpha emission', 'Calculate changes from beta emission', 'Write decay equations'], order: 26 },
    { section: 'A2 1: Nuclear Decay', title: 'Random and Exponential Decay', objectives: ['Understand random nature of decay', 'Explain exponential decay pattern', 'Apply statistical behavior'], order: 27 },
    { section: 'A2 1: Nuclear Decay', title: 'Decay Constant', objectives: ['Use A equals minus lambda N', 'Define lambda as fraction per second', 'Calculate decay rates'], order: 28 },
    { section: 'A2 1: Nuclear Decay', title: 'Activity Equation', objectives: ['Use A equals A0 e to minus lambda t', 'Calculate activity over time', 'Apply exponential decay'], order: 29 },
    { section: 'A2 1: Nuclear Decay', title: 'Half-Life', objectives: ['Define half-life', 'Use t half equals ln 2 over lambda', 'Perform experiment to measure half-life'], order: 30 },
    { section: 'A2 1: Nuclear Energy', title: 'Mass-Energy Equivalence', objectives: ['Understand equivalence of mass and energy', 'Recall and use E equals delta m c squared', 'Apply to all energy changes'], order: 31 },
    { section: 'A2 1: Nuclear Energy', title: 'Binding Energy', objectives: ['Describe binding energy per nucleon variation', 'Relate to mass number', 'Understand stability curve'], order: 32 },
    { section: 'A2 1: Nuclear Energy', title: 'Fission and Fusion', objectives: ['Describe principles of fission', 'Explain fusion processes', 'Reference binding energy curve'], order: 33 },
    { section: 'A2 1: Nuclear Reactors', title: 'Fission Reactor Components', objectives: ['Understand chain reaction and critical size', 'Explain moderators control rods cooling system', 'Describe reactor shielding'], order: 34 },

    // A2 1: Nuclear Issues (2 lessons)
    { section: 'A2 1: Nuclear Power', title: 'Nuclear Power Issues', objectives: ['Understand social environmental security issues', 'Explain economic aspects of nuclear power', 'Discuss future energy crisis solutions'], order: 35 },
    { section: 'A2 1: Fusion', title: 'ITER Fusion Reactor', objectives: ['Describe ITER tokamak concept', 'Explain D-T reaction and plasma heating', 'Understand magnetic confinement and advantages'], order: 36 },

    // A2 2: Gravitational Fields (7 lessons)
    { section: 'A2 2: Force Fields', title: 'Concept of Force Fields', objectives: ['Explain field of force concept', 'Use field lines to describe field', 'Indicate direction and strength'], order: 37 },
    { section: 'A2 2: Gravitational Fields', title: 'Gravitational Field Strength', objectives: ['Define gravitational field strength', 'Recall and use g equals F over m', 'Apply to planets'], order: 38 },
    { section: 'A2 2: Gravitational Fields', title: 'Newton Law of Gravitation', objectives: ['State Newton law of universal gravitation', 'Recall F equals GMm over r squared', 'Calculate gravitational forces'], order: 39 },
    { section: 'A2 2: Gravitational Fields', title: 'Field Strength from Mass', objectives: ['Apply g equals GM over r squared', 'Calculate mass from field strength', 'Use for planetary calculations'], order: 40 },
    { section: 'A2 2: Gravitational Fields', title: 'Planetary and Satellite Motion', objectives: ['Apply circular motion to planets and satellites', 'Use gravitation for orbital motion', 'Calculate orbital speeds'], order: 41 },
    { section: 'A2 2: Gravitational Fields', title: 'Kepler Third Law', objectives: ['Show T squared proportional to r cubed', 'Demonstrate consistency with Newton gravitation', 'Apply to orbital periods'], order: 42 },
    { section: 'A2 2: Gravitational Fields', title: 'Geostationary Satellites', objectives: ['Understand unique conditions for geostationary orbit', 'Explain period position and direction requirements', 'Apply to communications'], order: 43 },

    // A2 2: Electric Fields (6 lessons)
    { section: 'A2 2: Electric Fields', title: 'Electric Field Strength', objectives: ['Define electric field strength', 'Recall and use E equals F over Q', 'Apply to charged particles'], order: 44 },
    { section: 'A2 2: Electric Fields', title: 'Coulomb Law', objectives: ['State Coulomb law for point charges', 'Recall F equals kq1q2 over r squared', 'Use k equals one over 4 pi epsilon 0'], order: 45 },
    { section: 'A2 2: Electric Fields', title: 'Field from Point Charge', objectives: ['Recall E equals kQ over r squared', 'Calculate field strength', 'Apply to point charges'], order: 46 },
    { section: 'A2 2: Electric Fields', title: 'Uniform Electric Fields', objectives: ['Understand constant field strength', 'Recall and use E equals V over d', 'Apply to parallel plates'], order: 47 },
    { section: 'A2 2: Electric Fields', title: 'Comparing Fields', objectives: ['State similarities in gravitational and electric fields', 'Identify differences', 'Compare field equations'], order: 48 },

    // A2 2: Capacitors (9 lessons)
    { section: 'A2 2: Capacitors', title: 'Capacitance Definition', objectives: ['Define capacitance', 'Recall and use C equals Q over V', 'Define farad'], order: 49 },
    { section: 'A2 2: Capacitors', title: 'Energy in Capacitors', objectives: ['Recall and use E equals half QV', 'Calculate stored energy', 'Apply to charged capacitors'], order: 50 },
    { section: 'A2 2: Capacitors', title: 'Capacitors in Circuits', objectives: ['Recall equations for capacitors in series and parallel', 'Calculate total capacitance', 'Apply to circuits'], order: 51 },
    { section: 'A2 2: Capacitors', title: 'Charge and Discharge Experiments', objectives: ['Perform experiments on capacitor charge', 'Demonstrate capacitor discharge', 'Plot voltage and current curves'], order: 52 },
    { section: 'A2 2: Capacitors', title: 'Exponential Discharge', objectives: ['Confirm exponential nature of discharge', 'Use V or I discharge curves', 'Analyze decay patterns'], order: 53 },
    { section: 'A2 2: Capacitors', title: 'Discharge Equations', objectives: ['Use Q equals Q0 e to minus t over CR', 'Use V equals V0 e to minus t over CR', 'Apply exponential decay'], order: 54 },
    { section: 'A2 2: Capacitors', title: 'Time Constant', objectives: ['Define time constant tau equals CR', 'Perform experiment to determine time constant', 'Understand significance'], order: 55 },
    { section: 'A2 2: Capacitors', title: 'Capacitor Applications', objectives: ['Apply knowledge to electronic flash guns', 'Understand use in defibrillators', 'Relate time constants and stored energy'], order: 56 },

    // A2 2: Magnetic Fields (10 lessons)
    { section: 'A2 2: Magnetic Fields', title: 'Magnetic Field Patterns', objectives: ['Describe shape of field from current in coil', 'Describe field from long straight wire', 'Indicate field directions'], order: 57 },
    { section: 'A2 2: Magnetic Fields', title: 'Force on Current-Carrying Conductor', objectives: ['Understand force on conductor in perpendicular field', 'Predict direction of force', 'Apply Fleming left hand rule'], order: 58 },
    { section: 'A2 2: Magnetic Fields', title: 'Electric Motor Principle', objectives: ['Understand forces on current-carrying coil', 'Explain principle behind electric motor', 'Describe rotation mechanism'], order: 59 },
    { section: 'A2 2: Magnetic Fields', title: 'Magnetic Force Equation', objectives: ['Recall and use F equals BIl', 'Define magnetic flux density', 'Calculate forces on conductors'], order: 60 },
    { section: 'A2 2: Magnetic Fields', title: 'Magnetic Flux', objectives: ['Understand magnetic flux and flux linkage', 'Recall flux equals BA', 'Use N flux equals NBA'], order: 61 },
    { section: 'A2 2: Magnetic Fields', title: 'Electromagnetic Induction', objectives: ['State Faraday law', 'State Lenz law', 'Demonstrate experimentally'], order: 62 },
    { section: 'A2 2: Magnetic Fields', title: 'Induced EMF', objectives: ['Calculate average induced EMF', 'Use rate of change of flux linkage', 'Apply to moving conductors'], order: 63 },
    { section: 'A2 2: Magnetic Fields', title: 'AC Generator', objectives: ['Understand simple AC generator', 'Use E equals BAN omega sin omega t', 'Explain rotating coil'], order: 64 },
    { section: 'A2 2: Magnetic Fields', title: 'Transformers', objectives: ['Describe how transformer works', 'Recall and use Vs over Vp equals Ns over Np', 'Apply to voltage conversion'], order: 65 },
    { section: 'A2 2: Magnetic Fields', title: 'Transformer Efficiency', objectives: ['Explain power losses in transformers', 'Understand eddy currents and resistance heating', 'Describe advantages of high-voltage transmission'], order: 66 },

    // A2 2: Charged Particles in Fields (4 lessons)
    { section: 'A2 2: Particle Deflection', title: 'Force on Charge in Electric Field', objectives: ['Understand charge in uniform electric field experiences force', 'Recall and use F equals qE', 'Determine force direction'], order: 67 },
    { section: 'A2 2: Particle Deflection', title: 'Force on Moving Charge in Magnetic Field', objectives: ['Understand moving charge in perpendicular magnetic field', 'Recall and use F equals Bqv', 'Determine force direction'], order: 68 },

    // A2 2: Particle Accelerators (3 lessons)
    { section: 'A2 2: Particle Accelerators', title: 'Synchrotron Principles', objectives: ['Describe basic principles of synchrotron', 'Understand particle acceleration', 'Explain magnetic field synchronisation'], order: 69 },
    { section: 'A2 2: Particle Accelerators', title: 'Relativistic Mass Increase', objectives: ['Understand relativistic mass increase', 'Explain as particles approach speed of light', 'Apply to high-energy physics'], order: 70 },
    { section: 'A2 2: Particle Accelerators', title: 'Antimatter and Annihilation', objectives: ['Understand antimatter concept', 'Explain production in collisions', 'Describe annihilation as photon emission'], order: 71 },

    // A2 2: Fundamental Particles (6 lessons)
    { section: 'A2 2: Fundamental Particles', title: 'Concept of Fundamental Particles', objectives: ['Explain fundamental particle concept', 'Identify four fundamental forces', 'State associated exchange particles'], order: 72 },
    { section: 'A2 2: Fundamental Particles', title: 'Particle Classification', objectives: ['Classify particles as gauge bosons leptons hadrons', 'Distinguish mesons and baryons', 'State examples of each class'], order: 73 },
    { section: 'A2 2: Fundamental Particles', title: 'Quark Structure', objectives: ['Describe structure of hadrons in terms of quarks', 'Understand quark combinations', 'Apply to protons neutrons mesons'], order: 74 },
    { section: 'A2 2: Fundamental Particles', title: 'Conservation Laws', objectives: ['Understand conservation of charge', 'Apply lepton number conservation', 'Use baryon number conservation'], order: 75 },
    { section: 'A2 2: Fundamental Particles', title: 'Beta Decay and Quarks', objectives: ['Describe beta-decay in quark model', 'Explain quark transformations', 'Understand W boson role'], order: 76 },
  ];
}

function getFurtherMathematicsASLessons() {
  return [
    // AS1: Complex Numbers (12 lessons)
    { section: 'AS1: Complex Numbers', title: 'Introduction to Complex Numbers', objectives: ['Define imaginary unit i where i squared equals minus 1', 'Express complex numbers in form a plus bi', 'Understand real and imaginary parts'], order: 1 },
    { section: 'AS1: Complex Numbers', title: 'Addition and Subtraction of Complex Numbers', objectives: ['Add complex numbers by adding real and imaginary parts separately', 'Subtract complex numbers', 'Simplify expressions'], order: 2 },
    { section: 'AS1: Complex Numbers', title: 'Multiplication of Complex Numbers', objectives: ['Multiply complex numbers using distributive law', 'Apply i squared equals minus 1', 'Simplify products'], order: 3 },
    { section: 'AS1: Complex Numbers', title: 'Complex Conjugates', objectives: ['Define complex conjugate of a plus bi as a minus bi', 'Use conjugates to simplify expressions', 'Understand properties of conjugates'], order: 4 },
    { section: 'AS1: Complex Numbers', title: 'Division of Complex Numbers', objectives: ['Divide complex numbers by multiplying by conjugate', 'Express results in form a plus bi', 'Rationalize denominators'], order: 5 },
    { section: 'AS1: Complex Numbers', title: 'Argand Diagrams', objectives: ['Represent complex numbers on Argand diagram', 'Plot points with real part on x-axis and imaginary on y-axis', 'Interpret geometric representation'], order: 6 },
    { section: 'AS1: Complex Numbers', title: 'Modulus of Complex Numbers', objectives: ['Define modulus as distance from origin', 'Calculate modulus using r equals sqrt of a squared plus b squared', 'Understand geometric interpretation'], order: 7 },
    { section: 'AS1: Complex Numbers', title: 'Argument of Complex Numbers', objectives: ['Define argument as angle from positive real axis', 'Calculate argument using tan theta equals b over a', 'Express in radians'], order: 8 },
    { section: 'AS1: Complex Numbers', title: 'Polar Form of Complex Numbers', objectives: ['Express complex number as r cos theta plus i sin theta', 'Convert between Cartesian and polar forms', 'Use modulus-argument form'], order: 9 },
    { section: 'AS1: Complex Numbers', title: 'Solving Quadratic Equations with Complex Roots', objectives: ['Solve quadratic equations with negative discriminant', 'Express solutions as complex conjugates', 'Apply quadratic formula'], order: 10 },
    { section: 'AS1: Complex Numbers', title: 'Solving Polynomial Equations', objectives: ['Find complex roots of polynomial equations', 'Use factor theorem with complex numbers', 'Understand conjugate root theorem'], order: 11 },
    { section: 'AS1: Complex Numbers', title: 'Complex Number Applications', objectives: ['Apply complex numbers to solve equations', 'Use in geometric problems', 'Understand practical applications'], order: 12 },

    // AS1: Matrices (15 lessons)
    { section: 'AS1: Matrices', title: 'Matrix Notation and Order', objectives: ['Define matrix as rectangular array of numbers', 'Specify order as rows by columns', 'Identify elements using subscript notation'], order: 13 },
    { section: 'AS1: Matrices', title: 'Types of Matrices', objectives: ['Identify square matrices row matrices column matrices', 'Define zero matrix and identity matrix', 'Recognize diagonal matrices'], order: 14 },
    { section: 'AS1: Matrices', title: 'Matrix Equality', objectives: ['Define when two matrices are equal', 'Understand corresponding elements must be equal', 'Apply to solve for unknowns'], order: 15 },
    { section: 'AS1: Matrices', title: 'Matrix Addition and Subtraction', objectives: ['Add matrices of same order by adding corresponding elements', 'Subtract matrices element by element', 'Understand commutativity of addition'], order: 16 },
    { section: 'AS1: Matrices', title: 'Scalar Multiplication', objectives: ['Multiply matrix by scalar', 'Multiply each element by scalar', 'Apply distributive properties'], order: 17 },
    { section: 'AS1: Matrices', title: 'Matrix Multiplication', objectives: ['Multiply two matrices using row by column method', 'Understand order compatibility requirement', 'Recognize non-commutativity of multiplication'], order: 18 },
    { section: 'AS1: Matrices', title: 'Properties of Matrix Multiplication', objectives: ['Verify associativity of matrix multiplication', 'Apply distributive law over addition', 'Understand identity matrix property'], order: 19 },
    { section: 'AS1: Matrices', title: 'Determinant of 2x2 Matrix', objectives: ['Calculate determinant of 2 by 2 matrix', 'Use formula ad minus bc', 'Understand geometric interpretation'], order: 20 },
    { section: 'AS1: Matrices', title: 'Determinant of 3x3 Matrix', objectives: ['Calculate determinant using cofactor expansion', 'Apply to first row or any row column', 'Understand properties of determinants'], order: 21 },
    { section: 'AS1: Matrices', title: 'Inverse of 2x2 Matrix', objectives: ['Find inverse using formula with determinant', 'Verify inverse by multiplication', 'Understand condition for invertibility'], order: 22 },
    { section: 'AS1: Matrices', title: 'Inverse of 3x3 Matrix', objectives: ['Calculate inverse using adjugate method', 'Find matrix of cofactors and transpose', 'Apply determinant in denominator'], order: 23 },
    { section: 'AS1: Matrices', title: 'Solving Linear Equations with Matrices', objectives: ['Express system as matrix equation AX equals B', 'Solve using inverse matrix X equals A inverse B', 'Apply to 2 by 2 and 3 by 3 systems'], order: 24 },
    { section: 'AS1: Matrices', title: 'Geometric Transformations', objectives: ['Represent transformations using matrices', 'Apply rotation reflection enlargement', 'Understand transformation composition'], order: 25 },
    { section: 'AS1: Matrices', title: 'Matrix Transformations Composition', objectives: ['Combine transformations by matrix multiplication', 'Understand order matters', 'Apply successive transformations'], order: 26 },
    { section: 'AS1: Matrices', title: 'Matrix Applications', objectives: ['Use matrices to solve systems of equations', 'Apply to real-world problems', 'Understand limitations of matrix methods'], order: 27 },

    // AS1: Further Algebra and Functions (8 lessons)
    { section: 'AS1: Further Algebra', title: 'Summation Notation', objectives: ['Use sigma notation for sums', 'Evaluate finite series using summation', 'Apply properties of summation'], order: 28 },
    { section: 'AS1: Further Algebra', title: 'Method of Differences', objectives: ['Apply method of differences to series', 'Express terms as difference of consecutive terms', 'Simplify telescoping series'], order: 29 },
    { section: 'AS1: Further Algebra', title: 'Proof by Mathematical Induction - Summation', objectives: ['Prove summation formulae by induction', 'Verify base case and inductive step', 'Apply to series of powers'], order: 30 },
    { section: 'AS1: Further Algebra', title: 'Proof by Mathematical Induction - Divisibility', objectives: ['Prove divisibility results by induction', 'Show expression divisible by given number', 'Apply inductive reasoning'], order: 31 },
    { section: 'AS1: Further Algebra', title: 'Proof by Mathematical Induction - Inequalities', objectives: ['Prove inequalities using induction', 'Establish base case and inductive step', 'Apply to exponential and polynomial inequalities'], order: 32 },
    { section: 'AS1: Further Algebra', title: 'Proof by Mathematical Induction - Matrices', objectives: ['Prove matrix results by induction', 'Apply to powers of matrices', 'Verify matrix identities'], order: 33 },
    { section: 'AS1: Further Algebra', title: 'Partial Fractions', objectives: ['Express rational functions as partial fractions', 'Handle linear factors in denominator', 'Apply to integration and series'], order: 34 },
    { section: 'AS1: Further Algebra', title: 'Partial Fractions with Repeated Factors', objectives: ['Decompose fractions with repeated linear factors', 'Use appropriate partial fraction form', 'Solve for unknown coefficients'], order: 35 },

    // AS1: Series (5 lessons)
    { section: 'AS1: Series', title: 'Finite Series Summation', objectives: ['Sum finite arithmetic and geometric series', 'Use standard formulae', 'Apply to problem solving'], order: 36 },
    { section: 'AS1: Series', title: 'Summation of Powers', objectives: ['Use formulae for sum of first n integers', 'Apply sum of squares and cubes', 'Derive using method of differences'], order: 37 },
    { section: 'AS1: Series', title: 'Series Applications', objectives: ['Apply series to real-world problems', 'Model situations with arithmetic or geometric series', 'Solve practical applications'], order: 38 },
    { section: 'AS1: Series', title: 'Maclaurin Series', objectives: ['Understand Maclaurin series expansion', 'Expand functions as power series', 'Apply to exponential sine cosine'], order: 39 },
    { section: 'AS1: Series', title: 'Series Convergence', objectives: ['Test series for convergence', 'Use ratio test and comparison test', 'Determine radius of convergence'], order: 40 },
  ];
}

function getFurtherMathematicsA2Lessons() {
  return [
    // A2 1: Further Calculus (12 lessons)
    { section: 'A2 1: Further Calculus', title: 'Hyperbolic Functions Definitions', objectives: ['Define hyperbolic sine and cosine functions', 'Use sinh x equals e to x minus e to minus x over 2', 'Use cosh x equals e to x plus e to minus x over 2'], order: 1 },
    { section: 'A2 1: Further Calculus', title: 'Hyperbolic Function Properties', objectives: ['Define tanh x as sinh x over cosh x', 'Prove cosh squared x minus sinh squared x equals 1', 'Apply hyperbolic identities'], order: 2 },
    { section: 'A2 1: Further Calculus', title: 'Graphs of Hyperbolic Functions', objectives: ['Sketch graphs of sinh cosh and tanh', 'Understand domain and range', 'Compare with trigonometric functions'], order: 3 },
    { section: 'A2 1: Further Calculus', title: 'Differentiation of Hyperbolic Functions', objectives: ['Differentiate sinh x cosh x and tanh x', 'Apply chain rule to hyperbolic functions', 'Use in calculus problems'], order: 4 },
    { section: 'A2 1: Further Calculus', title: 'Integration of Hyperbolic Functions', objectives: ['Integrate sinh x cosh x and tanh x', 'Apply substitution with hyperbolic functions', 'Solve integration problems'], order: 5 },
    { section: 'A2 1: Further Calculus', title: 'Inverse Hyperbolic Functions', objectives: ['Define inverse hyperbolic functions', 'Express in logarithmic form', 'Differentiate inverse hyperbolic functions'], order: 6 },
    { section: 'A2 1: Further Calculus', title: 'First Order Differential Equations', objectives: ['Solve first order equations by separation of variables', 'Apply to exponential growth and decay', 'Find particular solutions'], order: 7 },
    { section: 'A2 1: Further Calculus', title: 'Second Order Differential Equations', objectives: ['Solve homogeneous second order equations', 'Find complementary function', 'Apply auxiliary equation method'], order: 8 },
    { section: 'A2 1: Further Calculus', title: 'Particular Integrals', objectives: ['Find particular integral for non-homogeneous equations', 'Use trial function method', 'Combine with complementary function'], order: 9 },
    { section: 'A2 1: Further Calculus', title: 'Applications of Differential Equations', objectives: ['Model physical situations with differential equations', 'Apply to simple harmonic motion', 'Solve damped oscillations'], order: 10 },
    { section: 'A2 1: Further Calculus', title: 'Maclaurin and Taylor Series', objectives: ['Derive Maclaurin series for standard functions', 'Use Taylor series for approximations', 'Apply series expansions'], order: 11 },
    { section: 'A2 1: Further Calculus', title: 'Integration Techniques', objectives: ['Apply integration by parts multiple times', 'Use reduction formulae', 'Solve complex integrals'], order: 12 },

    // A2 1: Vectors (10 lessons)
    { section: 'A2 1: Vectors', title: 'Vectors in Three Dimensions', objectives: ['Extend vector notation to 3D', 'Use i j k unit vectors', 'Calculate magnitude in 3D'], order: 13 },
    { section: 'A2 1: Vectors', title: 'Scalar Product', objectives: ['Define scalar product a dot b', 'Use a dot b equals magnitude a times magnitude b times cos theta', 'Apply to find angle between vectors'], order: 14 },
    { section: 'A2 1: Vectors', title: 'Vector Product', objectives: ['Define vector product a cross b', 'Calculate using determinant method', 'Understand perpendicular direction'], order: 15 },
    { section: 'A2 1: Vectors', title: 'Equation of a Line in 3D', objectives: ['Express line in vector form r equals a plus lambda b', 'Use parametric equations', 'Find intersection of lines'], order: 16 },
    { section: 'A2 1: Vectors', title: 'Equation of a Plane', objectives: ['Define plane using position vector and normal', 'Use scalar product form r dot n equals a dot n', 'Convert to Cartesian form'], order: 17 },
    { section: 'A2 1: Vectors', title: 'Angle Between Line and Plane', objectives: ['Calculate angle between line and plane', 'Use scalar product of direction and normal', 'Apply trigonometry'], order: 18 },
    { section: 'A2 1: Vectors', title: 'Intersection of Line and Plane', objectives: ['Find point of intersection', 'Substitute line equation into plane', 'Solve for parameter'], order: 19 },
    { section: 'A2 1: Vectors', title: 'Distance from Point to Line', objectives: ['Calculate perpendicular distance', 'Use vector projection method', 'Apply scalar and vector products'], order: 20 },
    { section: 'A2 1: Vectors', title: 'Distance from Point to Plane', objectives: ['Calculate perpendicular distance from point to plane', 'Use formula with normal vector', 'Apply to geometric problems'], order: 21 },
    { section: 'A2 1: Vectors', title: 'Vector Applications', objectives: ['Apply vectors to geometry problems', 'Solve 3D coordinate geometry', 'Use in mechanics and physics'], order: 22 },

    // A2 1: Further Complex Numbers (8 lessons)
    { section: 'A2 1: Further Complex Numbers', title: 'Exponential Form of Complex Numbers', objectives: ['Express complex number as r e to i theta', 'Use Euler formula e to i theta equals cos theta plus i sin theta', 'Convert between forms'], order: 23 },
    { section: 'A2 1: Further Complex Numbers', title: 'Multiplication and Division in Exponential Form', objectives: ['Multiply complex numbers by adding arguments', 'Divide by subtracting arguments', 'Simplify using exponential form'], order: 24 },
    { section: 'A2 1: Further Complex Numbers', title: 'De Moivre Theorem', objectives: ['State De Moivre theorem for integer powers', 'Use cos theta plus i sin theta to power n', 'Apply to find powers of complex numbers'], order: 25 },
    { section: 'A2 1: Further Complex Numbers', title: 'Roots of Complex Numbers', objectives: ['Find nth roots of complex numbers', 'Use De Moivre theorem for fractional powers', 'Represent roots on Argand diagram'], order: 26 },
    { section: 'A2 1: Further Complex Numbers', title: 'Solving Polynomial Equations', objectives: ['Find all roots of polynomial equations', 'Use complex roots to factorize', 'Apply conjugate root theorem'], order: 27 },
    { section: 'A2 1: Further Complex Numbers', title: 'Loci in the Complex Plane', objectives: ['Describe loci satisfying conditions', 'Plot circles and lines in complex plane', 'Use modulus and argument conditions'], order: 28 },
    { section: 'A2 1: Further Complex Numbers', title: 'Complex Number Transformations', objectives: ['Apply transformations in complex plane', 'Use multiplication and addition geometrically', 'Understand rotation and enlargement'], order: 29 },
    { section: 'A2 1: Further Complex Numbers', title: 'Applications of Complex Numbers', objectives: ['Apply to alternating current circuits', 'Use in signal processing', 'Solve engineering problems'], order: 30 },

    // A2 1: Polar Coordinates (6 lessons)
    { section: 'A2 1: Polar Coordinates', title: 'Polar Coordinate System', objectives: ['Define polar coordinates r and theta', 'Convert between Cartesian and polar', 'Use x equals r cos theta and y equals r sin theta'], order: 31 },
    { section: 'A2 1: Polar Coordinates', title: 'Sketching Polar Curves', objectives: ['Sketch curves given in polar form', 'Plot r equals f of theta', 'Identify symmetries'], order: 32 },
    { section: 'A2 1: Polar Coordinates', title: 'Standard Polar Curves', objectives: ['Recognize circles spirals and roses', 'Sketch r equals a and r equals a theta', 'Understand cardioids and limaçons'], order: 33 },
    { section: 'A2 1: Polar Coordinates', title: 'Area in Polar Coordinates', objectives: ['Calculate area using integral half r squared d theta', 'Apply to sectors and regions', 'Find areas enclosed by polar curves'], order: 34 },
    { section: 'A2 1: Polar Coordinates', title: 'Tangents to Polar Curves', objectives: ['Find tangent lines to polar curves', 'Use dy over dx in polar form', 'Determine horizontal and vertical tangents'], order: 35 },
    { section: 'A2 1: Polar Coordinates', title: 'Polar Coordinate Applications', objectives: ['Apply to physics and engineering', 'Model circular motion', 'Use in navigation and astronomy'], order: 36 },

    // A2 2: Mechanics Options (Select Two from Three Sections)
    // Section A: Mechanics
    { section: 'A2 2: Mechanics', title: 'Circular Motion Dynamics', objectives: ['Apply Newton second law to circular motion', 'Calculate centripetal force and acceleration', 'Solve problems with banked curves'], order: 37 },
    { section: 'A2 2: Mechanics', title: 'Relative Motion', objectives: ['Understand relative velocity between moving objects', 'Use vector addition for relative motion', 'Apply to navigation and collision problems'], order: 38 },
    { section: 'A2 2: Mechanics', title: 'Elastic Collisions in One Dimension', objectives: ['Apply conservation of momentum and energy', 'Solve for velocities after elastic collision', 'Understand coefficient of restitution'], order: 39 },

    // Section B: Statistics
    { section: 'A2 2: Statistics', title: 'Continuous Probability Distributions', objectives: ['Define continuous random variables', 'Use probability density functions', 'Calculate probabilities using integrals'], order: 40 },
    { section: 'A2 2: Statistics', title: 'Expectation and Variance', objectives: ['Calculate expectation E of X', 'Find variance Var of X using integrals', 'Apply to continuous distributions'], order: 41 },
    { section: 'A2 2: Statistics', title: 'Normal Distribution Advanced', objectives: ['Use normal distribution with unknown parameters', 'Apply z-scores and standardization', 'Solve problems with sample means'], order: 42 },
    { section: 'A2 2: Statistics', title: 'Estimation Theory', objectives: ['Understand point and interval estimation', 'Calculate confidence intervals for mean', 'Use t-distribution when appropriate'], order: 43 },
    { section: 'A2 2: Statistics', title: 'Hypothesis Testing Advanced', objectives: ['Perform hypothesis tests for means', 'Use p-values and critical regions', 'Test for difference between two means'], order: 44 },
    { section: 'A2 2: Statistics', title: 'Chi-Squared Tests', objectives: ['Apply chi-squared test for goodness of fit', 'Test for independence in contingency tables', 'Use degrees of freedom correctly'], order: 45 },

    // Section C: Discrete and Decision Mathematics
    { section: 'A2 2: Decision Mathematics', title: 'Linear Programming', objectives: ['Formulate linear programming problems', 'Use graphical method for two variables', 'Apply simplex algorithm'], order: 46 },
    { section: 'A2 2: Decision Mathematics', title: 'Critical Path Analysis', objectives: ['Construct activity networks', 'Find critical path and minimum completion time', 'Calculate float times'], order: 47 },
    { section: 'A2 2: Decision Mathematics', title: 'Travelling Salesman Problem', objectives: ['Understand TSP and its applications', 'Use nearest neighbour algorithm', 'Apply minimum spanning tree method'], order: 48 },
    { section: 'A2 2: Decision Mathematics', title: 'Matchings and Allocation', objectives: ['Solve bipartite matching problems', 'Use Hungarian algorithm', 'Apply to job assignment problems'], order: 49 },
    { section: 'A2 2: Decision Mathematics', title: 'Network Flows', objectives: ['Understand maximum flow problems', 'Apply Ford-Fulkerson algorithm', 'Solve minimum cut problems'], order: 50 },
  ];
}

function getMathematicsASLessons() {
  return [
    // AS1: Pure Mathematics - Algebra and Functions
    { section: 'AS1: Algebra and Functions', title: 'Laws of Indices', objectives: ['Demonstrate understanding and use laws of indices for rational exponents', 'Apply index laws to simplify expressions', 'Solve equations using index laws'], order: 1 },
    { section: 'AS1: Algebra and Functions', title: 'Surds and Rationalisation', objectives: ['Use and manipulate surds', 'Rationalise denominators', 'Simplify surd expressions'], order: 2 },
    { section: 'AS1: Algebra and Functions', title: 'Quadratic Functions', objectives: ['Work with quadratic functions and their graphs', 'Understand shape and properties', 'Identify vertex and axis of symmetry'], order: 3 },
    { section: 'AS1: Algebra and Functions', title: 'Discriminant of Quadratics', objectives: ['Use discriminant b squared minus 4ac', 'Determine conditions for real and repeated roots', 'Apply to solving problems'], order: 4 },
    { section: 'AS1: Algebra and Functions', title: 'Completing the Square', objectives: ['Complete the square in quadratic functions', 'Express in form a times x minus h squared plus k', 'Find maximum or minimum values'], order: 5 },
    { section: 'AS1: Algebra and Functions', title: 'Solving Quadratic Equations', objectives: ['Solve quadratic equations by factorisation', 'Use quadratic formula', 'Solve equations in function of unknown'], order: 6 },
    { section: 'AS1: Algebra and Functions', title: 'Simultaneous Equations', objectives: ['Solve simultaneous equations by elimination and substitution', 'Solve one linear and one quadratic', 'Solve in three variables'], order: 7 },
    { section: 'AS1: Algebra and Functions', title: 'Inequalities', objectives: ['Solve linear and quadratic inequalities', 'Interpret inequalities graphically', 'Handle inequalities with brackets and fractions'], order: 8 },
    { section: 'AS1: Algebra and Functions', title: 'Polynomial Manipulation', objectives: ['Expand brackets and collect like terms', 'Factorise polynomials', 'Perform simple algebraic division'], order: 9 },
    { section: 'AS1: Algebra and Functions', title: 'Remainder and Factor Theorems', objectives: ['Use remainder theorem', 'Apply factor theorem', 'Solve polynomial problems'], order: 10 },
    { section: 'AS1: Algebra and Functions', title: 'Curve Sketching - Polynomials', objectives: ['Sketch curves of polynomials', 'Identify turning points and intercepts', 'Analyze end behaviour'], order: 11 },
    { section: 'AS1: Algebra and Functions', title: 'Rational Functions', objectives: ['Sketch curves y equals a over x', 'Identify vertical and horizontal asymptotes', 'Understand behaviour near asymptotes'], order: 12 },
    { section: 'AS1: Algebra and Functions', title: 'Graphical Solutions', objectives: ['Interpret algebraic solutions graphically', 'Use intersection points to solve equations', 'Understand graphical interpretation'], order: 13 },
    { section: 'AS1: Algebra and Functions', title: 'Graph Transformations', objectives: ['Understand transformations of y equals f of x', 'Sketch y equals af of x, y equals f of x plus a', 'Sketch y equals f of x plus a and y equals f of ax'], order: 14 },

    // AS1: Coordinate Geometry
    { section: 'AS1: Coordinate Geometry', title: 'Equations of Straight Lines', objectives: ['Use equation y minus y1 equals m times x minus x1', 'Use form ax plus by plus c equals 0', 'Convert between forms'], order: 15 },
    { section: 'AS1: Coordinate Geometry', title: 'Midpoint and Distance', objectives: ['Find midpoint of line segment', 'Calculate distance between points', 'Apply coordinate geometry formulas'], order: 16 },
    { section: 'AS1: Coordinate Geometry', title: 'Parallel and Perpendicular Lines', objectives: ['Use gradient conditions for parallel lines', 'Apply perpendicular gradient condition', 'Solve problems involving line relationships'], order: 17 },
    { section: 'AS1: Coordinate Geometry', title: 'Straight Line Models', objectives: ['Use straight line models in contexts', 'Apply to real-world situations', 'Interpret gradients and intercepts'], order: 18 },
    { section: 'AS1: Coordinate Geometry', title: 'Circle Equations', objectives: ['Use equation x minus a squared plus y minus b squared equals r squared', 'Use expanded form x squared plus y squared plus 2gx plus 2fy plus c equals 0', 'Convert between forms'], order: 19 },
    { section: 'AS1: Coordinate Geometry', title: 'Circle Properties', objectives: ['Find centre and radius by completing square', 'Use angle in semicircle is right angle', 'Apply perpendicular from centre bisects chord'], order: 20 },
    { section: 'AS1: Coordinate Geometry', title: 'Tangents to Circles', objectives: ['Understand radius perpendicular to tangent', 'Find equation of tangent at given point', 'Apply circle properties'], order: 21 },

    // AS1: Sequences and Series
    { section: 'AS1: Sequences and Series', title: 'Binomial Expansion', objectives: ['Use binomial expansion of a plus bx to power n', 'Apply for positive integer n', 'Expand and simplify binomial expressions'], order: 22 },
    { section: 'AS1: Sequences and Series', title: 'Factorial and Combinations', objectives: ['Use notation n factorial', 'Use nCr notation', 'Calculate combinations'], order: 23 },

    // AS1: Trigonometry
    { section: 'AS1: Trigonometry', title: 'Trigonometric Definitions', objectives: ['Use definitions of sine, cosine and tangent for all arguments', 'Understand trigonometric ratios', 'Apply to all quadrants'], order: 24 },
    { section: 'AS1: Trigonometry', title: 'Sine and Cosine Rules', objectives: ['Use sine rule for non-right triangles', 'Apply cosine rule', 'Solve triangle problems'], order: 25 },
    { section: 'AS1: Trigonometry', title: 'Area of Triangle', objectives: ['Calculate area using half ab sin C', 'Apply to various triangles', 'Solve area problems'], order: 26 },
    { section: 'AS1: Trigonometry', title: 'Trigonometric Graphs', objectives: ['Understand graphs of sine, cosine and tangent', 'Identify symmetries and periodicity', 'Sketch transformed trig graphs'], order: 27 },
    { section: 'AS1: Trigonometry', title: 'Trigonometric Identities', objectives: ['Use tan theta equals sin theta over cos theta', 'Apply sin squared theta plus cos squared theta equals 1', 'Solve using identities'], order: 28 },
    { section: 'AS1: Trigonometry', title: 'Solving Trigonometric Equations', objectives: ['Solve simple trig equations in given interval', 'Solve quadratic equations in sin, cos, tan', 'Handle equations with multiples of unknown angle'], order: 29 },

    // AS1: Exponentials and Logarithms
    { section: 'AS1: Exponentials and Logarithms', title: 'Exponential Functions', objectives: ['Use function a to power x and its graph', 'Use function e to power x and its graph', 'Apply exponential functions'], order: 30 },
    { section: 'AS1: Exponentials and Logarithms', title: 'Logarithmic Functions', objectives: ['Define log base a of x as inverse of a to power x', 'Use function ln x and its graph', 'Understand ln x as inverse of e to power x'], order: 31 },
    { section: 'AS1: Exponentials and Logarithms', title: 'Laws of Logarithms', objectives: ['Prove and use log laws', 'Apply log a x plus log a y equals log a xy', 'Use log a x minus log a y equals log a of x over y'], order: 32 },
    { section: 'AS1: Exponentials and Logarithms', title: 'Solving Exponential Equations', objectives: ['Solve equations a to power x equals b', 'Use logarithms to solve', 'Apply to various bases'], order: 33 },
    { section: 'AS1: Exponentials and Logarithms', title: 'Exponential Inequalities', objectives: ['Solve inequalities involving exponentials', 'Apply logarithmic methods', 'Understand solution sets'], order: 34 },
    { section: 'AS1: Exponentials and Logarithms', title: 'Exponential Growth and Decay', objectives: ['Use exponential growth and decay models', 'Apply to continuous compound interest', 'Model population growth and radioactive decay'], order: 35 },

    // AS1: Differentiation
    { section: 'AS1: Differentiation', title: 'Derivative as Gradient', objectives: ['Understand derivative of f of x as gradient function', 'Interpret gradient of tangent at general point', 'Use derivative notation'], order: 36 },
    { section: 'AS1: Differentiation', title: 'Gradient as Limit', objectives: ['Understand gradient of tangent as limit', 'Use first principles', 'Define differentiation'], order: 37 },
    { section: 'AS1: Differentiation', title: 'Rate of Change', objectives: ['Interpret gradient as rate of change', 'Apply to distance-time and velocity-time', 'Use in real contexts'], order: 38 },
    { section: 'AS1: Differentiation', title: 'Second Derivatives', objectives: ['Find second derivatives', 'Use second derivative as rate of change of gradient', 'Apply to acceleration'], order: 39 },
    { section: 'AS1: Differentiation', title: 'Power Rule', objectives: ['Differentiate x to power n for rational n', 'Apply to constant multiples, sums and differences', 'Simplify derivatives'], order: 40 },
    { section: 'AS1: Differentiation', title: 'Applications of Differentiation', objectives: ['Find gradients, tangents and normals', 'Determine maxima and minima', 'Identify stationary points'], order: 41 },
    { section: 'AS1: Differentiation', title: 'Increasing and Decreasing Functions', objectives: ['Identify increasing functions where derivative positive', 'Identify decreasing functions where derivative negative', 'Analyze function behaviour'], order: 42 },

    // AS1: Integration
    { section: 'AS1: Integration', title: 'Indefinite Integration', objectives: ['Understand integration as reverse of differentiation', 'Add constant of integration', 'Find indefinite integrals'], order: 43 },
    { section: 'AS1: Integration', title: 'Integration of Powers', objectives: ['Integrate x to power n excluding n equals minus 1', 'Apply to sums, differences and constant multiples', 'Simplify integrals'], order: 44 },
    { section: 'AS1: Integration', title: 'Definite Integrals', objectives: ['Evaluate definite integrals', 'Use limits of integration', 'Calculate exact values'], order: 45 },
    { section: 'AS1: Integration', title: 'Area Under Curve', objectives: ['Use definite integral to find area', 'Calculate area between curve and x-axis', 'Apply to y-axis bounded regions'], order: 46 },

    // AS1: Vectors
    { section: 'AS1: Vectors', title: 'Vectors in Two Dimensions', objectives: ['Use vectors in 2D including i and j unit vectors', 'Represent vectors in component form', 'Apply vector notation'], order: 47 },
    { section: 'AS1: Vectors', title: 'Magnitude and Direction', objectives: ['Calculate magnitude of vector', 'Find direction of vector', 'Convert between component and magnitude-direction forms'], order: 48 },
    { section: 'AS1: Vectors', title: 'Vector Operations', objectives: ['Perform vector addition', 'Multiply vectors by scalars', 'Understand geometrical interpretations'], order: 49 },
    { section: 'AS1: Vectors', title: 'Position Vectors', objectives: ['Use position vectors', 'Calculate distance between two points', 'Apply to coordinate geometry'], order: 50 },

    // AS2: Applied Mathematics - Mechanics
    { section: 'AS2: Mechanics - Quantities and Units', title: 'Fundamental Quantities', objectives: ['Use fundamental SI quantities length, time, mass', 'Apply base units metre, second, kilogram', 'Understand SI system'], order: 51 },
    { section: 'AS2: Mechanics - Quantities and Units', title: 'Derived Quantities', objectives: ['Use derived quantities velocity, acceleration, force, weight', 'Apply derived units', 'Convert between units'], order: 52 },
    { section: 'AS2: Mechanics - Kinematics', title: 'Kinematics Language', objectives: ['Use language of kinematics', 'Define position, displacement, distance travelled', 'Define velocity, speed and acceleration'], order: 53 },
    { section: 'AS2: Mechanics - Kinematics', title: 'Motion Graphs', objectives: ['Use and interpret displacement-time graphs', 'Interpret velocity-time graphs', 'Understand gradient and area under graph'], order: 54 },
    { section: 'AS2: Mechanics - Kinematics', title: 'Constant Acceleration Equations', objectives: ['Use formulae for constant acceleration', 'Apply to motion in straight line', 'Solve kinematics problems'], order: 55 },
    { section: 'AS2: Mechanics - Kinematics', title: 'Vectors in Kinematics', objectives: ['Use constant acceleration formulae in 2D', 'Apply vectors to motion', 'Solve vector kinematics problems'], order: 56 },
    { section: 'AS2: Mechanics - Forces', title: 'Newton First Law', objectives: ['Understand Newton first law', 'Use concept of force', 'Apply to stationary and constant velocity'], order: 57 },
    { section: 'AS2: Mechanics - Forces', title: 'Resolving Forces', objectives: ['Resolve forces in two dimensions', 'Use components of forces', 'Apply to inclined planes'], order: 58 },
    { section: 'AS2: Mechanics - Forces', title: 'Resultant Forces', objectives: ['Add forces to find resultant', 'Use system of forces', 'Calculate magnitude and direction'], order: 59 },
    { section: 'AS2: Mechanics - Forces', title: 'Newton Second Law', objectives: ['Use Newton second law F equals ma', 'Apply to constant mass', 'Include forces as 2D vectors'], order: 60 },
    { section: 'AS2: Mechanics - Forces', title: 'Gravitational Acceleration', objectives: ['Use gravitational acceleration g', 'Apply value in SI units to varying accuracy', 'Understand weight and motion under gravity'], order: 61 },
    { section: 'AS2: Mechanics - Forces', title: 'Newton Third Law', objectives: ['Use Newton third law', 'Understand action-reaction pairs', 'Apply to connected particles'], order: 62 },
    { section: 'AS2: Mechanics - Forces', title: 'Connected Particles', objectives: ['Solve problems with connected particles', 'Use Newton second and third laws', 'Apply to pulleys and strings'], order: 63 },
    { section: 'AS2: Mechanics - Forces', title: 'Equilibrium Problems', objectives: ['Solve problems involving equilibrium of forces', 'Apply condition for equilibrium', 'Use vector methods'], order: 64 },
    { section: 'AS2: Mechanics - Forces', title: 'Friction Model', objectives: ['Use F less than or equal to mu R model', 'Understand coefficient of friction', 'Apply to limiting friction'], order: 65 },
    { section: 'AS2: Mechanics - Forces', title: 'Motion on Rough Surfaces', objectives: ['Solve problems with rough surfaces', 'Apply friction model', 'Combine with Newton laws'], order: 66 },

    // AS2: Statistics
    { section: 'AS2: Statistics - Sampling', title: 'Population and Sample', objectives: ['Use terms population and sample', 'Make informal inferences about population', 'Understand sampling purpose'], order: 67 },
    { section: 'AS2: Statistics - Sampling', title: 'Sampling Techniques', objectives: ['Use simple random sampling', 'Apply stratified sampling', 'Select appropriate sampling technique'], order: 68 },
    { section: 'AS2: Statistics - Sampling', title: 'Sample Validity', objectives: ['Critique sampling techniques', 'Understand different samples give different conclusions', 'Apply to statistical problems'], order: 69 },
    { section: 'AS2: Statistics - Data', title: 'Histograms', objectives: ['Interpret histograms', 'Understand area represents frequency', 'Connect to probability distributions'], order: 70 },
    { section: 'AS2: Statistics - Data', title: 'Measures of Central Tendency', objectives: ['Interpret mean, median and mode', 'Calculate from data sets', 'Apply to real data'], order: 71 },
    { section: 'AS2: Statistics - Data', title: 'Standard Deviation and Variance', objectives: ['Interpret standard deviation and variance', 'Calculate for population or sample', 'Use summary statistics'], order: 72 },
    { section: 'AS2: Statistics - Data', title: 'Scatter Diagrams', objectives: ['Interpret scatter diagrams for bivariate data', 'Recognize distinct population sections', 'Understand regression lines'], order: 73 },
    { section: 'AS2: Statistics - Data', title: 'Correlation', objectives: ['Interpret correlation informally', 'Calculate product-moment correlation coefficient', 'Understand correlation does not imply causation'], order: 74 },
    { section: 'AS2: Statistics - Data', title: 'Outliers', objectives: ['Recognize possible outliers in data', 'Interpret outliers in diagrams', 'Apply appropriate treatment'], order: 75 },
    { section: 'AS2: Statistics - Data', title: 'Data Presentation Techniques', objectives: ['Select data presentation techniques', 'Critique presentation methods', 'Apply to statistical problems'], order: 76 },
    { section: 'AS2: Statistics - Data', title: 'Data Cleaning', objectives: ['Clean data including missing values', 'Deal with errors', 'Handle outliers appropriately'], order: 77 },
    { section: 'AS2: Statistics - Probability', title: 'Probability Laws', objectives: ['Use addition and multiplication laws', 'Apply to combined events', 'Understand mutually exclusive and independent events'], order: 78 },
    { section: 'AS2: Statistics - Probability', title: 'Probability Concepts', objectives: ['Understand mutually exclusive events', 'Apply exhaustive events', 'Use statistical dependence and independence'], order: 79 },
    { section: 'AS2: Statistics - Probability', title: 'Combined Probabilities', objectives: ['Calculate combined probabilities of up to three events', 'Use tree diagrams', 'Apply Venn diagrams and two-way tables'], order: 80 },
    { section: 'AS2: Statistics - Distributions', title: 'Binomial Distribution', objectives: ['Use binomial distribution as discrete probability distribution', 'Calculate binomial probabilities', 'Apply conditions for binomial model'], order: 81 },
    { section: 'AS2: Statistics - Distributions', title: 'Binomial Applications', objectives: ['Link binomial to binomial expansion', 'Use tree diagrams', 'Apply to real situations'], order: 82 },
  ];
}

function getMathematicsA2Lessons() {
  return [
    // A2 1: Pure Mathematics - Algebra and Functions
    { section: 'A2 1: Algebra and Functions', title: 'Rational Expressions', objectives: ['Simplify rational expressions', 'Factorise and cancel', 'Perform algebraic division'], order: 1 },
    { section: 'A2 1: Algebra and Functions', title: 'Functions Definition', objectives: ['Use definition of function', 'Understand mapping from domain to range', 'Apply function notation'], order: 2 },
    { section: 'A2 1: Algebra and Functions', title: 'Domain and Range', objectives: ['Use terms domain and range', 'Determine domain and range from functions', 'Apply restrictions'], order: 3 },
    { section: 'A2 1: Algebra and Functions', title: 'Composite Functions', objectives: ['Understand and use composite functions', 'Calculate fg of x and gf of x', 'Apply function composition'], order: 4 },
    { section: 'A2 1: Algebra and Functions', title: 'Inverse Functions', objectives: ['Use inverse functions', 'Find inverse algebraically', 'Sketch graphs of inverse functions'], order: 5 },
    { section: 'A2 1: Algebra and Functions', title: 'Modulus Function', objectives: ['Use modulus function', 'Solve inequalities involving modulus', 'Apply absolute value x minus a less than b'], order: 6 },
    { section: 'A2 1: Algebra and Functions', title: 'Combined Transformations', objectives: ['Understand combinations of transformations', 'Apply y equals af of x, y equals f of x plus a', 'Sketch y equals f of x plus a and y equals f of ax'], order: 7 },
    { section: 'A2 1: Algebra and Functions', title: 'Partial Fractions', objectives: ['Decompose rational functions into partial fractions', 'Handle linear and squared linear denominators', 'Apply to integration'], order: 8 },
    { section: 'A2 1: Algebra and Functions', title: 'Functions in Modelling', objectives: ['Use functions in modelling', 'Consider limitations of models', 'Refine models appropriately'], order: 9 },

    // A2 1: Coordinate Geometry
    { section: 'A2 1: Coordinate Geometry', title: 'Parametric Equations', objectives: ['Use parametric equations of curves', 'Convert between Cartesian and parametric', 'Apply to curve sketching'], order: 10 },
    { section: 'A2 1: Coordinate Geometry', title: 'Parametric Modelling', objectives: ['Use parametric equations in modelling', 'Apply to various contexts', 'Understand advantages of parametric form'], order: 11 },

    // A2 1: Sequences and Series
    { section: 'A2 1: Sequences and Series', title: 'Sequences and Recurrence Relations', objectives: ['Work with sequences given by nth term', 'Use recurrence relations x sub n plus 1 equals f of x sub n', 'Generate sequence terms'], order: 12 },
    { section: 'A2 1: Sequences and Series', title: 'Sequence Behaviour', objectives: ['Understand convergence of sequences', 'Identify divergence and oscillation', 'Analyze long-term behaviour'], order: 13 },
    { section: 'A2 1: Sequences and Series', title: 'Sigma Notation', objectives: ['Use sigma notation for series sums', 'Evaluate summations', 'Apply properties of sigma'], order: 14 },
    { section: 'A2 1: Sequences and Series', title: 'Arithmetic Sequences', objectives: ['Work with arithmetic sequences', 'Use formula for nth term', 'Calculate sum to n terms'], order: 15 },
    { section: 'A2 1: Sequences and Series', title: 'Geometric Sequences', objectives: ['Work with geometric sequences', 'Use formula for nth term', 'Calculate sum of finite series'], order: 16 },
    { section: 'A2 1: Sequences and Series', title: 'Proving Series Formulae', objectives: ['Prove formula for sum of arithmetic series', 'Prove sum of geometric series', 'Use mathematical induction'], order: 17 },
    { section: 'A2 1: Sequences and Series', title: 'Sum to Infinity', objectives: ['Find sum to infinity of convergent geometric series', 'Apply condition absolute value of r less than 1', 'Determine convergence'], order: 18 },
    { section: 'A2 1: Sequences and Series', title: 'Binomial Expansion General', objectives: ['Use expansion of a plus bx to power n for rational n', 'Apply for approximation', 'Understand validity condition absolute value of bx over a less than 1'], order: 19 },
    { section: 'A2 1: Sequences and Series', title: 'Series in Modelling', objectives: ['Use sequences and series in modelling', 'Apply to real-world contexts', 'Understand applications'], order: 20 },

    // A2 1: Trigonometry
    { section: 'A2 1: Trigonometry', title: 'Radian Measure', objectives: ['Work with radian measure', 'Use for arc length', 'Calculate area of sector'], order: 21 },
    { section: 'A2 1: Trigonometry', title: 'Reciprocal Trig Functions', objectives: ['Define secant, cosecant and cotangent', 'Understand relationships to sine, cosine, tangent', 'Use sec, cosec, cot'], order: 22 },
    { section: 'A2 1: Trigonometry', title: 'Inverse Trig Functions', objectives: ['Define arcsin, arccos and arctan', 'Understand graphs and domains', 'Apply restricted domains and ranges'], order: 23 },
    { section: 'A2 1: Trigonometry', title: 'Reciprocal and Inverse Graphs', objectives: ['Sketch graphs of sec, cosec, cot', 'Sketch arcsin, arccos, arctan', 'Understand appropriate domains'], order: 24 },
    { section: 'A2 1: Trigonometry', title: 'Pythagorean Identities', objectives: ['Use sec squared theta equals 1 plus tan squared theta', 'Apply cosec squared theta equals 1 plus cot squared theta', 'Prove and use identities'], order: 25 },
    { section: 'A2 1: Trigonometry', title: 'Compound Angle Formulae', objectives: ['Use formulae for sin of A plus or minus B', 'Apply cos of A plus or minus B', 'Use tan of A plus or minus B'], order: 26 },
    { section: 'A2 1: Trigonometry', title: 'Double Angle Formulae', objectives: ['Use and prove double angle formulae', 'Apply sin 2A, cos 2A, tan 2A', 'Solve equations using double angles'], order: 27 },
    { section: 'A2 1: Trigonometry', title: 'R-Formulae', objectives: ['Express a cos theta plus b sin theta as r cos of theta plus or minus alpha', 'Use r sin of theta plus or minus alpha form', 'Apply to solve equations and find maxima'], order: 28 },
    { section: 'A2 1: Trigonometry', title: 'Trigonometric Proofs', objectives: ['Construct proofs involving trig functions', 'Use identities systematically', 'Prove given identities'], order: 29 },
    { section: 'A2 1: Trigonometry', title: 'Trig in Context', objectives: ['Use trigonometric functions to solve problems in context', 'Apply to real-world situations', 'Model using trigonometry'], order: 30 },

    // A2 1: Differentiation
    { section: 'A2 1: Differentiation', title: 'Differentiating Exponentials and Logs', objectives: ['Differentiate e to power kx', 'Differentiate ln of kx', 'Apply to related functions'], order: 31 },
    { section: 'A2 1: Differentiation', title: 'Differentiating Trig Functions', objectives: ['Differentiate sin kx, cos kx, tan kx', 'Apply to sums, differences and multiples', 'Use in calculus problems'], order: 32 },
    { section: 'A2 1: Differentiation', title: 'Product and Quotient Rules', objectives: ['Use product rule for differentiation', 'Apply quotient rule', 'Combine with other rules'], order: 33 },
    { section: 'A2 1: Differentiation', title: 'Differentiating Reciprocal Trig', objectives: ['Differentiate cosec x, sec x, cot x', 'Apply derivative rules', 'Use in problems'], order: 34 },
    { section: 'A2 1: Differentiation', title: 'Implicit Differentiation', objectives: ['Differentiate functions defined implicitly', 'Find dy over dx for implicit relations', 'Calculate second derivative'], order: 35 },
    { section: 'A2 1: Differentiation', title: 'Parametric Differentiation', objectives: ['Differentiate parametric equations', 'Find dy over dx using dy over dt and dx over dt', 'Calculate second derivative'], order: 36 },
    { section: 'A2 1: Differentiation', title: 'Differential Equations', objectives: ['Construct simple differential equations', 'Apply in pure mathematics and context', 'Form equations from rates of change'], order: 37 },

    // A2 1: Integration
    { section: 'A2 1: Integration', title: 'Standard Integrals', objectives: ['Integrate e to power kx', 'Integrate 1 over x', 'Integrate sin kx and cos kx'], order: 38 },
    { section: 'A2 1: Integration', title: 'Area Between Curves', objectives: ['Find area between two curves', 'Use definite integrals', 'Apply subtraction method'], order: 39 },
    { section: 'A2 1: Integration', title: 'Integration as Limit of Sum', objectives: ['Understand integration as limit of sum', 'Use Riemann sums', 'Apply to area calculations'], order: 40 },
    { section: 'A2 1: Integration', title: 'Integration by Substitution', objectives: ['Use integration by substitution', 'Apply inverse of chain rule', 'Solve integrals using substitution'], order: 41 },
    { section: 'A2 1: Integration', title: 'Integration by Parts', objectives: ['Use integration by parts', 'Apply inverse of product rule', 'Solve integrals by parts'], order: 42 },
    { section: 'A2 1: Integration', title: 'Integration with Partial Fractions', objectives: ['Integrate using partial fractions', 'Decompose then integrate', 'Apply to rational functions'], order: 43 },
    { section: 'A2 1: Integration', title: 'Solving Differential Equations', objectives: ['Solve first order equations with separable variables', 'Find particular solutions', 'Apply initial conditions'], order: 44 },
    { section: 'A2 1: Integration', title: 'Differential Equations in Context', objectives: ['Interpret solution in context', 'Identify limitations of solution', 'Apply to real problems'], order: 45 },
    { section: 'A2 1: Integration', title: 'Volumes of Revolution', objectives: ['Evaluate volume by rotation about x-axis', 'Use pi times integral of y squared dx', 'Calculate solid volumes'], order: 46 },

    // A2 1: Numerical Methods
    { section: 'A2 1: Numerical Methods', title: 'Locating Roots', objectives: ['Locate roots of f of x equals 0', 'Use sign changes of f of x', 'Apply to continuous functions'], order: 47 },
    { section: 'A2 1: Numerical Methods', title: 'Iterative Methods', objectives: ['Solve equations using iterative methods', 'Apply Newton-Raphson method', 'Understand convergence'], order: 48 },
    { section: 'A2 1: Numerical Methods', title: 'Trapezium Rule', objectives: ['Use trapezium rule for numerical integration', 'Approximate area under curve', 'Understand error and accuracy'], order: 49 },
    { section: 'A2 1: Numerical Methods', title: 'Numerical Methods in Context', objectives: ['Use numerical methods to solve problems', 'Apply to real contexts', 'Understand when analytical solutions impossible'], order: 50 },

    // A2 2: Applied Mathematics - Mechanics
    { section: 'A2 2: Mechanics - Kinematics', title: 'Calculus in Kinematics', objectives: ['Use v equals ds over dt', 'Apply a equals dv over dt equals d squared s over dt squared', 'Use s equals integral of v dt and v equals integral of a dt'], order: 51 },
    { section: 'A2 2: Mechanics - Kinematics', title: 'Vector Kinematics with Calculus', objectives: ['Use bold v equals d bold r over dt', 'Apply bold a equals d bold v over dt', 'Use vector calculus in 2D'], order: 52 },
    { section: 'A2 2: Mechanics - Kinematics', title: 'Motion Under Gravity in 2D', objectives: ['Model motion under gravity using vectors', 'Apply to projectile problems', 'Solve for range, height and time'], order: 53 },
    { section: 'A2 2: Mechanics - Kinematics', title: 'Projectile Problems', objectives: ['Solve problems involving projectiles', 'Apply constant acceleration under gravity', 'Use vector methods'], order: 54 },
    { section: 'A2 2: Mechanics - Moments', title: 'Moments in Statics', objectives: ['Use moments in simple static contexts', 'Apply to rods and ladders', 'Solve hinged beam problems'], order: 55 },
    { section: 'A2 2: Mechanics - Impulse', title: 'Impulse and Momentum', objectives: ['Use impulse and momentum', 'Apply impulse-momentum theorem', 'Solve impact problems'], order: 56 },
    { section: 'A2 2: Mechanics - Impulse', title: 'Conservation of Momentum', objectives: ['Use principle of conservation of linear momentum', 'Solve direct collision problems', 'Apply to explosions'], order: 57 },

    // A2 2: Statistics
    { section: 'A2 2: Statistics - Probability', title: 'Conditional Probability', objectives: ['Use conditional probability', 'Apply tree diagrams, Venn diagrams and two-way tables', 'Solve conditional problems'], order: 58 },
    { section: 'A2 2: Statistics - Probability', title: 'Conditional Probability Formula', objectives: ['Use P of A given B equals P of A intersection B over P of B', 'Apply conditional probability formula', 'Solve using formula'], order: 59 },
    { section: 'A2 2: Statistics - Probability', title: 'Probability Modelling', objectives: ['Model with probability', 'Critique assumptions made', 'Consider effect of realistic assumptions'], order: 60 },
    { section: 'A2 2: Statistics - Distributions', title: 'Normal Distribution', objectives: ['Use normal distribution as continuous probability distribution', 'Understand properties of normal curve', 'Apply to real data'], order: 61 },
    { section: 'A2 2: Statistics - Distributions', title: 'Normal Probabilities', objectives: ['Find probabilities using normal distribution', 'Use tables or calculator', 'Apply standardisation'], order: 62 },
    { section: 'A2 2: Statistics - Distributions', title: 'Selecting Distributions', objectives: ['Select appropriate probability distribution', 'Provide reasoning for choice', 'Recognize when binomial or normal inappropriate'], order: 63 },
    { section: 'A2 2: Statistics - Hypothesis Testing', title: 'Hypothesis Testing Language', objectives: ['Use language of hypothesis testing', 'Understand null and alternative hypotheses', 'Define significance level and acceptance region'], order: 64 },
    { section: 'A2 2: Statistics - Hypothesis Testing', title: 'Inference and Significance', objectives: ['Understand sample used for inference about population', 'Appreciate significance level meaning', 'Understand probability of incorrectly rejecting null'], order: 65 },
    { section: 'A2 2: Statistics - Hypothesis Testing', title: 'Binomial Hypothesis Test', objectives: ['Conduct hypothesis test for binomial proportion', 'Interpret results in context', 'Apply to real situations'], order: 66 },
    { section: 'A2 2: Statistics - Hypothesis Testing', title: 'Normal Mean Hypothesis Test', objectives: ['Conduct hypothesis test for mean of normal distribution', 'Use known, given or assumed variance', 'Interpret results in context'], order: 67 },
    { section: 'A2 2: Statistics - Hypothesis Testing', title: 'Correlation Testing', objectives: ['Interpret correlation coefficient', 'Use given p-value or critical value', 'Test for significance'], order: 68 },
  ];
}