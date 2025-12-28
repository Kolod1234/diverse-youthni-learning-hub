import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, model = 'llama-3.1-sonar-large-128k-online' } = await req.json();

    if (!query) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    const apiKey = Deno.env.get('PERPLEXITY_API_KEY');
    if (!apiKey) {
      return Response.json({ 
        error: 'Perplexity API key not configured',
        details: 'Please set PERPLEXITY_API_KEY in environment variables'
      }, { status: 500 });
    }

    // Call Perplexity API
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'system',
            content: 'You are a helpful educational assistant that provides accurate, well-researched information with citations.'
          },
          {
            role: 'user',
            content: query
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      return Response.json({ 
        error: 'Perplexity API error',
        details: errorData
      }, { status: response.status });
    }

    const data = await response.json();
    
    return Response.json({ 
      content: data.choices[0].message.content,
      citations: data.citations || [],
      model: model
    });

  } catch (error) {
    console.error('Error calling Perplexity:', error);
    return Response.json({ 
      error: 'Failed to call Perplexity API',
      details: error.message 
    }, { status: 500 });
  }
});