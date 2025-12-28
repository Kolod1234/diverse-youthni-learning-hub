import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      query, 
      slideTitle, 
      slideContent, 
      presentationTopic,
      style = 'photographic',
      aspectRatio = 'landscape',
      colorPalette = 'any'
    } = await req.json();

    if (!query) {
      return Response.json({ error: 'Search query is required' }, { status: 400 });
    }

    // Map style preferences
    const styleGuide = {
      photographic: 'realistic photograph, high-quality photography',
      illustrative: 'educational illustration, diagram, or infographic',
      abstract: 'abstract or conceptual visualization',
      diagram: 'labeled diagram, technical illustration, or schematic'
    };

    // Map aspect ratio preferences
    const ratioGuide = {
      landscape: 'wide landscape format (16:9 or 4:3)',
      portrait: 'vertical portrait format (9:16 or 3:4)',
      square: 'square format (1:1)'
    };

    // Map color preferences
    const colorGuide = {
      any: 'any color scheme',
      warm: 'warm colors (reds, oranges, yellows)',
      cool: 'cool colors (blues, greens, purples)',
      neutral: 'neutral colors (grays, whites, blacks)',
      vibrant: 'vibrant, saturated colors',
      muted: 'muted, pastel colors'
    };

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

IMAGE STYLE REQUIREMENTS:
- Style: ${styleGuide[style] || styleGuide.photographic}
- Aspect Ratio: ${ratioGuide[aspectRatio] || ratioGuide.landscape}
- Color Palette: ${colorGuide[colorPalette] || colorGuide.any}

CRITICAL REQUIREMENTS:
- Find images that DIRECTLY relate to "${query}" in the context of the slide
- Match the requested style: ${style}
- Prefer ${aspectRatio} orientation
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
      // Fallback: Generate AI image if search fails
      console.log('Image search failed, generating AI fallback image');
      
      try {
        const aiImagePrompt = `Educational ${style} illustration: ${query}. 
Style: ${styleGuide[style] || 'photographic'}, ${ratioGuide[aspectRatio] || 'landscape format'}.
Colors: ${colorGuide[colorPalette] || 'any'}.
Purpose: Educational presentation about ${presentationTopic || query}.
Clean, professional, suitable for educational materials.`;

        const generatedImage = await base44.asServiceRole.integrations.Core.GenerateImage({
          prompt: aiImagePrompt
        });

        if (generatedImage?.url) {
          return Response.json({ 
            url: generatedImage.url,
            source: 'ai_generated',
            fallback: true
          });
        }
      } catch (genError) {
        console.error('AI image generation failed:', genError);
      }

      // Ultimate fallback: return placeholder
      return Response.json({ 
        url: `https://via.placeholder.com/800x450/4F46E5/FFFFFF?text=${encodeURIComponent(query)}`,
        source: 'placeholder',
        fallback: true
      });
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