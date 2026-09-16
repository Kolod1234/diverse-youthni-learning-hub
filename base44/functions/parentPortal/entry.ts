import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { getParentContext, getUpcomingSchedules } from '../../shared/parentAccess.js';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await req.json();
    const action = body.action || 'dashboard';
    if (action === 'health') return Response.json({ ok: true });
    const context = await getParentContext(base44, user);
    if (action === 'setup_parent') {
      if (!context.profile) await base44.asServiceRole.entities.ParentProfile.create({ parent_user_id: user.id, parent_email: user.email, parent_name: user.full_name || 'Parent', notifications_enabled: true });
      if (user.role !== 'admin') await base44.auth.updateMe({ account_type: 'parent' });
      return Response.json({ ready: true });
    }
    if (!context.profile) return Response.json({ needs_setup: true, children: [], links: [], managed_children: [], messages: [], notifications: [], tutors: [], schedules: { events: [], sessions: [], bookings: [] } });
    if (action === 'managed_child') {
      if (!body.child_name?.trim() || !body.date_of_birth) return Response.json({ error: 'Child name and date of birth are required' }, { status: 400 });
      const child = await base44.asServiceRole.entities.ParentManagedChild.create({ parent_user_id: user.id, parent_email: user.email, child_name: body.child_name.trim(), date_of_birth: body.date_of_birth, notes: body.notes || '' });
      return Response.json({ child });
    }
    if (action === 'invite_child') {
      const email = body.child_email?.trim().toLowerCase();
      if (!email || !body.child_name?.trim()) return Response.json({ error: 'Child name and email are required' }, { status: 400 });
      const existingUsers = await base44.asServiceRole.entities.User.filter({ email }, '-created_date', 1);
      if (existingUsers.length) return Response.json({ error: 'This learner already has an account. Submit an existing-account verification request instead.' }, { status: 409 });
      await base44.users.inviteUser(email, 'user');
      const link = await base44.asServiceRole.entities.ParentChildLink.create({ parent_user_id: user.id, parent_email: user.email, child_email: email, child_name: body.child_name.trim(), relationship: body.relationship || 'Parent or guardian', link_method: 'invited', status: 'approved' });
      return Response.json({ link, invited: true });
    }
    if (action === 'request_link') {
      const email = body.child_email?.trim().toLowerCase();
      if (!email || !body.child_name?.trim()) return Response.json({ error: 'Child name and account email are required' }, { status: 400 });
      const duplicate = context.links.find((link) => link.child_email.toLowerCase() === email && link.status !== 'rejected');
      if (duplicate) return Response.json({ error: 'A request for this learner is already active.' }, { status: 409 });
      const link = await base44.asServiceRole.entities.ParentChildLink.create({ parent_user_id: user.id, parent_email: user.email, child_email: email, child_name: body.child_name.trim(), relationship: body.relationship || 'Parent or guardian', link_method: 'existing', status: 'pending', verification_note: body.verification_note || '' });
      await base44.asServiceRole.entities.Notification.create({ recipient_email: 'info@diverseyouthni.com', title: 'Parent-child verification request', message: `${user.full_name || user.email} requested access to ${body.child_name.trim()}.`, type: 'general', action_url: '/admin-parent-links', sent_by: user.email });
      return Response.json({ link });
    }
    if (action === 'send_message') {
      const recipient = body.recipient_email?.trim().toLowerCase();
      const content = body.content?.trim();
      const allowed = new Set(['info@diverseyouthni.com']);
      const courses = await base44.asServiceRole.entities.Course.list('-created_date', 1000);
      courses.forEach((course) => (course.assigned_tutors || []).forEach((email) => allowed.add(email.toLowerCase())));
      if (!recipient || !content || !allowed.has(recipient)) return Response.json({ error: 'Select an approved administrator or tutor and enter a message.' }, { status: 400 });
      const message = await base44.asServiceRole.entities.Message.create({ sender_email: user.email, sender_name: user.full_name || 'Parent', recipient_email: recipient, content, message_type: 'text' });
      return Response.json({ message });
    }
    const children = [];
    const courseMap = new Map();
    const allCourses = await base44.asServiceRole.entities.Course.list('-created_date', 1000);
    allCourses.forEach((course) => courseMap.set(course.id, course));
    for (const link of context.approvedLinks) {
      const email = link.child_email.toLowerCase();
      const [progress, courseEnrollments, enrollments, submissions, attempts] = await Promise.all([
        base44.asServiceRole.entities.LessonProgress.filter({ user_email: email }, '-last_viewed_at', 500),
        base44.asServiceRole.entities.CourseEnrollment.filter({ user_email: email }, '-created_date', 500),
        base44.asServiceRole.entities.Enrollment.filter({ created_by: email }, '-created_date', 500),
        base44.asServiceRole.entities.Submission.filter({ student_email: email }, '-submitted_date', 500),
        base44.asServiceRole.entities.QuizAttempt.filter({ created_by: email }, '-created_date', 500)
      ]);
      const courseIds = [...new Set([...courseEnrollments.map((e) => e.course_id), ...enrollments.map((e) => e.course_id)])];
      const assignments = (await Promise.all(courseIds.map((courseId) => base44.asServiceRole.entities.Assignment.filter({ course_id: courseId, is_published: true }, 'due_date', 100)))).flat();
      const submittedIds = new Set(submissions.map((s) => s.assignment_id));
      const totalSeconds = progress.reduce((sum, item) => sum + (item.time_spent_seconds || 0), 0);
      const completedLessons = progress.filter((item) => item.completion_status === 'completed').length;
      const courseProgress = courseIds.map((id) => ({ id, title: courseMap.get(id)?.title || 'Course', percent: enrollments.find((e) => e.course_id === id)?.progress_percent || 0 }));
      children.push({ id: link.id, name: link.child_name, email, study_hours: Math.round(totalSeconds / 360) / 10, completed_lessons: completedLessons, average_quiz_score: attempts.length ? Math.round(attempts.reduce((sum, item) => sum + (item.score || 0), 0) / attempts.length) : 0, course_progress: courseProgress, outstanding_assignments: assignments.filter((a) => !submittedIds.has(a.id)) });
    }
    const schedules = await getUpcomingSchedules(base44, context.childEmails);
    const [received, sent, notifications] = await Promise.all([
      base44.asServiceRole.entities.Message.filter({ recipient_email: user.email }, '-created_date', 100),
      base44.asServiceRole.entities.Message.filter({ sender_email: user.email }, '-created_date', 100),
      base44.asServiceRole.entities.Notification.filter({ recipient_email: user.email }, '-created_date', 100)
    ]);
    const tutorEmails = new Set();
    children.flatMap((child) => child.course_progress).forEach((progress) => (courseMap.get(progress.id)?.assigned_tutors || []).forEach((email) => tutorEmails.add(email)));
    const users = await base44.asServiceRole.entities.User.list('-created_date', 1000);
    const tutors = [...tutorEmails].map((email) => ({ email, name: users.find((item) => item.email === email)?.full_name || email }));
    return Response.json({ profile: context.profile, links: context.links, managed_children: context.managedChildren, children, schedules, messages: [...received, ...sent].sort((a, b) => new Date(b.created_date) - new Date(a.created_date)), notifications, tutors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}