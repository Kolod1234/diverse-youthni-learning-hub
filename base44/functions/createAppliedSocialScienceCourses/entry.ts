import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const urls = {
  criminology: 'https://www.wjec.co.uk/media/21xjkr24/wjec-applied-diploma-in-criminology-spec-e-22-06-22-1.pdf',
  psychology: 'https://www.wjec.co.uk/media/y1nk51u4/as-a-level-psychology-specification.pdf',
  health: 'https://ccea.org.uk/downloads/docs/Specifications/GCE/GCE%20Health%20and%20Social%20Care%20%282016%29/GCE%20Health%20and%20Social%20Care%20%282016%29-specification-Standard_3.pdf',
};

const curricula = {
  criminology_certificate: {
    course: ['WJEC Level 3 Applied Certificate in Criminology', 'WJEC', 'criminology', 'as', 180, 'The official 180 GLH Applied Certificate route. This is the first half of the Diploma and is equivalent in size to one AS level; it is not titled AS by WJEC.'],
    lessons: [
      ['Unit 1: Changing Awareness of Crime — Mandatory, internally assessed', 'Changing Awareness of Crime', 'Types of crime; reasons crime is unreported; consequences of unreported crime; media representation; public perception; campaigns for change; planning and justifying a campaign.'],
      ['Unit 2: Criminological Theories — Mandatory, externally assessed', 'Criminological Theories', 'Social construction of criminality; biological, individualistic and sociological theories; evaluating evidence; applying theories to crime; policy development; 90-minute external assessment.'],
    ],
  },
  criminology_diploma: {
    course: ['WJEC Level 3 Applied Diploma in Criminology — Diploma Extension', 'WJEC', 'criminology', 'a2', 180, 'The second 180 GLH of the official Applied Diploma. Learners complete this after Certificate Units 1 and 2; WJEC does not title this stage A2.'],
    lessons: [
      ['Unit 3: Crime Scene to Courtroom — Mandatory, internally assessed', 'Crime Scene to Courtroom', 'Personnel and techniques in criminal investigations; processing evidence; rights of individuals; prosecution; trial processes; rules of evidence; validity of information; drawing conclusions and reviewing verdicts.'],
      ['Unit 4: Crime and Punishment — Mandatory, externally assessed', 'Crime and Punishment', 'Law making; organisation and roles of criminal justice agencies; models of criminal justice; aims and forms of punishment; effectiveness; social control; policy evaluation; 90-minute external assessment.'],
    ],
  },
  psychology_as: {
    course: ['WJEC AS Psychology', 'WJEC', 'psychology', 'as', 180, 'Official WJEC AS Psychology covering Units 1 and 2, including the five approaches, classic evidence, debates and research methods.'],
    lessons: [
      ['AS Unit 1: Psychology — Past to Present', 'Psychology: Past to Present', 'Biological, psychodynamic, behaviourist, cognitive and positive approaches; assumptions, therapies, classic research, strengths, weaknesses, comparisons and conclusions.'],
      ['AS Unit 2: Psychology — Using Psychological Concepts', 'Using Psychological Concepts', 'Contemporary debates; principles of research; social and developmental psychology; applying research methods to novel scenarios; ethics, reliability, validity and data handling.'],
    ],
  },
  psychology_a2: {
    course: ['WJEC A2 Psychology', 'WJEC', 'psychology', 'a2', 180, 'Official WJEC A2 Psychology covering real-world behaviours, controversies, personal investigations and advanced research methods.'],
    lessons: [
      ['A2 Unit 3: Psychology — Implications in the Real World', 'Implications in the Real World', 'Study of behaviours: addictive, autistic spectrum, bullying, criminal, schizophrenia and stress; biological, individual-differences and social explanations; methods of modifying behaviour; controversies in psychology.'],
      ['A2 Unit 4: Psychology — Applied Research Methods', 'Applied Research Methods', 'Personal investigations using current WJEC titles; planning, conducting and evaluating investigations; inferential and descriptive analysis; applying research methods to novel scenarios; scientific reporting and ethics.'],
    ],
  },
  health_as: {
    course: ['CCEA AS Health and Social Care — Single & Double Award', 'CCEA', 'health_social_care', 'as', 360, 'Official CCEA AS portal containing the three-unit Single Award and the six-unit Double Award pathway, with optional units clearly labelled.'],
    lessons: [
      ['AS 1 — Compulsory for Single and Double Award', 'Promoting Quality Care', 'Values of care; legislation and policy; service-user rights; barriers; discrimination; promoting quality practice; internally assessed evidence.'],
      ['AS 2 — Compulsory for Single and Double Award', 'Communication in Health, Social Care and Early Years Settings', 'Communication types, skills and theory; factors affecting communication; barriers and strategies; observing and evaluating practice; internally assessed evidence.'],
      ['AS 3 — Compulsory for Single and Double Award', 'Health and Well-Being', 'Concepts of health and well-being; needs across life stages; factors affecting health; health promotion; service support; external assessment.'],
      ['AS 4 — Compulsory for Double Award', 'Safeguarding Children', 'Forms and indicators of abuse; vulnerability and risk; legislation, policy and procedures; responding to disclosure; professional roles; externally assessed application.'],
      ['AS 5 — Double Award option: choose AS 5 or AS 7', 'Adult Service Users', 'Needs of adult service users; factors affecting needs; services and practitioners; values of care; legislation, policy and support planning; external assessment.'],
      ['AS 6 — Compulsory for Double Award', 'Holistic Therapies', 'Principles and types of holistic therapy; potential benefits and limitations; regulation, safety, ethics; planning and evaluating a suitable therapy programme; internal assessment.'],
      ['AS 7 — Double Award option: choose AS 5 or AS 7', 'Understanding the Physiology of Health and Illness', 'Body organisation, physiological functioning, health monitoring, causes and effects of illness, treatment and care; external assessment.'],
    ],
  },
  health_a2: {
    course: ['CCEA A2 Health and Social Care — Single & Double Award', 'CCEA', 'health_social_care', 'a2', 360, 'Official CCEA A2 portal containing Single and Double Award routes. Unit A2 3 is compulsory for both; option rules are stated on every relevant unit.'],
    lessons: [
      ['A2 1 — Single Award option; compulsory for Double Award', 'Applied Research', 'Research process in health and social care; aims, literature review, methods, sampling, ethics, data presentation, analysis, conclusions and evaluation; internal assessment.'],
      ['A2 2 — Single Award option; compulsory for Double Award', 'Body Systems and Physiological Disorders', 'Structure and function of body systems; physiological disorders; diagnosis, treatment, care pathways and effects on service users; internal assessment.'],
      ['A2 3 — Compulsory for Single and Double Award', 'Providing Services', 'Service provision in Northern Ireland; needs assessment, planning, commissioning, regulation, funding, policy, practitioners, quality and access; external assessment.'],
      ['A2 4 — Single Award option; compulsory for Double Award', 'Public Health and Health Promotion', 'Public-health concepts, epidemiological evidence, inequalities, strategies, campaigns, planning and evaluating health promotion; external assessment.'],
      ['A2 5 — Single Award option; compulsory for Double Award', 'Supporting the Family', 'Family structures and functions; pressures and change; family needs; statutory, voluntary and informal support; policy and evaluation; internal assessment.'],
      ['A2 6 — Double Award option: choose A2 6 or A2 7', 'Understanding Human Behaviour', 'Psychological perspectives on human behaviour; development, learning, stress, mental health, relationships and applying theory to care; external assessment.'],
      ['A2 7 — Double Award option: choose A2 6 or A2 7', 'Human Nutrition and Health', 'Nutrients and requirements; dietary needs through life; diet-related disorders; assessment of nutritional status; food choice; health promotion and care; external assessment.'],
    ],
  },
};

