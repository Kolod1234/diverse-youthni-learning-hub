import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { fetchAppFile, isAppFileUrl } from '../../shared/urlSafety.ts';

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

    // Validate the URL to prevent SSRF, then fetch WITHOUT forwarding the
    // caller's credentials — never attach the inbound Authorization header
    // to an outbound fetch of a caller-supplied URL.
    // Only this app's own uploads can be read, and no credentials are sent with the request.
    if (!isAppFileUrl(file_url)) {
      return Response.json({ success: false, error: 'Only files uploaded to this app can be used.' }, { status: 400 });
    }
    let response;
    try {
      response = await fetchAppFile(file_url);
    } catch (e) {
      return Response.json({ success: false, error: e.message || 'Invalid file URL' }, { status: 400 });
    }
    
    if (!response.ok) {
      console.error('Fetch failed:', response.status, response.statusText);
      return Response.json({ 
        success: false,
        error: `Failed to fetch PDF: ${response.statusText}` 
      }, { status: 500 });
    }
    
    const contentType = response.headers.get('content-type');
    console.log('Content-Type:', contentType);
    
    const arrayBuffer = await response.arrayBuffer();
    console.log('PDF size:', arrayBuffer.byteLength, 'bytes');
    
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