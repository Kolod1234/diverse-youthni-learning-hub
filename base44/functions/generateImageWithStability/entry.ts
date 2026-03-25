import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, aspect_ratio = '16:9' } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('STABILITY_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Stability API key not configured' }, { status: 500 });
    }

    console.log('Generating Stability AI image:', prompt);

    const response = await fetch('https://api.stability.ai/v2beta/stable-image/generate/ultra', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      body: (() => {
        const formData = new FormData();
        formData.append('prompt', prompt);
        formData.append('aspect_ratio', aspect_ratio);
        formData.append('output_format', 'png');
        return formData;
      })()
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Stability AI error: ${error}`);
    }

    const data = await response.json();
    
    if (data.image) {
      // Upload base64 image to storage
      const imageBuffer = Uint8Array.from(atob(data.image), c => c.charCodeAt(0));
      const imageBlob = new Blob([imageBuffer], { type: 'image/png' });
      const imageFile = new File([imageBlob], 'generated.png', { type: 'image/png' });
      
      const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile });
      
      console.log('Generated Stability image:', file_url);
      return Response.json({ url: file_url });
    }

    throw new Error('No image in response');

  } catch (error) {
    console.error('Stability AI generation error:', error);
    return Response.json({ 
      error: 'Failed to generate image', 
      details: error.message 
    }, { status: 500 });
  }
});