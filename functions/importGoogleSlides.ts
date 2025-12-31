import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { presentationId } = await req.json();

    if (!presentationId) {
      return Response.json({ error: 'Presentation ID is required' }, { status: 400 });
    }

    console.log('Importing Google Slides:', presentationId);

    // Get access token for Google Slides
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googleslides');

    // Fetch presentation details
    const presentationResponse = await fetch(
      `https://slides.googleapis.com/v1/presentations/${presentationId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (!presentationResponse.ok) {
      const error = await presentationResponse.text();
      throw new Error(`Failed to fetch presentation: ${error}`);
    }

    const presentation = await presentationResponse.json();
    console.log('Fetched presentation:', presentation.title);

    // Convert Google Slides to our format
    const slides = presentation.slides.map((slide, idx) => {
      // Extract text from slide
      let content = '';
      let title = slide.pageElements?.[0]?.shape?.text?.textElements
        ?.map(el => el.textRun?.content || '')
        .join('') || `Slide ${idx + 1}`;

      // Extract all text content
      if (slide.pageElements) {
        const textElements = slide.pageElements
          .filter(el => el.shape && el.shape.text)
          .map(el => el.shape.text.textElements
            ?.map(te => te.textRun?.content || '')
            .join('')
          )
          .filter(text => text.trim());

        if (textElements.length > 0) {
          title = textElements[0] || `Slide ${idx + 1}`;
          content = textElements.slice(1).join('\n');
        }
      }

      // Convert text to HTML
      const htmlContent = content
        .split('\n')
        .filter(line => line.trim())
        .map(line => `<p>${line}</p>`)
        .join('');

      return {
        title: title.trim() || `Slide ${idx + 1}`,
        content: htmlContent || '<p>Content from Google Slides</p>',
        order: idx + 1,
        imageUrl: null
      };
    });

    return Response.json({ slides });

  } catch (error) {
    console.error('Error importing Google Slides:', error);
    return Response.json({ 
      error: 'Failed to import Google Slides', 
      details: error.message 
    }, { status: 500 });
  }
});