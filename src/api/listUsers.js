import { base44 } from '@/api/base44Client';

// Staff screens (tutors, coordinators, admins) list users through the adminListUsers server function.
// Asking the User table directly only works for admins: the access rules block everyone else,
// which used to leave tutor and coordinator screens silently empty.
export async function listUsers({ filter, sort = '-created_date', limit = 500 } = {}) {
  const res = await base44.functions.invoke('adminListUsers', { filter, sort, limit });
  return res.data?.users || [];
}
