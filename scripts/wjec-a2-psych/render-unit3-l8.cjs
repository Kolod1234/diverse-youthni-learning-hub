/*
 * WJEC A2 Psychology, Lesson 8: Ethical Costs of Research and the Use of Non-Human Animals.
 * Diagrams for pages 3, 6 and 9.
 * Run: node scripts/wjec-a2-psych/render-unit3-l8.cjs
 */
const H = require('./diagram-helpers.cjs');
const { make, box, title2, sub2, panelHeader, wrap, band, arrow, text, W,
        BLUE, RED, AMBER, GREY, LIGHT, SOFT, GREEN, PURPLE, DARK, TEAL } = H;

/* ---------- Page 3: Ethical costs vs benefits ---------- */
function ethicalCosts() {
  const [c, x] = make(W, 1086);
  title2(x, 'Controversy 3: Ethical costs of conducting psychological research');
  sub2(x, 'Weighing individual participant harm and societal misuse against scientific and clinical benefits');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['Costs to participants', RED,
      'Psychological harm, deception and lack of consent: Milgram (1963) induced seizures, sweating and trembling in 65% obedient participants; Zimbardo (1973) Stanford prison guards caused acute emotional breakdown within 36 hours.',
      'Vulnerable groups: Watson & Rayner (1920) conditioned phobic fear in 9-month-old Little Albert without desensitisation; Landis (1924) facial expression study.',
      'BPS Code of Ethics (2021): Respect, Competence, Responsibility and Integrity govern modern ethics committees.'],
    ['Benefits to society & participants', GREEN,
      'Illuminating human nature: Milgram exposed how ordinary citizens obey destructive authority, transforming military, aviation and hospital whistleblowing training.',
      'Participant insight: 84% of Milgram participants later reported being glad they took part, and only 1.3% regretted it after debriefing.',
      'Real-world reform: Loftus & Palmer (1974) reformed police cognitive interviewing (PEACE), and Bowlby (1951) transformed paediatric hospital visiting hours.'],
    ['Negative societal consequences', AMBER,
      'Socially sensitive research (Sieber & Stanley, 1988): studies whose findings may stigmatise groups or be co-opted for harmful public policy.',
      'Examples: Burt (1955) fabricated twin IQ data shaping the 11-plus; Yerkes (1917) eugenics policies; Kanner/Bettelheim refrigerator mother blaming parents of autistic children.',
      'Cost-benefit dilemma: researchers can control participant welfare in the lab, but cannot fully control how media or politicians weaponise published findings.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 20);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25 });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
    text(x, 'Core governance', px + PW / 2, y + 24, { size: 18, bold: true, color: p[1] });
    wrap(x, p[4], px + 24, px + PW - 24, y + 52, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'Aronson (1988) ethical dilemma: truth versus protection',
    'Strict adherence to informed consent eliminates demand-characteristic-free research into obedience, conformity and bystander apathy. Ethics committees use utilitarian cost-benefit analysis, but Baumrind (1964) argues participant dignity and trust should never be sacrificed for abstract knowledge.',
    { bodyY: 58 });
  return { file: 'psych-controversy-ethical-costs.png' };
}

/* ---------- Page 6: Non-human animals in psychology ---------- */
function animalResearch() {
  const [c, x] = make(W, 1086);
  title2(x, 'Controversy 4: Use of non-human animals in psychology');
  sub2(x, 'BPS guidelines, Russell & Burch (1959) 3Rs, comparative psychology, therapy and speciesism');

  const cols = [60, 516, 972], PW = 416, rows = [130, 490], PH = 320;
  const panels = [
    ['1. UK Law & BPS Guidelines', 'Animals (Scientific Procedures) Act 1986 and BPS (2020) Guidelines mandate project/personal/establishment licences, caging suited to species ecology, and veterinary care.', BLUE],
    ['2. Russell & Burch (1959) 3Rs', 'Replacement (use computer simulations, cell cultures or human volunteers), Reduction (minimum sample size needed for statistical power), and Refinement (minimise pain/distress).', PURPLE],
    ['3. Comparative & ethological value', 'Skinner (1938) rats, Pavlov (1927) dogs, Harlow (1958) rhesus monkeys, Blakemore & Cooper (1970) kittens and Randrup & Munkvad (1966) amphetamine rats built core theory.', GREEN],
    ['4. Animals as therapeutic devices', 'Animal-Assisted Therapy (AAT): Grandin (2015), O Haire (2013) for autistic children social engagement, and Odendaal (2000) showing dog stroking lowers cortisol and raises oxytocin.', AMBER],
    ['5. Speciesism (Singer, 1975)', 'Peter Singer argues discriminating against sentient beings solely on species membership mirrors racism/sexism; Regan (1983) animal rights view rejects all invasive animal use.', RED],
    ['6. Generalisability & Bateson cube', 'Bateson (1986) decision cube approves research only when certainty of benefit is high, research quality is high and animal suffering is low; human cerebral cortex differs markedly.', DARK],
  ];
  panels.forEach((p, i) => {
    const px = cols[i % 3], py = rows[Math.floor(i / 3)];
    box(x, px, py, PW, PH);
    panelHeader(x, px + 16, py + 42, i + 1, p[0].replace(/^\d+\.\s*/, ''), p[2], 20);
    wrap(x, p[1], px + 24, px + PW - 24, py + 92, { size: 18, lh: 26 });
  });
  band(x, 850, 206, 'Why WJEC includes animals as a therapeutic device',
    'The WJEC specification explicitly requires learners to discuss non-human animals not only as laboratory subjects (comparative psychology) but also as therapeutic aids (e.g. assistance dogs for autism, PTSD or blood pressure reduction), where welfare of the therapy animal must still be protected.',
    { bodyY: 58 });
  return { file: 'psych-controversy-animals.png' };
}

/* ---------- Page 9: Bateson's Cube & Sieber and Stanley ---------- */
function decisionFrameworks() {
  const [c, x] = make(W, 1086);
  title2(x, 'Ethical decision frameworks in human and animal research');
  sub2(x, 'Sieber & Stanley (1988) socially sensitive dimensions and Bateson (1986) decision cube');

  const cols = [60, 516, 972], PW = 416, PY = 120, PH = 650;
  const panels = [
    ['Sieber & Stanley (1988)', BLUE,
      '1. The research question: does phrasing presuppose group inferiority (e.g. asking if one group is genetically more criminal)?',
      '2. Treatment of participants: confidentiality, privacy and psychological safety when disclosing sensitive traits (e.g. addiction or HIV).',
      '3. Institutional context & use of findings: who funds the research and how media/governments might apply it to justify discrimination.'],
    ['Bateson (1986) Cube', PURPLE,
      'Three axes evaluated simultaneously before licensing an animal study: (1) Degree of animal suffering (low to high), (2) Quality of scientific design (low to high), (3) Certainty of medical/educational benefit (low to high).',
      'Decision rule: if suffering is high and benefit is uncertain (e.g. Harlow pit of despair), the cube stays opaque and the study must be rejected.',
      'Evaluation: provides a transparent utilitarian framework, though abolitionists argue sentience cannot be traded on a graph.'],
    ['Evolution of ethical standards', GREEN,
      '1920s-1960s: minimal regulation permitted Little Albert, Monster Study (Tudor, 1939), Harlow, Milgram and Humphrey Tearoom Trade.',
      '1970s-present: APA (1973), BPS Code of Human Research Ethics (2021) and UK ASPA (1986) introduced mandatory IRB/ethics pre-approval, right to withdraw and the 3Rs.',
      'Modern replication: Burger (2009) replicated Milgram ethically up to 150V by screening out anxious participants and stopping early.'],
  ];
  panels.forEach((p, i) => {
    const px = cols[i];
    box(x, px, PY, PW, PH);
    panelHeader(x, px + 16, PY + 42, i + 1, p[0], p[1], 21);
    let y = wrap(x, p[2], px + 24, px + PW - 24, PY + 92, { size: 17, lh: 25 });
    y = wrap(x, p[3], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
    y = wrap(x, p[4], px + 24, px + PW - 24, y + 18, { size: 17, lh: 24, color: SOFT });
  });
  band(x, 804, 250, 'How Burger (2009) shows ethics and validity can coexist',
    'Critics often claim ethical guidelines paralyse meaningful social psychology. Burger (2009) disproved this by stopping at 150 volts (the point where 79% of Milgram participants who continued went all the way to 450V), finding 70% obedience while protecting participant welfare.',
    { bodyY: 58 });
  return { file: 'psych-controversy-decision-frameworks.png' };
}

(async () => {
  if (require.main !== module) return;
  const only = process.env.RENDER_ONLY ? [process.env.RENDER_ONLY] : null;
  const done = await H.run([ethicalCosts, animalResearch, decisionFrameworks], only);
  console.log(JSON.stringify(done));
})();
module.exports = { ethicalCosts, animalResearch, decisionFrameworks };