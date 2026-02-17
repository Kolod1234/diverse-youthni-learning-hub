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

    // Fetch the PDF
    const response = await fetch(file_url);
    if (!response.ok) {
      throw new Error(`Failed to fetch PDF: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    
    // Extract single page as PDF using pdf-lib
    const { PDFDocument } = await import('npm:pdf-lib@1.17.1');
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    
    if (page_number >= pageCount) {
      return Response.json({ 
        success: false,
        error: `Page ${page_number + 1} does not exist. PDF has ${pageCount} pages.` 
      }, { status: 400 });
    }

    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [page_number]);
    newPdf.addPage(copiedPage);
    
    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const extractedPdfFile = new File([blob], `cover-page-${page_number + 1}.pdf`, { type: 'application/pdf' });
    
    const { file_url: extractedPageUrl } = await base44.integrations.Core.UploadFile({ file: extractedPdfFile });
    
    return Response.json({ 
      success: true,
      extracted_page_url: extractedPageUrl,
      page_number: page_number + 1,
      message: 'PDF page extracted successfully',
      format: 'pdf'
    });

  } catch (error) {
    console.error('PDF page extraction error:', error);
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to extract page'
    }, { status: 500 });
  }
});