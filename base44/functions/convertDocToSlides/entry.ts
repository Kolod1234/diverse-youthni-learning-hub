import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { fetchAppFile, isAppFileUrl } from '../../shared/urlSafety.ts';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { fileUrl } = await req.json();

    if (!fileUrl) {
      return Response.json({ error: 'File URL is required' }, { status: 400 });
    }

    // Validate the caller-supplied URL before fetching to prevent SSRF.
    // Only this app's own uploads can be read (blocks arbitrary or internal addresses).
    if (!isAppFileUrl(fileUrl)) {
      return Response.json({ error: 'Only files uploaded to this app can be used.' }, { status: 400 });
    }

    console.log('Converting DOC to slides:', fileUrl);

    // Download the file
    const fileResponse = await fetchAppFile(fileUrl);
    if (!fileResponse.ok) {
      throw new Error('Failed to download file');
    }

    const fileBuffer = await fileResponse.arrayBuffer();
    const fileBlob = new Blob([fileBuffer]);

    // Extract text content using LLM with file support
    const extractionResult = await base44.integrations.Core.InvokeLLM({
      prompt: 'Extract all text content from this document. Return the full text maintaining the structure.',
      file_urls: [fileUrl],
      add_context_from_internet: false
    });

    console.log('Extracted content:', extractionResult);

    // Generate slides from extracted content
    const slidePrompt = `Convert this document content into educational presentation slides.

Content:
${extractionResult}

Create 8-12 slides with:
- Title slide
- Key points from the document
- Important concepts
- Conclusion

For each slide return:
- title: string
- content: html string (use <ul>, <li>, <p>, <strong>)
- imagePrompt: string (description for a relevant image)

Return JSON with a "slides" array.`;

    const slideData = await base44.integrations.Core.InvokeLLM({
      prompt: slidePrompt,
      response_json_schema: {
        type: 'object',
        properties: {
          slides: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                title: { type: 'string' },
                content: { type: 'string' },
                imagePrompt: { type: 'string' }
              }
            }
          }
        }
      }
    });

    const slides = slideData.slides || [];
    const slidesWithOrder = slides.map((slide, idx) => ({ ...slide, order: idx + 1 }));

    return Response.json({ slides: slidesWithOrder });

  } catch (error) {
    console.error('Error converting DOC:', error);
    return Response.json({ 
      error: 'Failed to convert document', 
      details: error.message 
    }, { status: 500 });
  }
});