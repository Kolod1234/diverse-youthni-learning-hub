import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Generate images for lesson slides using AI
 * Supports multiple image generation APIs via Base44 integrations
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, style = 'default' } = await req.json();

    if (!prompt || prompt.trim().length === 0) {
      return Response.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Enhance prompt with style
    const enhancedPrompt = `${prompt}. Style: ${style}. High quality, professional illustration.`;

    // Use Base44 image generation integration
    const imageResponse = await base44.integrations.Core.GenerateImage({
      prompt: enhancedPrompt,
    });

    if (!imageResponse || !imageResponse.url) {
      throw new Error('Failed to generate image');
    }

    return Response.json({
      success: true,
      imageUrl: imageResponse.url,
      prompt: prompt,
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