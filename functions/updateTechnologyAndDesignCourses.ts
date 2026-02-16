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
    // Unit 1: Design Principles and Processes
    { section: 'Unit 1: Design Principles', order: o++, title: 'Design Thinking and Problem-Solving', description: 'Understanding design methodology and user-centered design', learning_objectives: ['Understand design thinking framework', 'Apply problem-solving strategies', 'Identify user needs and requirements'] },
    { section: 'Unit 1: Design Principles', order: o++, title: 'Materials and Properties', description: 'Selection and testing of materials', learning_objectives: ['Classify materials by properties', 'Evaluate material suitability', 'Understand material behavior'] },
    { section: 'Unit 1: Design Principles', order: o++, title: 'Design for Manufacture', description: 'Production methods and techniques', learning_objectives: ['Identify appropriate manufacturing processes', 'Understand scale of production', 'Evaluate manufacturing efficiency'] },
    { section: 'Unit 1: Design Principles', order: o++, title: 'Sustainability and Ethics', description: 'Environmental and ethical considerations', learning_objectives: ['Understand sustainable design principles', 'Evaluate environmental impact', 'Consider ethical manufacturing'] },

    // Unit 2: Product Design and Development
    { section: 'Unit 2: Product Design', order: o++, title: 'Design Iteration and Prototyping', description: 'Testing and refining designs', learning_objectives: ['Create prototypes and models', 'Test design concepts', 'Refine designs based on feedback'] },
    { section: 'Unit 2: Product Design', order: o++, title: 'User Experience (UX) Design', description: 'Creating usable and accessible products', learning_objectives: ['Design for user needs', 'Understand usability principles', 'Apply accessibility standards'] },
    { section: 'Unit 2: Product Design', order: o++, title: 'Aesthetics and Ergonomics', description: 'Form, function, and human factors', learning_objectives: ['Understand ergonomic principles', 'Apply aesthetic design principles', 'Balance form and function'] },

    // Unit 3: Systems and Control
    { section: 'Unit 3: Systems', order: o++, title: 'Systems Thinking', description: 'Understanding interconnected systems', learning_objectives: ['Identify systems and subsystems', 'Understand inputs, processes, outputs', 'Evaluate system performance'] },
    { section: 'Unit 3: Systems', order: o++, title: 'Control Systems and Automation', description: 'Mechanical and electronic control', learning_objectives: ['Understand control mechanisms', 'Identify feedback systems', 'Evaluate automation in manufacturing'] },
  ];
}

function getDesignAS() {
  let o = 1;
  return [
    // Unit 1: Design Principles and Methodology
    { section: 'Unit AS1: Design Principles', order: o++, title: 'Design Thinking Framework', description: 'Structured approach to design problem-solving', learning_objectives: ['Apply design thinking methodology', 'Conduct user research', 'Generate creative solutions'] },
    { section: 'Unit AS1: Design Principles', order: o++, title: 'Research and Analysis', description: 'Market research and contextual analysis', learning_objectives: ['Analyze market trends', 'Identify design opportunities', 'Evaluate existing solutions'] },
    { section: 'Unit AS1: Design Principles', order: o++, title: 'Materials Science', description: 'Properties and selection of materials', learning_objectives: ['Classify and compare materials', 'Understand material properties', 'Select appropriate materials for purpose'] },
    { section: 'Unit AS1: Design Principles', order: o++, title: 'Manufacturing Processes', description: 'Production methods and techniques', learning_objectives: ['Understand manufacturing processes', 'Evaluate scale and efficiency', 'Consider design for manufacture'] },
    { section: 'Unit AS1: Design Principles', order: o++, title: 'Sustainability', description: 'Environmental and social responsibility', learning_objectives: ['Evaluate environmental impact', 'Understand circular economy', 'Apply sustainable design principles'] },

    // Unit 2: Product Design and Development
    { section: 'Unit AS2: Product Development', order: o++, title: 'Design Specifications', description: 'Defining design requirements and constraints', learning_objectives: ['Create detailed specifications', 'Set design constraints', 'Establish success criteria'] },
    { section: 'Unit AS2: Product Development', order: o++, title: 'Prototyping and Testing', description: 'Creating and validating prototypes', learning_objectives: ['Design and build prototypes', 'Conduct user testing', 'Iterate based on feedback'] },
    { section: 'Unit AS2: Product Development', order: o++, title: 'User-Centered Design', description: 'Designing for specific user groups', learning_objectives: ['Apply UX principles', 'Design for accessibility', 'Consider user psychology'] },
    { section: 'Unit AS2: Product Development', order: o++, title: 'Ergonomics and Aesthetics', description: 'Human factors and visual design', learning_objectives: ['Apply ergonomic principles', 'Understand aesthetic theory', 'Balance functionality and appearance'] },
  ];
}

function getDesignA2() {
  let o = 1;
  return [
    // Unit 1: Advanced Design Research and Analysis
    { section: 'Unit A21: Advanced Research', order: o++, title: 'Advanced Market Analysis', description: 'In-depth market investigation and segmentation', learning_objectives: ['Conduct comprehensive market analysis', 'Identify market gaps', 'Analyze competitor strategies'] },
    { section: 'Unit A21: Advanced Research', order: o++, title: 'User Research Methods', description: 'Qualitative and quantitative research techniques', learning_objectives: ['Design and conduct surveys', 'Perform user interviews', 'Analyze research data'] },
    { section: 'Unit A21: Advanced Research', order: o++, title: 'Contextual and Cultural Analysis', description: 'Understanding design contexts and cultural factors', learning_objectives: ['Analyze cultural context', 'Understand social factors', 'Consider global perspectives'] },

    // Unit 2: Advanced Manufacturing and Materials
    { section: 'Unit A22: Manufacturing', order: o++, title: 'Advanced Manufacturing Processes', description: 'Modern production technologies and techniques', learning_objectives: ['Understand CNC and automation', 'Evaluate advanced manufacturing', 'Consider Industry 4.0 principles'] },
    { section: 'Unit A22: Manufacturing', order: o++, title: 'Material Innovation', description: 'Smart materials and advanced material properties', learning_objectives: ['Understand smart materials', 'Evaluate innovative materials', 'Apply material science to design'] },
    { section: 'Unit A22: Manufacturing', order: o++, title: 'Design for Manufacture (DFM)', description: 'Optimizing design for production', learning_objectives: ['Apply DFM principles', 'Minimize production costs', 'Ensure manufacturability'] },

    // Unit 3: Systems, Control and Innovation
    { section: 'Unit A23: Systems & Innovation', order: o++, title: 'Advanced Control Systems', description: 'Complex automated and smart systems', learning_objectives: ['Design control systems', 'Understand IoT integration', 'Apply feedback mechanisms'] },
    { section: 'Unit A23: Systems & Innovation', order: o++, title: 'Circular Economy and Life Cycle Design', description: 'Designing for entire product lifecycle', learning_objectives: ['Conduct lifecycle assessment', 'Design for disassembly', 'Plan end-of-life solutions'] },
    { section: 'Unit A23: Systems & Innovation', order: o++, title: 'Innovation and Emerging Technologies', description: 'Future design trends and technologies', learning_objectives: ['Identify emerging technologies', 'Apply cutting-edge design solutions', 'Anticipate future needs'] },
  ];
}