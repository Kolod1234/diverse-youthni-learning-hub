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

    const enhancedPrompt = `${prompt}

    ${includeImages ? `
    IMPORTANT: Generate actual images for the slides using your image generation capabilities.
    For each slide that needs an image, generate the image and provide the image URL in the response.
    ` : ''}

    CRITICAL: You MUST respond with ONLY valid JSON in this EXACT format, no other text:
    {
    "slides": [
    {
      "title": "Slide Title Here",
      "content": "<h2>HTML content here</h2><p>More content...</p>",
      "order": 1,
      ${includeImages ? '"image_url": "generated image URL or data URI",' : ''}
      "image_position": "top"
    }
    ]
    }

    Do NOT include any explanatory text before or after the JSON. ONLY output the JSON object.`;

    // Start the Manus task
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
            text: enhancedPrompt
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
        error: 'Failed to start task with Manus API',
        details: errorText 
      }, { status: response.status });
    }

    const result = await response.json();
    
    // Return task ID immediately
    return Response.json({ 
      taskId: result.id,
      status: result.status,
      success: true 
    });

  } catch (error) {
    console.error('Error starting task:', error);
    return Response.json({ 
      error: 'Failed to start task',
      details: error.message 
    }, { status: 500 });
  }
});