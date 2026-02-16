import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const targetSubjects = ['geography', 'government_politics', 'religious_studies', 'digital_technology', 'software_systems_development', 'technology_design', 'english_literature', 'english_language', 'mathematics', 'further_mathematics', 'life_health_sciences', 'environmental_technology'];
    
    const courses = await base44.asServiceRole.entities.Course.filter({
      qualification_type: 'alevel',
      category: { $in: targetSubjects }
    });

    const results = [];

    for (const course of courses) {
      try {
        const lessons = getLessonData(course.category, course.alevel_stage);
        
        if (!lessons || lessons.length === 0) {
          results.push({ course: course.title, status: 'skipped - no data' });
          continue;
        }

        // Delete existing lessons
        const existing = await base44.entities.Lesson.filter({ course_id: course.id });
        if (existing.length > 0) {
          await Promise.all(existing.map(l => base44.asServiceRole.entities.Lesson.delete(l.id)));
        }

        // Create new lessons
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
        
        // Delay to avoid rate limits
        await new Promise(r => setTimeout(r, 3000));

      } catch (error) {
        results.push({ course: course.title, status: 'error', error: error.message });
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
    // GEOGRAPHY
    geography_as: getGeographyAS(),
    geography_a2: getGeographyA2(),
    
    // GOVERNMENT & POLITICS
    government_politics_as: getGovernmentPoliticsAS(),
    government_politics_a2: getGovernmentPoliticsA2(),
    
    // RELIGIOUS STUDIES
    religious_studies_as: getReligiousStudiesAS(),
    religious_studies_a2: getReligiousStudiesA2(),
    
    // DIGITAL TECHNOLOGY
    digital_technology_as: getDigitalTechnologyAS(),
    digital_technology_a2: getDigitalTechnologyA2(),
    
    // SOFTWARE SYSTEMS DEVELOPMENT
    software_systems_development_as: getSoftwareSystemsAS(),
    software_systems_development_a2: getSoftwareSystemsA2(),
    
    // TECHNOLOGY & DESIGN
    technology_design_as: getTechnologyDesignAS(),
    technology_design_a2: getTechnologyDesignA2(),
    
    // ENGLISH LITERATURE
    english_literature_as: getEnglishLiteratureAS(),
    english_literature_a2: getEnglishLiteratureA2(),
    
    // ENGLISH LANGUAGE
    english_language_as: getEnglishLanguageAS(),
    english_language_a2: getEnglishLanguageA2(),
    
    // MATHEMATICS
    mathematics_as: getMathematicsAS(),
    mathematics_a2: getMathematicsA2(),
    
    // FURTHER MATHEMATICS
    further_mathematics_as: getFurtherMathematicsAS(),
    further_mathematics_a2: getFurtherMathematicsA2(),
    
    // LIFE & HEALTH SCIENCES
    life_health_sciences_as: getLifeHealthSciencesAS(),
    life_health_sciences_a2: getLifeHealthSciencesA2(),
    
    // ENVIRONMENTAL TECHNOLOGY
    environmental_technology_as: getEnvironmentalTechnologyAS(),
    environmental_technology_a2: getEnvironmentalTechnologyA2()
  };
  
  return lessonMap[key] || [];
}

// GEOGRAPHY LESSONS
function getGeographyAS() {
  let o = 1;
  return [
    // AS1: Physical Geography (River Environments)
    { s: 'AS1: Rivers', o: o++, t: 'Drainage Basin Systems', d: 'Inputs outputs stores transfers in drainage basins', obj: ['Describe drainage basin as open system', 'Explain water cycle components', 'Understand water balance'] },
    { s: 'AS1: Rivers', o: o++, t: 'River Channel Processes', d: 'Erosion transportation deposition', obj: ['Explain hydraulic action abrasion attrition', 'Describe traction saltation suspension', 'Understand factors affecting processes'] },
    { s: 'AS1: Rivers', o: o++, t: 'River Channel Features', d: 'Waterfalls gorges meanders oxbow lakes', obj: ['Explain waterfall formation', 'Describe meander development', 'Understand oxbow lake creation'] },
    { s: 'AS1: Rivers', o: o++, t: 'Floodplains and Levees', d: 'Depositional landforms', obj: ['Explain floodplain formation', 'Describe levee development', 'Understand flood processes'] },
    { s: 'AS1: Rivers', o: o++, t: 'River Flooding', d: 'Causes impacts management', obj: ['Identify physical human causes', 'Assess social economic environmental impacts', 'Evaluate flood management strategies'] },
    { s: 'AS1: Rivers', o: o++, t: 'River Management Strategies', d: 'Hard and soft engineering', obj: ['Compare hard engineering approaches', 'Evaluate soft engineering methods', 'Understand sustainable management'] },
    
    // AS1: Coastal Environments
    { s: 'AS1: Coasts', o: o++, t: 'Coastal Systems', d: 'Inputs outputs energy transfers', obj: ['Describe coastal system components', 'Explain wave formation energy', 'Understand sediment cells'] },
    { s: 'AS1: Coasts', o: o++, t: 'Coastal Erosion Processes', d: 'Hydraulic action abrasion attrition', obj: ['Explain marine erosion processes', 'Describe weathering mass movement', 'Understand factors affecting erosion'] },
    { s: 'AS1: Coasts', o: o++, t: 'Erosional Landforms', d: 'Cliffs caves arches stacks', obj: ['Explain headland erosion', 'Describe cave arch stack formation', 'Understand wave-cut platforms'] },
    { s: 'AS1: Coasts', o: o++, t: 'Depositional Landforms', d: 'Beaches spits bars tombolos', obj: ['Explain beach formation', 'Describe spit development', 'Understand bar and tombolo creation'] },
    { s: 'AS1: Coasts', o: o++, t: 'Coastal Management', d: 'Protection strategies', obj: ['Compare hard engineering options', 'Evaluate soft engineering approaches', 'Assess managed retreat'] },
    
    // AS2: Human Geography (Population)
    { s: 'AS2: Population', o: o++, t: 'Population Distribution', d: 'Global patterns factors', obj: ['Describe world population distribution', 'Explain physical human factors', 'Understand population density patterns'] },
    { s: 'AS2: Population', o: o++, t: 'Population Change', d: 'Birth death migration rates', obj: ['Explain demographic transition model', 'Analyze birth and death rates', 'Understand natural increase'] },
    { s: 'AS2: Population', o: o++, t: 'Population Structure', d: 'Age-sex pyramids', obj: ['Interpret population pyramids', 'Compare MEDCs and LEDCs', 'Understand dependency ratios'] },
    { s: 'AS2: Population', o: o++, t: 'Migration Patterns', d: 'Internal and international', obj: ['Explain push and pull factors', 'Describe migration types', 'Assess migration impacts'] },
    { s: 'AS2: Population', o: o++, t: 'Population Policies', d: 'Pro-natalist anti-natalist', obj: ['Evaluate China one-child policy', 'Assess pro-natalist policies', 'Understand policy effectiveness'] },
    
    // AS2: Settlement
    { s: 'AS2: Settlement', o: o++, t: 'Settlement Patterns', d: 'Rural and urban', obj: ['Describe settlement patterns', 'Explain site and situation', 'Understand settlement hierarchy'] },
    { s: 'AS2: Settlement', o: o++, t: 'Urbanisation', d: 'Growth of cities', obj: ['Explain urbanisation processes', 'Compare MEDCs LEDCs urbanisation', 'Assess urban growth impacts'] },
    { s: 'AS2: Settlement', o: o++, t: 'Urban Land Use', d: 'Models and patterns', obj: ['Describe Burgess Hoyt models', 'Explain CBD characteristics', 'Understand urban zones'] },
    { s: 'AS2: Settlement', o: o++, t: 'Urban Issues', d: 'Challenges in cities', obj: ['Identify housing problems', 'Assess transport congestion', 'Evaluate environmental issues'] },
    { s: 'AS2: Settlement', o: o++, t: 'Urban Solutions', d: 'Planning and management', obj: ['Evaluate urban regeneration', 'Assess sustainable cities', 'Understand smart growth'] }
  ];
}

