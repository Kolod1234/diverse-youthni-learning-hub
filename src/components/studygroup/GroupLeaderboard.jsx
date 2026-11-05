import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GroupLeaderboard({ groupId }) {
  const { data: leaderboard = [] } = useQuery({
    queryKey: ['public-group-scoreboard', groupId],
    queryFn: async () => {
      const response = await base44.functions.invoke('publicScoreboardData', { type: 'group', scopeId: groupId });
      return (response.data.entries || []).map((entry, index) => ({ ...entry, rank: index + 1 }));
    },
    enabled: !!groupId
  });

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />;
    return <span className="font-bold text-gray-400">#{rank}</span>;
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <Trophy className="w-5 h-5 text-yellow-600" />
        Group Leaderboard
      </h3>

      <div className="space-y-2">
        {leaderboard.map((member, index) => (
          <motion.div
            key={member.id}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              member.rank <= 3 ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-gray-50'
            }`}
          >
            <div className="w-8 flex justify-center">
              {getRankIcon(member.rank)}
            </div>

            <Avatar className="w-10 h-10">
              <AvatarFallback>{member.username?.charAt(0) || 'L'}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <p className="font-semibold">{member.username}</p>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>🔥 {member.streak} day streak</span>
              </div>
            </div>

            <div className="text-right">
              <p className="font-bold text-blue-600">{member.points}</p>
              <p className="text-xs text-gray-500">XP</p>
            </div>
          </motion.div>
        ))}

        {leaderboard.length === 0 && (
          <p className="text-center text-gray-500 py-8">No members yet</p>
        )}
      </div>
    </Card>
  );
}