import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Environmental Technology AS 1 lessons
    const as1Lessons = [
      { title: 'Reliance on Fossil Fuels', order: 1, section: 'AS 1' },
      { title: 'Counting the Cost of Fossil Fuel Reliance', order: 2, section: 'AS 1' },
      { title: 'Global Action on Energy Conservation and Climate Change', order: 3, section: 'AS 1' },
      { title: 'Power Generation Fundamentals', order: 4, section: 'AS 1' },
      { title: 'Electricity Distribution and Smart Grids', order: 5, section: 'AS 1' },
      { title: 'Microgeneration and Heat Pump Technology', order: 6, section: 'AS 1' },
      { title: 'Energy from Wind - Part 1', order: 7, section: 'AS 1' },
      { title: 'Energy from Wind - Part 2', order: 8, section: 'AS 1' },
      { title: 'Energy from the Sun - Solar Thermal', order: 9, section: 'AS 1' },
      { title: 'Energy from the Sun - Photovoltaic', order: 10, section: 'AS 1' },
      { title: 'Passive Solar Design', order: 11, section: 'AS 1' },
      { title: 'Energy from Biomass - Part 1', order: 12, section: 'AS 1' },
      { title: 'Energy from Biomass - Part 2', order: 13, section: 'AS 1' },
      { title: 'Energy Storage Systems', order: 14, section: 'AS 1' },
      { title: 'The Development of Plastics for the Future - Part 1', order: 15, section: 'AS 1' },
      { title: 'The Development of Plastics for the Future - Part 2', order: 16, section: 'AS 1' },
      { title: 'Sustainable Plastics and Biodegradable Materials', order: 17, section: 'AS 1' },
      { title: 'Bioderived Polyethylene and Circular Economy', order: 18, section: 'AS 1' },
      { title: 'AS 1 Revision: Renewable Energy', order: 19, section: 'AS 1' },
      { title: 'AS 1 Revision: Plastics and Sustainability', order: 20, section: 'AS 1' },
    ];

    // Environmental Technology AS 2 lessons (Internal Assessment)
    const as2Lessons = [
      { title: 'Technical Report Planning - Desktop Research', order: 1, section: 'AS 2' },
      { title: 'Technical Report Writing - Structure and Format', order: 2, section: 'AS 2' },
      { title: 'Practical Investigation Design', order: 3, section: 'AS 2' },
      { title: 'Wind Energy Practical Investigation', order: 4, section: 'AS 2' },
      { title: 'Solar Energy Practical Investigation', order: 5, section: 'AS 2' },
      { title: 'Biomass Energy Practical Investigation', order: 6, section: 'AS 2' },
      { title: 'Data Collection and Analysis Methods', order: 7, section: 'AS 2' },
      { title: 'Evaluating Renewable Energy Technologies', order: 8, section: 'AS 2' },
      { title: 'Drawing Conclusions and Recommendations', order: 9, section: 'AS 2' },
      { title: 'Technical Report Submission and Peer Review', order: 10, section: 'AS 2' },
    ];

    // Environmental Technology A2 1 lessons
    const a21Lessons = [
      { title: 'Sustainability and Future Development', order: 1, section: 'A2 1' },
      { title: 'Population, Resources and the I=PAT Equation', order: 2, section: 'A2 1' },
      { title: 'Ecological and Carbon Footprints', order: 3, section: 'A2 1' },
      { title: 'One Planet Living Concept', order: 4, section: 'A2 1' },
      { title: 'Waste Management Hierarchy', order: 5, section: 'A2 1' },
      { title: 'Materials Recovery Facilities and Recycling', order: 6, section: 'A2 1' },
      { title: 'Landfill Design and Engineering', order: 7, section: 'A2 1' },
      { title: 'Energy Recovery from Waste - Incineration', order: 8, section: 'A2 1' },
      { title: 'Anaerobic Digestion and Composting', order: 9, section: 'A2 1' },
      { title: 'Bioremediation of Contaminated Land', order: 10, section: 'A2 1' },
      { title: 'Phytoremediation and Biohydrometallurgy', order: 11, section: 'A2 1' },
      { title: 'Hydrogen Fuel Cells - Chemistry and Production', order: 12, section: 'A2 1' },
      { title: 'Types of Hydrogen Fuel Cells', order: 13, section: 'A2 1' },
      { title: 'Applications of Hydrogen Fuel Cells', order: 14, section: 'A2 1' },
      { title: 'Transport System Challenges and Solutions', order: 15, section: 'A2 1' },
      { title: 'Electric and Hybrid Vehicles', order: 16, section: 'A2 1' },
      { title: 'Biofuels - Bioethanol and Biodiesel', order: 17, section: 'A2 1' },
      { title: 'Sustainable Transport Strategies', order: 18, section: 'A2 1' },
      { title: 'Energy Building Performance and Conservation', order: 19, section: 'A2 1' },
      { title: 'U Values and Heat Flow in Buildings', order: 20, section: 'A2 1' },
      { title: 'BREEAM and Code for Sustainable Homes', order: 21, section: 'A2 1' },
      { title: 'Wave and Tidal Energy Technologies', order: 22, section: 'A2 1' },
      { title: 'Smart Materials and Smart Systems', order: 23, section: 'A2 1' },
      { title: 'Carbon Capture and Storage', order: 24, section: 'A2 1' },
      { title: 'Sustainable Urban Communities', order: 25, section: 'A2 1' },
      { title: 'Sustainable Rural Communities', order: 26, section: 'A2 1' },
      { title: 'Green Spaces and Urban Heat Island Effect', order: 27, section: 'A2 1' },
      { title: 'Integrated Water and Waste Management', order: 28, section: 'A2 1' },
      { title: 'A2 1 Revision: Waste Management and Remediation', order: 29, section: 'A2 1' },
      { title: 'A2 1 Revision: Sustainable Transport and Buildings', order: 30, section: 'A2 1' },
    ];

    // Environmental Technology A2 2 lessons (Internal Assessment)
    const a22Lessons = [
      { title: 'Code for Sustainable Homes Overview', order: 1, section: 'A2 2' },
      { title: 'CSH Elements and Assessment Categories', order: 2, section: 'A2 2' },
      { title: 'Selecting a Building for Assessment', order: 3, section: 'A2 2' },
      { title: 'Data Collection for CSH Assessment', order: 4, section: 'A2 2' },
      { title: 'Energy Performance Measurement', order: 5, section: 'A2 2' },
      { title: 'Water Usage and Management Assessment', order: 6, section: 'A2 2' },
      { title: 'Materials and Waste Assessment', order: 7, section: 'A2 2' },
      { title: 'Health and Wellbeing Evaluation', order: 8, section: 'A2 2' },
      { title: 'Pollution and Ecology Assessment', order: 9, section: 'A2 2' },
      { title: 'Management and Process Evaluation', order: 10, section: 'A2 2' },
      { title: 'Data Analysis and CSH Rating Calculation', order: 11, section: 'A2 2' },
      { title: 'Presenting Findings - Tables and Graphs', order: 12, section: 'A2 2' },
      { title: 'Building Performance Commentary', order: 13, section: 'A2 2' },
      { title: 'Recommending Building Enhancements', order: 14, section: 'A2 2' },
      { title: 'Technical Report Writing and Structure', order: 15, section: 'A2 2' },
    ];

    // Find or create courses
    const courses = await base44.entities.Course.filter({
      title: { $in: [
        'A-Level Environmental Technology Single Award AS',
        'A-Level Environmental Technology Double Award AS'
      ]}
    });

    // Check for single award AS
    let singleAwardAS = courses.find(c => c.title === 'A-Level Environmental Technology Single Award AS');
    if (!singleAwardAS) {
      singleAwardAS = await base44.entities.Course.create({
        title: 'A-Level Environmental Technology Single Award AS',
        description: 'CCEA A-Level Environmental Technology Single Award AS - The Earth\'s Capacity to Support Human Activity and Internal Assessment.',
        instructor: 'DYNI Team',
        instructor_avatar: 'https://ui-avatars.com/api/?name=DYNI%20Team&background=6366f1&color=fff',
        thumbnail: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800',
        qualification_type: 'alevel',
        alevel_stage: 'as',
        category: 'environmental_technology',
        level: 'advanced',
        duration_hours: 180,
        total_lessons: 30,
        price: 0,
        is_featured: true,
        exam_board: 'CCEA'
      });
    }

    // Check for double award AS
    let doubleAwardAS = courses.find(c => c.title === 'A-Level Environmental Technology Double Award AS');
    if (!doubleAwardAS) {
      doubleAwardAS = await base44.entities.Course.create({
        title: 'A-Level Environmental Technology Double Award AS',
        description: 'CCEA A-Level Environmental Technology Double Award AS - The Earth\'s Capacity to Support Human Activity and Internal Assessment.',
        instructor: 'DYNI Team',
        instructor_avatar: 'https://ui-avatars.com/api/?name=DYNI%20Team&background=6366f1&color=fff',
        thumbnail: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800',
        qualification_type: 'alevel',
        alevel_stage: 'as',
        category: 'environmental_technology',
        level: 'advanced',
        duration_hours: 180,
        total_lessons: 30,
        price: 0,
        is_featured: true,
        exam_board: 'CCEA'
      });
    }

    // Check for A2 1 courses
    const a2Courses = await base44.entities.Course.filter({
      title: { $in: [
        'A-Level Environmental Technology Single Award A2 1',
        'A-Level Environmental Technology Double Award A2 1'
      ]}
    });

    let singleAwardA21 = a2Courses.find(c => c.title === 'A-Level Environmental Technology Single Award A2 1');
    if (!singleAwardA21) {
      singleAwardA21 = await base44.entities.Course.create({
        title: 'A-Level Environmental Technology Single Award A2 1',
        description: 'CCEA A-Level Environmental Technology Single Award A2 1 - Building and Managing a Sustainable Future.',
        instructor: 'DYNI Team',
        instructor_avatar: 'https://ui-avatars.com/api/?name=DYNI%20Team&background=6366f1&color=fff',
        thumbnail: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800',
        qualification_type: 'alevel',
        alevel_stage: 'a2',
        category: 'environmental_technology',
        level: 'advanced',
        duration_hours: 270,
        total_lessons: 30,
        price: 0,
        is_featured: true,
        exam_board: 'CCEA'
      });
    }

    let doubleAwardA21 = a2Courses.find(c => c.title === 'A-Level Environmental Technology Double Award A2 1');
    if (!doubleAwardA21) {
      doubleAwardA21 = await base44.entities.Course.create({
        title: 'A-Level Environmental Technology Double Award A2 1',
        description: 'CCEA A-Level Environmental Technology Double Award A2 1 - Building and Managing a Sustainable Future.',
        instructor: 'DYNI Team',
        instructor_avatar: 'https://ui-avatars.com/api/?name=DYNI%20Team&background=6366f1&color=fff',
        thumbnail: 'https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?w=800',
        qualification_type: 'alevel',
        alevel_stage: 'a2',
        category: 'environmental_technology',
        level: 'advanced',
        duration_hours: 270,
        total_lessons: 30,
        price: 0,
        is_featured: true,
        exam_board: 'CCEA'
      });
    }

    // Create lessons for each course using bulkCreate
    const allLessons = [
      { courseId: singleAwardAS.id, lessons: [...as1Lessons, ...as2Lessons] },
      { courseId: doubleAwardAS.id, lessons: [...as1Lessons, ...as2Lessons] },
      { courseId: singleAwardA21.id, lessons: [...a21Lessons] },
      { courseId: doubleAwardA21.id, lessons: [...a21Lessons] },
    ];

    let createdCount = 0;

    for (const { courseId, lessons } of allLessons) {
      const lessonsToCreate = lessons.map(lesson => ({
        course_id: courseId,
        title: lesson.title,
        description: lesson.title,
        order: lesson.order,
        section: lesson.section,
        is_preview: true,
        content_type: 'richtext',
        slides: [{
          title: lesson.title,
          content: `<p>This lesson covers: ${lesson.title}</p>`,
          order: 1
        }]
      }));

      await base44.entities.Lesson.bulkCreate(lessonsToCreate);
      createdCount += lessonsToCreate.length;
    }

    return Response.json({
      success: true,
      message: `Environmental Technology courses and ${createdCount} lessons created/updated successfully`,
      courses: {
        singleAwardAS: singleAwardAS.id,
        doubleAwardAS: doubleAwardAS.id,
        singleAwardA21: singleAwardA21.id,
        doubleAwardA21: doubleAwardA21.id
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});