function getGeographyA2() {
  let o = 1;
  return [
    // A2-1: Tropical Ecosystems
    { s: 'A2-1: Ecosystems', o: o++, t: 'Ecosystem Concepts', d: 'Biomes food chains energy flow', obj: ['Define ecosystem components', 'Explain food chains webs', 'Understand energy flow nutrients'] },
    { s: 'A2-1: Ecosystems', o: o++, t: 'Tropical Rainforest Climate', d: 'Temperature rainfall characteristics', obj: ['Describe equatorial climate', 'Explain high rainfall temperatures', 'Understand convectional rainfall'] },
    { s: 'A2-1: Ecosystems', o: o++, t: 'Rainforest Structure', d: 'Layers biodiversity adaptations', obj: ['Describe forest layers', 'Explain high biodiversity', 'Understand plant animal adaptations'] },
    { s: 'A2-1: Ecosystems', o: o++, t: 'Rainforest Nutrient Cycle', d: 'Rapid cycling poor soils', obj: ['Explain nutrient cycling', 'Understand biomass store', 'Describe leaching processes'] },
    { s: 'A2-1: Ecosystems', o: o++, t: 'Deforestation Causes', d: 'Logging agriculture mining', obj: ['Identify deforestation causes', 'Explain commercial logging', 'Assess agricultural clearance'] },
    { s: 'A2-1: Ecosystems', o: o++, t: 'Deforestation Impacts', d: 'Environmental social economic', obj: ['Assess biodiversity loss', 'Evaluate climate change contribution', 'Understand indigenous peoples impact'] },
    { s: 'A2-1: Ecosystems', o: o++, t: 'Sustainable Management', d: 'Conservation strategies', obj: ['Evaluate selective logging', 'Assess ecotourism', 'Understand international agreements'] },
    
    // A2-1: Plate Tectonics
    { s: 'A2-1: Tectonics', o: o++, t: 'Earth Structure', d: 'Crust mantle core', obj: ['Describe Earth layers', 'Explain continental oceanic crust', 'Understand lithosphere asthenosphere'] },
    { s: 'A2-1: Tectonics', o: o++, t: 'Plate Tectonic Theory', d: 'Continental drift seafloor spreading', obj: ['Explain Wegener theory', 'Describe evidence for plate movement', 'Understand convection currents'] },
    { s: 'A2-1: Tectonics', o: o++, t: 'Plate Boundaries', d: 'Constructive destructive conservative', obj: ['Describe divergent boundaries', 'Explain convergent boundaries', 'Understand transform boundaries'] },
    { s: 'A2-1: Tectonics', o: o++, t: 'Volcanic Activity', d: 'Types hazards impacts', obj: ['Explain volcano formation', 'Describe eruption types', 'Assess volcanic hazards'] },
    { s: 'A2-1: Tectonics', o: o++, t: 'Earthquake Activity', d: 'Causes measurement impacts', obj: ['Explain earthquake causes', 'Describe Richter scale', 'Assess earthquake impacts'] },
    { s: 'A2-1: Tectonics', o: o++, t: 'Tectonic Hazard Management', d: 'Prediction protection preparedness', obj: ['Evaluate prediction methods', 'Assess protection strategies', 'Understand preparedness planning'] },
    
    // A2-2: Global Issues
    { s: 'A2-2: Development', o: o++, t: 'Measuring Development', d: 'Indicators of development', obj: ['Explain GDP GNP per capita', 'Describe HDI components', 'Understand development indicators'] },
    { s: 'A2-2: Development', o: o++, t: 'Development Gap', d: 'Disparities between countries', obj: ['Identify development patterns', 'Explain causes of inequality', 'Assess North-South divide'] },
    { s: 'A2-2: Development', o: o++, t: 'Aid and Development', d: 'Types effectiveness', obj: ['Compare bilateral multilateral aid', 'Evaluate short-term emergency aid', 'Assess long-term development projects'] },
    { s: 'A2-2: Development', o: o++, t: 'Trade and Development', d: 'Fair trade globalisation', obj: ['Explain trade patterns', 'Assess fair trade impact', 'Understand globalisation effects'] },
    
    // A2-2: Climate Change
    { s: 'A2-2: Climate', o: o++, t: 'Evidence for Climate Change', d: 'Temperature ice core data', obj: ['Analyze temperature records', 'Explain ice core evidence', 'Understand sea level rise'] },
    { s: 'A2-2: Climate', o: o++, t: 'Causes of Climate Change', d: 'Natural and human factors', obj: ['Explain greenhouse effect', 'Describe natural climate variation', 'Assess human activities impact'] },
    { s: 'A2-2: Climate', o: o++, t: 'Climate Change Impacts', d: 'Environmental social economic', obj: ['Assess sea level rise effects', 'Evaluate extreme weather events', 'Understand impacts on ecosystems'] },
    { s: 'A2-2: Climate', o: o++, t: 'Climate Change Management', d: 'Mitigation and adaptation', obj: ['Evaluate mitigation strategies', 'Assess adaptation measures', 'Understand international agreements'] }
  ];
}

// GOVERNMENT & POLITICS LESSONS
function getGovernmentPoliticsAS() {
  let o = 1;
  return [
    { s: 'AS1: Democracy', o: o++, t: 'Nature of Democracy', d: 'Direct and representative democracy', obj: ['Define democracy concepts', 'Compare direct and representative', 'Understand legitimacy consent'] },
    { s: 'AS1: Democracy', o: o++, t: 'Democratic Participation', d: 'Voting referendums pressure groups', obj: ['Explain forms of participation', 'Assess referendums effectiveness', 'Understand pressure group role'] },
    { s: 'AS1: Democracy', o: o++, t: 'Political Parties UK', d: 'Functions ideology policies', obj: ['Describe party functions', 'Compare Conservative Labour policies', 'Understand party funding'] },
    { s: 'AS1: Democracy', o: o++, t: 'Electoral Systems UK', d: 'First-past-the-post alternatives', obj: ['Explain FPTP system', 'Compare proportional representation', 'Assess electoral reform debate'] },
    { s: 'AS1: Democracy', o: o++, t: 'Voting Behaviour', d: 'Factors influencing votes', obj: ['Analyze class voting', 'Assess media influence', 'Understand partisan dealignment'] },
    
    { s: 'AS1: Parliament', o: o++, t: 'House of Commons', d: 'Composition powers functions', obj: ['Describe Commons composition', 'Explain legislative function', 'Assess government scrutiny'] },
    { s: 'AS1: Parliament', o: o++, t: 'House of Lords', d: 'Role and reform', obj: ['Explain Lords composition', 'Assess Lords powers', 'Evaluate reform proposals'] },
    { s: 'AS1: Parliament', o: o++, t: 'Legislative Process', d: 'How laws are made', obj: ['Describe bill stages', 'Explain Commons Lords roles', 'Understand royal assent'] },
    { s: 'AS1: Parliament', o: o++, t: 'Parliamentary Sovereignty', d: 'Supreme legal authority', obj: ['Define parliamentary sovereignty', 'Assess limitations on sovereignty', 'Understand EU membership impact'] },
    
    { s: 'AS2: Executive', o: o++, t: 'Prime Minister Powers', d: 'Role and authority', obj: ['Describe PM powers', 'Explain cabinet government', 'Assess presidential tendencies'] },
    { s: 'AS2: Executive', o: o++, t: 'Cabinet System', d: 'Collective responsibility', obj: ['Explain cabinet functions', 'Understand collective responsibility', 'Assess cabinet committees'] },
    { s: 'AS2: Executive', o: o++, t: 'Civil Service', d: 'Role and neutrality', obj: ['Describe civil service functions', 'Explain political neutrality', 'Assess accountability'] },
    
    { s: 'AS2: Judiciary', o: o++, t: 'UK Courts System', d: 'Structure and hierarchy', obj: ['Describe court hierarchy', 'Explain Supreme Court role', 'Understand judicial independence'] },
    { s: 'AS2: Judiciary', o: o++, t: 'Judicial Review', d: 'Courts checking executive', obj: ['Explain judicial review power', 'Assess judicial activism', 'Understand separation of powers'] },
    { s: 'AS2: Judiciary', o: o++, t: 'Human Rights', d: 'Protection and limitations', obj: ['Explain Human Rights Act', 'Assess rights protection', 'Understand rights limitations'] }
  ];
}

