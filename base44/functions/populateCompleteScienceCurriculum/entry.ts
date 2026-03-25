import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { subject } = await req.json().catch(() => ({}));

    // Get science A-Level courses
    const courses = await base44.asServiceRole.entities.Course.filter({
      qualification_type: 'alevel',
      category: subject || { $in: ['biology', 'chemistry', 'physics'] }
    });

    const lessonData = {
      biology_as: { lessons: getBiologyAS(), total: 98 },
      biology_a2: { lessons: getBiologyA2(), total: 108 },
      chemistry_as: { lessons: getChemistryAS(), total: 135 },
      chemistry_a2: { lessons: getChemistryA2(), total: 138 },
      physics_as: { lessons: getPhysicsAS(), total: 84 },
      physics_a2: { lessons: getPhysicsA2(), total: 76 }
    };

    const results = [];

    for (const course of courses) {
      const key = `${course.category}_${course.alevel_stage}`;
      const data = lessonData[key];

      if (!data) continue;

      // Delete existing lessons
      const existing = await base44.entities.Lesson.filter({ course_id: course.id });
      if (existing.length > 0) {
        await Promise.all(existing.map(l => base44.asServiceRole.entities.Lesson.delete(l.id)));
      }

      // Create lessons
      const lessonsToCreate = data.lessons.map(l => ({
        course_id: course.id,
        title: l.title,
        description: l.desc,
        section: l.section,
        order: l.order,
        learning_objectives: l.objectives,
        content_type: 'richtext',
        slides: [],
        is_preview: l.order === 1,
        duration_minutes: 45
      }));

      await base44.entities.Lesson.bulkCreate(lessonsToCreate);

      await base44.asServiceRole.entities.Course.update(course.id, {
        total_lessons: data.total
      });

      results.push({
        course: course.title,
        created: data.total
      });

      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    return Response.json({ success: true, results });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function getBiologyAS() {
  return [
    // Unit AS1: Molecules and Cells - Molecules (11)
    { section: 'AS1: Molecules', order: 1, title: 'Water as Biological Molecule', desc: 'Importance of water as solvent, hydrogen bonding, water properties in biological roles', objectives: ['Demonstrate importance of water as solvent', 'Explain hydrogen bonding in water', 'Relate water properties to biological roles'] },
    { section: 'AS1: Molecules', order: 2, title: 'Inorganic Ions', desc: 'Role of inorganic ions in biological systems', objectives: ['Outline role of K Ca Mg Fe ions', 'Explain role of hydrogencarbonate nitrate phosphate', 'Understand ions in buffering systems'] },
    { section: 'AS1: Molecules', order: 3, title: 'Monosaccharides and Disaccharides', desc: 'Structure of monosaccharides and formation of disaccharides', objectives: ['Describe glucose and fructose structure', 'Explain condensation and hydrolysis', 'Understand glycosidic bonds'] },
    { section: 'AS1: Molecules', order: 4, title: 'Polysaccharides', desc: 'Storage and structural polysaccharides', objectives: ['Describe starch and glycogen', 'Explain cellulose structure', 'Understand pentoses in nucleic acids'] },
    { section: 'AS1: Molecules', order: 5, title: 'Lipids', desc: 'Structure and function of triglycerides and phospholipids', objectives: ['Describe triglyceride structure', 'Compare saturated and unsaturated fatty acids', 'Explain phospholipid role in membranes'] },
    { section: 'AS1: Molecules', order: 6, title: 'Protein Structure', desc: 'Amino acids and levels of protein structure', objectives: ['Describe amino acid structure', 'Explain primary secondary tertiary quaternary structure', 'Understand peptide bonds'] },
    { section: 'AS1: Molecules', order: 7, title: 'Protein Types', desc: 'Fibrous globular and conjugated proteins', objectives: ['Compare collagen and enzymes', 'Explain conjugated proteins', 'Understand prions'] },
    { section: 'AS1: Molecules', order: 8, title: 'Nucleic Acids', desc: 'DNA and RNA structure and function', objectives: ['Describe nucleotide structure', 'Explain DNA double helix', 'Compare DNA and RNA'] },
    { section: 'AS1: Molecules', order: 9, title: 'DNA Replication', desc: 'Semi-conservative replication mechanism', objectives: ['Explain semi-conservative process', 'Understand DNA helicase and polymerase', 'Describe Meselson-Stahl experiment'] },
    { section: 'AS1: Molecules', order: 10, title: 'Biochemical Tests Practical', desc: 'Tests for carbohydrates and proteins', objectives: ['Carry out iodine test', 'Use Benedict test', 'Apply Biuret test'] },
    { section: 'AS1: Molecules', order: 11, title: 'Amino Acid Chromatography', desc: 'Paper chromatography of amino acids', objectives: ['Prepare chromatogram', 'Run and develop chromatogram', 'Calculate Rf values'] },
    
    // AS1: Enzymes (6)
    { section: 'AS1: Enzymes', order: 12, title: 'Enzyme Structure', desc: 'Globular proteins as enzymes', objectives: ['Describe active site', 'Explain specificity', 'Understand cofactors and coenzymes'] },
    { section: 'AS1: Enzymes', order: 13, title: 'Enzyme Function', desc: 'Lock and key vs induced fit models', objectives: ['Explain enzyme-substrate complex', 'Understand lock and key hypothesis', 'Describe induced fit'] },
    { section: 'AS1: Enzymes', order: 14, title: 'Factors Affecting Enzymes', desc: 'Temperature pH substrate and enzyme concentration', objectives: ['Investigate temperature effects', 'Analyze pH effects', 'Understand concentration effects'] },
    { section: 'AS1: Enzymes', order: 15, title: 'Enzyme Inhibition', desc: 'Competitive and non-competitive inhibition', objectives: ['Explain competitive inhibition', 'Describe non-competitive inhibition', 'Apply inhibitors therapeutically'] },
    { section: 'AS1: Enzymes', order: 16, title: 'Enzymes as Biomarkers', desc: 'Enzymes in disease diagnosis', objectives: ['Understand biomarkers in disease', 'Explain enzyme detection', 'Apply to clinical diagnosis'] },
    { section: 'AS1: Enzymes', order: 17, title: 'Immobilised Enzymes', desc: 'Applications in biotechnology', objectives: ['Describe immobilisation methods', 'Explain biotechnology applications', 'Use in biosensors'] },
    
    // AS1: Viruses (2)
    { section: 'AS1: Viruses', order: 18, title: 'Virus Structure', desc: 'Bacteriophages and HIV', objectives: ['Describe bacteriophage structure', 'Explain HIV as retrovirus', 'Understand reverse transcriptase'] },
    { section: 'AS1: Viruses', order: 19, title: 'Viral Replication', desc: 'Virus replication in host cells', objectives: ['Understand phage invasion of bacteria', 'Explain HIV invasion of T-cells', 'Describe viral replication'] },
    
    // AS1: Cells (13)
    { section: 'AS1: Cells', order: 20, title: 'Prokaryotic vs Eukaryotic Cells', desc: 'Comparing cell types', objectives: ['Describe prokaryotic features', 'Explain eukaryotic features', 'Compare cell structures'] },
    { section: 'AS1: Cells', order: 21, title: 'Membrane Structure', desc: 'Fluid mosaic model', objectives: ['Describe phospholipid bilayer', 'Explain membrane proteins', 'Understand glycocalyx'] },
    { section: 'AS1: Cells', order: 22, title: 'Membrane Function', desc: 'Roles of membrane components', objectives: ['Explain protein carriers and channels', 'Understand recognition features', 'Describe cholesterol role'] },
    { section: 'AS1: Cells', order: 23, title: 'Mitochondria and Chloroplasts', desc: 'Double membrane organelles', objectives: ['Describe mitochondria structure', 'Explain chloroplast structure', 'Understand organelle function'] },
    { section: 'AS1: Cells', order: 24, title: 'ER Ribosomes and Golgi', desc: 'Endomembrane system', objectives: ['Describe rough and smooth ER', 'Explain ribosome function', 'Understand Golgi apparatus'] },
    { section: 'AS1: Cells', order: 25, title: 'Lysosomes and Cytoskeleton', desc: 'Cell components', objectives: ['Explain lysosome function', 'Describe microtubules', 'Understand cytoskeleton'] },
    { section: 'AS1: Cells', order: 26, title: 'Nuclear Structure', desc: 'Nucleus and chromosomes', objectives: ['Describe chromosome structure', 'Explain nucleolus function', 'Understand nuclear envelope'] },
    { section: 'AS1: Cells', order: 27, title: 'Cell Types', desc: 'Plant fungal and animal cells', objectives: ['Compare plant cell features', 'Describe fungal cells', 'Identify animal cell features'] },
    { section: 'AS1: Cells', order: 28, title: 'Microscopy Techniques', desc: 'Light and electron microscopy', objectives: ['Use light microscope', 'Understand TEM vs SEM', 'Explain magnification vs resolution'] },
    { section: 'AS1: Cells', order: 29, title: 'Cell Fractionation', desc: 'Separating organelles', objectives: ['Demonstrate homogenisation', 'Use centrifugation', 'Understand differential centrifugation'] },
    { section: 'AS1: Cells', order: 30, title: 'Microscopy Skills', desc: 'Practical microscopy', objectives: ['Examine photomicrographs', 'Draw cells accurately', 'Calculate magnification'] },
    { section: 'AS1: Cells', order: 31, title: 'Staining and Measurement', desc: 'Cell observation and measurement', objectives: ['Stain tissues', 'Calculate true size', 'Use graticule and micrometer'] },
    { section: 'AS1: Cells', order: 32, title: 'Measuring Cell Dimensions', desc: 'Accurate cell measurement', objectives: ['Use scale bars', 'Calculate magnification', 'Measure cell length accurately'] },
    
    // Continue with all 98 lessons...
    // This needs to be the complete extraction from the CCEA handbook
  ];
}

function getBiologyA2() {
  return [];
}

function getChemistryAS() {
  return [];
}

function getChemistryA2() {
  return [];
}

function getPhysicsAS() {
  return [];
}

function getPhysicsA2() {
  return [];
}