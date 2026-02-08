import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function Leaderboard({ limit = 10 }) {
  const { data: leaderboard = [], isLoading } = useQuery({
    queryKey: ['leaderboard', limit],
    queryFn: async () => {
      const allProgress = await base44.entities.UserProgress.list('-points', limit);
      
      // Get user details for each progress record
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
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-gray-200 rounded-lg" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="flex items-center gap-3 mb-6">
        <Trophy className="w-8 h-8 text-yellow-600" />
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Leaderboard</h2>
          <p className="text-sm text-gray-600">Top performers this month</p>
        </div>
      </div>

      <div className="space-y-3">
        {leaderboard.map((entry, index) => (
          <motion.div
            key={entry.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-4 rounded-xl flex items-center gap-4 transition-all ${
              entry.rank === 1
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow-lg'
                : entry.rank === 2
                ? 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-800 shadow-md'
                : entry.rank === 3
                ? 'bg-gradient-to-r from-orange-400 to-orange-500 text-white shadow-md'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            {/* Rank */}
            <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center">
              {entry.rank === 1 && <Trophy className="w-8 h-8" />}
              {entry.rank === 2 && <Medal className="w-8 h-8" />}
              {entry.rank === 3 && <Award className="w-8 h-8" />}
              {entry.rank > 3 && (
                <span className="text-2xl font-bold text-gray-500">#{entry.rank}</span>
              )}
            </div>

            {/* Avatar */}
            <Avatar className="h-12 w-12">
              <AvatarImage src={entry.user.avatar} />
              <AvatarFallback className={`${
                entry.rank <= 3 ? 'bg-white/20' : 'bg-gray-200'
              }`}>
                {entry.user.full_name?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h3 className={`font-semibold truncate ${
                entry.rank <= 3 ? '' : 'text-gray-800'
              }`}>
                {entry.user.full_name || 'Anonymous'}
              </h3>
              <div className="flex items-center gap-2 text-sm">
                <span className={entry.rank <= 3 ? 'opacity-90' : 'text-gray-600'}>
                  Level {entry.level || 1}
                </span>
                {entry.streak_days > 0 && (
                  <>
                    <span>•</span>
                    <span className={entry.rank <= 3 ? 'opacity-90' : 'text-orange-600'}>
                      🔥 {entry.streak_days} day streak
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Points */}
            <div className="text-right">
              <div className={`text-2xl font-bold ${
                entry.rank <= 3 ? '' : 'text-gray-800'
              }`}>
                {entry.points?.toLocaleString() || 0}
              </div>
              <div className={`text-xs ${
                entry.rank <= 3 ? 'opacity-90' : 'text-gray-500'
              }`}>
                points
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-12">
          <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No learners yet. Be the first to earn points!</p>
        </div>
      )}
    </Card>
  );
}