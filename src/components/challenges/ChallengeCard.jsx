import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, Users, Zap, Code, Book, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function ChallengeCard({ challenge }) {
  const navigate = useNavigate();

  const typeIcons = {
    quiz: Zap,
    coding: Code,
    reading: Book,
    speed: Target,
    study_time: Clock
  };

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800',
    medium: 'bg-yellow-100 text-yellow-800',
    hard: 'bg-orange-100 text-orange-800',
    expert: 'bg-red-100 text-red-800'
  };

  const Icon = typeIcons[challenge.type] || Trophy;

  const daysLeft = challenge.end_date 
    ? Math.ceil((new Date(challenge.end_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">{challenge.title}</h3>
            <p className="text-sm text-gray-600">by {challenge.creator_name}</p>
          </div>
        </div>
        <Badge className={difficultyColors[challenge.difficulty]}>
          {challenge.difficulty}
        </Badge>
      </div>

      <p className="text-gray-700 mb-4 line-clamp-2">{challenge.description}</p>

      <div className="flex flex-wrap gap-3 mb-4 text-sm text-gray-600">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{challenge.time_limit_minutes} min</span>
        </div>
        <div className="flex items-center gap-1">
          <Trophy className="w-4 h-4 text-yellow-600" />
          <span>{challenge.points_reward} pts</span>
        </div>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" />
          <span>{challenge.participant_count} joined</span>
        </div>
        {daysLeft !== null && daysLeft > 0 && (
          <div className="flex items-center gap-1 text-orange-600">
            <Clock className="w-4 h-4" />
            <span>{daysLeft} days left</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          onClick={() => navigate(`${createPageUrl('ChallengePlayer')}?id=${challenge.id}`)}
          className="flex-1"
        >
          Start Challenge
        </Button>
        <Button
          variant="outline"
          onClick={() => navigate(`${createPageUrl('ChallengeLeaderboard')}?id=${challenge.id}`)}
        >
          Leaderboard
        </Button>
      </div>
    </Card>
  );
}