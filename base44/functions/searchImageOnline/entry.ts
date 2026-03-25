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
      colorPalette = 'any',
      useStockLibrary = false
    } = await req.json();

    if (!query) {
      return Response.json({ error: 'Search query is required' }, { status: 400 });
    }

    // If stock library is requested, use Unsplash/Pexels API directly
    if (useStockLibrary) {
      const unsplashKey = Deno.env.get('UNSPLASH_ACCESS_KEY');
      
      if (unsplashKey) {
        try {
          const searchUrl = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=20&orientation=${aspectRatio === 'portrait' ? 'portrait' : aspectRatio === 'square' ? 'squarish' : 'landscape'}`;
          
          const unsplashResponse = await fetch(searchUrl, {
            headers: {
              'Authorization': `Client-ID ${unsplashKey}`
            }
          });

          if (unsplashResponse.ok) {
            const data = await unsplashResponse.json();
            const images = data.results.map(img => ({
              url: img.urls.regular,
              description: img.description || img.alt_description || query,
              source: 'Unsplash',
              photographer: img.user.name,
              downloadLocation: img.links.download_location
            }));

            if (images.length > 0) {
              return Response.json({ images });
            }
          }
        } catch (error) {
          console.error('Unsplash API error:', error);
        }
      }

      // Fallback to Pexels
      const pexelsKey = Deno.env.get('PEXELS_API_KEY');
      
      if (pexelsKey) {
        try {
          const pexelsUrl = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=20&orientation=${aspectRatio === 'portrait' ? 'portrait' : aspectRatio === 'square' ? 'square' : 'landscape'}`;
          
          const pexelsResponse = await fetch(pexelsUrl, {
            headers: {
              'Authorization': pexelsKey
            }
          });

          if (pexelsResponse.ok) {
            const data = await pexelsResponse.json();
            const images = data.photos.map(img => ({
              url: img.src.large,
              description: query,
              source: 'Pexels',
              photographer: img.photographer
            }));

            if (images.length > 0) {
              return Response.json({ images });
            }
          }
        } catch (error) {
          console.error('Pexels API error:', error);
        }
      }
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

    // Enhanced prompt with better context integration
    const searchPrompt = `You are an expert educational image curator searching Google for: "${query}"

PRESENTATION CONTEXT:
${presentationTopic ? `- Overall Topic: ${presentationTopic}` : ''}
${slideTitle ? `- Current Slide: "${slideTitle}"` : ''}
${slideContent ? `- Slide Content: ${slideContent.replace(/<[^>]*>/g, ' ').substring(0, 300)}` : ''}

SEARCH SPECIFICATIONS:
📸 Style Required: ${styleGuide[style] || 'high-quality educational content'}
   ${style === 'diagram' ? '→ Focus on labeled diagrams, technical illustrations, educational schematics' : ''}
   ${style === 'photographic' ? '→ Focus on professional photographs, real-world examples' : ''}
   ${style === 'illustrative' ? '→ Focus on educational illustrations, infographics, artistic representations' : ''}
   ${style === 'abstract' ? '→ Focus on conceptual visualizations, abstract representations' : ''}

📐 Format: ${ratioGuide[aspectRatio] || 'landscape orientation'}
🎯 Topic: "${query}" in the context of: ${presentationTopic || slideTitle || 'education'}

CRITICAL REQUIREMENTS:
1. Find 8-12 DIVERSE images from DIFFERENT authoritative sources
2. Each image MUST have a UNIQUE URL - NO DUPLICATES
3. Prioritize these trusted sources (in order):
   ✓ Wikimedia Commons (commons.wikimedia.org) - Highest priority
   ✓ Educational institutions (.edu domains)
   ✓ Government agencies (.gov domains)
   ✓ Scientific organizations (NASA, NIH, science journals)
   ✓ Educational publishers and resources

4. Images must DIRECTLY illustrate: "${query}"
5. Return ACTUAL URLs from Google search results
6. Verify each URL ends in: .jpg, .jpeg, .png, .svg, .gif, or .webp
7. Images should be high-resolution and professionally produced
8. Must be appropriate for educational presentations

SEARCH STRATEGY:
- Use Google Image Search with terms: "${query}" + educational + ${style}
- Cross-reference with slide context for relevance
- Verify image quality and educational value
- Ensure visual clarity and professional presentation

Return only real, existing images from the web that match these criteria.`;

    const webSearchResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: searchPrompt,
      add_context_from_internet: true, // This enables Google Search
      response_json_schema: {
        type: "object",
        properties: {
          images: {
            type: "array",
            items: {
              type: "object",
              properties: {
                url: { type: "string", description: "Direct image URL from Google search" },
                description: { type: "string", description: "What the image shows" },
                source: { type: "string", description: "Website domain where image is from" }
              },
              required: ["url", "description"]
            }
          }
        },
        required: ["images"]
      }
    });

    const images = webSearchResult?.images || [];
    
    // Filter to ensure valid image URLs
    const validImages = images.filter(img => 
      img.url && 
      (img.url.match(/\.(jpg|jpeg|png|gif|svg|webp)(\?|$)/i) || img.url.includes('wikimedia') || img.url.includes('placeholder'))
    );
    
    if (validImages.length > 0) {
      return Response.json({ 
        images: validImages,
        search_query: query,
        search_engine: 'Google (via AI with web context)'
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