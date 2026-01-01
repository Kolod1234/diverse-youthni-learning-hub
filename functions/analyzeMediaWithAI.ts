import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url, file_type } = await req.json();
    
    if (!file_url || !file_type) {
      return Response.json({ error: 'file_url and file_type are required' }, { status: 400 });
    }

    console.log('Analyzing media:', file_url, file_type);

    let prompt, result;

    if (file_type === 'image') {
      prompt = `Analyze this image and provide:
1. A detailed description (2-3 sentences)
2. 5-10 relevant tags (comma-separated, lowercase)

Focus on: subject matter, style, colors, mood, potential educational use cases.

Return ONLY valid JSON with this exact structure:
{
  "description": "...",
  "tags": ["tag1", "tag2", ...]
}`;

      result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt,
        file_urls: [file_url],
        response_json_schema: {
          type: 'object',
          properties: {
            description: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } }
          }
        }
      });
    } else if (file_type === 'video') {
      // For video, analyze first frame or provide general categorization
      result = await base44.asServiceRole.integrations.Core.InvokeLLM({
        prompt: `Based on the file being a video, suggest relevant tags and description for categorization. Return JSON: {"description": "...", "tags": ["tag1", "tag2"]}`,
        response_json_schema: {
          type: 'object',
          properties: {
            description: { type: 'string' },
            tags: { type: 'array', items: { type: 'string' } }
          }
        }
      });
    } else if (file_type === 'audio') {
      result = {
        description: 'Audio file for presentations',
        tags: ['audio', 'sound', 'media']
      };
    }

    return Response.json({
      description: result.description || 'Media file',
      tags: result.tags || []
    });

  } catch (error) {
    console.error('Media analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});