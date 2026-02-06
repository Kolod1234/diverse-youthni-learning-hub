import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { PDFDocument } from 'npm:pdf-lib@1.17.1';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url, page_number } = await req.json();

    if (!file_url || !file_url.toLowerCase().includes('.pdf')) {
      return Response.json({ error: 'PDF file URL required' }, { status: 400 });
    }

    if (typeof page_number !== 'number' || page_number < 0) {
      return Response.json({ error: 'Valid page number required' }, { status: 400 });
    }

    // Fetch and load the PDF
    const pdfResponse = await fetch(file_url);
    const pdfBytes = await pdfResponse.arrayBuffer();
    const pdfDoc = await PDFDocument.load(pdfBytes);
    
    if (page_number >= pdfDoc.getPageCount()) {
      return Response.json({ 
        error: `Page ${page_number + 1} does not exist. PDF has ${pdfDoc.getPageCount()} pages.` 
      }, { status: 400 });
    }

    // Extract the specified page
    const newPdf = await PDFDocument.create();
    const [extractedPage] = await newPdf.copyPages(pdfDoc, [page_number]);
    newPdf.addPage(extractedPage);
    const extractedPageBytes = await newPdf.save();
    
    // Convert to blob and upload
    const blob = new Blob([extractedPageBytes], { type: 'application/pdf' });
    const file = new File([blob], `page-${page_number + 1}.pdf`, { type: 'application/pdf' });
    
    const { file_url: pageUrl } = await base44.integrations.Core.UploadFile({ file });
    
    return Response.json({ 
      success: true,
      page_url: pageUrl
    });

  } catch (error) {
    console.error('PDF page extraction error:', error);
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});