import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, designId, exportFormat } = await req.json();

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

    return Response.json({ 
      error: 'Invalid action',
      validActions: ['create_design', 'export_design', 'get_embed_url']
    }, { status: 400 });

  } catch (error) {
    console.error('Canva integration error:', error);
    return Response.json({ 
      error: 'Failed to process Canva request',
      details: error.message 
    }, { status: 500 });
  }
});