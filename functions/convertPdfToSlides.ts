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

    // Use AI to convert PDF to slides with proper rendering
    const prompt = `I have a PDF document at this URL: ${file_url}
    
Please analyze this PDF and convert each page into HTML slide content. For each page:
1. Extract the text content
2. Identify any images, diagrams, or visual elements
3. Preserve formatting and layout
4. Return structured HTML that represents the page content

Return a JSON array where each object has:
- title: A descriptive title for the slide (based on page content)
- content: Full HTML representation of the page with proper styling
- order: Page number (0-indexed)`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      add_context_from_internet: false,
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
                order: { type: "number" }
              }
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