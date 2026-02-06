import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { createCanvas, loadImage } from 'npm:canvas@2.11.2';

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

    // Use pdfjs-dist to render PDF to canvas
    const pdfjs = await import('npm:pdfjs-dist@3.11.174');
    
    // Fetch PDF
    const pdfResponse = await fetch(file_url);
    const pdfBuffer = await pdfResponse.arrayBuffer();
    
    // Load PDF document
    const loadingTask = pdfjs.getDocument({ data: new Uint8Array(pdfBuffer) });
    const pdfDoc = await loadingTask.promise;
    
    if (page_number >= pdfDoc.numPages) {
      return Response.json({ 
        error: `Page ${page_number + 1} does not exist. PDF has ${pdfDoc.numPages} pages.` 
      }, { status: 400 });
    }

    // Get the page
    const page = await pdfDoc.getPage(page_number + 1);
    
    // Set scale for good quality
    const scale = 2.0;
    const viewport = page.getViewport({ scale });
    
    // Create canvas
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext('2d');
    
    // Render page to canvas
    await page.render({
      canvasContext: context,
      viewport: viewport
    }).promise;
    
    // Convert canvas to PNG buffer
    const pngBuffer = canvas.toBuffer('image/png');
    
    // Upload as PNG
    const blob = new Blob([pngBuffer], { type: 'image/png' });
    const file = new File([blob], `page-${page_number + 1}.png`, { type: 'image/png' });
    
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