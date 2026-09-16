import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
const OFFICE_EMAIL = 'info@diverseyouthni.com';
const addMonths = (date: Date, months: number) => { const next = new Date(date); next.setUTCMonth(next.getUTCMonth() + months); return next; };
export default async function(req: Request) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    if (body.action === 'health') return Response.json({ ok: true });
    const isTutor = user.is_tutor === true;
    if (!isTutor || user.role === 'admin') return Response.json({ applicable: false });
    if (body.action === 'safeguarding_request') {
      await base44.asServiceRole.entities.Message.create({ sender_email: user.email, sender_name: user.full_name || 'Tutor', recipient_email: OFFICE_EMAIL, content: 'Please send me the current safeguarding reporting procedure and online safety regulations.', message_type: 'text' });
      return Response.json({ sent: true });
    }
    if (body.action === 'submit') {
      if (!body.safeguarding_understood || !body.online_safety_understood || !body.declaration) return Response.json({ error: 'Please confirm all required safeguarding declarations.' }, { status: 400 });
      if (body.has_issues && !body.issues_details?.trim()) return Response.json({ error: 'Please describe the issue, risk or challenge.' }, { status: 400 });
      if (!body.happy_with_subjects && !body.course_change_request?.trim()) return Response.json({ error: 'Please describe the course change you are requesting.' }, { status: 400 });
      const completedAt = new Date();
      const nextDue = addMonths(completedAt, 3);
      const record = await base44.asServiceRole.entities.TutorComplianceRecord.create({ tutor_user_id: user.id, tutor_email: user.email, completed_at: completedAt.toISOString(), next_due_at: nextDue.toISOString(), safeguarding_understood: true, online_safety_understood: true, has_issues: !!body.has_issues, issues_details: body.issues_details?.trim() || '', happy_with_subjects: !!body.happy_with_subjects, course_change_request: body.course_change_request?.trim() || '', declaration: true });
      await base44.auth.updateMe({ tutor_compliance_last_completed_at: completedAt.toISOString(), tutor_compliance_due_at: nextDue.toISOString() });
      if (body.has_issues || !body.happy_with_subjects) await base44.asServiceRole.entities.Message.create({ sender_email: user.email, sender_name: user.full_name || 'Tutor', recipient_email: OFFICE_EMAIL, content: `Tutor compliance follow-up required. Issues: ${body.issues_details?.trim() || 'None reported'}. Course change request: ${body.course_change_request?.trim() || 'None'}.`, message_type: 'text' });
      return Response.json({ record, next_due_at: nextDue.toISOString() });
    }
    let dueAt = user.tutor_compliance_due_at;
    if (!dueAt) {
      dueAt = new Date(Date.now() + 7 * 86400000).toISOString();
      await base44.auth.updateMe({ tutor_compliance_due_at: dueAt });
      await base44.asServiceRole.entities.Notification.create({ recipient_email: user.email, title: 'Tutor compliance form due', message: 'Complete your safeguarding and online safety compliance form within 7 days.', type: 'general', action_url: '/TutorDashboardOverview', sent_by: 'system' });
    }
    const milliseconds = new Date(dueAt).getTime() - Date.now();
    return Response.json({ applicable: true, due_at: dueAt, overdue: milliseconds < 0, days_remaining: Math.max(0, Math.ceil(milliseconds / 86400000)) });
  } catch (error) { return Response.json({ error: error.message }, { status: 500 }); }
}