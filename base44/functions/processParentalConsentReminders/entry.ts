import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { consentEmail } from '../../shared/parentalConsent.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const pending = await base44.asServiceRole.entities.StudentVerification.filter({ status: 'pending' }, 'deadline_at', 500);
    const now = Date.now();
    let sent = 0;
    let expired = 0;
    for (const record of pending) {
      if (new Date(record.deadline_at).getTime() <= now) {
        await base44.asServiceRole.entities.StudentVerification.update(record.id, { status: 'expired' });
        expired += 1;
        continue;
      }
      const lastContact = new Date(record.last_reminder_at || record.created_date).getTime();
      if (now - lastContact < 20 * 60 * 60 * 1000) continue;
      const mail = consentEmail(record, true);
      await base44.asServiceRole.integrations.Core.SendEmail({ to: record.parent_email, subject: mail.subject, html: mail.html, text: mail.text, from_name: 'Diverse Youth NI' });
      await base44.asServiceRole.entities.StudentVerification.update(record.id, { last_reminder_at: new Date(now).toISOString(), reminder_count: (record.reminder_count || 0) + 1 });
      sent += 1;
    }
    return Response.json({ success: true, checked: pending.length, sent, expired });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}