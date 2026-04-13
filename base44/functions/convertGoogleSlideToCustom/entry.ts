import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googleslides');

    // Fetch presentation data to get slide IDs, titles, and total_slides
    const presentationResponse = await fetch(
      `https://slides.googleapis.com/v1/presentations/${presentationId}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    if (!presentationResponse.ok) {
      const errorText = await presentationResponse.text();
      console.error('Google Slides API error:', errorText);
      return Response.json({ error: 'Failed to fetch Google Slides presentation', details: errorText }, { status: 500 });
    }

    const presentation = await presentationResponse.json();
    const customSlides = [];

    // Helper: arrayBuffer → base64 data URL
    const arrayBufferToBase64 = (buffer) => {
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      return btoa(binary);
    };

    // Helper: extract plain title text from a slide
    const extractTitle = (slide, index) => {
      if (!slide.pageElements) return `Slide ${index + 1}`;
      for (const el of slide.pageElements) {
        if (el.shape?.placeholder?.type === 'TITLE' || el.shape?.placeholder?.type === 'CENTERED_TITLE') {
          const text = el.shape?.text?.textElements
            ?.filter(t => t.textRun?.content)
            ?.map(t => t.textRun.content)
            ?.join('')
            ?.replace(/\n/g, ' ')
            ?.trim();
          if (text) return text;
        }
      }
      // Fallback: first non-empty text shape
      for (const el of slide.pageElements) {
        const text = el.shape?.text?.textElements
          ?.filter(t => t.textRun?.content)
          ?.map(t => t.textRun.content)
          ?.join('')
          ?.replace(/\n/g, ' ')
          ?.trim();
        if (text) return text.substring(0, 80);
      }
      return `Slide ${index + 1}`;
    };

    // Process each slide: render thumbnail → upload → store as image slide
    for (let i = 0; i < presentation.slides.length; i++) {
      const slide = presentation.slides[i];
      const pageObjectId = slide.objectId;
      const title = extractTitle(slide, i);

      let imageUrl = null;

      try {
        // Use the Slides Thumbnail API — returns a pixel-perfect rendered PNG
        const thumbResponse = await fetch(
          `https://slides.googleapis.com/v1/presentations/${presentationId}/pages/${pageObjectId}/thumbnail?thumbnailProperties.thumbnailSize=LARGE`,
          { headers: { 'Authorization': `Bearer ${accessToken}` } }
        );

        if (thumbResponse.ok) {
          const thumbData = await thumbResponse.json();
          const thumbUrl = thumbData.contentUrl;

          if (thumbUrl) {
            // Download the thumbnail image
            const imgResponse = await fetch(thumbUrl);
            if (imgResponse.ok) {
              const buffer = await imgResponse.arrayBuffer();
              const base64 = arrayBufferToBase64(buffer);
              const dataUrl = `data:image/png;base64,${base64}`;

              // Upload to app storage
              const uploadResult = await base44.asServiceRole.integrations.Core.UploadFile({ file: dataUrl });
              imageUrl = uploadResult.file_url;
              console.log(`Slide ${i + 1}: uploaded thumbnail → ${imageUrl}`);
            }
          }
        } else {
          console.error(`Thumbnail API failed for slide ${i + 1}:`, await thumbResponse.text());
        }
      } catch (err) {
        console.error(`Error processing slide ${i + 1}:`, err.message);
      }

      // Build slide content: full-width rendered image preserving all visual integrity
      let content = '';
      if (imageUrl) {
        content = `<div style="text-align: center; width: 100%;"><img src="${imageUrl}" alt="${title}" style="width: 100%; max-width: 960px; height: auto; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.15);" /></div>`;
      } else {
        content = `<p style="color: #666; text-align: center;">Slide ${i + 1} — image could not be rendered.</p>`;
      }

      customSlides.push({
        title,
        content,
        order: i,
      });
    }

    // Update lesson with rendered slides
    await base44.asServiceRole.entities.Lesson.update(lessonId, {
      content_type: 'richtext',
      slides: customSlides,
      total_slides: customSlides.length,
    });

    return Response.json({
      success: true,
      message: `Converted ${customSlides.length} slides with full visual fidelity`,
      slideCount: customSlides.length,
    });

  } catch (error) {
    console.error('Error converting Google Slides:', error);
    return Response.json({
      error: 'Failed to convert Google Slides',
      details: error.message,
    }, { status: 500 });
  }
});