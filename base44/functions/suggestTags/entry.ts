import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, description, category, author } = await req.json();

    const prompt = `Analyze this book/document and suggest 5-8 relevant tags/keywords for categorization:

Title: ${title || 'Unknown'}
Author: ${author || 'Unknown'}
Category: ${category || 'Unknown'}
Description: ${description || 'No description'}

Provide tags that would help students and educators find this resource. Include subject areas, topics, difficulty levels, and key concepts.

Return ONLY a JSON array of lowercase tag strings, nothing else.`;

    const result = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: "object",
        properties: {
          tags: {
            type: "array",
            items: { type: "string" }
          }
        }
      }
    });

    return Response.json({ 
      success: true, 
      tags: result.tags || [] 
    });

  } catch (error) {
    console.error('Tag suggestion error:', error);
    return Response.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
});