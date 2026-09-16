import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const specificationUrl = 'https://ccea.org.uk/downloads/docs/Specifications/GCE/GCE%20Life%20and%20Health%20Sciences%20%282016%29/GCE%20Life%20and%20Health%20Sciences%20%282016%29-specification-Standard_0.pdf';

const asUnits = [
  ['AS 1', 'Experimental Techniques', 'Compulsory'],
  ['AS 2', 'Human Body Systems', 'Compulsory'],
  ['AS 3', 'Aspects of Physical Chemistry in Industrial Processes', 'Compulsory'],
  ['AS 4', 'Brain Science', 'Double Award compulsory'],
  ['AS 5', 'Material Science', 'Double Award compulsory'],
  ['AS 6', 'Medicine, Drugs and Clinical Trials', 'Double Award compulsory'],
];

const a2Units = [
  ['A2 1', 'Scientific Method, Investigation, Analysis and Evaluation', 'Compulsory'],
  ['A2 2', 'Organic Chemistry', 'Compulsory'],
  ['A2 3', 'Medical Physics', 'Optional group 1'],
  ['A2 4', 'Sound and Light', 'Optional group 1'],
  ['A2 5', 'Genetics, Stem Cell Research and Cloning', 'Optional group 1'],
  ['A2 6', 'Microbiology', 'Double Award optional group 2'],
  ['A2 7', 'Oral Health and Dentistry', 'Double Award optional group 2'],
  ['A2 8', 'Histology and Pathology', 'Double Award optional group 2'],
  ['A2 9', 'Analytical Chemistry Techniques', 'Double Award optional group 2'],
  ['A2 10', 'Enabling Technology', 'Double Award optional group 2'],
];

function unitsFor(course) {
  const doubleAward = /double award/i.test(course.title || '');
  if (course.alevel_stage === 'as') return doubleAward ? asUnits : asUnits.slice(0, 3);
  return doubleAward ? a2Units : a2Units.slice(0, 5);
}

function sectionName(unit) {
  return `CCEA Unit ${unit[0]}: ${unit[1]} — ${unit[2]}`;
}

function mappedSection(course, title) {
  const text = (title || '').toLowerCase();
  const doubleAward = /double award/i.test(course.title || '');
  if (course.alevel_stage === 'as') {
    if (doubleAward && /(pathogen|bacter|viral|infect|transmission|immunity|vaccin|antibiotic|disease prevention|epidemiology)/.test(text)) return sectionName(asUnits[5]);
    if (/(cell|tissue|organ|enzyme|dna|protein|heart|cardiac|blood|respir|breath|lung|gas|digest|absorption|intestine|liver|nutrition|diet|malnutrition|food|energy balance)/.test(text)) return sectionName(asUnits[1]);
  } else {
    if (/(vision|hearing)/.test(text)) return sectionName(a2Units[3]);
    if (/(radiotherapy|cancer detection)/.test(text)) return sectionName(a2Units[2]);
    if (/(cancer biology|causes of cancer)/.test(text)) return sectionName(a2Units[4]);
    if (doubleAward && /(disorder|disease|cancer type|pathology)/.test(text)) return sectionName(a2Units[7]);
    if (/(drug effect|chemotherapy)/.test(text)) return sectionName(a2Units[1]);
  }
  return 'Supplementary foundation content — not a separate CCEA assessment unit';
}

