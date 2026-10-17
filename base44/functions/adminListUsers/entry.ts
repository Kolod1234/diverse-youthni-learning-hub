import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Lists users for staff pages. Replaces browser calls to base44.asServiceRole.entities.User.list/filter,
// which always fail in the browser because the client has no service token.
// Admins get full records; tutors and coordinators get only the fields their pages display.
const STAFF_FIELDS = [
  'id', 'email', 'full_name', 'role', 'avatar', 'is_tutor', 'is_coordinator', 'coordinator_banned',
  'account_banned', 'youth_work_blocked', 'assigned_coordinator_email', 'created_date',
];
const FILTERABLE = ['email', 'assigned_coordinator_email', 'is_coordinator', 'is_tutor', 'role'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = user.role === 'admin';
    const isCoordinator = user.is_coordinator === true && !user.coordinator_banned;
    const isTutor = user.is_tutor === true;
    if (!isAdmin && !isCoordinator && !isTutor) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const sort = typeof body.sort === 'string' ? body.sort : '-created_date';
    const limit = Math.min(Math.max(Number(body.limit) || 500, 1), 1000);
    const filter = Object.fromEntries(
      Object.entries(body.filter || {}).filter(([k]) => FILTERABLE.includes(k)),
    );

    const users = Object.keys(filter).length
      ? await base44.asServiceRole.entities.User.filter(filter, sort, limit)
      : await base44.asServiceRole.entities.User.list(sort, limit);

    const result = isAdmin
      ? users
      : users.map((u) => Object.fromEntries(STAFF_FIELDS.filter((f) => f in u).map((f) => [f, u[f]])));
    return Response.json({ users: result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
