export const topicCheckVersion = 'topic-check-v1';
export async function lessonFingerprint(lesson) {
  const source = JSON.stringify([topicCheckVersion, lesson.title, lesson.learning_objectives || [], lesson.slides || []]);
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(source));
  return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2, '0')).join('');
}
export function gradeTopicCheck(questions, answers) {
  if (!Array.isArray(answers) || answers.length !== questions.length || answers.some((a, i) => !Number.isInteger(a) || a < 0 || a >= questions[i].options.length)) throw new Error('Answer every question before submitting.');
  const review = questions.map((q, i) => ({ question: q.question, selected: q.options[answers[i]], correct: q.options[q.correctAnswer], is_correct: answers[i] === q.correctAnswer, explanation: q.explanation, concept: q.concept, source_page: q.source_page }));
  const score = review.filter(q => q.is_correct).length;
  const concepts = [...new Set(review.map(q => q.concept))];
  const weaknesses = concepts.filter(c => review.some(q => q.concept === c && !q.is_correct));
  return { score, total: questions.length, percentage: score * 100 / questions.length, passed: score * 100 >= 70 * questions.length, feedback: { strengths: concepts.filter(c => !weaknesses.includes(c)), weaknesses, review } };
}
export async function topicAccess(base44, user, lesson) {
  if (user.role === 'admin' || user.is_tutor === true) return { allowed: true, staff: true };
  const course = await base44.entities.Course.get(lesson.course_id);
  const lessons = await base44.entities.Lesson.filter({ course_id: lesson.course_id }, 'order', 1000);
  const sectionSubject = item => /^(biology|chemistry|physics)\b/i.exec(item.section || '')?.[1]?.toLowerCase() || course.category;
  let earlier = lessons.filter(l => l.order < lesson.order && sectionSubject(l) === sectionSubject(lesson) && l.slides?.length);
  if (course.requires_math_pathway) {
    const enrollments = await base44.entities.Enrollment.filter({ course_id: course.id, created_by_id: user.id });
    const units = { m1_m5: ['M1','M5'], m2_m6: ['M2','M6'], m3_m7: ['M3','M7'], m4_m8: ['M4','M8'] }[enrollments[0]?.math_pathway];
    if (units) earlier = earlier.filter(l => !l.ccea_units?.length || l.ccea_units.some(u => units.includes(u)));
  }
  // Read server-graded passes only; browser completion flags cannot unlock topics.
  const passedIds = new Set();
  for (let skip = 0; ; skip += 500) {
    const passes = await base44.asServiceRole.entities.TopicCheckAttempt.filter({ user_id: user.id, course_id: lesson.course_id, status: 'submitted', passed: true }, 'created_date', 500, skip);
    passes.forEach(p => passedIds.add(p.lesson_id));
    if (passes.length < 500) break;
  }
  // A saved pass permanently permits revision, even if earlier topics are added later.
  if (passedIds.has(lesson.id)) return { allowed: true, staff: false };
  const prior = earlier.find(l => !passedIds.has(l.id));
  if (prior) return { allowed: false, prerequisite: { id: prior.id, title: prior.title, course_id: prior.course_id } };
  return { allowed: true, staff: false };
}
