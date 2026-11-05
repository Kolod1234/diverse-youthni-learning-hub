import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Medal, Clock, Target, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ChallengeLeaderboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);
  const challengeId = params.get('id');

  const { data: challenge } = useQuery({
    queryKey: ['challenge', challengeId],
    queryFn: async () => {
      const challenges = await base44.entities.Challenge.filter({ id: challengeId });
      return challenges[0];
    },
    enabled: !!challengeId
  });

  const { data: participants = [] } = useQuery({
    queryKey: ['challenge-participants', challengeId],
    queryFn: async () => {
      const response = await base44.functions.invoke('publicScoreboardData', { type: 'challenge', scopeId: challengeId });
      return (response.data.entries || []).map((entry, index) => ({ ...entry, rank: index + 1 }));
    },
    enabled: !!challengeId
  });

  const getRankColor = (rank) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-600';
    if (rank === 2) return 'from-gray-300 to-gray-500';
    if (rank === 3) return 'from-orange-400 to-orange-600';
    return 'from-blue-400 to-blue-600';
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6" />;
    if (rank === 2 || rank === 3) return <Medal className="w-6 h-6" />;
    return <Target className="w-5 h-5" />;
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(createPageUrl('Challenges'))}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Challenges
        </Button>

        <Card className="p-6 mb-6">
          <h1 className="text-3xl font-bold mb-2">{challenge?.title}</h1>
          <p className="text-muted-foreground mb-4">{challenge?.description}</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>👥 {participants.length} participants</span>
            <span>🏆 {challenge?.points_reward} XP reward</span>
          </div>
        </Card>

        {/* Top 3 Podium */}
        {participants.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[participants[1], participants[0], participants[2]].map((p, i) => (
              <motion.div
                key={p?.id}



                className={`text-center ${i === 1 ? 'order-first' : ''}`}
              >
                <div className={`bg-[#0b2f5c] text-white rounded-lg p-6 mb-2`}>
                  <div className="mb-2">{getRankIcon(p?.rank)}</div>
                  <Avatar className="w-16 h-16 mx-auto mb-2 border-4 border-white">
                    <AvatarFallback>{p?.username?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <p className="font-bold">{p?.username}</p>
                  <p className="text-2xl font-bold mt-2">{p?.points}</p>
                  <p className="text-xs opacity-80">points</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Full Leaderboard */}
        <Card className="p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-600" />
            Full Rankings
          </h2>

          <div className="space-y-2">
            {participants.map((participant, index) => (
              <motion.div
                key={participant.id}



                className={`flex items-center gap-4 p-4 rounded-lg ${
                  participant.rank <= 3 ? 'bg-gradient-to-r ' + getRankColor(participant.rank) + ' text-white' : 'bg-muted'
                }`}
              >
                <div className="font-bold text-2xl w-8 text-center">
                  #{participant.rank}
                </div>

                <Avatar className="w-10 h-10">
                  <AvatarFallback>{participant.username?.charAt(0) || 'L'}</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <p className="font-semibold">{participant.username}</p>
                  <div className="flex items-center gap-3 text-xs opacity-80">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {Math.floor(participant.time / 60)}:{String(participant.time % 60).padStart(2, '0')}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold">{participant.points}</p>
                  <p className="text-xs opacity-80">points</p>
                </div>
              </motion.div>
            ))}
          </div>

          {participants.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <Trophy className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>No one has completed this challenge yet. Be the first!</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}