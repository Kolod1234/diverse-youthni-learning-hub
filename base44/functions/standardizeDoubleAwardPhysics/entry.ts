import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

const COURSE_ID = '698338743679f9d974452a4c';
const SPEC_URL = 'https://ccea.org.uk/downloads/docs/Specifications/GCSE/GCSE%20Science%20Double%20Award%20%282017%29/GCSE%20Science%20Double%20Award%20%282017%29-specification-Standard.pdf';
const TARGETS = {
  '69833991fcb4c7d9446e5e11': { subject: 'Biology', unit: 'B1', title: 'Cells', focus: 'microscopy and magnification, animal and plant cells, bacterial cells, cell specialisation, levels of organisation, diffusion and active transport, with links to microorganisms where required' },
  '69833991fcb4c7d9446e5e12': { subject: 'Biology', unit: 'B1', title: 'Photosynthesis and Plants', focus: 'photosynthesis as an endothermic process, word and balanced symbol equations, limiting factors, leaf structure, stomata, gas exchange, plant minerals, and prescribed starch-test and rate investigations' },
  '69833a4f60d11fde65a2acca': { subject: 'Biology', unit: 'B1', title: 'Food and Diet', focus: 'carbohydrates, proteins, lipids, vitamins, minerals, fibre and water; balanced diets, malnutrition, energy needs, food tests, food energy, food chains, food webs and nutrient cycling links' },
  '69833a4f60d11fde65a2accb': { subject: 'Biology', unit: 'B1', title: 'The Digestive System', focus: 'alimentary canal structure, physical and chemical digestion, enzyme specificity and temperature and pH effects, bile, absorption by villi, assimilation and the required enzyme investigations' },
  '69833a4f60d11fde65a2accc': { subject: 'Biology', unit: 'B1', title: 'Respiration', focus: 'aerobic and anaerobic respiration equations, energy transfer, breathing and gas exchange, lung structure, exercise, oxygen debt, fermentation and respiration investigations' },
  '69833991fcb4c7d9446e5e13': { subject: 'Biology', unit: 'B2', title: 'Osmosis and Plant Transport', focus: 'osmosis through selectively permeable membranes, water potential reasoning without overextending the specification, turgor and plasmolysis, root hair uptake, xylem, transpiration, translocation, limiting factors and prescribed osmosis investigation' },
  '69833991fcb4c7d9446e5e14': { subject: 'Biology', unit: 'B2', title: 'The Circulatory System', focus: 'blood components, immunity links, arteries veins and capillaries, heart structure, double circulation, coronary heart disease, exercise and pulse rate, homeostasis and control-system links, and heart and circulation practical skills' },
  '69833991fcb4c7d9446e5e15': { subject: 'Biology', unit: 'B2', title: 'Reproduction, Fertility and Contraception', focus: 'male and female reproductive systems, gametes and fertilisation, menstrual cycle hormones, pregnancy and birth, contraception, infertility treatments, sexually transmitted infections, health choices and ethical evaluation' },
  '69833991fcb4c7d9446e5e16': { subject: 'Biology', unit: 'B2', title: 'Genome, Chromosomes, Genes, DNA and Genetics', focus: 'genome, chromosomes, genes and DNA, mitosis and meiosis, alleles, genotype and phenotype, monohybrid crosses, sex determination, pedigrees, inherited conditions, genetic screening and ethical issues' },
  '69833991fcb4c7d9446e5e17': { subject: 'Biology', unit: 'B2', title: 'Variation and Natural Selection', focus: 'continuous and discontinuous variation, genetic and environmental causes, sampling and data, natural selection, evolution, extinction, selective breeding, antibiotic resistance, biodiversity, ecosystems, human impacts, conservation, microorganisms, pathogens, vaccination and immunity' },
  '69833991fcb4c7d9446e5e20': { unit: 'P1', title: 'Motion', focus: 'distance, displacement, speed, velocity, acceleration, scalar and vector quantities, distance–time and velocity–time graphs, and the prescribed inclined-runway motion investigation' },
  '69833a4f60d11fde65a2acd0': { unit: 'P1', title: 'Forces and Motion', focus: 'resultant force, Newton’s laws, inertia, F = ma, weight, terminal velocity, stopping distance, momentum, springs, Hooke’s law and its prescribed practical investigation' },
  '69833a4f60d11fde65a2acd1': { unit: 'P1', title: 'Energy', focus: 'energy stores and transfers, conservation, work, power, kinetic and gravitational potential energy, efficiency, fuels and renewable and non-renewable resources' },
  '69833a4f60d11fde65a2acd2': { unit: 'P1', title: 'Thermal Physics', focus: 'temperature, internal energy, specific heat capacity, conduction, convection, infrared radiation, insulation, energy loss and quantitative heating calculations' },
  '69833a4f60d11fde65a2acd3': { unit: 'P1', title: 'Density and Pressure', focus: 'mass, volume, density, regular and irregular objects, pressure in solids, liquids and gases, atmospheric pressure, flotation and quantitative applications' },
  '69833b0f8fac9c2f2ce46e99': { unit: 'P1', title: 'Moments', focus: 'turning effects, moment = force × perpendicular distance, equilibrium, the principle of moments, centre of gravity, stability, levers and the prescribed moments investigation' },
  '69833b0f8fac9c2f2ce46e9a': { unit: 'P1', title: 'Kinetic Theory', focus: 'particle models of solids, liquids and gases, changes of state, diffusion, Brownian motion, gas pressure and temperature explained by particle motion' },
  '69833b0f8fac9c2f2ce46e9b': { unit: 'P1', title: 'Radioactivity', focus: 'atomic structure, isotopes, background radiation, alpha beta and gamma radiation, penetration and ionisation, decay, half-life, hazards, safety and uses' },
  '69833b0f8fac9c2f2ce46e9c': { unit: 'P1', title: 'Nuclear Fission and Fusion', focus: 'nuclear instability, chain reactions, controlled fission, reactor safety, fusion in stars, mass–energy transfer and benefits and limitations of nuclear power' },
  '69833991fcb4c7d9446e5e21': { unit: 'P2', title: 'Waves', focus: 'transverse and longitudinal waves, amplitude, wavelength, frequency, period, wave speed, reflection, refraction, diffraction, sound, ultrasound, seismic waves and wave calculations' },
  '69833991fcb4c7d9446e5e22': { unit: 'P2', title: 'Light', focus: 'reflection, refraction, ray tracing, refractive effects, lenses, image formation, colour, the electromagnetic spectrum, uses, hazards and prescribed ray-tracing practical work' },
  '69833991fcb4c7d9446e5e23': { unit: 'P2', title: 'Electricity', focus: 'charge, current, potential difference, resistance, series and parallel circuits, current–voltage behaviour, electrical power and energy, mains electricity, safety and circuit investigations' },
  '69833991fcb4c7d9446e5e24': { unit: 'P2', title: 'Magnetism and Electromagnetism', focus: 'permanent and induced magnetism, magnetic fields, current-produced fields, solenoids, electromagnets, the motor effect, force on a conductor, induction, generators and transformers' },
  '69833991fcb4c7d9446e5e25': { unit: 'P2', title: 'Space Physics', focus: 'the Solar System, gravity and orbital motion, satellites, stellar evolution, galaxies, red-shift, expansion of the Universe and evidence for the Big Bang model' }
};

