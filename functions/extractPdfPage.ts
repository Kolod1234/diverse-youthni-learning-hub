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
    const pdfBlob = await response.blob();
    const pdfFile = new File([pdfBlob], 'temp.pdf', { type: 'application/pdf' });
    
    // Upload the PDF temporarily
    const { file_url: tempPdfUrl } = await base44.integrations.Core.UploadFile({ file: pdfFile });
    
    // Use Manus API to convert PDF page to image
    const manusResponse = await fetch('https://backend.manus.chat/api/v1/image-generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Deno.env.get('MANUS_API_KEY')}`
      },
      body: JSON.stringify({
        prompt: `Convert page ${page_number + 1} of this PDF to a high-quality image: ${tempPdfUrl}`,
        model: 'flux-1.1-pro',
        width: 800,
        height: 1200
      })
    });
    
    if (!manusResponse.ok) {
      // Fallback: just extract as single-page PDF
      const { PDFDocument } = await import('npm:pdf-lib@1.17.1');
      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      
      if (page_number >= pageCount) {
        return Response.json({ 
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
        message: 'PDF page extracted (PDF format)',
        format: 'pdf'
      });
    }
    
    const manusData = await manusResponse.json();
    const imageUrl = manusData.url || manusData.image_url;
    
    // Download the generated image
    const imgResponse = await fetch(imageUrl);
    const imgBlob = await imgResponse.blob();
    const imgFile = new File([imgBlob], `page-${page_number + 1}.png`, { type: 'image/png' });
    
    const { file_url: extractedPageUrl } = await base44.integrations.Core.UploadFile({ file: imgFile });
    
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