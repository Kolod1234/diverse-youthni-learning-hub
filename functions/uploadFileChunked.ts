import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const CHUNK_STORAGE = new Map();

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const chunk = formData.get('chunk');
    const chunkIndex = parseInt(formData.get('chunkIndex'));
    const totalChunks = parseInt(formData.get('totalChunks'));
    const uploadId = formData.get('uploadId');
    const fileName = formData.get('fileName');

    if (!chunk || isNaN(chunkIndex) || isNaN(totalChunks) || !uploadId || !fileName) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Store chunk
    const storageKey = `${uploadId}`;
    if (!CHUNK_STORAGE.has(storageKey)) {
      CHUNK_STORAGE.set(storageKey, {
        chunks: new Array(totalChunks),
        fileName,
        userId: user.email
      });
    }

    const storage = CHUNK_STORAGE.get(storageKey);
    const chunkBuffer = await chunk.arrayBuffer();
    storage.chunks[chunkIndex] = new Uint8Array(chunkBuffer);

    // Check if all chunks received
    const receivedChunks = storage.chunks.filter(c => c !== undefined).length;
    const progress = Math.round((receivedChunks / totalChunks) * 100);

    if (receivedChunks === totalChunks) {
      // Reassemble file
      const totalSize = storage.chunks.reduce((sum, chunk) => sum + chunk.length, 0);
      const completeFile = new Uint8Array(totalSize);
      let offset = 0;

      for (const chunk of storage.chunks) {
        completeFile.set(chunk, offset);
        offset += chunk.length;
      }

      // Create blob and upload
      const blob = new Blob([completeFile], { type: 'application/octet-stream' });
      const file = new File([blob], fileName);

      const { file_url } = await base44.integrations.Core.UploadFile({ file });

      // Cleanup
      CHUNK_STORAGE.delete(storageKey);

      return Response.json({
        success: true,
        complete: true,
        progress: 100,
        file_url
      });
    }

    return Response.json({
      success: true,
      complete: false,
      progress
    });

  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});