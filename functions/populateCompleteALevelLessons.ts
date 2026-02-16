import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const courses = await base44.asServiceRole.entities.Course.filter({
      qualification_type: 'alevel'
    });

    const results = [];
    
    for (const course of courses) {
      try {
        const key = `${course.category}_${course.alevel_stage}`;
        const lessons = getCompleteLessonData(key);
        
        if (!lessons || lessons.length === 0) {
          results.push({ course: course.title, status: 'no lesson data' });
          continue;
        }

        // Delete existing lessons
        const existing = await base44.entities.Lesson.filter({ course_id: course.id });
        if (existing.length > 0) {
          await Promise.all(existing.map(l => base44.asServiceRole.entities.Lesson.delete(l.id)));
        }

        // Create lessons in batches
        const batchSize = 15;
        for (let i = 0; i < lessons.length; i += batchSize) {
          const batch = lessons.slice(i, i + batchSize);
          await base44.entities.Lesson.bulkCreate(batch.map(l => ({
            course_id: course.id,
            title: l.title,
            description: l.description,
            section: l.section,
            order: l.order,
            learning_objectives: l.learning_objectives || [],
            content_type: 'richtext',
            slides: [],
            is_preview: l.order <= 3,
            duration_minutes: 50
          })));
          await new Promise(r => setTimeout(r, 300));
        }

        await base44.asServiceRole.entities.Course.update(course.id, {
          total_lessons: lessons.length
        });

        results.push({ 
          course: course.title, 
          lessons: lessons.length, 
          status: 'success' 
        });
        
        await new Promise(r => setTimeout(r, 8000));

      } catch (error) {
        results.push({ 
          course: course.title, 
          status: 'error', 
          error: error.message 
        });
      }
    }

    return Response.json({ success: true, results, total_updated: results.filter(r => r.status === 'success').length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getCompleteLessonData(key) {
  const dataMap = {
    'english_literature_as': getEnglishLiteratureAS,
    'english_literature_a2': getEnglishLiteratureA2,
    'english_language_as': getEnglishLanguageAS,
    'english_language_a2': getEnglishLanguageA2,
    'biology_as': getBiologyASComplete,
    'biology_a2': getBiologyA2Complete,
  };
  
  const fn = dataMap[key];
  return fn ? fn() : [];
}

function getEnglishLiteratureAS() {
  let o = 1;
  return [
    // Unit 1: Poetry and Prose
    { section: 'Unit 1: Poetry', order: o++, title: 'Introduction to Poetry Analysis', description: 'Understanding poetic devices and techniques', learning_objectives: ['Identify poetic devices', 'Analyze meter and rhyme', 'Interpret themes'] },
    { section: 'Unit 1: Poetry', order: o++, title: 'Metaphor and Symbolism', description: 'Extended metaphors and symbolic meaning', learning_objectives: ['Recognize metaphors', 'Analyze symbolism', 'Connect symbols to themes'] },
    { section: 'Unit 1: Poetry', order: o++, title: 'Imagery and Tone', description: 'Sensory language and poetic voice', learning_objectives: ['Identify imagery', 'Analyze tone', 'Evaluate effect'] },
    { section: 'Unit 1: Poetry', order: o++, title: 'Poetic Form and Structure', description: 'Sonnets, ballads, free verse', learning_objectives: ['Compare forms', 'Analyze structure', 'Understand purpose'] },
    { section: 'Unit 1: Poetry', order: o++, title: 'Romantic Poetry', description: 'Key romantic poets and themes', learning_objectives: ['Identify romantic features', 'Analyze emotion', 'Evaluate style'] },
    { section: 'Unit 1: Poetry', order: o++, title: 'Modern Poetry', description: 'Contemporary poetic movements', learning_objectives: ['Recognize modern techniques', 'Analyze innovation', 'Interpret meaning'] },
    { section: 'Unit 2: Prose', order: o++, title: 'Novel Analysis Techniques', description: 'Character, plot, setting', learning_objectives: ['Analyze characters', 'Trace plot development', 'Evaluate setting'] },
    { section: 'Unit 2: Prose', order: o++, title: 'Narrative Perspective', description: 'First, second, third person narration', learning_objectives: ['Identify perspective', 'Analyze reliability', 'Evaluate effect'] },
    { section: 'Unit 2: Prose', order: o++, title: 'Literary Devices in Prose', description: 'Foreshadowing, irony, symbolism', learning_objectives: ['Recognize devices', 'Analyze purpose', 'Evaluate impact'] },
    { section: 'Unit 2: Prose', order: o++, title: 'Dialogue and Characterization', description: 'Speech patterns and character development', learning_objectives: ['Analyze dialogue', 'Understand characterization', 'Evaluate techniques'] },
    { section: 'Unit 2: Prose', order: o++, title: 'Historical Fiction', description: 'Setting in historical context', learning_objectives: ['Identify historical elements', 'Analyze context', 'Evaluate authenticity'] },
    { section: 'Unit 2: Prose', order: o++, title: 'Themes and Motifs', description: 'Recurring ideas and patterns', learning_objectives: ['Identify themes', 'Trace motifs', 'Evaluate significance'] },
  ];
}

function getEnglishLiteratureA2() {
  let o = 1;
  return [
    { section: 'Unit 3: Shakespeare', order: o++, title: 'Shakespeare and Early Modern Drama', description: 'Context and theatrical conventions', learning_objectives: ['Understand Elizabethan theatre', 'Analyze conventions', 'Evaluate context'] },
    { section: 'Unit 3: Shakespeare', order: o++, title: 'Tragedy Analysis', description: 'Tragic heroes and dramatic structure', learning_objectives: ['Analyze tragic structure', 'Evaluate heroism', 'Understand catharsis'] },
    { section: 'Unit 3: Shakespeare', order: o++, title: 'Comedy and Romance', description: 'Comic devices and romantic elements', learning_objectives: ['Identify comic devices', 'Analyze romance', 'Evaluate resolution'] },
    { section: 'Unit 3: Shakespeare', order: o++, title: 'Language and Imagery in Shakespeare', description: 'Metaphor and figurative language', learning_objectives: ['Analyze imagery', 'Understand metaphors', 'Evaluate style'] },
    { section: 'Unit 4: Comparative Study', order: o++, title: 'Comparing Literary Texts', description: 'Thematic and stylistic comparison', learning_objectives: ['Identify similarities', 'Analyze differences', 'Make evaluations'] },
    { section: 'Unit 4: Comparative Study', order: o++, title: 'Literary Movements and Periods', description: 'Romanticism, Realism, Modernism', learning_objectives: ['Understand movements', 'Identify features', 'Evaluate influence'] },
    { section: 'Unit 4: Comparative Study', order: o++, title: 'Critical Perspectives', description: 'Feminist, Marxist, psychoanalytic criticism', learning_objectives: ['Understand perspectives', 'Apply criticism', 'Evaluate interpretations'] },
    { section: 'Unit 4: Comparative Study', order: o++, title: 'Independent Literary Research', description: 'Self-directed study and analysis', learning_objectives: ['Conduct research', 'Develop arguments', 'Support with evidence'] },
  ];
}

function getEnglishLanguageAS() {
  let o = 1;
  return [
    { section: 'Unit 1: Language Study', order: o++, title: 'Introduction to Linguistics', description: 'Language systems and features', learning_objectives: ['Understand language structure', 'Identify phonemes', 'Analyze morphemes'] },
    { section: 'Unit 1: Language Study', order: o++, title: 'Phonology and Phonetics', description: 'Sound systems and pronunciation', learning_objectives: ['Identify sounds', 'Understand stress', 'Analyze intonation'] },
    { section: 'Unit 1: Language Study', order: o++, title: 'Grammar and Syntax', description: 'Sentence structure and word classes', learning_objectives: ['Identify word classes', 'Analyze phrases', 'Understand clauses'] },
    { section: 'Unit 1: Language Study', order: o++, title: 'Semantics and Pragmatics', description: 'Meaning and language use', learning_objectives: ['Understand meaning', 'Analyze context', 'Evaluate implication'] },
    { section: 'Unit 2: Language Variation', order: o++, title: 'Spoken vs Written English', description: 'Differences and features', learning_objectives: ['Compare forms', 'Analyze features', 'Understand conventions'] },
    { section: 'Unit 2: Language Variation', order: o++, title: 'Regional and Social Variation', description: 'Dialects and sociolects', learning_objectives: ['Identify variation', 'Understand factors', 'Evaluate attitudes'] },
    { section: 'Unit 2: Language Variation', order: o++, title: 'Discourse Analysis', description: 'Conversation and text analysis', learning_objectives: ['Analyze conversation', 'Understand turn-taking', 'Evaluate strategies'] },
    { section: 'Unit 2: Language Variation', order: o++, title: 'Language and Gender', description: 'Gendered language patterns', learning_objectives: ['Identify patterns', 'Understand differences', 'Evaluate research'] },
  ];
}

function getEnglishLanguageA2() {
  let o = 1;
  return [
    { section: 'Unit 3: Language Investigation', order: o++, title: 'Research Methodology', description: 'Designing language investigations', learning_objectives: ['Design studies', 'Collect data', 'Analyze results'] },
    { section: 'Unit 3: Language Investigation', order: o++, title: 'Language Change Over Time', description: 'Historical linguistics and evolution', learning_objectives: ['Trace changes', 'Understand causes', 'Evaluate evidence'] },
    { section: 'Unit 3: Language Investigation', order: o++, title: 'Language Attitudes and Beliefs', description: 'Perceptions and social factors', learning_objectives: ['Understand attitudes', 'Analyze biases', 'Evaluate perspectives'] },
    { section: 'Unit 4: Language Diversity', order: o++, title: 'Multilingualism and Code-Switching', description: 'Bilingual communication patterns', learning_objectives: ['Understand code-switching', 'Analyze examples', 'Evaluate functions'] },
    { section: 'Unit 4: Language Diversity', order: o++, title: 'Language and Identity', description: 'Language as social marker', learning_objectives: ['Analyze identity', 'Understand markers', 'Evaluate impact'] },
    { section: 'Unit 4: Language Diversity', order: o++, title: 'Global Englishes', description: 'English as international language', learning_objectives: ['Understand varieties', 'Analyze features', 'Evaluate implications'] },
    { section: 'Unit 4: Language Diversity', order: o++, title: 'Language Standardization', description: 'Prescriptive vs descriptive approaches', learning_objectives: ['Compare approaches', 'Analyze standards', 'Evaluate debates'] },
  ];
}

function getBiologyASComplete() {
  let o = 1;
  const lessons = [];
  
  // Unit 1: Molecules and Cells
  const molecules = [
    { title: 'Water and Inorganic Ions', desc: 'Structure of water and role of ions', obj: ['Explain hydrogen bonding', 'Describe water properties', 'Understand ion roles'] },
    { title: 'Carbohydrates - Monosaccharides and Disaccharides', desc: 'Simple sugars and structure', obj: ['Describe glucose', 'Understand fructose', 'Explain glycosidic bonds'] },
    { title: 'Polysaccharides', desc: 'Starch, glycogen, cellulose', obj: ['Compare storage polymers', 'Describe cellulose', 'Understand functions'] },
    { title: 'Lipids - Triglycerides and Phospholipids', desc: 'Fats and membrane components', obj: ['Describe structure', 'Explain ester bonds', 'Understand membrane role'] },
    { title: 'Proteins - Structure and Function', desc: 'Amino acids and protein levels', obj: ['Identify amino acids', 'Explain structure levels', 'Understand bonding'] },
    { title: 'Nucleic Acids - DNA and RNA', desc: 'Structure of genetic material', obj: ['Describe nucleotides', 'Explain base pairing', 'Compare DNA and RNA'] },
    { title: 'DNA Replication', desc: 'Semi-conservative replication mechanism', obj: ['Explain helicase action', 'Describe DNA polymerase', 'Understand complementarity'] },
    { title: 'Enzyme Structure and Function', desc: 'Biological catalysts and mechanisms', obj: ['Explain active site', 'Describe lock and key', 'Understand induced fit'] },
    { title: 'Factors Affecting Enzyme Activity', desc: 'Temperature, pH, and concentration', obj: ['Investigate temperature', 'Analyze pH effects', 'Understand substrate concentration'] },
    { title: 'Enzyme Inhibition', desc: 'Competitive and non-competitive inhibition', obj: ['Explain inhibition types', 'Understand mechanisms', 'Apply to drugs'] },
  ];
  
  molecules.forEach(m => {
    lessons.push({
      section: 'AS1: Molecules and Cells',
      order: o++,
      title: m.title,
      description: m.desc,
      learning_objectives: m.obj
    });
  });

  // Unit 2: Organisms and Biodiversity  
  const organisms = [
    { title: 'Viruses and Prokaryotes', desc: 'Non-cellular and prokaryotic life', obj: ['Describe virus structure', 'Understand bacterial cells', 'Compare organization'] },
    { title: 'Eukaryotic Cell Structure', desc: 'Nucleus and organelles', obj: ['Describe organelles', 'Explain compartmentalization', 'Understand functions'] },
    { title: 'Membrane Structure and Function', desc: 'Fluid mosaic model', obj: ['Describe bilayer', 'Explain proteins', 'Understand transport'] },
    { title: 'Mitochondria and Energy', desc: 'Structure and ATP production', obj: ['Describe cristae', 'Understand respiration', 'Explain efficiency'] },
    { title: 'Chloroplasts and Photosynthesis', desc: 'Photosynthetic organelles', obj: ['Describe structure', 'Explain grana', 'Understand reactions'] },
    { title: 'Plant and Fungal Cells', desc: 'Unique features of plant cells', obj: ['Describe cell wall', 'Explain vacuole', 'Understand plasmodesmata'] },
    { title: 'Microscopy Techniques', desc: 'Light and electron microscopy', obj: ['Use light microscope', 'Understand EM', 'Calculate magnification'] },
    { title: 'Transport Systems - Circulation', desc: 'Blood vessels and heart structure', obj: ['Describe circulation', 'Explain valves', 'Understand pressure'] },
    { title: 'Gas Exchange in Humans', desc: 'Lungs and alveolar exchange', obj: ['Describe lungs', 'Explain diffusion', 'Understand ventilation'] },
    { title: 'Biodiversity and Classification', desc: 'Organizing living organisms', obj: ['Understand taxonomy', 'Identify kingdoms', 'Apply binomial nomenclature'] },
  ];
  
  organisms.forEach(m => {
    lessons.push({
      section: 'AS2: Organisms and Biodiversity',
      order: o++,
      title: m.title,
      description: m.desc,
      learning_objectives: m.obj
    });
  });

  return lessons;
}

function getBiologyA2Complete() {
  let o = 1;
  const lessons = [];
  
  // Unit 1: Physiology
  const physiology = [
    { title: 'Homeostasis and Regulation', desc: 'Maintaining internal environment', obj: ['Define homeostasis', 'Explain feedback', 'Understand control'] },
    { title: 'Thermoregulation', desc: 'Temperature control mechanisms', obj: ['Describe hypothalamus', 'Explain mechanisms', 'Understand adaptations'] },
    { title: 'Blood Glucose Regulation', desc: 'Pancreatic hormones', obj: ['Explain insulin/glucagon', 'Understand feedback', 'Describe diabetes'] },
    { title: 'Kidney Structure and Ultrafiltration', desc: 'Nephron and filtration', obj: ['Describe structure', 'Explain filtration', 'Understand pressure'] },
    { title: 'Selective Reabsorption and Osmoregulation', desc: 'Recovering useful substances', obj: ['Explain reabsorption', 'Describe loop of Henle', 'Understand ADH'] },
    { title: 'Immune System Basics', desc: 'Defense against pathogens', obj: ['Describe white blood cells', 'Explain phagocytosis', 'Understand responses'] },
    { title: 'Antibodies and Vaccination', desc: 'Humoral immunity', obj: ['Explain antibodies', 'Describe vaccination', 'Understand memory'] },
    { title: 'Nervous Coordination', desc: 'Neurons and synapses', obj: ['Describe structure', 'Explain action potential', 'Understand transmission'] },
    { title: 'Sensory Receptors and Eyes', desc: 'Vision and photoreceptors', obj: ['Describe eye', 'Explain rods/cones', 'Understand phototransduction'] },
    { title: 'Muscle Contraction', desc: 'Sliding filament theory', obj: ['Describe structure', 'Explain mechanism', 'Understand ATP role'] },
  ];
  
  physiology.forEach(m => {
    lessons.push({
      section: 'A2-1: Physiology',
      order: o++,
      title: m.title,
      description: m.desc,
      learning_objectives: m.obj
    });
  });

  // Unit 2: Biochemistry and Genetics
  const biochem = [
    { title: 'Respiration Overview', desc: 'Cellular energy production', obj: ['Explain ATP', 'Describe pathways', 'Understand efficiency'] },
    { title: 'Glycolysis', desc: 'Glucose to pyruvate', obj: ['Describe stages', 'Explain ATP production', 'Understand glucose activation'] },
    { title: 'Krebs Cycle and Electron Transport', desc: 'Mitochondrial respiration', obj: ['Describe cycle', 'Explain chemiosmosis', 'Understand yield'] },
    { title: 'Photosynthesis Light Reactions', desc: 'Light-dependent processes', obj: ['Explain photosystems', 'Describe electron transport', 'Understand photolysis'] },
    { title: 'Photosynthesis Calvin Cycle', desc: 'Light-independent reactions', obj: ['Describe cycle', 'Explain CO2 fixation', 'Understand RuBisCO'] },
    { title: 'Gene Expression - Transcription', desc: 'DNA to mRNA', obj: ['Explain RNA polymerase', 'Describe mRNA formation', 'Understand splicing'] },
    { title: 'Translation', desc: 'mRNA to protein', obj: ['Describe ribosome', 'Explain tRNA', 'Understand codons'] },
    { title: 'Mutations and Gene Regulation', desc: 'DNA changes and expression control', obj: ['Explain mutations', 'Describe regulation', 'Understand expression'] },
    { title: 'DNA Technology - PCR and Sequencing', desc: 'Molecular techniques', obj: ['Explain PCR', 'Describe sequencing', 'Understand applications'] },
    { title: 'Genetic Engineering', desc: 'Creating transgenic organisms', obj: ['Understand vectors', 'Explain insertion', 'Apply to medicine'] },
  ];
  
  biochem.forEach(m => {
    lessons.push({
      section: 'A2-2: Biochemistry and Genetics',
      order: o++,
      title: m.title,
      description: m.desc,
      learning_objectives: m.obj
    });
  });

  // Unit 3: Ecology
  const ecology = [
    { title: 'Ecosystems and Energy Flow', desc: 'Trophic levels and productivity', obj: ['Describe food chains', 'Explain energy transfer', 'Calculate efficiency'] },
    { title: 'Nutrient Cycling', desc: 'Carbon and nitrogen cycles', obj: ['Trace cycles', 'Explain decomposition', 'Understand sinks'] },
    { title: 'Population Dynamics', desc: 'Population growth and limiting factors', obj: ['Describe growth curves', 'Explain carrying capacity', 'Understand factors'] },
    { title: 'Succession', desc: 'Community changes over time', obj: ['Compare primary/secondary', 'Explain colonization', 'Understand climax'] },
    { title: 'Biodiversity Conservation', desc: 'Protecting species and habitats', obj: ['Explain threats', 'Describe strategies', 'Understand importance'] },
    { title: 'Human Impact on Ecosystems', desc: 'Pollution and climate change', obj: ['Describe impacts', 'Understand mechanisms', 'Evaluate solutions'] },
  ];
  
  ecology.forEach(m => {
    lessons.push({
      section: 'A2-3: Ecology',
      order: o++,
      title: m.title,
      description: m.desc,
      learning_objectives: m.obj
    });
  });

  return lessons;
}