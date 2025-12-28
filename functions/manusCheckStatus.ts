import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { taskId } = await req.json();

    if (!taskId) {
      return Response.json({ error: 'Task ID is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('MANUS_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'MANUS_API_KEY not configured' }, { status: 500 });
    }

    // Check task status
    const statusResponse = await fetch(`https://api.manus.im/v1/responses/${taskId}`, {
      headers: { 'API_KEY': apiKey }
    });

    if (!statusResponse.ok) {
      const errorText = await statusResponse.text();
      return Response.json({ 
        error: 'Failed to check task status',
        details: errorText 
      }, { status: statusResponse.status });
    }

    const statusData = await statusResponse.json();
    
    // If still running, return status
    if (statusData.status === 'running') {
      return Response.json({ 
        status: 'running',
        taskId: taskId
      });
    }
    
    // If completed, parse and return slides
    if (statusData.status === 'completed') {
      const assistantMessages = statusData.output.filter(msg => msg.role === 'assistant');
      const textContent = assistantMessages
        .flatMap(msg => msg.content)
        .filter(c => c.text)
        .map(c => c.text)
        .join('\n');
      
      console.log('Raw Manus response:', textContent);
      
      // Try to extract JSON from the response
      let parsedContent;
      try {
        parsedContent = JSON.parse(textContent);
      } catch {
        const jsonMatch = textContent.match(/\{[\s\S]*"slides"[\s\S]*\}/);
        if (jsonMatch) {
          try {
            parsedContent = JSON.parse(jsonMatch[0]);
          } catch {
            console.error('Failed to parse extracted JSON');
            parsedContent = null;
          }
        }
      }
      
      if (!parsedContent || !parsedContent.slides) {
        return Response.json({ 
          error: 'Invalid response format from Manus API',
          details: 'Expected JSON with slides array',
          rawResponse: textContent
        }, { status: 500 });
      }
      
      // Extract images if present in the Manus response
      const imageContents = statusData.output
        .flatMap(msg => msg.content || [])
        .filter(c => c.type === 'image');
      
      console.log('Image contents found:', imageContents.length);
      
      // Download and re-upload images to make them permanent
      const permanentImages = [];
      for (const imgContent of imageContents) {
        try {
          const imageUrl = imgContent.source?.url;
          if (!imageUrl) {
            console.log('No image URL found in content');
            continue;
          }
          
          console.log('Fetching image from:', imageUrl);
          
          // Download the image
          const imageResponse = await fetch(imageUrl);
          if (!imageResponse.ok) {
            console.error('Failed to fetch image:', imageResponse.status, await imageResponse.text());
            continue;
          }
          
          const imageArrayBuffer = await imageResponse.arrayBuffer();
          console.log('Image downloaded, size:', imageArrayBuffer.byteLength);
          
          // Create a File object (required by UploadFile)
          const imageFile = new File(
            [imageArrayBuffer], 
            `manus-image-${Date.now()}.png`,
            { type: imageResponse.headers.get('content-type') || 'image/png' }
          );
          
          console.log('Uploading file to Base44...');
          
          // Re-upload to Base44 storage
          const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({
            file: imageFile
          });
          
          console.log('Image uploaded successfully:', uploadResult.file_url);
          permanentImages.push(uploadResult.file_url);
        } catch (error) {
          console.error('Error processing image:', error.message, error.stack);
        }
      }
      
      console.log('Permanent images:', permanentImages);
      
      // Map images to slides
      const slidesWithImages = parsedContent.slides.map((slide, index) => {
        if (permanentImages[index]) {
          return {
            ...slide,
            image_url: permanentImages[index]
          };
        }
        return slide;
      });
      
      console.log('Slides with permanent images:', JSON.stringify(slidesWithImages, null, 2));
      
      return Response.json({ 
        status: 'completed',
        slides: slidesWithImages,
        success: true 
      });
    }
    
    // Failed or unknown status
    return Response.json({ 
      status: statusData.status,
      error: 'Task failed or unknown status'
    }, { status: 500 });

  } catch (error) {
    console.error('Error checking status:', error);
    return Response.json({ 
      error: 'Failed to check status',
      details: error.message 
    }, { status: 500 });
  }
});