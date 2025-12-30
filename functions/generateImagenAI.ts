import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, aspectRatio = '16:9' } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!apiKey) {
      return Response.json({ 
        error: 'GEMINI_API_KEY not configured' 
      }, { status: 500 });
    }

    // Use Google's Imagen 3 via Vertex AI
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/YOUR_PROJECT/locations/us-central1/publishers/google/models/imagen-3.0-generate-001:predict`;
    
    // Format aspect ratio for Imagen
    const aspectRatioMap = {
      '16:9': '16:9',
      'landscape': '16:9',
      'portrait': '9:16',
      'square': '1:1'
    };

    const imagenResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        instances: [{
          prompt: prompt,
          parameters: {
            sampleCount: 1,
            aspectRatio: aspectRatioMap[aspectRatio] || '16:9',
            safetyFilterLevel: 'block_some',
            personGeneration: 'allow_adult'
          }
        }]
      })
    });

    if (!imagenResponse.ok) {
      const errorText = await imagenResponse.text();
      console.error('Imagen API error:', errorText);
      return Response.json({ 
        error: 'Failed to generate image with Imagen',
        details: errorText
      }, { status: imagenResponse.status });
    }

    const data = await imagenResponse.json();
    const imageUrl = data.predictions?.[0]?.bytesBase64Encoded;

    if (!imageUrl) {
      return Response.json({ 
        error: 'No image returned from Imagen' 
      }, { status: 500 });
    }

    // Convert base64 to data URL
    const dataUrl = `data:image/png;base64,${imageUrl}`;

    return Response.json({ 
      url: dataUrl,
      message: 'Image generated successfully with Google Imagen'
    });

  } catch (error) {
    console.error('Imagen generation error:', error);
    return Response.json({ 
      error: 'Failed to generate image',
      details: error.message 
    }, { status: 500 });
  }
});