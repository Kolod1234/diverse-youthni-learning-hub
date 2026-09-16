import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });
    const body = await req.json();
    if (body.action === 'decide') {
      const requests = await base44.asServiceRole.entities.ParentChildLink.filter({ id: body.request_id }, '-created_date', 1);
      const request = requests[0];
      if (!request || request.status !== 'pending') return Response.json({ error: 'Pending request not found' }, { status: 404 });
      if (body.decision === 'approved') {
        const children = await base44.asServiceRole.entities.User.filter({ id: body.child_user_id }, '-created_date', 1);
        const child = children[0];
        if (!child) return Response.json({ error: 'Select a valid learner account' }, { status: 400 });
        await base44.asServiceRole.entities.ParentChildLink.update(request.id, { status: 'approved', child_user_id: child.id, child_email: child.email, child_name: child.full_name || request.child_name, processed_by: user.email, processed_at: new Date().toISOString() });
      } else {
        await base44.asServiceRole.entities.ParentChildLink.update(request.id, { status: 'rejected', verification_note: body.note || request.verification_note || '', processed_by: user.email, processed_at: new Date().toISOString() });
      }
      await base44.asServiceRole.entities.Notification.create({ recipient_email: request.parent_email, title: `Child link ${body.decision}`, message: body.decision === 'approved' ? `Access to ${request.child_name}'s learning report is now available.` : 'Your parent-child link request could not be approved. Please contact the safeguarding team.', type: 'general', action_url: '/parent-dashboard', sent_by: user.email });
    }
    const [requests, users] = await Promise.all([
      base44.asServiceRole.entities.ParentChildLink.list('-created_date', 500),
      base44.asServiceRole.entities.User.list('-created_date', 1000)
    ]);
    return Response.json({ requests, learners: users.filter((item) => item.role !== 'admin' && !item.is_tutor && item.account_type !== 'parent').map((item) => ({ id: item.id, email: item.email, name: item.full_name || item.email })) });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}