import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Lets a coordinator save notes, a rating or a ban for a participant ASSIGNED TO THEM.
// The access rules stop non-admins editing other people's accounts, so the coordinator
// screen needs this narrow route; it can't touch any other field or any other user.
const ALLOWED = ['coordinator_notes', 'coordinator_rating', 'participant_banned'];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const isAdmin = user.role === 'admin';
    const isCoordinator = user.is_coordinator === true && !user.coordinator_banned && user.coordinator_access_granted;
    if (!isAdmin && !isCoordinator) return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { userId, data } = await req.json().catch(() => ({}));
    if (!userId || !data || typeof data !== 'object') return Response.json({ error: 'userId and data are required' }, { status: 400 });

    const [target] = await base44.asServiceRole.entities.User.filter({ id: userId });
    if (!target) return Response.json({ error: 'Not found' }, { status: 404 });
    if (!isAdmin && target.assigned_coordinator_email !== user.email) {
      return Response.json({ error: 'This participant is not assigned to you' }, { status: 403 });
    }

    const update = Object.fromEntries(Object.entries(data).filter(([k]) => ALLOWED.includes(k)));
    if (!Object.keys(update).length) return Response.json({ error: 'Nothing to update' }, { status: 400 });
    if ('coordinator_rating' in update) {
      const r = Number(update.coordinator_rating);
      if (!Number.isFinite(r) || r < 0 || r > 5) return Response.json({ error: 'Rating must be 0 to 5' }, { status: 400 });
      update.coordinator_rating = r;
    }
    if ('participant_banned' in update) update.participant_banned = update.participant_banned === true;
    if ('coordinator_notes' in update) update.coordinator_notes = String(update.coordinator_notes ?? '').slice(0, 5000);

    await base44.asServiceRole.entities.User.update(userId, update);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
