import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId, difficulty = 'intermediate', questionTypes = ['multiple_choice'], keywords = [] } = await req.json();

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

    // Build keyword focus instruction
    const keywordInstruction = keywords.length > 0
      ? `\nKEYWORD FOCUS: The following specific keywords/concepts have been requested - prioritise these heavily in all generated questions, flashcards, and activities: ${keywords.join(', ')}. Every question should incorporate or directly relate to at least one of these keywords.`
      : '';

    const randomSeed = Math.floor(Math.random() * 10000);
    const timestamp = Date.now();

    const prompt = `You are an A-level examination board content creator. Based on the following lesson, create rigorous assessment materials.

Lesson Title: ${lessonTitle}
Lesson Description: ${lessonDescription}
Learning Objectives:
${learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

DIFFICULTY LEVEL: ${difficulty.toUpperCase()}
${difficultyGuidance[difficulty] || difficultyGuidance.intermediate}
${keywordInstruction}

QUESTION TYPES REQUESTED: ${questionTypes.join(', ')}
${typeInstructions.map((t, i) => `${i + 1}. ${t}`).join('\n')}

CONTENT ALIGNMENT REQUIREMENTS:
1. ONLY create questions that DIRECTLY test the learning objectives listed above
2. EVERY question MUST relate to the specific lesson title and description
3. DO NOT include general knowledge questions - all content must be specifically about THIS lesson
4. DO NOT introduce concepts not mentioned in the learning objectives
5. Each question should explicitly address at least one of the numbered learning objectives

VARIETY REQUIREMENT (Generation #${randomSeed} at ${timestamp}):
Create COMPLETELY NEW and DIFFERENT questions from any previous generations while staying strictly within the lesson scope.

Generate the following in valid JSON format:

{
  "summary": {
    "overview": "concise 2-3 sentence overview of the entire lesson",
    "keyPoints": ["bullet point 1", "bullet point 2", "bullet point 3"],
    "prerequisites": ["prerequisite knowledge 1", "prerequisite knowledge 2"],
    "realWorldRelevance": "why this topic matters in real life"
  },
  "contentChunks": [
    {
      "title": "digestible topic section title",
      "summary": "2-3 sentence summary of this chunk",
      "keyTakeaway": "single most important thing to remember",
      "difficulty": "${difficulty}"
    }
  ],
  "examples": [
    {
      "title": "example title",
      "description": "detailed example explanation",
      "type": "worked_example|case_study|real_world_application",
      "difficulty": "${difficulty}",
      "relatedConcepts": ["concept 1", "concept 2"]
    }
  ],
  "resources": [
    {
      "title": "resource title",
      "type": "video|article|interactive|book|research_paper",
      "description": "what this resource covers and why it's useful",
      "difficulty": "${difficulty}",
      "estimatedTime": "time in minutes",
      "url": "suggested search query or general URL pattern"
    }
  ],
  "matchingPairs": [
    { "left": "term or concept", "right": "definition or explanation" }
  ],
  ${typeSchemas.join(',\n  ')},
  "flashCards": [
    { "front": "question or term (use LaTeX for math/science)", "back": "answer or definition (use LaTeX for math/science)" }
  ],
  "essayQuestions": [
    {
      "question": "essay prompt requiring detailed analysis or explanation",
      "rubric": "key points that should be covered in a good answer",
      "wordCount": ${difficulty === 'basic' ? 150 : difficulty === 'advanced' ? 400 : 250},
      "tips": "guidance for students"
    }
  ],
  "fillInTheBlanks": [
    {
      "text": "sentence with __blank__ markers for missing words",
      "blanks": ["correct answer 1", "correct answer 2"],
      "hint": "optional hint"
    }
  ]
}

STRICT REQUIREMENTS based on difficulty (${difficulty}):
- Create exactly 6 matching pairs - ONLY use terms/concepts from the learning objectives
${questionTypes.includes('multiple_choice') ? `- Create exactly 10 multiple choice quiz questions at ${difficulty} level` : ''}
${questionTypes.includes('true_false') ? `- Create exactly 8 true/false questions at ${difficulty} level` : ''}
${questionTypes.includes('short_answer') ? `- Create exactly 6 short answer questions at ${difficulty} level` : ''}
- Create exactly 12 flashcards - ONLY covering terms from THIS lesson
- Create exactly 3 essay questions at ${difficulty} level
- Create exactly 5 fill-in-the-blank exercises
- Use mathematical notation with LaTeX: $...$ for inline, $$...$$ for display
- For chemistry: use \\ce{...} for chemical formulas (e.g., \\ce{H2SO4})
- For multiple choice: distribute correct answers randomly across all 4 positions (not always 0 or 1)

FINAL VALIDATION - Before submitting, verify:
- Every question can be answered using ONLY knowledge from this lesson
- All questions match the requested difficulty: ${difficulty}
- ${keywords.length > 0 ? `Questions prioritise the requested keywords: ${keywords.join(', ')}` : 'Questions cover the breadth of the learning objectives'}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: `You are an A-level examination board content creator with expertise in creating rigorous, academically challenging assessment materials that STRICTLY align with specified learning objectives. You adapt your content difficulty precisely to the requested level (basic/intermediate/advanced). Your PRIMARY responsibility is ensuring every single question directly tests the provided learning objectives. Create questions that match A-level exam standards with proper mathematical notation, clear academic language, and appropriate depth. CRITICAL: For multiple choice questions, randomly vary which position (0, 1, 2, or 3) contains the correct answer - do NOT always make option 0 or 1 correct. Always respond with valid JSON only.` 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.85,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return Response.json({
      success: true,
      difficulty,
      questionTypes,
      keywords,
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
    return Response.json({ 
      error: 'Failed to generate interactive content',
      details: error.message 
    }, { status: 500 });
  }
});