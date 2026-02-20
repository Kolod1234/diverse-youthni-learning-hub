import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { academyEnrollmentId } = await req.json();

    if (!academyEnrollmentId) {
      return Response.json({ error: 'Missing academyEnrollmentId' }, { status: 400 });
    }

    // Get enrollment and academy
    const enrollment = await base44.entities.AcademyEnrollment.get(academyEnrollmentId);
    const academy = await base44.entities.Academy.get(enrollment.academy_id);

    // Validate certification requirements
    const requirements = academy.certification_requirements || {};
    const minCompletion = requirements.minimum_completion || 80;
    const minScore = requirements.minimum_score || 70;

    if (enrollment.overall_progress < minCompletion) {
      return Response.json({ 
        error: 'Requirements not met', 
        message: `Need ${minCompletion}% completion, currently at ${enrollment.overall_progress}%` 
      }, { status: 400 });
    }

    if (enrollment.average_score < minScore) {
      return Response.json({ 
        error: 'Requirements not met', 
        message: `Need ${minScore}% average score, currently at ${enrollment.average_score}%` 
      }, { status: 400 });
    }

    // Generate certificate number
    const certificateNumber = `ACAD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create certificate record
    const certificate = await base44.entities.Certificate.create({
      course_id: enrollment.academy_id,
      enrollment_id: academyEnrollmentId,
      certificate_number: certificateNumber,
      issue_date: new Date().toISOString().split('T')[0],
      student_name: enrollment.student_name || user.full_name,
      course_title: academy.title,
      instructor_name: academy.instructor_name,
      final_score: enrollment.average_score
    });

    // Update enrollment
    await base44.entities.AcademyEnrollment.update(academyEnrollmentId, {
      is_certified: true,
      certificate_id: certificate.id,
      certification_date: new Date().toISOString().split('T')[0]
    });

    // Update academy completion count
    await base44.entities.Academy.update(enrollment.academy_id, {
      completion_count: (academy.completion_count || 0) + 1
    });

    return Response.json({
      success: true,
      certificate,
      message: 'Certificate generated successfully!'
    });

  } catch (error) {
    console.error('Failed to generate certificate:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});