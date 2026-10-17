import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Updates shared counters that students' actions affect (downloads, enrolments, ratings, A/B test
// impressions). With the new access rules students can no longer edit Course, Academy,
// LibraryResource or PageSectionVariant records directly (that would also let them change titles and
// content), so these specific numbers are updated here instead, and nothing else.
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { type, id } = await req.json();
    if (!id || typeof id !== 'string') return Response.json({ error: 'Missing id' }, { status: 400 });
    const sr = base44.asServiceRole.entities;

    switch (type) {
      case 'libraryDownload': {
        const r = await sr.LibraryResource.get(id);
        await sr.LibraryResource.update(id, { downloads_count: (r.downloads_count || 0) + 1 });
        break;
      }
      case 'academyEnrolment': {
        // Count real enrolments rather than trusting a client-side +1.
        const enrolments = await sr.AcademyEnrollment.filter({ academy_id: id }, 'created_date', 10000);
        await sr.Academy.update(id, { enrolled_count: enrolments.length });
        break;
      }
      case 'courseRating': {
        // Recalculate the average from the tutor reviews themselves (same rule as before).
        const reviews = await sr.Review.filter({ course_id: id }, 'created_date', 10000);
        const rated = reviews.filter((r) => r.rating_type === 'tutor' && typeof r.rating === 'number');
        const avg = rated.length ? rated.reduce((s, r) => s + r.rating, 0) / rated.length : 0;
        await sr.Course.update(id, { rating: avg });
        break;
      }
      case 'abImpression':
      case 'abClick': {
        const field = type === 'abImpression' ? 'impressions' : 'clicks';
        const v = await sr.PageSectionVariant.get(id);
        await sr.PageSectionVariant.update(id, { [field]: (v[field] || 0) + 1 });
        break;
      }
      default:
        return Response.json({ error: 'Unknown type' }, { status: 400 });
    }
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
