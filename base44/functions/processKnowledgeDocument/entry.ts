import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileUrl, fileName } = await req.json();

    // Extract text from document using LLM
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract all text content from this document and suggest relevant tags/topics.
      
Return the document title, content summary, and 3-5 relevant tags.`,
      file_urls: [fileUrl],
      response_json_schema: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          content: { type: 'string' },
          tags: { type: 'array', items: { type: 'string' } }
        }
      }
    });

    return Response.json({
      title: result.title || fileName,
      content: result.content || '',
      tags: result.tags || []
    });

  } catch (error) {
    console.error('Document processing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});