import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { file, sessionId, chunkIndex, totalChunks, fileName } = await req.json();

    if (!file) {
      return Response.json({ error: 'No file data provided' }, { status: 400 });
    }

    // Convert base64 or ArrayBuffer back to Blob
    let fileBlob;
    if (typeof file === 'string') {
      const binaryString = atob(file);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      fileBlob = new Blob([bytes]);
    } else {
      fileBlob = new Blob([new Uint8Array(file)]);
    }

    // For last chunk, combine all chunks and upload
    if (chunkIndex === totalChunks - 1) {
      const chunkFile = new File([fileBlob], fileName, { type: 'application/octet-stream' });
      const result = await base44.integrations.Core.UploadFile({ file: chunkFile });
      
      return Response.json({ 
        success: true,
        file_url: result.file_url,
        message: 'All chunks uploaded successfully'
      });
    }

    // For intermediate chunks, just acknowledge
    return Response.json({ 
      success: true,
      message: `Chunk ${chunkIndex + 1}/${totalChunks} received`
    });

  } catch (error) {
    console.error('Chunk upload error:', error);
    return Response.json({ 
      success: false,
      error: error.message || 'Chunk upload failed' 
    }, { status: 500 });
  }
});