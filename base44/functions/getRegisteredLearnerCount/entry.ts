import { createClientFromRequest } from 'npm:@base44/sdk';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let caller;
  try {
    caller = await base44.auth.me();
  } catch {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!caller || caller.disabled) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Count registered learner accounts, not enrolments or recent activity.
    // Keep account records on the server; expose only the aggregate.
    const learnerIds = new Set();
    const pageSize = 500;
    const fields = ['id', 'role', 'is_tutor', 'is_coordinator', 'is_service', 'disabled', 'is_sample'];
    for (let skip = 0; ; skip += pageSize) {
      const users = await base44.asServiceRole.entities.User.list('id', pageSize, skip, fields);
      if (!Array.isArray(users)) throw new Error('Invalid user response');
      for (const account of users) {
        if (account.id && account.role === 'user' &&
            !account.is_tutor && !account.is_coordinator &&
            !account.is_service && !account.disabled && !account.is_sample) {
          learnerIds.add(account.id);
        }
      }
      if (users.length < pageSize) break;
    }
    return Response.json(
      { count: learnerIds.size },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    // Never return zero or enrolment totals when the account query fails.
    return Response.json({ error: 'Learner count unavailable' }, { status: 503 });
  }
});
