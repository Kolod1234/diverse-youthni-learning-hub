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

    // Use Gemini API with imagen-3.0-generate-001
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generate?key=${apiKey}`;
    
    const imagenResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        numberOfImages: 1,
        aspectRatio: aspectRatio === 'landscape' ? '16:9' : aspectRatio === 'portrait' ? '9:16' : aspectRatio === 'square' ? '1:1' : '16:9'
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
    
    // Check for generated images
    if (!data.generatedImages || data.generatedImages.length === 0) {
      return Response.json({ 
        error: 'No image returned from Imagen' 
      }, { status: 500 });
    }

    // Get the first generated image
    const imageData = data.generatedImages[0];
    const base64Image = imageData.bytesBase64Encoded || imageData.image;

    if (!base64Image) {
      return Response.json({ 
        error: 'Invalid image data from Imagen' 
      }, { status: 500 });
    }

    // Convert base64 to data URL
    const dataUrl = `data:image/png;base64,${base64Image}`;

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