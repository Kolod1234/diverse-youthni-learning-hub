import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .replace(/^[\s\-–:;,.]+|[\s\-–:;,.]+$/g, '')
    .trim();
}

function buildFallbackOptions(question, answer) {
  const base = cleanText(answer) || 'Correct answer';
  const stem = cleanText(question).slice(0, 40) || 'Question topic';
  return [
    base,
    `Common mistake about ${stem}`,
    `Partly correct idea for ${stem}`,
    `Unrelated answer for ${stem}`,
  ];
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { paperTitle, paperUrl, maxQuestions = 8 } = await req.json();

    if (!paperTitle || !paperUrl) {
      return Response.json({ error: 'paperTitle and paperUrl are required' }, { status: 400 });
    }

    const prompt = `You are converting exam past paper content into a live Kahoot-style quiz.

PAST PAPER TITLE: ${paperTitle}
PAST PAPER URL: ${paperUrl}

Create up to ${maxQuestions} quiz questions suitable for a fast classroom Kahoot game.

Rules:
- Output ONLY multiple-choice questions.
- Each question must have exactly 4 short answer options.
- Only one option is correct.
- Questions should be clear, concise, and student-friendly.
- Prefer key facts, concepts, definitions, calculations, interpretations, or short reasoning prompts.
- Avoid essay-style wording.
- If the exact paper contents are not available from the URL alone, infer likely curriculum-aligned questions from the paper title/subject/year in a realistic exam style.
- Keep each question under 180 characters if possible.
- Keep each option under 80 characters if possible.
- Use a time limit between 20 and 60 seconds.
- IMPORTANT: if a question depends on a diagram, chart, graph, table, labelled image, map, or visual, keep it as a diagram-based Kahoot question.
- For diagram-based questions, include a short description of the visual and keep the question understandable with the attached image if available.

Return JSON.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      model: 'gemini_3_flash',
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          questions: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                question: { type: 'string' },
                options: { type: 'array', items: { type: 'string' } },
                correct_answer: { type: 'number' },
                time_limit_seconds: { type: 'number' },
                explanation: { type: 'string' },
                image_url: { type: 'string' },
                visual_description: { type: 'string' }
              }
            }
          }
        }
      }
    });

    const safeQuestions = (result.questions || [])
      .filter((item) => cleanText(item.question))
      .slice(0, maxQuestions)
      .map((item) => {
        const normalizedOptions = Array.isArray(item.options)
          ? item.options.map(cleanText).filter(Boolean).slice(0, 4)
          : [];

        const options = normalizedOptions.length === 4
          ? normalizedOptions
          : buildFallbackOptions(item.question, normalizedOptions[0]);

        const correctAnswer = typeof item.correct_answer === 'number' && item.correct_answer >= 0 && item.correct_answer <= 3
          ? item.correct_answer
          : 0;

        const imageUrl = cleanText(item.image_url);
        return {
          question: cleanText(item.question),
          question_type: imageUrl ? 'image_based' : 'multiple_choice',
          options,
          correct_answer: correctAnswer,
          correct_text_answer: '',
          time_limit_seconds: [20, 30, 45, 60].includes(item.time_limit_seconds) ? item.time_limit_seconds : 30,
          image_url: imageUrl,
          visual_description: cleanText(item.visual_description),
        };
      });

    return Response.json({
      title: cleanText(result.title) || cleanText(paperTitle),
      questions: safeQuestions,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});