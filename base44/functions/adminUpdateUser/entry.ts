import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { email, data, action } = await req.json();
    if (action === 'health') return Response.json({ ok: true });

    if (!email || !data) {
      return Response.json({ error: 'email and data are required' }, { status: 400 });
    }

    const users = await base44.asServiceRole.entities.User.filter({ email });
    if (users.length === 0) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    if (Object.prototype.hasOwnProperty.call(data, 'account_banned') && users[0].role === 'admin') {
      return Response.json({ error: 'Administrator accounts cannot be banned here' }, { status: 400 });
    }

    const updated = await base44.asServiceRole.entities.User.update(users[0].id, data);
    return Response.json({ user: updated });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});