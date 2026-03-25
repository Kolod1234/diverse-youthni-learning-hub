import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl, maskUrl, prompt } = await req.json();

    if (!imageUrl || !maskUrl || !prompt) {
      return Response.json({ error: 'imageUrl, maskUrl, and prompt are required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('STABILITY_API_KEY');
    
    if (!apiKey) {
      return Response.json({ 
        error: 'STABILITY_API_KEY not configured' 
      }, { status: 500 });
    }

    // Fetch the image and mask
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    
    const maskResponse = await fetch(maskUrl);
    const maskBlob = await maskResponse.blob();

    // Use Stable Diffusion inpainting API
    const formData = new FormData();
    formData.append('init_image', imageBlob, 'image.png');
    formData.append('mask_source', 'MASK_IMAGE_WHITE');
    formData.append('mask_image', maskBlob, 'mask.png');
    formData.append('text_prompts[0][text]', prompt);
    formData.append('text_prompts[0][weight]', '1');
    formData.append('cfg_scale', '7');
    formData.append('samples', '1');
    formData.append('steps', '30');

    const endpoint = 'https://api.stability.ai/v1/generation/stable-diffusion-512-v2-1/image-to-image/masking';
    
    const sdResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/json'
      },
      body: formData
    });

    if (!sdResponse.ok) {
      const errorText = await sdResponse.text();
      console.error('Stable Diffusion inpainting error:', errorText);
      return Response.json({ 
        error: 'Failed to inpaint image with Stable Diffusion',
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
      message: 'Image inpainted successfully with Stable Diffusion'
    });

  } catch (error) {
    console.error('Inpainting error:', error);
    return Response.json({ 
      error: 'Failed to inpaint image',
      details: error.message 
    }, { status: 500 });
  }
});