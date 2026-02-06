import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url, page_number } = await req.json();

    if (!file_url) {
      return Response.json({ error: 'File URL required' }, { status: 400 });
    }

    if (typeof page_number !== 'number' || page_number < 0) {
      return Response.json({ error: 'Valid page number required' }, { status: 400 });
    }

    // Import pdf-lib
    const { PDFDocument } = await import('npm:pdf-lib@1.17.1');
    
    // Fetch the PDF
    const response = await fetch(file_url);
    const arrayBuffer = await response.arrayBuffer();
    
    // Load PDF
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    
    if (page_number >= pageCount) {
      return Response.json({ 
        error: `Page ${page_number + 1} does not exist. PDF has ${pageCount} pages.` 
      }, { status: 400 });
    }

    // Create new PDF with single page
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [page_number]);
    newPdf.addPage(copiedPage);
    
    // Save as bytes
    const pdfBytes = await newPdf.save();
    
    // Convert to PNG using Core.GenerateImage with the PDF
    // Actually, let's just upload the single page PDF as the cover
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const pdfFile = new File([blob], `cover-page-${page_number + 1}.pdf`, { type: 'application/pdf' });
    
    const { file_url: uploadedPdfUrl } = await base44.integrations.Core.UploadFile({ file: pdfFile });
    
    // Now convert this single-page PDF to an image using a canvas approach via browser
    // Since we're in Deno, let's use a different approach - use Vertex AI to generate from the PDF
    // Or use the InvokeLLM with vision to extract the page as an image
    
    // Simple solution: Return the PDF URL for now, and handle rendering on frontend
    // Better: Convert PDF page to image using external service
    
    // Let's use a simple conversion: fetch the PDF and use an image conversion
    // For now, return success with the single-page PDF URL
    
    return Response.json({ 
      success: true,
      page_url: uploadedPdfUrl,
      page_number: page_number + 1
    });

  } catch (error) {
    console.error('PDF page extraction error:', error);
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to extract page'
    }, { status: 500 });
  }
});