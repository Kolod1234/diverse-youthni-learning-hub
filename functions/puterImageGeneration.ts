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

    // Enhance prompt with educational values and spelling accuracy
    const enhancedPrompt = `${prompt}, diverse representation, respectful, community-focused, educational, professional.

CRITICAL TYPOGRAPHY REQUIREMENT:
All visible text must be spelled 100% accurately.

TEXT INSTRUCTIONS:
1. Spelling must be perfect - no gibberish or pseudotext
2. Font style: Bold, legible, high-contrast
3. Text placement: Integrated naturally
4. Do not hallucinate extra letters
5. Each character must be clearly visible and correctly spelled`;

    // Call Stability AI's SDXL API
    const response = await fetch('https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        text_prompts: [{ text: enhancedPrompt }],
        cfg_scale: 7,
        height: 1024,
        width: 1024,
        steps: 30,
        samples: 1
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Stability AI error:', errorText);
      return Response.json({ 
        error: 'Failed to generate image with Stability AI',
        details: errorText 
      }, { status: response.status });
    }

    const result = await response.json();
    
    // Stability AI returns base64 encoded images
    if (result.artifacts && result.artifacts.length > 0) {
      const base64Image = result.artifacts[0].base64;
      return Response.json({ 
        url: `data:image/png;base64,${base64Image}`,
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