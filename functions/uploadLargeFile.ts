import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return Response.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedExtensions = ['.pdf', '.epub', '.mobi', '.doc', '.docx', '.jpg', '.jpeg', '.png', '.gif'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      return Response.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // File size limit: 500MB
    const maxSize = 500 * 1024 * 1024;
    if (file.size > maxSize) {
      return Response.json({ 
        error: `File too large. Maximum size is 500MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB` 
      }, { status: 400 });
    }

    // Upload to public storage (supports larger files than Core.UploadFile)
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
      success: false,
      error: error.message || 'Upload failed' 
    }, { status: 500 });
  }
});