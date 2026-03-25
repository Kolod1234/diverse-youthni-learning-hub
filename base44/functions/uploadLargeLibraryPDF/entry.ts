import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  console.log('=== BACKEND UPLOAD START ===');
  console.log('Method:', req.method);
  console.log('Content-Type:', req.headers.get('content-type'));

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      console.error('User not authenticated');
      return Response.json({ error: 'Unauthorized', success: false }, { status: 401 });
    }

    console.log('User authenticated:', user.email);

    // Parse form data
    console.log('Parsing form data...');
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file) {
      console.error('No file in form data. Available keys:', Array.from(formData.keys()));
      return Response.json({ error: 'No file provided', success: false }, { status: 400 });
    }

    console.log('File received:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    if (!(file instanceof File)) {
      console.error('Invalid file object, got:', typeof file);
      return Response.json({ error: 'Invalid file object', success: false }, { status: 400 });
    }

    // Allow various document types
    const allowedExtensions = ['pdf', 'epub', 'mobi', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'webp'];
    const fileExt = file.name.split('.').pop()?.toLowerCase();
    
    if (!fileExt || !allowedExtensions.includes(fileExt)) {
      console.error('File type not allowed:', fileExt);
      return Response.json({ 
        error: `File type not supported. Allowed: ${allowedExtensions.join(', ')}`, 
        success: false 
      }, { status: 400 });
    }

    // Check file size (500MB)
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      console.error('File too large:', file.size);
      return Response.json({ 
        error: `File too large. Max 500MB, got ${(file.size / 1024 / 1024).toFixed(1)}MB`, 
        success: false 
      }, { status: 413 });
    }

    console.log('Uploading to storage...');
    const uploadResult = await base44.integrations.Core.UploadFile({ file });
    console.log('Upload result:', uploadResult);

    if (!uploadResult?.file_url) {
      throw new Error('No file_url returned from upload');
    }

    console.log('=== BACKEND UPLOAD SUCCESS ===');
    console.log('File URL:', uploadResult.file_url);
    
    return Response.json({
      success: true,
      file_url: uploadResult.file_url,
      file_name: file.name,
      file_size: file.size
    });

  } catch (error) {
    console.error('=== BACKEND UPLOAD ERROR ===');
    console.error('Error:', error);
    console.error('Stack:', error.stack);
    
    return Response.json({ 
      error: error.message || 'Upload failed',
      success: false,
      details: error.stack
    }, { status: 500 });
  }
});