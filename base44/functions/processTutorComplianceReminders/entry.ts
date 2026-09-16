import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
export default async function(req: Request) {
  const base44 = createClientFromRequest(req);
  const payload = await req.json().catch(() => ({}));
  if (payload.action === 'health') return Response.json({ ok: true });
  const users = await base44.asServiceRole.entities.User.list('-created_date', 2000);
  const tutors = users.filter((user: any) => user.is_tutor === true && user.role !== 'admin');
  let notified = 0;
  for (const tutor of tutors) {
    let dueAt = tutor.tutor_compliance_due_at;
    if (!dueAt) dueAt = new Date(Date.now() + 7 * 86400000).toISOString();
    const dueTime = new Date(dueAt).getTime();
    const shouldNotify = dueTime - Date.now() <= 7 * 86400000 && tutor.tutor_compliance_notice_for_due !== dueAt;
    const updates: any = {};
    if (!tutor.tutor_compliance_due_at) updates.tutor_compliance_due_at = dueAt;
    if (shouldNotify) {
      await base44.asServiceRole.entities.Notification.create({ recipient_email: tutor.email, title: 'Tutor compliance form due', message: 'Complete the safeguarding and online safety compliance form within 7 days. Access is restricted after the deadline.', type: 'general', action_url: '/TutorDashboardOverview', sent_by: 'system' });
      await base44.asServiceRole.integrations.Core.SendEmail({ to: tutor.email, subject: 'Tutor compliance form due', body: 'Your three-monthly safeguarding and online safety compliance form is due. Please complete it within 7 days to keep access to Diverse Youth NI.', from_name: 'Diverse Youth NI' });
      updates.tutor_compliance_notice_for_due = dueAt;
      notified++;
    }
    if (Object.keys(updates).length) await base44.asServiceRole.entities.User.update(tutor.id, updates);
  }
  return Response.json({ processed: tutors.length, notified });
}