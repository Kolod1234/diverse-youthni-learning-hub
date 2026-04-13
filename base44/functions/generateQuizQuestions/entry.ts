import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (!user.is_tutor && user.role !== 'admin')) {
      return Response.json({ error: 'Unauthorized: Tutor access required' }, { status: 403 });
    }

    const { lessonTitle, lessonContent, difficultyLevel = 'medium', questionCount = 5 } = await req.json();

    if (!lessonTitle || !lessonContent) {
      return Response.json({ error: 'lessonTitle and lessonContent are required' }, { status: 400 });
    }

    const prompt = `You are an expert educational assessor. Generate ${questionCount} quiz questions based on the following lesson content.

Title: ${lessonTitle}

Content: ${lessonContent}

Difficulty Level: ${difficultyLevel}

For each question, provide:
1. Question text
2. Four multiple choice options (A, B, C, D)
3. Correct answer (A/B/C/D)
4. Brief explanation of the correct answer

Format as JSON array with this structure:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": "A",
    "explanation": "Why this answer is correct"
  }
]

Ensure questions test understanding of key concepts and are at ${difficultyLevel} difficulty.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                options: { type: 'array', items: { type: 'string' } },
                correctAnswer: { type: 'string' },
                explanation: { type: 'string' }
              }
            }
          }
        }
      },
      model: 'gemini_3_flash'
    });

    return Response.json({
      success: true,
      questions: result.questions || []
    });

  } catch (error) {
    console.error('Error generating quiz questions:', error);
    return Response.json({
      error: 'Failed to generate quiz questions',
      details: error.message
    }, { status: 500 });
  }
});