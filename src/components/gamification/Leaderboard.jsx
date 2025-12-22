import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Leaderboard({ courseId = null, limit = 10 }) {
  const { data: userProgress = [] } = useQuery({
    queryKey: ['leaderboard', courseId],
    queryFn: () => base44.entities.UserProgress.list('-points', limit),
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => base44.entities.User.list('-created_date', 500),
  });

  const leaderboardData = userProgress.map((progress, index) => {
    const user = users.find(u => u.email === progress.created_by);
    return {
      ...progress,
      rank: index + 1,
      name: user?.full_name || 'Unknown',
      avatar: user?.avatar
    };
  });

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Award className="w-5 h-5 text-amber-600" />;
    return <span className="text-sm font-semibold text-gray-500">#{rank}</span>;
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-50 to-orange-50 border-yellow-200';
    if (rank === 2) return 'from-gray-50 to-slate-50 border-gray-200';
    if (rank === 3) return 'from-amber-50 to-orange-50 border-amber-200';
    return 'from-white to-gray-50 border-gray-200';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-gray-900">Leaderboard</h3>
        <Badge variant="secondary" className="ml-auto">Top {limit}</Badge>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="space-y-2">
          {leaderboardData.map((entry, index) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <div className={`p-4 rounded-lg border bg-gradient-to-r ${getRankColor(entry.rank)} transition-all hover:shadow-md`}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 flex items-center justify-center">
                    {getRankIcon(entry.rank)}
                  </div>
                  
                  <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    {entry.avatar ? (
                      <img src={entry.avatar} alt={entry.name} className="w-10 h-10 rounded-full object-cover" />
                    ) : (
                      <span className="text-indigo-600 font-semibold">{entry.name?.charAt(0)}</span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">{entry.name}</p>
                    <p className="text-xs text-gray-500">Level {entry.level || 1}</p>
                  </div>

                  <div className="text-right">
                    <p className="text-lg font-bold text-indigo-600">{entry.points || 0}</p>
                    <p className="text-xs text-gray-500">points</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </ScrollArea>
    </Card>
  );
}