const slidesSchema = {
  type: 'object',
  properties: {
    slides: {
      type: 'array', minItems: 15, maxItems: 15,
      items: {
        type: 'object',
        properties: { title: { type: 'string' }, content: { type: 'string' }, order: { type: 'number' } },
        required: ['title', 'content', 'order']
      }
    }
  },
  required: ['slides']
};

function promptFor(lesson, target, start, end) {
  const objectives = (lesson.learning_objectives || []).join('; ');
  const subject = target.subject || 'Physics';
  const phase = end <= 15
    ? 'foundations, prior knowledge, definitions, causal explanations, core relationships and the first worked applications'
    : 'Higher Tier applications, practical and data skills, misconceptions, mixed practice, complete worked answers and synthesis';
  const subjectRules = subject === 'Biology'
    ? 'Identify structures, locations and starting conditions before explaining each causal step. Connect cell processes to observations and whole-organism outcomes. Check biological terminology, scales and conventions. Distinguish models from direct evidence. For calculations, define symbols, show substitutions and units, and interpret the result. Cover microorganisms, health, biodiversity and homeostasis only where included in the stated chapter scope.'
    : 'Define every symbol before use, give SI units, distinguish scalar from vector where relevant, show unit conversions, substitutions, signs and intermediate calculations, and interpret every numerical result. Explain physical cause and mechanism, not only what happens. State model limitations accurately.';
  return `Author pages ${start}-${end} of a 30-page textbook chapter for learners aged 14–16 studying CCEA GCSE Science Double Award (2017), ${subject} Unit ${target.unit}. Chapter: ${target.title}. Required scope: ${target.focus}. Existing outcomes: ${objectives}. This segment covers ${phase}.

Use the official CCEA Double Award Science specification as the curriculum authority: ${SPEC_URL}. Do not import separate-science-only content as required Double Award content. Label any helpful extension explicitly. Use British English and teach a first-time learner without assuming a tutor will fill gaps.

EACH page must contain 135–195 words of substantive teaching after HTML is removed. Equations, headings and lists do not replace prose. ${subjectRules} Explain common misconceptions accurately. Never claim an original question is an official examination question.

Across the complete chapter include at least six varied <div class="worked-example"> blocks and at least nine pages containing <div class="answer-block"><ol>. Every quantitative solution must state why the relationship applies before substitution, use one action per <li>, retain units through the working and finish with a dimensional, magnitude, substitution or physical-sense check. Include at least twelve original assessment-style questions across accessible, standard and Higher Tier demand; every question and subpart must receive a complete worked answer.

Include practical teaching where relevant: apparatus, preparation, numbered method, independent/dependent/control variables, measurements and repeats, graph treatment, hazards and proportionate controls, uncertainty, limitations and specific improvements. For prescribed practicals in the required scope, identify them as CCEA prescribed practical preparation without inventing current live assessment materials. Teach before testing.

Page sequence across the full chapter: 1 purpose and prior knowledge; 2–5 foundations; 6 first worked example; 7–10 mechanisms and relationships; 11 worked application; 12–13 graph/data skills; 14 practice set A; 15 complete answers A; 16–19 deeper and Higher Tier applications; 20 practical or investigation skills; 21 worked application; 22 misconceptions; 23 mixed data/application task; 24 practice set B; 25–28 complete answers B and additional worked applications; 29 synoptic challenge with full answer; 30 retrieval summary and checked mastery questions. Keep this page purpose even when generating only one half.

Return exactly ${end - start + 1} slides as clean HTML. Orders must be exactly ${start}–${end}. Use connected <p> prose; sparse <h2>/<h3>; <div class="key-rule"> for precise laws; <div class="notation-note"> for symbols and units; <div class="worked-example"> for complete problems; <div class="answer-block"><ol><li>…</li></ol></div> for solutions; <div class="practice-block"> for question sets; and <div class="check-point"> for checks or misconceptions. Render notation with MathJax delimiters $...$ and $$...$$ and use stacked fractions such as \\frac{d}{t}. Do not include SVG, image tags, external links or decorative filler. Never use “clearly”, “simply”, “similarly”, “obviously” or “after some work”. Before returning, audit every page for word count, factual accuracy, complete reasoning and complete answers.`;
}

