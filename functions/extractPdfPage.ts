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

    // Extract single page and convert to PNG
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [page_number]);
    newPdf.addPage(copiedPage);
    const pdfBytes = await newPdf.save();
    
    // Use InvokeLLM to convert PDF to image
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    const tempFile = new File([pdfBlob], `temp-page.pdf`, { type: 'application/pdf' });
    const { file_url: tempPdfUrl } = await base44.integrations.Core.UploadFile({ file: tempFile });
    
    // Convert to image using backend function
    const { data: imageData } = await base44.asServiceRole.functions.invoke('convertPdfToImage', {
      pdf_url: tempPdfUrl,
      page_index: 0
    });
    
    if (!imageData.success) {
      throw new Error(imageData.error || 'Failed to convert PDF to image');
    }
    
    return Response.json({ 
      success: true,
      extracted_page_url: imageData.image_url,
      page_number: page_number + 1,
      message: 'PDF page extracted as image'
    });

  } catch (error) {
    console.error('PDF page extraction error:', error);
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to extract page'
    }, { status: 500 });
  }
});