import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, designId, exportFormat, prompt, canvaUrl } = await req.json();

    const clientId = Deno.env.get('CANVA_CLIENT_ID');
    const clientSecret = Deno.env.get('CANVA_CLIENT_SECRET');

    if (!clientId || !clientSecret) {
      return Response.json({ 
        error: 'Canva credentials not configured',
        message: 'Please set CANVA_CLIENT_ID and CANVA_CLIENT_SECRET'
      }, { status: 500 });
    }

    // Generate Canva editor URL
    if (action === 'create_design') {
      const canvaEditorUrl = `https://www.canva.com/api/design/create?client_id=${clientId}&redirect_uri=${encodeURIComponent('https://your-app.base44.com/canva-callback')}`;
      
      return Response.json({ 
        editorUrl: canvaEditorUrl,
        message: 'Open this URL to create a design in Canva'
      });
    }

    // Export design
    if (action === 'export_design' && designId) {
      const exportUrl = `https://api.canva.com/v1/designs/${designId}/export`;
      
      const exportResponse = await fetch(exportUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${clientSecret}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format: exportFormat || 'png'
        })
      });

      if (!exportResponse.ok) {
        return Response.json({ 
          error: 'Failed to export design',
          status: exportResponse.status 
        }, { status: 500 });
      }

      const exportData = await exportResponse.json();
      return Response.json(exportData);
    }

    // Get design embed URL
    if (action === 'get_embed_url') {
      const embedUrl = `https://www.canva.com/design/embed?client_id=${clientId}`;
      return Response.json({ embedUrl });
    }

    // Generate image using Canva AI
    if (action === 'generate_image' && prompt) {
      const generateUrl = 'https://api.canva.com/v1/ai/images/generate';
      
      const generateResponse = await fetch(generateUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${clientSecret}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          aspect_ratio: '16:9',
          quality: 'standard'
        })
      });

      if (!generateResponse.ok) {
        return Response.json({ 
          error: 'Failed to generate image with Canva AI',
          status: generateResponse.status 
        }, { status: 500 });
      }

      const imageData = await generateResponse.json();
      return Response.json({ 
        url: imageData.image?.url || imageData.url,
        message: 'Image generated successfully with Canva AI'
      });
    }

    // Import and parse existing Canva design
    if (action === 'import_design') {
      let extractedDesignId = designId;
      
      // Extract design ID from Canva URL if provided
      if (canvaUrl) {
        const urlMatch = canvaUrl.match(/design\/([A-Za-z0-9_-]+)/);
        if (urlMatch) {
          extractedDesignId = urlMatch[1];
        }
      }
      
      if (!extractedDesignId) {
        return Response.json({ 
          error: 'Design ID or valid Canva URL required' 
        }, { status: 400 });
      }

      // Fetch design data from Canva API
      const designUrl = `https://api.canva.com/rest/v1/designs/${extractedDesignId}`;
      
      const designResponse = await fetch(designUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${clientSecret}`,
          'Content-Type': 'application/json'
        }
      });

      if (!designResponse.ok) {
        return Response.json({ 
          error: 'Failed to fetch Canva design',
          status: designResponse.status 
        }, { status: 500 });
      }

      const designData = await designResponse.json();
      
      // Export the design to get the actual content
      const exportUrl = `https://api.canva.com/rest/v1/exports`;
      
      const exportResponse = await fetch(exportUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${clientSecret}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          design_id: extractedDesignId,
          format: {
            type: 'png'
          }
        })
      });

      if (!exportResponse.ok) {
        return Response.json({ 
          error: 'Failed to export Canva design',
          status: exportResponse.status 
        }, { status: 500 });
      }

      const exportData = await exportResponse.json();
      
      return Response.json({ 
        design: designData,
        export: exportData,
        message: 'Design imported successfully'
      });
    }

    return Response.json({ 
      error: 'Invalid action',
      validActions: ['create_design', 'export_design', 'get_embed_url', 'generate_image', 'import_design']
    }, { status: 400 });

  } catch (error) {
    console.error('Canva integration error:', error);
    return Response.json({ 
      error: 'Failed to process Canva request',
      details: error.message 
    }, { status: 500 });
  }
});