function getGovernmentPoliticsA2() {
  let o = 1;
  return [
    { s: 'A2-1: US Politics', o: o++, t: 'US Constitution', d: 'Principles and features', obj: ['Explain separation of powers', 'Describe checks and balances', 'Understand federalism'] },
    { s: 'A2-1: US Politics', o: o++, t: 'US Congress', d: 'Senate and House powers', obj: ['Compare Senate and House', 'Explain legislative process', 'Assess congressional power'] },
    { s: 'A2-1: US Politics', o: o++, t: 'US Presidency', d: 'Powers and limitations', obj: ['Describe presidential powers', 'Explain executive orders', 'Assess presidential limitations'] },
    { s: 'A2-1: US Politics', o: o++, t: 'US Supreme Court', d: 'Judicial review power', obj: ['Explain Supreme Court role', 'Assess judicial review impact', 'Understand appointment process'] },
    { s: 'A2-1: US Politics', o: o++, t: 'US Elections', d: 'Presidential congressional elections', obj: ['Explain Electoral College', 'Describe primary system', 'Assess election campaign finance'] },
    
    { s: 'A2-2: Ideologies', o: o++, t: 'Liberalism', d: 'Classical and modern liberal thought', obj: ['Explain liberal values', 'Compare classical modern liberalism', 'Assess liberal democracy'] },
    { s: 'A2-2: Ideologies', o: o++, t: 'Conservatism', d: 'Traditional one-nation New Right', obj: ['Explain conservative values', 'Compare conservative strands', 'Assess Thatcherism'] },
    { s: 'A2-2: Ideologies', o: o++, t: 'Socialism', d: 'Revolutionary democratic socialism', obj: ['Explain socialist values', 'Compare Marxism social democracy', 'Assess socialism relevance'] },
    { s: 'A2-2: Ideologies', o: o++, t: 'Nationalism', d: 'Forms and expressions', obj: ['Define nationalism', 'Compare civic ethnic nationalism', 'Assess nationalism impact'] },
    
    { s: 'A2-2: Comparative', o: o++, t: 'UK US Comparison Legislature', d: 'Parliament vs Congress', obj: ['Compare legislative powers', 'Assess representation effectiveness', 'Understand bicameral differences'] },
    { s: 'A2-2: Comparative', o: o++, t: 'UK US Comparison Executive', d: 'PM vs President', obj: ['Compare executive powers', 'Assess accountability mechanisms', 'Understand governmental systems'] },
    { s: 'A2-2: Comparative', o: o++, t: 'UK US Comparison Judiciary', d: 'Supreme Courts comparison', obj: ['Compare judicial powers', 'Assess judicial review', 'Understand rights protection'] }
  ];
}

// RELIGIOUS STUDIES LESSONS
function getReligiousStudiesAS() {
  let o = 1;
  return [
    { s: 'AS1: Philosophy', o: o++, t: 'Ancient Greek Influences', d: 'Plato and Aristotle', obj: ['Explain Plato theory of Forms', 'Describe Aristotle four causes', 'Understand Prime Mover'] },
    { s: 'AS1: Philosophy', o: o++, t: 'Arguments for God Ontological', d: 'Anselm and Descartes', obj: ['Explain Anselm ontological argument', 'Describe Descartes version', 'Assess Gaunilo criticism'] },
    { s: 'AS1: Philosophy', o: o++, t: 'Arguments for God Cosmological', d: 'Aquinas and Leibniz', obj: ['Explain Aquinas Five Ways', 'Describe Leibniz principle sufficient reason', 'Assess Hume Russell criticisms'] },
    { s: 'AS1: Philosophy', o: o++, t: 'Arguments for God Teleological', d: 'Design arguments', obj: ['Explain Paley watchmaker analogy', 'Describe Tennant anthropic principle', 'Assess Hume Darwin criticisms'] },
    { s: 'AS1: Philosophy', o: o++, t: 'Problem of Evil', d: 'Theodicies and responses', obj: ['Explain logical problem of evil', 'Describe Augustinian theodicy', 'Assess Irenaean theodicy'] },
    { s: 'AS1: Philosophy', o: o++, t: 'Religious Experience', d: 'Types and verification', obj: ['Describe mystical experiences', 'Explain conversion experiences', 'Assess William James criteria'] },
    { s: 'AS1: Philosophy', o: o++, t: 'Religious Language', d: 'Verification and falsification', obj: ['Explain verification principle Ayer', 'Describe falsification Flew', 'Understand analogy and symbol'] },
    
    { s: 'AS2: Ethics', o: o++, t: 'Utilitarianism', d: 'Bentham and Mill', obj: ['Explain Bentham hedonic calculus', 'Describe Mill higher lower pleasures', 'Assess act rule utilitarianism'] },
    { s: 'AS2: Ethics', o: o++, t: 'Kantian Ethics', d: 'Deontological approach', obj: ['Explain categorical imperative', 'Describe universalisability', 'Assess duty-based ethics'] },
    { s: 'AS2: Ethics', o: o++, t: 'Natural Law', d: 'Aquinas theory', obj: ['Explain primary precepts', 'Describe secondary precepts', 'Assess double effect principle'] },
    { s: 'AS2: Ethics', o: o++, t: 'Situation Ethics', d: 'Fletcher teleological approach', obj: ['Explain agape love principle', 'Describe six propositions', 'Assess relativism criticism'] },
    { s: 'AS2: Ethics', o: o++, t: 'Applied Ethics Abortion', d: 'Ethical perspectives', obj: ['Apply utilitarian view', 'Apply natural law view', 'Assess situation ethics view'] },
    { s: 'AS2: Ethics', o: o++, t: 'Applied Ethics Euthanasia', d: 'Ethical perspectives', obj: ['Distinguish voluntary involuntary', 'Apply ethical theories', 'Assess sanctity quality life'] }
  ];
}

