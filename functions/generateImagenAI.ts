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

    // Use Stable Diffusion via Stability AI API
    const endpoint = 'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image';
    
    const sdResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        text_prompts: [{
          text: prompt,
          weight: 1
        }],
        cfg_scale: 7,
        height: aspectRatio === 'portrait' || aspectRatio === '9:16' ? 768 : aspectRatio === 'landscape' || aspectRatio === '16:9' ? 640 : 1024,
        width: aspectRatio === 'landscape' || aspectRatio === '16:9' ? 1536 : aspectRatio === 'portrait' || aspectRatio === '9:16' ? 640 : 1024,
        samples: 1,
        steps: 30
      })
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