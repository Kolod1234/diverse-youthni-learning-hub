import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

import { allRows, attemptPercentage, roundPoints } from '../../shared/learningProgress.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();
    if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (caller.role !== 'admin' && caller.is_tutor !== true) {
      return Response.json({ error: 'Only tutors and admins can view a student performance trend.' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const studentId = body.user_id || null;
    const studentEmail = body.email || null;
    if (!studentId && !studentEmail) {
      return Response.json({ error: 'A student id or email is required.' }, { status: 400 });
    }

    const service = base44.asServiceRole.entities;
    const student = (studentId
      ? await service.User.filter({ id: studentId })
      : await service.User.filter({ email: studentEmail }))[0];
    if (!student) return Response.json({ error: 'Student not found.' }, { status: 404 });

    const [attempts, courses] = await Promise.all([
      allRows(service.TopicCheckAttempt, { user_id: student.id, status: 'submitted' }),
      allRows(service.Course)
    ]);

    const courseMap = new Map(courses.map(course => [course.id, course]));
    const isAdmin = caller.role === 'admin';
    const allowedIds = new Set(courses
      .filter(course => isAdmin || (course.assigned_tutors || []).includes(caller.email))
      .map(course => course.id));
    if (allowedIds.size === 0) {
      return Response.json({ error: 'You are not assigned to this student.' }, { status: 403 });
    }

    // Chronological best-score milestones: cumulative points per qualification,
    // one data point per day with activity (later same-day attempts update it).
    const timed = attempts
      .filter(attempt => allowedIds.has(attempt.course_id))
      .map(attempt => ({
        course_id: attempt.course_id,
        lesson_id: attempt.lesson_id,
        percentage: attemptPercentage(attempt),
        at: attempt.submitted_at || attempt.created_date || ''
      }))
      .filter(attempt => attempt.percentage !== null && attempt.at)
      .sort((a, b) => a.at.localeCompare(b.at));

    const best = new Map();
    const totals = { gcse: 0, alevel: 0 };
    const series = [];
    let currentDay = null;
    for (const attempt of timed) {
      const key = attempt.course_id + '|' + attempt.lesson_id;
      const qualification = courseMap.get(attempt.course_id)?.qualification_type;
      const improvement = Math.max(0, attempt.percentage - (best.get(key) || 0));
      if (improvement > 0) {
        best.set(key, attempt.percentage);
        if (Object.hasOwn(totals, qualification)) totals[qualification] += improvement;
      }
      const day = attempt.at.slice(0, 10);
      if (day !== currentDay) {
        series.push({ date: attempt.at, gcse: roundPoints(totals.gcse), alevel: roundPoints(totals.alevel) });
        currentDay = day;
      } else {
        const last = series[series.length - 1];
        last.date = attempt.at;
        last.gcse = roundPoints(totals.gcse);
        last.alevel = roundPoints(totals.alevel);
      }
    }

    return Response.json({
      student: { id: student.id, full_name: student.full_name || '', email: student.email },
      scope: isAdmin ? 'all' : 'assigned',
      scoring: 'One point per best percentage point per topic; improvements only; cumulative over time.',
      series
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}