import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import OpenAI from 'npm:openai';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sceneDescription, textToDisplay, style = 'modern', size = '1024x1024' } = await req.json();

    if (!textToDisplay) {
      return Response.json({ error: 'textToDisplay is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!apiKey) {
      return Response.json({ 
        error: 'OPENAI_API_KEY not configured. Please add your OpenAI API key in settings.' 
      }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: apiKey
    });

    // Create spelling-optimized prompt using best practices
    const scene = sceneDescription || 'a clean, professional background';
    const optimizedPrompt = `
    Create a high-resolution image of: ${scene}

    CRITICAL TYPOGRAPHY REQUIREMENT:
    The image MUST feature the text: "${textToDisplay}"

    TEXT INSTRUCTIONS:
    1. Spelling must be 100% accurate: "${textToDisplay}"
    2. Font style: Bold, legible, high-contrast, ${style}
    3. Text placement: Integrated naturally (e.g., on a neon sign, billboard, label, or overlay)
    4. Do not hallucinate extra letters
    5. Each character must be clearly visible and correctly spelled
    `.trim();

    console.log('Generating with prompt:', optimizedPrompt);

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: optimizedPrompt,
      size: size,
      quality: 'standard',
      n: 1,
    });

    const imageUrl = response.data[0].url;

    if (!imageUrl) {
      return Response.json({ 
        error: 'No image URL returned from OpenAI' 
      }, { status: 500 });
    }

    // Download the image and convert to data URL for direct use
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    const arrayBuffer = await imageBlob.arrayBuffer();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
    const dataUrl = `data:image/png;base64,${base64}`;

    return Response.json({ 
      url: dataUrl,
      originalUrl: imageUrl,
      message: 'Text image generated successfully with DALL-E 3'
    });

  } catch (error) {
    console.error('OpenAI text generation error:', error);
    return Response.json({ 
      error: 'Failed to generate text image',
      details: error.message 
    }, { status: 500 });
  }
});