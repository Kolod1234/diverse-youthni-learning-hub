import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileUrl } = await req.json();
    
    if (!fileUrl) {
      return Response.json({ error: 'File URL is required' }, { status: 400 });
    }

    // Use LLM to extract content from PPT
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract all slides from this PowerPoint presentation. For each slide, extract:
1. The slide title (or main heading)
2. All the text content, bullet points, and key information
3. Format the content in clean HTML with proper headings, paragraphs, lists, etc.

Return a structured array of slides.`,
      file_urls: [fileUrl],
      response_json_schema: {
        type: "object",
        properties: {
          slides: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: {
                  type: "string",
                  description: "Slide title or main heading"
                },
                content: {
                  type: "string",
                  description: "HTML formatted slide content"
                },
                order: {
                  type: "number",
                  description: "Slide order number"
                }
              },
              required: ["title", "content", "order"]
            }
          }
        },
        required: ["slides"]
      }
    });

    return Response.json({ 
      success: true, 
      slides: result.slides 
    });

  } catch (error) {
    console.error('PPT conversion error:', error);
    return Response.json({ 
      error: error.message || 'Failed to convert PPT'
    }, { status: 500 });
  }
});