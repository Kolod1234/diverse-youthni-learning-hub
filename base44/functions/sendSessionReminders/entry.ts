import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all upcoming sessions in the next 24 hours that haven't sent reminders
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const todayStr = now.toISOString().split('T')[0];
    const tomorrowStr = tomorrow.toISOString().split('T')[0];

    const sessions = await base44.asServiceRole.entities.VideoSession.filter({
      status: 'scheduled',
      reminder_sent: false
    });

    const upcomingSessions = sessions.filter(session => {
      const sessionDate = session.scheduled_date;
      return sessionDate === todayStr || sessionDate === tomorrowStr;
    });

    const reminders = [];

    for (const session of upcomingSessions) {
      const sessionDateTime = new Date(`${session.scheduled_date}T${session.scheduled_time}`);
      const hoursUntil = (sessionDateTime - now) / (1000 * 60 * 60);

      // Only send reminder if session is 1-24 hours away
      if (hoursUntil > 1 && hoursUntil <= 24) {
        // Get course details
        const courses = await base44.asServiceRole.entities.Course.filter({ id: session.course_id });
        const course = courses[0];

        // Send email to tutor
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: session.tutor_email,
            subject: `Reminder: Live Session Tomorrow - ${session.title}`,
            body: `
              <h2>Session Reminder</h2>
              <p>This is a reminder that you have an upcoming live session:</p>
              <ul>
                <li><strong>Session:</strong> ${session.title}</li>
                <li><strong>Course:</strong> ${course?.title || 'N/A'}</li>
                <li><strong>Date:</strong> ${session.scheduled_date}</li>
                <li><strong>Time:</strong> ${session.scheduled_time}</li>
                <li><strong>Duration:</strong> ${session.duration_minutes} minutes</li>
                <li><strong>Students:</strong> ${session.invited_students?.length || 0} invited</li>
              </ul>
              <p>${session.description || ''}</p>
              <p><a href="${Deno.env.get('BASE_URL') || 'https://yourdomain.com'}/VideoSession?id=${session.id}">Join Session</a></p>
            `
          });
        } catch (error) {
          console.error('Failed to send tutor reminder:', error);
        }

        // Send email to each student
        for (const studentEmail of session.invited_students || []) {
          try {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: studentEmail,
              subject: `Reminder: Upcoming Live Session - ${session.title}`,
              body: `
                <h2>Live Session Reminder</h2>
                <p>You have an upcoming live session with ${session.tutor_name}:</p>
                <ul>
                  <li><strong>Session:</strong> ${session.title}</li>
                  <li><strong>Course:</strong> ${course?.title || 'N/A'}</li>
                  <li><strong>Date:</strong> ${session.scheduled_date}</li>
                  <li><strong>Time:</strong> ${session.scheduled_time}</li>
                  <li><strong>Duration:</strong> ${session.duration_minutes} minutes</li>
                </ul>
                <p>${session.description || ''}</p>
                <p><a href="${Deno.env.get('BASE_URL') || 'https://yourdomain.com'}/VideoSession?id=${session.id}">Join Session</a></p>
              `
            });
          } catch (error) {
            console.error(`Failed to send reminder to ${studentEmail}:`, error);
          }
        }

        // Mark reminder as sent
        await base44.asServiceRole.entities.VideoSession.update(session.id, {
          reminder_sent: true
        });

        reminders.push({
          sessionId: session.id,
          title: session.title,
          recipientCount: (session.invited_students?.length || 0) + 1
        });
      }
    }

    return Response.json({ 
      success: true, 
      reminders_sent: reminders.length,
      reminders 
    });
  } catch (error) {
    console.error('Error sending reminders:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});