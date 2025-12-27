import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, slideCount, includeImages } = await req.json();

    if (!prompt) {
      return Response.json({ error: 'Prompt is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('MANUS_API_KEY');
    if (!apiKey) {
      return Response.json({ error: 'MANUS_API_KEY not configured' }, { status: 500 });
    }

    // Call Manus API for content generation using OpenAI-compatible endpoint
    const response = await fetch('https://api.manus.im/v1/responses', {
      method: 'POST',
      headers: {
        'API_KEY': apiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        input: [{
          role: 'user',
          content: [{
            type: 'input_text',
            text: prompt
          }]
        }],
        task_mode: 'agent',
        agent_profile: 'manus-1.6'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Manus API error:', errorText);
      return Response.json({ 
        error: 'Failed to generate content with Manus API',
        details: errorText 
      }, { status: response.status });
    }

    const result = await response.json();
    
    // For Manus API, we need to poll for task completion
    let taskId = result.id;
    let taskStatus = result.status;
    
    // Poll until task completes (max 60 seconds)
    let attempts = 0;
    const maxAttempts = 30; // 30 attempts * 2 seconds = 60 seconds max
    
    while (taskStatus === 'running' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
      
      const statusResponse = await fetch(`https://api.manus.im/v1/responses/${taskId}`, {
        headers: { 'API_KEY': apiKey }
      });
      
      const statusData = await statusResponse.json();
      taskStatus = statusData.status;
      attempts++;
      
      if (taskStatus === 'completed') {
        // Extract content from the assistant's response
        const assistantMessages = statusData.output.filter(msg => msg.role === 'assistant');
        const textContent = assistantMessages
          .flatMap(msg => msg.content)
          .filter(c => c.text)
          .map(c => c.text)
          .join('\n');
        
        // Try to parse as JSON
        let parsedContent;
        try {
          parsedContent = JSON.parse(textContent);
        } catch {
          // If not JSON, wrap in slides structure
          parsedContent = { slides: [{ title: 'Content', content: textContent, order: 1 }] };
        }
        
        return Response.json({ 
          slides: parsedContent.slides || [],
          success: true 
        });
      }
    }
    
    if (taskStatus !== 'completed') {
      return Response.json({ 
        error: 'Task timed out or failed',
        status: taskStatus 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error generating content:', error);
    return Response.json({ 
      error: 'Failed to generate content',
      details: error.message 
    }, { status: 500 });
  }
});