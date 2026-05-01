import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

function SimpleAvatar({ name, avatar, highlight }) {
  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name || 'User'}
        className="h-12 w-12 rounded-full object-cover"
      />
    );
  }

  return (
    <div className={`flex h-12 w-12 items-center justify-center rounded-full text-sm font-semibold ${highlight ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'}`}>
      {(name || 'U').charAt(0)}
    </div>
  );
}

export default function Leaderboard({ limit = 10 }) {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      const allProgress = await base44.entities.UserProgress.list('-points', limit);
      const users = await base44.entities.User.list('id', 1000);
      const userMap = users.reduce((acc, user) => {
        acc[user.email] = user;
        return acc;
      }, {});

      return allProgress.map((progress, index) => ({
        ...progress,
        rank: index + 1,
        user: userMap[progress.created_by] || { full_name: 'Anonymous', email: progress.created_by }
      }));
    }
  });

  if (isLoading) {
    return (
      <div className="rounded-xl border bg-card p-6 text-card-foreground shadow">
        <div className="animate-pulse space-y-4">
          {[0, 1, 2, 3, 4].map((index) => (
            <div key={index} className="h-16 rounded-lg bg-gray-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-gradient-to-br from-yellow-50 to-orange-50 p-6 text-card-foreground shadow">
      <div className="mb-6 flex items-center gap-3">
        <Trophy className="h-8 w-8 text-yellow-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
          <p className="text-sm text-gray-600">Top performers this month</p>
        </div>
      </div>

      <div className="space-y-3">
        {leaderboard.map((entry) => {
          const highlight = entry.rank <= 3;
          const rowClass = entry.rank === 1
            ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg'
            : entry.rank === 2
            ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 shadow-md'
            : entry.rank === 3
            ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md'
            : 'bg-white text-gray-800';

          return (
            <div key={entry.id || `${entry.created_by}-${entry.rank}`} className={`flex items-center gap-4 rounded-xl p-4 transition-all ${rowClass}`}>
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center">
                {entry.rank === 1 && <Trophy className="h-8 w-8" />}
                {entry.rank === 2 && <Medal className="h-8 w-8" />}
                {entry.rank === 3 && <Award className="h-8 w-8" />}
                {entry.rank > 3 && <span className="text-2xl font-bold text-gray-500">#{entry.rank}</span>}
              </div>

              <SimpleAvatar
                name={entry.user.full_name || 'Anonymous'}
                avatar={entry.user.avatar}
                highlight={highlight}
              />

              <div className="min-w-0 flex-1">
                <h3 className="truncate font-semibold">{entry.user.full_name || 'Anonymous'}</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className={highlight ? 'opacity-90' : 'text-gray-600'}>
                    Level {entry.level || 1}
                  </span>
                  {entry.streak_days > 0 && (
                    <>
                      <span>•</span>
                      <span className={highlight ? 'opacity-90' : 'text-orange-600'}>
                        🔥 {entry.streak_days} day streak
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="text-right">
                <div className="text-2xl font-bold">{entry.points?.toLocaleString() || 0}</div>
                <div className={`text-xs ${highlight ? 'opacity-90' : 'text-gray-500'}`}>points</div>
              </div>
            </div>
          );
        })}
      </div>

      {leaderboard.length === 0 && (
        <div className="py-12 text-center">
          <TrendingUp className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <p className="text-gray-500">No learners yet. Be the first to earn points!</p>
        </div>
      )}
    </div>
  );
}