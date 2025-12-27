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
      
      // Log what we're getting back for debugging
      console.log('Parsed slides from Manus:', JSON.stringify(parsedContent.slides, null, 2));
      
      return Response.json({ 
        status: 'completed',
        slides: parsedContent.slides,
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