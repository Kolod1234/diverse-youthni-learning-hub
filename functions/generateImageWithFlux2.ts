import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, aspect_ratio = '1:1' } = await req.json();
    
    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('REPLICATE_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Replicate API key not configured' }, { status: 500 });
    }

    console.log('Generating image with Flux 2 Pro...');

    // Start prediction using Flux Pro (latest version)
    const response = await fetch('https://api.replicate.com/v1/models/black-forest-labs/flux-pro/predictions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'wait'
      },
      body: JSON.stringify({
        input: {
          prompt: prompt,
          aspect_ratio: aspect_ratio,
          num_outputs: 1,
          output_format: 'png',
          output_quality: 90
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Replicate API error:', response.status, errorText);
      return Response.json({ 
        error: 'Image generation failed', 
        details: errorText 
      }, { status: 500 });
    }

    let result = await response.json();
    const predictionId = result.id;

    // Poll for completion
    console.log('Polling for completion...');
    let attempts = 0;
    while (result.status === 'starting' || result.status === 'processing') {
      if (attempts > 60) {
        return Response.json({ error: 'Generation timeout' }, { status: 500 });
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        }
      });
      
      result = await pollResponse.json();
      attempts++;
    }

    if (result.status !== 'succeeded' || !result.output || result.output.length === 0) {
      return Response.json({ 
        error: 'Image generation failed', 
        details: result.error || 'No output generated' 
      }, { status: 500 });
    }

    const imageUrl = result.output[0];
    console.log('Image generated:', imageUrl);

    // Download and upload to Base44 storage
    const imageResponse = await fetch(imageUrl);
    const imageBlob = await imageResponse.blob();
    const file = new File([imageBlob], 'flux2-generated.png', { type: 'image/png' });

    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file });
    
    return Response.json({ 
      url: uploadResult.file_url 
    });

  } catch (error) {
    console.error('Flux 2 generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});