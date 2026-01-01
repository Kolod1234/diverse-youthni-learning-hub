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

    const apiKey = Deno.env.get('FLUX2API');
    if (!apiKey) {
      return Response.json({ error: 'Flux 2 API key not configured' }, { status: 500 });
    }

    console.log('Generating image with Flux 2 Pro...');

    // Create generation task
    const response = await fetch('https://flux2api.com/v1/generate', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'pro-text-to-image',
        prompt: prompt,
        aspect_ratio: aspect_ratio,
        resolution: '1K'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Flux 2 API error:', response.status, errorText);
      return Response.json({ 
        error: 'Image generation failed', 
        details: errorText 
      }, { status: 500 });
    }

    const result = await response.json();
    
    if (result.code !== 200 || !result.data?.task_id) {
      return Response.json({ 
        error: 'Failed to create task', 
        details: result.message 
      }, { status: 500 });
    }

    const taskId = result.data.task_id;
    console.log('Task created:', taskId);

    // Poll for completion
    let attempts = 0;
    let taskResult;
    
    while (attempts < 60) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const statusResponse = await fetch(`https://flux2api.com/v1/status?task_id=${taskId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      taskResult = await statusResponse.json();
      
      if (taskResult.data?.status === 'SUCCESS') {
        break;
      }
      
      if (taskResult.data?.status === 'FAILED') {
        return Response.json({ 
          error: 'Image generation failed', 
          details: taskResult.data.error || 'Task failed' 
        }, { status: 500 });
      }
      
      attempts++;
    }

    if (attempts >= 60 || taskResult.data?.status !== 'SUCCESS') {
      return Response.json({ error: 'Generation timeout' }, { status: 500 });
    }

    const imageUrl = taskResult.data.response[0];
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