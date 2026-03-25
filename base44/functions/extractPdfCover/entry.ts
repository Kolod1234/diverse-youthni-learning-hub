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

    if (!file_url || !file_url.toLowerCase().includes('.pdf')) {
      return Response.json({ error: 'PDF file URL required' }, { status: 400 });
    }

    // Fetch and load the PDF
    const pdfResponse = await fetch(file_url);
    const pdfBytes = await pdfResponse.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    if (pdfDoc.getPageCount() === 0) {
      return Response.json({ error: 'PDF has no pages' }, { status: 400 });
    }

    // Extract the first page
    const newPdf = await PDFDocument.create();
    const [firstPage] = await newPdf.copyPages(pdfDoc, [0]);
    newPdf.addPage(firstPage);
    const firstPageBytes = await newPdf.save();
    
    // Convert to blob and upload
    const blob = new Blob([firstPageBytes], { type: 'application/pdf' });
    const file = new File([blob], 'cover-page.pdf', { type: 'application/pdf' });
    
    const { file_url: coverPageUrl } = await base44.integrations.Core.UploadFile({ file });
    
    return Response.json({ 
      success: true,
      cover_url: coverPageUrl
    });

  } catch (error) {
    console.error('PDF cover extraction error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});