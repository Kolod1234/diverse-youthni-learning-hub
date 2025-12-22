import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Zap, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PointsDisplay({ points, level, compact = false }) {
  const pointsForNextLevel = level * 100;
  const progressToNextLevel = ((points % 100) / pointsForNextLevel) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
          <Zap className="w-3 h-3 mr-1" />
          {points} pts
        </Badge>
        <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
          <Trophy className="w-3 h-3 mr-1" />
          Level {level}
        </Badge>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
            <Trophy className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Level {level}</p>
            <p className="text-2xl font-bold text-gray-900">{points} pts</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-500">Next Level</p>
          <p className="text-sm font-semibold text-indigo-600">{pointsForNextLevel - (points % 100)} pts</p>
        </div>
      </div>
      
      <div className="w-full bg-white rounded-full h-2">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressToNextLevel}%` }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-r from-indigo-500 to-purple-500 h-2 rounded-full"
        />
      </div>
      <p className="text-xs text-gray-500 mt-1 text-center">
        {progressToNextLevel.toFixed(0)}% to Level {level + 1}
      </p>
    </div>
  );
}