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
    
    // Save as PNG using canvas (Deno has canvas support)
    const { createCanvas } = await import('https://deno.land/x/canvas@v1.4.1/mod.ts');
    const page = newPdf.getPage(0);
    const { width, height } = page.getSize();
    
    // Create canvas and render PDF page
    const canvas = createCanvas(width * 2, height * 2); // 2x for better quality
    const ctx = canvas.getContext('2d');
    ctx.scale(2, 2);
    
    // For now, just save the PDF page as is and return it
    const pdfBytes = await newPdf.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const pdfFile = new File([blob], `page-${page_number + 1}.pdf`, { type: 'application/pdf' });
    
    const { file_url: pageUrl } = await base44.integrations.Core.UploadFile({ file: pdfFile });
    
    return Response.json({ 
      success: true,
      page_url: pageUrl,
      page_number: page_number + 1,
      message: 'PDF page extracted (PDF format)'
    });

  } catch (error) {
    console.error('PDF page extraction error:', error);
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to extract page'
    }, { status: 500 });
  }
});