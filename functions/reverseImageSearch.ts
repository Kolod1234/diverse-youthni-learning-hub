import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      imageUrl, 
      slideTitle, 
      slideContent,
      style = 'photographic',
      aspectRatio = 'landscape'
    } = await req.json();

    if (!imageUrl) {
      return Response.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Style and ratio guides
    const styleGuide = {
      photographic: 'realistic photographs, high-quality photography',
      illustrative: 'educational illustrations, diagrams, or infographics',
      abstract: 'abstract or conceptual visualizations',
      diagram: 'labeled diagrams, technical illustrations, or schematics'
    };

    const ratioGuide = {
      landscape: 'wide landscape format (16:9 or 4:3)',
      portrait: 'vertical portrait format (9:16 or 3:4)',
      square: 'square format (1:1)'
    };

    // Build reverse image search prompt
    const reverseSearchPrompt = `You are performing a reverse image search to find SIMILAR educational images.

REFERENCE IMAGE: ${imageUrl}
${slideTitle ? `\nSlide Context - Title: "${slideTitle}"` : ''}
${slideContent ? `\nSlide Context - Content: "${slideContent.replace(/<[^>]*>/g, ' ').substring(0, 200)}"` : ''}

TASK: Use Google to find 8-12 images that are VISUALLY SIMILAR or THEMATICALLY RELATED to the reference image.

REQUIREMENTS:
1. Find images with similar subject matter, composition, or visual style
2. Preferred style: ${styleGuide[style] || styleGuide.photographic}
3. Preferred format: ${ratioGuide[aspectRatio] || ratioGuide.landscape}
4. Each image must have a UNIQUE URL from different sources
5. Prioritize educational sources:
   - Wikimedia Commons
   - Educational institutions (.edu)
   - Science websites (NASA, NIH, journals)
   - Government education sites (.gov)
   - Educational publishers

6. Return ACTUAL image URLs from web search results
7. URLs must end in .jpg, .jpeg, .png, .svg, .gif, or .webp
8. Focus on images that would work well in the same educational context

IMPORTANT: Find diverse alternatives that maintain the educational quality and relevance of the reference image.`;

    // Use AI with Google Search to find similar images
    const searchResult = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: reverseSearchPrompt,
      add_context_from_internet: true,
      file_urls: [imageUrl], // Include the reference image
      response_json_schema: {
        type: "object",
        properties: {
          images: {
            type: "array",
            items: {
              type: "object",
              properties: {
                url: { type: "string", description: "Direct image URL" },
                description: { type: "string", description: "What the image shows" },
                source: { type: "string", description: "Website domain" },
                similarity_reason: { type: "string", description: "Why this image is similar" }
              },
              required: ["url", "description"]
            }
          }
        },
        required: ["images"]
      }
    });

    const images = searchResult?.images || [];
    
    // Filter valid image URLs
    const validImages = images.filter(img => 
      img.url && 
      (img.url.match(/\.(jpg|jpeg|png|gif|svg|webp)(\?|$)/i) || img.url.includes('wikimedia'))
    );
    
    if (validImages.length > 0) {
      return Response.json({ 
        images: validImages,
        reference_image: imageUrl,
        search_engine: 'Google Reverse Image Search (via AI)'
      });
    }

    // Fallback: Try extracting concepts and searching
    const conceptPrompt = `Analyze this image and identify its main educational concepts, subject matter, and key visual elements. Then search for similar educational images.

Reference image: ${imageUrl}
${slideTitle ? `Context: ${slideTitle}` : ''}

Provide 6-8 alternative images that cover the same educational concepts.`;

    const conceptSearch = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: conceptPrompt,
      add_context_from_internet: true,
      file_urls: [imageUrl],
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

    const fallbackImages = conceptSearch?.images?.filter(img => 
      img.url && img.url.match(/\.(jpg|jpeg|png|gif|svg|webp)(\?|$)/i)
    ) || [];

    if (fallbackImages.length > 0) {
      return Response.json({ 
        images: fallbackImages,
        reference_image: imageUrl
      });
    }

    return Response.json({ 
      images: [],
      reference_image: imageUrl,
      error: 'No similar images found'
    });

  } catch (error) {
    console.error('Reverse image search error:', error);
    return Response.json({ 
      error: 'Failed to perform reverse image search',
      details: error.message 
    }, { status: 500 });
  }
});