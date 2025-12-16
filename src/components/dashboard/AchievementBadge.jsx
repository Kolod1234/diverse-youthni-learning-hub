import React from 'react';
import { Card } from '@/components/ui/card';
import { Trophy, Award, Star, Zap, Target, Flame, Crown, Medal } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';

const iconMap = {
  trophy: Trophy,
  award: Award,
  star: Star,
  zap: Zap,
  target: Target,
  flame: Flame,
  crown: Crown,
  medal: Medal,
};

const colorMap = {
  trophy: 'from-amber-400 to-yellow-500',
  award: 'from-purple-400 to-violet-500',
  star: 'from-pink-400 to-rose-500',
  zap: 'from-blue-400 to-cyan-500',
  target: 'from-emerald-400 to-teal-500',
  flame: 'from-orange-400 to-red-500',
  crown: 'from-amber-500 to-orange-600',
  medal: 'from-indigo-400 to-purple-500',
};

export default function AchievementBadge({ achievement, index = 0 }) {
  const Icon = iconMap[achievement.icon] || Trophy;
  const gradient = colorMap[achievement.icon] || colorMap.trophy;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      whileHover={{ scale: 1.05, y: -5 }}
    >
      <Card className="p-4 text-center border-0 shadow-sm hover:shadow-lg transition-all duration-300 bg-white">
        <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3 shadow-lg`}>
          <Icon className="w-8 h-8 text-white" />
        </div>
        <h4 className="font-semibold text-gray-900 text-sm mb-1">{achievement.name}</h4>
        <p className="text-xs text-gray-500 mb-2 line-clamp-2">{achievement.description}</p>
        {achievement.earned_date && (
          <p className="text-xs text-indigo-600 font-medium">
            {format(new Date(achievement.earned_date), 'MMM d, yyyy')}
          </p>
        )}
      </Card>
    </motion.div>
  );
}