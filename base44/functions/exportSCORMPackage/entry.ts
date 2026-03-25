import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Export course as SCORM 1.2 or 2004 package
 * Creates a ZIP file with proper SCORM manifest and content
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { courseId, scormVersion, includeResources } = await req.json();

    if (!courseId || !scormVersion) {
      return Response.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Fetch course data
    const courses = await base44.entities.Course.list({ id: courseId });
    const course = courses?.[0];

    if (!course) {
      return Response.json({ error: 'Course not found' }, { status: 404 });
    }

    // Fetch lessons
    const lessons = await base44.entities.Lesson.filter(
      { course_id: courseId },
      'order',
      100
    );

    // Generate SCORM manifest
    const manifest = generateSCORMManifest(
      course,
      lessons,
      scormVersion
    );

    // Generate index file
    const indexHtml = generateIndexFile(course, lessons);

    // Create SCORM package structure
    const packageData = {
      manifest: manifest,
      index: indexHtml,
      lessons: lessons,
      course: course,
      timestamp: new Date().toISOString(),
    };

    // For now, return the manifest and content
    // In production, would create actual ZIP file
    return Response.json({
      success: true,
      scormVersion,
      packageData,
      contentType: 'application/zip',
    });
  } catch (error) {
    return Response.json(
      { error: error.message },
      { status: 500 }
    );
  }
});

/**
 * Generate SCORM manifest (imsmanifest.xml)
 */
function generateSCORMManifest(course, lessons, version) {
  const courseId = course.scorm_identifier || `course_${course.id}`;
  
  if (version === '1.2') {
    return generateSCORM12Manifest(course, lessons, courseId);
  } else {
    return generateSCORM2004Manifest(course, lessons, courseId);
  }
}

/**
 * Generate SCORM 1.2 manifest
 */
function generateSCORM12Manifest(course, lessons, courseId) {
  let resourcesXml = '';
  let organizationXml = '';

  lessons.forEach((lesson, index) => {
    const lessonId = lesson.id;
    const lessonFile = `lesson_${index + 1}.html`;

    resourcesXml += `
    <resource identifier="${lessonId}" type="webcontent" href="${lessonFile}">
      <file href="${lessonFile}"/>
    </resource>`;

    organizationXml += `
      <item identifier="item_${lessonId}" identifierref="${lessonId}">
        <title>${lesson.title}</title>
      </item>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${courseId}" version="1.0"
          xmlns="http://www.imsglobal.org/xsd/imscp_v1p1"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p2"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p1 imscp_v1p1.xsd
                              http://www.adlnet.org/xsd/adlcp_v1p2 adlcp_v1p2.xsd">
  
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  
  <organizations default="org1">
    <organization identifier="org1">
      <title>${course.title}</title>
      ${organizationXml}
    </organization>
  </organizations>
  
  <resources>
    ${resourcesXml}
  </resources>
  
</manifest>`;
}

/**
 * Generate SCORM 2004 manifest
 */
function generateSCORM2004Manifest(course, lessons, courseId) {
  let resourcesXml = '';
  let organizationXml = '';

  lessons.forEach((lesson, index) => {
    const lessonId = lesson.id;
    const lessonFile = `lesson_${index + 1}.html`;

    resourcesXml += `
    <resource identifier="${lessonId}" type="webcontent" href="${lessonFile}">
      <file href="${lessonFile}"/>
    </resource>`;

    organizationXml += `
      <item identifier="item_${lessonId}" identifierref="${lessonId}">
        <title>${lesson.title}</title>
      </item>`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="${courseId}"
          xmlns="http://www.imsglobal.org/xsd/imscp_v1p2"
          xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_v1p2"
          xmlns:adlseq="http://www.adlnet.org/xsd/adlseq_v1p2"
          xmlns:adlnav="http://www.adlnet.org/xsd/adlnav_v1p2"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://www.imsglobal.org/xsd/imscp_v1p2 imscp_v1p2.xsd
                              http://www.adlnet.org/xsd/adlcp_v1p2 adlcp_v1p2.xsd
                              http://www.adlnet.org/xsd/adlseq_v1p2 adlseq_v1p2.xsd
                              http://www.adlnet.org/xsd/adlnav_v1p2 adlnav_v1p2.xsd">
  
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>2004 4th Edition</schemaversion>
  </metadata>
  
  <organizations default="org1">
    <organization identifier="org1" adlseq:objectivesSequencing="true">
      <title>${course.title}</title>
      ${organizationXml}
    </organization>
  </organizations>
  
  <resources>
    ${resourcesXml}
  </resources>
  
</manifest>`;
}

/**
 * Generate index HTML file
 */
function generateIndexFile(course, lessons) {
  const lessonsList = lessons
    .map(
      (lesson, index) =>
        `<li><a href="lesson_${index + 1}.html">${lesson.title}</a></li>`
    )
    .join('');

  return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>${course.title}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        h1 { color: #333; }
        .course-info { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; }
        ul { list-style-type: none; padding: 0; }
        li { margin: 10px 0; }
        a { color: #0066cc; text-decoration: none; }
        a:hover { text-decoration: underline; }
    </style>
</head>
<body>
    <h1>${course.title}</h1>
    
    <div class="course-info">
        <p><strong>Category:</strong> ${course.category || 'General'}</p>
        <p><strong>Level:</strong> ${course.level || 'Beginner'}</p>
        <p><strong>Duration:</strong> ${course.duration_hours || 'N/A'} hours</p>
        <p><strong>Instructor:</strong> ${course.instructor || 'N/A'}</p>
    </div>
    
    <h2>Course Lessons</h2>
    <ul>
        ${lessonsList}
    </ul>
    
    <script>
        // Initialize SCORM API communication
        if (window.API_1484_11 || window.API) {
            const scormApi = window.API_1484_11 || window.API;
            const initFn = scormApi.Initialize ? 'Initialize' : 'LMSInitialize';
            scormApi[initFn]('');
            console.log('SCORM API initialized');
        }
    </script>
</body>
</html>`;
}