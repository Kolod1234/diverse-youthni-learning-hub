import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { assertSafeFetchUrl } from '../../shared/urlSafety.ts';

const MAX_BYTES = 10 * 1024 * 1024;

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

    // Fetch the external image. Every hop is checked so the request can't be pointed (or
    // redirected) at an internal address, and only real images up to 10 MB are accepted.
    let target = url;
    let imageResponse;
    for (let hop = 0; hop <= 3; hop++) {
      try {
        await assertSafeFetchUrl(target);
      } catch (e) {
        return Response.json({ error: e.message || 'Invalid image URL' }, { status: 400 });
      }
      imageResponse = await fetch(target, { redirect: 'manual' });
      if (imageResponse.status < 300 || imageResponse.status >= 400) break;
      const next = imageResponse.headers.get('location');
      if (!next || hop === 3) return Response.json({ error: 'Too many redirects' }, { status: 400 });
      target = new URL(next, target).toString();
    }

    if (!imageResponse.ok) {
      return Response.json({ error: 'Failed to fetch image' }, { status: 500 });
    }
    const contentType = imageResponse.headers.get('content-type') || '';
    if (!contentType.startsWith('image/')) {
      return Response.json({ error: 'URL is not an image' }, { status: 400 });
    }
    if (Number(imageResponse.headers.get('content-length') || 0) > MAX_BYTES) {
      return Response.json({ error: 'Image is too large' }, { status: 400 });
    }

    const imageBlob = await imageResponse.blob();
    if (imageBlob.size > MAX_BYTES) {
      return Response.json({ error: 'Image is too large' }, { status: 400 });
    }
    
    // Upload to Base44 storage with proper CORS
    const file = new File([imageBlob], 'proxied-image.png', { type: imageBlob.type });
    const { file_url } = await base44.asServiceRole.integrations.Core.UploadFile({ file });

    return Response.json({ url: file_url });
    
  } catch (error) {
    console.error('Proxy image error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});