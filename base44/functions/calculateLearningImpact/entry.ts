import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && !user.is_tutor)) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { entityType, entityId, startDate, endDate } = await req.json();

    const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const end = endDate || new Date().toISOString().split('T')[0];

    let metrics = {};

    if (entityType === 'academy') {
      // Academy-specific metrics
      const academy = await base44.entities.Academy.get(entityId);
      const enrollments = await base44.entities.AcademyEnrollment.filter({ academy_id: entityId });
      
      const completedEnrollments = enrollments.filter(e => e.is_certified);
      const totalTimeSpent = enrollments.reduce((sum, e) => sum + (e.time_spent_hours || 0), 0);
      const avgScore = enrollments.length > 0 
        ? enrollments.reduce((sum, e) => sum + (e.average_score || 0), 0) / enrollments.length 
        : 0;

      metrics = {
        totalEnrolled: academy.enrolled_count || 0,
        totalCompleted: completedEnrollments.length,
        completionRate: academy.enrolled_count > 0 
          ? Math.round((completedEnrollments.length / academy.enrolled_count) * 100) 
          : 0,
        averageScore: Math.round(avgScore),
        totalTimeSpent: Math.round(totalTimeSpent),
        averageTimePerStudent: enrollments.length > 0 
          ? Math.round(totalTimeSpent / enrollments.length) 
          : 0,
        certificationRate: academy.enrolled_count > 0 
          ? Math.round((completedEnrollments.length / academy.enrolled_count) * 100) 
          : 0
      };

      // Store metric
      await base44.entities.LearningImpactMetric.create({
        metric_type: 'academy_completion',
        entity_id: entityId,
        entity_type: 'academy',
        period_start: start,
        period_end: end,
        value: metrics.completionRate,
        value_type: 'percentage',
        metadata: metrics
      });

    } else if (entityType === 'organization') {
      // Organization-wide metrics
      const allAcademies = await base44.entities.Academy.list();
      const allEnrollments = await base44.entities.AcademyEnrollment.list();
      const allCourseEnrollments = await base44.entities.Enrollment.list();

      const totalStudents = new Set(allEnrollments.map(e => e.student_email)).size;
      const certifiedStudents = allEnrollments.filter(e => e.is_certified).length;
      const totalCourses = allCourseEnrollments.length;
      const completedCourses = allCourseEnrollments.filter(e => e.is_completed).length;

      metrics = {
        totalAcademies: allAcademies.length,
        publishedAcademies: allAcademies.filter(a => a.is_published).length,
        totalStudents,
        certifiedStudents,
        overallCertificationRate: totalStudents > 0 
          ? Math.round((certifiedStudents / totalStudents) * 100) 
          : 0,
        totalCourseEnrollments: totalCourses,
        completedCourses,
        courseCompletionRate: totalCourses > 0 
          ? Math.round((completedCourses / totalCourses) * 100) 
          : 0
      };

      // Store metric
      await base44.entities.LearningImpactMetric.create({
        metric_type: 'roi',
        entity_id: 'organization',
        entity_type: 'organization',
        period_start: start,
        period_end: end,
        value: metrics.overallCertificationRate,
        value_type: 'percentage',
        metadata: metrics
      });
    }

    return Response.json({
      success: true,
      metrics,
      period: { start, end }
    });

  } catch (error) {
    console.error('Failed to calculate impact:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});