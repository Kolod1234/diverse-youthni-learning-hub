// Shared helpers for deciding which courses a tutor can teach.
//
// A tutor can manage a course if ANY of these is true:
//   1. They are an admin.
//   2. They are explicitly listed in course.assigned_tutors.
//   3. They created the course (course.created_by === user.email).
//   4. The course's category matches one of the tutor's approved subjects
//      (case-insensitive, with sensible aliases for related subjects).

// Map a course category to the family of "approved subjects" that should
// grant access to it. Comparisons are always lowercase.
const CATEGORY_ALIASES = {
  // Mathematics family
  mathematics: ['mathematics', 'maths', 'math'],
  further_mathematics: ['further_mathematics', 'further mathematics', 'mathematics', 'maths'],
  // English family
  english_language: ['english_language', 'english language', 'english'],
  english_literature: ['english_literature', 'english literature', 'english'],
  english_language_literature: ['english_language_literature', 'english language and literature', 'english'],
  // Science family
  biology: ['biology', 'science'],
  chemistry: ['chemistry', 'science'],
  physics: ['physics', 'science'],
  science: ['science', 'biology', 'chemistry', 'physics'],
  // Computing family
  computer_science: ['computer_science', 'computer science', 'computing', 'computing_science'],
  digital_technology: ['digital_technology', 'digital technology', 'computing', 'ict'],
  software_systems_development: ['software_systems_development', 'software systems development', 'computing', 'software_engineering'],
  technology_design: ['technology_design', 'technology and design', 'technology', 'design_technology'],
  environmental_technology: ['environmental_technology', 'environmental technology', 'technology'],
  // Humanities & Social
  history: ['history'],
  geography: ['geography'],
  economics: ['economics'],
  government_politics: ['government_politics', 'government and politics', 'politics'],
  religious_studies: ['religious_studies', 'religious studies', 'religion', 're'],
  life_health_sciences: ['life_health_sciences', 'life and health sciences', 'health'],
};

const norm = (v) => (v == null ? '' : String(v).trim().toLowerCase().replace(/\s+/g, '_'));

/**
 * Return true if the given course is teachable by the given user.
 *
 * @param {object} course   - Course record. Falsy course is treated as "not yet loaded" → true.
 * @param {object} user     - Current user (with email, role, etc).
 * @param {string[]} approvedSubjects - Subjects from the tutor's approved TutorRequest.
 */
export function canTutorAccessCourse(course, user, approvedSubjects) {
  if (!course) return true; // course not loaded yet — let the page render
  if (!user) return false;
  if (user.role === 'admin') return true;

  const email = user.email;
  if (email && Array.isArray(course.assigned_tutors) && course.assigned_tutors.includes(email)) {
    return true;
  }
  // Note: course.created_by stores a user ID, not an email — do not compare to email here.

  const category = norm(course.category);
  if (!category) return false;

  const approved = (approvedSubjects || []).map(norm).filter(Boolean);
  if (approved.length === 0) return false;

  const acceptedForCategory = (CATEGORY_ALIASES[category] || [category]).map(norm);
  // Match if any of the user's approved subjects is in the accepted set for this category.
  return approved.some(s => acceptedForCategory.includes(s));
}

/**
 * Filter a list of courses down to the ones the tutor can teach.
 * Used by editors / pickers where any teachable course is acceptable.
 */
export function filterCoursesForTutor(courses, user, approvedSubjects) {
  if (!Array.isArray(courses)) return [];
  return courses.filter(c => canTutorAccessCourse(c, user, approvedSubjects));
}

/**
 * Return true ONLY for courses the tutor has been explicitly given by an admin
 * via course.assigned_tutors. Approved subjects do NOT count here, and the
 * `created_by` field is intentionally ignored because it stores a user ID
 * (not an email) and isn't a reliable signal of "the tutor owns this course".
 *
 * This is what the tutor dashboard should display as "My Assigned Courses".
 *
 * Note: admins (top-level role OR data.role) see ALL courses — they are not
 * gated by assigned_tutors. Non-admin tutors must be in assigned_tutors.
 */
export function isCourseExplicitlyAssignedToTutor(course, user) {
  if (!course || !user) return false;
  // Treat as admin only if the platform role is admin (not a custom data.role)
  if (user.role === 'admin') return true;
  const email = (user.email || '').toLowerCase().trim();
  if (!email) return false;
  const assigned = course.assigned_tutors;
  if (!Array.isArray(assigned) || assigned.length === 0) return false;
  // Case-insensitive comparison to avoid email-casing mismatches
  return assigned.some(e => (e || '').toLowerCase().trim() === email);
}

/**
 * Filter courses down to only those explicitly assigned to the tutor.
 */
export function filterAssignedCoursesForTutor(courses, user) {
  if (!Array.isArray(courses)) return [];
  return courses.filter(c => isCourseExplicitlyAssignedToTutor(c, user));
}