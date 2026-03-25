import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

/**
 * Calculate aggregated metrics for lessons
 * Should be run daily via scheduled automation
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden: Admin access required' }),
        { status: 403 }
      );
    }

    // Get all courses
    const courses = await base44.asServiceRole.entities.Course.list();
    let totalMetricsUpdated = 0;

    for (const course of courses) {
      // Get all lessons in course
      const lessons = await base44.asServiceRole.entities.Lesson.filter({
        course_id: course.id,
      }, '', 1000);

      for (const lesson of lessons) {
        // Get all progress records for this lesson
        const progressData = await base44.asServiceRole.entities.LessonProgress.filter({
          lesson_id: lesson.id,
          course_id: course.id,
        }, '', 1000);

        // Get all quiz performance for this lesson
        const quizPerformance = await base44.asServiceRole.entities.QuizPerformance.filter({
          lesson_id: lesson.id,
          course_id: course.id,
        }, '', 1000);

        if (progressData.length === 0) continue;

        // Calculate metrics
        const totalAttempts = progressData.length;
        const completedCount = progressData.filter(
          p => p.completion_status === 'completed'
        ).length;
        const completionRate = Math.round((completedCount / totalAttempts) * 100);
        const dropOffRate = 100 - completionRate;

        const totalTimeSeconds = progressData.reduce(
          (sum, p) => sum + (p.time_spent_seconds || 0),
          0
        );
        const averageTimeSpent = Math.round(totalTimeSeconds / totalAttempts);

        const totalEngagementScore = progressData.reduce(
          (sum, p) => sum + (p.engagement_score || 0),
          0
        );
        const averageEngagementScore = Math.round(
          totalEngagementScore / totalAttempts
        );

        const slideCounts = progressData.map(p => p.total_slides_viewed || 0);
        const averageSlidesViewed = Math.round(
          slideCounts.reduce((a, b) => a + b, 0) / slideCounts.length
        );

        // Calculate quiz metrics if available
        let averageQuizScore = 0;
        let quizPassRate = 0;

        if (quizPerformance.length > 0) {
          const totalScore = quizPerformance.reduce(
            (sum, q) => sum + (q.score_percentage || 0),
            0
          );
          averageQuizScore = Math.round(totalScore / quizPerformance.length);

          const passedCount = quizPerformance.filter(q => q.passed).length;
          quizPassRate = Math.round((passedCount / quizPerformance.length) * 100);
        }

        // Determine trend (simple: check if improving vs last period)
        let trend = 'stable';
        if (completionRate > 70) trend = 'improving';
        if (completionRate < 40) trend = 'declining';

        // Check if metrics record exists
        const existingMetrics = await base44.asServiceRole.entities.LessonMetrics.filter({
          lesson_id: lesson.id,
          course_id: course.id,
        });

        const metricsData = {
          course_id: course.id,
          lesson_id: lesson.id,
          total_attempts: totalAttempts,
          total_completions: completedCount,
          completion_rate: completionRate,
          drop_off_rate: dropOffRate,
          average_time_spent_seconds: averageTimeSpent,
          average_engagement_score: averageEngagementScore,
          average_slides_viewed: averageSlidesViewed,
          average_quiz_score: averageQuizScore,
          quiz_pass_rate: quizPassRate,
          last_updated: new Date().toISOString(),
          trend,
        };

        if (existingMetrics.length > 0) {
          // Update existing
          await base44.asServiceRole.entities.LessonMetrics.update(
            existingMetrics[0].id,
            metricsData
          );
        } else {
          // Create new
          await base44.asServiceRole.entities.LessonMetrics.create(metricsData);
        }

        totalMetricsUpdated += 1;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Updated metrics for ${totalMetricsUpdated} lessons`,
        metricsUpdated: totalMetricsUpdated,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error('Error calculating lesson metrics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500 }
    );
  }
});