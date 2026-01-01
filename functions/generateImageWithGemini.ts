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

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'Gemini API key not configured' }, { status: 500 });
    }

    // Map aspect ratio to Gemini format
    const aspectRatioMap = {
      '16:9': '16:9',
      '1:1': '1:1',
      '4:3': '4:3',
      '9:16': '9:16'
    };

    const geminiAspectRatio = aspectRatioMap[aspect_ratio] || '1:1';

    // Call Google Gemini Imagen API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          instances: [
            {
              prompt: prompt
            }
          ],
          parameters: {
            sampleCount: 1,
            aspectRatio: geminiAspectRatio,
            safetyFilterLevel: 'block_some',
            personGeneration: 'allow_adult'
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      return Response.json({ error: 'Image generation failed' }, { status: 500 });
    }

    const result = await response.json();
    
    // Extract base64 image from response
    const imageData = result.predictions?.[0]?.bytesBase64Encoded;
    
    if (!imageData) {
      return Response.json({ error: 'No image data in response' }, { status: 500 });
    }

    // Convert base64 to blob and upload
    const imageBytes = Uint8Array.from(atob(imageData), c => c.charCodeAt(0));
    const blob = new Blob([imageBytes], { type: 'image/png' });
    const file = new File([blob], 'gemini-generated.png', { type: 'image/png' });

    // Upload to storage
    const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file });
    
    return Response.json({ 
      url: uploadResult.file_url 
    });

  } catch (error) {
    console.error('Gemini image generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});