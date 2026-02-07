import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { pdf_url, page_index = 0 } = await req.json();

    if (!pdf_url) {
      return Response.json({ error: 'PDF URL required' }, { status: 400 });
    }

    // Use Core.InvokeLLM to analyze and create image from PDF
    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Convert this PDF page to a high-quality PNG image. Preserve all content, layout, colors, and text exactly as shown.`,
      file_urls: [pdf_url],
      response_json_schema: {
        type: "object",
        properties: {
          success: { type: "boolean" },
          description: { type: "string" }
        }
      }
    });

    // Generate image based on the PDF
    const { url: imageUrl } = await base44.asServiceRole.integrations.Core.GenerateImage({
      prompt: `Create an exact replica image of this PDF page, preserving all text, layout, formatting, colors, and design elements precisely as they appear in the document.`,
      existing_image_urls: [pdf_url]
    });

    return Response.json({
      success: true,
      image_url: imageUrl
    });

  } catch (error) {
    console.error('PDF to image conversion error:', error);
    return Response.json({
      success: false,
      error: error.message || 'Conversion failed'
    }, { status: 500 });
  }
});