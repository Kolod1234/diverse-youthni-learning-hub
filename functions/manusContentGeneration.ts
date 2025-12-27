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

    // Call Manus API for content generation
    const response = await fetch('https://api.manus.app/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{
          role: 'user',
          content: prompt
        }],
        response_format: { type: 'json_object' }
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
    const content = JSON.parse(result.choices[0].message.content);
    
    return Response.json({ 
      slides: content.slides,
      success: true 
    });

  } catch (error) {
    console.error('Error generating content:', error);
    return Response.json({ 
      error: 'Failed to generate content',
      details: error.message 
    }, { status: 500 });
  }
});