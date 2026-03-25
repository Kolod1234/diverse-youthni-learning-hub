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
      category: 'life_health_sciences'
    });

    const results = [];
    
    for (const course of courses) {
      try {
        const lessons = course.alevel_stage === 'as' ? getLifeHealthSciencesAS() : getLifeHealthSciencesA2();
        
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

function getLifeHealthSciencesAS() {
  let o = 1;
  const lessons = [];
  
  // AS1: Human Biology and Health
  
  // 1.1 Cells and Tissues (10 lessons)
  lessons.push(
    { s: 'AS1: Cells Tissues', o: o++, t: 'Cell Structure', d: 'Animal and plant cell components', obj: ['Identify cell organelles', 'Describe nucleus mitochondria ribosomes', 'Compare animal and plant cells'] },
    { s: 'AS1: Cells Tissues', o: o++, t: 'Cell Membrane', d: 'Structure and function', obj: ['Describe phospholipid bilayer', 'Explain membrane proteins', 'Understand selective permeability'] },
    { s: 'AS1: Cells Tissues', o: o++, t: 'Cell Transport', d: 'Movement across membranes', obj: ['Explain diffusion osmosis', 'Describe active transport', 'Understand facilitated diffusion'] },
    { s: 'AS1: Cells Tissues', o: o++, t: 'Cell Division Mitosis', d: 'Cell reproduction', obj: ['Describe mitosis stages', 'Explain chromosome behavior', 'Understand cell cycle'] },
    { s: 'AS1: Cells Tissues', o: o++, t: 'Cell Specialization', d: 'Differentiated cells', obj: ['Identify specialized cells', 'Relate structure to function', 'Understand red blood cells neurons epithelial'] },
    { s: 'AS1: Cells Tissues', o: o++, t: 'Tissue Types', d: 'Organization of cells', obj: ['Describe epithelial tissue', 'Explain connective tissue', 'Understand muscle nervous tissue'] },
    { s: 'AS1: Cells Tissues', o: o++, t: 'Organs and Systems', d: 'Hierarchical organization', obj: ['Define organs organ systems', 'Understand tissue cooperation', 'Identify major organ systems'] },
    { s: 'AS1: Cells Tissues', o: o++, t: 'Enzymes', d: 'Biological catalysts', obj: ['Explain enzyme action', 'Understand lock and key model', 'Describe factors affecting enzymes'] },
    { s: 'AS1: Cells Tissues', o: o++, t: 'DNA Structure', d: 'Genetic material', obj: ['Describe DNA double helix', 'Explain base pairing', 'Understand nucleotide structure'] },
    { s: 'AS1: Cells Tissues', o: o++, t: 'Protein Synthesis', d: 'Gene expression', obj: ['Explain transcription process', 'Describe translation', 'Understand mRNA tRNA ribosomes'] }
  );
  
  // 1.2 Circulatory System (8 lessons)
  lessons.push(
    { s: 'AS1: Circulatory', o: o++, t: 'Heart Structure', d: 'Anatomy of the heart', obj: ['Identify heart chambers', 'Describe valves and vessels', 'Understand coronary circulation'] },
    { s: 'AS1: Circulatory', o: o++, t: 'Cardiac Cycle', d: 'Heart pumping action', obj: ['Explain systole and diastole', 'Describe pressure changes', 'Understand valve operation'] },
    { s: 'AS1: Circulatory', o: o++, t: 'Heart Electrical Activity', d: 'Controlling heartbeat', obj: ['Explain pacemaker function', 'Describe conduction system', 'Understand ECG traces'] },
    { s: 'AS1: Circulatory', o: o++, t: 'Blood Vessels', d: 'Arteries veins capillaries', obj: ['Compare vessel structures', 'Explain vessel functions', 'Understand capillary exchange'] },
    { s: 'AS1: Circulatory', o: o++, t: 'Blood Composition', d: 'Components of blood', obj: ['Describe plasma composition', 'Identify blood cells', 'Understand clotting process'] },
    { s: 'AS1: Circulatory', o: o++, t: 'Blood Pressure', d: 'Measuring circulation pressure', obj: ['Understand systolic diastolic pressure', 'Measure blood pressure', 'Identify hypertension hypotension'] },
    { s: 'AS1: Circulatory', o: o++, t: 'Cardiovascular Disease', d: 'Heart and vessel disorders', obj: ['Explain atherosclerosis', 'Describe coronary heart disease', 'Understand heart attack stroke'] },
    { s: 'AS1: Circulatory', o: o++, t: 'CVD Risk Factors', d: 'Causes and prevention', obj: ['Identify modifiable risk factors', 'Understand genetic risk factors', 'Explain prevention strategies'] }
  );
  
  // 1.3 Respiratory System (8 lessons)
  lessons.push(
    { s: 'AS1: Respiratory', o: o++, t: 'Respiratory Structure', d: 'Anatomy of breathing system', obj: ['Identify respiratory organs', 'Describe trachea bronchi alveoli', 'Understand lung structure'] },
    { s: 'AS1: Respiratory', o: o++, t: 'Breathing Mechanism', d: 'Ventilation process', obj: ['Explain inspiration expiration', 'Describe diaphragm intercostal action', 'Understand pressure changes'] },
    { s: 'AS1: Respiratory', o: o++, t: 'Gas Exchange', d: 'Oxygen and carbon dioxide transfer', obj: ['Explain diffusion at alveoli', 'Describe surface area adaptations', 'Understand partial pressure gradients'] },
    { s: 'AS1: Respiratory', o: o++, t: 'Lung Volumes', d: 'Measuring breathing capacity', obj: ['Define tidal vital residual volume', 'Measure lung capacity', 'Understand spirometry'] },
    { s: 'AS1: Respiratory', o: o++, t: 'Gas Transport', d: 'Carrying gases in blood', obj: ['Explain oxygen transport by hemoglobin', 'Describe CO2 transport', 'Understand oxygen dissociation curve'] },
    { s: 'AS1: Respiratory', o: o++, t: 'Control of Breathing', d: 'Regulating ventilation', obj: ['Explain respiratory center', 'Describe chemoreceptor function', 'Understand CO2 regulation'] },
    { s: 'AS1: Respiratory', o: o++, t: 'Respiratory Disease', d: 'Lung disorders', obj: ['Explain asthma pathology', 'Describe COPD emphysema', 'Understand lung cancer'] },
    { s: 'AS1: Respiratory', o: o++, t: 'Smoking Effects', d: 'Impact on respiratory health', obj: ['Identify toxic components', 'Explain disease mechanisms', 'Understand addiction'] }
  );
  
  // 1.4 Digestive System (8 lessons)
  lessons.push(
    { s: 'AS1: Digestive', o: o++, t: 'Digestive System Structure', d: 'Alimentary canal organs', obj: ['Identify digestive organs', 'Describe alimentary canal', 'Understand accessory organs'] },
    { s: 'AS1: Digestive', o: o++, t: 'Digestion in Mouth', d: 'Mechanical and chemical breakdown', obj: ['Explain teeth mastication', 'Describe salivary amylase', 'Understand bolus formation'] },
    { s: 'AS1: Digestive', o: o++, t: 'Stomach Digestion', d: 'Protein breakdown', obj: ['Explain gastric juice secretion', 'Describe pepsin action', 'Understand acidic environment'] },
    { s: 'AS1: Digestive', o: o++, t: 'Small Intestine Digestion', d: 'Final breakdown', obj: ['Explain pancreatic enzymes', 'Describe bile function', 'Understand intestinal enzymes'] },
    { s: 'AS1: Digestive', o: o++, t: 'Absorption', d: 'Nutrient uptake', obj: ['Explain villus structure', 'Describe absorption mechanisms', 'Understand lacteal function'] },
    { s: 'AS1: Digestive', o: o++, t: 'Large Intestine', d: 'Water reabsorption', obj: ['Explain water absorption', 'Describe bacterial role', 'Understand feces formation'] },
    { s: 'AS1: Digestive', o: o++, t: 'Liver Function', d: 'Metabolic processing', obj: ['Explain detoxification', 'Describe bile production', 'Understand glycogen storage'] },
    { s: 'AS1: Digestive', o: o++, t: 'Digestive Disorders', d: 'GI tract diseases', obj: ['Explain ulcers', 'Describe IBS', 'Understand celiac disease'] }
  );
  
  // AS2: Health and Lifestyle
  
  // 2.1 Nutrition (8 lessons)
  lessons.push(
    { s: 'AS2: Nutrition', o: o++, t: 'Macronutrients', d: 'Carbohydrates proteins fats', obj: ['Explain carbohydrate types', 'Describe protein functions', 'Understand lipid roles'] },
    { s: 'AS2: Nutrition', o: o++, t: 'Micronutrients', d: 'Vitamins and minerals', obj: ['Identify essential vitamins', 'Describe mineral functions', 'Understand deficiency diseases'] },
    { s: 'AS2: Nutrition', o: o++, t: 'Balanced Diet', d: 'Meeting nutritional needs', obj: ['Apply dietary guidelines', 'Calculate energy requirements', 'Plan balanced meals'] },
    { s: 'AS2: Nutrition', o: o++, t: 'Malnutrition', d: 'Over and undernutrition', obj: ['Explain obesity causes', 'Describe undernutrition effects', 'Understand eating disorders'] },
    { s: 'AS2: Nutrition', o: o++, t: 'Diet and Disease', d: 'Nutrition-related conditions', obj: ['Explain diet-heart disease link', 'Describe diabetes nutrition', 'Understand cancer diet relationship'] },
    { s: 'AS2: Nutrition', o: o++, t: 'Food Labels', d: 'Interpreting nutritional information', obj: ['Read nutrition labels', 'Calculate percentages', 'Make informed choices'] },
    { s: 'AS2: Nutrition', o: o++, t: 'Special Diets', d: 'Dietary requirements', obj: ['Understand vegetarian vegan diets', 'Explain food allergies', 'Describe dietary restrictions'] },
    { s: 'AS2: Nutrition', o: o++, t: 'Energy Balance', d: 'Intake vs expenditure', obj: ['Calculate BMI', 'Understand energy balance', 'Apply weight management'] }
  );
  
  // 2.2 Infectious Disease (10 lessons)
  lessons.push(
    { s: 'AS2: Infectious Disease', o: o++, t: 'Pathogens', d: 'Disease-causing organisms', obj: ['Classify bacteria viruses fungi parasites', 'Describe pathogen characteristics', 'Understand transmission routes'] },
    { s: 'AS2: Infectious Disease', o: o++, t: 'Bacterial Infections', d: 'Bacterial diseases', obj: ['Explain bacterial structure', 'Describe tuberculosis pneumonia', 'Understand antibiotic action'] },
    { s: 'AS2: Infectious Disease', o: o++, t: 'Viral Infections', d: 'Viral diseases', obj: ['Explain virus structure replication', 'Describe influenza HIV', 'Understand antiviral treatments'] },
    { s: 'AS2: Infectious Disease', o: o++, t: 'Transmission', d: 'Disease spread', obj: ['Explain direct transmission', 'Describe indirect transmission', 'Understand vectors'] },
    { s: 'AS2: Infectious Disease', o: o++, t: 'Non-Specific Immunity', d: 'Physical and chemical barriers', obj: ['Explain skin mucous barriers', 'Describe inflammatory response', 'Understand phagocytosis'] },
    { s: 'AS2: Infectious Disease', o: o++, t: 'Specific Immunity', d: 'Adaptive immune response', obj: ['Explain antibody production', 'Describe cell-mediated immunity', 'Understand lymphocyte function'] },
    { s: 'AS2: Infectious Disease', o: o++, t: 'Vaccination', d: 'Active artificial immunity', obj: ['Explain vaccination principles', 'Describe vaccine types', 'Understand herd immunity'] },
    { s: 'AS2: Infectious Disease', o: o++, t: 'Antibiotics', d: 'Treating bacterial infections', obj: ['Explain antibiotic mechanisms', 'Understand antibiotic resistance', 'Apply responsible use'] },
    { s: 'AS2: Infectious Disease', o: o++, t: 'Disease Prevention', d: 'Reducing infection risk', obj: ['Explain hygiene practices', 'Describe sanitation importance', 'Understand public health measures'] },
    { s: 'AS2: Infectious Disease', o: o++, t: 'Epidemiology', d: 'Disease patterns', obj: ['Understand epidemic pandemic', 'Analyze disease data', 'Apply prevention strategies'] }
  );
  
  return lessons;
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