import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { packageUrl, courseId, lessonId } = await req.json();

    // Download and extract SCORM package
    const response = await fetch(packageUrl);
    const arrayBuffer = await response.arrayBuffer();
    
    // For now, create a basic SCORM package record
    // In production, you would extract and parse the imsmanifest.xml
    const scormPackage = await base44.asServiceRole.entities.SCORMPackage.create({
      course_id: courseId,
      lesson_id: lessonId,
      title: 'SCORM Content',
      package_url: packageUrl,
      scorm_version: '1.2',
      launch_url: packageUrl, // In production, this would be extracted from manifest
      is_published: true
    });

    // Track xAPI statement for package upload
    await base44.asServiceRole.entities.xAPIStatement.create({
      actor: {
        objectType: 'Agent',
        name: user.full_name,
        mbox: `mailto:${user.email}`
      },
      verb: {
        id: 'http://adlnet.gov/expapi/verbs/uploaded',
        display: { 'en-US': 'uploaded' }
      },
      object: {
        objectType: 'Activity',
        id: scormPackage.id,
        definition: {
          name: { 'en-US': scormPackage.title },
          type: 'http://adlnet.gov/expapi/activities/module'
        }
      },
      timestamp: new Date().toISOString(),
      course_id: courseId,
      lesson_id: lessonId
    });

    return Response.json({
      success: true,
      packageId: scormPackage.id,
      title: scormPackage.title,
      scorm_version: scormPackage.scorm_version,
      launch_url: scormPackage.launch_url
    });
  } catch (error) {
    console.error('Error processing SCORM package:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});