const responseSchema = {
  type: 'object', properties: { lessons: { type: 'array', items: { type: 'object', properties: {
    title: { type: 'string' }, description: { type: 'string' }, learning_objectives: { type: 'array', items: { type: 'string' } },
    slides: { type: 'array', items: { type: 'object', properties: { title: { type: 'string' }, content: { type: 'string' } }, required: ['title', 'content'] } },
  }, required: ['title', 'description', 'learning_objectives', 'slides'] } } }, required: ['lessons'],
};

function courseRecord(key) {
  const item = curricula[key];
  const [title, board, category, stage, hours, description] = item.course;
  return { title, description, qualification_type: 'alevel', alevel_stage: stage, category, level: 'advanced', exam_board: board,
    duration_hours: hours, total_lessons: item.lessons.length, price: 0, is_featured: false,
    tags: [board, category === 'health_social_care' ? 'Health and Social Care' : category[0].toUpperCase() + category.slice(1), stage === 'as' ? 'Year 1' : 'Year 2', 'Official specification'],
    syllabus_url: category === 'criminology' ? urls.criminology : category === 'psychology' ? urls.psychology : urls.health };
}

function promptFor(key, selected) {
  const course = curricula[key].course;
  return `Write complete textbook-quality lessons for learners aged 16–19 following ${course[0]} (${course[1]}). Use the exact official unit scope supplied. Do not rename the qualification or present WJEC Criminology as an AS/A2 qualification.

For EACH requested lesson return exactly one lesson with the exact title and 7 substantive navigation pages: 1 orientation, prior knowledge and precise definitions; 2 connected core teaching; 3 processes, causes and intermediate reasoning; 4 theories, professional practice or evidence compared; 5 an authentic applied case study with limitations and safeguarding/ethical context where relevant; 6 one complete original assessment-style task with annotated model response; 7 varied original practice questions with complete model answers and transparent criteria. Write at least 280 words per page and 1,900 words per lesson; check the completed word count before returning the response. Teach before testing. Distinguish evidence from inference and correlation from causation. Use Northern Ireland context for CCEA and Wales/England jurisdiction accurately for WJEC. Never fabricate studies, law, quotations, statistics or official questions. Label original assessment practice as original. British English. Accessible HTML only: h2, h3, p, ul, ol, table, strong, em, blockquote, details, summary. No markdown, scripts, SVG, images or placeholders.

${selected.map((x, i) => `${i + 1}. SECTION: ${x[0]}\nEXACT TITLE: ${x[1]}\nOFFICIAL SCOPE: ${x[2]}`).join('\n\n')}`;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
    const body = await req.json();
    const key = String(body.course || '');
    if (!curricula[key]) return Response.json({ error: 'Unknown course', courses: Object.keys(curricula) }, { status: 400 });
    const start = Math.max(0, Number(body.start) || 0);
    const count = Math.min(2, Math.max(1, Number(body.count) || 1));
    const selected = curricula[key].lessons.slice(start, start + count);
    if (!body.confirm) return Response.json({ course: key, start, count: selected.length, total: curricula[key].lessons.length, outline: selected });
    if (!selected.length) return Response.json({ error: 'Batch is outside the course outline' }, { status: 400 });

    const data = courseRecord(key);
    const matches = await base44.asServiceRole.entities.Course.filter({ title: data.title });
    const course = matches[0] || await base44.asServiceRole.entities.Course.create(data);
    const existing = await base44.asServiceRole.entities.Lesson.filter({ course_id: course.id }, 'order', 100);
    const missing = selected.filter(item => !existing.some(lesson => lesson.title === item[1]));
    if (!missing.length) return Response.json({ success: true, course_id: course.id, created: 0, skipped: selected.length });

    const generated = await base44.asServiceRole.integrations.Core.InvokeLLM({ prompt: promptFor(key, missing), response_json_schema: responseSchema, model: 'automatic' });
    if (!generated?.lessons || generated.lessons.length !== missing.length) throw new Error('Lesson generation returned an incomplete batch');
    const records = generated.lessons.map((lesson, index) => {
      const outline = missing[index];
      if (lesson.title !== outline[1] || !Array.isArray(lesson.slides) || lesson.slides.length !== 7) throw new Error(`Lesson validation failed for ${outline[1]}`);
      const words = lesson.slides.reduce((n, slide) => n + slide.content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length, 0);
      if (words < 1200) throw new Error(`Lesson is too short for publication: ${outline[1]} (${words} words)`);
      return { course_id: course.id, title: lesson.title, description: lesson.description, learning_objectives: lesson.learning_objectives,
        section: outline[0], order: curricula[key].lessons.findIndex(item => item[1] === outline[1]) + 1, content_type: 'richtext', duration_minutes: 90,
        is_preview: start === 0 && index === 0, resources: [{ name: `Official ${data.exam_board} specification`, url: data.syllabus_url, type: 'specification' }],
        slides: lesson.slides.map((slide, slideIndex) => ({ title: slide.title, content: slide.content, order: slideIndex + 1 })) };
    });
    await base44.asServiceRole.entities.Lesson.bulkCreate(records);
    await base44.asServiceRole.entities.Course.update(course.id, { total_lessons: curricula[key].lessons.length });
    return Response.json({ success: true, course_id: course.id, course: data.title, created: records.length, total: curricula[key].lessons.length, titles: records.map(x => x.title) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}