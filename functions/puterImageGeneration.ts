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

    // Call Puter's text-to-image API
    const response = await fetch('https://api.puter.com/drivers/call', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        interface: 'puter-image-generation',
        driver: 'stability-ai',
        method: 'generate',
        args: {
          prompt: prompt,
          model: 'stabilityai/stable-diffusion-xl-base-1.0'
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Puter API error:', errorText);
      return Response.json({ 
        error: 'Failed to generate image with Puter API',
        details: errorText 
      }, { status: response.status });
    }

    const result = await response.json();
    
    // Puter returns the image as base64 or URL
    return Response.json({ 
      url: result.image_url || result.url || `data:image/png;base64,${result.image}`,
      success: true 
    });

  } catch (error) {
    console.error('Error generating image:', error);
    return Response.json({ 
      error: 'Failed to generate image',
      details: error.message 
    }, { status: 500 });
  }
});