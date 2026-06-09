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
  if (email && course.created_by === email) return true;

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
 * Useful when populating dashboards.
 */
export function filterCoursesForTutor(courses, user, approvedSubjects) {
  if (!Array.isArray(courses)) return [];
  return courses.filter(c => canTutorAccessCourse(c, user, approvedSubjects));
}