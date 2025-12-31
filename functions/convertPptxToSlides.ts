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

    // Use AI to convert PPTX to slides with proper rendering
    const prompt = `I have a PowerPoint presentation (.pptx) at this URL: ${file_url}
    
Please analyze this PowerPoint file and convert each slide into HTML content. For each slide:
1. Extract all text content including titles, bullet points, and body text
2. Identify any images, diagrams, charts, or visual elements
3. Preserve the layout structure and formatting
4. Note any speaker notes or annotations
5. Return structured HTML that represents the slide content with proper styling

Return a JSON array where each object represents a slide with:
- title: The slide title or main heading
- content: Full HTML representation of the slide with proper formatting (<h2>, <p>, <ul>, <li>, <strong>, etc.)
- order: Slide number (0-indexed)
- notes: Any speaker notes (optional)`;

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
                order: { type: "number" },
                notes: { type: "string" }
              },
              required: ["title", "content", "order"]
            }
          },
          total_slides: { type: "number" }
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