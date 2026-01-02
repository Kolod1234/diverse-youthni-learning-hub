import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { canvaUrl } = await req.json();

    if (!canvaUrl) {
      return Response.json({ error: 'Canva URL required' }, { status: 400 });
    }

    // Extract design ID from Canva URL
    const urlMatch = canvaUrl.match(/design\/([A-Za-z0-9_-]+)/);
    if (!urlMatch) {
      return Response.json({ error: 'Invalid Canva URL format' }, { status: 400 });
    }

    const designId = urlMatch[1];

    // Export design using Canva integration
    const exportResult = await base44.functions.invoke('canvaIntegration', {
      action: 'import_design',
      canvaUrl
    });

    if (!exportResult.data?.images?.length) {
      return Response.json({ error: 'Failed to export Canva design' }, { status: 500 });
    }

    const imageUrl = exportResult.data.images[0];

    // Use AI to analyze and extract educational content from the design
    const analysisResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this Canva educational design and extract key information for a knowledge base.
      
This design will be used to teach students. Extract:
1. Main title/topic
2. Key concepts and bullet points
3. Visual elements described
4. Educational tags (subjects, topics)

Return structured data.`,
      file_urls: [imageUrl],
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          key_concepts: { type: 'array', items: { type: 'string' } },
          tags: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    // Save to knowledge base
    await base44.entities.KnowledgeBaseItem.create({
      title: analysisResult.title || 'Canva Design',
      content: analysisResult.content || '',
      key_concepts: analysisResult.key_concepts || [],
      tags: analysisResult.tags || ['canva', 'design'],
      category: 'canva',
      file_url: imageUrl,
      source_url: canvaUrl
    });

    return Response.json({
      title: analysisResult.title,
      imageUrl,
      tags: analysisResult.tags
    });

  } catch (error) {
    console.error('Canva import error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});