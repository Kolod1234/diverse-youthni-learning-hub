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
    
    // Save as bytes
    const pdfBytes = await newPdf.save();
    
    // Upload single-page PDF temporarily
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const pdfFile = new File([blob], `temp-page-${page_number + 1}.pdf`, { type: 'application/pdf' });
    
    const { file_url: tempPdfUrl } = await base44.integrations.Core.UploadFile({ file: pdfFile });
    
    // Use Gemini API to convert PDF page to image by asking it to generate an image from the PDF
    // Use InvokeLLM with the PDF to extract visual content
    const imageResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: "Convert this PDF page to a high-quality image representation. Return the exact visual content of this page.",
      file_urls: [tempPdfUrl],
      add_context_from_internet: false
    });
    
    // Use Gemini's image generation capability with the PDF content
    // Actually, let's use a simpler approach - use GenerateImage with description
    const prompt = `Create an exact replica image of this PDF page: ${tempPdfUrl}. Maintain all text, layout, colors, and design exactly as shown.`;
    
    const { url: imageUrl } = await base44.asServiceRole.integrations.Core.GenerateImage({
      prompt: prompt,
      existing_image_urls: [tempPdfUrl]
    });
    
    return Response.json({ 
      success: true,
      page_url: imageUrl,
      page_number: page_number + 1
    });

  } catch (error) {
    console.error('PDF page extraction error:', error);
    return Response.json({ 
      success: false,
      error: error.message || 'Failed to extract page'
    }, { status: 500 });
  }
});