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
      return Response.json({ error: 'Search query is required' }, { status: 400 });
    }

    // Use LLM to search the web and find image URLs
    const searchResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `Search the web for high-quality educational images related to: "${query}"
      
Find images that are:
- Educational diagrams, illustrations, or infographics
- Clear and professionally designed
- Relevant to the topic
- High resolution and visually appealing
- From reputable educational sources (Wikipedia, educational sites, government agencies, universities)

Return the best image URL you find. Look for .png, .jpg, .jpeg, or .svg files.
Prioritize images from:
- Wikimedia Commons
- Educational institutions (.edu domains)
- Government websites (.gov)
- Reputable educational resources

Return ONLY the direct image URL, nothing else.`,
      add_context_from_internet: true
    });

    // Extract URL from response
    let imageUrl = searchResult;
    if (typeof searchResult === 'object' && searchResult.url) {
      imageUrl = searchResult.url;
    }

    // Validate it's a proper URL
    if (typeof imageUrl !== 'string' || !imageUrl.startsWith('http')) {
      return Response.json({ 
        error: 'No valid image URL found',
        details: 'Could not find a suitable image for the query'
      }, { status: 404 });
    }

    return Response.json({ 
      url: imageUrl.trim(),
      source: 'web_search'
    });

  } catch (error) {
    console.error('Error searching for image:', error);
    return Response.json({ 
      error: 'Failed to search for image',
      details: error.message 
    }, { status: 500 });
  }
});