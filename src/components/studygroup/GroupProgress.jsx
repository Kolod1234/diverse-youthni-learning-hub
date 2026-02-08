import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Trophy, Target, Zap, TrendingUp, Award } from 'lucide-react';

export default function GroupProgress({ groupId }) {
  const { data: members = [] } = useQuery({
    queryKey: ['group-members', groupId],
    queryFn: () => base44.entities.StudyGroupMember.filter({ group_id: groupId, status: 'active' })
  });

  const { data: challenges = [] } = useQuery({
    queryKey: ['group-challenges', groupId],
    queryFn: () => base44.entities.Challenge.filter({ study_group_id: groupId })
  });

  const { data: participants = [] } = useQuery({
    queryKey: ['group-challenge-participants', groupId],
    queryFn: async () => {
      const challengeIds = challenges.map(c => c.id);
      const all = await base44.entities.ChallengeParticipant.list();
      return all.filter(p => challengeIds.includes(p.challenge_id));
    },
    enabled: challenges.length > 0
  });

  const totalXP = participants.reduce((sum, p) => sum + (p.score || 0), 0);
  const completedChallenges = participants.filter(p => p.status === 'completed').length;
  const avgScore = participants.length > 0 
    ? Math.round(participants.reduce((sum, p) => sum + (p.score || 0), 0) / participants.length)
    : 0;

  const achievements = [];
  if (completedChallenges >= 10) achievements.push({ icon: Trophy, text: '10 Challenges Completed', color: 'text-yellow-600' });
  if (totalXP >= 1000) achievements.push({ icon: Zap, text: '1000+ XP Earned', color: 'text-blue-600' });
  if (members.length >= 10) achievements.push({ icon: Target, text: '10+ Active Members', color: 'text-purple-600' });

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          Group Progress
        </h3>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-3xl font-bold text-blue-600">{totalXP}</p>
            <p className="text-sm text-gray-600">Total XP</p>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-3xl font-bold text-green-600">{completedChallenges}</p>
            <p className="text-sm text-gray-600">Challenges Done</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <p className="text-3xl font-bold text-purple-600">{avgScore}</p>
            <p className="text-sm text-gray-600">Avg Score</p>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Group Activity</span>
              <span className="font-semibold">{Math.min(100, Math.round((completedChallenges / 20) * 100))}%</span>
            </div>
            <Progress value={Math.min(100, (completedChallenges / 20) * 100)} />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-1">
              <span>Member Engagement</span>
              <span className="font-semibold">{Math.min(100, (members.length / 10) * 100)}%</span>
            </div>
            <Progress value={Math.min(100, (members.length / 10) * 100)} className="bg-purple-100" />
          </div>
        </div>
      </Card>

      {achievements.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-yellow-600" />
            Group Achievements
          </h3>
          <div className="space-y-2">
            {achievements.map((achievement, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                <achievement.icon className={`w-6 h-6 ${achievement.color}`} />
                <span className="font-semibold">{achievement.text}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}