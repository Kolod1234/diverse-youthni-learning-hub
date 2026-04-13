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

    // Use total_slides from lesson — user must set this in the editor
    const totalSlides = lesson.total_slides;
    if (!totalSlides || totalSlides < 1) {
      return Response.json({
        error: 'Please set the "Total Slides" field in the lesson editor before converting.',
      }, { status: 400 });
    }

    // Build one iframe slide per page using numeric slide index (works for PPT imports too)
    const customSlides = [];
    for (let i = 1; i <= totalSlides; i++) {
      const embedUrl = `https://docs.google.com/presentation/d/${presentationId}/embed?rm=minimal&slide=${i}`;
      const content = `<div style="width:100%;aspect-ratio:16/9;overflow:hidden;border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.15);">
  <iframe src="${embedUrl}" frameborder="0" allowfullscreen style="width:100%;height:100%;border:none;" title="Slide ${i}"></iframe>
</div>`;

      customSlides.push({
        title: `Slide ${i}`,
        content,
        order: i - 1,
      });
    }

    // Update lesson with the generated slides
    await base44.asServiceRole.entities.Lesson.update(lessonId, {
      content_type: 'richtext',
      slides: customSlides,
      total_slides: customSlides.length,
    });

    console.log(`Converted ${customSlides.length} slides for presentation ${presentationId}`);

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