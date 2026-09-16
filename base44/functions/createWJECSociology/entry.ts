import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const specificationUrl = 'https://www.wjec.co.uk/media/owifffk1/wjec-gce-sociology-spec-from-2015-e-09-06-2020.pdf';
const teacherGuideUrl = 'https://www.wjec.co.uk/media/sqml5nhl/wjec_gce_sociology_teacher-guide.pdf';

const outlines = {
  as: [
    ['AS Unit 1: Acquiring Culture — Compulsory', 'Culture as a Social Construction', 'Culture, norms, values, beliefs, roles, status, cultural diversity, subcultures, nature and nurture, and Welsh examples'],
    ['AS Unit 1: Acquiring Culture — Compulsory', 'Socialisation and Cultural Transmission', 'Primary and secondary socialisation, agencies, sanctions, social control, consensus, conflict and interactionist interpretations'],
    ['AS Unit 1: Acquiring Culture — Compulsory', 'Identity and Its Social Formation', 'Class, gender, ethnicity, nationality, age, disability, hybridity, intersectionality and changing identities'],
    ['AS Unit 1 Option: Families and Households', 'Family Forms, Diversity and Demographic Change', 'Family diversity, marriage, divorce, cohabitation, fertility, life expectancy and singlehood in England and Wales'],
    ['AS Unit 1 Option: Families and Households', 'Relationships and Theories of Families', 'Domestic labour, power, childhood, social change, functionalism, Marxism, feminism, New Right and postmodernism'],
    ['AS Unit 1 Option: Youth Cultures', 'Formation and Change of Youth Cultures', 'Media, economic change, globalisation, class, gender, ethnicity, nationality, neo-tribes and changing youth cultures'],
    ['AS Unit 1 Option: Youth Cultures', 'Youth Subcultures, Deviance and Theory', 'Delinquency, crime, education, media, functionalist, Marxist, feminist, interactionist and postmodernist perspectives'],
    ['AS Unit 2: Methods of Sociological Enquiry — Compulsory', 'Planning Sociological Research', 'Research aims, hypotheses, operationalisation, pilot studies, sampling, access, ethics and practical constraints'],
    ['AS Unit 2: Methods of Sociological Enquiry — Compulsory', 'Quantitative Research Methods', 'Questionnaires, structured interviews, experiments, official statistics, reliability, representativeness and correlation'],
    ['AS Unit 2: Methods of Sociological Enquiry — Compulsory', 'Qualitative Research Methods', 'Participant observation, unstructured interviews, documents, validity, reflexivity, researcher effects and triangulation'],
    ['AS Unit 2: Methods of Sociological Enquiry — Compulsory', 'Evaluating Evidence and Research Synopses', 'Theory and method, positivism, interpretivism, values, validity, reliability, ethics and application to stimulus research'],
    ['AS Unit 2 Option: Education', 'Education, Inequality, Policy and Theory', 'Role of education, achievement patterns, processes within schools, policy in Wales and England, functionalism, Marxism, feminism and interactionism'],
    ['AS Unit 2 Option: Media', 'Media Power, Representation and Audiences', 'Media effects, audiences, moral panics, new media, globalisation, ownership, control, representation, policy and competing theories'],
    ['AS Unit 2 Option: Religion', 'Religion, Participation, Organisations and Theory', 'Role of religion, religiosity, class, gender, ethnicity, age, organisations, fundamentalism, secularisation, policy and theory'],
    ['AS Units 1–2: Assessment', 'Building Sociological Arguments', 'Using concepts, theory and evidence to apply, analyse, evaluate, compare and reach justified conclusions'],
    ['AS Units 1–2: Assessment', 'WJEC AS Examination Practice', 'Unit 1 structured and essay responses; Unit 2 research-stimulus analysis and understanding society essays using original practice material'],
  ],
  a2: [
    ['A2 Unit 3: Power and Control — Compulsory Framework', 'Power, Control, Differentiation and Stratification', 'Power, authority, ideology, social control, structure, action, conflict, consensus, policy and contemporary society'],
    ['A2 Unit 3 Option: Crime and Deviance', 'Defining and Measuring Crime and Deviance', 'Social construction, official statistics, victim surveys, self-report studies, media influence and measurement limitations'],
    ['A2 Unit 3 Option: Crime and Deviance', 'Social Distribution of Crime', 'Patterns by class, gender, ethnicity and age in England and Wales, explanations, labelling and policy implications'],
    ['A2 Unit 3 Option: Crime and Deviance', 'Theories, Explanations and Crime Policy', 'Functionalism, Marxism, neo-Marxism, interactionism, realism, feminism, subcultural and postmodern approaches'],
    ['A2 Unit 3 Option: Health and Disability', 'Patterns and Inequalities in Health', 'Official evidence and patterns by class, gender, ethnicity and age; artefact, selection, cultural and material explanations'],
    ['A2 Unit 3 Option: Health and Disability', 'Social Construction and Medicalisation', 'Definitions of health, illness and disability, medicalisation, professional power, access, provision and health policy'],
    ['A2 Unit 3 Option: Health and Disability', 'Theories of Health and Disability', 'Functionalist, Marxist, interactionist, feminist, postmodernist and biomedical models with comparative evaluation'],
    ['A2 Unit 3 Option: World Sociology', 'Global Inequality and Development', 'Patterns of global inequality, development indicators, poverty, gender, health, education and debates about measuring development'],
    ['A2 Unit 3 Option: World Sociology', 'Globalisation, Power and Social Change', 'Transnational corporations, states, international institutions, migration, culture, environment and uneven globalisation'],
    ['A2 Unit 3 Option: World Sociology', 'Theories and Policies of Development', 'Modernisation, dependency, world-systems, neoliberal, feminist, post-development approaches and policy evaluation'],
    ['A2 Unit 4: Applied Methods — Compulsory', 'Designing Applied Sociological Research', 'Developing a research question, operationalising concepts, selecting samples and choosing justified mixed or single methods'],
    ['A2 Unit 4: Applied Methods — Compulsory', 'Justifying and Evaluating Research Designs', 'Practical, ethical and theoretical issues; validity, reliability, representativeness, generalisability and improvements'],
    ['A2 Unit 4: Social Inequality — Compulsory', 'Evidence and Dimensions of Social Inequality', 'Class, gender, ethnicity, age and nation using evidence from education, work, income, wealth, health and power'],
    ['A2 Unit 4: Social Inequality — Compulsory', 'Class and Stratification', 'Measuring class, social mobility, life chances, functionalist, Marxist, Weberian and postmodern explanations'],
    ['A2 Unit 4: Social Inequality — Compulsory', 'Gender, Ethnicity and Age Inequalities', 'Patterns, intersectionality, patriarchy, racism, ageism, labour markets, institutions, identity and competing explanations'],
    ['A2 Units 3–4: Assessment', 'WJEC A2 Synoptic Examination Practice', 'Unit 3 power-and-control responses and Unit 4 research-design and inequality essays using original practice material and full model answers'],
  ],
};

