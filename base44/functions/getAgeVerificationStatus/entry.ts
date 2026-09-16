import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role === 'admin' || user.is_tutor || user.is_coordinator) return Response.json({ status: 'not_required' });
    const records = await base44.asServiceRole.entities.StudentVerification.filter({ student_user_id: user.id }, '-created_date', 1);
    const record = records[0];
    if (!record) return Response.json({ status: 'not_started' });
    if (record.status === 'pending' && new Date(record.deadline_at).getTime() <= Date.now()) {
      await base44.asServiceRole.entities.StudentVerification.update(record.id, { status: 'expired' });
      return Response.json({ status: 'expired', deadline_at: record.deadline_at, reminder_count: record.reminder_count || 0 });
    }
    return Response.json({ status: record.status, deadline_at: record.deadline_at || null, reminder_count: record.reminder_count || 0 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}