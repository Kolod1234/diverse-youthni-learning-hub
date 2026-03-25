import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { pptxToHtml } from 'npm:@jvmr/pptx-to-html';

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

    // Fetch the PPTX file
    const fileResponse = await fetch(file_url);
    if (!fileResponse.ok) {
      throw new Error('Failed to fetch PPTX file');
    }

    const arrayBuffer = await fileResponse.arrayBuffer();

    // Convert PPTX to HTML slides
    const htmlSlides = await pptxToHtml(arrayBuffer, {
      scaleToFit: true,
      width: 1000
    });

    // Transform HTML slides into structured format
    const slides = htmlSlides.map((htmlContent, index) => ({
      title: `Slide ${index + 1}`,
      content: htmlContent,
      order: index
    }));

    return Response.json({
      success: true,
      slides,
      total_slides: slides.length
    });

  } catch (error) {
    console.error('PPTX conversion error:', error);
    return Response.json({ 
      error: 'Failed to convert PowerPoint file',
      details: error.message 
    }, { status: 500 });
  }
});