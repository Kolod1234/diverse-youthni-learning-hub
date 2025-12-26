import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action, courseData, lessonData, classroomCourseId } = await req.json();

    // Get OAuth access token for Google Classroom
    const accessToken = await base44.asServiceRole.connectors.getAccessToken("googleclassroom");

    if (action === 'createCourse') {
      // Create a new Google Classroom course
      const response = await fetch('https://classroom.googleapis.com/v1/courses', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: courseData.name,
          section: courseData.section,
          descriptionHeading: courseData.descriptionHeading,
          ownerId: 'me',
          courseState: 'ACTIVE'
        })
      });

      const course = await response.json();
      
      if (!response.ok) {
        throw new Error(course.error?.message || 'Failed to create course');
      }

      return Response.json({ 
        success: true, 
        course,
        courseId: course.id 
      });
    }

    if (action === 'publishLesson') {
      // Publish a lesson as CourseWork Material
      const response = await fetch(
        `https://classroom.googleapis.com/v1/courses/${classroomCourseId}/courseWorkMaterials`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: lessonData.title,
            description: lessonData.description,
            materials: lessonData.materials,
            state: 'PUBLISHED'
          })
        }
      );

      const material = await response.json();
      
      if (!response.ok) {
        throw new Error(material.error?.message || 'Failed to publish lesson');
      }

      return Response.json({ 
        success: true, 
        material,
        materialId: material.id 
      });
    }

    if (action === 'listCourses') {
      // List all courses for the user
      const response = await fetch('https://classroom.googleapis.com/v1/courses?courseStates=ACTIVE', {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || 'Failed to list courses');
      }

      return Response.json({ 
        success: true, 
        courses: data.courses || [] 
      });
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    return Response.json({ 
      success: false,
      error: error.message 
    }, { status: 500 });
  }
});