function getReligiousStudiesA2() {
  let o = 1;
  return [
    { s: 'A2-1: Christianity', o: o++, t: 'Person of Jesus Christ', d: 'Christological debates', obj: ['Explain Jesus as Son of God', 'Describe incarnation atonement', 'Assess Chalcedonian definition'] },
    { s: 'A2-1: Christianity', o: o++, t: 'Christian Moral Principles', d: 'Biblical ethics', obj: ['Explain Old Testament law', 'Describe New Testament ethics', 'Understand Sermon on Mount'] },
    { s: 'A2-1: Christianity', o: o++, t: 'Christian Moral Action', d: 'Bonhoeffer and King', obj: ['Explain Bonhoeffer costly grace', 'Describe King civil disobedience', 'Assess Christian activism'] },
    { s: 'A2-1: Christianity', o: o++, t: 'Death and Afterlife', d: 'Christian beliefs', obj: ['Explain resurrection body', 'Describe heaven hell purgatory', 'Assess immortality soul'] },
    { s: 'A2-1: Christianity', o: o++, t: 'Knowledge of God', d: 'Natural and revealed', obj: ['Explain natural theology', 'Describe revealed theology', 'Assess faith reason relationship'] },
    { s: 'A2-1: Christianity', o: o++, t: 'Nature of God', d: 'Divine attributes', obj: ['Explain omnipotence omniscience', 'Describe eternity immutability', 'Assess goodness justice'] },
    
    { s: 'A2-2: Dialogue', o: o++, t: 'Pluralism', d: 'Religious diversity', obj: ['Explain exclusivism', 'Describe inclusivism', 'Assess pluralism Hick'] },
    { s: 'A2-2: Dialogue', o: o++, t: 'Theology and Science', d: 'Relationship models', obj: ['Explain conflict thesis', 'Describe independence view', 'Assess dialogue integration'] },
    { s: 'A2-2: Dialogue', o: o++, t: 'Gender and Theology', d: 'Feminist perspectives', obj: ['Explain patriarchy in religion', 'Describe feminist theology', 'Assess gender equality'] },
    { s: 'A2-2: Dialogue', o: o++, t: 'Secularisation', d: 'Religion in modern society', obj: ['Explain secularisation thesis', 'Assess decline of religion', 'Understand religious pluralism'] }
  ];
}

// DIGITAL TECHNOLOGY LESSONS
function getDigitalTechnologyAS() {
  let o = 1;
  return [
    { s: 'AS1: Hardware', o: o++, t: 'Computer Systems', d: 'Von Neumann architecture', obj: ['Explain CPU components', 'Describe fetch-execute cycle', 'Understand stored program concept'] },
    { s: 'AS1: Hardware', o: o++, t: 'Memory Types', d: 'RAM ROM cache', obj: ['Compare primary secondary storage', 'Explain volatile non-volatile', 'Understand memory hierarchy'] },
    { s: 'AS1: Hardware', o: o++, t: 'Input Output Devices', d: 'Peripherals and interfaces', obj: ['Describe input devices', 'Explain output devices', 'Understand device drivers'] },
    { s: 'AS1: Hardware', o: o++, t: 'Storage Devices', d: 'Magnetic optical solid-state', obj: ['Compare HDD SSD', 'Explain optical storage', 'Assess storage capacity speed'] },
    
    { s: 'AS1: Software', o: o++, t: 'Operating Systems', d: 'Functions and types', obj: ['Explain OS functions', 'Describe process management', 'Understand file management'] },
    { s: 'AS1: Software', o: o++, t: 'Application Software', d: 'Types and uses', obj: ['Describe productivity software', 'Explain specialist applications', 'Understand software licensing'] },
    { s: 'AS1: Software', o: o++, t: 'Programming Languages', d: 'High-level low-level', obj: ['Compare compiled interpreted', 'Explain assembler machine code', 'Understand language generations'] },
    
    { s: 'AS2: Data', o: o++, t: 'Data Representation', d: 'Binary denary hexadecimal', obj: ['Convert between number systems', 'Explain binary arithmetic', 'Understand two complement'] },
    { s: 'AS2: Data', o: o++, t: 'Character Encoding', d: 'ASCII Unicode', obj: ['Explain ASCII codes', 'Describe Unicode UTF-8', 'Understand character sets'] },
    { s: 'AS2: Data', o: o++, t: 'Image Representation', d: 'Bitmap vector graphics', obj: ['Explain pixel resolution', 'Describe colour depth', 'Compare bitmap vector'] },
    { s: 'AS2: Data', o: o++, t: 'Sound Representation', d: 'Digital audio', obj: ['Explain sampling', 'Describe sample rate bit depth', 'Understand audio file sizes'] },
    { s: 'AS2: Data', o: o++, t: 'Data Compression', d: 'Lossy and lossless', obj: ['Explain compression need', 'Compare lossy lossless', 'Understand compression algorithms'] },
    
    { s: 'AS2: Networks', o: o++, t: 'Network Types', d: 'LAN WAN PAN', obj: ['Describe local area networks', 'Explain wide area networks', 'Understand network topologies'] },
    { s: 'AS2: Networks', o: o++, t: 'Network Protocols', d: 'TCP/IP HTTP FTP', obj: ['Explain protocol layers', 'Describe TCP IP functions', 'Understand application protocols'] },
    { s: 'AS2: Networks', o: o++, t: 'Network Security', d: 'Threats and protection', obj: ['Identify security threats', 'Explain encryption methods', 'Understand firewalls'] }
  ];
}

function getDigitalTechnologyA2() {
  let o = 1;
  return [
    { s: 'A2-1: Databases', o: o++, t: 'Database Concepts', d: 'Relational databases', obj: ['Explain database structure', 'Describe tables fields records', 'Understand primary foreign keys'] },
    { s: 'A2-1: Databases', o: o++, t: 'Database Normalisation', d: 'Normal forms', obj: ['Explain 1NF 2NF 3NF', 'Describe normalisation process', 'Understand data redundancy'] },
    { s: 'A2-1: Databases', o: o++, t: 'SQL Queries', d: 'Data manipulation', obj: ['Write SELECT statements', 'Use WHERE clauses', 'Understand JOIN operations'] },
    
    { s: 'A2-1: Programming', o: o++, t: 'Programming Paradigms', d: 'Procedural OOP functional', obj: ['Explain procedural programming', 'Describe object-oriented concepts', 'Understand functional programming'] },
    { s: 'A2-1: Programming', o: o++, t: 'Data Structures', d: 'Arrays lists stacks queues', obj: ['Describe array structures', 'Explain linked lists', 'Understand stacks queues'] },
    { s: 'A2-1: Programming', o: o++, t: 'Algorithms', d: 'Searching and sorting', obj: ['Explain linear binary search', 'Describe bubble merge sort', 'Assess algorithm efficiency'] },
    
    { s: 'A2-2: Web Development', o: o++, t: 'HTML Fundamentals', d: 'Structure and semantics', obj: ['Create HTML documents', 'Use semantic elements', 'Understand document structure'] },
    { s: 'A2-2: Web Development', o: o++, t: 'CSS Styling', d: 'Presentation and layout', obj: ['Apply CSS styles', 'Use selectors properties', 'Understand box model'] },
    { s: 'A2-2: Web Development', o: o++, t: 'JavaScript Basics', d: 'Client-side scripting', obj: ['Write JavaScript code', 'Manipulate DOM', 'Understand events'] },
    
    { s: 'A2-2: Systems', o: o++, t: 'Systems Analysis', d: 'Investigation and analysis', obj: ['Conduct fact finding', 'Analyze current systems', 'Identify requirements'] },
    { s: 'A2-2: Systems', o: o++, t: 'Systems Design', d: 'Design solutions', obj: ['Create system diagrams', 'Design interfaces', 'Plan data structures'] },
    { s: 'A2-2: Systems', o: o++, t: 'Testing and Evaluation', d: 'Quality assurance', obj: ['Plan test strategies', 'Execute test plans', 'Evaluate solutions'] }
  ];
}

