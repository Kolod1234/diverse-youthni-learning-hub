import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let action, value, metadata;
    try {
      const body = await req.json();
      action = body.action;
      value = body.value;
      metadata = body.metadata;
    } catch (jsonError) {
      return Response.json({ 
        error: 'Invalid request body',
        details: jsonError.message 
      }, { status: 400 });
    }

    // Get or create user progress
    let progressRecords = await base44.entities.UserProgress.filter({ created_by: user.email });
    let userProgress = progressRecords[0];

    if (!userProgress) {
      userProgress = await base44.entities.UserProgress.create({
        points: 0,
        level: 1,
        streak_days: 0,
        total_lessons_completed: 0,
        total_quizzes_completed: 0,
        badges_earned: []
      });
    }

    let pointsEarned = 0;
    let newBadges = [];

    // Calculate points based on action. Client-supplied `value` is never
    // trusted as-is: quiz percentages and interactive points are clamped to a
    // safe range, and the daily streak can only be awarded once per day.
    const today = new Date().toISOString().split('T')[0];
    switch (action) {
      case 'complete_lesson':
        pointsEarned = 50;
        userProgress.total_lessons_completed = (userProgress.total_lessons_completed || 0) + 1;
        break;
      case 'complete_quiz': {
        // value is a percentage (0–100) from the client; clamp to a safe range.
        const percentage = Math.min(Math.max(Number(value) || 0, 0), 100);
        pointsEarned = Math.round(percentage * 1.5); // Max 150 points for 100%
        userProgress.total_quizzes_completed = (userProgress.total_quizzes_completed || 0) + 1;

        if (percentage === 100) {
          newBadges.push('perfect_quiz');
        }
        break;
      }
      case 'complete_course':
        pointsEarned = 500;
        newBadges.push('course_complete');
        break;
      case 'daily_streak': {
        // Idempotent per day: only award when last_activity_date isn't today,
        // so repeated calls cannot inflate the streak or points.
        if (userProgress.last_activity_date === today) {
          pointsEarned = 0;
        } else {
          pointsEarned = 25;
          userProgress.streak_days = (userProgress.streak_days || 0) + 1;

          if (userProgress.streak_days >= 7) newBadges.push('week_streak');
          if (userProgress.streak_days >= 30) newBadges.push('month_streak');
        }
        break;
      }
      case 'interactive_complete': {
        // value is client-supplied points; clamp to a safe maximum to prevent
        // unlimited self-award.
        const raw = typeof value === 'number' ? value : Number(value);
        pointsEarned = Math.min(Math.max(raw || 20, 0), 100);
        break;
      }
      default:
        pointsEarned = 0;
    }

    // Update points
    const newPoints = (userProgress.points || 0) + pointsEarned;
    
    // Calculate new level (every 1000 points = 1 level)
    const newLevel = Math.floor(newPoints / 1000) + 1;
    const leveledUp = newLevel > (userProgress.level || 1);

    // Check for milestone badges
    if (userProgress.total_lessons_completed >= 10 && !userProgress.badges_earned?.includes('lessons_10')) {
      newBadges.push('lessons_10');
    }
    if (userProgress.total_lessons_completed >= 50 && !userProgress.badges_earned?.includes('lessons_50')) {
      newBadges.push('lessons_50');
    }
    if (userProgress.total_quizzes_completed >= 20 && !userProgress.badges_earned?.includes('quizzes_20')) {
      newBadges.push('quizzes_20');
    }
    if (newPoints >= 5000 && !userProgress.badges_earned?.includes('points_5k')) {
      newBadges.push('points_5k');
    }

    // Update user progress
    const updatedBadges = [...new Set([...(userProgress.badges_earned || []), ...newBadges])];
    
    await base44.entities.UserProgress.update(userProgress.id, {
      points: newPoints,
      level: newLevel,
      streak_days: userProgress.streak_days,
      total_lessons_completed: userProgress.total_lessons_completed,
      total_quizzes_completed: userProgress.total_quizzes_completed,
      badges_earned: updatedBadges,
      last_activity_date: new Date().toISOString().split('T')[0]
    });

    // Create achievement records for new badges
    for (const badge of newBadges) {
      await base44.entities.Achievement.create({
        type: 'badge',
        name: badge,
        description: getBadgeDescription(badge),
        icon: getBadgeIcon(badge),
        earned_date: new Date().toISOString().split('T')[0]
      });
    }

    return Response.json({
      success: true,
      pointsEarned,
      totalPoints: newPoints,
      level: newLevel,
      leveledUp,
      newBadges,
      streakDays: userProgress.streak_days
    });

  } catch (error) {
    console.error('Error awarding points:', error);
    return Response.json({ 
      error: 'Failed to award points',
      details: error.message 
    }, { status: 500 });
  }
});

function getBadgeDescription(badge) {
  const descriptions = {
    'perfect_quiz': 'Scored 100% on a quiz',
    'course_complete': 'Completed an entire course',
    'week_streak': '7-day learning streak',
    'month_streak': '30-day learning streak',
    'lessons_10': 'Completed 10 lessons',
    'lessons_50': 'Completed 50 lessons',
    'quizzes_20': 'Completed 20 quizzes',
    'points_5k': 'Earned 5,000 points'
  };
  return descriptions[badge] || 'Achievement unlocked';
}

function getBadgeIcon(badge) {
  const icons = {
    'perfect_quiz': '🏆',
    'course_complete': '🎓',
    'week_streak': '🔥',
    'month_streak': '⭐',
    'lessons_10': '📚',
    'lessons_50': '📖',
    'quizzes_20': '✅',
    'points_5k': '💎'
  };
  return icons[badge] || '🎯';
}