/* A2 Biology, Lesson 9 — Natural Barriers, Antigens and Antibodies. */

function sheet(K, title) {
  const d = new K.Diagram();
  d.fitlabel(380, 425, 700, title, K.TEAL, 14.5, true);
  return d;
}

function concept(title, key, chain, caption, colour) {
  return (K) => {
    const d = sheet(K, title);
    d.box(48, 318, 664, 62, key, colour ? K[colour] : K.TEAL, 10.3);
    d.chain(chain, { y: 184, x0: 38, x1: 722, h: 84, colour: [K.BLUE, K.INDIGO, K.AMBER, K.TEAL], size: 9.3 });
    d.caption(caption, { y: 44, size: 9.2, wrap: 110 });
    return d;
  };
}

function steps(title, items, caption, colour = 'TEAL') {
  return (K) => {
    const d = sheet(K, title);
    d.steps(items, { x: 48, y0: 340, w: 664, rowh: items.length > 7 ? 29 : 38, gap: items.length > 7 ? 5 : 8, colour: K[colour], size: items.length > 7 ? 9.0 : 9.7 });
    if (caption) d.caption(caption, { y: 27, size: 9, wrap: 112 });
    return d;
  };
}

function cards(title, items, caption, colour = 'INDIGO') {
  return (K) => {
    const d = sheet(K, title);
    d.cards(items, { y0: 340, x: 44, w: 672, rowh: items.length > 5 ? 42 : 54, gap: items.length > 5 ? 7 : 10, colour: K[colour], size: items.length > 5 ? 9.0 : 9.6 });
    if (caption) d.caption(caption, { y: 27, size: 9, wrap: 112 });
    return d;
  };
}

function compare(title, heads, left, right, caption) {
  return (K) => {
    const d = sheet(K, title);
    d.twocol(left, right, { y0: 286, rowh: 46, gap: 10, lc: K.BLUE, rc: K.TEAL, heads, size: 9.4 });
    d.caption(caption, { y: 38, size: 9.2, wrap: 110 });
    return d;
  };
}

