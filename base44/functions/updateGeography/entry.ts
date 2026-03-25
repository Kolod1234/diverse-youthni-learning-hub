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
      category: 'geography'
    });

    const results = [];
    
    for (const course of courses) {
      try {
        const lessons = course.alevel_stage === 'as' ? getGeographyAS() : getGeographyA2();
        
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

function getGeographyAS() {
  let o = 1;
  const lessons = [];
  
  // AS1: Physical Geography
  
  // 1.1 Rivers and Flooding (12 lessons)
  lessons.push(
    { s: 'AS1: Rivers', o: o++, t: 'The Hydrological Cycle', d: 'Water movement in the environment', obj: ['Describe hydrological cycle processes', 'Explain inputs outputs stores', 'Understand water balance'] },
    { s: 'AS1: Rivers', o: o++, t: 'Drainage Basins', d: 'River catchment systems', obj: ['Define drainage basin terminology', 'Identify watershed tributaries confluence', 'Understand basin characteristics'] },
    { s: 'AS1: Rivers', o: o++, t: 'River Processes', d: 'Erosion transport deposition', obj: ['Explain hydraulic action abrasion', 'Describe traction saltation suspension', 'Understand deposition conditions'] },
    { s: 'AS1: Rivers', o: o++, t: 'River Landforms Upper Course', d: 'V-shaped valleys waterfalls', obj: ['Explain V-shaped valley formation', 'Describe waterfall retreat', 'Understand gorge formation'] },
    { s: 'AS1: Rivers', o: o++, t: 'River Landforms Middle Course', d: 'Meanders and oxbow lakes', obj: ['Explain meander formation', 'Describe lateral erosion', 'Understand oxbow lake development'] },
    { s: 'AS1: Rivers', o: o++, t: 'River Landforms Lower Course', d: 'Floodplains levees deltas', obj: ['Explain floodplain formation', 'Describe natural levees', 'Understand delta types'] },
    { s: 'AS1: Rivers', o: o++, t: 'Flooding Causes', d: 'Physical and human causes', obj: ['Identify meteorological factors', 'Explain land use impacts', 'Assess deforestation urbanization effects'] },
    { s: 'AS1: Rivers', o: o++, t: 'Flood Hydrographs', d: 'Analyzing flood patterns', obj: ['Interpret hydrograph components', 'Compare flashy vs subdued', 'Analyze storm response'] },
    { s: 'AS1: Rivers', o: o++, t: 'Flood Impacts', d: 'Social economic environmental', obj: ['Assess social impacts deaths displacement', 'Evaluate economic costs', 'Understand environmental consequences'] },
    { s: 'AS1: Rivers', o: o++, t: 'Hard Engineering', d: 'Structural flood defenses', obj: ['Explain dams reservoirs', 'Describe embankments flood walls', 'Assess channelization'] },
    { s: 'AS1: Rivers', o: o++, t: 'Soft Engineering', d: 'Sustainable approaches', obj: ['Explain flood warnings', 'Describe floodplain zoning', 'Understand wetland restoration'] },
    { s: 'AS1: Rivers', o: o++, t: 'Case Study: River Management', d: 'Real-world example', obj: ['Examine specific river basin', 'Assess management strategies', 'Evaluate effectiveness'] }
  );
  
  // 1.2 Coastal Environments (12 lessons)
  lessons.push(
    { s: 'AS1: Coasts', o: o++, t: 'Coastal Systems', d: 'Inputs processes outputs', obj: ['Describe coastal system components', 'Explain sediment cells', 'Understand dynamic equilibrium'] },
    { s: 'AS1: Coasts', o: o++, t: 'Wave Types and Formation', d: 'Constructive and destructive waves', obj: ['Explain wave formation', 'Compare constructive destructive', 'Understand wave refraction'] },
    { s: 'AS1: Coasts', o: o++, t: 'Coastal Erosion Processes', d: 'Wearing away coastline', obj: ['Explain hydraulic action abrasion', 'Describe attrition corrosion', 'Assess erosion rates'] },
    { s: 'AS1: Coasts', o: o++, t: 'Erosional Landforms', d: 'Cliffs caves arches stacks', obj: ['Explain headland erosion', 'Describe wave-cut platform', 'Understand landform sequence'] },
    { s: 'AS1: Coasts', o: o++, t: 'Coastal Transport', d: 'Longshore drift', obj: ['Explain longshore drift process', 'Describe swash backwash', 'Understand sediment movement'] },
    { s: 'AS1: Coasts', o: o++, t: 'Depositional Landforms', d: 'Beaches spits bars', obj: ['Explain beach formation', 'Describe spit development', 'Understand tombolo formation'] },
    { s: 'AS1: Coasts', o: o++, t: 'Sea Level Change', d: 'Eustatic and isostatic', obj: ['Explain sea level variations', 'Describe submergent emergent coasts', 'Understand climate change impacts'] },
    { s: 'AS1: Coasts', o: o++, t: 'Coastal Flooding', d: 'Storm surges and risks', obj: ['Explain storm surge formation', 'Assess flood vulnerability', 'Understand coastal hazards'] },
    { s: 'AS1: Coasts', o: o++, t: 'Hard Coastal Engineering', d: 'Sea walls groynes', obj: ['Explain sea wall construction', 'Describe groyne function', 'Assess revetments'] },
    { s: 'AS1: Coasts', o: o++, t: 'Soft Coastal Management', d: 'Beach nourishment dunes', obj: ['Explain beach replenishment', 'Describe dune stabilization', 'Understand managed retreat'] },
    { s: 'AS1: Coasts', o: o++, t: 'Coastal Management Strategies', d: 'Hold line advance retreat', obj: ['Compare management options', 'Assess cost-benefit', 'Understand stakeholder conflicts'] },
    { s: 'AS1: Coasts', o: o++, t: 'Case Study: Coastal Management', d: 'Real-world example', obj: ['Examine specific coastline', 'Assess management strategies', 'Evaluate sustainability'] }
  );
  
  // 1.3 Ecosystems (10 lessons)
  lessons.push(
    { s: 'AS1: Ecosystems', o: o++, t: 'Ecosystem Components', d: 'Biotic and abiotic factors', obj: ['Define ecosystem terminology', 'Explain producers consumers decomposers', 'Understand nutrient cycling'] },
    { s: 'AS1: Ecosystems', o: o++, t: 'Energy Flow', d: 'Trophic levels and productivity', obj: ['Explain food chains webs', 'Describe energy transfer', 'Understand biomass pyramids'] },
    { s: 'AS1: Ecosystems', o: o++, t: 'Nutrient Cycling', d: 'Gersmehl model', obj: ['Explain nutrient stores', 'Describe nutrient transfers', 'Compare ecosystem nutrient budgets'] },
    { s: 'AS1: Ecosystems', o: o++, t: 'Tropical Rainforest Characteristics', d: 'Climate vegetation soils', obj: ['Describe rainforest climate', 'Explain vegetation structure', 'Understand latosol soils'] },
    { s: 'AS1: Ecosystems', o: o++, t: 'Rainforest Biodiversity', d: 'Species richness and adaptations', obj: ['Explain high biodiversity', 'Describe plant adaptations', 'Understand animal adaptations'] },
    { s: 'AS1: Ecosystems', o: o++, t: 'Deforestation Causes', d: 'Why rainforests are cleared', obj: ['Explain logging agriculture', 'Describe mining development', 'Assess population pressure'] },
    { s: 'AS1: Ecosystems', o: o++, t: 'Deforestation Impacts', d: 'Environmental and social consequences', obj: ['Assess biodiversity loss', 'Explain climate impacts', 'Understand indigenous peoples'] },
    { s: 'AS1: Ecosystems', o: o++, t: 'Sustainable Management', d: 'Conservation strategies', obj: ['Explain selective logging', 'Describe ecotourism', 'Assess debt-for-nature swaps'] },
    { s: 'AS1: Ecosystems', o: o++, t: 'Hot Desert Ecosystems', d: 'Arid environment characteristics', obj: ['Describe desert climate', 'Explain vegetation adaptations', 'Understand desert soils'] },
    { s: 'AS1: Ecosystems', o: o++, t: 'Case Study: Ecosystem Management', d: 'Real-world example', obj: ['Examine specific ecosystem', 'Assess threats', 'Evaluate management strategies'] }
  );
  
  // AS2: Human Geography
  
  // 2.1 Population and Migration (12 lessons)
  lessons.push(
    { s: 'AS2: Population', o: o++, t: 'Population Distribution', d: 'Global patterns', obj: ['Describe population distribution patterns', 'Explain dense sparse areas', 'Understand influencing factors'] },
    { s: 'AS2: Population', o: o++, t: 'Population Density', d: 'Measuring concentration', obj: ['Calculate population density', 'Compare density variations', 'Assess limitations of density'] },
    { s: 'AS2: Population', o: o++, t: 'Population Structure', d: 'Age-sex pyramids', obj: ['Interpret population pyramids', 'Compare pyramid shapes', 'Understand dependency ratios'] },
    { s: 'AS2: Population', o: o++, t: 'Demographic Transition Model', d: 'Population change over time', obj: ['Explain DTM stages', 'Describe birth death rate changes', 'Assess model limitations'] },
    { s: 'AS2: Population', o: o++, t: 'Population Policies', d: 'Pro-natalist and anti-natalist', obj: ['Explain China one-child policy', 'Describe France pro-natalist', 'Assess policy effectiveness'] },
    { s: 'AS2: Population', o: o++, t: 'Migration Types', d: 'International and internal', obj: ['Define migration terminology', 'Explain voluntary forced migration', 'Understand push pull factors'] },
    { s: 'AS2: Population', o: o++, t: 'Migration Impacts Source Areas', d: 'Effects on origin', obj: ['Assess economic impacts', 'Explain social consequences', 'Understand brain drain'] },
    { s: 'AS2: Population', o: o++, t: 'Migration Impacts Destination', d: 'Effects on receiving areas', obj: ['Assess economic benefits', 'Explain social tensions', 'Understand cultural diversity'] },
    { s: 'AS2: Population', o: o++, t: 'Refugees and Asylum Seekers', d: 'Forced migration', obj: ['Explain refugee crisis', 'Describe causes', 'Assess humanitarian responses'] },
    { s: 'AS2: Population', o: o++, t: 'Ageing Populations', d: 'Challenges and opportunities', obj: ['Explain causes of ageing', 'Assess economic impacts', 'Understand healthcare pressures'] },
    { s: 'AS2: Population', o: o++, t: 'Youthful Populations', d: 'High birth rate challenges', obj: ['Explain causes', 'Assess education employment needs', 'Understand development implications'] },
    { s: 'AS2: Population', o: o++, t: 'Case Study: Population Change', d: 'Real-world example', obj: ['Examine specific country', 'Assess demographic trends', 'Evaluate policy responses'] }
  );
  
  // 2.2 Settlement (10 lessons)
  lessons.push(
    { s: 'AS2: Settlement', o: o++, t: 'Settlement Patterns', d: 'Dispersed nucleated linear', obj: ['Describe settlement patterns', 'Explain influencing factors', 'Assess historical development'] },
    { s: 'AS2: Settlement', o: o++, t: 'Settlement Hierarchy', d: 'Size and function', obj: ['Explain urban hierarchy', 'Describe rank-size rule', 'Understand primacy'] },
    { s: 'AS2: Settlement', o: o++, t: 'Urbanization', d: 'Growth of cities', obj: ['Explain urbanization trends', 'Compare MEDCs LEDCs', 'Assess causes of urban growth'] },
    { s: 'AS2: Settlement', o: o++, t: 'Urban Land Use Models', d: 'Burgess Hoyt CBD', obj: ['Explain Burgess concentric model', 'Describe Hoyt sector model', 'Assess model applications'] },
    { s: 'AS2: Settlement', o: o++, t: 'Central Business District', d: 'CBD characteristics', obj: ['Describe CBD features', 'Explain high land values', 'Understand functional zonation'] },
    { s: 'AS2: Settlement', o: o++, t: 'Inner City', d: 'Decline and regeneration', obj: ['Explain inner city decline', 'Describe regeneration strategies', 'Assess gentrification'] },
    { s: 'AS2: Settlement', o: o++, t: 'Suburbs', d: 'Residential areas', obj: ['Explain suburbanization', 'Describe commuter settlements', 'Understand urban sprawl'] },
    { s: 'AS2: Settlement', o: o++, t: 'Counterurbanization', d: 'Movement to rural areas', obj: ['Explain counterurbanization', 'Describe causes', 'Assess impacts on rural areas'] },
    { s: 'AS2: Settlement', o: o++, t: 'Megacities', d: 'Cities over 10 million', obj: ['Describe megacity growth', 'Explain challenges', 'Assess management strategies'] },
    { s: 'AS2: Settlement', o: o++, t: 'Case Study: Urban Change', d: 'Real-world example', obj: ['Examine specific city', 'Assess urban issues', 'Evaluate solutions'] }
  );
  
  return lessons;
}

function getGeographyA2() {
  let o = 1;
  const lessons = [];
  
  // A2-1: Physical Geography
  
  // 3.1 Plate Tectonics (12 lessons)
  lessons.push(
    { s: 'A2-1: Tectonics', o: o++, t: 'Earth\'s Structure', d: 'Internal layers', obj: ['Describe crust mantle core', 'Explain continental oceanic crust', 'Understand lithosphere asthenosphere'] },
    { s: 'A2-1: Tectonics', o: o++, t: 'Plate Tectonic Theory', d: 'Continental drift and evidence', obj: ['Explain Wegener\'s theory', 'Describe supporting evidence', 'Understand sea-floor spreading'] },
    { s: 'A2-1: Tectonics', o: o++, t: 'Plate Boundaries', d: 'Constructive destructive conservative', obj: ['Explain divergent boundaries', 'Describe convergent boundaries', 'Understand transform boundaries'] },
    { s: 'A2-1: Tectonics', o: o++, t: 'Volcanic Activity', d: 'Types and distribution', obj: ['Explain volcano formation', 'Compare shield cone composite', 'Understand volcanic hazards'] },
    { s: 'A2-1: Tectonics', o: o++, t: 'Volcanic Impacts', d: 'Primary and secondary effects', obj: ['Assess lava pyroclastic flows', 'Explain lahars tsunamis', 'Understand climate impacts'] },
    { s: 'A2-1: Tectonics', o: o++, t: 'Volcanic Management', d: 'Prediction preparation response', obj: ['Explain monitoring techniques', 'Describe evacuation planning', 'Assess aid and recovery'] },
    { s: 'A2-1: Tectonics', o: o++, t: 'Earthquakes', d: 'Causes and measurement', obj: ['Explain earthquake generation', 'Describe focus epicenter', 'Understand Richter Mercalli scales'] },
    { s: 'A2-1: Tectonics', o: o++, t: 'Earthquake Impacts', d: 'Primary and secondary effects', obj: ['Assess ground shaking', 'Explain liquefaction tsunamis', 'Understand building collapse'] },
    { s: 'A2-1: Tectonics', o: o++, t: 'Earthquake Management', d: 'Prediction protection planning', obj: ['Explain seismograph networks', 'Describe earthquake-resistant design', 'Assess preparedness programs'] },
    { s: 'A2-1: Tectonics', o: o++, t: 'Comparing Tectonic Events', d: 'MEDCs vs LEDCs', obj: ['Compare vulnerability', 'Assess capacity to cope', 'Understand development impacts'] },
    { s: 'A2-1: Tectonics', o: o++, t: 'Living with Tectonic Hazards', d: 'Why people stay', obj: ['Explain benefits fertile soils', 'Assess tourism geothermal', 'Understand risk perception'] },
    { s: 'A2-1: Tectonics', o: o++, t: 'Case Studies: Tectonic Events', d: 'Real-world examples', obj: ['Compare two earthquake events', 'Assess contrasting impacts', 'Evaluate responses'] }
  );
  
  // 3.2 Weather and Climate (12 lessons)
  lessons.push(
    { s: 'A2-1: Weather Climate', o: o++, t: 'Atmospheric Structure', d: 'Layers of atmosphere', obj: ['Describe troposphere stratosphere', 'Explain temperature variations', 'Understand atmospheric composition'] },
    { s: 'A2-1: Weather Climate', o: o++, t: 'Global Heat Budget', d: 'Energy balance', obj: ['Explain insolation radiation', 'Describe albedo effect', 'Understand heat surplus deficit'] },
    { s: 'A2-1: Weather Climate', o: o++, t: 'Atmospheric Circulation', d: 'Tri-cellular model', obj: ['Explain Hadley Ferrel Polar cells', 'Describe pressure belts', 'Understand trade winds westerlies'] },
    { s: 'A2-1: Weather Climate', o: o++, t: 'Ocean Currents', d: 'Surface and deep currents', obj: ['Explain current formation', 'Describe gyres', 'Understand thermohaline circulation'] },
    { s: 'A2-1: Weather Climate', o: o++, t: 'Air Masses and Fronts', d: 'Weather systems', obj: ['Describe air mass types', 'Explain warm cold fronts', 'Understand occluded fronts'] },
    { s: 'A2-1: Weather Climate', o: o++, t: 'Depressions', d: 'Mid-latitude weather systems', obj: ['Explain depression formation', 'Describe life cycle', 'Understand associated weather'] },
    { s: 'A2-1: Weather Climate', o: o++, t: 'Anticyclones', d: 'High pressure systems', obj: ['Explain anticyclone formation', 'Describe summer winter conditions', 'Assess blocking patterns'] },
    { s: 'A2-1: Weather Climate', o: o++, t: 'Tropical Storms', d: 'Hurricanes typhoons cyclones', obj: ['Explain formation conditions', 'Describe structure eyewall', 'Understand distribution patterns'] },
    { s: 'A2-1: Weather Climate', o: o++, t: 'Tropical Storm Impacts', d: 'Hazards and consequences', obj: ['Assess storm surge flooding', 'Explain wind damage', 'Understand landfall impacts'] },
    { s: 'A2-1: Weather Climate', o: o++, t: 'Climate Change Evidence', d: 'Past and present change', obj: ['Explain ice core evidence', 'Describe temperature records', 'Assess sea level rise'] },
    { s: 'A2-1: Weather Climate', o: o++, t: 'Climate Change Causes', d: 'Natural and human factors', obj: ['Explain greenhouse effect', 'Describe anthropogenic emissions', 'Assess natural variations'] },
    { s: 'A2-1: Weather Climate', o: o++, t: 'Climate Change Impacts', d: 'Environmental and human consequences', obj: ['Assess ecosystem changes', 'Explain extreme weather', 'Understand mitigation adaptation'] }
  );
  
  // A2-2: Human Geography
  
  // 4.1 Rural Geography (10 lessons)
  lessons.push(
    { s: 'A2-2: Rural', o: o++, t: 'Rural Settlement Patterns', d: 'Characteristics and change', obj: ['Describe rural settlement types', 'Explain changing functions', 'Assess rural-urban fringe'] },
    { s: 'A2-2: Rural', o: o++, t: 'Agricultural Systems', d: 'Inputs processes outputs', obj: ['Explain agricultural systems model', 'Compare intensive extensive', 'Understand subsistence commercial'] },
    { s: 'A2-2: Rural', o: o++, t: 'Agricultural Change MEDCs', d: 'Mechanization and intensification', obj: ['Explain agricultural revolution', 'Describe technological advances', 'Assess environmental impacts'] },
    { s: 'A2-2: Rural', o: o++, t: 'Agricultural Change LEDCs', d: 'Green Revolution', obj: ['Explain Green Revolution', 'Assess benefits HYV seeds', 'Understand social economic impacts'] },
    { s: 'A2-2: Rural', o: o++, t: 'Rural Depopulation', d: 'Outmigration and decline', obj: ['Explain causes of depopulation', 'Assess impacts on services', 'Understand ageing populations'] },
    { s: 'A2-2: Rural', o: o++, t: 'Rural Diversification', d: 'Farm and non-farm activities', obj: ['Explain farm diversification', 'Describe agritourism', 'Assess alternative income sources'] },
    { s: 'A2-2: Rural', o: o++, t: 'Rural-Urban Fringe', d: 'Pressures and conflicts', obj: ['Explain fringe characteristics', 'Assess competing land uses', 'Understand planning conflicts'] },
    { s: 'A2-2: Rural', o: o++, t: 'Rural Sustainability', d: 'Organic farming conservation', obj: ['Explain organic farming', 'Describe conservation agriculture', 'Assess sustainable practices'] },
    { s: 'A2-2: Rural', o: o++, t: 'Food Security', d: 'Global food supply challenges', obj: ['Explain food insecurity causes', 'Assess production distribution issues', 'Understand solutions'] },
    { s: 'A2-2: Rural', o: o++, t: 'Case Study: Rural Change', d: 'Real-world example', obj: ['Examine specific rural area', 'Assess changes and challenges', 'Evaluate management strategies'] }
  );
  
  // 4.2 Economic Activity (12 lessons)
  lessons.push(
    { s: 'A2-2: Economic', o: o++, t: 'Economic Sectors', d: 'Primary secondary tertiary quaternary', obj: ['Explain sector classification', 'Describe employment structures', 'Understand development patterns'] },
    { s: 'A2-2: Economic', o: o++, t: 'Industrial Location Theory', d: 'Weber\'s least cost model', obj: ['Explain Weber\'s theory', 'Assess transport labour agglomeration', 'Understand location factors'] },
    { s: 'A2-2: Economic', o: o++, t: 'Changing Industrial Location', d: 'Globalization impacts', obj: ['Explain deindustrialization', 'Describe offshoring outsourcing', 'Assess NICs manufacturing'] },
    { s: 'A2-2: Economic', o: o++, t: 'Transnational Corporations', d: 'Global companies', obj: ['Explain TNC characteristics', 'Assess benefits to host countries', 'Understand criticisms'] },
    { s: 'A2-2: Economic', o: o++, t: 'High-Tech Industry', d: 'Science parks technology clusters', obj: ['Explain high-tech characteristics', 'Describe Silicon Valley model', 'Assess innovation hubs'] },
    { s: 'A2-2: Economic', o: o++, t: 'Tourism Growth', d: 'Global tourism trends', obj: ['Explain tourism growth factors', 'Describe Butler model', 'Assess mass vs niche tourism'] },
    { s: 'A2-2: Economic', o: o++, t: 'Tourism Impacts', d: 'Economic social environmental', obj: ['Assess economic benefits', 'Explain social cultural impacts', 'Understand environmental costs'] },
    { s: 'A2-2: Economic', o: o++, t: 'Sustainable Tourism', d: 'Ecotourism and management', obj: ['Explain ecotourism principles', 'Describe sustainable practices', 'Assess carrying capacity'] },
    { s: 'A2-2: Economic', o: o++, t: 'Retail Change', d: 'Out-of-town shopping online', obj: ['Explain retail decentralization', 'Assess CBD decline', 'Understand e-commerce impacts'] },
    { s: 'A2-2: Economic', o: o++, t: 'Globalization', d: 'Interconnected world economy', obj: ['Explain globalization processes', 'Assess winners and losers', 'Understand global shift'] },
    { s: 'A2-2: Economic', o: o++, t: 'Development Gap', d: 'Inequalities and aid', obj: ['Explain development indicators', 'Assess development theories', 'Understand aid effectiveness'] },
    { s: 'A2-2: Economic', o: o++, t: 'Case Study: Economic Development', d: 'Real-world example', obj: ['Examine specific country/region', 'Assess development strategies', 'Evaluate outcomes'] }
  );
  
  return lessons;
}