function words(html) {
  return String(html || '').replace(/<[^>]*>/g, ' ').replace(/\$[^$]*\$/g, ' MATH ').trim().split(/\s+/).filter(Boolean).length;
}

function auditSlides(slides) {
  const sparsePages = slides.filter(slide => words(slide.content) < 115).map(slide => slide.order);
  const answerPages = slides.filter(slide => String(slide.content || '').includes('answer-block')).length;
  const workedExamples = slides.reduce((count, slide) => count + ((String(slide.content || '').match(/worked-example/g) || []).length), 0);
  const practicalPages = slides.filter(slide => /apparatus|independent variable|control variable|uncertainty|hazard/i.test(String(slide.content || ''))).map(slide => slide.order);
  const bannedPages = slides.filter(slide => /\b(clearly|simply|similarly|obviously|after some work)\b/i.test(String(slide.content || ''))).map(slide => slide.order);
  const totalWords = slides.reduce((sum, slide) => sum + words(slide.content), 0);
  const valid = slides.length === 30
    && slides.every((slide, index) => slide.order === index + 1)
    && totalWords >= 3600
    && sparsePages.length <= 2
    && answerPages >= 8
    && workedExamples >= 5
    && bannedPages.length === 0;
  return { valid, totalWords, sparsePages, answerPages, workedExamples, practicalPages, bannedPages };
}

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Admin access required' }, { status: 403 });

    const { lesson_id, action = 'audit', part } = await req.json();
    const target = TARGETS[lesson_id];
    if (!target) return Response.json({ error: 'lesson_id must identify a safeguarded Physics or Biology chapter in the existing CCEA GCSE Double Award Science course' }, { status: 400 });

    const subject = target.subject || 'Physics';
    const lesson = await base44.asServiceRole.entities.Lesson.get(lesson_id);
    if (lesson.course_id !== COURSE_ID || !String(lesson.section || '').startsWith(`${subject} Unit`)) {
      return Response.json({ error: `Target lesson is outside the safeguarded ${subject} course scope` }, { status: 409 });
    }

    if (action === 'audit') {
      const slides = lesson.slides || [];
      return Response.json({ lesson_id, title: lesson.title, pages: slides.length, ...auditSlides(slides) });
    }

    if (action === 'generate_part' || action === 'generate_segment') {
      const segment = Number(part);
      const isSegment = action === 'generate_segment';
      if ((!isSegment && segment !== 1 && segment !== 2) || (isSegment && (segment < 1 || segment > 6))) {
        return Response.json({ error: isSegment ? 'part must be a segment from 1 to 6' : 'part must be 1 or 2' }, { status: 400 });
      }
      const start = isSegment ? ((segment - 1) * 5) + 1 : (segment === 1 ? 1 : 16);
      const end = isSegment ? segment * 5 : (segment === 1 ? 15 : 30);
      const pageCount = end - start + 1;
      const generated = await base44.asServiceRole.integrations.Core.InvokeLLM({
        model: 'gpt_5_6_sol',
        prompt: promptFor(lesson, target, start, end),
        response_json_schema: {
          ...slidesSchema,
          properties: { ...slidesSchema.properties, slides: { ...slidesSchema.properties.slides, minItems: pageCount, maxItems: pageCount } }
        }
      });
      const draftSlides = generated.slides || [];
      const versions = await base44.asServiceRole.entities.ContentVersion.filter({ entity_type: 'lesson', entity_id: lesson_id });
      const versionNumber = versions.reduce((highest, version) => Math.max(highest, version.version_number || 0), 0) + 1;
      const draftLabel = isSegment ? `segment ${segment}` : `part ${segment}`;
      await base44.asServiceRole.entities.ContentVersion.create({
        entity_type: 'lesson', entity_id: lesson_id, version_number: versionNumber,
        content_snapshot: { draft_slides: draftSlides, generated_for: lesson_id, part: segment, generation_mode: isSegment ? 'segment' : 'part', standard: `CCEA Double Award ${subject} 30-page master standard` },
        change_summary: `Double Award ${subject} generated draft ${draftLabel}`,
        changed_fields: ['slides'], author_email: user.email, author_name: user.full_name || 'Administrator',
        is_published: false, review_status: 'draft'
      });
      return Response.json({ generated: true, lesson_id, mode: isSegment ? 'segment' : 'part', part: segment, pages: draftSlides.length, total_words: draftSlides.reduce((sum, slide) => sum + words(slide.content), 0), draft_version: versionNumber });
    }

    if (action !== 'finalize') return Response.json({ error: 'action must be audit, generate_part, generate_segment or finalize' }, { status: 400 });

    const versions = await base44.asServiceRole.entities.ContentVersion.filter({ entity_type: 'lesson', entity_id: lesson_id });
    const newestDraft = (label) => versions
      .filter(version => version.change_summary === `Double Award ${subject} generated draft ${label}`)
      .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())[0];
    const slidesForHalf = (half) => {
      const partDraft = newestDraft(`part ${half}`);
      if (partDraft) return partDraft.content_snapshot?.draft_slides || [];
      const segmentNumbers = half === 1 ? [1, 2, 3] : [4, 5, 6];
      const segmentDrafts = segmentNumbers.map(number => newestDraft(`segment ${number}`));
      if (segmentDrafts.some(draft => !draft)) return [];
      return segmentDrafts.flatMap(draft => draft.content_snapshot?.draft_slides || []);
    };
    const firstHalf = slidesForHalf(1);
    const secondHalf = slidesForHalf(2);
    if (firstHalf.length !== 15 || secondHalf.length !== 15) {
      return Response.json({ error: 'Both complete generated halves are required before finalization' }, { status: 409 });
    }

    const slides = [...firstHalf, ...secondHalf]
      .map((slide, index) => ({ ...slide, order: index + 1, background: '#fffdf9' }));
    const report = auditSlides(slides);
    if (!report.valid) return Response.json({ updated: false, lesson_id, ...report }, { status: 422 });

    const versionNumber = versions.reduce((highest, version) => Math.max(highest, version.version_number || 0), 0) + 1;
    await base44.asServiceRole.entities.ContentVersion.create({
      entity_type: 'lesson', entity_id: lesson_id, version_number: versionNumber,
      content_snapshot: lesson,
      change_summary: `Backup before CCEA Double Award ${subject} master-standard rebuild`,
      changed_fields: ['slides', 'description', 'duration_minutes', 'content_status'],
      author_email: user.email, author_name: user.full_name || 'Administrator',
      is_published: false, review_status: 'draft'
    });
    await base44.asServiceRole.entities.Lesson.update(lesson_id, {
      slides,
      content_type: 'richtext',
      duration_minutes: 110,
      description: `Complete CCEA GCSE Double Award Science ${subject} ${target.unit} textbook chapter on ${target.focus}, with micro-step reasoning, practical skills and fully worked practice.`,
      content_status: 'master_standard_30_page',
      specification_references: [target.unit]
    });
    return Response.json({ updated: true, lesson_id, title: lesson.title, backup_version: versionNumber, ...report });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}