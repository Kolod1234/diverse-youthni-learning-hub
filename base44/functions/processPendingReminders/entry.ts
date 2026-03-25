import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all pending reminders that should be sent now
    const now = new Date();
    const reminders = await base44.asServiceRole.entities.SessionReminder.filter({
      is_sent: false
    });

    const dueReminders = reminders.filter(reminder => {
      const scheduledTime = new Date(reminder.scheduled_time);
      return scheduledTime <= now;
    });

    const processed = [];

    for (const reminder of dueReminders) {
      try {
        // Get session details
        const sessions = await base44.asServiceRole.entities.VideoSession.filter({ 
          id: reminder.session_id 
        });
        const session = sessions[0];

        if (!session || session.status === 'cancelled') {
          // Mark as sent to skip cancelled sessions
          await base44.asServiceRole.entities.SessionReminder.update(reminder.id, {
            is_sent: true,
            sent_at: now.toISOString()
          });
          continue;
        }

        // Get course details
        const courses = await base44.asServiceRole.entities.Course.filter({ 
          id: session.course_id 
        });
        const course = courses[0];

        const sessionDateTime = new Date(`${session.scheduled_date}T${session.scheduled_time}`);
        const hoursUntil = Math.round((sessionDateTime - now) / (1000 * 60 * 60));

        // Send email if needed
        if (reminder.reminder_type === 'email' || reminder.reminder_type === 'both') {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: reminder.recipient_email,
            subject: `Reminder: ${session.title} ${hoursUntil > 0 ? `in ${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''}` : 'starting soon'}`,
            body: `
              <h2>Session Reminder</h2>
              <p>Your live session is coming up!</p>
              <ul>
                <li><strong>Session:</strong> ${session.title}</li>
                <li><strong>Course:</strong> ${course?.title || 'N/A'}</li>
                <li><strong>Date:</strong> ${session.scheduled_date}</li>
                <li><strong>Time:</strong> ${session.scheduled_time}</li>
                <li><strong>Duration:</strong> ${session.duration_minutes} minutes</li>
              </ul>
              ${session.description ? `<p>${session.description}</p>` : ''}
              <p><a href="${Deno.env.get('BASE_URL') || 'https://yourdomain.com'}/VideoSession?id=${session.id}" style="display: inline-block; padding: 12px 24px; background-color: #7C3AED; color: white; text-decoration: none; border-radius: 6px; margin-top: 16px;">Join Session</a></p>
            `
          });
        }

        // Create in-app notification if needed
        if (reminder.reminder_type === 'in_app' || reminder.reminder_type === 'both') {
          await base44.asServiceRole.entities.Notification.create({
            recipient_email: reminder.recipient_email,
            title: `Session Reminder: ${session.title}`,
            message: `Your live session "${session.title}" ${hoursUntil > 0 ? `starts in ${hoursUntil} hour${hoursUntil !== 1 ? 's' : ''}` : 'is starting soon'}. Don't forget to join!`,
            type: 'session_reminder',
            action_url: `/VideoSession?id=${session.id}`,
            session_id: session.id
          });
        }

        // Mark reminder as sent
        await base44.asServiceRole.entities.SessionReminder.update(reminder.id, {
          is_sent: true,
          sent_at: now.toISOString()
        });

        processed.push({
          reminderId: reminder.id,
          sessionId: session.id,
          recipient: reminder.recipient_email
        });
      } catch (error) {
        console.error(`Failed to process reminder ${reminder.id}:`, error);
      }
    }

    return Response.json({ 
      success: true, 
      processed_count: processed.length,
      processed 
    });
  } catch (error) {
    console.error('Error processing reminders:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});