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

    const apiKey = Deno.env.get('STABILITY_API_KEY');
    
    if (!apiKey) {
      return Response.json({ 
        error: 'STABILITY_API_KEY not configured. Please add your Stability AI API key in settings.' 
      }, { status: 500 });
    }

    // Map aspect ratios
    const aspectRatioMap = {
      'landscape': '16:9',
      'portrait': '9:16',
      'square': '1:1',
      '16:9': '16:9',
      '9:16': '9:16',
      '1:1': '1:1'
    };

    // Use Stable Diffusion via Stability AI API (v2beta endpoint)
    const endpoint = 'https://api.stability.ai/v2beta/stable-image/generate/sd3';
    
    // Optimize prompt for text spelling accuracy
    const optimizedPrompt = prompt.includes('text:') || prompt.includes('TEXT:') || prompt.includes('spell') || prompt.includes('word') ? `
    Create a high-resolution image of: ${prompt}

    CRITICAL TYPOGRAPHY REQUIREMENT:
    All text in the image must be spelled 100% accurately.

    TEXT INSTRUCTIONS:
    1. Spelling must be perfect - no extra or missing letters
    2. Font style: Bold, legible, and high-contrast
    3. Text placement: Integrated naturally into the scene
    4. Do not hallucinate extra characters
    5. Each character must be clearly visible and correctly spelled
    `.trim() : prompt;

    const formData = new FormData();
    formData.append('prompt', optimizedPrompt);
    formData.append('mode', 'text-to-image');
    formData.append('aspect_ratio', aspectRatioMap[aspectRatio] || '1:1');
    formData.append('model', 'sd3-large');
    formData.append('output_format', 'png');

    const sdResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'image/*'
      },
      body: formData
    });

    if (!sdResponse.ok) {
      const errorText = await sdResponse.text();
      console.error('Stable Diffusion API error:', errorText);
      return Response.json({ 
        error: 'Failed to generate image with Stable Diffusion',
        details: errorText
      }, { status: sdResponse.status });
    }

    const data = await sdResponse.json();
    
    if (!data.artifacts || data.artifacts.length === 0) {
      return Response.json({ 
        error: 'No image returned from Stable Diffusion' 
      }, { status: 500 });
    }

    const base64Image = data.artifacts[0].base64;

    if (!base64Image) {
      return Response.json({ 
        error: 'Invalid image data from Stable Diffusion' 
      }, { status: 500 });
    }

    // Convert base64 to data URL
    const dataUrl = `data:image/png;base64,${base64Image}`;

    return Response.json({ 
      url: dataUrl,
      message: 'Image generated successfully with Stable Diffusion'
    });

  } catch (error) {
    console.error('Imagen generation error:', error);
    return Response.json({ 
      error: 'Failed to generate image',
      details: error.message 
    }, { status: 500 });
  }
});