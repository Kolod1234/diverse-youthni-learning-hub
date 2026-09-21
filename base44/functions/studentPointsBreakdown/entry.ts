import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

import { allRows, attemptPercentage, roundPoints } from '../../shared/learningProgress.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();
    if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (caller.role !== 'admin' && caller.is_tutor !== true) {
      return Response.json({ error: 'Only tutors and admins can view a student points breakdown.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const studentId = body.user_id || null;
    const studentEmail = body.email || null;
    if (!studentId && !studentEmail) {
      return Response.json({ error: 'A student id or email is required.' }, { status: 400 });
    }

    const service = base44.asServiceRole.entities;
    const studentRows = studentId
      ? await service.User.filter({ id: studentId })
      : await service.User.filter({ email: studentEmail });
    const student = studentRows[0];
    if (!student) return Response.json({ error: 'Student not found.' }, { status: 404 });

    const [attempts, enrollmentsById, enrollmentsByEmail, readingByEmail, readingByOwner] = await Promise.all([
      allRows(service.TopicCheckAttempt, { user_id: student.id, status: 'submitted' }),
      allRows(service.Enrollment, { created_by_id: student.id }),
      allRows(service.Enrollment, { created_by: student.email }),
      allRows(service.LessonProgress, { user_email: student.email }),
      allRows(service.LessonProgress, { created_by_id: student.id })
    ]);

    const reading = new Map();
    for (const record of [...readingByEmail, ...readingByOwner]) {
      const existing = reading.get(record.lesson_id);
      if (!existing || (record.last_viewed_at || '') > (existing.last_viewed_at || '')) {
        reading.set(record.lesson_id, record);
      }
    }

    const relevantCourseIds = new Set([
      ...attempts.map(attempt => attempt.course_id),
      ...[...enrollmentsById, ...enrollmentsByEmail].map(enrollment => enrollment.course_id)
    ].filter(Boolean));

    const courseRows = relevantCourseIds.size
      ? (await Promise.all([...relevantCourseIds].map(id => service.Course.filter({ id })))).flat()
      : [];
    const courseMap = new Map(courseRows.map(course => [course.id, course]));

    const isAdmin = caller.role === 'admin';
    const allowedCourseIds = new Set(isAdmin
      ? [...courseMap.keys()]
      : courseRows.filter(course => (course.assigned_tutors || []).includes(caller.email)).map(course => course.id));

    if (allowedCourseIds.size === 0) {
      return Response.json({ error: 'You are not assigned to this student.' }, { status: 403 });
    }

    const topicKey = (courseId, lessonId) => courseId + '|' + lessonId;
    const topics = new Map();
    for (const attempt of attempts) {
      if (!allowedCourseIds.has(attempt.course_id)) continue;
      const key = topicKey(attempt.course_id, attempt.lesson_id);
      if (!topics.has(key)) {
        topics.set(key, { course_id: attempt.course_id, lesson_id: attempt.lesson_id, percentages: [], count: 0, lastAttempt: '' });
      }
      const topic = topics.get(key);
      topic.count += 1;
      const percentage = attemptPercentage(attempt);
      if (percentage !== null) topic.percentages.push(percentage);
      const stamp = attempt.submitted_at || attempt.created_date || '';
      if (stamp > topic.lastAttempt) topic.lastAttempt = stamp;
    }
    for (const [lessonId, record] of reading) {
      const courseId = record.course_id;
      if (!courseId || !allowedCourseIds.has(courseId)) continue;
      const key = topicKey(courseId, lessonId);
      if (!topics.has(key)) {
        topics.set(key, { course_id: courseId, lesson_id: lessonId, percentages: [], count: 0, lastAttempt: '' });
      }
    }

    const lessonIds = [...new Set([...topics.values()].map(topic => topic.lesson_id))];
    const lessonRows = lessonIds.length
      ? (await Promise.all(lessonIds.map(id => service.Lesson.filter({ id })))).flat()
      : [];
    const lessonMap = new Map(lessonRows.map(lesson => [lesson.id, lesson]));

    const totals = { gcse: 0, alevel: 0 };
    const courses = [];
    for (const course of courseRows) {
      if (!allowedCourseIds.has(course.id)) continue;
      const courseTopics = [...topics.values()]
        .filter(topic => topic.course_id === course.id)
        .map(topic => {
          const lesson = lessonMap.get(topic.lesson_id);
          const record = reading.get(topic.lesson_id);
          const hasAttempt = topic.percentages.length > 0;
          const best = hasAttempt ? Math.max(...topic.percentages) : 0;
          const pagesViewed = record ? (record.total_slides_viewed || (record.slides_viewed || []).length) : 0;
          const totalPages = lesson?.slides?.length || 0;
          const lastActivity = [topic.lastAttempt, record?.last_viewed_at || ''].filter(Boolean).sort().pop() || null;
          return {
            lesson_id: topic.lesson_id,
            title: lesson?.title || 'Lesson',
            best_percentage: hasAttempt ? roundPoints(best) : null,
            points: roundPoints(hasAttempt ? best : 0),
            passed: hasAttempt && best >= 70,
            attempts: topic.count,
            reading: {
              pages_viewed: pagesViewed,
              total_pages: totalPages,
              completion_status: record?.completion_status || null,
              last_viewed_at: record?.last_viewed_at || null
            },
            last_activity: lastActivity
          };
        })
        .sort((a, b) => a.title.localeCompare(b.title));
      if (courseTopics.length === 0) continue;

      const points = roundPoints(courseTopics.reduce((sum, topic) => sum + topic.points, 0));
      const passedCount = courseTopics.filter(topic => topic.passed).length;
      if (Object.hasOwn(totals, course.qualification_type)) totals[course.qualification_type] += points;
      courses.push({
        course_id: course.id,
        title: course.title,
        qualification_type: course.qualification_type,
        points,
        topics_passed: passedCount,
        topics_total: courseTopics.length,
        last_activity: courseTopics.map(topic => topic.last_activity).filter(Boolean).sort().pop() || null,
        topics: courseTopics
      });
    }
    courses.sort((a, b) => a.title.localeCompare(b.title));

    return Response.json({
      student: { id: student.id, full_name: student.full_name || '', email: student.email },
      scope: isAdmin ? 'all' : 'assigned',
      scoring: 'One point per best percentage point per topic; retakes add only improvements; reading tracked separately; previous 70% passes stay valid.',
      totals: { gcse: roundPoints(totals.gcse), alevel: roundPoints(totals.alevel) },
      courses
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}