import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { academyId } = await req.json();

    if (!academyId) {
      return Response.json({ error: 'Missing academyId' }, { status: 400 });
    }

    // Get academy and enrollment
    const academy = await base44.entities.Academy.get(academyId);
    const enrollments = await base44.entities.AcademyEnrollment.filter({ 
      academy_id: academyId,
      student_email: user.email 
    });

    if (!enrollments || enrollments.length === 0) {
      return Response.json({ 
        eligible: false, 
        message: 'Not enrolled in this academy' 
      });
    }

    const enrollment = enrollments[0];

    // Get all course enrollments for courses in academy
    const allCourseIds = [];
    academy.program_structure?.forEach(module => {
      if (module.course_ids) {
        allCourseIds.push(...module.course_ids);
      }
    });

    const courseEnrollments = await base44.entities.Enrollment.filter({
      created_by: user.email
    });

    const completedCourses = courseEnrollments
      .filter(e => allCourseIds.includes(e.course_id) && e.is_completed)
      .map(e => e.course_id);

    // Calculate progress
    const totalCourses = allCourseIds.length;
    const completedCount = completedCourses.length;
    const progressPercent = totalCourses > 0 ? Math.round((completedCount / totalCourses) * 100) : 0;

    // Get quiz scores
    const quizAttempts = await base44.entities.QuizAttempt.filter({
      created_by: user.email
    });
    
    const relevantAttempts = quizAttempts.filter(a => allCourseIds.includes(a.course_id));
    const avgScore = relevantAttempts.length > 0
      ? Math.round(relevantAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / relevantAttempts.length)
      : 0;

    // Update enrollment
    await base44.entities.AcademyEnrollment.update(enrollment.id, {
      completed_courses: completedCourses,
      overall_progress: progressPercent,
      average_score: avgScore
    });

    // Check certification eligibility
    const requirements = academy.certification_requirements || {};
    const minCompletion = requirements.minimum_completion || 80;
    const minScore = requirements.minimum_score || 70;

    const eligible = progressPercent >= minCompletion && avgScore >= minScore;

    return Response.json({
      success: true,
      eligible,
      progress: {
        completedCourses: completedCount,
        totalCourses,
        progressPercent,
        averageScore: avgScore
      },
      requirements: {
        minCompletion,
        minScore
      },
      message: eligible 
        ? 'Eligible for certification!' 
        : `Need ${minCompletion}% completion (${progressPercent}%) and ${minScore}% score (${avgScore}%)`
    });

  } catch (error) {
    console.error('Failed to validate completion:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});