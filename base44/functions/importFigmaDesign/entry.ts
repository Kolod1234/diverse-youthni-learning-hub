import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { figmaUrl } = await req.json();

    if (!figmaUrl) {
      return Response.json({ error: 'Figma URL is required' }, { status: 400 });
    }

    const accessToken = Deno.env.get('FIGMA_ACCESS_TOKEN');
    
    if (!accessToken) {
      return Response.json({ 
        error: 'FIGMA_ACCESS_TOKEN not configured. Please set it in environment variables.' 
      }, { status: 500 });
    }

    // Extract file key from URL
    const fileKeyMatch = figmaUrl.match(/file\/([a-zA-Z0-9]+)/);
    if (!fileKeyMatch) {
      return Response.json({ 
        error: 'Invalid Figma URL format' 
      }, { status: 400 });
    }

    const fileKey = fileKeyMatch[1];

    // Fetch file data from Figma API
    const fileResponse = await fetch(`https://api.figma.com/v1/files/${fileKey}`, {
      headers: {
        'X-Figma-Token': accessToken
      }
    });

    if (!fileResponse.ok) {
      const errorText = await fileResponse.text();
      console.error('Figma API error:', errorText);
      return Response.json({ 
        error: 'Failed to fetch Figma file',
        details: errorText
      }, { status: fileResponse.status });
    }

    const fileData = await fileResponse.json();
    
    // Get all top-level frames from the document
    const frames = [];
    
    if (fileData.document && fileData.document.children) {
      for (const page of fileData.document.children) {
        if (page.children) {
          for (const node of page.children) {
            if (node.type === 'FRAME' || node.type === 'COMPONENT') {
              frames.push({
                id: node.id,
                name: node.name
              });
            }
          }
        }
      }
    }

    if (frames.length === 0) {
      return Response.json({ 
        error: 'No frames found in Figma file' 
      }, { status: 404 });
    }

    // Export frames as images
    const nodeIds = frames.map(f => f.id).join(',');
    const imagesResponse = await fetch(
      `https://api.figma.com/v1/images/${fileKey}?ids=${nodeIds}&format=png&scale=2`,
      {
        headers: {
          'X-Figma-Token': accessToken
        }
      }
    );

    if (!imagesResponse.ok) {
      return Response.json({ 
        error: 'Failed to export images from Figma' 
      }, { status: 500 });
    }

    const imagesData = await imagesResponse.json();

    // Map frame data with image URLs
    const images = frames.map(frame => ({
      name: frame.name,
      url: imagesData.images[frame.id]
    })).filter(img => img.url);

    return Response.json({ 
      images,
      fileName: fileData.name,
      message: `Successfully imported ${images.length} frame(s)`
    });

  } catch (error) {
    console.error('Figma import error:', error);
    return Response.json({ 
      error: 'Failed to import Figma design',
      details: error.message 
    }, { status: 500 });
  }
});