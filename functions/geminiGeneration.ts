import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query } = await req.json();
    
    if (!query) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openaiKey) {
      return Response.json({ 
        error: 'OPENAI_API_KEY not set'
      }, { status: 500 });
    }

    const response = await fetch(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: query
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    return Response.json({ 
      content,
      model: 'gpt-3.5-turbo'
    });
    
  } catch (error) {
    console.error('Error with OpenAI API:', error);
    return Response.json({ 
      error: error.message
    }, { status: 500 });
  }
});