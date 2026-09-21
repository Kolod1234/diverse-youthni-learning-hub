# Lesson quality standard — all subjects (persistent authoring guidance)

This file stores the master authoring standard supplied by the app owner. Apply it
whenever creating, expanding, revising or auditing lessons in this application,
across every subject, curriculum and qualification level.

## 1. Curriculum and coverage
- Identify subject, learner age, qualification, awarding body, course and intended
  outcomes before authoring; check the current official specification.
- Do not confuse stages, units or prerequisites. Label enrichment/extension
  material accurately.
- Map required outcomes to chapters; preserve useful developed content; verify
  facts, terminology, formulas, procedures and data against authoritative
  sources. Never invent evidence, sources, quotations or exam provenance.

## 2. Complete textbook teaching
- Write coherent textbook chapters, not presentation notes. A first-time learner
  must follow without a tutor supplying omitted reasoning.
- Teach purpose, prior knowledge, definitions, principles, mechanisms, examples,
  conditions, exceptions, applications and misconceptions. Define terms before
  depending on them. Explain what happens and why.
- Connected explanatory prose is the main form; lists only where steps,
  conditions or comparisons genuinely benefit; callouts only for precise
  definitions, key relationships, safety or misconceptions.
- Follow the established page format of the target course (e.g. 15 substantive
  pages for GCSE Single Award Science), split at meaningful conceptual
  boundaries. No filler. Consistent heading hierarchy, typography, notation,
  captions, example and answer presentation.

## 3. Explain intermediate reasoning in every subject
- Show every step: no "clearly", "simply", "solve similarly".
- Maths/quantitative: define symbols and domains; show substitutions, algebra,
  conversions, units, signs, checks; exact vs approximate; proper rendered
  notation with stacked fractions.
- Biology/chemistry/physics: identify structures, substances, locations,
  starting conditions; explain each event and causal link; check bonds,
  charges, units, state symbols, scales; explain model limitations.
- English/languages: provide the passage or extract; explain terminology through
  exact words; model writing; distinguish plausible from unsupported readings;
  use licensed/original texts.
- Humanities/social sciences: context, sequence, causation, evidence, competing
  explanations, limitations; accurate maps, timelines, data.
- Computing/business/arts/vocational: worked examples of the actual process;
  test runnable code where feasible; assessment criteria for open work.
- Practical activities: apparatus, preparation, method, variables, measurements,
  risks, analysis, uncertainty, improvements — not decorative flowcharts.

## 4. Worked examples, practice and answers
- Teach before testing. Every worked example: complete problem, justified
  approach, intermediate reasoning, checked result.
- Every practice question has a complete worked answer/model response (hidden
  behind a reveal control in this app). Open-ended questions acknowledge
  defensible alternatives.
- Match command words and difficulty to the qualification; never present
  questions as official examination material.
- Check linked topic quizzes for stale content after revising a lesson; never
  alter learner progress or submit answers to test pages.

## 5. Professional image production (required for every image)
- Visual brief per asset: exact lesson and page, teaching purpose, required
  content, source/data, labels, layout. Plan visuals during lesson planning.
- Production method per content: precise plotting for graphs; accurate technical
  illustration for structures/apparatus; properly licensed authentic images where
  the lesson depends on real evidence; generation tools only for suitable
  original illustration (never as authentic evidence).
- All final images: purposeful composition, crisp lines, resolution sharp at
  largest display size, correctly spelled labels, consistent typography and
  colour conventions, adequate contrast, accurate structures/arrows/leader
  lines, no overlapping labels, clipping, artefacts or misleading perspective.
- Prefer clear 2D textbook diagrams for technical explanations.
- Create the actual final PNG or JPEG asset (no SVG lesson diagrams or
  placeholder paths). Descriptive alt text and a caption with teaching point
  for each image.
- (Owner's instruction was truncated by the platform at section 5; sections
  above capture the full received text. General principles that follow:
  verify final assets visually before publication, audit for label overlaps and
  artefacts, and keep British English spelling throughout.)

