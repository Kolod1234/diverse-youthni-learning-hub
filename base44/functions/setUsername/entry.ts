import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { username } = await req.json();
    const clean = String(username || '').trim();
    const normalized = clean.toLowerCase();
    if (!/^[A-Za-z][A-Za-z0-9_]{2,19}$/.test(clean)) {
      return Response.json({ error: 'Use 3–20 characters, starting with a letter, with letters, numbers or underscores only.' }, { status: 400 });
    }
    if (user.username) return Response.json({ error: 'Your username has already been set.' }, { status: 409 });
    const matches = await base44.asServiceRole.entities.User.filter({ username_normalized: normalized }, 'id', 2);
    if (matches.some((item) => item.id !== user.id)) {
      return Response.json({ error: 'That username is already taken.' }, { status: 409 });
    }
    const updated = await base44.auth.updateMe({ username: clean, username_normalized: normalized, username_set_at: new Date().toISOString() });
    return Response.json({ success: true, username: updated.username || clean });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}