import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Flame, Trophy, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { format, subDays } from 'date-fns';

export default function StreakTracker() {
  const queryClient = useQueryClient();

  const { data: streaks = [] } = useQuery({
    queryKey: ['study-streak'],
    queryFn: () => base44.entities.StudyStreak.list(),
  });

  const streak = streaks[0] || { current_streak: 0, longest_streak: 0, streak_dates: [] };

  // Generate last 30 days
  const days = Array.from({ length: 30 }, (_, i) => {
    const date = subDays(new Date(), 29 - i);
    const dateStr = format(date, 'yyyy-MM-dd');
    const hasActivity = streak.streak_dates?.includes(dateStr);
    return { date, dateStr, hasActivity };
  });

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-6 border border-orange-100">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
            <Flame className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-3xl font-bold text-orange-600">{streak.current_streak}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
        </div>

        <div className="text-right">
          <div className="flex items-center gap-2 text-yellow-600">
            <Trophy className="w-5 h-5" />
            <span className="font-semibold">{streak.longest_streak} days</span>
          </div>
          <div className="text-xs text-gray-600">Personal Best</div>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-1">
        {days.map((day, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: i * 0.01 }}
            className={`aspect-square rounded ${
              day.hasActivity
                ? 'bg-orange-500'
                : 'bg-gray-200'
            }`}
            title={format(day.date, 'MMM d')}
          />
        ))}
      </div>

      <div className="mt-4 text-center text-sm text-gray-600">
        <Calendar className="w-4 h-4 inline mr-1" />
        Keep your streak going! Study daily to earn bonuses.
      </div>
    </div>
  );
}