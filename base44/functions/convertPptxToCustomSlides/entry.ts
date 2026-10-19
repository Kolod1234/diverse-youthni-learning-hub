import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
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

    // Download PPTX file
    const fileResponse = await fetchAppFile(fileUrl);
    if (!fileResponse.ok) {
      return Response.json({ error: 'Failed to download file' }, { status: 400 });
    }

    const arrayBuffer = await fileResponse.arrayBuffer();
    
    // Use pptxgen or similar library to parse - for now, we'll use a simpler approach
    // Import JSZip to read the PPTX structure
    const { default: JSZip } = await import('npm:jszip@3.10.1');
    
    const zip = new JSZip();
    const loaded = await zip.loadAsync(arrayBuffer);
    
    const slides = [];
    const slideFiles = Object.keys(loaded.files).filter(f => 
      f.startsWith('ppt/slides/slide') && f.endsWith('.xml')
    );

    // Parse each slide
    for (let i = 0; i < slideFiles.length; i++) {
      const slideFile = slideFiles[i];
      const content = await loaded.files[slideFile].async('text');
      
      // Extract text from slide XML
      const textMatches = content.match(/<a:t>([^<]*)<\/a:t>/g) || [];
      const slideText = textMatches
        .map(match => match.replace(/<a:t>|<\/a:t>/g, ''))
        .filter(text => text.trim())
        .join('\n');

      slides.push({
        order: i + 1,
        title: slideText.split('\n')[0] || `Slide ${i + 1}`,
        content: `<div style="padding: 20px; background: #f5f5f5; border-radius: 8px;"><h3>${slideText.split('\n')[0] || `Slide ${i + 1}`}</h3><div style="margin-top: 15px; white-space: pre-wrap;">${slideText.split('\n').slice(1).join('<br />')}</div></div>`,
      });
    }

    if (slides.length === 0) {
      return Response.json({ error: 'No slides found in PPTX' }, { status: 400 });
    }

    return Response.json({
      success: true,
      slideCount: slides.length,
      slides: slides,
    });
  } catch (error) {
    console.error('PPTX conversion error:', error);
    return Response.json({ 
      error: error.message || 'Failed to convert PPTX' 
    }, { status: 500 });
  }
});