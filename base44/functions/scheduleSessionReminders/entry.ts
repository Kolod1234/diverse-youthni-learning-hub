import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { sessionId, reminderTimings } = await req.json();

    // Get session details
    const sessions = await base44.asServiceRole.entities.VideoSession.filter({ id: sessionId });
    const session = sessions[0];

    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const sessionDateTime = new Date(`${session.scheduled_date}T${session.scheduled_time}`);
    const reminders = [];

    // Default reminder timings if not provided: 24 hours, 1 hour before
    const timings = reminderTimings || [24 * 60, 60]; // in minutes

    for (const minutesBefore of timings) {
      const reminderTime = new Date(sessionDateTime.getTime() - minutesBefore * 60 * 1000);

      // Only schedule if reminder time is in the future
      if (reminderTime > new Date()) {
        // Create reminder for tutor
        await base44.asServiceRole.entities.SessionReminder.create({
          session_id: session.id,
          recipient_email: session.tutor_email,
          reminder_type: 'both',
          scheduled_time: reminderTime.toISOString()
        });

        // Create reminders for students
        for (const studentEmail of session.invited_students || []) {
          await base44.asServiceRole.entities.SessionReminder.create({
            session_id: session.id,
            recipient_email: studentEmail,
            reminder_type: 'both',
            scheduled_time: reminderTime.toISOString()
          });
        }

        reminders.push({
          timing: `${minutesBefore} minutes before`,
          scheduledFor: reminderTime.toISOString(),
          recipientCount: (session.invited_students?.length || 0) + 1
        });
      }
    }

    return Response.json({ 
      success: true, 
      reminders_scheduled: reminders.length,
      reminders 
    });
  } catch (error) {
    console.error('Error scheduling reminders:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});