import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Reads whole tables for admin/coordinator pages that previously called
// base44.asServiceRole.entities.<Table>.list(...) from the browser (which always fails).
const ALLOWED = {
  Enrollment: ['admin'],
  WorkbookProgress: ['admin', 'coordinator'],
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { entity, sort = '-created_date', limit = 500 } = await req.json();
    const roles = ALLOWED[entity];
    if (!roles) return Response.json({ error: 'Not allowed' }, { status: 400 });

    const isAdmin = user.role === 'admin';
    const isCoordinator = user.is_coordinator === true && !user.coordinator_banned;
    if (!((isAdmin && roles.includes('admin')) || (isCoordinator && roles.includes('coordinator')))) {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 500, 1), 1000);
    let records = await base44.asServiceRole.entities[entity].list(sort, safeLimit);
    if (!isAdmin && entity === 'WorkbookProgress') {
      records = records.filter((r) => r.assigned_coordinator_email === user.email);
    }
    return Response.json({ records });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
