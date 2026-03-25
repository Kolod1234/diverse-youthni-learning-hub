import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const historyCourses = [
      { title: 'A-Level History AS', category: 'history', stage: 'as' },
      { title: 'A-Level History A2', category: 'history', stage: 'a2' },
    ];

    const results = [];

    // Create courses only (no lessons)
    for (const courseInfo of historyCourses) {
      try {
        let course = await base44.asServiceRole.entities.Course.filter({
          title: courseInfo.title,
          qualification_type: 'alevel'
        }).then(courses => courses[0]);

        if (!course) {
          course = await base44.entities.Course.create({
            title: courseInfo.title,
            description: `CCEA A-Level ${courseInfo.stage === 'as' ? 'AS' : 'A2'} History`,
            category: courseInfo.category,
            qualification_type: 'alevel',
            alevel_stage: courseInfo.stage,
            exam_board: 'CCEA',
            level: courseInfo.stage === 'as' ? 'intermediate' : 'advanced',
            total_lessons: 0
          });
          results.push({ course: courseInfo.title, status: 'created' });
        } else {
          results.push({ course: courseInfo.title, status: 'exists' });
        }

      } catch (error) {
        results.push({
          course: courseInfo.title,
          status: 'error',
          error: error.message
        });
      }
    }

    return Response.json({ success: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getHistoryAS() {
  let o = 1;
  return [
    { section: 'British History', order: o++, title: 'Medieval England 1066-1485', description: 'Feudalism and monarchy', learning_objectives: ['Understand feudal system', 'Analyze royal authority', 'Evaluate social structure'] },
    { section: 'British History', order: o++, title: 'Tudor Dynasty 1485-1603', description: 'Political consolidation and religious change', learning_objectives: ['Examine Tudor policies', 'Understand Reformation', 'Evaluate stability'] },
    { section: 'British History', order: o++, title: 'Stuart Period 1603-1688', description: 'Civil War and revolution', learning_objectives: ['Analyze conflict', 'Understand causes', 'Evaluate outcomes'] },
    { section: 'British History', order: o++, title: 'Georgian Britain 1714-1837', description: 'Industry and social change', learning_objectives: ['Examine industrialization', 'Understand social impact', 'Evaluate modernity'] },
    { section: 'British History', order: o++, title: 'Victorian Era 1837-1901', description: 'Empire and domestic reform', learning_objectives: ['Analyze imperialism', 'Understand reform', 'Evaluate progress'] },
    { section: 'European History', order: o++, title: 'French Revolution and Napoleonic Wars', description: 'Revolutionary change and European impact', learning_objectives: ['Understand causes', 'Analyze consequences', 'Evaluate influence'] },
    { section: 'European History', order: o++, title: 'German History 1815-1890', description: 'Unification and nationalism', learning_objectives: ['Examine unification', 'Understand nationalism', 'Evaluate Bismarck'] },
    { section: 'European History', order: o++, title: 'Russian History to 1917', description: 'Autocracy and revolution', learning_objectives: ['Examine autocracy', 'Understand revolution', 'Evaluate impact'] },
    { section: 'World History', order: o++, title: 'American Independence and Expansion', description: 'Revolution and westward growth', learning_objectives: ['Analyze independence', 'Understand expansion', 'Evaluate consequences'] },
    { section: 'World History', order: o++, title: 'Irish History to Independence', description: 'Colonialism and nationalism', learning_objectives: ['Analyze colonialism', 'Understand nationalism', 'Evaluate independence'] },
  ];
}

function getHistoryA2() {
  let o = 1;
  return [
    { section: 'British Depth Study', order: o++, title: 'English Civil War and Commonwealth', description: 'Constitutional and religious conflict', learning_objectives: ['Examine causes', 'Analyze ideologies', 'Evaluate legacy'] },
    { section: 'Ancient World', order: o++, title: 'Ancient Greece: The Age of Pericles', description: 'Democracy and classical civilization', learning_objectives: ['Understand democracy', 'Analyze culture', 'Evaluate influence'] },
    { section: 'Ancient World', order: o++, title: 'Rome: Republic to Empire', description: 'Political transformation and expansion', learning_objectives: ['Examine republic', 'Understand empire', 'Evaluate Augustus'] },
    { section: 'American Studies', order: o++, title: 'American Presidency 1901-1945', description: 'Executive power and international relations', learning_objectives: ['Analyze presidency', 'Understand policies', 'Evaluate impact'] },
    { section: 'European Studies', order: o++, title: 'Weimar Germany and the Rise of Hitler', description: 'Interwar crisis and Nazi ascension', learning_objectives: ['Examine Weimar', 'Understand crisis', 'Analyze fascism'] },
    { section: 'European Studies', order: o++, title: 'Soviet Union under Stalin', description: 'Communist state building and totalitarianism', learning_objectives: ['Understand ideology', 'Analyze policies', 'Evaluate totalitarianism'] },
    { section: 'Colonial History', order: o++, title: 'British Empire and Decolonization', description: 'Imperial power and independence movements', learning_objectives: ['Examine imperialism', 'Understand decolonization', 'Evaluate legacy'] },
    { section: 'Cold War', order: o++, title: 'Cold War Origins and Developments', description: 'Superpower rivalry and global tensions', learning_objectives: ['Understand causes', 'Analyze developments', 'Evaluate impact'] },
  ];
}