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

CRITICAL ALIGNMENT REQUIREMENTS:
1. ONLY create questions that DIRECTLY test the learning objectives listed above
2. EVERY question MUST relate to the specific lesson title and description provided
3. DO NOT include general knowledge questions - all content must be specifically about THIS lesson's topics
4. DO NOT introduce concepts not mentioned in the learning objectives
5. Each question should explicitly address at least one of the numbered learning objectives above

QUESTION VALIDITY CHECKLIST - Before including any question, verify:
✓ Does this question test a learning objective from the list above?
✓ Is this content mentioned in the lesson title or description?
✓ Would a student who only studied THIS specific lesson be able to answer it?
✓ Am I staying within the scope of THIS lesson (not adding extra topics)?

VARIETY REQUIREMENT (Generation #${randomSeed} at ${timestamp}):
Create COMPLETELY NEW and DIFFERENT questions from any previous generations while staying strictly within the lesson scope. Use varied examples, different question phrasings, and alternative perspectives - but ONLY for topics covered in THIS lesson.

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

CONTENT SUMMARY & CHUNKING (MUST align with lesson objectives):
- Summarize ONLY the concepts covered in this lesson's learning objectives
- Break down ONLY the topics mentioned in the lesson title and description
- Prerequisites should be concepts needed BEFORE this specific lesson
- Real-world relevance must connect to THIS lesson's specific topics

EXAMPLES & CASE STUDIES (MUST align with lesson objectives):
- ALL examples MUST illustrate concepts from the learning objectives above
- Worked examples should demonstrate solving problems covered in THIS lesson
- Case studies MUST apply THIS lesson's specific content, not general knowledge
- DO NOT create examples for topics not in the learning objectives

EXTERNAL RESOURCES (MUST align with lesson objectives):
- ONLY suggest resources that cover THIS lesson's specific topics
- Resource descriptions should mention which learning objective(s) they support
- Use search queries specific to THIS lesson (include lesson title in search)
- Example: "Khan Academy ${lessonTitle}", "BBC Bitesize ${lessonTitle}"

ASSESSMENT MATERIALS (STRICT ALIGNMENT REQUIRED):
- Create exactly 6 matching pairs - ONLY use terms/concepts from the learning objectives
- Create exactly 10 quiz questions - EACH must test a specific learning objective listed above
- In each question, reference which objective number (1, 2, 3, etc.) you're testing
- ALL quiz options must be plausible within THIS lesson's scope
- Distribute correct answers randomly across all 4 options (not just A or B)
- Use mathematical notation with LaTeX: $...$ for inline, $$...$$ for display
- For chemistry: use \\ce{...} for chemical formulas (e.g., \\ce{H2SO4})
- Create exactly 12 flashcards - ONLY covering terms from THIS lesson
- Create exactly 3 essay questions - MUST require knowledge from the learning objectives
- Create exactly 5 fill-in-the-blank exercises - ONLY testing THIS lesson's content
- Distractors (wrong answers) should be plausible but clearly wrong for THIS lesson
- Vary difficulty: 3 basic, 4 medium, 3 advanced questions

FINAL VALIDATION - Before submitting, verify:
- Every question can be answered using ONLY knowledge from this lesson
- No questions test general knowledge or topics outside the learning objectives
- All content directly supports the specific lesson title provided

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an A-level examination board content creator with expertise in creating rigorous, academically challenging assessment materials that STRICTLY align with specified learning objectives. Your PRIMARY responsibility is ensuring every single question directly tests the provided learning objectives - never include questions on topics not explicitly covered. Create questions that match A-level exam standards with proper mathematical notation, clear academic language, and appropriate depth. CRITICAL: When providing 4 options, randomly vary which position (0, 1, 2, or 3) contains the correct answer - do NOT always make option 0 or 1 correct. Distribute correct answers evenly across all four positions. Always respond with valid JSON only. REJECT any temptation to add "helpful" extra topics - stick ONLY to what was requested.' },
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