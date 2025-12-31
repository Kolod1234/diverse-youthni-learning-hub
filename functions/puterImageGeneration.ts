import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, agentProfile = 'manus-1.6', taskMode = 'agent', connectors = [] } = await req.json();

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
        agentProfile,
        taskMode,
        ...(connectors.length > 0 && { connectors }),
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

    const taskResult = await response.json();
    const taskId = taskResult.task_id;

    let status = 'pending';
    let attempt = 0;
    const MAX_ATTEMPTS = 60;

    while (status !== 'completed' && status !== 'failed' && attempt < MAX_ATTEMPTS) {
      attempt++;
      await new Promise(resolve => setTimeout(resolve, 5000));

      const statusResponse = await fetch(`https://api.manus.ai/v1/tasks/${taskId}`, {
        headers: { 'API_KEY': apiKey }
      });

      if (!statusResponse.ok) {
        const errorText = await statusResponse.text();
        console.error('Failed to get task status:', errorText);
        return Response.json({ error: 'Failed to get task status', details: errorText }, { status: statusResponse.status });
      }

      const taskStatus = await statusResponse.json();
      status = taskStatus.status;

      if (status === 'completed') {
        return Response.json({ url: taskStatus.result?.url || taskStatus.result });
      } else if (status === 'failed') {
        return Response.json({ error: 'Task failed', details: taskStatus.error_message }, { status: 500 });
      }
    }

    return Response.json({ error: 'Task timed out' }, { status: 500 });

    } catch (error) {
    console.error('Error creating Manus task:', error);
    return Response.json({ 
      error: 'Failed to create Manus task',
      details: error.message 
    }, { status: 500 });
    }
    });