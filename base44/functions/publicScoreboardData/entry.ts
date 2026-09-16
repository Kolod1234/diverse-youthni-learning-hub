import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

export default async function(req) {
  try {
    const base44 = createClientFromRequest(req);
    const currentUser = await base44.auth.me();
    if (!currentUser) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { type, scopeId, limit = 100 } = await req.json();
    const service = base44.asServiceRole.entities;
    const users = await service.User.list('id', 1000);
    const usernames = new Map(users.map((user) => [user.email, user.username]));
    const safeName = (email, index) => usernames.get(email) || `Learner-${String(index + 1).padStart(2, '0')}`;
    let entries = [];

    if (type === 'points') {
      const progress = await service.UserProgress.list('-points', Math.min(limit, 100));
      entries = progress.map((item, index) => ({ id: item.id, username: safeName(item.created_by, index), points: item.points || 0, level: item.level || 1, streak: item.streak_days || 0 }));
    } else if (type === 'course' && scopeId) {
      const enrollments = await service.Enrollment.filter({ course_id: scopeId }, '-progress_percent', 100);
      const progress = await service.UserProgress.list('-points', 500);
      entries = enrollments.map((item, index) => {
        const stats = progress.find((row) => row.created_by === item.created_by);
        return { id: item.id, username: safeName(item.created_by, index), progress: item.progress_percent || 0, points: stats?.points || 0, level: stats?.level || 1, streak: stats?.streak_days || 0 };
      });
    } else if (type === 'group' && scopeId) {
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