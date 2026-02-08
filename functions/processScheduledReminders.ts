import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    // This function is called by a scheduled automation
    const base44 = createClientFromRequest(req);

    // Get all active reminders with scheduling enabled
    const allReminders = await base44.asServiceRole.entities.ReminderConfig.list();
    const scheduledReminders = allReminders.filter(r => 
      r.is_active && 
      r.is_scheduled_active && 
      (r.schedule_type === 'once' || r.schedule_type === 'continuous')
    );

    const now = new Date();
    const results = [];

    for (const reminder of scheduledReminders) {
      if (!reminder.scheduled_date || !reminder.scheduled_time) continue;

      // Parse scheduled time
      const [hours, minutes] = reminder.scheduled_time.split(':');
      const scheduledDateTime = new Date(reminder.scheduled_date);
      scheduledDateTime.setHours(parseInt(hours), parseInt(minutes), 0);

      // Check if it's time to send
      let shouldSend = false;

      if (reminder.schedule_type === 'once') {
        // Send if current time is past scheduled time and hasn't been sent
        shouldSend = now >= scheduledDateTime && (!reminder.last_sent_date || new Date(reminder.last_sent_date).toDateString() !== now.toDateString());
      } else if (reminder.schedule_type === 'continuous') {
        // Check if we should send based on interval
        const repeatInterval = reminder.repeat_interval || 1;
        
        // Check if end date has passed
        if (reminder.repeat_end_date && new Date() > new Date(reminder.repeat_end_date)) {
          shouldSend = false;
        } else if (!reminder.last_sent_date) {
          // Never sent before, check if it's time
          shouldSend = now >= scheduledDateTime;
        } else {
          // Check if enough days have passed
          const lastSent = new Date(reminder.last_sent_date);
          const daysPassed = Math.floor((now - lastSent) / (1000 * 60 * 60 * 24));
          shouldSend = daysPassed >= repeatInterval && now.getHours() >= parseInt(hours);
        }
      }

      if (shouldSend) {
        // Get students to send to
        let studentsToNotify = [];

        if (reminder.target_audience === 'all_students') {
          const allUsers = await base44.asServiceRole.entities.User.list();
          studentsToNotify = allUsers.filter(u => u.role === 'user').map(u => u.email);
        } else if (reminder.target_audience === 'specific_course' && reminder.course_id) {
          const enrollments = await base44.asServiceRole.entities.Enrollment.filter({
            course_id: reminder.course_id
          });
          const userEmails = new Set(enrollments.map(e => e.created_by));
          studentsToNotify = Array.from(userEmails);
        } else if (reminder.target_audience === 'specific_group' && reminder.group_id) {
          const members = await base44.asServiceRole.entities.StudyGroupMember.filter({
            group_id: reminder.group_id,
            status: 'active'
          });
          studentsToNotify = members.map(m => m.member_email);
        }

        // Send emails
        let sentCount = 0;
        for (const email of studentsToNotify) {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: email,
            subject: reminder.subject,
            body: reminder.message
          });
          sentCount++;
        }

        // Update reminder
        if (sentCount > 0) {
          await base44.asServiceRole.entities.ReminderConfig.update(reminder.id, {
            sent_count: (reminder.sent_count || 0) + sentCount,
            last_sent_date: new Date().toISOString()
          });
        }

        results.push({
          reminderId: reminder.id,
          title: reminder.title,
          sent: sentCount
        });
      }
    }

    return Response.json({
      success: true,
      processed: results.length,
      results: results
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});