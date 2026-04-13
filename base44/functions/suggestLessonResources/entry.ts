import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (!user.is_tutor && user.role !== 'admin')) {
      return Response.json({ error: 'Unauthorized: Tutor access required' }, { status: 403 });
    }

    const { lessonTitle, lessonContent, resourceType = 'all' } = await req.json();

    if (!lessonTitle || !lessonContent) {
      return Response.json({ error: 'lessonTitle and lessonContent are required' }, { status: 400 });
    }

    const resourceFilters = resourceType === 'all' 
      ? 'videos, articles, interactive tools, case studies, real-world examples'
      : resourceType;

    const prompt = `You are an expert educator. Suggest relevant educational resources and examples to enrich the following lesson.

Title: ${lessonTitle}

Content: ${lessonContent}

Suggest ${resourceFilters} that could be used to:
1. Provide additional context
2. Offer real-world examples
3. Engage students with different learning styles
4. Deepen understanding of key concepts

For each suggestion, provide:
1. Resource title/name
2. Resource type (video, article, interactive, example, etc.)
3. Brief description of how it enriches the lesson
4. Approximate duration/scope (if applicable)

Format as JSON array with this structure:
[
  {
    "title": "Resource title",
    "type": "video/article/interactive/example/case_study",
    "description": "How this enriches the lesson",
    "duration": "5-10 minutes" or "optional"
  }
]

Provide 5-7 diverse, practical suggestions.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: 'object',
        properties: {
          resources: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                type: { type: 'string' },
                description: { type: 'string' },
                duration: { type: 'string' }
              }
            }
          }
        }
      },
      model: 'gemini_3_flash'
    });

    return Response.json({
      success: true,
      resources: result.resources || []
    });

  } catch (error) {
    console.error('Error suggesting lesson resources:', error);
    return Response.json({
      error: 'Failed to suggest lesson resources',
      details: error.message
    }, { status: 500 });
  }
});