// SOFTWARE SYSTEMS DEVELOPMENT LESSONS
function getSoftwareSystemsAS() {
  let o = 1;
  return [
    { s: 'AS1: Programming', o: o++, t: 'Programming Fundamentals', d: 'Variables data types', obj: ['Declare variables', 'Use data types', 'Understand constants'] },
    { s: 'AS1: Programming', o: o++, t: 'Selection Statements', d: 'IF THEN ELSE CASE', obj: ['Implement IF statements', 'Use nested selection', 'Apply CASE statements'] },
    { s: 'AS1: Programming', o: o++, t: 'Iteration Structures', d: 'FOR WHILE REPEAT loops', obj: ['Implement FOR loops', 'Use WHILE loops', 'Understand loop control'] },
    { s: 'AS1: Programming', o: o++, t: 'Procedures and Functions', d: 'Modular programming', obj: ['Create procedures', 'Write functions', 'Understand parameters'] },
    { s: 'AS1: Programming', o: o++, t: 'Arrays', d: 'One and two dimensional', obj: ['Declare arrays', 'Access array elements', 'Understand array processing'] },
    { s: 'AS1: Programming', o: o++, t: 'String Manipulation', d: 'String operations', obj: ['Perform string operations', 'Use string functions', 'Understand string processing'] },
    { s: 'AS1: Programming', o: o++, t: 'File Handling', d: 'Reading and writing files', obj: ['Open close files', 'Read file data', 'Write file data'] },
    
    { s: 'AS2: Development', o: o++, t: 'Algorithm Design', d: 'Pseudocode and flowcharts', obj: ['Write pseudocode', 'Create flowcharts', 'Design algorithms'] },
    { s: 'AS2: Development', o: o++, t: 'Testing Strategies', d: 'Test planning and execution', obj: ['Plan test data', 'Execute tests', 'Record test results'] },
    { s: 'AS2: Development', o: o++, t: 'Debugging Techniques', d: 'Error identification and correction', obj: ['Identify syntax errors', 'Fix logic errors', 'Use debugging tools'] },
    { s: 'AS2: Development', o: o++, t: 'Documentation', d: 'Code and user documentation', obj: ['Write code comments', 'Create user guides', 'Produce technical documentation'] }
  ];
}

function getSoftwareSystemsA2() {
  let o = 1;
  return [
    { s: 'A2-1: Advanced Programming', o: o++, t: 'Object-Oriented Programming', d: 'Classes and objects', obj: ['Define classes', 'Create objects', 'Understand encapsulation'] },
    { s: 'A2-1: Advanced Programming', o: o++, t: 'Inheritance', d: 'Class hierarchies', obj: ['Implement inheritance', 'Use polymorphism', 'Understand method overriding'] },
    { s: 'A2-1: Advanced Programming', o: o++, t: 'Data Structures', d: 'Stacks queues linked lists', obj: ['Implement stack operations', 'Create queue structures', 'Build linked lists'] },
    { s: 'A2-1: Advanced Programming', o: o++, t: 'Recursion', d: 'Recursive algorithms', obj: ['Write recursive functions', 'Understand base cases', 'Assess recursion efficiency'] },
    
    { s: 'A2-2: Database Programming', o: o++, t: 'SQL Advanced Queries', d: 'Complex database operations', obj: ['Write JOIN queries', 'Use aggregate functions', 'Implement subqueries'] },
    { s: 'A2-2: Database Programming', o: o++, t: 'Database Integration', d: 'Connecting programs to databases', obj: ['Connect to databases', 'Execute SQL from code', 'Handle database results'] },
    
    { s: 'A2-2: Software Engineering', o: o++, t: 'Software Development Lifecycle', d: 'SDLC methodologies', obj: ['Explain waterfall model', 'Describe agile methods', 'Understand iterative development'] },
    { s: 'A2-2: Software Engineering', o: o++, t: 'Requirements Analysis', d: 'Gathering and documenting requirements', obj: ['Elicit requirements', 'Document functional requirements', 'Specify non-functional requirements'] },
    { s: 'A2-2: Software Engineering', o: o++, t: 'Project Management', d: 'Planning and control', obj: ['Create project plans', 'Manage resources', 'Track progress'] }
  ];
}

// TECHNOLOGY & DESIGN LESSONS
function getTechnologyDesignAS() {
  let o = 1;
  return [
    { s: 'AS1: Design Process', o: o++, t: 'Design Brief and Analysis', d: 'Problem identification', obj: ['Write design briefs', 'Analyze design problems', 'Identify user needs'] },
    { s: 'AS1: Design Process', o: o++, t: 'Research and Investigation', d: 'Gathering information', obj: ['Conduct market research', 'Analyze existing products', 'Identify design opportunities'] },
    { s: 'AS1: Design Process', o: o++, t: 'Design Specification', d: 'Defining criteria', obj: ['Write design specifications', 'Define success criteria', 'Prioritize requirements'] },
    { s: 'AS1: Design Process', o: o++, t: 'Generating Ideas', d: 'Creative thinking techniques', obj: ['Use brainstorming', 'Apply lateral thinking', 'Create design concepts'] },
    { s: 'AS1: Design Process', o: o++, t: 'Design Development', d: 'Refining solutions', obj: ['Develop design ideas', 'Model solutions', 'Evaluate design options'] },
    
    { s: 'AS2: Materials', o: o++, t: 'Material Properties', d: 'Physical and mechanical', obj: ['Explain material properties', 'Test materials', 'Select appropriate materials'] },
    { s: 'AS2: Materials', o: o++, t: 'Timber Materials', d: 'Hardwoods softwoods manufactured boards', obj: ['Classify timber types', 'Understand wood properties', 'Apply timber in design'] },
    { s: 'AS2: Materials', o: o++, t: 'Metals and Alloys', d: 'Ferrous non-ferrous metals', obj: ['Classify metal types', 'Explain metal properties', 'Apply metals in design'] },
    { s: 'AS2: Materials', o: o++, t: 'Polymers', d: 'Thermoplastics thermosetting plastics', obj: ['Classify polymer types', 'Explain polymer properties', 'Apply polymers in design'] },
    
    { s: 'AS2: Manufacturing', o: o++, t: 'Manufacturing Processes', d: 'Joining shaping finishing', obj: ['Explain joining techniques', 'Describe shaping methods', 'Apply finishing processes'] },
    { s: 'AS2: Manufacturing', o: o++, t: 'Quality Control', d: 'Testing and inspection', obj: ['Implement quality checks', 'Use measuring tools', 'Ensure product quality'] }
  ];
}

