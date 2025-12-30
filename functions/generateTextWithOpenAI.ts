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

    // Create spelling-optimized prompt
    const scene = sceneDescription || 'a clean, professional background';
    const optimizedPrompt = `
A high-quality image of ${scene}.

IMPORTANT VISUAL REQUIREMENT:
The image must prominently feature the text "${textToDisplay}".
The text must be spelled correctly: "${textToDisplay}".

Typography Style: Clear, legible, high-contrast, ${style}.
The text should be integrated naturally into the scene (e.g., on a sign, label, or overlay).
Focus on perfect typography and spelling accuracy.
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