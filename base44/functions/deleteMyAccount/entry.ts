// NEW server function: deleteMyAccount
// The Settings page "Delete Account" button currently only shows
// "Account deletion request submitted" and sends nothing. This function makes it real.
//
// What it does:
//   1. Checks the user typed their own email to confirm.
//   2. Deletes the user's personal records (progress, notes, bookmarks, preferences, messages they sent...).
//   3. Blocks the account and notifies admins, who then remove the login in
//      Base44 → Users (final step, so nothing is lost by mistake).
//
// Frontend change (Settings → Delete Account handler):
//   const res = await base44.functions.invoke("deleteMyAccount", { confirmEmail: typedEmail });
//   toast.success("Your data has been deleted. An admin will close your login within 30 days.");
//   await base44.auth.logout();
//
// Review the two lists below with the safeguarding lead: some records (e.g. attendance,
// safeguarding notes) may need to be KEPT for a set period rather than deleted.
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

// Tables where the user's email is stored in a named field.
const BY_EMAIL_FIELD = {
  LessonBookmark: 'user_email', LessonProgress: 'user_email', QuizPerformance: 'user_email',
  PathwayProgress: 'user_email', NotificationPreference: 'user_email', EventRSVP: 'user_email',
  SCORMSession: 'user_email', SCORMSuspendData: 'user_email', SupportChat: 'user_email',
  Notification: 'recipient_email', SessionReminder: 'recipient_email', GroupSessionCalendarSync: 'user_email',
  Message: 'sender_email', ChatMessage: 'sender_email', SessionChat: 'sender_email',
  Submission: 'student_email', AcademyEnrollment: 'student_email', CourseEnrollment: 'user_email',
  StudyGroupMember: 'member_email', SessionParticipant: 'participant_email',
};
// Tables where ownership is the built-in created_by field.
const BY_CREATOR = [
  'LessonHighlight', 'LessonAnnotation', 'Annotation', 'AudioNote', 'SavedSearch', 'UserPreferences',
  'StudyStreak', 'UserProgress', 'QuizAttempt', 'Enrollment', 'PathEnrollment', 'CommunityPost',
  'Discussion', 'Review', 'FileComment', 'LessonQuestion', 'ChallengeParticipant', 'FileUpload',
];

async function deleteAll(entity, query) {
  let removed = 0;
  // Page through in batches so large histories are fully removed.
  for (;;) {
    const batch = await entity.filter(query, '-created_date', 200);
    if (!batch.length) break;
    for (const rec of batch) { await entity.delete(rec.id); removed++; }
    if (batch.length < 200) break;
  }
  return removed;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { confirmEmail } = await req.json();
    if (!confirmEmail || confirmEmail.trim().toLowerCase() !== user.email.toLowerCase()) {
      return Response.json({ error: 'Email does not match' }, { status: 400 });
    }

    const sr = base44.asServiceRole.entities;
    const summary = {};
    for (const [name, field] of Object.entries(BY_EMAIL_FIELD)) {
      summary[name] = await deleteAll(sr[name], { [field]: user.email });
    }
    for (const name of BY_CREATOR) {
      summary[name] = await deleteAll(sr[name], { created_by: user.email });
    }

    // Block further use and record the request; admins remove the login afterwards.
    await sr.User.update(user.id, {
      account_banned: true,
      ban_reason: 'Account deletion requested by the user',
      deletion_requested_at: new Date().toISOString(),
    });
    const admins = await sr.User.filter({ role: 'admin' });
    for (const a of admins) {
      await sr.Notification.create({
        recipient_email: a.email,
        message: `Account deletion requested by ${user.email}. Personal records deleted; please remove the login in Base44 → Users.`,
      });
    }
    return Response.json({ ok: true, summary });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});
