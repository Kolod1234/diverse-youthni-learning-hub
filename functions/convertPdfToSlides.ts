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

    // Use AI to convert PDF to slides with proper rendering and image extraction
    const prompt = `Analyze this PDF document and convert each page into a presentation slide.

CRITICAL INSTRUCTIONS FOR IMAGES:
- For EVERY image, diagram, chart, or visual element in the PDF, you MUST generate a detailed description
- Include image_prompt field with precise instructions for regenerating the visual
- Describe colors, layout, text content, diagrams, charts, graphs, and all visual elements in detail
- Images must be recreated accurately using AI image generation

For each page, provide:
1. title: Descriptive title based on page content
2. content: Full HTML with text content, formatting, and structure
3. image_prompt: Detailed description of any images/visuals on this page (if present)
4. order: Page number (0-indexed)

Format content with proper HTML tags: <h2>, <h3>, <p>, <ul>, <li>, <strong>

If a page has an image, chart, or diagram, the image_prompt MUST describe it in detail for accurate regeneration.`;

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
                image_prompt: { type: "string" },
                order: { type: "number" }
              },
              required: ["title", "content", "order"]
            }
          },
          total_pages: { type: "number" }
        }
      }
    });

    // Generate images for slides that have image prompts
    const slidesWithImages = await Promise.all(
      response.slides.map(async (slide) => {
        if (slide.image_prompt) {
          try {
            const imageResult = await base44.integrations.Core.GenerateImage({
              prompt: slide.image_prompt
            });

            if (imageResult?.url) {
              const imageHtml = `<div style="text-align: center; margin: 20px 0;">
                <img src="${imageResult.url}" alt="${slide.title}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);" />
              </div>`;
              
              return {
                ...slide,
                content: imageHtml + slide.content
              };
            }
          } catch (error) {
            console.error('Failed to generate image for slide:', error);
          }
        }
        return slide;
      })
    );

    if (!slidesWithImages || slidesWithImages.length === 0) {
      throw new Error('No slides generated from PDF');
    }

    return Response.json({
      success: true,
      slides: slidesWithImages,
      total_pages: response.total_pages || slidesWithImages.length
    });

  } catch (error) {
    console.error('PDF conversion error:', error);
    return Response.json({ 
      error: 'Failed to convert PDF',
      details: error.message 
    }, { status: 500 });
  }
});