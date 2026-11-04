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
  return { score, total: questions.length, percentage: score * 100 / questions.length, passed: true, feedback: { strengths: concepts.filter(c => !weaknesses.includes(c)), weaknesses, review } };
}
// Topic checks are a learning aid, not a gate: every lesson in a course is open to
// learners in any order. A pass is still recorded and still feeds progress and
// points, but a missing pass never blocks access to a lesson.
export function topicAccess(user) {
  const staff = user?.role === 'admin' || user?.is_tutor === true;
  return { allowed: true, staff };
}