import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// In-memory storage for chunks (in production, use a database or cloud storage)
const uploadSessions = new Map();

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get('action');
    const sessionId = url.searchParams.get('sessionId');
    const chunkIndex = url.searchParams.get('chunkIndex');

    // Handle chunk upload
    if (action === 'uploadChunk') {
      const formData = await req.formData();
      const chunk = formData.get('chunk');
      const totalChunks = parseInt(formData.get('totalChunks'));
      const fileName = formData.get('fileName');

      if (!chunk || !sessionId) {
        return Response.json({ error: 'Missing required fields' }, { status: 400 });
      }

      // Initialize session if needed
      if (!uploadSessions.has(sessionId)) {
        uploadSessions.set(sessionId, {
          chunks: [],
          fileName,
          totalChunks,
          createdAt: Date.now()
        });
      }

      const session = uploadSessions.get(sessionId);
      const chunkBuffer = await chunk.arrayBuffer();
      session.chunks[parseInt(chunkIndex)] = new Uint8Array(chunkBuffer);

      // Check if all chunks are received
      const allChunksReceived = session.chunks.length === totalChunks && 
        session.chunks.every(c => c !== undefined);

      if (allChunksReceived) {
        // Combine chunks
        const totalSize = session.chunks.reduce((sum, chunk) => sum + chunk.length, 0);
        const combinedBuffer = new Uint8Array(totalSize);
        let offset = 0;
        
        for (const chunkData of session.chunks) {
          combinedBuffer.set(chunkData, offset);
          offset += chunkData.length;
        }

        // Create a File object from combined buffer
        const combinedFile = new File([combinedBuffer], fileName, { type: 'application/octet-stream' });

        // Upload combined file using UploadPrivateFile for better handling
        let file_url;
        try {
          const result = await base44.integrations.Core.UploadFile({ file: combinedFile });
          file_url = result.file_url;
        } catch (error) {
          console.error('Upload failed:', error);
          uploadSessions.delete(sessionId);
          throw new Error('Failed to upload combined file: ' + error.message);
        }

        // Clean up session
        uploadSessions.delete(sessionId);

        return Response.json({
          success: true,
          file_url,
          file_name: fileName,
          file_size: totalSize
        });
      } else {
        return Response.json({
          success: true,
          chunkReceived: parseInt(chunkIndex) + 1,
          totalChunks
        });
      }
    }

    // Handle chunk status
    if (action === 'getStatus') {
      if (!uploadSessions.has(sessionId)) {
        return Response.json({ 
          success: false, 
          error: 'Session not found or expired' 
        }, { status: 404 });
      }

      const session = uploadSessions.get(sessionId);
      const receivedChunks = session.chunks.filter(c => c !== undefined).length;

      return Response.json({
        success: true,
        receivedChunks,
        totalChunks: session.totalChunks,
        fileName: session.fileName
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Upload error:', error);
    return Response.json({ 
      success: false,
      error: error.message || 'Upload failed' 
    }, { status: 500 });
  }
});