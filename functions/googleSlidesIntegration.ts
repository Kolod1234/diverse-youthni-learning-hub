import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, lessonId, presentationId } = await req.json();

    // Get Google Slides access token
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googleslides');

    if (action === 'export') {
      // Export lesson to Google Slides
      const lessons = await base44.entities.Lesson.filter({ id: lessonId });
      const lesson = lessons[0];

      if (!lesson) {
        return Response.json({ error: 'Lesson not found' }, { status: 404 });
      }

      // Create a new presentation
      const createResponse = await fetch('https://slides.googleapis.com/v1/presentations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: lesson.title,
        }),
      });

      const presentation = await createResponse.json();

      if (!createResponse.ok) {
        return Response.json({ error: 'Failed to create presentation', details: presentation }, { status: 500 });
      }

      const presentationId = presentation.presentationId;

      // Add slides
      const requests = [];
      const slides = lesson.slides || [];

      // Remove the default slide first
      if (presentation.slides && presentation.slides.length > 0) {
        requests.push({
          deleteObject: {
            objectId: presentation.slides[0].objectId,
          },
        });
      }

      // Create slides from lesson content
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        const slideId = `slide_${i}`;

        // Create slide
        requests.push({
          createSlide: {
            objectId: slideId,
            insertionIndex: i,
            slideLayoutReference: {
              predefinedLayout: 'TITLE_AND_BODY',
            },
          },
        });

        // Strip HTML tags for plain text
        const stripHtml = (html) => {
          return html
            .replace(/<[^>]*>/g, ' ')
            .replace(/&nbsp;/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        };

        const titleText = slide.title || `Slide ${i + 1}`;
        const bodyText = stripHtml(slide.content || '');

        // Add title
        requests.push({
          insertText: {
            objectId: `${slideId}_title`,
            text: titleText,
          },
        });

        // Add body text (limited to 5000 chars)
        const truncatedBody = bodyText.substring(0, 5000);
        requests.push({
          insertText: {
            objectId: `${slideId}_body`,
            text: truncatedBody,
          },
        });
      }

      // Apply all requests
      const updateResponse = await fetch(
        `https://slides.googleapis.com/v1/presentations/${presentationId}:batchUpdate`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ requests }),
        }
      );

      const updateResult = await updateResponse.json();

      if (!updateResponse.ok) {
        return Response.json({ error: 'Failed to update slides', details: updateResult }, { status: 500 });
      }

      return Response.json({
        success: true,
        presentationId,
        url: `https://docs.google.com/presentation/d/${presentationId}/edit`,
      });
    } else if (action === 'import') {
      // Import Google Slides presentation as lesson content
      const getResponse = await fetch(
        `https://slides.googleapis.com/v1/presentations/${presentationId}`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      const presentation = await getResponse.json();

      if (!getResponse.ok) {
        return Response.json({ error: 'Failed to fetch presentation', details: presentation }, { status: 500 });
      }

      // Convert slides to lesson format
      const lessonSlides = presentation.slides.map((slide, index) => {
        let title = 'Untitled Slide';
        let content = '';

        // Extract text and images from slide elements
        if (slide.pageElements) {
          for (const element of slide.pageElements) {
            // Extract text from shapes
            if (element.shape && element.shape.text) {
              const text = element.shape.text.textElements
                .map((te) => te.textRun?.content || '')
                .join('');
              
              // First text block is usually the title
              if (title === 'Untitled Slide' && text.trim()) {
                title = text.trim();
              } else if (text.trim()) {
                content += `<p>${text.trim()}</p>`;
              }
            }
            
            // Extract images
            if (element.image && element.image.contentUrl) {
              const imageUrl = element.image.contentUrl;
              const width = element.size?.width?.magnitude || 400;
              const height = element.size?.height?.magnitude || 300;
              content += `<img src="${imageUrl}" alt="Slide image" style="max-width: 100%; height: auto;" />`;
            }
          }
        }

        return {
          title: title || `Slide ${index + 1}`,
          content: content || '<p>No content</p>',
          order: index + 1,
        };
      });

      return Response.json({
        success: true,
        title: presentation.title,
        slides: lessonSlides,
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Google Slides integration error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});