import { createClientFromRequest } from "npm:@base44/sdk@0.8.44";

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const now = new Date();
    const deadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const sessions = await base44.asServiceRole.entities.GroupStudySession.filter({
      status: "scheduled",
      scheduled_time: { $gt: now.toISOString(), $lte: deadline.toISOString() }
    }, "scheduled_time", 100);
    let sent = 0;

    for (const session of sessions) {
      const members = await base44.asServiceRole.entities.StudyGroupMember.filter({ group_id: session.group_id, status: "active" });
      const recipients = [...new Set([session.organizer_email, ...members.map((member) => member.member_email)].filter(Boolean))];
      const alreadySent = new Set(session.email_reminder_recipients || []);
      const successful = [];
      for (const email of recipients.filter((recipient) => !alreadySent.has(recipient))) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: email,
            subject: `Reminder: ${session.title} is coming up`,
            text: `Your group study session “${session.title}” starts at ${new Date(session.scheduled_time).toUTCString()}. This is your 24-hour reminder.${session.description ? `\n\n${session.description}` : ""}`
          });
          successful.push(email);
          sent += 1;
        } catch (_) {}
      }
      const updatedRecipients = [...new Set([...(session.email_reminder_recipients || []), ...successful])];
      if (successful.length || (recipients.length > 0 && recipients.every((email) => updatedRecipients.includes(email)))) {
        await base44.asServiceRole.entities.GroupStudySession.update(session.id, {
          email_reminder_recipients: updatedRecipients,
          ...(recipients.every((email) => updatedRecipients.includes(email)) ? { email_reminder_sent_at: new Date().toISOString() } : {})
        });
      }
    }
    return Response.json({ sessionsChecked: sessions.length, remindersSent: sent });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}