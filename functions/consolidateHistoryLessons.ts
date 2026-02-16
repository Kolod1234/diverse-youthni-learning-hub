import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (user?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { course_id } = await req.json();

    // Fetch current lessons
    const currentLessons = await base44.entities.Lesson.filter({ course_id });
    
    // Delete all current lessons with rate limit protection
    const deleteBatchSize = 10;
    for (let i = 0; i < currentLessons.length; i += deleteBatchSize) {
      const batch = currentLessons.slice(i, i + deleteBatchSize);
      await Promise.all(batch.map(lesson => base44.entities.Lesson.delete(lesson.id)));
      // Delay between deletion batches
      if (i + deleteBatchSize < currentLessons.length) {
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }

    // Get course details
    const course = await base44.entities.Course.get(course_id);
    
    // Define consolidated topics based on course
    let consolidatedTopics = [];
    
    if (course.alevel_stage === 'as') {
      // AS-Level consolidated topics
      consolidatedTopics = [
        { title: 'Medieval England: Political Development (1066-1485)', section: 'AS 1', order: 1 },
        { title: 'Early Tudor England (1485-1558)', section: 'AS 1', order: 2 },
        { title: 'Elizabethan England (1558-1603)', section: 'AS 1', order: 3 },
        { title: 'Early Stuart England (1603-1649)', section: 'AS 1', order: 4 },
        { title: 'The English Civil War & Commonwealth (1649-1660)', section: 'AS 1', order: 5 },
        { title: 'The Restoration & Glorious Revolution (1660-1689)', section: 'AS 1', order: 6 },
        { title: 'The Irish Question: Catholic Emancipation (1823-1834)', section: 'AS 2', order: 7 },
        { title: 'Ireland: Repeal & the Great Famine (1835-1867)', section: 'AS 2', order: 8 },
        { title: 'Irish Land Reform & Home Rule (1867-1900)', section: 'AS 2', order: 9 },
        { title: 'Imperial Germany: Rise & Consolidation (1871-1890)', section: 'AS 1', order: 10 },
        { title: 'Imperial Germany: Foreign Policy (1890-1914)', section: 'AS 1', order: 11 },
        { title: 'Imperial Russia: Modernization & Crisis (1855-1917)', section: 'AS 1', order: 12 },
        { title: 'The Russian Revolution (1917) & Early Bolshevism', section: 'AS 1', order: 13 },
        { title: 'Cold War Origins & Early Tensions (1945-1962)', section: 'AS 2', order: 14 },
        { title: 'Cold War Conflicts & Détente (1962-1989)', section: 'AS 2', order: 15 },
      ];
    } else if (course.alevel_stage === 'a2') {
      // A2-Level consolidated topics
      consolidatedTopics = [
        { title: 'Crown & Parliament: Stuart Conflict (1603-1689)', section: 'A2 1', order: 1 },
        { title: 'Crown & Parliament: 18th Century Stability (1689-1789)', section: 'A2 1', order: 2 },
        { title: 'Parliamentary Reform & Democracy (1789-1928)', section: 'A2 1', order: 3 },
        { title: 'The British Constitution & Cabinet Government (1900-2000)', section: 'A2 1', order: 4 },
        { title: 'Irish Independence Movement (1912-1921)', section: 'A2 2', order: 5 },
        { title: 'Ireland: Early State Formation (1921-1949)', section: 'A2 2', order: 6 },
        { title: 'Ireland: Modern Political Development (1949-2000)', section: 'A2 2', order: 7 },
        { title: 'The American Presidency: Creation & Early Development (1776-1865)', section: 'A2 2', order: 8 },
        { title: 'The American Presidency: Expansion & Reform (1865-1945)', section: 'A2 2', order: 9 },
        { title: 'The American Presidency: Cold War Era (1945-1991)', section: 'A2 2', order: 10 },
        { title: 'Nazi Germany: Rise of Hitler (1919-1933)', section: 'A2 1', order: 11 },
        { title: 'Nazi Germany: Consolidation & Foreign Policy (1933-1939)', section: 'A2 1', order: 12 },
        { title: 'Nazi Germany: World War II & Collapse (1939-1945)', section: 'A2 1', order: 13 },
        { title: 'Soviet Union: Stalin & Industrialization (1924-1941)', section: 'A2 1', order: 14 },
        { title: 'Soviet Union: World War II & Cold War (1941-1991)', section: 'A2 1', order: 15 },
        { title: 'Britain & Europe: From Empire to Integration (1945-2000)', section: 'A2 1', order: 16 },
      ];
    }

    // Create new consolidated lessons
    const newLessons = consolidatedTopics.map(topic => ({
      course_id,
      title: topic.title,
      description: topic.title,
      section: topic.section,
      order: topic.order,
      content_type: 'richtext',
      is_preview: true,
      slides: [
        {
          title: topic.title,
          content: `<p>This lesson covers: ${topic.title}</p>`,
          order: 1
        }
      ],
      learning_objectives: [
        `Understand the key concepts and developments of ${topic.title}`,
        `Analyze the causes and consequences of major events in ${topic.title}`,
        `Evaluate different interpretations and historiographical perspectives on ${topic.title}`
      ]
    }));

    // Batch create lessons with delay to avoid rate limits
    const batchSize = 5;
    for (let i = 0; i < newLessons.length; i += batchSize) {
      const batch = newLessons.slice(i, i + batchSize);
      await base44.entities.Lesson.bulkCreate(batch);
      // Delay between batches to avoid rate limiting
      if (i + batchSize < newLessons.length) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    // Update course with new lesson count
    await base44.entities.Course.update(course_id, {
      total_lessons: newLessons.length
    });

    return Response.json({
      success: true,
      message: `Consolidated ${currentLessons.length} lessons into ${newLessons.length} topical units`,
      deleted_count: currentLessons.length,
      created_count: newLessons.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});