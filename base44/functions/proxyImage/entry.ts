import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await req.json();
    
    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 });
    }

    // Fetch the external image
    const imageResponse = await fetch(url);
    
    if (!imageResponse.ok) {
      return Response.json({ error: 'Failed to fetch image' }, { status: 500 });
    }

    const imageBlob = await imageResponse.blob();
    
    // Upload to Base44 storage with proper CORS
    const file = new File([imageBlob], 'proxied-image.png', { type: imageBlob.type });
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });

    return Response.json({ url: file_url });
    
  } catch (error) {
    console.error('Proxy image error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});