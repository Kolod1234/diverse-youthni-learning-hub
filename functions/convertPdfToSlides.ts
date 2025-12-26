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

    // Fetch the PDF file
    const pdfResponse = await fetch(file_url);
    if (!pdfResponse.ok) {
      return Response.json({ error: 'Failed to fetch PDF' }, { status: 400 });
    }

    const pdfBuffer = await pdfResponse.arrayBuffer();

    // Use pdf-lib to load and process the PDF
    const { PDFDocument } = await import('npm:pdf-lib@1.17.1');
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pageCount = pdfDoc.getPageCount();

    // Generate images for each page using pdf2pic approach
    // Since we're in Deno, we'll use a different approach - convert via canvas
    const slides = [];

    // For each page, we'll create a data URL representation
    for (let i = 0; i < pageCount; i++) {
      // Extract single page
      const singlePageDoc = await PDFDocument.create();
      const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [i]);
      singlePageDoc.addPage(copiedPage);
      
      const pdfBytes = await singlePageDoc.save();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
      const pageUrl = `data:application/pdf;base64,${base64}`;

      slides.push({
        title: `Slide ${i + 1}`,
        content: `<div style="width: 100%; height: 600px; display: flex; align-items: center; justify-content: center; background: #f3f4f6;">
          <iframe src="${pageUrl}" style="width: 100%; height: 100%; border: none;" />
        </div>`,
        order: i,
        page_number: i + 1
      });
    }

    return Response.json({
      success: true,
      slides,
      total_pages: pageCount
    });

  } catch (error) {
    console.error('PDF conversion error:', error);
    return Response.json({ 
      error: 'Failed to convert PDF',
      details: error.message 
    }, { status: 500 });
  }
});