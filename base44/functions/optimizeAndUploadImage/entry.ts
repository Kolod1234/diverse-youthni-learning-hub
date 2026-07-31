import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    
    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Base44 backend functions do not expose shell processes such as
    // Deno.Command. Upload the original image rather than failing the request.
    const arrayBuffer = await file.arrayBuffer();
    const uploadFile = new File([arrayBuffer], file.name, { type: file.type });
    const { file_url } = await base44.integrations.Core.UploadFile({ file: uploadFile });

    return Response.json({ file_url, optimized: false });

  } catch (error) {
    console.error('Image optimization error:', error);
    return Response.json({ 
      error: 'Image optimization failed', 
      details: error.message 
    }, { status: 500 });
  }
});