function getTechnologyDesignA2() {
  let o = 1;
  return [
    { s: 'A2-1: Product Design', o: o++, t: 'Ergonomics and Anthropometrics', d: 'Human factors in design', obj: ['Apply ergonomic principles', 'Use anthropometric data', 'Design for users'] },
    { s: 'A2-1: Product Design', o: o++, t: 'Sustainability', d: 'Environmental considerations', obj: ['Apply sustainable design', 'Consider product lifecycle', 'Reduce environmental impact'] },
    { s: 'A2-1: Product Design', o: o++, t: 'Systems and Control', d: 'Mechanical and electronic systems', obj: ['Design mechanical systems', 'Integrate electronic control', 'Apply systems thinking'] },
    
    { s: 'A2-2: Manufacturing', o: o++, t: 'CAD CAM', d: 'Computer-aided design and manufacture', obj: ['Use CAD software', 'Apply CAM processes', 'Understand CNC machining'] },
    { s: 'A2-2: Manufacturing', o: o++, t: 'Batch and Mass Production', d: 'Manufacturing scales', obj: ['Explain production methods', 'Compare batch mass production', 'Understand automation'] },
    { s: 'A2-2: Manufacturing', o: o++, t: 'Quality Assurance', d: 'Standards and testing', obj: ['Apply quality standards', 'Implement testing procedures', 'Ensure consistency'] },
    
    { s: 'A2-2: Project', o: o++, t: 'Project Development', d: 'Major design project', obj: ['Plan project work', 'Develop design solution', 'Manufacture prototype'] },
    { s: 'A2-2: Project', o: o++, t: 'Evaluation', d: 'Testing and assessment', obj: ['Test final product', 'Evaluate against specification', 'Suggest improvements'] }
  ];
}

// ENGLISH LITERATURE LESSONS
function getEnglishLiteratureAS() {
  let o = 1;
  return [
    { s: 'AS1: Poetry', o: o++, t: 'Poetry Analysis Techniques', d: 'Form structure language', obj: ['Analyze poetic form', 'Examine language devices', 'Understand rhythm meter'] },
    { s: 'AS1: Poetry', o: o++, t: 'Poetry Themes and Context', d: 'Historical and cultural contexts', obj: ['Explore thematic concerns', 'Consider historical context', 'Understand cultural influences'] },
    { s: 'AS1: Poetry', o: o++, t: 'Comparative Poetry Study', d: 'Comparing poems', obj: ['Compare themes across poems', 'Analyze different perspectives', 'Evaluate poetic techniques'] },
    
    { s: 'AS1: Shakespeare', o: o++, t: 'Shakespeare Language', d: 'Elizabethan English', obj: ['Understand Shakespeare language', 'Analyze dramatic techniques', 'Explore wordplay imagery'] },
    { s: 'AS1: Shakespeare', o: o++, t: 'Shakespeare Themes', d: 'Universal themes', obj: ['Identify key themes', 'Analyze character development', 'Understand dramatic structure'] },
    { s: 'AS1: Shakespeare', o: o++, t: 'Shakespeare Performance', d: 'Text as performance', obj: ['Consider staging choices', 'Analyze directorial interpretation', 'Evaluate performances'] },
    
    { s: 'AS2: Prose', o: o++, t: 'Novel Study Introduction', d: 'Narrative techniques', obj: ['Analyze narrative voice', 'Examine characterization', 'Understand plot structure'] },
    { s: 'AS2: Prose', o: o++, t: 'Prose Themes and Context', d: 'Social and historical context', obj: ['Explore thematic concerns', 'Consider social context', 'Understand authorial intent'] },
    { s: 'AS2: Prose', o: o++, t: 'Critical Perspectives', d: 'Literary criticism', obj: ['Apply critical theories', 'Evaluate different interpretations', 'Form independent judgments'] },
    
    { s: 'AS2: Drama', o: o++, t: 'Modern Drama Study', d: 'Post-1900 drama', obj: ['Analyze dramatic form', 'Examine character relationships', 'Understand staging techniques'] },
    { s: 'AS2: Drama', o: o++, t: 'Drama Themes and Issues', d: 'Social and political themes', obj: ['Identify key themes', 'Analyze social commentary', 'Understand dramatic purpose'] }
  ];
}

function getEnglishLiteratureA2() {
  let o = 1;
  return [
    { s: 'A2-1: Literary Genres', o: o++, t: 'Genre Characteristics', d: 'Conventions and features', obj: ['Identify genre conventions', 'Analyze genre expectations', 'Understand genre evolution'] },
    { s: 'A2-1: Literary Genres', o: o++, t: 'Genre Comparison', d: 'Cross-genre analysis', obj: ['Compare different genres', 'Analyze similar themes', 'Evaluate genre effectiveness'] },
    
    { s: 'A2-1: Critical Study', o: o++, t: 'Literary Theory', d: 'Critical approaches', obj: ['Apply feminist criticism', 'Use Marxist approaches', 'Understand psychoanalytic theory'] },
    { s: 'A2-1: Critical Study', o: o++, t: 'Close Reading', d: 'Detailed textual analysis', obj: ['Analyze language choices', 'Examine structural patterns', 'Evaluate literary effects'] },
    
    { s: 'A2-2: Wider Reading', o: o++, t: 'Literary Connections', d: 'Comparative study', obj: ['Make textual connections', 'Compare treatments of themes', 'Evaluate different approaches'] },
    { s: 'A2-2: Wider Reading', o: o++, t: 'Independent Study', d: 'Personal research', obj: ['Select appropriate texts', 'Conduct independent research', 'Form critical arguments'] },
    
    { s: 'A2-2: Coursework', o: o++, t: 'Extended Essay', d: 'Independent critical writing', obj: ['Plan extended essay', 'Develop critical argument', 'Support with evidence'] },
    { s: 'A2-2: Coursework', o: o++, t: 'Research Skills', d: 'Academic research', obj: ['Use critical sources', 'Reference appropriately', 'Synthesize arguments'] }
  ];
}

// ENGLISH LANGUAGE LESSONS
function getEnglishLanguageAS() {
  let o = 1;
  return [
    { s: 'AS1: Language Study', o: o++, t: 'Language Frameworks', d: 'Lexis grammar phonology', obj: ['Analyze lexical choices', 'Examine grammatical structures', 'Understand phonological features'] },
    { s: 'AS1: Language Study', o: o++, t: 'Language Variation', d: 'Regional and social dialects', obj: ['Identify regional dialects', 'Analyze social variation', 'Understand accent vs dialect'] },
    { s: 'AS1: Language Study', o: o++, t: 'Spoken Language', d: 'Conversation analysis', obj: ['Analyze spoken discourse', 'Examine turn-taking', 'Understand pragmatics'] },
    { s: 'AS1: Language Study', o: o++, t: 'Written Language', d: 'Text analysis', obj: ['Analyze written texts', 'Examine cohesion coherence', 'Understand text types'] },
    
    { s: 'AS2: Language Change', o: o++, t: 'Language Change Over Time', d: 'Historical development', obj: ['Trace language evolution', 'Analyze Old Middle Modern English', 'Understand semantic change'] },
    { s: 'AS2: Language Change', o: o++, t: 'Contemporary Language Change', d: 'Modern developments', obj: ['Identify current changes', 'Analyze technology impact', 'Understand neologisms'] },
    { s: 'AS2: Language Change', o: o++, t: 'Language and Gender', d: 'Gender differences in language', obj: ['Analyze gender language use', 'Examine theories Lakoff Tannen', 'Understand gender representation'] },
    { s: 'AS2: Language Change', o: o++, t: 'Language and Power', d: 'Power relationships in discourse', obj: ['Analyze power in language', 'Examine institutional discourse', 'Understand persuasive techniques'] }
  ];
}

