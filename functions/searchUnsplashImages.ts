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

    const unsplashKey = Deno.env.get('UNSPLASH_ACCESS_KEY');
    
    if (!unsplashKey) {
      // Fallback to placeholder images if no API key
      return Response.json({
        images: [
          {
            id: '1',
            url: `https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=1200&q=80`,
            thumbnail: `https://images.unsplash.com/photo-1516339901601-2e1b62dc0c45?w=400&q=80`,
            description: query,
            photographer: 'Unsplash',
            photographer_url: 'https://unsplash.com'
          }
        ],
        fallback: true
      });
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${perPage}&orientation=landscape&content_filter=high`,
      {
        headers: {
          'Authorization': `Client-ID ${unsplashKey}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    
    const images = data.results.map(img => ({
      id: img.id,
      url: img.urls.regular,
      thumbnail: img.urls.small,
      description: img.description || img.alt_description || query,
      photographer: img.user.name,
      photographer_url: img.user.links.html
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