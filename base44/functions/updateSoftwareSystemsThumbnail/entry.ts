import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin access required' }, { status: 403 });
    }

    const courses = await base44.asServiceRole.entities.Course.filter({
      category: 'software_systems_development'
    });

    const thumbnailUrl = 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/69418fc30769c7d951368216/908925497_image.png';

    const results = [];
    for (const course of courses) {
      await base44.asServiceRole.entities.Course.update(course.id, {
        thumbnail: thumbnailUrl
      });
      results.push({ course: course.title, status: 'updated' });
    }

    return Response.json({ 
      success: true, 
      message: `Updated ${results.length} Software Systems Development course(s) with new thumbnail`,
      results 
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});