function guideLesson(course, unit, order) {
  const routeNote = /double award/i.test(course.title || '')
    ? (course.alevel_stage === 'as'
      ? 'This is one of the six compulsory AS units in the Double Award route.'
      : unit[0] === 'A2 1' || unit[0] === 'A2 2'
        ? 'This is a compulsory A2 unit in the Double Award route.'
        : unit[0] === 'A2 3' || unit[0] === 'A2 4' || unit[0] === 'A2 5'
          ? 'Double Award learners select two units from A2 3–A2 5.'
          : 'Double Award learners select two units from A2 6–A2 10.')
    : (course.alevel_stage === 'as'
      ? 'This is one of the three compulsory AS units in the Single Award route.'
      : unit[0] === 'A2 1' || unit[0] === 'A2 2'
        ? 'This is a compulsory A2 unit in the Single Award route.'
        : 'Single Award learners select one unit from A2 3–A2 5.');
  return {
    course_id: course.id,
    title: `CCEA Unit ${unit[0]} Guide: ${unit[1]}`,
    description: `${unit[2]} unit guide for the CCEA GCE Life and Health Sciences (2016) specification.`,
    section: sectionName(unit),
    order,
    learning_objectives: [
      `Identify the official scope of Unit ${unit[0]}: ${unit[1]}`,
      'Distinguish compulsory content from optional route choices',
      'Use the official CCEA specification when planning study and assessment',
    ],
    content_type: 'richtext',
    slides: [{
      title: `Unit ${unit[0]}: ${unit[1]}`,
      order: 1,
      content: `<h2>Official CCEA unit structure</h2><p><strong>${unit[1]}</strong> is classified as <strong>${unit[2].toLowerCase()}</strong> in this course pathway.</p><p>${routeNote}</p><p>This guide organises the course; detailed teaching lessons must remain aligned to the current CCEA specification and assessment guidance.</p>`,
    }],
    resources: [{ name: 'Official CCEA Life and Health Sciences specification', url: specificationUrl, type: 'specification' }],
    is_preview: true,
    duration_minutes: 15,
  };
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const body = await req.json();
    const confirm = body.confirm === true;
    const courses = await base44.asServiceRole.entities.Course.filter({ qualification_type: 'alevel', category: 'life_health_sciences' });
    const results = [];

    for (const course of courses) {
      const units = unitsFor(course);
      const lessons = await base44.asServiceRole.entities.Lesson.filter({ course_id: course.id }, 'order', 200);
      const guideTitles = new Set(units.map(unit => `CCEA Unit ${unit[0]} Guide: ${unit[1]}`));
      const existingGuides = lessons.filter(lesson => guideTitles.has(lesson.title));
      const teachingLessons = lessons.filter(lesson => !/^CCEA Unit (AS|A2) \d+ Guide:/.test(lesson.title || ''));
      const missingUnits = units.filter(unit => !existingGuides.some(lesson => lesson.title === `CCEA Unit ${unit[0]} Guide: ${unit[1]}`));

      if (confirm) {
        if (missingUnits.length) {
          await base44.asServiceRole.entities.Lesson.bulkCreate(missingUnits.map((unit, index) => guideLesson(course, unit, units.findIndex(item => item[0] === unit[0]) + 1)));
        }
        if (existingGuides.length) {
          await base44.asServiceRole.entities.Lesson.bulkUpdate(existingGuides.map(lesson => {
            const unit = units.find(item => lesson.title === `CCEA Unit ${item[0]} Guide: ${item[1]}`);
            return { id: lesson.id, section: sectionName(unit), order: units.findIndex(item => item[0] === unit[0]) + 1 };
          }));
        }
        if (teachingLessons.length) {
          await base44.asServiceRole.entities.Lesson.bulkUpdate(teachingLessons.map((lesson, index) => ({
            id: lesson.id,
            section: mappedSection(course, lesson.title),
            order: units.length + index + 1,
          })));
        }
        await base44.asServiceRole.entities.Course.update(course.id, {
          total_lessons: lessons.length + missingUnits.length,
        });
      }

      results.push({
        course_id: course.id,
        course: course.title,
        pathway: /double award/i.test(course.title || '') ? 'Double Award' : 'Single Award',
        stage: course.alevel_stage,
        official_units: units.map(unit => ({ code: unit[0], title: unit[1], status: unit[2] })),
        preserved_lessons: teachingLessons.length,
        unit_guides_to_create: missingUnits.length,
      });
    }

    return Response.json({ success: true, applied: confirm, courses: results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

function getLifeHealthSciencesA2() {
  let o = 1;
  const lessons = [];
  
  // A2-1: Advanced Human Biology
  
  // 3.1 Nervous System (12 lessons)
  lessons.push(
    { s: 'A2-1: Nervous System', o: o++, t: 'Neuron Structure', d: 'Nerve cell anatomy', obj: ['Identify neuron components', 'Describe sensory motor relay neurons', 'Understand myelin sheath'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'Nerve Impulse', d: 'Action potential', obj: ['Explain resting potential', 'Describe depolarization repolarization', 'Understand sodium-potassium pump'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'Synaptic Transmission', d: 'Neurotransmitter release', obj: ['Explain synaptic structure', 'Describe neurotransmitter action', 'Understand synaptic plasticity'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'CNS Structure', d: 'Brain and spinal cord', obj: ['Identify brain regions', 'Describe cerebrum cerebellum', 'Understand spinal cord function'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'Brain Function', d: 'Cerebral cortex regions', obj: ['Explain motor sensory areas', 'Describe association areas', 'Understand lateralization'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'Reflex Actions', d: 'Automatic responses', obj: ['Explain reflex arc', 'Describe spinal reflexes', 'Understand protective function'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'Autonomic Nervous System', d: 'Involuntary control', obj: ['Compare sympathetic parasympathetic', 'Explain fight or flight', 'Understand rest and digest'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'Vision', d: 'Eye structure and function', obj: ['Describe eye anatomy', 'Explain photoreceptor function', 'Understand visual processing'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'Hearing', d: 'Ear structure and function', obj: ['Describe ear anatomy', 'Explain sound detection', 'Understand auditory processing'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'Neurological Disorders', d: 'Nervous system diseases', obj: ['Explain Parkinson disease', 'Describe Alzheimer disease', 'Understand multiple sclerosis'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'Mental Health', d: 'Psychological conditions', obj: ['Understand depression anxiety', 'Explain neurotransmitter imbalances', 'Describe treatment approaches'] },
    { s: 'A2-1: Nervous System', o: o++, t: 'Drug Effects', d: 'Substances affecting nervous system', obj: ['Explain stimulant depressant effects', 'Describe addiction mechanisms', 'Understand drug tolerance'] }
  );
  
  // 3.2 Endocrine System (8 lessons)
  lessons.push(
    { s: 'A2-1: Endocrine', o: o++, t: 'Endocrine Glands', d: 'Hormone-secreting organs', obj: ['Identify major endocrine glands', 'Describe hormone secretion', 'Understand target organs'] },
    { s: 'A2-1: Endocrine', o: o++, t: 'Hormone Action', d: 'Mechanisms of hormonal control', obj: ['Explain hormone-receptor binding', 'Describe second messenger systems', 'Understand hormone effects'] },
    { s: 'A2-1: Endocrine', o: o++, t: 'Blood Glucose Regulation', d: 'Insulin and glucagon', obj: ['Explain insulin function', 'Describe glucagon action', 'Understand feedback control'] },
    { s: 'A2-1: Endocrine', o: o++, t: 'Diabetes', d: 'Glucose regulation disorders', obj: ['Compare Type 1 Type 2 diabetes', 'Explain insulin resistance', 'Understand diabetes management'] },
    { s: 'A2-1: Endocrine', o: o++, t: 'Thyroid Function', d: 'Metabolic rate control', obj: ['Explain thyroxine function', 'Describe thyroid disorders', 'Understand iodine importance'] },
    { s: 'A2-1: Endocrine', o: o++, t: 'Adrenal Glands', d: 'Stress response', obj: ['Explain adrenaline effects', 'Describe cortisol function', 'Understand stress response'] },
    { s: 'A2-1: Endocrine', o: o++, t: 'Reproductive Hormones', d: 'Sex hormone control', obj: ['Explain testosterone estrogen', 'Describe menstrual cycle', 'Understand hormonal contraception'] },
    { s: 'A2-1: Endocrine', o: o++, t: 'Hormone Disorders', d: 'Endocrine diseases', obj: ['Explain growth disorders', 'Describe Cushing syndrome', 'Understand hormone therapy'] }
  );
  
  // 3.3 Kidney and Homeostasis (8 lessons)
  lessons.push(
    { s: 'A2-1: Kidney', o: o++, t: 'Kidney Structure', d: 'Renal anatomy', obj: ['Identify kidney structures', 'Describe nephron anatomy', 'Understand blood supply'] },
    { s: 'A2-1: Kidney', o: o++, t: 'Urine Formation', d: 'Filtration reabsorption secretion', obj: ['Explain glomerular filtration', 'Describe selective reabsorption', 'Understand tubular secretion'] },
    { s: 'A2-1: Kidney', o: o++, t: 'Water Balance', d: 'Osmoregulation', obj: ['Explain ADH function', 'Describe water reabsorption', 'Understand urine concentration'] },
    { s: 'A2-1: Kidney', o: o++, t: 'Kidney Disease', d: 'Renal disorders', obj: ['Explain kidney failure', 'Describe dialysis treatment', 'Understand transplantation'] },
    { s: 'A2-1: Kidney', o: o++, t: 'Temperature Regulation', d: 'Thermoregulation', obj: ['Explain heat loss mechanisms', 'Describe heat conservation', 'Understand hypothalamus role'] },
    { s: 'A2-1: Kidney', o: o++, t: 'Homeostasis Principles', d: 'Maintaining constant internal environment', obj: ['Explain negative feedback', 'Describe positive feedback', 'Understand homeostatic control'] },
    { s: 'A2-1: Kidney', o: o++, t: 'Liver Homeostasis', d: 'Metabolic regulation', obj: ['Explain glucose regulation', 'Describe detoxification', 'Understand protein metabolism'] },
    { s: 'A2-1: Kidney', o: o++, t: 'Exercise Physiology', d: 'Body responses to activity', obj: ['Explain cardiovascular changes', 'Describe respiratory adaptations', 'Understand training effects'] }
  );
  
  // A2-2: Reproduction and Health Issues
  
  // 4.1 Reproductive System (10 lessons)
  lessons.push(
    { s: 'A2-2: Reproduction', o: o++, t: 'Male Reproductive System', d: 'Anatomy and function', obj: ['Identify male reproductive organs', 'Describe sperm production', 'Understand hormone control'] },
    { s: 'A2-2: Reproduction', o: o++, t: 'Female Reproductive System', d: 'Anatomy and function', obj: ['Identify female reproductive organs', 'Describe ovum production', 'Understand menstrual cycle'] },
    { s: 'A2-2: Reproduction', o: o++, t: 'Menstrual Cycle', d: 'Hormonal regulation', obj: ['Explain FSH LH estrogen progesterone', 'Describe cycle phases', 'Understand feedback mechanisms'] },
    { s: 'A2-2: Reproduction', o: o++, t: 'Fertilization', d: 'Conception process', obj: ['Explain sperm-egg fusion', 'Describe zygote formation', 'Understand early cell division'] },
    { s: 'A2-2: Reproduction', o: o++, t: 'Pregnancy', d: 'Fetal development', obj: ['Describe implantation', 'Explain placenta function', 'Understand stages of pregnancy'] },
    { s: 'A2-2: Reproduction', o: o++, t: 'Birth', d: 'Parturition process', obj: ['Explain labor stages', 'Describe hormone roles', 'Understand postnatal care'] },
    { s: 'A2-2: Reproduction', o: o++, t: 'Contraception', d: 'Birth control methods', obj: ['Compare contraceptive methods', 'Explain effectiveness rates', 'Understand mechanism of action'] },
    { s: 'A2-2: Reproduction', o: o++, t: 'Infertility', d: 'Reproductive problems', obj: ['Identify infertility causes', 'Describe assisted reproduction', 'Understand IVF process'] },
    { s: 'A2-2: Reproduction', o: o++, t: 'Sexually Transmitted Infections', d: 'STI prevention and treatment', obj: ['Identify common STIs', 'Explain transmission prevention', 'Describe treatment options'] },
    { s: 'A2-2: Reproduction', o: o++, t: 'Reproductive Health', d: 'Maintaining reproductive wellness', obj: ['Explain screening programs', 'Describe health promotion', 'Understand reproductive rights'] }
  );
  
  // 4.2 Cancer (8 lessons)
  lessons.push(
    { s: 'A2-2: Cancer', o: o++, t: 'Cancer Biology', d: 'Uncontrolled cell growth', obj: ['Explain tumor formation', 'Describe benign vs malignant', 'Understand metastasis'] },
    { s: 'A2-2: Cancer', o: o++, t: 'Causes of Cancer', d: 'Carcinogens and risk factors', obj: ['Identify environmental carcinogens', 'Explain genetic factors', 'Understand lifestyle risks'] },
    { s: 'A2-2: Cancer', o: o++, t: 'Cancer Types', d: 'Common cancers', obj: ['Describe lung cancer', 'Explain breast cancer', 'Understand colorectal cancer'] },
    { s: 'A2-2: Cancer', o: o++, t: 'Cancer Detection', d: 'Screening and diagnosis', obj: ['Explain screening programs', 'Describe diagnostic tests', 'Understand early detection importance'] },
    { s: 'A2-2: Cancer', o: o++, t: 'Cancer Treatment Surgery', d: 'Surgical interventions', obj: ['Explain tumor removal', 'Describe surgical approaches', 'Understand reconstructive surgery'] },
    { s: 'A2-2: Cancer', o: o++, t: 'Cancer Treatment Radiotherapy', d: 'Radiation therapy', obj: ['Explain radiation effects on cells', 'Describe treatment delivery', 'Understand side effects'] },
    { s: 'A2-2: Cancer', o: o++, t: 'Cancer Treatment Chemotherapy', d: 'Drug therapy', obj: ['Explain chemotherapy action', 'Describe drug types', 'Understand side effects management'] },
    { s: 'A2-2: Cancer', o: o++, t: 'Cancer Prevention', d: 'Reducing cancer risk', obj: ['Explain lifestyle modifications', 'Describe vaccination HPV', 'Understand risk reduction strategies'] }
  );
  
  return lessons;
}