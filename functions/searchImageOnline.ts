import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { query, slideTitle, slideContent, presentationTopic } = await req.json();

    if (!query) {
      return Response.json({ error: 'Search query is required' }, { status: 400 });
    }

    // Build context-aware search prompt
    let contextPrompt = `Search the web for the most relevant high-quality educational image for: "${query}"`;
    
    if (presentationTopic) {
      contextPrompt += `\n\nPresentation Topic: ${presentationTopic}`;
    }
    
    if (slideTitle) {
      contextPrompt += `\n\nSlide Title: ${slideTitle}`;
    }
    
    if (slideContent) {
      // Extract key terms from content (remove HTML tags for better context)
      const textContent = slideContent.replace(/<[^>]*>/g, ' ').substring(0, 500);
      contextPrompt += `\n\nSlide Context: ${textContent}`;
    }

    contextPrompt += `

CRITICAL REQUIREMENTS:
- Find images that DIRECTLY relate to "${query}" in the context of the slide
- Prioritize educational diagrams, charts, infographics, and illustrations
- Look for images that match the specific concepts mentioned in the slide content
- Ensure the image is clear, high-resolution, and professionally designed
- Find images from authoritative educational sources

Prioritize sources:
1. Wikimedia Commons (commons.wikimedia.org)
2. Educational institutions (.edu domains)
3. Government agencies (.gov domains)
4. Scientific organizations (NASA, NIH, etc.)
5. Educational publishers and resources

Return ONLY the direct image URL (must end in .png, .jpg, .jpeg, .svg, or .gif).
Choose the image that best illustrates the specific topic "${query}" within the presentation context.`;

    // Use LLM to search the web and find image URLs
    const searchResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: contextPrompt,
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