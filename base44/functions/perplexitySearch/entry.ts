import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, searchDepth = 'standard', return_json = false, json_schema = null } = await req.json();

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

    // Map searchDepth to Perplexity models
    const modelMap = {
      'basic': 'sonar',
      'standard': 'sonar-pro',
      'advanced': 'sonar-pro'
    };
    const model = modelMap[searchDepth] || 'sonar-pro';

    // Build messages - modify prompt for JSON if needed
    let finalQuery = query;
    if (return_json && json_schema) {
      finalQuery = `${query}\n\nIMPORTANT: Return ONLY valid JSON matching this exact schema:\n${JSON.stringify(json_schema, null, 2)}\n\nNo markdown, no code blocks, no explanations - just raw JSON.`;
    }

    const messages = [
      {
        role: 'system',
        content: return_json 
          ? 'You are a precise JSON generator. Return ONLY valid JSON, no markdown, no code blocks, no explanations.'
          : 'You are a helpful assistant that provides accurate, well-researched information.'
      },
      {
        role: 'user',
        content: finalQuery
      }
    ];

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.2
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
    let content = data.choices[0].message.content;
    
    // If JSON was requested, parse and return it
    if (return_json) {
      try {
        // Clean up markdown code blocks if present
        content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const parsed = JSON.parse(content);
        return Response.json(parsed);
      } catch (e) {
        console.error('Failed to parse JSON:', e, 'Content:', content);
        return Response.json({ 
          error: 'Failed to parse JSON response',
          raw_content: content,
          parse_error: e.message
        }, { status: 500 });
      }
    }
    
    return Response.json({ 
      content: content,
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