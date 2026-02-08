import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Flame, Trophy, Zap, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import StyledIcon from '@/components/ui/StyledIcon';

export default function QuickStatsCard({ user }) {
  const { data: userProgress } = useQuery({
    queryKey: ['user-progress', user?.email],
    queryFn: () => base44.entities.UserProgress.filter({ created_by: user.email }).then(r => r[0]),
    enabled: !!user?.email
  });

  const { data: streak } = useQuery({
    queryKey: ['study-streak', user?.email],
    queryFn: () => base44.entities.StudyStreak.filter({ created_by: user.email }).then(r => r[0]),
    enabled: !!user?.email
  });

  const { data: enrollments = [] } = useQuery({
    queryKey: ['user-enrollments-stats', user?.email],
    queryFn: () => base44.entities.Enrollment.filter({ created_by: user.email }),
    enabled: !!user?.email
  });

  const completedCourses = enrollments.filter(e => e.is_completed).length;
  const inProgressCourses = enrollments.filter(e => !e.is_completed).length;
  const totalXP = userProgress?.total_xp || 0;
  const streakDays = streak?.current_streak || 0;
  const longestStreak = streak?.longest_streak || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="grid grid-cols-2 sm:grid-cols-4 gap-4"
    >
      {/* Total XP */}
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-white border border-border rounded-xl p-5 text-center hover:shadow-lg transition-all"
      >
        <div className="flex justify-center mb-3">
          <StyledIcon Icon={Zap} colorFrom="from-amber-500" colorTo="to-orange-600" size="md" />
        </div>
        <div className="text-2xl font-bold text-foreground">{totalXP.toLocaleString()}</div>
        <div className="text-xs text-muted-foreground font-semibold">Total XP</div>
      </motion.div>

      {/* Current Streak */}
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200 rounded-xl p-5 text-center hover:shadow-lg transition-all"
      >
        <div className="flex justify-center mb-2">
          <Flame className="w-6 h-6 text-red-600" />
        </div>
        <div className="text-2xl font-bold text-red-700">{streakDays}</div>
        <div className="text-xs text-red-600 font-semibold">Day Streak 🔥</div>
      </motion.div>

      {/* Courses Completed */}
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-5 text-center hover:shadow-lg transition-all"
      >
        <div className="flex justify-center mb-2">
          <Award className="w-6 h-6 text-green-600" />
        </div>
        <div className="text-2xl font-bold text-green-700">{completedCourses}</div>
        <div className="text-xs text-green-600 font-semibold">Completed</div>
      </motion.div>

      {/* In Progress */}
      <motion.div
        whileHover={{ y: -4 }}
        className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-5 text-center hover:shadow-lg transition-all"
      >
        <div className="flex justify-center mb-2">
          <Trophy className="w-6 h-6 text-blue-600" />
        </div>
        <div className="text-2xl font-bold text-blue-700">{inProgressCourses}</div>
        <div className="text-xs text-blue-600 font-semibold">In Progress</div>
      </motion.div>
    </motion.div>
  );
}