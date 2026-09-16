import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { gradeTopicCheck, lessonFingerprint, topicAccess } from '../../shared/topicCheckCore.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Sign in to use topic checks.' }, { status: 401 });
    const { action, lessonId, setId, attemptId, answers } = await req.json();
    if (!['access','status','start','submit'].includes(action) || typeof lessonId !== 'string' || !lessonId) return Response.json({ error: 'A valid action and lesson are required.' }, { status: 400 });
    const lesson = await base44.entities.Lesson.get(lessonId);
    if (!lesson) return Response.json({ error: 'Lesson not found.' }, { status: 404 });
    if (action === 'access') return Response.json(await topicAccess(base44, user, lesson));
    const db = base44.asServiceRole.entities;
    if (action === 'status') {
      const passes = await db.TopicCheckAttempt.filter({ user_id: user.id, lesson_id: lesson.id, status: 'submitted', passed: true }, '-created_date', 1);
      return Response.json({ passed: passes.length > 0 });
    }
    const access = await topicAccess(base44, user, lesson);
    if (!access.allowed) return Response.json({ error: 'Pass the preceding topic first.', prerequisite: access.prerequisite }, { status: 403 });
    if (action === 'start') {
      if (typeof setId !== 'string') return Response.json({ error: 'Prepare the topic check first.' }, { status: 400 });
      const set = await db.TopicCheckSet.get(setId);
      if (!set || set.lesson_id !== lesson.id || set.fingerprint !== await lessonFingerprint(lesson)) return Response.json({ error: 'The lesson has changed. Prepare a new topic check.' }, { status: 409 });
      const attempt = await db.TopicCheckAttempt.create({ user_id: user.id, lesson_id: lesson.id, course_id: lesson.course_id, set_id: set.id, status: 'started' });
      return Response.json({ attempt_id: attempt.id });
    }
    if (typeof attemptId !== 'string') return Response.json({ error: 'Start the check before submitting.' }, { status: 400 });
    const attempt = await db.TopicCheckAttempt.get(attemptId);
    if (!attempt || attempt.user_id !== user.id || attempt.lesson_id !== lesson.id) return Response.json({ error: 'This attempt is not yours.' }, { status: 403 });
    if (attempt.status === 'submitted') return Response.json({ attempt_id: attempt.id, score: attempt.score, total: attempt.total, percentage: attempt.percentage, passed: attempt.passed, feedback: attempt.feedback });
    const set = await db.TopicCheckSet.get(attempt.set_id);
    if (!set || set.lesson_id !== lesson.id) return Response.json({ error: 'The question set is unavailable.' }, { status: 409 });
    if (!Array.isArray(answers) || answers.length !== set.questions.length || answers.some((a, i) => !Number.isInteger(a) || a < 0 || a >= set.questions[i].options.length)) return Response.json({ error: 'Answer every question before submitting.' }, { status: 400 });
    const result = gradeTopicCheck(set.questions, answers);
    await db.TopicCheckAttempt.update(attempt.id, { ...result, answers, status: 'submitted', submitted_at: new Date().toISOString() });
    return Response.json({ attempt_id: attempt.id, ...result });
  } catch (error) {
    console.error('Topic check failed:', error.message);
    return Response.json({ error: error.message || 'The topic check could not be processed.' }, { status: 500 });
  }
}