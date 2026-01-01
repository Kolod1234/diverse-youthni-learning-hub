import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, aspect_ratio = '16:9' } = await req.json();
    
    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('VERTEX_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Vertex API key not configured' }, { status: 500 });
    }

    // Map aspect ratio to Vertex format
    const aspectRatioMap = {
      '16:9': '16:9',
      '1:1': '1:1',
      '4:3': '4:3',
      '9:16': '9:16'
    };

    const vertexAspectRatio = aspectRatioMap[aspect_ratio] || '1:1';

    // Call Google Imagen API via generativelanguage endpoint (supports API key auth)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:generate?key=${apiKey}`;
    console.log('Calling Imagen API...');
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: prompt,
        number_of_images: 1,
        aspect_ratio: vertexAspectRatio,
        safety_filter_level: 'block_some',
        person_generation: 'allow_adult'
      })
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vertex AI error response:', response.status, errorText);
      return Response.json({ 
        error: 'Image generation failed', 
        status: response.status,
        details: errorText 
      }, { status: 500 });
    }

    const result = await response.json();
    console.log('API Response:', JSON.stringify(result).substring(0, 200));
    
    // Extract base64 image from response
    const imageData = result.generated_images?.[0]?.image?.image_bytes;
    
    if (!imageData) {
      return Response.json({ error: 'No image data in response' }, { status: 500 });
    }

    // Convert base64 to blob and upload
    const imageBytes = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));
    const blob = new Blob([imageBytes], { type: 'image/png' });
    const file = new File([blob], 'vertex-generated.png', { type: 'image/png' });

    // Upload to storage
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file });
    
    return Response.json({ 
      url: uploadResult.file_url 
    });

  } catch (error) {
    console.error('Vertex AI image generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});