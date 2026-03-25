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
      category: 'environmental_technology'
    });

    const results = [];
    
    for (const course of courses) {
      try {
        const lessons = course.alevel_stage === 'as' ? getEnvironmentalTechnologyAS() : getEnvironmentalTechnologyA2();
        
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

function getEnvironmentalTechnologyAS() {
  let o = 1;
  const lessons = [];
  
  // AS1: Living Organisms and the Environment
  
  // 1.1 Ecosystems (8 lessons)
  lessons.push(
    { s: 'AS1: Ecosystems', o: o++, t: 'Ecosystem Components', d: 'Biotic and abiotic factors', obj: ['Define ecosystem biotic abiotic factors', 'Identify producers consumers decomposers', 'Understand habitat niche community'] },
    { s: 'AS1: Ecosystems', o: o++, t: 'Food Chains and Webs', d: 'Energy transfer in ecosystems', obj: ['Construct food chains and webs', 'Explain trophic levels', 'Understand energy flow through ecosystems'] },
    { s: 'AS1: Ecosystems', o: o++, t: 'Energy Flow', d: 'Energy transfer efficiency', obj: ['Calculate energy transfer efficiency', 'Explain pyramids of energy', 'Understand 10% law'] },
    { s: 'AS1: Ecosystems', o: o++, t: 'Nutrient Cycles Carbon', d: 'Carbon cycle processes', obj: ['Describe carbon cycle', 'Explain photosynthesis respiration', 'Understand carbon sinks and sources'] },
    { s: 'AS1: Ecosystems', o: o++, t: 'Nutrient Cycles Nitrogen', d: 'Nitrogen cycle', obj: ['Describe nitrogen cycle stages', 'Explain nitrogen fixation nitrification', 'Understand denitrification'] },
    { s: 'AS1: Ecosystems', o: o++, t: 'Nutrient Cycles Water', d: 'Water cycle', obj: ['Describe water cycle', 'Explain evaporation condensation precipitation', 'Understand transpiration runoff'] },
    { s: 'AS1: Ecosystems', o: o++, t: 'Population Dynamics', d: 'Population growth and regulation', obj: ['Understand population growth curves', 'Explain carrying capacity', 'Identify limiting factors'] },
    { s: 'AS1: Ecosystems', o: o++, t: 'Ecological Succession', d: 'Community change over time', obj: ['Define primary secondary succession', 'Explain pioneer species climax community', 'Understand succession stages'] }
  );
  
  // 1.2 Biodiversity (6 lessons)
  lessons.push(
    { s: 'AS1: Biodiversity', o: o++, t: 'Species Diversity', d: 'Measuring biodiversity', obj: ['Define biodiversity', 'Calculate species richness', 'Use Simpson diversity index'] },
    { s: 'AS1: Biodiversity', o: o++, t: 'Sampling Techniques', d: 'Ecological sampling methods', obj: ['Use quadrats for plant sampling', 'Apply transect methods', 'Understand random systematic sampling'] },
    { s: 'AS1: Biodiversity', o: o++, t: 'Habitat Conservation', d: 'Protecting ecosystems', obj: ['Explain conservation importance', 'Describe habitat protection methods', 'Understand nature reserves'] },
    { s: 'AS1: Biodiversity', o: o++, t: 'Threats to Biodiversity', d: 'Causes of biodiversity loss', obj: ['Identify habitat loss fragmentation', 'Explain overexploitation pollution', 'Understand invasive species impact'] },
    { s: 'AS1: Biodiversity', o: o++, t: 'Conservation Strategies', d: 'Protecting biodiversity', obj: ['Explain in-situ conservation', 'Describe ex-situ conservation', 'Understand captive breeding'] },
    { s: 'AS1: Biodiversity', o: o++, t: 'Legislation and Protection', d: 'Legal frameworks', obj: ['Understand CITES', 'Explain protected areas', 'Describe wildlife legislation'] }
  );
  
  // 1.3 Pollution (12 lessons)
  lessons.push(
    { s: 'AS1: Pollution', o: o++, t: 'Types of Pollution', d: 'Classification of pollutants', obj: ['Define pollution types', 'Distinguish point non-point sources', 'Understand primary secondary pollutants'] },
    { s: 'AS1: Pollution', o: o++, t: 'Air Pollution Sources', d: 'Causes of air pollution', obj: ['Identify combustion processes', 'Explain industrial emissions', 'Understand vehicle emissions'] },
    { s: 'AS1: Pollution', o: o++, t: 'Air Pollutants', d: 'Major air pollutants', obj: ['Describe sulfur dioxide effects', 'Explain nitrogen oxides', 'Understand particulate matter carbon monoxide'] },
    { s: 'AS1: Pollution', o: o++, t: 'Acid Rain', d: 'Formation and effects', obj: ['Explain acid rain formation', 'Describe environmental impacts', 'Understand pH effects on ecosystems'] },
    { s: 'AS1: Pollution', o: o++, t: 'Photochemical Smog', d: 'Ground-level ozone', obj: ['Explain smog formation', 'Describe health effects', 'Understand conditions for smog'] },
    { s: 'AS1: Pollution', o: o++, t: 'Water Pollution Sources', d: 'Causes of water pollution', obj: ['Identify agricultural runoff', 'Explain sewage discharge', 'Understand industrial effluent'] },
    { s: 'AS1: Pollution', o: o++, t: 'Eutrophication', d: 'Nutrient enrichment', obj: ['Explain eutrophication process', 'Describe algal blooms', 'Understand oxygen depletion'] },
    { s: 'AS1: Pollution', o: o++, t: 'Water Quality Indicators', d: 'Biological and chemical indicators', obj: ['Use BOD as indicator', 'Explain indicator species', 'Understand water quality testing'] },
    { s: 'AS1: Pollution', o: o++, t: 'Soil Pollution', d: 'Contamination of soil', obj: ['Identify soil pollutants', 'Explain heavy metal accumulation', 'Understand pesticide impacts'] },
    { s: 'AS1: Pollution', o: o++, t: 'Noise Pollution', d: 'Sound pollution effects', obj: ['Define noise pollution', 'Measure decibel levels', 'Understand health impacts'] },
    { s: 'AS1: Pollution', o: o++, t: 'Light Pollution', d: 'Artificial light effects', obj: ['Explain light pollution', 'Describe ecological impacts', 'Understand effects on wildlife'] },
    { s: 'AS1: Pollution', o: o++, t: 'Pollution Control', d: 'Prevention and mitigation', obj: ['Explain pollution prevention', 'Describe treatment methods', 'Understand clean technologies'] }
  );
  
  // 1.4 Climate and Weather (8 lessons)
  lessons.push(
    { s: 'AS1: Climate Weather', o: o++, t: 'Atmosphere Structure', d: 'Layers of atmosphere', obj: ['Describe atmospheric layers', 'Explain temperature variations', 'Understand atmospheric composition'] },
    { s: 'AS1: Climate Weather', o: o++, t: 'Solar Radiation', d: 'Energy from the sun', obj: ['Explain solar radiation', 'Understand albedo effect', 'Describe energy budget'] },
    { s: 'AS1: Climate Weather', o: o++, t: 'Greenhouse Effect', d: 'Natural warming process', obj: ['Explain greenhouse effect mechanism', 'Identify greenhouse gases', 'Understand natural vs enhanced'] },
    { s: 'AS1: Climate Weather', o: o++, t: 'Climate Change Evidence', d: 'Evidence for warming', obj: ['Analyze temperature records', 'Examine ice core data', 'Understand sea level rise'] },
    { s: 'AS1: Climate Weather', o: o++, t: 'Climate Change Causes', d: 'Human and natural factors', obj: ['Explain anthropogenic causes', 'Describe natural climate variation', 'Understand feedback mechanisms'] },
    { s: 'AS1: Climate Weather', o: o++, t: 'Climate Change Impacts', d: 'Effects on environment', obj: ['Assess ecosystem impacts', 'Explain extreme weather events', 'Understand sea level impacts'] },
    { s: 'AS1: Climate Weather', o: o++, t: 'Weather Systems', d: 'Air masses and fronts', obj: ['Describe air masses', 'Explain weather fronts', 'Understand depression formation'] },
    { s: 'AS1: Climate Weather', o: o++, t: 'Local Climate', d: 'Microclimates', obj: ['Explain urban heat island', 'Describe topography effects', 'Understand local variations'] }
  );
  
  return lessons;
}

function getEnvironmentalTechnologyA2() {
  let o = 1;
  const lessons = [];
  
  // A2-1: Environmental Management and Sustainability
  
  // 2.1 Natural Resources (10 lessons)
  lessons.push(
    { s: 'A2-1: Resources', o: o++, t: 'Resource Classification', d: 'Renewable and non-renewable', obj: ['Classify resource types', 'Distinguish renewable non-renewable', 'Understand resource sustainability'] },
    { s: 'A2-1: Resources', o: o++, t: 'Fossil Fuels', d: 'Coal oil gas', obj: ['Describe fossil fuel formation', 'Explain extraction methods', 'Understand environmental impacts'] },
    { s: 'A2-1: Resources', o: o++, t: 'Nuclear Energy', d: 'Fission power generation', obj: ['Explain nuclear fission', 'Describe reactor operation', 'Understand radioactive waste'] },
    { s: 'A2-1: Resources', o: o++, t: 'Renewable Energy Solar', d: 'Solar power technologies', obj: ['Explain photovoltaic cells', 'Describe solar thermal', 'Assess solar energy potential'] },
    { s: 'A2-1: Resources', o: o++, t: 'Renewable Energy Wind', d: 'Wind power generation', obj: ['Explain wind turbine operation', 'Assess wind farm impacts', 'Understand location factors'] },
    { s: 'A2-1: Resources', o: o++, t: 'Renewable Energy Hydro', d: 'Hydroelectric power', obj: ['Explain hydroelectric generation', 'Describe pumped storage', 'Assess environmental impacts'] },
    { s: 'A2-1: Resources', o: o++, t: 'Biofuels', d: 'Biomass energy', obj: ['Explain biofuel production', 'Compare bioethanol biodiesel', 'Assess sustainability'] },
    { s: 'A2-1: Resources', o: o++, t: 'Water Resources', d: 'Water supply and management', obj: ['Explain water cycle management', 'Describe water treatment', 'Understand water scarcity'] },
    { s: 'A2-1: Resources', o: o++, t: 'Mineral Resources', d: 'Mining and extraction', obj: ['Describe mining methods', 'Explain ore processing', 'Assess mining impacts'] },
    { s: 'A2-1: Resources', o: o++, t: 'Energy Efficiency', d: 'Reducing energy consumption', obj: ['Explain energy efficiency measures', 'Calculate energy savings', 'Understand insulation'] }
  );
  
  // 2.2 Waste Management (10 lessons)
  lessons.push(
    { s: 'A2-1: Waste', o: o++, t: 'Waste Types', d: 'Classification of waste', obj: ['Classify municipal industrial hazardous', 'Understand waste hierarchy', 'Explain waste streams'] },
    { s: 'A2-1: Waste', o: o++, t: 'Waste Reduction', d: 'Minimizing waste generation', obj: ['Explain reduce reuse principles', 'Describe waste prevention', 'Understand source reduction'] },
    { s: 'A2-1: Waste', o: o++, t: 'Recycling', d: 'Material recovery', obj: ['Explain recycling processes', 'Describe material recovery facilities', 'Assess recycling benefits'] },
    { s: 'A2-1: Waste', o: o++, t: 'Composting', d: 'Organic waste treatment', obj: ['Explain composting process', 'Describe aerobic decomposition', 'Understand compost uses'] },
    { s: 'A2-1: Waste', o: o++, t: 'Landfills', d: 'Waste disposal sites', obj: ['Describe landfill design', 'Explain leachate management', 'Understand methane capture'] },
    { s: 'A2-1: Waste', o: o++, t: 'Incineration', d: 'Waste-to-energy', obj: ['Explain incineration process', 'Describe energy recovery', 'Assess air emissions'] },
    { s: 'A2-1: Waste', o: o++, t: 'Hazardous Waste', d: 'Toxic waste management', obj: ['Identify hazardous waste types', 'Explain special handling', 'Understand treatment methods'] },
    { s: 'A2-1: Waste', o: o++, t: 'E-waste', d: 'Electronic waste', obj: ['Explain e-waste problems', 'Describe recovery processes', 'Understand toxic components'] },
    { s: 'A2-1: Waste', o: o++, t: 'Plastic Waste', d: 'Plastic pollution', obj: ['Explain plastic types', 'Describe recycling challenges', 'Understand microplastics'] },
    { s: 'A2-1: Waste', o: o++, t: 'Circular Economy', d: 'Closing resource loops', obj: ['Explain circular economy concept', 'Describe closed-loop systems', 'Assess sustainability benefits'] }
  );
  
  // 2.3 Environmental Impact Assessment (8 lessons)
  lessons.push(
    { s: 'A2-1: EIA', o: o++, t: 'EIA Process', d: 'Environmental impact assessment', obj: ['Explain EIA stages', 'Describe screening scoping', 'Understand assessment methods'] },
    { s: 'A2-1: EIA', o: o++, t: 'Baseline Studies', d: 'Pre-development surveys', obj: ['Conduct baseline surveys', 'Collect environmental data', 'Establish reference conditions'] },
    { s: 'A2-1: EIA', o: o++, t: 'Impact Prediction', d: 'Forecasting effects', obj: ['Predict environmental impacts', 'Assess magnitude significance', 'Understand cumulative effects'] },
    { s: 'A2-1: EIA', o: o++, t: 'Mitigation Measures', d: 'Reducing impacts', obj: ['Propose mitigation strategies', 'Explain avoidance reduction', 'Understand compensation'] },
    { s: 'A2-1: EIA', o: o++, t: 'Public Consultation', d: 'Stakeholder involvement', obj: ['Explain consultation process', 'Identify stakeholders', 'Incorporate public input'] },
    { s: 'A2-1: EIA', o: o++, t: 'Environmental Monitoring', d: 'Post-development monitoring', obj: ['Design monitoring programs', 'Collect compliance data', 'Report monitoring results'] },
    { s: 'A2-1: EIA', o: o++, t: 'Life Cycle Assessment', d: 'Cradle to grave analysis', obj: ['Explain LCA methodology', 'Assess product lifecycle', 'Calculate environmental footprint'] },
    { s: 'A2-1: EIA', o: o++, t: 'Carbon Footprinting', d: 'Measuring carbon emissions', obj: ['Calculate carbon footprint', 'Identify emission sources', 'Propose reduction strategies'] }
  );
  
  // A2-2: Environmental Technology and Solutions
  
  // 2.4 Water and Wastewater Treatment (10 lessons)
  lessons.push(
    { s: 'A2-2: Water Treatment', o: o++, t: 'Water Treatment Overview', d: 'Potable water production', obj: ['Explain water treatment stages', 'Describe treatment objectives', 'Understand water quality standards'] },
    { s: 'A2-2: Water Treatment', o: o++, t: 'Screening and Sedimentation', d: 'Physical treatment', obj: ['Describe screening process', 'Explain sedimentation', 'Understand coagulation flocculation'] },
    { s: 'A2-2: Water Treatment', o: o++, t: 'Filtration', d: 'Removing suspended solids', obj: ['Explain sand filtration', 'Describe membrane filtration', 'Understand filter types'] },
    { s: 'A2-2: Water Treatment', o: o++, t: 'Disinfection', d: 'Pathogen removal', obj: ['Explain chlorination', 'Describe UV disinfection', 'Understand ozonation'] },
    { s: 'A2-2: Water Treatment', o: o++, t: 'Wastewater Treatment Primary', d: 'Initial wastewater treatment', obj: ['Describe screening grit removal', 'Explain primary sedimentation', 'Understand sludge production'] },
    { s: 'A2-2: Water Treatment', o: o++, t: 'Wastewater Treatment Secondary', d: 'Biological treatment', obj: ['Explain activated sludge process', 'Describe trickling filters', 'Understand BOD removal'] },
    { s: 'A2-2: Water Treatment', o: o++, t: 'Wastewater Treatment Tertiary', d: 'Advanced treatment', obj: ['Explain nutrient removal', 'Describe advanced filtration', 'Understand pathogen reduction'] },
    { s: 'A2-2: Water Treatment', o: o++, t: 'Sludge Treatment', d: 'Managing treatment residuals', obj: ['Describe sludge digestion', 'Explain dewatering methods', 'Understand sludge disposal'] },
    { s: 'A2-2: Water Treatment', o: o++, t: 'Septic Systems', d: 'On-site wastewater treatment', obj: ['Explain septic tank operation', 'Describe drain field function', 'Understand maintenance requirements'] },
    { s: 'A2-2: Water Treatment', o: o++, t: 'Constructed Wetlands', d: 'Natural treatment systems', obj: ['Explain wetland treatment', 'Describe design principles', 'Assess treatment effectiveness'] }
  );
  
  // 2.5 Air Pollution Control (8 lessons)
  lessons.push(
    { s: 'A2-2: Air Control', o: o++, t: 'Emission Standards', d: 'Regulatory limits', obj: ['Explain air quality standards', 'Describe emission limits', 'Understand compliance monitoring'] },
    { s: 'A2-2: Air Control', o: o++, t: 'Particulate Control', d: 'Removing particles', obj: ['Describe electrostatic precipitators', 'Explain baghouse filters', 'Understand cyclones'] },
    { s: 'A2-2: Air Control', o: o++, t: 'Gaseous Pollutant Control', d: 'Removing gases', obj: ['Explain scrubbers', 'Describe adsorption', 'Understand catalytic converters'] },
    { s: 'A2-2: Air Control', o: o++, t: 'Vehicle Emissions', d: 'Controlling transport pollution', obj: ['Explain catalytic converters', 'Describe emission standards', 'Understand alternative fuels'] },
    { s: 'A2-2: Air Control', o: o++, t: 'Industrial Emissions', d: 'Factory pollution control', obj: ['Describe best available technology', 'Explain emission reduction', 'Understand stack monitoring'] },
    { s: 'A2-2: Air Control', o: o++, t: 'Indoor Air Quality', d: 'Managing indoor pollution', obj: ['Identify indoor pollutants', 'Explain ventilation requirements', 'Understand air purification'] },
    { s: 'A2-2: Air Control', o: o++, t: 'Ozone Layer Protection', d: 'Stratospheric ozone', obj: ['Explain ozone depletion', 'Describe Montreal Protocol', 'Understand CFC alternatives'] },
    { s: 'A2-2: Air Control', o: o++, t: 'Carbon Capture', d: 'Reducing CO2 emissions', obj: ['Explain carbon capture technology', 'Describe storage options', 'Assess feasibility'] }
  );
  
  // 2.6 Sustainable Development (8 lessons)
  lessons.push(
    { s: 'A2-2: Sustainability', o: o++, t: 'Sustainable Development Principles', d: 'Balancing environment economy society', obj: ['Define sustainable development', 'Explain three pillars', 'Understand intergenerational equity'] },
    { s: 'A2-2: Sustainability', o: o++, t: 'Ecological Footprint', d: 'Measuring resource use', obj: ['Calculate ecological footprint', 'Understand biocapacity', 'Assess sustainability'] },
    { s: 'A2-2: Sustainability', o: o++, t: 'Green Building', d: 'Sustainable construction', obj: ['Explain green building principles', 'Describe energy-efficient design', 'Understand LEED certification'] },
    { s: 'A2-2: Sustainability', o: o++, t: 'Sustainable Agriculture', d: 'Environmentally friendly farming', obj: ['Explain organic farming', 'Describe precision agriculture', 'Understand agroforestry'] },
    { s: 'A2-2: Sustainability', o: o++, t: 'Sustainable Transport', d: 'Low-carbon mobility', obj: ['Describe public transport', 'Explain electric vehicles', 'Understand active transport'] },
    { s: 'A2-2: Sustainability', o: o++, t: 'Environmental Policy', d: 'Regulations and legislation', obj: ['Explain environmental laws', 'Describe policy instruments', 'Understand enforcement'] },
    { s: 'A2-2: Sustainability', o: o++, t: 'Corporate Sustainability', d: 'Business environmental responsibility', obj: ['Explain CSR', 'Describe environmental management systems', 'Understand ISO 14001'] },
    { s: 'A2-2: Sustainability', o: o++, t: 'Future Challenges', d: 'Emerging environmental issues', obj: ['Identify future challenges', 'Explain adaptation strategies', 'Understand resilience'] }
  );
  
  return lessons;
}