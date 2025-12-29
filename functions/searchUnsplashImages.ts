import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, perPage = 3 } = await req.json();
    
    if (!query) {
      return Response.json({ error: 'Query is required' }, { status: 400 });
    }

    // Use Perplexity to search for educational images from authoritative sources
    const perplexityKey = Deno.env.get('PERPLEXITY_API_KEY');
    
    if (!perplexityKey) {
      return Response.json({ 
        error: 'PERPLEXITY_API_KEY not set',
        images: [],
        fallback: true
      }, { status: 500 });
    }

    const searchPrompt = `Find ${perPage} high-quality educational images about "${query}" from authoritative sources like:
- Wikimedia Commons (commons.wikimedia.org)
- NASA images (images.nasa.gov)
- NIH/Medical images (.nih.gov)
- Educational institutions (.edu)
- Government sources (.gov)

Return ONLY valid JSON in this exact format:
{
  "images": [
    {
      "url": "direct image URL ending in .jpg, .png, or .svg",
      "description": "brief description of the image",
      "source": "source name (e.g., NASA, Wikimedia Commons)"
    }
  ]
}

CRITICAL: All URLs must be direct image links (ending in image extensions), not webpage links.`;

    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${perplexityKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.1-sonar-small-128k-online',
        messages: [
          {
            role: 'system',
            content: 'You are an expert at finding educational images from authoritative sources. Always return valid JSON only.'
          },
          {
            role: 'user',
            content: searchPrompt
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`Perplexity API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    // Parse JSON from response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const result = JSON.parse(jsonMatch[0]);
    
    const images = result.images.map((img, idx) => ({
      id: `${Date.now()}-${idx}`,
      url: img.url,
      thumbnail: img.url,
      description: img.description || query,
      photographer: img.source || 'Educational Source',
      photographer_url: img.url
    }));

    return Response.json({ images, fallback: false });
    
  } catch (error) {
    console.error('Error searching images:', error);
    return Response.json({ 
      error: error.message,
      images: [],
      fallback: true
    }, { status: 500 });
  }
});