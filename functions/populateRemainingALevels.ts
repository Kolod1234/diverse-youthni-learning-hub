import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const targetSubjects = ['geography', 'government_politics', 'religious_studies', 'digital_technology', 'software_systems_development', 'technology_design', 'english_literature'];
    
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
    english_literature_a2: getEnglishLiteratureA2()
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

// Add remaining subject functions (Religious Studies, Digital Technology, Software Systems, Technology & Design, English Literature)
function getReligiousStudiesAS() { return []; }
function getReligiousStudiesA2() { return []; }
function getDigitalTechnologyAS() { return []; }
function getDigitalTechnologyA2() { return []; }
function getSoftwareSystemsAS() { return []; }
function getSoftwareSystemsA2() { return []; }
function getTechnologyDesignAS() { return []; }
function getTechnologyDesignA2() { return []; }
function getEnglishLiteratureAS() { return []; }
function getEnglishLiteratureA2() { return []; }