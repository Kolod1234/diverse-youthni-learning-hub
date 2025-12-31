import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('MANUS_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'MANUS_API_KEY not configured' }, { status: 500 });
    }

    // Create task with Manus AI for image generation
    const response = await fetch('https://api.manus.ai/v1/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API_KEY': apiKey
      },
      body: JSON.stringify({
        prompt: `Generate a high-quality educational image: ${prompt}`,
        agentProfile: 'manus-1.6',
        taskMode: 'agent',
        hideInTaskList: false
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Manus API error:', errorText);
      return Response.json({ 
        error: 'Failed to create task with Manus',
        details: errorText 
      }, { status: response.status });
    }

    const result = await response.json();
    
    return Response.json({ 
      task_id: result.task_id,
      task_url: result.task_url,
      share_url: result.share_url,
      message: 'Manus task created - check your Manus console for results'
    });

  } catch (error) {
    console.error('Error creating Manus task:', error);
    return Response.json({ 
      error: 'Failed to create Manus task',
      details: error.message 
    }, { status: 500 });
  }
});