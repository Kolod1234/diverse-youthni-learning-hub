// Tier dashboards (e.g. CCEA GCSE Mathematics Foundation/Higher Tier) share one
// lesson pool with their content source course. Some pool sections carry a
// scope prefix ("Shared CCEA Specification Content · Number") that only makes
// sense inside the combined course; learners inside a tier course should see
// the clean topic name. Returns null for a falsy section so callers can apply
// their own default.
const SHARED_POOL_PREFIX = 'Shared CCEA Specification Content';

export function displayCurriculumSection(section, course) {
  if (section && course?.content_source_course_id && section.startsWith(SHARED_POOL_PREFIX)) {
    const topic = section
      .slice(SHARED_POOL_PREFIX.length)
      .replace(/^[\s·]+/, '')
      .trim();
    if (topic) return topic;
  }
  return section || null;
}