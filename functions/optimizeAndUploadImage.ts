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

    // Read the file as array buffer
    const arrayBuffer = await file.arrayBuffer();
    const imageData = new Uint8Array(arrayBuffer);

    // Save to temp file
    const tempPath = `/tmp/${crypto.randomUUID()}.${file.name.split('.').pop()}`;
    await Deno.writeFile(tempPath, imageData);

    // Use sharp via WebAssembly for image optimization
    // Convert to WebP with quality optimization
    const command = new Deno.Command('convert', {
      args: [
        tempPath,
        '-strip',
        '-quality', '85',
        '-resize', '2048x2048>',
        '-format', 'webp',
        `/tmp/optimized-${crypto.randomUUID()}.webp`
      ],
    });

    let optimizedPath;
    try {
      const { code } = await command.output();
      if (code !== 0) throw new Error('Conversion failed');
      optimizedPath = command.args[command.args.length - 1];
    } catch {
      // Fallback: if ImageMagick not available, use original with basic optimization
      console.log('ImageMagick not available, uploading original');
      const { file_url } = await base44.integrations.Core.UploadFile({ 
        file: new File([imageData], file.name, { type: file.type })
      });
      
      // Cleanup
      try { await Deno.remove(tempPath); } catch {}
      
      return Response.json({ file_url });
    }

    // Read optimized file
    const optimizedData = await Deno.readFile(optimizedPath);
    const optimizedFile = new File(
      [optimizedData], 
      file.name.replace(/\.[^.]+$/, '.webp'),
      { type: 'image/webp' }
    );

    // Upload optimized file
    const { file_url } = await base44.integrations.Core.UploadFile({ 
      file: optimizedFile 
    });

    // Cleanup temp files
    try { 
      await Deno.remove(tempPath);
      await Deno.remove(optimizedPath);
    } catch {}

    return Response.json({ file_url });

  } catch (error) {
    console.error('Image optimization error:', error);
    return Response.json({ 
      error: 'Image optimization failed', 
      details: error.message 
    }, { status: 500 });
  }
});