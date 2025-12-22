import { createClientFromRequest } from 'npm:@base44/sdk@0.8.4';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prompt, type } = await req.json();
    
    if (!prompt || !type) {
      return Response.json({ error: 'Missing prompt or type' }, { status: 400 });
    }

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    if (!apiKey) {
      return Response.json({ 
        error: 'GEMINI_API_KEY not configured. Please add it in Settings → Environment Variables.' 
      }, { status: 500 });
    }

    // Call Gemini API with streaming disabled for JSON response
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.9,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Gemini API error:', error);
      return Response.json({ 
        error: 'Gemini API error',
        details: error 
      }, { status: response.status });
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      return Response.json({ 
        error: 'Invalid response from Gemini API' 
      }, { status: 500 });
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Parse JSON response
    let parsedResult;
    try {
      parsedResult = JSON.parse(generatedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', generatedText);
      return Response.json({ 
        error: 'Failed to parse AI response',
        rawResponse: generatedText 
      }, { status: 500 });
    }

    return Response.json({
      success: true,
      result: parsedResult,
      type
    });

  } catch (error) {
    console.error('Error in generateWithGemini:', error);
    return Response.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
});