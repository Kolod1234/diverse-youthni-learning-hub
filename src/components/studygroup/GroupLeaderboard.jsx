import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Zap, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GroupLeaderboard({ groupId }) {
  const { data: members = [] } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => base44.entities.StudyGroupMember.filter({ group_id: groupId, status: 'active' })
  });

  const { data: leaderboard = [] } = useQuery({
    queryKey: ['group-leaderboard', groupId],
    queryFn: async () => {
      // Get XP for each member
      const memberEmails = members.map(m => m.member_email);
      const streaks = await base44.entities.StudyStreak.list();
      
      const leaderboardData = members.map(member => {
        const streak = streaks.find(s => s.created_by === member.member_email);
        return {
          ...member,
          xp: streak?.total_xp || 0,
          streak: streak?.current_streak || 0
        };
      });

      return leaderboardData.sort((a, b) => b.xp - a.xp).map((m, i) => ({ ...m, rank: i + 1 }));
    },
    enabled: members.length > 0
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
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-3 p-3 rounded-lg ${
              member.rank <= 3 ? 'bg-gradient-to-r from-blue-50 to-purple-50' : 'bg-gray-50'
            }`}
          >
            <div className="w-8 flex justify-center">
              {getRankIcon(member.rank)}
            </div>

            <Avatar className="w-10 h-10">
              <AvatarImage src={member.member_avatar} />
              <AvatarFallback>{member.member_name?.charAt(0)}</AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <p className="font-semibold">{member.member_name}</p>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>🔥 {member.streak} day streak</span>
              </div>
            </div>

            <div className="text-right">
              <p className="font-bold text-blue-600">{member.xp}</p>
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