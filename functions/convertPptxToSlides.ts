import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url } = await req.json();

    if (!file_url) {
      return Response.json({ error: 'file_url is required' }, { status: 400 });
    }

    // Extract structured data from PPTX
    const extractionResult = await base44.integrations.Core.ExtractDataFromUploadedFile({
      file_url: file_url,
      json_schema: {
        type: 'object',
        properties: {
          slides: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                content: { type: 'string' },
                bullet_points: { type: 'array', items: { type: 'string' } },
                order: { type: 'number' }
              }
            }
          }
        }
      }
    });

    if (extractionResult.status === 'error') {
      throw new Error(extractionResult.details || 'Failed to extract PPTX content');
    }

    const extractedData = extractionResult.output;
    
    // Convert extracted data to HTML slides
    const response = await base44.integrations.Core.InvokeLLM({
      prompt: `Convert this PowerPoint data into HTML slides:

${JSON.stringify(extractedData, null, 2)}

For each slide, create rich HTML content with:
- Proper heading tags (<h2>, <h3>)
- Formatted paragraphs (<p>)
- Bullet lists (<ul><li>)
- Bold text for emphasis (<strong>)
- Clean, professional styling

Return the slides in the same order.`,
      response_json_schema: {
        type: "object",
        properties: {
          slides: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                content: { type: "string" },
                order: { type: "number" }
              },
              required: ["title", "content", "order"]
            }
          }
        },
        required: ["slides"]
      }
    });

    if (!response.slides || response.slides.length === 0) {
      throw new Error('No slides generated from PowerPoint file');
    }

    return Response.json({
      success: true,
      slides: response.slides || [],
      total_slides: response.slides?.length || 0
    });

  } catch (error) {
    console.error('PPTX conversion error:', error);
    return Response.json({ 
      error: 'Failed to convert PowerPoint file',
      details: error.message 
    }, { status: 500 });
  }
});