import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { PDFDocument } from 'npm:pdf-lib@1.17.1';

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
      throw new Error('Failed to fetch PDF file');
    }

    const pdfBytes = await pdfResponse.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const totalPages = pdfDoc.getPageCount();

    // Extract each page as an individual PDF and convert to image
    const slides = [];
    
    for (let i = 0; i < totalPages; i++) {
      // Create a new PDF with just this page
      const singlePagePdf = await PDFDocument.create();
      const [copiedPage] = await singlePagePdf.copyPages(pdfDoc, [i]);
      singlePagePdf.addPage(copiedPage);
      
      const singlePageBytes = await singlePagePdf.save();
      const blob = new Blob([singlePageBytes], { type: 'application/pdf' });
      const file = new File([blob], `page-${i + 1}.pdf`, { type: 'application/pdf' });
      
      // Upload the single page PDF
      const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file });
      
      // Generate page image from the single-page PDF using AI vision
      const pageImageUrl = await base44.asServiceRole.integrations.Core.GenerateImage({
        prompt: `Convert this PDF page into a high-quality image. Preserve all text, images, formatting, colors, and layout EXACTLY as they appear in the original. This should be a direct visual representation of the PDF page.`,
        existing_image_urls: [uploadResult.file_url]
      });

      slides.push({
        title: `Slide ${i + 1}`,
        content: `<div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center;">
          <img src="${pageImageUrl.url}" alt="Page ${i + 1}" style="max-width: 100%; max-height: 100%; object-fit: contain;" />
        </div>`,
        order: i
      });
    }

    return Response.json({
      success: true,
      slides,
      total_pages: totalPages
    });

  } catch (error) {
    console.error('PDF conversion error:', error);
    return Response.json({ 
      error: 'Failed to convert PDF',
      details: error.message 
    }, { status: 500 });
  }
});