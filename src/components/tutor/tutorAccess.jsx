// Single source of truth for tutor → course access.
//
// STRICT RULE (no exceptions):
//   1. Admins (user.role === 'admin') see and manage ALL courses.
//   2. Every other user — including tutors — sees and manages a course
//      ONLY IF their normalized email appears explicitly in
//      Course.assigned_tutors.
//
// We deliberately DO NOT consider:
//   - Tutor approval status / TutorRequest subjects
//   - Course.category or subject aliases
//   - Course.created_by / created_by_id / instructor name
//   - Enrollment of any student
//   - Any other "fallback" heuristic
//
// If you find yourself wanting to add a fallback here: don't. Have an admin
// add the tutor to Course.assigned_tutors instead.

const normEmail = (v) => (v == null ? '' : String(v).trim().toLowerCase());

/**
 * Return true ONLY if the user is an admin OR their normalized email is in
 * course.assigned_tutors.
 */
export function isCourseExplicitlyAssignedToTutor(course, user) {
  if (!course || !user) return false;
  if (user.role === 'admin') return true;
  const email = normEmail(user.email);
  if (!email) return false;
  const assigned = course.assigned_tutors;
  if (!Array.isArray(assigned) || assigned.length === 0) return false;
  return assigned.some((e) => normEmail(e) === email);
}

/**
 * Single source of truth for "can this user act as a tutor on this course".
 * Use this everywhere a tutor needs to view, edit, manage lessons / quizzes /
 * assignments, schedule sessions or grade work for a course.
 */
export function canTutorManageCourse(course, user) {
  return isCourseExplicitlyAssignedToTutor(course, user);
}

/**
 * Filter courses down to only those explicitly assigned to the tutor
 * (admins get all).
 */
export function filterAssignedCoursesForTutor(courses, user) {
  if (!Array.isArray(courses)) return [];
  return courses.filter((c) => isCourseExplicitlyAssignedToTutor(c, user));
}

// ── Self-tests (run-time, dev only) ────────────────────────────────────────
// These execute once when the module is first imported in a non-production
// build. They guarantee the rule cannot regress without producing a console
// error visible to anyone running `npm run dev`.
if (typeof import.meta !== 'undefined' && import.meta?.env?.MODE !== 'production') {
  const tutor = { email: 'tutor@example.com', role: 'user', is_tutor: true };
  const admin = { email: 'admin@example.com', role: 'admin' };
  const courseAssigned = { id: 'a', assigned_tutors: ['Tutor@Example.com '] }; // trimmed + lowercased
  const courseUnassigned = { id: 'b', assigned_tutors: ['other@example.com'], category: 'mathematics', created_by: 'tutor@example.com', instructor: 'Tutor' };
  const courseEmpty = { id: 'c', assigned_tutors: [] };

  const assert = (cond, label) => { if (!cond) console.error(`[tutorAccess] FAIL: ${label}`); };

  assert(isCourseExplicitlyAssignedToTutor(courseAssigned, tutor) === true, 'tutor in assigned_tutors (case/space tolerant)');
  assert(isCourseExplicitlyAssignedToTutor(courseUnassigned, tutor) === false, 'category/created_by/instructor must NOT grant');
  assert(isCourseExplicitlyAssignedToTutor(courseEmpty, tutor) === false, 'empty assigned_tutors must NOT grant');
  assert(isCourseExplicitlyAssignedToTutor(courseUnassigned, admin) === true, 'admin sees all');
  assert(filterAssignedCoursesForTutor([courseAssigned, courseUnassigned, courseEmpty], tutor).length === 1, 'filter returns only explicitly assigned');
  assert(filterAssignedCoursesForTutor([courseAssigned, courseUnassigned, courseEmpty], admin).length === 3, 'admin filter returns all');
  assert(filterAssignedCoursesForTutor([courseEmpty], { ...tutor, email: 'unassigned@example.com' }).length === 0, 'zero-assignment tutor sees 0 courses');
}