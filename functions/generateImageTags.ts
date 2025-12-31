import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl, context = '' } = await req.json();

    if (!imageUrl) {
      return Response.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this image and generate relevant tags and keywords for searchability and organization.
      
${context ? `Context: ${context}` : ''}

Generate:
1. Primary tags (3-5): Main subjects, themes, or content type
2. Secondary tags (5-8): Specific details, style, colors, concepts
3. Search keywords (8-12): Natural language terms for finding this image

Focus on educational content, visual elements, subject matter, style, and usability.`,
      file_urls: [imageUrl],
      response_json_schema: {
        type: "object",
        properties: {
          primary_tags: {
            type: "array",
            items: { type: "string" },
            description: "3-5 main content tags"
          },
          secondary_tags: {
            type: "array",
            items: { type: "string" },
            description: "5-8 detailed tags"
          },
          keywords: {
            type: "array",
            items: { type: "string" },
            description: "8-12 search keywords"
          },
          description: {
            type: "string",
            description: "Brief description of the image"
          }
        },
        required: ["primary_tags", "secondary_tags", "keywords"]
      }
    });

    return Response.json({
      tags: [...result.primary_tags, ...result.secondary_tags],
      primary_tags: result.primary_tags,
      secondary_tags: result.secondary_tags,
      keywords: result.keywords,
      description: result.description
    });

  } catch (error) {
    console.error('Error generating image tags:', error);
    return Response.json({ 
      error: 'Failed to generate tags',
      details: error.message 
    }, { status: 500 });
  }
});