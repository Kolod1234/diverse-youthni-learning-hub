import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generate images for lesson slides using ModelLabs API
 * Provides high-quality AI-generated images for educational content
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, style = 'illustration' } = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      return Response.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const apiKey = Deno.env.get('MODELSLAB_API_KEY');
    if (!apiKey) {
      throw new Error(`ModelLabs API key not configured. Available env keys: ${Object.keys(Deno.env.toObject()).filter(k => k.includes('MODEL')).join(', ')}`);
    }

    // Enhance prompt with style for better results
    const enhancedPrompt = `${prompt}. Style: ${style}. High quality, professional, educational illustration.`;

    // Call ModelLabs API
    const modelLabsResponse = await fetch('https://modelslab.com/api/v7/images/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        model_id: 'nano-banana-pro',
        aspect_ratio: '16:9',
        key: apiKey,
      }),
    });

    if (!modelLabsResponse.ok) {
      const error = await modelLabsResponse.text();
      throw new Error(`ModelLabs API error: ${modelLabsResponse.status} - ${error}`);
    }

    const result = await modelLabsResponse.json();

    // ModelLabs returns images in the response
    const imageUrl = result.images?.[0] || result.url;
    
    if (!imageUrl) {
      throw new Error('No image returned from ModelLabs API');
    }

    return Response.json({
      success: true,
      url: imageUrl,
      data: {
        url: imageUrl
      },
      prompt: prompt,
      style: style,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Image generation error:', error);
    return Response.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
});