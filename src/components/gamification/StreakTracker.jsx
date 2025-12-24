import React from 'react';
import { Card } from '@/components/ui/card';
import { Flame, TrendingUp, Zap, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StreakTracker({ streakDays = 0, lastActivityDate }) {
  const isActiveToday = lastActivityDate === new Date().toISOString().split('T')[0];
  
  const getStreakMessage = () => {
    if (streakDays === 0) return "Start your streak today!";
    if (streakDays < 7) return "Keep it going!";
    if (streakDays < 30) return "You're on fire! 🔥";
    if (streakDays < 100) return "Incredible dedication!";
    return "Legendary streak! 🏆";
  };

  const getStreakColor = () => {
    if (streakDays === 0) return "text-gray-400";
    if (streakDays < 7) return "text-orange-500";
    if (streakDays < 30) return "text-orange-600";
    return "text-red-500";
  };

  const milestones = [7, 14, 30, 60, 100, 365];
  const nextMilestone = milestones.find(m => m > streakDays) || 365;

  return (
    <Card className="p-6 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Learning Streak</h3>
        <Flame className={`w-6 h-6 ${getStreakColor()}`} />
      </div>

      <div className="text-center mb-4">
        <motion.div
          key={streakDays}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-baseline gap-2"
        >
          <span className={`text-5xl font-bold ${getStreakColor()}`}>
            {streakDays}
          </span>
          <span className="text-lg text-gray-600">
            {streakDays === 1 ? 'day' : 'days'}
          </span>
        </motion.div>
        <p className="text-sm text-gray-600 mt-2">{getStreakMessage()}</p>
      </div>

      {!isActiveToday && streakDays > 0 && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-800 text-sm">
            <Zap className="w-4 h-4" />
            <span>Complete a lesson today to maintain your streak!</span>
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>Next milestone</span>
          <span className="font-semibold">{nextMilestone} days</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${(streakDays / nextMilestone) * 100}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
          />
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2">
        {[7, 30, 100].map(milestone => (
          <div
            key={milestone}
            className={`p-2 rounded-lg text-center transition-all ${
              streakDays >= milestone
                ? 'bg-orange-500 text-white'
                : 'bg-white border border-gray-200 text-gray-400'
            }`}
          >
            <div className="text-xs font-semibold">{milestone}</div>
            {streakDays >= milestone && <Trophy className="w-3 h-3 mx-auto mt-1" />}
          </div>
        ))}
      </div>
    </Card>
  );
}