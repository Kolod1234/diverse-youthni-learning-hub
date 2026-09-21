import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

import { allRows, bestTopicScores, isStudent, roundPoints } from '../../shared/learningProgress.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const caller = await base44.auth.me();
    if (!caller) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    if (caller.role !== 'admin' && caller.is_tutor !== true) {
      return Response.json({ error: 'Only tutors and admins can view the student leaderboard.' }, { status: 403 });
    }

    const service = base44.asServiceRole.entities;
    const [users, attempts, courses] = await Promise.all([
      allRows(service.User),
      allRows(service.TopicCheckAttempt, { status: 'submitted' }),
      allRows(service.Course)
    ]);

    const isAdmin = caller.role === 'admin';
    const allowedCourses = courses.filter(course => isAdmin || (course.assigned_tutors || []).includes(caller.email));
    const allowedIds = new Set(allowedCourses.map(course => course.id));
    const scoring = 'One point per best percentage point per topic; retakes add only improvements.';
    if (allowedIds.size === 0) {
      return Response.json({ scope: 'assigned', courses: [], students: [], scoring });
    }

    const students = new Map(users.filter(isStudent).map(user => [user.id, user]));
    // student id -> (course id -> points from best topic-check percentages)
    const coursePoints = new Map();
    for (const score of bestTopicScores(attempts)) {
      if (!students.has(score.user_id) || !allowedIds.has(score.course_id)) continue;
      if (!coursePoints.has(score.user_id)) coursePoints.set(score.user_id, new Map());
      const perCourse = coursePoints.get(score.user_id);
      perCourse.set(score.course_id, roundPoints((perCourse.get(score.course_id) || 0) + score.points));
    }

    const leaderboardStudents = [...coursePoints]
      .map(([id, perCourse]) => {
        const student = students.get(id);
        return {
          id,
          name: student.full_name || student.email,
          email: student.email,
          course_points: Object.fromEntries(perCourse)
        };
      })
      .sort((a, b) => a.name.localeCompare(b.name));

    return Response.json({
      scope: isAdmin ? 'all' : 'assigned',
      scoring,
      courses: allowedCourses.map(course => ({
        id: course.id,
        title: course.title,
        category: course.category,
        qualification_type: course.qualification_type
      })),
      students: leaderboardStudents
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}