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

    // Import pdf-lib and pdf.js for rendering
    const { PDFDocument } = await import('npm:pdf-lib@1.17.1');
    const pdfjsLib = await import('npm:pdfjs-dist@3.11.174');
    
    // Fetch the PDF
    const response = await fetch(file_url);
    const arrayBuffer = await response.arrayBuffer();
    
    // Load PDF with pdf-lib to check page count
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const pageCount = pdfDoc.getPageCount();
    
    if (page_number >= pageCount) {
      return Response.json({ 
        error: `Page ${page_number + 1} does not exist. PDF has ${pageCount} pages.` 
      }, { status: 400 });
    }

    // Load PDF with pdf.js for rendering to image
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    const pdf = await loadingTask.promise;
    const page = await pdf.getPage(page_number + 1);
    
    // Set scale for good quality
    const scale = 2.0;
    const viewport = page.getViewport({ scale });
    
    // Create canvas using Deno's canvas
    const { createCanvas } = await import('npm:canvas@2.11.2');
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');
    
    // Render PDF page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    
    // Convert canvas to PNG buffer
    const pngBuffer = canvas.toBuffer('image/png');
    const pngBlob = new Blob([pngBuffer], { type: 'image/png' });
    const pngFile = new File([pngBlob], `page-${page_number + 1}.png`, { type: 'image/png' });
    
    const { file_url: extractedPageUrl } = await base44.integrations.Core.UploadFile({ file: pngFile });
    
    return Response.json({ 
      success: true,
      extracted_page_url: extractedPageUrl,
      page_number: page_number + 1,
      message: 'PDF page extracted successfully'
    });

  } catch (error) {
    console.error('PDF page extraction error:', error);
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to extract page'
    }, { status: 500 });
  }
});