## 6. Interactive tutor writing style (owner's standing requirement, Sept 2026)
- Lessons must read as a one-to-one tutoring session, not academic prose. Address
  the student as "you"; weave in a short thinking or prediction question roughly
  every 150 to 250 words ("Pause and predict...", "Your turn...", "Quick check...")
  and let the following text answer it. Vary the phrasing; never repeat the same
  prompt twice; do not convert teaching pages into quizzes.
- Never join or bracket clauses with an em dash (—) or en dash (–). Use full
  stops, commas, colons or brackets. Rewrite ranges as "1945 to 1955".
- No bold UPPERCASE labels run into a paragraph. Every label becomes a proper
  sentence-case <h4> subheading on its own line, followed by the paragraph.
- Short clear sentences (12 to 25 words), one idea per paragraph, no paragraph
  over ~110 words. British English throughout.
- These rules apply to all subjects from the 15-page AS/A-level and GCSE sets
  onward; sociology lessons are being converted via the interactiveSociologyRewrite
  function, which validates every rewritten page (image tags, classes, styles,
  length, key names, question count, zero em dashes) before saving.

## 7. Interactive tutor checkpoint dialogues (owner's standing requirement, Sept 2026)
- Directly after a block that finishes teaching a concept, definition, study or
  finding, insert a small "Tutor check-in" dialogue box: a multiple-choice
  question in the tutor's voice (e.g. "Which of these do you think is not
  material culture?") with 4 options, exactly one correct, drawn from the page's
  material or common misconceptions.
- The widget answers the student instantly: a correct choice earns warm praise
  plus a one-to-two-sentence explanation of why it is right; every wrong choice
  gets its own "Not quite." feedback naming the correct option and explaining
  both why the chosen one is wrong and why the right one is right.
- Checkpoints sit alongside, and never replace, the page's thinking questions,
  practice questions and worked answers. One or two per page, only after new
  concepts have actually been taught; no checkpoints on pages that are purely
  practice, answers or diagrams without new teaching.
- Implementation in this app: the insertTutorCheckpoints function splices
  validated `.tutor-checkpoint` blocks into the lesson HTML at block boundaries
  (existing content, images and answers are never altered), and the front end
  renders them as interactive dialogue boxes via the delegated handler in
  src/components/lesson/tutorCheckpoint.js. New lessons in all subsequent
  courses must include checkpoints in this format from the start.

## Course plan: WJEC A2 Criminology (Diploma Extension, from Sept 2026)
- Qualification: WJEC Level 3 Applied Diploma in Criminology, Diploma
  Extension course (Units 3 and 4). Unit 3 Crime Scene to Courtroom is
  internally assessed (controlled assignment); Unit 4 Crime and Punishment is
  externally examined. Author against the current WJEC specification PDF
  (wjec-applied-diploma-in-criminology-spec).
- Lesson outline lives in scripts/wjec-a2-crim/outline.cjs (16 lessons:
  8 for Unit 3, 8 for Unit 4). Lessons follow the 15-page structure
  (6,000+ words), tutor voice, thinking questions, hand-authored
  .tutor-checkpoint blocks (markup per section 7), hidden-answer practice,
  and Canvas PNG diagrams in public/lesson-assets/wjec-a2-criminology/
  rendered via scripts/wjec-a2-crim/diagram-helpers.cjs + render-unit3-lN.cjs.
- Apply lesson pages to the course with the scripts/wjec-a2-crim/lN-pages-M.cjs
  files (never regenerate authored pages with the LLM).

## App conventions
- Course: GCSE Single Award Science (CCEA) — 15 substantive pages per lesson,
  exam-style practice with hidden answers, misconception callouts, custom
  Canvas-plotted PNG diagrams at high resolution (white background, no edge
  clipping), saved under public/lesson-assets/sas-biology/ and referenced with
  alt text + captions. Lessons ~90 minutes. British English spelling
  (fertilisation, oestrogen, colour).