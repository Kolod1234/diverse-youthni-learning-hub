import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const contentType = req.headers.get('content-type');
    
    if (!contentType || !contentType.includes('multipart/form-data')) {
      return Response.json({ error: 'Invalid content type' }, { status: 400 });
    }

    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check if it's a file object
    if (!(file instanceof File)) {
      return Response.json({ error: 'Invalid file' }, { status: 400 });
    }

    // Check file type
    if (!file.type.includes('pdf')) {
      return Response.json({ error: 'Only PDF files are allowed' }, { status: 400 });
    }

    // Allow up to 500MB
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      return Response.json({ 
        error: `File too large. Maximum size is 500MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB` 
      }, { status: 413 });
    }

    // Upload using base44 integration
    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    return Response.json({
      success: true,
      file_url,
      file_name: file.name,
      file_size: file.size
    });
  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ 
      error: error.message || 'Upload failed',
      success: false 
    }, { status: 500 });
  }
});