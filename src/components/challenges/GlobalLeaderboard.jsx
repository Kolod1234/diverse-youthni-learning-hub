import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GlobalLeaderboard({ period = 'all' }) {
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['global-leaderboard', period],
    queryFn: async () => {
      // Get all streaks with XP
      const streaks = await base44.entities.StudyStreak.list('-total_xp', 100);
      
      // Get user details
      const users = await base44.entities.User.list();
      
      // Merge data
      return streaks.map((streak, index) => {
        const user = users.find(u => u.email === streak.created_by);
        return {
          rank: index + 1,
          name: user?.full_name || 'Anonymous',
          email: streak.created_by,
          avatar: user?.avatar,
          xp: streak.total_xp || 0,
          streak: streak.current_streak || 0,
          level: Math.floor((streak.total_xp || 0) / 100) + 1
        };
      }).filter(user => user.xp > 0);
    }
  });

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-orange-600" />;
    return <Award className="w-5 h-5 text-gray-400" />;
  };

  const getRankBg = (rank) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500';
    if (rank === 3) return 'bg-gradient-to-r from-orange-400 to-orange-600';
    return 'bg-gray-100';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Trophy className="w-7 h-7 text-yellow-600" />
          Global Leaderboard
        </h2>
        <Badge variant="outline" className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          Top 100
        </Badge>
      </div>

      <div className="space-y-2">
        {leaderboard.map((user, index) => (
          <motion.div
            key={user.email}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-4 p-4 rounded-lg ${
              user.rank <= 3 ? getRankBg(user.rank) : 'bg-white border'
            } ${user.rank <= 3 ? 'text-white' : ''}`}
          >
            <div className="flex items-center justify-center w-12">
              {getRankIcon(user.rank)}
            </div>

            <Avatar className="w-12 h-12">
              <AvatarImage src={user.avatar} />
              <AvatarFallback className="bg-blue-600 text-white">
                {user.name.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <p className={`font-semibold ${user.rank <= 3 ? 'text-white' : ''}`}>
                {user.name}
              </p>
              <div className="flex items-center gap-3 text-sm">
                <span className={user.rank <= 3 ? 'text-white/90' : 'text-gray-600'}>
                  Level {user.level}
                </span>
                <span className={user.rank <= 3 ? 'text-white/90' : 'text-gray-600'}>
                  🔥 {user.streak} day streak
                </span>
              </div>
            </div>

            <div className="text-right">
              <p className={`text-2xl font-bold ${user.rank <= 3 ? 'text-white' : 'text-blue-600'}`}>
                {user.xp.toLocaleString()}
              </p>
              <p className={`text-xs ${user.rank <= 3 ? 'text-white/80' : 'text-gray-500'}`}>
                XP
              </p>
            </div>
          </motion.div>
        ))}

        {leaderboard.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p>No data yet. Be the first to earn XP!</p>
          </div>
        )}
      </div>
    </Card>
  );
}