function getEnglishLanguageA2() {
  let o = 1;
  return [
    { s: 'A2-1: Language Investigation', o: o++, t: 'Research Methods', d: 'Linguistic research', obj: ['Design research questions', 'Collect language data', 'Analyze findings'] },
    { s: 'A2-1: Language Investigation', o: o++, t: 'Data Analysis', d: 'Qualitative and quantitative', obj: ['Analyze language data', 'Apply linguistic frameworks', 'Present findings'] },
    
    { s: 'A2-2: Language Production', o: o++, t: 'Original Writing', d: 'Creative writing skills', obj: ['Produce original texts', 'Apply stylistic techniques', 'Reflect on choices'] },
    { s: 'A2-2: Language Production', o: o++, t: 'Commentary Writing', d: 'Analytical commentary', obj: ['Write language commentary', 'Analyze own writing', 'Justify linguistic choices'] }
  ];
}

// MATHEMATICS LESSONS
function getMathematicsAS() {
  let o = 1;
  return [
    { s: 'AS1: Pure Maths', o: o++, t: 'Algebra Fundamentals', d: 'Algebraic manipulation', obj: ['Expand and factorize', 'Solve linear equations', 'Manipulate algebraic fractions'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Quadratic Equations', d: 'Solving and graphing', obj: ['Solve quadratic equations', 'Complete the square', 'Use quadratic formula'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Inequalities', d: 'Linear and quadratic', obj: ['Solve linear inequalities', 'Solve quadratic inequalities', 'Represent solutions graphically'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Indices and Surds', d: 'Laws of indices', obj: ['Apply index laws', 'Rationalize surds', 'Simplify expressions'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Coordinate Geometry', d: 'Lines and circles', obj: ['Find equation of line', 'Find equation of circle', 'Solve coordinate problems'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Functions', d: 'Domain range composition', obj: ['Define functions notation', 'Find domain and range', 'Compose functions'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Differentiation', d: 'Basic calculus', obj: ['Differentiate polynomials', 'Find gradients and tangents', 'Apply stationary points'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Integration', d: 'Basic integration', obj: ['Integrate polynomials', 'Find areas under curves', 'Apply integration techniques'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Trigonometry', d: 'Angles and identities', obj: ['Use trigonometric ratios', 'Apply sine cosine rules', 'Solve trigonometric equations'] },
    { s: 'AS1: Pure Maths', o: o++, t: 'Sequences and Series', d: 'Arithmetic and geometric', obj: ['Find nth term', 'Sum arithmetic series', 'Sum geometric series'] },
    
    { s: 'AS2: Applied Maths', o: o++, t: 'Statistics Data', d: 'Data representation', obj: ['Draw statistical diagrams', 'Calculate measures of location', 'Calculate measures of spread'] },
    { s: 'AS2: Applied Maths', o: o++, t: 'Probability', d: 'Probability theory', obj: ['Calculate probabilities', 'Use tree diagrams', 'Apply conditional probability'] },
    { s: 'AS2: Applied Maths', o: o++, t: 'Statistical Distributions', d: 'Normal and binomial', obj: ['Use binomial distribution', 'Apply normal distribution', 'Solve distribution problems'] },
    { s: 'AS2: Applied Maths', o: o++, t: 'Mechanics Kinematics', d: 'Motion in straight line', obj: ['Use suvat equations', 'Draw velocity-time graphs', 'Solve motion problems'] },
    { s: 'AS2: Applied Maths', o: o++, t: 'Mechanics Forces', d: 'Forces and equilibrium', obj: ['Resolve forces', 'Apply Newton laws', 'Solve equilibrium problems'] }
  ];
}

function getMathematicsA2() {
  let o = 1;
  return [
    { s: 'A2-1: Pure Maths', o: o++, t: 'Advanced Algebra', d: 'Polynomials and partial fractions', obj: ['Divide polynomials', 'Use remainder theorem', 'Apply partial fractions'] },
    { s: 'A2-1: Pure Maths', o: o++, t: 'Exponentials and Logarithms', d: 'Exponential and log functions', obj: ['Solve exponential equations', 'Apply logarithm laws', 'Model exponential growth'] },
    { s: 'A2-1: Pure Maths', o: o++, t: 'Advanced Trigonometry', d: 'Identities and equations', obj: ['Apply compound angle formulae', 'Use double angle formulae', 'Solve trigonometric equations'] },
    { s: 'A2-1: Pure Maths', o: o++, t: 'Advanced Differentiation', d: 'Product quotient chain rules', obj: ['Apply product rule', 'Apply quotient rule', 'Use chain rule'] },
    { s: 'A2-1: Pure Maths', o: o++, t: 'Advanced Integration', d: 'Integration techniques', obj: ['Integrate by substitution', 'Integrate by parts', 'Solve differential equations'] },
    { s: 'A2-1: Pure Maths', o: o++, t: 'Parametric Equations', d: 'Parametric forms', obj: ['Differentiate parametric equations', 'Find areas parametric curves', 'Convert to Cartesian'] },
    { s: 'A2-1: Pure Maths', o: o++, t: 'Vectors', d: '2D and 3D vectors', obj: ['Add and subtract vectors', 'Calculate scalar product', 'Find vector equations'] },
    
    { s: 'A2-2: Applied Maths', o: o++, t: 'Advanced Statistics', d: 'Hypothesis testing', obj: ['Conduct hypothesis tests', 'Use significance levels', 'Interpret test results'] },
    { s: 'A2-2: Applied Maths', o: o++, t: 'Correlation and Regression', d: 'Bivariate data', obj: ['Calculate correlation coefficient', 'Find regression lines', 'Make predictions'] },
    { s: 'A2-2: Applied Maths', o: o++, t: 'Advanced Mechanics', d: 'Projectiles and circular motion', obj: ['Solve projectile problems', 'Apply circular motion', 'Use energy and momentum'] }
  ];
}

// FURTHER MATHEMATICS LESSONS
function getFurtherMathematicsAS() {
  let o = 1;
  return [
    { s: 'AS1: Core Pure', o: o++, t: 'Complex Numbers', d: 'Imaginary and complex', obj: ['Define complex numbers', 'Perform complex arithmetic', 'Use Argand diagrams'] },
    { s: 'AS1: Core Pure', o: o++, t: 'Matrices', d: 'Matrix operations', obj: ['Add and multiply matrices', 'Find determinants and inverses', 'Solve matrix equations'] },
    { s: 'AS1: Core Pure', o: o++, t: 'Proof by Induction', d: 'Mathematical proof', obj: ['Apply proof by induction', 'Prove series formulae', 'Prove divisibility'] },
    { s: 'AS1: Core Pure', o: o++, t: 'Advanced Algebra', d: 'Inequalities and roots', obj: ['Solve modulus inequalities', 'Use discriminant', 'Apply algebraic division'] },
    
    { s: 'AS2: Option Mechanics', o: o++, t: 'Advanced Kinematics', d: 'Variable acceleration', obj: ['Use calculus in kinematics', 'Solve variable acceleration', 'Apply vector methods'] },
    { s: 'AS2: Option Statistics', o: o++, t: 'Probability Distributions', d: 'Discrete and continuous', obj: ['Use Poisson distribution', 'Apply exponential distribution', 'Solve probability problems'] }
  ];
}

function getFurtherMathematicsA2() {
  let o = 1;
  return [
    { s: 'A2-1: Core Pure', o: o++, t: 'Hyperbolic Functions', d: 'Sinh cosh tanh', obj: ['Define hyperbolic functions', 'Prove hyperbolic identities', 'Solve hyperbolic equations'] },
    { s: 'A2-1: Core Pure', o: o++, t: 'Differential Equations', d: 'First and second order', obj: ['Solve first order DEs', 'Solve second order DEs', 'Model with DEs'] },
    { s: 'A2-1: Core Pure', o: o++, t: 'Polar Coordinates', d: 'Polar forms', obj: ['Convert to polar coordinates', 'Sketch polar curves', 'Find areas polar regions'] },
    
    { s: 'A2-2: Options', o: o++, t: 'Advanced Mechanics', d: 'Rigid body motion', obj: ['Apply moments', 'Use center of mass', 'Solve rigid body problems'] },
    { s: 'A2-2: Options', o: o++, t: 'Advanced Statistics', d: 'Statistical inference', obj: ['Use chi-squared tests', 'Apply confidence intervals', 'Conduct advanced hypothesis tests'] }
  ];
}

// LIFE & HEALTH SCIENCES LESSONS
function getLifeHealthSciencesAS() {
  let o = 1;
  return [
    { s: 'AS1: Human Biology', o: o++, t: 'Cell Structure and Function', d: 'Cells tissues organs', obj: ['Describe cell organelles', 'Explain cell specialization', 'Understand tissue types'] },
    { s: 'AS1: Human Biology', o: o++, t: 'Circulatory System', d: 'Heart and blood vessels', obj: ['Describe heart structure', 'Explain cardiac cycle', 'Understand blood circulation'] },
    { s: 'AS1: Human Biology', o: o++, t: 'Respiratory System', d: 'Breathing and gas exchange', obj: ['Describe respiratory structures', 'Explain ventilation mechanism', 'Understand gas exchange'] },
    { s: 'AS1: Human Biology', o: o++, t: 'Digestive System', d: 'Digestion and absorption', obj: ['Describe digestive organs', 'Explain enzyme digestion', 'Understand nutrient absorption'] },
    { s: 'AS1: Human Biology', o: o++, t: 'Nervous System', d: 'Coordination and control', obj: ['Describe neuron structure', 'Explain nerve impulse transmission', 'Understand reflex actions'] },
    
    { s: 'AS2: Health Issues', o: o++, t: 'Diet and Nutrition', d: 'Balanced diet requirements', obj: ['Explain nutrient requirements', 'Assess dietary deficiencies', 'Understand malnutrition'] },
    { s: 'AS2: Health Issues', o: o++, t: 'Cardiovascular Disease', d: 'Heart disease prevention', obj: ['Identify CVD risk factors', 'Explain disease mechanisms', 'Assess prevention strategies'] },
    { s: 'AS2: Health Issues', o: o++, t: 'Respiratory Disease', d: 'Lung disorders', obj: ['Describe asthma COPD', 'Explain disease causes', 'Assess treatment options'] },
    { s: 'AS2: Health Issues', o: o++, t: 'Infectious Disease', d: 'Pathogens and immunity', obj: ['Identify disease-causing organisms', 'Explain immune response', 'Understand vaccination'] },
    { s: 'AS2: Health Issues', o: o++, t: 'Mental Health', d: 'Psychological wellbeing', obj: ['Understand mental health conditions', 'Identify risk factors', 'Assess support strategies'] }
  ];
}

function getLifeHealthSciencesA2() {
  let o = 1;
  return [
    { s: 'A2-1: Body Systems', o: o++, t: 'Endocrine System', d: 'Hormonal control', obj: ['Describe endocrine glands', 'Explain hormone action', 'Understand feedback control'] },
    { s: 'A2-1: Body Systems', o: o++, t: 'Renal System', d: 'Kidney function', obj: ['Describe kidney structure', 'Explain urine formation', 'Understand homeostasis'] },
    { s: 'A2-1: Body Systems', o: o++, t: 'Reproductive System', d: 'Human reproduction', obj: ['Describe reproductive organs', 'Explain gametogenesis', 'Understand pregnancy development'] },
    { s: 'A2-1: Body Systems', o: o++, t: 'Immune System', d: 'Defense mechanisms', obj: ['Explain innate immunity', 'Describe adaptive immunity', 'Understand immunological memory'] },
    
    { s: 'A2-2: Contemporary Issues', o: o++, t: 'Cancer Biology', d: 'Cancer development and treatment', obj: ['Explain tumor formation', 'Identify risk factors', 'Assess treatment approaches'] },
    { s: 'A2-2: Contemporary Issues', o: o++, t: 'Genetic Disorders', d: 'Inherited conditions', obj: ['Explain genetic inheritance', 'Describe genetic disorders', 'Assess genetic screening'] },
    { s: 'A2-2: Contemporary Issues', o: o++, t: 'Substance Abuse', d: 'Drug effects on health', obj: ['Explain drug effects', 'Assess health impacts', 'Understand addiction'] },
    { s: 'A2-2: Contemporary Issues', o: o++, t: 'Healthcare Systems', d: 'Public health', obj: ['Compare healthcare models', 'Assess health provision', 'Understand health policy'] }
  ];
}

// ENVIRONMENTAL TECHNOLOGY LESSONS
function getEnvironmentalTechnologyAS() {
  let o = 1;
  return [
    { s: 'AS1: Environmental Science', o: o++, t: 'Ecosystems', d: 'Ecosystem components and energy flow', obj: ['Describe ecosystem structure', 'Explain energy transfer', 'Understand nutrient cycles'] },
    { s: 'AS1: Environmental Science', o: o++, t: 'Biodiversity', d: 'Species diversity and conservation', obj: ['Measure biodiversity', 'Assess conservation importance', 'Understand threats to biodiversity'] },
    { s: 'AS1: Environmental Science', o: o++, t: 'Pollution', d: 'Air water soil pollution', obj: ['Identify pollution sources', 'Assess pollution effects', 'Evaluate control measures'] },
    { s: 'AS1: Environmental Science', o: o++, t: 'Climate Change', d: 'Causes and impacts', obj: ['Explain greenhouse effect', 'Assess climate change evidence', 'Understand mitigation strategies'] },
    
    { s: 'AS2: Environmental Management', o: o++, t: 'Waste Management', d: 'Waste reduction and recycling', obj: ['Classify waste types', 'Assess disposal methods', 'Evaluate recycling schemes'] },
    { s: 'AS2: Environmental Management', o: o++, t: 'Energy Resources', d: 'Renewable and non-renewable', obj: ['Compare energy sources', 'Assess sustainability', 'Understand energy efficiency'] },
    { s: 'AS2: Environmental Management', o: o++, t: 'Water Resources', d: 'Water supply and treatment', obj: ['Explain water cycle', 'Describe water treatment', 'Assess water conservation'] }
  ];
}

function getEnvironmentalTechnologyA2() {
  let o = 1;
  return [
    { s: 'A2-1: Environmental Issues', o: o++, t: 'Deforestation', d: 'Forest loss impacts', obj: ['Identify deforestation causes', 'Assess environmental impacts', 'Evaluate sustainable forestry'] },
    { s: 'A2-1: Environmental Issues', o: o++, t: 'Agriculture and Environment', d: 'Farming impacts', obj: ['Assess agricultural pollution', 'Explain intensive farming', 'Understand organic farming'] },
    { s: 'A2-1: Environmental Issues', o: o++, t: 'Urban Environment', d: 'Urban sustainability', obj: ['Identify urban environmental issues', 'Assess sustainable cities', 'Understand green infrastructure'] },
    
    { s: 'A2-2: Environmental Technology', o: o++, t: 'Environmental Monitoring', d: 'Measurement techniques', obj: ['Use monitoring equipment', 'Collect environmental data', 'Analyze data trends'] },
    { s: 'A2-2: Environmental Technology', o: o++, t: 'Environmental Assessment', d: 'Impact assessment', obj: ['Conduct environmental surveys', 'Assess development impacts', 'Recommend mitigation measures'] }
  ];
}