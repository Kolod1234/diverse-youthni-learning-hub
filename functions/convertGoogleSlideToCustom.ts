import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && !user.is_tutor)) {
      return Response.json({ error: 'Unauthorized: Admin or tutor access required' }, { status: 403 });
    }

    const { lessonId } = await req.json();

    if (!lessonId) {
      return Response.json({ error: 'lessonId is required' }, { status: 400 });
    }

    // Get the lesson
    const lessons = await base44.asServiceRole.entities.Lesson.filter({ id: lessonId });
    const lesson = lessons[0];

    if (!lesson || !lesson.google_slides_url) {
      return Response.json({ error: 'Lesson not found or no Google Slides URL' }, { status: 404 });
    }

    // Extract presentation ID from Google Slides URL
    const presentationId = lesson.google_slides_url.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    if (!presentationId) {
      return Response.json({ error: 'Invalid Google Slides URL' }, { status: 400 });
    }

    // Get access token for Google Slides
    const accessToken = await base44.asServiceRole.connectors.getAccessToken('googleslides');

    // Fetch presentation data from Google Slides API
    const presentationResponse = await fetch(
      `https://slides.googleapis.com/v1/presentations/${presentationId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!presentationResponse.ok) {
      return Response.json({ error: 'Failed to fetch Google Slides presentation' }, { status: 500 });
    }

    const presentation = await presentationResponse.json();
    const customSlides = [];

    // Process each slide
    for (let i = 0; i < presentation.slides.length; i++) {
      const slide = presentation.slides[i];
      let title = '';
      let content = '';
      let imageUrl = null;

      // Extract text and images from slide elements
      if (slide.pageElements) {
        for (const element of slide.pageElements) {
          // Extract text
          if (element.shape?.text?.textElements) {
            const textContent = element.shape.text.textElements
              .filter(te => te.textRun?.content)
              .map(te => te.textRun.content)
              .join('');
            
            if (textContent.trim()) {
              if (!title) {
                title = textContent.trim().split('\n')[0];
              }
              content += `<p>${textContent.trim().replace(/\n/g, '</p><p>')}</p>`;
            }
          }

          // Extract images
          if (element.image?.contentUrl && !imageUrl) {
            try {
              // Download image
              const imageResponse = await fetch(element.image.contentUrl);
              const imageBlob = await imageResponse.blob();
              
              // Convert blob to File for upload
              const imageFile = new File([imageBlob], `slide-${i}-image.png`, { type: imageBlob.type });
              
              // Upload to Base44 storage
              const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({
                file: imageFile
              });
              
              imageUrl = uploadResult.file_url;
            } catch (error) {
              console.error(`Failed to process image from slide ${i}:`, error);
            }
          }
        }
      }

      customSlides.push({
        title: title || `Slide ${i + 1}`,
        content: content || '<p>No content</p>',
        order: i,
        imageUrl: imageUrl
      });
    }

    // Update the lesson with custom slides
    await base44.asServiceRole.entities.Lesson.update(lessonId, {
      content_type: 'richtext',
      slides: customSlides,
      // Keep google_slides_url as backup - don't remove it
    });

    return Response.json({
      success: true,
      message: 'Google Slides converted to custom slides successfully',
      slideCount: customSlides.length
    });

  } catch (error) {
    console.error('Error converting Google Slides:', error);
    return Response.json({ 
      error: 'Failed to convert Google Slides',
      details: error.message 
    }, { status: 500 });
  }
});