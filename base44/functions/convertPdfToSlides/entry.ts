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

    // Use AI vision to analyze PDF and extract content with images preserved
    const prompt = `Analyze this PDF document and convert it into presentation slides.

CRITICAL INSTRUCTIONS:
1. For each page in the PDF, create a slide
2. Extract ALL text content exactly as it appears
3. For images/diagrams, include them by describing their position and content
4. Preserve the original formatting, colors, and layout as much as possible
5. Include image URLs if visible in the PDF

For each page, return:
- title: Page title or "Slide {number}"
- content: Full HTML with all text, images (use <img> tags with src if available), and formatting
- has_images: boolean if page contains images
- order: Page number (0-indexed)

Preserve the original visual appearance - do not recreate or regenerate anything.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      file_urls: [file_url],
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
                has_images: { type: "boolean" },
                order: { type: "number" }
              },
              required: ["title", "content", "order"]
            }
          },
          total_pages: { type: "number" }
        }
      }
    });

    if (!response.slides || response.slides.length === 0) {
      throw new Error('No slides generated from PDF');
    }

    return Response.json({
      success: true,
      slides: response.slides,
      total_pages: response.total_pages || response.slides.length
    });

  } catch (error) {
    console.error('PDF conversion error:', error);
    return Response.json({ 
      error: 'Failed to convert PDF',
      details: error.message 
    }, { status: 500 });
  }
});

  } catch (error) {
    console.error('PDF conversion error:', error);
    return Response.json({ 
      error: 'Failed to convert PDF',
      details: error.message 
    }, { status: 500 });
  }
});