// Authoritative ranking points come only from server-graded topic-check attempts.
export async function allRows(entity, filter = {}) {
  const rows = [];
  for (let skip = 0; ; skip += 500) {
    const page = await entity.filter(filter, 'created_date', 500, skip);
    rows.push(...page);
    if (page.length < 500) return rows;
  }
}
export const roundPoints = value => Math.round(value * 100) / 100;
export function attemptPercentage(attempt) {
  if (attempt.status !== 'submitted' || !Number.isFinite(attempt.score) ||
      !Number.isFinite(attempt.total) || attempt.total <= 0 ||
      attempt.score < 0 || attempt.score > attempt.total) return null;
  return attempt.score * 100 / attempt.total;
}
export function topicSummary(attempts) {
  const percentages = attempts.map(attemptPercentage).filter(value => value !== null);
  const best = Math.max(0, ...percentages);
  return { passed: best >= 70, ever_passed: best >= 70,
    best_percentage: roundPoints(best), points: roundPoints(best),
    attempts: percentages.length };
}
export function bestTopicScores(attempts) {
  const best = new Map();
  for (const attempt of attempts) {
    const percentage = attemptPercentage(attempt);
    if (percentage === null) continue;
    const key = JSON.stringify([attempt.user_id, attempt.course_id, attempt.lesson_id]);
    if (!best.has(key) || best.get(key).points < percentage) {
      best.set(key, { user_id: attempt.user_id, course_id: attempt.course_id,
        lesson_id: attempt.lesson_id, points: percentage });
    }
  }
  return [...best.values()];
}
export function qualificationTotals(scores, courses, userId) {
  const courseMap = new Map(courses.map(course => [course.id, course.qualification_type]));
  const totals = { gcse: 0, alevel: 0 };
  for (const score of scores) {
    const qualification = courseMap.get(score.course_id);
    if (score.user_id === userId && Object.hasOwn(totals, qualification)) totals[qualification] += score.points;
  }
  return { gcse: roundPoints(totals.gcse), alevel: roundPoints(totals.alevel) };
}
export const isStudent = user => user && user.role !== 'admin' && user.is_tutor !== true && !user.account_banned;
export async function publicIdentity(user) {
  const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('scoreboard:' + user.id));
  const id = [...new Uint8Array(bytes)].map(byte => byte.toString(16).padStart(2, '0')).join('').slice(0, 16);
  const username = /^[A-Za-z][A-Za-z0-9_]{2,19}$/.test(user.username || '')
    ? user.username : 'Learner-' + id.slice(0, 8);
  return { id, username };
}
export function rankEntries(entries) {
  const sorted = [...entries].sort((a, b) => b.points - a.points || a.username.localeCompare(b.username) || a.id.localeCompare(b.id));
  let rank = 0;
  return sorted.map((entry, index) => {
    if (index === 0 || entry.points !== sorted[index - 1].points) rank = index + 1;
    return { ...entry, rank };
  });
}
export function lessonsForPathway(lessons, course, enrollment) {
  const units = { m1_m5: ['M1','M5'], m2_m6: ['M2','M6'], m3_m7: ['M3','M7'], m4_m8: ['M4','M8'] }[enrollment.math_pathway];
  return course.requires_math_pathway && units
    ? lessons.filter(lesson => !lesson.ccea_units?.length || lesson.ccea_units.some(unit => units.includes(unit)))
    : lessons;
}
export async function syncCourseCompletion(base44, user, lesson) {
  if (!isStudent(user)) return;
  const db = base44.asServiceRole.entities;
  const [enrollments, lessons, course, attempts] = await Promise.all([
    allRows(db.Enrollment, { course_id: lesson.course_id, created_by_id: user.id }),
    allRows(db.Lesson, { course_id: lesson.course_id }),
    db.Course.get(lesson.course_id),
    allRows(db.TopicCheckAttempt, { user_id: user.id, course_id: lesson.course_id, status: 'submitted' })
  ]);
  const passed = new Set(bestTopicScores(attempts).filter(score => score.points >= 70).map(score => score.lesson_id));
  for (const enrollment of enrollments) {
    const relevant = lessonsForPathway(lessons, course, enrollment);
    // Existing completion of legacy non-slide lessons is preserved.
    const completed = relevant.filter(item => passed.has(item.id) ||
      (!item.slides?.length && enrollment.completed_lessons?.includes(item.id))).map(item => item.id);
    const percent = relevant.length ? Math.round(completed.length * 100 / relevant.length) : 0;
    const done = relevant.length > 0 && completed.length === relevant.length;
    if (JSON.stringify([...(enrollment.completed_lessons || [])].sort()) !== JSON.stringify([...completed].sort()) ||
        enrollment.progress_percent !== percent || enrollment.is_completed !== done) {
      await db.Enrollment.update(enrollment.id, { completed_lessons: completed, progress_percent: percent,
        is_completed: done, ...(done ? { completed_date: enrollment.completed_date || new Date().toISOString() } : {}) });
    }
  }
}
export function mergeReading(existing, lesson, pageIndex, now, passed) {
  const views = (existing?.slides_viewed || []).filter(view => Number.isInteger(view.slide_index) && view.slide_index >= 0 && view.slide_index < lesson.slides.length);
  const byPage = new Map(views.map(view => [view.slide_index, view]));
  byPage.set(pageIndex, { ...(byPage.get(pageIndex) || {}), slide_index: pageIndex, viewed_at: now });
  return { slides_viewed: [...byPage.values()], total_slides_viewed: byPage.size,
    first_viewed_at: existing?.first_viewed_at || now, last_viewed_at: now,
    completion_status: passed ? 'completed' : 'in_progress',
    ...(passed ? { completed_at: existing?.completed_at || now } : {}) };
}
export function readingPosition(records, pageCount) {
  const views = records.flatMap(record => record.slides_viewed || [])
    .filter(view => Number.isInteger(view.slide_index) && view.slide_index >= 0 && view.slide_index < pageCount)
    .sort((a, b) => (b.viewed_at || '').localeCompare(a.viewed_at || ''));
  return { page_index: views[0]?.slide_index ?? 0, pages_viewed: new Set(views.map(view => view.slide_index)).size };
}
