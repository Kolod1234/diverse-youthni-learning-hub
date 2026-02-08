import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || (user.role !== 'admin' && !user.is_tutor)) {
      return Response.json({ error: 'Forbidden: Only admins and teachers can send reminders' }, { status: 403 });
    }

    const { reminderId } = await req.json();

    if (!reminderId) {
      return Response.json({ error: 'reminderId is required' }, { status: 400 });
    }

    // Fetch reminder config
    const reminder = await base44.asServiceRole.entities.ReminderConfig.get(reminderId);
    if (!reminder) {
      return Response.json({ error: 'Reminder not found' }, { status: 404 });
    }

    // Get students to send to
    let studentsToNotify = [];

    if (reminder.target_audience === 'all_students') {
      // Get all users with role 'user' (students)
      const allUsers = await base44.asServiceRole.entities.User.list();
      studentsToNotify = allUsers.filter(u => u.role === 'user').map(u => u.email);
    } else if (reminder.target_audience === 'specific_course' && reminder.course_id) {
      // Get students enrolled in specific course
      const enrollments = await base44.asServiceRole.entities.Enrollment.filter({
        course_id: reminder.course_id
      });
      const userEmails = new Set(enrollments.map(e => e.created_by));
      studentsToNotify = Array.from(userEmails);
    } else if (reminder.target_audience === 'specific_group' && reminder.group_id) {
      // Get members of specific study group
      const members = await base44.asServiceRole.entities.StudyGroupMember.filter({
        group_id: reminder.group_id,
        status: 'active'
      });
      studentsToNotify = members.map(m => m.member_email);
    }

    // Send emails
    let sentCount = 0;
    const failedEmails = [];

    for (const email of studentsToNotify) {
      const result = await base44.asServiceRole.integrations.Core.SendEmail({
        to: email,
        subject: reminder.subject,
        body: reminder.message
      });

      if (result.success !== false) {
        sentCount++;
      } else {
        failedEmails.push(email);
      }
    }

    // Update reminder with sent count and last sent date
    await base44.asServiceRole.entities.ReminderConfig.update(reminderId, {
      sent_count: (reminder.sent_count || 0) + sentCount,
      last_sent_date: new Date().toISOString()
    });

    return Response.json({
      success: true,
      sent: sentCount,
      failed: failedEmails.length,
      failedEmails: failedEmails,
      message: `Reminder sent to ${sentCount} student(s)`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});