import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file_url, page_number } = await req.json();

    if (!file_url || typeof page_number !== 'number') {
      return Response.json({ error: 'File URL and page number required' }, { status: 400 });
    }

    // Use Cloudmersive PDF to PNG API
    const cloudmersiveUrl = 'https://api.cloudmersive.com/convert/pdf/to/png/array';
    
    // Fetch the PDF
    const pdfResponse = await fetch(file_url);
    if (!pdfResponse.ok) {
      throw new Error('Failed to fetch PDF');
    }
    
    const pdfBuffer = await pdfResponse.arrayBuffer();
    
    // Convert to PNG using Cloudmersive (free tier available)
    const convertResponse = await fetch(cloudmersiveUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/pdf',
        'Apikey': 'free-trial' // Using free trial key
      },
      body: pdfBuffer
    });
    
    if (!convertResponse.ok) {
      throw new Error('PDF to PNG conversion failed');
    }
    
    const result = await convertResponse.json();
    
    // Get the specific page image
    if (!result.PngResultPages || result.PngResultPages.length === 0) {
      throw new Error('No pages converted');
    }
    
    if (page_number >= result.PngResultPages.length) {
      return Response.json({ 
        error: `Page ${page_number + 1} not found. PDF has ${result.PngResultPages.length} pages.` 
      }, { status: 400 });
    }
    
    const pageImage = result.PngResultPages[page_number];
    
    // pageImage.PngData is base64 encoded
    const base64Data = pageImage.PngData;
    const imageBuffer = Uint8Array.from(atob(base64Data), c => c.charCodeAt(0));
    
    // Upload the PNG
    const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
    const imageFile = new File([imageBlob], `cover-page-${page_number + 1}.png`, { type: 'image/png' });
    
    const { file_url: imageUrl } = await base44.integrations.Core.UploadFile({ file: imageFile });
    
    return Response.json({
      success: true,
      image_url: imageUrl,
      page_number: page_number + 1
    });

  } catch (error) {
    console.error('Page capture error:', error);
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to capture page'
    }, { status: 500 });
  }
});