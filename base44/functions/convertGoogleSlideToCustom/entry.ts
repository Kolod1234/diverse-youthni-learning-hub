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

    // Get access token for Google Slides API
    const { accessToken } = await base44.asServiceRole.connectors.getConnection('googleslides');

    // Fetch presentation metadata to get slide IDs and titles
    const presentationResponse = await fetch(
      `https://slides.googleapis.com/v1/presentations/${presentationId}`,
      { headers: { 'Authorization': `Bearer ${accessToken}` } }
    );

    if (!presentationResponse.ok) {
      const errorText = await presentationResponse.text();
      console.error('Google Slides API error:', errorText);
      return Response.json({ error: 'Failed to fetch Google Slides presentation. Make sure the presentation is shared and accessible.', details: errorText }, { status: 500 });
    }

    const presentation = await presentationResponse.json();
    const slides = presentation.slides || [];

    if (slides.length === 0) {
      return Response.json({ error: 'Presentation has no slides' }, { status: 400 });
    }

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

    // Build custom slides using per-slide embed URLs (no thumbnail API needed)
    const customSlides = slides.map((slide, i) => {
      const pageObjectId = slide.objectId;
      const title = extractTitle(slide, i);

      // Google Slides embed URL for a specific slide by its objectId
      const embedUrl = `https://docs.google.com/presentation/d/${presentationId}/embed?rm=minimal&slide=id.${pageObjectId}`;

      const content = `<div style="width:100%;aspect-ratio:16/9;overflow:hidden;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.15);">
  <iframe src="${embedUrl}" frameborder="0" allowfullscreen style="width:100%;height:100%;border:none;" title="${title}"></iframe>
</div>`;

      return {
        title,
        content,
        order: i,
      };
    });

    // Update lesson with the generated slides
    await base44.asServiceRole.entities.Lesson.update(lessonId, {
      content_type: 'richtext',
      slides: customSlides,
      total_slides: customSlides.length,
    });

    console.log(`Converted ${customSlides.length} slides using embed URLs for presentation ${presentationId}`);

    return Response.json({
      success: true,
      message: `Converted ${customSlides.length} slides successfully`,
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