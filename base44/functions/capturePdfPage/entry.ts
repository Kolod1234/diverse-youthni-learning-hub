import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { assertSafeFetchUrl } from '../../shared/urlSafety.ts';

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

    // Validate the caller-supplied URL before fetching to prevent SSRF.
    try {
      await assertSafeFetchUrl(file_url);
    } catch (e) {
      return Response.json({ error: e.message || 'Invalid file URL' }, { status: 400 });
    }

    // Use pdf-lib to extract the single page
    const { PDFDocument } = await import('npm:pdf-lib@1.17.1');
    
    // Fetch PDF with proper headers
    const pdfResponse = await fetch(file_url, {
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    if (!pdfResponse.ok) {
      return Response.json({ 
        error: `Failed to fetch PDF: ${pdfResponse.status}` 
      }, { status: 400 });
    }
    
    const arrayBuffer = await pdfResponse.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    
    const pageCount = pdfDoc.getPageCount();
    
    if (page_number >= pageCount || page_number < 0) {
      return Response.json({ 
        error: `Invalid page ${page_number + 1}. PDF has ${pageCount} pages.` 
      }, { status: 400 });
    }

    // Extract single page as new PDF
    const newPdf = await PDFDocument.create();
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [page_number]);
    newPdf.addPage(copiedPage);
    
    const pdfBytes = await newPdf.save();
    
    // Upload the single-page PDF
    const pdfBlob = new Blob([pdfBytes], { type: 'application/pdf' });
    const pdfFile = new File([pdfBlob], `page-${page_number + 1}.pdf`, { type: 'application/pdf' });
    
    const { file_url: singlePageUrl } = await base44.integrations.Core.UploadFile({ file: pdfFile });
    
    // Use LLM with vision to describe the page, then generate an image
    const description = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: 'Describe this PDF page in detail - all text, images, colors, layout, and design elements. Be very specific and detailed.',
      file_urls: [singlePageUrl],
      add_context_from_internet: false
    });
    
    // Generate image from description
    const prompt = `Create an exact replica of this document page: ${description}. Include all text exactly as shown, preserve all colors, layout, images, and design elements. Make it look like a professional book cover.`;
    
    const result = await base44.asServiceRole.integrations.Core.GenerateImage({
      prompt: prompt
    });
    
    if (result && result.url) {
      return Response.json({
        success: true,
        image_url: result.url,
        page_number: page_number + 1
      });
    }
    
    // Fallback: return the single-page PDF
    return Response.json({
      success: true,
      image_url: singlePageUrl,
      page_number: page_number + 1,
      note: 'PDF format'
    });

  } catch (error) {
    console.error('Page capture error:', error);
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to capture page'
    }, { status: 500 });
  }
});