const pages = [
  concept('Natural Barriers, Antigens and Antibodies', 'The first line of defence prevents entry; the specific response recognises non-self antigen and produces a complementary antibody.', ['natural barriers', 'pathogen enters', 'non-self antigen recognised', 'specific antibody binds'], 'Keep prevention, recognition and specific binding as three distinct stages.'),
  cards('What is a pathogen?', [['Pathogen', 'a microorganism or virus that can cause disease'], ['Bacterium', 'cellular pathogen with its own metabolism'], ['Virus', 'acellular particle that replicates only inside host cells'], ['Fungus or protoctist', 'eukaryotic pathogens with different cell structures']], 'Disease is the harmful effect; the pathogen is the causative biological agent.'),
  concept('The two lines of defence', 'Innate barriers act immediately and non-specifically; adaptive immunity is slower at first but antigen-specific.', ['skin and secretions', 'internal innate responses', 'B and T lymphocytes', 'memory response'], 'OpenStax overview: innate and adaptive defences cooperate rather than act as isolated systems.'),
  concept('Skin as a physical barrier', 'Closely packed, keratinised cells form a tough, dry surface that most pathogens cannot penetrate.', ['keratinised epidermis', 'continuous cell layers', 'cells shed from surface', 'microbes removed'], 'The skin prevents entry; it does not need to identify a particular antigen.'),
  compare('Sebum and skin flora', ['CHEMICAL DEFENCE', 'BIOLOGICAL COMPETITION'], ['sebum lowers surface pH', 'fatty substances inhibit microbes', 'dry conditions limit growth'], ['resident microbes occupy space', 'use available nutrients', 'exclude invading pathogens'], 'Normal flora defend without triggering a specific antibody response.'),
  concept('Stomach acid', 'Hydrochloric acid creates a very low pH that denatures microbial proteins and disrupts enzyme activity.', ['pathogens swallowed', 'pH falls sharply', 'proteins lose shape', 'many microbes die'], 'Low pH is a chemical barrier; it is not a lymphocyte response.'),
  concept('Tears, saliva and lysozyme', 'Tears and saliva wash surfaces while lysozyme hydrolyses bonds in bacterial cell-wall peptidoglycan.', ['continuous fluid flow', 'lysozyme contacts wall', 'peptidoglycan weakens', 'bacterium becomes vulnerable'], 'Washing is physical; lysozyme action is chemical and enzyme-specific.'),
  steps('How lysozyme kills a bacterium', ['Lysozyme binds its substrate in peptidoglycan', 'Glycosidic bonds in the wall are hydrolysed', 'The wall loses mechanical strength', 'Water enters the bacterium by osmosis', 'The plasma membrane cannot resist the pressure', 'The cell lyses'], 'State both enzyme action and the osmotic consequence.'),
  concept('Mucus and ciliated epithelium', 'Sticky mucus traps particles and pathogens; coordinated cilia move the loaded mucus toward the throat.', ['goblet cells secrete mucus', 'microbes become trapped', 'cilia beat upward', 'mucus swallowed'], 'This mucociliary escalator removes pathogens before they reach delicate gas-exchange surfaces.'),
  steps('When the escalator stops working', ['Smoke damages and paralyses cilia', 'Mucus is not moved effectively', 'Pathogens remain in the airways', 'Pathogen numbers can increase', 'Inflammation and infection become more likely'], 'The causal chain explains why smoking raises chest-infection risk.', 'AMBER'),
  concept('Blood clotting closes a breach', 'A clot forms a temporary seal over damaged skin, reducing blood loss and pathogen entry.', ['platelets meet damaged tissue', 'clotting cascade begins', 'fibrin mesh forms', 'wound is sealed'], 'Clotting restores the continuity of the first line of defence.'),
  steps('The clotting sequence', ['Damaged tissue and platelets release thromboplastin', 'With Ca2+ and clotting factors, prothrombin is activated', 'Prothrombin is converted to thrombin', 'Thrombin converts soluble fibrinogen to insoluble fibrin', 'Fibrin fibres form a mesh', 'Blood cells are trapped and a clot forms'], 'Use the correct substrate-to-product sequence.'),
  cards('Five natural barriers', [['Skin', 'keratin, dryness, sebum and resident flora'], ['Stomach', 'low pH denatures microbial proteins'], ['Tears and saliva', 'washing plus lysozyme'], ['Airways', 'mucus traps; cilia remove'], ['Clotting', 'fibrin mesh seals a break']], 'Each barrier prevents entry or rapidly restores a breached surface.', 'TEAL'),
  concept('When barriers fail', 'A pathogen that enters tissue creates the need for internal innate responses and antigen-specific adaptive immunity.', ['breach or mucosal entry', 'pathogen detected', 'phagocytes respond', 'B and T cells selected'], 'OpenStax shows how barrier failure links innate recognition to adaptive defence.'),
  concept('Antigen — the definition', 'An antigen is a molecule, usually a protein or glycoprotein, that is recognised as foreign and can provoke an immune response.', ['molecule on cell or virus', 'recognised as non-self', 'specific lymphocyte binds', 'immune response follows'], 'An antigen is a molecule, not the whole pathogen.'),
  compare('Self and non-self antigens', ['SELF', 'NON-SELF'], ['surface markers made by the body', 'normally tolerated', 'do not trigger attack'], ['foreign surface molecules', 'recognised by matching receptors', 'can trigger immune response'], 'Immune tolerance prevents routine attack on the body’s own antigens.'),
  concept('Antigens on a pathogen', 'Accessible antigen molecules project from the pathogen surface, where receptors and antibodies can bind them.', ['pathogen surface', 'exposed epitope', 'complementary binding site', 'recognition signal'], 'The epitope is the particular region of an antigen that is bound.'),
  concept('Antibody — the definition', 'An antibody is a specific globular protein secreted by plasma cells that binds a complementary antigen.', ['B cell selected', 'plasma cell forms', 'antibody secreted', 'antigen binds'], 'Antibodies act outside cells in blood, lymph and tissue fluid.'),
  concept('Antibody structure', 'Two heavy chains and two light chains form a Y-shaped molecule with two variable antigen-binding sites.', ['two heavy chains', 'two light chains', 'disulfide bonds', 'two variable binding sites'], 'OpenStax Figure 21.21 provides the authoritative four-chain structure.'),
  concept('Molecular specificity', 'The variable region folds into a binding site whose three-dimensional shape and chemistry complement one epitope.', ['amino-acid sequence', 'specific folding', 'binding-site shape and charge', 'complementary epitope binds'], 'OpenStax Figure 42.25 illustrates affinity and cross-reactivity; CCEA answers must stress complementarity.'),
  concept('The antigen–antibody complex', 'Temporary bonds hold a complementary antigen and antibody together to form a specific immune complex.', ['random molecular collision', 'complementary sites align', 'weak bonds form', 'complex remains long enough to act'], 'OpenStax Figure 42.24 shows how bound antibody neutralises, tags and activates complement.'),
  concept('Why two binding sites matter', 'Each antibody can bind two matching epitopes, so one molecule can cross-link two pathogens or particles.', ['first site binds antigen A', 'second site binds antigen B', 'more antibodies cross-link', 'visible clump forms'], 'Agglutination concentrates targets and makes them easier for phagocytes to engulf.'),
  compare('Two lines of defence compared', ['NATURAL BARRIERS', 'SPECIFIC IMMUNITY'], ['present before infection', 'rapid and non-specific', 'prevents pathogen entry', 'no antigen-specific memory'], ['activated after recognition', 'specific to an antigen', 'uses selected lymphocytes', 'produces memory cells'], 'Both contribute to defence, but only the adaptive branch has antigen-specific memory.'),
  cards('Investigating lysozyme', [['Independent variable', 'lysozyme concentration or treatment'], ['Dependent variable', 'clear-zone diameter or area'], ['Negative control', 'same solvent without lysozyme'], ['Control variables', 'bacterial lawn, agar depth, time and temperature'], ['Reliability', 'replicates and a mean']], 'A larger clear zone indicates greater inhibition, but diffusion also affects zone size.', 'BLUE'),
  steps('Data solutions — evidence first', ['Identify the negative control', 'Compare treatment with control', 'Quote the relevant values', 'Link a larger clear zone to greater bacterial inhibition', 'Avoid claiming that every bacterium was killed'], 'Conclusions must stay within what the measurement can support.', 'INDIGO'),
  steps('Percentage change in clear area', ['Write: percentage change = change ÷ original × 100', 'Subtract the original area from the new area', 'Divide by the original area', 'Multiply by 100', 'Add the percent sign and state increase or decrease'], 'Area is proportional to diameter squared, so diameter and area changes are not interchangeable.', 'INDIGO'),
  cards('Practice-question plan', [['Barrier question', 'name feature, mechanism and consequence'], ['Lysozyme question', 'hydrolysis then osmotic lysis'], ['Clotting question', 'thromboplastin → thrombin → fibrin'], ['Antigen question', 'foreign molecule, not whole pathogen'], ['Antibody question', 'plasma-cell protein with complementary sites']], 'Plan each answer as a causal chain before writing.'),
  cards('Solutions — questions 1 to 3', [['Skin', 'keratinised layers form a continuous physical wall'], ['Stomach', 'low pH denatures microbial proteins and enzymes'], ['Lysozyme', 'hydrolyses peptidoglycan so osmotic pressure can lyse bacteria'], ['Cilia', 'move pathogen-loaded mucus toward the throat']], 'Every marking point links a named feature to a defensive effect.', 'TEAL'),
  cards('Solutions — questions 4 to 6', [['Clotting', 'thrombin converts fibrinogen into insoluble fibrin'], ['Antigen', 'a recognised foreign surface molecule'], ['Antibody', 'a plasma-cell protein with a complementary variable region'], ['Agglutination', 'two binding sites cross-link many particles']], 'Keep molecule, cell and whole organism at the correct biological level.', 'TEAL'),
  steps('Exam-style question plan', ['Define a pathogen', 'Explain three natural barriers', 'Describe the clotting sequence', 'Define antigen and antibody', 'Explain complementary binding', 'Explain how two sites cause agglutination'], 'Allocate one linked biological chain to each part of the question.', 'BLUE'),
  steps('Exam solution — barriers and specificity', ['Skin forms a keratinised physical barrier', 'Mucus traps pathogens and cilia remove them', 'Stomach acid denatures microbial proteins', 'A non-self antigen has a specific epitope', 'An antibody variable region has a complementary site', 'Temporary bonds form an antigen–antibody complex'], 'Specificity follows from protein structure and complementarity.', 'TEAL'),
  steps('Exam solution — clotting and agglutination', ['Damage triggers release of thromboplastin', 'Prothrombin is converted to thrombin', 'Thrombin converts fibrinogen to fibrin', 'A fibrin mesh seals the wound', 'Each antibody binds two matching epitopes', 'Repeated cross-linking produces an agglutinated mass'], 'Use the full substrate and product names; do not say fibrinogen forms the mesh directly.', 'TEAL'),
  compare('Common errors', ['ERROR', 'CORRECTION'], ['antigen means pathogen', 'antibody destroys by itself', 'fibrinogen is insoluble', 'cilia trap pathogens'], ['antigen is a molecule', 'binding marks or neutralises', 'fibrin is insoluble', 'mucus traps; cilia move'], 'Precise nouns protect marks in immunity questions.'),
  cards('Key terms glossary', [['Pathogen', 'disease-causing microorganism or virus'], ['Natural barrier', 'non-specific defence preventing entry'], ['Antigen', 'foreign molecule recognised by immunity'], ['Epitope', 'specific antigen region that is bound'], ['Antibody', 'specific antigen-binding globular protein'], ['Agglutination', 'cross-linked clumping of particles']], 'Learn the CCEA wording and then attach a mechanism to each term.'),
  cards('Quick recall drill', [['Skin', 'keratin + sebum + flora'], ['Stomach', 'acidic pH'], ['Eye and mouth', 'washing + lysozyme'], ['Airways', 'mucus + cilia'], ['Wound', 'fibrin clot'], ['Specificity', 'complementary variable region']], 'Say the mechanism before revealing the answer.', 'AMBER'),
  steps('Summary and next connection', ['Natural barriers reduce pathogen entry', 'Clotting seals a break in the skin', 'Antigens are recognised foreign molecules', 'Antibodies are specific plasma-cell proteins', 'Complementary sites form antigen–antibody complexes', 'Two sites allow cross-linking and agglutination'], 'Next: clonal selection turns antigen recognition into antibody-mediated and cell-mediated immunity.'),
];

const sources = {
  overview: 'lesson-assets/a2-biology/openstax-21-12-innate-adaptive.png',
  antibody: 'lesson-assets/a2-biology/openstax-21-21-antibody-structure.png',
  specificity: 'lesson-assets/a2-biology/openstax-42-25-affinity-specificity.png',
  functions: 'lesson-assets/a2-biology/openstax-42-24-antibody-functions.png',
};

[[3, sources.overview], [14, sources.overview], [19, sources.antibody], [20, sources.specificity], [21, sources.functions], [23, sources.overview], [36, sources.overview]].forEach(([page, source]) => {
  pages[page - 1] = { path: `a2-biology/a2-009-p${String(page).padStart(2, '0')}.png`, copyFrom: source };
});

if (pages.length !== 36) throw new Error(`Lesson 9: expected 36 pages, got ${pages.length}`);
module.exports = { dir: 'a2-biology', prefix: 'a2-009-p', pages };