const responseSchema = {
  type: 'object',
  properties: {
    lessons: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          description: { type: 'string' },
          learning_objectives: { type: 'array', items: { type: 'string' } },
          slides: {
            type: 'array',
            items: {
              type: 'object',
              properties: { title: { type: 'string' }, content: { type: 'string' } },
              required: ['title', 'content'],
            },
          },
        },
        required: ['title', 'description', 'learning_objectives', 'slides'],
      },
    },
  },
  required: ['lessons'],
};

function courseData(stage) {
  return {
    title: `WJEC ${stage === 'as' ? 'AS' : 'A2'} Sociology`,
    description: stage === 'as'
      ? 'A specification-aligned WJEC AS Sociology course covering Acquiring Culture, Understanding Society and Methods of Sociological Enquiry, with every official option clearly labelled.'
      : 'A specification-aligned WJEC A2 Sociology course covering Power and Control, Social Inequality and Applied Methods of Sociological Enquiry, with every current official option clearly labelled.',
    qualification_type: 'alevel', alevel_stage: stage, category: 'sociology', level: 'advanced', exam_board: 'WJEC',
    duration_hours: stage === 'as' ? 180 : 180, total_lessons: outlines[stage].length, price: 0, is_featured: false,
    tags: ['WJEC', 'Sociology', stage === 'as' ? 'AS Level' : 'A2 Level', 'Wales', 'Specification aligned'],
    syllabus_url: specificationUrl,
  };
}

