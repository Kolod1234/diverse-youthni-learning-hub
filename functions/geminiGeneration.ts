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

    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    
    if (!geminiKey) {
      return Response.json({ 
        error: 'GEMINI_API_KEY not set'
      }, { status: 500 });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: query
            }]
          }]
        })
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${errorData}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;

    return Response.json({ 
      content,
      model: 'gemini-pro'
    });
    
  } catch (error) {
    console.error('Error with Gemini API:', error);
    return Response.json({ 
      error: error.message
    }, { status: 500 });
  }
});