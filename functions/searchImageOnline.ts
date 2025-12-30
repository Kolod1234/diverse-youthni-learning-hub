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

    // Use AI to search the web for actual images
    const searchPrompt = `${contextPrompt}

Return a JSON array with 5-8 of the best matching images you can find from the web.`;

    const webSearchResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: searchPrompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          images: {
            type: "array",
            items: {
              type: "object",
              properties: {
                url: { type: "string" },
                description: { type: "string" },
                source: { type: "string" }
              }
            }
          }
        }
      }
    });

    const images = webSearchResult?.images || [];
    
    if (images.length > 0) {
      return Response.json({ 
        images: images,
        search_query: query
      });
    }

    // Fallback: Generate an AI image
    try {
      const aiImagePrompt = `Educational ${style} ${styleGuide[style] || 'illustration'}: ${query}. 
Context: ${presentationTopic || query}${slideTitle ? ` - ${slideTitle}` : ''}.
Style: Professional, clear, suitable for educational presentations.
Format: ${ratioGuide[aspectRatio] || 'landscape'}.
Colors: ${colorGuide[colorPalette] || 'balanced color scheme'}.`;

      const generatedImage = await base44.asServiceRole.integrations.Core.GenerateImage({
        prompt: aiImagePrompt
      });

      if (generatedImage?.url) {
        return Response.json({ 
          images: [{
            url: generatedImage.url,
            description: `AI-generated: ${query}`,
            source: 'ai_generated'
          }],
          search_query: query
        });
      }
    } catch (genError) {
      console.error('AI image generation failed:', genError);
    }

    // Final fallback
    return Response.json({ 
      images: [],
      search_query: query,
      error: 'No images found'
    });

  } catch (error) {
    console.error('Error searching for image:', error);
    return Response.json({ 
      error: 'Failed to search for image',
      details: error.message 
    }, { status: 500 });
  }
});