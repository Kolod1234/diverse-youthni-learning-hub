import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (!user.is_tutor && user.role !== 'admin')) {
      return Response.json({ error: 'Unauthorized: Tutor access required' }, { status: 403 });
    }

    const { lessonTitle, lessonContent, learningObjectives } = await req.json();

    if (!lessonTitle || !lessonContent) {
      return Response.json({ error: 'lessonTitle and lessonContent are required' }, { status: 400 });
    }

    const prompt = `You are an expert educational content creator. Generate a concise, student-friendly summary (150-250 words) for the following lesson:

Title: ${lessonTitle}

Content: ${lessonContent}

${learningObjectives?.length > 0 ? `Learning Objectives: ${learningObjectives.join(', ')}` : ''}

The summary should:
- Highlight key concepts
- Use simple, clear language
- Be suitable for quick review
- Include the main takeaways

Provide ONLY the summary text, no additional commentary.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      model: 'gemini_3_flash'
    });

    return Response.json({
      success: true,
      summary: result
    });

  } catch (error) {
    console.error('Error generating lesson summary:', error);
    return Response.json({
      error: 'Failed to generate lesson summary',
      details: error.message
    }, { status: 500 });
  }
});