import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';
import { addDays, isBefore, isAfter, startOfDay } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This should be called by a scheduled task/cron
    // For now, admins can trigger it manually

    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all quizzes with time limits
    const quizzes = await base44.asServiceRole.entities.Quiz.filter({ 
      is_published: true 
    });

    // Get all enrollments
    const enrollments = await base44.asServiceRole.entities.Enrollment.list();

    const notifications = [];
    const now = new Date();

    for (const quiz of quizzes) {
      if (!quiz.time_limit_minutes) continue;

      // Get students enrolled in this course
      const courseEnrollments = enrollments.filter(e => e.course_id === quiz.course_id);

      for (const enrollment of courseEnrollments) {
        // Check if student has already attempted this quiz
        const attempts = await base44.asServiceRole.entities.QuizAttempt.filter({
          quiz_id: quiz.id,
          created_by: enrollment.created_by
        });

        if (attempts.length > 0) continue; // Already attempted

        // Send reminder (you can customize the logic here)
        try {
          await base44.asServiceRole.functions.invoke('sendNotification', {
            recipient_email: enrollment.created_by,
            title: 'Quiz Reminder',
            message: `Don't forget to complete the quiz "${quiz.title}" for your course. Time limit: ${quiz.time_limit_minutes} minutes.`,
            type: 'quiz',
            link: `/quiz?id=${quiz.id}`,
            send_email: true,
          });
          notifications.push({ quiz: quiz.title, user: enrollment.created_by });
        } catch (err) {
          console.error('Failed to send notification:', err);
        }
      }
    }

    return Response.json({ 
      success: true, 
      sent: notifications.length,
      notifications 
    });

  } catch (error) {
    console.error('Quiz reminder error:', error);
    return Response.json({ 
      error: error.message || 'Failed to send reminders' 
    }, { status: 500 });
  }
});