function generationPrompt(stage, selected) {
  return `Create complete textbook-quality lessons for WJEC ${stage.toUpperCase()} Sociology learners aged 16–18. Use ONLY the official scope supplied below and accurate established sociology. The WJEC specification is taught from 2015, version 3 June 2020. It requires contemporary society and reference to Wales where applicable. Politics is obsolete and must not appear as a current Unit 3 option.

For EACH requested lesson, return exactly one lesson with the exact title. Create 7 substantive navigation pages in slides: (1) orientation and prior knowledge; (2) connected explanation of core concepts; (3) mechanisms, processes and causal reasoning; (4) named theoretical perspectives compared fairly; (5) evidence, methods, limitations and Wales/England application where relevant; (6) a complete original worked examination-style task with an annotated model response; (7) original practice questions followed by complete worked/model answers and transparent assessment criteria. Write at least 220 words on every page and at least 1,500 words across each lesson. Each page must contain coherent teaching prose, not bullet-note slides. Define terms before using them, distinguish evidence from interpretation, explain competing arguments and limitations, and avoid deterministic claims. Use accessible HTML only: h2, h3, p, ul, ol, table, strong, em, blockquote, details and summary. Do not include markdown, scripts, SVG, image placeholders, fabricated quotations, invented study findings, or claims that original questions are official WJEC examination questions. British English only.

Requested lessons:\n${selected.map((item, index) => `${index + 1}. SECTION: ${item[0]}\nEXACT TITLE: ${item[1]}\nOFFICIAL SCOPE: ${item[2]}`).join('\n\n')}`;
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });
    const body = await req.json();
    const stage = body.stage === 'a2' ? 'a2' : 'as';
    const start = Math.max(0, Number(body.start) || 0);
    const count = Math.min(2, Math.max(1, Number(body.count) || 2));
    const selected = outlines[stage].slice(start, start + count);
    if (!body.confirm) return Response.json({ stage, start, count: selected.length, total: outlines[stage].length, outline: selected });
    if (!selected.length) return Response.json({ error: 'Batch is outside the course outline' }, { status: 400 });

    const title = courseData(stage).title;
    const matches = await base44.asServiceRole.entities.Course.filter({ title });
    const course = matches[0] || await base44.asServiceRole.entities.Course.create(courseData(stage));
    const existing = await base44.asServiceRole.entities.Lesson.filter({ course_id: course.id }, 'order', 100);
    const missing = selected.filter(item => !existing.some(lesson => lesson.title === item[1]));
    if (!missing.length) return Response.json({ success: true, course_id: course.id, created: 0, skipped: selected.length });

    const generated = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: generationPrompt(stage, missing),
      response_json_schema: responseSchema,
      model: 'automatic',
    });
    if (!generated?.lessons || generated.lessons.length !== missing.length) throw new Error('Lesson generation returned an incomplete batch');

    const records = generated.lessons.map((lesson, index) => {
      const outline = missing[index];
      if (lesson.title !== outline[1] || !Array.isArray(lesson.slides) || lesson.slides.length !== 7) throw new Error(`Lesson validation failed for ${outline[1]}`);
      const wordCount = lesson.slides.reduce((sum, slide) => sum + slide.content.replace(/<[^>]+>/g, ' ').trim().split(/\s+/).filter(Boolean).length, 0);
      if (wordCount < 1200) throw new Error(`Lesson is too short for publication: ${outline[1]} (${wordCount} words)`);
      return {
        course_id: course.id, title: lesson.title, description: lesson.description, learning_objectives: lesson.learning_objectives,
        section: outline[0], order: outlines[stage].findIndex(item => item[1] === outline[1]) + 1,
        content_type: 'richtext', duration_minutes: 90, is_preview: start === 0 && index === 0,
        resources: [{ name: 'Official WJEC Sociology specification', url: specificationUrl, type: 'specification' }, { name: 'Official WJEC Sociology teachers’ guide', url: teacherGuideUrl, type: 'teaching guidance' }],
        slides: lesson.slides.map((slide, slideIndex) => ({ title: slide.title, content: slide.content, order: slideIndex + 1 })),
      };
    });
    await base44.asServiceRole.entities.Lesson.bulkCreate(records);
    await base44.asServiceRole.entities.Course.update(course.id, { total_lessons: outlines[stage].length });
    return Response.json({ success: true, course_id: course.id, course: title, created: records.length, titles: records.map(record => record.title) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}