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
    
    const prompt = `You are an educational content creator. Based on the following lesson, create engaging interactive learning materials.

Lesson Title: ${lessonTitle}
Lesson Description: ${lessonDescription}
Learning Objectives:
${learningObjectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

CRITICAL: This is generation #${randomSeed} at ${timestamp}. Create COMPLETELY NEW and DIFFERENT questions from any previous generations. Use varied examples, different question phrasings, alternative perspectives, and diverse scenarios to cover ALL aspects of the topic comprehensively.

Generate the following in valid JSON format:

{
  "matchingPairs": [
    { "left": "term or concept", "right": "definition or explanation" }
  ],
  "quizQuestions": [
    {
      "question": "question text",
      "options": ["option1", "option2", "option3", "option4"],
      "correctAnswer": 0,
      "explanation": "why this is correct"
    }
  ],
  "flashCards": [
    { "front": "question or term", "back": "answer or definition" }
  ]
}

Requirements:
- Create exactly 4 UNIQUE matching pairs (use different concepts each time)
- Create exactly 5 FRESH quiz questions with varied approaches
- Create exactly 10 NEW flashcards exploring different angles
- Cover different aspects of the learning objectives each generation
- Vary difficulty levels (easy, medium, hard)
- Use real-world examples and practical applications
- Never repeat the same questions or terms
- Ensure educational value and accuracy`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are an expert educational content creator who specializes in creating VARIED and UNIQUE learning materials. Each generation must be completely different, exploring the topic from new angles with fresh examples and varied difficulty levels. Always respond with valid JSON only.' },
          { role: 'user', content: prompt }
        ],
        temperature: 1.0,
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