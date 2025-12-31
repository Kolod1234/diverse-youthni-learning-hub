import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('MANUS_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'MANUS_API_KEY not configured' }, { status: 500 });
    }

    // Call Manus API
    const response = await fetch('https://api.manus.app/v1/images/generations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        prompt: prompt,
        model: 'flux-1.1-pro',
        width: 1024,
        height: 1024,
        num_inference_steps: 30
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Manus API error:', errorText);
      return Response.json({ 
        error: 'Failed to generate image with Manus',
        details: errorText 
      }, { status: response.status });
    }

    const result = await response.json();
    
    // Manus returns image URL or base64
    if (result.url) {
      return Response.json({ 
        url: result.url,
        success: true 
      });
    } else if (result.image) {
      return Response.json({ 
        url: `data:image/png;base64,${result.image}`,
        success: true 
      });
    }

    return Response.json({ error: 'No image generated' }, { status: 500 });

  } catch (error) {
    console.error('Error generating image:', error);
    return Response.json({ 
      error: 'Failed to generate image',
      details: error.message 
    }, { status: 500 });
  }
});