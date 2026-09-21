import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';
import { gradeTopicCheck, lessonFingerprint, topicAccess } from '../../shared/topicCheckCore.ts';

import { allRows, topicSummary, syncCourseCompletion, mergeReading, readingPosition, isStudent } from '../../shared/learningProgress.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Sign in to use topic checks.' }, { status: 401 });
    const { action, lessonId, setId, attemptId, answers, pageIndex } = await req.json();
    if (!['access','status','start','submit','reading','reading_status','complete'].includes(action) || typeof lessonId !== 'string' || !lessonId) return Response.json({ error: 'A valid action and lesson are required.' }, { status: 400 });
    const lesson = await base44.entities.Lesson.get(lessonId);
    if (!lesson) return Response.json({ error: 'Lesson not found.' }, { status: 404 });
    if (action === 'access') return Response.json(await topicAccess(base44, user, lesson));
    const db = base44.asServiceRole.entities;
    if (action === 'status') {
      const summary = topicSummary(await allRows(db.TopicCheckAttempt, { user_id: user.id, lesson_id: lesson.id, status: 'submitted' }));
      return Response.json(summary);
    }
    const access = await topicAccess(base44, user, lesson);
    if (!access.allowed) return Response.json({ error: 'Pass the preceding topic first.', prerequisite: access.prerequisite }, { status: 403 });
    if (action === 'reading_status' || action === 'reading') {
      if (!isStudent(user)) return Response.json({ page_index: 0, pages_viewed: 0 });
      const records = await allRows(db.LessonProgress, { user_email: user.email, lesson_id: lesson.id, course_id: lesson.course_id });
      if (action === 'reading_status') return Response.json(readingPosition(records, lesson.slides?.length || 0));
      if (!Number.isInteger(pageIndex) || pageIndex < 0 || pageIndex >= (lesson.slides?.length || 0)) return Response.json({ error: 'Invalid reading page.' }, { status: 400 });
      const summary = topicSummary(await allRows(db.TopicCheckAttempt, { user_id: user.id, lesson_id: lesson.id, status: 'submitted' }));
      const existing = records[0];
      const merged = { ...existing, slides_viewed: records.flatMap(record => record.slides_viewed || []) };
      const update = mergeReading(merged, lesson, pageIndex, new Date().toISOString(), summary.passed);
      if (existing) await db.LessonProgress.update(existing.id, update);
      else await db.LessonProgress.create({ user_email: user.email, lesson_id: lesson.id, course_id: lesson.course_id, ...update });
      return Response.json(readingPosition([{ ...merged, ...update }], lesson.slides.length));
    }
    const finish = async result => {
      const summary = topicSummary(await allRows(db.TopicCheckAttempt, { user_id: user.id, lesson_id: lesson.id, status: 'submitted' }));
      if (summary.passed) {
        await syncCourseCompletion(base44, user, lesson);
        if (isStudent(user)) {
          const readings = await allRows(db.LessonProgress, { user_email: user.email, lesson_id: lesson.id, course_id: lesson.course_id });
          for (const reading of readings) if (reading.completion_status !== 'completed') {
            await db.LessonProgress.update(reading.id, { completion_status: 'completed', completed_at: new Date().toISOString() });
          }
        }
      }
      return Response.json({ ...result, ...summary, passed: result?.passed ?? summary.passed });
    };
    if (action === 'complete') return await finish({});
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
    if (attempt.status === 'submitted') return await finish({ attempt_id: attempt.id, score: attempt.score, total: attempt.total, percentage: attempt.percentage, passed: attempt.passed, feedback: attempt.feedback });
    const set = await db.TopicCheckSet.get(attempt.set_id);
    if (!set || set.lesson_id !== lesson.id) return Response.json({ error: 'The question set is unavailable.' }, { status: 409 });
    if (!Array.isArray(answers) || answers.length !== set.questions.length || answers.some((a, i) => !Number.isInteger(a) || a < 0 || a >= set.questions[i].options.length)) return Response.json({ error: 'Answer every question before submitting.' }, { status: 400 });
    const result = gradeTopicCheck(set.questions, answers);
    await db.TopicCheckAttempt.update(attempt.id, { ...result, answers, status: 'submitted', submitted_at: new Date().toISOString() });
    return await finish({ attempt_id: attempt.id, ...result });
  } catch (error) {
    console.error('Topic check failed:', error.message);
    return Response.json({ error: error.message || 'The topic check could not be processed.' }, { status: 500 });
  }
}