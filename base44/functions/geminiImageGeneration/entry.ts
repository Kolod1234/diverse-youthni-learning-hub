import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, topic } = await req.json();
    
    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiKey) {
      return Response.json({ 
        error: 'OPENAI_API_KEY not set'
      }, { status: 500 });
    }

    // Try DALL-E first
    try {
      const response = await fetch(
        'https://api.openai.com/v1/images/generations',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${openaiKey}`
          },
          body: JSON.stringify({
            model: 'dall-e-3',
            prompt: prompt,
            n: 1,
            size: '1792x1024',
            quality: 'standard'
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.data?.[0]?.url) {
          return Response.json({ 
            url: data.data[0].url,
            source: 'dall-e-3'
          });
        }
      }
    } catch (dalleError) {
      console.error('DALL-E failed:', dalleError);
    }

    // Fallback to base44 AI image generation
    console.log('Falling back to base44 AI image generation');

    const fallbackResult = await base44.integrations.Core.GenerateImage({
      prompt: prompt
    });

    return Response.json({ 
      url: fallbackResult.url,
      source: 'base44-ai'
    });
    
  } catch (error) {
    console.error('Error generating image:', error);
    return Response.json({ 
      error: error.message 
    }, { status: 500 });
  }
});