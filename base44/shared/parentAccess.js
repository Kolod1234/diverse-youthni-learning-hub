export async function getParentContext(base44, user) {
  const profiles = await base44.asServiceRole.entities.ParentProfile.filter({ parent_user_id: user.id }, '-created_date', 1);
  let profile = profiles[0];
  if (!profile) {
    profile = await base44.asServiceRole.entities.ParentProfile.create({ parent_user_id: user.id, parent_email: user.email, parent_name: user.full_name || 'Parent', notifications_enabled: true });
  }
  const links = await base44.asServiceRole.entities.ParentChildLink.filter({ parent_user_id: user.id }, '-created_date', 100);
  const managedChildren = await base44.asServiceRole.entities.ParentManagedChild.filter({ parent_user_id: user.id }, '-created_date', 100);
  const approvedLinks = links.filter((link) => link.status === 'approved');
  return { profile, links, managedChildren, approvedLinks, childEmails: [...new Set(approvedLinks.map((link) => link.child_email.toLowerCase()))] };
}

export async function getUpcomingSchedules(base44, childEmails) {
  const today = new Date().toISOString().slice(0, 10);
  const [events, sessions, bookings] = await Promise.all([
    base44.asServiceRole.entities.Event.filter({ is_published: true, date: { $gte: today } }, 'date', 100),
    base44.asServiceRole.entities.VideoSession.filter({ scheduled_date: { $gte: today } }, 'scheduled_date', 200),
    Promise.all(childEmails.map((email) => base44.asServiceRole.entities.SessionBooking.filter({ student_email: email, booking_date: { $gte: today } }, 'booking_date', 100)))
  ]);
  return {
    events,
    sessions: sessions.filter((session) => session.status !== 'cancelled' && (session.invited_students || []).some((email) => childEmails.includes(email.toLowerCase()))),
    bookings: bookings.flat().filter((booking) => booking.status !== 'cancelled')
  };
}