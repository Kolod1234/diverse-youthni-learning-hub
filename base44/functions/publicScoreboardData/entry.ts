import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

import { allRows, bestTopicScores, qualificationTotals, publicIdentity, isStudent, rankEntries, roundPoints } from '../../shared/learningProgress.ts';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();
    if (!currentUser) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { type, scopeId, qualification = 'gcse', limit = 100 } = await req.json();
    const service = base44.asServiceRole.entities;
    const users = await allRows(service.User);
    const identities = new Map(await Promise.all(users.map(async user => [user.id, await publicIdentity(user)])));
    const usernames = new Map(users.map(user => [user.email, identities.get(user.id).username]));
    const safeName = (email, index) => usernames.get(email) || `Learner-${String(index + 1).padStart(2, '0')}`;
    const cap = Number.isFinite(limit) ? Math.max(1, Math.min(100, Math.floor(limit))) : 100;
    if (type === 'points' || type === 'course') {
      if (type === 'points' && !['gcse','alevel'].includes(qualification)) return Response.json({ error: 'Choose GCSE or A-level.' }, { status: 400 });
      if (type === 'course' && typeof scopeId !== 'string') return Response.json({ error: 'A course is required.' }, { status: 400 });
      const [attempts, courses] = await Promise.all([
        allRows(service.TopicCheckAttempt, { status: 'submitted', ...(type === 'course' ? { course_id: scopeId } : {}) }),
        allRows(service.Course)
      ]);
      const scores = bestTopicScores(attempts);
      const courseMap = new Map(courses.map(course => [course.id, course]));
      const students = users.filter(isStudent);
      const studentIds = new Set(students.map(user => user.id));
      const totals = qualificationTotals(scores, courses, currentUser.id);
      const byUser = new Map();
      for (const score of scores) {
        if (!studentIds.has(score.user_id) || !courseMap.has(score.course_id)) continue;
        if (type === 'points' && courseMap.get(score.course_id).qualification_type !== qualification) continue;
        byUser.set(score.user_id, (byUser.get(score.user_id) || 0) + score.points);
      }
      let ranked = [...byUser].map(([id, points]) => ({ ...identities.get(id), points: roundPoints(points) }));
      if (type === 'course') {
        const [enrollments, activity] = await Promise.all([
          allRows(service.Enrollment, { course_id: scopeId }), allRows(service.UserProgress)
        ]);
        const studentByEmail = new Map(students.map(user => [user.email, user]));
        const seen = new Set();
        ranked = enrollments.flatMap(enrollment => {
          const user = students.find(student => student.id === enrollment.created_by_id) || studentByEmail.get(enrollment.created_by);
          if (!user || seen.has(user.id)) return [];
          seen.add(user.id);
          const stats = activity.find(row => row.created_by === user.email);
          return [{ ...identities.get(user.id), points: roundPoints(byUser.get(user.id) || 0),
            progress: enrollment.progress_percent || 0, streak: stats?.streak_days || 0 }];
        });
      }
      const entries = rankEntries(ranked);
      return Response.json({ entries: entries.slice(0, cap), qualification: type === 'points' ? qualification : courseMap.get(scopeId)?.qualification_type,
        totals, current_user: entries.find(entry => entry.id === identities.get(currentUser.id)?.id) || null,
        scoring: 'Best topic-check percentage per topic; improvements only; all time.' });
    }
    let entries = [];

    if (type === 'group' && scopeId) {
      const members = await service.StudyGroupMember.filter({ group_id: scopeId, status: 'active' }, 'created_date', 500);
      const streaks = await service.StudyStreak.list('-total_xp', 500);
      entries = members.map((item, index) => {
        const stats = streaks.find((row) => row.created_by === item.member_email);
        return { id: item.id, username: safeName(item.member_email, index), points: stats?.total_xp || 0, streak: stats?.current_streak || 0 };
      }).sort((a, b) => b.points - a.points);
    } else if (type === 'challenge' && scopeId) {
      const participants = await service.ChallengeParticipant.filter({ challenge_id: scopeId, status: 'completed' }, '-score', 100);
      entries = participants.map((item, index) => ({ id: item.id, username: safeName(item.created_by, index), points: item.score || 0, time: item.time_taken_seconds || 0 }));
    } else {
      return Response.json({ error: 'Invalid scoreboard request.' }, { status: 400 });
    }
    return Response.json({ entries });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
