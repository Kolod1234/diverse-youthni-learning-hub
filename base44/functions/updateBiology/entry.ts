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
      category: 'biology'
    });

    const results = [];
    
    for (const course of courses) {
      try {
        const lessons = course.alevel_stage === 'as' ? getBiologyAS() : getBiologyA2();
        
        if (!lessons || lessons.length === 0) {
          results.push({ course: course.title, status: 'no data' });
          continue;
        }

        const existing = await base44.entities.Lesson.filter({ course_id: course.id });
        if (existing.length > 0) {
          await Promise.all(existing.map(l => base44.asServiceRole.entities.Lesson.delete(l.id)));
        }

        // Create lessons in batches of 20 to avoid timeout
        const batchSize = 20;
        for (let i = 0; i < lessons.length; i += batchSize) {
          const batch = lessons.slice(i, i + batchSize);
          await base44.entities.Lesson.bulkCreate(batch.map(l => ({
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
          await new Promise(r => setTimeout(r, 500)); // Small delay between batches
        }

        await base44.asServiceRole.entities.Course.update(course.id, {
          total_lessons: lessons.length
        });

        results.push({ course: course.title, lessons: lessons.length, status: 'success' });
        await new Promise(r => setTimeout(r, 12000)); // Longer delay between courses

      } catch (error) {
        results.push({ course: course.title, status: 'error', error: error.message });
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getBiologyAS() {
  let o = 1;
  const lessons = [];
  
  // AS1 Unit 1: Molecules and Cells
  
  // 1.1 Biological Molecules (18 lessons)
  lessons.push(
    { s: 'AS1: Biological Molecules', o: o++, t: 'Water - The Biological Solvent', d: 'Structure and properties of water', obj: ['Explain hydrogen bonding in water', 'Describe water as a solvent', 'Understand biological importance'] },
    { s: 'AS1: Biological Molecules', o: o++, t: 'Inorganic Ions in Biology', d: 'Role of key ions', obj: ['Explain roles of K+ Ca2+ Mg2+ Fe2+', 'Understand nitrate phosphate ions', 'Describe hydrogencarbonate buffering'] },
    { s: 'AS1: Biological Molecules', o: o++, t: 'Carbohydrates - Monosaccharides', d: 'Simple sugars', obj: ['Describe glucose fructose structure', 'Compare alpha-glucose beta-glucose', 'Understand pentoses ribose deoxyribose'] },
    { s: 'AS1: Biological Molecules', o: o++, t: 'Disaccharides', d: 'Double sugars', obj: ['Explain condensation reactions', 'Describe maltose sucrose lactose', 'Understand glycosidic bonds'] },
    { s: 'AS1: Biological Molecules', o: o++, t: 'Polysaccharides - Starch and Glycogen', d: 'Storage carbohydrates', obj: ['Describe starch structure amylose amylopectin', 'Explain glycogen structure', 'Compare storage polysaccharides'] },
    { s: 'AS1: Biological Molecules', o: o++, t: 'Cellulose', d: 'Structural polysaccharide', obj: ['Describe cellulose structure', 'Explain beta-glucose linkages', 'Understand structural role'] },
    { s: 'AS1: Biological Molecules', o: o++, t: 'Lipids - Triglycerides', d: 'Fats and oils', obj: ['Describe triglyceride structure', 'Explain ester bond formation', 'Compare saturated unsaturated fatty acids'] },
    { s: 'AS1: Biological Molecules', o: o++, t: 'Phospholipids', d: 'Membrane lipids', obj: ['Describe phospholipid structure', 'Explain hydrophilic hydrophobic regions', 'Understand bilayer formation'] },
    { s: 'AS1: Biological Molecules', o: o++, t: 'Proteins - Amino Acids', d: 'Building blocks of proteins', obj: ['Describe amino acid general structure', 'Explain peptide bond formation', 'Understand condensation polymerization'] },
    { s: 'AS1: Biological Molecules', o: o++, t: 'Protein Structure Levels', d: 'Primary to quaternary', obj: ['Describe primary structure sequence', 'Explain secondary structure helix sheet', 'Understand tertiary quaternary structure'] },
    { s: 'AS1: Biological Molecules', o: o++, t: 'Fibrous Proteins', d: 'Structural proteins', obj: ['Describe collagen structure', 'Explain keratin properties', 'Understand structural protein features'] },
    { s: 'AS1: Biological Molecules', o: o++, t: 'Globular Proteins', d: 'Functional proteins', obj: ['Describe globular protein features', 'Explain enzyme haemoglobin structure', 'Compare fibrous vs globular'] },
    { s: 'AS1: Biological Molecules', o: o++, t: 'Conjugated Proteins', d: 'Proteins with prosthetic groups', obj: ['Describe glycoproteins', 'Explain haemoglobin structure', 'Understand prosthetic group role'] },
    { s: 'AS1: Biological Molecules', o: o++, t: 'Prions', d: 'Misfolded proteins', obj: ['Explain prion structure', 'Describe BSE CJD', 'Understand protein misfolding diseases'] },
    { s: 'AS1: Biological Molecules', o: o++, t: 'Nucleotides and DNA', d: 'Nucleic acid structure', obj: ['Describe nucleotide structure', 'Explain DNA double helix', 'Understand base pairing'] },
    { s: 'AS1: Biological Molecules', o: o++, t: 'RNA Structure', d: 'Ribonucleic acid', obj: ['Compare DNA and RNA', 'Describe mRNA tRNA rRNA', 'Understand RNA roles'] },
    { s: 'AS1: Biological Molecules', o: o++, t: 'DNA Replication', d: 'Semi-conservative replication', obj: ['Explain DNA replication process', 'Describe DNA helicase polymerase', 'Understand Meselson-Stahl evidence'] },
    { s: 'AS1: Biological Molecules', o: o++, t: 'Biochemical Tests', d: 'Detecting biological molecules', obj: ['Use Benedict test reducing sugars', 'Apply iodine test starch', 'Perform biuret test proteins'] }
  );
  
  // 1.2 Enzymes (8 lessons)
  lessons.push(
    { s: 'AS1: Enzymes', o: o++, t: 'Enzyme Structure and Function', d: 'Biological catalysts', obj: ['Describe enzyme globular structure', 'Explain active site specificity', 'Understand enzyme-substrate complex'] },
    { s: 'AS1: Enzymes', o: o++, t: 'Lock and Key vs Induced Fit', d: 'Models of enzyme action', obj: ['Explain lock and key hypothesis', 'Describe induced fit model', 'Compare both models'] },
    { s: 'AS1: Enzymes', o: o++, t: 'Cofactors and Coenzymes', d: 'Enzyme helpers', obj: ['Define cofactors coenzymes', 'Explain prosthetic groups', 'Understand vitamin roles'] },
    { s: 'AS1: Enzymes', o: o++, t: 'Factors Affecting Enzyme Activity', d: 'Temperature pH concentration', obj: ['Investigate temperature effects', 'Analyze pH effects', 'Understand substrate concentration'] },
    { s: 'AS1: Enzymes', o: o++, t: 'Enzyme Inhibition', d: 'Competitive and non-competitive', obj: ['Explain competitive inhibition', 'Describe non-competitive inhibition', 'Apply inhibitors as drugs'] },
    { s: 'AS1: Enzymes', o: o++, t: 'Enzymes as Biomarkers', d: 'Diagnostic enzymes', obj: ['Understand enzyme biomarkers', 'Explain elastase in respiratory infections', 'Apply clinical detection'] },
    { s: 'AS1: Enzymes', o: o++, t: 'Immobilised Enzymes', d: 'Industrial applications', obj: ['Describe immobilisation methods', 'Explain advantages stability reuse', 'Apply biosensors pregnancy tests'] },
    { s: 'AS1: Enzymes', o: o++, t: 'Chromatography', d: 'Separating biological molecules', obj: ['Perform paper chromatography', 'Calculate Rf values', 'Identify amino acids pigments'] }
  );
  
  // 1.3 Viruses (3 lessons)
  lessons.push(
    { s: 'AS1: Viruses', o: o++, t: 'Virus Structure', d: 'Non-cellular organisms', obj: ['Describe bacteriophage structure', 'Explain HIV structure', 'Compare DNA and RNA viruses'] },
    { s: 'AS1: Viruses', o: o++, t: 'Viral Replication', d: 'Life cycle of viruses', obj: ['Explain lytic cycle phages', 'Describe HIV replication', 'Understand host cell dependency'] },
    { s: 'AS1: Viruses', o: o++, t: 'Viruses and Disease', d: 'Pathogenic viruses', obj: ['Understand viral diseases', 'Explain HIV and AIDS', 'Describe viral transmission'] }
  );
  
  // 1.4 Cell Structure (16 lessons)
  lessons.push(
    { s: 'AS1: Cell Structure', o: o++, t: 'Prokaryotic Cells', d: 'Bacterial cell organization', obj: ['Describe prokaryote features', 'Explain circular DNA plasmids', 'Understand cell wall peptidoglycan'] },
    { s: 'AS1: Eukaryotic Cells', o: o++, t: 'Eukaryotic Cell Overview', d: 'Complex cellular organization', obj: ['Describe nucleus membrane-bound organelles', 'Explain compartmentalization', 'Compare prokaryotes eukaryotes'] },
    { s: 'AS1: Cell Structure', o: o++, t: 'Plasma Membrane Structure', d: 'Fluid mosaic model', obj: ['Describe phospholipid bilayer', 'Explain membrane proteins', 'Understand glycocalyx'] },
    { s: 'AS1: Cell Structure', o: o++, t: 'Membrane Proteins', d: 'Functions of membrane proteins', obj: ['Explain carrier channel proteins', 'Describe receptor proteins', 'Understand recognition proteins'] },
    { s: 'AS1: Cell Structure', o: o++, t: 'Nucleus', d: 'Genetic control center', obj: ['Describe nuclear envelope', 'Explain nucleolus function', 'Understand chromatin chromosomes'] },
    { s: 'AS1: Cell Structure', o: o++, t: 'Mitochondria', d: 'Powerhouse of cell', obj: ['Describe mitochondrial structure', 'Explain double membrane cristae', 'Understand ATP production'] },
    { s: 'AS1: Cell Structure', o: o++, t: 'Chloroplasts', d: 'Photosynthesis organelles', obj: ['Describe chloroplast structure', 'Explain grana thylakoids stroma', 'Understand double membrane'] },
    { s: 'AS1: Cell Structure', o: o++, t: 'Endoplasmic Reticulum', d: 'Protein and lipid synthesis', obj: ['Describe rough ER', 'Explain smooth ER', 'Understand ER functions'] },
    { s: 'AS1: Cell Structure', o: o++, t: 'Ribosomes', d: 'Protein synthesis sites', obj: ['Describe ribosome structure', 'Explain 80S vs 70S', 'Understand protein synthesis'] },
    { s: 'AS1: Cell Structure', o: o++, t: 'Golgi Apparatus', d: 'Protein modification packaging', obj: ['Describe Golgi structure', 'Explain protein modification', 'Understand vesicle formation'] },
    { s: 'AS1: Cell Structure', o: o++, t: 'Lysosomes', d: 'Digestive organelles', obj: ['Describe lysosome structure', 'Explain hydrolytic enzymes', 'Understand autophagy'] },
    { s: 'AS1: Cell Structure', o: o++, t: 'Cytoskeleton', d: 'Cell support and movement', obj: ['Describe microfilaments microtubules', 'Explain centrioles', 'Understand cell shape movement'] },
    { s: 'AS1: Cell Structure', o: o++, t: 'Plant Cell Features', d: 'Unique plant structures', obj: ['Describe cell wall', 'Explain vacuole', 'Understand plasmodesmata'] },
    { s: 'AS1: Cell Structure', o: o++, t: 'Fungal Cells', d: 'Characteristics of fungi', obj: ['Describe fungal cell wall chitin', 'Explain hyphae', 'Understand multinucleate cells'] },
    { s: 'AS1: Cell Structure', o: o++, t: 'Microscopy', d: 'Viewing cells', obj: ['Use light microscope', 'Understand electron microscopy TEM SEM', 'Calculate magnification'] },
    { s: 'AS1: Cell Structure', o: o++, t: 'Cell Fractionation', d: 'Isolating organelles', obj: ['Explain homogenisation', 'Describe differential centrifugation', 'Understand organelle separation'] }
  );
  
  // AS2 Unit 2: Organisms and Biodiversity
  
  // 2.1 Transport in Animals (12 lessons)
  lessons.push(
    { s: 'AS2: Transport Animals', o: o++, t: 'Need for Transport Systems', d: 'Why organisms need transport', obj: ['Explain SA:V ratio limitations', 'Describe metabolic demands', 'Understand diffusion distances'] },
    { s: 'AS2: Transport Animals', o: o++, t: 'Circulatory System Types', d: 'Open vs closed systems', obj: ['Compare open closed circulatory systems', 'Describe single double circulation', 'Understand fish mammal circulation'] },
    { s: 'AS2: Transport Animals', o: o++, t: 'Blood Vessels', d: 'Arteries veins capillaries', obj: ['Describe artery structure', 'Explain vein structure valves', 'Understand capillary structure'] },
    { s: 'AS2: Transport Animals', o: o++, t: 'Heart Structure', d: 'Mammalian heart anatomy', obj: ['Describe four chambers', 'Explain valves', 'Understand coronary arteries'] },
    { s: 'AS2: Transport Animals', o: o++, t: 'Cardiac Cycle', d: 'Heart pumping action', obj: ['Explain atrial systole', 'Describe ventricular systole', 'Understand diastole'] },
    { s: 'AS2: Transport Animals', o: o++, t: 'Heart Control', d: 'Cardiac coordination', obj: ['Describe SAN pacemaker', 'Explain AVN bundle of His', 'Understand Purkyne fibres'] },
    { s: 'AS2: Transport Animals', o: o++, t: 'Blood Composition', d: 'Components of blood', obj: ['Describe plasma components', 'Explain red blood cells', 'Understand white blood cells platelets'] },
    { s: 'AS2: Transport Animals', o: o++, t: 'Haemoglobin', d: 'Oxygen transport', obj: ['Describe haemoglobin structure', 'Explain oxygen dissociation curves', 'Understand Bohr effect'] },
    { s: 'AS2: Transport Animals', o: o++, t: 'Transport of CO2', d: 'Carbon dioxide removal', obj: ['Explain carbonic anhydrase', 'Describe hydrogencarbonate ions', 'Understand chloride shift'] },
    { s: 'AS2: Transport Animals', o: o++, t: 'Tissue Fluid Formation', d: 'Capillary exchange', obj: ['Explain hydrostatic pressure', 'Describe oncotic pressure', 'Understand fluid exchange'] },
    { s: 'AS2: Transport Animals', o: o++, t: 'Lymphatic System', d: 'Lymph and immunity', obj: ['Describe lymph formation', 'Explain lymph vessels nodes', 'Understand immune function'] },
    { s: 'AS2: Transport Animals', o: o++, t: 'Cardiovascular Disease', d: 'Heart and vessel disorders', obj: ['Explain atherosclerosis', 'Describe coronary heart disease', 'Understand risk factors'] }
  );
  
  // 2.2 Transport in Plants (10 lessons)
  lessons.push(
    { s: 'AS2: Transport Plants', o: o++, t: 'Plant Transport Overview', d: 'Xylem and phloem', obj: ['Explain need for transport', 'Describe vascular tissue', 'Understand distribution'] },
    { s: 'AS2: Transport Plants', o: o++, t: 'Xylem Structure', d: 'Water transport tissue', obj: ['Describe vessel elements', 'Explain lignification', 'Understand xylem function'] },
    { s: 'AS2: Transport Plants', o: o++, t: 'Phloem Structure', d: 'Sugar transport tissue', obj: ['Describe sieve tube elements', 'Explain companion cells', 'Understand phloem function'] },
    { s: 'AS2: Transport Plants', o: o++, t: 'Water Uptake', d: 'Root absorption', obj: ['Describe root hair cells', 'Explain water potential gradient', 'Understand osmosis in roots'] },
    { s: 'AS2: Transport Plants', o: o++, t: 'Transpiration', d: 'Water loss from leaves', obj: ['Explain transpiration process', 'Describe stomatal control', 'Understand environmental factors'] },
    { s: 'AS2: Transport Plants', o: o++, t: 'Cohesion-Tension Theory', d: 'Water movement in xylem', obj: ['Explain cohesion of water molecules', 'Describe tension created', 'Understand transpiration pull'] },
    { s: 'AS2: Transport Plants', o: o++, t: 'Translocation', d: 'Sugar transport in phloem', obj: ['Describe mass flow hypothesis', 'Explain source to sink', 'Understand loading unloading'] },
    { s: 'AS2: Transport Plants', o: o++, t: 'Adaptations - Xerophytes', d: 'Desert plant adaptations', obj: ['Explain water conservation', 'Describe structural adaptations', 'Understand xerophyte features'] },
    { s: 'AS2: Transport Plants', o: o++, t: 'Adaptations - Hydrophytes', d: 'Aquatic plant adaptations', obj: ['Describe floating adaptations', 'Explain gas exchange', 'Understand hydrophyte features'] },
    { s: 'AS2: Transport Plants', o: o++, t: 'Measuring Transpiration', d: 'Practical investigations', obj: ['Use potometer', 'Measure transpiration rate', 'Investigate environmental factors'] }
  );
  
  // 2.3 Gas Exchange (8 lessons)
  lessons.push(
    { s: 'AS2: Gas Exchange', o: o++, t: 'Gas Exchange Principles', d: 'Diffusion and surfaces', obj: ['Explain Fick law', 'Describe gas exchange surfaces', 'Understand SA:V ratio'] },
    { s: 'AS2: Gas Exchange', o: o++, t: 'Human Respiratory System', d: 'Breathing apparatus', obj: ['Describe trachea bronchi alveoli', 'Explain ventilation mechanism', 'Understand diaphragm intercostals'] },
    { s: 'AS2: Gas Exchange', o: o++, t: 'Alveolar Gas Exchange', d: 'Oxygen and CO2 exchange', obj: ['Describe alveolar structure', 'Explain diffusion gradients', 'Understand countercurrent'] },
    { s: 'AS2: Gas Exchange', o: o++, t: 'Breathing Mechanics', d: 'Inspiration and expiration', obj: ['Explain inspiration process', 'Describe expiration', 'Understand pressure changes'] },
    { s: 'AS2: Gas Exchange', o: o++, t: 'Fish Gas Exchange', d: 'Gills and water', obj: ['Describe gill structure', 'Explain countercurrent flow', 'Understand efficient gas exchange'] },
    { s: 'AS2: Gas Exchange', o: o++, t: 'Insect Gas Exchange', d: 'Tracheal system', obj: ['Describe spiracles tracheae', 'Explain direct diffusion', 'Understand limitations'] },
    { s: 'AS2: Gas Exchange', o: o++, t: 'Leaf Gas Exchange', d: 'Stomata and mesophyll', obj: ['Describe stomatal structure', 'Explain gas exchange in leaves', 'Understand spongy mesophyll'] },
    { s: 'AS2: Gas Exchange', o: o++, t: 'Respiratory Disease', d: 'Disorders of gas exchange', obj: ['Explain emphysema', 'Describe asthma', 'Understand fibrosis'] }
  );
  
  // 2.4 Biodiversity (8 lessons)
  lessons.push(
    { s: 'AS2: Biodiversity', o: o++, t: 'Classification Systems', d: 'Organizing life', obj: ['Explain taxonomic hierarchy', 'Describe binomial nomenclature', 'Understand five kingdoms'] },
    { s: 'AS2: Biodiversity', o: o++, t: 'Three Domain System', d: 'Archaea Bacteria Eukarya', obj: ['Describe three domains', 'Explain molecular evidence', 'Understand phylogeny'] },
    { s: 'AS2: Biodiversity', o: o++, t: 'Measuring Biodiversity', d: 'Species richness and evenness', obj: ['Calculate species richness', 'Use Simpson diversity index', 'Understand biodiversity importance'] },
    { s: 'AS2: Biodiversity', o: o++, t: 'Sampling Techniques', d: 'Field investigation methods', obj: ['Use quadrats', 'Perform transects', 'Calculate population estimates'] },
    { s: 'AS2: Biodiversity', o: o++, t: 'Conservation', d: 'Protecting biodiversity', obj: ['Explain conservation importance', 'Describe in-situ ex-situ', 'Understand gene banks seed banks'] },
    { s: 'AS2: Biodiversity', o: o++, t: 'Threats to Biodiversity', d: 'Human impacts', obj: ['Explain habitat destruction', 'Describe climate change', 'Understand invasive species'] },
    { s: 'AS2: Biodiversity', o: o++, t: 'Sustainability', d: 'Sustainable use of resources', obj: ['Explain sustainable development', 'Describe sustainable practices', 'Understand ecological footprint'] },
    { s: 'AS2: Biodiversity', o: o++, t: 'Local Biodiversity Study', d: 'Fieldwork investigation', obj: ['Plan biodiversity study', 'Collect analyze data', 'Present findings'] }
  );
  
  return lessons;
}

function getBiologyA2() {
  let o = 1;
  const lessons = [];
  
  // A2-1 Unit 1: Physiology and Ecosystems
  
  // 1.1 Homeostasis and Kidney (12 lessons)
  lessons.push(
    { s: 'A2-1: Homeostasis', o: o++, t: 'Principles of Homeostasis', d: 'Maintaining internal environment', obj: ['Define homeostasis', 'Explain negative feedback', 'Understand positive feedback'] },
    { s: 'A2-1: Homeostasis', o: o++, t: 'Thermoregulation', d: 'Temperature control', obj: ['Describe hypothalamus role', 'Explain heat gain loss mechanisms', 'Understand ectotherms endotherms'] },
    { s: 'A2-1: Homeostasis', o: o++, t: 'Blood Glucose Regulation', d: 'Controlling glucose levels', obj: ['Explain insulin glucagon', 'Describe pancreas role', 'Understand diabetes'] },
    { s: 'A2-1: Kidney', o: o++, t: 'Kidney Structure', d: 'Renal anatomy', obj: ['Describe kidney structure', 'Explain nephron components', 'Understand cortex medulla'] },
    { s: 'A2-1: Kidney', o: o++, t: 'Ultrafiltration', d: 'Filtering blood', obj: ['Describe glomerulus Bowman capsule', 'Explain filtration pressure', 'Understand filtrate composition'] },
    { s: 'A2-1: Kidney', o: o++, t: 'Selective Reabsorption', d: 'Recovering useful substances', obj: ['Explain proximal tubule reabsorption', 'Describe glucose amino acid recovery', 'Understand active transport'] },
    { s: 'A2-1: Kidney', o: o++, t: 'Loop of Henle', d: 'Concentrating urine', obj: ['Describe countercurrent multiplier', 'Explain water potential gradient', 'Understand concentration mechanism'] },
    { s: 'A2-1: Kidney', o: o++, t: 'ADH and Osmoregulation', d: 'Water balance control', obj: ['Explain ADH role', 'Describe collecting duct permeability', 'Understand osmoregulation'] },
    { s: 'A2-1: Kidney', o: o++, t: 'Kidney Disease', d: 'Renal failure', obj: ['Explain kidney failure causes', 'Describe dialysis', 'Understand transplantation'] },
    { s: 'A2-1: Kidney', o: o++, t: 'Excretion', d: 'Removal of metabolic waste', obj: ['Explain nitrogenous waste', 'Describe urea formation liver', 'Understand excretory products'] },
    { s: 'A2-1: Kidney', o: o++, t: 'Water Balance', d: 'Maintaining water levels', obj: ['Explain water intake output', 'Describe dehydration', 'Understand water potential'] },
    { s: 'A2-1: Kidney', o: o++, t: 'Kidney Practical', d: 'Investigating kidney function', obj: ['Analyze urine composition', 'Interpret clinical data', 'Understand diagnostic tests'] }
  );
  
  // 1.2 Immunity (14 lessons)
  lessons.push(
    { s: 'A2-1: Immunity', o: o++, t: 'Defence Mechanisms', d: 'Preventing infection', obj: ['Describe physical barriers', 'Explain chemical barriers', 'Understand non-specific defences'] },
    { s: 'A2-1: Immunity', o: o++, t: 'Phagocytosis', d: 'Engulfing pathogens', obj: ['Explain phagocyte action', 'Describe lysosomes role', 'Understand non-specific response'] },
    { s: 'A2-1: Immunity', o: o++, t: 'Immune System Cells', d: 'Types of white blood cells', obj: ['Describe lymphocytes', 'Explain T cells B cells', 'Understand antigen presenting cells'] },
    { s: 'A2-1: Immunity', o: o++, t: 'Cell-Mediated Immunity', d: 'T lymphocyte response', obj: ['Explain T helper cells', 'Describe T killer cells', 'Understand clonal selection'] },
    { s: 'A2-1: Immunity', o: o++, t: 'Humoral Immunity', d: 'B lymphocyte response', obj: ['Describe B cell activation', 'Explain plasma cells', 'Understand antibody production'] },
    { s: 'A2-1: Immunity', o: o++, t: 'Antibodies', d: 'Structure and function', obj: ['Describe antibody structure', 'Explain antigen-antibody binding', 'Understand antibody classes'] },
    { s: 'A2-1: Immunity', o: o++, t: 'Primary vs Secondary Response', d: 'Immune memory', obj: ['Explain primary immune response', 'Describe secondary response', 'Understand memory cells'] },
    { s: 'A2-1: Immunity', o: o++, t: 'Vaccination', d: 'Artificial active immunity', obj: ['Explain vaccination principle', 'Describe herd immunity', 'Understand vaccine types'] },
    { s: 'A2-1: Immunity', o: o++, t: 'Passive Immunity', d: 'Acquiring antibodies', obj: ['Explain natural passive immunity', 'Describe artificial passive immunity', 'Understand temporary protection'] },
    { s: 'A2-1: Immunity', o: o++, t: 'Autoimmune Diseases', d: 'Immune system errors', obj: ['Explain autoimmunity', 'Describe examples rheumatoid arthritis', 'Understand causes'] },
    { s: 'A2-1: Immunity', o: o++, t: 'Allergies', d: 'Hypersensitivity reactions', obj: ['Explain allergic response', 'Describe histamine release', 'Understand anaphylaxis'] },
    { s: 'A2-1: Immunity', o: o++, t: 'HIV and AIDS', d: 'Immune deficiency', obj: ['Describe HIV structure replication', 'Explain AIDS development', 'Understand immune system destruction'] },
    { s: 'A2-1: Immunity', o: o++, t: 'Antibiotics', d: 'Treating bacterial infections', obj: ['Explain antibiotic action', 'Describe antibiotic resistance', 'Understand MRSA'] },
    { s: 'A2-1: Immunity', o: o++, t: 'Monoclonal Antibodies', d: 'Medical applications', obj: ['Explain monoclonal antibody production', 'Describe therapeutic uses', 'Understand diagnostic applications'] }
  );
  
  // 1.3 Coordination and Control (18 lessons)
  lessons.push(
    { s: 'A2-1: Nervous System', o: o++, t: 'Nervous System Organization', d: 'CNS and PNS', obj: ['Describe central nervous system', 'Explain peripheral nervous system', 'Understand somatic autonomic'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'Neurone Structure', d: 'Nerve cell anatomy', obj: ['Describe sensory motor relay neurones', 'Explain myelin sheath', 'Understand nodes of Ranvier'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'Resting Potential', d: 'Membrane potential', obj: ['Explain sodium-potassium pump', 'Describe -70mV resting potential', 'Understand ion distribution'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'Action Potential', d: 'Nerve impulse', obj: ['Explain depolarization', 'Describe repolarization', 'Understand all-or-nothing principle'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'Impulse Transmission', d: 'Propagating the signal', obj: ['Explain saltatory conduction', 'Describe refractory period', 'Understand factors affecting speed'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'Synapses', d: 'Neural junctions', obj: ['Describe synapse structure', 'Explain neurotransmitter release', 'Understand synaptic transmission'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'Synaptic Integration', d: 'Summation of signals', obj: ['Explain spatial summation', 'Describe temporal summation', 'Understand inhibition'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'Receptors', d: 'Detecting stimuli', obj: ['Describe mechanoreceptors', 'Explain chemoreceptors photoreceptors', 'Understand receptor potentials'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'Eye Structure', d: 'Visual system anatomy', obj: ['Describe eye structure', 'Explain retina components', 'Understand accommodation'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'Photoreceptors', d: 'Rods and cones', obj: ['Describe rod cells', 'Explain cone cells', 'Understand rhodopsin'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'Visual Processing', d: 'From light to perception', obj: ['Explain phototransduction', 'Describe optic nerve', 'Understand visual cortex'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'Brain Structure', d: 'Cerebral organization', obj: ['Describe cerebrum cerebellum', 'Explain medulla hypothalamus', 'Understand brain regions'] },
    { s: 'A2-1: Endocrine', o: o++, t: 'Endocrine System', d: 'Hormonal control', obj: ['Explain hormone definition', 'Describe endocrine glands', 'Understand chemical signaling'] },
    { s: 'A2-1: Endocrine', o: o++, t: 'Hormone Action', d: 'Mechanisms of hormones', obj: ['Explain steroid hormones', 'Describe peptide hormones', 'Understand second messengers'] },
    { s: 'A2-1: Endocrine', o: o++, t: 'Pituitary Gland', d: 'Master gland', obj: ['Describe anterior pituitary', 'Explain posterior pituitary', 'Understand hormone regulation'] },
    { s: 'A2-1: Endocrine', o: o++, t: 'Adrenal Glands', d: 'Stress response', obj: ['Describe adrenal cortex medulla', 'Explain cortisol adrenaline', 'Understand fight-or-flight'] },
    { s: 'A2-1: Coordination', o: o++, t: 'Muscle Structure', d: 'Skeletal muscle anatomy', obj: ['Describe muscle fibres', 'Explain myofibrils sarcomeres', 'Understand filament arrangement'] },
    { s: 'A2-1: Coordination', o: o++, t: 'Muscle Contraction', d: 'Sliding filament theory', obj: ['Explain actin myosin interaction', 'Describe cross-bridge cycle', 'Understand ATP role'] }
  );
  
  // 1.4 Ecosystems (12 lessons)
  lessons.push(
    { s: 'A2-1: Ecosystems', o: o++, t: 'Ecosystem Components', d: 'Biotic and abiotic factors', obj: ['Define ecosystem', 'Explain biotic factors', 'Understand abiotic factors'] },
    { s: 'A2-1: Ecosystems', o: o++, t: 'Energy Flow', d: 'Trophic levels', obj: ['Describe food chains webs', 'Explain energy transfer', 'Understand 10% rule'] },
    { s: 'A2-1: Ecosystems', o: o++, t: 'Productivity', d: 'Biomass production', obj: ['Explain gross primary productivity', 'Describe net primary productivity', 'Understand energy efficiency'] },
    { s: 'A2-1: Ecosystems', o: o++, t: 'Nitrogen Cycle', d: 'Recycling nitrogen', obj: ['Describe nitrogen fixation', 'Explain nitrification denitrification', 'Understand decomposition'] },
    { s: 'A2-1: Ecosystems', o: o++, t: 'Carbon Cycle', d: 'Recycling carbon', obj: ['Explain photosynthesis respiration', 'Describe decomposition combustion', 'Understand carbon stores'] },
    { s: 'A2-1: Ecosystems', o: o++, t: 'Succession', d: 'Community development', obj: ['Explain primary succession', 'Describe secondary succession', 'Understand climax community'] },
    { s: 'A2-1: Ecosystems', o: o++, t: 'Population Dynamics', d: 'Population changes', obj: ['Explain population growth curves', 'Describe carrying capacity', 'Understand limiting factors'] },
    { s: 'A2-1: Ecosystems', o: o++, t: 'Predator-Prey Relationships', d: 'Population interactions', obj: ['Describe predator-prey cycles', 'Explain population oscillations', 'Understand Lotka-Volterra model'] },
    { s: 'A2-1: Ecosystems', o: o++, t: 'Competition', d: 'Intraspecific and interspecific', obj: ['Explain resource competition', 'Describe competitive exclusion', 'Understand niche partitioning'] },
    { s: 'A2-1: Ecosystems', o: o++, t: 'Human Impact - Pollution', d: 'Environmental damage', obj: ['Explain air pollution', 'Describe water pollution', 'Understand eutrophication'] },
    { s: 'A2-1: Ecosystems', o: o++, t: 'Human Impact - Climate Change', d: 'Global warming', obj: ['Explain greenhouse effect', 'Describe climate change evidence', 'Understand impacts'] },
    { s: 'A2-1: Ecosystems', o: o++, t: 'Conservation Strategies', d: 'Protecting ecosystems', obj: ['Describe habitat conservation', 'Explain species management', 'Understand sustainable practices'] }
  );
  
  // A2-2 Unit 2: Biochemistry, Genetics and Evolutionary Trends
  
  // 2.1 Respiration (10 lessons)
  lessons.push(
    { s: 'A2-2: Respiration', o: o++, t: 'Overview of Respiration', d: 'Energy release from glucose', obj: ['Define cellular respiration', 'Explain ATP structure', 'Understand aerobic anaerobic'] },
    { s: 'A2-2: Respiration', o: o++, t: 'Glycolysis', d: 'Glucose to pyruvate', obj: ['Describe glycolysis stages', 'Explain substrate-level phosphorylation', 'Understand net ATP yield'] },
    { s: 'A2-2: Respiration', o: o++, t: 'Link Reaction', d: 'Pyruvate to acetyl CoA', obj: ['Explain pyruvate oxidation', 'Describe coenzyme A', 'Understand CO2 release'] },
    { s: 'A2-2: Respiration', o: o++, t: 'Krebs Cycle', d: 'Citric acid cycle', obj: ['Describe cycle stages', 'Explain decarboxylation', 'Understand reduced coenzymes'] },
    { s: 'A2-2: Respiration', o: o++, t: 'Oxidative Phosphorylation', d: 'Electron transport chain', obj: ['Explain electron carriers', 'Describe chemiosmosis', 'Understand ATP synthase'] },
    { s: 'A2-2: Respiration', o: o++, t: 'ATP Yield', d: 'Total energy production', obj: ['Calculate ATP from glucose', 'Explain theoretical vs actual yield', 'Understand energy efficiency'] },
    { s: 'A2-2: Respiration', o: o++, t: 'Anaerobic Respiration', d: 'Respiration without oxygen', obj: ['Explain lactate fermentation', 'Describe alcoholic fermentation', 'Understand oxygen debt'] },
    { s: 'A2-2: Respiration', o: o++, t: 'Alternative Substrates', d: 'Lipid and protein respiration', obj: ['Explain fatty acid oxidation', 'Describe protein respiration', 'Understand respiratory quotient'] },
    { s: 'A2-2: Respiration', o: o++, t: 'Respiratory Quotient', d: 'RQ values', obj: ['Calculate RQ', 'Interpret RQ values', 'Understand substrate identification'] },
    { s: 'A2-2: Respiration', o: o++, t: 'Respiration Practical', d: 'Investigating respiration', obj: ['Use respirometer', 'Measure oxygen uptake', 'Calculate respiration rate'] }
  );
  
  // 2.2 Photosynthesis (10 lessons)
  lessons.push(
    { s: 'A2-2: Photosynthesis', o: o++, t: 'Overview of Photosynthesis', d: 'Light energy to chemical energy', obj: ['Explain photosynthesis equation', 'Describe chloroplast structure', 'Understand light-dependent independent'] },
    { s: 'A2-2: Photosynthesis', o: o++, t: 'Photosynthetic Pigments', d: 'Chlorophyll and accessory pigments', obj: ['Describe chlorophyll a b', 'Explain carotenoids', 'Understand absorption spectrum'] },
    { s: 'A2-2: Photosynthesis', o: o++, t: 'Light-Dependent Reaction', d: 'Photophosphorylation', obj: ['Explain photosystem I II', 'Describe electron transport', 'Understand photolysis'] },
    { s: 'A2-2: Photosynthesis', o: o++, t: 'Chemiosmosis in Chloroplasts', d: 'ATP synthesis', obj: ['Explain proton gradient', 'Describe ATP synthase', 'Understand thylakoid space'] },
    { s: 'A2-2: Photosynthesis', o: o++, t: 'Light-Independent Reaction', d: 'Calvin cycle', obj: ['Describe CO2 fixation', 'Explain RuBisCO', 'Understand GP TP RuBP'] },
    { s: 'A2-2: Photosynthesis', o: o++, t: 'Calvin Cycle Products', d: 'Carbohydrate synthesis', obj: ['Explain TP to glucose', 'Describe RuBP regeneration', 'Understand cycle efficiency'] },
    { s: 'A2-2: Photosynthesis', o: o++, t: 'Factors Affecting Photosynthesis', d: 'Limiting factors', obj: ['Explain light intensity', 'Describe CO2 concentration', 'Understand temperature'] },
    { s: 'A2-2: Photosynthesis', o: o++, t: 'C4 Plants', d: 'Alternative CO2 fixation', obj: ['Explain C4 pathway', 'Describe Kranz anatomy', 'Understand advantages hot climates'] },
    { s: 'A2-2: Photosynthesis', o: o++, t: 'CAM Plants', d: 'Temporal CO2 fixation', obj: ['Explain CAM pathway', 'Describe stomatal control', 'Understand water conservation'] },
    { s: 'A2-2: Photosynthesis', o: o++, t: 'Photosynthesis Practical', d: 'Investigating photosynthesis', obj: ['Investigate limiting factors', 'Measure oxygen production', 'Use chromatography pigments'] }
  );
  
  // 2.3 DNA and Protein Synthesis (8 lessons)
  lessons.push(
    { s: 'A2-2: DNA Protein', o: o++, t: 'Genetic Code', d: 'Triplet code', obj: ['Explain codon structure', 'Describe degenerate code', 'Understand universal code'] },
    { s: 'A2-2: DNA Protein', o: o++, t: 'Genes and Chromosomes', d: 'DNA organization', obj: ['Explain gene structure', 'Describe introns exons', 'Understand genome'] },
    { s: 'A2-2: DNA Protein', o: o++, t: 'Transcription', d: 'DNA to mRNA', obj: ['Explain RNA polymerase', 'Describe mRNA formation', 'Understand splicing'] },
    { s: 'A2-2: DNA Protein', o: o++, t: 'Translation', d: 'mRNA to protein', obj: ['Describe ribosome structure', 'Explain tRNA function', 'Understand peptide bond formation'] },
    { s: 'A2-2: DNA Protein', o: o++, t: 'Gene Regulation', d: 'Controlling gene expression', obj: ['Explain promoter regions', 'Describe transcription factors', 'Understand lac operon'] },
    { s: 'A2-2: DNA Protein', o: o++, t: 'Mutations', d: 'Changes in DNA', obj: ['Explain point mutations', 'Describe insertion deletion', 'Understand mutation effects'] },
    { s: 'A2-2: DNA Protein', o: o++, t: 'Mutation Consequences', d: 'Impact on proteins', obj: ['Explain silent mutations', 'Describe missense nonsense', 'Understand sickle cell'] },
    { s: 'A2-2: DNA Protein', o: o++, t: 'Epigenetics', d: 'Beyond DNA sequence', obj: ['Explain DNA methylation', 'Describe histone modification', 'Understand inheritance'] }
  );
  
  // 2.4 Gene Technology (12 lessons)
  lessons.push(
    { s: 'A2-2: Gene Technology', o: o++, t: 'Recombinant DNA', d: 'Combining DNA from different sources', obj: ['Explain gene isolation', 'Describe restriction enzymes', 'Understand sticky ends'] },
    { s: 'A2-2: Gene Technology', o: o++, t: 'Vectors', d: 'Transferring genes', obj: ['Describe plasmid vectors', 'Explain viral vectors', 'Understand transformation'] },
    { s: 'A2-2: Gene Technology', o: o++, t: 'PCR', d: 'Amplifying DNA', obj: ['Explain polymerase chain reaction', 'Describe thermal cycling', 'Understand applications'] },
    { s: 'A2-2: Gene Technology', o: o++, t: 'Gel Electrophoresis', d: 'Separating DNA fragments', obj: ['Describe gel electrophoresis', 'Explain DNA fingerprinting', 'Understand forensic applications'] },
    { s: 'A2-2: Gene Technology', o: o++, t: 'DNA Sequencing', d: 'Reading genetic code', obj: ['Explain Sanger sequencing', 'Describe next-generation sequencing', 'Understand genome projects'] },
    { s: 'A2-2: Gene Technology', o: o++, t: 'Genetic Engineering Bacteria', d: 'Producing useful proteins', obj: ['Explain insulin production', 'Describe GM bacteria', 'Understand bioreactors'] },
    { s: 'A2-2: Gene Technology', o: o++, t: 'Genetic Engineering Plants', d: 'GM crops', obj: ['Describe herbicide resistance', 'Explain pest resistance', 'Understand golden rice'] },
    { s: 'A2-2: Gene Technology', o: o++, t: 'Gene Therapy', d: 'Treating genetic diseases', obj: ['Explain somatic gene therapy', 'Describe challenges', 'Understand ethical issues'] },
    { s: 'A2-2: Gene Technology', o: o++, t: 'CRISPR-Cas9', d: 'Gene editing', obj: ['Explain CRISPR mechanism', 'Describe applications', 'Understand potential'] },
    { s: 'A2-2: Gene Technology', o: o++, t: 'Stem Cells', d: 'Therapeutic applications', obj: ['Explain stem cell types', 'Describe differentiation', 'Understand medical uses'] },
    { s: 'A2-2: Gene Technology', o: o++, t: 'Ethics of Biotechnology', d: 'Social and moral issues', obj: ['Discuss GM organism concerns', 'Explain gene therapy ethics', 'Understand public perception'] },
    { s: 'A2-2: Gene Technology', o: o++, t: 'Biotechnology Applications', d: 'Current and future uses', obj: ['Describe agricultural applications', 'Explain medical applications', 'Understand industrial applications'] }
  );
  
  // 2.5 Genetics and Inheritance (10 lessons)
  lessons.push(
    { s: 'A2-2: Genetics', o: o++, t: 'Mendelian Genetics', d: 'Principles of inheritance', obj: ['Explain Mendel laws', 'Describe monohybrid crosses', 'Understand genotype phenotype'] },
    { s: 'A2-2: Genetics', o: o++, t: 'Dihybrid Crosses', d: 'Two-gene inheritance', obj: ['Perform dihybrid crosses', 'Explain 9:3:3:1 ratio', 'Understand independent assortment'] },
    { s: 'A2-2: Genetics', o: o++, t: 'Codominance', d: 'Both alleles expressed', obj: ['Explain codominance', 'Describe blood groups', 'Understand multiple alleles'] },
    { s: 'A2-2: Genetics', o: o++, t: 'Sex Linkage', d: 'X-linked inheritance', obj: ['Explain X-linked genes', 'Describe hemophilia color blindness', 'Understand sex determination'] },
    { s: 'A2-2: Genetics', o: o++, t: 'Autosomal Linkage', d: 'Genes on same chromosome', obj: ['Explain gene linkage', 'Describe recombination', 'Understand genetic mapping'] },
    { s: 'A2-2: Genetics', o: o++, t: 'Epistasis', d: 'Gene interactions', obj: ['Explain epistatic interactions', 'Describe modified ratios', 'Understand complementary genes'] },
    { s: 'A2-2: Genetics', o: o++, t: 'Chi-Squared Test', d: 'Statistical analysis', obj: ['Perform chi-squared test', 'Interpret results', 'Understand significance'] },
    { s: 'A2-2: Genetics', o: o++, t: 'Pedigree Analysis', d: 'Tracing inheritance', obj: ['Analyze pedigree charts', 'Determine inheritance patterns', 'Identify carriers'] },
    { s: 'A2-2: Genetics', o: o++, t: 'Hardy-Weinberg Principle', d: 'Population genetics', obj: ['Explain Hardy-Weinberg equilibrium', 'Calculate allele frequencies', 'Understand assumptions'] },
    { s: 'A2-2: Genetics', o: o++, t: 'Evolution Mechanisms', d: 'Changes in populations', obj: ['Explain natural selection', 'Describe genetic drift', 'Understand gene flow'] }
  );
  
  return lessons;
}