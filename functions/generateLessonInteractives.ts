import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId } = await req.json();

    // Get lesson details
    const lessons = await base44.entities.Lesson.filter({ id: lessonId });
    const lesson = lessons[0];

    if (!lesson) {
      return Response.json({ error: 'Lesson not found' }, { status: 404 });
    }

    const learningObjectives = lesson.learning_objectives || [];
    const lessonTitle = lesson.title || '';
    const lessonDescription = lesson.description || '';

    // Generate interactive content using AI with randomization
    const randomSeed = Math.floor(Math.random() * 10000);
    const timestamp = Date.now();
    
    const prompt = `You are an A-level examination board content creator. Based on the following lesson, create rigorous A-level standard assessment materials.

Lesson Title: ${lessonTitle}
Lesson Description: ${lessonDescription}
Learning Objectives:
${learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

CRITICAL: This is generation #${randomSeed} at ${timestamp}. Create COMPLETELY NEW and DIFFERENT questions from any previous generations. Use varied examples, different question phrasings, alternative perspectives, and diverse scenarios.

Generate the following in valid JSON format:

{
  "matchingPairs": [
    { "left": "term or concept", "right": "definition or explanation" }
  ],
  "quizQuestions": [
    {
      "question": "question text with mathematical notation in LaTeX format where appropriate (e.g., $x^2$, $$E=mc^2$$, \\ce{H2O})",
      "options": ["option A", "option B", "option C", "option D"],
      "correctAnswer": 0,
      "explanation": "detailed explanation with reasoning"
    }
  ],
  "flashCards": [
    { "front": "question or term (use LaTeX for math/science)", "back": "answer or definition (use LaTeX for math/science)" }
  ]
}

STRICT A-LEVEL REQUIREMENTS:
- Create exactly 6 matching pairs with A-level terminology
- Create exactly 10 challenging quiz questions at A-level standard
- Each quiz question MUST have exactly 4 options (A, B, C, D)
- Distribute correct answers randomly across all 4 options (not just A or B)
- Questions must require deep understanding, not just recall
- Include questions requiring: analysis, evaluation, application of knowledge
- Use mathematical notation with LaTeX where appropriate: $...$$ for inline, $$...$$ for display
- For chemistry: use \\ce{...} for chemical formulas (e.g., \\ce{H2SO4})
- For physics: include units, calculations, and equations
- Create exactly 12 flashcards for key concepts
- Make questions exam-style: clear, unambiguous, academically rigorous
- Include real-world applications and problem-solving scenarios
- Ensure plausible distractors (wrong answers that seem reasonable)
- Vary difficulty: 3 challenging, 4 medium, 3 advanced questions`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an A-level examination board content creator with expertise in creating rigorous, academically challenging assessment materials. Create questions that match A-level exam standards with proper mathematical notation, clear academic language, and appropriate depth. CRITICAL: When providing 4 options, randomly vary which position (0, 1, 2, or 3) contains the correct answer - do NOT always make option 0 or 1 correct. Distribute correct answers evenly across all four positions. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    return Response.json({
      success: true,
      matchingPairs: content.matchingPairs || [],
      quizQuestions: content.quizQuestions || [],
      flashCards: content.flashCards || []
    });

  } catch (error) {
    console.error('Error generating interactives:', error);
    return Response.json({ 
      error: 'Failed to generate interactive content',
      details: error.message 
    }, { status: 500 });
  }
});