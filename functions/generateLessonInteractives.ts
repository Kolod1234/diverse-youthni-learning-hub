import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lessonId } = await req.json();

    // Get lesson details (use get instead of filter to avoid rate limits)
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
      "difficulty": "basic|intermediate|advanced"
    }
  ],
  "examples": [
    {
      "title": "example title",
      "description": "detailed example explanation",
      "type": "worked_example|case_study|real_world_application",
      "difficulty": "basic|intermediate|advanced",
      "relatedConcepts": ["concept 1", "concept 2"]
    }
  ],
  "resources": [
    {
      "title": "resource title",
      "type": "video|article|interactive|book|research_paper",
      "description": "what this resource covers and why it's useful",
      "difficulty": "beginner|intermediate|advanced",
      "estimatedTime": "time in minutes",
      "url": "suggested search query or general URL pattern"
    }
  ],
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
  ],
  "essayQuestions": [
    {
      "question": "essay prompt requiring detailed analysis or explanation",
      "rubric": "key points that should be covered in a good answer",
      "wordCount": 250,
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

STRICT A-LEVEL REQUIREMENTS:

CONTENT SUMMARY & CHUNKING:
- Create a comprehensive lesson summary with 3-5 key points
- Break down content into 4-6 digestible chunks, each with a clear summary
- Identify 2-3 prerequisite concepts students should know
- Explain real-world relevance and applications

EXAMPLES & CASE STUDIES:
- Generate 5-7 diverse examples covering different difficulty levels
- Include at least 2 worked examples with step-by-step solutions
- Provide 1-2 real-world case studies showing practical applications
- Ensure examples span basic, intermediate, and advanced levels
- Connect examples to multiple related concepts

EXTERNAL RESOURCES:
- Suggest 6-8 high-quality external resources for further learning
- Include mix of: 2-3 videos, 2-3 articles, 1-2 interactive tools, 1 advanced reading
- Provide brief descriptions explaining what each resource offers
- Indicate difficulty level and estimated study time
- Use search query suggestions (e.g., "Khan Academy photosynthesis", "BBC Bitesize enzymes")

ASSESSMENT MATERIALS:
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
- Create exactly 3 essay questions requiring extended responses
- Create exactly 5 fill-in-the-blank exercises with 2-3 blanks each (use __blank__ format)
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
      summary: content.summary || null,
      contentChunks: content.contentChunks || [],
      examples: content.examples || [],
      resources: content.resources || [],
      matchingPairs: content.matchingPairs || [],
      quizQuestions: content.quizQuestions || [],
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