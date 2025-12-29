import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, topic } = await req.json();
    
    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiKey) {
      return Response.json({ 
        error: 'GEMINI_API_KEY not set'
      }, { status: 500 });
    }

    // Use Gemini's Imagen API for generating educational diagrams
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${geminiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instances: [{
            prompt: `A professional educational infographic of ${prompt}. Ensure all text labels are spelled correctly, the layout is clear, and diagrams are accurate. High quality, suitable for classroom use.`,
            sampleCount: 1
          }],
          parameters: {
            sampleCount: 1,
            aspectRatio: "16:9"
          }
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      
      // Fallback to Gemini text generation to describe the image, then use standard image generation
      console.log('Gemini Imagen not available, using fallback...');
      
      const fallbackPrompt = `Educational diagram showing ${prompt}. 
      
CRITICAL REQUIREMENTS:
- Clean, professional educational diagram style
- Perfect spelling of all scientific and technical terms
- Clear labels with correct spelling
- Simple, clean design suitable for students
- Professional educational quality for classroom use

Topic context: ${topic || prompt}
Style: Illustrative diagram, infographic, or educational chart`;

      const imageResult = await base44.integrations.Core.GenerateImage({
        prompt: fallbackPrompt
      });

      if (imageResult?.url) {
        return Response.json({ 
          url: imageResult.url,
          source: 'fallback-ai'
        });
      }
      
      throw new Error(`Gemini Imagen error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const imageUrl = data.predictions[0].bytesBase64Encoded;
    
    // Convert base64 to blob URL or upload to storage
    const imageBlob = Uint8Array.from(atob(imageUrl), c => c.charCodeAt(0));
    
    // Upload to Base44 storage
    const uploadResult = await base44.integrations.Core.UploadFile({
      file: new Blob([imageBlob], { type: 'image/png' })
    });

    return Response.json({ 
      url: uploadResult.file_url,
      source: 'gemini-imagen'
    });
    
  } catch (error) {
    console.error('Error with Gemini image generation:', error);
    return Response.json({ 
      error: error.message
    }, { status: 500 });
  }
});