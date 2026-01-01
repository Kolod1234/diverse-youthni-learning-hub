import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl } = await req.json();
    
    if (!imageUrl) {
      return Response.json({ error: 'Image URL is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('GOOGLE_VISION_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Google Vision API key not configured' }, { status: 500 });
    }

    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      return Response.json({ error: 'Failed to fetch image' }, { status: 400 });
    }

    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));

    // Call Google Vision API
    const visionResponse = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requests: [
            {
              image: { content: base64Image },
              features: [
                { type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }
              ]
            }
          ]
        })
      }
    );

    if (!visionResponse.ok) {
      const errorText = await visionResponse.text();
      console.error('Vision API Error:', errorText);
      return Response.json({ error: 'Vision API request failed' }, { status: 500 });
    }

    const visionData = await visionResponse.json();
    const annotations = visionData.responses[0];

    if (!annotations.textAnnotations || annotations.textAnnotations.length === 0) {
      return Response.json({ words: [], symbols: [] });
    }

    // Skip first annotation (full text) and process individual words
    const words = annotations.textAnnotations.slice(1).map(annotation => {
      const vertices = annotation.boundingPoly.vertices;
      
      return {
        text: annotation.description,
        confidence: 95, // Google Vision is highly accurate
        bbox: {
          x0: Math.min(...vertices.map(v => v.x || 0)),
          y0: Math.min(...vertices.map(v => v.y || 0)),
          x1: Math.max(...vertices.map(v => v.x || 0)),
          y1: Math.max(...vertices.map(v => v.y || 0))
        },
        font_name: 'Unknown',
        font_size: Math.abs(
          Math.max(...vertices.map(v => v.y || 0)) - 
          Math.min(...vertices.map(v => v.y || 0))
        ),
        is_bold: false,
        is_italic: false
      };
    });

    return Response.json({ words, symbols: [] });

  } catch (error) {
    console.error('OCR function error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});