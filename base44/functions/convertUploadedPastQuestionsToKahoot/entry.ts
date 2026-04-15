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

    const { fileUrl, fileName = 'Past Questions', maxQuestions = 8 } = await req.json();

    if (!fileUrl) {
      return Response.json({ error: 'fileUrl is required' }, { status: 400 });
    }

    const prompt = `You are converting uploaded past questions into a live Kahoot-style quiz.

SOURCE FILE NAME: ${fileName}

Use the uploaded file content as the primary source.

Rules:
- Create up to ${maxQuestions} quiz questions.
- Output ONLY multiple-choice questions.
- Each question must have exactly 4 short answer options.
- Only one option is correct.
- Preserve the educational intent of the original past questions, but rewrite them into fast, clear Kahoot format.
- Keep each question under 180 characters if possible.
- Keep each option under 80 characters if possible.
- Use a time limit between 20 and 60 seconds.
- Prefer actual answers from the source when possible.
- IMPORTANT: if a question depends on a diagram, chart, graph, table, labelled image, map, or visual, keep it as a diagram-based Kahoot question.
- For diagram-based questions, include a short description of the visual and keep the question understandable with the attached image.
- If the uploaded file contains visible diagrams, extract and preserve them when possible.
- For every visual question, include a visual_source_hint describing the best image to show in Kahoot.
- visual_source_hint must be one of: "diagram_only", "chart_only", "table_only", "figure_only", "whole_page".

Return JSON only.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [fileUrl],
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
                visual_description: { type: 'string' },
                visual_source_hint: { type: 'string' }
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
        const visualSourceHint = cleanText(item.visual_source_hint).toLowerCase();
        const isVisualQuestion = !!imageUrl || !!cleanText(item.visual_description) || ['diagram_only', 'chart_only', 'table_only', 'figure_only', 'whole_page'].includes(visualSourceHint);
        return {
          question: cleanText(item.question),
          question_type: isVisualQuestion ? 'image_based' : 'multiple_choice',
          options,
          correct_answer: correctAnswer,
          correct_text_answer: '',
          time_limit_seconds: [20, 30, 45, 60].includes(item.time_limit_seconds) ? item.time_limit_seconds : 30,
          image_url: imageUrl,
          visual_description: cleanText(item.visual_description),
        };
      });

    return Response.json({
      title: cleanText(result.title) || cleanText(fileName.replace(/\.[^.]+$/, '')) || 'Past Questions Kahoot',
      questions: safeQuestions,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});