import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const courses = await base44.asServiceRole.entities.Course.filter({
      category: 'technology_design'
    });

    const results = [];

    for (const course of courses) {
      try {
        const key = `${course.category}_${course.alevel_stage || 'gcse'}`;
        const lessons = getDesignLessons(key);

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
        const batchSize = 10;
        for (let i = 0; i < lessons.length; i += batchSize) {
          const batch = lessons.slice(i, i + batchSize);
          await base44.asServiceRole.entities.Lesson.bulkCreate(batch.map(l => ({
            course_id: course.id,
            title: l.title,
            description: l.description,
            section: l.section,
            order: l.order,
            learning_objectives: l.learning_objectives || [],
            content_type: 'richtext',
            slides: [],
            is_preview: l.order <= 2,
            duration_minutes: 45
          })));
          await new Promise(r => setTimeout(r, 400));
        }

        await base44.asServiceRole.entities.Course.update(course.id, {
          total_lessons: lessons.length
        });

        results.push({
          course: course.title,
          lessons: lessons.length,
          status: 'success'
        });

        await new Promise(r => setTimeout(r, 5000));
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

function getDesignLessons(key) {
  const dataMap = {
    'technology_design_as': getDesignAS,
    'technology_design_a2': getDesignA2,
    'technology_design_gcse': getDesignGCSE,
  };

  const fn = dataMap[key];
  return fn ? fn() : [];
}

function getDesignGCSE() {
  let o = 1;
  return [
    { section: 'Unit 1.1: Material Selection', order: o++, title: 'Material Selection Criteria', description: 'Selecting materials based on functional, manufacturing and environmental requirements', learning_objectives: ['Consider functional requirements (properties and characteristics)', 'Consider manufacturing demands and scale of production', 'Consider environmental factors and material availability', 'Understand appropriate joining techniques'] },
    { section: 'Unit 1.2: Wood', order: o++, title: 'Wood Materials', description: 'Hardwoods, softwoods and manufactured boards', learning_objectives: ['Know hardwoods and softwoods', 'Understand properties of pine, ash, beech, oak, mahogany', 'Know manufactured boards: plywood, blockboard, chipboard, hardboard, MDF', 'Understand wood finishes: stains, oils, polishes, paints, veneers, laminates'] },
    { section: 'Unit 1.3: Metal', order: o++, title: 'Metal Materials', description: 'Ferrous and non-ferrous metals and alloys', learning_objectives: ['Distinguish between ferrous and non-ferrous metals', 'Know properties of aluminium, copper, brass, zinc, steels', 'Understand metal finishes: painting, electroplating, anodising'] },
    { section: 'Unit 1.4: Plastic', order: o++, title: 'Plastics and Polymers', description: 'Thermoplastics and thermosetting plastics', learning_objectives: ['Understand difference between thermoplastic and thermosetting', 'Know properties of HDPE, LDPE, PET, PVC, acrylic, nylon, ABS, melamine-formaldehyde'] },
    { section: 'Unit 1.5: Modern Materials', order: o++, title: 'Modern and Smart Materials', description: 'Composite materials and emerging technologies', learning_objectives: ['Know thermochromic and photochromic materials', 'Understand smart material applications', 'Know PEEK, PPSU and modern composites'] },
    { section: 'Unit 1.6: Processing', order: o++, title: 'Manufacturing Processes', description: 'Wasting, forming, moulding and extrusion', learning_objectives: ['Understand wasting processes: hand tools, CNC machining', 'Know forming: rolling, blanking, forging', 'Understand moulding: injection, blow, vacuum forming, casting'] },
    { section: 'Unit 1.7-1.8: Design', order: o++, title: 'Design Process and Communication', description: 'Product analysis and design communication', learning_objectives: ['Analyze products: marketing, ergonomics, environmental, safety', 'Understand design process: research, specification, ideas, development', 'Communicate designs using sketching and CAD'] },
    { section: 'Unit 1.9-1.10: CAD/Quality', order: o++, title: 'CAD/CAM and Quality Control', description: 'Digital design and quality assurance', learning_objectives: ['Know CAD, CAM, CIM applications and advantages', 'Understand factor of safety', 'Know testing, inspection and safety procedures'] },
  ];
}

function getDesignAS() {
  let o = 1;
  return [
    // Compulsory Core: Design and Materials (1.1-1.10)
    { section: 'Unit AS 1.1: Material Selection', order: o++, title: 'Material Selection Criteria', description: 'Functional requirements, manufacturing demands and environmental considerations', learning_objectives: ['Consider functional requirements (properties and characteristics)', 'Consider manufacturing demands (scale of production, process suitability)', 'Consider environmental factors (corrosion resistance, stability)', 'Understand appropriate joining techniques', 'Know physical properties: density, electrical/thermal conductivity', 'Know mechanical properties: strength, elasticity, plasticity, toughness, hardness, durability, brittleness'] },
    
    { section: 'Unit AS 1.2: Wood', order: o++, title: 'Wood: Hardwoods and Softwoods', description: 'Properties, characteristics and uses of wood materials', learning_objectives: ['Know hardwoods and softwoods', 'Understand properties and uses of pine, ash, beech, oak, mahogany', 'Know available forms: common lengths, rough sawn and PAR sizes', 'Understand manufactured boards: plywood, blockboard, chipboard, hardboard, MDF', 'Know wood finishes: stains, oils, polishes, paints, synthetic resins, veneers, laminates'] },
    
    { section: 'Unit AS 1.3: Metal', order: o++, title: 'Metals: Ferrous and Non-Ferrous', description: 'Metal materials, alloys and finishing techniques', learning_objectives: ['Know available forms of supply of metals', 'Understand ferrous vs non-ferrous metals and alloys', 'Know properties of aluminium, aluminium alloys, copper, brass, zinc, mild/medium/high steel, stainless steel', 'Understand metal finishes: painting, plastic coating, electroplating, anodising, enamelling, lacquering'] },
    
    { section: 'Unit AS 1.4: Plastic', order: o++, title: 'Plastics and Polymers', description: 'Thermoplastic and thermosetting materials', learning_objectives: ['Understand difference between thermoplastic and thermosetting plastics', 'Know properties and uses of HDPE, LDPE, PET, PVC, acrylic, nylon, ABS, melamine-formaldehyde'] },
    
    { section: 'Unit AS 1.5: Modern Materials', order: o++, title: 'Modern Composite and Smart Materials', description: 'Advanced materials and emerging technologies', learning_objectives: ['Know thermochromic and photochromic materials', 'Understand phosphorescent pigments, reflective films, holograms', 'Know liquid crystal displays', 'Understand PEEK and PPSU applications in product design'] },
    
    { section: 'Unit AS 1.6: Processing Methods', order: o++, title: 'Manufacturing Processes', description: 'Wasting, forming, moulding and extrusion processes', learning_objectives: ['Understand wasting: workshop hand tools, manual and CNC machine tools', 'Know forming: rolling, blanking, press forming, forging', 'Understand moulding: injection, blow, rotational, vacuum forming, sand casting, pressure die casting', 'Know extrusion processes'] },
    
    { section: 'Unit AS 1.7: Product Analysis', order: o++, title: 'Product Analysis and Improvement', description: 'Evaluating and redesigning existing products', learning_objectives: ['Analyze products: marketing constraints, target audience', 'Evaluate ergonomics and anthropometrics', 'Consider cultural, ethnic and moral issues', 'Assess environmental issues', 'Consider user safety', 'Produce redesign proposals'] },
    
    { section: 'Unit AS 1.8: Design Communication', order: o++, title: 'Design Process and Communication', description: 'Design methodology and visual communication', learning_objectives: ['Understand design process: research to specification, idea generation, development, review, testing', 'Apply sustainability, creativity, flair and innovation in design', 'Communicate designs using 2D freehand sketching and mixed media'] },
    
    { section: 'Unit AS 1.9: CAD/CAM', order: o++, title: 'Computer-Aided Design and Manufacture', description: 'Digital design and manufacturing technologies', learning_objectives: ['Understand CAD: drawing, solid modelling, virtual imaging, rapid prototyping', 'Know CAM: computer-assisted manufacturing', 'Understand CIM: stock control, quality control, manufacturing, assembly', 'Know advantages of using CAD, CAM and CIM'] },
    
    { section: 'Unit AS 1.10: Quality and Safety', order: o++, title: 'Quality Assurance and Safety', description: 'Testing, inspection and safety procedures', learning_objectives: ['Understand use of factor of safety', 'Know purpose of testing and inspection of components/products', 'Understand risks associated with manufacturing processes', 'Know safety procedures and methods to minimise risks'] },
  ];
}

function getDesignA2() {
  let o = 1;
  return [
    // A2 focuses on advanced systems, environmental issues, and comprehensive product development
    { section: 'Unit A2 1.49: Environmental Issues', order: o++, title: 'Environmental Issues in Product Design', description: 'Sustainability and environmental impact throughout product lifecycle', learning_objectives: ['Understand environmental impact at different product life cycle stages', 'Know climate change and greenhouse gases', 'Understand reducing impact by design', 'Apply the 6Rs: rethink, reuse, recycle, repair, reduce, refuse', 'Know environmental audits and life-cycle assessment', 'Understand sustainable use of metals and plastics', 'Know biodegradable and photodegradable plastics', 'Understand need for innovation in product design'] },
    
    { section: 'Unit A2 1.50: Product Life Cycle', order: o++, title: 'Product Life Cycle and Market Strategy', description: 'Understanding product development from concept to market', learning_objectives: ['Understand product life cycle: inception, introduction, growth, maturity, decline', 'Know life cycles for fad, fashion and basic products', 'Understand product redesign: reasons, alternatives, relaunch', 'Know product testing and identification of problems'] },
    
    { section: 'Unit A2 1.51: Technology in Manufacturing', order: o++, title: 'Advances in Technology and ICT', description: 'Modern manufacturing technologies and systems', learning_objectives: ['Employ CAD and CAM systems in design and manufacture', 'Understand benefits of QRM (quick response manufacturing)', 'Know quick change injection moulding techniques', 'Understand FMS (flexible manufacturing systems)'] },
    
    { section: 'Unit A2 1.52: Marketing - The Four Ps', order: o++, title: 'From Mind to Market: Marketing Strategy', description: 'Market analysis, pricing, placement and promotion', learning_objectives: ['Understand how and why new products arise', 'Know market pull vs technology push', 'Understand radical vs incremental products', 'Know market strategy: penetration, development, diversification', 'Understand Product: variable life cycles, consumer types (innovators, opinion leaders, masses, late adopters, laggards)', 'Know Price: cost-plus, contribution pricing, perceived value, pricing for life cycle stages', 'Understand Place: geographical and physical placing, barriers to trading', 'Know Promotion: sales promotion, advertising, publicity, exhibitions, trade fairs', 'Use ICT to implement the four Ps'] },
    
    { section: 'Unit A2 1.53-1.54: Quality and Design', order: o++, title: 'Quality Control and Design for Use', description: 'Quality systems and inclusive design principles', learning_objectives: ['Understand quality control and assurance systems', 'Know use of measuring devices, jigs, templates, fixtures', 'Understand use of ICT in quality control', 'Design for maintenance and repair', 'Design to be inclusive for all society'] },
    
    { section: 'Unit A2 1.55-1.56: Design for Manufacture', order: o++, title: 'Design for Manufacture and Communication', description: 'Designing for production and communicating design intent', learning_objectives: ['Formulate proposals for scale production', 'Design to minimise materials, components, processes, environmental impact', 'Design to minimise packaging material and wasted space', 'Use appropriate communication and rendering techniques', 'Use text size and style to communicate impact and appeal to audiences'] },
    
    { section: 'Unit A2 1.57: Design Movements', order: o++, title: 'Technological Developments in Society', description: 'Influence of designers, movements and societal factors', learning_objectives: ['Know influence of key designers and design movements', 'Understand changes in fashion: miniaturisation, portability, flexibility', 'Know cultural and social changes', 'Understand scientific advances', 'Know examples incorporating moral, economic, social and environmental factors'] },
    
    { section: 'Unit A2 2: Coursework - Problem Identification', order: o++, title: 'Problem Identification and User Needs', description: 'Identifying design problems and creating specifications', learning_objectives: ['Identify a problem or need', 'Formulate a design brief', 'Identify potential clients or end users', 'Consider design implications from user needs', 'Analyze existing solutions using research techniques', 'Formulate design specification for concept development', 'Provide detailed referencing of sources'] },
    
    { section: 'Unit A2 2: Coursework - Design Development', order: o++, title: 'Initial Ideas, Development and Planning', description: 'Innovative design proposals and technical development', learning_objectives: ['Propose innovative design outcomes integrating Systems/Control or Product Design', 'Evaluate each proposal using relevant criteria', 'Select concept appropriate for development', 'Develop chosen concept with evidence of numerical analysis', 'Provide documentary evidence of making and design decisions', 'Justify development decisions', 'Integrate with user and environment', 'Provide ergonomic and aesthetic development', 'Create detailed plan of making process', 'Produce working drawings'] },
    
    { section: 'Unit A2 2: Coursework - Making and Testing', order: o++, title: 'Product Manufacture and Evaluation', description: 'Making prototype and testing outcomes', learning_objectives: ['Produce product prototype meeting identified needs', 'Incorporate components/product design features and materials', 'Demonstrate design decisions in prototype', 'Show competence in range of making skills and processes', 'Evaluate outcome of design process', 'Carry out tests on design outcome', 'Make conclusions from evaluation', 'Propose further development based on testing results'] },
  ];
}