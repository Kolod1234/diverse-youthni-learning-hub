import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      console.error('Unauthorized access attempt');
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileUrl } = await req.json();
    
    console.log('Received fileUrl:', fileUrl);
    
    if (!fileUrl) {
      console.error('No file URL provided');
      return Response.json({ error: 'File URL is required' }, { status: 400 });
    }

    console.log('Starting PPT conversion...');
    
    // Use LLM to extract content from PPT
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Extract all slides from this PowerPoint presentation. For each slide, extract:
1. The slide title (or main heading)
2. All the text content, bullet points, and key information
3. Format the content in clean HTML with proper headings, paragraphs, lists, etc.

Return a structured array of slides. Make sure each slide has a title, content, and order number starting from 1.`,
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

    console.log('LLM response:', JSON.stringify(result, null, 2));

    if (!result || !result.slides || !Array.isArray(result.slides)) {
      console.error('Invalid LLM response structure:', result);
      return Response.json({ 
        error: 'Failed to extract slides from presentation',
        details: 'The AI could not parse the presentation content'
      }, { status: 500 });
    }

    console.log(`Successfully converted ${result.slides.length} slides`);

    return Response.json({ 
      success: true, 
      slides: result.slides 
    });

  } catch (error) {
    console.error('PPT conversion error:', error);
    console.error('Error stack:', error.stack);
    return Response.json({ 
      error: error.message || 'Failed to convert PPT',
      details: error.stack
    }, { status: 500 });
  }
});