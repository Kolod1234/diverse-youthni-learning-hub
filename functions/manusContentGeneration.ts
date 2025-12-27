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
        error: 'Failed to generate content with Manus API',
        details: errorText 
      }, { status: response.status });
    }

    const result = await response.json();
    
    // For Manus API, we need to poll for task completion
    let taskId = result.id;
    let taskStatus = result.status;
    
    // Poll until task completes (max 10 minutes)
    let attempts = 0;
    const maxAttempts = 300; // 300 attempts * 2 seconds = 600 seconds (10 minutes)

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
        
        console.log('Raw Manus response:', textContent);
        
        // Try to extract JSON from the response
        let parsedContent;
        try {
          // Try direct parse first
          parsedContent = JSON.parse(textContent);
        } catch {
          // Try to find JSON in the text using regex
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
        
        return Response.json({ 
          slides: parsedContent.slides,
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