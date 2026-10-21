import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Public tutor profile fields: what the Tutors page, Book a session and search show.
const PUBLIC_TUTOR_FIELDS = [
  'id', 'email', 'full_name', 'username', 'avatar', 'bio', 'role', 'is_tutor',
  'tutor_subjects', 'expertise_subjects', 'created_date',
];

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allUsers = await base44.asServiceRole.entities.User.list('-created_date', 500);

    // Admin pages (dashboard counts, tutor monitor) need the full list.
    if (user.role === 'admin') {
      return Response.json({ users: allUsers });
    }

    // Everyone else gets tutors only, and only their public profile, never other learners' accounts.
    const tutors = allUsers
      .filter(u => (u.is_tutor === true || u.role === 'admin') && !u.account_banned)
      .map(u => Object.fromEntries(PUBLIC_TUTOR_FIELDS.filter(k => u[k] !== undefined).map(k => [k, u[k]])));
    return Response.json({ users: tutors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
