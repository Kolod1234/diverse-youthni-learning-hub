import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId, difficulty = 'intermediate', questionTypes = ['multiple_choice'], keywords = [], generationIndex = 0, previousAngles = [], sessionSeed = 0 } = await req.json();

    // Get lesson details
    let lesson;
    try {
      lesson = await base44.entities.Lesson.get(lessonId);
    } catch (error) {
      if (error.status === 404) {
        return Response.json({ error: 'Lesson not found' }, { status: 404 });
      }
      throw error;
    }

    if (!lesson) {
      return Response.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const learningObjectives = lesson.learning_objectives || [];
    const lessonTitle = lesson.title || '';
    const lessonDescription = lesson.description || '';

    // Build difficulty guidance with Bloom's taxonomy levels
    const difficultyGuidance = {
      easy: `EASY LEVEL - Bloom's Taxonomy: Remember & Understand (Levels 1-2)
- Test ONLY direct recall of facts, definitions, and basic identification
- Questions must be answerable by simply remembering stated facts from the lesson
- Use phrases like: "What is...", "Define...", "Which of the following is...", "Name...", "Identify..."
- Wrong answer options should be plausible but clearly distinguishable from the correct answer
- NO application, analysis, or reasoning required - pure knowledge recall only
- Example style: "What is the function of the mitochondria?" NOT "How does mitochondrial dysfunction affect cellular respiration?"`,
      intermediate: `MEDIUM LEVEL - Bloom's Taxonomy: Apply & Analyse (Levels 3-4)
- Test application of knowledge to new scenarios and analysis of relationships
- Students must USE their knowledge, not just recall it
- Use phrases like: "Explain why...", "How does X affect Y...", "Compare...", "What would happen if...", "Calculate...", "Predict..."
- Wrong answer options must be genuinely tricky - common misconceptions or partially correct answers
- Require multi-step thinking or connecting two concepts together
- Example style: "If the concentration of substrate doubles, explain the effect on enzyme reaction rate" NOT "What is enzyme activity?"`,
      advanced: `HARD LEVEL - Bloom's Taxonomy: Evaluate & Create (Levels 5-6)
- Test critical evaluation, synthesis of multiple concepts, and complex multi-step reasoning
- Questions should challenge even well-prepared students
- Use phrases like: "Evaluate...", "Justify...", "To what extent...", "Critically assess...", "Synthesise...", "Analyse the relationship between..."
- Wrong answer options must be sophisticated - subtle distinctions, common A-level exam traps, or require ruling out plausible alternatives
- Require integrating multiple learning objectives simultaneously
- Questions should mirror actual A-level exam mark scheme language and structure
- Example style: "Evaluate the evidence for and against the fluid mosaic model, considering how it explains membrane permeability" NOT "Describe the fluid mosaic model"`
    };

    // Build question type schema guidance
    const typeInstructions = [];
    const typeSchemas = [];

    if (questionTypes.includes('multiple_choice')) {
      typeInstructions.push('Multiple Choice: 4 options, one correct answer (index 0-3, distribute randomly), with detailed explanation');
      typeSchemas.push(`
  "quizQuestions": [
    {
      "question": "question text (use LaTeX for math: $x^2$, $$E=mc^2$$; chemistry: \\\\ce{H2O})",
      "question_type": "multiple_choice",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": 0,
      "explanation": "detailed explanation"
    }
  ]`);
    }

    if (questionTypes.includes('true_false')) {
      typeInstructions.push('True/False: a clear statement that is definitively true or false, with explanation of why');
      typeSchemas.push(`
  "trueFalseQuestions": [
    {
      "statement": "a clear factual statement about the lesson content",
      "question_type": "true_false",
      "isTrue": true,
      "explanation": "why this is true or false"
    }
  ]`);
    }

    if (questionTypes.includes('short_answer')) {
      typeInstructions.push('Short Answer: open-ended questions requiring a concise 1-3 sentence response, with a model answer provided');
      typeSchemas.push(`
  "shortAnswerQuestions": [
    {
      "question": "question requiring a short written response",
      "question_type": "short_answer",
      "modelAnswer": "ideal concise answer (1-3 sentences)",
      "keyPoints": ["key point 1", "key point 2"],
      "marks": 2
    }
  ]`);
    }

    if (questionTypes.includes('fill_blanks')) {
      typeInstructions.push('Fill in the Blanks: use __blank__ exactly once or twice in each sentence and provide the answers in matching order');
      typeSchemas.push(`
  "fillInTheBlanks": [
    {
      "text": "A lesson-specific sentence with a __blank__ to complete.",
      "blanks": ["correct answer"],
      "hint": "a concise clue that does not reveal the answer"
    }
  ]`);
    }

    if (questionTypes.includes('flashcards')) {
      typeInstructions.push('Flashcards: concise lesson-specific terms or prompts on the front and precise answers on the back');
      typeSchemas.push(`
  "flashCards": [
    {
      "front": "specific term or prompt from THIS lesson",
      "back": "precise definition or answer"
    }
  ]`);
    }

    if (questionTypes.includes('essay')) {
      typeInstructions.push('Essay: an A-level extended-response question with a usable mark-scheme rubric and exam-technique tip');
      typeSchemas.push(`
  "essayQuestions": [
    {
      "question": "essay prompt at the requested difficulty",
      "rubric": "specific mark-scheme points",
      "wordCount": 250,
      "tips": "exam technique advice"
    }
  ]`);
    }

    const responseFieldByType = {
      multiple_choice: 'quizQuestions',
      true_false: 'trueFalseQuestions',
      short_answer: 'shortAnswerQuestions',
      fill_blanks: 'fillInTheBlanks',
      flashcards: 'flashCards',
      essay: 'essayQuestions'
    };
    const requiredResponseFields = [...new Set(questionTypes.map(type => responseFieldByType[type]).filter(Boolean))];

    if (requiredResponseFields.length === 0) {
      return Response.json({ error: 'No supported question types were requested' }, { status: 400 });
    }

    // Build keyword focus instruction
    const keywordInstruction = keywords.length > 0
      ? `\nKEYWORD FOCUS: The following specific keywords/concepts have been requested - prioritise these heavily in all generated questions, flashcards, and activities: ${keywords.join(', ')}. Every question should incorporate or directly relate to at least one of these keywords.`
      : '';

    const randomSeed = Math.floor(Math.random() * 10000);
    const timestamp = Date.now();
    // Use a combined seed that incorporates session, generation count, and random to ensure true uniqueness
    const combinedSeed = (sessionSeed + generationIndex * 7919 + randomSeed) % 99999;

    const difficultyLabel = { easy: 'EASY', intermediate: 'MEDIUM', advanced: 'HARD' }[difficulty] || 'MEDIUM';

    // Rotate through distinct questioning angles - exclude recently used ones
    const allAngles = [
      { label: 'CAUSES & MECHANISMS', instruction: 'Focus questions on WHY and HOW things happen - causes, triggers, mechanisms, and processes.' },
      { label: 'EFFECTS & CONSEQUENCES', instruction: 'Focus questions on WHAT HAPPENS as a result - outcomes, impacts, knock-on effects, and consequences.' },
      { label: 'COMPARISONS & CONTRASTS', instruction: 'Focus questions on SIMILARITIES AND DIFFERENCES - compare processes, structures, or concepts against each other.' },
      { label: 'REAL-WORLD APPLICATIONS', instruction: 'Focus questions on WHERE and HOW this applies in real life - practical uses, clinical examples, engineering scenarios, or everyday situations.' },
      { label: 'EXCEPTIONS & EDGE CASES', instruction: 'Focus questions on WHEN things don\'t follow the expected pattern - exceptions, limitations, special conditions, and boundary cases.' },
      { label: 'DEFINITIONS & TERMINOLOGY', instruction: 'Focus questions on PRECISE LANGUAGE - exact definitions, correct terminology, distinguishing between similar terms.' },
      { label: 'SEQUENCES & PROCESSES', instruction: 'Focus questions on ORDER AND STEPS - what comes first, stages of processes, sequences of events.' },
      { label: 'EVIDENCE & JUSTIFICATION', instruction: 'Focus questions on PROOF AND REASONING - what evidence supports a claim, how to justify a conclusion, what experiments or data show.' },
      { label: 'MISCONCEPTIONS & COMMON ERRORS', instruction: 'Focus questions on what students typically get WRONG - common mistakes, misconceptions, and traps to avoid.' },
      { label: 'QUANTITATIVE & DATA INTERPRETATION', instruction: 'Focus questions on NUMBERS, GRAPHS, and DATA - calculations, reading graphs, interpreting statistics, units.' },
    ];

    // Filter out recently used angles, then pick one
    const availableAngles = allAngles.filter(a => !previousAngles.includes(a.label));
    const anglePool = availableAngles.length > 0 ? availableAngles : allAngles;
    const angle = anglePool[combinedSeed % anglePool.length];

    const prompt = `You are a UK A-level examiner creating assessment questions for the following lesson. Your questions MUST be genuinely differentiated by the requested difficulty level.

Lesson Title: ${lessonTitle}
Lesson Description: ${lessonDescription}
Learning Objectives:
${learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

===== DIFFICULTY: ${difficultyLabel} =====
${difficultyGuidance[difficulty] || difficultyGuidance.intermediate}
${keywordInstruction}

QUESTION TYPES TO GENERATE: ${questionTypes.join(', ')}
${typeInstructions.map((t, i) => `${i + 1}. ${t}`).join('\n')}

STRICT CONTENT RULES:
1. Questions MUST be directly about THIS lesson's specific content - not generic subject questions
2. Each question must test a NAMED concept, process, or fact from the lesson title/description/objectives
3. Do NOT write questions that could appear on any other lesson - they must be uniquely tied to this topic
4. All distractors (wrong answers) must be specifically wrong for THIS topic, not random fillers

THIS GENERATION'S MANDATORY ANGLE — Session Run #${combinedSeed} (Generation ${generationIndex + 1}): ${angle.label}
${angle.instruction}
Every single question in this batch MUST be shaped around this angle. Do NOT mix in questions from a different angle.
Previously used angles (DO NOT repeat these): ${previousAngles.length > 0 ? previousAngles.join(', ') : 'none yet'}

Generate ONLY the requested question types in this JSON format:

{
  ${typeSchemas.join(',\n  ')}
}

QUANTITY:
${questionTypes.includes('multiple_choice') ? `- Exactly 10 MCQ questions. At ${difficultyLabel} level: ${difficulty === 'easy' ? 'test recall of facts only' : difficulty === 'advanced' ? 'require multi-concept reasoning, use A-level command words' : 'require application of concepts to scenarios'}` : ''}
${questionTypes.includes('true_false') ? `- Exactly 8 true/false statements. At ${difficultyLabel} level: ${difficulty === 'easy' ? 'test basic factual accuracy' : difficulty === 'advanced' ? 'include nuanced statements that require careful analysis to classify' : 'test understanding of mechanisms and relationships'}` : ''}
${questionTypes.includes('short_answer') ? `- Exactly 6 short answer questions. At ${difficultyLabel} level: ${difficulty === 'easy' ? '1-sentence factual answers' : difficulty === 'advanced' ? '3-4 sentence analytical responses citing specific mechanisms' : '2-3 sentence explanations'}` : ''}
${questionTypes.includes('fill_blanks') ? '- Exactly 6 fill-in-the-blank exercises, each with one or two unambiguous blanks' : ''}
${questionTypes.includes('flashcards') ? '- Exactly 8 flashcards covering key terms from THIS specific lesson' : ''}
${questionTypes.includes('essay') ? '- Exactly 2 essay questions' : ''}

NOTATION: Use LaTeX $...$ for inline math, $$...$$ for display math. Chemistry: \\ce{H2SO4}
MCQ correct answer position: vary randomly across positions 0, 1, 2, 3 - do NOT cluster at position 0 or 1.

SELF-CHECK before outputting: Are these questions noticeably different from what ${difficultyLabel === 'EASY' ? 'a medium' : difficultyLabel === 'HARD' ? 'a medium' : 'an easy or hard'} difficulty set would look like? If not, revise them.`;

    const content = await base44.integrations.Core.InvokeLLM({
      prompt: `You are a senior UK A-level examiner and assessment specialist. Create questions that are precisely calibrated to the requested difficulty tier using Bloom's Taxonomy. Questions must be specific to the lesson, and distractors must target genuine misconceptions.

${prompt}`,
      response_json_schema: {
        type: 'object',
        required: requiredResponseFields,
        properties: {
          quizQuestions: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                question_type: { type: 'string' },
                options: { type: 'array', items: { type: 'string' } },
                correctAnswer: { type: 'number' },
                explanation: { type: 'string' }
              }
            }
          },
          trueFalseQuestions: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              properties: {
                statement: { type: 'string' },
                question_type: { type: 'string' },
                isTrue: { type: 'boolean' },
                explanation: { type: 'string' }
              }
            }
          },
          shortAnswerQuestions: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                question_type: { type: 'string' },
                modelAnswer: { type: 'string' },
                keyPoints: { type: 'array', items: { type: 'string' } },
                marks: { type: 'number' }
              }
            }
          },
          flashCards: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              properties: {
                front: { type: 'string' },
                back: { type: 'string' }
              }
            }
          },
          essayQuestions: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                rubric: { type: 'string' },
                wordCount: { type: 'number' },
                tips: { type: 'string' }
              }
            }
          },
          fillInTheBlanks: {
            type: 'array',
            minItems: 1,
            items: {
              type: 'object',
              properties: {
                text: { type: 'string' },
                blanks: { type: 'array', items: { type: 'string' } },
                hint: { type: 'string' }
              }
            }
          }
        }
      },
      model: 'gemini_3_flash'
    });

    if (!content || typeof content !== 'object') {
      throw new Error('The AI service returned an invalid response');
    }

    const missingFields = requiredResponseFields.filter(field => !Array.isArray(content[field]) || content[field].length === 0);
    if (missingFields.length > 0) {
      throw new Error(`The AI service returned no usable content for: ${missingFields.join(', ')}`);
    }

    return Response.json({
      success: true,
      difficulty,
      questionTypes,
      keywords,
      angleUsed: angle.label,
      summary: content.summary || null,
      contentChunks: content.contentChunks || [],
      examples: content.examples || [],
      resources: content.resources || [],
      matchingPairs: content.matchingPairs || [],
      quizQuestions: content.quizQuestions || [],
      trueFalseQuestions: content.trueFalseQuestions || [],
      shortAnswerQuestions: content.shortAnswerQuestions || [],
      flashCards: content.flashCards || [],
      essayQuestions: content.essayQuestions || [],
      fillInTheBlanks: content.fillInTheBlanks || []
    });

  } catch (error) {
    console.error('Error generating interactives:', error);
    const upstreamStatus = Number(error?.status || error?.response?.status);
    const status = upstreamStatus === 429
      ? 429
      : upstreamStatus >= 400 && upstreamStatus < 500
        ? upstreamStatus
        : 502;

    return Response.json({
      error: status === 429
        ? 'Interactive content generation is temporarily busy'
        : 'Failed to generate interactive content',
      details: error?.message || 'Unknown generation error'
    }, { status });
  }
});